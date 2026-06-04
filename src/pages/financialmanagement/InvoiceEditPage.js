import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { OverlayModal, ThemeLoader, axiosApi } from "../../components";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Edit2,
  X,
  Bot,
  CreditCard,
  DollarSign,
  List,
  Search,
  Check,
  Plus,
} from "lucide-react";
import styles from "./InvoiceEdit.module.css";
import { useAuth } from "../../authContext";

const API_CONFIG = {
  INVOICE_API_URL: "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app/",
  CATEGORIZATION_API_URL: "https://expense-deposit-categorization-engine-v3-305451280005.us-east1.run.app",
  AUTHORIZATION_TOKEN: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
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

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  try {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

export default function InvoiceEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const urlId = params.id || null;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [categories, setCategories] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [editingCategoryForInvoice, setEditingCategoryForInvoice] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [approvedInvoice, setApprovedInvoice] = useState(null);

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId, location.state]);

  function mapApiInvoiceToUI(apiInvoice) {
    const invoiceId = apiInvoice.invoice_id || apiInvoice.id;
    const confidenceDecimal = parseFloat(apiInvoice.categorization_confidence || 0);
    const confidence = Math.round(confidenceDecimal * 100);
    const categoryKey = apiInvoice.suggested_category || "OTHER";
    const categoryDisplay = categoryMap[categoryKey] || categoryKey;
    return {
      id: String(invoiceId),
      invoiceNumber: apiInvoice.invoice_number || "N/A",
      supplier: apiInvoice.supplier_name || "Unknown",
      amount: apiInvoice.total_amount ? `$${parseFloat(apiInvoice.total_amount).toFixed(2)}` : "N/A",
      status: confidence >= 85 ? "extracted" : "needs-review",
      confidence,
      details: {
        invoiceDate: formatDate(apiInvoice.invoice_date),
        dueDate: formatDate(apiInvoice.due_date),
        subtotal: apiInvoice.subtotal_amount ? `$${parseFloat(apiInvoice.subtotal_amount).toFixed(2)}` : "N/A",
        tax: apiInvoice.tax_amount ? `$${parseFloat(apiInvoice.tax_amount).toFixed(2)}` : "N/A",
        currency: apiInvoice.currency || "USD",
      },
      aiCategory: {
        suggestion: categoryDisplay,
        confidence,
        reasoning: apiInvoice.categorization_reasoning,
      },
    };
  }

  function loadCategories() {
    setLoading(true);
    const payload = {
      action: "get_categories",
      user_email: user_email,
    };
    axiosApi
      .post(API_CONFIG.CATEGORIZATION_API_URL, payload)
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success" && data.categories) {
          setCategories(data.categories);
        } else {
          toast.info(data?.message || "No categories available");
        }
      })
      .catch((err) => {
        console.error("get_categories error", err);
        toast.error("Failed to load categories");
      })
      .then(() => setLoading(false));
  }

  function fetchInvoices() {
    setLoading(true);
    if (urlId) {
      const payload = {
        action: "get_invoice_details",
        user_email: user_email,
        invoice_id: parseInt(urlId),
      };
      axiosApi
        .post(API_CONFIG.INVOICE_API_URL, payload)
        .then((res) => {
          const data = res.data;
          if (data && data.invoice) {
            setInvoices([mapApiInvoiceToUI(data.invoice)]);
          } else {
            setInvoices([]);
            toast.info(data?.message || `Invoice ${urlId} not found`);
          }
        })
        .catch((err) => {
          console.error("get_invoice_details error", err);
          toast.error("Failed to fetch invoice");
        })
        .then(() => setLoading(false));
    } else {
      const invoiceIdsFromState = location.state?.invoiceIds || [];
      if (Array.isArray(invoiceIdsFromState) && invoiceIdsFromState.length) {
        const promises = invoiceIdsFromState.map((id) =>
          axiosApi.post(API_CONFIG.INVOICE_API_URL, {
            action: "get_invoice_details",
            user_email: user_email,
            invoice_id: parseInt(id),
          })
        );
        Promise.all(promises)
          .then((responses) => {
            const invoicesRaw = responses.map((r) => r.data.invoice).filter(Boolean);
            const mapped = invoicesRaw.map(mapApiInvoiceToUI);
            setInvoices(mapped);
            if (mapped.length === 0) toast.info("No invoices found for provided IDs");
          })
          .catch((err) => {
            console.error("fetch multiple invoice details error", err);
            toast.error("Failed to fetch invoices");
          })
          .then(() => setLoading(false));
      } else {
        axiosApi
          .post(API_CONFIG.INVOICE_API_URL, {
            action: "get_pending_invoices",
            user_email: user_email,
          })
          .then((res) => {
            const data = res.data;
            if (data && data.invoices && data.invoices.length) {
              const mapped = data.invoices.filter((inv) => inv.status === "Extracted").map(mapApiInvoiceToUI);
              setInvoices(mapped);
            } else {
              setInvoices([]);
              toast.info(data?.message || "No pending invoices");
            }
          })
          .catch((err) => {
            console.error("get_pending_invoices error", err);
            toast.error("Failed to load pending invoices");
          })
          .then(() => setLoading(false));
      }
    }
  }

  function validateInvoiceId(invoiceId) {
    if (invoiceId === null || invoiceId === undefined || invoiceId === "undefined" || invoiceId === "null") {
      toast.error("Invoice ID is missing or invalid.");
      return null;
    }
    const invoiceIdNumber = parseInt(invoiceId);
    if (isNaN(invoiceIdNumber)) {
      toast.error("Invalid invoice ID format.");
      return null;
    }
    return invoiceIdNumber;
  }

  function handleApprove(invoiceId) {
    const invoiceIdNumber = validateInvoiceId(invoiceId);
    if (invoiceIdNumber === null) return;
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found.");
      return;
    }
    setLoading(true);
    axiosApi
      .post(API_CONFIG.INVOICE_API_URL, {
        action: "approve_invoice",
        user_email: user_email,
        invoice_id: invoiceIdNumber,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success") {
          setApprovedInvoice(invoice);
          setSuccessModalOpen(true);
          toast.success(data?.message || `${invoice.invoiceNumber} approved`);
        } else {
          toast.error(data?.message || "Failed to approve invoice");
        }
      })
      .catch((err) => {
        console.error("approve_invoice error", err);
        toast.error("Failed to approve invoice");
      })
      .then(() => setLoading(false));
  }

  function handleSaveEdit(invoiceId) {
    const invoiceIdNumber = validateInvoiceId(invoiceId);
    if (invoiceIdNumber === null) return;
    setLoading(true);
    axiosApi
      .post(API_CONFIG.INVOICE_API_URL, {
        action: "update_invoice",
        user_email: user_email,
        invoice_id: invoiceIdNumber,
        invoice_number: editedData.invoiceNumber,
        supplier_name: editedData.supplier,
        total_amount: parseFloat(String(editedData.amount).replace(/[^0-9.-]+/g, "")) || 0,
        invoice_date: editedData.invoiceDate,
        due_date: editedData.dueDate,
        subtotal: parseFloat(String(editedData.subtotal).replace(/[^0-9.-]+/g, "")) || 0,
        tax: parseFloat(String(editedData.tax).replace(/[^0-9.-]+/g, "")) || 0,
        currency: editedData.currency,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success") {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === invoiceId
                ? {
                    ...inv,
                    invoiceNumber: editedData.invoiceNumber,
                    supplier: editedData.supplier,
                    amount: editedData.amount,
                    details: {
                      ...inv.details,
                      invoiceDate: editedData.invoiceDate,
                      dueDate: editedData.dueDate,
                      subtotal: editedData.subtotal,
                      tax: editedData.tax,
                      currency: editedData.currency,
                    },
                  }
                : inv
            )
          );
          setEditingInvoiceId(null);
          setEditedData({});
          toast.success(data?.message || "Invoice updated");
        } else {
          toast.error(data?.message || "Failed to update invoice");
        }
      })
      .catch((err) => {
        console.error("update_invoice error", err);
        toast.error("Failed to update invoice");
      })
      .then(() => setLoading(false));
  }

  function handleReject(invoiceId) {
    const invoiceIdNumber = validateInvoiceId(invoiceId);
    if (invoiceIdNumber === null) return;
    setLoading(true);
    axiosApi
      .post(API_CONFIG.INVOICE_API_URL, {
        action: "reject_invoice",
        user_email: user_email,
        invoice_id: invoiceIdNumber,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success") {
          setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
          toast.success(data?.message || "Invoice rejected");
        } else {
          toast.error(data?.message || "Failed to reject invoice");
        }
      })
      .catch((err) => {
        console.error("reject_invoice error", err);
        toast.error("Failed to reject invoice");
      })
      .then(() => setLoading(false));
  }

  function handleEdit(invoiceId) {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;
    setEditingInvoiceId(invoiceId);
    setEditedData({
      invoiceNumber: invoice.invoiceNumber,
      supplier: invoice.supplier,
      amount: invoice.amount,
      invoiceDate: invoice.details.invoiceDate,
      dueDate: invoice.details.dueDate,
      subtotal: invoice.details.subtotal,
      tax: invoice.details.tax,
      currency: invoice.details.currency,
    });
  }

  function handleCancelEdit() {
    setEditingInvoiceId(null);
    setEditedData({});
  }

  function handleFieldChange(field, value) {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditCategory(invoiceId) {
    setEditingCategoryForInvoice(invoiceId);
    setShowCategoryPicker(true);
  }

  function handleSaveCategory(categoryCode) {
    if (!editingCategoryForInvoice) return;
    const invoiceIdNumber = parseInt(editingCategoryForInvoice);
    setLoading(true);
    axiosApi
      .post(API_CONFIG.CATEGORIZATION_API_URL, {
        action: "update_category",
        user_email: user_email,
        invoice_id: invoiceIdNumber,
        category: categoryCode,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success") {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === editingCategoryForInvoice
                ? {
                    ...inv,
                    aiCategory: {
                      ...inv.aiCategory,
                      suggestion:
                        categories.find((c) => c.category_code === categoryCode)?.category_name || categoryCode,
                    },
                  }
                : inv
            )
          );
          toast.success(data?.message || "Category updated");
        } else {
          toast.error(data?.message || "Failed to update category");
        }
      })
      .catch((err) => {
        console.error("update_category error", err);
        toast.error("Failed to update category");
      })
      .then(() => {
        setLoading(false);
        setEditingCategoryForInvoice(null);
        setShowCategoryPicker(false);
      });
  }

  function handleAcceptAICategory(invoice) {
    const invoiceIdNumber = validateInvoiceId(invoice.id);
    if (invoiceIdNumber === null) return;
    const matched = categories.find((c) => c.category_name === invoice.aiCategory.suggestion);
    const categoryToSend = matched ? matched.category_code : invoice.aiCategory.suggestion;
    setLoading(true);
    axiosApi
      .post(API_CONFIG.INVOICE_API_URL, {
        action: "update_category",
        user_email: user_email,
        invoice_id: invoiceIdNumber,
        category: categoryToSend,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success") {
          toast.success(data?.message || `Category set to ${invoice.aiCategory.suggestion}`);
        } else {
          toast.error(data?.message || "Failed to accept category");
        }
      })
      .catch((err) => {
        console.error("accept ai category error", err);
        toast.error("Failed to accept category");
      })
      .then(() => setLoading(false));
  }

  function handleSchedulePayment() {
    setSuccessModalOpen(false);
    if (approvedInvoice) {
      navigate("/dashboard/financialmanagement/supplierbills?tab=invoices", {
        state: {
          invoiceId: approvedInvoice.id,
          invoiceNumber: approvedInvoice.invoiceNumber,
          amount: approvedInvoice.amount,
          supplierName: approvedInvoice.supplier,
          dueDate: approvedInvoice.details.dueDate,
        },
      });
    }
  }

  function handlePayNow() {
    setSuccessModalOpen(false);
    toast.info("Pay Now feature will be available soon!");
  }

  function handleBackToList() {
    if (approvedInvoice) setInvoices((prev) => prev.filter((inv) => inv.id !== approvedInvoice.id));
    setSuccessModalOpen(false);
    navigate("/dashboard/financialmanagement/supplierbills?tab=invoices");
  }

  function handleApproveAll() {
    toast.info(`Approving all (${invoices.length}) - demo only`);
  }

  function handleAddCategory(categoryName) {
    if (!categoryName || !categoryName.trim()) return;
    setLoading(true);
    axiosApi
      .post(API_CONFIG.CATEGORIZATION_API_URL, {
        action: "add_category",
        user_email: user_email,
        category_name: categoryName,
      })
      .then((res) => {
        const data = res.data;
        if (data && data.status === "success" && data.category) {
          loadCategories();
          toast.success(data?.message || `Category "${categoryName}" created`);
          if (editingCategoryForInvoice) {
            handleSaveCategory(data.category.category_code);
          }
        } else {
          toast.error(data?.message || "Failed to create category");
        }
      })
      .catch((err) => {
        console.error("add_category error", err);
        toast.error("Failed to create category");
      })
      .then(() => setLoading(false));
  }

  if (loading) return <ThemeLoader show={loading} />;

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <ThemeLoader show={loading} />
      <button
        className="hoverActionBTNSML mb-2 py-2 px-3 gap-2"
        onClick={() => navigate(`/dashboard/financialmanagement/supplierbills/invoice/${urlId}`)}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className={`flex-column align-items-start mb-3`}>
        <div className="h4 fw-bold mb-0">Review Extracted Invoices</div>
        <div className="text-muted">
          Verify the AI-extracted data below. Edit any incorrect fields before approving.
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className={styles.cardEmpty}>
          <p className={styles.muted}>No invoices to review.</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => navigate("/dashboard/financialmanagement/supplierbills")}
          >
            Upload Invoices
          </button>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {invoices.map((invoice) => {
              let highConfidance = invoice.confidence >= 85;
              let mediumConfidance = invoice.confidence >= 70;

              let confidanceStyle = {};

              if (mediumConfidance && !highConfidance) {
                confidanceStyle = { background: "#f59e0b0a", borderColor: "#f59e0b", color: "#f59e0b" };
              } else if (!mediumConfidance && !highConfidance) {
                confidanceStyle = { background: "#ff00000a", borderColor: "red", color: "red" };
              }

              return (
                <div key={invoice.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardInfo}>
                      <span className={styles.bold}>{invoice.invoiceNumber}</span>
                      <span className={styles.sep}>|</span>
                      <span className={styles.bold}>{invoice.supplier}</span>
                      <span className={styles.sep}>|</span>
                      <span className={styles.bold}>{invoice.amount}</span>
                    </div>
                    <div>
                      {invoice.status === "extracted" ? (
                        <span className={`${styles.badge} ${styles.badgeGreen}`}>🟢 Extracted</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeYellow}`}>🟡 Needs Review</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.section} style={confidanceStyle}>
                      <div className={styles.confRow}>
                        <span className={`fw-semibold ${styles.small}`}>AI Confidence:</span>
                        <span className={styles.confValue}>{invoice.confidence}%</span>
                      </div>
                      <div className={styles.progressWrap}>
                        <div className={styles.progressBg}>
                          <div
                            style={{ width: `${invoice.confidence}%` }}
                            className={`${styles.progressBar} ${
                              highConfidance ? styles.green : mediumConfidance ? styles.yellow : styles.red
                            }`}
                          />
                        </div>
                      </div>
                      <p className={`mt-2 ${styles.small}`} style={{ color: "unset" }}>
                        {highConfidance
                          ? "✓ High confidence - data looks good"
                          : mediumConfidance
                          ? "⚠️ Medium confidence - please verify"
                          : "❌ Low confidence - requires review"}
                      </p>
                    </div>

                    <div className={styles.grid2}>
                      <div className={styles.col}>
                        {editingInvoiceId === invoice.id ? (
                          <>
                            <EditableField
                              label="Invoice Number"
                              value={editedData.invoiceNumber || ""}
                              onChange={(v) => handleFieldChange("invoiceNumber", v)}
                            />
                            <EditableField
                              label="Supplier"
                              value={editedData.supplier || ""}
                              onChange={(v) => handleFieldChange("supplier", v)}
                            />
                            <EditableField
                              label="Invoice Date"
                              value={editedData.invoiceDate || ""}
                              type="date"
                              onChange={(v) => handleFieldChange("invoiceDate", v)}
                            />
                            <EditableField
                              label="Due Date"
                              value={editedData.dueDate || ""}
                              type="date"
                              onChange={(v) => handleFieldChange("dueDate", v)}
                            />
                          </>
                        ) : (
                          <>
                            <DetailField label="Invoice Number" value={invoice.invoiceNumber} />
                            <DetailField label="Supplier" value={invoice.supplier} />
                            <DetailField label="Invoice Date" value={invoice.details.invoiceDate} />
                            <DetailField label="Due Date" value={invoice.details.dueDate} />
                          </>
                        )}
                      </div>

                      <div className={styles.col}>
                        {editingInvoiceId === invoice.id ? (
                          <>
                            <EditableField
                              label="Subtotal"
                              value={editedData.subtotal || ""}
                              onChange={(v) => handleFieldChange("subtotal", v)}
                            />
                            <EditableField
                              label="Tax"
                              value={editedData.tax || ""}
                              onChange={(v) => handleFieldChange("tax", v)}
                            />
                            <EditableField
                              label="Total Amount"
                              value={editedData.amount || ""}
                              onChange={(v) => handleFieldChange("amount", v)}
                            />
                            <EditableField
                              label="Currency"
                              value={editedData.currency || ""}
                              onChange={(v) => handleFieldChange("currency", v)}
                            />
                          </>
                        ) : (
                          <>
                            <DetailField label="Subtotal" value={invoice.details.subtotal} />
                            <DetailField label="Tax" value={invoice.details.tax} />
                            <DetailField label="Total Amount" value={invoice.amount} />
                            <DetailField label="Currency" value={invoice.details.currency} />
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.aiCard}>
                      <div className={styles.aiRow}>
                        <Bot className={styles.botIcon} />
                        <div className={styles.aiBody}>
                          <div className={styles.aiHeader}>
                            <p className={styles.small}>
                              Category: <span className={styles.bold}>{invoice.aiCategory.suggestion}</span>
                            </p>
                            <button
                              className="d-flex align-ites-center gap-2 themeButton themeButtonHover p-2 px-3 rounded"
                              onClick={() => handleEditCategory(invoice.id)}
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                          </div>
                          <p className={styles.small}>AI Confidence: {invoice.aiCategory.confidence}%</p>
                          {invoice.aiCategory.reasoning && (
                            <p className={styles.italic}>{invoice.aiCategory.reasoning}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.rowGap}>
                        <button
                          className={`${styles.btn} ${styles.btnAccept}`}
                          onClick={() => handleAcceptAICategory(invoice)}
                        >
                          <Check className={styles.iconSmall} /> Accept
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnOutline}`}
                          onClick={() => {
                            setShowCategoryPicker(true);
                            setEditingCategoryForInvoice(invoice.id);
                          }}
                        >
                          Change Category
                        </button>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button
                        className="themeButton themeButtonHover p-2 px-3 rounded"
                        onClick={() => handleApprove(invoice.id)}
                      >
                        <CheckCircle2 className={styles.iconSmall} /> Approve Invoice
                      </button>

                      {editingInvoiceId === invoice.id ? (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => handleSaveEdit(invoice.id)}
                          >
                            <CheckCircle2 className={styles.iconSmall} /> Save Changes
                          </button>
                          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleCancelEdit}>
                            <X className={styles.iconSmall} /> Cancel
                          </button>
                        </>
                      ) : (
                        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => handleEdit(invoice.id)}>
                          <Edit2 className={styles.iconSmall} /> Edit Details
                        </button>
                      )}

                      <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleReject(invoice.id)}>
                        <X className={styles.iconSmall} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <div></div>
            {invoices.length > 0 && (
              <button className="themeButton themeButtonHover p-2 px-3 rounded" onClick={handleApproveAll}>
                Approve All ({invoices.length})
              </button>
            )}
          </div>
        </>
      )}

      <InvoiceApprovalSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        invoice={
          approvedInvoice
            ? {
                invoiceNumber: approvedInvoice.invoiceNumber,
                supplier: approvedInvoice.supplier,
                amount: approvedInvoice.amount,
                dueDate: approvedInvoice.details.dueDate,
                category: approvedInvoice.aiCategory.suggestion,
              }
            : null
        }
        onSchedulePayment={handleSchedulePayment}
        onPayNow={handlePayNow}
        onBackToList={handleBackToList}
      />

      <CategoryPickerModal
        open={showCategoryPicker}
        onClose={() => {
          setShowCategoryPicker(false);
          setEditingCategoryForInvoice(null);
        }}
        onSave={handleSaveCategory}
        onAddNew={handleAddCategory}
        categories={categories}
        selectedCategory={
          editingCategoryForInvoice
            ? categories.find(
                (c) =>
                  c.category_name ===
                  invoices.find((inv) => inv.id === editingCategoryForInvoice)?.aiCategory.suggestion
              )?.category_code || ""
            : undefined
        }
      />
    </div>
  );
}

