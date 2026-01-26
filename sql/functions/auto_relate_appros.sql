-- Drop if exists
--DROP FUNCTION IF EXISTS public.auto_relate_appros(JSONB);

-- Create function
CREATE OR REPLACE FUNCTION public.auto_relate_appros(p_auto_parameters JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
--autoParameters ={'appro_is_id':autoPetition.appro_id, 'relationship':payload.relationship, 'of_appro_id':payload.of_appro_id, 'automation_id':autoPetition.automation_id};

DECLARE
    v_appro_is_id UUID := (p_auto_parameters ->> 'appro_is_id')::UUID;
    v_relationship TEXT := p_auto_parameters ->> 'relationship';
    v_of_appro_id UUID := (p_auto_parameters ->> 'of_appro_id')::UUID;
    v_automation_id UUID := (p_auto_parameters ->> 'automation_id')::UUID;
    
    v_existing_id UUID;
    v_new_id UUID;
BEGIN
RAISE NOTICE 'p_auto_parameters = %', p_auto_parameters;


    -- Validate required parameters
    IF v_appro_is_id IS NULL OR v_relationship IS NULL OR v_of_appro_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Missing required parameters: appro_is_id, relationship, of_appro_id'
        );
    END IF;

    IF v_automation_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'automation_id required');
    END IF;

    --1 Check if relation already exists
    SELECT id INTO v_existing_id
    FROM approfile_relations
    WHERE approfile_is = v_appro_is_id
      AND relationship = v_relationship
      AND of_approfile = v_of_appro_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'status', 'ignored',
            'message', 'Relation already exists - skipped',
            'relation_id', v_existing_id
        );
    END IF;

    -- 2 Insert new relation
    INSERT INTO approfile_relations (
        approfile_is,
        relationship,
        of_approfile,
        assigned_by_automation
    ) VALUES (
        v_appro_is_id,
        v_relationship,
        v_of_appro_id,
        v_automation_id
    )
    RETURNING id INTO v_new_id;

    -- 3. Return success
    RETURN jsonb_build_object(
'source','auto_relate_appros.sql',
        'status', 'success',
        'message', 'Relation created',
        'relation_id', v_new_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', format('Database error: %s', SQLERRM)
    );
END;
$$;