import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./NewInterview.module.css";
import OverlayModal from "../../components/OverlayModal";

import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { formatDateToET, pickDateOnly } from "../../helpers/StrHelpers";
import { ThemeLoader } from "../../components";
import { SelectPicker, DatePicker } from "rsuite";
import { ArrowLeft, CalendarDays, X } from "lucide-react";
import DuplicateSubmissionDialog from "./DuplicateSubmissionDialog";
import moment from "moment";

let generalInfo = [
  {
    type: "selectPicker",
    id: "Candidate_Full_Name",
    label: "Candidate Full Name",
    placeholder: "Candidate Full Name",
    name: "id",
    updateDisabled: true,
    optionsFromProp: "candidatelist",
    required: true,
    validation: { required: "Candidate Full Name is required" },
    keyMap: { value: "value", text: "label" },
    defaultOption: { value: "", label: "Candidate Full Name" },
  },
  {
    type: "email",
    id: "candidate_email_id",
    label: "Candidate Email ID",
    placeholder: "Candidate Email ID",
    name: "candidate_email_id",
    info: "Required for duplicate detection",
    validation: { required: "Candidate Email is required" },
    required: true,
  },
  {
    type: "selectPicker",
    id: "assigned_recruiter",
    label: "Submitted By (Recruiter Email)",
    name: "from_email",
    optionsFromProp: "recruitersBList",
    keyMap: { value: "recruiter_alias_name", text: "recruiter_alias_name" },
    defaultOption: { recruiter_alias_name: "", recruiter_name: "Select Recruiter" },
    info: "Your email address for duplicate detection and audit tracking",
  },
  {
    type: "tel",
    id: "rate",
    label: "Rate",
    placeholder: "Rate",
    name: "rate",
    className: "phoneInput",
  },
  {
    type: "date",
    id: "submission_date",
    label: "Submission Date",
    placeholder: "Submission Date",
    name: "submission_date",
    className: "phoneInput",
    required: true,
    validation: { required: "Submission Date is required" },
  },
  {
    type: "select",
    id: "Submission_Status",
    label: "Submission Status",
    name: "submission_status",
    required: true,
    validation: { required: "Submission Status is required" },
    options: [
      { value: "", text: "Select Submission Status" },
      { value: "Technical Screening", text: "Technical Screening" },
      { value: "Interview Round 1", text: "Interview Round 1" },
      { value: "Interview Round 2", text: "Interview Round 2" },
      { value: "Interview Round 3", text: "Interview Round 3" },
      { value: "Client Round", text: "Client Round" },
      { value: "Interview Rejected", text: "Interview Rejected" },
    ],
  },
  {
    type: "text",
    id: "technology",
    label: "Technology",
    placeholder: "Technology",
    name: "technology",
  },
  {
    type: "text",
    id: "to_email",
    label: "Submitted To (Vendor Email)",
    placeholder: "vendor@company.com",
    name: "to_email",
    info: "Vendor contact email address",
    required: true,
    validation: {
      required: "Vendor Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email address",
      },
    },
  },
];

