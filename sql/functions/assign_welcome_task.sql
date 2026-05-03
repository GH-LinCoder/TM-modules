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
  v_appro_name TEXT; -- ← Missing type declaration
  v_manager_id UUID := NULL; -- when cloning system the default manager id is unknown.
  v_task_header_id UUID := 'dc9a0e71-4adf-42e7-8649-3620089e4df8';
  v_step_id UUID := '254fdb07-c7dd-41d1-a1af-05380ae97f71';
  v_existing_count INT;
BEGIN
  -- Get user's approfile
  SELECT id, name INTO v_appro_id, v_appro_name 
  FROM app_profiles 
  WHERE auth_user_id = p_auth_user_id;

  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'No approfile found for auth user %', p_auth_user_id;
  END IF;

  -- Check if welcome task already assigned (idempotency)
  SELECT COUNT(*) INTO v_existing_count
  FROM assignments
  WHERE student_id = v_appro_id
    AND assignment->>'task_header' = v_task_header_id::TEXT
    AND assignment->>'step_id' = v_step_id::TEXT;

  IF v_existing_count > 0 THEN
    RETURN; -- Already assigned
  END IF;

  -- Assign the welcome task
  INSERT INTO assignments (
    assignment_type,
    assignment,
    student_id,
    student_name,
    manager_id,
    assigned_by_automation,
    current_step,
    move_by
  ) VALUES (
    'task',
    jsonb_build_object(
      'step_id', v_step_id,
      'task_header', v_task_header_id
    ),
    v_appro_id,
    v_appro_name, -- ← Use the extracted name
    v_manager_id,
    NULL,
    '3',
    'student'
  );

  -- Update temp_signups
  UPDATE temp_signups
  SET assigned_task_at = NOW()
  WHERE user_id = p_auth_user_id
    AND assigned_task_at IS NULL;

  -- Check if temp_signup is completed
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