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

-- El rol pasa a SOLO INSERTAR (la purga la hace pg_cron como dueño).
alter role nova_chat_registro set statement_timeout = '2s';

revoke select, update, delete, truncate on nova_chat.eventos from nova_chat_registro;
grant insert on nova_chat.eventos to nova_chat_registro;

drop policy if exists registro_web on nova_chat.eventos;
create policy registro_web on nova_chat.eventos
  for insert to nova_chat_registro
  with check (true);
