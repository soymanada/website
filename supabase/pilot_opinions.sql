-- ══════════════════════════════════════════════════════════════════
-- Piloto cerrado de opiniones — SoyManada
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- 1. Tabla de invitaciones (1 token por proveedor piloto)
create table if not exists pilot_invites (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null default gen_random_uuid()::text,
  provider_id uuid not null references providers(id) on delete cascade,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2. Tabla de opiniones
create table if not exists pilot_opinions (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null check (char_length(trim(text)) >= 10),
  rating      smallint check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  unique(provider_id, user_id)   -- 1 opinión por usuario por proveedor
);

-- 3. RLS — invitaciones
alter table pilot_invites enable row level security;

create policy "pilot_invites_public_read"
  on pilot_invites for select using (true);

-- 4. RLS — opiniones
alter table pilot_opinions enable row level security;

create policy "pilot_opinions_public_read"
  on pilot_opinions for select using (true);

create policy "pilot_opinions_authenticated_insert"
  on pilot_opinions for insert
  with check (auth.uid() = user_id);

-- 5. Trigger: límite duro de 10 opiniones por proveedor (backend enforcement)
create or replace function check_pilot_opinion_limit()
returns trigger language plpgsql security definer as $$
begin
  if (
    select count(*) from pilot_opinions where provider_id = new.provider_id
  ) >= 10 then
    raise exception 'cupo_completo: Este proveedor ya alcanzó el límite de 10 opiniones';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_pilot_opinion_limit on pilot_opinions;
create trigger enforce_pilot_opinion_limit
  before insert on pilot_opinions
  for each row execute function check_pilot_opinion_limit();

-- ── Cómo habilitar un proveedor piloto ─────────────────────────────
-- Insertar manualmente (el token se genera automático):
--
-- insert into pilot_invites (provider_id)
-- values ('UUID_DEL_PROVEEDOR');
--
-- Luego el link es: https://soymanada.com/opinar?token=<token_generado>
-- ──────────────────────────────────────────────────────────────────
