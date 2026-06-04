import { STRIPE_CONFIG } from "@/config/stripe.config";

const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: STRIPE_CONFIG.authToken,
    Origin: window.location.origin,
  };
};

// Create a Financial Connections session
export async function createConnectionSession(userEmail) {
  const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.createSession}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_email: userEmail,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// List all connected accounts
export async function listAccounts(userEmail) {
  const url = new URL(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.listAccounts}`);
  url.searchParams.append("user_email", userEmail);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Sync transactions for an account
export async function syncTransactions(accountId, userEmail, daysBack = 90) {
  const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.sync}/${accountId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_email: userEmail,
      days_back: daysBack,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Disconnect an account
export async function disconnectAccount(accountId, userEmail) {
  const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.disconnect}/${accountId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_email: userEmail,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get account details
export async function getAccountDetails(accountId, userEmail) {
  const url = new URL(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.listAccounts}`);
  url.searchParams.append("user_email", userEmail);
  url.searchParams.append("account_id", accountId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
