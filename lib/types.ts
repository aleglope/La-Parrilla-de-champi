/**
 * Tipos de datos de la aplicación
 */

export interface Category {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Dish {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DishFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  order_index: number;
}

export interface CategoryFormData {
  name: string;
  order_index: number;
}

