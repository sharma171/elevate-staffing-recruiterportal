import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  X,
  Loader2,
  MoreHorizontal,
  Pencil,
  FileEdit,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Image,
} from "lucide-react";

// ─── Document Type Constants ───────────────────────────────────────────────────

const COMMON_DOCUMENTS = [
  { code: "passport", name: "Passport", required: true },
  { code: "visa_stamp", name: "Visa Stamp", required: false },
  { code: "i94", name: "I-94", required: true },
];
const H1B_DOCUMENTS = [
  { code: "h1b_approval", name: "H1B Approval (I-797)", required: true },
  { code: "lca", name: "LCA (ETA-9035)", required: true },
  { code: "petition_receipt", name: "Petition Receipt", required: false },
];
const OPT_DOCUMENTS = [
  { code: "i20", name: "I-20", required: true },
  { code: "ead_card", name: "EAD Card", required: true },
  { code: "i983", name: "I-983 Training Plan", required: false },
];
const H4_DOCUMENTS = [
  { code: "h4_approval", name: "H4 Approval (I-797)", required: true },
  { code: "h4_ead_card", name: "H4 EAD Card", required: false },
  { code: "marriage_certificate", name: "Marriage Certificate", required: false },
];
const GC_DOCUMENTS = [
  { code: "gc_card", name: "Green Card", required: true },
  { code: "i140_approval", name: "I-140 Approval", required: false },
  { code: "i485_approval", name: "I-485 Approval", required: false },
];
const L1_DOCUMENTS = [
  { code: "l1_approval", name: "L1 Approval (I-797)", required: true },
  { code: "l1_blanket", name: "L1 Blanket Petition", required: false },
];

const GENERAL_DOC_TYPES = [
  { code: "resume", name: "Resume" },
  { code: "driver_license", name: "Driver's License" },
  { code: "ssn_card", name: "SSN Card" },
  { code: "offer_letter", name: "Offer Letter" },
  { code: "employment_contract", name: "Employment Contract" },
  { code: "pay_stubs", name: "Pay Stubs" },
  { code: "w2_form", name: "W2 Form" },
  { code: "passport", name: "Passport" },
  { code: "visa_stamp", name: "Visa Stamp" },
  { code: "i94", name: "I-94" },
  { code: "i20", name: "I-20" },
  { code: "ead_card", name: "EAD Card" },
  { code: "h1b_approval", name: "H1B Approval (I-797)" },
  { code: "lca", name: "LCA (ETA-9035)" },
  { code: "gc_card", name: "Green Card" },
  { code: "i140_approval", name: "I-140 Approval" },
  { code: "i485_approval", name: "I-485 Approval" },
  { code: "degree_certificate", name: "Degree Certificate" },
  { code: "transcripts", name: "Transcripts" },
  { code: "birth_certificate", name: "Birth Certificate" },
  { code: "marriage_certificate", name: "Marriage Certificate" },
  { code: "general_other", name: "Other" },
];

const PARSEABLE_DOCUMENT_TYPES = [
  { code: "passport", name: "Passport", apiType: "passport" },
  { code: "i94", name: "I-94", apiType: "i94" },
  { code: "visa_stamp", name: "Visa Stamp", apiType: "visa_stamp" },
  { code: "i797", name: "I-797 Approval Notice", apiType: "i797" },
  { code: "ead_card", name: "EAD Card", apiType: "ead_card" },
  { code: "i20", name: "I-20", apiType: "i20" },
  { code: "green_card", name: "Green Card", apiType: "gc_card" },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

const ALL_DOC_TYPES_MAP = GENERAL_DOC_TYPES.reduce((acc, t) => {
  acc[t.code] = t.name;
  return acc;
}, {});

function getDocumentTypeName(code) {
  if (!code || code === "other" || code === "immigration") return "Other Document";
  if (ALL_DOC_TYPES_MAP[code]) return ALL_DOC_TYPES_MAP[code];
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getExpiryStatus(dateStr) {
  if (!dateStr) return "valid";
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 90) return "expiring";
  return "valid";
}

function formatDocumentDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ─── API Stubs (replace with your real implementations) ───────────────────────

async function downloadDocumentAPI(candidateEmail, fileName) {
  const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "download-document",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      file_name: fileName,
    }),
  });
  return response.json();
}

