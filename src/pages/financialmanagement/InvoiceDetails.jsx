import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Trash2,
  Users,
  Plus,
  File,
  Image,
  Check,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi, ThemeLoader } from "../../components";
import FilePreview from "../benchcandidate/FilePreview";
import AddSupportingDocumentDialog from "./AddSupportingDocumentDialog";
import LinkEmployeeModal from "./LinkEmployeeModal";
import styles from "./InvoiceDetails.module.css";
import OverlayModal from "../../components/OverlayModal";
import MarkPaidInvoiceModal from "./MarkPaidInvoiceModal";
import { useAuth } from "../../authContext";

const DETAILS_API = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app/";
const EMPLOYEE_LINK_API = "https://link-employee-to-expenses-v3-305451280005.us-east1.run.app";

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const categoryMap = {
  PROF_SERVICES: "Professional Services",
  IT_SERVICES: "IT Services",
  OFFICE_SUPPLIES: "Office Supplies",
  UTILITIES: "Utilities",
  RENT: "Rent",
  MARKETING: "Marketing",
  TRAVEL: "Travel",
  MEALS: "Meals & Entertainment",
  INSURANCE: "Insurance",
  OTHER: "Other",
};

export default function InvoiceDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const invoiceId = params.id || location.state?.invoiceId;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);

  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);

  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [linkedEmployee, setLinkedEmployee] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [previewPayload, setPreviewPayload] = useState(null);
  const [markOpen, setMarkOpen] = useState(false);

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  useEffect(() => {
    fetchPayments();
  }, [invoiceId]);

  const fetchPayments = async () => {
    if (!invoiceId) return;
    setLoader(true);
    try {
      const payload = {
        action: "get_invoice_payments",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if (d.status === "success" || d.success) {
        setPayments(d.payments || []);
        setPaymentSummary(d.payment_summary || null);
      }
    } catch (err) {
      console.error("fetchPayments:", err);
    } finally {
      setLoader(false);
    }
  };

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) {
      toast.error("Invoice ID not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoader(true);
    try {
      const payload = {
        action: "get_invoice_details",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if ((d.status === "success" || d.success) && d.invoice) {
        setInvoice(d.invoice);
        setSupportingDocuments(d.supporting_documents || []);
        setLinkedEmployee(d.linked_employee || null);
      } else {
        toast.error(d.error || d.message || "Failed to load invoice details");
      }
    } catch (err) {
      console.error("fetchInvoiceDetails:", err);
      toast.error(err?.message || "Failed to load invoice details");
    } finally {
      setLoading(false);
      setLoader(false);
    }
  };

  const handleViewPDF = async () => {
    if (!invoiceId) return;
    setLoader(true);
    try {
      const payload = {
        action: "view_invoice_pdf",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if ((d.status === "success" || d.success) && d.file_data) {
        setPreviewPayload({
          base64: d.file_data.file_content,
          fileName: d.file_data.file_name,
          mime: "application/pdf",
        });
      } else {
        toast.error(d.error || "Failed to load PDF");
      }
    } catch (err) {
      console.error("handleViewPDF:", err);
      toast.error("Failed to load PDF");
    } finally {
      setLoader(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceId) return;
    setLoader(true);
    try {
      const payload = {
        action: "view_invoice_pdf",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if ((d.status === "success" || d.success) && d.file_data) {
        const base64 = d.file_data.file_content;
        const name = d.file_data.file_name || invoice?.original_filename || "invoice.pdf";
        const a = document.createElement("a");
        a.href = `data:application/pdf;base64,${base64}`;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        toast.error(d.error || "Failed to download PDF");
      }
    } catch (err) {
      console.error("handleDownloadPDF:", err);
      toast.error("Failed to download PDF");
    } finally {
      setLoader(false);
    }
  };

  const handleViewDocument = async (doc) => {
    if (!doc) return;
    setLoader(true);
    try {
      const payload = {
        action: "get_supporting_document",
        document_id: doc.id,
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if ((d.status === "success" || d.success) && d.document) {
        const dd = d.document;
        setPreviewPayload({ base64: dd.file_content, fileName: dd.file_name, mime: dd.file_mime_type });
      } else {
        toast.error(d.error || "Failed to load document");
      }
    } catch (err) {
      console.error("handleViewDocument:", err);
      toast.error("Failed to load document");
    } finally {
      setLoader(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    if (!doc) return;
    setLoader(true);
    try {
      const payload = {
        action: "get_supporting_document",
        document_id: doc.id,
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if ((d.status === "success" || d.success) && d.document) {
        const dd = d.document;
        const byteCharacters = atob(dd.file_content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: dd.file_mime_type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = dd.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Downloaded");
      } else {
        toast.error(d.error || "Failed to download document");
      }
    } catch (err) {
      console.error("handleDownloadDocument:", err);
      toast.error("Failed to download document");
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!doc) return;
    if (!window.confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    setLoader(true);
    try {
      const payload = {
        action: "delete_supporting_document",
        document_id: doc.id,
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};

      if (d.status === "success" || d.success) {
        setSupportingDocuments((s) => s.filter((x) => x.id !== doc.id));
        toast.success(d.message || "Deleted");
      } else {
        toast.error(d.message || d.error || "Delete failed");
      }
    } catch (err) {
      console.error("handleDeleteDocument:", err);
      toast.error("Delete failed");
    } finally {
      setLoader(false);
    }
  };

  const handleApprove = async () => {
    setLoader(true);
    try {
      const payload = {
        action: "approve_invoice",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if (d.status === "success" || d.success) {
        toast.success("Invoice approved");
        setInvoice((s) => ({ ...s, status: "Approved" }));
      } else {
        toast.error(d.error || "Approve failed");
      }
    } catch (err) {
      console.error("handleApprove:", err);
      toast.error("Approve failed");
    } finally {
      setLoader(false);
    }
  };

  const handleReject = async () => {
    setLoader(true);
    try {
      const payload = {
        action: "reject_invoice",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if (d.status === "success" || d.success) {
        toast.success("Invoice rejected");
        navigate("/employer/supplier-bills");
      } else {
        toast.error(d.error || "Reject failed");
      }
    } catch (err) {
      console.error("handleReject:", err);
      toast.error("Reject failed");
    } finally {
      setLoader(false);
    }
  };

  const refreshSupportingDocuments = async () => {
    if (!invoiceId) return;
    setLoader(true);
    try {
      const payload = {
        action: "get_invoice_details",
        invoice_id: Number(invoiceId),
        user_email: user_email,
      };
      const res = await axiosApi.post(DETAILS_API, payload);
      const d = res?.data || {};
      if (d.status === "success" || d.success) {
        setSupportingDocuments(d.supporting_documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoader(false);
    }
  };

  const handleLinkSuccess = () => {
    (async () => {
      if (!invoiceId) return;
      setLoader(true);
      try {
        const payload = {
          action: "get_invoice_details",
          invoice_id: Number(invoiceId),
          user_email: user_email,
        };
        const res = await axiosApi.post(DETAILS_API, payload);
        const d = res?.data || {};
        if ((d.status === "success" || d.success) && d.invoice) {
          setLinkedEmployee(d.linked_employee || null);
          setInvoice(d.invoice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoader(false);
      }
    })();
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <ThemeLoader show={loader || loading} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={styles.center}>
        <div>Invoice not found</div>
        <button className={styles.primarySmall} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  const categoryDisplay = categoryMap[invoice.suggested_category] || invoice.suggested_category || "—";
  const confidence = Math.round(parseFloat(invoice.categorization_confidence || 0) * 100);

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <ThemeLoader show={loader || loading} />
      <button
        className="hoverActionBTNSML mb-2 py-2 px-3 gap-2"
        onClick={() => navigate("/dashboard/financialmanagement/supplierbills?tab=invoices")}
      >
        <ArrowLeft size={18} /> Back
      </button>
      <div className={`flex-column align-items-start mb-3`}>
        <div className="h4 fw-bold mb-0">Invoice Details</div>
        <div className="text-muted">Complete information for this invoice</div>
      </div>

      {invoice.invoice_number ? (
        <div className={`mb-3 p-3 ${styles.card}`} style={{ background: "#077cff0d" }}>
          <div className="fw-semibold">Invoice Number</div>
          <div className="fw-bold h5 py-1 text-success">{invoice.invoice_number || "N/A"}</div>
        </div>
      ) : (
        <></>
      )}

      <div className="d-block d-md-flex gap-2">
        <div className={`mb-3 w-100 ${styles.card}`}>
          <h5>Supplier Information</h5>
          <div className={styles.row}>
            <div>Name</div>
            <div className="fw-semibold">{invoice.supplier_name || "Unknown"}</div>
          </div>
          {invoice.supplier_email && (
            <div className={styles.row}>
              <div>Email</div>
              <div className="fw-semibold"> {invoice.supplier_email}</div>
            </div>
          )}
          {invoice.supplier_phone && (
            <div className={styles.row}>
              <div>Phone</div> <div className="fw-semibold"> {invoice.supplier_phone}</div>
            </div>
          )}
          {invoice.supplier_address && (
            <div className={styles.row}>
              <div>Address</div> <div className="fw-semibold"> {invoice.supplier_address}</div>
            </div>
          )}
        </div>

        <div className={`mb-3 w-100 ${styles.card}`}>
          <h5>Invoice</h5>
          <div className={styles.row}>
            <div>Invoice Date</div> <div className="fw-semibold"> {formatDate(invoice.invoice_date)}</div>
          </div>
          <div className={styles.row}>
            <div>Due Date</div> <div className="fw-semibold"> {formatDate(invoice.due_date)}</div>
          </div>
          <div className={styles.row}>
            <div>Total</div> <div className="fw-semibold"> ${Number(invoice.total_amount || 0).toFixed(2)}</div>
          </div>
          {invoice.purchase_order && (
            <div className={styles.row}>
              <div>PO</div> <div className="fw-semibold"> {invoice.purchase_order}</div>
            </div>
          )}
        </div>
      </div>
      {linkedEmployee && (
        <div className={`mb-3 ${styles.card}`}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2 align-items-center">
              <Users size={18} />
              <h5>Linked to Employee</h5>
            </div>

            <button className={`px-3 py-2 ${styles.primarySmall}`} onClick={() => setShowLinkModal(true)}>
              <Edit size={16} /> Change
            </button>
          </div>

          <div className="d-flex gap-4 flex-wrap mt-3">
            <div className="" style={{ minWidth: "45%" }}>
              <div>Name </div>
              <div className="fw-semibold"> {linkedEmployee.full_name}</div>
            </div>

            {linkedEmployee.email && (
              <div className="" style={{ minWidth: "45%" }}>
                <div>Email </div>
                <div className="fw-semibold"> {linkedEmployee.email}</div>
              </div>
            )}

            {linkedEmployee.phone && (
              <div className="" style={{ minWidth: "45%" }}>
                <div>Phone </div>
                <div className="fw-semibold"> {linkedEmployee.phone}</div>
              </div>
            )}

            {linkedEmployee.job_title && (
              <div className="" style={{ minWidth: "45%" }}>
                <div>Job Title </div>
                <div className="fw-semibold"> {linkedEmployee.job_title}</div>
              </div>
            )}

            {linkedEmployee.status && (
              <div className="" style={{ minWidth: "45%" }}>
                <div>Status </div>
                <div className="fw-semibold"> {linkedEmployee.status}</div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted mt-2">
            <div>
              Linked by {linkedEmployee.linked_by} on {formatDate(linkedEmployee.linked_on)}
            </div>

            {linkedEmployee.link_notes && (
              <div className="mt-2 p-2 bg-background rounded border">
                <div>Notes </div>
                <div className="fw-semibold">{linkedEmployee.link_notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {invoice.line_items && invoice.line_items.length > 0 && (
        <div className={`mb-3 ${styles.card}`}>
          <h5>📋 Line Items</h5>
          <div className="card my-3" style={{ borderColor: "#e6eef8" }}>
            <div className="table-responsive">
              <table className={`table table-hover ${styles.table}`}>
                <thead className="table-light">
                  <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                    <th>Description</th>
                    <th className={styles.right}>Qty</th>
                    <th className={styles.right}>Rate</th>
                    <th className={styles.right}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.description || "—"}</td>
                      <td className={`${styles.right}`}>{it.quantity || "—"}</td>
                      <td className={`${styles.right}`}>
                        {it.unit_price ? `$${parseFloat(it.unit_price).toFixed(2)}` : "—"}
                      </td>
                      <td className={`${styles.right} ${styles.bold}`}>
                        {it.amount ? `$${parseFloat(it.amount).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h5>Amounts</h5>
          <div className={styles.row}>
            <div>Subtotal</div>{" "}
            <div className="fw-semibold">
              ${parseFloat(invoice.subtotal_amount || invoice.total_amount || 0).toFixed(2)}
            </div>
          </div>
          {invoice.tax_amount && (
            <div className={styles.row}>
              <div>Tax</div>
              <div className="fw-semibold"> ${parseFloat(invoice.tax_amount).toFixed(2)}</div>
            </div>
          )}
          <div className={styles.hr} />
          <div className={styles.row}>
            <div>Total </div>{" "}
            <div className="fw-semibold">
              ${parseFloat(invoice.total_amount || 0).toFixed(2)} {invoice.currency || "USD"}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h5>🏷️ Category</h5>
          {invoice.confirmed_category && (
            <div className={`my-2 mb-3 ${styles.confirmed}`}>
              <div className={styles.row}>
                <div>Confirmed</div> <div className="fw-semibold text-success"> {invoice.confirmed_category}</div>
              </div>
              {invoice.categorized_by && (
                <div className={styles.row}>
                  By {invoice.categorized_by} on {formatDate(invoice.categorized_on)}
                </div>
              )}
            </div>
          )}

          {invoice.suggested_category && (
            <div>
              <div className={styles.row}>
                <div>Suggested</div>{" "}
                <div className="fw-semibold text-success">
                  {" "}
                  {categoryMap[invoice.suggested_category] || invoice.suggested_category} ({confidence}% confidence)
                </div>
              </div>
              {invoice.categorization_reasoning && <div className={styles.row}>{invoice.categorization_reasoning}</div>}
            </div>
          )}

          {!invoice.suggested_category && !invoice.confirmed_category && (
            <div className={styles.row}>No category assigned</div>
          )}
        </div>
      </div>
      {payments.length > 0 && (
        <div className={`mb-3 ${styles.card}`}>
          <h5>💳 Payment History</h5>

          <div
            className="d-flex p-3 rounded flex-wrap fap-2 justify-content-between my-3"
            style={{
              background: "#f8f8f8",
            }}
          >
            <div className="mx-auto">
              <div>Total Paid </div>{" "}
              <div className="fw-semibold h5 text-center text-success">
                {" "}
                ${paymentSummary?.total_paid?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="mx-auto">
              <div>Remaining </div>{" "}
              <div className="fw-semibold h5 text-center">
                {" "}
                ${paymentSummary?.remaining_balance?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="mx-auto">
              <div>Payments </div> <div className="fw-semibold h5 text-center"> ${payments?.length}</div>
            </div>
          </div>

          <div className="card my-3" style={{ borderColor: "#e6eef8" }}>
            <div className="table-responsive">
              <table className={`table table-hover ${styles.table}`}>
                <thead className="table-light">
                  <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                    <th>Date</th>
                    <th className={styles.right}>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td>{formatDate(p.payment_date)}</td>
                      <td className={`${styles.right} fw-bold text-success `}>
                        ${parseFloat(p.payment_amount).toFixed(2)}
                      </td>
                      <td>{p.payment_method}</td>
                      <td>{p.reference_number || "—"}</td>
                      <td>{p.payment_notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className={`mb-3 ${styles.card}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5>📎 Supporting Documents </h5>
            <div className="text-muted font12"> {supportingDocuments.length} documents attached</div>
          </div>

          <button className={styles.primary} onClick={() => setShowAddDialog(true)}>
            <Plus size={20} /> Add Document
          </button>
        </div>

        {supportingDocuments.length === 0 ? (
          <div className={styles.empty}>No supporting documents attached</div>
        ) : (
          <div className={styles.docsList}>
            {supportingDocuments.map((doc) => {
              const ext = String(doc.file_extension || "").toLowerCase();

              const Icon =
                ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif"
                  ? Image
                  : ext === ".pdf"
                  ? FileText
                  : File;

              const canView = ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif" || ext === ".pdf";

              return (
                <div key={doc.file_name} className={styles.docRow}>
                  <div>
                    <div className={styles.docName}>
                      <Icon className={styles.extIcon} size={16} /> {doc.file_name}
                    </div>

                    <div className={styles.docMeta}>
                      <span className="capitalize">{String(doc.document_type).replace("_", " ")}</span>•{" "}
                      {doc.file_size_display || ""} {doc.uploaded_by ? ` • by ${doc.uploaded_by}` : ""}
                    </div>
                  </div>

                  <div className={styles.docActions}>
                    {canView && (
                      <button className={styles.iconBtn} onClick={() => handleViewDocument(doc)} title="View">
                        <Eye size={16} />
                      </button>
                    )}

                    <button className={styles.iconBtn} onClick={() => handleDownloadDocument(doc)} title="Download">
                      <Download size={16} />
                    </button>

                    <button className={styles.iconBtnDanger} onClick={() => handleDeleteDocument(doc)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- */}

      <div className="card" style={{ borderColor: "#f1f4f9" }}>
        <div className="card-header" style={{ borderColor: "#f1f4f9" }}>
          <h5 className="mb-0">📅 Activity Timeline</h5>
        </div>

        <div className="card-body">
          <div className={styles.stack}>
            {invoice.created_on && (
              <div className="d-flex align-items-start gap-3">
                <div className={styles.icon}>
                  <Check size={16} />
                </div>
                <div>
                  <p className="mb-1 fw-semibold">Invoice Created</p>
                  <p className="small text-muted mb-0">
                    {formatDate(invoice.created_on)}
                    {invoice.created_by && ` by ${invoice.created_by}`}
                  </p>
                </div>
              </div>
            )}

            {invoice.categorized_on && (
              <div className="d-flex align-items-start gap-3">
                <div className={styles.icon}>
                  <Check size={16} />
                </div>
                <div>
                  <p className="mb-1 fw-semibold">Category Confirmed</p>
                  <p className="small text-muted mb-0">
                    {formatDate(invoice.categorized_on)}
                    {invoice.categorized_by && ` by ${invoice.categorized_by}`}
                  </p>
                </div>
              </div>
            )}

            {invoice.approved_on && (
              <div className="d-flex align-items-start gap-3">
                <div className={styles.icon}>
                  <Check size={16} />
                </div>
                <div>
                  <p className="mb-1 fw-semibold">Invoice Approved</p>
                  <p className="small text-muted mb-0">
                    {formatDate(invoice.approved_on)}
                    {invoice.approved_by && ` by ${invoice.approved_by}`}
                  </p>
                </div>
              </div>
            )}

            {invoice.payment_date && (
              <div className="d-flex align-items-start gap-3">
                <div className={styles.icon}>
                  <Check size={16} />
                </div>
                <div>
                  <p className="mb-1 fw-semibold">Payment Processed</p>
                  <p className="small text-muted mb-0">{formatDate(invoice.payment_date)}</p>
                </div>
              </div>
            )}

            {!invoice.created_on && !invoice.categorized_on && !invoice.approved_on && !invoice.payment_date && (
              <p className="small text-muted mb-0">No activity recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* ______________ */}

      <>
        <div className={`mt-3 ${styles.card}`}>
          <div className="d-flex gap-2 flex-wrap py-2">
            {invoice.status === "Extracted" && (
              <>
                <button className={styles.primary} onClick={handleApprove}>
                  <CheckCircle size={20} /> Approve
                </button>
                <button className={styles.danger} onClick={handleReject}>
                  Reject
                </button>
              </>
            )}

            {invoice.status === "Approved" && invoice.payment_status !== "Paid" && (
              <>
                <button className={styles.primary} onClick={() => setMarkOpen(true)}>
                  <DollarSign size={20} /> Pay Now
                </button>
                <button
                  className={styles.outline}
                  onClick={() =>
                    navigate(`/dashboard/financialmanagement/supplierbills/invoice/${invoiceId}/schedulepayment`, {
                      state: {
                        invoiceId,
                        invoiceNumber: invoice.invoice_number,
                        amount: invoice.total_amount,
                        supplierName: invoice.supplier_name,
                        dueDate: invoice.due_date,
                      },
                    })
                  }
                >
                  <CreditCard size={20} /> Schedule
                </button>
              </>
            )}

            <button className={styles.primaryOutline} onClick={handleViewPDF}>
              <FileText size={20} /> View PDF
            </button>
            <button className={styles.outline} onClick={handleDownloadPDF}>
              <Download size={20} /> Download PDF
            </button>

            {!linkedEmployee && (
              <button className={styles.outline} onClick={() => setShowLinkModal(true)}>
                <Users size={20} /> Link to Employee
              </button>
            )}

            <button
              className={styles.outline}
              onClick={() =>
                navigate(`/dashboard/financialmanagement/supplierbills/invoice/${invoiceId}/edit`, {
                  state: { invoiceIds: [invoiceId] },
                })
              }
            >
              <Edit size={20} /> Edit Invoice
            </button>
          </div>
        </div>
      </>

      <MarkPaidInvoiceModal
        isActive={markOpen}
        onClose={(val) => setMarkOpen(false)}
        invoice={invoice}
        onMarked={fetchPayments}
      />

      <OverlayModal
        isActive={previewPayload?.base64}
        onClose={() => {
          setPreviewPayload(null);
        }}
      >
        <FilePreview
          setFileType={() => {}}
          base64File={previewPayload?.base64}
          fileType={previewPayload?.mime}
          setBase64File={setPreviewPayload}
          fileMeta={previewPayload || {}}
          docObject={previewPayload || {}}
        />
      </OverlayModal>
      {showAddDialog && (
        <AddSupportingDocumentDialog
          open={showAddDialog}
          onOpenChange={(v) => setShowAddDialog(Boolean(v))}
          invoiceId={Number(invoiceId)}
          onSuccess={() => {
            setShowAddDialog(false);
            refreshSupportingDocuments();
          }}
        />
      )}
      {showLinkModal && (
        <LinkEmployeeModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          invoiceId={Number(invoiceId)}
          onSuccess={() => {
            setShowLinkModal(false);
            handleLinkSuccess();
          }}
        />
      )}
    </div>
  );
}
