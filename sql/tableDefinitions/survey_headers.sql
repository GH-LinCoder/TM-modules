create table public.survey_headers (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  author_id uuid null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  automations boolean null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  is_deleted boolean null default false,
  constraint survey_header_pkey primary key (id),
  constraint survey_header_name_key unique (name),
  constraint survey_header_author_id_fkey foreign KEY (author_id) references app_profiles (id) on update CASCADE on delete RESTRICT,
  constraint survey_headers_deleted_by_fkey foreign KEY (deleted_by) references app_profiles (id)
) TABLESPACE pg_default;

create trigger cascade_name_description
after
update OF name,
description on survey_headers for EACH row
execute FUNCTION sync_survey_headers_app_profiles ();

create trigger log_app_event_survey_headers
after INSERT
or DELETE
or
update on survey_headers for EACH row
execute FUNCTION log_all_events ();

create trigger new_survey_create_appro
after INSERT on survey_headers for EACH row
execute FUNCTION new_survey_headers_create_appro ();

create trigger new_survey_create_default_question_answer
after INSERT on survey_headers for EACH row
execute FUNCTION "new_survey_header_create_Q1_A1" ();