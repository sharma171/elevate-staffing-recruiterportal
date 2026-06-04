import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { CardHeader } from "../../../components/ui/card";
import { CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { User, Briefcase, CreditCard, Plane } from "lucide-react";
import { DependentInfoSection } from "./DependentInfoSection";
import { SmartUploadButton } from "./SmartUploadButton";

const L2_EAD_CATEGORIES = [
  { value: "C18", label: "C18 - L-2 Dependent (Automatic Work Authorization)" },
  { value: "OTHER", label: "Other" },
];

const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-foreground">{value || "—"}</dd>
  </div>
);

const EditField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-9"
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
  </div>
);

const getEmptyL2Data = () => ({
  primary_holder: {
    name: undefined,
    visa_type: "L1B",
    receipt_number: undefined,
    employer: undefined,
    visa_validity_end: undefined,
    relationship: "spouse",
  },
  ead_card_number: undefined,
  ead_category: "C18",
  ead_validity_start: undefined,
  ead_validity_end: undefined,
  advance_parole: { has_advance_parole: false },
  employment: { currently_employed: false },
  notes: undefined,
});

export function L2DependentSection({
  data,
  visaType,
  isEditing,
  onChange,
  candidateEmail,
  candidateId,
  onEADDataExtracted,
}) {
  const [customCategory, setCustomCategory] = useState("");
  const effectiveData = data || (isEditing ? getEmptyL2Data() : null);
  const isL2EAD = visaType === "L2_EAD";

  if (!effectiveData && !isEditing) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No L-2 dependent information available.
        </CardContent>
      </Card>
    );
  }

  const handleChange = (field, value) => {
    onChange({ ...effectiveData, [field]: value });
  };
  const handlePrimaryHolderChange = (holder) => {
    handleChange("primary_holder", holder);
  };
  const handleAdvanceParoleChange = (field, value) => {
    handleChange("advance_parole", { ...effectiveData?.advance_parole, [field]: value });
  };
  const handleEmploymentChange = (field, value) => {
    handleChange("employment", { ...effectiveData?.employment, [field]: value });
  };

  const getCategoryLabel = () => {
    const category = effectiveData?.ead_category;
    if (!category) return undefined;
    const found = L2_EAD_CATEGORIES.find((c) => c.value === category);
    return found ? found.label : category;
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : undefined);

  const getEADValidityStatus = () => {
    if (!effectiveData?.ead_validity_end) return null;
    const endDate = new Date(effectiveData.ead_validity_end);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { label: "Expired", variant: "destructive" };
    if (daysUntilExpiry <= 90) return { label: `Expires in ${daysUntilExpiry} days`, variant: "warning" };
    return { label: "Valid", variant: "default" };
  };

  const eadStatus = isL2EAD ? getEADValidityStatus() : null;
  const defaultOpenAccordions = isL2EAD ? ["primary-holder", "ead-details", "employment"] : ["primary-holder"];

  return (
    <div className="!space-y-4">
      <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="!space-y-4">
        <AccordionItem value="primary-holder" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Primary L-1 Holder Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <DependentInfoSection
              data={effectiveData?.primary_holder}
              isEditing={isEditing}
              onChange={handlePrimaryHolderChange}
              primaryVisaLabel="L-1"
            />
          </AccordionContent>
        </AccordionItem>

        {isL2EAD && (
          <AccordionItem value="ead-details" className="border rounded-lg px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <AccordionTrigger className="hover:no-underline pr-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">L-2 EAD Card Details</span>
                    {eadStatus && (
                      <Badge
                        variant={eadStatus.variant === "warning" ? "outline" : eadStatus.variant}
                        className={
                          eadStatus.variant === "warning"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                            : eadStatus.variant === "destructive"
                              ? "text-xs"
                              : "bg-green-100 text-green-800 text-xs"
                        }
                      >
                        {eadStatus.label}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
              </div>
              {candidateEmail && onEADDataExtracted && (
                <SmartUploadButton
                  documentType="ead"
                  label="Upload EAD"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onEADDataExtracted}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                />
              )}
            </div>
            <AccordionContent className="pt-2 pb-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <EditField
                    label="Card Number"
                    value={effectiveData?.ead_card_number}
                    onChange={(v) => handleChange("ead_card_number", v)}
                    placeholder="SRC2390..."
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Category
                    </label>
                    <Select
                      value={
                        effectiveData?.ead_category === "OTHER" ||
                        (effectiveData?.ead_category &&
                          !L2_EAD_CATEGORIES.some((c) => c.value === effectiveData.ead_category))
                          ? "OTHER"
                          : effectiveData?.ead_category || ""
                      }
                      onValueChange={(v) => {
                        if (v === "OTHER") {
                          handleChange("ead_category", customCategory || "OTHER");
                        } else {
                          handleChange("ead_category", v);
                          setCustomCategory("");
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {L2_EAD_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <EditField
                    label="Validity Start"
                    value={effectiveData?.ead_validity_start}
                    onChange={(v) => handleChange("ead_validity_start", v)}
                    type="date"
                  />
                  <EditField
                    label="Validity End"
                    value={effectiveData?.ead_validity_end}
                    onChange={(v) => handleChange("ead_validity_end", v)}
                    type="date"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DisplayField label="Card Number" value={effectiveData?.ead_card_number} />
                  <DisplayField label="Category" value={getCategoryLabel()} />
                  <DisplayField label="Validity Start" value={formatDate(effectiveData?.ead_validity_start)} />
                  <DisplayField label="Validity End" value={formatDate(effectiveData?.ead_validity_end)} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="advance-parole" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Advance Parole</span>
              {effectiveData?.advance_parole?.has_advance_parole && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Active</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            {isEditing ? (
              <div className="!space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={effectiveData?.advance_parole?.has_advance_parole || false}
                    onCheckedChange={(v) => handleAdvanceParoleChange("has_advance_parole", v)}
                  />
                  <label className="text-sm">Has Advance Parole</label>
                </div>
                {effectiveData?.advance_parole?.has_advance_parole && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditField
                      label="Receipt Number"
                      value={effectiveData?.advance_parole?.ap_receipt_number}
                      onChange={(v) => handleAdvanceParoleChange("ap_receipt_number", v)}
                    />
                    <EditField
                      label="Issue Date"
                      value={effectiveData?.advance_parole?.ap_issue_date}
                      onChange={(v) => handleAdvanceParoleChange("ap_issue_date", v)}
                      type="date"
                    />
                    <EditField
                      label="Expiry Date"
                      value={effectiveData?.advance_parole?.ap_expiry_date}
                      onChange={(v) => handleAdvanceParoleChange("ap_expiry_date", v)}
                      type="date"
                    />
                  </div>
                )}
              </div>
            ) : effectiveData?.advance_parole?.has_advance_parole ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DisplayField label="Receipt Number" value={effectiveData?.advance_parole?.ap_receipt_number} />
                <DisplayField label="Issue Date" value={formatDate(effectiveData?.advance_parole?.ap_issue_date)} />
                <DisplayField label="Expiry Date" value={formatDate(effectiveData?.advance_parole?.ap_expiry_date)} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No Advance Parole document.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {isL2EAD && (
          <AccordionItem value="employment" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Employment Information</span>
                {effectiveData?.employment?.currently_employed && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Employed</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              {isEditing ? (
                <div className="!space-y-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={effectiveData?.employment?.currently_employed || false}
                      onCheckedChange={(v) => handleEmploymentChange("currently_employed", v)}
                    />
                    <label className="text-sm">Currently Employed</label>
                  </div>
                  {effectiveData?.employment?.currently_employed && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <EditField
                        label="Employer Name"
                        value={effectiveData?.employment?.employer_name}
                        onChange={(v) => handleEmploymentChange("employer_name", v)}
                      />
                      <EditField
                        label="Job Title"
                        value={effectiveData?.employment?.job_title}
                        onChange={(v) => handleEmploymentChange("job_title", v)}
                      />
                      <EditField
                        label="Employment Start Date"
                        value={effectiveData?.employment?.employment_start_date}
                        onChange={(v) => handleEmploymentChange("employment_start_date", v)}
                        type="date"
                      />
                    </div>
                  )}
                </div>
              ) : effectiveData?.employment?.currently_employed ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DisplayField label="Employer Name" value={effectiveData?.employment?.employer_name} />
                  <DisplayField label="Job Title" value={effectiveData?.employment?.job_title} />
                  <DisplayField
                    label="Start Date"
                    value={formatDate(effectiveData?.employment?.employment_start_date)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not currently employed.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {(isEditing || effectiveData?.notes) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={effectiveData?.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional notes..."
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{effectiveData?.notes}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
