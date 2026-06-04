import * as React from "react";

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export function ResponsiveGrid({ children, className, cols = { default: 1, sm: 2, lg: 3, xl: 4 }, gap = "md" }) {
  const gridClasses = [
    "signatureContainer grid",
    gapClasses[gap],
    cols.default && colClasses[cols.default],
    cols.sm && `sm:${colClasses[cols.sm]}`,
    cols.md && `md:${colClasses[cols.md]}`,
    cols.lg && `lg:${colClasses[cols.lg]}`,
    cols.xl && `xl:${colClasses[cols.xl]}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={gridClasses}>{children}</div>;
}

// Preset grid configurations
export function MetricsGrid({ children, className }) {
  return (
    <div
      className={`signatureContainer grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`.trim()}
    >
      {children}
    </div>
  );
}

export function CardsGrid({ children, className }) {
  return (
    <div
      className={`signatureContainer grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ""}`.trim()}
    >
      {children}
    </div>
  );
}

export function TwoColumnGrid({ children, className }) {
  return (
    <div className={`signatureContainer grid grid-cols-1 lg:grid-cols-2 gap-4 ${className || ""}`.trim()}>
      {children}
    </div>
  );
}
