create or replace function public.create_appro_from_new_auth_user_v2( name text , email text, description text,  p_user_id uuid )
-- created  Dec 22 2025
returns uuid
language plpgsql
security definer
as $$
declare
  new_id uuid;
begin
  insert into app_profiles ( name , description, email, auth_user_id)
  values ( name, description, email, p_user_id)
  returning id into new_id;

UPDATE temp_signups  --new 10:09  Jan 14
SET appro_created_at = NOW()
WHERE temp_signups.user_id = p_user_id
  AND appro_created_at IS NULL;


  return new_id;
end;
$$;