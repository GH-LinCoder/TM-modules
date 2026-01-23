-- Drop if exists
DROP FUNCTION IF EXISTS public.auto_assign_task(p_auto_parameters JSONB);

-- Create function
CREATE OR REPLACE FUNCTION public.auto_assign_task(p_auto_parameters JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_header_id UUID := (p_auto_parameters ->> 'task_header_id')::UUID;
  v_step_id UUID := (p_auto_parameters ->> 'step_id')::UUID;
  v_student_id UUID := (p_auto_parameters ->> 'student_id')::UUID;
  v_manager_id UUID := (p_auto_parameters ->> 'manager_id')::UUID;
  v_automation_id UUID := (p_auto_parameters ->> 'automation_id')::UUID;
  
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Validate required parameters
  IF v_task_header_id IS NULL OR v_student_id IS NULL OR v_step_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Missing required parameters: task, step or student'
    );
  END IF;

IF v_automation_id IS NULL THEN
  RETURN jsonb_build_object('status', 'error', 'message', 'automation_id required');
END IF;


  --1 Check if assignment already exists
  SELECT id INTO v_existing_id
  FROM task_assignments
  WHERE student_id = v_student_id
    AND task_header_id = v_task_header_id
    AND NOT COALESCE(is_deleted, false)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'ignored',
      'message', 'Task assignment already exists - skipped',
      'assignment_id', v_existing_id
    );
  END IF;

  --2 Insert new assignment
  INSERT INTO task_assignments (
    task_header_id,
    step_id,
    student_id,
    manager_id,
    assigned_by_automation
  ) VALUES (
    v_student_id,
    v_manager_id,
    v_task_header_id,
    v_step_id,
    v_automation_id
  )
  RETURNING id INTO v_new_id;

    -- 3. Return success
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Task assigned',
    'assignment_id', v_new_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'status', 'error',
    'message', format('Database error: %s', SQLERRM)
  );
END;
$$;