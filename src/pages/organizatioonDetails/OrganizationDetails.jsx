import React from "react";
import { useSearchParams } from "react-router-dom";
import "../../assets/styles/OrganizationDetails.css";
import TeamsManagement from "../../components/organizationDetails/TeamsManagement";
import TitlesManagement from "../../components/organizationDetails/TitlesManagement";
import RecruitersManagement from "../../components/organizationDetails/RecruitersManagement";

const OrganizationDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Teams Management";



  return (
    <div className="width-100 vh-100 org-details-main">
      <div className="org-details-container d-flex justify-end">
        <div className="org d-flex flex-column justify-start align-start">
          <ul className="org-top-element d-flex gap-1">
            <li
              className={`${
                activeTab == "Teams Management" ? "org-element-active" : ""
              } org-element cursor-pointer`}
              onClick={() => {
                setSearchParams({ tab: "Teams Management" });
              }}
            >
              Teams Management
            </li>
            <li
              className={`${
                activeTab == "Titles Management" ? "org-element-active" : ""
              } org-element cursor-pointer`}
              onClick={() => {
                setSearchParams({ tab: "Titles Management" });
              }}
            >
              Titles Management
            </li>
            <li
              className={`${
                activeTab == "Recruiters Management" ? "org-element-active" : ""
              } org-element cursor-pointer`}
              onClick={() => {
                setSearchParams({ tab: "Recruiters Management" });
              }}
            >
              Recruiter Management
            </li>
          </ul>
          {activeTab == "Teams Management" && <TeamsManagement/> || activeTab=="Titles Management" && <TitlesManagement/> || activeTab == "Recruiters Management" && <RecruitersManagement/>}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
