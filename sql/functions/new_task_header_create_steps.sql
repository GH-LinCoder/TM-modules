BEGIN
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
END;