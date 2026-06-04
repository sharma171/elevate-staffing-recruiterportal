import React, { useState, useEffect } from "react";
import H1BSection from "./H1BSection";
import OPTSection from "./OPTSection";
import H4EADSection from "./H4EADSection";
import L1Section from "./L1Section";
import L2DependentSection from "./L2DependentSection";
import GreenCardSection from "./GreenCardSection";
import GCEADSection from "./GCEADSection";
import PreviousH1BHistorySection from "./PreviousH1BHistorySection";
import PreviousOPTHistorySection from "./PreviousOPTHistorySection";
import PreviousH4EADHistorySection from "./PreviousH4EADHistorySection";
import PreviousGCEADHistorySection from "./PreviousGCEADHistorySection";

const VISA_TYPES = [
  { code: "H1B", label: "H-1B", description: "Specialty Occupation" },
  { code: "H1B1", label: "H-1B1", description: "Chile/Singapore FTA" },
  { code: "H4", label: "H-4", description: "H-1B Dependent (no EAD)" },
  { code: "H4_EAD", label: "H-4 EAD", description: "H-1B Dependent with Work Authorization" },
  { code: "L1A", label: "L-1A", description: "Intracompany Transferee - Manager/Executive" },
  { code: "L1B", label: "L-1B", description: "Intracompany Transferee - Specialized Knowledge" },
  { code: "L2", label: "L-2", description: "L-1 Dependent" },
  { code: "L2_EAD", label: "L-2 EAD", description: "L-1 Dependent with Work Authorization" },
  { code: "F1", label: "F-1", description: "Student" },
  { code: "OPT", label: "OPT", description: "Optional Practical Training" },
  { code: "STEM_OPT", label: "STEM OPT", description: "STEM OPT Extension" },
  { code: "CPT", label: "CPT", description: "Curricular Practical Training" },
  { code: "TN", label: "TN", description: "NAFTA Professional" },
  { code: "E2", label: "E-2", description: "Treaty Investor" },
  { code: "E3", label: "E-3", description: "Australian Specialty Occupation" },
  { code: "O1", label: "O-1", description: "Extraordinary Ability" },
  { code: "GC", label: "Green Card", description: "Permanent Resident" },
  { code: "GC_EAD", label: "GC EAD", description: "I-485 Pending with Combo Card" },
  { code: "EAD", label: "EAD", description: "Employment Authorization Document" },
  { code: "USC", label: "US Citizen", description: "US Citizen" },
  { code: "OTHER", label: "Other", description: "Other visa types" },
];

const getVisaLabel = (code) => {
  const visa = VISA_TYPES.find((v) => v.code === code);
  return visa ? visa.label : code;
};

