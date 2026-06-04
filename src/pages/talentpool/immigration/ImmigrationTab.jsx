import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Pencil,
  Save,
  X,
  Globe,
  FileText,
  Plane,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Plus,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

import { CommonImmigrationInfo } from "./CommonImmigrationInfo";
import { AddHistoricalDocumentModal } from "./AddHistoricalDocumentModal";
import { H1BSection } from "./H1BSection";
import { OPTSection } from "./OPTSection";
import { H4EADSection } from "./H4EADSection";
import { L1Section } from "./L1Section";
import { L2DependentSection } from "./L2DependentSection";
import { GreenCardSection } from "./GreenCardSection";
import { GCEADSection } from "./GCEADSection";
import { GCTrackerTab } from "./GCTrackerTab";
import { TravelHistorySection } from "./TravelHistorySection";
import { PetitionHistorySection } from "./PetitionHistorySection";
import { ImmigrationDocumentsSection } from "./ImmigrationDocumentsSection";
import { SectionDocumentsList } from "./SectionDocumentsList";
import { ImmigrationAlertsCard } from "./ImmigrationAlertsCard";
import { ImmigrationTimelineSection } from "./ImmigrationTimelineSection";
import { PreviousH1BHistorySection } from "./PreviousH1BHistorySection";
import { I20Section } from "./I20Section";
import { EADSection } from "./EADSection";
import { I983Section } from "./I983Section";
import { PreviousOPTHistorySection } from "./PreviousOPTHistorySection";
import { PreviousH4EADHistorySection } from "./PreviousH4EADHistorySection";
import { PreviousGCEADHistorySection } from "./PreviousGCEADHistorySection";
import { CPTSection } from "./CPTSection";
import { VISA_TYPES, SHOW_GC_TRACKER_VISA_TYPES, GC_COMPLETED_VISA_TYPES } from "./constants";
import {
  filterDocumentsBySection,
  GC_TRACKER_DOC_TYPES,
  PASSPORT_ENTRY_DOC_TYPES,
  PETITIONS_DOC_TYPES,
} from "./documentTypes";
import {
  getImmigrationInfo,
  saveImmigrationInfo,
  saveH1BApproval,
  saveLCA,
  saveGCCard,
  deleteGCCard,
  setActivePetition,
  setActiveLCA,
  deletePetition,
  deleteLCA,
  updatePetition,
  transformApiToFrontend,
  transformFrontendToApi,
  saveI20,
  saveEAD,
  saveI983,
  deleteI20,
  deleteEAD,
  deleteI983,
  updateI983Evaluation,
  saveCPT,
  updateCPT,
  deleteCPT,
} from "../../../utils/immigrationApiService";

import { EditPetitionModal } from "./EditPetitionModal";
import { EditLCAModal } from "./EditLCAModal";
import { DuplicatePetitionDialog } from "./DuplicatePetitionDialog";
import { DuplicateLCADialog } from "./DuplicateLCADialog";
import { toast } from "react-toastify";
import FilePreview from "../../benchcandidate/FilePreview";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";

