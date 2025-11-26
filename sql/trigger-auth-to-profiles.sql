CREATE OR REPLACE FUNCTION sync_profiles_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email,
      username = NEW.username,
      full_name = NEW.raw_user_meta_data->>'full_name',
      avatar_url = NEW.raw_user_meta_data->>'avatar_url',
      website = NEW.raw_user_meta_data->>'website',
      updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_auth_updates
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_profiles_from_auth();
