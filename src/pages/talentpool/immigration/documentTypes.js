/**
 * Document Type Constants and Section Filtering Logic (Plain JS)
 */

// Visa Details Section Documents
export const VISA_DETAILS_DOC_TYPES = [
  { code: "visa_stamp", name: "Visa Stamp" },
  { code: "h1b_visa", name: "H1B Visa" },
  { code: "l1_visa", name: "L1 Visa" },
  { code: "l1a_visa", name: "L1A Visa" },
  { code: "l1b_visa", name: "L1B Visa" },
  { code: "h4_visa", name: "H4 Visa" },
  { code: "l2_visa", name: "L2 Visa" },
  { code: "f1_visa", name: "F1 Visa" },
  { code: "b1_b2_visa", name: "B1/B2 Visa" },
  { code: "ead_card", name: "EAD Card" },
  { code: "ead_receipt", name: "EAD Receipt Notice" },
  { code: "advance_parole", name: "Advance Parole (AP)" },
  { code: "combo_card", name: "Combo Card (EAD + AP)" },
  { code: "visa_supporting_doc", name: "Supporting Document" },
  { code: "visa_other", name: "Other" },
];

export const GC_TRACKER_DOC_TYPES = [
  { code: "perm_application", name: "PERM Application" },
  { code: "perm_certification", name: "PERM Certification" },
  { code: "perm_audit", name: "PERM Audit Response" },
  { code: "perm_recruitment", name: "PERM Recruitment Docs" },
  { code: "i140_receipt", name: "I-140 Receipt Notice" },
  { code: "i140_approval", name: "I-140 Approval Notice" },
  { code: "i485_receipt", name: "I-485 Receipt Notice" },
  { code: "i485_approval", name: "I-485 Approval Notice" },
  { code: "green_card", name: "Green Card (Front/Back)" },
  { code: "gc_ead", name: "GC-based EAD" },
  { code: "priority_date_proof", name: "Priority Date Proof" },
  { code: "gc_supporting_doc", name: "Supporting Document" },
  { code: "gc_other", name: "Other" },
];

export const PASSPORT_ENTRY_DOC_TYPES = [
  { code: "passport", name: "Passport" },
  { code: "passport_bio", name: "Passport Bio Page" },
  { code: "old_passport", name: "Old/Expired Passport" },
  { code: "i94", name: "I-94 (Current)" },
  { code: "i94_history", name: "I-94 Travel History" },
  { code: "entry_stamp", name: "Entry Stamp" },
  { code: "cbp_admission", name: "CBP Admission Record" },
  { code: "travel_itinerary", name: "Travel Itinerary" },
  { code: "passport_supporting_doc", name: "Supporting Document" },
  { code: "passport_other", name: "Other" },
];

export const LCA_DOC_TYPES = [
  { code: "lca_certified", name: "LCA Certified" },
  { code: "lca_application", name: "LCA Application" },
  { code: "lca_amendment", name: "LCA Amendment" },
  { code: "lca_withdrawn", name: "LCA Withdrawn" },
  { code: "prevailing_wage", name: "Prevailing Wage Determination" },
  { code: "lca_posting", name: "LCA Posting Notice" },
  { code: "public_access_file", name: "LCA Public Access File" },
  { code: "lca_supporting_doc", name: "Supporting Document" },
  { code: "lca_other", name: "Other" },
];

