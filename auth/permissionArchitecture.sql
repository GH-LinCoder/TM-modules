--outputting the missing atoms

-- In the denied branch of is_permitted
v_missing_atoms := ARRAY(
  SELECT unnest(v_required_molecule)
  EXCEPT
  SELECT unnest(v_granted_molecule)
);

{
  "result": "Denied",
  "missing": ["INSERT@notes#author_id", "INSERT@notes#content"],
  ...
}







-- public.is_permitted(user_id UUID, function_name TEXT) → BOOLEAN

--21:55 this is on the db

CREATE OR REPLACE FUNCTION public.is_permitted(
  p_user_id UUID,
  p_function_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required_molecule TEXT[];
  v_granted_molecule TEXT[];
  v_is_permitted BOOLEAN;
  v_event_name TEXT;
  v_description TEXT;
BEGIN
  -- === PHASE 1: Permission Evaluation ===

  -- Get required molecule
  SELECT molecule
  INTO v_required_molecule
  FROM permission_molecule_required
  WHERE name = p_function_name;

  IF v_required_molecule IS NULL THEN
    v_is_permitted := false;
    v_event_name := 'PERMISSION_DENIED';
    v_description := jsonb_build_object(
      'function', p_function_name,
      'user_id', p_user_id,
      'error', 'Function not registered in permission_molecule_required'
    )::TEXT;
    
    -- Log and return
    INSERT INTO app_event_log (event_name, description)
    VALUES (v_event_name, v_description);
    RETURN v_is_permitted;
  END IF;

  -- Get granted molecule
  SELECT molecule
  INTO v_granted_molecule
  FROM permission_molecule_granted
  WHERE user_id = p_user_id;

  IF v_granted_molecule IS NULL THEN
    v_is_permitted := false;
  ELSE
    v_is_permitted := v_required_molecule <@ v_granted_molecule;
  END IF;
    -- === PHASE 2: Logging ===

  v_event_name := CASE WHEN v_is_permitted THEN 'is_permitted_YES' ELSE 'is_permitted_NO' END;

  v_description := jsonb_build_object(
    'function', p_function_name,
    'user_id', p_user_id,
    'MolGranted', v_granted_molecule,
    'MolRequired', v_required_molecule,
    'result', CASE WHEN v_is_permitted THEN 'is_permitted_YES' ELSE 'is_permitted_NO' END
  )::TEXT;

  INSERT INTO app_event_log (event_name, description)
  VALUES (v_event_name, v_description);

  RETURN v_is_permitted;
END;
$$;








-- public.is_permitted(user_id UUID, function_name TEXT) → BOOLEAN
CREATE OR REPLACE FUNCTION public.is_permitted(
  p_user_id UUID,
  p_function_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required_molecules TEXT[];
  v_granted_molecules TEXT[];
BEGIN
  -- 1. Get required molecule for the function
  SELECT molecule
  INTO v_required_molecules
  FROM permission_molecule_required
  WHERE name = p_function_name;

  IF v_required_molecules IS NULL THEN
    RAISE WARNING 'Function % not found in permission_molecule_required', p_function_name;
    RETURN false;
  END IF;

  -- 2. Get granted molecule for the user
  SELECT molecule
  INTO v_granted_molecules
  FROM permission_molecule_granted
  WHERE user_id = p_user_id;

  IF v_granted_molecules IS NULL THEN
    RAISE WARNING 'User % has no granted permissions', p_user_id;
    RETURN false;
  END IF;

  -- 3. Check containment: required ⊆ granted
  RETURN v_required_molecules <@ v_granted_molecules;
END;
$$;
--qwen & copilot almost identical except for names and also qwen includes definer. 18:21 Dec 28 2025

-- Essential: grant execute to users who need to check permissions
GRANT EXECUTE ON FUNCTION public.is_permitted(UUID, TEXT) TO authenticated;


---- Every RPC function should begin with
IF NOT public.is_permitted(auth.uid(), func_name) THEN
  RAISE EXCEPTION 'Permission denied';
END IF;

-------------------------------------------------

--logging by comparator copilot version

INSERT INTO app_event_log(event_type, user_id, details)
VALUES (
  CASE WHEN permitted THEN 'permission_granted' ELSE 'permission_denied' END,
  user_id,
  jsonb_build_object(
    'function', fn_name,
    'required', required_atoms,
    'granted', granted_atoms
  )
);

--OR  

CREATE OR REPLACE FUNCTION public.is_permitted(
  p_user_id UUID,
  p_function_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required_molecule TEXT[];      -- singular: "molecule"
  v_granted_molecule TEXT[];       -- singular
  v_is_permitted BOOLEAN;
  v_event_name TEXT;
  v_description TEXT;
BEGIN
  -- 1. Get required molecule (note: column is "name", not "function_name")
  SELECT molecule
  INTO v_required_molecule
  FROM permission_molecule_required
  WHERE name = p_function_name;  -- ✅ your column is "name"

  IF v_required_molecule IS NULL THEN
    v_description := 'Function not registered: ' || p_function_name;
    v_event_name := 'perm_DENIED';
    v_is_permitted := false;
    
    INSERT INTO app_event_log (event_name, description)
    VALUES (v_event_name, v_description);
    
    RETURN v_is_permitted;
  END IF;

  -- 2. Get granted molecule
  SELECT molecule  -- ✅ your column is "molecule" (singular)
  INTO v_granted_molecule
  FROM permission_molecule_granted
  WHERE user_id = p_user_id;

  IF v_granted_molecule IS NULL THEN
    v_description := 'User has no granted permissions';
    v_event_name := 'permission_DENIED';
    v_is_permitted := false;
  ELSE
    v_is_permitted := v_required_molecule <@ v_granted_molecule;
    v_event_name := CASE WHEN v_is_permitted THEN 'permission_GRANTED' ELSE 'permission_DENIED' END;
    v_description := 'Function: ' || p_function_name || 
                     '; Required: ' || v_required_molecule::TEXT || 
                     '; Granted: ' || v_granted_molecule::TEXT;
  END IF;

  -- 3. Log the permission decision
  INSERT INTO app_event_log (event_name, description)
  VALUES (v_event_name, v_description);

  RETURN v_is_permitted;
END;
$$;

--------------------------------------------------

-- Build structured description
v_description := jsonb_build_object(
  'function', p_function_name,
  'user_id', p_user_id,
  'required', v_required_molecule,
  'granted', v_granted_molecule,
  'result', CASE WHEN v_is_permitted THEN 'granted' ELSE 'denied' END
)::TEXT;

INSERT INTO app_event_log (event_name, description)
VALUES (
  CASE WHEN v_is_permitted THEN 'PERMISSION_GRANTED' ELSE 'PERMISSION_DENIED' END,
  v_description
);
--------------------------------------------------

function_name: 'fn_create_task'
molecule: { 'INSERT@task_headers#name', 'INSERT@task_headers#description' }



user_id: <your appro uuid>
granted_permissions: { 'INSERT@task_headers#name', 'INSERT@task_headers#description' }

-- Optional: allow anon if needed (e.g., for signup)
-- GRANT EXECUTE ON FUNCTION public.check_permission(UUID, TEXT) TO anon;



INSERT INTO permission_molecule_granted (user_id, name, molecule)  --there is no name columen or granted permission
VALUES 
  ('06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df', ARRAY['SELECT@app_profiles#name']), -- minimal ,'profilia'
  ('1c8557ab-12a5-4199-81b2-12aa26a61ec5', (ARRAY ['INSERT@notes#audience_id','INSERT@notes#author_id','INSERT@notes#content','INSERT@notes#reply_to_id','INSERT@notes#status','INSERT@notes#title'])), --, 'noomwild' 
  ('5c67d9e6-8cb2-4290-be27-de7251165d61', ARRAY ['INSERT@survey_headers#name','INSERT@survey_headers#surveyDescription','INSERT@survey_headers#surveyName']); --, 'fingle'

-- 'd8289536-3882-4033-abc9-0e3fcd18f21a', 'createSurvey' ['INSERT@survey_headers#name','INSERT@survey_headers#surveyDescription','INSERT@survey_headers#surveyName']

--Input into the db  using single quotes, but when displayed they use double. So copy paste will not work


--older Qwen version


--when there are database functions begin with
IF NOT execute_if_permitted(current_user_id(), 'fn_create_task') THEN
    RAISE EXCEPTION 'Permission denied';
END IF;

-- public.check_permission_granted(molecule_required TEXT[], molecule_granted TEXT[])
-- Returns TRUE if all required atoms are in granted
