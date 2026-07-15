import type { Metadata } from "next";
import { MedievalHeroBanner } from "@/components/feria/MedievalHeroBanner";
import { MedievalMenuContent } from "@/components/feria/MedievalMenuContent";
import type { Locale } from "@/i18n-config";

/**
 * Preview oculta del modo feria: renderiza banner + carta medieval SIN
 * comprobar la fecha. Permite validar en producción antes de la ventana.
 * No indexable; queda inocua tras el evento.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feria Preview",
  robots: { index: false, follow: false },
};

export default function FeriaPreviewPage({
  params,
}: Readonly<{ params: { lang: Locale } }>) {
  return (
    <main className="min-h-screen bg-[#87CDD2]">
      <MedievalHeroBanner lang={params.lang} />
      <MedievalMenuContent lang={params.lang} />
    </main>
  );
}
