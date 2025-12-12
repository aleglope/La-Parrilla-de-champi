"use client";

/**
 * Componente de preview de imagen con información de compresión
 * Muestra la imagen comprimida y estadísticas de optimización
 */

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImagePreviewProps {
  /** URL de la imagen (blob URL o URL de Supabase) */
  imageUrl: string | null;
  /** Nombre alternativo para accesibilidad */
  altText: string;
  /** Tamaño original en KB (antes de comprimir) */
  originalSizeKb?: number;
  /** Tamaño comprimido en KB */
  compressedSizeKb?: number;
  /** Si está cargando/procesando */
  isLoading?: boolean;
  /** Callback para eliminar la imagen */
  onRemove?: () => void;
  /** Si se puede eliminar */
  canRemove?: boolean;
  /** Dimensiones de la imagen */
  dimensions?: { width: number; height: number };
}

export function ImagePreview({
  imageUrl,
  altText,
  originalSizeKb,
  compressedSizeKb,
  isLoading = false,
  onRemove,
  canRemove = true,
  dimensions,
}: ImagePreviewProps) {
  // Calcular ratio de compresión
  const compressionRatio =
    originalSizeKb && compressedSizeKb
      ? Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)
      : null;

  if (!imageUrl && !isLoading) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative rounded-xl overflow-hidden border border-flame-blue/30 bg-charcoal-dark"
      >
        {/* Contenedor de imagen con aspect ratio fijo */}
        <div className="relative aspect-[4/3] w-full bg-charcoal">
          {isLoading ? (
            // Estado de carga
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-fire-red border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">
                  Comprimiendo imagen...
                </span>
              </div>
            </div>
          ) : imageUrl ? (
            // Imagen
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized // Evitar costos de Vercel Image Optimization
            />
          ) : null}

          {/* Overlay con gradiente */}
          {imageUrl && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-transparent to-transparent" />
          )}

          {/* Botón eliminar */}
          {imageUrl && !isLoading && canRemove && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-3 right-3 p-2 rounded-full bg-charcoal-dark/80 hover:bg-fire-red text-white transition-colors group"
              aria-label="Eliminar imagen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Información de compresión */}
        {((compressedSizeKb && compressedSizeKb > 0) ||
          (dimensions && dimensions.width > 0 && dimensions.height > 0)) &&
          !isLoading && (
            <div className="p-3 border-t border-flame-blue/20">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Tamaño */}
                {compressedSizeKb && compressedSizeKb > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-flame-blue-bright"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-300">
                      <span className="font-semibold text-white">
                        {compressedSizeKb.toFixed(1)}
                      </span>{" "}
                      KB
                    </span>
                  </div>
                )}

                {/* Dimensiones */}
                {dimensions &&
                  dimensions.width > 0 &&
                  dimensions.height > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-flame-blue-bright"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      <span className="text-gray-300">
                        {dimensions.width} × {dimensions.height}
                      </span>
                    </div>
                  )}

                {/* Ratio de compresión */}
                {compressionRatio !== null && compressionRatio > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span className="text-emerald-400 font-semibold">
                      -{compressionRatio}%
                    </span>
                  </div>
                )}
              </div>

              {/* Barra de progreso visual del tamaño */}
              {compressedSizeKb && compressedSizeKb > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-charcoal rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (compressedSizeKb / 150) * 100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        compressedSizeKb <= 100
                          ? "bg-emerald-500"
                          : compressedSizeKb <= 150
                          ? "bg-flame-blue-bright"
                          : "bg-fire-red"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {compressedSizeKb <= 150
                      ? "✓ Tamaño óptimo"
                      : "⚠ Considera reducir el tamaño"}
                  </p>
                </div>
              )}
            </div>
          )}
      </motion.div>
    </AnimatePresence>
  );
}
