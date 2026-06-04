import React, { useEffect, useState } from "react";
import { Confirm, CustomPagination, ThemeLoader } from "../../components";
import styles from "../employee/weeklytimesheet/Timesheet.module.css";
import images from "../../assets/images/new";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { Placeholder } from "rsuite";
import { toast } from "react-toastify";
import EmptyView from "../../components/EmptyView";
import FilePreview from "../benchcandidate/FilePreview";
const { list, visa_status } = images;

function Weeklytimesheet({ candidateDetails }) {
  const [placeholder, setplaceholder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
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

  const EMPLOYER_EMAIL = user?.email;

  const user_Email = candidateDetails?.original_email || candidateDetails?.primary_email;

  useEffect(() => {
    if (user_Email) {
      getreports();
    }
  }, [user_Email]);

  const getreports = () => {
    setplaceholder(true);

    let payload = {
      action: "get_employer",
      employee_email: user_Email,
      employer_email: EMPLOYER_EMAIL,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setplaceholder(false);
        setData(res.reports);
      })
      .catch((err) => {
        console.log(err);
        setplaceholder(false);
      });
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    deleteReport(reportToDelete);
  };

  const deleteReport = (reportId) => {
    setplaceholder(true);
    const payload = {
      action: "delete_employer",
      email: user_Email,
      employer_email: EMPLOYER_EMAIL,
      report_id: reportId,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setplaceholder(false);
        toast.success(res.message);
        getreports();
      })
      .catch((err) => {
        setplaceholder(false);
        toast.error(err?.error || err?.message || "Failed to delete report");
      });
  };

  function formatToMMDDYYYY(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}-${date.getFullYear()}`;
  }

  const renderTable = () => {
    if (placeholder) return <Placeholder.Paragraph active />;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const filteredData = data.slice(start, end);

    if (!data?.length) {
      return (
        <EmptyView
          hide={placeholder}
          title="No Weekly Status Available"
          description="Candidate weekly status will be shown here once the reports are generated from the employee portal."
        />
      );
    }
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
                <td>
                  <div title={item.project_name} className="truncate" style={{ maxWidth: "260px" }}>
                    {item.project_name}
                  </div>
                </td>
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
                    <div className="text-center">
                      <span
                        title="View"
                        onClick={() => downloadDocument(item.report_id, true)}
                        className={`material-symbols-outlined pointer`}
                      >
                        visibility
                      </span>
                    </div>
                    <div className="text-center">
                      {docLoader == item.report_id ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <div
                            className={` d-flex align-items-center justify-content-center`}
                            style={{ height: "34px" }}
                          >
                            <div className="spinner-border text-dark spinner-border-sm p-1" role="status" />
                          </div>
                        </div>
                      ) : (
                        <span
                          title="Download"
                          onClick={() => downloadDocument(item.report_id)}
                          className={`material-symbols-outlined pointer`}
                        >
                          download
                        </span>
                      )}
                    </div>
                    <span
                      title="Delete"
                      onClick={() => {
                        const rawStart = item.week_start_date;
                        const rawEnd = item.week_end_date;
                        let deleteConfirmMessage = `Are you sure you want to delete <b class="fw-bold"> ${rawStart} to ${rawEnd} </b> record? This cannot be undone.`;
                        reportMessages.deleteConfirmMessage = deleteConfirmMessage;
                        setreportMessages(reportMessages);
                        setReportToDelete(item.report_id);
                        setShowDeleteConfirm(true);
                      }}
                      className={`material-symbols-outlined outlineIcon pointer`}
                      style={{ height: "34px" }}
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

  const downloadDocument = (docId, view) => {
    if (view) {
      setLoading(true);
    } else {
      setDocLoader(docId);
    }

    const payload = {
      action: "get_report_employer",
      employer_email: EMPLOYER_EMAIL,
      report_id: docId,
    };

    api
      .createWeeklyTimesheet(payload)
      .then((res) => {
        setDocLoader(false);

        const fileData = res.download;
        if (!fileData) return;

        if (view) {
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
        setLoading(false);
        setDocLoader(false);
      });
  };

  return (
    <div className={`w-100`}>
      {renderTable()}

      <ThemeLoader show={placeholder || loading} />
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

      <FilePreview
        docObject={{ file_extension: "application/pdf", file_name: showPDF?.file_name }}
        base64File={showPDF?.base64_content || ""}
        setBase64File={setShowPDF}
        fileType="application/pdf"
        setFileType={() => {}}
      />
    </div>
  );
}

export default Weeklytimesheet;
