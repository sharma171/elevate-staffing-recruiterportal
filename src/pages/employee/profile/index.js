import { useEffect, useId, useState } from "react";
import { ThemeLoader } from "../../../components";
import styles from "./Profile.module.css";
import { useAuth } from "../../../authContext";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import { dateToUTCDate, pickDateOnly } from "../../../helpers/StrHelpers";
import { Trash2 } from "lucide-react";
import { getDeviceData } from "../../../DeviceStore";
import sendEncryptedRequest from "../../../components/EncryptedRequest";

const fieldvalidations = {
  primary_email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    message: "Enter a valid email address",
  },
};

let secireUrl = "https://fetch-update-employee-details-wp-v3-305451280005.us-east1.run.app";

function BankAccounts({ callback, disabled, data = [] }) {
  // data = [];
  // disabled = false;
  const [accounts, setAccounts] = useState([
    {
      bank_name: "",
      account_type: "Checking",
      routing_number: "",
      account_number: "",
      is_active: true,
      percentage: 100,
    },
  ]);

  const totalAllocated = accounts.reduce((sum, acc) => sum + acc.percentage, 0);
  const remaining = Math.max(0, 100 - totalAllocated);

  const hasIncomplete = accounts.some(
    (acc) => !acc.bank_name.trim() || !acc.routing_number.trim() || !acc.account_number.trim()
  );

  useEffect(() => {
    if (data?.length) {
      setAccounts(structuredClone(data));
    }
  }, [JSON.stringify(data)]);

  useEffect(() => {
    callback(structuredClone(accounts));
  }, [JSON.stringify(accounts)]);

  const addAccount = () => {
    if (remaining == 0 || hasIncomplete) return;
    setAccounts((prev) => [
      ...prev,
      {
        bank_name: "",
        account_type: "Checking",
        routing_number: "",
        account_number: "",
        is_active: true,
        percentage: remaining,
      },
    ]);
  };

  const removeAccount = (idx) => {
    setAccounts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx, field, value) => {
    setAccounts((prev) => {
      const totalExcludingThis = prev.reduce((sum, acc, i) => (i === idx ? sum : sum + acc.percentage), 0);

      return prev.map((acc, i) => {
        if (i !== idx) return acc;
        const updated = { ...acc, [field]: value };
        if (field === "percentage") {
          const maxForThis = Math.max(0, 100 - totalExcludingThis);
          let val = Math.min(Math.max(0, Number(value) || 0), maxForThis);

          if (val == 0) {
            val = "";
          }

          updated.percentage = val;
        }

        return updated;
      });
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div className="h5 mt-4 themeColor">Banking Information</div>
        <div>
          Total: 100%
          {remaining ? " (remaining " + remaining + "%)" : ""}
        </div>
      </div>
      <div className="sepline"></div>
      <div className={styles.bank_container}>
        {accounts.map((acc, i) => {
          const allocatedExcept = totalAllocated - acc.percentage;
          const maxForThis = Math.max(0, 100 - allocatedExcept);
          return (
            <div className={styles.bank_card}>
              <div className="themeColor d-flex justify-content-between align-items-center mb-3">
                <div className="themeColor fw-bold">Bank Account #{i + 1}</div>
                {accounts.length > 1 && !disabled && (
                  <button className={styles.bank_removeBtn} onClick={() => removeAccount(i)}>
                    <Trash2 />
                    Delete
                  </button>
                )}
              </div>
              <div>
                <div className={styles.gridContainer}>
                  <div className="mb-3">
                    <label className="form-label">Bank Name</label>
                    <input
                      disabled={disabled}
                      className="form-control"
                      placeholder="Bank name"
                      value={acc.bank_name}
                      onChange={(e) => updateField(i, "bank_name", e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      disabled={disabled}
                      style={
                        disabled ? { "--bs-form-select-bg-img": "null", boxShadow: "unset" } : { boxShadow: "unset" }
                      }
                      className="form-select"
                      value={acc.account_type}
                      onChange={(e) => updateField(i, "account_type", e.target.value)}
                    >
                      <option>Checking</option>
                      <option>Savings</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Deposit Percentage (%)</label>
                    <input
                      disabled={disabled}
                      className="form-control"
                      placeholder="Deposit Percentage (%)"
                      type="number"
                      min="0"
                      max={remaining}
                      value={acc.percentage}
                      onChange={(e) => updateField(i, "percentage", e.target.value)}
                    />
                    <span className={styles.bank_percentLabel}>Percentage of salary to deposit in this account</span>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Routing Number</label>
                    <input
                      disabled={disabled}
                      className="form-control"
                      placeholder="9-digit routing number"
                      value={acc.routing_number}
                      onChange={(e) => updateField(i, "routing_number", e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Number</label>
                    <input
                      disabled={disabled}
                      className="form-control"
                      placeholder="Account number"
                      value={acc.account_number}
                      onChange={(e) => updateField(i, "account_number", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {disabled ? (
          <></>
        ) : (
          <>
            <button
              className={`${styles.bank_addBtn} ${hasIncomplete ? styles.bank_addBtnHidden : ""}`}
              onClick={addAccount}
              disabled={remaining === 0 || hasIncomplete}
            >
              + Add Another Bank Account
            </button>

            {remaining == 0 ? (
              <div className={`${styles.bank_remainingMsg} text-success`}>
                ✓ Perfect! Your deposit allocation totals 100%
              </div>
            ) : (
              <div className={`${styles.bank_remainingMsg}`} style={{ color: "#ea580c" }}>
                You need to allocate {remaining}% more to reach 100%{" "}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function MyProfile() {
  const [activeTab, setActiveTab] = useState(1);
  const [userDetails, setuserDetails] = useState({});
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [accountDetails, setaccountDetails] = useState([]);

  const [isKeysLoaded, setisKeysLoaded] = useState(false);

  const hasIncomplete = accountDetails.some(
    (acc) => !acc.bank_name.trim() || !acc.routing_number.trim() || !acc.account_number.trim()
  );

  const totalAllocated = accountDetails.reduce((sum, acc) => sum + acc.percentage, 0);
  const remaining = Math.max(0, 100 - totalAllocated);

  let isDisabled = !!hasIncomplete || !!remaining;

  if (!accountDetails?.length) {
    isDisabled = false;
  }

  let { keys, fingerprints } = getDeviceData();

  const { user } = useAuth();
  let emp_id = user?.employee_id;

  const uniqueId = useId();

  useEffect(() => {
    let interval;

    if (!keys.sessionToken) {
      interval = setInterval(() => {
        if (keys.sessionToken) {
          setisKeysLoaded(true);
          clearInterval(interval);
        } else {
          setisKeysLoaded(!!isKeysLoaded + 1);
        }
      }, 800);
    } else {
      setisKeysLoaded(true);
    }

    return () => clearInterval(interval);
  }, [isKeysLoaded, keys.sessionToken, fingerprints]);

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (isKeysLoaded) {
        getcandidate_Details();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [user?.email, isKeysLoaded]);

  useEffect(() => {
    if (formData?.candidate_zipcode?.length == 5) {
      setLoading(true);
      fetch("https://retrieve-location-details-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zip_code: formData.candidate_zipcode,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data) {
            let city = data?.data?.city;
            let state = data?.data?.state;
            let country = data?.data?.country;

            if (city) {
              handleChange("candidate_city", city);
            }
            if (state) {
              handleChange("candidate_state", state);
            }
            if (country) {
              handleChange("candidate_country", country);
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log("Failed to fetch location details", error);
        });
    }
  }, [formData?.candidate_zipcode]);

  const setBankDetails = (data) => {
    setaccountDetails(data);
  };

  const modifyedData = (data = {}) => {
    const booleanKeys = ["currently_in_project", "send_work_status_email", "open_to_work", "volunteer_work"];

    const newObject = structuredClone(data);

    booleanKeys.forEach((key) => {
      if (key in newObject) {
        newObject[key] = newObject[key] ? "Yes" : "No";
      }
    });

    return newObject;
  };

  const getcandidate_Details = async () => {
    if (!user?.email) return;
    let payload = {
      email: user?.email,
      action: "get_profile",
    };
    setLoading(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints, secireUrl);
    setLoading(false);
    const { data, status } = result;

    if (status) {
      setDisabled(true);
      setLoading(false);
      const dataNew = data?.profile || {};
      let newData = modifyedData(dataNew);
      setuserDetails(newData);
    }
  };

  const validateForm = (formData) => {
    const newErrors = {};

    Object.keys(fieldvalidations).forEach((key) => {
      const rules = fieldvalidations[key];
      const value = formData[key] ?? "";

      if (key in formData) {
        if (rules.required && !value.trim()) {
          newErrors[key] = rules.message;
        } else if (rules.pattern && !rules.pattern.test(value)) {
          newErrors[key] = rules.message;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function convertToDirectDepositAccounts(arr) {
    const accounts = arr.map((account) => ({ ...account }));

    const hasPrimary = accounts.some((ac) => ac.is_primary);
    if (!hasPrimary && accounts.length > 0) {
      accounts[0].is_primary = true;
    }

    const direct_deposit_accounts = accounts.reduce((accObj, account, index) => {
      const key = `account${index + 1}`;
      accObj[key] = { ...account };
      return accObj;
    }, {});

    return direct_deposit_accounts;
  }

  const handleSubmit = async (isIncomplete) => {
    if (isIncomplete) {
      return;
    }

    const changedFields = {};

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== userDetails[key]) {
        changedFields[key] = formData[key];
      }
    });

    if (!validateForm(changedFields)) {
      return;
    }

    let payload = {
      email: user?.email,
      action: "update_profile",
      profile_data: {
        id: userDetails.id,
        ...changedFields,
      },
    };

    let accounts = convertToDirectDepositAccounts(accountDetails);

    if (Object.keys(accounts)?.length) {
      payload.profile_data.direct_deposit_accounts = accounts;
    }

    setLoading(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints, secireUrl);
    setLoading(false);
    const { data, status } = result;

    if (status) {
      toast.success(data.message);
      setFormData({});
      setuserDetails({});
      getcandidate_Details();
    } else {
      toast.error(data.error || data.message);
    }
  };

  const tabsArray = [
    {
      id: 1,
      title: "Personal Information",
      description: "Manage your personal information and contact details",
      googleicon: "person",
      cssIcon: null,
      renderData: () => renderpersonalInfo(),
    },
    {
      id: 2,
      title: "Work Information",
      description: "Manage your current work status and project information",
      googleicon: null,
      cssIcon: "case-bold",
      renderData: () => renderWorkInfo(),
    },
    {
      id: 3,
      title: "Legal Information",
      description: "Manage your work authorization and legal documents",
      googleicon: null,
      cssIcon: "legal",
      renderData: () => renderLegalInfo(),
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);

  const bodyHeader = () => (
    <div className="mb-3">
      <div className={`d-flex align-items-center gap-2 pointer h4 ${styles.bodyHeaer}`}>
        {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
        {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>}
        <div>{currentTab.title}</div>
      </div>
      <div className="font12 fontgray">{currentTab.description}</div>
    </div>
  );

  const handleChange = (key, value) => {
    errors[key] = "";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = (key, hideValue) => {
    if (hideValue) {
      return formData[key] || "";
    }
    return key in formData ? formData[key] : userDetails?.[key] ?? "";
  };

  let currentlyinProject = getValue("currently_in_project");
  currentlyinProject = String(currentlyinProject).toLowerCase() == "yes" || currentlyinProject == true;

  let visastatus = getValue("visa_status");
  let statusesArr = ["OPT", "STEM OPT", "CPT"];
  let OPTLetterStatus = statusesArr.includes(visastatus);

  const renderInput = (label = "", key = "", placeholder = "", hide, disabledWithwarn) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3">
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label}
        </label>
        <input
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          disabled={disabled || disabledWithwarn}
          style={{ boxShadow: "unset" }}
          value={getValue(key)}
          onChange={(e) => handleChange(key, e.target.value)}
          className="form-control"
          id={"uid" + uniqueId + key}
          placeholder={placeholder}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderDateInput = (label = "", key = "", hide, disabledWithwarn) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3 w-100">
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label}
        </label>
        <div className="w-100">
          <DatePicker
            maxDate={"2099"}
            title={
              disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
            }
            disabled={disabled || disabledWithwarn}
            showYearDropdown
            showMonthDropdown
            showIcon
            calendarIconClassName="calenderIconRight"
            toggleCalendarOnIconClick
            scrollableYearDropdown
            yearDropdownItemNumber={80}
            selected={pickDateOnly(getValue(key)) || null}
            onChange={(date) => {
              const newDate = dateToUTCDate(date);
              handleChange(key, newDate);
            }}
            dateFormat="MM/dd/yyyy"
            className="form-control ps-2 w-100"
            style={{ boxShadow: "unset" }}
            placeholderText={"MM/DD/YYYY"}
            id={"uid" + uniqueId + key}
          />
        </div>
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderTextArea = (label = "", key = "", placeholder = "", hideValue) => (
    <div className="mb-3 w-100">
      <label htmlFor={"uid" + uniqueId + key} className="form-label">
        {label}
      </label>
      <textarea
        disabled={disabled}
        rows={3}
        style={{ resize: "none", boxShadow: "unset", border: "1px solid #d5d5d5" }}
        value={getValue(key, hideValue)}
        onChange={(e) => handleChange(key, e.target.value)}
        className="form-control"
        id={"uid" + uniqueId + key}
        placeholder={placeholder}
      />
      {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
    </div>
  );

  const renderSelect = (label = "", key = "", placeholder = "", data = [], className, hide, disabledWithwarn) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className={className || "mb-3"}>
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label}
        </label>
        <select
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          disabled={disabled || disabledWithwarn}
          style={
            disabled || disabledWithwarn
              ? { "--bs-form-select-bg-img": "null", boxShadow: "unset" }
              : { boxShadow: "unset" }
          }
          value={getValue(key)}
          onChange={(e) => handleChange(key, e.target.value)}
          className="form-select"
          id={"uid" + uniqueId + key}
        >
          <option value="">{placeholder}</option>
          {data.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const visaStatus = [
    { value: "OPT", label: "OPT" },
    { value: "CPT", label: "CPT" },
    { value: "H1B", label: "H1B" },
    { value: "H4 EAD", label: "H4 EAD" },
    { value: "GC", label: "GC" },
    { value: "GC EAD", label: "GC EAD" },
    { value: "USC", label: "USC" },
    { value: "STEM OPT", label: "STEM OPT" },
  ];

  const renderpersonalInfo = () => (
    <div>
      {bodyHeader()}
      <div className="h5 mt-4 themeColor">Basic Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderSelect("Gender", "gender", "Select Gender", [
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
        ])}
        {renderInput("First Name", "first_name", "First Name")}
        {renderInput("Last Name", "last_name", "Last Name")}
      </div>

      <div className="h5 mt-4 themeColor">Contact Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderInput("Primary Email", "primary_email", "Primary Email", false, true)}
        {renderInput("Secondary Email", "secondary_email", "Secondary Email")}
        {renderInput("Primary Contact", "primary_contact", "Primary Contact")}
        {renderInput("Secondary Contact (Optional)", "secondary_contact", "Secondary Contact")}
      </div>

      <div className="h5 mt-4 themeColor">Additional Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderSelect("Visa Status", "visa_status", "Select Visa Status", visaStatus, undefined, false, true)}
        {renderInput(
          "University (for CPT/OPT/STEM OPT)",
          "university_name",
          "University (for CPT/OPT/STEM OPT)",
          !OPTLetterStatus,
          true
        )}
        {renderInput("Primary Technology", "primary_technology", "Primary Technology")}
        {renderInput("Address Line 1", "candidate_address1", "Address Line 1")}
        {renderInput("Address Line 2", "candidate_address2", "Address Line 2")}
        {renderInput("ZIP Code", "candidate_zipcode", "ZIP Code")}
        {renderInput("City", "candidate_city", "City")}
        {renderInput("State", "candidate_state", "State")}
        {renderInput("Country", "candidate_country", "Country")}
      </div>

      <div className="h5 mt-4 themeColor">Additional Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderInput("LinkedIn Profile URL", "linkedin_url", "LinkedIn Profile URL")}
        {renderInput("Portfolio/Github URL", "portfolio_url", "Portfolio/Github URL")}
      </div>

      <div className="h5 mt-4 themeColor">Emergency Contact</div>
      <div className="sepline"></div>
      <div className={`${styles.gridContainer}`}>
        {renderInput("Emergency Contact Name", "emergency_name", "Emergency Contact Name")}
        {renderInput("Emergency Contact Number", "emergency_number", "Emergency Contact Number")}
      </div>
      {renderInput("Emergency Contact Email", "emergency_email", "Emergency Contact Email")}

      {/* {renderTextArea("Additional Comments", "employee_comments", "Additional Comments")} */}
    </div>
  );

  const renderWorkInfo = () => (
    <div>
      {bodyHeader()}
      <div className="h5 mt-4 themeColor">Employment Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderInput("Job Title", "job_title", "Job Title", false, true)}
        {renderInput("Salary (Per Annum)", "employee_salary", "Salary (Per Annum)", false, true)}
        {renderDateInput("Employment Start Date", "employment_start_date", false, true)}
      </div>

      <div className="h5 mt-4 themeColor">Currently in a Project</div>
      <div className="sepline"></div>
      <div className="w-100 mb-3">
        {renderSelect(
          "Currently in a Project",
          "currently_in_project",
          "Currently in a Project",
          [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
          "mb-1",
          false,
          true
        )}
        <div className="font12 fontgray">Indicates whether you are currently on a project, on bench, or inactive</div>

        <div className={`${styles.gridContainer} mt-4`}>
          {renderInput("Volunteer Work", "volunteer_work", "Volunteer Work", currentlyinProject, true)}
          {renderInput("Assigned Recruiter", "assigned_recruiter", "Assigned Recruiter", currentlyinProject, true)}
          {renderInput(
            "Assigned Secondary Recruiter",
            "assigned_recruiter_secondary",
            "Assigned Secondary Recruiter",
            currentlyinProject,
            true
          )}
        </div>
      </div>
      {currentlyinProject ? (
        <>
          <div className="h5 themeColor">Project Information</div>
          <div className="sepline"></div>
        </>
      ) : (
        <></>
      )}
      <div className={styles.gridContainer}>
        {renderInput("Sub Vendor Name", "sub_vendor_name", "Sub Vendor Name", !currentlyinProject)}
        {renderInput("Vendor Name", "project_vendor_name", "Vendor Name", !currentlyinProject)}
        {renderInput("Client Name", "project_client_name", "Client Name", !currentlyinProject)}
        {renderInput("Project Role", "project_role", "Project Role", !currentlyinProject)}
        {renderDateInput("Project Start Date", "project_start_date", !currentlyinProject)}
        {renderDateInput("Project End Date", "project_end_date", !currentlyinProject)}
        {/* </div>
      <div className="h5 mt-4 themeColor">Vendor Contact Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}> */}
        {renderInput(
          "Immediate Vendor Phone Number",
          "immediate_vendor_phone_number",
          "Immediate Vendor Phone Number",
          !currentlyinProject
        )}
        {renderInput("Immediate Vendor Email", "immediate_vendor_email", "Immediate Vendor Email", !currentlyinProject)}
        {renderInput(
          "Reporting Manager (at Client Side)",
          "project_reporting_manager",
          "Reporting Manager (at Client Side)",
          !currentlyinProject
        )}
        {/* </div>
      <div className="h5 mt-4 themeColor">Work Location</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}> */}
        {renderSelect(
          "Project Work Mode",
          "project_work_mode",
          "Project Work Mode",
          [
            { label: "Remote", value: "Remote" },
            { label: "Hybrid", value: "Hybrid" },
          ],
          "mb-1",
          !currentlyinProject
        )}
        {renderInput("Project Location", "project_location", "Project Location", !currentlyinProject)}
        {renderInput("Client Address", "client_address", "Client Address", !currentlyinProject)}
        {renderSelect(
          "Exploring Better Opportunities",
          "open_to_work",
          "Exploring Better Opportunities",
          [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
          "mb-1",
          !currentlyinProject
        )}
      </div>
    </div>
  );

  const renderLegalInfo = () => (
    <div>
      {bodyHeader()}
      <div className="h5 mt-4 themeColor">Work Authorization</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderDateInput("Work Authorization Start Date", "work_auth_start_date", false, true)}
        {renderDateInput("Work Authorization End Date", "work_auth_end_date", false, true)}
        {renderInput(
          "Work Authorization Document Number",
          "work_auth_number",
          "Work Authorization Document Number",
          false,
          true
        )}
        {renderSelect(
          "Offer Letter Status",
          "opt_letter_status",
          "Offer Letter Status",
          [
            { value: "ISSUED", label: "ISSUED" },
            { value: "NOT ISSUED", label: "NOT ISSUED" },
            // { value: "Issued with I983", label: "Issued with I983" },
          ],
          undefined,
          !OPTLetterStatus,
          true
        )}
        {renderSelect(
          "Receive Work Status Email",
          "send_work_status_email",
          "Receive Work Status Email",
          [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ],
          undefined,
          false,
          true
        )}
      </div>
      <div className="h5 mt-4 themeColor">Visa & Entry Information</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderDateInput("US Entry Date", "us_entry_date")}
        {renderSelect("Visa at Entry", "us_entry_visa", "Visa at Entry", [
          { value: "OPT", label: "OPT" },
          { value: "F1", label: "F1" },
          { value: "CPT", label: "CPT" },
          { value: "H1B", label: "H1B" },
          { value: "H4 EAD", label: "H4 EAD" },
          { value: "GC", label: "GC" },
          { value: "GC EAD", label: "GC EAD" },
          { value: "USC", label: "USC" },
          { value: "STEM OPT", label: "STEM OPT" },
        ])}
        {renderSelect("Current Visa Status", "cvisa_status", "Current Visa Status", [
          { value: "OPT", label: "OPT" },
          { value: "F1", label: "F1" },
          { value: "CPT", label: "CPT" },
          { value: "H1B", label: "H1B" },
          { value: "H4 EAD", label: "H4 EAD" },
          { value: "GC", label: "GC" },
          { value: "GC EAD", label: "GC EAD" },
          { value: "USC", label: "USC" },
          { value: "STEM OPT", label: "STEM OPT" },
        ])}
        {renderInput("I-94 Number", "i94_number", "I-94 Number")}
      </div>
      <div className="h5 mt-4 themeColor">Employment Verification</div>
      <div className="sepline"></div>
      <div className={styles.gridContainer}>
        {renderSelect(
          "E-Verify Status",
          "everify_status",
          "E-Verify Status",
          [
            { value: "Completed", label: "Completed" },
            { value: "Pending", label: "Pending" },
          ],
          undefined,
          false,
          true
        )}

        {renderSelect(
          "ID Form Status",
          "id_form_status",
          "ID Form Status",
          [
            { value: "Collected", label: "Collected" },
            { value: "Not Collected", label: "Not Collected" },
          ],
          undefined,
          false,
          true
        )}

        {renderSelect(
          "I-9 Status",
          "i9_form_status",
          "I-9 Status",
          [
            { value: "Completed", label: "Completed" },
            { value: "Pending", label: "Pending" },
          ],
          undefined,
          false,
          true
        )}
      </div>

      {/* banking info section */}
      <BankAccounts
        callback={setBankDetails}
        data={getValue("direct_deposit_accounts")?.accounts || []}
        disabled={disabled}
      />

      <div className="h5 mt-4 themeColor">Personal Information</div>
      <div className="sepline"></div>

      <div className={styles.gridContainer}>
        {renderInput("Passport Number", "passport_num", "Passport Number")}
        {renderInput("Social Security Number", "ssn_number", "Social Security Number")}
      </div>
    </div>
  );

  const rendertabsData = () => (
    <div className="d-flex gap-3 w-100 py-2 justify-content-between align-items-center">
      <div className="d-flex gap-3 w-100 py-2">
        {tabsArray.map((card) => (
          <div
            key={card.id}
            className={`${styles.headerButtons} ${
              activeTab === card.id ? styles.activeTab : ""
            } d-flex justify-content-center gap-2 pointer`}
            onClick={() => setActiveTab(card.id)}
          >
            <div>
              {card.googleicon && <span className="material-symbols-outlined">{card.googleicon}</span>}
              {card.cssIcon && <span className={card.cssIcon}></span>}
            </div>
            <div>{card.title}</div>
          </div>
        ))}

        <div className="d-flex ms-auto justify-content-end w-100">
          <div
            className={`${styles.headerButtons} ${styles.activeTab} d-flex align-items-center gap-2 pointer`}
            onClick={() => setDisabled(!disabled)}
          >
            {disabled ? (
              <>
                <span class="material-symbols-outlined mb-1">edit_square</span>
                Update Profile
              </>
            ) : (
              <>
                <span class="material-symbols-outlined mb-1">close</span>
                Cancel
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2">My Profile</h2>
              <p className="mb-0">Manage your personal, work, and legal information</p>
            </div>
            {/* <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />
            </div> */}
          </div>
        </div>
        <div className="px-0 px-md-3 pt-3">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              {rendertabsData()}
            </div>
          </div>
        </div>
        <div className={`${styles.bodycontainer}`}>
          {currentTab.renderData()}
          {disabled ? (
            <></>
          ) : (
            <div className="d-flex justify-content-end mt-4 pt-3">
              {loading ? (
                <div className="themeButton" style={{ height: "56px" }}>
                  <div class="spinner-border text-light spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="themeButton"
                  disabled={isDisabled}
                  onClick={() => handleSubmit(isDisabled)}
                >
                  <span class="material-symbols-outlined mb-1">play_arrow</span>
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ThemeLoader show={loading} />
    </div>
  );
}

export default MyProfile;
