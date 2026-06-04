// CPT (Curricular Practical Training) Record Types (Plain JS)

// Academic term options
export const ACADEMIC_TERMS = [
  { value: 'Spring 2024', label: 'Spring 2024' },
  { value: 'Summer 2024', label: 'Summer 2024' },
  { value: 'Fall 2024', label: 'Fall 2024' },
  { value: 'Spring 2025', label: 'Spring 2025' },
  { value: 'Summer 2025', label: 'Summer 2025' },
  { value: 'Fall 2025', label: 'Fall 2025' },
  { value: 'Spring 2026', label: 'Spring 2026' },
  { value: 'Summer 2026', label: 'Summer 2026' },
  { value: 'Fall 2026', label: 'Fall 2026' },
];

// Calculate months between two dates
export const calculateMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;
};

// Get CPT status color
export const getCPTProgressColor = (months) => {
  if (months >= 12) return 'bg-destructive';
  if (months > 10) return 'bg-destructive/80';
  if (months >= 8) return 'bg-yellow-500';
  return 'bg-primary';
};

export const getCPTProgressTextColor = (months) => {
  if (months >= 12) return 'text-destructive';
  if (months > 10) return 'text-destructive/80';
  if (months >= 8) return 'text-yellow-600';
  return 'text-primary';
};
