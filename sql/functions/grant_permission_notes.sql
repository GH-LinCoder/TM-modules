--drop function grant_notes_permissions; --18:27 Jan 13
CREATE OR REPLACE FUNCTION public.grant_notes_permissions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  INSERT INTO approfile_relations (approfile_is, relationship, of_approfile)
  VALUES 
    (v_approfile_id, '(]fetchNotes[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]insertNote[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]readCategoryMap[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]linkNoteToCategories[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'),
    (v_approfile_id, '(]reactToNoteClick[)', 'dc8abfab-34b9-49ee-a334-9b6f5e5be203')

  ON CONFLICT DO NOTHING; -- Safe for re-runs

  UPDATE temp_signups
SET grant_notes_at = NOW()
WHERE user_id = p_user_id
  AND grant_notes_at IS NULL;

END;
$$;