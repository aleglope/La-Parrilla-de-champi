-- ============================================================
-- MIGRACIÓN: Cerrar la escritura anónima de la carta (SEC-05)
-- Descripción: elimina las 6 políticas permisivas de escritura
--              sobre `categories` y `dishes` que permitían
--              INSERT/UPDATE/DELETE al rol `anon`.
-- ============================================================
--
-- POR QUÉ
--
-- La migración 20240101000010 dejó estas políticas como
-- `WITH CHECK (true)` / `USING (true)` sin cláusula TO, es decir
-- aplicables a `anon`, y lo documentó como FOLLOW-UP porque el
-- CRUD del menú se hacía desde el navegador con la clave anónima.
--
-- Esa clave es pública por diseño: viaja en el bundle de JS. El
-- 2026-08-03 se verificó contra producción que un UPDATE anónimo
-- sobre `dishes` era ACEPTADO (1 fila afectada) y que el DELETE
-- estaba igualmente autorizado. Es decir, cualquiera podía
-- reescribir los precios de la carta o vaciarla entera.
--
-- REQUISITO PREVIO (orden estricto)
--
-- El código que sustituye ese CRUD por Server Actions autenticadas
-- (app/actions/menuAdmin.ts, que escriben con service_role tras
-- comprobar la sesión admin) DEBE estar desplegado ANTES de aplicar
-- esta migración. Si se aplica antes, el panel se queda sin poder
-- editar el menú.
--
-- POR QUÉ NO SE CREAN POLÍTICAS NUEVAS
--
-- En Supabase el rol `service_role` tiene BYPASSRLS: salta las
-- políticas por completo. Basta con retirar las permisivas para
-- que `anon` pierda la escritura mientras las Server Actions
-- siguen funcionando. Añadir una política "para service_role"
-- sería ruido: nunca se evaluaría.
--
-- LO QUE NO TOCA
--
-- Las políticas de LECTURA pública ("Allow public read access to
-- categories/dishes") se mantienen intactas: la carta debe seguir
-- siendo visible sin autenticación.
--
-- Idempotente: DROP ... IF EXISTS, re-ejecutable sin riesgo.
-- Rollback: supabase/rollbacks/20240101000011_menu_write.rollback.sql
-- ============================================================

BEGIN;

-- Categorías: retirar escritura anónima
DROP POLICY IF EXISTS "categories_insert_public" ON categories;
DROP POLICY IF EXISTS "categories_update_public" ON categories;
DROP POLICY IF EXISTS "categories_delete_public" ON categories;

-- Platos: retirar escritura anónima
DROP POLICY IF EXISTS "dishes_insert_public" ON dishes;
DROP POLICY IF EXISTS "dishes_update_public" ON dishes;
DROP POLICY IF EXISTS "dishes_delete_public" ON dishes;

COMMIT;
