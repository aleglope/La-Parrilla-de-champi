"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Dish } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

type LocalizedText = {
  es: string;
  gl: string;
};

const getLocalizedText = (language: Language, text: LocalizedText) =>
  language === "gl" ? text.gl : text.es;

const getAvailabilityLabel = (language: Language, isAvailable: boolean) =>
  isAvailable
    ? getLocalizedText(language, { es: "Disponible", gl: "Dispoñible" })
    : getLocalizedText(language, { es: "No disponible", gl: "Non dispoñible" });

const getInfoLabel = (language: Language) =>
  getLocalizedText(language, { es: "Más info", gl: "Máis info" });

const getTapHint = (language: Language) =>
  getLocalizedText(language, {
    es: "Toca para volver",
    gl: "Toca para voltar",
  });

interface DishCardProps {
  dish: Dish;
  index: number;
}

/**
 * Card individual de plato con efecto flip
 * Mantiene datos actuales y muestra la foto al hover (desktop) o tap (móvil)
 */
export const DishCard = forwardRef<HTMLButtonElement, DishCardProps>(
  ({ dish, index }, ref) => {
    const { language } = useLanguage();
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isMobileFlipped, setIsMobileFlipped] = useState(false);

    const name = language === "gl" && dish.name_gl ? dish.name_gl : dish.name;
    const description =
      language === "gl" && dish.description_gl
        ? dish.description_gl
        : dish.description;

    const availabilityLabel = getAvailabilityLabel(language, dish.is_available);
    const infoLabel = getInfoLabel(language);
    const tapHint = getTapHint(language);
    const badgeText = "Selección Champi";

    const canRevealImage = Boolean(dish.image_url);

    useEffect(() => {
      const win = globalThis.window;
      if (!win) return;

      const mediaQuery = win.matchMedia("(hover: none), (pointer: coarse)");
      const updateState = () => setIsTouchDevice(mediaQuery.matches);

      updateState();

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", updateState);
        return () => mediaQuery.removeEventListener("change", updateState);
      }

      return undefined;
    }, []);

    useEffect(() => {
      if (!isTouchDevice) {
        setIsMobileFlipped(false);
      }
    }, [isTouchDevice]);

    const handleToggle = () => {
      if (!isTouchDevice || !canRevealImage) return;
      setIsMobileFlipped((prev) => !prev);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!canRevealImage || !isTouchDevice) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggle();
      }
    };

    const containerClasses = [
      "relative",
      "min-h-[320px]",
      "w-full",
      "p-[3px]",
      "rounded-3xl",
      "text-left",
      "border",
      "border-white/5",
      "bg-transparent",
      "transition-shadow",
      "duration-300",
      "focus:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-fire-red/60",
      "group",
    ];

    if (canRevealImage) {
      containerClasses.push(
        "cursor-pointer",
        "hover:shadow-[0_25px_70px_rgba(192,31,25,0.25)]"
      );
    } else {
      containerClasses.push("cursor-default");
    }

    const cardClassName = `${containerClasses.join(" ")} dish-card${
      canRevealImage ? " dish-card--flippable" : ""
    }`;

    const cardPerspective: CSSProperties | undefined = canRevealImage
      ? { perspective: "1400px" }
      : undefined;

    return (
      <motion.button
        ref={ref}
        layout
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={cardClassName}
        data-has-image={canRevealImage ? "true" : "false"}
        data-flippable={canRevealImage ? "true" : "false"}
        aria-pressed={
          isTouchDevice && canRevealImage ? isMobileFlipped : undefined
        }
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={cardPerspective}
      >
        <span aria-hidden className="card-border-animation" />
        <span aria-hidden className="card-border-glow" />
        <div
          data-touch-flipped={
            isTouchDevice && isMobileFlipped ? "true" : "false"
          }
          className="card-3d relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] data-[touch-flipped=true]:[transform:rotateY(180deg)]"
        >
          {/* Cara frontal */}
          <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-b from-charcoal-dark/95 via-charcoal-dark/80 to-charcoal-dark p-5 text-ash-100 shadow-[0_15px_45px_rgba(0,0,0,0.55)] [backface-visibility:hidden]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-fire-red/30 bg-fire-red/10 px-3 py-1 text-[0.6rem] font-heading uppercase tracking-[0.25em] text-fire-red">
                {badgeText}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h4 className="text-xl font-heading font-bold leading-tight text-ash-50">
                  {name}
                </h4>
                <span className="text-2xl font-heading font-bold text-fire-red whitespace-nowrap">
                  {dish.price.toFixed(2)}€
                </span>
              </div>

              {description && (
                <p className="text-sm font-body leading-relaxed text-ash-300 line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-body text-ash-300">
              <span
                className={`inline-flex items-center gap-2 ${
                  dish.is_available ? "text-emerald-300" : "text-fire-red/70"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    dish.is_available ? "bg-emerald-300" : "bg-fire-red/70"
                  } animate-pulse`}
                />
                {availabilityLabel}
              </span>

              <span className="text-[0.65rem] font-heading uppercase tracking-[0.3em] text-flame-blue-bright">
                {infoLabel}
              </span>
            </div>

            {/* Elementos decorativos */}
            <div className="pointer-events-none absolute -left-6 top-10 h-32 w-32 rounded-full bg-fire-red/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-4 bottom-10 h-24 w-24 rounded-full bg-flame-blue/40 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5" />
          </div>

          {/* Cara posterior con imagen */}
          {canRevealImage && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-fire-red/30 bg-charcoal-dark/80 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Image
                src={dish.image_url!}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-charcoal-dark/10 to-transparent" />
              {isTouchDevice && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <span className="rounded-full bg-charcoal-dark/70 px-4 py-1 text-xs font-heading tracking-[0.2em] text-ash-100">
                    {tapHint}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.button>
    );
  }
);

DishCard.displayName = "DishCard";
