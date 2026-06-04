import React, { useEffect, useState } from "react";
import {
  Mail,
  AlertTriangle,
  ExternalLink,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useAuth } from "../../authContext";
import { axiosApi } from "../../components";
import AddCandidateGmailModal from "./AddCandidateGmailModal";
import { toast } from "react-toastify";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

export function AIPagination({ currentPage, totalItems, itemsPerPage, onPageChange, hideText }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  if (totalItems < itemsPerPage) {
    return null;
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
      {hideText ? (
        <div />
      ) : (
        <div className="text-xs text-muted-foreground">
          Showing {startItem}-{endItem} of {totalItems}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border successoutlineButtonWhite successoutlineButton p-2 rounded-[10px]"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-sm text-muted-foreground px-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border successoutlineButtonWhite successoutlineButton p-2 rounded-[10px]"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Skeleton({ className = "", ...props }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const i = setInterval(() => setFade((v) => !v), 800);
    return () => clearInterval(i);
  }, []);
  return (
    <div
      className={`rounded-md bg-[#e5e7ebc4] transition-opacity duration-700 ${
        fade ? "opacity-100" : "opacity-60"
      } ${className}`}
      {...props}
    />
  );
}

const RemderDeleteDataModal = ({ show, setShow }) => {
  if (!show) {
    return <></>;
  }
  const candidate_name = show?.data?.candidate_name;
  const candidate_email = show?.selectedMail?.email;
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        style={{ zIndex: "99999" }}
      ></div>
      <div
        className="cg-alert-dialog fixed left-1/2 top-1/2 z-50 w-full max-w-lg
         -translate-x-1/2 -translate-y-1/2
         rounded-[12px] border border-[#e5e7eb] bg-[#ffffff] p-2 shadow-xl scale-95
         animate-in fade-in zoom-in duration-200
         focus:outline-none p-4"
        style={{ zIndex: "999999" }}
      >
        <div className="cg-alert-header mb-4">
          <div className="text-[18px] font-semibold mb-2">Remove Gmail Credentials</div>
          <p className="mt-2 text-[15px] text-[#67677e]">
            Are you sure you want to remove Gmail credentials for
            <strong className="font-medium text-[#111827]"> {candidate_name || ""} </strong>({candidate_email || ""})?
            <br />
            <br />
            Emails will be sent from your Outlook instead.
          </p>
        </div>
        <div className="cg-alert-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => setShow(false)}
            type="button"
            className="successoutlineButtonWhite successoutlineButton border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="cg-alert-action inline-flex h-10 items-center justify-center
             rounded-md bg-[#dc2626]
             px-4 py-2 text-sm font-medium text-[#ffffff]
             transition-colors
             hover:bg-[#b91c1c]
             focus:outline-none focus:ring-2 focus:ring-[#dc2626]"
          >
            Remove
          </button>
        </div>
      </div>
    </>
  );
};

const HowSendFromCandidateWorks = ({ summary, agentType }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3 mt-3">
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[#67677e] hover:!text-[#fff] hover:bg-[#3c83f6]"
      >
        <span className="flex items-center gap-2 text-sm">
          <HelpCircle className="h-4 w-4" />
          How "Send from Candidate" Works
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {/* Content */}
      {open && (
        <div className="rounded-lg border border-[#E5E7EB] bg-[#f1f1f94d] p-4 text-sm space-y-4">
          <div>
            <p className="font-medium text-[#000]">When enabled:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1 text-[#67677e]">
              <li>AI finds a job match for your candidate</li>
              <li>If candidate has Gmail configured → Email sent from candidate&apos;s Gmail</li>
              <li>If not configured → Email sent from your Outlook</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-[#000]">Benefits:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-[#67677e]">
              <li>More personal — comes directly from candidate</li>
              <li>Higher response rates</li>
              <li>Candidate appears proactive</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#000]">Requirements:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-[#67677e]">
              <li>Candidate must have Gmail account</li>
              <li>Candidate must provide App Password</li>
              <li>2-Step Verification must be enabled</li>
            </ul>
          </div>
        </div>
      )}
      {/* Summary */}
      {summary && summary.with_any_configured_gmail > 0 && (
        <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Mail className={`h-4 w-4 ${agentType === "job" ? "text-[#3B82F6]" : "text-[#10B981]"}`} />
            <span className="text-[#6B7280]">
              <strong className="text-[#111827]">{summary.send_enabled}</strong> of {summary.with_any_configured_gmail}{" "}
              configured Gmail(s) enabled for sending
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const CandidateGmailHeader = ({ configData, showAll, setShowAll, setModalOpen, searchQuery, setSearchQuery }) => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 my-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-medium">My Assigned Candidates</span>
          </div>
          <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-[#f3f3fc] text-[#080118]">
            Gmail Ready: {configData?.with_any_configured_gmail || 0}/{configData?.total || 0}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={showAll}
              onClick={() => {
                setShowAll(!showAll);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-1 ring-[#CBD5E1] ${
                showAll ? "bg-[#7c3bed]" : "bg-[#E5E7EB]"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-[#FFFFFF] shadow transition-transform ${
                  showAll ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <label
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer fw-medium text-xs text-[#6B7280] flex items-center gap-1"
            >
              <Users size={12} />
              Show All
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-9 px-2 rounded-[10px] text-sm font-medium text-[#1D4ED8] bg-[#FFFFFF] ring-1 ring-[#93C5FD] hover:bg-[#EFF6FF] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Manual Entry
          </button>
        </div>
      </div>

      {/* Input field now works correctly because parent state is updated via props */}
      <div className="relative flex-1 my-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bigHoverInput form-control py-2 pl-9"
        />
      </div>
    </>
  );
};

// --- Main Component ---

function GmailCredentials({ jobConfig, vendorConfig, recruiter_email }) {
  const [showAll, setShowAll] = useState(false);
  const [candidatesData, setcandidatesData] = useState({});
  const [candidateToAdd, setCandidateToAdd] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({});
  const [deleteMail, setDeleteMail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidatesToMap, setCandidatesToMap] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  let adminEmail = user?.email;
  const isJobAgent = jobConfig?.sendFromCandidate;
  const configData = candidatesData?.summary;
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = candidatesToMap.slice(startIndex, endIndex);

  useEffect(() => {
    if (!searchQuery) {
      setCandidatesToMap(candidatesData?.candidates || []);
      return;
    }
    setCurrentPage(1);
    const query = searchQuery.toLowerCase();
    const filteredCandidates = candidatesData?.candidates.filter((candidate) => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      const candidateName = candidate.candidate_name.toLowerCase();
      const emailMatch = candidate.emails.some((item) => item.email.toLowerCase().includes(query));
      return fullName.includes(query) || candidateName.includes(query) || emailMatch;
    });
    setCandidatesToMap(filteredCandidates);
  }, [searchQuery]);

  useEffect(() => {
    fetchcandidatelist();
    setModalOpen(false);
  }, [showAll]);

  const fetchcandidatelist = () => {
    let payload = {
      action: "get_assigned_candidates",
      requesting_user_email: adminEmail,
      show_all: !!showAll,
    };
    if (recruiter_email) {
      payload.recruiter_email = recruiter_email;
    }
    setLoading(true);
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setcandidatesData(res.data);
        setCandidatesToMap(res.data.candidates || []);
      })
      .catch((err) => {
        console.log(err, "err");
      })
      .finally(() => setLoading(false));
  };

  const toggleEmailAgent = (emailObj) => {
    const key = emailObj.email;
    setToggleLoading((p) => ({ ...p, [key]: true }));
    const payload = {
      action: "toggle_candidate_gmail_send",
      requesting_user_email: adminEmail,
      candidate_email: emailObj.email,
      send_enabled: !emailObj.send_enabled,
    };
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        fetchcandidatelist();
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error);
      })
      .finally(() => {
        setToggleLoading((p) => ({ ...p, [key]: false }));
      });
  };

  const removeCreds = (data) => {
    const emailObj = data?.selectedMail || {};
    const payload = {
      action: "remove_candidate_gmail",
      requesting_user_email: adminEmail,
      candidate_email: emailObj.email,
    };
    setLoading(true);
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        fetchcandidatelist();
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderEmails = (candidate) => {
    const emails = candidate?.emails || [];
    if (!emails?.length) {
      return (
        <div className="space-y-1">
          <span className="text-sm text-[#6b7280]">No emails</span>
        </div>
      );
    }
    return (
      <div className="space-y-1">
        {emails.map((emailObj) => (
          <div key={emailObj.email} className="flex items-center gap-2 text-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                emailObj.email === candidate.preferred_email ? "bg-[#2563eb]" : "bg-[#d1d5db]"
              }`}
            />
            <span className={emailObj.gmail_status === "configured" ? "text-[#111827]" : "text-[#6b7280]"}>
              {emailObj.email}
            </span>
            <span className="text-xs text-[#6b7280]">({emailObj.type})</span>
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "configured":
        return (
          <div className="flex items-center gap-1 px-2 py-[2px] rounded-[100px] border border-[#6EE7B7] bg-[#ECFDF5] text-[#047857] text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </div>
        );
      case "not_configured":
        return (
          <div className="flex items-center gap-1 px-2 py-[2px] rounded-[100px] border border-[#FCD34D] bg-[#FFFBEB] text-[#B45309] text-xs">
            <AlertTriangle className="h-3 w-3" />
            Setup
          </div>
        );
      case "not_gmail":
        return (
          <div className="flex items-center gap-1 px-2 py-[2px] rounded-[100px] border border-[#D1D5DB] bg-[#F9FAFB] text-[#6B7280] text-xs">
            <XCircle className="h-3 w-3" />
            N/A
          </div>
        );
      case "no_email":
      default:
        return <span className="text-xs text-[#9CA3AF]">-</span>;
    }
  };

  const renderCandidatesTable = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    return (
      <div>
        <div className="table-responsive ring-1 ring-[#e7e7ef] rounded-[10px] mb-3">
          <table
            className="table table-hover border-collapse rounded rounded-lg overflow-hidden mb-0 [border:1px_solid_#e5e7eb] pb-0"
            style={{ "--bs-table-hover-bg": "#f1f1f980" }}
          >
            <thead>
              <tr className="bg-[#f1f1f980] [&>th]:bg-[#f1f1f980] [&>th]:px-2 [&>th]:text-left [&>th]:text-[#67677e] [&>th]:py-[15px] [&>th]:[border-bottom:1px_solid_#e5e7eb]">
                <th>Candidate</th>
                <th>Emails</th>
                <th>Status</th>
                <th className="text-center">Send From</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems?.map((item, index) => {
                return (
                  <tr key={index} className="[&>td]:px-2 [&>td]:py-[15px]">
                    <td className="text-[#000]">{item?.candidate_name}</td>
                    <td>{renderEmails(item)}</td>
                    <td>
                      {item?.emails?.map((emailObj) => (
                        <div key={emailObj.email} className="h-6 flex items-center">
                          {getStatusBadge(emailObj.gmail_status)}
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className="space-y-1">
                        {item.emails.map((emailObj) => {
                          let isLoading = toggleLoading[emailObj.email];
                          return (
                            <div key={emailObj.email} className="h-6 flex items-center justify-center">
                              {emailObj.gmail_status === "configured" ? (
                                <button
                                  onClick={() => toggleEmailAgent(emailObj)}
                                  disabled={isLoading}
                                  className={`
                                    relative w-9 h-5 rounded-full transition-colors duration-200
                                    ${emailObj.send_enabled ? (isJobAgent ? "bg-[#3B82F6]" : "bg-[#10B981]") : "bg-[#E5E7EB]"}
                                    ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
                                  `}
                                >
                                  {isLoading ? (
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                      <Loader2 className="h-3 w-3 text-white animate-spin" />
                                    </span>
                                  ) : (
                                    <span
                                      className={`
                                        absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white
                                        transition-transform duration-200
                                        ${emailObj.send_enabled ? "translate-x-4" : "translate-x-0"}
                                      `}
                                    />
                                  )}
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        {item.emails.map((emailObj) => (
                          <div key={emailObj.email} className="h-6 flex items-center justify-end">
                            {emailObj.gmail_status === "configured" ? (
                              <div className="flex items-center gap-1">
                                <div
                                  onClick={() => {
                                    setModalOpen(true);
                                    setCandidateToAdd({ data: item, selectedMail: emailObj });
                                  }}
                                  className="px-2 py-1 flex items-center justify-center cursor-pointer text-[#6b7280] hover:text-[#fff] hover:!bg-[#3B82F6] rounded-[6px]"
                                >
                                  <Edit size={16} />
                                </div>
                                <div
                                  onClick={() => setDeleteMail({ data: item, selectedMail: emailObj })}
                                  className="px-2 py-1 flex items-center justify-center cursor-pointer text-[#ef4444] hover:text-[#b91c1c] hover:bg-[#fee2e2] rounded-[6px]"
                                >
                                  <Trash2 size={16} />
                                </div>
                              </div>
                            ) : emailObj.gmail_status === "not_configured" && emailObj.can_configure ? (
                              <div
                                onClick={() => {
                                  setModalOpen(true);
                                  setCandidateToAdd({ data: item, selectedMail: emailObj });
                                }}
                                className={`h-6 px-2 flex items-center text-xs cursor-pointer rounded ${
                                  isJobAgent
                                    ? "text-[#2563eb] hover:text-[#1d4ed8] hover:bg-[#eff6ff]"
                                    : "text-[#059669] hover:text-[#047857] hover:bg-[#ecfdf5]"
                                }`}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </div>
                            ) : (
                              <span className="text-xs text-[#9ca3af]">-</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <AIPagination
            currentPage={currentPage}
            totalItems={candidatesToMap.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
        {candidatesToMap.length ? (
          <div className="flex items-center gap-4 text-xs text-[#6B7280]">
            <span className="font-medium text-[#374151]">Legend:</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
              Preferred for sending
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
              Ready
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-[#F59E0B]" />
              Needs Setup
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-[#9CA3AF]" />
              Not Gmail
            </span>
          </div>
        ) : (
          <></>
        )}
        <HowSendFromCandidateWorks />
      </div>
    );
  };

  const descriptionText =
    jobConfig?.sendFromCandidate && vendorConfig?.sendFromCandidate
      ? "Used by both Job Matching and Vendor Outreach agents."
      : jobConfig?.sendFromCandidate
        ? "Used by Job Matching agent."
        : "Used by Vendor Outreach agent.";

  return (
    <div className="rounded-xl ring-2 ring-[#ede9fe] bg-gradient-to-br from-violet-50/50 to-purple-50/50 p-3 ">
      <div className="mb-4">
        <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-[#6d28d9]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <Mail className="h-5 w-5 text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold">Candidate Gmail Credentials</h2>
        </div>
        <p className="mt-2 text-sm text-[#67677e]">
          Manage Gmail credentials for sending emails on behalf of candidates. {descriptionText}
        </p>
      </div>
      <div className="p-3 rounded-lg bg-[#fffbeb] ring-1 ring-[#fde68a]">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-[#D97706] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-[#92400E]">Gmail App Password Required</p>
            <ul className="list-disc pl-3 mt-1 text-[#B45309] space-y-1">
              <li>Only Gmail is supported at the moment</li>
              <li>Candidate must enable 2-Step Verification</li>
              <li>Candidate must generate an App Password</li>
            </ul>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-[#B45309] hover:text-[#78350F] underline-offset-4 bg-transparent hover:underline"
              onClick={() => window.open("https://support.google.com/accounts/answer/185833", "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
              How to Generate App Password
            </button>
          </div>
        </div>
      </div>

      <CandidateGmailHeader
        configData={configData}
        showAll={showAll}
        setShowAll={setShowAll}
        setModalOpen={setModalOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {renderCandidatesTable()}

      <AddCandidateGmailModal
        recruiter_email={recruiter_email}
        open={modalOpen}
        onOpenChange={() => {
          setModalOpen(false);
          setCandidateToAdd(false);
        }}
        onSave={fetchcandidatelist}
        preselectedData={candidateToAdd}
      />
      <RemderDeleteDataModal
        show={deleteMail}
        setShow={(val) => {
          if (val == true) {
            removeCreds(deleteMail);
          }
          setDeleteMail(false);
        }}
      />
    </div>
  );
}

export default GmailCredentials;
