import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/dashnav";
import styles from "../monthlytimesheet/Timesheet.module.css";
import profileStyles from "../../talentpool/css/TalentPool.module.css";
import ProfileLogoComponent from "../../../components/ProfileComponent";
import MailIcon from "./images/mailIcon.svg";
import CallIcon from "./images/CallIcons.svg";
import { ReactComponent as CopyIcon } from "./images/CopyIcon.svg";
import LocarionIcon from "./images/LocationIcon.svg";
import Popup from "../../../components/css/Logout.module.css";
import "./contact.css";
import PeopleIcon from "./images/peopleIcon.svg";
import { useAuth } from "../../../authContext";
import "./contact.css";
import { ThemeLoader } from "../../../components";

const ContactHr = () => {
  const { user, organisation } = useAuth();
  const [activeTab, setActiveTab] = useState(1);
  const [createForm, setCreateForm] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [subject, setSubject] = useState("");
  const [hrData, setHrData] = useState({ data: {} }); // Initialize with a data object
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [priority, setPriority] = useState("");
  const [attachments, setAttachments] = useState([]); // for files
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate("");

  useEffect(() => {
    if (user?.email) {
      getTasks();
    }
  }, [user?.email]);

  const getTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://submit-hr-ticket-employee-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_org_details",
          employee_email: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("result.details", result);
        setHrData(result);
      } else {
        throw new Error(result.message || "Failed to fetch recruiter analysis.");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent form reload
    setLoading(true);

    try {
      // prepare the payload
      const payload = {
        employee_email: user.email,
        subject,
        description,
        priority,
        category,
      };

      // If there are attachments, read and add them
      if (attachments.length > 0) {
        payload.files = await Promise.all(
          attachments.map(async (file) => ({
            file_name: file.name,
            file_content: await toBase64(file),
          }))
        );
      }

      const response = await fetch("https://submit-hr-ticket-employee-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Task created successfully:", result);
        setCreateForm(false);
        setTicketId(result.reference_number);
        setPopupOverlay({
          message: `Your Ticket Raised Successfully (${result.reference_number})`,
          title: "Ticket",
          subhead: `Your Reference number ${result.reference_number}`,
          button: "close & Copy",
        });
        setSubject("");
        setCategory("");
        setDescription("");
        setPriority("");
        setAttachments([]);
      } else {
        console.error("❌ Failed to create task:", result.message || result);
        setPopupOverlay({ message: "Unable To Create Ticket.", title: "Error", subhead: "", button: "close" });
      }
    } catch (err) {
      console.error("🚨 Error creating task:", err);
      setPopupOverlay({ message: "Unable To Create Ticket.", title: "Error", subhead: "", button: "close" });
    } finally {
      setLoading(false);
    }
  };

  // helper to convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // only base64 part
      reader.onerror = (error) => reject(error);
    });

  const copyToClipboard = (text) => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("✅ Copied to clipboard:", text);
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("❌ Failed to copy: ", err);
      });
  };

  return (
    <>
      <div className="d-flex backgroundImage">
        <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
          <div className="headerBackground text-white p-3 rounded-top">
            <div className="d-flex align-items-center justify-content-between mb-5 mb-md-0">
              <div>
                <h2 className="mb-0 fw-bold h2">Contact HR</h2>
                <p className="mb-0">Get in touch with our HR team for any questions or concerns.</p>
              </div>
              {/* <div className="d-flex align-items-center gap-3">
                                <div className={profileStyles.userbox}>
                                    <ProfileLogoComponent />
                                </div>
                            </div> */}
            </div>
          </div>
          <div className="px-0 px-md-3 pt-3">
            <div className={`headerboxglass topbox ${styles.headerboxglass} contactHeader`}>
              <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 topHead">
                <div className="d-flex align-items-center">
                  <div className="col-flex contactTop">
                    <div className="row-flex headrow">
                      <div className="icon">
                        <img src={PeopleIcon} alt="icons" className="img" />
                      </div>
                      <h3 className="heading nowrap">HR Department</h3>
                    </div>
                    <p className="para">Our dedicated HR team is here to help you with any questions or concerns.</p>
                  </div>
                </div>
                {console.log("organisation data", organisation)}
                <div className="d-flex align-items-center">
                  <div className="d-flex gap-3 w-100 justify-content-between align-items-center">
                    <div className="d-flex gap-3 w-100">
                      <div
                        key="1"
                        className={`${styles.headerButtons} ${
                          activeTab === 1 ? styles.activeTab : ""
                        } d-flex justify-content-center gap-2 pointer navButtons`}
                        onClick={() => {
                          navigate("/hrtickets?add=true");
                          // setCreateForm(true)
                        }}
                      >
                        <span className="report-filled" style={{ paddingTop: "0" }}></span>
                        <div>Submit a Ticket</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="contactHr row-flex">
            <div className="contactCard">
              <div className="icon">
                <img src={MailIcon} alt="icons" className="img" />
              </div>
              <div className="title">For any queries, please contact us at</div>
              <Link
                className="cardurl"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hrData?.data?.hr_email) {
                    copyToClipboard(hrData.data.hr_email);
                  }
                }}
              >
                {hrData?.data?.hr_email || "Loading..."} <CopyIcon />
              </Link>
            </div>
            <div className="contactCard">
              <div className="icon">
                <img src={CallIcon} alt="icons" className="img" />
              </div>
              <div className="title">For any assistance, feel free to call us at</div>
              <Link
                className="cardurl"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hrData?.data?.phone_number) {
                    copyToClipboard(hrData.data.phone_number);
                  }
                }}
              >
                {hrData?.data?.phone_number || "Loading..."} <CopyIcon />
              </Link>
            </div>
            <div className="contactCard">
              <div className="icon">
                <img src={LocarionIcon} alt="icons" className="img" />
              </div>
              <div className="title">Visit Us</div>
              <Link
                className="cardurl"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hrData?.data?.organization_address) {
                    copyToClipboard(hrData.data.organization_address);
                  }
                }}
              >
                {hrData?.data?.organization_address || "Loading..."}
              </Link>
            </div>
          </div>
          {createForm && (
            <>
              <div className={`overlay-container visible ContactForm`}>
                <div className="overlay">
                  <div className={`panel open`} style={{ width: "600px" }}>
                    <button
                      style={{ zIndex: "99999" }}
                      onClick={() => setCreateForm(false)}
                      type="button"
                      className="btn-close modalclosebtn"
                      aria-label="Close"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="pannelinner">
                      <div className="mb-4 mt-3">
                        <div className="themeColor h4">Get in Touch</div>
                        <div className="fontgray fs-12">Reach out to our HR experts – we're just a message away.</div>
                      </div>
                      <form className="formTask">
                        <div className="mb-4">
                          <label className="form-label">Subject</label>
                          <input
                            className="form-control"
                            placeholder="Enter Ticket Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Category</label>
                          <div className="dropDown">
                            <select
                              className="form-control appearance-none w-full pr-10"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                            >
                              <option value="">Select Category</option>
                              <option value="Time Off Request">Time Off Request</option>
                              <option value="Document Request">Document Request</option>
                              <option value="Payroll Query">Payroll Query</option>
                              <option value="Benefits Information">Benefits Information</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="pointer">▼</div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            placeholder="Describe your issue and queries"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Priority</label>
                          <div className="dropDown">
                            <select
                              className="form-control appearance-none w-full pr-10"
                              value={priority}
                              onChange={(e) => setPriority(e.target.value)}
                            >
                              <option value="">Select Priority</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                            <div className="pointer">▼</div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Attachments</label>
                          <div className="dropDown">
                            <input
                              type="file"
                              className="form-control"
                              multiple
                              onChange={(e) => setAttachments(Array.from(e.target.files))}
                            />
                          </div>
                        </div>
                        <div className="buttomRow mb-4 mt-5">
                          <button type="button" className="outlined" onClick={() => setCreateForm(false)}>
                            Cancel
                          </button>
                          <button type="submit" className="filled" onClick={handleSubmit}>
                            {loading ? "Submitting..." : "Submit Ticket"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {popupOverlay && (
          <>
            <div className={Popup.confirmOverlay}>
              <div className={Popup.confirmModal}>
                <div className={`${Popup.modalHeader} d-flex align-items-center justify-content-between`}>
                  <h3>{popupOverlay?.title ? popupOverlay?.title : "Status"}</h3>
                  <span className="material-symbols-outlined pointer" onClick={() => setPopupOverlay(null)}>
                    close
                  </span>
                </div>
                <div className={`d-flex flex-column align-items-center ${Popup.modalBody}`}>
                  <div className={`${Popup.confirmHeading}`}>
                    <div className="fw-bold">{popupOverlay?.message}</div>
                    {/* <div>{popupOverlay?.subhead}</div> */}
                  </div>
                  <div className={Popup.buttonContainer}>
                    <button
                      onClick={() => {
                        setPopupOverlay(null);
                        if (ticketId) {
                          copyToClipboard(ticketId);
                        }
                      }}
                      className={`${Popup.confirmButton} ${Popup.confirmYes}`}
                    >
                      <CopyIcon />
                      Copy
                    </button>
                    <button
                      onClick={() => setPopupOverlay(null)}
                      className={`${Popup.confirmButton} ${Popup.confirmYes}`}
                    >
                      <span className="logout-icon" />
                      Okay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <ThemeLoader show={loading} />
    </>
  );
};

export default ContactHr;
