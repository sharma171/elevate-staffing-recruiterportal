import React, { useEffect, useMemo, useState, useRef } from "react";
import styles from "./css/InvoiceHistory.module.css";

import {
  Eye,
  DollarSign,
  SquarePen,
  Receipt,
  ReceiptText,
  Pen,
  X,
  MoreVertical,
  Ellipsis,
  History,
  MoreHorizontal,
  Ban,
  AlertTriangle,
} from "lucide-react";
import InvoicePayModal from "./InvoicePayModal";
import { axiosApi, ThemeLoader, CustomPagination } from "../../components";
import PaymentHistoryModal from "./PaymentHistoryModal";
import FilePreview from "../benchcandidate/FilePreview";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import EmptyView from "../../components/EmptyView";
import DatePicker from "react-datepicker";
import moment from "moment";
import ReactDOM from "react-dom";
import { EditHistoryModal } from "./InvoiceEditHistory";

const BASE_URL = "https://manage-vendor-payments-v3-305451280005.us-east1.run.app";

function EditInvoiceModal({ open, onClose, invoice, onSave, candidateDetails }) {
  const [totalHours, setTotalHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { user } = useAuth();
  const adminEmail = user?.email;
  const candidateEmail = candidateDetails?.original_email;

  useEffect(() => {
    if (!invoice || !open) return;

    setTotalHours(invoice.totalHours || "");
    setHourlyRate(invoice.hourlyRate || "");
    setInvoiceDate(invoice.created_date ? new Date(invoice.created_date) : null);
    setDueDate(invoice.due_date ? new Date(invoice.due_date) : null);
    setNotes(invoice.notes || "");
    setEditReason("");
    setErrors({});
  }, [invoice, open]);

  const calculatedAmount = useMemo(() => {
    const h = parseFloat(totalHours) || 0;
    const r = parseFloat(hourlyRate) || 0;
    return (h * r).toFixed(2);
  }, [totalHours, hourlyRate]);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};

    if (!totalHours || Number(totalHours) <= 0) {
      newErrors.totalHours = "Total hours is required";
    }

    if (!hourlyRate || Number(hourlyRate) <= 0) {
      newErrors.hourlyRate = "Hourly rate is required";
    }

    if (!editReason.trim()) {
      newErrors.editReason = "Edit reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      task: "edit_invoice",
      invoice_id: invoice?.invoice_id,
      employer_email: adminEmail,
      employee_email: candidateEmail,
      edit_reason: invoiceDate,
      updates: {
        total_hours: totalHours,
        hourly_rate: hourlyRate,
        notes: notes,
        due_date: moment(dueDate).format("YYYY-MM-DD"),
        invoice_date: moment(invoiceDate).format("YYYY-MM-DD"),
      },
    };

    setSaving(true);

    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        toast.success(response?.data?.message || "Invoice updated");
        onSave();
        onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message);
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />

      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-3 shadow-lg"
        style={{ color: "#000" }}
      >
        <div className="mb-3 space-y-1">
          <h2 className="text-lg font-bold mb-0">Edit Invoice</h2>
          <p className="text-sm text-gray-700 my-0">Edit invoice {invoice?.invoice_number}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#f1f1f9] p-2 text-sm">
            <div>
              <span className="font-semibold">Current Amount:</span>
              <p className="fw-medium">${invoice?.total_amount?.toFixed(2)}</p>
            </div>
            <div>
              <span className="font-semibold">Paid:</span>
              <p className="text-green-600 fw-medium">${invoice?.paid_amount?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Total Hours *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={totalHours}
                onChange={(e) => {
                  setErrors({ ...errors, totalHours: "" });
                  setTotalHours(e.target.value);
                }}
                placeholder="40"
                className="mt-1 h-10 bigHoverInput form-control"
              />
              {errors.totalHours && <p className="text-xs text-red-500">{errors.totalHours}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Hourly Rate ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => {
                  setErrors({ ...errors, hourlyRate: "" });
                  setHourlyRate(e.target.value);
                }}
                placeholder="75.00"
                className="mt-1 h-10 bigHoverInput form-control"
              />
              {errors.hourlyRate && <p className="text-xs text-red-500">{errors.hourlyRate}</p>}
            </div>
          </div>

          {totalHours && hourlyRate ? (
            <div className="bg-[#7c3bed1a] p-3 fw-semibold rounded">
              New Total:{" "}
              <span className="fw-bolder" style={{ fontSize: "16px" }}>
                {" "}
                ${calculatedAmount}{" "}
              </span>
            </div>
          ) : (
            <></>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Invoice Date</label>
              <DatePicker
                selected={invoiceDate}
                onChange={(date) => setInvoiceDate(date)}
                dateFormat="MM/dd/yyyy"
                className="ps-2 mt-1 h-10 w-full bigHoverInput form-control"
                placeholderText="MM/DD/YYYY"
                showIcon
                toggleCalendarOnIconClick
                calendarIconClassName="calenderIconRight"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="MM/dd/yyyy"
                className="ps-2 mt-1 h-10 w-full bigHoverInput form-control"
                placeholderText="MM/DD/YYYY"
                showIcon
                toggleCalendarOnIconClick
                calendarIconClassName="calenderIconRight"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice notes..."
              className="mt-1 min-h-[60px] w-full bigHoverInput form-control"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Reason for Edit *</label>
            <textarea
              value={editReason}
              onChange={(e) => {
                setErrors({ ...errors, editReason: "" });
                setEditReason(e.target.value);
              }}
              placeholder="Explain why this invoice is being edited..."
              className="mt-1 min-h-[60px] w-full bigHoverInput form-control"
            />
            {errors.editReason && <p className="text-xs text-red-500">{errors.editReason}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="successoutlineButton border">
            Cancel
          </button>

          <button onClick={handleSave} disabled={saving} className="h-10 rounded-md text-white themePurpleBGHover px-3">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <button onClick={onClose} className="absolute right-3 top-3 hidemodalclosebtn pdfcontrollButtonsPDF">
          <X size={20} />
        </button>
      </div>
    </>
  );
}

function ThreeDotsMenu({
  invoice,
  onClose,
  position,
  candidateDetails,
  onViewPDF,
  onEdit,
  onPay,
  onPaymentHistory,
  disabled,
  onHistory,
  onVoidInvoice, // ← ADD THIS PROP
}) {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  // ✅ ADD THESE CONDITIONAL CHECKS (same as ActionsDropdown)
  const canVoid = invoice?.status?.toLowerCase() === "sent";
  const canOverdue = invoice?.is_overdue;
  const voidDone = invoice?.status?.toLowerCase() === "voided";

  const menuStyle = {
    position: "fixed",
    top: `${position?.top || 0}px`,
    left: `${position?.left || 0}px`,
    zIndex: 9999999999,
  };

  return ReactDOM.createPortal(
    <div ref={menuRef} className="signatureContainer bg-white" style={menuStyle}>
      <div className="shadow-lg rounded-md border bg-white min-w-[180px] py-1">
        <div className="flex flex-col">
          {/* View Invoice - Always visible */}
          <button
            type="button"
            onClick={() => handleAction(() => onViewPDF(invoice))}
            className="successoutlineButtonWhite successoutlineButton border-bottom flex items-center gap-2 px-3 py-2 text-sm"
            title={`View PDF (${invoice.invoice_number})`}
          >
            <Eye size={14} />
            View Invoice
          </button>

          {/* ✅ CONDITIONAL: Edit & Edit History - Hidden if voided */}
          {!voidDone && (
            <>
              <button
                type="button"
                onClick={() => handleAction(() => onEdit(invoice))}
                className="successoutlineButtonWhite successoutlineButton border-bottom flex items-center gap-2 px-3 py-2 text-sm"
                title={`Edit Invoice (${invoice.invoice_number})`}
              >
                <Pen size={14} />
                Edit Invoice
              </button>

              <button
                type="button"
                onClick={() => handleAction(() => onHistory(invoice))}
                className="successoutlineButtonWhite successoutlineButton border-bottom flex items-center gap-2 px-3 py-2 text-sm"
                title={`Invoice Edit History`}
              >
                <History size={14} />
                Edit History
              </button>
            </>
          )}

          {/* Payment History - Always visible */}
          <button
            type="button"
            onClick={() => handleAction(() => onPaymentHistory(invoice))}
            className="successoutlineButtonWhite successoutlineButton border-bottom flex items-center gap-2 px-3 py-2 text-sm"
            title="View Payment History"
          >
            <ReceiptText size={14} />
            Payment History
          </button>

          {/* ✅ CONDITIONAL: Record Payment & Void - Hidden if voided */}
          {!voidDone && (
            <>
              {/* Record Payment - Only if not disabled */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleAction(() => onPay(invoice))}
                  className="successoutlineButtonWhite successoutlineButton  flex items-center gap-2 px-3 py-2 text-sm"
                  title="Record Payment"
                >
                  <DollarSign size={14} />
                  Record Payment
                </button>
              )}

              {/* ✅ Void Invoice - Only if status is "sent" AND not overdue */}
              {canVoid && !canOverdue && (
                <button
                  type="button"
                  onClick={() => handleAction(() => onVoidInvoice(invoice))}
                  className="successoutlineButtonWhite successoutlineButton flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:!bg-red-500"
                  title="Void Invoice"
                >
                  <Ban size={14} />
                  Void Invoice
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const STATUS_BADGES = {
  generated: {
    label: "Generated",
    style: {
      backgroundColor: "transparent",
      color: "#080118",
      border: "1px solid #dfdfe3",
    },
  },
  sent: {
    label: "Sent",
    style: {
      backgroundColor: "#5d14dc",
      color: "#ffffff",
    },
  },
  overdue: {
    label: "Overdue",
    style: {
      backgroundColor: "#ef4444",
      color: "#ffffff",
    },
  },
};
const badgeBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "60px",
  padding: "4px 10px",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const badgeDefaultStyle = {
  backgroundColor: "#6b7280",
  color: "#ffffff",
};

function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const badge = STATUS_BADGES[key];

  return (
    <span
      style={{
        ...badgeBaseStyle,
        ...(badge ? badge.style : badgeDefaultStyle),
      }}
    >
      {badge?.label || status}
    </span>
  );
}
function ActionsDropdown({
  invoice,
  onEdit,
  onViewPDF,
  onRecordPayment,
  onViewHistory,
  onVoidInvoice,
  onHistory,
  disabled,
  index,
  invoiceData,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  const canVoid = invoice?.status?.toLowerCase() === "sent";
  const canOverdue = invoice?.is_overdue;
  const voidDone = invoice?.status?.toLowerCase() === "voided";

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.moreButton}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="More actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className={`${styles.dropdownMenu} ${invoiceData.length === index + 2 ? styles.lastRowMenu : ""} ${
              invoiceData.length === index + 1 ? styles.lastRowMenu : ""
            }`}
            role="menu"
          >
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                onViewPDF(invoice);
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <Eye size={16} />
              <span>View Invoice</span>
            </button>
            {voidDone ? (
              <></>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    onEdit(invoice);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <Pen size={16} />
                  <span>Edit Invoice</span>
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    onHistory(invoice);
                  }}
                  role="menuitem"
                >
                  <Pen size={16} />
                  <span>Edit History</span>
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                onViewHistory(invoice);
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <ReceiptText size={16} />
              <span>Payment History</span>
            </button>
            {voidDone ? (
              <></>
            ) : (
              <>
                {!disabled && (
                  <>
                    <div className={styles.menuSeparator}></div>
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        onRecordPayment(invoice);
                        setIsOpen(false);
                      }}
                      role="menuitem"
                    >
                      <DollarSign size={16} />
                      <span>Record Payment</span>
                    </button>
                  </>
                )}
                {canVoid && !canOverdue && (
                  <>
                    <div className={styles.menuSeparator}></div>
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.destructive}`}
                      onClick={() => {
                        onVoidInvoice(invoice);
                        setIsOpen(false);
                      }}
                      role="menuitem"
                    >
                      <Ban size={16} />
                      <span>Void Invoice</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function VoidInvoiceModal({ show, onClose, invoice, candidateDetails, onSuccess }) {
  const [voidReason, setVoidReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!show) {
      setVoidReason("");
    }
  }, [show]);

  if (!show) return null;

  const handleVoidInvoice = () => {
    if (!voidReason.trim()) return;

    const payload = {
      task: "void_invoice",
      invoice_id: invoice?.invoice_id,
      employer_email: user?.email,
      employee_email: candidateDetails?.original_email,
      void_reason: voidReason.trim(),
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((response) => {
        toast.success(`Invoice has been voided successfully`);
        onSuccess();
        onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to void invoice");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/25 `} onClick={onClose} />

      <div
        role="alertdialog"
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-[24px] shadow-lg Interfont`}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-[#ef4444]">
            <Ban className="h-5 w-5" />
            Void Invoice
          </h2>
          <p className="text-sm text-left text-gray-600">
            This action will void the invoice and mark it as cancelled. This cannot be undone.
          </p>
        </div>

        <div className="!space-y-4 !py-4">
          <div className="!grid !grid-cols-2 !gap-3 p-3 !bg-[#f1f1f9] !rounded-xl text-sm">
            <div>
              <span className="text-gray-600">Invoice:</span>
              <p className="font-medium text-[#080118]">{invoice?.invoice_number}</p>
            </div>
            <div>
              <span className="text-gray-600">Vendor:</span>
              <p className="font-medium text-[#080118]">{invoice?.vendor_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <p className="font-medium text-[#080118]">${invoice?.total_amount}</p>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <p className="font-medium text-[#080118]">${invoice?.remaining_balance}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Current Status:</span>
              <span className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {invoice?.status}
              </span>
            </div>
          </div>

          <div className="!flex !items-start !gap-1 !p-3 !bg-amber-50 !border !border-amber-200 !border-r-1 !border-l-1 !border-t-1 !border-b-1 !border-solid !rounded-xl text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5 mr-1 mb-1 mt-0" />
            <div className="text-amber-700">
              <p className="font-medium">This will:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 pl-1">
                <li>Set remaining balance to $0.00</li>
                <li>Change status to "Voided"</li>
                <li>Record the void reason in audit trail</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="void-reason">
              Void Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              id="void-reason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Enter the reason for voiding this invoice (e.g., Client cancelled project, duplicate invoice, etc.)"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-[#67677c] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex !flex-row !sm:flex-row !justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium border border-gray-300 bg-white hover:text-[#fff] hover:!bg-[#3c93f6] h-10 px-[16px] py-[8px]  sm:mt-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVoidInvoice}
            disabled={!voidReason.trim() || loading}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium text-white h-10 px-[16px] py-[8px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Voiding..." : "Void Invoice"}
          </button>
        </div>
      </div>
    </>
  );
}

function InvoiceHistory({ candidateDetails, disabled }) {
  const [modalInvoice, setModalInvoice] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentPDF, setShowPaymentPDF] = useState(false);
  const [voidInvoiceModal, setVoidInvoiceModal] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [AllinvoiceData, setAllInvoiceData] = useState({});
  const [loader, setLoader] = useState(false);
  const [editInvoice, setEditInvoice] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editHistory, setEditHistory] = useState(false);
  // 1. Add Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { user } = useAuth();

  let employeeEmail = candidateDetails?.original_email;
  let EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    if (employeeEmail) {
      getInvoiceHistory();
    }
  }, []);
  // 2. Sort the invoice data by latest sent_date (or due_date)
  const sortedInvoiceData = useMemo(() => {
    if (!invoiceData || invoiceData.length === 0) return [];

    return [...invoiceData].sort((a, b) => {
      // Use sent_date to find the latest, fallback to due_date or 0 if missing
      const dateA = a.sent_date ? new Date(a.sent_date).getTime() : a.due_date ? new Date(a.due_date).getTime() : 0;
      const dateB = b.sent_date ? new Date(b.sent_date).getTime() : b.due_date ? new Date(b.due_date).getTime() : 0;

      return dateB - dateA; // Descending order (Latest first)
    });
  }, [invoiceData]);

  // 3. Slice the sorted data for the current page
  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedInvoiceData.slice(start, start + rowsPerPage);
  }, [sortedInvoiceData, currentPage, rowsPerPage]);

  // 4. Reset to page 1 whenever new data is fetched
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceData]);

  const getInvoiceHistory = () => {
    const payload = {
      task: "get_invoice_history",
      employee_email: employeeEmail,
      employer_email: EMPLOYER_EMAIL,
      status_filter: "all",
      include_sent_date: true,
    };
    setLoader(true);
    axiosApi
      .post(BASE_URL, payload)
      .then((response) => {
        setInvoiceData(response?.data?.invoices || []);
        setAllInvoiceData(response.data);
      })
      .catch((error) => console.log("getInvoiceHistory error:", error.response ? error.response.data : error.message))
      .finally(() => setLoader(false));
  };

  const getInvoicePDF = (invoice) => {
    let invoiceId = invoice.invoice_id;
    const payload = {
      task: "get_invoice_pdf",
      invoice_id: invoiceId,
      employee_email: employeeEmail,
      employer_email: EMPLOYER_EMAIL,
    };
    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        setShowPaymentPDF(response.data);
        console.log("getInvoiceBalance success:", response.data);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message);
        console.log("getInvoiceBalance error:", error.response ? error.response.data : error.message);
      })
      .finally(() => setLoader(false));
  };

  const handleWriteOff = (data) => {
    console.log("Submit Write Off", data);
  };
  const handleThreeDotsClick = (event, invoice) => {
    event.stopPropagation();

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // ✅ ADD THESE CONDITIONAL CHECKS (same as ActionsDropdown)
    const canVoid = invoice?.status?.toLowerCase() === "sent";
    const canOverdue = invoice?.is_overdue;
    const voidDone = invoice?.status?.toLowerCase() === "voided";

    // Menu dimensions
    const menuWidth = 150;
    let menuHeight = 185;

    if (voidDone) {
      menuHeight = 75;
    }
    if (canVoid) {
      menuHeight = 210;
    }

    let left, top;

    if (buttonRect.bottom + menuHeight <= screenHeight && buttonRect.left >= menuWidth) {
      left = buttonRect.left - menuWidth;
      top = buttonRect.bottom;
    } else if (buttonRect.top >= menuHeight && buttonRect.left >= menuWidth) {
      left = buttonRect.left - menuWidth;
      top = buttonRect.top - menuHeight;
    } else if (buttonRect.bottom + menuHeight <= screenHeight) {
      left = buttonRect.right;
      top = buttonRect.bottom;
    } else {
      left = buttonRect.right;
      top = buttonRect.top - menuHeight;
    }

    if (left + menuWidth > screenWidth) {
      left = screenWidth - menuWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (top + menuHeight > screenHeight) {
      top = screenHeight - menuHeight - 10;
    }
    if (top < 10) {
      top = 10;
    }

    setMenuPosition({
      top,
      left,
      width: buttonRect.width,
      height: buttonRect.height,
    });
    setMenuOpenFor(invoice);
  };

  const handleViewPDF = (invoice) => {
    getInvoicePDF(invoice);
  };

  const handleEdit = (invoice) => {
    setEditInvoice(invoice);
  };

  const handlePay = (invoice) => {
    setModalInvoice(invoice);
  };

  const handlePaymentHistory = (invoice) => {
    setShowPaymentHistory(invoice);
  };

  const closeMenu = () => {
    setMenuOpenFor(null);
  };

  return (
    <>
      <div className={`w-100 p-1 py-3 px-md-3 ${styles.card}`} style={{ boxShadow: "unset" }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle} style={{ color: "#000" }}>
            <Receipt className={styles.icon} />
            Invoice History
          </h3>
        </div>
        {!invoiceData?.length ? (
          <EmptyView
            hide={loader}
            title="No Invoices Found"
            description="Your invoice history is empty. Generated invoices will appear here once available."
          />
        ) : (
          <div className={styles.cardContent}>
            <div className={`table-responsive nowrap ${styles.tableWrapper}`}>
              <table
                className={`table table-striped table-hover table-borderless align-middle ${styles.table}`}
                style={{ "--bs-table-striped-bg": "#f8f9fa", border: "1px solid #e7e7ef" }}
              >
                <thead>
                  <tr style={{ background: "#f7f7fb", color: "#67677e", borderBottom: "1px solid #e7e7ef" }}>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Invoice #
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Employee
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Vendor
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Invoice Date
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Due Date
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Amount
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Paid
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Remaining
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Status
                    </th>
                    <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((invoice, i) => {
                    return (
                      <tr key={invoice.id}>
                        <td className="nowrap fw-medium">{invoice.invoice_number}</td>
                        <td className="fw-medium">{invoice.employee_name}</td>
                        <td>
                          <div>
                            <div className="fw-medium">{invoice.vendor_name}</div>
                            <div className="font12"> {invoice.vendor_code || ""}</div>
                          </div>
                        </td>
                        <td>{invoice.sent_date}</td>
                        <td>
                          <div>
                            {invoice.due_date}
                            {invoice?.days_overdue && invoice.is_overdue ? (
                              <div className="text-danger font12 fw-medium">{invoice?.days_overdue} days overdue</div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </td>
                        <td>
                          {String(invoice.total_amount).includes("$") ? "" : "$"}
                          {invoice.total_amount}
                        </td>
                        <td>
                          {String(invoice.paid_amount).includes("$") ? "" : "$"}
                          {invoice.paid_amount}
                        </td>
                        <td>
                          {String(invoice.remaining_balance).includes("$") ? "" : "$"}
                          {invoice.remaining_balance}
                        </td>
                        <td>
                          {invoice.is_overdue ? (
                            <>
                              <StatusBadge status={"Overdue"} />
                            </>
                          ) : (
                            <>
                              <StatusBadge status={invoice.status} />
                            </>
                          )}
                          {console.log("invoice status", invoice.is_overdue)}
                        </td>
                        <td>
                          {/* <ActionsDropdown
                            invoice={invoice}
                            onHistory={setEditHistory}
                            onEdit={setEditInvoice}
                            onViewPDF={getInvoicePDF}
                            onRecordPayment={setModalInvoice}
                            onViewHistory={setShowPaymentHistory}
                            onVoidInvoice={setVoidInvoiceModal}
                            disabled={disabled}
                            invoiceData={invoiceData}
                            index={i}
                          /> */}
                          <div className={`gap-1 ${styles.actions}`}>
                            <button
                              type="button"
                              className="successoutlineButton"
                              onClick={(e) => handleThreeDotsClick(e, invoice)}
                              title="More options"
                            >
                              <Ellipsis size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="d-flex flex-row justify-content-center">
                {/* ADD THIS CustomPagination COMPONENT RIGHT HERE */}
                <CustomPagination
                  className="flex-row"
                  data={sortedInvoiceData}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Three Dots Menu Popup */}
      {menuOpenFor && (
        <ThreeDotsMenu
          onHistory={setEditHistory}
          invoice={menuOpenFor}
          onClose={closeMenu}
          position={menuPosition}
          candidateDetails={candidateDetails}
          onViewPDF={handleViewPDF}
          onEdit={handleEdit}
          onPay={handlePay}
          onPaymentHistory={handlePaymentHistory}
          onRecordPayment={setModalInvoice}
          onViewHistory={setShowPaymentHistory}
          onVoidInvoice={setVoidInvoiceModal}
          disabled={disabled}
        />
      )}

      {/* showPaymentPDF */}
      <div className="signatureContainer">
        <EditInvoiceModal
          candidateDetails={candidateDetails}
          invoice={editInvoice}
          open={editInvoice}
          onClose={() => setEditInvoice(false)}
          onSave={getInvoiceHistory}
        />
        <VoidInvoiceModal
          show={voidInvoiceModal}
          onClose={() => setVoidInvoiceModal(null)}
          invoice={voidInvoiceModal}
          candidateDetails={candidateDetails}
          onSuccess={getInvoiceHistory}
        />
      </div>
      <FilePreview
        docObject={{ file_extension: "application/pdf", file_name: showPaymentPDF?.pdf_preview?.file_name }}
        base64File={showPaymentPDF?.pdf_preview?.base64_content || ""}
        setBase64File={setShowPaymentPDF}
        fileType="application/pdf"
        setFileType={() => {}}
      />

      <PaymentHistoryModal
        show={showPaymentHistory}
        onClose={() => {
          setShowPaymentHistory(null);
        }}
        candidateDetails={candidateDetails}
      />

      <EditHistoryModal
        open={editHistory}
        data={editHistory}
        candidate={candidateDetails}
        onOpenChange={() => setEditHistory(false)}
      />
      <InvoicePayModal
        update={getInvoiceHistory}
        candidateDetails={candidateDetails}
        show={modalInvoice}
        invoice={modalInvoice}
        onClose={() => setModalInvoice(null)}
        onSubmit={handleWriteOff}
        data={modalInvoice || {}}
      />

      <ThemeLoader show={loader} fixed />
    </>
  );
}

export default InvoiceHistory;
