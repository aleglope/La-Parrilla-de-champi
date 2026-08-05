import type { Metadata, Viewport } from "next";
import "./../globals.css"; // Adjusted path
import { ClientProviders } from "@/components/providers/ClientProviders";
import { DeviceDetector } from "@/components/utils/DeviceDetector";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";
import { i18n, isValidLocale, type Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd } from "@/components/seo/JsonLd";
import { restaurantSchema } from "@/lib/seo/schemas";
import { SITE_URL } from "@/lib/seo/site";

// Fuente Display - Para títulos principales impactantes
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Fuente Heading - Para subtítulos y navegación
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Fuente Body - Para texto corrido
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);

  return {
    // Sin esto, Next deja los hreflang y las URLs de Open Graph en relativo
    // ("/es", "/gl"), y Google exige absolutas en rel="alternate": los ignora.
    // Con dos idiomas es el ajuste de SEO más rentable del sitio.
    metadataBase: new URL(SITE_URL),
    title: {
      template: "%s | La Parrilla de Champi",
      // nav.subtitle está traducido y menciona Noia, así que el title cambia
      // de verdad entre /es y /gl en vez de repetir el mismo castellano.
      default: `La Parrilla de Champi — ${dictionary.nav.subtitle}`,
    },
    description: dictionary.hero.description,
    keywords:
      params.lang === "gl"
        ? "parrilla, carne á brasa, restaurante, champi, asador, barbacoa, galicia, noia"
        : "parrilla, carne a la brasa, restaurante, champi, asador, barbacoa, galicia, noia",
    authors: [{ name: "La Parrilla de Champi" }],
    openGraph: {
      title: "La Parrilla de Champi",
      description: dictionary.hero.description,
      type: "website",
      locale: params.lang === "gl" ? "gl_ES" : "es_ES",
      siteName: "La Parrilla de Champi",
    },
    // alternates: removed to be handled per-page for correct sub-path targeting
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#C01F19",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  // El guard de idioma vive en las páginas, no aquí: este layout es el único
  // root layout del proyecto (no hay app/layout.tsx), así que si lanzase
  // notFound() no quedaría nadie que emitiera <html> y <body>, y el 404 se
  // servía como un fragmento suelto sin título ni idioma.
  //
  // Aquí solo se acota el atributo lang: un segmento inválido no puede acabar
  // en <html lang="llms.txt">.
  const htmlLang = isValidLocale(params.lang) ? params.lang : i18n.defaultLocale;

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning={true}
      className={`dark ${bebasNeue.variable} ${barlowCondensed.variable} ${inter.variable}`}
    >
      <body className="overflow-x-hidden">
        <JsonLd data={restaurantSchema} />
        <DeviceDetector />

        <ClientProviders lang={params.lang}>{children}</ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
