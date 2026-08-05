"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const VIDEO_ID = "uvE0oEGzciU";

/**
 * Bloque de video de YouTube con fachada (facade).
 * Muestra una miniatura estática y solo monta el iframe cuando el
 * usuario pulsa play. Así:
 * - No hay peticiones a YouTube/Google en la carga inicial
 *   (antes ~89 por visita al montarse dos iframes con autoplay)
 * - No se instalan cookies de terceros (doubleclick, googleads)
 *   sin una acción explícita del visitante
 */
export function VideoBlock() {
  const [playing, setPlaying] = useState(false);
  const { t } = useLanguage();

  if (playing) {
    return (
      <div className="relative w-full h-full min-h-[400px] md:min-h-[250px] bg-charcoal-dark">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&rel=0`}
          title="La Parrilla de Champi"
          style={{ border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={t.hero.video}
      className="relative block w-full h-full min-h-[400px] md:min-h-[250px] bg-charcoal-dark overflow-hidden group cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
        alt={t.hero.video}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-fire-red/90 group-hover:bg-fire-red group-hover:scale-110 transition-all shadow-lg">
          <svg
            className="w-8 h-8 text-white ml-1"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
