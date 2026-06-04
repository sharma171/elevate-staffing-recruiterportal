// H-1B Petition and LCA History Types (Plain JS)

// Helper to get display label for petition type
export const getPetitionTypeLabel = (type) => {
  const labels = {
    initial: 'Initial',
    transfer: 'Transfer',
    extension: 'Extension',
    amendment: 'Amendment',
    concurrent: 'Concurrent',
  };
  return labels[type] || type;
};

// Helper to get display label for petition status
export const getPetitionStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    denied: 'Denied',
    rfe: 'RFE Received',
    withdrawn: 'Withdrawn',
  };
  return labels[status] || status;
};

// Helper to get display label for LCA status
export const getLCAStatusLabel = (status) => {
  const labels = {
    certified: 'Certified',
    pending: 'Pending',
    withdrawn: 'Withdrawn',
    denied: 'Denied',
  };
  return labels[status] || status;
};

// Helper to get display label for LCA type
export const getLCATypeLabel = (type) => {
  const labels = {
    initial: 'Initial',
    amendment: 'Amendment',
  };
  return labels[type] || type;
};

// Helper to format worksites for display
export const formatWorksitesDisplay = (worksites) => {
  if (!worksites || worksites.length === 0) return '—';
  return worksites
    .map(w => `${w.worksite_name || w.city || 'Unknown'} (${w.state || '?'})`)
    .join(', ');
};

// LCA-specific constants
export const LCA_TYPES = [
  { value: 'initial', label: 'Initial' },
  { value: 'amendment', label: 'Amendment' },
];

export const LCA_STATUSES = [
  { value: 'certified', label: 'Certified' },
  { value: 'pending', label: 'Pending' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'denied', label: 'Denied' },
];

export const WAGE_LEVELS = [
  { value: 'level_1', label: 'Level I (Entry)' },
  { value: 'level_2', label: 'Level II (Qualified)' },
  { value: 'level_3', label: 'Level III (Experienced)' },
  { value: 'level_4', label: 'Level IV (Fully Competent)' },
];

export const WAGE_UNITS = [
  { value: 'year', label: 'Per Year' },
  { value: 'month', label: 'Per Month' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'week', label: 'Per Week' },
  { value: 'hour', label: 'Per Hour' },
];
