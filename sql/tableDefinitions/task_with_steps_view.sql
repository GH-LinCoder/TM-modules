create view public.task_with_steps_view as
select
  th.id as task_id,
  th.name as task_name,
  ts.id as step_id,
  ts.step_order,
  ts.description as step_description,
  ts.name as step_name
from
  task_headers th
  join task_steps ts on ts.task_header_id = th.id;