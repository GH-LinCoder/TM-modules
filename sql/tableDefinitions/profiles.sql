create table public.profiles (
  id uuid not null,
  email text null,
  username text null,
  full_name text null,
  avatar_url text null,
  website text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null,
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

create trigger cascade_profiles_updates
after
update on profiles for EACH row
execute FUNCTION sync_app_profiles_from_profiles ();

create trigger "junk_cals-empty_function"
after INSERT on profiles for EACH row
execute FUNCTION new_auth_user_create_appro ();