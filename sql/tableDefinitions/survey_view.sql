create view public.survey_view as
select
  sh.id as survey_id,
  sh.name as survey_name,
  sh.description as survey_description,
  sh.author_id,
  sh.created_at as survey_created_at,
  sq.id as question_id,
  sq.name as question_text,
  sq.description as question_description,
  sq.question_number,
  sa.id as answer_id,
  sa.name as answer_text,
  sa.description as answer_description,
  sa.answer_number,
  a.id as automation_id,
  a.name as automation_name,
  a.automation_number,
  a.task_header_id,
  a.relationship,
  a.appro_is_id,
  a.of_appro_id,
  a.task_step_id,
  ap_is.name as appro_is_name,
  ap_of.name as of_appro_name,
  a.deleted_at
from
  survey_headers sh
  join survey_questions sq on sh.id = sq.survey_header_id
  left join survey_answers sa on sq.id = sa.survey_question_id
  left join automations a on sa.id = a.survey_answer_id
  left join app_profiles ap_is on ap_is.id = a.appro_is_id
  left join app_profiles ap_of on ap_of.id = a.of_appro_id
order by
  sh.id,
  sq.question_number,
  sa.answer_number,
  a.automation_number;