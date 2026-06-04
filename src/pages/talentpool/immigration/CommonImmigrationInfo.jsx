import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Badge } from "../../../components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { COUNTRIES, VISA_TYPES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";
import { SectionDocumentsList } from "./SectionDocumentsList";
import { PASSPORT_ENTRY_DOC_TYPES } from "./documentTypes";
import { DocBadge } from "./DocBadge";
import { getSectionDoc } from "./documentLinkingUtils";

// Display Field Component
const DisplayField = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-foreground">{value || "—"}</dd>
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
      value={value || ""}
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

const isExpiringSoon = (dateStr, daysThreshold = 90) => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
};

const isExpired = (dateStr) => {
  return new Date(dateStr) < new Date();
};

export function CommonImmigrationInfo({
  passport,
  i94,
  visaStamp,
  isEditing,
  onPassportChange,
  onI94Change,
  onVisaStampChange,
  candidateEmail,
  candidateId,
  onPassportDataExtracted,
  onI94DataExtracted,
  onVisaDataExtracted,
  onPassportRawDataExtracted,
  onI94RawDataExtracted,
  onVisaRawDataExtracted,
  onRefreshData,
  documents,
  onDocumentsRefresh,
  passportDocumentFile,
  i94DocumentFile,
  visaStampDocumentFile,
}) {
  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

  const getCountryName = (code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    return country?.name || code;
  };

  const passportDoc = getSectionDoc(documents || [], passportDocumentFile, "passport");
  const i94Doc = getSectionDoc(documents || [], i94DocumentFile, "i94");
  const visaStampDoc = visaStampDocumentFile;

  return (
    <div className="!space-y-4">
      <Accordion type="multiple" defaultValue={["passport", "i94", "visa-stamp"]} className="!space-y-4">
        {/* Passport Information */}
        <AccordionItem value="passport" className="border rounded-lg px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <AccordionTrigger className="hover:no-underline pr-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Passport Information</span>
                  {passportDoc && candidateEmail && (
                    <DocBadge doc={passportDoc} candidateEmail={candidateEmail} compact />
                  )}
                  {passport.passport_expiry_date && isExpired(passport.passport_expiry_date) && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                  {passport.passport_expiry_date &&
                    isExpiringSoon(passport.passport_expiry_date) &&
                    !isExpired(passport.passport_expiry_date) && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                </div>
              </AccordionTrigger>
            </div>
            {candidateEmail && onPassportDataExtracted && (
              <SmartUploadButton
                documentType="passport"
                label="Smart Upload"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onPassportDataExtracted}
                onRawDataExtracted={onPassportRawDataExtracted}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
          </div>
          <AccordionContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <EditField
                  label="Passport Number"
                  value={passport.passport_number}
                  onChange={(v) => onPassportChange({ ...passport, passport_number: v })}
                  required
                />
                <SelectField
                  label="Issuing Country"
                  value={passport.passport_country}
                  onChange={(v) => onPassportChange({ ...passport, passport_country: v })}
                  options={countryOptions}
                  required
                />
                <EditField
                  label="Issue Date"
                  value={passport.passport_issue_date}
                  onChange={(v) => onPassportChange({ ...passport, passport_issue_date: v })}
                  type="date"
                />
                <EditField
                  label="Expiry Date"
                  value={passport.passport_expiry_date}
                  onChange={(v) => onPassportChange({ ...passport, passport_expiry_date: v })}
                  type="date"
                  required
                />
                <EditField
                  label="Issue City"
                  value={passport.passport_issue_city}
                  onChange={(v) => onPassportChange({ ...passport, passport_issue_city: v })}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Previous Passport
                  </label>
                  <div className="flex items-center h-9 gap-2">
                    <Switch
                      checked={passport.has_previous_passport}
                      onCheckedChange={(v) => onPassportChange({ ...passport, has_previous_passport: v })}
                    />
                    <Label className="text-sm">Has previous passport</Label>
                  </div>
                </div>
                {passport.has_previous_passport && (
                  <EditField
                    label="Previous Passport Number"
                    value={passport.previous_passport_number}
                    onChange={(v) => onPassportChange({ ...passport, previous_passport_number: v })}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <DisplayField label="Passport Number" value={passport.passport_number} />
                <DisplayField label="Issuing Country" value={getCountryName(passport.passport_country)} />
                <DisplayField
                  label="Issue Date"
                  value={
                    passport.passport_issue_date
                      ? new Date(passport.passport_issue_date).toLocaleDateString()
                      : undefined
                  }
                />
                <DisplayField
                  label="Expiry Date"
                  value={
                    passport.passport_expiry_date
                      ? new Date(passport.passport_expiry_date).toLocaleDateString()
                      : undefined
                  }
                />
                <DisplayField label="Issue City" value={passport.passport_issue_city} />
                <DisplayField label="Has Previous Passport" value={passport.has_previous_passport ? "Yes" : "No"} />
                {passport.has_previous_passport && (
                  <DisplayField label="Previous Passport Number" value={passport.previous_passport_number} />
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* I-94 Information */}
        <AccordionItem value="i94" className="border rounded-lg px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <AccordionTrigger className="hover:no-underline pr-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">I-94 Information</span>
                  {i94Doc && candidateEmail && <DocBadge doc={i94Doc} candidateEmail={candidateEmail} compact />}
                  {i94.i94_expiry_date && !i94.i94_is_duration_of_status && isExpired(i94.i94_expiry_date) && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                  {i94.i94_expiry_date &&
                    !i94.i94_is_duration_of_status &&
                    isExpiringSoon(i94.i94_expiry_date) &&
                    !isExpired(i94.i94_expiry_date) && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  {i94.i94_is_duration_of_status && (
                    <Badge variant="outline" className="text-xs">
                      D/S
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
            </div>
            {candidateEmail && onI94DataExtracted && (
              <SmartUploadButton
                documentType="i94"
                label="Smart Upload"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onI94DataExtracted}
                onRawDataExtracted={onI94RawDataExtracted}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
          </div>
          <AccordionContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <EditField
                  label="I-94 Number"
                  value={i94.i94_number}
                  onChange={(v) => onI94Change({ ...i94, i94_number: v })}
                  required
                  placeholder="11-digit number"
                />
                <EditField
                  label="Admission Date"
                  value={i94.i94_admission_date}
                  onChange={(v) => onI94Change({ ...i94, i94_admission_date: v })}
                  type="date"
                  required
                />
                {!i94.i94_is_duration_of_status && (
                  <EditField
                    label="Expiry Date"
                    value={i94.i94_expiry_date}
                    onChange={(v) => onI94Change({ ...i94, i94_expiry_date: v })}
                    type="date"
                    required
                  />
                )}
                <SelectField
                  label="Admission Class"
                  value={i94.i94_admission_class}
                  onChange={(v) => onI94Change({ ...i94, i94_admission_class: v })}
                  options={[
                    { value: "H-1B", label: "H-1B" },
                    { value: "H-4", label: "H-4" },
                    { value: "H-1B1", label: "H-1B1" },
                    { value: "L-1A", label: "L-1A" },
                    { value: "L-1B", label: "L-1B" },
                    { value: "L-2", label: "L-2" },
                    { value: "F-1", label: "F-1" },
                    { value: "F-2", label: "F-2" },
                    { value: "J-1", label: "J-1" },
                    { value: "J-2", label: "J-2" },
                    { value: "O-1", label: "O-1" },
                    { value: "O-1A", label: "O-1A" },
                    { value: "O-1B", label: "O-1B" },
                    { value: "B-1", label: "B-1" },
                    { value: "B-2", label: "B-2" },
                    { value: "B-1/B-2", label: "B-1/B-2" },
                    { value: "TN", label: "TN" },
                    { value: "TD", label: "TD" },
                    { value: "E-1", label: "E-1" },
                    { value: "E-2", label: "E-2" },
                    { value: "E-3", label: "E-3" },
                    { value: "R-1", label: "R-1" },
                    { value: "P-1", label: "P-1" },
                    { value: "K-1", label: "K-1" },
                    { value: "WT", label: "WT (Visa Waiver)" },
                    { value: "WB", label: "WB (Visa Waiver)" },
                    { value: "Other", label: "Other" },
                  ]}
                  required
                />
                <EditField
                  label="Port of Entry"
                  value={i94.port_of_entry}
                  onChange={(v) => onI94Change({ ...i94, port_of_entry: v })}
                  required
                  placeholder="e.g., JFK, LAX"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Duration of Status
                  </label>
                  <div className="flex items-center h-9 gap-2">
                    <Switch
                      checked={i94.i94_is_duration_of_status}
                      onCheckedChange={(v) =>
                        onI94Change({
                          ...i94,
                          i94_is_duration_of_status: v,
                          i94_expiry_date: v ? "" : i94.i94_expiry_date,
                        })
                      }
                    />
                    <Label className="text-sm">D/S (Duration of Status)</Label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <DisplayField label="I-94 Number" value={i94.i94_number} />
                <DisplayField
                  label="Admission Date"
                  value={i94.i94_admission_date ? new Date(i94.i94_admission_date).toLocaleDateString() : undefined}
                />
                <DisplayField
                  label="Expiry Date"
                  value={
                    i94.i94_is_duration_of_status
                      ? "D/S (Duration of Status)"
                      : i94.i94_expiry_date
                        ? new Date(i94.i94_expiry_date).toLocaleDateString()
                        : undefined
                  }
                />
                <DisplayField
                  label="Admission Class"
                  value={VISA_TYPES.find((v) => v.code === i94.i94_admission_class)?.label || i94.i94_admission_class}
                />
                <DisplayField label="Port of Entry" value={i94.port_of_entry} />
                <DisplayField label="Duration of Status" value={i94.i94_is_duration_of_status ? "Yes" : "No"} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Visa Stamp Information */}
        <AccordionItem value="visa-stamp" className="border rounded-lg px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <AccordionTrigger className="hover:no-underline pr-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Visa Stamp Information</span>
                  {console.log("i94Doc Info", visaStampDoc)}
                  {visaStampDoc && candidateEmail && (
                    <DocBadge doc={visaStampDoc} candidateEmail={candidateEmail} compact />
                  )}
                  {!visaStamp.has_valid_visa_stamp && (
                    <Badge variant="outline" className="text-xs">
                      No Valid Stamp
                    </Badge>
                  )}
                  {visaStamp.has_valid_visa_stamp &&
                    visaStamp.visa_stamp_expiry_date &&
                    isExpired(visaStamp.visa_stamp_expiry_date) && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  {visaStamp.needs_visa_stamping && (
                    <Badge variant="secondary" className="text-xs">
                      Stamping Needed
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
            </div>
            {candidateEmail && onVisaDataExtracted && (
              <SmartUploadButton
                documentType="visa_stamp"
                label="Smart Upload"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onVisaDataExtracted}
                onRawDataExtracted={onVisaRawDataExtracted}
                onRefreshData={onRefreshData}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              />
            )}
          </div>
          <AccordionContent>
            {isEditing ? (
              <div className="!space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={visaStamp.has_valid_visa_stamp}
                    onCheckedChange={(v) => onVisaStampChange({ ...visaStamp, has_valid_visa_stamp: v })}
                  />
                  <Label className="text-sm">Has Valid Visa Stamp</Label>
                </div>
                {visaStamp.has_valid_visa_stamp && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <EditField
                      label="Issue Date"
                      value={visaStamp.visa_stamp_issue_date}
                      onChange={(v) => onVisaStampChange({ ...visaStamp, visa_stamp_issue_date: v })}
                      type="date"
                    />
                    <EditField
                      label="Expiry Date"
                      value={visaStamp.visa_stamp_expiry_date}
                      onChange={(v) => onVisaStampChange({ ...visaStamp, visa_stamp_expiry_date: v })}
                      type="date"
                    />
                    <EditField
                      label="Consulate"
                      value={visaStamp.visa_stamp_consulate}
                      onChange={(v) => onVisaStampChange({ ...visaStamp, visa_stamp_consulate: v })}
                      placeholder="e.g., Chennai, India"
                    />
                    <SelectField
                      label="Entries"
                      value={visaStamp.visa_stamp_entries}
                      onChange={(v) => onVisaStampChange({ ...visaStamp, visa_stamp_entries: v })}
                      options={[
                        { value: "M", label: "Multiple (M)" },
                        { value: "S", label: "Single (S)" },
                        { value: "1", label: "1 Entry" },
                        { value: "2", label: "2 Entries" },
                      ]}
                    />
                    <div className="col-span-2 md:col-span-4">
                      <EditField
                        label="Annotation"
                        value={visaStamp.visa_stamp_annotation}
                        onChange={(v) => onVisaStampChange({ ...visaStamp, visa_stamp_annotation: v })}
                        placeholder="Any annotations on visa stamp"
                      />
                    </div>
                  </div>
                )}
                <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-4 !space-y-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={visaStamp.needs_visa_stamping}
                      onCheckedChange={(v) => onVisaStampChange({ ...visaStamp, needs_visa_stamping: v })}
                    />
                    <Label className="text-sm">Needs Visa Stamping</Label>
                  </div>
                  {visaStamp.needs_visa_stamping && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Stamping Notes
                      </label>
                      <Textarea
                        value={visaStamp.visa_stamping_notes || ""}
                        onChange={(e) => onVisaStampChange({ ...visaStamp, visa_stamping_notes: e.target.value })}
                        placeholder="Dropbox eligibility, 221g history, etc."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="!space-y-4 pt-2">
                <DisplayField label="Has Valid Visa Stamp" value={visaStamp.has_valid_visa_stamp ? "Yes" : "No"} />
                {visaStamp.has_valid_visa_stamp && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DisplayField
                      label="Issue Date"
                      value={
                        visaStamp.visa_stamp_issue_date
                          ? new Date(visaStamp.visa_stamp_issue_date).toLocaleDateString()
                          : undefined
                      }
                    />
                    <DisplayField
                      label="Expiry Date"
                      value={
                        visaStamp.visa_stamp_expiry_date
                          ? new Date(visaStamp.visa_stamp_expiry_date).toLocaleDateString()
                          : undefined
                      }
                    />
                    <DisplayField label="Consulate" value={visaStamp.visa_stamp_consulate} />
                    <DisplayField
                      label="Entries"
                      value={
                        visaStamp.visa_stamp_entries === "M" || visaStamp.visa_stamp_entries === "multiple"
                          ? "Multiple"
                          : visaStamp.visa_stamp_entries === "S" || visaStamp.visa_stamp_entries === "single"
                            ? "Single"
                            : visaStamp.visa_stamp_entries || "—"
                      }
                    />
                    {visaStamp.visa_stamp_annotation && (
                      <div className="col-span-2 md:col-span-4">
                        <DisplayField label="Annotation" value={visaStamp.visa_stamp_annotation} />
                      </div>
                    )}
                  </div>
                )}
                <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-4">
                  <DisplayField label="Needs Visa Stamping" value={visaStamp.needs_visa_stamping ? "Yes" : "No"} />
                  {visaStamp.needs_visa_stamping && visaStamp.visa_stamping_notes && (
                    <div className="mt-2">
                      <DisplayField label="Stamping Notes" value={visaStamp.visa_stamping_notes} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Related Documents Section */}
      {documents && documents.length > 0 && (
        <div className="mt-4">
          <SectionDocumentsList
            documents={documents}
            sectionName="Passport & Entry Documents"
            sectionCode="passport_entry"
            documentTypes={PASSPORT_ENTRY_DOC_TYPES}
            candidateEmail={candidateEmail || ""}
            isEditing={isEditing}
            accessLevel="Full Access"
            onRefresh={onDocumentsRefresh || (() => Promise.resolve())}
            compact
          />
        </div>
      )}
    </div>
  );
}
