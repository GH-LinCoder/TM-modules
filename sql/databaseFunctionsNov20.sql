SELECT
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';


// save as markdown



| public | new_auth_user_create_appro         |                                     | 
CREATE OR REPLACE FUNCTION public.new_auth_user_create_appro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.app_profiles (auth_user_id, name)
  VALUES (
    NEW.id,
    NEW.username  
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public | new_survey_headers_create_appro    |                                     | 
CREATE OR REPLACE FUNCTION public.new_survey_headers_create_appro()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  INSERT INTO public.app_profiles (survey_header_id, name, description)
  VALUES (
    NEW.id,
    NEW.name,
    NEW.description  
  )
  ON CONFLICT (survey_header_id) DO NOTHING;
  RETURN NEW;
END;$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| public | generate_permission_atoms          | p_table_name text                   
| CREATE OR REPLACE FUNCTION public.generate_permission_atoms(p_table_name text)
 RETURNS TABLE(id uuid, atom text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        uuid_generate_v4(),
        action || '@' || c.table_name || '#' || c.column_name
    FROM information_schema.columns c
    CROSS JOIN unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS action
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table_name
      AND c.column_name NOT IN ('created_at', 'deleted_at');
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| public | new_task_headers_create_steps      |                                     
| CREATE OR REPLACE FUNCTION public.new_task_headers_create_steps()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- Insert default task steps with new column name
  INSERT INTO public.task_steps (
    task_header_id, 
    name, 
    description, 
    step_order
  ) VALUES 
  (
    NEW.id, 
    'abandoned', 
    'The student or someone else determined that the task is not going to be completed', 
    1
  ),
  (
    NEW.id, 
    'completed', 
    'The manager or someone considers the task to have been successful.', 
    2
  ),
  (
    NEW.id, 
    'Edit this...', 
    'Edit this...', 
    3
  );
  
  RETURN NEW;
END;$function$
                                                                                                                                                                                                                                                                                                                             |
| public | new_task_header_create_appro       |                                     
| CREATE OR REPLACE FUNCTION public.new_task_header_create_appro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.app_profiles (name, description, task_header_id)
  VALUES (
    NEW.name, NEW.description, NEW.id  
  )
  ON CONFLICT (task_header_id) DO NOTHING;
  RETURN NEW;
END;$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public | new_survey_header_create_Q1_A1     |                                     
| CREATE OR REPLACE FUNCTION public."new_survey_header_create_Q1_A1"()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  new_question_id UUID;
BEGIN
  -- Insert default question
  INSERT INTO public.survey_questions (
    survey_header_id, 
    name, 
    description, 
    question_number
  ) VALUES (
    NEW.id, 
    'Edit this...', 
    'The first question', 
    1
  )
  RETURNING id INTO new_question_id;

  -- Insert default answer linked to the new question
  INSERT INTO public.survey_answers (
    survey_question_id,
    name,
    description,
    answer_number
  ) VALUES (
    new_question_id,
    'Edit this...',
    'The first answer to the first question',
    1
  );

  RETURN NEW;
END;$function$
                                                                                                                                                                                                                                            |
| public | authorize                          
| requested_permission app_permission | 
CREATE OR REPLACE FUNCTION public.authorize(requested_permission app_permission)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                |

| public | EMPTY_sync_auth_local_to_usersAuth |                                     
| CREATE OR REPLACE FUNCTION public."EMPTY_sync_auth_local_to_usersAuth"()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  
END;$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public | update_last_modified_column        |                                     | 
CREATE OR REPLACE FUNCTION public.update_last_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.last_updated := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public | log_all_events                     |                                     | 
CREATE OR REPLACE FUNCTION public.log_all_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    event_i_u_d TEXT;
    row_id UUID;
BEGIN
    -- Determine the event type
    CASE TG_OP
        WHEN 'INSERT' THEN
            event_i_u_d := 'INSERT';
            row_id := NEW.id;
        WHEN 'UPDATE' THEN
            event_i_u_d := 'UPDATE';
            row_id := NEW.id;
        WHEN 'DELETE' THEN
            event_i_u_d := 'DELETE';
            row_id := OLD.id;
    END CASE;

    -- Insert into the event log with all required information
    INSERT INTO public.app_event_log (
        event_i_u_d,
        source_table_name,
        source_row_id,
        created_at
    )
    VALUES (
        event_i_u_d,
        TG_TABLE_NAME,
        row_id,
        NOW()
    );

    -- Return appropriate value based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$
