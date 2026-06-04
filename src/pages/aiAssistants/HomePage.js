import React, { useState } from "react";
import { Settings, Clock, BarChart3, Users } from "lucide-react";
import MySettings from "./MySettings";
import ReviewTab from "./ReviewQueue";
import StatsDashboard from "./StatsDashboard";
import AdminRecruitersDashboard from "./AdminRecruitersDashboard";

function HomePage() {
  const TAB_CONFIG = [
    {
      id: "settings",
      labelDesktop: "My Settings",
      labelMobile: "Settings",
      icon: Settings,
      component: MySettings,
    },
    {
      id: "review",
      labelDesktop: "Review Queue",
      labelMobile: "Review",
      icon: Clock,
      badge: 100,
      component: ReviewTab,
    },
    {
      id: "stats",
      labelDesktop: "Statistics",
      labelMobile: "Stats",
      icon: BarChart3,
      component: StatsDashboard,
    },
    {
      id: "admin",
      labelDesktop: "Team Overview",
      labelMobile: "Team",
      icon: Users,
      component: AdminRecruitersDashboard,
    },
  ];

  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].id);

  function AIAssistantsTabs() {
    const activeTabData = TAB_CONFIG.find((tab) => tab.id === activeTab);

    const Component = activeTabData.component;

    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="items-center justify-center bg-muted text-muted-foreground grid w-full grid-cols-4 bg-gradient-to-r from-violet-50 to-purple-50 p-1 h-auto min-w-max rounded-[10px]"
          >
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] p-[12px] text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#5f15e0] text-white shadow-lg"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />

                  <span>{tab.labelDesktop}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Component title={activeTabData.labelDesktop} />
        </div>
      </div>
    );
  }

  const renderMainBody = () => {
    return (
      <div className="signatureContainer homepageFontfamily">
        <AIAssistantsTabs />
      </div>
    );
  };

  return (
    <div className="p-3" style={{ color: "#000", backgroundColor: "#fff" }}>
      <div className="headerBackground text-white p-3 mb-3" style={{ minHeight: "85px", borderRadius: "10px" }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h2 className="mb-0 mt-0 ms-2 fw-bold h2 fs-5">AI Assistants</h2>
            <p className="mb-0 ms-2 fs-14">Intelligent automation for job matching and vendor outreach</p>
          </div>
        </div>
      </div>

      {renderMainBody()}
    </div>
  );
}

export default HomePage;
