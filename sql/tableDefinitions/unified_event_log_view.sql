create view public.unified_event_log_view as
select
  app_event_log.created_at,
  app_event_log.sort_int,
  app_event_log.event_i_u_d,
  app_event_log.source_table_name,
  app_event_log.source_row_id,
  app_event_log.event_name,
  app_event_log.description,
  case
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'task_headers'::text then task_headers.name
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'task_steps'::text then task_steps.name
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'app_profiles'::text then app_profiles.name
    else app_event_log.event_name
  end as resolved_name,
  case
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'task_headers'::text then task_headers.description
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'app_profiles'::text then app_profiles.description
    when app_event_log.event_i_u_d is not null
    and app_event_log.source_table_name = 'task_steps'::text then task_steps.description
    else app_event_log.description
  end as resolved_description
from
  app_event_log
  left join task_headers on app_event_log.source_table_name = 'task_headers'::text
  and app_event_log.source_row_id = task_headers.id
  left join task_steps on app_event_log.source_table_name = 'task_steps'::text
  and app_event_log.source_row_id = task_steps.id
  left join app_profiles on app_event_log.source_table_name = 'app_profiles'::text
  and app_event_log.source_row_id = app_profiles.id;