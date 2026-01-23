CREATE OR REPLACE FUNCTION is_permitted(
  p_table_name TEXT,
    p_row_id UUID,        -- NULL for aggregates like COUNT
    p_operation TEXT      -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_appro_id UUID;
  --  v_auth_user_id  UUID; 
    v_result BOOLEAN := FALSE;
BEGIN

--v_auth_user_id := auth.uid();

    -- Get current user's approfile ID
    SELECT id INTO v_user_appro_id
    FROM app_profiles
    WHERE auth_user_id = auth.uid();

    -- If user has no approfile, deny access
    IF v_user_appro_id IS NULL THEN
      RAISE LOG 'No appro';
        RETURN FALSE;
    END IF;


-- Self-access: is this the user's own profile?
IF p_row_id IS NOT NULL 
   AND v_user_appro_id IS NOT NULL
   AND p_table_name = 'app_profiles' 
   AND p_operation = 'SELECT' 
   AND p_row_id = v_user_appro_id THEN
    RETURN TRUE;
END IF;


--test to check params
  RAISE LOG 'is_permitted called: table=%, row_id=%, op=%, auth_uid=%', 
    p_table_name, p_row_id, p_operation, auth.uid();



    -- Main permission check using the permission system
    SELECT EXISTS (
        SELECT 1
        FROM permissions_view pv
        INNER JOIN function_table_access fta 
            ON pv.function_name = '(]' || fta.function_name || '[)'
        WHERE 
            fta.table_name = p_table_name
            AND fta.operation = p_operation
            AND pv.user_id = v_user_appro_id
            AND (
                -- Specific row permissions (only checked if p_row_id is provided)
                (p_row_id IS NOT NULL AND (
                    (p_table_name = 'task_headers' AND pv.task_header_id = p_row_id)
                    OR (p_table_name = 'survey_headers' AND pv.survey_header_id = p_row_id)

                    OR (p_table_name = 'app_profiles' AND pv.scope_id = p_row_id)

                 --   OR (p_table_name = 'task_assignments' AND pv.id = p_row_id) //removed pv.assignments.id  13:24 Jan 4 changed 13:38
                  --  OR (p_table_name = 'notes' AND pv.note_id = p_row_id)
                --    OR (p_table_name = 'relationships' AND pv.relation_id = p_row_id)
                ))
                -- OR generic scope permission (works for all cases)
                RAISE NOTICE 'Checking generic permission for % on %', v_user_appro_id, p_table_name;
                OR pv.scope_id = fta.generic_scope --original bug the fta coulmn was text and fails to be = to the uuid scope. view now edited to be uuid 16:00 Jan 4
            )
    ) INTO v_result;
      RAISE LOG 'result= %', v_result;
    RETURN v_result;
END;
$$;

/*
  Permission model: 
  - RLS checks table + operation
  - We find ALL functions that can perform this table+operation
  - If user has ANY of those functions → access granted
  - This means granting one function (e.g., readApprofileById) 
    enables ALL read access to app_profiles
*/