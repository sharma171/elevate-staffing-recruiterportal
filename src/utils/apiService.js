const API_BASE_URL = "https://contact-employees-via-email-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export async function makeApiRequest(endpoint = "", options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_HEADER,
    ...headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export async function generateOfferLetterDocument(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "send_offer_letter",
      ...params,
    },
  });
}

export async function generateOfferLetterPreview(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "send_offer_letter",
      ...params,
    },
  });
}

export async function sendOfferLetter(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "send_offer_letter",
      ...params,
    },
  });
}

// Generate letter with optional signature request
export async function generateLetter(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "generate_letter",
      ...params,
    },
  });
}

export async function generateCustomEmail(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "generate_custom_email",
      ...params,
    },
  });
}

export async function sendCustomEmail(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "generate_custom_email_send",
      ...params,
    },
  });
}

// HR Tickets API Configuration
const HR_TICKETS_BASE_URL = "https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app";
const HR_SUBMIT_BASE_URL = "https://submit-hr-ticket-employee-v3-305451280005.us-east1.run.app";

async function makeHRApiRequest(baseUrl, endpoint = "", options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_HEADER,
    ...headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("HR API request failed:", error);
    throw error;
  }
}

// HR Ticket API Functions
export async function getEmployeeTickets(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "get_tickets",
      ...params,
    },
  });
}

export async function getTicketDetails(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "get_ticket_details",
      ...params,
    },
  });
}

export async function addCommunication(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "add_communication",
      ...params,
    },
  });
}

export async function getOrgTickets(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "get_org_tickets",
      ...params,
    },
  });
}

export async function updateTicketStatus(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "update_ticket_status",
      ...params,
    },
  });
}

export async function submitHRTicket(params) {
  return makeHRApiRequest(HR_SUBMIT_BASE_URL, "", {
    method: "POST",
    body: {
      action: "submit_ticket",
      ...params,
    },
  });
}

export async function submitSatisfactionRating(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "submit_satisfaction",
      ...params,
    },
  });
}

// Get individual attachment with content
export async function getAttachment(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "get_attachment",
      ...params,
    },
  });
}

// Get all attachments for a ticket (metadata only)
export async function getTicketAttachments(params) {
  return makeHRApiRequest(HR_TICKETS_BASE_URL, "", {
    method: "POST",
    body: {
      action: "get_ticket_attachments",
      ...params,
    },
  });
}

// ============= VENDOR MANAGEMENT API =============
const VENDOR_MANAGEMENT_BASE_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app";

async function makeVendorApiRequest(options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_HEADER,
    Origin: window.location.origin,
    ...headers,
  };

  try {
    const response = await fetch(VENDOR_MANAGEMENT_BASE_URL, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Vendor API request failed:", error);
    throw error;
  }
}

// Assign Vendor to Employee
export async function assignVendorToEmployee(params) {
  const requestBody = {
    action: "assign_vendor_to_employee",
    ...params,
  };

  try {
    const response = await makeVendorApiRequest({
      method: "POST",
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error("Assign vendor failed:", error);
    throw error;
  }
}

// Get Vendor Details
export async function getVendorDetails(employer_email, employee_email) {
  const requestBody = {
    action: "get_vendor_details",
    employer_email,
    employee_email,
  };

  try {
    const response = await makeVendorApiRequest({
      method: "POST",
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error("Get vendor details failed:", error);
    throw error;
  }
}

// Update Vendor
export async function updateVendor(params) {
  const requestBody = {
    action: "update_vendor",
    ...params,
  };

  try {
    const response = await makeVendorApiRequest({
      method: "POST",
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error("Update vendor failed:", error);
    throw error;
  }
}

// Delete Vendor
export async function deleteVendor(params) {
  const requestBody = {
    action: "delete_vendor",
    ...params,
  };

  try {
    const response = await makeVendorApiRequest({
      method: "POST",
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error("Delete vendor failed:", error);
    throw error;
  }
}

const TIMESHEET_API_URL = "https://view-download-timesheets-v3-305451280005.us-east1.run.app";

export async function fetchTimesheets(params) {
  const requestBody = {
    task: "fetch_timesheets",
    ...params,
  };

  try {
    const response = await fetch(TIMESHEET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=", // Same as vendor API
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Timesheet API Error:", error);
    throw error;
  }
}

export async function getAllVendors(params) {
  const requestBody = {
    action: "get_all_vendors",
    ...params,
  };

  try {
    const response = await makeVendorApiRequest({
      method: "POST",
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error("Get all vendors failed:", error);
    throw error;
  }
}

const SUBMIT_TIMESHEET_API_URL = "https://submit-monthly-timesheet-v3-305451280005.us-east1.run.app";

export async function submitTimesheet(params) {
  const formData = new FormData();
  formData.append("primary_email", params.primary_email);
  formData.append("month", params.month);
  formData.append("year", params.year);
  formData.append("start_date", params.start_date);
  formData.append("end_date", params.end_date);
  formData.append("total_hours", params.total_hours.toString());
  if (params.comments) {
    formData.append("comments", params.comments);
  }
  formData.append("timesheet_file", params.timesheet_file);

  try {
    const response = await fetch(SUBMIT_TIMESHEET_API_URL, {
      method: "POST",
      headers: {
        Origin: window.location.origin,
        Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=", // Same as vendor API
        // Note: Don't set Content-Type for multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Submit Timesheet API Error:", error);
    throw error;
  }
}

export async function sendCustomDocument(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "send_custom_document",
      ...params,
    },
  });
}

// ============= GENERATE JOB DESCRIPTION =============

export async function generateJobDescription(params) {
  return makeApiRequest("", {
    method: "POST",
    body: {
      action: "generate_job_description",
      ...params,
    },
  });
}
