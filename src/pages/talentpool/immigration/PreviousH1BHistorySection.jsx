import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Button } from "../../../components/ui/button";
import { ChevronDown, ChevronRight, Briefcase, FileText, History } from "lucide-react";
import { useState } from "react";
import { PetitionStatusCard } from "./petition-status";
import { LCAHistoryCard } from "./LCAHistoryCard";

export function PreviousH1BHistorySection({
  h1bPetitions,
  lcaHistory,
  isEditing = false,
  candidateEmail,
  candidateId,
  onDeletePetition,
  onDeleteLCA,
  onPetitionChange,
  onLCAChange,
  onViewDocument,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasH1BHistory = h1bPetitions?.length > 0 || lcaHistory?.length > 0;
  if (!hasH1BHistory) return null;

  const findLinkedLCA = (petition) => {
    if (!petition.lca_id) return null;
    return lcaHistory.find((l) => l.id === petition.lca_id) || null;
  };

  const handlePetitionAction = async (action, petition) => {
    if (action === "delete" && onDeletePetition) {
      onDeletePetition(petition.id);
    } else if (action === "viewDoc" && petition.document_file_name && onViewDocument) {
      await onViewDocument(petition.document_file_name);
    }
  };

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-gray-900">Previous H-1B History</span>
                <Badge variant="secondary" className="text-xs">
                  {h1bPetitions?.length} petition{h1bPetitions?.length !== 1 ? "s" : ""}
                  {lcaHistory?.length > 0 && `, ${lcaHistory?.length} LCA${lcaHistory?.length !== 1 ? "s" : ""}`}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {h1bPetitions?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">H-1B Petitions</h4>
                </div>
                <div className="space-y-2">
                  {h1bPetitions.map((petition) => (
                    <PetitionStatusCard
                      key={petition.id}
                      petition={petition}
                      isCurrent={false}
                      currentPetition={undefined}
                      linkedLCA={findLinkedLCA(petition)}
                      lcaHistory={lcaHistory}
                      isEditing={isEditing}
                      hasOtherPetitions={h1bPetitions?.length > 1}
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                      onAction={handlePetitionAction}
                      onPetitionChange={onPetitionChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {lcaHistory?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">LCA History</h4>
                </div>
                <div className="space-y-2">
                  {lcaHistory.map((lca) => (
                    <LCAHistoryCard
                      key={lca.id}
                      lca={lca}
                      isCurrent={false}
                      isEditing={isEditing}
                      hasOtherLCAs={lcaHistory?.length > 1}
                      onDelete={onDeleteLCA}
                      onChange={onLCAChange}
                      candidateEmail={candidateEmail}
                      candidateId={candidateId}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
