"use client";

import type { Category } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import BrandButton from "@/components/ui/BrandButton";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

/**
 * Tabs para filtrar por categoría
 */
export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  const { language } = useLanguage();

  return (
    <div className="sticky top-[73px] z-40 py-4 -mx-4 px-4 md:mx-0 md:px-0">
      {/* Background container removed to prevent horizontal scroll overflow */}

      <div className="relative flex gap-3 overflow-x-auto hide-scrollbar pb-[2rem] pl-6 pt-[2rem]">
        {/* Tab "Todos" */}
        <BrandButton
          onClick={() => onSelectCategory(null)}
          className={`!min-w-fit !h-12 !rounded-full transition-all duration-300 flex-shrink-0 ${
            selectedCategory === null
              ? "!border-fire-red !shadow-[0_0_20px_rgba(192,31,25,0.5)]"
              : ""
          }`}
        >
          <span
            className={
              selectedCategory === null
                ? "text-fire-red font-bold"
                : "text-gray-300"
            }
          >
            {language === "es" ? "Todos" : "Todos"}
          </span>
        </BrandButton>

        {/* Tabs de categorías */}
        {categories
          .filter((c) => !c.parent_id) // Only show root categories
          .sort((a, b) => a.order_index - b.order_index)
          .map((category) => (
            <BrandButton
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`!min-w-fit !rounded-full !h-12 transition-all duration-300 flex-shrink-0 ${
                selectedCategory === category.id
                  ? "!border-fire-red !shadow-[0_0_20px_rgba(192,31,25,0.5)]"
                  : ""
              }`}
            >
              <span
                className={
                  selectedCategory === category.id
                    ? "text-fire-red font-bold"
                    : "text-gray-300"
                }
              >
                {language === "gl" && category.name_gl
                  ? category.name_gl
                  : category.name}
              </span>
            </BrandButton>
          ))}
      </div>
    </div>
  );
}
