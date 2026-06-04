import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import PeriodSelect from "./periodSelect";
import {
  X,
  ChartColumn,
  FileText,
  TrendingUp,
  Clock,
  UserCheck,
  User,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  Brain,
  TriangleAlert,
  Target,
  UserX,
  RefreshCw,
  MessageSquareWarning,
  HelpCircle,
  Flag,
  CircleX,
  ClipboardList,
  UserCog,
  ListChecks,
  ChevronDown,
  History,
  Calendar,
  Sparkles,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  XCircle,
  Loader2,
  Award,
  Plus,
  MessageSquare,
  Search,
  Mail,
  FileBarChart2,
  CircleHelp,
  OctagonXIcon,
} from "lucide-react";
import { json } from "react-router-dom";

// --- MOCK DETAILS (Placeholder for deep data not yet in the list API) ---
const MOCK_DETAILED_DATA = {
  manager: "Unassigned",
  overview: {
    totalSubmissions: 31,
    interviewsLast7Days: 2,
    assignedCandidatesCount: 3,
    submissionsLast7Days: 6,
    candidates: [
      { id: 1, name: "ROHIT NAGARJUNA", vendor: "akash.p@twsol.com", client: "TCS", rate: "$52/hr", date: "1/22/2026" },
      {
        id: 2,
        name: "SUBHASH VALLALA",
        vendor: "nathan.k@siriinfo.com",
        client: "TCS",
        rate: "$60/hr",
        date: "1/22/2026",
      },
      {
        id: 3,
        name: "PRANATHI THERALA",
        vendor: "mounikaj@brillius.com",
        client: "TCS",
        rate: "$55/hr",
        date: "1/21/2026",
      },
      {
        id: 4,
        name: "SUBHASH GANDHI",
        vendor: "arpit.saxena@tekishub.us",
        client: "TCS",
        rate: "$50/hr",
        date: "1/19/2026",
      },
      { id: 5, name: "RAJESH KUMAR", vendor: "hr@infosys.com", client: "Infosys", rate: "$48/hr", date: "1/18/2026" },
      { id: 6, name: "ANITHA REDDY", vendor: "jobs@wipro.com", client: "Wipro", rate: "$58/hr", date: "1/15/2026" },
      { id: 7, name: "MAHESH BABU", vendor: "recruiter@hcl.com", client: "HCL", rate: "$62/hr", date: "1/14/2026" },
    ],
  },
  aiAnalysis: {
    candidateName: "Pranathi Therala",
    candidateEmail: "pranathitherala1196@gmail.com",
    tags: ["STEM OPT", "Java"],
    status: "NEGLECTED",
    effortLevel: "Insufficient",
    daysWithoutSubmission: 10,
    submissionCount: 4,
    performanceScore: 3,
    accountabilityLevel: "High",
    analyzedDate: "23/1/2026, 3:22:29 pm",
    history: [
      { date: "1/19/2026", note: "Applied in portals and sent emails. Got AI call" },
      { date: "1/16/2026", note: "Applied in portals and got few replies from vendors but not converted" },
      { date: "1/12/2026", note: "Applied in some portals got w2 calls and sent emails" },
    ],
    actionPlan: [
      "Submit Pranathi Therala to at least 3 new job openings today.",
      "Submission target for Pranathi Therala in the next week should be 3 submissions.",
      "Implement a follow-up process with vendors for Pranathi Therala to ensure timely updates.",
    ],
    redFlags: ["The recruiter has not secured any interviews for Pranathi Therala despite multiple submissions."],
  },
};

const ITEMS_PER_PAGE = 4;
const ITEMS_PER_PAGE_SUBMISSIONS = 5;

