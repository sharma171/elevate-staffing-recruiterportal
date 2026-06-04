import React, { useEffect, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import styles from "./css/uploadFIles.module.css";
import images from "../../assets/images/new";
import DatePicker from "react-datepicker";
import { returnTruncatedStr } from "../../helpers/StrHelpers";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { toast } from "react-toastify";
import ThemeLoader from "../../components/ThemeLoader";
import UploadStatusModal from "../../components/UploadStatusModal";
import { X } from "lucide-react";

const { visa_status } = images;

function DocumentsSection({ show, setshow, email_id, defaultDocs = [], isBase64, customDocumentType }) {
  const [files, setfiles] = useState([]);
  const [errorIndexes, setErrorIndexes] = useState([]);
  const [loading, setloading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const processFiles = async () => {
      const processed = await Promise.all(
        defaultDocs.map(async (doc) => {
          let fileObj = doc?.file;
          if (isBase64) {
            const base64 = doc?.base64file;
            return {
              file_name: doc.name || "",
              file_content: base64,
              doc_category: "",
              doc_expiry: "",
              doc_validfrom: "",
              doc_name: "",
              doc_type: "",
              document_type: "other",
            };
          }
          if (fileObj && typeof fileObj === "object") {
            const base64 = await toBase64(fileObj);
            return {
              file_name: fileObj.name || "",
              file_content: base64,
              doc_category: "",
              doc_expiry: "",
              doc_validfrom: "",
              doc_name: "",
              doc_type: "",
              document_type: "other",
            };
          }
          return doc;
        }),
      );

      setfiles(processed);
    };

    setErrorIndexes([]);

    if (show) {
      processFiles();
    } else {
      setUploadFiles([]);
      setfiles([]);
    }
  }, [show]);

  useEffect(() => {
    if (!email_id && show) {
      toast.error("Email ID is required");
      setshow(false);
    }
  }, [email_id, show]);

  if (!show) {
    return null;
  }

  let dropdownOptions = [
    { label: "Select Type", value: "", disabled: true },
    { label: "Work Authorization", value: "Work Authorization" },
    { label: "E-Verify", value: "E-Verify" },
    { label: "Offer Letter", value: "Offer Letter" },
    { label: "State ID", value: "State ID" },
    { label: "Passport", value: "Passport" },
    { label: "Visa", value: "Visa" },
    { label: "I-9 Form", value: "I-9 Form" },
    { label: "I-9 Form Audit", value: "I-9 Form Audit" },
    { label: "I-983 Form", value: "I-983 Form" },
    { label: "SSN Card", value: "SSN Card" },
    { label: "Driver's License", value: "Driver's License" },
    { label: "Bank Details", value: "Bank Details" },
    { label: "Other", value: "Other" },
  ];

  if (customDocumentType) {
    dropdownOptions = customDocumentType;
  }

  const categoryOptions = [
    { label: "Select Category", value: "", disabled: true },
    { label: "Onboarding", value: "Onboarding" },
    { label: "Compliance", value: "Compliance" },
    { label: "Payroll", value: "Payroll" },
    { label: "Performance", value: "Performance" },
    { label: "Resume", value: "Resume" },
    { label: "Identification", value: "Identification" },
    { label: "Other", value: "Other" },
  ];

  const handleFileChange = async (evg) => {
    const fileArray = Array.from(evg.target.files);
    const mappedFiles = await Promise.all(
      fileArray.map(async (file) => {
        const base64 = await toBase64(file);
        return {
          file_name: file.name || "",
          file_content: base64,
          doc_category: "",
          doc_expiry: "",
          doc_validfrom: "",
          doc_name: "",
          doc_type: "",
          document_type: "other",
        };
      }),
    );
    setfiles((prev) => [...prev, ...mappedFiles]);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...files];
    updated[index][field] = value;
    if (errorIndexes?.[index]?.[field]) {
      errorIndexes[index][field] = "";
    }
    setfiles(updated);
  };

  const validate = () => {
    const errors = files.map((f) => {
      const err = {};
      if (!f.doc_type?.trim()) err.doc_type = "Document Type is required";
      if (!f.doc_category?.trim()) err.doc_category = "Document category is required";

      if (f.doc_validfrom && f.doc_expiry) {
        const validFromDate = new Date(f.doc_validfrom);
        const expiryDate = new Date(f.doc_expiry);
        if (expiryDate <= validFromDate) {
          err.doc_expiry = "Expiry date must be greater than Valid From date";
        }
      }
      return err;
    });

    const hasErrors = errors.some((e) => Object.keys(e).length > 0);
    setErrorIndexes(errors);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setUploadFiles(
      files.map((sf) => ({
        file: sf,
        status: "pending",
        percent: 0,
      })),
    );
    setloading(true);

    for (let i = 0; i < files.length; i++) {
      setUploadFiles((curr) =>
        curr.map((item, idx) => (idx === i ? { ...item, status: "uploading", percent: 0 } : item)),
      );

      let currentPercent = 0;
      const progressInterval = setInterval(() => {
        currentPercent = Math.min(currentPercent + Math.floor(Math.random() * 6) + 3, 95);
        setUploadFiles((curr) => curr.map((item, idx) => (idx === i ? { ...item, percent: currentPercent } : item)));
      }, 300);

      const payload = {
        emailid: user.email,
        email_id: email_id,
        files: [files[i]],
      };

      try {
        const res = await api.upload_documents(payload);

        clearInterval(progressInterval);

        setUploadFiles((curr) =>
          curr.map((item, idx) => (idx === i ? { ...item, status: "uploaded", percent: 100 } : item)),
        );

        if (i === files.length - 1) {
          setloading(false);
          setTimeout(() => {
            setshow(false, true);
          }, 2000);
          toast.success(res.message);
        }
      } catch (err) {
        clearInterval(progressInterval);
        setUploadFiles((curr) =>
          curr.map((item, idx) => (idx === i ? { ...item, status: "error", percent: 0 } : item)),
        );
        setloading(false);
        toast.error(err.error || err?.response?.data?.message || "Failed");
      }
    }
  };

  return (
    <OverlayModal isActive={show} onClose={() => setshow(false)} style={{ maxWidth: "60%" }}>
      <div>
        <div className="mb-5 d-flex gap-2 justify-content-between">
          <div>
            <div className="themeHeading mb-2">Upload Document(s)</div>
            <div className="fontgray fs-6">
              Upload a new document to your profile. Supported formats include PDF, JPG, and PNG.
            </div>
          </div>
          <button
            style={{
              position: "fixed",
              top: "10px",
              right: "25px",
              zIndex: 1,
            }}
            type="button"
            onClick={() => setshow(false)}
            className="hidemodalclosebtn pdfcontrollButtonsPDF "
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="my-3">
          <div className={`table-responsive nowrap ${styles.table} px-1`}>
            <table className="table table-borderless table-hover align-middle">
              <thead>
                <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                  <th>
                    <div className={`${styles.th} ps-2`}>
                      <span className="material-symbols-outlined fontgray">file_copy</span>
                      File Name
                    </div>
                  </th>

                  <th>
                    <div className={styles.th}>
                      <img src={visa_status} />
                      Document Type
                    </div>
                  </th>
                  <th>
                    <div className={styles.th}>
                      <img src={visa_status} />
                      Document Category
                    </div>
                  </th>
                  <th>
                    <div className={styles.th}>
                      <img src={visa_status} />
                      Document Name
                    </div>
                  </th>
                  <th>
                    <div className={styles.th}>
                      <span className="material-symbols-outlined fontgray">calendar_month</span>
                      Valid From
                    </div>
                  </th>
                  <th>
                    <div className={styles.th}>
                      <span className="material-symbols-outlined fontgray">calendar_month</span>
                      Expiry Date
                    </div>
                  </th>

                  <th>
                    <div className={`${styles.th}`}>
                      <span className="user-visible mb-0"></span>
                      <div>Visible to Employee</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {files.map((file, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <strong>{returnTruncatedStr(file.file_name, 20)}</strong>
                      </div>
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      <select
                        className={`form-select ${errorIndexes?.[index]?.doc_type ? "is-invalid" : ""}`}
                        value={file.doc_type}
                        onChange={(e) => {
                          handleFieldChange(index, "doc_type", e.target.value);
                        }}
                      >
                        {dropdownOptions.map((option, idx) => (
                          <option key={idx} value={option.value} disabled={option.disabled}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      <select
                        className={`form-select ${errorIndexes?.[index]?.doc_category ? "is-invalid" : ""}`}
                        value={file.doc_category}
                        onChange={(e) => handleFieldChange(index, "doc_category", e.target.value)}
                      >
                        {categoryOptions.map((option, idx) => (
                          <option key={idx} value={option.value} disabled={option.disabled}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        style={{ minWidth: "170px" }}
                        value={file.doc_name}
                        onChange={(e) => handleFieldChange(index, "doc_name", e.target.value)}
                        className="form-control"
                        placeholder="Enter doc name"
                      />
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      <DatePicker
                        maxDate={"2099"}
                        showYearDropdown
                        showMonthDropdown
                        showIcon
                        calendarIconClassName="calenderIconRight"
                        toggleCalendarOnIconClick
                        scrollableYearDropdown
                        yearDropdownItemNumber={80}
                        selected={file.doc_validfrom ? new Date(file.doc_validfrom) : null}
                        onChange={(date) => handleFieldChange(index, "doc_validfrom", date?.toISOString() || "")}
                        dateFormat="MM/dd/yyyy"
                        className="form-control"
                        placeholderText="MM/DD/YYYY"
                      />
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      <DatePicker
                        maxDate={"2099"}
                        showYearDropdown
                        showMonthDropdown
                        showIcon
                        calendarIconClassName="calenderIconRight"
                        toggleCalendarOnIconClick
                        scrollableYearDropdown
                        yearDropdownItemNumber={80}
                        selected={file.doc_expiry ? new Date(file.doc_expiry) : null}
                        onChange={(date) => handleFieldChange(index, "doc_expiry", date?.toISOString() || "")}
                        minDate={
                          file.doc_validfrom
                            ? new Date(new Date(file.doc_validfrom).getTime() + 24 * 60 * 60 * 1000)
                            : null
                        }
                        dateFormat="MM/dd/yyyy"
                        className="form-control"
                        placeholderText="MM/DD/YYYY"
                      />
                      {errorIndexes?.[index]?.doc_expiry ? (
                        <div className="font12 text-danger">{errorIndexes?.[index]?.doc_expiry}</div>
                      ) : null}
                    </td>
                    <td className="text-center">
                      <input
                        style={{ borderColor: "#0FBE2F" }}
                        title="Visible to Employee"
                        type="checkbox"
                        className="form-check-input greenColor"
                        checked={file.emp_view}
                        onChange={(e) => handleFieldChange(index, "emp_view", e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end my-3">
            <button className="themeButton my-3" onClick={handleSave}>
              <span className="material-symbols-outlined">upload</span>
              Upload Document
            </button>
          </div>
        </div>
        <UploadStatusModal uploadFiles={uploadFiles} />
        <ThemeLoader show={loading} />
      </div>
    </OverlayModal>
  );
}

export default DocumentsSection;
