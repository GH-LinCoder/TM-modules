-- In Supabase SQL Editor or migration file

CREATE OR REPLACE FUNCTION public.update_assignment(
    p_assignment_id uuid,
    p_step integer DEFAULT NULL,           -- Question number (stored in 'step' column)
    p_completed boolean DEFAULT NULL,      -- If true, set completed_at = now()
    p_abandoned boolean DEFAULT NULL       -- If true, set abandoned_at = now()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_fields jsonb := '{}'::jsonb;
BEGIN
    -- ✅ Validate: mutually exclusive parameters
    IF (p_completed = true AND p_abandoned = true) THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Cannot mark assignment as both completed and abandoned'
        );
    END IF;
    
    IF (p_step IS NOT NULL AND p_completed = true) THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Cannot update step and mark completed in same call'
        );
    END IF;
    
    IF (p_step IS NOT NULL AND p_abandoned = true) THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Cannot update step and mark abandoned in same call'
        );
    END IF;
    
    -- ✅ Validate: at least one field must be provided
    IF p_step IS NULL AND p_completed IS NULL AND p_abandoned IS NULL THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'At least one update field (step, completed, or abandoned) must be provided'
        );
    END IF;

    -- ✅ Update step (question number) if provided
    IF p_step IS NOT NULL THEN
        UPDATE assignments
        SET step = p_step
        WHERE id = p_assignment_id;
        v_updated_fields := v_updated_fields || jsonb_build_object('step', p_step);
    END IF;

    -- ✅ Update completed_at if flag is true
    IF p_completed = true THEN
        UPDATE assignments
        SET completed_at = now()
        WHERE id = p_assignment_id;
        v_updated_fields := v_updated_fields || jsonb_build_object('completed_at', now());
    END IF;

    -- ✅ Update abandoned_at if flag is true
    IF p_abandoned = true THEN
        UPDATE assignments
        SET abandoned_at = now()
        WHERE id = p_assignment_id;
        v_updated_fields := v_updated_fields || jsonb_build_object('abandoned_at', now());
    END IF;

    -- ✅ Return success with updated fields
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

-- Grant execute permission (adjust role as needed)
GRANT EXECUTE ON FUNCTION public.update_assignment(uuid, integer, boolean, boolean) TO authenticated;