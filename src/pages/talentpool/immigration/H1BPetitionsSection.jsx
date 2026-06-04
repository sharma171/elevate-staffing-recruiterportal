import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Briefcase,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  Trash2,
  Download,
  Image,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { LCAHistoryCard } from "./LCAHistoryCard";
import { toast } from "react-toastify";
import { SmartUploadButton } from "./SmartUploadButton";
import { PetitionStatusCard, AddPetitionOptionsModal } from "./petition-status";
import FilePreview from "../../benchcandidate/FilePreview";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";

async function downloadDocumentAPI(candidateEmail, fileName) {
  const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "download-document",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      file_name: fileName,
    }),
  });
  return response.json();
}

function DocumentViewerModal({ open, onOpenChange, document, onDownload, isLoading }) {
  if (!open) return null;
  if (!document && !isLoading) return null;

  const isPDF = document?.type === "application/pdf" || document?.name?.endsWith(".pdf");
  const isImage =
    document?.type?.startsWith("image/") ||
    document?.name?.endsWith(".jpg") ||
    document?.name?.endsWith(".jpeg") ||
    document?.name?.endsWith(".png");

  const getDisplayUrl = () => {
    if (!document) return null;
    if (document.url) return document.url;
    if (document.base64) {
      const mimeType = isPDF ? "application/pdf" : document.type;
      return `data:${mimeType};base64,${document.base64}`;
    }
    return null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2 font-semibold truncate">
            {isPDF ? <FileText className="h-5 w-5 shrink-0" /> : <Image className="h-5 w-5 shrink-0" />}
            <span className="truncate">{document?.name || "Document"}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={onDownload}
              disabled={isLoading || !displayUrl}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden rounded-b-xl bg-gray-50">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin" />
                <p>Loading document...</p>
              </div>
            </div>
          ) : displayUrl ? (
            isPDF ? (
              <iframe src={displayUrl} className="w-full h-full border-0" title={document?.name} />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={displayUrl} alt={document?.name} className="max-w-full max-h-full object-contain rounded" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p>Preview not available for this file type</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p>Document preview not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function H1BPetitionsSection({
  petitions = [],
  lcaHistory = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddPetition,
  onDeletePetition,
  onSetActivePetition,
  onAddLCA,
  onDeleteLCA,
  onSetActiveLCA,
  onI797DataExtracted,
  onLCADataExtracted,
  onSaveI797,
  onSaveLCA,
  onRefreshData,
  onViewDocument,
  onManualPendingSubmit,
  onPetitionChange,
  onLCAChange,
  onLinkLCA,
  petitionDocuments,
  lcaDocuments,
  onDocumentsRefresh,
}) {
  const [showPreviousPetitions, setShowPreviousPetitions] = useState(false);
  const [showPreviousLCAs, setShowPreviousLCAs] = useState(false);
  const [settingActive, setSettingActive] = useState(null);
  const [showAddPetitionModal, setShowAddPetitionModal] = useState(false);
  const [triggerApprovalUpload, setTriggerApprovalUpload] = useState(false);
  const [triggerPendingUpload, setTriggerPendingUpload] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);

  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  function fileLoader() {
    setViewerLoading(true);
  }

  // Filter out petitions without valid status before grouping
  const validPetitions = petitions.filter(
    (p) => p.status && ["approved", "pending", "rfe", "denied", "withdrawn"].includes(p.status),
  );

  // Grouping: Current → In Progress (pending/rfe) → Previous
  const currentPetition = validPetitions.find((p) => p.is_current);
  const pendingPetitions = validPetitions.filter((p) => !p.is_current && ["pending", "rfe"].includes(p.status));
  const previousPetitions = validPetitions.filter((p) => !p.is_current && !["pending", "rfe"].includes(p.status));

  const currentLCA = lcaHistory.find((l) => l.is_current);
  const previousLCAs = lcaHistory.filter((l) => !l.is_current);

  const findLinkedLCA = (petition) => {
    if (!petition.lca_id) return null;
    return lcaHistory.find((l) => l.id === petition.lca_id) || null;
  };

  const getDocumentsForLCA = (lca) => {
    if (!lcaDocuments || !lca.case_number) return [];
    return lcaDocuments.filter((doc) => {
      const fileName = (doc.file_name || doc.doc_name || "").toLowerCase();
      const caseNumber = lca.case_number?.toLowerCase() || "";
      return caseNumber && fileName.includes(caseNumber);
    });
  };

  const getDocumentsForPetition = (petition) => {
    if (!petitionDocuments || !petition.receipt_number) return [];
    const receiptNum = petition.receipt_number.toLowerCase();
    return petitionDocuments.filter((doc) => {
      const fileName = (doc.file_name || doc.doc_name || "").toLowerCase();
      return (
        fileName.includes(receiptNum) ||
        (fileName.includes("h1b") && fileName.includes("approval") && petition.status === "approved") ||
        (fileName.includes("h1b") && fileName.includes("receipt") && petition.status === "pending")
      );
    });
  };

  const handleSetActivePetition = async (petitionId) => {
    if (!onSetActivePetition) return;
    setSettingActive(petitionId);
    try {
      await onSetActivePetition(petitionId);
      toast.success("The petition has been set as current.");
    } catch (error) {
      toast.error("Failed to set petition as current.");
    } finally {
      setSettingActive(null);
    }
  };

  const handleSetActiveLCA = async (lcaId) => {
    if (!onSetActiveLCA) return;
    setSettingActive(lcaId);
    try {
      await onSetActiveLCA(lcaId);
      toast.success("The LCA has been set as current.");
    } catch (error) {
      toast.error("Failed to set LCA as current.");
    } finally {
      setSettingActive(null);
    }
  };

  const handleSaveLCAFromSmartUpload = async (rawExtractedData, fileInfo, selectedFile) => {
    if (!onSaveLCA) return false;
    return onSaveLCA(rawExtractedData, fileInfo, selectedFile);
  };

  const handlePetitionAction = async (action, petition) => {
    switch (action) {
      case "delete":
        if (onDeletePetition) onDeletePetition(petition.id);
        break;
      case "setActive":
        await handleSetActivePetition(petition.id);
        break;
      case "viewDoc":
        if (petition.document_file_name && onViewDocument) await onViewDocument(petition.document_file_name);
        console.log("fileName", petition.document_file_name);
        break;
      default:
        break;
    }
  };

  const handleUploadComplete = () => {
    setShowAddPetitionModal(false);
  };

  const handleManualPendingSubmit = async (formData) => {
    if (onManualPendingSubmit) await onManualPendingSubmit(formData);
  };

  const existingPendingPetitions = pendingPetitions.length > 0;
  const hasRFE = pendingPetitions.some((p) => p.status === "rfe");
  const hasNoPetitions = validPetitions.length === 0;

  const handleView = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) {
      toast.error("Document filename not found");
      return;
    }
    setLoadingDocId(doc.document_id);
    setViewerLoading(true);
    try {
      const response = await downloadDocument(candidateEmail, fileName);
      if (!response.success || !response.files?.length) throw new Error(response.error || "Document not found");
      const file = response.files[0];
      if (file.base64?.length < 200) {
        return toast.error(file?.base64);
      }
      setViewerDoc({
        name: fileName,
        type: doc.mime_type || file.file_extension || "application/pdf",
        url: file.file_url,
        base64: file.base64,
      });
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load document");
    } finally {
      setLoadingDocId(null);
      setViewerLoading(false);
    }
  };

  const handleDownload = (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) return;

    setLoadingDocId(doc.document_id);

    downloadDocument(candidateEmail, fileName)
      .then((response) => {
        if (!response.success || !response.files?.length) {
          throw new Error(response.error || "Document not found");
        }

        const file = response.files[0];

        if (file.file_url) {
          const link = document.createElement("a");
          link.href = file.file_url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (file.base64) {
          if (file.base64.length < 200) {
            toast.error(file.base64);
            return;
          }

          const mimeType = doc.mime_type || "application/octet-stream";
          const byteCharacters = atob(file.base64);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
        }

        toast.success(`Downloading ${fileName}...`);
      })
      .catch((error) => {
        console.error("Error downloading document:", error);
        toast.error(error?.message || "Failed to download document");
      })
      .finally(() => {
        setLoadingDocId(null);
      });
  };

  return (
    <div className="space-y-6">
      {/* H-1B Petitions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="!font-medium !text-[16px] !text-base" style={{ lineHeight: "1" }}>
              H-1B Petitions
            </h4>
            {petitions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {petitions.length}
              </Badge>
            )}
            {existingPendingPetitions && (
              <Badge variant="outline" className="text-xs border-accent bg-accent/10 text-accent-foreground">
                {hasRFE ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    RFE
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    {pendingPetitions.length} Pending
                  </>
                )}
              </Badge>
            )}
          </div>
          {petitions.length > 0 && (
            <>
              <Button
                variant="default"
                size="sm"
                className="signatureContainer inline-flex items-center justify-center gap-[6px] whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#7c3bed] text-white hover:bg-[#7c3bede6] h-9 px-[12px] h-7 text-xs bg-primary"
                onClick={() => setShowAddPetitionModal(true)}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Upload Approval
              </Button>
            </>
          )}
        </div>

        {/* Empty State */}
        {hasNoPetitions ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-1">No H-1B Petition Data</p>
            <p className="text-sm mb-4">Upload an I-797 approval notice or receipt notice to get started</p>
            <Button onClick={() => setShowAddPetitionModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload I-797
            </Button>
          </div>
        ) : (
          <>
            {/* 1. In Progress Petitions (pending/rfe) */}
            {existingPendingPetitions && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className={`h-4 w-4 ${hasRFE ? "text-destructive" : "text-accent-foreground"}`} />
                  <span className={hasRFE ? "text-destructive" : "text-accent-foreground"}>
                    In Progress ({pendingPetitions.length})
                  </span>
                </div>
                {pendingPetitions.map((petition) => (
                  <PetitionStatusCard
                    key={petition.id}
                    petition={petition}
                    isCurrent={false}
                    currentPetition={currentPetition}
                    linkedLCA={findLinkedLCA(petition)}
                    lcaHistory={lcaHistory}
                    isEditing={isEditing}
                    hasOtherPetitions={validPetitions.length > 1}
                    candidateEmail={candidateEmail}
                    candidateId={candidateId}
                    onAction={handlePetitionAction}
                    onI797DataExtracted={onI797DataExtracted}
                    onSaveI797={onSaveI797}
                    onRefreshData={onRefreshData}
                    onPetitionChange={onPetitionChange}
                    onLinkLCA={onLinkLCA}
                  />
                ))}
              </div>
            )}

            {/* 2. Current Petition */}
            {currentPetition && (
              <PetitionStatusCard
                petition={currentPetition}
                isCurrent={true}
                currentPetition={currentPetition}
                linkedLCA={findLinkedLCA(currentPetition)}
                lcaHistory={lcaHistory}
                isEditing={isEditing}
                hasOtherPetitions={validPetitions.length > 1}
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onAction={handlePetitionAction}
                onI797DataExtracted={onI797DataExtracted}
                onSaveI797={onSaveI797}
                onRefreshData={onRefreshData}
                onPetitionChange={onPetitionChange}
                onLinkLCA={onLinkLCA}
              />
            )}

            {/* "Have a pending petition?" toggle */}
            {!existingPendingPetitions && currentPetition && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Have a pending petition?</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddPetitionModal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Pending Petition
                </Button>
              </div>
            )}

            {/* 3. Previous Petitions (Collapsible) */}
            {previousPetitions.length > 0 && (
              <Collapsible open={showPreviousPetitions} onOpenChange={setShowPreviousPetitions}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                    {showPreviousPetitions ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Previous Petitions ({previousPetitions.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="!space-y-2 pt-3">
                  {previousPetitions.map((petition) => (
                    <PetitionStatusCard
                      key={petition.id}
                      petition={petition}
                      isCurrent={false}
                      currentPetition={currentPetition}
                      linkedLCA={findLinkedLCA(petition)}
                      lcaHistory={lcaHistory}
                      isEditing={isEditing}
                      hasOtherPetitions={validPetitions.length > 1}
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onAction={handlePetitionAction}
                      onI797DataExtracted={onI797DataExtracted}
                      onSaveI797={onSaveI797}
                      onRefreshData={onRefreshData}
                      onPetitionChange={onPetitionChange}
                      onLinkLCA={onLinkLCA}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}

        {/* Petition Documents */}
        {petitionDocuments && petitionDocuments.length > 0 && (
          <>
            {/* <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Petition Documents ({petitionDocuments.length})
                </span>
              </div>
              <div className="!space-y-2">
                {petitionDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1 w-full">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex items-center gap-1 text-xs text-[#7c3bed]
            bg-transparent hover:underline flex-1 text-left min-w-0"
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{doc.file_name || doc.doc_name}</span>
                    </button>

                    <button
                      onClick={() => handleView(doc)}
                      disabled={loadingDocId === doc.document_id}
                      className="flex-shrink-0 text-muted-foreground bg-transparent hover:text-[#7c3bed] transition-colors disabled:opacity-50"
                    >
                      {loadingDocId === doc.document_id && viewerLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={loadingDocId === doc.document_id}
                      className="flex-shrink-0 text-muted-foreground bg-transparent hover:text-[#7c3bed] transition-colors disabled:opacity-50"
                    >
                      {loadingDocId === doc.document_id && !viewerLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {viewerDoc?.base64 && (
                <div className="p-0 mt-2">
                  <FilePreview
                    fileType={viewerDoc?.type}
                    base64File={viewerDoc?.base64}
                    setBase64File={() => setViewerDoc(null)}
                    setFileType={() => setViewerDoc(null)}
                    docObject={{ file_name: viewerDoc.name }}
                  />
                </div>
              )}
            </div> */}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* LCA History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div className="text-[16px] font-semibold text-gray-900"> LCA History </div>
            <Badge variant="secondary" className="text-xs">
              {lcaHistory.length}
            </Badge>
          </div>
          <div className="!space-x-2">
            <SmartUploadButton
              documentType="lca"
              label="Smart Upload LCA"
              candidateEmail={candidateEmail}
              candidateId={candidateId}
              onDataExtracted={onLCADataExtracted}
              onRawDataExtracted={onSaveLCA ? handleSaveLCAFromSmartUpload : undefined}
              onRefreshData={onRefreshData}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            />
            {onAddLCA && (
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddLCA}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add LCA
              </Button>
            )}
          </div>
        </div>

        {/* Current LCA */}
        {currentLCA ? (
          <LCAHistoryCard
            lca={currentLCA}
            isCurrent={true}
            isEditing={isEditing}
            hasOtherLCAs={lcaHistory.length > 1}
            onChange={onLCAChange}
            onDelete={onDeleteLCA}
            viewerLoading={viewerLoading}
            setViewerLoading={setViewerLoading}
            onLCADataExtracted={onLCADataExtracted}
            onSaveLCA={onSaveLCA ? handleSaveLCAFromSmartUpload : undefined}
            onRefreshData={onRefreshData}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            documents={getDocumentsForLCA(currentLCA)}
            onViewDocument={onViewDocument}
            fileLoader={fileLoader}
          />
        ) : (
          <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium mb-1">No LCA Data</p>
            <p className="text-xs mb-4">Upload an LCA (Form 9035) to track labor conditions</p>
            <div className="flex flex-col items-center gap-2">
              {candidateEmail && onLCADataExtracted && (
                <SmartUploadButton
                  documentType="lca"
                  label="Smart Upload LCA"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onLCADataExtracted}
                  onRawDataExtracted={onSaveLCA ? handleSaveLCAFromSmartUpload : undefined}
                  onRefreshData={onRefreshData}
                  variant="default"
                />
              )}
              {onAddLCA && (
                <Button variant="outline" size="sm" onClick={onAddLCA}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Manually
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Previous LCAs (Collapsible) */}
        {previousLCAs.length > 0 && (
          <Collapsible open={showPreviousLCAs} onOpenChange={setShowPreviousLCAs}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full h-9 px-3 rounded-[10px] text-sm font-medium bg-transparent duration-200 text-[#67677e] hover:!bg-[#3c83f6] hover:!text-[#fff] focus:outline-none mt-2"
              >
                {showPreviousLCAs ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                Previous LCAs ({previousLCAs.length})
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="!space-y-2 pt-2">
              {previousLCAs.map((lca) => (
                <LCAHistoryCard
                  key={lca.id}
                  lca={lca}
                  isCurrent={false}
                  isEditing={isEditing}
                  hasOtherLCAs={lcaHistory.length > 1}
                  onChange={onLCAChange}
                  onDelete={onDeleteLCA}
                  onSetAsCurrent={handleSetActiveLCA}
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  documents={getDocumentsForLCA(lca)}
                  onViewDocument={onViewDocument}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Add Petition Options Modal */}
      <AddPetitionOptionsModal
        open={showAddPetitionModal}
        onOpenChange={setShowAddPetitionModal}
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        lcaHistory={lcaHistory}
        onI797DataExtracted={onI797DataExtracted}
        onSaveI797={onSaveI797}
        onRefreshData={onRefreshData}
        onManualPendingSubmit={handleManualPendingSubmit}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
