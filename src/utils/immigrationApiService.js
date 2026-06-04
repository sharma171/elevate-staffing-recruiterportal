const IMMIGRATION_API_URL = "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app";

// Authorization token (unified format without "Basic" prefix)
const AUTH_TOKEN = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const getCurrentUserEmail = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.email;
    } catch (e) {}
  }
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: AUTH_TOKEN,
  Origin: typeof window !== "undefined" ? window.location.origin : "",
});

const getSelectedSmartUpload = () => {
  const selectedFile = localStorage.getItem("fileChoosen");
  return selectedFile;
};

export const getImmigrationInfo = async (employeeEmail) => {
  try {
    if (!employeeEmail) {
      throw new Error("employee_email is required");
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "get-immigration-info",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching immigration info:", error);
    throw error;
  }
};

export const saveImmigrationInfo = async (employeeEmail, data, fileData) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-immigration-info",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      data,
    };

    // If file data is provided, include it in the payload
    if (fileData) {
      payload.doc_type = fileData.doc_type;
      payload.file_base64 = fileData.file_base64;
      payload.file_type = fileData.file_type;
      payload.file_name = fileData.file_name;
      if (fileData.doc_expiry) payload.doc_expiry = fileData.doc_expiry;
      if (fileData.doc_validfrom) payload.doc_validfrom = fileData.doc_validfrom;
      if (fileData.document_number !== undefined) payload.document_number = fileData.document_number;
      if (choosenFile === payload.file_name) {
        payload.is_existing_document = true;
      }
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving immigration info:", error);
    throw error;
  }
};

/**
 * Add a travel record
 */
export const addTravelRecord = async (employeeEmail, travelRecord) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "add-travel-record",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        travel_record: travelRecord,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding travel record:", error);
    throw error;
  }
};

/**
 * Update a travel record
 */
export const updateTravelRecord = async (travelId, updates) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "update-travel-record",
        emailid: getCurrentUserEmail(),
        travel_id: travelId,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating travel record:", error);
    throw error;
  }
};

/**
 * Delete a travel record
 */
export const deleteTravelRecord = async (travelId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-travel-record",
        emailid: getCurrentUserEmail(),
        travel_id: travelId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting travel record:", error);
    throw error;
  }
};

/**
 * Add petition history
 */
export const addPetitionHistory = async (employeeEmail, petition) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "add-petition-history",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        petition,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding petition history:", error);
    throw error;
  }
};

/**
 * Delete petition history
 */
export const deletePetitionHistory = async (historyId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-petition-history",
        emailid: getCurrentUserEmail(),
        history_id: historyId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting petition history:", error);
    throw error;
  }
};

/**
 * Add worksite
 */
export const addWorksite = async (employeeEmail, worksite) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "add-worksite",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        worksite,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding worksite:", error);
    throw error;
  }
};

/**
 * Update worksite
 */
export const updateWorksite = async (worksiteId, updates) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "update-worksite",
        emailid: getCurrentUserEmail(),
        worksite_id: worksiteId,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating worksite:", error);
    throw error;
  }
};

/**
 * Delete worksite
 */
export const deleteWorksite = async (worksiteId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-worksite",
        emailid: getCurrentUserEmail(),
        worksite_id: worksiteId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting worksite:", error);
    throw error;
  }
};

/**
 * Get immigration documents
 */
export const getImmigrationDocuments = async (employeeEmail) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "get-immigration-documents",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching immigration documents:", error);
    throw error;
  }
};

/**
 * Verify or reject a document
 */
export const verifyDocument = async (documentId, status, rejectionReason) => {
  try {
    const body = {
      task: "verify-document",
      emailid: getCurrentUserEmail(),
      document_id: documentId,
      status,
    };

    if (status === "rejected" && rejectionReason) {
      body.rejection_reason = rejectionReason;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying document:", error);
    throw error;
  }
};

/**
 * Get immigration dashboard
 */
export const getImmigrationDashboard = async () => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "get-immigration-dashboard",
        emailid: getCurrentUserEmail(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching immigration dashboard:", error);
    throw error;
  }
};

/**
 * Set active H-1B petition
 * Makes the specified petition the current one
 */
export const setActivePetition = async (employeeEmail, petitionId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "set-active-petition",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        petition_id: petitionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error setting active petition:", error);
    throw error;
  }
};

/**
 * Set active LCA
 * Makes the specified LCA the current one
 */
export const setActiveLCA = async (employeeEmail, lcaId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "set-active-lca",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        lca_id: lcaId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error setting active LCA:", error);
    throw error;
  }
};

/**
 * Delete H-1B petition
 */
export const deletePetition = async (employeeEmail, petitionId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-h1b-petition",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        petition_id: petitionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting petition:", error);
    throw error;
  }
};

/**
 * Update H-1B petition fields (e.g., link LCA)
 */
export const updatePetition = async (employeeEmail, petitionId, petitionData) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "update-h1b-petition",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        petition_id: petitionId,
        petition_data: petitionData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating petition:", error);
    throw error;
  }
};

/**
 * Delete LCA record
 */
export const deleteLCA = async (employeeEmail, lcaId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-lca",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        lca_id: lcaId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting LCA:", error);
    throw error;
  }
};

/**
 * Save H-1B Approval (I-797) data after parsing
 * Passes extracted_data directly back to the API
 * Returns duplicate info if petition already exists
 */
