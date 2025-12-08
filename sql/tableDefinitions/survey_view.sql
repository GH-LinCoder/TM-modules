create view public.survey_view as
select
  sh.id as survey_id,
  sh.name as survey_name,
  sh.description as survey_description,
  sh.author_id as survey_author_id,
  sh.created_at as survey_created_at,

  sq.id as question_id,
  sq.name as question_name,
  sq.description as question_description,
  sq.question_number,

  sa.id as answer_id,
  sa.name as answer_name,
  sa.description as answer_description,
  sa.answer_number,

  a.id as auto_id,
  a.name as auto_name,
  a.automation_number as auto_number,
  a.deleted_at as auto_deleted_at,
  
  a.task_header_id as target_task_header_id,
  a.task_step_id as target_task_step_id,
  th.name as target_task_name,

  a.survey_header_id as target_survey_header_id,
  sh2.name as target_survey_name, 

  a.relationship as target_relationship,
  a.appro_is_id as target_appro_is_id,
  a.of_appro_id as target_of_appro_id,
  
  ap_is.name as target_appro_is_name,
  ap_of.name as target_of_appro_name


from
  survey_headers sh
  join survey_questions sq on sh.id = sq.survey_header_id
  left join survey_answers sa on sq.id = sa.survey_question_id
  left join automations a on sa.id = a.survey_answer_id
  left join app_profiles ap_is on ap_is.id = a.appro_is_id
  left join app_profiles ap_of on ap_of.id = a.of_appro_id
  left join survey_headers sh2 on sh2.id = a.survey_header_id
  left join task_headers th on th.id = a.task_header_id
  
order by
  sh.id,
  sq.question_number,
  sa.answer_number,
  a.automation_number;