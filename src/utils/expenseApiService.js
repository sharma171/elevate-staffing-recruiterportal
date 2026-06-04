// Expense Management API Service
const EXPENSE_API_BASE_URL = "https://expense-management-api-v3-305451280005.us-east1.run.app";
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

// Helper function to make API requests
async function makeExpenseApiRequest(action, data) {
  try {
    const response = await fetch(EXPENSE_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
        Origin: window.location.origin,
      },
      body: JSON.stringify({
        action,
        ...data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API request failed with status ${response.status}`);
    }

    if (result.status === "failure") {
      throw new Error(result.error || "API request failed");
    }

    return result;
  } catch (error) {
    console.error(`Expense API Error (${action}):`, error);
    throw error;
  }
}

// Create expense without attachments
export async function createExpense(params) {
  return makeExpenseApiRequest("create_expense", params);
}

// Create expense with attachments
export async function createExpenseWithAttachments(params) {
  return makeExpenseApiRequest("create_expense_with_attachments", params);
}

// Upload attachment to existing expense
export async function uploadAttachment(params) {
  return makeExpenseApiRequest("upload_attachment", params);
}

// Get expense details
export async function getExpense(params) {
  return makeExpenseApiRequest("get_expense", params);
}

// List expenses with filters
export async function listExpenses(params) {
  return makeExpenseApiRequest("list_expenses", params);
}

// Update expense
export async function updateExpense(params) {
  return makeExpenseApiRequest("update_expense", params);
}

// Delete expense
export async function deleteExpense(params) {
  return makeExpenseApiRequest("delete_expense", params);
}

// Get attachments
export async function getAttachments(params) {
  return makeExpenseApiRequest("get_attachments", params);
}

// Expense categories
export const EXPENSE_CATEGORIES = [
  "Travel",
  "Meals",
  "Office Supplies",
  "Office Equipment",
  "Software & Subscriptions",
  "Marketing",
  "Entertainment",
  "Training & Education",
  "Utilities",
  "Rent",
  "Insurance",
  "Professional Services",
  "Other",
];

// Payment methods
export const PAYMENT_METHODS = ["Credit Card", "Debit Card", "Cash", "Bank Transfer", "Company Card", "Check", "Other"];
