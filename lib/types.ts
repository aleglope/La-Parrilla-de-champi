/**
 * Tipos de datos de la aplicación
 */

export interface Category {
  id: string;
  name: string;
  name_gl?: string | null;
  order_index: number;
  created_at: string;
}

export interface Dish {
  id: string;
  category_id: string;
  name: string;
  name_gl?: string | null;
  description: string | null;
  description_gl?: string | null;
  price: number;
  image_url: string | null;
  /** Timestamp de cuando se subió la imagen */
  image_uploaded_at?: string | null;
  /** Tamaño de la imagen en KB */
  image_size_kb?: number | null;
  is_available: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DishFormData {
  name: string;
  name_gl?: string;
  description: string;
  description_gl?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  order_index: number;
}

export interface CategoryFormData {
  name: string;
  name_gl?: string;
  order_index: number;
}

