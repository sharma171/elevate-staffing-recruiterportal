import { useState, useCallback, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { ChevronDown, ChevronRight, CreditCard, Users, Trash2, Eye, Loader2 } from "lucide-react";
import { EAD_STATUSES, getEADStatusLabel } from "./types/opt-records";
import { toast } from "react-toastify";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import FilePreview from "../../benchcandidate/FilePreview";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export function PreviousH4EADHistorySection({
  eadRecords = [],
  isEditing = false,
  onDeleteEAD,
  onEADChange,
  candidateEmail,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  const h4EadRecords = eadRecords.filter((e) => e.ead_category === "C26");

  const handleViewPetitionDocument = useCallback(
    async (fileName) => {
      if (!candidateEmail || !fileName) {
        toast.error("Cannot view document - missing information");
        return;
      }
      setViewerLoading(true);
      try {
        const response = await downloadDocument(candidateEmail, fileName);
        if (!response.success || !response.files?.length) {
          throw new Error(response.error || "Document not found");
        }
        const file = response.files[0];
        if (file.base64?.length < 200) {
          return toast.error(file.base64);
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
        setViewerLoading(false);
      }
    },
    [candidateEmail],
  );

  const renderFilePreview = () => {
    if (!viewerDoc?.base64) return null;
    return (
      <div className="p-0">
        <FilePreview
          fileType={viewerDoc?.type}
          base64File={viewerDoc?.base64}
          setBase64File={() => setViewerDoc(null)}
          setFileType={() => setViewerDoc(null)}
          docObject={{ file_name: viewerDoc.name }}
        />
      </div>
    );
  };

  if (h4EadRecords.length === 0) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/30 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Previous H-4 EAD History</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                {h4EadRecords.length} EAD{h4EadRecords.length > 1 ? "s" : ""}
              </span>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-3 px-1">
          {h4EadRecords.map((ead) => {
            const daysUntilExpiry = getDaysUntilExpiry(ead.card_expiry_date);
            const isExpired = ead.status === "expired" || (daysUntilExpiry !== null && daysUntilExpiry < 0);
            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

            const fileName = ead?.document_file_name || ead?.document?.file_name || ead?.document || ead?.file_name;
            const hasViewableDocument = Boolean(fileName);

            const handleViewDocument = () => {
              if (!hasViewableDocument) return;
              handleViewPetitionDocument(fileName);
            };

            if (isEditing) {
              return (
                <Card key={ead.id} className="p-4 border-muted bg-muted/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        PREVIOUS
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Edit Mode
                      </Badge>
                    </div>
                    <div className="space-x-2 flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 text-xs ${!hasViewableDocument ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleViewDocument}
                        disabled={!hasViewableDocument}
                      >
                        {viewerLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                          </>
                        )}
                        View EAD
                      </Button>
                      {onDeleteEAD && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteEAD(ead.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Card Number
                      </label>
                      <Input
                        type="text"
                        value={ead.ead_number || ""}
                        onChange={(e) => onEADChange?.({ ...ead, ead_number: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="SRC-XX-XXX-XXXXX"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Category
                      </label>
                      <Input
                        type="text"
                        value={ead.ead_category || "C26"}
                        onChange={(e) => onEADChange?.({ ...ead, ead_category: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="C26"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Status
                      </label>
                      <Select value={ead.status || ""} onValueChange={(v) => onEADChange?.({ ...ead, status: v })}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {EAD_STATUSES.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        A-Number
                      </label>
                      <Input
                        type="text"
                        value={ead.a_number || ""}
                        onChange={(e) => onEADChange?.({ ...ead, a_number: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="A123456789"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Card Holder Name
                      </label>
                      <Input
                        type="text"
                        value={ead.card_holder_name || ""}
                        onChange={(e) => onEADChange?.({ ...ead, card_holder_name: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Valid From
                      </label>
                      <Input
                        type="date"
                        value={ead.card_valid_from || ead.card_issue_date || ""}
                        onChange={(e) => onEADChange?.({ ...ead, card_valid_from: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        value={ead.card_expiry_date || ""}
                        onChange={(e) => onEADChange?.({ ...ead, card_expiry_date: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </Card>
              );
            }

            const statusVariant =
              ead.status === "active" && !isExpired
                ? "default"
                : ead.status === "pending"
                  ? "secondary"
                  : "destructive";

            return (
              <Card key={ead.id} className={`p-4 border-muted ${isExpired ? "border-destructive/50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{ead.ead_number || "H-4 EAD Card"}</span>
                    <Badge variant={statusVariant} className="text-xs">
                      {isExpired ? "Expired" : getEADStatusLabel(ead.status)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {ead.ead_category || "C26"}
                    </Badge>
                    {isExpiringSoon && !isExpired && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Expires in {daysUntilExpiry} days
                      </Badge>
                    )}
                  </div>
                  <div className="space-x-2 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 text-xs ${!hasViewableDocument ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={handleViewDocument}
                      disabled={!hasViewableDocument}
                    >
                      {viewerLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                        </>
                      )}
                      View EAD
                    </Button>
                    {onDeleteEAD && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteEAD(ead.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {ead.card_holder_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Card Holder</p>
                      <p className="font-medium">{ead.card_holder_name}</p>
                    </div>
                  )}
                  {ead.a_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">A-Number</p>
                      <p className="font-medium">{ead.a_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Valid From</p>
                    <p className="font-medium">{formatDateSafe(ead.card_valid_from || ead.card_issue_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p
                      className={`font-medium ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : ""}`}
                    >
                      {formatDateSafe(ead.card_expiry_date)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
      {renderFilePreview()}
    </>
  );
}
