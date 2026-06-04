// Main status-aware petition card component
import { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Zap, Link, AlertCircle, Info, GraduationCap, User, FileText, Building2, MapPin } from "lucide-react";
import {
  getStatusConfig,
  formatDateSafe,
  getPetitionTypeLabel,
  formatCapStatus,
  calculateDaysSince,
} from "./petitionStatusConfig";
import {
  ApprovedDatesSection,
  PendingDatesSection,
  RFEDatesSection,
  DeniedDatesSection,
  WithdrawnDatesSection,
} from "./PetitionDatesSections";
import { PetitionActions } from "./PetitionActions";

// Helper functions to access nested data with fallback to flat fields
const getBeneficiaryName = (petition) => petition.beneficiary_data?.name || petition.beneficiary_name;
const getBeneficiaryANumber = (petition) => petition.beneficiary_data?.a_number || petition.beneficiary_a_number;
const getBeneficiaryDOB = (petition) => petition.beneficiary_data?.dob || petition.beneficiary_dob;
const getBeneficiaryCountry = (petition) =>
  petition.beneficiary_data?.country_of_birth || petition.beneficiary_country_of_birth;
const getI94Number = (petition) => petition.i94_data?.i94_number || petition.i94_number;
const getI94Class = (petition) => petition.i94_data?.i94_class || petition.i94_class;
const getI94Start = (petition) => petition.i94_data?.i94_validity_start || petition.i94_validity_start;
const getI94End = (petition) => petition.i94_data?.i94_validity_end || petition.i94_expiry;

// Options for dropdowns
const PETITION_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "extension", label: "Extension" },
  { value: "amendment", label: "Amendment" },
  { value: "transfer", label: "Transfer" },
  { value: "concurrent", label: "Concurrent" },
];

const PETITION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rfe", label: "RFE" },
  { value: "denied", label: "Denied" },
  { value: "withdrawn", label: "Withdrawn" },
];

