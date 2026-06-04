import React, { useEffect, useState } from "react";
import { axiosApi, Confirm, CustomPagination, ThemeLoader } from "../../components";
import styles from "../employee/monthlytimesheet/Timesheet.module.css";
import styles2 from "./css/timesheets.module.css";
import images from "../../assets/images/new";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { Placeholder, SelectPicker } from "rsuite";
import { pickDateOnly } from "../../helpers/StrHelpers";
import { toast } from "react-toastify";
import FilePreview from "../benchcandidate/FilePreview";
import {
  CircleCheckBig,
  CircleX,
  Download,
  Eye,
  FileText,
  Pen,
  Plus,
  PlusIcon,
  RefreshCcw,
  RotateCw,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import GenerateInvoice from "./GenerateInvoice";
import AddModal from "../employee/monthlytimesheet/AddModal";

const { list, clockhours } = images;

function Monthlytimesheets({ candidateDetails, disabled }) {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [setDeleteModal, setsetDeleteModal] = useState(false);
  const [deleteInvoiceModal, setDeleteInvoiceModal] = useState(false);
  const [showPaymentPDF, setShowPaymentPDF] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectVendorModal, setSelectVendorModal] = useState("");
  const [allVendors, setAllVendors] = useState([]);
  const [generateInvoiceModal, setGenerateInvoiceModal] = useState(false);
  const [selectedVenderDetails, setselectedVenderDetails] = useState(false);
  const [allInvoiceDetails, setAllInvoiceDetails] = useState(false);
  const [isResendMode, setisResendMode] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [allMonths, setAllMonths] = useState([]);

  const { user } = useAuth();
  let EMPLOYER_EMAIL = user?.email;

  let user_Email = candidateDetails?.original_email || candidateDetails?.primary_email;

  useEffect(() => {
    if (user_Email) {
      getTimesheets();
      getAllVendors();
    }
  }, [user_Email]);

  // const getAllVendors = () => {
  //   const payload = {
  //     action: "get_all_vendors",
  //     employer_email: EMPLOYER_EMAIL,
  //     include_inactive: false,
  //   };

  //   setLoading(true);

  //   axiosApi
  //     .post("https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app/", payload)
  //     .then((res) => setAllVendors(Object.values(res.data.vendors)))
  //     .catch((err) => console.error(err))
  //     .finally(() => setLoading(false));
  // };

  const getAllVendors = () => {
    const payload = {
      action: "get_vendor_details",
      employer_email: EMPLOYER_EMAIL,
      include_inactive: false,
      employee_email: user_Email,
    };

    setLoader(true);

    axiosApi
      .post("https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => setAllVendors(Object.values(res.data.vendors)))
      .catch((err) => console.error(err))
      .finally(() => setLoader(false));
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

  const getInvoicePDF = (invoice, isSent) => {
    let invoiceId = invoice.invoice_id;
    const payload = {
      task: "get_invoice_pdf",
      invoice_id: invoiceId,
      employee_email: user_Email,
      employer_email: EMPLOYER_EMAIL,
    };
    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        if (isSent) {
          setShowPaymentPDF(response.data);
        } else {
          setAllInvoiceDetails(response.data);
          setselectedVenderDetails(invoice);
          setGenerateInvoiceModal(true);
        }
        console.log("getInvoiceBalance success:", response.data);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message);
        console.log("getInvoiceBalance error:", error.response ? error.response.data : error.message);
      })
      .finally(() => setLoader(false));
  };

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

  const invoiceVendorPicker = () => {
    if (!selectVendorModal) {
      return <></>;
    }

    return (
      <div className={`${styles2.overlay} hidemodalclosebtn`}>
        <div role="dialog" className={styles2.dialog}>
          <div className={styles2.header}>
            <h2 className={styles2.title}>Select Vendor for Invoice</h2>
            <p className={styles2.description}>
              Multiple active vendors found. Please select which vendor to generate the invoice for.
            </p>
          </div>

          <div className={styles2.content}>
            <div className={`${styles2.field}`}>
              <label htmlFor="vendor-select" className={styles2.label}>
                Vendor
              </label>
              <SelectPicker
                cleanable={false}
                className="vendor-select"
                menuClassName="vendor-select"
                data={allVendors.map((vendor) => ({
                  ...vendor,
                  label: vendor.company_name,
                  value: String(vendor.vendor_id),
                }))}
                value={String(selectedVendor?.vendor_id || "")}
                onChange={(value) => {
                  const selected = allVendors.find((v) => String(v.vendor_id) === value);
                  setSelectedVendor(selected);
                }}
                placeholder="Select a vendor"
                block
                renderMenuItem={(label, item) => {
                  let isPrimary = item?.assignment_details?.is_primary;
                  let hourly_rate = item?.assignment_details?.hourly_rate;
                  return (
                    <div className={`d-flex align-items-center gap-2`}>
                      <span>{item.label}</span>

                      {isPrimary ? (
                        <span className="primaryTag" style={{ fontSize: "10px", padding: "1px 10px" }}>
                          Primary
                        </span>
                      ) : (
                        ""
                      )}

                      {hourly_rate ? (
                        <span
                          style={{
                            color: "#606060",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        >
                          ${hourly_rate}/hr
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                }}
                renderValue={(value, item) => {
                  let isPrimary = item?.assignment_details?.is_primary;
                  let hourly_rate = item?.assignment_details?.hourly_rate;
                  return (
                    <div className="d-flex align-items-center gap-2 text-dark" style={{ minHeight: "23px" }}>
                      <span>{item?.label || "Select a vendor"}</span>
                      {isPrimary ? (
                        <span className="primaryTag" style={{ fontSize: "10px", padding: "1px 10px" }}>
                          Primary
                        </span>
                      ) : (
                        ""
                      )}
                      {hourly_rate ? (
                        <span
                          style={{
                            color: "#606060",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        >
                          ${hourly_rate}/hr
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            <div className={styles2.timesheet}>
              Generating invoice for timesheet:{" "}
              {String(selectVendorModal?.month).replace(/^(\d{2})(\d{2,4})$/, "$1/$2")} (
              {selectVendorModal?.total_hours}
              h)
            </div>
          </div>

          <div className={styles2.footer}>
            <button
              type="button"
              onClick={() => {
                setselectedVenderDetails(false);
                setSelectVendorModal(false);
              }}
              className={styles2.cancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles2.generate}
              onClick={() => {
                setselectedVenderDetails(selectVendorModal);
                setGenerateInvoiceModal(true);
                setSelectVendorModal(null);
              }}
              disabled={!selectedVendor}
            >
              Generate Invoice
            </button>
          </div>

          <button
            type="button"
            title="Close"
            onClick={() => setSelectVendorModal(false)}
            className={`generalButton ${styles2.close}`}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>
    );
  };

  const getTimesheets = () => {
    setAllInvoiceDetails(false);
    if (!user_Email) return;
    let payload = {
      primary_email: user_Email,
      task: "fetch_timesheets_employer",
      employer_email: EMPLOYER_EMAIL,
      filters: {
        employee_email: user_Email,
      },
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

  const deleteTimesheetInvoice = (data) => {
    let payload = {
      task: "delete_invoice",
      invoice_id: data.invoice_id,
      employer_email: EMPLOYER_EMAIL,
      employee_email: user_Email,
    };
    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app", payload)
      .then((res) => {
        setLoader(false);
        toast.success(res?.message || "Invoice deleted successfully.");
        getTimesheets();
      })
      .catch((err) => {
        setLoader(false);
        console.log(err, "err");
        toast.error(err?.error || err?.response?.data?.error);
      });
  };

  const deleteTimesheet = (data) => {
    let payload = {
      action: "delete_employer",
      document_id: data.document_id,
      primary_email: user_Email,
      employer_email: EMPLOYER_EMAIL,
    };

    setLoader(true);
    api
      .createTimesheet(payload, {}, "/submit_timesheet")
      .then((res) => {
        setLoader(false);
        toast.success(res?.message || "Timesheet deleted successfully.");
        getTimesheets();
      })
      .catch((err) => {
        setLoader(false);
        console.log(err, "err");
        toast.error(err?.error || err?.response?.data?.error);
      });
  };

  const downloadtimesheet = (docId, isView) => {
    const payload = {
      primary_email: user_Email,
      task: "download_timesheets_employer",
      employer_email: EMPLOYER_EMAIL,
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
        const fileData = res?.files?.[0];

        if (!fileData) return;

        if (isView) {
          setShowPaymentPDF({ pdf_preview: fileData });
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
        console.log(err);
      })
      .finally(() => {
        setLoader(false);
        setDocLoader(false);
      });
  };

  const tabsArray = [
    // {
    //   id: 1,
    //   title: "All Timesheets",
    //   bodyTitle: "All Timesheets",
    //   description: "View all submitted timesheets and their status",
    //   cssIcon: "documents-fill",
    //   renderData: () => renderTab1Data(),
    // },
    // {
    //   id: 2,
    //   title: "Pending",
    //   bodyTitle: "Pending Timesheets",
    //   description: "View timesheets awaiting approval",
    //   googleicon: "schedule",
    //   renderData: () => renderTab2Data(),
    // },
    // {
    //   id: 3,
    //   title: "Approved",
    //   bodyTitle: "Approved Timesheets",
    //   description: "View all approved timesheets",
    //   googleicon: "verified",
    //   renderData: () => renderTab3Data(),
    // },
    // {
    //   id: 4,
    //   title: "Rejected",
    //   bodyTitle: "Rejected Timesheets",
    //   description: "View timesheets that were rejected",
    //   googleicon: "cancel",
    //   renderData: () => renderTab4Data(),
    // },
  ];

  // const currentTab = tabsArray.find((tab) => tab.id === activeTab);
  const currentTab = {
    id: 1,
    title: "Timesheet Management",
    bodyTitle: "Timesheet Management",
    description: "Review and approve candidate timesheets",
    googleicon: "task_alt",
    renderData: () => renderTab1Data(),
  };

  const formatMonthYear = (input) => {
    if (!/^\d{6}$/.test(input)) return input;
    const month = parseInt(input.slice(0, 2), 10) - 1;
    const year = input.slice(2);
    const date = new Date(year, month);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const bodyHeader = () => (
    <div className="d-flex justify-content-between gap-2 flex-wrap">
      <div className="mb-2">
        <div
          className={`d-flex align-items-center gap-2 pointer h4 my-0 ${styles.bodyHeaer}`}
          style={{ color: "#000" }}
        >
          {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
          {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>}
          <div>{currentTab.bodyTitle}</div>
        </div>
        <div className="font12 fontgray my-0">{currentTab.description}</div>
      </div>
      {disabled ? (
        <></>
      ) : (
        <div className="mb-3 d-flex gap-2" style={{ height: "max-content" }}>
          <div
            onClick={() => setShowForm(true)}
            className="d-flex rounded-1 align-items-center gap-2 p-2 px-3 themeButton themeButtonHover"
          >
            <PlusIcon /> Manual Timesheet Upload
          </div>

          <div
            onClick={() => getTimesheets()}
            className="d-flex rounded-1 align-items-center gap-2 p-2 px-3 generalButton"
          >
            <RefreshCcw size={20} /> Refresh
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
      // newData = data.filter((item) => item.status == "status");
      newData = data.filter((item) => item.status == status);
    }

    if (!newData.length) {
      return renderEmptyView(`No ${status || ""} Timesheets`, `You have no ${status} timesheets at the moment.`);
    }

    // 1. Sort the data by submitted_on (Latest Date First)
    const sortedData = [...newData].sort((a, b) => {
      const dateA = a.submitted_on ? new Date(a.submitted_on).getTime() : 0;
      const dateB = b.submitted_on ? new Date(b.submitted_on).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    // 2. Slice the sorted data for pagination
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const filteredData = sortedData.slice(start, end);

    const getStatusStyle = (status) => {
      const baseStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.875rem",
        fontWeight: 500,
        padding: "0.25rem 0.75rem",
        borderRadius: "50px",
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

    const renderTableBody = () => {
      return filteredData.map((item, index) => {
        let isPendingStatus = item?.invoice_status == "queued";

        let showEditIcon = String(item.status)?.toLowerCase() !== "approved";
        // String(item.submission_type)?.toLowerCase() === "manual" && String(item.status)?.toLowerCase() !== "approved";
        let isSent = item?.sent_on;
        let isDeleted = item.invoice_status == "deleted";
        let isActiveInvoice = item.invoice_number && !isDeleted;

        let isSentViaSystem = isSent && item?.send_method != "external";

        return (
          <tr key={index}>
            <td>
              <div className="themeColor fw-bold">{formatMonthYear(item.month)}</div>
              <span className="fontgray font12 capitalize">
                {item.submission_type ? item.submission_type + " submission" : ""}{" "}
              </span>
            </td>
            {/* <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.start_date)}</td>
            <td style={{ color: "#9A00C1" }}>{pickDateOnly(item.end_date)}</td> */}
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
                    style={isSent ? { color: "#9AABC2", cursor: "not-allowed" } : {}}
                    onClick={() => {
                      if (!isSent) {
                        setEditData(item);
                        setShowForm(true);
                      }
                    }}
                    className="material-symbols-outlined fs-5 pointer outlineIcon"
                  >
                    edit
                  </span>
                )}
                <div className="text-center">
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
                      title="Download Timesheet"
                      onClick={() => {
                        downloadtimesheet(item.document_id);
                      }}
                      className={`material-symbols-outlined outlineIcon pointer`}
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
                      style={isSent ? { color: "#9AABC2", cursor: "not-allowed" } : {}}
                      title="Delete Timesheet"
                      onClick={() => {
                        if (!isSent) {
                          setsetDeleteModal(item);
                        }
                      }}
                      className="material-symbols-outlined fs-5 pointer outlineIcon"
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
                      <>
                        <div className="d-flex gap-2">
                          <div>
                            <div
                              onClick={() => {
                                if (item.invoice_number) {
                                  getInvoicePDF(item, isSent);
                                } else {
                                  setSelectedVendor("");
                                  setselectedVenderDetails(false);
                                  setSelectVendorModal(item);
                                }
                              }}
                              className="text-center d-flex align-items-center gap-2"
                              style={{
                                background: item.invoice_number ? "#9333ea" : "#2563eb",
                                color: "#fff",
                                padding: "10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                width: "100%",
                              }}
                            >
                              {item.invoice_number ? (
                                <>
                                  <FileText size={16} />
                                  View Invoice ({item.invoice_number})
                                </>
                              ) : (
                                <>
                                  <Plus size={16} />
                                  Generate Invoice ($
                                  {isNaN(item.potential_invoice_amount)
                                    ? item.potential_invoice_amount
                                    : Number(item.potential_invoice_amount).toFixed(2) || ""}
                                  )
                                </>
                              )}
                            </div>
                            {item.invoice_number && !isPendingStatus ? (
                              !isSent ? (
                                <div className="fontgray font12">Generated (not sent)</div>
                              ) : (
                                <div className="fontgray font12">
                                  {isSentViaSystem ? "Sent via system" : "Sent externally"}
                                </div>
                              )
                            ) : (
                              <></>
                            )}
                          </div>
                          {!isPendingStatus && !isSent && item.invoice_number ? (
                            <div
                              onClick={() => setDeleteInvoiceModal(item)}
                              title={`Delete Invoice (${item.invoice_number})`}
                              className="btn btn-primary d-flex align-items-center gap-2"
                              style={{ height: "max-content" }}
                            >
                              <Trash2 size={16} /> Delete Invoice
                            </div>
                          ) : (
                            <></>
                          )}
                          {isSentViaSystem ? (
                            <div
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#007c8d";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#0098ac";
                              }}
                              onClick={() => {
                                getInvoicePDF(item, false);
                                setisResendMode(true);
                              }}
                              title="Resend Invoice"
                              style={{ padding: "10px", background: "#0098ac" }}
                              className="d-flex algin-items-center gap-2 themeButton themeButtonHover rounded mb-auto fw-medium px-3"
                            >
                              <RotateCw size={18} />
                              Resend
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
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
          className={`table table-striped table-hover rounded table-borderless align-middle ${styles.tableCustom}`}
          style={{ "--bs-table-striped-bg": "#f8f9fa", border: "1px solid #e7e7ef" }}
        >
          <thead>
            <tr style={{ background: "#f7f7fb", color: "#67677e", borderBottom: "1px solid #e7e7ef" }}>
              <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                <div>Month</div>
              </th>

              <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                <div>Hours</div>
              </th>
              <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                <div>Submitted On</div>
              </th>
              {showStatus ? (
                <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                  <div className={`justify-content-center`}>Status</div>
                </th>
              ) : (
                <></>
              )}
              <th style={{ background: "#f7f7fb", color: "#67677e" }} className="px-2 py-3">
                <div className={`justify-content-center`}>
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
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "50px", color: isred ? "#D82A1E" : "#9AABC2" }}
            >
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
    <div className={`w-100 p-1 py-3 px-md-3`}>
      {/* <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 ps-0">
        {rendertabsData()}
      </div> */}
      <div>{currentTab.renderData()}</div>
      {invoiceVendorPicker()}
      <Confirm
        title="Delete Invoice"
        result={(res) => {
          if (res) {
            deleteTimesheetInvoice(deleteInvoiceModal);
          }
          setDeleteInvoiceModal(false);
        }}
        show={!!deleteInvoiceModal}
        text={`Are you sure you want to delete the invoice<b>(${
          deleteInvoiceModal?.invoice_number
        })</b> for the <b> ${formatMonthYear(
          deleteInvoiceModal.month,
        )}</b> timesheet record? This action cannot be undone.`}
      />
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

      <GenerateInvoice
        isPreview={allInvoiceDetails}
        invoiceData={selectedVenderDetails}
        show={generateInvoiceModal}
        onClose={() => {
          setisResendMode(false);
          setSelectVendorModal(false);
          setselectedVenderDetails(false);
          setGenerateInvoiceModal(false);
          setAllInvoiceDetails(false);
          setSelectedVendor(false);
          setselectedVenderDetails(false);
        }}
        refresh={getTimesheets}
        data={selectedVendor}
        candidateDetails={candidateDetails}
        isResendMode={isResendMode}
      />
      <FilePreview
        docObject={{ file_extension: "application/pdf", file_name: showPaymentPDF?.pdf_preview?.file_name }}
        base64File={showPaymentPDF?.pdf_preview?.base64_content || ""}
        setBase64File={setShowPaymentPDF}
        fileType="application/pdf"
        setFileType={() => {}}
      />
      <ThemeLoader show={loading || loader} fixed />
    </div>
  );
}

export default Monthlytimesheets;
