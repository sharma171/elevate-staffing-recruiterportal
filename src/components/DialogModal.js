import { useEffect, useRef } from "react";
import styles from "./css/DialogModal.module.css";
import { X } from "lucide-react";

export default function MidScreenModal({ isOpen, onClose, title, children, description }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = dialogRef.current?.querySelector("button, input, a, textarea, select");
    first?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll(
            'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(Boolean);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className={styles.overlay}
        // onMouseDown={(e) => {
        //   if (e.target === overlayRef.current) onClose?.();
        // }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={styles.dialog}
        ref={dialogRef}
      >
        <div className={styles.inner}>
          {title ? (
            <header className={styles.header}>
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
              <button title="Close" className={styles.close} aria-label="Close" onClick={onClose}>
                <X />
              </button>
            </header>
          ) : (
            <button className={styles.closeNoTitle} aria-label="Close" onClick={onClose}>
              <X />
            </button>
          )}
          {description ? <div>{description}</div> : <></>}

          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </>
  );
}
