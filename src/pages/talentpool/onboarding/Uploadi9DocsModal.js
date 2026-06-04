import React, { useEffect, useRef, useState } from "react";
import OverlayModal from "../../../components/OverlayModal";
import styles from "./Uploadi9DocsModal.module.css";
import images from "../../../assets/images/new";
import DatePicker from "react-datepicker";
import { dateToUTCDate, pickDateOnly, returnTruncatedStr } from "../../../helpers/StrHelpers";
import { useAuth } from "../../../authContext";
import { toast } from "react-toastify";
import ThemeLoader from "../../../components/ThemeLoader";
import UploadStatusModal from "../../../components/UploadStatusModal";
import { axiosApi } from "../../../components";
import { X } from "lucide-react";

const { visa_status } = images;

const BASE_URL = "https://us-east1-recruiterportal.cloudfunctions.net/documents_upload_determine_type_v3";

function Uploadi9DocsModal({ show, setshow, candidate, defaultDocs = [], isBase64, update }) {
  const [files, setfiles] = useState([]);
  const [errorIndexes, setErrorIndexes] = useState([]);
  const [loading, setloading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);

  const inputFileRef = useRef();

  const { user } = useAuth();
  const adminEmial = user.email;
  const email_id = candidate?.original_email;

  useEffect(() => {
    if (show) {
      inputFileRef?.current?.click();
    }
  }, [show]);

  useEffect(() => {
    const processFiles = async () => {
      const processed = await Promise.all(
        defaultDocs.map(async (doc) => {
          let fileObj = doc?.file;
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
      setfiles([]);
      setUploadFiles([]);
    }
  }, [show]);

  // useEffect(() => {
  //   if (!email_id && show) {
  //     toast.error("Email ID is required");
  //     setshow?.(false);
  //   }
  // }, [email_id, show]);

  if (!show) {
    return null;
  }

  const dropdownOptions = [
    { label: "Select Type", value: "", disabled: true },
    { label: "E-Verify", value: "E-Verify" },
    { label: "I-9 Form", value: "I-9 Form" },
    { label: "I-9 Form Audit", value: "I-9 Form Audit" },
  ];

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
    const validFiles = [];
    let oversized = false;

    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        oversized = true;
        continue;
      }

      const base64 = await toBase64(file);
      validFiles.push({
        file_name: file.name || "",
        file_content: base64,
        doc_category: "",
        doc_expiry: "",
        doc_validfrom: "",
        doc_name: "",
        doc_type: "",
        document_type: "other",
      });
    }

    if (oversized) {
      toast.error("Some files exceed the 5MB limit.");
    }

    if (validFiles.length) {
      setfiles((prev) => [...prev, ...validFiles]);
    }
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

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    setUploadFiles(
      files.map((f) => ({
        file: f,
        status: "pending",
        percent: 0,
      })),
    );

    setloading(true);

    for (let i = 0; i < files.length; i++) {
      setUploadFiles((curr) =>
        curr.map((item, idx) => (idx === i ? { ...item, status: "uploading", percent: 0 } : item)),
      );

      const payload = {
        email_id: email_id,
        emailid: adminEmial,
        files: [files[i]],
      };

      axiosApi
        .post(BASE_URL, payload, {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            setUploadFiles((curr) => curr.map((item, idx) => (idx === i ? { ...item, percent } : item)));
          },
        })

        .then((res) => {
          setUploadFiles((curr) =>
            curr.map((item, idx) => (idx === i ? { ...item, status: "uploaded", percent: 100 } : item)),
          );

          if (i === files.length - 1) {
            setloading(false);

            setTimeout(() => {
              setshow?.(false, true);
            }, 3000);

            update?.();

            toast.success(res.message);

            console.log(res);
          }
        })

        .catch((err) => {
          setUploadFiles((curr) =>
            curr.map((item, idx) => (idx === i ? { ...item, status: "error", percent: 0 } : item)),
          );

          setloading(false);

          toast.error(err.error || err?.response?.data?.message || "Failed");
        });
    }
  };
  return (
    <OverlayModal isActive={show} onClose={() => setshow?.(false)} style={{ maxWidth: "60%" }}>
      <div>
        <div className="mb-4 d-flex gap-2 justify-content-between">
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
          <div className="d-flex justify-content-start">
            <div className="mb-3">
              <label className="fw-bold mb-1" htmlFor="inputGroupFile04">
                Select Files
              </label>
              <input
                ref={inputFileRef}
                value=""
                onChange={handleFileChange}
                type="file"
                className="form-control"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                aria-label="Upload"
                multiple
              />
            </div>
          </div>
          {files?.length ? (
            <div className={`table-responsive nowrap ${styles.table} px-1`}>
              <table className="table table-borderless table-hover align-middle">
                <thead>
                  <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                    <th>
                      <div className={`${styles.th} ps-2`}>
                        <span class="material-symbols-outlined fontgray">file_copy</span>
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
                        <span class="material-symbols-outlined fontgray">calendar_month</span>
                        Valid From
                      </div>
                    </th>
                    <th>
                      <div className={styles.th}>
                        <span class="material-symbols-outlined fontgray">calendar_month</span>
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

                        {/* <input
                        value={file.file_name}
                        onChange={(e) => handleFieldChange(index, "file_name", e.target.value)}
                        className={`form-control ${errorIndexes.includes(index) ? "is-invalid" : ""}`}
                        placeholder="Enter file name"
                      /> */}
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
                          selected={file.doc_validfrom ? pickDateOnly(file.doc_validfrom) : null}
                          onChange={(date) => {
                            let newDate = dateToUTCDate(date);
                            handleFieldChange(index, "doc_validfrom", newDate || "");
                          }}
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
                          selected={file.doc_expiry ? pickDateOnly(file.doc_expiry) : null}
                          minDate={
                            file.doc_validfrom
                              ? new Date(new Date(file.doc_validfrom).getTime() + 24 * 60 * 60 * 1000) // +1 day
                              : null
                          }
                          onChange={(date) => {
                            let newDate = dateToUTCDate(date);

                            if (file.doc_validfrom && new Date(newDate) <= new Date(file.doc_validfrom)) {
                              toast.error("Expiry date must be greater than Valid From date");
                              return;
                            }

                            handleFieldChange(index, "doc_expiry", newDate || "");
                          }}
                          dateFormat="MM/dd/yyyy"
                          className="form-control"
                          placeholderText="MM/DD/YYYY"
                        />
                        {errorIndexes?.[index]?.doc_expiry ? (
                          <div className="font12 text-danger">{errorIndexes?.[index]?.doc_expiry}</div>
                        ) : (
                          <></>
                        )}
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
          ) : (
            <></>
          )}
          <div className="d-flex justify-content-end my-3">
            <button className="themeButton my-3" onClick={handleSave}>
              <span class="material-symbols-outlined">upload</span>
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

export default Uploadi9DocsModal;
