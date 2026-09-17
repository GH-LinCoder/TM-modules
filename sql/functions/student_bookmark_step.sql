CREATE OR REPLACE FUNCTION public.student_bookmark_step(
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
    v_acting_appro_id UUID;
    v_updated_fields JSONB := '{}'::jsonb;
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
        a.move_by::TEXT
    INTO 
        v_actual_student_id,      
        v_actual_current_step, 
        v_move_by
    FROM assignments a
    WHERE a.id = p_assignment_id;

    IF v_actual_current_step IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Assignment not found');
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

    -- 5. BUSINESS RULE: Ensure task allows student movement
    IF v_move_by != 'student' THEN
        RETURN json_build_object(
            'status', 'error', 
            'message', 'Cannot bookmark: Assignment move mode is set to ' || COALESCE(v_move_by, 'non-student')
        );
    END IF;

    -- 6. UNCHANGED STEP CHECK: Return error condition if step hasn't changed
    IF v_actual_current_step = p_current_step THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Current step unchanged. The student is already on step ' || p_current_step,
            'assignment_id', p_assignment_id
        );
    END IF;

    -- 7. Execute update
    UPDATE assignments
    SET 
        current_step = p_current_step,
        abandoned_at = CASE WHEN p_current_step = 1 THEN NOW() ELSE abandoned_at END,
        completed_at = CASE WHEN p_current_step = 2 THEN NOW() ELSE completed_at END
    WHERE id = p_assignment_id;

    -- 8. Build success response payload
    v_updated_fields := jsonb_build_object('current_step', p_current_step);
    
    IF p_current_step = 1 THEN
        v_updated_fields := v_updated_fields || jsonb_build_object('abandoned_at', NOW());
    ELSIF p_current_step = 2 THEN
        v_updated_fields := v_updated_fields || jsonb_build_object('completed_at', NOW());
    END IF;

    RETURN json_build_object(
        'status', 'success',
        'assignment_id', p_assignment_id,
        'updated_fields', v_updated_fields
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$;