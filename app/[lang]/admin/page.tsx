import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getCategories, getDishes } from "@/lib/supabase/menu-service";
import { verifySession } from "@/lib/auth/session";
import { localeHref } from "@/lib/i18n/href";
import type { Locale } from "@/i18n-config";

/**
 * Dashboard de Administración
 * Requiere autenticación
 */
export default async function AdminPage({
  params,
}: Readonly<{ params: { lang: Locale } }>) {
  // Verificar autenticación
  const token = cookies().get("admin-session")?.value;

  if (!(await verifySession(token))) {
    // Con el idioma: sin él, el destino sale sin prefijo, el middleware
    // encadena un segundo 307 y un admin gallego acaba en castellano.
    redirect(localeHref(params.lang, "/admin/login"));
  }

  // Cargar datos
  const [categories, dishes] = await Promise.all([
    getCategories(),
    getDishes(),
  ]);

  return <AdminDashboard categories={categories} dishes={dishes} />;
}
