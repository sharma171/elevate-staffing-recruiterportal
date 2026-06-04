import React, { useState, useEffect } from "react";
import { FileText, Plus, Clock, ChevronDown, ChevronRight, Briefcase } from "lucide-react";
import PetitionStatusCard from "./PetitionStatusCard";
import LCAHistoryCard from "./LCAHistoryCard.jsx";
import { AddPetitionOptionsModal } from "./petition-status";
import axios from "axios";
import { useToaster, Message } from "rsuite";
import SmartUploadButton from "./SmartUploadButton.jsx";

const H1BPetitionsSection = ({ candidateDetails, APIData, isEditMode, onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const toaster = useToaster();
  const immigrationDocs = APIData?.documents;

  const candidateEmail = candidateDetails?.original_email;
  const candidateId = candidateDetails?.id;

  const petitions = APIData?.h1b_petitions || [];
  const lcaHistory = APIData?.lca_history || [];

  const handlePetitionChange = (updated) => {
    const updatedPetitions = petitions.map((p) => (p.id === updated.id ? updated : p));
    onDataChange?.("h1b_petitions", updatedPetitions);
  };

  const handleLCAChange = (updated) => {
    const updatedLCA = lcaHistory.map((l) => (l.id === updated.id ? updated : l));
    onDataChange?.("lca_history", updatedLCA);
  };

  let pendingLCA = lcaHistory.filter((p) => !p?.is_current);
  let currnetLCA = lcaHistory.filter((p) => !!p?.is_current);

  const pendingLCAOBJ = pendingLCA?.[0] || {};
  const currnetLCAOBJ = currnetLCA?.[0] || {};

  const pendingPetitions = petitions.filter((p) => p?.status === "pending");
  const approvedPetitions = petitions.filter((p) => p?.status !== "pending");

  const handleI797DataExtracted = (extractedData) => {
    console.log(extractedData, "extractedData");
    const petition = extractedData.h1b_data?.petition || {};
    const i94Data = extractedData.i94_data || {};
    const immigrationDataFromApi = extractedData.immigration_data || {};

    const mapPetitionType = (type) => {
      if (!type) return "initial";
      const n = type.toLowerCase();
      if (n.includes("extension")) return "extension";
      if (n.includes("transfer")) return "transfer";
      if (n.includes("amendment")) return "amendment";
      if (n.includes("concurrent")) return "concurrent";
      return "initial";
    };

    const mapPetitionStatus = (status) => {
      if (!status) return "pending";
      const n = status.toLowerCase();
      if (n.includes("approved")) return "approved";
      if (n.includes("denied")) return "denied";
      if (n.includes("rfe")) return "rfe";
      if (n.includes("withdrawn")) return "withdrawn";
      return "pending";
    };

    // setImmigrationData((prev) => {
    //   if (!prev) return prev;
    //   const existingH1b = prev.h1b || {};
    //   return {
    //     ...prev,
    //     h1b: {
    //       ...existingH1b,
    //       receipt_number:
    //         petition.receipt_number || immigrationDataFromApi.receipt_number || existingH1b.receipt_number,
    //       petition_filed_date: immigrationDataFromApi.received_date || existingH1b.petition_filed_date,
    //       petition_status: mapPetitionStatus(petition.status || immigrationDataFromApi.notice_type),
    //       approval_date: petition.approval_date || immigrationDataFromApi.approval_date || existingH1b.approval_date,
    //       validity_start_date:
    //         petition.validity_start || immigrationDataFromApi.validity_start || existingH1b.validity_start_date,
    //       validity_end_date:
    //         petition.validity_end || immigrationDataFromApi.validity_end || existingH1b.validity_end_date,
    //       h1b_petition_type: mapPetitionType(petition.petition_type || immigrationDataFromApi.petition_type),
    //       premium_processing:
    //         petition.premium_processing ?? immigrationDataFromApi.premium_processing ?? existingH1b.premium_processing,
    //       employer_name: immigrationDataFromApi.employer_name || existingH1b.employer_name,
    //       job_title: immigrationDataFromApi.job_title || existingH1b.job_title,
    //     },
    //   };
    // });

    // Prompt for I-94 update if detected
    // if (i94Data.i94_number || i94Data.i94_validity_start || i94Data.i94_validity_end) {
    //   setPendingI94Data({
    //     i94_number: i94Data.i94_number || "",
    //     i94_validity_start: i94Data.i94_validity_start || "",
    //     i94_validity_end: i94Data.i94_validity_end || "",
    //     i94_class: i94Data.i94_class || "",
    //   });
    //   setShowI94UpdatePrompt(true);
    // }

    alert("I-797 data populated — review H-1B details and save.");
  };

  const renderPendingPetitions = () => {
    return pendingPetitions.map((item, index) => {
      return (
        <div key={index}>
          <PetitionStatusCard
            isEditing={isEditMode}
            currentPetition={approvedPetitions?.[0]}
            petition={item}
            linkedLCA={pendingLCAOBJ}
            lcaHistory={lcaHistory}
            onPetitionChange={handlePetitionChange}
          />
        </div>
      );
    });
  };

  const renderApprovedPetitions = () => {
    return approvedPetitions.map((item, index) => {
      return (
        <div key={index}>
          <PetitionStatusCard
            isEditing={isEditMode}
            isCurrent
            petition={item}
            linkedLCA={currnetLCAOBJ}
            lcaHistory={lcaHistory}
            onPetitionChange={handlePetitionChange}
          />
        </div>
      );
    });
  };

  const renderPendingLCa = () => {
    const toggleCollapse = () => {
      setIsOpen((prev) => !prev);
    };

    return (
      <div className="w-full">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={toggleCollapse}
          className="flex items-center gap-2 w-full h-9 px-3 rounded-[10px] text-sm font-medium bg-transparent duration-200 text-[#67677e] hover:!bg-[#3c83f6] hover:!text-[#fff] focus:outline-none mt-2"
        >
          {isOpen ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
          Previous LCAs ({pendingLCA?.length})
        </button>

        <div
          className={`
          overflow-hidden transition-all duration-300
          ${isOpen ? "h-auto opacity-100 pt-2" : "max-h-0 opacity-0"}
        `}
        >
          {pendingLCA?.map((item, index) => {
            return (
              <div key={index}>
                <LCAHistoryCard isEditing={isEditMode} lca={item} onChange={handleLCAChange} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLCAData = () => {
    if (!lcaHistory?.length) {
      return <></>;
    }
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4 text-gray-600" />
          <div className="text-[16px] font-semibold text-gray-900"> LCA History </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {lcaHistory?.length || 0}
          </span>
        </div>
        {currnetLCA?.map((item, index) => {
          return (
            <div key={index}>
              <LCAHistoryCard isEditing={isEditMode} lca={item} onChange={handleLCAChange} />
            </div>
          );
        })}
        {renderPendingLCa()}
      </div>
    );
  };

  const handleSaveI797 = (rawExtractedData, fileInfo) => {
    const payload = {
      task: "save-h1b-approval",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      extracted_data: { h1b_data: { petition: rawExtractedData } }, // Adjust structure based on API expectation
      update_i94: false,
      ...fileInfo,
    };

    return axios
      .post(
        "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/save-h1b-approval",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
        },
      )
      .then((res) => {
        if (res.data.success) {
          toaster.push(<Message type="success">Petition saved successfully</Message>);
          // Trigger refresh if needed
          return true;
        } else {
          throw new Error(res.data.error || "Failed to save");
        }
      })
      .catch((err) => {
        toaster.push(<Message type="error">{err.message}</Message>);
        return false;
      });
  };

  const handleManualPendingSubmit = (formData) => {
    // Construct payload for manual submission
    const payload = {
      task: "add-petition-history",
      emailid: "marketing@4spheresolutions.com",
      employee_email: candidateEmail,
      petition: {
        receipt_number: formData.receiptNumber,
        status: "pending",
        petition_type: formData.petitionType,
        employer: formData.employer,
        filed_date: formData.filedDate ? formData.filedDate.toISOString().split("T")[0] : null,
        // ... other fields
      },
    };

    return axios
      .post("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", payload, {
        headers: { Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=" },
      })
      .then(() => {
        toaster.push(<Message type="success">Pending petition added</Message>);
      })
      .catch((err) => {
        toaster.push(<Message type="error">Failed to add petition</Message>);
      });
  };

  return (
    <div className="space-y-3 ring-1 ring-[#e7e7ef] p-3 my-3 rounded-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="">
          <div className="text-lg font-medium text-gray-900"> Petition & LCA Management</div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <div className="text-[16px] font-semibold text-gray-900">H-1B Petitions</div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {petitions?.length || 0}
            </span>
            <span className="rounded-[10px] px-2 py-1 shadow-sm bg-[#fef9c3] text-xs font-medium text-[#854d0e] !border-1 border-[#fef08a]">
              {pendingPetitions?.length} Pending
            </span>
          </div>
        </div>
        <button
          className="successoutlineButtonWhite successoutlineButton border rounded-[10px]"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add I-797
        </button>
      </div>
      {/* Main Petition Card */}
      {renderPendingPetitions()}
      {renderApprovedPetitions()}
      {/* Petition Documents */}
      <div className="py-3" style={{ borderTop: "1px solid #e7e7ef" }}>
        <div className="flex items-center justify-content-start gap-2 mb-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <div className="text-sm font-medium text-gray-500 mx-0">
            Petition Documents ({immigrationDocs?.length || 0})
          </div>
        </div>
        <div className="space-y-1 pl-6">
          {immigrationDocs?.map((item, index) => {
            return (
              <div key={index} className="mb-2">
                <button className="bg-transparent font-medium flex items-center gap-2 text-left text-[#7c3bed] hover:underline w-full text-[12px]">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{item?.file_name}</span>
                </button>{" "}
              </div>
            );
          })}
        </div>
      </div>
      {renderLCAData()}

      {/* {candidateEmail && (
        <SmartUploadButton
          documentType="h1b_approval"
          label="Upload I-797"
          candidateEmail={candidateEmail}
          candidateId={candidateId}
          onDataExtracted={() => {}}
          // onRawDataExtracted={onSaveI797}
          // onRefreshData={onRefreshData}
          size="sm"
          variant="outline"
          className="h-7 text-xs"
        />
      )} */}
      {/* {!isCurrent && onDelete && (
        <button
          onClick={() => onDelete(petition.id)}
          className="h-7 w-7 text-red-500 hover:text-red-700 flex items-center justify-center"
        >
          🗑️
        </button>
      )} */}

      <AddPetitionOptionsModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        candidateDetails={candidateDetails}
        onI797DataExtracted={handleI797DataExtracted}
        lcaHistory={lcaHistory}
        onSaveI797={handleSaveI797}
        onManualPendingSubmit={handleManualPendingSubmit}
        // onRefreshData={...} // Pass a refresh function if available
      />
    </div>
  );
};

export default H1BPetitionsSection;
