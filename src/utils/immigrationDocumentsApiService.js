const DOCUMENTS_API_URL =
  "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3";
const UPLOAD_API_URL = "https://us-east1-recruiterportal.cloudfunctions.net/documents_upload_determine_type_v3";
const AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const PAF_TOKEN = "https://candidates-immigration-paf-generator-api-v1-305451280005.us-east1.run.app";

const getCurrentUserEmail = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.email;
    } catch (e) {}
  }
};

export async function uploadDocument(candidateEmail, file, metadata) {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("file", file);
    formData.append("email_id", candidateEmail);
    formData.append("emailid", getCurrentUserEmail());

    // Document metadata
    formData.append("doc_type", metadata.doc_type);
    formData.append("doc_category", metadata.doc_category);

    if (metadata.file_desc) formData.append("file_desc", metadata.file_desc);
    if (metadata.doc_validfrom) formData.append("doc_validfrom", metadata.doc_validfrom);
    if (metadata.doc_expiry) formData.append("doc_expiry", metadata.doc_expiry);
    formData.append("is_resume", metadata.is_resume || "no");

    const response = await fetch(UPLOAD_API_URL, {
      method: "POST",
      headers: {
        Authorization: AUTH_TOKEN,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      message: data.message,
      access_level: data.access_level,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

/**
 * Get list of all documents for a candidate
 */
export async function getFilesList(candidateEmail) {
  try {
    const response = await fetch(DOCUMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        email_id: candidateEmail,
        emailid: getCurrentUserEmail(),
        task: "get_file_names",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      access_level: data.access_level,
      files: data.files || data?.available_files || [],
    };
  } catch (error) {
    console.error("Error getting files list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get files list",
    };
  }
}

/**
 * Download/View document - retrieves base64 content and signed URL
 */
export async function downloadDocument(candidateEmail, fileName) {
  try {
    const response = await fetch(DOCUMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        email_id: candidateEmail,
        emailid: getCurrentUserEmail(),
        task: "download_files",
        file_name: [fileName],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      access_level: data.access_level,
      files: data.files || data.retrieve_files || [],
    };
  } catch (error) {
    console.error("Error downloading document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to download document",
    };
  }
}

/**
 * Delete document by filename
 */
export async function deleteDocument(candidateEmail, fileName) {
  try {
    const response = await fetch(DOCUMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        email_id: candidateEmail,
        emailid: getCurrentUserEmail(),
        task: "delete_files",
        file_name: [fileName],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      message: data.message,
      access_level: data.access_level,
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(candidateEmail, rowId, updates) {
  try {
    const response = await fetch(DOCUMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        email_id: candidateEmail,
        emailid: getCurrentUserEmail(),
        task: "update_data",
        row_id: rowId,
        ...updates,
        emp_view: updates.emp_view ? "true" : "false",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      message: data.message,
      access_level: data.access_level,
    };
  } catch (error) {
    console.error("Error updating document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update document",
    };
  }
}

/**
 * Rename document
 */
export async function renameDocument(candidateEmail, rowId, oldFileName, newFileName) {
  try {
    const response = await fetch(DOCUMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        email_id: candidateEmail,
        emailid: getCurrentUserEmail(),
        task: "rename",
        row_id: rowId,
        old_file_name: oldFileName,
        new_file_name: newFileName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      message: data.message,
      access_level: data.access_level,
    };
  } catch (error) {
    console.error("Error renaming document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to rename document",
    };
  }
}

/**
 * Get expiry status for document highlighting
 */
export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;

  // Parse date safely using YYYY-MM-DD split pattern to avoid timezone issues
  const parts = expiryDate.split("-");
  if (parts.length !== 3) return null;

  const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return "expired";
  if (daysUntil <= 30) return "expiring";
  return "valid";
}

/**
 * Format date for display using local time parsing
 */
export function formatDocumentDate(dateStr) {
  if (!dateStr) return "—";

  // Parse date safely using YYYY-MM-DD split pattern to avoid timezone issues
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;

  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}
export const getPAFPrefill = async (employeeEmail, lcaId) => {
  try {
    const response = await fetch(PAF_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        task: "get-paf-prefill",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        lca_id: lcaId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting PAF prefill:", error);
    throw error;
  }
};

/**
 * Generate a PAF document
 */
export const generatePAF = async (employeeEmail, lcaId, pafData) => {
  try {
    const response = await fetch(PAF_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        task: "generate-paf",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        lca_id: lcaId,
        paf_data: pafData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating PAF:", error);
    throw error;
  }
};
export const downloadPAF = async (employeeEmail, pafId) => {
  try {
    const response = await fetch(PAF_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        task: "download-paf",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        paf_id: pafId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error downloading PAF:", error);
    throw error;
  }
};
export const getPAFs = async (employeeEmail, lcaId) => {
  try {
    const response = await fetch(PAF_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        task: "get-paf",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        lca_id: lcaId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting PAFs:", error);
    throw error;
  }
};
