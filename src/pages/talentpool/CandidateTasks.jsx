import React, { useEffect, useRef, useState } from "react";
import { RiSearchLine, RiArrowDownSLine, RiCheckboxMultipleLine, RiFlagFill } from "react-icons/ri";
import TableStyles from "../activeInterviews/activeInterviews.module.css";
import Pagination from "../rateConfirmation/css/RateConfirmation.module.css";
import Priority from "../../assets/images/Priority.png";
import FileIcon from "../../assets/images/FileIcon.png";
import List from "../../assets/images/List.png";
import styles from "../employee/monthlytimesheet/Timesheet.module.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Popup from "../../components/css/Logout.module.css";
import { parse, format } from "date-fns";
import TaskDescription from "../employee/mytasks/descriptionComponent";
import CommentsSeemore from "../employee/mytasks/CommentSeemore";
import "../employee/mytasks/myTasks.css";
import { useAuth } from "../../authContext";
import { ReactComponent as NotStarted } from "../employee/mytasks/images/NotStarted.svg";
import { ReactComponent as InProgress } from "../employee/mytasks/images/InProgress.svg";
import { ReactComponent as Completed } from "../employee/mytasks/images/Completed.svg";
import { ReactComponent as UpdateIcon } from "../employee/mytasks/images/UpdateIcon.svg";
import { ReactComponent as ClockIcon } from "../employee/mytasks/images/ClockIcon.svg";
import { ReactComponent as InProgressIcon } from "../employee/mytasks/images/InprogressIcon.svg";
import { ReactComponent as CompletedIcon } from "../employee/mytasks/images/CompletedIcon.svg";
import { ThemeLoader, Truncate } from "../../components";
import OverlayModal from "../../components/OverlayModal";
import EmptyView from "../../components/EmptyView";
import { X } from "lucide-react";

// SVG icons for different statuses
const StatusIcon = ({ status }) => {
  switch (status) {
    case "Not Started":
      return <NotStarted />;
    case "In Progress":
      return <InProgress />;
    case "Completed":
      return <Completed />;
    default:
      return null;
  }
};

