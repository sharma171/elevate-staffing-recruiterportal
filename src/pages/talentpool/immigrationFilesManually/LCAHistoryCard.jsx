import React, { useState, createContext, useContext } from "react";
import { SelectPicker, DatePicker } from "rsuite";
import {
  Trash2,
  ArrowUpCircle,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Scale,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Home,
  CalendarDays,
} from "lucide-react";
import SmartUploadButton from "./SmartUploadButton";

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

// Format currency
const formatCurrency = (value, unit) => {
  if (!value) return "—";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
  if (unit && unit !== "year") {
    return `${formatted}/${unit}`;
  }
  return `${formatted}/yr`;
};

// Format wage level for display
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

// Format full address
const formatAddress = (worksite) => {
  const parts = [];
  if (worksite.address_line1) parts.push(worksite.address_line1);
  if (worksite.address_line2) parts.push(worksite.address_line2);
  const cityStateZip = [worksite.city, worksite.state, worksite.zip_code].filter(Boolean).join(", ");
  if (cityStateZip) parts.push(cityStateZip);
  return parts.join("\n") || `${worksite.city || "Unknown"}, ${worksite.state || "?"}`;
};

const LCA_TYPES = [
  { value: "new", label: "New Employment" },
  { value: "continued", label: "Continued Employment" },
  { value: "amended", label: "Amended" },
  { value: "cap_gap", label: "Cap Gap" },
  { value: "h1b1", label: "H-1B1" },
  { value: "e3", label: "E-3" },
];

const LCA_STATUSES = [
  { value: "certified", label: "Certified" },
  { value: "denied", label: "Denied" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
];

const WAGE_LEVELS = [
  { value: "level_1", label: "Level I (Entry)" },
  { value: "level_2", label: "Level II (Qualified)" },
  { value: "level_3", label: "Level III (Experienced)" },
  { value: "level_4", label: "Level IV (Fully Competent)" },
];

const WAGE_UNITS = [
  { value: "hour", label: "Hourly" },
  { value: "week", label: "Weekly" },
  { value: "bi_week", label: "Bi-Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const getLCAStatusLabel = (status) => {
  const found = LCA_STATUSES.find((s) => s.value === status);
  return found ? found.label : status || "Unknown";
};

const getLCATypeLabel = (type) => {
  const found = LCA_TYPES.find((t) => t.value === type);
  return found ? found.label : type || "Unknown";
};

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3bed] focus:ring-offset-2";

  const variantClasses = {
    default: "bg-[#7c3bed] text-white",
    destructive: "bg-[#ef4444] text-white",
    secondary: "bg-[#f3f4f6] text-[#1f2937]",
    outline: "border border-[#e5e7eb] bg-transparent text-[#1f2937]",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3bed] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default: "bg-[#7c3bed] text-white hover:bg-[#2563eb]",
    destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
    outline: "border successoutlineButtonWhite successoutlineButton px-2 py-1",
    secondary: "bg-[#f3f4f6] text-[#1f2937] hover:bg-[#e5e7eb]",
    ghost: "successoutlineButton",
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      type={type}
      className={`rounded-[10px] ${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Card Component
const Card = ({ children, className = "" }) => {
  return <div className={`rounded-[10px] text-[#1f2937] ${className}`}>{children}</div>;
};

// Input Component
const Input = ({ type = "text", value = "", onChange, placeholder, className = "" }) => {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control bigHoverInput`}
      />
    </div>
  );
};

// Switch Component
const Switch = ({ checked, onCheckedChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`${
        checked ? "bg-[#7c3bed]" : "bg-[#e5e7eb]"
      } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3bed] focus-visible:ring-offset-2`}
    >
      <span
        className={`${
          checked ? "translate-x-5" : "translate-x-1"
        } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
};

// Collapsible Components
const CollapsibleContext = createContext({});

const Collapsible = ({ open, onOpenChange, children }) => {
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      <div className="w-full">{children}</div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = ({ asChild, children }) => {
  const { open, onOpenChange } = useContext(CollapsibleContext);
  const child = asChild ? React.Children.only(children) : children;

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      onClick: () => onOpenChange(!open),
    });
  }
  return (
    <div className="cursor-pointer" onClick={() => onOpenChange(!open)}>
      {children}
    </div>
  );
};

const CollapsibleContent = ({ children, className }) => {
  const { open } = useContext(CollapsibleContext);
  if (!open) return null;
  return <div className={className}>{children}</div>;
};

