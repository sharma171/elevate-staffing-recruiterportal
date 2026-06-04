import { useState } from "react";
import { SelectPicker, DatePicker } from "rsuite";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Eye,
  Trash2,
  ArrowUpCircle,
  CalendarCheck,
  Timer,
  CalendarX,
  Zap,
  User,
  FileText,
  Link,
  AlertCircle,
  MapPin,
  Building2,
  GraduationCap,
  Info,
  CalendarDays,
} from "lucide-react";
import SmartUploadButton from "./SmartUploadButton";

// ----- STATUS CONFIG (ditto) -----
const PETITION_STATUS_CONFIG = {
  approved: {
    label: "Approved",
    headerLabel: "APPROVED",
    headerBg: "bg-[#7c3bed0d] ring-[#7c3bed80]",
    badgeClass: "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]",
    icon: CheckCircle,
    iconColor: "text-[#16a34a]",
    infoBg: "bg-[#f0fdf4]",
    infoBorder: "ring-[#bbf7d0]",
  },
  pending: {
    label: "Pending",
    headerLabel: "PENDING",
    headerBg: "bg-[#fefce8] ring-[#fef08a]",
    badgeClass: "bg-[#fef9c3] text-[#854d0e] ring-[#fef08a]",
    icon: Clock,
    iconColor: "text-[#ca8a04]",
    infoBg: "bg-[#fefce8]",
    infoBorder: "ring-[#fef08a]",
  },
  rfe: {
    label: "Request for Evidence",
    headerLabel: "RFE",
    headerBg: "bg-[#fff7ed] ring-[#fed7aa]",
    badgeClass: "bg-[#ffedd5] text-[#9a3412] ring-[#fed7aa]",
    icon: AlertTriangle,
    iconColor: "text-[#ea580c]",
    infoBg: "bg-[#fff7ed]",
    infoBorder: "ring-[#fed7aa]",
  },
  denied: {
    label: "Denied",
    headerLabel: "DENIED",
    headerBg: "bg-[#fef2f2] border-[#fecaca]",
    badgeClass: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]",
    icon: XCircle,
    iconColor: "text-[#dc2626]",
    infoBg: "bg-[#fef2f2]",
    infoBorder: "border-[#fecaca]",
  },
  withdrawn: {
    label: "Withdrawn",
    headerLabel: "WITHDRAWN",
    headerBg: "bg-[#f9fafb] border-[#e5e7eb]",
    badgeClass: "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]",
    icon: MinusCircle,
    iconColor: "text-[#6b7280]",
    infoBg: "bg-[#f9fafb]",
    infoBorder: "border-[#e5e7eb]",
  },
};

const UNKNOWN_STATUS_CONFIG = {
  label: "Unknown",
  headerLabel: "UNKNOWN",
  headerBg: "bg-[#f3f4f6] border-[#d1d5db]",
  badgeClass: "bg-[#e5e7eb] text-[#4b5563] border-[#d1d5db]",
  icon: Clock,
  iconColor: "text-[#6b7280]",
  infoBg: "bg-[#f3f4f6]",
  infoBorder: "border-[#d1d5db]",
};

const getStatusConfig = (status) => {
  if (!status) return UNKNOWN_STATUS_CONFIG;
  return PETITION_STATUS_CONFIG[status] || UNKNOWN_STATUS_CONFIG;
};

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

const calculateDaysSince = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
};

const getExpiryStatus = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { color: "text-[#dc2626]", message: "Expired" };
  if (daysUntil <= 30) return { color: "text-[#dc2626]", message: `${daysUntil}d left` };
  if (daysUntil <= 60) return { color: "text-[#ea580c]", message: `${daysUntil}d left` };
  if (daysUntil <= 90) return { color: "text-[#ca8a04]", message: `${daysUntil}d left` };
  return null;
};

