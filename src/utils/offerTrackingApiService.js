const OFFER_TRACKING_API_URL = "https://get-document-signature-employee-handler-v1-305451280005.us-east1.run.app";
const AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export async function saveOfferTracking(params) {
  try {
    const response = await fetch(OFFER_TRACKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "save_offer_letter_tracking",
        emailid: "marketing@4spheresolutions.com",
        ...params,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving offer tracking:", error);
    throw error;
  }
}

export async function getOfferTracking(candidate_email) {
  try {
    const response = await fetch(OFFER_TRACKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "get_candidate_offer_tracking",
        emailid: "marketing@4spheresolutions.com",
        candidate_email,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting offer tracking:", error);
    throw error;
  }
}

export async function getAllOfferTracking(limit = 50) {
  try {
    const response = await fetch(OFFER_TRACKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "get_all_offer_tracking",
        emailid: "marketing@4spheresolutions.com",
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting all offer tracking:", error);
    throw error;
  }
}

// Get candidate's current offer (for revision check)
export async function getCurrentOffer(sender_email, candidate_email) {
  try {
    const response = await fetch(OFFER_TRACKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "get_candidate_current_offer",
        emailid: "marketing@4spheresolutions.com",
        sender_email,
        candidate_email,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting current offer:", error);
    throw error;
  }
}

// Get offer history for a candidate
export async function getOfferHistory(sender_email, candidate_email) {
  try {
    const response = await fetch(OFFER_TRACKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        action: "get_offer_history",
        emailid: "marketing@4spheresolutions.com",
        sender_email,
        candidate_email,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting offer history:", error);
    throw error;
  }
}