export const saveH1BApproval = async (employeeEmail, extractedData, updateI94 = false, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-h1b-approval",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      extracted_data: extractedData,
      update_i94: updateI94,
    };

    // Add file info if provided
    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle duplicate petition response - API returns error + existing_petition_id
    // This is NOT an HTTP error, so we need to check the response body
    if (data.error && data.existing_petition_id) {
      return {
        success: false,
        error: data.error,
        existing_petition_id: data.existing_petition_id,
      };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("Error saving H1B approval:", error);
    throw error;
  }
};

export const saveLCA = async (employeeEmail, rawExtractedData, setAsCurrent = true, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const immigrationData = rawExtractedData?.immigration_data || rawExtractedData;
    const worksites = rawExtractedData?.worksites || [];

    const payload = {
      task: "save-lca",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      lca_data: {
        immigration_data: immigrationData,
      },
      set_as_current: setAsCurrent,
    };

    if (worksites.length > 0) {
      payload.worksites = worksites;
    }

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_parseError) {
      data = null;
    }

    const existingLcaId = data?.existing_lca_id || data?.data?.existing_lca_id;
    if (existingLcaId) {
      return {
        success: false,
        status: response.status,
        error: data?.error || data?.message || "A matching LCA already exists for this candidate.",
        existing_lca_id: existingLcaId,
        ...(data && typeof data === "object" ? data : {}),
      };
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `HTTP error! status: ${response.status}`);
    }

    if (data && typeof data === "object") {
      return {
        ...data,
        success: typeof data.success === "boolean" ? data.success : true,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving LCA:", error);
    throw error;
  }
};

export const parseLCADocument = async (base64Content, fileName) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "parse-lca-document",
        emailid: getCurrentUserEmail(),
        base64_content: base64Content,
        file_name: fileName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error parsing LCA document:", error);
    throw error;
  }
};

// Helper function to map visa_status display values to code
const mapVisaStatusToCode = (visaStatus) => {
  if (!visaStatus) return "";

  const statusMap = {
    "H4 EAD": "H4_EAD",
    "H-4 EAD": "H4_EAD",
    H4: "H4",
    "H-4": "H4",
    "H-1B": "H1B",
    H1B: "H1B",
    "H1-B": "H1B",
    OPT: "OPT",
    "STEM OPT": "STEM_OPT",
    "STEM-OPT": "STEM_OPT",
    CPT: "CPT",
    "F-1": "F1",
    F1: "F1",
    "L-1A": "L1A",
    L1A: "L1A",
    "L-1B": "L1B",
    L1B: "L1B",
    "L-2": "L2",
    L2: "L2",
    "L-2 EAD": "L2_EAD",
    "L2 EAD": "L2_EAD",
    TN: "TN",
    "E-2": "E2",
    E2: "E2",
    "E-3": "E3",
    E3: "E3",
    "O-1": "O1",
    O1: "O1",
    "Green Card": "GC",
    GC: "GC",
    "GC EAD": "GC_EAD",
    "GC-EAD": "GC_EAD",
    GC_EAD: "GC_EAD",
    EAD: "EAD",
    "US Citizen": "USC",
    USC: "USC",
  };

  return statusMap[visaStatus] || visaStatus.toUpperCase().replace(/[-\s]/g, "_");
};

// Helper to flatten nested H1B petition data from API response
const flattenH1BData = (apiH1bData, defaults, petitionHistory) => {
  if (!apiH1bData) return defaults;

  const { petition, ...restH1bData } = apiH1bData;

  // Find the latest approval event from petition_history to get event_date as notice_date
  // and received_date from event_details as petition_filed_date
  let noticeDate;
  let filedDate;
  if (petitionHistory && petitionHistory.length > 0) {
    // Find the most recent approval event
    const approvalEvent = petitionHistory
      .filter((p) => p.event_type === "approval" && p.to_status === "H1B")
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())[0];

    if (approvalEvent) {
      noticeDate = approvalEvent.event_date;
      // Extract received_date from event_details (this is where the API stores it)
      filedDate = approvalEvent.event_details?.received_date;
    }
  }

  // Map nested petition fields to flat UI fields
  const flattenedPetition = petition
    ? {
        receipt_number: petition.receipt_number || restH1bData.receipt_number,
        petition_status: mapPetitionStatusFromApi(petition.status) || restH1bData.petition_status,
        petition_filed_date: filedDate || petition.received_date || restH1bData.petition_filed_date,
        notice_date: noticeDate,
        approval_date: petition.approval_date || restH1bData.approval_date,
        validity_start_date: petition.validity_start || restH1bData.validity_start_date,
        validity_end_date: petition.validity_end || restH1bData.validity_end_date,
        h1b_petition_type: mapPetitionTypeFromApi(petition.petition_type) || restH1bData.h1b_petition_type,
        premium_processing: petition.premium_processing ?? restH1bData.premium_processing,
      }
    : { notice_date: noticeDate, petition_filed_date: filedDate };

  return {
    ...defaults,
    ...restH1bData,
    ...flattenedPetition,
  };
};

// Map API petition status to UI enum
const mapPetitionStatusFromApi = (status) => {
  if (!status) return undefined;
  const statusMap = {
    approved: "approved",
    pending: "pending",
    denied: "denied",
    rfe: "rfe",
    withdrawn: "withdrawn",
  };
  return statusMap[status.toLowerCase()] || status;
};

// Map API petition type to UI enum
const mapPetitionTypeFromApi = (type) => {
  if (!type) return undefined;
  const typeMap = {
    initial: "initial",
    extension: "extension",
    transfer: "transfer",
    amendment: "amendment",
    concurrent: "concurrent",
  };
  return typeMap[type.toLowerCase()] || type;
};

