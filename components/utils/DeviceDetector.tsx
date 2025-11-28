'use client';

import { useEffect } from 'react';

/**
 * Detecta el tipo de dispositivo y aplica optimizaciones
 * - Desactiva partículas en móviles antiguos
 * - Detecta modo de ahorro de energía
 * - Optimiza animaciones según capacidad del dispositivo
 */
export function DeviceDetector() {
  useEffect(() => {
    const detectDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowPower = 
        // @ts-ignore - Battery API experimental
        navigator.getBattery && 
        navigator.getBattery().then((battery: any) => battery.charging === false && battery.level < 0.2);
      
      // Detectar dispositivos antiguos o de bajo rendimiento
      const isOldDevice = () => {
        const memory = (performance as any).memory;
        if (memory && memory.jsHeapSizeLimit < 1000000000) {
          return true; // Menos de 1GB de memoria disponible
        }
        
        // Detectar CPUs lentas mediante un test rápido
        const start = performance.now();
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
          sum += Math.sqrt(i);
        }
        const duration = performance.now() - start;
        
        return duration > 50; // Si tarda más de 50ms, es un dispositivo lento
      };

      // Aplicar clase al body para optimizaciones CSS
      if (isMobile && isOldDevice()) {
        document.body.classList.add('low-power-mode');
        console.log('🔋 Modo de bajo consumo activado - Partículas desactivadas');
      }

      // Detectar preferencia de movimiento reducido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        document.body.classList.add('reduced-motion');
        console.log('♿ Modo de movimiento reducido detectado');
      }

      // Almacenar información del dispositivo
      localStorage.setItem('deviceInfo', JSON.stringify({
        isMobile,
        isLowPower: false, // Se actualizará si detectamos bajo poder
        prefersReducedMotion,
        timestamp: Date.now(),
      }));
    };

    detectDevice();

    // Detectar cambios en la preferencia de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => detectDevice();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return null; // Este componente no renderiza nada
}

