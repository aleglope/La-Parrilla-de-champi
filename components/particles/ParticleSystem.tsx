'use client';

import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

/**
 * Sistema de partículas: Brasas flotantes y chispas
 * Se desactiva automáticamente en dispositivos de bajo rendimiento
 */
export function ParticleSystem() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Verificar si debemos mostrar partículas
    const deviceInfo = localStorage.getItem('deviceInfo');
    if (deviceInfo) {
      const { isMobile, prefersReducedMotion } = JSON.parse(deviceInfo);
      const isLowPower = document.body.classList.contains('low-power-mode');
      
      if (isLowPower || prefersReducedMotion) {
        setShouldRender(false);
        console.log('🚫 Partículas desactivadas para mejor rendimiento');
      }
    }
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <Particles
      id="particles-canvas"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: 1
        },
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          // Brasas flotantes (rojas)
          color: {
            value: ['#C01F19', '#ff6b35', '#1789C0', '#314A78'],
          },
          links: {
            enable: false,
          },
          move: {
            direction: 'top',
            enable: true,
            outModes: {
              default: 'out',
              bottom: 'out',
              left: 'out',
              right: 'out',
              top: 'destroy',
            },
            random: true,
            speed: { min: 0.5, max: 2 },
            straight: false,
            attract: {
              enable: true,
              rotate: {
                x: 600,
                y: 1200,
              },
            },
          },
          number: {
            density: {
              enable: true,
              area: 1000,
            },
            value: 50,
            limit: 100,
          },
          opacity: {
            value: { min: 0.1, max: 0.8 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false,
            },
          },
          shape: {
            type: ['circle', 'triangle'],
          },
          size: {
            value: { min: 1, max: 4 },
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.5,
              sync: false,
            },
          },
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.05,
              opacity: 1,
            },
          },
        },
        detectRetina: true,
        // Reducir partículas en móvil
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: {
                number: {
                  value: 25,
                },
                move: {
                  speed: { min: 0.3, max: 1 },
                },
              },
            },
          },
        ],
      }}
    />
  );
}

