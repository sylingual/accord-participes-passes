-- ============================================================================
-- Setup Supabase pour l'authentification enseignant
-- A executer dans : Dashboard Supabase > SQL Editor > New Query
-- ============================================================================

-- Extension pour le hachage des mots de passe
create extension if not exists pgcrypto;

-- Table des enseignants (les mots de passe sont haches, jamais visibles)
create table enseignants (
  id uuid default gen_random_uuid() primary key,
  prefixe text unique not null,
  nom text not null,
  password_hash text not null,
  groupes text default '',
  created_at timestamptz default now()
);

-- Table des codes d'invitation (tu les crees depuis le Table Editor)
create table invitations (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  used boolean default false,
  used_by text,
  created_at timestamptz default now()
);

-- Securite : personne ne lit les tables directement
alter table enseignants enable row level security;
alter table invitations enable row level security;

-- Fonction d'inscription enseignant (appelee depuis le frontend)
create or replace function register_teacher(
  p_invitation_code text,
  p_prefixe text,
  p_nom text,
  p_password text,
  p_groupes text default ''
) returns json as $$
declare
  v_invite record;
  v_teacher record;
begin
  select * into v_invite from invitations
  where code = p_invitation_code;

  if v_invite is null then
    return json_build_object('ok', false, 'error', 'Code d''invitation invalide.');
  end if;

  if exists (select 1 from enseignants where upper(prefixe) = upper(p_prefixe)) then
    return json_build_object('ok', false, 'error', 'Ce prefixe est deja utilise.');
  end if;

  if length(p_prefixe) < 2 or length(p_prefixe) > 10 then
    return json_build_object('ok', false, 'error', 'Le prefixe doit faire entre 2 et 10 caracteres.');
  end if;

  insert into enseignants (prefixe, nom, password_hash, groupes)
  values (upper(p_prefixe), p_nom, crypt(p_password, gen_salt('bf')), p_groupes)
  returning * into v_teacher;

  return json_build_object(
    'ok', true,
    'prefixe', v_teacher.prefixe,
    'nom', v_teacher.nom,
    'groupes', v_teacher.groupes
  );
end;
$$ language plpgsql security definer;

-- Fonction de connexion enseignant
create or replace function login_teacher(
  p_prefixe text,
  p_password text
) returns json as $$
declare
  v_teacher record;
begin
  select * into v_teacher from enseignants
  where upper(prefixe) = upper(p_prefixe);

  if v_teacher is null then
    return json_build_object('ok', false);
  end if;

  if v_teacher.password_hash = crypt(p_password, v_teacher.password_hash) then
    return json_build_object('ok', true, 'nom', v_teacher.nom, 'groups', v_teacher.groupes);
  else
    return json_build_object('ok', false);
  end if;
end;
$$ language plpgsql security definer;
