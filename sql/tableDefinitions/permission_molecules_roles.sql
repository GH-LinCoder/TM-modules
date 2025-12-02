create table public.permission_molecule_roles (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  molecule text[] not null,
  created_by uuid null,
  description text null,
  petition json null,
  relationship uuid null,
  constraint permission_molecule_roles_pkey primary key (id),
  constraint permission_molecule_roles_created_by_fkey foreign KEY (created_by) references app_profiles (id)
) TABLESPACE pg_default;