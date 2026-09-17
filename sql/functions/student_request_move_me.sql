CREATE OR REPLACE FUNCTION public.student_request_move_me(
    p_assignment_id UUID,
    p_current_step INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actual_student_id UUID;
    v_actual_current_step INT;
    v_move_by TEXT;
    v_move_me_at TIMESTAMP;
    v_acting_appro_id UUID;
    v_now TIMESTAMP := NOW();
BEGIN
    -- 1. Check for required parameters
    IF p_assignment_id IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Missing assignment ID');
    END IF;

    IF p_current_step IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Missing step number');
    END IF;

    -- 2. Fetch current assignment state directly from table columns
    SELECT 
        a.student_id,             
        a.current_step,
        a.move_by::TEXT,
        a.move_me_at
    INTO 
        v_actual_student_id,      
        v_actual_current_step, 
        v_move_by,
        v_move_me_at
    FROM assignments a
    WHERE a.id = p_assignment_id;

    IF v_actual_current_step IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Assignment not found');
    END IF;

    -- Check if move is already requested
    IF v_move_me_at IS NOT NULL THEN
        RETURN json_build_object(
            'status', 'error', 
            'message', 'Move already registered at ' || v_move_me_at::TEXT
        );
    END IF;

    -- 3. Get acting user's profile ID via authenticated session
    SELECT id INTO v_acting_appro_id 
    FROM app_profiles 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1;

    IF v_acting_appro_id IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Could not determine user profile');
    END IF;

    -- 4. AUTHORIZATION: Verify user is the assigned student
    IF v_acting_appro_id != v_actual_student_id THEN
        RETURN json_build_object('status', 'error', 'message', 'Unauthorized: You are not the student on this task');
    END IF;

    -- 5. BUSINESS RULE: Ensure task specifies manager movement
    IF v_move_by IS DISTINCT FROM 'manager' THEN
        RETURN json_build_object(
            'status', 'error', 
            'message', 'Cannot request move: Assignment move mode is set to: ' || COALESCE(v_move_by, 'undefined')
        );
    END IF;

    -- 6. CHANGED STEP CHECK: Return error condition if step is different
    IF v_actual_current_step != p_current_step THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Current step discrepancy. DB says student is on step ' || v_actual_current_step,
            'assignment_id', p_assignment_id
        );
    END IF;

    -- 7. Execute update
    UPDATE assignments
    SET move_me_at = v_now
    WHERE id = p_assignment_id;

    -- 8. Build success response payload
    RETURN json_build_object(
        'status', 'success',
        'assignment_id', p_assignment_id,
        'updated_fields', jsonb_build_object('move_me', v_now)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$;