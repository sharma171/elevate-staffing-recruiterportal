import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Check } from "lucide-react";

const PremiumSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        setHoveredValue(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!open || !ref.current || !dropdownRef.current) return;

    const triggerRect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - triggerRect.bottom - 8;
    const spaceAbove = triggerRect.top - 8;

    let openUpward = false;
    let maxHeight = spaceBelow;

    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      openUpward = true;
      maxHeight = spaceAbove;
    }

    setDropdownStyle({
      position: "absolute",
      left: 0,
      right: 0,
      zIndex: 50,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      padding: "5px",
      overflowY: "auto",
      maxHeight: Math.max(120, maxHeight) + "px",
      top: openUpward ? "auto" : "calc(100% + 6px)",
      bottom: openUpward ? "calc(100% + 6px)" : "auto",
    });
  }, [open, options.length]);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((v) => !v)}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`form-select bigHoverInput ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "40px",
          padding: "0 12px",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: disabled ? "#f3f4f6" : "#fff",
          opacity: disabled ? 0.7 : 1,
          outline: "none",
          boxShadow: focused ? "0 0 0 2px rgba(124,58,237,0.35)" : "none",
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: selected ? "#080118" : "#9ca3af",
            fontSize: "14px",
            maxWidth: "100%",
          }}
          title={selected ? selected.text : null}
        >
          {selected ? selected.text : placeholder}
        </span>
      </div>

      {open && !disabled && (
        <div ref={dropdownRef} style={dropdownStyle}>
          {options.map((opt) => {
            const isActive = String(opt.value) === String(value);
            const isHovered = hoveredValue === null ? isActive : String(opt.value) === String(hoveredValue);

            const bgColor = isHovered ? "#3c83f6" : "#fff";
            const textColor = isHovered ? "#fff" : "#111827";

            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(String(opt.value));
                  setOpen(false);
                }}
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  setHoveredValue(opt.value);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setHoveredValue(null);
                  }, 300);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  background: bgColor,
                  color: textColor,
                  gap: "5px",
                  fontWeight: 500,
                }}
              >
                <Check size={14} strokeWidth={2} style={isActive && opt.value ? {} : { color: "transparent" }} />

                <span>{opt.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PremiumSelect;
