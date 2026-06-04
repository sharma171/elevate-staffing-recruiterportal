// Context-aware action buttons for petition cards (Plain JSX)
import React from "react";

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

  // Trash icon SVG
  const TrashIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const ArrowUpIcon = () => (
    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
      />
    </svg>
  );

  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {hasDocument && (
          <button
            className="inline-flex items-center px-2 py-1 text-xs rounded hover:bg-gray-100"
            onClick={() => onAction("viewDoc", petition)}
          >
            <EyeIcon />
            View Doc
          </button>
        )}
        <button
          className="inline-flex items-center justify-center h-7 w-7 rounded text-red-600 hover:bg-red-50"
          onClick={() => onAction("delete", petition)}
        >
          <TrashIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasDocument && (
        <button
          className="inline-flex items-center px-2 py-1 text-xs rounded hover:bg-gray-100"
          onClick={() => onAction("viewDoc", petition)}
        >
          <EyeIcon />
          View I-797
        </button>
      )}

      {/* Upload Approval I-797 - for pending/rfe petitions */}
      {isInProgress && candidateEmail && onI797DataExtracted && (
        <>
          <button
            className="inline-flex items-center px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => {
              // In your app, trigger the smart upload flow here
              // This is where SmartUploadButton would go
              alert("Trigger Smart Upload for h1b_approval");
            }}
          >
            Upload Approval
          </button>
        </>
      )}

      {/* Upload New I-797 - for current approved */}
      {isCurrent && isApproved && candidateEmail && onI797DataExtracted && (
        <button
          className="inline-flex items-center px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
          onClick={() => {
            alert("Trigger Smart Upload for new I-797");
          }}
        >
          Upload New I-797
        </button>
      )}

      {/* Set as Current */}
      {!isCurrent && isApproved && (
        <button
          className="inline-flex items-center px-2 py-1 text-xs rounded border border-green-300 text-green-700 hover:bg-green-50"
          onClick={() => onAction("setActive", petition)}
        >
          <ArrowUpIcon />
          Set as Current
        </button>
      )}

      {/* Delete */}
      <button
        className="inline-flex items-center justify-center h-7 w-7 rounded text-red-600 hover:bg-red-50"
        onClick={() => onAction("delete", petition)}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
