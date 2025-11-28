import { Suspense } from 'react';
import { MenuContent } from '@/components/menu/MenuContent';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
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
      {/* Header minimalista */}
      <header className="sticky top-0 z-50 bg-charcoal-dark/95 backdrop-blur-lg border-b border-flame-blue/20">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fire-red">La Parrilla de Champi</h1>
              <p className="text-sm text-gray-400">Carne a la Brasa</p>
            </div>
            <a 
              href="/"
              className="text-flame-blue-bright hover:text-flame-blue-glow transition-colors text-sm font-medium"
            >
              ← Volver
            </a>
          </div>
        </div>
      </header>

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

