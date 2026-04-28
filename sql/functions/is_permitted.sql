CREATE OR REPLACE FUNCTION public.is_permitted(
  p_table_name text,
  p_row_id uuid,
  p_operation text,
  p_row_data jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path =  _internal, public, auth
SET row_security = off
AS $$
DECLARE
  v_user_auth_id uuid;
  v_user_appro_id uuid;
  v_granted_scopes uuid[];
  v_self_uuid constant uuid := 'db20d8fa-ef74-4ba5-8ce5-7c925fb7249d'::uuid;
  v_scope_id uuid;

  -- extracted from p_row_data
  v_created_by uuid;
  v_author_id uuid;
  v_student_id uuid;
  v_manager_id uuid;
  v_approfile_is uuid;
  v_of_approfile uuid;
  v_note_id uuid;
  v_audience_id uuid;  
  v_task_header_id uuid;
  v_survey_header_id uuid;

  -- dereferenced scope appro → resource
  v_scope_task_header_id uuid;
  v_scope_survey_header_id uuid;
BEGIN
  RAISE LOG 'is_permitted: START table=%, op=%', p_table_name, p_operation;

  --------------------------------------------------------------------
  -- 1. Get auth user ID
  --------------------------------------------------------------------
  v_user_auth_id := auth.uid();
  IF v_user_auth_id IS NULL THEN
    RAISE LOG 'is_permitted: no auth uid';
    RETURN false;
  END IF;

  --------------------------------------------------------------------
  -- 2. Get user's appro_id
  --------------------------------------------------------------------
  SELECT id INTO v_user_appro_id
  FROM app_profiles
  WHERE auth_user_id = v_user_auth_id
  LIMIT 1;

  IF v_user_appro_id IS NULL THEN
    RAISE LOG 'is_permitted: no appro';
    RETURN false;  
  END IF;

  --------------------------------------------------------------------
  -- 3. Get granted scopes for THIS user + THIS table + THIS operation
  --    Normalize relationship: remove first 2 and last 2 chars.
  --------------------------------------------------------------------
  SELECT ARRAY_AGG(pr.of_approfile)
  INTO v_granted_scopes
  FROM _internal.permission_relations pr
  JOIN _internal.permission_molecule_required pmr
    ON substring(pr.relationship FROM 3 FOR char_length(pr.relationship)-4)
       = pmr.name
  WHERE pr.approfile_is = v_user_appro_id
    AND pr.is_deleted IS NOT TRUE
    AND pmr.table_name = p_table_name
    AND pmr.operation  = p_operation;

  IF v_granted_scopes IS NULL OR v_granted_scopes = '{}'::uuid[] THEN
    RAISE LOG 'is_permitted: no scopes found';
    RETURN false;
  END IF;

  --------------------------------------------------------------------
  -- 4. GENERIC SCOPE CHECK
  --    If any granted scope matches pmr.generic_scope_id → GRANTED
  -- may be possible to remove the join - already done?

  --------------------------------------------------------------------
FOREACH v_scope_id IN ARRAY v_granted_scopes LOOP 
  IF EXISTS (
    SELECT 1
    FROM _internal.permission_molecule_required pmr
    JOIN _internal.permission_relations pr
      ON substring(pr.relationship FROM 3 FOR char_length(pr.relationship)-4)
         = pmr.name
    WHERE pmr.table_name = p_table_name
      AND pmr.operation  = p_operation
      AND pmr.generic_scope_id = v_scope_id
      AND pr.approfile_is = v_user_appro_id
      AND pr.of_approfile = v_scope_id
      AND pr.is_deleted IS NOT TRUE
  ) THEN
    RAISE LOG 'is_permitted: User % holds valid GENERIC permission for %', 
              v_user_appro_id, p_table_name;
    RETURN true;
  END IF;
END LOOP;


  --------------------------------------------------------------------
  -- 5. Extract row data (SELF + resource logic) 
  --RLS 'using' is_permitted: we extract the old row student_id. RLS 'check' is_permitted: we extract the new row student_id
  --------------------------------------------------------------------
  IF p_row_data IS NOT NULL THEN
    v_task_header_id   := (p_row_data ->> 'task_header_id')::uuid;
    v_survey_header_id := (p_row_data ->> 'survey_header_id')::uuid;
    v_created_by       := (p_row_data ->> 'created_by')::uuid;
    v_author_id        := (p_row_data ->> 'author_id')::uuid;
    v_student_id       := (p_row_data ->> 'student_id')::uuid;
    v_manager_id       := (p_row_data ->> 'manager_id')::uuid;
    v_approfile_is     := (p_row_data ->> 'approfile_is')::uuid;
    v_of_approfile     := (p_row_data ->> 'of_approfile')::uuid;
    v_note_id          := (p_row_data ->> 'note_id')::uuid;
    v_audience_id      := (p_row_data ->> 'audience_id')::uuid;
  END IF;



--------------------------------------------------------------------
--6, 7 & 8. Combined Scope + SELF + Resource Logic
--------------------------------------------------------------------
FOREACH v_scope_id IN ARRAY v_granted_scopes LOOP

  -- 7a. Dereference once per scope
  SELECT task_header_id, survey_header_id
  INTO   v_scope_task_header_id, v_scope_survey_header_id
  FROM appro_name_lookup
  WHERE id = v_scope_id;

  -- 7b. Direct ID Match (for tables where row IS an approfile)
  -- moved to: app_profiles, permission_relations
--  IF p_row_id IS NOT NULL AND v_scope_id = p_row_id THEN
 --   RETURN true;
 -- END IF;

  -- 7c. Resource Header Match (for task/survey-based tables)
  IF p_row_id IS NOT NULL AND (
     v_scope_task_header_id = p_row_id OR 
     v_scope_survey_header_id = p_row_id
  ) THEN
    RETURN true;
  END IF;

  -- 8. Table-specific "Occupancy" or "Self" logic
  
    CASE LOWER(TRIM(p_table_name))

      WHEN 'app_profiles' THEN
  -- SELF: User's own profile
  IF v_scope_id = v_self_uuid
     AND p_row_id = v_user_appro_id THEN
    RETURN true;
  END IF;

  -- SPECIFIC SCOPE: scope appro == row appro
  IF v_scope_id = p_row_id THEN
    RAISE LOG 'is_permitted: SPECIFIC app_profiles match (scope appro == row appro)';
    RETURN true;
  END IF;

      WHEN 'approfile_relations' THEN
        IF v_scope_id = v_self_uuid AND
           (v_approfile_is = v_user_appro_id OR v_of_approfile = v_user_appro_id) THEN
          RETURN true;
        END IF;


      WHEN 'assignments' THEN
        IF v_scope_id = v_self_uuid AND
           (v_student_id = v_user_appro_id OR v_manager_id = v_user_appro_id) THEN
          RETURN true;
        END IF;

         -- SELF assignment: user can assign themselves (INSERT only) 16:57 April 27
  IF p_operation = 'INSERT' AND v_scope_id = v_self_uuid THEN
    IF v_student_id = v_user_appro_id THEN
      RETURN true;
    END IF;
 END IF; 


      WHEN 'automations' THEN
        IF v_scope_id = v_self_uuid AND v_created_by = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND v_task_header_id = v_scope_task_header_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND v_survey_header_id = v_scope_survey_header_id THEN
          RETURN true;
        END IF;

      WHEN 'notes' THEN
        IF v_scope_id = v_self_uuid AND
           (v_author_id = v_user_appro_id OR v_audience_id = v_user_appro_id) THEN
          RETURN true;
        END IF;

      WHEN 'permission_relations' THEN
        IF v_scope_id = v_self_uuid AND v_approfile_is = v_user_appro_id THEN
          RETURN true;
        END IF;


      WHEN 'survey_headers' THEN
        IF v_scope_id = v_self_uuid AND v_author_id = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND p_row_id = v_scope_survey_header_id THEN
          RETURN true;
        END IF;

      WHEN 'survey_questions' THEN
        IF v_scope_id = v_self_uuid AND v_author_id = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND v_survey_header_id = v_scope_survey_header_id THEN
          RETURN true;
        END IF;

      WHEN 'survey_answers' THEN
        IF v_scope_id = v_self_uuid AND v_author_id = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND v_survey_header_id = v_scope_survey_header_id THEN
          RETURN true;
        END IF;

      WHEN 'task_headers' THEN
        IF v_scope_id = v_self_uuid AND v_author_id = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND p_row_id = v_scope_task_header_id THEN
          RETURN true;
        END IF;

      WHEN 'task_steps' THEN
        IF v_scope_id = v_self_uuid AND v_author_id = v_user_appro_id THEN
          RETURN true;
        END IF;
        IF v_scope_id != v_self_uuid AND v_task_header_id = v_scope_task_header_id THEN
          RETURN true;
        END IF;

      ELSE
        NULL;
    END CASE;

END LOOP;

  --------------------------------------------------------------------
  -- 9. Default deny
  --------------------------------------------------------------------
  RAISE LOG 'is_permitted: END FALSE';
  RETURN false;
END;
$$;
