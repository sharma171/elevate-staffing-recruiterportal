import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashnav from "../../components/dashnav";
import "./rateStyles.css";
import "../benchcandidate/style.css";
import "../benchcandidate/sidebarStyle.css";
import ProfileDef from "../dashboard/profileIcon.svg";
import BenchIcon from "../benchcandidate/benchIcon.svg";
import TopUser from "../../images/top-user.svg";
import Profile from "../../images/your-profile.svg";
import AddIcon from "../../images/add-btn-icon.svg";
import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
import { ReactComponent as ActionIcon } from "../../images/actions-icon.svg";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as DeleteIcon } from "../../images/icon-delete.svg";
import { ReactComponent as EditIconButton } from "../../images/icon-edit.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { useGlobalContext } from "../../globalContext";
import { useAuth } from "../../authContext";
import makeRequest from "../../helpers/http-request";

// Modal Component
const CandidateModal = ({ candidate, onClose }) => {
  if (!candidate) return null;
  return (
    <div className="modal-f-popup">
      <div className="modal-content col-flex">
        <h3>Candidate Details</h3>
        <div className="details row-flex">
          <span className="object">Full Name:</span>
          <span className="value">{candidate.candidate_full_name}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Assigned Recruiter:</span>
          <span className="value">{candidate.from_email}</span>
        </div>
        <div className="details row-flex">
          <span className="object">vendor:</span>
          <span className="value">{candidate.to_email}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Client Name:</span>
          <span className="value">{candidate.client_name}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Rate:</span>
          <span className="value">{candidate.rate}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Email:</span>
          <span className="value">{candidate.email}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Contact:</span>
          <span className="value">{candidate.contact}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Submission Status:</span>
          <span className="value">{candidate.submission_status}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Submission Date:</span>
          <span className="value">{new Date(candidate.submission_date).toLocaleDateString()}</span>
        </div>
        <div className="details row-flex">
          <span className="object">Signature:</span>
          <span className="value">{candidate.signature}</span>
        </div>
        <button className="close-modal" onClick={onClose}>
          +
        </button>
      </div>
    </div>
  );
};

const RateCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recruiterRateFilter, setRecruiterRateFilter] = useState("");
  const [statusRateFilter, setstatusRateFilter] = useState("");
  const [dateRateFilter, setdateRateFilter] = useState("");
  const [dataDelete, setDataDelete] = useState(false);
  const navigate = useNavigate();
  const [recruitersList, setRecruitersList] = useState([]);
  const { user } = useAuth();

  let storedUser = JSON.parse(localStorage.getItem("user")) || "";

  useEffect(() => {
    if (storedUser) {
      fetch("https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: storedUser.email,
          role: storedUser.user_role,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const candidates = Object.entries(data).map(([key, value]) => {
            const id = key.includes(":") ? key.split(": ")[1] : key;
            return {
              id,
              ...value,
            };
          });

          setCandidates(candidates);
          setDataDelete(false);
        })
        .catch((error) => console.error("Error fetching candidates:", error));
    }
    // Fetch candidates data on component mount
  }, [dataDelete]);

  useEffect(() => {
    if (user?.email) {
      fetchRecruiters();
    }
  }, [user?.email]);

  const fetchRecruiters = async () => {
    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailid: user?.email,
            role: "admin",
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Extract unique recruiters list with their ID
        const recruiters = Object.entries(data).map(([key, value]) => ({
          id: key.includes(":") ? key.split(": ")[1] : key, // Extract id
          assigned_recruiter: value.assigned_recruiter || "Unknown", // Extract assigned_recruiter or default to "Unknown"
        }));

        // Update state with the extracted data
        setRecruitersList(recruiters);
        console.log("Recruiters List:", recruiters);
      } else {
        console.error("Failed to fetch recruiters:", data.message);
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  useEffect(() => {
    if (!candidates) return;

    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter((candidate) =>
        candidate.candidate_full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (recruiterRateFilter) {
      filtered = filtered.filter((candidate) =>
        candidate.from_email.toLowerCase().includes(recruiterRateFilter.toLowerCase())
      );
    }

    if (statusRateFilter) {
      filtered = filtered.filter((candidate) => candidate.submission_status === statusRateFilter);
    }

    if (dateRateFilter) {
      const filterDate = new Date(dateRateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter((candidate) => {
        return new Date(candidate.submission_date).setHours(0, 0, 0, 0) === filterDate;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.submission_date);
      const dateB = new Date(b.submission_date);

      const isValidA = !isNaN(dateA);
      const isValidB = !isNaN(dateB);

      if (!isValidA && !isValidB) return 0;
      if (!isValidA) return 1;
      if (!isValidB) return -1;

      return dateB - dateA;
    });

    setFilteredCandidates(filtered);
  }, [searchTerm, recruiterRateFilter, statusRateFilter, dateRateFilter, candidates]);

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  const handleStatusChange = async (event, candidate) => {
    const updatedStatus = event.target.value;

    // Update status in the database using candidate id
    fetch("https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        emailid: storedUser.email,
        modify: {
          id: candidate.id,
          columns: {
            submission_status: updatedStatus,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Status updated:", data);

        // Update the local state to reflect the change based on id
        setFilteredCandidates((prevCandidates) =>
          prevCandidates.map((c) => (c.id === candidate.id ? { ...c, submission_status: updatedStatus } : c))
        );
      })
      .catch((error) => console.error("Error updating status:", error));
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        const response = await fetch(
          `https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: user.email,
              query: `DELETE FROM foursphere_recruiters.candidate_rateconfirmations WHERE id = ${candidateId}`,
            }),
          }
        );

        if (response.ok) {
          // Refresh the candidate list or update the state
          alert("Candidate deleted successfully.");
          setDataDelete(true); // Trigger a re-fetch of candidates to reflect the deleted candidate
          // Example: Fetch candidates again
        } else {
          throw new Error("Failed to delete candidate.");
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  function profileNavigator() {
    navigate("/profile");
  }

  const ProfileOpen = () => {
    navigate("/userProfile");
  };

  function candidateAddButton() {
    navigate("/registerNewCandidates");
  }

  const navigateCandidatDetails = (id) => {
    navigate(`/benchcandidates/details?id=${id}`);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 15;

  const totalPages = Math.ceil(filteredCandidates.length / jobsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  // Get the filteredCandidates for the current page
  const currentJobs = filteredCandidates.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageInputChange = (e) => {
    const pageNum = Number(e.target.value);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  useEffect(() => {
    handlePageChange(currentPage);
  }, [currentPage]);
  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100 scroll-bar bottom-sidebar">
          <div className="top-section row-flex">
            <img src={TopUser} alt="" />
            <p className="title-left">My Rate Confirmations</p>
            {/* <button className="profile-button-right" onClick={ProfileOpen}>
              <img src={Profile} alt="" className="profile" />
              Your Profile
            </button> */}
          </div>

          <div className="filters row-flex">
            <div className="filters-left">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                type="text"
                placeholder="Select Recruiter"
                value={recruiterRateFilter}
                onChange={(e) => setRecruiterRateFilter(e.target.value)}
              >
                <option value="">Select Recruiter</option>
                {[...new Set(recruitersList.map((item) => item.assigned_recruiter))].map((mailRecruiter, index) => (
                  <option key={index} value={mailRecruiter}>
                    {mailRecruiter}
                  </option>
                ))}
              </select>

              <select value={statusRateFilter} onChange={(e) => setstatusRateFilter(e.target.value)}>
                <option value="">Filter By submission</option>
                <option value="submitted to vendor">submitted to vendor</option>
                <option value="under review">under review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Not Shortlisted">Not Shortlisted</option>
                <option value="Technical Screening">Technical Screening</option>
                <option value="Interview Round 1">Interview Round 1</option>
                <option value="Interview Round 2">Interview Round 2</option>
                <option value="Interview Round 3">Interview Round 3</option>
                <option value="Interview Rejected">Interview Rejected</option>
              </select>

              <input
                type="date"
                className="login-input"
                value={dateRateFilter}
                onChange={(e) => setdateRateFilter(e.target.value)}
              />
            </div>
            <div className="filters-right">
              {/* <button><img src={AddIcon} alt="images"/>
                            </button> */}
              <div>Candidates: {filteredCandidates.length}</div>
            </div>
          </div>

          <div className="mainContent">
            <div className="table-container">
              <table className="dynamic-table-data">
                <thead>
                  <tr>
                    <th>
                      <div className="alignCenter">
                        <CandidateNameIcon />
                        Full Name
                      </div>
                    </th>
                    <th>
                      <div className="alignCenter client-name">
                        {/* <EmailIcon /> */}
                        Client Name
                      </div>
                    </th>
                    <th>
                      <div className="alignCenter">
                        {/* <VisaIcon /> */}
                        Assigned Recruiter
                      </div>
                    </th>
                    <th>
                      <div className="alignCenter vendor-name">
                        {/* <CompanyIcon /> */}
                        Vendor
                      </div>
                    </th>
                    <th>
                      <div className="alignCenter rate-class">
                        {/* <StatusIcon /> */}
                        Rate
                      </div>
                    </th>
                    <th>
                      <div className="alignCenter">
                        {/* <ActionIcon /> */}
                        Submission Status
                      </div>
                    </th>

                    <th>
                      <div className="alignCenter">
                        {/* <ActionIcon /> */}
                        Submission Date
                      </div>
                    </th>

                    <th>
                      <div className="alignCenter">
                        <ActionIcon />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((items) => (
                    <tr>
                      <td
                        className={`status-change-statuschange name ${
                          items.gender === "Male" ? "Male" : items.gender === "Female" ? "Female" : "Other"
                        }`}
                      >
                        <div className="alignCenter">
                          {items.gender === "Male" ? (
                            <NameUserIcon />
                          ) : items.gender === "Female" ? (
                            <Female />
                          ) : (
                            <Others />
                          )}

                          <span>{items.candidate_full_name || " "}</span>
                        </div>
                        {/*                                                 
                                                <div className="alignCenter">
                                                    <img src={NameUserIcon} />
                                                    {items.candidate_full_name}
                                                </div> */}
                      </td>

                      <td>
                        <div className="client-name">{items.client_name || "N/A"}</div>
                      </td>

                      <td>{items.from_email.replace("$", "")}</td>

                      {/* <td>{candidate.onboarded_company}</td> */}
                      <td>
                        <div className="vendor-name">{items.to_email.replace("$", "")}</div>
                      </td>

                      <td>
                        <div className="rate-class">{items.rate.replace("$", "")}</div>
                      </td>

                      <td className="onboarded-data">
                        <select
                          className="company-data"
                          value={items.submission_status}
                          onChange={(e) => handleStatusChange(e, items)}
                        >
                          <option value="">Select Option</option>
                          <option value="submitted to vendor">submitted to vendor</option>
                          <option value="under review">under review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Not Shortlisted">Not Shortlisted</option>
                          <option value="Technical Screening">Technical Screening</option>
                          <option value="Interview Round 1">Interview Round 1</option>
                          <option value="Interview Round 2">Interview Round 2</option>
                          <option value="Interview Round 3">Interview Round 3</option>
                          <option value="Interview Rejected">Interview Rejected</option>
                        </select>
                      </td>

                      <td>
                        {new Date(items.submission_date).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td>
                        <button className="button-icon">
                          {/* icon for Edit */}
                          <EditIconButton />
                        </button>
                        <button className="button-icon">
                          {/* icon for delete */}
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Pagination Controls */}

                <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                  <button
                    className="left nav"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                      <path
                        d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                        fill="#341FA8"
                      />
                    </svg>
                  </button>
                  <span style={{ margin: "0 10px" }} className="text">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="nav"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                      <path
                        d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                        fill="#341FA8"
                      />
                    </svg>
                  </button>
                </div>
              </table>
            </div>
          </div>
        </section>
      </div>
      {selectedCandidate && <CandidateModal candidate={selectedCandidate} onClose={closeModal} />}
    </div>
  );
};

export default RateCandidates;
