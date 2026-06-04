// Dashboard API Service - Simplified to match existing invoicing pattern
const API_BASE_URL = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Details_Frontend_Dashboard_v3";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const makeApiRequest = async (requestBody) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Dashboard API request failed:", error);
    throw error;
  }
};

// Get dashboard summary (initial load)
export const getDashboardSummary = async (assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai") => {
  return makeApiRequest({
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "dashboard_summary",
  });
};

// Get timesheet details
export const getTimesheetDetails = async (
  filter,
  assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai",
  period,
) => {
  const requestBody = {
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "timesheet_details",
    filter,
  };

  if (period) {
    requestBody.period = period;
  }

  return makeApiRequest(requestBody);
};

// Get weekly report details
export const getWeeklyDetails = async (
  filter,
  assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai",
  weekEndDate,
) => {
  const requestBody = {
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "weekly_details",
    filter,
  };

  if (weekEndDate) {
    requestBody.week_end_date = weekEndDate;
  }

  return makeApiRequest(requestBody);
};

// Get account details
export const getAccountDetails = async (filter, assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai") => {
  const requestBody = {
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "account_details",
    filter,
  };

  return makeApiRequest(requestBody);
};

// Get I-9 and E-Verify details
export const getI9EverifyDetails = async (filter, assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai") => {
  const requestBody = {
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "i9_everify_details",
    filter,
  };

  return makeApiRequest(requestBody);
};

// Get document monitoring details
export const getDocumentDetails = async (filter, assignedRecruiterEmail = "rachel.bates@elevatestaffing.ai") => {
  const requestBody = {
    assigned_recruiter_email: assignedRecruiterEmail,
    task_name: "document_details",
    filter,
  };

  return makeApiRequest(requestBody);
};
