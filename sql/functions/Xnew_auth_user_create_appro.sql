BEGIN
  INSERT INTO public.app_profiles (auth_user_id, email)
  VALUES (
    NEW.id,
    NEW.email  
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;