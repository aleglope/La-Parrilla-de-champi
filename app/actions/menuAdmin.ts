'use server';

/**
 * Server Actions para el CRUD del menú (categorías y platos).
 *
 * Sustituyen a las funciones CRUD de lib/supabase/menu-service.ts, que
 * escribían desde el navegador con la clave anónima. Esa clave es pública
 * por diseño (viaja en el bundle), así que las políticas RLS que permitían
 * escribir a `anon` dejaban la carta abierta a cualquiera: verificado en
 * producción el 2026-08-03, un UPDATE anónimo sobre `dishes` era aceptado.
 *
 * Aquí la escritura ocurre en el servidor, tras comprobar la sesión admin y
 * con el cliente service_role. Eso permite cerrar las políticas de escritura
 * de `dishes` y `categories` a `anon` (migración 20240101000011).
 *
 * Las firmas replican exactamente las de menu-service para que los
 * componentes del panel solo cambien el import: mismos argumentos, mismo
 * valor de retorno y mismo contrato de error (lanzan en fallo).
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isAdminRequest } from '@/lib/auth/requireAdmin';
import type { Dish } from '@/lib/types';

/**
 * Gate común. Lanza si no hay sesión admin válida, de modo que ninguna
 * mutación llegue a ejecutarse sin autenticación.
 */
async function assertAdmin(): Promise<void> {
  if (!(await isAdminRequest())) {
    throw new Error('No autorizado');
  }
}

// ============ Categorías ============

export async function createCategory(
  name: string,
  nameGl: string = '',
  orderIndex: number = 0
) {
  await assertAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .insert([{ name, name_gl: nameGl, order_index: orderIndex }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  name: string,
  nameGl: string,
  orderIndex: number
) {
  await assertAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .update({ name, name_gl: nameGl, order_index: orderIndex })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  await assertAdmin();

  const { error } = await getSupabaseAdmin()
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ Platos ============

export async function createDish(dish: Partial<Dish>) {
  await assertAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from('dishes')
    .insert([
      {
        ...dish,
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDish(id: string, dish: Partial<Dish>) {
  await assertAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from('dishes')
    .update({
      ...dish,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDish(id: string) {
  await assertAdmin();

  const { error } = await getSupabaseAdmin()
    .from('dishes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleDishAvailability(id: string, isAvailable: boolean) {
  await assertAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from('dishes')
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
