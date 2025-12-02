create table public.automations (
  id uuid not null default gen_random_uuid (),
  task_step_id uuid null,
  survey_answer_id uuid null,
  name text null default '''unknown'''::text,
  description text null,
  task_header_id uuid null,
  student_id uuid null,
  from_step integer null,
  to_step integer null,
  appro_is_id uuid null,
  relationship text null,
  of_appro_id uuid null,
  appro_relations_id uuid null,
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  automation_number integer null,
  source_task_step_id uuid null,
  manager_id uuid null,
  task_assignment_id uuid null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  is_deleted boolean null default false,
  survey_header_id uuid null,
  message_to_id uuid null,
  message_from_id uuid null,
  message_text uuid null,
  constraint automations_pkey primary key (id),
  constraint automations_appro_relations_id_fkey foreign KEY (appro_relations_id) references approfile_relations (id) on update CASCADE on delete CASCADE,
  constraint automations_deleted_by_fkey foreign KEY (deleted_by) references app_profiles (id),
  constraint automations_manager_id_fkey foreign KEY (manager_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_message_from_id_fkey foreign KEY (message_from_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_message_to_id_fkey foreign KEY (message_to_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_of_appro_id_fkey foreign KEY (of_appro_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_relationship_fkey foreign KEY (relationship) references relationships (name) on update CASCADE on delete CASCADE,
  constraint automations_source_task_step_id_fkey foreign KEY (source_task_step_id) references task_steps (id) on update CASCADE on delete CASCADE,
  constraint automations_student_id_fkey foreign KEY (student_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_survey_answer_id_fkey foreign KEY (survey_answer_id) references survey_answers (id) on update CASCADE on delete CASCADE,
  constraint automations_survey_header_id_fkey foreign KEY (survey_header_id) references survey_headers (id) on update CASCADE on delete CASCADE,
  constraint automations_task_assignment_id_fkey foreign KEY (task_assignment_id) references task_assignments (id) on update CASCADE on delete CASCADE,
  constraint automations_task_header_id_fkey foreign KEY (task_header_id) references task_headers (id) on update CASCADE on delete CASCADE,
  constraint automations_appro_is_id_fkey foreign KEY (appro_is_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_task_step_id_fkey foreign KEY (task_step_id) references task_steps (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger log_app_event_automations
after INSERT
or DELETE
or
update on automations for EACH row
execute FUNCTION log_all_events ();