async function deleteDocumentAPI(candidateEmail, fileName) {
  const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "delete-document",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      file_name: fileName,
    }),
  });
  return response.json();
}

async function updateDocumentMetadataAPI(candidateEmail, rowId, updates) {
  const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "update-document",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      row_id: rowId,
      ...updates,
    }),
  });
  return response.json();
}

async function uploadDocumentAPI(candidateEmail, file, metadata) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("employee_email", candidateEmail);
  formData.append("emailid", "marketing@4spheresolutions.com");
  Object.entries(metadata).forEach(([k, v]) => v !== undefined && formData.append(k, v));
  const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

// ─── Toast Hook (lightweight fallback) ────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = "default" }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  return { toast, toasts };
}

// ─── Toast Renderer ────────────────────────────────────────────────────────────

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm border ${
            t.variant === "destructive"
              ? "bg-red-50 border-red-300 text-red-800"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-xs mt-0.5 opacity-80">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Document Viewer Modal ─────────────────────────────────────────────────────

function DocumentViewerModal({ open, onOpenChange, document, onDownload, isLoading }) {
  if (!open) return null;
  if (!document && !isLoading) return null;

  const isPDF = document?.type === "application/pdf" || document?.name?.endsWith(".pdf");
  const isImage =
    document?.type?.startsWith("image/") ||
    document?.name?.endsWith(".jpg") ||
    document?.name?.endsWith(".jpeg") ||
    document?.name?.endsWith(".png");

  const getDisplayUrl = () => {
    if (!document) return null;
    if (document.url) return document.url;
    if (document.base64) {
      const mimeType = isPDF ? "application/pdf" : document.type;
      return `data:${mimeType};base64,${document.base64}`;
    }
    return null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2 font-semibold truncate">
            {isPDF ? <FileText className="h-5 w-5 shrink-0" /> : <Image className="h-5 w-5 shrink-0" />}
            <span className="truncate">{document?.name || "Document"}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={onDownload}
              disabled={isLoading || !displayUrl}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden rounded-b-xl bg-gray-50">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin" />
                <p>Loading document...</p>
              </div>
            </div>
          ) : displayUrl ? (
            isPDF ? (
              <iframe src={displayUrl} className="w-full h-full border-0" title={document?.name} />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={displayUrl} alt={document?.name} className="max-w-full max-h-full object-contain rounded" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p>Preview not available for this file type</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p>Document preview not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Document Modal ───────────────────────────────────────────────────────

function EditDocumentModal({ open, onOpenChange, document, documentTypes, onSave, isSaving }) {
  const [docType, setDocType] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [empView, setEmpView] = useState(true);

  useEffect(() => {
    if (document) {
      setDocType(document.doc_type || "");
      setDescription(document.file_desc || document.doc_name || "");
      setValidFrom(document.valid_from || document.doc_validfrom || "");
      setExpiryDate(document.expiry_date || document.doc_expiry || "");
      setEmpView(document.emp_view !== false);
    }
  }, [document]);

  if (!open || !document) return null;

  const handleSave = () =>
    onSave({
      doc_type: docType,
      file_desc: description,
      doc_validfrom: validFrom || undefined,
      doc_expiry: expiryDate || undefined,
      emp_view: empView,
    });

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 font-semibold text-base">
            <Pencil className="h-5 w-5" /> Edit Document
          </div>
          <p className="text-sm text-gray-500 mt-1">Update metadata for "{document.doc_name || document.file_name}"</p>
        </div>
        <div className="p-5 space-y-4">
          {/* Document Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select document type</option>
              {documentTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Enter document description..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          {/* Valid From */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Valid From</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Expiry Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Visible to Employee */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="emp-view"
              checked={empView}
              onChange={(e) => setEmpView(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="emp-view" className="text-sm cursor-pointer">
              Visible to Employee
            </label>
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rename Document Modal ─────────────────────────────────────────────────────

function RenameDocumentModal({ open, onOpenChange, document: doc, onRename, isRenaming }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (doc) {
      const fileName = doc.file_name || doc.doc_name || "";
      const lastDot = fileName.lastIndexOf(".");
      setNewName(lastDot > 0 ? fileName.substring(0, lastDot) : fileName);
      setError("");
    }
  }, [doc]);

  if (!open || !doc) return null;

  const getExt = () => {
    const fileName = doc?.file_name || doc?.doc_name || "";
    const lastDot = fileName.lastIndexOf(".");
    return lastDot > 0 ? fileName.substring(lastDot) : "";
  };

  const handleRename = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("File name cannot be empty");
      return;
    }
    if (/[<>:"/\\|?*]/.test(trimmed)) {
      setError("File name contains invalid characters");
      return;
    }
    await onRename(trimmed + getExt());
  };

  const ext = getExt();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => {
        setError("");
        onOpenChange(false);
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 font-semibold text-base">
            <FileEdit className="h-5 w-5" /> Rename Document
          </div>
          <p className="text-sm text-gray-500 mt-1">Enter a new name for this document</p>
        </div>
        <div className="p-5 space-y-2">
          <label className="text-sm font-medium">New File Name</label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && !isRenaming && handleRename()}
              placeholder="Enter file name"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {ext && (
              <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-2 rounded-lg shrink-0">{ext}</span>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button
            onClick={() => {
              setError("");
              onOpenChange(false);
            }}
            disabled={isRenaming}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={isRenaming || !newName.trim()}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isRenaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Renaming...
              </>
            ) : (
              "Rename"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ open, onOpenChange, document: doc, onConfirm, isDeleting }) {
  if (!open || !doc) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b">
          <div className="font-semibold text-base">Delete Document</div>
        </div>
        <div className="p-5 text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900">"{doc.doc_name || doc.file_name}"</span>? This action cannot be
          undone.
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Document Modal ─────────────────────────────────────────────────────

function UploadDocumentModal({
  open,
  onOpenChange,
  documentTypes,
  candidateEmail,
  section = "general",
  onSuccess,
  onUpload,
}) {
  const { toast, toasts } = useToast();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isResume, setIsResume] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload PDF, JPG, or PNG", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocType("");
    setDescription("");
    setValidFrom("");
    setExpiryDate("");
    setIsResume(false);
    onOpenChange(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !docType) {
      toast({
        title: "Missing information",
        description: "Please select a file and document type",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      if (candidateEmail) {
        const metadata = {
          doc_type: docType,
          doc_category: section,
          file_desc: description || undefined,
          doc_validfrom: validFrom || undefined,
          doc_expiry: expiryDate || undefined,
          is_resume: isResume ? "yes" : "no",
        };
        const response = await uploadDocumentAPI(candidateEmail, selectedFile, metadata);
        if (!response.success) throw new Error(response.error || "Upload failed");
        toast({ title: "Document uploaded", description: "Uploaded successfully" });
        onSuccess?.();
      } else if (onUpload) {
        await onUpload(selectedFile, docType, expiryDate || undefined);
        toast({ title: "Document uploaded", description: "Uploaded successfully" });
      }
      handleClose();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b">
            <div className="flex items-center gap-2 font-semibold text-base">
              <Upload className="h-5 w-5" /> Upload Immigration Document
            </div>
            <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, JPG, PNG (max 10MB)</p>
          </div>
          <div className="p-5 space-y-4">
            {/* File Drop Zone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Document File *</label>
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 hover:bg-gray-200 rounded shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to select or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Document Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select document type</option>
                {documentTypes.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Enter document description (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Valid From</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Is Resume */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-resume-up"
                checked={isResume}
                onChange={(e) => setIsResume(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is-resume-up" className="text-sm cursor-pointer">
                This is a resume/CV
              </label>
            </div>
          </div>

          <div className="p-5 border-t flex justify-end gap-2">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !docType || uploading}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Smart Upload Document Modal ───────────────────────────────────────────────

function SmartUploadDocumentModal({
  open,
  onOpenChange,
  candidateEmail,
  candidateId,
  onUploadComplete,
  onDataExtracted,
}) {
  const { toast, toasts } = useToast();
  const fileInputRef = useRef(null);
  const [state, setState] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTypeHint, setDocTypeHint] = useState("auto");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload PDF, JPG, or PNG", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  const handleParseDocument = async () => {
    if (!selectedFile) return;
    setState("uploading");
    setProgress(10);
    try {
      setState("parsing");
      setProgress(30);
      const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 500);

      // Simulate AI parse — replace with your real parseDocument API call
      await new Promise((r) => setTimeout(r, 2000));
      clearInterval(interval);
      setProgress(100);

      // Mock parsed data — replace with actual API response
      setParsedData({
        document_type: docTypeHint !== "auto" ? docTypeHint : "passport",
        document_type_confidence: 0.95,
        extracted_data: {},
        needs_review: false,
        review_fields: [],
      });
      setState("review");
    } catch (err) {
      setError({ code: "NETWORK_ERROR", message: err.message || "Network error. Please try again." });
      setState("error");
    }
  };

  const handleSaveExtractedData = async (editedData = {}) => {
    if (!parsedData || !selectedFile) return;
    setState("saving");
    try {
      const newDoc = {
        document_id: `new-${Date.now()}`,
        doc_type: parsedData.document_type.toUpperCase(),
        doc_name: selectedFile.name,
        file_name: selectedFile.name,
        file_path: `/documents/immigration/${selectedFile.name}`,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        status: "uploaded",
        uploaded_at: new Date().toISOString(),
        uploaded_by: "Current User",
        expiry_date: editedData.expiry_date?.value || editedData.card_expires?.value,
        document_number:
          editedData.passport_number?.value ||
          editedData.card_number?.value ||
          editedData.receipt_number?.value ||
          editedData.i94_number?.value,
      };
      if (onDataExtracted) onDataExtracted(parsedData.document_type, editedData);
      onUploadComplete(newDoc, editedData);
      toast({ title: "Document saved", description: "Data extracted and saved successfully" });
      handleClose();
    } catch {
      toast({ title: "Save failed", description: "Failed to save. Please try again.", variant: "destructive" });
      setState("review");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocTypeHint("auto");
    setParsedData(null);
    setError(null);
    setState("idle");
    setProgress(0);
    onOpenChange(false);
  };

  if (!open) return null;

  const renderContent = () => {
    if (state === "uploading" || state === "parsing") {
      return (
        <div className="py-8 space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium">
                {state === "uploading" ? "Uploading document..." : "AI is analyzing your document..."}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {state === "parsing" ? "Extracting fields and validating data" : "Please wait"}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );
    }

    if (state === "saving") {
      return (
        <div className="py-8 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <p className="font-medium">Saving to profile...</p>
        </div>
      );
    }

    if (state === "review" && parsedData) {
      return (
        <div className="py-4 space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <CheckCircle className="h-4 w-4 inline mr-1.5" />
            Document parsed successfully as <strong>{parsedData.document_type.replace(/_/g, " ").toUpperCase()}</strong>
          </div>
          <p className="text-sm text-gray-500">Review the extracted data before saving to the profile.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => handleSaveExtractedData({})}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" /> Save Document
            </button>
          </div>
        </div>
      );
    }

    if (state === "error") {
      return (
        <div className="py-4 space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{error?.message}</p>
              {error?.code && <p className="text-xs mt-1 opacity-70">Error code: {error.code}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => {
                setError(null);
                setState("idle");
                setProgress(0);
              }}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    // Idle state
    return (
      <div className="space-y-4 py-4">
        {/* File Drop */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Document File</label>
          {selectedFile ? (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm truncate">{selectedFile.name}</span>
                <span className="text-xs text-gray-400 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1 hover:bg-gray-200 rounded shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to select or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Doc Type Hint */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Document Type <span className="text-xs text-gray-400 font-normal ml-1">Leave empty for auto-detection</span>
          </label>
          <select
            value={docTypeHint}
            onChange={(e) => setDocTypeHint(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="auto">Auto-detect</option>
            {PARSEABLE_DOCUMENT_TYPES.map((t) => (
              <option key={t.code} value={t.apiType}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Info */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
          <span>
            <span className="font-medium text-purple-800">Smart Upload:</span>{" "}
            <span className="text-purple-700">
              AI will automatically extract fields from your document. You'll review and confirm before saving.
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleParseDocument}
            disabled={!selectedFile}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Parse & Extract
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b">
            <div className="flex items-center gap-2 font-semibold text-base">
              <Upload className="h-5 w-5" />
              {state === "review" || state === "saving" ? "Review Extracted Data" : "Smart Upload Document"}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {state === "review" || state === "saving"
                ? "Review and edit the extracted fields before saving to profile"
                : "AI-powered data extraction. Supported: PDF, JPG, PNG (max 10MB)"}
            </p>
          </div>
          <div className="p-5">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}

// ─── Expiry Badge ──────────────────────────────────────────────────────────────

function ExpiryBadge({ dateStr }) {
  const status = getExpiryStatus(dateStr);
  if (status === "expired")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        Expired
      </span>
    );
  if (status === "expiring")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
        Expiring Soon
      </span>
    );
  return null;
}

// ─── Dropdown Menu ─────────────────────────────────────────────────────────────

function ActionDropdown({ doc, isFullAccess, isLoading, onView, onDownload, onEdit, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isLoading}
        className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-lg disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-20 py-1 text-sm">
          <button
            onClick={() => {
              onView(doc);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" /> View
          </button>
          <button
            onClick={() => {
              onDownload(doc);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          {isFullAccess && (
            <>
              <div className="border-t my-1" />
              <button
                onClick={() => {
                  onEdit(doc);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => {
                  onRename(doc);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <FileEdit className="h-4 w-4" /> Rename
              </button>
              <button
                onClick={() => {
                  onDelete(doc);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main DocumentImmigration Component ───────────────────────────────────────

function DocumentImmigration({ candidateDetails, immigrationData, isEditMode, getImmigrationInfo }) {
  const { toast, toasts } = useToast();

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [smartUploadModalOpen, setSmartUploadModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);

  const isFullAccess = true; // Adjust based on your access level logic

  // Get visa type
  const visaType = useMemo(
    () =>
      immigrationData?.data?.candidate?.visa_type_current ||
      immigrationData?.data?.candidate?.visa_status ||
      candidateDetails?.visa_status ||
      "OTHER",
    [immigrationData, candidateDetails],
  );

  // Get required docs by visa type
  const getRequiredDocuments = () => {
    const common = [...COMMON_DOCUMENTS];
    switch (visaType) {
      case "H1B":
      case "H1B1":
        return [...common, ...H1B_DOCUMENTS];
      case "OPT":
      case "STEM_OPT":
      case "F1":
      case "CPT":
        return [...common, ...OPT_DOCUMENTS];
      case "H4":
      case "H4_EAD":
        return [...common, ...H4_DOCUMENTS];
      case "GC":
        return [...common, ...GC_DOCUMENTS];
      case "L1A":
      case "L1B":
        return [...common, ...L1_DOCUMENTS];
      default:
        return common;
    }
  };

  // Map documents from immigrationData
  const documents = useMemo(() => {
    if (!immigrationData?.data?.documents) return [];
    return immigrationData.data.documents.map((doc) => ({
      document_id: doc.id?.toString() || `doc-${Date.now()}`,
      row_id: doc.id,
      doc_type: doc.immigration_doc_type || "other",
      doc_type_label: doc.immigration_doc_type ? getDocumentTypeName(doc.immigration_doc_type) : "Other Document",
      doc_name: doc.file_name,
      file_name: doc.file_name,
      file_path: doc.file_path,
      file_size: 0,
      mime_type: doc.file_name?.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      status: doc.doc_status === "Valid" ? "verified" : doc.doc_status === "Expired" ? "expired" : "uploaded",
      expiry_date: doc.doc_expiry || undefined,
      doc_expiry: doc.doc_expiry || undefined,
      valid_from: doc.doc_validfrom || undefined,
      doc_validfrom: doc.doc_validfrom || undefined,
      document_number: doc.document_number || undefined,
      uploaded_by: "User",
      uploaded_at: doc.fileuploaded_datetime || new Date().toISOString(),
      verified_by: doc.verified_by,
      verified_at: doc.verified_at,
      rejection_reason: doc.rejection_reason,
      emp_view: true,
    }));
  }, [immigrationData]);

  // Missing required docs
  const missingRequired = useMemo(() => {
    const uploaded = new Set(documents.map((d) => d.doc_type));
    return getRequiredDocuments().filter((d) => d.required && !uploaded.has(d.code));
  }, [documents, visaType]);

  // Stats
  const stats = useMemo(
    () => ({
      total: documents.length,
      verified: documents.filter((d) => d.status === "verified").length,
      pending: documents.filter((d) => d.status === "uploaded").length,
      missing: missingRequired.length,
    }),
    [documents, missingRequired],
  );

  const candidateEmail =
    candidateDetails?.primary_email || candidateDetails?.secondary_email || candidateDetails?.original_email;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleView = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) {
      toast({ title: "Error", description: "Document filename not found", variant: "destructive" });
      return;
    }
    setLoadingDocId(doc.document_id);
    setViewerLoading(true);
    try {
      const response = await downloadDocumentAPI(candidateEmail, fileName);
      if (!response.success || !response.files?.length) throw new Error(response.error || "Document not found");
      const file = response.files[0];
      setViewerDoc({
        name: fileName,
        type: doc.mime_type || "application/pdf",
        url: file.file_url,
        base64: file.base64,
      });
      setViewerOpen(true);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to load document", variant: "destructive" });
    } finally {
      setLoadingDocId(null);
      setViewerLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) return;
    setLoadingDocId(doc.document_id);
    try {
      const response = await downloadDocumentAPI(candidateEmail, fileName);
      if (!response.success || !response.files?.length) throw new Error(response.error || "Document not found");
      const file = response.files[0];
      if (file.file_url) {
        window.open(file.file_url, "_blank");
      } else if (file.base64) {
        const link = document.createElement("a");
        link.href = `data:${doc.mime_type || "application/octet-stream"};base64,${file.base64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({ title: "Download Started", description: `Downloading ${fileName}...` });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to download", variant: "destructive" });
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleEditSave = async (updates) => {
    if (!editingDoc) return;
    setIsSaving(true);
    try {
      const rowId = editingDoc.row_id || parseInt(editingDoc.document_id);
      if (!rowId) throw new Error("Document ID not found");
      const response = await updateDocumentMetadataAPI(candidateEmail, rowId, updates);
      if (!response.success) throw new Error(response.error || "Failed to update document");
      toast({ title: "Success", description: "Document updated successfully" });
      setEditingDoc(null);
      await getImmigrationInfo();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to update document", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameSave = async (newName) => {
    if (!renameDoc) return;
    setIsRenaming(true);
    try {
      const rowId = renameDoc.row_id || parseInt(renameDoc.document_id);
      const response = await updateDocumentMetadataAPI(candidateEmail, rowId, { file_name: newName });
      if (!response.success) throw new Error(response.error || "Failed to rename");
      toast({ title: "Success", description: "Document renamed successfully" });
      setRenameDoc(null);
      await getImmigrationInfo();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to rename document", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    const fileName = deleteDoc.file_name || deleteDoc.doc_name;
    if (!fileName) return;
    setIsDeleting(true);
    try {
      const response = await deleteDocumentAPI(candidateEmail, fileName);
      if (!response.success) throw new Error(response.error || "Failed to delete");
      toast({ title: "Success", description: "Document deleted successfully" });
      setDeleteDoc(null);
      await getImmigrationInfo();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to delete document", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSmartUploadComplete = (newDoc, extractedData) => {
    // if (extractedData && onDataExtracted && newDoc.doc_type) {
    //   onDataExtracted(newDoc.doc_type.toLowerCase(), extractedData); // ✅ no longer undefined
    // }
    getImmigrationInfo();
  };

  // ── Card sub-components ───────────────────────────────────────────────────────
  const Card = ({ children, className = "" }) => (
    <div className={`border rounded-lg bg-white shadow-sm ${className}`}>{children}</div>
  );
  const CardHeader = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
  const CardTitle = ({ children, className = "" }) => <div className={`font-semibold ${className}`}>{children}</div>;
  const CardContent = ({ children, className = "" }) => <div className={`px-4 pb-4 ${className}`}>{children}</div>;
  const Badge = ({ children, variant = "default", className = "" }) => {
    const base =
      variant === "outline" ? "bg-white border-gray-300 text-gray-700" : "bg-gray-100 text-gray-800 border-gray-300";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${base} ${className}`}
      >
        {children}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 Interfont">
      <ToastContainer toasts={toasts} />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Missing Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Missing Required Docs Alert ── */}
      {missingRequired.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Missing Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingRequired.map((doc) => (
                <Badge key={doc.code} variant="outline" className="bg-white">
                  {doc.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Documents Section ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Immigration Documents
            </CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">Uploaded documents and their verification status</p>
          </div>
          {isEditMode && candidateEmail && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" /> Simple Upload
              </button>
              <button
                onClick={() => setSmartUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4" /> Smart Upload
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4 px-0">
          {!candidateEmail ? (
            <div className="text-center py-8 text-gray-500 px-4">
              Candidate email not available. Cannot load documents.
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">No documents uploaded yet</p>
              {isEditMode && (
                <button
                  onClick={() => setSmartUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Upload className="h-4 w-4" /> Upload First Document
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Document</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Valid From
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Expiry</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documents.map((doc) => {
                    const expiryStatus = getExpiryStatus(doc.expiry_date || doc.doc_expiry);
                    const isLoading = loadingDocId === doc.document_id;
                    return (
                      <tr
                        key={doc.document_id}
                        className={`hover:bg-gray-50 transition-colors ${
                          expiryStatus === "expired"
                            ? "bg-red-50/50"
                            : expiryStatus === "expiring"
                              ? "bg-orange-50/50"
                              : ""
                        }`}
                      >
                        {/* Document name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="font-medium truncate max-w-[200px]" title={doc.doc_name || doc.file_name}>
                              {doc.doc_name || doc.file_name}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">
                            {doc.doc_type_label ||
                              (doc.doc_type && doc.doc_type !== "other" && doc.doc_type !== "immigration"
                                ? getDocumentTypeName(doc.doc_type)
                                : "Other Document")}
                          </span>
                        </td>

                        {/* Valid From */}
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {formatDocumentDate(doc.valid_from || doc.doc_validfrom)}
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm ${
                                expiryStatus === "expired"
                                  ? "text-red-700 font-medium"
                                  : expiryStatus === "expiring"
                                    ? "text-orange-600 font-medium"
                                    : "text-gray-600"
                              }`}
                            >
                              {formatDocumentDate(doc.expiry_date || doc.doc_expiry)}
                            </span>
                            <ExpiryBadge dateStr={doc.expiry_date || doc.doc_expiry} />
                          </div>
                        </td>

                        {/* Actions dropdown */}
                        <td className="px-4 py-3">
                          <ActionDropdown
                            doc={doc}
                            isFullAccess={isFullAccess && isEditMode}
                            isLoading={isLoading}
                            onView={handleView}
                            onDownload={handleDownload}
                            onEdit={setEditingDoc}
                            onRename={setRenameDoc}
                            onDelete={setDeleteDoc}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── All Modals ── */}
      <DocumentViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        document={viewerDoc}
        onDownload={() => viewerDoc?.url && window.open(viewerDoc.url, "_blank")}
        isLoading={viewerLoading}
      />
      <EditDocumentModal
        open={!!editingDoc}
        onOpenChange={(o) => !o && setEditingDoc(null)}
        document={editingDoc}
        documentTypes={GENERAL_DOC_TYPES}
        onSave={handleEditSave}
        isSaving={isSaving}
      />
      <RenameDocumentModal
        open={!!renameDoc}
        onOpenChange={(o) => !o && setRenameDoc(null)}
        document={renameDoc}
        onRename={handleRenameSave}
        isRenaming={isRenaming}
      />
      <DeleteConfirmModal
        open={!!deleteDoc}
        onOpenChange={(o) => !o && setDeleteDoc(null)}
        document={deleteDoc}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        documentTypes={GENERAL_DOC_TYPES}
        candidateEmail={candidateEmail}
        section="general"
        onSuccess={async () => {
          setUploadModalOpen(false);
          await getImmigrationInfo();
        }}
      />
      <SmartUploadDocumentModal
        open={smartUploadModalOpen}
        onOpenChange={setSmartUploadModalOpen}
        candidateEmail={candidateEmail || ""}
        onUploadComplete={handleSmartUploadComplete}
        // onDataExtracted={onDataExtracted} // ✅ pass through from props
      />
    </div>
  );
}

export default DocumentImmigration;
