--DROP FUNCTION IF EXISTS public.auto_assign_survey(p_auto_parameters JSONB)

CREATE OR REPLACE FUNCTION public.auto_assign_survey(p_auto_parameters JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_survey_header_id UUID := (p_auto_parameters->>'survey_header_id');
    v_student_id UUID := (p_auto_parameters->>'student_id');
    v_automation_id UUID := (p_auto_parameters ->> 'automation_id')::UUID;

    v_existing UUID;

    v_new_id UUID;
BEGIN

  -- Validate required parameters
  IF v_survey_header_id IS NULL OR v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Missing required parameters: task, step or student'
    );
  END IF;

IF v_automation_id IS NULL THEN
  RETURN jsonb_build_object('status', 'error', 'message', 'automation_id required');
END IF;



    -- 1. Check for existing assignment (idempotency)
    SELECT id INTO v_existing
    FROM task_assignments
    WHERE student_id = v_student_id
      AND survey_header_id = v_survey_header_id
      AND NOT COALESCE(is_deleted, false)
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
        RETURN jsonb_build_object(
            'result', 'ignored',
            'reason', 'Survey assignment already exists - skipped',
            'assignment_id', v_existing
        );
    END IF;

    -- 2. Insert new assignment
    INSERT INTO task_assignments (
        survey_header_id, 
        student_id, 
        assigned_by_automation)
    VALUES (
        v_survey_header_id, 
        v_student_id, 
        v_automation_id)
    RETURNING id INTO v_new_id;

    -- 3. Return success
    RETURN jsonb_build_object(
        'result', 'success',
        'assignment_id', v_new_id
    );

    EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
    'status', 'error',
    'message', format('Database error: %s', SQLERRM)
  );


END;
$$;
