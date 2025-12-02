create table public.permission_user_cache (
  user_id uuid not null,
  granted_permissions text[] not null,
  created_at timestamp without time zone null default now(),
  expires_at timestamp without time zone null default (now() + '24:00:00'::interval),
  name text null,
  description text null,
  cache_version integer null,
  archived boolean not null default false,
  archived_at timestamp with time zone null,
  scope jsonb null,
  molecule text[] not null,
  constraint user_permissions_cache_pkey primary key (user_id)
) TABLESPACE pg_default;

create index IF not exists idx_user_permissions_gin on public.permission_user_cache using gin (granted_permissions) TABLESPACE pg_default;