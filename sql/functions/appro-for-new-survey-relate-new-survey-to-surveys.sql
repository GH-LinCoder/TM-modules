DECLARE appro_id uuid;
--Surveys = 995ff294-74c8-4a5f-9b7e-6fb6d892a4bf
BEGIN
  INSERT INTO public.app_profiles (name, description, survey_header_id)
  VALUES (NEW.name, NEW.description, NEW.id)
  ON CONFLICT (survey_header_id) DO NOTHING
  RETURNING id INTO appro_id;

  IF appro_id IS NOT NULL THEN    -- Insert membership relation if appro exists
    INSERT INTO public.approfile_relations (approfile_is, relationship, of_approfile)
    VALUES (appro_id, 'a member', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf')
    ON CONFLICT (approfile_is, relationship, of_approfile) DO NOTHING;
  END IF;

  RETURN NEW;
END;