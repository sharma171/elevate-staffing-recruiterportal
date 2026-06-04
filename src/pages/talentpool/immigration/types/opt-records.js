// OPT/I-20/EAD Record Types (Plain JS)

// Helper to get display label for degree level
export const getDegreeLevelLabel = (level) => {
  if (!level) return '—';
  const normalizedLevel = level.toLowerCase();
  const labels = {
    associate: "Associate's",
    bachelors: "Bachelor's",
    bachelor: "Bachelor's",
    masters: "Master's",
    master: "Master's",
    phd: 'Ph.D.',
    doctorate: 'Ph.D.',
  };
  return labels[normalizedLevel] || level;
};

// Helper to get display label for I-20 type
export const getI20TypeLabel = (type) => {
  if (!type) return '—';
  const labels = {
    initial: 'Initial I-20',
    transfer: 'Transfer',
    opt_recommendation: 'OPT Recommendation',
    stem_extension: 'STEM Extension',
    cpt_authorization: 'CPT Authorization',
    program_extension: 'Program Extension',
  };
  return labels[type] || type;
};

// Legacy mapping helper: Frontend opt_type → Backend i20_type
export const mapFrontendOptTypeToBackend = (optType) => {
  switch (optType) {
    case 'pre_completion':
    case 'post_completion':
      return 'opt_recommendation';
    case 'stem_opt':
      return 'stem_extension';
    default:
      return 'initial';
  }
};

// Helper to get display label for EAD category
export const getEADCategoryLabel = (category) => {
  const labels = {
    C03A: 'C03A (Pre-Completion OPT)',
    C03B: 'C03B (Post-Completion OPT)',
    C03C: 'C03C (STEM OPT)',
    C26: 'C26 (H-4 EAD)',
    C09: 'C09 (I-485 Pending)',
  };
  return labels[category] || category;
};

// Helper to get EAD status label
export const getEADStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    denied: 'Denied',
  };
  return labels[status] || status;
};

// I-20/EAD constants for dropdowns
export const DEGREE_LEVELS = [
  { value: 'associate', label: "Associate's" },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'Ph.D.' },
];

export const I20_TYPES = [
  { value: 'initial', label: 'Initial I-20' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'opt_recommendation', label: 'OPT Recommendation' },
  { value: 'stem_extension', label: 'STEM Extension' },
  { value: 'cpt_authorization', label: 'CPT Authorization' },
  { value: 'program_extension', label: 'Program Extension' },
];

export const EAD_CATEGORIES = [
  { value: 'C03A', label: 'C03A (Pre-Completion OPT)' },
  { value: 'C03B', label: 'C03B (Post-Completion OPT)' },
  { value: 'C03C', label: 'C03C (STEM OPT)' },
  { value: 'C26', label: 'C26 (H-4 EAD)' },
  { value: 'C09', label: 'C09 (I-485 Pending)' },
  { value: 'other', label: 'Other' },
];

export const EAD_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'denied', label: 'Denied' },
];
