'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { AnimatedLogo } from './AnimatedLogo';
import { VideoBlock } from './VideoBlock';

/**
 * Hero Section con layout Bento Box
 * Mobile-first: Los bloques se apilan verticalmente en móvil
 * Desktop: Grid modular tipo Bento
 */
export function HeroBentoBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Animaciones basadas en scroll
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <div ref={containerRef} className="relative min-h-screen pt-20 pb-10 overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-ocean-fire opacity-20" />
      
      <motion.div 
        style={{ scale, opacity }}
        className="container-custom h-full"
      >
        {/* Layout Bento Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-full py-10">
          
          {/* Bloque 1: Logo Animado (Grande) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-7 md:row-span-2 glass-card p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden min-h-[400px] md:min-h-[600px]"
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-fire-red/10 via-transparent to-flame-blue/10 animate-pulse" />
            
            <div className="relative z-10 text-center">
              <AnimatedLogo />
              
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              >
                <span className="text-ember">La Parrilla</span>
                <br />
                <span className="text-white">de Champi</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl md:text-2xl text-gray-300 mb-8 font-light"
              >
                Carne a la Brasa con Alma
              </motion.p>

              {/* Slogan */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="inline-block bg-fire-red/20 border-2 border-fire-red rounded-full px-6 py-3 mb-8"
              >
                <p className="text-fire-red font-bold text-lg md:text-xl">
                  ¡Que pasa gentuza! 🔥
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Bloque 2: Video/Cinemagraph (Medio) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-5 md:row-span-1 glass-card overflow-hidden relative group min-h-[250px] md:min-h-[290px]"
          >
            <VideoBlock />
            
            {/* Overlay con texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Fuego Auténtico
                </h3>
                <p className="text-gray-300 text-sm">
                  Cocinado a la perfección con carbón de calidad
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bloque 3: CTA Principal (Medio) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="md:col-span-5 md:row-span-1 glass-card p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group min-h-[250px] md:min-h-[290px]"
          >
            {/* Efecto líquido de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-flame-blue/20 to-fire-red/20 animate-liquid-morph opacity-50 group-hover:opacity-70 transition-opacity" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Nuestra Carta
              </h2>
              <p className="text-gray-300 mb-6">
                Descubre nuestros platos exclusivos cocinados con pasión
              </p>
              
              <Link href="/menu" className="btn-fire inline-block text-center w-full">
                Ver Carta Completa 🍖
              </Link>

              {/* Decoración */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
                <span>📱</span>
                <span>Acceso rápido con QR</span>
              </div>
            </div>
          </motion.div>

          {/* Bloque 4: Info Destacada (Pequeños) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="md:col-span-4 glass-card p-6 flex items-center space-x-4 hover:border-fire-red transition-colors min-h-[120px]"
          >
            <div className="text-4xl">🔥</div>
            <div>
              <h3 className="font-bold text-white text-lg">100% Natural</h3>
              <p className="text-sm text-gray-400">Carbón de encina</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="md:col-span-4 glass-card p-6 flex items-center space-x-4 hover:border-flame-blue-bright transition-colors min-h-[120px]"
          >
            <div className="text-4xl">🥩</div>
            <div>
              <h3 className="font-bold text-white text-lg">Carne Premium</h3>
              <p className="text-sm text-gray-400">Selección diaria</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="md:col-span-4 glass-card p-6 flex items-center space-x-4 hover:border-fire-red transition-colors min-h-[120px]"
          >
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="font-bold text-white text-lg">Experiencia</h3>
              <p className="text-sm text-gray-400">+20 años de sabor</p>
            </div>
          </motion.div>
        </div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <p className="text-sm text-gray-400 mb-2">Descubre más</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-flame-blue-bright"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

