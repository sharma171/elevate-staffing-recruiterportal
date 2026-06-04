import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Trash2, ArrowUpCircle, Link, Zap, GraduationCap, AlertCircle } from "lucide-react";
import { getPetitionTypeLabel, getPetitionStatusLabel } from "./types/h1b-petitions";
import { PETITION_TYPES, PETITION_STATUSES, CAP_STATUSES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";

// Timezone-safe date formatting
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

// Format cap status for display
const formatCapStatus = (capStatus) => {
  if (!capStatus) return "";
  const labels = {
    cap_subject: "Cap Subject",
    cap_exempt: "Cap Exempt",
    cap_exempt_masters: "Cap Exempt (Masters)",
  };
  return labels[capStatus] || capStatus;
};

// Inline Edit Field Component
const EditField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Input
      type={type}
      value={value?.toString() || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
  </div>
);

// Inline Select Field Component
const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm">
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

// Display Field Component
const DisplayField = ({ label, value }) => (
  <div>
    <span className="text-xs text-muted-foreground block">{label}</span>
    <span className="text-sm">{value?.toString() || "—"}</span>
  </div>
);

export function H1BPetitionCard({
  petition,
  isCurrent,
  isEditing = false,
  onEdit,
  onChange,
  onDelete,
  onSetAsCurrent,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  candidateEmail,
  candidateId,
}) {
  const statusVariant =
    petition.status === "approved"
      ? "default"
      : petition.status === "denied" || petition.status === "withdrawn"
        ? "destructive"
        : petition.status === "rfe"
          ? "secondary"
          : "outline";

  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange({ ...petition, [field]: value });
    }
  };

  // Edit Mode Render
  if (isEditing) {
    return (
      <Card className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted bg-muted/30"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
            {!isCurrent && (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                PREVIOUS
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {isCurrent && candidateEmail && onI797DataExtracted && (
              <SmartUploadButton
                documentType="h1b_approval"
                label="Upload I-797"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onI797DataExtracted}
                onRawDataExtracted={onSaveI797}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
            {!isCurrent && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(petition.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Receipt Number"
            value={petition.receipt_number}
            onChange={(v) => handleFieldChange("receipt_number", v)}
            placeholder="IOE1234567890"
          />
          <SelectField
            label="Petition Type"
            value={petition.petition_type}
            onChange={(v) => handleFieldChange("petition_type", v)}
            options={PETITION_TYPES}
          />
          <SelectField
            label="Status"
            value={petition.status}
            onChange={(v) => handleFieldChange("status", v)}
            options={PETITION_STATUSES}
          />
          <SelectField
            label="Cap Status"
            value={petition.cap_status}
            onChange={(v) => handleFieldChange("cap_status", v)}
            options={CAP_STATUSES}
          />

          <div className="col-span-2">
            <EditField
              label="Employer Name"
              value={petition.employer_name}
              onChange={(v) => handleFieldChange("employer_name", v)}
            />
          </div>
          <EditField
            label="Employer FEIN"
            value={petition.employer_fein}
            onChange={(v) => handleFieldChange("employer_fein", v)}
            placeholder="XX-XXXXXXX"
          />

          <div className="flex items-center gap-2 pt-4">
            <Switch
              checked={petition.premium_processing || false}
              onCheckedChange={(v) => handleFieldChange("premium_processing", v)}
            />
            <span className="text-sm">Premium Processing</span>
          </div>

          <EditField
            label="Filed Date"
            value={petition.filed_date}
            onChange={(v) => handleFieldChange("filed_date", v)}
            type="date"
          />
          <EditField
            label="Approval Date"
            value={petition.approval_date}
            onChange={(v) => handleFieldChange("approval_date", v)}
            type="date"
          />
          <EditField
            label="Validity Start"
            value={petition.validity_start}
            onChange={(v) => handleFieldChange("validity_start", v)}
            type="date"
          />
          <EditField
            label="Validity End"
            value={petition.validity_end}
            onChange={(v) => handleFieldChange("validity_end", v)}
            type="date"
          />

          <div className="col-span-2">
            <EditField
              label="Job Title"
              value={petition.job_title}
              onChange={(v) => handleFieldChange("job_title", v)}
            />
          </div>
          <EditField
            label="SOC Code"
            value={petition.soc_code}
            onChange={(v) => handleFieldChange("soc_code", v)}
            placeholder="XX-XXXX"
          />
          <EditField label="SOC Title" value={petition.soc_title} onChange={(v) => handleFieldChange("soc_title", v)} />

          <EditField
            label="Linked LCA Number"
            value={petition.linked_lca_number}
            onChange={(v) => handleFieldChange("linked_lca_number", v)}
          />
          <EditField
            label="I-94 Number"
            value={petition.i94_number}
            onChange={(v) => handleFieldChange("i94_number", v)}
          />
          <EditField
            label="I-94 Expiry"
            value={petition.i94_expiry}
            onChange={(v) => handleFieldChange("i94_expiry", v)}
            type="date"
          />
        </div>
      </Card>
    );
  }

  // View Mode Render
  return (
    <Card className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted bg-muted/30"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
          {!isCurrent && (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              PREVIOUS
            </Badge>
          )}
          <span className="font-mono font-medium text-sm">{petition.receipt_number || "No Receipt #"}</span>
          <Badge variant="secondary" className="text-xs capitalize">
            {getPetitionTypeLabel(petition.petition_type)}
          </Badge>
          <Badge variant={statusVariant} className="text-xs capitalize">
            {getPetitionStatusLabel(petition.status)}
          </Badge>
          {petition.premium_processing && (
            <Badge variant="outline" className="text-xs border-accent text-accent-foreground bg-accent/10">
              <Zap className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isCurrent && candidateEmail && onI797DataExtracted && (
            <SmartUploadButton
              documentType="h1b_approval"
              label="Upload I-797"
              candidateEmail={candidateEmail}
              candidateId={candidateId}
              onDataExtracted={onI797DataExtracted}
              onRawDataExtracted={onSaveI797}
              onRefreshData={onRefreshData}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            />
          )}
          {!isCurrent && onSetAsCurrent && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSetAsCurrent(petition.id)}>
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
              Set as Current
            </Button>
          )}
          {!isCurrent && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(petition.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm font-medium mb-3">
        {petition.employer_name || "Unknown Employer"}
        {petition.employer_fein && (
          <span className="text-muted-foreground font-normal ml-2">(FEIN: {petition.employer_fein})</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <DisplayField
          label="Valid"
          value={`${formatDateSafe(petition.validity_start)} → ${formatDateSafe(petition.validity_end)}`}
        />
        {petition.filed_date && <DisplayField label="Filed" value={formatDateSafe(petition.filed_date)} />}
        {petition.approval_date && <DisplayField label="Approved" value={formatDateSafe(petition.approval_date)} />}
        {petition.cap_status && (
          <div>
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Cap Status
            </span>
            <span className="text-xs">{formatCapStatus(petition.cap_status)}</span>
          </div>
        )}
        {petition.linked_lca_number ? (
          <div>
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <Link className="h-3 w-3" />
              LCA
            </span>
            <span className="font-mono text-xs">{petition.linked_lca_number}</span>
          </div>
        ) : (
          <div>
            <span className="text-xs text-muted-foreground block">LCA</span>
            <span className="text-muted-foreground italic text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              No LCA linked
            </span>
          </div>
        )}
        {petition.i94_number && (
          <div>
            <span className="text-xs text-muted-foreground block">I-94</span>
            <span className="font-mono text-xs">{petition.i94_number}</span>
            {petition.i94_expiry && (
              <span className="text-xs text-muted-foreground ml-1">(exp: {formatDateSafe(petition.i94_expiry)})</span>
            )}
          </div>
        )}
        {petition.job_title && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground block">Position</span>
            <span>{petition.job_title}</span>
            {petition.soc_code && (
              <span className="text-muted-foreground text-xs ml-2">(SOC: {petition.soc_code})</span>
            )}
          </div>
        )}
      </div>

      {petition.notes && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block mb-1">Notes</span>
          <p className="text-sm text-muted-foreground">{petition.notes}</p>
        </div>
      )}
    </Card>
  );
}
