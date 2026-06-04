import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertTriangle, FileText, RefreshCw, Plus } from "lucide-react";

export function DuplicateLCADialog({
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
  const existingLcaId = duplicateInfo?.existing_lca_id || duplicateInfo?.existingLcaId || null;
  const duplicateMessage = duplicateInfo?.error || duplicateInfo?.message || null;
  const caseNumber =
    extractedData?.lca_case_number || extractedData?.case_number || extractedData?.lca_number || "(Unknown)";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!max-w-2xl w-[95vw]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            Duplicate LCA Found
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="!space-y-4 pt-2 overflow-hidden">
              <Alert variant="red-500" className="!border-red-500/30 border-solid border-[1px] bg-red-500/5">
                <AlertDescription className="text-foreground text-sm break-words">
                  An LCA with case number{" "}
                  <span className="font-mono font-semibold break-all text-[#080118]">{caseNumber}</span> already exists
                  for this candidate.
                </AlertDescription>
              </Alert>
              {duplicateMessage && <p className="text-xs text-muted-foreground break-words">{duplicateMessage}</p>}
              {extractedData && (
                <div className="!space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Newly Extracted Data
                  </p>
                  <div className="bg-[#e7e7e7]/50 rounded-xl p-3 !space-y-2 overflow-hidden">
                    {extractedData.job_title && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Job Title:</span>
                        <span className="font-medium">{extractedData.job_title}</span>
                      </div>
                    )}
                    {extractedData.soc_code && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">SOC:</span>{" "}
                        <span className="font-medium">{extractedData.soc_code}</span>
                        {extractedData.soc_title && (
                          <span className="text-muted-foreground"> — {extractedData.soc_title}</span>
                        )}
                      </div>
                    )}
                    {extractedData.employer_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Employer:</span>{" "}
                        <span className="font-medium break-words">{extractedData.employer_name}</span>
                      </div>
                    )}
                    {extractedData.wage_rate_from && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Wage:</span>{" "}
                        <span className="font-medium">${extractedData.wage_rate_from}</span>
                        {extractedData.wage_level && (
                          <span className="text-muted-foreground"> (Level {extractedData.wage_level})</span>
                        )}
                      </div>
                    )}
                    {extractedData.status && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <span className="font-medium capitalize">{extractedData.status}</span>
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
            onClick={() => onUpdateExisting(existingLcaId)}
            disabled={isLoading || !existingLcaId}
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
