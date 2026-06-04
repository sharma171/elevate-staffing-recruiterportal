// Immigration Tab Constants (Plain JS)

export const VISA_TYPES = [
  { code: 'H1B', label: 'H-1B', description: 'Specialty Occupation' },
  { code: 'H1B1', label: 'H-1B1', description: 'Chile/Singapore FTA' },
  { code: 'H4', label: 'H-4', description: 'H-1B Dependent (no EAD)' },
  { code: 'H4_EAD', label: 'H-4 EAD', description: 'H-1B Dependent with Work Authorization' },
  { code: 'L1A', label: 'L-1A', description: 'Intracompany Transferee - Manager/Executive' },
  { code: 'L1B', label: 'L-1B', description: 'Intracompany Transferee - Specialized Knowledge' },
  { code: 'L2', label: 'L-2', description: 'L-1 Dependent' },
  { code: 'L2_EAD', label: 'L-2 EAD', description: 'L-1 Dependent with Work Authorization' },
  { code: 'F1', label: 'F-1', description: 'Student' },
  { code: 'OPT', label: 'OPT', description: 'Optional Practical Training' },
  { code: 'STEM_OPT', label: 'STEM OPT', description: 'STEM OPT Extension' },
  { code: 'CPT', label: 'CPT', description: 'Curricular Practical Training' },
  { code: 'TN', label: 'TN', description: 'NAFTA Professional' },
  { code: 'E2', label: 'E-2', description: 'Treaty Investor' },
  { code: 'E3', label: 'E-3', description: 'Australian Specialty Occupation' },
  { code: 'O1', label: 'O-1', description: 'Extraordinary Ability' },
  { code: 'GC', label: 'Green Card', description: 'Permanent Resident' },
  { code: 'GC_EAD', label: 'GC EAD', description: 'I-485 Pending with Combo Card' },
  { code: 'EAD', label: 'EAD', description: 'Employment Authorization Document' },
  { code: 'USC', label: 'US Citizen', description: 'US Citizen' },
  { code: 'OTHER', label: 'Other', description: 'Other visa types' },
];

export const SHOW_GC_TRACKER_VISA_TYPES = [
  'H1B', 'H1B1', 'L1A', 'L1B',
  'H4_EAD', 'L2_EAD',
  'OPT', 'STEM_OPT',
  'E2', 'E3', 'O1'
];

export const HIDE_GC_TRACKER_VISA_TYPES = [
  'F1', 'CPT', 'H4', 'L2', 'TN', 'USC'
];

export const GC_COMPLETED_VISA_TYPES = [
  'GC', 'GC_EAD', 'EAD'
];

export const IMMIGRATION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
];

export const PETITION_TYPES = [
  { value: 'initial', label: 'Initial' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'extension', label: 'Extension' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'concurrent', label: 'Concurrent' },
];

export const CAP_STATUSES = [
  { value: 'cap_subject', label: 'Cap Subject' },
  { value: 'cap_exempt', label: 'Cap Exempt' },
  { value: 'cap_exempt_masters', label: 'Cap Exempt (Masters)' },
];

export const PETITION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'rfe', label: 'RFE Received' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const LCA_WAGE_LEVELS = [
  { value: 'level_1', label: 'Level 1 (Entry)' },
  { value: 'level_2', label: 'Level 2 (Qualified)' },
  { value: 'level_3', label: 'Level 3 (Experienced)' },
  { value: 'level_4', label: 'Level 4 (Fully Competent)' },
];

export const EDUCATION_REQUIREMENTS = [
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'bachelors_plus_5', label: "Bachelor's + 5 Years Experience" },
];

export const DEGREE_LEVELS = [
  { value: 'associate', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
];

export const TRAVEL_PURPOSES = [
  { value: 'business', label: 'Business' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'family_emergency', label: 'Family Emergency' },
  { value: 'visa_stamping', label: 'Visa Stamping' },
  { value: 'other', label: 'Other' },
];

export const EVENT_TYPES = [
  { value: 'initial_entry', label: 'Initial Entry' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'extension', label: 'Extension' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'ead_issued', label: 'EAD Issued' },
  { value: 'gc_stage', label: 'Green Card Stage' },
];

export const GC_CATEGORIES = [
  { value: 'EB1A', label: 'EB-1A (Extraordinary Ability)' },
  { value: 'EB1B', label: 'EB-1B (Outstanding Researcher)' },
  { value: 'EB1C', label: 'EB-1C (Multinational Manager)' },
  { value: 'EB2', label: 'EB-2 (Advanced Degree)' },
  { value: 'EB2_NIW', label: 'EB-2 NIW (National Interest Waiver)' },
  { value: 'EB3', label: 'EB-3 (Skilled Workers)' },
];

export const ALERT_THRESHOLDS = {
  critical: 30,
  warning: 60,
  info: 90,
};

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'OTHER', name: 'Other' },
];

