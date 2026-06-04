import { useState } from "react";
import { ClipboardCheck, FileText, FileCheck, Receipt, ChevronDown, X } from "lucide-react";
import styles from "./OnboardingTab.module.css";
import OfferLetterSection from "./OfferLetterSection";
import I9DocumentVerification from "./I9DocumentVerification";
import TaxFormsAndDirectDeposit from "./TaxFormsAndDirectDeposit";

export default function OnboardingTab({ candidateDetails, disabled }) {
  const candidate = candidateDetails;
  const [open, setOpen] = useState(null);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  const Accordion = ({ id, title, Icon, children }) => {
    const isOpen = open === id;

    return (
      <div className={styles.accordion}>
        <div onClick={() => toggle(id)} className={styles.trigger} data-state={isOpen ? "open" : "closed"}>
          <div className={styles.triggerLeft}>
            <Icon size={20} className="themePurple" />
            <span>{title}</span>
          </div>
          {isOpen ? (
            <button className="pdfcontrollButtonsPDF">
              <X size={16} strokeWidth={3} className="themePurple" />
            </button>
          ) : (
            <ChevronDown size={16} strokeWidth={3} className={isOpen ? "themePurple" : "text-black-50"} />
          )}
        </div>

        {isOpen && (
          <div>
            <div className={styles.inner}>{children}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <div>
        <div className="d-flex align-items-center gap-2">
          <ClipboardCheck size={20} />
          <div className="fw-semibold m-0 mt-1" style={{ fontSize: 18 }}>
            Onboarding Status
          </div>
        </div>
        <div className="text-muted">Manage candidate&apos;s onboarding process</div>
      </div>

      {candidate?.current_status && (
        <div className="mb-2 mt-3 d-flex align-items-center gap-2 justify-content-between">
          <div className="h6 fw-semibold">Overall Status:</div>
          <div
            className={`badge py-2 px-3 bg-opacity-10 rounded-5 fw-semibold font12 ${
              candidate.current_status === "Onboarding Rejected"
                ? "bg-danger text-danger"
                : candidate.current_status.toLowerCase().includes("pending")
                  ? "bg-warning text-secondary"
                  : "bg-success text-success"
            }`}
          >
            {candidate.current_status}
          </div>
        </div>
      )}

      <div className="h6 fw-semibold mb-2">Required Documents:</div>

      <div className="d-flex flex-column gap-2 mt-3">
        <Accordion id="offer" title="Offer Letter" Icon={FileText}>
          <OfferLetterSection candidate={candidate} disabled={disabled} />
        </Accordion>

        <Accordion id="i9" title="I-9 Document Verification" Icon={FileCheck}>
          <I9DocumentVerification candidate={candidate} disabled={disabled} />
        </Accordion>

        <Accordion id="tax" title="Tax Forms & Direct Deposit" Icon={Receipt}>
          <TaxFormsAndDirectDeposit candidate={candidate} disabled={disabled} />
        </Accordion>
      </div>
    </div>
  );
}
