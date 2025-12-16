"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  readonly value: string; // YYYY-MM-DD
  readonly onChange: (date: string) => void;
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly disabledDates?: string[];
  readonly className?: string;
  readonly error?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly id?: string;
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  className = "",
  error = false,
  disabled = false,
  placeholder = "Selecciona una fecha",
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse value to Date or undefined
  const selectedDate = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;

  // Parse min and max dates
  const minDateObj = minDate
    ? parse(minDate, "yyyy-MM-dd", new Date())
    : undefined;
  const maxDateObj = maxDate
    ? parse(maxDate, "yyyy-MM-dd", new Date())
    : undefined;

  // Parse disabled dates
  const disabledDatesObjs = disabledDates.map((dateStr) =>
    parse(dateStr, "yyyy-MM-dd", new Date())
  );

  // Matcher for disabled days
  const disabledDays = [
    ...(minDateObj ? [{ before: minDateObj }] : []),
    ...(maxDateObj ? [{ after: maxDateObj }] : []),
    ...disabledDatesObjs,
  ];

  // Handle day selection
  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      const formattedDate = format(day, "yyyy-MM-dd");
      onChange(formattedDate);
      setIsOpen(false);
    }
  };

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  // Update position when opening or on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();

      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      // Capture phase to catch all scrolls
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Format display value
  const displayValue = selectedDate
    ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        id={id}
        className={`w-full flex items-center justify-between px-4 py-3 bg-charcoal-light text-ash-100 border-2 rounded-xl font-body transition-all duration-300 outline-none
          ${
            error
              ? "border-fire-red"
              : "border-flame-blue/30 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
          }
          ${
            disabled
              ? "bg-charcoal-dark cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }
        `}
      >
        <span
          className={selectedDate ? "text-ash-100 font-medium" : "text-ash-400"}
        >
          {displayValue}
        </span>
        <svg
          className="w-5 h-5 flex-shrink-0 text-flame-blue-bright transition-transform duration-200 hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="6"
            width="18"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M3 10h18M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Calendar Dropdown - Rendered as Portal with absolute positioning */}
      {mounted &&
        isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={containerRef}
            className="absolute bg-charcoal-light border-2 border-flame-blue/30 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-lg animate-[fadeInScale_0.2s_ease-out]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              disabled={disabledDays}
              locale={es}
              showOutsideDays
              fixedWeeks
              classNames={{
                root: "m-0 p-0 text-ash-100",
                caption: "flex justify-center items-center mb-4 relative p-2",
                caption_label:
                  "text-lg font-bold bg-gradient-to-r from-fire-red via-flame-blue-bright to-fire-red bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift",
                nav: "space-x-1 flex items-center",
                button_previous:
                  "absolute left-2 w-8 h-8 rounded-lg bg-transparent border-none text-ash-300 cursor-pointer transition-all duration-200 hover:bg-flame-blue hover:text-ash-50 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center",
                button_next:
                  "absolute right-2 w-8 h-8 rounded-lg bg-transparent border-none text-ash-300 cursor-pointer transition-all duration-200 hover:bg-flame-blue hover:text-ash-50 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday:
                  "text-ash-400 font-semibold text-sm uppercase py-2 w-10 flex justify-center",
                week: "flex w-full mt-2",
                day: "p-[2px] text-center text-sm relative focus-within:relative focus-within:z-20",
                day_button:
                  "w-10 h-10 p-0 font-medium aria-selected:opacity-100 hover:bg-flame-blue-bright/20 hover:text-ash-100 hover:border-flame-blue-bright hover:scale-105 transition-all duration-200 rounded-lg flex items-center justify-center border-2 border-transparent text-ash-300",
                today: "font-bold text-flame-blue-bright",
                selected:
                  "bg-gradient-to-br from-flame-blue-bright to-flame-blue text-white font-bold border-flame-blue-glow shadow-lg shadow-flame-blue-bright/40 hover:from-flame-blue-glow hover:to-flame-blue-bright hover:scale-105",
                outside: "opacity-50 text-ash-500",
                disabled:
                  "text-ash-500 opacity-40 cursor-not-allowed line-through bg-ash-500/10 hover:bg-ash-500/10 hover:transform-none hover:border-transparent",
                hidden: "invisible",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
