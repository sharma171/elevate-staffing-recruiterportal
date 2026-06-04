import React, { useState, useMemo, useRef } from "react";
import {
  History,
  ArrowRight,
  FileText,
  Plus,
  X,
  Trash2,
  Download,
  Eye,
  Pencil,
  FileEdit,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Upload,
  Plane,
  RefreshCw,
  Building2,
  FileCheck,
  CreditCard,
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// ==================== CONSTANTS ====================

const EVENT_CONFIG = {
  initial_entry: {
    icon: Plane,
    title: "Initial Entry",
    description: "First entry to the US on this visa",
    fields: ["event_date", "visa_type", "port_of_entry"],
    labels: { visa_type: "Entry Visa Type" },
  },
  status_change: {
    icon: RefreshCw,
    title: "Status Change",
    description: "Changed from one visa to another (e.g., F1 → H1B)",
    fields: [
      "event_date",
      "from_visa_type",
      "to_visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: {
      from_visa_type: "From Visa Type",
      to_visa_type: "New Visa Type",
      employer: "New Employer",
    },
  },
  transfer: {
    icon: Building2,
    title: "Transfer",
    description: "Same visa type, different employer",
    fields: [
      "event_date",
      "visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: {
      visa_type: "Visa Type",
      employer: "New Employer",
    },
  },
  extension: {
    icon: FileCheck,
    title: "Extension",
    description: "Extended same visa with same employer",
    fields: [
      "event_date",
      "visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: {
      visa_type: "Visa Type",
      employer: "Employer",
      validity_end: "New Validity End",
    },
  },
  amendment: {
    icon: FileCheck,
    title: "Amendment",
    description: "Changed job duties, location, or wage",
    fields: ["event_date", "visa_type", "employer", "change_type", "receipt_number", "approval_date"],
    labels: {
      visa_type: "Visa Type",
      change_type: "Type of Change",
    },
  },
  ead_issued: {
    icon: CreditCard,
    title: "EAD Issued",
    description: "Received EAD card",
    fields: ["event_date", "ead_category", "card_number", "validity_start", "validity_end"],
    labels: {
      ead_category: "EAD Category",
      card_number: "Card Number",
    },
  },
  gc_stage: {
    icon: Award,
    title: "Green Card Stage",
    description: "Green card process milestone",
    fields: ["event_date", "gc_stage", "receipt_number", "approval_date", "employer"],
    labels: {
      gc_stage: "Stage",
      employer: "Sponsoring Employer",
    },
  },
  other: {
    icon: History,
    title: "Other Event",
    description: "Other immigration event",
    fields: ["event_date", "visa_type", "notes"],
    labels: {},
  },
};

const VISA_TYPES = [
  { code: "H1B", label: "H-1B" },
  { code: "H1B1", label: "H-1B1" },
  { code: "H4", label: "H-4" },
  { code: "H4_EAD", label: "H-4 EAD" },
  { code: "L1A", label: "L-1A" },
  { code: "L1B", label: "L-1B" },
  { code: "L2", label: "L-2" },
  { code: "L2_EAD", label: "L-2 EAD" },
  { code: "F1", label: "F-1" },
  { code: "OPT", label: "OPT" },
  { code: "STEM_OPT", label: "STEM OPT" },
  { code: "CPT", label: "CPT" },
  { code: "TN", label: "TN" },
  { code: "E2", label: "E-2" },
  { code: "E3", label: "E-3" },
  { code: "O1", label: "O-1" },
  { code: "GC", label: "Green Card" },
  { code: "GC_EAD", label: "GC EAD" },
  { code: "EAD", label: "EAD" },
  { code: "USC", label: "US Citizen" },
  { code: "OTHER", label: "Other" },
];

const EVENT_TYPES = [
  { value: "initial_entry", label: "Initial Entry" },
  { value: "status_change", label: "Status Change" },
  { value: "extension", label: "Extension" },
  { value: "transfer", label: "Transfer" },
  { value: "amendment", label: "Amendment" },
  { value: "ead_issued", label: "EAD Issued" },
  { value: "gc_stage", label: "Green Card Stage" },
  { value: "other", label: "Other Event" },
];

const AMENDMENT_TYPES = [
  { value: "job_title", label: "Job Title Change" },
  { value: "job_duties", label: "Job Duties Change" },
  { value: "worksite", label: "Worksite Location Change" },
  { value: "wage", label: "Wage Change" },
  { value: "multiple", label: "Multiple Changes" },
];

const EAD_CATEGORIES = [
  { value: "C09", label: "C09 - Adjustment Pending" },
  { value: "C10", label: "C10 - Asylum Applicant" },
  { value: "C26", label: "C26 - H-4 Dependent" },
  { value: "A03", label: "A03 - Refugee" },
  { value: "A05", label: "A05 - Asylee" },
  { value: "A12", label: "A12 - TPS" },
];

const GC_STAGES = [
  { value: "perm_filed", label: "PERM Filed" },
  { value: "perm_certified", label: "PERM Certified" },
  { value: "perm_audit", label: "PERM Audit" },
  { value: "i140_filed", label: "I-140 Filed" },
  { value: "i140_approved", label: "I-140 Approved" },
  { value: "i485_filed", label: "I-485 Filed" },
  { value: "ead_ap_filed", label: "EAD/AP Filed" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "gc_approved", label: "Green Card Approved" },
];

const CAP_TYPES = [
  { value: "cap_subject", label: "Cap Subject (Regular)" },
  { value: "cap_exempt", label: "Cap Exempt" },
  { value: "cap_exempt_masters", label: "Cap Exempt (Masters)" },
];

const DEGREE_TYPES = [
  { value: "associate", label: "Associate" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
];

const PETITIONS_DOC_TYPES = [
  { code: "i797_approval", name: "I-797 Approval Notice" },
  { code: "i797_receipt", name: "I-797 Receipt Notice" },
  { code: "i797_extension", name: "I-797 Extension" },
  { code: "i797_amendment", name: "I-797 Amendment" },
  { code: "i797_transfer", name: "I-797 Transfer" },
  { code: "i129_petition", name: "I-129 Petition" },
  { code: "i129s_blanket", name: "I-129S (Blanket L)" },
  { code: "rfe_notice", name: "RFE Notice" },
  { code: "rfe_response", name: "RFE Response" },
  { code: "noid_notice", name: "NOID Notice" },
  { code: "noid_response", name: "NOID Response" },
  { code: "denial_notice", name: "Denial Notice" },
  { code: "appeal_document", name: "Appeal Document" },
  { code: "supporting_letter", name: "Supporting Letter" },
  { code: "client_letter", name: "Client Letter" },
  { code: "project_letter", name: "Project Letter" },
  { code: "sow_msa", name: "SOW / MSA" },
  { code: "specialty_occupation", name: "Specialty Occupation Proof" },
  { code: "petition_supporting_doc", name: "Supporting Document" },
  { code: "petition_other", name: "Other" },
];

const getEventDetailsFields = (eventType, fromStatus, toStatus) => {
  if (eventType === "initial_entry" && toStatus === "F1") {
    return ["school_name", "sevis_number", "major", "degree", "program_start_date"];
  }

  if (eventType === "status_change" && fromStatus === "F1" && (toStatus === "OPT" || toStatus === "STEM_OPT")) {
    return ["school_name", "sevis_number", "major", "degree", "graduation_date", "opt_ead_number"];
  }

  if (eventType === "status_change" && fromStatus === "OPT" && toStatus === "STEM_OPT") {
    return ["school_name", "employer_name", "employer_ein", "i983_submitted"];
  }

  if (eventType === "status_change" && (fromStatus === "OPT" || fromStatus === "STEM_OPT") && toStatus === "H1B") {
    return ["previous_school", "cap_type", "lottery_year", "lca_number", "job_title", "wage"];
  }

  if (eventType === "transfer" && (toStatus === "H1B" || toStatus?.includes("H1B"))) {
    return ["previous_employer", "previous_job_title", "new_job_title", "transfer_reason"];
  }

  if (eventType === "extension" && (toStatus === "H1B" || toStatus?.includes("H1B"))) {
    return ["current_employer", "job_title", "extension_reason"];
  }

  if (eventType === "gc_stage") {
    return ["gc_category", "priority_date", "sponsoring_employer"];
  }

  return [];
};

// ==================== SHADCN/UI DROPDOWN COMPONENTS ====================

function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

function DropdownMenuTrigger({ asChild, children, ...props }) {
  return React.cloneElement(children, props);
}

function DropdownMenuContent({ align = "end", children, open, onOpenChange }) {
  if (!open) return null;

  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={() => onOpenChange(false)} />
      <div
        className={`absolute ${alignClass} mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`}
        role="menu"
        data-state="open"
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuItem({ onClick, className = "", children, disabled = false }) {
  return (
    <div
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      className={`relative flex cursor-default select-none items-center rounded-xl px-2 py-1.5 text-sm outline-none transition-colors focus:!bg-[#3c83f6] focus:!text-[#fff] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:!bg-[#3c83f6] hover:!text-[#fff] ${className}`}
      data-disabled={disabled}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

// ==================== MODAL COMPONENTS ====================

function DocumentViewerModal({ open, onOpenChange, document, onDownload, isLoading }) {
  if (!document || !open) return null;

  const isPDF = document.type === "application/pdf" || document.name.endsWith(".pdf");
  const isImage =
    document.type.startsWith("image/") ||
    document.name.endsWith(".jpg") ||
    document.name.endsWith(".jpeg") ||
    document.name.endsWith(".png");

  const getDisplayUrl = () => {
    if (document.url) return document.url;
    if (document.base64) {
      const mimeType = isPDF ? "application/pdf" : document.type;
      return `data:${mimeType};base64,${document.base64}`;
    }
    return null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[85vh] mx-4 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {isPDF ? <FileText className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {document.name}
          </h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-[#67677e]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                <p>Loading document...</p>
              </div>
            </div>
          ) : displayUrl ? (
            isPDF ? (
              <iframe src={displayUrl} className="w-full h-full border rounded-md" title={document.name} />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img src={displayUrl} alt={document.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#67677e]">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Preview not available for this file type</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#67677e]">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Document preview not available</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={onDownload}
            disabled={isLoading || !displayUrl}
            className="px-4 py-2 bg-[#7c3bed] text-white rounded-md text-sm hover:bg-[#6b32cc] disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDocumentModal({ open, onOpenChange, document, documentTypes, onSave, isSaving }) {
  const [docType, setDocType] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [empView, setEmpView] = useState(true);

  React.useEffect(() => {
    if (document) {
      setDocType(document.doc_type || document.immigration_doc_type || "");
      setDescription(document.file_desc || document.doc_name || "");
      setValidFrom(document.valid_from || document.doc_validfrom || "");
      setExpiryDate(document.expiry_date || document.doc_expiry || "");
      setEmpView(document.emp_view !== false);
    }
  }, [document]);

  const handleSave = async () => {
    await onSave({
      doc_type: docType,
      file_desc: description,
      doc_validfrom: validFrom || undefined,
      doc_expiry: expiryDate || undefined,
      emp_view: empView,
    });
  };

  if (!document || !open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Document
          </h3>
          <p className="text-sm text-[#67677e] mt-1">
            Update document metadata for "{document.doc_name || document.file_name}"
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description..."
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valid From</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full h-9 rounded-md border px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full h-9 rounded-md border px-3 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emp-view"
              checked={empView}
              onChange={(e) => setEmpView(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="emp-view" className="text-sm cursor-pointer">
              Visible to Employee
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#7c3bed] text-white rounded-md text-sm hover:bg-[#6b32cc] disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
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

function RenameDocumentModal({ open, onOpenChange, document, onRename, isRenaming }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (document) {
      const fileName = document.file_name || document.doc_name || "";
      const lastDotIndex = fileName.lastIndexOf(".");
      if (lastDotIndex > 0) {
        setNewName(fileName.substring(0, lastDotIndex));
      } else {
        setNewName(fileName);
      }
      setError("");
    }
  }, [document]);

  const getFileExtension = () => {
    const fileName = document?.file_name || document?.doc_name || "";
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
  };

  const handleRename = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError("File name cannot be empty");
      return;
    }

    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      setError("File name contains invalid characters");
      return;
    }

    const extension = getFileExtension();
    const fullNewName = trimmedName + extension;

    await onRename(fullNewName);
  };

  if (!document || !open) return null;

  const extension = getFileExtension();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Rename Document
          </h3>
          <p className="text-sm text-[#67677e] mt-1">Enter a new name for this document</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New File Name</label>
            <div className="flex items-center gap-1">
              <input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError("");
                }}
                placeholder="Enter file name"
                className="flex-1 h-9 rounded-md border px-3 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRenaming) {
                    handleRename();
                  }
                }}
              />
              {extension && (
                <span className="text-sm text-[#67677e] font-mono bg-gray-100 px-2 py-2 rounded">{extension}</span>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isRenaming}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={isRenaming || !newName.trim()}
            className="px-4 py-2 bg-[#7c3bed] text-white rounded-md text-sm hover:bg-[#6b32cc] disabled:opacity-50 flex items-center gap-2"
          >
            {isRenaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renaming...
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

function DeleteDocumentModal({ open, onOpenChange, document, onDelete, isDeleting }) {
  if (!document || !open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Document
          </h3>
          <p className="text-sm text-[#67677e] mt-1">This action cannot be undone</p>
        </div>

        <div className="p-6">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{document.file_name || document.doc_name}"</span>?
          </p>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadDocumentModal({ open, onOpenChange, documentTypes, candidateEmail, onSuccess }) {
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
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or image file (JPG, PNG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Maximum file size is 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !docType) {
      alert("Please select a file and document type");
      return;
    }

    setUploading(true);
    try {
      // Implement your upload logic here
      alert("Document uploaded successfully!");
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
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

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Immigration Document
          </h3>
          <p className="text-sm text-[#67677e] mt-1">
            Upload a document for immigration compliance. Supported formats: PDF, JPG, PNG (max 10MB)
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document File *</label>
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 rounded-md border bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-[#67677e] flex-shrink-0" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <span className="text-xs text-[#67677e]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={removeFile}
                  className="h-6 w-6 flex items-center justify-center hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-[#7c3bed] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-[#67677e] mb-2" />
                <p className="text-sm text-[#67677e]">Click to select or drag and drop</p>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description (optional)"
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valid From</label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full h-9 rounded-md border px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-9 rounded-md border px-3 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-resume"
              checked={isResume}
              onChange={(e) => setIsResume(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="is-resume" className="text-sm cursor-pointer">
              This is a resume/CV
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !docType || uploading}
            className="px-4 py-2 bg-[#7c3bed] text-white rounded-md text-sm hover:bg-[#6b32cc] disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPetitionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  formData,
  setFormData,
  currentEventConfig,
  eventDetailsFields,
}) {
  if (!open) return null;

  const handleEventTypeChange = (eventType) => {
    setFormData({ event_type: eventType });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (!formData.event_type) return false;
    if (!formData.event_date) return false;

    const config = EVENT_CONFIG[formData.event_type];
    if (!config) return false;

    if (config.fields.includes("visa_type") && !formData.visa_type) return false;
    if (config.fields.includes("from_visa_type") && !formData.from_visa_type) return false;
    if (config.fields.includes("to_visa_type") && !formData.to_visa_type) return false;
    if (config.fields.includes("ead_category") && !formData.ead_category) return false;
    if (config.fields.includes("gc_stage") && !formData.gc_stage) return false;

    return true;
  };

  const renderFormField = (fieldName) => {
    const label =
      currentEventConfig.labels[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const inputClasses =
      "w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent";

    switch (fieldName) {
      case "event_date":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.event_date || ""}
              onChange={(e) => handleFieldChange("event_date", e.target.value)}
              className={inputClasses}
            />
          </div>
        );

      case "visa_type":
      case "from_visa_type":
      case "to_visa_type":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">
              {label} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className={inputClasses}
            >
              <option value="">Select visa type</option>
              {VISA_TYPES.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "employer":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">{label}</label>
            <input
              value={formData.employer || ""}
              onChange={(e) => handleFieldChange("employer", e.target.value)}
              placeholder="Company name"
              className={inputClasses}
            />
          </div>
        );

      case "port_of_entry":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Port of Entry</label>
            <input
              value={formData.port_of_entry || ""}
              onChange={(e) => handleFieldChange("port_of_entry", e.target.value)}
              placeholder="e.g., JFK, LAX, ORD"
              className={inputClasses}
            />
          </div>
        );

      case "receipt_number":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Receipt Number</label>
            <input
              value={formData.receipt_number || ""}
              onChange={(e) => handleFieldChange("receipt_number", e.target.value)}
              placeholder="e.g., EAC2490012345"
              className={inputClasses}
            />
          </div>
        );

      case "approval_date":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Approval Date</label>
            <input
              type="date"
              value={formData.approval_date || ""}
              onChange={(e) => handleFieldChange("approval_date", e.target.value)}
              className={inputClasses}
            />
          </div>
        );

      case "validity_start":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Validity Start</label>
            <input
              type="date"
              value={formData.validity_start || ""}
              onChange={(e) => handleFieldChange("validity_start", e.target.value)}
              className={inputClasses}
            />
          </div>
        );

      case "validity_end":
        const validityEndLabel = currentEventConfig.labels.validity_end || "Validity End";
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">{validityEndLabel}</label>
            <input
              type="date"
              value={formData.validity_end || ""}
              onChange={(e) => handleFieldChange("validity_end", e.target.value)}
              className={inputClasses}
            />
          </div>
        );

      case "change_type":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Type of Change</label>
            <select
              value={formData.change_type || ""}
              onChange={(e) => handleFieldChange("change_type", e.target.value)}
              className={inputClasses}
            >
              <option value="">Select change type</option>
              {AMENDMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "ead_category":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">
              EAD Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ead_category || ""}
              onChange={(e) => handleFieldChange("ead_category", e.target.value)}
              className={inputClasses}
            >
              <option value="">Select category</option>
              {EAD_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "card_number":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Card Number</label>
            <input
              value={formData.card_number || ""}
              onChange={(e) => handleFieldChange("card_number", e.target.value)}
              placeholder="e.g., SRC2390123456"
              className={inputClasses}
            />
          </div>
        );

      case "gc_stage":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">
              Green Card Stage <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gc_stage || ""}
              onChange={(e) => handleFieldChange("gc_stage", e.target.value)}
              className={inputClasses}
            >
              <option value="">Select stage</option>
              {GC_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "notes":
        return (
          <div key={fieldName} className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">Notes</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderEventDetailsField = (fieldName) => {
    const label = fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const isDate = fieldName.includes("date");
    const isCheckbox = fieldName === "i983_submitted";
    const inputClasses =
      "w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent";

    if (isCheckbox) {
      return (
        <div key={fieldName} className="space-y-1.5 flex items-center">
          <input
            type="checkbox"
            id={fieldName}
            checked={formData[fieldName] || false}
            onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor={fieldName} className="text-xs font-medium text-[#67677e] uppercase ml-2">
            {label}
          </label>
        </div>
      );
    }

    if (fieldName === "degree") {
      return (
        <div key={fieldName} className="space-y-1.5">
          <label className="text-xs font-medium text-[#67677e] uppercase">{label}</label>
          <select
            value={formData[fieldName] || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={inputClasses}
          >
            <option value="">Select degree</option>
            {DEGREE_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (fieldName === "cap_type") {
      return (
        <div key={fieldName} className="space-y-1.5">
          <label className="text-xs font-medium text-[#67677e] uppercase">{label}</label>
          <select
            value={formData[fieldName] || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={inputClasses}
          >
            <option value="">Select cap type</option>
            {CAP_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={fieldName} className="space-y-1.5">
        <label className="text-xs font-medium text-[#67677e] uppercase">{label}</label>
        <input
          type={isDate ? "date" : "text"}
          value={formData[fieldName] || ""}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          className={inputClasses}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => !isSubmitting && onOpenChange(false)} />

      {/* Dialog Content */}
      <div className="relative z-50 bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {(() => {
                  const IconComponent = currentEventConfig.icon;
                  return <IconComponent className="h-5 w-5 text-[#7c3bed]" />;
                })()}
                Add {currentEventConfig.title}
              </h2>
              <p className="text-sm text-[#67677e] mt-1">{currentEventConfig.description}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Event Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#67677e] uppercase">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.event_type}
              onChange={(e) => handleEventTypeChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent"
            >
              <option value="">Select event type</option>
              {EVENT_TYPES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields based on Event Type */}
          {formData.event_type && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {currentEventConfig.fields.map((field) => renderFormField(field))}
              </div>

              {/* Event Details Section - Contextual Fields */}
              {eventDetailsFields.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#67677e]" />
                      Snapshot Details
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        Optional
                      </span>
                    </h4>
                    <p className="text-xs text-[#67677e]">
                      These details will be preserved as a historical snapshot for this event.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {eventDetailsFields.map((field) => renderEventDetailsField(field))}
                  </div>
                </div>
              )}

              {/* Notes - always show for all event types that don't have it in fields */}
              {!currentEventConfig.fields.includes("notes") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Notes</label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="px-4 py-2 bg-[#7c3bed] text-white rounded-xl text-sm font-medium hover:bg-[#6b32cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

function PetitionImmigration({ candidateDetails, immigrationData, isEditMode, getImmigrationInfo }) {
  // Use petition_history from immigrationData
  const petitionHistory = immigrationData?.data?.petition_history || [];
  const documents = immigrationData?.data?.documents || [];

  // Timeline states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [formData, setFormData] = useState({ event_type: "extension" });

  // Document modal states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown menu states
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const currentEventConfig = EVENT_CONFIG[formData.event_type] || EVENT_CONFIG.other;

  const eventDetailsFields = useMemo(() => {
    const eventType = formData.event_type;
    const fromStatus = formData.from_visa_type;
    const toStatus = formData.event_type === "status_change" ? formData.to_visa_type : formData.visa_type;

    return getEventDetailsFields(eventType, fromStatus, toStatus);
  }, [formData.event_type, formData.from_visa_type, formData.to_visa_type, formData.visa_type]);

  // ==================== UTILITY FUNCTIONS ====================

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventBadgeColor = (eventType) => {
    switch (eventType) {
      case "initial_entry":
        return "bg-blue-100 text-blue-800";
      case "status_change":
        return "bg-purple-100 text-purple-800";
      case "extension":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-amber-100 text-amber-800";
      case "amendment":
        return "bg-orange-100 text-orange-800";
      case "ead_issued":
        return "bg-teal-100 text-teal-800";
      case "gc_stage":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "valid";
    const exp = new Date(expiryDate);
    const now = new Date();
    if (exp < now) return "expired";
    const diff = (exp - now) / 86400000;
    return diff <= 90 ? "expiring" : "valid";
  };

  const getDocumentTypeName = (docType) => {
    const found = PETITIONS_DOC_TYPES.find((t) => t.code === docType);
    return found ? found.name : "Other Document";
  };

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Sort petition history by event_date (newest first)
  const sortedHistory = useMemo(() => {
    return [...petitionHistory].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }, [petitionHistory]);

  // ==================== EVENT HANDLERS ====================

  const handleAddPetition = async () => {
    setIsSubmitting(true);
    try {
      const event_details = {};

      eventDetailsFields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== "") {
          event_details[field] = formData[field];
        }
      });

      let to_status = "";
      let from_status = "";

      if (formData.event_type === "status_change") {
        from_status = formData.from_visa_type || "";
        to_status = formData.to_visa_type || "";
      } else if (formData.event_type === "ead_issued") {
        to_status = formData.ead_category || "";
      } else if (formData.event_type === "gc_stage") {
        to_status = formData.gc_stage || "";
      } else {
        to_status = formData.visa_type || "";
      }

      const petitionData = {
        event_type: formData.event_type,
        event_date: formData.event_date || "",
        from_status: from_status || undefined,
        to_status: to_status,
        employer: formData.employer,
        receipt_number: formData.receipt_number || formData.card_number,
        approval_date: formData.approval_date,
        validity_start: formData.validity_start,
        validity_end: formData.validity_end,
        notes: formData.notes || (formData.change_type ? `Change type: ${formData.change_type}` : undefined),
        event_details: Object.keys(event_details).length > 0 ? event_details : undefined,
      };

      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "add-petition-history",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          petition_data: petitionData,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("Petition history added successfully!");
        setShowAddDialog(false);
        setFormData({ event_type: "extension" });
        await getImmigrationInfo();
      } else {
        throw new Error(data.message || "Failed to add petition history");
      }
    } catch (error) {
      console.error("Error adding petition history:", error);
      alert("Failed to add petition history. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePetition = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this petition history?")) return;

    setDeletingId(historyId);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "delete-petition-history",
          emailid: "marketing@4spheresolutions.com",
          history_id: historyId,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("Deleted successfully!");
        await getImmigrationInfo();
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // ==================== DOCUMENT HANDLERS ====================

  const handleViewDocument = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) {
      alert("Document filename not found");
      return;
    }

    setLoadingDocId(doc.id || doc.document_id);
    setViewerLoading(true);
    setOpenDropdownId(null);

    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "download-document",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          file_name: fileName,
        }),
      });

      const data = await response.json();
      if (data.success && data.files?.length) {
        const file = data.files[0];
        setViewerDoc({
          name: fileName,
          type: doc.mime_type || file.file_extension || "application/pdf",
          url: file.file_url,
          base64: file.base64,
        });
        setViewerOpen(true);
      } else {
        throw new Error(data.error || "Document not found");
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      alert("Failed to load document");
    } finally {
      setLoadingDocId(null);
      setViewerLoading(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) return;

    setLoadingDocId(doc.id || doc.document_id);
    setOpenDropdownId(null);

    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "download-document",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          file_name: fileName,
        }),
      });

      const data = await response.json();
      if (data.success && data.files?.length) {
        const file = data.files[0];

        if (file.file_url) {
          window.open(file.file_url, "_blank");
        } else if (file.base64) {
          const mimeType = doc.mime_type || "application/octet-stream";
          const link = document.createElement("a");
          link.href = `data:${mimeType};base64,${file.base64}`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        alert(`Downloading ${fileName}...`);
      } else {
        throw new Error(data.error || "Document not found");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document");
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleViewerDownload = () => {
    if (viewerDoc?.url) {
      window.open(viewerDoc.url, "_blank");
    }
  };

  const handleEditDocument = (doc) => {
    setEditingDoc(doc);
    setOpenDropdownId(null);
  };

  const handleEditSave = async (updates) => {
    if (!editingDoc) return;

    setIsSaving(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "update-document-metadata",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          document_id: editingDoc.id || editingDoc.document_id,
          ...updates,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Document updated successfully");
        setEditingDoc(null);
        await getImmigrationInfo();
      } else {
        throw new Error(data.error || "Failed to update document");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameDocument = (doc) => {
    setRenameDoc(doc);
    setOpenDropdownId(null);
  };

  const handleRenameSave = async (newName) => {
    if (!renameDoc) return;

    const oldFileName = renameDoc.file_name || renameDoc.doc_name;
    if (!oldFileName) return;

    setIsRenaming(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "rename-document",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          document_id: renameDoc.id || renameDoc.document_id,
          old_file_name: oldFileName,
          new_file_name: newName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Document renamed successfully");
        setRenameDoc(null);
        await getImmigrationInfo();
      } else {
        throw new Error(data.error || "Failed to rename document");
      }
    } catch (error) {
      console.error("Error renaming document:", error);
      alert("Failed to rename document");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return;

    const fileName = deleteDoc.file_name || deleteDoc.doc_name;
    if (!fileName) return;

    setIsDeleting(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "delete-document",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails.primary_email || "muni.k0892@gmail.com",
          file_name: fileName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Document deleted successfully");
        setDeleteDoc(null);
        await getImmigrationInfo();
      } else {
        throw new Error(data.error || "Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  // ==================== RENDER EVENT DETAILS ====================

  const renderEventDetails = (event) => {
    if (!event.event_details || Object.keys(event.event_details).length === 0) {
      return null;
    }

    const details = event.event_details;
    const detailsToShow = [];

    // Dynamically render based on what's in event_details
    if (details.school_name) detailsToShow.push(["School", details.school_name]);
    if (details.sevis_number) detailsToShow.push(["SEVIS #", details.sevis_number]);
    if (details.major) detailsToShow.push(["Major", details.major]);
    if (details.degree) detailsToShow.push(["Degree", details.degree]);
    if (details.program_start_date) detailsToShow.push(["Program Start", formatDate(details.program_start_date)]);
    if (details.graduation_date) detailsToShow.push(["Graduation", formatDate(details.graduation_date)]);
    if (details.opt_ead_number) detailsToShow.push(["OPT EAD #", details.opt_ead_number]);
    if (details.employer_name) detailsToShow.push(["Employer", details.employer_name]);
    if (details.employer_ein) detailsToShow.push(["EIN", details.employer_ein]);
    if (details.i983_submitted !== undefined)
      detailsToShow.push(["I-983 Submitted", details.i983_submitted ? "Yes" : "No"]);
    if (details.previous_school) detailsToShow.push(["Previous School", details.previous_school]);
    if (details.cap_type) detailsToShow.push(["Cap Type", details.cap_type]);
    if (details.lottery_year) detailsToShow.push(["Lottery Year", details.lottery_year]);
    if (details.lca_number) detailsToShow.push(["LCA #", details.lca_number]);
    if (details.job_title) detailsToShow.push(["Job Title", details.job_title]);
    if (details.wage) detailsToShow.push(["Wage", `$${details.wage.toLocaleString()}`]);
    if (details.previous_employer) detailsToShow.push(["Previous Employer", details.previous_employer]);
    if (details.previous_job_title) detailsToShow.push(["Previous Job Title", details.previous_job_title]);
    if (details.new_job_title) detailsToShow.push(["New Job Title", details.new_job_title]);
    if (details.transfer_reason) detailsToShow.push(["Transfer Reason", details.transfer_reason]);
    if (details.current_employer) detailsToShow.push(["Current Employer", details.current_employer]);
    if (details.extension_reason) detailsToShow.push(["Extension Reason", details.extension_reason]);
    if (details.gc_category) detailsToShow.push(["GC Category", details.gc_category]);
    if (details.priority_date) detailsToShow.push(["Priority Date", formatDate(details.priority_date)]);
    if (details.sponsoring_employer) detailsToShow.push(["Sponsoring Employer", details.sponsoring_employer]);
    if (details.port_of_entry) detailsToShow.push(["Port of Entry", details.port_of_entry]);

    if (detailsToShow.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t">
        <h4 className="text-xs font-semibold text-[#67677e] uppercase mb-2">Event Details (Snapshot)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {detailsToShow.map(([label, value]) => (
            <div key={label}>
              <span className="text-[#67677e]">{label}:</span> <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-4 Interfont">
      {/* Petition & Status History Card */}
      <div className="rounded-xl border bg-[#fff] shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Petition & Status History
            </h3>
            <p className="text-sm text-[#67677e]">Timeline of immigration events and status changes</p>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#7c3bed] text-white font-semibold rounded-xl hover:bg-[#6b32cc] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}
        </div>

        <div className="p-6 pt-0">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-[#67677e]">
              <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No petition history found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#e7e7ef]"></div>

              <div className="space-y-6">
                {sortedHistory.map((event) => {
                  const isExpanded = expandedItems.has(event.history_id);
                  const EventIcon = EVENT_CONFIG[event.event_type]?.icon || History;
                  const eventLabel = EVENT_TYPES.find((e) => e.value === event.event_type)?.label || event.event_type;

                  return (
                    <div key={event.history_id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-[#7c3bed] border-2 border-[#fff]"></div>

                      <div className="bg-[#f9f9fb] rounded-xl p-3 border hover:shadow-sm transition-shadow">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs border-transparent shadow-md ${getEventBadgeColor(event.event_type)}`}
                            >
                              {eventLabel}
                            </div>

                            {/* Auto-tracked badge */}
                            {/* {event.event_details?.auto_generated && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                Auto-tracked
                              </span>
                            )} */}

                            {/* Status transition */}
                            {event.from_status && event.to_status && (
                              <div className="flex items-center gap-1 text-sm text-[#080118]">
                                <span className="font-medium">{event.from_status}</span>
                                <ArrowRight className="h-3 w-3 text-[#67677e]" />
                                <span className="font-medium text-[#080118]">{event.to_status}</span>
                              </div>
                            )}
                            {!event.from_status && event.to_status && (
                              <span className="text-sm font-medium text-[#080118]">{event.to_status}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#67677e]">{formatDate(event.event_date)}</span>
                            {isEditMode && (
                              <button
                                onClick={() => handleDeletePetition(event.history_id)}
                                disabled={deletingId === event.history_id}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 p-0 rounded bg-transparent h-6 w-6"
                                title="Delete event"
                              >
                                {deletingId === event.history_id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {event.employer && (
                            <div>
                              <span className="text-[#67677e]">Employer:</span>{" "}
                              <span className="font-medium text-[#080118]">{event.employer}</span>
                            </div>
                          )}
                          {event.receipt_number && (
                            <div>
                              <span className="text-[#67677e]">Receipt:</span>{" "}
                              <span className="font-mono text-xs">{event.receipt_number}</span>
                            </div>
                          )}
                          {event.approval_date && (
                            <div>
                              <span className="text-[#67677e]">Approved:</span> {formatDate(event.approval_date)}
                            </div>
                          )}
                          {event.validity_start && event.validity_end && (
                            <div className="">
                              <span className="text-[#67677e]">Validity:</span> {formatDate(event.validity_start)} -{" "}
                              {formatDate(event.validity_end)}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {event.notes && <p className="text-sm text-[#67677e] mt-2 italic">{event.notes}</p>}

                        {/* Event Details (Snapshot Data) */}
                        {/* {renderEventDetails(event)} */}

                        {/* Footer */}
                        {/* {event.created_by && (
                          <div className="text-xs text-[#67677e] mt-3 pt-2 border-t">
                            Added by {event.created_by}
                            {event.created_at && ` on ${formatDate(event.created_at)}`}
                          </div>
                        )} */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="rounded-xl border bg-[#fff] shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Petition Documents
            </h3>
            <p className="text-sm text-[#67677e]">Immigration documents and supporting files</p>
          </div>
          {/* {isEditMode && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#7c3bed] text-white rounded-md hover:bg-[#6b32cc] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          )} */}
        </div>

        <div className="p-6 pt-0">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-[#67677e]">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto !rounded-xl border">
              <table className="w-full caption-bottom text-sm !border rounded-xl">
                <thead className="[&_tr]:!border-b border-[#e7e7ef]">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Document</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expiry</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {documents.map((doc) => {
                    const docId = doc.id || doc.document_id;
                    const isLoading = loadingDocId === docId;
                    const expiryStatus = getExpiryStatus(doc.doc_expiry || doc.expiry_date);
                    const expiryDate = doc.doc_expiry || doc.expiry_date;

                    return (
                      <tr
                        key={docId}
                        className="!border-b border-[#e7e7ef] transition-colors hover:bg-[#f7f7fb] data-[state=selected]:bg-muted"
                      >
                        {/* Document Name */}
                        <td className="p-3 align-middle">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate max-w-[200px]">{doc.file_name || doc.doc_name}</span>
                          </div>
                        </td>

                        {/* Document Type */}
                        <td className="p-3 align-middle">
                          <span className="text-sm">
                            {getDocumentTypeName(doc.immigration_doc_type || doc.doc_type)}
                          </span>
                        </td>

                        {/* Expiry Date */}
                        <td className="p-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                expiryStatus === "expired"
                                  ? "text-red-600 font-medium"
                                  : expiryStatus === "expiring"
                                    ? "text-yellow-600 font-medium"
                                    : ""
                              }`}
                            >
                              {expiryDate ? formatDate(expiryDate) : "—"}
                            </span>
                            {expiryStatus === "expired" && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                Expired
                              </span>
                            )}
                            {expiryStatus === "expiring" && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                                Expiring Soon
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-8 w-8">
                              <Loader2 className="h-4 w-4 animate-spin text-[#67677e]" />
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenDropdownId(openDropdownId === docId ? null : docId)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors 
                                bg-transparent
                                hover:!bg-[#3c83f6] hover:!text-white rounded-xl h-8 w-8 p-0"
                                type="button"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {openDropdownId === docId && (
                                <>
                                  <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                                  <div
                                    className="absolute right-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-white p-1 shadow-md"
                                    role="menu"
                                  >
                                    <div
                                      role="menuitem"
                                      onClick={() => {
                                        handleViewDocument(doc);
                                        setOpenDropdownId(null);
                                      }}
                                      className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors
                                      text-[#080118]  hover:!bg-[#3c83f6] hover:!text-[#fff]"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </div>

                                    <div
                                      role="menuitem"
                                      onClick={() => {
                                        handleDownloadDocument(doc);
                                        setOpenDropdownId(null);
                                      }}
                                      className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors 
                                      text-[#080118] hover:!bg-[#3c83f6] hover:!text-[#fff]"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </div>

                                    {isEditMode && (
                                      <>
                                        <div
                                          role="menuitem"
                                          onClick={() => {
                                            handleEditDocument(doc);
                                            setOpenDropdownId(null);
                                          }}
                                          className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm 
                                          text-[#080118] outline-none transition-colors hover:!bg-[#3c83f6] hover:!text-[#fff]"
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </div>

                                        <div
                                          role="menuitem"
                                          onClick={() => {
                                            handleRenameDocument(doc);
                                            setOpenDropdownId(null);
                                          }}
                                          className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm
                                          text-[#080118] outline-none transition-colors hover:!bg-[#3c83f6] hover:!text-[#fff]"
                                        >
                                          <FileEdit className="h-4 w-4 mr-2" />
                                          Rename
                                        </div>

                                        <div
                                          role="menuitem"
                                          onClick={() => {
                                            setDeleteDoc(doc);
                                            setOpenDropdownId(null);
                                          }}
                                          className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none text-[#080118] transition-colors hover:!bg-red-50 hover:!text-red-600 text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* All Modals */}
      <DocumentViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        document={viewerDoc}
        onDownload={handleViewerDownload}
        isLoading={viewerLoading}
      />

      <EditDocumentModal
        open={!!editingDoc}
        onOpenChange={() => setEditingDoc(null)}
        document={editingDoc}
        documentTypes={PETITIONS_DOC_TYPES}
        onSave={handleEditSave}
        isSaving={isSaving}
      />

      <RenameDocumentModal
        open={!!renameDoc}
        onOpenChange={() => setRenameDoc(null)}
        document={renameDoc}
        onRename={handleRenameSave}
        isRenaming={isRenaming}
      />

      <DeleteDocumentModal
        open={!!deleteDoc}
        onOpenChange={() => setDeleteDoc(null)}
        document={deleteDoc}
        onDelete={handleDeleteDocument}
        isDeleting={isDeleting}
      />

      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        documentTypes={PETITIONS_DOC_TYPES}
        candidateEmail={candidateDetails.primary_email}
        onSuccess={getImmigrationInfo}
      />

      <AddPetitionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddPetition}
        isSubmitting={isSubmitting}
        formData={formData}
        setFormData={setFormData}
        currentEventConfig={currentEventConfig}
        eventDetailsFields={eventDetailsFields}
      />
    </div>
  );
}

export default PetitionImmigration;
