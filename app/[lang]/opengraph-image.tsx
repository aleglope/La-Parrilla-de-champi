import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n-config";
import { BUSINESS } from "@/lib/config/business";

/**
 * Imagen de vista previa al compartir (WhatsApp, Facebook, X, Telegram…).
 *
 * Sin esto, un enlace a la web salía como un rectángulo gris con texto: para
 * un restaurante, que se comparte sobre todo por WhatsApp, es la diferencia
 * entre que abran el enlace o no.
 *
 * El logo se lee del disco y se incrusta en base64 a propósito: así generar
 * la imagen no depende de ninguna petición de red durante el build.
 *
 * Nada de emoji en el texto: satori solo pinta lo que cubra la fuente cargada
 * y el resto sale como cuadrados. Por eso no se usa `hero.slogan`.
 */
export const alt = BUSINESS.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);

  const logo = await readFile(
    join(process.cwd(), "public", "LOGO-CHAMPI-PNG-SOLO.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // Satori exige "display: flex" en cualquier nodo con más de un hijo, y una
  // interpolación como {a} {b} ya cuenta como tres. Se arman antes como una
  // sola cadena para que cada nodo tenga un único hijo de texto.
  const reclamo = `${dictionary.hero.title} ${dictionary.hero.subtitle}`;
  const direccion = `${BUSINESS.address.street} · ${BUSINESS.address.postalCode} ${BUSINESS.address.locality}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1a2324 0%, #283435 100%)",
          padding: "64px 72px",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={120} height={120} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 34,
                letterSpacing: 10,
                textTransform: "uppercase",
                color: "#F5F3F0",
              }}
            >
              {BUSINESS.name}
            </div>
            <div style={{ fontSize: 26, color: "#8FA3A5", marginTop: 6 }}>
              {dictionary.nav.subtitle}
            </div>
          </div>
        </div>

        {/* Reclamo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#F5F3F0",
              maxWidth: 960,
            }}
          >
            {reclamo}
          </div>
          <div
            style={{
              width: 180,
              height: 10,
              marginTop: 32,
              background: "#C01F19",
              borderRadius: 6,
            }}
          />
        </div>

        {/* NAP */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            color: "#B6C4C5",
          }}
        >
          <div style={{ display: "flex" }}>{direccion}</div>
          <div style={{ display: "flex", color: "#F5F3F0" }}>
            {BUSINESS.phone.display}
          </div>
        </div>
      </div>
    ),
    size
  );
}
