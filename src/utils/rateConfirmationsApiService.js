import { API_CONFIG } from "./apiConfig";

const API_URL = "https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3";
const DEFAULT_EMAIL = "marketing@4spheresolutions.com";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
  Origin: window.location.origin,
});

// Interview-related statuses that should trigger redirect to Ongoing Interviews
export const INTERVIEW_STATUSES = [
  "Online Test",
  "Technical Screening",
  "Interview Round 1",
  "Interview Round 2",
  "Interview Round 3",
];

export function isInterviewStatus(status) {
  return INTERVIEW_STATUSES.some((s) => s.toLowerCase() === status.toLowerCase());
}

// Fetch rate confirmations with pagination and search
export async function fetchRateConfirmations(options = {}) {
  const {
    emailId = DEFAULT_EMAIL,
    page = 1,
    pageSize = 50,
    searchCandidate,
    searchRecruiter,
    submissionStatus,
    dateFrom,
    dateTo,
  } = options;

  const body = {
    emailid: emailId,
    role: "super admin",
    page,
    page_size: pageSize,
  };

  if (searchCandidate) {
    body.search_candidate = searchCandidate;
  }
  if (searchRecruiter) {
    body.search_recruiter = searchRecruiter;
  }
  if (submissionStatus) {
    body.submission_status = submissionStatus;
  }
  if (dateFrom) {
    body.date_from = dateFrom;
  }
  if (dateTo) {
    body.date_to = dateTo;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rate confirmations");
  }

  const result = await response.json();

  // Handle paginated response
  if (result.pagination) {
    const confirmations = Object.values(result.data || {}).filter(
      (item) => typeof item === "object" && item !== null && "id" in item,
    );
    return {
      data: confirmations.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime()),
      pagination: result.pagination,
    };
  }

  // Handle non-paginated response (backward compatibility)
  const confirmations = Object.values(result).filter(
    (item) => typeof item === "object" && item !== null && "id" in item,
  );

  return {
    data: confirmations.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime()),
    pagination: {
      total_records: confirmations.length,
      total_pages: 1,
      current_page: 1,
      page_size: confirmations.length,
    },
  };
}

// Get suggestions for typeahead
export async function getSuggestions(searchTerm, emailId = DEFAULT_EMAIL) {
  if (searchTerm.length < 3) {
    return { candidates: [], recruiters: [] };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      operation: "suggestions",
      search_term: searchTerm,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return response.json();
}

// Insert new rate confirmation
export async function insertRateConfirmation(data, emailId = DEFAULT_EMAIL) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      operation: "insert",
      columns: data,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to insert rate confirmation");
  }

  return response.json();
}

// Update rate confirmation
export async function updateRateConfirmation(id, columns, emailId = DEFAULT_EMAIL) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      role: "super admin",
      modify: {
        id,
        columns,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update rate confirmation");
  }

  return response.json();
}

// Delete rate confirmation
export async function deleteRateConfirmation(id, emailId = DEFAULT_EMAIL) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      role: "super admin",
      operation: "delete",
      id,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete rate confirmation");
  }

  return response.json();
}
