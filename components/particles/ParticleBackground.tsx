"use client";

import dynamic from "next/dynamic";

// Lazy-load del sistema de partículas (Three.js) solo en cliente:
// ssr:false no puede usarse en un Server Component (page.tsx), por eso este wrapper.
const ParticleSystem = dynamic(
  () => import("./ParticleSystem").then((m) => m.ParticleSystem),
  { ssr: false }
);

/**
 * Client Component wrapper que aísla el coste de Three.js al bundle de la home.
 * El opt-out (prefersReducedMotion / low-power-mode) vive dentro de ParticleSystem.
 */
export function ParticleBackground() {
  return <ParticleSystem />;
}