const getProcessingStatus = (days, isPremium) => {
  if (isPremium) {
    if (days > 20)
      return { color: "text-[#dc2626]", bgColor: "bg-[#fee2e2]", message: "Past premium deadline", isAlert: true };
    if (days > 15)
      return { color: "text-[#ea580c]", bgColor: "bg-[#ffedd5]", message: "Near premium deadline", isAlert: true };
    return {
      color: "text-[#16a34a]",
      bgColor: "bg-[#dcfce7]",
      message: `${20 - days}d of premium window left`,
      isAlert: false,
    };
  }
  if (days > 240)
    return { color: "text-[#dc2626]", bgColor: "bg-[#fee2e2]", message: "Unusually long processing", isAlert: true };
  if (days > 180)
    return { color: "text-[#ea580c]", bgColor: "bg-[#ffedd5]", message: "Long processing time", isAlert: true };
  if (days > 90)
    return { color: "text-[#ca8a04]", bgColor: "bg-[#fef9c3]", message: "Normal processing", isAlert: false };
  return { color: "text-[#16a34a]", bgColor: "bg-[#dcfce7]", message: "Recently filed", isAlert: false };
};

const formatCapStatus = (capStatus) => {
  if (!capStatus) return "";
  const labels = {
    cap_subject: "Cap Subject",
    cap_exempt: "Cap Exempt",
    cap_exempt_masters: "Cap Exempt (Masters)",
  };
  return labels[capStatus] || capStatus;
};

const getPetitionTypeLabel = (type) => {
  const labels = {
    initial: "Initial",
    transfer: "Transfer",
    extension: "Extension",
    amendment: "Amendment",
    concurrent: "Concurrent",
  };
  return labels[type] || type;
};

// ----- nested data helpers -----
const getBeneficiaryName = (p) => p.beneficiary_data?.name || p.beneficiary_name;
const getBeneficiaryANumber = (p) => p.beneficiary_data?.a_number || p.beneficiary_a_number;
const getBeneficiaryDOB = (p) => p.beneficiary_data?.dob || p.beneficiary_dob;
const getBeneficiaryCountry = (p) => p.beneficiary_data?.country_of_birth || p.beneficiary_country_of_birth;
const getI94Number = (p) => p.i94_data?.i94_number || p.i94_number;
const getI94Class = (p) => p.i94_data?.i94_class || p.i94_class;
const getI94Start = (p) => p.i94_data?.i94_validity_start || p.i94_validity_start;
const getI94End = (p) => p.i94_data?.i94_validity_end || p.i94_expiry;

// ----- PetitionActions (ditto, pure divs) -----
const PetitionActions = ({
  petition,
  isCurrent,
  isEditing = false,
  hasOtherPetitions,
  candidateEmail,
  candidateId,
  onAction = () => {},
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
}) => {
  const isPending = petition.status === "pending";
  const isRFE = petition.status === "rfe";
  const isApproved = petition.status === "approved";
  const isInProgress = isPending || isRFE;
  const hasDocument = !!petition.document_file_name;

  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {hasDocument && (
          <button
            onClick={() => onAction("viewDoc", petition)}
            className="inline-flex items-center h-7 px-2 text-xs border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] rounded-md text-[#0f172a]"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View Doc
          </button>
        )}
        <button
          onClick={() => onAction("delete", petition)}
          className="inline-flex items-center justify-center h-7 w-7 text-[#dc2626] hover:text-[#b91c1c] hover:bg-[#fee2e2] rounded-md"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasDocument && (
        <button
          onClick={() => onAction("viewDoc", petition)}
          className="inline-flex items-center h-7 px-2 text-xs border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] rounded-md text-[#0f172a]"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View I-797
        </button>
      )}

      {isInProgress && candidateEmail && onI797DataExtracted && (
        <SmartUploadButton
          documentType="h1b_approval"
          label="Upload Approval"
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onDataExtracted={onI797DataExtracted}
          onRawDataExtracted={onSaveI797}
          onRefreshData={onRefreshData}
          className="inline-flex items-center h-7 px-3 text-xs bg-[#7c3bed] text-white hover:bg-[#1d4ed8] rounded-md font-medium"
        />
      )}

      {isCurrent && isApproved && candidateEmail && onI797DataExtracted && (
        <button
          onClick={() => {
            /* SmartUploadButton mock */
          }}
          className="inline-flex items-center h-7 px-3 text-xs border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] rounded-md text-[#0f172a]"
        >
          Upload New I-797
        </button>
      )}

      {!isCurrent && isApproved && (
        <button
          onClick={() => onAction("setActive", petition)}
          className="inline-flex items-center h-7 px-2 text-xs border border-[#86efac] text-[#166534] bg-white hover:bg-[#f0fdf4] rounded-md"
        >
          <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
          Set as Current
        </button>
      )}

      <button
        onClick={() => onAction("delete", petition)}
        className="inline-flex items-center justify-center h-7 w-7 text-[#dc2626] hover:text-[#b91c1c] hover:bg-[#fee2e2] rounded-md"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// ----- Date sections (ditto) -----
