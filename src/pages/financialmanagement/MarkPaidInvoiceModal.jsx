import { useEffect, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi } from "../../components";
import { useAuth } from "../../authContext";
// import styles from "./MarkPaidInvoiceModal.module.css";

const INVOICES_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app";

export default function MarkPaidInvoiceModal({ isActive, onClose, invoice, onMarked }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Bank Transfer",
    payment_reference: "",
    notes: "",
  });

  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [remainingBalance, setRemainingBalance] = useState(null);

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    if (invoice) {
      setPaymentData({
        payment_amount: invoice.total_amount ?? "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Bank Transfer",
        payment_reference: "",
        notes: "",
      });
      setIsPartialPayment(false);
      setRemainingBalance(null);
    } else {
      setPaymentData({
        payment_amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Bank Transfer",
        payment_reference: "",
        notes: "",
      });
      setIsPartialPayment(false);
      setRemainingBalance(null);
    }
  }, [invoice, isActive]);

  if (!isActive) return null;

  const handleAmountChange = (val) => {
    const str = String(val);
    setPaymentData((prev) => ({ ...prev, payment_amount: str }));

    const paid = parseFloat(str || "0");
    const total = parseFloat(invoice?.total_amount || "0");

    if (!Number.isNaN(paid) && !Number.isNaN(total)) {
      setRemainingBalance(Math.max(0, total - paid));
    } else {
      setRemainingBalance(null);
    }
  };

  const handleSubmit = async () => {
    if (!paymentData.payment_amount || !paymentData.payment_date || !paymentData.payment_method) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      user_email: user_email,
      action: "add_payment",
      invoice_id: invoice.id || invoice.invoice_id,
      payment_amount: parseFloat(paymentData.payment_amount),
      payment_date: paymentData.payment_date,
      payment_method: paymentData.payment_method,
      payment_reference: paymentData.payment_reference || null,
      notes: paymentData.notes || null,
      partial: !!isPartialPayment,
    };

    setIsSubmitting(true);

    try {
      const response = await axiosApi.post(INVOICES_API_URL, payload);
      const res = response?.data || {};

      if (res.success === false) {
        throw new Error(res.message || "Payment failed");
      }

      const newPaymentStatus = res.payment_status || (payload.partial ? "Partially Paid" : "Paid");

      const remaining = typeof res.remaining_balance === "number" ? res.remaining_balance : remainingBalance;

      toast.success(
        res.message ||
          (newPaymentStatus === "Paid"
            ? `Invoice ${invoice.invoice_number} is now fully paid!`
            : `Payment of $${parseFloat(paymentData.payment_amount).toFixed(2)} recorded. Remaining: $${(
                remaining || 0
              ).toFixed(2)}`)
      );

      const updated = {
        ...invoice,
        payment_status: newPaymentStatus,
      };

      if (typeof onMarked === "function") onMarked(updated, { remaining_balance: remaining });

      onClose(false);
    } catch (err) {
      console.error("MarkInvoiceModal error:", err);
      toast.error(err?.message || "Failed to mark invoice as paid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OverlayModal
      isActive={isActive}
      onClose={() => onClose(false)}
      modalStyle={{ background: "#fff" }}
      style={{ maxWidth: 750 }}
    >
      <h4 className="h4 fw-bold mb-3">💵 Mark Invoice as Paid</h4>
      <div className="modal-content">
        <div className="modal-body">
          <div className="card bg-body-tertiary p-3">
            <div className="d-flex flex-wrap gap-3 justify-content-between">
              <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                <small className="text-muted">Invoice#</small>
                <div className="fw-semibold">{invoice.invoice_number}</div>
              </div>

              <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                <small className="text-muted">Supplier</small>
                <div className="fw-semibold">{invoice.supplier_name}</div>
              </div>

              <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                <small className="text-muted">Amount Due</small>
                <div className="h5 fw-bold text-danger">${Number(invoice.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <h5 className="h5 fw-bold my-3"> Payment Information</h5>
          <div className="mb-3">
            <label className="form-label">
              Payment Amount <span className="text-muted">*</span>
            </label>
            <input
              className="form-control"
              type="number"
              step="0.01"
              value={paymentData.payment_amount}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            <div className="form-text d-flex justify-content-between">
              <span>Invoice total: ${Number(invoice.total_amount || 0).toFixed(2)}</span>
              <label className="mb-0">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={isPartialPayment}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsPartialPayment(checked);

                    if (!checked) {
                      setPaymentData((prev) => ({
                        ...prev,
                        payment_amount: invoice.total_amount,
                      }));
                      setRemainingBalance(0);
                    } else {
                      const total = parseFloat(invoice.total_amount || "0");
                      setRemainingBalance(Math.max(0, total - parseFloat(paymentData.payment_amount || "0")));
                    }
                  }}
                />{" "}
                Partial Payment
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Payment Date <span className="text-muted">*</span>
            </label>
            <input
              className="form-control"
              type="date"
              value={paymentData.payment_date}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Payment Method <span className="text-muted">*</span>
            </label>
            <select
              className="form-select"
              value={paymentData.payment_method}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
            >
              <option>Bank Transfer</option>
              <option>Wire Transfer</option>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>Check</option>
              <option>Cash</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Payment Reference</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g., Check #1234, Transaction ID"
              value={paymentData.payment_reference}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  payment_reference: e.target.value,
                }))
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="3"
              value={paymentData.notes}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </div>

          <div className="bg-success text-success p-3 rounded text-dark bg-opacity-10 my-3">
            <div className="card-body">
              <h6 className="mb-2">Payment Summary</h6>
              <div className="d-flex flex-wrap gap-3 justify-content-between">
                <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                  <div>Amount</div>
                  <div className="fw-semibold text-success">
                    ${parseFloat(paymentData.payment_amount || "0").toFixed(2)}
                  </div>
                </div>

                <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                  <div>Method</div>
                  <div className="fw-semibold">{paymentData.payment_method}</div>
                </div>

                <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                  <div>Date</div>
                  <div className="fw-semibold">{new Date(paymentData.payment_date).toLocaleDateString()}</div>
                </div>

                {remainingBalance !== null && (
                  <div style={{ maxWidth: "40%", minWidth: "200px" }}>
                    <div>Remaining Balance</div>
                    <div className="fw-semibold text-danger">${parseFloat(remainingBalance || 0).toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer gap-2">
          <button className="btn btn-secondary" onClick={() => onClose(false)} disabled={isSubmitting}>
            Cancel
          </button>

          <button
            className="themeButton themeButtonHover px-3 py-2 rounded"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="me-2" /> Processing...
              </>
            ) : isPartialPayment ? (
              "Record Partial Payment"
            ) : (
              "Mark as Paid"
            )}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
