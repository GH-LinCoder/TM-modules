-- Drop if exists
DROP FUNCTION IF EXISTS public.assign_welcome_task(UUID);

-- Create RPC function
CREATE OR REPLACE FUNCTION public.assign_welcome_task(p_auth_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appro_id UUID;
  v_manager_id UUID := '9066554d-1476-4655-9305-f997bff43cbb'; -- ← Replace sometime to new default manager ID
  v_task_header_id UUID := 'dc9a0e71-4adf-42e7-8649-3620089e4df8';
  v_step_id UUID := '254fdb07-c7dd-41d1-a1af-05380ae97f71';
  v_existing_count INT;
BEGIN
  -- Get user's approfile
  SELECT id INTO v_appro_id 
  FROM app_profiles 
  WHERE auth_user_id = p_auth_user_id;

  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'No approfile found for auth user %', p_auth_user_id;
  END IF;

  -- Check if welcome task already assigned (idempotency)
  SELECT COUNT(*) INTO v_existing_count
  FROM task_assignments
  WHERE 
    student_id = v_appro_id
    AND task_header_id = v_task_header_id
    AND step_id = v_step_id;

  IF v_existing_count > 0 THEN
    RETURN; -- Already assigned
  END IF;

  -- Assign the welcome task
  INSERT INTO task_assignments (
    task_header_id,
    step_id,
    student_id,
    manager_id,
    assigned_by_automation
  ) VALUES (
    v_task_header_id,
    v_step_id,
    v_appro_id,
    v_manager_id,
    NULL
  );


UPDATE temp_signups
SET assigned_task_at = NOW()
WHERE user_id = p_auth_user_id
  AND assigned_task_at IS NULL;

--is temp_signup completed?
UPDATE temp_signups
SET completed_at = NOW()
WHERE user_id = p_auth_user_id
  AND appro_created_at IS NOT NULL
  AND grant_my_dash_at IS NOT NULL
  AND grant_notes_at IS NOT NULL
  AND assigned_task_at IS NOT NULL
  AND completed_at IS NULL;



END;
$$;