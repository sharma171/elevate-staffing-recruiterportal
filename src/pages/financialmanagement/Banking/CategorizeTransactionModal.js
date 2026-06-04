import React, { useEffect, useState, useRef } from "react";
import { Sparkles, X, UserPlus, FileText, Download, Trash2, Upload as UploadIcon, Bot } from "lucide-react";
import { axiosApi, ThemeLoader } from "../../../components";
import styles from "./CategorizeTransactionModal.module.css";
import OverlayModal from "../../../components/OverlayModal";
import { toast } from "react-toastify";

const API_BASE = "https://retrieve-connected-bank-transactions-v3-305451280005.us-east1.run.app";
const EMPLOYEE_LINK_URL = "https://link-employee-to-expenses-v3-305451280005.us-east1.run.app";

const DOCUMENT_TYPES = [
  { value: "receipt", label: "Receipt" },
  { value: "invoice", label: "Invoice" },
  { value: "contract", label: "Contract" },
  { value: "statement", label: "Statement" },
  { value: "proof_of_payment", label: "Proof of Payment" },
  { value: "authorization", label: "Authorization" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENTS = 5;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data || "");
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}

export default function CategorizeTransactionModal({
  isOpen,
  onClose,
  transaction,
  categories = [],
  userEmail,
  onUpdate,
  onSuccess,
}) {
  const [confirmedCategory, setConfirmedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [applyToSimilar, setApplyToSimilar] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [linkedEmployee, setLinkedEmployee] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!transaction) return;
    setConfirmedCategory(transaction.confirmed_category || transaction.suggested_category || "");
    setNotes(transaction.notes || "");
    setApplyToSimilar(true);
    if (transaction.employee_email && transaction.employee_name) {
      setLinkedEmployee({ email: transaction.employee_email, name: transaction.employee_name });
    } else {
      setLinkedEmployee(null);
    }
    setEmployeeSearch("");
    setSearchResults([]);
    loadDocuments();
  }, [transaction]);

  function loadDocuments() {
    if (!transaction) return;
    setLoadingDocuments(true);
    axiosApi
      .get(`${API_BASE}/transactions/${transaction.id}?user_email=${encodeURIComponent(userEmail)}`)
      .then((res) => {
        const resp = res.data || {};
        setDocuments(resp.supporting_documents || []);
        setDocumentCount(resp.supporting_documents_count || (resp.supporting_documents || []).length || 0);
      })
      .catch((err) => {
        console.error("Failed to load documents:", err);
        setDocuments([]);
        setDocumentCount(0);
        toast.warn("Could not load documents. You can still manage the transaction.");
      })
      .finally(() => setLoadingDocuments(false));
  }

  useEffect(() => {
    if (!employeeSearch || employeeSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const id = setTimeout(() => {
      setSearchLoading(true);
      axiosApi
        .post(EMPLOYEE_LINK_URL, {
          action: "search_employees",
          user_email: userEmail,
          search_query: employeeSearch,
        })
        .then((res) => {
          const data = res.data || {};
          if (data && data.status === "success" && Array.isArray(data.employees)) setSearchResults(data.employees);
          else setSearchResults([]);
        })
        .catch((err) => {
          console.error("Employee search failed:", err);
          setSearchResults([]);
          toast.error("Employee search failed");
        })
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [employeeSearch]);

  function handleLinkEmployee(employee) {
    if (!transaction) return;
    setSearchLoading(true);
    axiosApi
      .post(EMPLOYEE_LINK_URL, {
        action: "link",
        user_email: userEmail,
        entity_type: "bank_transaction",
        transaction_id: transaction.id,
        employee_email: employee.email,
      })
      .then(() => {
        setLinkedEmployee({ email: employee.email, name: employee.name });
        setEmployeeSearch("");
        setSearchResults([]);
        toast.success(`Linked to ${employee.name}`);
        onSuccess && onSuccess();
        loadDocuments();
      })
      .catch((err) => {
        console.error("Failed to link employee:", err);
        toast.error("Failed to link employee");
      })
      .finally(() => setSearchLoading(false));
  }

  function handleUnlinkEmployee() {
    if (!transaction) return;
    setSearchLoading(true);
    axiosApi
      .post(EMPLOYEE_LINK_URL, {
        action: "unlink",
        user_email: userEmail,
        entity_type: "bank_transaction",
        transaction_id: transaction.id,
      })
      .then(() => {
        setLinkedEmployee(null);
        toast.success("Employee unlinked");
        onSuccess && onSuccess();
      })
      .catch((err) => {
        console.error("Failed to unlink employee:", err);
        toast.error("Failed to unlink employee");
      })
      .finally(() => setSearchLoading(false));
  }

  function handleSubmit() {
    if (!transaction || !confirmedCategory) return;
    setLoadingUpdate(true);
    const payload = {
      user_email: userEmail,
      confirmed_category: confirmedCategory,
      notes: notes || undefined,
      apply_to_similar: applyToSimilar,
    };

    axiosApi
      .put(`${API_BASE}/transactions/${transaction.id}`, payload)
      .then(() => {
        toast.success("Transaction updated");
        onUpdate?.();
        onClose && onClose();
      })
      .catch((err) => {
        console.error("Error updating transaction:", err);
        toast.error("Could not update transaction");
      })
      .finally(() => setLoadingUpdate(false));
  }

  function onFileSelect(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      toast.error("Please select a file under 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Invalid file type. Supported: PDF, Excel, CSV, Images, Word, Text.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(f);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result || "").split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleUploadDocument() {
    if (!selectedFile || !documentType || !transaction) return;
    setUploading(true);
    fileToBase64(selectedFile)
      .then((base64Content) =>
        axiosApi.post(`${API_BASE}/transactions/documents/upload`, {
          user_email: userEmail,
          transaction_id: transaction.id,
          file_content: base64Content,
          file_name: selectedFile.name,
          mime_type: selectedFile.type,
          document_type: documentType,
          description: description || undefined,
        })
      )
      .then(() => {
        setSelectedFile(null);
        setDocumentType("");
        setDescription("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowUploadPanel(false);
        toast.success("Document uploaded successfully");
        loadDocuments();
      })
      .catch((err) => {
        console.error("Upload failed:", err);
        toast.error("Upload failed. Please try again.");
      })
      .finally(() => setUploading(false));
  }

  function handleDownloadDocument(doc) {
    setLoadingDocuments(true);
    axiosApi
      .post(`${API_BASE}/transactions/documents/${doc.id}`, { user_email: userEmail })
      .then((res) => {
        const resp = res.data || {};

        const blob = b64toBlob(
          resp?.document?.file_content,
          resp?.document?.file_mime_type || "application/octet-stream"
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = resp.file_name || "document";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Document downloaded successfully");
      })
      .catch((err) => {
        console.error("Download failed:", err);
        toast.error("Could not download document. Please try again.");
      })
      .finally(() => setLoadingDocuments(false));
  }

  function confirmDeleteDocument(doc) {
    setDocumentToDelete(doc);
    setDeleteConfirmOpen(true);
  }

  function handleDeleteDocument() {
    if (!documentToDelete) return;
    setDeleting(true);
    axiosApi
      .delete(`${API_BASE}/transactions/documents/${documentToDelete.id}`, { data: { user_email: userEmail } })
      .then(() => {
        toast.success("Document deleted");
        setDeleteConfirmOpen(false);
        setDocumentToDelete(null);
        loadDocuments();
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        toast.error("Could not delete document. Please try again.");
      })
      .finally(() => setDeleting(false));
  }

  const canUpload = documentCount < MAX_DOCUMENTS;
  if (!transaction) return null;
  const hasSuggestion =
    transaction.suggested_category && transaction.suggested_category !== transaction.confirmed_category;

  const globalLoading = loadingDocuments || searchLoading || uploading || deleting || loadingUpdate;

  const renderUploadModal = () => {
    return (
      <div className={`hidemodalclosebtn ${styles.uploadBackdrop}`} onMouseDown={() => setShowUploadPanel(false)}>
        <div className={styles.uploadModal} onMouseDown={(e) => e.stopPropagation()}>
          <button className={styles.uploadClose} onClick={() => setShowUploadPanel(false)}>
            <X />
          </button>
          <div className={styles.popupContent}>
            <div className={styles.popupHeader}>
              <h4 className={styles.uploadTitle}>Upload Document</h4>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>File *</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
              />
              {selectedFile && (
                <div className={styles.smallMuted}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Document Type *</label>
              <select
                className={`inputSolidBorder form-select ${styles.select}`}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description (Optional)</label>
              <textarea
                className={`inputSolidBorder ${styles.textarea}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className={styles.smallMuted}>{description.length}/200</div>
            </div>

            <div className={styles.uploadActions}>
              <button
                className={`hoverActionBTNSML ${styles.btnOutline}`}
                onClick={() => setShowUploadPanel(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleUploadDocument}
                disabled={!selectedFile || !documentType || uploading}
              >
                Upload
              </button>
            </div>

            <ThemeLoader show={uploading} />
          </div>
        </div>
      </div>
    );
  };

  let isCredit = transaction.transaction_type === "credit";

  return (
    <>
      <OverlayModal
        isActive={isOpen}
        onClose={onClose}
        style={{ maxWidth: "800px" }}
        modalStyle={{ background: "#fff" }}
      >
        <div className={styles.header}>
          <div className="h4 fw-bold">Categorize Transaction</div>
        </div>

        <div className={styles.content}>
          <div className={styles.details}>
            <div>
              <div className={styles.desc}>{transaction.description}</div>
              <div className={styles.date}>{new Date(transaction.transaction_date).toLocaleDateString()}</div>
            </div>
            <div className={styles.amount}>
              <div className={`${isCredit ? "text-success" : "text-danger"} ${styles.amountVal}`}>
                {isCredit ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <div className={`${isCredit ? "activeBadge" : "inactiveBadge"} ${styles.typeBadge}`}>
                {transaction.transaction_type}
              </div>
            </div>
          </div>

          {hasSuggestion && (
            <div className={styles.suggestion}>
              <div>
                <div className={styles.suggestionTitle}>
                  <Bot size={12} /> AI Suggested Category
                </div>
                <div className={styles.suggestionBadge}>{transaction.suggested_category}</div>
                {transaction.categorization_reasoning && (
                  <div className={styles.reason}>{transaction.categorization_reasoning}</div>
                )}
                {transaction.categorization_confidence > 0 && (
                  <div className={styles.confidence}>
                    Confidence: {(transaction.categorization_confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <button
                className={styles.useBtn}
                onClick={() => setConfirmedCategory(transaction.suggested_category || "")}
              >
                Use This
              </button>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Category *</label>
            <select
              className={"form-select inputSolidBorder"}
              value={confirmedCategory}
              onChange={(e) => setConfirmedCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c.code}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Link to Employee (Optional)</label>
            {linkedEmployee ? (
              <div className={styles.linked}>
                <div className={styles.linkLeft}>
                  <UserPlus className={styles.userIcon} />
                  <div>
                    <div className={styles.empName}>{linkedEmployee.name}</div>
                    <div className={styles.empEmail}>{linkedEmployee.email}</div>
                  </div>
                </div>
                <button className={styles.unlinkBtn} onClick={handleUnlinkEmployee} disabled={searchLoading}>
                  Unlink
                </button>
              </div>
            ) : (
              <div>
                <input
                  className="form-control inputSolidBorder"
                  placeholder="Search employees by name or email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
                {searchLoading && (
                  <div className={styles.smallMuted}>
                    <ThemeLoader size={14} />
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className={styles.searchList}>
                    {searchResults.map((emp) => (
                      <button
                        key={emp.email}
                        className={styles.searchItem}
                        onClick={() => handleLinkEmployee(emp)}
                        disabled={searchLoading}
                      >
                        <div className={styles.empName}>{emp.name}</div>
                        <div className={styles.empEmail}>{emp.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Apply to Similar Transactions</label>
            <div className={styles.row}>
              <div className={styles.smallText}>
                Automatically categorize future transactions with similar descriptions
              </div>
              <input type="checkbox" checked={applyToSimilar} onChange={(e) => setApplyToSimilar(e.target.checked)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes (Optional)</label>
            <textarea
              className={`form-control inputSolidBorder ${styles.textarea}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {!loadingDocuments && (
            <div className={styles.docsRoot}>
              <div className="d-flex gap-2 justify-content-between">
                <div className={styles.docsTitle}>
                  Supporting Documents ({documentCount}/{MAX_DOCUMENTS})
                </div>
                <button
                  className="themeButton themeButtonHover p-2 rounded"
                  onClick={() => setShowUploadPanel(true)}
                  disabled={!canUpload}
                >
                  <UploadIcon className={styles.iconSmall} /> Upload
                </button>
              </div>

              {documents.length === 0 ? (
                <div className={styles.docsEmpty}>
                  <FileText className={styles.fileIcon} /> <div>No documents attached</div>
                </div>
              ) : (
                <div className={styles.docsList}>
                  {documents.map((doc) => (
                    <div key={doc.id} className={styles.docRow}>
                      <div className={styles.docInfo}>
                        <div className={styles.docFilename}>{doc.file_name || "Unknown file"}</div>
                        <div className={styles.docSize}>{doc.file_size_display || `${doc.file_size || 0} bytes`}</div>
                        {doc.description && <div className={styles.docDesc}>{doc.description}</div>}
                      </div>
                      <button
                        className={styles.docBtn}
                        onClick={() => handleDownloadDocument(doc)}
                        title="Download"
                        disabled={loadingDocuments}
                      >
                        <Download className={styles.iconSmall} />
                      </button>
                      <button
                        className={styles.docDelete}
                        onClick={() => confirmDeleteDocument(doc)}
                        title="Delete"
                        disabled={deleting}
                      >
                        <Trash2 className={styles.iconSmall} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showUploadPanel && renderUploadModal()}

        <div className={styles.footer}>
          <button className={styles.btnOutline} onClick={onClose} disabled={globalLoading}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={!confirmedCategory || globalLoading}>
            Update Category
          </button>
        </div>

        {deleteConfirmOpen && (
          <div className={`hidemodalclosebtn ${styles.deleteBackdrop}`}>
            <div className={styles.deleteModal}>
              <div className={styles.deleteTitle}>Delete Document</div>
              <div className={styles.smallMuted}>
                Are you sure you want to delete "{documentToDelete?.file_name}"? This cannot be undone.
              </div>
              <div className={styles.uploadActions} style={{ marginTop: 12 }}>
                <button className={styles.btnOutline} onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
                  Cancel
                </button>
                <button className={styles.btnPrimary} onClick={handleDeleteDocument} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        <ThemeLoader show={globalLoading} />
      </OverlayModal>
    </>
  );
}
