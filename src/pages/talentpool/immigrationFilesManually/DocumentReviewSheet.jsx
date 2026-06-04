import React, { useState, useMemo } from "react";
import { SECTION_MAPPING } from "./types";
import { I20_FIELD_SECTIONS, EAD_FIELD_SECTIONS, GC_CARD_FIELD_SECTIONS, FIELD_LABELS } from "./constants";

const getFieldSections = (documentType) => {
  if (documentType === "i20") return I20_FIELD_SECTIONS;
  if (documentType === "ead_card" || documentType === "ead") return EAD_FIELD_SECTIONS;
  if (documentType === "gc_card" || documentType === "green_card") return GC_CARD_FIELD_SECTIONS;
  return null;
};

const shouldShowSection = (section, data) => {
  if (section.fields) return true;
  if (section.conditionalFields) return section.conditionalFields.some((f) => data[f]?.value && data[f].value !== "" && data[f].value !== "null");
  return false;
};

const formatBooleanValue = (value) => {
  const lv = value?.toLowerCase();
  if (lv === "true" || lv === "yes") return { display: "Yes", isBoolean: true };
  if (lv === "false" || lv === "no") return { display: "No", isBoolean: true };
  return { display: value, isBoolean: false };
};

export default function DocumentReviewSheet({ open, onOpenChange, parsedData, onSave, saving = false }) {
  const [editedData, setEditedData] = useState(parsedData.extracted_data);

  const getConfidenceLevel = (c) => (c >= 0.7 ? "high" : c >= 0.5 ? "medium" : "low");

  const getConfidenceBadge = (confidence) => {
    const level = getConfidenceLevel(confidence);
    const pct = Math.round(confidence * 100);
    const colors = { high: "border-green-400 bg-green-50 text-green-700", medium: "border-yellow-400 bg-yellow-50 text-yellow-700", low: "border-red-400 bg-red-50 text-red-700" };
    const icons = { high: "✅", medium: "⚠️", low: "⚠️" };
    return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${colors[level]}`}>{icons[level]} {pct}%</span>;
  };

  const formatFieldName = (fieldName) => (FIELD_LABELS && FIELD_LABELS[fieldName]) ? FIELD_LABELS[fieldName] : fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const handleFieldChange = (fieldName, newValue) => {
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], value: newValue, edited: true } }));
  };

  const handleResetField = (fieldName) => {
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...parsedData.extracted_data[fieldName], edited: false } }));
  };

  const targetSection = SECTION_MAPPING[parsedData.document_type] || "documents";
  const fieldEntries = Object.entries(editedData);
  const highConfidenceCount = fieldEntries.filter(([, f]) => f.confidence >= 0.7).length;
  const needsReviewCount = parsedData.review_fields.length;
  const editedCount = fieldEntries.filter(([, f]) => f.edited).length;
  const fieldSections = getFieldSections(parsedData.document_type);

  const organizedFields = useMemo(() => {
    if (!fieldSections) return [{ title: "Extracted Data", fields: Object.keys(editedData) }];
    const sections = [];
    const usedFields = new Set();
    Object.values(fieldSections).forEach((section) => {
      const sectionFields = section.fields || section.conditionalFields || [];
      const available = sectionFields.filter((f) => editedData[f] !== undefined);
      if (available.length > 0 && shouldShowSection(section, editedData)) {
        sections.push({ title: section.title, fields: available });
        available.forEach((f) => usedFields.add(f));
      }
    });
    const remaining = Object.keys(editedData).filter((f) => !usedFields.has(f));
    if (remaining.length > 0) sections.push({ title: "Other Information", fields: remaining });
    return sections;
  }, [editedData, fieldSections]);

  const renderField = (fieldName) => {
    const fieldData = editedData[fieldName];
    if (!fieldData) return null;
    const confidence = fieldData.confidence;
    const level = getConfidenceLevel(confidence);
    const needsReview = parsedData.review_fields.includes(fieldName);
    const { display: formattedValue, isBoolean } = formatBooleanValue(fieldData.value);

    const borderColors = { high: "border-green-300 bg-green-50", medium: "border-yellow-300 bg-yellow-50", low: "border-red-300 bg-red-50" };

    return (
      <div key={fieldName} className={`rounded-lg border p-4 transition-all ${borderColors[level]} ${needsReview ? "ring-2 ring-yellow-400 ring-offset-1" : ""} ${fieldData.edited ? "border-indigo-400 bg-indigo-50" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium flex items-center gap-2">
            {formatFieldName(fieldName)}
            {needsReview && <span className="text-[10px] bg-yellow-200 text-yellow-700 px-1.5 py-0.5 rounded">VERIFY</span>}
            {fieldData.edited && <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">EDITED</span>}
          </label>
          {getConfidenceBadge(confidence)}
        </div>
        <div className="flex gap-2 items-center">
          {isBoolean ? (
            <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-white">
              <span>{formattedValue === "Yes" ? "✅" : "❌"}</span>
              <span className={`text-sm ${formattedValue === "Yes" ? "text-green-700" : "text-gray-500"}`}>{formattedValue}</span>
            </div>
          ) : (
            <input value={fieldData.value} onChange={(e) => handleFieldChange(fieldName, e.target.value)} className="flex-1 h-9 text-sm border rounded-md px-3 bg-white" placeholder="Enter value..." />
          )}
          {fieldData.edited && (
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" onClick={() => handleResetField(fieldName)} title="Reset to AI value">🔄</button>
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white w-[500px] sm:w-[540px] h-full flex flex-col shadow-lg">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-50 via-indigo-25 to-transparent p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><span>✨</span></div>
            <div>
              <h3 className="text-lg font-semibold">AI Document Review</h3>
              <p className="text-xs text-gray-500">Review extracted data before saving</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs">📄 {parsedData.document_type.replace(/_/g, " ").toUpperCase()}</span>
            <span className="text-gray-400">→</span>
            <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">🛡️ {targetSection.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b text-sm">
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-gray-500">{highConfidenceCount} verified</span></div>
          {needsReviewCount > 0 && <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-yellow-500" /><span className="text-gray-500">{needsReviewCount} to review</span></div>}
          {editedCount > 0 && <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-gray-500">{editedCount} edited</span></div>}
          {parsedData.processing_time_ms && <div className="ml-auto text-xs text-gray-400">{(parsedData.processing_time_ms / 1000).toFixed(1)}s</div>}
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-4 space-y-6">
            {organizedFields.map((section) => (
              <div key={section.title}>
                {organizedFields.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-gray-500">{section.title}</h4>
                    <hr className="flex-1" />
                  </div>
                )}
                <div className="space-y-3">{section.fields.map((f) => renderField(f))}</div>
              </div>
            ))}
          </div>
        </div>

        <hr />

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50">
          <div className="flex w-full gap-3">
            <button onClick={() => onOpenChange(false)} disabled={saving} className="flex-1 px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button onClick={() => onSave(editedData)} disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? "⏳ Saving..." : "✅ Save to Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
