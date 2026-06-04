import React, { useEffect, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import styles from "./css/uploadFIles.module.css";
import images from "../../assets/images/new";
import DatePicker from "react-datepicker";
import { returnTruncatedStr } from "../../helpers/StrHelpers";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { X, Loader2 } from "lucide-react";

const { visa_status } = images;

function BulkUpdateDocs({ show, onClose, onSuccess, files, candidate }) {
  const [localFiles, setLocalFiles] = useState([]);
  const [errorIndexes, setErrorIndexes] = useState([]);
  const [loading, setloading] = useState(false);
  const { user } = useAuth();

  const candidateEmail_id = candidate?.original_email || candidate?.primary_email;

  useEffect(() => {
    if (show && files && files.length > 0) {
      const initializedFiles = files.map((doc) => ({
        ...doc,
        // Ensure fields are not null to avoid uncontrolled input warnings
        doc_type: doc.doc_type || "",
        doc_category: doc.doc_category || "",
        doc_name: doc.doc_name || doc.file_name || "",
        doc_validfrom: doc.doc_validfrom || "",
        doc_expiry: doc.doc_expiry || "",
        emp_view: doc.emp_view || false,
      }));
      setLocalFiles(initializedFiles);
      setErrorIndexes([]);
    }
  }, [show, files]);

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

  const handleFieldChange = (index, field, value) => {
    const updated = [...localFiles];
    updated[index][field] = value;

    // Clear error if field is modified
    if (errorIndexes?.[index]?.[field]) {
      const newErrors = [...errorIndexes];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setErrorIndexes(newErrors);
    }
    setLocalFiles(updated);
  };

  const validate = () => {
    const errors = localFiles.map((f) => {
      const err = {};
      if (!f.doc_type?.trim()) err.doc_type = "Document Type is required";

      // if (f.doc_validfrom && f.doc_expiry) {
      //   const validFromDate = new Date(f.doc_validfrom);
      //   const expiryDate = new Date(f.doc_expiry);
      //   if (expiryDate <= validFromDate) {
      //     err.doc_expiry = "Expiry date must be greater than Valid From date";
      //   }
      // }

      // console.log(err, "err err");
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

    setloading(true);

    try {
      const payload = {
        emailid: user.email,
        email_id: candidateEmail_id,
        task: "bulk_update",
        updates: localFiles.map((doc) => ({
          row_id: doc.id,
          // file_name: doc.file_name,
          doc_type: doc.doc_type,
          doc_category: doc.doc_category,
          // doc_name: doc.doc_name,
          // doc_validfrom: doc.doc_validfrom,
          // doc_expiry: doc.doc_expiry,
          emp_view: doc.emp_view,
        })),
      };

      await api.documents_delete_retrieve(payload);

      toast.success("All documents updated successfully");

      setTimeout(() => {
        setloading(false);
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setloading(false);
      toast.error(err?.response?.data?.message || "Failed to update documents");
    }
  };

  return (
    <OverlayModal isActive={show} onClose={onClose} style={{ maxWidth: "80%" }}>
      <div>
        <div className="mb-4 d-flex gap-2 justify-content-between">
          <div>
            <div className="themeHeading mb-1">Edit Document(s)</div>
            <div className="fontgray fs-6">Update details for selected documents.</div>
          </div>
          <button
            style={{
              position: "fixed",
              top: "10px",
              right: "25px",
              zIndex: 1,
            }}
            type="button"
            onClick={onClose}
            disabled={loading}
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
                  {/* <th>
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
                  </th> */}

                  <th>
                    <div className={`${styles.th}`}>
                      <span className="user-visible mb-0"></span>
                      <div>Visible to Employee</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {localFiles.map((file, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2" title={file.file_name}>
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
                      {errorIndexes?.[index]?.doc_type && (
                        <div className="font12 text-danger">{errorIndexes[index].doc_type}</div>
                      )}
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
                    {/* <td>
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
                        selected={file.doc_expiry ? file.doc_expiry : null}
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
                    </td> */}
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
            <button
              className="themeButton my-3 d-flex align-items-center gap-2"
              onClick={handleSave}
              disabled={loading}
              style={{ minWidth: "160px", justifyContent: "center" }}
            >
              {loading ? (
                <>
                  <Loader2
                    className="animate-spin"
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                    size={18}
                  />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Update Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </OverlayModal>
  );
}

export default BulkUpdateDocs;
