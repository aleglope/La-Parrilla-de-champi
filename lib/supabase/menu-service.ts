import { createPublicReadClient } from './public-read';
import type { Category, Dish } from '../types';

/**
 * Servicio para operaciones del menú
 * Funciones optimizadas para SSG/ISR
 */

// ============ Categorías ============

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await createPublicReadClient()
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await createPublicReadClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return null;
  }
}

// ============ Platos ============

export async function getDishes(): Promise<Dish[]> {
  try {
    const { data, error } = await createPublicReadClient()
      .from('dishes')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDishes:', error);
    return [];
  }
}

export async function getDishesByCategory(categoryId: string): Promise<Dish[]> {
  try {
    const { data, error } = await createPublicReadClient()
      .from('dishes')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching dishes by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDishesByCategory:', error);
    return [];
  }
}

export async function getDishById(id: string): Promise<Dish | null> {
  try {
    const { data, error } = await createPublicReadClient()
      .from('dishes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dish:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDishById:', error);
    return null;
  }
}

// ============ Operaciones CRUD (para Admin) ============
//
// Las mutaciones de categorias y platos vivian aqui y escribian desde el
// navegador con la clave anonima. Esa clave es publica (viaja en el bundle),
// asi que las politicas RLS que lo permitian dejaban la carta abierta a
// cualquiera. Se movieron a Server Actions autenticadas que escriben con
// service_role en el servidor:
//
//   app/actions/menuAdmin.ts
//
// No las reintroduzcas aqui: la migracion 20240101000011 cierra la escritura
// de `dishes` y `categories` al rol anon, asi que desde el cliente fallarian.
// Este modulo se queda solo con las lecturas publicas.
