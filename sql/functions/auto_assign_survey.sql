-- Drop if exists
DROP FUNCTION IF EXISTS public.auto_assign_survey(p_auto_parameters JSONB);

-- Create function
CREATE OR REPLACE FUNCTION public.auto_assign_survey(p_auto_parameters JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_survey_header_id UUID := (p_auto_parameters ->> 'survey_header_id')::UUID;
  v_student_id UUID := (p_auto_parameters ->> 'student_id')::UUID;
  v_automation_id UUID := (p_auto_parameters ->> 'automation_id')::UUID;
  
  v_existing_id UUID;
  v_new_id UUID;
  v_student_name TEXT;
BEGIN
  -- Validate required parameters
  IF v_survey_header_id IS NULL OR v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'source', 'auto_assign_survey',
      'message', 'Missing required parameters: survey_header_id or student_id'
    );
  END IF;

  IF v_automation_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'source', 'auto_assign_survey',
      'message', 'automation_id required'
    );
  END IF;

  -- Get student name for foreign key constraint
  SELECT name INTO v_student_name
  FROM app_profiles
  WHERE id = v_student_id;
  
  IF v_student_name IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'source', 'auto_assign_survey',
      'message', 'Student not found',
      'student_id', v_student_id
    );
  END IF;

  -- 1. Check if assignment already exists
  SELECT id INTO v_existing_id
  FROM assignments
  WHERE student_id = v_student_id
    AND assignment_type = 'survey'
    AND assignment->>'survey_header' = v_survey_header_id::TEXT
    AND NOT COALESCE(is_deleted, false)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'ignored',
      'source', 'auto_assign_survey',
      'message', 'Survey assignment already exists - skipped',
      'assignment_id', v_existing_id
    );
  END IF;

  -- 2. Insert new assignment
  INSERT INTO assignments (
    student_id,
    student_name,
    assignment_type,
    assignment,
    assigned_by_automation
  ) VALUES (
    v_student_id,
    v_student_name,
    'survey',
    jsonb_build_object(
      'survey_header', v_survey_header_id
    ),
    v_automation_id
  )
  RETURNING id INTO v_new_id;

  -- 3. Return success
  RETURN jsonb_build_object(
    'status', 'success',
    'source', 'auto_assign_survey',
    'message', 'Survey assigned',
    'assignment_id', v_new_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'status', 'error',
    'source', 'auto_assign_survey',
    'message', format('Database error: %s', SQLERRM)
  );
END;
$$;