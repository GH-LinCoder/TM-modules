create table public.survey_answers (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  automation boolean null,
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  survey_question_id uuid not null,
  answer_number integer not null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  is_deleted boolean null default false,
  constraint survey_answers_pkey primary key (id),
  constraint survey_answers_deleted_by_fkey foreign KEY (deleted_by) references app_profiles (id),
  constraint survey_answers_survey_question_id_fkey foreign KEY (survey_question_id) references survey_questions (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger log_app_event_survey_answers
after INSERT
or DELETE
or
update on survey_answers for EACH row
execute FUNCTION log_all_events ();