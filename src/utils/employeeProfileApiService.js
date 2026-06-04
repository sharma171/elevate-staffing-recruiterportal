import { API_CONFIG } from "./apiConfig";

const EMPLOYEE_PROFILE_API_URL = "https://fetch-update-employee-details-v3-1070441464709.us-east1.run.app";

// Test credentials
const TEST_EMAIL = "kondaiah.thiruveedi@gmail.com";
const TEST_ORG_ID = "cff1c72f-b62c-4f5a-a680-77e4d0d89a60";

async function callEmployeeProfileAPI(body) {
  const response = await fetch(EMPLOYEE_PROFILE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function getEmployeeProfile() {
  return callEmployeeProfileAPI({
    email: TEST_EMAIL,
    organization_id: TEST_ORG_ID,
    action: "get_profile",
  });
}

export async function updateEmployeeProfile(candidateId, profileData) {
  return callEmployeeProfileAPI({
    email: TEST_EMAIL,
    organization_id: TEST_ORG_ID,
    action: "update_profile",
    profile_data: {
      id: candidateId,
      ...profileData,
    },
  });
}

export async function updateDirectDeposit(candidateId, accounts) {
  return callEmployeeProfileAPI({
    email: TEST_EMAIL,
    organization_id: TEST_ORG_ID,
    action: "update_profile",
    accounts_operation: "replace",
    profile_data: {
      id: candidateId,
      direct_deposit_accounts: { accounts },
    },
  });
}

export async function getEmployeeImmigration() {
  return callEmployeeProfileAPI({
    email: "muni.k0892@gmail.com",
    organization_id: TEST_ORG_ID,
    action: "get_immigration",
  });
}
