import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { toast } from "react-toastify";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Building, User, MapPin } from "lucide-react";
import { parseLCADocument } from "../../../utils/immigrationApiService";

export function LCAUploadModal({ open, onOpenChange, onDataExtracted, candidateEmail }) {
  const [uploadState, setUploadState] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size must be less than 5MB");
      setUploadState("error");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Only PDF and image files are accepted");
      setUploadState("error");
      return;
    }

    setSelectedFile(file);
    setUploadState("uploading");
    setErrorMessage("");

    try {
      const base64 = await fileToBase64(file);
      setUploadState("parsing");
      const response = await parseLCADocument(base64, file.name);
      if (response.success && response.data) {
        setExtractedData(response.data);
        setUploadState("review");
      } else {
        throw new Error(response.message || "Failed to parse LCA document");
      }
    } catch (error) {
      console.error("Error parsing LCA:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to parse LCA document");
      setUploadState("error");
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      handleClose();
      toast.success("The extracted data has been populated in the form. Please review and save.");
    }
  };

  const handleClose = () => {
    setUploadState("idle");
    setSelectedFile(null);
    setExtractedData(null);
    setErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Upload LCA Document
          </DialogTitle>
          <DialogDescription>
            Upload a certified LCA (Form ETA-9035) to automatically extract employer, worksite, and wage information.
          </DialogDescription>
        </DialogHeader>
        <div className="!space-y-4 py-4">
          {uploadState === "idle" && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors relative">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Click to upload LCA document</p>
              <p className="text-xs text-muted-foreground">PDF or image file, max 5MB</p>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
          {(uploadState === "uploading" || uploadState === "parsing") && (
            <div className="border rounded-lg p-8 text-center">
              <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium mb-1">
                {uploadState === "uploading" ? "Uploading document..." : "Extracting LCA data..."}
              </p>
              <p className="text-xs text-muted-foreground">{selectedFile?.name}</p>
            </div>
          )}
          {uploadState === "error" && (
            <div className="border border-destructive/50 rounded-lg p-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-sm font-medium text-destructive mb-1">Upload Failed</p>
              <p className="text-xs text-muted-foreground mb-4">{errorMessage}</p>
              <Button variant="outline" onClick={() => setUploadState("idle")}>
                Try Again
              </Button>
            </div>
          )}
          {uploadState === "review" && extractedData && (
            <div className="!space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Data extracted successfully</span>
              </div>
              <Separator />
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> LCA Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Case Number</span>
                      <span className="font-medium">{extractedData.lca_case_number || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Status</span>
                      <Badge variant="outline" className="mt-0.5">
                        {extractedData.lca_status || "Certified"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Validity Start</span>
                      <span>{extractedData.lca_validity_start || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Validity End</span>
                      <span>{extractedData.lca_validity_end || "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" /> Employer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Employer Name</span>
                      <span className="font-medium">{extractedData.employer_name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">FEIN</span>
                      <span>{extractedData.employer_fein || "—"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground block">Address</span>
                      <span>{extractedData.employer_address || "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Job & Wage Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Job Title</span>
                      <span className="font-medium">{extractedData.job_title || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">SOC Code</span>
                      <span>{extractedData.soc_code || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Wage Level</span>
                      <span>{extractedData.wage_level || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Prevailing Wage</span>
                      <span>
                        {extractedData.prevailing_wage ? `$${extractedData.prevailing_wage.toLocaleString()}` : "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {extractedData.worksites && extractedData.worksites.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Worksite Locations ({extractedData.worksites.length})
                    </h4>
                    <div className="!space-y-2">
                      {extractedData.worksites.map((site, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {site.is_primary && <Badge className="text-xs">Primary</Badge>}
                            <span className="font-medium">{site.worksite_name || "Worksite " + (idx + 1)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {[site.address_line1, site.city, site.state, site.zip_code].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {uploadState === "review" && (
            <Button onClick={handleConfirm}>
              <CheckCircle className="h-4 w-4 mr-2" /> Use Extracted Data
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
