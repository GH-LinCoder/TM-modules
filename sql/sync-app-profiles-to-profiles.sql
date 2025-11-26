CREATE OR REPLACE FUNCTION sync_app_profiles_from_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_profiles
  SET email        = NEW.email,
      name         = NEW.username,
      avatar_url   = NEW.avatar_url,
      external_url = NEW.website,
      updated_at   = NEW.updated_at
  WHERE auth_user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_profiles_updates
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_app_profiles_from_profiles();