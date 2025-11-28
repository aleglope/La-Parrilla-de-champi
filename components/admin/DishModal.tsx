'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category, Dish } from '@/lib/types';

interface DishModalProps {
  isOpen: boolean;
  dish: Dish | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Dish>) => void;
  isLoading: boolean;
}

export function DishModal({ isOpen, dish, categories, onClose, onSave, isLoading }: DishModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_gl: '',
    description: '',
    description_gl: '',
    price: 0,
    category_id: '',
    image_url: '',
    is_available: true,
    order_index: 0,
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        name_gl: dish.name_gl || '',
        description: dish.description || '',
        description_gl: dish.description_gl || '',
        price: dish.price,
        category_id: dish.category_id,
        image_url: dish.image_url || '',
        is_available: dish.is_available,
        order_index: dish.order_index,
      });
    } else {
      setFormData({
        name: '',
        name_gl: '',
        description: '',
        description_gl: '',
        price: 0,
        category_id: categories[0]?.id || '',
        image_url: '',
        is_available: true,
        order_index: 0,
      });
    }
  }, [dish, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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
              {dish ? 'Editar Plato' : 'Crear Plato'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre (Castellano) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="Ej: Chuletón"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre (Gallego)
                  </label>
                  <input
                    type="text"
                    value={formData.name_gl}
                    onChange={(e) => setFormData({ ...formData, name_gl: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="Ej: Chuletón (gallego)"
                  />
                </div>
              </div>

              {/* Descripciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (Castellano)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors resize-none"
                    placeholder="Descripción..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (Gallego)
                  </label>
                  <textarea
                    value={formData.description_gl}
                    onChange={(e) => setFormData({ ...formData, description_gl: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors resize-none"
                    placeholder="Descripción en gallego..."
                  />
                </div>
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white focus:outline-none focus:border-fire-red transition-colors"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Orden y disponibilidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
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
                  disabled={isLoading}
                  className="flex-1 bg-charcoal-light hover:bg-charcoal text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-fire disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

