/**
 * Document Linking Utilities (Plain JS)
 */

export const SECTION_DOC_TYPES = {
  passport: "passport",
  i94: "i94",
  visa_stamp: "visa_stamp",
  ead_card: "ead_card",
  gc_card: "gc_card",
  h1b_approval: "h1b_approval",
  lca: "lca",
  i20: "i20",
  i983: "i983",
  i140: "i140_approval",
  i485: "i485_approval",
};

/**
 * Get a document for a section using the two-method approach
 */
export function getSectionDoc(documents, fileRef, docType) {
  if (!documents || documents.length === 0) return null;

  if (fileRef) {
    const doc = documents.find((d) => d.file_name === fileRef);
    if (doc) return doc;
  }

  const typedDocs = documents.filter((d) => d.immigration_doc_type === docType || d.doc_type === docType);

  if (typedDocs.length > 0) {
    return typedDocs.sort((a, b) => {
      const dateA = new Date(a.uploaded_at || 0);
      const dateB = new Date(b.uploaded_at || 0);
      return dateB.getTime() - dateA.getTime();
    })[0];
  }

  return null;
}

/**
 * Get all documents for a section
 */
export function getDocsForSection(documents, docType) {
  if (!documents || documents.length === 0) return [];

  return documents
    .filter((d) => d.immigration_doc_type === docType || d.doc_type === docType)
    .sort((a, b) => {
      const dateA = new Date(a.uploaded_at || 0);
      const dateB = new Date(b.uploaded_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Check if a document is expired
 */
export function isDocumentExpired(doc) {
  const expiry = doc.expiry_date || doc.doc_expiry;
  if (!expiry) return false;
  const expiryDate = new Date(expiry);
  return expiryDate < new Date();
}

/**
 * Check if a document is expiring soon (within 90 days)
 */
export function isDocumentExpiringSoon(doc, daysThreshold = 90) {
  const expiry = doc.expiry_date || doc.doc_expiry;
  if (!expiry) return false;
  const expiryDate = new Date(expiry);
  const now = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
}

/**
 * Get document expiry status
 */
export function getDocumentExpiryStatus(doc) {
  const expiry = doc.expiry_date || doc.doc_expiry;
  if (!expiry) return "unknown";
  if (isDocumentExpired(doc)) return "expired";
  if (isDocumentExpiringSoon(doc)) return "expiring";
  return "valid";
}

/**
 * Format a date string for display
 */
export function formatDocDate(dateString) {
  if (!dateString) return "—";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncate a filename for display
 */
export function truncateFileName(fileName, maxLength = 25) {
  if (!fileName) return "";
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const baseName = extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
  const truncatedBase = baseName.slice(0, maxLength - 3 - (extension ? extension.length + 1 : 0));
  return extension ? `${truncatedBase}...${extension}` : `${truncatedBase}...`;
}
