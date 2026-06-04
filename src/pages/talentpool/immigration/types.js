// Immigration Tab Type Definitions (Plain JS - no TypeScript)

// Section mapping for extracted data routing
export const SECTION_MAPPING = {
  'passport': 'passport_entry',
  'visa': 'visa_details',
  'visa_stamp': 'visa_details',
  'i797': 'petitions',
  'h1b_approval': 'h1b_details',
  'lca': 'h1b_details',
  'ead': 'visa_details',
  'ead_card': 'opt_details',
  'i20': 'opt_details',
  'i94': 'passport_entry',
  'i140': 'gc_tracker',
  'perm': 'gc_tracker',
  'green_card': 'visa_details',
  'gc_card': 'visa_details',
  'drivers_license': 'documents',
  'resume': 'candidate_info',
  'ssn_card': 'documents',
};

// NOTE: All TypeScript interfaces/types have been removed.
// The shapes are documented in the original types.ts for reference.
// JSX components use these as plain JS objects without type annotations.
