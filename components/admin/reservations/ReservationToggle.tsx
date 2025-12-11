"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";

export default function ReservationToggle() {
  const { language } = useLanguage();
  const t = translations[language].reservations.admin.toggle;

  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingState, setPendingState] = useState<boolean>(false);

  // Cargar estado inicial
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations/settings");
      const data = await response.json();

      if (response.ok) {
        setEnabled(data.reservationsEnabled ?? true);
      } else {
        console.error("Error fetching reservation status:", data.error);
      }
    } catch (error) {
      console.error("Network error fetching reservation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = () => {
    const newState = !enabled;
    setPendingState(newState);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setSaving(true);

    try {
      const response = await fetch("/api/reservations/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationsEnabled: pendingState,
          notes: pendingState
            ? "Reservas activadas por administrador"
            : "Reservas desactivadas por administrador",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnabled(data.reservationsEnabled);
      } else {
        console.error("Error updating reservation status:", data.error);
        alert("Error al actualizar el estado de las reservas");
      }
    } catch (error) {
      console.error("Network error updating reservation status:", error);
      alert("Error de red al actualizar el estado");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <p className="text-ash-300 text-sm">Cargando estado...</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold text-ash-100 mb-1">
              {t.title}
            </h3>
            <p className="text-sm text-ash-400">
              {enabled
                ? "Los clientes pueden realizar reservas online"
                : "Las reservas online están cerradas temporalmente"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Estado visual */}
            <div
              className={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider ${
                enabled
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white"
              }`}
            >
              {enabled ? `✓ ${t.enabled}` : `✕ ${t.disabled}`}
            </div>

            {/* Toggle button */}
            <button
              onClick={handleToggleClick}
              disabled={saving}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-flame-blue-bright/30 ${
                enabled
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-gray-600 to-gray-700"
              } ${
                saving
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105"
              }`}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  enabled ? "translate-x-12" : "translate-x-1"
                }`}
              >
                <span className="flex h-full w-full items-center justify-center p-2">
                  <img
                    src="/Logo-Bento-Hero.svg"
                    alt="La Parrilla de Champi"
                    className={`w-full h-full object-contain ${
                      saving ? "opacity-50 animate-pulse" : ""
                    }`}
                  />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl max-w-md mx-4 border-2 border-flame-blue/30">
            <h3 className="text-2xl font-heading font-bold gradient-text mb-4">
              {pendingState ? t.confirmEnable : t.confirmDisable}
            </h3>

            <p className="text-ash-300 mb-6 leading-relaxed">
              {pendingState
                ? "Los clientes podrán realizar reservas online nuevamente. Todas las configuraciones previas se mantendrán."
                : "Los clientes no podrán realizar nuevas reservas online. La configuración actual (capacidades, días cerrados) se preservará y estará disponible cuando reactives las reservas."}
            </p>

            {!pendingState && (
              <div className="bg-fire-red/10 border border-fire-red/30 rounded-xl p-4 mb-6">
                <p className="text-fire-red text-sm font-semibold">
                  ⚠️ Los clientes verán un mensaje informativo cuando intenten
                  reservar
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-charcoal-light text-ash-100 rounded-xl font-heading font-bold hover:bg-charcoal transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-3 rounded-xl font-heading font-bold text-white transition-all duration-200 hover:scale-105 ${
                  pendingState
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/30"
                    : "bg-gradient-to-r from-fire-red to-fire-red-dark hover:shadow-lg hover:shadow-fire-red/30"
                }`}
              >
                {pendingState ? "✓ Activar" : "✕ Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
