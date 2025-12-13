"use client";

import { useEffect, useRef } from "react";

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

// Clase Partícula - moved outside component to avoid linter errors and improve performance
class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  size: number;
  density: number;

  constructor(x: number, y: number, color: string, particleSize: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.color = color;
    this.size = particleSize;
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

  update(
    mouse: MousePosition,
    config: { mouseForce: number; returnSpeed: number }
  ) {
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

export default function ChampiLogoReveal() {
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number>(0);
  const configRef = useRef<Config>({
    mouseRadius: 50,
    mouseForce: 30,
    returnSpeed: 0.2,
    particleSize: 2,
    density: 1.2,
  });

  useEffect(() => {
    // Detectar móvil y ajustar config UNA SOLA VEZ
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    if (isMobile) {
      configRef.current = {
        ...configRef.current,
        mouseRadius: 80,
        mouseForce: 25,
        density: 1.5, // Ajustado para mejor calidad visual
        particleSize: 2, // Partículas más pequeñas para mayor definición
      };
    } else {
      // Desktop también necesita partículas más pequeñas para mejor calidad
      configRef.current = {
        ...configRef.current,
        particleSize: 2,
        density: 1, // Menor densidad = más partículas = mejor calidad
      };
    }

    // Inicializar prevWidth
    prevWidthRef.current = window.innerWidth;

    const canvasBack = canvasBackRef.current;
    const canvasFront = canvasFrontRef.current;
    const container = containerRef.current;

    if (!canvasBack || !canvasFront || !container) return;

    const ctxBack = canvasBack.getContext("2d", { willReadFrequently: true });
    const ctxFront = canvasFront.getContext("2d", { willReadFrequently: true });

    if (!ctxBack || !ctxFront) return;

    // Usar configRef.current en lugar de config
    const config = configRef.current;

    // Variables del mouse (compartidas)
    const mouse: MousePosition = {
      x: null,
      y: null,
      radius: config.mouseRadius,
    };

    // Arrays de partículas
    const particlesArrayFront: Particle[] = [];

    // Tamaño del canvas
    function resizeCanvas() {
      if (!container || !canvasBack || !canvasFront) return false;
      const { clientWidth, clientHeight } = container;

      // Solo actualizar si las dimensiones han cambiado
      if (
        canvasBack.width !== clientWidth ||
        canvasBack.height !== clientHeight
      ) {
        canvasBack.width = clientWidth;
        canvasBack.height = clientHeight;
        canvasFront.width = clientWidth;
        canvasFront.height = clientHeight;
        return true;
      }
      return false;
    }

    // Debounce para resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        // En móviles, ignorar cambios pequeños de ancho
        if (isMobile && Math.abs(currentWidth - prevWidthRef.current) < 50) {
          return;
        }

        prevWidthRef.current = currentWidth;
        const changed = resizeCanvas();

        if (changed || !backgroundDrawn) {
          backgroundDrawn = false;
          initBack();
          initFront();
        }
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

    document.addEventListener("touchend", preventZoom, { passive: false });

    // Función para obtener la posición correcta del mouse/touch
    function getPosition(e: MouseEvent | TouchEvent) {
      const rect = canvasFront!.getBoundingClientRect();
      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    }

    // Evento compartido para actualizar posición del mouse/touch
    const updateMousePosition = (e: MouseEvent | TouchEvent) => {
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    // Eventos de mouse/touch
    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      updateMousePosition(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updateMousePosition(e);
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

    canvasFront.addEventListener("mousemove", handleMouseMove);
    canvasFront.addEventListener("mouseleave", handleMouseLeave);
    canvasFront.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    canvasFront.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    canvasFront.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    canvasFront.addEventListener("touchcancel", handleTouchCancel);

    // Inicializar capa de fondo
    let backImageLoaded = false;
    let backImage: HTMLImageElement | null = null;
    let backImagePosition: ImagePosition = { x: 0, y: 0, width: 0, height: 0 };

    function initBack() {
      if (!canvasBack) return;

      const img = new Image();
      img.crossOrigin = "anonymous"; // Importante para CORS

      img.onload = function () {
        backImage = img;

        const sizePercent = isMobile ? 0.35 : 0.3;
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
        const y = (canvasBack.height - imgHeight) / 2;

        backImagePosition = { x, y, width: imgWidth, height: imgHeight };
        backImageLoaded = true;
      };

      img.onerror = function (e) {
        console.error("Error al cargar Logo-Champi.webp:", e);
      };

      img.src = "/Logo-Champi.webp";
    }

    // Inicializar capa frontal (SVG)
    async function initFront() {
      if (!canvasFront || !ctxFront) return;
      particlesArrayFront.length = 0;

      try {
        const response = await fetch("/Logo-Bento-Hero.svg");

        if (!response.ok) {
          console.error("Error fetching SVG:", response.status);
          return;
        }

        const svgText = await response.text();
        const blob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const img = new Image();

        img.onload = function () {
          // Aumentar el tamaño un 50% más (0.6 * 1.5 = 0.9, 0.5 * 1.5 = 0.75)
          const sizePercent = isMobile ? 0.9 : 0.75;
          const maxSize =
            Math.min(canvasFront.width, canvasFront.height) * sizePercent;
          const size = maxSize;
          const x = (canvasFront.width - size) / 2;
          const y = (canvasFront.height - size) / 2;

          // Habilitar suavizado para mejor calidad visual
          ctxFront.imageSmoothingEnabled = true;
          ctxFront.imageSmoothingQuality = "high";
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
            console.error("Error getting image data:", e);
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
                particlesArrayFront.push(
                  new Particle(x, y, color, config.particleSize)
                );
              }
            }
          }

          URL.revokeObjectURL(url);
        };

        img.onerror = function (e) {
          console.error("Error al cargar el SVG:", e);
        };

        img.src = url;
      } catch (error) {
        console.error("Error al cargar el archivo SVG:", error);
      }
    }

    // Animar
    let backgroundDrawn = false;
    let animationId: number;
    let isAnimating = true;

    function animate() {
      if (!isAnimating || !ctxBack || !ctxFront || !canvasBack || !canvasFront)
        return;

      if (!backgroundDrawn && backImageLoaded && backImage) {
        ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
        ctxBack.imageSmoothingEnabled = true;
        ctxBack.imageSmoothingQuality = "high";

        const centerX = backImagePosition.x + backImagePosition.width / 2;
        const centerY = backImagePosition.y + backImagePosition.height / 2;
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

        ctxBack.beginPath();
        ctxBack.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctxBack.strokeStyle = "#1a2324";
        ctxBack.lineWidth = 8;
        ctxBack.stroke();

        backgroundDrawn = true;
      }

      ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);

      for (const particle of particlesArrayFront) {
        particle.update(mouse, config);
        particle.draw(ctxFront);
      }

      animationId = requestAnimationFrame(animate);
    }

    // Inicializar
    initBack();
    initFront();
    animate();

    // Cleanup
    return () => {
      isAnimating = false;
      resizeObserver.disconnect();
      document.removeEventListener("touchend", preventZoom);
      canvasFront.removeEventListener("mousemove", handleMouseMove);
      canvasFront.removeEventListener("mouseleave", handleMouseLeave);
      canvasFront.removeEventListener("touchstart", handleTouchStart);
      canvasFront.removeEventListener("touchmove", handleTouchMove);
      canvasFront.removeEventListener("touchend", handleTouchEnd);
      canvasFront.removeEventListener("touchcancel", handleTouchCancel);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []); // ✅ Sin dependencias - se ejecuta solo una vez

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasBackRef}
        id="canvasBack"
        className="absolute top-0 left-0 w-full h-full touch-none select-none z-[1] cursor-none [@media(pointer:coarse)]:cursor-default"
      />
      <canvas
        ref={canvasFrontRef}
        id="canvasFront"
        className="absolute top-0 left-0 w-full h-full touch-none select-none z-[2] cursor-none [@media(pointer:coarse)]:cursor-default"
      />
    </div>
  );
}
