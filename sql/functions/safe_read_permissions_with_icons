CREATE OR REPLACE FUNCTION public.safe_read_permissions_with_icons(p_target_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
    v_is_rels jsonb;
    v_of_rels jsonb;
    v_ids uuid[];
    v_profile_map jsonb := '{}'::jsonb;
    v_rec record;
    v_icon text;
BEGIN
    -- 1. Security Check: Can the caller even see these relations?
    IF NOT is_permitted('permission_relations', p_target_id, 'SELECT', jsonb_build_object('approfile_is', p_target_id)) THEN
        RAISE EXCEPTION 'Not permitted to read these permissions';
    END IF;

    -- 2. Fetch "IS" relations
    SELECT jsonb_agg(r) INTO v_is_rels 
    FROM permission_relations_view r 
    WHERE r.approfile_is = p_target_id;

    -- 3. Fetch "OF" relations
    SELECT jsonb_agg(r) INTO v_of_rels 
    FROM permission_relations_view r 
    WHERE r.of_approfile = p_target_id;

    -- 4. Collect all IDs for the Icon Map (Subject + related partners)
    SELECT array_agg(DISTINCT id) INTO v_ids
    FROM (
        SELECT p_target_id as id
        UNION
        SELECT (jsonb_array_elements(COALESCE(v_is_rels, '[]'::jsonb))->>'of_approfile')::uuid
        UNION
        SELECT (jsonb_array_elements(COALESCE(v_of_rels, '[]'::jsonb))->>'approfile_is')::uuid
    ) sub;

    -- 5. Build the Profile Map (The Icon Logic)
    FOR v_rec IN 
        SELECT id, auth_user_id, survey_header_id, task_header_id 
        FROM app_profiles 
        WHERE id = ANY(v_ids)
    LOOP
        IF v_rec.auth_user_id IS NOT NULL THEN v_icon := '👥';
        ELSIF v_rec.survey_header_id IS NOT NULL THEN v_icon := '📜';
        ELSIF v_rec.task_header_id IS NOT NULL THEN v_icon := '🔧';
        ELSE v_icon := '🎭';
        END IF;
        
        v_profile_map := v_profile_map || jsonb_build_object(v_rec.id, v_icon);
    END LOOP;

    -- 6. Return the exact structure the JS expects
    RETURN jsonb_build_object(
        'is', COALESCE(v_is_rels, '[]'::jsonb),
        'of', COALESCE(v_of_rels, '[]'::jsonb),
        'iconMap', v_profile_map
    );
END;
$$;