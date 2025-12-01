"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Dish } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DishCardProps {
  dish: Dish;
  index: number;
}

/**
 * Card individual de plato
 * Diseño optimizado para lectura bajo luz de restaurante
 */
export const DishCard = forwardRef<HTMLDivElement, DishCardProps>(
  ({ dish, index }, ref) => {
    const { language, t } = useLanguage();

    const name = language === "gl" && dish.name_gl ? dish.name_gl : dish.name;
    const description =
      language === "gl" && dish.description_gl
        ? dish.description_gl
        : dish.description;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="glass-card overflow-hidden hover:border-fire-red/50 transition-all group"
      >
        {/* Imagen del plato */}
        {dish.image_url && (
          <div className="relative h-48 bg-charcoal-dark overflow-hidden">
            <Image
              src={dish.image_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-transparent to-transparent" />
          </div>
        )}

        {/* Contenido */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-heading font-bold text-ash-100 group-hover:text-fire-red transition-colors flex-1">
              {name}
            </h4>
            <span className="text-2xl font-heading font-bold text-fire-red ml-3 flex-shrink-0">
              {dish.price.toFixed(2)}€
            </span>
          </div>

          {description && (
            <p className="text-sm text-ash-400 font-body leading-relaxed line-clamp-3">
              {description}
            </p>
          )}

          {/* Indicador de disponibilidad */}
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center text-xs text-green-400 font-body">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Disponible
            </span>

            <button className="text-flame-blue-bright hover:text-flame-blue-glow text-sm font-heading font-medium transition-colors">
              Más info →
            </button>
          </div>
        </div>

        {/* Efecto de brillo al hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fire-red/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      </motion.div>
    );
  }
);

DishCard.displayName = "DishCard";
