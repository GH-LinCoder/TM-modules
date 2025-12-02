create view public.unique_authors as
select distinct
  ap.id as author_id,
  ap.name as author_name,
  ap.email
from
  task_headers th
  join app_profiles ap on th.author_id = ap.id;