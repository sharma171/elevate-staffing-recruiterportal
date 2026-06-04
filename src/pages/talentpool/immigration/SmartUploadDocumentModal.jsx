import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Progress } from "../../../components/ui/progress";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Upload, FileText, X, Loader2, Sparkles, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { parseDocument } from "../../../utils/immigrationApiService";
import { DocumentReviewPanel } from "./DocumentReviewPanel";
import { PARSEABLE_DOCUMENT_TYPES } from "./constants";

export function SmartUploadDocumentModal({
  open,
  onOpenChange,
  candidateEmail,
  candidateId,
  organization = "4sphere_software_solutions_llc",
  onUploadComplete,
  onDataExtracted,
}) {
  const fileInputRef = useRef(null);
  const [state, setState] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTypeHint, setDocTypeHint] = useState("auto");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.success("Please upload a PDF or image file (JPG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Maximum file size is 5MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFileChange({ target: input });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleParseDocument = async () => {
    if (!selectedFile) return;
    setState("uploading");
    setProgress(10);
    try {
      setState("parsing");
      setProgress(30);
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      const response = await parseDocument(
        selectedFile,
        candidateId,
        organization,
        docTypeHint === "auto" ? undefined : docTypeHint,
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
        setState("error");
        return;
      }
      setParsedData(response);
      setState("review");
    } catch (err) {
      console.error("Error parsing document:", err);
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error. Please try again.",
      });
      setState("error");
    }
  };

  const handleSaveExtractedData = async (editedData) => {
    if (!parsedData || !selectedFile) return;
    setState("saving");
    try {
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
      if (onDataExtracted) onDataExtracted(parsedData.document_type, editedData);
      onUploadComplete(newDoc, editedData);
      toast.success(`${parsedData.document_type.replace(/_/g, " ")} data has been extracted and saved`);
      handleClose();
    } catch (err) {
      console.error("Error saving document:", err);
      toast.error("Failed to save document. Please try again.");
      setState("review");
    }
  };

  const handleRetry = () => {
    setError(null);
    setState("idle");
    setProgress(0);
  };
  const handleClose = () => {
    setSelectedFile(null);
    setDocTypeHint("auto");
    setParsedData(null);
    setError(null);
    setState("idle");
    setProgress(0);
    onOpenChange(false);
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderContent = () => {
    switch (state) {
      case "uploading":
      case "parsing":
        return (
          <div className="py-8  !space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-[#7c3bed]" />
                <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium">
                  {state === "uploading" ? "Uploading document..." : "AI is analyzing your document..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {state === "parsing" ? "Extracting fields and validating data" : "Please wait"}
                </p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        );
      case "review":
      case "saving":
        if (state === "saving" && !parsedData)
          return (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#7c3bed]" />
              <p className="font-medium">Saving to profile...</p>
            </div>
          );
        return parsedData ? (
          <DocumentReviewPanel
            parsedData={parsedData}
            onSave={handleSaveExtractedData}
            onCancel={handleClose}
            saving={state === "saving"}
          />
        ) : null;
      case "error":
        return (
          <div className="py-4  !space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">{error?.message}</p>
                {error?.code && <p className="text-xs mt-1 opacity-70">Error code: {error.code}</p>}
              </AlertDescription>
            </Alert>
            {error?.suggestions && error.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggestions:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
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
      default:
        return (
          <div className=" !space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document File</Label>
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
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
                  onDragOver={handleDragOver}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
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
            <div className="space-y-2">
              <Label>
                Document Type (Optional)
                <span className="text-xs text-muted-foreground ml-2">Leave empty for auto-detection</span>
              </Label>
              <Select value={docTypeHint} onValueChange={setDocTypeHint}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {PARSEABLE_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.code} value={type.apiType}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Alert className="border-[#e7e7ef]/20 bg-[#7c3bed]/5">
              <Sparkles className="h-4 w-4 text-[#080118]" />
              <AlertDescription className="text-sm text-[#080118]">
                <span className="font-medium">Smart Upload:</span> AI will automatically extract fields from your
                document. You'll review and confirm before saving.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleParseDocument} disabled={!selectedFile}>
                <Sparkles className="h-4 w-4 mr-1" />
                Parse & Extract
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
            <Upload className="h-5 w-5" />
            {state === "review" || state === "saving" ? "Review Extracted Data" : "Smart Upload Document"}
          </DialogTitle>
          <DialogDescription>
            {state === "review" || state === "saving"
              ? "Review and edit the extracted fields before saving to profile"
              : "Upload a document for AI-powered data extraction. Supported: PDF, JPG, PNG (max 5MB)"}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
