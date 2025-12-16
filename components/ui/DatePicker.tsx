"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  readonly value: string;
  readonly onChange: (date: string) => void;
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly disabledDates?: string[];
  readonly disabledDatesReasons?: Record<string, string>;
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
  disabledDatesReasons = {},
  className = "",
  error = false,
  disabled = false,
  placeholder = "Selecciona una fecha",
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [closureWarning, setClosureWarning] = React.useState<string | null>(
    null
  );

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const selectedDate = React.useMemo(() => {
    const d = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
    return isValid(d) ? d : undefined;
  }, [value]);

  const minDateObj = React.useMemo(
    () => (minDate ? parse(minDate, "yyyy-MM-dd", new Date()) : undefined),
    [minDate]
  );

  const maxDateObj = React.useMemo(
    () => (maxDate ? parse(maxDate, "yyyy-MM-dd", new Date()) : undefined),
    [maxDate]
  );

  // Calculate date range for dropdowns
  const currentYear = new Date().getFullYear();
  const startMonth = minDateObj || new Date(currentYear - 100, 0);
  const endMonth = maxDateObj || new Date(currentYear + 10, 11);

  // Only disable past/future dates, NOT closed days
  const disabledDays = React.useMemo(
    () => [
      ...(minDateObj ? [{ before: minDateObj }] : []),
      ...(maxDateObj ? [{ after: maxDateObj }] : []),
    ],
    [minDateObj, maxDateObj]
  );

  // Closed days as a modifier (so they're clickeable but styled differently)
  const closedDaysModifier = React.useMemo(
    () => disabledDates.map((d) => parse(d, "yyyy-MM-dd", new Date())),
    [disabledDates]
  );

  // Map of dates to their closure reasons
  const disabledReasonsMap = React.useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(disabledDatesReasons).forEach(([dateStr, reason]) => {
      map.set(dateStr, reason);
    });
    return map;
  }, [disabledDatesReasons]);

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      const dateStr = format(day, "yyyy-MM-dd");

      // Check if this day is closed
      const closureReason = disabledReasonsMap.get(dateStr);

      if (closureReason) {
        // Show warning for closed day
        setClosureWarning(closureReason);
        // Close the calendar so user can see the warning message clearly
        setIsOpen(false);
        return;
      }

      // Not a closed day - proceed with selection
      setClosureWarning(null);
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const updateDropdownPosition = React.useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);

      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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

  const displayValue = selectedDate
    ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : placeholder;

  return (
    <div className={`relative flex flex-col gap-3 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            // Clear warning when opening calendar
            if (!isOpen) {
              setClosureWarning(null);
            }
          }
        }}
        disabled={disabled}
        className={`
          flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left bg-charcoal-light font-body transition-all duration-300 outline-none
          ${
            error
              ? "border-fire-red text-fire-red"
              : "border-flame-blue/30 text-ash-100 hover:border-flame-blue/50 focus:border-flame-blue-bright focus:ring-2 focus:ring-flame-blue-bright/20"
          }
          ${
            disabled
              ? "cursor-not-allowed opacity-50 bg-charcoal-dark"
              : "cursor-pointer"
          }
        `}
      >
        <span
          className={selectedDate ? "font-medium" : "text-ash-400 font-normal"}
        >
          {displayValue}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 opacity-50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Closure Warning Message */}
      {closureWarning && (
        <div className="bg-gradient-to-r from-fire-red/20 to-fire-red-dark/20 border-l-4 border-fire-red px-4 py-3 rounded-lg animate-[slideDown_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <p className="font-semibold text-fire-red mb-1">Día Cerrado</p>
              <p className="text-ash-300 text-sm">{closureWarning}</p>
              <p className="text-ash-400 text-xs mt-2">
                Por favor, selecciona otra fecha disponible.
              </p>
            </div>
            <button
              onClick={() => setClosureWarning(null)}
              className="text-ash-400 hover:text-ash-100 transition-colors"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {mounted &&
        isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={containerRef}
            className="absolute z-[99999] p-4 bg-charcoal-light border-2 border-flame-blue/30 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-lg animate-[fadeInScale_0.2s_ease-out]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              disabled={disabledDays}
              locale={es}
              showOutsideDays
              fixedWeeks
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
              modifiers={{
                closed: closedDaysModifier,
              }}
              classNames={{
                root: "m-0 p-0 text-ash-100",
                caption:
                  "flex items-center justify-between w-full px-2 py-2 mb-2",
                caption_label: "hidden",
                caption_dropdowns: "flex gap-2 items-center",

                dropdown:
                  "bg-charcoal-dark text-ash-100 text-sm font-medium border border-flame-blue/30 rounded-md py-1 px-2 focus:outline-none focus:border-flame-blue-bright transition-colors cursor-pointer hover:bg-ocean-deep",
                dropdown_month: "relative inline-flex items-center",
                dropdown_year: "relative inline-flex items-center",
                dropdown_icon: "hidden",

                nav: "flex items-center gap-1",

                button_previous:
                  "w-8 h-8 rounded-lg bg-charcoal-dark/50 backdrop-blur-sm border border-flame-blue/30 text-ash-300 cursor-pointer transition-all duration-200 hover:bg-flame-blue hover:text-ash-50 hover:scale-110 flex items-center justify-center",
                button_next:
                  "w-8 h-8 rounded-lg bg-charcoal-dark/50 backdrop-blur-sm border border-flame-blue/30 text-ash-300 cursor-pointer transition-all duration-200 hover:bg-flame-blue hover:text-ash-50 hover:scale-110 flex items-center justify-center",

                month_grid: "w-full border-collapse mt-2",
                weekdays: "flex w-full justify-between mb-2",
                weekday:
                  "text-ash-400 font-semibold text-sm uppercase p-0 w-10 flex justify-center",
                week: "flex w-full justify-between mt-1",
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
              modifiersClassNames={{
                closed:
                  "!cursor-pointer !opacity-50 !line-through !bg-fire-red/10 hover:!bg-fire-red/20",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
