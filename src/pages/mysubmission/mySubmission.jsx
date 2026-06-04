import React from "react";
import RateCandidates from "../rateConfirmation/rateConfirmation";
import { useAuth } from "../../authContext";

function MySubmission() {
  const { isLoggedIn, login, user } = useAuth();

  return (
    <RateCandidates
      title="My Submissions"
      hidefilter={["Recruiter"]}
      extraPayload={{ assigned_recruiter_email: user?.email }}
    />
  );
}

export default MySubmission;

// older page as it is

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../authContext";
// import Dashnav from "../../components/dashnav";
// import "./style.css";
// import "../benchcandidate/sidebarStyle.css";
// import "../rateConfirmation/rateStyles.css";
// import ProfileDef from "./profileIcon.svg";
// import PageIcon from "./DashIcon.svg";
// import BenchIcon from "../benchcandidate/benchIcon.svg";
// import TopUser from "../../images/top-user.svg";
// import Profile from "../../images/your-profile.svg";
// import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
// import AddIcon from "../../images/add-btn-icon.svg";
// import { ReactComponent as ActionIcon } from "../../images/actions-icon.svg";
// import { ReactComponent as EditIconButton } from "../../images/icon-edit.svg";
// import { ReactComponent as DeleteIcon } from "../../images/icon-delete.svg";
// import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
// import { ReactComponent as Female } from "../../images/female.svg";
// import { ReactComponent as Others } from "../../images/otherGender.svg";
// import { useGlobalContext } from "../../globalContext";

// // Modal Component
// const CandidateModal = ({ candidate, onClose }) => {
//   if (!candidate) return null;
//   return (
//     <div className="modal-f-popup">
//       <div className="modal-content col-flex">
//         <h3>Candidate Details</h3>
//         <div className="details row-flex">
//           <span className="object">Full Name:</span>
//           <span className="value">{candidate.candidate_full_name}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Assigned Recruiter:</span>
//           <span className="value">{candidate.from_email}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">vendor:</span>
//           <span className="value">{candidate.to_email}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Client Name:</span>
//           <span className="value">{candidate.client_name}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Rate:</span>
//           <span className="value">{candidate.rate}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Email:</span>
//           <span className="value">{candidate.email}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Contact:</span>
//           <span className="value">{candidate.contact}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Submission Status:</span>
//           <span className="value">{candidate.submission_status}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Submission Date:</span>
//           <span className="value">{new Date(candidate.submission_date).toLocaleDateString()}</span>
//         </div>
//         <div className="details row-flex">
//           <span className="object">Signature:</span>
//           <span className="value">{candidate.signature}</span>
//         </div>
//         <button className="close-modal" onClick={onClose}>
//           +
//         </button>
//       </div>
//     </div>
//   );
// };

// const MySubmission = () => {
//   const { isLoggedIn, login, user } = useAuth();
//   const navigate = useNavigate();

//   // State to store candidate details
//   const [candidates, setCandidates] = useState([]);
//   const [filteredCandidates, setFilteredCandidates] = useState([]);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [searchTermSubmission, setsearchTermSubmission] = useState("");
//   const [recruiterFilter, setRecruiterFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [dataDelete, setDataDelete] = useState(false);
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [emailAttempted, setEmailAttempted] = useState(false); // Track if email has been attempted
//   const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list
//   let storedUser = JSON.parse(localStorage.getItem("user")) || "";

//   function goToAssigned() {
//     navigate("/myAssignedCandidates");
//   }
//   // useEffect(() => {
//   //     // Check if user and user.email are available
//   //     if (user && user.email) {
//   //         const fetchCandidates = (email) => {
//   //             fetch('https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api', {
//   //                 method: 'POST',
//   //                 headers: {
//   //                     'Content-Type': 'application/json',
//   //                 },
//   //                 body: JSON.stringify({
//   //                     query: `SELECT from_email, to_email, candidate_full_name, client_name, rate, email,
//   //                     contact, signature, submission_status, submission_date, thread_id, id
//   //                             FROM foursphere_recruiters.candidate_rateconfirmations
//   //                             WHERE from_email = '${email}'`
//   //                 })
//   //             })
//   //                 .then(response => response.json())
//   //                 .then(data => {
//   //                     if (data && data.length > 0) {
//   //                         setCandidates(data); // Set candidate data
//   //                         setEmailAttempted(true); // Mark email as attempted
//   //                     } else {
//   //                         if (!emailAttempted) {
//   //                             // Capitalize the first letter of email and resubmit
//   //                             const modifiedEmail = user.email.charAt(0).toUpperCase() + user.email.slice(1);
//   //                             console.log("modifiedEmail,",modifiedEmail);

