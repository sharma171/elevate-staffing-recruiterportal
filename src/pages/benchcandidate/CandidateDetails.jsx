// file route not in use need to delete

import React, { useEffect, useState, useRef } from "react";
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
import Docu from "../../images/doc.svg";
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
import GreenSuccessTick from "../../images/green-tick-success.png";
import FilePreview from "./FilePreview";
import { Link, useNavigate } from "react-router-dom";

import FemaleIcon from "../../images/female.svg";

import MaleIcon from "../../images/name-user-icon.svg";

import OthersIcon from "../../images/otherGender.svg";
import logoUploadFile from "../../images/line-md--uploading-loop.svg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import uploadIcon from "./uploadIcon.png";
import dataBaseIcon from "./databaseIcon.png";
import closeIcon from "./closeIcon.png";
import uploadButtonIcon from "./uploadButtonIcon.png";
import moreIcon from "./moreIcon.png";

const ThreeRow = ({ handleDeleteFile, handleBase64File, fileType, handleDownloadFile }) => {
  const [openMenuRow, setOpenMenuRow] = useState(false);
  const [isDeleteData, setIsDeleteData] = useState(false);
  const [isDownloadData, setIsDownloadData] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const menuRef = useRef(null);
  console.log("fileTypefileTypefileType", fileType);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuRow(false); // Close the menu if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const HandleDelete = () => {
    console.log("inside the fun");
    setOpenMenuRow(false);
    handleDeleteFile();
    setIsDeleteData((prevState) => !prevState);
  };

  const HandleView = () => {
    console.log("View File");
    handleBase64File();
  };

  const HandleDownload = () => {
    console.log("DOWnload file");
    handleDownloadFile();
  };

  return (
    <div ref={menuRef}>
      <button className="action-button" onClick={() => setOpenMenuRow((prevState) => !prevState)}>
        <img src={moreIcon} alt="more" />
      </button>
      {openMenuRow && (
        <div className="action-menu">
          <ul>
            {fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <li
                onClick={() => {
                  HandleView();
                  setOpenMenuRow(false); // Close the menu
                }}
              >
                View
              </li>
            )}
            <li
              onClick={() => {
                HandleDelete();
                setOpenMenuRow(false); // Close the menu
              }}
            >
              Delete
            </li>
            <li
              onClick={() => {
                HandleDownload();
                setOpenMenuRow(false); // Close the menu
              }}
            >
              Download
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
const CandidateDetails = () => {
  const [candidateDetails, setCandidateDetails] = useState({});
  const [activeTab, setActiveTab] = useState("home");
  const [formData, setFormData] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const [activeNav, setActiveNav] = useState("tab1");
  const { user } = useAuth();

  console.log(candidateDetails, "candidateDetails");

  const [localData, setLocalData] = useState({
    bench_candidates: [],
    candidate_rateconfirmations: [],
  });
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentType, setDocumentType] = useState("other");

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const [filesData, setFilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageForFile, setCurrentPageForFile] = useState(1); // Current Page
  const [isOpenThreeDots, setIsOpenThreeDots] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isDeleteData, setIsDeleteData] = useState(false);
  const [fileType, setFileType] = useState(null);
  const [base64File, setBase64File] = useState(null);

  const [isDownloadData, setIsDownloadData] = useState(false);

  const handleTabClick = (tabName) => {
    setActiveNav(tabName);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  function backToBench() {
    if (user?.user_role === "recruiter") {
      navigate("/myAssignedCandidates");
    } else {
      navigate("/benchcandidates");
    }
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
    if (user?.email) {
      // Fetch candidates data on component mount
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      fetch("https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: user?.email,
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
    }
  }, [user?.email]);

  useEffect(() => {
    const fetchLocalData = async () => {
      if (!candidateDetails?.primary_email) {
        console.log("No candidate email found or candidate details are undefined.");
        return;
      }

      try {
        const queryObj = {
          emailid: user?.email,
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

  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const itemsPerPage = 11; // Number of items per page

  // Sort the data by submission_date in descending order
  const sortedData =
    localData.candidate_rateconfirmations.length && localData.candidate_rateconfirmations
      ? localData.candidate_rateconfirmations.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
      : [];

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const indexOfLastJob3 = currentPage * itemsPerPage;
  const indexOfFirstJob3 = indexOfLastJob3 - itemsPerPage;

  // Get the data for the current page
  const currentData = sortedData.slice(indexOfFirstJob3, indexOfLastJob3);

  // Handle next and previous buttons

  const goToNextPage = (newPage3) => {
    if (newPage3 >= 1 && newPage3 <= totalPages) {
      setCurrentPage(newPage3);
    }
  };

  // const goToPreviousPage = () => {
  //     if (currentPage > 1) setCurrentPage(currentPage - 1);
  // };

  useEffect(() => {
    goToNextPage(currentPage);
  }, [currentPage]);

  const uploadDocument = () => {
    setIsPopupVisible(true); // Show the popup
  };

  const closePopup = () => {
    // setSelectedFiles([]);
    setIsPopupVisible(false); // Hide the popup
  };

  const submitPopup = () => {
    // setSelectedFiles([]);
    setIsPopupVisible(false); // Hide the popup
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to an array
    console.log("files", files);
    const validFiles = files.filter((file) => {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const isValidSize = file.size <= 10 * 1024 * 1024;

      // Check for valid MIME types
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const isValidType = validTypes.includes(file.type);

      console.log("File type:", file.type); // For debugging
      console.log("Is valid type:", isValidType);

      return isValidSize && isValidType;
    });
    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
      })),
    ]);
    setDocumentType("resume");
    console.log(selectedFiles);
  };

  useEffect(() => {
    console.log(selectedFiles);
  }, [selectedFiles]);

  const handleOtherFile = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      const isValidType = file.type.match(/^image\/(png|jpeg|jpg)$/) || file.type === "application/pdf"; // Check images & PDFs
      return isValidSize && isValidType;
    });
    setDocumentType("other");
    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
      })),
    ]);
    console.log(selectedFiles);
  };
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function UploadDocuments() {
    try {
      setIsLoading(true);

      // Convert selected files to Base64 asynchronously
      const filesWithContent = await Promise.all(
        selectedFiles.map(async (selectedFile) => ({
          file_name: selectedFile.file.name, // Correctly access the `file` property
          document_type: documentType, // Use the current document type
          file_content: await fileToBase64(selectedFile.file), // Convert the file to Base64
        }))
      );

      console.log("filesWithContent:", filesWithContent);

      // Create the payload
      const payload = {
        emailid: user?.email,
        email_id: candidateDetails?.primary_email,
        files: filesWithContent,
      };

      console.clear();
      console.log("Payload:", payload);

      // Send the request
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/documents_upload_determine_type_v3",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response:", data);

      setIsSuccess(true); // Show success popup
      setTimeout(() => setIsSuccess(false), 2000); // Hide after 2 seconds

      // Clear the selected files
      setSelectedFiles([]); // Use an empty array to clear files
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loading popup
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove the Base64 prefix
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // API CALL FOR YOUR DOCUMENT FIEL DATA

  useEffect(() => {
    if (candidateDetails?.primary_email) {
      fetchFileData();
    }
  }, [candidateDetails, selectedFiles, isDeleteData]);

  const fetchFileData = async () => {
    try {
      // API Payload
      const payload = {
        emailid: user?.email,
        email_id: candidateDetails?.primary_email,
        // email_id: "aishwarya.py96@gmail.com",
        task: "get_file_names",
      };

      // API Call using fetch
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("response=====", response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Extracting available_files from response
      const { available_files } = data;

      // Sort files by upload_datetime in descending order
      const sortedFiles = available_files.sort(
        (a, b) => new Date(b.fileuploaded_datetime) - new Date(a.fileuploaded_datetime)
      );

      setFilesData(sortedFiles || []);
      console.log("setFilesDatasetFilesData", setFilesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files data.");
      setLoading(false);
    }
  };

  // Calculate the data to display for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDataForFiles = filesData.slice(startIndex, endIndex);

  // Calculate total number of pages

  // Handle page navigation

  const handleDeleteFile = async (file, primary_email) => {
    try {
      // API Payload
      const payload = {
        emailid: user?.email,
        email_id: primary_email,
        task: "delete_files",
        file_name: [file.file_name],
      };

      // API Call using fetch
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("response=====", response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setIsDeleteData((prevState) => !prevState);
      toast.success("Deleted successfully", {
        draggable: "true",
        autoClose: 2000,
        className: "toast-center",
      });
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files data.");
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file, primary_email) => {
    try {
      // API Payload
      const payload = {
        emailid: user?.email,
        email_id: primary_email,
        task: "download_files",
        file_name: [file.file_name],
      };

      // API Call using fetch
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if we have valid data
      if (data.status === "success" && data.retrieve_files && data.retrieve_files.length > 0) {
        // Get the first file's base64 data
        const fileData = data.retrieve_files[0];
        const base64Data = fileData.base64;

        // Convert base64 to binary
        const binaryData = atob(base64Data);

        // Create array buffer
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }

        // Create blob
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileData.file_name || "downloaded_file.pdf";

        // Append to document, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up
        window.URL.revokeObjectURL(downloadUrl);

        setIsDownloadData((prevState) => !prevState);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err) {
      console.error("Error fetching or downloading files:", err);
      setError("Failed to download file.");
      setLoading(false);
    }
  };

  const handleBase64File = (file, primary_email) => {
    fetch("https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailid: user?.email,
        email_id: primary_email,
        task: "download_files",
        file_name: [file.file_name],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // setBase64File(prevState => data.retrieve_files[0].base64)

        setBase64File(() => data.retrieve_files[0].base64);
        setFileType(() => data.retrieve_files[0].file_extension);
      });
  };

  return (
    <div>
      <div className="main-dash row-flex">
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
                    <button onClick={() => backToEdit(candidateDetails?.id)}>
                      <img src={EditIcon} alt="" />
                      edit
                    </button>
                  )}
                </div>
                <div className="userinfo">
                  <div
                    className={`status-change-statuschange ${
                      candidateDetails?.gender === "Male"
                        ? "Male"
                        : candidateDetails?.gender === "Female"
                        ? "Female"
                        : "Other"
                    }`}
                  >
                    <div className="alignCenter">
                      {candidateDetails?.gender === "Male" ? (
                        <img className="icon1" src={MaleIcon} alt="" />
                      ) : candidateDetails?.gender === "Female" ? (
                        <img className="icon1" src={FemaleIcon} alt="" />
                      ) : (
                        <img className="icon1" src={OthersIcon} alt="" />
                      )}
                    </div>
                  </div>
                  <div className="userName">{candidateDetails?.first_name}</div>
                  <div className="userEmail">{candidateDetails?.primary_email}</div>
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
                    <p className="title">Onboarded Company : {candidateDetails?.onboarded_company}</p>
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
                            value={candidateDetails?.first_name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={candidateDetails?.last_name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Primary Email</label>
                          <input
                            type="text"
                            placeholder="Enter Primary Email"
                            name="primary_email"
                            value={candidateDetails?.primary_email}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Secondary Email</label>
                          <input
                            type="text"
                            name="secondary_email"
                            value={candidateDetails?.secondary_email}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Primary Contact</label>
                          <input
                            type="text"
                            name="primary_contact"
                            value={candidateDetails?.primary_contact}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="inputComponent">
                          <label htmlFor="">Secondary Contact</label>
                          <input
                            type="text"
                            name="secondary_contact"
                            value={candidateDetails?.secondary_contact}
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
                            value={candidateDetails?.candidate_address1}
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
                            value={candidateDetails?.visa_status}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Current Status</label>
                          <input
                            name="current_status"
                            value={candidateDetails?.current_status}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Currently in a Project:</label>
                          <input
                            name="currently_in_project"
                            value={candidateDetails?.currently_in_project ? "Yes" : "No"}
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
                              candidateDetails?.us_entry_date
                                ? new Date(candidateDetails?.us_entry_date).toLocaleDateString("en-US")
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
                            value={candidateDetails?.university_name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Visa at the time of US Entry:</label>
                          <input
                            type="text"
                            name="us_entry_visa"
                            value={candidateDetails?.us_entry_visa}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Offer Letter Status:</label>
                          <input
                            name="opt_letter_status"
                            value={candidateDetails?.opt_letter_status}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent ">
                          <label htmlFor="">Comments:</label>
                          <input
                            type="text"
                            name="comments"
                            value={candidateDetails?.comments}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent ">
                          <label htmlFor="">Onboarded Company</label>
                          <input
                            type="text"
                            name="onboarded_company"
                            value={candidateDetails?.onboarded_company}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent col-span-3">
                          <label htmlFor="">One Drive:</label>
                          <input
                            type="text"
                            name="candidate_onedrive_link"
                            value={candidateDetails?.candidate_onedrive_link}
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
              <div className="candidate-info-data">
                <div className="candidateEditForm second-navbar">
                  <div className="header-main">
                    <img src={FileDoc} alt="" />
                    <p className="title">Files & Documents : </p>
                    <img src={Date_marketing} alt="" />
                    <p className="title">Onboarded Company : {candidateDetails?.onboarded_company}</p>
                    <img src={sub} alt="" />
                    <p className="title">Submissions : {localData.candidate_rateconfirmations.length}</p>
                  </div>

                  <div className="legendHeading">
                    {/* <img src={Docu} alt="" srcset="" /> */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        opacity="0.5"
                        d="M2.5 8.33329C2.5 5.19079 2.5 3.61913 3.47667 2.64329C4.45333 1.66746 6.02417 1.66663 9.16667 1.66663H10.8333C13.9758 1.66663 15.5475 1.66663 16.5233 2.64329C17.4992 3.61996 17.5 5.19079 17.5 8.33329V11.6666C17.5 14.8091 17.5 16.3808 16.5233 17.3566C15.5467 18.3325 13.9758 18.3333 10.8333 18.3333H9.16667C6.02417 18.3333 4.4525 18.3333 3.47667 17.3566C2.50083 16.38 2.5 14.8091 2.5 11.6666V8.33329Z"
                        fill="#3C55BA"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.04199 8.33337C6.04199 8.16761 6.10784 8.00864 6.22505 7.89143C6.34226 7.77422 6.50123 7.70837 6.66699 7.70837H13.3337C13.4994 7.70837 13.6584 7.77422 13.7756 7.89143C13.8928 8.00864 13.9587 8.16761 13.9587 8.33337C13.9587 8.49913 13.8928 8.65811 13.7756 8.77532C13.6584 8.89253 13.4994 8.95837 13.3337 8.95837H6.66699C6.50123 8.95837 6.34226 8.89253 6.22505 8.77532C6.10784 8.65811 6.04199 8.49913 6.04199 8.33337ZM6.04199 11.6667C6.04199 11.5009 6.10784 11.342 6.22505 11.2248C6.34226 11.1076 6.50123 11.0417 6.66699 11.0417H10.8337C10.9994 11.0417 11.1584 11.1076 11.2756 11.2248C11.3928 11.342 11.4587 11.5009 11.4587 11.6667C11.4587 11.8325 11.3928 11.9914 11.2756 12.1086C11.1584 12.2259 10.9994 12.2917 10.8337 12.2917H6.66699C6.50123 12.2917 6.34226 12.2259 6.22505 12.1086C6.10784 11.9914 6.04199 11.8325 6.04199 11.6667Z"
                        fill="#3C55BA"
                      />
                    </svg>

                    <h5 className="cont-name">Your Documents</h5>
                    <span className="divider5"></span>
                  </div>

                  <div className="drag-main">
                    <div className="flex-main-drop">
                      <div className="inner-drag">
                        <div className="svg-img" onClick={uploadDocument}>
                          <svg
                            width="55"
                            height="38"
                            viewBox="0 0 55 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M45.6571 16.5409C44.4231 7.71944 36.6667 1.18616 27.3237 1.18616C19.3022 1.18751 12.3397 6.02301 9.78295 13.3177C4.05449 14.5038 0 19.2524 0 24.9362C0 31.1288 5.02474 36.3022 11.4583 36.8112H45.0408C50.4167 36.3022 54.6474 31.8915 54.6474 26.6326C54.6474 21.6274 50.7692 17.3022 45.6571 16.5382V16.5409ZM36.7541 21.2909C36.6766 21.3736 36.5813 21.4391 36.4749 21.4829C36.3685 21.5267 36.2535 21.5478 36.1378 21.5447C36.0218 21.5478 35.9064 21.5266 35.7998 21.4826C35.6931 21.4385 35.5977 21.3726 35.5201 21.2895L28.2051 14.25V30.875C28.2051 31.3839 27.8526 31.7232 27.3237 31.7232C26.7949 31.7232 26.4423 31.3839 26.4423 30.875V14.25L19.1259 21.2909C19.0464 21.3711 18.9507 21.435 18.8448 21.4786C18.7389 21.5222 18.6248 21.5447 18.5096 21.5447C18.3944 21.5447 18.2804 21.5222 18.1744 21.4786C18.0685 21.435 17.9729 21.3711 17.8933 21.2909C17.8095 21.2143 17.7428 21.1221 17.6972 21.0199C17.6516 20.9177 17.6281 20.8077 17.6281 20.6964C17.6281 20.5852 17.6516 20.4752 17.6972 20.373C17.7428 20.2708 17.8095 20.1786 17.8933 20.102L26.7074 11.6199C26.7949 11.5357 26.8837 11.4516 26.9712 11.4516C27.1474 11.3661 27.4126 11.3661 27.6763 11.4516C27.7651 11.5357 27.8526 11.5357 27.9414 11.6199L36.7555 20.102C37.1081 20.4413 37.1067 20.9516 36.7541 21.2909Z"
                              fill="#091BC9"
                              fill-opacity="0.75"
                            />
                          </svg>
                        </div>

                        <div className="drop-inner">Click to Choose & Upload Files</div>

                        {
                          // selectedFiles.map((file)=>(<p>{file.name}</p>))
                        }
                        <div className="size-div">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.99967 14.6667C4.31767 14.6667 1.33301 11.682 1.33301 8.00004C1.33301 4.31804 4.31767 1.33337 7.99967 1.33337C11.6817 1.33337 14.6663 4.31804 14.6663 8.00004C14.6663 11.682 11.6817 14.6667 7.99967 14.6667ZM7.99967 13.8667C9.55561 13.8667 11.0478 13.2486 12.148 12.1484C13.2482 11.0482 13.8663 9.55598 13.8663 8.00004C13.8663 6.4441 13.2482 4.95189 12.148 3.85168C11.0478 2.75147 9.55561 2.13337 7.99967 2.13337C6.44374 2.13337 4.95153 2.75147 3.85131 3.85168C2.7511 4.95189 2.13301 6.4441 2.13301 8.00004C2.13301 9.55598 2.7511 11.0482 3.85131 12.1484C4.95153 13.2486 6.44374 13.8667 7.99967 13.8667ZM7.55967 4.28737H8.43967L8.38034 8.99404H7.61967L7.56101 4.28737H7.55967ZM7.99967 11.382C7.92632 11.3829 7.85354 11.3691 7.78559 11.3415C7.71765 11.3138 7.65593 11.2729 7.60406 11.221C7.55219 11.1691 7.51122 11.1074 7.48356 11.0395C7.4559 10.9715 7.44211 10.8987 7.44301 10.8254C7.44165 10.7519 7.45512 10.6789 7.48262 10.6108C7.51011 10.5426 7.55107 10.4807 7.60303 10.4287C7.65499 10.3768 7.7169 10.3358 7.78505 10.3083C7.8532 10.2808 7.9262 10.2674 7.99967 10.2687C8.31701 10.2687 8.55634 10.5087 8.55634 10.8254C8.5577 10.8988 8.54423 10.9718 8.51673 11.04C8.48924 11.1081 8.44828 11.1701 8.39632 11.222C8.34435 11.274 8.28245 11.3149 8.2143 11.3424C8.14614 11.3699 8.07315 11.3834 7.99967 11.382Z"
                              fill="#3B416C"
                            />
                          </svg>
                          Max File Size : 10MB
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loading Popup */}
                  {(isLoading || isSuccess) && (
                    <div className="overlay">
                      {isLoading && (
                        <div className="popup loading">
                          <img src={logoUploadFile} alt="" className="profile" />
                          <p>File Upload in Progress</p>
                        </div>
                      )}

                      {/* Success Popup */}
                      {isSuccess && (
                        <div className="popup success">
                          <img src={GreenSuccessTick} alt="" className="success-tick" />
                          <p>Your Files Uploaded successfully!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isPopupVisible && (
                    <div className="popup-overlay-data">
                      <div className="popup-content-data">
                        <div className="uploadFiles">
                          <img src={uploadIcon} alt="" className="uploadIcon" /> Choose & Upload Your Files
                        </div>
                        <div className="resume-other">
                          <div className="resume-col p-relative">
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 48 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M40 11V43C40 44.65 38.65 46 37 46H11C9.34998 46 8 44.65 8 43V6C8 3.78998 9.78998 2 12 2H31C31.27 2 31.52 2.10999 31.71 2.28998L39.71 10.29C39.89 10.48 40 10.73 40 11Z"
                                fill="#009CE7"
                              />
                              <path
                                d="M40 11.58V14H32C31.45 14 31 13.55 31 13V4H32C32.27 4 32.52 4.10999 32.71 4.28998L40 11.58Z"
                                fill="#1E81CE"
                              />
                              <path
                                d="M40 11V12H31C30.45 12 30 11.55 30 11V2H31C31.27 2 31.52 2.10999 31.71 2.28998L39.71 10.29C39.89 10.48 40 10.73 40 11Z"
                                fill="#EBEBEB"
                              />
                              <path
                                d="M22 15C22.7956 15 23.5587 14.6839 24.1213 14.1213C24.6839 13.5587 25 12.7956 25 12C25 11.2044 24.6839 10.4413 24.1213 9.87868C23.5587 9.31607 22.7956 9 22 9C21.2044 9 20.4413 9.31607 19.8787 9.87868C19.3161 10.4413 19 11.2044 19 12C19 12.7956 19.3161 13.5587 19.8787 14.1213C20.4413 14.6839 21.2044 15 22 15Z"
                                fill="#1E81CE"
                              />
                              <path
                                d="M24 14C24.7956 14 25.5587 13.6839 26.1213 13.1213C26.6839 12.5587 27 11.7956 27 11C27 10.2044 26.6839 9.44129 26.1213 8.87868C25.5587 8.31607 24.7956 8 24 8C23.2044 8 22.4413 8.31607 21.8787 8.87868C21.3161 9.44129 21 10.2044 21 11C21 11.7956 21.3161 12.5587 21.8787 13.1213C22.4413 13.6839 23.2044 14 24 14Z"
                                fill="#EBEBEB"
                              />
                              <path
                                d="M22 15C23.393 15 24.6367 15.9438 25.08 17.3446L25.283 17.9869C25.3095 18.0691 25.317 18.1568 25.3048 18.2426C25.2927 18.3285 25.2614 18.41 25.2134 18.4804C25.1654 18.5508 25.1022 18.608 25.0291 18.6473C24.9559 18.6865 24.875 18.7066 24.793 18.7059H19.2163C19.1347 18.7055 19.0543 18.6847 18.9817 18.6451C18.9091 18.6056 18.8464 18.5485 18.7986 18.4784C18.7509 18.4083 18.7194 18.3272 18.7068 18.2418C18.6943 18.1564 18.701 18.0691 18.7263 17.9869L18.9293 17.3446C19.1453 16.6609 19.5591 16.0666 20.1119 15.6458C20.6646 15.225 21.3285 14.9991 22.0093 15H22ZM15 24.8824C15 24.5547 15.1229 24.2405 15.3417 24.0089C15.5605 23.7772 15.8572 23.6471 16.1667 23.6471H27.8333C28.1428 23.6471 28.4395 23.7772 28.6583 24.0089C28.8771 24.2405 29 24.5547 29 24.8824C29 25.21 28.8771 25.5242 28.6583 25.7558C28.4395 25.9875 28.1428 26.1176 27.8333 26.1176H16.1667C15.8572 26.1176 15.5605 25.9875 15.3417 25.7558C15.1229 25.5242 15 25.21 15 24.8824ZM15 29.8235C15 29.4959 15.1229 29.1817 15.3417 28.95C15.5605 28.7184 15.8572 28.5882 16.1667 28.5882H27.8333C28.1428 28.5882 28.4395 28.7184 28.6583 28.95C28.8771 29.1817 29 29.4959 29 29.8235C29 30.1512 28.8771 30.4654 28.6583 30.697C28.4395 30.9287 28.1428 31.0588 27.8333 31.0588H16.1667C15.8572 31.0588 15.5605 30.9287 15.3417 30.697C15.1229 30.4654 15 30.1512 15 29.8235ZM16.1667 33.5294C15.8572 33.5294 15.5605 33.6596 15.3417 33.8912C15.1229 34.1229 15 34.4371 15 34.7647C15 35.0923 15.1229 35.4065 15.3417 35.6382C15.5605 35.8699 15.8572 36 16.1667 36H20.8333C21.1428 36 21.4395 35.8699 21.6583 35.6382C21.8771 35.4065 22 35.0923 22 34.7647C22 34.4371 21.8771 34.1229 21.6583 33.8912C21.4395 33.6596 21.1428 33.5294 20.8333 33.5294H16.1667Z"
                                fill="#1E81CE"
                              />
                              <path
                                d="M24 14C25.393 14 26.6367 14.9438 27.08 16.3446L27.283 16.9869C27.3095 17.0691 27.317 17.1568 27.3048 17.2426C27.2927 17.3285 27.2614 17.41 27.2134 17.4804C27.1654 17.5508 27.1022 17.608 27.0291 17.6473C26.9559 17.6865 26.875 17.7066 26.793 17.7059H21.2163C21.1347 17.7055 21.0543 17.6847 20.9817 17.6451C20.9091 17.6056 20.8464 17.5485 20.7986 17.4784C20.7509 17.4083 20.7194 17.3272 20.7068 17.2418C20.6943 17.1564 20.701 17.0691 20.7263 16.9869L20.9293 16.3446C21.1453 15.6609 21.5591 15.0666 22.1119 14.6458C22.6646 14.225 23.3285 13.9991 24.0093 14H24ZM17 23.8824C17 23.5547 17.1229 23.2405 17.3417 23.0089C17.5605 22.7772 17.8572 22.6471 18.1667 22.6471H29.8333C30.1428 22.6471 30.4395 22.7772 30.6583 23.0089C30.8771 23.2405 31 23.5547 31 23.8824C31 24.21 30.8771 24.5242 30.6583 24.7558C30.4395 24.9875 30.1428 25.1176 29.8333 25.1176H18.1667C17.8572 25.1176 17.5605 24.9875 17.3417 24.7558C17.1229 24.5242 17 24.21 17 23.8824ZM17 28.8235C17 28.4959 17.1229 28.1817 17.3417 27.95C17.5605 27.7184 17.8572 27.5882 18.1667 27.5882H29.8333C30.1428 27.5882 30.4395 27.7184 30.6583 27.95C30.8771 28.1817 31 28.4959 31 28.8235C31 29.1512 30.8771 29.4654 30.6583 29.697C30.4395 29.9287 30.1428 30.0588 29.8333 30.0588H18.1667C17.8572 30.0588 17.5605 29.9287 17.3417 29.697C17.1229 29.4654 17 29.1512 17 28.8235ZM18.1667 32.5294C17.8572 32.5294 17.5605 32.6596 17.3417 32.8912C17.1229 33.1229 17 33.4371 17 33.7647C17 34.0923 17.1229 34.4065 17.3417 34.6382C17.5605 34.8699 17.8572 35 18.1667 35H22.8333C23.1428 35 23.4395 34.8699 23.6583 34.6382C23.8771 34.4065 24 34.0923 24 33.7647C24 33.4371 23.8771 33.1229 23.6583 32.8912C23.4395 32.6596 23.1428 32.5294 22.8333 32.5294H18.1667Z"
                                fill="#EBEBEB"
                              />
                            </svg>
                            <div>
                              {/* <input type="file" className='hidden-content'/> */}
                              <input
                                className="hidden-content fileInput"
                                type="file"
                                // multiple
                                onChange={handleFileChange}
                                accept=".pdf, .docx" // Restricts file selection to PDF and DOCX
                              />
                              Resume
                            </div>
                          </div>
                          <svg width="2" height="70" viewBox="0 0 2 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L0.999997 69" stroke="#009CE7" stroke-opacity="0.5" stroke-linecap="round" />
                          </svg>

                          <div className="other-col p-relative">
                            <svg
                              width="49"
                              height="48"
                              viewBox="0 0 49 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M40.5 11V43C40.5 44.65 39.15 46 37.5 46H11.5C9.84998 46 8.5 44.65 8.5 43V6C8.5 3.78998 10.29 2 12.5 2H31.5C31.77 2 32.02 2.10999 32.21 2.28998L40.21 10.29C40.39 10.48 40.5 10.73 40.5 11Z"
                                fill="#009CE7"
                                fill-opacity="0.61"
                              />
                              <path
                                d="M40.5 11.58V14H32.5C31.95 14 31.5 13.55 31.5 13V4H32.5C32.77 4 33.02 4.10999 33.21 4.28998L40.5 11.58Z"
                                fill="#1E81CE"
                                fill-opacity="0.46"
                              />
                              <path
                                d="M40.5 11V12H31.5C30.95 12 30.5 11.55 30.5 11V2H31.5C31.77 2 32.02 2.10999 32.21 2.28998L40.21 10.29C40.39 10.48 40.5 10.73 40.5 11Z"
                                fill="#EBEBEB"
                                fill-opacity="0.63"
                              />
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M14.5 20.2273C14.5 19.9018 14.6331 19.5896 14.87 19.3595C15.1069 19.1293 15.4281 19 15.7632 19H29.2368C29.5719 19 29.8931 19.1293 30.13 19.3595C30.3669 19.5896 30.5 19.9018 30.5 20.2273C30.5 20.5528 30.3669 20.8649 30.13 21.0951C29.8931 21.3252 29.5719 21.4545 29.2368 21.4545H15.7632C15.4281 21.4545 15.1069 21.3252 14.87 21.0951C14.6331 20.8649 14.5 20.5528 14.5 20.2273ZM14.5 26.7727C14.5 26.4472 14.6331 26.1351 14.87 25.9049C15.1069 25.6748 15.4281 25.5455 15.7632 25.5455H24.1842C24.5192 25.5455 24.8405 25.6748 25.0774 25.9049C25.3143 26.1351 25.4474 26.4472 25.4474 26.7727C25.4474 27.0982 25.3143 27.4104 25.0774 27.6405C24.8405 27.8707 24.5192 28 24.1842 28H15.7632C15.4281 28 15.1069 27.8707 14.87 27.6405C14.6331 27.4104 14.5 27.0982 14.5 26.7727Z"
                                fill="#1E81CE"
                                fill-opacity="0.46"
                              />
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M16.5 17.2273C16.5 16.9018 16.6331 16.5896 16.87 16.3595C17.1069 16.1293 17.4281 16 17.7632 16H31.2368C31.5719 16 31.8931 16.1293 32.13 16.3595C32.3669 16.5896 32.5 16.9018 32.5 17.2273C32.5 17.5528 32.3669 17.8649 32.13 18.0951C31.8931 18.3252 31.5719 18.4545 31.2368 18.4545H17.7632C17.4281 18.4545 17.1069 18.3252 16.87 18.0951C16.6331 17.8649 16.5 17.5528 16.5 17.2273ZM16.5 23.7727C16.5 23.4472 16.6331 23.1351 16.87 22.9049C17.1069 22.6748 17.4281 22.5455 17.7632 22.5455H26.1842C26.5192 22.5455 26.8405 22.6748 27.0774 22.9049C27.3143 23.1351 27.4474 23.4472 27.4474 23.7727C27.4474 24.0982 27.3143 24.4104 27.0774 24.6405C26.8405 24.8707 26.5192 25 26.1842 25H17.7632C17.4281 25 17.1069 24.8707 16.87 24.6405C16.6331 24.4104 16.5 24.0982 16.5 23.7727Z"
                                fill="white"
                              />
                              <path
                                d="M33.5 37H29.5C28.9473 37 28.5 36.5527 28.5 36C28.5 35.4473 28.9473 35 29.5 35H33.5C34.0527 35 34.5 35.4473 34.5 36C34.5 36.5527 34.0527 37 33.5 37Z"
                                fill="#1E81CE"
                                fill-opacity="0.46"
                              />
                              <path
                                d="M27.5 36C27.5 36.55 27.05 37 26.5 37H17.5V38C17.5 38.55 17.05 39 16.5 39C15.95 39 15.5 38.55 15.5 38V37H13.5C12.95 37 12.5 36.55 12.5 36C12.5 35.45 12.95 35 13.5 35H15.5V34C15.5 33.45 15.95 33 16.5 33C17.05 33 17.5 33.45 17.5 34V35H26.5C27.05 35 27.5 35.45 27.5 36Z"
                                fill="#1E81CE"
                                fill-opacity="0.46"
                              />
                              <path
                                d="M34.5 35H30.5C29.9473 35 29.5 34.5527 29.5 34C29.5 33.4473 29.9473 33 30.5 33H34.5C35.0527 33 35.5 33.4473 35.5 34C35.5 34.5527 35.0527 35 34.5 35Z"
                                fill="#EBEBEB"
                                fill-opacity="0.63"
                              />
                              <path
                                d="M28.5 34C28.5 34.55 28.05 35 27.5 35H18.5V36C18.5 36.55 18.05 37 17.5 37C16.95 37 16.5 36.55 16.5 36V35H14.5C13.95 35 13.5 34.55 13.5 34C13.5 33.45 13.95 33 14.5 33H16.5V32C16.5 31.45 16.95 31 17.5 31C18.05 31 18.5 31.45 18.5 32V33H27.5C28.05 33 28.5 33.45 28.5 34Z"
                                fill="#EBEBEB"
                                fill-opacity="0.63"
                              />
                            </svg>
                            <div>
                              <input
                                className="hidden-content fileInput"
                                type="file"
                                multiple
                                onChange={handleOtherFile}
                                accept=".pdf, .png, .jpg, .jpeg" // Now correctly allows PDF, JPEG, and PNG
                              />
                              Other
                            </div>{" "}
                          </div>
                        </div>

                        <div className="row-flex filesList">
                          <div className="uploadedFiles">
                            <img src={dataBaseIcon} alt="" className="icon" />
                            Files
                          </div>
                          {selectedFiles.map((file, index) => (
                            <>
                              <div key={index} className="items">
                                <span className="truncate pr-2">{file.file.name}</span>
                                {console.log(file.file.name)}
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </>
                          ))}
                        </div>
                        {/* Add your file upload inputs or other content here */}
                        <div className="row-flex-btn">
                          <button onClick={closePopup} className="close-btn">
                            <img src={closeIcon} alt="" className="close" />
                            Close
                          </button>
                          <button
                            onClick={() => {
                              submitPopup();
                              UploadDocuments();
                            }}
                            className="submit-btn"
                            disabled={selectedFiles.length === 0}
                          >
                            Submit
                            <img src={uploadButtonIcon} alt="" className="icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mainContent">
                    <div className="table-container">
                      <table className="dynamic-table-data">
                        <thead>
                          <tr>
                            <th className="th-file_name">
                              <svg
                                width="20"
                                height="25"
                                viewBox="0 0 20 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect width="20" height="24" transform="translate(0 0.543579)" fill="#F2F2F2" />
                                <path
                                  d="M1.66667 5.54358C0.746167 5.54358 0 6.44358 0 7.54358V21.5436C0 22.6436 0.746192 23.5436 1.66667 23.5436H18.3333C19.2542 23.5436 20 22.6436 20 21.5436V7.54358C20 6.44358 19.2542 5.54358 18.3333 5.54358H1.66667Z"
                                  fill="#555555"
                                />
                                <path
                                  d="M1.66667 4.54358C0.746167 4.54358 0 5.44358 0 6.54358V20.5436C0 21.6436 0.746192 22.5436 1.66667 22.5436H18.3333C19.2542 22.5436 20 21.6436 20 20.5436V6.54358C20 5.44358 19.2542 4.54358 18.3333 4.54358H1.66667Z"
                                  fill="#5F5F5F"
                                />
                                <path
                                  d="M1.66667 3.54358C0.746167 3.54358 0 4.44358 0 5.54358V19.5436C0 20.6436 0.746192 21.5436 1.66667 21.5436H18.3333C19.2542 21.5436 20 20.6436 20 19.5436V5.54358C20 4.44358 19.2542 3.54358 18.3333 3.54358H1.66667Z"
                                  fill="#555555"
                                />
                                <path
                                  d="M1.66667 2.54358C0.746167 2.54358 0 3.44358 0 4.54358V18.5436C0 19.6436 0.746192 20.5436 1.66667 20.5436H18.3333C19.2542 20.5436 20 19.6436 20 18.5436V4.54358C20 3.44358 19.2542 2.54358 18.3333 2.54358H1.66667Z"
                                  fill="#D5D2D2"
                                />
                                <path
                                  d="M13.333 2.54358V3.54358V16.5436C13.333 17.6436 14.0788 18.5436 14.9997 18.5436C15.9205 18.5436 16.6663 17.6436 16.6663 16.5436V3.54358V2.54358H13.333Z"
                                  fill="#4F565C"
                                />
                                <path
                                  d="M15.0003 2.54358V3.54358H15.8337V2.54358H15.0003ZM15.0003 3.54358H14.167V4.54358H15.0003V3.54358ZM15.0003 4.54358V5.54358H15.8337V4.54358H15.0003ZM15.0003 5.54358H14.167V6.54358H15.0003V5.54358ZM15.0003 6.54358V7.54358H15.8337V6.54358H15.0003ZM15.0003 7.54358H14.167V8.54358H15.0003V7.54358ZM15.0003 8.54358V9.54358H15.8337V8.54358H15.0003ZM15.0003 9.54358H14.167V10.5436H15.0003V9.54358ZM15.0003 10.5436V11.5436H15.8337V10.5436H15.0003ZM15.0003 11.5436H14.167V12.5436H15.0003V11.5436ZM15.0003 12.5436V13.5436H15.8337V12.5436H15.0003ZM15.0003 13.5436H14.167V14.5436H15.0003V13.5436ZM15.0003 14.5436V15.5436H15.8337V14.5436H15.0003ZM15.0003 15.5436H14.167V16.5436H15.0003V15.5436ZM15.0003 16.5436V17.5436H15.8337V16.5436H15.0003Z"
                                  fill="#D3D3D3"
                                />
                                <path
                                  d="M14.167 2.54358V3.54358H15.0003V2.54358H14.167ZM14.167 4.54358V5.54358H15.0003V4.54358H14.167ZM14.167 6.54358V7.54358H15.0003V6.54358H14.167ZM14.167 8.54358V9.54358H15.0003V8.54358H14.167ZM14.167 10.5436V11.5436H15.0003V10.5436H14.167ZM14.167 12.5436V13.5436H15.0003V12.5436H14.167ZM14.167 14.5436V15.5436H15.0003V14.5436H14.167ZM14.167 16.5436V17.5436H15.0003V16.5436H14.167Z"
                                  fill="#BDC3C7"
                                />
                              </svg>

                              <div className="file-name">File Name</div>
                            </th>
                            <th>Resume / Other</th>
                            <th className="th-file_name">
                              <svg
                                width="20"
                                height="21"
                                viewBox="0 0 20 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_1210_423)">
                                  <path
                                    d="M16.6663 3.04358H3.33301C1.9523 3.04358 0.833008 4.16287 0.833008 5.54358V17.2102C0.833008 18.591 1.9523 19.7102 3.33301 19.7102H16.6663C18.0471 19.7102 19.1663 18.591 19.1663 17.2102V5.54358C19.1663 4.16287 18.0471 3.04358 16.6663 3.04358Z"
                                    fill="#CCCCCC"
                                  />
                                  <path
                                    d="M16.6663 3.04358H3.33301C1.9523 3.04358 0.833008 4.16287 0.833008 5.54358V13.0436C0.833008 14.4243 1.9523 15.5436 3.33301 15.5436H16.6663C18.0471 15.5436 19.1663 14.4243 19.1663 13.0436V5.54358C19.1663 4.16287 18.0471 3.04358 16.6663 3.04358Z"
                                    fill="#EAEAEA"
                                  />
                                  <path
                                    d="M19.1663 5.54358V7.21025H0.833008V5.54358C0.833008 4.88054 1.0964 4.24465 1.56524 3.77581C2.03408 3.30697 2.66997 3.04358 3.33301 3.04358H16.6663C17.3294 3.04358 17.9653 3.30697 18.4341 3.77581C18.903 4.24465 19.1663 4.88054 19.1663 5.54358Z"
                                    fill="#4352D6"
                                  />
                                  <path
                                    d="M16.6667 2.21025H15.8333V1.37691C15.8333 1.1559 15.7455 0.943937 15.5893 0.787657C15.433 0.631376 15.221 0.543579 15 0.543579C14.779 0.543579 14.567 0.631376 14.4107 0.787657C14.2545 0.943937 14.1667 1.1559 14.1667 1.37691V2.21025H5.83333V1.37691C5.83333 1.1559 5.74554 0.943937 5.58926 0.787657C5.43297 0.631376 5.22101 0.543579 5 0.543579C4.77899 0.543579 4.56702 0.631376 4.41074 0.787657C4.25446 0.943937 4.16667 1.1559 4.16667 1.37691V2.21025H3.33333C2.44928 2.21025 1.60143 2.56144 0.976311 3.18656C0.35119 3.81168 0 4.65952 0 5.54358L0 17.2102C0 18.0943 0.35119 18.9421 0.976311 19.5673C1.60143 20.1924 2.44928 20.5436 3.33333 20.5436H16.6667C17.5507 20.5436 18.3986 20.1924 19.0237 19.5673C19.6488 18.9421 20 18.0943 20 17.2102V5.54358C20 4.65952 19.6488 3.81168 19.0237 3.18656C18.3986 2.56144 17.5507 2.21025 16.6667 2.21025ZM18.3333 17.2102C18.3333 17.6523 18.1577 18.0762 17.8452 18.3888C17.5326 18.7013 17.1087 18.8769 16.6667 18.8769H3.33333C2.89131 18.8769 2.46738 18.7013 2.15482 18.3888C1.84226 18.0762 1.66667 17.6523 1.66667 17.2102V5.54358C1.66667 5.10155 1.84226 4.67763 2.15482 4.36507C2.46738 4.05251 2.89131 3.87691 3.33333 3.87691H4.16667V4.71025C4.16667 4.93126 4.25446 5.14322 4.41074 5.2995C4.56702 5.45578 4.77899 5.54358 5 5.54358C5.22101 5.54358 5.43297 5.45578 5.58926 5.2995C5.74554 5.14322 5.83333 4.93126 5.83333 4.71025V3.87691H14.1667V4.71025C14.1667 4.93126 14.2545 5.14322 14.4107 5.2995C14.567 5.45578 14.779 5.54358 15 5.54358C15.221 5.54358 15.433 5.45578 15.5893 5.2995C15.7455 5.14322 15.8333 4.93126 15.8333 4.71025V3.87691H16.6667C17.1087 3.87691 17.5326 4.05251 17.8452 4.36507C18.1577 4.67763 18.3333 5.10155 18.3333 5.54358V17.2102Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M15.833 6.37695H4.16634C3.94533 6.37695 3.73337 6.46475 3.57709 6.62103C3.42081 6.77731 3.33301 6.98927 3.33301 7.21029C3.33301 7.4313 3.42081 7.64326 3.57709 7.79954C3.73337 7.95582 3.94533 8.04362 4.16634 8.04362H15.833C16.054 8.04362 16.266 7.95582 16.4223 7.79954C16.5785 7.64326 16.6663 7.4313 16.6663 7.21029C16.6663 6.98927 16.5785 6.77731 16.4223 6.62103C16.266 6.46475 16.054 6.37695 15.833 6.37695Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M5.83301 10.5436H4.16634C3.94533 10.5436 3.73337 10.6314 3.57709 10.7877C3.42081 10.9439 3.33301 11.1559 3.33301 11.3769C3.33301 11.5979 3.42081 11.8099 3.57709 11.9662C3.73337 12.1224 3.94533 12.2102 4.16634 12.2102H5.83301C6.05402 12.2102 6.26598 12.1224 6.42226 11.9662C6.57854 11.8099 6.66634 11.5979 6.66634 11.3769C6.66634 11.1559 6.57854 10.9439 6.42226 10.7877C6.26598 10.6314 6.05402 10.5436 5.83301 10.5436Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M5.83301 14.7102H4.16634C3.94533 14.7102 3.73337 14.798 3.57709 14.9543C3.42081 15.1106 3.33301 15.3225 3.33301 15.5435C3.33301 15.7646 3.42081 15.9765 3.57709 16.1328C3.73337 16.2891 3.94533 16.3769 4.16634 16.3769H5.83301C6.05402 16.3769 6.26598 16.2891 6.42226 16.1328C6.57854 15.9765 6.66634 15.7646 6.66634 15.5435C6.66634 15.3225 6.57854 15.1106 6.42226 14.9543C6.26598 14.798 6.05402 14.7102 5.83301 14.7102Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M10.833 10.5436H9.16634C8.94533 10.5436 8.73337 10.6314 8.57709 10.7877C8.42081 10.9439 8.33301 11.1559 8.33301 11.3769C8.33301 11.5979 8.42081 11.8099 8.57709 11.9662C8.73337 12.1224 8.94533 12.2102 9.16634 12.2102H10.833C11.054 12.2102 11.266 12.1224 11.4223 11.9662C11.5785 11.8099 11.6663 11.5979 11.6663 11.3769C11.6663 11.1559 11.5785 10.9439 11.4223 10.7877C11.266 10.6314 11.054 10.5436 10.833 10.5436Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M10.833 14.7102H9.16634C8.94533 14.7102 8.73337 14.798 8.57709 14.9543C8.42081 15.1106 8.33301 15.3225 8.33301 15.5435C8.33301 15.7646 8.42081 15.9765 8.57709 16.1328C8.73337 16.2891 8.94533 16.3769 9.16634 16.3769H10.833C11.054 16.3769 11.266 16.2891 11.4223 16.1328C11.5785 15.9765 11.6663 15.7646 11.6663 15.5435C11.6663 15.3225 11.5785 15.1106 11.4223 14.9543C11.266 14.798 11.054 14.7102 10.833 14.7102Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M15.833 10.5436H14.1663C13.9453 10.5436 13.7334 10.6314 13.5771 10.7877C13.4208 10.9439 13.333 11.1559 13.333 11.3769C13.333 11.5979 13.4208 11.8099 13.5771 11.9662C13.7334 12.1224 13.9453 12.2102 14.1663 12.2102H15.833C16.054 12.2102 16.266 12.1224 16.4223 11.9662C16.5785 11.8099 16.6663 11.5979 16.6663 11.3769C16.6663 11.1559 16.5785 10.9439 16.4223 10.7877C16.266 10.6314 16.054 10.5436 15.833 10.5436Z"
                                    fill="#423381"
                                  />
                                  <path
                                    d="M15.833 14.7102H14.1663C13.9453 14.7102 13.7334 14.798 13.5771 14.9543C13.4208 15.1106 13.333 15.3225 13.333 15.5435C13.333 15.7646 13.4208 15.9765 13.5771 16.1328C13.7334 16.2891 13.9453 16.3769 14.1663 16.3769H15.833C16.054 16.3769 16.266 16.2891 16.4223 16.1328C16.5785 15.9765 16.6663 15.7646 16.6663 15.5435C16.6663 15.3225 16.5785 15.1106 16.4223 14.9543C16.266 14.798 16.054 14.7102 15.833 14.7102Z"
                                    fill="#423381"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_1210_423">
                                    <rect width="20" height="20" fill="white" transform="translate(0 0.543579)" />
                                  </clipPath>
                                </defs>
                              </svg>

                              <div className="file-name">Date</div>
                            </th>
                            <th>
                              <svg
                                width="20"
                                height="21"
                                viewBox="0 0 20 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M10.0003 3.08411C5.7225 3.08411 2.24219 6.56473 2.24219 10.8425C2.24219 15.1204 5.7225 18.601 10.0003 18.601C14.2781 18.601 17.7584 15.1204 17.7584 10.8425C17.7584 6.56473 14.2781 3.08411 10.0003 3.08411ZM10.0003 14.3C6.37531 14.3 4.42063 10.9169 4.42063 10.9169C4.42063 10.9169 6.37531 7.53317 10.0003 7.53317C13.6256 7.53317 15.5803 10.9169 15.5803 10.9169C15.5803 10.9169 13.6256 14.3 10.0003 14.3Z"
                                  fill="#686868"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M10.0002 8.03162C8.4093 8.03162 7.11523 9.32599 7.11523 10.9166C7.11523 12.5072 8.40961 13.8013 10.0002 13.8013C11.5909 13.8013 12.8852 12.5069 12.8852 10.9166C12.8852 9.32599 11.5912 8.03162 10.0002 8.03162ZM10.0002 12.8641C8.92617 12.8641 8.05273 11.9904 8.05273 10.9169C8.05273 9.84287 8.92648 8.96943 10.0002 8.96943C11.074 8.96943 11.9477 9.84318 11.9477 10.9169C11.9477 11.9904 11.0743 12.8641 10.0002 12.8641Z"
                                  fill="#686868"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M10.7179 11.0345C10.3338 11.0345 10.0226 10.7232 10.0226 10.3385C10.0226 9.99384 10.2754 9.70884 10.606 9.65478C10.422 9.56603 10.2182 9.51196 10.0001 9.51196C9.22508 9.51196 8.5957 10.1423 8.5957 10.9167C8.5957 11.6926 9.22508 12.321 10.0001 12.321C10.7754 12.321 11.4045 11.6926 11.4045 10.9167C11.4045 10.8048 11.3879 10.6973 11.3632 10.5929C11.2616 10.8513 11.0116 11.0345 10.7179 11.0345Z"
                                  fill="#686868"
                                />
                              </svg>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentDataForFiles.map((file, index) => (
                            <tr key={index}>
                              <td>
                                {/* <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M2 5.54358C0.8954 5.54358 0 6.44358 0 7.54358V21.5436C0 22.6436 0.89543 23.5436 2 23.5436H22C23.105 23.5436 24 22.6436 24 21.5436V7.54358C24 6.44358 23.105 5.54358 22 5.54358H2Z" fill="#E67E22" />
                                                                        <path d="M2 4.54358C0.8954 4.54358 0 5.44358 0 6.54358V20.5436C0 21.6436 0.89543 22.5436 2 22.5436H22C23.105 22.5436 24 21.6436 24 20.5436V6.54358C24 5.44358 23.105 4.54358 22 4.54358H2Z" fill="#F39C12" />
                                                                        <path d="M2 3.54358C0.8954 3.54358 0 4.44358 0 5.54358V19.5436C0 20.6436 0.89543 21.5436 2 21.5436H22C23.105 21.5436 24 20.6436 24 19.5436V5.54358C24 4.44358 23.105 3.54358 22 3.54358H2Z" fill="#E67E22" />
                                                                        <path d="M2 2.54358C0.8954 2.54358 0 3.44358 0 4.54358V18.5436C0 19.6436 0.89543 20.5436 2 20.5436H22C23.105 20.5436 24 19.6436 24 18.5436V4.54358C24 3.44358 23.105 2.54358 22 2.54358H2Z" fill="#F1C40F" />
                                                                        <path d="M16 2.54358V3.54358V16.5436C16 17.6436 16.895 18.5436 18 18.5436C19.105 18.5436 20 17.6436 20 16.5436V3.54358V2.54358H16Z" fill="#34495E" />
                                                                        <path d="M18 2.54358V3.54358H19V2.54358H18ZM18 3.54358H17V4.54358H18V3.54358ZM18 4.54358V5.54358H19V4.54358H18ZM18 5.54358H17V6.54358H18V5.54358ZM18 6.54358V7.54358H19V6.54358H18ZM18 7.54358H17V8.54358H18V7.54358ZM18 8.54358V9.54358H19V8.54358H18ZM18 9.54358H17V10.5436H18V9.54358ZM18 10.5436V11.5436H19V10.5436H18ZM18 11.5436H17V12.5436H18V11.5436ZM18 12.5436V13.5436H19V12.5436H18ZM18 13.5436H17V14.5436H18V13.5436ZM18 14.5436V15.5436H19V14.5436H18ZM18 15.5436H17V16.5436H18V15.5436ZM18 16.5436V17.5436H19V16.5436H18Z" fill="#7F8C8D" />
                                                                        <path d="M17 2.54358V3.54358H18V2.54358H17ZM17 4.54358V5.54358H18V4.54358H17ZM17 6.54358V7.54358H18V6.54358H17ZM17 8.54358V9.54358H18V8.54358H17ZM17 10.5436V11.5436H18V10.5436H17ZM17 12.5436V13.5436H18V12.5436H17ZM17 14.5436V15.5436H18V14.5436H17ZM17 16.5436V17.5436H18V16.5436H17Z" fill="#BDC3C7" />
                                                                    </svg> */}
                                {file.file_name}

                                {/* {item.submission_date
                                                                        ? new Date(item.submission_date).toLocaleDateString("en-US")
                                                                        : "N/A"} */}
                              </td>
                              <td>{file.is_resume === "yes" ? "Resume" : "Other"}</td>

                              <td>
                                {/* {item.client_name || "N/A"} */}
                                {/* <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <g clip-path="url(#clip0_1210_423)">
                                                                            <path d="M16.6663 3.04358H3.33301C1.9523 3.04358 0.833008 4.16287 0.833008 5.54358V17.2102C0.833008 18.591 1.9523 19.7102 3.33301 19.7102H16.6663C18.0471 19.7102 19.1663 18.591 19.1663 17.2102V5.54358C19.1663 4.16287 18.0471 3.04358 16.6663 3.04358Z" fill="#CCCCCC" />
                                                                            <path d="M16.6663 3.04358H3.33301C1.9523 3.04358 0.833008 4.16287 0.833008 5.54358V13.0436C0.833008 14.4243 1.9523 15.5436 3.33301 15.5436H16.6663C18.0471 15.5436 19.1663 14.4243 19.1663 13.0436V5.54358C19.1663 4.16287 18.0471 3.04358 16.6663 3.04358Z" fill="#EAEAEA" />
                                                                            <path d="M19.1663 5.54358V7.21025H0.833008V5.54358C0.833008 4.88054 1.0964 4.24465 1.56524 3.77581C2.03408 3.30697 2.66997 3.04358 3.33301 3.04358H16.6663C17.3294 3.04358 17.9653 3.30697 18.4341 3.77581C18.903 4.24465 19.1663 4.88054 19.1663 5.54358Z" fill="#4352D6" />
                                                                            <path d="M16.6667 2.21025H15.8333V1.37691C15.8333 1.1559 15.7455 0.943937 15.5893 0.787657C15.433 0.631376 15.221 0.543579 15 0.543579C14.779 0.543579 14.567 0.631376 14.4107 0.787657C14.2545 0.943937 14.1667 1.1559 14.1667 1.37691V2.21025H5.83333V1.37691C5.83333 1.1559 5.74554 0.943937 5.58926 0.787657C5.43297 0.631376 5.22101 0.543579 5 0.543579C4.77899 0.543579 4.56702 0.631376 4.41074 0.787657C4.25446 0.943937 4.16667 1.1559 4.16667 1.37691V2.21025H3.33333C2.44928 2.21025 1.60143 2.56144 0.976311 3.18656C0.35119 3.81168 0 4.65952 0 5.54358L0 17.2102C0 18.0943 0.35119 18.9421 0.976311 19.5673C1.60143 20.1924 2.44928 20.5436 3.33333 20.5436H16.6667C17.5507 20.5436 18.3986 20.1924 19.0237 19.5673C19.6488 18.9421 20 18.0943 20 17.2102V5.54358C20 4.65952 19.6488 3.81168 19.0237 3.18656C18.3986 2.56144 17.5507 2.21025 16.6667 2.21025ZM18.3333 17.2102C18.3333 17.6523 18.1577 18.0762 17.8452 18.3888C17.5326 18.7013 17.1087 18.8769 16.6667 18.8769H3.33333C2.89131 18.8769 2.46738 18.7013 2.15482 18.3888C1.84226 18.0762 1.66667 17.6523 1.66667 17.2102V5.54358C1.66667 5.10155 1.84226 4.67763 2.15482 4.36507C2.46738 4.05251 2.89131 3.87691 3.33333 3.87691H4.16667V4.71025C4.16667 4.93126 4.25446 5.14322 4.41074 5.2995C4.56702 5.45578 4.77899 5.54358 5 5.54358C5.22101 5.54358 5.43297 5.45578 5.58926 5.2995C5.74554 5.14322 5.83333 4.93126 5.83333 4.71025V3.87691H14.1667V4.71025C14.1667 4.93126 14.2545 5.14322 14.4107 5.2995C14.567 5.45578 14.779 5.54358 15 5.54358C15.221 5.54358 15.433 5.45578 15.5893 5.2995C15.7455 5.14322 15.8333 4.93126 15.8333 4.71025V3.87691H16.6667C17.1087 3.87691 17.5326 4.05251 17.8452 4.36507C18.1577 4.67763 18.3333 5.10155 18.3333 5.54358V17.2102Z" fill="#423381" />
                                                                            <path d="M15.833 6.37695H4.16634C3.94533 6.37695 3.73337 6.46475 3.57709 6.62103C3.42081 6.77731 3.33301 6.98927 3.33301 7.21029C3.33301 7.4313 3.42081 7.64326 3.57709 7.79954C3.73337 7.95582 3.94533 8.04362 4.16634 8.04362H15.833C16.054 8.04362 16.266 7.95582 16.4223 7.79954C16.5785 7.64326 16.6663 7.4313 16.6663 7.21029C16.6663 6.98927 16.5785 6.77731 16.4223 6.62103C16.266 6.46475 16.054 6.37695 15.833 6.37695Z" fill="#423381" />
                                                                            <path d="M5.83301 10.5436H4.16634C3.94533 10.5436 3.73337 10.6314 3.57709 10.7877C3.42081 10.9439 3.33301 11.1559 3.33301 11.3769C3.33301 11.5979 3.42081 11.8099 3.57709 11.9662C3.73337 12.1224 3.94533 12.2102 4.16634 12.2102H5.83301C6.05402 12.2102 6.26598 12.1224 6.42226 11.9662C6.57854 11.8099 6.66634 11.5979 6.66634 11.3769C6.66634 11.1559 6.57854 10.9439 6.42226 10.7877C6.26598 10.6314 6.05402 10.5436 5.83301 10.5436Z" fill="#423381" />
                                                                            <path d="M5.83301 14.7102H4.16634C3.94533 14.7102 3.73337 14.798 3.57709 14.9543C3.42081 15.1106 3.33301 15.3225 3.33301 15.5435C3.33301 15.7646 3.42081 15.9765 3.57709 16.1328C3.73337 16.2891 3.94533 16.3769 4.16634 16.3769H5.83301C6.05402 16.3769 6.26598 16.2891 6.42226 16.1328C6.57854 15.9765 6.66634 15.7646 6.66634 15.5435C6.66634 15.3225 6.57854 15.1106 6.42226 14.9543C6.26598 14.798 6.05402 14.7102 5.83301 14.7102Z" fill="#423381" />
                                                                            <path d="M10.833 10.5436H9.16634C8.94533 10.5436 8.73337 10.6314 8.57709 10.7877C8.42081 10.9439 8.33301 11.1559 8.33301 11.3769C8.33301 11.5979 8.42081 11.8099 8.57709 11.9662C8.73337 12.1224 8.94533 12.2102 9.16634 12.2102H10.833C11.054 12.2102 11.266 12.1224 11.4223 11.9662C11.5785 11.8099 11.6663 11.5979 11.6663 11.3769C11.6663 11.1559 11.5785 10.9439 11.4223 10.7877C11.266 10.6314 11.054 10.5436 10.833 10.5436Z" fill="#423381" />
                                                                            <path d="M10.833 14.7102H9.16634C8.94533 14.7102 8.73337 14.798 8.57709 14.9543C8.42081 15.1106 8.33301 15.3225 8.33301 15.5435C8.33301 15.7646 8.42081 15.9765 8.57709 16.1328C8.73337 16.2891 8.94533 16.3769 9.16634 16.3769H10.833C11.054 16.3769 11.266 16.2891 11.4223 16.1328C11.5785 15.9765 11.6663 15.7646 11.6663 15.5435C11.6663 15.3225 11.5785 15.1106 11.4223 14.9543C11.266 14.798 11.054 14.7102 10.833 14.7102Z" fill="#423381" />
                                                                            <path d="M15.833 10.5436H14.1663C13.9453 10.5436 13.7334 10.6314 13.5771 10.7877C13.4208 10.9439 13.333 11.1559 13.333 11.3769C13.333 11.5979 13.4208 11.8099 13.5771 11.9662C13.7334 12.1224 13.9453 12.2102 14.1663 12.2102H15.833C16.054 12.2102 16.266 12.1224 16.4223 11.9662C16.5785 11.8099 16.6663 11.5979 16.6663 11.3769C16.6663 11.1559 16.5785 10.9439 16.4223 10.7877C16.266 10.6314 16.054 10.5436 15.833 10.5436Z" fill="#423381" />
                                                                            <path d="M15.833 14.7102H14.1663C13.9453 14.7102 13.7334 14.798 13.5771 14.9543C13.4208 15.1106 13.333 15.3225 13.333 15.5435C13.333 15.7646 13.4208 15.9765 13.5771 16.1328C13.7334 16.2891 13.9453 16.3769 14.1663 16.3769H15.833C16.054 16.3769 16.266 16.2891 16.4223 16.1328C16.5785 15.9765 16.6663 15.7646 16.6663 15.5435C16.6663 15.3225 16.5785 15.1106 16.4223 14.9543C16.266 14.798 16.054 14.7102 15.833 14.7102Z" fill="#423381" />
                                                                        </g>
                                                                        <defs>
                                                                            <clipPath id="clip0_1210_423">
                                                                                <rect width="20" height="20" fill="white" transform="translate(0 0.543579)" />
                                                                            </clipPath>
                                                                        </defs>
                                                                    </svg> */}
                                {/* {file.fileuploaded_datetime
                                                                        ? new Date(file.fileuploaded_datetime).toLocaleDateString("en-US")
                                                                        : "N/A"} */}
                                {/* {file.upload_datetime} */}

                                {file.fileuploaded_datetime
                                  ? new Date(file.fileuploaded_datetime)
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
                                <div className="menu-container">
                                  <ThreeRow
                                    handleDeleteFile={() => handleDeleteFile(file, candidateDetails?.primary_email)}
                                    handleBase64File={() => handleBase64File(file, candidateDetails?.primary_email)}
                                    fileType={file.file_extension}
                                    handleDownloadFile={() => handleDownloadFile(file, candidateDetails?.primary_email)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <FilePreview
                        base64File={base64File}
                        setBase64File={setBase64File}
                        fileType={fileType}
                        setFileType={setFileType}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeNav === "tab3" && (
              <div className="candidate-info-data">
                <div className="candidateEditForm second-navbar">
                  <div className="header-main">
                    <img src={FileDoc} alt="" srcset="" />
                    <p className="title">Files & Documents : </p>
                    <img src={Date_marketing} alt="" srcset="" />
                    <p className="title">Onboarded Company : {candidateDetails?.onboarded_company}</p>
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
                            value={candidateDetails?.marketing_start_date}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={candidateDetails?.first_name}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={candidateDetails?.last_name}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Primary Email</label>
                          <input
                            type="text"
                            name="primary_email"
                            value={candidateDetails?.primary_email}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Secondary Email</label>
                          <input
                            type="text"
                            name="secondary_email"
                            value={candidateDetails?.secondary_email}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Primary Contact</label>
                          <input
                            type="text"
                            name="primary_contact"
                            value={candidateDetails?.primary_contact}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>
                        <div className="inputComponent">
                          <label htmlFor="">Secondary Contact</label>
                          <input
                            type="text"
                            name="secondary_contact"
                            value={candidateDetails?.secondary_contact}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Assigned Recruiter:</label>
                          <input
                            name="assigned_recruiter"
                            value={candidateDetails?.assigned_recruiter}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Availability:</label>
                          <input
                            name="availability"
                            value={candidateDetails?.availability}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">C-Visa Status</label>
                          <input
                            name="cvisa_status"
                            value={candidateDetails?.cvisa_status}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Assigned Team:</label>
                          <input
                            name="assigned_team"
                            value={candidateDetails?.assigned_team}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Primary Technology:</label>
                          <input
                            type="text"
                            name="primary_technology"
                            value={candidateDetails?.primary_technology}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Secondary Technology:</label>
                          <input
                            type="text"
                            name="secondary_technology"
                            value={candidateDetails?.secondary_technology}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>

                        <div className="inputComponent">
                          <label htmlFor="">Location Preference</label>
                          <input
                            name="location_preference"
                            value={candidateDetails?.location_preference}
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
                    <p className="title">Onboarded Company : {candidateDetails?.onboarded_company}</p>
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
                          {currentData.length > 0 ? (
                            currentData.map((item, index) => (
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

                      <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                        {/* Previous Button */}
                        <button
                          className="left nav"
                          onClick={() => goToNextPage(currentPage - 1)}
                          disabled={currentPage === 1}
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
                          Page {currentPage} of {totalPages}
                        </span>

                        {/* Next Button */}
                        <button
                          className="nav"
                          onClick={() => goToNextPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CandidateDetails;
