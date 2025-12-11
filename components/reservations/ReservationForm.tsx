"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import type {
  ReservationFormData,
  ReservationFormErrors,
  DayAvailability,
} from "@/lib/types/reservations";
import BrandButton from "@/components/ui/BrandButton";
import DatePicker from "@/components/ui/DatePicker";

export default function ReservationForm() {
  const { language } = useLanguage();
  const t = translations[language].reservations;

  const [formData, setFormData] = useState<ReservationFormData>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    reservationDate: "",
    timeSlot: "",
    guestsCount: 2,
    specialRequests: "",
    consent: false,
  });

  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<DayAvailability | null>(
    null
  );
  const [success, setSuccess] = useState(false);
  const [reservationId, setReservationId] = useState<string>("");
  const [confirmedReservation, setConfirmedReservation] = useState<{
    date: string;
    time: string;
    guests: number;
  } | null>(null);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [reservationsEnabled, setReservationsEnabled] = useState<boolean>(true);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Check if reservations are globally enabled
  useEffect(() => {
    checkReservationStatus();
  }, []);

  const checkReservationStatus = async () => {
    try {
      const response = await fetch("/api/reservations/settings");
      if (response.ok) {
        const data = await response.json();
        setReservationsEnabled(data.reservationsEnabled ?? true);
      }
    } catch (error) {
      console.error("Error checking reservation status:", error);
      // On error, assume enabled to not block users
      setReservationsEnabled(true);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch closed days on mount
  useEffect(() => {
    fetchClosedDays();
  }, []);

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

  // Fetch available time slots when date changes
  useEffect(() => {
    if (formData.reservationDate) {
      fetchAvailableSlots(formData.reservationDate);
    } else {
      setAvailableSlots(null);
    }
  }, [formData.reservationDate]);

  const fetchAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/reservations/availability?date=${date}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data);
        // Reset time slot if previously selected slot is no longer available
        if (formData.timeSlot) {
          const slotStillAvailable = data.timeSlots?.some(
            (slot: any) => slot.time === formData.timeSlot && slot.available
          );
          if (!slotStillAvailable) {
            setFormData((prev) => ({ ...prev, timeSlot: "" }));
          }
        }
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
    const newErrors: ReservationFormErrors = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = t.validation.nameRequired;
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = t.validation.emailRequired;
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        formData.guestEmail
      )
    ) {
      newErrors.guestEmail = t.validation.emailInvalid;
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = t.validation.phoneRequired;
    }

    if (!formData.reservationDate) {
      newErrors.reservationDate = t.validation.dateRequired;
    } else {
      // Check if selected date is closed
      if (closedDays.includes(formData.reservationDate)) {
        newErrors.reservationDate =
          "El restaurante está cerrado en esta fecha. Por favor selecciona otro día.";
      }
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = t.validation.timeRequired;
    }

    if (!formData.guestsCount || formData.guestsCount < 1) {
      newErrors.guestsCount = t.validation.guestsMin;
    } else if (formData.guestsCount > 20) {
      newErrors.guestsCount = t.validation.guestsMax;
    }

    if (!formData.consent) {
      newErrors.consent = t.validation.consentRequired;
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
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          reservationDate: formData.reservationDate,
          timeSlot: formData.timeSlot,
          guestsCount: formData.guestsCount,
          specialRequests: formData.specialRequests || undefined,
          source: "web",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save reservation details for confirmation screen
        setConfirmedReservation({
          date: formData.reservationDate,
          time: formData.timeSlot,
          guests: formData.guestsCount,
        });
        setSuccess(true);
        setReservationId(data.reservation.id);
        // Reset form
        setFormData({
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          reservationDate: "",
          timeSlot: "",
          guestsCount: 2,
          specialRequests: "",
          consent: false,
        });
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = e.target.type;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "guestsCount"
          ? parseInt(value) || 0
          : value,
    }));
    // Clear error for this field
    if (errors[name as keyof ReservationFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ReservationFormErrors];
        return newErrors;
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (checkingStatus) {
    return (
      <div className="glass-card max-w-3xl mx-auto p-12 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-flame-blue to-flame-blue-bright rounded-full" />
          <p className="text-ash-300 font-body">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!reservationsEnabled) {
    return (
      <div className="glass-card max-w-3xl mx-auto p-12 text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-fire-red to-fire-red-dark rounded-full flex items-center justify-center text-5xl text-white shadow-lg">
          🔒
        </div>

        {/* Title */}
        <h2 className="text-3xl font-heading font-black mb-4">
          <span className="gradient-text">{t.closed.title}</span>
        </h2>

        {/* Message */}
        <p className="text-ash-300 text-lg mb-8 leading-relaxed font-body max-w-lg mx-auto">
          {t.closed.message}
        </p>

        {/* Back Button */}
        <BrandButton onClick={() => (window.location.href = "/")}>
          Volver al Inicio
        </BrandButton>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card max-w-2xl mx-auto p-12 text-center animate-[scaleIn_0.5s_cubic-bezier(0.4,0,0.2,1)]">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-flame-blue-bright to-flame-blue rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-lg shadow-flame-blue-bright/40 animate-[checkmark_0.6s_ease-in-out_0.2s_both]">
          ✓
        </div>

        {/* Title */}
        <h2 className="text-4xl font-heading font-extrabold mb-3">
          <span className="gradient-text">{t.confirmation.title}</span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-ash-400 mb-8 font-body">
          {t.confirmation.subtitle}
        </p>

        {/* Reservation Details */}
        <div className="glass-card bg-charcoal-light/40 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-flame-blue/20">
          <div className="flex justify-between items-center py-3 border-b border-ash-500/20">
            <span className="font-semibold text-ash-400 font-body">
              {t.confirmation.number}:
            </span>
            <span className="font-bold text-ash-100 font-heading tracking-wider">
              {reservationId.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-ash-500/20">
            <span className="font-semibold text-ash-400 font-body">
              {t.confirmation.date}:
            </span>
            <span className="font-bold text-ash-100 font-heading">
              {confirmedReservation?.date || ""}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-ash-500/20">
            <span className="font-semibold text-ash-400 font-body">
              {t.confirmation.time}:
            </span>
            <span className="font-bold text-ash-100 font-heading">
              {confirmedReservation?.time || ""}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="font-semibold text-ash-400 font-body">
              {t.confirmation.guests}:
            </span>
            <span className="font-bold text-ash-100 font-heading">
              {confirmedReservation?.guests || 0}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-ash-400 mb-8 leading-relaxed font-body">
          {t.confirmation.instructions}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BrandButton
            onClick={() => (window.location.href = "/")}
            withGlow={false}
            className="flex-1 sm:flex-initial"
          >
            {t.confirmation.backHome}
          </BrandButton>

          <BrandButton
            onClick={() => setSuccess(false)}
            className="flex-1 sm:flex-initial"
          >
            {t.confirmation.newReservation}
          </BrandButton>
        </div>
      </div>
    );
  }

  return (
    <form
      className="glass-card max-w-3xl mx-auto p-8 rounded-2xl"
      onSubmit={handleSubmit}
    >
      {/* Error Banner */}
      {errors.general && (
        <div className="bg-gradient-to-r from-fire-red to-fire-red-dark text-white px-5 py-4 rounded-xl mb-6 font-medium shadow-lg shadow-fire-red/30 animate-[slideDown_0.3s_ease-out]">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Guest Name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="guestName"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.name}
          </label>
          <input
            type="text"
            id="guestName"
            name="guestName"
            value={formData.guestName}
            onChange={handleInputChange}
            placeholder={t.form.namePlaceholder}
            className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none ${
              errors.guestName
                ? "border-fire-red"
                : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
            }`}
          />
          {errors.guestName && (
            <span className="text-fire-red text-sm font-medium">
              {errors.guestName}
            </span>
          )}
        </div>

        {/* Guest Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="guestEmail"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.email}
          </label>
          <input
            type="email"
            id="guestEmail"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleInputChange}
            placeholder={t.form.emailPlaceholder}
            className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none ${
              errors.guestEmail
                ? "border-fire-red"
                : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
            }`}
          />
          {errors.guestEmail && (
            <span className="text-fire-red text-sm font-medium">
              {errors.guestEmail}
            </span>
          )}
        </div>

        {/* Guest Phone */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="guestPhone"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.phone}
          </label>
          <input
            type="tel"
            id="guestPhone"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleInputChange}
            placeholder={t.form.phonePlaceholder}
            className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none ${
              errors.guestPhone
                ? "border-fire-red"
                : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
            }`}
          />
          {errors.guestPhone && (
            <span className="text-fire-red text-sm font-medium">
              {errors.guestPhone}
            </span>
          )}
        </div>

        {/* Number of Guests */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="guestsCount"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.guests}
          </label>
          <select
            id="guestsCount"
            name="guestsCount"
            value={formData.guestsCount}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'12\\' height=\\'12\\' viewBox=\\'0 0 12 12\\'%3E%3Cpath fill=\\'%23B8B3AB\\' d=\\'M6 9L1 4h10z\\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 ${
              errors.guestsCount
                ? "border-fire-red"
                : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
            }`}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "persona" : "personas"}
              </option>
            ))}
          </select>
          {errors.guestsCount && (
            <span className="text-fire-red text-sm font-medium">
              {errors.guestsCount}
            </span>
          )}
        </div>

        {/* Reservation Date */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="reservationDate"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.date}
          </label>
          <DatePicker
            value={formData.reservationDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, reservationDate: date }))
            }
            minDate={today}
            disabledDates={closedDays}
            error={!!errors.reservationDate}
            className="w-full"
            placeholder={t.form.datePlaceholder}
          />
          {errors.reservationDate && (
            <span className="text-fire-red text-sm font-medium">
              {errors.reservationDate}
            </span>
          )}
        </div>

        {/* Time Slot */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="timeSlot"
            className="font-semibold text-sm text-ash-200 font-body tracking-wide"
          >
            {t.form.time}
          </label>
          {isLoadingSlots ? (
            <div className="px-4 py-3 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white rounded-xl text-sm font-medium text-center animate-pulse">
              {t.availability.loading}
            </div>
          ) : !formData.reservationDate ? (
            <select
              className="w-full px-4 py-3 bg-charcoal-light/50 text-ash-400 border-2 border-flame-blue/20 rounded-xl font-body cursor-not-allowed"
              disabled
            >
              <option>{t.form.datePlaceholder}</option>
            </select>
          ) : !availableSlots?.isOpen ? (
            <div className="px-4 py-3 bg-gradient-to-r from-ash-500 to-ash-400 text-white rounded-xl text-sm font-medium text-center">
              {t.availability.closed}
            </div>
          ) : availableSlots.timeSlots.length === 0 ? (
            <div className="px-4 py-3 bg-gradient-to-r from-fire-red to-fire-red-dark text-white rounded-xl text-sm font-medium text-center">
              {t.availability.noSlots}
            </div>
          ) : (
            <select
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'12\\' height=\\'12\\' viewBox=\\'0 0 12 12\\'%3E%3Cpath fill=\\'%23B8B3AB\\' d=\\'M6 9L1 4h10z\\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 ${
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
                  {slot.time} {!slot.available && `- ${t.availability.full}`}
                </option>
              ))}
            </select>
          )}
          {errors.timeSlot && (
            <span className="text-fire-red text-sm font-medium">
              {errors.timeSlot}
            </span>
          )}
        </div>
      </div>

      {/* Special Requests */}
      <div className="flex flex-col gap-2 mb-6">
        <label
          htmlFor="specialRequests"
          className="font-semibold text-sm text-ash-200 font-body tracking-wide"
        >
          {t.form.specialRequests}
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          placeholder={t.form.specialRequestsPlaceholder}
          rows={3}
          className="w-full px-4 py-3 bg-charcoal-light text-ash-100 border-2 border-flame-blue/30 rounded-xl font-body transition-all duration-300 outline-none resize-y min-h-[80px] hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleInputChange}
            className="mt-1 w-5 h-5 rounded border-2 border-flame-blue/30 bg-charcoal-light text-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20 cursor-pointer transition-all"
          />
          <span className="text-ash-300 font-body leading-relaxed">
            {t.form.consentLabel}
            <a
              href="/politica-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-blue-bright hover:text-flame-blue-glow underline ml-1 transition-colors"
            >
              {t.form.consentLink}
            </a>
          </span>
        </label>
        {errors.consent && (
          <span className="text-fire-red text-sm font-medium ml-8">
            {errors.consent}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <BrandButton
        type="submit"
        disabled={isSubmitting || isLoadingSlots}
        className="w-full"
        withGlow={false}
      >
        {isSubmitting ? t.form.submitting : t.form.submit}
      </BrandButton>
    </form>
  );
}
