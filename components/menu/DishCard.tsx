"use client";

/**
 * Card individual de plato con efecto flip
 * Optimizado para carga de imágenes con lazy loading y prioridad
 * Muestra imagen por defecto cuando no hay imagen personalizada
 */

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import type { Dish } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

/** Ruta de la imagen por defecto para platos sin imagen */
const DEFAULT_DISH_IMAGE = "/images/default-dish.svg";

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
  getLocalizedText(language, { es: "FOTO →", gl: "FOTO →" });

const getTapHint = (language: Language) =>
  getLocalizedText(language, {
    es: "Toca para volver",
    gl: "Toca para voltar",
  });

/**
 * Obtiene el contenido localizado del plato
 */
const getLocalizedDishContent = (dish: Dish, language: Language) => ({
  name: language === "gl" && dish.name_gl ? dish.name_gl : dish.name,
  description:
    language === "gl" && dish.description_gl
      ? dish.description_gl
      : dish.description,
});

interface DishCardProps {
  dish: Dish;
  index: number;
  /** Si es true, la imagen se carga con prioridad (para above-the-fold) */
  priority?: boolean;
}

/**
 * Hook para detectar dispositivos táctiles
 */
const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  return isTouchDevice;
};

/**
 * Hook para manejar click fuera del elemento
 */
const useClickOutside = (
  ref: React.ForwardedRef<HTMLButtonElement>,
  isActive: boolean,
  callback: () => void
) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const isOutside =
        ref &&
        "current" in ref &&
        ref.current &&
        !ref.current.contains(event.target as Node);

      if (isOutside) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isActive, ref, callback]);
};

/**
 * Genera las clases CSS para el contenedor de la card
 */
const getContainerClasses = (canRevealImage: boolean): string => {
  const baseClasses = [
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

  const interactionClasses = canRevealImage
    ? ["cursor-pointer", "hover:shadow-[0_25px_70px_rgba(192,31,25,0.25)]"]
    : ["cursor-default"];

  const allClasses = [...baseClasses, ...interactionClasses];
  const baseClassName = allClasses.join(" ");
  const modifierClass = canRevealImage ? " dish-card--flippable" : "";

  return `${baseClassName} dish-card${modifierClass}`;
};

/**
 * Card individual de plato con efecto flip
 * Mantiene datos actuales y muestra la foto al hover (desktop) o tap (móvil)
 */
export const DishCard = forwardRef<HTMLButtonElement, DishCardProps>(
  ({ dish, index, priority = false }, ref) => {
    const { language } = useLanguage();
    const isTouchDevice = useTouchDevice();
    const [isMobileFlipped, setIsMobileFlipped] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { name, description } = getLocalizedDishContent(dish, language);

    const availabilityLabel = getAvailabilityLabel(language, dish.is_available);
    const tapHint = getTapHint(language);
    const badgeText = "Selección Champi";

    // Determinar qué imagen mostrar
    const hasCustomImage = Boolean(dish.image_url) && !imageError;
    const imageToShow = hasCustomImage ? dish.image_url! : DEFAULT_DISH_IMAGE;
    const canRevealImage = !imageError;

    // Resetear flip cuando cambia el tipo de dispositivo
    useEffect(() => {
      if (!isTouchDevice) {
        setIsMobileFlipped(false);
      }
    }, [isTouchDevice]);

    // Resetear error de imagen cuando cambia la URL
    useEffect(() => {
      setImageError(false);
    }, [dish.image_url]);

    const handleToggle = () => {
      const shouldToggle = isTouchDevice && canRevealImage;
      if (shouldToggle) {
        setIsMobileFlipped((prev) => !prev);
      }
    };

    const closeFlip = () => setIsMobileFlipped(false);
    useClickOutside(ref, isMobileFlipped && isTouchDevice, closeFlip);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const isActivationKey = event.key === "Enter" || event.key === " ";
      const shouldHandle = canRevealImage && isTouchDevice && isActivationKey;

      if (shouldHandle) {
        event.preventDefault();
        handleToggle();
      }
    };

    const handleImageError = () => {
      console.warn(`[DishCard] Error cargando imagen para: ${dish.name}`);
      setImageError(true);
    };

    const cardClassName = getContainerClasses(canRevealImage);
    const cardPerspective: CSSProperties | undefined = canRevealImage
      ? { perspective: "1400px" }
      : undefined;

    // Determinar loading strategy basado en prioridad
    const shouldPrioritize = priority || index < 6;

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
        <div
          data-touch-flipped={
            isTouchDevice && isMobileFlipped ? "true" : "false"
          }
          className="card-3d relative h-full w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            WebkitFontSmoothing: "antialiased",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          {/* Cara frontal */}
          <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-b from-charcoal-dark via-charcoal-dark/95 to-charcoal-dark p-5 text-ash-100 shadow-[0_15px_45px_rgba(0,0,0,0.55)] [backface-visibility:hidden]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-fire-red/30 bg-fire-red/10 px-3 py-1 text-[0.6rem] font-heading uppercase tracking-[0.25em] text-fire-red">
                {badgeText}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h4 className="text-4xl font-heading font-bold leading-tight text-ash-50">
                  {name}
                </h4>
                <span className="text-2xl font-heading font-bold text-fire-red whitespace-nowrap">
                  {dish.price.toFixed(2)}€
                </span>
              </div>

              {description && (
                <p className="text-base font-body leading-relaxed text-ash-300 line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm font-body text-ash-300">
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

              {canRevealImage && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-[0.85rem] font-heading uppercase tracking-[0.3em] text-flame-blue-bright">
                    FOTO
                  </span>
                  <span className="text-[1.2rem] text-flame-blue-bright">
                    →
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Cara posterior con imagen */}
          {canRevealImage && (
            <div
              className="absolute inset-0 rounded-3xl border border-fire-red/30 bg-charcoal-dark"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Imagen usando img estándar para máxima compatibilidad */}
              <img
                src={imageToShow}
                alt={`${name} - La Parrilla de Champi, Noia`}
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                loading={shouldPrioritize ? "eager" : "lazy"}
                onError={handleImageError}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-charcoal-dark/90 via-charcoal-dark/20 to-transparent pointer-events-none" />

              {/* Nombre del plato en la imagen */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h4 className="text-lg font-heading font-bold text-white drop-shadow-lg">
                  {name}
                </h4>
                <span className="text-xl font-heading font-bold text-fire-red drop-shadow-lg">
                  {dish.price.toFixed(2)}€
                </span>
              </div>

              {isTouchDevice && (
                <div className="absolute inset-x-0 top-4 flex justify-center z-10">
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
