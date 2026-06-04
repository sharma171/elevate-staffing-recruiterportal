import React, { useState } from "react";
import { ChevronDown, ChevronRight, History } from "lucide-react";
import PetitionStatusCard from "./PetitionStatusCard";
import LCAHistoryCard from "./LCAHistoryCard.jsx";

function PreviousH1BHistorySection({ h1bPetitions = [], lcaHistory = [], isEditing, onDataChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePetitionChange = (updated) => {
    const updatedPetitions = h1bPetitions.map((p) => (p.id === updated.id ? updated : p));
    onDataChange?.("h1b_petitions", updatedPetitions);
  };

  const handleLCAChange = (updated) => {
    const updatedLCA = lcaHistory.map((l) => (l.id === updated.id ? updated : l));
    onDataChange?.("lca_history", updatedLCA);
  };

  const handlePetitionAction = (action, petition) => {
    if (action === "delete") {
      const updatedPetitions = h1bPetitions.filter((p) => p.id !== petition.id);
      onDataChange?.("h1b_petitions", updatedPetitions);
    }
  };

  if (h1bPetitions.length === 0 && lcaHistory.length === 0) return null;

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <History className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">Previous H-1B History</span>
        </div>
        <div className="text-sm text-gray-500">
          {h1bPetitions.length} Petition{h1bPetitions.length !== 1 ? "s" : ""}, {lcaHistory.length} LCA
          {lcaHistory.length !== 1 ? "s" : ""}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          {h1bPetitions.map((petition) => (
            <PetitionStatusCard
              key={petition.id}
              petition={petition}
              isEditing={isEditing}
              onPetitionChange={handlePetitionChange}
              lcaHistory={lcaHistory}
              onAction={handlePetitionAction}
            />
          ))}
          {lcaHistory.map((lca) => (
            <LCAHistoryCard key={lca.id} lca={lca} isEditing={isEditing} onChange={handleLCAChange} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PreviousH1BHistorySection;
