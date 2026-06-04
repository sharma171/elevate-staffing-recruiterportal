// AI Document Extraction API Service
const EXTRACTION_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

// Helper function to convert File to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to convert MM/DD/YYYY to YYYY-MM-DD
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.split("T")[0];
  }

  // Handle MM/DD/YYYY format
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
};

// Extract data from document using AI
export async function extractDocument(params) {
  try {
    const response = await fetch(EXTRACTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
        Origin: window.location.origin,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API request failed with status ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Document extraction failed");
    }

    return result;
  } catch (error) {
    console.error("Extraction API Error:", error);
    throw error;
  }
}
