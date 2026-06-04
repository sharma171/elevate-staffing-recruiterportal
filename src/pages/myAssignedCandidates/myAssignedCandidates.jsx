import { useState, useEffect } from "react";
import { useAuth } from "../../authContext";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import "./style.css";
import "../benchcandidate/sidebarStyle.css";
import styles from "../talentpool/css/TalentPool.module.css";
import TimePicker from "./TimePicker";
import { ReactComponent as RemoveHotlist } from "./removehotlist.svg";
import ScheduleIcons from "./scheduleIcon.svg";
import VendorsIcon from "./VendorsIcon.svg";
import EmailActivityIcon from "./VendorsIcon.svg";
import CandidateDetailsModal from "../benchcandidate/CandidateDetailsModal"; // Your new modal component
import CandidateModal from "../benchcandidate/candidateModal";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
import { ReactComponent as UploadIcon } from "../../images/upload-icon.svg";
import { ReactComponent as EmailIcon } from "../../images/email.svg";
import { ReactComponent as CloudIcon } from "../../assets/images/cloudIcon.svg";
import { ReactComponent as CheckList } from "../../assets/images/checkList.svg";
import { ReactComponent as VisaIcon } from "../../images/visa-icon.svg";
import { ReactComponent as CompanyIcon } from "../../images/company.svg";
import { ReactComponent as CelanderList } from "../../images/CelanderList.svg";
import { ReactComponent as ClockList } from "../../images/ClockList.svg";
import { ReactComponent as ScheduleIcon } from "../../images/ScheduleIcon.svg";
import { ReactComponent as SendIcon } from "../../images/SendIcon.svg";
import { ReactComponent as Card2Icon } from "../../images/Card2Icon.svg";
import { ReactComponent as Card3Icon } from "../../images/Card3Icon.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import { ReactComponent as CodeIcon } from "../../images/CodeIcon.svg";
import { ReactComponent as OPT } from "../../images/OPT.svg";
import { ReactComponent as STMPOPT } from "../../images/STMPOPT.svg";
import { ReactComponent as H1B } from "../../images/H1B.svg";
import { ReactComponent as High } from "../../images/High.svg";
import { ReactComponent as Medium } from "../../images/Medium.svg";
import { ReactComponent as Low } from "../../images/Low.svg";
import { ReactComponent as Priority } from "../../images/Priority.svg";
import { ReactComponent as Celander } from "../../images/Celander.svg";
import { ReactComponent as Clock } from "../../images/Clock.svg";
import { ReactComponent as Professor } from "../../images/Professor.svg";
import { ReactComponent as Card1Icon } from "../../images/Card1Icon.svg";
import { ReactComponent as LoadMore } from "../../images/LoadMore.svg";
import BenchDetails from "../benchcandidate/BenchCandidateDetails";
import JobCount from "../jobSearch/ExistingJobComponents/JobCountIcon.png";
import LogoutStyles from "../../components/css/Logout.module.css";
import { ThemeLoader } from "../../components";
import sendEncryptedRequest from "../../components/EncryptedRequest";
import { getDeviceData } from "../../DeviceStore";

const MyAssignedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [vendorUpdated, setVendorUpdated] = useState(0);
  const [loader, setLoader] = useState(false);
  const [popupMessage, setPopupMessage] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTermAssigned] = useState("");
  const [visaStatusFilter] = useState("");
  const [setLocationFilterAssigned] = useState("");
  const [candidateCount, setCandidateCount] = useState("");
  const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list
  const [teamsFilter, setTeamsFilter] = useState("");
  const [currentStatusAssigned] = useState("");
  const { isLoggedIn, login, user } = useAuth();
  const [dataDelete, setDataDelete] = useState(false);
  const [openDetails, setOPenDetails] = useState(false);
  const [vendorsList, setVendorList] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailActivity, setEmailActivity] = useState(null);
  const [tabName, setTabName] = useState("CandidateList");
  const [currentEmail, setCurrentEmail] = useState(null);
  const [tableLoader, settableLoader] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  let { keys, fingerprints } = getDeviceData();

  const navigate = useNavigate();
  let storedUser = JSON.parse(localStorage.getItem("user"));

  // ========================================================================

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setUploadMessage("Only CSV files are allowed.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setUploadMessage(""); // Reset message on valid file selection
      }
    }
  };

  const handleUpload = async () => {
    setLoader(true);
    if (!selectedFile) {
      setUploadMessage("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("recruiter_email", storedUser.email);
    formData.append("file", selectedFile);

    try {
      const response = await fetch("https://vendor-email-inseration-v3-305451280005.us-east1.run.app", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage(data.message || "File uploaded successfully!");
        setVendorUpdated(vendorUpdated + 1);
        // Start 5s countdown
        let countdown = 5;
        setUploadMessage(`File Uploaded & Closing in ${countdown} seconds...`);

        const interval = setInterval(() => {
          countdown -= 1;
          setUploadMessage(`File Uploaded & Closing in ${countdown} seconds...`);
          if (countdown <= 0) {
            clearInterval(interval);
            setUploadMessage(null);
            setPopupMessage(false);
            setSelectedFile(null);
          }
        }, 1000);
      } else {
        setUploadMessage(data.message || "Failed to upload file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Error uploading file.");
    } finally {
      setLoader(false);
    }
  };

  const getSecureBenchCandidates = async () => {
    let payload = {
      emailid: storedUser.email,
      assigned_recruiter_email: storedUser.email,
      role: "recruiter",
    };

    settableLoader(true);
    let result = await sendEncryptedRequest(payload, keys, fingerprints);

    settableLoader(false);
    let { data, status } = result;
    if (status) {
      const candidates = Object.entries(data).map(([key, value]) => {
        const id = key.includes(":") ? key.split(": ")[1] : key;
        return {
          id,
          ...value,
        };
      });

      setCandidates(candidates);
      setDataDelete(false);
    }
  };

  useEffect(() => {
    if (storedUser?.email) {
      getSecureBenchCandidates();
    }
  }, [storedUser?.email, keys?.sessionId]);

  const [time, setTime] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Handle Day Selection for Frequency
  const handleDaySelection = (day) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  // Map selected days to frequency format (1=Monday, 2=Tuesday, etc.)
  const getFrequencyFormat = () => {
    return selectedDays
      .map((day) => days.indexOf(day) + 1)
      .sort((a, b) => a - b)
      .join(",");
  };

  // Schedule Email API Call
  const scheduleEmailsToVendor = async () => {
    if (!time || selectedDays.length === 0) {
      alert("Please select a time and at least one day.");
      return;
    }

    setLoader(true);
    try {
      const response = await fetch("https://vendor-email-fetch-data-db-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskname: "update_hotmail_data",
          recruiter_email: storedUser.email,
          send_hotlist: true,
          time_hotlistsend: `${time}`,
          weekly_hotlist_frequency: getFrequencyFormat(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailStatus(data);
        emailInfoGet();
        console.log("Scheduled Emails Response:", data);
      } else {
        setEmailStatus({ message: "Failed to Schedule Email" });
      }
    } catch (error) {
      console.error("Error scheduling emails:", error);
      setEmailStatus({ message: "Failed to Schedule Email" });
    } finally {
      setLoader(false);
    }
  };
  // Schedule Email API Call
  const removeSchedulededEmails = async () => {
    setPopupOverlay(null);
    setLoader(true);
    try {
      const response = await fetch("https://vendor-email-fetch-data-db-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskname: "remove_hotmail_data",
          recruiter_email: storedUser.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailStatus(data);
        emailInfoGet();
        setSelectedDays([]);
        console.log("Scheduled Emails Response:", data);
      } else {
        setEmailStatus({ message: "Failed to Schedule Email" });
      }
    } catch (error) {
      console.error("Error scheduling emails:", error);
      setEmailStatus({ message: "Failed to Schedule Email" });
    } finally {
      setLoader(false);
    }
  };
  // Schedule Email API Call
  const emailInfoGet = async () => {
    setLoader(true);
    try {
      const response = await fetch("https://vendor-email-fetch-data-db-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskname: "get_hotmail_data",
          recruiter_email: storedUser.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid JSON response received");
      }

      setCurrentEmail(data || { message: "No data received" });
      console.log("Scheduled Emails Response:", data);
    } catch (error) {
      console.error("Error fetching email data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (currentEmail?.hotmail_data?.weekly_hotlist_frequency) {
      const frequencyArray = currentEmail.hotmail_data.weekly_hotlist_frequency
        .split(",")
        .map((num) => days[parseInt(num, 10) - 1]); // Convert numbers to days
      setSelectedDays(frequencyArray);
    }
  }, [currentEmail]); // Runs whenever currentEmail changes

  // Instant Email API Call
  const sendEmailInstantly = async () => {
    setLoader(true);
    try {
      const response = await fetch(
        "https://send-vendor-emails-with-candidate-details-v3-305451280005.us-east1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recruiter_email: storedUser.email,
            // recruiter_email: "vardhan@4spheresolutions.com",
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setEmailStatus(data);
        console.log("Instant Email Response:", data);
      } else {
        console.error("Failed to send email instantly:", data.message);
        setEmailStatus({ message: "Failed to send email instantly" });
      }
    } catch (error) {
      console.error("Error sending email instantly:", error);
      setEmailStatus({ message: "Failed to send email instantly" });
    } finally {
      setLoader(false);
    }
  };
  const fetchEmailActivity = async () => {
    setLoader(true);
    try {
      const response = await fetch("https://vendor-email-fetch-data-db-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskname: "get_count",
          recruiter_email: storedUser.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailActivity(data);
        console.log("activity", data);
      } else {
        console.error("Failed to fetch recruiters:", data.message);
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setLoader(false);
    }
  };
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const incrementPageIndex = () => {
    if (pageIndex < pageCount) {
      setPageIndex((prevIndex) => prevIndex + 1);
    } else {
      setEmailStatus({ message: "No more pages available" });
      setTimeout(() => {
        setEmailStatus(null);
      }, 1500);
    }
  };

  const fetchVendorsList = async () => {
    setLoader(true);
    try {
      const response = await fetch("https://vendor-email-fetch-data-db-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskname: "get_emails",
          // recruiter_email: "contracts@ubsoftllc.com",
          recruiter_email: storedUser.email,
          page: pageIndex,
          limit: 8,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setVendorList(data);
        setPageCount(data.pagination?.total_pages || 1); // Set total pages
      } else {
        console.error("Failed to fetch vendors:", data.message);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoader(false);
    }
  };

  const downloadTemplate = () => {
    const fileUrl =
      "https://4spheresolutionscom-my.sharepoint.com/:x:/g/personal/marketing_4spheresolutions_com/Edcl-x6r_ONAiU1CUCUeX_IBj67S8YTV0nCVVHRLOHkhjQ?e=7YzsAj"; // Replace with the actual public link
    saveAs(fileUrl, "csv_template_elevatestaffing.csv");
  };

  useEffect(() => {
    if (storedUser?.email) {
      fetchVendorsList();
      emailInfoGet();
    }
  }, [pageIndex, vendorUpdated]);

  // Fetch recruiters list from the API
  useEffect(() => {
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
              emailid: storedUser.email,
              role: "admin",
            }),
          },
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

    if (storedUser?.email) {
      fetchRecruiters();
      fetchEmailActivity();
      // fetchVendorsList();
    }
  }, [storedUser?.email]);

  useEffect(() => {
    let filtered = candidates;

    // Search by name
    if (searchTermAssigned) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.first_name.toLowerCase().includes(searchTermAssigned.toLowerCase()) ||
          candidate.last_name.toLowerCase().includes(searchTermAssigned.toLowerCase()),
      );
    }

    // Filter by visa status
    if (visaStatusFilter) {
      filtered = filtered.filter((candidate) => {
        // If the visa status is "OPT", also check the "OPT Letter Provided" status
        if (visaStatusFilter === "OPT") {
          return candidate.visa_status === "OPT";
        }
        // Otherwise, just filter by the visa status
        return candidate.visa_status === visaStatusFilter;
      });
    }

    // Filter by Current status
    if (currentStatusAssigned) {
      filtered = filtered.filter((candidate) => candidate.current_status === currentStatusAssigned);
    }
    // Filter by assigned teams
    if (teamsFilter) {
      filtered = filtered.filter((candidate) => {
        // Ensure to handle both string and array formats for assigned_team
        if (Array.isArray(candidate.assigned_team)) {
          return candidate.assigned_team.includes(teamsFilter);
          // console.log(`filter1 ${candidate.assigned_team}`);
        } else {
          return candidate.assigned_team === teamsFilter;
          // console.log(`filter1 ${candidate.assigned_team}`);
        }
      });
    }

    // Filter by location preference
    if (setLocationFilterAssigned) {
      filtered = filtered.filter((candidate) => candidate.location_preference === setLocationFilterAssigned);
    }

    setFilteredCandidates(filtered);
  }, [searchTermAssigned, visaStatusFilter, setLocationFilterAssigned, currentStatusAssigned, teamsFilter, candidates]);

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  const saveCandidate = (updatedCandidate) => {
    // Update candidate in the state
    const updatedCandidates = candidates.length
      ? candidates.map((candidate) => (candidate.id === updatedCandidate.id ? updatedCandidate : candidate))
      : [];
    setCandidates(updatedCandidates);

    // Close the modal
    closeModal();

    // POST request to update candidate in the database
    fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailid: storedUser.email,
        query: `UPDATE foursphere_recruiters.bench_candidates 
                        SET first_name = '${updatedCandidate.first_name}', 
                            last_name = '${updatedCandidate.last_name}', 
                            primary_email = '${updatedCandidate.primary_email}', 
                            secondary_email = '${updatedCandidate.secondary_email}', 
                            primary_contact = '${updatedCandidate.primary_contact}', 
                            secondary_contact = '${updatedCandidate.secondary_contact}', 
                            location_preference = '${updatedCandidate.location_preference}', 
                            visa_status = '${updatedCandidate.visa_status}', 
                            current_status = '${updatedCandidate.current_status}', 
                            assigned_recruiter = '${updatedCandidate.assigned_recruiter}', 
                            currently_in_project = '${updatedCandidate.currently_in_project}', 
                            availability = '${updatedCandidate.availability}', 
                            candidate_onedrive_link = '${updatedCandidate.candidate_onedrive_link}', 
                            comments = '${updatedCandidate.comments}', 
                            cvisa_status = '${updatedCandidate.cvisa_status}', 
                            opt_letter_status = '${updatedCandidate.opt_letter_status}', 
                            primary_technology = '${updatedCandidate.primary_technology}', 
                            secondary_technology = '${updatedCandidate.secondary_technology}',
                            assigned_team = '${updatedCandidate.assigned_team}' 
                        WHERE id = ${updatedCandidate.id};`,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Candidate updated successfully");
        } else {
          console.error("Error updating candidate:", response.statusText);
        }
      })
      .catch((error) => console.error("Error updating candidate:", error));
  };

  function goToRegister() {
    navigate("/registerNewCandidates");
  }

  useEffect(() => {
    // Fetch the number of active bench candidates from the API
    fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailid: storedUser.email,
        query: `SELECT COUNT(*) AS count FROM foursphere_recruiters.bench_candidates WHERE current_status = 'Active';`,
      }),
    })
      .then((response) => response.json())
      .then((data) => setCandidateCount(data[0].count)) // Assuming the API returns an array with count as the first element
      .catch((error) => console.error("Error fetching candidate count:", error));
  }, []);

  const sortCandidatesByFirstName = (candidates) => {
    return candidates.sort((a, b) => {
      // Safely check if first_name exists, sort alphabetically by first_name
      const nameA = a.first_name ? a.first_name.toLowerCase() : "";
      const nameB = b.first_name ? b.first_name.toLowerCase() : "";

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  };

  // Example usage in your component
  const sortedCandidates = sortCandidatesByFirstName(filteredCandidates);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Modal state
  const [currentCandidate, setCurrentCandidate] = useState(null); // Candidate data
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false); // Subview modal state

  const handleCloseDetailsModal = () => setIsDetailsModalOpen(false);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sortedCandidates.length / rowsPerPage);

  const indexOfLastJob = currentPage * rowsPerPage;
  const indexOfFirstJob = indexOfLastJob - rowsPerPage;
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

  const renderPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={index} className="pagination-ellipsis">
          {page}
        </span>
      ) : (
        <button
          key={index}
          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      ),
    );
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100 bottom-sidebar">
          <div className={`${styles.container} container-fluid py-2 px-2 px-sm-3 px-md-2 rightcontent`}>
            <div
              className="headerBackground text-white p-3 rounded-top d-flex col-flex"
              style={{ borderRadius: "22px !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="mb-0 fw-bold h2 fs-5">Engagement Hub</h2>
                </div>
                <div className="d-flex align-items-center gap-3"></div>
              </div>
            </div>

            <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
              <div className={`headerboxglass ${styles.headerboxglass}`}>
                <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex nowrap gap-2 align-items-center">
                    <button
                      className={`tabButton ${tabName === "CandidateList" ? "active" : ""}`}
                      onClick={() => setTabName("CandidateList")}
                    >
                      <img src={JobCount} alt="job count" className="job-count-icon" />
                      Candidate List
                    </button>
                    <button
                      className={`tabButton ${tabName === "EmailScheduling" ? "active" : ""}`}
                      onClick={() => setTabName("EmailScheduling")}
                    >
                      <img src={ScheduleIcons} alt="job count" className="job-count-icon" />
                      Email Scheduling
                    </button>
                    <button
                      className={`tabButton ${tabName === "VendorEmailList" ? "active" : ""}`}
                      onClick={() => setTabName("VendorEmailList")}
                    >
                      <img src={VendorsIcon} alt="job count" className="job-count-icon" />
                      Vendor Email List
                    </button>
                    <button
                      className={`tabButton ${tabName === "EmailDash" ? "active" : ""}`}
                      onClick={() => setTabName("EmailDash")}
                    >
                      <img src={EmailActivityIcon} alt="job count" className="job-count-icon" />
                      Email Activity Tracking
                    </button>
                  </div>
                </div>
              </div>
              {tabName == "CandidateList" && (
                <>
                  <div className={`table-responsive nowrap Ehub-table ${styles.table}`}>
                    <table className="table table-borderless table-hover align-middle">
                      <thead>
                        <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                          <th>
                            <div className={`${styles.th} ps-2`}>
                              <CandidateNameIcon />
                              Candidate Name
                            </div>
                          </th>
                          <th>
                            <div className={styles.th}>
                              <EmailIcon />
                              Email
                            </div>
                          </th>
                          <th>
                            <div className={styles.th}>
                              <CompanyIcon />
                              Primary Skillset
                            </div>
                          </th>
                          <th>
                            <div className={styles.th}>
                              <VisaIcon />
                              Visa Status
                            </div>{" "}
                          </th>
                          <th>
                            <div className={`${styles.th}`}>
                              <Priority />

                              <div>Priority</div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentJobs ? (
                          <>
                            {currentJobs.map((candidate) => (
                              <tr>
                                <td
                                  className={`status-change-statuschange ${
                                    candidate.gender === "Male"
                                      ? "Male"
                                      : candidate.gender === "Female"
                                        ? "Female"
                                        : "Other"
                                  }`}
                                  // onClick={() => navigateCandidatDetails(candidate.id)}
                                >
                                  <div className="alignCenter">
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

                                <td>{candidate.primary_email || "N/A"}</td>

                                <td>
                                  <div className="alignCenter skills">
                                    <CodeIcon />
                                    <span>{candidate.primary_technology || "N/A"}</span>
                                  </div>
                                </td>

                                <td className="onboarded-data">
                                  <div className="alignCenter visa">
                                    {candidate.visa_status === "OPT" ? (
                                      <OPT />
                                    ) : candidate.visa_status === "STEM OPT" ? (
                                      <STMPOPT />
                                    ) : (
                                      <H1B />
                                    )}
                                    <span className={`${candidate.visa_status}`}>{candidate.visa_status || "N/A"}</span>
                                  </div>
                                </td>

                                <td className={` onboarded-data`}>
                                  <div className="alignCenter priority">
                                    {candidate.priority === "High" ? (
                                      <High />
                                    ) : candidate.priority === "Medium" ? (
                                      <Medium />
                                    ) : (
                                      <Low />
                                    )}
                                    <span className={`${candidate.priority}`}>{candidate.priority || "N/A"}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>
                        ) : (
                          <>
                            <div className="facade"></div>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <div>
                      <label> Show </label>
                      <select
                        className="form-select d-inline w-auto ms-2"
                        onChange={(e) => {
                          setCurrentPage(1);
                          setRowsPerPage(Number(e.target.value));
                        }}
                        value={rowsPerPage}
                      >
                        {[5, 10, 15, 20, 30, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <label> &nbsp; Row </label>
                    </div>
                    <div className="pagination-container">
                      <button
                        className="pagination-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </button>

                      {renderPageNumbers()}

                      <button
                        className="pagination-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </>
              )}
              {tabName == "EmailScheduling" && (
                <>
                  <div className="emailscheduleTab">
                    <div className="row-flex emailInputs">
                      {/* Time Selection */}
                      {currentEmail.hotmail_data.send_hotlist === true ? (
                        <div className="inputtime">
                          <label>Schedule Time (EST)</label>
                          <TimePicker time={time} setTime={setTime} currentEmail={currentEmail} />
                        </div>
                      ) : (
                        <div className="inputtime">
                          <label>Schedule Time (EST)</label>
                          <TimePicker time={time} setTime={setTime} currentEmail={currentEmail} />
                        </div>
                      )}
                      {/* Frequency Selection */}
                      {currentEmail.hotmail_data.send_hotlist === true ? (
                        <>
                          <div className="timeDayScheduler day">
                            <div className="inputtime">
                              <label>Selected Frequency of Emails:</label>
                              <div className="checkbox-group daylist">
                                {days.map((day) => (
                                  <label
                                    key={day}
                                    className={`checkbox-label ${selectedDays.includes(day) ? "selected" : ""} ${
                                      day === today ? "active-day" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="checkbox"
                                      checked={selectedDays.includes(day)}
                                      // onChange={() => handleDaySelection(day)}
                                    />
                                    {day}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="timeDayScheduler day">
                            <div className="inputtime">
                              <label>Select Frequency:</label>
                              <div className="checkbox-dropdown">
                                <div
                                  className="dropdown-header"
                                  onClick={() => setIsOpen(true)}
                                  onMouseLeave={() => setIsOpen(false)}
                                >
                                  <div className="name row-flex" style={{ whiteSpace: "pre-wrap" }}>
                                    {selectedDays.length > 0 ? selectedDays.join(", ") : "Select Days"}
                                    <span className="arrow">{isOpen ? "▲" : "▼"}</span>
                                  </div>

                                  {isOpen && (
                                    <div className="dropdown-list">
                                      {days.map((day) => (
                                        <label
                                          key={day}
                                          className={`dropdown-item ${selectedDays.includes(day) ? "selected" : ""} ${
                                            day === today ? "active-day" : ""
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedDays.includes(day)}
                                            onChange={() => handleDaySelection(day)}
                                          />
                                          {day}
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                      <button className="sendemailbtn" onClick={sendEmailInstantly}>
                        <ScheduleIcon /> Send Email Now
                      </button>
                      {currentEmail.hotmail_data.send_hotlist === true ? (
                        <>
                          <button
                            className="schedulebtn delete"
                            onClick={() =>
                              setPopupOverlay({
                                message: "Do you want to remove scheduled emails?",
                                title: "Confirmation",
                                subhead: "",
                                button: "Confirm",
                              })
                            }
                          >
                            <RemoveHotlist /> Cancel Scheduled Emails
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="schedulebtn" onClick={scheduleEmailsToVendor}>
                            <SendIcon /> Schedule Emails
                          </button>
                        </>
                      )}
                    </div>

                    {/* Loader */}
                    {loader && <p>Loading...</p>}

                    {/* Success Message */}
                    {emailStatus && <p className="success-message">{emailStatus.message}</p>}
                  </div>
                </>
              )}
              {tabName == "VendorEmailList" && (
                <>
                  <div className={`table-responsive nowrap Ehub-table ${styles.table}`}>
                    <table className="table table-borderless table-hover align-middle">
                      <thead>
                        <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                          <th style={{ padding: "10px 20px" }}>
                            <div className={styles.th}>
                              <EmailIcon />
                              Vendor Email
                            </div>
                          </th>
                          <th>
                            <div className={styles.th}>
                              <Celander />
                              Uploaded Date
                            </div>
                          </th>
                          <th>
                            <div className={styles.th}>
                              <Clock />
                              Uploaded Time
                            </div>{" "}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(vendorsList?.vendor_emails) && vendorsList.vendor_emails.length > 0 ? (
                          vendorsList.vendor_emails.map((candidate) => {
                            const createdAt = new Date(candidate.created_at);

                            // Formatting date to MM/DD/YY
                            const formattedDate = `${(createdAt.getMonth() + 1).toString().padStart(2, "0")}/${createdAt
                              .getDate()
                              .toString()
                              .padStart(2, "0")}/${createdAt.getFullYear().toString().slice(-2)}`;

                            // Extracting time in 12-hour format with AM/PM
                            const formattedTime = createdAt.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            });

                            return (
                              <tr key={candidate.vendor_email}>
                                <td style={{ padding: "20px" }}>
                                  <div className="alignCenter skills">
                                    <Professor />
                                    <span>{candidate.vendor_email || "N/A"}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="alignCenter skills">
                                    <CelanderList />
                                    <span>{formattedDate || "N/A"}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="alignCenter skills">
                                    <ClockList />
                                    <span>{formattedTime || "N/A"}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="vendorButtons">
                      <div className="button-group">
                        <button className="sendemailbtn" onClick={incrementPageIndex}>
                          <LoadMore /> <span className="mobileHidden"> Load More</span>
                        </button>
                        <button className="schedulebtn" onClick={() => setPopupMessage(true)}>
                          {" "}
                          <UploadIcon />
                          <span className="mobileHidden">Upload Vendors</span>
                        </button>
                        <button
                          className="schedulebtn Download"
                          onClick={() => {
                            downloadTemplate();
                          }}
                        >
                          {" "}
                          <UploadIcon />
                          <span className="mobileHidden">Download Template</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {tabName == "EmailDash" && (
                <>
                  <div className="activityDash">
                    <div className="cards card1" style={{ borderRadius: "12px" }}>
                      <div className="cardRow row-flex">
                        <div className="left-col">
                          <span className="smallText">Email Activity</span>
                          <div className="row-flex bigWrap">
                            <span className="bigText">
                              {emailActivity?.emails_activity ? <>{emailActivity.emails_activity}</> : <>0</>}/
                            </span>
                            <span className="normalText">All Time</span>
                          </div>
                        </div>
                        <div className="right-col">
                          <Card1Icon />
                        </div>
                      </div>
                    </div>
                    <div className="cards card2" style={{ borderRadius: "12px" }}>
                      <div className="cardRow row-flex">
                        <div className="left-col">
                          <span className="smallText">Opened Emails</span>
                          <div className="row-flex bigWrap">
                            <span className="bigText">
                              {emailActivity?.opened_emails ? <>{emailActivity.opened_emails}</> : <>0</>}/
                            </span>
                            <span className="normalText">All Time</span>
                          </div>
                        </div>
                        <div className="right-col">
                          <Card2Icon />
                        </div>
                      </div>
                    </div>
                    <div className="cards card3" style={{ borderRadius: "12px" }}>
                      <div className="cardRow row-flex">
                        <div className="left-col">
                          <span className="smallText">Total Vendor Emails</span>
                          <div className="row-flex bigWrap">
                            <span className="bigText">
                              {emailActivity?.total_vendor_emails ? <>{emailActivity.total_vendor_emails}</> : <>0</>}/
                            </span>
                            <span className="normalText">All Time</span>
                          </div>
                        </div>
                        <div className="right-col">
                          <Card3Icon />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {popupOverlay && (
          <>
            <div className={LogoutStyles.confirmOverlay}>
              <div className={LogoutStyles.confirmModal}>
                <div className={`${LogoutStyles.modalHeader} d-flex align-items-center justify-content-between`}>
                  <h3>{popupOverlay?.title ? popupOverlay?.title : "status"}</h3>
                  <span
                    class="material-symbols-outlined pointer"
                    onClick={() => {
                      setPopupOverlay(null);
                    }}
                  >
                    close
                  </span>
                </div>
                <div className={`d-flex flex-column align-items-center ${LogoutStyles.modalBody}`}>
                  <div className={`${LogoutStyles.confirmHeading}`}>
                    <div className="fw-bold">{popupOverlay?.message}</div>
                    <div>{popupOverlay?.subhead}</div>
                  </div>

                  <div className={LogoutStyles.buttonContainer}>
                    <button
                      onClick={() => {
                        setPopupOverlay(null);
                      }}
                      className={`${LogoutStyles.confirmButton} ${LogoutStyles.confirmYes}`}
                    >
                      {/* <span class="logout-icon " /> */}
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        removeSchedulededEmails();
                      }}
                      className={`${LogoutStyles.confirmButton} ${LogoutStyles.confirmYes}`}
                    >
                      {/* <span class="logout-icon " /> */}
                      {popupOverlay?.button}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {emailStatus !== null && (
          <>
            <div className="popupOverlay">
              <div className="messageCard">
                <div className="topHead">
                  Email Status
                  <span
                    className="close"
                    onClick={() => {
                      setEmailStatus(null);
                    }}
                  >
                    +
                  </span>
                </div>
                {emailStatus.message == "Your scheduled hotlist has been created." && (
                  <>
                    <div className="icon">
                      <CheckList />
                    </div>
                  </>
                )}

                {emailStatus && (
                  <p className="uploadMessage" style={{ fontSize: "18px", color: "#007bff" }}>
                    {emailStatus.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {popupMessage && (
          <>
            <div className="popupOverlay">
              <div className="messageCard">
                <div className="topHead">
                  File Upload
                  <span
                    className="close"
                    onClick={() => {
                      setPopupMessage(false);
                    }}
                  >
                    +
                  </span>
                </div>
                <div className="File-upload">
                  <input type="file" id="fileInput" accept=".csv" onChange={handleFileChange} hidden />
                  <label htmlFor="fileInput" className="custom-file-upload">
                    <CloudIcon />

                    {selectedFile ? selectedFile.name : "Drag & Drop CSV File"}
                  </label>

                  <button className="upload-btn" onClick={handleUpload} disabled={!selectedFile}>
                    Upload CSV
                  </button>
                </div>
                {uploadMessage && <p className="uploadMessage">{uploadMessage}</p>}
              </div>
            </div>
          </>
        )}

        {openDetails && <BenchDetails openDetails={openDetails} setOPenDetails={setOPenDetails} />}
      </div>
      {isDetailsModalOpen && currentCandidate && (
        <CandidateDetailsModal candidate={currentCandidate} onClose={handleCloseDetailsModal} />
      )}

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={closeModal} onSave={saveCandidate} />
      )}
      <ThemeLoader show={loader || tableLoader} />
    </div>
  );
};
export default MyAssignedCandidates;
