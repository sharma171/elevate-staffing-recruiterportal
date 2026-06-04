import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Briefcase,
  Send,
  Clock,
  TrendingUp,
  Target,
  Building2,
  Users,
  UserCheck,
  Activity,
  XCircle,
} from "lucide-react";

import PremiumSelect from "../../components/PremiumSelect";
import { axiosApi } from "../../components";
import { useAuth } from "../../authContext";
import { AIPagination, Skeleton } from "./GmailCredentials";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app";

const StatsDashboard = () => {
  // State for filters
  const [period, setPeriod] = useState(7);
  const [statsRecruiterFilter, setStatsRecruiterFilter] = useState("all");
  const [statsCandidateFilter, setStatsCandidateFilter] = useState("all");
  const [statsLoading, setStatsLoading] = useState(false);

  const [recruiterPage, setRecruiterPage] = useState(1);
  const [candidatePage, setCandidatePage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  const itemsPerPage = 10;

  // Dummy data for stats
  const [stats, setStats] = useState({
    job_matching: {
      total: 0,
      sent: 0,
      pending_review: 0,
      avg_match_score: 0,
    },
    vendor_outreach: {
      total: 0,
      sent: 0,
      unique_companies: 0,
      avg_match_score: 0,
    },
    daily_breakdown: [],
    recruiter_breakdown: [],
    candidate_breakdown: [],
    client_breakdown: [],
    recent_activity: [],
  });

  const { user } = useAuth();
  let adminEmail = user?.email;

  useEffect(() => {
    getStatsAPIdata();
  }, [period]);

  const getStatsAPIdata = () => {
    const payload = {
      action: "get_agent_stats",
      requesting_user_email: adminEmail,
    };

    if (period) {
      payload.days = period;
    }

    setStatsLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setStatsLoading(false));
  };

  const handlePeriodChange = (value) => {
    setPeriod(parseInt(value));
    setRecruiterPage(1);
    setCandidatePage(1);
    setClientPage(1);
    setActivityPage(1);
  };

  // Handle recruiter filter change
  const handleRecruiterChange = (value) => {
    setStatsRecruiterFilter(value);
    setRecruiterPage(1);
    setCandidatePage(1);
    setActivityPage(1);
  };

  // Handle candidate filter change
  const handleCandidateChange = (value) => {
    setStatsCandidateFilter(value);
    setCandidatePage(1);
    setActivityPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatsRecruiterFilter("all");
    setStatsCandidateFilter("all");
    setPeriod(7);
    setRecruiterPage(1);
    setCandidatePage(1);
    setClientPage(1);
    setActivityPage(1);
  };

  // Filtered data for display
  const filteredRecruiters =
    stats?.recruiter_breakdown?.filter(
      (r) => statsRecruiterFilter === "all" || r.recruiter_email === statsRecruiterFilter,
    ) || [];

  const filteredCandidates =
    stats?.candidate_breakdown?.filter(
      (c) =>
        (statsRecruiterFilter === "all" || c.recruiter_email === statsRecruiterFilter) &&
        (statsCandidateFilter === "all" || c.candidate_email === statsCandidateFilter),
    ) || [];

  const filteredActivity =
    stats?.recent_activity?.filter(
      (a) =>
        (statsRecruiterFilter === "all" || a.recruiter_email === statsRecruiterFilter) &&
        (statsCandidateFilter === "all" || a.candidate_email === statsCandidateFilter),
    ) || [];

  const clientData = stats?.client_breakdown || [];

  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-100 min-w-[200px]">
            <PremiumSelect
              options={[
                { value: "7", text: "Last 7 days" },
                { value: "14", text: "Last 14 days" },
                { value: "30", text: "Last 30 days" },
              ]}
              value={String(period)}
              onChange={(val) => {
                handlePeriodChange(val);
              }}
              placeholder="Select period"
            />
          </div>

          {/* Recruiter Select */}
          <div className="w-100 min-w-[200px]">
            <PremiumSelect
              options={[
                { value: "all", text: "All Recruiters" },
                ...(stats?.recruiter_breakdown || []).map((r) => ({
                  value: r.recruiter_email,
                  text: `${r.first_name} ${r.last_name}`,
                })),
              ]}
              value={String(statsRecruiterFilter)}
              onChange={(val) => {
                handleRecruiterChange(val);
              }}
              placeholder="Select recruiter"
            />
          </div>

          {/* Candidate Select */}
          <div className="w-100 min-w-[200px]">
            <PremiumSelect
              options={[
                { value: "all", text: "All Candidates" },
                ...(stats?.candidate_breakdown || []).map((c) => ({
                  value: c.candidate_email,
                  text: c.candidate_name,
                })),
              ]}
              value={String(statsCandidateFilter)}
              onChange={(val) => {
                handleCandidateChange(val);
              }}
              placeholder="Select candidate"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(statsRecruiterFilter !== "all" || statsCandidateFilter !== "all") && (
          <button onClick={clearFilters} className="successoutlineButtonWhite successoutlineButton">
            <XCircle className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Job Matching Stats */}
            <div className="ring-2 ring-blue-100 rounded-lg bg-white">
              <div className="p-6">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  Job Matching
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Total
                    </div>
                    <p className="text-2xl font-bold">{stats?.job_matching.total || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Send className="h-3 w-3" /> Sent
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{stats?.job_matching.sent || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.job_matching.pending_review || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Avg Score
                    </div>
                    <p className="text-2xl font-bold">{stats?.job_matching.avg_match_score?.toFixed(0) || 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Outreach Stats */}
            <div className="ring-2 ring-emerald-100 rounded-lg bg-white">
              <div className="p-6">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  Vendor Outreach
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Total
                    </div>
                    <p className="text-2xl font-bold">{stats?.vendor_outreach.total || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Send className="h-3 w-3" /> Sent
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{stats?.vendor_outreach.sent || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Companies
                    </div>
                    <p className="text-2xl font-bold text-violet-600">{stats?.vendor_outreach.unique_companies || 0}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Avg Score
                    </div>
                    <p className="text-2xl font-bold">{stats?.vendor_outreach.avg_match_score?.toFixed(0) || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="border border-violet-100 rounded-lg bg-white">
            <div className="py-3 px-6">
              <h3 className="text-violet-700 font-semibold text-lg">Daily Activity</h3>
            </div>
            <div className="px-3 pb-3">
              {stats?.daily_breakdown && stats.daily_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                      }
                      formatter={(value) => [value, value === "submissions" ? "Submissions" : "Sent"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Submissions"
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Sent"
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">No activity data available</div>
              )}
            </div>
          </div>

          {/* Breakdowns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Recruiter Breakdown */}
            <div className="border border-violet-100 rounded-lg bg-white">
              <div className="p-3">
                <div className="flex items-center gap-2 text-lg text-violet-700 font-semibold">
                  <Users className="h-5 w-5" />
                  Top Recruiters
                </div>
              </div>
              <div className="px-3 pb-3">
                {filteredRecruiters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-violet-50/50">
                          <th className="text-left p-3 font-medium text-gray-700">Recruiter</th>
                          <th className="text-right p-3 font-medium text-gray-700">Submissions</th>
                          <th className="text-right p-3 font-medium text-gray-700">Sent</th>
                          <th className="text-right p-3 font-medium text-gray-700">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(filteredRecruiters, recruiterPage).map((recruiter) => (
                          <tr
                            key={recruiter.recruiter_email}
                            className="border-t border-gray-100 hover:!bg-[#f1f1f980]"
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium">
                                  {recruiter.first_name} {recruiter.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{recruiter.unique_candidates} candidates</p>
                              </div>
                            </td>
                            <td className="text-right p-3 font-medium">{recruiter.total_submissions}</td>
                            <td className="text-right p-3 text-emerald-600">{recruiter.sent}</td>
                            <td className="text-right p-3">{recruiter.avg_match_score?.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <AIPagination
                      hideText
                      currentPage={recruiterPage}
                      totalItems={stats?.recruiter_breakdown?.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setRecruiterPage}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No recruiter data available</div>
                )}
              </div>
            </div>

            {/* Candidate Breakdown */}
            <div className="border border-blue-100 rounded-lg bg-white">
              <div className="p-3">
                <div className="flex items-center gap-2 text-lg text-blue-700 font-semibold">
                  <UserCheck className="h-5 w-5" />
                  Top Candidates
                </div>
              </div>
              <div className="px-3 pb-3">
                {filteredCandidates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50/50">
                          <th className="text-left p-3 font-medium text-gray-700">Candidate</th>
                          <th className="text-right p-3 font-medium text-gray-700">Submissions</th>
                          <th className="text-right p-3 font-medium text-gray-700">Sent</th>
                          <th className="text-right p-3 font-medium text-gray-700">Clients</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(filteredCandidates, candidatePage).map((candidate) => (
                          <tr
                            key={candidate.candidate_email}
                            className="border-t border-gray-100 hover:!bg-[#f1f1f980]"
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{candidate.candidate_name}</p>
                                <p className="text-xs text-gray-500">{candidate.avg_match_score?.toFixed(1)}% avg</p>
                              </div>
                            </td>
                            <td className="text-right p-3 font-medium">{candidate.total_submissions}</td>
                            <td className="text-right p-3 text-emerald-600">{candidate.sent}</td>
                            <td className="text-right p-3">{candidate.unique_clients}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <AIPagination
                      hideText
                      currentPage={candidatePage}
                      totalItems={stats?.candidate_breakdown.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCandidatePage}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No candidate data available</div>
                )}
              </div>
            </div>

            {/* Client Breakdown */}
            <div className="border border-emerald-100 rounded-lg bg-white">
              <div className="p-3">
                <div className="flex items-center gap-2 text-lg text-emerald-700 font-semibold">
                  <Building2 className="h-5 w-5" />
                  Top Clients
                </div>
              </div>
              <div className="px-3 pb-3">
                {clientData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-50/50">
                          <th className="text-left p-3 font-medium text-gray-700">Client</th>
                          <th className="text-right p-3 font-medium text-gray-700">Submissions</th>
                          <th className="text-right p-3 font-medium text-gray-700">Sent</th>
                          <th className="text-right p-3 font-medium text-gray-700">Candidates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(clientData, clientPage).map((client, idx) => (
                          <tr
                            key={client.client_email || idx}
                            className="border-t border-gray-100 hover:!bg-[#f1f1f980]"
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{client.client_name || "Unknown"}</p>
                                <p className="text-xs text-gray-500">{client.unique_recruiters} recruiters</p>
                              </div>
                            </td>
                            <td className="text-right p-3 font-medium">{client.total_submissions}</td>
                            <td className="text-right p-3 text-emerald-600">{client.sent}</td>
                            <td className="text-right p-3">{client.unique_candidates}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <AIPagination
                      hideText
                      currentPage={clientPage}
                      totalItems={stats?.client_breakdown.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setClientPage}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No client data available</div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border border-orange-100 rounded-lg bg-white">
              <div className="p-3">
                <div className="flex items-center gap-2 text-lg text-orange-700 font-semibold">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </div>
              </div>
              <div className="px-3 pb-3">
                {filteredActivity.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-50/50">
                          <th className="text-left p-3 font-medium text-gray-700">Candidate</th>
                          <th className="text-left p-3 font-medium text-gray-700">Job</th>
                          <th className="text-center p-3 font-medium text-gray-700">Score</th>
                          <th className="text-center p-3 font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(filteredActivity, activityPage).map((activity) => (
                          <tr key={activity.submission_id} className="border-t border-gray-100 hover:!bg-[#f1f1f980]">
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{activity.candidate_name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(activity.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="text-sm truncate max-w-[150px]">
                                  {activity.job_title !== "None" ? activity.job_title : "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {activity.client_name !== "None" ? activity.client_name : "Unknown"}
                                </p>
                              </div>
                            </td>
                            <td className="text-center p-3 font-medium">{activity.match_score}%</td>
                            <td className="text-center p-3">
                              {activity.submission_status === "sent" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  Sent
                                </span>
                              ) : activity.submission_status === "pending" ||
                                activity.submission_status === "pending_review" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                  Pending
                                </span>
                              ) : activity.submission_status === "rejected" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                                  {activity.submission_status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <AIPagination
                      hideText
                      currentPage={activityPage}
                      totalItems={stats?.recent_activity.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setActivityPage}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsDashboard;
