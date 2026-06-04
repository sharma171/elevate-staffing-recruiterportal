import { useState } from "react";
import { SelectPicker, DatePicker } from "rsuite";
import { Plus, ChevronDown, ChevronRight, CreditCard, Trash2, CalendarDays } from "lucide-react";
import SmartUploadButton from "./SmartUploadButton";

// Types (assuming these are defined elsewhere)
const EAD_CATEGORIES = [
  { value: "c03a", label: "C03A - Pre-completion OPT" },
  { value: "c03b", label: "C03B - Post-completion OPT" },
  { value: "c03c", label: "C03C - STEM OPT" },
  { value: "c08", label: "C08 - Asylum" },
  { value: "c09", label: "C09 - Adjustment of Status" },
];

const EAD_STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "card_produced", label: "Card Produced" },
];

const getEADCategoryLabel = (value) => {
  const category = EAD_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

const getEADStatusLabel = (value) => {
  const status = EAD_STATUSES.find((s) => s.value === value);
  return status?.label || value;
};

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

// Calculate days until expiry
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-[#7c3bed] text-white",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
    destructive: "bg-red-600 text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

// Card Component
const Card = ({ children, className = "" }) => <div className={`border rounded-lg ${className}`}>{children}</div>;

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
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="form-control bigHoverInput w-full h-8 px-3 py-1 text-sm border border-gray-300 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  );
};

// Inline Select Field Component
const SelectField = ({ label, value, onChange, options, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-[#67677e] uppercase tracking-wide">{label}</label>
    <SelectPicker
      data={options}
      value={value}
      onChange={onChange}
      cleanable={false}
      searchable={false}
      className="w-full bigHoverInputr"
      placeholder={`Select ${label}...`}
      labelKey="label"
      valueKey="value"
    />
  </div>
);

// EAD Card Component
function EADCard({
  ead,
  isCurrent,
  isEditing = false,
  onChange,
  onDelete,
  onEADDataExtracted,
  onSaveEAD,
  onRefreshData,
  candidateEmail,
  candidateId,
}) {
  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange({ ...ead, [field]: value });
    }
  };

  const daysUntilExpiry = getDaysUntilExpiry(ead.card_expiry_date);
  const isExpired = ead.status === "expired" || (daysUntilExpiry !== null && daysUntilExpiry < 0);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

  // Edit Mode
  if (isEditing) {
    return (
      <div
        className={`p-3 ring-1 rounded-[10px] ${isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "border-[#f1f1f9] bg-[#ffffff]"}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent && <Badge variant="primary">CURRENT</Badge>}
            {!isCurrent && <Badge variant="outline">PREVIOUS</Badge>}
            <Badge variant="secondary">Edit Mode</Badge>
          </div>

          <div className="flex items-center gap-1">
            {onDelete && (
              <button className="p-1 text-red-600 hover:bg-red-50 rounded-[10px]" onClick={() => onDelete(ead.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Editable Form Fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Card Number"
            value={ead.ead_number}
            onChange={(v) => handleFieldChange("ead_number", v)}
            placeholder="SRC-XX-XXX-XXXXX"
          />
          <SelectField
            label="Category"
            value={ead.ead_category}
            onChange={(v) => handleFieldChange("ead_category", v)}
            options={EAD_CATEGORIES}
          />
          <SelectField
            label="Status"
            value={ead.status}
            onChange={(v) => handleFieldChange("status", v)}
            options={EAD_STATUSES}
          />
          <EditField
            label="A-Number"
            value={ead.a_number}
            onChange={(v) => handleFieldChange("a_number", v)}
            placeholder="A123456789"
          />

          <EditField
            label="Card Holder Name"
            value={ead.card_holder_name}
            onChange={(v) => handleFieldChange("card_holder_name", v)}
            className="col-span-2"
          />
          <EditField
            label="Issue Date"
            value={ead.card_issue_date}
            onChange={(v) => handleFieldChange("card_issue_date", v)}
            type="date"
          />
          <EditField
            label="Expiry Date"
            value={ead.card_expiry_date}
            onChange={(v) => handleFieldChange("card_expiry_date", v)}
            type="date"
          />
        </div>
      </div>
    );
  }

  // View Mode
  const statusVariant =
    ead.status === "active" && !isExpired ? "primary" : ead.status === "pending" ? "secondary" : "destructive";

  return (
    <div
      className={`p-3 ring-1 rounded-[10px] ${isCurrent ? "ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-gray-200 bg-[#fff]"} ${isExpired ? "ring-[#ef444480] bg-[#fff]" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CreditCard className="h-4 w-4 text-[#7c3bed]" />
          <span className="font-medium text-sm">{ead.ead_number}</span>
          {isCurrent && <Badge variant="primary">CURRENT</Badge>}
          <Badge className="capitalize" variant={statusVariant}>
            {isExpired ? "Expired" : getEADStatusLabel(ead.status)}
          </Badge>
          <Badge variant="outline">
            {getEADCategoryLabel(ead.ead_category)} ({String(ead?.visa_type_inferred || "").replaceAll("_", " ")})
          </Badge>
          {isExpiringSoon && !isExpired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              Expires in {daysUntilExpiry} days
            </span>
          )}
        </div>
        {onDelete && (
          <button className="p-1 text-red-600 hover:bg-red-50 rounded-[10px]" onClick={() => onDelete(ead.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#080118]">
        {ead.card_holder_name && (
          <div>
            <p className="text-xs text-[#67677e]">Card Holder</p>
            <p className="font-medium mt-1">{ead.card_holder_name}</p>
          </div>
        )}
        {ead.a_number && (
          <div>
            <p className="text-xs text-[#67677e]">A-Number</p>
            <p className="font-medium mt-1">{ead.a_number}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-[#67677e]">Issue Date</p>
          <p className="font-medium mt-1">{formatDateSafe(ead.card_issue_date)}</p>
        </div>
        <div>
          <p className="text-xs text-[#67677e]">Expiry Date</p>
          <p className={`font-medium mt-1 ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-600" : ""}`}>
            {formatDateSafe(ead.card_expiry_date)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EADSection({
  eadRecords = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddEAD,
  onDeleteEAD,
  onEADDataExtracted,
  onSaveEAD,
  onRefreshData,
  onEADChange,
  historyOnly = false,
}) {
  const [showPreviousEADs, setShowPreviousEADs] = useState(false);

  const currentEAD = eadRecords.find((e) => e.is_current);
  const previousEADs = eadRecords.filter((e) => !e.is_current);

  // HISTORY-ONLY MODE
  if (historyOnly) {
    if (previousEADs.length === 0) return null;

    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowPreviousEADs(!showPreviousEADs)}
          className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-[10px]"
        >
          {showPreviousEADs ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Previous EAD Cards ({previousEADs.length})
        </button>

        {showPreviousEADs && (
          <div className="space-y-2 pt-2">
            {previousEADs.map((ead) => (
              <EADCard
                key={ead.id}
                ead={ead}
                isCurrent={false}
                isEditing={isEditing}
                onChange={onEADChange}
                onDelete={onDeleteEAD}
                candidateEmail={candidateEmail}
                candidateId={candidateId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // FULL MODE
  const hasNoEADs = eadRecords.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <div className="font-semibold text-[16px]">EAD Cards</div>
          {eadRecords.length > 0 && <Badge variant="secondary">{eadRecords.length}</Badge>}
        </div>
        {eadRecords.length > 0 && onAddEAD && (
          <button
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-[10px] hover:bg-gray-50 flex items-center"
            onClick={onAddEAD}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add EAD
          </button>
        )}
      </div>

      {/* Empty State */}
      {hasNoEADs ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No EAD Card Data</p>
          <p className="text-sm mb-4">Upload an EAD card to track work authorization</p>
          <div className="flex flex-col items-center gap-2">
            {candidateEmail && onEADDataExtracted && (
              <SmartUploadButton
                documentType="ead_card"
                label="Smart Upload EAD"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onEADDataExtracted}
                onRawDataExtracted={onSaveEAD}
                onRefreshData={onRefreshData}
                variant="default"
              />
            )}
            {onAddEAD && (
              <button
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-[10px] hover:bg-gray-50 flex items-center"
                onClick={onAddEAD}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Current EAD */}
          {currentEAD && (
            <EADCard
              ead={currentEAD}
              isCurrent={true}
              isEditing={isEditing}
              onChange={onEADChange}
              onDelete={onDeleteEAD}
              onEADDataExtracted={onEADDataExtracted}
              onSaveEAD={onSaveEAD}
              onRefreshData={onRefreshData}
              candidateEmail={candidateEmail}
              candidateId={candidateId}
            />
          )}

          {/* Previous EADs */}
          {previousEADs.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowPreviousEADs(!showPreviousEADs)}
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-[#67677e] fw-medium bg-transparent hover:!bg-[#3c83f6] hover:text-[#fff] rounded-[10px]"
              >
                {showPreviousEADs ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Previous EAD Cards ({previousEADs.length})
              </button>

              {showPreviousEADs && (
                <div className="space-y-2 pt-2">
                  {previousEADs.map((ead) => (
                    <EADCard
                      key={ead.id}
                      ead={ead}
                      isCurrent={false}
                      isEditing={isEditing}
                      onChange={onEADChange}
                      onDelete={onDeleteEAD}
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
