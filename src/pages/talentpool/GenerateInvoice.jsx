import React, { useState, useEffect } from "react";
import { FileText, DollarSign, Plus, X, Download, CheckCircle, Mail, Eye, Trash2 } from "lucide-react";
import styles from "./css/GenerateInvoice.module.css";
import OverlayModal from "../../components/OverlayModal";
import { axiosApi, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import FilePreview from "../benchcandidate/FilePreview";
import { ImAttachment } from "react-icons/im";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import DatePicker from "react-datepicker";
import { formatDateToET } from "../../helpers/StrHelpers";

const formatMonthYear = (input) => {
  if (!/^\d{6}$/.test(input)) return input;
  const month = parseInt(input.slice(0, 2), 10) - 1;
  const year = input.slice(2);
  const date = new Date(year, month);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

const handleDownload = (base64PDF, fileName = "pdfFile.pdf") => {
  const linkSource = `data:application/pdf;base64,${base64PDF}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

function EmailRecipients({
  title = "Recipient email:",
  emailRecipients = [],
  setEmailRecipients = () => {},
  placeholder = "Recipient email",
  buttonTitle = "Add recipient email",
}) {
  const [emails, setEmails] = useState(emailRecipients);
  const [showInput, setShowInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!emails.length) {
      setShowInput(true);
    }
  }, [emails.length]);

  useEffect(() => {
    if (emails) {
      setEmailRecipients(emails);
    }
  }, [JSON.stringify(emails)]);

  useEffect(() => {
    if (emailRecipients?.length) {
      setEmails(emailRecipients);
    }
  }, [JSON.stringify(emailRecipients)]);

  const validateEmail = (email) => {
    const regex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(newEmail)) {
      setError("Invalid email format");
      return;
    }
    if (emails.includes(newEmail)) {
      setError("Email already added");
      return;
    }
    setEmails([...emails, newEmail]);
    setNewEmail("");
    setError("");
    setShowInput(false);
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div className={styles.recipient_section}>
      <label className={styles.section_label}>{title}</label>
      <div className="d-flex flex-wrap gap-2">
        <div className={`align-items-center ${styles.email_container}`} style={{ height: "max-content" }}>
          {emails.length > 0 &&
            emails.map((email, i) => (
              <div key={i} className={styles.email_badge}>
                {email}
                <span className="ps-2 pointer text-danger" title="Remove" onClick={() => handleRemoveEmail(email)}>
                  <X size={14} strokeWidth={3} />
                </span>
              </div>
            ))}
          {!showInput && (
            <span title={buttonTitle}>
              <Plus size={25} className="pointer generalButton" onClick={() => setShowInput(true)} />
            </span>
          )}
        </div>

        {showInput && (
          <div style={{ maxWidth: "300px", minHeight: "52px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                value={newEmail}
                onChange={(e) => {
                  setError("");
                  setNewEmail(e.target.value);
                }}
                placeholder={placeholder}
                className="w-100"
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
              <button title={buttonTitle} onClick={handleAddEmail} className={styles.addButton}>
                <Plus size={18} />
              </button>
            </div>
            {error && <div style={{ color: "red", fontSize: "12px" }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkAsSentModal({ show, generatedData, emailRecipients = [], onMarkAsSent, onClose }) {
  let invoice = generatedData.invoice_details;

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (show) {
      setFormData({
        recipients: emailRecipients.join(", ") || "",
        cc: "",
        subject: `Invoice ${invoice.invoice_number} - ${invoice.vendor_name}`,
        notes: "",
      });
    }
  }, [show]);

  if (!show) {
    return;
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.recipients.trim()) {
      newErrors.recipients = "Recipient emails are required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else {
      const emails = formData.recipients.split(",").map((e) => e.trim());
      const invalidEmails = emails.filter(
        (email) => !/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
      );

      if (invalidEmails.length > 0) {
        newErrors.recipients = `Invalid emails: ${invalidEmails.join(", ")}`;
      }
    }

    // Validate CC emails if provided
    if (formData.cc.trim()) {
      const ccEmails = formData.cc.split(",").map((e) => e.trim());
      const invalidCC = ccEmails.filter(
        (email) => !/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
      );

      if (invalidCC.length > 0) {
        newErrors.cc = `Invalid CC emails: ${invalidCC.join(", ")}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    let payload = {
      task: "mark_as_sent",
      invoice_id: generatedData.invoice_id,
      recipient_emails: formData.recipients.split(",").map((e) => e.trim()),
      cc_emails: formData.cc
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e),
      email_subject: formData.subject,
      email_message: formData.notes,
    };

    onMarkAsSent(payload);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={styles.mark_sent_dialog} role="dialog">
        <div className={styles.mark_sent_header}>
          <h2 className={styles.mark_sent_title}>Mark Invoice as Sent</h2>
          <p className={styles.mark_sent_description}>
            Record that this invoice has been sent externally. This will update the invoice status to "Sent".
          </p>
        </div>

        <div className={styles.mark_sent_content}>
          <div className={styles.mark_sent_field_group}>
            <label htmlFor="recipients" className={styles.mark_sent_label}>
              Recipient Email(s) *
            </label>
            <input
              id="recipients"
              className={`${styles.mark_sent_input} ${errors.recipients ? styles.error : ""}`}
              placeholder="client@vendor.com, accounts@vendor.com"
              value={formData.recipients}
              onChange={handleChange}
              required
            />
            {errors.recipients && <p className={styles.error_message}>{errors.recipients}</p>}
            <p className={styles.mark_sent_hint}>Separate multiple emails with commas</p>
          </div>

          <div className={styles.mark_sent_field_group}>
            <label htmlFor="cc" className={styles.mark_sent_label}>
              CC Email(s) (Optional)
            </label>
            <input
              id="cc"
              className={`${styles.mark_sent_input} ${errors.cc ? styles.error : ""}`}
              placeholder="manager@company.com"
              value={formData.cc}
              onChange={handleChange}
            />
            {errors.cc && <p className={styles.error_message}>{errors.cc}</p>}
          </div>

          <div className={styles.mark_sent_field_group}>
            <label htmlFor="subject" className={styles.mark_sent_label}>
              Subject
            </label>
            <input id="subject" className={styles.mark_sent_input} value={formData.subject} onChange={handleChange} />

            {errors.subject && <p className={styles.error_message}>{errors.subject}</p>}
          </div>

          <div className={styles.mark_sent_field_group}>
            <label htmlFor="notes" className={styles.mark_sent_label}>
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              className={styles.mark_sent_textarea}
              placeholder="Additional notes about how the invoice was sent..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className={styles.mark_sent_footer}>
          <button className={styles.mark_sent_cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.mark_sent_confirm} onClick={handleSubmit}>
            Mark as Sent
          </button>
        </div>

        <button className={styles.mark_sent_close} onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.close_icon}
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

function InvoicePreview({
  isResendMode,
  timesheetData,
  refresh,
  generatedData,
  emailRecipients = [],
  onClose,
  candidateDetails,
}) {
  const data = generatedData?.invoice_details || {};
  const pdfData = generatedData?.pdf_preview || {};
  let employee_email = candidateDetails?.original_email;
  let vendorEmailID = generatedData?.vendor_info?.vendor_email;

  const [pdfDocPreview, setPdfDocPreview] = useState(pdfData);
  const [showMarkAsSentModal, setShowMarkAsSentModal] = useState(false);
  const [timesheetFile, setTimesheetFile] = useState(false);
  const [loader, setLoader] = useState(false);
  const [emailRecipientsData, setEmailRecipientsData] = useState(emailRecipients);
  const [CCEmailsData, setCCEmailsData] = useState([]);

  const { user } = useAuth();
  let EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    if (vendorEmailID) {
      setEmailRecipientsData([vendorEmailID]);
    }
  }, [vendorEmailID]);

  useEffect(() => {
    getCompanyEmails();
  }, [EMPLOYER_EMAIL]);

  const getCompanyEmails = () => {
    if (!EMPLOYER_EMAIL) {
      return;
    }
    let payload = {
      action: "retrieve_emails",
      admin_email: EMPLOYER_EMAIL,
    };
    setLoader(true);
    api
      .CompanyDetails(payload)
      .then((res) => {
        let invoicingEmailsData = res?.data?.find((item) => item?.category_name == "invoicing_emails");
        let invoiceEmailIds = invoicingEmailsData?.email_addresses || "";
        let mailsArr = invoiceEmailIds.split(",").filter((item) => !!item);

        let newArr = new Set([...mailsArr, ...CCEmailsData]);
        newArr = [...newArr];

        setCCEmailsData(newArr);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const downloadInvoicePDF = () => {
    const base64Pdf = pdfData?.base64_content;
    const file_name = pdfData?.file_name;

    if (!base64Pdf) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64Pdf}`;
    link.download = file_name || `${data.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markInvoiceAsSent = (payloadData) => {
    let payload = {
      ...payloadData,
      employer_email: EMPLOYER_EMAIL,
      employee_email: employee_email,
    };

    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => {
        toast.success(res.data.message);
        setShowMarkAsSentModal(false);

        setTimeout(() => {
          refresh();
        }, 1000);

        onClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.error || "Failed to sent");
        console.log(err);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const getTimesheetFile = () => {
    let docId = timesheetData.document_id;
    const payload = {
      employer_email: EMPLOYER_EMAIL,
      primary_email: employee_email,
      task: "download_timesheets",
      document_ids: [docId],
    };

    setLoader(docId);
    api
      .getTimesheets(payload)
      .then((res) => {
        setLoader(false);
        const fileData = res?.files?.[0];
        setTimesheetFile(fileData);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const sendInvoice = async (invoiceData) => {
    if (!emailRecipientsData?.length) {
      return toast.error("Recipient emails are required");
    }

    let payload = {
      task: "send_invoice",
      send_mode: "send_now",
      invoice_id: generatedData.invoice_id,
      employer_email: EMPLOYER_EMAIL,
      employee_email: employee_email,
      recipient_emails: emailRecipientsData.map((e) => e.trim()),
    };

    if (CCEmailsData?.length) {
      payload.cc_emails = CCEmailsData.map((e) => e.trim());
    }

    // let attachmentsData = [pdfData, timesheetFile];

    // let formattedAttachments = attachmentsData
    //   .filter((item) => item && item.base64_content && item.file_name)
    //   .map((item) => {
    //     let extension = item.file_name.split(".").pop().toLowerCase();
    //     let contentType =
    //       {
    //         pdf: "application/pdf",
    //         png: "image/png",
    //         jpg: "image/jpeg",
    //         jpeg: "image/jpeg",
    //       }[extension] || "application/octet-stream";

    //     return {
    //       name: item.file_name,
    //       contentType,
    //       content: item.base64_content,
    //     };
    //   });

    // if (formattedAttachments?.length) {
    //   payload.attachments = formattedAttachments;
    // }

    // console.log(payload, "aaaaaaa");

    // return;

    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => {
        toast.success(res.data.message);
        setTimeout(() => {
          refresh();
        }, 2000);
        setTimeout(() => {
          onClose();
        }, 2000);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.error || "Failed to sent");
        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setLoader(false);
        }, 3000);
      });
  };

  let borderStyle = {};
  if (!timesheetFile) {
    borderStyle = {
      border: "1px dashed gray",
      cursor: "pointer",
    };
  }

  return (
    <div role="dialog" className={styles.preview_dialog}>
      <div className="d-flex justify-content-between">
        <div className={`gap-0 ${styles.preview_header}`}>
          <h2 className={styles.preview_title}>
            <FileText className={styles.file_icon} />
            Generate Invoice for {data.vendor_name}
          </h2>
          <p className={`text-start ${styles.preview_subtitle}`}>
            Generate and send invoice for timesheet {data.period}
          </p>
        </div>
        <div className="generalButton maxcontent hidemodalclosebtn" title="Close" onClick={onClose}>
          <X />
        </div>
      </div>

      <div className={styles.preview_container}>
        <div className={styles.preview_header_row}>
          <h4 className={styles.section_title}>Invoice Preview</h4>
          <div className={styles.success_badge}>Generated Successfully</div>
        </div>

        <div className={styles.info_card}>
          <div className={styles.grid_2col}>
            <div>
              <label className={styles.info_label}>Invoice Number</label>
              <p className={styles.info_value}>{data.invoice_number}</p>
            </div>
            <div>
              <label className={styles.info_label}>Total Amount</label>
              <p className={styles.info_value_lg}>${data.total_amount}</p>
            </div>
            <div>
              <label className={styles.info_label}>Period</label>
              <p className={styles.info_value}>{data.period}</p>
            </div>
            <div>
              <label className={styles.info_label}>Due Date</label>
              <p className={styles.info_value}>{data.due_date}</p>
            </div>
          </div>
        </div>

        {/* <div className={styles.pdf_header}>
          <p className={styles.pdf_label}>PDF Preview:</p>
          <button type="button" className={styles.pdf_button} onClick={() => setPdfDocPreview(pdfData)}>
            <FileText className={styles.pdf_icon} />
            Open PDF Preview
          </button>
        </div> */}

        <div className={`d-flex flex-column gap-4 p-3`} style={{ background: "#fcfcfc" }}>
          <div className="fw-bold h6">Will be sent to </div>
          <EmailRecipients emailRecipients={emailRecipientsData} setEmailRecipients={setEmailRecipientsData} />

          <EmailRecipients
            title="CC Emails:"
            emailRecipients={CCEmailsData}
            setEmailRecipients={setCCEmailsData}
            placeholder="CC Emails"
            buttonTitle="Add CC Email"
          />
        </div>

        <div className={styles.pdf_header}>
          <div className="d-flex gap-1 fw-bold align-items-center mb-3">
            <ImAttachment /> Attachments
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div
              style={{ maxWidth: "250px", height: "unset", minHeight: "52px" }}
              className={`justify-content-between py-2 ${styles.pdf_button}`}
            >
              <div className="w-100" style={{ overflow: "hidden" }}>
                <div>Invoice </div>
                <div
                  title={pdfData?.file_name}
                  className="text-truncate"
                  style={{ fontSize: "10px", maxWidth: "90%", overflow: "hidden" }}
                >
                  {pdfData?.file_name}
                </div>
              </div>
              <div className="d-flex gap-2 align-ites-center">
                <span title="View Invoice">
                  <Eye size={19} className="pointer" onClick={() => setPdfDocPreview(pdfData)} />
                </span>
                <span title="Download Invoice">
                  <Download
                    size={18}
                    className="pointer"
                    onClick={() => handleDownload(pdfData?.base64_content, pdfData?.file_name)}
                  />
                </span>
              </div>
            </div>

            <div
              title={!timesheetFile ? "Attach TimeSheet" : null}
              style={{ maxWidth: "250px", height: "unset", minHeight: "52px", ...borderStyle }}
              className={`justify-content-between py-2 ${styles.pdf_button}`}
              onClick={() => {
                if (!timesheetFile) {
                  getTimesheetFile();
                }
              }}
            >
              <div className="w-100" style={{ overflow: "hidden" }}>
                <div>Timesheet </div>
                <div
                  title={timesheetFile?.file_name}
                  className="text-truncate"
                  style={{ fontSize: "10px", maxWidth: "90%", overflow: "hidden" }}
                >
                  {timesheetFile?.file_name}
                </div>
              </div>
              {timesheetFile ? (
                <div className="d-flex gap-2 align-ites-center">
                  <span title="View Timesheet">
                    <Eye
                      size={19}
                      className="pointer"
                      onClick={() => {
                        setPdfDocPreview(timesheetFile);
                      }}
                    />
                  </span>
                  <span title="Download Timesheet">
                    <Download
                      size={18}
                      className="pointer"
                      onClick={() => handleDownload(timesheetFile?.base64_content, timesheetFile?.file_name)}
                    />{" "}
                  </span>
                  <span title="Delete Timesheet">
                    <Trash2 size={18} className="pointer text-danger" onClick={() => setTimesheetFile(null)} />{" "}
                  </span>
                </div>
              ) : (
                <Plus size={18} className="pointer" />
              )}
            </div>
          </div>
        </div>

        <div className={`justify-content-end ${styles.action_footer}`}>
          {/* <button type="button" onClick={() => onClose()} className={`me-auto ${styles.secondary_button}`}>
            ← Back to Edit
          </button> */}
          <button type="button" className={styles.secondary_button} onClick={downloadInvoicePDF}>
            <Download className={styles.download_icon} />
            Download PDF
          </button>
          {isResendMode ? (
            <></>
          ) : (
            <button type="button" className={styles.secondary_button} onClick={() => setShowMarkAsSentModal(true)}>
              <CheckCircle className={styles.check_icon} />
              Mark as Sent
            </button>
          )}
          <button type="button" className={styles.primary_button} onClick={() => sendInvoice(data)}>
            <Mail className={styles.mail_icon} />
            Send Invoice
          </button>
        </div>
      </div>

      <FilePreview
        docObject={{ file_extension: "application/pdf", file_name: pdfDocPreview?.file_name }}
        base64File={pdfDocPreview?.base64_content || ""}
        setBase64File={setPdfDocPreview}
        fileType="application/pdf"
        setFileType={() => {}}
      />

      <MarkAsSentModal
        show={showMarkAsSentModal}
        generatedData={generatedData}
        onClose={() => {
          setShowMarkAsSentModal(false);
        }}
        emailRecipients={emailRecipientsData}
        onMarkAsSent={markInvoiceAsSent}
      />
      <ThemeLoader fixed show={loader} />
    </div>
  );
}

function formatDate(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (isNaN(date)) throw new Error("Invalid date format");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function GenerateInvoice({
  show,
  onClose,
  refresh = () => {},
  data = {},
  invoiceData = {},
  candidateDetails,
  isPreview,
  isResendMode,
}) {
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [tax, setTax] = useState("0");
  const [description, setDescription] = useState("");
  const [invoiceDate, setinvoiceDate] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [generatedData, setGeneratedData] = useState(false);
  const [showPreviewModal, setshowPreviewModal] = useState(false);
  const [total, setTotal] = useState("0.00");
  const [emailError, setEmailError] = useState("");
  const [loader, setLoader] = useState(false);
  const { user } = useAuth();

  let employee_email = candidateDetails?.original_email;
  let EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    if (invoiceData) {
      setHours(invoiceData.total_hours || "");
      setRate(invoiceData.vendor_assignment?.hourly_rate || data?.assignment_details?.hourly_rate || "");
    }
  }, [invoiceData]);

  useEffect(() => {
    if (isPreview) {
      setGeneratedData(isPreview);
      setshowPreviewModal(true);
    }
  }, [isPreview]);

  console.log(data?.assignment_details, "invoiceData");
  useEffect(() => {
    if (show) {
      setHours(invoiceData.total_hours || "");
      setRate(data?.assignment_details?.hourly_rate || invoiceData.vendor_assignment?.hourly_rate || "");
      setTax("0");
      setDescription("");
      setinvoiceDate(formatDate());
      setNotes("");
      setEmail("");
      if (data.primary_email) {
        setEmailRecipients([data.primary_email]);
      } else {
        setEmailRecipients([]);
      }
    } else {
      setGeneratedData(false);
      setshowPreviewModal(false);
    }
  }, [show, invoiceData, data]);

  useEffect(() => {
    const h = parseFloat(hours) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(tax) || 0;
    const subtotal = h * r;
    const totalAmount = subtotal + (subtotal * t) / 100;
    setTotal(totalAmount.toFixed(2));
  }, [hours, rate, tax]);

  const isValid = () => hours && rate && !isNaN(hours) && !isNaN(rate);

  const handleGenerate = () => {
    if (!isValid()) {
      return;
    }

    let payload = {
      hours,
      rate,
      tax,
      description,
      notes,
      emailRecipients,
      total,
    };

    let month = invoiceData?.month;
    let mm = parseInt(month.slice(0, 2), 10);
    let yyyy = parseInt(month.slice(2), 10);

    const formatted = new Date(yyyy, mm - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    payload = {
      task: "generate_invoice",
      employer_email: EMPLOYER_EMAIL,
      employee_email: employee_email,
      vendor_assignment_id: data?.assignment_details?.assignment_id,
      timesheet_document_id: invoiceData?.document_id,
      invoice_details: {
        candidate_name: candidateDetails?.first_name + " " + candidateDetails?.last_name,
        period: formatted,
        total_hours: hours,
        invoice_date: formatDate(invoiceDate),
        description: description,
        tax_rate: tax,
        notes: notes,
      },
    };

    setLoader(true);

    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => {
        toast.success(res.data.message);
        refresh();
        setGeneratedData(res.data);
        setshowPreviewModal(true);
        // onClose();
      })
      .catch((err) => {
        toast.error(err.message || err?.response?.data?.error || err?.response?.data?.message);
        console.log(err);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const handleAddEmail = () => {
    const isValidEmail = (email) => {
      return /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
    };

    if (!email) return;

    if (emailRecipients.includes(email)) {
      setEmailError("This email is already added.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");

    setEmailRecipients([...emailRecipients, email]);
    setEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailRecipients(emailRecipients.filter((e) => e !== emailToRemove));
  };

  if (!show) return null;

  if (showPreviewModal) {
    return (
      <OverlayModal
        isActive={showPreviewModal}
        onClose={() => {
          setshowPreviewModal(false);
          onClose();
        }}
        modalStyle={{ backgroundColor: "white" }}
      >
        <InvoicePreview
          isResendMode={isResendMode}
          timesheetData={invoiceData}
          candidateDetails={candidateDetails}
          show={showPreviewModal}
          onClose={() => {
            setshowPreviewModal(false);
            onClose();
          }}
          emailRecipients={emailRecipients}
          generatedData={generatedData}
          refresh={refresh}
        />
      </OverlayModal>
    );
  }

  return (
    <OverlayModal
      isActive={show}
      onClose={onClose}
      modalStyle={{ backgroundColor: "white" }}
      style={{ maxWidth: "800px" }}
    >
      <div className={styles.overlay}>
        <div className={styles.sheet} role="dialog" aria-modal="true">
          <div className="d-flex justify-content-between">
            <div className={`gap-0 ${styles.header}`}>
              <h2 className={styles.title}>
                <FileText className={styles.icon} />
                Generate Invoice for {data.company_name}
              </h2>
              <p className={styles.description}>
                Generate and send invoice for timesheet <b> {formatMonthYear(invoiceData.month)}</b>
              </p>
            </div>
            <div className="generalButton maxcontent hidemodalclosebtn" title="Close" onClick={onClose}>
              <X />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Total Hours</label>
                <input
                  className={styles.input}
                  type="number"
                  step="0.1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Hourly Rate ($)</label>
                <input
                  className={styles.input}
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Tax Rate (%)</label>
                <input
                  className={styles.input}
                  type="number"
                  step="0.1"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Total Amount</label>
                <div className={styles.amountBox}>
                  <DollarSign size={16} className={styles.iconMuted} />
                  <span>{total}</span>
                </div>
              </div>
              <div className={`pb-1 ${styles.field} ${styles.fullWidth}`}>
                <label>Invoice Date</label>
                <div>
                  <DatePicker
                    maxDate={"2099"}
                    showIcon
                    toggleCalendarOnIconClick
                    calendarIconClassName="calenderIconRight"
                    showYearDropdown
                    showMonthDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={50}
                    selected={invoiceDate || new Date()}
                    onChange={(date) => {
                      const formatted = formatDateToET(date);
                      setinvoiceDate(formatted);
                    }}
                    dateFormat="yyyy/MM/dd"
                    className={`w-100 py-2 outline-0 ps-2 mb-0 ${styles.input}`}
                    placeholderText={"YYYY/MM/dd"}
                  />
                </div>
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Description</label>
                <input
                  className={styles.input}
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Notes</label>
                <textarea
                  className={styles.textarea}
                  rows="3"
                  placeholder="Additional notes or payment instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fullWidth}>
              <label>Email Recipients:</label>
              <div className={styles.emailList}>
                {emailRecipients.map((email) => (
                  <div key={email} className={styles.badge}>
                    {email}
                    <X size={12} className={styles.removeIcon} onClick={() => handleRemoveEmail(email)} />
                  </div>
                ))}
              </div>
              <div className={styles.emailInputRow}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Add additional email address..."
                  value={email}
                  onChange={(e) => {
                    setEmailError("");
                    setEmail(e.target.value);
                  }}
                />
                <button type="button" className={styles.addemailbtn} onClick={handleAddEmail} disabled={!email}>
                  <Plus size={18} />
                </button>
              </div>
              {emailError && <p className={styles.error_message}>{emailError}</p>}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelbtn} onClick={onClose}>
                Cancel
              </button>
              <button type="button" onClick={handleGenerate} disabled={!isValid()}>
                Generate & Preview
              </button>
            </div>
          </div>
        </div>

        <ThemeLoader fixed show={loader} />
      </div>
    </OverlayModal>
  );
}
