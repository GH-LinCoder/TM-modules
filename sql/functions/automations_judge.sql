CREATE OR REPLACE FUNCTION public.automations_judge(p_context JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_id UUID := (p_context ->> 'auth_id')::UUID;
    v_appro_id UUID := (p_context ->> 'appro_id')::UUID;
    v_assignment_id UUID := (p_context ->> 'assignment_id')::UUID;
    v_automation_id UUID := (p_context ->> 'automation_id')::UUID;

    -- Extracted from assignment JSON
    v_task_header_id UUID;
    v_step_id UUID;
    v_survey_header_id UUID;

    v_survey_answer_id UUID := (p_context ->> 'survey_answer_id')::UUID;

    v_assignment RECORD;
    v_automation RECORD;
BEGIN
    ----------------------------------------------------------------------
    -- 0. Load the assignment row
    ----------------------------------------------------------------------
    SELECT *
    INTO v_assignment
    FROM assignments
    WHERE id = v_assignment_id
      AND is_deleted IS NOT TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'result','failed',
            'reason','judge: assignment not found',
            'assignment_id', v_assignment_id
        );
    END IF;

    ----------------------------------------------------------------------
    -- Extract task/survey identity from assignment JSON
    ----------------------------------------------------------------------
    v_task_header_id := (v_assignment.assignment ->> 'task_header')::UUID;
    v_step_id        := (v_assignment.assignment ->> 'step_id')::UUID;
    v_survey_header_id := (v_assignment.assignment ->> 'survey_header')::UUID;

    ----------------------------------------------------------------------
    -- 1. Validate login
    ----------------------------------------------------------------------
    IF auth.uid() IS NULL OR auth.uid() != v_auth_id THEN
        RETURN jsonb_build_object('result','failed','reason','judge: no login');
    END IF;

    ----------------------------------------------------------------------
    -- 2. Validate approfile matches auth ID
    ----------------------------------------------------------------------
    PERFORM 1
    FROM app_profiles
    WHERE id = v_appro_id
      AND auth_user_id = v_auth_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('result','failed','reason','judge: wrong appro', 'appro_id',v_appro_id);
    END IF;

    ----------------------------------------------------------------------
    -- 3. Validate assignment belongs to this appro
    ----------------------------------------------------------------------
    IF v_assignment.student_id != v_appro_id THEN
        RETURN jsonb_build_object(
            'result','failed',
            'reason','judge: assignment does not belong to appro',
            'assignment_student', v_assignment.student_id,
            'appro_id', v_appro_id
        );
    END IF;

    ----------------------------------------------------------------------
    -- 4. Branch: Task-based or Survey-based?
    ----------------------------------------------------------------------
    IF v_task_header_id IS NOT NULL THEN
        ------------------------------------------------------------------
        -- TASK-BASED AUTOMATION
        ------------------------------------------------------------------

        -- Validate automation linkage
        SELECT *
        INTO v_automation
        FROM automations
        WHERE id = v_automation_id
          AND source_data ->> 'header' = v_task_header_id::text
          AND source_data ->> 'secondary' = v_step_id::text;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'result','failed',
                'reason','judge: wrong task or step for automation',
                'v_automation_id',v_automation_id,
                'task_header', v_task_header_id,
                'step_id', v_step_id
            );
        END IF;

        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result','failed','reason','judge: automation deleted');
        END IF;

    ELSIF v_survey_header_id IS NOT NULL THEN
        ------------------------------------------------------------------
        -- SURVEY-BASED AUTOMATION
        ------------------------------------------------------------------

        -- Validate automation linkage
        SELECT *
        INTO v_automation
        FROM automations
        WHERE id = v_automation_id
          AND source_data ->> 'header' = v_survey_header_id::text
          AND source_data ->> 'tertiary' = v_survey_answer_id::text;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'result','failed',
                'reason',
                    format(
                        'judge: wrong survey or answer for automation (survey=%s, answer=%s, automation=%s)',
                        v_survey_header_id,
                        v_survey_answer_id,
                        v_automation_id
                    )
            );
        END IF;

        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result','failed','reason','judge: automation deleted');
        END IF;

    ELSE
        RETURN jsonb_build_object(
            'result','failed',
            'reason','judge: assignment has neither task nor survey identity'
        );
    END IF;

    ----------------------------------------------------------------------
    -- 5. Success
    ----------------------------------------------------------------------
    RETURN jsonb_build_object(
        'result','success',
        'automation_name', v_automation.name,
        'automation_id', v_automation.id
    );
END;
$$;
