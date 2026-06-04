import * as React from "react";

function Skeleton({ className, ...props }) {
  return (
    <div className={`signatureContainer animate-pulse rounded-md bg-muted ${className || ""}`.trim()} {...props} />
  );
}

export { Skeleton };
