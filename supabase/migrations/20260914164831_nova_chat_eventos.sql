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

create schema if not exists nova_chat;
revoke all on schema nova_chat from public;

create table if not exists nova_chat.eventos (
  id                bigint generated always as identity primary key,
  creado_en         timestamptz not null default now(),
  entorno           text        not null default 'production',
  sesion            uuid,
  turno             smallint    not null,
  idioma            text        not null,
  pregunta          text        not null,
  resultado         text        not null
                    check (resultado in ('ia', 'derivar', 'no-fundado', 'error')),
  intencion         text,
  intencion_matcher text        not null,
  respuesta         text,
  mostrar           text,
  ofrece_reserva    boolean,
  cifra_rechazada   text,
  ms                integer     not null,
  tokens_entrada    integer,
  tokens_salida     integer,
  modelo            text        not null
);

create index if not exists eventos_creado_en_idx on nova_chat.eventos (creado_en desc);

alter table nova_chat.eventos enable row level security;
