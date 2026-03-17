CREATE OR REPLACE FUNCTION sync_survey_headers_app_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_profiles
  SET name = NEW.name,
      description = NEW.description
  WHERE survey_header_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_name_description
AFTER UPDATE OF name, description ON survey_headers
FOR EACH ROW
EXECUTE FUNCTION sync_survey_headers_app_profiles();
