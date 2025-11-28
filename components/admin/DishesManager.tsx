'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createDish, updateDish, deleteDish, toggleDishAvailability } from '@/lib/supabase/menu-service';
import { DishModal } from './DishModal';
import type { Category, Dish } from '@/lib/types';

interface DishesManagerProps {
  dishes: Dish[];
  categories: Category[];
  onUpdate: () => void;
  onRevalidate: () => void;
}

export function DishesManager({ dishes, categories, onUpdate, onRevalidate }: DishesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredDishes = filterCategory
    ? dishes.filter(dish => dish.category_id === filterCategory)
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
      await deleteDish(dish.id);
      await onRevalidate();
      onUpdate();
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Error al eliminar el plato');
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
      console.error('Error toggling availability:', error);
      alert('Error al cambiar disponibilidad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: Partial<Dish>) => {
    setIsLoading(true);
    try {
      if (editingDish) {
        await updateDish(editingDish.id, data);
      } else {
        await createDish(data);
      }
      await onRevalidate();
      onUpdate();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving dish:', error);
      alert('Error al guardar el plato');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestión de Platos</h2>
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
                ? 'bg-fire-red text-white'
                : 'bg-charcoal-light text-gray-400 hover:text-white'
            }`}
          >
            Todas ({dishes.length})
          </button>
          {categories.map(category => {
            const count = dishes.filter(d => d.category_id === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterCategory === category.id
                    ? 'bg-fire-red text-white'
                    : 'bg-charcoal-light text-gray-400 hover:text-white'
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
            const category = categories.find(c => c.id === dish.category_id);
            return (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-5 hover:border-fire-red/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{dish.name}</h3>
                    <p className="text-sm text-flame-blue-bright">{category?.name}</p>
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
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      dish.is_available ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`} />
                    {dish.is_available ? 'Disponible' : 'No disponible'}
                  </button>
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl text-gray-400">No hay platos en esta categoría</p>
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

