import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale } from "@/i18n-config";
import { VACACIONES_TEXTS } from "@/lib/event/vacaciones";
import VacacionesPage from "@/components/vacaciones/VacacionesPage";

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  if (!isValidLocale(params.lang)) notFound();
  return {
    title: VACACIONES_TEXTS[params.lang].title,
    description: params.lang === "gl"
      ? "Estamos de vacacións. Voltamos o 12 de novembro de 2026."
      : "Estamos de vacaciones. Volvemos el 12 de noviembre de 2026.",
    robots: { index: false, follow: false },
    alternates: { canonical: null, languages: {} },
  };
}

export default function VacacionesPreviewPage({ params }: { params: { lang: Locale } }) {
  if (!isValidLocale(params.lang)) notFound();
  return <VacacionesPage lang={params.lang} preview />;
}
