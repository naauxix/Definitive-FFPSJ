-- FFPSJ · Gestor Oficial de Actas
-- Ejecutar esta migración en Supabase SQL Editor o con: supabase db push

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'referee');
create type public.account_status as enum ('active', 'inactive');
create type public.match_status as enum ('scheduled', 'in_progress', 'finished', 'cancelled');
create type public.event_type as enum ('goal', 'yellow_card', 'red_card', 'substitution', 'note');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- La tabla pública users centraliza el rol y el estado; auth.users conserva credenciales.
create table public.users (
  id uuid primary key references public.profiles(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'referee',
  status public.account_status not null default 'inactive',
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name varchar(8) not null unique,
  color varchar(7) not null default '#1769e0' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  full_name text not null,
  document_number text,
  shirt_number smallint not null check (shirt_number between 0 and 99),
  position text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, shirt_number)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  competition text not null,
  round text,
  scheduled_at timestamptz not null,
  venue text not null,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  assigned_referee_id uuid references public.profiles(id) on delete set null,
  status public.match_status not null default 'scheduled',
  home_score smallint not null default 0 check (home_score >= 0),
  away_score smallint not null default 0 check (away_score >= 0),
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);
create index matches_scheduled_at_idx on public.matches(scheduled_at);
create index matches_referee_idx on public.matches(assigned_referee_id);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  player_id uuid not null references public.players(id) on delete restrict,
  shirt_number smallint not null check (shirt_number between 0 and 99),
  position text,
  starter boolean not null default false,
  created_at timestamptz not null default now(),
  unique (match_id, player_id),
  unique (match_id, team_id, shirt_number)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type public.event_type not null,
  minute smallint not null check (minute between 0 and 99),
  period smallint not null default 1 check (period between 1 and 3),
  team_id uuid references public.teams(id) on delete set null,
  player_id uuid references public.players(id) on delete set null,
  description text check (char_length(description) <= 500),
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index events_match_idx on public.events(match_id, minute, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type varchar(40) not null default 'system',
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, read_at, created_at desc);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  federation_name text not null default 'Federación de Fútbol Playa de San Juan',
  season_name text not null default 'Temporada 2026',
  support_email text not null default 'soporte@ffpsj.org',
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger users_updated_at before update on public.users for each row execute function public.set_updated_at();

create or replace function public.set_user_deactivated_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'inactive'::public.account_status and old.status = 'active'::public.account_status then
    new.deactivated_at = now();
  elsif new.status = 'active'::public.account_status then
    new.deactivated_at = null;
  end if;
  return new;
end;
$$;

create trigger users_set_deactivated_at
  before update of status on public.users
  for each row execute function public.set_user_deactivated_at();
create trigger teams_updated_at before update on public.teams for each row execute function public.set_updated_at();
create trigger players_updated_at before update on public.players for each row execute function public.set_updated_at();
create trigger matches_updated_at before update on public.matches for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.current_user_role()
returns public.app_role
language sql stable security definer set search_path = public
as $$ select role from public.users where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.users where id = auth.uid() and role = 'admin'::public.app_role and status = 'active'::public.account_status) $$;

create or replace function public.is_active_user()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.users where id = auth.uid() and status = 'active'::public.account_status) $$;

