"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Hueco del tamaño exacto del rótulo mientras carga su GLB.
 * Sin esto la carta pega un salto cuando entran los dos canvas.
 */
function HuecoRotulo({ ratio }: { readonly ratio: string }) {
  return <div className="w-full" style={{ aspectRatio: ratio }} aria-hidden />;
}

// Three.js y los dos GLB (700 KB) solo se descargan en el cliente: ni el HTML
// de la carta ni el bundle del servidor los arrastran.
const RotuloChurrasco = dynamic(
  () => import("./RotuloChurrasco").then((m) => m.RotuloChurrasco),
  { ssr: false, loading: () => <HuecoRotulo ratio="63 / 10" /> }
);

const RotuloNiveles = dynamic(
  () => import("./RotuloNiveles").then((m) => m.RotuloNiveles),
  { ssr: false, loading: () => <HuecoRotulo ratio="46 / 10" /> }
);

interface ConexionLenta {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/**
 * Los rótulos suman ~700 KB entre los dos GLB y el decoder. La carta se abre
 * con el móvil desde la mesa: con ahorro de datos activado o cobertura de 2G,
 * la decoración no vale lo que cuesta y se sirve la carta sin ella.
 *
 * Empieza en `true` a propósito. Con el valor contrario el bloque no existía
 * hasta después de hidratar y, al aparecer, empujaba la carta entera hacia
 * abajo: 0.054 de CLS medidos, y eso con la lista de platos vacía. Así el
 * hueco ya viene reservado en el HTML del servidor, y el único movimiento
 * posible es hacia arriba en las conexiones que no van a cargarlos.
 */
function useRotulosPermitidos(): boolean {
  const [permitido, setPermitido] = useState(true);

  useEffect(() => {
    const con = (navigator as Navigator & { connection?: ConexionLenta })
      .connection;
    const lenta =
      con?.saveData === true ||
      con?.effectiveType === "2g" ||
      con?.effectiveType === "slow-2g";
    setPermitido(!lenta);
  }, []);

  return permitido;
}

/**
 * Los dos rótulos de neón del local, flotando escalonados sobre las categorías:
 * el rojo grande a la izquierda y el morado más pequeño a la derecha y más
 * abajo. En móvil se apilan y el morado se reduce.
 *
 * Cada rótulo se monta una sola vez — nada de duplicar el layout por
 * breakpoint con `hidden`, que dejaría cuatro contextos WebGL abiertos.
 */
export function NeonWall({ className = "" }: { readonly className?: string }) {
  const permitido = useRotulosPermitidos();
  if (!permitido) return null;

  return (
    <div
      className={`flex flex-col items-center gap-2 md:flex-row md:items-start md:justify-center md:gap-10 ${className}`}
    >
      <RotuloChurrasco className="w-full md:w-[58%] md:max-w-[700px]" />
      <RotuloNiveles className="w-[92%] md:mt-16 md:w-[37%] md:max-w-[440px]" />
    </div>
  );
}
