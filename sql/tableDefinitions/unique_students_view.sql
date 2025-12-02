create view public.unique_students as
select distinct
  ap.id as student_id,
  ap.name as student_name,
  ap.email
from
  task_assignments ta
  join app_profiles ap on ta.student_id = ap.id
where
  ta.task_header_id is not null;