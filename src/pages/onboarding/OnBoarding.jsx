import React, { useEffect, useId, useState } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

import DefaultHeader from "../../components/Header/DefaultHeader";
import DefaultFooter from "../../components/Footer/DefaultFooter";
import styles from "./Style.module.css";
import { dateToUTCDate, pickDateOnly } from "../../helpers/StrHelpers";
import api from "../../networking/api";
import { IoDocumentTextSharp, IoDocument } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Themeloader from "../../components/ThemeLoader";
import Confirm from "../../components/Confirm";
import { Placeholder, Progress } from "rsuite";
import { useAuth } from "../../authContext";
import ThemeLoader from "../../components/ThemeLoader";
import UploadStatusModal from "../../components/UploadStatusModal";

const getQueryParam = (search, param) => new URLSearchParams(search).get(param) || "";

const RenderProgress = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const steps = 100;
    const intervalTime = duration / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setPercent(current);
      if (current >= 100) clearInterval(interval);
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "60vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 30,
        backgroundColor: "#fff",
      }}
    >
      <div className="spinner-border" role="status" style={{ width: "2.5rem", height: "2.5rem", color: "#073276" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h4 style={{ marginTop: 20, fontWeight: "600" }}>Validating Onboarding Token</h4>
      <p style={{ color: "#6c757d", marginBottom: 20 }}>Please wait while we verify your information...</p>
      <div style={{ width: "95%" }}>
        <Progress.Line
          style={{ width: "100%" }}
          percent={percent}
          strokeColor="#073276"
          trailColor="#f1f3f5"
          strokeWidth={6}
          showInfo={false}
        />

        <div style={{ marginTop: 30 }}>
          <Placeholder.Paragraph rows={5} rowHeight={20} active />
        </div>
      </div>
    </div>
  );
};

