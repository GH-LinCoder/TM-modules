DECLARE appro_id uuid;
--Tasks =  90b915ce-d43e-4a1e-938c-494987f18b1c
BEGIN
  INSERT INTO public.app_profiles (name, description, task_header_id)
  VALUES (NEW.name, NEW.description, NEW.id)
  ON CONFLICT (task_header_id) DO NOTHING
  RETURNING id INTO appro_id;

  IF appro_id IS NOT NULL THEN    -- Insert membership relation if appro exists
    INSERT INTO public.approfile_relations (approfile_is, relationship, of_approfile)
    VALUES (appro_id, 'a member', '90b915ce-d43e-4a1e-938c-494987f18b1c')
    ON CONFLICT (approfile_is, relationship, of_approfile) DO NOTHING;
  END IF;

  RETURN NEW;
END;
