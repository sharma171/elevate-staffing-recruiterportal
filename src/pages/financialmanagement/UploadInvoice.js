import React, { useRef, useState, useEffect } from "react";
import styles from "./UploadInvoiceModal.module.css";
import {
  FileText,
  X,
  Upload,
  Clock,
  Image as ImageIcon,
  BarChart2,
  Clipboard,
  CheckSquare,
  FilePlus,
  Wrench,
  Package,
  File as GenericFileIcon,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SelectPicker } from "rsuite";
import { axiosApi, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import OverlayModal from "../../components/OverlayModal";
import SupplierManagementDialog from "./SupplierManagementDialog";
import { useAuth } from "../../authContext";

const SUPPLIERS_API_URL = "https://manage-supplier-invoices-api-v3-305451280005.us-east1.run.app";
const EXTRACTION_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app";

const SUPPORT_OPTIONS = [
  { value: "timesheet", label: "Timesheet", Icon: BarChart2, emoji: "📊" },
  { value: "receipt", label: "Receipt", Icon: FileText, emoji: "🧾" },
  { value: "purchase_order", label: "Purchase Order", Icon: Clipboard, emoji: "📋" },
  { value: "approval", label: "Approval", Icon: CheckSquare, emoji: "✅" },
  { value: "contract", label: "Contract", Icon: FileText, emoji: "📄" },
  { value: "work_order", label: "Work Order", Icon: Wrench, emoji: "🔧" },
  { value: "delivery_note", label: "Delivery Note", Icon: Package, emoji: "📦" },
  { value: "other", label: "Other", Icon: FilePlus, emoji: "📁" },
];

export default function UploadInvoiceModal({ data = {}, showSupplierSelect, isActive, onClose, onUploadComplete }) {
  const mainInputRef = useRef(null);
  const supportInputRef = useRef(null);
  const [mainFile, setMainFile] = useState(null);
  const [supportFiles, setSupportFiles] = useState([]);
  const [loader, setLoader] = useState(false);
  const [suppliersData, setSuppliersData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [addSupplier, setAddSupplier] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");
  const [invoiceId, setInvoiceId] = useState(null);

  const supplierName = data?.company_name || "";

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    if (showSupplierSelect) fetchSuppliers();
  }, [showSupplierSelect]);

  useEffect(() => {
    validateForm();
  }, [mainFile, supportFiles]);

  useEffect(() => {
    if (isActive) resetForm();
  }, [isActive]);

  function fileIconFor(file) {
    if (!file) return GenericFileIcon;
    const t = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    if (t.includes("pdf") || name.endsWith(".pdf")) return FileText;
    if (t.startsWith("image/") || name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return ImageIcon;
    return GenericFileIcon;
  }

  async function fetchSuppliers() {
    setLoader(true);
    try {
      const payload = {
        user_email: user_email,
        limit: 1000,
        offset: 0,
        action: "list_suppliers",
        is_active: true,
      };
      const res = await axiosApi.post(SUPPLIERS_API_URL, payload);
      const data = res?.data || {};
      setSuppliersData(data.suppliers || data.data || []);
    } catch (error) {
      console.error("getSuppliers error:", error?.response ? error.response.data : error?.message);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch suppliers");
    } finally {
      setLoader(false);
    }
  }

  function validateForm() {
    const errors = [];
    if (!mainFile) {
      errors.push("Main invoice PDF is required.");
    } else {
      const f = mainFile.file;
      if (!f.name.toLowerCase().endsWith(".pdf") && !(f.type || "").toLowerCase().includes("pdf")) {
        errors.push("Main file must be a PDF.");
      }
      if (f.size > 10 * 1024 * 1024) {
        errors.push("Main file exceeds 10 MB limit.");
      }
    }
    supportFiles.forEach((s) => {
      const f = s.file;
      if (f.size > 10 * 1024 * 1024) {
        errors.push(`Supporting file "${f.name}" exceeds 10 MB.`);
      }
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "image/",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const t = (f.type || "").toLowerCase();
      const name = (f.name || "").toLowerCase();
      const isAllowed =
        allowed.some((a) => (a.endsWith("/") ? t.startsWith(a) : t === a)) ||
        name.match(/\.(pdf|xlsx?|csv|jpg|jpeg|png|gif|webp|bmp|docx?|txt)$/);
      if (!isAllowed) {
        errors.push(`Supporting file "${f.name}" has unsupported format.`);
      }
      if (!s.type) {
        errors.push(`Supporting file "${f.name}" must have a document type selected.`);
      }
    });
    setFormErrors([...new Set(errors)]);
    return errors.length === 0;
  }

  function resetForm() {
    setMainFile(null);
    setSupportFiles([]);
    setSelectedSupplier(null);
    setFormErrors([]);
    setUploading(false);
    setUploadStage("idle");
    setInvoiceId(null);
    if (mainInputRef.current) mainInputRef.current.value = "";
    if (supportInputRef.current) supportInputRef.current.value = "";
  }

  function handleMainSelect(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf") && !(f.type || "").toLowerCase().includes("pdf")) {
      toast.warn("Main file must be a PDF");
      if (mainInputRef.current) mainInputRef.current.value = "";
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.warn("Main file too large. Max 10 MB");
      if (mainInputRef.current) mainInputRef.current.value = "";
      return;
    }
    setMainFile({ file: f });
    if (mainInputRef.current) mainInputRef.current.value = "";
  }

  function triggerMainPicker() {
    mainInputRef.current?.click();
  }

  function removeMain() {
    setMainFile(null);
    if (mainInputRef.current) mainInputRef.current.value = "";
  }

  function handleSupportAdd(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const accepted = [];
    const rejected = [];
    const unsupported = [];
    files.forEach((f) => {
      if (f.size > 10 * 1024 * 1024) {
        rejected.push(f);
        return;
      }
      const name = (f.name || "").toLowerCase();
      const t = (f.type || "").toLowerCase();
      const allowedExt = /\.(pdf|xlsx?|csv|jpg|jpeg|png|gif|webp|bmp|docx?|txt)$/;
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "image/",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const isTypeAllowed =
        allowedTypes.some((a) => (a.endsWith("/") ? t.startsWith(a) : t === a)) || allowedExt.test(name);
      if (!isTypeAllowed) {
        unsupported.push(f);
        return;
      }
      accepted.push(f);
    });
    if (rejected.length) {
      toast.warn(`Some files were rejected (max 10 MB): ${rejected.map((r) => r.name).join(", ")}`);
    }
    if (unsupported.length) {
      toast.warn(`Some files have unsupported formats: ${unsupported.map((r) => r.name).join(", ")}`);
    }
    if (accepted.length) {
      const added = accepted.map((f) => ({
        id: Date.now() + Math.random(),
        file: f,
        type: "receipt",
        status: "pending",
      }));
      setSupportFiles((prev) => [...prev, ...added]);
    }
    if (supportInputRef.current) supportInputRef.current.value = "";
  }

  function triggerSupportPicker() {
    supportInputRef.current?.click();
  }

  function removeSupport(id) {
    setSupportFiles((prev) => prev.filter((s) => s.id !== id));
  }

  function changeSupportType(id, newType) {
    setSupportFiles((prev) => prev.map((s) => (s.id === id ? { ...s, type: newType } : s)));
  }

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result;
        if (typeof base64String === "string") {
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (err) => reject(err);
    });
  }

  async function handleUpload() {
    const valid = validateForm();
    if (!valid) {
      formErrors.forEach((m) => toast.warn(m));
      return;
    }
    if (!mainFile) {
      toast.warn("Please upload main invoice PDF before processing");
      return;
    }
    const finalSupplierId = selectedSupplier || data?.id || data?.supplier_id || data?.id;
    if (!finalSupplierId && showSupplierSelect) {
      toast.warn("Please select a supplier");
      return;
    }

    setUploading(true);
    setUploadStage("invoice");
    try {
      const base64Invoice = await convertFileToBase64(mainFile.file);
      const payload = {
        user_email: user_email,
        action: "upload_invoice_with_supplier",
        supplier_id: Number(finalSupplierId),
        file_content: base64Invoice,
        file_name: mainFile.file.name,
        mime_type: mainFile.file.type || "application/pdf",
      };
      const res = await axiosApi.post(EXTRACTION_API_URL, payload);
      const dataRes = res?.data || {};
      if (!(dataRes.status === "success" || dataRes.invoice_details)) {
        throw new Error(dataRes.error || "Failed to upload invoice");
      }
      const uploadedInvoiceId = dataRes.invoice_details?.invoice_id || dataRes.invoice_id || dataRes.id;
      if (!uploadedInvoiceId) {
        throw new Error("No invoice_id returned from API");
      }
      setInvoiceId(uploadedInvoiceId);
      setUploadStage("documents");

      if (supportFiles.length > 0) {
        for (let i = 0; i < supportFiles.length; i++) {
          const sf = supportFiles[i];
          setSupportFiles((prev) => prev.map((p) => (p.id === sf.id ? { ...p, status: "uploading" } : p)));
          try {
            const base64Doc = await convertFileToBase64(sf.file);
            const docPayload = {
              user_email: user_email,
              action: "upload_supporting_document",
              invoice_id: uploadedInvoiceId,
              document_type: sf.type || "other",
              file_name: sf.file.name,
              file_content: base64Doc,
              mime_type: sf.file.type || "application/octet-stream",
            };
            const docRes = await axiosApi.post(EXTRACTION_API_URL, docPayload);
            const docData = docRes?.data || {};
            if (docData.status === "success") {
              setSupportFiles((prev) => prev.map((p) => (p.id === sf.id ? { ...p, status: "success" } : p)));
            } else {
              setSupportFiles((prev) => prev.map((p) => (p.id === sf.id ? { ...p, status: "error" } : p)));
            }
          } catch (err) {
            console.error("support upload error", err);
            setSupportFiles((prev) => prev.map((p) => (p.id === sf.id ? { ...p, status: "error" } : p)));
          }
        }
      }

      setUploadStage("complete");
      const successCount = supportFiles.filter((f) => f.status === "success").length;
      const totalDocs = supportFiles.length;
      toast.success(
        totalDocs > 0
          ? `Invoice uploaded with ${successCount}/${totalDocs} supporting documents`
          : "Invoice uploaded successfully"
      );
      if (onUploadComplete) {
        resetForm();
        onClose && onClose(false);
        onUploadComplete();
      } else {
        resetForm();
        onClose && onClose(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Upload failed");
      setUploading(false);
      setUploadStage("idle");
    } finally {
      setUploading(false);
    }
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function getStatusIcon(status) {
    switch (status) {
      case "success":
        return <CheckCircle2 size={16} />;
      case "uploading":
        return <Loader2 size={16} className={`${styles.iconLoading} animate-spin`} />;
      case "error":
        return <X className={`text-danger ${styles.iconError}`} size={16} />;
      default:
        return <></>;
    }
  }

  const supplierOptions = suppliersData.map((s) => ({
    label: s.company_name || s.name || `#${s.id}`,
    value: s.id,
  }));

  const isFormValid = formErrors.length === 0 && !!mainFile && !uploading;

  return (
    <OverlayModal
      isActive={isActive}
      onClose={() => {
        onClose && onClose(false);
      }}
      style={{ maxWidth: 800 }}
      modalStyle={{ background: "white" }}
    >
      <div>
        <ThemeLoader show={loader || uploading} />
        <div className={styles.header}>
          <h2>Upload Invoice {supplierName ? `for ${supplierName}` : ""}</h2>
        </div>

        {showSupplierSelect && (
          <div className={styles.section}>
            <label htmlFor="supplier-select" className={styles.label}>
              Select Supplier
            </label>
            <div style={{ marginTop: 6 }}>
              <SelectPicker
                id="supplier-select"
                data={supplierOptions}
                value={selectedSupplier}
                onChange={(val) => {
                  setSelectedSupplier(val);
                }}
                placeholder="-- Select Supplier (optional) --"
                style={{ width: "100%" }}
                searchable
                cleanable
                disabled={uploading}
              />
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <button className={styles.btn} type="button" onClick={() => setAddSupplier(true)}>
                <Plus size={18} />
                Add Supplier
              </button>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Main Invoice PDF *</h3>
          </div>

          {mainFile ? (
            <div className={styles.fileRow}>
              <div className={styles.fileInfo}>
                {React.createElement(fileIconFor(mainFile.file), { className: styles.iconLarge })}
                <div>
                  <p className={styles.filename}>{mainFile.file.name}</p>
                  <p className={styles.filesize}>{formatFileSize(mainFile.file.size)}</p>
                </div>
              </div>
              <div className={styles.rowButtons}>
                {!uploading && (
                  <button type="button" className={styles.iconBtn} onClick={removeMain} aria-label="Remove main file">
                    <X className={styles.iconSmall} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.uploadView} onClick={triggerMainPicker}>
              <div className="text-center">
                <FileText className="text-muted" size={40} />
                <p className={`my-2 text-muted font14`}>Select your invoice PDF file</p>
              </div>
              <div>
                <button type="button" className={styles.btn} disabled={uploading}>
                  <Upload className={styles.iconSmall} /> Choose Invoice PDF
                </button>
                <input
                  ref={mainInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleMainSelect}
                  className={styles.hidden}
                  disabled={uploading}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Supporting Documents (Optional)</h3>
          </div>

          <div className={styles.supportList}>
            {supportFiles.map((s) => {
              const option = SUPPORT_OPTIONS.find((o) => o.value === s.type) || SUPPORT_OPTIONS[1];
              const FileIconComp = fileIconFor(s.file);
              return (
                <div key={s.id} className={styles.supportRow}>
                  <div className={styles.supportLeft}>
                    {React.createElement(FileIconComp, { className: styles.iconSmall })}
                    <div className={styles.supportMeta}>
                      <p className={styles.filename}>{s.file.name}</p>
                      <p className={styles.filesize}>{formatFileSize(s.file.size)}</p>
                    </div>
                  </div>

                  <div className={styles.supportActions}>
                    <div className={styles.typeSelectWrap}>
                      <select
                        className={`form-select ${styles.select}`}
                        value={s.type}
                        onChange={(e) => changeSupportType(s.id, e.target.value)}
                        aria-label="Select document type"
                        disabled={uploading}
                      >
                        {SUPPORT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.emoji} {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {getStatusIcon(s.status)}
                      {!uploading && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => removeSupport(s.id)}
                          aria-label="Remove supporting file"
                        >
                          <X className={styles.iconSmall} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className={styles.addRow}>
              <div />
              <div className={styles.addControls}>
                <button type="button" className={styles.btnOutline} onClick={triggerSupportPicker} disabled={uploading}>
                  <Upload className={styles.iconSmall} /> Add Supporting Document
                </button>
                <input
                  ref={supportInputRef}
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  multiple
                  onChange={handleSupportAdd}
                  className={styles.hidden}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>ℹ️ Supported files: PDF, Excel, Images, Word, CSV, Text | Max: 10 MB per file</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => {
              onClose && onClose(false);
              resetForm();
            }}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={
              isFormValid && !loader
                ? "themeButtonHover themeButton rounded py-2"
                : "themeButtonHover themeButton disabled rounded py-2"
            }
            onClick={handleUpload}
            disabled={!isFormValid || loader || uploading}
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload & Process"}
          </button>
        </div>
      </div>

      <SupplierManagementDialog
        isActive={addSupplier}
        onClose={() => setAddSupplier(false)}
        onSaved={() => fetchSuppliers()}
      />
    </OverlayModal>
  );
}
