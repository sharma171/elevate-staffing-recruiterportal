// Context-aware action buttons for petition cards
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Trash2, ArrowUpCircle, Eye, Loader2 } from "lucide-react";
import { SmartUploadButton } from "../SmartUploadButton";

export function PetitionActions({
  petition,
  isCurrent,
  isEditing = false,
  hasOtherPetitions = false,
  candidateEmail,
  candidateId,
  onAction,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
}) {
  const isPending = petition.status === "pending";
  const isRFE = petition.status === "rfe";
  const isApproved = petition.status === "approved";
  const isInProgress = isPending || isRFE;
  const hasDocument = !!petition.document_file_name;

  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {hasDocument && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              onAction("viewDoc", petition);
              setViewerLoading(true);
            }}
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
            View Doc
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onAction("delete", petition)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasDocument && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            onAction("viewDoc", petition);
            setViewerLoading(true);
          }}
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
          View I-797
        </Button>
      )}
      {/* {isInProgress && candidateEmail && onI797DataExtracted && (
        <SmartUploadButton
          documentType="h1b_approval"
          label="Upload Approval"
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onDataExtracted={onI797DataExtracted}
          onRawDataExtracted={onSaveI797}
          onRefreshData={onRefreshData}
          size="sm"
          variant="default"
          className="h-7 text-xs bg-primary"
        />
      )} */}
      {isCurrent && isApproved && candidateEmail && onI797DataExtracted && (
        <SmartUploadButton
          documentType="h1b_approval"
          label="Upload New I-797"
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onDataExtracted={onI797DataExtracted}
          onRawDataExtracted={onSaveI797}
          onRefreshData={onRefreshData}
          size="sm"
          variant="outline"
          className="h-7 text-xs"
        />
      )}
      {!isCurrent && isApproved && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
          onClick={() => onAction("setActive", petition)}
        >
          <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
          Set as Current
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onAction("delete", petition)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
