create or replace function public.create_appro_from_new_auth_user( approName text , approDescription text, approEmail text, authId uuid )
-- created 18:47 Dec 20 2025
returns uuid
language plpgsql
security definer
as $$
declare
  new_id uuid;
begin
  insert into app_profiles ( name , description, email, auth_user_id)
  values ( approName, approDescription, approEmail, authId)
  returning id into new_id;

  return new_id;
end;
$$;
