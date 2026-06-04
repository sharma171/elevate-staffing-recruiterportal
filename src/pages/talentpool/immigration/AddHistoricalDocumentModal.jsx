import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Progress } from "../../../components/ui/progress";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Upload, FileText, X, Loader2, Sparkles, AlertTriangle, RotateCcw, History } from "lucide-react";
import { toast } from "react-toastify";
import { parseDocument } from "../../../utils/immigrationApiService";
import { saveH1BApproval, saveLCA, saveI20, saveEAD, saveI983, saveCPT } from "../../../utils/immigrationApiService";
import { DocumentReviewPanel } from "./DocumentReviewPanel";

const HISTORICAL_DOC_TYPES = [
  { value: "i20", label: "I-20 (F1/OPT/STEM OPT)", apiType: "i20" },
  { value: "ead_card", label: "EAD Card", apiType: "ead_card" },
  { value: "i983", label: "I-983 Training Plan", apiType: "i983" },
  { value: "cpt", label: "CPT Authorization", apiType: "cpt" },
  { value: "i797", label: "I-797 (H1B Approval/Receipt)", apiType: "h1b_approval" },
  { value: "lca", label: "LCA", apiType: "lca" },
];

function extractRawValues(fields) {
  if (!fields) return {};
  const raw = {};
  for (const [key, val] of Object.entries(fields)) {
    raw[key] = val && typeof val === "object" && "value" in val ? val.value : val;
  }
  return raw;
}

async function saveHistorical(docType, rawData, fileInfo, candidateEmail) {
  const fi = fileInfo || undefined;
  switch (docType) {
    case "h1b_approval":
    case "i797":
      return await saveH1BApproval(candidateEmail, rawData, false, fi, false);
    case "lca": {
      const lcaPayload = rawData.immigration_data
        ? { ...rawData.immigration_data, worksites: rawData.worksites }
        : rawData;
      return await saveLCA(candidateEmail, lcaPayload, false, fi);
    }
    case "i20":
      return await saveI20(candidateEmail, rawData, false, fi);
    case "ead_card":
    case "ead":
      return await saveEAD(candidateEmail, rawData, false, fi);
    case "i983":
      return await saveI983(candidateEmail, rawData, false, fi);
    case "cpt":
      return await saveCPT(candidateEmail, rawData, undefined, false, fi);
    default:
      console.warn(`No save handler for: ${docType}`);
      return { success: true };
  }
}

