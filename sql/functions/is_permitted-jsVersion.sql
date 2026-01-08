--Create or replace is_permitted no p_table_name.  Verson 15:13 Jan 1 2026
CREATE OR REPLACE FUNCTION public.is_permitted(
    p_function_name TEXT,
    p_user_id       UUID,
    p_row_id        UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
   
    rec                     RECORD;
    v_user_auth_id UUID := auth.uid(); -- this depends on the user being logged-in/  added 16:26 Jan 1
    v_user_appro_id         UUID;
    v_function_tables       TEXT[];   -- tables this function may access
    v_valid_generic_scopes  UUID[] := '{}';  -- explicitly empty array

    -- 🔑 Hardcoded generic scope UUIDs (do not change unless appro is recreated)
    APPROS_SCOPE_UUID       CONSTANT UUID := 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74';  -- "Appros"
    ASSIGNMENTS_SCOPE_UUID  CONSTANT UUID := 'd2545d76-5cac-4f6b-af13-d6529e4c4294'; -- "Assignments"

    GET_AUTHENTICATED_USER_UUID  CONSTANT UUID :='bfd6c2e8-ec41-4edd-a0e3-54fb513851ac' ;--"(]getAuthenticatedUser[)"  a pseudo category --new 15:10 Jan 1 2026

    NOTES_SCOPE_UUID    CONSTANT UUID := 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'; -- "Notes"

    RELATIONS_SCOPE_UUID    CONSTANT UUID := 'ec8b47f2-5a56-4bad-86a4-4cc7f5810dd7'; -- "Relations"
    
    SURVEYS_SCOPE_UUID      CONSTANT UUID := '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf';  -- "Surveys"
    TASKS_SCOPE_UUID        CONSTANT UUID := '90b915ce-d43e-4a1e-938c-494987f18b1c';  -- "Tasks"



    v_is_permitted          BOOLEAN := FALSE;
    v_reason                TEXT := 'no matching valid permission found';
    v_success_reason        TEXT := NULL;
    DEBUG_MODE              CONSTANT BOOLEAN := TRUE;  -- set to FALSE in production

BEGIN
    ----------------------------------------------------------------------
    -- STEP 1: Convert auth.user().id → appro.id
    ----------------------------------------------------------------------
    SELECT id INTO v_user_appro_id
    FROM app_profiles
--    WHERE auth_user_id = p_user_id;
    WHERE auth_user_id = v_user_auth_id;  -- changed from p_user_id 16:20 Jan 1 

    IF v_user_appro_id IS NULL THEN
        v_reason := 'no approfile found for auth user';
        -- Always log critical failures
        INSERT INTO app_event_log (event_name, description)
        VALUES ('PERMISSION_DENIED',
            jsonb_build_object(
                'function', p_function_name,
                             'p_user_id', p_user_id,
                'auth_user_id',v_user_auth_id,
                'appro_id', NULL,
                'row_id', p_row_id,
                'result', 'DENIED',
                'reason', v_reason
            )::TEXT
        );
        RETURN FALSE;
    END IF;

    ----------------------------------------------------------------------
    -- STEP 2: Get function's tables from permission_molecule_required
    ----------------------------------------------------------------------
    SELECT ARRAY_AGG(DISTINCT split_part(split_part(atom, '@', 2), '#', 1))
    INTO v_function_tables
    FROM permission_molecule_required pmr,
         UNNEST(pmr.molecule) AS atom
    WHERE pmr.name = p_function_name;

    IF v_function_tables IS NULL THEN
        v_reason := 'no molecule configuration for function';
        INSERT INTO app_event_log (event_name, description)
        VALUES ('PERMISSION_DENIED',
            jsonb_build_object(
                'function', p_function_name,
                'p_user_id', p_user_id,
                'auth_user_id',v_user_auth_id,
                'appro_id', v_user_appro_id,
                'row_id', p_row_id,
                'result', 'DENIED',
                'reason', v_reason
            )::TEXT
        );
        RETURN FALSE;
    END IF;

    ----------------------------------------------------------------------
    -- STEP 3: Build list of VALID generic scopes for this function
    ----------------------------------------------------------------------
    v_valid_generic_scopes := ARRAY[]::UUID[];


    -- Appros (only app_profiles)
    IF v_function_tables && ARRAY['app_profiles'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[APPROS_SCOPE_UUID];
    END IF;

    -- Assignments
    IF v_function_tables && ARRAY['task_assignments', 'task_assignment_view'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[ASSIGNMENTS_SCOPE_UUID];
    END IF;

    -- Auth  ["SELECT@auth_user#virtual","SELECT@auth_user#name"]  --new 15:10 Jan 1 2026
    IF v_function_tables && ARRAY['auth_user'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[GET_AUTHENTICATED_USER_UUID];
    END IF;


    -- Relations
    IF v_function_tables && ARRAY['notes', 'notes_view', 'notes_categorised', 'notes_status'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[NOTES_SCOPE_UUID];
    END IF;


    -- Relations
    IF v_function_tables && ARRAY['approfile_relations', 'approfile_relations_view', 'relationships'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[RELATIONS_SCOPE_UUID];
    END IF;



    -- Survey-related tables
    IF v_function_tables && ARRAY['survey_headers', 'survey_questions', 'survey_answers'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[SURVEYS_SCOPE_UUID];
    END IF;


    -- Task-related tables
    IF v_function_tables && ARRAY['task_headers', 'task_steps', 'task_view', 'automations'] THEN
        v_valid_generic_scopes := v_valid_generic_scopes || ARRAY[TASKS_SCOPE_UUID];
    END IF;






    -- Note: No fallback to APPROS_SCOPE_UUID — only if function touches app_profiles

    ----------------------------------------------------------------------
    -- STEP 4: Check granted permissions
    ----------------------------------------------------------------------
    FOR rec IN
        SELECT *
        FROM permissions_view
        WHERE user_id = v_user_appro_id
          AND function_name = '(]' || p_function_name || '[)'
          AND NOT is_deleted
    LOOP
        -- CASE 1: Specific task permission
        IF rec.task_header_id IS NOT NULL THEN
            IF v_function_tables && ARRAY['task_headers', 'task_steps', 'automations']
               AND p_row_id = rec.task_header_id THEN
                v_is_permitted := TRUE;
                v_success_reason := 'specific task scope match';
                EXIT;
            END IF;
            CONTINUE;
        END IF;

        -- CASE 2: Specific survey permission
        IF rec.survey_header_id IS NOT NULL THEN
            IF v_function_tables && ARRAY['survey_headers', 'survey_questions', 'survey_answers']
               AND p_row_id = rec.survey_header_id THEN
                v_is_permitted := TRUE;
                v_success_reason := 'specific survey scope match';
                EXIT;
            END IF;
            CONTINUE;
        END IF;

        -- CASE 3: Generic scope permission
IF array_length(v_valid_generic_scopes, 1) > 0 
   AND rec.scope_id = ANY(v_valid_generic_scopes) THEN
    v_is_permitted := TRUE;
    v_success_reason := 'valid generic scope match';
    EXIT;
END IF;

        -- Implicit: if rec.scope_id is a human appro (e.g., JohnSmith),
        -- it won't be in v_valid_generic_scopes → skipped
    END LOOP;

    ----------------------------------------------------------------------
    -- STEP 5: Logging
    ----------------------------------------------------------------------
    IF (NOT v_is_permitted) OR DEBUG_MODE THEN
        INSERT INTO app_event_log (event_name, description)
        VALUES (
            CASE WHEN v_is_permitted THEN 'PERMISSION_GRANTED' ELSE 'PERMISSION_DENIED' END,
            jsonb_build_object(
                'function', p_function_name,
                'p_user_id', p_user_id,
                'auth_user_id',v_user_auth_id,

                'appro_id', v_user_appro_id,
                'row_id', p_row_id,
                'result', CASE WHEN v_is_permitted THEN 'PERMITTED' ELSE 'DENIED' END,
                'reason', COALESCE(v_success_reason, v_reason),
                'function_tables', v_function_tables,
                'valid_generic_scopes', v_valid_generic_scopes
            )::TEXT
        );
    END IF;

    RETURN v_is_permitted;
END;
$$;