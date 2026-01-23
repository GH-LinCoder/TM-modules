drop materialized view public.function_table_access;


create materialized view public.function_table_access as
select distinct
  pmr.name as function_name,
  split_part(atom.atom, '@'::text, 1) as operation,
  split_part(split_part(atom.atom, '@'::text, 2), '#'::text, 1) as table_name,
  case split_part(split_part(atom.atom, '@'::text, 2), '#'::text, 1)
    when 'app_profiles'::text then 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'::uuid
    when 'approfile_relations'::text then 'ec8b47f2-5a56-4bad-86a4-4cc7f5810dd7'::uuid

    when 'notes'::text then 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'::uuid
    when 'notes_categorised'::text then 'dc8abfab-34b9-49ee-a334-9b6f5e5be203'::uuid

    when 'survey_headers'::text then '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'::uuid
    when 'survey_questions'::text then '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'::uuid
    when 'survey_answers'::text then '995ff294-74c8-4a5f-9b7e-6fb6d892a4bf'::uuid

    when 'task_assignments'::text then 'd2545d76-5cac-4f6b-af13-d6529e4c4294'::uuid


    when 'task_headers'::text then '90b915ce-d43e-4a1e-938c-494987f18b1c'::uuid
    when 'task_steps'::text then '90b915ce-d43e-4a1e-938c-494987f18b1c'::uuid

    else null::uuid
  end as generic_scope
from
  permission_molecule_required pmr,
  lateral unnest(pmr.molecule) atom (atom)
where
  atom.atom ~~ '%@%'::text
  and (
    split_part(split_part(atom.atom, '@'::text, 2), '#'::text, 1) = any (
      array[
        'app_profiles'::text,
        
        'task_assignments'::text,
        
        'notes'::text,
        'notes_categorised'::text,
        
        'approfile_relations'::text,
        
        'survey_headers'::text,
        'survey_questions'::text,
        'survey_answers'::text,

        'task_headers'::text,
        'task_steps'::text
      ]
    )
  );