import { Suspense } from "react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { MenuContent } from "@/components/menu/MenuContent";
import { MenuSkeleton } from "@/components/menu/MenuSkeleton";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { getCategories, getDishes } from "@/lib/supabase/menu-service";
import {
  generateMenuSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  isFeriaActiva,
  FERIA_TEXTS,
  generateMedievalMenuSchema,
} from "@/lib/event/feria-medieval";
import { MedievalMenuContent } from "@/components/feria/MedievalMenuContent";
import type { Locale } from "@/i18n-config";

/**
 * Página del Menú Digital
 * Optimizada para acceso vía QR con SSG + ISR
 * Revalidación cada 60 segundos para reflejar cambios del admin
 */
export const revalidate = 60; // ISR: Revalida cada 60 segundos

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  // Modo feria: metadata del evento manteniendo alternates idénticos
  if (isFeriaActiva()) {
    const texts = FERIA_TEXTS[params.lang as Locale];
    return {
      title: texts.metaTitle,
      description: texts.metaDescription,
      alternates: {
        languages: {
          es: "/es/menu",
          gl: "/gl/menu",
        },
      },
    };
  }

  const dictionary = await getDictionary(params.lang as "es" | "gl");

  return {
    title: dictionary.menu.title,
    description: dictionary.menu.subtitle,
    alternates: {
      languages: {
        es: "/es/menu",
        gl: "/gl/menu",
      },
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: { lang: string };
}) {
  // Modo feria: carta medieval sin fetch a Supabase (bifurcación ANTES del fetch)
  if (isFeriaActiva()) {
    const lang = params.lang as Locale;
    const medievalBreadcrumbSchema = generateBreadcrumbSchema([
      { name: "Inicio", item: `/${lang}` },
      { name: "Carta", item: `/${lang}/menu` },
    ]);

    return (
      <main className="min-h-screen bg-[#87CDD2]">
        <JsonLd data={generateMedievalMenuSchema(lang)} />
        <JsonLd data={medievalBreadcrumbSchema} id="schema-breadcrumb" />
        {/* Header con selector de idioma (se mantiene durante la feria) */}
        <MenuHeader />

        {/* Carta medieval */}
        <MedievalMenuContent lang={lang} />
      </main>
    );
  }

  // Fetch de datos en el servidor para SSG
  const categories = await getCategories();
  const dishes = await getDishes();

  const menuSchema = generateMenuSchema(categories, dishes);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", item: `/${params.lang}` },
    { name: "Carta", item: `/${params.lang}/menu` },
  ]);

  return (
    <main className="min-h-screen bg-charcoal pb-20">
      <JsonLd data={menuSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* Header con selector de idioma */}
      <MenuHeader />

      {/* Contenido del menú */}
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent categories={categories} dishes={dishes} />
      </Suspense>

      {/* Footer compacto */}
      <footer className="fixed bottom-0 left-0 right-0 bg-charcoal-dark/95 backdrop-blur-lg border-t border-flame-blue/20 py-3">
        <div className="container-custom text-center">
          <p className="text-sm text-gray-400">
            🔥 ¡Que pasa gentuza! Pide a tu camarero
          </p>
        </div>
      </footer>
    </main>
  );
}
