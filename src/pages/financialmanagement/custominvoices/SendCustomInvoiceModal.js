import React, { useState, useEffect } from "react";
import { axiosApi, OverlayModal, ThemeLoader } from "../../../components";
import { toast } from "react-toastify";
import styles from "./SendCustomInvoiceModal.module.css";
import { useAuth } from "../../../authContext";
import EmailRecipients from "../../../components/RecipientsEmails";
import { Download, Eye, Paperclip, View } from "lucide-react";
import FilePreview from "../../benchcandidate/FilePreview";

const CUSTOM_INVOICE_API_URL = "https://custom-invoice-management-v3-305451280005.us-east1.run.app";

function base64ToBlob(base64, mimeType = "application/pdf") {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteArray], { type: mimeType });
}

function downloadPDF(base64, fileName) {
  const blob = base64ToBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SendCustomInvoiceModal({ open, onOpenChange, invoice, onSuccess }) {
  const { user } = useAuth();
  const employer_email = user?.email ?? "";

  const [recipientEmails, setRecipientEmails] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [recipientErrorCustom, setRecipientErrorCustom] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [showFilePreview, setShowFilePreview] = useState("");

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

  const validateEmail = (email) => {
    if (!email) return false;
    if (!EMAIL_RE.test(email)) return false;
    const [local] = email.split("@");
    if (!local) return false;
    if (local.startsWith(".") || local.endsWith(".")) return false;
    if (local.includes("..")) return false;
    return true;
  };

  const trimAndFilter = (arr) => arr.map((s) => s.trim()).filter(Boolean);

  const resetForm = () => {
    setRecipientEmails([]);
    setCcEmails([]);
    setSubject("");
    setMessage("");
    setLoading(false);
    setRecipientErrorCustom("");

    setSubjectError("");
    setMessageError("");
  };

  const closeModal = () => onOpenChange?.(false);

  function handleView() {
    setLoading(true);

    axiosApi
      .post(CUSTOM_INVOICE_API_URL, {
        action: "get_custom_invoice",
        employer_email: employer_email,
        invoice_id: invoice.invoice_id,
      })
      .then((res) => {
        const data = res.data || res;
        setShowFilePreview(data);
      })
      .catch(() => toast.error("Failed to fetch invoice"))
      .finally(() => setLoading(false));
  }

  function handleDownload() {
    setLoading(true);

    axiosApi
      .post(CUSTOM_INVOICE_API_URL, {
        action: "get_custom_invoice",
        employer_email: employer_email,
        invoice_id: invoice.invoice_id,
      })
      .then((res) => {
        const data = res.data || res;
        const pdf = data.pdf_preview || data.pdf || data;
        if (pdf && pdf.base64_content) {
          downloadPDF(pdf.base64_content, pdf.file_name || `invoice_${invoice.invoice_number}.pdf`);
        } else {
          alert("PDF not available");
        }
      })
      .catch(() => alert("Failed to download"))
      .finally(() => setLoading(false));
  }

  const validateSubjectText = (s) => {
    const max = 200;
    if (!s) return "";
    if (s.length > max) return `Subject is too long (max ${max} chars)`;
    return "";
  };

  const validateMessageText = (m) => {
    const max = 2000;
    if (!m) return "";
    if (m.length > max) return `Message is too long (max ${max} chars)`;
    return "";
  };

  const buildGlobalCounts = (recips, ccs) => {
    const counts = {};
    recips.forEach((r) => {
      const t = r.trim().toLowerCase();
      if (!t) return;
      counts[t] = (counts[t] || 0) + 1;
    });
    ccs.forEach((c) => {
      const t = c.trim().toLowerCase();
      if (!t) return;
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  };

  const validateAllFields = (showToasts = false) => {
    const trimmedRecips = recipientEmails.map((r) => r.trim());
    const trimmedCcs = ccEmails.map((c) => c.trim());
    const counts = buildGlobalCounts(trimmedRecips, trimmedCcs);

    const newRecipientErrors = trimmedRecips.map((e) => {
      if (!e) return "Recipient required";
      if (!validateEmail(e)) return "Invalid email";
      if (counts[e.toLowerCase()] > 1) return "Duplicate email";
      return "";
    });

    const newCcErrors = trimmedCcs.map((e) => {
      if (!e) return "";
      if (!validateEmail(e)) return "Invalid email";
      if (counts[e.toLowerCase()] > 1) return "Duplicate email";
      return "";
    });

    const subjErr = validateSubjectText(subject);
    const msgErr = validateMessageText(message);

    setSubjectError(subjErr);
    setMessageError(msgErr);

    const anyRecipientError = newRecipientErrors.some(Boolean);
    const anyCcError = newCcErrors.some(Boolean);
    const atLeastOneRecipient = trimmedRecips.filter(Boolean).length > 0;

    if (!atLeastOneRecipient) {
      if (showToasts) toast.error("At least one recipient is required");
      setRecipientErrorCustom("At least one recipient is required");
      return false;
    }

    if (anyRecipientError || anyCcError || subjErr || msgErr) {
      if (showToasts) toast.error("Please fix validation errors");
      return false;
    }

    return true;
  };

  useEffect(() => {
    setSubjectError(validateSubjectText(subject));
  }, [subject]);

  useEffect(() => {
    setMessageError(validateMessageText(message));
  }, [message]);

  const runFinalValidation = () => {
    return validateAllFields(true);
  };

  const buildPayload = ({ invoice_id, send_mode, recipients, ccs, email_subject, email_message }) => {
    const body = { action: "send_custom_invoice", invoice_id, send_mode, employer_email };
    if (send_mode === "send_now") {
      body.recipient_emails = recipients;
      if (ccs?.length) body.cc_emails = ccs;
      if (email_subject) body.email_subject = email_subject;
      if (email_message) body.email_message = email_message;
    }
    return body;
  };

  const handleSend = () => {
    if (!invoice) return;
    if (!runFinalValidation()) return;

    const validRecipients = trimAndFilter(recipientEmails);
    const validCC = trimAndFilter(ccEmails);

    const payload = buildPayload({
      invoice_id: invoice.invoice_id,
      send_mode: "send_now",
      recipients: validRecipients,
      ccs: validCC.length ? validCC : undefined,
      email_subject: subject || undefined,
      email_message: message || undefined,
    });

    setLoading(true);

    axiosApi
      .post(CUSTOM_INVOICE_API_URL, payload)
      .then((res) => {
        const data = res?.data ?? res;
        if (data?.status === "success" || res?.status === 200) {
          toast.success("Invoice queued for sending");
          onSuccess?.();
          closeModal();
          resetForm();
        } else {
          toast.error("Failed to send invoice");
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Please try again";
        toast.error("Failed to send invoice: " + msg);
      })
      .finally(() => setLoading(false));
  };

  const handleMarkAsSent = () => {
    if (!invoice) return;

    const payload = buildPayload({
      invoice_id: invoice.invoice_id,
      send_mode: "mark_as_sent",
    });

    setLoading(true);

    axiosApi
      .post(CUSTOM_INVOICE_API_URL, payload)
      .then((res) => {
        const data = res?.data ?? res;
        if (data?.status === "success" || res?.status === 200) {
          toast.success("Invoice marked as sent");
          onSuccess?.();
          closeModal();
          resetForm();
        } else {
          toast.error("Failed to mark invoice as sent");
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Please try again";
        toast.error("Failed to mark invoice as sent: " + msg);
      })
      .finally(() => setLoading(false));
  };

  if (!invoice) return null;

  if (showFilePreview?.pdf_preview?.base64_content) {
    return (
      <OverlayModal isActive={showFilePreview?.pdf_preview?.base64_content} onClose={() => setShowFilePreview(null)}>
        <FilePreview
          docObject={{ file_extension: "application/pdf", file_name: showFilePreview?.pdf_preview?.file_name }}
          base64File={showFilePreview?.pdf_preview?.base64_content || ""}
          setBase64File={() => setShowFilePreview(null)}
          fileType="application/pdf"
          setFileType={() => setShowFilePreview(null)}
        />
      </OverlayModal>
    );
  }

  return (
    <OverlayModal
      isActive={open}
      onClose={closeModal}
      modalStyle={{ background: "#fff" }}
      style={{ maxWidth: "750px" }}
    >
      <div>
        <div className="h5 fw-semibold">Invoice Preview</div>
        <div className={styles.ciInfo}>
          <div className={styles.ciRow}>
            <div className={styles.ciLabel}>Invoice Number</div>
            <div className={styles.ciValue}>{invoice.invoice_number}</div>
          </div>

          <div className={styles.ciRow}>
            <div className={styles.ciLabel}>Total Amount</div>
            <div className={styles.ciValue}>
              ${Number(invoice.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div className={`my-2 mb-3 ${styles.ciSection}`}>
          <EmailRecipients
            emailRecipients={recipientEmails}
            setEmailRecipients={setRecipientEmails}
            errorCustom={recipientErrorCustom}
            setErrorCustom={setRecipientErrorCustom}
          />
        </div>
        <div className={`my-2 mb-3 ${styles.ciSection}`}>
          <EmailRecipients
            title="CC Emails:"
            emailRecipients={ccEmails}
            setEmailRecipients={setCcEmails}
            placeholder="CC Emails"
            buttonTitle="Add CC Email"
          />
        </div>
        <div className={`my-2 mb-3 ${styles.ciSection}`}>
          <label className={styles.ciFieldLabel}>Subject</label>
          <input
            className={styles.ciInput}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={`Invoice ${invoice.invoice_number} from your company`}
            aria-invalid={Boolean(subjectError)}
            maxLength={200}
          />
          {subjectError ? <div style={{ color: "#dc2626", fontSize: 13 }}>{subjectError}</div> : null}
        </div>
        <div className={`my-2 mb-3 ${styles.ciSection}`}>
          <label className={styles.ciFieldLabel}>Message</label>
          <textarea
            className={styles.ciTextarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={"Dear Client,\n\nPlease find attached your invoice.\n\nBest regards"}
            aria-invalid={Boolean(messageError)}
            maxLength={2000}
          />
          {messageError ? <div style={{ color: "#dc2626", fontSize: 13 }}>{messageError}</div> : null}
        </div>
        <div className={styles.attachmentssection}>
          <div className="d-flex gap-1 fw-bold align-items-center mb-3">
            <Paperclip size={16} />
            Attachments
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className={styles.attachmentsBox}>
              <div>
                <div>Invoice</div>
                <div className="font12">{invoice.invoice_number}</div>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span title="View" className="pointer" onClick={handleView}>
                  <Eye size={16} />
                </span>
                <span title="Download" className="pointer" onClick={handleDownload}>
                  <Download size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={`my-3 mt-4 ${styles.ciActions}`}>
          <button type="button" onClick={handleMarkAsSent} disabled={loading} className={styles.ciBtnOutline}>
            Mark as Sent (External)
          </button>

          <div className={styles.ciActionsRight}>
            <button type="button" onClick={closeModal} disabled={loading} className={styles.ciBtnOutline}>
              Cancel
            </button>

            <button type="button" onClick={handleSend} disabled={loading} className={styles.ciBtnPrimary}>
              {loading ? "Sending..." : "Send Invoice"}
            </button>
          </div>
        </div>
        <ThemeLoader show={loading} />{" "}
      </div>
    </OverlayModal>
  );
}
