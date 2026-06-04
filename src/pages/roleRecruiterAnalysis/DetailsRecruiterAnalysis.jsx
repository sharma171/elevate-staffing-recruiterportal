import Dashnav from "../../components/dashnav";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import "./roleRecruiter.css";

const DetailsRecruiterAnalysis = () => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  // console.log(params.get("activeTab"), "para");

  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState(params.get("activeTab") || "tab1");
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null); // State to store API response
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const Email_id = location.state;
  let storedUser = JSON.parse(localStorage.getItem("user"));
  // console.log(Email_id, "Email_id");

  // if (!Email_id) {
  //     toast.warn("Please Select Email");
  //     navigate("/recruiterAnalysis");
  // }

  useEffect(() => {
    // console.log("Email_id selected:", Email_id);
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
              email: storedUser.email, // Pass recruiterAliasName here
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
  }, [Email_id]);

  const handleTabClick = (tabName) => {
    // console.log("tabName", tabName);
    setActiveNav(tabName);
    // console.log("after-tabName", tabName);
  };

  function goBack() {
    navigate("/analysisRecruiter");
  }

  const sortedCandidates = data?.details?.candidates_with_zero_submissions_last_24_hours
    ? data?.details?.candidates_with_zero_submissions_last_24_hours?.sort((a, b) =>
        a?.first_name?.localeCompare(b?.first_name)
      )
    : [];

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

  const sortedAssignedCandidates = data?.details?.total_assigned_candidates
    ? data?.details?.total_assigned_candidates?.sort((a, b) => a?.first_name?.localeCompare(b?.first_name))
    : [];

  const [currentPage1, setCurrentPage1] = useState(1);
  const jobsPerPage1 = 10;

  const totalPages1 = Math.ceil(sortedAssignedCandidates.length / jobsPerPage1);

  // Calculate the start and end indices for the current page
  const indexOfLastJob1 = currentPage1 * jobsPerPage1;
  const indexOfFirstJob1 = indexOfLastJob1 - jobsPerPage1;

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

  const sortedSubmissions =
    data && data.details && data.details.submissions_by_type_summary
      ? data.details.submissions_by_type_summary.sort((a, b) => b.status_count - a.status_count)
      : [];

  const [currentPage2, setCurrentPage2] = useState(1);
  const jobsPerPage2 = 10;

  const totalPages2 = Math.ceil(sortedSubmissions.length / jobsPerPage2);

  // Calculate the start and end indices for the current page
  const indexOfLastJob2 = currentPage2 * jobsPerPage2;
  const indexOfFirstJob2 = indexOfLastJob2 - jobsPerPage2;

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

  const selectedUserData =
    selectedUser && selectedUser.data && selectedUser.data
      ? selectedUser.data.sort((a, b) => b.created_at - a.created_at)
      : [];

  console.log("selectedUserData==selectedUserData", selectedUserData);

  const [currentPage23, setCurrentPage23] = useState(1);
  const jobsPerPage23 = 3;

  const totalPages23 = Math.ceil(selectedUserData.length / jobsPerPage23);

  // Calculate the start and end indices for the current page
  const indexOfLastJob23 = currentPage23 * jobsPerPage23;
  const indexOfFirstJob23 = indexOfLastJob23 - jobsPerPage23;

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

  const sortedTechScreenings = data?.details?.total_interview_tech_screenings
    ? data?.details.total_interview_tech_screenings?.sort((a, b) =>
        a?.candidate_full_name?.localeCompare(b?.candidate_full_name)
      )
    : [];

  const [currentPage3, setCurrentPage3] = useState(1);
  const jobsPerPage3 = 10;

  const totalPages3 = Math.ceil(sortedTechScreenings.length / jobsPerPage3);

  // Calculate the start and end indices for the current page
  const indexOfLastJob3 = currentPage3 * jobsPerPage3;
  const indexOfFirstJob3 = indexOfLastJob3 - jobsPerPage3;

  // Get the sortedTechScreenings for the current page
  const currentTechScreenings = sortedTechScreenings.slice(indexOfFirstJob3, indexOfLastJob3);

  const handlePageChange3 = (newPage3) => {
    if (newPage3 >= 1 && newPage3 <= totalPages3) {
      setCurrentPage3(newPage3);
    }
  };

  const handlePageInputChange3 = (e) => {
    const pageNum3 = Number(e.target.value);
    if (pageNum3 >= 1 && pageNum3 <= totalPages3) {
      setCurrentPage3(pageNum3);
    }
  };

  useEffect(() => {
    handlePageChange3(currentPage3);
  }, [currentPage3]);

  const sortedRateConfirmations = data?.details?.total_rate_confirmations
    ? data?.details.total_rate_confirmations?.sort((a, b) =>
        a?.candidate_full_name?.localeCompare(b?.candidate_full_name)
      )
    : [];

  const [currentPage4, setCurrentPage4] = useState(1);
  const jobsPerPage4 = 10;

  const totalPages4 = Math.ceil(sortedRateConfirmations.length / jobsPerPage4);

  // Calculate the start and end indices for the current page
  const indexOfLastJob4 = currentPage4 * jobsPerPage4;
  const indexOfFirstJob4 = indexOfLastJob4 - jobsPerPage4;

  // Get the sortedRateConfirmations for the current page
  const currentRateConfirmations = sortedRateConfirmations.slice(indexOfFirstJob4, indexOfLastJob4);

  const handlePageChange4 = (newPage4) => {
    if (newPage4 >= 1 && newPage4 <= totalPages4) {
      setCurrentPage4(newPage4);
    }
  };

  const handlePageInputChange4 = (e) => {
    const pageNum4 = Number(e.target.value);
    if (pageNum4 >= 1 && pageNum4 <= totalPages4) {
      setCurrentPage4(pageNum4);
    }
  };

  useEffect(() => {
    handlePageChange4(currentPage4);
  }, [currentPage4]);

  const sortedSubmissionsLast24Hours = data?.details?.total_submissions_last_24_hours
    ? data?.details.total_submissions_last_24_hours?.sort((a, b) => a?.first_name?.localeCompare(b?.first_name))
    : [];

  const [currentPage5, setCurrentPage5] = useState(1);
  const jobsPerPage5 = 10;

  const totalPages5 = Math.ceil(sortedSubmissionsLast24Hours.length / jobsPerPage5);

  // Calculate the start and end indices for the current page
  const indexOfLastJob5 = currentPage5 * jobsPerPage5;
  const indexOfFirstJob5 = indexOfLastJob5 - jobsPerPage5;

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
            emailid: storedUser.email,
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
      // Toast.
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Insert data for reason

  const handleNameClick = async (Email) => {
    // console.log("Email inside function ", Email);
    // setSelectedUser(candidate);
    setSelectedEmail(Email);
    retriveCandidatesNoSubmissions(Email);
  };

  // console.log(selectedUser, "selectedUser==============000000")

  const submitReason = async () => {
    console.log("inside submit reason fun", selectedEmail, "Emailid");

    const payload = {
      emailid: storedUser.email,
      email: selectedEmail,
      operation: "insert",
      no_submission_reason: `${reason || ""}`,
    };

    console.log("payload====,payload", payload);

    try {
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

      if (response.ok) {
        toast.success("A Reason successfully!");
        // Optionally, redirect to another page or reset form
        // navigate('/benchcandidates'); // Replace with your desired route
        setReason("");

        //make this a subfunction or utitlity function retrieveData()
        retriveCandidatesNoSubmissions(selectedEmail);
      } else {
        const errorData = await response.json();
        toast.error(`Registration failed: ${errorData.message || "An unknown error occurred."}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  {
    return (
      <div>
        <div className="main-dash row-flex">
          <section className="w-100">
            <div className="top-section row-flex">
              {/* <img  alt="" /> */}
              <svg width="35" height="36" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_747_579)">
                  <path
                    d="M15.8562 0.312134C15.5558 0.313335 15.3126 0.55653 15.3114 0.856873V3.04758H14.2166C13.7308 3.04871 13.4875 3.63545 13.83 3.98004L17.1112 7.26236C17.325 7.47726 17.6739 7.47726 17.8877 7.26236L21.17 3.98004C21.5129 3.63509 21.2687 3.04777 20.7823 3.04758H19.6886V0.856873C19.6874 0.55653 19.4442 0.313335 19.1438 0.312134H15.8562ZM24.7023 7.88507C24.567 7.89216 24.4391 7.94926 24.3434 8.04529L23.1642 9.22342C22.9493 9.43721 22.9493 9.78508 23.1642 9.99887C23.378 10.2138 23.7259 10.2138 23.9397 9.99887L25.1178 8.81967C25.332 8.606 25.332 8.25896 25.1178 8.04529C25.0083 7.93536 24.8573 7.87711 24.7023 7.88507ZM10.2753 7.8872C10.1406 7.89398 10.0132 7.95028 9.91745 8.04528C9.70322 8.25896 9.70322 8.60599 9.91745 8.81967L11.0967 9.99887C11.31 10.211 11.6545 10.211 11.8678 9.99887C12.0828 9.78507 12.0828 9.43721 11.8678 9.22342L10.6886 8.04528C10.5793 7.93671 10.4292 7.8793 10.2753 7.8872ZM17.4989 8.51312C15.6925 8.51312 14.2166 9.98962 14.2166 11.7954C14.2166 12.8381 14.7092 13.7706 15.4727 14.3728C13.4543 15.181 12.0291 17.1598 12.0291 19.473V21.7268C9.44331 22.3566 7.3797 23.393 6.03058 24.7025C5.13846 25.5685 4.56609 26.589 4.41346 27.6537H3.82599C3.52395 27.655 3.28007 27.9007 3.28125 28.2028C3.28242 28.5031 3.52562 28.7463 3.82599 28.7475H4.40705C4.44742 29.0517 4.52344 29.3567 4.63776 29.6597C5.29662 31.4056 7.01129 32.795 9.27979 33.7698C11.5483 34.7446 14.4019 35.3088 17.4712 35.3121C20.5404 35.3154 23.4039 34.7555 25.6796 33.7858C27.9553 32.8161 29.6771 31.435 30.3494 29.6917C30.4704 29.378 30.5504 29.0628 30.5919 28.7475H31.174C31.4744 28.7463 31.7176 28.5031 31.7188 28.2028C31.72 27.9007 31.4761 27.6549 31.174 27.6537H30.5844C30.4325 26.6004 29.8706 25.5898 28.994 24.7303C27.6463 23.409 25.574 22.3623 22.9709 21.7278V19.4731C22.9709 17.1598 21.5456 15.1811 19.5273 14.3728C20.2908 13.7706 20.7823 12.838 20.7823 11.7954C20.7823 9.98962 19.3054 8.51312 17.4989 8.51312ZM9.30008 11.2507C8.99637 11.2495 8.74988 11.496 8.75107 11.7997C8.75228 12.1017 8.99804 12.3456 9.30008 12.3444H10.9674C11.2695 12.3457 11.5152 12.1017 11.5164 11.7997C11.5176 11.496 11.2711 11.2495 10.9674 11.2507H9.30008ZM24.0646 11.2507C23.7626 11.2519 23.5187 11.4977 23.5199 11.7997C23.521 12.1001 23.7643 12.3433 24.0646 12.3444H25.7352C26.036 12.3438 26.2798 12.1005 26.281 11.7997C26.2822 11.4973 26.0376 11.2513 25.7352 11.2507H24.0646ZM23.5231 13.4393C23.3878 13.4464 23.2599 13.5035 23.1642 13.5995C22.9493 13.8133 22.9493 14.1611 23.1642 14.3749L24.3434 15.5541C24.5571 15.7684 24.9041 15.7684 25.1178 15.5541C25.3328 15.3403 25.3328 14.9925 25.1178 14.7787L23.9397 13.5995C23.8299 13.4893 23.6784 13.431 23.5231 13.4393ZM11.4534 13.4414C11.3191 13.4484 11.1921 13.5047 11.0967 13.5995L9.91745 14.7787C9.70251 14.9925 9.70251 15.3403 9.91745 15.5541C10.1308 15.7662 10.4753 15.7662 10.6886 15.5541L11.8678 14.3749C12.0828 14.1611 12.0828 13.8133 11.8678 13.5995C11.7582 13.4906 11.6077 13.4332 11.4534 13.4414ZM17.4989 15.0778C19.9326 15.0778 21.8761 17.0261 21.8761 19.4731V22.2192C21.8761 22.5314 21.6443 22.765 21.3313 22.765C21.0184 22.765 20.7823 22.5314 20.7823 22.2192V19.9975C20.7833 19.6311 20.4797 19.4519 20.2376 19.4528C19.8746 19.4555 19.6878 19.7465 19.6886 19.9975V26.8366C19.6886 27.3004 19.3339 27.6559 18.8693 27.6559C18.4048 27.6559 18.0447 27.2846 18.0447 26.8366V24.3757C18.0289 23.6626 16.9658 23.6626 16.9499 24.3757V26.8366C16.9499 27.2993 16.5952 27.6559 16.1307 27.6559C15.6662 27.6559 15.3114 27.3004 15.3114 26.8366V19.9975C15.3114 19.7724 15.141 19.4547 14.7624 19.4528C14.3953 19.4551 14.2187 19.7476 14.2166 19.9975V22.2192C14.2166 22.5314 13.9806 22.765 13.6676 22.765C13.3547 22.765 13.1229 22.5314 13.1229 22.2192V19.4731C13.1229 17.0261 15.0653 15.0778 17.4989 15.0778ZM12.1477 22.8269C12.3909 23.4293 12.9821 23.8587 13.6676 23.8587C13.8597 23.8587 14.0445 23.8244 14.2166 23.7626V24.6395C12.5111 24.9252 11.1179 25.4135 10.1439 26.0665C9.60658 26.4268 9.18943 26.8435 8.94867 27.3387C8.89933 27.4401 8.85934 27.5458 8.82798 27.6537H8.19779C7.89408 27.6525 7.64759 27.8991 7.64878 28.2028C7.64998 28.5048 7.89575 28.7487 8.19779 28.7475L8.82584 28.7486C8.8455 28.8167 8.86894 28.8834 8.89634 28.9494C9.33465 30.006 10.4994 30.7052 12.0088 31.2181C13.3884 31.6869 15.0994 31.9725 16.9531 32.0202V32.5778C16.9531 33.3071 18.0469 33.3071 18.0469 32.5778V32.0202C19.8849 31.973 21.5838 31.692 22.9581 31.2298C24.4733 30.7202 25.6404 30.0224 26.0909 28.9697C26.1221 28.8966 26.1481 28.8225 26.1699 28.7475H26.8012C27.1032 28.7487 27.349 28.5048 27.3502 28.2028C27.3514 27.8991 27.1049 27.6526 26.8012 27.6537H26.1699C26.1407 27.5529 26.1049 27.4542 26.0599 27.3589C25.8247 26.8618 25.4142 26.4455 24.8807 26.0836C23.906 25.4225 22.5039 24.9269 20.7834 24.6385V23.7626C20.9555 23.8244 21.1403 23.8587 21.3324 23.8587C22.0172 23.8587 22.6086 23.4304 22.8523 22.8291C25.2456 23.4337 27.1031 24.405 28.2303 25.51C28.9375 26.2034 29.3652 26.918 29.5013 27.6537H28.9822C28.6802 27.6549 28.4363 27.9007 28.4375 28.2028C28.4387 28.5031 28.6819 28.7463 28.9822 28.7475H29.4917C29.4551 28.9307 29.3999 29.1152 29.3283 29.3008C28.8169 30.6268 27.361 31.8818 25.2513 32.7807C23.1416 33.6796 20.4104 34.2205 17.4754 34.2173C14.5404 34.2142 11.8144 33.668 9.71238 32.7647C7.61034 31.8614 6.16351 30.6021 5.66315 29.2762C5.59622 29.0989 5.5454 28.9226 5.51041 28.7475H6.01349C6.31595 28.7492 6.5624 28.5052 6.56357 28.2028C6.56478 27.8986 6.31762 27.652 6.01349 27.6537H5.5008C5.63857 26.9108 6.0726 26.1892 6.79322 25.4897C7.9231 24.393 9.77096 23.4278 12.1477 22.8269ZM14.2166 25.7482V26.8366C14.2166 27.8877 15.0794 28.7496 16.1307 28.7496C16.6719 28.7496 17.1494 28.5372 17.4989 28.1718C17.8485 28.5371 18.3281 28.7496 18.8693 28.7496C19.9206 28.7496 20.7823 27.8877 20.7823 26.8366V25.7514C22.3095 26.0281 23.5221 26.4823 24.2665 26.9872C24.5971 27.2115 24.8291 27.4427 24.9725 27.6537H24.6137C24.3116 27.655 24.0677 27.9007 24.0689 28.2028C24.0701 28.5031 24.3133 28.7463 24.6137 28.7475H24.9693C24.63 29.2327 23.807 29.7904 22.6109 30.1927C21.377 30.6076 19.7767 30.8664 18.0469 30.9147V30.3903C18.0469 29.6609 16.9531 29.6609 16.9531 30.3903V30.9158C15.2079 30.8677 13.5983 30.6059 12.3602 30.1852C11.1806 29.7843 10.368 29.2288 10.0296 28.7475H10.3864C10.6867 28.7463 10.9299 28.5031 10.9311 28.2028C10.9323 27.9007 10.6884 27.6549 10.3864 27.6537H10.0296C10.1754 27.4391 10.4133 27.2038 10.7538 26.9755C11.5002 26.475 12.7028 26.0231 14.2166 25.7482Z"
                    fill="#15649C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_747_579">
                    <rect width="35" height="35" fill="white" transform="translate(0 0.312134)" />
                  </clipPath>
                </defs>
              </svg>

              {user?.user_role === "recruiter" ? (
                <p className="title-left">My Assigned Candidates</p>
              ) : (
                <p className="title-left">Recruiter Analysis</p>
              )}
              <button className="profile-button-right">
                <img alt="" className="profile" />
                Your Profile
              </button>
            </div>

            <div className="inner-benchData-details">
              <nav className="sidebar-nav">
                <div className="back-to-dash">
                  <div className="icon-back" onClick={goBack}>
                    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.07298 1.36079L6.94498 0.232788L0.544983 6.63279L6.94498 13.0328L8.07298 11.9048L2.80898 6.63279L8.07298 1.36079Z"
                        fill="#4543AC"
                      />
                    </svg>
                  </div>
                  <div> Back To DashBoard</div>
                </div>

                <ul>
                  <div
                    className={`inner-nav ${activeNav === "tab1" ? "active-tab" : ""}`}
                    onClick={() => handleTabClick("tab1")}
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
                    onClick={() => handleTabClick("tab2")}
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
                    onClick={() => handleTabClick("tab3")}
                  >
                    <div className="tabs-name"> Submission By Type</div>
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
                    onClick={() => handleTabClick("tab4")}
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
                        <div className="number-item-one-details">
                          {data?.summary?.total_interview_tech_screenings ?? 0}
                        </div>
                        <div className="all-time-one-details">/ All Time</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`inner-nav ${activeNav === "tab5" ? "active-tab" : ""}`}
                    onClick={() => handleTabClick("tab5")}
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
                    onClick={() => handleTabClick("tab6")}
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
                        <div className="number-item-one-details">
                          {data?.summary?.total_submissions_last_24_hours ?? 0}
                        </div>
                        <div className="all-time-one-details">/ All Time</div>
                      </div>
                    </div>
                  </div>
                </ul>
              </nav>

              {activeNav === "tab1" && (
                <div className="candidate-info-data-details  scroll-bar-data">
                  <div className="mainContent-data">
                    <div className="table-container-data">
                      <table className="dynamic-table-data1">
                        <thead>
                          <tr>
                            <th>
                              <div className="alignCenter">
                                {/* <CandidateNameIcon /> */}
                                Candidate name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                Email Id
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Visa Status
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <CompanyIcon /> */}
                                Submission Date
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
                                Company
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentJobs.map((candidate) => (
                            <tr key={candidate.primary_email}>
                              <td
                                className={` ${
                                  candidate.gender === "Male"
                                    ? "Male"
                                    : candidate.gender === "Female"
                                    ? "Female"
                                    : "Other"
                                }`}
                                onClick={() => handleNameClick(candidate.primary_email)}
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
                                    {candidate.first_name} {candidate.last_name || " "}
                                  </div>
                                </div>
                              </td>

                              <td onClick={() => handleNameClick(candidate.primary_email)}>
                                <div className="change-color">{candidate.primary_email}</div>
                              </td>

                              <td onClick={() => handleNameClick(candidate.primary_email)}>
                                <div className="change-color">{candidate.cvisa_status}</div>
                              </td>

                              <td onClick={() => handleNameClick(candidate.primary_email)}>
                                <div className="change-color">
                                  {candidate.last_submission_date
                                    ? new Date(candidate.last_submission_date).toLocaleDateString("en-US")
                                    : "N/A"}
                                </div>
                              </td>

                              <td onClick={() => handleNameClick(candidate.primary_email)}>
                                <div className="change-color">{candidate.onboarded_company}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* <div className='row-flex navigation' style={{ marginTop: '10px' }}>
                                                <button className='left nav' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                                                        <path d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z" fill="#341FA8" />
                                                    </svg>

                                                </button>
                                                <span style={{ margin: '0 10px' }} className='text'>
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button className='nav' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                                                        <path d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z" fill="#341FA8" />
                                                    </svg>
                                                </button>
                                            </div> */}
                    </div>
                  </div>

                  {selectedEmail && (
                    <div className="container-wrapper">
                      <div className="left-subtable-section">
                        {/* Left: Table Section */}
                        <table className="left-dynamic-subtable">
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
                                {/* <td>{candidate.created_at
                                                                    ? new Date(candidate.created_at).toLocaleDateString('en-US')
                                                                    : 'N/A'}</td> */}

                                <td>
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

                                <td>{candidate.no_submission_reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                          {/* Previous Button */}
                          <button
                            className="left nav"
                            onClick={() => handlePageChange23(currentPage23 - 1)}
                            disabled={currentPage23 === 1}
                          >
                            <svg
                              width="21"
                              height="21"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                              <path
                                d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                                fill="#341FA8"
                              />
                            </svg>
                          </button>

                          {/* Page Info */}
                          <span style={{ margin: "0 10px" }} className="text">
                            Page {currentPage23} of {totalPages23}
                          </span>

                          {/* Next Button */}
                          <button
                            className="nav"
                            onClick={() => handlePageChange23(currentPage23 + 1)}
                            disabled={currentPage23 === totalPages23}
                          >
                            <svg
                              width="21"
                              height="21"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                              <path
                                d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                                fill="#341FA8"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="vertical-line"></div>

                      {/* Right: Submit Reason Section */}
                      <div className="right-submit-reason">
                        <div className="submit-reason-header">Submit Reason</div>

                        <textarea
                          className="textarea-reason-input"
                          name="comment"
                          rows="5"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        ></textarea>

                        <button type="submit" className="button-submit-reason" onClick={() => submitReason()}>
                          Submit Reason
                        </button>
                      </div>
                    </div>
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
                                {/* <CandidateNameIcon /> */}
                                Candidate name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                Email Id
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Visa Status
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <CompanyIcon /> */}
                                Submission Date
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
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

                                  <span>
                                    {candidate.first_name} {candidate.last_name || " "}
                                  </span>
                                </div>
                              </td>
                              <td>{candidate.primary_email}</td>
                              <td>{candidate.cvisa_status}</td>
                              <td>
                                {candidate.last_submission_date
                                  ? new Date(candidate.last_submission_date).toLocaleDateString("en-US")
                                  : "N/A"}
                              </td>
                              <td>{candidate.onboarded_company}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        <button
                          className="left nav"
                          onClick={() => handlePageChange1(currentPage1 - 1)}
                          disabled={currentPage1 === 1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                            <path
                              d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                              fill="#341FA8"
                            />
                          </svg>
                        </button>
                        <span style={{ margin: "0 10px" }} className="text">
                          Page {currentPage1} of {totalPages1}
                        </span>
                        <button
                          className="nav"
                          onClick={() => handlePageChange1(currentPage1 + 1)}
                          disabled={currentPage1 === totalPages1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                </div>
              )}

              {activeNav === "tab3" && (
                <div className="candidate-info-data-details  scroll-bar-data">
                  <div className="mainContent-data">
                    <div className="table-container-data">
                      <table className="dynamic-table-data1">
                        <thead>
                          <tr>
                            <th>
                              <div className="alignCenter">
                                {/* <CandidateNameIcon /> */}
                                Submission Status
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                Status Count
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Percentage
                              </div>
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
                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        {/* Previous Button */}
                        <button
                          className="left nav"
                          onClick={() => handlePageChange2(currentPage2 - 1)}
                          disabled={currentPage2 === 1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                            <path
                              d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                              fill="#341FA8"
                            />
                          </svg>
                        </button>

                        {/* Page Info */}
                        <span style={{ margin: "0 10px" }} className="text">
                          Page {currentPage2} of {totalPages2}
                        </span>

                        {/* Next Button */}
                        <button
                          className="nav"
                          onClick={() => handlePageChange2(currentPage2 + 1)}
                          disabled={currentPage2 === totalPages2}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                </div>
              )}

              {activeNav === "tab4" && (
                <div className="candidate-info-data-details  scroll-bar-data">
                  <div className="mainContent-data">
                    <div className="table-container-data">
                      <table className="dynamic-table-data1">
                        <thead>
                          <tr>
                            <th>
                              <div className="alignCenter">
                                {/* <CandidateNameIcon /> */}
                                Full Name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                Client name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Vendor
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <CompanyIcon /> */}
                                Rate
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
                                Submission Status
                              </div>
                            </th>

                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
                                Submission date
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentTechScreenings.map((candidate) => (
                            <tr key={candidate.id}>
                              <td>{candidate.candidate_full_name}</td>
                              <td>{candidate.from_email}</td>
                              <td>{candidate.to_email}</td>
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
                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        <button
                          className="left nav"
                          onClick={() => handlePageChange3(currentPage3 - 1)}
                          disabled={currentPage3 === 1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                            <path
                              d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                              fill="#341FA8"
                            />
                          </svg>
                        </button>
                        <span style={{ margin: "0 10px" }} className="text">
                          Page {currentPage3} of {totalPages3}
                        </span>
                        <button
                          className="nav"
                          onClick={() => handlePageChange3(currentPage3 + 1)}
                          disabled={currentPage3 === totalPages3}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                </div>
              )}

              {activeNav === "tab5" && (
                <div className="candidate-info-data-details  scroll-bar-data">
                  <div className="mainContent-data">
                    <div className="table-container-data">
                      <table className="dynamic-table-data1">
                        <thead>
                          <tr>
                            <th>
                              <div className="alignCenter">
                                {/* <CandidateNameIcon /> */}
                                Full Name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                Client name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Vendor
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <CompanyIcon /> */}
                                Rate
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
                                Submission Status
                              </div>
                            </th>

                            <th>
                              <div className="alignCenter">
                                {/* <StatusIcon /> */}
                                Submission date
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentRateConfirmations.map((candidate) => (
                            <tr key={candidate.id}>
                              <td>{candidate.candidate_full_name}</td>
                              <td>{candidate.from_email}</td>
                              <td>{candidate.to_email}</td>
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
                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        <button
                          className="left nav"
                          onClick={() => handlePageChange4(currentPage4 - 1)}
                          disabled={currentPage4 === 1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                            <path
                              d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                              fill="#341FA8"
                            />
                          </svg>
                        </button>
                        <span style={{ margin: "0 10px" }} className="text">
                          Page {currentPage4} of {totalPages4}
                        </span>
                        <button
                          className="nav"
                          onClick={() => handlePageChange4(currentPage4 + 1)}
                          disabled={currentPage4 === totalPages4}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                </div>
              )}

              {activeNav === "tab6" && (
                <div className="candidate-info-data-details  scroll-bar-data">
                  <div className="mainContent-data">
                    <div className="table-container-data">
                      <table className="dynamic-table-data1">
                        <thead>
                          <tr>
                            <th>
                              <div className="alignCenter">
                                {/* <CandidateNameIcon /> */}
                                Candidate Name
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <EmailIcon /> */}
                                EmailId
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <VisaIcon /> */}
                                Vias Status
                              </div>
                            </th>
                            <th>
                              <div className="alignCenter">
                                {/* <CompanyIcon /> */}
                                Onboarded Company
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentSubmissionsLast24Hours.map((candidate) => (
                            <tr key={candidate.id}>
                              <td>
                                {candidate.first_name}
                                {candidate.last_name}
                              </td>
                              <td>{candidate.primary_email}</td>
                              <td>{candidate.cvisa_status}</td>
                              <td>{candidate.onboarded_company}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        <button
                          className="left nav"
                          onClick={() => handlePageChange5(currentPage5 - 1)}
                          disabled={currentPage5 === 1}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                            <path
                              d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                              fill="#341FA8"
                            />
                          </svg>
                        </button>
                        <span style={{ margin: "0 10px" }} className="text">
                          Page {currentPage5} of {totalPages5}
                        </span>
                        <button
                          className="nav"
                          onClick={() => handlePageChange5(currentPage5 + 1)}
                          disabled={currentPage5 === totalPages5}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }
};

export default DetailsRecruiterAnalysis;
