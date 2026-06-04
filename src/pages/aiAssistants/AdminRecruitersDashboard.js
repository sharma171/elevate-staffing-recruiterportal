import { useState, useEffect } from "react";
import {
  Search,
  Link2,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "./GmailCredentials";
import { axiosApi } from "../../components";
import { useAuth } from "../../authContext";
import ConfigPopup from "./ConfigPopup";
import PremiumSelect from "../../components/PremiumSelect";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

const getPaginationPages = (currentPage, totalPages) => {
  const delta = 1;
  const pages = [];

  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("...");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

const AdminRecruitersDashboard = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminLoading, setAdminLoading] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const ADMIN_RECORDS_PER_PAGE = 10;

  const { user } = useAuth();
  let adminEmail = user?.email;
  // adminEmail = "marketing@4spheresolutions.com";

  // Calculate stats
  const connectedCount = recruiters.filter((r) => r.is_connected).length;
  const jobMatchingActive = recruiters.filter((r) => r.job_matching_enabled).length;
  const vendorOutreachActive = recruiters.filter((r) => r.vendor_outreach_enabled).length;

  useEffect(() => {
    getlistApiData();
  }, [adminEmail]);

  const getlistApiData = () => {
    const payload = {
      action: "list_all_configs",
      requesting_user_email: adminEmail,
    };

    setAdminLoading(true);
    setAdminCurrentPage(1);
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setRecruiters(res.data.recruiters);
      })
      .catch((err) => {
        console.log(err?.response?.data?.error || "Failed to disconnect email");
      })
      .finally(() => {
        setAdminLoading(false);
      });
  };

  // Filter recruiters based on search and connection filter
  const filteredRecruiters = recruiters.filter((recruiter) => {
    const matchesSearch =
      searchQuery === "" ||
      recruiter.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruiter.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruiter.recruiter_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConnection =
      connectionFilter === "all" ||
      (connectionFilter === "connected" && recruiter.is_connected) ||
      (connectionFilter === "not_connected" && !recruiter.is_connected);

    return matchesSearch && matchesConnection;
  });

  // Calculate pagination
  const adminTotalPages = Math.ceil(filteredRecruiters.length / ADMIN_RECORDS_PER_PAGE);
  const startIndex = (adminCurrentPage - 1) * ADMIN_RECORDS_PER_PAGE;
  const paginatedRecruiters = filteredRecruiters.slice(startIndex, startIndex + ADMIN_RECORDS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setAdminCurrentPage(1);
  }, [searchQuery, connectionFilter]);

  if (adminLoading) {
    return (
      <div className="bg-white p-3 pb-5">
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Card */}
        <div className="border border-violet-100 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50">
          <div className="p-[20px] px-6">
            <div className="text-sm text-[#67677e]">Total</div>
            <div className="text-2xl font-bold text-violet-700">{recruiters.length}</div>
          </div>
        </div>

        {/* Connected Card */}
        <div className="border border-emerald-100 rounded-lg bg-white">
          <div className="p-[20px] px-6">
            <div className="text-sm text-[#67677e] flex items-center gap-1">
              <Link2 className="h-3 w-3" /> Connected
            </div>
            <div className="text-2xl font-bold text-emerald-600">{connectedCount}</div>
          </div>
        </div>

        {/* Job Active Card */}
        <div className="border border-blue-100 rounded-lg bg-white">
          <div className="p-[20px] px-6">
            <div className="text-sm text-[#67677e] flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Job Active
            </div>
            <div className="text-2xl font-bold text-blue-600">{jobMatchingActive}</div>
          </div>
        </div>

        {/* Vendor Active Card */}
        <div className="border border-emerald-100 rounded-lg bg-white">
          <div className="p-[20px] px-6">
            <div className="text-sm text-[#67677e] flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Vendor Active
            </div>
            <div className="text-2xl font-bold text-emerald-600">{vendorOutreachActive}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-violet-100 rounded-lg bg-white">
        <div className="py-4 px-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recruiters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bigHoverInput form-control py-2 pl-9"
              />
            </div>
            <div className="w-60">
              <PremiumSelect
                options={[
                  { value: "all", text: "All" },
                  { value: "connected", text: "Connected" },
                  { value: "not_connected", text: "Not Connected" },
                ]}
                value={connectionFilter}
                className="py-3"
                onChange={(val) => {
                  setConnectionFilter(val);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border border-violet-100 rounded-lg bg-white overflow-hidden">
        {/* Responsive wrapper */}
        {paginatedRecruiters?.length ? (
          <div className="overflow-x-auto" style={{ minWidth: "700px" }}>
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <th className="text-left py-[10px] px-3 font-medium">Name</th>
                  <th className="text-left py-[10px] px-3 font-medium">Email</th>
                  <th className="text-left py-[10px] px-3 font-medium">Connected</th>
                  <th className="text-left py-[10px] px-3 font-medium">Job Matching</th>
                  <th className="text-left py-[10px] px-3 font-medium">Vendor</th>
                  <th className="text-center py-[10px] px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecruiters.map((recruiter) => (
                  <tr key={recruiter.id} className="border-t border-gray-100 hover:bg-violet-50/50">
                    <td className="py-[10px] px-3 font-medium">
                      {recruiter.first_name} {recruiter.last_name}
                    </td>
                    <td className="py-[10px] px-3 text-gray-500 text-sm">{recruiter.recruiter_email}</td>
                    <td className="py-[10px] px-3">
                      {recruiter.is_connected ? (
                        <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {recruiter.provider || "Outlook"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-[10px] px-3">
                      {recruiter.job_matching_enabled ? (
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            recruiter.job_matching_mode === "auto"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {recruiter.job_matching_mode === "auto" ? "Auto" : "Review"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center border border-gray-300 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Off
                        </span>
                      )}
                    </td>
                    <td className="py-[10px] px-3">
                      {recruiter.vendor_outreach_enabled ? (
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            recruiter.vendor_outreach_mode === "auto"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {recruiter.vendor_outreach_mode === "auto" ? "Auto" : "Review"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center border border-gray-300 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Off
                        </span>
                      )}
                    </td>
                    <td className="py-[10px] px-3 text-right">
                      <button
                        onClick={() => setConfigureOpen(recruiter)}
                        className="inline-flex items-center ring-1 ring-violet-200 text-violet-600 hover:!bg-violet-50 text-sm font-medium px-3 py-1.5 rounded-md transition-colors bg-[#fff]"
                      >
                        <Settings className="h-4 w-4 mr-1" /> Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-3">Data not found</div>
        )}
        {/* Pagination Controls */}
        {adminTotalPages > 1 && (
          <div className="flex flwx-wrap items-center justify-between px-4 py-3 border-t border-violet-100">
            <p className="text-sm text-gray-500 m-0">
              Showing {startIndex + 1} to {Math.min(startIndex + ADMIN_RECORDS_PER_PAGE, filteredRecruiters.length)} of{" "}
              {filteredRecruiters.length} recruiters
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdminCurrentPage(adminCurrentPage - 1)}
                disabled={adminCurrentPage === 1}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ${
                  adminCurrentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getPaginationPages(adminCurrentPage, adminTotalPages).map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setAdminCurrentPage(page)}
                      className={`min-w-[32px] px-[3px] h-8 flex items-center justify-center text-sm font-medium rounded-md ${
                        adminCurrentPage === page
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : "border border-violet-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setAdminCurrentPage(adminCurrentPage + 1)}
                disabled={adminCurrentPage === adminTotalPages}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ${
                  adminCurrentPage === adminTotalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfigPopup
        open={configureOpen}
        onClose={(status) => {
          if (status) {
            getlistApiData();
          }
          setConfigureOpen(false);
        }}
      />
    </div>
  );
};

export default AdminRecruitersDashboard;
