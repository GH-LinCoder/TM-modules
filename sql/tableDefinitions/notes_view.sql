create view public.notes_view as
select
  n.id as note_id,
  n.sort_int,
  n.author_id,
  n.audience_id,
  n.reply_to_id,
  n.title,
  n.content,
  n.status,
  n.last_updated,
  n.created_at,
  nc.note_category_id,
  cat.category_name
from
  notes n
  left join notes_categorised nc on n.id = nc.note_id
  left join notes_categories cat on nc.note_category_id = cat.id;