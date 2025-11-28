import { supabase } from './client';
import type { Category, Dish } from '../types';

/**
 * Servicio para operaciones del menú
 * Funciones optimizadas para SSG/ISR
 */

// ============ Categorías ============

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

export async function createCategory(name: string, orderIndex: number = 0) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, order_index: orderIndex }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string, orderIndex: number) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, order_index: orderIndex })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createDish(dish: Partial<Dish>) {
  const { data, error } = await supabase
    .from('dishes')
    .insert([{
      ...dish,
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDish(id: string, dish: Partial<Dish>) {
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleDishAvailability(id: string, isAvailable: boolean) {
  const { data, error } = await supabase
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

