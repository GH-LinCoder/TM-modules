--drop function get_appro_from_auth;
CREATE OR REPLACE FUNCTION get_appro_from_auth(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appro_id UUID;
BEGIN
  SELECT id INTO v_appro_id
  FROM app_profiles
  WHERE auth_user_id = p_user_id;

  RETURN v_appro_id;  -- returns UUID or NULL
END;
$$;
