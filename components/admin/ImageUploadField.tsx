"use client";

/**
 * Componente reutilizable de upload de imágenes
 * Incluye drag & drop, validación client-side, compresión automática
 * y opción de usar imagen por defecto
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateImage,
  compressImage,
  createPreviewUrl,
  revokePreviewUrl,
  IMAGE_CONFIG,
  ERROR_MESSAGES,
  type CompressedImageResult,
} from "@/utils/imageHelpers";
import { ImagePreview } from "./ImagePreview";

// ============ Constantes ============

/** Ruta de la imagen por defecto para platos sin imagen */
export const DEFAULT_DISH_IMAGE = "/images/default-dish.svg";

// ============ Tipos ============

interface ImageUploadFieldProps {
  /** URL de imagen existente (para modo edición) */
  existingImageUrl?: string | null;
  /** Callback cuando se selecciona y comprime una imagen */
  onImageReady: (result: ImageUploadResult | null) => void;
  /** Callback cuando se selecciona usar imagen por defecto */
  onUseDefault?: (useDefault: boolean) => void;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Etiqueta del campo */
  label?: string;
  /** Texto de ayuda */
  helpText?: string;
  /** Mostrar opción de imagen por defecto */
  showDefaultOption?: boolean;
}

export interface ImageUploadResult {
  /** Archivo comprimido listo para subir */
  file: File;
  /** Base64 del archivo comprimido */
  base64: string;
  /** URL de preview (blob URL) */
  previewUrl: string;
  /** Tamaño comprimido en KB */
  sizeKb: number;
  /** Tamaño original en KB */
  originalSizeKb: number;
  /** Dimensiones de la imagen */
  dimensions: { width: number; height: number };
}

// ============ Componente ============

