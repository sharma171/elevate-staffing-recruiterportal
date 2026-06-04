import React, { useEffect, useRef, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext.jsx";
import { IoIosSend } from "react-icons/io";
import { CheckPicker } from "rsuite";
import { useLocation } from "react-router-dom";
import axiosApi from "../../components/axiosApi.js";
import ThemeLoader from "../../components/ThemeLoader.jsx";
import { RotateCw } from "lucide-react";

function UpdateModal({ show, setShow, update, isUpdate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDocs, setSelectedDocs] = useState([]);
  const checkPickerRef = useRef();

  const { pathname } = useLocation();
  const routeName = pathname.split("/").filter(Boolean)[0];

  let isPendingTalent = routeName === "pendingtalent";

  useEffect(() => {
    const handleScroll = (e) => {
      const picker = document.querySelector(".rs-picker-check");
      const dropdown = document.querySelector(".rs-picker-check-menu");

      if (!picker || !dropdown) return;

      const isWithinPicker = picker.contains(e.target) || dropdown.contains(e.target);
      if (!isWithinPicker && checkPickerRef.current) {
        checkPickerRef.current.close?.();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  useEffect(() => {
    setFormData({});
    setSelectedDocs([]);
    setErrors({});
  }, [show]);

  useEffect(() => {
    if (isUpdate?.primary_email) {
      resendOnboardingInvite(isUpdate);
    }
  }, [isUpdate?.primary_email]);

  const resendOnboardingInvite = (data) => {
    let payload = {
      action: "get-invitation-details",
      admin_email: user.email,
      employee_email: data.primary_email || data.secondary_email,
    };

    setLoading(true);

    axiosApi
      .post("https://manage-pre-board-employee-v3-305451280005.us-east1.run.app", payload)
      .then((res) => {
        let data = res.data.data;
        formData.first_name = data.first_name;
        formData.last_name = data.last_name;
        formData.primary_contact = String(data.primary_contact);
        formData.primary_email = data.primary_email;

        const docs = [];
        let hasCustom = false;

        data.required_documents.forEach((item) => {
          if (typeof item === "object" && item.is_custom) {
            formData.custom_name = item.name;
            hasCustom = true;
          } else {
            docs.push(item);
          }
        });

        if (hasCustom) {
          docs.push("Other");
        }

        setSelectedDocs(docs);
        setFormData({ ...formData });
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Failed to send");
        console.log(err, "eeeeee");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!formData.primary_email?.trim()) {
      newErrors.primary_email = "Email address is required";
    } else if (!/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.primary_email.trim())) {
      newErrors.primary_email = "Enter a valid email address";
    }

    if (!formData.primary_contact?.trim()) newErrors.primary_contact = "Contact Number is required";
    // if (!formData.position?.trim()) newErrors.position = "Position is required";
    if (!selectedDocs.length) newErrors.doc_type = "At least one document type is required";
    if (selectedDocs.includes("Other") && !formData.custom_name?.trim()) {
      newErrors.custom_name = "Other document name is required";
    }
    return newErrors;
  };

  const handleSubmit = (isUpdateForm) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const payload = {
      admin_email: user.email,
      action: isUpdateForm ? "resend-onboard" : "send-onboard",
      task_name: isUpdateForm ? "Complete Employee Onboarding - Updated" : "Complete new hire documents",
      ...formData,
      required_documents: selectedDocs,
    };

    if (isUpdateForm) {
      payload.employee_email = isUpdate?.primary_email;
    }

    api
      .sendTalentPoolInvitation(payload)
      .then((res) => {
        toast.success(res.message);
        setShow(false, true);
        if (isPendingTalent) {
          update?.();
        }
      })
      .catch((err) => toast.error(err?.error || err.message))
      .finally(() => setLoading(false));
  };

  const documentOptions = [
    { label: "Driving License / State ID", value: "Driving License / State ID" },
    { label: "Work Authorization Document", value: "Work Authorization Document" },
    { label: "SSN Card", value: "SSN Card" },
    { label: "Visa", value: "Visa" },
    { label: "I-20", value: "I-20" },
    { label: "Passport", value: "Passport" },
    { label: "Proof of Address", value: "Proof of Address" },
    { label: "Education Certificate", value: "Education Certificate" },
    { label: "Professional Reference", value: "Professional Reference" },
    { label: "Other", value: "Other" },
  ];

  if (!show) return null;

  return (
    <OverlayModal style={{ maxWidth: "650px" }} isActive={show} onClose={() => setShow(false)}>
      <div className="mb-5">
        <div className="themeColor h4">Add New Candidate</div>
        <div className="fontgray fs-6">Choose how you want to onboard your new candidate.</div>
      </div>

      <div className="p-4 themewhite">
        <div className="d-md-flex gap-2">
          <div className="mb-3 flex-fill">
            <label className="form-label">
              First Name <span className="fw-bold text-red">*</span>
            </label>
            <input
              className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              placeholder="Enter First Name"
            />
            {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
          </div>

          <div className="mb-3 flex-fill">
            <label className="form-label">
              Last Name <span className="fw-bold text-red">*</span>
            </label>
            <input
              className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              placeholder="Enter Last Name"
            />
            {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Email Address <span className="fw-bold text-red">*</span>
          </label>
          <input
            disabled={isUpdate}
            className={`form-control ${errors.primary_email ? "is-invalid" : ""}`}
            value={formData.primary_email}
            onChange={(e) => {
              if (!isUpdate) {
                handleChange("primary_email", e.target.value);
              }
            }}
            placeholder="Enter Email Address"
          />
          {errors.primary_email && <div className="invalid-feedback">{errors.primary_email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Contact Number <span className="fw-bold text-red">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${errors.primary_contact ? "is-invalid" : ""}`}
            value={formData.primary_contact}
            onChange={(e) => handleChange("primary_contact", e.target.value)}
            placeholder="Enter Contact Number"
          />
          {errors.primary_contact && <div className="invalid-feedback">{errors.primary_contact}</div>}
        </div>

        {/* <div className="mb-3">
          <label className="form-label">Position</label>
          <input
            className={`form-control ${errors.position ? "is-invalid" : ""}`}
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
            placeholder="Enter Position"
          />
          {errors.position && <div className="invalid-feedback">{errors.position}</div>}
        </div> */}

        <div className="mb-3">
          <label className="form-label">
            Required Documents <span className="fw-bold text-red">*</span>
          </label>
          <CheckPicker
            // onClose={checkPickerRef.current.close?.()}
            className="customcheckPicker"
            ref={checkPickerRef}
            data={documentOptions}
            value={selectedDocs}
            onChange={(val) => {
              setSelectedDocs(val);
              setErrors((prev) => ({ ...prev, doc_type: "" }));
            }}
            block
            placement="autoVertical"
            placeholder="Select required documents"
            searchable={false}
          />
          {errors.doc_type && <div className="text-danger mt-1">{errors.doc_type}</div>}
        </div>

        {selectedDocs.includes("Other") && (
          <div className="mb-3">
            <label className="form-label">
              Other Document Name <span className="fw-bold text-red">*</span>
            </label>
            <input
              className={`form-control ${errors.custom_name ? "is-invalid" : ""}`}
              value={formData.custom_name}
              onChange={(e) => handleChange("custom_name", e.target.value)}
              placeholder="Enter Other Document Name"
            />
            {errors.custom_name && <div className="invalid-feedback">{errors.custom_name}</div>}
          </div>
        )}

        <div className="border rounded p-2">
          <div className="h6 d-flex align-items-center gap-2 mb-3">
            <IoIosSend />
            Self-Service Onboarding
          </div>
          <div className="fontgray">
            Send an email invitation with a secure link for the candidate to complete their onboarding process
            themselves.
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4 pt-1">
          {loading ? (
            <div className="themeButton" style={{ height: "56px" }}>
              <div className="spinner-border text-light spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {isUpdate ? (
                <div className="themeButton d-flex align-items-center gap-2" onClick={() => handleSubmit(true)}>
                  <RotateCw style={{ height: "14px", width: "14px" }} />
                  Resend Invitation Link
                </div>
              ) : (
                <div className="themeButton d-flex align-items-center gap-2" onClick={() => handleSubmit()}>
                  <IoIosSend style={{ fontSize: "18px" }} />
                  Send Invitation Link
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ThemeLoader show={loading} />
    </OverlayModal>
  );
}

export default UpdateModal;
