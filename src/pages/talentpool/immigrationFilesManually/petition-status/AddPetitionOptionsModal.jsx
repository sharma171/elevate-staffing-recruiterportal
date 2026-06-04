// Two-tab modal for adding petitions (Plain JSX)
import React, { useState, useRef } from "react";
import { PETITION_TYPES } from "../constants";
import SmartUploadButton from "../SmartUploadButton";
import { Clock, FileEdit, FileText, Upload } from "lucide-react";
import { useAuth } from "../../../../authContext";
import axios from "axios";

const BASE_URL = "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app";

export function AddPetitionOptionsModal({
  open,
  onOpenChange,
  lcaHistory,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  onManualPendingSubmit,
  onUploadComplete,
  candidateDetails,
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

  const { organisation, user } = useAuth();
  const orgData = organisation?.org_data?.[0] || {};

  const candidateEmail = candidateDetails?.original_email;
  const candidateId = candidateDetails?.id;
  const adminEmail = user?.email;

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
    onOpenChange(false);
  };

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  const handleSmartUploadData = (data) => {
    console.log(data, "data data ========");

    let payload = {
      emailid: adminEmail,
      task: "parse-immigration-document",
      employee_email: candidateEmail,
      file_base64: "",
      file_type: "pdf",
      doc_type: "h1b_approval",
      candidate_id: candidateId,
      organization: orgData?.preferred_org_name,
    };

    payload = {
      emailid: "marketing@4spheresolutions.com",
      task: "parse-immigration-document",
      employee_email: "muni.k0892@gmail.com",

      doc_type: "h1b_approval",
      candidate_id: 1,
      organization: "4sphere_software_solutions_llc",
    };

    axios
      .post(BASE_URL, payload)
      .then((res) => {
        handleClose();
        onUploadComplete?.();
        onI797DataExtracted(data);
      })
      .catch((err) => {
        console.log(err, "err");
      });

    // if (onI797DataExtracted) {
    //   onI797DataExtracted(data);
    // }
    // // Close modal - the review panel will show
    // handleClose();
    // onUploadComplete?.();
  };

  function convertFileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const handleManualSubmit = async () => {
    if (!formData.receiptNumber || !formData.petitionType || !formData.employer || !formData.filedDate) return;
    setIsSubmitting(true);
    const base64Data = await convertFileToBase64(attachedFile);

    let payload = {
      employee_email: candidateEmail,
      file_base64: base64Data,
      file_type: "pdf",
      doc_type: "h1b_approval",
      candidate_id: candidateId,
      organization: orgData?.preferred_org_name,
      ...formData,
      file: attachedFile || undefined,
    };

    payload = {
      task: "save-h1b-approval",
      emailid: "marketing@4spheresolutions.com",
      employee_email: "muni.k0892@gmail.com",
      file_base64: base64Data,

      extracted_data: {
        immigration_data: {
          visa_type: "H1B",
          notice_type: "receipt",
          approval_date: null,
          receipt_number: formData.receiptNumber,
          validity_start: null,
          validity_end: null,
          classification: "H-1B",
        },
        h1b_data: {
          petition: {},
        },
        i94_data: {},
      },
      update_i94: false,
    };

    axios
      .post(BASE_URL, payload)
      .then((res) => {
        handleClose();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const isFormValid = formData.receiptNumber && formData.petitionType && formData.employer && formData.filedDate;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload I-797</h2>

          <div className="space-y-4">
            {/* Mode Selection */}
            {pendingEntryMode === null && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("approval")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${uploadMode === "approval" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Upload Approval Notice (I-797A)</div>
                      <div className="text-sm text-gray-500 mt-0.5">Standard flow — parse approval, set as current</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("pending")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${uploadMode === "pending" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Add Pending Petition (Receipt Notice)</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        For amendments/transfers/extensions in progress
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Approval Mode - Smart Upload Button */}
            {uploadMode === "approval" && pendingEntryMode === null && candidateEmail && onI797DataExtracted && (
              <SmartUploadButton
                documentType="h1b_approval"
                label="Upload I-797A Approval Notice"
                candidateDetails={candidateDetails}
                onDataExtracted={handleSmartUploadData}
                onRawDataExtracted={onSaveI797}
                onRefreshData={onRefreshData}
                variant="default"
                className="w-full"
              />
            )}

            {/* Pending Mode - entry options */}
            {uploadMode === "pending" && pendingEntryMode === null && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-500">How do you want to add?</div>
                <div className="grid grid-cols-2 gap-3">
                  <SmartUploadButton
                    documentType="h1b_approval"
                    label="Upload I-797A Approval Notice"
                    candidateDetails={candidateDetails}
                    onDataExtracted={handleSmartUploadData}
                    onRawDataExtracted={onSaveI797}
                    onRefreshData={onRefreshData}
                    variant="default"
                    className="w-full"
                    customButton={(callback) => {
                      return (
                        <button
                          type="button"
                          onClick={callback}
                          className="p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors text-center"
                        >
                          <Upload className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                          <div className="font-medium text-sm">Smart Upload</div>
                          <div className="text-xs text-gray-500 mt-1">Upload I-797C PDF and auto-extract</div>
                        </button>
                      );
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setPendingEntryMode("manual")}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors text-center"
                  >
                    <FileEdit className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                    <div className="font-medium text-sm">Manual Entry</div>
                    <div className="text-xs text-gray-500 mt-1">Type receipt number and details manually</div>
                  </button>
                </div>
              </div>
            )}

            {/* Smart Upload for Pending */}
            {pendingEntryMode === "smart" && candidateEmail && onI797DataExtracted && (
              <SmartUploadButton
                documentType="h1b_approval"
                label="Select File to Upload"
                candidateDetails={candidateDetails}
                onDataExtracted={handleSmartUploadData}
                onRawDataExtracted={onSaveI797}
                onRefreshData={onRefreshData}
                variant="default"
                defaultOpen
              />
            )}

            {/* Manual Entry Form */}
            {pendingEntryMode === "manual" && (
              <div className="space-y-4">
                <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setPendingEntryMode(null)}>
                  ← Back
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Receipt Number *</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="IOE..."
                      value={formData.receiptNumber}
                      onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Petition Type *</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.petitionType}
                      onChange={(e) => setFormData({ ...formData, petitionType: e.target.value })}
                    >
                      {PETITION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Employer *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Company name"
                    value={formData.employer}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Filed Date *</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.filedDate}
                      onChange={(e) => setFormData({ ...formData, filedDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notice Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={formData.noticeDate}
                      onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link to LCA</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.lcaId || ""}
                    onChange={(e) => setFormData({ ...formData, lcaId: e.target.value })}
                  >
                    <option value="">None</option>
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
                  />
                  <label htmlFor="premiumProcessing" className="text-sm cursor-pointer">
                    Premium Processing
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* File attachment */}
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Document (optional)</label>
                  <p className="text-xs text-gray-500 mb-2">Just stores the file, no parsing</p>
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
                        className="text-sm text-gray-500 hover:text-gray-700"
                        onClick={() => setAttachedFile(null)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Attach File
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-4 py-2 text-sm border rounded hover:bg-gray-50" onClick={handleClose}>
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    onClick={handleManualSubmit}
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save as Pending"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
