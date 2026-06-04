import * as React from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export function ResponsiveTable({ children, className, minWidth = "600px", showScrollHint = true }) {
  const { isMobile } = useBreakpoint();
  const scrollRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  return (
    <div className={`signatureContainer relative ${className || ""}`.trim()}>
      {/* Left scroll indicator */}
      {showScrollHint && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Right scroll indicator */}
      {showScrollHint && canScrollRight && isMobile && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}

      <div ref={scrollRef} className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}

export function ResponsiveTableCardView({ data, renderCard, renderTable, className }) {
  const { isMobile } = useBreakpoint();

  if (isMobile && data.length > 0) {
    return (
      <div className={`signatureContainer space-y-3 ${className || ""}`.trim()}>
        {data.map((item, index) => renderCard(item, index))}
      </div>
    );
  }

  return <>{renderTable()}</>;
}
