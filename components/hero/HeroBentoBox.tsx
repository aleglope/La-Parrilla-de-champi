"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ChampiLogoReveal from "./ChampiLogoReveal";
import { VideoBlock } from "./VideoBlock";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import BrandButton from "@/components/ui/BrandButton";

/**
 * Hero Section con layout Bento Box
 * Efecto de Sticky Scroll + Zoom en el bloque central
 */
export function HeroBentoBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Capturar scroll relativo al contenedor extendido
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // --- ANIMACIONES BASADAS EN SCROLL ---

  // 1. El bloque central crece (scale) y se vuelve completamente opaco
  const centerScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.8]);
  // Opcional: Desplazamiento Y para centrarlo aún más si es necesario
  const centerY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);

  // 2. Los bloques laterales se desvanecen y se desplazan hacia afuera para dar espacio
  const sideOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const sideScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const leftX = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const rightX = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-[250vh]" // Altura aumentada para permitir recorrido de scroll
      >
        {/* Sticky container: Mantiene el contenido fijo en la pantalla mientras se scrollea */}
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {/* Fondo con gradiente animado */}
          <div className="absolute inset-0 bg-gradient-ocean-fire opacity-20" />

          <div className="container-custom w-full h-full flex items-start md:items-center py-10 pt-24 md:pt-10">
            {/* Layout Bento Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full max-h-[800px]">
              {/* Bloque 1: Texto e Intro (Izquierda) */}
              <motion.div
                style={{ opacity: sideOpacity, scale: sideScale, x: leftX }}
                className="md:col-span-4 md:row-span-2 glass-card p-6 md:p-10 flex flex-col justify-center relative overflow-hidden min-h-[250px] md:min-h-[600px]"
              >
                {/* Efecto de brillo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-fire-red/5 via-transparent to-flame-blue/5 animate-pulse" />

                <div className="relative z-10">
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 drop-shadow-lg tracking-wider"
                  >
                    <span className="text-ember block mb-2">
                      {t.hero.title}
                    </span>
                    <span className="text-ash-50">{t.hero.subtitle}</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg md:text-xl text-ash-300 mb-8 font-body font-light drop-shadow-md"
                  >
                    {t.hero.description}
                  </motion.p>

                  {/* Slogan */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                    className="inline-block bg-black/40 backdrop-blur-sm border-2 border-fire-red rounded-full px-6 py-3"
                  >
                    <p className="text-fire-red font-heading font-bold text-lg md:text-xl">
                      ¡Que pasa gentuza! 🔥
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Bloque 2: Logo Animado (Centro - Eje Central) - ESTE ES EL QUE CRECE */}
              <motion.div
                style={{ scale: centerScale, y: centerY, zIndex: 10 }}
                className="md:col-span-4 md:row-span-2 glass-card p-0 flex flex-col justify-center items-center relative overflow-hidden min-h-[250px] md:min-h-[600px]"
              >
                {/* ChampiLogoReveal como contenido principal */}
                <div className="absolute inset-0 w-full h-full">
                  <ChampiLogoReveal />
                </div>
              </motion.div>

              {/* Columna Derecha: Video y CTA - OCULTO EN MÓVIL */}
              <div className="hidden md:grid md:col-span-4 md:row-span-2 grid-rows-2 gap-4 md:gap-6">
                {/* Bloque 3: Video/Cinemagraph (Arriba Derecha) */}
                <motion.div
                  style={{ opacity: sideOpacity, scale: sideScale, x: rightX }}
                  className="glass-card overflow-hidden relative group min-h-[250px]"
                >
                  <VideoBlock />
                </motion.div>

                {/* Bloque 4: CTA Principal (Abajo Derecha) */}
                <motion.div
                  style={{ opacity: sideOpacity, scale: sideScale, x: rightX }}
                  className="glass-card p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group min-h-[250px]"
                >
                  {/* Efecto líquido de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-flame-blue/20 to-fire-red/20 animate-liquid-morph opacity-50 group-hover:opacity-70 transition-opacity" />

                  <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-ash-100 mb-4">
                      {t.menu.title}
                    </h2>
                    <p className="text-ash-300 mb-6 text-sm font-body">
                      {t.menu.subtitle}
                    </p>

                    <BrandButton
                      href="/menu"
                      className="w-full"
                      withGlow={false}
                    >
                      {t.hero.cta} 🍖
                    </BrandButton>
                  </div>
                </motion.div>
              </div>

              {/* Fila Inferior: Info Destacada - También se desvanecen - Ocultas en móvil */}
              <motion.div
                style={{ opacity: sideOpacity, y: 50 }}
                className="hidden md:flex md:col-span-4 glass-card p-6 items-center space-x-4 hover:border-fire-red transition-colors min-h-[120px]"
              >
                <div className="text-4xl">🔥</div>
                <div>
                  <h3 className="font-heading font-bold text-ash-100 text-lg">
                    100% Natural
                  </h3>
                  <p className="text-sm text-ash-400 font-body">
                    Carbón de encina
                  </p>
                </div>
              </motion.div>

              <motion.div
                style={{ opacity: sideOpacity, y: 50 }}
                className="hidden md:flex md:col-span-4 glass-card p-6 items-center space-x-4 hover:border-flame-blue-bright transition-colors min-h-[120px]"
              >
                <div className="text-4xl">🥩</div>
                <div>
                  <h3 className="font-heading font-bold text-ash-100 text-lg">
                    Carne Premium
                  </h3>
                  <p className="text-sm text-ash-400 font-body">
                    Selección diaria
                  </p>
                </div>
              </motion.div>

              <motion.div
                style={{ opacity: sideOpacity, y: 50 }}
                className="hidden md:flex md:col-span-4 glass-card p-6 items-center space-x-4 hover:border-fire-red transition-colors min-h-[120px]"
              >
                <div className="text-4xl">⭐</div>
                <div>
                  <h3 className="font-heading font-bold text-ash-100 text-lg">
                    Experiencia
                  </h3>
                  <p className="text-sm text-ash-400 font-body">
                    Demostrada masivamente!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Móvil: Bloques que aparecen después del scroll */}
      <div className="md:hidden container-custom py-10 space-y-6">
        {/* Bloque Video Móvil */}
        <div className="glass-card overflow-hidden relative min-h-[400px]">
          <VideoBlock />
        </div>

        {/* Bloque CTA Móvil */}
        <div className="glass-card p-6 flex flex-col justify-center relative overflow-hidden min-h-[250px]">
          <div className="absolute inset-0 bg-gradient-to-br from-flame-blue/20 to-fire-red/20 opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl font-heading font-bold text-ash-100 mb-4">
              {t.menu.title}
            </h2>
            <p className="text-ash-300 mb-6 text-sm font-body">
              {t.menu.subtitle}
            </p>
            <BrandButton href="/menu" className="w-full" withGlow={false}>
              {t.hero.cta} 🍖
            </BrandButton>
          </div>
        </div>
      </div>
    </>
  );
}
