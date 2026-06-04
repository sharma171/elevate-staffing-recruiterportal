/**
 * Petition Status Configuration and Utility Functions (Plain JS)
 * Icons replaced with inline SVG references — use your own icon system.
 */

// SVG icon paths for petition statuses (replace with your icon system)
const CheckCircleIcon = '✓';
const ClockIcon = '⏱';
const AlertTriangleIcon = '⚠';
const XCircleIcon = '✗';
const MinusCircleIcon = '−';

export const PETITION_STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    headerLabel: 'APPROVED',
    headerBg: 'bg-green-50 border-green-200',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
    iconSymbol: CheckCircleIcon,
    iconColor: 'text-green-600',
    infoBg: 'bg-green-50',
    infoBorder: 'border-green-200',
  },
  pending: {
    label: 'Pending',
    headerLabel: 'PENDING',
    headerBg: 'bg-yellow-50 border-yellow-200',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconSymbol: ClockIcon,
    iconColor: 'text-yellow-600',
    infoBg: 'bg-yellow-50',
    infoBorder: 'border-yellow-200',
  },
  rfe: {
    label: 'Request for Evidence',
    headerLabel: 'RFE',
    headerBg: 'bg-orange-50 border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    iconSymbol: AlertTriangleIcon,
    iconColor: 'text-orange-600',
    infoBg: 'bg-orange-50',
    infoBorder: 'border-orange-200',
  },
  denied: {
    label: 'Denied',
    headerLabel: 'DENIED',
    headerBg: 'bg-red-50 border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    iconSymbol: XCircleIcon,
    iconColor: 'text-red-600',
    infoBg: 'bg-red-50',
    infoBorder: 'border-red-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    headerLabel: 'WITHDRAWN',
    headerBg: 'bg-gray-50 border-gray-200',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    iconSymbol: MinusCircleIcon,
    iconColor: 'text-gray-500',
    infoBg: 'bg-gray-50',
    infoBorder: 'border-gray-200',
  },
};

const UNKNOWN_STATUS_CONFIG = {
  label: 'Unknown',
  headerLabel: 'UNKNOWN',
  headerBg: 'bg-gray-100 border-gray-300',
  badgeClass: 'bg-gray-100 text-gray-500 border-gray-300',
  iconSymbol: ClockIcon,
  iconColor: 'text-gray-500',
  infoBg: 'bg-gray-100',
  infoBorder: 'border-gray-300',
};

export const getStatusConfig = (status) => {
  if (!status) return UNKNOWN_STATUS_CONFIG;
  return PETITION_STATUS_CONFIG[status] || UNKNOWN_STATUS_CONFIG;
};

// Timezone-safe date formatting
export const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US');
  }
  return new Date(dateString).toLocaleDateString('en-US');
};

// Calculate days since a date
export const calculateDaysSince = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
};

// Get processing status with color coding
export const getProcessingStatus = (days, isPremium) => {
  if (isPremium) {
    if (days > 20) {
      return { color: 'text-red-600', bgColor: 'bg-red-50', message: 'Past premium deadline', isAlert: true };
    }
    if (days > 15) {
      return { color: 'text-orange-600', bgColor: 'bg-orange-50', message: 'Near premium deadline', isAlert: true };
    }
    return { color: 'text-green-600', bgColor: 'bg-green-50', message: `${20 - days}d of premium window left`, isAlert: false };
  }
  if (days > 240) {
    return { color: 'text-red-600', bgColor: 'bg-red-50', message: 'Unusually long processing', isAlert: true };
  }
  if (days > 180) {
    return { color: 'text-orange-600', bgColor: 'bg-orange-50', message: 'Long processing time', isAlert: true };
  }
  if (days > 90) {
    return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', message: 'Normal processing', isAlert: false };
  }
  return { color: 'text-green-600', bgColor: 'bg-green-50', message: 'Recently filed', isAlert: false };
};

// Expiry indicator helper
export const getExpiryStatus = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return { color: 'text-red-600', message: 'Expired' };
  if (daysUntil <= 30) return { color: 'text-red-600', message: `${daysUntil}d left` };
  if (daysUntil <= 60) return { color: 'text-orange-600', message: `${daysUntil}d left` };
  if (daysUntil <= 90) return { color: 'text-yellow-600', message: `${daysUntil}d left` };
  return null;
};

// Format cap status for display
export const formatCapStatus = (capStatus) => {
  if (!capStatus) return "";
  const labels = {
    cap_subject: 'Cap Subject',
    cap_exempt: 'Cap Exempt',
    cap_exempt_masters: 'Cap Exempt (Masters)',
  };
  return labels[capStatus] || capStatus;
};

// Get petition type label
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