export function ImageUploadField({
  existingImageUrl,
  onImageReady,
  onUseDefault,
  disabled = false,
  label = "Imagen del plato",
  helpText,
  showDefaultOption = true,
}: Readonly<ImageUploadFieldProps>) {
  // Estados
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDefaultImage, setUseDefaultImage] = useState(false);
  const [previewData, setPreviewData] = useState<{
    url: string;
    sizeKb: number;
    originalSizeKb: number;
    dimensions: { width: number; height: number };
    isExisting: boolean;
    isDefault?: boolean;
  } | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLButtonElement>(null);

  // Inicializar con imagen existente o por defecto
  useEffect(() => {
    if (existingImageUrl && !previewData) {
      const isDefault = existingImageUrl === DEFAULT_DISH_IMAGE;
      setUseDefaultImage(isDefault);
      setPreviewData({
        url: existingImageUrl,
        sizeKb: 0,
        originalSizeKb: 0,
        dimensions: { width: 0, height: 0 },
        isExisting: true,
        isDefault,
      });
    }
  }, [existingImageUrl, previewData]);

  /**
   * Handler para seleccionar/deseleccionar imagen por defecto
   */
  const handleUseDefaultChange = useCallback(
    (checked: boolean) => {
      setUseDefaultImage(checked);
      setError(null);

      if (checked) {
        // Limpiar preview anterior si no es existente
        if (previewData && !previewData.isExisting) {
          revokePreviewUrl(previewData.url);
        }
        // Establecer preview con imagen por defecto
        setPreviewData({
          url: DEFAULT_DISH_IMAGE,
          sizeKb: 0,
          originalSizeKb: 0,
          dimensions: { width: 800, height: 600 },
          isExisting: false,
          isDefault: true,
        });
        // Notificar al padre que se usa imagen por defecto
        onImageReady(null);
        onUseDefault?.(true);
      } else {
        // Limpiar el preview de imagen por defecto
        setPreviewData(null);
        onUseDefault?.(false);
      }
    },
    [previewData, onImageReady, onUseDefault]
  );

  // Limpiar blob URLs al desmontar
  useEffect(() => {
    return () => {
      if (previewData && !previewData.isExisting) {
        revokePreviewUrl(previewData.url);
      }
    };
  }, [previewData]);

  /**
   * Valida y comprime la imagen
   */
  const validateAndCompress = async (
    file: File
  ): Promise<CompressedImageResult | null> => {
    // Validar imagen
    const validation = await validateImage(file);
    if (!validation.isValid) {
      setError(validation.error || ERROR_MESSAGES.INVALID_TYPE);
      return null;
    }

    // Comprimir imagen
    try {
      return await compressImage(file);
    } catch (compressionError) {
      console.error("Error de compresión:", compressionError);
      setError(ERROR_MESSAGES.COMPRESSION_FAILED);
      return null;
    }
  };

  /**
   * Limpia el preview anterior si es necesario
   */
  const cleanupPreviousPreview = () => {
    if (previewData && !previewData.isExisting && !previewData.isDefault) {
      revokePreviewUrl(previewData.url);
    }
  };

  /**
   * Actualiza el estado con la nueva imagen procesada
   */
  const updateImageState = async (compressed: CompressedImageResult) => {
    // Convertir a base64
    const base64 = await fileToBase64(compressed.file);

    // Crear preview URL
    const previewUrl = createPreviewUrl(compressed.file);

    // Limpiar preview anterior
    cleanupPreviousPreview();

    // Resetear opción de imagen por defecto
    setUseDefaultImage(false);
    onUseDefault?.(false);

    // Actualizar estado
    setPreviewData({
      url: previewUrl,
      sizeKb: compressed.sizeKB,
      originalSizeKb: compressed.originalSizeKB,
      dimensions: compressed.dimensions,
      isExisting: false,
      isDefault: false,
    });

    // Notificar al componente padre
    onImageReady({
      file: compressed.file,
      base64,
      previewUrl,
      sizeKb: compressed.sizeKB,
      originalSizeKb: compressed.originalSizeKB,
      dimensions: compressed.dimensions,
    });

    console.log(
      `[ImageUpload] Imagen procesada: ${compressed.originalSizeKB.toFixed(
        1
      )}KB → ${compressed.sizeKB.toFixed(
        1
      )}KB (${compressed.compressionRatio.toFixed(0)}% reducción)`
    );
  };

  /**
   * Procesa el archivo seleccionado: valida y comprime
   */
  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        const compressed = await validateAndCompress(file);
        if (!compressed) {
          return;
        }

        await updateImageState(compressed);
      } catch (err) {
        console.error("Error procesando imagen:", err);
        setError(ERROR_MESSAGES.COMPRESSION_FAILED);
      } finally {
        setIsProcessing(false);
      }
    },
    [onImageReady, previewData, onUseDefault]
  );

  /**
   * Convierte un File a base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handler para cambio de archivo via input
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Resetear input para permitir seleccionar el mismo archivo
      e.target.value = "";
    },
    [processFile]
  );

  /**
   * Handler para eliminar imagen
   */
  const handleRemove = useCallback(() => {
    if (previewData && !previewData.isExisting && !previewData.isDefault) {
      revokePreviewUrl(previewData.url);
    }
    setPreviewData(null);
    setError(null);
    setUseDefaultImage(false);
    onImageReady(null);
    onUseDefault?.(false);
  }, [previewData, onImageReady, onUseDefault]);

  /**
   * Handlers de drag & drop
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo desactivar si salimos del dropzone
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, processFile]
  );

  /**
   * Click en zona de drop abre el selector de archivos
   */
  const handleZoneClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  // Texto de formatos permitidos
  const allowedFormatsText =
    IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(", ").toUpperCase();

  /**
   * Renderiza la zona de upload o el botón de cambiar imagen
   */
  const renderUploadZone = () => {
    // No mostrar nada si usa imagen por defecto
    if (useDefaultImage) return null;

    // Si no hay preview, mostrar zona de drop
    if (!previewData) {
      return (
        <button
          type="button"
          ref={dropZoneRef}
          onClick={handleZoneClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          disabled={disabled}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 w-full
            ${
              isDragging
                ? "border-fire-red bg-fire-red/10"
                : "border-flame-blue/30 hover:border-flame-blue/60 bg-charcoal-dark/50"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {/* Icono */}
          <div
            className={`mx-auto w-12 h-12 mb-4 ${
              isDragging ? "text-fire-red" : "text-flame-blue-bright"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Texto */}
          <p className="text-gray-300 mb-2">
            {isDragging ? (
              <span className="text-fire-red font-semibold">
                Suelta la imagen aquí
              </span>
            ) : (
              <>
                <span className="text-fire-red font-semibold">Haz clic</span> o
                arrastra una imagen
              </>
            )}
          </p>

          {/* Info de formatos */}
          <p className="text-xs text-gray-500">
            {allowedFormatsText} • Máx{" "}
            {IMAGE_CONFIG.MAX_SIZE_BEFORE_COMPRESSION / 1024 / 1024}MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Se comprimirá automáticamente a WebP (máx{" "}
            {IMAGE_CONFIG.TARGET_SIZE_KB}KB)
          </p>

          {/* Input oculto */}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_CONFIG.ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </button>
      );
    }

    // Si hay preview pero no es por defecto, mostrar botón de cambiar
    if (previewData && !previewData.isDefault) {
      return (
        <button
          type="button"
          onClick={handleZoneClick}
          disabled={disabled || isProcessing}
          className="w-full py-3 px-4 border border-flame-blue/30 rounded-lg text-flame-blue-bright hover:bg-flame-blue/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-flame-blue-bright border-t-transparent rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Cambiar imagen
            </span>
          )}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {/* Opción de usar imagen por defecto */}
      {showDefaultOption && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-dark/50 border border-white/5">
          <label
            className="relative inline-flex items-center cursor-pointer"
            aria-label="Usar imagen por defecto"
          >
            <input
              type="checkbox"
              checked={useDefaultImage}
              onChange={(e) => handleUseDefaultChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fire-red/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fire-red"></div>
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-200">Sin imagen personalizada</p>
            <p className="text-xs text-gray-500">
              Se mostrará una imagen genérica de plato
            </p>
          </div>
          {useDefaultImage && (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-fire-red/30">
              <img
                src={DEFAULT_DISH_IMAGE}
                alt="Imagen por defecto"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Preview de imagen existente o nueva (solo si no usa default) */}
      <AnimatePresence mode="wait">
        {previewData && !previewData.isDefault && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ImagePreview
              imageUrl={previewData.url}
              altText="Preview del plato"
              originalSizeKb={previewData.originalSizeKb}
              compressedSizeKb={previewData.sizeKb}
              dimensions={previewData.dimensions}
              isLoading={isProcessing}
              onRemove={handleRemove}
              canRemove={!disabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zona de drop / Botón de cambiar (solo si no usa imagen por defecto) */}
      {renderUploadZone()}

      {/* Input oculto para cuando hay preview */}
      {previewData && (
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_CONFIG.ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      )}

      {/* Mensaje de error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-fire-red/10 border border-fire-red/30 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-fire-red flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-fire-red">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Texto de ayuda */}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* Estado de procesamiento */}
      <AnimatePresence>
        {isProcessing && !previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 p-4 bg-charcoal-dark rounded-lg"
          >
            <div className="w-6 h-6 border-2 border-flame-blue-bright border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-300">
              Comprimiendo imagen...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
