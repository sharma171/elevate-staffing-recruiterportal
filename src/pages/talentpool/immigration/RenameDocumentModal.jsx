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
import { Loader2, FileEdit } from "lucide-react";

export function RenameDocumentModal({ open, onOpenChange, document: doc, onRename, isRenaming = false }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (doc) {
      const fileName = doc.file_name || doc.doc_name || "";
      const lastDotIndex = fileName.lastIndexOf(".");
      if (lastDotIndex > 0) {
        setNewName(fileName.substring(0, lastDotIndex));
      } else {
        setNewName(fileName);
      }
      setError("");
    }
  }, [doc]);

  const getFileExtension = () => {
    const fileName = doc?.file_name || doc?.doc_name || "";
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
  };

  const handleRename = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError("File name cannot be empty");
      return;
    }
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      setError("File name contains invalid characters");
      return;
    }
    const extension = getFileExtension();
    await onRename(trimmedName + extension);
  };

  const handleClose = () => {
    setError("");
    onOpenChange(false);
  };

  if (!doc) return null;

  const extension = getFileExtension();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Rename Document
          </DialogTitle>
          <DialogDescription>Enter a new name for this document</DialogDescription>
        </DialogHeader>
        <div className=" !space-y-4 py-4">
          <div className="space-y-2">
            <Label>New File Name</Label>
            <div className="flex items-center gap-1">
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError("");
                }}
                placeholder="Enter file name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRenaming) handleRename();
                }}
              />
              {extension && (
                <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-2 rounded">{extension}</span>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
            {isRenaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Renaming...
              </>
            ) : (
              "Rename"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
