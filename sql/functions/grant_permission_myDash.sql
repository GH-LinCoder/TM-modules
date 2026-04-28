-- grant_mydash_permissions(user_id UUID) 
-- Updated to read bundle definition from permission_relations
CREATE OR REPLACE FUNCTION public.grant_mydash_permissions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path =  _internal, public, auth
AS $$
DECLARE
  v_appro_id UUID;
  v_bundle_id UUID := '0dc8cef1-4a8b-430d-94b3-bcafde58fa13'::UUID;  -- myDash bundle UUID
  v_granted_count INTEGER;
BEGIN
  -- 1. Get user's approfile
  SELECT id INTO v_appro_id FROM app_profiles WHERE auth_user_id = p_user_id;
  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'User has no approfile';
  END IF;

  -- 2. Grant permissions from bundle definition
  -- Copy bundle permissions, replacing bundle's approfile_is with user's appro_id
  INSERT INTO permission_relations (approfile_is, relationship, of_approfile, is_deleted)
  SELECT 
    v_appro_id,              -- New user's appro_id (was bundle_id in template)
    pr.relationship,         -- Function name (e.g., '(]readApprofileById[)')
    pr.of_approfile,         -- Scope (SELF uuid or generic scope uuid)
    false                    -- is_deleted
  FROM permission_relations pr
  WHERE pr.approfile_is = v_bundle_id    -- Template rows have bundle_id as approfile_is
    AND pr.is_deleted IS NOT TRUE        -- Only active permissions
  ON CONFLICT (approfile_is, relationship, of_approfile) DO NOTHING;  -- Idempotent
  
  GET DIAGNOSTICS v_granted_count = ROW_COUNT;

  -- 3. Mark signup as granted
  UPDATE temp_signups
  SET grant_my_dash_at = NOW()
  WHERE user_id = p_user_id
    AND grant_my_dash_at IS NULL;

  -- 4. Log for debugging
  RAISE LOG 'grant_mydash_permissions: Granted % permissions from bundle % to user appro_id %', 
    v_granted_count, v_bundle_id, v_appro_id;
END;
$$;