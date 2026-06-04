// VendorDetailsSheet.jsx
import React from "react";

export default function VendorDetailsSheet({ selectedRecord, onOpenChange }) {
  const selectedVendor = selectedRecord || {};

  const isActive = !!selectedVendor.is_active;
  const open = selectedRecord;

  return (
    <>
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 1040 }}
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-labelledby="vendor-sheet-title"
        aria-describedby="vendor-sheet-desc"
        className="position-fixed top-0 end-0 h-100 bg-body border-start shadow p-4 overflow-auto"
        style={{
          width: "100%",
          maxWidth: "672px",
          zIndex: 1050,
          transition: "transform 0.5s ease-in-out",
          transform: open ? "translateX(0)" : "translateX(100%)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <button
          type="button"
          className="btn btn-light position-absolute top-0 end-0 m-3 d-inline-flex align-items-center justify-content-center p-2"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>

        <div className="d-flex flex-column gap-2 text-center text-sm-start">
          <h2 id="vendor-sheet-title" className="fs-5 fw-semibold text-body">
            {selectedVendor.company_name || "—"}
          </h2>
          <p id="vendor-sheet-desc" className="text-muted small mb-0">
            Vendor Details
          </p>
        </div>

        <div className="mt-4 d-flex flex-column gap-4">
          <div>
            <h3 className="fw-semibold mb-3 fs-6">Contact Information</h3>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Contact Person:</span>
                <span>{selectedVendor.contact_person || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Email:</span>
                <span>{selectedVendor.primary_email || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phone:</span>
                <span>{selectedVendor.phone || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Address:</span>
                <span>{selectedVendor.billing_address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="fw-semibold mb-3 fs-6">Payment Information</h3>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Terms:</span>
                <span>{selectedVendor.payment_terms || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Method:</span>
                <span>{selectedVendor.preferred_payment_method || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Status:</span>

                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: isActive ? "#115434ff" : "#842029",
                    backgroundColor: isActive ? "#dbfeeeff" : "#f8d7da",
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
