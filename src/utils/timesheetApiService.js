// Timesheet Management API Service
// Submit API: https://submit-monthly-timesheet-v3-305451280005.us-east1.run.app
// View/Download API: https://view-download-timesheets-v3-305451280005.us-east1.run.app

const TIMESHEET_SUBMIT_API_URL = "https://submit-monthly-timesheet-v3-305451280005.us-east1.run.app";
const TIMESHEET_VIEW_API_URL = "https://view-download-timesheets-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";
const DEFAULT_EMAIL = "muni.k0892@gmail.com";

// ============= API FUNCTIONS =============

/**
 * Get all timesheets for an employee (using submit API)
 */
export async function getTimesheets(email) {
  const employeeEmail = email || DEFAULT_EMAIL;

  try {
    const response = await fetch(
      `${TIMESHEET_SUBMIT_API_URL}?action=get_timesheets&email=${encodeURIComponent(employeeEmail)}`,
      {
        method: "GET",
        headers: {
          Origin: window.location.origin,
          Authorization: AUTHORIZATION_HEADER,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get Timesheets API Error:", error);
    throw error;
  }
}

// ============= VIEW/DOWNLOAD API FUNCTIONS =============

/**
 * Fetch timesheets with invoice status (using view API)
 */
export async function fetchTimesheets(params) {
  try {
    const response = await fetch(TIMESHEET_VIEW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        task: "fetch_timesheets",
        primary_email: params?.primary_email || DEFAULT_EMAIL,
        ...(params?.month && { month: params.month }),
        ...(params?.year && { year: params.year }),
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Timesheets API Error:", error);
    throw error;
  }
}

/**
 * Fetch daily hours breakdown for a manual timesheet
 */
export async function fetchDocumentHours(params) {
  try {
    const response = await fetch(TIMESHEET_VIEW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        task: "fetch_document_hours",
        primary_email: params.primary_email || DEFAULT_EMAIL,
        document_id: params.document_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Document Hours API Error:", error);
    throw error;
  }
}

/**
 * Download timesheet files as base64-encoded data
 */
export async function downloadTimesheets(params) {
  try {
    const response = await fetch(TIMESHEET_VIEW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        task: "download_timesheets",
        primary_email: params.primary_email || DEFAULT_EMAIL,
        document_ids: params.document_ids,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Download Timesheets API Error:", error);
    throw error;
  }
}

/**
 * Helper: Download a single timesheet file to browser
 */
export async function downloadTimesheetFile(documentId, email) {
  const result = await downloadTimesheets({
    primary_email: email,
    document_ids: [documentId],
  });

  if (result.status === "success" && result.files && result.files.length > 0) {
    const file = result.files[0];

    // Decode base64 and create download
    const byteCharacters = atob(file.base64_content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    throw new Error(result.error || "Failed to download timesheet");
  }
}

// ============= SUBMIT API FUNCTIONS =============

/**
 * Submit a file-based timesheet
 */
export async function submitFileTimesheet(params) {
  const formData = new FormData();

  const meta = {
    primary_email: params.primary_email || DEFAULT_EMAIL,
    month: params.month,
    year: params.year,
    hours: params.hours,
    submission_method: "file",
    force_update: params.force_update || false,
  };

  formData.append("meta", JSON.stringify(meta));
  formData.append("file", params.file);

  try {
    const response = await fetch(TIMESHEET_SUBMIT_API_URL, {
      method: "POST",
      headers: {
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Submit File Timesheet API Error:", error);
    throw error;
  }
}

/**
 * Submit a manual entry timesheet
 */
export async function submitManualTimesheet(params) {
  const meta = {
    primary_email: params.primary_email || DEFAULT_EMAIL,
    month: params.month,
    year: params.year,
    submission_method: "manual",
    force_update: params.force_update || false,
    comments: params.comments || "",
    daily_entries: params.daily_entries,
  };

  const formData = new FormData();
  formData.append("meta", JSON.stringify(meta));

  try {
    const response = await fetch(TIMESHEET_SUBMIT_API_URL, {
      method: "POST",
      headers: {
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Submit Manual Timesheet API Error:", error);
    throw error;
  }
}

/**
 * Get timesheet details
 */
export async function getTimesheetDetails(params) {
  try {
    const response = await fetch(`${TIMESHEET_SUBMIT_API_URL}?action=get_details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        document_id: params.document_id,
        email: params.email || DEFAULT_EMAIL,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get Timesheet Details API Error:", error);
    throw error;
  }
}

/**
 * Edit a file-based timesheet
 */
export async function editFileTimesheet(params) {
  try {
    const response = await fetch(`${TIMESHEET_SUBMIT_API_URL}?action=edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        document_id: params.document_id,
        primary_email: params.primary_email || DEFAULT_EMAIL,
        ...(params.comments !== undefined && { comments: params.comments }),
        ...(params.hours !== undefined && { hours: params.hours }),
        ...(params.file_data && { file_data: params.file_data }),
        ...(params.file_name && { file_name: params.file_name }),
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Edit File Timesheet API Error:", error);
    throw error;
  }
}

/**
 * Edit a manual entry timesheet
 */
export async function editManualTimesheet(params) {
  try {
    const response = await fetch(`${TIMESHEET_SUBMIT_API_URL}?action=edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        document_id: params.document_id,
        primary_email: params.primary_email || DEFAULT_EMAIL,
        ...(params.comments !== undefined && { comments: params.comments }),
        ...(params.daily_entries && { daily_entries: params.daily_entries }),
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Edit Manual Timesheet API Error:", error);
    throw error;
  }
}

/**
 * Delete a timesheet
 */
export async function deleteTimesheet(params) {
  try {
    const response = await fetch(`${TIMESHEET_SUBMIT_API_URL}?action=delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        document_id: params.document_id,
        primary_email: params.primary_email || DEFAULT_EMAIL,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Delete Timesheet API Error:", error);
    throw error;
  }
}

/**
 * Helper: Convert File to base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Helper: Format month string (e.g., "122024" -> "December 2024")
 */
export function formatMonthDisplay(monthStr) {
  if (!monthStr || monthStr.length < 6) return monthStr;

  const month = parseInt(monthStr.slice(0, 2), 10);
  const year = monthStr.slice(2);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${monthNames[month - 1]} ${year}`;
}
