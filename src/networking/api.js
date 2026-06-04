import axios from "axios";

let otherURL1 = "https://us-central1-recruiterportal.cloudfunctions.net";

const endpoints = {
  Bench_Candidates_v3: "/Fetch_Update_Bench_Candidates_v3",
  Recruiter_Details_v3: "/Retrieve_Recruiter_Details_v3",
  documents_delete_retrieve_v3: "/documents_delete-retrieve_determine_type_v3",
  documents_upload: "/documents_upload_determine_type_v3",
  Rate_Confirmations: otherURL1 + "/Fetch_Update_Rate_Confirmations_v3",
  Fetchvendoremails: "/fetch_vendor_emails_for_end_Users_v3",
  CandidateInterview: "/Fetch_Candidate_Interview_Details_v3",
  TeamsManagement: "/manage_org_teams_titles_v3",
  Permissions: "https://fetch-access-control-v3-305451280005.us-east1.run.app",
  RecruiterActions: "https://manage-recruiter-accounts-v3-305451280005.us-east1.run.app",
  AIAssistant: "https://text-ai-assistant-v3-305451280005.us-east1.run.app",
  CandidateAnalysis: "https://fetch-candidate-analysis-v3-305451280005.us-east1.run.app",
  employeeActions: "https://manage-employee-accounts-v3-305451280005.us-east1.run.app",
  employeeProfile: "https://fetch-update-employee-details-v3-305451280005.us-east1.run.app",
  createTimesheet: "https://submit-monthly-timesheet-v3-305451280005.us-east1.run.app",
  getTimesheets: "https://view-download-timesheets-v3-305451280005.us-east1.run.app",
  createWeeklyTimesheet: "https://submit-weekly-work-v3-305451280005.us-east1.run.app",
  usersList: "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Candidate_Details_Min_v2",
  documentsUploadEMP: "https://documents-upload-determine-type-emplo-v3-305451280005.us-east1.run.app",
  documentsDownloadEMP: "https://documents-delete-retrieve-determine-type-emplo-v3-305451280005.us-east1.run.app",
  weeklyaistatus: "https://employee-work-suggestions-v3-305451280005.us-east1.run.app",
  employeeDashboard: "https://fetch-employee-dashboard-data-v3-305451280005.us-east1.run.app",
  sendTalentPoolInvitation: "https://manage-pre-board-employee-v3-305451280005.us-east1.run.app",
  PrefetchEmployee: "https://fetch-update-pre-employee-details-v3-305451280005.us-east1.run.app",
  prefetchDocs: "https://documents-upload-determine-type-pre-employee-v3-305451280005.us-east1.run.app",
  zipCodeInfo: "https://retrieve-location-details-v3-305451280005.us-east1.run.app",
  CompanyDetails: "https://fetch-update-org-data-emails-v3-305451280005.us-east1.run.app",
};
const apiAxios = axios.create({
  baseURL: "https://us-east1-recruiterportal.cloudfunctions.net",
});

apiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiAxios.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response ? error.response.data : error)
);

class ApiClient {
  async Bench_Candidates(payload, params = {}) {
    return apiAxios.post(endpoints.Bench_Candidates_v3, payload, { params });
  }

  async Fetchvendoremails(payload, params = {}) {
    return apiAxios.post(endpoints.Fetchvendoremails, payload, { params });
  }

  async CandidateInterviewDetails(payload, params = {}) {
    return apiAxios.post(endpoints.CandidateInterview, payload, { params });
  }

  async Recruiter_Details(payload, params = {}) {
    return apiAxios.post(endpoints.Recruiter_Details_v3, payload, { params });
  }

  async Rate_Confirmations(payload, params = {}) {
    return apiAxios.post(endpoints.Rate_Confirmations, payload, { params });
  }

  async documents_delete_retrieve(payload, params = {}) {
    return apiAxios.post(endpoints.documents_delete_retrieve_v3, payload, { params });
  }

  async upload_documents(payload, params = {}) {
    return apiAxios.post(endpoints.documents_upload, payload, { params });
  }

  async TeamsManagement(payload, params = {}) {
    return apiAxios.post(endpoints.TeamsManagement, payload, { params });
  }

  async Permissions(payload, params = {}) {
    return apiAxios.post(endpoints.Permissions, payload, { params });
  }

  async RecruiterActions(payload, params = {}) {
    return apiAxios.post(endpoints.RecruiterActions, payload, { params });
  }

  async AIAssistant(payload, params = {}) {
    return apiAxios.post(endpoints.AIAssistant, payload, { params });
  }

  async CandidateAnalysis(payload, params = {}) {
    return apiAxios.post(endpoints.CandidateAnalysis, payload, { params });
  }

  async employeeActions(payload, params = {}) {
    return apiAxios.post(endpoints.employeeActions, payload, { params });
  }

  async employeeProfile(payload, params = {}) {
    return apiAxios.post(endpoints.employeeProfile, payload, { params });
  }

  async createTimesheet(payload, params = {}, endpoint = "") {
    return apiAxios.post(endpoints.createTimesheet + endpoint, payload, { params });
  }

  async getTimesheets(payload, params = {}) {
    return apiAxios.post(endpoints.getTimesheets, payload, { params });
  }

  async createWeeklyTimesheet(payload, params = {}) {
    return apiAxios.post(endpoints.createWeeklyTimesheet, payload, { params });
  }

  async usersList(payload, params = {}) {
    return apiAxios.post(endpoints.usersList, payload, { params });
  }

  async documentsUpload(payload, params = {}) {
    return apiAxios.post(endpoints.documentsUploadEMP, payload, { params });
  }

  async documentsDownload(payload, params = {}) {
    return apiAxios.post(endpoints.documentsDownloadEMP, payload, { params });
  }

  async weeklyaistatus(payload, params = {}) {
    return apiAxios.post(endpoints.weeklyaistatus, payload, { params });
  }

  async employeeDashboard(payload, params = {}) {
    return apiAxios.post(endpoints.employeeDashboard, payload, { params });
  }

  async sendTalentPoolInvitation(payload, params = {}) {
    return apiAxios.post(endpoints.sendTalentPoolInvitation, payload, { params });
  }

  async PrefetchEmployee(payload, params = {}) {
    return apiAxios.post(endpoints.PrefetchEmployee, payload, { params });
  }

  async prefetchDocs(payload, params = {}, config = {}) {
    const finalConfig = {
      ...config,
      params: { ...(config.params || {}), ...params },
    };
    return apiAxios.post(endpoints.prefetchDocs, payload, finalConfig);
  }

  async zipCodeInfo(payload, params = {}) {
    return apiAxios.post(endpoints.zipCodeInfo, payload, { params });
  }

  CompanyDetails(payload, params = {}) {
    return apiAxios.post(endpoints.CompanyDetails, payload, { params });
  }

  async getTimesheetDetails(payload, params = {}) {
    return apiAxios.post(endpoints.createTimesheet + "/get_timesheet_details", payload, { params });
  }
}
export default new ApiClient();
