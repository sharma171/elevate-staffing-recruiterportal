import React, { useEffect, useState } from "react";
import { axiosApi, Confirm, CustomPagination, ThemeLoader } from "../../components";
import styles from "../employee/monthlytimesheet/Timesheet.module.css";
import images from "../../assets/images/new";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { Placeholder } from "rsuite";
import { pickDateOnly } from "../../helpers/StrHelpers";
import { toast } from "react-toastify";
import { CircleCheckBig, CircleX, PlusIcon } from "lucide-react";
import AddModal from "../employee/monthlytimesheet/AddModal";
import FilePreview from "../benchcandidate/FilePreview";

const { list, clockhours } = images;

const getStatusStyle = (status) => {
  const baseStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "0.25rem 0.75rem",
    borderRadius: "5px",
    textTransform: "capitalize",
    width: "fit-content",
    margin: "0 auto",
  };

  switch (status.toLowerCase()) {
    case "approved":
      return {
        ...baseStyle,
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    case "rejected":
      return {
        ...baseStyle,
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      };
    case "pending":
      return {
        ...baseStyle,
        backgroundColor: "#fef9c3",
        color: "#92400e",
      };
    case "reviewing":
      return {
        ...baseStyle,
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: "#e5e7eb",
        color: "#374151",
      };
  }
};

