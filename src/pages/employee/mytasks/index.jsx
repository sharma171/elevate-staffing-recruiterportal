import React, { useEffect, useState } from "react";
import { RiSearchLine, RiCheckboxMultipleLine, RiFlagFill } from "react-icons/ri";
import "../../../assets/styles/OverlayModal.css";
import Pagination from "../../rateConfirmation/css/RateConfirmation.module.css";
import CustomPagination from "../../../components/CustomPagination";
import TableStyles from "../../activeInterviews/activeInterviews.module.css";
import styles from "../monthlytimesheet/Timesheet.module.css";
import Popup from "../../../components/css/Logout.module.css";
import "./myTasks.css";
import images from "../../../assets/images/new";
import Priority from "../../../assets/images/Priority.png";
import FileIcon from "../../../assets/images/FileIcon.png";
import List from "../../../assets/images/List.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import TaskDescription from "./descriptionComponent";
import CommentsSeemore from "./CommentSeemore";
import { ReactComponent as NotStarted } from "./images/NotStarted.svg";
import { ReactComponent as Completed } from "./images/Completed.svg";
import { ReactComponent as UpdateIcon } from "./images/UpdateIcon.svg";
import { ReactComponent as ClockIcon } from "./images/ClockIcon.svg";
import { ReactComponent as CompletedIcon } from "./images/CompletedIcon.svg";
import { useAuth } from "../../../authContext";
import { ThemeLoader, Truncate } from "../../../components";
import { FaRegClock } from "react-icons/fa6";

const StatusIcon = ({ status }) => {
  switch (status) {
    case "Not Started":
      return <NotStarted />;
    case "In Progress":
      return <FaRegClock className="skyBlue" style={{ color: "#2563eb", fontSize: "18px" }} />;
    case "Completed":
      return <Completed />;
    default:
      return null;
  }
};

// Top card showing status and count
const StatusCard = ({ status, count }) => (
  <div className="d-flex align-items-center gap-2 px-4 py-3 border-bottom" style={{ background: "#f9fafb" }}>
    <div className="my-auto">
      <StatusIcon status={status} />
    </div>
    <span className="statusText">{status}</span>
    <div className="themeBadge font14">{count}</div>
  </div>
);

// Single task card
const TaskCard = ({ task, setTaskData, setUpdateForm }) => (
  <div
    className={`taskCard Priority ${task.priority}`}
    onClick={() => {
      setTaskData({
        id: task.id,
        task_id: task.task_id,
        title: task.task_title,
        description: task.task_description,
        priority: task.priority,
        status: task.status,
        duedate: task.due_date,
        initialComments: "",
      });
      setUpdateForm(true);
    }}
  >
    <div className="titlePriorityRow">
      <Truncate text={task.task_title} className="themeColor fw-500 fs-6" />
      <span className={`Priority${task.priority}`}>{task.priority}</span>
    </div>
    <div className="DateId d-flex gap-2 align-items-center justify-content-start">
      <span className="date">Created {new Date(task.created_at).toLocaleDateString()}</span>
      <span className={String(task.status).replaceAll(" ", "")}>{task.status}</span>
    </div>
    <Truncate className={`fontgray`} text={task.task_description} />
    <div className="actionButtons d-flex align-items-center mt-2 flex-wrap">
      <span className="id font12">ID: {task.id}</span>

      <div className="actionButtons d-flex align-items-center gap-2 flex-wrap">
        <span className="comments m-0 mt-1">
          {task.comment_count} comment{task.comment_count !== 1 ? "s" : ""}
        </span>
        <button className="updateButton">
          <div
            className="icon"
            onClick={() => {
              // Pass the complete task data needed for updating
              setTaskData({
                id: task.id,
                task_id: task.task_id,
                title: task.task_title,
                description: task.task_description,
                priority: task.priority,
                status: task.status,
                duedate: task.due_date,
                initialComments: "",
              });
              setUpdateForm(true);
            }}
          >
            <UpdateIcon />
          </div>
          <span
            className="text mt-1"
            onClick={() => {
              // Pass the complete task data needed for updating
              setTaskData({
                id: task.id,
                task_id: task.task_id,
                title: task.task_title,
                description: task.task_description,
                priority: task.priority,
                status: task.status,
                duedate: task.due_date,
                initialComments: "",
              });
              setUpdateForm(true);
            }}
          >
            Update
          </span>
        </button>
      </div>
    </div>
  </div>
);

