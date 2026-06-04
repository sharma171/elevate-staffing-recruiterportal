import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { Separator } from "../../../components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { CheckCircle2, Circle, Clock, ChevronDown, AlertTriangle, Save, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { GC_CATEGORIES, US_STATES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";
import { saveGCProcessing, deleteGCProcessing } from "../../../utils/immigrationApiService";

const STAGES = [
  { id: "pwd", name: "PWD", description: "Prevailing Wage" },
  { id: "recruitment", name: "Recruitment", description: "PERM Recruitment" },
  { id: "perm", name: "PERM", description: "Labor Certification" },
  { id: "i140", name: "I-140", description: "Immigrant Petition" },
  { id: "i485", name: "I-485", description: "Adjustment of Status" },
];
const STAGE_ORDER = ["pwd", "recruitment", "perm", "i140", "i485"];

const isStageEnabled = (stageId, data) => {
  if (!data) return false;
  const idx = STAGE_ORDER.indexOf(stageId);
  if (idx === 0) return true;
  switch (stageId) {
    case "recruitment":
      return data.pwd_status === "received";
    case "perm":
      return data.recruitment_status === "completed";
    case "i140":
      return data.perm_status === "approved";
    case "i485":
      return data.i140_status === "approved";
    default:
      return false;
  }
};

const getStageStatus = (stageId, data) => {
  if (!data) return "not_started";
  switch (stageId) {
    case "pwd":
      if (data.pwd_status === "received") return "completed";
      if (data.pwd_status && data.pwd_status !== "not_started") return "in_progress";
      return "not_started";
    case "recruitment":
      if (data.recruitment_status === "completed") return "completed";
      if (data.recruitment_status === "in_progress") return "in_progress";
      return "not_started";
    case "perm":
      if (data.perm_status === "approved") return "completed";
      if (data.perm_status === "denied") return "completed";
      if (data.perm_status && data.perm_status !== "not_started") return "in_progress";
      return "not_started";
    case "i140":
      if (data.i140_status === "approved") return "completed";
      if (data.i140_status === "denied") return "completed";
      if (data.i140_status && data.i140_status !== "not_started") return "in_progress";
      return "not_started";
    case "i485":
      if (data.i485_status === "approved") return "completed";
      if (data.i485_status === "denied") return "completed";
      if (data.i485_status && data.i485_status !== "not_started") return "in_progress";
      return "not_started";
    default:
      return "not_started";
  }
};

const getPWDCountdown = (data) => {
  if (!data?.pwd_validity_end) return null;
  const parts = data.pwd_validity_end.split("-");
  const end = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { days: 0, urgent: true };
  return { days, urgent: days <= 60 };
};

const formatDate = (date) => {
  if (!date) return "—";
  const parts = date.split("-");
  if (parts.length === 3)
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleDateString();
  return date;
};

function StageBadge({ status }) {
  if (status === "completed") return <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>;
  if (status === "in_progress")
    return (
      <Badge variant="secondary" className="text-xs">
        In Progress
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      Not Started
    </Badge>
  );
}

