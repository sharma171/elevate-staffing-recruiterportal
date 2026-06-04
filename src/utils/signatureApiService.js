const SIGNATURE_API_URL = "https://get-document-signature-employee-handler-v1-305451280005.us-east1.run.app";

const AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export async function verifySignatureToken(params) {
  try {
    const response = await fetch(SIGNATURE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "verify_token",
        ...params,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying signature token:", error);
    throw error;
  }
}

export async function submitSignature(params) {
  try {
    const response = await fetch(SIGNATURE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "capture_signature",
        ...params,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting signature:", error);
    throw error;
  }
}

export async function getSignatureStatus(signature_token) {
  try {
    const response = await fetch(SIGNATURE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "get_signature_status",
        signature_token,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting signature status:", error);
    throw error;
  }
}
