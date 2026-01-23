--drop function automations_judge;
CREATE OR REPLACE FUNCTION public.automations_judge(
    p_my_auth_id UUID,
    p_my_appro_id UUID,
    p_my_task_id UUID,
    p_my_step_id UUID,
    p_my_survey_id UUID,
    p_my_survey_answer UUID,
    p_my_assignment_id UUID,
    p_my_automation_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_judgement JSONB;
    v_temp_id UUID;
    v_automation RECORD;
BEGIN
    -- 1. Check if user is logged in (auth.uid() matches p_my_auth_id)
    IF auth.uid() IS NULL OR auth.uid() != p_my_auth_id THEN
        RETURN jsonb_build_object('result', 'failed', 'reason', 'no login');
    END IF;

    -- 2. Validate approfile ID matches auth ID
    BEGIN
        SELECT id INTO v_temp_id
        FROM app_profiles
        WHERE id = p_my_appro_id AND auth_user_id = p_my_auth_id;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'wrong appro');
        END IF;
    END;

    -- 3. Validate assignment exists and matches context
    IF p_my_task_id IS NOT NULL THEN
        -- Task-based automation
        SELECT id INTO v_temp_id
        FROM task_assignments
        WHERE id = p_my_assignment_id
          AND student_id = p_my_appro_id
          AND task_header_id = p_my_task_id;
          
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'wrong task for assignment');
        END IF;

        -- Verify automation is linked to this step
        SELECT * INTO v_automation
        FROM automations
        WHERE id = p_my_automation_id
          --AND trigger_type = 'task_step' -- no such column
          AND task_header_id = p_my_task_id
          AND source_task_step_id = p_my_step_id;
          --AND is_deleted = false; 
        -- Check deletion status separately

        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'automation deleted');
        END IF;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'wrong step for automation');
        END IF;

    ELSEIF p_my_survey_id IS NOT NULL THEN
        -- Survey-based automation
        SELECT id INTO v_temp_id
        FROM task_assignments
        WHERE id = p_my_assignment_id
          AND student_id = p_my_appro_id
          AND survey_header_id = p_my_survey_id;
          
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'wrong survey for assignment');
        END IF;

        -- Verify automation is linked to this answer
        SELECT * INTO v_automation
        FROM automations
        WHERE id = p_my_automation_id
          --AND trigger_type = 'survey_answer'
          AND survey_header_id = p_my_survey_id
          AND survey_answer_id = p_my_survey_answer;
         -- AND is_deleted = false; 

        -- Check deletion status separately
        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'automation deleted');
        END IF;


        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'wrong survey or answer for automation');
        END IF;


    ELSE

        RETURN jsonb_build_object('result', 'failed', 'reason', 'missing task or survey context');
    END IF;

    -- 4. If we got here, validation passed
    RETURN jsonb_build_object('result', 'success', 'automation_name', v_automation.name, 'automation_id', v_automation.id);
END;
$$;