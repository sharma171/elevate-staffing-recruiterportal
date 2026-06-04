import { useEffect, useState } from "react";
import { SearchBox, ThemeLoader } from "../../../components";
import styles from "./style.module.css";
import images from "../../../assets/images/new";
import { useAuth } from "../../../authContext";
import api from "../../../networking/api";
import { toast } from "react-toastify";
import AddModal from "./AddModal";
import { Placeholder } from "rsuite";
import { IoDocuments } from "react-icons/io5";
import { returnTruncatedStr } from "../../../helpers/StrHelpers";
import UpdateModal from "./UpdateDocument";
import FilePreview from "../../benchcandidate/FilePreview";
import OverlayModal from "../../../components/OverlayModal";

const { list, expiring, visa_status } = images;

function Documents() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loader, setloader] = useState(false);
  const [docLoader, setDocLoader] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState([]);
  const [updateData, setUpdateData] = useState(null);
  const [base64File, setBase64File] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user } = useAuth();

  useEffect(() => {
    getDocuments();
  }, [user?.email]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, activeTab]);

  const getDocuments = () => {
    if (!user?.email) return;
    let payload = {
      email_id: user?.email,
      task: "get_file_names",
    };
    setLoading(true);
    api
      .documentsDownload(payload)
      .then((res) => {
        setLoading(false);
        setData(res.available_files || []);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const downloadFIles = (docId, isView) => {
    const payload = {
      email_id: user?.email,
      task: "download_files",
      file_name: [docId],
    };

    if (isView) {
      setloader(true);
    } else {
      setDocLoader(docId);
    }

    api
      .documentsDownload(payload)
      .then((res) => {
        setDocLoader(false);
        setloader(false);
        const fileData = res?.retrieve_files?.[0];

        if (!fileData) return;

        if (fileData?.base64?.length < 100) {
          return toast.error(fileData?.base64);
        }

        if (isView) {
          setBase64File(fileData.base64);
          setFileType(fileData.file_extension);
          return;
        }

        const byteCharacters = atob(fileData.base64);
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
        toast.error(err.error || "Failed to download");
        setDocLoader(false);
        setloader(false);
        console.log(err);
      });
  };

  const tabsArray = [
    {
      id: 1,
      title: "All Documents",
      bodyTitle: "All Documents",
      description: "View and manage all your uploaded documents",
      cssIcon: "documents-fill",
      renderData: () => renderTab1Data(),
    },
    {
      id: 2,
      title: "Valid",
      bodyTitle: "Valid Documents",
      description: "Documents that are currently valid",
      cssIcon: "document-check",
      renderData: () => renderTab2Data(),
    },
    {
      id: 3,
      title: "Expiring Soon",
      bodyTitle: "Expiring Documents",
      description: "Documents that are expiring soon",
      image: expiring,
      renderData: () => renderTab3Data(),
    },
    {
      id: 4,
      title: "Required",
      bodyTitle: "Required Documents",
      description: "Documents that need to be submitted",
      cssIcon: "pajamas--requirements",
      renderData: () => renderTab4Data(),
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);

  const bodyHeader = () => (
    <div className="mb-3">
      <div className={`d-flex align-items-center gap-2 pointer h4 ${styles.bodyHeaer}`}>
        {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
        {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>}
        {currentTab.image && <img src={currentTab.image} className={styles.bodyHeadericon} />}
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

  const renderTable = (showStatus, status, hideExpiry, message) => {
    if (loading) {
      return <Placeholder.Paragraph active />;
    }

    let newData = data;

    if (status) {
      newData = data.filter((item) => item.doc_status == status);
    }

    if (searchValue && searchValue.trim() !== "") {
      const q = searchValue.trim().toLowerCase();
      newData = newData.filter((item) => (item.doc_name || item?.file_name || "").toLowerCase().includes(q));
    }

    if (!newData.length) {
      return <div className="fs-5 p-4 text-center">{message || "Data not found"}</div>;
    }

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const totalPages = Math.ceil(newData.length / rowsPerPage);
    const currentRows = newData.slice(indexOfFirstRow, indexOfLastRow);

    const renderPagination = () => {
      let pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        if (start > 1) pages.push(1);
        if (start > 2) pages.push("...");
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        if (end < totalPages - 1) pages.push("...");
        if (end < totalPages) pages.push(totalPages);
      }

      return (
        <div className="d-flex align-items-center gap-1">
          <span
            className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            ◀
          </span>
          {pages.map((page, index) => (
            <div
              key={index}
              style={currentPage === page ? { "--bs-btn-bg": "#0b4da1", "--bs-btn-border-color": "#0b4da1" } : {}}
              className={`btn ${styles.pages} ${
                currentPage === page ? "btn-primary " + styles.activePage : "btn-light"
              }`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
            >
              {page}
            </div>
          ))}
          <span
            className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            ▶
          </span>
        </div>
      );
    };

    const renderTableBody = () => {
      return currentRows.map((item, index) => {
        return (
          <tr key={index}>
            <td>
              <div className="themeColor fw-bold">{returnTruncatedStr(item.doc_name || item.file_name)}</div>
            </td>
            <td>
              <div>
                <div>{item.doc_type || "NA"}</div>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center gap-2 themeColor fw-bold">
                <div style={{ background: "#093c85" }} className={`${styles.dot}`}></div>
                <div>{formatToMMDDYYYY(item.fileuploaded_datetime) || "NA"}</div>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center gap-2 themeColor fw-bold">
                <div style={{ background: "#093c85" }} className={`${styles.dot}`}></div>
                <div>{formatToMMDDYYYY(item.doc_validfrom) || "NA"}</div>
              </div>
            </td>

            {hideExpiry ? null : (
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className={`${styles.dot} ${styles.dotred}`}></div>
                  <div style={{ color: "#be2b29" }}>{formatToMMDDYYYY(item.doc_expiry) || "NA"}</div>
                </div>
              </td>
            )}
            {showStatus ? (
              <td>
                <div className={`${styles.statusbox} ${styles[item.doc_status]} mx-auto d-flex justify-content-center`}>
                  <div className={`${styles.dot}`}></div>
                  <span>{item.doc_status || "NA"}</span>
                </div>
              </td>
            ) : null}
            <td>
              <div className="text-center d-flex align-items-center gap-2">
                {item.file_extension === "application/pdf" ||
                (item.file_extension && item.file_extension.startsWith("image/")) ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span
                      onClick={() => {
                        downloadFIles(item.file_name, true);
                      }}
                      className="fontblack material-symbols-outlined pointer"
                      style={{ fontSize: "18px" }}
                    >
                      visibility
                    </span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center">
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "18px",
                        color: "#9aabc2ff",
                        cursor: "not-allowed",
                      }}
                    >
                      visibility
                    </span>
                  </div>
                )}
                <div className="w-100">
                  {docLoader == item.file_name ? (
                    <div className={`d-flex align-items-center justify-content-center`}>
                      <div className={`d-flex align-items-center justify-content-center`} style={{ height: "34px" }}>
                        <div className={"spinner-border text-dark spinner-border-sm"} role="status" />
                      </div>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        downloadFIles(item.file_name);
                      }}
                      className="fontblack material-symbols-outlined my-2 pointer"
                      style={{ fontSize: "18px" }}
                    >
                      download_2
                    </span>
                  )}
                </div>
                <span
                  onClick={() => setUpdateData(item)}
                  className="material-symbols-outlined fontblack pointer"
                  style={{ fontSize: "18px" }}
                >
                  edit
                </span>
              </div>
            </td>
          </tr>
        );
      });
    };

    return (
      <>
        <div className={`table-responsive nowrap ${styles.table}`}>
          <table className="table table-borderless table-hover align-middle">
            <thead>
              <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                <th>
                  <div className={styles.th}>
                    <IoDocuments />
                    Document Name
                  </div>
                </th>
                <th>
                  <div className={`${styles.th}`}>
                    <img src={visa_status} alt="" style={{ height: "16px" }} />
                    Type
                  </div>
                </th>
                <th>
                  <div className={styles.th}>
                    <span className="material-symbols-outlined">calendar_month</span>
                    Upload Date
                  </div>
                </th>
                <th>
                  <div className={styles.th}>
                    <span className="material-symbols-outlined">calendar_month</span>
                    Valid from
                  </div>
                </th>
                {hideExpiry ? null : (
                  <th>
                    <div className={styles.th}>
                      <span className="material-symbols-outlined">calendar_month</span>
                      Expiry Date
                    </div>
                  </th>
                )}
                {showStatus ? (
                  <th>
                    <div className={`${styles.th} justify-content-center`}>
                      <img src={list} />
                      Status
                    </div>
                  </th>
                ) : null}
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
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="my-3">
            <label> Show </label>
            <select
              className="form-select d-inline w-auto ms-2"
              onChange={(e) => {
                setCurrentPage(1);
                setRowsPerPage(Number(e.target.value));
              }}
              value={rowsPerPage}
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
    );
  };

  const renderTab1Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(true, undefined, undefined, "There are no documents at this time.")}
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
        {renderTable(false, "Valid", undefined, "There are no valid documents at this time.")}
      </div>
    );
  };

  const renderTab3Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(false, "Expiring Soon", undefined, "There are no expiring documents at this time.")}
    </div>
  );
  const renderTab4Data = () => (
    <div>
      {bodyHeader()}
      {renderTable(false, "Required", true, "There are no required documents at this time.")}
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
              {card.image && <img src={card.image} className={styles.cssIcon} />}
            </div>
            <div style={{ paddingTop: "2px" }}>{card.title}</div>
          </div>
        ))}

        <div className="d-flex ms-auto justify-content-end w-100">
          <div
            className={`${styles.headerButtons} ${styles.activeTab} d-flex align-items-center gap-2 pointer`}
            onClick={() => setShowForm(true)}
          >
            <span className="material-symbols-outlined mb-1">upload</span>
            Upload Documents
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
              <h2 className="mb-0 fw-bold h2">Documents</h2>
              <p className="mb-0">Manage and upload your legal documents</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox placeholder="Search by doc name..." value={searchValue} onChange={setSearchValue} />
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
        <AddModal show={showForm} update={getDocuments} setshow={setShowForm} />
        <UpdateModal show={updateData} update={getDocuments} setShow={setUpdateData} />
        {base64File ? (
          <OverlayModal isActive={base64File} onClose={() => setBase64File(false)} style={{ maxWidth: "60%" }}>
            <FilePreview
              base64File={base64File}
              setBase64File={() => setBase64File(false)}
              fileType={fileType}
              setFileType={setFileType}
            />
          </OverlayModal>
        ) : null}
        <ThemeLoader show={loader || loading} />
      </div>
    </div>
  );
}

export default Documents;
