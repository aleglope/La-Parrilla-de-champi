"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CategoriesManager } from "./CategoriesManager";
import { DishesManager } from "./DishesManager";
import { revalidateMenu as revalidateMenuAction } from "@/app/actions/revalidateMenu";
import type { Category, Dish } from "@/lib/types";

interface AdminDashboardProps {
  readonly categories: Category[];
  readonly dishes: Dish[];
}

/**
 * Dashboard principal del admin
 */
export function AdminDashboard({
  categories: initialCategories,
  dishes: initialDishes,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dishes" | "categories">("dishes");

  // Estado mutable para actualizaciones optimistas
  const [categories, setCategories] = useState(initialCategories);
  const [dishes, setDishes] = useState(initialDishes);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const revalidateMenu = async () => {
    // Revalidación server-side vía Server Action (sin fetch ni secretos en el browser)
    await revalidateMenuAction();
  };

  const refreshData = () => {
    router.refresh();
  };

  // Callbacks para actualización optimista
  const updateDishes = (updater: (prev: Dish[]) => Dish[]) => {
    setDishes(updater);
  };

  const updateCategories = (updater: (prev: Category[]) => Category[]) => {
    setCategories(updater);
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      {/* Header */}
      <header className="bg-charcoal-dark border-b border-flame-blue/20 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff512f] to-[#dd2476] flex items-center justify-center shadow-lg shadow-[#dd2476]/30 transition-transform duration-300 hover:rotate-[5deg] hover:scale-105">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-400">La Parrilla de Champi</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="/admin/reservations"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[0.95rem] bg-gradient-to-br from-[#ff512f] to-[#dd2476] text-white shadow-lg shadow-[#dd2476]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#dd2476]/40 active:translate-y-0 transition-all duration-300 border-none cursor-pointer no-underline"
              >
                <span>📅</span>
                <span>Reservas</span>
              </a>
              <a
                href="/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[0.95rem] text-blue-400 bg-transparent hover:text-blue-300 hover:translate-x-1 hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] transition-all duration-300 no-underline"
              >
                Ver Menú Público →
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[0.95rem] bg-white/5 text-gray-400 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
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
              onClick={() => setActiveTab("dishes")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "dishes"
                  ? "border-fire-red text-fire-red"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Gestión de Platos
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "categories"
                  ? "border-fire-red text-fire-red"
                  : "border-transparent text-gray-400 hover:text-white"
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
          {activeTab === "dishes" ? (
            <DishesManager
              dishes={dishes}
              categories={categories}
              onUpdate={refreshData}
              onRevalidate={revalidateMenu}
              onUpdateDishes={updateDishes}
            />
          ) : (
            <CategoriesManager
              categories={categories}
              onUpdate={refreshData}
              onRevalidate={revalidateMenu}
              onUpdateCategories={updateCategories}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
