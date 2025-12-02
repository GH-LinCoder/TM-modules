create table public.relationships (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  category text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  role_id uuid null,
  constraint relationships_pkey primary key (id),
  constraint relationships_name_key unique (name)
) TABLESPACE pg_default;

create trigger log_app_event_relationships
after INSERT
or DELETE
or
update on relationships for EACH row
execute FUNCTION log_all_events ();