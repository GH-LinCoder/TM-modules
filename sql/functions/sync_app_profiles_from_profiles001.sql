
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
