import { useState, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import {
  Trash2,
  ArrowUpCircle,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  Scale,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getLCAStatusLabel,
  getLCATypeLabel,
  LCA_TYPES,
  LCA_STATUSES,
  WAGE_LEVELS,
  WAGE_UNITS,
} from "./types/h1b-petitions";
import { SmartUploadButton } from "./SmartUploadButton";
import { PAFGeneratorModal } from "./PAFGeneratorModal";
import { getPAFs } from "../../../utils/immigrationDocumentsApiService";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import { toast } from "react-toastify";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const formatCurrency = (value, unit) => {
  if (!value) return "—";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
  return unit && unit !== "year" ? `${formatted}/${unit}` : `${formatted}/yr`;
};

const formatWageLevel = (level) => {
  if (!level) return "";
  const labels = {
    level_1: "Level I (Entry)",
    level_2: "Level II (Qualified)",
    level_3: "Level III (Experienced)",
    level_4: "Level IV (Fully Competent)",
  };
  return labels[level] || level;
};

const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
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

export function LCAHistoryCard({
  lca,
  isCurrent,
  isEditing = false,
  hasOtherLCAs = false,
  onEdit,
  onChange,
  onDelete,
  viewerLoading,
  setViewerLoading,
  onSetAsCurrent,
  onLCADataExtracted,
  onSaveLCA,
  onRefreshData,
  candidateEmail,
  candidateId,
  documents,
  onViewDocument,
  fileLoader,
}) {
  const [expandedWorksites, setExpandedWorksites] = useState([]);
  const [showAttorney, setShowAttorney] = useState(false);
  const [step, setStep] = useState(""); // loading | form | generating | success
  const [showPAFModal, setShowPAFModal] = useState(false);
  const [pafRecords, setPafRecords] = useState([]);
  const [pafLoading, setPafLoading] = useState(false);

  function DocumentViewer(filename) {
    if (filename) {
      onViewDocument?.(filename);
      fileLoader?.();
    }
  }

  // Load existing PAFs for this LCA
  const loadPAFs = () => {
    if (!lca?.id || !candidateEmail || isEditing) return;
    setPafLoading(true);
    getPAFs(candidateEmail, lca.id)
      .then((result) => {
        const records = result?.paf_records || result?.data || (Array.isArray(result) ? result : []);
        setPafRecords(Array.isArray(records) ? records : []);
      })
      .catch(() => setPafRecords([]))
      .finally(() => setPafLoading(false));
  };

  useEffect(() => {
    loadPAFs();
  }, [lca?.id, candidateEmail, isEditing]);

  const activePAF = pafRecords.find((p) => p.status === "active");

  const statusVariant =
    lca.status === "certified"
      ? "default"
      : lca.status === "denied" || lca.status === "withdrawn"
        ? "destructive"
        : "secondary";

  const handleFieldChange = (field, value) => {
    if (onChange) onChange({ ...lca, [field]: value });
  };

  const handleAddWorksite = () => {
    const newWorksite = { worksite_name: "", address_line1: "", city: "", state: "", zip_code: "", is_primary: false };
    const worksites = [...(lca.worksites || []), newWorksite];
    handleFieldChange("worksites", worksites);
    setExpandedWorksites([...expandedWorksites, worksites.length - 1]);
  };

  const handleRemoveWorksite = (index) => {
    const worksites = (lca.worksites || []).filter((_, i) => i !== index);
    handleFieldChange("worksites", worksites);
    setExpandedWorksites(expandedWorksites.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const handleWorksiteChange = (index, field, value) => {
    const worksites = [...(lca.worksites || [])];
    worksites[index] = { ...worksites[index], [field]: value };
    if (field === "is_primary" && value === true)
      worksites.forEach((ws, i) => {
        if (i !== index) ws.is_primary = false;
      });
    handleFieldChange("worksites", worksites);
  };

  const handleAttorneyChange = (field, value) => {
    const attorney = { ...(lca.attorney || {}), [field]: value };
    handleFieldChange("attorney", attorney);
  };

  const toggleWorksiteExpanded = (index) => {
    setExpandedWorksites((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const hasAttorneyInfo =
    lca.attorney && (lca.attorney.name || lca.attorney.firm_name || lca.attorney.email || lca.attorney.phone);

  // Edit Mode
  if (isEditing) {
    return (
      <Card className={`p-4 ${isCurrent ? "border-[#7c3bed]/50 bg-[#7c3bed]/5" : "border-[#e5e7eb] bg-[#f3f4f6]/30"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent ? (
              <Badge className="bg-[#7c3bed] text-white text-xs">CURRENT</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                PREVIOUS
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {isCurrent && candidateEmail && onLCADataExtracted && (
              <SmartUploadButton
                documentType="lca"
                label="Upload LCA"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onLCADataExtracted}
                onRawDataExtracted={onSaveLCA}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                DocumentViewer(lca?.document_file_name);
              }}
            >
              {viewerLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1" />
              )}
              View LCA
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(lca.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Case Number"
            value={lca.case_number}
            onChange={(v) => handleFieldChange("case_number", v)}
            placeholder="I-200-XXXXX-XXXXXX"
          />
          <SelectField
            label="LCA Type"
            value={lca.lca_type}
            onChange={(v) => handleFieldChange("lca_type", v)}
            options={LCA_TYPES}
          />
          <SelectField
            label="Status"
            value={lca.status}
            onChange={(v) => handleFieldChange("status", v)}
            options={LCA_STATUSES}
          />
          <div className="flex items-center gap-2 pt-4">
            <Switch checked={lca.full_time ?? true} onCheckedChange={(v) => handleFieldChange("full_time", v)} />
            <span className="text-sm">Full-Time</span>
          </div>
          <EditField
            label="Certified Date"
            value={lca.certified_date}
            onChange={(v) => handleFieldChange("certified_date", v)}
            type="date"
          />
          <EditField
            label="Validity Start"
            value={lca.validity_start}
            onChange={(v) => handleFieldChange("validity_start", v)}
            type="date"
          />
          <EditField
            label="Validity End"
            value={lca.validity_end}
            onChange={(v) => handleFieldChange("validity_end", v)}
            type="date"
          />
          <div className="col-span-2">
            <EditField label="Job Title" value={lca.job_title} onChange={(v) => handleFieldChange("job_title", v)} />
          </div>
          <EditField
            label="SOC Code"
            value={lca.soc_code}
            onChange={(v) => handleFieldChange("soc_code", v)}
            placeholder="XX-XXXX"
          />
          <EditField label="SOC Title" value={lca.soc_title} onChange={(v) => handleFieldChange("soc_title", v)} />
          <SelectField
            label="Wage Level"
            value={lca.wage_level}
            onChange={(v) => handleFieldChange("wage_level", v)}
            options={WAGE_LEVELS}
          />
          <EditField
            label="Prevailing Wage"
            value={lca.prevailing_wage}
            onChange={(v) => handleFieldChange("prevailing_wage", parseFloat(v) || 0)}
            type="number"
          />
          <EditField
            label="Actual Wage"
            value={lca.actual_wage}
            onChange={(v) => handleFieldChange("actual_wage", parseFloat(v) || 0)}
            type="number"
          />
          <SelectField
            label="Wage Unit"
            value={lca.wage_unit}
            onChange={(v) => handleFieldChange("wage_unit", v)}
            options={WAGE_UNITS}
          />
          <div className="col-span-2">
            <EditField
              label="Employer Name"
              value={lca.employer_name}
              onChange={(v) => handleFieldChange("employer_name", v)}
            />
          </div>
          <EditField
            label="Employer FEIN"
            value={lca.employer_fein}
            onChange={(v) => handleFieldChange("employer_fein", v)}
            placeholder="XX-XXXXXXX"
          />
        </div>

        {/* Worksites Section */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Worksites ({lca.worksites?.length || 0})
            </span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddWorksite}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Worksite
            </Button>
          </div>
          <div className="space-y-3">
            {(lca.worksites || []).map((worksite, index) => (
              <Collapsible
                key={index}
                open={expandedWorksites.includes(index)}
                onOpenChange={() => toggleWorksiteExpanded(index)}
              >
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        {expandedWorksites.includes(index) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{worksite.worksite_name || `Worksite ${index + 1}`}</span>
                        {worksite.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {worksite.city && (
                          <span className="text-xs text-muted-foreground">
                            — {worksite.city}, {worksite.state}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWorksite(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-background">
                      <div className="col-span-2">
                        <EditField
                          label="Client/Worksite Name"
                          value={worksite.worksite_name}
                          onChange={(v) => handleWorksiteChange(index, "worksite_name", v)}
                          placeholder="End Client Name"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <Switch
                          checked={worksite.is_primary || false}
                          onCheckedChange={(v) => handleWorksiteChange(index, "is_primary", v)}
                        />
                        <span className="text-sm">Primary Worksite</span>
                      </div>
                      <div className="col-span-2">
                        <EditField
                          label="Address Line 1"
                          value={worksite.address_line1}
                          onChange={(v) => handleWorksiteChange(index, "address_line1", v)}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="col-span-2">
                        <EditField
                          label="Address Line 2"
                          value={worksite.address_line2}
                          onChange={(v) => handleWorksiteChange(index, "address_line2", v)}
                          placeholder="Suite, floor, etc."
                        />
                      </div>
                      <EditField
                        label="City"
                        value={worksite.city}
                        onChange={(v) => handleWorksiteChange(index, "city", v)}
                      />
                      <EditField
                        label="State"
                        value={worksite.state}
                        onChange={(v) => handleWorksiteChange(index, "state", v)}
                        placeholder="CA"
                      />
                      <EditField
                        label="County"
                        value={worksite.county}
                        onChange={(v) => handleWorksiteChange(index, "county", v)}
                      />
                      <EditField
                        label="ZIP Code"
                        value={worksite.zip_code}
                        onChange={(v) => handleWorksiteChange(index, "zip_code", v)}
                        placeholder="12345"
                      />
                      <div className="col-span-4 pt-2 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] mt-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Client Contact (Optional)
                        </span>
                      </div>
                      <EditField
                        label="Contact Name"
                        value={worksite.client_contact_name}
                        onChange={(v) => handleWorksiteChange(index, "client_contact_name", v)}
                      />
                      <EditField
                        label="Phone"
                        value={worksite.client_contact_phone}
                        onChange={(v) => handleWorksiteChange(index, "client_contact_phone", v)}
                        type="tel"
                      />
                      <EditField
                        label="Email"
                        value={worksite.client_contact_email}
                        onChange={(v) => handleWorksiteChange(index, "client_contact_email", v)}
                        type="email"
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
            {(!lca.worksites || lca.worksites.length === 0) && (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed rounded-lg">
                No worksites added. Click "Add Worksite" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Attorney Section */}
        <Collapsible open={showAttorney} onOpenChange={setShowAttorney}>
          <div className="mt-3 pt-3 border-t">
            <CollapsibleTrigger asChild>
              <div className="w-full justify-content-start text-muted-foreground p-0 h-auto hover:bg-transparent">
                {showAttorney ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                <Scale className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm text-foreground">Attorney / Representative</span>
                {hasAttorneyInfo && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    Info Added
                  </Badge>
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/20 rounded-lg">
                <EditField
                  label="Attorney Name"
                  value={lca.attorney?.name}
                  onChange={(v) => handleAttorneyChange("name", v)}
                />
                <EditField
                  label="Firm Name"
                  value={lca.attorney?.firm_name}
                  onChange={(v) => handleAttorneyChange("firm_name", v)}
                />
                <EditField
                  label="Bar Number"
                  value={lca.attorney?.bar_number}
                  onChange={(v) => handleAttorneyChange("bar_number", v)}
                />
                <EditField
                  label="Phone"
                  value={lca.attorney?.phone}
                  onChange={(v) => handleAttorneyChange("phone", v)}
                  type="tel"
                />
                <div className="col-span-2">
                  <EditField
                    label="Email"
                    value={lca.attorney?.email}
                    onChange={(v) => handleAttorneyChange("email", v)}
                    type="email"
                  />
                </div>
                <div className="col-span-2">
                  <EditField
                    label="Address Line 1"
                    value={lca.attorney?.address_line1}
                    onChange={(v) => handleAttorneyChange("address_line1", v)}
                  />
                </div>
                <EditField label="City" value={lca.attorney?.city} onChange={(v) => handleAttorneyChange("city", v)} />
                <EditField
                  label="State"
                  value={lca.attorney?.state}
                  onChange={(v) => handleAttorneyChange("state", v)}
                />
                <EditField
                  label="ZIP Code"
                  value={lca.attorney?.zip_code}
                  onChange={(v) => handleAttorneyChange("zip_code", v)}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </Card>
    );
  }

  // View Mode

  return (
    <Card
      className={`p-[14px] m-[1px] ring-1 ${isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-[#f1f1f9] bg-[#f1f1f94d]"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isCurrent ? (
            <Badge className="bg-[#7c3bed] text-white text-xs">CURRENT</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              PREVIOUS
            </Badge>
          )}
          <span className="font-mono font-medium text-sm">{lca.case_number || "No Case #"}</span>
          <Badge variant="secondary" className="text-xs capitalize">
            {getLCATypeLabel(lca.lca_type)}
          </Badge>
          {lca.status && (
            <Badge variant={statusVariant} className="text-xs capitalize">
              {getLCAStatusLabel(lca.status)}
            </Badge>
          )}
          {lca.full_time !== undefined && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {lca.full_time ? "Full-Time" : "Part-Time"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* {isCurrent && candidateEmail && onLCADataExtracted && (
            <SmartUploadButton
              documentType="lca"
              label="Upload LCA"
              candidateEmail={candidateEmail}
              candidateId={candidateId}
              onDataExtracted={onLCADataExtracted}
              onRawDataExtracted={onSaveLCA}
              onRefreshData={onRefreshData}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            />
          )} */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              DocumentViewer(lca?.document_file_name);
            }}
          >
            {viewerLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5 mr-1" />
            )}
            View LCA
          </Button>
          {!isCurrent && onSetAsCurrent && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSetAsCurrent(lca.id)}>
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
              Set as Current
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(lca.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm font-medium mb-1">{lca.job_title || "Unknown Job Title"}</div>
      {(lca.soc_code || lca.soc_title) && (
        <div className="text-xs text-muted-foreground mb-3">
          SOC: {lca.soc_code} — {lca.soc_title}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Valid</span>
          <span>
            {formatDateSafe(lca.validity_start)} → {formatDateSafe(lca.validity_end)}
          </span>
        </div>
        {lca.certified_date && (
          <div>
            <span className="text-xs text-muted-foreground block">Certified</span>
            <span>{formatDateSafe(lca.certified_date)}</span>
          </div>
        )}
        {lca.wage_level && (
          <div>
            <span className="text-xs text-muted-foreground block">Wage Level</span>
            <span className="text-xs">{formatWageLevel(lca.wage_level)}</span>
          </div>
        )}
        {(lca.prevailing_wage || lca.actual_wage) && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Wages
            </span>
            <div className="flex items-center gap-3 text-xs">
              {lca.prevailing_wage && (
                <span>
                  <span className="text-muted-foreground">Prevailing:</span>{" "}
                  {formatCurrency(lca.prevailing_wage, lca.wage_unit)}
                </span>
              )}
              {lca.actual_wage && (
                <span>
                  <span className="text-muted-foreground">Actual:</span>{" "}
                  {formatCurrency(lca.actual_wage, lca.wage_unit)}
                </span>
              )}
            </div>
          </div>
        )}
        {lca.employer_name && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground block">Employer</span>
            <span>{lca.employer_name}</span>
            {lca.employer_fein && (
              <span className="text-muted-foreground text-xs ml-2">(FEIN: {lca.employer_fein})</span>
            )}
          </div>
        )}
      </div>

      {lca.worksites && lca.worksites.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3" />
            Worksites ({lca.worksites.length})
          </span>
          <div className="space-y-2">
            {lca.worksites.map((worksite, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${worksite.is_primary ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium text-sm">{worksite.worksite_name || "Unnamed Worksite"}</span>
                      {worksite.is_primary && (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 ml-5">
                      {worksite.address_line1 && <div>{worksite.address_line1}</div>}
                      {worksite.address_line2 && <div>{worksite.address_line2}</div>}
                      <div>
                        {[worksite.city, worksite.state, worksite.zip_code].filter(Boolean).join(", ")}
                        {worksite.county && ` (${worksite.county} County)`}
                      </div>
                    </div>
                    {worksite.client_contact_name && (
                      <div className="text-xs mt-1 ml-5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {worksite.client_contact_name}
                        </span>
                        {worksite.client_contact_phone && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {worksite.client_contact_phone}
                          </span>
                        )}
                        {worksite.client_contact_email && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {worksite.client_contact_email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasAttorneyInfo && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block flex items-center gap-1 mb-2">
            <Scale className="h-3 w-3" />
            Attorney / Representative
          </span>
          <div className="bg-muted/20 rounded-md p-2">
            <div className="flex items-center gap-2">
              {lca.attorney?.name && <span className="font-medium text-sm">{lca.attorney.name}</span>}
              {lca.attorney?.bar_number && (
                <Badge variant="outline" className="text-xs">
                  Bar# {lca.attorney.bar_number}
                </Badge>
              )}
            </div>
            {lca.attorney?.firm_name && <div className="text-xs text-muted-foreground">{lca.attorney.firm_name}</div>}
            <div className="flex items-center gap-3 text-xs mt-1">
              {lca.attorney?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lca.attorney.email}
                </span>
              )}
              {lca.attorney?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lca.attorney.phone}
                </span>
              )}
            </div>
            {(lca.attorney?.address_line1 || lca.attorney?.city) && (
              <div className="text-xs text-muted-foreground mt-1">
                {lca.attorney.address_line1}
                {lca.attorney.address_line1 && ", "}
                {[lca.attorney.city, lca.attorney.state, lca.attorney.zip_code].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </div>
      )}
      {/* PAF Section */}
      {/* {candidateEmail && lca.status?.toLowerCase() === "certified" && ( */}
      {candidateEmail && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Public Access File (PAF)
            </span>
            {activePAF ? (
              <div className="flex items-center gap-1">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] shadow-sm">
                  🟢 Active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    DocumentViewer(activePAF?.document_file_name);
                  }}
                >
                  {viewerLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                    </>
                  )}
                  View PAF
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setShowPAFModal(true)}>
                  {step === "loading" ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3 mr-1" />
                    </>
                  )}
                  Regenerate
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setShowPAFModal(true);
                  setStep("loading");
                }}
              >
                {step === "loading" ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                  </>
                )}
                Generate PAF
              </Button>
            )}
          </div>
          {/* {activePAF?.generated_at && (
            <p className="text-[11px] text-muted-foreground mb-1">
              Generated: {new Date(activePAF.generated_at).toLocaleDateString("en-US")}
            </p>
          )}
          {pafRecords.filter((p) => p.status === "superseded").length > 0 && (
            <div className="mt-1 space-y-0.5">
              {pafRecords
                .filter((p) => p.status === "superseded")
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-[10px] py-0">
                      🟡 Superseded
                    </Badge>
                    <span>{new Date(p.generated_at).toLocaleDateString("en-US")}</span>
                    <button
                      className="text-primary hover:underline bg-transparent"
                      onClick={() => onViewDocument(p?.document_file_name)}
                    >
                      View
                    </button>
                  </div>
                ))}
            </div>
          )} */}
        </div>
      )}

      {lca.notes && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block mb-1">Notes</span>
          <p className="text-sm text-muted-foreground">{lca.notes}</p>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground block mb-2">Attached Documents ({documents.length})</span>
          <div className="space-y-1">
            {documents.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  DocumentViewer(doc.file_name || doc.doc_name || "");
                }}
                className="flex items-center gap-2 text-xs text-primary hover:underline w-full text-left"
              >
                {viewerLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 flex-shrink-0" />
                  </>
                )}
                <span className="truncate">{doc.file_name || doc.doc_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <PAFGeneratorModal
        open={showPAFModal}
        onViewDocument={onViewDocument}
        step={step}
        setStep={setStep}
        onOpenChange={(open) => {
          setShowPAFModal(open);
          if (!open) loadPAFs(); // Refresh PAF records after modal closes
        }}
        lca={lca}
        candidateEmail={candidateEmail}
        fileLoader={fileLoader}
      />
    </Card>
  );
}
