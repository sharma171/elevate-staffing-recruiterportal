import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { EDUCATION_REQUIREMENTS } from "./constants";
import { H1BPetitionsSection } from "./H1BPetitionsSection";

// Display Field Component
const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-foreground">{value?.toString() || "—"}</dd>
  </div>
);

// Edit Field Component
const EditField = ({ label, value, onChange, type = "text", required = false, placeholder }) => (
  <div className="space-y-1.5">
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
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
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

// Default empty data for new records
const getEmptyH1BData = () => ({
  h1b_petition_type: "initial",
  h1b_cap_status: "cap_subject",
  receipt_number: "",
  petition_filed_date: "",
  petition_status: "pending",
  premium_processing: false,
  rfe_received: false,
  job_title: "",
  soc_code: "",
  soc_title: "",
  education_requirement: "bachelors",
  field_of_study: "",
  lca_number: "",
  lca_status: "pending",
  lca_validity_start: "",
  lca_validity_end: "",
  lca_wage_level: "level_1",
  lca_prevailing_wage: 0,
  lca_actual_wage: 0,
  lca_wage_unit: "year",
  lca_full_time: true,
  validity_start_date: "",
  validity_end_date: "",
  additional_worksites: [],
});

export function H1BSection({
  data,
  isEditing,
  onChange,
  candidateEmail,
  candidateId,
  onI797DataExtracted,
  onLCADataExtracted,
  onSaveI797,
  onSaveLCA,
  onRefreshData,
  h1bPetitions,
  lcaHistory,
  onSetActivePetition,
  onSetActiveLCA,
  onDeletePetition,
  onDeleteLCA,
  onAddPetition,
  onAddLCA,
  onViewDocument,
  onManualPetitionSubmit,
  onPetitionChange,
  onLCAChange,
  onLinkLCA,
  petitionDocuments,
  lcaDocuments,
  onDocumentsRefresh,
}) {
  const effectiveData = data || (isEditing ? getEmptyH1BData() : null);
  const hasMultiPetitionData = h1bPetitions && h1bPetitions.length > 0;

  if (!data && !isEditing && !hasMultiPetitionData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No H-1B information available.</CardContent>
      </Card>
    );
  }

  const handleChange = (field, value) => {
    onChange({ ...effectiveData, [field]: value });
  };

  return (
    <div className="!space-y-4">
      {/* Multi-Petition Management Section */}
      {(hasMultiPetitionData || candidateEmail) && (
        <Card>
          <CardHeader className="pb-1">
            <div className="text-lg font-medium text-gray-900"> Petition & LCA Management</div>
          </CardHeader>
          <CardContent>
            <H1BPetitionsSection
              petitions={h1bPetitions || []}
              lcaHistory={lcaHistory || []}
              isEditing={isEditing}
              candidateEmail={candidateEmail}
              candidateId={candidateId}
              onAddPetition={onAddPetition}
              onDeletePetition={onDeletePetition}
              onSetActivePetition={onSetActivePetition}
              onAddLCA={onAddLCA}
              onDeleteLCA={onDeleteLCA}
              onSetActiveLCA={onSetActiveLCA}
              onI797DataExtracted={onI797DataExtracted}
              onLCADataExtracted={onLCADataExtracted}
              onSaveI797={onSaveI797}
              onSaveLCA={onSaveLCA}
              onRefreshData={onRefreshData}
              onViewDocument={onViewDocument}
              onManualPendingSubmit={onManualPetitionSubmit}
              onPetitionChange={onPetitionChange}
              onLCAChange={onLCAChange}
              onLinkLCA={onLinkLCA}
              petitionDocuments={petitionDocuments}
              lcaDocuments={lcaDocuments}
              onDocumentsRefresh={onDocumentsRefresh}
            />
          </CardContent>
        </Card>
      )}

      {/* Qualifications Section */}
      {effectiveData && (
        <Accordion type="multiple" defaultValue={["qualifications"]} className="!space-y-4">
          <AccordionItem value="qualifications" className="border rounded-[10px] px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-medium">Qualifications</span>
            </AccordionTrigger>
            <AccordionContent>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 pb-4">
                  <SelectField
                    label="Education Requirement"
                    value={effectiveData.education_requirement}
                    onChange={(v) => handleChange("education_requirement", v)}
                    options={EDUCATION_REQUIREMENTS}
                    required
                  />
                  <EditField
                    label="Field of Study"
                    value={effectiveData.field_of_study}
                    onChange={(v) => handleChange("field_of_study", v)}
                    required
                  />
                  <EditField
                    label="Years of Experience"
                    value={effectiveData.years_experience}
                    onChange={(v) => handleChange("years_experience", parseInt(v) || 0)}
                    type="number"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 pb-4">
                  <DisplayField
                    label="Education Requirement"
                    value={EDUCATION_REQUIREMENTS.find((e) => e.value === effectiveData.education_requirement)?.label}
                  />
                  <DisplayField label="Field of Study" value={effectiveData.field_of_study} />
                  <DisplayField label="Years of Experience" value={effectiveData.years_experience} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
