import React from "react";
import Dashnav from "../../components/dashnav.jsx";
import TopUser from "../../images/top-user.svg";
import RecruiterDetails from "./RecruiterDetails.jsx";
import TeamsDetails from "./TeamsDetails.jsx";
import { useSearchParams } from "react-router-dom";
import TitlesDetails from "./TitlesDetails.jsx";

const OrganizationDetailsHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Teams Management";

  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100 scroll-bar bottom-sidebar">
          <div className="top-section row-flex">
            <img src={TopUser} alt="" />
            <p className="title-left">Organization Details</p>
            <div className=" sidenav-icon row-flex">
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 8L21 12L17 16M3 12H13M3 6H13M3 18H13"></path>
              </svg>
            </div>
          </div>
          <div className="organization-options">
            <ul className="organization-options-list d-flex gap-4">
              <li
                className={`${activeTab == "Teams Management" ? "option-active" : " "}`}
                onClick={() => {
                  setSearchParams({ tab: "Teams Management" });
                }}
              >
                Teams Management
              </li>
              <li
                className={`${activeTab == "Titles Management" ? "option-active" : " "}`}
                onClick={() => {
                  setSearchParams({ tab: "Titles Management" });
                }}
              >
                Titles Management
              </li>
              <li
                className={`${activeTab == "Recruiters Management" ? "option-active" : " "}`}
                onClick={() => {
                  setSearchParams({ tab: "Recruiters Management" });
                }}
              >
                Recruiters Management
              </li>
            </ul>
          </div>
          {(activeTab == "Teams Management" && <TeamsDetails />) ||
            (activeTab == "Titles Management" && <TitlesDetails />) ||
            (activeTab == "Recruiters Management" && <RecruiterDetails />)}
        </section>
      </div>
    </div>
  );
};

export default OrganizationDetailsHome;
