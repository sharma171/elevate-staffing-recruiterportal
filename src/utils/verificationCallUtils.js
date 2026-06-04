// Verification Call Utility Functions

export const VERIFICATION_API_URL =
  "https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app";

// Authorization header for all API calls
const AUTH_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

/**
 * Determine the role from the current URL path
 */
export const getVerificationRole = () => {
  return window.location.pathname.includes("/candidate/") ? "candidate" : "employer";
};

/**
 * Extract channel name from URL query params
 */
export const extractChannelFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("channel") || "";
};

/**
 * Fetch call info from the API
 */
export const fetchCallInfo = async (channelName, role) => {
  try {
    const response = await fetch(VERIFICATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify({
        action: "get-call-info",
        channel_name: channelName,
        role: role,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching call info:", error);
    return null;
  }
};

export const checkCallStatus = async (channelName, role) => {
  try {
    const response = await fetch(VERIFICATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify({
        action: "check-call-status",
        channel_name: channelName,
        role: role,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking call status:", error);
    return null;
  }
};