// Helper to initialize empty visa-specific data based on visa type
const initializeVisaSpecificData = (visaType) => {
  const isH4 = ["H4", "H4_EAD"].includes(visaType);
  const isOPT = ["OPT", "STEM_OPT", "F1", "CPT"].includes(visaType);
  const isH1B = ["H1B", "H1B1"].includes(visaType);
  const isL1 = ["L1A", "L1B"].includes(visaType);
  const isL2 = ["L2", "L2_EAD"].includes(visaType);
  const isGC = ["GC"].includes(visaType);
  const isGCEAD = ["GC_EAD", "EAD"].includes(visaType);

  return {
    h1b: isH1B
      ? {
          h1b_petition_type: "initial",
          h1b_cap_status: "cap_subject",
          petition_status: "pending",
          premium_processing: false,
          rfe_received: false,
        }
      : undefined,

    opt: isOPT
      ? {
          opt_type: "post_completion",
          stem_eligible: false,
          stem_opt_applied: false,
          unemployment_days_used: 0,
        }
      : undefined,

    // Enhanced H-4 EAD data with primary holder info
    h4_ead: isH4
      ? {
          primary_holder: {
            relationship: "spouse",
          },
          h4_ead_card_number: undefined,
          h4_ead_category: "C26",
          h4_ead_validity_start: undefined,
          h4_ead_validity_end: undefined,
          advance_parole: { has_advance_parole: false },
          employment: { currently_employed: false },
          notes: undefined,
        }
      : undefined,

    l1: isL1
      ? {
          l1_type: "L1B",
          l1_petition_type: "initial",
          is_blanket_l: false,
        }
      : undefined,

    // L-2 dependent data
    l2_dependent: isL2
      ? {
          primary_holder: {
            visa_type: "L1B",
            relationship: "spouse",
          },
          ead_category: "C18",
          advance_parole: { has_advance_parole: false },
          employment: { currently_employed: false },
        }
      : undefined,

    green_card: isGC
      ? {
          gc_process_started: true,
          perm_required: true,
          i140_filed: false,
          i485_filed: false,
          combo_card_applied: false,
        }
      : undefined,

    gc_ead: isGCEAD
      ? {
          ead_ap_combo: {
            has_combo_card: true,
            ead_category: "C09",
            using_ead_for_work: true,
          },
          employment: { currently_employed: true },
        }
      : undefined,
  };
};

