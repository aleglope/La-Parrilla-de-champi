"use client";

import { useState } from "react";
import BrandButton from "@/components/ui/BrandButton";
import DatePicker from "@/components/ui/DatePicker";

interface ClosedDay {
  id?: string;
  date: string;
  notes: string;
}

export default function ClosedDaysManager() {
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addClosedDay = async () => {
    if (!newDate) {
      alert("Por favor selecciona una fecha");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          isOpen: false,
          notes: newNotes || "Cerrado",
        }),
      });

      if (response.ok) {
        setClosedDays([
          ...closedDays,
          { date: newDate, notes: newNotes || "Cerrado" },
        ]);
        setNewDate("");
        setNewNotes("");
        alert("✅ Día marcado como cerrado");
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const removeClosedDay = async (date: string) => {
    if (!confirm(`¿Eliminar cierre del ${formatDate(date)}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/availability?date=${date}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClosedDays(closedDays.filter((d) => d.date !== date));
        alert("✅ Día reabierto");
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-heading font-black mb-4">
          <span className="gradient-text">🔒 Días Cerrados</span>
        </h2>
        <p className="text-lg text-ash-400 font-body max-w-2xl mx-auto">
          Marca los días en que el restaurante estará cerrado y no aceptará
          reservas
        </p>
      </div>

      {/* Add New Closed Day */}
      <div className="glass-card p-8 rounded-2xl mb-12 max-w-3xl mx-auto">
        <h3 className="text-2xl font-heading font-bold text-ash-100 mb-6">
          Cerrar un día
        </h3>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-ash-200 font-body tracking-wide">
              Fecha:
            </label>
            <DatePicker
              value={newDate}
              onChange={setNewDate}
              minDate={today}
              disabled={loading}
              className="w-full"
              placeholder="Selecciona una fecha"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-ash-200 font-body tracking-wide">
              Motivo (opcional):
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Ej: Vacaciones, Evento privado, Mantenimiento..."
              disabled={loading}
              className="w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 border-flame-blue/30 rounded-xl font-body transition-all duration-300 outline-none hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20 disabled:bg-charcoal-dark disabled:cursor-not-allowed"
            />
          </div>

          <BrandButton
            onClick={addClosedDay}
            disabled={loading || !newDate}
            className="w-full"
          >
            {loading ? "Guardando..." : "🔒 Marcar como Cerrado"}
          </BrandButton>
        </div>
      </div>

      {/* List of Closed Days */}
      <div className="mb-12">
        <h3 className="text-3xl font-heading font-bold text-ash-100 mb-6 pb-3 border-b-4 border-fire-red inline-block">
          Días cerrados programados
        </h3>

        {closedDays.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <p className="text-2xl font-heading text-ash-200 mb-2">
              🎉 No hay días cerrados programados
            </p>
            <p className="text-ash-400 font-body">
              El restaurante está abierto todos los días según el horario
              habitual
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closedDays
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((day) => (
                <div
                  key={day.date}
                  className="glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-6 rounded-2xl border-2 border-fire-red/30 hover:border-fire-red hover:shadow-lg hover:shadow-fire-red/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl">🔒</span>
                    <span className="flex-1 text-lg font-heading font-bold text-ash-100 leading-tight">
                      {formatDate(day.date)}
                    </span>
                  </div>

                  {day.notes && (
                    <p className="text-ash-300 font-body mb-4 pl-11">
                      {day.notes}
                    </p>
                  )}

                  <button
                    onClick={() => removeClosedDay(day.date)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold text-sm hover:from-orange-500 hover:to-orange-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    ✕ Reabrir día
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="glass-card bg-gradient-to-r from-flame-blue/10 to-flame-blue-bright/10 border-l-4 border-flame-blue-bright px-6 py-5 rounded-xl">
        <strong className="text-flame-blue-bright font-heading">
          💡 Información:
        </strong>
        <span className="text-ash-300 font-body ml-2">
          Los días marcados como cerrados no aparecerán disponibles en el
          formulario de reservas. Los clientes no podrán seleccionar estas
          fechas.
        </span>
      </div>
    </div>
  );
}
