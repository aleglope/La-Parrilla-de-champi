"use client";

/**
 * Gestor de platos del dashboard administrativo
 * Maneja CRUD de platos incluyendo upload de imágenes
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createDish,
  updateDish,
  deleteDish,
  toggleDishAvailability,
} from "@/lib/supabase/menu-service";
import { DishModal } from "./DishModal";
import { uploadDishImage } from "@/app/actions/uploadDishImage";
import { deleteDishImage } from "@/app/actions/deleteDishImage";
import type { Category, Dish } from "@/lib/types";
import type { ImageUploadResult } from "./ImageUploadField";
import Image from "next/image";

/** Ruta de la imagen por defecto para platos sin imagen */
const DEFAULT_DISH_IMAGE = "/images/default-dish.svg";

interface DishesManagerProps {
  dishes: Dish[];
  categories: Category[];
  onUpdate: () => void;
  onRevalidate: () => void;
}

export function DishesManager({
  dishes,
  categories,
  onUpdate,
  onRevalidate,
}: DishesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredDishes = filterCategory
    ? dishes.filter((dish) => dish.category_id === filterCategory)
    : dishes;

  const handleCreate = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  const handleDelete = async (dish: Dish) => {
    if (!confirm(`¿Eliminar "${dish.name}"?`)) return;

    setIsLoading(true);
    try {
      // Si el plato tiene imagen, eliminarla de Storage
      if (dish.image_url) {
        await deleteDishImage({
          dishId: dish.id,
          imageUrl: dish.image_url,
          updateDatabase: false, // El plato se eliminará completamente
        });
      }

      await deleteDish(dish.id);
      await onRevalidate();
      onUpdate();
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Error al eliminar el plato");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    setIsLoading(true);
    try {
      await toggleDishAvailability(dish.id, !dish.is_available);
      await onRevalidate();
      onUpdate();
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Error al cambiar disponibilidad");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler para guardar plato (crear o editar)
   * Maneja también la subida de imagen para platos nuevos
   */
  const handleSave = async (
    data: Partial<Dish> & { _pendingImage?: ImageUploadResult }
  ) => {
    setIsLoading(true);

    // Extraer imagen pendiente si existe
    const { _pendingImage, ...dishData } = data;

    try {
      if (editingDish) {
        // Modo edición - la imagen ya fue manejada en DishModal
        await updateDish(editingDish.id, dishData);
      } else {
        // Modo creación
        // 1. Primero crear el plato sin imagen
        const newDish = await createDish(dishData);

        // 2. Si hay imagen pendiente, subirla
        if (_pendingImage && newDish?.id) {
          const uploadResult = await uploadDishImage({
            dishId: newDish.id,
            dishName: dishData.name || "plato",
            imageData: _pendingImage.base64,
            imageSizeKb: _pendingImage.sizeKb,
          });

          if (!uploadResult.success) {
            console.error(
              "Error subiendo imagen para plato nuevo:",
              uploadResult.error
            );
            // El plato se creó pero sin imagen - notificar al usuario
            alert(
              `Plato creado pero hubo un error con la imagen: ${uploadResult.error}`
            );
          }
        }
      }

      await onRevalidate();
      onUpdate();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving dish:", error);
      alert("Error al guardar el plato");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Gestión de Platos
          </h2>
          <p className="text-gray-400">{dishes.length} platos en total</p>
        </div>
        <button onClick={handleCreate} className="btn-fire">
          + Crear Plato
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 mb-6">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterCategory === null
                ? "bg-fire-red text-white"
                : "bg-charcoal-light text-gray-400 hover:text-white"
            }`}
          >
            Todas ({dishes.length})
          </button>
          {categories.map((category) => {
            const count = dishes.filter(
              (d) => d.category_id === category.id
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterCategory === category.id
                    ? "bg-fire-red text-white"
                    : "bg-charcoal-light text-gray-400 hover:text-white"
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de platos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDishes.map((dish) => {
            const category = categories.find((c) => c.id === dish.category_id);
            return (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card overflow-hidden hover:border-fire-red/50 transition-colors"
              >
                {/* Imagen del plato - usa imagen personalizada o por defecto */}
                <div className="relative h-40 w-full">
                  <Image
                    src={dish.image_url || DEFAULT_DISH_IMAGE}
                    alt={dish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 to-transparent" />
                  {/* Indicador de imagen por defecto */}
                  {!dish.image_url && (
                    <div className="absolute top-2 right-2 bg-charcoal-dark/70 px-2 py-1 rounded text-xs text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {dish.name}
                      </h3>
                      <p className="text-sm text-flame-blue-bright">
                        {category?.name}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-fire-red ml-3">
                      {dish.price.toFixed(2)}€
                    </span>
                  </div>

                  {dish.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {dish.description}
                    </p>
                  )}

                  {/* Estado */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      disabled={isLoading}
                      className={`inline-flex items-center text-xs px-3 py-1 rounded-full transition-colors ${
                        dish.is_available
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          dish.is_available
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      />
                      {dish.is_available ? "Disponible" : "No disponible"}
                    </button>

                    {/* Indicador de imagen */}
                    {dish.image_url && (
                      <span className="text-xs text-flame-blue-bright flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Con imagen
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dish)}
                      disabled={isLoading}
                      className="flex-1 bg-flame-blue hover:bg-flame-blue-bright text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(dish)}
                      disabled={isLoading}
                      className="bg-charcoal-light hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl text-gray-400">
            No hay platos en esta categoría
          </p>
        </div>
      )}

      {/* Modal */}
      <DishModal
        isOpen={isModalOpen}
        dish={editingDish}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}
