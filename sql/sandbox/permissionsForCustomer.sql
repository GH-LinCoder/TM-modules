--admin permission collection. Not yet tested if these are the correct generic permissions.  21:10 May 1 2026  For 'move mountains'


INSERT INTO _internal.permission_relations (approfile_is, relationship, of_approfile)
SELECT 
    'PUT THE NEW ADMIN ID HERE'::uuid, 
    relationship, 
    of_approfile
FROM _internal.permission_relations
WHERE approfile_is IN (
    '600a798a-e6d2-44fc-9239-5f470c1582e2', -- BUNDLE:Payment-plans
    '10742496-f83e-4e53-9b04-85de0c8d4d7b', -- BUNDLE:Editor-tasks
    'e77f7191-50b8-44b5-88b9-119f7b521a1f', -- BUNDLE:Count-stats
    '08faebf4-293b-4cba-b84f-de467d2c59ea', -- BUNDLE:Task-automations
    '80ec90bb-7c91-4c19-985a-2fce207781dc', -- BUNDLE:Editor-surveys
    '19bb1d81-3568-4010-b53f-2ae3efb0fa62', -- BUNDLE:Soft-delete-automations
    '3f235a4c-b09c-4101-923b-a0cabc2a5d54', -- BUNDLE:Publisher-appros
    '2f44801b-00b6-469e-adb7-3a42058c597f', -- BUNDLE:Publisher-tasks
    '93e691b3-77cb-4224-b363-4b480a59a2aa', -- BUNDLE:Publisher-surveys
    '31ec8704-f955-4fe1-a08c-c40a96b8d4a1'  -- BUNDLE:Survey-automations
)
ON CONFLICT DO NOTHING;


2 single lines
INSERT INTO _internal.permission_relations (approfile_is, relationship, of_approfile)
VALUES
  -- Assignment: (]createAssignment[)
  ('PUT THE NEW ADMIN ID HERE', '(]createAssignment[)', 'd2545d76-5cac-4f6b-af13-d6529e4c4294'),
  
  -- Editor approfiles: (]updateApprofile[)
  ('PUT THE NEW ADMIN ID HERE', '(]updateApprofile[)', 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74')
ON CONFLICT DO NOTHING;
