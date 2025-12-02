create table public.survey_questions (
  question_number integer not null,
  name text not null,
  description text null,
  automations boolean null,
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  id uuid not null default gen_random_uuid (),
  survey_header_id uuid not null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  is_deleted boolean null default false,
  constraint survey_questions_pkey primary key (id),
  constraint survey_questions_id_key1 unique (id),
  constraint survey_questions_deleted_by_fkey foreign KEY (deleted_by) references app_profiles (id),
  constraint survey_questions_survey_header_id_fkey foreign KEY (survey_header_id) references survey_headers (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger log_app_event_survey_questions
after INSERT
or DELETE
or
update on survey_questions for EACH row
execute FUNCTION log_all_events ();