const ApprovedDatesSection = ({ petition }) => {
  const expiryStatus = getExpiryStatus(petition.validity_end);
  return (
    <div className="grid grid-cols-3 gap-3 p-[12px] bg-[#7c3bed1a] rounded-[10px] ring-1 ring-[#7c3bed4d]">
      <div className="text-center">
        <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
          <CalendarCheck className="h-3 w-3" /> Approved
        </div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.approval_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[#67677e] mb-1">Valid From</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.validity_start)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[#67677e] mb-1">Valid To</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.validity_end)}</div>
        {expiryStatus && (
          <div className={`text-xs ${expiryStatus.color} font-medium mt-0.5`}>{expiryStatus.message}</div>
        )}
      </div>
    </div>
  );
};

const PendingDatesSection = ({ petition }) => {
  const daysPending = calculateDaysSince(petition.filed_date);
  const processingStatus =
    daysPending !== null ? getProcessingStatus(daysPending, petition.premium_processing || false) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 p-[12px] bg-[#fefce8] rounded-[10px]">
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
            <CalendarCheck className="h-3 w-3" /> Filed
          </div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">Notice Date</div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
            <Timer className="h-3 w-3" /> Pending
          </div>
          <div className="font-semibold text-sm">{daysPending !== null ? `${daysPending} days` : "—"}</div>
          {processingStatus && (
            <div className={`text-xs ${processingStatus.color} font-medium mt-0.5`}>{processingStatus.message}</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-[10px] bg-[#f1f1f94d] rounded-[12px] !border !border-dashed border-[#e7e7ef]">
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">Approval Date</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">Validity Period</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">I-94</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
      </div>
    </div>
  );
};

const RFEDatesSection = ({ petition, rfeReceivedDate }) => {
  const daysSinceRFE = rfeReceivedDate ? calculateDaysSince(rfeReceivedDate) : null;
  const daysRemaining = daysSinceRFE !== null ? Math.max(0, 87 - daysSinceRFE) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 p-3 bg-[#fff7ed] rounded-lg border border-[#fed7aa]">
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
            <CalendarCheck className="h-3 w-3" /> Filed
          </div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">RFE Received</div>
          <div className="font-semibold text-sm">{formatDateSafe(rfeReceivedDate || petition.notice_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Days Since RFE
          </div>
          <div className="font-semibold text-sm">{daysSinceRFE !== null ? `${daysSinceRFE} days` : "—"}</div>
          {daysRemaining !== null && (
            <div
              className={`text-xs font-medium mt-0.5 ${daysRemaining < 30 ? "text-[#dc2626]" : daysRemaining < 60 ? "text-[#ea580c]" : "text-[#ca8a04]"}`}
            >
              ~{daysRemaining}d to respond
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 bg-[#f1f5f9]/30 rounded-lg border border-dashed border-[#cbd5e1]">
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">Approval Date</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">Validity Period</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#67677e] mb-1">I-94</div>
          <div className="text-sm text-[#67677e] italic">Awaiting...</div>
        </div>
      </div>
    </div>
  );
};

const DeniedDatesSection = ({ petition }) => (
  <div className="grid grid-cols-3 gap-3 p-3 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1">Filed</div>
      <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
    </div>
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1">Notice Date</div>
      <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
    </div>
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1 flex items-center justify-center gap-1">
        <CalendarX className="h-3 w-3" /> Status
      </div>
      <div className="font-semibold text-sm text-[#dc2626]">Denied</div>
    </div>
  </div>
);

const WithdrawnDatesSection = ({ petition }) => (
  <div className="grid grid-cols-3 gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1">Filed</div>
      <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
    </div>
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1">Notice Date</div>
      <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
    </div>
    <div className="text-center">
      <div className="text-xs text-[#67677e] mb-1">Status</div>
      <div className="font-semibold text-sm text-[#4b5563]">Withdrawn</div>
    </div>
  </div>
);

// ----- Inline edit fields (pure divs) -----
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
      <input
        type={type}
        value={value?.toString() || ""}
        onChange={(e) => onChange(e.target.value)}
        className="form-control bigHoverInput"
        placeholder={placeholder}
      />
    </div>
  );
};

const SelectField = ({ label, value, options, onChange, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">{label}</label>
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

const CheckboxField = ({ id, checked, onChange, label, className = "" }) => (
  <div className={`flex items-center h-8 gap-2 ${className}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked || false}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#2563eb] h-4 w-4"
    />
    <label htmlFor={id} className="text-sm text-[#0f172a]">
      {label}
    </label>
  </div>
);

// ----- OPTIONS (ditto) -----
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

// ========== MAIN COMPONENT ==========
export default function PetitionStatusCard({
  petition,
  isCurrent,
  currentPetition,
  linkedLCA,
  lcaHistory = [],
  isEditing,
  hasOtherPetitions = false,
  candidateEmail,
  candidateId,
  onAction = () => {},
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
  // const availableLCAs = lcaHistory.filter((lca) => lca.status === "certified");
  const availableLCAs = lcaHistory;

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

  // ----- EDIT MODE -----
  if (isEditing) {
    return (
      <div
        className={`p-3 space-y-4 rounded-[10px] ring-1 ${
          isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-[#f1f1f9] bg-[#f1f1f94d]"
        }`}
      >
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent ? (
              <span className="inline-flex px-2 py-1 text-xs font-semibold bg-[#7c3bed] text-white rounded-[1000px]">
                CURRENT
              </span>
            ) : (
              <span className="inline-flex px-2 py-1 text-xs font-semibold bg-white ring-1 ring-[#e7e7ef] text-[#67677e] rounded-[1000px]">
                {petition.status?.toUpperCase() || "PETITION"}
              </span>
            )}
            <span className="inline-flex px-2 py-1 text-xs font-semibold bg-[#f3f3fc] text-[#000] rounded-[100px]">
              Edit Mode
            </span>
            {petition.premium_processing && (
              <span className="inline-flex items-center px-2 py-1 text-xs border border-[#f59e0b] text-[#b45309] bg-[#fffbeb] rounded-[1000px]">
                <Zap className="h-3 w-3 mr-1" /> Premium
              </span>
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
            onChange={(v) => handleFieldChange("receipt_number", v)}
          />
          <SelectField
            label="Petition Type"
            value={petition.petition_type}
            options={PETITION_TYPES}
            onChange={(v) => handleFieldChange("petition_type", v)}
          />
          <SelectField
            label="Status"
            value={petition.status}
            options={PETITION_STATUSES}
            onChange={(v) => handleFieldChange("status", v)}
          />
          <CheckboxField
            id={`premium-${petition.id}`}
            checked={petition.premium_processing}
            onChange={(c) => handleFieldChange("premium_processing", c)}
            label="Premium Processing"
            className="mt-6"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Employer Name"
            value={petition.employer_name}
            onChange={(v) => handleFieldChange("employer_name", v)}
            className="col-span-2"
          />
          <EditField
            label="Employer FEIN"
            value={petition.employer_fein}
            onChange={(v) => handleFieldChange("employer_fein", v)}
          />
          <EditField
            label="Classification"
            value={petition.classification}
            onChange={(v) => handleFieldChange("classification", v)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <EditField
            label="Filed Date"
            value={petition.filed_date}
            type="date"
            onChange={(v) => handleFieldChange("filed_date", v)}
          />
          <EditField
            label="Notice Date"
            value={petition.notice_date}
            type="date"
            onChange={(v) => handleFieldChange("notice_date", v)}
          />
          <EditField
            label="Approval Date"
            value={petition.approval_date}
            type="date"
            onChange={(v) => handleFieldChange("approval_date", v)}
          />
          <EditField
            label="Valid From"
            value={petition.validity_start}
            type="date"
            onChange={(v) => handleFieldChange("validity_start", v)}
          />
          <EditField
            label="Valid To"
            value={petition.validity_end}
            type="date"
            onChange={(v) => handleFieldChange("validity_end", v)}
          />
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-[#67677e]" />
            <span className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Beneficiary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="Name"
              value={getBeneficiaryName(petition)}
              onChange={(v) => handleBeneficiaryChange("name", v)}
            />
            <EditField
              label="A-Number"
              value={getBeneficiaryANumber(petition)}
              onChange={(v) => handleBeneficiaryChange("a_number", v)}
            />
            <EditField
              label="Date of Birth"
              value={getBeneficiaryDOB(petition)}
              type="date"
              onChange={(v) => handleBeneficiaryChange("dob", v)}
            />
            <EditField
              label="Country of Birth"
              value={getBeneficiaryCountry(petition)}
              onChange={(v) => handleBeneficiaryChange("country_of_birth", v)}
            />
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-[#67677e]" />
            <span className="text-xs font-medium text-[#67677e] uppercase tracking-wide">I-94 Information</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="I-94 Number"
              value={getI94Number(petition)}
              onChange={(v) => handleI94Change("i94_number", v)}
            />
            <EditField
              label="Class of Admission"
              value={getI94Class(petition)}
              onChange={(v) => handleI94Change("i94_class", v)}
            />
            <EditField
              label="Valid From"
              value={getI94Start(petition)}
              type="date"
              onChange={(v) => handleI94Change("i94_validity_start", v)}
            />
            <EditField
              label="Valid To"
              value={getI94End(petition)}
              type="date"
              onChange={(v) => handleI94Change("i94_validity_end", v)}
            />
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-3">
          <div className="flex items-center gap-2">
            <Link className="h-3.5 w-3.5 text-[#7c3bed]" />
            <span className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Linked LCA</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Select LCA</label>
              <SelectPicker
                value={petition.lca_id || "none"}
                onChange={(value) => {
                  if (value === "none") handleFieldChange("lca_id", null);
                  else handleFieldChange("lca_id", value);
                }}
                data={[
                  { value: "none", label: "Not linked" },
                  ...availableLCAs.map((lca) => ({
                    value: lca.id,
                    label: `${lca.lca_case_number} — ${lca.job_title || "N/A"}`,
                  })),
                ]}
                cleanable={false}
                searchable={false}
                className="w-full bigHoverInputr"
                placeholder="Select LCA"
              />
            </div>
            {linkedLCA && (
              <div className="text-xs text-[#67677e] pt-6">
                {linkedLCA.lca_status} • Valid: {formatDateSafe(linkedLCA.lca_validity_start)} →{" "}
                {formatDateSafe(linkedLCA.lca_validity_start)}
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
            onChange={(v) => handleFieldChange("cap_status", v === "none" ? undefined : v)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Notes</label>
          <textarea
            value={petition.notes || ""}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            className="form-control bigHoverInput"
            placeholder="Add any notes..."
          />
        </div>
      </div>
    );
  }

  // ----- READ MODE -----
  return (
    <div
      className={`overflow-hidden rounded-[10px] ring-1 ${
        useCurrentStyle ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : statusConfig.headerBg
      }`}
    >
      <div
        className={`px-3 py-2 flex items-center justify-between ${
          useCurrentStyle ? "bg-transparent ring-[#7c3bed4d] ring-1" : statusConfig.headerBg
        }`}
        style={{ borderBottom: `1px solid ${useCurrentStyle ? "#7c3bed4d" : "#fef08a"}` }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
          <span className="font-semibold text-sm">{isCurrent ? "CURRENT" : statusConfig.headerLabel}</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${statusConfig.badgeClass}`}>
            {statusConfig.label}
          </span>
          {petition.premium_processing && (
            <span className="inline-flex items-center px-2 py-1 text-xs border border-[#f59e0b] text-[#b45309] bg-[#fffbeb] rounded-md">
              <Zap className="h-3 w-3 mr-1" /> Premium
            </span>
          )}
          {isInProgress && daysPending !== null && (
            <span className="text-xs text-[#67677e] ml-2">⏱️ {daysPending} days since filing</span>
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

      <div className="p-3 space-y-4 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-[#67677e] block">Receipt Number</span>
            <span className="font-mono font-bold text-sm">{petition.receipt_number || "—"}</span>
          </div>
          <div>
            <span className="text-xs text-[#67677e] block">Type / Classification</span>
            <span className="text-sm capitalize font-medium">
              {getPetitionTypeLabel(petition.petition_type)} | {petition.classification || "H-1B"}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#67677e] block">Employer</span>
            <span className="text-sm font-semibold">{petition.employer_name || "—"}</span>
            {petition.employer_fein && (
              <span className="text-xs text-[#67677e] ml-2">(FEIN: {petition.employer_fein})</span>
            )}
            {petition.employer_address && (
              <div className="text-xs text-[#67677e] mt-0.5 whitespace-pre-line">{petition.employer_address}</div>
            )}
          </div>
        </div>

        {isApproved && <ApprovedDatesSection petition={petition} />}
        {isPending && <PendingDatesSection petition={petition} />}
        {isRFE && <RFEDatesSection petition={petition} />}
        {isDenied && <DeniedDatesSection petition={petition} />}
        {isWithdrawn && <WithdrawnDatesSection petition={petition} />}

        {isInProgress && (
          <div className="p-3 bg-[#f1f5f9]/30 rounded-lg border border-[#e2e8f0] space-y-2">
            <div className="text-xs font-medium text-[#67677e] uppercase tracking-wide">What's Available</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-[#67677e] flex items-center gap-1">
                  <Link className="h-3 w-3" /> LCA
                </span>

                {linkedLCA ? (
                  <span className="font-mono text-xs">
                    {linkedLCA.lca_case_number} ({linkedLCA.lca_status})
                  </span>
                ) : petition.linked_lca_number ? (
                  <span className="font-mono text-xs">{petition.linked_lca_number}</span>
                ) : (
                  <span className="text-xs text-[#67677e] italic flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Not linked
                  </span>
                )}
              </div>
              {getBeneficiaryName(petition) && (
                <div>
                  <span className="text-xs text-[#67677e]">Beneficiary</span>
                  <div className="text-xs text-[#000]">
                    {getBeneficiaryName(petition)}
                    {getBeneficiaryANumber(petition) && (
                      <span className="text-[#67677e] ml-1">({getBeneficiaryANumber(petition)})</span>
                    )}
                  </div>
                </div>
              )}
              {petition.job_title && (
                <div>
                  <span className="text-xs text-[#67677e]">Position</span>
                  <div className="text-xs">
                    {petition.job_title}
                    {petition.soc_code && <span className="text-[#67677e] ml-1">(SOC: {petition.soc_code})</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isApproved && getBeneficiaryName(petition) && (
          <div className="p-3 bg-[#f1f5f9]/30 rounded-lg border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3.5 w-3.5 text-[#67677e]" />
              <span className="text-xs text-[#67677e]">Beneficiary</span>
            </div>
            <div className="font-medium text-sm">{getBeneficiaryName(petition)}</div>
            <div className="text-xs text-[#67677e] mt-1">
              {getBeneficiaryANumber(petition) && <span>A# {getBeneficiaryANumber(petition)} • </span>}
              {getBeneficiaryDOB(petition) && <span>DOB: {formatDateSafe(getBeneficiaryDOB(petition))} • </span>}
              {getBeneficiaryCountry(petition)}
            </div>
          </div>
        )}

        {isApproved && getI94Number(petition) && (
          <div className="p-3 bg-[#f1f5f9]/30 rounded-lg border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-[#67677e]" />
              <span className="text-xs text-[#67677e]">I-94 Information</span>
            </div>
            <div className="font-mono text-sm font-medium">{getI94Number(petition)}</div>
            <div className="text-xs text-[#67677e] mt-1">
              {getI94Class(petition) && <span>Class: {getI94Class(petition)} • </span>}Valid:{" "}
              {formatDateSafe(getI94Start(petition))} → {formatDateSafe(getI94End(petition))}
            </div>
          </div>
        )}

        {linkedLCA ? (
          <div className="p-[12px] bg-[#7c3bed0d] rounded-[10px] ring-1 ring-[#7c3bed33]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Link className="h-3.5 w-3.5 text-[#7c3bed]" />
                <span className="text-xs font-medium text-[#67677e] uppercase tracking-wide">Linked LCA</span>
              </div>
              {onLinkLCA && (
                <button
                  onClick={() => setShowLCADropdown(true)}
                  className="h-6 px-2 text-xs text-[#2563eb] hover:text-[#1e40af] hover:bg-[#dbeafe] rounded"
                >
                  Change
                </button>
              )}
            </div>
            <div className="font-mono text-sm font-medium">{linkedLCA.lca_case_number}</div>
            <div className="text-xs text-[#67677e] mt-1">
              <span className="inline-flex px-2 py-0.5 text-[12px] ring-1 rounded-[10px] mr-2 capitalize bg-white ring-[#e7e7ef] text-[#000] font-semibold">
                {linkedLCA.lca_status}
              </span>
              Valid: {formatDateSafe(linkedLCA.lca_validity_start)} → {formatDateSafe(linkedLCA.lca_validity_start)}
            </div>
            {(linkedLCA.job_title || linkedLCA.soc_code || linkedLCA.soc_title) && (
              <div className="grid grid-cols-3 gap-3 mt-[12px] pt-[12px]" style={{ borderTop: "1px solid #7c3bed1a" }}>
                <div>
                  <span className="text-xs text-[#67677e] block">Job Title</span>
                  <div className="text-sm font-medium">{linkedLCA.job_title || "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-[#67677e] block">SOC Code</span>
                  <div className="text-sm font-medium">{linkedLCA.soc_code || "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-[#67677e] block">SOC Title</span>
                  <div className="text-sm font-medium">{linkedLCA.soc_title || "—"}</div>
                </div>
              </div>
            )}
            {linkedLCA.worksites && linkedLCA.worksites.length > 0 && (
              <div className="mt-[12px] pt-[12px] space-y-2" style={{ borderTop: "1px solid #7c3bed1a" }}>
                <span className="text-xs text-[#67677e] flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Worksites ({linkedLCA.worksites.length})
                </span>
                {linkedLCA.worksites.map((ws, idx) => {
                  return (
                    <div key={idx} className="flex items-start gap-2 text-xs bg-[#ffffff80] p-2 rounded-[10px]">
                      <Building2 className="h-3.5 w-3.5 text-[#67677e] mt-0.5 flex-shrink-0" />

                      <div className="flex-1">
                        <div className="font-medium text-[#111827]">{ws.worksite_name || "Worksite"}</div>

                        <div className="text-[#67677e]">
                          {[ws.address_line1, ws.city, ws.state, ws.zip_code].filter(Boolean).join(", ")}
                        </div>

                        {ws.actual_wage && (
                          <div className="text-[#67677e] mt-1">
                            💰 ${Number(ws.actual_wage).toLocaleString()}/{ws.wage_unit || "year"}
                            {ws.prevailing_wage && (
                              <span className="ml-2">• Prevailing: ${Number(ws.prevailing_wage).toLocaleString()}</span>
                            )}
                            {ws.wage_level && (
                              <span className="ml-2">
                                • {ws.wage_level.replace(/_/g, " ").replace("level", "Level")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {ws.is_primary && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#e2e8f0] text-[#1f2937] rounded-md">
                          Primary
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : showLCADropdown || (!linkedLCA && availableLCAs.length > 0) ? (
          <div className="p-3 bg-[#f1f5f9]/30 rounded-lg border border-dashed border-[#cbd5e1]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link className="h-3.5 w-3.5 text-[#67677e]" />
                <span className="text-sm text-[#67677e]">LCA: Not linked</span>
              </div>
              <SelectPicker
                value="none"
                onChange={(value) => handleLinkLCA(value)}
                disabled={isLinking}
                data={[
                  { value: "none", label: isLinking ? "Linking..." : "Link LCA..." },
                  ...availableLCAs.map((lca) => ({
                    value: lca.id,
                    label: `${lca.lca_case_number} — ${lca.job_title || "N/A"} (${formatDateSafe(lca.lca_validity_start)} → ${formatDateSafe(lca.lca_validity_end)})`,
                  })),
                ]}
                cleanable={false}
                searchable={false}
                className="w-[280px] bigHoverInputr"
                placeholder="Link LCA..."
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#f1f5f9]/30 rounded-lg border border-dashed border-[#cbd5e1]">
            <div className="flex items-center gap-2">
              <Link className="h-3.5 w-3.5 text-[#67677e]" />
              <span className="text-sm text-[#67677e]">LCA: Not linked</span>
              <AlertCircle className="h-3.5 w-3.5 text-[#67677e]" />
              <span className="text-xs text-[#67677e] italic">No certified LCAs available</span>
            </div>
          </div>
        )}

        {isApproved && petition.cap_status && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-3.5 w-3.5 text-[#67677e]" />
            <span className="text-xs text-[#67677e]">Cap Status:</span>
            <span className="text-xs font-medium">{formatCapStatus(petition.cap_status)}</span>
          </div>
        )}

        {isInProgress && currentPetition && currentPetition.id !== petition.id && (
          <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-[#2563eb] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#1e40af]">
              Current petition ({currentPetition.receipt_number}) remains active. Candidate can continue working under
              the approved petition.
            </div>
          </div>
        )}

        {isRFE && (
          <div className="p-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-[#ea580c] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#9a3412]">
              <strong>RFE Received:</strong> USCIS has requested additional evidence. Typical RFE response deadline is
              87 days. Coordinate with immigration attorney.
            </div>
          </div>
        )}

        {isDenied && (
          <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-[#dc2626] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#991b1b]">
              This petition was denied. Review denial notice for options (appeal, motion to reopen, new filing).
            </div>
          </div>
        )}

        {petition.notes && (
          <div className="pt-3 border-t border-[#e2e8f0]">
            <span className="text-xs text-[#67677e] block mb-1">Notes</span>
            <p className="text-sm text-[#475569]">{petition.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
