--call from javascript to check permissions. Can use to explain why nothing displayed

CREATE OR REPLACE FUNCTION check_permission(
  p_table_name TEXT,
  p_operation TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  -- Reuse your permission logic
  SELECT is_permitted(p_table_name, NULL, p_operation) INTO v_result;
  
  IF v_result THEN
    RETURN 'GRANTED';
  ELSE
    -- Check logs or return generic message
    RETURN 'DENIED';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN 'ERROR: ' || SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION check_permission TO authenticated;

/*

// Before loading task steps
const { data } = await supabase.rpc('check_permission', {
  p_table_name: 'task_steps',
  p_operation: 'SELECT'
});

if (data !== 'GRANTED') {
  showPermissionError('You need permission to view task steps');
}

*/