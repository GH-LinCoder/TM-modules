create table public.notes_status (
  id serial not null,
  author_id uuid not null,
  status_value text null,
  status_ordinal integer not null,
  status_name text not null,
  constraint notes_status_pkey primary key (id)
) TABLESPACE pg_default;