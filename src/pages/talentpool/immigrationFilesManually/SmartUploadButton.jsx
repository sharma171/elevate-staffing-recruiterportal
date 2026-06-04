import React, { useState, useRef } from "react";
import DocumentReviewSheet from "./DocumentReviewSheet";
import { PARSEABLE_DOCUMENT_TYPES } from "./constants";
import { useAuth } from "../../../authContext";
import axios from "axios";
import { toast } from "react-toastify";

// Replace with your API service
// import { parseDocument } from "../apiService";

const BASE_URL = "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/parse-document";

export default function SmartUploadButton({
  documentType,
  label,
  onDataExtracted,
  onRawDataExtracted,
  onDocumentUploaded,
  onRefreshData,
  candidateDetails,
  className,
  defaultOpen,
  customButton,
}) {
  const fileInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(defaultOpen);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [state, setState] = useState("idle"); // idle | uploading | parsing | review | saving | error
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [rawExtractedData, setRawExtractedData] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const docTypeInfo = PARSEABLE_DOCUMENT_TYPES.find((t) => t.apiType === documentType);

  const { organisation, user } = useAuth();
  const orgData = organisation?.org_data?.[0] || {};

  const candidateEmail = candidateDetails?.original_email;
  const candidateId = candidateDetails?.id;
  const adminEmail = user?.email;

  const organization = orgData?.preferred_org_name || "4sphere_software_solutions_llc";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF or image file (JPG, PNG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum file size is 10MB.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    handleParseDocument(file);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    setModalOpen(true);
    setState("idle");
    setSelectedFile(null);
    setParsedData(null);
    setRawExtractedData(null);
    setFileInfo(null);
    setError(null);
    setProgress(0);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleParseDocument = (file) => {
    setState("uploading");
    setProgress(1);

    fileToBase64(file)
      .then((base64) => {
        const fileType = file.name.split(".").pop();

        const payload = {
          emailid: adminEmail,
          task: "parse-immigration-document",
          employee_email: candidateEmail,
          file_base64: base64,
          file_type: fileType,
          doc_type: documentType,
          candidate_id: candidateId,
          organization: organization,
        };

        axios
          .post(BASE_URL, payload, {
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total || progressEvent.loaded;
              const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
              setProgress(percentCompleted);
              if (percentCompleted === 100) {
                setState("parsing");
              }
            },
          })
          .then((response) => {
            const result = response.data;

            const flatData = {};
            const immigrationData = result.data.extracted_data?.immigration_data || {};
            const i94Data = result.data.extracted_data?.i94_data || {};
            const allFields = { ...immigrationData, ...i94Data };

            Object.entries(allFields).forEach(([key, val]) => {
              if (val) {
                flatData[key] = {
                  value: val,
                  confidence: 0.95,
                };
              }
            });

            const adaptedResponse = {
              status: "success",
              extracted_data: flatData,
              document_type: result.data.doc_type,
              document_type_confidence: 1.0,
              needs_review: true,
              review_fields: [],
              raw_extracted_data: result.data,
              file_base64: base64,
              file_type: fileType,
              file_name: file.name,
            };

            setRawExtractedData(result.data);
            setFileInfo({
              file_base64: base64,
              file_type: fileType,
              file_name: file.name,
            });

            setParsedData(adaptedResponse);
            setState("review");
            setModalOpen(false);
            setReviewSheetOpen(true);
          })
          .catch((err) => {
            console.error("Error parsing document:", err);
            setError({
              code: "NETWORK_ERROR",
              message: err instanceof Error ? err.message : "Network error. Please try again.",
            });
            setState("error");
          });
      })
      .catch((err) => {
        console.error("Error reading file:", err);
        setError({
          code: "FILE_READ_ERROR",
          message: "Failed to read file.",
        });
        setState("error");
      });
  };

  const handleSaveExtractedData = async (editedData) => {
    if (!parsedData || !selectedFile) return;
    setState("saving");
    try {
      onDataExtracted(editedData);
      if (onRawDataExtracted && rawExtractedData) {
        const result = await onRawDataExtracted(rawExtractedData, fileInfo || undefined, selectedFile || undefined);
        if (result === "pending") {
          setState("idle");
          setModalOpen(false);
          return;
        }
        if (onRefreshData) await onRefreshData();
        toast.success(`${docTypeInfo?.name || documentType} has been saved and data refreshed.`);
      } else {
        const newDoc = {
          document_id: `new-${Date.now()}`,
          doc_type: parsedData.document_type.toUpperCase(),
          doc_name: selectedFile.name,
          file_name: selectedFile.name,
          file_path: `/documents/immigration/${selectedFile.name}`,
          mime_type: selectedFile.type,
          file_size: selectedFile.size,
          status: "uploaded",
          uploaded_at: new Date().toISOString(),
          uploaded_by: "Current User",
          expiry_date: editedData.expiry_date?.value || editedData.card_expires?.value,
          document_number:
            editedData.passport_number?.value ||
            editedData.card_number?.value ||
            editedData.receipt_number?.value ||
            editedData.i94_number?.value,
        };
        if (onDocumentUploaded) onDocumentUploaded(newDoc);
        toast.success(`${docTypeInfo?.name || documentType} data has been populated into the form.`);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving document:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save document. Please try again.");
      setState("review");
    }
  };

  const handleRetry = () => {
    setError(null);
    setState("idle");
    setProgress(0);
    setSelectedFile(null);
    setRawExtractedData(null);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    setModalOpen(false);
    setReviewSheetOpen(false);
    setSelectedFile(null);
    setParsedData(null);
    setRawExtractedData(null);
    setFileInfo(null);
    setError(null);
    setState("idle");
    setProgress(0);
  };

  const handleReviewSheetClose = (open) => {
    if (!open) handleClose();
  };

  const renderModalContent = () => {
    if (state === "uploading" || state === "parsing") {
      return (
        <div className="py-8 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <svg
                className="h-12 w-12 animate-spin text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="absolute -top-1 -right-1 text-amber-500 animate-pulse">✨</span>
            </div>
            <div className="text-center">
              <p className="font-medium">
                {state === "uploading" ? "Uploading document..." : "AI is analyzing your document..."}
              </p>
              <p className="text-sm text-gray-500">
                {state === "parsing" ? `Extracting ${docTypeInfo?.name || documentType} fields` : "Please wait"}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      );
    }
    if (state === "review" || state === "saving") return null;
    if (state === "error") {
      return (
        <div className="py-4 space-y-4">
          <div className="border border-red-300 bg-red-50 rounded-md p-3 flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium text-red-800">{error?.message}</p>
              {error?.code && <p className="text-xs mt-1 text-red-600">Error code: {error.code}</p>}
            </div>
          </div>
          {error?.suggestions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggestions:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                {error.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 flex items-center gap-1"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }
    // idle
    return (
      <div className="py-6 space-y-4">
        <div
          className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-3">📤</div>
          <p className="text-sm font-medium">Upload {docTypeInfo?.name || documentType} document</p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="border border-indigo-200 bg-indigo-50 rounded-md p-3 flex items-start gap-2">
          <span>✨</span>
          <p className="text-sm text-indigo-800">AI will automatically extract data and save to the database.</p>
        </div>
      </div>
    );
  };

  if (parsedData) {
    return (
      <DocumentReviewSheet
        open={reviewSheetOpen}
        onOpenChange={handleReviewSheetClose}
        parsedData={parsedData}
        onSave={handleSaveExtractedData}
        saving={state === "saving"}
      />
    );
  }

  return (
    <>
      {customButton ? (
        customButton(handleButtonClick)
      ) : (
        <button
          className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 ${className || ""}`}
          onClick={handleButtonClick}
        >
          ✨ {label || "Smart Upload"}
        </button>
      )}
      {/* Upload/Parsing/Error Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                ✨ Smart Upload {docTypeInfo?.name || documentType}
              </h3>
              <p className="text-sm text-gray-500">
                Upload a {docTypeInfo?.name || documentType} for AI-powered data extraction
              </p>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
}
