CREATE OR REPLACE FUNCTION public.safe_grant_bundle_permissions(p_permissions jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = _internal, public, auth
SET row_security = off
AS $$
DECLARE
  v_item jsonb;
  v_approfile_is uuid;
  v_of_approfile uuid;
  v_relationship text;
  v_assigned_from_bundle uuid;
  v_inserted boolean;
  v_count integer := 0;
  v_failed jsonb := '[]'::jsonb;
  v_hint jsonb;
BEGIN
  IF p_permissions IS NULL OR jsonb_typeof(p_permissions) <> 'array' OR jsonb_array_length(p_permissions) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'granted', 0,
      'failed', jsonb_build_array(jsonb_build_object('error', 'No permission rows supplied'))
    );
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_permissions) AS item(value)
  LOOP
    BEGIN
      v_approfile_is := (v_item->>'approfile_is')::uuid;
      v_of_approfile := (v_item->>'of_approfile')::uuid;
      v_relationship := v_item->>'relationship';
      v_assigned_from_bundle := (v_item->>'assigned_from_bundle')::uuid;

      IF v_approfile_is IS NULL OR v_of_approfile IS NULL OR v_relationship IS NULL THEN
        RAISE EXCEPTION 'Permission row is missing approfile_is, relationship, or of_approfile';
      END IF;

      IF v_assigned_from_bundle IS NULL THEN
        RAISE EXCEPTION 'Permission row is missing assigned_from_bundle';
      END IF;

      IF is_permitted(
        'permission_relations',
        v_approfile_is,
        'INSERT',
        jsonb_build_object(
          'approfile_is', v_approfile_is,
          'relationship', v_relationship,
          'of_approfile', v_of_approfile
        )
      ) THEN
        v_inserted := false;

        INSERT INTO permission_relations (
          approfile_is,
          relationship,
          of_approfile,
          assigned_from_bundle
        )
        VALUES (
          v_approfile_is,
          v_relationship,
          v_of_approfile,
          v_assigned_from_bundle
        )
        ON CONFLICT (approfile_is, relationship, of_approfile)
        DO NOTHING
        RETURNING true INTO v_inserted;

        IF v_inserted THEN
          v_count := v_count + 1;
        END IF;
      ELSE
        v_hint := permission_denial_hint('permission_relations', 'INSERT');
        v_failed := v_failed || jsonb_build_array(
          jsonb_build_object('row', v_item, 'hint', v_hint)
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed || jsonb_build_array(
        jsonb_build_object('row', v_item, 'error', SQLERRM)
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', jsonb_array_length(v_failed) = 0,
    'granted', v_count,
    'failed', v_failed
  );
END;
$$;
