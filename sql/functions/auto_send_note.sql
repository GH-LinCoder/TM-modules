--DROP FUNCTION IF EXISTS public.auto_send_note(p_auto_parameters JSONB)

CREATE OR REPLACE FUNCTION public.auto_send_note(p_auto_parameters JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_note_id UUID := (p_auto_parameters->>'note_id');
    v_author_id UUID := (p_auto_parameters->>'author_id');
    v_audience_id UUID := (p_auto_parameters->>'audience_id');
    v_automation_id UUID := (p_auto_parameters ->> 'automation_id')::UUID;

    v_content TEXT
    v_existing UUID;
    v_new_id UUID;
BEGIN

  -- Validate required parameters
  IF v_note_id IS NULL OR v_author_id IS NULL OR v_audience_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Missing required parameters: note, from or to'
    );
  END IF;

IF v_automation_id IS NULL THEN
  RETURN jsonb_build_object('status', 'error', 'message', 'automation_id required');
END IF;

-- 1a check if note exists --Also notes table needs the deleted columns
SELECT content INTO v_content
    FROM notes
    WHERE 
      note_id = v_note_id
      --AND NOT COALESCE(is_deleted, false)
    LIMIT 1;

    IF v_content IS NOT NULL THEN
        RETURN jsonb_build_object(
            'result', 'ignored',
            'reason', 'Note has no content - skipped',
            'assignment_id', v_existing
        );
    END IF;

    -- 1b. Check for existing assignment (idempotency)
    SELECT id INTO v_existing
    FROM notes
    WHERE audience_id = v_audience_id
      AND author_id = v_author_id
      AND content = v_content
     -- AND NOT COALESCE(is_deleted, false)
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
        RETURN jsonb_build_object(
            'result', 'ignored',
            'reason', 'Note assignment already exists - skipped',
            'assignment_id', v_existing
        );
    END IF;


    -- 2. Insert new note assignment
    INSERT INTO notes (
        note_id, 
        audience_id, 
        author_id,
        content,
        title
       -- assigned_by_automation)
    VALUES (
        v_note_id, 
        v_audience_id,
        v_author_id,
        V_content, 
        v_automation_id)
    RETURNING id INTO v_new_id;

    -- 3. Return success
    RETURN jsonb_build_object(
        'result', 'success',
        'note_id', v_new_id
    );

    EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
    'status', 'error',
    'message', format('Database error: %s', SQLERRM)
  );


END;
$$;