//   //                             fetchCandidates(modifiedEmail);
//   //                             setEmailAttempted(true); // Mark email as attempted
//   //                         }
//   //                     }
//   //                 })
//   //                 .catch(error => console.error('Error fetching candidate details:', error));
//   //         };

//   //         fetchCandidates(user.email); // Fetch candidates initially
//   //     }
//   // }, [user, user?.email, emailAttempted]); // Ensure user and user.email are correctly handled

//   useEffect(() => {
//     if (storedUser) {
//       fetch("https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           emailid: storedUser.email,
//           assigned_recruiter_email: storedUser.email,
//           role: storedUser.user_role,
//         }),
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           const candidates = Object.entries(data).map(([key, value]) => {
//             const id = key.includes(":") ? key.split(": ")[1] : key;
//             return {
//               id,
//               ...value,
//             };
//           });
//           console.log("Transformed candidates: ", candidates);

//           setCandidates(candidates); // Set the candidates state
//           setDataDelete(false);
//         })
//         .catch((error) => console.error("Error fetching candidates:", error));
//     }
//   }, []);

//   useEffect(() => {
//     const fetchRecruiters = async () => {
//       try {
//         const response = await fetch(
//           "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               emailid: storedUser.email,
//               role: "admin",
//             }),
//           }
//         );

//         const data = await response.json();
//         if (response.ok) {
//           // Extract unique recruiters list with their ID
//           const recruiters = Object.entries(data).map(([key, value]) => ({
//             id: key.includes(":") ? key.split(": ")[1] : key, // Extract id
//             assigned_recruiter: value.assigned_recruiter || "Unknown", // Extract assigned_recruiter or default to "Unknown"
//           }));

//           // Update state with the extracted data
//           setRecruitersList(recruiters);
//           console.log("Recruiters List:", recruiters);
//         } else {
//           console.error("Failed to fetch recruiters:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching recruiters:", error);
//       }
//     };

//     fetchRecruiters();
//   }, []);

//   const ProfileOpen = () => {
//     navigate("/userProfile");
//   };

//   useEffect(() => {
//     let filtered = candidates;

//     // Chain filters sequentially for performance
//     // Search by name
//     if (searchTermSubmission) {
//       filtered = filtered.filter((candidate) =>
//         candidate.candidate_full_name.toLowerCase().includes(searchTermSubmission.toLowerCase())
//       );
//     }

//     // Search by recruiter mail
//     if (recruiterFilter) {
//       filtered = filtered.filter((candidate) =>
//         candidate.from_email.toLowerCase().includes(recruiterFilter.toLowerCase())
//       );
//     }

//     // Filter by submission status
//     filtered = filtered.filter((candidate) => {
//       if (!statusFilter) return true;
//       return candidate.submission_status === statusFilter;
//     });

//     // Function to convert a date to midnight in a specific time zone
//     const convertToMidnightInTimeZone = (date, offset) => {
//       // Convert the date to UTC
//       const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

//       // Adjust the time to the target time zone by applying the offset (in hours)
//       const targetDate = new Date(utcDate.getTime() + offset * 60 * 60 * 1000);

//       // Return the target date normalized to midnight
//       return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
//     };

//     // Time zone offsets (in hours) relative to UTC
//     const timeZoneOffsets = {
//       PST: -8, // Pacific Standard Time (UTC-8)
//       MST: -7, // Mountain Standard Time (UTC-7)
//       CST: -6, // Central Standard Time (UTC-6)
//       EST: -5, // Eastern Standard Time (UTC-5)
//       IST: 5.5, // Indian Standard Time (UTC+5:30)
//     };

//     // Define your time zone here (e.g., 'PST', 'IST', etc.)
//     const selectedTimeZone = "IST";

//     // Filter by submission date using the selected time zone
//     filtered = filtered.filter((candidate) => {
//       if (!dateFilter) return true;

//       // Create Date objects from candidate.submission_date and dateFilter
//       let candidateDate = new Date(candidate.submission_date);
//       let filterDate = new Date(dateFilter);

//       // Get the offset for the selected time zone
//       const timeZoneOffset = timeZoneOffsets[selectedTimeZone];

//       // Normalize both dates to midnight in the target time zone
//       const candidateMidnight = convertToMidnightInTimeZone(candidateDate, timeZoneOffset);
//       const filterMidnight = convertToMidnightInTimeZone(filterDate, timeZoneOffset);

//       // Compare only the date part (no time involved)
//       return candidateMidnight.getTime() === filterMidnight.getTime();
//     });

//     // Sort by submission date in ascending order
//     filtered.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

//     // Update the state with filtered candidates
//     setFilteredCandidates(filtered);
//   }, [searchTermSubmission, recruiterFilter, statusFilter, dateFilter, candidates]);

//   const openModal = (candidate) => {
//     setSelectedCandidate(candidate);
//   };

//   const closeModal = () => {
//     setSelectedCandidate(null);
//   };

//   const handleStatusChange = (event, candidate) => {
//     const updatedStatus = event.target.value;

//     // Update status in the database using candidate id
//     fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         query: `
//                     UPDATE foursphere_recruiters.candidate_rateconfirmations
//                     SET submission_status='${updatedStatus}'
//                     WHERE id='${candidate.id}'`, // Update by id instead of email
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("Status updated:", data);

//         // Update the local state to reflect the change based on id
//         setFilteredCandidates((prevCandidates) =>
//           prevCandidates.map((c) => (c.id === candidate.id ? { ...c, submission_status: updatedStatus } : c))
//         );
//       })
//       .catch((error) => console.error("Error updating status:", error));
//   };

//   const handleDelete = async (candidateId) => {
//     if (window.confirm("Are you sure you want to delete this candidate?")) {
//       try {
//         const response = await fetch(
//           `https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               query: `DELETE FROM foursphere_recruiters.candidate_rateconfirmations WHERE id = ${candidateId}`,
//             }),
//           }
//         );

//         if (response.ok) {
//           // Refresh the candidate list or update the state
//           alert("Candidate deleted successfully.");
//           setDataDelete(true); // Trigger a re-fetch of candidates to reflect the deleted candidate
//           // Example: Fetch candidates again
//         } else {
//           throw new Error("Failed to delete candidate.");
//         }
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   const navigateCandidatDetails = (id) => {
//     navigate(`/benchcandidates/details?id=${id}`);
//   };

//   function candidateAddButton() {
//     navigate("/registerNewCandidates");
//   }

//   const [currentPage, setCurrentPage] = useState(1);
//   const jobsPerPage = 15;

//   const totalPages = Math.ceil(filteredCandidates.length / jobsPerPage);

//   // Calculate the start and end indices for the current page
//   const indexOfLastJob = currentPage * jobsPerPage;
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage;

//   // Get the filteredCandidates for the current page
//   const currentJobs = filteredCandidates.slice(indexOfFirstJob, indexOfLastJob);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const handlePageInputChange = (e) => {
//     const pageNum = Number(e.target.value);
//     if (pageNum >= 1 && pageNum <= totalPages) {
//       setCurrentPage(pageNum);
//     }
//   };

//   useEffect(() => {
//     handlePageChange(currentPage);
//   }, [currentPage]);

//   return (
//     <div>
//       <div className="main-dash row-flex">
//
//         <section className="w-100 scroll-bar bottom-sidebar">
//           <div className="top-section row-flex">
//             <img src={TopUser} alt="" />
//             <p className="title-left">My Submission</p>
//             <button className="profile-button-right" onClick={ProfileOpen}>
//               <img src={Profile} alt="" className="profile" />
//               Your Profile
//             </button>
//           </div>

//           <div className="filters row-flex">
//             <div className="filters-left">
//               <input
//                 type="text"
//                 placeholder="Search by name"
//                 value={searchTermSubmission}
//                 onChange={(e) => setsearchTermSubmission(e.target.value)}
//               />

//               <select
//                 type="text"
//                 placeholder="Select Recruiter"
//                 value={recruiterFilter}
//                 onChange={(e) => setRecruiterFilter(e.target.value)}
//               >
//                 <option value="">Select Recruiter</option>
//                 {[...new Set(recruitersList.map((item) => item.assigned_recruiter))].map((mailRecruiter, index) => (
//                   <option key={index} value={mailRecruiter}>
//                     {mailRecruiter}
//                   </option>
//                 ))}
//               </select>

//               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//                 <option value="">Filter By submission</option>
//                 <option value="submitted to vendor">submitted to vendor</option>
//                 <option value="under review">under review</option>
//                 <option value="Shortlisted">Shortlisted</option>
//                 <option value="Not Shortlisted">Not Shortlisted</option>
//                 <option value="Technical Screening">Technical Screening</option>
//                 <option value="Interview Round 1">Interview Round 1</option>
//                 <option value="Interview Round 2">Interview Round 2</option>
//                 <option value="Interview Round 3">Interview Round 3</option>
//                 <option value="Interview Rejected">Interview Rejected</option>
//               </select>

//               <input
//                 type="date"
//                 className="login-input"
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value)}
//               />
//             </div>
//             <div className="filters-right">
//               <button>
//                 <img src={AddIcon} />
//               </button>
//               <div>Candidates: {filteredCandidates.length}</div>
//             </div>
//           </div>

//           <div className="mainContent">
//             <div className="table-container">
//               <table className="dynamic-table-data">
//                 <thead>
//                   <tr>
//                     <th>
//                       <div className="alignCenter">
//                         <CandidateNameIcon />
//                         Full Name
//                       </div>
//                     </th>
//                     <th>
//                       <div className="alignCenter">
//                         {/* <EmailIcon /> */}
//                         Client Name
//                       </div>
//                     </th>
//                     <th>
//                       <div className="alignCenter">
//                         {/* <VisaIcon /> */}
//                         Assigned Recruiter
//                       </div>
//                     </th>
//                     <th>
//                       <div className="alignCenter">
//                         {/* <CompanyIcon /> */}
//                         Vendor
//                       </div>
//                     </th>
//                     <th>
//                       <div className="alignCenter">
//                         {/* <StatusIcon /> */}
//                         Rate
//                       </div>
//                     </th>
//                     <th>
//                       <div className="alignCenter">
//                         {/* <ActionIcon /> */}
//                         Submission Status
//                       </div>
//                     </th>

//                     <th>
//                       <div className="alignCenter">
//                         {/* <ActionIcon /> */}
//                         Submission Date
//                       </div>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentJobs.map((items) => (
//                     <tr>
//                       <td
//                         className={`status-change-statuschange name ${
//                           items.gender === "Male" ? "Male" : items.gender === "Female" ? "Female" : "Other"
//                         }`}
//                         onClick={() => navigateCandidatDetails(items.id)}
//                       >
//                         <div className="alignCenter">
//                           {items.gender === "Male" ? (
//                             <NameUserIcon />
//                           ) : items.gender === "Female" ? (
//                             <Female />
//                           ) : (
//                             <Others />
//                           )}

//                           <span>{items.candidate_full_name || " "}</span>
//                         </div>
//                         {/*
//                                                                                             <div className="alignCenter">
//                                                                                                 <img src={NameUserIcon} />
//                                                                                                 {items.candidate_full_name}
//                                                                                             </div> */}
//                       </td>

//                       <td>{items.client_name || "N/A"}</td>

//                       <td>{items.from_email.replace("$", "")}</td>

//                       {/* <td>{candidate.onboarded_company}</td> */}
//                       <td>{items.to_email.replace("$", "")}</td>

//                       <td>{items.rate.replace("$", "")}</td>

//                       <td className="onboarded-data">
//                         <select
//                           className="company-data"
//                           value={items.submission_status}
//                           onChange={(e) => handleStatusChange(e, items)}
//                         >
//                           <option value="">Select Option</option>
//                           <option value="submitted to vendor">submitted to vendor</option>
//                           <option value="under review">under review</option>
//                           <option value="Shortlisted">Shortlisted</option>
//                           <option value="Not Shortlisted">Not Shortlisted</option>
//                           <option value="Technical Screening">Technical Screening</option>
//                           <option value="Interview Round 1">Interview Round 1</option>
//                           <option value="Interview Round 2">Interview Round 2</option>
//                           <option value="Interview Round 3">Interview Round 3</option>
//                           <option value="Interview Rejected">Interview Rejected</option>
//                         </select>
//                       </td>

//                       <td>
//                         {new Date(items.submission_date).toLocaleDateString("en-US", {
//                           month: "numeric",
//                           day: "numeric",
//                           year: "numeric",
//                         })}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <div className="row-flex navigation" style={{ marginTop: "10px" }}>
//                   <button
//                     className="left nav"
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                   >
//                     <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
//                       <path
//                         d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
//                         fill="#341FA8"
//                       />
//                     </svg>
//                   </button>
//                   <span style={{ margin: "0 10px" }} className="text">
//                     Page {currentPage} of {totalPages}
//                   </span>
//                   <button
//                     className="nav"
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                   >
//                     <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
//                       <path
//                         d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
//                         fill="#341FA8"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </table>
//             </div>
//           </div>
//         </section>
//       </div>
//       {selectedCandidate && <CandidateModal candidate={selectedCandidate} onClose={closeModal} />}
//     </div>
//   );
// };

// export default MySubmission;
