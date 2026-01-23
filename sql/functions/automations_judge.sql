--DROP FUNCTION IF EXISTS public.automations_judge(JSONB);

CREATE OR REPLACE FUNCTION public.automations_judge(p_context JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_id UUID := (p_context ->> 'auth_id')::UUID;
    v_appro_id UUID := (p_context ->> 'appro_id')::UUID;
    v_task_id UUID := (p_context ->> 'task_id')::UUID;
    v_step_id UUID := (p_context ->> 'step_id')::UUID;
    v_survey_id UUID := (p_context ->> 'survey_id')::UUID; --should be source survey
    v_survey_answer_id UUID := (p_context ->> 'survey_answer_id')::UUID;
    v_assignment_id UUID := (p_context ->> 'assignment_id')::UUID;
    v_automation_id UUID := (p_context ->> 'automation_id')::UUID;

    v_temp_id UUID;
    v_automation RECORD;
BEGIN
--why are we getting weird results?? test 22:41 Jan 18
IF v_survey_id IS NULL OR v_assignment_id IS NULL OR v_appro_id IS NULL THEN
  RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: Missing or invalid context');
END IF;

--RAISE NOTICE '🔍 JUDGE = %', p_context;

    -- 1. Check if user is logged in
    IF auth.uid() IS NULL OR auth.uid() != v_auth_id THEN
        RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: no login');
    END IF;

    -- 2. Validate approfile matches auth ID
    BEGIN
        SELECT id INTO v_temp_id
        FROM app_profiles
        WHERE id = v_appro_id AND auth_user_id = v_auth_id;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: wrong appro');
        END IF;
    END;

    -- 3. Validate assignment and automation context
    IF v_task_id IS NOT NULL THEN
        -- Task-based automation
        SELECT id INTO v_temp_id
        FROM task_assignments
        WHERE id = v_assignment_id
          AND student_id = v_appro_id
          AND task_header_id = v_task_id;
          
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: wrong task for assignment');
        END IF;

        -- Verify automation is linked to this step
        SELECT * INTO v_automation
        FROM automations
        WHERE id = v_automation_id
          AND task_header_id = v_task_id
          AND source_task_step_id = v_step_id;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: wrong step for automation');
        END IF;

        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: automation deleted');
        END IF;

    ELSIF v_survey_id IS NOT NULL THEN
        -- Survey-based automation
        SELECT id INTO v_temp_id
        FROM task_assignments  -- ← reminder there is no 'survey_assignments' table 
        WHERE id = v_assignment_id
          AND student_id = v_appro_id
          AND survey_header_id = v_survey_id;
          
        IF NOT FOUND THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: wrong survey for assignment');
  
  
        END IF;

        -- Verify automation is linked to this answer
        SELECT * INTO v_automation
        FROM automations
        WHERE id = v_automation_id
          AND survey_header_id = v_survey_id
          AND survey_answer_id = v_survey_answer_id;

        IF NOT FOUND THEN
--            RETURN jsonb_build_object('result', 'failed', 'reason', 'judge: wrong survey or answer for automation');
  RETURN jsonb_build_object(
  'result', 'failed',
  'reason',
    format(
      'wrong survey for assignment (survey=%s, answer=%s, automation=%s)',
      v_survey_id,
      v_survey_answer_id,
      v_automation_id
    )
);

  
        END IF;

        IF v_automation.is_deleted THEN
            RETURN jsonb_build_object('result', 'failed', 'reason', 'automation deleted');
        END IF;

    ELSE
        RETURN jsonb_build_object('result', 'failed', 'reason', 'missing task or survey context');
    END IF;

    -- 4. Success
    RETURN jsonb_build_object(
        'result', 'success',
        'automation_name', v_automation.name,
        'automation_id', v_automation.id
    );
END;
$$;