const EditField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  setViewerLoading,
  viewerLoading,
}) => (
  <div className={`space-y-1 ${className || ""}`.trim()}>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Input
      type={type}
      value={value?.toString() || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, value, options, onChange, className }) => (
  <div className={`space-y-1 ${className || ""}`.trim()}>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Select value={value || "none"} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Select...</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export function PetitionStatusCard({
  petition,
  isCurrent,
  currentPetition,
  linkedLCA,
  lcaHistory = [],
  isEditing = false,
  hasOtherPetitions = false,
  candidateEmail,
  candidateId,
  onAction,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  onPetitionChange,
  onLinkLCA,
}) {
  const statusConfig = getStatusConfig(petition.status);
  const StatusIcon = statusConfig.icon;

  const isPending = petition.status === "pending";
  const isRFE = petition.status === "rfe";
  const isApproved = petition.status === "approved";
  const isDenied = petition.status === "denied";
  const isWithdrawn = petition.status === "withdrawn";
  const isInProgress = isPending || isRFE;

  const daysPending = calculateDaysSince(petition.filed_date);

  const [isLinking, setIsLinking] = useState(false);
  const [showLCADropdown, setShowLCADropdown] = useState(false);

  const useCurrentStyle = isCurrent && isApproved;
  const availableLCAs = lcaHistory.filter((lca) => lca.status === "certified");

  const handleLinkLCA = async (lcaId) => {
    if (!onLinkLCA || lcaId === "none") return;
    setIsLinking(true);
    try {
      await onLinkLCA(petition.id, lcaId);
      setShowLCADropdown(false);
    } finally {
      setIsLinking(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (onPetitionChange) onPetitionChange({ ...petition, [field]: value });
  };

  const handleBeneficiaryChange = (field, value) => {
    const beneficiary_data = { ...(petition.beneficiary_data || {}), [field]: value };
    handleFieldChange("beneficiary_data", beneficiary_data);
  };

  const handleI94Change = (field, value) => {
    const i94_data = { ...(petition.i94_data || {}), [field]: value };
    handleFieldChange("i94_data", i94_data);
  };

  // EDIT MODE.
  if (isEditing) {
    return (
      <Card
        className={`p-3 !space-y-4 rounded-[10px] ring-1 ${
          isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-[#f1f1f9] bg-[#f1f1f94d]"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent ? (
              <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                {petition.status?.toUpperCase() || "PETITION"}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
            {petition.premium_processing && (
              <Badge variant="outline" className="text-xs border-accent text-accent-foreground bg-accent/10">
                <Zap className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <PetitionActions
            petition={petition}
            isCurrent={isCurrent}
            isEditing={isEditing}
            hasOtherPetitions={hasOtherPetitions}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            onAction={onAction}
            onI797DataExtracted={onI797DataExtracted}
            onSaveI797={onSaveI797}
            onRefreshData={onRefreshData}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Receipt Number"
            value={petition.receipt_number}
            onChange={(val) => handleFieldChange("receipt_number", val)}
          />
          <SelectField
            label="Petition Type"
            value={petition.petition_type}
            options={PETITION_TYPES}
            onChange={(val) => handleFieldChange("petition_type", val)}
          />
          <SelectField
            label="Status"
            value={petition.status}
            options={PETITION_STATUSES}
            onChange={(val) => handleFieldChange("status", val)}
          />
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2 h-8">
              <Checkbox
                id={`premium-${petition.id}`}
                checked={petition.premium_processing || false}
                onCheckedChange={(checked) => handleFieldChange("premium_processing", checked === true)}
              />
              <label htmlFor={`premium-${petition.id}`} className="text-sm">
                Premium Processing
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Employer Name"
            value={petition.employer_name}
            onChange={(val) => handleFieldChange("employer_name", val)}
            className="col-span-2"
          />
          <EditField
            label="Employer FEIN"
            value={petition.employer_fein}
            onChange={(val) => handleFieldChange("employer_fein", val)}
          />
          <EditField
            label="Classification"
            value={petition.classification}
            onChange={(val) => handleFieldChange("classification", val)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <EditField
            label="Filed Date"
            value={petition.filed_date}
            type="date"
            onChange={(val) => handleFieldChange("filed_date", val)}
          />
          <EditField
            label="Notice Date"
            value={petition.notice_date}
            type="date"
            onChange={(val) => handleFieldChange("notice_date", val)}
          />
          <EditField
            label="Approval Date"
            value={petition.approval_date}
            type="date"
            onChange={(val) => handleFieldChange("approval_date", val)}
          />
          <EditField
            label="Valid From"
            value={petition.validity_start}
            type="date"
            onChange={(val) => handleFieldChange("validity_start", val)}
          />
          <EditField
            label="Valid To"
            value={petition.validity_end}
            type="date"
            onChange={(val) => handleFieldChange("validity_end", val)}
          />
        </div>

        <div className="p-3 bg-background rounded-[10px] border space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beneficiary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="Name"
              value={petition.beneficiary_data?.name || petition.beneficiary_name}
              onChange={(val) => handleBeneficiaryChange("name", val)}
            />
            <EditField
              label="A-Number"
              value={petition.beneficiary_data?.a_number || petition.beneficiary_a_number}
              onChange={(val) => handleBeneficiaryChange("a_number", val)}
            />
            <EditField
              label="Date of Birth"
              value={petition.beneficiary_data?.dob || petition.beneficiary_dob}
              type="date"
              onChange={(val) => handleBeneficiaryChange("dob", val)}
            />
            <EditField
              label="Country of Birth"
              value={petition.beneficiary_data?.country_of_birth || petition.beneficiary_country_of_birth}
              onChange={(val) => handleBeneficiaryChange("country_of_birth", val)}
            />
          </div>
        </div>

        <div className="p-3 bg-background rounded-[10px] border space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">I-94 Information</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="I-94 Number"
              value={petition.i94_data?.i94_number || petition.i94_number}
              onChange={(val) => handleI94Change("i94_number", val)}
            />
            <EditField
              label="Class of Admission"
              value={petition.i94_data?.i94_class || petition.i94_class}
              onChange={(val) => handleI94Change("i94_class", val)}
            />
            <EditField
              label="Valid From"
              value={petition.i94_data?.i94_validity_start || petition.i94_validity_start}
              type="date"
              onChange={(val) => handleI94Change("i94_validity_start", val)}
            />
            <EditField
              label="Valid To"
              value={petition.i94_data?.i94_validity_end || petition.i94_expiry}
              type="date"
              onChange={(val) => handleI94Change("i94_validity_end", val)}
            />
          </div>
        </div>

        <div className="p-3 bg-background rounded-[10px] border space-y-3">
          <div className="flex items-center gap-2">
            <Link className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Linked LCA</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select LCA</label>
              <Select
                value={petition.lca_id || "none"}
                onValueChange={(val) => {
                  if (val === "none") handleFieldChange("lca_id", null);
                  else handleFieldChange("lca_id", val);
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select LCA..." />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="none">Not linked</SelectItem>
                  {availableLCAs.map((lca) => (
                    <SelectItem key={lca.id} value={lca.id}>
                      {lca.case_number} — {lca.job_title || "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {linkedLCA && (
              <div className="text-xs text-muted-foreground pt-6">
                {linkedLCA.status} • Valid: {formatDateSafe(linkedLCA.validity_start)} →{" "}
                {formatDateSafe(linkedLCA.validity_end)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SelectField
            label="Cap Status"
            value={petition.cap_status || ""}
            options={[
              { value: "cap_exempt", label: "Cap Exempt" },
              { value: "cap_exempt_masters", label: "Cap Exempt (Masters)" },
              { value: "cap_subject", label: "Cap Subject" },
            ]}
            onChange={(val) => handleFieldChange("cap_status", val === "none" ? undefined : val)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
          <Textarea
            value={petition.notes || ""}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="text-sm min-h-[60px]"
            placeholder="Add any notes..."
          />
        </div>
      </Card>
    );
  }

  // VIEW MODE
  return (
    <Card
      className={`overflow-hidden rounded-[10px] ring-1 ${
        useCurrentStyle ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : statusConfig.headerBg
      }`}
    >
      <div
        className={`px-3 py-3 flex items-center justify-between border-b ${useCurrentStyle ? "bg-transparent border-primary/30" : statusConfig.headerBg || ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
          <span className="font-semibold text-sm">{isCurrent ? "CURRENT" : statusConfig.headerLabel}</span>
          <Badge className={`text-xs ${statusConfig.badgeClass}`}>{statusConfig.label}</Badge>
          {petition.premium_processing && (
            <Badge variant="outline" className="text-xs border-accent text-accent-foreground bg-accent/10">
              <Zap className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {isInProgress && daysPending !== null && (
            <span className="text-xs text-muted-foreground ml-2">⏱️ {daysPending} days since filing</span>
          )}
        </div>
        <PetitionActions
          petition={petition}
          isCurrent={isCurrent}
          isEditing={isEditing}
          hasOtherPetitions={hasOtherPetitions}
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onAction={onAction}
          onI797DataExtracted={onI797DataExtracted}
          onSaveI797={onSaveI797}
          onRefreshData={onRefreshData}
        />
      </div>

      <div className="p-3 !space-y-4 bg-[#fff]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-muted-foreground block">Receipt Number</span>
            <span className="font-mono font-semibold text-sm">{petition.receipt_number || "—"}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Type / Classification</span>
            <span className="text-sm capitalize">
              {getPetitionTypeLabel(petition.petition_type)} | {petition.classification || "H-1B"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground block">Employer</span>
            <span className="text-sm font-medium">{petition.employer_name || "—"}</span>
            {petition.employer_fein && (
              <span className="text-xs text-muted-foreground ml-2">(FEIN: {petition.employer_fein})</span>
            )}
            {petition.employer_address && (
              <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">
                {petition.employer_address}
              </div>
            )}
          </div>
        </div>

        {isApproved && <ApprovedDatesSection petition={petition} />}
        {isPending && <PendingDatesSection petition={petition} />}
        {isRFE && <RFEDatesSection petition={petition} />}
        {isDenied && <DeniedDatesSection petition={petition} />}
        {isWithdrawn && <WithdrawnDatesSection petition={petition} />}

        {isInProgress && (
          <div className="p-3 bg-muted/30 rounded-[10px] border space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What's Available</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  LCA
                </span>
                {linkedLCA ? (
                  <span className="font-mono text-xs">
                    {linkedLCA.case_number} ({linkedLCA.status})
                  </span>
                ) : petition.linked_lca_number ? (
                  <span className="font-mono text-xs">{petition.linked_lca_number}</span>
                ) : (
                  <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Not linked
                  </span>
                )}
              </div>
              {getBeneficiaryName(petition) && (
                <div>
                  <span className="text-xs text-muted-foreground">Beneficiary</span>
                  <div className="text-xs">
                    {getBeneficiaryName(petition)}
                    {getBeneficiaryANumber(petition) && (
                      <span className="text-muted-foreground ml-1">({getBeneficiaryANumber(petition)})</span>
                    )}
                  </div>
                </div>
              )}
              {petition.job_title && (
                <div>
                  <span className="text-xs text-muted-foreground">Position</span>
                  <div className="text-xs">
                    {petition.job_title}
                    {petition.soc_code && (
                      <span className="text-muted-foreground ml-1">(SOC: {petition.soc_code})</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isApproved && getBeneficiaryName(petition) && (
          <div className="p-3 bg-muted/30 rounded-[10px] border">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Beneficiary</span>
            </div>
            <div className="font-medium text-sm">{getBeneficiaryName(petition)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {getBeneficiaryANumber(petition) && <span>A# {getBeneficiaryANumber(petition)} • </span>}
              {getBeneficiaryDOB(petition) && <span>DOB: {formatDateSafe(getBeneficiaryDOB(petition))} • </span>}
              {getBeneficiaryCountry(petition)}
            </div>
          </div>
        )}

        {isApproved && getI94Number(petition) && (
          <div className="p-3 bg-muted/30 rounded-[10px] border">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">I-94 Information</span>
            </div>
            <div className="font-mono text-sm font-medium">{getI94Number(petition)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {getI94Class(petition) && <span>Class: {getI94Class(petition)} • </span>}
              Valid: {formatDateSafe(getI94Start(petition))} → {formatDateSafe(getI94End(petition))}
            </div>
          </div>
        )}

        {linkedLCA ? (
          <div className="p-3 bg-primary/5 rounded-[10px] border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Link className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Linked LCA</span>
              </div>
              {onLinkLCA && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary hover:text-primary"
                  onClick={() => setShowLCADropdown(true)}
                >
                  Change
                </Button>
              )}
            </div>
            <div className="font-mono text-sm font-medium">{linkedLCA.case_number}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs mr-2 capitalize">
                {linkedLCA.status}
              </Badge>
              Valid: {formatDateSafe(linkedLCA.validity_start)} → {formatDateSafe(linkedLCA.validity_end)}
            </div>
            {(linkedLCA.job_title || linkedLCA.soc_code || linkedLCA.soc_title) && (
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] border-primary/10">
                <div>
                  <span className="text-xs text-muted-foreground block">Job Title</span>
                  <div className="text-sm font-medium">{linkedLCA.job_title || "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">SOC Code</span>
                  <div className="text-sm font-medium">{linkedLCA.soc_code || "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">SOC Title</span>
                  <div className="text-sm font-medium">{linkedLCA.soc_title || "—"}</div>
                </div>
              </div>
            )}
            {linkedLCA.worksites && linkedLCA.worksites.length > 0 && (
              <div className="mt-3 pt-3 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] border-primary/10 space-y-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Worksites ({linkedLCA.worksites.length})
                </span>
                {linkedLCA.worksites.map((ws, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs bg-background/50 p-2 rounded">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{ws.worksite_name || "Worksite"}</div>
                      <div className="text-muted-foreground">
                        {[ws.address_line1, ws.city, ws.state, ws.zip_code].filter(Boolean).join(", ")}
                      </div>
                      {linkedLCA.actual_wage && (
                        <div className="text-muted-foreground mt-1">
                          💰 ${Number(linkedLCA.actual_wage).toLocaleString()}/{linkedLCA.wage_unit || "year"}
                          {linkedLCA.prevailing_wage && (
                            <span className="ml-2">
                              • Prevailing: ${Number(linkedLCA.prevailing_wage).toLocaleString()}
                            </span>
                          )}
                          {linkedLCA.wage_level && (
                            <span className="ml-2">
                              • {linkedLCA.wage_level.replace("_", " ").replace("level", "Level")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {ws.is_primary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : showLCADropdown || (!linkedLCA && availableLCAs.length > 0) ? (
          <div className="p-3 bg-muted/30 rounded-[10px] border border-dashed">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">LCA: Not linked</span>
              </div>
              <Select value="none" onValueChange={handleLinkLCA} disabled={isLinking}>
                <SelectTrigger className="w-[280px] h-8 text-sm">
                  <SelectValue placeholder={isLinking ? "Linking..." : "Link LCA..."} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="none">Select LCA...</SelectItem>
                  {availableLCAs.map((lca) => (
                    <SelectItem key={lca.id} value={lca.id}>
                      <div className="flex flex-col">
                        <span className="font-mono">{lca.case_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {lca.job_title || "N/A"} • {formatDateSafe(lca.validity_start)} →{" "}
                          {formatDateSafe(lca.validity_end)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/30 rounded-[10px] border border-dashed">
            <div className="flex items-center gap-2">
              <Link className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">LCA: Not linked</span>
              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground italic">No certified LCAs available</span>
            </div>
          </div>
        )}

        {isApproved && petition.cap_status && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cap Status:</span>
            <span className="text-xs font-medium">{formatCapStatus(petition.cap_status)}</span>
          </div>
        )}

        {isInProgress && currentPetition && currentPetition.id !== petition.id && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-[10px] flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              Current petition ({currentPetition.receipt_number}) remains active. Candidate can continue working under
              the approved petition.
            </div>
          </div>
        )}

        {isRFE && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-[10px] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <strong>RFE Received:</strong> USCIS has requested additional evidence. Typical RFE response deadline is
              87 days. Coordinate with immigration attorney.
            </div>
          </div>
        )}

        {isDenied && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              This petition was denied. Review denial notice for options (appeal, motion to reopen, new filing).
            </div>
          </div>
        )}

        {petition.notes && (
          <div className="pt-3 border-t">
            <span className="text-xs text-muted-foreground block mb-1">Notes</span>
            <p className="text-sm text-muted-foreground">{petition.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
