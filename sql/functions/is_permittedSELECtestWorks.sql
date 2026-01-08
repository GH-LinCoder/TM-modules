CREATE OR REPLACE FUNCTION is_permitted(
    p_table_name TEXT,
    p_row_id UUID,
    p_operation TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID;
    v_user_appro_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    RAISE LOG 'is_permitted: table=%, row_id=%, op=%, auth=%', 
        p_table_name, p_row_id, p_operation, v_auth_uid;

    -- Self-access for app_profiles
    IF p_table_name = 'app_profiles' 
       AND p_operation = 'SELECT' 
       AND p_row_id = v_auth_uid THEN
        RETURN TRUE;
    END IF;

    -- Get user's approfile ID
    SELECT id INTO v_user_appro_id
    FROM app_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_user_appro_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- HARDCODED GENERIC PERMISSIONS (temporary)
    -- This bypasses joins entirely for testing
    IF p_table_name = 'app_profiles' AND p_operation = 'SELECT' THEN
        -- Check if user has ANY readApprofiles permission
        RETURN EXISTS (
            SELECT 1 FROM permissions_view 
            WHERE user_id = v_user_appro_id 
              AND function_name = '(]readApprofiles[)'
        );
    ELSIF p_table_name = 'task_headers' AND p_operation = 'SELECT' THEN
        RETURN EXISTS (
            SELECT 1 FROM permissions_view 
            WHERE user_id = v_user_appro_id 
              AND function_name = '(]readTask['
        );
    ELSIF p_table_name = 'survey_headers' AND p_operation = 'SELECT' THEN
        RETURN EXISTS (
            SELECT 1 FROM permissions_view 
            WHERE user_id = v_user_appro_id 
              AND function_name = '(]readSurvey['
        );
    -- Add other tables as needed
    END IF;

    RETURN FALSE;
END;
$$;