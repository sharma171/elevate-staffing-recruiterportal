import { useState } from "react";
import { SelectPicker, DatePicker } from "rsuite";
import { ChevronDown, ChevronRight, CreditCard, Users, Trash2, CalendarDays } from "lucide-react";

const EAD_STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
];

const getEADStatusLabel = (status) => {
  const found = EAD_STATUSES.find((s) => s.value === status);
  return found ? found.label : status;
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

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
      <input
        type={type}
        value={value?.toString() || ""}
        onChange={(e) => onChange(e.target.value)}
        className="form-control bigHoverInput w-full h-8 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

export default function PreviousH4EADHistorySection({ eadRecords = [], isEditing = false, onDeleteEAD, onEADChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const h4EadRecords = eadRecords.filter((e) => e.ead_category === "C26");

  if (h4EadRecords.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {/* Collapsible Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[#e1e1e14c] hover:!bg-[#ececec4c] rounded-[10px]"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <Users className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-[#080118]">Previous H-4 EAD History</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#67677e] fw-medium">
          <span className="flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" />
            {h4EadRecords.length} EAD{h4EadRecords.length > 1 ? "s" : ""}
          </span>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="pt-2 space-y-3 px-1">
          {h4EadRecords.map((ead) => {
            const daysUntilExpiry = getDaysUntilExpiry(ead.card_expiry_date);
            const isExpired = ead.status === "expired" || (daysUntilExpiry !== null && daysUntilExpiry < 0);
            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

            if (isEditing) {
              return (
                <div key={ead.id} className="p-3 border border-gray-200 bg-gray-50/30 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium border border-gray-300 rounded-full text-gray-600 bg-white">
                        PREVIOUS
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                        Edit Mode
                      </span>
                    </div>
                    {onDeleteEAD && (
                      <button
                        onClick={() => onDeleteEAD(ead.id)}
                        className="h-7 w-7 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <EditField
                      label="Card Number"
                      value={ead.ead_number}
                      onChange={(v) => onEADChange?.({ ...ead, ead_number: v })}
                      placeholder="SRC-XX-XXX-XXXXX"
                    />
                    <EditField
                      label="Category"
                      value={ead.ead_category || "C26"}
                      onChange={(v) => onEADChange?.({ ...ead, ead_category: v })}
                      placeholder="C26"
                    />
                    <SelectField
                      label="Status"
                      value={ead.status}
                      onChange={(v) => onEADChange?.({ ...ead, status: v })}
                      options={EAD_STATUSES}
                    />
                    <EditField
                      label="A-Number"
                      value={ead.a_number}
                      onChange={(v) => onEADChange?.({ ...ead, a_number: v })}
                      placeholder="A123456789"
                    />
                    <div className="col-span-2">
                      <EditField
                        label="Card Holder Name"
                        value={ead.card_holder_name}
                        onChange={(v) => onEADChange?.({ ...ead, card_holder_name: v })}
                      />
                    </div>
                    <EditField
                      label="Valid From"
                      value={ead.card_valid_from || ead.card_issue_date}
                      onChange={(v) => onEADChange?.({ ...ead, card_valid_from: v })}
                      type="date"
                    />
                    <EditField
                      label="Expiry Date"
                      value={ead.card_expiry_date}
                      onChange={(v) => onEADChange?.({ ...ead, card_expiry_date: v })}
                      type="date"
                    />
                  </div>
                </div>
              );
            }

            const getStatusBadgeStyles = () => {
              if (isExpired) return "bg-red-100 text-red-800 border-red-200";
              if (ead.status === "active") return "bg-blue-100 text-blue-800 border-blue-200";
              if (ead.status === "pending") return "bg-gray-100 text-gray-800 border-gray-200";
              return "bg-gray-100 text-gray-800 border-gray-200";
            };

            return (
              <div
                key={ead.id}
                className={`p-3 ring-1 rounded-[10px] ${isExpired ? "ring-red-200 bg-red-50/10" : "ring-gray-200"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm text-[#080118]">{ead.ead_number || "H-4 EAD Card"}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeStyles()}`}>
                      {isExpired ? "Expired" : getEADStatusLabel(ead.status)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium border border-gray-300 rounded-full text-gray-600 bg-white">
                      {ead.ead_category || "C26"}
                    </span>
                    {isExpiringSoon && !isExpired && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                        Expires in {daysUntilExpiry} days
                      </span>
                    )}
                  </div>
                  {onDeleteEAD && (
                    <button
                      onClick={() => onDeleteEAD(ead.id)}
                      className="h-7 w-7 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {ead.card_holder_name && (
                    <div>
                      <p className="text-xs text-[#67677e]">Card Holder</p>
                      <p className="my-1 font-medium text-[#080118]">{ead.card_holder_name}</p>
                    </div>
                  )}
                  {ead.a_number && (
                    <div>
                      <p className="text-xs text-[#67677e]">A-Number</p>
                      <p className="my-1 font-medium text-[#080118]">{ead.a_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#67677e]">Valid From</p>
                    <p className="my-1 font-medium text-[#080118]">
                      {formatDateSafe(ead.card_valid_from || ead.card_issue_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#67677e]">Expiry Date</p>
                    <p
                      className={`font-medium my-1 ${
                        isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-600" : "text-[#080118]"
                      }`}
                    >
                      {formatDateSafe(ead.card_expiry_date)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
