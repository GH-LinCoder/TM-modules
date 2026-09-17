CREATE OR REPLACE FUNCTION manager_move_student_in_assignment(
  p_student_id UUID,     -- the 'person' on the task (could be any appro)     
  p_assignment_id UUID,  -- the row in the assignments table
  p_current_step INT,    -- where the database says the student is currently
  p_target_step INT,     -- where the user wants the student to move to
  p_manager_role TEXT,   -- whether the user is a manager of this task
  p_task_header_id UUID, -- which task
  p_user_id UUID         -- The auth ID of the user making the request (from auth.uid())
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actual_current_step INT;
  v_actual_task_header_id UUID;
  v_actual_student_id UUID;   
  v_assigned_manager_id UUID;
  v_default_manager_id UUID;
  v_author_id UUID;
  v_appro_id UUID;

  v_is_manager BOOLEAN := FALSE;
  v_is_admin BOOLEAN := FALSE; 
BEGIN
  -- 1. Fetch the current state of the assignment and its parent task
  SELECT 
    a.student_id,             
    a.current_step,
    (a.assignment->>'task_header_id')::UUID, 
    a.manager_id,                            
    t.default_manager_id,
    t.author_id
  INTO 
    v_actual_student_id,      
    v_actual_current_step, 
    v_actual_task_header_id, 
    v_assigned_manager_id, 
    v_default_manager_id, 
    v_author_id
  FROM assignments a
  LEFT JOIN task_headers t ON (a.assignment->>'task_header_id')::UUID = t.id
  WHERE a.id = p_assignment_id;

  -- 2. Verify the assignment exists
  IF v_actual_current_step IS NULL THEN
    RAISE EXCEPTION 'Assignment current_step not found';
  END IF;

  -- 3. PREVENT SPOOFING: Verify the student_id matches the assignment
  IF v_actual_student_id != p_student_id THEN
    RAISE EXCEPTION 'Student ID mismatch. Payload may have been tampered with.';
  END IF;

  -- 4. Prevent Race Conditions: Verify the current step matches what the client thinks it is
  IF v_actual_current_step != p_current_step THEN
    RAISE EXCEPTION 'Current step mismatch. The student may have already been moved by someone else.';
  END IF;

  -- 5. Prevent Spoofing: Verify the task_header_id matches the assignment
  IF v_actual_task_header_id != p_task_header_id THEN
    RAISE EXCEPTION 'Task header ID mismatch.';
  END IF;

  -- 6. Find the user's appro id

  SELECT id INTO v_appro_id 
  FROM app_profiles 
  WHERE auth_user_id = p_user_id 
  LIMIT 1;

  IF v_appro_id IS NULL THEN
    RAISE EXCEPTION 'Could not determine appro_id for the acting user.';
  END IF;



  --7 AUTHORIZATION CHECK: Is the requesting user allowed to make this move?
  IF p_manager_role = 'assigned' AND v_assigned_manager_id = v_appro_id THEN
    v_is_manager := TRUE;
  ELSIF p_manager_role = 'default' AND v_default_manager_id = v_appro_id THEN
    v_is_manager := TRUE;
  ELSIF p_manager_role = 'author' AND v_author_id = v_appro_id THEN
    v_is_manager := TRUE;
  END IF;

  IF NOT v_is_manager THEN
      RAISE EXCEPTION 'Unauthorized: You do not have permission to move this student. Role provided: %', p_manager_role;
  END IF;



  -- 8. BUSINESS LOGIC CHECK: Managers can only advance one step at a time
  --    Only apply the "+1 step" rule if the user is a manager
  --    (When v_is_admin is implemented, admins will be allowed to bypass this and jump steps)
  IF v_is_manager AND p_target_step != p_current_step + 1 THEN
    RAISE EXCEPTION 'Invalid move: Managers can only advance students one step at a time.';
  END IF;

  -- 9. PERFORM THE UPDATE
 UPDATE assignments
  SET 
    current_step = p_target_step,
    moved_at = NOW(),
    move_me_at = NULL,             -- Clear the pending request flag
    moved_by = v_appro_id          -- Record which person approved the move
  WHERE id = p_assignment_id;

  -- 10. Return success payload to the client
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Student successfully moved to step ' || p_target_step,
    'assignment_id', p_assignment_id,
    'from_old_step', p_current_step
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'RPC failed: %', SQLERRM;
END;
$$;