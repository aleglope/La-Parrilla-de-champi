import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getCategories, getDishes } from "@/lib/supabase/menu-service";
import { verifySession } from "@/lib/auth/session";

/**
 * Dashboard de Administración
 * Requiere autenticación
 */
export default async function AdminPage() {
  // Verificar autenticación
  const token = cookies().get("admin-session")?.value;

  if (!(await verifySession(token))) {
    redirect("/admin/login");
  }

  // Cargar datos
  const [categories, dishes] = await Promise.all([
    getCategories(),
    getDishes(),
  ]);

  return <AdminDashboard categories={categories} dishes={dishes} />;
}
