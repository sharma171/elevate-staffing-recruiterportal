import React, { useEffect, useState } from "react";
import Dashnav from "../../components/dashnav";
import "./candidateStyle.css";
import "./editCandidate.css";
import "./sidebarStyle.css";
import { useAuth } from "../../authContext";
import Sidenav from "../../images/side_top.svg";
import Others from "../../images/others.svg";
import Info from "../../images/info.svg";
import Location from "../../images/location.svg";
import General from "../../images/general.svg";
import saveTick from "../../images/saveTick.svg";
import FileDoc from "../../images/filedoc.svg";
import Date_marketing from "../../images/marketingdateIcon.svg";
import { ReactComponent as Submission } from "../../images/submissions.svg";
import sub from "../../images/submissions.svg";
import Add from "../../images/addIcon.svg";
import IconSideNav from "../../images/icon-sidenav.svg";
import EditIcon from "../../images/edit-icon.svg";
import UserIcon from "../../images/user-icon.svg";
import user from "../../images/user.svg";
import TopUser from "../../images/top-user.svg";
import Profile from "../../images/your-profile.svg";
import { ReactComponent as UserSvg } from "../../images/user.svg";
import { ReactComponent as FileMain } from "../../images/main-file.svg";
import { Link, useNavigate } from "react-router-dom";

import FemaleIcon from "../../images/female.svg";

import MaleIcon from "../../images/name-user-icon.svg";

import OthersIcon from "../../images/otherGender.svg";

