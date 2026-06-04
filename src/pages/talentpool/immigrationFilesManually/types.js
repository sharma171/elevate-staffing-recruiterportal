/**
 * Immigration Tab Type Definitions (Plain JS - no TypeScript)
 *
 * All interfaces/types have been removed. These are documented here as JSDoc
 * comments for reference. Objects conforming to these shapes are used throughout
 * the employer immigration module.
 */

/**
 * @typedef {string} VisaType
 * One of: 'H1B','H1B1','H4','H4_EAD','L1A','L1B','L2','L2_EAD',
 *         'F1','OPT','STEM_OPT','CPT','TN','E2','E3','O1',
 *         'GC','GC_EAD','EAD','USC','OTHER'
 */

/**
 * @typedef {string} ImmigrationStatus - 'active' | 'pending' | 'expired' | 'revoked'
 * @typedef {string} DocumentStatus - 'uploaded' | 'verified' | 'rejected' | 'expired' | 'missing'
 * @typedef {string} AlertLevel - 'info' | 'warning' | 'critical'
 */

// Section mapping for extracted data routing
export const SECTION_MAPPING = {
  passport: "passport_entry",
  visa: "visa_details",
  visa_stamp: "visa_details",
  i797: "petitions",
  h1b_approval: "h1b_details",
  lca: "h1b_details",
  ead: "visa_details",
  ead_card: "opt_details",
  i20: "opt_details",
  i94: "passport_entry",
  i140: "gc_tracker",
  perm: "gc_tracker",
  green_card: "visa_details",
  gc_card: "visa_details",
  drivers_license: "documents",
  resume: "candidate_info",
  ssn_card: "documents",
};

// I-20/EAD constants for dropdowns
export const DEGREE_LEVELS = [
  { value: "associate", label: "Associate's" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "Ph.D." },
];

export const I20_TYPES = [
  { value: "initial", label: "Initial I-20" },
  { value: "transfer", label: "Transfer" },
  { value: "opt_recommendation", label: "OPT Recommendation" },
  { value: "stem_extension", label: "STEM Extension" },
  { value: "cpt_authorization", label: "CPT Authorization" },
  { value: "program_extension", label: "Program Extension" },
];

export const EAD_CATEGORIES = [
  { value: "C03A", label: "C03A (Pre-Completion OPT)" },
  { value: "C03B", label: "C03B (Post-Completion OPT)" },
  { value: "C03C", label: "C03C (STEM OPT)" },
  { value: "C26", label: "C26 (H-4 EAD)" },
  { value: "C09", label: "C09 (I-485 Pending)" },
  { value: "other", label: "Other" },
];

export const EAD_STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "denied", label: "Denied" },
];

export const getDegreeLevelLabel = (level) => {
  if (!level) return "—";
  const normalizedLevel = level.toLowerCase();
  const labels = {
    associate: "Associate's",
    bachelors: "Bachelor's",
    bachelor: "Bachelor's",
    masters: "Master's",
    master: "Master's",
    phd: "Ph.D.",
    doctorate: "Ph.D.",
  };
  return labels[normalizedLevel] || level;
};
// Helper to get display label for I-20 type
export const getI20TypeLabel = (type) => {
  if (!type) return "—";
  const labels = {
    initial: "Initial I-20",
    transfer: "Transfer",
    opt_recommendation: "OPT Recommendation",
    stem_extension: "STEM Extension",
    cpt_authorization: "CPT Authorization",
    program_extension: "Program Extension",
  };
  return labels[type] || type;
};

/**
 * H-1B Petition and LCA History Types (Plain JS)
 * All TypeScript interfaces removed. See JSDoc comments for shape reference.
 */

// Helper to get display label for petition type
export const getPetitionTypeLabel = (type) => {
  const labels = {
    initial: "Initial",
    transfer: "Transfer",
    extension: "Extension",
    amendment: "Amendment",
    concurrent: "Concurrent",
  };
  return labels[type] || type;
};

// Helper to get display label for petition status
export const getPetitionStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
    rfe: "RFE Received",
    withdrawn: "Withdrawn",
  };
  return labels[status] || status;
};

// Helper to get display label for LCA status
export const getLCAStatusLabel = (status) => {
  const labels = {
    certified: "Certified",
    pending: "Pending",
    withdrawn: "Withdrawn",
    denied: "Denied",
  };
  return labels[status] || status;
};

// Helper to get display label for LCA type
export const getLCATypeLabel = (type) => {
  const labels = {
    initial: "Initial",
    amendment: "Amendment",
  };
  return labels[type] || type;
};

// Helper to format worksites for display
export const formatWorksitesDisplay = (worksites) => {
  if (!worksites || worksites.length === 0) return "—";
  return worksites.map((w) => `${w.worksite_name || w.city || "Unknown"} (${w.state || "?"})`).join(", ");
};

// LCA-specific constants
export const LCA_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "amendment", label: "Amendment" },
];

export const LCA_STATUSES = [
  { value: "certified", label: "Certified" },
  { value: "pending", label: "Pending" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "denied", label: "Denied" },
];

export const WAGE_LEVELS = [
  { value: "level_1", label: "Level I (Entry)" },
  { value: "level_2", label: "Level II (Qualified)" },
  { value: "level_3", label: "Level III (Experienced)" },
  { value: "level_4", label: "Level IV (Fully Competent)" },
];

export const WAGE_UNITS = [
  { value: "year", label: "Per Year" },
  { value: "month", label: "Per Month" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "week", label: "Per Week" },
  { value: "hour", label: "Per Hour" },
];
