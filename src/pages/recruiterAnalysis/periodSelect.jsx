import { useState, useRef, useEffect } from "react";

export default function PeriodSelect({ analysisPeriod, setAnalysisPeriod }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "60", label: "Last 60 Days" },
    { value: "90", label: "Last 90 Days" },
  ];

  const selected = options.find(o => o.value === analysisPeriod);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-[150px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm
                   ring-offset-background focus:outline-none focus:ring-2 focus:!ring-[#733de3] focus:ring-offset-2"
      >
        <span className="truncate">
          {selected?.label || "Select period"}
        </span>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-[#fff] shadow-md">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setAnalysisPeriod(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left font-medium text-[#080118] text-sm bg-[#fff] hover:!text-white hover:!bg-[#3c83f6] transition-colors
                ${analysisPeriod === option.value ? "bg-muted font-medium" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
