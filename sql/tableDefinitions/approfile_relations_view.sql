create view public.approfile_relations_view as
select
  ar.id as relation_id,
  ar.approfile_is,
  ar.of_approfile,
  ar.relationship,
  ar.created_at,
  rel.name as rel_name,
  rel.description as rel_description,
  ap1.name as approfile_is_name,
  ap2.name as of_approfile_name
from
  approfile_relations ar
  join relationships rel on ar.relationship = rel.name
  join app_profiles ap1 on ar.approfile_is = ap1.id
  join app_profiles ap2 on ar.of_approfile = ap2.id;