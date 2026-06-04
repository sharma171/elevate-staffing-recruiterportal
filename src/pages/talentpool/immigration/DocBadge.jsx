import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { getDocumentExpiryStatus, formatDocDate, truncateFileName } from "./documentLinkingUtils";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { toast } from "react-toastify";
import FilePreview from "../../benchcandidate/FilePreview";
export function DocBadge({ doc, candidateEmail, compact = false, showExpiry = true, className = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);

  const fileName = doc.file_name || doc.doc_name;
  const expiryStatus = getDocumentExpiryStatus(doc);
  const expiryDate = doc.expiry_date || doc.doc_expiry;
  const uploadDate = doc.uploaded_at || doc.fileuploaded_datetime;

  const handleView = async (e) => {
    if (e) e.stopPropagation();
    if (!fileName || !candidateEmail) {
      toast.error("Cannot view document - missing information");
      return;
    }

    setIsLoading(true);
    try {
      const response = await downloadDocument(candidateEmail, fileName);
      if (!response.success || !response.files?.length) {
        throw new Error(response.error || "Document not found");
      }
      const file = response.files[0];
      if (file.base64?.length < 200) {
        toast.error(file.base64);
        return;
      }
      setViewerDoc({
        name: fileName,
        type: file.file_extension || "application/pdf",
        base64: file.base64,
      });
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    if (!fileName || !candidateEmail) return;
    setIsLoading(true);
    try {
      const response = await downloadDocument(candidateEmail, fileName);
      if (!response.success || !response.files?.length) throw new Error(response.error || "Document not found");
      const file = response.files[0];
      if (file.file_url) {
        window.open(file.file_url, "_blank");
      } else if (file.base64) {
        const mimeType = doc.mime_type || "application/octet-stream";
        const link = document.createElement("a");
        link.href = `data:${mimeType};base64,${file.base64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(error.message || "Failed to download document");
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryBadge = () => {
    if (!showExpiry || !expiryDate) return null;
    if (expiryStatus === "expired")
      return (
        <Badge variant="red-500" className="text-[10px] px-1.5 py-0">
          Expired
        </Badge>
      );
    if (expiryStatus === "expiring")
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 !bg-orange-50 !text-orange-700 !border-orange-200">
          Expiring Soon
        </Badge>
      );
    return null;
  };

  if (compact) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${expiryStatus === "expired" ? "!text-red-500" : expiryStatus === "expiring" ? "!text-orange-600" : "text-[#67677e]"} ${className}`}
                onClick={handleView}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px]">
              <div className="space-y-1">
                <p className="font-medium text-xs">{truncateFileName(fileName, 40)}</p>
                {uploadDate ? (
                  <p className="text-[10px] text-[#67677e]">
                    Uploaded: {formatDocDate(uploadDate.split("T")[0]) || "Unspecified"}
                  </p>
                ) : (
                  <>
                    <p className="text-[10px] text-[#67677e]">Uploaded: --</p>
                  </>
                )}
                {expiryDate ? (
                  <p
                    className={`text-[10px] ${expiryStatus === "expired" ? "!text-red-500" : expiryStatus === "expiring" ? "!text-orange-600" : "text-[#67677e]"}`}
                  >
                    Expires: {formatDocDate(expiryDate) || "Unspecified"}
                  </p>
                ) : (
                  <>
                    <p
                      className={`text-[10px] ${expiryStatus === "expired" ? "!text-red-500" : expiryStatus === "expiring" ? "!text-orange-600" : "text-[#67677e]"}`}
                    >
                      Expires: --
                    </p>
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {viewerDoc?.base64 && (
          <div className="p-0">
            <FilePreview
              fileType={viewerDoc.type}
              base64File={viewerDoc.base64}
              setBase64File={() => setViewerDoc(null)}
              setFileType={() => setViewerDoc(null)}
              docObject={{ file_name: viewerDoc.name }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border !bg-text-[#67677e]/30 hover:!bg-text-[#67677e]/50 transition-colors cursor-pointer ${expiryStatus === "expired" ? "!border-red-500/30 !bg-red-500/5" : expiryStatus === "expiring" ? "!border-orange-300 !bg-orange-100/50" : "border-border"} ${className}`}
        onClick={handleView}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#67677e]" />
        ) : (
          <FileText
            className={`h-4 w-4 flex-shrink-0 ${expiryStatus === "expired" ? "!text-red-500" : expiryStatus === "expiring" ? "!text-orange-600" : "!text-[#7c3bed]"}`}
          />
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium truncate max-w-[150px]">{truncateFileName(fileName, 20)}</span>
          {uploadDate && <span className="text-[10px] text-[#67677e]">{formatDocDate(uploadDate.split("T")[0])}</span>}
        </div>
        {getExpiryBadge()}
        <div className="flex items-center gap-0.5 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleView} disabled={isLoading}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDownload} disabled={isLoading}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {viewerDoc?.base64 && (
        <div className="p-0">
          <FilePreview
            fileType={viewerDoc.type}
            base64File={viewerDoc.base64}
            setBase64File={() => setViewerDoc(null)}
            setFileType={() => setViewerDoc(null)}
            docObject={{ file_name: viewerDoc.name }}
          />
        </div>
      )}
    </>
  );
}

export function DocBadgeInline({ doc, candidateEmail, className = "" }) {
  return <DocBadge doc={doc} candidateEmail={candidateEmail} compact showExpiry={false} className={className} />;
}