function RecruitmentChecklistItem({
  label,
  dateField,
  endDateField,
  endDateLabel,
  textField,
  textLabel,
  data,
  isEditing,
  onUpdate,
}) {
  const dateValue = data?.[dateField] || "";
  const hasDate = !!dateValue;
  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 py-1">
        {hasDate ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-[#67677e]/40 shrink-0" />
        )}
        <span className={`text-sm ${hasDate ? "text-foreground" : "text-[#67677e]"}`}>{label}</span>
        {hasDate && (
          <span className="text-xs text-[#67677e]">
            {formatDate(dateValue)}
            {endDateField && data?.[endDateField] && ` — ${formatDate(data[endDateField])}`}
            {textField && data?.[textField] && ` • ${data[textField]}`}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 py-1">
      <Checkbox
        checked={hasDate}
        onCheckedChange={(checked) => {
          if (!checked) onUpdate(dateField, "");
        }}
        className="mt-1"
      />
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => onUpdate(dateField, e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        {endDateField && (
          <div className="space-y-1">
            <Label className="text-xs">{endDateLabel || "End Date"}</Label>
            <Input
              type="date"
              value={data?.[endDateField] || ""}
              onChange={(e) => onUpdate(endDateField, e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        )}
        {textField && (
          <div className="space-y-1">
            <Label className="text-xs">{textLabel || "Details"}</Label>
            <Input
              value={data?.[textField] || ""}
              onChange={(e) => onUpdate(textField, e.target.value)}
              className="h-7 text-xs"
              placeholder={textLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const PipelineField = ({ label, field, type = "text", placeholder, data, updateField, isEditing }) => {
  const value = data?.[field] || "";
  if (!isEditing)
    return (
      <div className="space-y-1">
        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
        <dd className="text-sm text-foreground">{type === "date" ? formatDate(value) : value || "—"}</dd>
      </div>
    );
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) =>
          updateField(field, type === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value)
        }
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
};

const PipelineSelectField = ({ label, field, options, placeholder, data, updateField, isEditing }) => {
  const value = data?.[field] || "";
  if (!isEditing) {
    const opt = options.find((o) => o.value === value);
    return (
      <div className="space-y-1">
        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
        <dd className="text-sm text-foreground">{opt?.label || value || "—"}</dd>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value || "none"} onValueChange={(v) => updateField(field, v === "none" ? "" : v)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Select...</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export function GCProcessingPipeline({ data, candidateEmail, candidateId, isEditing, onDataChange, onRefresh }) {
  const [isSaving, setIsSaving] = useState(false);
  const [openStages, setOpenStages] = useState(new Set(["pwd"]));

  const toggleStage = (stage) => {
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  const updateField = useCallback(
    (field, value) => {
      if (!data) return;
      onDataChange({ ...data, [field]: value });
    },
    [data, onDataChange],
  );

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await saveGCProcessing(candidateEmail, data);
      toast.success("GC Processing saved");
      await onRefresh();
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    setIsSaving(true);
    try {
      await deleteGCProcessing(data.id);
      toast.success("GC Processing deleted");
      await onRefresh();
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSmartUploadExtracted = useCallback(
    (docType) => (extractedData) => {
      if (!data) return;
      const updated = { ...data };
      Object.entries(extractedData).forEach(([key, field]) => {
        if (field.value) {
          const prefixedKey = `${docType}_${key}`;
          if (prefixedKey in updated || key in updated) {
            updated[key in updated ? key : prefixedKey] = field.value;
          }
        }
      });
      onDataChange(updated);
    },
    [data, onDataChange],
  );

  const pwdCountdown = getPWDCountdown(data);

  const commonProps = { data, updateField, isEditing };

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="!text-base text-[#080118]">GC Processing Pipeline</CardTitle>
            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save
                  </Button>
                  {data?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="!p-[16px]">
          <div className="flex items-center justify-between mb-4">
            {STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id, data);
              const enabled = isStageEnabled(stage.id, data);
              return (
                <div key={stage.id} className="flex items-center flex-1 last:max-w-[80px]">
                  <div className="flex flex-col items-center text-center flex-1 max-w-[80px]">
                    <div className="flex justify-center mb-1.5">
                      {status === "completed" ? (
                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                      ) : status === "in_progress" ? (
                        <Clock className="h-7 w-7 text-primary animate-pulse" />
                      ) : (
                        <Circle
                          className={`h-7 w-7 ${enabled ? "text-muted-foreground" : "text-muted-foreground/30"}`}
                        />
                      )}
                    </div>
                    <p
                      className={`text-xs font-medium ${status !== "not_started" ? "text-foreground" : enabled ? "text-muted-foreground" : "text-muted-foreground/40"}`}
                    >
                      {stage.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0">{stage.description}</p>
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`h-0.5 w-full mx-1 mt-[-54px] ${status === "completed" ? "bg-green-500" : "bg-[#e7e7ef]"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* General Information */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="!text-sm !font-medium !text-[#080118]">General Information</CardTitle>
        </CardHeader>
        <CardContent className="!p-[16px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PipelineSelectField
              label="Category"
              field="gc_category"
              options={GC_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              {...commonProps}
            />
            <PipelineField label="Priority Date" field="priority_date" type="date" {...commonProps} />
            <PipelineField label="Sponsor Employer" field="sponsor_employer_name" {...commonProps} />
            <PipelineField label="Sponsor EIN" field="sponsor_employer_ein" {...commonProps} />
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PipelineField label="Attorney Name" field="attorney_name" {...commonProps} />
            <PipelineField label="Law Firm" field="attorney_firm" {...commonProps} />
            <PipelineField label="Attorney Email" field="attorney_email" {...commonProps} />
            <PipelineField label="Attorney Phone" field="attorney_phone" {...commonProps} />
          </div>
        </CardContent>
      </Card>

      {/* PWD Stage */}
      <Collapsible open={openStages.has("pwd")} onOpenChange={() => toggleStage("pwd")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="!text-sm !font-medium !text-[#080118]">
                    PWD — Prevailing Wage Determination
                  </CardTitle>
                  <StageBadge status={getStageStatus("pwd", data)} />
                </div>
                <div className="flex items-center gap-2">
                  {candidateEmail && isEditing && (
                    <SmartUploadButton
                      documentType="pwd_letter"
                      label="Smart Upload PWD"
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onDataExtracted={handleSmartUploadExtracted("pwd")}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openStages.has("pwd") ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
              {pwdCountdown && (
                <div
                  className={`flex items-center gap-1 text-xs mt-1 ${pwdCountdown.urgent ? "text-destructive" : "text-amber-600"}`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {pwdCountdown.days <= 0 ? "PWD has expired!" : `PWD expires in ${pwdCountdown.days} days`}
                </div>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="!p-[16px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PipelineField label="Tracking Number" field="pwd_tracking_number" {...commonProps} />
                <PipelineField label="Job Title" field="pwd_job_title" {...commonProps} />
                <PipelineField label="SOC Code" field="pwd_soc_code" {...commonProps} />
                <PipelineField label="SOC Title" field="pwd_soc_title" {...commonProps} />
                <PipelineSelectField
                  label="Wage Level"
                  field="pwd_wage_level"
                  options={[
                    { value: "Level I", label: "Level I" },
                    { value: "Level II", label: "Level II" },
                    { value: "Level III", label: "Level III" },
                    { value: "Level IV", label: "Level IV" },
                  ]}
                  {...commonProps}
                />
                <PipelineField label="Wage Amount" field="pwd_wage_amount" type="number" {...commonProps} />
                <PipelineSelectField
                  label="Wage Type"
                  field="pwd_wage_type"
                  options={[
                    { value: "Year", label: "Year" },
                    { value: "Hour", label: "Hour" },
                  ]}
                  {...commonProps}
                />
                <PipelineField label="Worksite City" field="pwd_worksite_city" {...commonProps} />
                <PipelineSelectField
                  label="Worksite State"
                  field="pwd_worksite_state"
                  options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
                  {...commonProps}
                />
                <PipelineField label="Filed Date" field="pwd_filed_date" type="date" {...commonProps} />
                <PipelineField label="Determination Date" field="pwd_determination_date" type="date" {...commonProps} />
                <PipelineField label="Validity Start" field="pwd_validity_start" type="date" {...commonProps} />
                <PipelineField label="Validity End" field="pwd_validity_end" type="date" {...commonProps} />
                <PipelineSelectField
                  label="PWD Status"
                  field="pwd_status"
                  options={[
                    { value: "not_started", label: "Not Started" },
                    { value: "filed", label: "Filed" },
                    { value: "received", label: "Received" },
                    { value: "expired", label: "Expired" },
                  ]}
                  {...commonProps}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Recruitment Stage */}
      <Collapsible
        open={openStages.has("recruitment")}
        onOpenChange={() => isStageEnabled("recruitment", data) && toggleStage("recruitment")}
      >
        <Card className={!isStageEnabled("recruitment", data) ? "opacity-50" : ""}>
          <CollapsibleTrigger asChild disabled={!isStageEnabled("recruitment", data)}>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="!text-sm !font-medium !text-[#080118]">Recruitment</CardTitle>
                  <StageBadge status={getStageStatus("recruitment", data)} />
                  {!isStageEnabled("recruitment", data) && (
                    <span className="text-xs text-muted-foreground">(Requires PWD received)</span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openStages.has("recruitment") ? "rotate-180" : ""}`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="!space-y-4 !p-[16px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <PipelineField label="Start Date" field="recruitment_start_date" type="date" {...commonProps} />
                <PipelineField label="End Date" field="recruitment_end_date" type="date" {...commonProps} />
                <PipelineSelectField
                  label="Status"
                  field="recruitment_status"
                  options={[
                    { value: "not_started", label: "Not Started" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ]}
                  {...commonProps}
                />
              </div>
              <Separator />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recruitment Checklist</p>
              <RecruitmentChecklistItem
                label="SWA Job Order"
                dateField="recruitment_swa_job_order_date"
                endDateField="recruitment_swa_posting_end_date"
                endDateLabel="Posting End"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Newspaper Ad #1"
                dateField="recruitment_newspaper_ad1_date"
                textField="recruitment_newspaper_ad1_publication"
                textLabel="Publication"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Newspaper Ad #2"
                dateField="recruitment_newspaper_ad2_date"
                textField="recruitment_newspaper_ad2_publication"
                textLabel="Publication"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Company Website"
                dateField="recruitment_company_website_start"
                endDateField="recruitment_company_website_end"
                endDateLabel="End Date"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Additional Step 1"
                dateField="recruitment_additional_step1_date"
                textField="recruitment_additional_step1"
                textLabel="Description"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Additional Step 2"
                dateField="recruitment_additional_step2_date"
                textField="recruitment_additional_step2"
                textLabel="Description"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <RecruitmentChecklistItem
                label="Additional Step 3"
                dateField="recruitment_additional_step3_date"
                textField="recruitment_additional_step3"
                textLabel="Description"
                data={data}
                isEditing={isEditing}
                onUpdate={updateField}
              />
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <PipelineField
                  label="Resumes Received"
                  field="recruitment_resumes_received"
                  type="number"
                  {...commonProps}
                />
                <PipelineField
                  label="Resumes Rejected"
                  field="recruitment_resumes_rejected"
                  type="number"
                  {...commonProps}
                />
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={data?.recruitment_notes || ""}
                    onChange={(e) => updateField("recruitment_notes", e.target.value)}
                    placeholder="Recruitment notes..."
                    className="text-sm min-h-[60px]"
                  />
                </div>
              ) : data?.recruitment_notes ? (
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</dt>
                  <dd className="text-sm text-foreground whitespace-pre-wrap">{data.recruitment_notes}</dd>
                </div>
              ) : null}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* PERM Stage */}
      <Collapsible
        open={openStages.has("perm")}
        onOpenChange={() => isStageEnabled("perm", data) && toggleStage("perm")}
      >
        <Card className={!isStageEnabled("perm", data) ? "opacity-50" : ""}>
          <CollapsibleTrigger asChild disabled={!isStageEnabled("perm", data)}>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="!text-sm !font-medium !text-[#080118]">PERM Labor Certification</CardTitle>
                  <StageBadge status={getStageStatus("perm", data)} />
                  {!isStageEnabled("perm", data) && (
                    <span className="text-xs text-muted-foreground">(Requires recruitment completed)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {candidateEmail && isEditing && isStageEnabled("perm", data) && (
                    <SmartUploadButton
                      documentType="perm_certification"
                      label="Smart Upload PERM"
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onDataExtracted={handleSmartUploadExtracted("perm")}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openStages.has("perm") ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="!p-[16px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PipelineField label="Case Number" field="perm_case_number" {...commonProps} />
                <PipelineField label="Filed Date" field="perm_filed_date" type="date" {...commonProps} />
                <PipelineField label="Job Title" field="perm_job_title" {...commonProps} />
                <PipelineField label="SOC Code" field="perm_soc_code" {...commonProps} />
                <PipelineField label="Offered Wage" field="perm_offered_wage" type="number" {...commonProps} />
                <PipelineField label="Worksite Address" field="perm_worksite_address" {...commonProps} />
                <PipelineField label="Worksite City" field="perm_worksite_city" {...commonProps} />
                <PipelineSelectField
                  label="Worksite State"
                  field="perm_worksite_state"
                  options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
                  {...commonProps}
                />
                <PipelineSelectField
                  label="Audit Status"
                  field="perm_audit_status"
                  options={[
                    { value: "none", label: "None" },
                    { value: "audit", label: "Audit" },
                    { value: "supervised_recruitment", label: "Supervised Recruitment" },
                  ]}
                  {...commonProps}
                />
                {data?.perm_audit_status === "audit" && (
                  <PipelineField
                    label="Audit Response Date"
                    field="perm_audit_response_date"
                    type="date"
                    {...commonProps}
                  />
                )}
                <PipelineField label="Approval Date" field="perm_approval_date" type="date" {...commonProps} />
                {data?.perm_status === "denied" && (
                  <>
                    <PipelineField label="Denial Date" field="perm_denial_date" type="date" {...commonProps} />
                    <PipelineField label="Denial Reason" field="perm_denial_reason" {...commonProps} />
                  </>
                )}
                <PipelineSelectField
                  label="PERM Status"
                  field="perm_status"
                  options={[
                    { value: "not_started", label: "Not Started" },
                    { value: "filed", label: "Filed" },
                    { value: "pending", label: "Pending" },
                    { value: "audit", label: "Audit" },
                    { value: "approved", label: "Approved" },
                    { value: "denied", label: "Denied" },
                  ]}
                  {...commonProps}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* I-140 Stage */}
      <Collapsible
        open={openStages.has("i140")}
        onOpenChange={() => isStageEnabled("i140", data) && toggleStage("i140")}
      >
        <Card className={!isStageEnabled("i140", data) ? "opacity-50" : ""}>
          <CollapsibleTrigger asChild disabled={!isStageEnabled("i140", data)}>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="!text-sm !font-medium !text-[#080118]">I-140 Immigrant Petition</CardTitle>
                  <StageBadge status={getStageStatus("i140", data)} />
                  {!isStageEnabled("i140", data) && (
                    <span className="text-xs text-muted-foreground">(Requires PERM approved)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {candidateEmail && isEditing && isStageEnabled("i140", data) && (
                    <SmartUploadButton
                      documentType="i140_approval"
                      label="Smart Upload I-140"
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onDataExtracted={handleSmartUploadExtracted("i140")}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openStages.has("i140") ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="!p-[16px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PipelineField label="Receipt Number" field="i140_receipt_number" {...commonProps} />
                <PipelineField label="Filed Date" field="i140_filed_date" type="date" {...commonProps} />
                {isEditing ? (
                  <div className="space-y-1">
                    <Label className="text-xs">Premium Processing</Label>
                    <div className="flex items-center gap-2 pt-1">
                      <Switch
                        checked={data?.i140_premium_processing || false}
                        onCheckedChange={(v) => updateField("i140_premium_processing", v)}
                      />
                      <span className="text-sm">{data?.i140_premium_processing ? "Yes" : "No"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Premium Processing
                    </dt>
                    <dd className="text-sm">{data?.i140_premium_processing ? "Yes" : "No"}</dd>
                  </div>
                )}
                {data?.i140_premium_processing && (
                  <PipelineField
                    label="Premium Receipt Date"
                    field="i140_premium_receipt_date"
                    type="date"
                    {...commonProps}
                  />
                )}
                <PipelineField label="Approval Date" field="i140_approval_date" type="date" {...commonProps} />
                {data?.i140_status === "denied" && (
                  <>
                    <PipelineField label="Denial Date" field="i140_denial_date" type="date" {...commonProps} />
                    <PipelineField label="Denial Reason" field="i140_denial_reason" {...commonProps} />
                  </>
                )}
                <PipelineSelectField
                  label="I-140 Status"
                  field="i140_status"
                  options={[
                    { value: "not_started", label: "Not Started" },
                    { value: "filed", label: "Filed" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "denied", label: "Denied" },
                  ]}
                  {...commonProps}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* I-485 Stage */}
      <Collapsible
        open={openStages.has("i485")}
        onOpenChange={() => isStageEnabled("i485", data) && toggleStage("i485")}
      >
        <Card className={!isStageEnabled("i485", data) ? "opacity-50" : ""}>
          <CollapsibleTrigger asChild disabled={!isStageEnabled("i485", data)}>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="!text-sm !font-medium !text-[#080118]">I-485 Adjustment of Status</CardTitle>
                  <StageBadge status={getStageStatus("i485", data)} />
                  {!isStageEnabled("i485", data) && (
                    <span className="text-xs text-muted-foreground">(Requires I-140 approved)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {candidateEmail && isEditing && isStageEnabled("i485", data) && (
                    <SmartUploadButton
                      documentType="i485_receipt"
                      label="Smart Upload I-485"
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onDataExtracted={handleSmartUploadExtracted("i485")}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openStages.has("i485") ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="!p-[16px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PipelineField label="Receipt Number" field="i485_receipt_number" {...commonProps} />
                <PipelineField label="Filed Date" field="i485_filed_date" type="date" {...commonProps} />
                <PipelineField label="Biometrics Date" field="i485_biometrics_date" type="date" {...commonProps} />
                <PipelineField label="Interview Date" field="i485_interview_date" type="date" {...commonProps} />
                <PipelineField label="Approval Date" field="i485_approval_date" type="date" {...commonProps} />
                {data?.i485_status === "denied" && (
                  <PipelineField label="Denial Date" field="i485_denial_date" type="date" {...commonProps} />
                )}
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Filed Combo EAD?</Label>
                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          checked={data?.i485_concurrent_ead || false}
                          onCheckedChange={(v) => updateField("i485_concurrent_ead", v)}
                        />
                        <span className="text-sm">{data?.i485_concurrent_ead ? "Yes" : "No"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Filed Advance Parole?</Label>
                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          checked={data?.i485_concurrent_ap || false}
                          onCheckedChange={(v) => updateField("i485_concurrent_ap", v)}
                        />
                        <span className="text-sm">{data?.i485_concurrent_ap ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Combo EAD</dt>
                      <dd className="text-sm">{data?.i485_concurrent_ead ? "Yes" : "No"}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Advance Parole
                      </dt>
                      <dd className="text-sm">{data?.i485_concurrent_ap ? "Yes" : "No"}</dd>
                    </div>
                  </>
                )}
                <PipelineSelectField
                  label="I-485 Status"
                  field="i485_status"
                  options={[
                    { value: "not_started", label: "Not Started" },
                    { value: "filed", label: "Filed" },
                    { value: "biometrics", label: "Biometrics" },
                    { value: "interview", label: "Interview" },
                    { value: "approved", label: "Approved" },
                    { value: "denied", label: "Denied" },
                  ]}
                  {...commonProps}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