const RenderOnboarding = ({ setORGData }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [userDetails, setuserDetails] = useState({ profile: {}, documents_batches: [] });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [resumeInput, setResumeInput] = useState(null);
  const [validTabsLength, setValidTabsLength] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [finalConfirm, setfinalConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("Application Received0");
  const [isLoading, setIsLoading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [fileSizeErrorObj, setFileSizeErrorObj] = useState({});
  const [confirmText, setConfirmText] = useState(
    "Thanks for completing your application! Our team will review it and contact you shortly."
  );
  const [uploadFiles, setUploadFiles] = React.useState([]);

  const [hideBG, setHideBG] = useState(false);

  const navigate = useNavigate();

  let profileData = userDetails?.profile || {};
  let requiredDocuments = userDetails?.documents_batches || [];

  let isOthersVisa = formData?.us_entry_visa == "Others";

  const { search } = useLocation();
  const email = getQueryParam(search, "email");
  const token = getQueryParam(search, "token");

  const uniqueId = useId();

  useEffect(() => {
    setTimeout(() => {
      setShowProgress(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!email) {
        returnError();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    if (token) {
      const isSubmitted = localStorage.getItem(`onboarding_submitted_${token}`);
      if (isSubmitted) {
        returnError();
      } else {
        validateTOken();
      }
    } else {
      returnError();
    }
  }, [token]);

  const returnError = () => {
    setHideBG(true);
    setConfirmTitle("Link Expired");
    setConfirmText(
      "<b>This link has expired or the form has already been submitted. Please contact your administrator for further assistance.</b>"
    );
    setfinalConfirm(true);
  };

  const validateTOken = () => {
    let payload = {
      action: "validate-token",
      primary_email: email,
      token: token,
    };
    setLoading(true);
    setIsLoading(true);
    api
      .sendTalentPoolInvitation(payload)
      .then((res) => {
        setORGData(res);
        setLoading(false);
        fetchUser();
        console.log(res, "validate token");
      })
      .catch((err) => {
        setLoading(false);
        returnError();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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

  const fetchUser = () => {
    let payload = {
      email: email,
      action: "get_profile",
    };
    setLoading(true);
    api
      .PrefetchEmployee(payload)
      .then((res) => {
        setLoading(false);
        let data = res;
        setFormData(data?.profile || {});
        setuserDetails(data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const personalKeys = [
    "first_name",
    "last_name",
    "gender",
    "date_of_birth",
    "primary_email",
    // "secondary_email",
    "primary_contact",
    // "secondary_contact",
    "primary_technology",
    "candidate_address1",
    // "candidate_address2",
    "candidate_zipcode",
    "candidate_city",
    "candidate_state",
    "candidate_country",
    // "emergency_name",
    // "emergency_number",
  ];

  const workAuthKeys = [
    "visa_status",
    "work_auth_start_date",
    "work_auth_end_date",
    "us_entry_date",
    "us_entry_visa",
    "i94_number",
  ];

  const getFormKeysTab2 = () => {
    const keys = [...workAuthKeys];
    if (OPTLetterStatus) keys.push("university_name");
    if (isOthersVisa) keys.push("others_visa");
    return keys;
  };

  const docsKeys = requiredDocuments?.[0]?.documents.map((d) => d.name) || [];

  const validateFields = (dataObj, keys) => {
    const errs = {};
    keys.forEach((key) => {
      const val = dataObj[key];
      if (val === undefined || val === null || val === "") {
        errs[key] = "This field is required.";
      }
    });
    return errs;
  };

  const validateActiveTab = () => {
    let newErrors = {};

    switch (activeTab) {
      case 1:
        newErrors = validateFields(formData, personalKeys);
        break;

      case 2:
        newErrors = validateFields(formData, getFormKeysTab2());
        break;

      case 3:
        if (!resumeInput) {
          newErrors.Resume = fileSizeError || "Resume is required.";
        }
        break;

      case 4:
        docsKeys.forEach((docKey) => {
          const found = uploadedDocs.find((d) => d.doc_type === docKey);
          if (!found || !found.file_content) {
            newErrors[docKey] = fileSizeErrorObj[docKey] || "This document is required.";
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateActiveTab()) {
      toast.error(fileSizeError || "All required fields must be filled before proceeding.");
      return;
    }

    if (activeTab < 4) {
      setActiveTab((t) => t + 1);
      setFileSizeError(false);
      setFileSizeErrorObj({});
      if (validTabsLength <= activeTab) {
        setValidTabsLength(activeTab + 1);
      }
      return;
    }

    // build payload including uploadedDocs

    const payload = {
      email: email,
      action: "update_profile",
      profile_data: {
        id: profileData.id,
        ...formData,
      },
    };

    if (isOthersVisa) {
      payload.profile_data.us_entry_visa = formData?.others_visa;
    }

    delete payload.profile_data.others_visa;

    const submitDocs = async () => {
      const filesToUpload = [...uploadedDocs, resumeInput].map((file) => ({
        file,
        status: "pending",
        percent: 0,
      }));

      setLoading(true);

      const uploadSingleFile = async (fileObj, index) => {
        setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading", percent: 0 } : f)));

        try {
          const res = await api.prefetchDocs(
            {
              email_id: email,
              files: [fileObj.file],
            },
            {},
            {
              headers: { "Content-Type": "application/json" },
              onUploadProgress: (progressEvent) => {
                if (!progressEvent || !progressEvent.total) return;
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, percent: percentCompleted } : f)));
              },
            }
          );

          setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploaded", percent: 100 } : f)));

          return res;
        } catch (error) {
          setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "error", percent: 0 } : f)));

          const errMsg = error.error || error.message || "Upload failed";
          toast.error(errMsg);

          // throw error;
        }
      };

      setUploadFiles(filesToUpload);

      try {
        for (let i = 0; i < filesToUpload.length; i++) {
          if (filesToUpload[i].status !== "uploaded") {
            await uploadSingleFile(filesToUpload[i], i);
          }
        }

        setTimeout(() => {
          setLoading(false);
          setConfirmTitle("Application Received");
          setConfirmText(
            "<b>Thanks for completing your application! Our team will review it and contact you shortly.</b>"
          );
          setfinalConfirm(true);
        }, 3000);
        localStorage.setItem(`onboarding_submitted_${token}`, "true");
      } catch (e) {
        setLoading(false);
      }
    };

    setLoading(true);
    api
      .PrefetchEmployee(payload)
      .then((res) => {
        setLoading(false);
        submitDocs();
        console.log("Response:", res);
        // toast.success(res.message);
      })
      .catch((err) => {
        setLoading(false);
        console.log("Error:", err);
        toast.error(err.error || err.message);
      });
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
      title: "Work Authorization",
      description: "Manage your current work status and project information",
      googleicon: null,
      icon: IoDocument,
      renderData: () => renderWorkInfo(),
    },
    {
      id: 3,
      title: "Resume",
      description: "Manage your work authorization and legal documents",
      googleicon: null,
      cssIcon: "legal",
      renderData: () => renderResumeInfo(),
    },
    {
      id: 4,
      title: "Required Documents",
      description: "Manage your work authorization and legal documents",
      googleicon: null,
      icon: IoDocumentTextSharp,
      renderData: () => renderDocuments(),
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);

  const handleChange = (key, value) => {
    errors[key] = "";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = (key, hideValue) => {
    if (hideValue) {
      return formData[key] || "";
    }
    return key in formData ? formData[key] : profileData?.[key] ?? "";
  };

  let visastatus = getValue("visa_status");
  let statusesArr = ["OPT", "STEM OPT", "CPT"];
  let OPTLetterStatus = statusesArr.includes(visastatus);

  const renderInput = (label = "", key = "", placeholder = "", hide, disabledWithwarn, isNumbers, required) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3">
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label} {required ? <span className="text-danger fw-bold">*</span> : <></>}
        </label>
        <input
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          disabled={disabledWithwarn}
          style={{ boxShadow: "unset" }}
          value={getValue(key)}
          onChange={(e) => {
            const value = e.target.value;

            if (isNumbers) {
              const numberRegex = /^\d*\.?\d*$/;

              if (numberRegex.test(value)) {
                handleChange(key, value === "" ? "" : Number(value));
              }
            } else {
              handleChange(key, value);
            }
          }}
          onKeyDown={(e) => {
            if (isNumbers) {
              const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End", "."];

              if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault();
              }
            }
          }}
          inputMode={isNumbers ? "decimal" : undefined}
          className="form-control"
          id={"uid" + uniqueId + key}
          placeholder={placeholder}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderFileInput = (
    label = "",
    key = "",
    accept = ".png,.jpg,.pdf,.docx",
    multiple = false,
    hide = false,
    docDesc = "",
    docCategory = ""
  ) => {
    if (hide) return null;

    const onFileChange = async (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
      ];

      const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];

      const invalidFile = files.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);

      if (invalidFile) {
        let errorMessage = "";
        if (!allowedTypes.includes(invalidFile.type)) {
          errorMessage = "Only PNG, JPG, PDF, and DOCX files are allowed.";
        } else if (invalidFile.size > 5 * 1024 * 1024) {
          errorMessage = "File size must not exceed 5MB.";
          setFileSizeErrorObj((prev) => ({ ...prev, [key]: errorMessage }));
        }

        setErrors((prev) => ({ ...prev, [key]: errorMessage }));
        return;
      }

      const updatedDocs = await Promise.all(
        files.map(async (file) => {
          const base64 = await toBase64(file);

          let doc_expiry = uploadedDocs.find((d) => d.doc_type === key)?.doc_expiry || null;

          let obj = {
            file_name: file.name,
            document_type: "other",
            doc_type: key,
            file_content: base64,
            // doc_validfrom: uploadedDocs.find((d) => d.document_type === key)?.doc_validfrom || null,
          };

          if (doc_expiry) {
            obj.doc_expiry = doc_expiry;
          }

          return obj;
        })
      );

      setUploadedDocs((prev) => [...prev.filter((doc) => doc.doc_type !== key), ...updatedDocs]);

      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    };

    return (
      <div className="mb-3">
        <label htmlFor={`uid${uniqueId}${key}`} className="form-label">
          {label} <span className="text-danger fw-bold">*</span>
        </label>
        <input
          type="file"
          accept=".png,.jpg,.pdf,.docx"
          multiple={multiple}
          id={`uid${uniqueId}${key}`}
          className="form-control custom-file"
          style={{ boxShadow: "unset" }}
          onChange={onFileChange}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          const dataUrl = reader.result;
          if (typeof dataUrl !== "string") {
            resolve(null);
            return;
          }
          const base64Only = dataUrl.split(",")[1] || null;
          resolve(base64Only);
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => {
        resolve(null);
      };
    });
  };

  const renderResumeInput = (
    label = "",
    key = "",
    accept = ".pdf,.docx",
    multiple = false,
    hide = false,
    docDesc = "",
    docCategory = ""
  ) => {
    if (hide) return null;

    const onFileChange = async (e) => {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      setFileSizeError("");

      const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];

      const invalidFile = files.find((file) => !allowedTypes.includes(file?.type) || file?.size > 5 * 1024 * 1024);

      if (invalidFile) {
        let errorMessage = "";
        if (!allowedTypes.includes(invalidFile.type)) {
          errorMessage = "Only PDF and DOCX files are allowed.";
        } else if (invalidFile.size > 5 * 1024 * 1024) {
          errorMessage = "File size must not exceed 5MB.";
          setFileSizeError("File size must not exceed 5MB.");
        }

        setErrors((prev) => ({ ...prev, [key]: errorMessage }));
        setResumeInput(null);
        return;
      }

      const updatedDocs = await Promise.all(
        files.map(async (file) => {
          const base64 = await toBase64(file);
          return {
            file_name: file?.name,
            document_type: "resume",
            doc_type: "Resume",
            file_content: base64,
          };
        })
      );

      // Update the global array
      // setUploadedDocs((prev) => [...prev.filter((doc) => doc.document_type !== key), ...updatedDocs]);

      // Also save the first (or only) resume entry in its own state
      setResumeInput(updatedDocs[0] || null);

      // Clear any error on that key
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    };

    return (
      <div className="mb-3">
        <label htmlFor={`uid${uniqueId}${key}`} className="form-label">
          {label} <span className="text-danger fw-bold">*</span>
        </label>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          id={`uid${uniqueId}${key}`}
          className="form-control custom-file"
          style={{ boxShadow: "unset" }}
          onChange={onFileChange}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderDateInputDocs = (label = "", key = "", hide = false, disabledWithwarn = false, type = "doc_expiry") => {
    if (hide) return null;

    const updateDate = (date) => {
      setUploadedDocs((prev) => {
        const others = prev.filter((doc) => doc.doc_type !== key);
        const existing = prev.find((doc) => doc.doc_type === key) || {
          doc_type: key,
        };
        return [
          ...others,
          {
            ...existing,
            [type]: dateToUTCDate(date),
          },
        ];
      });
    };

    const selected = uploadedDocs.find((d) => d.doc_type === key)?.[type] || null;

    return (
      <div className="mb-3 w-100">
        <label htmlFor={`uid${uniqueId}${key}_${type}`} className="form-label">
          {label}
        </label>
        <DatePicker
          maxDate={"2099"}
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          showYearDropdown
          showMonthDropdown
          showIcon
          calendarIconClassName="calenderIconRight"
          toggleCalendarOnIconClick
          scrollableYearDropdown
          yearDropdownItemNumber={80}
          selected={pickDateOnly(selected) || null}
          onChange={updateDate}
          dateFormat="MM/dd/yyyy"
          className="form-control ps-2 w-100"
          style={{ boxShadow: "unset" }}
          placeholderText="MM/DD/YYYY"
          id={`uid${uniqueId}${key}_${type}`}
        />
        {/* {errors[key] && <div className="text-danger font12">{errors[key]}</div>} */}
      </div>
    );
  };

  const renderDateInput = (label = "", key = "", hide, disabledWithwarn, required) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3 w-100">
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label} {required ? <span className="text-danger fw-bold">*</span> : <></>}
        </label>
        <div className="w-100">
          <DatePicker
            maxDate={"2099"}
            title={
              disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
            }
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

  const renderSelect = (
    label = "",
    key = "",
    placeholder = "",
    data = [],
    className,
    hide,
    disabledWithwarn,
    required
  ) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className={className || "mb-3"}>
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label} {required ? <span className="text-danger fw-bold"> * </span> : <></>}
        </label>
        <select
          disabled={disabledWithwarn}
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          style={disabledWithwarn ? { "--bs-form-select-bg-img": "null", boxShadow: "unset" } : { boxShadow: "unset" }}
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

  const usEntryVisa = [...visaStatus, { value: "F1", label: "F1" }, { value: "Others", label: "Others" }];

  const renderpersonalInfo = () => (
    <div>
      <div className={styles.gridContainer}>
        {renderInput("First Name", "first_name", "First Name", false, true, false, true)}
        {renderInput("Last Name", "last_name", "Last Name", false, true, false, true)}
        {renderSelect(
          "Gender",
          "gender",
          "Select Gender",
          [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
          ],
          undefined,
          false,
          false,
          true
        )}
        {renderDateInput("Date of Birth", "date_of_birth", false, true, true)}
        {renderInput("Primary Email", "primary_email", "Primary Email", false, true, false, true)}
        {renderInput("Secondary Email (Optional)", "secondary_email", "Secondary Email")}
        {renderInput("Primary Contact", "primary_contact", "Primary Contact", false, false, false, true)}
        {renderInput("Secondary Contact (Optional)", "secondary_contact", "Secondary Contact")}
        {renderInput("Primary Technology", "primary_technology", "Primary Technology", false, false, false, true)}
        {renderInput("Address Line 1", "candidate_address1", "Address Line 1", false, false, false, true)}
        {renderInput("Address Line 2", "candidate_address2", "Address Line 2")}
        {renderInput("ZIP Code", "candidate_zipcode", "ZIP Code", false, false, false, true)}
        {renderInput("City", "candidate_city", "City", false, false, false, true)}
        {renderInput("State", "candidate_state", "State", false, false, false, true)}
        {renderInput("Country", "candidate_country", "Country", false, false, false, true)}
        {renderInput("Emergency Contact Name", "emergency_name", "Emergency Contact Name")}
        {renderInput(
          "Emergency Contact Number",
          "emergency_number",
          "Emergency Contact Number",
          undefined,
          undefined,
          true
        )}
      </div>
    </div>
  );

  const renderWorkInfo = () => (
    <div className={styles.gridContainer}>
      {renderSelect(
        "Work Authorization Status ",
        "visa_status",
        "Select Work Authorization Status ",
        visaStatus,
        undefined,
        false,
        false,
        true
      )}
      {renderInput("University Name", "university_name", "University Name", !OPTLetterStatus, false, false, true)}
      {renderDateInput("Work Authorization Start Date", "work_auth_start_date", false, false, true)}
      {renderDateInput("Work Authorization End Date", "work_auth_end_date", false, false, true)}
      {renderDateInput("US Entry Date", "us_entry_date", false, false, true)}
      {renderSelect(
        "Visa at the time of US Entry ",
        "us_entry_visa",
        "Select Visa at the time of US Entry ",
        usEntryVisa,
        undefined,
        false,
        false,
        true
      )}

      {isOthersVisa ? renderInput("Others", "others_visa", "Other Visa Status", false, false, false, true) : <></>}

      {renderInput("I94 Number", "i94_number", "I94 Number", false, false, false, true)}
    </div>
  );

  const renderDocuments = () => {
    return requiredDocuments?.[0]?.documents?.map((doc) => {
      const key = doc.name;
      // const key = doc.name.replace(/\s+/g, "_").toLowerCase();

      // optional: derive a human-friendly description and category
      const docDesc = `Upload ${doc.name}`;
      const docCategory = doc.is_custom ? "Custom" : "Standard";

      return (
        <div key={key} className="mb-4 border rounded p-3">
          <h6>{doc.name}</h6>
          <div className="d-md-flex gap-3 mt-2">
            <div className="w-100">
              {renderFileInput(
                "Upload Document", // label
                key, // document_type
                "", // accept
                false, // multiple
                false, // hide
                docDesc, // file_desc
                docCategory // doc_category
              )}
            </div>
            {/* {renderDateInputDocs(
          "Valid From", // label
          key, // document_type
          false, // hide
          false, // disabledWithwarn
          "doc_validfrom" // type
        )} */}
            <div className="w-100">
              {renderDateInputDocs(
                "Expiry Date", // label
                key, // document_type
                false, // hide
                false, // disabledWithwarn
                "doc_expiry" // type
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderResumeInfo = () => <div>{renderResumeInput("Resume", "Resume")}</div>;

  const rendertabsData = () => (
    <div className={`d-flex gap-3 w-100 ${styles.headertabContainer}`}>
      {tabsArray.map((card) => {
        let Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`${styles.headerButtons} ${
              activeTab === card.id ? styles.activeTab : ""
            } d-flex justify-content-center gap-2 pointer`}
            onClick={() => {
              if (validTabsLength >= card.id) {
                setActiveTab(card.id);
              }
            }}
          >
            <div>
              {Icon && <Icon style={{ width: "19px", height: "19px" }} />}
              {card.googleicon && <span className="material-symbols-outlined">{card.googleicon}</span>}
              {card.cssIcon && <span className={card.cssIcon}></span>}
            </div>
            <div>{card.title}</div>
          </div>
        );
      })}
    </div>
  );

  if (showProgress) {
    return (
      <>
        <RenderProgress />
        <ThemeLoader show={isLoading} fixed />
      </>
    );
  }

  return (
    <div>
      {/* {hideBG ? (
        <div />
      ) : ( */}
      <div className={`w-100 pb-4 px-4 container`}>
        <div className="fontblack mb-4 mt-2">
          <h2>New Employee Onboarding</h2>
          <div>Please complete all sections to finalize your onboarding process.</div>
        </div>
        {rendertabsData()}
        <div className={`mt-4`}>
          {currentTab.renderData()}
          <div className="d-flex justify-content-end mt-4 pt-3 gap-3">
            {activeTab == 1 ? (
              <></>
            ) : (
              <div className="themeButtonoutline" onClick={() => setActiveTab(activeTab - 1)}>
                <span class="material-symbols-outlined">reply</span>
                Back
              </div>
            )}

            <div className="themeButton" onClick={handleSubmit}>
              <span class="material-symbols-outlined mb-1">{activeTab === 4 ? "save" : "play_arrow"} </span>
              {activeTab === 4 ? "Submit" : "Continue"}
            </div>
          </div>
        </div>
      </div>
      {/* )} */}

      <UploadStatusModal uploadFiles={uploadFiles} />

      <Themeloader show={loading} />
      <Confirm
        hideCancel
        show={finalConfirm}
        deleteTitle="Done"
        icon="check"
        result={(result) => {
          setfinalConfirm(null);
          navigate("/");
        }}
        title={confirmTitle}
        text={confirmText}
      />
    </div>
  );
};

function OnBoarding() {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState({
    org_data: [
      {
        org_address: "8601 Six Forks Road, Releigh, NC 27615",
        org_website: "https://elevatestaffing.ai",
        preferred_org_name: "Elevate Staffing LLC",
      },
    ],
  });

  const orgAddress = data?.org_data?.[0]?.preferred_org_name + " | " + data?.org_data?.[0]?.org_address || "";

  return (
    <div className="d-flex h-100 flex-column" style={{ minHeight: "100dvh" }}>
      {isLoggedIn ? <></> : <DefaultHeader address={`Powered for: ${orgAddress}`} orgData={data} />}

      <RenderOnboarding setORGData={setData} />
      {isLoggedIn ? (
        <></>
      ) : (
        <div className="mt-auto">
          <DefaultFooter />
        </div>
      )}
    </div>
  );
}

export default OnBoarding;
