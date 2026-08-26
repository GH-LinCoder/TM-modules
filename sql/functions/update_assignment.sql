--Bookmark a step or question. Also update if completed or abandoned
CREATE OR REPLACE FUNCTION public.update_assignment_step(
    p_assignment_id uuid,
    p_bookmark integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_fields jsonb := '{}'::jsonb;
BEGIN
    -- 1. Check for required parameters
    IF p_assignment_id IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Missing assignment id');
    END IF;

    IF p_bookmark IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Missing bookmark number');
    END IF;

    -- 2. Single, efficient UPDATE statement
    UPDATE assignments
    SET 
        current_step = p_bookmark,
        abandoned_at = CASE WHEN p_bookmark = 1 THEN now() ELSE abandoned_at END,
        completed_at = CASE WHEN p_bookmark = 2 THEN now() ELSE completed_at END
    WHERE id = p_assignment_id; -- ✅ Corrected to use 'id'

    -- 3. Check if the row actually existed and was updated
    IF NOT FOUND THEN
        RETURN json_build_object('status', 'error', 'message', 'Assignment not found');
    END IF;

    -- 4. Build the success response
    v_updated_fields := jsonb_build_object('current_step', p_bookmark);
    
    IF p_bookmark = 1 THEN
        v_updated_fields := v_updated_fields || jsonb_build_object('abandoned_at', 'now()');
    ELSIF p_bookmark = 2 THEN
        v_updated_fields := v_updated_fields || jsonb_build_object('completed_at', 'now()');
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