import React, { useState, useRef } from "react";
import { FileText, Clock, Upload, FileEdit, Loader2, Sparkles, AlertTriangle, RotateCcw } from "lucide-react";
import { Modal } from "rsuite";
import SmartUploadButton from "./SmartUploadButton";

export default function AddPetitionOptionsModal({
  open,
  onOpenChange,
  onClose,
  candidateEmail,
  candidateId,
  lcaHistory = [],
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  onManualPendingSubmit,
  onUploadComplete,
}) {
  const [uploadMode, setUploadMode] = useState("approval");
  const [pendingEntryMode, setPendingEntryMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    receiptNumber: "",
    petitionType: "amendment",
    employer: "",
    filedDate: "",
    noticeDate: "",
    lcaId: "",
    premiumProcessing: false,
    notes: "",
  });
  const [attachedFile, setAttachedFile] = useState(null);

  const resetState = () => {
    setUploadMode("approval");
    setPendingEntryMode(null);
    setFormData({
      receiptNumber: "",
      petitionType: "amendment",
      employer: "",
      filedDate: "",
      noticeDate: "",
      lcaId: "",
      premiumProcessing: false,
      notes: "",
    });
    setAttachedFile(null);
  };

  const handleClose = () => {
    resetState();
    if (typeof onOpenChange === "function") {
      onOpenChange(false);
    } else if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleManualSubmit = async () => {
    if (!formData.receiptNumber || !formData.petitionType || !formData.employer || !formData.filedDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onManualPendingSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Failed to submit manual petition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmartUploadData = (data) => {
    if (onI797DataExtracted) {
      onI797DataExtracted(data);
    }
    handleClose();
    onUploadComplete?.();
  };

  const isFormValid = formData.receiptNumber && formData.petitionType && formData.employer && formData.filedDate;

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <Modal.Header>
        <Modal.Title>Upload I-797</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {pendingEntryMode === null && (
            <div className="space-y-2">
              <SmartUploadButton
                documentType="h1b_approval"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={(data) => {
                  if (onI797DataExtracted) onI797DataExtracted(data);
                  handleClose();
                }}
                onRawDataExtracted={onSaveI797}
                onRefreshData={onRefreshData}
                className="w-full block"
              >
                <button
                  type="button"
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    uploadMode === "approval" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Upload Approval Notice (I-797A)</div>
                      <div className="text-sm text-gray-500 mt-0.5">Standard flow — parse approval, set as current</div>
                    </div>
                  </div>
                </button>
              </SmartUploadButton>

              <SmartUploadButton
                documentType="h1b_approval"
                label="Smart Upload I-797"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={(data) => {
                  if (onI797DataExtracted) onI797DataExtracted(data);
                  handleClose();
                }}
                onRawDataExtracted={onSaveI797}
                onRefreshData={onRefreshData}
                variant="primary"
                className="w-full"
              />

              <button
                type="button"
                onClick={() => setUploadMode("pending")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  uploadMode === "pending" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Add Pending Petition (Receipt Notice)</div>
                    <div className="text-sm text-gray-500 mt-0.5">For amendments/transfers/extensions in progress</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {uploadMode === "pending" && pendingEntryMode === null && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-500">How do you want to add?</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPendingEntryMode("smart")}
                  className="p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <Upload className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <div className="font-medium text-sm">Smart Upload</div>
                  <div className="text-xs text-gray-500 mt-1">Upload I-797C PDF and auto-extract</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingEntryMode("manual")}
                  className="p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <FileEdit className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <div className="font-medium text-sm">Manual Entry</div>
                  <div className="text-xs text-gray-500 mt-1">Type receipt number and details manually</div>
                </button>
              </div>
            </div>
          )}

          {pendingEntryMode === "smart" && candidateEmail && (onI797DataExtracted || onSaveI797) && (
            <div className="space-y-4">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => setPendingEntryMode(null)}
              >
                ← Back
              </button>
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-3">Upload I-797C (Receipt Notice) PDF to auto-extract details</p>
                <SmartUploadButton
                  documentType="h1b_approval"
                  label="Select File to Upload"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={(data) => {
                    if (onI797DataExtracted) onI797DataExtracted(data);
                    handleClose();
                  }}
                  onRawDataExtracted={onSaveI797}
                  onRefreshData={onRefreshData}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 mx-auto"
                />
              </div>
            </div>
          )}

          {pendingEntryMode === "manual" && (
            <div className="space-y-4">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => setPendingEntryMode(null)}
              >
                ← Back
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Receipt Number *</label>
                  <input
                    type="text"
                    placeholder="IOE..."
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Petition Type *</label>
                  <select
                    value={formData.petitionType}
                    onChange={(e) => setFormData({ ...formData, petitionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="initial">Initial</option>
                    <option value="transfer">Transfer</option>
                    <option value="extension">Extension</option>
                    <option value="amendment">Amendment</option>
                    <option value="concurrent">Concurrent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Employer *</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={formData.employer}
                  onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Filed Date *</label>
                  <input
                    type="date"
                    value={formData.filedDate}
                    onChange={(e) => setFormData({ ...formData, filedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notice Date</label>
                  <input
                    type="date"
                    value={formData.noticeDate}
                    onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Link to LCA</label>
                <select
                  value={formData.lcaId || "none"}
                  onChange={(e) => setFormData({ ...formData, lcaId: e.target.value === "none" ? "" : e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">None</option>
                  {lcaHistory.map((lca) => (
                    <option key={lca.id} value={lca.id}>
                      {lca.case_number} ({lca.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premiumProcessing"
                  checked={formData.premiumProcessing}
                  onChange={(e) => setFormData({ ...formData, premiumProcessing: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="premiumProcessing" className="text-sm cursor-pointer">
                  Premium Processing
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload Document (optional)</label>
                <div className="text-xs text-gray-500 mb-2">Just stores the file, no parsing</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileAttach}
                  className="hidden"
                />
                {attachedFile ? (
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span className="text-sm truncate">{attachedFile.name}</span>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-700"
                      onClick={() => setAttachedFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-md flex items-center gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Attach File
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleManualSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save as Pending
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
