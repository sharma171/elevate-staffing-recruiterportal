import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { User, Briefcase, Calendar, FileText } from "lucide-react";

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
];

const DisplayField = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </dt>
    <dd className="text-sm text-foreground">{value || "—"}</dd>
  </div>
);

const EditField = ({ label, value, onChange, type = "text", placeholder, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
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

const getEmptyPrimaryHolderData = () => ({
  name: undefined,
  visa_type: undefined,
  receipt_number: undefined,
  employer: undefined,
  visa_validity_end: undefined,
  email: undefined,
  relationship: "spouse",
});

export function DependentInfoSection({ data, isEditing, onChange, primaryVisaLabel }) {
  const effectiveData = data || (isEditing ? getEmptyPrimaryHolderData() : null);

  if (!effectiveData && !isEditing) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          No primary holder information available.
        </CardContent>
      </Card>
    );
  }

  const handleChange = (field, value) => {
    onChange({ ...effectiveData, [field]: value });
  };
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : undefined);

  const getValidityStatus = () => {
    if (!effectiveData?.visa_validity_end) return null;
    const endDate = new Date(effectiveData.visa_validity_end);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { label: "Expired", variant: "destructive" };
    if (daysUntilExpiry <= 90) return { label: `Expires in ${daysUntilExpiry} days`, variant: "warning" };
    return { label: "Valid", variant: "default" };
  };

  const validityStatus = getValidityStatus();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Primary {primaryVisaLabel} Holder Information</CardTitle>
          <div className="flex items-center gap-2">
            {effectiveData?.relationship && (
              <Badge variant="outline" className="text-xs capitalize">
                {effectiveData.relationship}
              </Badge>
            )}
            {validityStatus && (
              <Badge
                variant={validityStatus.variant === "warning" ? "outline" : validityStatus.variant}
                className={
                  validityStatus.variant === "warning"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                    : validityStatus.variant === "destructive"
                      ? "text-xs"
                      : "bg-green-100 text-green-800 text-xs"
                }
              >
                {validityStatus.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="!space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EditField
                label="Primary Holder Name"
                value={effectiveData?.name}
                onChange={(v) => handleChange("name", v)}
                placeholder="Full name"
                icon={User}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Relationship
                </label>
                <Select
                  value={effectiveData?.relationship || ""}
                  onValueChange={(v) => handleChange("relationship", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <EditField
                label="Visa Type"
                value={effectiveData?.visa_type}
                onChange={(v) => handleChange("visa_type", v)}
                placeholder={`e.g., ${primaryVisaLabel}`}
              />
              <EditField
                label="Receipt Number"
                value={effectiveData?.receipt_number}
                onChange={(v) => handleChange("receipt_number", v)}
                placeholder="SRC..."
                icon={FileText}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EditField
                label="Employer"
                value={effectiveData?.employer}
                onChange={(v) => handleChange("employer", v)}
                placeholder="Company name"
                icon={Briefcase}
              />
              <EditField
                label="Visa Validity End"
                value={effectiveData?.visa_validity_end}
                onChange={(v) => handleChange("visa_validity_end", v)}
                type="date"
                icon={Calendar}
              />
              <EditField
                label="Email"
                value={effectiveData?.email}
                onChange={(v) => handleChange("email", v)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DisplayField label="Primary Holder Name" value={effectiveData?.name} icon={User} />
            <DisplayField label="Relationship" value={effectiveData?.relationship} />
            <DisplayField label="Visa Type" value={effectiveData?.visa_type} />
            <DisplayField label="Receipt Number" value={effectiveData?.receipt_number} icon={FileText} />
            <DisplayField label="Employer" value={effectiveData?.employer} icon={Briefcase} />
            <DisplayField
              label="Visa Validity End"
              value={formatDate(effectiveData?.visa_validity_end)}
              icon={Calendar}
            />
            <DisplayField label="Email" value={effectiveData?.email} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
