-- grant_mydash_permissions(user_id UUID) 11:06 Jan 2 2026
CREATE OR REPLACE FUNCTION public.grant_mydash_permissions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appro_id UUID;
BEGIN
  -- Get user's approfile
  SELECT id INTO v_appro_id FROM app_profiles WHERE auth_user_id = p_user_id;
  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'User has no approfile';
  END IF;

  -- Grant core permissions (idempotent)
  INSERT INTO approfile_relations (approfile_is, relationship, of_approfile)
  VALUES
    (v_appro_id, '(]getAuthenticatedUser[)', v_appro_id),
    (v_appro_id, '(]readApprofiles[)', v_appro_id),
    (v_appro_id, '(]readTasks[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks
    (v_appro_id, '(]readSurveys[)', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'), -- Surveys
    -- ... add 3 more core permissions
  ON CONFLICT DO NOTHING; -- Safe for re-runs

  -- Grant bug report permissions if needed
  -- (similar inserts for bug report functions)
END;
$$;