// Helper function to transform API data to frontend types
export const transformApiToFrontend = (apiData) => {
  const {
    candidate,
    immigration,
    travel_history,
    petition_history,
    worksites,
    documents,
    alerts,
    h1b_petitions,
    lca_history,
    i20_history,
    ead_records,
    i983_records,
  } = apiData;

  // If no immigration record yet, return minimal data from candidate
  if (!immigration) {
    // Determine visa type from available sources
    const visaType = candidate.visa_type_current || mapVisaStatusToCode(candidate.visa_status) || "";
    const visaSpecificData = initializeVisaSpecificData(visaType);

    return {
      candidate_id: candidate.id.toString(),
      visa_type: visaType,
      immigration_status: candidate.immigration_status || "pending",

      passport: {
        passport_number: candidate.passport_num || "",
        passport_country: candidate.passport_country || "",
        passport_issue_date: "",
        passport_expiry_date: candidate.passport_expiry_date || "",
        passport_issue_city: "",
        has_previous_passport: false,
        previous_passport_number: undefined,
      },

      i94: {
        i94_number: candidate.i94_number || "",
        i94_admission_date: "",
        i94_expiry_date: candidate.i94_expiry_date || "",
        i94_admission_class: "",
        i94_is_duration_of_status: false,
        port_of_entry: "",
      },

      visa_stamp: {
        has_valid_visa_stamp: false,
        visa_stamp_issue_date: undefined,
        visa_stamp_expiry_date: undefined,
        visa_stamp_consulate: undefined,
        visa_stamp_annotation: undefined,
        visa_stamp_entries: undefined,
        needs_visa_stamping: false,
        visa_stamping_notes: undefined,
      },

      h1b: visaSpecificData.h1b,
      opt: visaSpecificData.opt,
      h4_ead: visaSpecificData.h4_ead,
      l1: visaSpecificData.l1,
      green_card: visaSpecificData.green_card,

      travel_history: [],
      petition_history: [],
      documents: [],
      alerts: [],

      // Pass through the API arrays directly (transformed to frontend types)
      h1b_petitions: h1b_petitions?.map(transformH1BPetitionApi) || [],
      lca_history: lca_history?.map(transformLCARecordApi) || [],
      // OPT/I-20/EAD arrays - pass through directly (API structure matches frontend types)
      i20_history: i20_history?.map(transformI20RecordApi) || [],
      ead_records: ead_records?.map(transformEADRecordApi) || [],
      i983_records: i983_records?.map(transformI983RecordApi) || [],
      // GC Processing Pipeline
      gc_processing: apiData.gc_processing || null,

      last_updated: "",
      updated_by: "",
    };
  }

  // Prioritize candidate's visa_status (source of truth) over immigration record's visa_type (may be stale)
  const actualVisaType =
    mapVisaStatusToCode(candidate.visa_status) || candidate.visa_type_current || immigration.visa_type;
  const visaSpecificData = initializeVisaSpecificData(actualVisaType);

  return {
    candidate_id: immigration.candidate_id.toString(),
    visa_type: actualVisaType,
    immigration_status: immigration.immigration_status,

    passport: {
      passport_number: immigration.passport_number || "",
      passport_country: immigration.passport_country || "",
      passport_issue_date: immigration.passport_issue_date || "",
      passport_expiry_date: immigration.passport_expiry_date || "",
      passport_issue_city: immigration.passport_issue_city || "",
      has_previous_passport: immigration.has_previous_passport || false,
      previous_passport_number: immigration.previous_passport_number,
    },

    i94: {
      i94_number: immigration.i94_number || "",
      i94_admission_date: immigration.i94_admission_date || "",
      i94_expiry_date: immigration.i94_expiry_date || "",
      i94_admission_class: immigration.i94_admission_class || "",
      i94_is_duration_of_status: immigration.i94_is_duration_of_status || false,
      port_of_entry: immigration.port_of_entry || "",
    },

    visa_stamp: {
      has_valid_visa_stamp: immigration.has_valid_visa_stamp || false,
      visa_stamp_issue_date: immigration.visa_stamp_issue_date,
      visa_stamp_expiry_date: immigration.visa_stamp_expiry_date,
      visa_stamp_consulate: immigration.visa_stamp_consulate,
      visa_stamp_annotation: immigration.visa_stamp_annotation,
      visa_stamp_entries: immigration.visa_stamp_entries,
      needs_visa_stamping: immigration.needs_visa_stamping || false,
      visa_stamping_notes: immigration.visa_stamping_notes,
    },

    // Use stored data if visa type matches, otherwise initialize fresh data for correct visa type
    // Flatten nested petition data for H1B - API returns h1b_data.petition, UI expects flat fields
    h1b:
      visaSpecificData.h1b !== undefined
        ? flattenH1BData(immigration.h1b_data, visaSpecificData.h1b, petition_history)
        : undefined,
    opt: visaSpecificData.opt !== undefined ? immigration.opt_data || visaSpecificData.opt : undefined,
    h4_ead: visaSpecificData.h4_ead !== undefined ? immigration.dependent_data || visaSpecificData.h4_ead : undefined,
    l1: visaSpecificData.l1 !== undefined ? immigration.l1_data || visaSpecificData.l1 : undefined,
    l2_dependent:
      visaSpecificData.l2_dependent !== undefined
        ? immigration.dependent_data || visaSpecificData.l2_dependent
        : undefined,
    green_card:
      visaSpecificData.green_card !== undefined
        ? immigration.green_card_data || visaSpecificData.green_card
        : immigration.green_card_data?.gc_process_started
          ? immigration.green_card_data
          : undefined,
    gc_ead:
      visaSpecificData.gc_ead !== undefined
        ? {
            ead_ap_combo: immigration.green_card_data?.ead_ap_combo || visaSpecificData.gc_ead?.ead_ap_combo,
            employment: immigration.dependent_data?.employment || visaSpecificData.gc_ead?.employment,
          }
        : undefined,

    travel_history:
      travel_history?.map((t) => ({
        travel_id: t.id,
        departure_date: t.departure_date,
        departure_airport: t.departure_airport,
        destination_country: t.destination_country,
        destination_city: t.destination_city,
        purpose: t.purpose,
        purpose_details: t.purpose_details,
        return_date: t.return_date,
        port_of_entry: t.port_of_entry,
        new_i94_number: t.new_i94_number,
        new_i94_expiry: t.new_i94_expiry,
        visa_stamped_during_trip: t.visa_stamped_during_trip,
        visa_stamp_consulate: t.visa_stamp_consulate,
        used_automatic_revalidation: t.used_automatic_revalidation,
        had_issues_at_port: t.had_issues_at_port,
        issue_details: t.issue_details,
        documents_carried: t.documents_carried,
        notes: t.notes,
      })) || [],

    petition_history:
      petition_history?.map((p) => ({
        history_id: p.id,
        event_type: p.event_type,
        event_date: p.event_date,
        from_status: p.from_status,
        to_status: p.to_status,
        employer: p.employer,
        receipt_number: p.receipt_number,
        approval_date: p.approval_date,
        validity_start: p.validity_start,
        validity_end: p.validity_end,
        notes: p.notes,
        created_at: "",
      })) || [],

    documents:
      documents?.map((d) => ({
        document_id: d.id.toString(),
        row_id: d.id, // Keep numeric ID for API operations
        // Use API's human-readable doc_type first, then fall back to internal codes
        doc_type: d.doc_type || d.immigration_doc_type || d.doc_category || "other",
        doc_type_label: d.doc_type || undefined, // Preserve original API label for display
        immigration_doc_type: d.immigration_doc_type, // Keep original for section filtering
        doc_name: d.file_name, // Use file_name as doc_name (it's always present)
        file_name: d.file_name,
        file_path: d.file_path,
        file_size: 0,
        mime_type: "",
        status: d.doc_status || "uploaded",
        expiry_date: d.doc_expiry || undefined,
        doc_expiry: d.doc_expiry || undefined,
        issue_date: d.doc_validfrom || undefined,
        valid_from: d.doc_validfrom || undefined,
        doc_validfrom: d.doc_validfrom || undefined,
        document_number: d.document_number,
        notes: d.doc_desc,
        uploaded_by: d.uploaded_by || "",
        uploaded_at: d.fileuploaded_datetime,
        verified_by: d.verified_by,
        verified_at: d.verified_at,
        rejection_reason: d.rejection_reason,
        is_resume: d.is_resume || "no",
      })) || [],

    alerts:
      alerts?.map((a) => ({
        alert_id: `${a.type}-${a.title}`,
        type: a.type,
        level: a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "info",
        title: a.title,
        message: a.message,
        due_date: a.expiry_date,
        days_until: a.days_until,
      })) || [],

    // Pass through the API arrays directly (transformed to frontend types)
    h1b_petitions: h1b_petitions?.map(transformH1BPetitionApi) || [],
    lca_history: lca_history?.map(transformLCARecordApi) || [],
    // OPT/I-20/EAD arrays - pass through (API structure matches frontend types)
    i20_history: i20_history?.map(transformI20RecordApi) || [],
    ead_records: ead_records?.map(transformEADRecordApi) || [],
    i983_records: i983_records?.map(transformI983RecordApi) || [],
    // CPT History - pass through directly (API structure matches frontend types)
    cpt_history: apiData.cpt_history || [],
    cumulative_ft_cpt_months: apiData.cumulative_ft_cpt_months || 0,
    opt_eligible: apiData.opt_eligible ?? true,
    // GC Processing Pipeline
    gc_processing: apiData.gc_processing || null,

    // Document file references from immigration record (for section linking)
    passportDocumentFile: immigration.passport_document_file || null,
    i94DocumentFile: immigration.i94_document_file || null,
    visaStampDocumentFile: immigration.visa_stamp_document_file || null,

    last_updated: immigration.updated_at || "",
    updated_by: immigration.updated_by || "",
  };
};

