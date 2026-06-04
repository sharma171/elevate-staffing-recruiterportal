import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/dashnav";
import { SearchBox, ThemeLoader } from "../../../components";
import styles from "./Dashboard.module.css";
import images from "../../../assets/images/new";
import { useAuth } from "../../../authContext";
import api from "../../../networking/api";
import { useNavigate } from "react-router-dom";

const { ListIconBox } = images;

function Dashboard() {
  const [searchValue, setSearchValue] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loader, setLoader] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user?.email]);

  const fetchDashboardData = () => {
    const payload = { email: user.email };
    setLoader(true);
    api
      .employeeDashboard(payload)
      .then((res) => {
        if (res?.data) setDashboardData(res.data);
        setLoader(false);
      })
      .catch((err) => {
        console.error("Dashboard API Error:", err?.message || err);
        setLoader(false);
        setDashboardData({});
      });
  };

  const filterBySearch = (items, keys) => {
    if (!Array.isArray(items)) return [];
    if (!searchValue) return items;
    const term = searchValue.toLowerCase();
    return items.filter((item) => keys.some((key) => item[key]?.toLowerCase?.().includes(term)));
  };

  const renderCards = () => {
    if (!dashboardData) return null;
    const { project_status, timesheet_status, weekly_status, document_status } = dashboardData;

    const cardDetails = [
      {
        test: "Current Status",
        title: project_status?.status || "-",
        description: project_status?.client_name || "-",
        iconClass: styles.projectClass,
        googleicon: "supervisor_account",
        headingStyle: {
          fontWeight: "500",
          fontSize: "1.5rem",
          background: "linear-gradient(45deg,rgba(28, 80, 132, 0.8706) 0%, #7B68EE 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        test: "Timesheet Status",
        title: timesheet_status?.status || "-",
        description: timesheet_status?.month || "-",
        iconClass: styles.pendingClass,
        googleicon: "supervisor_account",
        headingStyle: {
          fontWeight: "500",
          fontSize: "1.5rem",
          background: "linear-gradient(45deg, #FFB62C 0%, #F5815A 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        test: "Weekly Status",
        title: weekly_status?.status || "-",
        description: weekly_status?.week || "-",
        iconClass: styles.overdueClass,
        googleicon: "supervisor_account",
        headingStyle: {
          fontWeight: "500",
          fontSize: "1.5rem",
          background: "linear-gradient(45deg, #EB4887 0%, #AF619A 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        test: "Documents",
        title: `${document_status?.attention_count || 0} Attention`,
        description: document_status?.documents?.find((doc) => doc.status !== "Valid")?.name || "All documents valid",
        iconClass: styles.attentionClass,
        icon: ListIconBox,
        headingStyle: {
          fontWeight: "500",
          fontSize: "1.5rem",
          color: "#C9802B",
        },
      },
    ];

    return (
      <div className={`my-4 ${styles["headerCards"]}`}>
        {cardDetails.map((card, index) => (
          <div key={index} className={styles.headingCards}>
            <div className="d-flex justify-content-between gap-2">
              <div className="d-flex flex-column justify-content-between">
                <div>{card.test}</div>
                <div className="mt-3" style={card.headingStyle}>
                  {card.title}
                </div>
                <div className="font14">{card.description}</div>
              </div>
              <div className={`d-flex align-items-center justify-content-center my-auto ${card.iconClass}`}>
                {card.icon ? <img src={card.icon} alt="" /> : null}
                {card.googleicon ? <span className="material-symbols-outlined">{card.googleicon}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBodySection = () => {
    if (!dashboardData) return null;
    const notifications = filterBySearch(dashboardData.notifications || [], ["title", "message"]);
    const documents = filterBySearch(dashboardData.document_status?.documents || [], ["name", "category"]);
    const upcoming = filterBySearch(dashboardData.upcoming_activities || [], ["title", "description", "due_date"]);

    const formatDate = (rawDate) => {
      const match = rawDate?.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const parsed = match ? new Date(match[0]) : null;
      return parsed
        ? parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "Invalid date";
    };

    return (
      <div>
        <div className="d-md-flex gap-3 mt-3 justify-content-between mt-4">
          <div className={`${styles.card} mb-4`}>
            <div className="card-body">
              <div className="d-flex flex-column mb-3">
                <div className="card-title h4 themeColor d-flex align-items-center gap-1 mb-0">
                  <span className="material-symbols-outlined">notifications</span>Notifications
                </div>
                <div className="fontgray">Your recent notifications and alerts</div>
              </div>
              {notifications?.length ? (
                notifications.map((n, i) => (
                  <div key={i} className={`${styles.subcard} d-flex gap-2`}>
                    <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                      <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div>
                      <div className={styles.subcardheading}>{n.title}</div>
                      <div className={styles.cardText}>{n.message}</div>
                      <div className={`${styles.cardTextsmalll} mt-1`}>{n.timestamp}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-3">
                  <b>All caught up! </b> <br />
                  No pending actions at the moment.
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.card} mb-4`}>
            <div className="card-body">
              <div className="d-flex flex-column mb-3">
                <div className="card-title h4 themeColor d-flex align-items-center gap-1 mb-0">
                  <span className="material-symbols-outlined">description</span>Document Status
                </div>
                <div className="fontgray">Status of your important documents</div>
              </div>

              {documents.map((doc, i) => (
                <div key={i} className={`${styles.subcard} d-flex gap-2`}>
                  <div
                    className={`${styles.subCardIcon} ${doc.status === "Valid" ? styles.iconGreen : styles.iconOrange}`}
                  >
                    <span className="material-symbols-outlined">{doc.status === "Valid" ? "task_alt" : "error"}</span>
                  </div>
                  <div>
                    <div className={styles.subcardheading}>{doc.category || doc.name}</div>
                    <div className={styles.cardText}>
                      Status:{" "}
                      <span className={doc.status === "Valid" ? styles.greenText : styles.orangecolor}>
                        {doc.display_status}
                      </span>
                    </div>
                    <div className={`${styles.cardTextsmalll} mt-1`}>{doc.expiry ? formatDate(doc.expiry) : ""}</div>
                  </div>
                  {/* <div className="ms-auto">
                    <div className={styles.viewButton}>View</div>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.card}`}>
          <div className="card-body">
            <div className="d-flex flex-column mb-3">
              <div className="card-title h4 themeColor d-flex align-items-center gap-1 mb-0">
                <span className="material-symbols-outlined">calendar_month</span>Upcoming Activities
              </div>
              <div className="fontgray">Your scheduled activities and deadlines</div>
            </div>

            {upcoming.map((activity, i) => (
              <div key={i} className={`${styles.subcard} d-sm-flex gap-2`}>
                <div className="d-flex gap-2">
                  <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                    <span className="material-symbols-outlined">
                      {activity.type === "weekly_report" ? "schedule" : "description"}
                    </span>
                  </div>
                  <div>
                    <div className={styles.subcardheading}>{activity.title}</div>
                    <div className={styles.cardText}>{activity.description}</div>
                  </div>
                </div>
                <div className="ms-auto d-sm-flex gap-3">
                  <div className="font14 my-sm-0 my-3">Due Date: {activity.due_date}</div>
                  <div
                    className="themeButton mb-auto pointer nowrap"
                    onClick={() => {
                      let path =
                        activity.type === "weekly_report"
                          ? "/weeklystatus?ref=dashboard"
                          : "/monthlytimesheets?ref=dashboard";
                      navigate(path);
                    }}
                  >
                    <span className="sendicon"></span>Submit Now
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2">Welcome, {user?.first_name}!</h2>
              <p className="mb-0"> Here's an overview of your current status and tasks.</p>
            </div>
            {/* <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />
            </div> */}
          </div>
        </div>
        {renderCards()}
        {renderBodySection()}
      </div>
      <ThemeLoader show={loader} />
    </div>
  );
}

export default Dashboard;
