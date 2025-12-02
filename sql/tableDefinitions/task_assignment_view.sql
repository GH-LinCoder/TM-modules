create view public.task_assignment_view as
select
  ta.id as assignment_id,
  ta.task_header_id,
  th.name as task_name,
  th.description as task_description,
  ta.student_id,
  student.name as student_name,
  ta.manager_id,
  manager.name as manager_name,
  ta.step_id,
  ts.step_order,
  ts.name as step_name,
  ts.description as step_description,
  ta.assigned_at,
  ta.completed_at,
  ta.abandoned_at,
  th.external_url as task_external_url
from
  task_assignments ta
  join task_headers th on ta.task_header_id = th.id
  join app_profiles student on ta.student_id = student.id
  join app_profiles manager on ta.manager_id = manager.id
  join task_steps ts on ta.step_id = ts.id;