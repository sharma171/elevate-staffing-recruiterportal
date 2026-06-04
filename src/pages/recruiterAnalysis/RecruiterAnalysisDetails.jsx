import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import "./recruiterAnalysis.css";
import { useAuth } from "../../authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as ContactIcon } from "./contactIcon.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import { ReactComponent as ReasonsIcon } from "./reasonIcons.svg";
import { useGlobalContext } from "../../globalContext";
import images from "../../assets/images/new";
import styles from "../talentpool/css/TalentPool.module.css";
import MailIcon from "../../assets/images/mailIcon.svg";
import "../jobSearch/sideOverlay.css";
import { CustomPagination, EmptyView, SearchBox, ThemeLoader } from "../../components";
import { returnTruncatedStr } from "../../helpers/StrHelpers";
import { SelectPicker } from "rsuite";
import { X } from "lucide-react";

const RecruiterAnalysisDetails = () => {
  const { list, status_filter, user_icon, visa_status } = images;

  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);

  let isMobileView = window.innerWidth < 768;

  const { user } = useAuth();
  const [mobileActive, setMobileActive] = useState(isMobileView);
  const [activeNav, setActiveNav] = useState(params.get("activeTab") || "tab1");
  const navigate = useNavigate();
  const [data, setData] = useState(null); // State to store API response
  const [loading, setLoading] = useState(true); // Loading state
  const [loadingModal, setLoadingModal] = useState(false); // Loading state
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");
  const { selectedEmail, setSelectedEmail } = useGlobalContext();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedUser, setSelectedUser] = useState(null);

  const Email_id = selectedEmail;
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";

  const [selectedRow, setSelectedRow] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  useLayoutEffect(() => {
    const element = document.getElementById("dashboardSidebar");
    if (!element) return;

    const updateWidth = (w) => {
      const isMobileView = mobileActive && window.innerWidth < 768;

      if (isMobileView && mobileActive) {
        setSidebarWidth(0);
        element.style.opacity = 0;
      } else {
        element.style.opacity = 1;
        if (w < 25) {
          setSidebarWidth(0);
        } else {
          setSidebarWidth(w > 70 ? 64 : w);
        }
      }
    };

    updateWidth(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileActive]);

  useEffect(() => {
    if (!Email_id) {
      toast.warn("Please Select Email", {
        draggable: "true",
        autoClose: 2000,
        position: "top-center",
        className: "toast-center",
      });
      navigate("/recruiterAnalysis");
    }
  });

  const [recruiterAliasName, setRecruiterAliasName] = useState(null);
  const [recruitersBList, setBRecruitersList] = useState([]); // State for recruiters list

  useEffect(() => {
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
              emailid: storedUser.email,
              operation: "retrieve",
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          // Extract unique recruiters list with their ID
          const recruiters = data.data.map((item) => ({
            recruiter_alias_name: item.recruiter_alias_name || "Unknown", // Extract the top-level recruiter_alias_name
          }));
          console.log("recruiters", recruiters);
          if (recruiters.length > 0) {
            setRecruiterAliasName(recruiters[0].recruiter_alias_name);
          }
          // Update state with the extracted data
          setBRecruitersList(recruiters);
          console.log("Recruiters List:", recruiters);
        } else {
          console.error("Failed to fetch recruiters:", data.message);
        }
      } catch (error) {
        console.error("Error fetching recruiters:", error);
      }
    };

    fetchRecruiters();
  }, []);

  // don't do any changes for that
  useEffect(() => {
    const fetchRecruiterAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://us-east1-recruiterportal.cloudfunctions.net/fetch_recruiter_analysis_v3",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: storedUser.email,
              email: selectedEmail, // Pass recruiterAliasName here
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          setData(result);
          // console.log("result.details", result);
          // Update data state with fetched result
        } else {
          throw new Error(result.message || "Failed to fetch recruiter analysis.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterAnalysis();
  }, [selectedEmail]);

  const handleTabClick = (tabName) => {
    // console.log("tabName", tabName);
    setActiveNav(tabName);
    setSearchParams({ activeTab: tabName });
    setSearchValue("");
    setRowsPerPage(10);

    // console.log("after-tabName", tabName);
  };

  function goBack() {
    navigate("/recruiterAnalysis");
  }

  // const sortedCandidates =
  //   data && data.details && data?.details?.candidates_with_zero_submissions_last_24_hours
  //     ? data?.details?.candidates_with_zero_submissions_last_24_hours.sort(
  //         (a, b) => new Date(b.submission_date) - new Date(a.submission_date)
  //       )
  //     : [];

  const sortedCandidates = useMemo(() => {
    try {
      const candidates = data?.details?.candidates_with_zero_submissions_last_24_hours;
      if (!Array.isArray(candidates)) return [];

      return candidates
        .filter((candidate) => {
          const candidateString = Object.values(candidate)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return candidateString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
    } catch (error) {
      console.log("Error processing candidates:", error);
      return [];
    }
  }, [data, searchValue]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sortedCandidates.length / rowsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob = currentPage * rowsPerPage;
  const indexOfFirstJob = indexOfLastJob - rowsPerPage;

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

  const sortedAssignedCandidates = useMemo(() => {
    try {
      const candidates = data?.details?.total_assigned_candidates;
      if (!Array.isArray(candidates)) return [];

      return candidates
        .filter((candidate) => {
          const candidateString = Object.values(candidate)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return candidateString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
    } catch (error) {
      console.error("Error processing assigned candidates:", error);
      return [];
    }
  }, [data, searchValue]);

  const [currentPage1, setCurrentPage1] = useState(1);
  const totalPages1 = Math.ceil(sortedAssignedCandidates.length / rowsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob1 = currentPage1 * rowsPerPage;
  const indexOfFirstJob1 = indexOfLastJob1 - rowsPerPage;

  // Get the sortedAssignedCandidates for the current page
  const currentAssignedCandidates = sortedAssignedCandidates.slice(indexOfFirstJob1, indexOfLastJob1);

  const handlePageChange1 = (newPage1) => {
    if (newPage1 >= 1 && newPage1 <= totalPages1) {
      setCurrentPage1(newPage1);
    }
  };

  const handlePageInputChange1 = (e) => {
    const pageNum1 = Number(e.target.value);
    if (pageNum1 >= 1 && pageNum1 <= totalPages1) {
      setCurrentPage1(pageNum1);
    }
  };

  useEffect(() => {
    handlePageChange1(currentPage1);
  }, [currentPage1]);

  const sortedSubmissions = useMemo(() => {
    try {
      const submissions = data?.details?.submissions_by_type_summary;
      if (!Array.isArray(submissions)) return [];

      return submissions
        .filter((item) => {
          const itemString = Object.values(item)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return itemString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => b.status_count - a.status_count);
    } catch (error) {
      console.error("Error processing submissions:", error);
      return [];
    }
  }, [data, searchValue]);

  const [currentPage2, setCurrentPage2] = useState(1);

  const totalPages2 = Math.ceil(sortedSubmissions.length / rowsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob2 = currentPage2 * rowsPerPage;
  const indexOfFirstJob2 = indexOfLastJob2 - rowsPerPage;

  // Get the sortedSubmissions for the current page
  const currentSubmissions = sortedSubmissions.slice(indexOfFirstJob2, indexOfLastJob2);

  const handlePageChange2 = (newPage2) => {
    if (newPage2 >= 1 && newPage2 <= totalPages2) {
      setCurrentPage2(newPage2);
    }
  };

  const handlePageInputChange2 = (e) => {
    const pageNum2 = Number(e.target.value);
    if (pageNum2 >= 1 && pageNum2 <= totalPages2) {
      setCurrentPage2(pageNum2);
    }
  };

  // This effect ensures that pagination works properly when the page number changes
  useEffect(() => {
    // You might not need this effect since handlePageChange2 is already managing the page number.
  }, [currentPage2]);

  // const selectedUserData =
  //     selectedUser && selectedUser.data && selectedUser.data
  //         ? selectedUser.data.sort((a, b) => b.created_at - a.created_at)
  //         : [];

  const selectedUserData =
    selectedUser && selectedUser.data && selectedUser.data
      ? selectedUser.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];

  const [currentPage23, setCurrentPage23] = useState(1);

  const totalPages23 = Math.ceil(selectedUserData.length / rowsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob23 = currentPage23 * rowsPerPage;
  const indexOfFirstJob23 = indexOfLastJob23 - rowsPerPage;

  // Get the selectedUserData for the current page
  const selectedUserInfo = selectedUserData.slice(indexOfFirstJob23, indexOfLastJob23);

  const handlePageChange23 = (newPage23) => {
    if (newPage23 >= 1 && newPage23 <= totalPages23) {
      setCurrentPage23(newPage23);
    }
  };

  const handlePageInputChange23 = (e) => {
    const pageNum23 = Number(e.target.value);
    if (pageNum23 >= 1 && pageNum23 <= totalPages23) {
      setCurrentPage23(pageNum23);
    }
  };

  // This effect ensures that pagination works properly when the page number changes
  useEffect(() => {
    // You might not need this effect since handlePageChange2 is already managing the page number.
  }, [currentPage23]);

  // const sortedTechScreenings =
  //     data?.details?.total_interview_tech_screenings
  //         ? data.details.total_interview_tech_screenings.sort((a, b) =>
  //             a.candidate_full_name.localeCompare(b.candidate_full_name)
  // //         )
  //         : [];

  const sortedTechScreenings = useMemo(() => {
    try {
      const screenings = data?.details?.total_interview_tech_screenings;
      if (!Array.isArray(screenings)) return [];

      return screenings
        .filter((screening) => {
          const screeningString = Object.values(screening)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return screeningString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
    } catch (error) {
      console.error("Error processing tech screenings:", error);
      return [];
    }
  }, [data, searchValue]);

  // const sortedSubmissions =
  // data && data.details && data.details.submissions_by_type_summary
  //     ? data.details.submissions_by_type_summary.sort((a, b) => b.status_count - a.status_count)
  //     : [];

  const [currentPage3, setCurrentPage3] = useState(1);

  const totalPages3 = Math.ceil(sortedTechScreenings.length / rowsPerPage);

  const indexOfLastJob3 = currentPage3 * rowsPerPage;
  const indexOfFirstJob3 = indexOfLastJob3 - rowsPerPage;

  const currentTechScreenings = sortedTechScreenings.slice(indexOfFirstJob3, indexOfLastJob3);

  const handlePageChange3 = (newPage3) => {
    if (newPage3 >= 1 && newPage3 <= totalPages3) {
      setCurrentPage3(newPage3);
    }
  };

  useEffect(() => {
    handlePageChange3(currentPage3);
  }, [currentPage3]);

  const sortedRateConfirmations = useMemo(() => {
    try {
      const confirmations = data?.details?.total_rate_confirmations;
      if (!Array.isArray(confirmations)) return [];

      return confirmations
        .filter((item) => {
          const itemString = Object.values(item)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return itemString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
    } catch (error) {
      console.error("Error processing rate confirmations:", error);
      return [];
    }
  }, [data, searchValue]);

  const [currentPage4, setCurrentPage4] = useState(1);

  const totalPages4 = Math.ceil(sortedRateConfirmations.length / rowsPerPage);

  const indexOfLastJob4 = currentPage4 * rowsPerPage;
  const indexOfFirstJob4 = indexOfLastJob4 - rowsPerPage;

  const currentRateConfirmations = sortedRateConfirmations.slice(indexOfFirstJob4, indexOfLastJob4);

  const handlePageChange4 = (newPage4) => {
    if (newPage4 >= 1 && newPage4 <= totalPages4) {
      setCurrentPage4(newPage4);
    }
  };

  useEffect(() => {
    handlePageChange4(currentPage4);
  }, [currentPage4]);

  const sortedSubmissionsLast24Hours = useMemo(() => {
    try {
      const submissions = data?.details?.total_submissions_last_24_hours;
      if (!Array.isArray(submissions)) return [];

      return submissions
        .filter((item) => {
          const itemString = Object.values(item)
            .filter((value) => typeof value === "string")
            .join(" ")
            .toLowerCase();
          return itemString.includes(searchValue.toLowerCase());
        })
        .sort((a, b) => a?.first_name?.localeCompare(b?.first_name));
    } catch (error) {
      console.error("Error processing submissions:", error);
      return [];
    }
  }, [data, searchValue]);

  const [currentPage5, setCurrentPage5] = useState(1);

  const totalPages5 = Math.ceil(sortedSubmissionsLast24Hours.length / rowsPerPage);

  // Calculate the start and end indices for the current page
  const indexOfLastJob5 = currentPage5 * rowsPerPage;
  const indexOfFirstJob5 = indexOfLastJob5 - rowsPerPage;

  // Get the sortedSubmissionsLast24Hours for the current page
  const currentSubmissionsLast24Hours = sortedSubmissionsLast24Hours.slice(indexOfFirstJob5, indexOfLastJob5);

  const handlePageChange5 = (newPage5) => {
    if (newPage5 >= 1 && newPage5 <= totalPages5) {
      setCurrentPage5(newPage5);
    }
  };

  const handlePageInputChange5 = (e) => {
    const pageNum5 = Number(e.target.value);
    if (pageNum5 >= 1 && pageNum5 <= totalPages5) {
      setCurrentPage5(pageNum5);
    }
  };

  useEffect(() => {
    handlePageChange5(currentPage5);
  }, [currentPage5]);

  // subFunction to retrieve data for the sub table
  const retriveCandidatesNoSubmissions = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailid: user.email,
            email: email, // Pass recruiterAliasName here
            operation: "retrieve",
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setSelectedUser(result);
        // console.log("result.details", result);
        // Update data state with fetched result
      } else {
        throw new Error(result.message || "Failed to fetch recruiter analysis.");
      }
    } catch (err) {
      setError(err.message);
      setCurrentPage23(0);
      // Toast.
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };
  const [contactDetails, setContactDetails] = useState(null);

  const handleRowClick = (email) => {
    setSelectedRow(email); // Set the clicked row's email
    handleNameClick(email); // Call the existing handler
    setCurrentPage23(1);
  };
  // Insert data for reason

  const handleNameClick = async (Email) => {
    // console.log("Email inside function ", Email);
    // setSelectedUser(candidate);
    //setSelectedEmail(Email)
    retriveCandidatesNoSubmissions(Email);
  };

  // console.log(selectedUser, "selectedUser==============000000")

  const submitReason = async (mailID) => {
    const payload = {
      emailid: user.email,
      email: selectedRow,
      operation: "insert",
      no_submission_reason: `${reason || ""}`,
    };

    try {
      setLoadingModal(true);
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/update_candidates_no_submissions_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      setLoadingModal(false);

      if (response.ok) {
        toast.success("A Reason successfully!", {
          draggable: "true",
          autoClose: 2000,
          className: "toast-center",
        });
        setReason("");
        retriveCandidatesNoSubmissions(selectedRow);
      } else {
        const errorData = await response.json();
        toast.error(`Registration failed: ${errorData.message || "An unknown error occurred."}`, {
          draggable: "true",
          autoClose: 2000,
          // position: "center",
          className: "toast-center",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`An error occurred: ${error.message}`, {
        draggable: "true",
        autoClose: 2000,
        // position: "center",
        className: "toast-center",
      });
    }
  };
  const handleFilterChange = (value) => {
    setSelectedEmail(value); // Update the filter state
    // setRecruiterAliasName(value);
    setSelectedUser(null);
    setCurrentPage23(0);
  };

  {
    return (
      <div>
        <div className="main-dash row-flex">
          <nav className="sidebar-nav">
            <div className={`inner-nav-data `}>
              <div className="icon-one">
                <div className="backIcon" onClick={() => navigate("/recruiterAnalysis")}>
                  <svg width="24" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 6L9 12L15 18"
                      stroke="#ffffff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <div className="recruiter-dropdown-updated">
                  <SelectPicker
                    className="selectpickerNormal selectpickerNormalAnalysis"
                    menuClassName="selectpickerNormalitems selectpickerNormalitemsanalyses"
                    placement="autoVertical"
                    cleanable={false}
                    value={selectedEmail}
                    onChange={handleFilterChange}
                    data={[...new Set(recruitersBList.map((item) => item.recruiter_alias_name))].map((item) => ({
                      label: item,
                      value: item,
                    }))}
                    placeholder="Select Recruiter"
                  />

                  {/* <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.38293 10.8807L12.3829 15.8807L17.3829 10.8807H7.38293Z" fill="#0B4DA1" />
                  </svg> */}
                </div>
              </div>
            </div>
            <ul className="d-flex navList">
              <div
                className={`inner-nav ${activeNav === "tab1" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab1");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name">Candidate with Zero Submission</div>
                <div className="icon-one">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      opacity="0.78"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.60082 6.14326C8.6206 5.88619 8.83496 5.68768 9.09279 5.68768C9.34629 5.68768 9.55855 5.87977 9.58377 6.13201L9.99107 10.205L12.9123 11.8743C13.0613 11.9594 13.1532 12.1178 13.1532 12.2894C13.1532 12.6047 12.8534 12.8337 12.5493 12.7507L8.5828 11.6689C8.35142 11.6058 8.19743 11.3873 8.21583 11.1482L8.60082 6.14326Z"
                      fill="inherit"
                    />
                    <path
                      opacity="0.901274"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.81354 0.266447C4.54943 -0.0483012 4.03949 0.0721688 3.94416 0.471831L2.96189 4.58989C2.88422 4.91554 3.14229 5.22403 3.47654 5.20509L7.71282 4.96503C8.12373 4.94174 8.33211 4.45972 8.06756 4.14444L7.05365 2.9361C7.84295 2.66639 8.67991 2.52552 9.53932 2.52552C13.7806 2.52552 17.2188 5.96373 17.2188 10.205C17.2188 14.4462 13.7806 17.8845 9.53932 17.8845C5.29807 17.8845 1.85985 14.4462 1.85985 10.205C1.85985 9.49299 1.95627 8.79564 2.14427 8.1254L0.404487 7.63738C0.175423 8.45401 0.0529175 9.31519 0.0529175 10.205C0.0529175 15.4442 4.30013 19.6914 9.53932 19.6914C14.7785 19.6914 19.0257 15.4442 19.0257 10.205C19.0257 4.96579 14.7785 0.718582 9.53932 0.718582C8.22149 0.718582 6.96641 0.987301 5.8259 1.47293L4.81354 0.266447Z"
                      fill="inherit"
                    />
                  </svg>
                  <div className="row-flex-data1">
                    <div className="number-item-one-details">
                      {data?.summary?.candidates_with_zero_submissions_last_24_hours ?? 0}
                    </div>
                    <div className="all-time-one-details">/ Last 24 hour</div>
                  </div>
                </div>
              </div>

              <div
                className={`inner-nav ${activeNav === "tab2" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab2");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name"> Total Assigned Candidates</div>
                <div className="icon-one">
                  <svg width="27" height="20" viewBox="0 0 27 20" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      opacity="0.587821"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M6.24481 4.80482C6.24481 7.14803 8.14435 9.04757 10.4876 9.04757C12.8308 9.04757 14.7303 7.14803 14.7303 4.80482C14.7303 2.46162 12.8308 0.562073 10.4876 0.562073C8.14435 0.562073 6.24481 2.46162 6.24481 4.80482ZM16.8516 9.04758C16.8516 10.805 18.2763 12.2296 20.0337 12.2296C21.7911 12.2296 23.2158 10.805 23.2158 9.04758C23.2158 7.29018 21.7911 5.86552 20.0337 5.86552C18.2763 5.86552 16.8516 7.29018 16.8516 9.04758Z"
                      fill="inherit"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.4699 11.1689C5.4619 11.1689 1.35317 13.7427 0.942036 18.805C0.919642 19.0808 1.44699 19.6544 1.713 19.6544H19.2347C20.0315 19.6544 20.0439 19.0132 20.0315 18.8059C19.7207 13.6013 15.5483 11.1689 10.4699 11.1689ZM25.8208 19.6544H21.7308C21.7308 17.2669 20.942 15.0636 19.6107 13.2909C23.2239 13.3304 26.1742 15.1572 26.3963 19.018C26.4052 19.1735 26.3963 19.6544 25.8208 19.6544Z"
                      fill="inherit"
                    />
                  </svg>

                  <div className="row-flex-data1">
                    <div className="number-item-one-details">{data?.summary?.total_assigned_candidates ?? 0}</div>
                    <div className="all-time-one-details">/ All Time</div>
                  </div>
                </div>
              </div>

              <div
                className={`inner-nav ${activeNav === "tab3" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab3");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name"> Submissions by Type</div>
                <div className="icon-one">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.891602 7.16841L8.76699 11.7153C8.85179 11.7642 8.94071 11.7996 9.03123 11.822V20.6405L1.45328 16.1558C1.10513 15.9498 0.891602 15.5753 0.891602 15.1707V7.16841ZM19.2058 7.04755V15.1708C19.2058 15.5753 18.9923 15.9498 18.6441 16.1558L11.0662 20.6405V11.7448C11.0846 11.7356 11.1029 11.7257 11.121 11.7153L19.2058 7.04755Z"
                      fill="inherit"
                    />
                    <path
                      opacity="0.499209"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M1.13898 4.96158C1.23517 4.8401 1.35659 4.73743 1.49814 4.66204L9.51059 0.394435C9.84695 0.215283 10.2504 0.215283 10.5868 0.394435L18.5992 4.66204C18.7083 4.72016 18.8055 4.79448 18.8883 4.88114L10.1036 9.95304C10.0458 9.98639 9.99254 10.0245 9.944 10.0667C9.89546 10.0245 9.84221 9.98639 9.78444 9.95304L1.13898 4.96158Z"
                      fill="inherit"
                    />
                  </svg>

                  <div className="row-flex-data1">
                    <div className="number-item-one-details">{data?.summary?.submissions_by_type_summary ?? 0}</div>
                    <div className="all-time-one-details">/ All Time</div>
                  </div>
                </div>
              </div>

              <div
                className={`inner-nav ${activeNav === "tab4" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab4");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name"> Total Interview Tech Screenings</div>
                <div className="icon-one">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3.07126 19.2475H20.3416C20.9774 19.2475 21.4929 19.7629 21.4929 20.3988C21.4929 21.0347 20.9774 21.5502 20.3416 21.5502H1.91991C1.28403 21.5502 0.768555 21.0347 0.768555 20.3988V1.97716C0.768555 1.34128 1.28403 0.825806 1.91991 0.825806C2.55578 0.825806 3.07126 1.34128 3.07126 1.97716V19.2475Z"
                      fill="inherit"
                    />
                    <path
                      opacity="0.5"
                      d="M7.36528 14.2782C6.93037 14.7421 6.20176 14.7656 5.73786 14.3307C5.27397 13.8958 5.25046 13.1672 5.68536 12.7033L10.0029 8.09786C10.4235 7.64922 11.1225 7.61031 11.5903 8.0095L14.998 10.9174L19.4379 5.2935C19.8319 4.79441 20.5559 4.70924 21.055 5.10325C21.5541 5.49727 21.6393 6.22127 21.2452 6.72036L16.0641 13.2831C15.6595 13.7957 14.9099 13.8694 14.4131 13.4455L10.9314 10.4744L7.36528 14.2782Z"
                      fill="inherit"
                    />
                  </svg>

                  <div className="row-flex-data1">
                    <div className="number-item-one-details">{data?.summary?.total_interview_tech_screenings ?? 0}</div>
                    <div className="all-time-one-details">/ All Time</div>
                  </div>
                </div>
              </div>

              <div
                className={`inner-nav ${activeNav === "tab5" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab5");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name"> Total Rate Confirmations</div>
                <div className="icon-one">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.891663 7.11744L8.76705 11.6643C8.85185 11.7133 8.94078 11.7486 9.03129 11.7711V20.5895L1.45334 16.1048C1.1052 15.8988 0.891663 15.5243 0.891663 15.1198V7.11744ZM19.2059 6.99658V15.1198C19.2059 15.5243 18.9923 15.8988 18.6442 16.1049L11.0662 20.5895V11.6938C11.0847 11.6846 11.103 11.6748 11.1211 11.6643L19.2059 6.99658Z"
                      fill="inherit"
                    />
                    <path
                      opacity="0.499209"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M1.13904 4.91061C1.23523 4.78914 1.35665 4.68647 1.4982 4.61107L9.51065 0.343471C9.84701 0.164318 10.2505 0.164318 10.5868 0.343471L18.5993 4.61107C18.7084 4.66919 18.8056 4.74352 18.8884 4.83017L10.1036 9.90207C10.0459 9.93542 9.9926 9.97358 9.94406 10.0158C9.89553 9.97358 9.84227 9.93542 9.78451 9.90207L1.13904 4.91061Z"
                      fill="inherit"
                    />
                  </svg>

                  <div className="row-flex-data1">
                    <div className="number-item-one-details">{data?.summary?.total_rate_confirmations ?? 0}</div>
                    <div className="all-time-one-details">/ All Time</div>
                  </div>
                </div>
              </div>

              <div
                className={`inner-nav ${activeNav === "tab6" ? "active-tab" : ""}`}
                onClick={() => {
                  handleTabClick("tab6");
                  setMobileActive(true);
                }}
              >
                <div className="tabs-name">Total Submissions Last 24 Hours</div>
                <div className="icon-one">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                    <path
                      opacity="0.78"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.60082 6.516C8.6206 6.25893 8.83496 6.06042 9.09279 6.06042C9.34629 6.06042 9.55855 6.25251 9.58377 6.50475L9.99107 10.5778L12.9123 12.247C13.0613 12.3322 13.1532 12.4906 13.1532 12.6622C13.1532 12.9774 12.8534 13.2064 12.5493 13.1235L8.5828 12.0417C8.35142 11.9786 8.19743 11.7601 8.21583 11.521L8.60082 6.516Z"
                      fill="inherit"
                    />
                    <path
                      opacity="0.901274"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.81354 0.639189C4.54943 0.32444 4.03949 0.444911 3.94416 0.844573L2.96189 4.96263C2.88422 5.28828 3.14229 5.59678 3.47654 5.57783L7.71282 5.33777C8.12373 5.31449 8.33211 4.83246 8.06756 4.51718L7.05365 3.30885C7.84295 3.03913 8.67991 2.89826 9.53932 2.89826C13.7806 2.89826 17.2188 6.33647 17.2188 10.5777C17.2188 14.819 13.7806 18.2572 9.53932 18.2572C5.29807 18.2572 1.85985 14.819 1.85985 10.5777C1.85985 9.86573 1.95627 9.16838 2.14427 8.49814L0.404487 8.01013C0.175423 8.82675 0.0529175 9.68793 0.0529175 10.5777C0.0529175 15.8169 4.30013 20.0641 9.53932 20.0641C14.7785 20.0641 19.0257 15.8169 19.0257 10.5777C19.0257 5.33853 14.7785 1.09132 9.53932 1.09132C8.22149 1.09132 6.96641 1.36004 5.8259 1.84568L4.81354 0.639189Z"
                      fill="inherit"
                    />
                  </svg>

                  <div className="row-flex-data1">
                    <div className="number-item-one-details">{data?.summary?.total_submissions_last_24_hours ?? 0}</div>
                    <div className="all-time-one-details">/ All Time</div>
                  </div>
                </div>
              </div>
            </ul>
          </nav>
          <section
            style={{ "--sidebar-width": sidebarWidth + "px" }}
            className={`w-100 scroll-bar bottom-sidebar Full-width-Mobile ${mobileActive === true ? "active" : ""}`}
          >
            {mobileActive && isMobileView ? (
              <div className="leftarrorback d-flex align-items-center" onClick={() => setMobileActive(false)}>
                <span class="material-symbols-outlined">arrow_back_ios</span> Back
              </div>
            ) : (
              <></>
            )}

            <div className={`${styles.container} container-fluid py-3 pt-lg-4 px-2 px-sm-3 px-lg-4 rightcontent`}>
              <div
                className="headerBackground text-white p-3 mb-3 mb-lg-4"
                style={{ borderRadius: "10px", minHeight: "100px" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="m-0 fw-bold h2">Recruiter Analysis</h2>
                    <p>Comprehensive overview of recruiter performance and growth</p>
                  </div>
                  <SearchBox value={searchValue} onChange={setSearchValue} />
                </div>
              </div>
              <div className="inner-benchData-details">
                {activeNav === "tab1" && (
                  <div className="candidate-info-data-details">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <table className="dynamic-table-data1">
                          <thead>
                            <tr>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Candidate Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={MailIcon} alt="headIcon" />
                                  Email ID
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={visa_status} alt="headIcon" />
                                  Visa Status
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={list} alt="headIcon" />
                                  Submission Date
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={status_filter} alt="headIcon" />
                                  Company
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentJobs.map((candidate) => (
                              <tr
                                key={candidate.primary_email}
                                className={selectedRow === candidate.primary_email ? "highlighted-row" : ""}
                                onClick={() => {
                                  handleRowClick(candidate.primary_email);
                                  setContactDetails(candidate);
                                }}
                              >
                                <td
                                  className={` ${
                                    candidate.gender === "Male"
                                      ? "Male"
                                      : candidate.gender === "Female"
                                      ? "Female"
                                      : "Other"
                                  }`}
                                  // onClick={() => handleNameClick(candidate.primary_email)}
                                >
                                  <div className="alignCenter ">
                                    {candidate.gender === "Male" ? (
                                      <NameUserIcon />
                                    ) : candidate.gender === "Female" ? (
                                      <Female />
                                    ) : (
                                      <Others />
                                    )}
                                    <div className="change-color">
                                      {returnTruncatedStr(candidate.first_name + " " + candidate.last_name)}
                                    </div>
                                  </div>
                                </td>

                                <td
                                // onClick={() => handleNameClick(candidate.primary_email)}
                                >
                                  <div className="change-color">{returnTruncatedStr(candidate.primary_email)}</div>
                                </td>

                                <td
                                // onClick={() => handleNameClick(candidate.primary_email)}
                                >
                                  <div className="change-color">{candidate.cvisa_status}</div>
                                </td>

                                <td
                                // onClick={() => handleNameClick(candidate.primary_email)}
                                >
                                  <div className="change-color">
                                    {candidate.last_submission_date
                                      ? new Date(candidate.last_submission_date).toLocaleDateString("en-US")
                                      : "N/A"}
                                  </div>
                                </td>

                                <td
                                // onClick={() => handleNameClick(candidate.primary_email)}
                                >
                                  <div className="change-color">{candidate.onboarded_company}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <CustomPagination
                          data={sortedCandidates}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        />
                      </div>
                    </div>

                    {selectedEmail && contactDetails && (
                      <>
                        <div className={`overlay-container visible`}>
                          <div className="overlay"></div>
                          {/* Sliding Panel */}
                          <div className={`panel smartmatch open`}>
                            <button
                              style={{ zIndex: "99999" }}
                              type="button"
                              className="btn-close modalclosebtn"
                              onClick={() => setContactDetails(null)}
                              aria-label="Close"
                              title="Close"
                            >
                              <X size={34} style={{ marginTop: "3px" }} strokeWidth={2.4} />
                            </button>
                            <div className="pannelinner">
                              <div className="col-flex sideOverlay">
                                <div className="flex-row contactDetails">
                                  <ContactIcon />
                                  <div className="col-flex info">
                                    <span className="head">{contactDetails.first_name}</span>
                                    <span className="text">{contactDetails.primary_email}</span>
                                  </div>
                                </div>
                                <div className="container-wrapper">
                                  {selectedUserInfo?.length ? (
                                    <div className="left-subtable-section d-flex flex-column justify-content-between reasonList">
                                      {/* Left: Table Section */}
                                      <div className="table-responsive">
                                        <table className="left-dynamic-subtable table">
                                          <thead>
                                            <tr>
                                              <th>
                                                <div className="header-align-center">Created At</div>
                                              </th>
                                              <th>
                                                <div className="header-align-center">Reason</div>
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {selectedUserInfo?.map((candidate, index) => (
                                              <tr key={index}>
                                                <td>
                                                  <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <circle cx="6.83644" cy="7.16457" r="6.66457" fill="#0B4DA1" />
                                                  </svg>

                                                  {candidate.created_at
                                                    ? new Date(candidate.created_at)
                                                        .toLocaleString("en-US", {
                                                          month: "2-digit",
                                                          day: "2-digit",
                                                          year: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                          hour12: true,
                                                        })
                                                        .replace(",", " -") // Replace comma with ' -' for the desired format
                                                    : "N/A"}
                                                </td>

                                                <td>
                                                  <ReasonsIcon />
                                                  {candidate.no_submission_reason}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                      <CustomPagination
                                        data={selectedUserData}
                                        currentPage={currentPage23}
                                        setCurrentPage={handlePageChange23}
                                        rowsPerPage={rowsPerPage}
                                        setRowsPerPage={setRowsPerPage}
                                        onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-100">
                                      <EmptyView
                                        hide={loadingModal || loading}
                                        title="No Reasons Found"
                                        description="Start submitting reasons to see them listed here."
                                      />
                                    </div>
                                  )}
                                  <div className="right-submit-reason">
                                    <div className="submit-reason-header">
                                      <ReasonsIcon />
                                      Submit Reason
                                    </div>

                                    <textarea
                                      className="textarea-reason-input"
                                      name="comment"
                                      rows="5"
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                    ></textarea>

                                    <button
                                      type="submit"
                                      className="button-submit-reason"
                                      onClick={() => submitReason()}
                                    >
                                      Submit Reason
                                    </button>
                                  </div>
                                  <ThemeLoader show={loading || loadingModal} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  // <div className="candidate-info-data-details  scroll-bar-data">Candidate With Zero Submission</div>
                )}

                {activeNav === "tab2" && (
                  <div className="candidate-info-data-details  scroll-bar-data">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <table className="dynamic-table-data1">
                          <thead>
                            <tr>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Candidate Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={MailIcon} alt="headIcon" />
                                  Email ID
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={visa_status} alt="headIcon" />
                                  Visa Status
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={list} alt="headIcon" />
                                  Submission Date
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={status_filter} alt="headIcon" />
                                  Company
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentAssignedCandidates.map((candidate) => (
                              <tr key={candidate.primary_email}>
                                <td
                                  className={`status-change-statuschange ${
                                    candidate.gender === "Male"
                                      ? "Male"
                                      : candidate.gender === "Female"
                                      ? "Female"
                                      : "Other"
                                  }`}
                                >
                                  <div className="alignCenter">
                                    {candidate.gender === "Male" ? (
                                      <NameUserIcon />
                                    ) : candidate.gender === "Female" ? (
                                      <Female />
                                    ) : (
                                      <Others />
                                    )}

                                    <span>{returnTruncatedStr(candidate.first_name + " " + candidate.last_name)}</span>
                                  </div>
                                </td>
                                <td>{returnTruncatedStr(candidate.primary_email)}</td>
                                <td className="text-center">{candidate.cvisa_status}</td>
                                <td className="text-center">
                                  {candidate.last_submission_date
                                    ? new Date(candidate.last_submission_date).toLocaleDateString("en-US")
                                    : "N/A"}
                                </td>
                                <td>{candidate.onboarded_company}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <CustomPagination
                          data={sortedAssignedCandidates}
                          currentPage={currentPage1}
                          setCurrentPage={handlePageChange1}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeNav === "tab3" && (
                  <div className="candidate-info-data-details  scroll-bar-data">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <div className="table-responsive">
                          <table className="dynamic-table-data1">
                            <thead>
                              <tr>
                                <th>
                                  <div className="alignCenter">
                                    <img src={list} alt="headIcon" />
                                    Submission Status
                                  </div>
                                </th>
                                <th>
                                  <div className="alignCenter">
                                    <img src={status_filter} alt="headIcon" />
                                    Status Count
                                  </div>
                                </th>
                                <th>
                                  <div className="alignCenter">Percentage</div>
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {currentSubmissions.map((submission, index) => (
                                <tr>
                                  <td>{submission.submission_status}</td>
                                  <td>{submission.status_count}</td>
                                  <td>{submission.percentage}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* <CustomPagination
                          data={sortedSubmissions}
                          currentPage={currentPage2}
                          setCurrentPage={handlePageChange2}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        /> */}
                      </div>
                    </div>
                  </div>
                )}

                {activeNav === "tab4" && (
                  <div className="candidate-info-data-details">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <table className="dynamic-table-data1">
                          <thead>
                            <tr>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Full Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Recruiter
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={visa_status} alt="headIcon" />
                                  Vendor
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={status_filter} alt="headIcon" />
                                  Rate
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={list} alt="headIcon" />
                                  Submission Date
                                </div>
                              </th>

                              <th>
                                <div className="alignCenter">
                                  <img src={status_filter} alt="headIcon" />
                                  Submission Status
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentTechScreenings.map((candidate) => (
                              <tr key={candidate.id}>
                                <td>{returnTruncatedStr(candidate.candidate_full_name)}</td>
                                <td>{returnTruncatedStr(candidate.from_email)}</td>
                                <td>{returnTruncatedStr(candidate.to_email)}</td>

                                <td>{candidate.rate}</td>

                                <td>
                                  {candidate.submission_date
                                    ? new Date(candidate.submission_date).toLocaleDateString("en-US")
                                    : "N/A"}
                                </td>
                                <td>{candidate.submission_status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <CustomPagination
                          data={sortedTechScreenings}
                          currentPage={currentPage3}
                          setCurrentPage={handlePageChange3}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeNav === "tab5" && (
                  <div className="candidate-info-data-details">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <table className="dynamic-table-data1">
                          <thead>
                            <tr>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Full Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Recruiter
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Vendor
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={visa_status} alt="headIcon" />
                                  Rate
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={list} alt="headIcon" />
                                  Submission Date
                                </div>
                              </th>

                              <th>
                                <div className="alignCenter">
                                  <img src={status_filter} alt="headIcon" />
                                  Submission Status
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentRateConfirmations.map((candidate) => (
                              <tr key={candidate.id}>
                                <td>{returnTruncatedStr(candidate.candidate_full_name)}</td>
                                <td>{returnTruncatedStr(candidate.from_email)}</td>
                                <td>{returnTruncatedStr(candidate.to_email)}</td>
                                <td>{candidate.rate}</td>

                                <td>
                                  {candidate.submission_date
                                    ? new Date(candidate.submission_date).toLocaleDateString("en-US")
                                    : "N/A"}
                                </td>
                                <td>{candidate.submission_status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <CustomPagination
                          data={sortedRateConfirmations}
                          currentPage={currentPage4}
                          setCurrentPage={handlePageChange4}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeNav === "tab6" && (
                  <div className="candidate-info-data-details">
                    <div className="mainContent-data">
                      <div className="table-container-data">
                        <table className="dynamic-table-data1">
                          <thead>
                            <tr>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Candidate Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={visa_status} alt="headIcon" />
                                  Rate
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Client Name
                                </div>
                              </th>
                              <th>
                                <div className="alignCenter">
                                  <img src={user_icon} alt="headIcon" />
                                  Vendor Name
                                </div>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentSubmissionsLast24Hours.map((candidate) => (
                              <tr key={candidate.id}>
                                <td>
                                  {returnTruncatedStr(candidate.first_name || "" + " " + candidate.last_name || "")}
                                </td>
                                <td>{candidate.rate}</td>
                                <td>{candidate.client_name}</td>
                                <td>{returnTruncatedStr(candidate.vendor_name)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <CustomPagination
                          data={sortedSubmissionsLast24Hours}
                          currentPage={currentPage5}
                          setCurrentPage={handlePageChange5}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          onPaginatedChange={(pageData) => console.log(pageData, "pageDatapageData")}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
        <ThemeLoader show={loading} />
      </div>
    );
  }
};

export default RecruiterAnalysisDetails;
