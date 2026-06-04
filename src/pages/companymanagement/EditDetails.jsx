import React, { useEffect, useState } from "react";
import Dashnav from "../../components/dashnav";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Sidenav from "../../images/side_top.svg";
import Info from "../../images/info.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import General from "../../images/general.svg";
import saveTick from "../../images/saveTick.svg";
import { useAuth } from "../../authContext";

const EditDetails = () => {
  const [candidateDetails, setCandidateDetails] = useState([]);
  const [formData, setFormData] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch candidates data on component mount
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    fetch("https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailid: user.email,
        operation: "retrieve",
        id: urlParams.get("id"), // Use the retrieved ID as payload
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const recruiterDetails = data?.data?.[0]?.details || [];
        console.log("recruiterDetails", recruiterDetails);
        setCandidateDetails(recruiterDetails[0]);
        setFormData(recruiterDetails[0]);
      })

      .catch((error) => console.error("Error fetching candidates:", error));
    console.log("toast", toast);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  function backEditDetails() {
    navigate("/recruiterDetails");
  }

  const handleSubmit = async () => {
    try {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      // Log formData for debugging
      console.log(formData, "formData==========");

      // Prepare request payload
      const payload = {
        // emailid: formData.emailid,

        emailid: user.email,
        operation: "modify",
        id: urlParams.get("id"),
        columns: {
          recruiter_name: `${formData.recruiter_name || ""}`,
          gender: `${formData.gender || ""}`,
          recruiter_email: `${formData.recruiter_email || ""}`,
          recruiter_joining_date: `${formData.recruiter_joining_date || ""}`,
          recruiter_manager: `${formData.recruiter_manager || ""}`,
          recruiter_status: `${formData.recruiter_status || ""}`,
          recruiter_team: `${formData.recruiter_team || ""}`,
        },
      };

      // Send the request using fetch with async/await
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

      // Check if the response is okay (status 200-299)
      if (response.ok) {
        const data = await response.json();

        if (data.message) {
          toast.success("Changes Saved Successfully", {
            draggable: "true",
            autoClose: 2000,
            closeOnClick: true,
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
          autoClose: false,
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

  const handleDateChangeMarketing = (date) => {
    const formattedDate = date ? format(date, "MM/dd/yyyy") : "";
    setFormData({ ...formData, recruiter_joining_date: formattedDate });
  };

  const CustomInputMarketing = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-input" onClick={onClick} ref={ref}>
      <input type="text" value={value || ""} placeholder="mm/dd/yyyy" readOnly className="date-input" />
      <FaCalendarAlt className="calendar-icon" />
    </div>
  ));

  return (
    <div>
      <div className="main-dash row-flex">
        <div className="candidateEditForm">
          <div className="header">
            <img src={Sidenav} alt="" srcset="" onClick={backEditDetails} />
            <img src={Info} alt="" srcset="" />
            <h2 className="title">Modify Recruiter Details</h2>
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
                  <label htmlFor="">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    name="recruiter_name"
                    value={formData?.recruiter_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Email</label>
                  <input
                    type="text"
                    placeholder="Enter Email"
                    name="recruiter_email"
                    value={formData.recruiter_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Recruiter Status</label>
                  <select name="recruiter_status" value={formData.recruiter_status} onChange={handleChange}>
                    <option value="">Select Current Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="recruiter_joining_date">Recruiter Joining Date:</label>
                  <DatePicker
                    maxDate={"2099"}
                    selected={formData.recruiter_joining_date}
                    onChange={handleDateChangeMarketing}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    name="recruiter_joining_date"
                    customInput={<CustomInputMarketing />}
                  />
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Recruiter Manager</label>
                  <select name="recruiter_manager" value={formData.recruiter_manager} onChange={handleChange}>
                    <option value="">Select Manager</option>
                    <option value="mani1@4spheresolutions.com">mani1@4spheresolutions.com</option>
                    <option value="amit@4spheresolutions.com">amit@4spheresolutions.com</option>
                    <option value="mat@4spheresolutions.com">mat@4spheresolutions.com</option>
                  </select>
                </div>

                <div className="inputComponent">
                  <label htmlFor="">Recruiter Team</label>
                  <select name="recruiter_team" value={formData.recruiter_team} onChange={handleChange}>
                    <option value="">Select Team</option>
                    <option value="Team A">Team A</option>
                    <option value="Team B">Team B</option>
                    <option value="Team C">Team C</option>
                    <option value="Team BDE">Team BDE</option>
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

export default EditDetails;
