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
 * Dragón estilo acuarela inspirado en el del cartel oficial (dibujo propio,
 * no extraído del cartel). Aguadas translúcidas + filtros de turbulencia para
 * el borde orgánico de acuarela. Pensado como marca de agua de fondo.
 */
export function WatercolorDragon({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 420 420"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="feria-wc" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
        </filter>
        <filter id="feria-wc-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="24" />
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Aguada de fondo (mancha salvia) */}
      <ellipse
        cx="215"
        cy="225"
        rx="155"
        ry="135"
        fill={FERIA_COLORS.sage}
        opacity="0.3"
        filter="url(#feria-wc-soft)"
      />

      {/* Ala: membrana turquesa-azulada con nervios verdes */}
      <g filter="url(#feria-wc)">
        <path
          d="M158 212 C 128 152 138 100 186 70 C 181 112 190 132 204 142 C 209 106 229 86 258 80 C 244 112 248 136 262 152 C 282 146 302 152 314 168 C 288 178 272 192 264 212 C 242 252 196 256 158 212 Z"
          fill="#5FAEC4"
          opacity="0.6"
          stroke={FERIA_COLORS.green}
          strokeWidth="7"
          strokeOpacity="0.75"
        />
        <path
          d="M162 208 C 196 178 240 164 304 166"
          fill="none"
          stroke={FERIA_COLORS.green}
          strokeWidth="4"
          strokeOpacity="0.45"
        />
        <path
          d="M186 76 C 196 132 210 182 240 224"
          fill="none"
          stroke={FERIA_COLORS.green}
          strokeWidth="4"
          strokeOpacity="0.45"
        />
      </g>

      {/* Cuerpo */}
      <g filter="url(#feria-wc)">
        <path
          d="M142 232 C 152 286 212 312 266 302 C 316 292 336 256 326 226 C 306 246 272 252 236 242 C 196 230 166 227 142 232 Z"
          fill={FERIA_COLORS.green}
          opacity="0.6"
        />
        {/* Cuello y cabeza */}
        <path
          d="M150 237 C 122 212 107 177 110 137 C 112 112 104 97 87 90 C 97 82 110 82 120 88 C 120 76 128 68 140 68 C 136 78 136 88 142 96 C 160 118 162 162 174 197 C 180 214 192 224 207 230 Z"
          fill={FERIA_COLORS.green}
          opacity="0.75"
        />
        {/* Mandíbula abierta (lengua de fuego) */}
        <path
          d="M94 92 C 76 96 62 106 56 120 C 74 118 90 110 100 100 Z"
          fill={FERIA_COLORS.fire}
          opacity="0.8"
        />
        {/* Cuerno */}
        <path
          d="M138 70 C 144 60 152 54 162 52 C 158 62 152 70 144 76 Z"
          fill={FERIA_COLORS.brown}
          opacity="0.7"
        />
        {/* Cola con punta de flecha */}
        <path
          d="M320 240 C 356 234 378 254 375 284 C 373 306 358 320 338 322 C 352 306 356 288 344 271 C 335 259 322 251 304 252 Z"
          fill={FERIA_COLORS.green}
          opacity="0.55"
        />
        <path
          d="M340 314 L 366 320 L 348 340 Z"
          fill={FERIA_COLORS.green}
          opacity="0.6"
        />
        {/* Patas */}
        <path
          d="M210 300 C 208 314 210 326 216 336 L 228 332 C 222 322 220 312 222 302 Z"
          fill={FERIA_COLORS.green}
          opacity="0.6"
        />
        <path
          d="M258 300 C 256 314 258 326 264 336 L 276 332 C 270 322 268 312 270 302 Z"
          fill={FERIA_COLORS.green}
          opacity="0.6"
        />
      </g>

      {/* Ojo */}
      <circle cx="103" cy="97" r="3.5" fill="#F3E6C8" />
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
