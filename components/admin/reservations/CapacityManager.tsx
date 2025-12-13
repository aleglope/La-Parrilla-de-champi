"use client";

import { useState, useEffect } from "react";

interface TimeSlot {
  id: string;
  time: string;
  maxCapacity: number;
  isActive: boolean;
}

export default function CapacityManager() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/time-slots");
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.timeSlots || []);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlot = async (id: string, updates: Partial<TimeSlot>) => {
    setSaving(id);
    try {
      const response = await fetch(`/api/admin/time-slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchTimeSlots();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error("Error updating time slot:", error);
      alert("Error de red");
    } finally {
      setSaving(null);
    }
  };

  const handleCapacityChange = (id: string, value: string) => {
    const capacity = Number.parseInt(value);
    if (!Number.isNaN(capacity) && capacity > 0 && capacity <= 200) {
      updateTimeSlot(id, { maxCapacity: capacity });
    }
  };

  const toggleActive = (id: string, currentState: boolean) => {
    updateTimeSlot(id, { isActive: !currentState });
  };

  if (loading) {
    return (
      <div className="text-center py-16 px-8 font-body text-xl text-ash-400">
        Cargando franjas horarias...
      </div>
    );
  }

  const lunchSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0]);
    return hour >= 12 && hour < 17;
  });

  const dinnerSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0]);
    return hour >= 19;
  });

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-heading font-black mb-4">
          <span className="gradient-text">⚙️ Configuración de Capacidades</span>
        </h2>
        <p className="text-lg text-ash-400 font-body max-w-2xl mx-auto">
          Ajusta la capacidad máxima de comensales para cada franja horaria
        </p>
      </div>

      {/* Lunch Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-heading font-bold text-ash-100 mb-6 pb-3 border-b-4 border-fire-red inline-block">
          🍴 Comidas (12:00 - 17:00)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lunchSlots.map((slot) => (
            <div
              key={slot.id}
              className={`glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                slot.isActive
                  ? "border-flame-blue/30 hover:border-flame-blue-bright hover:shadow-flame-blue-bright/20"
                  : "opacity-60 bg-gradient-to-br from-ash-500 to-ash-400"
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-3xl font-bold text-fire-red font-heading tracking-wider">
                  {slot.time}
                </span>
                <button
                  onClick={() => toggleActive(slot.id, slot.isActive)}
                  disabled={saving === slot.id}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    slot.isActive
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/40"
                      : "bg-gradient-to-r from-ash-500 to-ash-400 text-white hover:scale-105 hover:shadow-lg hover:shadow-ash-500/40"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {slot.isActive ? "✓ Activo" : "✕ Inactivo"}
                </button>
              </div>

              {/* Capacity Control */}
              <div className="flex flex-col gap-3">
                <label
                  htmlFor={`capacity-lunch-${slot.id}`}
                  className="text-xs font-semibold text-ash-300 uppercase tracking-wider font-body"
                >
                  Capacidad máxima:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`capacity-lunch-${slot.id}`}
                    type="number"
                    min="1"
                    max="200"
                    value={slot.maxCapacity}
                    onChange={(e) =>
                      handleCapacityChange(slot.id, e.target.value)
                    }
                    disabled={saving === slot.id || !slot.isActive}
                    className="flex-1 px-4 py-3 bg-charcoal border-2 border-flame-blue/30 rounded-xl text-lg font-bold text-ash-100 text-center transition-all duration-300 outline-none hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20 disabled:bg-charcoal-dark disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-ash-400 font-semibold whitespace-nowrap font-body">
                    comensales
                  </span>
                </div>
              </div>

              {/* Saving Indicator */}
              {saving === slot.id && (
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white text-center rounded-lg text-sm font-semibold animate-pulse">
                  Guardando...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dinner Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-heading font-bold text-ash-100 mb-6 pb-3 border-b-4 border-fire-red inline-block">
          🌙 Cenas (19:00 - 23:30)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dinnerSlots.map((slot) => (
            <div
              key={slot.id}
              className={`glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                slot.isActive
                  ? "border-flame-blue/30 hover:border-flame-blue-bright hover:shadow-flame-blue-bright/20"
                  : "opacity-60 bg-gradient-to-br from-ash-500 to-ash-400"
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-3xl font-bold text-fire-red font-heading tracking-wider">
                  {slot.time}
                </span>
                <button
                  onClick={() => toggleActive(slot.id, slot.isActive)}
                  disabled={saving === slot.id}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    slot.isActive
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/40"
                      : "bg-gradient-to-r from-ash-500 to-ash-400 text-white hover:scale-105 hover:shadow-lg hover:shadow-ash-500/40"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {slot.isActive ? "✓ Activo" : "✕ Inactivo"}
                </button>
              </div>

              {/* Capacity Control */}
              <div className="flex flex-col gap-3">
                <label
                  htmlFor={`capacity-dinner-${slot.id}`}
                  className="text-xs font-semibold text-ash-300 uppercase tracking-wider font-body"
                >
                  Capacidad máxima:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`capacity-dinner-${slot.id}`}
                    type="number"
                    min="1"
                    max="200"
                    value={slot.maxCapacity}
                    onChange={(e) =>
                      handleCapacityChange(slot.id, e.target.value)
                    }
                    disabled={saving === slot.id || !slot.isActive}
                    className="flex-1 px-4 py-3 bg-charcoal border-2 border-flame-blue/30 rounded-xl text-lg font-bold text-ash-100 text-center transition-all duration-300 outline-none hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20 disabled:bg-charcoal-dark disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-ash-400 font-semibold whitespace-nowrap font-body">
                    comensales
                  </span>
                </div>
              </div>

              {/* Saving Indicator */}
              {saving === slot.id && (
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white text-center rounded-lg text-sm font-semibold animate-pulse">
                  Guardando...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="glass-card bg-gradient-to-r from-flame-blue/10 to-flame-blue-bright/10 border-l-4 border-flame-blue-bright px-6 py-5 rounded-xl">
        <strong className="text-flame-blue-bright font-heading">
          💡 Nota:
        </strong>
        <span className="text-ash-300 font-body ml-2">
          Los cambios se aplican inmediatamente. Las franjas inactivas no
          aparecerán como opción para nuevas reservas.
        </span>
      </div>
    </div>
  );
}
