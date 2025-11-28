import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getCategories, getDishes } from '@/lib/supabase/menu-service';

/**
 * Dashboard de Administración
 * Requiere autenticación
 */
export default async function AdminPage() {
  // Verificar autenticación
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin-auth')?.value === 'true';

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  // Cargar datos
  const [categories, dishes] = await Promise.all([
    getCategories(),
    getDishes(),
  ]);

  return <AdminDashboard categories={categories} dishes={dishes} />;
}

