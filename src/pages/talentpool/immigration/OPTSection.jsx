import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  AlertTriangle,
  GraduationCap,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Trash2,
  Circle,
} from "lucide-react";
import { getDegreeLevelLabel, getEADCategoryLabel } from "./types/opt-records";
import { DEGREE_LEVELS, US_STATES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { getSectionDoc, SECTION_DOC_TYPES } from "./documentLinkingUtils";
import { DocBadgeInline } from "./DocBadge";

// STEM OPT Status options
const STEM_OPT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "applied", label: "Applied" },
  { value: "approved", label: "Approved" },
  { value: "not_applied", label: "Not Applied" },
  { value: "withdrawn", label: "Withdrawn" },
];

// OPT Type options
const OPT_TYPES = [
  { value: "pre_completion", label: "Pre-Completion OPT" },
  { value: "post_completion", label: "Post-Completion OPT (Initial)" },
  { value: "stem_opt", label: "STEM OPT Extension" },
];

// EAD Category options for OPT
const OPT_EAD_CATEGORIES = [
  { value: "C03A", label: "C03A - Pre-Completion OPT" },
  { value: "C03B", label: "C03B - Post-Completion OPT" },
  { value: "C03C", label: "C03C - STEM OPT Extension" },
  { value: "OTHER", label: "Other" },
];

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-[#67677e] uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-foreground">{value?.toString() || "—"}</dd>
  </div>
);

