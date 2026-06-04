import { API_CONFIG } from "./apiConfig";

const API_BASE = "https://retrieve-connected-bank-transactions-v3-305451280005.us-east1.run.app";

const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
    Origin: window.location.origin,
  };
};

// Fetch transactions with filters
export async function fetchTransactions(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE}/transactions?${searchParams}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Update single transaction
export async function updateTransaction(transactionId, params) {
  const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Bulk update transactions
export async function bulkUpdateTransactions(params) {
  const response = await fetch(`${API_BASE}/transactions/bulk-update`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get available categories
export async function getCategories() {
  const response = await fetch(`${API_BASE}/categories`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get categorization rules
export async function getCategorizationRules(userEmail) {
  const response = await fetch(`${API_BASE}/categorization-rules?user_email=${encodeURIComponent(userEmail)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Delete categorization rule
export async function deleteCategorizationRule(ruleId, userEmail) {
  const response = await fetch(`${API_BASE}/categorization-rules/${ruleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_email: userEmail }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get transaction with documents
export async function getTransactionWithDocuments(transactionId, userEmail) {
  const response = await fetch(
    `${API_BASE}/transactions/${transactionId}?user_email=${encodeURIComponent(userEmail)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Upload document
export async function uploadDocument(params) {
  const response = await fetch(`${API_BASE}/transactions/documents/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Download document
export async function downloadDocument(documentId, userEmail) {
  const response = await fetch(`${API_BASE}/transactions/documents/${documentId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_email: userEmail }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Delete document
export async function deleteDocument(documentId, userEmail) {
  const response = await fetch(`${API_BASE}/transactions/documents/${documentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_email: userEmail }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
