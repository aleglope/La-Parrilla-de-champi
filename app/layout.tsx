import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { DeviceDetector } from "@/components/utils/DeviceDetector";
import { Analytics } from "@vercel/analytics/react";
import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";

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

export const metadata: Metadata = {
  title: "La Parrilla de Champi | Carne a la Brasa",
  description:
    "¡Que pasa gentuza! Descubre la mejor carne a la brasa de la ciudad. Experiencia gastronómica única con sabor a fuego y mar.",
  keywords: "parrilla, carne a la brasa, restaurante, champi, asador, barbacoa",
  authors: [{ name: "La Parrilla de Champi" }],
  openGraph: {
    title: "La Parrilla de Champi",
    description: "La mejor carne a la brasa. ¡Que pasa gentuza!",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#C01F19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning={true}
      className={`dark ${bebasNeue.variable} ${barlowCondensed.variable} ${inter.variable}`}
    >
      <body className="overflow-x-hidden">
        <DeviceDetector />
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
