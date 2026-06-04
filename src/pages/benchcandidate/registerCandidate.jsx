import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import Dashnav from "../../components/dashnav";
import "./editCandidate.css";
import ProfileDef from "../dashboard/profileIcon.svg";
import BenchIcon from "./benchIcon.svg";
import Location from "../../images/location.svg";
import General from "../../images/general.svg";
import Info from "../../images/info.svg";
import Sidenav from "../../images/side_top.svg";
import Others from "../../images/others.svg";
import saveTick from "../../images/saveTick.svg";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../authContext";

const RegisterCandidate = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [visaStatus, setVisaStatus] = useState("");
  const [cvisaStatus, setCvisaStatus] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [currentlyInProject, setCurrentlyInProject] = useState("");
  const [availability, setAvailability] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [onedriveLink, setOnedriveLink] = useState("");
  const [comments, setComments] = useState("");
  const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list
  const [address, setAddress] = useState("");
  const [onboarded_company, setOnBoardedTeam] = useState("");
  const [send_work_status_email, setSend_work_status_email] = useState("");

  // State for form fields
  const [letterProvided, setLetterProvided] = useState("");
  const [cletterProvided, setCletterProvided] = useState("");
  const [locationState, setLocationState] = useState("");

  const [primaryTechnology, setPrimaryTechnology] = useState("");
  const [secondaryTechnology, setSecondaryTechnology] = useState("");

  // State for validation errors
  const [errors, setErrors] = useState({});

  // New state for country codes
  const [primaryCountryCode, setPrimaryCountryCode] = useState("");
  const [secondaryCountryCode, setSecondaryCountryCode] = useState("");
  const [popupActive, setPopupActive] = useState("");

  // state for newly added fields
  const [universityDetails, setUniversityDetails] = useState("");
  const [usEntry, setUsEntry] = useState("");
  const [marketingData, setMarketingData] = useState("");
  const [gender, setGender] = useState("");
  const [formData, setFormData] = useState({
    us_entry_date: null,
  });
  const [formDataMar, setFormDataMar] = useState({
    marketing_start_date: null,
  });

  const [workAuthStartDate, setWorkAuthStartDate] = useState({
    work_auth_start_date: null,
  });

  const { user } = useAuth();

  const notify = () => toast("Wow so easy!");

  function closePopup() {
    setPopupActive("");
  }

  // Fetch recruiters list from the API
  // useEffect(() => {
  //     const fetchRecruiters = async () => {
  //         try {
  //             const query = `SELECT * FROM foursphere_recruiters.recruiterportal_users`;
  //             const response = await fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({ query })
  //             });

  //             const data = await response.json();
  //             if (response.ok) {
  //                 setRecruitersList(data);
  //             } else {
  //                 console.error('Failed to fetch recruiters:', data.message);
  //             }
  //         } catch (error) {
  //             console.error('Error fetching recruiters:', error);
  //         }
  //     };

  //     fetchRecruiters();
  // }, []);

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
              emailid: user.email,
              operation: "retrieve",
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          // Extract unique recruiters list with their ID
          const recruiters = data.data.map((item) => ({
            // Extract id
            recruiter_alias_name: item.recruiter_alias_name || "Unknown", // Extract assigned_recruiter or default to "Unknown"
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

    fetchRecruiters();
  }, []);

  // Validation function
  // const validate = () => {
  //     const errors = {};

  //     if (!firstName.trim()) errors.firstName = "First Name is required";
  //     if (!lastName.trim()) errors.lastName = "Last Name is required";

  //     if (!primaryEmail.trim() || !/\S+@\S+\.\S+/.test(primaryEmail)) {
  //         errors.primaryEmail = "Valid Primary Email ID is required";
  //     }

  //     if (!primaryCountryCode) {
  //         errors.primaryCountryCode = "Primary Country Code is required";
  //     } else if (!/^\d{10}$/.test(primaryContact)) {
  //         errors.primaryContact = "Primary Contact must be a 10-digit number";
  //     }

  //     if (!locationPreference) errors.locationPreference = "Location Preference is required";
  //     if (locationPreference === 'Other' && !locationState.trim()) errors.locationState = "State is required for 'Other' location preference";

  //     // if (!currentStatus) errors.currentStatus = "Current Status is required";
  //     // if (!visaStatus) errors.visaStatus = "Visa Status is required";
  //     // if (!recruiter) errors.recruiter = "Assigned Recruiter is required";

  //     // if (visaStatus === 'OPT' && !letterProvided) errors.letterProvided = "Letter Provided status is required for OPT Visa Status";

  //     setErrors(errors);
  //     return Object.keys(errors).length === 0;
  // };
  // Handler for submitting the form
  const handleRegisterCandidate = async () => {
    // if (!validate()) return; // Prevent submission if validation fails

    // Combine country code with contact numbers, handle empty secondary contact
    const fullPrimaryContact = `${primaryCountryCode}${primaryContact}`;
    const fullSecondaryContact = secondaryContact ? `${secondaryCountryCode}${secondaryContact}` : null;

    let visaStatusToSend = visaStatus;
    if (visaStatus === "OPT") {
      visaStatusToSend += ` Letter Provided: ${letterProvided}`;
    }
    let cvisaStatusToSend = cvisaStatus;
    if (cvisaStatus === "OPT") {
      cvisaStatusToSend += ` Opt Letter Provided: ${cletterProvided}`;
    }

    let locationStatusToSend = locationPreference;
    if (locationPreference === "Other") {
      locationStatusToSend += ` State : ${locationState}`;
    }

    console.log("running till here");

    // Ensure 'currently_in_project' is either true, false, or NULL
    const currentlyInProjectToSend = currentlyInProject ? true : false;

    // Handle date fields: if empty, pass NULL
    const usEntryToSend = usEntry ? `${usEntry}` : "NULL";
    const marketingDataToSend = marketingData ? `${marketingData}` : "NULL";

    // Insert query with NULL handling for secondary_contact and other fields
    const payload = {
      emailid: user.email,
      operation: "insert",
      columns: {
        gender: `${gender || ""}`,
        first_name: `${firstName || ""}`,
        last_name: `${lastName || ""}`,
        primary_email: `${primaryEmail || ""}`,
        secondary_email: `${secondaryEmail || ""}`,
        primary_contact: `${fullPrimaryContact || ""}`,
        secondary_contact: fullSecondaryContact ? `${fullSecondaryContact}` : "",
        location_preference: `${locationStatusToSend || ""}`,
        visa_status: `${visaStatus || ""}`,
        current_status: `${currentStatus || ""}`,
        currently_in_project: currentlyInProject ? `${currentlyInProjectToSend}` : "",
        availability: `${availability || ""}`,
        candidate_onedrive_link: `${onedriveLink || ""}`,
        comments: `${comments || ""}`,
        cvisa_status: `${cvisaStatus || ""}`,
        primary_technology: `${primaryTechnology || ""}`,
        secondary_technology: `${secondaryTechnology || ""}`,
        assigned_recruiter: `${recruiter || ""}`,
        assigned_team: `${assignedTeam || ""}`,
        university_name: `${universityDetails || ""}`,
        us_entry_date: `${formData.us_entry_date || ""}`,
        marketing_start_date: `${formDataMar.marketing_start_date || ""}`,
        candidate_address1: `${address || ""}`,
        onboarded_company: `${onboarded_company || ""}`,
        send_work_status_email: `${send_work_status_email || ""}`,
        work_auth_start_date: `${workAuthStartDate.work_auth_start_date || ""}`,
      },
    };

    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Candidate Registered Successfully", {
          draggable: "true",
          autoClose: 2000,
          // position: "center",
          className: "toast-center",
        });
        // Optionally, redirect to another page or reset form
        // navigate('/benchcandidates'); // Replace with your desired route
      } else {
        const errorData = await response.json();
        toast.error(`Registration failed: ${errorData.message || "An unknown error occurred."},`, {
          draggable: "true",
          autoClose: 2000,
          // position: "center",
          className: "toast-center",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  // Validate and format the US date input
  const handleDateChange = (date) => {
    const formattedDate = date ? format(date, "MM/dd/yyyy") : null;
    console.log("formattedDate", formattedDate);

    setFormData({ ...formData, us_entry_date: formattedDate });
    console.log("formData", formData);
  };

  function backEditCandidate() {
    navigate("/benchcandidates");
  }

  const CustomInputMarketing = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  const handleDateChangemarketing = (date) => {
    const formattedDateMarketing = date ? format(date, "MM/dd/yyyy") : null;

    setFormDataMar({ ...formDataMar, marketing_start_date: formattedDateMarketing });
    console.log("formData Marketing", formattedDateMarketing);
  };

  const CustomAuthSatrtDate = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  const handleAuthStartDate = (date) => {
    const WorkDate = date ? format(date, "MM/dd/yyyy") : null;

    setWorkAuthStartDate({ ...workAuthStartDate, work_auth_start_date: WorkDate });
    // console.log("formData Marketing",formattedDateMarketing);
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <div className="candidateEditForm">
          <div className="header">
            <img src={Sidenav} alt="" srcset="" onClick={backEditCandidate} />
            <img src={Info} alt="" srcset="" />
            <h2 className="title">Register New Candidates</h2>
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
                  <label htmlFor="">
                    Gender<span>*</span>
                  </label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <div className="error">{errors.gender}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    First Name<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && <div className="error">{errors.firstName}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Last Name<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.lastName && <div className="error">{errors.lastName}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Primary Email<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Primary Email"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                  />
                  {errors.primaryEmail && <div className="error">{errors.primaryEmail}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Secondary Email</label>
                  <input
                    type="text"
                    placeholder="Secondary Email"
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                  />
                  {errors.secondaryEmail && <div className="error">{errors.secondaryEmail}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Country Code<span>*</span>
                  </label>
                  <select value={secondaryCountryCode} onChange={(e) => setSecondaryCountryCode(e.target.value)}>
                    <option value="">Select Country Code</option>
                    <option value="+91">IND +91</option>
                    <option value="+01">USA +01</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Primary Contact<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Primary Contact"
                    value={primaryContact}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                  />
                  {errors.primaryContact && <div className="error">{errors.primaryContact}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Country Code</label>
                  <select value={secondaryCountryCode} onChange={(e) => setSecondaryCountryCode(e.target.value)}>
                    <option value="">Select Country Code</option>
                    <option value="+91">IND +91</option>
                    <option value="+01">USA +01</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Secondary Contact</label>
                  <input
                    type="text"
                    placeholder="Secondary Contact"
                    value={secondaryContact}
                    onChange={(e) => setSecondaryContact(e.target.value)}
                  />
                  {errors.secondaryContact && <div className="error">{errors.secondaryContact}</div>}
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
                <div className="inputComponent col-span-2">
                  <label htmlFor="">Address</label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {errors.address && <div className="error">{errors.address}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Location Preference<span>*</span>
                  </label>
                  <select value={locationPreference} onChange={(e) => setLocationPreference(e.target.value)}>
                    <option value="">Select Location Preference</option>
                    <option value="Anywhere">Anywhere</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.locationPreference && <div className="error">{errors.locationPreference}</div>}
                </div>
                {locationPreference === "Other" && (
                  <div className="input col-flex">
                    <span className="head">State</span>
                    <input
                      type="text"
                      className="login-input"
                      placeholder="Enter State"
                      value={locationState}
                      onChange={(e) => setLocationState(e.target.value)}
                    />
                    {errors.locationState && <div className="error">{errors.locationState}</div>}
                  </div>
                )}
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
                  <select value={visaStatus} onChange={(e) => setVisaStatus(e.target.value)}>
                    <option value="">Select Visa Status</option>
                    <option value="CPT">CPT</option>
                    <option value="OPT">OPT</option>
                    <option value="H1B">H1B</option>
                    <option value="H4 EAD">H4 EAD</option>
                    <option value="GC">GC</option>
                    <option value="GC EAD">GC EAD</option>
                    <option value="USC">USC</option>
                    <option value="STEM OPT">STEM OPT</option>
                    <option value="H1B TRANSFER">H1B TRANSFER</option>
                  </select>
                  {errors.visaStatus && <div className="error">{errors.visaStatus}</div>}
                </div>
                {(visaStatus === "OPT" || visaStatus === "STEM OPT") && (
                  <div className="inputRow row-flex">
                    <div className="input col-flex">
                      <span>Any letter provided</span>
                      <select value={letterProvided} onChange={(e) => setLetterProvided(e.target.value)}>
                        <option value="">Select Option</option>
                        <option value="ISSUED">Issued</option>
                        <option value="NOT ISSUED">Not Issued</option>
                        <option value="Issued with 1983">Issued with 1983</option>
                      </select>
                      {errors.letterProvided && <div className="error">{errors.letterProvided}</div>}
                    </div>
                  </div>
                )}

                <div className="inputComponent">
                  <label htmlFor="">
                    C Visa Status<span>*</span>
                  </label>
                  <select value={cvisaStatus} onChange={(e) => setCvisaStatus(e.target.value)}>
                    <option value="">Select Visa Status</option>
                    <option value="CPT">CPT</option>
                    <option value="OPT">OPT</option>
                    <option value="H1B">H1B</option>
                    <option value="H4 EAD">H4 EAD</option>
                    <option value="GC">GC</option>
                    <option value="GC EAD">GC EAD</option>
                    <option value="USC">USC</option>
                    <option value="STEM OPT">STEM OPT</option>
                    <option value="H1B TRANSFER">H1B TRANSFER</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Current Status<span>*</span>
                  </label>
                  <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
                    <option value="">Select Current Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.currentStatus && <div className="error">{errors.currentStatus}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Currently in Project</label>
                  <select value={currentlyInProject} onChange={(e) => setCurrentlyInProject(e.target.value)}>
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Assigned Recruiter<span>*</span>
                  </label>
                  <select value={recruiter} onChange={(e) => setRecruiter(e.target.value)}>
                    <option value="">Select Recruiter</option>
                    {recruitersList.map((rec) => (
                      <option key={rec.id} value={rec.recruiter_alias_name}>
                        {rec.recruiter_alias_name}
                      </option>
                    ))}
                  </select>
                  {errors.recruiter && <div className="error">{errors.recruiter}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Availability<span>*</span>
                  </label>
                  <select
                    type="text"
                    placeholder="Availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="">Select Your Availability</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Available in 2 weeks">Available in 2 weeks</option>
                    <option value="Available in 1 month">Available in 1 month</option>
                    <option value="Available in 45 days">Available in 45 days</option>
                    <option value="Available in 2 months">Available in 2 months</option>
                  </select>
                  {errors.availability && <div className="error">{errors.availability}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Primary Technology<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Here Primary Technology"
                    value={primaryTechnology}
                    onChange={(e) => setPrimaryTechnology(e.target.value)}
                  />
                  {errors.availability && <div className="error">{errors.availability}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Secondary Technology</label>
                  <input
                    type="text"
                    placeholder="Enter Here Secondary Technology"
                    value={secondaryTechnology}
                    onChange={(e) => setSecondaryTechnology(e.target.value)}
                  />
                  {errors.availability && <div className="error">{errors.availability}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Assigned Team</label>
                  <select
                    type="text"
                    placeholder="Assigned Team"
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                  >
                    <option value="">Choose Your Team</option>
                    <option value="Pending onboarding">Pending onboarding</option>
                    <option value="Teams A">Team A</option>
                    <option value="Teams B">Team B</option>
                    <option value="Teams C">Team C</option>
                  </select>
                </div>

                <div className="inputComponent col-span-3">
                  <label htmlFor="">One Drive</label>
                  <input
                    type="text"
                    placeholder="Onedrive Link"
                    value={onedriveLink}
                    onChange={(e) => setOnedriveLink(e.target.value)}
                  />
                  {errors.onedriveLink && <div className="error">{errors.onedriveLink}</div>}
                </div>

                <div className="inputComponent col-span-2">
                  <label htmlFor="">Comments</label>
                  <input
                    type="text"
                    placeholder="Comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">University</label>
                  <input
                    type="text"
                    placeholder="Enter University Name"
                    value={universityDetails}
                    onChange={(e) => setUniversityDetails(e.target.value)}
                  />
                  {errors.universityDetails && <div className="error">{errors.universityDetails}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="us_entry_date">US Entry Date:</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formData.us_entry_date ? new Date(formData.us_entry_date) : null}
                    onChange={handleDateChange}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="us_entry_date"
                    customInput={<CustomInput />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="marketing_start_date">Marketing Start Date</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formDataMar.marketing_start_date ? new Date(formDataMar.marketing_start_date) : null}
                    onChange={handleDateChangemarketing}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="marketing_start_date"
                    customInput={<CustomInputMarketing />}
                  />
                </div>

                {/* <div className='inputComponent'>
                                    <label htmlFor="">Marketing Start Date</label>
                                    <input
                                        type="date"
                                        placeholder="Select Marketing Start Date"
                                        value={marketingData}
                                        onChange={(e) => setMarketingData(e.target.value)}
                                    />
                                    {errors.marketingStartDate && <div className="error">{errors.marketingStartDate}</div>}
                                </div> */}

                <div className="inputComponent">
                  <label htmlFor="">Onboarded Company</label>
                  <select value={onboarded_company} onChange={(e) => setOnBoardedTeam(e.target.value)}>
                    <option value="">Select Option</option>
                    <option value="4Sphere">4Sphere</option>
                    <option value="tb soft">TB Soft</option>
                    <option value="ub soft">UB Soft</option>
                  </select>
                  {errors.onboarded_company && <div className="error">{errors.onboarded_company}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Send Work Status Email</label>
                  <select value={send_work_status_email} onChange={(e) => setSend_work_status_email(e.target.value)}>
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.send_work_status_email && <div className="error">{errors.send_work_status_email}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="work_auth_start_date">Work Authorization Start Date</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={
                      workAuthStartDate.work_auth_start_date ? new Date(workAuthStartDate.work_auth_start_date) : null
                    }
                    onChange={handleAuthStartDate}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="work_auth_start_date"
                    customInput={<CustomAuthSatrtDate />}
                  />
                </div>
              </div>
            </section>
          </div>
          <button className="saveBtn" onClick={handleRegisterCandidate}>
            <img src={saveTick} alt="saveTickIcon" />
            Register Candidate
          </button>
        </div>
      </div>
      {popupActive !== "" && (
        <>
          <div className="f-screen-popup">
            <div className="popup-cont">
              <div className="close" onClick={closePopup}>
                +
              </div>
              <h3 dangerouslySetInnerHTML={{ __html: popupActive }}></h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterCandidate;
