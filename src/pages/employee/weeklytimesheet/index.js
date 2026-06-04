import React, { useEffect, useId, useState } from "react";
import { Confirm, CustomPagination, SearchBox, ThemeLoader } from "../../../components";
import styles from "./Timesheet.module.css";
import images from "../../../assets/images/new";
import { useAuth } from "../../../authContext";
import api from "../../../networking/api";
import { Placeholder } from "rsuite";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import AiModal from "./AiModal";
import { formatDateToET, pickDateOnly } from "../../../helpers/StrHelpers";
import FilePreview from "../../benchcandidate/FilePreview";
import OverlayModal from "../../../components/OverlayModal";

const { list, visa_status, addAI } = images;

const pad = (num) => num.toString().padStart(2, "0");
const formatDate = (date) => `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;

function getFridayFromMonday(monday) {
  const friday = new Date(monday);
  if (isNaN(friday)) {
    throw new Error("Invalid Monday date");
  }
  friday.setDate(monday.getDate() + 4);
  return friday;
}

function getCurrentWeekRange() {
  try {
    const today = new Date();
    if (isNaN(today)) throw new Error("Invalid Today Date");
    const diffToMonday = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    const friday = getFridayFromMonday(monday);
    return {
      week_start_date: formatDate(monday),
      week_end_date: formatDate(friday),
    };
  } catch (err) {
    return {
      week_start_date: null,
      week_end_date: null,
      error: err.message,
    };
  }
}

let defaultDateValues = getCurrentWeekRange();
let defaultValues = { ...defaultDateValues, hours_to_complete: "40", hours_worked: "40" };

function Weeklytimesheet() {
  const [searchValue, setSearchValue] = useState();
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [placeholder, setplaceholder] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [data, setData] = useState([]);
  const [loader, setloader] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [aiModal, setAiModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allowedEndDate, setAllowedEndDate] = useState(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [editingReportId, setEditingReportId] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [reportMessages, setreportMessages] = useState({
    editConfirmTitle: "Edit Report",
    editConfirmMessage: "",
    editConfirmYes: "Yes, I'm Sure",
    editConfirmCancel: "Cancel",

    deleteConfirmTitle: "Delete Report",
    deleteConfirmMessage: "",
    deleteConfirmDelete: "Delete",
    deleteConfirmCancel: "Cancel",

    validationMessages: {
      invalidDateRange: "End Date cannot be earlier than Start Date. Please select a valid date range.",
      futureWeekNotAllowed: "You cannot select a future week. Please select a current or previous week.",
      dateOutOfWeekRange1: "Please select a date within the selected week (Monday to Friday).",
      dateOutOfWeekRange2: "Please select a date within the selected week (Monday to Friday).",
    },
  });

  const { user } = useAuth();
  const uniqueId = useId();

  let mondayDate = formData.week_start_date;

  useEffect(() => {
    setAllowedEndDate(getFridayFromMonday(new Date(mondayDate)));
  }, [mondayDate]);

  useEffect(() => {
    if (!searchValue) {
      setData(apiData);
    } else {
      setCurrentPage(1);
      const lowerSearch = searchValue.toLowerCase();
      const filtered = apiData.filter((item) =>
        Object.values(item).some((val) => val && val.toString().toLowerCase().includes(lowerSearch))
      );
      setData(filtered);
    }
  }, [searchValue, apiData]);

  useEffect(() => {
    if (user?.email) {
      getreports();
    }
  }, [user?.email]);

  const getreports = () => {
    setplaceholder(true);

    let payload = {
      action: "get",
      email: user.email,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setplaceholder(false);
        setApiData(res.reports);
        setData(res.reports);
      })
      .catch((err) => {
        setplaceholder(false);
      });
  };

  const requiredFields = [
    "week_start_date",
    "week_end_date",
    "project_name",
    "client_name",
    "project_role",
    "hours_worked",
    "hours_to_complete",
    "monday_work",
    "tuesday_work",
    "wednesday_work",
    "thursday_work",
    "friday_work",
    "planned_items",
  ];

  const handleChange = (key, value) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      toast.error("Invalid date format. Please select valid dates.");
      return false;
    }

    if (start > end) {
      toast.error("End Date cannot be earlier than Start Date. Please select a valid date range.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > today) {
      toast.error("You cannot select a future week. Please select a current or previous week.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    // if (!validateDateRange(formData.week_start_date, formData.week_end_date)) {
    //   return;
    // }

    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length) return;

    setLoading(true);

    let payload = {
      action: "submit",
      primary_email: user.email,
      ...formData,
    };

    if (editingReportId) {
      payload.update_existing = true;
      payload.merge_existing = true;
    }

    if (editingReportId) {
      payload.report_id = editingReportId;
    }

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setLoading(false);
        toast.success(res.message);
        getreports();
        setFormData({ ...defaultValues });
        setActiveTab(2);
        setEditingReportId(null);
        setAllowedEndDate(null);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleEditReport = (report) => {
    try {
      const mondayDate = new Date(report.week_start_date);

      if (isNaN(mondayDate)) {
        return;
      }

      const rawStart = report.week_start_date;
      const rawEnd = report.week_end_date;

      let editConfirmMessage = `Are you sure you want to update the report for the period <b class="fw-bold"> ${rawStart} to ${rawEnd}? </b> Do you wish to proceed?`;

      reportMessages.editConfirmMessage = editConfirmMessage;
      setreportMessages(reportMessages);
      setAllowedEndDate(getFridayFromMonday(mondayDate));
      setReportToEdit(report);
      setShowEditConfirm(true);
    } catch (error) {
      toast.error("Error editing report: Invalid date format");
    }
  };

  const handleDeleteReport = (reportId) => {
    setReportToDelete(reportId);
    setShowDeleteConfirm(true);
  };

  const confirmEdit = () => {
    setShowEditConfirm(false);
    setActiveTab(1);

    const transformedData = {
      report_id: reportToEdit.report_id,
      week_start_date: reportToEdit.week_start_date,
      week_end_date: reportToEdit.week_end_date,
      hours_to_complete: parseFloat(reportToEdit.hours_to_complete).toString(),
      hours_worked: parseFloat(reportToEdit.hours_worked).toString(),
      monday_work: reportToEdit.daily_work?.monday || "",
      tuesday_work: reportToEdit.daily_work?.tuesday || "",
      wednesday_work: reportToEdit.daily_work?.wednesday || "",
      thursday_work: reportToEdit.daily_work?.thursday || "",
      friday_work: reportToEdit.daily_work?.friday || "",
      accomplishments: reportToEdit.accomplishments || "",
      planned_items: reportToEdit.planned_items || "",
      issues: reportToEdit.issues || "",
      comments: reportToEdit.additional_comments || "",
      project_name: reportToEdit.project_name || "",
      client_name: reportToEdit.client_name || "",
      project_role: reportToEdit.project_role || "",
    };

    setFormData(transformedData);
    setEditingReportId(reportToEdit.report_id);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    deleteReport(reportToDelete);
  };

  const deleteReport = (reportId) => {
    setLoading(true);
    const payload = {
      action: "delete",
      email: user?.email,
      report_id: reportId,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setLoading(false);
        toast.success(res.message);
        getreports();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.error || err?.message || "Failed to delete report");
      });
  };

  const handleDateChange = (key, date) => {
    const formatted = formatDateToET(date);

    if (key == "week_start_date") {
      const monday = new Date(date);
      if (isNaN(monday)) {
        toast.error("Invalid date selected");
        return;
      }
      const friday = getFridayFromMonday(monday);

      if (!validateDateRange(formatted, formatDateToET(friday))) {
        return;
      }

      setAllowedEndDate(friday);
      const newFormData = {
        ...formData,
        week_start_date: formatted,
        week_end_date: formatDateToET(friday),
      };

      setFormData(newFormData);
    } else if (key === "week_end_date") {
      if (allowedEndDate && date.getTime() !== allowedEndDate.getTime()) {
        toast.error("Please select the Friday corresponding to the selected Monday.");
        return;
      }

      const newFormData = { ...formData, week_end_date: formatted };

      if (!validateDateRange(formData.week_start_date, formatted)) {
        return;
      }

      setFormData(newFormData);
    } else {
      if (formData.week_start_date && formData.week_end_date) {
        const selectedDate = new Date(date);
        const startDate = new Date(formData.week_start_date);
        const endDate = new Date(formData.week_end_date);

        if (isNaN(selectedDate) || selectedDate < startDate || selectedDate > endDate) {
          toast.error("Please select a date within the selected week (Monday to Friday).");
          return;
        }
      }

      setFormData({ ...formData, [key]: formatted });
    }
  };

  const tabsArray = [
    {
      id: 1,
      title: "Submit Report",
      bodyTitle: "Weekly Status Report Form",
      description: "Fill out your weekly status report for the current week (Monday-Friday).",
      cssIcon: "report-filled",
      renderData: () => renderTab1Data(),
    },
    {
      id: 2,
      title: "View Reports",
      bodyTitle: "Previous Weekly Status Reports",
      description: "View and download your previously submitted weekly status reports.",
      googleicon: "visibility",
      renderData: () => renderTab2Data(),
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);
  const isViewPage = activeTab == 2;

  const renderInput = (label, key, placeholder, type = "text") => (
    <div className="mb-3">
      <label htmlFor={"uid" + uniqueId + key} className="form-label">
        {label}
      </label>
      <input
        type={type}
        style={{ boxShadow: "unset" }}
        value={formData[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="form-control hovercolor"
        id={"uid" + uniqueId + key}
        placeholder={placeholder}
      />
      {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
    </div>
  );

  const renderDateInput = (label, key, dayFilter = "") => {
    const filterDate = (date) => {
      if (!dayFilter) return true;
      if (key === "week_end_date" && allowedEndDate) {
        return date.getTime() === allowedEndDate.getTime();
      }
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const selectedDay = dayNames[date.getDay()];
      return selectedDay === dayFilter;
    };

    return (
      <div className="mb-3 w-100">
        <label htmlFor={"uid" + uniqueId + key} className="form-label">
          {label}
        </label>
        <DatePicker
          maxDate={"2099"}
          showYearDropdown
          showMonthDropdown
          showIcon
          calendarIconClassName="calenderIconRight"
          toggleCalendarOnIconClick
          scrollableYearDropdown
          yearDropdownItemNumber={80}
          selected={pickDateOnly(formData[key])}
          onChange={(date) => handleDateChange(key, date)}
          dateFormat="MM/dd/yyyy"
          className="form-control ps-2 w-100"
          style={{ boxShadow: "unset" }}
          placeholderText="MM/DD/YYYY"
          id={"uid" + uniqueId + key}
          filterDate={filterDate}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderTextArea = (label, key, placeholder) => (
    <div className="mb-3 w-100">
      <label htmlFor={"uid" + uniqueId + key} className="form-label">
        {label}
      </label>
      <textarea
        rows={3}
        style={{ resize: "none", boxShadow: "unset", border: "1px solid #d5d5d5" }}
        value={formData[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="form-control hovercolor"
        id={"uid" + uniqueId + key}
        placeholder={placeholder}
      />
      {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
    </div>
  );

  const renderCreateForm = () => (
    <div className="mt-4">
      <div className={styles.gridContainer}>
        {renderDateInput("Week Start Date (Monday)", "week_start_date", "Monday")}
        {renderDateInput("Week End Date (Friday)", "week_end_date", "Friday")}

        {renderInput("Project Name", "project_name", "Project name")}
        {renderInput("Client Name", "client_name", "Client name")}
        {renderInput("Project Role", "project_role", "Project role")}

        {renderInput("Hours Worked This Week", "hours_worked", "Hours worked this week", "number")}
        {renderInput("Estimated Hours to Complete", "hours_to_complete", "Estimated hours to complete", "number")}
      </div>

      <div className="d-flex justify-content-between align-items-center my-2 mb-4 gap-3 flex-wrap">
        <div className="h5 mt-4 themeColor mb-3">Daily Work Description (Monday-Friday)</div>
        <div className="themeButton ms-auto" onClick={() => setAiModal(formData)}>
          <img src={addAI} style={{ height: "16px" }} />
          <span> Generate with AI</span>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {renderTextArea("Monday", "monday_work", "Work completed on Monday")}
        {renderTextArea("Tuesday", "tuesday_work", "Work completed on Tuesday")}
        {renderTextArea("Wednesday", "wednesday_work", "Work completed on Wednesday")}
        {renderTextArea("Thursday", "thursday_work", "Work completed on Thursday")}
        {renderTextArea("Friday", "friday_work", "Work completed on Friday")}
        {renderTextArea(
          "Accomplishments for this Period",
          "accomplishments",
          "List your key accomplishments for this week"
        )}
        {renderTextArea("Planned Items for Next Period", "planned_items", "List your planned items for next week")}
        {renderTextArea("Issues/Blockers (Optional)", "issues", "List any issues or blockers you are facing")}
        {renderTextArea("Additional Comments (Optional)", "comments", "Any additional comment")}
      </div>
      <div className="d-flex justify-content-end mt-4 pt-3 gap-3">
        <div
          className="themeButtonoutline"
          onClick={() => {
            setReportToEdit(null);
            setReportToDelete(null);
            setErrors({});
            setFormData({ ...defaultValues });
            setEditingReportId(null);
            setAllowedEndDate(null);
          }}
        >
          <span className="material-symbols-outlined mb-1">close</span>
          Cancel
        </div>

        {loading ? (
          <div className="themeButton" style={{ height: "56px" }}>
            <div className="spinner-border text-light spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="themeButton" onClick={handleSubmit}>
            <span className="material-symbols-outlined mb-1">save</span>
            {editingReportId ? "Update " : "Submit "} Weekly Status
          </div>
        )}
      </div>
    </div>
  );

  const renderTab1Data = () => (
    <div>
      {bodyHeader()}
      {renderCreateForm()}
    </div>
  );

  const renderTab2Data = () => (
    <div>
      {bodyHeader()}
      {renderTable()}
    </div>
  );

  const bodyHeader = () => (
    <div className="mb-3">
      <div className={`d-flex align-items-center gap-2 pointer h4 ${styles.bodyHeaer}`}>
        {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
        {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>}
        <div>{currentTab.bodyTitle}</div>
      </div>
      <div className="font12 fontgray">{currentTab.description}</div>
    </div>
  );

  const rendertabsData = () => (
    <div className="d-flex gap-3 w-100 py-2 justify-content-between align-items-center">
      <div className="d-flex gap-3 w-100 py-2">
        {tabsArray.map((card) => (
          <div
            key={card.id}
            className={`${styles.headerButtons} ${
              activeTab === card.id ? styles.activeTab : ""
            } d-flex justify-content-center gap-2 pointer`}
            onClick={() => {
              if (activeTab !== card.id) {
                setReportToEdit(null);
                setReportToDelete(null);
                setActiveTab(card.id);
                setErrors({});
                setFormData({ ...defaultValues });
                setEditingReportId(null);
                setAllowedEndDate(null);
              }
            }}
          >
            <div>
              {card.googleicon && <span className="material-symbols-outlined">{card.googleicon}</span>}
              {card.cssIcon && <span className={card.cssIcon}></span>}
            </div>
            <div>{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );

  function formatToMMDDYYYY(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0"
    )}-${date.getFullYear()}`;
  }

  const renderTable = () => {
    if (placeholder) return <Placeholder.Paragraph active />;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const filteredData = data.slice(start, end);

    return (
      <div className={`table-responsive nowrap ${styles.table}`}>
        <table className="table table-borderless table-hover align-middle">
          <thead>
            <tr className={`${styles.lightColor} ${styles.tableHead}`}>
              <th>
                <div className={styles.th}>
                  <span className="material-symbols-outlined">calendar_today</span>Week Period
                </div>
              </th>
              <th>
                <div className={`${styles.th} align-items-center`}>
                  <img src={visa_status} className="mb-1" />
                  Project
                </div>
              </th>
              <th>
                <div className={`${styles.th} justify-content-center align-items-center`}>
                  <img src={list} className="mb-1" />
                  Status
                </div>
              </th>
              <th>
                <div className={styles.th}>
                  <span className="material-symbols-outlined">calendar_month</span>Submitted On
                </div>
              </th>
              <th>
                <div className={`${styles.th} justify-content-center`}>
                  <span className="material-symbols-outlined">action_key</span>
                  <div>Action</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="themeColor fw-bold">
                  {item.week_start_date} to {item.week_end_date}
                </td>
                <td>{item.project_name}</td>
                <td>
                  <div className={`${styles.statusbox} ${styles[item.status]} mx-auto d-flex justify-content-center`}>
                    <div className={styles.dot}></div>
                    <span>{item.status}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className={`${styles.dot} ${styles.dotred}`}></div>
                    <div style={{ color: "#be2b29" }}>{formatToMMDDYYYY(item.submitted_on)}</div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span
                      title="View"
                      onClick={() => downloadDocument(item.report_id, true)}
                      className={`material-symbols-outlined outlineIcon pointer`}
                    >
                      visibility
                    </span>
                    {docLoader === item.report_id ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className={`d-flex align-items-center justify-content-center`} style={{ height: "34px" }}>
                          <div className="spinner-border text-light spinner-border-sm p-1" role="status" />
                        </div>
                      </div>
                    ) : (
                      <span
                        onClick={() => downloadDocument(item.report_id)}
                        className={`material-symbols-outlined outlineIcon pointer`}
                      >
                        download
                      </span>
                    )}
                    <span
                      onClick={() => handleEditReport(item)}
                      className={`material-symbols-outlined outlineIcon pointer`}
                      style={{ fontSize: "22px" }}
                    >
                      edit
                    </span>
                    <span
                      onClick={() => {
                        const rawStart = item.week_start_date;
                        const rawEnd = item.week_end_date;
                        let deleteConfirmMessage = `Are you sure you want to delete <b class="fw-bold"> ${rawStart} to ${rawEnd} </b> record? This cannot be undone.`;
                        reportMessages.deleteConfirmMessage = deleteConfirmMessage;
                        setreportMessages(reportMessages);

                        handleDeleteReport(item.report_id);
                      }}
                      className={`material-symbols-outlined outlineIcon pointer`}
                      style={{ fontSize: "22px" }}
                    >
                      delete
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CustomPagination
          data={data}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    );
  };

  const downloadDocument = (docId, isView) => {
    if (isView) {
      setloader(true);
    } else {
      setDocLoader(docId);
    }

    const payload = {
      action: "get_report",
      email: user?.email,
      report_id: docId,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setDocLoader(false);

        const fileData = res.download;
        if (!fileData) return;
        if (isView) {
          setShowPDF(fileData);
          return;
        }
        const byteCharacters = atob(fileData.base64_content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileData.file_name || "download.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        setDocLoader(false);
      })
      .finally(() => {
        setloader(false);
      });
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2">Weekly Status Report</h2>
              <p className="mb-0">Submit and view your weekly status reports.</p>
            </div>
            {isViewPage ? (
              <div className="d-flex align-items-center gap-3">
                <SearchBox placeholder="Search by project..." value={searchValue} onChange={setSearchValue} />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="px-0 px-md-3 pt-3">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              {rendertabsData()}
            </div>
          </div>
        </div>
        <div className={`${styles.bodycontainer}`}>{currentTab.renderData()}</div>
        <AiModal
          show={aiModal}
          setshow={setAiModal}
          callback={(val) => {
            setFormData({ ...formData, ...val });
          }}
        />
        <Confirm
          show={showEditConfirm}
          result={(status) => {
            if (status) {
              confirmEdit();
            }
            setShowEditConfirm(false);
          }}
          onClose={() => setShowEditConfirm(false)}
          onConfirm={confirmEdit}
          title={reportMessages.editConfirmTitle}
          text={reportMessages.editConfirmMessage}
          deleteTitle={reportMessages.editConfirmYes}
        />
        <Confirm
          show={showDeleteConfirm}
          result={(status) => {
            if (status) {
              confirmDelete();
            }
            setShowDeleteConfirm(false);
          }}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title={reportMessages.deleteConfirmTitle}
          text={reportMessages.deleteConfirmMessage}
          deleteTitle={reportMessages.deleteConfirmDelete}
        />
        {showPDF?.base64_content ? (
          <OverlayModal isActive={showPDF?.base64_content} onClose={() => setShowPDF(false)}>
            <FilePreview
              docObject={{ file_extension: "application/pdf", file_name: showPDF?.file_name }}
              base64File={showPDF?.base64_content || ""}
              setBase64File={setShowPDF}
              fileType="application/pdf"
              setFileType={() => {}}
            />
          </OverlayModal>
        ) : (
          <></>
        )}
      </div>
      <ThemeLoader show={loading || placeholder || loader} />
    </div>
  );
}

export default Weeklytimesheet;
