import { useState, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Pencil,
  FileEdit,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getDocumentTypeName } from "./documentTypes";
import {
  downloadDocument,
  deleteDocument,
  updateDocumentMetadata,
  renameDocument,
  getExpiryStatus,
  formatDocumentDate,
} from "../../../utils/immigrationDocumentsApiService";

import { EditDocumentModal } from "./EditDocumentModal";
import { RenameDocumentModal } from "./RenameDocumentModal";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { toast } from "react-toastify";
import FilePreview from "../../benchcandidate/FilePreview";

export function SectionDocumentsList({
  documents,
  sectionName,
  sectionCode = "general",
  documentTypes,
  candidateEmail,
  isEditing,
  accessLevel,
  onRefresh,
  compact = false,
  onUpload,
}) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const visibleDocuments =
    accessLevel === "Resume Only"
      ? documents.filter((doc) => doc.is_resume === "yes" || doc.is_resume === true)
      : documents;

  const totalPages = Math.ceil(visibleDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = visibleDocuments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginationRange = useMemo(() => {
    const getPaginationRange = (totalPages, currentPage, siblingCount = 1) => {
      const totalPageNumbers = siblingCount + 5;

      if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i,
        );
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
      }
    };
    return getPaginationRange(totalPages, currentPage) || [];
  }, [totalPages, currentPage]);

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
        return toast.error(file.base64);
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

  const handleDownload = async (doc) => {
    const fileName = doc.file_name || doc.doc_name;
    if (!fileName) return;
    setLoadingDocId(doc.document_id);
    try {
      const response = await downloadDocument(candidateEmail, fileName);
      if (!response.success || !response.files?.length) throw new Error(response.error || "Document not found");
      const file = response.files[0];
      if (file.file_url) {
        const link = document.createElement("a");
        link.href = file.file_url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloading ${fileName}...`);
      } else if (file.base64) {
        if (file.base64?.length > 200) {
          const mimeType = doc.mime_type || "application/octet-stream";
          const link = document.createElement("a");
          link.href = `data:${mimeType};base64,${file.base64}`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Downloading ${fileName}...`);
        } else {
          toast.error(file.base64);
        }
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download document");
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleEditSave = async (updates) => {
    if (!editingDoc) return;
    setIsSaving(true);
    try {
      const rowId = parseInt(editingDoc.document_id) || editingDoc.row_id;
      if (!rowId) throw new Error("Document ID not found");
      const response = await updateDocumentMetadata(candidateEmail, rowId, updates);
      if (!response.success) throw new Error(response.error || "Failed to update document");
      toast.success("Document updated successfully");
      setEditingDoc(null);
      await onRefresh();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameSave = async (newName) => {
    if (!renameDoc) return;
    const oldFileName = renameDoc.file_name || renameDoc.doc_name;
    if (!oldFileName) return;
    setIsRenaming(true);
    try {
      const rowId = parseInt(renameDoc.document_id) || renameDoc.row_id;
      if (!rowId) throw new Error("Document ID not found");
      const response = await renameDocument(candidateEmail, rowId, oldFileName, newName);
      if (!response.success) throw new Error(response.error || "Failed to rename document");
      toast.success("Document renamed successfully");
      setRenameDoc(null);
      await onRefresh();
    } catch (error) {
      console.error("Error renaming document:", error);
      toast(error instanceof Error ? error.message : "Failed to rename document");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    const fileName = deleteDoc.file_name || deleteDoc.doc_name;
    if (!fileName) return;
    setIsDeleting(true);
    try {
      const response = await deleteDocument(candidateEmail, fileName);
      if (!response.success) throw new Error(response.error || "Failed to delete document");
      toast.success("Document deleted successfully");
      setDeleteDoc(null);
      await onRefresh();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpload = async (file, docType, expiryDate) => {
    if (onUpload) await onUpload(file, docType, expiryDate);
    setUploadModalOpen(false);
  };

  const isFullAccess = accessLevel === "Full Access";

  const renderExpiryBadge = (expiryDate) => {
    const status = getExpiryStatus(expiryDate);
    if (status === "expired") return <Badge variant="destructive">Expired</Badge>;
    if (status === "expiring")
      return (
        <Badge variant="outline" className="bg-accent text-accent-foreground border-border">
          Expiring Soon
        </Badge>
      );
    return null;
  };

  if (visibleDocuments.length === 0 && !compact) {
    return (
      <div className=" !space-y-4">
        {accessLevel === "Resume Only" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>You have Resume Only access. Some documents and actions are restricted.</AlertDescription>
          </Alert>
        )}
        <div className="text-center py-8 border rounded-md bg-[#f1f1f980]/20">
          <FileText className="h-10 w-10 mx-auto text-[#67677e] mb-2" />
          <p className="text-[#67677e] mb-4">No documents uploaded for {sectionName}</p>
          {isFullAccess && onUpload && (
            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          )}
        </div>
        <UploadDocumentModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          documentTypes={documentTypes}
          onUpload={handleUpload}
        />
      </div>
    );
  }

  return (
    <div className=" !space-y-4">
      {accessLevel === "Resume Only" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You have Resume Only access. Some documents and actions are restricted.</AlertDescription>
        </Alert>
      )}
      {!compact && isFullAccess && onUpload && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      )}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              {!compact && <TableHead>Valid From</TableHead>}
              <TableHead>Expiry</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDocuments.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiry_date || doc.doc_expiry);
              const isLoading = loadingDocId === doc.document_id;
              return (
                <TableRow
                  key={doc.document_id}
                  className={
                    expiryStatus === "expired" ? "bg-red-500/5" : expiryStatus === "expiring" ? "bg-accent/50" : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#67677e] flex-shrink-0" />
                      <span
                        className="!font-medium !text-[#080118] truncate !max-w-[200px]"
                        title={doc.doc_name || doc.file_name}
                      >
                        {doc.doc_name || doc.file_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {doc.doc_type_label
                        ? doc.doc_type_label
                        : doc.doc_type && doc.doc_type !== "other" && doc.doc_type !== "immigration"
                          ? getDocumentTypeName(doc.doc_type) || doc.doc_type
                          : "Other Document"}
                    </span>
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <span className="text-sm">{formatDocumentDate(doc.valid_from || doc.doc_validfrom)}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${expiryStatus === "expired" ? "text-red-500 font-medium" : expiryStatus === "expiring" ? "text-orange-600 font-medium" : ""}`}
                      >
                        {formatDocumentDate(doc.expiry_date || doc.doc_expiry)}
                      </span>
                      {renderExpiryBadge(doc.expiry_date || doc.doc_expiry)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="!cursor-pointer" onClick={() => handleView(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="!cursor-pointer" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {isFullAccess && (
                          <>
                            <DropdownMenuItem className="!cursor-pointer" onClick={() => setEditingDoc(doc)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="!cursor-pointer" onClick={() => setRenameDoc(doc)}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDoc(doc)}
                              className="text-red-500 focus:text-red-500 !cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {paginationRange.map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <PaginationItem key={index}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {viewerDoc?.base64 && (
        <div className="p-0">
          <FilePreview
            fileType={viewerDoc?.type}
            base64File={viewerDoc?.base64}
            setBase64File={() => setViewerDoc(false)}
            setFileType={() => setViewerDoc(false)}
            docObject={{ file_name: viewerDoc.name }}
          />
        </div>
      )}
      <EditDocumentModal
        open={!!editingDoc}
        onOpenChange={(open) => !open && setEditingDoc(null)}
        document={editingDoc}
        documentTypes={documentTypes}
        onSave={handleEditSave}
        isSaving={isSaving}
      />
      <RenameDocumentModal
        open={!!renameDoc}
        onOpenChange={(open) => !open && setRenameDoc(null)}
        document={renameDoc}
        onRename={handleRenameSave}
        isRenaming={isRenaming}
      />
      {deleteDoc ? (
        <div className="signatureContainer">
          <AlertDialog open={!!deleteDoc} onOpenChange={(open) => !open && setDeleteDoc(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deleteDoc?.doc_name || deleteDoc?.file_name}"? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-red-500 text-red-500 hover:red-500/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <></>
      )}
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        documentTypes={documentTypes}
        candidateEmail={candidateEmail}
        section={sectionCode}
        onSuccess={async () => {
          setUploadModalOpen(false);
          await onRefresh();
        }}
        onUpload={onUpload}
      />
    </div>
  );
}
