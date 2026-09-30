-- ============================================================================
-- Tables Supabase pour les donnees eleves et resultats
-- A executer dans : Dashboard Supabase > SQL Editor > New Query
-- (apres avoir execute supabase-setup.sql si pas encore fait)
-- ============================================================================

-- Table des eleves (profil + code personnel)
create table if not exists eleves (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  prenom text default '',
  nom text default '',
  groupe text default '',
  enseignant text default '',
  created_at timestamptz default now(),
  unique (code)
);

-- Table des resultats (une ligne par exercice termine)
create table if not exists resultats (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  set_id text default '',
  set_title text default '',
  score text default '',
  correct int default 0,
  answered int default 0,
  percent numeric default 0,
  grade text default '',
  enseignant text default '',
  created_at timestamptz default now()
);

-- Index pour accelerer les requetes enseignant (par prefixe)
create index if not exists idx_eleves_enseignant on eleves (upper(enseignant));
create index if not exists idx_resultats_enseignant on resultats (upper(enseignant));
create index if not exists idx_resultats_code on resultats (upper(code));

-- Securite : RLS activee, acces uniquement via fonctions
alter table eleves enable row level security;
alter table resultats enable row level security;

-- Fonction pour enregistrer/mettre a jour un eleve
create or replace function upsert_eleve(
  p_code text,
  p_prenom text default '',
  p_nom text default '',
  p_groupe text default '',
  p_enseignant text default ''
) returns json as $$
begin
  insert into eleves (code, prenom, nom, groupe, enseignant)
  values (p_code, p_prenom, p_nom, p_groupe, p_enseignant)
  on conflict (code) do update set
    prenom = case when eleves.prenom = '' then excluded.prenom else eleves.prenom end,
    nom = case when eleves.nom = '' then excluded.nom else eleves.nom end,
    groupe = case when eleves.groupe = '' then excluded.groupe else eleves.groupe end,
    enseignant = case when eleves.enseignant = '' then excluded.enseignant else eleves.enseignant end;
  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- Fonction pour enregistrer un resultat
create or replace function insert_resultat(
  p_code text,
  p_set_id text default '',
  p_set_title text default '',
  p_score text default '',
  p_correct int default 0,
  p_answered int default 0,
  p_percent numeric default 0,
  p_grade text default '',
  p_enseignant text default ''
) returns json as $$
begin
  insert into resultats (code, set_id, set_title, score, correct, answered, percent, grade, enseignant)
  values (p_code, p_set_id, p_set_title, p_score, p_correct, p_answered, p_percent, p_grade, p_enseignant);
  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- Fonction pour generer des codes eleves (depuis le dashboard enseignant)
create or replace function generate_student_codes(
  p_codes text[],
  p_enseignant text
) returns json as $$
declare
  c text;
begin
  foreach c in array p_codes loop
    insert into eleves (code, enseignant)
    values (c, p_enseignant)
    on conflict (code) do nothing;
  end loop;
  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- Fonction de lecture pour le dashboard enseignant
-- Renvoie les eleves + resultats dont le code commence par le prefixe
create or replace function get_teacher_data(
  p_prefix text
) returns json as $$
declare
  v_students json;
  v_results json;
begin
  select coalesce(json_agg(row_to_json(s)), '[]'::json) into v_students
  from (
    select code, prenom, nom, groupe
    from eleves
    where upper(enseignant) = upper(p_prefix)
       or upper(split_part(code, '-', 1)) = upper(p_prefix)
    order by created_at
  ) s;

  select coalesce(json_agg(row_to_json(r)), '[]'::json) into v_results
  from (
    select
      to_char(created_at at time zone 'Europe/Paris', 'DD/MM/YYYY') as date,
      code,
      set_title as set,
      score,
      case
        when percent < 1 then round(percent * 100)::text || '%'
        else round(percent)::text || '%'
      end as percent,
      grade
    from resultats
    where upper(enseignant) = upper(p_prefix)
       or upper(split_part(code, '-', 1)) = upper(p_prefix)
    order by created_at desc
  ) r;

  return json_build_object('students', v_students, 'results', v_results);
end;
$$ language plpgsql security definer;
