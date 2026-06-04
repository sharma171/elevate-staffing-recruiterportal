import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { ChevronDown, ChevronRight, GraduationCap, CreditCard, FileText } from "lucide-react";
import { I20Section } from "./I20Section";
import { EADSection } from "./EADSection";
import { I983Section } from "./I983Section";

export function PreviousOPTHistorySection({
  i20History = [],
  eadRecords = [],
  i983Records = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onDeleteI20,
  onDeleteEAD,
  onDeleteI983,
  onI20Change,
  onEADChange,
  onI983Change,
  onUpdateEvaluation,
  onViewDocument,
}) {
  const [isOpen, setIsOpen] = useState(false);

  console.log(i20History, "data to check");
  console.log(eadRecords, "data to check");
  console.log(i983Records, "data to check");

  const totalRecords = i20History.length + eadRecords.length + i983Records.length;

  if (totalRecords === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/30 hover:bg-muted/50">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Previous OPT History</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {i20History.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {i20History.length} I-20{i20History.length > 1 ? "s" : ""}
              </span>
            )}
            {eadRecords.length > 0 && (
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                {eadRecords.length} EAD{eadRecords.length > 1 ? "s" : ""}
              </span>
            )}
            {i983Records.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {i983Records.length} I-983{i983Records.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 space-y-6 px-1">
        {i20History.length > 0 && (
          <I20Section
            i20History={i20History}
            isEditing={isEditing}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            onDeleteI20={onDeleteI20}
            onI20Change={onI20Change}
          />
        )}
        {eadRecords.length > 0 && (
          <EADSection
            eadRecords={eadRecords}
            isEditing={isEditing}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            onDeleteEAD={onDeleteEAD}
            onEADChange={onEADChange}
          />
        )}
        {i983Records.length > 0 && (
          <I983Section
            i983Records={i983Records}
            isEditing={isEditing}
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            onDeleteI983={onDeleteI983}
            onI983Change={onI983Change}
            onUpdateEvaluation={onUpdateEvaluation}
            onViewDocument={onViewDocument}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
