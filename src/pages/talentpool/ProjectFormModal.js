import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import styles from "./css/ProjectModal.module.css";
import { axiosApi, OverlayModal, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { formatDateToET, formatUSPhone, pickDateOnly } from "../../helpers/StrHelpers";
import { useAuth } from "../../authContext";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const API_URL = "https://fetch-update-candidate-projects-v3-305451280005.us-east1.run.app";

export default function ProjectModal({ open, onClose, editProject, candidateId }) {
  const [loader, setLoader] = useState(false);
  const { user } = useAuth();
  const USER_EMAIL = user?.email;

  const isCompletedProject = String(editProject?.project_status).toLowerCase() == "completed";

  const [form, setForm] = useState({
    job_title: "",
    client_name: "",
    vendor_name: "",
    sub_vendor_name: "",
    project_role: "",
    project_start_date: "",
    project_bill_rate: "",
    reporting_manager: "",
    immediate_vendor_email: "",
    immediate_vendor_phone_number: "",
    project_work_mode: "Remote",
    project_comments: "",
    client_address_line1: "",
    client_address_line2: "",
    client_city: "",
    client_state: "",
    client_zipcode: "",
  });

  const [isPrimary, setIsPrimary] = useState(true);
  const [errors, setErrors] = useState({});
  const showAddressFields = form.project_work_mode === "Onsite" || form.project_work_mode === "Hybrid";

  useEffect(() => {
    if (editProject) {
      setForm({
        job_title: editProject.job_title || "",
        client_name: editProject.client_name || "",
        vendor_name: editProject.vendor_name || "",
        sub_vendor_name: editProject.sub_vendor_name || "",
        project_role: editProject.project_role || "",
        project_start_date: editProject.project_start_date || "",
        project_bill_rate: editProject.project_bill_rate || "",
        reporting_manager: editProject.reporting_manager || "",
        immediate_vendor_email: editProject.immediate_vendor_email || "",
        immediate_vendor_phone_number: editProject.immediate_vendor_phone_number || "",
        project_work_mode: editProject.project_work_mode || "Remote",
        project_comments: editProject.project_comments || "",
        client_address_line1: editProject.client_address_line1 || "",
        client_address_line2: editProject.client_address_line2 || "",
        client_city: editProject.client_city || "",
        client_state: editProject.client_state || "",
        client_zipcode: editProject.client_zipcode || "",
      });
      setIsPrimary(!!editProject?.is_primary);
    } else {
      setForm((prev) => ({
        ...prev,
        vendor_name: "",
        client_address_line1: "",
        client_address_line2: "",
        client_city: "",
        client_state: "",
        client_zipcode: "",
      }));
    }
    setErrors({});
  }, [editProject]);

  function clearError(key) {
    setErrors((prev) => {
      if (!prev || !prev.hasOwnProperty(key)) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  function change(e) {
    const { name, value, checked } = e.target;

    if (name === "setAsPrimary") {
      setIsPrimary(checked);
      clearError("setAsPrimary");

      return;
    }

    if (name === "immediate_vendor_phone_number") {
      const newVal = formatUSPhone(value);
      setForm((prev) => ({ ...prev, [name]: newVal }));
      clearError(name);
      return;
    }

    if (name === "project_work_mode") {
      if (value === "Remote") {
        setForm((prev) => ({
          ...prev,
          project_work_mode: value,
          client_address_line1: "",
          client_address_line2: "",
          client_city: "",
          client_state: "",
          client_zipcode: "",
        }));
      } else {
        setForm((prev) => ({ ...prev, project_work_mode: value }));
      }

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.project_work_mode;
        delete copy.client_address_line1;
        delete copy.client_city;
        delete copy.client_state;
        delete copy.client_zipcode;
        return copy;
      });

      return;
    }

    if (name === "client_zipcode") {
      const cleaned = value.replace(/[^0-9\-]/g, "");
      setForm((prev) => ({ ...prev, [name]: cleaned }));
      clearError(name);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  }

  function handleDateChange(date) {
    if (date) {
      const formatted = formatDateToET(date);
      setForm((prev) => ({ ...prev, project_start_date: formatted }));
      clearError("project_start_date");
    } else {
      setForm((prev) => ({ ...prev, project_start_date: "" }));
    }
  }

  function validate() {
    const e = {};
    if (!form.job_title || !form.job_title.trim()) e.job_title = "Project Role is required";
    if (!form.client_name || !form.client_name.trim()) e.client_name = "Client is required";
    if (!form.project_start_date || !form.project_start_date.trim()) e.project_start_date = "Start date is required";

    if (form.project_bill_rate !== "" && form.project_bill_rate !== null) {
      const num = Number(form.project_bill_rate);
      if (Number.isNaN(num)) e.project_bill_rate = "Bill rate must be a number";
      else if (num < 0) e.project_bill_rate = "Bill rate cannot be negative";
    }

    if (form.immediate_vendor_email && form.immediate_vendor_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.immediate_vendor_email)) e.immediate_vendor_email = "Invalid email address";
    }

    if (form.immediate_vendor_phone_number && form.immediate_vendor_phone_number.trim()) {
      const phone = form.immediate_vendor_phone_number.replace(/[^0-9]/g, "");
      if (phone.length < 7 || phone.length > 15) e.immediate_vendor_phone_number = "Invalid phone number";
    }

    if (showAddressFields) {
      if (!form.client_address_line1 || !form.client_address_line1.trim())
        e.client_address_line1 = "Client Address Line 1 is required";
      if (!form.client_city || !form.client_city.trim()) e.client_city = "City is required";
      if (!form.client_state || !form.client_state.trim()) e.client_state = "State is required";
      if (!form.client_zipcode || !form.client_zipcode.trim()) e.client_zipcode = "ZIP Code is required";
      else {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(form.client_zipcode)) e.client_zipcode = "ZIP Code must be 12345 or 12345-6789";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function save() {
    if (!validate()) return;

    setLoader(true);

    const payload = {
      job_title: form.job_title || undefined,
      client_name: form.client_name || undefined,
      vendor_name: form.vendor_name || undefined,
      sub_vendor_name: form.sub_vendor_name || undefined,
      project_role: form.project_role || undefined,
      project_start_date: form.project_start_date || undefined,
      employment_start_date: form.project_start_date || undefined,
      project_bill_rate:
        form.project_bill_rate === "" || form.project_bill_rate === null ? null : Number(form.project_bill_rate),
      project_work_mode: form.project_work_mode || undefined,
      reporting_manager: form.reporting_manager || undefined,
      immediate_vendor_email: form.immediate_vendor_email || undefined,
      immediate_vendor_phone_number: form.immediate_vendor_phone_number || undefined,
      project_comments: form.project_comments || undefined,
      client_address_line1: showAddressFields ? form.client_address_line1 || undefined : undefined,
      client_address_line2: showAddressFields && form.client_address_line2 ? form.client_address_line2 : undefined,
      client_city: showAddressFields ? form.client_city || undefined : undefined,
      client_state: showAddressFields ? form.client_state || undefined : undefined,
      client_zipcode: showAddressFields ? form.client_zipcode || undefined : undefined,
    };

    if (!editProject) {
      axiosApi
        .post(API_URL, {
          emailid: USER_EMAIL,
          operation: "add_project",
          candidate_id: candidateId,
          set_as_primary: !!isPrimary,
          project_data: payload,
        })
        .then((res) => {
          toast.success(res?.data?.message || "Project created");
          onClose();
        })
        .catch(() => toast.error("Failed to create project"))
        .finally(() => setLoader(false));
    } else {
      axiosApi
        .post(API_URL, {
          emailid: USER_EMAIL,
          set_as_primary: !!isPrimary,
          operation: "update_project_history",
          project_id: editProject.id,
          updates: payload,
        })
        .then((res) => {
          toast.success(res?.data?.message || "Project updated");

          if (isPrimary && !editProject?.is_primary) {
            return axiosApi
              .post(API_URL, {
                emailid: USER_EMAIL,
                operation: "set_primary_project",
                candidate_id: candidateId,
                project_id: editProject.id,
                is_primary: true,
              })
              .then(() => {
                console.log("set primary api res");
              })
              .catch((err) => {
                console.error("Failed to set primary:", err);

                setIsPrimary(false);
              });
          }

          return;
        })
        .then(() => {
          onClose();
        })
        .catch(() => {
          toast.error("Failed to update project");
        })
        .finally(() => setLoader(false));
    }
  }

  if (!open) return null;

  return (
    <OverlayModal isActive={open} onClose={onClose} style={{ maxWidth: "800px" }} modalStyle={{ background: "#fff" }}>
      <ThemeLoader show={loader} fixed />

      <div>
        <div className="mb-3">
          <div className="h4 fw-bold mb-0">{editProject ? "Edit Project" : "Add New Project"}</div>

          <div>
            {editProject ? "Update the project details." : "Enter the project details to assign to this candidate."}
          </div>
        </div>

        <div className="colsResponsiveLayout2">
          <div className={styles.field}>
            <label className="fw-bold">Project Role *</label>
            <input
              className={`form-control bigHoverInput`}
              name="job_title"
              value={form.job_title}
              onChange={change}
              placeholder="e.g., Software Developer"
              aria-invalid={!!errors.job_title}
            />
            {errors.job_title && <div className="invalid-feedback d-block">{errors.job_title}</div>}
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Client *</label>
            <input
              className={`form-control bigHoverInput`}
              name="client_name"
              value={form.client_name}
              onChange={change}
              placeholder="e.g., Acme Corp"
              aria-invalid={!!errors.client_name}
            />
            {errors.client_name && <div className="invalid-feedback d-block">{errors.client_name}</div>}
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Vendor</label>
            <input
              className={`form-control bigHoverInput`}
              name="vendor_name"
              value={form.vendor_name}
              onChange={change}
              placeholder="e.g., Elevate Staffing"
            />
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Sub-Vendor</label>
            <input
              className={`form-control bigHoverInput`}
              name="sub_vendor_name"
              value={form.sub_vendor_name}
              onChange={change}
              placeholder="Optional"
            />
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Start Date *</label>

            <DatePicker
              maxDate={"2099"}
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={50}
              selected={pickDateOnly(form.project_start_date)}
              onChange={(date) => handleDateChange(date)}
              dateFormat="MM/dd/yyyy"
              className={`form-control bigHoverInput`}
              placeholderText="MM/DD/YYYY"
              aria-invalid={!!errors.project_start_date}
            />
            {errors.project_start_date && <div className="invalid-feedback d-block">{errors.project_start_date}</div>}
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Bill Rate ($/hr)</label>
            <input
              className={`form-control bigHoverInput`}
              type="number"
              name="project_bill_rate"
              min="0"
              step="0.01"
              value={form.project_bill_rate}
              onChange={change}
              placeholder="e.g., 65"
              aria-invalid={!!errors.project_bill_rate}
            />
            {errors.project_bill_rate && <div className="invalid-feedback d-block">{errors.project_bill_rate}</div>}
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Work Mode</label>
            <select
              name="project_work_mode"
              value={form.project_work_mode}
              onChange={change}
              className={`form-select bigHoverInput`}
            >
              <option value="Remote">🏠 Remote</option>
              <option value="Onsite">🏢 Onsite</option>
              <option value="Hybrid">🔄 Hybrid</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Job Title</label>
            <input
              className={`form-control bigHoverInput`}
              name="project_role"
              value={form.project_role}
              onChange={change}
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          {showAddressFields && (
            <div
              className={`border rounded p-3 mb-1 ${styles.clientLocationBox || ""}`}
              style={{ gridColumn: "span 2" }}
            >
              <div className="d-flex align-items-center gap-2 mb-3 small fw-semibold text-body">
                <MapPin size={16} />
                <span>Client Office Location</span>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold" htmlFor="clientAddressLine1">
                  Address Line 1 *
                </label>
                <input
                  id="clientAddressLine1"
                  name="client_address_line1"
                  value={form.client_address_line1}
                  onChange={change}
                  placeholder="Street address, building name"
                  maxLength={255}
                  className={`form-control bigHoverInput`}
                />
                {errors.client_address_line1 && (
                  <div className="invalid-feedback d-block">{errors.client_address_line1}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold" htmlFor="clientAddressLine2">
                  Address Line 2
                </label>
                <input
                  id="clientAddressLine2"
                  name="client_address_line2"
                  value={form.client_address_line2}
                  onChange={change}
                  placeholder="Suite, Floor, Building (optional)"
                  maxLength={255}
                  className={`form-control bigHoverInput`}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold" htmlFor="clientCity">
                    City *
                  </label>
                  <input
                    id="clientCity"
                    name="client_city"
                    value={form.client_city}
                    onChange={change}
                    placeholder="City"
                    maxLength={100}
                    className={`form-control bigHoverInput`}
                  />
                  {errors.client_city && <div className="invalid-feedback d-block">{errors.client_city}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold" htmlFor="clientState">
                    State *
                  </label>
                  <select
                    id="clientState"
                    name="client_state"
                    value={form.client_state}
                    onChange={change}
                    className={`form-select bigHoverInput`}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.client_state && <div className="invalid-feedback d-block">{errors.client_state}</div>}
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold" htmlFor="clientZipcode">
                  ZIP Code *
                </label>
                <input
                  id="clientZipcode"
                  name="client_zipcode"
                  value={form.client_zipcode}
                  onChange={change}
                  placeholder="12345 or 12345-6789"
                  maxLength={20}
                  className={`form-control bigHoverInput`}
                />
                <div className="form-text text-muted">Format: 12345 or 12345-6789</div>
                {errors.client_zipcode && <div className="invalid-feedback d-block">{errors.client_zipcode}</div>}
              </div>
            </div>
          )}

          <div className={styles.field} style={{ gridColumn: "span 2" }}>
            <label className="fw-bold">Reporting Manager</label>
            <input
              className={`form-control bigHoverInput`}
              name="reporting_manager"
              value={form.reporting_manager}
              onChange={change}
              placeholder="e.g., John Smith"
            />
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Vendor Email</label>
            <input
              className={`form-control bigHoverInput`}
              name="immediate_vendor_email"
              type="email"
              value={form.immediate_vendor_email}
              onChange={change}
              placeholder="e.g., contact@vendor.com"
              aria-invalid={!!errors.immediate_vendor_email}
            />
            {errors.immediate_vendor_email && (
              <div className="invalid-feedback d-block">{errors.immediate_vendor_email}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className="fw-bold">Vendor Phone</label>
            <input
              className={`form-control bigHoverInput`}
              name="immediate_vendor_phone_number"
              type="tel"
              value={form.immediate_vendor_phone_number}
              onChange={change}
              placeholder="e.g., (555) 123-4567"
              aria-invalid={!!errors.immediate_vendor_phone_number}
            />
            {errors.immediate_vendor_phone_number && (
              <div className="invalid-feedback d-block">{errors.immediate_vendor_phone_number}</div>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label className="fw-bold mt-2">Notes</label>
          <textarea
            rows="3"
            name="project_comments"
            value={form.project_comments}
            onChange={change}
            placeholder="Add any additional notes about this project..."
            className={`form-control bigHoverInput`}
          />
        </div>

        {!isCompletedProject ? (
          <div className="d-flex gap-2 align-items-center mt-2 pt-1">
            <input
              className="round-checkbox"
              id="setAsPrimary"
              name="setAsPrimary"
              type="checkbox"
              checked={isPrimary}
              onChange={change}
            />
            <label htmlFor="setAsPrimary" className="fw-bold" style={{ margin: 0 }}>
              Set as primary project (update candidate status to Active Talent)
            </label>
          </div>
        ) : (
          <></>
        )}

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose} disabled={loader}>
            Cancel
          </button>
          <button
            type="button"
            className="themeButton themeButtonHover px-3 py-2 rounded"
            onClick={save}
            disabled={loader}
          >
            {loader ? "Saving..." : editProject ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
