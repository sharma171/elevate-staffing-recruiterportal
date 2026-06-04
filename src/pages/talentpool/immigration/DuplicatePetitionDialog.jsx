import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertTriangle, FileText, Calendar, Building2, RefreshCw, Plus } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};
const formatPetitionType = (type) => {
  if (!type) return "—";
  const labels = {
    initial: "Initial",
    transfer: "Transfer",
    extension: "Extension",
    amendment: "Amendment",
    concurrent: "Concurrent",
  };
  return labels[type.toLowerCase()] || type;
};
const formatStatus = (status) => {
  if (!status) return "—";
  const labels = {
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
    rfe: "RFE Received",
    withdrawn: "Withdrawn",
  };
  return labels[status.toLowerCase()] || status;
};

export function DuplicatePetitionDialog({
  open,
  onOpenChange,
  duplicateInfo,
  extractedData,
  onCancel,
  onUpdateExisting,
  onCreateAnyway,
  isLoading = false,
}) {
  if (!duplicateInfo) return null;
  const receiptNumber = extractedData?.receipt_number || duplicateInfo.existing_petition?.receipt_number || "(Unknown)";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!max-w-2xl w-[95vw]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            Duplicate Petition Found
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="!space-y-4 pt-2 overflow-hidden">
              <Alert variant="red-500" className="!border-red-500/30 border-solid border-[1px] bg-red-500/5">
                <AlertDescription className="text-foreground text-sm break-words">
                  A petition with receipt number{" "}
                  <span className="font-mono font-semibold break-all text-[#080118]">{receiptNumber}</span> already
                  exists for this candidate.
                </AlertDescription>
              </Alert>
              {extractedData && (
                <div className="!space-y-2">
                  <p className="text-xs font-medium text-[#676767] uppercase tracking-wide">Newly Extracted Data</p>
                  <div className="bg-[#e7e7e7]/50 rounded-lg p-3 !space-y-2 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#676767] flex-shrink-0" />
                        <span className="text-[#676767]">Type:</span>
                        <span className="font-medium">{formatPetitionType(extractedData.petition_type)}</span>
                      </div>
                      <Badge
                        variant={extractedData.status === "approved" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {formatStatus(extractedData.status)}
                      </Badge>
                    </div>
                    {(extractedData.validity_start || extractedData.validity_end) && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-[#676767] flex-shrink-0" />
                        <span className="text-[#676767]">Validity:</span>
                        <span className="font-medium">
                          {formatDate(extractedData.validity_start)} — {formatDate(extractedData.validity_end)}
                        </span>
                      </div>
                    )}
                    {extractedData.employer_name && (
                      <div className="flex items-start gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-[#676767] flex-shrink-0 mt-0.5" />
                        <span className="text-[#676767] flex-shrink-0">Employer:</span>
                        <span className="font-medium break-words">{extractedData.employer_name}</span>
                      </div>
                    )}
                    {extractedData.beneficiary_name && (
                      <div className="text-sm">
                        <span className="text-[#676767]">Beneficiary:</span>{" "}
                        <span className="font-medium">{extractedData.beneficiary_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-[#080118]">What would you like to do?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <Button variant="outline" onClick={onCreateAnyway} disabled={isLoading} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create New Entry Anyway
          </Button>
          <Button
            onClick={() => onUpdateExisting(duplicateInfo.existing_petition_id)}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            {isLoading ? "Updating..." : "Update Existing (Recommended)"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
