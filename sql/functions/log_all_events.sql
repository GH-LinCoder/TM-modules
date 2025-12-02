
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
