import React, { useState, useLayoutEffect, useRef, useEffect } from "react";

export default function Truncate({ text, className, style, ...rest }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("");

  const updateTruncate = () => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement;

    if (!parent) {
      return <></>;
    }

    const parentWidth = parent?.clientWidth * 0.95;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const computedStyle = getComputedStyle(el);
    ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    if (ctx.measureText(text).width <= parentWidth) {
      setDisplay(text);
      return;
    }

    let lo = 0;
    let hi = text.length;
    let mid;

    while (lo < hi) {
      mid = Math.ceil((lo + hi) / 2);
      const candidate = text.slice(0, mid) + "…";
      if (ctx.measureText(candidate).width <= parentWidth) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }

    setDisplay(text.slice(0, lo) + "…");
  };

  useLayoutEffect(() => {
    updateTruncate();
  }, [text]);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(updateTruncate);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
        verticalAlign: "top",
        maxWidth: "98%",
        minWidth: "120px",
        visibility: display ? "visible" : "hidden",
        ...style,
      }}
      title={text}
      {...rest}
    >
      {display}
    </div>
  );
}