// Inline Edit Field Component
const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => {
  if (type === "date") {
    let dateValue = null;
    if (value && typeof value === "string") {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          dateValue = new Date(y, m - 1, d);
        }
      }
    } else if (value instanceof Date) {
      dateValue = value;
    }

    return (
      <div className={`space-y-1 ${className}`}>
        <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">{label}</label>
        <DatePicker
          oneTap
          caretAs={() => <CalendarDays size={14} />}
          value={dateValue}
          placement="autoVertical"
          onChange={(date) => {
            if (date) {
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, "0");
              const d = String(date.getDate()).padStart(2, "0");
              onChange(`${y}-${m}-${d}`);
            } else {
              onChange("");
            }
          }}
          format="MM/dd/yyyy"
          placeholder={placeholder || "MM/DD/YYYY"}
          className="w-full bigHoverInputr"
          cleanable={false}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">{label}</label>
      <Input
        type={type}
        value={value?.toString() || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  );
};

// Inline Select Field Component
const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">{label}</label>
    <SelectPicker
      data={options}
      value={value}
      onChange={onChange}
      cleanable={false}
      searchable={false}
      className="w-full bigHoverInputr"
      placeholder="Select..."
      labelKey="label"
      valueKey="value"
    />
  </div>
);

export default function LCAHistoryCard({
  lca,
  isEditing = false,
  hasOtherLCAs = false,
  onEdit,
  onChange,
  onDelete,
  onSetAsCurrent,
  onLCADataExtracted,
  onSaveLCA,
  onRefreshData,
  candidateEmail,
  candidateId,

  onViewDocument,
}) {
  const [expandedWorksites, setExpandedWorksites] = useState([]);
  const [showAttorney, setShowAttorney] = useState(false);
  const [showHomeAddress, setShowHomeAddress] = useState(false);

  const isCurrent = lca.is_current;
  const documents = lca?.document_file_name;

  const statusVariant =
    lca.lca_status === "certified"
      ? "default"
      : lca.lca_status === "denied" || lca.lca_status === "withdrawn"
        ? "destructive"
        : "secondary";

  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange({ ...lca, [field]: value });
    }
  };

  const handleAddWorksite = () => {
    const newWorksite = {
      worksite_name: "",
      address_line1: "",
      city: "",
      state: "",
      zip_code: "",
      is_primary: false,
    };
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

    if (field === "is_primary" && value === true) {
      worksites.forEach((ws, i) => {
        if (i !== index) ws.is_primary = false;
      });
    }

    handleFieldChange("worksites", worksites);
  };

  const handleHomeAddressChange = (field, value) => {
    const homeAddress = { ...(lca.home_address || {}), [field]: value };
    handleFieldChange("home_address", homeAddress);
  };

  const handleAttorneyChange = (field, value) => {
    const attorney = { ...(lca.attorney || {}), [field]: value };
    handleFieldChange("attorney", attorney);
  };

  const toggleWorksiteExpanded = (index) => {
    setExpandedWorksites((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const hasAttorneyInfo = lca.attorney_name || lca.attorney_firm || lca.attorney_email || lca.attorney_phone;

  if (isEditing) {
    return (
      <Card className={`p-4 ${isCurrent ? "border-[#7c3bed]/50 bg-[#7c3bed]/5" : "border-[#e5e7eb] bg-[#f3f4f6]/30"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent && <Badge className="bg-[#7c3bed] text-white text-xs">CURRENT</Badge>}
            {!isCurrent && (
              <Badge variant="outline" className="text-[#6b7280] text-xs">
                PREVIOUS
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {candidateEmail && onLCADataExtracted && (
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
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#ef4444] hover:text-[#ef4444]"
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
            value={lca.lca_case_number}
            onChange={(v) => handleFieldChange("lca_case_number", v)}
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
            value={lca.lca_status}
            onChange={(v) => handleFieldChange("lca_status", v)}
            options={LCA_STATUSES}
          />
          <div className="flex items-center gap-2 pt-4">
            <Switch checked={lca.full_time ?? true} onCheckedChange={(v) => handleFieldChange("full_time", v)} />
            <span className="text-sm text-[#1f2937]">Full-Time</span>
          </div>

          <EditField
            label="Certified Date"
            value={lca.certified_date}
            onChange={(v) => handleFieldChange("certified_date", v)}
            type="date"
          />
          <EditField
            label="Validity Start"
            value={lca.lca_validity_start}
            onChange={(v) => handleFieldChange("lca_validity_start", v)}
            type="date"
          />
          <EditField
            label="Validity End"
            value={lca.lca_validity_end}
            onChange={(v) => handleFieldChange("lca_validity_end", v)}
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

        <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2 text-[#1f2937]">
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
                <div className="bg-f1f1f94d ring-1 ring-[#e7e7ef] rounded-[10px] overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-2 bg-[#f3f4f6]/30 cursor-pointer hover:bg-[#f3f4f6]/50">
                      <div className="flex items-center gap-2 text-[#080118]">
                        {expandedWorksites.includes(index) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{worksite.worksite_name || `Worksite ${index + 1}`}</span>
                        {worksite.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {worksite.city && (
                          <span className="text-xs">
                            — {worksite.city}, {worksite.state}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#ef4444] p-1 !w-7 !h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWorksite(index);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white">
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
                        <span className="text-sm text-[#1f2937]">Primary Worksite</span>
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

                      <div className="col-span-4 pt-2 border-t border-[#e5e7eb] mt-2">
                        <span className="text-xs font-medium text-[#6b7280] uppercase">Client Contact (Optional)</span>
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
              <div className="text-center py-4 text-[#080118] text-sm border border-dashed border-[#e5e7eb] rounded-lg">
                No worksites added. Click "Add Worksite" to add one.
              </div>
            )}
          </div>
        </div>

        <Collapsible open={showAttorney} onOpenChange={setShowAttorney}>
          <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-content-start !text-[#080118] p-0 h-auto hover:!bg-transparent"
              >
                {showAttorney ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                <Scale className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">Attorney / Representative</span>
                {hasAttorneyInfo && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    Info Added
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[#f3f4f6]/20 rounded-lg">
                <EditField
                  label="Attorney Name"
                  value={lca.attorney_name}
                  onChange={(v) => handleAttorneyChange("attorney_name", v)}
                />
                <EditField
                  label="Firm Name"
                  value={lca.attorney_firm}
                  onChange={(v) => handleAttorneyChange("firm_name", v)}
                />
                <EditField
                  label="Bar Number"
                  value={lca.attorney_bar_number}
                  onChange={(v) => handleAttorneyChange("bar_number", v)}
                />
                <EditField
                  label="Phone"
                  value={lca.attorney_phone}
                  onChange={(v) => handleAttorneyChange("phone", v)}
                  type="tel"
                />
                <div className="col-span-2">
                  <EditField
                    label="Email"
                    value={lca.attorney_email}
                    onChange={(v) => handleAttorneyChange("email", v)}
                    type="email"
                  />
                </div>
                <div className="col-span-2">
                  <EditField
                    label="Address Line 1"
                    value={lca.attorney_address}
                    onChange={(v) => handleAttorneyChange("address_line1", v)}
                  />
                </div>
                <EditField label="City" value={lca.attorney?.city} onChange={(v) => handleAttorneyChange("city", v)} />
                <EditField
                  label="State"
                  value={lca.attorney_bar_state}
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

  return (
    <Card
      className={`p-[14px] m-[1px] ring-1 ${isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-[#f1f1f9] bg-[#f1f1f94d]"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isCurrent && <Badge className="bg-[#7c3bed] text-white text-xs">CURRENT</Badge>}
          {!isCurrent && (
            <Badge variant="outline" className="text-[#6b7280] text-xs">
              PREVIOUS
            </Badge>
          )}
          <span className="font-mono font-medium text-sm text-[#1f2937]">{lca.lca_case_number || "No Case #"}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {getLCATypeLabel(lca.lca_type)}
          </Badge>
          <Badge variant={statusVariant} className="text-xs capitalize">
            {getLCAStatusLabel(lca.lca_status)}
          </Badge>
          {lca.full_time !== undefined && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {lca.full_time ? "Full-Time" : "Part-Time"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {candidateEmail && onLCADataExtracted && (
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
              className="h-7 w-7 text-[#ef4444] hover:text-[#ef4444]"
              onClick={() => onDelete(lca.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm font-medium mb-1 text-[#1f2937]">{lca.job_title || "Unknown Job Title"}</div>
      {(lca.soc_code || lca.soc_title) && (
        <div className="text-xs text-[#6b7280] mb-3">
          SOC: {lca.soc_code} — {lca.soc_title}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-xs text-[#6b7280] block">Valid</span>
          <span className="text-[#1f2937]">
            {formatDateSafe(lca.lca_validity_start)} → {formatDateSafe(lca.lca_validity_end)}
          </span>
        </div>

        {lca.certified_date && (
          <div>
            <span className="text-xs text-[#6b7280] block">Certified</span>
            <span className="text-[#1f2937]">{formatDateSafe(lca.certified_date)}</span>
          </div>
        )}

        {lca.wage_level && (
          <div>
            <span className="text-xs text-[#6b7280] block">Wage Level</span>
            <span className="text-xs text-[#1f2937]">{formatWageLevel(lca.wage_level)}</span>
          </div>
        )}

        {(lca.prevailing_wage || lca.actual_wage) && (
          <div className="col-span-2">
            <span className="text-xs text-[#6b7280] block flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Wages
            </span>
            <div className="flex items-center gap-3 text-xs text-[#1f2937]">
              {lca.prevailing_wage && (
                <span>
                  <span className="text-[#6b7280]">Prevailing:</span>{" "}
                  {formatCurrency(lca.prevailing_wage, lca.wage_unit)}
                </span>
              )}
              {lca.actual_wage && (
                <span>
                  <span className="text-[#6b7280]">Actual:</span> {formatCurrency(lca.actual_wage, lca.wage_unit)}
                </span>
              )}
            </div>
          </div>
        )}

        {lca.employer_name && (
          <div className="col-span-2">
            <span className="text-xs text-[#6b7280] block">Employer</span>
            <span className="text-[#1f2937]">{lca.employer_name}</span>
            {lca.employer_fein && <span className="text-[#6b7280] text-xs ml-2">(FEIN: {lca.employer_fein})</span>}
          </div>
        )}
      </div>

      {lca?.worksites?.length && (
        <div className="mt-[12px] pt-[12px]" style={{ borderTop: "1px solid #7c3bed33" }}>
          <span className="text-xs text-[#6b7280] block flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3" />
            Worksites ({lca.worksites.length})
          </span>
          <div className="space-y-2">
            {lca.worksites.map((worksite, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${worksite.is_primary ? "bg-[#7c3bed1a] ring-1 ring-[#7c3bed33]" : "bg-[#f3f4f6]"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-[#6b7280]" />
                      <span className="font-medium text-sm text-[#1f2937]">
                        {worksite.worksite_name || "Unnamed Worksite"}
                      </span>
                      {worksite.is_primary && (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1 ml-5">
                      {worksite.address_line1 && <div>{worksite.address_line1}</div>}
                      {worksite.address_line2 && <div>{worksite.address_line2}</div>}
                      <div>
                        {[worksite.city, worksite.state, worksite.zip_code].filter(Boolean).join(", ")}
                        {worksite.county && ` (${worksite.county} County)`}
                      </div>
                    </div>
                    {worksite.client_contact_name && (
                      <div className="text-xs mt-1 ml-5 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#1f2937]">
                          <User className="h-3 w-3" />
                          {worksite.client_contact_name}
                        </span>
                        {worksite.client_contact_phone && (
                          <span className="flex items-center gap-1 text-[#6b7280]">
                            <Phone className="h-3 w-3" />
                            {worksite.client_contact_phone}
                          </span>
                        )}
                        {worksite.client_contact_email && (
                          <span className="flex items-center gap-1 text-[#6b7280]">
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
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <span className="text-xs text-[#6b7280] block flex items-center gap-1 mb-2">
            <Scale className="h-3 w-3" />
            Attorney / Representative
          </span>
          <div className="bg-[#f3f4f6]/20 rounded-md p-2">
            <div className="flex items-center gap-2">
              {lca.attorney_name && <span className="font-medium text-sm text-[#1f2937]">{lca.attorney_name}</span>}
              {lca.attorney_bar_number && (
                <Badge variant="outline" className="text-xs">
                  Bar# {lca.attorney_bar_number}
                </Badge>
              )}
            </div>
            {lca.attorney_firm && <div className="text-xs text-[#6b7280]">{lca.attorney_firm}</div>}
            <div className="flex items-center gap-3 text-xs mt-1">
              {lca.attorney_email && (
                <span className="flex items-center gap-1 text-[#1f2937]">
                  <Mail className="h-3 w-3" />
                  {lca.attorney_email}
                </span>
              )}
              {lca.attorney_phone && (
                <span className="flex items-center gap-1 text-[#1f2937]">
                  <Phone className="h-3 w-3" />
                  {lca.attorney_phone}
                </span>
              )}
            </div>
            {lca.attorney_address && <div className="text-xs text-[#6b7280] mt-1">{lca.attorney_address}</div>}
          </div>
        </div>
      )}

      {lca.notes && (
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <span className="text-xs text-[#6b7280] block mb-1">Notes</span>
          <p className="text-sm text-[#6b7280]">{lca.notes}</p>
        </div>
      )}

      {documents && (
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <span className="text-xs text-[#6b7280] block mb-2">Attached Documents (1)</span>
          <div className="space-y-1">
            <button className="bg-transparent font-medium flex items-center gap-2 text-left text-[#7c3bed] hover:underline w-full text-[12px]">
              <FileText className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{documents}</span>
            </button>{" "}
          </div>
        </div>
      )}
    </Card>
  );
}