const CandidateDetails = ({ openDetails, setOPenDetails }) => {
  const [candidateDetails, setCandidateDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [formData, setFormData] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const [activeNav, setActiveNav] = useState("tab1");
  const { user } = useAuth();
  const [localData, setLocalData] = useState({
    bench_candidates: [],
    candidate_rateconfirmations: [],
  });
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  console.log("user email========", user.email);

  const handleTabClick = (tabName) => {
    setActiveNav(tabName);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  function backToBench() {
    setOPenDetails(false);
  }

  const backToEdit = (id) => {
    console.log("EDIT");

    navigate(`/benchcandidates/details/edit?id=${id}`);
    // setSelectedCandidate(null);
  };

  function ProfileOpen() {
    // Open the profile page
    navigate("/userProfile");
    // or navigate("/register", { replace: true }); // replace current URL with new one, without adding it to the history stack
  }

  useEffect(() => {
    // Fetch candidates data on component mount
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    fetch("https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailid: user.email,
        operation: "retrieve",
        id: urlParams.get("id"), // Use the retrieved ID as payload
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCandidateDetails(data[0]);
        setFormData(data[0]);
      })
      .catch((error) => console.error("Error fetching candidates:", error));
  }, []);

  useEffect(() => {
    const fetchLocalData = async () => {
      if (!candidateDetails?.primary_email) {
        console.log("No candidate email found or candidate details are undefined.");
        return;
      }

      try {
        const queryObj = {
          emailid: user.email,
          operation: "candidateconfirmations",
          email: `${candidateDetails?.primary_email}, ${candidateDetails?.secondary_email}`, // Use only one primary_email
        };

        const response = await fetch(
          "https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(queryObj),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        setLocalData({
          bench_candidates: data.bench_candidates || [],
          candidate_rateconfirmations: data.candidate_rateconfirmations || [],
        });
      } catch (error) {
        console.error("Error fetching candidate confirmations:", error);
      }
    };
    console.log("fetchLocalData", fetchLocalData);

    // Only call fetchLocalData if candidateDetails has a valid email
    if (candidateDetails) {
      fetchLocalData();
    }
  }, [candidateDetails]);
  console.log("localData", localData);

  return (
    <>
      <section className="w-100">
        <div className="top-section row-flex">
          <img src={TopUser} alt="" />
          {user?.user_role === "recruiter" ? (
            <p className="title-left">My Assigned Candidates</p>
          ) : (
            <p className="title-left">Bench Candidates Details</p>
          )}
          <button className="profile-button-right" onClick={ProfileOpen}>
            <img src={Profile} alt="" className="profile" />
            Your Profile
          </button>
        </div>
        <div className="inner-benchData">
          <nav className="sidebar-nav">
            <div className="info-cand">
              {/* Candidate info section */}
              <div className="candinfo">
                <img className="icon" src={IconSideNav} alt="" onClick={backToBench} />
                {user?.user_role === "recruiter" ? <p>Go Back</p> : <p>Bench Candidate</p>}

                {user?.user_role === "recruiter" ? (
                  <p></p>
                ) : (
                  <button onClick={(e) => backToEdit(candidateDetails.id)}>
                    <img src={EditIcon} alt="" />
                    edit
                  </button>
                )}
              </div>
              <div className="userinfo">
                <div
                  className={`status-change-statuschange ${
                    candidateDetails.gender === "Male"
                      ? "Male"
                      : candidateDetails.gender === "Female"
                      ? "Female"
                      : "Other"
                  }`}
                >
                  <div className="alignCenter">
                    {candidateDetails.gender === "Male" ? (
                      <img className="icon1" src={MaleIcon} alt="" />
                    ) : candidateDetails.gender === "Female" ? (
                      <img className="icon1" src={FemaleIcon} alt="" />
                    ) : (
                      <img className="icon1" src={OthersIcon} alt="" />
                    )}
                  </div>
                </div>
                <div className="userName">{candidateDetails.first_name}</div>
                <div className="userEmail">{candidateDetails.primary_email}</div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <ul className="innercomponent">
              {/* Step 3: Apply conditional styling based on activeNav */}
              <div
                className={`sidebar-data ${activeNav === "tab1" ? "active-tab" : ""}`}
                onClick={() => handleTabClick("tab1")}
              >
                <UserSvg />
                Candidate Info
              </div>
              <div
                className={`sidebar-data ${activeNav === "tab2" ? "active-tab" : ""}`}
                onClick={() => handleTabClick("tab2")}
              >
                <FileMain />
                Files & Documents
              </div>
              <div
                className={`sidebar-data ${activeNav === "tab3" ? "active-tab" : ""}`}
                onClick={() => handleTabClick("tab3")}
              >
                <img className="icon1" src={Date_marketing} alt="" />
                Marketing Details
              </div>
              <div
                className={`sidebar-data ${activeNav === "tab4" ? "active-tab" : ""}`}
                onClick={() => handleTabClick("tab4")}
              >
                <Submission />
                Submission Details
              </div>
            </ul>
          </nav>

          {activeNav === "tab1" && (
            <div className="candidate-info-data">
              <div className="candidateEditForm">
                <div className="header-main">
                  <img src={FileDoc} alt="" srcset="" />
                  <p className="title">Files & Documents : </p>
                  <img src={Date_marketing} alt="" srcset="" />
                  <p className="title">Onboarded Company : {candidateDetails.onboarded_company}</p>
                  <img src={sub} alt="" srcset="" />
                  <p className="title">Submissions : {localData.candidate_rateconfirmations.length}</p>
                </div>
                <div className="mainContent">
                  <section>
                    <div className="legendHeading">
                      <img src={General} alt="" srcset="" />
                      <h5>General</h5>
                      <span className="divider"></span>
                    </div>
                    <div className="grid">
                      <div className="inputComponent">
                        <label htmlFor="">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={candidateDetails.first_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={candidateDetails.last_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Primary Email</label>
                        <input
                          type="text"
                          placeholder="Enter Primary Email"
                          name="primary_email"
                          value={candidateDetails.primary_email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Secondary Email</label>
                        <input
                          type="text"
                          name="secondary_email"
                          value={candidateDetails.secondary_email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Primary Contact</label>
                        <input
                          type="text"
                          name="primary_contact"
                          value={candidateDetails.primary_contact}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="inputComponent">
                        <label htmlFor="">Secondary Contact</label>
                        <input
                          type="text"
                          name="secondary_contact"
                          value={candidateDetails.secondary_contact}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </section>
                  <section>
                    <div className="legendHeading">
                      <img src={Location} alt="" srcset="" />
                      <h5>Location</h5>
                      <span className="divider"></span>
                    </div>
                    <div className="grid">
                      <div className="inputComponent">
                        <label htmlFor="">Address</label>
                        <input
                          type="text"
                          name="candidate_address1"
                          value={candidateDetails.candidate_address1}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </section>
                  <section>
                    <div className="legendHeading">
                      <img src={Others} alt="" srcset="" />
                      <h5>Other</h5>
                      <span className="divider"></span>
                    </div>
                    <div className="grid">
                      <div className="inputComponent">
                        <label htmlFor="visa_status">Visa Status</label>
                        <input
                          name="visa_status"
                          value={candidateDetails.visa_status}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Current Status</label>
                        <input
                          name="current_status"
                          value={candidateDetails.current_status}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Currently in a Project:</label>
                        <input
                          name="currently_in_project"
                          value={candidateDetails.currently_in_project ? "Yes" : "No"}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="us_entry_date">US Entry Date:</label>
                        <input
                          type="text"
                          name="us_entry_date"
                          value={
                            candidateDetails.us_entry_date
                              ? new Date(candidateDetails.us_entry_date).toLocaleDateString("en-US")
                              : ""
                          }
                          onChange={handleChange}
                          // placeholder="MM/DD/YYYY"
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">University:</label>
                        <input
                          type="text"
                          name="university_name"
                          value={candidateDetails.university_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Visa at the time of US Entry:</label>
                        <input
                          type="text"
                          name="us_entry_visa"
                          value={candidateDetails.us_entry_visa}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Offer Letter Status:</label>
                        <input
                          name="opt_letter_status"
                          value={candidateDetails.opt_letter_status}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent ">
                        <label htmlFor="">Comments:</label>
                        <input type="text" name="comments" value={candidateDetails.comments} onChange={handleChange} />
                      </div>

                      <div className="inputComponent ">
                        <label htmlFor="">Onboarded Company</label>
                        <input
                          type="text"
                          name="onboarded_company"
                          value={candidateDetails.onboarded_company}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent col-span-3">
                        <label htmlFor="">One Drive:</label>
                        <input
                          type="text"
                          name="candidate_onedrive_link"
                          value={candidateDetails.candidate_onedrive_link}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeNav === "tab2" && (
            <div className="top-head-data details">
              <div>Files & Documents</div>
            </div>
          )}

          {activeNav === "tab3" && (
            <div className="candidate-info-data">
              <div className="candidateEditForm second-navbar">
                <div className="header-main">
                  <img src={FileDoc} alt="" srcset="" />
                  <p className="title">Files & Documents : </p>
                  <img src={Date_marketing} alt="" srcset="" />
                  <p className="title">Onboarded Company : {candidateDetails.onboarded_company}</p>
                  <img src={sub} alt="" srcset="" />
                  <p className="title">Submissions : {localData.candidate_rateconfirmations.length}</p>
                </div>
                <div className="mainContent">
                  <section>
                    <div className="legendHeading">
                      <img src={General} alt="" srcset="" />
                      <h5>Marketing Details</h5>
                      <span className="divider1"></span>
                    </div>
                    <div className="grid">
                      <div className="inputComponent">
                        <label htmlFor="">Marketing Starting Date:</label>
                        <input
                          type="text"
                          name="marketing_start_date"
                          value={candidateDetails.marketing_start_date}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={candidateDetails.first_name}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={candidateDetails.last_name}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Primary Email</label>
                        <input
                          type="text"
                          name="primary_email"
                          value={candidateDetails.primary_email}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Secondary Email</label>
                        <input
                          type="text"
                          name="secondary_email"
                          value={candidateDetails.secondary_email}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Primary Contact</label>
                        <input
                          type="text"
                          name="primary_contact"
                          value={candidateDetails.primary_contact}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>
                      <div className="inputComponent">
                        <label htmlFor="">Secondary Contact</label>
                        <input
                          type="text"
                          name="secondary_contact"
                          value={candidateDetails.secondary_contact}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Assigned Recruiter:</label>
                        <input
                          name="assigned_recruiter"
                          value={candidateDetails.assigned_recruiter}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Availability:</label>
                        <input
                          name="availability"
                          value={candidateDetails.availability}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">C-Visa Status</label>
                        <input
                          name="cvisa_status"
                          value={candidateDetails.cvisa_status}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Assigned Team:</label>
                        <input
                          name="assigned_team"
                          value={candidateDetails.assigned_team}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Primary Technology:</label>
                        <input
                          type="text"
                          name="primary_technology"
                          value={candidateDetails.primary_technology}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Secondary Technology:</label>
                        <input
                          type="text"
                          name="secondary_technology"
                          value={candidateDetails.secondary_technology}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="inputComponent">
                        <label htmlFor="">Location Preference</label>
                        <input
                          name="location_preference"
                          value={candidateDetails.location_preference}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeNav === "tab4" && (
            <div className="candidate-info-data">
              <div className="candidateEditForm second-navbar">
                <div className="header-main">
                  <img src={FileDoc} alt="" />
                  <p className="title">Files & Documents : </p>
                  <img src={Date_marketing} alt="" />
                  <p className="title">Onboarded Company : {candidateDetails.onboarded_company}</p>
                  <img src={sub} alt="" />
                  <p className="title">Submissions : {localData.candidate_rateconfirmations.length}</p>
                </div>

                <div className="mainContent">
                  <div className="table-container">
                    <table className="dynamic-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Recruiter</th>
                          <th>Vendor</th>
                          <th>Rate</th>
                          <th>Submission Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localData.candidate_rateconfirmations.length > 0 ? (
                          // Sort the array by `submission_date` in descending order before mapping
                          [...localData.candidate_rateconfirmations]
                            .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
                            .map((item, index) => (
                              <tr key={index}>
                                <td>
                                  {item.submission_date
                                    ? new Date(item.submission_date).toLocaleDateString("en-US")
                                    : "N/A"}
                                </td>
                                <td>{item.from_email || "N/A"}</td>
                                <td>{item.client_name || "N/A"}</td>
                                <td>{item.rate || "N/A"}</td>
                                <td>{item.submission_status || "N/A"}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CandidateDetails;
