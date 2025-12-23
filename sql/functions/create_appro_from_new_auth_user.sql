create or replace function public.create_appro_from_new_auth_user_v2( appro_name text , appro_description text, appro_email text, auth_id uuid )
-- created  Dec 22 2025
returns uuid
language plpgsql
security definer
as $$
declare
  new_id uuid;
begin
  insert into app_profiles ( name , description, email, auth_user_id)
  values ( appro_name, appro_description, appro_email, auth_id)
  returning id into new_id;

  return new_id;
end;
$$;