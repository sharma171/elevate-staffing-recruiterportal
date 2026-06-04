import { API_CONFIG } from "./apiConfig";

const ORGANIZATION_API_URL = API_CONFIG.ORGANIZATION_API_URL;
const AUTHORIZATION_TOKEN = API_CONFIG.AUTHORIZATION_TOKEN;

async function makeOrgApiRequest(options = {}) {
  const { method = "POST", body, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: AUTHORIZATION_TOKEN,
    Origin: window.location.origin,
    ...headers,
  };

  try {
    const response = await fetch(ORGANIZATION_API_URL, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Organization API request failed:", error);
    throw error;
  }
}

// Organization Data Operations
export async function getOrganizationData(adminEmail) {
  return makeOrgApiRequest({
    method: "POST",
    body: {
      action: "org_data",
      admin_email: adminEmail,
    },
  });
}

export async function updateOrganizationData(adminEmail, updateData) {
  return makeOrgApiRequest({
    method: "POST",
    body: {
      action: "org_data",
      admin_email: adminEmail,
      update: updateData,
    },
  });
}

// Logo Management
export async function updateOrganizationLogo(adminEmail, logoFileBase64) {
  return makeOrgApiRequest({
    method: "POST",
    body: {
      action: "update_logo",
      admin_email: adminEmail,
      logo_file: logoFileBase64,
    },
  });
}

// Email Configuration Operations
export async function getEmailConfigurations(adminEmail, categoryNames) {
  const body = {
    action: "retrieve_emails",
    admin_email: adminEmail,
  };

  if (categoryNames) {
    body.category_names = categoryNames;
  }

  return makeOrgApiRequest({
    method: "POST",
    body,
  });
}

export async function createEmailConfiguration(adminEmail, configData) {
  return makeOrgApiRequest({
    method: "POST",
    body: {
      action: "create_email_config",
      admin_email: adminEmail,
      config_data: configData,
    },
  });
}

export async function updateEmailConfiguration(adminEmail, updateData) {
  const body = {
    action: "update_emails",
    admin_email: adminEmail,
  };

  // Support both single and multiple updates
  if (Array.isArray(updateData)) {
    body.updates = updateData;
  } else {
    body.update = updateData;
  }

  return makeOrgApiRequest({
    method: "POST",
    body,
  });
}

export async function deleteEmailConfiguration(adminEmail, configId) {
  return makeOrgApiRequest({
    method: "POST",
    body: {
      action: "delete_email_config",
      admin_email: adminEmail,
      config_id: configId,
    },
  });
}
