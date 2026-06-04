import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { PETITION_TYPES, PETITION_STATUSES, CAP_STATUSES, VISA_TYPES } from "./constants";
import { Building2, User, FileText, Calendar, Briefcase, Plane, Link2 } from "lucide-react";

const FormField = ({ label, children, required = false, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
    <Icon className="h-4 w-4 text-primary" />
    {title}
  </div>
);

export function EditPetitionModal({ open, onOpenChange, petition, lcaHistory, onSave, isNew = false }) {
  const [formData, setFormData] = useState({
    id: "",
    is_current: true,
    petition_type: "initial",
    receipt_number: "",
    status: "pending",
    employer_name: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (petition) setFormData(petition);
    else if (isNew)
      setFormData({
        id: `petition-new-${Date.now()}`,
        is_current: true,
        petition_type: "initial",
        receipt_number: "",
        status: "pending",
        employer_name: "",
        premium_processing: false,
        cap_status: "cap_subject",
      });
  }, [petition, isNew, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving petition:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isNew ? "Add New H-1B Petition" : "Edit H-1B Petition"}
          </DialogTitle>
        </DialogHeader>
        <Accordion
          type="multiple"
          defaultValue={["petition", "employer", "beneficiary", "dates", "i94"]}
          className="!space-y-2"
        >
          <AccordionItem value="petition" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={FileText} title="Petition Details" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Receipt Number" required>
                  <Input
                    value={formData.receipt_number || ""}
                    onChange={(e) => handleChange("receipt_number", e.target.value)}
                    placeholder="e.g., IOE9374754377"
                    className="h-9 font-mono"
                  />
                </FormField>
                <FormField label="Petition Type" required>
                  <Select value={formData.petition_type} onValueChange={(v) => handleChange("petition_type", v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PETITION_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Petition Status" required>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PETITION_STATUSES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Case Type">
                  <Input
                    value={formData.case_type || ""}
                    onChange={(e) => handleChange("case_type", e.target.value)}
                    placeholder="e.g., I129 - PETITION FOR A NONIMMIGRANT WORKER"
                    className="h-9 text-xs"
                  />
                </FormField>
                <FormField label="Classification">
                  <Input
                    value={formData.classification || ""}
                    onChange={(e) => handleChange("classification", e.target.value)}
                    placeholder="e.g., H1B"
                    className="h-9"
                  />
                </FormField>
                <FormField label="Cap Status">
                  <Select
                    value={formData.cap_status || "none"}
                    onValueChange={(v) => handleChange("cap_status", v === "none" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select cap status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {CAP_STATUSES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    id="premium"
                    checked={formData.premium_processing || false}
                    onCheckedChange={(v) => handleChange("premium_processing", v)}
                  />
                  <Label htmlFor="premium" className="text-sm">
                    Premium Processing
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="beneficiary" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={User} title="Beneficiary Information" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Beneficiary Name" className="col-span-2 md:col-span-1">
                  <Input
                    value={formData.beneficiary_name || ""}
                    onChange={(e) => handleChange("beneficiary_name", e.target.value)}
                    placeholder="e.g., BHAGYAPALLI, RAVI"
                    className="h-9"
                  />
                </FormField>
                <FormField label="Date of Birth">
                  <Input
                    type="date"
                    value={formData.beneficiary_dob || ""}
                    onChange={(e) => handleChange("beneficiary_dob", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="A-Number">
                  <Input
                    value={formData.beneficiary_a_number || ""}
                    onChange={(e) => handleChange("beneficiary_a_number", e.target.value)}
                    placeholder="e.g., A118 282 498"
                    className="h-9 font-mono"
                  />
                </FormField>
                <FormField label="Country of Birth">
                  <Input
                    value={formData.beneficiary_country_of_birth || ""}
                    onChange={(e) => handleChange("beneficiary_country_of_birth", e.target.value)}
                    placeholder="e.g., India"
                    className="h-9"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="employer" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={Building2} title="Employer Information" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Employer Name" required>
                  <Input
                    value={formData.employer_name || ""}
                    onChange={(e) => handleChange("employer_name", e.target.value)}
                    placeholder="Company name"
                    className="h-9"
                  />
                </FormField>
                <FormField label="Employer FEIN">
                  <Input
                    value={formData.employer_fein || ""}
                    onChange={(e) => handleChange("employer_fein", e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className="h-9 font-mono"
                  />
                </FormField>
                <FormField label="Address" className="col-span-2">
                  <Input
                    value={formData.employer_address || ""}
                    onChange={(e) => handleChange("employer_address", e.target.value)}
                    placeholder="Street address"
                    className="h-9"
                  />
                </FormField>
                <FormField label="City">
                  <Input
                    value={formData.employer_city || ""}
                    onChange={(e) => handleChange("employer_city", e.target.value)}
                    placeholder="City"
                    className="h-9"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="State">
                    <Input
                      value={formData.employer_state || ""}
                      onChange={(e) => handleChange("employer_state", e.target.value)}
                      placeholder="State"
                      className="h-9"
                    />
                  </FormField>
                  <FormField label="ZIP">
                    <Input
                      value={formData.employer_zip || ""}
                      onChange={(e) => handleChange("employer_zip", e.target.value)}
                      placeholder="ZIP code"
                      className="h-9"
                    />
                  </FormField>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="dates" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={Calendar} title="Important Dates" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Filed/Received Date">
                  <Input
                    type="date"
                    value={formData.filed_date || ""}
                    onChange={(e) => handleChange("filed_date", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="Notice Date">
                  <Input
                    type="date"
                    value={formData.notice_date || ""}
                    onChange={(e) => handleChange("notice_date", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="Approval Date">
                  <Input
                    type="date"
                    value={formData.approval_date || ""}
                    onChange={(e) => handleChange("approval_date", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="Validity Start" required>
                  <Input
                    type="date"
                    value={formData.validity_start || ""}
                    onChange={(e) => handleChange("validity_start", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="Validity End" required>
                  <Input
                    type="date"
                    value={formData.validity_end || ""}
                    onChange={(e) => handleChange("validity_end", e.target.value)}
                    className="h-9"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="i94" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={Plane} title="I-94 from this Petition" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="I-94 Number">
                  <Input
                    value={formData.i94_number || ""}
                    onChange={(e) => handleChange("i94_number", e.target.value)}
                    placeholder="e.g., 372421491 A3"
                    className="h-9 font-mono"
                  />
                </FormField>
                <FormField label="Admission Class">
                  <Select
                    value={formData.i94_class || "none"}
                    onValueChange={(v) => handleChange("i94_class", v === "none" ? undefined : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {VISA_TYPES.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="I-94 Validity Start">
                  <Input
                    type="date"
                    value={formData.i94_validity_start || ""}
                    onChange={(e) => handleChange("i94_validity_start", e.target.value)}
                    className="h-9"
                  />
                </FormField>
                <FormField label="I-94 Expiry">
                  <Input
                    type="date"
                    value={formData.i94_expiry || ""}
                    onChange={(e) => handleChange("i94_expiry", e.target.value)}
                    className="h-9"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="job" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={Briefcase} title="Job Information" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Job Title">
                  <Input
                    value={formData.job_title || ""}
                    onChange={(e) => handleChange("job_title", e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="h-9"
                  />
                </FormField>
                <FormField label="SOC Code">
                  <Input
                    value={formData.soc_code || ""}
                    onChange={(e) => handleChange("soc_code", e.target.value)}
                    placeholder="e.g., 15-1252.00"
                    className="h-9 font-mono"
                  />
                </FormField>
                <FormField label="SOC Title" className="col-span-2">
                  <Input
                    value={formData.soc_title || ""}
                    onChange={(e) => handleChange("soc_title", e.target.value)}
                    placeholder="e.g., Software Developers"
                    className="h-9"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="lca" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <SectionHeader icon={Link2} title="Linked LCA" />
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <FormField label="Select LCA">
                <Select
                  value={formData.lca_id || "none"}
                  onValueChange={(v) => {
                    const actualValue = v === "none" ? "" : v;
                    const selectedLCA = lcaHistory.find((l) => l.id === actualValue);
                    handleChange("lca_id", actualValue);
                    handleChange("linked_lca_number", selectedLCA?.case_number || "");
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Link to an LCA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No LCA linked</SelectItem>
                    {lcaHistory.map((lca) => (
                      <SelectItem key={lca.id} value={lca.id}>
                        {lca.case_number} — {lca.job_title || "No title"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="!space-y-2 pt-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</Label>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any notes about this petition..."
            className="min-h-[80px]"
          />
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isNew ? "Add Petition" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
