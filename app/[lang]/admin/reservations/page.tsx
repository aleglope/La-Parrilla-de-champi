import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ReservationsDashboard from "@/components/admin/reservations/ReservationsDashboard";
import { verifySession } from "@/lib/auth/session";
import { localeHref } from "@/lib/i18n/href";
import type { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Gestión de Reservas | Admin",
  description: "Panel de administración de reservas",
};

/**
 * Panel de gestión de reservas
 * Requiere autenticación (mismo gate que app/[lang]/admin/page.tsx)
 *
 * El gate va en la página y no en un layout de admin/ porque ese layout
 * envolvería también a admin/login y provocaría un bucle de redirección.
 */
export default async function AdminReservationsPage({
  params,
}: Readonly<{ params: { lang: Locale } }>) {
  const token = cookies().get("admin-session")?.value;

  if (!(await verifySession(token))) {
    redirect(localeHref(params.lang, "/admin/login"));
  }

  return <ReservationsDashboard />;
}
