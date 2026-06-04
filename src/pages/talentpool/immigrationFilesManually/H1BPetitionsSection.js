import React, { useState } from "react";
import { PetitionStatusCard, AddPetitionOptionsModal } from "./petition-status/index";
import LCAHistoryCard from "./LCAHistoryCard";
import SmartUploadButton from "./SmartUploadButton";

export function H1BPetitionsSection({
  petitions = [],
  lcaHistory = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddPetition,
  onDeletePetition,
  onSetActivePetition,
  onAddLCA,
  onDeleteLCA,
  onSetActiveLCA,
  onI797DataExtracted,
  onLCADataExtracted,
  onSaveI797,
  onSaveLCA,
  onRefreshData,
  onViewDocument,
  onManualPendingSubmit,
  onPetitionChange,
  onLCAChange,
  onLinkLCA,
  petitionDocuments,
  lcaDocuments,
  onDocumentsRefresh,
}) {
  const [showPreviousPetitions, setShowPreviousPetitions] = useState(false);
  const [showPreviousLCAs, setShowPreviousLCAs] = useState(false);
  const [showAddPetitionModal, setShowAddPetitionModal] = useState(false);

  const validPetitions = petitions.filter(
    (p) => p.status && ["approved", "pending", "rfe", "denied", "withdrawn"].includes(p.status),
  );
  const currentPetition = validPetitions.find((p) => p.is_current);
  const pendingPetitions = validPetitions.filter((p) => !p.is_current && ["pending", "rfe"].includes(p.status));
  const previousPetitions = validPetitions.filter((p) => !p.is_current && !["pending", "rfe"].includes(p.status));
  const currentLCA = lcaHistory.find((l) => l.is_current);
  const previousLCAs = lcaHistory.filter((l) => !l.is_current);

  const findLinkedLCA = (petition) =>
    petition.lca_id ? lcaHistory.find((l) => l.id === petition.lca_id) || null : null;
  const getDocumentsForLCA = (lca) =>
    !lcaDocuments || !lca.case_number
      ? []
      : lcaDocuments.filter((doc) =>
          (doc.file_name || doc.doc_name || "").toLowerCase().includes((lca.case_number || "").toLowerCase()),
        );

  const handlePetitionAction = async (action, petition) => {
    if (action === "delete") onDeletePetition?.(petition.id);
    else if (action === "setActive") await onSetActivePetition?.(petition.id);
    else if (action === "viewDoc" && petition.document_file_name) await onViewDocument?.(petition.document_file_name);
  };

  const hasNoPetitions = validPetitions.length === 0;
  const existingPendingPetitions = pendingPetitions.length > 0;
  const hasRFE = pendingPetitions.some((p) => p.status === "rfe");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">📄</span>
            <h3 className="font-medium">H-1B Petitions</h3>
            {petitions.length > 0 && (
              <span className="bg-gray-100 text-xs px-2 py-0.5 rounded">{petitions.length}</span>
            )}
            {existingPendingPetitions && (
              <span className="border bg-yellow-50 text-yellow-800 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                {hasRFE ? "⚠️ RFE" : `🕒 ${pendingPetitions.length} Pending`}
              </span>
            )}
          </div>
          {petitions.length > 0 && (
            <button
              onClick={() => setShowAddPetitionModal(true)}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              + Add I-797
            </button>
          )}
        </div>

        {hasNoPetitions ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
            <p className="text-4xl mb-3 opacity-40">📄</p>
            <p className="font-medium mb-1">No H-1B Petition Data</p>
            <p className="text-sm mb-4">Upload an I-797 approval notice or receipt notice to get started</p>
            <button
              onClick={() => setShowAddPetitionModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              Upload I-797
            </button>
          </div>
        ) : (
          <>
            {existingPendingPetitions && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  🕒 In Progress ({pendingPetitions.length})
                </div>
                {pendingPetitions.map((p) => (
                  <PetitionStatusCard
                    key={p.id}
                    petition={p}
                    isCurrent={false}
                    currentPetition={currentPetition}
                    linkedLCA={findLinkedLCA(p)}
                    lcaHistory={lcaHistory}
                    isEditing={isEditing}
                    hasOtherPetitions={validPetitions.length > 1}
                    candidateEmail={candidateEmail}
                    candidateId={candidateId}
                    onAction={handlePetitionAction}
                    onI797DataExtracted={onI797DataExtracted}
                    onSaveI797={onSaveI797}
                    onRefreshData={onRefreshData}
                    onPetitionChange={onPetitionChange}
                    onLinkLCA={onLinkLCA}
                  />
                ))}
              </div>
            )}
            {currentPetition && (
              <PetitionStatusCard
                petition={currentPetition}
                isCurrent={true}
                currentPetition={currentPetition}
                linkedLCA={findLinkedLCA(currentPetition)}
                lcaHistory={lcaHistory}
                isEditing={isEditing}
                hasOtherPetitions={validPetitions.length > 1}
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onAction={handlePetitionAction}
                onI797DataExtracted={onI797DataExtracted}
                onSaveI797={onSaveI797}
                onRefreshData={onRefreshData}
                onPetitionChange={onPetitionChange}
                onLinkLCA={onLinkLCA}
              />
            )}
            {!existingPendingPetitions && currentPetition && (
              <div className="flex justify-between p-4 bg-gray-50 rounded-lg border border-dashed items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">🕒 Have a pending petition?</div>
                <button
                  onClick={() => setShowAddPetitionModal(true)}
                  className="px-3 py-1.5 text-xs border rounded hover:bg-white"
                >
                  + Add Pending Petition
                </button>
              </div>
            )}
            {previousPetitions.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowPreviousPetitions(!showPreviousPetitions)}
                  className="w-full text-left text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2"
                >
                  {showPreviousPetitions ? "▼" : "▶"} Previous Petitions ({previousPetitions.length})
                </button>
                {showPreviousPetitions &&
                  previousPetitions.map((p) => (
                    <PetitionStatusCard
                      key={p.id}
                      petition={p}
                      isCurrent={false}
                      currentPetition={currentPetition}
                      linkedLCA={findLinkedLCA(p)}
                      lcaHistory={lcaHistory}
                      isEditing={isEditing}
                      hasOtherPetitions={validPetitions.length > 1}
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onAction={handlePetitionAction}
                      onI797DataExtracted={onI797DataExtracted}
                      onSaveI797={onSaveI797}
                      onRefreshData={onRefreshData}
                      onPetitionChange={onPetitionChange}
                      onLinkLCA={onLinkLCA}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        {petitionDocuments && petitionDocuments.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
              📄 Petition Documents ({petitionDocuments.length})
            </div>
            <div className="space-y-1 pl-6">
              {petitionDocuments.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewDocument?.(doc.file_name || doc.doc_name || "")}
                  className="flex items-center gap-2 text-xs text-indigo-600 hover:underline w-full text-left"
                >
                  📄 <span className="truncate">{doc.file_name || doc.doc_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">💼</span>
            <h3 className="font-medium">LCA History</h3>
            <span className="bg-gray-100 text-xs px-2 py-0.5 rounded">{lcaHistory.length}</span>
          </div>
          {onAddLCA && (
            <button
              onClick={onAddLCA}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              + Upload LCA
            </button>
          )}
        </div>
        {currentLCA ? (
          <LCAHistoryCard
            lca={currentLCA}
            isCurrent={true}
            isEditing={isEditing}
            hasOtherLCAs={lcaHistory.length > 1}
            onChange={onLCAChange}
            onDelete={onDeleteLCA}
            onLCADataExtracted={onLCADataExtracted}
            onSaveLCA={onSaveLCA}
            onRefreshData={onRefreshData}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            documents={getDocumentsForLCA(currentLCA)}
            onViewDocument={onViewDocument}
          />
        ) : (
          <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
            <p className="text-2xl mb-2 opacity-50">💼</p>
            <p className="text-sm font-medium mb-1">No LCA Data</p>
            <p className="text-xs mb-4">Upload an LCA (Form 9035) to track labor conditions</p>
            <div className="flex flex-col items-center gap-2">
              {candidateEmail && onLCADataExtracted && (
                <SmartUploadButton
                  documentType="lca"
                  label="Smart Upload LCA"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onLCADataExtracted}
                  onRawDataExtracted={onSaveLCA}
                  onRefreshData={onRefreshData}
                  variant="default"
                />
              )}
              {onAddLCA && (
                <button onClick={onAddLCA} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">
                  + Add Manually
                </button>
              )}
            </div>
          </div>
        )}
        {previousLCAs.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowPreviousLCAs(!showPreviousLCAs)}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2"
            >
              {showPreviousLCAs ? "▼" : "▶"} Previous LCAs ({previousLCAs.length})
            </button>
            {showPreviousLCAs &&
              previousLCAs.map((lca) => (
                <LCAHistoryCard
                  key={lca.id}
                  lca={lca}
                  isCurrent={false}
                  isEditing={isEditing}
                  hasOtherLCAs={lcaHistory.length > 1}
                  onChange={onLCAChange}
                  onDelete={onDeleteLCA}
                  onSetAsCurrent={onSetActiveLCA}
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  documents={getDocumentsForLCA(lca)}
                  onViewDocument={onViewDocument}
                />
              ))}
          </div>
        )}
      </div>

      <AddPetitionOptionsModal
        open={showAddPetitionModal}
        onOpenChange={setShowAddPetitionModal}
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        lcaHistory={lcaHistory}
        onI797DataExtracted={onI797DataExtracted}
        onSaveI797={onSaveI797}
        onRefreshData={onRefreshData}
        onManualPendingSubmit={onManualPendingSubmit}
        onUploadComplete={() => setShowAddPetitionModal(false)}
      />
    </div>
  );
}
