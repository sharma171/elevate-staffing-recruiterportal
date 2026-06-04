import React, { useState } from "react";
import { DatePicker } from "rsuite";
import {
  GraduationCap,
  CreditCard,
  Calendar,
  ChevronDown,
  Sparkles,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Circle,
  Plus,
  History,
  ChevronRight,
  Users,
  Award,
  AlertCircle,
  Edit,
  Save,
  X,
  CalendarDays,
} from "lucide-react";

// Reusable Components
const Badge = ({ children, className = "", variant = "default", ...props }) => {
  const baseClasses =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs";

  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
  };

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </div>
  );
};

const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={`${baseClasses} rounded-md ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`tracking-tight text-2xl font-semibold leading-none ${className}`} {...props}>
      {children}
    </h3>
  );
};

const Switch = ({ checked, onCheckedChange, disabled = false, ...props }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      {...props}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      />
    </button>
  );
};

const Label = ({ children, className = "", ...props }) => {
  return (
    <label
      className={`peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium leading-none ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

const Select = ({ value, onValueChange, children, disabled = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        role="combobox"
        aria-controls="select-content"
        aria-expanded={isOpen}
        className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-full h-9"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        {...props}
      >
        <span className="block truncate">{value || "Select..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {children}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SelectValue = ({ placeholder, ...props }) => {
  return (
    <span style={{ pointerEvents: "none" }} {...props}>
      {placeholder}
    </span>
  );
};

const Accordion = ({ children, className = "", ...props }) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AccordionItem = ({ children, className = "", ...props }) => {
  return (
    <div className={`border rounded-lg px-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AccordionTrigger = ({ children, className = "", isOpen = false, onClick, ...props }) => {
  return (
    <button
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
};

const AccordionContent = ({ children, className = "", isOpen = false, ...props }) => {
  return (
    <div
      className={`overflow-hidden text-sm transition-all ${isOpen ? "animate-accordion-down" : "animate-accordion-up"}`}
      {...props}
    >
      {isOpen && <div className="pb-4 pt-0">{children}</div>}
    </div>
  );
};

const Collapsible = ({ children, isOpen = false, ...props }) => {
  return <div {...props}>{children}</div>;
};

const CollapsibleContent = ({ children, className = "", isOpen = false, ...props }) => {
  return isOpen ? (
    <div className={`pt-4 space-y-6 px-1 ${className}`} {...props}>
      {children}
    </div>
  ) : null;
};

// Helper Functions
const formatDateSafe = (dateString) => {
  if (!dateString) return "—";

  // Handle ISO format
  if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return `${parseInt(month)}/${parseInt(day)}/${year}`;
  }

  return dateString;
};

const getDegreeLevelLabel = (level) => {
  const levels = {
    associate: "Associate's",
    bachelors: "Bachelor's",
    masters: "Master's",
    phd: "Doctorate",
    doctoral: "Doctoral",
  };
  return levels[level] || level;
};

const getEADCategoryLabel = (category) => {
  const categories = {
    C03A: "C03A - Pre-Completion OPT",
    C03B: "C03B - Post-Completion OPT",
    C03C: "C03C - STEM OPT Extension",
    OTHER: "Other",
  };
  return categories[category] || category;
};

const getI20TypeLabel = (type) => {
  const types = {
    initial: "Initial",
    continued_attendance: "Continued Attendance",
    opt_recommendation: "OPT Recommendation",
    stem_extension: "STEM Extension",
    cap_gap: "Cap Gap",
  };
  return types[type] || type.replace(/_/g, " ");
};

const getOPTTypeLabel = (type) => {
  const types = {
    pre_completion: "Pre-Completion OPT",
    post_completion: "Post-Completion OPT (Initial)",
    stem_opt: "STEM OPT Extension",
  };
  return types[type] || type.replace(/_/g, " ");
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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
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
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value?.toString() || ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  );
};

// Main Component
const OPTSection = ({
  data,
  isEditing,
  onChange,
  currentI20,
  currentEAD,
  allEADRecords = [],
  allI20Records = [],
  i983Records = [],
  onI20Change,
  onEADChange,
  onI983Change,
}) => {
  const [openAccordions, setOpenAccordions] = useState({
    school: true,
    opt: false,
    stem: true,
  });

  const [openCollapsibles, setOpenCollapsibles] = useState({
    previousI20s: true,
    previousEADs: true,
    i983Details: false,
    previousH1B: false,
    previousH4EAD: false,
    previousGCEAD: false,
  });

  const [stemOptStatus, setStemOptStatus] = useState("approved");

  // Toggle accordion
  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle collapsible
  const toggleCollapsible = (key) => {
    setOpenCollapsibles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Use props data or fallback to empty/dummy if needed (but prefer props)
  const optInfo = data || {};
  const stemEAD = allEADRecords.find((e) => e.ead_category === "C03C" && e.is_current);
  const previousEADs = allEADRecords.filter((e) => !e.is_current);
  const previousI20s = allI20Records.filter((i) => !i.is_current);
  const currentI983 = i983Records.find((i) => i.is_current);

  const handleOptInfoChange = (field, value) => {
    onChange?.({ ...optInfo, [field]: value });
  };

  // Calculate unemployment days remaining
  const unemploymentDaysRemaining = 150 - (optInfo.unemployment_days_used || 0);

  // Check if STEM eligible
  const isStemEligible = currentI20?.stem_eligible || optInfo.stem_eligible;

  // Check if STEM OPT applied
  const hasStemOptApplied = optInfo.stem_opt_applied || optInfo.opt_type === "stem_opt";

  // Check if STEM EAD exists
  const hasStemEAD = !!stemEAD;

  // Calculate evaluation status
  const getEvalStatus = (dueDate, completed) => {
    if (completed) return "completed";
    if (!dueDate) return "pending";

    const due = new Date(dueDate);
    const today = new Date();
    const daysUntil = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 30) return "upcoming";
    return "pending";
  };

  // Render I-20 section
  const renderI20Section = (i20, isCurrent = true) => {
    if (isEditing && isCurrent) {
      return (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary text-primary-foreground text-xs">I-20 (Editing)</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <EditField
              label="SEVIS Number"
              value={i20.sevis_number}
              onChange={(v) => onI20Change?.({ ...i20, sevis_number: v })}
            />
            <EditField
              label="School Name"
              value={i20.school_name}
              onChange={(v) => onI20Change?.({ ...i20, school_name: v })}
            />
            <EditField label="Program" value={i20.program} onChange={(v) => onI20Change?.({ ...i20, program: v })} />
            <EditField
              label="Program Start"
              type="date"
              value={i20.program_start_date}
              onChange={(v) => onI20Change?.({ ...i20, program_start_date: v })}
            />
            <EditField
              label="Program End"
              type="date"
              value={i20.program_end_date}
              onChange={(v) => onI20Change?.({ ...i20, program_end_date: v })}
            />
            {/* Add more fields as needed */}
          </div>
        </Card>
      );
    }

    return (
      <Card className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent ? (
              <Badge className="bg-primary text-primary-foreground text-xs">I-20</Badge>
            ) : (
              <GraduationCap className="h-4 w-4 text-primary" />
            )}
            <span className="font-medium text-sm">{i20.sevis_number}</span>
            {i20.stem_eligible && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                STEM Eligible
              </Badge>
            )}
            {i20.i20_type && (
              <Badge variant="secondary" className="text-xs capitalize">
                {getI20TypeLabel(i20.i20_type)}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => console.log("Delete I-20:", i20.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isCurrent && (
          <>
            <div className="text-sm font-medium mb-1">{i20.school_name}</div>
            <div className="text-xs text-muted-foreground mb-3">
              {getDegreeLevelLabel(i20.degree_level)} in {i20.program}
              {i20.cip_code && <span className="ml-2">(CIP: {i20.cip_code})</span>}
            </div>
          </>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-${isCurrent ? "3" : "4"} text-sm`}>
          {isCurrent && i20.student_name && (
            <div>
              <span className="text-xs text-muted-foreground block">Student Name</span>
              <span>{i20.student_name}</span>
            </div>
          )}

          {isCurrent && i20.school_address && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground block">School Address</span>
              <span className="text-xs">{i20.school_address}</span>
            </div>
          )}

          {isCurrent && i20.sevis_school_code && (
            <div>
              <span className="text-xs text-muted-foreground block">School Code</span>
              <span className="font-mono text-xs">{i20.sevis_school_code}</span>
            </div>
          )}

          <div>
            <span className="text-xs text-muted-foreground block">Program Dates</span>
            <span className="text-xs">
              {formatDateSafe(i20.program_start_date)} → {formatDateSafe(i20.program_end_date)}
            </span>
          </div>

          {i20.opt_start_date && i20.opt_end_date && (
            <div>
              <span className="text-xs text-muted-foreground block">OPT Dates</span>
              <span className="text-xs">
                {formatDateSafe(i20.opt_start_date)} → {formatDateSafe(i20.opt_end_date)}
              </span>
            </div>
          )}

          {isCurrent && i20.country_of_birth && (
            <div>
              <span className="text-xs text-muted-foreground block">Country of Birth</span>
              <span>{i20.country_of_birth}</span>
            </div>
          )}

          {isCurrent && i20.date_of_birth && (
            <div>
              <span className="text-xs text-muted-foreground block">Date of Birth</span>
              <span>{formatDateSafe(i20.date_of_birth)}</span>
            </div>
          )}

          {!isCurrent && i20.dso_name && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground block">DSO Contact</span>
              <span className="font-medium">{i20.dso_name}</span>
            </div>
          )}
        </div>

        {isCurrent && (i20.dso_name || i20.dso_email || i20.dso_phone) && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <span className="text-xs text-muted-foreground block mb-2">DSO Contact</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {i20.dso_name && (
                <div>
                  <span className="text-xs text-muted-foreground block">Name</span>
                  <span>{i20.dso_name}</span>
                </div>
              )}
              {i20.dso_email && (
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="text-xs truncate block">{i20.dso_email}</span>
                </div>
              )}
              {i20.dso_phone && (
                <div>
                  <span className="text-xs text-muted-foreground block">Phone</span>
                  <span>{i20.dso_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Render EAD card
  const renderEADCard = (ead, isCurrent = false, isStem = false) => {
    if (isEditing && isCurrent) {
      return (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary text-primary-foreground text-xs">EAD (Editing)</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <EditField
              label="Card Number"
              value={ead.ead_number}
              onChange={(v) => onEADChange?.({ ...ead, ead_number: v })}
            />
            <EditField
              label="Category"
              value={ead.ead_category}
              onChange={(v) => onEADChange?.({ ...ead, ead_category: v })}
            />
            <EditField
              label="Valid From"
              type="date"
              value={ead.card_valid_from}
              onChange={(v) => onEADChange?.({ ...ead, card_valid_from: v })}
            />
            <EditField
              label="Expiry Date"
              type="date"
              value={ead.card_expiry_date}
              onChange={(v) => onEADChange?.({ ...ead, card_expiry_date: v })}
            />
            {/* Add more fields */}
          </div>
        </Card>
      );
    }

    const getStatusVariant = (status) => {
      switch (status) {
        case "active":
          return "default";
        case "pending":
          return "secondary";
        case "expired":
          return "destructive";
        case "replaced":
          return "destructive";
        default:
          return "outline";
      }
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case "active":
          return "Active";
        case "pending":
          return "Pending";
        case "expired":
          return "Expired";
        case "replaced":
          return "Replaced";
        default:
          return status;
      }
    };

    return (
      <Card
        className={`p-4 ${isStem ? "border-primary/50 bg-primary/5" : ead.status === "expired" ? "border-destructive/50" : "border-muted"}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{ead.ead_number}</span>
            {ead.status && (
              <Badge variant={getStatusVariant(ead.status)} className="text-xs capitalize">
                {getStatusLabel(ead.status)}
              </Badge>
            )}
            {ead.ead_category && (
              <Badge variant="outline" className="text-xs">
                {getEADCategoryLabel(ead.ead_category)}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => console.log("Delete EAD:", ead.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {ead.card_holder_name && <div className="text-sm font-medium mb-1">{ead.card_holder_name}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {ead.a_number && (
            <div>
              <p className="text-xs text-muted-foreground">A-Number</p>
              <p className="font-medium">{ead.a_number}</p>
            </div>
          )}

          {ead.card_valid_from && (
            <div>
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="font-medium">{formatDateSafe(ead.card_valid_from)}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground">Expiry Date</p>
            <p className={`font-medium ${ead.status === "expired" ? "text-destructive" : ""}`}>
              {formatDateSafe(ead.card_expiry_date)}
            </p>
          </div>

          {isStem && (
            <div>
              <p className="text-xs text-muted-foreground">Unemployment Days</p>
              <p className="font-medium">{ead.unemployment_days_used || 0} / 150 days</p>
            </div>
          )}
        </div>

        {isStem && ead.unemployment_days_used > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-1">{unemploymentDaysRemaining} days remaining</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.min(100, (ead.unemployment_days_used / 150) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Render I-983 evaluation timeline
  const renderI983EvalTimeline = () => {
    if (!currentI983) return null;

    const evaluations = [
      {
        label: "6-Month",
        due: currentI983.eval_6month_due,
        completed: currentI983.eval_6month_completed,
        type: "6month",
      },
      {
        label: "12-Month",
        due: currentI983.eval_12month_due,
        completed: currentI983.eval_12month_completed,
        type: "12month",
      },
      {
        label: "Final",
        due: currentI983.eval_final_due,
        completed: currentI983.eval_final_completed,
        type: "final",
      },
    ];

    return (
      <div className="grid grid-cols-3 gap-2 mb-3">
        {evaluations.map((evalItem, index) => {
          const status = getEvalStatus(evalItem.due, evalItem.completed);
          const bgClass =
            status === "overdue"
              ? "bg-red-50 border-red-200"
              : status === "upcoming"
                ? "bg-amber-50 border-amber-200"
                : status === "completed"
                  ? "bg-green-50 border-green-200"
                  : "bg-muted/50 border-muted";

          const iconColor =
            status === "overdue"
              ? "text-red-600"
              : status === "upcoming"
                ? "text-amber-600"
                : status === "completed"
                  ? "text-green-600"
                  : "text-muted-foreground";

          return (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${bgClass}`}>
              <div className="flex items-center gap-2">
                {status === "completed" ? (
                  <CheckCircle className={`h-4 w-4 ${iconColor}`} />
                ) : status === "upcoming" || status === "overdue" ? (
                  <Clock className={`h-4 w-4 ${iconColor}`} />
                ) : (
                  <Circle className={`h-4 w-4 ${iconColor}`} />
                )}
                <div>
                  <p className="text-sm font-medium">{evalItem.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {evalItem.completed ? "Completed" : `Due: ${formatDateSafe(evalItem.due)}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-4 space-y-4">
      <div className="space-y-4">
        {/* OPT Section */}
        <div className="space-y-4">
          <Accordion className="space-y-4">
            {/* School/Program Information */}
            <AccordionItem className="border rounded-lg px-4">
              <AccordionTrigger isOpen={openAccordions.school} onClick={() => toggleAccordion("school")}>
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">School/Program Information</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Smart Upload I-20");
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Smart Upload I-20
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent isOpen={openAccordions.school}>
                {currentI20 ? (
                  renderI20Section(currentI20, true)
                ) : (
                  <div className="p-4 text-muted-foreground">No current I-20 found.</div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* OPT EAD Card - Hidden when STEM OPT has an approved C03C card */}
            {!hasStemEAD && (
              <AccordionItem className="border rounded-lg px-4">
                <AccordionTrigger isOpen={openAccordions.opt} onClick={() => toggleAccordion("opt")}>
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">OPT EAD Card</span>
                      <Badge variant="outline" className="text-xs">
                        {getOPTTypeLabel(optInfo.opt_type)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Smart Upload EAD");
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Smart Upload EAD
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent isOpen={openAccordions.opt}>
                  {currentEAD ? (
                    renderEADCard(currentEAD, true, false)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No EAD card uploaded yet.</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* STEM OPT Extension */}
            {isStemEligible && (
              <AccordionItem className="border rounded-lg px-4">
                <AccordionTrigger isOpen={openAccordions.stem} onClick={() => toggleAccordion("stem")}>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">STEM OPT Extension</span>
                    {hasStemEAD && (
                      <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-400 text-xs">
                        Approved
                      </Badge>
                    )}
                    {hasStemOptApplied && !hasStemEAD && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400 text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent isOpen={openAccordions.stem}>
                  <div className="pt-4 pb-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Applied for STEM OPT Extension?</Label>
                        <Switch
                          checked={hasStemOptApplied || hasStemEAD}
                          onCheckedChange={(checked) => handleOptInfoChange("stem_opt_applied", checked)}
                          disabled={hasStemEAD}
                        />
                        <span className="text-sm text-muted-foreground">
                          {hasStemOptApplied || hasStemEAD ? "Yes" : "No"}
                        </span>
                      </div>

                      {(hasStemOptApplied || hasStemEAD) && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Label className="text-sm font-medium">Status:</Label>
                            <Select value={stemOptStatus} onValueChange={setStemOptStatus} disabled={hasStemEAD}>
                              <SelectTrigger className="w-40 h-9">
                                <SelectValue placeholder="Select status">
                                  {stemOptStatus === "approved" ? "Approved" : "Pending"}
                                </SelectValue>
                              </SelectTrigger>
                            </Select>
                          </div>

                          {stemOptStatus === "approved" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                {/* STEM OPT I-20 */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <span className="text-sm font-medium">STEM OPT I-20</span>
                                      <p className="text-xs text-muted-foreground">I-20 with STEM OPT recommendation</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className="border-amber-500 text-amber-700 dark:text-amber-400"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Missing
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => console.log("Upload STEM I-20")}
                                    >
                                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                                      Smart Upload I-20
                                    </Button>
                                  </div>
                                </div>

                                {/* I-983 Training Plan */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <span className="text-sm font-medium">I-983 Training Plan</span>
                                      <p className="text-xs text-muted-foreground">
                                        Employer/student training plan for STEM OPT
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className="border-green-600 text-green-700 dark:text-green-400"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Uploaded
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => console.log("Upload I-983")}
                                    >
                                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                                      Smart Upload I-983
                                    </Button>
                                  </div>
                                </div>

                                {/* I-983 Details inline */}
                                {currentI983 && (
                                  <Card className="border-primary/50 bg-primary/5 p-4 mt-2">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">{currentI983.employer_name}</span>
                                        <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {currentI983.submitted ? "Submitted" : "Not Submitted"}
                                        </Badge>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => console.log("Delete I-983:", currentI983.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Job Title</p>
                                        <p className="font-medium">{currentI983.job_title}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Training Period</p>
                                        <p className="font-medium">
                                          {formatDateSafe(currentI983.training_start_date)} →{" "}
                                          {formatDateSafe(currentI983.training_end_date)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Compensation</p>
                                        <p className="font-medium">{currentI983.compensation}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Hours/Week</p>
                                        <p className="font-medium">{currentI983.hours_per_week}</p>
                                      </div>
                                    </div>

                                    {renderI983EvalTimeline()}
                                  </Card>
                                )}

                                {/* STEM OPT EAD Card */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <span className="text-sm font-medium">STEM OPT EAD Card</span>
                                      <p className="text-xs text-muted-foreground">C03C category EAD card</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className="border-green-600 text-green-700 dark:text-green-400"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Uploaded
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => console.log("Upload STEM EAD")}
                                    >
                                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                                      Smart Upload STEM EAD
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* STEM OPT EAD Card Details */}
                              {stemEAD && renderEADCard(stemEAD, true, true)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Previous I-20s */}
          <Collapsible>
            <Button
              className="w-full justify-start text-muted-foreground hover:bg-muted/50 h-9 rounded-md px-3"
              onClick={() => toggleCollapsible("previousI20s")}
            >
              <ChevronDown
                className={`h-4 w-4 mr-2 transition-transform ${openCollapsibles.previousI20s ? "rotate-180" : ""}`}
              />
              Previous I-20s ({previousI20s.length})
            </Button>
            <CollapsibleContent isOpen={openCollapsibles.previousI20s} className="space-y-2 pt-2">
              {previousI20s.map((i20, index) => (
                <div key={i20.id || index}>{renderI20Section(i20, false)}</div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Previous EAD Cards */}
          <Collapsible>
            <Button
              className="w-full justify-start text-muted-foreground hover:bg-muted/50 h-9 rounded-md px-3"
              onClick={() => toggleCollapsible("previousEADs")}
            >
              <ChevronDown
                className={`h-4 w-4 mr-2 transition-transform ${openCollapsibles.previousEADs ? "rotate-180" : ""}`}
              />
              Previous EAD Cards ({previousEADs.length})
            </Button>
            <CollapsibleContent isOpen={openCollapsibles.previousEADs} className="space-y-2 pt-2">
              {previousEADs.map((ead, index) => (
                <div key={ead.id || index}>{renderEADCard(ead, false, ead.ead_category === "C03C")}</div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* I-983 Training Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">I-983 Training Plans</h3>
                <Badge variant="secondary" className="text-xs">
                  {currentI983 ? 1 : 0}
                </Badge>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => console.log("Add I-983")}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add I-983
              </Button>
            </div>

            {currentI983 ? (
              <Card className="p-4 border-primary/50 bg-primary/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{currentI983.employer_name}</span>
                    <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentI983.submitted ? "Submitted" : "Not Submitted"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => console.log("Delete I-983:", currentI983.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="font-medium">{currentI983.job_title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Training Period</p>
                    <p className="font-medium">
                      {formatDateSafe(currentI983.training_start_date)} →{" "}
                      {formatDateSafe(currentI983.training_end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Compensation</p>
                    <p className="font-medium">{currentI983.compensation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hours/Week</p>
                    <p className="font-medium">{currentI983.hours_per_week}</p>
                  </div>
                </div>

                {renderI983EvalTimeline()}

                <Collapsible>
                  <Button
                    className="w-full justify-start text-muted-foreground p-0 h-auto hover:bg-transparent rounded-md"
                    onClick={() => toggleCollapsible("i983Details")}
                  >
                    <ChevronRight
                      className={`h-4 w-4 mr-1 transition-transform ${openCollapsibles.i983Details ? "rotate-90" : ""}`}
                    />
                    <span className="text-xs">{openCollapsibles.i983Details ? "Hide Details" : "Show Details"}</span>
                  </Button>
                  <CollapsibleContent isOpen={openCollapsibles.i983Details} className="pt-3 space-y-4">
                    <div className="text-sm text-muted-foreground">Additional I-983 details would appear here.</div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <div className="text-muted-foreground mb-2">No I-983 training plans uploaded yet</div>
                <Button size="sm" variant="outline" onClick={() => console.log("Add first I-983")}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add I-983
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OPTSection;
