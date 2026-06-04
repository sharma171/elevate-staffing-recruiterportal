import { useState, useEffect } from "react";
import styles from "./css/VendorManagement.module.css";
import { axiosApi, Confirm, ThemeLoader } from "../../components";
import { DollarSign, XCircle, CheckCircle, Plus, Edit, Trash, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import VendorTimesheetPage from "./VendorTimesheetPage";
import { formatUSPhone } from "../../helpers/StrHelpers";
import ReminderSettings from "./ReminderSettings";
import { SelectPicker } from "rsuite";

const API_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app/";

const TABS = {
  VENDOR_INFO: { key: "vendor-info", title: "Vendor Information" },
  TIMESHEET: { key: "timesheet", title: "Timesheet Management" },
  REMINDER: { key: "reminder", title: "Reminder Settings" },
};

const FormGroup = ({
  label,
  value,
  required,
  onChange,
  error,
  type = "text",
  isTextArea = false,
  isSelect = false,
  options = [],
  fullWidth = false,
  ...inputProps
}) => (
  <div className={`${styles.formGroup} ${fullWidth ? styles.formGroupFull : ""}`}>
    <label>
      {label} {required ? <span className="text-danger">*</span> : <></>}
    </label>
    {isTextArea ? (
      <textarea value={value} onChange={onChange} rows="2" {...inputProps} />
    ) : isSelect ? (
      <select value={value} onChange={onChange} {...inputProps}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} {...inputProps} />
    )}
    {error && <p className={styles.errorText}>{error}</p>}
  </div>
);

const ToggleSwitch = ({ label, active, onChange }) => (
  <div className={styles.switchContainer}>
    <label>{label}</label>
    <div className={`${styles.toggleSwitch} ${active ? styles.active : ""}`} onClick={onChange}>
      <div className={styles.toggleHandle}></div>
    </div>
  </div>
);

