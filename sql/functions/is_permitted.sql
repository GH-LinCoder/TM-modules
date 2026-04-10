CREATE OR REPLACE FUNCTION public.is_permitted( -- the order of exisitng func is table, row, op. Can't change it
  p_table_name text,
  p_row_id uuid DEFAULT NULL,
  p_operation text   
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_auth_id uuid;
  v_user_appro_id uuid;
  v_granted_scopes uuid[];
  v_self_uuid constant uuid := 'db20d8fa-ef74-4ba5-8ce5-7c925fb7249d'::uuid;
  v_scope_id uuid;
  v_target_row record;
    i integer;
BEGIN
  -- 0. Get auth user ID
  v_user_auth_id := auth.uid();
  IF v_user_auth_id IS NULL THEN RETURN false; END IF;

  -- 1. Get user's appro_id
  SELECT id INTO v_user_appro_id FROM app_profiles 
  WHERE auth_user_id = v_user_auth_id LIMIT 1;
  IF v_user_appro_id IS NULL THEN RETURN false; END IF;
  
  -- 2. Fetch granted scopes
  SELECT ARRAY_AGG(pr.of_approfile) INTO v_granted_scopes
  FROM permission_relations pr
  JOIN permission_molecule_required pmr ON trim(pr.relationship, '()[]') = pmr.name
  WHERE pr.approfile_is = v_user_appro_id
    AND pr.is_deleted IS NOT TRUE
    AND pmr.table_name = p_table_name
    AND pmr.operation = p_operation;
  
  IF v_granted_scopes IS NULL OR array_length(v_granted_scopes, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- 3. Fetch target row if needed
  IF p_row_id IS NOT NULL THEN
    BEGIN
      EXECUTE format('SELECT * FROM %I WHERE id = $1', p_table_name)
      INTO v_target_row USING p_row_id;
    EXCEPTION WHEN undefined_table THEN RETURN false; END;
  END IF;
  
  -- 4. Evaluate scopes
  FOREACH v_scope_id IN ARRAY v_granted_scopes
  LOOP
    -- Generic scope (check first - works without row)
    IF EXISTS (
      SELECT 1 FROM permission_molecule_required
      WHERE table_name = p_table_name
        AND operation = p_operation
        AND generic_scope_id = v_scope_id
    ) THEN RETURN true; END IF;
    
    -- Specific scope - SIMPLIFIED GUARD (only check p_row_id)
    IF p_row_id IS NOT NULL THEN
  RAISE LOG 'is_permitted: ENTERING specific scope for table [%]', p_table_name;
      
      CASE LOWER(TRIM(p_table_name))
        WHEN 'app_profiles' THEN
  RAISE LOG 'is_permitted app_profiles: p_row_id=%, v_user_appro_id=%, match=%', 
            p_row_id, v_user_appro_id, (p_row_id = v_user_appro_id);
          IF v_scope_id = v_self_uuid AND p_row_id = v_user_appro_id THEN RETURN true; END IF;
          IF v_scope_id != v_self_uuid AND p_row_id = v_scope_id THEN RETURN true; END IF;
          
        WHEN 'assignments' THEN
  RAISE LOG 'is_permitted assignments: student=%, manager=%, user=%, self_match=%', 
            v_target_row.student_id, v_target_row.manager_id, v_user_appro_id, (v_scope_id = v_self_uuid);
          IF v_scope_id = v_self_uuid AND (
            v_target_row.student_id = v_user_appro_id OR v_target_row.manager_id = v_user_appro_id
          ) THEN RETURN true; END IF;
          IF v_scope_id != v_self_uuid AND (
            v_target_row.student_id = v_scope_id OR v_target_row.manager_id = v_scope_id
          ) THEN RETURN true; END IF;
          
        WHEN 'approfile_relations' THEN
  RAISE LOG 'is_permitted approfile_relations: approfile_is=%, of_id=%, user=%', 
         v_target_row.approfile_is, v_target_row.of_id, v_user_appro_id;
        IF v_scope_id = v_self_uuid AND (
        v_target_row.approfile_is = v_user_appro_id OR v_target_row.of_id = v_user_appro_id
        ) THEN RETURN true; END IF;
        IF v_scope_id != v_self_uuid AND (
        v_target_row.approfile_is = v_scope_id OR v_target_row.of_id = v_scope_id
        ) THEN RETURN true; END IF;
          
        WHEN 'permission_relations' THEN
          IF v_scope_id = v_self_uuid AND v_target_row.approfile_is = v_user_appro_id THEN RETURN true; END IF;
          IF v_scope_id != v_self_uuid AND v_target_row.approfile_is = v_scope_id THEN RETURN true; END IF;
          
        WHEN 'task_headers' THEN
          IF v_scope_id = v_self_uuid AND EXISTS (
            SELECT 1 FROM app_profiles WHERE id = v_user_appro_id AND task_header_id = p_row_id
          ) THEN RETURN true; END IF;
          IF v_scope_id != v_self_uuid AND EXISTS (
            SELECT 1 FROM app_profiles WHERE id = v_scope_id AND task_header_id = p_row_id
          ) THEN RETURN true; END IF;
          
        WHEN 'survey_headers' THEN
          IF v_scope_id = v_self_uuid AND EXISTS (
            SELECT 1 FROM app_profiles WHERE id = v_user_appro_id AND survey_header_id = p_row_id
          ) THEN RETURN true; END IF;
          IF v_scope_id != v_self_uuid AND EXISTS (
            SELECT 1 FROM app_profiles WHERE id = v_scope_id AND survey_header_id = p_row_id
          ) THEN RETURN true; END IF;
          
        ELSE
  RAISE LOG 'is_permitted: UNKNOWN table [%]', p_table_name;
      END CASE;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;