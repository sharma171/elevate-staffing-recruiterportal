import React, { useState, useEffect } from "react";
import Dashnav from "../../components/dashnav";
import Sidenav from "../../images/side_top.svg";
import Info from "../../images/info.svg";
import { Link, useNavigate } from "react-router-dom";
import General from "../../images/general.svg";
import saveTick from "../../images/saveTick.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../authContext";

const AddDetails = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [formDataMar, setFormDataMar] = useState({
    recruiter_joining_date: null,
  });
  const [managerName, setManagerName] = useState("");
  const [recruiterTeam, setRecruiterTeam] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const { user } = useAuth();

  function backEditDetails() {
    navigate("/recruiterDetails");
  }

  const CustomInputMarketing = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  const handleDateChangemarketing = (date) => {
    const formattedDateMarketing = date ? format(date, "MM/dd/yyyy") : null;

    setFormDataMar({ ...formDataMar, recruiter_joining_date: formattedDateMarketing });
    // console.log("formData Marketing",formattedDateMarketing);
  };

  const handleRegisterCandidate = async () => {
    // Insert query with NULL handling for secondary_contact and other fields
    const payload = {
      emailid: user.email,
      operation: "insert",
      columns: {
        recruiter_name: `${firstName || ""}`,
        gender: `${gender || ""}`,
        recruiter_email: `${recruiterEmail || ""}`,
        recruiter_joining_date: `${formDataMar.recruiter_joining_date || ""}`,
        recruiter_manager: `${managerName || ""}`,
        recruiter_status: `${currentStatus || ""}`,
        recruiter_team: `${recruiterTeam || ""}`,
      },
    };

    try {
      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(response);
      if (response.ok) {
        console.log("Recruiter Registered Successfully");
        toast.success("Recruiter Registered Successfully");
        // Optionally, redirect to another page or reset form
        // navigate('/benchcandidates'); // Replace with your desired route
      } else {
        const errorData = await response.json();
        toast.error(`Registration failed: ${errorData.message || "An unknown error occurred."}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <div className="candidateEditForm">
          <div className="header">
            <img src={Sidenav} alt="" srcset="" onClick={backEditDetails} />
            <img src={Info} alt="" srcset="" />
            <h2 className="title">Register New Recruiter</h2>
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
                    Name<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && <div className="error">{errors.firstName}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Gender<span>*</span>
                  </label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.recruiterTeam && <div className="error">{errors.recruiterTeam}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Email<span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                  />
                  {errors.recruiterEmail && <div className="error">{errors.recruiterEmail}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Recruiter Status<span>*</span>
                  </label>
                  <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
                    <option value="">Select Current Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.currentStatus && <div className="error">{errors.currentStatus}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="recruiter_joining_date">Recruiter Joining Date</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formDataMar.recruiter_joining_date ? new Date(formDataMar.recruiter_joining_date) : null}
                    onChange={handleDateChangemarketing}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="recruiter_joining_date"
                    customInput={<CustomInputMarketing />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Recruiter Manager<span>*</span>
                  </label>
                  <select value={managerName} onChange={(e) => setManagerName(e.target.value)}>
                    <option value="">Select Manager</option>
                    <option value="mani1@4spheresolutions.com">mani1@4spheresolutions.com</option>
                    <option value="amit@4spheresolutions.com">amit@4spheresolutions.com</option>
                    <option value="mat@4spheresolutions.com">mat@4spheresolutions.com</option>
                  </select>
                  {errors.managerName && <div className="error">{errors.managerName}</div>}
                </div>

                <div className="inputComponent">
                  <label htmlFor="">
                    Recruiter Team<span>*</span>
                  </label>
                  <select value={recruiterTeam} onChange={(e) => setRecruiterTeam(e.target.value)}>
                    <option value="">Select Team</option>
                    <option value="Team A">Team A</option>
                    <option value="Team B">Team B</option>
                    <option value="Team C">Team C</option>
                    <option value="Team BDE">Team BDE</option>
                  </select>
                  {errors.recruiterTeam && <div className="error">{errors.recruiterTeam}</div>}
                </div>
              </div>
            </section>
          </div>
          <button className="saveBtn" onClick={handleRegisterCandidate}>
            <img src={saveTick} alt="saveTickIcon" />
            Register Recruiter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDetails;