const VendorManagement = ({ candidateDetails, disabled }) => {
  const [activeTab, setActiveTab] = useState(TABS.VENDOR_INFO.key);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editData, setEditData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [hourlyRate, setHourlyRate] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSelectingExisting, setIsSelectingExisting] = useState(false);
  const [deleteModal, setdeleteModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [loader, setLoader] = useState(false);

  const { user } = useAuth();

  let EMPLOYER_EMAIL = user?.email;
  let employeeEmail = candidateDetails?.original_email;

  useEffect(() => {
    getStaticks();
  }, [employeeEmail]);

  useEffect(() => {
    if (editingVendor?.zip_code?.length == 5) {
      setLoader(true);
      fetch("https://retrieve-location-details-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zip_code: editingVendor?.zip_code,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          setLoader(false);
          if (resData) {
            let city = resData?.data?.city;
            let state = resData?.data?.state;
            let country = resData?.data?.country;

            if (city) {
              formErrors.city = "";
              editingVendor.city = city;
            }
            if (state) {
              formErrors.state = "";
              editingVendor.state = state;
            }
            if (country) {
              formErrors.country = "";
              editingVendor.country = country;
            }
            setEditingVendor({ ...editingVendor });
          }
        })
        .catch((error) => {
          setLoader(false);
          console.error("Failed to fetch location details", error);
        });
    }
  }, [editingVendor?.zip_code]);

  const getStaticks = () => {
    const payload = {
      task: "get_dashboard_metrics",
      employee_email: employeeEmail,
      employer_email: EMPLOYER_EMAIL,
      date_range: "ytd",
    };
    setLoader(true);
    axiosApi
      .post("https://manage-vendor-payments-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        setDashboardData(response?.data?.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const getAllVendors = () => {
    setLoader(true);
    axiosApi
      .post(API_URL, { action: "get_all_vendors", employer_email: EMPLOYER_EMAIL, include_inactive: false })
      .then((res) => setAllVendors(Object.values(res.data.vendors)))
      .catch((err) => console.error(err))
      .finally(() => setLoader(false));
  };

  const getEmployeeVendors = () => {
    setLoader(true);
    axiosApi
      .post(API_URL, { action: "get_vendor_details", employer_email: EMPLOYER_EMAIL, employee_email: employeeEmail })
      .then((res) => {
        setVendors(Object.values(res.data.vendors));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoader(false));
  };

  const assignVendor = (data) => {
    const vendorDetails = {
      tax_id: data.tax_id,
      is_active: data.is_active,
      website: data.website,
      company_name: data.company_name,
      contact_person: data.contact_person,
      primary_email: data.primary_email,
      phone: data.phone,
      billing_address: data.billing_address,
      city: data.city,
      country: data.country,
      state: data.state,
      zip_code: data.zip_code,
      payment_terms: data.payment_terms,
    };

    const assignmentDetails = {
      hourly_rate: hourlyRate || 0,
      is_primary: data.is_primary || false,
    };

    const payload = {
      action: "assign_vendor_to_employee",
      employer_email: EMPLOYER_EMAIL,
      employee_email: employeeEmail,
      vendor_details: vendorDetails,
      assignment_details: assignmentDetails,
    };

    setLoader(true);
    axiosApi
      .post(API_URL, payload)
      .then((res) => {
        toast.success(res.data.message);
        getEmployeeVendors();
        resetForm();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to create");
      })
      .finally(() => setLoader(false));
  };

  const createVendor = (data) => {
    let payload = {
      action: "assign_vendor_to_employee",
      employer_email: EMPLOYER_EMAIL,
      employee_email: employeeEmail,
      ...data,
    };

    setLoader(true);
    axiosApi
      .post(API_URL, payload)
      .then((res) => {
        toast.success(res.data.message);
        getEmployeeVendors();
        resetForm();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to create");
      })
      .finally(() => setLoader(false));
  };

  const updateVendor = (data) => {
    setLoader(true);

    const getChangedFields = (newData, oldData) => {
      const changed = {};
      Object.entries(newData).forEach(([key, value]) => {
        const oldValue = oldData?.[key];
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          const nestedChanges = getChangedFields(value, oldValue);
          if (Object.keys(nestedChanges).length > 0) {
            changed[key] = nestedChanges;
          }
        } else if (value !== oldValue) {
          changed[key] = value;
        }
      });
      return changed;
    };

    const vendorId = data?.vendor_id;
    const assignmentId = data?.assignment_details?.assignment_id;
    const vendorDetails = { ...data };
    delete vendorDetails.assignment_details;

    const vendorPayload = {
      action: "update_vendor",
      employer_email: EMPLOYER_EMAIL,
      vendor_id: vendorId,
      vendor_details: getChangedFields(vendorDetails, editData),
    };

    const assignmentPayload = {
      action: "update_vendor_assignment",
      employer_email: EMPLOYER_EMAIL,
      assignment_id: assignmentId,
      assignment_details: getChangedFields(data?.assignment_details || {}, editData?.assignment_details || {}),
    };

    const updateRequests = [];

    if (Object.keys(vendorPayload.vendor_details).length > 0) {
      updateRequests.push(axiosApi.post(API_URL, vendorPayload));
    }

    if (Object.keys(assignmentPayload.assignment_details).length > 0) {
      updateRequests.push(axiosApi.post(API_URL, assignmentPayload));
    }

    Promise.all(updateRequests)
      .then((res) => {
        toast.success("Vendor details updated successfully");
        getEmployeeVendors();
      })
      .catch((err) => {
        toast.error("Failed to update vendor details.");
        console.log(err);
      })
      .finally(() => {
        resetForm();
        setLoader(false);
      });
  };

  const removeVendorAssignment = (data) => {
    let vendor_id = data.vendor_id;
    let payload = {
      action: "delete_vendor",
      employer_email: EMPLOYER_EMAIL,
      vendor_id: vendor_id,
      delete_type: "soft_delete_vendor",
    };

    setLoader(true);
    axiosApi
      .post(API_URL, payload)
      .then((res) => {
        toast.success(res.data.message);
        getEmployeeVendors();
        resetForm();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to delete");
        console.error(err);
      })
      .finally(() => setLoader(false));
  };

  const validateForm = () => {
    const errors = {};
    if (isSelectingExisting) {
      if (!selectedVendor) errors.vendor = "Vendor is required";
      if (!hourlyRate || isNaN(hourlyRate) || hourlyRate <= 0) errors.hourlyRate = "Valid hourly rate is required";
    } else if (editingVendor) {
      const v = editingVendor;
      if (!v.company_name) errors.company_name = "Company name is required";
      if (!v.contact_person) errors.contact_person = "Contact person is required";
      if (!v.primary_email || !/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v.primary_email))
        errors.primary_email = "Valid email is required";
      if (!v.phone || v.phone.replace(/\D/g, "").length < 7) errors.phone = "Valid phone is required";
      if (!v.billing_address) errors.billing_address = "Billing address is required";
      if (!v.city) errors.city = "City is required";
      if (!v.state) errors.state = "State is required";
      if (!v.zip_code || v.zip_code.length < 3) errors.zip_code = "Valid ZIP code is required";
      if (!v.assignment_details?.hourly_rate || v.assignment_details.hourly_rate <= 0)
        errors.hourly_rate = "Valid hourly rate is required";
    }
    setFormErrors(errors);
    return !Object.keys(errors).length;
  };

  const resetForm = () => {
    setEditingVendor(null);
    setEditData(null);
    setSelectedVendor(null);
    setHourlyRate("");
    setIsSelectingExisting(false);
    setFormErrors({});
    setdeleteModal(false);
  };

  useEffect(() => {
    resetForm();
    if (employeeEmail) {
      getAllVendors();
      getEmployeeVendors();
    }
  }, [employeeEmail]);

  const handleEditVendor = (v) => {
    setEditingVendor({ ...v, assignment_details: v.assignment_details || { hourly_rate: 0, is_primary: false } });
    setEditData({ ...v, assignment_details: v.assignment_details || { hourly_rate: 0, is_primary: false } });
    setIsSelectingExisting(false);
  };

  const handleSaveVendor = () => {
    if (!validateForm()) return;
    const v = editingVendor;
    if (v.vendor_id) {
      updateVendor({ ...v, vendor_id: v.vendor_id });
    } else {
      let payload = {
        vendor_details: {
          tax_id: v.tax_id,
          is_active: v.is_active,
          website: v.website,
          company_name: v.company_name,
          contact_person: v.contact_person,
          primary_email: v.primary_email,
          phone: v.phone,
          billing_address: v.billing_address,
          city: v.city,
          country: v.country,
          state: v.state,
          zip_code: v.zip_code,
          payment_terms: v.payment_terms || "Net 30",
        },
        assignment_details: v.assignment_details,
      };

      createVendor(payload);
    }
  };

  const handleAddVendor = () => {
    setEditingVendor({
      company_name: "",
      contact_person: "",
      primary_email: "",
      phone: "",
      billing_address: "",
      city: "",
      state: "",
      zip_code: "",
      payment_terms: "Net 30",
      is_active: true,
      assignment_details: { hourly_rate: 0, is_primary: false },
    });
    setIsSelectingExisting(false);
  };

  const handleSelectExistingVendor = () => {
    setIsSelectingExisting(true);
    setEditingVendor(null);
    setEditData(null);
  };

  const handleAssignExistingVendor = () => {
    if (validateForm()) assignVendor(selectedVendor);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const c = phone.replace(/\D/g, "");
    const m = c.match(/^(\d{3})(\d{3})(\d{4})$/);
    return m ? `(${m[1]})-${m[2]}-${m[3]}` : phone;
  };

  const renderStatsSection = () => (
    <div className={styles.statsContainer}>
      {[
        {
          icon: DollarSign,
          value: "$" + (dashboardData?.total_payables || 0),
          label: "Total Payables",
          color: "Green",
        },
        { icon: XCircle, value: "$" + (dashboardData?.overdue_amount || 0), label: "Overdue Amount", color: "Red" },
        { icon: CheckCircle, value: dashboardData?.pending_approvals || 0, label: "Pending Approvals", color: "Blue" },
        { icon: Clock, value: dashboardData?.total_hours || 0, label: "Total Hours YTD", color: "Purple" },
      ].map(({ icon: Icon, value, label, color }) => (
        <div key={label} className={styles.statCard}>
          <div className={styles[`statIcon${color}`]}>
            <Icon size={20} />
          </div>
          <div>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabsSection = () => (
    <div className={styles.tabsHeader}>
      {Object.values(TABS).map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={`${styles.tabButton} nowrap ${activeTab === tab.key ? styles.activeTab : ""}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );

  const renderVendorInfoTab = () => {
    const renderExistingVendorForm = () => (
      <div className={styles.existingVendorForm}>
        <div className={styles.formGroup}>
          <label>
            Select Vendor <span className="text-danger">*</span>
          </label>
          <SelectPicker
            className="selectpickerNormal"
            menuClassName="selectpickerNormalitems"
            placement="autoVertical"
            cleanable={false}
            value={selectedVendor?.vendor_id || null}
            onChange={(val) => {
              const v = allVendors.find((x) => x.vendor_id == val);
              setSelectedVendor(v);
            }}
            data={allVendors.map((v) => ({
              label: `${v.company_name} - ${v.primary_email}`,
              value: v.vendor_id,
            }))}
            placeholder="Choose an existing vendor"
          />
          {formErrors.vendor && <p className={styles.errorText}>{formErrors.vendor}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>
            Hourly Rate ($) <span className="text-danger">*</span>
          </label>
          <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="1" step="0.01" />
          {formErrors.hourlyRate && <p className={styles.errorText}>{formErrors.hourlyRate}</p>}
        </div>
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.assignButton}
            onClick={handleAssignExistingVendor}
            disabled={!selectedVendor || !hourlyRate || isNaN(hourlyRate) || hourlyRate <= 0}
          >
            Assign Vendor
          </button>
          <button type="button" className={styles.cancelButton} onClick={resetForm}>
            Cancel
          </button>
        </div>
      </div>
    );

    const renderNewVendorForm = () => {
      let hourlyValue = editingVendor?.assignment_details?.hourly_rate;
      hourlyValue = hourlyValue === null || hourlyValue === undefined || hourlyValue === "" ? "" : hourlyValue;

      return (
        <div className={styles.newVendorForm}>
          <div className={styles.formGrid}>
            <FormGroup
              label="Company Name"
              required
              value={editingVendor.company_name}
              onChange={(e) => {
                formErrors.company_name = "";
                setEditingVendor({ ...editingVendor, company_name: e.target.value });
              }}
              error={formErrors.company_name}
            />
            <FormGroup
              label="Contact Person"
              required
              value={editingVendor.contact_person}
              onChange={(e) => {
                formErrors.contact_person = "";
                setEditingVendor({ ...editingVendor, contact_person: e.target.value });
              }}
              error={formErrors.contact_person}
            />
            <FormGroup
              label="Email ID"
              required
              type="email"
              value={editingVendor.primary_email}
              onChange={(e) => {
                formErrors.primary_email = "";
                setEditingVendor({ ...editingVendor, primary_email: e.target.value });
              }}
              error={formErrors.primary_email}
            />
            <FormGroup
              label="Phone Number"
              required
              value={editingVendor.phone}
              onChange={(e) => {
                formErrors.phone = "";
                setEditingVendor({ ...editingVendor, phone: formatUSPhone(e.target.value) });
              }}
              placeholder="+1 (123) 456-7890"
              error={formErrors.phone}
            />
            <FormGroup
              label="Billing Address"
              isTextArea
              required
              fullWidth
              value={editingVendor.billing_address}
              onChange={(e) => {
                formErrors.billing_address = "";
                setEditingVendor({ ...editingVendor, billing_address: e.target.value });
              }}
              error={formErrors.billing_address}
            />

            <FormGroup
              label="ZIP Code"
              required
              value={editingVendor.zip_code}
              onChange={(e) => {
                formErrors.zip_code = "";
                setEditingVendor({ ...editingVendor, zip_code: e.target.value });
              }}
              error={formErrors.zip_code}
            />

            <FormGroup
              label="City"
              required
              value={editingVendor.city}
              onChange={(e) => {
                formErrors.city = "";
                setEditingVendor({ ...editingVendor, city: e.target.value });
              }}
              error={formErrors.city}
            />
            <FormGroup
              label="State"
              required
              value={editingVendor.state}
              onChange={(e) => {
                formErrors.state = "";
                setEditingVendor({ ...editingVendor, state: e.target.value });
              }}
              error={formErrors.state}
            />

            <FormGroup
              label="Payment Terms"
              isSelect
              options={["Net 15", "Net 30", "Net 45", "Net 60", "Net 75", "Net 90", "Due on Receipt"]}
              value={editingVendor.payment_terms}
              onChange={(e) => setEditingVendor({ ...editingVendor, payment_terms: e.target.value })}
            />
            <FormGroup
              label="Hourly Rate ($)"
              required
              type="number"
              value={hourlyValue}
              onChange={(e) => {
                formErrors.hourly_rate = "";
                setEditingVendor({
                  ...editingVendor,
                  assignment_details: {
                    ...editingVendor.assignment_details,
                    hourly_rate: parseFloat(e.target.value),
                  },
                });
              }}
              min="1"
              step="0.5"
              error={formErrors.hourly_rate}
            />
            <FormGroup
              label="Tax ID"
              value={editingVendor.tax_id}
              onChange={(e) =>
                setEditingVendor({
                  ...editingVendor,
                  tax_id: e.target.value,
                })
              }
              error={formErrors.tax_id}
            />
            <FormGroup
              label="Website"
              value={editingVendor.website}
              onChange={(e) =>
                setEditingVendor({
                  ...editingVendor,
                  website: e.target.value,
                })
              }
              error={formErrors.website}
            />
          </div>
          <div className={styles.switchGroup}>
            <ToggleSwitch
              label="Primary Vendor"
              active={editingVendor.assignment_details.is_primary}
              onChange={() =>
                setEditingVendor({
                  ...editingVendor,
                  assignment_details: {
                    ...editingVendor.assignment_details,
                    is_primary: !editingVendor.assignment_details.is_primary,
                  },
                })
              }
            />
            <ToggleSwitch
              label="Active Vendor"
              active={editingVendor.is_active}
              onChange={() => setEditingVendor({ ...editingVendor, is_active: !editingVendor.is_active })}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveVendor}
              disabled={!editingVendor.company_name || !editingVendor.contact_person}
            >
              Save Changes
            </button>
            <button type="button" className={styles.cancelButton} onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      );
    };

    const renderCreateEditFrom = () => {
      return (
        <div>
          {/* <div className={styles.vendorFormCard}> */}
          <div className={styles.formHeader}>
            <h3>
              {isSelectingExisting
                ? "Select Existing Vendor"
                : editingVendor?.vendor_id
                ? "Edit Vendor"
                : "Create New Vendor"}
            </h3>

            {!editingVendor?.vendor_id && (
              <div className={styles.formToggle}>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${!isSelectingExisting ? styles.activeToggle : ""}`}
                  onClick={() => handleAddVendor()}
                >
                  Create New Vendor
                </button>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${isSelectingExisting ? styles.activeToggle : ""}`}
                  onClick={handleSelectExistingVendor}
                >
                  Select Existing Vendor
                </button>
              </div>
            )}
          </div>

          {isSelectingExisting ? renderExistingVendorForm() : renderNewVendorForm()}
        </div>
      );
    };

    return (
      <div className={styles.vendorTab}>
        {editingVendor || isSelectingExisting ? (
          <></>
        ) : (
          <div className={styles.sectionHeader}>
            <div>
              <h2>Vendor Information</h2>
              <p>{vendors.length} vendor(s) assigned to this candidate</p>
            </div>
            {!editingVendor && !isSelectingExisting && !disabled && (
              <button type="button" className={styles.addButton} onClick={handleAddVendor}>
                <Plus size={16} /> Add New Vendor
              </button>
            )}
          </div>
        )}

        {editingVendor || isSelectingExisting
          ? renderCreateEditFrom()
          : vendors.length > 0 && (
              <div className={styles.vendorList}>
                {vendors.map((v) => (
                  <div key={v.vendor_id} className={styles.vendorCard}>
                    <div className={styles.vendorHeader}>
                      <div className={styles.vendorInfo}>
                        <h3>{v.company_name}</h3>
                        <div className={styles.statusTags}>
                          {v.assignment_details?.is_primary && <span className={styles.primaryTag}>Primary</span>}
                          <span
                            className={`${styles.statusTag} ${
                              v.is_active ? styles.activeStatus : styles.inactiveStatus
                            }`}
                          >
                            {v.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      {disabled ? (
                        <></>
                      ) : (
                        <div className={styles.vendorActions}>
                          <button
                            title="Edit"
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleEditVendor(v)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Delete"
                            type="button"
                            className={styles.removeButton}
                            onClick={() => setdeleteModal(v)}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.vendorDetails}>
                      {[
                        { label: "Contact Person", value: v.contact_person, truncate: true },
                        { label: "Vendor Code", value: v.vendor_code },
                        {
                          label: "Hourly Rate",
                          value: v.assignment_details?.hourly_rate ? `$${v.assignment_details.hourly_rate}/hour` : null,
                        },
                        { label: "Payment Terms", value: v.payment_terms },
                        { label: "Email", value: v.primary_email, truncate: true },
                        { label: "Phone", value: v.phone ? formatPhoneNumber(v.phone) : null },
                        { label: "Website", value: v.website, truncate: true },
                        { label: "Tax ID", value: v.tax_id },
                        {
                          truncate: true,
                          label: "Full Address",
                          value:
                            v.billing_address || v.city || v.state || v.zip_code || v.country
                              ? `${v.billing_address || ""}${v.city ? ", " + v.city : ""}${
                                  v.state ? ", " + v.state : ""
                                }${v.zip_code ? " " + v.zip_code : ""}${v.country ? ", " + v.country : ""}`
                              : null,
                          full: true,
                        },
                      ]
                        .filter((item) => item.value)
                        .map((item, idx) => (
                          <div key={idx} className={`${styles.detailGroup} ${item.full ? styles.detailGroupFull : ""}`}>
                            <label>{item.label}</label>
                            <p
                              className={item?.truncate ? "text-truncate" : ""}
                              title={item?.truncate ? item.value : ""}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    );
  };

  const renderTimesheetTab = () => <VendorTimesheetPage candidateDetails={candidateDetails} disabled={disabled} />;

  const renderReminderSettings = () => {
    return <ReminderSettings candidateDetails={candidateDetails} disabled={disabled} />;
  };

  const returnactiveTab = () => {
    let obj = {
      "vendor-info": renderVendorInfoTab,
      timesheet: renderTimesheetTab,
      reminder: renderReminderSettings,
    };

    if (obj[activeTab]) {
      return obj[activeTab]();
    }
    return <></>;
  };

  return (
    <div className={styles.container}>
      {renderStatsSection()}
      <div className={styles.tabsContainer}>
        {renderTabsSection()}
        <div className={styles.tabContent}>{returnactiveTab()}</div>
      </div>
      <ThemeLoader show={loader} />
      <Confirm
        show={deleteModal}
        result={(res) => {
          if (res) {
            removeVendorAssignment(deleteModal);
          }
          setdeleteModal(false);
        }}
        title="Delete Vendor"
        text={`Are you sure you want to delete vendor <b>${deleteModal.contact_person}?</b> This action is permanent and cannot be undone.`}
        deleteTitle="Yes, I'm Sure"
      />
    </div>
  );
};

export default VendorManagement;
