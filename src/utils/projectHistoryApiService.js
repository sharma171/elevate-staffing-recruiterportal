const API_URL = "https://fetch-update-candidate-projects-v3-305451280005.us-east1.run.app";
const AUTH_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";
const USER_EMAIL = "rachel.bates@elevatestaffing.ai";

async function apiRequest(body) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({
      emailid: USER_EMAIL,
      ...body,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getProjectSummary(candidateId) {
  return apiRequest({
    operation: "get_project_summary",
    candidate_id: candidateId,
  });
}

export async function addProject(candidateId, projectData, setAsPrimary = true) {
  return apiRequest({
    operation: "add_project",
    candidate_id: candidateId,
    set_as_primary: setAsPrimary,
    project_data: projectData,
  });
}

export async function completeProject(projectId, candidateId, completionData) {
  return apiRequest({
    operation: "complete_project",
    project_id: projectId,
    candidate_id: candidateId,
    completion_data: completionData,
  });
}

export async function updateProjectHistory(projectId, updates) {
  return apiRequest({
    operation: "update_project_history",
    project_id: projectId,
    updates,
  });
}

export async function setPrimaryProject(candidateId, projectId, isPrimary = true) {
  return apiRequest({
    operation: "set_primary_project",
    candidate_id: candidateId,
    project_id: projectId,
    is_primary: isPrimary,
  });
}

export async function deleteProject(candidateId, projectId) {
  return apiRequest({
    operation: "delete_project",
    candidate_id: candidateId,
    project_id: projectId,
  });
}

export async function reactivateProject(candidateId, projectId, setAsPrimary = false, reactivationReason) {
  return apiRequest({
    operation: "reactivate_project",
    candidate_id: candidateId,
    project_id: projectId,
    set_as_primary: setAsPrimary,
    reactivation_reason: reactivationReason,
  });
}