export const PETITIONS_DOC_TYPES = [
  { code: "i797_approval", name: "I-797 Approval Notice" },
  { code: "i797_receipt", name: "I-797 Receipt Notice" },
  { code: "i797_extension", name: "I-797 Extension" },
  { code: "i797_amendment", name: "I-797 Amendment" },
  { code: "i797_transfer", name: "I-797 Transfer" },
  { code: "i129_petition", name: "I-129 Petition" },
  { code: "i129s_blanket", name: "I-129S (Blanket L)" },
  { code: "rfe_notice", name: "RFE Notice" },
  { code: "rfe_response", name: "RFE Response" },
  { code: "noid_notice", name: "NOID Notice" },
  { code: "noid_response", name: "NOID Response" },
  { code: "denial_notice", name: "Denial Notice" },
  { code: "appeal_document", name: "Appeal Document" },
  { code: "supporting_letter", name: "Supporting Letter" },
  { code: "client_letter", name: "Client Letter" },
  { code: "project_letter", name: "Project Letter" },
  { code: "sow_msa", name: "SOW / MSA" },
  { code: "specialty_occupation", name: "Specialty Occupation Proof" },
  { code: "petition_supporting_doc", name: "Supporting Document" },
  { code: "petition_other", name: "Other" },
];

export const GENERAL_DOC_TYPES = [
  { code: "Passport", name: "Passport", apiType: "passport" },
  { code: "Visa Stamp", name: "Visa Stamp", apiType: "visa" },
  { code: "H1B Approval Notice I797", name: "H-1B Approval Notice (I-797)", apiType: "h1b_approval" },
  { code: "I-797", name: "I-797 (Other Notices)", apiType: "i797" },
  { code: "EAD Card", name: "EAD Card", apiType: "ead_card" },
  { code: "I-20 Student", name: "I-20 (Student)", apiType: "i20" },
  { code: "I-94 Record", name: "I-94 Record", apiType: "i94" },
  { code: "I-140 Petition", name: "I-140 Petition", apiType: "i140" },
  { code: "PERM Certification", name: "PERM Certification", apiType: "perm" },
  { code: "LCA Form 9035", name: "LCA (Form 9035)", apiType: "lca" },
  { code: "Green Card", name: "Green Card", apiType: "gc_card" },
  { code: "Driver's License", name: "Driver's License", apiType: "drivers_license" },
  { code: "SSN Card", name: "Social Security Card", apiType: "ssn_card" },
  { code: "Resume", name: "Resume/CV", apiType: "resume" },
  { code: "I-983 Training Plan", name: "I-983 Training Plan", apiType: "i983" },
  { code: "Offer Letter", name: "Offer Letter" },
  { code: "Employment Contract", name: "Employment Contract" },
  { code: "Pay Stubs", name: "Pay Stubs" },
  { code: "W2 Form", name: "W2 Form" },
  { code: "Tax Returns", name: "Tax Returns" },
  { code: "Degree Certificate", name: "Degree Certificate" },
  { code: "Transcripts", name: "Transcripts" },
  { code: "Credential Evaluation", name: "Credential Evaluation" },
  { code: "Experience Letter", name: "Experience Letter" },
  { code: "Birth Certificate", name: "Birth Certificate" },
  { code: "Marriage Certificate", name: "Marriage Certificate" },
  { code: "Dependent Documents", name: "Dependent Documents" },
  { code: "Photo ID", name: "Photo ID" },
  { code: "Supporting Document", name: "Supporting Document" },
  { code: "Other", name: "Other" },
];

export const ALL_DOC_TYPES = [
  ...VISA_DETAILS_DOC_TYPES,
  ...GC_TRACKER_DOC_TYPES,
  ...PASSPORT_ENTRY_DOC_TYPES,
  ...LCA_DOC_TYPES,
  ...PETITIONS_DOC_TYPES,
  ...GENERAL_DOC_TYPES,
];

/**
 * Get document types for a specific section
 */
export function getDocumentTypesForSection(section) {
  switch (section) {
    case "visa_details":
      return VISA_DETAILS_DOC_TYPES;
    case "gc_tracker":
      return GC_TRACKER_DOC_TYPES;
    case "passport_entry":
      return PASSPORT_ENTRY_DOC_TYPES;
    case "lca":
      return LCA_DOC_TYPES;
    case "petitions":
      return PETITIONS_DOC_TYPES;
    case "general":
    default:
      return GENERAL_DOC_TYPES;
  }
}

/**
 * Check if a document belongs to a specific section based on doc_type or filename
 */
