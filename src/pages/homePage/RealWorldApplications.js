import { useState } from "react";
import { CheckCircle2, FileCheck, TrendingUp, Clock, Users, Mail } from "lucide-react";

const tabs = [
  { id: "compliance", label: "Compliance" },
  { id: "recruiter", label: "Recruiter Efficiency" },
  { id: "workstatus", label: "Work Status Automation" },
  { id: "engagement", label: "Candidate Engagement" },
  { id: "vendor", label: "Vendor Management" },
];

export default function RealWorldApplications() {
  const [activeTab, setActiveTab] = useState("compliance");

  return (
    <section className="py-6 md:py-20 px-0 md:px-4 bg-gray-50/50">
      <div className="w-full md:container md:mx-auto md:max-w-7xl">
        <div className="text-center mb-8 md:mb-12 px-4">
          <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3 md:mb-4">
            <span className="text-xs md:text-sm font-medium text-blue-600">Real-World Applications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-gray-900 px-2">
            See How It Works In Practice
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Our platform is designed to address real challenges faced by staffing and consulting firms managing bench
            talent.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-4 md:mb-8 px-4">
          <div className="flex overflow-x-auto pb-3 md:pb-0 md:flex-wrap justify-start md:justify-center gap-2 md:gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 md:px-6 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white border-2 border-blue-600 text-blue-600 md:shadow-md"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900"
                }`}
              >
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="bg-white border-t border-b md:rounded-2xl md:shadow-lg md:border border-gray-200 p-4 sm:p-6 md:p-8"
          style={{ border: "1px solid #e7e7ef" }}
        >
          {/* Compliance Tab */}
          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Compliance</h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">Document Centralization</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A mid-sized staffing agency with 80+ bench candidates was managing all documents manually. With
                      our platform, they moved everything to a centralized vault, received automated expiry reminders
                      for work permits and I-983s, and passed their USCIS compliance audit without a single missing
                      document.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>100% Compliance Rate Achieved</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Visa Expiration Tracking
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      An IT consulting firm with 120+ H1B consultants was struggling with visa renewals. Using our
                      platform's automated visa tracking and expiration alerts, they reduced visa lapses by 95% and
                      eliminated costly legal penalties.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>95% Reduction in Visa Lapses</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                    Document Status Dashboard
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">I-983 Form</span>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-full">
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">H1B Documentation</span>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-full">
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Work Authorization</span>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-yellow-600 text-white text-xs sm:text-sm font-semibold rounded-full">
                        Expires in 30 days
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">OPT Extension</span>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-full">
                        Expires in 7 days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Compliance Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-700">Documents Up-to-Date</span>
                        <span className="font-bold text-gray-900">96%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "96%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-700">Audit Readiness</span>
                        <span className="font-bold text-gray-900">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recruiter Efficiency Tab */}
          {activeTab === "recruiter" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
                  Recruiter Efficiency
                </h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Recruiter Efficiency Boost
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A 5-member recruiting team was overwhelmed with job sourcing from multiple portals. Our Job
                      Discovery Suite helped them auto-match jobs to bench talent. They saw a 50% increase in submittals
                      and a 30% reduction in turnaround time.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>50% Increase in Candidate Submittals</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">Resume-to-JD Matching</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A staffing agency with 60+ technical recruiters integrated our AI-powered resume-to-job
                      description matching. Within 3 months, they improved candidate-to-interview conversion by 40% and
                      reduced time spent on initial screening by 65%.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>65% Reduction in Screening Time</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Performance Metrics</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="font-medium text-gray-700">Before Implementation</span>
                        <span className="font-bold text-gray-900">20 submittals/week</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gray-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="font-medium text-gray-700">After Implementation</span>
                        <span className="font-bold text-green-600">30 submittals/week</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Time Savings</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="font-medium text-gray-700">Screening Time (Before)</span>
                        <span className="font-bold text-gray-900">45 min/candidate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gray-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="font-medium text-gray-700">Screening Time (After)</span>
                        <span className="font-bold text-green-600">15 min/candidate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Work Status Automation Tab */}
          {activeTab === "workstatus" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
                  Work Status & Timesheet Automation
                </h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">Work Status Automation</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      Previously chasing 50+ candidates each Friday for status updates and timesheets, one company
                      automated the entire process with our weekly work collection system. Now, candidates receive
                      reminders, submit via mobile or web, and HR sees consolidated reports — saving 8–10 hours/week.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>8-10 Hours Saved Weekly</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Project Milestone Tracking
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A consulting firm with 35 bench consultants training on client projects needed better milestone
                      tracking. Our platform's automated check-in system allowed them to monitor progress, identify
                      training obstacles, and intervene early—reducing project delays by 40%.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>40% Fewer Project Delays</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Submission Metrics</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Weekly Status Report</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Automated
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">45/50 candidates submitted on time</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "90%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Timesheet Collection</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Automated
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">48/50 timesheets submitted</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "96%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Project Milestones</span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          Tracked
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">32/35 consultants on track</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "91%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Engagement Tab */}
          {activeTab === "engagement" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
                  Candidate Engagement & Retention
                </h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">Candidate Engagement</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A growing staffing firm struggled with losing bench candidates to competitors during the waiting
                      period. By implementing our engagement system with regular check-ins and personalized job matches,
                      they reduced candidate attrition by 35% and improved bench-to-billable conversion rates.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base">
                      <Users className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>35% Decrease in Candidate Attrition</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Training & Upskilling Program
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      An IT services firm implemented our skill-matching and training recommendation engine for their
                      bench. Within 6 months, they increased bench utilization by 28% by aligning training with market
                      demand and upcoming project requirements.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>28% Higher Bench Utilization</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Engagement Metrics</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm sm:text-base">
                        Candidate Engagement
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Weekly job matches: 8 per candidate</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Regular check-ins: 94% response rate</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Skill development reminders</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm sm:text-base">
                        Skills & Training
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Market demand analysis</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Custom learning paths: 85% completion</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Project readiness scores</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Management Tab */}
          {activeTab === "vendor" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
                  Vendor Network & Email Campaigns
                </h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Vendor Network & Mass Email Campaigns
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      An IT consulting company needed to maximize visibility of their bench talent. Using our Engagement
                      Hub, they created targeted hotlists of their available consultants and sent personalized mass
                      emails to their vendor network. Within 30 days, they received interview requests from 14 new
                      clients and placed 5 candidates.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <Mail className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>5 New Placements in 30 Days</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-gray-50/80 md:bg-gray-50/50 rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-600/50 transition-all">
                    <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      Client Relationship Management
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                      A staffing agency with 200+ clients implemented our client segmentation and targeted communication
                      system. By tailoring bench talent presentations to each client's specific needs, they improved
                      response rates by 45% and reduced time-to-fill for urgent requirements by 3 days.
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm md:text-base">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>45% Higher Client Response Rates</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Email Campaign Success</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600">200+</div>
                          <div className="text-xs sm:text-sm text-gray-600">Emails Sent</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600">76%</div>
                          <div className="text-xs sm:text-sm text-gray-600">Open Rate</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">23%</div>
                          <div className="text-xs sm:text-sm text-gray-600">Response Rate</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">14</div>
                          <div className="text-xs sm:text-sm text-gray-600">New Clients</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:hover:shadow-lg transition-all">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 md:mb-4">Campaign Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-700">Email Deliverability</span>
                        <span className="font-bold text-gray-900">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "98%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-700">Client Engagement</span>
                        <span className="font-bold text-gray-900">76%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "76%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-700">Conversion to Interview</span>
                        <span className="font-bold text-gray-900">23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{ width: "23%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
