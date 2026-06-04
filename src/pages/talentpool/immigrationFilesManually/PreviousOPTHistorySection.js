import { useState } from "react";
import { ChevronDown, ChevronRight, GraduationCap, CreditCard, FileText } from "lucide-react";
import I20Section from "./I20Section";
import EADSection from "./EADSection";
import I983Section from "./I983Section";

export default function PreviousOPTHistorySection({
  allData,
  isEditing,
  onI20Change,
  onDeleteI20,
  onEADChange,
  onDeleteEAD,
  onI983Change,
  onDeleteI983,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const i20History = allData?.i20_history || [];
  const eadRecords = allData?.ead_records || [];
  const i983Records = allData?.i983_records || [];

  const totalRecords = i20History.length + eadRecords.length + i983Records.length;

  if (totalRecords === 0) {
    return null;
  }

  return (
    <div className="my-3 border border-gray-200 rounded-lg overflow-hidden">
      {/* Collapsible Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors border-0 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">Previous OPT History</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#67677e] fw-medium">
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
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-[12px] space-y-6 border-t border-gray-200">
          {i20History.length > 0 && (
            <I20Section
              i20History={i20History}
              isEditing={isEditing}
              onI20Change={onI20Change}
              onDeleteI20={onDeleteI20}
            />
          )}

          {eadRecords.length > 0 && (
            <EADSection
              eadRecords={eadRecords}
              isEditing={isEditing}
              onEADChange={onEADChange}
              onDeleteEAD={onDeleteEAD}
            />
          )}

          {i983Records.length > 0 && (
            <I983Section
              i983Records={i983Records}
              isEditing={isEditing}
              onI983Change={onI983Change}
              onDeleteI983={onDeleteI983}
            />
          )}
        </div>
      )}
    </div>
  );
}
