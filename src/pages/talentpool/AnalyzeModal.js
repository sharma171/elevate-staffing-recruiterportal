import { useEffect, useState } from "react";
import {
  Eye,
  TrendingUp,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Users,
  Building2,
  DollarSign,
  Code,
  CalendarClock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { OverlayModal } from "../../components";
import { useAuth } from "../../authContext";
import api from "../../networking/api";

const ITEMS_PER_PAGE = 10;

export const EmailPreviewModal = ({ open, onClose, loading, error, emailContent }) => {
  if (!open) return null;

  const renderEmailContent = (emailData) => {
    if (!emailData) return null;

    if (emailData.content_type === "html" && emailData.email_content_html) {
      return (
        <iframe
          srcDoc={emailData.email_content_html}
          className="w-full min-h-[400px] border-0 rounded-md bg-[#ffffff]"
          sandbox="allow-same-origin"
          title="Email Content"
        />
      );
    } else if (emailData.content_type === "text" && emailData.email_conversation) {
      return (
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap text-[#080118]"
          dangerouslySetInnerHTML={{
            __html: emailData.email_conversation
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi, (url) => {
                const href = url.startsWith("http") ? url : `https://${url}`;
                return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#7c3bed] hover:underline">${url}</a>`;
              })

              // Make emails clickable
              .replace(
                /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi,
                '<a href="mailto:$1" class="text-[#7c3bed] hover:underline">$1</a>',
              )

              // Make phone numbers clickable
              .replace(/(\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g, (phone) => {
                const clean = phone.replace(/[\s().-]/g, "");
                return `<a href="tel:${clean}" class="text-[#7c3bed] hover:underline">${phone}</a>`;
              })

              // Convert newlines to <br>
              .replace(/\n/g, "<br>"),
          }}
        />
      );
    } else {
      return (
        <div className="text-center py-8 text-[#67677e]">
          <Mail className="h-8 w-8 mx-auto mb-2 text-[#9ca3af]" />
          <p>No email content available</p>
          {emailData.note && <p className="text-sm mt-2">{emailData.note}</p>}
        </div>
      );
    }
  };

  return (
    <div className="signatureContainer">
      <div className="fixed inset-0 p-2 z-60 bg-black/50 flex items-center justify-center">
        <div className="w-full max-w-3xl max-h-[86vh] bg-[#ffffff] rounded-lg shadow-2xl flex flex-col overflow-hidden p-3">
          <div className="pb-1 border-b border-[#e5e7eb] flex justify-between items-center w-100">
            <div className="flex items-center gap-2 w-[90%]">
              <Mail className="h-5 w-5 text-[#7c3bed] shrink-0" />
              {loading ? (
                <div className="h-5 w-48 bg-[#f3f4f6] rounded" />
              ) : emailContent?.subject ? (
                <h3 title={emailContent.subject} className="text-lg font-semibold text-[#080118] truncate">
                  {emailContent.subject}
                </h3>
              ) : (
                <h3 className="text-lg font-semibold text-[#080118]">Email Content</h3>
              )}
            </div>
            <button onClick={onClose} className="hidemodalclosebtn pdfcontrollButtonsPDF">
              <X className="h-5 w-5 text-[#67677e]" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 w-full bg-[#f3f4f6] rounded" />
                <div className="h-4 w-3/4 bg-[#f3f4f6] rounded" />
                <div className="h-4 w-5/6 bg-[#f3f4f6] rounded" />
                <div className="h-32 w-full bg-[#f3f4f6] rounded-lg" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-[#67677e] mb-4" />
                <p className="text-[#67677e] font-medium">Failed to load email</p>
                <p className="text-[#67677e] text-sm mt-2">{error}</p>
              </div>
            ) : emailContent ? (
              <div className="max-h-[60vh] overflow-auto pr-4">{renderEmailContent(emailContent)}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateAnalysisSheet = ({ isModalActive, setIsModalActive }) => {
  const [activeTab, setActiveTab] = useState("recent");
  const [historyPage, setHistoryPage] = useState(1);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [emailContent, setEmailContent] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const candidateName = `${isModalActive?.first_name || ""} ${isModalActive?.last_name || ""}`;

  const [analysisData, setAnalysisData] = useState({
    summary: {},
    details: { submissions_by_status: [], submissions_history: [] },
  });

  const { user } = useAuth();
  const admin_email = user?.email;

  const candidateEmail = isModalActive?.original_email;

  useEffect(() => {
    if (candidateEmail) {
      const payload = {
        emailid: admin_email,
        primary_email: candidateEmail,
      };
      setIsLoading(true);
      api
        .CandidateAnalysis(payload)
        .then((res) => {
          console.log(res, "ssssssss");
          setIsLoading(false);
          setAnalysisData(structuredClone(res));
        })
        .catch((err) => {
          setIsModalActive(false);
          setIsLoading(false);
          toast.error(err.error || err.message || "Something went wrong");
        });
    } else {
      setHistoryPage(1);
      setActiveTab("recent");
    }
  }, [candidateEmail]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const STATUS_BADGE_CONFIG = {
    shortlisted: { bg: "#dcfce7", text: "#166534" },
    "not shortlisted": { bg: "#fee2e2", text: "#b91c1c" },
    rejected: { bg: "#fee2e2", text: "#b91c1c" },
    submitted: { bg: "#fef9c3", text: "#854d0e" },
    "submitted to vendor": { bg: "#fef9c3", text: "#a16207" },
    "under review": { bg: "#e0f2fe", text: "#075985" },
    "technical screening": { bg: "#f3e8ff", text: "#6b21a8" },
    "interview round 1": { bg: "#e0e7ff", text: "#3730a3" },
    "interview round 2": { bg: "#e0e7ff", text: "#3730a3" },
    "interview round 3": { bg: "#e0e7ff", text: "#3730a3" },
    "Client Round": { bg: "#e0e7ff", text: "#261e8c" },
    "interview rejected": { bg: "#fee2e2", text: "#b91c1c" },
  };

  const DEFAULT_BADGE_STYLE = { bg: "#f3f4f6", text: "#374151" };

  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase();

    const matchedKey = Object.keys(STATUS_BADGE_CONFIG).find((key) => statusLower.includes(key));

    const style = matchedKey ? STATUS_BADGE_CONFIG[matchedKey] : DEFAULT_BADGE_STYLE;

    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {status}
      </span>
    );
  };

  const handleViewEmail = async (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setEmailContent(null);
    setEmailError(null);
    setEmailLoading(true);
    setEmailModalOpen(true);

    try {
      const API_URL = "https://fetch-candidate-analysis-v3-305451280005.us-east1.run.app";
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: admin_email,
          task: "get_email_content",
          submission_id: submissionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch email content");
      }

      const data = await response.json();
      setEmailContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch email content";
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  if (!isModalActive) return null;

  const renderTabsAndDetails = () => {
    const tabsConfig = [
      {
        key: "recent",
        label: "Recent Submissions",
        data: analysisData.details.recent_submissions || [],
        page: historyPage,
        setPage: setHistoryPage,
        showSubmittedBy: false,
        emptyState: false,
      },
      {
        key: "interviews",
        label: "Interviews",
        data: analysisData.details.all_interviews || [],
        page: historyPage,
        setPage: setHistoryPage,
        showSubmittedBy: false,
        emptyState: true,
      },
      {
        key: "history",
        label: "Full History",
        data: analysisData.details.submissions_history || [],
        page: historyPage,
        setPage: setHistoryPage,
        showSubmittedBy: true,
        emptyState: false,
      },
    ];

    const renderTable = (config) => {
      const totalItems = config.data.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const startIdx = (config.page - 1) * ITEMS_PER_PAGE;
      const paginatedItems = config.data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

      if (!config.data?.length) {
        return (
          <div className="text-center py-8 text-[#67677e]">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No interview records found</p>
          </div>
        );
      }

      return (
        <>
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] nowrap">
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Vendor Email</th>
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Client</th>
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Rate</th>
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Status</th>
                  {config.showSubmittedBy && (
                    <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Submitted By</th>
                  )}
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e]">Date</th>
                  <th className="text-left px-3 py-3 font-semibold text-[#67677e] w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                    <td className="px-3 py-3 text-[#67677e] fw-medium max-w-[200px] truncate" title={item.submitted_to}>
                      {item.submitted_to}
                    </td>
                    <td className="px-3 py-3 font-medium text-[#080118]">{item.client_name}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium nowrap">{item.rate}</div>
                    </td>
                    <td className="px-3 py-3 nowrap">{getStatusBadge(item.submission_status)}</td>
                    {config.showSubmittedBy && (
                      <td className="px-3 py-3 text-[#67677e] fw-medium">{item.submitted_by.split("@")[0]}</td>
                    )}
                    <td className="px-3 py-3 text-[#67677e] nowrap fw-medium">{formatDate(item.submission_date)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleViewEmail(item.id)}
                        className="text-[#000] bg-transparent hover:!bg-[#3c83f6] hover:!text-[#fff] p-1 px-2 rounded"
                        title="View Email"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e7eb]">
              <span className="text-sm text-[#67677e]">
                Showing {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, totalItems)} of {totalItems}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => config.setPage((p) => Math.max(1, p - 1))}
                  disabled={config.page === 1}
                  className={`p-2 rounded-md border border-[#d1d5db] flex items-center justify-center ${
                    config.page === 1
                      ? "bg-[#f3f4f6] cursor-not-allowed"
                      : "bg-[#ffffff] cursor-pointer hover:bg-[#f9fafb]"
                  }`}
                >
                  <ChevronLeft className={`h-4 w-4 ${config.page === 1 ? "text-[#9ca3af]" : "text-[#374151]"}`} />
                </button>
                <span className="text-sm text-[#374151]">
                  Page {config.page} of {totalPages}
                </span>
                <button
                  onClick={() => config.setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={config.page === totalPages}
                  className={`p-2 rounded-md border border-[#d1d5db] flex items-center justify-center ${
                    config.page === totalPages
                      ? "bg-[#f3f4f6] cursor-not-allowed"
                      : "bg-[#ffffff] cursor-pointer hover:bg-[#f9fafb]"
                  }`}
                >
                  <ChevronRight
                    className={`h-4 w-4 ${config.page === totalPages ? "text-[#9ca3af]" : "text-[#374151]"}`}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      );
    };

    return (
      <div>
        <div className="grid grid-cols-3 bg-[#f3f4f6] rounded-lg p-1 mb-3">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setHistoryPage(1);
                  setActiveTab(tab.key);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer ${
                  isActive ? "bg-[#ffffff] text-[#080118] shadow-sm" : "bg-transparent text-[#67677e]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {tabsConfig.map(
          (tab) =>
            activeTab === tab.key && (
              <div key={tab.key} className="border border-[#e5e7eb] rounded-lg bg-[#ffffff] shadow-sm overflow-hidden">
                {renderTable(tab)}
              </div>
            ),
        )}
      </div>
    );
  };

  return (
    <OverlayModal
      modalStyle={{ background: "#fff", padding: "10px 25px 25px 25px" }}
      isActive={isModalActive}
      onClose={setIsModalActive}
    >
      <div className="signatureContainer">
        <div>
          <div>
            {/* Header */}
            <div className="d-flex gap-2 justify-content-between pb-3 border-bottom">
              <div className="flex items-center gap-2">
                <TrendingUp size={19} className="h-5 w-5 text-[#7c3bed]" />
                <h2 className="font-bold text-[#080118]" style={{ fontSize: "19px" }}>
                  Candidate Analysis: {candidateName}
                </h2>
              </div>

              <button
                onClick={() => setIsModalActive(false)}
                type="button"
                className="hidemodalclosebtn pdfcontrollButtonsPDF"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-[calc(100vh-120px)] overflow-auto">
                <div className="px-2 pt-3">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      <div className="h-32 w-full bg-[#f3f4f6] rounded-lg mb-4" />
                      <div className="h-8 w-48 bg-[#f3f4f6] rounded mb-4" />
                      <div className="h-64 w-full bg-[#f3f4f6] rounded-lg" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                      <AlertCircle className="h-12 w-12 text-[#67677e] mb-4" />
                      <p className="text-[#67677e] font-medium">Failed to load analysis</p>
                      <p className="text-[#67677e] text-sm mt-2">{error}</p>
                    </div>
                  ) : analysisData ? (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { icon: FileText, label: "Total Submissions", value: analysisData.summary.total_submissions },
                          { icon: Users, label: "Total Interviews", value: analysisData.summary.total_interviews },
                          { icon: Briefcase, label: "Status", value: analysisData.summary.current_status || "N/A" },
                          {
                            icon: Calendar,
                            label: "Last Submission",
                            value: formatDate(analysisData.summary.last_submission_date),
                          },
                        ].map((card, idx) => (
                          <div key={idx} className="border border-[#e5e7eb] rounded-lg bg-[#ffffff] shadow-sm p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <card.icon className="h-4 w-4 text-[#67677e]" />
                              <span className="text-sm text-[#67677e]">{card.label}</span>
                            </div>
                            <p className={`font-bold text-xl text-[#080118]`}>{card.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Candidate Info */}
                      <div className="border border-[#e5e7eb] rounded-lg bg-[#ffffff] shadow-sm overflow-hidden p-3">
                        <h3 className="text-base font-semibold text-[#080118] flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          Candidate Information
                        </h3>

                        <div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-[#67677e] shrink-0" />
                                <span className="text-[#67677e] shrink-0">Primary:</span>
                                <span className="font-medium truncate text-[#080118]">
                                  {analysisData.summary.primary_email}
                                </span>
                              </div>
                              {analysisData.summary.secondary_email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-[#67677e] shrink-0" />
                                  <span className="text-[#67677e] shrink-0">Secondary:</span>
                                  <span className="font-medium truncate text-[#080118]">
                                    {analysisData.summary.secondary_email}
                                  </span>
                                </div>
                              )}

                              {analysisData.summary.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-[#67677e] shrink-0" />
                                  <span className="text-[#67677e] shrink-0">Phone:</span>
                                  <span className="font-medium truncate text-[#080118]">
                                    {analysisData.summary.phone}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-[#67677e] shrink-0" />
                                <span className="text-[#67677e] shrink-0">Company:</span>
                                <span className="font-medium truncate text-[#080118]">
                                  {analysisData.summary.onboarded_company || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-[#67677e] shrink-0" />
                                <span className="text-[#67677e] shrink-0">Recruiter:</span>
                                <span className="font-medium truncate text-[#080118]">
                                  {analysisData.summary.assigned_recruiter || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-[1000px] fw-semibold text-xs font-semibold ${analysisData.summary.priority === "High" ? "bg-[#ef4444] text-[#fff] border border-[#fecaca]" : "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db]"}`}
                                >
                                  {analysisData.summary.priority || "Normal"} Priority
                                </span>
                                <span className="px-2 py-0.5 rounded-[1000px] fw-semibold text-xs font-semibold border border-[#d1d5db] text-[#374151]">
                                  {analysisData.summary.visa_status || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 min-w-0">
                              <div className="flex items-start gap-2 text-sm">
                                <Code className="h-4 w-4 text-[#67677e] mt-0.5 shrink-0" />
                                <span className="text-[#67677e] shrink-0">Technology:</span>
                                <div className="flex flex-wrap gap-1">
                                  {analysisData?.summary?.primary_technologies?.length ? (
                                    analysisData.summary.primary_technologies.map((tech, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md text-xs font-semibold border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[#7c3bed]"
                                      >
                                        {tech}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="font-medium text-[#67677e]">N/A</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CalendarClock className="h-4 w-4 text-[#67677e] shrink-0" />
                                <span className="text-[#67677e] shrink-0">Last Interview:</span>
                                <span className="font-medium text-[#080118]">
                                  {formatDate(analysisData.summary.last_interview_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Summary */}
                      <div className="border border-[#e5e7eb] rounded-lg bg-[#ffffff] shadow-sm overflow-hidden p-3">
                        <h3 className="text-base font-semibold text-[#080118] mb-2">Submissions by Status</h3>

                        <div className="flex flex-wrap gap-2">
                          {analysisData.details.submissions_by_status.map((status, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#f3f4f6] rounded-lg px-3 py-2">
                              {getStatusBadge(status.submission_status)}
                              <span className="font-bold text-base text-[#080118]">{status.status_count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tabs */}
                      {renderTabsAndDetails()}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Modal */}
        <EmailPreviewModal
          open={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          loading={emailLoading}
          error={emailError}
          emailContent={emailContent}
        />
      </div>
    </OverlayModal>
  );
};

export default CandidateAnalysisSheet;
