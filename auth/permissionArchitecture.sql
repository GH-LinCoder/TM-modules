



function_name: 'fn_create_task'
molecule: { 'INSERT@task_headers#name', 'INSERT@task_headers#description' }



user_id: <your appro uuid>
granted_permissions: { 'INSERT@task_headers#name', 'INSERT@task_headers#description' }



CREATE FUNCTION execute_if_permitted(
    user_id uuid,
    function_name text
) RETURNS boolean AS $$
DECLARE
    required text[];
    granted text[];
BEGIN
    SELECT molecule INTO required
    FROM permission_molecule_required
    WHERE function_name = execute_if_permitted.function_name;

    SELECT granted_permissions INTO granted
    FROM permission_molecule_granted
    WHERE user_id = execute_if_permitted.user_id;

    IF required <@ granted THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;




--Qwen version


--when thereare database functions begin with
IF NOT execute_if_permitted(current_user_id(), 'fn_create_task') THEN
    RAISE EXCEPTION 'Permission denied';
END IF;

-- public.check_permission_granted(required_atoms TEXT[], granted_atoms TEXT[])
-- Returns TRUE if all required atoms are in granted
CREATE OR REPLACE FUNCTION public.check_permission_granted(
  required_atoms TEXT[],
  granted_atoms TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Handle NULLs
  IF required_atoms IS NULL OR granted_atoms IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if required is subset of granted
  RETURN (SELECT ARRAY(
    SELECT unnest(required_atoms)
    EXCEPT
    SELECT unnest(granted_atoms)
  ) = ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Does user have permission to run function X?
SELECT public.check_permission_granted(
  ARRAY['INSERT@approfile_relations#approfile_is', 'INSERT@approfile_relations#relationship'],
  ARRAY['INSERT@approfile_relations#approfile_is', 'INSERT@approfile_relations#relationship', 'SELECT@approfile_relations#id']
);
-- Returns: true