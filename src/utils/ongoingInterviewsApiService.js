import { API_CONFIG } from "./apiConfig";

const API_URL = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Candidate_Interview_Details_v3";
const RATE_CONFIRMATIONS_API_URL =
  "https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
  Origin: window.location.origin,
});

// Fetch ongoing interviews (only interview-status records)
export async function fetchOngoingInterviews() {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      operation: "retrieve",
      from_email: "marketing@4spheresolutions.com",
      role: "super admin",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ongoing interviews");
  }

  const result = await response.json();

  // Handle array response
  if (Array.isArray(result)) {
    return result;
  }

  // Handle object response (convert to array)
  return Object.values(result).filter((item) => typeof item === "object" && item !== null && "id" in item);
}

// Insert new interview with duplicate detection handling
export async function insertInterview(data) {
  const { from_email, ...restData } = data;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      operation: "insert",
      from_email: from_email || "marketing@4spheresolutions.com",
      role: "super admin",
      ...restData,
    }),
  });

  const result = await response.json();

  // Handle duplicate found (409)
  if (response.status === 409 && result.warning === "duplicate_found") {
    return {
      success: false,
      duplicate: result,
    };
  }

  if (!response.ok) {
    throw new Error(result.error || "Failed to insert interview");
  }

  // Check for info about other recruiter submissions (success with info)
  const insertResult = {
    success: true,
    message: result.message,
  };

  if (result.info || result.other_recruiter_submissions) {
    insertResult.info = {
      info: result.info,
      other_recruiter_submissions: result.other_recruiter_submissions,
    };
  }

  return insertResult;
}

// Update interview
export async function updateInterview(data) {
  const { id, ...updateFields } = data;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      operation: "update",
      from_email: "marketing@4spheresolutions.com",
      role: "super admin",
      id,
      ...updateFields,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update interview");
  }

  return response.json();
}

// Check for duplicate in rate confirmations
export async function checkForDuplicate(candidateName, clientName) {
  if (!candidateName || !clientName) {
    return { found: false };
  }

  try {
    const response = await fetch(RATE_CONFIRMATIONS_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        emailid: "marketing@4spheresolutions.com",
        role: "super admin",
        search_candidate: candidateName,
        page: 1,
        page_size: 50,
      }),
    });

    if (!response.ok) {
      return { found: false };
    }

    const result = await response.json();

    // Extract records from response
    const records = result.data
      ? Object.values(result.data).filter((item) => typeof item === "object" && item !== null && "id" in item)
      : Object.values(result).filter((item) => typeof item === "object" && item !== null && "id" in item);

    // Find matching record (case-insensitive)
    const match = records.find(
      (record) =>
        record.candidate_full_name?.toLowerCase() === candidateName.toLowerCase() &&
        record.client_name?.toLowerCase() === clientName.toLowerCase(),
    );

    if (match) {
      return { found: true, existingRecord: match };
    }

    return { found: false };
  } catch (error) {
    console.error("Error checking for duplicate:", error);
    return { found: false };
  }
}

// Update existing rate confirmation record (for when user chooses to update existing)
export async function updateExistingRateConfirmation(id, data) {
  const response = await fetch(RATE_CONFIRMATIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: "marketing@4spheresolutions.com",
      role: "super admin",
      modify: {
        id,
        columns: data,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update rate confirmation");
  }

  return response.json();
}

export const INTERVIEW_STATUSES = [
  "Online Test",
  "Technical Screening",
  "Interview Round 1",
  "Interview Round 2",
  "Interview Round 3",
];

export const TIMEZONES = ["EST", "CST", "MST", "PST", "IST", "GMT", "CET", "JST", "AEST"];
