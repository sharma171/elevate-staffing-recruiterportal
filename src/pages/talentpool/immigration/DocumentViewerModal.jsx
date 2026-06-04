import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Download, X, FileText, Image, Loader2 } from "lucide-react";

export function DocumentViewerModal({ open, onOpenChange, document, onDownload, isLoading = false }) {
  if (!document) return null;

  const isPDF = document.type === "application/pdf" || document.name.endsWith(".pdf");
  const isImage =
    document.type.startsWith("image/") ||
    document.name.endsWith(".jpg") ||
    document.name.endsWith(".jpeg") ||
    document.name.endsWith(".png");

  const getDisplayUrl = () => {
    if (document.url) return document.url;
    if (document.base64) {
      const mimeType = isPDF ? "application/pdf" : document.type;
      return `data:${mimeType};base64,${document.base64}`;
    }
    return null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPDF ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />}
            {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded-md border bg-muted/20">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                <p>Loading document...</p>
              </div>
            </div>
          ) : displayUrl ? (
            isPDF ? (
              <iframe src={displayUrl} className="w-full h-full border-0" title={document.name} />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={displayUrl} alt={document.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Preview not available for this file type</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Document preview not available</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
          <Button onClick={onDownload} disabled={isLoading || !displayUrl}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
