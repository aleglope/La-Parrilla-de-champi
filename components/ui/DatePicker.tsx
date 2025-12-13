"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  className?: string;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
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
            <style jsx global>{`
              /* DayPicker Tailwind overrides */
              .rdp {
                --rdp-cell-size: 40px;
                margin: 0;
                color: #ebe8e3;
              }

              .rdp-caption {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 1rem;
              }

              .rdp-caption_label {
                font-size: 1.125rem;
                font-weight: 700;
                background: linear-gradient(
                  to right,
                  #c01f19,
                  #1789c0,
                  #c01f19
                );
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: gradient-shift 4s ease infinite;
              }

              @keyframes gradient-shift {
                0%,
                100% {
                  background-position: 0% center;
                }
                50% {
                  background-position: 100% center;
                }
              }

              .rdp-nav_button {
                width: 32px;
                height: 32px;
                border-radius: 0.5rem;
                background: transparent;
                border: none;
                color: #b8b3ab;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .rdp-nav_button:hover:not(:disabled) {
                background: #314a78;
                color: #f5f3f0;
                transform: scale(1.1);
              }

              .rdp-nav_button:disabled {
                opacity: 0.3;
                cursor: not-allowed;
              }

              .rdp-head_cell {
                color: #9a948b;
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                padding: 0.5rem 0;
              }

              .rdp-cell {
                padding: 2px;
              }

              .rdp-button {
                width: 100%;
                height: 100%;
                border-radius: 0.5rem;
                border: 2px solid transparent;
                background: transparent;
                color: #b8b3ab;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .rdp-button:hover:not(.rdp-day_disabled):not(.day-selected) {
                background: rgba(23, 137, 192, 0.2);
                color: #ebe8e3;
                border-color: #1789c0;
                transform: scale(1.05);
              }

              .rdp-day_today:not(.day-selected) {
                font-weight: 700;
                color: #1789c0;
              }

              .day-selected {
                background: linear-gradient(
                  135deg,
                  #1789c0,
                  #314a78
                ) !important;
                color: white !important;
                font-weight: 700;
                border-color: #2699d0;
                box-shadow: 0 4px 12px rgba(23, 137, 192, 0.4);
              }

              .day-selected:hover {
                background: linear-gradient(
                  135deg,
                  #2699d0,
                  #1789c0
                ) !important;
                transform: scale(1.05);
              }

              .day-disabled {
                color: #7c766d !important;
                opacity: 0.4;
                cursor: not-allowed !important;
                text-decoration: line-through;
                background: rgba(124, 118, 109, 0.1) !important;
              }

              .day-disabled:hover {
                background: rgba(124, 118, 109, 0.1) !important;
                transform: none !important;
                border-color: transparent !important;
              }

              .rdp-day_outside {
                opacity: 0.5;
              }
            `}</style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              disabled={disabledDays}
              locale={es}
              showOutsideDays
              fixedWeeks
              modifiersClassNames={{
                selected: "day-selected",
                disabled: "day-disabled",
                today: "day-today",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
