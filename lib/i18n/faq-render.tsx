import Link from "next/link";
import { Fragment } from "react";
import { BUSINESS } from "@/lib/config/business";
import { RATING, REVIEW_COUNT } from "@/data/reviews";
import { localeHref } from "@/lib/i18n/href";
import type { Locale } from "@/i18n-config";

/**
 * Marcadores para las respuestas del FAQ.
 *
 * Las respuestas viven en translations.ts como texto con marcadores del tipo
 * {telefono}. De ahí salen DOS cosas que tienen que decir exactamente lo mismo:
 *
 *   - lo que ve el usuario, con enlaces reales (teléfono pulsable, carta, TikTok)
 *   - el campo `text` del FAQPage, que debe ser texto plano
 *
 * Si ambos divergieran, el marcado estaría describiendo algo que no está en la
 * página: eso es marcado engañoso y Google lo trata como tal. Por eso la
 * etiqueta visible del enlace y su versión en texto son la MISMA cadena.
 *
 * Los datos que caducan (valoración, número de reseñas, teléfono) se leen de su
 * fuente única en vez de escribirse a mano dentro del texto, para que no haya
 * que acordarse de tocarlos en doce sitios.
 */

type Marcador = {
  /** Texto que se lee, idéntico en la versión visible y en la del schema. */
  etiqueta: string;
  /** Si lo lleva, se renderiza como enlace. */
  href?: string;
  externo?: boolean;
};

function marcadores(lang: Locale): Record<string, Marcador> {
  const esGallego = lang === "gl";

  return {
    telefono: {
      etiqueta: BUSINESS.phone.display,
      href: `tel:${BUSINESS.phone.tel}`,
    },
    carta: {
      etiqueta: esGallego
        ? "a carta completa e actualizada"
        : "la carta completa y actualizada",
      href: localeHref(lang, "/menu"),
    },
    tiktok: {
      etiqueta: "@champimuros",
      href: BUSINESS.social.tiktok,
      externo: true,
    },
    // Sin enlace: solo evita que la valoración se escriba a mano en cada idioma
    // y se quede desfasada, como ya pasó con el "más de 171".
    valoracion: {
      etiqueta: esGallego
        ? `${RATING.toLocaleString("gl-ES")} sobre 5 con ${REVIEW_COUNT} recensións`
        : `${RATING.toLocaleString("es-ES")} sobre 5 con ${REVIEW_COUNT} reseñas`,
    },
  };
}

const PATRON = /\{(\w+)\}/g;

/** Versión en texto plano, para el `text` del FAQPage. */
export function faqTextoPlano(plantilla: string, lang: Locale): string {
  const mapa = marcadores(lang);
  return plantilla.replace(PATRON, (coincidencia, clave: string) => {
    return mapa[clave]?.etiqueta ?? coincidencia;
  });
}

/** Versión visible, con los enlaces reales. */
export function FaqRespuesta({
  plantilla,
  lang,
}: {
  readonly plantilla: string;
  readonly lang: Locale;
}) {
  const mapa = marcadores(lang);
  const trozos = plantilla.split(PATRON);

  // split() con un grupo de captura intercala: [texto, clave, texto, clave...]
  return (
    <>
      {trozos.map((trozo, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{trozo}</Fragment>;

        const m = mapa[trozo];
        if (!m) return <Fragment key={i}>{`{${trozo}}`}</Fragment>;
        if (!m.href) return <Fragment key={i}>{m.etiqueta}</Fragment>;

        const clases =
          "font-medium text-flame-blue-bright underline decoration-flame-blue/40 underline-offset-4 transition-colors hover:text-white";

        if (m.externo || m.href.startsWith("tel:")) {
          return (
            <a
              key={i}
              href={m.href}
              className={clases}
              {...(m.externo
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {m.etiqueta}
            </a>
          );
        }

        return (
          <Link key={i} href={m.href} className={clases}>
            {m.etiqueta}
          </Link>
        );
      })}
    </>
  );
}
