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

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule(
  'nova-chat-retencion',
  '17 3 * * *',
  $job$
    delete from nova_chat.eventos where creado_en < now() - interval '90 days';
    delete from nova_chat.limites where ventana_inicio < now() - interval '2 days';
  $job$
);
