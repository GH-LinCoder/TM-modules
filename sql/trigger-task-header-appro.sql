CREATE OR REPLACE FUNCTION sync_app_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_profiles
  SET name = NEW.name,
      description = NEW.description
  WHERE task_header_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_name_description
AFTER UPDATE OF name, description ON task_headers
FOR EACH ROW
EXECUTE FUNCTION sync_app_profiles();