function VisaDetailsImmigration({ candidateDetails, immigrationData: immigrationAPIResData, isEditMode }) {
  const [localData, setLocalData] = useState(immigrationAPIResData?.data || {});

  useEffect(() => {
    if (immigrationAPIResData?.data) {
      setLocalData(immigrationAPIResData.data);
    }
  }, [immigrationAPIResData]);

  const immigrationData = localData?.immigration || {};

  const handleRootChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImmigrationChange = (field, value) => {
    setLocalData((prev) => ({
      ...prev,
      immigration: { ...prev.immigration, [field]: value },
    }));
  };

  const handleArrayItemChange = (rootField, updatedItem) => {
    setLocalData((prev) => {
      const list = prev[rootField] || [];
      const updatedList = list.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      return { ...prev, [rootField]: updatedList };
    });
  };

  const apiCall = async (task, payload) => {
    console.log(`API call: ${task}`, payload);
    // return await yourApiService(task, payload);
    return { success: true, data: payload };
  };

  const renderVisaSpecificSection = () => {
    if (!immigrationData) return null;

    switch (immigrationData.visa_type) {
      case "H1B":
      case "H1B1":
        return (
          <H1BSection
            isEditMode={isEditMode}
            APIData={localData}
            data={immigrationData}
            onDataChange={handleRootChange}
            candidateDetails={candidateDetails}
            onImmigrationChange={handleImmigrationChange}
          />
        );
      case "OPT":
      case "STEM_OPT":
      case "F1":
      case "CPT":
        const isSTEMOPT = immigrationData.visa_type === "STEM_OPT";
        // Get current I-20 and EAD for data mapping in OPTSection
        const currentI20 = immigrationData.i20_history?.find((i) => i.is_current);

        // Filter EAD records for OPT section - STRICT category-based filtering (C03A/C03B/C03C only)
        const optEadRecords =
          localData.ead_records?.filter((e) => ["C03A", "C03B", "C03C"].includes(e.ead_category || "")) || [];
        const currentEAD = optEadRecords.find((e) => e.is_current);

        return (
          <div className="space-y-4">
            {/* OPT Section - with upload buttons and data mapping from current I-20/EAD */}
            <OPTSection
              data={immigrationData.opt}
              isEditing={isEditMode}
              onChange={(data) => handleImmigrationChange("opt", data)}
              //   candidateEmail={candidateEmail}
              //   candidateId={candidate?.id}
              //   onEADDataExtracted={handleEADDataExtracted}
              //   // Pass current records for data display
              currentI20={currentI20}
              currentEAD={currentEAD}
              allEADRecords={optEadRecords}
              allI20Records={localData.i20_history}
              i983Records={localData.i983_records}
              //   // I-20 upload handlers
              //   onI20DataExtracted={handleI20DataExtracted}
              onI20Change={(updated) => handleArrayItemChange("i20_history", updated)}
              //   // EAD upload handlers
              //   onSaveEAD={handleSaveEAD}
              //   // I-983 upload handlers
              //   onSaveI983={handleSaveI983}
              //   onI983DataExtracted={(data) => {
              //     console.log("I-983 data extracted:", data);
              //   }}
              //   onRefreshData={loadImmigrationData}
              //   // Delete handlers
              //   onDeleteI20={handleDeleteI20Request}
              //   onDeleteEAD={handleDeleteEADRequest}
            />
          </div>
        );
      case "H4":
      case "H4_EAD":
        const h4EadRecords = localData.ead_records?.filter((e) => e.ead_category === "C26") || [];

        return (
          <H4EADSection
            eadRecords={h4EadRecords}
            isEditing={isEditMode}
            // candidateEmail={candidateEmail}
            // candidateId={candidate?.id}
            // onDeleteEAD={handleDeleteEADRequest}
            // onEADDataExtracted={handleEADDataExtracted}
            // onSaveEAD={handleSaveEAD}
            // onRefreshData={loadImmigrationData}
            onEADChange={(updated) => handleArrayItemChange("ead_records", updated)}
          />
        );
      case "L1A":
      case "L1B":
        return (
          <L1Section
            data={immigrationData.l1}
            isEditing={isEditMode}
            onChange={(data) => handleImmigrationChange("l1", data)}
          />
        );
      case "L2":
      case "L2_EAD":
        return (
          <L2DependentSection
          // data={immigrationData.l2_dependent}
          // visaType={immigrationData.visa_type}
          // isEditing={isEditing}
          // onChange={(data) => handleImmigrationChange("l2_dependent", data)}
          // candidateEmail={candidateEmail}
          // candidateId={candidate?.id}
          // onEADDataExtracted={handleEADDataExtracted}
          />
        );
      case "GC":
        return (
          <GreenCardSection
            APIData={localData}
            isEditing={isEditMode}
            onChange={(data) => handleImmigrationChange("green_card", data)}

            // candidateEmail={candidateEmail}
            // candidateId={candidate?.id}
            // onSaveGC={handleSaveGC}
            // onDeleteGC={handleDeleteGC}
            // onRefreshData={loadImmigrationData}
          />
        );
      case "GC_EAD":
      case "EAD":
        const gcEadRecords = localData.ead_records?.filter((e) => ["C09", "C09P"].includes(e.ead_category || "")) || [];
        return (
          <GCEADSection
            eadRecords={gcEadRecords}
            isEditing={isEditMode}
            // candidateEmail={candidateEmail}
            // candidateId={candidate?.id}
            // onDeleteEAD={handleDeleteEADRequest}
            // onSaveEAD={handleSaveEAD}
            // onRefreshData={loadImmigrationData}
            onEADChange={(updated) => handleArrayItemChange("ead_records", updated)}
          />
        );
      default:
        return (
          <div>
            <div className="py-8 text-center text-muted-foreground">
              Visa-specific fields for {getVisaLabel(immigrationData.visa_type)} are not yet configured.
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderVisaSpecificSection()}

      {!["H1B", "H1B1"].includes(immigrationData?.visa_type) &&
        ((localData.h1b_petitions?.length ?? 0) > 0 || (localData.lca_history?.length ?? 0) > 0) && (
          <PreviousH1BHistorySection
            h1bPetitions={localData.h1b_petitions || []}
            lcaHistory={localData.lca_history || []}
            isEditing={isEditMode}
            onDataChange={handleRootChange}
            // candidateEmail={candidateEmail}
            // candidateId={candidate?.id}
            // onDeletePetition={handleDeletePetitionRequest}
            // onDeleteLCA={handleDeleteLCARequest}
            // onViewDocument={handleViewPetitionDocument}
          />
        )}

      {(() => {
        const previousOptEadRecords =
          localData.ead_records?.filter((e) => ["C03A", "C03B", "C03C"].includes(e.ead_category || "")) || [];

        const hasOptHistory = localData.i20_history?.length || previousOptEadRecords.length > 0;

        if (hasOptHistory) {
          return (
            <PreviousOPTHistorySection
              isEditing={isEditMode}
              allData={localData}
              onI20Change={(updated) => handleArrayItemChange("i20_history", updated)}
              onEADChange={(updated) => handleArrayItemChange("ead_records", updated)}
              onI983Change={(updated) => handleArrayItemChange("i983_records", updated)}
            />
          );
        }
        return null;
      })()}

      {!["GC_EAD", "EAD", "GC"].includes(immigrationData?.visa_type) && (
        <PreviousGCEADHistorySection
          isEditing={isEditMode}
          eadRecords={localData?.ead_records}
          onEADChange={(updated) => handleArrayItemChange("ead_records", updated)}
          //   candidateEmail={candidateEmail}
          //   candidateId={candidate?.id}
          //   onDeleteEAD={handleDeleteEADRequest}
        />
      )}

      {!["H4", "H4_EAD"].includes(immigrationData?.visa_type) && (
        <PreviousH4EADHistorySection
          eadRecords={localData?.ead_records}
          isEditing={isEditMode}
          onEADChange={(updated) => handleArrayItemChange("ead_records", updated)}
          //   candidateEmail={candidateEmail}
          //   candidateId={candidate?.id}
          //   onDeleteEAD={handleDeleteEADRequest}
        />
      )}
    </div>
  );
}

export default VisaDetailsImmigration;
