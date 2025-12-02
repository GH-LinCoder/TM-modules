create view public.unique_managers as
select distinct
  ap.id as manager_id,
  ap.name as manager_name,
  ap.email
from
  task_assignments ta
  join app_profiles ap on ta.manager_id = ap.id;