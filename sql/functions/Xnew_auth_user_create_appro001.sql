BEGIN
  INSERT INTO public.app_profiles (auth_user_id, name)
  VALUES (
    NEW.id,
    NEW.username  
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;