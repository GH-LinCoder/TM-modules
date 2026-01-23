--not implemented as at Jan 14 2026


CREATE OR REPLACE FUNCTION public.get_last_login(p_auth_id uuid)
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT last_sign_in_at
  FROM users
  WHERE id = p_auth_id;
$$;
