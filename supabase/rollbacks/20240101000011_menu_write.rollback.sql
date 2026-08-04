-- =====================================================
-- ROLLBACK de 20240101000011_menu_write_service_role_only.sql
-- La Parrilla de Champi
-- =====================================================
--
-- ATENCIÓN: este archivo NO es una migración forward. Vive fuera de
-- supabase/migrations/ a propósito, para que `supabase db push` no lo
-- aplique nunca. Ejecutar a mano en el SQL Editor solo si hace falta.
--
-- ATENCIÓN 2: restaurar estas políticas REABRE la escritura anónima de
-- la carta. Cualquiera con la clave anónima (que es pública) podría
-- reescribir precios o vaciar el menú. Úsalo solo como parada de
-- emergencia si el panel admin quedara inutilizable, y revierte cuanto
-- antes desplegando el código de Server Actions correcto.
-- =====================================================

BEGIN;

CREATE POLICY "categories_insert_public"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "categories_update_public"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "categories_delete_public"
  ON categories FOR DELETE
  USING (true);

CREATE POLICY "dishes_insert_public"
  ON dishes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "dishes_update_public"
  ON dishes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dishes_delete_public"
  ON dishes FOR DELETE
  USING (true);

COMMIT;
