CREATE OR REPLACE FUNCTION refresh_app_profiles()
RETURNS void AS $$
BEGIN
  -- Log task-linked discrepancies
  INSERT INTO app_event_log (event_name, source_table_name, source_row_id, event_i_u_d, description)
  SELECT 'profile_sync_discrepancy',
         'task_headers',
         th.id,
         'U',  -- U = update
         format('app_profiles.id=%s name mismatch: app=%s, task=%s',
                ap.id, ap.name, th.name)
  FROM app_profiles ap
  JOIN task_headers th ON ap.task_header_id = th.id
  WHERE ap.name IS DISTINCT FROM th.name
     OR ap.description IS DISTINCT FROM th.description;

  -- Log survey-linked discrepancies
  INSERT INTO app_event_log (event_name, source_table_name, source_row_id, event_i_u_d, description)
  SELECT 'profile_sync_discrepancy',
         'survey_headers',
         sh.id,
         'U',
         format('app_profiles.id=%s name mismatch: app=%s, survey=%s',
                ap.id, ap.name, sh.name)
  FROM app_profiles ap
  JOIN survey_headers sh ON ap.survey_header_id = sh.id
  WHERE ap.name IS DISTINCT FROM sh.name
     OR ap.description IS DISTINCT FROM sh.description;

  -- Corrective updates (after logging)
  UPDATE app_profiles ap
  SET name = th.name,
      description = th.description
  FROM task_headers th
  WHERE ap.task_header_id = th.id;

  UPDATE app_profiles ap
  SET name = sh.name,
      description = sh.description
  FROM survey_headers sh
  WHERE ap.survey_header_id = sh.id;
END;
$$ LANGUAGE plpgsql;


--not yet run. 22:23:  Nov 26 2025