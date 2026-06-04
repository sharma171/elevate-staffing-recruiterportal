// API Configuration
export const API_CONFIG = {
  INVOICE_API_URL: "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app",
  WORKER_API_URL: "https://payables-invoice-extraction-worker-api-v3-305451280005.us-east1.run.app",
  CATEGORIZATION_API_URL: "https://expense-deposit-categorization-engine-v3-305451280005.us-east1.run.app",
  EMPLOYEE_LINK_API_URL: "https://link-employee-to-expenses-v3-305451280005.us-east1.run.app",
  BANK_STATEMENT_API_URL: "https://bank-statement-expenses-api-v3-305451280005.us-east1.run.app",
  ORGANIZATION_API_URL: "https://fetch-update-org-data-emails-v3-305451280005.us-east1.run.app",
  AUTHORIZATION_TOKEN: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",

  // Test credentials
  TEST_EMPLOYEE_EMAIL: "testpreonboard.elevate@gmail.com",
  TEST_EMPLOYER_EMAIL: "rachel.bates@elevatestaffing.ai",
};

// API Helper Function
export async function callInvoiceAPI(action, data = {}) {
  const payload = {
    action: action,
    user_email: API_CONFIG.TEST_EMPLOYER_EMAIL,
    ...data,
  };

  console.log("Calling Invoice API:", payload);

  const response = await fetch(API_CONFIG.INVOICE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
      Origin: window.location.origin,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Invoice API Response:", result);

  return result;
}

// Categorization API Helper Function
export async function callCategorizationAPI(action, data = {}) {
  const payload = {
    action: action,
    user_email: API_CONFIG.TEST_EMPLOYER_EMAIL,
    ...data,
  };

  console.log("Calling Categorization API:", payload);

  const response = await fetch(API_CONFIG.CATEGORIZATION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
      Origin: window.location.origin,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Categorization API Response:", result);

  return result;
}

// Employee Link API Helper Function
export async function callEmployeeLinkAPI(action, data = {}) {
  const payload = {
    action: action,
    user_email: API_CONFIG.TEST_EMPLOYER_EMAIL,
    ...data,
  };

  console.log("Calling Employee Link API:", payload);

  const response = await fetch(API_CONFIG.EMPLOYEE_LINK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
      Origin: window.location.origin,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Employee Link API Response:", result);

  return result;
}

// Bank Statement API Helper Function
export async function callBankStatementAPI(action, data = {}) {
  const payload = {
    action: action,
    user_email: API_CONFIG.TEST_EMPLOYER_EMAIL,
    ...data,
  };

  console.log("Calling Bank Statement API:", payload);

  const response = await fetch(API_CONFIG.BANK_STATEMENT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
      Origin: window.location.origin,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Bank Statement API Response:", result);

  return result;
}
