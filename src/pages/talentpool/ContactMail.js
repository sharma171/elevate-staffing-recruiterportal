import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import styles from "./css/CandidateModal.module.css";
import OverlayModal from "../../components/OverlayModal";
import ThemeLoader from "../../components/ThemeLoader";
import { useAuth } from "../../authContext";
import { toast } from "react-toastify";
import { formatDateToET, pickDateOnly } from "../../helpers/StrHelpers";
import { HiOutlineMail } from "react-icons/hi";
import { CustomEditor } from "../../components";
import DatePicker from "react-datepicker";
import { IoMdClose } from "react-icons/io";
import { ArrowLeft, Check, Eye, Paperclip, Send, X } from "lucide-react";
import sendEncryptedRequest from "../../components/EncryptedRequest";
import { getDeviceData } from "../../DeviceStore";
import api from "../../networking/api";
import PremiumSelect from "../../components/PremiumSelect";

const BASE_URL = "https://contact-employees-via-email-v3-305451280005.us-east1.run.app";

export default function ContactMail({
  isModalActive,
  setIsModalActive,
  data = {},
  allData,
  updateTable = () => {},
  isHideOffer,
  defaultData = {},
}) {
  const { user, organisation } = useAuth();

  let defaultTemplate = `<br/>Regards,<br/><b>${organisation?.email || ""}</b><br/>${
    organisation?.org_data?.[0]?.org_address || ""
  }<br/><a href=${organisation?.org_data?.[0]?.org_website || ""}>${
    organisation?.org_data?.[0]?.org_website || ""
  }<a/>`;

  let candidateID = allData?.id;

  const needToUpdate = true;

  const fileInputRef = useRef();

  const initialFormData = {
    templateType: "custom",
    "Letter Date": pickDateOnly(new Date()),
    candidateName: `${data.first_name || ""} ${data.last_name || ""}`,
    Position: data.job_title || "",
    Salary: data?.employee_salary || "",
    "Start Date": data?.employment_start_date || null,
    responseDeadline: "",
    title: "",
    content: defaultTemplate,
    Volunteer: data?.volunteer_work == true ? "Yes" : "No",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [aiModal, setAiModal] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [previewEmailMode, setPreviewEmailMode] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const [offerLatter, setOfferLatter] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [generatedMessage, setgeneratedMessage] = useState(null);

  const isContent = String(formData?.content).replace(/<[^>]*>/g, "").length > 0;

  let iscustomEmails = formData.templateType == "custom";
  iscustomEmails = true;
  let { keys, fingerprints } = getDeviceData();

  useEffect(() => {
    const defaultFile = defaultData?.file;
    const defaultDataOBJ = defaultData?.data;

    if (defaultDataOBJ) {
      if (defaultDataOBJ.email_subject) {
        handleChange("title", defaultDataOBJ.email_subject);
      }
      if (defaultDataOBJ.email_body_html) {
        handleChange("content", defaultDataOBJ.email_body_html);
      }
      setgeneratedMessage(true);
    }

    if (defaultFile && defaultFile?.length) {
      setAttachments(defaultFile);
    }
  }, [JSON.stringify(defaultData || {})]);

  useEffect(() => {
    if (data?.primary_email) {
      setFormData((fd) => ({
        ...fd,
        candidateName: `${data.first_name || ""} ${data.last_name || ""}`,
        Position: data.job_title || "",
        Salary: data?.employee_salary || "",
        Volunteer: data?.volunteer_work == true ? "Yes" : "No",
        "Start Date": data?.employment_start_date || null,
      }));
    }
    setgeneratedMessage("");
  }, [data?.primary_email]);

  useEffect(() => {
    if (!isModalActive) {
      completeResetForm();
    }
  }, [isModalActive]);

  function resetForm() {
    setPreviewEmailMode(false);
    setAiContent("");
    setAiModal(false);
    setAttachments([]);
    setOfferLatter("");
    setPdfModalVisible(false);
    setPdfBlob(null);
  }

  function completeResetForm() {
    resetForm();
    setFormData(initialFormData);
  }

  const fadeStyle = (l) => ({ opacity: l ? 0.6 : 1, transition: "opacity 0.3s ease" });
  const handleChange = (k, v) => setFormData((fd) => ({ ...fd, [k]: v }));
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const base64Files = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          contentType: file.type,
          content: (await toBase64(file)).split(",")[1],
        })),
      );
      setAttachments((a) => [...a, ...base64Files]);
    } catch (err) {
      toast.error("Failed to process attachments");
    }
  };

  const removeAttachment = (i) => {
    setAttachments((prevAttachments) => {
      const removedAttachment = prevAttachments[i];
      const updatedAttachments = prevAttachments.filter((_, idx) => idx !== i);
      if (
        offerLatter &&
        removedAttachment.name === offerLatter.name &&
        removedAttachment.content === offerLatter.content
      ) {
        setOfferLatter(null);
      }

      return updatedAttachments;
    });
  };

  const toBase64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => res(r.result);
      r.onerror = (e) => rej(e);
    });

  async function postRequest(payload) {
    return axios.post(`${BASE_URL}/`, payload);
  }

  const renderFilesPreview = () => {
    if (!attachments?.length) {
      return;
    }
    return (
      <div>
        <div className="my-2 fw-semibold">Attachments:</div>
        {attachments?.map((item, index) => {
          return (
            <div className="text-primary d-flex gap-2 align-items-center mb-1">
              <Paperclip size={14} />
              <span>{item?.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const EmailPreview = () => (
    <div className="mt-3">
      <div
        style={{
          border: "1px solid #e4e1e1ff",
          borderRadius: 10,
          minHeight: 350,
          maxHeight: 500,
          overflow: "auto",
          padding: 16,
          marginBottom: "15px",
          background: "#f1f1f980",
        }}
      >
        <div>
          <b> To : </b> <span className="fw-normal"> {data?.primary_email}</span>
        </div>
        <div className="mb-3">
          <b> Subject: </b> <span className="fw-normal">{formData?.title}</span>
        </div>
        <hr className="sepline" style={{ background: "#888888" }} />
        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        <hr className="sepline" style={{ background: "#888888" }} />
        {renderFilesPreview()}
      </div>
      {renderButtons()}
    </div>
  );

  async function previewOffer() {
    setLoadingPreview(true);
    try {
      const payload = {
        action: "send_offer_letter",
        sender_email: user.email,
        template_data: {
          "Letter Date": formData["Letter Date"],
          "Full Name": formData.candidateName?.trim(),
          "Employee Email": data.primary_email,
          "First Name": formData.candidateName?.trim().split(" ")[0] || "",
          Position: formData.Position,
          Volunteer: formData.Volunteer,
          Salary: formData.Salary,
          "Start Date": formData["Start Date"],
        },

        output_format: "pdf",
        preview: true,
        send_email: false,
        use_gpt: true,
      };
      const res = await postRequest(payload);
      const b64 = res.data.document_content;

      let email_body_html = res?.data?.email_body_html;
      let title = res?.data?.email_subject;

      const blob = new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], {
        type: "application/pdf",
      });

      if (email_body_html) {
        formData.content = email_body_html;
      }
      if (title) {
        formData.title = title;
      }

      setFormData({ ...formData });

      setPdfFile(b64);
      setPdfBlob(blob);
      setPdfModalVisible(true);
      toast.success("PDF preview ready");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }

  function downloadPdf() {
    if (!pdfBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(pdfBlob);
    a.download = `${formData.candidateName?.trim().replace(/\s+/g, "_")}_offer.pdf`;
    a.click();
  }

  async function attachPdf() {
    if (!pdfBlob) return;

    try {
      const fileName = `${formData.candidateName?.trim().replace(/\s+/g, "_")}_offer.pdf`;

      setAttachments((a) => [
        ...a,
        {
          name: fileName,
          contentType: "application/pdf",
          content: pdfFile,
        },
      ]);

      setOfferLatter({
        name: fileName,
        contentType: "application/pdf",
        content: pdfFile,
      });

      setPdfModalVisible(false);
      toast.success("File successfully attached");
    } catch (err) {
      toast.error("Failed to attach the file. Please try again");
    }
  }

  const updateCandidateDetails = async () => {
    if (!needToUpdate || !candidateID) {
      return;
    }

    let columns = { volunteer_work: formData.Volunteer };

    if (formData.Position && !data.job_title) {
      columns.job_title = formData.Position;
    }

    if (formData.Salary && !data.employee_salary) {
      columns.employee_salary = formData.Salary;
    }

    if (formData["Start Date"] && !data.employment_start_date) {
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

    setLoadingSend(true);
    let result = await sendEncryptedRequest(payload, keys, fingerprints);
    if (result.status) {
      updateTable();
    }
    setLoadingSend(false);
  };

  const UploadDocuments = async () => {
    if (!offerLatter) {
      return;
    }

    try {
      setLoading(true);

      let payload = {
        emailid: user?.email,
        email_id: data.original_email,
        files: [
          {
            file_name: offerLatter.name || "",
            file_content: offerLatter.content,
            doc_category: "Onboarding",
            doc_name: offerLatter.name,
            doc_type: "Other",
            document_type: "other",
            emp_view: true,
          },
        ],
      };

      await api.upload_documents(payload);
      setLoading(false);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  async function sendOffer() {
    setgeneratedMessage(false);
    setLoadingSend(true);
    try {
      const payload = {
        action: "send_offer_letter",
        sender_email: user.email,
        template_data: {
          "Letter Date": formData["Letter Date"],
          "Full Name": formData.candidateName?.trim(),
          "Employee Email": data.primary_email,
          "First Name": formData.candidateName?.trim().split(" ")[0] || "",
          Position: formData.Position,
          Salary: formData.Salary,
          Volunteer: formData.Volunteer,
          "Start Date": formData["Start Date"],
        },
        attachments: attachments,
        output_format: "pdf",
        send_email: true,
        recipient_email: data.primary_email,
        use_gpt: true,
        from_email: user.email,
      };
      await postRequest(payload);
      await updateCandidateDetails();
      await UploadDocuments();

      toast.success("Offer letter sent");
      completeResetForm();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Send failed");
    } finally {
      setLoadingSend(false);
    }
  }

  async function generateCustomEmail() {
    setLoadingGenerate(true);
    try {
      const payload = {
        action: "generate_custom_email",
        sender_email: user.email,
        email_description: aiContent,
        use_gpt: true,
        template_data: formData,
      };
      const res = await postRequest(payload);
      toast.success("Custom email generated");
      handleChange("title", res.data.email_subject);
      handleChange("content", res.data.email_body_html);
      setgeneratedMessage(true);
      setAiModal(false);
    } catch (err) {
      toast.error(err.message || "Generation failed");
    } finally {
      setLoadingGenerate(false);
    }
  }

  async function sendCustomEmail() {
    setgeneratedMessage(false);
    setLoadingSend(true);
    try {
      const payload = {
        action: "generate_custom_email_send",
        sender_email: user.email,
        recipient_email: data.primary_email,
        email_subject: formData.title,
        email_body_html: formData.content,
        attachments: attachments,
        from_email: user.email,
      };

      await postRequest(payload);
      completeResetForm();
      toast.success("Custom email sent");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Send failed");
    } finally {
      setLoadingSend(false);
    }
  }

  const PdfPreviewModal = () =>
    pdfModalVisible &&
    ReactDOM.createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 99999999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            minWidth: "300px",
            width: "100%",
            maxWidth: "90%",
            height: "95%",
            background: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5 className="mb-0">📄 Offer Letter Preview</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPdfModalVisible(false)}>
              <IoMdClose />
            </button>
          </div>
          <iframe src={URL.createObjectURL(pdfBlob)} style={{ flex: 1, border: "none" }} />
          <div
            className="d-flex gap-3 justify-content-end"
            style={{ padding: "1rem", borderTop: "1px solid #ccc", textAlign: "right" }}
          >
            <button className="btn btn-outline-secondary" onClick={downloadPdf}>
              Download
            </button>
            <button className="themeButton" style={{ borderRadius: "5px" }} onClick={attachPdf}>
              Add as Attachment
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  const renderInputBox = (label, val, key, ph, disabled) => (
    <div className="mb-3">
      <label className="form-label fw-bold" htmlFor={key}>
        {label}
      </label>
      <input
        disabled={disabled}
        id={key}
        className="form-control bigHoverInput"
        placeholder={ph}
        value={val}
        onChange={(e) => handleChange(key, e.target.value)}
        style={{ cursor: "default" }}
      />
    </div>
  );

  const renderDatePicker = (label, val, key) => (
    <div className="mb-3">
      <label className="form-label fw-bold" htmlFor={key}>
        {label}
      </label>
      <DatePicker
        maxDate={"2099"}
        id={key}
        selected={val ? pickDateOnly(val) : null}
        onChange={(d) => handleChange(key, d ? formatDateToET(d) : "")}
        dateFormat="MM/dd/yyyy"
        className="form-control bigHoverInput"
        placeholderText="MM/DD/YYYY"
      />
    </div>
  );

  const renderAttachments = () => {
    if (!attachments.length || previewEmailMode) {
      return <></>;
    }
    return (
      <div className="mt-3 d-flex flex-wrap gap-2 flex-column">
        {attachments.map((f, i) => (
          <div
            key={i}
            className="d-flex justify-content-between align-items-center border rounded gap-2"
            style={{ background: "#f1f1f9", padding: "8px" }}
          >
            <span
              title={f.name}
              style={{
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {f.name}
            </span>
            <button className="successoutlineButton" onClick={() => removeAttachment(i)}>
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderButtons = () => (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 my-4">
        <div>
          {previewEmailMode ? (
            <></>
          ) : (
            <button
              className="successoutlineButton border p-2 px-3"
              style={{ borderRadius: "10px", ...fadeStyle(loadingAdd) }}
              onClick={() => {
                setLoadingAdd(true);
                fileInputRef.current.click();
                setLoadingAdd(false);
              }}
            >
              {loadingAdd ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span> Loading attachments
                </>
              ) : (
                <>
                  <Paperclip size={16} /> Add Attachments
                </>
              )}
            </button>
          )}
          <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="successoutlineButton border p-2 px-3"
            style={{ borderRadius: "10px", ...fadeStyle(!isContent || !formData?.title) }}
            onClick={() => {
              if (isContent && formData?.title) {
                setPreviewEmailMode(!previewEmailMode);
              }
            }}
            disabled={!isContent || !formData?.title}
          >
            {previewEmailMode ? (
              <ArrowLeft className="ms-2" style={{ height: "15px", width: "15px" }} />
            ) : (
              <Eye className="ms-2" style={{ height: "15px", width: "15px" }} />
            )}
            {previewEmailMode ? "Back To Edit" : "Preview"}{" "}
          </button>

          <button
            className="successoutlineButton border p-2 px-3"
            style={{ borderRadius: "10px", ...fadeStyle(loadingCancel) }}
            onClick={() => {
              setLoadingCancel(true);
              completeResetForm();
              setgeneratedMessage(false);
              setTimeout(() => setLoadingCancel(false), 500);
            }}
          >
            {loadingCancel ? (
              <>
                <span className="spinner-border spinner-border-sm"></span> Clear ...
              </>
            ) : (
              <>
                <IoMdClose style={{ height: "20px", width: "20px" }} /> Clear
              </>
            )}
          </button>

          <button
            className="themePurpleBGHover p-2 px-3 text-white d-flex gap-2 align-items-center"
            style={{ borderRadius: "10px", ...fadeStyle(loadingSend || !isContent || !formData?.title) }}
            onClick={formData.templateType === "offer_letter" ? sendOffer : sendCustomEmail}
            disabled={loadingSend || !isContent || !formData?.title}
          >
            {loadingSend ? (
              <>
                <span className="spinner-border spinner-border-sm"></span> Sending
              </>
            ) : (
              <>
                <Send style={{ height: "15px", width: "15px" }} /> Send Email
              </>
            )}
          </button>
        </div>
      </div>
      {renderAttachments()}
    </div>
  );

  const renderGenerateWithAI = () => {
    if (!iscustomEmails) {
      return <></>;
    }

    return (
      <div className="mb-4">
        <label className="form-label fw-bold">AI Email Generation (Optional):</label>
        <div className="d-flex gap-2 align-items-start">
          <textarea
            className="form-control bigHoverInput"
            placeholder="Describe the email you want to send (e.g., welcome email, follow-up, etc.) to auto generate subject line and body"
            style={{ minHeight: "60px", padding: "10px", ...fadeStyle(loadingGenerate) }}
            value={aiContent}
            onChange={(e) => setAiContent(e.target.value)}
          />
          <button
            type="button"
            disabled={!aiContent || loadingGenerate}
            className="themePurpleBGHover d-flex gap-2 aling-items-center p-2 px-3 text-white fw-semibold"
            style={{
              bottom: "12px",
              borderRadius: "10px",
              left: "16px",
              backgroundColor: !aiContent ? "#0b4da157" : "",
              ...fadeStyle(loadingGenerate),
            }}
            onClick={generateCustomEmail}
          >
            {loadingGenerate ? (
              <>
                <span className="magic"></span> Generating...
              </>
            ) : (
              <>
                <span className="magic"></span> Generate
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderMailSuccess = () => {
    if (!generatedMessage) {
      return <></>;
    }
    return (
      <div
        className="d-flex align-items-center gap-2 my-3 p-2"
        style={{
          border: "1px solid #98ffbcff",
          borderRadius: "8px",
          background: "#f0fdf4",
        }}
      >
        <div
          style={{
            height: "20px",
            width: "20px",
            borderRadius: "50%",
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={12} color="#ffffff" strokeWidth={2} />
        </div>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#166534",
              margin: 0,
            }}
          >
            Email Generated Successfully
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#16a34a",
              margin: 0,
              fontWeight: 500,
            }}
          >
            AI has generated your email. Review and edit before sending.
          </p>
        </div>

        <button
          style={{
            color: "#16a34a",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => setgeneratedMessage(false)}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#166534")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#16a34a")}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    );
  };

  const renderCommon = (extra) => (
    <div>
      {extra()}

      {renderGenerateWithAI()}

      {renderInputBox("To", data?.primary_email, "", "Enter Candidate Email", true)}

      {renderMailSuccess()}

      <div className="d-md-flex justify-content-between mb-2 gap-4 align-items-center">
        <div className="w-100">{renderInputBox("Subject", formData.title, "title", "Subject")}</div>
      </div>

      <CustomEditor label="Message" onChange={(val) => handleChange("content", val)} value={formData.content} />
      {renderButtons()}
    </div>
  );

  const renderOfferLetterFields = () => (
    <>
      <div className="form-label">Offer Letter Details</div>
      <div className="border rounded px-2 py-3 mb-4 shadow-sm">
        <div className={`${styles.tabcontentcontainer} py-3`}>
          {renderDatePicker("Letter Date", formData["Letter Date"], "Letter Date")}
          {renderInputBox("Candidate Name", formData.candidateName, "candidateName")}
          {renderInputBox("Position", formData.Position, "Position")}
          {renderInputBox("Salary", formData.Salary, "Salary")}
          {renderDatePicker("Start Date", formData["Start Date"], "Start Date")}
          <div className="mb-3">
            <label className="form-label fw-bold">Volunteer Work</label>

            <PremiumSelect
              options={[
                { value: "No", text: "No" },
                { value: "Yes", text: "Yes" },
              ]}
              value={String(formData.Volunteer || "")}
              onChange={(val) => {
                resetForm();
                handleChange("Volunteer", val);
              }}
              placeholder="Select..."
            />
          </div>

          {/* {renderDatePicker("Response Deadline", formData.responseDeadline, "responseDeadline")} */}
        </div>
        <div>
          <button
            className="themeButton"
            style={{ borderRadius: "10px", ...fadeStyle(loadingPreview) }}
            onClick={previewOffer}
            disabled={loadingPreview}
          >
            {loadingPreview ? "Generating..." : "Generate & Preview"}
          </button>
        </div>
      </div>
    </>
  );

  const renderSelectBox = () => {
    let options = [
      { value: "custom", text: "Custom Email" },
      { value: "offer_letter", text: "Send Offer Letter" },
    ];

    if (isHideOffer) {
      options = [{ value: "custom", text: "Custom Email" }];
    }

    return (
      <div className="mb-3">
        <label className="form-label fw-bold">Email Template</label>

        <PremiumSelect
          options={options}
          value={String(formData.templateType || "")}
          onChange={(val) => {
            resetForm();
            handleChange("templateType", val);
          }}
          placeholder="Select..."
        />
      </div>
    );
  };

  const renderHeader = () => (
    <div className="w-100">
      <div className={`w-100 d-flex align-items-center gap-4 justify-content-between`}>
        <div className="d-flex align-items-center gap-2">
          <HiOutlineMail style={{ fontSize: 20 }} />
          <div>
            <strong className="h5">
              Send Email to {data?.first_name || ""} {data?.last_name || ""}
            </strong>
          </div>
        </div>

        <button
          onClick={() => setIsModalActive(false)}
          type="button"
          className="hidemodalclosebtn pdfcontrollButtonsPDF"
        >
          <X size={20} />
        </button>
      </div>
      <div>Compose and send a professional email to the candidate</div>
    </div>
  );

  return isModalActive ? (
    <>
      <OverlayModal
        isActive
        onClose={() => setIsModalActive(false)}
        style={{ maxWidth: "800px" }}
        modalStyle={{ background: "#fff", padding: "20px", color: "#000" }}
      >
        <div className="modal-content">
          <div className="modal-header">{renderHeader()}</div>
          <div className="modal-body mt-2">
            {!previewEmailMode ? (
              <div className={`p-0 ${styles.tabcontentcontainerMain}`}>
                {renderSelectBox()}
                {formData.templateType === "offer_letter"
                  ? renderCommon(renderOfferLetterFields)
                  : renderCommon(() => null)}
              </div>
            ) : (
              <EmailPreview />
            )}
          </div>
        </div>
        <ThemeLoader show={loadingPreview || loadingSend || loading} fixed />
      </OverlayModal>
      <PdfPreviewModal />
    </>
  ) : null;
}
