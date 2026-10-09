

--bits missing


DECLARE
  v_appro_id UUID;
  v_humans_id UUID := '0a025b65-ea1a-419f-ac79-3bb57978486a'::UUID;
  v_relation_id UUID;
BEGIN
  -- Get user's appro_id
  SELECT id INTO v_appro_id 
  FROM app_profiles 
  WHERE auth_user_id = p_auth_user_id;
  
  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'User has no approfile';
  END IF;

  -- Insert relation (idempotent) using correct column names
  INSERT INTO approfile_relations (
    approfile_is,    
    relationship,    
    of_approfile     
  )
  VALUES (
    v_appro_id,
    p_relationship,  
    v_humans_id
  )
  ON CONFLICT (approfile_is, relationship, of_approfile) DO NOTHING
  RETURNING id INTO v_relation_id;

  RETURN v_relation_id;
END;