const statusOptions = [
  {
    value: "Not Started",
    label: "Not Started",
    // clock icon
    icon: <ClockIcon />,
    color: "text-gray-500",
    checkedBg: "bg-gray-500",
  },
  {
    value: "In Progress",
    label: "In Progress",
    // play icon
    icon: <FaRegClock className="skyBlue" style={{ color: "#2563eb", fontSize: "16px" }} />,
    color: "text-blue-700",
    checkedBg: "bg-blue-700",
  },
  {
    value: "Completed",
    label: "Completed",
    // check‑mark icon
    icon: <CompletedIcon />,
    color: "text-green-600",
    checkedBg: "bg-green-600",
  },
];

function MyTasks() {
  const initialValues = {
    title: "",
    description: "",
    priority: "",
    status: "Not Started",
    duedate: "",
    initialComments: "",
  };
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [listView, setListView] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState("");
  const [taskList, setTaskList] = useState({ counts: {}, tasks: {} });
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [candidateDetails, setCandidateDetails] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [taskData, setTaskData] = useState(initialValues);
  const [planData, setPlanData] = useState({
    // "auto_task_create": candidateDetails.auto_task_create,
    auto_task_description: candidateDetails.auto_task_description,
  });

  const [pagination, setPagination] = useState({});

  const getEmployeeProfile = async () => {
    if (!user) {
      return;
    }
    try {
      const profileFetchQuery = {
        email: user?.email,
        action: "get_profile",
      };
      const response = await fetch("https://fetch-update-employee-details-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileFetchQuery),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      const data = await response.json();
      console.log(data.profile);
      setCandidateDetails(data.profile);
      setPlanData({
        auto_task_create: data.profile.auto_task_create,
        auto_task_description: data.profile.auto_task_description,
      });
      // setProfile(data.profile);
    } catch (error) {
      alert(error.message);
    }
  };

  // Exclude the 'Total' key
  const statuses = Object.keys(taskList.counts).filter((s) => s !== "Total");
  const [updateForm, setUpdateForm] = useState(false);
  const [planDescriptionForm, setPlanDescriptionForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (updateForm) {
      getComments();
    }
  }, [updateForm]);
  useEffect(() => {
    if (user?.email !== "") {
      getTasks();
      getEmployeeProfile();
    }
  }, [user?.email]);

  const createTasks = async () => {
    try {
      setFormLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_task_for_self",
          employee_email: user.email,
          task_data: {
            task_title: taskData.title,
            task_description: taskData.description,
            priority: taskData.priority,
            due_date: taskData.duedate,
            initial_comment: taskData.initialComments,
            status: taskData.status,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setCreateForm(false);
        setPopupOverlay({
          message: "Your Task Created Successfully",
          title: "Task Created",
          subhead: "",
          button: "close",
        });
      } else {
        console.log("❌ Failed to create task:", result.message || result);
      }
    } catch (err) {
      console.log("🚨 Error creating task:", err);
    } finally {
      setFormLoading(false);
      getTasks();
    }
  };

  const createAutoTask = async () => {
    try {
      setFormLoading(true);

      const response = await fetch("https://fetch-update-employee-details-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          action: "update_profile",
          profile_data: {
            id: candidateDetails?.id,
            auto_task_description: planData.auto_task_description,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Task created successfully:", result);
        setCreateForm(false);
        setPlanDescriptionForm(false);
        setPopupOverlay({
          message: "Your plan created successfully",
          title: "Plan Created",
          subhead: "",
          button: "close",
        });
      } else {
        console.error("❌ Failed to create task:", result.message || result);
      }
    } catch (err) {
      console.error("🚨 Error creating task:", err);
    } finally {
      setFormLoading(false);
      getTasks();
      getEmployeeProfile();
    }
  };

  const getFilteredTasks = () => {
    // Get all tasks from all statuses
    let allTasks = [];

    // Only process if we have tasks
    if (taskList && taskList.tasks) {
      Object.values(taskList.tasks).forEach((tasksArray) => {
        if (Array.isArray(tasksArray)) {
          allTasks.push(...tasksArray);
        }
      });
    }

    allTasks = allTasks.sort((a, b) => {
      const dateA = a.created_at || a.updated_at ? new Date(a.created_at || a.updated_at) : 0;
      const dateB = b.created_at || b.updated_at ? new Date(b.created_at || b.updated_at) : 0;
      return dateB - dateA;
    });

    // Return filtered tasks based on search, status, and priority
    return allTasks.filter((task) => {
      const matchesSearch = !searchValue || task.task_title.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus = statusFilter === "All Statuses" || task.status === statusFilter;

      const matchesPriority = priorityFilter === "All Priority" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  function sortTasksData(data) {
    const sortedTasks = {};
    const statuses = Object.keys(data.tasks);

    statuses.forEach((status) => {
      sortedTasks[status] = data.tasks[status].sort((a, b) => {
        const dateAcreated = a.created_at ? new Date(a.created_at) : 0;
        const dateBcreated = b.created_at ? new Date(b.created_at) : 0;
        const updatedDiff = dateBcreated - dateAcreated;
        if (updatedDiff !== 0) return updatedDiff;

        const dateAupdated = a.updated_at ? new Date(a.updated_at) : 0;
        const dateBupdated = b.updated_at ? new Date(b.updated_at) : 0;
        return dateBupdated - dateAupdated;
      });
    });

    return {
      counts: data.counts,
      tasks: sortedTasks,
    };
  }

  const getTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_tasks_for_employee",
          // employee_email: "chandrasekharmidatha@gmail.com",
          employee_email: user?.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        let tasksData = sortTasksData(result);
        setTaskList(tasksData);
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

  const updateTasks = async () => {
    try {
      setFormLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_task",
          employee_email: user.email,
          task_data: {
            task_id: taskData.task_id,
            status: taskData.status,
            priority: taskData.priority,
            task_description: taskData.description,
            due_date: taskData.duedate,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setUpdateForm(false);
        setPopupOverlay({
          message: "Your Task Updated Successfully",
          title: "Task Updated",
          subhead: "",
          button: "close",
        });
        getTasks();
      } else {
        setPopupOverlay({
          message: "Failed to update task: " + (result.message || "Unknown error"),
          title: "Update Failed",
          subhead: "",
          button: "close",
        });
      }
    } catch (err) {
      setPopupOverlay({ message: "Error updating task: " + err.message, title: "Error", subhead: "", button: "close" });
    } finally {
      setFormLoading(false);
    }
  };

  const addcomment = async () => {
    try {
      setLoadingComments(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add_comment",
          employee_email: user.email,
          comment_data: {
            task_id: taskData.task_id,
            comment_text: taskData.initialComments,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTaskData({ ...taskData, initialComments: "" });
        getComments();
      } else {
        console.log("❌ Failed to add comment:", result.message || result);
      }
    } catch (err) {
      console.log("🚨 Error adding comment:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const getComments = async () => {
    try {
      setLoadingComments(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_task_comments",
          task_id: taskData.task_id,
          employee_email: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setComments(result);
      } else {
        console.log("❌ Failed to add comment:", result.message || result);
      }
    } catch (err) {
      console.log("🚨 Error adding comment:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Get filtered tasks for rendering
  const filteredTasks = getFilteredTasks();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Fixed items per page

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTasks.length, statusFilter, priorityFilter, searchValue]);

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    // Generate an array of page numbers to display
    const getPageNumbers = () => {
      const pages = [];

      if (totalPages <= 5) {
        // If fewer than 5 pages, show all
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always include first page
        pages.push(1);

        // Calculate start and end of paginator
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Adjust if we're near the beginning or end
        if (currentPage <= 3) {
          startPage = 2;
          endPage = 4;
        } else if (currentPage >= totalPages - 2) {
          startPage = totalPages - 3;
          endPage = totalPages - 1;
        }

        // Add dots if needed before middle pages
        if (startPage > 2) {
          pages.push("...");
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }

        // Add dots if needed after middle pages
        if (endPage < totalPages - 1) {
          pages.push("...");
        }

        // Always include last page
        pages.push(totalPages);
      }

      return pages;
    };

    const pages = getPageNumbers();

    // Don't render pagination if there's only one page
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex align-items-center gap-1">
        <span
          className={`lefticon pointer ${currentPage === 1 ? Pagination.disabled : Pagination.pages}`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          ◀
        </span>
        {pages.map((page, index) => (
          <button
            key={index}
            className={`btn ${Pagination.pages} ${
              currentPage === page ? "btn-primary " + Pagination.activePage : "btn-light"
            }`}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}
        <span
          className={`righticon pointer ${currentPage === totalPages ? Pagination.disabled : Pagination.pages}`}
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        >
          ▶
        </span>
      </div>
    );
  };

  // Add this to make sure we're only showing the current page of items in your table
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  };

  const STATUSES = ["All Statuses", "Not Started", "In Progress", "Completed"];

  const handlePageChange = (status, page) => {
    setPagination((prev) => ({ ...prev, [status]: page }));
  };

  return (
    <>
      <div className="d-flex backgroundImage">
        <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
          {popupOverlay && (
            <>
              <div className={Popup.confirmOverlay}>
                <div className={Popup.confirmModal}>
                  <div className={`${Popup.modalHeader} d-flex align-items-center justify-content-between`}>
                    <h3>{popupOverlay?.title ? popupOverlay?.title : "status"}</h3>
                    <span
                      className="material-symbols-outlined pointer"
                      onClick={() => {
                        setPopupOverlay(null);
                      }}
                    >
                      close
                    </span>
                  </div>
                  <div className={`d-flex flex-column align-items-center ${Popup.modalBody}`}>
                    <div className={`${Popup.confirmHeading}`}>
                      <div className="fw-bold">{popupOverlay?.message}</div>
                      <div>{popupOverlay?.subhead}</div>
                    </div>

                    <div className={Popup.buttonContainer}>
                      <button
                        onClick={() => {
                          setPopupOverlay(null);
                        }}
                        className={`${Popup.confirmButton} ${Popup.confirmYes}`}
                      >
                        <span class="logout-icon " />
                        Okay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="headerBackground text-white p-3 rounded-top">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="mb-0 fw-bold h2">My Tasks</h2>
                <p className="mb-0">View and manage tasks assigned to you</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                {/* <SearchBox value={searchValue} onChange={setSearchValue} /> */}
                {/* <div className={profileStyles.userbox}>
                  <ProfileLogoComponent />
                </div> */}
              </div>
            </div>
          </div>
          <div className="px-0 px-md-3 pt-3">
            <div className={`headerboxglass topbox ${styles.headerboxglass}`}>
              <div
                className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 topHead"
                style={{ overflowX: "auto" }}
              >
                <div className="d-flex align-items-center">
                  <div className="input-group searchInputGroup" style={{ minWidth: "150px" }}>
                    <span className="input-group-text bg-white border-end-0 icon">
                      <RiSearchLine />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 searchInput"
                      placeholder="Search Task"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <div style={{ width: "1px", height: "24px", backgroundColor: "#ccc" }} />
                  <div
                    className={`select-wrapper filter-select d-flex align-items-center mx-1 ${
                      statusFilter && statusFilter != "All Statuses" ? "activeSelect" : "inactiveSelect"
                    }`}
                  >
                    <RiCheckboxMultipleLine className="icon" />
                    <select
                      className="dropSelect form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: "1px", height: "24px", backgroundColor: "#ccc" }} />

                  <div
                    className={`select-wrapper filter-select d-flex align-items-center mx-1 ${
                      priorityFilter && priorityFilter != "All Priority" ? "activeSelect" : "inactiveSelect"
                    }`}
                  >
                    <RiFlagFill className="icon" />
                    <select
                      className="dropSelect form-select"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      {["All Priority", "Low", "Medium", "High"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="d-flex gap-3 w-100 justify-content-between align-items-center">
                    <div className="d-flex gap-3 w-100">
                      <div
                        key="1"
                        className={`${styles.headerButtons} ${
                          activeTab === 1 ? styles.activeTab : ""
                        } d-flex justify-content-center gap-2 pointer navButtons`}
                        onClick={() => {
                          setCreateForm(true);
                          setTaskData(initialValues);
                        }}
                      >
                        <span className="report-filled" style={{ paddingTop: "0" }}></span>

                        <div>Create Task</div>
                      </div>
                      <div
                        key="2"
                        className={`${styles.headerButtons} ${
                          activeTab === 2 ? styles.activeTab : ""
                        } d-flex justify-content-center gap-2 pointer navButtons`}
                        onClick={() => setListView(!listView)}
                      >
                        <span className="material-symbols-outlined" style={{ padding: "0" }}>
                          visibility
                        </span>
                        {listView ? (
                          <>
                            <div>Board View</div>
                          </>
                        ) : (
                          <>
                            <div>List View</div>
                          </>
                        )}
                      </div>
                      <div
                        key="3"
                        className={`${styles.headerButtons} ${
                          activeTab === 2 ? styles.activeTab : ""
                        } d-flex justify-content-center gap-2 pointer navButtons`}
                        onClick={() => setPlanDescriptionForm(true)}
                      >
                        <span className="material-symbols-outlined" style={{ padding: "0" }}>
                          description
                        </span>
                        <div>Plan Description</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {listView && (
            <>
              <div className="table-responsive">
                <table className="table table-borderless table-hover align-middle taskTable">
                  <thead>
                    <tr className={`${TableStyles.lightColor} ${TableStyles.tableHead}`}>
                      <th className="textcenter">
                        <div className={`d-flex align-items-center gap-2`}>
                          <span class="material-symbols-outlined fs-6">admin_panel_settings</span>
                          {/* <span className="material-symbols-outlined fs-6">calendar_month</span> */}
                          ID
                        </div>
                      </th>
                      <th className="textcenter px-1">
                        <div className={`d-flex align-items-center gap-2`}>
                          <img src={FileIcon} alt="icons" className="icon" />
                          Task
                        </div>
                      </th>
                      <th className="textcenter px-2">
                        <div className="d-flex align-items-center gap-2">
                          <img src={Priority} alt="icons" className="icon" />
                          Priority
                        </div>
                      </th>
                      <th className="textcenter">
                        <div className="d-flex align-items-center gap-2">
                          <img src={List} alt="icons" className="icon" />
                          Status
                        </div>
                      </th>
                      <th className="textcenter ps-0">
                        <div className="alignCenter d-flex align-items-center gap-1 nowrap">
                          <span className="material-symbols-outlined fs-6">calendar_month</span>
                          <span>Created Date</span>
                        </div>
                      </th>
                      <th className="textcenter ps-0">
                        <div className="alignCenter d-flex align-items-center gap-1">
                          <span className="material-symbols-outlined fs-6">calendar_month</span>
                          <span>Due Date</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={TableStyles.tbody}>
                    {getCurrentPageItems().map((task) => (
                      <tr
                        key={task.id}
                        className={`${TableStyles.activeRow} ${TableStyles.inactiveRow}`}
                        onClick={() => {
                          setTaskData({
                            id: task.id,
                            task_id: task.task_id,
                            title: task.task_title,
                            description: task.task_description,
                            priority: task.priority,
                            status: task.status,
                            duedate: task.due_date,
                            initialComments: "",
                          });
                          setUpdateForm(true);
                        }}
                      >
                        <td className="textcenter">
                          <div className="d-flex align-items-center gap-2">
                            {/* <img className={TableStyles.userIcon} src={avatarFor(task.assigned_to_email)} /> */}
                            <div className="col-flex">
                              <span className={`${TableStyles.themefont} ${TableStyles.regular} nowrap`}>
                                {task.task_id}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* Full Name */}
                        <td className="textcenter">
                          <Truncate text={task.task_title} className="themeColor fw-500 fs-6" />
                          <br />
                          <Truncate text={task.task_description} className={`fontgray`} />
                        </td>

                        {/* Priority */}
                        <td className="textcenter">
                          <span className={`badge Priority${task.priority}`}>{task.priority}</span>
                        </td>

                        {/* Client Name (who created it) */}
                        <td className="textcenter">
                          <div className="d-flex align-items-center gap-2">
                            <StatusIcon status={task.status} />
                            <span className={`${TableStyles.themefont} status`}>{task.status}</span>
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <div className="blueBall"></div>
                            <span className="date">{new Date(task.created_at).toLocaleDateString("en-US")}</span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <div className="redBall"></div>
                            <span className="date red">{new Date(task.due_date).toLocaleDateString("en-US")}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div className="my-3">
                  <label> Show </label>
                  <select
                    className="form-select d-inline w-auto ms-2"
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    value={itemsPerPage}
                  >
                    {[5, 10, 15].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <label> &nbsp; Row </label>
                </div>
                <div className="d-flex justify-content-center my-3">{renderPagination()}</div>
                <div />
                <div />
              </div>
            </>
          )}
          {!listView && (
            <>
              <div className="gap-3 taskSection">
                {statuses.map((status) => {
                  const statusTasks = taskList.tasks[status] || [];
                  const filteredStatusTasks = statusTasks.filter((task) => {
                    const matchesSearch =
                      !searchValue || task.task_title.toLowerCase().includes(searchValue.toLowerCase());
                    const matchesPriority = priorityFilter === "All Priority" || task.priority === priorityFilter;
                    const matchesStatus = statusFilter === "All Statuses" || task.status === statusFilter;
                    return matchesSearch && matchesPriority && matchesStatus;
                  });

                  const currentPage = pagination[status] || 1;
                  const startIndex = (currentPage - 1) * 3;
                  const paginatedTasks = filteredStatusTasks.slice(startIndex, startIndex + 3);

                  return (
                    <div className="d-flex flex-column tasksBorderView" key={status}>
                      <StatusCard status={status} count={filteredStatusTasks.length} />
                      <div className="taskContainer px-3">
                        {paginatedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} setTaskData={setTaskData} setUpdateForm={setUpdateForm} />
                        ))}
                      </div>
                      <div
                        className={`d-flex mt-auto align-items-center justify-content-center pb-2 ${
                          filteredStatusTasks?.length > 3 ? " border-top" : ""
                        }`}
                        style={{ background: "#f9fafb" }}
                      >
                        <CustomPagination
                          hideExtra
                          data={filteredStatusTasks}
                          currentPage={currentPage}
                          setCurrentPage={(page) => handlePageChange(status, page)}
                          rowsPerPage={3}
                          defaultpageHide={3}
                          minVersion={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {createForm && (
            <>
              <div className={`overlay-container visible`}>
                <div className="overlay">
                  <div className={`panel  open`} style={{ width: "600px" }}>
                    <button
                      style={{ zIndex: "99999" }}
                      onClick={() => setCreateForm(false)}
                      type="button"
                      className="btn-close modalclosebtn"
                      aria-label="Close"
                    >
                      <span class="material-symbols-outlined">close</span>
                    </button>
                    <div className="pannelinner">
                      <div className="mb-4 mt-3">
                        <div className="themeColor h4">Create New Task</div>
                        <div className="fontgray fs-12">Add a new task for yourself</div>
                      </div>
                      <form
                        className="formTask"
                        onSubmit={(e) => {
                          e.preventDefault();
                          createTasks();
                        }}
                      >
                        <div className="mb-4 mt-2">
                          <label className="form-label block mb-2 font-medium">Task Status</label>
                          <div className="d-flex space-x-6 radioLabel flex-wrap gap-3">
                            {statusOptions.map((opt) => {
                              return (
                                <label key={opt.value} className="flex items-center cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name="status"
                                    value={opt.value}
                                    checked={taskData.status === opt.value}
                                    onChange={() => setTaskData({ ...taskData, status: opt.value })}
                                    className="sr-only"
                                  />
                                  <span
                                    className={`
                                w-4 h-4 rounded-full border-2 mr-2 flex-shrink-0
                                ${
                                  taskData.status === opt.value
                                    ? `${opt.checkedBg} border-transparent`
                                    : "border-gray-300 bg-white"
                                }
                              `}
                                  />
                                  <span className={`flex items-center ${opt.color} font-medium rdioBtn`}>
                                    {opt.icon ? opt.icon : <></>}

                                    <span className="ml-1 ">{opt.label}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Task Title</label>
                          <input
                            className="form-control"
                            placeholder="Enter Task Title"
                            value={taskData.title}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            placeholder="Task Description"
                            value={taskData.description}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label">Priority</label>
                          <div className="dropDown">
                            <select
                              className="form-control appearance-none w-full pr-10"
                              value={taskData.priority}
                              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
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
                          <label className="form-label">Due Date</label>
                          <DatePicker
                            maxDate={"2099"}
                            className="form-control"
                            selected={taskData.duedate ? new Date(taskData.duedate) : null}
                            onChange={(date) => {
                              const formatted = format(date, "MM/dd/yyyy");
                              setTaskData({ ...taskData, duedate: formatted });
                            }}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="MM/DD/YYYY"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label">Initial Comments</label>
                          <textarea
                            className="form-control"
                            placeholder="Enter Comments"
                            value={taskData.initialComments}
                            onChange={(e) => setTaskData({ ...taskData, initialComments: e.target.value })}
                          />
                        </div>

                        <div className="buttomRow mb-4 mt-5">
                          <button type="button" className="outlined" onClick={() => setCreateForm(false)}>
                            Cancel
                          </button>
                          <button type="submit" className="filled">
                            Create Task
                          </button>
                        </div>
                      </form>
                      <ThemeLoader show={loadingComments || formLoading} fixed />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {planDescriptionForm && (
            <>
              <div className={`overlay-container visible`}>
                <div className="overlay">
                  <div className={`panel  open`} style={{ width: "600px" }}>
                    <button
                      style={{ zIndex: "99999" }}
                      onClick={() => setPlanDescriptionForm(false)}
                      type="button"
                      className="btn-close modalclosebtn"
                      aria-label="Close"
                    >
                      <span class="material-symbols-outlined">close</span>
                    </button>
                    <div className="pannelinner">
                      <div className="mb-4 mt-3">
                        <div className="themeColor h4">Describe your work plan</div>
                        <div className="fontgray fs-12">Capture the details of your project or training plan</div>
                      </div>
                      <form
                        className="formTask"
                        onSubmit={(e) => {
                          e.preventDefault();
                          createTasks();
                        }}
                      >
                        <div className="mb-4">
                          <label className="form-label fw-bold">Plan  Description</label>
                          <textarea
                            className="form-control"
                            placeholder="Describe Your Project Goals, Key Milestones, and Expected Outcomes. For Example: ‘Develop a React-Based Customer Dashboard With Real-Time Analytics and User Management Features."
                            value={planData.auto_task_description}
                            style={{ minHeight: "180px" }}
                            onChange={(e) => setPlanData({ ...planData, auto_task_description: e.target.value })}
                          />
                        </div>

                        <div className="buttomRow mb-4 mt-5">
                          <button type="button" className="outlined" onClick={() => setPlanDescriptionForm(false)}>
                            Cancel
                          </button>
                          <button type="button" onClick={createAutoTask} className="filled">
                            Capture Description
                          </button>
                        </div>
                      </form>
                      <ThemeLoader show={formLoading} fixed />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {updateForm && (
            <>
              <div className={`overlay-container visible`}>
                <div className="overlay">
                  <div className={`panel open`} style={{ width: "600px" }}>
                    <button
                      style={{ zIndex: "99999999" }}
                      onClick={() => setUpdateForm(false)}
                      type="button"
                      className="btn-close modalclosebtn"
                      aria-label="Close"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <div
                      className="pannelinner UpdatePopup"
                      style={{ position: loadingComments || loading ? "relative" : "", zIndex: 1 }}
                    >
                      <div className="mb-4 mt-3">
                        <div className="themeColor h4 topHeading">{taskData.title}</div>
                        <div className="fontgray fs-12">
                          <TaskDescription description={taskData.description} />
                        </div>
                      </div>
                      <div className="taskStatus">
                        <div className="ltext d-flex align-items-center gap-1">
                          Current Status : <StatusIcon status={taskData.status} />
                          <span className="value">{taskData.status}</span>
                        </div>
                        <div className="rText">
                          Priority : <span className={`pbgtext ${taskData.priority}`}>{taskData.priority}</span>
                        </div>
                      </div>
                      <form
                        className="formTask"
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateTasks();
                          if (taskData.initialComments && taskData.initialComments.trim() !== "") {
                            addcomment();
                          }
                        }}
                      >
                        <div className="mb-4 mt-4">
                          <label className="form-label block mb-2 font-medium">Update Status</label>
                          <div className="d-flex space-x-6 radioLabel flex-wrap gap-3">
                            {statusOptions.map((opt) => (
                              <label key={opt.value} className="flex items-center cursor-pointer select-none">
                                <input
                                  type="radio"
                                  name="status"
                                  value={opt.value}
                                  checked={taskData.status === opt.value}
                                  onChange={() => setTaskData({ ...taskData, status: opt.value })}
                                  className="sr-only"
                                />
                                <span
                                  className={`
                                  w-4 h-4 rounded-full border-2 mr-2 flex-shrink-0
                                  ${
                                    taskData.status === opt.value
                                      ? `${opt.checkedBg} border-transparent`
                                      : "border-gray-300 bg-white"
                                  }
                                `}
                                />
                                <span className={`flex items-center ${opt.color} font-medium rdioBtn`}>
                                  {opt.icon ? opt.icon : <></>}
                                  <span className="ml-1 ">{opt.label}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="form-label">Add Comments</label>
                          <textarea
                            className="form-control"
                            placeholder="Enter Your Update Or Notes Here......."
                            value={taskData.initialComments}
                            onChange={(e) => setTaskData({ ...taskData, initialComments: e.target.value })}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label">Previous Comments</label>
                          {comments?.comments?.length > 0 && (
                            <>
                              {[...comments.comments]
                                .sort((a, b) => new Date(b.commented_at) - new Date(a.commented_at))
                                .map((c) => (
                                  <div key={c.id} className="col-flex commentCard mb-2">
                                    <div className="row-flex userDate">
                                      <span className="user">{c.commented_by}</span>
                                      <span className="date">
                                        {new Date(c.commented_at).toLocaleString("en-US", {
                                          timeZone: "America/New_York",
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                    </div>
                                    <CommentsSeemore Comments={c.comment_text} />
                                  </div>
                                ))}
                            </>
                          )}
                        </div>

                        <div className="buttomRow mb-4 mt-4">
                          <button type="button" className="outlined" onClick={() => setUpdateForm(false)}>
                            Cancel
                          </button>
                          <button type="submit" className="filled">
                            Update Task
                          </button>
                        </div>
                      </form>
                      <ThemeLoader show={loadingComments || formLoading} fixed />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ThemeLoader show={loading} />
    </>
  );
}

export default MyTasks;
