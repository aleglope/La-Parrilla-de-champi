"use client";

/**
 * Modal para crear/editar platos
 * Integra el sistema de upload de imágenes con compresión automática
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, Dish } from "@/lib/types";
import { ImageUploadField, type ImageUploadResult } from "./ImageUploadField";
import { updateDishImage } from "@/app/actions/updateDishImage";
import { deleteDishImage } from "@/app/actions/deleteDishImage";

interface DishModalProps {
  readonly isOpen: boolean;
  readonly dish: Dish | null;
  readonly categories: Category[];
  readonly onClose: () => void;
  readonly onSave: (data: Partial<Dish>) => void;
  readonly isLoading: boolean;
}

// Estado inicial del formulario
const getInitialFormState = (dish: Dish | null, categories: Category[]) => ({
  name: dish?.name || "",
  name_gl: dish?.name_gl || "",
  description: dish?.description || "",
  description_gl: dish?.description_gl || "",
  price: dish?.price || 0,
  category_id: dish?.category_id || categories[0]?.id || "",
  image_url: dish?.image_url || "",
  is_available: dish?.is_available ?? true,
  order_index: dish?.order_index || 0,
});

export function DishModal({
  isOpen,
  dish,
  categories,
  onClose,
  onSave,
  isLoading,
}: DishModalProps) {
  // Estado del formulario
  const [formData, setFormData] = useState(
    getInitialFormState(dish, categories)
  );

  // Estado de la imagen
  const [pendingImage, setPendingImage] = useState<ImageUploadResult | null>(
    null
  );
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resetear formulario cuando cambia el plato o se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormState(dish, categories));
      setPendingImage(null);
      setImageRemoved(false);
      setUploadError(null);
    }
  }, [dish, categories, isOpen]);

  /**
   * Handler cuando se selecciona una nueva imagen
   */
  const handleImageReady = useCallback(
    (result: ImageUploadResult | null) => {
      setPendingImage(result);
      setImageRemoved(result === null && !!dish?.image_url);
      setUploadError(null);
    },
    [dish?.image_url]
  );

  /**
   * Helper: Maneja la actualización de imagen para un plato existente
   */
  const handleUpdateDishImage = async () => {
    if (!dish) return null;

    const result = await updateDishImage({
      dishId: dish.id,
      dishName: formData.name,
      imageData: pendingImage!.base64,
      imageSizeKb: pendingImage!.sizeKb,
      oldImageUrl: dish.image_url,
    });

    if (!result.success) {
      setUploadError(result.error || "Error al subir la imagen");
      return null;
    }

    // Actualizar formData con la nueva URL
    setFormData((prev) => ({
      ...prev,
      image_url: result.imageUrl || "",
    }));

    return result.imageUrl;
  };

  /**
   * Helper: Maneja el upload de imagen para un plato nuevo
   */
  const handleUploadNewImage = () => {
    // Para platos nuevos, guardamos los datos y el componente padre manejará el upload
    onSave({
      ...formData,
      _pendingImage: pendingImage,
    } as Partial<Dish> & { _pendingImage?: ImageUploadResult });
  };

  /**
   * Helper: Maneja la eliminación de una imagen existente
   */
  const handleRemoveImage = async () => {
    if (!dish?.image_url) return;

    try {
      const result = await deleteDishImage({
        dishId: dish.id,
        imageUrl: dish.image_url,
        updateDatabase: false, // Lo actualizaremos con el resto de datos
      });

      if (!result.success) {
        console.warn("No se pudo eliminar la imagen:", result.error);
      }
    } catch (error) {
      console.error("Error eliminando imagen:", error);
    }

    // Guardar plato sin imagen (continuar aunque falle la eliminación)
    onSave({
      ...formData,
      image_url: null,
    });
  };

  /**
   * Handler para submit del formulario
   * Maneja el upload de imagen y luego guarda el plato
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Si hay imagen pendiente, primero la subimos
    if (pendingImage) {
      setIsUploadingImage(true);

      try {
        const isEditing = !!dish;

        if (isEditing) {
          const imageUrl = await handleUpdateDishImage();
          if (!imageUrl) {
            setIsUploadingImage(false);
            return;
          }

          onSave({
            ...formData,
            image_url: imageUrl,
          });
        } else {
          handleUploadNewImage();
        }
      } catch (error) {
        console.error("Error en upload de imagen:", error);
        setUploadError("Error inesperado al subir la imagen");
      } finally {
        setIsUploadingImage(false);
      }
      return;
    }

    // Si se eliminó la imagen existente
    if (imageRemoved && dish?.image_url) {
      setIsUploadingImage(true);
      await handleRemoveImage();
      setIsUploadingImage(false);
      return;
    }

    // Sin cambios en imagen, guardar normalmente
    onSave(formData);
  };

  // Estado de carga combinado
  const isSaving = isLoading || isUploadingImage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {dish ? "Editar Plato" : "Crear Plato"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dish-name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Nombre (Castellano) *
                  </label>
                  <input
                    id="dish-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="Ej: Chuletón"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dish-name-gl"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Nombre (Gallego)
                  </label>
                  <input
                    id="dish-name-gl"
                    type="text"
                    value={formData.name_gl}
                    onChange={(e) =>
                      setFormData({ ...formData, name_gl: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="Ej: Chuletón (gallego)"
                  />
                </div>
              </div>

              {/* Descripciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dish-description"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Descripción (Castellano)
                  </label>
                  <textarea
                    id="dish-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors resize-none"
                    placeholder="Descripción..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="dish-description-gl"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Descripción (Gallego)
                  </label>
                  <textarea
                    id="dish-description-gl"
                    value={formData.description_gl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description_gl: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors resize-none"
                    placeholder="Descripción en gallego..."
                  />
                </div>
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dish-price"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Precio (€) *
                  </label>
                  <input
                    id="dish-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dish-category"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Categoría *
                  </label>
                  <select
                    id="dish-category"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white focus:outline-none focus:border-fire-red transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload de imagen */}
              <div className="pt-2">
                <ImageUploadField
                  existingImageUrl={
                    imageRemoved ? null : dish?.image_url || null
                  }
                  onImageReady={handleImageReady}
                  disabled={isSaving}
                  label="Imagen del plato"
                  helpText="La imagen se comprimirá automáticamente a formato WebP optimizado"
                />

                {/* Error de upload */}
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 p-3 bg-fire-red/10 border border-fire-red/30 rounded-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-fire-red flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-fire-red">{uploadError}</p>
                  </motion.div>
                )}
              </div>

              {/* Orden y disponibilidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dish-order"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Orden de aparición
                  </label>
                  <input
                    id="dish-order"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order_index: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                  />
                </div>

                <div className="flex items-end">
                  <label
                    htmlFor="dish-available"
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      id="dish-available"
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_available: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-flame-blue/30 text-fire-red focus:ring-fire-red focus:ring-offset-charcoal-dark"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      Disponible
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 bg-charcoal-light hover:bg-charcoal text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 btn-fire disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isUploadingImage ? "Subiendo imagen..." : "Guardando..."}
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
