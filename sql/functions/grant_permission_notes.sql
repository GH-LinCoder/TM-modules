--drop function grant_notes_permissions; --18:27 Jan 13
CREATE OR REPLACE FUNCTION public.grant_notes_permissions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path =  _internal, public, auth
AS $$

DECLARE
  v_approfile_id UUID;
BEGIN
  -- Get user's approfile
  SELECT id INTO v_approfile_id FROM app_profiles WHERE auth_user_id = p_user_id;
  IF v_approfile_id IS NULL THEN
    RAISE EXCEPTION 'User has no approfile';
  END IF;

-- grant permissions to use communication system 'notes' (idempotent)
  INSERT INTO permission_relations (approfile_is, relationship, of_approfile)
  VALUES 
    (v_approfile_id, '(]fetchNotes_SELECT[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]insertNote_INSERT[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]insertNote_SELECT[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]linkNoteToCategories_INSERT[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]readCategoryMap[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]reactToNoteClick[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]readNoteCategorised_SELECT[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203')

  ON CONFLICT DO NOTHING; -- Safe for re-runs

UPDATE public.temp_signups 
  SET grant_notes_at = now(),
      completed_at = now(), 
      description = 'Notes granted successfully. '
  WHERE user_id = p_user_id;

END;
$$;