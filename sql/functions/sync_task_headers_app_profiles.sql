
BEGIN
  UPDATE app_profiles
  SET name = NEW.name,
      description = NEW.description
  WHERE task_header_id = NEW.id;

  RETURN NEW;
END;