const EditField = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  disabled = false,
  className = "",
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <Input
      type={type}
      value={value?.toString() || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-9"
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      disabled={disabled}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const EADCategorySelect = ({ value, onChange, optType }) => {
  const isOther = value === "OTHER" || (value && !OPT_EAD_CATEGORIES.some((c) => c.value === value));
  const selectValue = isOther ? "OTHER" : value || "";
  const [customValue, setCustomValue] = useState(isOther && value !== "OTHER" ? value : "");

  const getSuggestedCategory = () => {
    switch (optType) {
      case "pre_completion":
        return "C03A";
      case "post_completion":
        return "C03B";
      case "stem_opt":
        return "C03C";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">EAD Category</label>
      <div className="!space-y-2">
        <Select
          value={selectValue}
          onValueChange={(v) => {
            if (v === "OTHER") {
              onChange(customValue || "OTHER");
            } else {
              onChange(v);
              setCustomValue("");
            }
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={`Select category (suggested: ${getSuggestedCategory()})`} />
          </SelectTrigger>
          <SelectContent>
            {OPT_EAD_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isOther && (
          <Input
            value={customValue}
            onChange={(e) => {
              setCustomValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Enter custom category code"
            className="h-9"
          />
        )}
      </div>
    </div>
  );
};

const getEmptyOPTData = () => ({
  school_name: "",
  sevis_school_code: "",
  sevis_number: "",
  program_start_date: "",
  program_end_date: "",
  degree_level: "bachelors",
  major: "",
  cip_code: "",
  stem_eligible: false,
  dso_name: "",
  dso_email: "",
  opt_type: "post_completion",
  opt_application_date: "",
  opt_receipt_number: "",
  opt_start_date: "",
  opt_end_date: "",
  opt_ead_category: "",
  unemployment_days_used: 0,
  stem_opt_applied: false,
  cap_gap_extension: false,
  i983_submitted: false,
  employer_change_reported: false,
  address_change_reported: false,
});

const calculateEvaluationDates = (stemStartDate) => {
  if (!stemStartDate) return { sixMonth: "", twelveMonth: "", final: "" };
  const startDate = new Date(stemStartDate);
  const sixMonthDate = new Date(startDate);
  sixMonthDate.setMonth(sixMonthDate.getMonth() + 6);
  const twelveMonthDate = new Date(startDate);
  twelveMonthDate.setMonth(twelveMonthDate.getMonth() + 12);
  const finalDate = new Date(startDate);
  finalDate.setMonth(finalDate.getMonth() + 24);
  const formatDate = (date) => date.toISOString().split("T")[0];
  return { sixMonth: formatDate(sixMonthDate), twelveMonth: formatDate(twelveMonthDate), final: formatDate(finalDate) };
};

export function OPTSection({
  data,
  isEditing,
  onChange,
  candidateEmail,
  candidateId,
  visaType,
  onEADDataExtracted,
  currentI20,
  currentEAD,
  allEADRecords,
  allI20Records,
  i983Records,
  onI20DataExtracted,
  onSaveI20,
  onSaveEAD,
  onSaveI983,
  onI983DataExtracted,
  onRefreshData,
  onDeleteI20,
  onDeleteEAD,
  onDeleteI983,
  onI983Change,
  onUpdateEvaluation,
  onAddI983,
  onSaveStemOptToggle,
  documents = [],
  onViewDocument,
}) {
  const [stemOptStatusSelection, setStemOptStatusSelection] = useState(null);
  const [showStemOffConfirm, setShowStemOffConfirm] = useState(false);
  const effectiveData = data || (isEditing ? getEmptyOPTData() : null);

  if (!data && !isEditing) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-[#67677e]">No OPT information available.</CardContent>
      </Card>
    );
  }
  function handleViewDoc(filename) {
    onViewDocument(filename);
  }

  const stateOptions = US_STATES.map((s) => ({ value: s.code, label: s.name }));

  const handleChange = (field, value) => {
    const updatedData = { ...effectiveData, [field]: value };
    if (field === "opt_type") {
      if (value === "stem_opt") {
        updatedData.stem_opt_applied = true;
        updatedData.stem_eligible = true;
      }
    }
    if (field === "stem_opt_start_date" && value) {
      const evalDates = calculateEvaluationDates(value);
      updatedData.i983_6month_evaluation_due = evalDates.sixMonth;
      updatedData.i983_12month_evaluation_due = evalDates.twelveMonth;
      updatedData.i983_final_evaluation_due = evalDates.final;
    }
    onChange(updatedData);
  };

  const showTrainingPlan =
    effectiveData.opt_type === "stem_opt" ||
    (effectiveData.opt_type === "post_completion" && effectiveData.stem_opt_applied);

  const normalizeDegreeLevelValue = (level) => {
    if (!level) return undefined;
    const normalized = level.toLowerCase();
    if (normalized === "master" || normalized === "master's") return "masters";
    if (normalized === "bachelor" || normalized === "bachelor's") return "bachelors";
    if (normalized === "associate" || normalized === "associate's") return "associate";
    if (normalized === "doctorate" || normalized === "doctoral") return "phd";
    return normalized;
  };

  const schoolInfo = {
    school_name: currentI20?.school_name || effectiveData.school_name,
    school_state: currentI20?.school_state || effectiveData.school_state,
    school_address: currentI20?.school_address,
    sevis_school_code: currentI20?.sevis_school_code || currentI20?.school_code || effectiveData.sevis_school_code,
    sevis_number: currentI20?.sevis_number || effectiveData.sevis_number,
    student_name: currentI20?.student_name,
    degree_level: normalizeDegreeLevelValue(currentI20?.degree_level) || effectiveData.degree_level,
    major: currentI20?.program || effectiveData.major,
    cip_code: currentI20?.cip_code || effectiveData.cip_code,
    stem_eligible: currentI20?.stem_eligible ?? effectiveData.stem_eligible,
    stem_opt_recommended: currentI20?.stem_opt_recommended,
    program_start_date: currentI20?.program_start_date || effectiveData.program_start_date,
    program_end_date: currentI20?.program_end_date || effectiveData.program_end_date,
    opt_start_date: currentI20?.opt_start_date,
    opt_end_date: currentI20?.opt_end_date,
    dso_name: currentI20?.dso_name || effectiveData.dso_name,
    dso_email: currentI20?.dso_email || effectiveData.dso_email,
    dso_phone: currentI20?.dso_phone || effectiveData.dso_phone,
    date_of_birth: currentI20?.date_of_birth,
    country_of_birth: currentI20?.country_of_birth,
    country_of_citizenship: currentI20?.country_of_citizenship,
    i20_type: currentI20?.i20_type,
  };

  const eadInfo = {
    ead_number: currentEAD?.ead_number || effectiveData.opt_receipt_number,
    ead_category: currentEAD?.ead_category || effectiveData.opt_ead_category,
    card_issue_date: currentEAD?.card_issue_date,
    card_valid_from: currentEAD?.card_valid_from,
    card_expiry_date: currentEAD?.card_expiry_date || effectiveData.opt_end_date,
    a_number: currentEAD?.a_number,
    status: currentEAD?.status,
    card_holder_name: currentEAD?.card_holder_name,
    terms_and_conditions: currentEAD?.terms_and_conditions,
    is_combo_card: currentEAD?.is_combo_card,
    has_advance_parole: currentEAD?.has_advance_parole,
    country_of_birth: currentEAD?.country_of_birth,
    date_of_birth: currentEAD?.date_of_birth,
    visa_type_inferred: currentEAD?.visa_type_inferred,
  };

  const getOPTTypeLabel = () => {
    const type = OPT_TYPES.find((t) => t.value === effectiveData.opt_type);
    return type?.label || effectiveData.opt_type?.replace(/_/g, " ");
  };

  const stemEADRecord = allEADRecords?.find((ead) => ead.ead_category === "C03C");
  const hasStemEADApproved = !!stemEADRecord;
  const stemI20Record = allI20Records?.find((i20) => i20.i20_type === "stem_extension");
  const hasStemI20Uploaded = !!stemI20Record;
  const currentI983 = i983Records?.[0];
  const hasI983Uploaded = !!currentI983;
  const derivedStemOptStatus = hasStemEADApproved ? "approved" : effectiveData.stem_opt_applied ? "pending" : null;
  const effectiveStemOptStatus = stemOptStatusSelection || derivedStemOptStatus;
  const isStemEligible =
    schoolInfo.stem_eligible || effectiveData.stem_eligible || effectiveData.stem_opt_applied || hasStemEADApproved;

  const getDefaultAccordionValues = () => {
    switch (visaType) {
      case "CPT":
        return ["school", "opt"];
      case "F1":
        return ["school", "opt", "stem"];
      case "OPT":
        return ["opt", "stem"];
      case "STEM_OPT":
        return ["stem", "opt"];
      default:
        return ["opt", "stem"];
    }
  };

  const getI983EvalTimeline = () => {
    if (!currentI983) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const getDaysUntil = (dateStr) => {
      if (!dateStr) return null;
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      const [, y, m, d] = match;
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };
    return [
      {
        label: "6-Month",
        due: currentI983.eval_6month_due,
        completed: currentI983.eval_6month_completed,
        completedDate: currentI983.eval_6month_completed_date,
        daysUntil: getDaysUntil(currentI983.eval_6month_due),
      },
      {
        label: "12-Month",
        due: currentI983.eval_12month_due,
        completed: currentI983.eval_12month_completed,
        completedDate: currentI983.eval_12month_completed_date,
        daysUntil: getDaysUntil(currentI983.eval_12month_due),
      },
      {
        label: "Final",
        due: currentI983.eval_final_due,
        completed: currentI983.eval_final_completed,
        completedDate: currentI983.eval_final_completed_date,
        daysUntil: getDaysUntil(currentI983.eval_final_due),
      },
    ];
  };

  const i983EvalTimeline = getI983EvalTimeline();

  const handleI983FieldChange = (field, value) => {
    if (onI983Change && currentI983) {
      onI983Change({ ...currentI983, [field]: value });
    }
  };

  const evalTypeMap = { "6-Month": "6month", "12-Month": "12month", Final: "final" };

  const renderI983InlineDetails = () => {
    if (!currentI983 || !hasI983Uploaded) return null;
    if (isEditing && onI983Change) {
      return (
        <div className=" mt-1 mb-2 p-3 border rounded-lg bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="Employer Name"
              value={currentI983.employer_name}
              onChange={(v) => handleI983FieldChange("employer_name", v)}
            />
            <EditField
              label="Job Title"
              value={currentI983.job_title}
              onChange={(v) => handleI983FieldChange("job_title", v)}
            />
            <EditField
              label="Training Start"
              value={currentI983.training_start_date}
              onChange={(v) => handleI983FieldChange("training_start_date", v)}
              type="date"
            />
            <EditField
              label="Training End"
              value={currentI983.training_end_date}
              onChange={(v) => handleI983FieldChange("training_end_date", v)}
              type="date"
            />
            <EditField
              label="Compensation"
              value={currentI983.compensation}
              onChange={(v) => handleI983FieldChange("compensation", v)}
            />
            <EditField
              label="Hours/Week"
              value={currentI983.hours_per_week}
              onChange={(v) => handleI983FieldChange("hours_per_week", parseInt(v) || 0)}
              type="number"
            />
          </div>
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-2">Supervisor</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <EditField
                label="Name"
                value={currentI983.supervisor_name}
                onChange={(v) => handleI983FieldChange("supervisor_name", v)}
              />
              <EditField
                label="Title"
                value={currentI983.supervisor_title}
                onChange={(v) => handleI983FieldChange("supervisor_title", v)}
              />
              <EditField
                label="Email"
                value={currentI983.supervisor_email}
                onChange={(v) => handleI983FieldChange("supervisor_email", v)}
              />
              <EditField
                label="Phone"
                value={currentI983.supervisor_phone}
                onChange={(v) => handleI983FieldChange("supervisor_phone", v)}
              />
            </div>
          </div>
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-2">Employer Details</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <EditField
                label="EIN"
                value={currentI983.employer_ein}
                onChange={(v) => handleI983FieldChange("employer_ein", v)}
              />
              <EditField
                label="NAICS Code"
                value={currentI983.employer_naics_code}
                onChange={(v) => handleI983FieldChange("employer_naics_code", v)}
              />
              <EditField
                label="E-Verify ID"
                value={currentI983.employer_e_verify_company_id}
                onChange={(v) => handleI983FieldChange("employer_e_verify_company_id", v)}
              />
              <div className="col-span-2 md:col-span-3">
                <EditField
                  label="Address"
                  value={currentI983.employer_address}
                  onChange={(v) => handleI983FieldChange("employer_address", v)}
                />
              </div>
            </div>
          </div>
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Training Goals</label>
              <Textarea
                value={currentI983.training_goals || ""}
                onChange={(e) => handleI983FieldChange("training_goals", e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Training Activities</label>
              <Textarea
                value={currentI983.training_activities || ""}
                onChange={(e) => handleI983FieldChange("training_activities", e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={currentI983.submitted || false}
                onCheckedChange={(v) => handleI983FieldChange("submitted", v)}
              />
              <Label className="text-sm">Submitted</Label>
            </div>
            {currentI983.submitted && (
              <EditField
                label="Submitted Date"
                value={currentI983.submitted_date}
                onChange={(v) => handleI983FieldChange("submitted_date", v)}
                type="date"
                className="flex-1"
              />
            )}
          </div>
        </div>
      );
    }
    // Read-only display
    return (
      <div className=" mt-1 mb-2 p-3 border rounded-lg bg-muted/20 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-medium">{currentI983.employer_name || "Unknown Employer"}</span>
            {currentI983.submitted ? (
              <Badge variant="default" className="text-xs bg-green-600 ml-2">
                Submitted
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs ml-2">
                Not Submitted
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {currentI983.job_title && (
            <div>
              <p className="text-xs text-[#67677e]">Job Title</p>
              <p className="font-medium mt-0 text-[#080118]">{currentI983.job_title}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#67677e]">Training Period</p>
            <p className="font-medium mt-0 text-[#080118]">
              {formatDateSafe(currentI983.training_start_date)} → {formatDateSafe(currentI983.training_end_date)}
            </p>
          </div>
          {currentI983.compensation && (
            <div>
              <p className="text-xs text-[#67677e]">Compensation</p>
              <p className="font-medium mt-0 text-[#080118]">{currentI983.compensation}</p>
            </div>
          )}
          {currentI983.hours_per_week && (
            <div>
              <p className="text-xs text-[#67677e]">Hours/Week</p>
              <p className="font-medium mt-0 text-[#080118]">{currentI983.hours_per_week}</p>
            </div>
          )}
        </div>
        {(currentI983.supervisor_name || currentI983.supervisor_email) && (
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-1">Supervisor</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {currentI983.supervisor_name && (
                <div>
                  <p className="text-xs text-[#67677e]">Name</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.supervisor_name}</p>
                </div>
              )}
              {currentI983.supervisor_title && (
                <div>
                  <p className="text-xs text-[#67677e]">Title</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.supervisor_title}</p>
                </div>
              )}
              {currentI983.supervisor_email && (
                <div className="min-w-0">
                  <p className="text-xs text-[#67677e]">Email</p>
                  <p className="font-medium mt-0 text-[#080118] text-[#7c3bed] truncate">
                    {currentI983.supervisor_email}
                  </p>
                </div>
              )}
              {currentI983.supervisor_phone && (
                <div>
                  <p className="text-xs text-[#67677e]">Phone</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.supervisor_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {(currentI983.employer_ein || currentI983.employer_naics_code || currentI983.employer_e_verify_company_id) && (
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-1">Employer Details</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {currentI983.employer_ein && (
                <div>
                  <p className="text-xs text-[#67677e]">EIN</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.employer_ein}</p>
                </div>
              )}
              {currentI983.employer_naics_code && (
                <div>
                  <p className="text-xs text-[#67677e]">NAICS Code</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.employer_naics_code}</p>
                </div>
              )}
              {currentI983.employer_e_verify_company_id && (
                <div>
                  <p className="text-xs text-[#67677e]">E-Verify ID</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.employer_e_verify_company_id}</p>
                </div>
              )}
              {currentI983.employer_address && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs text-[#67677e]">Address</p>
                  <p className="font-medium mt-0 text-[#080118]">{currentI983.employer_address}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {currentI983.training_goals && (
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-1">Training Goals</p>
            <p className="text-sm text-[#67677e] leading-relaxed">{currentI983.training_goals}</p>
          </div>
        )}
        {currentI983.training_activities && (
          <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-2">
            <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-1">Training Activities</p>
            <p className="text-sm text-[#67677e] leading-relaxed">{currentI983.training_activities}</p>
          </div>
        )}
      </div>
    );
  };

  const renderI983EvalTimeline = () => {
    if (!i983EvalTimeline || !hasI983Uploaded || !currentI983) return null;
    return (
      <div className="mt-1 mb-2 p-3 border rounded-lg bg-muted/20">
        <p className="text-xs font-medium text-[#67677e] uppercase tracking-wide mb-2">Evaluation Timeline</p>
        <div className="grid grid-cols-3 gap-2">
          {i983EvalTimeline.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 p-2 rounded-xl ${item.completed ? "bg-green-50 dark:bg-green-950/20" : ""}`}
            >
              {onUpdateEvaluation ? (
                <Switch
                  checked={item.completed || false}
                  onCheckedChange={(checked) => {
                    const today = new Date().toISOString().split("T")[0];
                    onUpdateEvaluation(currentI983.id, evalTypeMap[item.label], checked, checked ? today : undefined);
                  }}
                />
              ) : item.completed ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-[#67677e] shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium">{item.label}</p>
                <p
                  className={`text-xs mt-1 ${item.completed ? "!text-green-600" : item.daysUntil !== null && item.daysUntil < 0 ? "!text-red-500 font-medium" : item.daysUntil !== null && item.daysUntil <= 30 ? "!text-amber-600 font-medium" : "!text-[#67677e]"}`}
                >
                  {item.completed
                    ? `Done ${formatDateSafe(item.completedDate)}`
                    : item.due
                      ? formatDateSafe(item.due)
                      : "Not set"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const schoolSummary = [
    schoolInfo.school_name,
    schoolInfo.degree_level ? getDegreeLevelLabel(schoolInfo.degree_level) : null,
    schoolInfo.major ? `in ${schoolInfo.major}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  // Helper to render STEM document upload row
  const renderDocUploadRow = (icon, title, subtitle, isUploaded, uploadButton, deleteButton, docType = null) => {
    const linkedDoc = docType ? getSectionDoc(documents, null, docType) : null;
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <span className="text-sm font-medium">{title}</span>
            <p className="text-xs text-[#67677e]">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {linkedDoc && candidateEmail && (
            <DocBadgeInline doc={linkedDoc} candidateEmail={candidateEmail} handleViewDoc={handleViewDoc} />
          )}
          {isUploaded ? (
            <Badge variant="outline" className="!border-green-600 !text-green-700 dark:!text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 !text-amber-700 dark:!text-amber-400">
              <Clock className="h-3 w-3 mr-1" />
              Missing
            </Badge>
          )}
          {uploadButton}
          {deleteButton}
        </div>
      </div>
    );
  };

  const handleSaveOptEadFromUpload = async (rawExtractedData, fileInfo) => {
    if (!onSaveEAD) return false;
    return onSaveEAD(rawExtractedData, fileInfo, true);
  };

  const stemI20UploadBtn =
    candidateEmail && onSaveI20 ? (
      <SmartUploadButton
        documentType="i20"
        label="Smart Upload I-20"
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        onDataExtracted={onI20DataExtracted || (() => {})}
        onRawDataExtracted={onSaveI20}
        onRefreshData={onRefreshData}
        size="sm"
        variant="outline"
        className="h-7 text-xs"
      />
    ) : null;

  const i983UploadBtn =
    candidateEmail && onSaveI983 ? (
      <SmartUploadButton
        documentType="i983"
        label="Smart Upload I-983"
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        onDataExtracted={onI983DataExtracted || (() => {})}
        onRawDataExtracted={onSaveI983}
        onRefreshData={onRefreshData}
        size="sm"
        variant="outline"
        className="h-7 text-xs"
      />
    ) : null;

  const i983DeleteBtn =
    currentI983 && onDeleteI983 ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
        onClick={() => onDeleteI983(currentI983.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    ) : null;

  const stemEadUploadBtn =
    candidateEmail && onSaveEAD ? (
      <SmartUploadButton
        documentType="ead_card"
        label="Smart Upload STEM EAD"
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        onDataExtracted={onEADDataExtracted || (() => {})}
        onRawDataExtracted={handleSaveOptEadFromUpload}
        onRefreshData={onRefreshData}
        size="sm"
        variant="outline"
        className="h-7 text-xs"
      />
    ) : null;

  const renderStemEADCard = (ead) => {
    const daysUntilExpiry = ead.card_expiry_date
      ? (() => {
          const match = ead.card_expiry_date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!match) return null;
          const [, year, month, day] = match;
          const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        })()
      : null;
    const isExpired = ead.status === "expired" || (daysUntilExpiry !== null && daysUntilExpiry < 0);
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
    const statusVariant =
      ead.status === "active" && !isExpired ? "default" : ead.status === "pending" ? "secondary" : "red-500";

    return (
      <Card className={`p-4 border-[#7c3bed]/50 bg-[#7c3bed]/5 ${isExpired ? "border-red-500/50" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CreditCard className="h-4 w-4 text-[#7c3bed]" />
            <span className="font-medium text-sm">{ead.ead_number || "STEM OPT EAD"}</span>
            <Badge className="bg-[#7c3bed] text-[#7c3bed]-foreground text-xs">CURRENT</Badge>
            <Badge variant={statusVariant} className="text-xs">
              {isExpired
                ? "Expired"
                : ead.status === "active"
                  ? "Active"
                  : ead.status === "pending"
                    ? "Pending"
                    : ead.status || "Active"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getEADCategoryLabel(ead.ead_category || "C03C")}
            </Badge>
            {isExpiringSoon && !isExpired && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                Expires in {daysUntilExpiry} days
              </Badge>
            )}
            {(() => {
              const linkedDoc = getSectionDoc(documents, ead.document_file_name, SECTION_DOC_TYPES.ead_card);
              return linkedDoc && candidateEmail ? (
                <DocBadgeInline doc={linkedDoc} candidateEmail={candidateEmail} handleViewDoc={handleViewDoc} />
              ) : null;
            })()}
          </div>
          {onDeleteEAD && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => onDeleteEAD(ead.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {ead.card_holder_name && (
            <div>
              <p className="text-xs text-[#67677e]">Card Holder</p>
              <p className="font-medium">{ead.card_holder_name}</p>
            </div>
          )}
          {ead.a_number && (
            <div>
              <p className="text-xs text-[#67677e]">A-Number</p>
              <p className="font-medium">{ead.a_number}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#67677e]">Issue Date</p>
            <p className="font-medium">{formatDateSafe(ead.card_issue_date || ead.card_valid_from)}</p>
          </div>
          <div>
            <p className="text-xs text-[#67677e]">Expiry Date</p>
            <p className={`font-medium ${isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-600" : ""}`}>
              {formatDateSafe(ead.card_expiry_date)}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={getDefaultAccordionValues()} className="space-y-4">
        {/* School/Program Information */}
        <AccordionItem value="school" className="border rounded-lg px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <AccordionTrigger className="hover:no-underline pr-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#67677e]" />
                  <span className="font-medium">School/Program Information</span>
                  {schoolSummary && !["F1", "CPT"].includes(visaType || "") && (
                    <span className="text-xs text-[#67677e] ml-2 hidden group-data-[state=closed]:inline truncate max-w-[400px]">
                      {schoolSummary}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
            </div>
            {candidateEmail && onI20DataExtracted && (
              <SmartUploadButton
                documentType="i20"
                label="Smart Upload I-20"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onI20DataExtracted}
                onRawDataExtracted={onSaveI20}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
          </div>
          <AccordionContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
                <div className="col-span-2">
                  <EditField
                    label="School Name"
                    value={effectiveData.school_name || schoolInfo.school_name}
                    onChange={(v) => handleChange("school_name", v)}
                    required
                  />
                </div>
                <SelectField
                  label="State"
                  value={effectiveData.school_state || schoolInfo.school_state}
                  onChange={(v) => handleChange("school_state", v)}
                  options={stateOptions}
                />
                <EditField
                  label="SEVIS School Code"
                  value={effectiveData.sevis_school_code || schoolInfo.sevis_school_code}
                  onChange={(v) => handleChange("sevis_school_code", v)}
                  required
                  placeholder="XXX#####"
                />
                <EditField
                  label="SEVIS Number"
                  value={effectiveData.sevis_number || schoolInfo.sevis_number}
                  onChange={(v) => handleChange("sevis_number", v)}
                  required
                  placeholder="N00XXXXXXXX"
                />
                <SelectField
                  label="Degree Level"
                  value={effectiveData.degree_level || schoolInfo.degree_level}
                  onChange={(v) => handleChange("degree_level", v)}
                  options={DEGREE_LEVELS}
                  required
                />
                <EditField
                  label="Major"
                  value={effectiveData.major || schoolInfo.major}
                  onChange={(v) => handleChange("major", v)}
                  required
                />
                <EditField
                  label="CIP Code"
                  value={effectiveData.cip_code || schoolInfo.cip_code}
                  onChange={(v) => handleChange("cip_code", v)}
                  required
                  placeholder="XX.XXXX"
                />
                <EditField
                  label="Program Start Date"
                  value={effectiveData.program_start_date || schoolInfo.program_start_date}
                  onChange={(v) => handleChange("program_start_date", v)}
                  type="date"
                  required
                />
                <EditField
                  label="Program End Date"
                  value={effectiveData.program_end_date || schoolInfo.program_end_date}
                  onChange={(v) => handleChange("program_end_date", v)}
                  type="date"
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">STEM Eligible</label>
                  <div className="flex items-center h-9 gap-2">
                    <Switch
                      checked={effectiveData.stem_eligible ?? schoolInfo.stem_eligible}
                      onCheckedChange={(v) => handleChange("stem_eligible", v)}
                    />
                    <Label className="text-sm">Yes</Label>
                  </div>
                </div>
                <EditField
                  label="DSO Name"
                  value={effectiveData.dso_name || schoolInfo.dso_name}
                  onChange={(v) => handleChange("dso_name", v)}
                  required
                />
                <EditField
                  label="DSO Email"
                  value={effectiveData.dso_email || schoolInfo.dso_email}
                  onChange={(v) => handleChange("dso_email", v)}
                  required
                />
                <EditField
                  label="DSO Phone"
                  value={effectiveData.dso_phone || schoolInfo.dso_phone}
                  onChange={(v) => handleChange("dso_phone", v)}
                />
                <EditField
                  label="School Address"
                  value={effectiveData.school_address || schoolInfo.school_address}
                  onChange={(v) => handleChange("school_address", v)}
                  className="col-span-2"
                />
                <EditField
                  label="Student Name"
                  value={effectiveData.student_name || schoolInfo.student_name}
                  onChange={(v) => handleChange("student_name", v)}
                />
                <EditField
                  label="OPT Start Date"
                  value={effectiveData.opt_start_date || schoolInfo.opt_start_date}
                  onChange={(v) => handleChange("opt_start_date", v)}
                  type="date"
                />
                <EditField
                  label="OPT End Date"
                  value={effectiveData.opt_end_date || schoolInfo.opt_end_date}
                  onChange={(v) => handleChange("opt_end_date", v)}
                  type="date"
                />
              </div>
            ) : (
              <Card className="border-[#7c3bed]/50 bg-[#7c3bed0d] p-3 mt-2 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-[#763bed] text-white text-xs">I-20</Badge>
                    {schoolInfo.sevis_number && (
                      <span className="font-mono font-medium text-sm">{schoolInfo.sevis_number}</span>
                    )}
                    {schoolInfo.i20_type && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {schoolInfo.i20_type.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {schoolInfo.stem_eligible && (
                      <Badge variant="outline" className="text-xs !border-green-500 !text-green-700">
                        STEM Eligible
                      </Badge>
                    )}
                    {schoolInfo.stem_opt_recommended && (
                      <Badge variant="outline" className="text-xs !border-green-500 !text-green-700">
                        STEM OPT
                      </Badge>
                    )}
                    {(() => {
                      const linkedDoc = getSectionDoc(documents, currentI20?.document_file_name, SECTION_DOC_TYPES.i20);
                      return linkedDoc && candidateEmail ? (
                        <DocBadgeInline doc={linkedDoc} candidateEmail={candidateEmail} handleViewDoc={handleViewDoc} />
                      ) : null;
                    })()}
                  </div>
                  {currentI20 && onDeleteI20 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => onDeleteI20(currentI20.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="text-sm font-medium mb-1">{schoolInfo.school_name || "Unknown School"}</div>
                {(schoolInfo.major || schoolInfo.degree_level) && (
                  <div className="text-xs text-[#67677e] mb-3">
                    {schoolInfo.degree_level ? getDegreeLevelLabel(schoolInfo.degree_level) : ""} in{" "}
                    {schoolInfo.major || "Unknown Program"}
                    {schoolInfo.cip_code && <span className="ml-2">(CIP: {schoolInfo.cip_code})</span>}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {schoolInfo.student_name && (
                    <div>
                      <span className="text-xs text-[#67677e] block">Student Name</span>
                      <span>{schoolInfo.student_name}</span>
                    </div>
                  )}
                  {schoolInfo.school_address && (
                    <div className="col-span-2">
                      <span className="text-xs text-[#67677e] block">School Address</span>
                      <span className="text-xs">{effectiveData.school_address || schoolInfo.school_address}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-[#67677e] block">School Code</span>
                    <span className="font-mono text-xs">{schoolInfo.sevis_school_code || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#67677e] block">Program Period</span>
                    <span className="text-xs">
                      {formatDateSafe(schoolInfo.program_start_date)} → {formatDateSafe(schoolInfo.program_end_date)}
                    </span>
                  </div>
                  {(schoolInfo.opt_start_date || schoolInfo.opt_end_date) && (
                    <div>
                      <span className="text-xs text-[#67677e] block">OPT Period</span>
                      <span className="text-xs">
                        {formatDateSafe(schoolInfo.opt_start_date)} → {formatDateSafe(schoolInfo.opt_end_date)}
                      </span>
                    </div>
                  )}
                  {schoolInfo.country_of_birth && (
                    <div>
                      <span className="text-xs text-[#67677e] block">Country of Birth</span>
                      <span>{schoolInfo.country_of_birth}</span>
                    </div>
                  )}
                  {schoolInfo.country_of_citizenship &&
                    schoolInfo.country_of_citizenship !== schoolInfo.country_of_birth && (
                      <div>
                        <span className="text-xs text-[#67677e] block">Citizenship</span>
                        <span>{schoolInfo.country_of_citizenship}</span>
                      </div>
                    )}
                  {schoolInfo.date_of_birth && (
                    <div>
                      <span className="text-xs text-[#67677e] block">Date of Birth</span>
                      <span>{formatDateSafe(schoolInfo.date_of_birth)}</span>
                    </div>
                  )}
                </div>
                {(schoolInfo.dso_name || schoolInfo.dso_email || schoolInfo.dso_phone) && (
                  <div className="mt-3 pt-3 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] border-[#7c3bed]/20">
                    <span className="text-xs text-[#67677e] block mb-2">DSO Contact</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {schoolInfo.dso_name && (
                        <div>
                          <span className="text-xs text-[#67677e] block">Name</span>
                          <span>{schoolInfo.dso_name}</span>
                        </div>
                      )}
                      {schoolInfo.dso_email && (
                        <div className="min-w-0">
                          <span className="text-xs text-[#67677e] block">Email</span>
                          <span className="text-xs truncate block">{schoolInfo.dso_email}</span>
                        </div>
                      )}
                      {schoolInfo.dso_phone && (
                        <div>
                          <span className="text-xs text-[#67677e] block">Phone</span>
                          <span>{schoolInfo.dso_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* OPT EAD Card */}
        {!hasStemEADApproved && (
          <AccordionItem value="opt" className="border rounded-lg px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <AccordionTrigger className="hover:no-underline pr-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-[#67677e]" />
                    <span className="font-medium">OPT EAD Card</span>
                    <Badge variant="outline" className="text-xs">
                      {getOPTTypeLabel()}
                    </Badge>
                  </div>
                </AccordionTrigger>
              </div>
              {candidateEmail && (onEADDataExtracted || onSaveEAD) && (
                <SmartUploadButton
                  documentType="ead_card"
                  label="Smart Upload EAD"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onEADDataExtracted}
                  onRawDataExtracted={handleSaveOptEadFromUpload}
                  onRefreshData={onRefreshData}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                />
              )}
            </div>
            <AccordionContent>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
                  <SelectField
                    label="OPT Type"
                    value={effectiveData.opt_type}
                    onChange={(v) => handleChange("opt_type", v)}
                    options={OPT_TYPES}
                    required
                  />
                  <EditField
                    label="EAD Card Number"
                    value={eadInfo.ead_number || effectiveData.opt_receipt_number}
                    onChange={(v) => handleChange("opt_receipt_number", v)}
                    required
                  />
                  <EADCategorySelect
                    value={eadInfo.ead_category || effectiveData.opt_ead_category}
                    onChange={(v) => handleChange("opt_ead_category", v)}
                    optType={effectiveData.opt_type}
                  />
                  <EditField
                    label="Card Holder Name"
                    value={eadInfo.card_holder_name}
                    onChange={(v) => handleChange("card_holder_name", v)}
                  />
                  <EditField
                    label="A-Number"
                    value={eadInfo.a_number}
                    onChange={(v) => handleChange("a_number", v)}
                    placeholder="A123456789"
                  />
                  <EditField
                    label="Valid From"
                    value={eadInfo.card_valid_from || eadInfo.card_issue_date || effectiveData.opt_start_date}
                    onChange={(v) => handleChange("opt_start_date", v)}
                    type="date"
                    required
                  />
                  <EditField
                    label="Expiry Date"
                    value={eadInfo.card_expiry_date || effectiveData.opt_end_date}
                    onChange={(v) => handleChange("opt_end_date", v)}
                    type="date"
                    required
                  />
                  {effectiveData.opt_type === "post_completion" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">
                        Cap Gap Extension
                      </label>
                      <div className="flex items-center h-9 gap-2">
                        <Switch
                          checked={effectiveData.cap_gap_extension}
                          onCheckedChange={(v) => handleChange("cap_gap_extension", v)}
                        />
                        <Label className="text-sm">Yes</Label>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-[#7c3bed]/50 bg-[#7c3bed0d] p-3 mt-2 mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CreditCard className="h-4 w-4 text-[#7c3bed]" />
                      <Badge className="bg-[#7c3bed] text-[#7c3bed]-foreground text-xs">EAD</Badge>
                      {eadInfo.ead_number && (
                        <span className="font-mono font-medium text-sm">{eadInfo.ead_number}</span>
                      )}
                      {eadInfo.ead_category && (
                        <Badge variant="secondary" className="text-xs">
                          {getEADCategoryLabel(eadInfo.ead_category)}
                        </Badge>
                      )}
                      {eadInfo.status && (
                        <Badge
                          variant={
                            eadInfo.status === "active"
                              ? "default"
                              : eadInfo.status === "pending"
                                ? "secondary"
                                : "red-500"
                          }
                          className="text-xs capitalize"
                        >
                          {eadInfo.status}
                        </Badge>
                      )}
                      {eadInfo.is_combo_card && (
                        <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                          Combo Card
                        </Badge>
                      )}
                      {eadInfo.has_advance_parole && (
                        <Badge variant="outline" className="text-xs border-purple-500 text-purple-700">
                          Advance Parole
                        </Badge>
                      )}
                      {effectiveData.cap_gap_extension && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                          Cap Gap
                        </Badge>
                      )}
                      {(() => {
                        const linkedDoc = getSectionDoc(
                          documents,
                          currentEAD?.document_file_name,
                          SECTION_DOC_TYPES.ead_card,
                        );
                        return linkedDoc && candidateEmail ? (
                          <DocBadgeInline
                            doc={linkedDoc}
                            candidateEmail={candidateEmail}
                            handleViewDoc={handleViewDoc}
                          />
                        ) : null;
                      })()}
                    </div>
                    {currentEAD && onDeleteEAD && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => onDeleteEAD(currentEAD.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {eadInfo.card_holder_name && (
                    <div className="text-sm font-medium mb-1">{eadInfo.card_holder_name}</div>
                  )}
                  {eadInfo.terms_and_conditions && (
                    <div className="text-xs text-[#67677e] mb-3">{eadInfo.terms_and_conditions}</div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-[#67677e] block">EAD Category</span>
                      <span>{eadInfo.ead_category ? getEADCategoryLabel(eadInfo.ead_category) : "—"}</span>
                    </div>
                    {eadInfo.a_number && (
                      <div>
                        <span className="text-xs text-[#67677e] block">A-Number</span>
                        <span className="font-mono">{eadInfo.a_number}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-[#67677e] block">Valid Period</span>
                      <span className="text-xs">
                        {formatDateSafe(eadInfo.card_valid_from || eadInfo.card_issue_date)} →{" "}
                        {formatDateSafe(eadInfo.card_expiry_date)}
                      </span>
                    </div>
                    {eadInfo.visa_type_inferred && (
                      <div>
                        <span className="text-xs text-[#67677e] block">Visa Type</span>
                        <span>{eadInfo.visa_type_inferred}</span>
                      </div>
                    )}
                    {eadInfo.country_of_birth && (
                      <div>
                        <span className="text-xs text-[#67677e] block">Country of Birth</span>
                        <span>{eadInfo.country_of_birth}</span>
                      </div>
                    )}
                    {eadInfo.date_of_birth && (
                      <div>
                        <span className="text-xs text-[#67677e] block">Date of Birth</span>
                        <span>{formatDateSafe(eadInfo.date_of_birth)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* STEM OPT Extension */}
        {isStemEligible && (
          <AccordionItem value="stem" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#67677e]" />
                <span className="font-medium">STEM OPT Extension</span>
                {!effectiveData.stem_opt_applied && (
                  <Badge variant="outline" className="border-[#67677e] text-[#67677e] text-xs">
                    Not Applied
                  </Badge>
                )}
                {effectiveData.stem_opt_applied && effectiveStemOptStatus === "approved" && (
                  <Badge variant="outline" className="!border-green-600 !text-green-700 dark:!text-green-400 text-xs">
                    Approved
                  </Badge>
                )}
                {effectiveData.stem_opt_applied && effectiveStemOptStatus !== "approved" && (
                  <Badge variant="outline" className="!border-amber-500 !text-amber-700 dark:!text-amber-400 text-xs">
                    {effectiveStemOptStatus === "applied" ? "Applied" : "Pending"}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Applied for STEM OPT Extension?</Label>
                  <Switch
                    checked={effectiveData.stem_opt_applied}
                    onCheckedChange={(v) => {
                      if (!v) {
                        setShowStemOffConfirm(true);
                      } else {
                        handleChange("stem_opt_applied", true);
                        setStemOptStatusSelection("pending");
                        if (onSaveStemOptToggle) onSaveStemOptToggle(true, "pending");
                      }
                    }}
                  />
                  <span className="text-sm text-[#67677e]">{effectiveData.stem_opt_applied ? "Yes" : "No"}</span>
                </div>

                {/* Confirmation dialog for toggling off */}
                <AlertDialog open={showStemOffConfirm} onOpenChange={setShowStemOffConfirm}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark STEM OPT as Not Applied?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark STEM OPT Extension as not applied. Your uploaded documents (I-20, I-983, EAD)
                        will be preserved and can be accessed if you re-enable this later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleChange("stem_opt_applied", false);
                          setStemOptStatusSelection("not_applied");
                          setShowStemOffConfirm(false);
                          if (onSaveStemOptToggle) onSaveStemOptToggle(false, "not_applied");
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* NOT APPLIED STATE — just a note, section hidden */}
                {!effectiveData.stem_opt_applied && (
                  <p className="text-sm text-[#67677e]">
                    STEM OPT Extension is not applied. Toggle on to view or manage documents.
                  </p>
                )}

                {effectiveData.stem_opt_applied && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm font-medium">Status:</Label>
                      <Select
                        value={effectiveStemOptStatus || ""}
                        onValueChange={(v) => {
                          setStemOptStatusSelection(v);
                          if (onSaveStemOptToggle) onSaveStemOptToggle(effectiveData.stem_opt_applied, v);
                        }}
                      >
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STEM_OPT_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* PENDING STATE */}
                    {effectiveStemOptStatus === "pending" && !hasStemEADApproved && (
                      <div className="!space-y-4">
                        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                          <CardContent className="p-4 !space-y-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                              <div className="text-sm text-amber-800 dark:text-amber-200">
                                <span className="font-medium">Cap-Gap Extension:</span> Initial OPT EAD auto-extends 180
                                days while STEM OPT is pending.
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <EditField
                                label="USCIS Receipt Number"
                                value={effectiveData.stem_opt_receipt_number}
                                onChange={(v) => handleChange("stem_opt_receipt_number", v)}
                                placeholder="IOE..."
                              />
                              <EditField
                                label="Filed Date"
                                value={effectiveData.stem_opt_application_date}
                                onChange={(v) => handleChange("stem_opt_application_date", v)}
                                type="date"
                              />
                            </div>
                          </CardContent>
                        </Card>
                        <div className="!space-y-2">
                          {renderDocUploadRow(
                            <FileText className="h-4 w-4 text-[#67677e]" />,
                            "STEM OPT I-20",
                            "I-20 with STEM OPT recommendation",
                            hasStemI20Uploaded,
                            stemI20UploadBtn,
                            null,
                            SECTION_DOC_TYPES.i20,
                          )}
                          {renderDocUploadRow(
                            <FileText className="h-4 w-4 text-[#67677e]" />,
                            "I-983 Training Plan",
                            "Employer/student training plan for STEM OPT",
                            hasI983Uploaded,
                            i983UploadBtn,
                            i983DeleteBtn,
                            SECTION_DOC_TYPES.i983,
                          )}
                          {renderI983InlineDetails()}
                          {renderI983EvalTimeline()}
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-4 w-4 text-[#67677e]" />
                              <div>
                                <span className="text-sm font-medium">STEM OPT EAD Card</span>
                                <p className="text-xs text-[#67677e]">C03C category EAD card</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending approval
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* APPROVED STATE */}
                    {effectiveStemOptStatus === "approved" && (
                      <div className="!space-y-4">
                        <div className="!space-y-2">
                          {renderDocUploadRow(
                            <FileText className="h-4 w-4 text-[#67677e]" />,
                            "STEM OPT I-20",
                            "I-20 with STEM OPT recommendation",
                            hasStemI20Uploaded,
                            stemI20UploadBtn,
                            null,
                            SECTION_DOC_TYPES.i20,
                          )}
                          {renderDocUploadRow(
                            <FileText className="h-4 w-4 text-[#67677e]" />,
                            "I-983 Training Plan",
                            "Employer/student training plan for STEM OPT",
                            hasI983Uploaded,
                            i983UploadBtn,
                            i983DeleteBtn,
                            SECTION_DOC_TYPES.i983,
                          )}
                          {renderI983InlineDetails()}
                          {renderI983EvalTimeline()}
                          {renderDocUploadRow(
                            <CreditCard className="h-4 w-4 text-[#67677e]" />,
                            "STEM OPT EAD Card",
                            "C03C category EAD card",
                            hasStemEADApproved,
                            stemEadUploadBtn,
                            null,
                            SECTION_DOC_TYPES.ead_card,
                          )}
                          {stemEADRecord && renderStemEADCard(stemEADRecord)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
