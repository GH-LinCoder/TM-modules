
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
