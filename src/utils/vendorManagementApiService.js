import { API_CONFIG } from "./apiConfig";

const VENDOR_MANAGEMENT_API_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_TOKEN = API_CONFIG.AUTHORIZATION_TOKEN;

async function makeVendorManagementApiRequest(options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_TOKEN,
    Origin: window.location.origin,
    ...headers,
  };

  try {
    const response = await fetch(VENDOR_MANAGEMENT_API_URL, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Vendor Management API request failed:", error);
    throw error;
  }
}

// ============= API FUNCTIONS =============

/**
 * Assign a vendor to an employee
 */
export async function assignVendorToEmployee(employerEmail, employeeEmail, vendorDetails, assignmentDetails) {
  return makeVendorManagementApiRequest({
    body: {
      action: "assign_vendor_to_employee",
      employer_email: employerEmail,
      employee_email: employeeEmail,
      vendor_details: vendorDetails,
      assignment_details: assignmentDetails,
    },
  });
}

/**
 * Get vendor details for a specific employee
 */
export async function getVendorDetailsForEmployee(employerEmail, employeeEmail) {
  return makeVendorManagementApiRequest({
    body: {
      action: "get_vendor_details",
      employer_email: employerEmail,
      employee_email: employeeEmail,
    },
  });
}

/**
 * Get all vendors in the organization
 */
export async function getAllVendors(employerEmail, includeInactive = false) {
  return makeVendorManagementApiRequest({
    body: {
      action: "get_all_vendors",
      employer_email: employerEmail,
      include_inactive: includeInactive,
    },
  });
}

/**
 * Update vendor details
 */
export async function updateVendor(employerEmail, vendorId, vendorDetails) {
  return makeVendorManagementApiRequest({
    body: {
      action: "update_vendor",
      employer_email: employerEmail,
      vendor_id: vendorId,
      vendor_details: vendorDetails,
    },
  });
}

/**
 * Update vendor assignment
 */
export async function updateVendorAssignment(employerEmail, assignmentId, assignmentDetails) {
  return makeVendorManagementApiRequest({
    body: {
      action: "update_vendor_assignment",
      employer_email: employerEmail,
      assignment_id: assignmentId,
      assignment_details: assignmentDetails,
    },
  });
}

/**
 * Delete vendor or assignment
 */
export async function deleteVendor(employerEmail, vendorId, deleteType = "soft_delete_vendor", assignmentId) {
  return makeVendorManagementApiRequest({
    body: {
      action: "delete_vendor",
      employer_email: employerEmail,
      vendor_id: vendorId,
      delete_type: deleteType,
      assignment_id: assignmentId,
    },
  });
}

/**
 * Convert vendors object to array format
 */
export function convertVendorsToArray(vendorsObject) {
  console.log("=== convertVendorsToArray called ===");
  console.log("Input vendorsObject:", vendorsObject);
  console.log("Input type:", typeof vendorsObject);
  console.log("Input is null:", vendorsObject === null);
  console.log("Input is undefined:", vendorsObject === undefined);

  if (!vendorsObject) {
    console.log("vendorsObject is falsy, returning empty array");
    return [];
  }

  try {
    const result = Object.values(vendorsObject);
    console.log("Object.values result:", result);
    console.log("Result is array:", Array.isArray(result));
    console.log("Result length:", result.length);
    return result;
  } catch (error) {
    console.error("Error converting vendors to array:", error);
    return [];
  }
}
