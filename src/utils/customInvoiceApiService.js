import { API_CONFIG } from "./apiConfig";

const CUSTOM_INVOICE_API_URL = "https://custom-invoice-management-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_TOKEN = API_CONFIG.AUTHORIZATION_TOKEN;

async function makeCustomInvoiceApiRequest(options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_TOKEN,
    Origin: window.location.origin,
    ...headers,
  };

  try {
    const response = await fetch(CUSTOM_INVOICE_API_URL, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Custom Invoice API request failed:", error);
    throw error;
  }
}

// ============= API FUNCTIONS =============

/**
 * Create a new custom invoice
 * Supports two modes:
 * 1. Use existing vendor (provide vendor_id)
 * 2. Create vendor inline (provide vendor_details)
 */
export async function createCustomInvoice(
  employerEmail,
  billToInfo,
  lineItems,
  invoiceDetails,
  vendorId,
  vendorDetails,
) {
  const body = {
    action: "create_custom_invoice",
    employer_email: employerEmail,
    bill_to_info: billToInfo,
    line_items: lineItems,
  };

  if (invoiceDetails) {
    body.invoice_details = invoiceDetails;
  }

  // Use vendor_id if provided (recommended approach)
  if (vendorId) {
    body.vendor_id = vendorId;
  } else if (vendorDetails) {
    // Create vendor inline
    body.vendor_details = vendorDetails;
  } else {
    throw new Error("Either vendor_id or vendor_details must be provided");
  }

  return makeCustomInvoiceApiRequest({ body });
}

/**
 * Create a standalone vendor without creating an invoice
 */
export async function createStandaloneVendor(employerEmail, vendorDetails) {
  return makeCustomInvoiceApiRequest({
    body: {
      action: "create_standalone_vendor",
      employer_email: employerEmail,
      vendor_details: vendorDetails,
    },
  });
}

/**
 * Get a custom invoice by ID with PDF
 */
export async function getCustomInvoice(employerEmail, invoiceId) {
  return makeCustomInvoiceApiRequest({
    body: {
      action: "get_custom_invoice",
      employer_email: employerEmail,
      invoice_id: invoiceId,
    },
  });
}

/**
 * List custom invoices with optional filtering
 */
export async function listCustomInvoices(employerEmail, statusFilter, limit = 50, offset = 0) {
  const body = {
    action: "list_custom_invoices",
    employer_email: employerEmail,
    limit,
    offset,
  };

  if (statusFilter) {
    body.status_filter = statusFilter;
  }

  return makeCustomInvoiceApiRequest({ body });
}

/**
 * Update a custom invoice (only if status is 'Generated' or 'Rejected')
 */
export async function updateCustomInvoice(employerEmail, invoiceId, updateData) {
  return makeCustomInvoiceApiRequest({
    body: {
      action: "update_custom_invoice",
      employer_email: employerEmail,
      invoice_id: invoiceId,
      update_data: updateData,
    },
  });
}

/**
 * Delete (soft delete) a custom invoice
 */
export async function deleteCustomInvoice(employerEmail, invoiceId, reason) {
  return makeCustomInvoiceApiRequest({
    body: {
      action: "delete_custom_invoice",
      employer_email: employerEmail,
      invoice_id: invoiceId,
      reason,
    },
  });
}

/**
 * Send custom invoice via email or mark as sent
 */
export async function sendCustomInvoice(
  employerEmail,
  invoiceId,
  sendMode = "send_now",
  recipientEmails,
  ccEmails,
  emailSubject,
  emailMessage,
) {
  const body = {
    action: "send_custom_invoice",
    employer_email: employerEmail,
    invoice_id: invoiceId,
    send_mode: sendMode,
  };

  if (sendMode === "send_now") {
    if (!recipientEmails || recipientEmails.length === 0) {
      throw new Error("recipient_emails is required when send_mode is 'send_now'");
    }
    body.recipient_emails = recipientEmails;

    if (ccEmails && ccEmails.length > 0) {
      body.cc_emails = ccEmails;
    }

    if (emailSubject) {
      body.email_subject = emailSubject;
    }

    if (emailMessage) {
      body.email_message = emailMessage;
    }
  }

  return makeCustomInvoiceApiRequest({ body });
}

// ============= UTILITY FUNCTIONS =============

/**
 * Convert base64 string to Blob for download
 */
export function base64ToBlob(base64, mimeType = "application/pdf") {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Trigger PDF download from base64
 */
export function downloadPDF(base64Content, fileName) {
  const blob = base64ToBlob(base64Content);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for API (YYYY-MM-DD)
 */
export function formatDateForAPI(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Calculate line item amount
 */
export function calculateLineItemAmount(quantity, unitPrice) {
  if (quantity && unitPrice) {
    return quantity * unitPrice;
  }
  return 0;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(lineItems, taxRate = 0) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * Validate line items
 */
export function validateLineItems(lineItems) {
  if (!lineItems || lineItems.length === 0) {
    return { valid: false, error: "At least one line item is required" };
  }

  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];

    if (!item.description || item.description.trim() === "") {
      return { valid: false, error: `Line item ${i + 1}: Description is required` };
    }

    const hasQuantityAndPrice = item.quantity && item.unit_price;
    const hasAmount = item.amount;

    if (!hasQuantityAndPrice && !hasAmount) {
      return { valid: false, error: `Line item ${i + 1}: Must have either (quantity + unit_price) or amount` };
    }
  }

  return { valid: true };
}
