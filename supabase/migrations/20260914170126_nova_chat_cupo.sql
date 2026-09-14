-- ============================================================
-- MIGRACIÓN AJENA A CHAMPI: chat de la maqueta NOVA Barber Studio
-- ============================================================
-- Esta base de datos aloja, en un esquema propio y aislado (nova_chat),
-- el registro de preguntas del chat de otra web del mismo desarrollador
-- (repo sion_barber_maqueta), para no pagar otra base de datos.
-- NO toca ninguna tabla, función ni política de Champi. El rol
-- nova_chat_registro no puede leer nada de public, auth ni storage.
-- Fuente de verdad: sion_barber_maqueta/db/. Este archivo existe para que
-- el historial local coincida con el remoto (supabase db push).
-- Para quitarlo todo: drop schema nova_chat cascade; drop role nova_chat_registro;
-- y select cron.unschedule('nova-chat-retencion');
-- ESTADO: APLICADA en producción el 2026-09-14.
-- ============================================================

create table if not exists nova_chat.limites (
  clave          text        primary key,
  ventana_inicio timestamptz not null,
  contador       integer     not null
);

-- Sin políticas: nadie salvo el dueño (la función) lee ni escribe la tabla.
alter table nova_chat.limites enable row level security;

create or replace function nova_chat.consumir_cupo(
  p_clave text,
  p_max integer,
  p_ventana_segundos integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contador integer;
begin
  -- Upsert atómico: dos instancias a la vez no pueden leer el mismo contador
  -- y escribir los dos el mismo +1.
  insert into nova_chat.limites as l (clave, ventana_inicio, contador)
  values (p_clave, now(), 1)
  on conflict (clave) do update set
    contador = case
      when l.ventana_inicio < now() - make_interval(secs => p_ventana_segundos) then 1
      else l.contador + 1
    end,
    ventana_inicio = case
      when l.ventana_inicio < now() - make_interval(secs => p_ventana_segundos) then now()
      else l.ventana_inicio
    end
  returning contador into v_contador;

  return v_contador <= p_max;
end;
$$;

revoke all on function nova_chat.consumir_cupo(text, integer, integer) from public;
grant execute on function nova_chat.consumir_cupo(text, integer, integer) to nova_chat_registro;
