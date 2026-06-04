import React, { useEffect, useState } from "react";
import styles from "./BulkEditTransactionModal.module.css";
import { OverlayModal } from "../../../components";

export default function BulkEditTransactionModal({
  isOpen,
  onClose,
  transactions = [],
  categories = [],
  onUpdate = async () => {},
}) {
  const [confirmedCategory, setConfirmedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirmedCategory("");
  }, [isOpen]);

  if (!isOpen) return null;

  async function submit() {
    if (!confirmedCategory || transactions.length === 0) return;
    setLoading(true);
    try {
      await onUpdate(
        transactions.map((t) => t.id),
        confirmedCategory
      );
      onClose();
      setConfirmedCategory("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OverlayModal isActive={isOpen} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <div>
        <div className="h5 fw-semibold mb-3">
          Bulk Edit - {transactions.length} Transaction{transactions.length !== 1 ? "s" : ""} Selected
        </div>
        <select
          className="form-select searchInputGlobal mb-3"
          value={confirmedCategory}
          onChange={(e) => setConfirmedCategory(e.target.value)}
        >
          <option value="">Select category...</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <div className={styles.list}>
          {transactions.map((t, index) => {
            let isDebit = t.transaction_type == "debit";
            return (
              <div key={index} className={styles.row}>
                <div className={styles.date}>{t.transaction_date}</div>
                <div className={`fw-medium ${styles.desc}`} title={t.description}>
                  {t.description}
                </div>
                <div className={`${isDebit ? "text-danger" : "text-success"}  ${styles.amount}`}>
                  ${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button className={`hoverActionBTNSML ${styles.btn}`} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="themeButton themeButtonHover px-3 py-2 rounded" onClick={submit} disabled={loading}>
            {loading ? "Updating..." : `Update All (${transactions.length})`}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
