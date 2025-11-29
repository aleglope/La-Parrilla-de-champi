"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChampiLogoReveal.module.css";

export default function ChampiLogoReveal() {
  const canvasBackRef = useRef(null);
  const canvasFrontRef = useRef(null);
  const containerRef = useRef(null);

  const [config, setConfig] = useState({
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

    const ctxBack = canvasBack.getContext("2d");
    const ctxFront = canvasFront.getContext("2d");

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
    const mouse = {
      x: null,
      y: null,
      radius: config.mouseRadius,
    };

    // Arrays de partículas
    let particlesArrayBack = [];
    let particlesArrayFront = [];

    // Tamaño del canvas
    function resizeCanvas() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      canvasBack.width = clientWidth;
      canvasBack.height = clientHeight;
      canvasFront.width = clientWidth;
      canvasFront.height = clientHeight;
    }

    // Debounce para resize
    let resizeTimeout;
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
    const preventZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchend", preventZoom, false);

    // Función para obtener la posición correcta del mouse/touch
    function getPosition(e) {
      const rect = canvasFront.getBoundingClientRect();
      if (e.touches) {
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

    // Eventos de mouse/touch en el canvas frontal
    const handleMouseMove = (e) => {
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchStart = (e) => {
      // Solo prevenir default si estamos interactuando directamente
      // e.preventDefault();
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleTouchMove = (e) => {
      // e.preventDefault();
      const pos = getPosition(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleTouchEnd = (e) => {
      // e.preventDefault();
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
    canvasFront.addEventListener("touchend", handleTouchEnd, { passive: true });
    canvasFront.addEventListener("touchcancel", handleTouchCancel);

    // Clase Partícula
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.size = config.particleSize;
        this.density = Math.random() * 2 + 1;
      }

      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
          this.x - this.size / 2,
          this.y - this.size / 2,
          this.size,
          this.size
        );
      }

      update() {
        let dx = this.x - this.baseX;
        let dy = this.y - this.baseY;

        if (mouse.x != null && mouse.y != null) {
          let mdx = mouse.x - this.x;
          let mdy = mouse.y - this.y;
          let distanceSquared = mdx * mdx + mdy * mdy;
          let maxDistanceSquared = mouse.radius * mouse.radius;

          if (distanceSquared < maxDistanceSquared) {
            let distance = Math.sqrt(distanceSquared);
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX =
              (mdx / distance) * force * this.density * config.mouseForce;
            let directionY =
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
    let backImage = null;
    let backImagePosition = { x: 0, y: 0, width: 0, height: 0 };

    function initBack() {
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
        // console.log('Imagen de fondo cargada');
      };

      img.onerror = function () {
        console.error("Error al cargar Logo-Champi.webp");
      };

      img.src = "/Logo-Champi.webp";
    }

    // Inicializar capa frontal (SVG)
    async function initFront() {
      particlesArrayFront = [];

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
          const pixels = ctxFront.getImageData(
            0,
            0,
            canvasFront.width,
            canvasFront.height
          );
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
          // console.log(`Partículas frente creadas: ${particlesArrayFront.length}`);
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
    let animationId;

    function animate() {
      // Always clear back canvas to handle transparency correctly if redrawing
      // But optimization: only redraw back if resize happened or first time.
      // Here we redraw back continuously only if needed?
      // Actually, if we clearRect, we must redraw.

      // For back canvas (static image):
      if (backImageLoaded && backImage) {
        // If we want it to persist, we can draw it once?
        // But animation loop usually clears everything.
        // Current implementation clears it every frame?
        // Original code: if (!backgroundDrawn && ...) { draw; backgroundDrawn=true }
        // But in animate loop:
      }

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
  }, [config]);

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <canvas
        ref={canvasBackRef}
        id="canvasBack"
        className={styles.canvasBack}
      />
      <canvas
        ref={canvasFrontRef}
        id="canvasFront"
        className={styles.canvasFront}
      />
    </div>
  );
}
