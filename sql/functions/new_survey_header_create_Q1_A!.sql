DECLARE
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
END;