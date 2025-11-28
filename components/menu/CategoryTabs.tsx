'use client';

import { motion } from 'framer-motion';
import type { Category } from '@/lib/types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

/**
 * Tabs para filtrar por categoría
 */
export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="sticky top-[73px] z-40 bg-charcoal/95 backdrop-blur-lg py-4 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {/* Tab "Todos" */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(null)}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-fire-red text-white shadow-fire'
              : 'bg-charcoal-light text-gray-400 hover:text-white hover:bg-charcoal-dark'
          }`}
        >
          Todos
        </motion.button>

        {/* Tabs de categorías */}
        {categories
          .sort((a, b) => a.order_index - b.order_index)
          .map(category => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-fire-red text-white shadow-fire'
                  : 'bg-charcoal-light text-gray-400 hover:text-white hover:bg-charcoal-dark'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
      </div>
    </div>
  );
}

