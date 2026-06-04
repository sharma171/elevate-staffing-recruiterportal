import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { uploadDocument } from "../../../utils/immigrationDocumentsApiService";
import { toast } from "react-toastify";

export function UploadDocumentModal({
  open,
  onOpenChange,
  documentTypes,
  onUpload,
  candidateEmail,
  section = "immigration",
  onSuccess,
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isResume, setIsResume] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.success("Please upload a PDF or image file (JPG, PNG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Maximum file size is 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !docType) {
      toast.error("Please select a file and document type");
      return;
    }
    setUploading(true);
    try {
      const metadata = {
        doc_type: docType,
        doc_category: section,
        file_desc: description || undefined,
        doc_validfrom: validFrom || undefined,
        doc_expiry: expiryDate || undefined,
        is_resume: isResume ? "yes" : "no",
      };

      if (candidateEmail) {
        const response = await uploadDocument(candidateEmail, selectedFile, metadata);
        if (!response.success) throw new Error(response.error || "Upload failed");
        toast.success("Document has been uploaded successfully");
        onSuccess?.();
      } else if (onUpload) {
        await onUpload(selectedFile, docType, expiryDate || undefined, metadata);
        // toast.success("Document has been uploaded successfully");
      }
      handleClose();
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocType("");
    setDescription("");
    setValidFrom("");
    setExpiryDate("");
    setIsResume(false);
    onOpenChange(false);
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Immigration Document
          </DialogTitle>
          <DialogDescription>
            Upload a document for immigration compliance. Supported formats: PDF, JPG, PNG (max 5MB)
          </DialogDescription>
        </DialogHeader>
        <div className="!space-y-4 !py-4">
          <div className="!space-y-2">
            <Label>Document File *</Label>
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <FileText className="h-4 w-4 text-#67677e flex-shrink-0" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-[#e7e7ef] rounded-md p-6 text-center cursor-pointer hover:border-[#7c3bed]/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
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
            <Label>Document Type *</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description (optional)"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Valid From</Label>
            <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-resume" checked={isResume} onCheckedChange={(checked) => setIsResume(checked === true)} />
            <Label htmlFor="is-resume" className="text-sm font-normal cursor-pointer">
              This is a resume/CV
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || !docType || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
