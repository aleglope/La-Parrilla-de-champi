'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '@/lib/types';

interface CategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (name: string, nameGl: string, orderIndex: number) => void;
  isLoading: boolean;
}

export function CategoryModal({ isOpen, category, onClose, onSave, isLoading }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [nameGl, setNameGl] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setNameGl(category.name_gl || '');
      setOrderIndex(category.order_index);
    } else {
      setName('');
      setNameGl('');
      setOrderIndex(0);
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, nameGl, orderIndex);
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
            className="relative glass-card p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {category ? 'Editar Categoría' : 'Crear Categoría'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre Castellano */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre (Castellano) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                  placeholder="Ej: Entrantes"
                />
              </div>

              {/* Nombre Gallego */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre (Gallego)
                </label>
                <input
                  type="text"
                  value={nameGl}
                  onChange={(e) => setNameGl(e.target.value)}
                  className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                  placeholder="Ej: Entrantes (en gallego)"
                />
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Orden de aparición
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-charcoal-dark border border-flame-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-red transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Las categorías se ordenan de menor a mayor
                </p>
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

