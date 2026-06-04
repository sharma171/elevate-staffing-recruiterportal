import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { axiosApi, ThemeLoader, OverlayModal } from "../../../components";
import styles from "./BankStatementUploadModal.module.css";
import { useAuth } from "../../../authContext";
const BANK_STATEMENT_API_URL = "https://bank-statement-expenses-api-v3-305451280005.us-east1.run.app";

const BANK_AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export default function BankStatementUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [statementMonth, setStatementMonth] = useState("");
  const [statementYear, setStatementYear] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();
  const TEST_EMPLOYER_EMAIL = user?.email;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      setMessage({ type: "error", text: "Please select a PDF file" });
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Maximum file size is 10MB" });
      return;
    }
    setMessage(null);
    setFile(selectedFile);
  };

  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleUpload = () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file to upload" });
      return;
    }

    setUploading(true);
    setLoader(true);
    setMessage(null);

    fileToBase64(file)
      .then((base64Content) => {
        const payload = {
          action: "upload_bank_statement",
          user_email: TEST_EMPLOYER_EMAIL,
          file_content: base64Content,
          file_name: file.name,
          mime_type: file.type,
          statement_month: statementMonth || undefined,
          statement_year: statementYear ? parseInt(statementYear, 10) : undefined,
        };

        return axiosApi.post(BANK_STATEMENT_API_URL, payload, {
          headers: {
            Authorization: BANK_AUTH_TOKEN,
            Origin: window.location.origin,
            "Content-Type": "application/json",
          },
        });
      })
      .then((resp) => {
        const result = resp?.data;
        if (result?.status === "success") {
          setMessage({ type: "success", text: "Upload successful. Statement is being processed." });
          onSuccess && onSuccess();
          handleClose();
        } else {
          setMessage({ type: "error", text: result?.error || "Upload failed" });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "An error occurred while uploading the file" });
      })
      .finally(() => {
        setUploading(false);
        setLoader(false);
      });
  };

  const handleClose = () => {
    setFile(null);
    setStatementMonth("");
    setStatementYear("");
    setMessage(null);
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <OverlayModal
      isActive={isOpen}
      onClose={handleClose}
      style={{ maxWidth: "750px" }}
      modalStyle={{ background: "white" }}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Import Bank Statement</div>
          <div className={styles.desc}>
            Upload a PDF bank statement to automatically extract and categorize transactions
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <label className={styles.label}>Bank Statement (PDF)</label>
          <div className={styles.row}>
            <input
              value=""
              type="file"
              style={{ borderRadius: "0px" }}
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          {file && (
            <div className="mt-2 d-flex align-items-center justify-content-between p-2 border rounded bg-light">
              <div>
                Selected: {file.name} (
                {file.size / 1024 > 1024
                  ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                  : Math.round(file.size / 1024) + " KB"}
                )
              </div>

              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className={`mt-3 ${styles.grid}`}>
          <div className={styles.field}>
            <label className={styles.label}>Statement Month (Optional)</label>
            <input
              className="form-control"
              type="month"
              value={statementMonth}
              onChange={(e) => setStatementMonth(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Statement Year (Optional)</label>
            <input
              className="form-control"
              type="number"
              min="2000"
              max="2100"
              value={statementYear}
              onChange={(e) => setStatementYear(e.target.value)}
              disabled={uploading}
              placeholder="YYYY"
            />
          </div>
        </div>

        {message && (
          <div className={message.type === "error" ? styles.messageError : styles.messageSuccess}>{message.text}</div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.btnOutline} onClick={handleClose} disabled={uploading}>
          Cancel
        </button>
        <button
          className="themeButton themeButtonHover p-2 px-3 rounded"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <Upload size={20} className={styles.spinnerIcon} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Statement
            </>
          )}
        </button>
      </div>

      <ThemeLoader show={loader || uploading} />
    </OverlayModal>
  );
}
