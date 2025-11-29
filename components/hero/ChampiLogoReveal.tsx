"use client";

import { useEffect, useRef, useState } from "react";

interface Config {
  mouseRadius: number;
  mouseForce: number;
  returnSpeed: number;
  particleSize: number;
  density: number;
}

interface MousePosition {
  x: number | null;
  y: number | null;
  radius: number;
}

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ChampiLogoReveal() {
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<Config>({
    mouseRadius: 50,
    mouseForce: 30,
    returnSpeed: 0.2,
    particleSize: 2.0,
    density: 1.2,
  });

  useEffect(() => {
    const canvasBack = canvasBackRef.current;
    const canvasFront = canvasFrontRef.current;
    const container = containerRef.current;

    if (!canvasBack || !canvasFront || !container) return;

    const ctxBack = canvasBack.getContext("2d", { willReadFrequently: true });
    const ctxFront = canvasFront.getContext("2d", { willReadFrequently: true });

    if (!ctxBack || !ctxFront) return;

    // Detectar si es dispositivo móvil
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    // Ajustar configuración para móviles
    if (isMobile) {
      setConfig((prev) => ({
        ...prev,
        mouseRadius: 80,
        mouseForce: 25,
      }));
    }

    // Variables del mouse (compartidas)
    const mouse: MousePosition = {
      x: null,
      y: null,
      radius: config.mouseRadius,
    };

    // Arrays de partículas
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let particlesArrayBack: Particle[] = [];
    const particlesArrayFront: Particle[] = [];

    // Tamaño del canvas
    function resizeCanvas() {
      if (!container || !canvasBack || !canvasFront) return;
      const { clientWidth, clientHeight } = container;
      canvasBack.width = clientWidth;
      canvasBack.height = clientHeight;
      canvasFront.width = clientWidth;
      canvasFront.height = clientHeight;
    }

    // Debounce para resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        // Reset flags for redraw
        backgroundDrawn = false;
        initBack();
        initFront();
      }, 250);
    };

    // Observer para el contenedor
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initial resize
    resizeCanvas();

    // Prevenir zoom en móviles
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchend", preventZoom, false);

    // Función para obtener la posición correcta del mouse/touch
    function getPosition(e: MouseEvent | TouchEvent) {
      const rect = canvasFront!.getBoundingClientRect();
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top,
        };
      }
    }

    // Eventos de mouse/touch en el canvas frontal
    const handleMouseMove = (e: MouseEvent) => {
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        mouse.x = null;
        mouse.y = null;
      }, 100);
    };

    const handleTouchCancel = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Type casting for event listeners due to passive option
    canvasFront.addEventListener("mousemove", handleMouseMove as EventListener);
    canvasFront.addEventListener("mouseleave", handleMouseLeave as EventListener);
    canvasFront.addEventListener("touchstart", handleTouchStart as unknown as EventListener, {
      passive: true,
    });
    canvasFront.addEventListener("touchmove", handleTouchMove as unknown as EventListener, {
      passive: true,
    });
    canvasFront.addEventListener("touchend", handleTouchEnd as unknown as EventListener, { passive: true });
    canvasFront.addEventListener("touchcancel", handleTouchCancel as EventListener);

    // Clase Partícula
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      color: string;
      size: number;
      density: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.size = config.particleSize;
        this.density = Math.random() * 2 + 1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
          this.x - this.size / 2,
          this.y - this.size / 2,
          this.size,
          this.size
        );
      }

      update() {
        const dx = this.x - this.baseX;
        const dy = this.y - this.baseY;

        if (mouse.x != null && mouse.y != null) {
          const mdx = mouse.x - this.x;
          const mdy = mouse.y - this.y;
          const distanceSquared = mdx * mdx + mdy * mdy;
          const maxDistanceSquared = mouse.radius * mouse.radius;

          if (distanceSquared < maxDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX =
              (mdx / distance) * force * this.density * config.mouseForce;
            const directionY =
              (mdy / distance) * force * this.density * config.mouseForce;

            this.x -= directionX;
            this.y -= directionY;
            return;
          }
        }

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          this.x -= dx * config.returnSpeed;
          this.y -= dy * config.returnSpeed;
        } else {
          this.x = this.baseX;
          this.y = this.baseY;
        }
      }
    }

    // Inicializar capa de fondo (Logo Champi.webp) - Como imagen directa
    let backImageLoaded = false;
    let backImage: HTMLImageElement | null = null;
    let backImagePosition: ImagePosition = { x: 0, y: 0, width: 0, height: 0 };

    function initBack() {
      if (!canvasBack) return;
      particlesArrayBack = [];

      const img = new Image();

      img.onload = function () {
        backImage = img;

        const sizePercent = isMobile ? 0.35 : 0.3; // Restore original smaller size
        const maxSize =
          Math.min(canvasBack.width, canvasBack.height) * sizePercent;

        let imgWidth, imgHeight;
        const aspectRatio = img.width / img.height;

        if (aspectRatio > 1) {
          imgWidth = maxSize;
          imgHeight = maxSize / aspectRatio;
        } else {
          imgHeight = maxSize;
          imgWidth = maxSize * aspectRatio;
        }

        const x = (canvasBack.width - imgWidth) / 2;
        const y = (canvasBack.height - imgHeight) / 2; // Centered vertically

        backImagePosition = { x, y, width: imgWidth, height: imgHeight };
        backImageLoaded = true;
      };

      img.onerror = function () {
        console.error("Error al cargar Logo-Champi.webp");
      };

      img.src = "/Logo-Champi.webp";
    }

    // Inicializar capa frontal (SVG)
    async function initFront() {
      if (!canvasFront || !ctxFront) return;
      // Limpiar array manteniendo la referencia const (aunque aquí lo re-asignamos vaciándolo)
      particlesArrayFront.length = 0; 

      try {
        const response = await fetch("/CHAMPI-LOGO-DIGITAL-ALTA-CALIDAD.svg");
        const svgText = await response.text();

        const blob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const img = new Image();

        img.onload = function () {
          // Increase size to cover the background image
          // The background image is roughly 35% (mobile) or 30% (desktop) of canvas size
          // We want the SVG particles to be larger than that to cover it completely
          // Let's make it significantly larger
          const sizePercent = isMobile ? 1.4 : 1.3;
          const maxSize =
            Math.min(canvasFront.width, canvasFront.height) * sizePercent;
          const size = maxSize;
          const x = (canvasFront.width - size) / 2;
          const y = (canvasFront.height - size) / 2;

          ctxFront.imageSmoothingEnabled = false;
          ctxFront.drawImage(img, x, y, size, size);
          
          let pixels: ImageData;
          try {
             pixels = ctxFront.getImageData(
              0,
              0,
              canvasFront.width,
              canvasFront.height
            );
          } catch (e) {
            console.error("Error getting image data", e);
            return;
          }
          
          ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);

          const step = Math.max(1, Math.floor(config.density));
          for (let y = 0; y < pixels.height; y += step) {
            for (let x = 0; x < pixels.width; x += step) {
              const index = (y * pixels.width + x) * 4;
              const alpha = pixels.data[index + 3];

              if (alpha > 50) {
                const red = pixels.data[index];
                const green = pixels.data[index + 1];
                const blue = pixels.data[index + 2];
                const color = `rgb(${red},${green},${blue})`;
                particlesArrayFront.push(new Particle(x, y, color));
              }
            }
          }

          URL.revokeObjectURL(url);
        };

        img.onerror = function () {
          console.error("Error al cargar el SVG");
        };

        img.src = url;
      } catch (error) {
        console.error("Error al cargar el archivo SVG:", error);
      }
    }

    // Animar con máxima fluidez
    let backgroundDrawn = false;
    let animationId: number;

    function animate() {
      if (!ctxBack || !ctxFront || !canvasBack || !canvasFront) return;

      if (!backgroundDrawn && backImageLoaded && backImage) {
        ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
        ctxBack.imageSmoothingEnabled = true;
        ctxBack.imageSmoothingQuality = "high";

        // Calcular centro y radio para el círculo
        const centerX = backImagePosition.x + backImagePosition.width / 2;
        const centerY = backImagePosition.y + backImagePosition.height / 2;
        // Radio basado en el tamaño de la imagen (la mitad del ancho/alto)
        // Reducimos un poco el radio para asegurar que el borde cubra bien los bordes de la imagen
        const radius =
          Math.min(backImagePosition.width, backImagePosition.height) / 2;

        ctxBack.save();
        ctxBack.beginPath();
        ctxBack.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctxBack.closePath();
        ctxBack.clip();

        ctxBack.drawImage(
          backImage,
          backImagePosition.x,
          backImagePosition.y,
          backImagePosition.width,
          backImagePosition.height
        );
        ctxBack.restore();

        // Dibujar borde para encapsular
        ctxBack.beginPath();
        ctxBack.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctxBack.strokeStyle = "#1a2324"; // Color charcoal-dark para coincidir con el tema
        ctxBack.lineWidth = 8; // Borde visible
        ctxBack.stroke();

        backgroundDrawn = true;
      }

      // Front canvas (particles) needs clearing every frame
      ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);

      for (let i = 0; i < particlesArrayFront.length; i++) {
        particlesArrayFront[i].update();
        particlesArrayFront[i].draw(ctxFront);
      }

      animationId = requestAnimationFrame(animate);
    }

    // Inicializar
    initBack();
    initFront();
    animate();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("touchend", preventZoom);
      canvasFront.removeEventListener("mousemove", handleMouseMove as EventListener);
      canvasFront.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      canvasFront.removeEventListener("touchstart", handleTouchStart as unknown as EventListener);
      canvasFront.removeEventListener("touchmove", handleTouchMove as unknown as EventListener);
      canvasFront.removeEventListener("touchend", handleTouchEnd as unknown as EventListener);
      canvasFront.removeEventListener("touchcancel", handleTouchCancel as EventListener);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [config]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasBackRef}
        id="canvasBack"
        className="absolute top-0 left-0 max-w-full max-h-[100vh] touch-none select-none z-[1] cursor-none [@media(pointer:coarse)]:cursor-default"
      />
      <canvas
        ref={canvasFrontRef}
        id="canvasFront"
        className="absolute top-0 left-0 max-w-full max-h-[100vh] touch-none select-none z-[2] cursor-none [@media(pointer:coarse)]:cursor-default"
      />
    </div>
  );
}

