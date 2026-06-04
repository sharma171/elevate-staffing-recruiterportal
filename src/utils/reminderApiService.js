// Reminder API Service
const BASE_URL = "https://generate-invoice-reminders-org-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

class ReminderApiService {
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: AUTHORIZATION_HEADER,
    };
  }

  getEmployeeEmail() {
    // Using marketing email for testing, similar to other services
    return localStorage.getItem("userEmail") || "rachel.bates@elevatestaffing.ai";
  }

  async makeRequest(payload) {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        employee_email: this.getEmployeeEmail(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "failure" || data.status === "error") {
      throw new Error(data.error || data.message || "API request failed");
    }

    return data;
  }

  // Get dashboard overview with settings and campaigns
  async getDashboard() {
    return this.makeRequest({
      task: "get_dashboard",
    });
  }

  // Configure global reminder settings
  async configureSettings(settings) {
    return this.makeRequest({
      task: "configure_settings",
      settings,
    });
  }

  // Create reminder campaign for invoice
  async createCampaign(invoiceId, startImmediately = false, customSettings) {
    return this.makeRequest({
      task: "create_campaign",
      invoice_id: invoiceId,
      start_immediately: startImmediately,
      custom_settings: customSettings,
    });
  }

  // Pause reminder campaign
  async pauseCampaign(invoiceId, pauseDays, pauseReason) {
    return this.makeRequest({
      task: "pause_campaign",
      invoice_id: invoiceId,
      pause_days: pauseDays,
      pause_reason: pauseReason,
    });
  }

  // Resume paused campaign
  async resumeCampaign(invoiceId) {
    return this.makeRequest({
      task: "resume_campaign",
      invoice_id: invoiceId,
    });
  }

  // Stop campaign permanently
  async stopCampaign(invoiceId, stopReason) {
    return this.makeRequest({
      task: "stop_campaign",
      invoice_id: invoiceId,
      stop_reason: stopReason,
    });
  }

  // Log customer response
  async logResponse(invoiceId, responseType, responseNotes, pauseDays, followUpDate) {
    return this.makeRequest({
      task: "log_response",
      invoice_id: invoiceId,
      response_type: responseType,
      response_notes: responseNotes,
      pause_days: pauseDays,
      follow_up_date: followUpDate,
    });
  }

  // Send manual reminder
  async sendManualReminder(invoiceId, templateType = "standard_reminder", additionalEmails) {
    return this.makeRequest({
      task: "send_manual_reminder",
      invoice_id: invoiceId,
      template_type: templateType,
      additional_emails: additionalEmails,
    });
  }

  // Get reminder history for invoice
  async getReminderHistory(invoiceId) {
    return this.makeRequest({
      task: "get_history",
      invoice_id: invoiceId,
    });
  }

  // Get available response types
  async getResponseTypes() {
    return this.makeRequest({
      task: "get_response_types",
    });
  }

  // Bulk operations
  async bulkPauseReminders(invoiceIds, pauseDays, pauseReason) {
    return this.makeRequest({
      task: "bulk_pause_reminders",
      invoice_ids: invoiceIds,
      pause_days: pauseDays,
      pause_reason: pauseReason,
    });
  }

  async bulkResumeReminders(invoiceIds) {
    return this.makeRequest({
      task: "bulk_resume_reminders",
      invoice_ids: invoiceIds,
    });
  }
}

export const reminderApiService = new ReminderApiService();