function MonthlyTimesheetDefaultView({ candidateDetails, disabled }) {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [setDeleteModal, setsetDeleteModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [allMonths, setAllMonths] = useState([]);
  const [showPDF, setShowPDF] = useState(false);

  const { user } = useAuth();
  const user_Email = candidateDetails?.original_email || candidateDetails?.primary_email;

  const EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    getTimesheets();
  }, [user_Email]);

  function sortByMonthDesc(data) {
    if (!Array.isArray(data)) return data;

    const months = [];

    let newData = [...data].sort((a, b) => {
      const aMonth = a?.month;
      const bMonth = b?.month;
      months.push(aMonth, bMonth);

      if (typeof aMonth !== "string" || typeof bMonth !== "string") return 0;
      if (!/^\d{6}$/.test(aMonth) || !/^\d{6}$/.test(bMonth)) return 0;

      const aKey = aMonth.slice(2) + aMonth.slice(0, 2); // "YYYYMM"
      const bKey = bMonth.slice(2) + bMonth.slice(0, 2);

      return bKey.localeCompare(aKey);
    });

    let allMonthsdata = [...new Set(months)];

    setAllMonths(allMonthsdata);

    return newData;
  }

  const getTimesheets = () => {
    if (!user_Email) return;
    let payload = {
      employer_email: user?.email,
      filters: { employee_email: user_Email },
      task: "fetch_timesheets_employer",
    };
    setLoading(true);
    api
      .getTimesheets(payload)
      .then((res) => {
        setLoading(false);
        let newData = sortByMonthDesc(res?.timesheets) || [];
        setData(newData);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const deleteTimesheet = (data) => {
    let payload = {
      action: "delete_employer",
      document_id: data.document_id,
      primary_email: user_Email,
      employer_email: user?.email,
    };

    setLoading(true);
    api
      .createTimesheet(payload, { action: "delete_employer" }, "/submit_timesheet")
      .then((res) => {
        setLoading(false);
        toast.success(res?.message || "Timesheet deleted successfully.");
        getTimesheets();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err, "err");
        toast.error(err?.error || err?.response?.data?.error);
      });
  };

  const downloadtimesheet = (docId, isView) => {
    const payload = {
      employer_email: user?.email,
      primary_email: user_Email,
      task: "download_timesheets_employer",
      document_ids: [docId],
    };

    if (isView) {
      setLoader(true);
    } else {
      setDocLoader(docId);
    }

    api
      .getTimesheets(payload)
      .then((res) => {
        setDocLoader(false);
        const fileData = res?.files?.[0];
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
        console.log(err);
      })
      .finally(() => {
        setLoader(false);
        setDocLoader(false);
      });
  };

  const approveRejectTimesheet = (data, task = "approve") => {
    let payload = {
      task: "reject_timesheet",
      manager_email: EMPLOYER_EMAIL,
      document_id: data.document_id,
      employee_email: user_Email,
      rejection_details: {
        status: "rejected",
        rejection_reason: "Timesheet rejected by manager",
        rejection_comments: "Please review and resubmit with corrections",
        rejected_by: "Manager",
      },
    };

    if (task == "approve") {
      payload = {
        task: "approve_timesheet",
        manager_email: EMPLOYER_EMAIL,
        document_id: data.document_id,
        employee_email: user_Email,
        approval_details: {
          status: "approved",
          approved_hours: data?.total_hours,
          approval_comments: "Timesheet approved via dashboard",
          approved_by: "Manager",
          auto_generate_invoice: true,
          vendor_assignment_id: data?.vendor_assignment?.assignment_id,
        },
      };
    }

    setLoading(true);
    axiosApi
      .post("https://view-download-timesheets-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.log(err, "err err");
        toast.error(err?.response?.data?.error || err?.response?.data?.message);
      })
      .finally(() => {
        getTimesheets();
        setLoading(true);
      });
  };

  const tabsArray = [
    {
      id: 1,
      title: "All Timesheets",
      bodyTitle: "All Timesheets",
      description: "View all submitted timesheets and their status",
      cssIcon: "documents-fill",
      renderData: () => renderTab1Data(),
    },
    {
      id: 2,
      title: "Pending",
      bodyTitle: "Pending Timesheets",
      description: "View timesheets awaiting approval",
      googleicon: "schedule",
      renderData: () => renderTab2Data(),
    },
    {
      id: 3,
      title: "Approved",
      bodyTitle: "Approved Timesheets",
      description: "View all approved timesheets",
      googleicon: "verified",
      renderData: () => renderTab3Data(),
    },
    {
      id: 4,
      title: "Rejected",
      bodyTitle: "Rejected Timesheets",
      description: "View timesheets that were rejected",
      googleicon: "cancel",
      renderData: () => renderTab4Data(),
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);

  const formatMonthYear = (input) => {
    if (!/^\d{6}$/.test(input)) return input;
    const month = parseInt(input.slice(0, 2), 10) - 1;
    const year = input.slice(2);
    const date = new Date(year, month);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const bodyHeader = () => (
    <div className="d-flex justify-content-between gap-2 flex-wrap">
      <div className="mb-3">
        <div className={`d-flex align-items-center gap-2 pointer h4 ${styles.bodyHeaer}`}>
          {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
          {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>}
          <div>{currentTab.bodyTitle}</div>
        </div>
        <div className="font12 fontgray">{currentTab.description}</div>
      </div>
      {disabled ? (
        <></>
      ) : (
        <div className="mb-3">
          <div
            onClick={() => setShowForm(true)}
            className="d-flex rounded-1 align-items-center gap-2 p-2 px-3 themeButton themeButtonHover"
          >
            <PlusIcon /> Manual Timesheet Upload
          </div>
        </div>
      )}
    </div>
  );

  function formatToMMDDYYYY(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);
    if (isNaN(date)) return "";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  }

  const renderTable = (showStatus, status) => {
    if (loading) {
      return <Placeholder.Paragraph active />;
    }

    let newData = data;

    if (status) {
      newData = data.filter((item) => String(item.status).toLowerCase() == String(status).toLowerCase());
    }

    if (!newData.length) {
      return renderEmptyView(`No ${status || ""} Timesheets`, `You have no ${status} timesheets at the moment.`);
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const filteredData = newData.slice(start, end);

    const renderTableBody = () => {
      return filteredData.map((item, index) => {
        let showEditIcon = String(item.status)?.toLowerCase() !== "approved";
        // String(item.submission_type)?.toLowerCase() === "manual" && String(item.status)?.toLowerCase() !== "approved";

        return (
          <tr key={index}>
            <td>
              <div className="themeColor fw-bold">{formatMonthYear(item.month)}</div>
              <span className="fontgray font12 capitalize">
                {item.submission_type ? item.submission_type + " submission" : ""}{" "}
              </span>
            </td>
            <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.start_date)}</td>
            <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.end_date)}</td>
            <td>
              <div className="d-flex gap-2 align-items-center" style={{ color: "#454545" }}>
                <img src={clockhours} style={{ width: "20px" }} />
                {item.hours || item.total_hours}
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <div className={`${styles.dot} ${styles.dotred}`}></div>
                <div style={{ color: "#be2b29" }}>{pickDateOnly(item.submitted_on)}</div>
              </div>
            </td>
            {showStatus ? (
              <td>
                <div style={getStatusStyle(item.status)}>
                  <span>{item.status}</span>
                </div>
              </td>
            ) : (
              <></>
            )}
            <td>
              <div className={`${disabled ? "justify-content-center" : ""} d-flex gap-2 align-items-center`}>
                {disabled ? (
                  <></>
                ) : (
                  <span
                    title="Edit Timesheet"
                    // style={showEditIcon ? {} : { color: "#9AABC2", cursor: "not-allowed" }}
                    onClick={() => {
                      // if (showEditIcon) {
                      setEditData(item);
                      setShowForm(true);
                      // }
                    }}
                    class="material-symbols-outlined fs-5 pointer outlineIcon"
                  >
                    edit
                  </span>
                )}
                <span
                  title="View Timesheet"
                  onClick={() => {
                    downloadtimesheet(item.document_id, true);
                  }}
                  style={{ fontSize: "20px" }}
                  className={`material-symbols-outlined outlineIcon pointer`}
                >
                  visibility
                </span>
                <div className="text-center">
                  {docLoader == item.document_id ? (
                    <div className={`d-flex align-items-center justify-content-center`}>
                      <div className={`d-flex align-items-center justify-content-center`} style={{ height: "34px" }}>
                        <div className={"spinner-border text-dark spinner-border-sm p-1"} role="status" />
                      </div>
                    </div>
                  ) : (
                    <span
                      title="Download Timesheet"
                      onClick={() => {
                        downloadtimesheet(item.document_id);
                      }}
                      class={`material-symbols-outlined outlineIcon pointer`}
                    >
                      download
                    </span>
                  )}
                </div>
                {disabled ? (
                  <></>
                ) : (
                  <div>
                    <span
                      title="Delete Timesheet"
                      onClick={() => {
                        setsetDeleteModal(item);
                      }}
                      class="material-symbols-outlined fs-5 pointer outlineIcon"
                    >
                      delete
                    </span>
                  </div>
                )}
                {disabled ? (
                  <></>
                ) : (
                  <>
                    {item.status == "rejected" ? (
                      <></>
                    ) : item.status == "approved" ? (
                      <></>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => approveRejectTimesheet(item)}
                          type="button"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            whiteSpace: "nowrap",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            backgroundColor: "#16a34a",
                            color: "#fff",
                            border: "none",
                            transition: "background-color 0.2s",
                            height: "2.25rem",
                            borderRadius: "0.375rem",
                            padding: "0 0.75rem",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#15803d";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#16a34a";
                          }}
                        >
                          <CircleCheckBig size={16} style={{ marginRight: "0.25rem", flexShrink: 0 }} />
                          Approve
                        </button>

                        <button
                          onClick={() => approveRejectTimesheet(item, "Reject")}
                          type="button"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            whiteSpace: "nowrap",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            transition: "background-color 0.2s",
                            height: "2.25rem",
                            borderRadius: "0.375rem",
                            padding: "0 0.75rem",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc2626";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#ef4444";
                          }}
                        >
                          <CircleX size={16} style={{ marginRight: "0.25rem", flexShrink: 0 }} />
                          Reject
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      });
    };

    return (
      <div className={`table-responsive nowrap ${styles.table}`}>
        <table
          className={`table table-striped table-hover table-borderless align-middle ${styles.tableCustom}`}
          style={{ "--bs-table-striped-bg": "#f8f9fa" }}
        >
          <thead>
            <tr className={`${styles.lightColor} ${styles.tableHead}`}>
              <th>
                <div className={styles.th}>
                  <span class="material-symbols-outlined">calendar_today</span>
                  Month
                </div>
              </th>
              <th>
                <div className={styles.th}>
                  <span class="material-symbols-outlined">calendar_month</span>
                  Start Date
                </div>
              </th>
              <th>
                <div className={styles.th}>
                  <span class="material-symbols-outlined">calendar_month</span>
                  End Date
                </div>
              </th>
              <th>
                <div className={`${styles.th}`}>
                  <span class="hours-fill"></span>
                  Hours
                </div>
              </th>
              <th>
                <div className={styles.th}>
                  <span class="material-symbols-outlined">calendar_month</span>
                  Submitted On
                </div>
              </th>
              {showStatus ? (
                <th>
                  <div className={`${styles.th} justify-content-center`}>
                    <img src={list} />
                    Status
                  </div>
                </th>
              ) : (
                <></>
              )}
              <th>
                <div className={`${styles.th} justify-content-center`}>
                  <span className="material-symbols-outlined">action_key</span>
                  <div>Action</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>{renderTableBody()}</tbody>
        </table>
        <CustomPagination
          data={newData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    );
  };

  const renderEmptyView = (title = "Rejected Timesheets", text = "You  have any rejected timesheets", isred) => {
    return (
      <div className="py-5">
        <div className="d-flex align-items-center justify-content-center flex-column">
          <div className="">
            <span class="material-symbols-outlined" style={{ fontSize: "50px", color: isred ? "#D82A1E" : "#9AABC2" }}>
              error
            </span>
          </div>
          <div className={`h4 mt-2`}>{title}</div>
          <div className="black_description">{text}</div>
        </div>
      </div>
    );
  };

  const renderTab1Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(true)}
    </div>
  );

  function checkLastMonthExists(data, currentDate = new Date()) {
    const pad = (n) => (n < 10 ? `0${n}` : n);

    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthKey = `${pad(lastMonth.getMonth() + 1)}${lastMonth.getFullYear()}`;

    const exists = data.some((item) => item.month === lastMonthKey);

    if (!exists) {
      const monthName = lastMonth.toLocaleString("en-US", { month: "long" });
      return `${monthName} ${lastMonth.getFullYear()}`;
    }

    return null;
  }

  const renderTab2Data = () => {
    let checkExists = checkLastMonthExists(data);

    let isred = !!checkExists;
    let title = isred ? "Pending Timesheets" : "No Pending Timesheets";
    let message = isred
      ? `You have pending timesheets for ${checkExists}.`
      : "You don't have any timesheets waiting for approval at the moment";

    return (
      <div>
        {bodyHeader()}
        {renderEmptyView(title, message, isred)}
      </div>
    );
  };

  const renderTab3Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(false, "Approved")}
    </div>
  );
  const renderTab4Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(false, "Rejected")}
    </div>
  );

  const rendertabsData = () => (
    <div className="d-flex gap-4 bottomLineItems">
      {tabsArray.map((card) => (
        <div
          key={card.id}
          className={`lineItem ${activeTab === card.id ? "activeLineItem" : ""} pointer`}
          onClick={() => {
            setCurrentPage(1);
            setActiveTab(card.id);
          }}
        >
          <div>{card.title}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-100`}>
      <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 ps-0">
        {rendertabsData()}
      </div>
      <div>{currentTab.renderData()}</div>
      <Confirm
        title="Delete Timesheet"
        result={(res) => {
          if (res) {
            deleteTimesheet(setDeleteModal);
          }
          setsetDeleteModal(false);
        }}
        show={!!setDeleteModal}
        text={`Are you sure you want to delete the <b> ${formatMonthYear(
          setDeleteModal.month,
        )}</b> timesheet record? This action cannot be undone.`}
      />

      <AddModal
        allMonthsData={allMonths}
        show={showForm}
        update={getTimesheets}
        edit={editData}
        setShow={() => {
          setShowForm(false);
          setEditData(null);
        }}
        userEmail={user_Email}
      />

      <FilePreview
        docObject={{ file_extension: "application/pdf", file_name: showPDF?.file_name }}
        base64File={showPDF?.base64_content || ""}
        setBase64File={setShowPDF}
        fileType="application/pdf"
        setFileType={() => {}}
      />

      <ThemeLoader show={loading || loader} />
    </div>
  );
}

export default MonthlyTimesheetDefaultView;
