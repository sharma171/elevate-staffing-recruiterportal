// Two-tab modal for adding petitions: Approval Upload vs Pending Petition
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { FileText, Clock, Upload, FileEdit, Loader2, ArrowLeft } from "lucide-react";
import { PETITION_TYPES } from "../constants";
import { SmartUploadButton } from "../SmartUploadButton";
import { cn } from "../../../../lib/utils";
import OverlayModal from "../../../../components/OverlayModal";

export function AddPetitionOptionsModal({
  open,
  onOpenChange,
  candidateEmail,
  candidateId,
  lcaHistory,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  onManualPendingSubmit,
  onUploadComplete,
}) {
  const [uploadMode, setUploadMode] = useState("approval");
  const [pendingEntryMode, setPendingEntryMode] = useState(null);
  const [standaloneSmartMode, setStandaloneSmartMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const smartUploadCompletedRef = useRef(false);
  const standaloneSmartOpenedRef = useRef(false);

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
    setStandaloneSmartMode(null);
    smartUploadCompletedRef.current = false;
    standaloneSmartOpenedRef.current = false;
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

  const handleManualSubmit = async () => {
    if (!formData.receiptNumber || !formData.petitionType || !formData.employer || !formData.filedDate) return;
    setIsSubmitting(true);
    try {
      const payloadData = {
        receipt_number: formData.receiptNumber,
        petition_type: formData.petitionType,
        notice_type: formData.petitionType,
        employer_name: formData.employer,
        received_date: formData.filedDate,
        filed_date: formData.filedDate,
        notice_date: formData.noticeDate,
        premium_processing: formData.premiumProcessing,
      };

      await onManualPendingSubmit({ ...payloadData, file: attachedFile || undefined });
      handleClose();
    } catch (error) {
      console.error("Failed to submit manual petition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const launchStandaloneSmartUpload = (mode) => {
    smartUploadCompletedRef.current = false;
    standaloneSmartOpenedRef.current = false;
    setStandaloneSmartMode(mode);
    onOpenChange(false);
  };

  const handleStandaloneSmartUploadOpenChange = (isOpen) => {
    if (isOpen) {
      standaloneSmartOpenedRef.current = true;
      return;
    }
    if (!standaloneSmartMode || !standaloneSmartOpenedRef.current) return;

    const completed = smartUploadCompletedRef.current;
    const mode = standaloneSmartMode;

    setStandaloneSmartMode(null);
    smartUploadCompletedRef.current = false;
    standaloneSmartOpenedRef.current = false;

    if (!completed) {
      setUploadMode(mode === "pending" ? "pending" : "approval");
      setPendingEntryMode(null);
      onOpenChange(true);
    }
  };

  const handleSmartUploadData = (data) => {
    smartUploadCompletedRef.current = true;
    if (onI797DataExtracted) onI797DataExtracted(data);
    handleClose();
    onUploadComplete?.();
  };

  const isFormValid = formData.receiptNumber && formData.petitionType && formData.employer && formData.filedDate;

  const renderManualView = () => {
    return (
      <OverlayModal
        isActive
        onClose={() => setPendingEntryMode(null)}
        style={{ maxWidth: "600px" }}
        modalStyle={{ padding: "20px", background: "white" }}
      >
        <div className="signatureContainer">
          <div className="!space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingEntryMode(null)}
              className="text-muted-foreground align-items-center d-flex gap-1"
            >
              <ArrowLeft size={12} /> Back
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="receiptNumber">Receipt Number *</Label>
                <Input
                  id="receiptNumber"
                  placeholder="IOE..."
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="petitionType">Petition Type *</Label>
                <Select
                  value={formData.petitionType}
                  onValueChange={(value) => setFormData({ ...formData, petitionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PETITION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="employer">Employer *</Label>
              <Input
                id="employer"
                placeholder="Company name"
                value={formData.employer}
                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="filedDate">Filed Date *</Label>
                <Input
                  id="filedDate"
                  type="date"
                  value={formData.filedDate}
                  onChange={(e) => setFormData({ ...formData, filedDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="noticeDate">Notice Date</Label>
                <Input
                  id="noticeDate"
                  type="date"
                  value={formData.noticeDate}
                  onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lcaId">Link to LCA</Label>
              <Select
                value={formData.lcaId || "none"}
                onValueChange={(value) => setFormData({ ...formData, lcaId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select LCA (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {lcaHistory.map((lca) => {
                    return (
                      <SelectItem key={lca.id} value={lca.id}>
                        {lca.case_number} {lca.status ? `(${lca.status})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="premiumProcessing"
                checked={formData.premiumProcessing}
                onCheckedChange={(checked) => setFormData({ ...formData, premiumProcessing: checked === true })}
              />
              <Label htmlFor="premiumProcessing" className="cursor-pointer">
                Premium Processing
              </Label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Upload Document (optional)</Label>
              <div className="text-xs text-muted-foreground mb-2">Just stores the file, no parsing</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileAttach}
                className="hidden"
              />
              {attachedFile ? (
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate">{attachedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAttachedFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Attach File
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleManualSubmit} disabled={!isFormValid || isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save as Pending
              </Button>
            </div>
          </div>
        </div>
      </OverlayModal>
    );
  };

  if (pendingEntryMode === "manual") {
    return renderManualView();
  }

  return (
    <>
      <Dialog open={open && !standaloneSmartMode} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload I-797</DialogTitle>
          </DialogHeader>
          <div className="!space-y-4">
          {pendingEntryMode === null && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUploadMode("approval")}
                className={cn(
                  "w-full p-3 rounded-[10px] ring-2 text-left transition-colors",
                  uploadMode === "approval"
                    ? "ring-[#7c3bed] bg-[#7c3bed0d]"
                    : "ring-[#e7e7ef] bg-transparent hover:ring-muted-foreground/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#7c3bed] mt-0.5" />
                  <div>
                    <div className="font-medium">Upload Approval Notice (I-797A)</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Standard flow — parse approval, set as current
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("pending")}
                className={cn(
                  "w-full p-3 rounded-[10px] ring-2 text-left transition-colors",
                  uploadMode === "pending"
                    ? "ring-[#7c3bed] bg-[#7c3bed0d]"
                    : "ring-[#e7e7ef] bg-transparent hover:ring-muted-foreground/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-accent-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Add Pending Petition (Receipt Notice)</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      For amendments/transfers/extensions in progress
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {uploadMode === "approval" && pendingEntryMode === null && candidateEmail && onI797DataExtracted && (
            <Button className="w-full" onClick={() => launchStandaloneSmartUpload("approval")}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload I-797A Approval Notice
            </Button>
          )}

          {uploadMode === "pending" && pendingEntryMode === null && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">How do you want to add?</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => launchStandaloneSmartUpload("pending")}
                  className={cn(
                    "w-full p-3 rounded-[10px] ring-2 text-left transition-colors hover:!ring-[#7c3bed] hover:!bg-[#7c3bed0d] ring-[#e7e7ef] bg-transparent hover:ring-muted-foreground/50 text-center",
                  )}
                >
                  <Upload className="h-6 w-6 mx-auto text-[#7c3bed] mb-2" />
                  <div className="font-semibold text-sm">Smart Upload</div>
                  <div className="text-xs text-muted-foreground mt-1">Upload I-797C PDF and auto-extract</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingEntryMode("manual")}
                  className={cn(
                    "w-full p-3 rounded-[10px] ring-2 text-left transition-colors hover:!ring-[#7c3bed] hover:!bg-[#7c3bed0d] ring-[#e7e7ef] bg-transparent hover:ring-muted-foreground/50 text-center",
                  )}
                >
                  <FileEdit className="h-6 w-6 mx-auto text-[#7c3bed] mb-2" />
                  <div className="font-semibold text-sm">Manual Entry</div>
                  <div className="text-xs text-muted-foreground mt-1">Type receipt number and details manually</div>
                </button>
              </div>
            </div>
          )}

          {pendingEntryMode === "smart" && candidateEmail && onI797DataExtracted && (
            <div className="!space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingEntryMode(null)}
                className="text-muted-foreground"
              >
                ← Back
              </Button>
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Upload I-797C (Receipt Notice) PDF to auto-extract details
                </p>
                <Button onClick={() => launchStandaloneSmartUpload("pending")}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Select File to Upload
                </Button>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
      {standaloneSmartMode && candidateEmail && onI797DataExtracted && (
        <SmartUploadButton
          documentType="h1b_approval"
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onDataExtracted={handleSmartUploadData}
          onRawDataExtracted={onSaveI797}
          onRefreshData={onRefreshData}
          autoOpen
          hideTrigger
          onUIOpenChange={handleStandaloneSmartUploadOpenChange}
        />
      )}
    </>
  );
}
