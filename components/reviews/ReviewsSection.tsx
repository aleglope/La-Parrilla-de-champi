"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  reviews,
  RATING,
  REVIEW_COUNT,
  GOOGLE_MAPS_URL,
} from "@/data/reviews";
import AccordionGallery, {
  type AccordionGalleryItem,
} from "./AccordionGallery";

/**
 * Sección de prueba social: reseñas de Google sobre una galería
 * acordeón (React Bits AccordionGallery, motor GSAP ya instalado).
 * La cabecera usa Framer Motion cubierto por el MotionConfig global;
 * la galería respeta prefers-reduced-motion internamente.
 */

function GoogleLogo({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function Star({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.92 6.26 6.87.83-5.07 4.73 1.34 6.79L12 17.27 5.94 20.6l1.34-6.79L2.21 9.09l6.87-.83L12 2z" />
    </svg>
  );
}

/** Fila de estrellas con relleno parcial según el valor (ej. 4.7) */
function StarRating({
  value,
  starClassName = "w-5 h-5",
}: Readonly<{ value: number; starClassName?: string }>) {
  const stars = [0, 1, 2, 3, 4];
  return (
    <div className="relative inline-flex" aria-hidden="true">
      <div className="flex gap-0.5 text-ash-500/40">
        {stars.map((i) => (
          <Star key={i} className={starClassName} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${(value / 5) * 100}%` }}
      >
        <div className="flex gap-0.5 text-amber-400">
          {stars.map((i) => (
            <Star key={i} className={`${starClassName} shrink-0`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * En pantallas estrechas la galería pasa a vertical y se activa al tocar.
 *
 * En horizontal, con 6 paneles sobre 390 px, el activo se queda en ~200 px y
 * la reseña no cabe: el texto quedaba ilegible. Apilados, el panel abierto
 * ocupa el ancho completo. Además `hover` no existe en táctil, así que el
 * disparador pasa a `click`.
 */
function useEsMovil() {
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (hover: none)");
    const actualizar = () => setEsMovil(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  return esMovil;
}

export function ReviewsSection() {
  const { t } = useLanguage();
  const esMovil = useEsMovil();

  const galleryItems: AccordionGalleryItem[] = reviews.map((review) => ({
    image: review.image,
    alt: review.imageAlt,
    objectPosition: review.objectPosition,
    label: `${review.author} · ${review.rating}/5`,
    content: (
      <span className="ag-review">
        <StarRating value={review.rating} starClassName="w-3.5 h-3.5" />
        <span className="ag-review__quote">&ldquo;{review.text}&rdquo;</span>
        <span className="ag-review__meta">
          {review.author} · {review.date}
        </span>
      </span>
    ),
  }));

  return (
    <div className="container-custom">
      {/* Cabecera con el agregado de Google */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-4xl md:text-6xl font-display mb-4">
          <span className="gradient-text">{t.reviews.title}</span>
        </h2>
        <p className="text-xl text-ash-300 font-body mb-8">
          {t.reviews.subtitle}
        </p>

        <div className="inline-flex items-center gap-4 glass-card px-6 py-4">
          <GoogleLogo className="w-8 h-8" />
          <span className="text-4xl font-display text-ember">
            {RATING.toLocaleString("es-ES")}
          </span>
          <div className="text-left">
            <StarRating value={RATING} />
            <p className="text-ash-400 text-sm font-body mt-1">
              {t.reviews.basedOn.replace(
                "{count}",
                REVIEW_COUNT.toLocaleString("es-ES")
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Galería acordeón: foto + reseña por panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <AccordionGallery
          items={galleryItems}
          ariaLabel={t.reviews.title}
          defaultIndex={1}
          orientation={esMovil ? "vertical" : "horizontal"}
          expandRatio={esMovil ? 0.62 : 0.52}
          trigger={esMovil ? "click" : "hover"}
          accentColor="#C01F19"
          overlayColor="#1a2324"
          textColor="#F5F3F0"
          grayscale
          showLabels
          duration={0.6}
          ease="power3.out"
          parallax={0.5}
          tilt={8}
          stagger={0.06}
          height={460}
          gap={10}
          radius={16}
        />
      </motion.div>

      {/* Enlace al perfil completo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-ember font-heading font-bold hover:text-fire-red transition-colors"
        >
          {t.reviews.cta}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M7 17L17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
