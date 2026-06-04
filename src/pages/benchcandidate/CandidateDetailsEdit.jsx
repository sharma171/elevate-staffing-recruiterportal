import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import Dashnav from "../../components/dashnav";
import { Link, useNavigate } from "react-router-dom";
import "./editCandidate.css";
import Sidenav from "../../images/side_top.svg";
import Others from "../../images/others.svg";
import Info from "../../images/info.svg";
import Location from "../../images/location.svg";
import General from "../../images/general.svg";
import saveTick from "../../images/saveTick.svg";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../authContext";

const CandidateDetailsEdit = () => {
  const [candidateDetails, setCandidateDetails] = useState([]);
  const [formData, setFormData] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState();
  const [locationState, setLocationState] = useState("");
  const [recruitersBList, setBRecruitersList] = useState([]); // State for recruiters list
  const { user } = useAuth();

  const notify = () => toast("Wow so easy!");

  useEffect(() => {
    // Fetch candidates data on component mount
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (user?.email) {
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
          console.log("recriuter arrAy====", data);
          // Extract unique recruiters list with their ID
          const recruiters = data.data.map((item) => ({
            // Extract id
            recruiter_alias_name: item.recruiter_alias_name || "Unknown", // Extract assigned_recruiter or default to "Unknown"
          }));

          console.log("recruiters=====", recruiters);

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
    if (user?.email) {
      fetchRecruiters();
    }
  }, [user?.email]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDateChange = (date) => {
    const formattedDate = date ? format(date, "MM/dd/yyyy") : "";
    setFormData({ ...formData, us_entry_date: formattedDate });
  };

  const handleDateChangeMarketing = (date) => {
    const formattedDate = date ? format(date, "MM/dd/yyyy") : "";
    setFormData({ ...formData, marketing_start_date: formattedDate });
  };

  const handleDate = (date) => {
    const formattedDate = date ? format(date, "MM/dd/yyyy") : "";
    setFormData({ ...formData, work_auth_start_date: formattedDate });
  };

  const handleSubmit = async () => {
    let locationStatusToSend = formData.location_preference;
    if (formData.location_preference === "Other") {
      locationStatusToSend += ` State : ${locationState}`;
    }
    try {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      // Log formData for debugging
      console.log(formData, "formData==========");

      // Prepare request payload
      const payload = {
        emailid: user.email,
        modify: {
          id: urlParams.get("id"),
          columns: {
            gender: `${formData.gender || ""}`,
            first_name: `${formData.first_name || ""}`,
            last_name: `${formData.last_name || ""}`,
            primary_email: `${formData.primary_email || ""}`,
            secondary_email: `${formData.secondary_email || ""}`,
            primary_contact: `${formData.primary_contact || ""}`,
            secondary_contact: `${formData.secondary_contact || ""}`,
            location_preference: `${locationStatusToSend || ""}`,
            visa_status: `${formData.visa_status || ""}`,
            everify_status: `${formData.everify_status || ""}`,
            i9_form_status: `${formData.i9_form_status || ""}`,
            current_status: `${formData.current_status || ""}`,
            assigned_recruiter: `${formData.assigned_recruiter || ""}`,
            assigned_recruiter_secondary: `${formData.assigned_recruiter_secondary || ""}`,
            availability: `${formData.availability || ""}`,
            priority: `${formData.priority}`,
            currently_in_project: `${formData.currently_in_project || ""}`,
            candidate_onedrive_link: `${formData.candidate_onedrive_link || ""}`,
            comments: `${formData.comments || ""}`,
            cvisa_status: `${formData.cvisa_status || ""}`,
            assigned_team: `${formData.assigned_team || ""}`,
            primary_technology: `${formData.primary_technology || ""}`,
            secondary_technology: `${formData.secondary_technology || ""}`,
            us_entry_date: `${formData.us_entry_date || ""}`,
            university_name: `${formData.university_name || ""}`,
            us_entry_visa: `${formData.us_entry_visa || ""}`,
            candidate_address1: `${formData.candidate_address1 || ""}`,
            opt_letter_status: `${formData.opt_letter_status || ""}`,
            marketing_start_date: `${formData.marketing_start_date || ""}`,
            onboarded_company: `${formData.onboarded_company || ""}`,
            send_work_status_email: `${formData.send_work_status_email || ""}`,
            work_auth_start_date: `${formData.work_auth_start_date || ""}`,
          },
        },
      };

      // Send the request using fetch with async/await
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

      // Check if the response is okay (status 200-299)
      if (response.ok) {
        const data = await response.json();

        if (data.message) {
          toast.success("Changes Saved Successfully", {
            draggable: "true",
            autoClose: 2000,
            // position: "center",
            className: "toast-center",
          });

          // navigate('/benchcandidates');
        } else {
          toast.warn("Action completed successfully.", {
            draggable: "true",
            autoClose: 2000,
            // position: "center",
            className: "toast-center",
          }); // Fallback message if `data.message` is undefined
        }
      } else {
        // Handle unsuccessful response
        // toast.warn(response.status);
        toast.error(`Failed to update candidate. Status: ${response.status}`, {
          draggable: "true",
          autoClose: 2000,
          // position: "center",
          className: "toast-center",
        });
      }
    } catch (err) {
      // Handle any errors that occur during fetch or in the above code
      console.error("Error occurred during fetch:", err);
      toast.error(err, {
        draggable: "true",
        autoClose: 2000,
        // position: "center",
        className: "toast-center",
      });
    }
  };

  if (!formData) {
    return <>There is no data available - Error !!</>;
  }

  function backEditCandidate() {
    navigate("/benchcandidates");
  }

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  const CustomInputMarketing = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  return (
    <div>
      <div className="main-dash row-flex">
        <div className="candidateEditForm scroll-bar bottom-sidebar">
          <div className="header">
            <img src={Sidenav} alt="" srcset="" onClick={backEditCandidate} />
            <img src={Info} alt="" srcset="" />
            <h2 className="title">Modify Bench Candidates Details</h2>
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
                  <label htmlFor="gender">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Primary Email</label>
                  <input
                    type="text"
                    placeholder="Enter Primary Email"
                    name="primary_email"
                    value={formData.primary_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Secondary Email</label>
                  <input
                    type="text"
                    placeholder="Enter Secondary Email"
                    name="secondary_email"
                    value={formData.secondary_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Primary Contact</label>
                  <input
                    type="text"
                    placeholder="Enter Primary Contact No"
                    name="primary_contact"
                    value={formData.primary_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="inputComponent">
                  <label htmlFor="">Secondary Contact</label>
                  <input
                    type="text"
                    placeholder="Enter Secondary Contact No"
                    name="secondary_contact"
                    value={formData.secondary_contact}
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
                <div className="inputComponent col-span-2">
                  <label htmlFor="">Address</label>
                  <input
                    type="text"
                    placeholder="Enter Your Address"
                    name="candidate_address1"
                    value={formData.candidate_address1}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Location Preference</label>
                  <select
                    name="location_preference"
                    value={formData?.location_preference?.includes("Other") ? "Other" : formData.location_preference}
                    onChange={handleChange}
                  >
                    <option value="">Select Location Preference</option>
                    <option value="Anywhere">Anywhere</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formData?.location_preference?.includes("Other") ? (
                  <div className="inputComponent">
                    <span className="head">State</span>
                    {console.log(formData.location_preference)}
                    <input
                      type="text"
                      className="login-input"
                      placeholder="Enter State"
                      value={
                        locationState ||
                        (formData?.location_preference?.includes("Other")
                          ? formData?.location_preference?.substring(13).trim()
                          : "other")
                      }
                      onChange={(e) => setLocationState(e.target.value)}
                    />
                  </div>
                ) : null}
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
                  <select name="visa_status" value={formData.visa_status} onChange={handleChange}>
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
                  <label htmlFor="">Everify_Status</label>
                  <select name="everify_status" value={formData.everify_status} onChange={handleChange}>
                    <option value="">Select everify status</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Completed">Not Completed</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">i9 Form Status</label>
                  <select name="i9_form_status" value={formData.i9_form_status} onChange={handleChange}>
                    <option value="">Select i9 status</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Completed">Not Completed</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Current Status</label>
                  <select name="current_status" value={formData.current_status} onChange={handleChange}>
                    <option value="">Select Current Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Assigned Recruiter:</label>
                  <select name="assigned_recruiter" value={formData.assigned_recruiter} onChange={handleChange}>
                    <option value="">Select Recruiter</option>
                    {[...new Set(recruitersBList.map((item) => item.recruiter_alias_name))].map(
                      (mailRecruiter, index) => (
                        <option key={index} value={mailRecruiter}>
                          {mailRecruiter}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Assigned Secondary Recruiter:</label>
                  <select
                    name="assigned_recruiter_secondary"
                    value={formData.assigned_recruiter_secondary}
                    onChange={handleChange}
                  >
                    <option value="">Select Secondary Recruiter</option>
                    {[...new Set(recruitersBList.map((item) => item.recruiter_alias_name))].map(
                      (mailRecruiter, index) => (
                        <option key={index} value={mailRecruiter}>
                          {mailRecruiter}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Availability:</label>
                  <select name="availability" value={formData.availability} onChange={handleChange}>
                    <option value="">Select Availablity</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Available in 2 weeks">Available in 2 weeks</option>
                    <option value="Available in 1 month">Available in 1 month</option>
                    <option value="Available in 45 days">Available in 45 days</option>
                    <option value="Available in 2 months">Available in 2 months</option>
                  </select>
                </div>
                <div className="inputComponent">
                  <label htmlFor="">Currently in a Project:</label>
                  <select name="currently_in_project" value={formData.currently_in_project} onChange={handleChange}>
                    <option value="">Select Option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="inputComponent col-span-3">
                  <label htmlFor="">One Drive:</label>
                  <input
                    type="text"
                    placeholder="Enter One Drive"
                    name="candidate_onedrive_link"
                    value={formData.candidate_onedrive_link}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent col-span-2">
                  <label htmlFor="">Comments:</label>
                  <input
                    type="text"
                    placeholder="Enter Comment"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">C-Visa Status</label>
                  <select name="cvisa_status" value={formData.cvisa_status} onChange={handleChange}>
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
                  <label htmlFor="">Assigned Team:</label>
                  <select name="assigned_team" value={formData.assigned_team} onChange={handleChange}>
                    <option value="">Select Your Team</option>
                    <option value="Pending onboarding">Pending onboarding</option>
                    <option value="Teams A">Team A</option>
                    <option value="Teams B">Team B</option>
                    <option value="Teams C">Team C</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Primary Technology:</label>
                  <input
                    type="text"
                    placeholder="Enter Primary Technology"
                    name="primary_technology"
                    value={formData.primary_technology}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Secondary Technology:</label>
                  <input
                    type="text"
                    placeholder="Enter Secondary Technology"
                    name="secondary_technology"
                    value={formData.secondary_technology}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="us_entry_date">US Entry Date:</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formData.us_entry_date}
                    onChange={handleDateChange}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="us_entry_date"
                    customInput={<CustomInput />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">University:</label>
                  <input
                    type="text"
                    placeholder="Enter University"
                    name="university_name"
                    value={formData.university_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Visa at the time of US Entry:</label>
                  <input
                    type="text"
                    placeholder="Enter US entry"
                    name="us_entry_visa"
                    value={formData.us_entry_visa}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Offer Letter Status:</label>
                  <select name="opt_letter_status" value={formData.opt_letter_status} onChange={handleChange}>
                    <option value="">Select Option</option>
                    <option value="ISSUED">Issued</option>
                    <option value="NOT ISSUED">Not Issued</option>
                    <option value="Issued with 1983">Issued with 1983</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="marketing_start_date">Marketing Starting Date:</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formData.marketing_start_date}
                    onChange={handleDateChangeMarketing}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="marketing_start_date"
                    customInput={<CustomInputMarketing />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Onboarded Company</label>
                  <select name="onboarded_company" value={formData.onboarded_company} onChange={handleChange}>
                    <option value="">Select Option</option>
                    <option value="4Sphere">4Sphere</option>
                    <option value="tb soft">TB Soft</option>
                    <option value="ub soft">UB Soft</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Send Work Status Email</label>
                  <select name="send_work_status_email" value={formData.send_work_status_email} onChange={handleChange}>
                    <option value="">Select Option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="work_auth_start_date">Work Authorization Start Date</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formData.work_auth_start_date}
                    onChange={handleDate}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="work_auth_start_date"
                    customInput={<CustomInputMarketing />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="">Select Option</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
          <button className="saveBtn" onClick={handleSubmit}>
            <img src={saveTick} alt="saveTickIcon" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
export default CandidateDetailsEdit;