export const COMMON_DOCUMENTS = [
  { code: 'passport_copy', name: 'Passport Copy (Bio Page)', required: true },
  { code: 'passport_all_pages', name: 'Passport All Pages', required: false },
  { code: 'visa_stamp_copy', name: 'Visa Stamp Copy', required: false },
  { code: 'i94_printout', name: 'I-94 Printout', required: true },
  { code: 'photo_immigration', name: 'Passport Photo (2x2)', required: false },
  { code: 'ssn_card', name: 'Social Security Card', required: false },
  { code: 'drivers_license', name: "Driver's License", required: false },
];

export const H1B_DOCUMENTS = [
  { code: 'h1b_approval_i797', name: 'H-1B Approval Notice (I-797)', required: true },
  { code: 'h1b_receipt_notice', name: 'H-1B Receipt Notice (I-797C)', required: false },
  { code: 'i129_petition', name: 'I-129 Petition Copy', required: true },
  { code: 'lca_9035', name: 'LCA (Form 9035)', required: true },
  { code: 'lca_posting_notice', name: 'LCA Posting Notice', required: false },
  { code: 'public_access_file', name: 'Public Access File', required: true },
  { code: 'support_letter', name: 'Employer Support Letter', required: true },
  { code: 'client_letter', name: 'Client Letter', required: false },
  { code: 'degree_certificates', name: 'Degree Certificates', required: false },
  { code: 'credential_evaluation', name: 'Credential Evaluation', required: false },
];

export const OPT_DOCUMENTS = [
  { code: 'i20_current', name: 'I-20 (Current/Most Recent)', required: true },
  { code: 'i20_all', name: 'All I-20s', required: false },
  { code: 'opt_ead_card', name: 'OPT EAD Card', required: true },
  { code: 'opt_approval_notice', name: 'OPT Approval Notice (I-797)', required: false },
  { code: 'stem_ead_card', name: 'STEM OPT EAD Card', required: false },
  { code: 'i983_training_plan', name: 'I-983 Training Plan (Signed)', required: false },
  { code: 'i983_6month_eval', name: 'I-983 6-Month Evaluation', required: false },
  { code: 'degree_certificate', name: 'Degree Certificate', required: true },
  { code: 'transcripts', name: 'Official Transcripts', required: false },
];

export const H4_DOCUMENTS = [
  { code: 'h4_approval_i797', name: 'H-4 Approval Notice (I-797)', required: true },
  { code: 'h4_ead_card', name: 'H-4 EAD Card', required: false },
  { code: 'h4_ead_approval', name: 'H-4 EAD Approval Notice', required: false },
  { code: 'marriage_certificate', name: 'Marriage Certificate', required: true },
  { code: 'marriage_cert_translation', name: 'Marriage Certificate Translation', required: false },
  { code: 'primary_h1b_approval', name: "Primary's H-1B Approval", required: true },
  { code: 'primary_i140_approval', name: "Primary's I-140 Approval", required: false },
];

export const GC_DOCUMENTS = [
  { code: 'perm_application', name: 'PERM Application (9089)', required: false },
  { code: 'perm_certification', name: 'PERM Certification', required: false },
  { code: 'i140_petition', name: 'I-140 Petition', required: false },
  { code: 'i140_approval', name: 'I-140 Approval Notice', required: false },
  { code: 'i485_application', name: 'I-485 Application', required: false },
  { code: 'combo_ead_card', name: 'Combo EAD Card', required: false },
  { code: 'advance_parole', name: 'Advance Parole Document', required: false },
  { code: 'gc_card', name: 'Green Card', required: false },
  { code: 'birth_certificate', name: 'Birth Certificate', required: false },
];

export const PARSEABLE_DOCUMENT_TYPES = [
  { code: 'passport', name: 'Passport', apiType: 'passport' },
  { code: 'visa', name: 'Visa Stamp', apiType: 'visa' },
  { code: 'h1b_approval', name: 'H-1B Approval Notice (I-797)', apiType: 'h1b_approval' },
  { code: 'i797', name: 'I-797 (Other Notices)', apiType: 'i797' },
  { code: 'ead', name: 'EAD Card', apiType: 'ead' },
  { code: 'ead_card', name: 'EAD Card', apiType: 'ead_card' },
  { code: 'i20', name: 'I-20 (Student)', apiType: 'i20' },
  { code: 'i94', name: 'I-94 Record', apiType: 'i94' },
  { code: 'i140', name: 'I-140 Petition', apiType: 'i140' },
  { code: 'perm', name: 'PERM Certification', apiType: 'perm' },
  { code: 'lca', name: 'LCA (Form 9035)', apiType: 'lca' },
  { code: 'gc_card', name: 'Green Card', apiType: 'gc_card' },
  { code: 'green_card', name: 'Green Card', apiType: 'green_card' },
  { code: 'drivers_license', name: "Driver's License", apiType: 'drivers_license' },
  { code: 'ssn_card', name: 'Social Security Card', apiType: 'ssn_card' },
  { code: 'resume', name: 'Resume/CV', apiType: 'resume' },
  { code: 'i983', name: 'I-983 Training Plan', apiType: 'i983' },
];

