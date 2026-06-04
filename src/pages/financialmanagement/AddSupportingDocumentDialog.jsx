import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, Trash2, CircleFadingArrowUp } from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi } from "../../components";
import styles from "./InvoiceDetails.module.css";
import { useAuth } from "../../authContext";

const DETAILS_API = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app/";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".csv", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx", ".txt"];

const DOCUMENT_TYPES = [
  { key: "timesheet", label: "Timesheet" },
  { key: "receipt", label: "Receipt" },
  { key: "purchase_order", label: "Purchase Order" },
  { key: "approval", label: "Approval" },
  { key: "contract", label: "Contract" },
  { key: "work_order", label: "Work Order" },
  { key: "delivery_note", label: "Delivery Note" },
  { key: "other", label: "Other" },
];

function validateFile(file) {
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type ${ext} not allowed`;
  if (file.size > MAX_FILE_SIZE) return `File exceeds 10 MB: ${file.name}`;
  return null;
}

export default function AddSupportingDocumentDialog({ open, onOpenChange, invoiceId, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const timersRef = useRef({});

  const { user } = useAuth();
  const user_email = user?.email;

  if (!open) return null;

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const validated = selected
      .map((f) => {
        const err = validateFile(f);
        if (err) {
          toast.error(`${f.name}: ${err}`);
          return null;
        }
        return {
          file: f,
          id: `${Date.now()}-${Math.random()}`,
          type: "other",
          status: "pending",
          progress: 0,
        };
      })
      .filter(Boolean);

    setFiles((s) => [...s, ...validated]);
    e.target.value = "";
  };

  const remove = (id) => {
    clearInterval(timersRef.current[id]);
    delete timersRef.current[id];
    setFiles((s) => s.filter((f) => f.id !== id));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const startFakeProgress = (id) => {
    clearInterval(timersRef.current[id]);
    timersRef.current[id] = setInterval(() => {
      setFiles((s) =>
        s.map((x) => {
          if (x.id !== id) return x;
          const next = Math.min(90, (x.progress || 0) + Math.floor(Math.random() * 6) + 1);
          return { ...x, progress: next };
        })
      );
    }, 300);
  };

  const stopFakeProgress = (id) => {
    clearInterval(timersRef.current[id]);
    delete timersRef.current[id];
  };

  const doUpload = () => {
    if (files.length === 0) return toast.error("Select files");
    setUploading(true);

    const fileRefs = files.map((f) => ({ ...f }));

    const update = (id, patch) => {
      setFiles((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      const idx = fileRefs.findIndex((x) => x.id === id);
      if (idx !== -1) fileRefs[idx] = { ...fileRefs[idx], ...patch };
    };

    const chain = fileRefs.reduce((prev, fobj) => {
      return prev.then(() => {
        update(fobj.id, { status: "uploading", progress: 5 });
        startFakeProgress(fobj.id);

        return toBase64(fobj.file)
          .then((base64) => {
            update(fobj.id, { progress: 30 });
            const payload = {
              action: "upload_supporting_document",
              invoice_id: invoiceId,
              document_type: fobj.type,
              file_name: fobj.file.name,
              file_content: base64,
              mime_type: fobj.file.type,
              user_email: user_email,
            };

            return axiosApi
              .post(DETAILS_API, payload)
              .then((res) => {
                const d = res?.data || {};
                const ok = d.status === "success" || d.success;
                const message = d.message || d.error || "Upload complete";

                if (ok) {
                  stopFakeProgress(fobj.id);
                  update(fobj.id, { status: "success", progress: 100 });
                  if (message) toast.success(`${fobj.file.name}: ${message}`);
                } else {
                  stopFakeProgress(fobj.id);
                  update(fobj.id, { status: "error", error: message, progress: 0 });
                  toast.error(`${fobj.file.name}: ${message}`);
                }
              })
              .catch((err) => {
                const msg =
                  err?.response?.data?.error || err?.response?.data?.message || err.message || "Upload failed";
                stopFakeProgress(fobj.id);
                update(fobj.id, { status: "error", error: msg, progress: 0 });
                toast.error(`${fobj.file.name}: ${msg}`);
              });
          })
          .catch((err) => {
            const msg = err?.message || "File read error";
            stopFakeProgress(fobj.id);
            update(fobj.id, { status: "error", error: msg, progress: 0 });
            toast.error(`${fobj.file.name}: ${msg}`);
            return Promise.resolve();
          });
      });
    }, Promise.resolve());

    chain
      .then(() => {
        Object.keys(timersRef.current).forEach((k) => {
          clearInterval(timersRef.current[k]);
          delete timersRef.current[k];
        });

        const failed = fileRefs.filter((f) => f.status === "error");
        const successCount = fileRefs.filter((f) => f.status === "success").length;

        if (failed.length === 0) {
          onSuccess && onSuccess();
          onOpenChange(false);
          setFiles([]);
        } else {
          setFiles(fileRefs);
        }
      })
      .finally(() => setUploading(false));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add Supporting Documents</h3>
          <button
            className={styles.iconBtn}
            onClick={() => {
              onOpenChange(false);
              setFiles([]);
            }}
          >
            <X />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.uploadArea}>
            <label className={styles.uploadLabel}>
              <Upload className={styles.uploadIcon} />
              <div>Click to upload or drag files here</div>
              <input type="file" multiple onChange={handleSelect} className={styles.fileInput} />
            </label>
            <div className={styles.hint}>PDF, Excel, Images, Word, CSV, Text — Max 10 MB each</div>
          </div>

          {files.length > 0 && (
            <div className={styles.filesList}>
              {files.map((f) => (
                <div key={f.id} className={styles.fileRow} style={{ alignItems: "flex-start" }}>
                  <div className={styles.fileInfo} style={{ flex: 1 }}>
                    <div className={styles.fileName}>{f.file.name}</div>
                    <div className={styles.fileMeta}>{Math.round(f.file.size / 1024)} KB</div>

                    {f.status !== "pending" && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 6, background: "#e9ecef", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${f.progress || 0}%`,
                              height: "100%",
                              transition: "width 300ms linear",
                              background:
                                f.status === "error" ? "#dc3545" : f.status === "success" ? "#198754" : "#062a63",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>
                          {f.status === "uploading" && `Uploading ${f.progress || 0}%`}
                          {f.status === "success" && "Uploaded"}
                          {f.status === "error" && `Error: ${f.error || "failed"}`}
                        </div>
                      </div>
                    )}
                  </div>

                  <select
                    className={styles.selectSmall}
                    value={f.type}
                    onChange={(e) =>
                      setFiles((s) => s.map((x) => (x.id === f.id ? { ...x, type: e.target.value } : x)))
                    }
                    disabled={uploading}
                    style={{ marginLeft: 12 }}
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.key} value={dt.key}>
                        {dt.label}
                      </option>
                    ))}
                  </select>

                  <div className={`d-flex gap-2 align-items-center ms-2 ${styles.fileActions}`}>
                    {f.status === "success" && <CheckCircle />}
                    {f.status === "error" && <AlertCircle />}
                    {f.status === "uploading" && <CircleFadingArrowUp />}
                    <button className={styles.iconBtn} onClick={() => remove(f.id)} disabled={uploading}>
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.btn}
            onClick={() => {
              onOpenChange(false);
              setFiles([]);
            }}
            disabled={uploading}
          >
            Cancel
          </button>

          <button className={styles.primary} onClick={doUpload} disabled={uploading || files.length === 0}>
            {uploading ? "Uploading..." : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
