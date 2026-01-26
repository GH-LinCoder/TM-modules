-- grant_mydash_permissions(user_id UUID) 11:06 Jan 2 2026
CREATE OR REPLACE FUNCTION public.grant_mydash_permissions(p_user_id UUID) --uses authId but then finds the approId
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
    (v_appro_id, '(]getAuthenticatedUser[)','bfd6c2e8-ec41-4edd-a0e3-54fb513851ac' ), --uses the appro Id (not auth id)  added 2; (14:00 jan 14)  (]readApprofile_relations_view[) (]readApprofileRelationships[)
    
    (v_appro_id, '(]readApprofileByAuthUserId[)', 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'),
    (v_appro_id, '(]readApprofileById[)', 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'),
    (v_appro_id, '(]readApprofile_relations_view[)', 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'),
    (v_appro_id, '(]readApprofile_relations_view[)', 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'),

    (v_appro_id, '(]readTaskHeaders[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks
    (v_appro_id, '(]readTaskSteps[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks
    (v_appro_id, '(]readTaskWithSteps[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks
        (v_appro_id, '(]readStep3Id[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks
            (v_appro_id, '(]readAllSteps[)', '90b915ce-d43e-4a1e-938c-494987f18b1c'), -- Tasks

    (v_appro_id, '(]studentAssignments[)', 'd2545d76-5cac-4f6b-af13-d6529e4c4294'), -- Tasks    
    (v_appro_id, '(]managerAssignments[)', 'd2545d76-5cac-4f6b-af13-d6529e4c4294'), -- Tasks


--    (v_appro_id, '(]readSurveys[)', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'), -- Surveys
    (v_appro_id, '(]readSurveyHeaders[)', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'), -- Surveys
    (v_appro_id, '(]readSurveyQuestions[)', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'), -- Surveys
    (v_appro_id, '(]readSurveyAnswers[)', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf') -- Surveys    
    
    -- ... missing other survey permissions ? What about launching automations which are possible not ifP ?


  ON CONFLICT DO NOTHING; -- Safe for re-runs

  -- Grant of 'bug report' (notes) permissions if needed -- see separate function


UPDATE temp_signups
SET grant_my_dash_at = NOW()
WHERE user_id = p_user_id
  AND grant_my_dash_at IS NULL;


END;
$$;