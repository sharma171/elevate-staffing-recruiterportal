import { useEffect, useState } from "react";
import { Confirm, CustomPagination, SearchBox, ThemeLoader } from "../../../components";
import styles from "./Timesheet.module.css";
import images from "../../../assets/images/new";
import { useAuth } from "../../../authContext";
import api from "../../../networking/api";
import { toast } from "react-toastify";
import AddModal from "./AddModal";
import { Placeholder } from "rsuite";
import { pickDateOnly } from "../../../helpers/StrHelpers";
import FilePreview from "../../benchcandidate/FilePreview";
import OverlayModal from "../../../components/OverlayModal";

const { list, clockhours } = images;

function Monthlytimesheets() {
  const [searchValue, setSearchValue] = useState();
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loader, setloader] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [setDeleteModal, setsetDeleteModal] = useState(false);
  const [allMonths, setAllMonths] = useState([]);
  const [showPDF, setShowPDF] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!searchValue || String(searchValue).trim() === "") {
      setData(apiData);
      setCurrentPage(1);
      return;
    }

    setCurrentPage(1);
    const qRaw = String(searchValue).trim();
    const q = qRaw.toLowerCase();

    const digitsOnly = qRaw.replace(/\D/g, "");
    const qCompact = q.replace(/\s+/g, "");

    const filtered = apiData.filter((item) => {
      const monthKey = item?.month || "";
      const formattedMonth = formatMonthYear(monthKey).toLowerCase();
      if (formattedMonth.includes(q)) return true;
      if (monthKey.includes(digitsOnly) && digitsOnly.length > 0) return true;
      if (formattedMonth.replace(/\s+/g, "").includes(qCompact)) return true;
      // fallback: check other visible fields
      const otherMatch = ["start_date", "end_date", "hours", "total_hours", "submitted_on", "status"].some((k) => {
        const val = item?.[k];
        return val && String(val).toLowerCase().includes(q);
      });
      if (otherMatch) return true;

      return Object.keys(item).some((k) => {
        const v = item[k];
        return typeof v === "string" && v.toLowerCase().includes(q);
      });
    });

    setData(filtered);
  }, [searchValue, apiData]);

  useEffect(() => {
    getTimesheets();
  }, [user?.email]);

  function sortByMonthDesc(data) {
    if (!Array.isArray(data)) return data;
    const months = [];
    let newData = [...data].sort((a, b) => {
      const aMonth = a?.month;
      const bMonth = b?.month;
      months.push(aMonth, bMonth);
      if (typeof aMonth !== "string" || typeof bMonth !== "string") return 0;
      if (!/^\d{6}$/.test(aMonth) || !/^\d{6}$/.test(bMonth)) return 0;
      const aKey = aMonth.slice(2) + aMonth.slice(0, 2);
      const bKey = bMonth.slice(2) + bMonth.slice(0, 2);
      return bKey.localeCompare(aKey);
    });
    let allMonthsdata = [...new Set(months)];
    setAllMonths(allMonthsdata);
    return newData;
  }

  const getTimesheets = () => {
    if (!user?.email) return;
    let payload = {
      primary_email: user?.email,
      task: "fetch_timesheets",
    };
    setLoading(true);
    api
      .getTimesheets(payload)
      .then((res) => {
        setLoading(false);
        let newData = sortByMonthDesc(res?.timesheets) || [];
        setData(newData);
        setApiData(newData);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const deleteTimesheet = (data) => {
    let payload = {
      action: "delete",
      document_id: data.document_id,
      primary_email: user?.email,
    };

    setLoading(true);
    api
      .createTimesheet(payload, { action: "delete" }, "/submit_timesheet")
      .then((res) => {
        setLoading(false);
        toast.success(res?.message || "Timesheet deleted successfully.");
        getTimesheets();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.error || err?.response?.data?.error);
        console.log(err);
      });
  };

  const downloadtimesheet = (docId, isView) => {
    const payload = {
      primary_email: user?.email,
      task: "download_timesheets",
      document_ids: [docId],
    };

    if (isView) {
      setloader(true);
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
        setloader(false);
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

  const formatMonthYear = (input) => {
    if (!/^\d{6}$/.test(input)) return input;
    const month = parseInt(input.slice(0, 2), 10) - 1;
    const year = input.slice(2);
    const date = new Date(year, month);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

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
        const capitalizeStatus = item.status.charAt(0).toUpperCase() + item.status.slice(1);

        return (
          <tr key={index}>
            <td className="themeColor fw-bold">{formatMonthYear(item.month)}</td>
            <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.start_date)}</td>
            <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.end_date)}</td>
            <td>
              <div className="d-flex gap-2 align-items-center ps-1" style={{ color: "#454545" }}>
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
                <div className={`capitalize ${styles.statusbox} ${styles[capitalizeStatus]} d-flex`}>
                  <div className={`${styles.dot}`}></div>
                  <span>{item.status}</span>
                </div>
              </td>
            ) : (
              <></>
            )}
            <td>
              <div className="d-flex gap-2 align-items-center justify-content-center">
                <div className="text-center">
                  <span
                    title="View"
                    onClick={() => {
                      downloadtimesheet(item.document_id, true);
                    }}
                    class={`material-symbols-outlined outlineIcon pointer`}
                  >
                    visibility
                  </span>
                </div>

                <div className="text-center">
                  {docLoader == item.document_id ? (
                    <div className={`d-flex align-items-center justify-content-center`}>
                      <div className={`d-flex align-items-center justify-content-center`} style={{ height: "34px" }}>
                        <div className={"spinner-border text-dark spinner-border-sm p-1"} role="status" />
                      </div>
                    </div>
                  ) : (
                    <span
                      title="Download"
                      onClick={() => {
                        downloadtimesheet(item.document_id);
                      }}
                      class={`material-symbols-outlined outlineIcon pointer`}
                    >
                      download
                    </span>
                  )}
                </div>

                <div>
                  <span
                    title="Edit"
                    style={showEditIcon ? {} : { color: "#9AABC2", cursor: "not-allowed" }}
                    onClick={() => {
                      if (showEditIcon) {
                        setEditData(item);
                        setShowForm(true);
                      }
                    }}
                    class="material-symbols-outlined fs-5 pointer outlineIcon"
                  >
                    edit
                  </span>
                </div>

                <div>
                  <span
                    title="Delete"
                    style={showEditIcon ? {} : { color: "#9AABC2", cursor: "not-allowed" }}
                    onClick={() => {
                      if (showEditIcon) {
                        setsetDeleteModal(item);
                      }
                    }}
                    class="material-symbols-outlined fs-5 pointer outlineIcon"
                  >
                    delete
                  </span>
                </div>
              </div>
            </td>
          </tr>
        );
      });
    };

    return (
      <div className={`table-responsive nowrap ${styles.table}`}>
        <table className="table table-borderless table-hover align-middle">
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
                  <div className={`${styles.th}`}>
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
    <div className="d-flex gap-3 w-100 py-2 justify-content-between align-items-center">
      <div className="d-flex gap-3 w-100 py-2">
        {tabsArray.map((card) => (
          <div
            key={card.id}
            className={`${styles.headerButtons} ${
              activeTab === card.id ? styles.activeTab : ""
            } d-flex justify-content-center gap-2 pointer`}
            onClick={() => {
              setCurrentPage(1);
              setActiveTab(card.id);
            }}
          >
            <div style={{ paddingTop: "2px" }}>
              {card.googleicon && <span className="material-symbols-outlined">{card.googleicon}</span>}
              {card.cssIcon && <span className={card.cssIcon}></span>}
            </div>
            <div style={{ paddingTop: "2px" }}>{card.title}</div>
          </div>
        ))}

        <div className="d-flex ms-auto justify-content-end w-100">
          <div
            className={`${styles.headerButtons} ${styles.activeTab} d-flex align-items-center gap-2 pointer`}
            onClick={() => setShowForm(true)}
          >
            <span class="material-symbols-outlined mb-1">upload</span>
            Submit Monthly Timesheet
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2">Timesheets</h2>
              <p className="mb-0">Submit and manage your monthly timesheets</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox placeholder="Search by month..." value={searchValue} onChange={setSearchValue} />
            </div>
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

        <div className={`${styles.bodycontainer} mt-3`}>
          <div className="card-body">
            <div className="d-flex flex-column mb-3">
              <div className="card-title h4 themeColor d-flex align-items-center gap-1 mb-0">
                Timesheet Instructions
              </div>
              <div className="fontgray">Guidelines for submitting your monthly timesheets</div>
            </div>

            <div className={`${styles.subcard} d-flex gap-3`}>
              <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                <span class="material-symbols-outlined">calendar_month</span>{" "}
              </div>
              <div>
                <div className={styles.subcardheading}>Submission Deadline</div>
                <div className="fontgray">Submit your timesheet by the last day of each month.</div>
              </div>
            </div>

            <div className={`${styles.subcard} d-flex gap-3`}>
              <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                <span class="material-symbols-outlined">
                  <span class="material-symbols-outlined">content_copy</span>
                </span>
              </div>
              <div>
                <div className={styles.subcardheading}>Required Format</div>
                <div className="fontgray">
                  Timesheets should be in PDF, Excel, or image format and clearly show daily hours for the entire month.
                </div>
              </div>
            </div>

            <div className={`${styles.subcard} d-flex gap-3`}>
              <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                <span class="material-symbols-outlined">verified</span>{" "}
              </div>
              <div>
                <div className={styles.subcardheading}>Approval Process</div>
                <div className="fontgray">
                  Timesheets are typically approved within 5 business days after submission.
                </div>
              </div>
            </div>

            <div className={`${styles.subcard} d-flex gap-3`}>
              <div className={`${styles.subCardIcon} ${styles.iconBlue}`}>
                <span class="material-symbols-outlined">help</span>{" "}
              </div>
              <div>
                <div className={styles.subcardheading}>Need Help?</div>
                <div className="fontgray">
                  Contact your HR representative if you have any questions about timesheets.
                </div>
              </div>
            </div>
          </div>
        </div>
        <AddModal
          allMonthsData={allMonths}
          show={showForm}
          update={getTimesheets}
          edit={editData}
          setShow={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      </div>
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
          setDeleteModal.month
        )}</b> timesheet record? This action cannot be undone.`}
      />
      <ThemeLoader show={loading || loader} />
    </div>
  );
}

export default Monthlytimesheets;
