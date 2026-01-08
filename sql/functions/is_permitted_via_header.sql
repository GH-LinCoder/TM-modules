--bridge bwteen RLS and is_permitted. Put on db 19:34 Jan 2 2026

CREATE OR REPLACE FUNCTION public.is_permitted_via_header(row_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_function_name text;
  v_user_id uuid;
BEGIN
  -- Read the function name from the header
  v_function_name := current_setting('request.headers.function_name', true);

  -- If no header, deny
  IF v_function_name IS NULL OR v_function_name = '' THEN
    RETURN FALSE;
  END IF;

  -- Get the authenticated user
  v_user_id := auth.uid();

  -- Delegate to your existing permission engine
  RETURN public.is_permitted(v_function_name, v_user_id, row_id);
END;
$$;
