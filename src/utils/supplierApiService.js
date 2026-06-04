const API_BASE_URL = "https://manage-supplier-invoices-api-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const makeRequest = async (payload, token) => {
  const authToken = token || AUTHORIZATION_TOKEN;

  const headers = {
    "Content-Type": "application/json",
    Authorization: authToken,
  };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.status === "failure") {
    throw new Error(data.error || "API request failed");
  }

  return data;
};

export const createSupplier = async (supplierData, token) => {
  return makeRequest(
    {
      action: "create_supplier",
      ...supplierData,
    },
    token,
  );
};

export const getSupplier = async (user_email, supplier_id, token) => {
  return makeRequest(
    {
      action: "get_supplier",
      user_email,
      supplier_id,
    },
    token,
  );
};

export const listSuppliers = async (params, token) => {
  return makeRequest(
    {
      action: "list_suppliers",
      ...params,
    },
    token,
  );
};

export const searchSuppliers = async (user_email, search_term, active_only = true, limit = 20, token) => {
  return makeRequest(
    {
      action: "search_suppliers",
      user_email,
      search_term,
      active_only,
      limit,
    },
    token,
  );
};

export const updateSupplier = async (user_email, supplier_id, updates, token) => {
  return makeRequest(
    {
      action: "update_supplier",
      user_email,
      supplier_id,
      ...updates,
    },
    token,
  );
};

export const deleteSupplier = async (user_email, supplier_id, deletion_reason, token) => {
  return makeRequest(
    {
      action: "delete_supplier",
      user_email,
      supplier_id,
      deletion_reason,
    },
    token,
  );
};

export const activateSupplier = async (user_email, supplier_id, token) => {
  return makeRequest(
    {
      action: "activate_supplier",
      user_email,
      supplier_id,
    },
    token,
  );
};

export const getSupplierStats = async (user_email, token) => {
  return makeRequest(
    {
      action: "get_supplier_stats",
      user_email,
    },
    token,
  );
};
