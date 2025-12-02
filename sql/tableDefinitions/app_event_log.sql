create table public.app_event_log (
  event_name text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  sort_int integer generated always as identity not null,
  source_table_name text null,
  source_row_id uuid null,
  event_i_u_d text null,
  description text null,
  constraint app_event_log_pkey primary key (sort_int)
) TABLESPACE pg_default;

create index IF not exists idx_event_log_created_at on public.app_event_log using btree (created_at desc) TABLESPACE pg_default;