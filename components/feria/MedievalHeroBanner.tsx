import Link from "next/link";
import { FERIA_TEXTS } from "@/lib/event/feria-medieval";
import { medievalFont } from "./fonts";
import { FleurDeLisDivider } from "./MedievalOrnaments";
import type { Locale } from "@/i18n-config";

interface MedievalHeroBannerProps {
  readonly lang: Locale;
}

/**
 * Anuncio estilo pergamino de la home durante la feria (Server Component).
 * Enlaza a la carta medieval en /{lang}/menu.
 */
export function MedievalHeroBanner({ lang }: MedievalHeroBannerProps) {
  const texts = FERIA_TEXTS[lang];

  return (
    <div className="relative z-10 px-4 pt-6">
      <div className="mx-auto max-w-xl rounded-lg border-2 border-[#8A6520] bg-[#F3E6C8] px-6 py-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <h2
          className={`${medievalFont.className} text-xl sm:text-2xl text-[#6B4A2B]`}
        >
          {texts.eventName}
        </h2>
        <p
          className={`${medievalFont.className} mt-1 text-base text-[#6F4F14]`}
        >
          {texts.dates}
        </p>
        <FleurDeLisDivider className="mx-auto mt-3 h-4 w-40" />
        <Link
          href={`/${lang}/menu`}
          className={`${medievalFont.className} mt-4 inline-block rounded border-2 border-[#6B4A2B] bg-[#E3C355] px-6 py-2 text-base text-[#4A3320] shadow-[0_4px_12px_rgba(107,74,43,0.4)] transition-colors motion-safe:duration-200 hover:bg-[#D9542E] hover:text-[#FFF6E5]`}
        >
          {texts.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
