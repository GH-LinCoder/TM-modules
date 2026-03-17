-- Function: create_recruitment_relation
-- Purpose: Create 'a recruit' relation after user login, using data staged in temp_signups
-- Returns: The ID of the created relation (or NULL if no recruiter was specified)
CREATE OR REPLACE FUNCTION create_recruitment_relation(p_auth_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated permissions to write to approfile_relations
AS $$
DECLARE
    v_new_appro_id uuid;
    v_recruiter_appro_id uuid;
    v_existing_relation_id uuid;
    v_new_relation_id uuid;
BEGIN
    -- 1. Get the new user's appro_id from app_profiles
    SELECT id INTO v_new_appro_id
    FROM app_profiles
    WHERE auth_user_id = p_auth_user_id;
    
    IF v_new_appro_id IS NULL THEN
        RAISE EXCEPTION 'No approfile found for auth user %', p_auth_user_id;
    END IF;
    
    -- 2. Look up recruiter_appro_id from temp_signups
    -- Only process if recruiter_appro_id is set AND recruitment_relation_id is NULL (not yet processed)
    SELECT recruiter_appro_id, recruitment_relation_id 
    INTO v_recruiter_appro_id, v_existing_relation_id
    FROM temp_signups
    WHERE user_id = p_auth_user_id
    AND recruiter_appro_id IS NOT NULL
    AND recruitment_relation_id IS NULL;  -- ✅ Only process if not already done
    
    -- 3. If recruiter found and not already processed, create the relation
    IF v_recruiter_appro_id IS NOT NULL THEN
        -- Double-check relation doesn't already exist (idempotency + safety)
        SELECT id INTO v_existing_relation_id
        FROM approfile_relations 
        WHERE approfile_is = v_new_appro_id 
        AND relationship = 'a recruit' 
        AND of_approfile = v_recruiter_appro_id
        AND (is_deleted IS NULL OR is_deleted = false);
        
        IF v_existing_relation_id IS NOT NULL THEN
            -- Relation already exists (maybe created manually or by previous run)
            -- Update temp_signups to reflect this
            UPDATE temp_signups 
            SET recruitment_relation_id = v_existing_relation_id
            WHERE user_id = p_auth_user_id;
            
            RETURN v_existing_relation_id;
        END IF;
        
        -- Create the new relation
        INSERT INTO approfile_relations (
            approfile_is, 
            relationship, 
            of_approfile,
            created_at
        ) VALUES (
            v_new_appro_id,
            'a recruit',
            v_recruiter_appro_id,
            now()
        )
        RETURNING id INTO v_new_relation_id;
        
        -- Update temp_signups with the created relation's ID (audit trail)
        UPDATE temp_signups 
        SET recruitment_relation_id = v_new_relation_id
        WHERE user_id = p_auth_user_id;
        
        RETURN v_new_relation_id;
    END IF;
    
    -- No recruiter specified or already processed
    RETURN NULL;
END;
$$;