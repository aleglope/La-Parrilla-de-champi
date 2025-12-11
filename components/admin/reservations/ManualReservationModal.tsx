"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import type { DayAvailability } from "@/lib/types/reservations";
import DatePicker from "@/components/ui/DatePicker";

interface ManualReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManualReservationModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualReservationModalProps) {
  const { language } = useLanguage();
  const t = translations[language].reservations;

  // Form data
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<DayAvailability | null>(
    null
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [closedDays, setClosedDays] = useState<string[]>([]);

  // Initialize with today's date
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setReservationDate(today);
      fetchClosedDays();
    }
  }, [isOpen]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (reservationDate) {
      fetchAvailableSlots(reservationDate);
    }
  }, [reservationDate]);

  // Auto-select first available slot
  useEffect(() => {
    if (availableSlots?.timeSlots && !timeSlot) {
      const firstAvailable = availableSlots.timeSlots.find(
        (slot) => slot.available
      );
      if (firstAvailable) {
        setTimeSlot(firstAvailable.time);
      }
    }
  }, [availableSlots, timeSlot]);

  const fetchClosedDays = async () => {
    try {
      const response = await fetch(
        "/api/reservations/availability/closed-days"
      );
      if (response.ok) {
        const data = await response.json();
        setClosedDays(data.closedDays || []);
      }
    } catch (error) {
      console.error("Error fetching closed days:", error);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/reservations/availability?date=${date}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data);
      } else {
        console.error("Error fetching availability:", data.error);
      }
    } catch (error) {
      console.error("Network error fetching availability:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!guestName.trim()) {
      newErrors.guestName = t.validation.nameRequired;
    }

    if (!guestPhone.trim()) {
      newErrors.guestPhone = t.validation.phoneRequired;
    }

    if (
      guestEmail &&
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(guestEmail)
    ) {
      newErrors.guestEmail = t.validation.emailInvalid;
    }

    if (!reservationDate) {
      newErrors.reservationDate = t.validation.dateRequired;
    }

    if (!timeSlot) {
      newErrors.timeSlot = t.validation.timeRequired;
    }

    if (guestsCount < 1) {
      newErrors.guestsCount = t.validation.guestsMin;
    } else if (guestsCount > 20) {
      newErrors.guestsCount = t.validation.guestsMax;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/reservations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestName,
          guestEmail: guestEmail || "reserva@telefono.es",
          guestPhone,
          reservationDate,
          timeSlot,
          guestsCount,
          specialRequests: specialRequests || undefined,
          source: "phone",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setGuestName("");
        setGuestPhone("");
        setGuestEmail("");
        setGuestsCount(2);
        setSpecialRequests("");
        setTimeSlot("");

        // Notify parent and close
        onSuccess();
        onClose();
      } else {
        if (response.status === 409) {
          setErrors({ general: t.errors.noAvailability });
        } else {
          setErrors({ general: data.error || t.errors.serverError });
        }
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      setErrors({ general: t.errors.networkError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setGuestsCount(2);
    setSpecialRequests("");
    setTimeSlot("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card p-8 rounded-2xl max-w-2xl w-full mx-4 border-2 border-flame-blue/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading font-bold gradient-text">
            {t.admin.newManual}
          </h3>
          <button
            onClick={handleClose}
            className="text-ash-400 hover:text-ash-100 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {errors.general && (
          <div className="bg-gradient-to-r from-fire-red to-fire-red-dark text-white px-5 py-4 rounded-xl mb-6 font-medium shadow-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Guest Name */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.name} *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t.form.namePlaceholder}
                className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl transition-all duration-300 outline-none ${
                  errors.guestName
                    ? "border-fire-red"
                    : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
                }`}
              />
              {errors.guestName && (
                <span className="text-fire-red text-sm">
                  {errors.guestName}
                </span>
              )}
            </div>

            {/* Guest Phone */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.phone} *
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder={t.form.phonePlaceholder}
                className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl transition-all duration-300 outline-none ${
                  errors.guestPhone
                    ? "border-fire-red"
                    : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
                }`}
              />
              {errors.guestPhone && (
                <span className="text-fire-red text-sm">
                  {errors.guestPhone}
                </span>
              )}
            </div>

            {/* Guest Email (Optional) */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.email} <span className="text-ash-500">(opcional)</span>
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder={t.form.emailPlaceholder}
                className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl transition-all duration-300 outline-none ${
                  errors.guestEmail
                    ? "border-fire-red"
                    : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
                }`}
              />
              {errors.guestEmail && (
                <span className="text-fire-red text-sm">
                  {errors.guestEmail}
                </span>
              )}
            </div>

            {/* Number of Guests */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.guests}
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 border-flame-blue/30 rounded-xl transition-all duration-300 outline-none cursor-pointer hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>
            </div>

            {/* Reservation Date */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.date}
              </label>
              <DatePicker
                value={reservationDate}
                onChange={setReservationDate}
                minDate={new Date().toISOString().split("T")[0]}
                disabledDates={closedDays}
                error={!!errors.reservationDate}
                className="w-full"
              />
              {errors.reservationDate && (
                <span className="text-fire-red text-sm">
                  {errors.reservationDate}
                </span>
              )}
            </div>

            {/* Time Slot */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ash-200">
                {t.form.time}
              </label>
              {isLoadingSlots ? (
                <div className="px-4 py-3 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white rounded-xl text-sm text-center animate-pulse">
                  {t.availability.loading}
                </div>
              ) : !availableSlots?.isOpen ? (
                <div className="px-4 py-3 bg-gradient-to-r from-ash-500 to-ash-400 text-white rounded-xl text-sm text-center">
                  {t.availability.closed}
                </div>
              ) : availableSlots.timeSlots.length === 0 ? (
                <div className="px-4 py-3 bg-gradient-to-r from-fire-red to-fire-red-dark text-white rounded-xl text-sm text-center">
                  {t.availability.noSlots}
                </div>
              ) : (
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl transition-all duration-300 outline-none cursor-pointer ${
                    errors.timeSlot
                      ? "border-fire-red"
                      : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
                  }`}
                >
                  <option value="">{t.form.timePlaceholder}</option>
                  {availableSlots.timeSlots.map((slot) => (
                    <option
                      key={slot.time}
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time}{" "}
                      {!slot.available && `- ${t.availability.full}`}
                    </option>
                  ))}
                </select>
              )}
              {errors.timeSlot && (
                <span className="text-fire-red text-sm">{errors.timeSlot}</span>
              )}
            </div>
          </div>

          {/* Special Requests */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="font-semibold text-sm text-ash-200">
              {t.form.specialRequests}
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t.form.specialRequestsPlaceholder}
              rows={3}
              className="w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 border-flame-blue/30 rounded-xl transition-all duration-300 outline-none resize-y min-h-[80px] hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-charcoal-light text-ash-100 rounded-xl font-heading font-bold hover:bg-charcoal transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingSlots}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white rounded-xl font-heading font-bold hover:scale-105 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? t.form.submitting : "Crear Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
