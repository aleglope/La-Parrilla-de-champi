/**
 * SVGs ornamentales del modo feria (inline, sin assets externos).
 * Server Components estáticos: sin "use client", sin hooks, sin JS en cliente.
 * Paleta aproximada del cartel oficial de la XXVII Feira Medieval Vila de Noia.
 */

export const FERIA_COLORS = {
  turquoise: "#87CDD2",
  gold: "#8A6520",
  brown: "#6B4A2B",
  green: "#2E8B45",
  sage: "#A8CBA0",
  mustard: "#E3C355",
  fire: "#D9542E",
} as const;

interface OrnamentProps {
  readonly className?: string;
}

/** Flor de lis estilizada (path compartido por los ornamentos). */
function FleurDeLisGlyph({ fill }: Readonly<{ fill: string }>) {
  return (
    <g fill={fill}>
      {/* Pétalo central */}
      <path d="M32 6c-4 7-7 11-7 17 0 4 3 8 7 10 4-2 7-6 7-10 0-6-3-10-7-17z" />
      {/* Pétalo izquierdo */}
      <path d="M17 20c-6 3-9 8-7 13 1 4 5 6 10 5 4-1 6-4 7-7-3-4-6-8-10-11z" />
      {/* Pétalo derecho */}
      <path d="M47 20c6 3 9 8 7 13-1 4-5 6-10 5-4-1-6-4-7-7 3-4 6-8 10-11z" />
      {/* Banda */}
      <rect x="24" y="34" width="16" height="5" rx="1.5" />
      {/* Cola */}
      <path d="M32 40c-3 5-5 9-5 13 0 3 2 5 5 5s5-2 5-5c0-4-2-8-5-13z" />
    </g>
  );
}

/**
 * Cuadro mostaza de esquina con flor de lis, inspirado en el cartel oficial.
 * Rotar/posicionar desde el consumidor vía className.
 */
export function CornerOrnament({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="6"
        fill={FERIA_COLORS.mustard}
        stroke={FERIA_COLORS.brown}
        strokeWidth="3"
      />
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="4"
        fill="none"
        stroke={FERIA_COLORS.gold}
        strokeWidth="1.5"
      />
      <FleurDeLisGlyph fill={FERIA_COLORS.brown} />
    </svg>
  );
}

/**
 * Espadas cruzadas estilo acuarela: hoja azulada como la del cartel,
 * guarda y pomo dorados, empuñadura marrón.
 */
export function CrossedSwords({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="feria-wc-sword" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.09"
            numOctaves="2"
            seed="11"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </defs>
      <g filter="url(#feria-wc-sword)">
        {[45, -45].map((angle) => (
          <g key={angle} transform={`translate(60 60) rotate(${angle})`}>
            {/* Hoja con punta */}
            <path
              d="M0 -52 L6 -44 L6 10 L-6 10 L-6 -44 Z"
              fill="#6FB8C9"
              opacity="0.85"
              stroke={FERIA_COLORS.green}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            {/* Vaceo central */}
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="6"
              stroke="#F3E6C8"
              strokeWidth="1.5"
              opacity="0.7"
            />
            {/* Guarda */}
            <rect
              x="-15"
              y="10"
              width="30"
              height="6"
              rx="3"
              fill={FERIA_COLORS.mustard}
              stroke={FERIA_COLORS.gold}
              strokeWidth="1.5"
            />
            {/* Empuñadura */}
            <rect x="-3.5" y="16" width="7" height="16" rx="2" fill={FERIA_COLORS.brown} />
            {/* Pomo */}
            <circle cx="0" cy="37" r="5" fill={FERIA_COLORS.mustard} stroke={FERIA_COLORS.gold} strokeWidth="1.5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Separador horizontal con flor de lis central y trazos vegetales laterales. */
export function FleurDeLisDivider({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1="8"
        y1="12"
        x2="96"
        y2="12"
        stroke={FERIA_COLORS.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="144"
        y1="12"
        x2="232"
        y2="12"
        stroke={FERIA_COLORS.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Hojas laterales */}
      <path
        d="M96 12c4-4 8-5 12-3-3 4-7 5-12 3z"
        fill={FERIA_COLORS.green}
      />
      <path
        d="M144 12c-4-4-8-5-12-3 3 4 7 5 12 3z"
        fill={FERIA_COLORS.green}
      />
      {/* Flor de lis central, reducida */}
      <g transform="translate(108 0) scale(0.375)">
        <FleurDeLisGlyph fill={FERIA_COLORS.gold} />
      </g>
    </svg>
  );
}
