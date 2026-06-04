// Petition Status Configuration and Utility Functions
import { CheckCircle, Clock, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

export const PETITION_STATUS_CONFIG = {
  approved: {
    label: "Approved",
    headerLabel: "APPROVED",
    headerBg: "bg-green-50 border-green-200 border-[1px] border-solid",
    badgeClass: "!bg-green-100 !text-green-800 !border-green-200 border-[1px] border-solid",
    icon: CheckCircle,
    iconColor: "text-green-600",
    infoBg: "bg-green-50",
    infoBorder: "border-green-200",
  },
  pending: {
    label: "Pending",
    headerLabel: "PENDING",
    headerBg: "bg-yellow-50 border-yellow-200",
    badgeClass: "!bg-yellow-100 !text-yellow-800 !border-yellow-200",
    icon: Clock,
    iconColor: "!text-yellow-600",
    infoBg: "bg-yellow-50",
    infoBorder: "border-yellow-200",
  },
  rfe: {
    label: "Request for Evidence",
    headerLabel: "RFE",
    headerBg: "bg-orange-50 border-orange-200",
    badgeClass: "!bg-orange-100 !text-orange-800 !border-orange-200",
    icon: AlertTriangle,
    iconColor: "text-orange-600",
    infoBg: "bg-orange-50",
    infoBorder: "border-orange-200",
  },
  denied: {
    label: "Denied",
    headerLabel: "DENIED",
    headerBg: "bg-red-50 border-red-200",
    badgeClass: "!bg-red-100 !text-red-800 !border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
    infoBg: "bg-red-50",
    infoBorder: "border-red-200",
  },
  withdrawn: {
    label: "Withdrawn",
    headerLabel: "WITHDRAWN",
    headerBg: "bg-gray-50 border-gray-200",
    badgeClass: "!bg-gray-100 !text-gray-600 !border-gray-200",
    icon: MinusCircle,
    iconColor: "text-gray-500",
    infoBg: "bg-gray-50",
    infoBorder: "border-gray-200",
  },
};

const UNKNOWN_STATUS_CONFIG = {
  label: "Unknown",
  headerLabel: "UNKNOWN",
  headerBg: "bg-muted border-muted-foreground/20",
  badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
  icon: Clock,
  iconColor: "text-muted-foreground",
  infoBg: "bg-muted",
  infoBorder: "border-muted-foreground/20",
};

export const getStatusConfig = (status) => {
  if (!status) return UNKNOWN_STATUS_CONFIG;
  return PETITION_STATUS_CONFIG[status] || UNKNOWN_STATUS_CONFIG;
};

export const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

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

export const getProcessingStatus = (days, isPremium) => {
  if (isPremium) {
    if (days > 20)
      return { color: "text-red-600", bgColor: "bg-red-50", message: "Past premium deadline", isAlert: true };
    if (days > 15)
      return { color: "text-orange-600", bgColor: "bg-orange-50", message: "Near premium deadline", isAlert: true };
    return {
      color: "text-green-600",
      bgColor: "bg-green-50",
      message: `${20 - days}d of premium window left`,
      isAlert: false,
    };
  }
  if (days > 240)
    return { color: "text-red-600", bgColor: "bg-red-50", message: "Unusually long processing", isAlert: true };
  if (days > 180)
    return { color: "text-orange-600", bgColor: "bg-orange-50", message: "Long processing time", isAlert: true };
  if (days > 90)
    return { color: "text-yellow-600", bgColor: "bg-yellow-50", message: "Normal processing", isAlert: false };
  return { color: "text-green-600", bgColor: "bg-green-50", message: "Recently filed", isAlert: false };
};

export const getExpiryStatus = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { color: "text-red-600", message: "Expired" };
  if (daysUntil <= 30) return { color: "text-red-600", message: `${daysUntil}d left` };
  if (daysUntil <= 60) return { color: "text-orange-600", message: `${daysUntil}d left` };
  if (daysUntil <= 90) return { color: "text-yellow-600", message: `${daysUntil}d left` };
  return null;
};

export const formatCapStatus = (capStatus) => {
  if (!capStatus) return "";
  const labels = {
    cap_subject: "Cap Subject",
    cap_exempt: "Cap Exempt",
    cap_exempt_masters: "Cap Exempt (Masters)",
  };
  return labels[capStatus] || capStatus;
};

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
