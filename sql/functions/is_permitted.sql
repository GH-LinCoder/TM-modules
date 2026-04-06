CREATE OR REPLACE FUNCTION public.is_permitted(
  p_user_auth_id uuid,
  p_table_name text,
  p_operation text,
  p_row_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_appro_id uuid;
  v_granted_scopes uuid[];
  v_result boolean := false;
  v_target_row record;
  v_self_uuid constant uuid := 'db20d8fa-ef74-4ba5-8ce5-7c925fb7249d'::uuid;
  v_scope_id uuid;
BEGIN
  -- 1. Get the user's appro_id from auth ID
  SELECT id INTO v_user_appro_id 
  FROM app_profiles 
  WHERE auth_user_id = p_user_auth_id 
  LIMIT 1;
  
  IF v_user_appro_id IS NULL THEN
    RAISE LOG 'is_permitted: No appro found for auth user %', p_user_auth_id;
    RETURN false;
  END IF;
  
  -- 2. Fetch user's granted scopes that match ANY registered function for this table/operation
  SELECT ARRAY_AGG(pr.of_approfile)
  INTO v_granted_scopes
  FROM permission_relations pr
  JOIN permission_molecule_required pmr 
    ON trim(pr.relationship, '()[]') = pmr.name
  WHERE pr.approfile_is = v_user_appro_id
    AND pr.is_deleted IS NOT TRUE
    AND pmr.table_name = p_table_name
    AND pmr.operation = p_operation;
  
  IF v_granted_scopes IS NULL OR array_length(v_granted_scopes, 1) IS NULL THEN
    RAISE LOG 'is_permitted: No grants found for user % on %.%', v_user_appro_id, p_table_name, p_operation;
    RETURN false;
  END IF;
  
  -- 4. Evaluate each granted scope -moved earlier for faster decision
   FOREACH v_scope_id IN ARRAY v_granted_scopes
  LOOP
    -- === GENERIC SCOPE: Check if this scope matches ANY function's generic_scope ===
    IF EXISTS (
      SELECT 1 FROM permission_molecule_required
      WHERE table_name = p_table_name
        AND operation = p_operation
        AND generic_scope_id = v_scope_id
    ) THEN
      v_result := true;
      EXIT;  -- ← This EXIT is now inside the FOREACH loop
    END IF;




  -- 3. If row-specific check requested, fetch the target row
  IF p_row_id IS NOT NULL THEN
    EXECUTE format('SELECT * FROM %I WHERE id = $1', p_table_name)
    INTO v_target_row
    USING p_row_id;
    
    IF v_target_row IS NULL THEN
      RAISE LOG 'is_permitted: Row % not found in %', p_row_id, p_table_name;
      RETURN false;
    END IF;
  END IF;
  

    
    -- === SPECIFIC SCOPE: Table-by-table rules ===
    
    -- --- app_profiles ---
    IF p_table_name = 'app_profiles' THEN
      IF v_scope_id = v_self_uuid THEN
        IF p_row_id = v_user_appro_id THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF p_row_id = v_scope_id THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
    -- --- assignments ---
    IF p_table_name = 'assignments' THEN
      IF v_scope_id = v_self_uuid THEN
        IF v_target_row.student_id = v_user_appro_id 
           OR v_target_row.manager_id = v_user_appro_id THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF v_target_row.student_id = v_scope_id 
           OR v_target_row.manager_id = v_scope_id THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
    -- --- approfile_relations ---
    IF p_table_name = 'approfile_relations' THEN
      IF v_scope_id = v_self_uuid THEN
        IF v_target_row.is_id = v_user_appro_id 
           OR v_target_row.of_id = v_user_appro_id THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF v_target_row.is_id = v_scope_id 
           OR v_target_row.of_id = v_scope_id THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
    -- --- permission_relations ---
    IF p_table_name = 'permission_relations' THEN
      IF v_scope_id = v_self_uuid THEN
        IF v_target_row.approfile_is = v_user_appro_id THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF v_target_row.approfile_is = v_scope_id THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
    -- --- task_headers ---
    IF p_table_name = 'task_headers' THEN
      IF v_scope_id = v_self_uuid THEN
        IF EXISTS (
          SELECT 1 FROM app_profiles 
          WHERE id = v_user_appro_id 
            AND task_header_id = p_row_id
        ) THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF EXISTS (
          SELECT 1 FROM app_profiles 
          WHERE id = v_scope_id 
            AND task_header_id = p_row_id
        ) THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
    -- --- survey_headers ---
    IF p_table_name = 'survey_headers' THEN
      IF v_scope_id = v_self_uuid THEN
        IF EXISTS (
          SELECT 1 FROM app_profiles 
          WHERE id = v_user_appro_id 
            AND survey_header_id = p_row_id
        ) THEN
          v_result := true;
          EXIT;
        END IF;
      ELSE
        IF EXISTS (
          SELECT 1 FROM app_profiles 
          WHERE id = v_scope_id 
            AND survey_header_id = p_row_id
        ) THEN
          v_result := true;
          EXIT;
        END IF;
      END IF;
    END IF;
    
  END LOOP;  -- ← FOREACH loop ends here
  
  RAISE LOG 'is_permitted: user=% table=% op=% row=% result=%', 
    v_user_appro_id, p_table_name, p_operation, p_row_id, v_result;
  
  RETURN v_result;
END;
$$;