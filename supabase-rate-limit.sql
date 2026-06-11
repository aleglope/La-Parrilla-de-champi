-- ============================================================
-- MIGRACIÓN: Rate Limiting Distribuido (SEC-04)
-- Fecha: 2026
-- Descripción: Tabla rate_limits + función check_rate_limit con
--              ventana deslizante atómica (INSERT ... ON CONFLICT).
--              Sustituye el rate limiting en memoria (inefectivo en
--              serverless) por un contador persistente en Postgres.
-- ============================================================

-- NOTA: Aplicar manualmente vía Supabase SQL Editor con aprobación
-- (gate de BD del milestone). Idempotente: re-ejecutable sin riesgo.
-- Tabla auxiliar nueva: no toca RLS ni datos existentes.
-- Mientras NO esté aplicada, el código falla-abierto (permite y loguea).

-- 1. Tabla auxiliar de contadores por clave
create table if not exists rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

-- 2. Bloquear acceso directo vía PostgREST (anon key): la tabla solo
--    es mutable a través de la función (security definer). Sin policies,
--    RLS deniega todo acceso directo.
alter table rate_limits enable row level security;

-- 3. Función de ventana deslizante: true = permitido, false = excedido.
--    security definer para poder mutar la tabla con RLS activo;
--    search_path fijado para evitar hijacking de schema.
create or replace function check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into rate_limits (key, count, window_start)
    values (p_key, 1, now())
    on conflict (key) do update
      set count = case
            when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
            else rate_limits.count + 1
          end,
          window_start = case
            when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
            else rate_limits.window_start
          end
    returning count into v_count;

  return v_count <= p_max;
end;
$$;

-- Verificar que la función quedó creada correctamente
select 'Función check_rate_limit creada correctamente' as status;
