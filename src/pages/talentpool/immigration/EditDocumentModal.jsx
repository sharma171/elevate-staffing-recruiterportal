import { useState, useEffect } from "react";
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
import { Loader2, Pencil } from "lucide-react";

export function EditDocumentModal({ open, onOpenChange, document, documentTypes, onSave, isSaving = false }) {
  const [docType, setDocType] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [empView, setEmpView] = useState(true);

  useEffect(() => {
    if (document) {
      setDocType(document.doc_type || "");
      setDescription(document.file_desc || document.doc_name || "");
      setValidFrom(document.valid_from || document.doc_validfrom || "");
      setExpiryDate(document.expiry_date || document.doc_expiry || "");
      setEmpView(document.emp_view !== false);
    }
  }, [document]);

  const handleSave = async () => {
    await onSave({
      doc_type: docType,
      file_desc: description,
      doc_validfrom: validFrom || undefined,
      doc_expiry: expiryDate || undefined,
      emp_view: empView,
    });
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" /> Edit Document
          </DialogTitle>
          <DialogDescription>
            Update document metadata for "{document.doc_name || document.file_name}"
          </DialogDescription>
        </DialogHeader>
        <div className="!space-y-4 py-4">
          <div className="!space-y-2">
            <Label>Document Type</Label>
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
          <div className="!space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description..."
              rows={2}
            />
          </div>
          <div className="!space-y-2">
            <Label>Valid From</Label>
            <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </div>
          <div className="!space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="emp-view" checked={empView} onCheckedChange={(checked) => setEmpView(checked === true)} />
            <Label htmlFor="emp-view" className="text-sm font-normal cursor-pointer">
              Visible to Employee
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
