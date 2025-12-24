"use client";

import { useEffect } from "react";

/**
 * Detecta el tipo de dispositivo y aplica optimizaciones
 * - Desactiva partículas en móviles antiguos
 * - Detecta modo de ahorro de energía
 * - Optimiza animaciones según capacidad del dispositivo
 */
export function DeviceDetector() {
  useEffect(() => {
    const startChristmasOverlay = () => {
      const win = window;

      const isMobileViewport = win.matchMedia("(max-width: 768px)").matches;
      const isCoarsePointer = win.matchMedia(
        "(hover: none) and (pointer: coarse)"
      ).matches;
      const uaMobile =
        /Android|iPhone|iPod/i.test(navigator.userAgent) ||
        (/iPad/i.test(navigator.userAgent) && isCoarsePointer);
      const isMobile = (isMobileViewport && isCoarsePointer) || uaMobile;
      if (!isMobile) return;

      const sessionKey = "christmasTreePlayed:v1";
      try {
        if (win.sessionStorage.getItem(sessionKey) === "1") return;
      } catch {
        return;
      }
      if (document.getElementById("__christmas_tree_overlay")) return;

      const mount = () => {
        if (document.getElementById("__christmas_tree_overlay")) return;
        try {
          win.sessionStorage.setItem(sessionKey, "1");
        } catch {
          return;
        }

        const overlay = document.createElement("div");
        overlay.id = "__christmas_tree_overlay";
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "2147483647";
        overlay.style.pointerEvents = "none";
        overlay.style.opacity = "1";
        overlay.style.transition = "opacity 320ms ease";

        const iframe = document.createElement("iframe");
        iframe.src = "/christmas/index.html";
        iframe.tabIndex = -1;
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        iframe.style.display = "block";
        iframe.style.background = "transparent";
        iframe.loading = "lazy";

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);

        let cleanedUp = false;
        let fallbackTimer = 0;
        let toastTimer = 0;

        const toast = document.createElement("div");
        toast.style.position = "absolute";
        toast.style.left = "12px";
        toast.style.right = "12px";
        toast.style.bottom = "12px";
        toast.style.margin = "0 auto";
        toast.style.maxWidth = "520px";
        toast.style.padding = "10px 12px";
        toast.style.borderRadius = "12px";
        toast.style.background = "rgba(0, 0, 0, 0.38)";
        toast.style.color = "#ffffff";
        toast.style.font =
          "500 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
        toast.style.letterSpacing = "0.2px";
        toast.style.opacity = "0";
        toast.style.transition = "opacity 200ms ease";
        toast.textContent = "";
        overlay.appendChild(toast);

        const onMessage = (event: MessageEvent) => {
          const data = event.data as any;
          if (!data || !data.type) return;
          if (data.type === "christmas:done") hide();
          if (data.type === "christmas:error") {
            toast.textContent =
              "La animación navideña no está disponible en este momento.";
            toast.style.opacity = "1";
            win.clearTimeout(toastTimer);
            toastTimer = win.setTimeout(hide, 1200);
          }
        };

        const cleanup = () => {
          if (cleanedUp) return;
          cleanedUp = true;
          win.removeEventListener("message", onMessage);
          win.clearTimeout(fallbackTimer);
          win.clearTimeout(toastTimer);
          overlay.remove();
        };

        const hide = () => {
          if (cleanedUp) return;
          overlay.style.opacity = "0";
          win.setTimeout(cleanup, 350);
        };

        win.addEventListener("message", onMessage);

        fallbackTimer = win.setTimeout(hide, 16000);
      };

      const requestIdleCallback = (win as any).requestIdleCallback as
        | ((cb: () => void, options?: { timeout?: number }) => number)
        | undefined;

      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(mount, { timeout: 2000 });
        return;
      }

      win.setTimeout(mount, 1200);
    };

    const detectDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Corregimos el error de tipado tratando navigator como 'any'
      const nav = navigator as any;
      const isLowPower =
        nav.getBattery &&
        nav
          .getBattery()
          .then(
            (battery: any) => battery.charging === false && battery.level < 0.2
          );

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
        document.body.classList.add("low-power-mode");
        console.log(
          "🔋 Modo de bajo consumo activado - Partículas desactivadas"
        );
      }

      // Detectar preferencia de movimiento reducido
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) {
        document.body.classList.add("reduced-motion");
        console.log("♿ Modo de movimiento reducido detectado");
      }

      // Almacenar información del dispositivo
      localStorage.setItem(
        "deviceInfo",
        JSON.stringify({
          isMobile,
          isLowPower: false, // Se actualizará si detectamos bajo poder
          prefersReducedMotion,
          timestamp: Date.now(),
        })
      );

      startChristmasOverlay();
    };

    detectDevice();

    // Detectar cambios en la preferencia de movimiento
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => detectDevice();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  return null; // Este componente no renderiza nada
}