// Transform H1B Petition from API to frontend type
const transformH1BPetitionApi = (p) => ({
  id: p.id,
  is_current: p.is_current,
  petition_type: p.petition_type || p.petition_category || "initial",
  receipt_number: p.receipt_number,
  status: p.status,
  employer_name: p.employer_name,
  employer_address: p.employer_address,
  case_type: p.case_type,
  classification: p.classification,
  notice_type: p.notice_type,
  filed_date: p.filed_date,
  notice_date: p.notice_date,
  approval_date: p.approval_date || undefined,
  validity_start: p.validity_start || undefined,
  validity_end: p.validity_end || undefined,
  premium_processing: p.premium_processing || undefined,
  cap_status: undefined, // Not directly in API, would need mapping
  lca_id: p.lca_id || undefined,
  linked_lca_number: undefined, // Will be resolved by UI from lca_history
  // Nested data passed through directly
  beneficiary_data: p.beneficiary_data,
  i94_data: p.i94_data,
  // Document
  document_file_name: p.document_file_name || undefined,
  job_title: p.job_title || undefined,
  notes: p.notes || undefined,
  created_at: p.created_at,
  updated_at: p.updated_at || undefined,
});

// Transform LCA Record from API to frontend type
const transformLCARecordApi = (l) => ({
  id: l.id,
  is_current: l.is_current,
  lca_type: l.lca_type || "initial",
  case_number: l.lca_case_number,
  status: l.lca_status,
  employer_name: l.employer_name || "",
  employer_fein: l.employer_ein,
  certified_date: l.lca_certified_date || undefined,
  validity_start: l.lca_validity_start,
  validity_end: l.lca_validity_end,
  job_title: l.job_title,
  soc_code: l.soc_code,
  soc_title: l.soc_title,
  // Wage details - extract from first worksite if available
  wage_level: l.worksites?.[0]?.wage_level,
  prevailing_wage: l.worksites?.[0]?.prevailing_wage ? parseFloat(l.worksites[0].prevailing_wage) : undefined,
  actual_wage: l.worksites?.[0]?.actual_wage ? parseFloat(l.worksites[0].actual_wage) : undefined,
  wage_unit: l.worksites?.[0]?.wage_unit?.toLowerCase() || "year",
  full_time: l.is_full_time,
  // Worksites
  worksites: l.worksites?.map((w) => ({
    is_primary: w.is_primary,
    worksite_name: w.worksite_name,
    address_line1: w.address_line1,
    address_line2: w.address_line2 || undefined,
    city: w.city,
    state: w.state,
    county: w.county,
    zip_code: w.zip_code,
    client_contact_name: w.client_contact_name || undefined,
    client_contact_phone: w.client_contact_phone || undefined,
    client_contact_email: w.client_contact_email || undefined,
  })),
  // Attorney
  attorney:
    l.attorney_name || l.attorney_firm
      ? {
          name: l.attorney_name,
          firm_name: l.attorney_firm,
          address_line1: l.attorney_address,
          phone: l.attorney_phone,
          email: l.attorney_email,
          bar_number: l.attorney_bar_number,
        }
      : undefined,
  document_file_name: l.document_file_name || undefined,
  notes: l.notes || undefined,
  created_at: l.created_at,
  updated_at: l.updated_at || undefined,
});

// Transform I-20 Record from API to frontend type
const transformI20RecordApi = (i) => ({
  id: i.id,
  is_current: i.is_current,
  sevis_number: i.sevis_number,
  student_name: i.student_name,
  i20_type:
    i.i20_type || (i.opt_type === "stem_opt" ? "stem_extension" : i.opt_recommended ? "opt_recommendation" : "initial"),
  school_name: i.school_name,
  school_address: i.school_address,
  school_city: i.school_city,
  school_state: i.school_state,
  school_code: i.school_code,
  sevis_school_code: i.sevis_school_code || i.school_code,
  program: i.program,
  degree_level: i.degree_level,
  cip_code: i.cip_code,
  stem_eligible: i.stem_eligible,
  program_start_date: i.program_start_date,
  program_end_date: i.program_end_date,
  dso_name: i.dso_name,
  dso_email: i.dso_email,
  dso_phone: i.dso_phone,
  opt_recommended: i.opt_recommended,
  opt_start_date: i.opt_start_date,
  opt_end_date: i.opt_end_date,
  stem_opt_recommended: i.stem_opt_recommended,
  stem_opt_start_date: i.stem_opt_start_date,
  stem_opt_end_date: i.stem_opt_end_date,
  stem_opt_employer: i.stem_opt_employer,
  stem_opt_employer_ein: i.stem_opt_employer_ein,
  // Beneficiary data
  date_of_birth: i.date_of_birth,
  country_of_birth: i.country_of_birth,
  country_of_citizenship: i.country_of_citizenship,
  document_file_name: i.document_file_name,
  notes: i.notes,
  created_at: i.created_at,
  updated_at: i.updated_at,
});

