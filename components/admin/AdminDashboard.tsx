'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CategoriesManager } from './CategoriesManager';
import { DishesManager } from './DishesManager';
import type { Category, Dish } from '@/lib/types';

interface AdminDashboardProps {
  categories: Category[];
  dishes: Dish[];
}

/**
 * Dashboard principal del admin
 */
export function AdminDashboard({ categories: initialCategories, dishes: initialDishes }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');
  const [categories, setCategories] = useState(initialCategories);
  const [dishes, setDishes] = useState(initialDishes);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const revalidateMenu = async () => {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/menu' }),
    });
  };

  const refreshData = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="bg-charcoal-dark border-b border-flame-blue/20 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-fire rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-400">La Parrilla de Champi</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-flame-blue-bright hover:text-flame-blue-glow transition-colors text-sm font-medium"
              >
                Ver Menú Público →
              </a>
              <button
                onClick={handleLogout}
                className="bg-charcoal-light hover:bg-charcoal text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-charcoal-dark border-b border-flame-blue/20">
        <div className="container-custom">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dishes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'dishes'
                  ? 'border-fire-red text-fire-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Gestión de Platos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'border-fire-red text-fire-red'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Gestión de Categorías
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dishes' ? (
            <DishesManager
              dishes={dishes}
              categories={categories}
              onUpdate={refreshData}
              onRevalidate={revalidateMenu}
            />
          ) : (
            <CategoriesManager
              categories={categories}
              onUpdate={refreshData}
              onRevalidate={revalidateMenu}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

