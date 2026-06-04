import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { LCA_WAGE_LEVELS, US_STATES } from "./constants";
import { Plus, Trash2, MapPin, Building2 } from "lucide-react";

const LCA_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "amendment", label: "Amendment" },
];

const LCA_STATUSES = [
  { value: "certified", label: "Certified" },
  { value: "pending", label: "Pending" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "denied", label: "Denied" },
];

const WAGE_UNITS = [
  { value: "year", label: "Per Year" },
  { value: "month", label: "Per Month" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "week", label: "Per Week" },
  { value: "hour", label: "Per Hour" },
];

const FormField = ({ label, children, required = false, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

const getEmptyWorksite = () => ({ is_primary: false, worksite_name: "", city: "", state: "", county: "" });

export function EditLCAModal({ open, onOpenChange, lca, onSave, isNew = false }) {
  const [formData, setFormData] = useState({
    id: "",
    is_current: true,
    lca_type: "initial",
    case_number: "",
    status: "pending",
    employer_name: "",
    worksites: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lca) {
      setFormData({ ...lca, worksites: lca.worksites || [] });
    } else if (isNew) {
      setFormData({
        id: `lca-new-${Date.now()}`,
        is_current: true,
        lca_type: "initial",
        case_number: "",
        status: "pending",
        employer_name: "",
        full_time: true,
        worksites: [],
      });
    }
  }, [lca, isNew, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWorksite = () => {
    const newWorksite = getEmptyWorksite();
    newWorksite.is_primary = (formData.worksites?.length || 0) === 0;
    setFormData((prev) => ({ ...prev, worksites: [...(prev.worksites || []), newWorksite] }));
  };

  const handleUpdateWorksite = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.worksites || [])];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "is_primary" && value === true) {
        updated.forEach((w, i) => {
          if (i !== index) w.is_primary = false;
        });
      }
      return { ...prev, worksites: updated };
    });
  };

  const handleRemoveWorksite = (index) => {
    setFormData((prev) => {
      const updated = [...(prev.worksites || [])];
      const wasRemovingPrimary = updated[index].is_primary;
      updated.splice(index, 1);
      if (wasRemovingPrimary && updated.length > 0) updated[0].is_primary = true;
      return { ...prev, worksites: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create a filtered payload with only the keys needed by handleSaveLCAFromModal
      const payload = {
        case_number: formData.case_number,
        status: formData.status,
        certified_date: formData.certified_date,
        validity_start: formData.validity_start,
        validity_end: formData.validity_end,
        wage_level: formData.wage_level,
        prevailing_wage: formData.prevailing_wage,
        actual_wage: formData.actual_wage,
        wage_unit: formData.wage_unit,
        full_time: formData.full_time,
        job_title: formData.job_title,
        soc_code: formData.soc_code,
        soc_title: formData.soc_title,
        employer_name: formData.employer_name,
        employer_fein: formData.employer_fein,
        // Include worksites so the parent can find primary/additional
        worksites: formData.worksites || [],
      };

      await onSave(payload);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving LCA:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const stateOptions = US_STATES.map((s) => ({ value: s.code, label: s.name }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{isNew ? "Add New LCA" : "Edit LCA"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 pb-3 pt-1">
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">LCA Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField label="Case Number" required>
                <Input
                  value={formData.case_number || ""}
                  onChange={(e) => handleChange("case_number", e.target.value)}
                  placeholder="e.g., I-200-25111-884397"
                  className="h-9 font-mono"
                />
              </FormField>
              <FormField label="LCA Type" required>
                <Select value={formData.lca_type} onValueChange={(v) => handleChange("lca_type", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LCA_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status" required>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LCA_STATUSES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="fulltime"
                    checked={formData.full_time ?? true}
                    onCheckedChange={(v) => handleChange("full_time", v)}
                  />
                  <Label htmlFor="fulltime" className="text-sm">
                    Full-Time
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">Employer Information</h4>
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
                  className="h-9"
                />
              </FormField>
            </div>
          </div>
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">Dates</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Certified Date">
                <Input
                  type="date"
                  value={formData.certified_date || ""}
                  onChange={(e) => handleChange("certified_date", e.target.value)}
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
          </div>
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">Job Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Job Title" required>
                <Input
                  value={formData.job_title || ""}
                  onChange={(e) => handleChange("job_title", e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="h-9"
                />
              </FormField>
              <FormField label="SOC Code" required>
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
          </div>
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">Wage Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Wage Level">
                <Select value={formData.wage_level || ""} onValueChange={(v) => handleChange("wage_level", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LCA_WAGE_LEVELS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Prevailing Wage">
                <Input
                  type="number"
                  value={formData.prevailing_wage || ""}
                  onChange={(e) => handleChange("prevailing_wage", parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                  className="h-9"
                />
              </FormField>
              <FormField label="Actual Wage">
                <Input
                  type="number"
                  value={formData.actual_wage || ""}
                  onChange={(e) => handleChange("actual_wage", parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                  className="h-9"
                />
              </FormField>
              <FormField label="Wage Unit">
                <Select value={formData.wage_unit || "year"} onValueChange={(v) => handleChange("wage_unit", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAGE_UNITS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
          <div className="!space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Worksites
                <Badge variant="secondary" className="text-xs ml-1">
                  {formData.worksites?.length || 0}
                </Badge>
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddWorksite} className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Worksite
              </Button>
            </div>
            {!formData.worksites || formData.worksites.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No worksites added</p>
                <p className="text-xs mt-1">Add at least one worksite location</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.worksites.map((worksite, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Worksite {index + 1}</span>
                        {worksite.is_primary && <Badge className="text-xs">Primary</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!worksite.is_primary && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleUpdateWorksite(index, "is_primary", true)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveWorksite(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField label="Worksite/Client Name" className="col-span-2">
                        <Input
                          value={worksite.worksite_name || ""}
                          onChange={(e) => handleUpdateWorksite(index, "worksite_name", e.target.value)}
                          placeholder="e.g., Client Company HQ"
                          className="h-8 text-sm"
                        />
                      </FormField>
                      <FormField label="City">
                        <Input
                          value={worksite.city || ""}
                          onChange={(e) => handleUpdateWorksite(index, "city", e.target.value)}
                          placeholder="City"
                          className="h-8 text-sm"
                        />
                      </FormField>
                      <FormField label="State">
                        <Select
                          value={worksite.state || ""}
                          onValueChange={(v) => handleUpdateWorksite(index, "state", v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="County" className="col-span-2">
                        <Input
                          value={worksite.county || ""}
                          onChange={(e) => handleUpdateWorksite(index, "county", e.target.value)}
                          placeholder="County"
                          className="h-8 text-sm"
                        />
                      </FormField>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="!space-y-4">
            <h4 className="text-sm font-medium text-foreground">Notes</h4>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any notes about this LCA..."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isNew ? "Add LCA" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
