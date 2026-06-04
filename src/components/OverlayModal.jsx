import { useEffect, useRef } from "react";
import "../assets/styles/OverlayModal.css";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

function OverlayModal({ children, isActive, onClose, style = {}, modalStyle = {} }) {
  const modalRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const allModals = Array.from(document.querySelectorAll("[class*='containerVisible_']"));

    const numbers = allModals
      .map((el) => {
        const match = el.className.match(/containerVisible_(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(Boolean);

    const nextNum = numbers.length ? Math.max(...numbers) + 1 : 1;
    numRef.current = nextNum;
    if (modalRef.current) {
      modalRef.current.classList.add(`containerVisible_${nextNum}`);
    }

    updateVisibility();
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (numRef.current) {
        const closingNum = numRef.current;
        const allModals = Array.from(document.querySelectorAll("[class*='containerVisible_']"));

        const numbers = allModals
          .map((el) => {
            const match = el.className.match(/containerVisible_(\d+)/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter(Boolean);

        if (numbers.length) {
          const maxNum = Math.max(...numbers);
          updateVisibility(maxNum);
        }
      }
    };
  }, []);

  const updateVisibility = (maxOverride) => {
    const allModals = Array.from(document.querySelectorAll("[class*='containerVisible_']"));
    const numbers = allModals
      .map((el) => {
        const match = el.className.match(/containerVisible_(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(Boolean);

    if (!numbers.length) return;
    const maxNum = maxOverride || Math.max(...numbers);

    allModals.forEach((el) => {
      const match = el.className.match(/containerVisible_(\d+)/);
      if (!match) return;
      const num = parseInt(match[1], 10);
      el.style.opacity = num === maxNum ? "1" : "0";
    });
  };

  if (!isActive) {
    return <></>;
  }

  return ReactDOM.createPortal(
    <div ref={modalRef} className={`overlay-container ${isActive ? "visible" : ""}`}>
      {isActive && <div className="overlay"></div>}
      <div className="panel open" style={style}>
        <button
          style={{ zIndex: "99999" }}
          type="button"
          className="btn-close modalclosebtn"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <X size={34} style={{ marginTop: "3px" }} strokeWidth={2.4} />
        </button>
        <div className="pannelinner" style={modalStyle}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OverlayModal;
