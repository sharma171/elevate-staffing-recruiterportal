// Manual petition entry modal (Plain JSX)
// Replaces shadcn Dialog, Select, Switch, Input, Label, Textarea with HTML equivalents
import React, { useState } from "react";
import { PETITION_TYPES, PETITION_STATUSES } from "../constants";

export function AddPetitionModal({ open, onOpenChange, lcaHistory, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receipt_number: "",
    petition_type: "extension",
    status: "pending",
    employer_name: "",
    filed_date: "",
    notice_date: "",
    approval_date: "",
    validity_start: "",
    validity_end: "",
    premium_processing: false,
    lca_id: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.receipt_number.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        receipt_number: "",
        petition_type: "extension",
        status: "pending",
        employer_name: "",
        filed_date: "",
        notice_date: "",
        approval_date: "",
        validity_start: "",
        validity_end: "",
        premium_processing: false,
        lca_id: "",
        notes: "",
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = formData.status === "approved";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Add Petition Manually</h2>
          <p className="text-sm text-gray-500 mb-4">Enter petition details when you only have the receipt number.</p>

          <div className="space-y-4">
            {/* Receipt Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Receipt Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm font-mono"
                placeholder="IOE1234567890"
                value={formData.receipt_number}
                onChange={(e) => handleChange("receipt_number", e.target.value)}
              />
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Petition Type</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.petition_type}
                  onChange={(e) => handleChange("petition_type", e.target.value)}
                >
                  {PETITION_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  {PETITION_STATUSES.map((ps) => (
                    <option key={ps.value} value={ps.value}>
                      {ps.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employer */}
            <div>
              <label className="block text-sm font-medium mb-1">Employer Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Company Name"
                value={formData.employer_name}
                onChange={(e) => handleChange("employer_name", e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Filed Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.filed_date}
                  onChange={(e) => handleChange("filed_date", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notice Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.notice_date}
                  onChange={(e) => handleChange("notice_date", e.target.value)}
                />
              </div>
            </div>

            {/* Premium Processing */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="premium_processing"
                checked={formData.premium_processing}
                onChange={(e) => handleChange("premium_processing", e.target.checked)}
              />
              <label htmlFor="premium_processing" className="text-sm cursor-pointer">
                Premium Processing
              </label>
            </div>

            {/* Approval fields */}
            {isApproved && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                <div className="text-sm font-medium text-green-800">Approval Details</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Approval Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.approval_date}
                      onChange={(e) => handleChange("approval_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid From</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.validity_start}
                      onChange={(e) => handleChange("validity_start", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid To</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.validity_end}
                      onChange={(e) => handleChange("validity_end", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Link to LCA */}
            <div>
              <label className="block text-sm font-medium mb-1">Link to LCA</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.lca_id || ""}
                onChange={(e) => handleChange("lca_id", e.target.value)}
              >
                <option value="">None</option>
                {lcaHistory.map((lca) => (
                  <option key={lca.id} value={lca.id}>
                    {lca.case_number} ({lca.status}) {lca.job_title ? `- ${lca.job_title}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!formData.receipt_number.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Petition"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
