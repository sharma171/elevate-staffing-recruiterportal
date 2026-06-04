import { useEffect, useState } from "react";
import { axiosApi, ThemeLoader } from "../../components";
import OverlayModal from "../../components/OverlayModal";
import { X } from "lucide-react";
import styles from "./css/PaymentHistoryModal.module.css";
import { returnTruncatedStr } from "../../helpers/StrHelpers";
import { useAuth } from "../../authContext";
import EmptyView from "../../components/EmptyView";

const BASE_URL = "https://manage-vendor-payments-v3-305451280005.us-east1.run.app";

export default function PaymentHistoryModal({ show, onClose, candidateDetails }) {
  const [loader, setLoader] = useState(false);
  const [historyData, setHistoryData] = useState({ payment_summary: {}, invoice_details: {}, payment_history: [] });

  const { user } = useAuth();

  let employerEmail = user?.email;
  let employeeEmail = candidateDetails?.original_email || "";

  useEffect(() => {
    if (show) {
      fetchHistory(true);
    }
  }, [show]);

  const fetchHistory = (includeWriteoffs) => {
    setLoader(true);
    axiosApi
      .post(BASE_URL, {
        task: "get_payment_history",
        invoice_id: show.invoice_id,
        employee_email: employeeEmail,
        employer_email: employerEmail,
        include_writeoffs: includeWriteoffs,
      })
      .then(({ data }) => setHistoryData(data))
      .catch((e) => console.error("getPaymentHistory error:", e.response ? e.response.data : e.message))
      .finally(() => setLoader(false));
  };

  if (!show || !historyData) {
    return null;
  }

  const {
    invoice_details: { invoice_number, total_amount, remaining_balance },
    payment_summary: { total_payments },
    payment_history,
  } = historyData;

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <OverlayModal isActive onClose={onClose} style={{ maxWidth: "800px" }}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 id="paymentTitle" className={styles.title}>
            Payment History
          </h2>
          <p id="paymentDescription" className={styles.description}>
            Payment history for invoice {invoice_number}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`generalButton maxcontent hidemodalclosebtn top-0 end-0 ${styles.closeButton}`}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        <div className={styles.summaryGrid}>
          <div className="wmaxcontent">
            <span className={styles.label}>Total Amount </span>
            <p className="text-center">${total_amount}</p>
          </div>
          <div className="wmaxcontent">
            <span className={styles.label}>Paid Amount </span>
            <p className={`text-center ${styles.paid}`}>${total_payments}</p>
          </div>
          <div className="wmaxcontent">
            <span className={styles.label}>Remaining </span>
            <p className={`text-center ${styles.remaining}`}>${remaining_balance}</p>
          </div>
        </div>
        {payment_history?.length ? (
          <div className={styles.recordsSection}>
            <h4 className={styles.label}>Payment Records:</h4>
            <div className={`table-responsive ${styles.tableWrapper}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th className="text-center">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payment_history.map((p) => (
                    <tr key={p.payment_id}>
                      <td>{formatDate(p.payment_date)}</td>
                      <td>
                        <span className={p.is_writeoff ? styles.writeoff : styles.paid}>${p.payment_amount}</span>
                      </td>
                      <td>
                        <span className={styles.methodBadge}>{p.payment_method}</span>
                      </td>
                      <td>{returnTruncatedStr(p.reference_number, 8) || "—"}</td>
                      <td title={p.payment_notes}>{p.payment_notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyView
            hide={loader}
            title="No Payment Records"
            description="Your payment history is empty. All completed and upcoming payments will be shown here."
          />
        )}
      </div>
      <ThemeLoader show={loader} fixed />
    </OverlayModal>
  );
}
