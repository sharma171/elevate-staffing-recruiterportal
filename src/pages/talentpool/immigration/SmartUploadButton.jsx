import { useEffect, useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Progress } from "../../../components/ui/progress";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Sparkles, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { parseDocument, saveLCA, saveI20 } from "../../../utils/immigrationApiService";
import { DocumentReviewSheet } from "./DocumentReviewSheet";
import { SmartUploadSheet } from "./SmartUploadSheet";
import { PARSEABLE_DOCUMENT_TYPES } from "./constants";

export function SmartUploadButton({
  documentType,
  label,
  candidateEmail,
  candidateId,
  organization = "4sphere_software_solutions_llc",
  onDataExtracted,
  onRawDataExtracted,
  onDocumentUploaded,
  onRefreshData,
  variant = "outline",
  size = "sm",
  className,
  autoOpen = false,
  hideTrigger = false,
  onUIOpenChange,
}) {
  const autoOpenedRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [state, setState] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [rawExtractedData, setRawExtractedData] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const docTypeInfo = PARSEABLE_DOCUMENT_TYPES.find((t) => t.apiType === documentType);
  const isAnyUIOpen = uploadSheetOpen || dialogOpen || reviewSheetOpen;

  const handleFileSelected = (file) => {
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Please upload a PDF or image file (JPG, PNG)`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Maximum file size is 5MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadSheetOpen(false);
      setDialogOpen(true);
      handleParseDocument(file);
    }
  };

  const openSmartUploadFlow = () => {
    setState("idle");
    setSelectedFile(null);
    setParsedData(null);
    setRawExtractedData(null);
    setFileInfo(null);
    setError(null);
    setProgress(0);
    setUploadSheetOpen(true);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    openSmartUploadFlow();
  };

  const stopEventBubbling = (e) => {
    e.stopPropagation();
  };

  const handleParseDocument = async (file) => {
    setState("uploading");
    setProgress(10);
    try {
      setState("parsing");
      setProgress(30);
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      const response = await parseDocument(file, candidateId, organization, documentType, candidateEmail);
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
      if (response.raw_extracted_data) setRawExtractedData(response.raw_extracted_data);
      if (response.file_base64 && response.file_type && response.file_name)
        setFileInfo({
          file_base64: response.file_base64,
          file_type: response.file_type,
          file_name: response.file_name,
        });
      setParsedData(response);
      setState("review");
      setDialogOpen(false);
      setReviewSheetOpen(true);
    } catch (err) {
      console.error("Error parsing document:", err);
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error. Please try again.",
      });
      setState("error");
    }
  };

  const coerceEditedValue = (editedValue, currentValue) => {
    if (editedValue === undefined) return currentValue;
    if (currentValue === null || currentValue === undefined) return editedValue;

    if (typeof currentValue === "number") {
      const parsed = Number(editedValue);
      return Number.isFinite(parsed) ? parsed : currentValue;
    }

    if (typeof currentValue === "boolean") {
      if (typeof editedValue === "boolean") return editedValue;
      if (typeof editedValue === "string") {
        const normalized = editedValue.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
      }
      return currentValue;
    }

    return editedValue;
  };

  const normalizeEditedValues = (editedData) => {
    return Object.entries(editedData || {}).reduce((acc, [fieldName, fieldData]) => {
      if (fieldData && typeof fieldData === "object" && Object.prototype.hasOwnProperty.call(fieldData, "value")) {
        acc[fieldName] = fieldData.value;
      } else {
        acc[fieldName] = fieldData;
      }
      return acc;
    }, {});
  };

  const mergeEditedDataIntoRawPayload = (rawData, editedData) => {
    const editedValues = normalizeEditedValues(editedData);
    if (!rawData || typeof rawData !== "object") return editedValues;

    const merged = JSON.parse(JSON.stringify(rawData));
    const hasImmigrationData =
      merged.immigration_data && typeof merged.immigration_data === "object" && !Array.isArray(merged.immigration_data);
    const hasNestedExtractedData =
      merged.extracted_data && typeof merged.extracted_data === "object" && !Array.isArray(merged.extracted_data);
    const fieldTarget = hasImmigrationData
      ? merged.immigration_data
      : hasNestedExtractedData
        ? merged.extracted_data
        : merged;

    Object.entries(editedValues).forEach(([fieldName, editedValue]) => {
      if (fieldName === "_worksites") {
        if (typeof editedValue === "string") {
          try {
            const parsedWorksites = JSON.parse(editedValue);
            if (Array.isArray(parsedWorksites)) {
              if (hasImmigrationData) merged.worksites = parsedWorksites;
              else fieldTarget.worksites = parsedWorksites;
            }
          } catch {
            // Ignore malformed worksites edits and keep original structure.
          }
        } else if (Array.isArray(editedValue)) {
          if (hasImmigrationData) merged.worksites = editedValue;
          else fieldTarget.worksites = editedValue;
        }
        return;
      }

      if (Object.prototype.hasOwnProperty.call(fieldTarget, fieldName)) {
        fieldTarget[fieldName] = coerceEditedValue(editedValue, fieldTarget[fieldName]);
        return;
      }

      if (Object.prototype.hasOwnProperty.call(merged, fieldName)) {
        merged[fieldName] = coerceEditedValue(editedValue, merged[fieldName]);
        return;
      }

      fieldTarget[fieldName] = editedValue;
    });

    const worksitesTarget = Array.isArray(merged.worksites)
      ? merged.worksites
      : Array.isArray(fieldTarget.worksites)
        ? fieldTarget.worksites
        : null;

    if (Array.isArray(worksitesTarget) && worksitesTarget.length > 0) {
      const primaryIdx = worksitesTarget.findIndex((site) => site?.is_primary);
      const targetIdx = primaryIdx >= 0 ? primaryIdx : 0;
      const targetWorksite = worksitesTarget[targetIdx];

      if (targetWorksite) {
        ["prevailing_wage", "actual_wage", "wage_level"].forEach((fieldName) => {
          if (!Object.prototype.hasOwnProperty.call(editedValues, fieldName)) return;
          targetWorksite[fieldName] = coerceEditedValue(editedValues[fieldName], targetWorksite[fieldName]);
        });
      }
    }

    return merged;
  };

  const handleSaveExtractedData = async (editedData) => {
    if (!parsedData || !selectedFile) return;
    setState("saving");
    try {
      const mergedRawExtractedData = mergeEditedDataIntoRawPayload(rawExtractedData, editedData);
      if (onDataExtracted) onDataExtracted(editedData);

      if (documentType === "lca" && onRawDataExtracted && mergedRawExtractedData) {
        const result = await onRawDataExtracted(mergedRawExtractedData, fileInfo || undefined, selectedFile || undefined);
        if (result === "pending") {
          setState("idle");
          setDialogOpen(false);
          return;
        }
        if (onRefreshData) await onRefreshData();
        toast.success(`${docTypeInfo?.name || documentType} has been saved and data refreshed.`);
        handleClose();
        return;
      }

      if (documentType === "lca") {
        await saveLCA(candidateEmail, mergedRawExtractedData, true, fileInfo || undefined);
        if (onRefreshData) await onRefreshData();
        toast.success(`${docTypeInfo?.name || "LCA"} has been saved and data refreshed.`);
        handleClose();
        return;
      }
      if (documentType === "i20") {
        await saveI20(candidateEmail, mergedRawExtractedData, true, fileInfo || undefined);
        if (onRefreshData) await onRefreshData();
        toast.success(`${docTypeInfo?.name || "I-20"} has been saved and data refreshed.`);
        handleClose();
        return;
      }
      if (onRawDataExtracted && mergedRawExtractedData) {
        const result = await onRawDataExtracted(mergedRawExtractedData, fileInfo || undefined, selectedFile || undefined);
        if (result === "pending") {
          setState("idle");
          setDialogOpen(false);
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
        toast.error(`${docTypeInfo?.name || documentType} data has been populated into the form`);
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
    setDialogOpen(false);
    setUploadSheetOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
    setUploadSheetOpen(false);
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

  useEffect(() => {
    if (onUIOpenChange) onUIOpenChange(isAnyUIOpen);
  }, [isAnyUIOpen, onUIOpenChange]);

  useEffect(() => {
    if (autoOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      openSmartUploadFlow();
    }
    if (!autoOpen) {
      autoOpenedRef.current = false;
    }
  }, [autoOpen]);

  const renderModalContent = () => {
    switch (state) {
      case "uploading":
      case "parsing":
        return (
          <div className="py-8 !space-y-4">
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
                  {state === "parsing" ? `Extracting ${docTypeInfo?.name || documentType} fields` : "Please wait"}
                </p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        );
      case "review":
      case "saving":
        return null;
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
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggestions:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {error.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
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
        return null;
    }
  };

  return (
    <>
      {!hideTrigger && (
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleButtonClick}
          onPointerDown={stopEventBubbling}
          onMouseDown={stopEventBubbling}
          onKeyDown={stopEventBubbling}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          {label || "Smart Upload"}
        </Button>
      )}
      <SmartUploadSheet
        open={uploadSheetOpen}
        onOpenChange={setUploadSheetOpen}
        onFileSelect={handleFileSelected}
        documentType={documentType}
        docTypeInfo={docTypeInfo}
        candidateEmail={candidateEmail}
      />
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#7c3bed]" />
              {`Smart Upload ${docTypeInfo?.name || documentType}`}
            </DialogTitle>
            <DialogDescription>{`Upload a ${docTypeInfo?.name || documentType} for AI-powered data extraction`}</DialogDescription>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
      {parsedData && (
        <DocumentReviewSheet
          open={reviewSheetOpen}
          onOpenChange={handleReviewSheetClose}
          parsedData={parsedData}
          onSave={handleSaveExtractedData}
          saving={state === "saving"}
        />
      )}
    </>
  );
}
