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

  // 1. Identify active categories (selected root + its children)
  const activeCategoryIds = new Set<string>();

  if (selectedCategory) {
    activeCategoryIds.add(selectedCategory);
    // Add children of selected category
    categories
      .filter((c) => c.parent_id === selectedCategory)
      .forEach((c) => activeCategoryIds.add(c.id));
  }

  // 2. Filter dish list based on active categories
  const filteredDishes = selectedCategory
    ? dishes.filter(
        (dish) => activeCategoryIds.has(dish.category_id) && dish.is_available
      )
    : dishes.filter((dish) => dish.is_available);

  // 3. Group dishes for display
  // If a category is selected, we might want to show its children as subsections
  // If "All" is selected, we show all Roots (and maybe flatness or hierarchy? Let's stick to Roots for "All")

  // Strategy:
  // - If "All" (null): Show all Root categories. For each Root, if it has dishes, show them. If it has children with dishes, maybe show those too flattened or substructured?
  //   Let's simplify: If "All", show Roots. If a Root has children, we need to decide how to show them.
  //   Better approach for "All": Show everything grouped by their *Display Category*.
  //   If I am a child category (e.g. Rioja), my dishes should probably appear under "Rioja".

  // Let's iterate through ALL categories that have dishes in the filtered set.
  const categoriesToShow = categories.filter((c) => {
    // Show if it has dishes in the filtered list
    const hasDishes = filteredDishes.some((d) => d.category_id === c.id);
    if (hasDishes) return true;
    return false;
  });

  const dishesByCategory = categoriesToShow.map((category) => ({
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
        {dishesByCategory
          .sort((a, b) => {
            // Custom sort: Roots first? Or just order_index?
            // Simplest: just order_index. If we want parents before children, we might need logic.
            // But usually children order_index is distinct.
            return a.order_index - b.order_index;
          })
          .map((category) => {
            if (category.dishes.length === 0) return null;

            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-12"
              >
                {/* Show header if "All" is selected OR if we are viewing a child category within a parent selection */}
                {(!selectedCategory ||
                  category.parent_id === selectedCategory) && (
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
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          index={index}
                          // Priorizar carga de primeras 6 imágenes (above-the-fold)
                          priority={index < 6}
                        />
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
