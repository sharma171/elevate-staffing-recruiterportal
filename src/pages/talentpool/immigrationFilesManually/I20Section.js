import { useState } from "react";
import { SelectPicker, DatePicker } from "rsuite";
import { Plus, ChevronDown, ChevronRight, FileText, GraduationCap, Trash2, School, CalendarDays } from "lucide-react";
import SmartUploadButton from "./SmartUploadButton";

// Types
const DEGREE_LEVELS = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
  { value: "associate", label: "Associate" },
  { value: "certificate", label: "Certificate" },
];

const I20_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "transfer", label: "Transfer" },
  { value: "change_of_level", label: "Change of Level" },
  { value: "opt", label: "OPT" },
  { value: "stem_opt", label: "STEM OPT" },
  { value: "replacement", label: "Replacement" },
];

const getDegreeLevelLabel = (value) => {
  const degree = DEGREE_LEVELS.find((d) => d.value === value);
  return degree?.label || value;
};

const getI20TypeLabel = (value) => {
  const type = I20_TYPES.find((t) => t.value === value);
  return type?.label || String(value).replaceAll("_", " ");
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

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    primary: "bg-[#7c3bed] text-white",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
    success: "ring-1 m-[1px] ring-[#22c55e] text-[#15803d]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

// I-20 Card Component
function I20Card({
  i20,
  isCurrent,
  isEditing = false,
  onChange,
  onDelete,
  onI20DataExtracted,
  onSaveI20,
  onRefreshData,
  candidateEmail,
  candidateId,
}) {
  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange({ ...i20, [field]: value });
    }
  };

  // Edit Mode
  if (isEditing) {
    return (
      <div
        className={`p-3 rounded-[10px] ${isCurrent ? "ring-1 ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-1 ring-gray-200"}`}
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
              <button className="p-1 text-red-600 hover:bg-red-50 rounded-[10px]" onClick={() => onDelete(i20.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Editable Form Fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="SEVIS Number"
            value={i20.sevis_number}
            onChange={(v) => handleFieldChange("sevis_number", v)}
            placeholder="N0012345678"
          />
          <EditField
            label="Student Name"
            value={i20.student_name}
            onChange={(v) => handleFieldChange("student_name", v)}
          />
          <div className="col-span-2">
            <EditField
              label="School Name"
              value={i20.school_name}
              onChange={(v) => handleFieldChange("school_name", v)}
            />
          </div>

          <SelectField
            label="Degree Level"
            value={i20.degree_level}
            onChange={(v) => handleFieldChange("degree_level", v)}
            options={DEGREE_LEVELS}
          />
          <EditField
            label="Program/Major"
            value={i20.program}
            onChange={(v) => handleFieldChange("program", v)}
            className="col-span-2"
          />
          <EditField label="CIP Code" value={i20.cip_code} onChange={(v) => handleFieldChange("cip_code", v)} />
          <SelectField
            label="I-20 Type"
            value={i20.i20_type}
            onChange={(v) => handleFieldChange("i20_type", v)}
            options={I20_TYPES}
          />

          <EditField
            label="Program Start"
            value={i20.program_start_date}
            onChange={(v) => handleFieldChange("program_start_date", v)}
            type="date"
          />
          <EditField
            label="Program End"
            value={i20.program_end_date}
            onChange={(v) => handleFieldChange("program_end_date", v)}
            type="date"
          />

          <EditField
            label="OPT Start"
            value={i20.opt_start_date}
            onChange={(v) => handleFieldChange("opt_start_date", v)}
            type="date"
          />
          <EditField
            label="OPT End"
            value={i20.opt_end_date}
            onChange={(v) => handleFieldChange("opt_end_date", v)}
            type="date"
          />
        </div>

        {/* DSO Info */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <School className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">DSO Contact</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <EditField label="DSO Name" value={i20.dso_name} onChange={(v) => handleFieldChange("dso_name", v)} />
            <EditField
              label="DSO Email"
              value={i20.dso_email}
              onChange={(v) => handleFieldChange("dso_email", v)}
              type="email"
            />
            <EditField
              label="DSO Phone"
              value={i20.dso_phone}
              onChange={(v) => handleFieldChange("dso_phone", v)}
              type="tel"
            />
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div
      className={`p-3 rounded-[10px] ${isCurrent ? "ring-1 ring-[#7c3bed80] bg-[#7c3bed0d]" : "ring-1 ring-gray-200"}`}
    >
      <div className="flex items-start justify-between mb-[12px]">
        <div className="flex items-center gap-2 flex-wrap">
          <GraduationCap className="h-4 w-4 text-[#7c3bed]" />
          <span className="font-semibold text-sm">{i20.sevis_number}</span>
          {isCurrent && <Badge variant="primary">CURRENT</Badge>}
          {i20.stem_eligible && <Badge variant="success">STEM Eligible</Badge>}
          {i20.stem_opt_recommended && <Badge variant="success">STEM OPT</Badge>}
        </div>
        {onDelete && (
          <button className="p-1 text-red-600 hover:bg-red-50 rounded-[10px]" onClick={() => onDelete(i20.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#67677e] my-0">School</p>
          <p className="font-medium text-[#080118] mt-0">{i20.school_name}</p>
        </div>
        <div>
          <p className="text-xs text-[#67677e] my-0">Program</p>
          <p className="font-medium text-[#080118] mt-0">{i20.program}</p>
        </div>
        <div>
          <p className="text-xs text-[#67677e] my-0">Degree</p>
          <p className="font-medium text-[#080118] mt-0">{getDegreeLevelLabel(i20.degree_level)}</p>
        </div>
        <div>
          <p className="text-xs text-[#67677e] my-0">I-20 Type</p>
          <p className="font-medium text-[#080118] mt-0 capitalize">{getI20TypeLabel(i20.i20_type)}</p>
        </div>
        <div>
          <p className="text-xs text-[#67677e] my-0">Program Dates</p>
          <p className="font-medium text-[#080118] mt-0">
            {formatDateSafe(i20.program_start_date)} → {formatDateSafe(i20.program_end_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#67677e] my-0">OPT Dates</p>
          <p className="font-medium text-[#080118] mt-0">
            {formatDateSafe(i20.opt_start_date)} → {formatDateSafe(i20.opt_end_date)}
          </p>
        </div>
        {i20.dso_name && (
          <div>
            <p className="text-xs text-[#67677e] my-0">DSO Contact</p>
            <p className="font-medium text-[#080118] mt-0">
              {i20.dso_name} {i20.dso_email && `— ${i20.dso_email}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function I20Section({
  i20History = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddI20,
  onDeleteI20,
  onI20DataExtracted,
  onSaveI20,
  onRefreshData,
  onI20Change,
  historyOnly = false,
}) {
  const [showPreviousI20s, setShowPreviousI20s] = useState(false);

  const currentI20 = i20History.find((i) => i.is_current);
  const previousI20s = i20History.filter((i) => !i.is_current);

  // HISTORY-ONLY MODE
  if (historyOnly) {
    if (previousI20s.length === 0) return null;

    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowPreviousI20s(!showPreviousI20s)}
          className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-600 fw-medium bg-transparent hover:!bg-[#3c83f6] hover:!text-[#fff] rounded-[10px]"
        >
          {showPreviousI20s ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          Previous I-20 ({previousI20s.length})
        </button>

        {showPreviousI20s && (
          <div className="space-y-2 pt-2">
            {previousI20s.map((i20) => (
              <I20Card
                key={i20.id}
                i20={i20}
                isCurrent={false}
                isEditing={isEditing}
                onChange={onI20Change}
                onDelete={onDeleteI20}
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
  const hasNoI20s = i20History.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <div className="font-semibold text-[17px]">I-20 History</div>
          {i20History.length > 0 && <Badge variant="secondary">{i20History.length}</Badge>}
        </div>
        {i20History.length > 0 && onAddI20 && (
          <button
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-[10px] hover:bg-gray-50 flex items-center"
            onClick={onAddI20}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add I-20
          </button>
        )}
      </div>

      {/* Empty State */}
      {hasNoI20s ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No I-20 Data</p>
          <p className="text-sm mb-4">Upload an I-20 to track program and OPT information</p>
          <div className="flex flex-col items-center gap-2">
            {candidateEmail && onI20DataExtracted && (
              <SmartUploadButton
                documentType="i20"
                label="Smart Upload I-20"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onI20DataExtracted}
                onRawDataExtracted={onSaveI20}
                onRefreshData={onRefreshData}
                variant="default"
              />
            )}
            {onAddI20 && (
              <button
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-[10px] hover:bg-gray-50 flex items-center"
                onClick={onAddI20}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Current I-20 */}
          {currentI20 && (
            <I20Card
              i20={currentI20}
              isCurrent={true}
              isEditing={isEditing}
              onChange={onI20Change}
              onDelete={onDeleteI20}
              onI20DataExtracted={onI20DataExtracted}
              onSaveI20={onSaveI20}
              onRefreshData={onRefreshData}
              candidateEmail={candidateEmail}
              candidateId={candidateId}
            />
          )}

          {/* Previous I-20s */}
          {previousI20s.length > 0 && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => setShowPreviousI20s(!showPreviousI20s)}
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-600 fw-medium bg-transparent hover:!bg-[#3c83f6] hover:!text-[#fff] rounded-[10px]"
              >
                {showPreviousI20s ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Previous I-20s ({previousI20s.length})
              </button>

              {showPreviousI20s && (
                <div className="space-y-2 pb-2">
                  {previousI20s.map((i20) => (
                    <I20Card
                      key={i20.id}
                      i20={i20}
                      isCurrent={false}
                      isEditing={isEditing}
                      onChange={onI20Change}
                      onDelete={onDeleteI20}
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
