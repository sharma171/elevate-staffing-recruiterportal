import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
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
import {
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Clock,
  Trash2,
  GraduationCap,
  Building2,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { ACADEMIC_TERMS, calculateMonths, getCPTProgressColor, getCPTProgressTextColor } from "./types/cpt-records";
import { US_STATES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
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
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
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

const getEmptyCPT = () => ({
  cpt_start_date: "",
  cpt_end_date: "",
  is_full_time: false,
  hours_per_week: 20,
  employer_name: "",
  employer_ein: "",
  employer_address: "",
  employer_city: "",
  employer_state: "",
  employer_zip: "",
  job_title: "",
  soc_code: "",
  soc_title: "",
  compensation: "",
  client_company_name: "",
  client_worksite_address: "",
  client_worksite_city: "",
  client_worksite_state: "",
  course_name: "",
  course_number: "",
  academic_term: "",
  faculty_advisor: "",
  notes: "",
});

export function CPTSection({
  cptHistory,
  cumulativeFtCptMonths,
  optEligible,
  isEditing = false,
  readOnly = false,
  candidateEmail,
  candidateId,
  i20History = [],
  onSaveCPT,
  onUpdateCPT,
  onDeleteCPT,
  onRefreshData,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(getEmptyCPT());
  const [selectedI20Id, setSelectedI20Id] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [smartUploadFileInfo, setSmartUploadFileInfo] = useState(null);

  const handleSmartUploadData = (data) => {
    const newFormData = {
      ...getEmptyCPT(),
      employer_name: data.cpt_employer?.value || "",
      cpt_start_date: data.cpt_start_date?.value || "",
      cpt_end_date: data.cpt_end_date?.value || "",
      is_full_time: data.cpt_full_time?.value === "true" || data.cpt_full_time?.value === "Yes",
      sevis_number: data.sevis_number?.value || "",
      school_name: data.school_name?.value || "",
      program: data.program?.value || "",
      degree_level: data.degree_level?.value || "",
      student_name: data.student_name?.value || "",
    };
    setFormData(newFormData);
    setShowAddForm(true);
  };

  const stateOptions = US_STATES.map((s) => ({ value: s.code, label: s.name }));
  const progressPercent = Math.min((cumulativeFtCptMonths / 12) * 100, 100);

  const handleI20Select = (i20Id) => {
    setSelectedI20Id(i20Id);
    if (i20Id && i20Id !== "none") {
      const i20 = i20History.find((i) => i.id === i20Id);
      if (i20) {
        setFormData((prev) => ({
          ...prev,
          sevis_number: i20.sevis_number,
          school_name: i20.school_name,
          program: i20.program,
          degree_level: i20.degree_level,
          student_name: i20.student_name,
        }));
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.cpt_start_date || !formData.cpt_end_date || !formData.employer_name) {
      toast.success("Start date, end date, and employer name are required.");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveCPT(formData, selectedI20Id || undefined, smartUploadFileInfo || undefined);
      toast.success("CPT authorization has been saved.");
      setFormData(getEmptyCPT());
      setSelectedI20Id("");
      setSmartUploadFileInfo(null);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.message || "Failed to save CPT");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (cptId) => {
    setDeleteConfirmId(cptId);
  };
  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteCPT(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const activeCPTs = cptHistory.filter(
    (c) => c.status === "active" || (!c.status && new Date(c.cpt_end_date) >= new Date()),
  );
  const previousCPTs = cptHistory.filter(
    (c) => c.status === "completed" || c.status === "revoked" || (!c.status && new Date(c.cpt_end_date) < new Date()),
  );

  return (
    <div className="!space-y-4">
      {/* Summary Banner */}
      <Card
        className={
          cumulativeFtCptMonths >= 12
            ? "border-destructive bg-destructive/5"
            : cumulativeFtCptMonths >= 8
              ? "border-yellow-500 bg-yellow-50/50"
              : ""
        }
      >
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap pt-3">
                <h3 className="font-semibold text-base">CPT — Full-Time Usage</h3>
                {optEligible ? (
                  <Badge className="bg-primary/10 text-white border-primary/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    OPT Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    OPT Eligibility Lost
                  </Badge>
                )}
                {activeCPTs.length > 0 && (
                  <Badge variant="secondary" className="bg-[#f3f3fc] hover:bg-[#f3f3fc]">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {activeCPTs.length} Active{activeCPTs[0]?.employer_name && ` — ${activeCPTs[0].employer_name}`}
                  </Badge>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={getCPTProgressTextColor(cumulativeFtCptMonths)}>
                    {cumulativeFtCptMonths} of 12 months
                  </span>
                  <span className="text-muted-foreground">
                    {Math.max(0, 12 - cumulativeFtCptMonths).toFixed(1)} remaining
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
              {cumulativeFtCptMonths >= 12 && (
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  12+ months full-time CPT — OPT eligibility lost
                </div>
              )}
              {cumulativeFtCptMonths >= 10 && cumulativeFtCptMonths < 12 && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Approaching 12-month limit — {(12 - cumulativeFtCptMonths).toFixed(1)} months remaining
                </div>
              )}
            </div>
            {!readOnly && (
              <div className="flex items-center gap-2">
                {candidateEmail && (
                  <SmartUploadButton
                    documentType="i20"
                    label="Smart Upload CPT I-20"
                    candidateEmail={candidateEmail}
                    candidateId={candidateId}
                    onDataExtracted={handleSmartUploadData}
                    onRawDataExtracted={async (_rawData, fileInfo) => {
                      if (fileInfo) setSmartUploadFileInfo(fileInfo);
                      return true;
                    }}
                    onRefreshData={onRefreshData}
                    variant="outline"
                    size="sm"
                  />
                )}
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant={showAddForm ? "secondary" : "default"}
                  size="sm"
                >
                  {showAddForm ? (
                    <>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" /> Add CPT
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add CPT Form */}
      {showAddForm && !readOnly && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              New CPT Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-3">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Authorization Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <EditField
                  label="Start Date"
                  value={formData.cpt_start_date}
                  onChange={(v) => handleFieldChange("cpt_start_date", v)}
                  type="date"
                  required
                />
                <EditField
                  label="End Date"
                  value={formData.cpt_end_date}
                  onChange={(v) => handleFieldChange("cpt_end_date", v)}
                  type="date"
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      checked={formData.is_full_time || false}
                      onCheckedChange={(v) => handleFieldChange("is_full_time", v)}
                    />
                    <Label className="text-sm">{formData.is_full_time ? "Full-Time" : "Part-Time"}</Label>
                  </div>
                  {formData.is_full_time && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Counts toward 12-month limit
                    </p>
                  )}
                </div>
                <EditField
                  label="Hours/Week"
                  value={formData.hours_per_week}
                  onChange={(v) => handleFieldChange("hours_per_week", parseInt(v) || 0)}
                  type="number"
                />
                <EditField
                  label="Auth Date"
                  value={formData.authorization_date}
                  onChange={(v) => handleFieldChange("authorization_date", v)}
                  type="date"
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Employer Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <EditField
                  label="Employer Name"
                  value={formData.employer_name}
                  onChange={(v) => handleFieldChange("employer_name", v)}
                  required
                  className="col-span-2"
                />
                <EditField
                  label="EIN"
                  value={formData.employer_ein}
                  onChange={(v) => handleFieldChange("employer_ein", v)}
                  placeholder="XX-XXXXXXX"
                />
                <EditField
                  label="Address"
                  value={formData.employer_address}
                  onChange={(v) => handleFieldChange("employer_address", v)}
                />
                <EditField
                  label="City"
                  value={formData.employer_city}
                  onChange={(v) => handleFieldChange("employer_city", v)}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</label>
                  <Select
                    value={formData.employer_state || ""}
                    onValueChange={(v) => handleFieldChange("employer_state", v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <EditField
                  label="ZIP"
                  value={formData.employer_zip}
                  onChange={(v) => handleFieldChange("employer_zip", v)}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Job / Placement
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <EditField
                  label="Job Title"
                  value={formData.job_title}
                  onChange={(v) => handleFieldChange("job_title", v)}
                />
                <EditField
                  label="SOC Code"
                  value={formData.soc_code}
                  onChange={(v) => handleFieldChange("soc_code", v)}
                />
                <EditField
                  label="SOC Title"
                  value={formData.soc_title}
                  onChange={(v) => handleFieldChange("soc_title", v)}
                />
                <EditField
                  label="Compensation"
                  value={formData.compensation}
                  onChange={(v) => handleFieldChange("compensation", v)}
                />
                <EditField
                  label="Client Company"
                  value={formData.client_company_name}
                  onChange={(v) => handleFieldChange("client_company_name", v)}
                  className="col-span-2"
                />
                <EditField
                  label="Client Worksite Address"
                  value={formData.client_worksite_address}
                  onChange={(v) => handleFieldChange("client_worksite_address", v)}
                />
                <EditField
                  label="Client City"
                  value={formData.client_worksite_city}
                  onChange={(v) => handleFieldChange("client_worksite_city", v)}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Client State
                  </label>
                  <Select
                    value={formData.client_worksite_state || ""}
                    onValueChange={(v) => handleFieldChange("client_worksite_state", v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Academic Requirement
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <EditField
                  label="Course Name"
                  value={formData.course_name}
                  onChange={(v) => handleFieldChange("course_name", v)}
                />
                <EditField
                  label="Course Number"
                  value={formData.course_number}
                  onChange={(v) => handleFieldChange("course_number", v)}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Academic Term
                  </label>
                  <Select
                    value={formData.academic_term || ""}
                    onValueChange={(v) => handleFieldChange("academic_term", v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_TERMS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <EditField
                  label="Faculty Advisor"
                  value={formData.faculty_advisor}
                  onChange={(v) => handleFieldChange("faculty_advisor", v)}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Student Info
                <span className="text-xs text-muted-foreground font-normal">(auto-populated from I-20)</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Link to I-20
                  </label>
                  <Select value={selectedI20Id} onValueChange={handleI20Select}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select I-20 record" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {i20History.map((i20) => (
                        <SelectItem key={i20.id} value={i20.id}>
                          {i20.sevis_number} — {i20.school_name} {i20.is_current ? "(Current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <EditField label="SEVIS Number" value={formData.sevis_number} onChange={() => {}} disabled />
                <EditField label="School" value={formData.school_name} onChange={() => {}} disabled />
                <EditField label="Program" value={formData.program} onChange={() => {}} disabled />
              </div>
            </div>
            <div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Any additional notes..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData(getEmptyCPT());
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save CPT"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CPT History */}
      {cptHistory.length > 0 && (
        <Card>
          <CardHeader className="p-[12px]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-[16px]">
                <Clock className="h-4 w-4" />
                CPT History
                <Badge variant="secondary" className="text-xs">
                  {cptHistory.length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-[12px]">
            <div className="!space-y-2">
              {activeCPTs.map((cpt) => (
                <CPTHistoryRow
                  key={cpt.id}
                  cpt={cpt}
                  isActive
                  expanded={expandedRow === cpt.id}
                  onToggle={() => setExpandedRow(expandedRow === cpt.id ? null : cpt.id)}
                  onDelete={() => handleDelete(cpt.id)}
                  readOnly={readOnly}
                />
              ))}
              {previousCPTs.length > 0 && (
                <Collapsible open={showHistory} onOpenChange={setShowHistory}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:bg-muted/50"
                    >
                      {showHistory ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      Previous CPT ({previousCPTs.length})
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="!space-y-2 pt-2">
                    {previousCPTs.map((cpt) => (
                      <CPTHistoryRow
                        key={cpt.id}
                        cpt={cpt}
                        isActive={false}
                        expanded={expandedRow === cpt.id}
                        onToggle={() => setExpandedRow(expandedRow === cpt.id ? null : cpt.id)}
                        onDelete={() => handleDelete(cpt.id)}
                        readOnly={readOnly}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {cptHistory.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-3 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-1">No CPT Records</p>
            {!readOnly && <p className="text-sm mb-2">Click "Add CPT" to create a CPT authorization record.</p>}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CPT Record</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke this CPT authorization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CPTHistoryRow({ cpt, isActive, expanded, onToggle, onDelete, readOnly = false }) {
  const months = calculateMonths(cpt.cpt_start_date, cpt.cpt_end_date);

  return (
    <div
      className={`border rounded-lg ${isActive ? "border-primary/40 bg-[#7c3bed0d]" : "border-muted bg-[#7c3bed0d]"}`}
    >
      <div className="flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-muted/30" onClick={onToggle}>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Dates</span>
            <p className="font-medium">
              {formatDateSafe(cpt.cpt_start_date)} → {formatDateSafe(cpt.cpt_end_date)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Employer</span>
            <p className="font-medium truncate">{cpt.employer_name}</p>
          </div>
          <div className="md:block">
            <span className="text-muted-foreground text-xs">Job Title</span>
            <p className="font-medium truncate">{cpt.job_title || "—"}</p>
          </div>
          <div className="md:block">
            <span className="text-muted-foreground text-xs">Type</span>
            <div variant={cpt.is_full_time ? "default" : "secondary"} className="text-xs text-[#080118]">
              {cpt.is_full_time ? "FT" : "PT"} {cpt.hours_per_week ? `(${cpt.hours_per_week}h)` : ""}
            </div>
            {cpt.notes?.includes("Auto-created from I-20") && (
              <Badge variant="outline" className="text-xs ml-1">
                From I-20
              </Badge>
            )}
          </div>
          <div className="md:block">
            <span className="text-muted-foreground text-xs">Months</span>
            <p className={`font-medium ${cpt.is_full_time ? getCPTProgressTextColor(months) : ""}`}>{months}</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className="text-muted-foreground text-xs">Status</span>
            <Badge
              variant={isActive ? "default" : cpt.status === "revoked" ? "destructive" : "outline"}
              className="text-xs"
            >
              {isActive ? "Active" : cpt.status === "revoked" ? "Revoked" : "Completed"}
            </Badge>
          </div>
        </div>
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-danger hover:!text-[#fff] flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] !space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DisplayField label="Authorization Date" value={formatDateSafe(cpt.authorization_date)} />
            <DisplayField label="Hours/Week" value={cpt.hours_per_week} />
            <DisplayField label="EIN" value={cpt.employer_ein} />
            <DisplayField label="Compensation" value={cpt.compensation} />
          </div>
          {(cpt.employer_address || cpt.employer_city) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Address" value={cpt.employer_address} />
              <DisplayField label="City" value={cpt.employer_city} />
              <DisplayField label="State" value={cpt.employer_state} />
              <DisplayField label="ZIP" value={cpt.employer_zip} />
            </div>
          )}
          {(cpt.soc_code || cpt.client_company_name) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="SOC Code" value={cpt.soc_code} />
              <DisplayField label="SOC Title" value={cpt.soc_title} />
              <DisplayField label="Client Company" value={cpt.client_company_name} />
              <DisplayField
                label="Client Worksite"
                value={[cpt.client_worksite_address, cpt.client_worksite_city, cpt.client_worksite_state]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>
          )}
          {(cpt.course_name || cpt.academic_term) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Course" value={cpt.course_name} />
              <DisplayField label="Course #" value={cpt.course_number} />
              <DisplayField label="Term" value={cpt.academic_term} />
              <DisplayField label="Advisor" value={cpt.faculty_advisor} />
            </div>
          )}
          {(cpt.sevis_number || cpt.school_name) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="SEVIS" value={cpt.sevis_number} />
              <DisplayField label="School" value={cpt.school_name} />
              <DisplayField label="Program" value={cpt.program} />
              <DisplayField label="Degree" value={cpt.degree_level} />
            </div>
          )}
          {cpt.notes && <DisplayField label="Notes" value={cpt.notes} />}
        </div>
      )}
    </div>
  );
}