function matchesSection(docType, section, fileName) {
  const type = (docType || "").toLowerCase();
  const name = (fileName || "").toLowerCase();

  switch (section) {
    case "visa_details":
      return (
        type.includes("visa") ||
        type.includes("ead") ||
        type.includes("combo") ||
        type.includes("advance_parole") ||
        type.includes("ap_card") ||
        name.includes("visa") ||
        name.includes("ead") ||
        name.includes("h1b") ||
        name.includes("h-1b") ||
        name.includes("l1") ||
        name.includes("l-1") ||
        name.includes("h4") ||
        name.includes("h-4") ||
        name.includes("l2") ||
        name.includes("l-2")
      );
    case "gc_tracker":
      return (
        type.includes("perm") ||
        type.includes("i140") ||
        type.includes("i485") ||
        type.includes("gc") ||
        type.includes("green_card") ||
        type.includes("priority_date") ||
        name.includes("perm") ||
        name.includes("i-140") ||
        name.includes("i140") ||
        name.includes("i-485") ||
        name.includes("i485") ||
        name.includes("green card") ||
        name.includes("greencard")
      );
    case "passport_entry":
      return (
        type.includes("passport") ||
        type.includes("i94") ||
        type.includes("entry") ||
        type.includes("cbp") ||
        type.includes("travel_itinerary") ||
        name.includes("passport") ||
        name.includes("i-94") ||
        name.includes("i94")
      );
    case "lca":
      return (
        type.includes("lca") ||
        type.includes("prevailing_wage") ||
        type.includes("posting") ||
        type.includes("public_access") ||
        name.includes("lca") ||
        name.includes("i-200") ||
        name.includes("labor condition")
      );
    case "petitions":
      return (
        type.includes("i797") ||
        type.includes("i129") ||
        type.includes("petition") ||
        type.includes("rfe") ||
        type.includes("noid") ||
        type.includes("denial") ||
        type.includes("appeal") ||
        type.includes("client_letter") ||
        type.includes("project_letter") ||
        type.includes("sow") ||
        type.includes("msa") ||
        type.includes("specialty_occupation") ||
        name.includes("i-797") ||
        name.includes("i797") ||
        name.includes("i-129") ||
        name.includes("i129") ||
        name.includes("receipt") ||
        name.includes("approval") ||
        name.includes("rfe") ||
        name.includes("petition")
      );
    case "general":
    default:
      return false;
  }
}

/**
 * Filter documents by section based on doc_type field and filename
 */
export function filterDocumentsBySection(documents, section) {
  if (section === "general") {
    return documents.filter((doc) => {
      const docType = doc.doc_type || "";
      const fileName = doc.file_name || doc.doc_name || "";
      return (
        !matchesSection(docType, "visa_details", fileName) &&
        !matchesSection(docType, "gc_tracker", fileName) &&
        !matchesSection(docType, "passport_entry", fileName) &&
        !matchesSection(docType, "lca", fileName) &&
        !matchesSection(docType, "petitions", fileName)
      );
    });
  }
  return documents.filter((doc) => matchesSection(doc.doc_type || "", section, doc.file_name || doc.doc_name || ""));
}

/**
 * Get display name for a document type code
 */
export function getDocumentTypeName(docTypeCode) {
  if (!docTypeCode || docTypeCode === "other" || docTypeCode === "immigration") {
    return "Other Document";
  }
  const found = ALL_DOC_TYPES.find((t) => t.code === docTypeCode);
  if (found) return found.name;
  return docTypeCode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Determine which section a document belongs to
 */
export function getDocumentSection(docType, fileName) {
  if (matchesSection(docType, "visa_details", fileName)) return "visa_details";
  if (matchesSection(docType, "gc_tracker", fileName)) return "gc_tracker";
  if (matchesSection(docType, "passport_entry", fileName)) return "passport_entry";
  if (matchesSection(docType, "lca", fileName)) return "lca";
  if (matchesSection(docType, "petitions", fileName)) return "petitions";
  return "general";
}
