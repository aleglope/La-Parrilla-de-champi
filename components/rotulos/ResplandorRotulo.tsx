"use client";

import type { ReactNode } from "react";

interface ResplandorRotuloProps {
  /** El canvas del rótulo. */
  readonly children: ReactNode;
  /** Color de la luz que el tubo deja alrededor. */
  readonly color: string;
  readonly className?: string;
}

/**
 * Pone alrededor del rótulo la luz que un tubo de neón deja sobre lo que tiene
 * detrás.
 *
 * Es un gradiente CSS, no bloom de postprocesado: el halo ya viene modelado
 * dentro del GLB (un segundo tubo con alpha 0.14), así que lo único que falta
 * es la caída de luz, y eso no necesita tocar la GPU.
 */
export function ResplandorRotulo({
  children,
  color,
  className = "",
}: ResplandorRotuloProps) {
  return (
    <div className={`relative ${className}`}>
      {/* `closest-side` da una elipse que sigue la forma del rótulo. Con un
          gradiente de porcentajes sobre una caja tan ancha y baja se veían las
          esquinas del div. */}
      <div
        className="pointer-events-none absolute -inset-x-[8%] -inset-y-[55%] blur-3xl"
        style={{
          background: `radial-gradient(closest-side at 50% 50%, ${color} 0%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
