import { useState } from "react";
import styles from "./css/InvoicePayModal.module.css";
import OverlayModal from "../../components/OverlayModal";
import { axiosApi, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import styles2 from "./css/timesheets.module.css";
import { X } from "lucide-react";
import { useAuth } from "../../authContext";

const BASE_URL = "https://manage-vendor-payments-v3-305451280005.us-east1.run.app";

function PaymentForm({ remaining_balance, onSubmit, onClose, invoice_number }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const handlePaymentSubmit = () => {
    const newErrors = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
    } else if (Number(amount) > remaining_balance) {
      newErrors.amount = `Amount cannot exceed $${remaining_balance}`;
    }

    if (!method.trim()) {
      newErrors.method = "Payment method is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      type: "payment",
      amount: amount,
      method,
      reference,
      notes,
    });
  };

  const paymentMethods = ["Check", "Wire Transfer", "ACH", "Credit Card", "Cash"];

  return (
    <div className="d-flex flex-column h-100">
      <div className={styles.modalSection}>
        <div className={styles.inputField}>
          <label htmlFor="amount" className={styles.label}>
            Payment Amount *
          </label>
          <input
            id="amount"
            type="number"
            placeholder={`Max: ${remaining_balance}`}
            max={remaining_balance}
            value={amount}
            onChange={(e) => {
              errors.amount = "";
              let val = e.target.value;

              if (remaining_balance >= val) {
                setAmount(val);
              } else {
                setAmount(remaining_balance);
              }
            }}
          />
          {errors.amount && <p className={styles.errorText}>{errors.amount}</p>}
        </div>

        <div className={styles.inputField}>
          <label htmlFor="method" className={styles.label}>
            Payment Method *
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => {
              errors.method = "";
              setMethod(e.target.value);
            }}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
          {errors.method && <p className={styles.errorText}>{errors.method}</p>}
        </div>

        <div className={styles.inputField}>
          <label htmlFor="reference" className={styles.label}>
            Reference Number
          </label>
          <input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Optional - e.g., Check #, Transaction ID"
          />
        </div>

        <div className={styles.inputField}>
          <label htmlFor="notes" className={styles.label}>
            Notes
          </label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
        </div>
      </div>

      <div className="flex-grow-1"></div>

      <div className={styles.modalFooter}>
        <button type="button" className={styles.btnCancel} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.btnSubmit} onClick={handlePaymentSubmit}>
          Record Payment
        </button>
      </div>
    </div>
  );
}

function WriteoffForm({ remaining_balance, onSubmit, onClose, invoice_number }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  const handleWriteoffSubmit = () => {
    const newErrors = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
    } else if (Number(amount) > remaining_balance) {
      newErrors.amount = `Amount cannot exceed $${remaining_balance}`;
    }

    if (!reason.trim()) {
      newErrors.reason = "Write-off reason is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      type: "writeoff",
      amount: amount,
      reason,
    });
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className={styles.modalSection}>
        <div className={styles.inputField}>
          <label htmlFor="amount" className={styles.label}>
            Write-off Amount *
          </label>
          <input
            id="amount"
            type="number"
            placeholder={`Max: ${remaining_balance}`}
            max={remaining_balance}
            value={amount}
            onChange={(e) => {
              errors.amount = "";
              let val = e.target.value;

              if (remaining_balance >= val) {
                setAmount(val);
              } else {
                setAmount(remaining_balance);
              }
            }}
          />
          {errors.amount && <p className={styles.errorText}>{errors.amount}</p>}
          <p className={styles.helperText}>
            You can write off partial or full amount. Remaining balance: ${remaining_balance}
          </p>
        </div>

        <div className={styles.inputField}>
          <label htmlFor="reason" className={styles.label}>
            Write-off Reason *
          </label>
          <input
            id="reason"
            value={reason}
            onChange={(e) => {
              errors.reason = "";
              setReason(e.target.value);
            }}
            placeholder="Explain why this invoice is being written off..."
          />
          {errors.reason && <p className={styles.errorText}>{errors.reason}</p>}
        </div>
      </div>

      <div className="flex-grow-1"></div>

      <div className={styles.modalFooter}>
        <button type="button" className={styles.btnCancel} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.btnSubmit} onClick={handleWriteoffSubmit}>
          Write Off Invoice
        </button>
      </div>
    </div>
  );
}

