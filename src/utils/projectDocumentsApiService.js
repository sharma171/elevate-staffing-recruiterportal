const UPLOAD_URL = "https://project-documents-upload-determine-type-v3-305451280005.us-east1.run.app";
const MANAGE_URL = "https://project-documents-delete-retrieve-deter-type-v3-305451280005.us-east1.run.app";
const AUTH_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";
const USER_EMAIL = "rachel.bates@elevatestaffing.ai";
const DEFAULT_CANDIDATE_ID = 549;

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to download base64 file
export const downloadBase64File = (base64Content, fileName, fileExtension) => {
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const mimeType = mimeTypes[fileExtension] || "application/octet-stream";
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Upload documents
export async function uploadProjectDocuments(projectId, _candidateId, candidateEmail, files) {
  const documentsArray = await Promise.all(
    files.map(async (file) => {
      const base64Content = await fileToBase64(file.file);
      return {
        file_name: file.file.name,
        file_content: base64Content,
        document_type: file.documentType || "other",
        document_name: file.documentName || "",
        document_description: file.description || "",
        is_visible_to_candidate: file.visibleToCandidate || false,
      };
    }),
  );

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      project_id: projectId,
      candidate_id: DEFAULT_CANDIDATE_ID,
      candidate_email: candidateEmail,
      documents: documentsArray,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Upload failed");
  }

  return result;
}

// Get documents list
export async function getProjectDocuments(projectId, _candidateId) {
  const response = await fetch(MANAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      operation: "get_documents",
      project_id: projectId,
      candidate_id: DEFAULT_CANDIDATE_ID,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to get documents");
  }

  return { documents: result.documents || [], total_documents: result.total_documents || 0 };
}

// Download documents
export async function downloadProjectDocuments(candidateEmail, documentIds) {
  const response = await fetch(MANAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      operation: "download_documents",
      candidate_email: candidateEmail,
      document_ids: documentIds,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to download documents");
  }

  return result;
}

// Delete document
export async function deleteProjectDocument(documentId, candidateEmail) {
  const response = await fetch(MANAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      operation: "delete_document",
      document_id: documentId,
      candidate_email: candidateEmail,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete document");
  }

  return result;
}

// Update document metadata
export async function updateProjectDocument(documentId, updates) {
  const response = await fetch(MANAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      operation: "update_document",
      document_id: documentId,
      updates,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update document");
  }

  return result;
}

// Bulk update documents
export async function bulkUpdateProjectDocuments(documentIds, updates) {
  const results = await Promise.allSettled(documentIds.map((id) => updateProjectDocument(id, updates)));

  const success = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      success.push(documentIds[index]);
    } else {
      failed.push({ id: documentIds[index], error: result.reason?.message || "Unknown error" });
    }
  });

  return { success, failed };
}
