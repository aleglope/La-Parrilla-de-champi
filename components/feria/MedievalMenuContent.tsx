import Image from "next/image";
import {
  MEDIEVAL_DISHES,
  FERIA_TEXTS,
  formatPrice,
} from "@/lib/event/feria-medieval";
import { medievalFont } from "./fonts";
import {
  CornerOrnament,
  CrossedSwords,
  FleurDeLisDivider,
} from "./MedievalOrnaments";
import type { Locale } from "@/i18n-config";

interface MedievalMenuContentProps {
  readonly lang: Locale;
}

/**
 * Carta medieval completa del modo feria (Server Component, sin JS de cliente).
 * Fondo turquesa del cartel, marco ornamental con cuadros mostaza en las
 * esquinas y flores de lis como separadores. Sin fotos (decisión de diseño).
 */
export function MedievalMenuContent({ lang }: MedievalMenuContentProps) {
  const texts = FERIA_TEXTS[lang];

  return (
    <section className="relative bg-[#87CDD2] py-14 px-4 sm:py-16 sm:px-6">
      {/*
       * Cartel oficial como fondo fijo al viewport (no a la sección): cada
       * dispositivo lo muestra a su escala natural y el contenido se desliza
       * por encima. Evita el zoom extremo en móvil de la variante absolute.
       */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <Image
          src="/feria/cartel-feria-2026.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="select-none object-cover object-[50%_30%]"
        />
        {/* Velo turquesa para integrar el cartel y asegurar legibilidad en bordes */}
        <div className="absolute inset-0 bg-[#87CDD2]/25" />
      </div>

      <div className="relative mx-auto max-w-2xl rounded-lg border-4 border-[#8A6520] bg-[#9AD5D9]/60 backdrop-blur-[6px] px-5 py-12 sm:px-10 shadow-[0_10px_40px_rgba(43,74,43,0.35)]">
        {/* Cuadros mostaza en las 4 esquinas */}
        <CornerOrnament className="absolute -top-5 -left-5 h-12 w-12 sm:h-14 sm:w-14" />
        <CornerOrnament className="absolute -top-5 -right-5 h-12 w-12 sm:h-14 sm:w-14 rotate-90" />
        <CornerOrnament className="absolute -bottom-5 -left-5 h-12 w-12 sm:h-14 sm:w-14 -rotate-90" />
        <CornerOrnament className="absolute -bottom-5 -right-5 h-12 w-12 sm:h-14 sm:w-14 rotate-180" />

        {/* Cabecera del evento */}
        <header className="relative text-center">
          <p
            className={`${medievalFont.className} text-sm uppercase tracking-[0.3em] text-[#0E2E16]`}
          >
            {texts.eventName}
          </p>
          <h2
            className={`${medievalFont.className} mt-3 text-3xl sm:text-4xl text-[#38220C]`}
          >
            {texts.menuHeading}
          </h2>
          <p className="mt-2 text-sm text-[#2E1E0C]">{texts.menuSubtitle}</p>
          <p
            className={`${medievalFont.className} mt-2 text-lg text-[#38220C]`}
          >
            {texts.dates}
          </p>
        </header>

        {/* Espadas cruzadas bajo la cabecera */}
        <CrossedSwords className="relative mx-auto mt-6 h-16 w-16" />

        <FleurDeLisDivider className="mx-auto mt-4 h-6 w-56" />

        {/* Lista de platos */}
        <ul className="relative mt-8 space-y-6">
          {MEDIEVAL_DISHES.map((dish, index) => {
            const name = lang === "gl" ? dish.name_gl : dish.name;
            const description =
              lang === "gl" ? dish.description_gl : dish.description;
            return (
              <li key={dish.id}>
                {index > 0 && (
                  <FleurDeLisDivider className="mx-auto mb-6 h-4 w-36 opacity-70" />
                )}
                <div className="flex items-baseline justify-between gap-4">
                  <h3
                    className={`${medievalFont.className} text-xl text-[#38220C]`}
                  >
                    {name}
                  </h3>
                  <span
                    className={`${medievalFont.className} whitespace-nowrap text-xl text-[#451103]`}
                  >
                    {formatPrice(dish.price)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#2E1E0C]">
                  {description}
                </p>
              </li>
            );
          })}
        </ul>

        <FleurDeLisDivider className="relative mx-auto mt-10 h-6 w-56" />
      </div>
    </section>
  );
}
