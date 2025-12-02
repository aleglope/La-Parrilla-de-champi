"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DishCard } from "./DishCard";
import { CategoryTabs } from "./CategoryTabs";
import type { Category, Dish } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MenuContentProps {
  categories: Category[];
  dishes: Dish[];
}

/**
 * Contenido principal del menú con filtrado por categorías
 * Optimizado para carga rápida y UX fluida
 */
export function MenuContent({ categories, dishes }: MenuContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t, language } = useLanguage();

  // Filtrar platos por categoría seleccionada
  const filteredDishes = selectedCategory
    ? dishes.filter(
        (dish) => dish.category_id === selectedCategory && dish.is_available
      )
    : dishes.filter((dish) => dish.is_available);

  // Agrupar platos por categoría
  const dishesByCategory = categories.map((category) => ({
    ...category,
    dishes: filteredDishes.filter((dish) => dish.category_id === category.id),
  }));

  return (
    <div className="container-custom py-8">
      {/* Mensaje de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-display text-ash-50 mb-3 uppercase tracking-[0.45em] drop-shadow-[0_5px_30px_rgba(192,31,25,0.35)]">
          {t.menu.title}
        </h2>
        <p className="text-ash-300 font-heading text-sm md:text-base uppercase tracking-[0.55em]">
          <span className="text-ember">{t.menu.subtitle}</span>
        </p>
      </motion.div>

      {/* Tabs de categorías */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Lista de platos */}
      <div className="mt-8">
        {dishesByCategory.map((category) => {
          if (category.dishes.length === 0) return null;

          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              {!selectedCategory && (
                <h3 className="text-2xl font-heading font-bold text-ash-100 mb-6 border-b border-flame-blue/30 pb-3">
                  {language === "gl" && category.name_gl
                    ? category.name_gl
                    : category.name}
                </h3>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {category.dishes
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((dish, index) => (
                      <DishCard key={dish.id} dish={dish} index={index} />
                    ))}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}

        {/* Mensaje si no hay platos */}
        {filteredDishes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl text-ash-400 font-body">{t.menu.empty}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