export function AddHistoricalDocumentModal({
  open,
  onOpenChange,
  candidateEmail,
  candidateId,
  organization = "4sphere_software_solutions_llc",
  onUploadComplete,
}) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState("select"); // select | upload | parsing | review | saving | error
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [rawExtractedData, setRawExtractedData] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or image file (JPG, PNG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Maximum file size is 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return;
    setStep("parsing");
    setProgress(10);
    try {
      setProgress(30);
      const progressInterval = setInterval(() => setProgress((prev) => Math.min(prev + 10, 90)), 500);
      const docTypeObj = HISTORICAL_DOC_TYPES.find((d) => d.value === selectedDocType);
      const response = await parseDocument(
        selectedFile,
        candidateId,
        organization,
        docTypeObj?.apiType,
        candidateEmail,
      );
      clearInterval(progressInterval);
      setProgress(100);

      if (response.status === "error") {
        setError({
          code: response.error_code || "UNKNOWN_ERROR",
          message: response.message || "Failed to parse document",
          suggestions: response.suggestions,
        });
        setStep("error");
        return;
      }

      if (response.raw_extracted_data) setRawExtractedData(response.raw_extracted_data);
      if (response.file_base64 && response.file_type && response.file_name) {
        setFileInfo({
          file_base64: response.file_base64,
          file_type: response.file_type,
          file_name: response.file_name,
        });
      }

      setParsedData(response);
      setStep("review");
    } catch (err) {
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error. Please try again.",
      });
      setStep("error");
    }
  };

  const handleSave = async (editedData) => {
    if (!parsedData || !selectedFile) return;
    setStep("saving");
    try {
      const rawData = rawExtractedData || extractRawValues(editedData);
      const docType = parsedData.document_type;
      const saveResult = await saveHistorical(docType, rawData, fileInfo, candidateEmail);

      if (saveResult && !saveResult.success && (saveResult.existing_petition_id || saveResult.existing_lca_id)) {
        toast({
          title: "Duplicate detected",
          description: saveResult.error || "A matching record already exists.",
          variant: "destructive",
        });
        setStep("review");
        return;
      }

      toast({
        title: "Historical document saved",
        description: `${docType.replace(/_/g, " ")} has been saved as a historical record.`,
      });
      onUploadComplete?.();
      handleClose();
    } catch (err) {
      toast({ title: "Save failed", description: err?.message || "Failed to save document.", variant: "destructive" });
      setStep("review");
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedDocType("");
    setSelectedFile(null);
    setParsedData(null);
    setRawExtractedData(null);
    setFileInfo(null);
    setError(null);
    setProgress(0);
    onOpenChange(false);
  };

  const handleRetry = () => {
    setError(null);
    setStep("upload");
    setProgress(0);
    setRawExtractedData(null);
    setFileInfo(null);
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderContent = () => {
    switch (step) {
      case "select":
        return (
          <div className="!space-y-4 !py-4">
            <div className="!space-y-2">
              <Label>Select Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose document type..." />
                </SelectTrigger>
                <SelectContent>
                  {HISTORICAL_DOC_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Alert className="border-amber-200 bg-amber-50">
              <History className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                This document will be saved as a <span className="font-medium">historical record</span> and will not
                replace any current records.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep("upload")} disabled={!selectedDocType}>
                Next
              </Button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="!space-y-4 py-4">
            <div className="!space-y-2">
              <Label>Upload {HISTORICAL_DOC_TYPES.find((d) => d.value === selectedDocType)?.label}</Label>
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-[#67677e] flex-shrink-0" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                    <span className="text-xs text-[#67677e]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#e7e7ef] rounded-md p-6 text-center cursor-pointer hover:border-[#7c3bed]/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload className="h-8 w-8 mx-auto text-[#67677e] mb-2" />
                  <p className="text-sm text-[#67677e]">Click to select or drag and drop</p>
                  <p className="text-xs text-[#67677e] mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleParse} disabled={!selectedFile}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Parse & Extract
                </Button>
              </div>
            </div>
          </div>
        );

      case "parsing":
        return (
          <div className="py-8 !space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium">AI is analyzing your document...</p>
                <p className="text-sm text-[#67677e]">Extracting fields and validating data</p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        );

      case "review":
      case "saving":
        if (step === "saving" && !parsedData) {
          return (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Saving historical record...</p>
            </div>
          );
        }
        return parsedData ? (
          <div>
            <Alert className="border-amber-200 bg-amber-50 mb-4">
              <History className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                This will be saved as a <span className="font-medium">historical record</span> (not current).
              </AlertDescription>
            </Alert>
            <DocumentReviewPanel
              parsedData={parsedData}
              onSave={handleSave}
              onCancel={handleClose}
              saving={step === "saving"}
            />
          </div>
        ) : null;

      case "error":
        return (
          <div className="py-4 !space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">{error?.message}</p>
                {error?.code && <p className="text-xs mt-1 opacity-70">Error code: {error.code}</p>}
              </AlertDescription>
            </Alert>
            {error?.suggestions?.length > 0 && (
              <div className="!space-y-2">
                <p className="text-sm font-medium">Suggestions:</p>
                <ul className="text-sm text-[#67677e] list-disc list-inside space-y-1">
                  {error.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {step === "review" || step === "saving" ? "Review Extracted Data" : "Add Historical Document"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Select a document type to add as a historical immigration record."}
            {step === "upload" &&
              "Upload the document for AI-powered extraction. It will be saved as historical (not current)."}
            {(step === "review" || step === "saving") &&
              "Review and edit the extracted fields before saving as a historical record."}
            {step === "parsing" && "Processing your document..."}
            {step === "error" && "An error occurred during processing."}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