// Top card showing status and count
const StatusCard = ({ status, count }) => (
  <div className="TaskTopCard">
    <div className="taskStatusCard">
      <div className="icon">
        <StatusIcon status={status} />
      </div>
      <span className="statusText">{status}</span>
    </div>
    <div className="taskCount">{count}</div>
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
      <h3 className="title">{task.task_title}</h3>
      <span className={`Priority${task.priority}`}>{task.priority}</span>
    </div>
    <div className="DateId">
      <span className="date">Created {new Date(task.created_at).toLocaleDateString()}</span>
      <span className="id">ID: {task.id}</span>
    </div>
    <p className="info">{task.task_description}</p>
    <div className="actionButtons">
      <span className="comments">
        {task.comment_count} comment{task.comment_count !== 1 ? "s" : ""}
      </span>
      <button type="button" className="updateButton">
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
          className="text"
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
    icon: <InProgressIcon />,
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

function getPermissions(access = "taskboard") {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  return String(data.modules?.taskboard?.accessLevel).toLocaleLowerCase();
}

const CandidateTasks = ({ candidateDetails, disabled: disabledFields }) => {
  let permitions = getPermissions();

  let disabled = disabledFields || permitions == "view";

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
  const { user } = useAuth();
  const [listView, setListView] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState("");
  const [taskList, setTaskList] = useState({ counts: {}, tasks: {} });
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [taskData, setTaskData] = useState(initialValues);
  const [planData, setPlanData] = useState({
    auto_task_create: candidateDetails.auto_task_create,
    auto_task_description: candidateDetails.auto_task_description,
  });

  // Exclude the 'Total' key
  const statuses = Object.keys(taskList.counts).filter((s) => s !== "Total");
  const [updateForm, setUpdateForm] = useState(false);
  const [planDescriptionForm, setPlanDescriptionForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(false);
  //   const { user } = useAuth();

  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const statusRef = useRef(null);
  const priorityRef = useRef(null);

  let candidateName = candidateDetails.first_name + " " + candidateDetails.last_name;

  useEffect(() => {
    function handleClickOutside(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setPriorityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (updateForm) {
      getComments();
    }
  }, [updateForm]);
  useEffect(() => {
    if (candidateDetails?.original_email) {
      getTasks();
    }
  }, [candidateDetails?.original_email]);

  const createTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_task_for_employee",
          employer_email: user.email,
          employee_email: candidateDetails.original_email,
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
        console.log("✅ Task created successfully:", result);
        setCreateForm(false);
        setPopupOverlay({
          message: "Your Task Created Successfully",
          title: "Task Created",
          subhead: "",
          button: "close",
        });
      } else {
        console.error("❌ Failed to create task:", result.message || result);
      }
    } catch (err) {
      console.error("🚨 Error creating task:", err);
    } finally {
      setLoading(false);
      getTasks();
    }
  };
  const createAutoTask = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailid: user.email,
            modify: {
              columns: planData,
              id: candidateDetails?.id,
            },
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setCreateForm(false);
        setPlanDescriptionForm(false);
        setPopupOverlay({
          message: "Your Plan Created Successfully",
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
      setLoading(false);
      getTasks();
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
      const dateA = new Date(a.created_at || a.updated_at);
      const dateB = new Date(b.created_at || b.updated_at);
      return dateB - dateA;
    });

    return allTasks.filter((task) => {
      const matchesSearch = !searchValue || task.task_title.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus = statusFilter === "All Statuses" || task.status === statusFilter;

      const matchesPriority = priorityFilter === "All Priority" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const getTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_tasks_for_employee_employer",
          employee_email: candidateDetails.original_email,
          employer_email: user?.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("result.details", result);
        setTaskList(result);
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
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_task_employer",
          employer_email: user?.email,
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
        setUpdateForm(false);

        setPopupOverlay({
          message: "Failed to update task: " + (result.message || "Unknown error"),
          title: "Update Failed",
          subhead: "",
          button: "close",
        });
      }
    } catch (err) {
      setUpdateForm(false);
      setPopupOverlay({ message: "Error updating task: " + err.message, title: "Error", subhead: "", button: "close" });
    } finally {
      setLoading(false);
    }
  };

  const addcomment = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add_comment_employer",
          employer_email: user?.email,
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
      setLoading(false);
    }
  };

  const getComments = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://fetch-update-employee-tasks-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_task_comments_employer",
          task_id: taskData.task_id,
          employee_email: candidateDetails.original_email,
          employer_email: user?.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setComments(result);
      } else {
        console.error("❌ Failed to add comment:", result.message || result);
      }
    } catch (err) {
      console.error("🚨 Error adding comment:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get filtered tasks for rendering
  const filteredTasks = getFilteredTasks();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Fixed items per page

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
            type="button"
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
  return (
    <>
      {loading && (
        <div className="MainLoading">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
      {popupOverlay && (
        <>
          <div className={`hidemodalclosebtn ${Popup.confirmOverlay}`}>
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
                    type="button"
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
      <div className="table-responsive">
        <div className={`headerboxglass topbox ${styles.headerboxglass} tPoolTasks`} style={{ width: "max-content" }}>
          <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 topHead">
            <div className="d-flex align-items-center">
              <div
                className={`input-group searchInputGroup`}
                // ${searchValue ? "activedropdownBG" : ""}
                style={{ minWidth: "150px", maxWidth: "180px" }}
              >
                <span className="input-group-text bg-white border-end-0 icon d-md-block d-none">
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
              <div className="dropdown me-2 dropDownFilter" ref={statusRef}>
                <button
                  className={`btn btn-light d-flex align-items-center dropBtn`}
                  // ${statusFilter !== "All Statuses" ? "activedropdownBG" : ""}
                  type="button"
                  onClick={() => setStatusOpen((o) => !o)}
                >
                  <RiCheckboxMultipleLine className="me-1" />
                  {statusFilter}
                  <RiArrowDownSLine className="ms-1" />
                </button>
                <ul className={`dropdown-menu${statusOpen ? " show" : ""}`}>
                  {["All Statuses", "Not Started", "In Progress", "Completed"].map((status) => (
                    <li key={status}>
                      <button
                        type="button"
                        className={`dropdown-item${statusFilter === status ? " active" : ""}`}
                        onClick={() => {
                          setStatusFilter(status);
                          setStatusOpen(false);
                        }}
                      >
                        {status}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ width: "1px", height: "24px", backgroundColor: "#ccc" }} />

              <div className="dropdown ms-2 dropDownFilter" ref={priorityRef}>
                <button
                  className={`btn btn-light d-flex align-items-center dropBtn`}
                  // ${priorityFilter !== "All Priority" ? "activedropdownBG" : ""}

                  type="button"
                  onClick={() => setPriorityOpen((o) => !o)}
                >
                  <RiFlagFill className="me-1" />
                  {priorityFilter}
                  <RiArrowDownSLine className="ms-1" />
                </button>
                <ul className={`dropdown-menu${priorityOpen ? " show" : ""}`}>
                  {["All Priority", "Low", "Medium", "High"].map((priority) => (
                    <li key={priority}>
                      <button
                        type="button"
                        className={`dropdown-item${priorityFilter === priority ? " active" : ""}`}
                        onClick={() => {
                          setPriorityFilter(priority);
                          setPriorityOpen(false);
                        }}
                      >
                        {priority}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {disabled ? (
              <></>
            ) : (
              <div className="d-flex align-items-center">
                <div className="d-flex gap-3 w-100 justify-content-between align-items-center">
                  <div className="d-flex gap-3 w-100">
                    <div
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
            )}
          </div>
        </div>
        {filteredTasks.length ? (
          <>
            <div className="">
              <table className="table table-borderless table-hover align-middle taskTable">
                <thead>
                  <tr className={`${TableStyles.lightColor} ${TableStyles.tableHead}`}>
                    <th className="">
                      <div className={`d-flex align-items-center gap-2`}>
                        <span class="material-symbols-outlined fs-6">admin_panel_settings</span>
                        {/* <span className="material-symbols-outlined fs-6">calendar_month</span> */}
                        ID
                      </div>
                    </th>
                    <th className="">
                      <div className={`d-flex align-items-center gap-2`}>
                        <img src={FileIcon} alt="icons" className="icon" />
                        Task
                      </div>
                    </th>
                    <th className="">
                      <div className="d-flex align-items-center gap-2">
                        <img src={Priority} alt="icons" className="icon" />
                        Priority
                      </div>
                    </th>
                    <th className="">
                      <div className="d-flex align-items-center gap-2">
                        <img src={List} alt="icons" className="icon" />
                        Status
                      </div>
                    </th>
                    <th className="">
                      <div className="d-flex align-items-center gap-1 nowrap">
                        <span className="material-symbols-outlined fs-6">calendar_month</span>
                        <span>Created Date</span>
                      </div>
                    </th>
                    <th className="">
                      <div className="d-flex align-items-center gap-1 nowrap">
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
                      <td style={{ maxWidth: "220px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            title={task.task_id}
                            className={`w-100 ${TableStyles.themefont} ${TableStyles.regular} nowrap text-truncate`}
                          >
                            {task.task_id}
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: "350px", minWidth: "250px" }}>
                        <div>
                          <Truncate text={task.task_title} className={`themeColor fs-6 fw-500`} />
                          <br />
                          <Truncate text={task.task_description} className={`fontgray`} />
                        </div>
                      </td>

                      <td className="">
                        <span className={`badge Priority${task.priority}`}>{task.priority}</span>
                      </td>

                      {/* Client Name (who created it) */}
                      <td className="">
                        <div className="d-flex align-items-center gap-2">
                          <StatusIcon status={task.status} />
                          <span className={`${TableStyles.themefont} status`}>{task.status}</span>
                        </div>
                      </td>

                      {/* Submission Date */}
                      <td className="">
                        <div className="d-flex gap-2 align-items-center ps-1">
                          <div className="blueBall"></div>
                          <span className="date">{new Date(task.created_at).toLocaleDateString("en-US")}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="">
                        <div className="d-flex gap-2 align-items-center ps-1">
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
                  {[5, 10, 15, 20, 30, 50, 100].map((size) => (
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
        ) : (
          <EmptyView
            hide={loading}
            title="No Tasks Available"
            description={`<b>${candidateName}’s </b> tasks will appear here once they are created or assigned.`}
          />
        )}
        {createForm && (
          <>
            <OverlayModal
              modalStyle={{ padding: "20px" }}
              isActive={createForm}
              style={{ maxWidth: "650px" }}
              onClose={() => setCreateForm(false)}
            >
              <ThemeLoader show={loading} fixed />{" "}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 justify-content-between">
                  <div className="themeColor h4">Create New Task</div>
                  <button
                    className="d-flex align-items-center justify-content-center hidemodalclosebtn pdfcontrollButtonsPDF"
                    onClick={() => setCreateForm(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

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
                  <div className="flex space-x-6 radioLabel">
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
                          {opt.icon}
                          <span className="ml-1">{opt.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Task Title</label>
                  <input
                    className="form-control"
                    placeholder="Enter Task title"
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
                  <button
                    type="button"
                    className="filled"
                    onClick={(e) => {
                      e.preventDefault();
                      createTasks();
                    }}
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </OverlayModal>
          </>
        )}
        {planDescriptionForm && (
          <>
            <OverlayModal
              modalStyle={{ padding: "20px" }}
              isActive={planDescriptionForm}
              style={{ maxWidth: "650px" }}
              onClose={() => setPlanDescriptionForm(false)}
            >
              <div>
                <ThemeLoader show={loading} fixed />
                <div className="mb-4 ">
                  <div className="d-flex align-items-center gap-2 justify-content-between">
                    <div className="themeColor h4">Describe your work plan</div>
                    <button
                      className="d-flex align-items-center justify-content-center hidemodalclosebtn pdfcontrollButtonsPDF"
                      onClick={() => setPlanDescriptionForm(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>

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
                    <label className="form-label fw-bold">Auto Generate Tasks</label>
                    <div className="dropDown">
                      <select
                        className="form-control appearance-none w-full pr-10"
                        value={planData.auto_task_create}
                        onChange={(e) => setPlanData({ ...planData, auto_task_create: e.target.value })}
                      >
                        <option value="">Select Options</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      <div className="pointer">▼</div>
                    </div>
                  </div>
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
              </div>
            </OverlayModal>
          </>
        )}
        {updateForm && (
          <>
            <OverlayModal
              isActive={updateForm}
              style={{ maxWidth: "650px" }}
              modalStyle={{ padding: "20px" }}
              onClose={() => setUpdateForm(false)}
            >
              <div className="UpdatePopup">
                <ThemeLoader show={loading} fixed />
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                    <div className="themeColor h4 topHeading">{taskData.title}</div>
                    <button
                      className="d-flex align-items-center justify-content-center hidemodalclosebtn pdfcontrollButtonsPDF"
                      onClick={() => setUpdateForm(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="fontgray fs-12">
                    <TaskDescription description={taskData.description} />
                  </div>
                </div>
                <div className="taskStatus">
                  <div className="ltext">
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
                    // First update the status
                    updateTasks();
                    // Then add a comment if there's any
                    if (taskData.initialComments && taskData.initialComments.trim() !== "") {
                      addcomment();
                    }
                  }}
                >
                  {disabled ? (
                    <></>
                  ) : (
                    <>
                      <div className="mb-4 mt-4">
                        <label className="form-label block mb-2 font-medium">Update Status</label>
                        <div className="flex space-x-6 radioLabel">
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
                                {opt.icon}
                                <span className="ml-1">{opt.label}</span>
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
                    </>
                  )}
                  <div className="mb-4">
                    {comments?.comments?.length > 0 && (
                      <>
                        <label className="form-label">Previous Comments</label>
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
                  {disabled ? (
                    <></>
                  ) : (
                    <div className="buttomRow mb-4 mt-4">
                      <button type="button" className="outlined" onClick={() => setUpdateForm(false)}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="filled"
                        onClick={(e) => {
                          e.preventDefault();
                          updateTasks();
                          if (taskData.initialComments && taskData.initialComments.trim() !== "") {
                            addcomment();
                          }
                        }}
                      >
                        Update Task
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </OverlayModal>
          </>
        )}
      </div>
    </>
  );
};

export default CandidateTasks;
