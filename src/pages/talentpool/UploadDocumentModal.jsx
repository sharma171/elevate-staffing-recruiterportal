import React, { useState, useRef, useEffect } from "react";
import { Upload, File as FileIcon, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./css/UploadDocumentModal.module.css";
import { OverlayModal } from "../../components";
import { useAuth } from "../../authContext";

const UPLOAD_URL = "https://project-documents-upload-determine-type-v3-305451280005.us-east1.run.app";
const AUTH_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const fileToBase64 = (f) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (e) => reject(e);
  });

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export default function UploadDocumentModal({
  open,
  onOpenChange,
  onSuccess,
  projectId,
  candidateEmail,
  DEFAULT_CANDIDATE_ID,
}) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const USER_EMAIL = user?.email;

  useEffect(() => {
    if (!open) {
      setDocuments([]);
      setUploading(false);
    }
  }, [open]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const newDocs = [];

    selectedFiles.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
        toast.error("Invalid file type — only PDF and DOCX allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large — maximum 10MB.");
        return;
      }
      newDocs.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        documentType: "other",
        documentName: "",
        description: "",
        visibleToCandidate: false,
      });
    });

    if (newDocs.length) {
      setDocuments((prev) => [...prev, ...newDocs]);
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDocumentFieldChange = (index, field, value) => {
    setDocuments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!documents.length) return;

    setUploading(true);

    Promise.all(
      documents.map((doc) =>
        fileToBase64(doc.file).then((base64Content) => ({
          file_name: doc.file.name,
          file_content: base64Content,
          document_type: doc.documentType || "other",
          document_name: doc.documentName || "",
          document_description: doc.description || "",
          is_visible_to_candidate: !!doc.visibleToCandidate,
        }))
      )
    )
      .then((documentsArray) =>
        fetch(UPLOAD_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
          body: JSON.stringify({
            emailid: USER_EMAIL,
            project_id: projectId,
            candidate_id: DEFAULT_CANDIDATE_ID,
            candidate_email: candidateEmail,
            documents: documentsArray,
          }),
        })
      )
      .then((res) =>
        res.json().then((result) => {
          if (!res.ok) {
            return Promise.reject(new Error(result.error || "Upload failed"));
          }
          return result;
        })
      )
      .then(() => {
        toast.success("Documents uploaded successfully");
        if (typeof onSuccess === "function") onSuccess();
        handleClose();
      })
      .catch((err) => {
        toast.error(err && err.message ? err.message : "Upload failed");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleClose = () => {
    setDocuments([]);
    onOpenChange(false);
  };

  if (!open) return null;

  if (!documents.length) {
    return (
      <div role="dialog" aria-modal="true" className={styles.centerOverlay}>
        <div className={styles.centerDialog} tabIndex={-1}>
          <div className={styles.dialogHeader}>
            <h2 className={styles.dialogTitle}>Upload Documents</h2>
          </div>

          <div className={styles.dialogBody}>
            <div className={styles.dialogDropArea} onClick={() => fileInputRef.current?.click()}>
              <Upload className={styles.uploadIcon} />
              <p className={styles.dialogTextMain}>Click to select files (PDF or DOCX)</p>
              <p className={styles.dialogTextSub}>Max 10MB per file • Select multiple files at once</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={handleFileChange}
              className={styles.hidden}
            />
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnOutline} onClick={handleClose} disabled={uploading}>
              Cancel
            </button>
            <button type="button" className={styles.btnPrimary} disabled>
              <Upload className={styles.smallIcon} />
              Upload
            </button>
          </div>

          <button type="button" className={`hidemodalclosebtn ${styles.dialogCloseBtn}`} onClick={handleClose}>
            <X className={styles.dialogCloseIcon} />
            <span className="visually-hidden">Close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <OverlayModal
      isActive={open}
      onClose={handleClose}
      modalStyle={{ background: "#fff" }}
      style={{ maxWidth: "800px" }}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>Upload Document</h3>
          <button type="button" title="Close" className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={handleClose}>
            <X />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <div
              className={styles.dropArea}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <Upload className={styles.uploadIcon} />
              <div className={styles.muted}>Click to select files (PDF or DOCX)</div>
              <div className={styles.smallMuted}>Max 10MB per file • Select multiple files at once</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={handleFileChange}
              className={styles.hidden}
            />
          </div>

          <div className="fw-bold my-2">
            {documents?.length} {documents?.length <= 1 ? "file" : "files"} selected
          </div>

          {documents.map((doc, index) => {
            const isPdf = doc.file.name.toLowerCase().endsWith(".pdf");

            return (
              <div key={index} className="card p-3 mb-3">
                <div className={styles.field}>
                  <div className={styles.fileRow}>
                    <FileIcon className={styles.fileIcon} color={isPdf ? "#dc3545" : undefined} />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className={styles.fileName} title={doc.file.name}>
                        {doc.file.name}
                      </div>
                      <div className={`mt-0 ${styles.smallMuted}`}>{formatFileSize(doc.file.size)}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleRemoveDocument(index)}
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className={styles.field}>
                        <label className={`fw-bold ${styles.label}`}>Document Type</label>
                        <select
                          className={`bigHoverInput ${styles.select}`}
                          value={doc.documentType}
                          onChange={(e) => handleDocumentFieldChange(index, "documentType", e.target.value)}
                        >
                          <option value="contract">Contract</option>
                          <option value="invoice">Invoice</option>
                          <option value="agreement">Agreement</option>
                          <option value="amendment">Amendment</option>
                          <option value="client_sow">Client SOW</option>
                          <option value="client_msa">Client MSA</option>
                          <option value="client_ach">Client ACH</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={styles.field}>
                        <label className={`fw-bold ${styles.label}`}>Document Name (optional)</label>
                        <input
                          className={`bigHoverInput ${styles.input}`}
                          value={doc.documentName}
                          onChange={(e) => handleDocumentFieldChange(index, "documentName", e.target.value)}
                          placeholder="e.g., Employment Contract"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={`fw-bold ${styles.label}`}>Description (optional)</label>
                    <textarea
                      className={`bigHoverInput ${styles.textarea}`}
                      value={doc.description}
                      onChange={(e) => handleDocumentFieldChange(index, "description", e.target.value)}
                      rows={2}
                      placeholder="Brief description of the document"
                    />
                  </div>

                  <div className={styles.row}>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={doc.visibleToCandidate}
                          onChange={(e) => handleDocumentFieldChange(index, "visibleToCandidate", e.target.checked)}
                        />
                        <span className={styles.slider} />
                      </label>
                      <span className={styles.label}>Visible to Candidate</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnOutline} onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleUpload}
            disabled={!documents.length || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className={styles.loader} />
                Uploading...
              </>
            ) : (
              <>
                <Upload className={styles.smallIcon} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
