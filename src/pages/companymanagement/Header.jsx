import React, { useEffect, useState } from "react";
import styles from "./css/header.module.css";
import PeopleIcon from "../../assets/images/peopleIcon.png";
import { SearchBox } from "../../components";

import images from "../../assets/images/new";
import TeamManagement from "./TeamsDetails";
import TitlesDetails from "./TitlesDetails";
import RecruiterDetails from "./RecruiterDetails";
import CompanyDetails from "./CompanyDetails";

const { titles, details } = images;

const tabs = [
  {
    id: "Teams_Management",
    label: "Teams Management",
    icon: PeopleIcon,
    countTitle: "Teams",
    addheading: "+ Add Team",
    Component: TeamManagement,
  },
  {
    id: "Titles_Management",
    label: "Titles Management",
    icon: titles,
    countTitle: "Titles",
    addheading: "+ Add Title",
    Component: TitlesDetails,
  },
  {
    id: "Recruiters_Management",
    label: "Recruiters Management",
    icon: PeopleIcon,
    countTitle: "Recruiters",
    addheading: "+ Add Recruiter",
    Component: RecruiterDetails,
  },
  {
    id: "Organization_Management",
    label: "Organization Management",
    icon: details,
    countTitle: "Company",
    Component: CompanyDetails,
  },
  ,
];

const DefaultComponent = () => {
  return <></>;
};

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  return String(data?.modules?.companyManagement?.accessLevel).toLocaleLowerCase() == "edit";
}

function Header() {
  const urlParams = new URLSearchParams(window.location.search);
  const tabQuery = urlParams.get("tab") || tabs[0].id;
  const [activeTab, setActiveTab] = useState(tabQuery);
  const [searchValue, setSearchValue] = useState("");

  const [componentItem, setComponentItem] = useState({});

  let activeTabDetails = tabs.find((item) => item?.id == activeTab);
  if (!activeTabDetails) {
    activeTabDetails = tabs[0];
  }

  const Component = activeTabDetails?.Component || DefaultComponent;

  const editPermitions = getPermissions();

  useEffect(() => {
    setActiveTab(tabQuery);
    setSearchValue("");
  }, [tabQuery]);

  useEffect(() => {
    if (componentItem.setSearch) {
      componentItem.setSearch(searchValue);
    }
  }, [searchValue]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const newUrl = `${window.location.pathname}?tab=${tabId}`;
    window.history.pushState(null, "", newUrl);
  };

  const renderTabs = () => {
    return (
      <div className={`d-flex ${styles.tabContainer}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            className={`btn nowrap pt-1 pb-1 ${styles.tabBTN} ${activeTab === tab.id ? styles.activetab : styles.inactivetab}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <img src={tab.icon} className={`${styles.tabicon} ${activeTab === tab.id ? styles.activetabicon : ""}`} />
            <span className="p-0 m-0">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} container-fluid py-2 px-1 px-sm-2 px-md-2 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2 fs-5">Company Management</h2>
              {/* <p>{activeTabDetails.label}</p> */}
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />
              {/* <div className={profileStyles.userbox}>
              <ProfileLogoComponent/>
              </div> */}
            </div>
          </div>
        </div>
        <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
          <div className={`headerboxglass signatureContainer ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 py-2 -mt-[40px]">
              <div className="d-flex align-items-center gap-1">{renderTabs()}</div>
              {activeTabDetails.addheading ? (
                <div className={styles.addSection}>
                  {editPermitions ? (
                    <>
                      <span
                        className="pointer addBtn"
                        onClick={() => {
                          componentItem.action();
                        }}
                      >
                        {activeTabDetails.addheading}
                      </span>
                      <span className={styles.sep} />
                    </>
                  ) : (
                    <></>
                  )}
                  <span className={`${styles.themefontDark} d-flex align-items-center gap-2`}>
                    <img src={activeTabDetails.icon} style={{ height: "18px" }} />
                  </span>
                  <span className={`${styles.themefontDark} ${styles.textBtn} d-flex align-items-center gap-2`}>
                    {activeTabDetails.countTitle}: {componentItem.count || 0}
                  </span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <Component editPermitions={editPermitions} callback={setComponentItem} />
        </div>
      </div>
    </div>
  );
}

export default Header;
