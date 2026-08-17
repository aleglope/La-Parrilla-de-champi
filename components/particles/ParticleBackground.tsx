"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Lazy-load del sistema de partículas (Three.js) solo en cliente:
// ssr:false no puede usarse en un Server Component (page.tsx), por eso este wrapper.
const ParticleSystem = dynamic(
  () => import("./ParticleSystem").then((m) => m.ParticleSystem),
  { ssr: false }
);

interface ParticleBackgroundProps {
  readonly colors?: string[];
}

/**
 * Client Component wrapper que aísla el coste de Three.js al bundle de la home.
 * El opt-out (prefersReducedMotion / low-power-mode) vive dentro de ParticleSystem.
 * Memoiza `colors` POR VALOR: la identidad del array cambiaba en cada render y eso
 * reconstruía el motor de three.js (un WebGLRenderer nuevo por render).
 */
export function ParticleBackground({ colors }: ParticleBackgroundProps = {}) {
  const colorsKey = colors?.join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- memoización POR VALOR: colorsKey es la firma del contenido de colors
  const stableColors = useMemo(() => colors, [colorsKey]);

  return <ParticleSystem colors={stableColors} />;
}
