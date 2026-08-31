"use client";

import { NeonSignCanvas } from "./NeonSignCanvas";
import { ResplandorRotulo } from "./ResplandorRotulo";

interface RotuloChurrascoProps {
  readonly className?: string;
}

/**
 * Rótulo de neón rojo «Eu churrasco ó forno / non como».
 *
 * Dos líneas de texto en Comfortaa, tubo de 13 mm. El GLB mide 1096 × 175 mm,
 * de ahí la proporción del contenedor: si le sobra ancho, el encuadre deja
 * aire a los lados en vez de agrandar el rótulo.
 *
 * `padding` alto a propósito: a 1.22 el rótulo llenaba su caja y pesaba
 * demasiado al lado del morado. A 1.55 ocupa un 64 % del ancho del canvas.
 */
export function RotuloChurrasco({ className = "" }: RotuloChurrascoProps) {
  return (
    <ResplandorRotulo color="rgba(224,40,32,0.22)" className={className}>
      <NeonSignCanvas
        src="/models/rotulo-churrasco.glb"
        alt="Rótulo de neón rojo: «Eu churrasco ó forno non como»"
        className="aspect-[63/10] w-full"
        padding={1.55}
        tiltDeg={0.8}
        floatAmount={0.06}
        floatSeconds={8}
      />
    </ResplandorRotulo>
  );
}
