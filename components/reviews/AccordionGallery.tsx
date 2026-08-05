"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { gsap } from "gsap";

import "./AccordionGallery.css";

/**
 * AccordionGallery — componente de React Bits instalado con
 * `pnpm dlx shadcn@latest add @react-bits/AccordionGallery-JS-CSS`
 * y portado a TypeScript.
 *
 * Cambios propios respecto al original:
 * - "use client" (React Bits no la trae; sin ella rompe en App Router)
 * - Tipado estricto de props e items
 * - `item.content` (ReactNode) para renderizar más que un label de texto
 *   — lo usamos para meter la reseña completa dentro de cada panel
 */

export interface AccordionGalleryItem {
  readonly image: string;
  readonly label: string;
  readonly alt?: string;
  readonly link?: string;
  readonly content?: ReactNode;
  /**
   * Encuadre del recorte (CSS object-position). Las fotos son 3:4 y el panel
   * es más estrecho, así que `cover` recorta por los LADOS: quien manda es el
   * primer valor (X). Sin esto, el 50% por defecto parte algunos platos.
   */
  readonly objectPosition?: string;
}

export interface AccordionGalleryProps {
  readonly items: readonly AccordionGalleryItem[];
  readonly defaultIndex?: number;
  readonly accentColor?: string;
  readonly overlayColor?: string;
  readonly textColor?: string;
  readonly height?: number;
  readonly gap?: number;
  readonly radius?: number;
  readonly expandRatio?: number;
  readonly orientation?: "horizontal" | "vertical";
  readonly duration?: number;
  readonly ease?: string;
  readonly parallax?: number;
  readonly tilt?: number;
  readonly stagger?: number;
  readonly trigger?: "hover" | "click";
  readonly showLabels?: boolean;
  readonly grayscale?: boolean;
  readonly className?: string;
  /** Nombre accesible del grupo. Sin esto se anuncia sin contexto. */
  readonly ariaLabel?: string;
}

export default function AccordionGallery({
  items,
  defaultIndex = 2,
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = true,
  className = "",
  ariaLabel = "Galería en acordeón",
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === "vertical";
  const count = items.length;
  const [active, setActive] = useState(
    Math.min(Math.max(defaultIndex, 0), count - 1)
  );

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(
          panel,
          { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease },
          0
        );

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              "--ag-gray": gray,
              "--ag-dim": isActive ? 0 : 0.35,
              duration: dur,
              ease,
            } as gsap.TweenVars,
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to(
              [bar, text],
              {
                opacity: 1,
                x: 0,
                duration: dur,
                ease,
                stagger: prefersReduced ? 0 : stagger,
              },
              0
            );
          } else {
            tl.to(
              [bar, text],
              { opacity: 0, x: -14, duration: dur * 0.6, ease },
              0
            );
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced,
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(
        140,
        usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22
      );
      mediaSizeRef.current = size;
      el.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === "hover") setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent<HTMLElement>) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLElement>) => {
    const destino =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % count
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i - 1 + count) % count
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? count - 1
              : null;

    if (destino === null) return;

    e.preventDefault();
    setActive(destino);
    // Mover el foco de verdad, no solo el estado: si el foco se queda en el
    // panel anterior, quien navega con teclado no sabe dónde está.
    panelRefs.current[destino]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ag-accent": accentColor,
          "--ag-overlay": overlayColor,
          "--ag-text": textColor,
          "--ag-gap": `${gap}px`,
          "--ag-radius": `${radius}px`,
          height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
        } as React.CSSProperties
      }
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        // Sin enlace, el panel despliega su propio contenido: eso es un botón
        // de disclosure, no un elemento de lista. `role="listitem"` sobre algo
        // operable hacía que el lector lo anunciara como "elemento de lista".
        const Tag = (item.link ? "a" : "button") as "a";
        return (
          <Tag
            key={item.image + item.label}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            type={item.link ? undefined : ("button" as "button" | undefined)}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-expanded={item.link ? undefined : isActive}
            // Sin aria-label a propósito: el nombre accesible sale del propio
            // contenido (autor, nota y texto de la reseña). Con aria-label, el
            // lector leería solo la etiqueta y la reseña quedaría inalcanzable.
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.alt || item.label || ""}
                  draggable="false"
                  style={
                    item.objectPosition
                      ? { objectPosition: item.objectPosition }
                      : undefined
                  }
                />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label">
                {/* La barra es puro adorno; el aria-hidden va aquí y solo aquí.
                    Estaba en el contenedor, y con él escondía el texto de la
                    reseña entera a los lectores de pantalla. */}
                <span
                  aria-hidden="true"
                  className="ag-panel__bar"
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                >
                  {item.content ?? item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
