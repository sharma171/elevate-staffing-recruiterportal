import moment from "moment";

import getDeviceFingerprint from "./helpers/deviceFingerprint";

import { axiosApiSecure } from "./components";

const SESSION_URL = "https://fetch-update-bench-candidates-wp-v3-305451280005.us-east1.run.app/";

const SESSION_URLEMP = "https://fetch-update-employee-details-wp-v3-305451280005.us-east1.run.app/";

const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes static interval

function base64Decode(base64String) {
  try {
    return atob(base64String);
  } catch (e) {
    return null;
  }
}

let deviceData = {};

let deviceKeys = {
  sessionId: null,

  sessionToken: null,

  expiresAt: 0,
};

let refreshTimer = null;

const fingerprints = btoa(JSON.stringify(getDeviceFingerprint()));

const getToken = () => {
  try {
    const raw = localStorage.getItem("user");

    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

export async function callGetSession(email = "", url = "", payload = {}) {
  let body = {};

  if (email) {
    body = {
      request_type: "get_auth_session",
      email: email,
      device_fingerprint: fingerprints,
      ...payload,
    };
  } else {
    const jwt = getToken();

    if (!jwt) {
      console.log("[sessionManager] no JWT, skipping get_session");

      scheduleRefresh();

      return;
    }

    body = {
      request_type: "get_session",

      device_fingerprint: fingerprints,
    };
  }

  let isEmployee = localStorage.getItem("userType") == "employee";

  let userSessionURL = isEmployee ? SESSION_URLEMP : SESSION_URL;

  try {
    const res = await axiosApiSecure.post(url || userSessionURL, body);

    const { session_id, session_token, expires_at } = res.data;

    const cleaned = expires_at.split(".")[0] + "Z";

    const expiresAtMs = moment.utc(cleaned, moment.ISO_8601).valueOf();

    deviceKeys = {
      sessionId: session_id,

      sessionToken: base64Decode(session_token),

      expiresAt: expiresAtMs,
    };

    if (email) {
      return deviceKeys;
    }
  } catch (err) {
    console.error("[sessionManager] get_session API failed:", err);
  } finally {
    if (!email) {
      scheduleRefresh();
    }
  }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = setTimeout(callGetSession, INTERVAL_MS);
}

export function setDeviceData(data) {
  deviceData = { ...data };
}

export function updateDeviceData(extra) {
  deviceData = { ...deviceData, ...extra };
}

export function getDeviceData() {
  return {
    fingerprints,

    data: deviceData,

    keys: deviceKeys,
  };
}
