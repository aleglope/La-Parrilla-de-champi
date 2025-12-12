"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import type { Reservation, ReservationStatus } from "@/lib/types/reservations";
import CapacityManager from "./CapacityManager";
import ClosedDaysManager from "./ClosedDaysManager";
import DatePicker from "@/components/ui/DatePicker";
import ReservationToggle from "./ReservationToggle";
import ManualReservationModal from "./ManualReservationModal";

export default function ReservationsDashboard() {
  const { language } = useLanguage();
  const t = translations[language].reservations.admin;

  const [activeTab, setActiveTab] = useState<
    "reservations" | "capacity" | "closed"
  >("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "today" | "upcoming" | "specific"
  >("today");
  const [specificDate, setSpecificDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all"
  );
  const [showManualModal, setShowManualModal] = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      let url = "/api/reservations/list?";

      if (filter === "today") {
        url += `date=${today}`;
      } else if (filter === "upcoming") {
        url += `startDate=${today}`;
      } else if (filter === "specific") {
        // Only apply specific date filter if date is selected
        if (specificDate) {
          url += `date=${specificDate}`;
        }
        // If no date selected, don't add date filter (show all)
      }

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReservations(data.reservations || []);
      } else {
        console.error("Error fetching reservations:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter, specificDate]);

  useEffect(() => {
    if (activeTab === "reservations") {
      fetchReservations();
    }
  }, [activeTab, fetchReservations]);

  const updateReservationStatus = async (
    id: string,
    status: ReservationStatus
  ) => {
    try {
      const response = await fetch(`/api/reservations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchReservations();
      } else {
        const data = await response.json();
        console.error("Error updating status:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const getStatusBadgeClass = (status: ReservationStatus) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider";
    switch (status) {
      case "confirmed":
        return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white`;
      case "pending":
        return `${baseClass} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white`;
      case "cancelled":
        return `${baseClass} bg-gradient-to-r from-red-500 to-red-600 text-white`;
      case "no_show":
        return `${baseClass} bg-gradient-to-r from-gray-500 to-gray-600 text-white`;
      case "completed":
        return `${baseClass} bg-gradient-to-r from-blue-500 to-blue-600 text-white`;
      default:
        return baseClass;
    }
  };

  const getSourceBadgeClass = (source: string) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider";
    return source === "web"
      ? `${baseClass} bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white`
      : `${baseClass} bg-gradient-to-r from-fire-red to-fire-red-dark text-white`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Render the reservations list based on loading/data state
  const renderReservationsList = () => {
    if (loading) {
      return (
        <div className="text-center py-16 font-body text-xl text-ash-400">
          Cargando reservas...
        </div>
      );
    }

    if (reservations.length === 0) {
      return (
        <div className="glass-card p-12 rounded-2xl text-center">
          <p className="text-xl font-body text-ash-300">
            No hay reservas para mostrar
          </p>
        </div>
      );
    }

    return (
      <div className="glass-card p-6 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ash-500/20">
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.date}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.time}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.name}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.guests}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.phone}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.source}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.status}
              </th>
              <th className="px-4 py-3 text-left font-heading font-bold text-ash-200 text-sm uppercase tracking-wider">
                {t.table.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-b border-ash-500/10 hover:bg-charcoal-light/30 transition-colors"
              >
                <td className="px-4 py-4 font-body text-ash-100">
                  {formatDate(reservation.reservationDate)}
                </td>
                <td className="px-4 py-4 font-heading font-bold text-fire-red">
                  {reservation.timeSlot}
                </td>
                <td className="px-4 py-4 font-body text-ash-100">
                  {reservation.guestName}
                </td>
                <td className="px-4 py-4 font-body text-ash-100">
                  {reservation.guestsCount}
                </td>
                <td className="px-4 py-4 font-body text-ash-100">
                  {reservation.guestPhone}
                </td>
                <td className="px-4 py-4">
                  <span className={getSourceBadgeClass(reservation.source)}>
                    {t.source[reservation.source as keyof typeof t.source]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={getStatusBadgeClass(reservation.status)}>
                    {reservation.status === "no_show"
                      ? t.status.noShow
                      : t.status[reservation.status as keyof typeof t.status] ||
                        reservation.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {reservation.status === "pending" && (
                      <button
                        className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
                        onClick={() =>
                          updateReservationStatus(reservation.id, "confirmed")
                        }
                        title={t.actions.confirm}
                      >
                        ✓
                      </button>
                    )}
                    {(reservation.status === "pending" ||
                      reservation.status === "confirmed") && (
                      <button
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
                        onClick={() =>
                          updateReservationStatus(reservation.id, "cancelled")
                        }
                        title={t.actions.cancel}
                      >
                        ✕
                      </button>
                    )}
                    {reservation.status === "confirmed" && (
                      <button
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                        onClick={() =>
                          updateReservationStatus(reservation.id, "completed")
                        }
                        title={t.actions.markCompleted}
                      >
                        ✔
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the content for the active tab
  const renderTabContent = () => {
    if (activeTab === "capacity") {
      return <CapacityManager />;
    }

    if (activeTab === "closed") {
      return <ClosedDaysManager />;
    }

    // Default: Reservations tab
    return (
      <>
        {/* Filters */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white"
                    : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
                }`}
                onClick={() => setFilter("all")}
              >
                {t.filters.all}
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "today"
                    ? "bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white"
                    : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
                }`}
                onClick={() => setFilter("today")}
              >
                {t.filters.today}
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "upcoming"
                    ? "bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white"
                    : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
                }`}
                onClick={() => setFilter("upcoming")}
              >
                {t.filters.upcoming}
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "specific"
                    ? "bg-gradient-to-r from-fire-red to-fire-red-dark text-white"
                    : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
                }`}
                onClick={() => setFilter("specific")}
              >
                📅 Fecha específica
              </button>
            </div>

            {/* DatePicker for specific date */}
            {filter === "specific" && (
              <div className="flex-1 min-w-[250px]">
                <DatePicker
                  value={specificDate}
                  onChange={setSpecificDate}
                  className="w-full"
                  placeholder="Selecciona una fecha"
                />
              </div>
            )}

            <select
              className="px-4 py-2 bg-charcoal-light text-ash-100 border-2 border-flame-blue/30 rounded-xl font-semibold transition-all duration-300 outline-none hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ReservationStatus | "all")
              }
            >
              <option value="all">{t.filters.all}</option>
              <option value="pending">{t.status.pending}</option>
              <option value="confirmed">{t.status.confirmed}</option>
              <option value="cancelled">{t.status.cancelled}</option>
              <option value="no_show">{t.status.noShow}</option>
              <option value="completed">{t.status.completed}</option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        {renderReservationsList()}
      </>
    );
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading font-black">
          <span className="gradient-text">{t.dashboard}</span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-fire-red to-fire-red-dark text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-fire-red/30 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Nueva Reserva</span>
          </button>
          <button
            onClick={fetchReservations}
            className="px-6 py-3 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-flame-blue-bright/30"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Reservation Toggle */}
      <div className="mb-8">
        <ReservationToggle />
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <button
          className={`px-6 py-3 rounded-xl font-heading font-bold transition-all duration-300 whitespace-nowrap ${
            activeTab === "reservations"
              ? "bg-gradient-to-r from-fire-red to-fire-red-dark text-white shadow-lg"
              : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
          }`}
          onClick={() => setActiveTab("reservations")}
        >
          📅 Reservas
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-heading font-bold transition-all duration-300 whitespace-nowrap ${
            activeTab === "capacity"
              ? "bg-gradient-to-r from-fire-red to-fire-red-dark text-white shadow-lg"
              : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
          }`}
          onClick={() => setActiveTab("capacity")}
        >
          ⚙️ Capacidades
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-heading font-bold transition-all duration-300 whitespace-nowrap ${
            activeTab === "closed"
              ? "bg-gradient-to-r from-fire-red to-fire-red-dark text-white shadow-lg"
              : "bg-charcoal-light text-ash-300 hover:bg-charcoal hover:text-ash-100"
          }`}
          onClick={() => setActiveTab("closed")}
        >
          🔒 Días Cerrados
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Manual Reservation Modal */}
      <ManualReservationModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSuccess={fetchReservations}
      />
    </div>
  );
}