// Updated Colors to match the image design
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const RecruiterDetailSheet = ({ selectedRecruiter, isOpen, onClose, storedUser, user }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [submarisedData, setSubmarisedData] = useState([]);
  const [totalAssignedCandidates, setTotalAssignedCandidates] = useState([]);
  function getPermissions() {
    const stored = sessionStorage.getItem("permissions");

    if (!stored) return null;

    const { data } = JSON.parse(stored);

    return String(data?.modules?.recruiterAnalysis?.sections?.aiAnalysis).toLocaleLowerCase();
  }
  const [userPermissions, setUserPermissions] = useState("View");
  useEffect(() => {
    const persmissionsset = getPermissions();
    setUserPermissions(persmissionsset);
    setRecruiterAnalysisFailed(false);
    // console.log("permissiondata",persmissionsset);
  }, [storedUser, isOpen]);

  const [showAllHistorical, setShowAllHistorical] = useState(false);
  const [period, setPeriod] = useState("30");
  const [submissionData, setSubmissionData] = useState([]);
  // Pagination States for Submissions Tab
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [rateConfirmations, setRateConfirmations] = useState([]);
  const [interviewsPage, setInterviewsPage] = useState(1);
  const [noSubmissionReason, setNoSubmissionReason] = useState([]);
  const [excuseCollapse, setExcuseCollapse] = useState(false);
  // --- NEW STATES FOR AI ANALYSIS ---
  const [expandedAnalysisId, setExpandedAnalysisId] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recruiterAiTab, setRecruiterAiTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [recruiterAnalysisData, setRecruiterAnalysisData] = useState(null);
  const [isRecruiterAnalyzing, setIsRecruiterAnalyzing] = useState(false);
  const [recruiterAnalysisFailed, setRecruiterAnalysisFailed] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [storedAssignedData, setStoredAssignedData] = useState(null);
  // --- ZERO SUBMISSION STATES ---
  const [zeroSubmissions, setZeroSubmissions] = useState([]);
  const [selectedZeroCandidate, setSelectedZeroCandidate] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_HISTORY_PAGE = 3;
  const [zeroCandidateAnalysis, setZeroCandidateAnalysis] = useState(null);
  const [isZeroAnalyzing, setIsZeroAnalyzing] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState("90"); // Default 90 days
  // --- EMAIL POPUP STATES ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState(null);
  const [isFetchingEmail, setIsFetchingEmail] = useState(false);
  const [reasonLoader, setReasonLoader] = useState(false);
  console.log("selectedRecruiter", selectedRecruiter);

  const [interviewData, setInterviewData] = useState([]); // "Interviews & Screenings"
  const [submissionStatusSummary, setSubmissionStatusSummary] = useState([]); // Breakdown Badges
  const [activeFilter, setActiveFilter] = useState(null); // For filtering tables by status
  const [searchQuery, setSearchQuery] = useState(""); // For searching candidate names

  // Merge passed recruiter prop with mock details for the full view
  // If 'recruiter' is null (closed state), default to empty object to prevent crashes before unmount
  const data = selectedRecruiter ? { ...MOCK_DETAILED_DATA, ...selectedRecruiter } : MOCK_DETAILED_DATA;

  // Pagination State for Overview Table
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);

  const toggleCandidate = (id) => {
    // Close analysis if opening no-submission details
    if (expandedAnalysisId === id) setExpandedAnalysisId(null);
    setExpandedCandidateId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    if (!isRecruiterAnalyzing && recruiterAnalysisData) {
      handleAnalyzeRecruiterPerformance();
    }
  }, [analysisPeriod]);

  // --- MAIN RESET & FETCH EFFECT ---
  useEffect(() => {
    if (selectedRecruiter) {
      // 1. Activate Loader immediately
      setIsLoading(true);
      setError(null);

      // 2. Reset All Data States
      setSubmarisedData(null);
      setTotalAssignedCandidates([]);
      setSubmissionData([]);
      setInterviewData([]);
      setSubmissionStatusSummary([]);
      setZeroSubmissions([]);
      setNoSubmissionReason([]);
      setRecruiterAnalysisData(null);
      setAnalysisData(null);
      setSelectedZeroCandidate(null);

      // 3. Reset UI/Pagination States
      setActiveTab("overview");
      setCurrentPage(1);
      setSubmissionsPage(1);
      setInterviewsPage(1);
      setActiveFilter(null);
      setSearchQuery("");
      setExpandedAnalysisId(null);
      setExpandedCandidateId(null);
      setRecruiterAnalysisFailed(false);

      // 4. Trigger Fetch
      fetchRecruitersAnalysis();
    }
  }, [selectedRecruiter]);

  // Reset pagination when filters change
  useEffect(() => {
    setSubmissionsPage(1);
    setInterviewsPage(1);
  }, [activeFilter, searchQuery]);
  const fetchRecruitersAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://us-east1-recruiterportal.cloudfunctions.net/fetch_recruiter_analysis_v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: storedUser.email,
          email: selectedRecruiter.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonResponse = await response.json();
      setSubmarisedData(jsonResponse.summary);
      setTotalAssignedCandidates(jsonResponse.details.total_assigned_candidates);
      setSubmissionData(jsonResponse.details.total_submissions_last_24_hours);
      setInterviewData(jsonResponse.details.total_interview_tech_screenings || []);
      setRateConfirmations(jsonResponse.details.total_rate_confirmations || []); // Set all submissions data
      setSubmissionStatusSummary(jsonResponse.details.submissions_by_type_summary || []);
      // --- POPULATE ZERO SUBMISSIONS LIST ---
      setZeroSubmissions(jsonResponse.details.candidates_with_zero_submissions_last_24_hours || []);
    } catch (err) {
      console.error("Failed to fetch recruiters:", err);
      setError("Failed to load recruiter data.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE ZERO CANDIDATE SELECTION & ANALYSIS ---
  const handleZeroCandidateClick = async (candidate) => {
    setAnalysisData(null);
    setExpandedAnalysisId(null);
    setSelectedZeroCandidate(candidate);
    fetchNoSubbmissionReason(candidate.primary_email);
    setExpandedCandidateId(null);
    setIsAnalyzing(false);
    // setIsZeroAnalyzing(true);
    // setZeroCandidateAnalysis(null);

    // try {
    //   const response = await fetch(
    //     "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
    //     {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         emailid: storedUser.email,
    //         email: candidate.primary_email,
    //         operation: "analyze"
    //       }),
    //     }
    //   );

    //   if (!response.ok) throw new Error('Analysis failed');
    //   const result = await response.json();
    //   setZeroCandidateAnalysis(result);

    // } catch (error) {
    //   console.error("Zero Analysis Error:", error);
    // } finally {
    //   setIsZeroAnalyzing(false);
    // }
  };
  const [reasonLoading, setReasonLoading] = useState(false);
  const fetchNoSubbmissionReason = async (candidateEmail) => {
    try {
      // setIsLoading(true);
      setReasonLoading(true);
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailid: storedUser.email,
            email: candidateEmail,
            operation: "retrieve",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonResponse = await response.json();
      setNoSubmissionReason(jsonResponse.data);
    } catch (err) {
      console.error("Failed to fetch recruiters:", err);
      setError("Failed to load recruiter data.");
    } finally {
      setIsLoading(false);
      setReasonLoading(false);
    }
  };

  const visibleHistoricalReason = showAllHistorical ? noSubmissionReason : noSubmissionReason.slice(0, 3);

  // --- SUBMIT REASON HANDLER ---
  const handleReasonSubmit = async () => {
    if (!reasonInput.trim() || !selectedZeroCandidate) return;

    setIsSubmittingReason(true);
    setReasonLoader(true);
    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailid: storedUser.email,
            email: selectedZeroCandidate.primary_email,
            operation: "insert",
            no_submission_reason: reasonInput,
          }),
        },
      );

      if (!response.ok) throw new Error("Submission failed");

      // Clear input on success
      setReasonInput("");

      // Refresh the analysis to show the new reason in history
      await handleZeroCandidateClick(selectedZeroCandidate);
    } catch (error) {
      console.error("Reason Submission Error:", error);
    } finally {
      setIsSubmittingReason(false);
      setReasonLoader(false);
    }
  };

  // --- NEW: FETCH EMAIL POPUP FUNCTION ---
  const viewEmailPopup = async (submissionId) => {
    if (!submissionId) {
      console.warn("No ID provided for email fetch");
      return;
    }

    setIsEmailModalOpen(true);
    setIsFetchingEmail(true);
    setEmailContent(null);

    try {
      const response = await fetch("https://fetch-candidate-analysis-v3-305451280005.us-east1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailid: storedUser.email,
          task: "get_email_content",
          submission_id: submissionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch email");

      const result = await response.json();
      setEmailContent(result);
    } catch (error) {
      console.error("Error fetching email:", error);
    } finally {
      setIsFetchingEmail(false);
    }
  };

  // --- FILTER & SEARCH LOGIC ---
  const getFilteredData = (dataset) => {
    return dataset.filter((item) => {
      // 1. Status Filter
      const matchesStatus = activeFilter
        ? (item.submission_status || "").toLowerCase() === activeFilter.toLowerCase()
        : true;

      // 2. Search Filter (Candidate Name)
      const name = item.candidate_full_name || item.first_name + " " + item.last_name || "";
      const matchesSearch = searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true;

      return matchesStatus && matchesSearch;
    });
  };

  const filteredSubmissions = getFilteredData(rateConfirmations);
  const filteredInterviews = getFilteredData(interviewData);
  const getSubmissionTime = (item) => new Date(item?.submission_date || 0).getTime() || 0;

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => getSubmissionTime(b) - getSubmissionTime(a));
  const sortedInterviews = [...filteredInterviews].sort((a, b) => getSubmissionTime(b) - getSubmissionTime(a));

  // --- ADD THIS LOGIC ---
  // 1. Calculate Total Pages
  const totalSubmissionPages = Math.ceil(sortedSubmissions.length / ITEMS_PER_PAGE_SUBMISSIONS) || 1;
  const totalInterviewPages = Math.ceil(sortedInterviews.length / ITEMS_PER_PAGE_SUBMISSIONS) || 1;

  // 2. Slice Data for Current Page
  const currentPaginatedSubmissions = sortedSubmissions.slice(
    (submissionsPage - 1) * ITEMS_PER_PAGE_SUBMISSIONS,
    submissionsPage * ITEMS_PER_PAGE_SUBMISSIONS,
  );

  const currentPaginatedInterviews = sortedInterviews.slice(
    (interviewsPage - 1) * ITEMS_PER_PAGE_SUBMISSIONS,
    interviewsPage * ITEMS_PER_PAGE_SUBMISSIONS,
  );

  const overviewSortedSubmissionData = [...(submissionData || [])].sort((a, b) => {
    const aTime = new Date(a?.submission_date || 0).getTime() || 0;
    const bTime = new Date(b?.submission_date || 0).getTime() || 0;
    return bTime - aTime;
  });

  const totalPages = Math.ceil((overviewSortedSubmissionData.length || 0) / ITEMS_PER_PAGE);

  const currentCandidates =
    overviewSortedSubmissionData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) || [];

  // Collapsible State for AI Analysis
  const [openSections, setOpenSections] = useState({
    recentSubmissions: false,
    excuseAnalysis: false,
    history: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen || !selectedRecruiter) return null;

  // --- NEW FUNCTION: Handle AI Analysis Click ---
  const handleAnalyzeCandidate = async (candidate) => {
    // Toggle off if clicking same candidate
    if (expandedAnalysisId === candidate.id) {
      setExpandedAnalysisId(null);
      return;
    }
    setExpandedAnalysisId(candidate.id);
    if (storedAssignedData !== null && candidate.id === storedAssignedData.id) {
      setAnalysisData(storedAssignedData.resultData);
      return;
    }
    setExpandedCandidateId(null); // Close the "No Submission" view
    setIsAnalyzing(true);
    setAnalysisData(null); // Clear previous data
    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailid: storedUser.email,
            email: candidate.primary_email,
            operation: "analyze",
          }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");
      const result = await response.json();
      setAnalysisData(result);
      setStoredAssignedData({ id: candidate.id, resultData: result });
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const formatDateNumber = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      timeZone: "UTC", // <--- Forces the date to stay on March 10
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      timeZone: "UTC", // <--- Add this to prevent timezone shifting
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- API CALL FOR RECRUITER ANALYSIS ---
  const handleAnalyzeRecruiterPerformance = async () => {
    setIsRecruiterAnalyzing(true);
    setRecruiterAnalysisData(null); // Reset previous data

    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailid: storedUser.email,
            operation: "recruiter_analysis",
            recruiter_email: selectedRecruiter.email,
            days_back: parseInt(analysisPeriod),
          }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");
      const result = await response.json();
      if (result.status === "success" && result.analysis_period?.days) {
        setRecruiterAnalysisData(result);
      } else {
        setRecruiterAnalysisFailed(true);
      }
    } catch (error) {
      console.error("Recruiter Analysis Error:", error);
    } finally {
      setIsRecruiterAnalyzing(false);
    }
  };

  // Helper colors for Pie Chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF8042"];

  const clearFilters = () => {
    setActiveFilter(null);
    setSearchQuery("");
  };

  const isAnalyzingThisSubmission = expandedAnalysisId === selectedZeroCandidate?.id;

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex justify-end bg-black/50 transition-opacity recruiterAnalysisMainSheet ${selectedRecruiter !== null ? "sheetOPen" : ""}`}
        aria-modal="true"
        role="dialog"
      >
        {/* Sheet Content */}
        <div className="h-full w-[70vw] max-w-[70vw] bg-background shadow-xl border-l flex flex-col bg-white animate-in slide-in-from-right duration-300">
          {/* CONDITIONAL CONTENT: Loader VS Tabs */}
          {isLoading ? (
            <>
              {/* Header */}
              <div className="p-6 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="h-10 w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                      <ChartColumn className="h-5 w-5 text-[#1e3a5f]" />
                    </div>
                    {data.name}
                  </h2>
                  <button onClick={onClose} className="pdfcontrollButtonsPDF">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>
                <div className="space-y-4" style={{ marginBottom: "1.25rem" }}>
                  {/* API Status Banner */}
                  <div
                    className="flex items-center justify-between !gap-3 !px-4 !py-3 border bg-blue-50 border-blue-200"
                    style={{ borderRadius: "0.7rem" }}
                  >
                    <div className="flex items-center !gap-3">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm font-medium text-blue-800">Loading recruiter analysis...</span>
                    </div>
                  </div>
                </div>
                {/* SKELETON LOADER CONTENT */}
                <div className="p-0 pt-0 space-y-4 flex-1 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white">
                      <div className="p-6 pt-6">
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-8 w-20 mb-2"></div>
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-4 w-32"></div>
                      </div>
                    </div>
                    {/* Card 2 */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white">
                      <div className="p-6 pt-6">
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-8 w-20 mb-2"></div>
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-4 w-32"></div>
                      </div>
                    </div>
                    {/* Card 3 */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white">
                      <div className="p-6 pt-6">
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-8 w-20 mb-2"></div>
                        <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-4 w-32"></div>
                      </div>
                    </div>
                  </div>
                  {/* Large Skeleton Block */}
                  <div className="animate-[pulseOpacity_2s_infinite] rounded-xl bg-[#f1f1f9] h-64 w-full mt-4"></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="h-10 w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                      <ChartColumn className="h-5 w-5 text-[#1e3a5f]" />
                    </div>
                    {data.name}
                  </h2>
                  <button onClick={onClose} className="pdfcontrollButtonsPDF">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>

                {/* Top Info Card */}
                <div
                  className="rounded-xl bg-card text-card-foreground mb-2 shadow-sm bg-gradient-to-br from-[#1e3a5f]/5 to-[#2d4a6f]/5"
                  style={{ border: "1px solid #cbd0d8" }}
                >
                  <div className="p-4 pt-3 pb-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-[#67677e] text-sm">Email</p>
                      <p
                        className="font-medium truncate text-gray-900 m-0"
                        style={{ height: "20px", lineHeight: "20px" }}
                      >
                        {data.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[#67677e] text-sm">Team</p>
                      <p className="font-medium text-gray-900 m-0" style={{ height: "20px", lineHeight: "20px" }}>
                        {data.team}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[#67677e] text-sm">Manager</p>
                      <p
                        className="font-medium text-gray-900 capitalize m-0"
                        style={{ height: "20px", lineHeight: "20px" }}
                      >
                        {data.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[#67677e] text-sm mb-0">Status</p>
                      <span
                        className={`m-0 inline-flex items-center !rounded-full border-2 border-solid !px-2.5 !py-0.5 !text-xs !font-semibold ${data.status === "Active" ? "!bg-green-100 !text-green-800 !border-green-200" : "!bg-gray-100 !text-gray-800 !border-gray-200"}`}
                        style={{ height: "21px" }}
                      >
                        {data.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tabs List */}
              <div className="px-6 flex-shrink-0">
                {userPermissions.toLowerCase() === "view" || userPermissions === "edit" ? (
                  <>
                    <div className="grid w-full grid-cols-4 h-10 items-center justify-center !rounded-lg bg-[#f1f1f9] p-1 text-gray-500">
                      {["Overview", "AI Analysis", "Zero Sub (2)", "Submissions"].map((tab) => {
                        const tabKey = tab.split(" ")[0].toLowerCase();
                        const isActive = activeTab === tabKey || (tabKey === "ai" && activeTab === "ai analysis");
                        return (
                          <button
                            key={tab}
                            onClick={() =>
                              setActiveTab(
                                tab.toLowerCase() === "ai analysis" ? "ai analysis" : tab.toLowerCase().split(" ")[0],
                              )
                            }
                            className={`inline-flex items-center justify-center whitespace-nowrap !rounded-lg px-3 py-1.5 text-sm font-medium bg-[#f1f1f9] transition-all focus-visible:outline-none ${
                              isActive ? "bg-white text-[#080118] shadow-sm" : "hover:bg-[#f1f1f9]"
                            }`}
                          >
                            {tab === "AI Analysis" && <Brain className="h-3 w-3 mr-1" />}
                            {tab === "Zero Sub (2)" ? "Zero Sub " : tab}{" "}
                            {tab === "Zero Sub (2)" && `(${zeroSubmissions.length})`}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid w-full grid-cols-3 h-10 items-center justify-center rounded-lg bg-[#f1f1f9] p-1 text-gray-500">
                      {["Overview", "Zero Sub (2)", "Submissions"].map((tab) => {
                        const tabKey = tab.split(" ")[0].toLowerCase();
                        const isActive = activeTab === tabKey || (tabKey === "ai" && activeTab === "ai analysis");
                        return (
                          <button
                            key={tab}
                            onClick={() =>
                              setActiveTab(
                                tab.toLowerCase() === "ai analysis" ? "ai analysis" : tab.toLowerCase().split(" ")[0],
                              )
                            }
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium bg-[#f1f1f9] transition-all focus-visible:outline-none ${
                              isActive ? "bg-white text-[#080118] shadow-sm" : "hover:bg-[#f1f1f9]"
                            }`}
                          >
                            {tab === "AI Analysis" && <Brain className="h-3 w-3 mr-1" />}
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Scrollable Content Area */}
              <div
                className="flex-1 overflow-y-auto p-6 pt-3
              [&::-webkit-scrollbar]:w-1
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-slate-200
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors
              "
              >
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 !gap-4">
                      <div className="rounded-xl border bg-white shadow-sm p-4 pt-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {submarisedData?.submissions_by_type_summary ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-0">Total Submissions</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-white shadow-sm p-4 pt-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {submarisedData?.total_interview_tech_screenings ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-0">Interviews</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-white shadow-sm p-4 pt-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {submarisedData?.total_submissions_last_24_hours ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-0">7-Day Submissions</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-white shadow-sm p-4 pt-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {submarisedData?.total_assigned_candidates ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-0">Assigned</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Assigned Candidates List */}
                    {totalAssignedCandidates.length > 0 ? (
                      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3">
                          <h3 className="tracking-tight text-base font-semibold flex items-center gap-2 color-[#080118]">
                            <UserCheck className="h-4 w-4 text-amber-600" />
                            Assigned Candidates ({totalAssignedCandidates.length})
                          </h3>
                        </div>

                        <div className="p-0">
                          <div className="divide-y">
                            {totalAssignedCandidates.map((candidate) => {
                              const isExpanded = expandedCandidateId === candidate.id;
                              const isAnalyzingThis = expandedAnalysisId === candidate.id;

                              return (
                                <div key={candidate.id} className="relative">
                                  {(() => {
                                    // Check if candidate has a recent submission (today or within 24 hours)
                                    const hasRecentSubmission = currentCandidates.some((submission) => {
                                      // Match by email
                                      if (submission.primary_email !== candidate.primary_email) return false;

                                      // Check submission date
                                      if (!submission.submission_date) return false;

                                      const submissionDate = new Date(submission.submission_date);
                                      const now = new Date();
                                      const hoursDiff = (now - submissionDate) / (1000 * 60 * 60);

                                      // Return true if submission is within last 24 hours
                                      return hoursDiff <= 24;
                                    });

                                    // Red bar if NO recent submission, Green bar if has recent submission
                                    return hasRecentSubmission ? (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                    ) : (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                    );
                                  })()}

                                  <div
                                    className="absolute left-0 bottom-0 w-full bg-[#e7e7ef]"
                                    style={{ height: "1px" }}
                                  ></div>

                                  <div
                                    className="p-[12px_16px_12px_20px] border-b border-b-[#e7e7ef]"
                                    style={{ border: "1px solid #e7e7ef !important" }}
                                  >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      {/* Candidate Info */}
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted bg-gray-100 flex items-center justify-center">
                                          <User className="h-4 w-4 text-muted-foreground text-gray-500 ml-0" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm text-[#080118] capitalize">
                                            {candidate.first_name} {candidate.last_name}
                                          </p>
                                          <p className="text-xs !text-[#67677e] text-muted-foreground text-gray-500 truncate max-w-[330px] mt-0 ml-0">
                                            {candidate.primary_email}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Badges and Actions */}
                                      <div className="flex items-center gap-2">
                                        {candidate.visa_status && (
                                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                            {candidate.visa_status}
                                          </span>
                                        )}
                                        {candidate?.primary_technology && (
                                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold border-transparent bg-[#f3f3fc] text-secondary-foreground text-[#080118] text-xs">
                                            {candidate?.primary_technology}
                                          </span>
                                        )}
                                        {storedAssignedData !== null && candidate.id == storedAssignedData.id ? (
                                          <>
                                            <button
                                              onClick={() => {
                                                handleAnalyzeCandidate(candidate);
                                              }}
                                              disabled={isAnalyzingThis && isAnalyzing}
                                              className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none border border-input bg-[#ffffff] rounded-xl h-7 px-2 gap-1.5 text-[#080118] ${isAnalyzingThis && isAnalyzing ? "hover:bg-gray-100" : isAnalyzingThis ? "!bg-[#5f15e0] text-white hover:!bg-[#3d069d]" : "bg-[#5f15e0] text-white hover:bg-[#3d069d]"}`}
                                            >
                                              <Brain className="h-3 w-3" />
                                              {isAnalyzingThis ? "Hide Analysis" : "Show Analysis"}
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            {user?.user_role == "admin" ||
                                              (user?.user_role == "super admin" && (
                                                <>
                                                  {/* AI Analyze Button */}
                                                  <button
                                                    onClick={() => handleAnalyzeCandidate(candidate)}
                                                    disabled={isAnalyzingThis && isAnalyzing}
                                                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none border border-input bg-[#ffffff] rounded-xl h-7 px-2 gap-1.5 text-[#080118] ${isAnalyzingThis && isAnalyzing ? "hover:bg-gray-100" : isAnalyzingThis ? "bg-purple-600 text-white hover:bg-purple-700" : "hover:bg-gray-100 hover:text-white hover:bg-[#3c83f6]"}`}
                                                  >
                                                    {isAnalyzingThis && isAnalyzing ? (
                                                      <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      <>
                                                        {isAnalyzingThis ? (
                                                          <>
                                                            <Brain className="h-3 w-3" />
                                                          </>
                                                        ) : (
                                                          <>
                                                            <Sparkles className="h-4 w-4" />
                                                          </>
                                                        )}
                                                      </>
                                                    )}
                                                    {isAnalyzingThis && isAnalyzing
                                                      ? "Analyzing"
                                                      : isAnalyzingThis
                                                        ? "Hide Analysis"
                                                        : "AI Analyze"}
                                                    {console.log("analysing", isAnalyzingThis)}
                                                  </button>
                                                </>
                                              ))}
                                          </>
                                        )}

                                        {/* {candidate.first_name.find(zeroSubmissions) && (<>
                                              <button
                                                onClick={() => {
                                                  toggleCandidate(candidate.id);
                                                  if (!isExpanded) fetchNoSubbmissionReason(candidate.primary_email);
                                                }}
                                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background bg-[#f000] transition-colors focus-visible:outline-none rounded-xl h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 ${isExpanded ? "bg-red-50" : ""}`}
                                              >
                                                <TriangleAlert className="h-3 w-3 mr-1" />
                                                No Submissions
                                                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                              </button>
                                            </>)} */}
                                        {/* Check if this candidate exists in the zeroSubmissions array */}
                                        {console.log(
                                          "logicaltrace",
                                          currentCandidates.some(
                                            (zero) => zero.primary_email == candidate.primary_email,
                                          ),
                                        )}
                                        {(() => {
                                          // Check if candidate has a recent submission (today or within 24 hours)
                                          const hasRecentSubmission = currentCandidates.some((submission) => {
                                            // Match by email
                                            const emailMatches = submission.primary_email === candidate.primary_email;

                                            // Check if submission is from today or within last 24 hours
                                            if (emailMatches && submission.submission_date) {
                                              const submissionDate = new Date(submission.submission_date);
                                              const now = new Date();
                                              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                              const diffHours = (now - submissionDate) / (1000 * 60 * 60);

                                              // Return true if submission is from today OR within last 24 hours
                                              return submissionDate >= today || diffHours <= 24;
                                            }

                                            return false;
                                          });

                                          // Show button if NO recent submission found
                                          return (
                                            !hasRecentSubmission && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleCandidate(candidate.id);
                                                  if (!isExpanded) fetchNoSubbmissionReason(candidate.primary_email);
                                                }}
                                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background bg-[#f000] transition-colors focus-visible:outline-none rounded-xl h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 ${isExpanded ? "bg-red-50" : ""}`}
                                              >
                                                <TriangleAlert className="h-3 w-3 mr-1" />
                                                No Submissions
                                                <ChevronDown
                                                  className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                />
                                              </button>
                                            )
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Collapsible Content: No Submissions History */}
                                  {isExpanded && (
                                    <div className="px-4 pb-3 pl-5 bg-red-50/50">
                                      <div className="!border-l-2 !border-t-0 !border-r-0 !border-b-0 !border-solid !border-red-200 pl-3 py-2">
                                        <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                                          <History className="h-3 w-3" /> Historical Reasons
                                        </p>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                          {reasonLoading ? (
                                            <>
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Loader2 className="lucide lucide-loader-circle h-3 w-3 animate-spin" />
                                                Loading...
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              {noSubmissionReason && noSubmissionReason.length > 0 ? (
                                                <>
                                                  {visibleHistoricalReason.map((hist, index) => (
                                                    <div
                                                      key={index}
                                                      className="bg-white rounded px-2 py-1.5 text-xs border border-gray-100 shadow-sm"
                                                    >
                                                      <span className="text-muted-foreground text-gray-500">
                                                        {formatDateNumber(hist.created_at)}:{" "}
                                                      </span>
                                                      <span>{hist.no_submission_reason}</span>
                                                    </div>
                                                  ))}
                                                  <p
                                                    className="text-xs text-muted-foreground cursor-pointer"
                                                    onClick={() => setShowAllHistorical(!showAllHistorical)}
                                                  >
                                                    {showAllHistorical && "Hide"} {noSubmissionReason.length - 3}{" "}
                                                    {!showAllHistorical && "more"} reasons
                                                  </p>
                                                </>
                                              ) : (
                                                <div className="text-xs text-gray-500 italic px-2">
                                                  No history recorded.
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {isAnalyzingThis && analysisData && (
                                    <div className="px-4 pb-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-t animate-in slide-in-from-top-2 duration-200">
                                      {analysisData && analysisData?.analysis ? (
                                        <div className="pt-4 space-y-4">
                                          {/* Status & Summary Card */}
                                          <div className="rounded-xl bg-card text-card-foreground shadow-sm bg-white">
                                            <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b">
                                              <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-purple-600" />
                                                AI Recruiter Accountability Analysis -{" "}
                                                {analysisData.analysis.analysis_metadata.candidate_name}
                                              </h3>
                                            </div>

                                            <div className="p-6 pt-0 space-y-4">
                                              {/* Analysis Status */}
                                              <div
                                                className={`rounded-xl p-4 !border-solid !border-l-4 border-r-0 border-t-0 border-b-0 ${analysisData.analysis.candidate_specific_analysis.submission_status !== "active" ? "!bg-red-50 !border-red-500" : "!bg-green-50 !border-green-500"}`}
                                              >
                                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                                    <Target className="h-4 w-4" /> Analysis for{" "}
                                                    {analysisData.analysis.analysis_metadata.candidate_name}
                                                  </h4>
                                                  {/* {console.log("main analysis",analysisData.analysis)} */}
                                                  <div className="flex gap-2 flex-wrap">
                                                    {analysisData.analysis.candidate_specific_analysis
                                                      .submission_status == "active" ? (
                                                      <>
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-600 text-white capitalize">
                                                          <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                                          {analysisData.analysis.candidate_specific_analysis.submission_status.replace(
                                                            "_",
                                                            " ",
                                                          )}
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors capitalize focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-red-600 text-white">
                                                          <UserX className="h-3 w-3 mr-1" />{" "}
                                                          {analysisData.analysis.candidate_specific_analysis.submission_status.replace(
                                                            "_",
                                                            " ",
                                                          )}
                                                        </div>
                                                      </>
                                                    )}
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs capitalize font-semibold ${analysisData.analysis.candidate_specific_analysis.submission_status !== "active" ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                                                    >
                                                      {
                                                        analysisData.analysis.candidate_specific_analysis
                                                          .recruiter_effort_for_this_candidate
                                                      }
                                                    </span>
                                                    {/* <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-transparent">
                                                      <Clock className="h-3 w-3 mr-1" /> {analysisData.analysis.analysis_metadata.days_since_last_submission} days without submission
                                                    </span> */}
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                  Status:{" "}
                                                  {analysisData.analysis.candidate_specific_analysis.submission_status.replace(
                                                    "_",
                                                    " ",
                                                  )}
                                                </p>
                                              </div>

                                              {/* Submission Summary Grid */}
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-900">
                                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                                  Submission Summary for{" "}
                                                  {analysisData.analysis.analysis_metadata.candidate_name}
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                  <div className="bg-white rounded-lg p-3 text-center border">
                                                    <span className="text-2xl font-bold text-blue-600 block">
                                                      {
                                                        analysisData.analysis.analysis_metadata
                                                          .total_submissions_by_recruiter
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">By Recruiter</span>
                                                  </div>
                                                  <div className="bg-white rounded-lg p-3 text-center border">
                                                    <span className="text-2xl font-bold text-purple-600 block">
                                                      {analysisData.submission_summary.total_submissions_all_recruiters}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      All Recruiters
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-lg p-3 text-center border">
                                                    <span className="text-2xl font-bold text-green-600 block">
                                                      {analysisData.submission_summary.interviews_secured}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">Interviews</span>
                                                  </div>
                                                  <div className="bg-white rounded-lg p-3 text-center border">
                                                    <span
                                                      className={`text-2xl font-bold block ${analysisData.analysis.analysis_metadata.days_since_last_submission < 3 ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                      {
                                                        analysisData.analysis.analysis_metadata
                                                          .days_since_last_submission
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      Days Since Last
                                                    </span>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                  <Calendar className="h-3 w-3" /> Last submission:{" "}
                                                  {formatDate(analysisData.submission_summary.last_submission_date)}
                                                </p>
                                              </div>

                                              {/* Collapsible Recent Submissions */}
                                              <div className=" rounded-xl overflow-hidden bg-white">
                                                <button
                                                  onClick={() => toggleSection("recentSubmissionsInner")}
                                                  className="w-full flex items-center justify-between bg-blue-50 px-3 py-3 hover:bg-blue-100 transition-colors rounded-xl text-left border border-blue-200 mb-2"
                                                >
                                                  <span className="text-sm font-medium flex items-center gap-2 text-[#1e40af]">
                                                    📋 Recent Submissions (
                                                    {analysisData.recent_submissions?.length || 0})
                                                  </span>
                                                  <ChevronDown
                                                    className={`h-4 w-4 !text-blue-600 transition-transform ${
                                                      openSections.recentSubmissionsInner ? "rotate-180" : ""
                                                    }`}
                                                  />
                                                </button>

                                                {openSections.recentSubmissionsInner && (
                                                  <div className="bg-white rounded-xl border-solid border-[#e7e7ee] border-t-[0.5px] border-l-[0.5px] border-b-[0.5px] border-r-[0.5px]">
                                                    {/* Table Header */}
                                                    <div className=" grid grid-cols-4 px-4 py-3 text-xs font-medium text-[#67677e] bg-[#f1f1f980] border-solid border-[#e7e7ee] border-t-[0px] border-l-[0px] border-b-[0.8px] border-r-[0px]">
                                                      <div>Date</div>
                                                      <div>Client</div>
                                                      <div>Status</div>
                                                      <div className="text-right">Rate</div>
                                                    </div>

                                                    {/* Rows */}
                                                    {analysisData.recent_submissions?.map((sub, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="grid grid-cols-4 px-4 py-2 text-xs border-b last:border-0 items-center hover:bg-gray-50 border-solid border-[#e7e7ee] border-t-[0px] border-l-[0px] border-b-[0.8px] border-r-[0px]"
                                                      >
                                                        <div className="text-gray-900">
                                                          {formatDate(sub.submission_date)}
                                                        </div>

                                                        <div className="text-gray-900 font-normal">
                                                          {sub.client_name}
                                                        </div>

                                                        <div>
                                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-gray-900  text-xs font-semibold border border-indigo-200 bg-white capitalize">
                                                            {sub.submission_status}
                                                          </span>
                                                        </div>

                                                        <div className="text-right text-gray-900 font-medium">
                                                          {sub.rate}
                                                        </div>
                                                      </div>
                                                    ))}

                                                    {(!analysisData.recent_submissions ||
                                                      analysisData.recent_submissions.length === 0) && (
                                                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                                                        No recent submissions found.
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Overall Assessment */}
                                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                                                  <Target className="h-4 w-4" /> Overall Assessment
                                                </h4>
                                                <p className="text-sm text-blue-800">
                                                  {analysisData.analysis.overall_assessment}
                                                </p>
                                              </div>

                                              {/* Scores Grid */}
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">
                                                    Performance Score
                                                  </p>
                                                  <div className="flex items-center gap-2">
                                                    <span
                                                      className={`text-2xl font-bold  ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "text-yellow-600" : "text-red-600"}`}
                                                    >
                                                      {analysisData.analysis.recruiter_accountability.performance_score}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">/10</span>
                                                  </div>
                                                  <div
                                                    className={`relative w-full overflow-hidden rounded-full h-1.5 mt-2 ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "bg-yellow-200" : "bg-red-500"}`}
                                                  >
                                                    <div
                                                      className={`h-full ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "bg-yellow-500" : "bg-[#7c3bed]"}`}
                                                      style={{
                                                        width: `${analysisData.analysis.recruiter_accountability.performance_score * 10}%`,
                                                      }}
                                                    ></div>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Accountability</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${analysisData.analysis.recruiter_accountability.accountability_level == "high" ? "bg-green-100 text-green-800 border-green-200" : analysisData.analysis.recruiter_accountability.accountability_level == "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}
                                                    >
                                                      {
                                                        analysisData.analysis.recruiter_accountability
                                                          .accountability_level
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Effort Level</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold  !capitalize ${analysisData.analysis.recruiter_accountability.effort_level == "insufficient" ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {analysisData.analysis.recruiter_accountability.effort_level}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Blame Shifting</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold !capitalize ${analysisData.analysis.recruiter_accountability.blame_shifting_detected ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {!analysisData.analysis.recruiter_accountability
                                                        .blame_shifting_detected ? (
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                      ) : (
                                                        <TriangleAlert className="h-3 w-3 mr-1" />
                                                      )}
                                                      {analysisData.analysis.recruiter_accountability
                                                        .blame_shifting_detected
                                                        ? "Detected"
                                                        : "Not Detected"}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Responsibility Analysis */}
                                              <div className="bg-muted/20 bg-gray-50 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                                  <BarChart3 className="h-4 w-4 text-purple-500" /> Responsibility
                                                  Analysis
                                                </h4>
                                                <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                                                  <div
                                                    className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                                                    style={{
                                                      width: `${analysisData.analysis.candidate_vs_recruiter_responsibility.recruiter_responsibility_percent}%`,
                                                    }}
                                                  >
                                                    Recruiter:{" "}
                                                    {
                                                      analysisData.analysis.candidate_vs_recruiter_responsibility
                                                        .recruiter_responsibility_percent
                                                    }
                                                    %
                                                  </div>
                                                  <div
                                                    className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium"
                                                    style={{
                                                      width: `${analysisData.analysis.candidate_vs_recruiter_responsibility.candidate_responsibility_percent}%`,
                                                    }}
                                                  >
                                                    Candidate:{" "}
                                                    {
                                                      analysisData.analysis.candidate_vs_recruiter_responsibility
                                                        .candidate_responsibility_percent
                                                    }
                                                    %
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  {
                                                    analysisData.analysis.candidate_vs_recruiter_responsibility
                                                      .explanation
                                                  }
                                                </p>
                                              </div>

                                              {/* Action Plan */}
                                              <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-4">
                                                <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                                                  <ListChecks className="h-4 w-4" /> Action Plan for{" "}
                                                  {analysisData.analysis.analysis_metadata.candidate_name}
                                                </h4>

                                                {analysisData.analysis.action_plan_for_candidate.immediate_actions
                                                  .length > 0 && (
                                                  <div className="mb-3">
                                                    <h5 className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1.5">
                                                      🔴 Immediate Actions (TODAY)
                                                    </h5>
                                                    <ul className="space-y-1 pl-0">
                                                      {analysisData.analysis.action_plan_for_candidate.immediate_actions.map(
                                                        (action, i) => (
                                                          <li
                                                            key={i}
                                                            className="text-xs text-emerald-700 flex items-start gap-2"
                                                          >
                                                            <input
                                                              type="checkbox"
                                                              className="mt-0.5 h-3 w-3 rounded border-emerald-300"
                                                            />
                                                            <label>{action}</label>
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                                {analysisData.analysis.action_plan_for_candidate.weekly_targets.length >
                                                  0 && (
                                                  <div className="mb-3">
                                                    <h5 className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1.5">
                                                      📅 Weekly Targets
                                                    </h5>
                                                    <ul className="space-y-1 pl-0">
                                                      {analysisData.analysis.action_plan_for_candidate.weekly_targets.map(
                                                        (target, i) => (
                                                          <li
                                                            key={i}
                                                            className="text-xs text-emerald-700 flex items-start gap-2"
                                                          >
                                                            <span className="text-blue-500">•</span> {target}
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                                <div className="bg-white/50 rounded-xl p-2">
                                                  <h5 className="text-xs font-semibold text-purple-700 flex items-center gap-1 mb-1">
                                                    <RefreshCw className="h-3 w-3" /> Follow-up Schedule
                                                  </h5>
                                                  <p className="text-xs text-emerald-700">
                                                    {analysisData.analysis.action_plan_for_candidate.follow_up_schedule}
                                                  </p>
                                                </div>
                                              </div>
                                              {analysisData.analysis.management_recommendations.reassign_candidate && (
                                                <>
                                                  {/* Direct Feedback */}
                                                  <div className="!bg-orange-50 rounded-xl p-[16px] pt-[12px]  border !border-orange-200 !border-l-4 !border-l-orange-400">
                                                    <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2 mb-2">
                                                      <RefreshCw className="h-4 w-4" /> Reassignment Recommended
                                                    </h4>
                                                    <p className="text-sm text-orange-800">
                                                      {analysisData.analysis.analysis_metadata.candidate_name}should be
                                                      reassigned to another recruiter for better results.
                                                    </p>
                                                  </div>
                                                </>
                                              )}

                                              {/* Direct Feedback */}
                                              <div className="!bg-amber-50 rounded-xl p-[16px] pt-[12px] pb-[12px]   border !border-amber-200 !border-l-4 !border-l-amber-400">
                                                <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-2">
                                                  <MessageSquareWarning className="h-4 w-4" /> Direct Feedback to
                                                  Recruiter
                                                </h4>
                                                <p className="text-sm text-amber-800">
                                                  {analysisData.analysis.direct_feedback_to_recruiter}
                                                </p>
                                              </div>

                                              {/* Critical Questions */}
                                              <div className="border border-purple-200 bg-purple-50 rounded-xl p-[16px] pb-1">
                                                <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-2">
                                                  <HelpCircle className="h-4 w-4" /> Critical Questions for Recruiter
                                                </h4>
                                                <ul className="space-y-1.5 pl-0">
                                                  {analysisData.analysis.critical_questions_for_recruiter.map(
                                                    (q, i) => (
                                                      <li
                                                        key={i}
                                                        className="text-xs text-purple-700 flex items-start gap-2"
                                                      >
                                                        <span className="bg-purple-200 text-purple-800 rounded-full h-4 w-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                                          {i + 1}
                                                        </span>
                                                        {q}
                                                      </li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>

                                              {/* Gaps & Concerns Grid */}
                                              <div className="bg-muted/20 bg-gray-50 rounded-xl p-[16px]">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                                  <AlertCircle className="h-4 w-4 text-orange-500" /> Gaps & Concerns
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="text-2xl font-bold text-orange-600 block">
                                                      {
                                                        analysisData.analysis.gaps_and_concerns
                                                          .submission_gaps_over_2_days
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      Gaps Over 2 Days
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="text-2xl font-bold text-amber-600 block">
                                                      {analysisData.analysis.gaps_and_concerns.vague_excuses_count}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">Vague Excuses</span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span
                                                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold  mb-1 ${analysisData.analysis.gaps_and_concerns.repeated_same_excuse ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {analysisData.analysis.gaps_and_concerns.repeated_same_excuse
                                                        ? "Yes"
                                                        : "No"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground block">
                                                      Repeated Same Excuse
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span
                                                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold mb-1 ${analysisData.analysis.gaps_and_concerns.lack_of_follow_up_evidence ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {analysisData.analysis.gaps_and_concerns
                                                        .lack_of_follow_up_evidence
                                                        ? "Yes"
                                                        : "No"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground block">
                                                      Lack of Follow-up
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Red Flags */}
                                              {analysisData.analysis.red_flags_about_recruiter.length > 0 && (
                                                <div className="border  bg-red-50 !border-l-red-500 rounded-xl p-[12px] pb-1 !border !border-l-4 !border-t-[0.6px] !border-r-[0.6px] !border-b-[0.6px]">
                                                  <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                                                    <Flag className="h-4 w-4" /> Red Flags
                                                  </h4>
                                                  <ul className="space-y-1 pl-0">
                                                    {analysisData.analysis.red_flags_about_recruiter.map((flag, i) => (
                                                      <li
                                                        key={i}
                                                        className="text-xs text-red-700 flex items-start gap-1.5"
                                                      >
                                                        <XCircle className="h-3 w-3 mt-0.5" /> {flag}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}

                                              {/* Required Improvements */}
                                              <div className="border border-blue-200 bg-blue-50 rounded-xl p-[12px] ">
                                                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                                  <ClipboardList className="h-4 w-4" /> Required Improvements
                                                </h4>
                                                <ul className="space-y-1.5 pl-0">
                                                  {analysisData.analysis.improvement_demands.map((imp, i) => (
                                                    <li
                                                      key={i}
                                                      className="text-xs text-blue-700 flex items-start gap-2"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        className="mt-0.5 h-3 w-3 rounded border-blue-300"
                                                      />
                                                      <label>{imp}</label>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>

                                              {/* Management Recommendations */}
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                                                  <UserCog className="h-4 w-4" /> Management Recommendations
                                                </h4>
                                                <p className="text-sm text-slate-700 mb-3">
                                                  <strong>Immediate Action:</strong>{" "}
                                                  {analysisData.analysis.management_recommendations.immediate_action}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                  {analysisData.analysis.management_recommendations
                                                    .performance_review_needed && (
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 border-orange-200">
                                                      <Clock className="h-3 w-3 mr-1" /> Performance Review Needed
                                                    </span>
                                                  )}
                                                  {analysisData.analysis.management_recommendations
                                                    .additional_training_needed && (
                                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
                                                      Training Needed
                                                    </div>
                                                  )}
                                                  {analysisData.analysis.management_recommendations
                                                    .escalation_required && (
                                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
                                                      Escalation Required
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              {(analysisData.analysis.excuse_analysis.legitimate_reasons.length > 0 ||
                                                analysisData.analysis.excuse_analysis.questionable_excuses.length > 0 ||
                                                analysisData.analysis.excuse_analysis.unacceptable_patterns.length >
                                                  0) && (
                                                <div className="w-full">
                                                  <button
                                                    type="button"
                                                    onClick={() => setExcuseCollapse(!excuseCollapse)}
                                                    className="w-full bg-transparent"
                                                    aria-expanded={excuseCollapse}
                                                  >
                                                    <div className="flex items-center justify-between !bg-[#fbfbfd] !rounded-xl !p-3 hover:!bg-[#fbfbfd]/50 !transition-colors">
                                                      <span className="text-sm !font-medium flex items-center !gap-2">
                                                        📝 Excuse Analysis Details
                                                      </span>
                                                      <ChevronDown
                                                        className={`h-4 w-4 transition-transform duration-200 ${
                                                          excuseCollapse ? "rotate-180" : ""
                                                        }`}
                                                      />
                                                    </div>
                                                  </button>

                                                  {excuseCollapse && (
                                                    <div className="mt-2 space-y-2">
                                                      {/* Legitimate Reasons Section */}
                                                      {analysisData.analysis.excuse_analysis.legitimate_reasons.length >
                                                        0 && (
                                                        <div className="bg-[#fefce8] border !border-[#fef08a] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold !text-yellow-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleHelp className="h-3 w-3" />
                                                            Legitimate Reasons
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.legitimate_reasons.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-yellow-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}

                                                      {/* Questionable Excuses Section */}
                                                      {analysisData.analysis.excuse_analysis.questionable_excuses
                                                        .length > 0 && (
                                                        <div className="bg-[#fefce8] border !border-[#fef08a] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold !text-yellow-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleHelp className="h-3 w-3" />
                                                            Questionable Excuses
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.questionable_excuses.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-yellow-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}

                                                      {/* Unacceptable Patterns Section */}
                                                      {analysisData.analysis.excuse_analysis.unacceptable_patterns
                                                        .length > 0 && (
                                                        <div className="bg-red-50 border border-[#fecaca] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold text-red-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleX className="h-3 w-3" />
                                                            Unacceptable Patterns
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.unacceptable_patterns.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-red-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {/* New Footer Component Added Below */}
                                              <div className="flex items-center justify-between text-xs text-[#b4b4b4] pt-2 border-t-[0.5px] !border-l-0 !border-r-0 !border-b-0 border-solid flex-wrap gap-2">
                                                <span className="text-[#67677e]">
                                                  Analyzed: {new Date().toLocaleString()}{" "}
                                                  {/* Or use a specific date from your metadata */}
                                                </span>
                                                <div className="flex gap-4 text-[#67677e]">
                                                  <span className="text-[#67677e]">
                                                    Submissions:{" "}
                                                    {analysisData.analysis.analysis_metadata
                                                      .total_submissions_by_recruiter || 0}
                                                  </span>
                                                  <span className="text-[#67677e]">
                                                    Days since last:{" "}
                                                    {analysisData.analysis.analysis_metadata
                                                      .days_since_last_submission || 0}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="py-8 text-center text-red-500 text-sm">
                                          Failed to load analysis.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="flex flex-col space-y-1.5 p-6 pb-3">
                            <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-user-check h-4 w-4 text-amber-600"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <polyline points="16 11 18 13 22 9"></polyline>
                              </svg>
                              Assigned Candidates (0)
                            </h3>
                          </div>
                          <div className="p-0">
                            <div className="text-center py-8 text-muted-foreground">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-users h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              <p className="text-[#67677c]">No assigned candidates</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {console.log("submissionData", submissionData)}
                    {submissionData?.length > 0 ? (
                      <>
                        {/* Candidates Table - FIXED WITH TAILWIND ! CLASSES */}
                        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                          <div className="px-6 pb-3 py-6 border-b border-gray-200">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 !m-0">
                              <Clock className="h-4 w-4 text-purple-600" />
                              Submissions in Last 7 Days ({submissionData.length})
                            </h3>
                          </div>
                          <div className="relative w-full overflow-x-auto">
                            <table className="!w-full !border-collapse !text-sm !text-left !m-0 !caption-bottom">
                              <thead className="[&_tr]:!border-b bg-[#f1f1f980]">
                                <tr className="!border-b !border-gray-200 ">
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 whitespace-nowrap !bg-transparent !border-0">
                                    Candidate
                                  </th>
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 whitespace-nowrap !bg-transparent !border-0">
                                    Vendor
                                  </th>
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 whitespace-nowrap !bg-transparent !border-0">
                                    Client
                                  </th>
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 whitespace-nowrap !bg-transparent !border-0">
                                    Rate
                                  </th>
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 whitespace-nowrap !bg-transparent !border-0">
                                    Date
                                  </th>
                                  <th className="!h-12 !px-4 !py-3 !align-middle !font-medium !text-gray-500 !text-right whitespace-nowrap !bg-transparent !border-0">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:!border-0">
                                {currentCandidates?.map((candidate) => (
                                  <tr
                                    key={candidate?.rate_confirmation_id}
                                    className="!border-b !border-gray-100 transition-colors hover:!bg-[#f1f1f980]"
                                  >
                                    <td className="!p-4 !align-middle !font-medium !text-gray-900 !border-0 !bg-transparent capitalize">
                                      {candidate?.first_name} {candidate?.last_name}
                                    </td>
                                    <td className="!p-4 !align-middle !text-[#67677e] truncate max-w-[150px] !border-0 !bg-transparent">
                                      {candidate?.vendor_name || "-"}
                                    </td>
                                    <td className="!p-4 !align-middle !text-gray-900 !border-0 !bg-transparent">
                                      {candidate?.client_name || "-"}
                                    </td>
                                    <td className="!p-4 !align-middle !border-0 !bg-transparent">
                                      <div className="flex items-center gap-1 !text-gray-900 !font-medium">
                                        {!candidate?.rate.includes("$") && (
                                          <>
                                            <DollarSign className="h-3 w-3 text-amber-600" />
                                          </>
                                        )}
                                        {candidate?.rate}
                                        {!candidate?.rate.includes("/hr") && "/hr"}
                                      </div>
                                    </td>
                                    <td className="!p-4 !align-middle !text-gray-900 !border-0 !bg-transparent">
                                      {formatDateNumber(candidate?.submission_date)}
                                    </td>
                                    <td className="!p-4 !align-middle !text-right !border-0 !bg-transparent">
                                      <button
                                        onClick={() => viewEmailPopup(candidate.rate_confirmation_id || candidate.id)} // <--- CHANGE THIS LINE
                                        className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:!bg-[#3c83f6] !bg-transparent !border-0 !p-0 !shadow-none"
                                      >
                                        <Eye className="h-4 w-4 text-[#7c3bed] hover:!text-white" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          <div className="flex items-center justify-between px-4 py-3 border-t">
                            <span className="text-sm text-muted-foreground ml-0">
                              Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-gray-200 bg-white hover:!bg-[#3c83f6] h-9 rounded-md hover:!text-white px-3 disabled:opacity-50 !text-gray-700"
                              >
                                <ChevronLeft className="h-4 w-4" /> Previous
                              </button>
                              <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-gray-200 bg-white hover:!bg-[#3c83f6] hover:!text-white h-9 rounded-md px-3 disabled:opacity-50 !text-gray-700"
                              >
                                Next <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="flex flex-col space-y-1.5 p-6 pb-3">
                            <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-clock h-4 w-4 text-purple-600"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              Submissions in Last 7 Days (0)
                            </h3>
                          </div>
                          <div className="p-0">
                            <div className="text-center py-8 text-muted-foreground">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-clock h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <p className="text-[#67677c]">No submissions in the last 7 days</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* --- OVERVIEW TAB CONTENT --- */}

                {/* --- AI ANALYSIS TAB CONTENT --- */}
                {activeTab === "ai analysis" && (
                  <div className="mt-4 flex-1 overflow-hidden h-full">
                    {/* VIEW 1: LOADING STATE */}
                    {isRecruiterAnalyzing && (
                      <>
                        <div
                          role="tabpanel"
                          aria-labelledby="radix-:rr:-trigger-performance"
                          id="radix-:rr:-content-performance"
                          tabIndex={0}
                          className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-4 flex-1 overflow-hidden"
                        >
                          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <div className="relative">
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
                                <Brain className="h-10 w-10 text-purple-600 animate-pulse animate-spin" />
                              </div>

                              <div
                                className="absolute inset-0 h-20 w-20 rounded-full animate-spin"
                                style={{
                                  border: "4px solid #e9d5ff",
                                  borderTopColor: "#9333ea",
                                }}
                              />
                            </div>

                            <h3 className="text-lg font-semibold mb-2">Analyzing Performance...</h3>

                            <p className="text-sm text-center text-muted-foreground max-w-md">
                              Our AI is reviewing {selectedRecruiter?.name}&apos;s submissions, interviews, and patterns
                              for the last {analysisPeriod} days
                            </p>

                            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />

                              <span>This may take a few seconds...</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* VIEW 2: INITIAL START STATE (Show if not loading and no data) */}
                    {!isRecruiterAnalyzing && !recruiterAnalysisData && (
                      <div className="flex flex-col items-center justify-start pt-5 py-12 text-gray-500 h-full">
                        <div className="h-16 w-16 mb-0 text-gray-400 rounded-full flex items-center justify-center">
                          <Brain className="lucide lucide-brain h-16 w-16 mb-4 text-muted-foreground/50" />

                          {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  className="h-20 w-20 color-[#67677e80] !mb-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain h-16 w-16 mb-4 text-muted-foreground/50" data-lov-id="src/components/employer/RecruiterPerformanceAnalysis.tsx:170:8" data-lov-name="Brain" data-component-path="src/components/employer/RecruiterPerformanceAnalysis.tsx" data-component-line="170" data-component-file="RecruiterPerformanceAnalysis.tsx" data-component-name="Brain" data-component-content="%7B%22className%22%3A%22h-16%20w-16%20mb-4%20text-muted-foreground%2F50%22%7D"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg> */}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 text-[#67677e]">Performance Analysis</h3>

                        <p className="text-sm text-center mb-2 max-w-sm">
                          Get AI-powered insights into {selectedRecruiter?.name || "the recruiter"}&apos;s performance.
                        </p>

                        <div className="flex items-center gap-3">
                          {/* Period Selector */}
                          <PeriodSelect analysisPeriod={analysisPeriod} setAnalysisPeriod={setAnalysisPeriod} />

                          {/* Analyze Button */}
                          <button
                            onClick={handleAnalyzeRecruiterPerformance}
                            className="inline-flex items-center gap-2 rounded-md bg-[#7c3bed] text-white h-10 px-3 py-2 text-sm font-medium hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                          >
                            <Brain className="h-4 w-4" />
                            Analyze Performance
                          </button>
                        </div>
                        {recruiterAnalysisFailed && (
                          <>
                            <div
                              className="space-y-4"
                              style={{ marginTop: "1.55rem" }}
                              onClick={() => {
                                setRecruiterAnalysisFailed(false);
                              }}
                            >
                              {/* API Status Banner */}
                              <div
                                className="flex items-center justify-between !gap-3 !px-4 !py-3 border bg-ref-50 border-ref-200"
                                style={{ borderRadius: "0.7rem" }}
                              >
                                <div className="flex items-center !gap-3">
                                  <OctagonXIcon className="h-4 w-4 text-red-600 " />
                                  <span className="text-sm font-medium text-red-600">
                                    The analysis couldn’t be completed. Please try running the performance analysis
                                    again.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* VIEW 3: DASHBOARD RESULT STATE */}
                    {!isRecruiterAnalyzing && recruiterAnalysisData && (
                      <div className="h-full overflow-y-auto pr-2 pb-10">
                        <div className="space-y-6">
                          {/* Header Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-[#7c3bed]" />
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-gray-900">AI Performance Analysis</h2>
                                <p className={`text-sm text-gray-500 `}>
                                  • Last {recruiterAnalysisData?.analysis_period?.days} days
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <PeriodSelect analysisPeriod={analysisPeriod} setAnalysisPeriod={setAnalysisPeriod} />
                              <button
                                onClick={handleAnalyzeRecruiterPerformance}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-white hover:bg-gray-100 h-9 w-9 text-gray-600"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Badges Row */}
                          <div className="flex items-center gap-4">
                            <span
                              className={`inline-flex items-center rounded-xl border px-4 py-2 text-lg font-semibold shadow-sm ${
                                recruiterAnalysisData?.gpt_analysis?.overall_rating?.includes("Good") ||
                                recruiterAnalysisData?.gpt_analysis?.overall_rating?.includes("Excellent")
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              {recruiterAnalysisData?.gpt_analysis?.overall_rating}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-3xl font-bold ${recruiterAnalysisData?.gpt_analysis?.performance_score > 6 ? "text-green-600" : "text-red-600"}`}
                              >
                                {recruiterAnalysisData?.gpt_analysis?.performance_score}
                              </span>
                              <span className="text-gray-500">/ 10</span>
                            </div>
                          </div>

                          {/* Executive Summary */}
                          <div className="rounded-xl border bg-blue-50 border-blue-200 text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-[16px] pb-2">
                              <h3 className="tracking-tight text-base font-semibold text-blue-900 flex items-center gap-2">
                                <Target className="h-4 w-4" /> Executive Summary
                              </h3>
                            </div>
                            <div className="p-[16px] pt-0">
                              <p className="text-sm text-blue-800">
                                {recruiterAnalysisData?.gpt_analysis?.executive_summary}
                              </p>
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 !gap-4">
                            <div className="rounded-xl border bg-white shadow-sm p-[16px]">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {recruiterAnalysisData?.performance_summary?.total_submissions}
                                  </p>
                                  <p className="text-xs text-gray-500 m-0">Total Submissions</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-white shadow-sm p-[16px]">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {recruiterAnalysisData?.performance_summary?.interviews_secured}
                                  </p>
                                  <p className="text-xs text-gray-500 m-0">Interviews Secured</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-white shadow-sm p-[16px]">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {recruiterAnalysisData?.performance_summary?.current_assigned_candidates}
                                  </p>
                                  <p className="text-xs text-gray-500 m-0">Assigned Candidates</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-white shadow-sm p-[16px]">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <ChartColumn className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p
                                    className={`text-2xl font-bold ${recruiterAnalysisData?.performance_summary?.avg_submissions_per_day < 0.5 ? "text-red-600" : recruiterAnalysisData?.performance_summary?.avg_submissions_per_day > 0.8 ? "text-green-600" : "text-gray-900"}`}
                                  >
                                    {recruiterAnalysisData?.performance_summary?.avg_submissions_per_day}
                                  </p>
                                  <p className="text-xs text-gray-500 m-0">Avg Sub/Day</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Secondary Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 !gap-4">
                            <div className="rounded-xl border bg-gray-50/50 shadow-sm p-[16px] text-center">
                              <div className="flex items-center justify-center gap-1">
                                <p
                                  className={`text-2xl font-bold ${Math.round((recruiterAnalysisData?.performance_summary?.days_with_submissions / recruiterAnalysisData?.performance_summary?.working_days_in_period) * 100) < 30 ? "text-red-600" : Math.round((recruiterAnalysisData?.performance_summary?.days_with_submissions / recruiterAnalysisData?.performance_summary?.working_days_in_period) * 100) > 70 ? "text-green-600" : "text-gray-900"}`}
                                >
                                  {recruiterAnalysisData?.performance_summary?.days_with_submissions}
                                </p>
                                <span className="text-sm text-gray-500" style={{ marginLeft: "0" }}>
                                  / {recruiterAnalysisData?.performance_summary?.working_days_in_period}
                                </span>
                              </div>
                              <p
                                className={`text-xs text-gray-500 mt-0 ${Math.round((recruiterAnalysisData?.performance_summary?.days_with_submissions / recruiterAnalysisData?.performance_summary.working_days_in_period) * 100) < 30 ? "text-red-600" : Math.round((recruiterAnalysisData?.performance_summary.days_with_submissions / recruiterAnalysisData?.performance_summary.working_days_in_period) * 100) > 70 ? "text-green-600" : "text-gray-900"}`}
                              >
                                Days Worked
                              </p>
                              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 mt-1">
                                {Math.round(
                                  (recruiterAnalysisData?.performance_summary.days_with_submissions /
                                    recruiterAnalysisData?.performance_summary.working_days_in_period) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                            <div className="rounded-xl border bg-gray-50/50 shadow-sm p-[16px] text-center">
                              <p
                                className={`text-2xl font-bold  ${recruiterAnalysisData?.performance_summary.avg_submissions_per_working_day < 0.5 ? "text-red-600" : recruiterAnalysisData?.performance_summary.avg_submissions_per_working_day > 0.8 ? "text-green-600" : "text-gray-900 "}`}
                              >
                                {recruiterAnalysisData?.performance_summary.avg_submissions_per_working_day}
                              </p>
                              <p className="text-xs text-gray-500 mt-0">Avg Sub/Working Day</p>
                            </div>
                            <div className="rounded-xl border bg-gray-50/50 shadow-sm p-[16px] text-center">
                              <p
                                className={`text-2xl font-bold  ${recruiterAnalysisData?.performance_summary.interview_conversion_rate < 0.5 ? "text-red-600" : recruiterAnalysisData?.performance_summary.interview_conversion_rate > 1 ? "text-green-600" : "text-gray-900 "}`}
                              >
                                {recruiterAnalysisData?.performance_summary.interview_conversion_rate}%
                              </p>
                              <p className="text-xs text-gray-500 mt-0">Interview Rate</p>
                            </div>
                            <div className="rounded-xl border bg-gray-50/50 shadow-sm p-[16px] text-center">
                              <p
                                className={`text-2xl font-bold text-gray-900  ${recruiterAnalysisData?.performance_summary.candidates_never_submitted < 0.5 ? "text-red-600" : recruiterAnalysisData?.performance_summary.candidates_never_submitted > 1 ? "text-green-600" : "text-gray-900 "}`}
                              >
                                {recruiterAnalysisData?.performance_summary.candidates_never_submitted}
                              </p>
                              <p className="text-xs text-gray-500 mt-0">Neglected Candidates</p>
                            </div>
                          </div>

                          {/* Charts Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 !gap-4">
                            {/* Submissions Trend Line Chart */}
                            <div className="rounded-xl border bg-white shadow-sm !p-4">
                              <div className="mb-4">
                                <h3 className="text-base font-semibold flex items-center !gap-2 text-gray-900">
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  Submissions Trend
                                </h3>
                              </div>
                              <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={recruiterAnalysisData?.detailed_metrics.submissions_by_day}
                                    margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                      dataKey="submission_day"
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fill: "#6B7280", fontSize: 12 }}
                                      tickMargin={10}
                                      tickFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                          month: "numeric",
                                          day: "numeric",
                                        })
                                      }
                                    />
                                    <YAxis
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fill: "#6B7280", fontSize: 12 }}
                                      allowDecimals={false}
                                      domain={[0, "dataMax"]}
                                    />

                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #E5E7EB",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                      }}
                                      itemStyle={{ color: "#111827" }}
                                    />
                                    <Line
                                      type="linear"
                                      dataKey="daily_count"
                                      stroke="#3B82F6"
                                      strokeWidth={2}
                                      dot={{ r: 3, fill: "#ffffff", stroke: "#3B82F6", strokeWidth: 2 }}
                                      activeDot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Status Pie Chart */}
                            <div className="rounded-xl border bg-white shadow-sm !p-4">
                              <div className="mb-4">
                                <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900">
                                  <BarChart3 className="h-4 w-4 text-purple-600" />
                                  Submissions by Status
                                </h3>
                              </div>
                              <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={recruiterAnalysisData?.detailed_metrics.submissions_by_status}
                                      cx="40%" // Shifted left to make room for legend
                                      cy="50%"
                                      labelLine={false}
                                      // Custom Label to show colored percentages outside
                                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        // Position label slightly outside
                                        const radius = outerRadius * 1.2;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        if (percent === 0) return null;

                                        return (
                                          <text
                                            x={x}
                                            y={y}
                                            fill={COLORS[index % COLORS.length]}
                                            textAnchor={x > cx ? "start" : "end"}
                                            dominantBaseline="central"
                                            fontSize={14}
                                            fontWeight="bold"
                                          >
                                            {`${(percent * 100).toFixed(0)}%`}
                                          </text>
                                        );
                                      }}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="count"
                                      nameKey="submission_status"
                                    >
                                      {recruiterAnalysisData?.detailed_metrics.submissions_by_status.map(
                                        (entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="white"
                                            strokeWidth={2}
                                          />
                                        ),
                                      )}
                                    </Pie>
                                    <Legend
                                      layout="vertical"
                                      verticalAlign="middle"
                                      align="right"
                                      iconType="rect"
                                      iconSize={12}
                                      wrapperStyle={{ fontSize: "12px", color: "#374151" }}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                          {/* Strengths Section */}
                          <div className="!rounded-xl !bg-green-50 border border-solid border-green-200 !shadow-sm !p-4 !pt-4 !pb-4">
                            <h3 className="text-base font-semibold text-green-800 flex items-center !gap-2 !mb-3">
                              <Award className="h-4 w-4" /> Strengths
                            </h3>
                            <ul className="!space-y-1 pl-0">
                              {recruiterAnalysisData?.gpt_analysis.strengths.map((strength, i) => (
                                <li key={i} className="!text-sm text-green-700 flex !items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Critical Issues & Red Flags */}
                          <div className="rounded-xl border bg-red-50   shadow-sm p-4 bg-red-50 !border-[#ef4444] !border-t-0 !border-r-0 !border-b-0 !border-l-4">
                            <h3 className="text-base font-semibold text-red-800 flex items-center gap-2 mb-3">
                              <Flag className="h-4 w-4" /> Critical Issues & Red Flags
                            </h3>

                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium text-red-800 mb-1">Critical Issues:</h5>
                                <ul className="space-y-1 pl-0">
                                  {recruiterAnalysisData?.gpt_analysis.critical_issues.map((issue, i) => (
                                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                      <TriangleAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium text-red-800 mb-1">Red Flags:</h5>
                                <ul className="space-y-1 pl-0">
                                  {recruiterAnalysisData?.gpt_analysis.red_flags.map((flag, i) => (
                                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      {flag}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Performance Breakdown */}
                          <div className="rounded-xl border bg-white shadow-sm !p-4">
                            <h3 className="text-base font-semibold flex items-center gap-2 mb-3 text-gray-900">
                              <BarChart3 className="h-4 w-4" /> Performance Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(recruiterAnalysisData?.gpt_analysis.performance_breakdown).map(
                                ([key, value]) => (
                                  <div key={key} className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium capitalize text-gray-700">
                                        {key.replace("_", " ")}
                                      </span>
                                      <span
                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold 
                      ${
                        value.rating === "Good" || value.rating === "Excellent"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : value.rating === "Poor" || value.rating === "Concerning"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                                      >
                                        {value.rating}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{value.assessment}</p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Questions for Review */}
                          <div className="rounded-xl border border-purple-200 bg-purple-50 shadow-sm !p-4 !pt-4 !pb-3">
                            <h3 className="text-base font-semibold text-purple-800 flex items-center gap-2 mb-2">
                              <HelpCircle className="h-4 w-4" /> Questions to Ask in Performance Review
                            </h3>
                            <ul className="space-y-2 pl-0">
                              {recruiterAnalysisData?.gpt_analysis.questions_for_recruiter.map((q, i) => (
                                <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                                  <span className="bg-purple-200 text-purple-800 rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Direct Feedback */}
                          <div className="rounded-xl border !border-amber-200 !bg-amber-50 !border-l-4 !border-l-amber-400 shadow-sm !p-4">
                            <h3 className="text-base font-semibold text-amber-900 flex items-center gap-2 mb-2">
                              <MessageSquareWarning className="h-4 w-4" /> Direct Feedback for Recruiter
                            </h3>
                            <p className="text-sm text-amber-800 mb-2">
                              {recruiterAnalysisData?.gpt_analysis.direct_feedback_message}
                            </p>

                            <div className="pt-3 ![border-top:1px_solid_#fde68a]">
                              <h5 className="text-sm font-semibold text-amber-900 mb-3">30-Day Targets:</h5>
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="bg-white rounded-xl p-2 text-center">
                                  <p className="text-lg font-bold text-amber-700">
                                    {recruiterAnalysisData?.gpt_analysis["30_day_targets"].minimum_submissions_per_day}
                                  </p>
                                  <p className="text-xs text-gray-500">Min Subs/Day</p>
                                </div>
                                <div className="bg-white rounded-xl p-2 text-center">
                                  <p className="text-lg font-bold text-amber-700">
                                    {recruiterAnalysisData?.gpt_analysis["30_day_targets"].target_interview_rate}
                                  </p>
                                  <p className="text-xs text-gray-500">Interview Rate</p>
                                </div>
                                <div className="bg-white rounded-xl p-2 text-center">
                                  <p className="text-lg font-bold text-amber-700">
                                    {recruiterAnalysisData?.gpt_analysis["30_day_targets"].candidate_coverage_target}
                                  </p>
                                  <p className="text-xs text-gray-500">Coverage</p>
                                </div>
                              </div>
                              <ul className="space-y-1 pl-0">
                                {recruiterAnalysisData?.gpt_analysis["30_day_targets"].specific_goals.map((goal, i) => (
                                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                                    <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Immediate Actions */}
                          <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm !p-4">
                            <h3 className="text-base font-semibold text-blue-800 flex items-center gap-2 mb-2">
                              <ClipboardList className="h-4 w-4" /> Immediate Actions Required
                            </h3>
                            <ul className="space-y-2 pl-0">
                              {recruiterAnalysisData?.gpt_analysis.immediate_actions_required.map((action, i) => (
                                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-blue-300" />
                                  <label className="cursor-pointer">{action}</label>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Management Recs */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm !p-4">
                            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2">
                              <UserCog className="h-4 w-4" /> Management Recommendations
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {recruiterAnalysisData?.gpt_analysis.management_recommendations
                                .performance_improvement_plan && (
                                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 border-orange-200">
                                  <ClipboardList className="h-3 w-3 mr-1" /> Performance Improvment Plan Recommended
                                </span>
                              )}
                              {recruiterAnalysisData?.gpt_analysis.management_recommendations.additional_training && (
                                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                                  📚 Additional Training
                                </span>
                              )}
                              {recruiterAnalysisData?.gpt_analysis.management_recommendations.closer_supervision && (
                                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 border-purple-200">
                                  👁️ Closer Supervision
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Excuses / Reasons Summary (Collapsible Table UI) */}
                          <div className="!border !border-blue-200 !rounded-xl !overflow-hidden !bg-white">
                            {/* Header */}
                            <button
                              onClick={() => toggleSection("excusesSummary")}
                              className="!w-full !bg-[#f1f1f97d] hover:!bg-[#f1f1f97d] mb-2 rounded-xl"
                            >
                              <div className="!flex !items-center !justify-between  !px-4 !py-3 !transition-colors">
                                <span className="!text-sm !font-medium !flex !items-center !gap-2 !text-[#080118]">
                                  📝 Excuses/Reasons Summary
                                </span>
                                <ChevronDown
                                  className={`!h-4 !w-4 !text-[#333] !transition-transform ${
                                    openSections.excusesSummary ? "!rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            {/* Content */}
                            {openSections.excusesSummary && (
                              <div className="!p-0">
                                <div className="!overflow-x-auto rounded-xl border border-solid border-[#f3f3f3]">
                                  <table className="!w-full !text-sm">
                                    <thead>
                                      <tr className="!bg-[#f7f7fb] !border-[#e7e7ef] !border-b">
                                        <th className="!h-11 !px-4 py-1 !text-left !font-medium !text-[#67677e]">
                                          Reason
                                        </th>
                                        <th className="!h-11 !px-4 py-1 !text-right !font-medium !text-[#67677e]">
                                          Count
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {Object.entries(
                                        recruiterAnalysisData?.detailed_metrics?.no_submission_reasons_summary || {},
                                      ).map(([reason, count], idx) => (
                                        <tr
                                          key={idx}
                                          className="!border-b last:!border-b-0 !border-[#e7e7ef] hover:!bg-[#f7f7fb] !transition-colors"
                                        >
                                          <td className="!px-4 !py-4 !text-[#080118] !text-sm capitalize">{reason}</td>
                                          <td className="!px-4 !py-4 !text-right !font-semibold !text-[#080118] capitalize">
                                            {count}
                                          </td>
                                        </tr>
                                      ))}

                                      {/* Empty State */}
                                      {Object.keys(
                                        recruiterAnalysisData?.detailed_metrics?.no_submission_reasons_summary || {},
                                      ).length === 0 && (
                                        <tr>
                                          <td colSpan={2} className="!px-4 !py-6 !text-center !text-sm !text-gray-500">
                                            No excuses data available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- ZERO SUBMISSIONS TAB --- */}
                {activeTab === "zero" && (
                  <div className="mt-0 flex-1 overflow-hidden h-full">
                    <div className="grid grid-cols-[30%_70%] !gap-4 h-full">
                      {/* LEFT COLUMN: CANDIDATE LIST */}
                      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 pb-2 flex-shrink-0">
                          <h3 className="tracking-tight text-sm font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            Candidates with Zero Submissions
                          </h3>
                        </div>
                        {zeroSubmissions.length === 0 ? (
                          <>
                            <div className="p-0 flex-1 overflow-hidden flex flex-col">
                              <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-users h-10 w-10 mb-2 text-[#67677e80]"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <p className="text-sm text-[#67677c]">No candidates with zero submissions</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-0 flex-1 overflow-hidden flex flex-col">
                              <div
                                className="relative overflow-hidden flex-1 scroll-smooth overflow-y-auto [&::-webkit-scrollbar]:w-1
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-slate-200
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors"
                              >
                                <div className="divide-y">
                                  {zeroSubmissions.map((candidate, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        handleZeroCandidateClick(candidate);
                                        setStoredAssignedData(null);
                                      }}
                                      className={`p-[12px] cursor-pointer  hover:bg-[#f1f1f9b3] !border-t-0 transition-colors ${selectedZeroCandidate?.primary_email === candidate.primary_email ? "!bg-[#f1f1f9b3] !border-solid  border-l-2 border-r-0 !border-t-0 border-b-0 border-l-[#1e3a5f]" : "border border-b !border-t-0 !border-l-0 !border-r-0 border-[#e7e7ef]"}`}
                                    >
                                      <div className="font-medium text-sm">
                                        {candidate.first_name} {candidate.last_name}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                                        {candidate.primary_email}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {candidate.visa_status && (
                                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                            {candidate.visa_status}
                                          </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          Last: {formatDate(candidate.last_submission_date || "Not Specified")}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* RIGHT COLUMN: ANALYSIS / PLACEHOLDER */}
                      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 pb-2 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <h3 className="tracking-tight text-sm font-semibold flex items-center gap-2">
                              <History className="h-4 w-4 text-orange-600" />
                              {selectedZeroCandidate
                                ? `${selectedZeroCandidate.first_name} ${selectedZeroCandidate.last_name}`
                                : "Select a Candidate"}
                            </h3>
                            {selectedZeroCandidate && (
                              <>
                                {user.user_role == "admin" ||
                                  (user.user_role == "super admin" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleAnalyzeCandidate(selectedZeroCandidate);
                                        }}
                                        disabled={isZeroAnalyzing}
                                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none border text-[#080118] border-input bg-[#fff] hover:bg-[#3c83f6] hover:text-white h-9 rounded-lg px-3 gap-1.5"
                                      >
                                        <Sparkles className="h-3 w-3" /> AI Analyze
                                      </button>
                                    </>
                                  ))}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col p-4 pt-0">
                          {/* STATE 1: LOADING */}
                          {selectedZeroCandidate ? (
                            <>
                              <div
                                className="flex-1 overflow-y-auto scroll-smooth relative [&::-webkit-scrollbar]:w-1
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-slate-200
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors "
                                style={{
                                  "--radix-scroll-area-corner-width": "0px",
                                  "--radix-scroll-area-corner-height": "0px",
                                }}
                              >
                                <div className="space-y-4 pr-2">
                                  <div className=" rounded-xl p-3 bg-[#f1f1f94d]">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium truncate">{selectedZeroCandidate.primary_email}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Last Submission</p>
                                        <p className="font-medium">
                                          {formatDate(selectedZeroCandidate.last_submission_date || "Not Specified")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {isAnalyzingThisSubmission && (
                                    <>
                                      {isAnalyzing ? (
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                          <div className="border border-purple-200 bg-purple-50 rounded-xl !p-4 w-full">
                                            <div className="flex items-center gap-2 text-purple-800">
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              <span className="text-sm font-medium">
                                                Analyzing candidate history with AI...
                                              </span>
                                            </div>
                                            <p className="text-xs text-purple-600 mt-1">This may take a few seconds</p>
                                          </div>
                                        </div>
                                      ) : analysisData?.analysis ? (
                                        <div className="pt-0 space-y-4">
                                          {/* Status & Summary Card */}
                                          <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white">
                                            <div className="flex flex-col space-y-1.5 p-6 pb-2 border-b">
                                              <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-purple-600" />
                                                AI Recruiter Accountability Analysis -{" "}
                                                {analysisData.analysis.analysis_metadata.candidate_name}
                                              </h3>
                                            </div>

                                            <div className="p-6 pt-2 space-y-4">
                                              {/* Analysis Status */}
                                              <div
                                                className={`rounded-xl p-4 !border-solid !border-l-4 border-r-0 border-t-0 border-b-0 ${analysisData.analysis.candidate_specific_analysis.submission_status !== "active" ? "!bg-red-50 !border-red-500" : "!bg-green-50 !border-green-500"}`}
                                              >
                                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                                    <Target className="h-4 w-4" /> Analysis for{" "}
                                                    {analysisData.analysis.analysis_metadata.candidate_name}
                                                  </h4>
                                                  <div className="flex gap-2 flex-wrap">
                                                    {analysisData.analysis.candidate_specific_analysis
                                                      .submission_status == "active" ? (
                                                      <>
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-600 text-white capitalize">
                                                          <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                                          {
                                                            analysisData.analysis.candidate_specific_analysis
                                                              .submission_status
                                                          }
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-red-600 text-white">
                                                          <UserX className="h-3 w-3 mr-1" />{" "}
                                                          {analysisData.analysis.candidate_specific_analysis.submission_status.replace(
                                                            "_",
                                                            " ",
                                                          )}
                                                        </div>
                                                      </>
                                                    )}

                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold  ${analysisData.analysis.candidate_specific_analysis.submission_status !== "active" ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                                                    >
                                                      {
                                                        analysisData.analysis.candidate_specific_analysis
                                                          .recruiter_effort_for_this_candidate
                                                      }
                                                    </span>
                                                    {/* <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-transparent">
                                                      <Clock className="h-3 w-3 mr-1" /> {analysisData.analysis.analysis_metadata.days_since_last_submission} days without submission
                                                    </span> */}
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  Status:{" "}
                                                  {analysisData.analysis.candidate_specific_analysis.submission_status}
                                                </p>
                                              </div>

                                              {/* Submission Summary Grid */}
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 py-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-900">
                                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                                  Submission Summary
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                  <div className="bg-white rounded-xl pl-2 pr-2 pt-2 pb-2 text-center border">
                                                    <span className="text-2xl font-bold text-blue-600 block">
                                                      {
                                                        analysisData.analysis.analysis_metadata
                                                          .total_submissions_by_recruiter
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">By Recruiter</span>
                                                  </div>
                                                  <div className="bg-white rounded-xl pl-2 pr-2 pt-2 pb-2 text-center border">
                                                    <span className="text-2xl font-bold text-purple-600 block">
                                                      {analysisData.submission_summary.total_submissions_all_recruiters}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      All Recruiters
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-xl pl-2 pr-2 pt-2 pb-2 text-center border">
                                                    <span
                                                      className={`text-2xl font-bold block ${analysisData.analysis.analysis_metadata.days_since_last_submission < 3 ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                      {analysisData.submission_summary.interviews_secured}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">Interviews</span>
                                                  </div>
                                                  <div className="bg-white rounded-xl pl-2 pr-2 pt-2 pb-2 text-center border">
                                                    <span className="text-2xl font-bold text-green-600 block">
                                                      {analysisData.analysis.analysis_metadata
                                                        .days_since_last_submission || 0}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      Days Since Last
                                                    </span>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                  <Calendar className="h-3 w-3" /> Last submission:{" "}
                                                  {formatDate(analysisData.submission_summary.last_submission_date)}
                                                </p>
                                              </div>

                                              {/* Collapsible Recent Submissions */}
                                              <div className="rounded-xl overflow-hidden bg-white">
                                                <button
                                                  onClick={() => toggleSection("recentSubmissionsInner")}
                                                  className="w-full flex items-center justify-between bg-blue-50 px-3 py-3 hover:bg-blue-100 transition-colors rounded-xl text-left border border-blue-200 mb-2"
                                                >
                                                  <span className="text-sm font-medium flex items-center gap-2 text-[#1e40af]">
                                                    📋 Recent Submissions (
                                                    {analysisData.recent_submissions?.length || 0})
                                                  </span>
                                                  <ChevronDown
                                                    className={`h-4 w-4 text-indigo-600 transition-transform ${
                                                      openSections.recentSubmissionsInner ? "rotate-180" : ""
                                                    }`}
                                                  />
                                                </button>

                                                {openSections.recentSubmissionsInner && (
                                                  <div className="bg-white rounded-xl border-solid border-[#e7e7ee] border-t-[0.5px] border-l-[0.5px] border-b-[0.5px] border-r-[0.5px]">
                                                    {/* Table Header */}
                                                    <div className="grid grid-cols-4 px-4 py-3 text-xs font-medium text-[#67677e] bg-[#f1f1f980] border-solid border-[#e7e7ee] border-t-[0px] border-l-[0px] border-b-[0.8px] border-r-[0px]">
                                                      <div>Date</div>
                                                      <div>Client</div>
                                                      <div>Status</div>
                                                      <div className="text-right">Rate</div>
                                                    </div>

                                                    {/* Rows */}
                                                    {analysisData.recent_submissions?.map((sub, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="grid grid-cols-4 px-4 py-2 text-xs border-b last:border-0 items-center hover:bg-gray-50 border-solid border-[#e7e7ee] border-t-[0px] border-l-[0px] border-b-[0.8px] border-r-[0px]"
                                                      >
                                                        <div className="text-gray-900">
                                                          {formatDate(sub.submission_date)}
                                                        </div>

                                                        <div className="text-gray-900 font-normal">
                                                          {sub.client_name}
                                                        </div>

                                                        <div>
                                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-gray-900  text-xs font-semibold border border-indigo-200 bg-white capitalize">
                                                            {sub.submission_status}
                                                          </span>
                                                        </div>

                                                        <div className="text-right text-gray-900 font-normal">
                                                          {sub.rate}
                                                        </div>
                                                      </div>
                                                    ))}

                                                    {(!analysisData.recent_submissions ||
                                                      analysisData.recent_submissions.length === 0) && (
                                                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                                                        No recent submissions found.
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Overall Assessment */}
                                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                                                  <Target className="h-4 w-4" /> Overall Assessment
                                                </h4>
                                                <p className="text-sm text-blue-800">
                                                  {analysisData.analysis.overall_assessment}
                                                </p>
                                              </div>

                                              {/* Scores Grid */}
                                              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                                <div className="bg-muted/30 bg-gray-50 rounded-lg p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">
                                                    Performance Score
                                                  </p>
                                                  <div className="flex items-center gap-2">
                                                    <span
                                                      className={`text-2xl font-bold  ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "text-yellow-600" : "text-red-600"}`}
                                                    >
                                                      {analysisData.analysis.recruiter_accountability.performance_score}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">/10</span>
                                                  </div>
                                                  <div
                                                    className={`relative w-full overflow-hidden rounded-full h-1.5 mt-2 ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "bg-yellow-200" : "bg-red-500"}`}
                                                  >
                                                    <div
                                                      className={`h-full ${analysisData.analysis.recruiter_accountability.performance_score > 8 ? "bg-yellow-500" : "bg-[#7c3bed]"}`}
                                                      style={{
                                                        width: `${analysisData.analysis.recruiter_accountability.performance_score * 10}%`,
                                                      }}
                                                    ></div>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Accountability</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${analysisData.analysis.recruiter_accountability.accountability_level == "high" ? "bg-green-100 text-green-800 border-green-200" : analysisData.analysis.recruiter_accountability.accountability_level == "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}
                                                    >
                                                      {
                                                        analysisData.analysis.recruiter_accountability
                                                          .accountability_level
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Effort Level</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${analysisData.analysis.recruiter_accountability.effort_level == "insufficient" ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {analysisData.analysis.recruiter_accountability.effort_level}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="bg-muted/30 bg-gray-50 rounded-xl p-3">
                                                  <p className="text-xs text-muted-foreground mb-1">Blame Shifting</p>
                                                  <div className="mt-1">
                                                    <span
                                                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${analysisData.analysis.recruiter_accountability.blame_shifting_detected ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                                                    >
                                                      {!analysisData.analysis.recruiter_accountability
                                                        .blame_shifting_detected ? (
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                      ) : (
                                                        <TriangleAlert className="h-3 w-3 mr-1" />
                                                      )}
                                                      {analysisData.analysis.recruiter_accountability
                                                        .blame_shifting_detected
                                                        ? "Detected"
                                                        : "Not Detected"}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Responsibility Analysis */}
                                              <div className="bg-muted/20 bg-gray-50 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                                  <BarChart3 className="h-4 w-4 text-purple-500" /> Responsibility
                                                  Analysis
                                                </h4>
                                                <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                                                  <div
                                                    className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                                                    style={{
                                                      width: `${analysisData.analysis.candidate_vs_recruiter_responsibility.recruiter_responsibility_percent}%`,
                                                    }}
                                                  >
                                                    Recruiter:{" "}
                                                    {
                                                      analysisData.analysis.candidate_vs_recruiter_responsibility
                                                        .recruiter_responsibility_percent
                                                    }
                                                    %
                                                  </div>
                                                  <div
                                                    className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium"
                                                    style={{
                                                      width: `${analysisData.analysis.candidate_vs_recruiter_responsibility.candidate_responsibility_percent}%`,
                                                    }}
                                                  >
                                                    Candidate:{" "}
                                                    {
                                                      analysisData.analysis.candidate_vs_recruiter_responsibility
                                                        .candidate_responsibility_percent
                                                    }
                                                    %
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  {
                                                    analysisData.analysis.candidate_vs_recruiter_responsibility
                                                      .explanation
                                                  }
                                                </p>
                                              </div>

                                              {/* Action Plan */}
                                              <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                                                  <ListChecks className="h-4 w-4" /> Action Plan
                                                </h4>

                                                {analysisData.analysis.action_plan_for_candidate.immediate_actions
                                                  .length > 0 && (
                                                  <div className="mb-3">
                                                    <h5 className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1.5">
                                                      🔴 Immediate Actions (TODAY)
                                                    </h5>
                                                    <ul className="space-y-1 pl-0">
                                                      {analysisData.analysis.action_plan_for_candidate.immediate_actions.map(
                                                        (action, i) => (
                                                          <li
                                                            key={i}
                                                            className="text-xs text-emerald-700 flex items-start gap-2"
                                                          >
                                                            <input
                                                              type="checkbox"
                                                              className="mt-0.5 h-3 w-3 rounded border-emerald-300"
                                                            />
                                                            <label>{action}</label>
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                                {analysisData.analysis.action_plan_for_candidate.weekly_targets.length >
                                                  0 && (
                                                  <div className="mb-3">
                                                    <h5 className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1.5">
                                                      📅 Weekly Targets
                                                    </h5>
                                                    <ul className="space-y-1 pl-0">
                                                      {analysisData.analysis.action_plan_for_candidate.weekly_targets.map(
                                                        (target, i) => (
                                                          <li
                                                            key={i}
                                                            className="text-xs text-emerald-700 flex items-start gap-2"
                                                          >
                                                            <span className="text-blue-500">•</span> {target}
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                                <div className="bg-white/50 rounded-lg p-2">
                                                  <h5 className="text-xs font-semibold text-purple-700 flex items-center gap-1 mb-1">
                                                    <RefreshCw className="h-3 w-3" /> Follow-up Schedule
                                                  </h5>
                                                  <p className="text-xs text-emerald-700">
                                                    {analysisData.analysis.action_plan_for_candidate.follow_up_schedule}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Direct Feedback */}
                                              <div className="!bg-amber-50 rounded-xl p-4 border !border-amber-200 !border-l-4 !border-l-amber-400">
                                                <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-2">
                                                  <MessageSquareWarning className="h-4 w-4" /> Direct Feedback to
                                                  Recruiter
                                                </h4>
                                                <p className="text-sm text-amber-800">
                                                  {analysisData.analysis.direct_feedback_to_recruiter}
                                                </p>
                                              </div>

                                              {/* Critical Questions */}
                                              <div className="border border-purple-200 bg-purple-50 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-2">
                                                  <HelpCircle className="h-4 w-4" /> Critical Questions for Recruiter
                                                </h4>
                                                <ul className="space-y-1.5 pl-0">
                                                  {analysisData.analysis.critical_questions_for_recruiter.map(
                                                    (q, i) => (
                                                      <li
                                                        key={i}
                                                        className="text-xs text-purple-700 flex items-start gap-2"
                                                      >
                                                        <span className="bg-purple-200 text-purple-800 rounded-full h-4 w-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                                          {i + 1}
                                                        </span>
                                                        {q}
                                                      </li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>

                                              {/* Gaps & Concerns Grid */}
                                              <div className="bg-muted/20 bg-gray-50 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                                  <AlertCircle className="h-4 w-4 text-orange-500" /> Gaps & Concerns
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="text-2xl font-bold text-orange-600 block">
                                                      {
                                                        analysisData.analysis.gaps_and_concerns
                                                          .submission_gaps_over_2_days
                                                      }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      Gaps Over 2 Days
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="text-2xl font-bold text-amber-600 block">
                                                      {analysisData.analysis.gaps_and_concerns.vague_excuses_count}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">Vague Excuses</span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200 mb-1">
                                                      {analysisData.analysis.gaps_and_concerns.repeated_same_excuse
                                                        ? "Yes"
                                                        : "No"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground block">
                                                      Repeated Same Excuse
                                                    </span>
                                                  </div>
                                                  <div className="bg-white rounded-xl p-2.5 text-center">
                                                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200 mb-1">
                                                      {analysisData.analysis.gaps_and_concerns
                                                        .lack_of_follow_up_evidence
                                                        ? "Yes"
                                                        : "No"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground block">
                                                      Lack of Follow-up
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Red Flags */}
                                              {analysisData.analysis.red_flags_about_recruiter.length > 0 && (
                                                <div className="border  bg-red-50 !border-l-red-500 rounded-xl p-3 !border !border-l-4 !border-t-[0.6px] !border-r-[0.6px] !border-b-[0.6px]">
                                                  <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                                                    <Flag className="h-4 w-4" /> Red Flags
                                                  </h4>
                                                  <ul className="space-y-1 pl-0">
                                                    {analysisData.analysis.red_flags_about_recruiter.map((flag, i) => (
                                                      <li
                                                        key={i}
                                                        className="text-xs text-red-700 flex items-start gap-1.5"
                                                      >
                                                        <XCircle className="h-3 w-3 mt-0.5" /> {flag}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}

                                              {/* Required Improvements */}
                                              <div className="border border-blue-200 bg-blue-50 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                                  <ClipboardList className="h-4 w-4" /> Required Improvements
                                                </h4>
                                                <ul className="space-y-1.5 pl-0">
                                                  {analysisData.analysis.improvement_demands.map((imp, i) => (
                                                    <li
                                                      key={i}
                                                      className="text-xs text-blue-700 flex items-start gap-2"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        className="mt-0.5 h-3 w-3 rounded border-blue-300"
                                                      />
                                                      <label>{imp}</label>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>

                                              {/* Management Recommendations */}
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                                                  <UserCog className="h-4 w-4" /> Management Recommendations
                                                </h4>
                                                <p className="text-sm text-slate-700 mb-3">
                                                  <strong>Immediate Action:</strong>{" "}
                                                  {analysisData.analysis.management_recommendations.immediate_action}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                  {analysisData.analysis.management_recommendations
                                                    .performance_review_needed && (
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 border-orange-200">
                                                      <Clock className="h-3 w-3 mr-1" /> Performance Review Needed
                                                    </span>
                                                  )}
                                                  {analysisData.analysis.management_recommendations
                                                    .additional_training_needed && (
                                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
                                                      Training Needed
                                                    </div>
                                                  )}
                                                  {analysisData.analysis.management_recommendations
                                                    .escalation_required && (
                                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
                                                      Escalation Required
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              {(analysisData.analysis.excuse_analysis.legitimate_reasons.length > 0 ||
                                                analysisData.analysis.excuse_analysis.questionable_excuses.length > 0 ||
                                                analysisData.analysis.excuse_analysis.unacceptable_patterns.length >
                                                  0) && (
                                                <div className="w-full">
                                                  <button
                                                    type="button"
                                                    onClick={() => setExcuseCollapse(!excuseCollapse)}
                                                    className="w-full bg-transparent"
                                                    aria-expanded={excuseCollapse}
                                                  >
                                                    <div className="flex items-center justify-between !bg-[#fbfbfd] !rounded-xl !p-3 hover:!bg-[#fbfbfd]/50 !transition-colors">
                                                      <span className="text-sm !font-medium flex items-center !gap-2">
                                                        📝 Excuse Analysis Details
                                                      </span>
                                                      <ChevronDown
                                                        className={`h-4 w-4 transition-transform duration-200 ${
                                                          excuseCollapse ? "rotate-180" : ""
                                                        }`}
                                                      />
                                                    </div>
                                                  </button>

                                                  {excuseCollapse && (
                                                    <div className="mt-2 space-y-2">
                                                      {/* Legitimate Reasons Section */}
                                                      {analysisData.analysis.excuse_analysis.legitimate_reasons.length >
                                                        0 && (
                                                        <div className="bg-[#fefce8] border !border-[#fef08a] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold !text-yellow-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleHelp className="h-3 w-3" />
                                                            Legitimate Reasons
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.legitimate_reasons.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-yellow-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}

                                                      {/* Questionable Excuses Section */}
                                                      {analysisData.analysis.excuse_analysis.questionable_excuses
                                                        .length > 0 && (
                                                        <div className="bg-[#fefce8] border !border-[#fef08a] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold !text-yellow-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleHelp className="h-3 w-3" />
                                                            Questionable Excuses
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.questionable_excuses.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-yellow-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}

                                                      {/* Unacceptable Patterns Section */}
                                                      {analysisData.analysis.excuse_analysis.unacceptable_patterns
                                                        .length > 0 && (
                                                        <div className="bg-red-50 border border-[#fecaca] rounded-xl p-[12px]">
                                                          <h5 className="text-xs font-semibold text-red-800 flex items-center gap-1.5 mb-1.5">
                                                            <CircleX className="h-3 w-3" />
                                                            Unacceptable Patterns
                                                          </h5>
                                                          <ul className="space-y-0.5 pl-4 pb-0 mb-0">
                                                            {analysisData.analysis.excuse_analysis.unacceptable_patterns.map(
                                                              (item, index) => (
                                                                <li key={index} className="text-xs text-red-700">
                                                                  {item}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="py-8 text-center text-red-500 text-sm">
                                          Failed to load analysis.
                                        </div>
                                      )}
                                    </>
                                  )}

                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-xs flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-3 w-3"
                                      >
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                      </svg>
                                      Add Reason
                                    </h4>

                                    <textarea
                                      rows={2}
                                      className="resize-none text-sm w-full rounded-xl border px-3 py-2"
                                      placeholder="Enter the reason why there were no submissions..."
                                      value={reasonInput}
                                      onChange={(e) => {
                                        setReasonInput(e.target.value);
                                      }}
                                    />

                                    <button
                                      className="w-full inline-flex items-center justify-center gap-2 bg-[#7c3bed] text-white h-9 rounded-md text-sm"
                                      onClick={() => {
                                        handleReasonSubmit();
                                      }}
                                    >
                                      {reasonLoader || isSubmittingReason ? (
                                        <>
                                          <Loader2 className="h-5 w-5 animate-spin" />
                                        </>
                                      ) : (
                                        <>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-3 w-3"
                                          >
                                            <path d="M5 12h14" />
                                            <path d="M12 5v14" />
                                          </svg>
                                        </>
                                      )}
                                      Add Reason
                                    </button>
                                  </div>
                                  {reasonLoading ? (
                                    <>
                                      <div>
                                        <h4 className="font-semibold text-xs flex items-center gap-1 mb-2">
                                          <MessageSquare className="lucide lucide-message-square h-3 w-3" />
                                          History ({noSubmissionReason.length})
                                        </h4>

                                        <div className="space-y-2">
                                          <div className="border rounded-xl p-3">
                                            <div className="animate-pulse rounded-xl bg-gray-100 h-3 w-24 mb-2"></div>
                                            <div className="animate-pulse rounded-xl bg-gray-100 h-10 w-full"></div>
                                          </div>

                                          <div className="border rounded-xl p-3">
                                            <div className="animate-pulse rounded-xl bg-gray-100 h-3 w-24 mb-2"></div>
                                            <div className="animate-pulse rounded-xl bg-gray-100 h-10 w-full"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {noSubmissionReason && noSubmissionReason.length > 0 ? (
                                        <>
                                          {/* Calculation for pagination */}
                                          {(() => {
                                            const totalHistoryPages = Math.ceil(
                                              noSubmissionReason.length / ITEMS_PER_HISTORY_PAGE,
                                            );
                                            const currentHistoryItems = noSubmissionReason.slice(
                                              (historyPage - 1) * ITEMS_PER_HISTORY_PAGE,
                                              historyPage * ITEMS_PER_HISTORY_PAGE,
                                            );

                                            return (
                                              <div className="flex flex-col h-full">
                                                <h4 className="font-semibold text-xs flex items-center gap-1 mb-2 flex-shrink-0">
                                                  <MessageSquare className="lucide lucide-message-square h-3 w-3" />
                                                  History ({noSubmissionReason.length})
                                                </h4>

                                                {/* Scrollable List Area */}
                                                <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                                                  {currentHistoryItems.map((item, i) => (
                                                    <div
                                                      key={i}
                                                      className="border rounded-lg pl-3 pr-3 pt-2 pb-2 bg-background"
                                                    >
                                                      <span className="text-xs text-[#67677e]">
                                                        {formatDate(item.created_at)}
                                                      </span>
                                                      <p className="text-xs whitespace-pre-wrap mt-1 text-[#080118]">
                                                        {item.no_submission_reason}
                                                      </p>
                                                    </div>
                                                  ))}
                                                </div>

                                                {/* Pagination Controls */}
                                                {totalHistoryPages > 1 && (
                                                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100 flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground">
                                                      Page {historyPage} of {totalHistoryPages}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setHistoryPage((p) => Math.max(1, p - 1));
                                                        }}
                                                        disabled={historyPage === 1}
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                      >
                                                        <ChevronLeft className="h-3 w-3" />
                                                      </button>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setHistoryPage((p) => Math.min(totalHistoryPages, p + 1));
                                                        }}
                                                        disabled={historyPage === totalHistoryPages}
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                      >
                                                        <ChevronRight className="h-3 w-3" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </>
                                      ) : (
                                        <div className="text-xs text-gray-500 italic px-2">No history recorded.</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {isZeroAnalyzing ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                  <div className="border border-purple-200 bg-purple-50 rounded-lg !p-4 w-full max-w-sm">
                                    <div className="flex items-center gap-2 text-purple-800">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span className="text-sm font-medium">
                                        Analyzing candidate history with AI...
                                      </span>
                                    </div>
                                    <p className="text-xs text-purple-600 mt-1">This may take a few seconds</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="h-10 w-10 mb-2 text-[#67677e80]" />
                                    <p className="text-sm text-center text-[#67677c]">
                                      Select a candidate from the list
                                      <br />
                                      to view and add reasons
                                    </p>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- SUBMISSIONS TAB (NEW IMPLEMENTATION) --- */}
                {activeTab === "submissions" && (
                  <div className="mt-0 flex-1 overflow-hidden">
                    <div className="relative overflow-hidden h-full flex flex-col">
                      <div className="space-y-4 pr-4 h-full overflow-y-auto">
                        {submissionData.length == 0 && interviewData.length == 0 ? (
                          <></>
                        ) : (
                          <>
                            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                              {/* Top Bar: Search and Active Filters */}
                              <div className="flex flex-col space-y-1.5 !p-5 !pt-3 !pb-3">
                                <div className="flex items-center gap-4 flex-wrap mt-1 ml-[1px]">
                                  {/* Search Input */}
                                  <div className="relative !flex-1 !max-w-xs">
                                    <Search className="absolute !left-3 !top-1/2 !transform -translate-y-1/2 !h-4 !w-4 !text-muted-foreground" />
                                    <input
                                      className="flex w-full rounded-xl border border-input bg-background !px-3 !py-2 !pl-10 h-9 text-sm focus:outline-none focus:!ml-[2px] focus:ring-2 focus:ring-purple-600"
                                      placeholder="Search by candidate name..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                  </div>

                                  {/* Active Filters Display */}
                                  {(activeFilter || searchQuery) && (
                                    <div className="flex items-center gap-2">
                                      <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          class="lucide lucide-filter h-3.5 w-3.5"
                                        >
                                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                        </svg>
                                        <span class="font-medium">Filters:</span>
                                      </div>
                                      {/* Status Filter Badge */}
                                      {activeFilter && (
                                        <div
                                          onClick={() => setActiveFilter(null)}
                                          className="rounded-full border border-transparent bg-[#f3f3fc] text-secondary-foreground px-[12px] py-[6px] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:!bg-[#ef444433] hover:border-solid hover:border hover:!border-[#ef43434d] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                          Status: {activeFilter}
                                          <X className="h-3 w-3" />
                                        </div>
                                      )}

                                      {/* Search Query Filter Badge (Optional - usually input is enough, but can show as badge too) */}
                                      {/* If you want to clear search via badge as well: */}
                                      {searchQuery && (
                                        <div
                                          onClick={() => setSearchQuery("")}
                                          className="rounded-full border border-transparent bg-[#f3f3fc] text-secondary-foreground px-[12px] py-[6px] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:!bg-[#ef444433] hover:border-solid hover:border hover:!border-[#ef43434d] transition-colors"
                                        >
                                          Search: {searchQuery}
                                          <X className="h-3 w-3" />
                                        </div>
                                      )}

                                      {/* Clear All Button */}
                                      <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 h-7 text-xs font-medium transition-colors ring-offset-background bg-[#fff] hover:!text-white hover:!bg-[#3c83f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                      >
                                        Clear all
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div
                                className="h-px bg-border/60"
                                style={{ backgroundColor: "hsl(var(--border) / 0.6)" }}
                              ></div>

                              <div className="flex flex-col space-y-1.5 !p-5 !pt-3 !pb-3">
                                <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  Submission Status Breakdown
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (click to filter tables below)
                                  </span>
                                </h3>
                              </div>
                              <div className="p-6 pt-0">
                                <div className="flex flex-wrap gap-2">
                                  {/* 'All' Filter Button */}
                                  {/* <button
                                  onClick={() => setActiveFilter(null)}
                                  className={`flex items-center !gap-2 !px-3 !py-2 !rounded-lg !transition-colors !cursor-pointer border ${activeFilter === null ? '!bg-[#1e3a5f] !text-white !ring-2 !ring-[#1e3a5f] !ring-offset-2' : '!bg-[#f1f1f980] hover:!bg-muted !border-transparent'}`}
                                >
                                  <span className="!text-sm !font-medium">All</span>
                                </button> */}

                                  {/* Status Badges Map */}
                                  {submissionStatusSummary.map((status, index) => {
                                    const statusName = status.submission_status || "";
                                    const isActive = activeFilter === statusName;

                                    // Determine Badge Color style based on status name text content
                                    let badgeStyle = "!bg-gray-100 !text-gray-800 !border-gray-200";
                                    if (statusName.includes("Interview"))
                                      badgeStyle = "!bg-green-100 !text-green-800 !border-green-200";
                                    if (statusName.includes("Rejected"))
                                      badgeStyle = "!bg-red-100 !text-red-800 !border-red-200";
                                    if (statusName.includes("submitted"))
                                      badgeStyle = "!bg-blue-100 !text-blue-800 !border-blue-200";
                                    if (statusName.includes("Shortlisted"))
                                      badgeStyle = "!bg-purple-100 !text-purple-800 !border-purple-200";

                                    return (
                                      <>
                                        {status?.submission_status !== "" && (
                                          <>
                                            <button
                                              key={index}
                                              onClick={() => setActiveFilter(isActive ? null : statusName)}
                                              className={`flex items-center !gap-2 !px-3 !py-2 !rounded-xl !transition-colors !cursor-pointer !border ${isActive ? "!bg-[#1e3a5f] !text-white !ring-2 !ring-[#1e3a5f] !ring-offset-2" : "!bg-[#f1f1f980] hover:!bg-[#f1f1f9] border-transparent"}`}
                                            >
                                              <div
                                                className={`inline-flex items-center !rounded-full border !px-2.5 !py-0.5 !text-xs !font-semibold !transition-colors capitalize ${
                                                  isActive
                                                    ? "hover:bg-primary/80 bg-white/20 text-white border-white/30"
                                                    : badgeStyle
                                                }`}
                                              >
                                                {statusName}
                                              </div>
                                              {console.log("list of statuses", status)}
                                              <span className="text-sm font-medium">{status.status_count}</span>
                                              <span className="text-xs text-muted-foreground">
                                                ({status.percentage})
                                              </span>
                                            </button>
                                          </>
                                        )}
                                      </>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {/* Submission Status Breakdown Card (Filters) */}

                        {/* Two Column Grid: All Submissions & Interviews */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 !gap-4">
                          {/* Left: All Submissions Table */}
                          <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col">
                            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                              <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                All Submissions ({filteredSubmissions.length})
                              </h3>
                            </div>
                            {submissionData.length === 0 ? (
                              <>
                                <div className="p-0 flex-1 overflow-hidden">
                                  <div className="text-center py-12 text-muted-foreground">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-file-text h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                                    >
                                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                      <path d="M10 9H8"></path>
                                      <path d="M16 13H8"></path>
                                      <path d="M16 17H8"></path>
                                    </svg>
                                    <p className="text-sm text-[#67677c]">No submissions found</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {currentPaginatedSubmissions.length === 0 ? (
                                  <>
                                    <div className="p-0 flex-1 overflow-hidden">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-file-text h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                                        >
                                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                          <path d="M10 9H8"></path>
                                          <path d="M16 13H8"></path>
                                          <path d="M16 17H8"></path>
                                        </svg>
                                        <p className="text-sm text-[#67677c]">No submissions found</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="p-0 flex-1 overflow-hidden">
                                      <div
                                        className="max-h-[400px] scroll-smooth overflow-auto [&::-webkit-scrollbar]:w-1
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-slate-200
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors"
                                      >
                                        <table className="w-full caption-bottom text-sm">
                                          <thead className="sticky top-0 z-10 ">
                                            <tr className="transition-colors bg-[#f1f1f9]">
                                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted">
                                                Candidate
                                              </th>
                                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted sm:table-cell">
                                                Vendor
                                              </th>
                                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted">
                                                Status
                                              </th>
                                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted md:table-cell">
                                                Date
                                              </th>
                                              <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right bg-muted w-[60px]">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="[&_tr:last-child]:border-0">
                                            {currentPaginatedSubmissions.length > 0 ? (
                                              currentPaginatedSubmissions.map((sub, idx) => (
                                                <tr
                                                  key={idx}
                                                  className="!border-b transition-colors border-[#e7e7ef] hover:bg-[#f1f1f980]"
                                                >
                                                  <td className="!p-4 align-middle font-medium text-sm">
                                                    {sub.candidate_full_name || sub.first_name}
                                                  </td>
                                                  <td
                                                    className="!p-4 align-middle text-muted-foreground text-xs truncate max-w-[120px] sm:table-cell"
                                                    title={sub.vendor_name || sub.to_email}
                                                  >
                                                    {sub.vendor_name || sub.to_email || "-"}
                                                  </td>
                                                  <td className="!p-4 align-middle">
                                                    {/* Since "All Submissions" usually implies "submitted to vendor" unless specified otherwise in mock data, logic handles raw data */}
                                                    <div className="inline-flex items-center rounded-md border !px-2.5 !py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                                                      {sub.submission_status || "submitted to vendor"}
                                                    </div>
                                                  </td>
                                                  <td className="!p-4 align-middle text-xs whitespace-nowrap md:table-cell">
                                                    {formatDateNumber(sub.submission_date)}
                                                    {/* {sub.submission_date} */}
                                                  </td>
                                                  <td className="!p-4 align-middle text-right">
                                                    <button
                                                      onClick={() => viewEmailPopup(sub.rate_confirmation_id || sub.id)} // <--- CHANGE THIS LINE
                                                      className="inline-flex items-center justify-center h-7 w-7 p-0 hover:!text-white hover:!bg-[#3c83f6] rounded-md"
                                                    >
                                                      <Eye className="h-4 w-4 text-primary hover:!text-white" />
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))
                                            ) : (
                                              <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                  No submissions found.
                                                </td>
                                              </tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    {/* Pagination Footer - Left */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t">
                                      <span className="text-sm text-muted-foreground">
                                        Page {submissionsPage} of {totalSubmissionPages}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => setSubmissionsPage((p) => Math.max(1, p - 1))}
                                          disabled={submissionsPage === 1}
                                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:!text-white hover:!bg-[#3c83f6] h-9 rounded-md px-3 disabled:opacity-50"
                                        >
                                          <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        <button
                                          onClick={() =>
                                            setSubmissionsPage((p) => Math.min(totalSubmissionPages, p + 1))
                                          }
                                          disabled={submissionsPage === totalSubmissionPages}
                                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:!text-white hover:!bg-[#3c83f6] h-9 rounded-md px-3 disabled:opacity-50"
                                        >
                                          Next <ChevronRight className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>

                          {/* Right: Interviews & Screenings Table */}
                          <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col">
                            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                              <h3 className="tracking-tight text-base font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Interviews & Screenings ({filteredInterviews.length})
                              </h3>
                            </div>
                            {interviewData.length === 0 ? (
                              <>
                                <div className="p-0 flex-1 overflow-hidden">
                                  <div className="text-center py-12 text-muted-foreground">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-trending-up h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                                    >
                                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                      <polyline points="16 7 22 7 22 13"></polyline>
                                    </svg>
                                    <p className="text-sm text-[#67677c]">No interviews found</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {currentPaginatedInterviews.length == 0 ? (
                                  <>
                                    <div className="p-0 flex-1 overflow-hidden">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-trending-up h-10 w-10 mx-auto mb-2 text-[#67677e80]"
                                        >
                                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                          <polyline points="16 7 22 7 22 13"></polyline>
                                        </svg>
                                        <p className="text-sm text-[#67677c]">No interviews found</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="p-0 flex-1 overflow-hidden">
                                      <div
                                        className="max-h-[400px] overflow-auto scroll-smooth [&::-webkit-scrollbar]:w-1
[&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-slate-200
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors"
                                      >
                                        <table className="w-full caption-bottom text-sm">
                                          <thead className="sticky top-0 z-10 ">
                                            <tr className=" transition-colors bg-[#f1f1f9]">
                                              <th className="h-12 !px-4 text-left align-middle font-medium text-muted-foreground bg-muted">
                                                Candidate
                                              </th>
                                              <th className="h-12 !px-4 text-left align-middle font-medium text-muted-foreground bg-muted sm:table-cell">
                                                Vendor
                                              </th>
                                              <th className="h-12 !px-4 text-left align-middle font-medium text-muted-foreground bg-muted">
                                                Status
                                              </th>
                                              <th className="h-12 !px-4 text-left align-middle font-medium text-muted-foreground bg-muted md:table-cell">
                                                Date
                                              </th>
                                              <th className="h-12 !px-4 align-middle font-medium text-muted-foreground text-right bg-muted w-[60px]">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="[&_tr:last-child]:border-0">
                                            {currentPaginatedInterviews.length > 0 ? (
                                              currentPaginatedInterviews.map((intData, idx) => {
                                                // Dynamic Badge Color for Interviews
                                                const status = intData.submission_status || "Unknown";
                                                let badgeClass = "bg-gray-100 text-gray-800 border-gray-200";
                                                if (status.includes("Technical"))
                                                  badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                                                else if (status.includes("Interview"))
                                                  badgeClass = "bg-green-100 text-green-800 border-green-200";
                                                else if (status.includes("Shortlisted"))
                                                  badgeClass = "bg-purple-100 text-purple-800 border-purple-200";

                                                return (
                                                  <tr
                                                    key={idx}
                                                    className="border-b transition-colors hover:bg-muted/50 border-[#e7e7ef] hover:bg-[#f1f1f980]"
                                                  >
                                                    <td className="!p-4 align-middle font-medium text-sm">
                                                      {intData.candidate_full_name}
                                                    </td>
                                                    <td
                                                      className="!p-4 align-middle text-muted-foreground text-xs truncate max-w-[120px] sm:table-cell"
                                                      title={intData.to_email}
                                                    >
                                                      {intData.to_email || "-"}
                                                    </td>
                                                    <td className="!p-4 align-middle">
                                                      <div
                                                        className={`inline-flex items-center rounded-md border !px-2.5 !py-0.5 text-xs font-semibold ${badgeClass}`}
                                                      >
                                                        {status}
                                                      </div>
                                                    </td>
                                                    <td className="!p-4 align-middle text-xs whitespace-nowrap md:table-cell">
                                                      {formatDateNumber(intData.submission_date)}
                                                    </td>
                                                    <td className="!p-4 align-middle text-right">
                                                      <button
                                                        onClick={() =>
                                                          viewEmailPopup(intData.rate_confirmation_id || intData.id)
                                                        } // <--- CHANGE THIS LINE
                                                        className="inline-flex items-center justify-center h-7 w-7 p-0 hover:!text-white hover:!bg-[#3c83f6] rounded-md"
                                                      >
                                                        <Eye className="h-4 w-4 text-primary hover:!text-white" />
                                                      </button>
                                                    </td>
                                                  </tr>
                                                );
                                              })
                                            ) : (
                                              <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                  No interviews found.
                                                </td>
                                              </tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                      {/* Pagination Footer - Right */}
                                      <div className="flex items-center justify-between px-4 py-3 border-t">
                                        <span className="text-sm text-muted-foreground">
                                          Page {interviewsPage} of {totalInterviewPages}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => setInterviewsPage((p) => Math.max(1, p - 1))}
                                            disabled={interviewsPage === 1}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:!text-white hover:!bg-[#3c83f6] h-9 rounded-md px-3 disabled:opacity-50"
                                          >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                          </button>
                                          <button
                                            onClick={() =>
                                              setInterviewsPage((p) => Math.min(totalInterviewPages, p + 1))
                                            }
                                            disabled={interviewsPage === totalInterviewPages}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:!text-white hover:!bg-[#3c83f6] h-9 rounded-md px-3 disabled:opacity-50"
                                          >
                                            Next <ChevronRight className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* --- EMAIL MODAL --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 animate-in fade-in-0">
          <div className="fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] !gap-4 border bg-white p-6 shadow-lg duration-200 animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh]">
            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left pr-8">
              <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <span className="truncate">
                  {isFetchingEmail ? "Loading Email..." : emailContent?.subject || "Email Details"}
                </span>
              </h2>
            </div>

            {/* Content Area */}
            <div className="relative overflow-hidden max-h-[60vh] h-full w-full rounded-md ">
              <div className="h-full w-full max-h-[60vh] overflow-auto">
                {isFetchingEmail ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Fetching email details...</p>
                  </div>
                ) : emailContent ? (
                  // CHECK IF CONTENT IS 'NONE'
                  emailContent.content_type === "none" ? (
                    <div className="flex flex-col items-center justify-center h-60 text-muted-foreground bg-gray-50/50">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Mail className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No Email Content Found</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs text-center ml-0">
                        {emailContent.note || "No email conversation is available for this submission."}
                      </p>
                    </div>
                  ) : emailContent.content_type === "text" ? (
                    // --- NEW: HANDLE TEXT CONTENT ---
                    <div className="p-0 pt-0 text-sm text-gray-800 whitespace-pre-wrap bg-white min-h-[400px]">
                      {emailContent.email_conversation}
                    </div>
                  ) : (
                    // --- EXISTING: HANDLE HTML CONTENT (Default) ---
                    <iframe
                      className="w-full min-h-[60vh] border-0 bg-white block"
                      title="Email Content"
                      sandbox="allow-same-origin"
                      srcDoc={emailContent.email_content_html}
                    />
                  )
                ) : (
                  // FALLBACK ERROR
                  <div className="flex items-center justify-center h-64 text-red-500">
                    Failed to load email content.
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute right-4 top-4 pdfcontrollButtonsPDF w-6 h-6 "
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruiterDetailSheet;
