import React, { useCallback, useState } from "react";
import Dashnav from "../../components/dashnav.jsx";
import TopUser from "../../images/top-user.svg";
import Profile from "../../images/your-profile.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext.jsx";
import { FaRegCopy } from "react-icons/fa6";
import makeRequest from "../../helpers/http-request.js";
import "./VendorDirectory.css";
import Loader from "../../components/Loader.jsx";

const emails = {
  daily_limit: 20,
  emails: ["akash.nagineni@4spheresolutions.com", "amit@4spheresolutions.com", "ram@4spheresolutions.com"],
  emails_viewed_today: 5,
};

const VendorDirectory = () => {
  const [input, setInput] = useState({ company_name: "" });
  const [error, setError] = useState("");
  const [clicked, setClicked] = useState(null);
  const [data, setData] = useState(null);
  const [emailProgress, setEmailProgress] = useState({ count: 0, style: { width: "0%" } });
  const [loader, setLoader] = useState(false);
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user")) || "";

  console.log(storedUser);
  const [company, setCompany] = useState("");

  const navigate = useNavigate();

  const handleCompanyName = () => {
    let companyDomain = storedUser?.email?.split("@")[1];
    let companyName = storedUser?.email?.split("@")[1].split(".")[0];
    return [companyDomain, companyName];
  };

  const handleChange = (e) => {
    setError("");
    setInput((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleEmailProgress = useCallback((newCount) => {
    let limitValue = Math.floor((newCount / 20) * 100);

    let backgroundColor = "#1f649c";
    if (limitValue > 50 && limitValue < 80) {
      backgroundColor = "rgb(255, 187, 0)";
    } else if (limitValue >= 80) {
      backgroundColor = "#ff0000";
    }

    setEmailProgress({
      count: newCount,
      style: { width: `${limitValue}%`, backgroundColor },
    });
  }, []);

  const handleCopy = async (value) => {
    try {
      await window.navigator.clipboard.writeText(value);
      setClicked(value);
    } catch (err) {
      console.log(err);
      return;
    }
  };
  const handleSubmit = async () => {
    try {
      if (user) {
        if (!input.company_name) {
          setError("Company name is required.");
          return;
        }

        setError("");
        setLoader(true);
        const options = {
          url: "https://us-east1-recruiterportal.cloudfunctions.net/fetch_vendor_emails_for_end_Users_v3",
          method: "POST",
          data: { ...input, user_email: user?.email },
        };

        const res = await makeRequest(options);
        console.log("vendor", res);

        setInput({ company_name: "" });
        setLoader(false);
        if (res?.data?.emails) {
          setData(res.data);
          setLoader(false);
          setEmailProgress((prev) => {
            let newCount = res.data.emails_viewed_today;
            handleEmailProgress(newCount);
            return { ...prev, count: newCount };
          });
          setInput({ company_name: "" });
        } else if (res?.data?.message) {
          setError(res?.data?.message);
          setEmailProgress({ count: 20, style: { width: "100%", backgroundColor: "#ff0000" } });
        } else {
          setError("Something went wrong");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100 bottom-sidebar">
          <div className="top-section row-flex">
            <img src={TopUser} alt="" />
            <p className="title-left">Vendor Directory</p>
            <div className=" sidenav-icon row-flex">
              <svg
                class="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 8L21 12L17 16M3 12H13M3 6H13M3 18H13"></path>
              </svg>
            </div>
          </div>

          <div className="mainContent">
            <div className="vendor-body-container">
              <div className="vendor-input-container">
                <div className="vendor-body">
                  <div className="vendor-input">
                    <input
                      type="email"
                      value={input.company_name}
                      placeholder="Enter company name from website domain"
                      name="company_name"
                      onChange={(e) => handleChange(e)}
                    />
                    <button className="email-btn" onClick={handleSubmit}>
                      {loader ? <Loader /> : "Get Details"}
                    </button>
                  </div>
                  <div className="input-text">
                    <span style={{ color: "red", fontWeight: 500, fontSize: "13px" }}>{error}</span>
                    <p className="email-instruction">
                      Example: for '{handleCompanyName()[0]}' → enter '{handleCompanyName()[1]}'
                    </p>
                  </div>
                </div>
                <div className="limit-bar">
                  <span className="email-warning">{emailProgress.count}/20 emails viewed today</span>
                  <div className="limit-outer">
                    <div className="limit-inner" style={emailProgress.style}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="dynamic-table-data">
                <thead>
                  <tr>
                    <th>
                      <div className="alignCenter">Email ID</div>
                    </th>
                    <th>
                      <div className="alignCenter">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.emails?.length > 0 ? (
                    data.emails.map((value) => (
                      <tr key={value}>
                        <td>{value}</td>
                        <td>
                          <div>
                            {clicked == value ? (
                              <span>Copied</span>
                            ) : (
                              <FaRegCopy
                                cursor="pointer"
                                style={{ marginLeft: "15px" }}
                                onClick={() => handleCopy(value)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <p>No emails to show</p>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorDirectory;
