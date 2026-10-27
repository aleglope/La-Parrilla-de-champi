import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isValidLocale, type Locale } from "@/i18n-config";
import { isVacacionesActiva, VACACIONES_END, VACACIONES_TEXTS } from "@/lib/event/vacaciones";
import VacacionesPage from "@/components/vacaciones/VacacionesPage";
import VacacionesExpiry from "@/components/vacaciones/VacacionesExpiry";

// The active window is evaluated for every request, including direct holiday URLs.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  if (!isValidLocale(params.lang)) notFound();
  const texts = VACACIONES_TEXTS[params.lang];
  return {
    title: texts.title,
    description: `${texts.title}. ${texts.returnDateFull}.`,
    alternates: { canonical: `/${params.lang}`, languages: { es: "/es", gl: "/gl" } },
  };
}

export default function VacacionesProductionPage({ params }: { params: { lang: Locale } }) {
  if (!isValidLocale(params.lang)) notFound();
  const serverNow = new Date();
  if (!isVacacionesActiva(serverNow)) redirect(`/${params.lang}`);

  return (
    <>
      <VacacionesPage lang={params.lang} />
      <VacacionesExpiry serverNow={serverNow.getTime()} endsAt={VACACIONES_END.getTime()} />
    </>
  );
}
