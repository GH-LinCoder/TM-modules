-- Backfill task appro relations
INSERT INTO approfile_relations (approfile_is, relationship, of_approfile)
SELECT a.id, 'a member', '90b915ce-d43e-4a1e-938c-494987f18b1c'
FROM app_profiles a
WHERE a.task_header_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM approfile_relations r
    WHERE r.approfile_is = a.id
      AND r.relationship = 'a member'
      AND r.of_approfile = '90b915ce-d43e-4a1e-938c-494987f18b1c'
  );

-- Backfill survey appro relations
INSERT INTO approfile_relations (approfile_is, relationship, of_approfile)
SELECT a.id, 'a member', '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'
FROM app_profiles a
WHERE a.survey_header_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM approfile_relations r
    WHERE r.approfile_is = a.id
      AND r.relationship = 'a member'
      AND r.of_approfile = '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'
  );