// Transform EAD Record from API to frontend type
const transformEADRecordApi = (e) => ({
  id: e.id,
  is_current: e.is_current,
  ead_number: e.ead_number,
  ead_category: e.ead_category,
  status: e.status,
  card_holder_name: e.card_holder_name,
  a_number: e.a_number,
  card_issue_date: e.card_issue_date,
  card_valid_from: e.card_valid_from,
  card_expiry_date: e.card_expiry_date,
  // Additional details
  terms_and_conditions: e.terms_and_conditions,
  is_combo_card: e.is_combo_card,
  has_advance_parole: e.has_advance_parole,
  country_of_birth: e.country_of_birth,
  date_of_birth: e.date_of_birth,
  i94_number: e.i94_number,
  visa_type_inferred: e.visa_type_inferred,
  document_file_name: e.document_file_name,
  notes: e.notes,
  created_at: e.created_at,
  updated_at: e.updated_at,
});

// Transform I-983 Record from API to frontend type
const transformI983RecordApi = (t) => ({
  id: t.id,
  is_current: t.is_current,
  // Employer Info
  employer_name: t.employer_name,
  employer_ein: t.employer_ein,
  employer_e_verify_company_id: t.employer_e_verify_number,
  employer_e_verify_status: t.employer_e_verify_status,
  employer_address: t.employer_address,
  employer_phone: t.employer_phone,
  employer_website: t.employer_website,
  employer_naics_code: t.employer_naics_code,
  // Job Info
  job_title: t.job_title,
  soc_code: t.soc_code,
  soc_title: t.soc_title,
  training_start_date: t.training_start_date,
  training_end_date: t.training_end_date,
  hours_per_week: t.hours_per_week,
  compensation: t.compensation,
  // Training Details
  training_goals: t.training_goals,
  training_activities: t.training_activities,
  // Supervisor
  supervisor_name: t.supervisor_name,
  supervisor_email: t.supervisor_email,
  supervisor_phone: t.supervisor_phone,
  supervisor_title: t.supervisor_title,
  // Submission
  submitted: t.submitted,
  submitted_date: t.submitted_date,
  status: t.status,
  // Evaluation Due Dates
  eval_6month_due: t.eval_6month_due,
  eval_12month_due: t.eval_12month_due,
  eval_final_due: t.eval_final_due,
  // Evaluation Completion (support both API field name variations)
  eval_6month_completed: t.eval_6month_completed,
  eval_6month_completed_date: t.eval_6month_completed_date || t.eval_6month_date,
  eval_6month_notes: t.eval_6month_notes,
  eval_12month_completed: t.eval_12month_completed,
  eval_12month_completed_date: t.eval_12month_completed_date || t.eval_12month_date,
  eval_12month_notes: t.eval_12month_notes,
  eval_final_completed: t.eval_final_completed,
  eval_final_completed_date: t.eval_final_completed_date || t.eval_final_date,
  eval_final_notes: t.eval_final_notes,
  // Document & Metadata
  document_file_name: t.document_file_name,
  notes: t.notes,
  created_at: t.created_at,
  updated_at: t.updated_at,
});

export const transformFrontendToApi = (frontendData) => {
  return {
    visa_type: frontendData.visa_type,
    immigration_status: frontendData.immigration_status,

    passport_number: frontendData.passport?.passport_number,
    passport_country: frontendData.passport?.passport_country,
    passport_issue_date: frontendData.passport?.passport_issue_date,
    passport_expiry_date: frontendData.passport?.passport_expiry_date,
    passport_issue_city: frontendData.passport?.passport_issue_city,
    has_previous_passport: frontendData.passport?.has_previous_passport,
    previous_passport_number: frontendData.passport?.previous_passport_number,

    i94_number: frontendData.i94?.i94_number,
    i94_admission_date: frontendData.i94?.i94_admission_date,
    i94_expiry_date: frontendData.i94?.i94_expiry_date,
    i94_admission_class: frontendData.i94?.i94_admission_class,
    i94_is_duration_of_status: frontendData.i94?.i94_is_duration_of_status,
    port_of_entry: frontendData.i94?.port_of_entry,

    has_valid_visa_stamp: frontendData.visa_stamp?.has_valid_visa_stamp,
    visa_stamp_issue_date: frontendData.visa_stamp?.visa_stamp_issue_date,
    visa_stamp_expiry_date: frontendData.visa_stamp?.visa_stamp_expiry_date,
    visa_stamp_consulate: frontendData.visa_stamp?.visa_stamp_consulate,
    visa_stamp_annotation: frontendData.visa_stamp?.visa_stamp_annotation,
    visa_stamp_entries: frontendData.visa_stamp?.visa_stamp_entries,
    needs_visa_stamping: frontendData.visa_stamp?.needs_visa_stamping,
    visa_stamping_notes: frontendData.visa_stamp?.visa_stamping_notes,

    h1b_data: frontendData.h1b,
    opt_data: frontendData.opt,
    dependent_data: frontendData.h4_ead || frontendData.l2_dependent,
    l1_data: frontendData.l1,
    green_card_data:
      frontendData.green_card ||
      (frontendData.gc_ead
        ? {
            ...frontendData.green_card,
            ead_ap_combo: frontendData.gc_ead.ead_ap_combo,
          }
        : undefined),
  };
};

/**
 * Parse a document using AI/OCR to extract immigration data
 */
