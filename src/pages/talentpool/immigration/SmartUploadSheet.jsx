import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../components/ui/sheet";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Sparkles, Upload, FileText, Loader2, Search, FolderOpen, Check } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { getFilesList, downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";

const DOC_TYPE_PATTERNS = {
  i20: ["i20", "i-20", "I-20", "I20"],
  ead_card: ["ead", "EAD"],
  ead: ["ead", "EAD"],
  i983: ["i983", "i-983", "I-983", "I983"],
  lca: ["lca", "LCA", "eta-9035", "ETA9035", "ETA-9035"],
  h1b_approval: ["i797", "i-797", "I-797", "I797", "h1b", "H-1B", "H1B"],
  i797: ["i797", "i-797", "I-797", "I797"],
  passport: ["passport", "Passport"],
  i94: ["i94", "i-94", "I-94", "I94"],
  visa_stamp: ["visa", "Visa"],
  visa: ["visa", "Visa"],
  gc_card: ["green_card", "gc_card", "GC", "green card", "greencard"],
  green_card: ["green_card", "gc_card", "GC", "green card", "greencard"],
  perm_certification: ["perm", "PERM"],
  i140_approval: ["i140", "i-140", "I-140", "I140"],
};

function filterFilesByDocType(files, docType) {
  if (!docType || docType === "auto") return files;
  const patterns = DOC_TYPE_PATTERNS[docType] || [docType];
  return files.filter((f) => {
    const name = (f.file_name || f.doc_name || "").toLowerCase();
    return patterns.some((p) => name.includes(p.toLowerCase()));
  });
}

const mimeTypeMap = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

const base64ToFile = (base64, filename, mimeType = "application/octet-stream") => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  } catch (e) {
    console.error("Error converting base64 to file", e);
    return null;
  }
};

export function SmartUploadSheet({ open, onOpenChange, onFileSelect, documentType, docTypeInfo, candidateEmail }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (!candidateEmail || !open) return;
    let cancelled = false;
    setCurrentPage(1);

    async function fetchFiles() {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getFilesList(candidateEmail);
        if (cancelled) return;

        if (result.success && result.files) {
          setFiles(result.files);
        } else {
          setFetchError(result.error || "Failed to fetch documents");
        }
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [candidateEmail, open]);

  useEffect(() => {
    let results = files;
    // let results = filterFilesByDocType(files, documentType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter((f) => (f.file_name || "").toLowerCase().includes(q));
    }
    setFilteredFiles(results);
    setCurrentPage(1);
  }, [files, documentType, searchQuery]);

  const handleSelectExistingFile = async (file) => {
    if (downloading) return;
    setSelectedFile(file.file_name);
    setDownloading(file.file_name);

    try {
      const result = await downloadDocument(candidateEmail, file.file_name);
      if (result.success && result.files && result.files.length > 0) {
        const downloaded = result.files[0];
        let mimeType;
        localStorage.setItem("fileChoosen", file.file_name);
        if (downloaded.file_extension && downloaded.file_extension.includes("/")) {
          mimeType = downloaded.file_extension;
        } else {
          const extension = downloaded.file_extension || downloaded.file_name?.split(".").pop()?.toLowerCase();
          mimeType = mimeTypeMap[extension] || "application/octet-stream";
        }
        const fileObject = base64ToFile(downloaded.base64, downloaded.file_name, mimeType);

        if (fileObject) {
          onFileSelect(fileObject);
        } else {
          onFileSelect(null);
          setSelectedFile(null);
        }
      } else {
        onFileSelect(null);
        setSelectedFile(null);
      }
    } catch {
      onFileSelect(null);
      setSelectedFile(null);
    } finally {
      setDownloading(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const renderExistingFiles = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 py-4 justify-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading existing documents...
        </div>
      );
    }

    if (fetchError) {
      return null;
    }

    if (files.length === 0) {
      return <div className="text-center py-4 text-sm text-muted-foreground">No existing documents found.</div>;
    }

    const totalPages = Math.ceil(filteredFiles.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentFiles = filteredFiles.slice(startIndex, endIndex);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Select from existing</span>
          <span className="ml-1 text-xs text-muted-foreground tabular-nums">({filteredFiles.length} found)</span>
        </div>

        {files.length > 5 && (
          <div className="relative d-flex align-items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        )}

        {filteredFiles.length > 0 ? (
          <div className="space-y-2">
            {currentFiles.map((file) => {
              const isSelected = false;
              // const isSelected = selectedFile === file.file_name;
              const isDownloading = downloading === file.file_name;
              const docType = file.doc_type || file.immigration_doc_type || "";

              return (
                <button
                  key={file.file_name}
                  type="button"
                  disabled={!!downloading}
                  onClick={() => handleSelectExistingFile(file)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-sm transition-all duration-150 ring-1
                    ${isSelected ? "bg-[#763bed]/10 ring-[#763bed]/30 font-medium" : "hover:bg-muted/70 bg-white active:bg-muted ring-[#e7e7ef]"}
                    ${downloading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#763bed] flex-shrink-0" />
                  ) : isSelected ? (
                    <Check className="h-3.5 w-3.5 text-[#763bed] flex-shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="truncate flex-1" title={file.file_name}>
                    {file.file_name}
                  </span>
                  {docType && (
                    <span className="ml-auto flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
                      {docType}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2 text-center">No matching documents found.</p>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm px-4">{`Page ${currentPage} of ${totalPages}`}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#7c3bed]" />
            {`Smart Upload ${docTypeInfo?.name || documentType}`}
          </SheetTitle>
          <SheetDescription>
            {`Select an existing ${docTypeInfo?.name.replace("_", " ") || documentType.replace("_", " ")} or upload a new one for AI-powered data extraction.`}
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-4">
          {renderExistingFiles()}

          <div className="relative my-3">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </div>

          <div>
            <div
              className="border-2 border-dashed border-[#e7e6ee] rounded-lg p-8 text-center cursor-pointer hover:!border-[#b99ff1] transition-colors block"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Upload new document</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Alert className="relative w-full rounded-xl border p-[16px] !border-[#ded1f9] !bg-[#f8f5fd]">
            <Sparkles className="h-4 w-4 text-[#7c3bed] absolute left-4 top-[19px] !text-[#020118]" />
            <AlertDescription className="pl-7 text-sm font-semibold">
              AI will automatically extract data from the selected document.
            </AlertDescription>
          </Alert>
        </div>
      </SheetContent>
    </Sheet>
  );
}
