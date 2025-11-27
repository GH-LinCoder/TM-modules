


--Tasks =  90b915ce-d43e-4a1e-938c-494987f18b1c
--Surveys = 995ff294-74c8-4a5f-9b7e-6fb6d892a4bf

BEGIN
  -- Create appro for the task
  INSERT INTO public.app_profiles (name, description, task_header_id)
  VALUES (NEW.name, NEW.description, NEW.id)
  ON CONFLICT (task_header_id) DO NOTHING;

  -- Insert membership relation if appro exists
  INSERT INTO public.appro_relations (appro_is, relationship, of_appro)
  SELECT ap.id, 'member', '90b915ce-d43e-4a1e-938c-494987f18b1c'
  FROM public.app_profiles ap
  WHERE ap.task_header_id = NEW.id
    AND NOT EXISTS (
      SELECT 1 FROM public.appro_relations r
      WHERE r.appro_is = ap.id
        AND r.relationship = 'member'
        AND r.of_appro = '90b915ce-d43e-4a1e-938c-494987f18b1c'
    );

  RETURN NEW;
END;


BEGIN
  -- Create appro for the survey
  INSERT INTO public.app_profiles (survey_header_id, name, description)
  VALUES (NEW.id, NEW.name, NEW.description)
  ON CONFLICT (survey_header_id) DO NOTHING;

  -- Insert membership relation if appro exists
  INSERT INTO public.appro_relations (appro_is, relationship, of_appro)
  SELECT ap.id, 'member', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'
  FROM public.app_profiles ap
  WHERE ap.survey_header_id = NEW.id
    AND NOT EXISTS (
      SELECT 1 FROM public.appro_relations r
      WHERE r.appro_is = ap.id
        AND r.relationship = 'member'
        AND r.of_appro = '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'
    );

  RETURN NEW;
END;