export default function InvoicePayModal({ show, onClose, data = {}, candidateDetails, update = () => {} }) {
  const [paymentType, setPaymentType] = useState("payment");
  const { invoice_number, total_amount, remaining_balance } = data || {};
  const [loader, setLoader] = useState(false);

  const { user } = useAuth();

  let employeeEmail = candidateDetails?.original_email;
  let employerEmail = user?.email;

  const addPayment = (payload) => {
    setLoader(true);
    axiosApi
      .post(BASE_URL, payload)
      .then(({ data }) => {
        toast.success(data.message);
        update();
        onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message || "Failed to add");
        console.log("addPayment error:", error.response ? error.response.data : error.message);
      })
      .finally(() => setLoader(false));
  };

  let isPaymentOption = paymentType === "payment";

  if (!show) return null;

  const onSubmit = (resData) => {
    let isPayment = resData.type == "payment";

    let payload = {
      task: "add_payment",
      employee_email: employeeEmail,
      employer_email: employerEmail,
      invoice_id: data?.invoice_id,
      payment_amount: resData?.amount,
      payment_method: resData?.method,
      reference_number: resData?.reference,
      payment_notes: resData?.notes,
    };

    if (!isPayment) {
      payload = {
        task: "add_payment",
        employee_email: employeeEmail,
        employer_email: employerEmail,
        invoice_id: data?.invoice_id,
        payment_amount: resData?.amount,
        payment_method: "Write-off",
        payment_notes: resData?.reason,
      };
    }

    addPayment(payload);
  };

  return (
    <div className={`${styles2.overlay} hidemodalclosebtn`}>
      <div role="dialog" className={styles2.dialog}>
        <button
          type="button"
          title="Close"
          onClick={onClose}
          className={`generalButton maxcontent hidemodalclosebtn ${styles2.close}`}
          aria-label="Close"
        >
          <X size="25px" />
        </button>
        {/* <div isActive onClose={onClose} style={{ maxWidth: "800px" }}> */}
        <div className="d-flex flex-column h-100">
          <div>
            <div className={styles.modalHeader}>
              <h2> {isPaymentOption ? "Record Payment" : "Write Off Invoice"}</h2>
              <p>
                {isPaymentOption ? "Record a payment for invoice" : "Write off the remaining amount for invoice"}{" "}
                {invoice_number}
              </p>
            </div>

            <div className={styles.modalGrid}>
              <div className="d-sm-flex gap-2">
                <span className={styles.label}>Invoice Amount:</span>
                {total_amount ? <p>${total_amount}</p> : ""}{" "}
              </div>
              <div className="d-sm-flex gap-2">
                <span className={styles.label}>Remaining:</span>
                <p>${remaining_balance || "0"}</p>
              </div>
            </div>

            <div className={styles.radioGroup}>
              <label className={styles.label}>Payment Type:</label>
              <div className={styles.flexCenter}>
                <input
                  type="radio"
                  id="payment"
                  name="paymentType"
                  checked={paymentType === "payment"}
                  onChange={() => setPaymentType("payment")}
                />
                <label htmlFor="payment">Payment</label>
              </div>
              <div className={styles.flexCenter}>
                <input
                  type="radio"
                  id="writeoff"
                  name="paymentType"
                  checked={paymentType === "writeoff"}
                  onChange={() => setPaymentType("writeoff")}
                />
                <label htmlFor="writeoff">Write-off</label>
              </div>
            </div>
          </div>

          <div className="flex-grow-1 d-flex flex-column">
            {isPaymentOption ? (
              <PaymentForm
                remaining_balance={remaining_balance}
                onSubmit={onSubmit}
                onClose={onClose}
                invoice_number={invoice_number}
              />
            ) : (
              <WriteoffForm
                remaining_balance={remaining_balance}
                onSubmit={onSubmit}
                onClose={onClose}
                invoice_number={invoice_number}
              />
            )}
          </div>

          <ThemeLoader show={loader} />
        </div>
      </div>
    </div>
  );
}
