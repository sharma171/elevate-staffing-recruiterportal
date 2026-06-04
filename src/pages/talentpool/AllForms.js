import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import styles from "./css/NewCandidateModal.module.css";
import { formatDateToET, pickDateOnly } from "../../helpers/StrHelpers";
import BankingInfo from "./BankingInfo";
import { Eye, EyeOff, ArrowLeft, Briefcase, Building2, Calendar, Pen, Save, Shield, User, X } from "lucide-react";
import PremiumSelect from "../../components/PremiumSelect";
import { ThemeLoader } from "../../components";
import { SelectPicker } from "rsuite";

// Form configurations categorized by sections

const getBadgeStyle = (value) => {
  const key = String(value || "").toLowerCase();

  const map = {
    issued: {
      background: "#16a34a",
      color: "#fff",
    },
    "not issued": {
      background: "#dc2626",
      color: "#fff",
    },
    signed: {
      background: "#2563eb",
      color: "#fff",
    },
    expired: {
      background: "#f59e0b",
      color: "#fff",
    },
    cancelled: {
      background: "#7c2d12",
      color: "#fff",
    },
  };

  return (
    map[key] || {
      background: "#6b7280",
      color: "#fff",
    }
  );
};

const generalInfo = {
  personalInfo: [
    {
      type: "text",
      id: "first_name",
      label: "First Name",
      placeholder: "Enter First Name",
      name: "first_name",
      validation: { required: "First name is required" },
    },
    {
      type: "text",
      id: "last_name",
      label: "Last Name",
      placeholder: "Enter Last Name",
      name: "last_name",
      validation: { required: "Last name is required" },
    },
    {
      type: "select",
      id: "gender",
      label: "Gender",
      name: "gender",
      options: [
        { value: "", text: "Select Gender" },
        { value: "Male", text: "Male" },
        { value: "Female", text: "Female" },
        { value: "Others", text: "Others" },
      ],
    },
    {
      type: "date",
      id: "Date of Birth",
      label: "Date of Birth",
      name: "date_of_birth",
    },

    {
      isPassword: true,
      type: "tel",
      id: "ssn_number",
      label: "SSN",
      placeholder: "Enter SSN",
      name: "ssn_number",
      validation: {
        pattern: {
          value: /^(?:\d{9}|\d{3}-\d{2}-\d{4})$/,
          message: "Enter a valid SSN (9 digits or XXX-XX-XXXX)",
        },
      },
    },
    {
      type: "select",
      id: "opt_status",
      isBadgeView: true,
      label: "Offer Letter Status",
      name: "opt_letter_status",
      options: [
        { value: "", text: "Select Status" },
        { value: "ISSUED", text: "ISSUED" },
        { value: "NOT ISSUED", text: "NOT ISSUED" },
        // { value: "SIGNED", text: "SIGNED" },
        // { value: "EXPIRED", text: "EXPIRED" },
        // { value: "CANCELLED", text: "CANCELLED" },
      ],
    },
  ],

  employmentDetails: [
    {
      type: "date",
      id: "employment_start_date",
      label: "Start Date",
      name: "employment_start_date",
    },
    {
      type: "date",
      id: "employment_end_date",
      label: "End Date",
      name: "employment_end_date",
    },
    {
      id: "volunteer_work",
      type: "select",
      label: "Volunteer Work",
      name: "volunteer_work",
      options: [
        { value: "", text: "Is Volunteer Work" },
        { value: "Yes", text: "Yes" },
        { value: "No", text: "No" },
      ],
    },
    {
      type: "text",
      label: "Current Job Title",
      placeholder: "Current Job Title",
      name: "job_title",
      // validation: { required: "Job Title are required" },
    },
    {
      id: "pay_type",
      type: "select",
      label: "Pay Type",
      name: "pay_type",
      options: [
        { value: "", text: "Pay Type" },
        { value: "hourly", text: "Hourly" },
        { value: "annual", text: "Annual" },
      ],
    },
    {
      type: "text",
      label: "Salary (Per Annum)",
      placeholder: "Salary (Per Annum)",
      name: "employee_salary",
      getdisplayLabel: "employee_salary",
      // validation: { required: "Salary (Per Annum) are required" },
    },
  ],

  contactInfo: [
    {
      type: "email",
      id: "primary_email",
      label: "Primary Email",
      placeholder: "Enter Primary Email",
      name: "primary_email",
      validation: {
        required: "Email is required",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
    {
      type: "email",
      id: "secondary_email",
      label: "Secondary Email",
      placeholder: "Enter Secondary Email",
      name: "secondary_email",
      validation: {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
    {
      type: "tel",
      id: "primary_contact",
      label: "Primary Contact No.",
      placeholder: "Enter Primary Contact No.",
      name: "primary_contact",
      className: "phoneInput",
      validation: {
        required: "Contact Number is required",
        pattern: {
          value: /^[0-9]+$/,
          message: "Primary Contact No. must contain only numbers",
        },
      },
    },
    {
      type: "tel",
      id: "secondary_contact",
      label: "Secondary Contact No.",
      placeholder: "Enter Secondary Contact No.",
      name: "secondary_contact",
      className: "phoneInput",
      validation: {
        pattern: {
          value: /^[0-9]+$/,
          message: "Secondary Contact No. must contain only numbers",
        },
      },
    },
  ],

  professionalinfo: [
    {
      type: "select",
      id: "visa_status",
      label: "Visa Status",
      name: "visa_status",
      options: [
        { value: "", text: "Select Visa Status" },
        { value: "OPT", text: "OPT" },
        { value: "CPT", text: "CPT" },
        { value: "H1B", text: "H1B" },
        { value: "H4 EAD", text: "H4 EAD" },
        { value: "GC", text: "GC" },
        { value: "GC EAD", text: "GC EAD" },
        { value: "USC", text: "USC" },
        { value: "STEM OPT", text: "STEM OPT" },
        { value: "L2/L2 EAD", text: "L2/L2 EAD" },
      ],
    },
    {
      type: "text",
      id: "university",
      label: "University",
      placeholder: "Enter University Name",
      name: "university_name",
    },
    {
      type: "text",
      id: "primary_skill",
      label: "Primary Technology",
      placeholder: "Enter Primary Technology",
      name: "primary_technology",
    },
    {
      type: "text",
      id: "secondary_skill",
      label: "Secondary Technology",
      placeholder: "Enter Secondary Technology",
      name: "secondary_technology",
    },
  ],

  addressInfo: [
    {
      type: "text",
      id: "streetAddress",
      label: "Address Line 1",
      placeholder: "Street Address, P.O. box",
      name: "candidate_address1",
      parentClass: "col-md-6 mb-3",
    },
    {
      type: "text",
      id: "addressplus",
      label: "Address Line 2",
      placeholder: "Apartment, Suite, etc.",
      name: "candidate_address2",
      parentClass: "col-md-6 mb-3",
    },
    {
      type: "text",
      id: "candidate_zipcode",
      label: "ZIP Code",
      placeholder: "Enter ZIP Code",
      name: "candidate_zipcode",
      validation: {
        pattern: {
          value: /^[0-9]{5}$/,
          message: "ZIP Code must be 5 digits",
        },
      },
    },
    {
      type: "text",
      id: "candidate_city",
      label: "City",
      placeholder: "Enter City",
      name: "candidate_city",
    },
    {
      type: "text",
      id: "candidate_state",
      label: "State",
      placeholder: "Enter State",
      name: "candidate_state",
    },
    {
      type: "text",
      id: "candidate_country",
      label: "Country",
      placeholder: "Enter Country",
      name: "candidate_country",
    },
  ],
  emergencyContact: [
    {
      type: "text",
      id: "emergency_name",
      label: "Contact Name",
      placeholder: "Enter Contact Name",
      name: "emergency_name",
    },
    {
      type: "text",
      id: "emergency_number",
      label: "Contact Number",
      placeholder: "Enter Contact Number",
      name: "emergency_number",
      validation: {
        pattern: {
          value: /^[0-9]+$/,
          message: "Emergency Contact Number must contain only numbers",
        },
      },
    },
    {
      type: "text",
      id: "emergency_email",
      label: "Email",
      placeholder: "Enter Contact Email",
      name: "emergency_email",
      validation: {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
  ],
  otherInfo: [
    {
      type: "textarea",
      id: "comments",
      label: "Comments",
      placeholder: "Enter Comments",
      name: "comments",
      className: "textarea",
      parentClass: "w-100",
    },
  ],
};

const availabilityArr = {
  recruitmentInfo: [
    {
      id: "talent_status",
      type: "select",
      label: "Talent Status",
      name: "talent_status",
      clear_key: "current_status",
      options: [
        { value: "", text: "Select Talent Status" },
        { value: "Active Talent", text: "Active Talent" },
        { value: "Available Talent", text: "Available Talent" },
        { value: "Inactive Talent", text: "Inactive Talent" },
        { value: "Pending Talent", text: "Pending Talent" },
      ],
      validation: { required: "Talent Status is required" },
    },
    {
      id: "current_status",
      type: "select",
      label: "Current Status",
      disableKey: "disabledCurrent_status",
      name: "current_status",
      optionsFromProp: "current_status_list",
      keyMap: { value: "value", text: "text" },
      defaultOption: { value: "", text: "Select Current Status" },
      validation: { required: "Current status is required" },
    },
    {
      type: "select",
      id: "availability",
      label: "Availability",
      name: "availability",
      options: [
        { value: "", text: "Select Availability" },
        { value: "Immediate", text: "Immediate" },
        { value: "Available in 2 weeks", text: "Available in 2 weeks" },
        { value: "Available in 45 days", text: "Available in 45 days" },
        { value: "Available in 2 months", text: "Available in 2 months" },
      ],
    },
    {
      type: "select",
      id: "location_preference",
      label: "Location Preference",
      placeholder: "Location Preference",
      name: "location_preference",
      options: [
        { value: "", text: "Select Location Preference" },
        { value: "Remote Only", text: "Remote Only" },
        { value: "Onsite Only", text: "Onsite Only" },
        { value: "Hybrid", text: "Hybrid" },
        { value: "Other", text: "Other" },
      ],
      otherValues: [
        {
          type: "text",
          id: "location_preference",
          label: "State",
          placeholder: "Enter State",
          name: "location_preference_text",
          validation: { required: "Location is required" },
        },
      ],
      validation: { required: "Location preference is required" },
    },
  ],
};

const open_to_workOptionsAndNoOptions = [
  // {
  //   id: "volunteer_work",
  //   type: "select",
  //   label: "Volunteer Work",
  //   name: "volunteer_work",
  //   options: [
  //     { value: "", text: "Is Volunteer Work" },
  //     { value: "Yes", text: "Yes" },
  //     { value: "No", text: "No" },
  //   ],
  // },
  {
    type: "selectsearch",
    id: "assigned_recruiter",
    label: "Assigned Recruiter",
    name: "assigned_recruiter",
    optionsFromProp: "recruitersBList",
    keyMap: { value: "recruiter_alias_name", text: "recruiter_name" },
    defaultOption: { recruiter_alias_name: "", recruiter_name: "Select Recruiter" },
  },
  {
    type: "selectsearch",
    id: "assigned_recruiter_secondary",
    label: "Assigned Secondary Recruiter",
    name: "assigned_recruiter_secondary",
    optionsFromProp: "recruitersBList",
    keyMap: { value: "recruiter_alias_name", text: "recruiter_name" },
    defaultOption: { recruiter_alias_name: "", recruiter_name: "Select Recruiter" },
  },
  {
    type: "selectsearch",
    id: "assigned_team",
    label: "Assigned Team",
    name: "assigned_team",
    optionsFromProp: "teamsData",
    keyMap: { value: "val", text: "key" },
    defaultOption: { val: "", key: "Select Team" },
  },
  {
    id: "Priority",
    type: "select",
    label: "Priority",
    name: "priority",
    options: [
      { value: "", text: "Select Priority" },
      { value: "High", text: "High" },
      { value: "Medium", text: "Medium" },
      { value: "Low", text: "Low" },
    ],
  },
];

const projectYesOptionsNew = [
  {
    type: "select",
    id: "open_to_work",
    label: "Exploring Better Opportunities",
    placeholder: "Exploring Better Opportunities",
    name: "open_to_work",
    options: [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
    ],
    trueOptions: open_to_workOptionsAndNoOptions,
  },
];

const projectDetails = {
  projectStatus: [
    {
      id: "in_project",
      type: "select",
      label: "Currently in a Project",
      name: "currently_in_project",
      trueOptions: projectYesOptionsNew,
      falseOptions: open_to_workOptionsAndNoOptions,
      options: [
        { value: "", text: "Select Status" },
        { value: "Yes", text: "Yes" },
        { value: "No", text: "No" },
      ],
      validation: { required: "This field is required" },
    },
    {
      type: "date",
      id: "marketing_start_date",
      label: "Marketing Start Date",
      name: "marketing_start_date",
    },
  ],

  // assignment: [
  //   {
  //     type: "select",
  //     id: "assigned_recruiter",
  //     label: "Assigned Recruiter",
  //     name: "assigned_recruiter",
  //     optionsFromProp: "recruitersBList",
  //     keyMap: { value: "recruiter_alias_name", text: "recruiter_name" },
  //     defaultOption: { recruiter_alias_name: "", recruiter_name: "Select Recruiter" },
  //   },
  //   {
  //     type: "select",
  //     id: "assigned_recruiter_secondary",
  //     label: "Assigned Secondary Recruiter",
  //     name: "assigned_recruiter_secondary",
  //     optionsFromProp: "recruitersBList",
  //     keyMap: { value: "recruiter_alias_name", text: "recruiter_name" },
  //     defaultOption: { recruiter_alias_name: "", recruiter_name: "Select Recruiter" },
  //   },
  //   {
  //     type: "select",
  //     id: "assigned_team",
  //     label: "Assigned Team",
  //     name: "assigned_team",
  //     optionsFromProp: "teamsData",
  //     keyMap: { value: "val", text: "key" },
  //     defaultOption: { val: "", key: "Select Recruiter" },
  //   },
  // ],
};

const work_authorization = {
  authDates: [
    {
      type: "date",
      id: "work_auth_start_date",
      label: "Work Auth Start",
      name: "work_auth_start_date",
    },
    {
      type: "date",
      id: "work_auth_end_date",
      label: "Work Auth End",
      name: "work_auth_end_date",
    },
    {
      type: "date",
      id: "us_entry_date",
      label: "US Entry Date",
      name: "us_entry_date",
    },
  ],
  verificationstatus: [
    {
      type: "select",
      id: "everify_status",
      label: "E-Verify Status",
      name: "everify_status",
      options: [
        { value: "", text: "Select E-Verify Status" },
        { value: "Completed", text: "Completed" },
        { value: "Pending", text: "Pending" },
      ],
    },
    {
      type: "select",
      id: "i9_form_status",
      label: "I-9 Status",
      name: "i9_form_status",
      options: [
        { value: "", text: "Select I-9 Status" },
        { value: "Completed", text: "Completed" },
        { value: "Pending", text: "Pending" },
      ],
    },
    {
      type: "select",
      id: "id_form_status",
      label: "ID Form Status",
      name: "id_form_status",
      options: [
        { value: "", text: "Select ID Form Status" },
        { value: "Collected", text: "Collected" },
        { value: "Not Collected", text: "Not Collected" },
      ],
    },
    {
      type: "select",
      id: "us_entry_visa",
      label: "Visa at the time of US Entry",
      placeholder: "Visa at the time of US Entry",
      name: "us_entry_visa",
      keyMap: { value: "value", text: "text" },
      defaultOption: { value: "", text: "Visa at the time of US Entry" },
      optionsFromProp: "us_entry_visa_options",
    },
    {
      type: "select",
      id: "opt_status",
      label: "Send Work Status Email",
      name: "send_work_status_email",
      options: [
        { value: "", text: "Select Status" },
        { value: "Yes", text: "Yes" },
        { value: "No", text: "No" },
      ],
    },
  ],

  identitydocuments: [
    {
      type: "tel",
      id: "i94_number",
      label: "I-94 Number",
      placeholder: "Enter I-94 Number",
      name: "i94_number",
    },
    {
      type: "text",
      id: "passport_num",
      label: "Passport Number",
      placeholder: "Enter Passport Number",
      name: "passport_num",
    },
  ],
};

// Section titles
const sectionTitles = {
  personalInfo: "Personal Details",
  employmentDetails: "Employment Period",
  contactInfo: "Contact Information",
  professionalinfo: "Professional Info",
  addressInfo: "Address",
  emergencyContact: "Emergency Contact",
  otherInfo: "Notes",
  availabilitystatus: "Availability Status",
  projectStatus: "Project Status",
  assignment: "Assignment",
  authDates: "Authorization Dates",
  verificationstatus: "Verification Status",
  identitydocuments: "Identity Documents",
};

const AddProjectDialog = ({ open, onLater, onAdd }) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 animate-in fade-in-0" />

      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-8 py-7 shadow-xl duration-200 animate-in fade-in-0 zoom-in-95"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-3 text-left">
          <h2 className="text-xl font-semibold text-[#080118]">Add Project Details?</h2>

          <p className="text-base leading-relaxed text-[#67677e]">
            You've marked this candidate as currently in a project. Would you like to add the project details now?
          </p>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button
            type="button"
            onClick={onLater}
            className="inline-flex items-center justify-center text-sm font-medium border border-input bg-background hover:text-[#fff] rounded-[10px] px-[10px] hover:!bg-[#3c83f6] pointer bg-white h-11"
          >
            Later
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7c3aed] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2"
          >
            Add Project
          </button>
        </div>
      </div>
    </>
  );
};

const AllForms = ({
  disabled,
  isLoading,
  onSubmit,
  candidateData,
  recruitersBList,
  teamsData,
  update,
  onEmailChangeConfirm,
  onProjectsChange,
  isEmailError,
}) => {
  const {
    register,
    setError,
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
    formState: { errors },
  } = useForm({
    defaultValues: update && candidateData ? candidateData : {},
  });

  const [innerActiveTab, setInnerActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProjectspopup, setisProjectspopup] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({});

  const allFormValues = watch();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!update) {
          setIsEditMode(true);
        } else {
          setIsEditMode(false);
        }
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [update, isLoading]);

  const getdisplayLabel = (key) => {
    if (key == "employee_salary") {
      if (String(allFormValues.pay_type).toLowerCase() == "hourly") {
        return "Salary (Hourly)";
      }
      return "Salary (Per Annum)";
    }
  };

  const togglePasswordVisibility = (name) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  let isCurrentlyinaProject = String(allFormValues?.currently_in_project).toLowerCase() == "yes";

  useEffect(() => {
    if (update && isCurrentlyinaProject && isEditMode && innerActiveTab == 3) {
      setisProjectspopup(true);
    }
  }, [isCurrentlyinaProject]);

  useEffect(() => {
    if (isEmailError) {
      setInnerActiveTab(1);
      setValue("primary_email", "");
      setError("primary_email", { message: "Candidate with this email already exists" });
      setFocus("primary_email");
    }
  }, [isEmailError]);

  // Compute derived values
  const isvolunteer_work =
    allFormValues?.volunteer_work === true || String(allFormValues?.volunteer_work).toLowerCase() === "yes";

  const currently_in_project =
    allFormValues?.currently_in_project === true || String(allFormValues?.currently_in_project).toLowerCase() === "yes";

  const hide_salary = !currently_in_project && isvolunteer_work;

  // Current status logic
  const currentStatus = allFormValues.talent_status;
  const statusObj = {
    "Available Talent": {
      disabled: true,
      defaultValue: "Active",
      data: [{ value: "Active", text: "Active" }],
    },
    "Active Talent": {
      disabled: true,
      defaultValue: "Active",
      data: [{ value: "Active", text: "Active" }],
    },
    "Inactive Talent": {
      data: [
        { value: "Terminated", text: "Terminated" },
        { value: "Employer Change", text: "Employer Change" },
        { value: "On Hold", text: "On Hold" },
        { value: "Marketing Hold", text: "Marketing Hold" },
        { value: "Onboarding Rejected", text: "Onboarding Rejected" },
        { value: "Other", text: "Other" },
      ],
    },
    "Pending Talent": {
      data: [
        { value: "Pending Onboarding", text: "Pending Onboarding" },
        { value: "Pending Review", text: "Pending Review" },
        { value: "Onboarding Rejected", text: "Onboarding Rejected" },
      ],
    },
  };

  const current_status_list = statusObj[currentStatus]?.data || [];
  const disabledCurrent_status = statusObj[currentStatus]?.disabled;

  // US entry visa options
  const defaultUsEntryVisaOptions = [
    { value: "OPT", text: "OPT" },
    { value: "F1", text: "F1" },
    { value: "CPT", text: "CPT" },
    { value: "H1B", text: "H1B" },
    { value: "H4 EAD", text: "H4 EAD" },
    { value: "GC", text: "GC" },
    { value: "GC EAD", text: "GC EAD" },
    { value: "USC", text: "USC" },
    { value: "STEM OPT", text: "STEM OPT" },
    { value: "L2/L2 EAD", text: "L2/L2 EAD" },
  ];

  const us_entry_visa_options = [...defaultUsEntryVisaOptions];
  if (
    candidateData?.us_entry_visa &&
    !defaultUsEntryVisaOptions.some((opt) => opt.value === candidateData.us_entry_visa)
  ) {
    us_entry_visa_options.push({
      value: candidateData.us_entry_visa,
      text: candidateData.us_entry_visa,
    });
  }

  // Check if primary email changed
  const isChangedMailId = candidateData?.primary_email && candidateData.primary_email !== allFormValues?.primary_email;

  // Fetch location details based on zipcode
  useEffect(() => {
    if (isEditMode) {
      if (allFormValues?.candidate_zipcode?.length === 5) {
        setLoading(true);
        fetch("https://retrieve-location-details-v3-305451280005.us-east1.run.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            zip_code: allFormValues.candidate_zipcode,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setLoading(false);
            if (data) {
              const { city, state, country } = data?.data || {};

              if (city) {
                setValue("candidate_city", city, { shouldValidate: true });
              }
              if (state) {
                setValue("candidate_state", state, { shouldValidate: true });
              }
              if (country) {
                setValue("candidate_country", country, { shouldValidate: true });
              }
            }
          })
          .catch((error) => {
            setLoading(false);
            console.error("Failed to fetch location details", error);
          });
      }
    }
  }, [allFormValues.candidate_zipcode, setValue]);

  // Set current_status based on talent_status
  useEffect(() => {
    const defaultValue = statusObj[currentStatus]?.defaultValue;
    if (defaultValue?.length) {
      setValue("current_status", defaultValue, { shouldValidate: true });
    }
  }, [currentStatus, setValue]);

  // Reset form when candidateData changes
  useEffect(() => {
    reset(candidateData || {});
  }, [candidateData, reset]);

  // Define inner tab configurations
  const otherTabs = [
    {
      id: 1,
      name: "General",
      icon: User,
      categorized: generalInfo,
    },
    {
      id: 2,
      name: "Availability",
      icon: Calendar,
      categorized: availabilityArr,
    },
    {
      id: 3,
      name: "Project",
      icon: Briefcase,
      categorized: projectDetails,
    },
    {
      id: 4,
      name: "Work Auth",
      icon: Shield,
      categorized: work_authorization,
    },
  ];

  let bankingTab = [
    {
      id: 5,
      name: "Banking",
      icon: Building2,
      isCustom: true,
    },
  ];

  let innerTabs = otherTabs;

  if (update) {
    innerTabs = [...otherTabs, ...bankingTab];
  }

  const activeInnerTabData = innerTabs.find((tab) => tab.id === innerActiveTab);

  // Get options for select fields
  const getOptions = (propName) => {
    const propsMap = {
      current_status_list,
      us_entry_visa_options,
      recruitersBList,
      teamsData,
    };
    return propsMap[propName] || [];
  };

  const handleFormSubmit = (data) => {
    if (update && isChangedMailId && onEmailChangeConfirm) {
      onSubmit(data, true);
    } else {
      if (innerActiveTab == innerTabs?.length || update) {
        onSubmit(data, false);
      } else {
        setInnerActiveTab(innerActiveTab + 1);
      }
    }
  };

  // Format value for display
  const formatDisplayValue = (value, field) => {
    const isVisible = passwordVisibility[field.name];

    if (field.isPassword && value) {
      return isVisible ? String(value) : "*********";
    }

    if (value === null || value === undefined || value === "") return "N/A";

    if (field.type === "date" && value) {
      return pickDateOnly(value) ? formatDateToET(pickDateOnly(value)) : "N/A";
    }

    if (field.type === "select") {
      const options = field.optionsFromProp ? getOptions(field.optionsFromProp) : field.options;
      const found = options?.find((opt) => {
        const optValue = field?.keyMap?.value ? opt[field.keyMap.value] : opt.value;
        return String(optValue) === String(value);
      });
      if (found) return field?.keyMap?.text ? found[field.keyMap.text] : found.text;
    }

    return String(value);
  };

  const renderDisplayField = (field, value) => {
    const dynamicFlags = {
      hide_salary: hide_salary,
      disabledCurrent_status: disabledCurrent_status || disabled,
    };

    const shouldHide = field.hideKey && dynamicFlags[field.hideKey];
    if (shouldHide || field.hide) return null;

    const isPwd = field.isPassword === true;
    const isVisible = passwordVisibility[field.name];

    const displayValue = formatDisplayValue(value, field);

    const isBadge = field.isBadgeView === true && value;
    const badgeStyle = isBadge ? getBadgeStyle(value) : null;

    const normalizedValue = value === true || String(value).toLowerCase() === "yes";

    const shouldRenderTrueOptions = field?.trueOptions && normalizedValue === true;

    const shouldRenderFalseOptions = field?.falseOptions && normalizedValue === false;

    const shouldRenderOtherValues =
      allFormValues?.[field.name] && String(allFormValues?.[field.name]).toLowerCase() == "other" && field?.otherValues;

    return (
      <>
        <div className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-2"} style={{ fontSize: "12px" }}>
          <div style={{ color: "#67677e", textTransform: "uppercase" }}>
            {field.getdisplayLabel ? getdisplayLabel(field.name) : field.label}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#080118",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            className="text-base font-medium"
          >
            {isBadge ? (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  lineHeight: "18px",
                  textTransform: "uppercase",
                  background: badgeStyle.background,
                  color: badgeStyle.color,
                }}
              >
                {displayValue}
              </span>
            ) : (
              <span>{displayValue}</span>
            )}

            {isPwd && value && (
              <span
                onClick={() => togglePasswordVisibility(field.name)}
                style={{
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            )}
          </div>
        </div>

        {/* 🔹 OTHER VALUES (same as edit mode) */}
        {shouldRenderOtherValues
          ? field.otherValues.map((item) => renderDisplayField(item, allFormValues?.[item.name], allFormValues))
          : null}

        {/* 🔹 FALSE OPTIONS */}
        {shouldRenderFalseOptions
          ? field.falseOptions.map((item) => renderDisplayField(item, allFormValues?.[item.name], allFormValues))
          : null}

        {/* 🔹 TRUE OPTIONS */}
        {shouldRenderTrueOptions
          ? field.trueOptions.map((item) => renderDisplayField(item, allFormValues?.[item.name], allFormValues))
          : null}
      </>
    );
  };

  // Render individual field for edit mode
  const renderEditField = (field, props) => {
    const dynamicFlags = {
      hide_salary: hide_salary,
      disabledCurrent_status: disabledCurrent_status || disabled,
    };

    const shouldHide = field.hideKey && dynamicFlags[field.hideKey];
    const shouldDisable = field.disableKey && dynamicFlags[field.disableKey];
    let isRequired = field?.validation?.required;

    if (shouldHide || field.hide) return null;

    const value = allFormValues?.[field.name];

    const normalizedValue = value === true || String(value).toLowerCase() === "yes";

    const shouldRenderTrueOptions = field?.trueOptions && normalizedValue === true;

    const shouldRenderFalseOptions = field?.falseOptions && normalizedValue === false;

    const isPwd = field.isPassword === true;
    const isVisible = passwordVisibility[field.name];

    const inputType = isPwd ? (isVisible ? "text" : "password") : field.type;

    let mainField = null;

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        mainField = (
          <div className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-3"}>
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.getdisplayLabel ? getdisplayLabel(field.name) : field.label}{" "}
              {isRequired ? <span className="fw-bold text-red">*</span> : ""}
            </label>
            <div style={{ position: "relative" }}>
              <input
                disabled={disabled}
                className={`form-control bigHoverInput ${field.className ? styles[field.className] : ""} `}
                id={field.id}
                type={inputType}
                placeholder={field.placeholder || ""}
                {...register(field.name, field.validation)}
              />
              {isPwd && (
                <span
                  onClick={() => togglePasswordVisibility(field.name)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              )}
            </div>

            {errors[field.name] && <div className="text-danger font12">{errors[field.name].message}</div>}
          </div>
        );
        break;

      case "date":
        mainField = (
          <div style={{ zIndex: "5" }} className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-3"}>
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label} {isRequired ? <span className="fw-bold text-red">*</span> : ""}
            </label>
            <DatePicker
              maxDate={new Date("2099-12-31")}
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={50}
              selected={pickDateOnly(watch(field.name))}
              onChange={(date) => {
                if (date) {
                  const formatted = formatDateToET(date);
                  setValue(field.name, formatted, { shouldValidate: true });
                } else {
                  setValue(field.name, null, { shouldValidate: true });
                }
              }}
              dateFormat="MM/dd/yyyy"
              className={`form-control bigHoverInput `}
              placeholderText={field.placeholder || "MM/DD/YYYY"}
              id={field.id}
              disabled={disabled}
            />
            <input type="hidden" {...register(field.name, field.validation)} />
            {errors[field.name] && <div className="text-danger font12">{errors[field.name].message}</div>}
          </div>
        );
        break;

      case "textarea":
        mainField = (
          <div className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-3"}>
            <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
              {field.label} {isRequired ? <span className="fw-bold text-red">*</span> : ""}
            </label>
            <textarea
              disabled={disabled}
              className={`form-control bigHoverInput expandable-textarea ${field.className ? styles[field.className] : ""} `}
              id={field.id}
              type={field.type}
              placeholder={field.placeholder || ""}
              {...register(field.name, field.validation)}
            />
            {errors[field.name] && <div className="text-danger font12">{errors[field.name].message}</div>}
          </div>
        );
        break;

      case "select":
        mainField = (
          <>
            <div className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-3"}>
              <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
                {field.label} {isRequired ? <span className="fw-bold text-red">*</span> : ""}
              </label>

              <PremiumSelect
                options={(field.optionsFromProp
                  ? [field.defaultOption, ...getOptions(field.optionsFromProp)]
                  : field.options
                ).map((option) => {
                  const value = field?.keyMap?.value ? option[field.keyMap.value] : option.value;

                  const text = field?.keyMap?.text ? option[field.keyMap.text] : option.text;

                  return { value: String(value), text };
                })}
                value={String(allFormValues[field.name] || "")}
                onChange={(val) => {
                  if (field?.clear_key) {
                    setValue(field?.clear_key, null, { shouldValidate: true });
                  }
                  setValue(field.name, val, { shouldValidate: true });
                }}
                placeholder={field.placeholder || "Select..."}
                disabled={shouldDisable || disabled}
              />

              <input type="hidden" {...register(field.name, field.validation)} />

              {errors[field.name] && <div className="text-danger font12">{errors[field.name].message}</div>}
            </div>

            {allFormValues[field.name] &&
            String(allFormValues?.[field.name]).toLowerCase() == "other" &&
            field?.otherValues
              ? field.otherValues.map((item) =>
                  renderEditField(item, {
                    current_status_list,
                    us_entry_visa_options,
                    recruitersBList,
                    teamsData,
                  }),
                )
              : null}
          </>
        );
        break;

      case "selectsearch":
        const selectData = (
          field.optionsFromProp ? [field.defaultOption, ...getOptions(field.optionsFromProp)] : field.options
        ).map((option) => {
          const value = field?.keyMap?.value ? option[field.keyMap.value] : option.value;
          const label = field?.keyMap?.text ? option[field.keyMap.text] : option.text;

          return {
            value: String(value),
            label: label,
          };
        });

        mainField = (
          <>
            <div className={field?.parentClass || "col-lg-4 col-md-6 col-xl-3 mb-3"}>
              <label className={`form-label ${styles.formlabel}`} htmlFor={field.id}>
                {field.label} {isRequired ? <span className="fw-bold text-red">*</span> : ""}
              </label>

              <div className="w-100">
                <SelectPicker
                  id={field.id}
                  cleanable={false}
                  data={selectData}
                  className="bigHoverInputr w-100"
                  value={allFormValues[field.name] || ""}
                  onChange={(value, item) => {
                    setValue(field.name, value, { shouldValidate: true });
                  }}
                  disabled={shouldDisable || disabled}
                  style={{ color: "black" }}
                  placeholder={field.placeholder || "Select..."}
                  labelKey="label"
                  valueKey="value"
                  placement="autoVertical"
                />
              </div>

              <input type="hidden" {...register(field.name, field.validation)} />

              {errors[field.name] && <div className="text-danger font12">{errors[field.name].message}</div>}
            </div>

            {allFormValues[field.name] &&
            String(allFormValues[field.name]).toLowerCase() == "other" &&
            field?.otherValues
              ? field.otherValues.map((item) =>
                  renderEditField(item, {
                    current_status_list,
                    us_entry_visa_options,
                    recruitersBList,
                    teamsData,
                  }),
                )
              : null}
          </>
        );
        break;

      default:
        mainField = null;
    }

    return (
      <>
        {mainField}

        {shouldRenderFalseOptions
          ? field.falseOptions.map((item, index) =>
              renderEditField(item, {
                current_status_list,
                us_entry_visa_options,
                recruitersBList,
                teamsData,
              }),
            )
          : null}

        {shouldRenderTrueOptions
          ? field.trueOptions.map((item, index) =>
              renderEditField(item, {
                current_status_list,
                us_entry_visa_options,
                recruitersBList,
                teamsData,
              }),
            )
          : null}
      </>
    );
  };

  // Render a categorized section
  const renderCategorizedSection = (sectionKey, fields, props) => {
    if (!fields || fields.length === 0) return null;

    return (
      <div className="mb-3 p-3 py-2 border rounded-[12px]" key={sectionKey}>
        <h6
          className="mb-2 pb-1 fw-semibold"
          style={{ fontSize: "12px", color: "#67677e", textTransform: "uppercase" }}
        >
          {sectionTitles[sectionKey] || sectionKey}
        </h6>
        <div className="row">
          {fields.map((field) => (
            <>
              {isEditMode ? (
                renderEditField(field, props)
              ) : (
                <>{renderDisplayField(field, allFormValues[field.name], props)}</>
              )}
            </>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="signatureContainer">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {update ? (
          <>
            <div className="my-3">
              <div className="flex items-center justify-content-between gap-2">
                {candidateData?.talent_status ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-[500px] border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#7c3bed] text-white hover:bg-[#7c3bedea]">
                      {candidateData?.talent_status || "N/A"}
                    </div>
                    <div className="inline-flex items-center rounded-[500px] border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                      {candidateData?.visa_status || "N/A"}
                    </div>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  {update && !disabled && (
                    <div
                      className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-background hover:text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#3c83f6] pointer"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? (
                        <>
                          <X size={15} strokeWidth={3} />
                          <span> Cancel </span>
                        </>
                      ) : (
                        <>
                          <Pen size={14} strokeWidth={3} />
                          <span> Edit </span>
                        </>
                      )}
                    </div>
                  )}

                  {isEditMode && update && (
                    <>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-[#7c3bed] text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#7c3bedea]"
                        onClick={() => {
                          handleSubmit(handleFormSubmit);
                        }}
                      >
                        <Save size={15} strokeWidth={3} />
                        <span> {isLoading || loading ? "Loading..." : update ? "Save" : "Continue"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-[#e7e7ef] h-[1px] w-full">{/* sep line */}</div>
          </>
        ) : (
          <></>
        )}

        <div className={`px-0 mb-0 pb-0 ${styles.tabcontentcontainerMain}`}>
          <div className={`${styles.tabinfo} ${styles.tabinfoActive}`}>
            <div className={`${styles.horizontalScroll}`}>
              <div className="d-flex align-items-center gap-2 justify-content-between w-100 mb-3">
                <div className={styles.canFormTab}>
                  {innerTabs.map((tab) => {
                    let Icon = tab.icon;
                    return (
                      <div
                        key={tab.id}
                        type="button"
                        className={`d-flex gap-[6px] align-items-center ${styles.canTabBtn} ${innerActiveTab === tab.id ? styles.activeCanBtn : ""}`}
                        onClick={() => {
                          if (update) {
                            setInnerActiveTab(tab.id);
                          }
                        }}
                      >
                        <Icon size={13} />
                        <p className={styles.canBtnText}>{tab.name}</p>
                      </div>
                    );
                  })}
                </div>

                {!update && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-background hover:text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#3c83f6]"
                      disabled={innerActiveTab == 1}
                      onClick={() => {
                        if (innerActiveTab > 1) {
                          setInnerActiveTab(innerActiveTab - 1);
                        }
                      }}
                    >
                      <ArrowLeft size={15} strokeWidth={3} />
                      <span> Back </span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-[#7c3bed] text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#7c3bedea]"
                      onClick={() => {
                        handleSubmit(handleFormSubmit);
                      }}
                    >
                      <Save size={15} strokeWidth={3} />
                      <span> {isLoading || loading ? "Loading..." : update ? "Save & Close" : "Continue"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            {activeInnerTabData.isCustom ? (
              <BankingInfo candidateDetails={candidateData} />
            ) : (
              <>
                {activeInnerTabData.categorized &&
                  Object.keys(activeInnerTabData.categorized).map((sectionKey) =>
                    renderCategorizedSection(sectionKey, activeInnerTabData.categorized[sectionKey], {
                      current_status_list,
                      us_entry_visa_options,
                      recruitersBList,
                      teamsData,
                    }),
                  )}
              </>
            )}
          </div>
        </div>
      </form>
      <AddProjectDialog
        open={isProjectspopup}
        onAdd={() => {
          setisProjectspopup(false);
          onProjectsChange?.();
        }}
        onLater={() => setisProjectspopup(false)}
      />

      <ThemeLoader fixed show={loading} />
    </div>
  );
};

export default AllForms;
