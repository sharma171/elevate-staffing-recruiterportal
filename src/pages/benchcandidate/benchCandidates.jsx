import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashnav from "../../components/dashnav";
import { useAuth } from "../../authContext";
import "./style.css";
import CandidateDetailsModal from "./CandidateDetailsModal"; // Your new modal component
import CandidateDetailsEdit from "./CandidateDetailsEdit";
import "./sidebarStyle.css";
import TopUser from "../../images/top-user.svg";
import Profile from "../../images/your-profile.svg";
import AddIcon from "../../images/add-btn-icon.svg";
import BenchDetails from "./BenchCandidateDetails";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
import { ReactComponent as EmailIcon } from "../../images/email.svg";
import { ReactComponent as ActionIcon } from "../../images/actions-icon.svg";
import { ReactComponent as CompanyIcon } from "../../images/company.svg";
import { ReactComponent as VisaIcon } from "../../images/visa-icon.svg";
import { ReactComponent as StatusIcon } from "../../images/status.svg";
import { ReactComponent as DeleteIcon } from "../../images/icon-delete.svg";
import { ReactComponent as EditIconButton } from "../../images/icon-edit.svg";
import { ReactComponent as RightTickIcon } from "../../images/icon-right-tick.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import { ReactComponent as Arrow } from "../../images/arrow.svg";
import { useGlobalContext } from "../../globalContext";
import "react-toastify/dist/ReactToastify.css";
import DropDown from "../../components/DropDown";
import OverlayModal from "../../components/OverlayModal";
import ConfirmationDialogBox from "../../components/ConfirmationDialogBox";
import Close from "../../assets/images/Close.svg";
import { useForm } from "react-hook-form";
import Loader from "../../components/Loader";
import makeRequest from "../../helpers/http-request";

const BenchCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchBTerm, setBSearchTerm] = useState("");
  const [visaBStatusFilter, setBVisaStatusFilter] = useState("");
  const [recruiterBFilter, setBRecruiterFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [candidateCount, setCandidateCount] = useState("");
  const [recruitersBList, setBRecruitersList] = useState([]); // State for recruiters list
  const [teamsBFilter, setBTeamsFilter] = useState("");
  const [priorityBFilter, setPriorityBFilter] = useState("");
  const [currentStatusBench, setCurrentStatusBench] = useState("");
  const [dataDelete, setDataDelete] = useState(false);
  const navigate = useNavigate();
  const [openDetails, setOPenDetails] = useState(false);
  const [onBoardedCompany, setOnBoardedCompany] = useState("");
  const [isModalActive, setIsModalActive] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [update, setUpdate] = useState(false);
  const [modalPageCount, setModalPageCount] = useState(1);
  const [formData, setFormData] = useState({});
  let storedUser = JSON.parse(localStorage.getItem("user"));

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const { user } = useAuth();

  const getCandidates = async () => {
    setCandidates([]);
    let storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("storedUser: ", storedUser);

    if (storedUser) {
      fetch("https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3", {
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
          console.log("Transformed candidates: ", candidates);

          setCandidates(candidates); // Set the candidates state
          setDataDelete(false);
        })
        .catch((error) => console.error("Error fetching candidates:", error));
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailid: user.email,
            operation: "retrieve",
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("data===============", data);
        // Extract unique recruiters list with their ID
        const recruiters = data.data.map((item) => ({
          // Extract id

          value: item.recruiter_alias_name,
          text: item?.details[0]?.recruiter_name,
          // recruiter_alias_name: item.recruiter_alias_name || "Unknown"  // Extract assigned_recruiter or default to "Unknown"
        }));

        // Update state with the extracted data
        setBRecruitersList(recruiters);
      } else {
        console.error("Failed to fetch recruiters:", data.message);
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  // Fetch recruiters list from the API
  useEffect(() => {
    if (user?.email) {
      fetchRecruiters();
    }
  }, [user?.email]);

  useEffect(() => {
    getCandidates();
  }, []);

  useEffect(() => {
    let filtered = candidates;

    // Search by name
    if (searchBTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.first_name.toLowerCase().includes(searchBTerm.toLowerCase()) ||
          candidate.last_name.toLowerCase().includes(searchBTerm.toLowerCase())
      );
    }

    // Filter by visa status
    if (visaBStatusFilter) {
      filtered = filtered.filter((candidate) => {
        return candidate.visa_status === visaBStatusFilter.value;
      });
    }

    // Filter by assigned recruiter
    if (recruiterBFilter) {
      filtered = filtered.filter((candidate) => candidate.assigned_recruiter === recruiterBFilter.value);
    }

    // Filter by Current status
    if (currentStatusBench) {
      filtered = filtered.filter((candidate) => candidate.current_status === currentStatusBench.value);
    }

    if (teamsBFilter) {
      filtered = filtered.filter((candidate) => {
        return candidate.assigned_team === teamsBFilter.value;
      });
    }

    if (priorityBFilter) {
      filtered = filtered.filter((candidate) => {
        return candidate.priority == priorityBFilter.value;
      });
    }

    // Filter by location preference
    if (locationFilter) {
      filtered = filtered.filter((candidate) => candidate.location_preference === locationFilter);
    }

    setFilteredCandidates(filtered);
  }, [
    searchBTerm,
    visaBStatusFilter,
    recruiterBFilter,
    locationFilter,
    currentStatusBench,
    teamsBFilter,
    priorityBFilter,
    candidates,
  ]);

  const openModal = (id) => {
    console.log("EDIT");

    navigate(`/benchcandidates/details/edit?id=${id}`);
    setSelectedCandidate(null);
  };

  const sortCandidatesByFirstName = (candidates) => {
    return candidates.length
      ? candidates.sort((a, b) => {
          // Safely check if first_name exists, sort alphabetically by first_name
          const nameA = a.first_name ? a.first_name.toLowerCase() : "";
          const nameB = b.first_name ? b.first_name.toLowerCase() : "";

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        })
      : [];
  };

  // Example usage in your component
  const sortedCandidates = sortCandidatesByFirstName(filteredCandidates);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const totalPages = Math.ceil(sortedCandidates.length / jobsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  // Get the sortedCandidates for the current page
  const currentJobs = sortedCandidates.slice(indexOfFirstJob, indexOfLastJob);

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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Modal state
  const [currentCandidate, setCurrentCandidate] = useState(null); // Candidate data
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false); // Subview modal state

  const navigateCandidatDetails = (id) => {
    navigate(`/details?id=${id}`);
    // setOPenDetails(true);
  };

  // Function to open the additional modal/subview
  const handleOpenAdditionalModal = () => {
    setIsAdditionalModalOpen(true); // Open additional modal/subview
  };

  // Close functions for both modals
  const handleCloseDetailsModal = () => setIsDetailsModalOpen(false);
  const handleCloseAdditionalModal = () => setIsAdditionalModalOpen(false);

  //delete the hovered bench Candidate
  const deleteCandidate = async (candidate) => {
    if (window.confirm("Are you sure you want to delete")) {
      try {
        const response = await fetch(
          `https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: user.email,

              operation: "delete",

              id: `${candidate}`,
            }),
          }
        );
        if (response.ok) {
          // alert candidate is deleted and list is updated
          // alert('clicked candidate is Deleted successfully and list is updated');
          // toast.success('Candidate Deleted successfully', {
          //                         draggable: "true",
          //                         autoClose: 2000,
          //                         className: "toast-center",
          //                     });
          setDataDelete(true);
          getCandidates();
        } else {
          throw new Error("failed to delete candidates");
        }
      } catch (error) {
        console.error("Error deleting candidate:" + error.message);
      }
    }
  };

  const addCandidate = async (data) => {
    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3";

      const payLoad = {
        url,
        method: "POST",
        data: {
          emailid: storedUser.email,
          operation: "insert",
          columns: {
            gender: `${data.gender || ""}`,
            first_name: `${data.first_name || ""}`,
            last_name: `${data.last_name || ""}`,
            primary_email: `${data.primary_email || ""}`,
            secondary_email: `${data.secondary_email || ""}`,
            primary_contact: `${data.primary_contact || ""}`,
            secondary_contact: `${data.secondary_contact || ""}`,
            location_preference: `${data.location_preference || ""}`,
            visa_status: `${data.visa_status || ""}`,
            current_status: `${data.current_status || ""}`,
            currently_in_project: `${data.currently_in_project || ""}`,
            availability: `${data.availability || ""}`,
            candidate_onedrive_link: `${data.candidate_onedrive_link || ""}`,
            comments: `${data.comments || ""}`,
            cvisa_status: `${data.cvisa_status || ""}`,
            primary_technology: `${data.primary_technology || ""}`,
            secondary_technology: `${data.secondary_technology || ""}`,
            assigned_recruiter: `${data.assigned_recruiter || ""}`,
            assigned_team: `${data.assigned_team || ""}`,
            university_name: `${data.university_name || ""}`,
            us_entry_date: `${data.us_entry_date || ""}`,
            marketing_start_date: `${data.marketing_start_date || ""}`,
            candidate_address1: `${data.candidate_address1 || ""}`,
            onboarded_company: `${data.onboarded_company || ""}`,
            send_work_status_email: `${data.send_work_status_email || ""}`,
            work_auth_start_date: `${data.work_auth_start_date || ""}`,
          },
        },
      };

      const res = await makeRequest(payLoad);

      if (res?.status == 200) {
        getCandidates();
        reset();
        setIsModalActive(false);
        setUpdate(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePageNext = (data) => {
    console.log("data", data);
    console.log("function called");
    setModalPageCount(modalPageCount + 1);
  };

  const updateCandidate = () => {};
  console.log("payload============");

  const ProfileOpen = () => {
    // Open the profile page
    navigate("/userProfile");
    // or navigate("/register", { replace: true }); // replace current URL with new one, without adding it to the history stack
  };

  const handleStatusChange = (event, candidate) => {
    const updatedStatus = event.target.value;
    console.log("candidtefetchdatta", candidate);

    // Update status in the database using candidate id
    fetch("https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        emailid: candidate.emailid,
        modify: {
          id: candidate.id,
          columns: {
            onboarded_company: updatedStatus,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Status updated:", data);

        // Update the local state to reflect the change based on id
        setFilteredCandidates((prevCandidates) =>
          prevCandidates.map((c) => (c.id === candidate.id ? { ...c, onboarded_company: updatedStatus } : c))
        );
      })
      .catch((error) => console.error("Error updating status:", error));
  };

  function candidateAddButton() {
    navigate("/registerNewCandidates");
  }

  const handleClearFilters = () => {
    setBSearchTerm("");
    setPriorityBFilter(null);
    setBVisaStatusFilter(null);
    setBRecruiterFilter(null);
    setCurrentStatusBench(null);
    setBTeamsFilter(null);
  };
  console.log(recruitersBList);
  return (
    <>
      <div>
        <div className="main-dash row-flex">
          {
            <section className="w-100 scroll-bar bottom-sidebar">
              <div className="top-section row-flex">
                <img src={TopUser} alt="" />
                <p className="title-left">Bench Candidates</p>
              </div>

              <div className="filters row-flex">
                <div className="filters-left">
                  <div className="teams-input">
                    <input
                      value={searchBTerm}
                      type="search"
                      placeholder="search by teams"
                      onChange={(e) => setBSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="teams-dropdown-container">
                    <DropDown
                      selected={visaBStatusFilter}
                      setSelected={setBVisaStatusFilter}
                      text="Filter by Visa"
                      data={[
                        { value: "OPT", text: "OPT" },
                        { value: "CPT", text: "CPT" },
                        { value: "H1B", text: "H1B" },
                        { value: "H4 EAD", text: "H4 EAD" },
                        { value: "GC", text: "GC" },
                        { value: "GC EAD", text: "GC EAD" },
                        { value: "USC", text: "USC" },
                        { value: "STEM OPT", text: "STEM OPT" },
                      ]}
                    />
                  </div>
                  <div className="teams-dropdown-container">
                    <DropDown
                      selected={recruiterBFilter}
                      setSelected={setBRecruiterFilter}
                      text="Filter by Recruiter"
                      data={recruitersBList}
                    />
                  </div>

                  <div className="teams-dropdown-container">
                    <DropDown
                      selected={currentStatusBench}
                      setSelected={setCurrentStatusBench}
                      text="Filter by Status"
                      data={[
                        { value: "Active", text: "Active" },
                        { value: "Inactive", text: "Inactive" },
                      ]}
                    />
                  </div>

                  <div className="teams-dropdown-container">
                    <DropDown
                      selected={teamsBFilter}
                      setSelected={setBTeamsFilter}
                      text="Filter by Team"
                      data={[
                        { value: "Teams A", text: "Team A" },
                        { value: "Teams B", text: "Team B" },
                        { value: "Teams C", text: "Team C" },
                        { value: "Pending onboarding", text: "Pending onboarding" },
                      ]}
                    />
                  </div>

                  <div className="teams-dropdown-container">
                    <DropDown
                      selected={priorityBFilter}
                      setSelected={setPriorityBFilter}
                      text="Filter by Priority"
                      data={[
                        { value: "High", text: "High" },
                        { value: "Medium", text: "Medium" },
                        { value: "Low", text: "Low" },
                      ]}
                    />
                  </div>
                  <div className="clear-filters">
                    <button className="cursor-pointer" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  </div>
                </div>
                <div className="filters-right">
                  <button className="cursor-pointer">
                    <img src={AddIcon} onClick={() => setIsModalActive(!isModalActive)} alt="candidateIcon" />
                  </button>
                  <div>Candidates: {sortedCandidates.length}</div>
                </div>
              </div>

              <div className="mainContent">
                <div className="table-container">
                  <table className="dynamic-table-data">
                    <thead>
                      <tr>
                        <th>
                          <div className="alignCenter name-col">
                            <CandidateNameIcon />
                            Candidate Name
                          </div>
                        </th>
                        <th>
                          <div className="alignCenter email-col">
                            <EmailIcon />
                            Email Id
                          </div>
                        </th>
                        <th>
                          <div className="alignCenter visa-col">
                            <VisaIcon />
                            Visa Status
                          </div>
                        </th>
                        <th>
                          <div className="alignCenter on-col">
                            {/* <CompanyIcon /> */}
                            <div style={{ marginRight: "-10px", marginTop: "5px" }}>
                              <Arrow />
                            </div>
                            Priority
                          </div>
                        </th>
                        <th>
                          <div className="alignCenter">
                            <StatusIcon />
                            Status
                          </div>
                        </th>
                        <th>
                          <div className="alignCenter">
                            <ActionIcon />
                            Action
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJobs.map((candidate) => {
                        return (
                          <tr key={candidate.id}>
                            {
                              <td
                                className={`status-change-statuschange common-cls${
                                  candidate.gender === "Male"
                                    ? "Male"
                                    : candidate.gender === "Female"
                                    ? "Female"
                                    : "Other"
                                }`}
                                onClick={() => navigateCandidatDetails(candidate.id)}
                              >
                                <div className="alignCenter common-cls">
                                  {candidate.gender === "Male" ? (
                                    <NameUserIcon />
                                  ) : candidate.gender === "Female" ? (
                                    <Female />
                                  ) : (
                                    <Others />
                                  )}

                                  <span>
                                    {candidate.first_name} {candidate.last_name || " "}
                                  </span>
                                </div>
                              </td>
                            }

                            <td>{candidate.primary_email || "N/A"}</td>

                            <td>
                              <span className="visa-change">{candidate.visa_status || "N/A"}</span>
                            </td>

                            <td style={{ color: candidate.priority == "High" ? "Red" : "Black" }}>
                              {candidate.priority ? candidate.priority : "NA"}
                            </td>

                            <td
                              className={` status-change-statuschange ${
                                candidate.current_status === "Active"
                                  ? "active"
                                  : candidate.current_status === "Inactive"
                                  ? "inactive"
                                  : "Unknown"
                              }`}
                            >
                              <div className={`status-change ${candidate.current_status}`}>
                                <span>{candidate.current_status || " "}</span>
                              </div>
                            </td>

                            <td>
                              <button onClick={() => openModal(candidate.id)} className="button-icon">
                                {/* icon for Edit */}
                                <EditIconButton />
                              </button>
                              <button onClick={() => deleteCandidate(candidate.id)} className="button-icon">
                                {/* icon for delete */}
                                <DeleteIcon />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                </div>
              </div>
            </section>
          }

          {/* {openDetails && (<BenchDetails openDetails={openDetails} setOPenDetails={setOPenDetails} />)} */}
        </div>
      </div>
      {isModalActive && (
        <OverlayModal isActive={isModalActive}>
          <div className="org-btn-container d-flex flex-column justify-start gap-3">
            <div
              className="d-flex justify-end cursor-pointer"
              onClick={() => {
                setIsModalActive(false);
              }}
            >
              <img src={Close} />
            </div>

            <p className="v2-heading">{update ? "Update  Candidate" : "Add Candidate"}</p>

            {modalPageCount == 1 && (
              <div className="org-btn-container d-flex flex-column justify-start gap-3">
                <form onSubmit={handleSubmit(handlePageNext)}>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="first_name">
                      First name
                    </label>
                    <input
                      className="v2-input"
                      id="first_name"
                      type="text"
                      placeholder="Name"
                      name="first_name"
                      {...register("first_name", {
                        required: "First name is required",
                      })}
                    />
                    {errors.first_name && <span className="v2-login-error">{errors.first_name.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="last_name">
                      Last name
                    </label>
                    <input
                      className="v2-input"
                      id="last_name"
                      type="text"
                      placeholder="Name"
                      name="last_name"
                      {...register("last_name", {
                        required: "Last name is required",
                      })}
                    />
                    {errors.last_name && <span className="v2-login-error">{errors.last_name.message}</span>}
                  </div>
                  <div className="form-container">
                    <label htmlFor="gender">Gender</label> <br />
                    <select
                      className="org-manager-dropDown"
                      id="gender"
                      name="gender"
                      {...register("gender", { required: "Gender is required" })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.gender && <span className="v2-login-error">{errors.gender.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="primary_email">
                      Primary email
                    </label>
                    <input
                      className="v2-input"
                      id="primary_email"
                      type="text"
                      placeholder="Primary email"
                      name="primary_email"
                      {...register("primary_email", {
                        required: "Email is required",
                      })}
                    />
                    {errors.primary_email && <span className="v2-login-error">{errors.primary_email.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="secondary_email">
                      Secondary email
                    </label>
                    <input
                      className="v2-input"
                      id="secondary_email"
                      type="text"
                      placeholder="Secondary email"
                      name="secondary_email"
                    />
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="primary_contact">
                      Primary Contact
                    </label>
                    <div className="phone-container d-flex justify-between">
                      <div className="width-100">
                        <input
                          className="v2-input phone-input"
                          id="primary_contact"
                          type="number"
                          placeholder="Phone"
                          {...register("primary_contact", { required: "Phone is required" })}
                        />
                      </div>
                    </div>
                    {errors.primary_contact && <span className="v2-login-error">{errors.primary_contact.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="secondary_contact">
                      Secondary contact
                    </label>
                    <div className="phone-container d-flex justify-between">
                      <div className="width-100">
                        <input
                          className="v2-input phone-input"
                          id="secondary_contact"
                          type="number"
                          placeholder="Phone"
                          {...register("secondary_contact")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-end gap-4">
                    <button
                      type="submit"
                      className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}
            {modalPageCount == 2 && (
              <div className="org-btn-container d-flex flex-column justify-start gap-3">
                <form onSubmit={handleSubmit(handlePageNext)}>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="address">
                      Address
                    </label>
                    <input
                      className="v2-input"
                      id="address"
                      type="text"
                      placeholder="Address"
                      name="address"
                      {...register("candidate_address1", {
                        required: "Address is required",
                      })}
                    />
                    {errors.candidate_address1 && (
                      <span className="v2-login-error">{errors.candidate_address1.message}</span>
                    )}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="university">
                      University
                    </label>
                    <input
                      className="v2-input"
                      id="university"
                      type="text"
                      placeholder="university"
                      name="university"
                      {...register("university_name", {
                        required: "University is required",
                      })}
                    />
                    {errors.university_name && <span className="v2-login-error">{errors.university_name.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="primary_skill">
                      Primary skill
                    </label>
                    <input
                      className="v2-input"
                      id="primary_skill"
                      type="text"
                      placeholder="Primary skill"
                      name="primary_skill"
                      {...register("primary_technology", {
                        required: "Primary Technology is required",
                      })}
                    />
                    {errors.primary_technology && (
                      <span className="v2-login-error">{errors.primary_technology.message}</span>
                    )}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="secondary_skill">
                      Secondary skill
                    </label>
                    <input
                      className="v2-input"
                      id="secondary_skill"
                      type="text"
                      placeholder="Secondary skill"
                      name="secondary_skill"
                      {...register("secondary_technology")}
                    />
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="one_drive_link">
                      One drive link
                    </label>
                    <input
                      className="v2-input"
                      id="one_drive_link"
                      type="text"
                      placeholder="One drive link"
                      name="one_drive_link"
                      {...register("candidate_onedrive_link")}
                    />
                  </div>
                  <div className="form-container d-flex justify-between">
                    <div className="org-mini-dropDown">
                      <label htmlFor="visa_status">Visa Status</label> <br />
                      <select
                        id="visa_status"
                        name="visa_status"
                        {...register("visa_status", {
                          required: "Visa status is required",
                        })}
                      >
                        <option value="">Select Visa Status</option>
                        <option value="OPT">OPT</option>
                        <option value="CPT">CPT</option>
                        <option value="H1B">H1B</option>
                        <option value="H4 EAD">H4 EAD</option>
                        <option value="GC">GC</option>
                        <option value="GC EAD">GC EAD</option>
                        <option value="USC">USC</option>
                        <option value="STEM OPT">STEM OPT</option>
                      </select>
                      {errors.visa_status && <span className="v2-login-error">{errors.visa_status.message}</span>}
                    </div>
                    <div className="org-mini-dropDown">
                      <label htmlFor="c_visa_status">C Visa Status</label> <br />
                      <select
                        id="c_visa_status"
                        name="c_visa_status"
                        {...register("cvisa_status", {
                          required: "C Visa status is required",
                        })}
                      >
                        <option value="">Select Visa Status</option>
                        <option value="OPT">OPT</option>
                        <option value="CPT">CPT</option>
                        <option value="H1B">H1B</option>
                        <option value="H4 EAD">H4 EAD</option>
                        <option value="GC">GC</option>
                        <option value="GC EAD">GC EAD</option>
                        <option value="USC">USC</option>
                        <option value="STEM OPT">STEM OPT</option>
                      </select>
                      {errors.cvisa_status && <span className="v2-login-error">{errors.cvisa_status.message}</span>}
                    </div>
                  </div>
                  <div className="form-container d-flex justify-between">
                    <div className="org-mini-dropDown">
                      <label htmlFor="current_status">Current status</label> <br />
                      <select
                        id="current_status"
                        name="current_status"
                        {...register("current_status", {
                          required: "Current status is required",
                        })}
                      >
                        <option value="">Select Current status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {errors.current_status && <span className="v2-login-error">{errors.current_status.message}</span>}
                    </div>
                    <div className="org-mini-dropDown">
                      <label htmlFor="in_project">Currently in Project</label> <br />
                      <select
                        id="in_project"
                        name="in_project"
                        {...register("currently_in_project", {
                          required: "Status is required",
                        })}
                      >
                        <option value="">Select status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.currently_in_project && (
                        <span className="v2-login-error">{errors.currently_in_project.message}</span>
                      )}
                    </div>
                  </div>
                  <div className="org-mini-dropDown">
                    <label htmlFor="in_project">OPT status</label> <br />
                    <select
                      id="in_project"
                      name="in_project"
                      {...register("opt_letter_status", {
                        required: "Letter status is required",
                      })}
                    >
                      <option value="">Select status</option>
                      <option value="ISSUED">ISSUED</option>
                      <option value="NOT ISSUED">NOT ISSUED</option>
                    </select>
                    {errors.opt_letter_status && (
                      <span className="v2-login-error">{errors.opt_letter_status.message}</span>
                    )}
                  </div>
                  <div className="d-flex justify-end gap-4">
                    <button
                      disabled={modalPageCount <= 1}
                      className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                      onClick={() => setModalPageCount(modalPageCount - 1)}
                    >
                      Prev
                    </button>
                    <button
                      disabled={modalPageCount >= 3}
                      type="submit"
                      className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                      // onClick={()=>setModalPageCount(modalPageCount+1)}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}
            {modalPageCount == 3 && (
              <div className="org-btn-container d-flex flex-column justify-start gap-3">
                <form onSubmit={handleSubmit(addCandidate)}>
                  <div className="form-container">
                    <label htmlFor="assigned_recruiter">Assigned Recruiter</label> <br />
                    <select
                      className="org-manager-dropDown"
                      id="assigned_recruiter"
                      name="assigned_recruiter"
                      {...register("assigned_recruiter", { required: "Assigned Recruiter is required" })}
                    >
                      <option value="">Select Recruiter</option>
                      {recruitersBList?.map((value) => (
                        <option value={value?.value}>{value?.text}</option>
                      ))}
                    </select>
                    {errors.assigned_recruiter && (
                      <span className="v2-login-error">{errors.assigned_recruiter.message}</span>
                    )}
                  </div>
                  <div className="form-container">
                    <label htmlFor="assigned_team">Assigned Team</label> <br />
                    <select
                      className="org-manager-dropDown"
                      id="assigned_team"
                      name="assigned_team"
                      {...register("assigned_team", { required: "Team is required" })}
                    >
                      <option value="">Select team</option>
                      <option value="Team A">Team A</option>
                      <option value="Team B">Team B</option>
                      <option value="Team C">Team C</option>
                      <option value="Team BDE">Team BDE</option>
                    </select>
                    {errors.assigned_team && <span className="v2-login-error">{errors.assigned_team.message}</span>}
                  </div>
                  <div className="form-container">
                    <label htmlFor="assigned_team">Onboarded company</label> <br />
                    <select
                      className="org-manager-dropDown"
                      id="assigned_team"
                      name="assigned_team"
                      {...register("onboard_company", { required: "Company is required" })}
                    >
                      <option value="">Select company</option>
                      <option value="4Sphere">4Sphere</option>
                      <option value="TB Soft">TB Soft</option>
                      <option value="UB Soft">UB Soft</option>
                    </select>
                    {errors.assigned_team && <span className="v2-login-error">{errors.assigned_team.message}</span>}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="location_preference">
                      Location Preference
                    </label>
                    <input
                      className="v2-input"
                      id="location_preference"
                      type="text"
                      placeholder="Location Preference"
                      name="location_preference"
                      {...register("location_preference", {
                        required: "location is required",
                      })}
                    />
                    {errors.location_preference && (
                      <span className="v2-login-error">{errors.location_preference.message}</span>
                    )}
                  </div>
                  <div className="form-container">
                    <label className="v2-label" htmlFor="comments">
                      Comments
                    </label>
                    <input
                      className="v2-input"
                      id="comments"
                      type="text"
                      placeholder="Comments"
                      name="comments"
                      {...register("comments", {
                        required: "Comments is required",
                      })}
                    />
                    {errors.comments && <span className="v2-login-error">{errors.comments.message}</span>}
                  </div>
                  <div className="form-container d-flex justify-between">
                    <div className="org-mini-dropDown">
                      <label htmlFor="availability">Availability</label> <br />
                      <select
                        id="availability"
                        name="availability"
                        {...register("availability", {
                          required: "Current status is required",
                        })}
                      >
                        <option value="">Select availability</option>
                        <option value="Immediate">Immediate</option>
                        <option value="Available in 2 weeks">Available in 2 weeks</option>
                        <option value="Available in 45 days">Available in 45 days</option>
                        <option value="Available in 2 months">Available in 2 months</option>
                      </select>
                      {errors.availability && <span className="v2-login-error">{errors.availability.message}</span>}
                    </div>
                    <div className="org-mini-dropDown">
                      <label htmlFor="work_status_mail">Work status mail</label> <br />
                      <select
                        id="work_status_mail"
                        name="work_status_mail"
                        {...register("send_work_status_email", {
                          required: "Work status is required",
                        })}
                      >
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.send_work_status_email && (
                        <span className="v2-login-error">{errors.send_work_status_email.message}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-container d-flex justify-between">
                    <div className="org-mini-dropDown">
                      <label className="v2-label" htmlFor="us_entry_date">
                        US entry date
                      </label>
                      <input
                        className="v2-input"
                        id="us_entry_date"
                        type="date"
                        {...register("us_entry_date", {
                          required: "Entry Date is required",
                        })}
                      />
                      {errors.us_entry_date && <span className="v2-login-error">{errors.us_entry_date.message}</span>}
                    </div>
                    <div className="org-mini-dropDown">
                      <label className="v2-label" htmlFor="marketing_start_date">
                        Marketing Start Date
                      </label>
                      <input
                        className="v2-input"
                        id="marketing_start_date"
                        type="date"
                        {...register("marketing_start_date", {
                          required: "Marketing Date is required",
                        })}
                      />
                      {errors.marketing_start_date && (
                        <span className="v2-login-error">{errors.marketing_start_date.message}</span>
                      )}
                    </div>
                  </div>
                  <div className="org-mini-dropDown">
                    <label className="v2-label" htmlFor="work_auth_start_date">
                      Work authorization start date
                    </label>
                    <input
                      className="v2-input"
                      id="work_auth_start_date"
                      type="date"
                      {...register("work_auth_start_date", {
                        required: "Work authorization Date is required",
                      })}
                    />
                    {errors.work_auth_start_date && (
                      <span className="v2-login-error">{errors.work_auth_start_date.message}</span>
                    )}
                  </div>
                  <div className="d-flex justify-end gap-4">
                    <button
                      disabled={modalPageCount <= 1}
                      type="submit"
                      className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                      onClick={() => setModalPageCount(modalPageCount - 1)}
                    >
                      Prev
                    </button>
                    <button
                      type="submit"
                      className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </OverlayModal>
      )}

      {showDialog && (
        <ConfirmationDialogBox
          isLoading={isLoading}
          confirm={confirm}
          setConfirm={setConfirm}
          onConfirm={() => {
            // deleteTeam(deleteId);
          }}
          onCancel={() => {
            setShowDialog(false);
          }}
          text="Do you permanently want to delete this?"
        />
      )}
    </>
  );
};

export default BenchCandidates;
