import React, { useEffect, useState } from "react";
import styles from "./css/uploadFIles.module.css";
import OverlayModal from "../../components/OverlayModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import { X } from "lucide-react";

function AddModal({ show, setShow }) {
  const [formData, setFormData] = useState({});
  const [loading, setloading] = useState(false);

  const [errors, setErrors] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    let values = {
      doc_category: show?.doc_category,
      doc_expiry: show?.doc_expiry,
      doc_name: show?.doc_name,
      doc_type: show?.doc_type,
      doc_validfrom: show?.doc_validfrom,
      emp_view: show?.emp_view,
    };

    setFormData({ ...values } || {});
  }, [show]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.doc_type?.trim()) newErrors.doc_type = "Document Type is required";
    if (!formData?.doc_category?.trim()) newErrors.doc_category = "Document category is required";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    console.log(formData, "formdata ss");
    setloading(true);

    let payload = {
      email_id: show.emailid,
      emailid: user.email,
      task: "update_data",
      row_id: show?.id,
      ...formData,
    };

    api
      .documents_delete_retrieve(payload)
      .then((res) => {
        setloading(false);
        toast.success(res.message);
        setShow(false, true);
        console.log(res);
      })
      .catch((err) => {
        setloading(false);
        toast.error(err.error || err.message);
        console.log(err);
      }); // setShow(false);
  };

  const dropdownOptions = [
    { label: "Select Document Type", value: "", isFirst: true },
    { label: "Work Authorization", value: "Work Authorization" },
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
    { label: "Select Document Category", value: "", isFirst: true },
    { label: "Onboarding", value: "Onboarding" },
    { label: "Compliance", value: "Compliance" },
    { label: "Payroll", value: "Payroll" },
    { label: "Performance", value: "Performance" },
    { label: "Resume", value: "Resume" },
    { label: "Identification", value: "Identification" },
  ];

  if (!show) return null;

  let isexpiryDate = new Date(formData.doc_expiry) != "Invalid Date";
  let iddoc_validfrom = new Date(formData.doc_validfrom) != "Invalid Date";

  return (
    <OverlayModal style={{ maxWidth: "600px" }} isActive={show} onClose={() => setShow(false)}>
      <>
        <div className="mb-5 d-flex gap-2 justify-content-between">
          <div>
            <div className="themeColor h4">Edit Document</div>

            <div className="fontgray fs-6">Update document information below. </div>
          </div>
          <button
            style={{
              position: "fixed",
              top: "10px",
              right: "25px",
              zIndex: 1,
            }}
            type="button"
            onClick={() => setShow(false)}
            className="hidemodalclosebtn pdfcontrollButtonsPDF "
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Document Name</label>
            <input
              className={`form-control ${errors.doc_name ? "is-invalid" : ""}`}
              value={formData.doc_name}
              onChange={(e) => handleChange("doc_name", e.target.value)}
              placeholder="Enter document name"
            />
            {errors.doc_name && <div className="invalid-feedback">{errors.doc_name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Document Type</label>
            <select
              className={`form-select ${errors.doc_type ? "is-invalid" : ""}`}
              value={formData.doc_type}
              onChange={(e) => handleChange("doc_type", e.target.value)}
            >
              {dropdownOptions.map((option, idx) => {
                if (option.isFirst) {
                  return (
                    <option key={idx} value="" disabled selected>
                      {option.label}
                    </option>
                  );
                }

                return (
                  <option key={idx} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                );
              })}
            </select>
            {errors.doc_type && <div className="invalid-feedback">{errors.doc_type}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Document Category</label>
            <select
              className={`form-select ${errors.doc_category ? "is-invalid" : ""}`}
              value={formData.doc_category}
              onChange={(e) => handleChange("doc_category", e.target.value)}
            >
              {categoryOptions.map((option, idx) => {
                if (option.isFirst) {
                  return (
                    <option key={idx} value="" disabled selected>
                      {option.label}
                    </option>
                  );
                }
                return (
                  <option key={idx} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                );
              })}
            </select>
            {errors.doc_category && <div className="invalid-feedback">{errors.doc_category}</div>}
          </div>

          <div className="d-md-flex gap-2">
            <div className="mb-3">
              <label className="form-label">Valid From</label>
              <DatePicker
                maxDate={"2099"}
                onChange={(date) => {
                  let newDate = date
                    ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString()
                    : null;

                  handleChange("doc_validfrom", newDate);
                }}
                selected={iddoc_validfrom ? formData.doc_validfrom : null}
                // onChange={(date) => handleChange("doc_validfrom", date)}
                showYearDropdown
                showMonthDropdown
                showIcon
                calendarIconClassName="calenderIconRight"
                toggleCalendarOnIconClick
                scrollableYearDropdown
                yearDropdownItemNumber={80}
                dateFormat="MM/dd/yyyy"
                className="form-control ps-2"
                placeholderText="MM/DD/YYYY"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Expiry Date</label>
              <DatePicker
                maxDate={"2099"}
                selected={isexpiryDate ? formData.doc_expiry : null}
                onChange={(date) => {
                  let newDate = date
                    ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString()
                    : null;

                  handleChange("doc_expiry", newDate);
                }}
                showYearDropdown
                showMonthDropdown
                showIcon
                calendarIconClassName="calenderIconRight"
                toggleCalendarOnIconClick
                scrollableYearDropdown
                yearDropdownItemNumber={80}
                dateFormat="MM/dd/yyyy"
                className="form-control ps-2"
                placeholderText="MM/DD/YYYY"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Visible to Employee</label>
            <div className="mb-3 form-control py-0" onClick={() => handleChange("emp_view", !formData.emp_view)}>
              <input
                id="empView"
                style={{ borderColor: "#0FBE2F" }}
                title="Visible to Employee"
                type="checkbox"
                className="form-check-input greenColor me-2 my-2 py-0"
                checked={formData.emp_view}
                onChange={(e) => handleChange("emp_view", e.target.checked)}
              />
              <label className="form-label my-2" htmlFor="empView">
                Visible to Employee
              </label>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            {loading ? (
              <div className="themeButton" style={{ height: "56px" }}>
                <div class="spinner-border text-light spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="themeButton" onClick={handleSubmit}>
                <span class="material-symbols-outlined">save</span>
                Save Changes
              </div>
            )}
          </div>
        </form>
      </>
    </OverlayModal>
  );
}

export default AddModal;
