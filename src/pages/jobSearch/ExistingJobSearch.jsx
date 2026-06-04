import React, { useState, useEffect, Component } from "react";
import { useNavigate } from "react-router-dom";
import Dashnav from "../../components/dashnav";
import "./JobSearch.css";
import JobSearchIcon from "./jobSearch.svg";
import Profile from "../../images/your-profile.svg";
import ActiveJobs from "./ExistingJobComponents/existingjobComponents";
import ProfileLogoComponent from "../../components/ProfileComponent";
import styles from "../talentpool/css/TalentPool.module.css";
import ProfileLogo from "../../assets/images/profile.png";

const ExistingJobSearch = () => {
  const navigate = useNavigate();
  const ProfileOpen = () => {
    navigate("/userProfile");
  };
  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100 scroll-bar bottom-sidebar">
          {/* <div className="top-section-jobSearch row-flex">
            <img src={JobSearchIcon} alt="" />
            <p className="job-heading">Existing Job Search</p>
            <button className="name-profile">
              <img src={Profile} alt="" className="profile" />
              Your Profile
            </button>
          </div> */}
          <div className={`${styles.container} container-fluid py-2 px-2 px-sm-3 px-md-2 rightcontent`}>
            <div
              className="headerBackground text-white p-3 rounded-top d-flex col-flex"
              style={{ borderRadius: "22px !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="mb-0 fw-bold h2 fs-5">Current Openings</h2>
                  {/* <div className="row-flex align-items-center" style={{ marginTop: "16px" }}>
                    <span
                      className="mb-0"
                      onClick={() => {
                        navigate("/jobSearch");
                      }}
                    >
                      Job Discovery Suite
                    </span>
                    <span>/Current Openings</span>
                  </div> */}
                </div>
                <div className="d-flex align-items-center gap-3">
                  {/* <SearchBox value={searchValue} onChange={setSearchValue} /> */}

                  {/* <div className={styles.userbox}>
                    <ProfileLogoComponent />
                  </div> */}
                </div>
              </div>
            </div>
            <ActiveJobs />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExistingJobSearch;
