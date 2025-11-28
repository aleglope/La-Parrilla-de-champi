'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Bloque de video con fallback a imagen
 * Para optimización, detecta si debe mostrar video o imagen estática
 */
export function VideoBlock() {
  const [useVideo, setUseVideo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Solo cargar video en dispositivos potentes
    const shouldUseVideo = () => {
      const connection = (navigator as any).connection;
      const isHighSpeed = !connection || connection.effectiveType === '4g';
      const isDesktop = window.innerWidth > 768;
      const hasGoodPerformance = !document.body.classList.contains('low-power-mode');
      
      return isHighSpeed && isDesktop && hasGoodPerformance;
    };

    setUseVideo(shouldUseVideo());
  }, []);

  return (
    <div className="relative w-full h-full min-h-[250px] bg-charcoal-dark">
      {useVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          poster="/images/meat-placeholder.jpg"
        >
          <source src="/videos/meat-cooking.mp4" type="video/mp4" />
          <source src="/videos/meat-cooking.webm" type="video/webm" />
        </video>
      ) : (
        <div className="relative w-full h-full">
          {/* Imagen de placeholder con efecto de parallax sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-fire-red/30 to-flame-blue/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-pulse">🥩</div>
              <p className="text-white text-xl font-bold">Carne a la Brasa</p>
              <p className="text-gray-400 text-sm">Cocinada con Pasión</p>
            </div>
          </div>
          
          {/* Efecto de chispas animadas */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-fire-red rounded-full animate-ember-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${5 + Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overlay con textura de fuego */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

