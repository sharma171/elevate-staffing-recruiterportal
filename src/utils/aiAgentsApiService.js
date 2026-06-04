const AI_AGENTS_API_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app";
const AUTH_HEADERS = {
  "Content-Type": "application/json",
  Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
  Origin: window.location.origin,
};

// API Helper
async function callAiAgentsApi(action, params = {}) {
  const response = await fetch(AI_AGENTS_API_URL, {
    method: "POST",
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      action,
      ...params,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// API Functions
export async function getMyConfig(requestingUserEmail) {
  return callAiAgentsApi("get_my_config", {
    requesting_user_email: requestingUserEmail,
  });
}

export async function updateMyConfig(requestingUserEmail, config) {
  return callAiAgentsApi("update_my_config", {
    requesting_user_email: requestingUserEmail,
    config,
  });
}

export async function linkIntegration(requestingUserEmail, integrationId) {
  return callAiAgentsApi("link_integration", {
    requesting_user_email: requestingUserEmail,
    integration_id: integrationId,
  });
}

export async function unlinkIntegration(requestingUserEmail) {
  return callAiAgentsApi("unlink_integration", {
    requesting_user_email: requestingUserEmail,
  });
}

export async function getPendingSubmissions(requestingUserEmail, agentType) {
  return callAiAgentsApi("get_pending_submissions", {
    requesting_user_email: requestingUserEmail,
    agent_type: agentType,
  });
}

export async function approveSubmission(requestingUserEmail, submissionId) {
  return callAiAgentsApi("approve_submission", {
    requesting_user_email: requestingUserEmail,
    submission_id: submissionId,
  });
}

export async function rejectSubmission(requestingUserEmail, submissionId, reason) {
  return callAiAgentsApi("reject_submission", {
    requesting_user_email: requestingUserEmail,
    submission_id: submissionId,
    reason,
  });
}

export async function bulkApprove(requestingUserEmail, submissionIds) {
  return callAiAgentsApi("bulk_approve", {
    requesting_user_email: requestingUserEmail,
    submission_ids: submissionIds,
  });
}

export async function bulkReject(requestingUserEmail, submissionIds, reason) {
  return callAiAgentsApi("bulk_reject", {
    requesting_user_email: requestingUserEmail,
    submission_ids: submissionIds,
    reason,
  });
}

export async function getAgentStats(requestingUserEmail, days = 7) {
  return callAiAgentsApi("get_agent_stats", {
    requesting_user_email: requestingUserEmail,
    days,
  });
}

export async function listAllConfigs(requestingUserEmail) {
  return callAiAgentsApi("list_all_configs", {
    requesting_user_email: requestingUserEmail,
  });
}

export async function getRecruiterConfig(requestingUserEmail, targetRecruiterEmail) {
  return callAiAgentsApi("get_recruiter_config", {
    requesting_user_email: requestingUserEmail,
    target_recruiter_email: targetRecruiterEmail,
  });
}

export async function updateRecruiterConfig(requestingUserEmail, targetRecruiterEmail, config) {
  return callAiAgentsApi("update_recruiter_config", {
    requesting_user_email: requestingUserEmail,
    target_recruiter_email: targetRecruiterEmail,
    config,
  });
}

export async function getAvailableIntegrations(requestingUserEmail) {
  return callAiAgentsApi("get_available_integrations", {
    requesting_user_email: requestingUserEmail,
  });
}

export async function healthCheck() {
  return callAiAgentsApi("health_check", {});
}
