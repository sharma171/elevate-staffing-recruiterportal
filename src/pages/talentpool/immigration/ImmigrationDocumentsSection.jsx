import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { COMMON_DOCUMENTS, H1B_DOCUMENTS, OPT_DOCUMENTS, H4_DOCUMENTS, GC_DOCUMENTS } from "./constants";
import { verifyDocument } from "../../../utils/immigrationApiService";
import { toast } from "react-toastify";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { SmartUploadDocumentModal } from "./SmartUploadDocumentModal";
import { SectionDocumentsList } from "./SectionDocumentsList";
import { GENERAL_DOC_TYPES } from "./documentTypes";

import { useAuth } from "../../../authContext";
import { axiosApi } from "../../../components";

const BASE_URL = "https://us-east1-recruiterportal.cloudfunctions.net/documents_upload_determine_type_v3";

export function ImmigrationDocumentsSection({
  documents: propDocuments,
  visaType,
  isEditing,
  onChange,
  onRefresh,
  candidateEmail,
  candidateId,
  onDataExtracted,
  accessLevel = "Full Access",
}) {
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [smartUploadModalOpen, setSmartUploadModalOpen] = useState(false);

  const documents = propDocuments;

  const { user } = useAuth();
  const AdminEmailID = user?.email;

  const getRequiredDocuments = () => {
    const common = [...COMMON_DOCUMENTS];
    switch (visaType) {
      case "H1B":
      case "H1B1":
        return [...common, ...H1B_DOCUMENTS];
      case "OPT":
      case "STEM_OPT":
      case "F1":
      case "CPT":
        return [...common, ...OPT_DOCUMENTS];
      case "H4":
      case "H4_EAD":
        return [...common, ...H4_DOCUMENTS];
      case "GC":
        return [...common, ...GC_DOCUMENTS];
      default:
        return common;
    }
  };

  const requiredDocs = getRequiredDocuments();
  const uploadedDocTypes = new Set(documents.map((d) => d.doc_type));
  const missingRequired = requiredDocs.filter((d) => d.required && !uploadedDocTypes.has(d.code));

  const handleVerify = async (doc) => {
    setVerifyingId(doc.document_id);
    try {
      const response = await verifyDocument(parseInt(doc.document_id), "verified");
      if (response.success) {
        toast.success("Document verified successfully");
        onRefresh?.();
      } else {
        throw new Error(response.message || "Failed to verify document");
      }
    } catch (error) {
      toast.error("Failed to verify document.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingDoc || !rejectionReason.trim()) return;
    setVerifyingId(rejectingDoc.document_id);
    try {
      const response = await verifyDocument(parseInt(rejectingDoc.document_id), "rejected", rejectionReason);
      if (response.success) {
        toast.success("Document rejected");
        setRejectDialogOpen(false);
        setRejectingDoc(null);
        setRejectionReason("");
        onRefresh?.();
      } else {
        throw new Error(response.message || "Failed to reject document");
      }
    } catch (error) {
      toast.error("Failed to reject document.");
    } finally {
      setVerifyingId(null);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadDocument = async (file, docType, expiryDate, metadata) => {
    const base64 = await toBase64(file);
    let newMetaOBJ = {};

    newMetaOBJ.emailid = AdminEmailID;
    newMetaOBJ.email_id = candidateEmail;

    newMetaOBJ.files = [
      {
        ...metadata,
        file_name: file.name || "",
        file_content: base64,
        document_type: metadata?.doc_type,
      },
    ];

    await axiosApi
      .post(BASE_URL, newMetaOBJ)
      .then((res) => {
        toast.success(res.message);
        onRefresh?.();
      })

      .catch((err) => {
        toast.error(err.error || err?.response?.data?.message || "Failed to upload document");
      });
  };

  const handleSmartUploadComplete = (newDoc, extractedData) => {
    onChange([...documents, newDoc]);
    if (extractedData && onDataExtracted && newDoc.doc_type) {
      onDataExtracted(newDoc.doc_type.toLowerCase(), extractedData);
    }
  };

  const isFullAccess = accessLevel === "Full Access";

  return (
    <div className="!space-y-4">
      {accessLevel === "Resume Only" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You have Resume Only access. Some documents and actions are restricted.</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Total Documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Verified</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-[#7c3bed]">
              {documents.filter((d) => d.status === "verified").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Pending Review</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-secondary-foreground">
              {documents.filter((d) => d.status === "uploaded").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Missing Required</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-400">{missingRequired.length}</div>
          </CardContent>
        </Card>
      </div>
      {missingRequired.length > 0 && (
        <Card className="!border-[#ef44444d] border-solid p-[6px] !bg-[#ef44440d]">
          <CardHeader className="pb-0">
            <CardTitle className="!text-sm !font-medium !text-[#ef4444] flex !items-center !gap-2">
              <AlertTriangle className="h-4 w-4" /> Missing Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingRequired.map((doc) => (
                <Badge key={doc.code} variant="outline" className="!bg-white">
                  {doc.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5" /> Immigration Documents
            </CardTitle>
            <CardDescription>Uploaded documents and their verification status</CardDescription>
          </div>
          {isFullAccess && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-1" /> Simple Upload
              </Button>
              {/* <Button size="sm" onClick={() => setSmartUploadModalOpen(true)}>
                <Sparkles className="h-4 w-4 mr-1" /> Smart Upload
              </Button> */}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {candidateEmail ? (
            <SectionDocumentsList
              documents={documents}
              sectionName="General Documents"
              sectionCode="general"
              documentTypes={GENERAL_DOC_TYPES}
              candidateEmail={candidateEmail}
              isEditing={isEditing}
              accessLevel={accessLevel}
              onRefresh={onRefresh}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Candidate email not available. Cannot load documents.
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. The candidate will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || verifyingId !== null}
            >
              {verifyingId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Rejecting...
                </>
              ) : (
                "Reject Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        documentTypes={GENERAL_DOC_TYPES}
        onUpload={handleUploadDocument}
        section="immigration"
      />
      <SmartUploadDocumentModal
        open={smartUploadModalOpen}
        onOpenChange={setSmartUploadModalOpen}
        candidateEmail={candidateEmail || ""}
        candidateId={candidateId}
        onUploadComplete={handleSmartUploadComplete}
        onDataExtracted={onDataExtracted}
      />
    </div>
  );
}
