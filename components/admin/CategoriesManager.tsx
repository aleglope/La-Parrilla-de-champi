'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCategory, updateCategory, deleteCategory } from '@/lib/supabase/menu-service';
import { CategoryModal } from './CategoryModal';
import type { Category } from '@/lib/types';

interface CategoriesManagerProps {
  categories: Category[];
  onUpdate: () => void;
  onRevalidate: () => void;
}

export function CategoriesManager({ categories, onUpdate, onRevalidate }: CategoriesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Esto eliminará también todos sus platos.`)) return;

    setIsLoading(true);
    try {
      await deleteCategory(category.id);
      await onRevalidate();
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (name: string, orderIndex: number) => {
    setIsLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name, orderIndex);
      } else {
        await createCategory(name, orderIndex);
      }
      await onRevalidate();
      onUpdate();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestión de Categorías</h2>
          <p className="text-gray-400">{categories.length} categorías en total</p>
        </div>
        <button onClick={handleCreate} className="btn-fire">
          + Crear Categoría
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {categories
            .sort((a, b) => a.order_index - b.order_index)
            .map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-5 hover:border-flame-blue-bright/50 transition-colors"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-white text-xl mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-400">
                    Orden: {category.order_index}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    disabled={isLoading}
                    className="flex-1 bg-flame-blue hover:bg-flame-blue-bright text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={isLoading}
                    className="bg-charcoal-light hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}

