-- the 'tags' are in an array instead of in their own table or denormalised as separate rows.

create view public.notes_with_categories_array as
select
  n.id,
  n.sort_int,
  n.author_id,
  n.audience_id,
  n.reply_to_id,
  n.title,
  n.content,
  n.status,
  n.created_at,
  n.last_updated_at,
  array_agg(nc.note_category_id) as categories
from
  notes n
  left join notes_categorised nc on n.id = nc.note_id
group by
  n.id,
  n.sort_int,
  n.author_id,
  n.audience_id,
  n.reply_to_id,
  n.content,
  n.created_at;