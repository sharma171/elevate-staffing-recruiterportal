const RECRUITERS_API_URL = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";
const ANALYSIS_API_URL = "https://us-east1-recruiterportal.cloudfunctions.net/fetch_recruiter_analysis_v3";
const NO_SUBMISSIONS_API_URL =
  "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3";
const DEFAULT_EMAIL = "marketing@4spheresolutions.com";
const AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: AUTH_TOKEN,
});

// Fetch all recruiters
export async function fetchRecruiters(emailId = DEFAULT_EMAIL) {
  const response = await fetch(RECRUITERS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      operation: "retrieve",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recruiters");
  }

  const result = await response.json();
  return result.data || [];
}

// Fetch recruiter analysis details
export async function fetchRecruiterAnalysis(recruiterEmail, emailId = DEFAULT_EMAIL) {
  const response = await fetch(ANALYSIS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      email: recruiterEmail,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recruiter analysis");
  }

  return response.json();
}

// Fetch no-submission history for a candidate
export async function fetchNoSubmissionHistory(candidateEmail, emailId = DEFAULT_EMAIL) {
  const response = await fetch(NO_SUBMISSIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      email: candidateEmail,
      operation: "retrieve",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch no-submission history");
  }

  const result = await response.json();
  return result.data || [];
}

// Add a new no-submission reason for a candidate
export async function addNoSubmissionReason(candidateEmail, reason, emailId = DEFAULT_EMAIL) {
  const response = await fetch(NO_SUBMISSIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      email: candidateEmail,
      operation: "insert",
      no_submission_reason: reason,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add no-submission reason");
  }

  return response.json();
}

// Analyze a single candidate's no-submission history with GPT
export async function analyzeCandidateNoSubmissions(candidateEmail, emailId = DEFAULT_EMAIL) {
  const response = await fetch(NO_SUBMISSIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      email: candidateEmail,
      operation: "analyze",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to analyze candidate");
  }

  return response.json();
}

// Bulk analyze multiple candidates' no-submission history with GPT
export async function bulkAnalyzeCandidates(options, emailId = DEFAULT_EMAIL) {
  const body = {
    emailid: emailId,
    operation: "bulk_analyze",
  };

  if (options.recruiterEmail) {
    body.recruiter_email = options.recruiterEmail;
  }
  if (options.emails && options.emails.length > 0) {
    body.emails = options.emails;
  }
  if (options.limit) {
    body.limit = options.limit;
  }

  const response = await fetch(NO_SUBMISSIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to bulk analyze candidates");
  }

  return response.json();
}

// Fetch recruiter performance analysis (new operation)
export async function fetchRecruiterPerformanceAnalysis(recruiterEmail, daysBack = 30, emailId = DEFAULT_EMAIL) {
  const response = await fetch(NO_SUBMISSIONS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      emailid: emailId,
      operation: "recruiter_analysis",
      recruiter_email: recruiterEmail,
      days_back: daysBack,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch recruiter performance analysis");
  }

  return response.json();
}
