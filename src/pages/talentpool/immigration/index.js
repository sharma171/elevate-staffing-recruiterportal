// Employer Immigration barrel export (Plain JS)
// Components will be converted to JSX in subsequent batches

export { ImmigrationTab } from "./ImmigrationTab";
export { CommonImmigrationInfo } from "./CommonImmigrationInfo";
export { H1BSection } from "./H1BSection";
export { OPTSection } from "./OPTSection";
export { H4EADSection } from "./H4EADSection";
export { L1Section } from "./L1Section";
export { L2DependentSection } from "./L2DependentSection";
export { GreenCardSection } from "./GreenCardSection";
export { GCEADSection } from "./GCEADSection";
export { GCTrackerTab } from "./GCTrackerTab";
export { DependentInfoSection } from "./DependentInfoSection";
export { LCAUploadModal } from "./LCAUploadModal";
export { TravelHistorySection } from "./TravelHistorySection";
export { TravelHistoryImportReviewPanel } from "./TravelHistoryImportReviewPanel";
export { EditTravelRecordModal } from "./EditTravelRecordModal";
export { DocBadge, DocBadgeInline } from "./DocBadge";
export * from "./documentLinkingUtils";
export { PetitionHistorySection } from "./PetitionHistorySection";
export { ImmigrationDocumentsSection } from "./ImmigrationDocumentsSection";
export { ImmigrationAlertsCard } from "./ImmigrationAlertsCard";
export { ImmigrationTimelineSection } from "./ImmigrationTimelineSection";
export { PreviousH1BHistorySection } from "./PreviousH1BHistorySection";
export { UploadDocumentModal } from "./UploadDocumentModal";
export { SmartUploadDocumentModal } from "./SmartUploadDocumentModal";
export { SmartUploadButton } from "./SmartUploadButton";
export { DocumentReviewPanel } from "./DocumentReviewPanel";
export { DocumentViewerModal } from "./DocumentViewerModal";
export { SectionDocumentsList } from "./SectionDocumentsList";
export { EditDocumentModal } from "./EditDocumentModal";
export { RenameDocumentModal } from "./RenameDocumentModal";
export * from "./documentTypes";
export { H1BPetitionCard } from "./H1BPetitionCard";
export { LCAHistoryCard } from "./LCAHistoryCard";
export { H1BPetitionsSection } from "./H1BPetitionsSection";
export { EditPetitionModal } from "./EditPetitionModal";
export { EditLCAModal } from "./EditLCAModal";
export { DuplicatePetitionDialog } from "./DuplicatePetitionDialog";
export { I20Section } from "./I20Section";
export { EADSection } from "./EADSection";
export { I983Section } from "./I983Section";
export { PreviousOPTHistorySection } from "./PreviousOPTHistorySection";
export { PreviousH4EADHistorySection } from "./PreviousH4EADHistorySection";
export { PreviousGCEADHistorySection } from "./PreviousGCEADHistorySection";
export {
  PetitionStatusCard,
  PetitionActions,
  AddPetitionModal,
  PETITION_STATUS_CONFIG,
  getStatusConfig,
  formatDateSafe,
  calculateDaysSince,
  getProcessingStatus,
  getExpiryStatus,
  formatCapStatus,
} from "./petition-status";
export * from "./types";
export * from "./types/h1b-petitions";
export {
  getDegreeLevelLabel,
  getI20TypeLabel,
  getEADCategoryLabel,
  getEADStatusLabel,
  DEGREE_LEVELS,
  I20_TYPES,
  EAD_CATEGORIES,
  EAD_STATUSES,
  mapFrontendOptTypeToBackend,
} from "./types/opt-records";
export * from "./constants";
export { CPTSection } from "./CPTSection";
export * from "./types/cpt-records";
