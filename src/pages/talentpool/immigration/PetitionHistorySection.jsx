import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../../../components/ui/sheet";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  History,
  ArrowRight,
  Plus,
  Loader2,
  Trash2,
  Plane,
  RefreshCw,
  Building2,
  FileCheck,
  CreditCard,
  Award,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EVENT_TYPES, VISA_TYPES } from "./constants";
import { addPetitionHistory, deletePetitionHistory } from "../../../utils/immigrationApiService";
import { SectionDocumentsList } from "./SectionDocumentsList";
import { PETITIONS_DOC_TYPES } from "./documentTypes";
import { toast } from "react-toastify";

const EVENT_CONFIG = {
  initial_entry: {
    icon: Plane,
    title: "Initial Entry",
    description: "First entry to the US on this visa",
    fields: ["event_date", "visa_type", "port_of_entry"],
    labels: { visa_type: "Entry Visa Type" },
  },
  status_change: {
    icon: RefreshCw,
    title: "Status Change",
    description: "Changed from one visa to another",
    fields: [
      "event_date",
      "from_visa_type",
      "to_visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: { from_visa_type: "From Visa Type", to_visa_type: "New Visa Type", employer: "New Employer" },
  },
  transfer: {
    icon: Building2,
    title: "Transfer",
    description: "Same visa type, different employer",
    fields: [
      "event_date",
      "visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: { visa_type: "Visa Type", employer: "New Employer" },
  },
  extension: {
    icon: FileCheck,
    title: "Extension",
    description: "Extended same visa with same employer",
    fields: [
      "event_date",
      "visa_type",
      "employer",
      "receipt_number",
      "approval_date",
      "validity_start",
      "validity_end",
    ],
    labels: { visa_type: "Visa Type", employer: "Employer", validity_end: "New Validity End" },
  },
  amendment: {
    icon: FileCheck,
    title: "Amendment",
    description: "Changed job duties, location, or wage",
    fields: ["event_date", "visa_type", "employer", "change_type", "receipt_number", "approval_date"],
    labels: { visa_type: "Visa Type", change_type: "Type of Change" },
  },
  ead_issued: {
    icon: CreditCard,
    title: "EAD Issued",
    description: "Received EAD card",
    fields: ["event_date", "ead_category", "card_number", "validity_start", "validity_end"],
    labels: { ead_category: "EAD Category", card_number: "Card Number" },
  },
  gc_stage: {
    icon: Award,
    title: "Green Card Stage",
    description: "Green card process milestone",
    fields: ["event_date", "gc_stage", "receipt_number", "approval_date", "employer"],
    labels: { gc_stage: "Stage", employer: "Sponsoring Employer" },
  },
  other: {
    icon: History,
    title: "Other Event",
    description: "Other immigration event",
    fields: ["event_date", "visa_type", "notes"],
    labels: {},
  },
};

const getEventDetailsFields = (eventType, fromStatus, toStatus) => {
  if (eventType === "initial_entry" && toStatus === "F1")
    return ["school_name", "sevis_number", "major", "degree", "program_start_date"];
  if (eventType === "status_change" && fromStatus === "F1" && (toStatus === "OPT" || toStatus === "STEM_OPT"))
    return ["school_name", "sevis_number", "major", "degree", "graduation_date", "opt_ead_number"];
  if (eventType === "status_change" && fromStatus === "OPT" && toStatus === "STEM_OPT")
    return ["school_name", "employer_name", "employer_ein", "i983_submitted"];
  if (eventType === "status_change" && (fromStatus === "OPT" || fromStatus === "STEM_OPT") && toStatus === "H1B")
    return ["previous_school", "cap_type", "lottery_year", "lca_number", "job_title", "wage"];
  if (eventType === "transfer" && (toStatus === "H1B" || toStatus?.includes("H1B")))
    return ["previous_employer", "previous_job_title", "new_job_title", "transfer_reason"];
  if (eventType === "extension" && (toStatus === "H1B" || toStatus?.includes("H1B")))
    return ["current_employer", "job_title", "extension_reason"];
  if (eventType === "gc_stage") return ["gc_category", "priority_date", "sponsoring_employer"];
  return [];
};

const AMENDMENT_TYPES = [
  { value: "job_title", label: "Job Title Change" },
  { value: "job_duties", label: "Job Duties Change" },
  { value: "worksite", label: "Worksite Location Change" },
  { value: "wage", label: "Wage Change" },
  { value: "multiple", label: "Multiple Changes" },
];
const EAD_CATEGORIES = [
  { value: "C09", label: "C09 - Adjustment Pending" },
  { value: "C10", label: "C10 - Asylum Applicant" },
  { value: "C26", label: "C26 - H-4 Dependent" },
  { value: "A03", label: "A03 - Refugee" },
  { value: "A05", label: "A05 - Asylee" },
  { value: "A12", label: "A12 - TPS" },
];
const GC_STAGES = [
  { value: "perm_filed", label: "PERM Filed" },
  { value: "perm_certified", label: "PERM Certified" },
  { value: "perm_audit", label: "PERM Audit" },
  { value: "i140_filed", label: "I-140 Filed" },
  { value: "i140_approved", label: "I-140 Approved" },
  { value: "i485_filed", label: "I-485 Filed" },
  { value: "ead_ap_filed", label: "EAD/AP Filed" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "gc_approved", label: "Green Card Approved" },
];
const CAP_TYPES = [
  { value: "cap_subject", label: "Cap Subject (Regular)" },
  { value: "cap_exempt", label: "Cap Exempt" },
  { value: "cap_exempt_masters", label: "Cap Exempt (Masters)" },
];
const DEGREE_TYPES = [
  { value: "associate", label: "Associate" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
];

export function PetitionHistorySection({
  history,
  candidateEmail,
  isEditing,
  onChange,
  onRefresh,
  documents,
  onDocumentsRefresh,
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [formData, setFormData] = useState({ event_type: "extension" });

  // Add a fallback to an empty array using (history || [])
  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
  );
  const currentEventConfig = EVENT_CONFIG[formData.event_type] || EVENT_CONFIG.other;

  const eventDetailsFields = useMemo(() => {
    const eventType = formData.event_type;
    const fromStatus = formData.from_visa_type;
    const toStatus = formData.event_type === "status_change" ? formData.to_visa_type : formData.visa_type;
    return getEventDetailsFields(eventType, fromStatus, toStatus);
  }, [formData.event_type, formData.from_visa_type, formData.to_visa_type, formData.visa_type]);

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getEventBadgeColor = (eventType) => {
    switch (eventType) {
      case "initial_entry":
        return "bg-blue-100 text-blue-800";
      case "status_change":
        return "bg-purple-100 text-purple-800";
      case "extension":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-amber-100 text-amber-800";
      case "amendment":
        return "bg-orange-100 text-orange-800";
      case "ead_issued":
        return "bg-teal-100 text-teal-800";
      case "gc_stage":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleEventTypeChange = (eventType) => {
    setFormData({ event_type: eventType });
  };
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPetition = async () => {
    setIsSubmitting(true);
    try {
      let to_status = "",
        from_status = "";
      if (formData.event_type === "status_change") {
        from_status = formData.from_visa_type || "";
        to_status = formData.to_visa_type || "";
      } else if (formData.event_type === "ead_issued") to_status = formData.ead_category || "";
      else if (formData.event_type === "gc_stage") to_status = formData.gc_stage || "";
      else to_status = formData.visa_type || "";

      const event_details = {};
      [
        "school_name",
        "sevis_number",
        "major",
        "degree",
        "program_start_date",
        "graduation_date",
        "opt_ead_number",
        "employer_name",
        "employer_ein",
        "previous_school",
        "lottery_year",
        "lca_number",
        "job_title",
        "previous_employer",
        "previous_job_title",
        "new_job_title",
        "transfer_reason",
        "current_employer",
        "extension_reason",
        "gc_category",
        "priority_date",
        "sponsoring_employer",
        "port_of_entry",
      ].forEach((key) => {
        if (formData[key]) event_details[key] = formData[key];
      });
      if (formData.i983_submitted !== undefined) event_details.i983_submitted = formData.i983_submitted;
      if (formData.cap_type) event_details.cap_type = formData.cap_type;
      if (formData.wage) event_details.wage = parseFloat(formData.wage);

      const petitionData = {
        event_type: formData.event_type,
        event_date: formData.event_date || "",
        from_status: from_status || undefined,
        to_status,
        employer: formData.employer,
        receipt_number: formData.receipt_number || formData.card_number,
        approval_date: formData.approval_date,
        validity_start: formData.validity_start,
        validity_end: formData.validity_end,
        notes: formData.notes || (formData.change_type ? `Change type: ${formData.change_type}` : undefined),
        event_details: Object.keys(event_details).length > 0 ? event_details : undefined,
      };
      const response = await addPetitionHistory(candidateEmail, petitionData);
      if (response.success) {
        toast.success("Petition history added successfully");
        setShowAddDialog(false);
        setFormData({ event_type: "extension" });
        onRefresh?.();
      } else throw new Error(response.message || "Failed to add petition history");
    } catch (error) {
      console.error("Error adding petition history:", error);
      toast.error("Failed to add petition history.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePetition = async (historyId) => {
    setDeletingId(historyId);
    try {
      const response = await deletePetitionHistory(historyId);
      if (response.success) {
        toast.success("Petition history deleted successfully");
        onRefresh?.();
      } else throw new Error(response.message || "Failed to delete");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete petition history.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderFormField = (fieldName) => {
    const label =
      currentEventConfig.labels[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    switch (fieldName) {
      case "event_date":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Event Date <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={formData.event_date || ""}
              onChange={(e) => handleFieldChange("event_date", e.target.value)}
            />
          </div>
        );
      case "visa_type":
      case "from_visa_type":
      case "to_visa_type":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              {label} <span className="text-destructive">*</span>
            </label>
            <Select value={formData[fieldName] || ""} onValueChange={(v) => handleFieldChange(fieldName, v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                {VISA_TYPES.map((v) => (
                  <SelectItem key={v.code} value={v.code}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "employer":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Input
              value={formData.employer || ""}
              onChange={(e) => handleFieldChange("employer", e.target.value)}
              placeholder="Company name"
            />
          </div>
        );
      case "port_of_entry":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Port of Entry</label>
            <Input
              value={formData.port_of_entry || ""}
              onChange={(e) => handleFieldChange("port_of_entry", e.target.value)}
              placeholder="e.g., JFK, LAX"
            />
          </div>
        );
      case "receipt_number":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Receipt Number</label>
            <Input
              value={formData.receipt_number || ""}
              onChange={(e) => handleFieldChange("receipt_number", e.target.value)}
              placeholder="e.g., EAC2490012345"
            />
          </div>
        );
      case "approval_date":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Approval Date</label>
            <Input
              type="date"
              value={formData.approval_date || ""}
              onChange={(e) => handleFieldChange("approval_date", e.target.value)}
            />
          </div>
        );
      case "validity_start":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Validity Start</label>
            <Input
              type="date"
              value={formData.validity_start || ""}
              onChange={(e) => handleFieldChange("validity_start", e.target.value)}
            />
          </div>
        );
      case "validity_end":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              {currentEventConfig.labels.validity_end || "Validity End"}
            </label>
            <Input
              type="date"
              value={formData.validity_end || ""}
              onChange={(e) => handleFieldChange("validity_end", e.target.value)}
            />
          </div>
        );
      case "change_type":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Type of Change</label>
            <Select value={formData.change_type || ""} onValueChange={(v) => handleFieldChange("change_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                {AMENDMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "ead_category":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              EAD Category <span className="text-destructive">*</span>
            </label>
            <Select value={formData.ead_category || ""} onValueChange={(v) => handleFieldChange("ead_category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EAD_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "card_number":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Card Number</label>
            <Input
              value={formData.card_number || ""}
              onChange={(e) => handleFieldChange("card_number", e.target.value)}
              placeholder="e.g., SRC2390123456"
            />
          </div>
        );
      case "gc_stage":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Green Card Stage <span className="text-destructive">*</span>
            </label>
            <Select value={formData.gc_stage || ""} onValueChange={(v) => handleFieldChange("gc_stage", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {GC_STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "notes":
        return (
          <div key={fieldName} className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Notes</label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderEventDetailsField = (fieldName) => {
    const fieldLabels = {
      school_name: "School Name",
      sevis_number: "SEVIS Number",
      major: "Major/Field of Study",
      degree: "Degree Level",
      program_start_date: "Program Start Date",
      graduation_date: "Graduation Date",
      opt_ead_number: "OPT EAD Number",
      employer_name: "Employer Name",
      employer_ein: "Employer EIN",
      i983_submitted: "I-983 Submitted",
      previous_school: "Previous School",
      cap_type: "H-1B Cap Type",
      lottery_year: "Lottery Year",
      lca_number: "LCA Number",
      job_title: "Job Title",
      wage: "Annual Wage ($)",
      previous_employer: "Previous Employer",
      previous_job_title: "Previous Job Title",
      new_job_title: "New Job Title",
      transfer_reason: "Reason for Transfer",
      current_employer: "Current Employer",
      extension_reason: "Reason for Extension",
      gc_category: "GC Category",
      priority_date: "Priority Date",
      sponsoring_employer: "Sponsoring Employer",
    };
    const label = fieldLabels[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    switch (fieldName) {
      case "degree":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Select value={formData.degree || ""} onValueChange={(v) => handleFieldChange("degree", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                {DEGREE_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "cap_type":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Select value={formData.cap_type || ""} onValueChange={(v) => handleFieldChange("cap_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cap type" />
              </SelectTrigger>
              <SelectContent>
                {CAP_TYPES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "i983_submitted":
        return (
          <div key={fieldName} className="flex items-center space-x-2 pt-6">
            <Checkbox
              id={fieldName}
              checked={formData.i983_submitted || false}
              onCheckedChange={(checked) => handleFieldChange("i983_submitted", !!checked)}
            />
            <label htmlFor={fieldName} className="text-sm font-medium cursor-pointer">
              {label}
            </label>
          </div>
        );
      case "program_start_date":
      case "graduation_date":
      case "priority_date":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Input
              type="date"
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            />
          </div>
        );
      case "wage":
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Input
              type="number"
              value={formData.wage || ""}
              onChange={(e) => handleFieldChange("wage", e.target.value)}
              placeholder="e.g., 85000"
            />
          </div>
        );
      default:
        return (
          <div key={fieldName} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">{label}</label>
            <Input
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  const renderEventDetails = (event) => {
    const details = event.event_details;
    if (!details || Object.keys(details).length === 0) return null;
    const isAutoGenerated = details.auto_generated === true;
    const detailItems = [];
    [
      "school_name",
      "sevis_number",
      "major",
      "degree",
      "opt_ead_number",
      "employer_name",
      "employer_ein",
      "previous_school",
      "lottery_year",
      "lca_number",
      "job_title",
      "previous_employer",
      "previous_job_title",
      "new_job_title",
      "transfer_reason",
      "current_employer",
      "extension_reason",
      "gc_category",
      "sponsoring_employer",
      "port_of_entry",
    ].forEach((key) => {
      if (details[key])
        detailItems.push({
          label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          value: details[key],
        });
    });
    if (details.program_start_date)
      detailItems.push({ label: "Program Start", value: new Date(details.program_start_date).toLocaleDateString() });
    if (details.graduation_date)
      detailItems.push({ label: "Graduation", value: new Date(details.graduation_date).toLocaleDateString() });
    if (details.i983_submitted !== undefined)
      detailItems.push({ label: "I-983", value: details.i983_submitted ? "Submitted" : "Not Submitted" });
    if (details.cap_type)
      detailItems.push({
        label: "Cap Type",
        value: CAP_TYPES.find((c) => c.value === details.cap_type)?.label || details.cap_type,
      });
    if (details.wage) detailItems.push({ label: "Wage", value: `$${details.wage.toLocaleString()}` });
    if (details.priority_date)
      detailItems.push({ label: "Priority Date", value: new Date(details.priority_date).toLocaleDateString() });

    if (detailItems.length === 0) return null;
    const isExpanded = expandedItems.has(event.history_id);

    return (
      <div className="mt-3 pt-3 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] border-dashed">
        <button
          onClick={() => toggleExpanded(event.history_id)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          <span className="font-medium">{isAutoGenerated ? "Previous Visa Snapshot" : "Snapshot Details"}</span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            {detailItems.length} fields
          </Badge>
        </button>
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-2">
            {detailItems.map((item, idx) => (
              <div key={idx} className="bg-muted/50 rounded px-2 py-1">
                <span className="text-muted-foreground">{item.label}:</span>{" "}
                <span className="font-medium">{String(item.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isFormValid = () => {
    if (!formData.event_date) return false;
    switch (formData.event_type) {
      case "initial_entry":
        return !!formData.visa_type;
      case "status_change":
        return !!formData.from_visa_type && !!formData.to_visa_type;
      case "transfer":
      case "extension":
      case "amendment":
        return !!formData.visa_type;
      case "ead_issued":
        return !!formData.ead_category;
      case "gc_stage":
        return !!formData.gc_stage;
      default:
        return true;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Petition & Status History
            </CardTitle>
            <CardDescription>Timeline of immigration events</CardDescription>
          </div>
          {isEditing && (
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No petition history found.</div>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-0 w-[1px] bg-[#e7e7ef]" />
              <div className="space-y-6">
                {sortedHistory.map((event) => (
                  <div key={event.history_id} className="relative pl-10">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getEventBadgeColor(event.event_type)}`}>
                            {EVENT_TYPES.find((e) => e.value === event.event_type)?.label || event.event_type}
                          </Badge>
                          {event.event_details?.auto_generated && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            >
                              Auto-tracked
                            </Badge>
                          )}
                          {event.from_status && event.to_status && (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="font-medium">{event.from_status}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{event.to_status}</span>
                            </div>
                          )}
                          {!event.from_status && event.to_status && (
                            <span className="text-sm font-medium">{event.to_status}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeletePetition(event.history_id)}
                              disabled={deletingId === event.history_id}
                            >
                              {deletingId === event.history_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {event.employer && (
                          <div>
                            <span className="text-muted-foreground">Employer:</span>{" "}
                            <span className="font-medium">{event.employer}</span>
                          </div>
                        )}
                        {event.receipt_number && (
                          <div>
                            <span className="text-muted-foreground">Receipt:</span>{" "}
                            <span className="font-mono text-xs">{event.receipt_number}</span>
                          </div>
                        )}
                        {event.approval_date && (
                          <div>
                            <span className="text-muted-foreground">Approved:</span>{" "}
                            {new Date(event.approval_date).toLocaleDateString()}
                          </div>
                        )}
                        {event.validity_start && event.validity_end && (
                          <div>
                            <span className="text-muted-foreground">Validity:</span>{" "}
                            {new Date(event.validity_start).toLocaleDateString()} -{" "}
                            {new Date(event.validity_end).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {event.notes && <p className="text-sm text-muted-foreground mt-2 italic">{event.notes}</p>}
                      {renderEventDetails(event)}
                      {event.created_by && (
                        <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                          Added by {event.created_by}
                          {event.created_at && ` on ${new Date(event.created_at).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {documents && documents.length > 0 && (
        <SectionDocumentsList
          documents={documents}
          sectionName="Petition Documents"
          sectionCode="petitions"
          documentTypes={PETITIONS_DOC_TYPES}
          candidateEmail={candidateEmail}
          isEditing={isEditing}
          accessLevel="Full Access"
          onRefresh={onDocumentsRefresh || (() => Promise.resolve())}
          compact
        />
      )}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent className="!max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {(() => {
                const IconComponent = currentEventConfig.icon;
                return <IconComponent className="h-5 w-5" />;
              })()}
              Add {currentEventConfig.title}
            </SheetTitle>
            <SheetDescription>{currentEventConfig.description}</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Event Type <span className="text-destructive">*</span>
              </label>
              <Select value={formData.event_type} onValueChange={handleEventTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentEventConfig.fields.map((field) => renderFormField(field))}
            </div>
            {eventDetailsFields.length > 0 && (
              <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Snapshot Details
                  <Badge variant="outline" className="text-[10px]">
                    Optional
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  These details will be preserved as a historical snapshot for this event.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {eventDetailsFields.map((field) => renderEventDetailsField(field))}
                </div>
              </div>
            )}
            {!currentEventConfig.fields.includes("notes") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Notes</label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddPetition} disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Event"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
