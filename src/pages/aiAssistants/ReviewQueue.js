import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  XCircle,
  Inbox,
  Check,
  X,
  Clock,
  User,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  Eye,
  Loader2,
} from "lucide-react";
import { axiosApi } from "../../components";
import { useAuth } from "../../authContext";
import { Skeleton } from "./GmailCredentials";
import { toast } from "react-toastify";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

const ReviewTabComponent = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const [expandedCards, setExpandedCards] = useState([]);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [allAPIData, setsetAllAPIData] = useState({});
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setrejectLoading] = useState(false);
  const [approveLoading, setapproveLoading] = useState(false);
  const REVIEW_RECORDS_PER_PAGE = 10;

  const { user } = useAuth();
  let adminEmail = user.email;

  useEffect(() => {
    getReviewData();
    setRejectReason("");
  }, [filter]);

  const getReviewData = () => {
    const payload = {
      action: "get_pending_submissions",
      requesting_user_email: adminEmail,
    };

    if (filter != "all") {
      payload.agent_type = filter;
    }

    setReviewLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setsetAllAPIData(res?.data);
        setSubmissions(res?.data?.submissions);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setReviewLoading(false);
      });
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (reviewSearchQuery) {
        const query = reviewSearchQuery.toLowerCase();
        return (
          submission.job_title.toLowerCase().includes(query) ||
          submission.client_name.toLowerCase().includes(query) ||
          submission.candidate_name.toLowerCase().includes(query) ||
          submission.client_email.toLowerCase().includes(query) ||
          submission.matching_skills.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [submissions, reviewSearchQuery]);

  // Paginate submissions
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (reviewCurrentPage - 1) * REVIEW_RECORDS_PER_PAGE;
    const endIndex = startIndex + REVIEW_RECORDS_PER_PAGE;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, reviewCurrentPage]);

  // Calculate total pages
  const reviewTotalPages = Math.ceil(filteredSubmissions.length / REVIEW_RECORDS_PER_PAGE);

  const formatDistanceToNow = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      }
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const handleApprove = (submissionId) => {
    setProcessingIds([...processingIds, submissionId]);

    const payload = {
      action: "approve_submission",
      requesting_user_email: adminEmail,
      submission_id: submissionId,
    };

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Submission approved");
        setSelectedIds(selectedIds.filter((id) => id !== submissionId));
        getReviewData();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Failed to approve");
      })
      .finally(() => {
        setProcessingIds(processingIds.filter((id) => id !== submissionId));
      });
  };

  const handleReject = () => {
    if (!rejectingId || !rejectReason.trim()) return;

    setProcessingIds([...processingIds]);
    setrejectLoading(true);
    const payload = {
      action: "reject_submission",
      requesting_user_email: adminEmail,
      submission_id: rejectingId,
      reason: rejectReason,
    };

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Submissions rejected");
        setSelectedIds(selectedIds.filter((id) => id !== rejectingId));
        setRejectModalOpen(false);
        setRejectingId(null);
        setRejectReason("");
        getReviewData();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Failed to reject");
      })
      .finally(() => {
        setrejectLoading(false);
        setProcessingIds(processingIds.filter((id) => id !== rejectingId));
      });
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;

    setProcessingIds([...processingIds, ...selectedIds]);

    const payload = {
      action: "bulk_approve",
      requesting_user_email: adminEmail,
      submission_ids: selectedIds,
    };

    setapproveLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Submissions approved");
        setSelectedIds([]);
        getReviewData();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Failed to approve");
      })
      .finally(() => {
        setapproveLoading(false);
        setProcessingIds([]);
      });
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0 || !rejectReason.trim()) return;
    setProcessingIds([...processingIds, ...selectedIds]);
    setrejectLoading(true);

    const payload = {
      action: "bulk_reject",
      requesting_user_email: adminEmail,
      submission_ids: [selectedIds],
      reason: rejectReason,
    };

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Submissions rejected");
        setSelectedIds([]);
        setBulkRejectModalOpen(false);
        setRejectReason("");
        getReviewData();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Failed to reject");
      })
      .finally(() => {
        setProcessingIds([]);
        setrejectLoading(false);
      });
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Reject Modals */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Reject Submission</h3>
            <p className="mb-2 text-[#67677e]">Please provide a reason for rejecting this submission.</p>

            <textarea
              value={rejectReason}
              onChange={(val) => {
                setRejectReason(val.target.value);
              }}
              placeholder="Enter rejection reason..."
              rows={3}
              className="form-control bigHoverInput"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-4 py-2 border rounded-lg bg-transparent hover:!bg-[#3c83f6] hover:text-[#fff]"
                onClick={() => {
                  setRejectReason("");
                  setRejectModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason || rejectLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                onClick={() => handleReject(rejectingId)}
              >
                {rejectLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkRejectModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Reject {selectedIds.length} Submissions</h3>
            <p className="mb-2 text-[#67677e]">Please provide a reason for rejecting these submissions.</p>

            <textarea
              value={rejectReason}
              onChange={(val) => {
                setRejectReason(val.target.value);
              }}
              placeholder="Enter rejection reason..."
              rows={3}
              className="form-control bigHoverInput"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-4 py-2 border rounded-lg bg-transparent hover:!bg-[#3c83f6] hover:text-[#fff]"
                onClick={() => {
                  setRejectReason("");
                  setBulkRejectModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason || rejectLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                onClick={handleBulkReject}
              >
                {rejectLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <> Reject {selectedIds.length} </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Select */}
          <div className="relative w-40">
            <select
              value={filter}
              onChange={(e) => {
                setReviewCurrentPage(1);
                setFilter(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ borderColor: "#e9d5ff" }}
            >
              <option value="all">All Agents</option>
              <option value="job_matching">Job Matching</option>
              <option value="vendor_outreach">Vendor Outreach</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate, job, client..."
              value={reviewSearchQuery}
              onChange={(e) => {
                setReviewCurrentPage(1);
                setReviewSearchQuery(e.target.value);
              }}
              className="pl-9 pr-10 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              style={{ borderColor: "#e9d5ff" }}
            />
            {reviewSearchQuery && (
              <button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 flex items-center justify-center hover:!bg-[#3c83f6] hover:!text-[#fff] text-gray-500 bg-transparent rounded-circle"
                onClick={() => {
                  setReviewCurrentPage(1);
                  setReviewSearchQuery("");
                }}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {submissions.length > 0 && (
          <span className="text-sm text-gray-500">
            {filteredSubmissions.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {reviewLoading ? (
        <div className="space-y-4 p-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : submissions.length == 0 ? (
        <div className="py-12 border-2 border-dashed rounded-lg text-center" style={{ borderColor: "#e9d5ff" }}>
          <div className="flex flex-col align-items-center justify-content-center">
            <div
              className="flex h-16 w-16 align-items-center justify-content-center rounded-2xl mb-2"
              style={{ backgroundColor: "#f3e8ff" }}
            >
              <Inbox className="h-8 w-8" style={{ color: "#8b5cf6" }} />
            </div>
            <h3 className="text-[18px] font-semibold">No pending submissions</h3>
            <p className="text-gray-600 mx-auto mt-0 text-[16px]">
              Your AI agents haven't generated any submissions that need review yet.
            </p>
          </div>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-12 border-2 border-dashed rounded-lg text-center" style={{ borderColor: "#e9d5ff" }}>
          <div className="flex flex-col items-center justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ backgroundColor: "#f3e8ff" }}
            >
              <Search className="h-8 w-8" style={{ color: "#8b5cf6" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matching submissions</h3>
            <p className="text-gray-500">Try adjusting your search query.</p>
            <button
              className="mt-4 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              onClick={() => setReviewSearchQuery("")}
            >
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="border rounded-lg p-3" style={{ borderColor: "#ede9fe" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedSubmissions.length && paginatedSubmissions.length > 0}
                  onChange={() =>
                    selectedIds.length === paginatedSubmissions.length
                      ? setSelectedIds([])
                      : setSelectedIds(paginatedSubmissions.map((s) => s.submission_id))
                  }
                  className="round-checkbox"
                  style={{ accentColor: "#8b5cf6" }}
                />
                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 text-sm rounded-[10px] flex items-center gap-1 disabled:opacity-50 bg-[#fff] ring-1 ring-[#a7f3d0] text-[#0c9568] hover:!bg-[#ecfdf5]"
                    onClick={handleBulkApprove}
                    disabled={processingIds.length > 0 || approveLoading}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    className="px-3 py-2 text-sm rounded-[10px] flex items-center gap-1 disabled:opacity-50 bg-[#fff] ring-1 ring-[#fecaca] text-[#dc2626] hover:!bg-[#fef2f2]"
                    onClick={() => setBulkRejectModalOpen(true)}
                    disabled={processingIds.length > 0}
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submission Cards */}
          <div className="space-y-4">
            {paginatedSubmissions.map((submission, index) => {
              const isProcessing = processingIds.includes(submission.submission_id);
              const isExpanded = expandedCards.includes(submission.submission_id);
              const isJobMatching = submission.agent_type == "job_matching";

              // console.log(submission?.submission_status, "submission");

              return (
                <div
                  key={index}
                  className={`transition-all ring-2 ${isJobMatching ? "ring-[#dbeafe] hover:!ring-[#bfdbfe]" : "ring-[#d1fae5] hover:!ring-[#baf5d7]"} rounded-lg md:!p-[22px] p-[16px] bg-white ${isProcessing ? "!opacity-40" : ""}`}
                >
                  <div className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(submission.submission_id)}
                          onChange={() =>
                            selectedIds.includes(submission.submission_id)
                              ? setSelectedIds(selectedIds.filter((id) => id !== submission.submission_id))
                              : setSelectedIds([...selectedIds, submission.submission_id])
                          }
                          disabled={isProcessing}
                          className="round-checkbox"
                          style={{ accentColor: "#8b5cf6" }}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap fw-semibold">
                            {/* Badge 1 */}
                            <span
                              className="px-3 py-1 text-xs rounded-[100px] flex items-center gap-1 text-white"
                              style={{ backgroundColor: isJobMatching ? "#3b82f6" : "#10b981" }}
                            >
                              {isJobMatching ? (
                                <>
                                  <Briefcase className="h-3 w-3" /> Job
                                </>
                              ) : (
                                <>
                                  <Building2 className="h-3 w-3" /> Vendor
                                </>
                              )}
                            </span>

                            {/* Badge 2 */}
                            <span
                              className="px-3 py-1 text-xs border rounded-[100px] flex items-center gap-1"
                              style={{
                                color: "#92400e",
                                borderColor: "#fbbf24",
                                backgroundColor: "#fffbeb",
                              }}
                            >
                              <Clock className="h-3 w-3" /> Pending
                            </span>

                            {/* Badge 3 */}
                            <span className="px-3 py-1 text-xs rounded-[100px] flex items-center gap-1 text-[#6d28d9] bg-[#f3e8ff]">
                              {submission.match_score}% match
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold">{submission.job_title}</h3>
                          {submission.client_name ? (
                            <p className="text-sm text-gray-500 m-0">at {submission.client_name}</p>
                          ) : (
                            <></>
                          )}{" "}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatDistanceToNow(submission.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pl-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#67677e]" />
                        <strong>Candidate:</strong> {submission.candidate_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#67677e]" />
                        <strong>To:</strong> {submission.recruiter_email}
                      </div>
                    </div>

                    {submission.matching_skills && (
                      <div className="flex flex-wrap gap-1">
                        {submission.matching_skills.split(",").map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs text-[#6d28d9] rounded-[100px] bg-[#f5f3ff] fw-semibold"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Collapsible Section */}
                    <div>
                      <button
                        className="w-full flex items-center justify-center gap-2 text-sm py-2 hover:!bg-gray-200 bg-transparent rounded-lg text-[#6d28d9] fw-medium"
                        onClick={() =>
                          expandedCards.includes(submission.submission_id)
                            ? setExpandedCards(expandedCards.filter((id) => id !== submission.submission_id))
                            : setExpandedCards([...expandedCards, submission.submission_id])
                        }
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" /> Hide Reasoning
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" /> View Reasoning
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div
                          className="mt-2 p-3 rounded-lg text-sm border"
                          style={{
                            backgroundColor: "#f5f3ff",
                            borderColor: "#ede9fe",
                          }}
                        >
                          {submission.match_reasoning}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-top">
                      <button
                        className="border successoutlineButtonWhite successoutlineButton rounded-[10px] px-3 py-2"
                        disabled={isProcessing}
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                      <button
                        className="px-3 py-2 text-sm rounded-[10px] flex items-center gap-1 disabled:opacity-50 bg-[#fff] ring-1 ring-[#fecaca] text-[#dc2626] hover:!bg-[#fef2f2]"
                        onClick={() => {
                          setRejectingId(submission.submission_id);
                          setRejectModalOpen(true);
                        }}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                      <button
                        className="px-3 py-2 text-sm text-white rounded-[10px] flex items-center gap-1 disabled:opacity-50 bg-[#10b981] hover:!bg-[#0c9568]"
                        onClick={() => handleApprove(submission.submission_id)}
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {reviewTotalPages > 1 && (
            <div className="flex items-center justify-between pt-3 w-100">
              <div className="text-sm text-gray-500 mx-0">
                Showing {(reviewCurrentPage - 1) * REVIEW_RECORDS_PER_PAGE + 1} -{" "}
                {Math.min(reviewCurrentPage * REVIEW_RECORDS_PER_PAGE, filteredSubmissions.length)} of{" "}
                {filteredSubmissions.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="successoutlineButtonWhite successoutlineButton"
                  onClick={() => setReviewCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={reviewCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-500 px-2">
                  Page {reviewCurrentPage} of {reviewTotalPages}
                </span>
                <button
                  className="successoutlineButton successoutlineButtonWhite"
                  onClick={() => setReviewCurrentPage((p) => Math.min(reviewTotalPages, p + 1))}
                  disabled={reviewCurrentPage === reviewTotalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewTabComponent;
