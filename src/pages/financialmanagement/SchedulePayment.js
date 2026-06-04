import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SchedulePayment.module.css";
import { axiosApi, ThemeLoader } from "../../components";

const INVOICES_API_URL = "/api/invoices/schedule";

export default function SchedulePayment() {
  const [paymentTiming, setPaymentTiming] = useState("due-date");
  const [customDate, setCustomDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("ach");
  const [paymentSource, setPaymentSource] = useState("chase-5678");
  const [reminderBeforePayment, setReminderBeforePayment] = useState(true);
  const [verifyBalance, setVerifyBalance] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [recurringDuration, setRecurringDuration] = useState("12");
  const [loader, setLoader] = useState(false);

  const [showBeforeDuePicker, setShowBeforeDuePicker] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const beforeDueRef = useRef();
  const customRef = useRef();

  // Mock invoice
  const invoice = {
    number: "INV-2024-045",
    supplier: "Acme Corp",
    amount: "$7,020.00",
    dueDate: "Nov 15, 2024",
    dueDateISO: "2024-11-15",
    daysUntilDue: 7,
  };

  const paymentMethodInfo = {
    ach: "1-2 business days",
    wire: "Same day - $25 fee",
    check: "5-7 business days",
  };

  useEffect(() => {
    function onBodyClick(e) {
      if (beforeDueRef.current && !beforeDueRef.current.contains(e.target)) {
        setShowBeforeDuePicker(false);
      }
      if (customRef.current && !customRef.current.contains(e.target)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", onBodyClick);
    return () => document.removeEventListener("mousedown", onBodyClick);
  }, []);

  const formatNice = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const getScheduledDate = () => {
    if (paymentTiming === "due-date") return invoice.dueDate;
    if ((paymentTiming === "custom" || paymentTiming === "before-due") && customDate) return formatNice(customDate);
    return invoice.dueDate;
  };

  const handleSchedule = async () => {
    setLoader(true);
    const payload = {
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      scheduledFor: getScheduledDate(),
      paymentMethod,
      paymentSource,
      reminderBeforePayment,
      verifyBalance,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      recurringDuration: isRecurring ? recurringDuration : null,
    };

    try {
      const resp = await axiosApi.post(INVOICES_API_URL, payload);
      toast.success("Payment Scheduled Successfully");
      setTimeout(() => {
        window.location.assign("/employer/payables/supplier-bills");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule payment. Try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className={`flex-column align-items-start mb-3`}>
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">Schedule Payment</h3>
        <p className={`text-muted`}>Set up automatic payment for this invoice</p>
      </div>
      <ThemeLoader show={loader} />
      <ToastContainer position="top-right" />

      <div className={styles.cardPrimary}>
        <div className={styles.cardContent}>
          <div className={styles.grid5}>
            <div>
              <p className={styles.muted}>Invoice #</p>
              <p className={styles.bold}>{invoice.number}</p>
            </div>
            <div>
              <p className={styles.muted}>Supplier</p>
              <p className={styles.bold}>{invoice.supplier}</p>
            </div>
            <div>
              <p className={styles.muted}>Amount Due</p>
              <p className={`${styles.bold} ${styles.large}`}>{invoice.amount}</p>
            </div>
            <div>
              <p className={styles.muted}>Due Date</p>
              <p className={styles.bold}>
                {invoice.dueDate}
                <span className={styles.smallMuted}> ({invoice.daysUntilDue} days)</span>
              </p>
            </div>
            <div>
              <p className={styles.muted}>Status</p>
              <span className={styles.badge}>🟡 Approved</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardContentLarge}>
          <div className={styles.section}>
            <label className={styles.label}>
              When to Pay <span className={styles.aster}>*</span>
            </label>

            <div className={styles.radioGroup}>
              <label className={styles.radioRow}>
                <input
                  type="radio"
                  name="timing"
                  value="due-date"
                  checked={paymentTiming === "due-date"}
                  onChange={() => setPaymentTiming("due-date")}
                />
                <span className={styles.radioLabel}>On due date ({invoice.dueDate})</span>
              </label>

              <div>
                <label className={styles.radioRow}>
                  <input
                    type="radio"
                    name="timing"
                    value="before-due"
                    checked={paymentTiming === "before-due"}
                    onChange={() => setPaymentTiming("before-due")}
                  />
                  <span className={styles.radioLabel}>Before due date</span>
                </label>

                {paymentTiming === "before-due" && (
                  <div className={styles.indent} ref={beforeDueRef}>
                    <button
                      type="button"
                      className={`${styles.btnOutline} ${!customDate ? styles.mutedText : ""}`}
                      onClick={() => {
                        setShowBeforeDuePicker((s) => !s);
                        setShowCustomPicker(false);
                      }}
                    >
                      <CalendarIcon className={styles.icon} />
                      {customDate ? formatNice(customDate) : "Pick a date"}
                    </button>

                    {showBeforeDuePicker && (
                      <div className={styles.popover}>
                        <input
                          type="date"
                          className={styles.dateInput}
                          value={customDate ? customDate.split("T")[0] : ""}
                          onChange={(e) => {
                            setCustomDate(e.target.value ? new Date(e.target.value).toISOString() : null);
                            setShowBeforeDuePicker(false);
                          }}
                          min={new Date().toISOString().slice(0, 10)}
                          max={invoice.dueDateISO}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={styles.radioRow}>
                  <input
                    type="radio"
                    name="timing"
                    value="custom"
                    checked={paymentTiming === "custom"}
                    onChange={() => setPaymentTiming("custom")}
                  />
                  <span className={styles.radioLabel}>Custom date</span>
                </label>

                {paymentTiming === "custom" && (
                  <div className={styles.indent} ref={customRef}>
                    <button
                      type="button"
                      className={`${styles.btnOutline} ${!customDate ? styles.mutedText : ""}`}
                      onClick={() => {
                        setShowCustomPicker((s) => !s);
                        setShowBeforeDuePicker(false);
                      }}
                    >
                      <CalendarIcon className={styles.icon} />
                      {customDate ? formatNice(customDate) : "Pick a date"}
                    </button>

                    {showCustomPicker && (
                      <div className={styles.popover}>
                        <input
                          type="date"
                          className={styles.dateInput}
                          value={customDate ? customDate.split("T")[0] : ""}
                          onChange={(e) => {
                            setCustomDate(e.target.value ? new Date(e.target.value).toISOString() : null);
                            setShowCustomPicker(false);
                          }}
                          min={new Date().toISOString().slice(0, 10)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.tipBox}>
              <Lightbulb className={styles.tipIcon} />
              <p>
                <strong>Tip:</strong> Schedule payment 2-3 days early to ensure it processes before due date
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Payment Method <span className={styles.aster}>*</span>
            </label>
            <select className={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="ach">ACH/Bank Transfer</option>
              <option value="wire">Wire Transfer</option>
              <option value="check">Check</option>
            </select>
            <p className={styles.smallMuted}>Processing time: {paymentMethodInfo[paymentMethod]}</p>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Pay From <span className={styles.aster}>*</span>
            </label>
            <select className={styles.select} value={paymentSource} onChange={(e) => setPaymentSource(e.target.value)}>
              <option value="chase-5678">Operating Account - Chase ****5678</option>
              <option value="bofa-1234">Savings Account - BofA ****1234</option>
              <option value="wells-9012">Business Account - Wells Fargo ****9012</option>
            </select>
            <p className={`my-2 ${styles.balance}`}>Available Balance: $127,450.00</p>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Reminders</label>
            <div className={styles.checkboxCol}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={reminderBeforePayment}
                  onChange={(e) => setReminderBeforePayment(e.target.checked)}
                />
                <span className={styles.checkboxLabel}>Send me a reminder 1 day before payment</span>
              </label>

              <label className={styles.checkboxRow}>
                <input type="checkbox" checked={verifyBalance} onChange={(e) => setVerifyBalance(e.target.checked)} />
                <span className={styles.checkboxLabel}>Verify account balance before payment</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.checkboxRow} style={{ alignItems: "center" }}>
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
              <span className={styles.checkboxLabel}>Make this a recurring payment</span>
            </label>

            {isRecurring && (
              <div className={styles.recurringGrid}>
                <div>
                  <label className={styles.label}>Frequency</label>
                  <select
                    className={styles.select}
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Duration</label>
                  <select
                    className={styles.select}
                    value={recurringDuration}
                    onChange={(e) => setRecurringDuration(e.target.value)}
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="indefinite">Indefinite</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`my-3 ${styles.cardMuted}`}>
        <div className={styles.cardContent}>
          <div className={styles.grid3}>
            <div>
              <p className={styles.muted}>Payment Amount</p>
              <p className={`${styles.bold} ${styles.large}`}>{invoice.amount}</p>
            </div>
            <div>
              <p className={styles.muted}>Scheduled Date</p>
              <p className={styles.bold}>{getScheduledDate()}</p>
            </div>
            <div>
              <p className={styles.muted}>Payment Method</p>
              <p className={styles.bold}>
                {paymentMethod === "ach" && "ACH/Bank Transfer"}
                {paymentMethod === "wire" && "Wire Transfer"}
                {paymentMethod === "check" && "Check"}
              </p>
            </div>
          </div>

          <div className={styles.summaryFooter}>
            <p className={styles.smallMuted}>
              <span>⏰</span> Payment will be initiated on <strong>{getScheduledDate()}</strong>
            </p>
            <p className={styles.successText}>
              <span>✓</span> Expected completion: <strong>Nov 17, 2024</strong>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnOutline}
          onClick={() => window.location.assign("/employer/payables/invoice-review")}
        >
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={handleSchedule}>
          Schedule Payment
        </button>
      </div>
    </div>
  );
}
