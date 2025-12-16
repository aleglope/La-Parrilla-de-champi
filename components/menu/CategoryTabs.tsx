"use client";

import { useRef, MouseEvent } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftPos.current = scrollContainerRef.current.scrollLeft;
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Reset dragging state with a slight delay to allow onClick to check it
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll-fast

    // Only consider it a drag if moved more than 5px
    if (Math.abs(x - startX.current) > 5) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (isDragging.current) return;
    onSelectCategory(categoryId);
  };

  return (
    <div className="sticky top-[73px] z-40 py-4 -mx-4 px-4 md:mx-0 md:px-0">
      {/* Background container removed to prevent horizontal scroll overflow */}

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="relative flex gap-3 overflow-x-auto hide-scrollbar pb-[2rem] pl-6 pt-[2rem] cursor-grab active:cursor-grabbing select-none"
      >
        {/* Tab "Todos" */}
        <BrandButton
          onClick={() => handleCategoryClick(null)}
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
          .sort((a, b) => a.order_index - b.order_index)
          .map((category) => (
            <BrandButton
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
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