let Interview_Details = [
  {
    type: "text",
    id: "client_name",
    label: "Client Name",
    placeholder: "Client Name",
    name: "client_name",
    info: "End client name for reference",
  },
  {
    type: "text",
    id: "interview_panel_members",
    label: "Interview Panel Members",
    placeholder: "Interview Panel Members",
    name: "interview_panel_members",
  },
  {
    type: "datetime",
    id: "interview_date_time",
    label: "Interview Date Time",
    placeholder: "Interview Date Time",
    name: "interview_date_time",
    required: true,
    validation: { required: "Interview Date Time is required" },
  },
  {
    type: "select",
    id: "interview_timezone",
    label: "Interview Timezone",
    name: "interview_timezone",
    required: true,
    validation: { required: "Interview Timezone is required" },
    options: [
      { value: "", text: "Select TimeZone" },
      { value: "CST", text: "CST" },
      { value: "EST", text: "EST" },
      { value: "MST", text: "MST" },
      { value: "PST", text: "PST" },
    ],
  },
  {
    type: "textarea",
    id: "comments",
    label: "Comment",
    placeholder: "Comment",
    name: "comments",
  },
];

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const NewInterviewModal = ({
  isModalActive,
  isRateTab,
  setIsModalActive,
  update,
  isLoading,
  recruitersBList,
  updateTable,
  disabled,
  allUsersData,
  candidateDataID,
  onBack,
  defaultCandidateData,
}) => {
  const { user } = useAuth();

  const [candidateData, setCandidateData] = useState(defaultCandidateData || {});
  const [candidateName, setcandidateName] = useState("");
  const [loading, setloading] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    unregister,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: update && candidateData ? candidateData : {},
  });

  const renderFields = [...generalInfo, ...Interview_Details];
  const allFormValues = watch();

  useEffect(() => {
    if (allFormValues?.full_name) {
      setValue("candidate_full_name", allFormValues?.full_name);
      setValue("candidate_email_id", allFormValues?.primary_email);
      setValue("from_email", allFormValues?.assigned_recruiter);
      unregister("full_name");
      unregister("primary_email");
      unregister("assigned_recruiter");
    }
  }, [allFormValues?.full_name]);

  useEffect(() => {
    if (candidateDataID) {
      setCandidateData(defaultCandidateData);
    } else {
      reset({});
      setCandidateData({});
      setcandidateName("");
    }
  }, [candidateDataID]);

  useEffect(() => {
    if (!isModalActive) {
      reset({});
      setCandidateData({});
      setcandidateName("");
      setShowDuplicate(false);
    }
  }, [isModalActive]);

  useEffect(() => {
    if (allFormValues.id && candidateName != allFormValues.id) {
      setcandidateName(allFormValues.id);
    }
  }, [allFormValues?.id]);

  const candidatelist = update
    ? [defaultCandidateData].map((item) => ({ label: item.candidate_full_name, value: item.id }))
    : allUsersData.map((item) => ({ label: item.full_name, value: item.id }));

  useEffect(() => {
    if (allUsersData?.length) {
      let candidatedataobj = allUsersData.find((item) => item.id == candidateName);
      setCandidateData(candidatedataobj || {});
    }
  }, [allUsersData, candidateName]);

  useEffect(() => {
    if (isModalActive) {
      reset(candidateData || {});
    }
  }, [candidateData?.id, reset, isModalActive]);

  const onSubmit = (data, force_insert = false, isUpdate) => {
    setShowDuplicate(false);

    let payload = {
      operation: update ? "update" : "insert",
      candidate_full_name: data.candidate_full_name || data.full_name,
      candidate_email_id: data.candidate_email_id,
      from_email: data.from_email,
      rate: data.rate,
      submission_date: data.submission_date,
      submission_status: data.submission_status,
      technology: data.technology,
      to_email: data.to_email,
      client_name: data.client_name,
      comments: data.comments,
      interview_panel_members: data.interview_panel_members,
      interview_timezone: data.interview_timezone,
      interview_date_time: data.interview_date_time,
    };

    if (isUpdate) {
      payload.operation = "update";
      payload.id = showDuplicate?.existing_record?.id;
    }

    if (force_insert === true) payload.force_insert = true;

    if (update) payload.id = data.id;
    if (!update || isUpdate) payload.email = data.candidate_email_id;

    setloading(true);
    api
      .CandidateInterviewDetails(payload)
      .then((res) => {
        toast.success(res.message);
        updateTable();
        setIsModalActive(false);
        reset({});
        setCandidateData({});
        setcandidateName("");
        setShowDuplicate(false);
        setloading(false);
      })
      .catch((err) => {
        let isDuplicate = err.warning == "duplicate_found";
        if (isDuplicate) setShowDuplicate(err);
        setloading(false);
        (err.error || err?.message) && toast.error(err?.error || err?.message);
      });
  };

  const renderField = (field, props) => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div className="mb-0">
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label} {field?.required ? <span className="text-danger">*</span> : <></>}
            </label>
            <input
              disabled={disabled}
              className={`form-control bigHoverInput ${field.className ? styles[field.className] : ""}`}
              id={field.id}
              type={field.type}
              placeholder={field.placeholder || ""}
              {...register(field.name, field.validation)}
            />
            {errors[field.name] && <span className="text-danger small">{errors[field.name].message}</span>}
            {field?.info ? <div style={{ fontSize: "12px", color: "#67677e" }}>{field?.info}</div> : <></>}
          </div>
        );
      case "datetime":
        let value = watch(field.name) ? new Date(watch(field.name)) : null;
        return (
          <div className="mb-0">
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label} {field?.required ? <span className="text-danger">*</span> : <></>}
            </label>
            <DatePicker
              caretAs={() => <CalendarDays size={14} />}
              className="bigHoverInputr"
              value={value}
              onChange={(d) =>
                setValue(field.name, d ? moment(d).format("MM/DD/YYYY HH:mm") : "", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              format="MM/dd/yyyy HH:mm"
              block
              cleanable={false}
              maxDate={"2099"}
              id={field.id}
              placement="autoVertical"
              placeholder="MM/DD/YYYY HH:MM"
              disabled={disabled}
            />
            <input type="hidden" {...register(field.name, field.validation)} />
            {errors[field.name] && <span className="text-danger small">{errors[field.name].message}</span>}
            {field?.info ? <div style={{ fontSize: "12px", color: "#67677e" }}>{field?.info}</div> : <></>}
          </div>
        );
      case "date":
        return (
          <div className="mb-0">
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label} {field?.required ? <span className="text-danger">*</span> : <></>}
            </label>
            <DatePicker
              oneTap
              caretAs={() => <CalendarDays size={14} />}
              maxDate={"2099"}
              value={normalizeDate(watch(field.name))}
              cleanable={false}
              className="bigHoverInputr w-100"
              onChange={(d) =>
                setValue(field.name, d ? moment(d).format("MM/DD/YYYY") : "", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              dateFormat="MM/dd/yyyy"
              placeholder={"MM/DD/YYYY"}
              id={field.id}
              disabled={disabled}
            />
            <input type="hidden" {...register(field.name, field.validation)} />

            {errors[field.name] && <span className="text-danger small">{errors[field.name].message}</span>}

            {field?.info ? <div style={{ fontSize: "12px", color: "#67677e" }}>{field?.info}</div> : <></>}
          </div>
        );
      case "textarea":
        return (
          <div className="mb-0" style={{ gridColumn: "1 / -1" }}>
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label}
            </label>
            <textarea
              disabled={disabled}
              className={`inputBorderblue form-control expandable-textarea bigHoverInput ${
                field.className ? styles[field.className] : ""
              }`}
              id={field.id}
              placeholder={field.placeholder || ""}
              {...register(field.name, field.validation)}
            />
          </div>
        );
      case "select":
        return (
          <div className="mb-0">
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label}
            </label>
            <select
              disabled={disabled}
              className="form-select bigHoverInput"
              id={field.id}
              {...register(field.name, field.validation)}
            >
              {(field.optionsFromProp ? [field.defaultOption, ...props[field.optionsFromProp]] : field.options).map(
                (option) => {
                  let value = field?.keyMap?.value ? option[field.keyMap.value] : option.value;
                  let text = field?.keyMap?.text ? option[field.keyMap.text] : option.text;
                  return (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  );
                },
              )}
            </select>
            {field?.info ? <div style={{ fontSize: "12px", color: "#67677e" }}>{field?.info}</div> : <></>}
          </div>
        );
      case "selectPicker":
        const options = field.optionsFromProp ? [...(props[field.optionsFromProp] || [])] : field.options || [];
        const data = options?.map((option) => {
          const value = field?.keyMap?.value ? option[field.keyMap.value] : option.value;
          const label = field?.keyMap?.text ? option[field.keyMap.text] : option.text;
          return { label, value };
        });
        return (
          <div className="mb-0">
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label}
            </label>
            <SelectPicker
              id={field.id}
              cleanable={false}
              data={data}
              className="bigHoverInputr w-100"
              value={allFormValues[field.name] || ""}
              onChange={(value) => setValue(field.name, value)}
              disabled={disabled}
              placeholder={field.placeholder || null}
            />
            <input type="hidden" {...register(field.name, field.validation)} />
            {field?.info ? <div style={{ fontSize: "12px", color: "#67677e" }}>{field?.info}</div> : <></>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFormInnerContent = () => (
    <>
      <div className="d-flex justify-content-between gap-2 mb-3">
        <div>
          <h2 className="h4 fw-bold mb-1">{update ? "Edit Interview" : "Add New Interview Entry"}</h2>
          <p className="text-muted">
            {update ? "Update interview details" : "Enter candidate details to create a new interview record"}
          </p>
        </div>
        <button className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={() => setIsModalActive(false)}>
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="gridContainertwoView gap-3">
        {renderFields.map((field) => renderField(field, { recruitersBList, candidatelist }))}
      </div>

      {!disabled && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          {!update && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onBack}
              className={`${styles.button} ${styles.backBtn}`}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          <button className={`${styles.button} ${styles.cancelBtn}`} onClick={() => setIsModalActive(false)}>
            Cancel
          </button>
          <button type="submit" className={styles.schedule_primary} disabled={isLoading || loading}>
            {isLoading ? "Loading..." : update ? "Update Interview" : "Add Interview"}
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {isModalActive && (
        <OverlayModal
          isActive={isModalActive}
          style={{ maxWidth: "800px" }}
          modalStyle={{ backgroundColor: "#fff" }}
          onClose={() => setIsModalActive(false)}
        >
          <div className="modal-content">
            <div className="modal-body">
              {disabled ? (
                <div>{renderFormInnerContent()} </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>{renderFormInnerContent()}</form>
              )}
            </div>
          </div>

          <DuplicateSubmissionDialog
            onCreateNew={() => onSubmit(allFormValues, true)}
            onUpdateExisting={() => onSubmit(allFormValues, false, true)}
            open={showDuplicate}
            onCancel={() => setShowDuplicate(false)}
          />

          <ThemeLoader show={loading} fixed />
        </OverlayModal>
      )}
    </>
  );
};

export default NewInterviewModal;