export function ImmigrationTab({ candidate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [immigrationData, setImmigrationData] = useState(null);
  const [showCPTSection, setShowCPTSection] = useState(false);
  const [addHistoricalOpen, setAddHistoricalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [pendingI94Data, setPendingI94Data] = useState(null);
  const [showI94UpdatePrompt, setShowI94UpdatePrompt] = useState(false);

  // Modal state for petition/LCA editing
  const [editPetitionModalOpen, setEditPetitionModalOpen] = useState(false);
  const [editingPetition, setEditingPetition] = useState(null);
  const [isNewPetition, setIsNewPetition] = useState(false);

  const [editLCAModalOpen, setEditLCAModalOpen] = useState(false);
  const [editingLCA, setEditingLCA] = useState(null);
  const [isNewLCA, setIsNewLCA] = useState(false);

  // Duplicate petition dialog state
  const [showDuplicatePetitionDialog, setShowDuplicatePetitionDialog] = useState(false);
  const [duplicatePetitionInfo, setDuplicatePetitionInfo] = useState(null);
  const [pendingH1BExtractedData, setPendingH1BExtractedData] = useState(null);
  const [pendingFileInfo, setPendingFileInfo] = useState(null);
  const [isDuplicateUpdating, setIsDuplicateUpdating] = useState(false);

  // Duplicate LCA dialog state
  const [showDuplicateLCADialog, setShowDuplicateLCADialog] = useState(false);
  const [duplicateLCAInfo, setDuplicateLCAInfo] = useState(null);
  const [pendingLCAExtractedData, setPendingLCAExtractedData] = useState(null);
  const [pendingLCAFileInfo, setPendingLCAFileInfo] = useState(null);
  const [isDuplicateLCAUpdating, setIsDuplicateLCAUpdating] = useState(false);

  useEffect(() => {
    loadImmigrationData();
  }, [candidate?.id]);

  const h1b_petitions = immigrationData?.h1b_petitions || [];

  // console.log(immigrationData, "immigrationData");

  // candidate.email = "muni.k0892@gmail.com";

  const employeeEmail = candidate?.original_email;

  const loadImmigrationData = async () => {
    setIsLoading(true);
    try {
      if (!employeeEmail) {
        console.log("No email available for candidate");
        setImmigrationData(null);
        setOriginalData(null);
        setIsLoading(false);
        return;
      }

      const response = await getImmigrationInfo(employeeEmail);

      if (response.success && response.data) {
        const transformedData = transformApiToFrontend(response.data);
        setImmigrationData(transformedData);
        setOriginalData(transformedData);
      } else {
        console.log("No immigration record found for candidate");
        setImmigrationData(null);
        setOriginalData(null);
      }
    } catch (error) {
      console.error("Error loading immigration data:", error);
      setImmigrationData(null);
      setOriginalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!immigrationData) return;

    setIsSaving(true);
    try {
      const employeeEmail = candidate?.original_email || "";
      if (!employeeEmail) throw new Error("Candidate email is required to save.");

      const savePromises = [];

      const baseApiData = transformFrontendToApi(immigrationData);
      savePromises.push(saveImmigrationInfo(employeeEmail, baseApiData));

      const isItemModified = (item, originalList = []) => {
        if (!item.id || String(item.id).startsWith("new-")) return true;

        const originalItem = originalList.find((orig) => orig.id === item.id);
        if (!originalItem) return true;

        return JSON.stringify(item) !== JSON.stringify(originalItem);
      };

      if (
        immigrationData.green_card &&
        JSON.stringify(immigrationData.green_card) !== JSON.stringify(originalData?.green_card)
      ) {
        savePromises.push(saveGCCard(employeeEmail, { extracted_data: immigrationData.green_card }));
      }

      if (immigrationData.h1b_petitions?.length > 0) {
        const changedPetitions = immigrationData.h1b_petitions.filter((p) =>
          isItemModified(p, originalData?.h1b_petitions),
        );

        changedPetitions.forEach((petition) => {
          if (petition.id && !String(petition.id).startsWith("new-")) {
            savePromises.push(updatePetition(employeeEmail, petition.id, petition));
          } else {
            savePromises.push(
              saveH1BApproval(
                employeeEmail,
                { immigration_data: petition, h1b_data: { petition } },
                petition.status === "approved",
              ),
            );
          }
        });
      }

      if (immigrationData.lca_history?.length > 0) {
        const changedLCAs = immigrationData.lca_history.filter((lca) => isItemModified(lca, originalData?.lca_history));
        changedLCAs.forEach((lca) => {
          savePromises.push(saveLCA(employeeEmail, { immigration_data: lca }, lca.is_current));
        });
      }

      if (immigrationData.i20_history?.length > 0) {
        const changedI20s = immigrationData.i20_history.filter((i20) => isItemModified(i20, originalData?.i20_history));
        changedI20s.forEach((i20) => {
          savePromises.push(saveI20(employeeEmail, { extracted_data: i20 }, i20.is_current));
        });
      }

      if (immigrationData.ead_records?.length > 0) {
        const changedEADs = immigrationData.ead_records.filter((ead) => isItemModified(ead, originalData?.ead_records));
        changedEADs.forEach((ead) => {
          savePromises.push(saveEAD(employeeEmail, { extracted_data: ead }, ead.is_current));
        });
      }

      if (immigrationData.i983_records?.length > 0) {
        const changedI983s = immigrationData.i983_records.filter((i983) =>
          isItemModified(i983, originalData?.i983_records),
        );
        changedI983s.forEach((i983) => {
          savePromises.push(saveI983(employeeEmail, { extracted_data: i983 }, i983.is_current));
        });
      }

      if (immigrationData.cpt_history?.length > 0) {
        const changedCPTs = immigrationData.cpt_history.filter((cpt) => isItemModified(cpt, originalData?.cpt_history));
        changedCPTs.forEach((cpt) => {
          savePromises.push(saveCPT(employeeEmail, { cpt_data: cpt }));
        });
      }

      const results = await Promise.allSettled(savePromises);
      const failedSaves = results.filter((result) => result.status === "rejected");

      if (failedSaves.length > 0) {
        console.error("Some records failed to save:", failedSaves);
        toast.warning(`Saved base info, but ${failedSaves.length} specific records failed to update.`);
      } else {
        toast.success("Immigration records updated successfully.");
      }

      setIsEditing(false);
      await loadImmigrationData();
    } catch (error) {
      console.error("Error executing master save:", error);
      toast.error(error.message || "Failed to save overall changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (originalData) {
      setImmigrationData(originalData);
    } else {
      loadImmigrationData();
    }
  };

  const candidateEmail = candidate?.original_email || "";

  const handleSaveStemOptToggle = useCallback(
    async (stemOptApplied, stemOptStatus) => {
      // if (!immigrationData) return;
      console.log("stem data", stemOptStatus);
      try {
        const updatedOpt = {
          ...immigrationData.opt,
          stem_opt_applied: stemOptApplied,
          stem_opt_status: stemOptStatus,
        };
        const updatedData = { ...immigrationData, opt: updatedOpt };
        setImmigrationData(updatedData);

        const apiData = transformFrontendToApi(updatedData);
        const response = await saveImmigrationInfo(candidateEmail, apiData);
        if (response.success) {
          setOriginalData(updatedData);
          toast({
            title: "STEM OPT Updated",
            description: `STEM OPT Extension marked as ${stemOptStatus.replace(/_/g, " ")}.`,
          });
        } else {
          console.error("Failed to save STEM OPT toggle:", response.message);
          toast({
            title: "Save Failed",
            description: response.message || "Could not update STEM OPT status.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error saving STEM OPT toggle:", error);
        toast({ title: "Save Failed", description: "An error occurred while saving.", variant: "destructive" });
      }
    },
    [immigrationData, candidateEmail, toast],
  );

  const passportEntryDocuments = useMemo(
    () => filterDocumentsBySection(immigrationData?.documents || [], "passport_entry"),
    [immigrationData?.documents],
  );

  const gcTrackerDocuments = useMemo(
    () => filterDocumentsBySection(immigrationData?.documents || [], "gc_tracker"),
    [immigrationData?.documents],
  );

  const petitionsDocuments = useMemo(
    () => filterDocumentsBySection(immigrationData?.documents || [], "petitions"),
    [immigrationData?.documents],
  );

  const lcaDocuments = useMemo(
    () => filterDocumentsBySection(immigrationData?.documents || [], "lca"),
    [immigrationData?.documents],
  );

  // Extraction handlers for smart upload
  const handlePassportDataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        passport: {
          ...prev.passport,
          passport_number: extractedData.passport_number?.value || prev.passport.passport_number,
          passport_expiry_date: extractedData.expiry_date?.value || prev.passport.passport_expiry_date,
          passport_issue_date: extractedData.issue_date?.value || prev.passport.passport_issue_date,
          passport_country:
            extractedData.country?.value || extractedData.country_code?.value || prev.passport.passport_country,
          passport_issue_city: extractedData.issue_place?.value || prev.passport.passport_issue_city,
        },
      };
    });
    toast.success("Review the form fields and save when ready.");
  }, []);

  const handleSavePassport = useCallback(
    async (rawExtractedData, fileInfo, originalFile) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const dataToSave = {
        passport_number: rawExtractedData.passport_number,
        passport_country: rawExtractedData.country_code || rawExtractedData.country,
        passport_issue_date: rawExtractedData.issue_date,
        passport_expiry_date: rawExtractedData.expiry_date,
        passport_issue_city: rawExtractedData.issue_place,
      };

      const response = await saveImmigrationInfo(
        candidateEmail,
        dataToSave,
        fileInfo
          ? {
              doc_type: "passport",
              file_base64: fileInfo.file_base64,
              file_type: fileInfo.file_type,
              file_name: fileInfo.file_name,
              doc_expiry: rawExtractedData.expiry_date,
              doc_validfrom: rawExtractedData.issue_date,
              document_number: rawExtractedData.passport_number,
            }
          : undefined,
      );

      if (!response.success) throw new Error(response.message || "Failed to save passport data");
      toast.success("Passport data has been saved to the database.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, loadImmigrationData],
  );

  const handleI94DataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        i94: {
          ...prev.i94,
          i94_number: extractedData.i94_number?.value || prev.i94.i94_number,
          i94_admission_date: extractedData.admission_date?.value || prev.i94.i94_admission_date,
          i94_expiry_date: extractedData.expiry_date?.value || prev.i94.i94_expiry_date,
          i94_admission_class: extractedData.admission_class?.value || prev.i94.i94_admission_class,
          port_of_entry: extractedData.port_of_entry?.value || prev.i94.port_of_entry,
          i94_is_duration_of_status:
            extractedData.is_duration_of_status?.value === "true" ||
            String(extractedData.is_duration_of_status?.value) === "true" ||
            prev.i94.i94_is_duration_of_status,
        },
      };
    });
    toast.success("Review the form fields and save when ready.");
  }, []);

  const handleSaveI94 = useCallback(
    async (rawExtractedData, fileInfo, originalFile) => {
      if (!candidateEmail) throw new Error("Candidate email is required");

      const dataToSave = {
        i94_number: rawExtractedData.i94_number,
        i94_admission_date: rawExtractedData.admission_date,
        i94_expiry_date: rawExtractedData.expiry_date,
        i94_admission_class: rawExtractedData.admission_class,
        port_of_entry: rawExtractedData.port_of_entry,
        i94_is_duration_of_status:
          rawExtractedData.is_duration_of_status === true || rawExtractedData.is_duration_of_status === "true",
      };

      const response = await saveImmigrationInfo(
        candidateEmail,
        dataToSave,
        fileInfo
          ? {
              doc_type: "i94",
              file_base64: fileInfo.file_base64,
              file_type: fileInfo.file_type,
              file_name: fileInfo.file_name,
              doc_expiry: rawExtractedData.expiry_date,
              doc_validfrom: rawExtractedData.admission_date,
              document_number: rawExtractedData.i94_number,
            }
          : undefined,
      );

      if (!response.success) throw new Error(response.message || "Failed to save I-94 data");
      toast.success("I-94 data has been saved to the database.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, loadImmigrationData],
  );

  const handleVisaDataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        visa_stamp: {
          ...prev.visa_stamp,
          has_valid_visa_stamp: true,
          visa_stamp_issue_date: extractedData.issue_date?.value || prev.visa_stamp.visa_stamp_issue_date,
          visa_stamp_expiry_date: extractedData.expiry_date?.value || prev.visa_stamp.visa_stamp_expiry_date,
          visa_stamp_consulate: extractedData.issuing_post?.value || prev.visa_stamp.visa_stamp_consulate,
          visa_stamp_entries: extractedData.entries?.value || prev.visa_stamp.visa_stamp_entries,
          visa_stamp_annotation: extractedData.annotation?.value || prev.visa_stamp.visa_stamp_annotation,
        },
      };
    });
    toast.success("Review the form fields and save when ready.");
  }, []);

  const handleSaveVisaStamp = useCallback(
    async (rawExtractedData, fileInfo, originalFile) => {
      if (!candidateEmail) throw new Error("Candidate email is required");

      const dataToSave = {
        has_valid_visa_stamp: true,
        visa_stamp_issue_date: rawExtractedData.issue_date,
        visa_stamp_expiry_date: rawExtractedData.expiry_date,
        visa_stamp_consulate: rawExtractedData.issuing_post,
        visa_stamp_entries: rawExtractedData.entries,
        visa_stamp_annotation: rawExtractedData.annotation,
      };

      const response = await saveImmigrationInfo(
        candidateEmail,
        dataToSave,
        fileInfo
          ? {
              doc_type: "visa_stamp",
              file_base64: fileInfo.file_base64,
              file_type: fileInfo.file_type,
              file_name: fileInfo.file_name,
              doc_expiry: rawExtractedData.expiry_date,
              doc_validfrom: rawExtractedData.issue_date,
              document_number: rawExtractedData.control_number || null,
            }
          : undefined,
      );

      if (!response.success) throw new Error(response.message || "Failed to save visa stamp data");
      toast.success("Visa stamp data has been saved to the database.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, loadImmigrationData],
  );

  const handleI797DataExtracted = useCallback((extractedData) => {
    const petition = extractedData.h1b_data?.petition || {};
    const i94Data = extractedData.i94_data || {};
    const immigrationDataFromApi = extractedData.immigration_data || {};

    const mapPetitionType = (type) => {
      if (!type) return "initial";
      const normalized = type.toLowerCase();
      if (normalized.includes("extension")) return "extension";
      if (normalized.includes("transfer")) return "transfer";
      if (normalized.includes("amendment")) return "amendment";
      if (normalized.includes("concurrent")) return "concurrent";
      return "initial";
    };

    const mapPetitionStatus = (status) => {
      if (!status) return "pending";
      const normalized = status.toLowerCase();
      if (normalized.includes("approved")) return "approved";
      if (normalized.includes("denied")) return "denied";
      if (normalized.includes("rfe")) return "rfe";
      if (normalized.includes("withdrawn")) return "withdrawn";
      return "pending";
    };

    setImmigrationData((prev) => {
      if (!prev) return prev;
      const existingH1b = prev.h1b || {};

      return {
        ...prev,
        h1b: {
          ...existingH1b,
          receipt_number:
            petition.receipt_number || immigrationDataFromApi.receipt_number || existingH1b.receipt_number,
          petition_filed_date: immigrationDataFromApi.received_date || existingH1b.petition_filed_date,
          petition_status: mapPetitionStatus(petition.status || immigrationDataFromApi.notice_type),
          approval_date: petition.approval_date || immigrationDataFromApi.approval_date || existingH1b.approval_date,
          validity_start_date:
            petition.validity_start || immigrationDataFromApi.validity_start || existingH1b.validity_start_date,
          validity_end_date:
            petition.validity_end || immigrationDataFromApi.validity_end || existingH1b.validity_end_date,
          h1b_petition_type: mapPetitionType(petition.petition_type || immigrationDataFromApi.petition_type),
          premium_processing:
            petition.premium_processing ?? immigrationDataFromApi.premium_processing ?? existingH1b.premium_processing,
          employer_name: immigrationDataFromApi.employer_name || existingH1b.employer_name,
          employer_address: immigrationDataFromApi.employer_address
            ? immigrationDataFromApi.employer_address.split(" ").slice(0, -3).join(" ")
            : existingH1b.employer_address,
          employer_city: immigrationDataFromApi.employer_address
            ? immigrationDataFromApi.employer_address.split(" ").slice(-3, -2).join(" ")
            : existingH1b.employer_city,
          employer_state: immigrationDataFromApi.employer_address
            ? immigrationDataFromApi.employer_address.split(" ").slice(-2, -1).join(" ")
            : existingH1b.employer_state,
          employer_zip: immigrationDataFromApi.employer_address
            ? immigrationDataFromApi.employer_address.split(" ").slice(-1).join(" ")
            : existingH1b.employer_zip,
          job_title: immigrationDataFromApi.job_title || existingH1b.job_title,
        },
      };
    });

    if (i94Data.i94_number || i94Data.i94_validity_start || i94Data.i94_validity_end) {
      setPendingI94Data({
        i94_number: i94Data.i94_number || "",
        i94_validity_start: i94Data.i94_validity_start || "",
        i94_validity_end: i94Data.i94_validity_end || "",
        i94_class: i94Data.i94_class || "",
      });
      setShowI94UpdatePrompt(true);
    }

    toast.success("H-1B petition details extracted. Review and save when ready.");
  }, []);

  const handleConfirmI94Update = useCallback(() => {
    if (!pendingI94Data) return;
    setImmigrationData((prev) => {
      if (!prev) return prev;
      const existingI94 = prev.i94 || {};
      return {
        ...prev,
        i94: {
          ...existingI94,
          i94_number: pendingI94Data.i94_number || existingI94.i94_number,
          i94_admission_date: pendingI94Data.i94_validity_start || existingI94.i94_admission_date,
          i94_expiry_date: pendingI94Data.i94_validity_end || existingI94.i94_expiry_date,
          i94_admission_class: pendingI94Data.i94_class || existingI94.i94_admission_class,
        },
      };
    });
    setPendingI94Data(null);
    setShowI94UpdatePrompt(false);
    toast.success("I-94 information has been updated from the approval notice.");
  }, [pendingI94Data]);

  const handleDismissI94Update = useCallback(() => {
    setPendingI94Data(null);
    setShowI94UpdatePrompt(false);
  }, []);

  const handleI140DataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        green_card: {
          ...prev.green_card,
          gc_process_started: true,
          i140_filed: true,
          i140_receipt_number: extractedData.receipt_number?.value || prev.green_card?.i140_receipt_number,
          i140_filed_date: extractedData.notice_date?.value || prev.green_card?.i140_filed_date,
          i140_status: extractedData.status?.value === "Approved" ? "approved" : "pending",
          i140_approval_date: extractedData.approval_date?.value || prev.green_card?.i140_approval_date,
          priority_date: extractedData.priority_date?.value || prev.green_card?.priority_date,
          i140_approved_category: extractedData.classification?.value || prev.green_card?.i140_approved_category,
        },
      };
    });
    toast.success("Review the GC Tracker fields and save when ready.");
  }, []);

  const handlePermDataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        green_card: {
          ...prev.green_card,
          gc_process_started: true,
          perm_required: true,
          perm_case_number: extractedData.case_number?.value || prev.green_card?.perm_case_number,
          perm_filed_date: extractedData.filed_date?.value || prev.green_card?.perm_filed_date,
          perm_certified_date: extractedData.certified_date?.value || prev.green_card?.perm_certified_date,
          perm_status: extractedData.status?.value?.toLowerCase() === "certified" ? "certified" : "pending",
          perm_job_title: extractedData.job_title?.value || prev.green_card?.perm_job_title,
          perm_wage_offered: parseFloat(extractedData.wage_offered?.value || "") || prev.green_card?.perm_wage_offered,
          perm_worksite:
            `${extractedData.worksite_city?.value || ""}, ${extractedData.worksite_state?.value || ""}`.trim() ||
            prev.green_card?.perm_worksite,
        },
      };
    });
    toast.success("Review the GC Tracker fields and save when ready.");
  }, []);

  const handleLCADataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return prev;

      const mapWageLevel = (level) => {
        if (!level) return undefined;
        const normalized = level.toLowerCase().replace(/\s+/g, "_").replace("level_", "");
        switch (normalized) {
          case "i":
          case "1":
          case "level_1":
            return "level_1";
          case "ii":
          case "2":
          case "level_2":
            return "level_2";
          case "iii":
          case "3":
          case "level_3":
            return "level_3";
          case "iv":
          case "4":
          case "level_4":
            return "level_4";
          default:
            return undefined;
        }
      };

      const mapLcaStatus = (status) => {
        if (!status) return "pending";
        const normalized = status.toLowerCase();
        if (normalized === "certified") return "certified";
        if (normalized === "withdrawn") return "withdrawn";
        if (normalized === "denied") return "denied";
        return "pending";
      };

      let parsedWorksites = [];
      if (extractedData._worksites?.value) {
        try {
          const rawWorksites = JSON.parse(extractedData._worksites.value);
          parsedWorksites = rawWorksites.map((ws, index) => ({
            worksite_id: crypto.randomUUID(),
            is_primary: ws.is_primary || index === 0,
            worksite_name: ws.worksite_name || "",
            address_line1: ws.address_line1 || "",
            address_line2: ws.address_line2 || "",
            city: ws.city || "",
            state: ws.state || "",
            zip_code: ws.zip_code || "",
            county: ws.county || "",
            client_manager_name: "",
            client_manager_email: "",
          }));
        } catch (e) {
          console.warn("Failed to parse worksites:", e);
        }
      }

      const primaryWorksite = parsedWorksites.find((w) => w.is_primary) || parsedWorksites[0];
      const additionalWorksites = parsedWorksites.filter((w) => !w.is_primary);
      const existingH1b = prev.h1b || {};

      return {
        ...prev,
        h1b: {
          ...existingH1b,
          lca_number: extractedData.lca_case_number?.value || existingH1b.lca_number,
          lca_certified_date: extractedData.lca_certified_date?.value || existingH1b.lca_certified_date,
          lca_validity_start: extractedData.lca_validity_start?.value || existingH1b.lca_validity_start,
          lca_validity_end: extractedData.lca_validity_end?.value || existingH1b.lca_validity_end,
          lca_wage_level: mapWageLevel(extractedData.wage_level?.value) || existingH1b.lca_wage_level,
          lca_prevailing_wage:
            parseFloat(extractedData.prevailing_wage?.value || "") || existingH1b.lca_prevailing_wage,
          lca_actual_wage: parseFloat(extractedData.actual_wage?.value || "") || existingH1b.lca_actual_wage,
          lca_status: mapLcaStatus(extractedData.lca_status?.value),
          lca_full_time: extractedData.is_full_time?.value === "true" || existingH1b.lca_full_time,
          job_title: extractedData.job_title?.value || existingH1b.job_title,
          soc_code: extractedData.soc_code?.value || existingH1b.soc_code,
          soc_title: extractedData.soc_title?.value || existingH1b.soc_title,
          employer_name: extractedData.employer_name?.value || existingH1b.employer_name,
          employer_fein: extractedData.employer_ein?.value || existingH1b.employer_fein,
          employer_address: extractedData.employer_address?.value || existingH1b.employer_address,
          employer_city: extractedData.employer_city?.value || existingH1b.employer_city,
          employer_state: extractedData.employer_state?.value || existingH1b.employer_state,
          employer_zip: extractedData.employer_zip?.value || existingH1b.employer_zip,
          employer_phone: extractedData.employer_phone?.value || existingH1b.employer_phone,
          hr_contact_name: extractedData.employer_contact_name?.value || existingH1b.hr_contact_name,
          hr_contact_email: extractedData.employer_contact_email?.value || existingH1b.hr_contact_email,
          immigration_attorney: extractedData.attorney_name?.value || existingH1b.immigration_attorney,
          attorney_firm: extractedData.attorney_firm?.value || existingH1b.attorney_firm,
          ...(primaryWorksite ? { primary_worksite: primaryWorksite } : {}),
          ...(additionalWorksites.length > 0 ? { additional_worksites: additionalWorksites } : {}),
        },
      };
    });
    toast.success({
      title: "LCA data populated",
      description: "Review the LCA and worksite fields, then save when ready.",
    });
  }, []);

  const handleEADDataExtracted = useCallback((extractedData) => {
    setImmigrationData((prev) => {
      if (!prev) return null;
      const visaType = prev.visa_type;

      if (visaType === "H4_EAD" && prev.h4_ead) {
        return {
          ...prev,
          h4_ead: {
            ...prev.h4_ead,
            h4_ead_card_number: extractedData.card_number?.value || prev.h4_ead.h4_ead_card_number,
            h4_ead_category: extractedData.category?.value || prev.h4_ead.h4_ead_category,
            h4_ead_validity_start: extractedData.valid_from?.value || prev.h4_ead.h4_ead_validity_start,
            h4_ead_validity_end: extractedData.card_expires?.value || prev.h4_ead.h4_ead_validity_end,
          },
        };
      }
      if (visaType === "L2_EAD" && prev.l2_dependent) {
        return {
          ...prev,
          l2_dependent: {
            ...prev.l2_dependent,
            ead_card_number: extractedData.card_number?.value || prev.l2_dependent.ead_card_number,
            ead_category: extractedData.category?.value || prev.l2_dependent.ead_category,
            ead_validity_start: extractedData.valid_from?.value || prev.l2_dependent.ead_validity_start,
            ead_validity_end: extractedData.card_expires?.value || prev.l2_dependent.ead_validity_end,
          },
        };
      }
      if ((visaType === "OPT" || visaType === "STEM_OPT") && prev.opt) {
        return {
          ...prev,
          opt: {
            ...prev.opt,
            opt_ead_category: extractedData.category?.value || prev.opt.opt_ead_category,
            opt_start_date: extractedData.valid_from?.value || prev.opt.opt_start_date,
            opt_end_date: extractedData.card_expires?.value || prev.opt.opt_end_date,
          },
        };
      }
      if ((visaType === "GC_EAD" || visaType === "EAD") && prev.gc_ead) {
        return {
          ...prev,
          gc_ead: {
            ...prev.gc_ead,
            ead_ap_combo: {
              ...prev.gc_ead.ead_ap_combo,
              ead_number: extractedData.card_number?.value || prev.gc_ead.ead_ap_combo?.ead_number,
              ead_category: extractedData.category?.value || prev.gc_ead.ead_ap_combo?.ead_category,
              card_issue_date: extractedData.valid_from?.value || prev.gc_ead.ead_ap_combo?.card_issue_date,
              card_expiry_date: extractedData.card_expires?.value || prev.gc_ead.ead_ap_combo?.card_expiry_date,
              card_received: true,
            },
          },
        };
      }
      return prev;
    });
    toast.success("Review the EAD fields and save when ready.");
  }, []);

  // Handler for saving I-797 H-1B Approval via dedicated API endpoint
  const handleSaveI797 = useCallback(
    async (rawExtractedData, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");

      console.log("Saving I-797 data via save-h1b-approval:", rawExtractedData, "with file:", fileInfo?.file_name);

      const response = await saveH1BApproval(candidateEmail, rawExtractedData, false, fileInfo);

      if (!response.success && response.error && response.existing_petition_id) {
        setPendingH1BExtractedData(rawExtractedData);
        setPendingFileInfo(fileInfo || null);
        setDuplicatePetitionInfo({ error: response.error, existing_petition_id: response.existing_petition_id });
        setShowDuplicatePetitionDialog(true);
        return "pending";
      }

      if (!response.success) throw new Error(response.message || response.error || "Failed to save H-1B approval");

      toast.success("H-1B approval data has been saved to the database.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, loadImmigrationData],
  );

  // Handler for saving LCA via dedicated API endpoint
  const handleSaveLCA = useCallback(
    async (rawExtractedData, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");

      const response = await saveLCA(candidateEmail, rawExtractedData, true, fileInfo);

      const existingLcaId = response?.existing_lca_id || response?.data?.existing_lca_id;
      const duplicateErrorMessage =
        response?.error ||
        response?.message ||
        response?.data?.error ||
        response?.data?.message ||
        "A matching LCA record already exists for this candidate.";

      if (existingLcaId) {
        setPendingLCAExtractedData(rawExtractedData);
        setPendingLCAFileInfo(fileInfo || null);
        setDuplicateLCAInfo({ error: duplicateErrorMessage, existing_lca_id: existingLcaId });
        setShowDuplicateLCADialog(true);
        return "pending";
      }

      const isFailureResponse =
        response?.success === false ||
        String(response?.status || "").toLowerCase() === "error" ||
        Boolean(response?.error);

      if (isFailureResponse) throw new Error(response?.message || response?.error || "Failed to save LCA");

      toast.success("LCA data has been saved to the database.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, loadImmigrationData],
  );

  // Duplicate petition dialog handlers
  const handleCancelDuplicateDialog = useCallback(() => {
    setShowDuplicatePetitionDialog(false);
    setDuplicatePetitionInfo(null);
    setPendingH1BExtractedData(null);
    setPendingFileInfo(null);
  }, []);

  const handleUpdateExistingPetition = useCallback(async () => {
    if (!candidateEmail || !pendingH1BExtractedData || !duplicatePetitionInfo) return;
    setIsDuplicateUpdating(true);
    try {
      const response = await saveH1BApproval(
        candidateEmail,
        {
          ...pendingH1BExtractedData,
          update_existing: true,
          existing_petition_id: duplicatePetitionInfo.existing_petition_id,
        },
        false,
        pendingFileInfo || undefined,
      );
      if (!response.success) throw new Error(response.message || response.error || "Failed to update petition");
      toast.success("The existing petition has been updated with new data.");
      setShowDuplicatePetitionDialog(false);
      setDuplicatePetitionInfo(null);
      setPendingH1BExtractedData(null);
      setPendingFileInfo(null);
      await loadImmigrationData();
    } catch (error) {
      console.error("Error updating petition:", error);
      toast.error(error.message || "Failed to update petition");
    } finally {
      setIsDuplicateUpdating(false);
    }
  }, [candidateEmail, pendingH1BExtractedData, pendingFileInfo, duplicatePetitionInfo]);

  const handleCreatePetitionAnyway = useCallback(async () => {
    if (!candidateEmail || !pendingH1BExtractedData) return;
    setIsDuplicateUpdating(true);
    try {
      const response = await saveH1BApproval(
        candidateEmail,
        { ...pendingH1BExtractedData, force_create: true },
        false,
        pendingFileInfo || undefined,
      );
      if (!response.success) throw new Error(response.message || response.error || "Failed to create petition");
      toast.success("A new petition entry has been created.");
      setShowDuplicatePetitionDialog(false);
      setDuplicatePetitionInfo(null);
      setPendingH1BExtractedData(null);
      setPendingFileInfo(null);
      await loadImmigrationData();
    } catch (error) {
      console.error("Error creating petition:", error);
      toast.error(error.message || "Failed to create petition");
    } finally {
      setIsDuplicateUpdating(false);
    }
  }, [candidateEmail, pendingH1BExtractedData, pendingFileInfo]);

  // Duplicate LCA dialog handlers
  const handleUpdateExistingLCA = useCallback(
    async (existingLcaIdFromDialog) => {
      const existingLcaId = existingLcaIdFromDialog || duplicateLCAInfo?.existing_lca_id;
      if (!candidateEmail || !pendingLCAExtractedData || !existingLcaId) return;
      setIsDuplicateLCAUpdating(true);
      try {
        const response = await saveLCA(
          candidateEmail,
          { ...pendingLCAExtractedData, update_existing: true, existing_lca_id: existingLcaId },
          true,
          pendingLCAFileInfo || undefined,
        );
        if (!response.success) throw new Error(response.message || response.error || "Failed to update LCA");
        toast.success(response.message || "The existing LCA has been updated with new data.");
        await loadImmigrationData();
      } catch (error) {
        console.error("Error updating LCA:", error);
        toast.error(error.message || "Failed to update LCA");
      } finally {
        setShowDuplicateLCADialog(false);
        setDuplicateLCAInfo(null);
        setPendingLCAExtractedData(null);
        setPendingLCAFileInfo(null);
        setIsDuplicateLCAUpdating(false);
      }
    },
    [candidateEmail, pendingLCAExtractedData, pendingLCAFileInfo, duplicateLCAInfo, loadImmigrationData],
  );

  const handleCreateLCAAnyway = useCallback(async () => {
    if (!candidateEmail || !pendingLCAExtractedData) return;
    setIsDuplicateLCAUpdating(true);
    try {
      const response = await saveLCA(
        candidateEmail,
        { ...pendingLCAExtractedData, force_create: true },
        true,
        pendingLCAFileInfo || undefined,
      );
      if (!response.success) throw new Error(response.message || response.error || "Failed to create LCA");
      toast.success("New LCA entry has been created.");
      setShowDuplicateLCADialog(false);
      setDuplicateLCAInfo(null);
      setPendingLCAExtractedData(null);
      setPendingLCAFileInfo(null);
      await loadImmigrationData();
    } catch (error) {
      console.error("Error creating LCA:", error);
      toast.error(error.message || "Failed to create LCA");
    } finally {
      setIsDuplicateLCAUpdating(false);
    }
  }, [candidateEmail, pendingLCAExtractedData, pendingLCAFileInfo, loadImmigrationData]);

  const handleCancelDuplicateLCADialog = useCallback(() => {
    setShowDuplicateLCADialog(false);
    setDuplicateLCAInfo(null);
    setPendingLCAExtractedData(null);
    setPendingLCAFileInfo(null);
  }, []);

  const handleRefreshData = useCallback(async () => {
    await loadImmigrationData();
  }, []);

  const handleSetActivePetition = useCallback(
    async (petitionId) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await setActivePetition(candidateEmail, petitionId);
      if (!response.success) throw new Error(response.message || "Failed to set active petition");
      await loadImmigrationData();
    },
    [candidateEmail],
  );

  const handleSetActiveLCA = useCallback(
    async (lcaId) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await setActiveLCA(candidateEmail, lcaId);
      if (!response.success) throw new Error(response.message || "Failed to set active LCA");
      await loadImmigrationData();
    },
    [candidateEmail],
  );

  // Delete confirmation state
  const [showDeletePetitionDialog, setShowDeletePetitionDialog] = useState(false);
  const [showDeleteLCADialog, setShowDeleteLCADialog] = useState(false);
  const [deletingPetition, setDeletingPetition] = useState(null);
  const [deletingLCA, setDeletingLCA] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePetitionRequest = useCallback(
    (petitionId) => {
      const petition = immigrationData?.h1b_petitions?.find((p) => p.id === petitionId);
      if (petition) {
        setDeletingPetition(petition);
        setShowDeletePetitionDialog(true);
      }
    },
    [immigrationData],
  );

  const handleConfirmDeletePetition = useCallback(async () => {
    if (!deletingPetition || !candidateEmail) return;
    setIsDeleting(true);
    try {
      const response = await deletePetition(candidateEmail, deletingPetition.id);
      if (!response.success) throw new Error(response.error || "Failed to delete petition");
      toast.success(response.message || "The petition has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error(error.message || "Failed to delete petition");
    } finally {
      setIsDeleting(false);
      setShowDeletePetitionDialog(false);
      setDeletingPetition(null);
    }
  }, [deletingPetition, candidateEmail]);

  const handleDeleteLCARequest = useCallback(
    (lcaId) => {
      const lca = immigrationData?.lca_history?.find((l) => l.id === lcaId);
      if (lca) {
        setDeletingLCA(lca);
        setShowDeleteLCADialog(true);
      }
    },
    [immigrationData],
  );

  const handleConfirmDeleteLCA = useCallback(async () => {
    if (!deletingLCA || !candidateEmail) return;
    setIsDeleting(true);
    try {
      const response = await deleteLCA(candidateEmail, deletingLCA.id);
      if (!response.success) throw new Error(response.error || "Failed to delete LCA");
      toast.success(response.message || "The LCA has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error(error.message || "Failed to delete LCA");
    } finally {
      setIsDeleting(false);
      setShowDeleteLCADialog(false);
      setDeletingLCA(null);
    }
  }, [deletingLCA, candidateEmail]);

  const handleLinkLCA = useCallback(
    async (petitionId, lcaId) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await updatePetition(candidateEmail, petitionId, { lca_id: lcaId });
      if (!response.success) throw new Error(response.message || "Failed to link LCA to petition");
      toast.success("The LCA has been linked to this petition.");
      await loadImmigrationData();
    },
    [candidateEmail],
  );

  const handleEditPetition = useCallback((petition) => {
    setEditingPetition(petition);
    setIsNewPetition(false);
    setEditPetitionModalOpen(true);
  }, []);

  const handleEditLCA = useCallback((lca) => {
    setEditingLCA(lca);
    setIsNewLCA(false);
    setEditLCAModalOpen(true);
  }, []);

  const handleAddPetition = useCallback(() => {
    setEditingPetition(null);
    setIsNewPetition(true);
    setEditPetitionModalOpen(true);
  }, []);

  const handleAddLCA = useCallback(() => {
    setEditingLCA(null);
    setIsNewLCA(true);
    setEditLCAModalOpen(true);
  }, []);

  // OPT / I-20 / EAD / I-983 Handlers
  const [showDeleteI20Dialog, setShowDeleteI20Dialog] = useState(false);
  const [showDeleteEADDialog, setShowDeleteEADDialog] = useState(false);
  const [showDeleteI983Dialog, setShowDeleteI983Dialog] = useState(false);
  const [deletingI20, setDeletingI20] = useState(null);
  const [deletingEAD, setDeletingEAD] = useState(null);
  const [deletingI983, setDeletingI983] = useState(null);

  const handleI20DataExtracted = useCallback((extractedData) => {
    toast.success("Review the parsed data and save when ready.");
  }, []);

  const handleSaveI20 = useCallback(
    async (rawExtractedData, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await saveI20(candidateEmail, rawExtractedData, true, fileInfo);
      if (!response.success) throw new Error(response.message || "Failed to save I-20");
      toast.success("I-20 data has been saved successfully.");
      const cptAutoId = response.cpt_auto_created_id || response.data?.cpt_auto_created_id;
      if (cptAutoId) {
        toast.success("A CPT authorization record was automatically created from this I-20.");
      }
      await loadImmigrationData();
      return true;
    },
    [candidateEmail],
  );

  const handleAddI20 = useCallback(() => {
    toast.success("Use the Smart Upload button to add a new I-20.");
  }, []);

  const handleDeleteI20Request = useCallback(
    (i20Id) => {
      const i20 = immigrationData?.i20_history?.find((i) => i.id === i20Id);
      if (i20) {
        setDeletingI20(i20);
        setShowDeleteI20Dialog(true);
      }
    },
    [immigrationData],
  );

  const handleConfirmDeleteI20 = useCallback(async () => {
    if (!deletingI20 || !candidateEmail) return;
    setIsDeleting(true);
    try {
      const response = await deleteI20(candidateEmail, deletingI20.id);
      if (!response.success) throw new Error(response.error || "Failed to delete I-20");
      toast.success(response.message || "The I-20 has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error("Failed to delete I-20");
    } finally {
      setIsDeleting(false);
      setShowDeleteI20Dialog(false);
      setDeletingI20(null);
    }
  }, [deletingI20, candidateEmail]);

  const handleI20Change = useCallback((updatedI20) => {
    setImmigrationData((prev) => {
      if (!prev || !prev.i20_history) return prev;
      return { ...prev, i20_history: prev.i20_history.map((i) => (i.id === updatedI20.id ? updatedI20 : i)) };
    });
  }, []);

  const handleEADParsed = useCallback((extractedData) => {
    toast.success("Review the parsed data and save when ready.");
  }, []);

  const handleSaveEAD = useCallback(
    async (rawExtractedData, fileInfo, isOptEadContext) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await saveEAD(candidateEmail, rawExtractedData, true, fileInfo);
      if (!response.success) throw new Error(response.message || "Failed to save EAD");
      const shouldSaveStemOptAsApproved = isOptEadContext === true;
      if (shouldSaveStemOptAsApproved) {
        await handleSaveStemOptToggle(true, "approved");
      }
      toast.success("EAD data has been saved successfully.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail, handleSaveStemOptToggle, loadImmigrationData],
  );

  const handleSaveGC = useCallback(
    async (rawExtractedData, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await saveGCCard(candidateEmail, rawExtractedData, fileInfo);
      if (!response.success) throw new Error(response.message || "Failed to save Green Card");
      toast.success("Green Card data has been saved successfully.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail],
  );

  const handleDeleteGC = useCallback(async () => {
    if (!candidateEmail) throw new Error("Candidate email is required");
    const response = await deleteGCCard(candidateEmail);
    if (!response.success) throw new Error(response.message || "Failed to delete Green Card");
    toast.success("Green Card data has been removed successfully.");
    await loadImmigrationData();
  }, [candidateEmail]);

  const handleAddEAD = useCallback(() => {
    toast.success("Use the Smart Upload button to add a new EAD card.");
  }, []);

  const handleDeleteEADRequest = useCallback(
    (eadId) => {
      const ead = immigrationData?.ead_records?.find((e) => e.id === eadId);
      if (ead) {
        setDeletingEAD(ead);
        setShowDeleteEADDialog(true);
      }
    },
    [immigrationData],
  );

  const handleConfirmDeleteEAD = useCallback(async () => {
    if (!deletingEAD || !candidateEmail) return;
    setIsDeleting(true);
    try {
      const response = await deleteEAD(candidateEmail, deletingEAD.id);
      if (!response.success) throw new Error(response.error || "Failed to delete EAD");
      toast.success(response.message || "The EAD has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error(error.message || "Failed to delete EAD");
    } finally {
      setIsDeleting(false);
      setShowDeleteEADDialog(false);
      setDeletingEAD(null);
    }
  }, [deletingEAD, candidateEmail]);

  const handleEADChange = useCallback((updatedEAD) => {
    setImmigrationData((prev) => {
      if (!prev || !prev.ead_records) return prev;
      return { ...prev, ead_records: prev.ead_records.map((e) => (e.id === updatedEAD.id ? updatedEAD : e)) };
    });
  }, []);

  const handleAddI983 = useCallback(() => {
    toast.success("Use the form to add a new I-983 Training Plan.");
  }, []);

  const handleSaveI983 = useCallback(
    async (rawExtractedData, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await saveI983(candidateEmail, rawExtractedData, true, fileInfo);
      if (!response.success) throw new Error(response.message || "Failed to save I-983");
      toast.success("I-983 Training Plan has been saved successfully.");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail],
  );

  const handleDeleteI983Request = useCallback(
    (i983Id) => {
      const i983 = immigrationData?.i983_records?.find((r) => r.id === i983Id);
      if (i983) {
        setDeletingI983(i983);
        setShowDeleteI983Dialog(true);
      }
    },
    [immigrationData],
  );

  const handleConfirmDeleteI983 = useCallback(async () => {
    if (!deletingI983 || !candidateEmail) return;
    setIsDeleting(true);
    try {
      const response = await deleteI983(candidateEmail, deletingI983.id);
      if (!response.success) throw new Error(response.error || "Failed to delete I-983");
      toast.success(response.message || "The I-983 has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error(error.message || "Failed to delete I-983");
    } finally {
      setIsDeleting(false);
      setShowDeleteI983Dialog(false);
      setDeletingI983(null);
    }
  }, [deletingI983, candidateEmail, toast]);

  const handleI983Change = useCallback((updatedI983) => {
    setImmigrationData((prev) => {
      if (!prev || !prev.i983_records) return prev;
      return { ...prev, i983_records: prev.i983_records.map((r) => (r.id === updatedI983.id ? updatedI983 : r)) };
    });
  }, []);

  const handleUpdateI983Evaluation = useCallback(
    async (i983Id, evaluation, completed, completedDate, notes) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await updateI983Evaluation(candidateEmail, i983Id, evaluation, completed, completedDate, notes);
      if (!response.success) throw new Error(response.message || "Failed to update evaluation");
      toast.success(`${evaluation} evaluation has been ${completed ? "marked complete" : "marked incomplete"}.`);
      await loadImmigrationData();
    },
    [candidateEmail],
  );

  // CPT Handlers
  const [showDeleteCPTDialog, setShowDeleteCPTDialog] = useState(false);
  const [deletingCPTId, setDeletingCPTId] = useState(null);

  const handleSaveCPT = useCallback(
    async (cptData, i20Id, fileInfo) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const response = await saveCPT(candidateEmail, cptData, i20Id, true, fileInfo);
      if (!response.success) throw new Error(response.message || "Failed to save CPT");
      await loadImmigrationData();
      return true;
    },
    [candidateEmail],
  );

  const handleUpdateCPT = useCallback(async (cptId, cptData) => {
    const response = await updateCPT(cptId, cptData);
    if (!response.success) throw new Error(response.message || "Failed to update CPT");
    toast.success("CPT record has been updated.");
    await loadImmigrationData();
    return true;
  }, []);

  const handleDeleteCPTRequest = useCallback((cptId) => {
    setDeletingCPTId(cptId);
    setShowDeleteCPTDialog(true);
  }, []);

  const handleConfirmDeleteCPT = useCallback(async () => {
    if (!deletingCPTId) return;
    setIsDeleting(true);
    try {
      const response = await deleteCPT(deletingCPTId);
      if (!response.success) throw new Error("Failed to delete CPT");
      toast.success("The CPT record has been removed.");
      await loadImmigrationData();
    } catch (error) {
      toast.error(error.message || "Failed to delete CPT");
    } finally {
      setIsDeleting(false);
      setShowDeleteCPTDialog(false);
      setDeletingCPTId(null);
    }
  }, [deletingCPTId]);

  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);

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

  const handleManualPetitionSubmit = useCallback(
    async (formData) => {
      if (!candidateEmail) throw new Error("Candidate email is required");
      const extractedData = {
        immigration_data: {
          visa_type: "H1B",
          receipt_number: formData.receipt_number,
          petition_type: formData.petition_type,
          notice_type: formData.status === "approved" ? "approval" : "receipt",
          employer_name: formData.employer_name,
          received_date: formData.filed_date,
          notice_date: formData.notice_date,
          approval_date: formData.approval_date || null,
          validity_start: formData.validity_start || null,
          validity_end: formData.validity_end || null,
          classification: "H-1B",
        },
        h1b_data: {
          petition: {
            petition_type: formData.petition_type,
            status: formData.status,
            premium_processing: formData.premium_processing,
          },
        },
        i94_data: {},
      };
      const response = await saveH1BApproval(candidateEmail, extractedData, formData.status === "approved", undefined);
      if (!response.success) throw new Error(response.message || response.error || "Failed to save petition");
      toast.success("The petition has been added manually.");
      await loadImmigrationData();
    },
    [candidateEmail],
  );

  const handlePetitionInlineChange = useCallback(
    (petition) => {
      if (!immigrationData) return;
      const updatedH1B = {
        ...immigrationData.h1b,
        h1b_petition_type: petition.petition_type,
        receipt_number: petition.receipt_number,
        petition_status: petition.status,
        employer_name: petition.employer_name,
        employer_fein: petition.employer_fein,
        petition_filed_date: petition.filed_date,
        notice_date: petition.notice_date,
        approval_date: petition.approval_date,
        validity_start_date: petition.validity_start,
        validity_end_date: petition.validity_end,
        premium_processing: petition.premium_processing,
        h1b_cap_status: petition.cap_status,
        lca_number: petition.linked_lca_number,
        job_title: petition.job_title,
        soc_code: petition.soc_code,
        soc_title: petition.soc_title,
      };
      setImmigrationData((prev) => (prev ? { ...prev, h1b: updatedH1B } : null));
    },
    [immigrationData],
  );

  const handleLCAInlineChange = useCallback(
    (lca) => {
      if (!immigrationData) return;
      const primaryWorksite = lca.worksites?.find((w) => w.is_primary);
      const additionalWorksites = lca.worksites?.filter((w) => !w.is_primary) || [];
      const updatedH1B = {
        ...immigrationData.h1b,
        lca_number: lca.case_number,
        lca_status: lca.status,
        lca_certified_date: lca.certified_date,
        lca_validity_start: lca.validity_start,
        lca_validity_end: lca.validity_end,
        lca_wage_level: lca.wage_level,
        lca_prevailing_wage: lca.prevailing_wage,
        lca_actual_wage: lca.actual_wage,
        lca_wage_unit: lca.wage_unit,
        lca_full_time: lca.full_time,
        job_title: lca.job_title || immigrationData.h1b.job_title,
        soc_code: lca.soc_code || immigrationData.h1b.soc_code,
        soc_title: lca.soc_title || immigrationData.h1b.soc_title,
        employer_name: lca.employer_name || immigrationData.h1b.employer_name,
        employer_fein: lca.employer_fein || immigrationData.h1b.employer_fein,
        ...(primaryWorksite
          ? {
              primary_worksite: {
                worksite_id: crypto.randomUUID(),
                is_primary: true,
                worksite_name: primaryWorksite.worksite_name || "",
                address_line1: "",
                city: primaryWorksite.city || "",
                state: primaryWorksite.state || "",
                county: primaryWorksite.county || "",
                zip_code: "",
              },
            }
          : {}),
        additional_worksites: additionalWorksites.map((ws) => ({
          worksite_id: crypto.randomUUID(),
          is_primary: false,
          worksite_name: ws.worksite_name || "",
          address_line1: "",
          city: ws.city || "",
          state: ws.state || "",
          county: ws.county || "",
          zip_code: "",
        })),
      };
      setImmigrationData((prev) => (prev ? { ...prev, h1b: updatedH1B } : null));
    },
    [immigrationData],
  );

  const handleSavePetition = useCallback(
    async (petition) => {
      if (!immigrationData) return;
      const updatedH1B = {
        ...immigrationData.h1b,
        h1b_petition_type: petition.petition_type,
        receipt_number: petition.receipt_number,
        petition_status: petition.status,
        employer_name: petition.employer_name,
        employer_fein: petition.employer_fein,
        petition_filed_date: petition.filed_date,
        notice_date: petition.notice_date,
        approval_date: petition.approval_date,
        validity_start_date: petition.validity_start,
        validity_end_date: petition.validity_end,
        premium_processing: petition.premium_processing,
        h1b_cap_status: petition.cap_status,
        lca_number: petition.linked_lca_number,
        job_title: petition.job_title,
        soc_code: petition.soc_code,
        soc_title: petition.soc_title,
      };
      setImmigrationData((prev) => (prev ? { ...prev, h1b: updatedH1B } : null));
      try {
        const employeeEmail = candidate?.original_email || "";
        const apiData = transformFrontendToApi({ ...immigrationData, h1b: updatedH1B });
        const response = await saveImmigrationInfo(employeeEmail, apiData);
        if (response.success) {
          toast.success("H-1B petition details have been updated.");
          await loadImmigrationData();
        } else {
          throw new Error(response.message || "Failed to save");
        }
      } catch (error) {
        console.error("Error saving petition:", error);
        toast.error("Failed to save petition. Please try again.");
        throw error;
      }
    },
    [immigrationData, candidate],
  );

  const handleSaveLCAFromModal = useCallback(
    async (lca) => {
      if (!immigrationData) return;
      const primaryWorksite = lca.worksites?.find((w) => w.is_primary);
      const additionalWorksites = lca.worksites?.filter((w) => !w.is_primary) || [];
      const updatedH1B = {
        ...immigrationData.h1b,
        lca_number: lca.case_number,
        lca_status: lca.status,
        lca_certified_date: lca.certified_date,
        lca_validity_start: lca.validity_start,
        lca_validity_end: lca.validity_end,
        lca_wage_level: lca.wage_level,
        lca_prevailing_wage: lca.prevailing_wage,
        lca_actual_wage: lca.actual_wage,
        lca_wage_unit: lca.wage_unit,
        lca_full_time: lca.full_time,
        job_title: lca.job_title || immigrationData.h1b.job_title,
        soc_code: lca.soc_code || immigrationData.h1b.soc_code,
        soc_title: lca.soc_title || immigrationData.h1b.soc_title,
        employer_name: lca.employer_name || immigrationData.h1b.employer_name,
        employer_fein: lca.employer_fein || immigrationData.h1b.employer_fein,
        ...(primaryWorksite
          ? {
              primary_worksite: {
                worksite_id: crypto.randomUUID(),
                is_primary: true,
                worksite_name: primaryWorksite.worksite_name || "",
                address_line1: "",
                city: primaryWorksite.city || "",
                state: primaryWorksite.state || "",
                county: primaryWorksite.county || "",
                zip_code: "",
              },
            }
          : {}),
        additional_worksites: additionalWorksites.map((ws) => ({
          worksite_id: crypto.randomUUID(),
          is_primary: false,
          worksite_name: ws.worksite_name || "",
          address_line1: "",
          city: ws.city || "",
          state: ws.state || "",
          county: ws.county || "",
          zip_code: "",
        })),
      };
      setImmigrationData((prev) => (prev ? { ...prev, h1b: updatedH1B } : null));
      try {
        const employeeEmail = candidate?.original_email || "";
        const apiData = transformFrontendToApi({ ...immigrationData, h1b: updatedH1B });
        const response = await saveImmigrationInfo(employeeEmail, apiData);
        if (response.success) {
          toast.success("LCA and worksite details have been updated.");
          await loadImmigrationData();
        } else {
          throw new Error(response.message || "Failed to save");
        }
      } catch (error) {
        console.error("Error saving LCA:", error);
        toast.error("Failed to save LCA. Please try again.");
        throw error;
      }
    },
    [immigrationData, candidate],
  );

  const deriveH1BPetitions = useCallback(() => {
    if (!immigrationData?.h1b) return [];
    const h1b = immigrationData.h1b;
    return [
      {
        id: `petition-current-${h1b.receipt_number || "unknown"}`,
        is_current: true,
        petition_type: h1b.h1b_petition_type || "initial",
        receipt_number: h1b.receipt_number || "",
        status: h1b.petition_status || "pending",
        employer_name: h1b.employer_name || "",
        employer_fein: h1b.employer_fein,
        filed_date: h1b.petition_filed_date,
        notice_date: h1b.notice_date,
        approval_date: h1b.approval_date,
        validity_start: h1b.validity_start_date,
        validity_end: h1b.validity_end_date,
        premium_processing: h1b.premium_processing,
        cap_status: h1b.h1b_cap_status,
        linked_lca_number: h1b.lca_number,
        job_title: h1b.job_title,
        soc_code: h1b.soc_code,
        soc_title: h1b.soc_title,
      },
    ];
  }, [immigrationData?.h1b]);

  const deriveLCAHistory = useCallback(() => {
    if (!immigrationData?.h1b) return [];
    const h1b = immigrationData.h1b;
    const mapWorksite = (w, isPrimary) => ({
      is_primary: isPrimary,
      worksite_name: w.worksite_name || "",
      city: w.city || "",
      state: w.state || "",
      county: w.county || "",
      zip_code: w.zip_code || "",
      client_contact_name: w.client_manager_name || w.client_contact_name || "",
      client_contact_phone: w.client_manager_phone || w.client_contact_phone || "",
      client_contact_email: w.client_manager_email || w.client_contact_email || "",
    });
    const worksites = [
      ...(h1b.primary_worksite ? [mapWorksite(h1b.primary_worksite, true)] : []),
      ...(h1b.additional_worksites || []).map((w) => mapWorksite(w, false)),
    ];
    const attorneyName = h1b.immigration_attorney || h1b.attorney_name || "";
    const attorneyFirm = h1b.attorney_firm || "";
    const attorney =
      attorneyName || attorneyFirm
        ? {
            name: attorneyName,
            firm_name: attorneyFirm,
            address_line1: h1b.attorney_address || "",
            city: h1b.attorney_city || "",
            state: h1b.attorney_state || "",
            zip_code: h1b.attorney_zip || "",
            phone: h1b.attorney_phone || "",
            email: h1b.attorney_email || "",
            bar_number: h1b.attorney_bar_number || "",
          }
        : undefined;
    return [
      {
        id: `lca-current-${h1b.lca_number || "unknown"}`,
        is_current: true,
        lca_type: "initial",
        case_number: h1b.lca_number || "",
        status: h1b.lca_status || "certified",
        employer_name: h1b.employer_name || "",
        employer_fein: h1b.employer_fein || "",
        certified_date: h1b.lca_certified_date || "",
        validity_start: h1b.lca_validity_start || "",
        validity_end: h1b.lca_validity_end || "",
        job_title: h1b.job_title || "",
        soc_code: h1b.soc_code || "",
        soc_title: h1b.soc_title || "",
        wage_level: h1b.lca_wage_level || h1b.wage_level || undefined,
        prevailing_wage: h1b.lca_prevailing_wage || h1b.prevailing_wage || undefined,
        actual_wage: h1b.lca_actual_wage || h1b.actual_wage || h1b.wage || undefined,
        wage_unit: h1b.lca_wage_unit || h1b.wage_unit || "year",
        full_time: h1b.lca_full_time ?? h1b.full_time ?? true,
        worksites,
        attorney,
      },
    ];
  }, [immigrationData?.h1b]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVisaLabel = (code) => {
    const visa = VISA_TYPES.find((v) => v.code === code);
    return visa ? visa.label : code;
  };

  const candidateVisaStatusRaw =
    candidate?.current_visa_status ?? candidate?.visa_status ?? candidate?.visa_type_current ?? candidate?.visa_type;
  const normalizedCandidateVisaStatus = String(candidateVisaStatusRaw ?? "")
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isCitizenCurrentStatus = ["USC", "US CITIZEN", "CITIZEN"].some((s) =>
    normalizedCandidateVisaStatus.includes(s),
  );
  const isGreenCardCurrentStatus =
    ["GREEN CARD", "PERMANENT RESIDENT", "PERMANENT RESIDENCY"].some((s) =>
      normalizedCandidateVisaStatus.includes(s),
    ) || normalizedCandidateVisaStatus.split(" ").includes("GC");
  const isGCCompletedLikeCurrentStatus =
    isCitizenCurrentStatus ||
    isGreenCardCurrentStatus ||
    normalizedCandidateVisaStatus.includes("GC EAD") ||
    normalizedCandidateVisaStatus === "EAD";
  const shouldShowGCCompletedNote =
    !isCitizenCurrentStatus &&
    (isGreenCardCurrentStatus || (immigrationData && GC_COMPLETED_VISA_TYPES.includes(immigrationData.visa_type)));

  const toVisaTypeCode = (rawStatus) => {
    const status = String(rawStatus ?? "")
      .toUpperCase()
      .replace(/[\s-]+/g, "_")
      .trim();
    if (status === "GREEN_CARD" || status === "GREENCARD" || status === "PERMANENT_RESIDENT") return "GC";
    if (status === "US_CITIZEN" || status === "CITIZEN") return "USC";
    if (status === "H4_EAD" || status === "H4EAD") return "H4_EAD";
    if (status === "L2_EAD" || status === "L2EAD") return "L2_EAD";
    if (status === "OPT_STEM" || status === "STEM_OPT") return "STEM_OPT";
    if (status === "GC_EAD" || status === "GCEAD") return "GC_EAD";
    if (VISA_TYPES.some((v) => v.code === status)) return status;
    return null;
  };

  const shouldShowGCTracker = () => {
    return true;
    // if (!immigrationData) return false;
    // if (isGCCompletedLikeCurrentStatus || GC_COMPLETED_VISA_TYPES.includes(immigrationData.visa_type)) return false;
    // const visaTypeForEligibility = toVisaTypeCode(candidateVisaStatusRaw) ?? immigrationData.visa_type;
    // if (SHOW_GC_TRACKER_VISA_TYPES.includes(visaTypeForEligibility)) return true;
    // if (immigrationData.green_card?.gc_process_started) return true;
    // return false;
  };

  const shouldShowGCTab = () => shouldShowGCTracker() || shouldShowGCCompletedNote;

  // Ordered Section Renderer
  const getSectionOrder = (visaType) => {
    switch (visaType) {
      case "F1":
        return ["opt_block", "cpt", "h1b", "gc", "gc_ead", "h4_ead"];
      case "CPT":
        return ["cpt", "opt_block", "h1b", "gc", "gc_ead", "h4_ead"];
      case "OPT":
        return ["opt_block", "cpt", "h1b", "gc", "gc_ead", "h4_ead"];
      case "STEM_OPT":
        return ["opt_block", "cpt", "h1b", "gc", "gc_ead", "h4_ead"];
      case "H1B":
      case "H1B1":
        return ["h1b", "opt_block", "cpt", "gc", "gc_ead", "h4_ead"];
      case "H4":
      case "H4_EAD":
        return ["h4_ead", "h1b", "gc", "gc_ead", "opt_block", "cpt"];
      case "GC":
        return ["gc", "gc_ead", "h1b", "opt_block", "cpt", "h4_ead"];
      case "L1A":
      case "L1B":
        return ["l1", "h1b", "gc", "gc_ead", "opt_block", "cpt", "h4_ead"];
      case "L2":
      case "L2_EAD":
        return ["l2", "h1b", "gc", "gc_ead", "opt_block", "cpt", "h4_ead"];
      case "GC_EAD":
      case "EAD":
        return ["gc_ead", "gc", "h1b", "opt_block", "cpt", "h4_ead"];
      default:
        return ["h1b", "gc", "gc_ead", "opt_block", "cpt", "h4_ead"];
    }
  };

  const shouldShowSection = (key, visaType) => {
    if (!immigrationData) return false;
    const studentTypes = ["F1", "CPT", "OPT", "STEM_OPT"];
    const optEadRecords =
      immigrationData.ead_records?.filter((e) => ["C03A", "C03B", "C03C"].includes(e.ead_category || "")) || [];
    const h4EadRecords = immigrationData.ead_records?.filter((e) => e.ead_category === "C26") || [];
    const gcEadRecords =
      immigrationData.ead_records?.filter((e) => ["C09", "C09P"].includes(e.ead_category || "")) || [];
    const cptHistoryCount = immigrationData.cpt_history?.length ?? 0;

    switch (key) {
      case "opt_block":
        return (
          studentTypes.includes(visaType) ||
          (immigrationData.i20_history?.length ?? 0) > 0 ||
          optEadRecords.length > 0 ||
          (immigrationData.i983_records?.length ?? 0) > 0
        );
      case "cpt":
        if (visaType === "CPT" || visaType === "F1") return true;
        if (visaType === "OPT" || visaType === "STEM_OPT") return true;
        return cptHistoryCount > 0;
      case "h1b":
        return (
          ["H1B", "H1B1", "H4", "H4_EAD", "L1A", "L1B", "L2", "L2_EAD"].includes(visaType) ||
          (immigrationData.h1b_petitions?.length ?? 0) > 0 ||
          (immigrationData.lca_history?.length ?? 0) > 0
        );
      case "gc":
        return (
          visaType === "GC" || !!immigrationData.green_card?.card_number || !!immigrationData.green_card?.resident_since
        );
      case "gc_ead":
        return ["GC", "GC_EAD", "EAD", "H4", "H4_EAD"].includes(visaType) || gcEadRecords.length > 0;
      case "h4_ead":
        return ["H4", "H4_EAD"].includes(visaType) || h4EadRecords.length > 0;
      case "l1":
        return ["L1A", "L1B"].includes(visaType);
      case "l2":
        return ["L2", "L2_EAD"].includes(visaType);
      default:
        return false;
    }
  };

  const isSectionDefaultExpanded = (key, visaType) => {
    switch (key) {
      case "opt_block":
        return ["F1", "OPT", "STEM_OPT"].includes(visaType);
      case "cpt":
        return visaType === "CPT";
      case "h1b":
        return ["H1B", "H1B1"].includes(visaType);
      case "gc":
        return visaType === "GC";
      case "gc_ead":
        return ["GC_EAD", "EAD", "GC"].includes(visaType);
      case "h4_ead":
        return ["H4", "H4_EAD"].includes(visaType);
      case "l1":
        return ["L1A", "L1B"].includes(visaType);
      case "l2":
        return ["L2", "L2_EAD"].includes(visaType);
      default:
        return false;
    }
  };

  const renderOrderedVisaSections = () => {
    if (!immigrationData) return null;
    const visaType = immigrationData.visa_type;
    const order = getSectionOrder(visaType);

    const optEadRecords =
      immigrationData.ead_records?.filter((e) => ["C03A", "C03B", "C03C"].includes(e.ead_category || "")) || [];
    const h4EadRecords = immigrationData.ead_records?.filter((e) => e.ead_category === "C26") || [];
    const gcEadRecords =
      immigrationData.ead_records?.filter((e) => ["C09", "C09P"].includes(e.ead_category || "")) || [];
    const currentI20 = immigrationData.i20_history?.find((i) => i.is_current);
    const currentEAD = optEadRecords.find((e) => e.is_current);
    const isStudentType = ["F1", "CPT", "OPT", "STEM_OPT"].includes(visaType);

    const sections = [];

    for (const key of order) {
      if (!shouldShowSection(key, visaType)) continue;
      const expanded = isSectionDefaultExpanded(key, visaType);

      switch (key) {
        case "opt_block": {
          const isPrimary = isStudentType;
          sections.push(
            <div key="opt_block" className="!space-y-4">
              {isPrimary ? (
                <>
                  <OPTSection
                    data={immigrationData.opt}
                    isEditing={isEditing}
                    onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, opt: data } : null))}
                    candidateEmail={candidateEmail}
                    candidateId={candidate?.id}
                    visaType={visaType}
                    onEADDataExtracted={handleEADDataExtracted}
                    currentI20={currentI20}
                    currentEAD={currentEAD}
                    allEADRecords={optEadRecords}
                    allI20Records={immigrationData.i20_history}
                    i983Records={immigrationData.i983_records}
                    onI20DataExtracted={handleI20DataExtracted}
                    onSaveI20={handleSaveI20}
                    // onSaveEAD={handleSaveEAD}
                    onSaveEAD={(rawExtractedData, fileInfo) => handleSaveEAD(rawExtractedData, fileInfo, true)}
                    onSaveI983={handleSaveI983}
                    onI983DataExtracted={(data) => console.log("I-983 data extracted:", data)}
                    onRefreshData={loadImmigrationData}
                    onDeleteI20={handleDeleteI20Request}
                    onDeleteEAD={handleDeleteEADRequest}
                    onDeleteI983={handleDeleteI983Request}
                    onI983Change={handleI983Change}
                    onUpdateEvaluation={handleUpdateI983Evaluation}
                    onAddI983={handleAddI983}
                    // onSaveStemOptToggle={onSaveStemOptToggle}
                    onSaveStemOptToggle={handleSaveStemOptToggle}
                    documents={immigrationData.documents || []}
                    onViewDocument={handleViewPetitionDocument}
                  />
                  <I20Section
                    i20History={immigrationData.i20_history || []}
                    historyOnly={true}
                    isEditing={isEditing}
                    candidateEmail={candidateEmail}
                    candidateId={candidate?.id}
                    onDeleteI20={handleDeleteI20Request}
                    onI20Change={handleI20Change}
                    onViewDocument={handleViewPetitionDocument}
                  />
                  <EADSection
                    eadRecords={optEadRecords}
                    historyOnly={true}
                    isEditing={isEditing}
                    candidateEmail={candidateEmail}
                    candidateId={candidate?.id}
                    onDeleteEAD={handleDeleteEADRequest}
                    onEADChange={handleEADChange}
                  />
                </>
              ) : (
                <PreviousOPTHistorySection
                  i20History={immigrationData.i20_history || []}
                  eadRecords={optEadRecords}
                  i983Records={immigrationData.i983_records || []}
                  isEditing={isEditing}
                  candidateEmail={candidateEmail}
                  candidateId={candidate?.id}
                  onDeleteI20={handleDeleteI20Request}
                  onDeleteEAD={handleDeleteEADRequest}
                  onDeleteI983={handleDeleteI983Request}
                  onI20Change={handleI20Change}
                  onEADChange={handleEADChange}
                  onI983Change={handleI983Change}
                  onUpdateEvaluation={handleUpdateI983Evaluation}
                  onViewDocument={handleViewPetitionDocument}
                />
              )}
            </div>,
          );
          break;
        }
        case "cpt": {
          const cptHistory = immigrationData.cpt_history || [];
          const cptCount = cptHistory.length;
          const ftMonths = immigrationData.cumulative_ft_cpt_months || 0;
          const isCPTVisa = visaType === "CPT";
          const isOPTType = visaType === "OPT" || visaType === "STEM_OPT";

          if (isOPTType && cptCount === 0 && !showCPTSection) {
            sections.push(
              <div key="cpt" className="flex items-center gap-2 py-2 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-sm gap-1.5 h-8"
                  onClick={() => setShowCPTSection(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add CPT History
                </Button>
                <span className="text-xs text-muted-foreground">No prior CPT records</span>
              </div>,
            );
            break;
          }

          if (isCPTVisa) {
            sections.push(
              <CPTSection
                key="cpt"
                cptHistory={cptHistory}
                cumulativeFtCptMonths={ftMonths}
                optEligible={immigrationData.opt_eligible ?? true}
                isEditing={isEditing}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                i20History={immigrationData.i20_history || []}
                onSaveCPT={handleSaveCPT}
                onUpdateCPT={handleUpdateCPT}
                onDeleteCPT={handleDeleteCPTRequest}
                onRefreshData={loadImmigrationData}
              />,
            );
            break;
          }

          const summaryText =
            isOPTType || !["F1"].includes(visaType)
              ? `CPT History — ${cptCount} record(s), ${ftMonths} FT months`
              : `CPT — Curricular Practical Training`;

          sections.push(
            <Collapsible key="cpt" defaultOpen={expanded}>
              <Card className="border">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-[16px] font-medium">{summaryText}</CardTitle>
                        {ftMonths >= 12 && (
                          <Badge variant="destructive" className="text-xs">
                            OPT Ineligible
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <CPTSection
                      cptHistory={cptHistory}
                      cumulativeFtCptMonths={ftMonths}
                      optEligible={immigrationData.opt_eligible ?? true}
                      isEditing={isEditing}
                      candidateEmail={candidateEmail}
                      candidateId={candidate?.id}
                      i20History={immigrationData.i20_history || []}
                      onSaveCPT={handleSaveCPT}
                      onUpdateCPT={handleUpdateCPT}
                      onDeleteCPT={handleDeleteCPTRequest}
                      onRefreshData={loadImmigrationData}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>,
          );
          break;
        }
        case "h1b": {
          const petitions = immigrationData.h1b_petitions || deriveH1BPetitions();
          const lcaHistory = immigrationData.lca_history || deriveLCAHistory();
          const isPrimary = ["H1B", "H1B1"].includes(visaType);
          if (!isPrimary && petitions.length > 0) {
            sections.push(
              <PreviousH1BHistorySection
                key="h1b_prev"
                petitions={petitions}
                lcaHistory={lcaHistory}
                isEditing={isEditing}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                onEditPetition={handleEditPetition}
                onDeletePetition={handleDeletePetitionRequest}
                onSetActivePetition={handleSetActivePetition}
                onEditLCA={handleEditLCA}
                onDeleteLCA={handleDeleteLCARequest}
                onSetActiveLCA={handleSetActiveLCA}
                onLinkLCA={handleLinkLCA}
                onPetitionInlineChange={handlePetitionInlineChange}
                onLCAInlineChange={handleLCAInlineChange}
                onI797DataExtracted={handleI797DataExtracted}
                onSaveI797={handleSaveI797}
                onSaveLCA={handleSaveLCA}
                onLCADataExtracted={handleLCADataExtracted}
                onRefreshData={loadImmigrationData}
                onViewDocument={handleViewPetitionDocument} //onViewPetitionDocument
                documents={petitionsDocuments}
                onDocumentsRefresh={loadImmigrationData}
                onLCAChange={(data) => {
                  setImmigrationData((prev) => {
                    if (prev) {
                      const updatedHistory = prev.lca_history.map((h) => (h.id === data.id ? data : h));
                      return { ...prev, lca_history: updatedHistory };
                    }
                    return null;
                  });
                }}
              />,
            );
          } else if (isPrimary) {
            sections.push(
              <H1BSection
                key="h1b"
                h1bPetitions={h1b_petitions}
                data={immigrationData.h1b}
                isEditing={isEditing}
                onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, h1b: data } : null))}
                onPetitionChange={(data) => {
                  setImmigrationData((prev) => {
                    if (prev) {
                      const updatedPetitions = prev.h1b_petitions.map((p) => (p.id === data.id ? data : p));
                      return { ...prev, h1b_petitions: updatedPetitions };
                    }
                    return null;
                  });
                }}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                visaType={visaType}
                onI797DataExtracted={handleI797DataExtracted}
                onLCADataExtracted={handleLCADataExtracted}
                onEADDataExtracted={handleEADDataExtracted}
                petitions={petitions}
                lcaHistory={lcaHistory}
                onEditPetition={handleEditPetition}
                onAddPetition={handleAddPetition}
                onDeletePetition={handleDeletePetitionRequest}
                onSetActivePetition={handleSetActivePetition}
                onEditLCA={handleEditLCA}
                onAddLCA={handleAddLCA}
                onDeleteLCA={handleDeleteLCARequest}
                onSetActiveLCA={handleSetActiveLCA}
                onLinkLCA={handleLinkLCA}
                onPetitionInlineChange={handlePetitionInlineChange}
                onLCAInlineChange={handleLCAInlineChange}
                onSavePetition={handleSavePetition}
                onSaveLCA={handleSaveLCA}
                onSaveI797={handleSaveI797}
                onRefreshData={loadImmigrationData}
                onViewDocument={handleViewPetitionDocument} //onviewDoc
                onManualPetitionSubmit={handleManualPetitionSubmit}
                petitionDocuments={petitionsDocuments}
                onDocumentsRefresh={loadImmigrationData}
                onLCAChange={(data) => {
                  setImmigrationData((prev) => {
                    if (prev) {
                      const updatedHistory = prev.lca_history.map((h) => (h.id === data.id ? data : h));
                      return { ...prev, lca_history: updatedHistory };
                    }
                    return null;
                  });
                }}
              />,
            );
          }
          break;
        }
        case "gc": {
          sections.push(
            <GreenCardSection
              key="gc"
              data={immigrationData.green_card}
              isEditing={isEditing}
              onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, green_card: data } : null))}
              candidateEmail={candidateEmail}
              candidateId={candidate?.id}
              onSaveGC={handleSaveGC}
              onDeleteGC={handleDeleteGC}
              onRefreshData={loadImmigrationData}
            />,
          );
          break;
        }
        case "gc_ead": {
          const isPrimary = ["GC", "GC_EAD", "EAD"].includes(visaType);
          if (isPrimary || gcEadRecords.length > 0) {
            if (!isPrimary) {
              sections.push(
                <PreviousGCEADHistorySection
                  key="gc_ead_prev"
                  eadRecords={immigrationData.ead_records || []}
                  isEditing={isEditing}
                  candidateEmail={candidateEmail}
                  candidateId={candidate?.id}
                  onDeleteEAD={handleDeleteEADRequest}
                  onEADChange={handleEADChange}
                />,
              );
            } else {
              sections.push(
                <GCEADSection
                  key="gc_ead"
                  eadRecords={gcEadRecords}
                  isEditing={isEditing}
                  candidateEmail={candidateEmail}
                  candidateId={candidate?.id}
                  onDeleteEAD={handleDeleteEADRequest}
                  onSaveEAD={handleSaveEAD}
                  onRefreshData={loadImmigrationData}
                  onEADChange={(ead) => {
                    if (immigrationData.ead_records) {
                      const updatedRecords = immigrationData.ead_records.map((e) =>
                        e.id === ead.id ? { ...e, ...ead } : e,
                      );
                      setImmigrationData((prev) => (prev ? { ...prev, ead_records: updatedRecords } : null));
                    }
                  }}
                />,
              );
            }
          }
          break;
        }
        case "h4_ead": {
          const isPrimary = ["H4", "H4_EAD"].includes(visaType);
          if (isPrimary) {
            sections.push(
              <H4EADSection
                key="h4_ead"
                eadRecords={h4EadRecords}
                isEditing={isEditing}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                onDeleteEAD={handleDeleteEADRequest}
                onEADDataExtracted={handleEADDataExtracted}
                onSaveEAD={handleSaveEAD}
                onRefreshData={loadImmigrationData}
                onEADChange={handleEADChange}
              />,
            );
          } else if (h4EadRecords.length > 0) {
            sections.push(
              <PreviousH4EADHistorySection
                key="h4_ead_prev"
                eadRecords={immigrationData.ead_records || []}
                isEditing={isEditing}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                onDeleteEAD={handleDeleteEADRequest}
                onEADChange={handleEADChange}
              />,
            );
          }
          break;
        }
        case "l1": {
          sections.push(
            <L1Section
              key="l1"
              data={immigrationData.l1}
              isEditing={isEditing}
              onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, l1: data } : null))}
            />,
          );
          break;
        }
        case "l2": {
          sections.push(
            <L2DependentSection
              key="l2"
              data={immigrationData.l2_dependent}
              visaType={visaType}
              isEditing={isEditing}
              onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, l2_dependent: data } : null))}
              candidateEmail={candidateEmail}
              candidateId={candidate?.id}
              onEADDataExtracted={handleEADDataExtracted}
            />,
          );
          break;
        }
      }
    }

    if (sections.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Visa-specific fields for {getVisaLabel(immigrationData.visa_type)} are not yet configured.
          </CardContent>
        </Card>
      );
    }
    return <div className="!space-y-4">{sections}</div>;
  };

  const getTabConfig = () => {
    const baseTabs = [
      { value: "overview", label: "Overview", icon: Globe },
      { value: "visa", label: "Visa Details", icon: FileText },
      { value: "passport", label: "Passport & Entry", icon: FileText },
      { value: "travel", label: "Travel", icon: Plane },
      { value: "petitions", label: "Petitions", icon: History },
      { value: "documents", label: "Documents", icon: FileText },
    ];
    if (shouldShowGCTab()) {
      baseTabs.splice(2, 0, { value: "gc-tracker", label: "GC Tracker", icon: Award });
    }
    return baseTabs;
  };

  const tabConfig = getTabConfig();

  if (isLoading) {
    return (
      <div className="signatureContainer">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 !border-b-2 !border-t-0 !border-l-0 !border-r-0 !border-solid border-[#7c3bed] mx-auto"></div>
            <p className="text-sm text-[#67677e]">Loading immigration data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!immigrationData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No immigration data available for this candidate.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="signatureContainer homepageFontfamily">
      <div className="!space-y-4">
        {/* Header with Status and Edit Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <Badge variant="outline" className="text-sm font-medium">
              {getVisaLabel(immigrationData.visa_type)}
            </Badge>
            {getStatusBadge(immigrationData.immigration_status)}
            {immigrationData.alerts.length > 0 && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground border-accent">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {immigrationData.alerts.length} Alert{immigrationData.alerts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8" disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>

        <Separator />

        {/* Sub-tabs */}
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="h-9 p-1 bg-[#f1f1f980] p-1 flex-wrap">
            {tabConfig.map((tab) => {
              const isActive = tab.value === activeSubTab;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`text-xs px-[12px] py-[6px] !rounded-[10px] gap-1.5 data-[state=active]:bg-background ${isActive ? "bg-white text-[#080118]" : "bg-transparent text-[#67677e]"}`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-3 !space-y-4">
            {immigrationData.alerts.length > 0 && <ImmigrationAlertsCard alerts={immigrationData.alerts} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="!text-xs !font-medium text-[#67677e]">Visa Type</CardTitle>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <div className="text-lg font-semibold">{getVisaLabel(immigrationData.visa_type)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {VISA_TYPES.find((v) => v.code === immigrationData.visa_type)?.description}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="!text-xs !font-medium text-[#67677e]">Status Valid Until</CardTitle>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <div className="text-lg font-semibold">
                    {immigrationData.i94.i94_is_duration_of_status
                      ? "D/S"
                      : new Date(immigrationData.i94.i94_expiry_date).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">I-94 Expiry</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="!text-xs !font-medium text-[#67677e]">Passport Expiry</CardTitle>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <div className="text-lg font-semibold">
                    {new Date(immigrationData.passport.passport_expiry_date).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{immigrationData.passport.passport_country}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="!text-xs !font-medium text-[#67677e]">Documents</CardTitle>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold">
                      {immigrationData.documents.filter((d) => d.status === "verified").length}
                    </span>
                    <span className="text-sm text-muted-foreground">verified</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {immigrationData.documents.length} total documents
                  </p>
                </CardContent>
              </Card>
            </div>
            {immigrationData.status_notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status Notes</CardTitle>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <p className="text-sm">{immigrationData.status_notes}</p>
                </CardContent>
              </Card>
            )}
            {immigrationData.petition_history.length > 0 && (
              <ImmigrationTimelineSection petitionHistory={immigrationData.petition_history} />
            )}
          </TabsContent>

          {/* Visa Details Tab */}
          <TabsContent value="visa" className="mt-3 !space-y-4">
            {!isEditing && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddHistoricalOpen(true)} className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Immigration Document
                </Button>
              </div>
            )}
            {renderOrderedVisaSections()}
          </TabsContent>

          {/* GC Tracker Tab */}
          {shouldShowGCTracker() && (
            <TabsContent value="gc-tracker" className="mt-3">
              <GCTrackerTab
                data={immigrationData.green_card}
                isEditing={isEditing}
                onChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, green_card: data } : null))}
                candidateEmail={candidateEmail}
                candidateId={candidate?.id}
                visaType={immigrationData.visa_type}
                gcProcessing={immigrationData.gc_processing || null}
                onGCProcessingChange={(gcData) =>
                  setImmigrationData((prev) => (prev ? { ...prev, gc_processing: gcData } : null))
                }
                onI140DataExtracted={handleI140DataExtracted}
                onPermDataExtracted={handlePermDataExtracted}
                documents={gcTrackerDocuments}
                onDocumentsRefresh={loadImmigrationData}
              />
            </TabsContent>
          )}

          {shouldShowGCCompletedNote && (
            <TabsContent value="gc-tracker" className="mt-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div className="fw-semibold text-[17px] text-[#080118]">Green Card Status: Approved</div>
                  </div>
                  <CardDescription>Green Card process has been completed</CardDescription>
                </CardHeader>
                <CardContent className="!pt-[0] ">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {immigrationData.green_card?.i485?.approval_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Date Obtained</p>
                        <p className="text-sm font-medium">
                          {new Date(immigrationData.green_card.i485.approval_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {immigrationData.green_card?.i485?.card_received_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Card Received</p>
                        <p className="text-sm font-medium">
                          {new Date(immigrationData.green_card.i485.card_received_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {immigrationData.green_card?.gc_category && (
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium">{immigrationData.green_card.gc_category}</p>
                      </div>
                    )}
                    {immigrationData.green_card?.priority_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Priority Date</p>
                        <p className="text-sm font-medium">
                          {new Date(immigrationData.green_card.priority_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Passport & Entry Tab */}
          <TabsContent value="passport" className="mt-3">
            <CommonImmigrationInfo
              passport={immigrationData.passport}
              i94={immigrationData.i94}
              visaStamp={immigrationData.visa_stamp}
              isEditing={isEditing}
              onPassportChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, passport: data } : null))}
              onI94Change={(data) => setImmigrationData((prev) => (prev ? { ...prev, i94: data } : null))}
              onVisaStampChange={(data) => setImmigrationData((prev) => (prev ? { ...prev, visa_stamp: data } : null))}
              candidateEmail={candidateEmail}
              candidateId={candidate?.id}
              onPassportDataExtracted={handlePassportDataExtracted}
              onI94DataExtracted={handleI94DataExtracted}
              onVisaDataExtracted={handleVisaDataExtracted}
              onPassportRawDataExtracted={handleSavePassport}
              onI94RawDataExtracted={handleSaveI94}
              onVisaRawDataExtracted={handleSaveVisaStamp}
              onRefreshData={loadImmigrationData}
              documents={passportEntryDocuments}
              onDocumentsRefresh={loadImmigrationData}
              passportDocumentFile={immigrationData.passportDocumentFile}
              i94DocumentFile={immigrationData.i94DocumentFile}
              visaStampDocumentFile={immigrationData.visaStampDocumentFile}
            />
          </TabsContent>
          {console.log("main immigration data:", immigrationData)}

          {/* Travel Tab */}
          <TabsContent value="travel" className="mt-3">
            <TravelHistorySection
              records={immigrationData.travel_history}
              candidateEmail={candidate?.original_email || ""}
              candidateId={candidate?.id}
              isEditing={isEditing}
              onChange={(records) => setImmigrationData((prev) => (prev ? { ...prev, travel_history: records } : null))}
              onRefresh={loadImmigrationData}
            />
          </TabsContent>

          {/* Petitions Tab */}
          <TabsContent value="petitions" className="mt-3">
            <PetitionHistorySection
              history={immigrationData.petition_history}
              isEditing={isEditing}
              candidateEmail={candidateEmail}
              onChange={(history) =>
                setImmigrationData((prev) => (prev ? { ...prev, petition_history: history } : null))
              }
              visaType={immigrationData.visa_type}
              immigrationStatus={immigrationData.immigration_status}
              onRefresh={loadImmigrationData}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-3">
            <ImmigrationDocumentsSection
              documents={immigrationData.documents}
              candidateEmail={candidateEmail}
              candidateId={candidate?.id}
              visaType={immigrationData.visa_type}
              isEditing={isEditing}
              onRefresh={loadImmigrationData}
              accessLevel="Full Access"
            />
          </TabsContent>
        </Tabs>

        {/* I-94 Update Prompt Dialog */}
        <AlertDialog open={showI94UpdatePrompt} onOpenChange={setShowI94UpdatePrompt}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update I-94 Information?</AlertDialogTitle>
              <AlertDialogDescription>
                The I-797 approval notice contains I-94 information. Would you like to update the I-94 section with this
                data?
                {pendingI94Data && (
                  <div className="mt-2 text-sm">
                    <p>I-94 Number: {pendingI94Data.i94_number}</p>
                    <p>Class: {pendingI94Data.i94_class}</p>
                    <p>
                      Valid: {pendingI94Data.i94_validity_start} to {pendingI94Data.i94_validity_end}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDismissI94Update}>Skip</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmI94Update}>Update I-94</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Petition Modal */}
        <EditPetitionModal
          open={editPetitionModalOpen}
          onOpenChange={setEditPetitionModalOpen}
          petition={editingPetition}
          onSave={handleSavePetition}
          isNew={isNewPetition}
          lcaHistory={immigrationData.lca_history || deriveLCAHistory()}
        />

        {/* Edit LCA Modal */}
        <EditLCAModal
          open={editLCAModalOpen}
          onOpenChange={setEditLCAModalOpen}
          lca={editingLCA}
          onSave={handleSaveLCAFromModal}
          isNew={isNewLCA}
        />

        {/* Duplicate Petition Dialog */}
        <DuplicatePetitionDialog
          open={showDuplicatePetitionDialog}
          onOpenChange={setShowDuplicatePetitionDialog}
          duplicateInfo={duplicatePetitionInfo}
          extractedData={
            pendingH1BExtractedData
              ? {
                  receipt_number:
                    pendingH1BExtractedData?.h1b_data?.petition?.receipt_number ||
                    pendingH1BExtractedData?.immigration_data?.receipt_number,
                  petition_type:
                    pendingH1BExtractedData?.h1b_data?.petition?.petition_type ||
                    pendingH1BExtractedData?.immigration_data?.petition_type,
                  status:
                    pendingH1BExtractedData?.h1b_data?.petition?.status ||
                    pendingH1BExtractedData?.immigration_data?.notice_type,
                  validity_start:
                    pendingH1BExtractedData?.h1b_data?.petition?.validity_start ||
                    pendingH1BExtractedData?.immigration_data?.validity_start,
                  validity_end:
                    pendingH1BExtractedData?.h1b_data?.petition?.validity_end ||
                    pendingH1BExtractedData?.immigration_data?.validity_end,
                  beneficiary_name: pendingH1BExtractedData?.immigration_data?.beneficiary_name,
                  employer_name: pendingH1BExtractedData?.immigration_data?.employer_name,
                  employer_address: pendingH1BExtractedData?.immigration_data?.employer_address,
                  notice_date: pendingH1BExtractedData?.immigration_data?.notice_date,
                }
              : null
          }
          onCancel={handleCancelDuplicateDialog}
          onUpdateExisting={handleUpdateExistingPetition}
          onCreateAnyway={handleCreatePetitionAnyway}
          isLoading={isDuplicateUpdating}
        />

        {/* Duplicate LCA Dialog */}
        <DuplicateLCADialog
          open={showDuplicateLCADialog}
          onOpenChange={setShowDuplicateLCADialog}
          duplicateInfo={duplicateLCAInfo}
          extractedData={
            pendingLCAExtractedData
              ? {
                  lca_case_number: pendingLCAExtractedData?.lca_case_number,
                  job_title: pendingLCAExtractedData?.job_title,
                  soc_code: pendingLCAExtractedData?.soc_code,
                  soc_title: pendingLCAExtractedData?.soc_title,
                  status: pendingLCAExtractedData?.status,
                  employer_name: pendingLCAExtractedData?.employer_name,
                  wage_rate_from: pendingLCAExtractedData?.wage_rate_from,
                  wage_level: pendingLCAExtractedData?.wage_level,
                }
              : null
          }
          onCancel={handleCancelDuplicateLCADialog}
          onUpdateExisting={handleUpdateExistingLCA}
          onCreateAnyway={handleCreateLCAAnyway}
          isLoading={isDuplicateLCAUpdating}
        />

        {/* Delete Confirmation Dialogs */}
        <AlertDialog open={showDeletePetitionDialog} onOpenChange={setShowDeletePetitionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Petition</AlertDialogTitle>
              <AlertDialogDescription>
                Delete petition {deletingPetition?.receipt_number || "draft"}? The linked LCA will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeletePetition}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteLCADialog} onOpenChange={setShowDeleteLCADialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete LCA</AlertDialogTitle>
              <AlertDialogDescription>
                Delete LCA {deletingLCA?.case_number}? This will unlink it from any associated petitions and remove all
                worksites.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteLCA}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteI20Dialog} onOpenChange={setShowDeleteI20Dialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete I-20</AlertDialogTitle>
              <AlertDialogDescription>
                Delete I-20 with SEVIS {deletingI20?.sevis_number || "record"}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteI20}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteEADDialog} onOpenChange={setShowDeleteEADDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete EAD</AlertDialogTitle>
              <AlertDialogDescription>
                Delete EAD {deletingEAD?.ead_number || "record"}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteEAD}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteI983Dialog} onOpenChange={setShowDeleteI983Dialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete I-983</AlertDialogTitle>
              <AlertDialogDescription>
                Delete I-983 training plan for {deletingI983?.employer_name || "employer"}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteI983}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteCPTDialog} onOpenChange={setShowDeleteCPTDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete CPT Record</AlertDialogTitle>
              <AlertDialogDescription>
                This will revoke this CPT authorization. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteCPT}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {viewerDoc?.base64 && (
          <div className="p-0">
            <FilePreview
              fileType={viewerDoc?.type}
              base64File={viewerDoc?.base64}
              setBase64File={() => setViewerDoc(null)}
              setFileType={() => setViewerDoc(null)}
              docObject={{ file_name: viewerDoc.name }}
            />
          </div>
        )}
        {/* Add Historical Document Modal */}
        <AddHistoricalDocumentModal
          open={addHistoricalOpen}
          onOpenChange={setAddHistoricalOpen}
          candidateEmail={candidateEmail}
          candidateId={candidate?.id}
          onUploadComplete={loadImmigrationData}
        />
      </div>
    </div>
  );
}