function EditableField({ label, value, onChange, type = "text" }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input id={label} type={type} value={value} onChange={(e) => onChange(e.target.value)} className={styles.input} />
    </div>
  );
}

function DetailField({ label, value, editable = true }) {
  return (
    <div className={styles.detailRow}>
      <div>
        <p className={styles.small}>{label}</p>
        <p className={styles.bold}>{value}</p>
      </div>
    </div>
  );
}

function InvoiceApprovalSuccessModal({ open, onOpenChange, invoice, onSchedulePayment, onPayNow, onBackToList }) {
  if (!open || !invoice) return null;
  return (
    <div className={styles.modalWrap}>
      <div className={styles.modalBackdrop} onClick={() => onOpenChange(false)} />
      <div className={styles.modal}>
        <div className={styles.modalInner}>
          <CheckCircle2 className={styles.modalIcon} />
          <h2 className={styles.modalTitle}>Invoice Approved Successfully!</h2>
          <p className={styles.mutedCenter}>
            {invoice.invoiceNumber} from {invoice.supplier} has been approved for payment
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.grid2Small}>
            <div>
              <p className={styles.smallMuted}>Invoice #</p>
              <p className={styles.bold}>{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className={styles.smallMuted}>Supplier</p>
              <p className={styles.bold}>{invoice.supplier}</p>
            </div>
            <div>
              <p className={styles.smallMuted}>Amount</p>
              <p className={styles.bold}>{invoice.amount}</p>
            </div>
            <div>
              <p className={styles.smallMuted}>Due Date</p>
              <p className={styles.bold}>{invoice.dueDate}</p>
            </div>
            <div className={styles.colSpan2}>
              <p className={styles.smallMuted}>Category</p>
              <p className={styles.bold}>{invoice.category}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSchedulePayment}>
            <CreditCard className={styles.iconSmall} /> Schedule Payment
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onPayNow}>
            <DollarSign className={styles.iconSmall} /> Pay Now
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onBackToList}>
            <List className={styles.iconSmall} /> Back to Invoice List
          </button>
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => onOpenChange(false)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryPickerModal({ open, onClose, onSave, onAddNew, categories, selectedCategory }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(selectedCategory || "");
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => setSelected(selectedCategory || ""), [selectedCategory]);

  const groupedCategories = useMemo(() => {
    const groups = {};
    (categories || []).forEach((cat) => {
      const parent = cat.parent_category || "Other";
      if (!groups[parent]) groups[parent] = [];
      groups[parent].push(cat);
    });
    return groups;
  }, [categories]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedCategories;
    const s = search.toLowerCase();
    const filtered = {};
    Object.keys(groupedCategories).forEach((parent) => {
      const matching = groupedCategories[parent].filter(
        (cat) =>
          (cat.category_name || "").toLowerCase().includes(s) ||
          (cat.category_code || "").toLowerCase().includes(s) ||
          (cat.keywords || []).some((kw) => (kw || "").toLowerCase().includes(s))
      );
      if (matching.length) filtered[parent] = matching;
    });
    return filtered;
  }, [groupedCategories, search]);

  const handleSave = () => {
    if (selected) {
      onSave(selected);
      onClose();
    }
  };

  if (!open) return null;
  return (
    <OverlayModal style={{ maxWidth: "800px" }} isActive={open} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <div>
        <div className={styles.modalHeader}>
          <div className={styles.title}>Select Category</div>
        </div>

        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className={styles.input}
            style={{ paddingLeft: "35px" }}
          />
        </div>

        <div className={styles.scrollArea}>
          {Object.keys(filteredGroups).length === 0 ? (
            <div className={styles.empty}>No categories found</div>
          ) : (
            Object.keys(filteredGroups).map((parent) => (
              <div key={parent} className={styles.groupBlock}>
                <div className={styles.groupHeader}>▼ {parent}</div>
                <div>
                  {filteredGroups[parent].map((cat) => (
                    <button
                      key={cat.category_code}
                      onClick={() => setSelected(cat.category_code)}
                      className={`${styles.catBtn} ${selected === cat.category_code ? styles.catSelected : ""}`}
                    >
                      <span className={styles.catLabel}>• {cat.category_name}</span>
                      {selected === cat.category_code && <Check className={styles.iconSmall} />}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className={`${styles.btn} ${styles.btnOutline} ${styles.addNew} mb-2`}
          onClick={() => setShowAddCategory(true)}
        >
          <Plus className={styles.iconSmall} /> Add New Category
        </button>

        <div className={styles.modalFooter}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            Cancel
          </button>
          <button className="themeButton themeButtonHover py-2 px-3 rounded" onClick={handleSave} disabled={!selected}>
            Save
          </button>
        </div>
      </div>

      <AddCategoryModal open={showAddCategory} onClose={() => setShowAddCategory(false)} onSave={onAddNew} />
    </OverlayModal>
  );
}

function AddCategoryModal({ open, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!categoryName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onSave(categoryName.trim());
    setCategoryName("");
    setIsSubmitting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className={styles.modalWrap}>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={`h5 hidemodalclosebtn ${styles.title}`}>Add New Category</div>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Category Name</label>
            <input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Professional Services"
              autoFocus
              className={styles.input}
              required
            />
            <p className={styles.help}>💡 Code and keywords will be auto-generated!</p>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="d-flex align-ites-center gap-2 themeButton themeButtonHover p-2 px-3 rounded"
              disabled={!categoryName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
