import type { Metadata, Viewport } from "next";
import "./../globals.css"; // Adjusted path
import { ClientProviders } from "@/components/providers/ClientProviders";
import { DeviceDetector } from "@/components/utils/DeviceDetector";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";
import { i18n, type Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd } from "@/components/seo/JsonLd";
import { restaurantSchema } from "@/lib/seo/schemas";

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
    title: {
      template: `%s | ${dictionary.nav.subtitle}`,
      default: "La Parrilla de Champi | Carne a la Brasa",
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
  return (
    <html
      lang={params.lang}
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
