import React, { useEffect, useState } from "react";
import { Loader2, Search, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi } from "../../components";
import styles from "./InvoiceDetails.module.css";
import { useAuth } from "../../authContext";

const EMPLOYEE_LINK_API = "https://link-employee-to-expenses-v3-305451280005.us-east1.run.app";

export default function LinkEmployeeModal({ isOpen, onClose, invoiceId, onSuccess }) {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setEmployees([]);
      setSelected(null);
      setSearching(false);
      setNotes("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setEmployees([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const payload = {
          action: "search_employees",
          search_query: query,
          limit: 50,
          user_email: user_email,
        };
        const res = await axiosApi.post(EMPLOYEE_LINK_API, payload);
        const d = res?.data || {};
        if (d.status === "success" || d.success) setEmployees(d.employees || []);
        else setEmployees([]);
      } catch {
        setEmployees([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (!isOpen) return null;

  const doLink = async () => {
    if (!selected) return toast.error("Select an employee");
    setSubmitting(true);
    try {
      const payload = {
        action: "link",
        invoice_id: invoiceId,
        employee_email: selected.email,
        user_email: user_email,
        notes: notes,
      };
      const res = await axiosApi.post(EMPLOYEE_LINK_API, payload);
      const d = res?.data || {};

      if (d.status === "success" || d.success) {
        toast.success(d.message || `Linked to ${selected.full_name}`);
        onSuccess && onSuccess();
      } else {
        toast.error(d.error || "Link failed");
      }
    } catch {
      toast.error("Link failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className="d-flex align-items-center gap-2 justify-content-between px-3 pt-3  mb-1 sticky-top">
          <div className="h4 fw-bold m-0">Link Invoice to Employee</div>
          <button className={styles.iconBtn} onClick={onClose}>
            <X />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div tabIndex={1} className={`hoverinput ${styles.searchWrap}`}>
              <Search />
              <input
                className={`${styles.searchInput}`}
                placeholder="Search by name or email (2+ chars)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {searching && (
              <div className={styles.small}>
                <Loader2 className={styles.spin} /> Searching...
              </div>
            )}
          </div>

          <div className={styles.results}>
            {query.length >= 2 && employees.length === 0 && !searching && (
              <div className={styles.empty}>No employees found</div>
            )}

            {employees.map((emp) => (
              <div
                key={emp.id}
                className={`${styles.resultRow} ${selected?.id === emp.id ? styles.selected : ""}`}
                onClick={() => setSelected(emp)}
              >
                <div>
                  <div className={styles.resultName}>
                    <strong>{emp.full_name}</strong>
                  </div>
                  <div className={styles.resultMeta}>
                    {emp.email} {emp.job_title ? `• ${emp.job_title}` : ""}
                  </div>
                </div>
                {selected?.id === emp.id && <Check />}
              </div>
            ))}
          </div>

          {/* {selected && (
            <div className={styles.cardSmall}>
              <div>
                <b>Selected:</b> <strong>{selected.full_name}</strong>
              </div>
              <div className={styles.row}>{selected.email}</div>
            </div>
          )} */}

          <div className="mb-3">
            <label htmlFor="notes" className="form-label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="e.g., Office supplies, Travel expenses, Equipment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              rows={3}
              className="form-control hoverinput"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.primary} onClick={doLink} disabled={!selected || submitting}>
            {submitting ? "Linking..." : "Link to Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
