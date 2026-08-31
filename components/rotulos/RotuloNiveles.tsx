"use client";

import { NeonSignCanvas } from "./NeonSignCanvas";
import { ResplandorRotulo } from "./ResplandorRotulo";

interface RotuloNivelesProps {
  readonly className?: string;
}

/**
 * Rótulo de neón morado «Hay niveles, bro!» con los dos niveles de obra
 * amarillos montados en diagonal por encima del texto.
 *
 * Una línea en Sacramento, tubo de 10 mm. El GLB mide 1186 × 259 mm. Flota con
 * otro periodo y desfasado respecto al rojo: si los dos subieran y bajaran a la
 * vez se leería como una animación, no como dos piezas sueltas.
 */
export function RotuloNiveles({ className = "" }: RotuloNivelesProps) {
  return (
    <ResplandorRotulo color="rgba(168,85,247,0.20)" className={className}>
      <NeonSignCanvas
        src="/models/rotulo-niveles.glb"
        alt="Rótulo de neón morado: «Hay niveles, bro!», con dos niveles de obra"
        className="aspect-[46/10] w-full"
        padding={1.22}
        tiltDeg={1.1}
        floatAmount={0.05}
        floatSeconds={6.5}
        floatOffset={2.6}
      />
    </ResplandorRotulo>
  );
}
