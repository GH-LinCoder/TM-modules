create table public.permission_atoms (
  id uuid not null default extensions.uuid_generate_v4 (),
  atom text not null,
  constraint permission_atoms_pkey primary key (id),
  constraint permission_atoms_atom_key unique (atom)
) TABLESPACE pg_default;

create index IF not exists idx_permission_atoms_atom on public.permission_atoms using btree (atom) TABLESPACE pg_default;