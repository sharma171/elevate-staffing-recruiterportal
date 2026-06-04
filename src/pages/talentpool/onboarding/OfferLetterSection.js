import { useState, useEffect, useCallback, useMemo } from "react";
import { Whisper, Tooltip } from "rsuite";

import { toast } from "react-toastify";
import {
  Send,
  Download,
  Eye,
  Loader2,
  Mail,
  Clock,
  RefreshCw,
  Edit3,
  PenTool,
  Paperclip,
  X,
  Info,
  Link2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Upload,
  RotateCcw,
  FileText,
  FolderPlus,
  ChevronDown,
  History,
  CheckCircle,
  AlertTriangle,
  Check,
  ChevronUp,
  Sparkles,
} from "lucide-react";

import styles from "./OfferLetterSection.module.css";
import { useAuth } from "../../../authContext";
import axios from "axios";
import ReactDOM from "react-dom";
import { IoMdClose } from "react-icons/io";
import { axiosApi, OverlayModal, ThemeLoader, Confirm } from "../../../components";
import ReviseOfferModal from "./ReviseOfferModal";
import FilePreview from "../../benchcandidate/FilePreview";
import DocumentsSection from "../DocumentsSection";
import moment from "moment";
import ContactMail from "../ContactMail";
import sendEncryptedRequest from "../../../components/EncryptedRequest";
import { getDeviceData } from "../../../DeviceStore";

const BASE_URL = "https://contact-employees-via-email-v3-305451280005.us-east1.run.app";