create or replace function public.can_manage_match(target_match_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or exists(
    select 1 from public.matches
    where id = target_match_id and assigned_referee_id = auth.uid() and public.is_active_user()
  )
$$;

create or replace function public.validate_match_player()
returns trigger language plpgsql security definer set search_path = public as $$
declare player_team_id uuid;
begin
  select team_id into player_team_id from public.players where id = new.player_id;
  if player_team_id is null or player_team_id <> new.team_id then
    raise exception 'El jugador debe pertenecer al equipo seleccionado';
  end if;
  if not exists (select 1 from public.matches where id = new.match_id and new.team_id in (home_team_id, away_team_id)) then
    raise exception 'El equipo no participa en este partido';
  end if;
  return new;
end;
$$;
create trigger match_players_validate before insert or update on public.match_players for each row execute function public.validate_match_player();

create or replace function public.validate_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare player_team_id uuid;
begin
  if new.team_id is not null and not exists (select 1 from public.matches where id = new.match_id and new.team_id in (home_team_id, away_team_id)) then
    raise exception 'El equipo no participa en este partido';
  end if;
  if new.player_id is not null then
    select team_id into player_team_id from public.players where id = new.player_id;
    if new.team_id is null then new.team_id := player_team_id; end if;
    if player_team_id <> new.team_id or not exists (select 1 from public.match_players where match_id = new.match_id and player_id = new.player_id) then
      raise exception 'El jugador debe estar incluido en la alineación correspondiente';
    end if;
  end if;
  return new;
end;
$$;
create trigger events_validate before insert or update on public.events for each row execute function public.validate_event();

create or replace function public.recalculate_match_score()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_match uuid := coalesce(new.match_id, old.match_id);
begin
  update public.matches m set
    home_score = (select count(*) from public.events e where e.match_id = target_match and e.event_type = 'goal'::public.event_type and e.team_id = m.home_team_id),
    away_score = (select count(*) from public.events e where e.match_id = target_match and e.event_type = 'goal'::public.event_type and e.team_id = m.away_team_id)
  where m.id = target_match;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger events_recalculate_score after insert or update or delete on public.events for each row execute function public.recalculate_match_score();

create or replace function public.notify_referee_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
declare home_name text; away_name text;
begin
  if new.assigned_referee_id is not null and (tg_op = 'INSERT' or new.assigned_referee_id is distinct from old.assigned_referee_id) then
    select name into home_name from public.teams where id = new.home_team_id;
    select name into away_name from public.teams where id = new.away_team_id;
    insert into public.notifications(user_id, type, title, body)
    values (new.assigned_referee_id, 'assignment', 'Nuevo partido asignado', coalesce(home_name, 'Local') || ' vs ' || coalesce(away_name, 'Visitante'));
  end if;
  return new;
end;
$$;
create trigger matches_notify_assignment after insert or update of assigned_referee_id on public.matches for each row execute function public.notify_referee_assignment();

create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public as $$
declare before_row jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
declare after_row jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), lower(tg_op), tg_table_name, coalesce((after_row ->> 'id')::uuid, (before_row ->> 'id')::uuid), before_row, after_row);
  return coalesce(new, old);
end;
$$;
create trigger audit_teams after insert or update or delete on public.teams for each row execute function public.audit_row();
create trigger audit_players after insert or update or delete on public.players for each row execute function public.audit_row();
create trigger audit_matches after insert or update or delete on public.matches for each row execute function public.audit_row();
create trigger audit_match_players after insert or update or delete on public.match_players for each row execute function public.audit_row();
create trigger audit_events after insert or update or delete on public.events for each row execute function public.audit_row();
create trigger audit_users after update on public.users for each row execute function public.audit_row();

-- El registro inicial se actualiza desde la pantalla de Configuración.
insert into public.settings(id) values ('00000000-0000-0000-0000-000000000001') on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.events enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy users_select on public.users for select to authenticated using (id = auth.uid() or public.is_admin());
create policy users_update_admin on public.users for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy teams_select_active on public.teams for select to authenticated using (public.is_active_user());
create policy teams_manage_admin on public.teams for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy players_select_active on public.players for select to authenticated using (public.is_active_user());
create policy players_manage_admin on public.players for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy matches_select on public.matches for select to authenticated using (public.can_manage_match(id));
create policy matches_insert_admin on public.matches for insert to authenticated with check (public.is_admin());
create policy matches_update_admin on public.matches for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy matches_update_referee on public.matches for update to authenticated using (assigned_referee_id = auth.uid() and public.is_active_user()) with check (assigned_referee_id = auth.uid() and public.is_active_user());
create policy matches_delete_admin on public.matches for delete to authenticated using (public.is_admin());

create policy match_players_select on public.match_players for select to authenticated using (public.can_manage_match(match_id));
create policy match_players_manage on public.match_players for all to authenticated using (public.can_manage_match(match_id)) with check (public.can_manage_match(match_id));
create policy events_select on public.events for select to authenticated using (public.can_manage_match(match_id));
create policy events_manage on public.events for all to authenticated using (public.can_manage_match(match_id)) with check (public.can_manage_match(match_id));

create policy notifications_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy settings_select_active on public.settings for select to authenticated using (public.is_active_user());
create policy settings_manage_admin on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy audit_select_admin on public.audit_logs for select to authenticated using (public.is_admin());

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.users, public.teams, public.players, public.matches, public.match_players, public.events, public.notifications, public.settings, public.audit_logs to authenticated;

-- Después de crear el primer usuario, promuévelo desde el SQL Editor:
-- update public.users set role = 'admin', status = 'active' where email = 'admin@tu-dominio.com';