export const parseDocument = async (file, candidateId, organization, documentTypeHint, candidateEmail) => {
  try {
    // Convert file to base64
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Check for invalid base64 content (error message from backend download)
    if (base64String === "filenotfoundoraccessdenieQ==" || base64String.length < 100) {
      return {
        status: "error",
        message: "Invalid file content. The file appears to be corrupted or empty.",
        error_code: "INVALID_FILE_CONTENT",
      };
    }

    // Determine file type from mime type
    let fileType = "pdf";
    if (file.type.includes("image/jpeg") || file.type.includes("image/jpg")) {
      fileType = "jpg";
    } else if (file.type.includes("image/png")) {
      fileType = "png";
    }

    const payload = {
      emailid: getCurrentUserEmail(),
      task: "parse-immigration-document",
      employee_email: candidateEmail || "muni.k0892@gmail.com",
      file_base64: base64String,
      file_type: fileType,
    };

    if (documentTypeHint) {
      payload.doc_type = documentTypeHint;
    }
    if (candidateId) {
      payload.candidate_id = candidateId;
    }
    if (organization) {
      payload.organization = organization;
    }

    const response = await fetch(`${IMMIGRATION_API_URL}/parse-document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
        Origin: window.location.origin,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();

    // Transform API response to expected ParseDocumentResponse format
    if (apiResponse.success && apiResponse.data) {
      const { data } = apiResponse;
      const docType = data.doc_type || documentTypeHint || "unknown";

      // Handle different response structures:
      // - LCA/H1B: extracted_data.immigration_data (nested) - but NOT gc_card
      // - I-20/EAD/Passport/GC Card: extracted_data (flat fields directly)
      let rawFields = {};
      const worksites = data.extracted_data?.worksites || [];

      // For gc_card, i20, ead_card, passport, i94 - use flat structure
      // For lca, h1b_approval - use nested immigration_data structure
      const useFlatStructure = ["gc_card", "i20", "ead_card", "ead", "passport", "visa_stamp", "i94", "i983"].includes(
        docType,
      );

      if (!useFlatStructure && data.extracted_data?.immigration_data) {
        // Nested structure (LCA, H1B)
        rawFields = data.extracted_data.immigration_data;
      } else if (data.extracted_data) {
        // Flat structure (I-20, EAD, Passport, I-94, GC Card) - use all fields except nested objects
        rawFields = { ...data.extracted_data };
        // Remove nested objects that shouldn't be flattened as display fields
        delete rawFields.worksites;
        delete rawFields.opt_data; // Keep this for backend but not as a display field
        delete rawFields.green_card_data; // Keep for backend but not as display field
        delete rawFields.immigration_data; // Contains visa_type, not relevant for display
      }

      // Convert flat fields to ParsedDocumentField format with confidence scores
      const extractedData = {};

      // Process fields - keep original API field names
      Object.entries(rawFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && typeof value !== "object") {
          extractedData[key] = {
            value: typeof value === "boolean" ? String(value) : String(value),
            confidence: 0.95, // High confidence for structured data
            edited: false,
          };
        }
      });

      // Add primary worksite wage data for display
      const primaryWorksite = worksites.find((w) => w.is_primary) || worksites[0];
      if (primaryWorksite) {
        if (primaryWorksite.prevailing_wage) {
          extractedData["prevailing_wage"] = {
            value: String(primaryWorksite.prevailing_wage),
            confidence: 0.95,
            edited: false,
          };
        }
        if (primaryWorksite.actual_wage) {
          extractedData["actual_wage"] = {
            value: String(primaryWorksite.actual_wage),
            confidence: 0.95,
            edited: false,
          };
        }
        if (primaryWorksite.wage_level) {
          extractedData["wage_level"] = {
            value: primaryWorksite.wage_level,
            confidence: 0.95,
            edited: false,
          };
        }
      }

      // Pass worksites as a JSON string for the frontend to parse
      if (worksites.length > 0) {
        extractedData["_worksites"] = {
          value: JSON.stringify(worksites),
          confidence: 0.95,
          edited: false,
        };
      }

      return {
        status: "success",
        document_type: docType,
        document_type_confidence: 0.95,
        extracted_data: extractedData,
        raw_extracted_data: data.extracted_data, // Pass raw data for dedicated save endpoints
        needs_review: false,
        review_fields: [],
        message: apiResponse.message,
        // Pass file info for save calls
        file_base64: base64String,
        file_type: fileType,
        file_name: file.name,
      };
    }

    // Handle error response
    return {
      status: "error",
      document_type: "",
      document_type_confidence: 0,
      extracted_data: {},
      needs_review: false,
      review_fields: [],
      error_code: "PARSE_ERROR",
      message: apiResponse.message || "Failed to parse document",
    };
  } catch (error) {
    console.error("Error parsing document:", error);
    return {
      status: "error",
      document_type: "",
      document_type_confidence: 0,
      extracted_data: {},
      needs_review: false,
      review_fields: [],
      error_code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Failed to parse document",
    };
  }
};

/**
 * Save I-20 data after parsing
 */
export const saveI20 = async (employeeEmail, i20Data, setAsCurrent = true, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-i20",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      extracted_data: i20Data.extracted_data,
      set_as_current: setAsCurrent,
    };

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
      payload.extracted_data = i20Data;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving I-20:", error);
    throw error;
  }
};

/**
 * Save EAD data after parsing
 */
export const saveEAD = async (employeeEmail, eadData, setAsCurrent = true, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-ead",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      extracted_data: eadData.extracted_data || eadData,
      set_as_current: setAsCurrent,
    };

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving EAD:", error);
    throw error;
  }
};

/**
 * Save I-983 Training Plan data
 */
export const saveI983 = async (employeeEmail, i983Data, setAsCurrent = true, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-i983",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      i983_data: i983Data.extracted_data,
      set_as_current: setAsCurrent,
    };

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
      payload.i983_data = i983Data;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving I-983:", error);
    throw error;
  }
};

/**
 * Update I-983 evaluation status
 */
export const updateI983Evaluation = async (employeeEmail, i983Id, evaluation, completed, completedDate, notes) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "update-i983-evaluation",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        i983_id: i983Id,
        evaluation,
        completed,
        completed_date: completedDate,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating I-983 evaluation:", error);
    throw error;
  }
};

/**
 * Delete I-20 record
 */
export const deleteI20 = async (employeeEmail, i20Id) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-i20",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        i20_id: i20Id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting I-20:", error);
    throw error;
  }
};

/**
 * Delete EAD record
 */
export const deleteEAD = async (employeeEmail, eadId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-ead",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        ead_id: eadId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting EAD:", error);
    throw error;
  }
};

/**
 * Delete I-983 record
 */
export const deleteI983 = async (employeeEmail, i983Id) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-i983",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        i983_id: i983Id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting I-983:", error);
    throw error;
  }
};

/**
 * Get OPT dashboard with unemployment tracking
 */
export const getOPTDashboard = async (employeeEmail) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "get-opt-dashboard",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching OPT dashboard:", error);
    throw error;
  }
};

/**
 * Save OPT unemployment days
 */
export const saveOPTUnemployment = async (employeeEmail, optUnemploymentDays, stemOptUnemploymentDays) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "save-opt-unemployment",
        emailid: getCurrentUserEmail(),
        employee_email: employeeEmail,
        opt_unemployment_days: optUnemploymentDays,
        stem_opt_unemployment_days: stemOptUnemploymentDays,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving OPT unemployment:", error);
    throw error;
  }
};

/**
 * Save Green Card data after parsing
 * Stores data in green_card_data JSONB column
 */
export const saveGCCard = async (employeeEmail, gcData, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-gc-card",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      gc_data: gcData,
    };

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving Green Card:", error);
    throw error;
  }
};

/**
 * Delete Green Card data
 * Clears green_card_data and reverts visa type
 */
export const deleteGCCard = async (employeeEmail) => {
  try {
    const payload = {
      task: "delete-gc-card",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
    };

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting Green Card:", error);
    throw error;
  }
};

/**
 * Parse I-94 Travel History document
 * Extracts trips from I-94 PDF showing all entry/exit records
 */
export const parseI94TravelHistory = async (file, candidateEmail) => {
  try {
    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64Data = result.split(",")[1]; // Remove data:xxx;base64, prefix
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const fileType = file.type.includes("pdf") ? "pdf" : file.type.includes("png") ? "png" : "jpg";

    const payload = {
      task: "parse-immigration-document",
      emailid: getCurrentUserEmail(),
      employee_email: candidateEmail,
      doc_type: "i94_travel_history",
      file_base64: base64,
      file_type: fileType,
    };

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error parsing I-94 travel history:", error);
    throw error;
  }
};

/**
 * Import travel history from parsed I-94 data
 * Creates travel records for selected trips
 */
export const importTravelHistory = async (candidateEmail, documentNumber, trips, skipDuplicates = true) => {
  try {
    const payload = {
      task: "import-travel-history",
      emailid: getCurrentUserEmail(),
      employee_email: candidateEmail,
      document_number: documentNumber,
      skip_duplicates: skipDuplicates,
      trips,
    };

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error importing travel history:", error);
    throw error;
  }
};

/**
 * Save a new CPT authorization
 */
export const saveCPT = async (employeeEmail, cptData, i20Id, setAsCurrent = true, fileInfo) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-cpt",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      cpt_data: cptData,
      set_as_current: setAsCurrent,
    };

    if (i20Id) {
      payload.i20_id = i20Id;
    }

    if (fileInfo) {
      payload.file_base64 = fileInfo.file_base64;
      payload.file_type = fileInfo.file_type;
      payload.file_name = fileInfo.file_name;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving CPT:", error);
    throw error;
  }
};

/**
 * Update an existing CPT record
 */
export const updateCPT = async (cptId, cptData) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "update-cpt",
        emailid: getCurrentUserEmail(),
        cpt_id: cptId,
        cpt_data: cptData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating CPT:", error);
    throw error;
  }
};

/**
 * Delete a CPT record (soft delete / revoke)
 */
export const deleteCPT = async (cptId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-cpt",
        emailid: getCurrentUserEmail(),
        cpt_id: cptId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting CPT:", error);
    throw error;
  }
};

/**
 * Save GC Processing Pipeline data (upsert)
 */
export const saveGCProcessing = async (employeeEmail, gcProcessingData, fileData) => {
  const choosenFile = getSelectedSmartUpload();
  try {
    const payload = {
      task: "save-gc-processing",
      emailid: getCurrentUserEmail(),
      employee_email: employeeEmail,
      gc_processing_data: gcProcessingData,
    };

    if (fileData) {
      payload.file_base64 = fileData.file_base64;
      payload.file_type = fileData.file_type;
      payload.file_name = fileData.file_name;
      payload.doc_type = fileData.doc_type;
    }
    if (choosenFile === payload.file_name) {
      payload.is_existing_document = true;
    }

    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving GC processing:", error);
    throw error;
  }
};

/**
 * Delete GC Processing Pipeline
 */
export const deleteGCProcessing = async (gcProcessingId) => {
  try {
    const response = await fetch(IMMIGRATION_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        task: "delete-gc-processing",
        emailid: getCurrentUserEmail(),
        gc_processing_id: gcProcessingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting GC processing:", error);
    throw error;
  }
};