export const I20_FIELD_SECTIONS = {
  student: {
    title: 'Student Information',
    fields: ['student_name', 'date_of_birth', 'country_of_birth', 'country_of_citizenship'],
  },
  school: {
    title: 'School & Program',
    fields: [
      'school_name', 'school_address', 'school_code', 'sevis_number',
      'degree_level', 'program', 'cip_code', 'stem_eligible',
      'program_start_date', 'program_end_date'
    ],
  },
  dso: {
    title: 'DSO Information',
    fields: ['dso_name', 'dso_email', 'dso_phone'],
  },
  opt: {
    title: 'OPT Authorization',
    fields: ['opt_recommended', 'opt_start_date', 'opt_end_date'],
  },
  stem_opt: {
    title: 'STEM OPT',
    conditionalFields: ['stem_opt_recommended', 'stem_opt_employer', 'stem_opt_employer_ein'],
  },
  cpt: {
    title: 'CPT',
    conditionalFields: ['cpt_authorized', 'cpt_employer', 'cpt_start_date', 'cpt_end_date'],
  },
};

export const EAD_FIELD_SECTIONS = {
  card: {
    title: 'EAD Card Information',
    fields: ['ead_number', 'card_holder_name', 'ead_category', 'a_number'],
  },
  dates: {
    title: 'Validity Dates',
    fields: ['card_issue_date', 'card_expiry_date'],
  },
  status: {
    title: 'Status',
    fields: ['status', 'visa_type_inferred'],
  },
};

export const GC_CARD_FIELD_SECTIONS = {
  card: {
    title: 'Green Card Information',
    fields: ['card_number', 'a_number', 'category', 'card_holder_name'],
  },
  dates: {
    title: 'Validity Dates',
    fields: ['resident_since', 'card_expiry_date'],
  },
  personal: {
    title: 'Personal Information',
    fields: ['country_of_birth', 'date_of_birth', 'is_conditional'],
  },
};

export const FIELD_LABELS = {
  student_name: 'Student Name',
  date_of_birth: 'Date of Birth',
  country_of_birth: 'Country of Birth',
  country_of_citizenship: 'Country of Citizenship',
  school_name: 'School Name',
  school_address: 'School Address',
  school_code: 'School Code',
  sevis_number: 'SEVIS Number',
  degree_level: 'Degree Level',
  program: 'Program/Major',
  cip_code: 'CIP Code',
  stem_eligible: 'STEM Eligible',
  program_start_date: 'Program Start',
  program_end_date: 'Program End',
  dso_name: 'DSO Name',
  dso_email: 'DSO Email',
  dso_phone: 'DSO Phone',
  opt_recommended: 'OPT Recommended',
  opt_start_date: 'OPT Start Date',
  opt_end_date: 'OPT End Date',
  stem_opt_recommended: 'STEM OPT Recommended',
  stem_opt_employer: 'STEM OPT Employer',
  stem_opt_employer_ein: 'STEM OPT Employer EIN',
  cpt_authorized: 'CPT Authorized',
  cpt_employer: 'CPT Employer',
  cpt_start_date: 'CPT Start Date',
  cpt_end_date: 'CPT End Date',
  ead_number: 'Card Number',
  card_holder_name: 'Card Holder Name',
  ead_category: 'EAD Category',
  a_number: 'A-Number',
  card_issue_date: 'Card Issue Date',
  card_expiry_date: 'Card Expiry Date',
  status: 'Status',
  visa_type_inferred: 'Visa Type Inferred',
  receipt_number: 'Receipt Number',
  notice_date: 'Notice Date',
  approval_date: 'Approval Date',
  validity_start: 'Validity Start',
  validity_end: 'Validity End',
  employer_name: 'Employer Name',
  beneficiary_name: 'Beneficiary Name',
  lca_case_number: 'LCA Case Number',
  job_title: 'Job Title',
  soc_code: 'SOC Code',
  soc_title: 'SOC Title',
  prevailing_wage: 'Prevailing Wage',
  actual_wage: 'Actual Wage',
  wage_level: 'Wage Level',
  passport_number: 'Passport Number',
  passport_expiry_date: 'Passport Expiry',
  i94_number: 'I-94 Number',
  i94_expiry_date: 'I-94 Expiry',
  i94_class: 'I-94 Class',
  employer_ein: 'Employer EIN',
  employer_e_verify_company_id: 'E-Verify Company ID',
  employer_e_verify_status: 'E-Verify Status',
  supervisor_name: 'Supervisor Name',
  supervisor_email: 'Supervisor Email',
  supervisor_phone: 'Supervisor Phone',
  supervisor_title: 'Supervisor Title',
  training_start_date: 'Training Start',
  training_end_date: 'Training End',
  hours_per_week: 'Hours per Week',
  compensation: 'Compensation',
  training_goals: 'Training Goals',
  eval_6month_due: '6-Month Evaluation Due',
  eval_12month_due: '12-Month Evaluation Due',
  eval_final_due: 'Final Evaluation Due',
  card_number: 'Card Number',
  category: 'Category',
  resident_since: 'Resident Since',
  is_conditional: 'Conditional',
  card_valid_from: 'Valid From',
};
