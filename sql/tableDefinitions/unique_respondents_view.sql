create view public.unique_respondents as
select distinct
  ap.id as student_id,
  ap.name as student_name,
  ap.email
from
  task_assignments ta
  join app_profiles ap on ta.student_id = ap.id
where
  ta.survey_header_id is not null;