const SIGNATURE_API_URL = "https://get-document-signature-employee-handler-v1-305451280005.us-east1.run.app";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const SuccessPopupModal = ({ setIsSuccess, onClose, offerDetails, signatureResponse }) => {
  return (
    <>
      <div>
        <div className={`hidemodalclosebtn ${styles.complete_overlay}`} />

        <div role="alertdialog" aria-modal="true" className={styles.complete_dialog}>
          <div className="gap-2 d-flex align-items-center justify-content-between">
            <div className="text-success fw-semibold gap-2 d-flex align-items-center">
              <CheckCircle size={18} />

              <h2 className={styles.complete_title}>Signature Request Sent Successfully!</h2>
            </div>
            <div
              className="hidemodalclosebtn pdfcontrollButtonsPDF d-flex justify-content-center align-items-center pointer"
              onClick={() => {
                setIsSuccess();
                onClose(true);
              }}
            >
              <X size={20} strokeWidth={3} />
            </div>
          </div>

          <div className="my-3 p-3" style={{ background: "#f1f1f980" }}>
            <div className="d-flex gap-2 align-items-center justify-content-between mb-2">
              <div>Employee:</div>
              <span className="fw-bold">{offerDetails.candidateName || ""}</span>
            </div>
            <div className="d-flex gap-2 align-items-center justify-content-between mb-2 w-100 overflow-hidden">
              <div>Document:</div>
              <span className="fw-bold text-truncate" title={signatureResponse?.document_filename}>
                {signatureResponse?.document_filename || ""}
              </span>
            </div>
            <div className="d-flex gap-2 align-items-center justify-content-between mb-2">
              <div>status:</div>
              <SignatureStatusBadge status="pending" />
            </div>
            {signatureResponse.expires_at ? (
              <div className="d-flex gap-2 align-items-center justify-content-between mb-2">
                <div>Expires:</div>
                <span className="fw-bold">
                  {moment(signatureResponse.expires_at).format("MMMM D, YYYY [at] h:mm A")}
                </span>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className="d-flex gap-2 p-3 border rounded fw-medium"
            style={{ background: "#eff6ff", color: "#1d4ed8" }}
          >
            <Mail className="mt-1" size={18} style={{ flexShrink: 0 }} />
            <div>
              An email with a secure signing link has been sent to the employee. They must sign the document within 7
              days.
            </div>
          </div>

          <div className={styles.complete_footer}>
            <button
              type="button"
              className={`themePurpleBGHover px-3 py-2 rounded text-white`}
              onClick={() => {
                setIsSuccess(false);
                onClose(true);
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function PreparingEmailPopup({ show }) {
  if (!show) {
    return;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          masWidth: "400px",
        }}
      >
        <div className="spinner-border spinner-border-sm text-primary" role="status" />

        <div style={{ position: "relative" }}>
          <Mail
            size={32}
            style={{
              color: "#7c3bed",
            }}
          />

          {/* <div
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
            }}
          >
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          </div> */}
        </div>

        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontWeight: 500,
              color: "#111827",
            }}
          >
            Preparing Email
          </p>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Generating content and attaching signed offer...
          </p>
        </div>
      </div>
    </div>
  );
}

function CancelOrWithdrawOfferDialog({ open, onClose, offerDetails, candidate }) {
  const [reason, setReason] = useState("");
  const [notifyCandidate, setNotifyCandidate] = useState(true);
  const [loading, setLoading] = useState(false);

  let candidateName = candidate?.first_name + " " + candidate?.last_name;
  let candidateEmail = candidate?.original_email;

  // candidateEmail = "muni.k0892@gmail.com";

  const { user } = useAuth();
  let adminEmail = user.email;
  // adminEmail = "marketing@4spheresolutions.com";

  let currentSignatureStatus = offerDetails?.signature_status;

  const isSigned = String(currentSignatureStatus).toLowerCase() == "signed";

  if (!open) return null;

  function handleConfirm() {
    if (isSigned && !reason) return;

    setLoading(true);

    const payload = {
      action: "cancel_offer",
      sender_email: adminEmail,
      candidate_email: candidateEmail,
      cancellation_reason: reason,
      notify_candidate: notifyCandidate,
    };

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        onClose(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something want wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleClose() {
    setReason("");
    setNotifyCandidate(true);
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 50,
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: 450,
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          padding: "10px 24px 24px 24px",
          zIndex: 51,
          boxShadow: "0 20px 25px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div className="mb-3">
          <div className="mb-1 d-flex align-items-center gap-2 justify-content-between">
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              <XCircle size={20} color="#dc2626" />
              {isSigned ? "Withdraw Offer" : "Cancel Offer"}
            </h2>

            <button type="button" onClick={handleClose} className="hidemodalclosebtn pdfcontrollButtonsPDF">
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          <p className="fw-medium" style={{ color: "#67677e" }}>
            {isSigned
              ? "This offer has already been signed. Withdrawing it will invalidate the signed document."
              : "This will cancel the current offer and invalidate any signing links."}
          </p>
        </div>

        {/* Alert */}
        {isSigned && (
          <div
            className="d-flex align-items-center gap-2 p-3 my-3"
            style={{
              border: "1px solid #fde68a",
              background: "#fffbeb",
              color: "#b45309",
            }}
          >
            <AlertTriangle size={18} strokeWidth={3} />
            <span>⚠️ This offer has already been signed.</span>
          </div>
        )}

        {/* Content */}
        <p className="mb-3 fw-medium">
          Are you sure you want to {isSigned ? "withdraw" : "cancel"} the offer for{" "}
          <strong style={{ color: "#080118" }}>{candidateName}</strong> ({candidateEmail})?
        </p>

        {/* Reason */}
        <div style={{ marginBottom: 16 }}>
          <label className="fw-semibold">
            Reason <span className="text-danger">*</span>
          </label>

          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isSigned ? "e.g., Candidate accepted another offer" : "e.g., Position filled by another candidate"
            }
            style={{
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              resize: "none",
            }}
          />
        </div>

        {/* Checkbox */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            cursor: "pointer",
          }}
          onClick={() => setNotifyCandidate(!notifyCandidate)}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "1px solid #7c3bed",
              background: notifyCandidate ? "#7c3bed" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 300,
            }}
          >
            {notifyCandidate && <Check size={12} color="#fff" />}
          </div>

          <span className="fw-semibold">Notify candidate via email</span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (isSigned && !reason)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              opacity: loading || (isSigned && !reason) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm text-light" role="status" aria-hidden="true" />
                {isSigned ? "Withdrawing..." : "Cancelling..."}
              </>
            ) : (
              <>
                <XCircle size={16} />
                {isSigned ? "Confirm Withdrawal" : "Confirm Cancellation"}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export function SendOfferLetterModal(props) {
  const {
    open,
    onClose,
    candidate,
    offerDetails,
    defaultSubject = "",
    defaultBody = "",
    defaultAttachments = [],
    isCustomTab,
    jobDescription,
    customData = {},
  } = props;

  const [emailSubject, setEmailSubject] = useState(defaultSubject);
  const [emailBody, setEmailBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState(defaultAttachments);
  const [requireSignature, setRequireSignature] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signatureResponse, setsignatureResponse] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});

  let { keys, fingerprints } = getDeviceData();

  const { user } = useAuth();
  const adminEmail = user?.email;

  useEffect(() => {
    if (open) {
      setEmailSubject(defaultSubject);
      setEmailBody(defaultBody);
      setAttachments(defaultAttachments);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const recipientEmail = candidate?.original_email || candidate?.email || "";

  function handleFileUpload(e) {
    if (!e.target.files) return;

    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            contentType: file.type,
            content: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  const updateCandidateDetails = async (formData, data) => {
    const candidateID = candidate?.id;

    if (!candidateID) {
      return;
    }

    let columns = {};

    if (formData.Volunteer) {
      columns = { volunteer_work: formData.Volunteer };
    }

    columns.pay_type = formData?.pay_type || customData?.["Pay Type"];

    if (formData.Position) {
      columns.job_title = formData.Position;
    }

    if (formData.Salary) {
      columns.employee_salary = formData.Salary;
    }

    if (formData["Start Date"]) {
      columns.employment_start_date = formData["Start Date"];
    }

    if (!Object.keys(columns).length) {
      return;
    }

    let payload = {
      emailid: user.email,
      modify: {
        columns: columns,
        id: String(candidateID),
      },
    };

    setIsSending(true);

    sendEncryptedRequest(payload, keys, fingerprints)
      .then((res) => {
        const updatedFields = res?.data?.fields_updated;

        if (updatedFields.includes("volunteer_work")) {
          candidate.volunteer_work = formData.Volunteer;
        }

        if (updatedFields.includes("job_title")) {
          candidate.job_title = formData.Position;
        }

        if (updatedFields.includes("employee_salary")) {
          candidate.employee_salary = formData.Salary;
        }

        if (updatedFields.includes("employment_start_date")) {
          candidate.employment_start_date = formData["Start Date"];
        }
      })
      .catch((err) => {
        console.log(err, "sssssssss");
      });

    setIsSending(false);
  };

  function handleSend() {
    let newErrors = {};
    let isValid = true;

    if (!emailSubject.trim()) {
      newErrors.emailSubject = "Subject is required";
      isValid = false;
    }
    if (!emailBody.trim()) {
      newErrors.emailBody = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      // toast.error("Subject and message are required");
      return;
    }

    setIsSending(true);

    const templateData = {
      "Letter Date": offerDetails.letterDate,
      "Full Name": offerDetails.candidateName,
      "Employee Email": recipientEmail,
      "First Name": offerDetails.candidateName.split(" ")[0],
      Position: offerDetails.Position,
      Salary: offerDetails.Salary,
      "Start Date": offerDetails["Start Date"],
      Volunteer: offerDetails.Volunteer,
      "Job Description": jobDescription || customData?.["Job Description"],
      "Pay Type": offerDetails?.pay_type || customData?.["Pay Type"],
    };

    let payloadData = {};

    if (isCustomTab) {
      payloadData = {
        action: "send_custom_document",
        document_type: "offer_letter",
        file_content: defaultAttachments[0]?.content,
        file_name: defaultAttachments[0]?.name,
        recipient_email: recipientEmail,
        sender_email: adminEmail,
        template_data: templateData,
        output_format: "pdf",
        send_email: true,
        use_gpt: true,
      };
    } else {
      payloadData = {
        action: "generate_letter",
        sender_email: adminEmail,
        recipient_email: recipientEmail,
        template_type: "offer_letter",
        template_data: templateData,
        output_format: "pdf",
        require_signature: true,
      };
    }

    // ================= SIGNATURE FLOW =================
    if (requireSignature) {
      axios
        .post(BASE_URL, payloadData)
        .then((res) => {
          updateCandidateDetails(offerDetails, candidate);
          setsignatureResponse(res?.data);

          toast.success("Signature request sent successfully");
          setIsSuccess(true);
        })
        .catch(() => {
          toast.error("Failed to send signature request");
        })
        .finally(() => {
          setIsSending(false);
        });

      return;
    }

    // ================= NORMAL EMAIL FLOW =================
    axios
      .post(BASE_URL, {
        action: "generate_custom_email_send",
        sender_email: adminEmail,
        recipient_email: recipientEmail,
        email_subject: emailSubject,
        email_body_html: `<html><body>${emailBody.replace(/\n/g, "<br>")}</body></html>`,
        attachments: attachments,
        require_signature: false,
      })
      .then((res) => {
        updateCandidateDetails(offerDetails, candidate);

        toast.success("Offer email sent successfully");
        onClose(true);
      })
      .catch(() => {
        toast.error("Failed to send email");
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  return (
    <OverlayModal isActive={open} onClose={onClose} modalStyle={{ background: "#fff" }} style={{ maxWidth: "750px" }}>
      <div>
        {/* Header */}
        <div className="px-2 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2 h5 fw-bold">
            <Mail size={20} />
            <span>Send Offer Letter</span>
          </div>
          <p className="text-muted mt-1">
            Compose and send the offer letter to {candidate?.first_name} {candidate?.last_name}
          </p>
        </div>

        {/* Body */}
        <div className="px-2 py-3 d-flex flex-column gap-3">
          <div>
            <label className="mb-1 fw-semibold">To:</label>
            <input disabled value={recipientEmail} className="form-control bg-light" />
          </div>

          <div>
            <label className="mb-1 fw-semibold">
              Subject: <span className="text-danger">*</span>
            </label>
            <input
              value={emailSubject}
              onChange={(e) => {
                setEmailSubject(e.target.value);
                if (errors.emailSubject) setErrors({ ...errors, emailSubject: null });
              }}
              placeholder="Email subject"
              className="form-control bigHoverInput"
            />
            {errors.emailSubject && <div className="text-danger font12 mt-1">{errors.emailSubject}</div>}
          </div>

          <div>
            <label className="mb-1 fw-semibold">
              Message: <span className="text-danger">*</span>
            </label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => {
                setEmailBody(e.target.value);
                if (errors.emailBody) setErrors({ ...errors, emailBody: null });
              }}
              placeholder="Email message"
              className="form-control bigHoverInput"
            />
            {errors.emailBody && <div className="text-danger font12 mt-1">{errors.emailBody}</div>}
          </div>

          {/* Signature Toggle */}
          <div className="p-3 border rounded bg-light d-flex gap-3">
            <input
              type="checkbox"
              className="form-check-input bigHoverInput mt-2"
              checked={requireSignature}
              onChange={(e) => setRequireSignature(e.target.checked)}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="fw-semibold">Require Digital Signature</span>

                <Whisper
                  trigger="hover"
                  placement="auto"
                  container={() => document.body}
                  speaker={
                    <Tooltip
                      style={{
                        zIndex: 99999999999,
                        background: "#fff",
                        color: "black",
                        boxShadow: "0px 0px 5px 0px #6a6a6a6e",
                        padding: "10px",
                        fontSize: 14,
                        minWidth: "270px",
                      }}
                    >
                      <p>
                        <b>When checked:</b>
                      </p>
                      <ul>
                        <li>Employee receives a secure email with a signing link</li>
                        <li>Document is NOT attached to the email</li>
                        <li>Employee must sign within 7 days</li>
                        <li>You&apos;ll receive confirmation when signed</li>
                      </ul>
                    </Tooltip>
                  }
                >
                  <span
                    style={{
                      display: "inline-flex",
                      padding: 6,
                      cursor: "help",
                      pointerEvents: "auto",
                    }}
                  >
                    <Info size={16} />
                  </span>
                </Whisper>
              </div>
              <p className="text-muted mb-0">Send a secure signing link instead of attaching the document</p>
            </div>
          </div>

          {/* Attachments */}
          {!requireSignature && (
            <div>
              <label className="mb-1 fw-semibold">Attachments:</label>
              <div className="d-flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center gap-2 px-3 py-1 bg-dark bg-opacity-10 rounded-pill fw-semibold"
                  >
                    <Paperclip size={14} />
                    <span className="text-truncate" style={{ width: 125 }} title={a?.name}>
                      {a?.name}
                    </span>
                    <span title="Remove">
                      <X size={13} className="cursor-pointer" onClick={() => removeAttachment(i)} />
                    </span>
                  </div>
                ))}
              </div>

              <label className="d-inline-block mt-2 cursor-pointer">
                <input className="bigHoverInput" type="file" multiple hidden onChange={handleFileUpload} />

                <div className="d-flex align-items-center gap-2 my-2 rounded px-3 py-2 btn btn-outline-primary">
                  <Paperclip size={16} /> <span>Add attachment</span>
                </div>
              </label>
            </div>
          )}

          {requireSignature && (
            <div className="d-flex gap-2 p-3 bg-primary bg-opacity-10 border rounded">
              <Link2 size={16} className="text-primary" />
              <p className="text-primary mb-0">
                The offer letter will not be attached. Instead, the employee will receive a secure link to view and sign
                the document online.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-2 py-3 border-top d-flex justify-content-end gap-2">
          <button onClick={onClose} className="btn btn-outline-secondary">
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={isSending}
            className="themePurpleBGHover text-white rounded px-3 fw-medium py-2 d-flex align-items-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="spinner-border spinner-border-sm" />
                <span>Sending...</span>
              </>
            ) : requireSignature ? (
              <>
                <PenTool size={16} />
                <span>Send Signature Request</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isSuccess ? (
        <SuccessPopupModal
          setIsSuccess={setIsSuccess}
          onClose={onClose}
          offerDetails={offerDetails}
          signatureResponse={signatureResponse}
        />
      ) : (
        <></>
      )}
    </OverlayModal>
  );
}

export function PdfPreviewModal({ file, onClose, onAttach }) {
  const pdfBlob = useMemo(() => {
    if (!file) return null;

    if (file instanceof Blob) {
      return file;
    }

    if (typeof file === "string") {
      return new Blob([Uint8Array.from(atob(file), (c) => c.charCodeAt(0))], { type: "application/pdf" });
    }

    if (file?.content) {
      return new Blob([Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0))], { type: "application/pdf" });
    }

    return null;
  }, [file]);

  if (!pdfBlob) return null;

  const fileName = file?.name || "document.pdf";

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(pdfBlob);
    a.download = fileName;
    a.click();
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 99999999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "90%",
          height: "97%",
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0.8rem 1rem",
            borderBottom: "1px solid #ccc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h5 className="mb-0">📄 Offer Letter Preview</h5>
            {/* <div>Review the offer letter before sending</div> */}
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>

        <iframe src={URL.createObjectURL(pdfBlob)} style={{ flex: 1, border: "none" }} />

        <div
          className="d-flex gap-3 justify-content-end"
          style={{
            padding: "0.8rem 1rem",
            borderTop: "1px solid #ccc",
          }}
        >
          <button className="btn btn-outline-secondary py-2 d-flex align-items-center gap-2" onClick={downloadPdf}>
            <Download size={16} />
            Download
          </button>
          <button
            className="themeButton themeButtonHover py-2 px-3 d-flex align-items-center gap-2"
            style={{ borderRadius: 5 }}
            onClick={onAttach}
          >
            <Send size={16} />
            Send to Candidate
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const statusConfig = {
  withdrawn: {
    text: "Withdrawn",
    bgColor: "#FEE2E2",
    textColor: "#B91C1C",
    Icon: XCircle,
  },
  pending: {
    text: "Awaiting Signature",
    bgColor: "#FEF3C7",
    textColor: "#B45309",
    Icon: Clock,
  },
  viewed: {
    text: "Link Opened",
    bgColor: "#DBEAFE",
    textColor: "#1D4ED8",
    Icon: Eye,
  },
  signed: {
    text: "Signed Successfully",
    bgColor: "#DCFCE7",
    textColor: "#15803D",
    Icon: CheckCircle2,
  },
  expired: {
    text: "Link Expired",
    bgColor: "#FEE2E2",
    textColor: "#B91C1C",
    Icon: AlertCircle,
  },
  cancelled: {
    text: "Cancelled",
    bgColor: "#F3F4F6",
    textColor: "#374151",
    Icon: XCircle,
  },
  superseded: {
    text: "Superseded",
    bgColor: "#FFEDD5",
    textColor: "#C2410C",
    Icon: RotateCcw,
  },
  issued_outside_system: {
    text: "Issued Outside System",
    bgColor: "#EDE9FE",
    textColor: "#6D28D9",
    Icon: FileText,
  },
};

function SignatureStatusBadge({ status, className = "", versionNumber }) {
  const config = statusConfig[status] || {
    text: status || "Unknown",
    bgColor: "#E5E7EB",
    textColor: "#4B5563",
    Icon: HelpCircle,
  };

  const { text, bgColor, textColor, Icon } = config;

  return (
    <span
      className={`d-inline-flex align-items-center rounded-pill fw-medium ${className}`}
      style={{
        gap: "6px",
        padding: "4px 12px",
        fontSize: "0.875rem",
        backgroundColor: bgColor,
        color: textColor,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} />
      <span>{text}</span>
      {versionNumber && versionNumber > 1 && (
        <span style={{ fontSize: "14px", opacity: 0.85 }}>(v{versionNumber})</span>
      )}
    </span>
  );
}

export default function OfferLetterSection({ candidate, disabled, onStatusChange }) {
  const [offerDetails, setOfferDetails] = useState({
    letterDate: "",
    candidateName: "",
    Position: "",
    Salary: "",
    "Start Date": "",
    pay_type: "hourly",
  });

  const [errors, setErrors] = useState({});

  let candidate_email = candidate?.original_email;
  // candidate_email = "muni.k0892@gmail.com";

  const { user } = useAuth();
  let adminEmail = user.email;
  // adminEmail = "marketing@4spheresolutions.com";

  const [offerStatus, setOfferStatus] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState("pending");

  const [showAudit, setShowAudit] = useState(false);
  const [showRevise, setShowRevise] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [offerLetterData, setOfferLetterData] = useState({});
  const [emailData, setemailData] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [sendOfferFile, setSendOfferFile] = useState(null);
  const [offerLatterHistoryData, setofferLatterHistoryData] = useState(null);
  const [offerHistoryData, setOfferHistoryData] = useState(null);
  const [showOfferHistory, setShowOfferHistory] = useState(null);
  const [showReviseOfferModal, setShowReviseOfferModal] = useState(false);
  const [showResendMailBox, setShowResendMailBox] = useState(false);
  const [showFilePreview, setshowFilePreview] = useState(false);
  const [openSaveTovault, setOpenSaveTovault] = useState(false);
  const [updatedFile, setupdatedFile] = useState(false);
  const [activityData, setactivityData] = useState({});
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [cancelOffer, setCancelOffer] = useState(false);
  const [sendOfferToCandidate, setSendOfferToCandidate] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [activeTab, setActiveTab] = useState("template");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signatureResponse, setsignatureResponse] = useState({});
  const [customData, setCustomData] = useState({});

  const offerletterTempleteData = offerLatterHistoryData?.template_data || {};
  const signature_token = offerLatterHistoryData?.signature_token || "";
  const signature_status = offerLatterHistoryData?.signature_status;
  const isCustomTab = activeTab === "custom";

  let defaultEmailMessage = `Send the signed offer letter to ${candidate.first_name || ""} ${candidate.last_name || ""} for the ${offerletterTempleteData?.Position || ""} position. Congratulate them on officially joining and confirm their start date of ${offerletterTempleteData?.["Start Date"] || ""}. Let them know this signed document is their copy for their records.`;

  const checkStatus = () => {
    getOfferStatus();
    getOfferHistory();
  };

  const handleGenerate = () => {
    const payload = {
      action: "generate_job_description",
      sender_email: adminEmail,
      position: offerDetails.Position,
    };

    setIsLoading(true);
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setJobDescription(res.data.responsibilities.join("\n"));
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const offerHistoryTomap = offerHistoryData?.history;

  useEffect(() => {
    if (candidate_email) {
      getOfferStatus();
      getOfferHistory();
    }
  }, [candidate_email]);

  useEffect(() => {
    if (!candidate) return;

    setOfferDetails({
      letterDate: new Date().toISOString().split("T")[0],
      candidateName: `${candidate?.first_name || ""} ${candidate?.last_name || ""}`.trim(),
      Position: candidate?.job_title || "",
      Salary: candidate?.employee_salary || "",
      "Start Date": candidate?.employment_start_date || "",
      Volunteer: candidate.volunteer_work,
      pay_type: candidate?.pay_type || "hourly",
    });
  }, [JSON.stringify(candidate)]);

  useEffect(() => {
    if (signature_token) {
      getOfferactivityData();
    }
  }, [signature_token]);

  const downloadPDFFile = () => {
    const pdfFile = offerLatterHistoryData?.signed_document_content;

    if (!pdfFile) {
      toast.error("PDF file not available");
      return;
    }

    fetch(`data:application/pdf;base64,${pdfFile}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "offer-letter.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("PDF downloaded successfully");
      })
      .catch(() => {
        toast.error("Failed to download PDF");
      });
  };

  async function generateCustomEmail() {
    setLoadingGenerate(true);
    try {
      const payload = {
        action: "generate_custom_email",
        sender_email: user.email,
        email_description: defaultEmailMessage,
        use_gpt: true,
        template_data: offerletterTempleteData,
      };
      const res = await axios.post(BASE_URL, payload);

      const newFile = {
        content: offerLatterHistoryData?.signed_document_content,
        name: offerLatterHistoryData?.document_filename,
        contentType: offerLatterHistoryData?.document_type,
      };
      setSendOfferToCandidate({ file: [newFile], data: res.data });
    } catch (err) {
      toast.error(err.message || "Generation failed");
    } finally {
      setLoadingGenerate(false);
    }
  }

  const resendemailTocandidate = () => {
    let payload = {
      sender_email: adminEmail,
      recipient_email: candidate_email,
      template_type: "offer_letter",
      action: "generate_letter",
      template_data: {
        "Letter Date": offerDetails["Letter Date"],
        "Full Name": offerDetails.candidateName,
        "Employee Email": candidate_email,
        "First Name": candidate?.first_name || offerDetails.candidateName.split(" ")[0],
        Position: offerDetails.Position,
        Salary: offerDetails.Salary,
        "Start Date": offerDetails["Start Date"],
      },
      output_format: "pdf",
      require_signature: true,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res.data.message || "Verification email sent successfully.");
        getOfferStatus();

        getOfferHistory();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to resend verification email. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  };

  const getOfferactivityData = () => {
    const payload = {
      action: "get_signature_status",
      signature_token: signature_token,
    };

    setLoading(true);

    axiosApi
      .post(SIGNATURE_API_URL, payload)
      .then((res) => {
        setactivityData(res?.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const getOfferStatus = () => {
    const payload = {
      action: "get_candidate_offer_tracking",
      emailid: adminEmail,
      candidate_email: candidate_email,
    };

    setLoading(true);

    axiosApi
      .post(SIGNATURE_API_URL, payload)
      .then((res) => {
        let isOfferFound = res?.data?.offer_found;
        setFile(null);
        if (isOfferFound) {
          setofferLatterHistoryData(res?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const getOfferHistory = () => {
    const payload = {
      action: "get_offer_history",
      emailid: adminEmail,
      sender_email: adminEmail,
      candidate_email: candidate_email,
    };

    setLoading(true);

    axiosApi
      .post(SIGNATURE_API_URL, payload)
      .then((res) => {
        setOfferHistoryData(res?.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const generatePreview = (newData = offerDetails, setLoad = () => {}) => {
    let newErrors = {};
    let isValid = true;

    if (!newData?.candidateName?.trim()) {
      newErrors.candidateName = "Candidate Name is required";
      isValid = false;
    }
    if (!newData.Position?.trim()) {
      newErrors.Position = "Position is required";
      isValid = false;
    }
    if (!newData.Salary?.trim()) {
      newErrors.Salary = "Salary is required";
      isValid = false;
    }
    if (!newData["Start Date"]) {
      newErrors["Start Date"] = "Start Date is required";
      isValid = false;
    }

    if (isCustomTab && !file) {
      newErrors.file = "PDF File is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      // toast.error("Please fill in all required fields");
      return;
    }

    if (isCustomTab) {
      // setsignatureResponse(res?.data);
      // toast.success("Signature request sent successfully");
      // setIsSuccess(true);
      setemailData({ defaultBody: jobDescription });
      setPdfFile({
        name: file.name || `${newData.candidateName?.trim().replace(/\s+/g, "_")}_offer.pdf`,
        content: file.content,
        contentType: "application/pdf",
      });
      return;
    }

    const templateData = {
      "Letter Date": newData?.letterDate,
      "Full Name": newData.candidateName?.trim(),
      "Employee Email": candidate.original_email,
      "First Name": newData.candidateName?.trim().split(" ")[0] || "",
      Position: newData.Position,
      Volunteer: newData.Volunteer,
      Salary: newData.Salary,
      "Start Date": newData["Start Date"],
      "Job Description": newData?.["Job Description"] || jobDescription,
      "Pay Type": newData?.pay_type,
    };

    setCustomData({
      "Pay Type": newData?.pay_type,
      "Job Description": newData?.["Job Description"] || jobDescription,
    });

    let payload = {
      action: "send_offer_letter",
      sender_email: adminEmail,
      template_data: templateData,
      output_format: "pdf",
      preview: true,
      use_gpt: true,
    };

    if (isCustomTab) {
      payload = {
        action: "send_custom_document",
        document_type: "offer_letter",
        file_content: file?.content,
        file_name: file?.name,
        recipient_email: candidate.original_email,
        sender_email: adminEmail,
        template_data: templateData,
        output_format: "pdf",
        send_email: true,
        use_gpt: true,
      };
    }

    if (newData?.revision_reason) {
      payload.revision_reason = newData?.revision_reason;
    }

    setLoading(true);
    setLoad(true);
    axios
      .post(BASE_URL, payload)
      .then((res) => {
        setOfferLetterData(res);
        let subject = res?.data?.email_subject || "Job Offer";
        let body = res?.data?.email_body_html?.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
        const b64 = res.data.document_content;
        setShowReviseOfferModal(false);

        setemailData({ defaultSubject: subject, defaultBody: body || jobDescription });

        if (isCustomTab) {
          setsignatureResponse(res?.data);
          toast.success("Signature request sent successfully");
          setIsSuccess(true);
        } else {
          setPdfFile({
            name: `${newData.candidateName?.trim().replace(/\s+/g, "_")}_offer.pdf`,
            content: b64,
            contentType: "application/pdf",
          });
        }

        // toast.success("Offer generated");
      })
      .catch((err) => toast.error(err?.response?.data?.error || "failed to generate"))
      .finally(() => {
        setLoad(false);
        setLoading(false);
      });
  };

  const handleDownload = (fileOBJ) => {
    const link = document.createElement("a");
    link.href = "data:application/pdf;base64," + fileOBJ.base64;
    link.download = fileOBJ?.file_name || "file.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function offerLetterSection() {
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64Content = reader.result.split(",")[1];

        const fileObject = {
          name: selectedFile.name,
          size: selectedFile.size,
          content: base64Content,
        };

        setFile(fileObject);
        // Clear error if file is selected
        if (errors.file) {
          setErrors({ ...errors, file: null });
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
      };

      reader.readAsDataURL(selectedFile);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-end justify-between mb-2">
            <label className="fw-semibold">
              Job Description{" "}
              {isCustomTab ? (
                <span className="font12" style={{ color: "#67677e" }}>
                  (Optional — saved to records only)
                </span>
              ) : (
                <></>
              )}
            </label>

            <div className="d-flex align-items-center gap-2">
              {jobDescription && !isLoading ? (
                <div
                  onClick={() => setJobDescription("")}
                  disabled={isLoading}
                  className="pointer successoutlineButton m-0 rounded-[10px]"
                >
                  <X size={18} /> Clear
                </div>
              ) : (
                <></>
              )}
              <div
                onClick={!isLoading ? handleGenerate : undefined}
                className={`successoutlineButton m-0 rounded-[10px]
                  ${isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer text-[#000]"}
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span className="animate-pulse">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />✨ Generate with AI
                  </>
                )}
              </div>
            </div>
          </div>

          <textarea
            rows={4}
            placeholder="Enter each responsibility on a new line (max 7)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="bigHoverInput form-control"
          />

          <p className="text-xs text-muted-foreground">
            Each line becomes a bullet point in the offer letter (max 7 lines).
          </p>
        </div>

        {isCustomTab ? (
          <div className="space-y-2">
            <label className="fw-semibold leading-none">
              Upload PDF File <span className="text-danger">*</span>
            </label>

            <div
              className={`!border-2 border-dashed border-[#e7e7ef] rounded-[10px] p-3 space-y-2 ${file ? "" : "hover:border-[#b5b5b5] pointer"}`}
            >
              {!file ? (
                <label className="cursor-pointer flex flex-col items-center gap-2 py-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to select PDF file</span>
                  <span className="text-xs text-muted-foreground">Only .pdf files accepted (max 10MB)</span>

                  <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="flex bg-[#f1f1f9] px-3 py-2 rounded-[10px] gap-2 align-items-center justify-content-between w-100 !overflow-hidden">
                  <div className="flex gap-2 align-items-center w-100 !overflow-hidden">
                    <FileText size={20} className="text-[#7c3bed] shrink-0" />
                    <div className="text-[14px] font-medium text-truncate" title={file.name}>
                      {file.name}
                    </div>
                  </div>
                  <div onClick={() => setFile()} className="pointer successoutlineButton">
                    <X size={16} />
                  </div>
                </div>
              )}
            </div>
            {errors.file && <div className="text-danger font12 mt-1">{errors.file}</div>}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  function offerLetterTabs() {
    return (
      <div className="signatureContainer w-full mb-2">
        <div className="grid w-full grid-cols-2 rounded-[10px] bg-[#f1f1f9] p-1 h-10">
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setActiveTab("template");
              setErrors({});
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] fw-semibold px-3 py-1.5 text-sm transition-all
            ${activeTab === "template" ? "bg-[#fff] text-[#000]" : "text-muted-foreground bg-transparent"}
          `}
          >
            <FileText className="h-4 w-4" />
            <span>Generate from Template</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFile(null);
              setActiveTab("custom");
              setErrors({});
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] fw-semibold px-3 py-1.5 text-sm transition-all
            ${isCustomTab ? "bg-[#fff] text-[#000]" : "text-muted-foreground bg-transparent"}
          `}
          >
            <Upload className="h-4 w-4" />
            <span className="">Upload Custom PDF</span>
          </button>
        </div>
      </div>
    );
  }

  const renderofferHistoryversions = () => {
    if (!offerHistoryTomap?.length) {
      return <></>;
    }
    return (
      <div className={`mt-4 ${styles.action_accordion}`}>
        <div className={styles.action_accordion_header} onClick={() => setShowOfferHistory(!showOfferHistory)}>
          <span className="d-flex align-items-center gap-1 my-2 fw-medium">
            <History size={18} />
            Offer History ({offerHistoryTomap.length} versions)
          </span>

          <ChevronDown
            className={`${styles.action_chevron} ${showOfferHistory ? styles.action_chevron_open : ""}`}
            size={16}
          />
        </div>

        {/* Content */}
        <div
          className={styles.action_accordion_content}
          style={{
            maxHeight: showOfferHistory ? "100%" : "0px",
          }}
        >
          <div className="table-responsive">
            <table
              className={`table table-hover table-striped able-borderless `}
              style={{ "--bs-table-striped-bg": "#f8f9fa" }}
            >
              <thead>
                <tr>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Version
                  </th>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Type
                  </th>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Status
                  </th>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Date
                  </th>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Notes
                  </th>
                  <th className="py-3" style={{ background: "#f2f2f267" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {offerHistoryTomap.map((offer, index) => (
                  <tr key={index} className="nowrap">
                    <td>
                      <div className="py-1 fw-medium">
                        {offer.source === "legacy_manual" ? "Manual Record" : `Version ${offer.version_number || "—"}`}
                      </div>
                    </td>

                    <td>
                      <div className="py-1">
                        <span className={styles.action_badge}>
                          {offer.source === "legacy_manual" ? "Manual" : "E-Signature"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="pt-1">
                        <SignatureStatusBadge status={offer.status} versionNumber={offer?.version_number || 1} />
                      </div>
                    </td>

                    <td>
                      <div className={`py-2 ${styles.action_date}`}>{formatDate(offer.created_at)}</div>
                    </td>

                    <td>
                      <div className={`py-2 ${styles.action_notes}`} title={offer.supersede_reason || ""}>
                        {offer.supersede_reason || "—"}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          className={`px-2 py-1 ${offer?.original_document_available ? " successoutlineButton" : ""}`}
                          type="button"
                          disabled={!offer?.original_document_available}
                          onClick={() => {
                            if (offer?.original_document_available) {
                              let fileOBJ = {
                                file_name: offer?.document_filename,
                                base64: offer?.original_document_content,
                              };

                              setshowFilePreview(fileOBJ);
                            }
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className={`px-2 py-1 ${offer?.original_document_available ? " successoutlineButton" : ""}`}
                          type="button"
                          disabled={!offer?.original_document_available}
                          onClick={() => {
                            if (offer?.original_document_available) {
                              let fileOBJ = {
                                file_name: offer?.document_filename,
                                base64: offer?.original_document_content,
                              };

                              handleDownload(fileOBJ);
                            }
                          }}
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityView = () => {
    return (
      <div className="rounded p-3 my-3" style={{ background: "#f1f1f980" }}>
        <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
          <History size={15} />
          <span>Activity History</span>
        </div>

        <div className="table-responsive">
          <table className="table table-borderless bg-transparent">
            <thead></thead>
            <tbody>
              {activityData.audit_trail.map((item, index) => {
                return (
                  <tr key={index} className="bg-transparent">
                    <td className="bg-transparent py-2 font12 nowrap">
                      {moment(item?.event_timestamp).format("MMM D, YYYY [at] h:mm A")}
                    </td>
                    <td className="bg-transparent py-2">
                      <span style={{ minWidth: "140px" }} className="d-block capitalize fw-medium">
                        {String(item?.event_type).replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="bg-transparent py-2">{item?.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderactionButtons = () => {
    return (
      <div className="d-flex flex-wrap gap-2 pt-2">
        {offerLatterHistoryData.signed_document_available && offerLatterHistoryData.is_signed && (
          <>
            <div
              className={`${styles.action_btn} ${styles.action_success}`}
              onClick={() => {
                let fileOBJ = {
                  file_name: offerLatterHistoryData?.document_filename,
                  base64: offerLatterHistoryData?.signed_document_content,
                };

                setshowFilePreview(fileOBJ);
              }}
            >
              <Eye size={14} />
              View Signed PDF
            </div>

            {/* <div className={`${styles.action_btn} ${styles.action_outline_success}`} onClick={() => downloadPDFFile()}>
              <Download size={14} />
              Download
            </div> */}

            {disabled ? (
              <></>
            ) : signature_status == "signed" ? (
              <div
                className={`${styles.action_btn} ${styles.action_outline_primary} ${
                  offerLatterHistoryData.isSavingToVault ? styles.action_disabled : ""
                }`}
                onClick={() => {
                  const newFile = {
                    id: Date.now() + Math.random(),
                    isattached: true,
                    base64file: offerLatterHistoryData?.signed_document_content,
                    file_name: offerLatterHistoryData?.document_filename,
                    name: offerLatterHistoryData?.document_filename,
                    type: offerLatterHistoryData?.document_type,
                  };

                  setupdatedFile([newFile]);
                  setOpenSaveTovault(true);
                }}
              >
                {offerLatterHistoryData.isSavingToVault ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FolderPlus size={14} />
                )}
                Save to Vault
              </div>
            ) : (
              <></>
            )}
          </>
        )}

        <div
          className={`${styles.action_btn} ${styles.action_outline_primary} ${
            offerLatterHistoryData.isCheckingStatus ? styles.action_disabled : ""
          }`}
          onClick={checkStatus}
        >
          {offerLatterHistoryData.isCheckingStatus ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Check Status
        </div>

        {disabled ? (
          <></>
        ) : (
          <>
            {(signature_status == "pending" || signature_status == "viewed") && (
              <>
                <div
                  className={`${styles.action_btn} ${styles.action_outline_primary} ${
                    offerLatterHistoryData.isResending ? styles.action_disabled : ""
                  }`}
                  onClick={() => setShowResendMailBox(true)}
                >
                  {offerLatterHistoryData.isResending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  Resend Email
                </div>
              </>
            )}

            {signature_status == "pending" || signature_status == "signed" || signature_status == "viewed" ? (
              <>
                <div
                  className={`${styles.action_btn} ${styles.action_outline_danger}`}
                  onClick={() => setCancelOffer(true)}
                >
                  <XCircle size={14} />
                  {signature_status == "signed" ? "Withdraw Offer" : "Cancel Offer"}
                </div>

                <div
                  className={`${styles.action_btn} ${styles.action_outline_warning}`}
                  onClick={() => {
                    setShowReviseOfferModal(true);
                  }}
                >
                  <Edit3 size={14} />
                  Revise Offer
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        )}

        {offerLatterHistoryData.signed_document_available && !disabled ? (
          <div
            className={`themePurpleBGHover text-white d-flex align-items-center gap-2 px-3 rounded pointer`}
            style={{ minHeight: "32px" }}
            onClick={() => {
              generateCustomEmail();
            }}
          >
            <Mail size={14} />
            Send to Candidate
          </div>
        ) : (
          <></>
        )}

        {activityData.audit_trail?.length && (
          <div
            className={`${styles.action_btn} ${styles.action_outline_primary} border-0`}
            onClick={() => setIsActivityOpen(!isActivityOpen)}
          >
            <History size={14} />
            Activity
            {isActivityOpen ? <ChevronUp strokeWidth={3} size={14} /> : <ChevronDown strokeWidth={3} size={14} />}
          </div>
        )}

        {isShowNewOfferBTN && !disabled ? (
          <div
            className={`themePurpleBGHover text-white d-flex align-items-center gap-2 px-3 rounded pointer`}
            style={{ minHeight: "32px" }}
            onClick={() => {
              setFile(null);
              setofferLatterHistoryData();
            }}
          >
            <Send size={14} />
            Send New Offer
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const sendNewOfferStats = ["issued_outside_system", "cancelled", "cancel", "withdrawal", "withdrawn"];

  const isShowNewOfferBTN = sendNewOfferStats.includes(String(offerLatterHistoryData?.signature_status).toLowerCase());

  const renderOfferletterHistoryData = () => {
    if (!offerLatterHistoryData) {
      return <></>;
    }

    const versionNumber = offerLatterHistoryData?.version_number;

    return (
      <div>
        <div className="d-flex align-items-center gap-2 justify-content-between mb-1">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FileText size={18} className="themePurple" />
            <span className="fw-medium"> Offer Letter </span>
          </div>
          <div className="mb-2">
            <SignatureStatusBadge
              status={offerLatterHistoryData?.signature_status}
              versionNumber={versionNumber || 1}
            />
          </div>
        </div>
        <div className="card p-3 mb-3" style={{ borderColor: "#e7e7e7" }}>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={17} className="text-success" />
              <span className="fw-medium">Offer Letter Sent Successfully </span>
              {versionNumber && versionNumber > 1 && (
                <span className="text-sm fw-medium" style={{ color: "#c0642a" }}>
                  (Revised - Version {versionNumber})
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Mail size={17} className="text-muted" />
              <span className="text-muted">Sent to:</span>
              <span className="fw-medium">{offerLatterHistoryData?.recipient_email}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FileText size={17} className="text-muted" />
              <span className="text-muted">Status</span>
              <SignatureStatusBadge
                status={offerLatterHistoryData?.signature_status}
                versionNumber={versionNumber || 1}
              />
            </div>

            {offerLatterHistoryData?.expires_at ? (
              <div className="d-flex align-items-center gap-2">
                <Clock size={17} className="text-muted" />
                <span className="text-muted">Expires:</span>
                <span className="fw-medium">{formatDate(offerLatterHistoryData?.expires_at)}</span>
              </div>
            ) : (
              <></>
            )}

            {offerLatterHistoryData?.viewed_at ? (
              <div className="d-flex align-items-center gap-2">
                <Eye size={17} className="text-muted" />
                <span className="text-muted">Viewed:</span>
                <span className="fw-medium">{formatDate(offerLatterHistoryData?.viewed_at)}</span>
              </div>
            ) : (
              <></>
            )}
            {offerLatterHistoryData?.signed_at ? (
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={17} className="text-success" />
                <span className="text-muted">Signed:</span>
                <span className="fw-medium text-success">{formatDate(offerLatterHistoryData?.signed_at)}</span>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="w-100 border-bottom my-3" style={{ borderColor: "#e7e7e7" }} />
          <div>{renderactionButtons()}</div>
          {isActivityOpen ? renderActivityView() : <></>}
        </div>

        {renderofferHistoryversions()}
      </div>
    );
  };

  const renderOfferLetterForm = () => {
    if (offerLatterHistoryData) {
      return <></>;
    }

    return (
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
        className="px-3 py-2 pb-3"
      >
        {offerLetterTabs()}
        <div className={`${styles.form} bg-unset border-0 p-0`}>
          {isCustomTab ? (
            <></>
          ) : (
            <div>
              <label className="fw-semibold mb-1"> Letter Date</label>
              <input
                type="date"
                value={offerDetails.letterDate}
                onChange={(e) => setOfferDetails({ ...offerDetails, letterDate: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="fw-semibold mb-1">
              {" "}
              Candidate Name <span className="text-danger">*</span>
            </label>
            <input
              placeholder="Candidate Name"
              value={offerDetails.candidateName}
              onChange={(e) => {
                setOfferDetails({ ...offerDetails, candidateName: e.target.value });
                if (errors.candidateName) setErrors({ ...errors, candidateName: null });
              }}
            />
            {errors.candidateName && <div className="text-danger font12 mt-1">{errors.candidateName}</div>}
          </div>
          <div>
            <label className="fw-semibold mb-1">
              {" "}
              Position <span className="text-danger">*</span>
            </label>
            <input
              placeholder="Position"
              value={offerDetails.Position}
              onChange={(e) => {
                setOfferDetails({ ...offerDetails, Position: e.target.value });
                if (errors.Position) setErrors({ ...errors, Position: null });
              }}
            />
            {errors.Position && <div className="text-danger font12 mt-1">{errors.Position}</div>}
          </div>

          <div>
            <label className="fw-semibold mb-1">Pay Type</label>
            <select
              className="form-select"
              value={offerDetails.pay_type}
              onChange={(e) => setOfferDetails({ ...offerDetails, pay_type: e.target.value })}
            >
              <option value="hourly">Hourly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="fw-semibold mb-1">
              {" "}
              Salary ({offerDetails.pay_type == "hourly" ? "Hourly" : "Per Annum"}){" "}
              <span className="text-danger">*</span>
            </label>
            <input
              placeholder="e.g., $75,000"
              value={offerDetails.Salary}
              onChange={(e) => {
                setOfferDetails({ ...offerDetails, Salary: e.target.value });
                if (errors.Salary) setErrors({ ...errors, Salary: null });
              }}
            />
            {errors.Salary && <div className="text-danger font12 mt-1">{errors.Salary}</div>}
          </div>

          <div>
            <label className="fw-semibold mb-1">
              {" "}
              Start Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={offerDetails["Start Date"]}
              onChange={(e) => {
                setOfferDetails({ ...offerDetails, ["Start Date"]: e.target.value });
                if (errors["Start Date"]) setErrors({ ...errors, ["Start Date"]: null });
              }}
            />
            {errors["Start Date"] && <div className="text-danger font12 mt-1">{errors["Start Date"]}</div>}
          </div>
          {isCustomTab ? (
            <></>
          ) : (
            <div>
              <label className="fw-semibold mb-1">Volunteer Work</label>
              <select
                className="form-select"
                value={offerDetails.Volunteer}
                onChange={(e) => setOfferDetails({ ...offerDetails, Volunteer: e.target.value })}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          )}

          <div
            className="signatureContainer"
            style={{
              gridColumn: "1 / -1",
            }}
          >
            {offerLetterSection()}
          </div>

          <button type="button" className="themePurpleBGHover" onClick={() => generatePreview()} disabled={loading}>
            {loading ? <Loader2 className={styles.spin} /> : isCustomTab ? <Send size={16} /> : <Eye size={18} />}
            {isCustomTab ? "Send for Signature" : "Generate & Preview"}{" "}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {renderOfferLetterForm()}
      {renderOfferletterHistoryData()}
      {showFilePreview ? (
        <FilePreview
          docObject={{ file_extension: "application/pdf", file_name: showFilePreview?.file_name }}
          base64File={showFilePreview?.base64 || ""}
          setBase64File={() => setshowFilePreview(false)}
          fileType="application/pdf"
          setFileType={() => {}}
        />
      ) : (
        <></>
      )}
      <CancelOrWithdrawOfferDialog
        open={cancelOffer}
        offerDetails={offerLatterHistoryData}
        candidate={candidate}
        onClose={(status) => {
          if (status) {
            getOfferStatus();
            getOfferactivityData();
          }
          setCancelOffer(false);
        }}
      />

      <ContactMail
        updateTable={() => {}}
        isModalActive={sendOfferToCandidate}
        data={candidate}
        allData={candidate}
        setIsModalActive={setSendOfferToCandidate}
        defaultData={sendOfferToCandidate}
        isHideOffer
      />

      <PdfPreviewModal
        file={pdfFile}
        onClose={() => {
          setPdfFile(false);
        }}
        onAttach={(file) => {
          setSendOfferFile(pdfFile);
          setPdfFile(false);
        }}
      />
      <SendOfferLetterModal
        customData={customData}
        isCustomTab={isCustomTab}
        defaultAttachments={[sendOfferFile]}
        open={sendOfferFile}
        jobDescription={jobDescription}
        onClose={(status) => {
          if (status) {
            getOfferStatus();
            getOfferHistory();
          }
          setSendOfferFile(null);
        }}
        {...emailData}
        candidate={candidate}
        offerDetails={offerDetails}
      />
      <ReviseOfferModal
        open={showReviseOfferModal}
        onClose={() => setShowReviseOfferModal(false)}
        candidate={candidate}
        offerDetails={offerLatterHistoryData}
        onSuccess={(values, loadingfunc) => {
          setOfferDetails(values || {});
          generatePreview(values, loadingfunc);

          // setShowReviseOfferModal(false);
          // getOfferStatus();
          // getOfferHistory();
        }}
      />
      <DocumentsSection
        defaultDocs={updatedFile}
        show={openSaveTovault}
        setshow={(status, refresh) => {
          setOpenSaveTovault(false);
          setupdatedFile(null);
        }}
        isBase64={true}
        email_id={candidate_email}
        customDocumentType={[
          { label: "Select Type", value: "", disabled: true },
          { label: "Offer Letter", value: "Offer Letter" },
        ]}
      />
      <Confirm
        show={showResendMailBox}
        result={(status) => {
          if (status) {
            resendemailTocandidate();
          }
          setShowResendMailBox(false);
        }}
        title={`Resend Verification Email`}
        text={`
              <p>
                It looks like you haven't received the verification email yet.
               
                Click <strong>Resend Email</strong> to send the verification link again to your registered email address.
              </p>
              <p style="color: #666; font-size: 13px;">
                Please check your spam or junk folder before resending.
              </p>
            `}
        deleteTitle="Resend Email"
      />
      <ThemeLoader show={loading} fixed />

      <PreparingEmailPopup show={loadingGenerate} />

      {offerStatus && (
        <div className={styles.statusCard}>
          <div className={styles.row}>
            <Mail /> {offerStatus.recipient_email}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={checkStatus} disabled={checking} title="Check status">
              {checking ? <Loader2 className={styles.spin} /> : <RefreshCw />}
            </button>

            {signatureStatus !== "signed" && (
              <button type="button" onClick={() => setShowRevise(true)}>
                <Edit3 /> Revise
              </button>
            )}
          </div>

          {showAudit && (
            <div className={styles.audit}>
              {offerStatus.audit_trail?.map((e, i) => (
                <div key={i}>
                  <Clock /> {e.event_type}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isSuccess ? (
        <SuccessPopupModal
          setIsSuccess={setIsSuccess}
          onClose={(status) => {
            if (status) {
              getOfferStatus();
              getOfferHistory();
            }
            setFile(null);
            setJobDescription("");
            setSendOfferFile(null);
          }}
          offerDetails={offerDetails}
          signatureResponse={signatureResponse}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
