create table public.permission_function_requires (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  molecule text[] not null,
  created_by uuid null,
  description text null,
  constraint permission_molecules_required_pkey primary key (id),
  constraint permission_molecules_required_created_by_fkey foreign KEY (created_by) references app_profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;