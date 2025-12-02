import { Suspense } from 'react';
import { MenuContent } from '@/components/menu/MenuContent';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { getCategories, getDishes } from '@/lib/supabase/menu-service';

/**
 * Página del Menú Digital
 * Optimizada para acceso vía QR con SSG + ISR
 * Revalidación cada 60 segundos para reflejar cambios del admin
 */
export const revalidate = 60; // ISR: Revalida cada 60 segundos

export default async function MenuPage() {
  // Fetch de datos en el servidor para SSG
  const categories = await getCategories();
  const dishes = await getDishes();

  return (
    <main className="min-h-screen bg-charcoal pb-20">
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

