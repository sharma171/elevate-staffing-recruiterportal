import { useEffect, useState } from "react";
import styles from "./css/RateConfirmation.module.css";
import { Confirm, SearchBox, ThemeLoader } from "../../components";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import images from "../../assets/images/new";
import otherGender from "../../images/otherGender.svg";
import DatePicker from "react-datepicker";
import { pickDateOnlyNew, returnTruncatedStr } from "../../helpers/StrHelpers";
import { SelectPicker } from "rsuite";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CandidateModal from "../activeInterviews/CandidateModal";
import { Eye } from "lucide-react";
import { EmailPreviewModal } from "../talentpool/AnalyzeModal";
import { toast } from "react-toastify";

const { female_icon, male_icon, list, priorityorder, status_filter, user_icon, visa_status, teamGroup } = images;

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  return String(data?.modules?.rateConfirmations?.accessLevel).toLocaleLowerCase() == "edit";
}

function RateConfirmation({ extraPayload = {}, hidefilter = [], title }) {
  const [searchValue, setSearchValue] = useState();
  const [allUsersData, setallUsersData] = useState([]);
  const [allUsersDataDropdown, setallUsersDataDropdown] = useState([]);
  const [filteredUsersData, setfilteredUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [recruiterData, setRecruiterData] = useState([]);
  const [simpleRecruiterData, setSimpleRecruiterData] = useState([]);
  const [loader, setloader] = useState(false);
  const [confirmationPupup, setConfirmationPupup] = useState(false);

  const [isModalActive, setIsModalActive] = useState(false);
  const [isView, setIsView] = useState(false);
  const [candidateID, setCandidateId] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [emailContent, setEmailContent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  let isEditPermition = getPermissions();

  const navigate = useNavigate();
  const { user } = useAuth();

  const adminEmail = user?.email;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsersData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsersData.length / rowsPerPage);

  useEffect(() => {
    if (recruiterData?.length) {
      let simpleData = recruiterData.map((recruiter) => {
        return { recruiter_alias_name: recruiter.recruiter_alias_name, ...recruiter.details[0] };
      });
      setSimpleRecruiterData(simpleData);
    }
  }, [recruiterData?.length]);

  useEffect(() => {
    let dateOptions = {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    };
    const updatedData = allUsersData.filter((userItem) => {
      const filtersMatch = Object.keys(filters).every((key) => {
        if (!filters[key] || filters[key] == "All") return true;
        if (key === "submission_date") {
          const filterDate = new Date(filters[key]);
          const userDate = new Date(userItem[key]);
          if (isNaN(filterDate) || isNaN(userDate)) return false;
          return (
            filterDate.toLocaleDateString("en-US", dateOptions) == userDate.toLocaleDateString("en-US", dateOptions)
          );
        }
        const filterValue = filters[key].toString().toLowerCase();
        const userValue = userItem[key]?.toString().toLowerCase() || "";
        return userValue == filterValue;
      });

      if (!filtersMatch) return false;

      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return Object.keys(userItem).some((key) => {
          const value = userItem[key]?.toString().toLowerCase() || "";
          return value.includes(searchLower);
        });
      }

      return true;
    });

    setfilteredUsersData(updatedData);
  }, [filters, searchValue, allUsersData]);

  useEffect(() => {
    if (user?.email) {
      getcandidate_Details();
      if (!hidefilter.includes("Recruiter")) {
        getRecruiter_Details();
      }
      candidatesDropdowndata();
    }
  }, [user?.email]);

  const candidatesDropdowndata = () => {
    let payload = { email: user?.email };
    api
      .usersList(payload)
      .then((res) => {
        setallUsersDataDropdown(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRecruiter_Details = () => {
    let payload = { emailid: user.email, operation: "retrieve" };
    api
      .Recruiter_Details(payload)
      .then((res) => {
        setRecruiterData(res?.data || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      const dateA = new Date(a.submission_date);
      const dateB = new Date(b.submission_date);

      const isValidA = !isNaN(dateA);
      const isValidB = !isNaN(dateB);

      if (!isValidA && !isValidB) return 0;
      if (!isValidA) return 1;
      if (!isValidB) return -1;

      return dateB - dateA;
    });
  };

  const handleViewEmail = async (submissionId) => {
    setEmailContent(null);
    setEmailError(null);
    setEmailLoading(true);
    setEmailModalOpen(true);

    try {
      const API_URL = "https://fetch-candidate-analysis-v3-305451280005.us-east1.run.app";
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailid: adminEmail,
          task: "get_email_content",
          submission_id: submissionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch email content");
      }

      const data = await response.json();
      setEmailContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch email content";
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleStatusChange = (updatedStatus, candidate) => {
    let payload = {
      emailid: user.email,
      modify: {
        id: candidate.id,
        columns: {
          submission_status: updatedStatus,
        },
      },
    };
    setloader(true);
    api
      .Rate_Confirmations(payload)
      .then((data) => {
        setloader(false);

        // if (validateFor?.includes(updatedStatus)) {
        //   setConfirmationPupup({ value: updatedStatus, data: candidate });
        // }

        setfilteredUsersData((prevCandidates) =>
          prevCandidates.map((c) => (c.id === candidate.id ? { ...c, submission_status: updatedStatus } : c)),
        );
      })
      .catch((error) => {
        setloader(false);
        console.log("Error updating status:", error);
      });
  };

  const statusOptions = [
    "submitted to vendor",
    "under review",
    "Shortlisted",
    "Not Shortlisted",
    "Technical Screening",
    "Interview Round 1",
    "Interview Round 2",
    "Interview Round 3",
    "Client Round",
    "Interview Rejected",
  ];

  const getcandidate_Details = (id, operation = "retrieve") => {
    let payload = { emailid: user?.email, role: user?.user_role, ...extraPayload };
    setloader(true);
    api
      .Rate_Confirmations(payload)
      .then((res) => {
        setloader(false);
        let val = res;
        if (!Array.isArray(val)) {
          val = Object.values(val);
        }

        let sortedData = sortData(val);

        setallUsersData(sortedData);
        setfilteredUsersData(sortedData);
        setCurrentPage(1);
      })
      .catch((err) => {
        setloader(false);
        console.log(err);
      });
  };

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
          <button
            key={index}
            className={`btn ${styles.pages} ${currentPage === page ? "btn-primary " + styles.activePage : "btn-light"}`}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
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
  const returnIcon = (gender) => {
    let icons = {
      Male: male_icon,
      Female: female_icon,
    };

    return icons[gender] || otherGender;
  };

  const renderFilters = () => {
    const filterKeys = {
      Recruiter: { key: "from_email", icon: "person-available", cssIcon: true, data: recruiterData },
      Submission: {
        key: "submission_status",
        icon: status_filter,
        data: [
          "submitted to vendor",
          "under review",
          "Shortlisted",
          "Not Shortlisted",
          "Technical Screening",
          "Interview Round 1",
          "Interview Round 2",
          "Interview Round 3",
          "Client Round",
          "Interview Rejected",
        ],
      },
      date: { key: "submission_date", icon: "date" },
    };

    return (
      <>
        {Object.keys(filterKeys).map((filterType, index) => {
          if (hidefilter.includes(filterType)) {
            return <></>;
          }

          let isActive = filters[filterKeys[filterType]?.key] && filters[filterKeys[filterType]?.key] !== "All";
          let filter = filterKeys[filterType];

          let filterData = filter.data;

          if (filterType == "search") {
            return (
              <div style={{ minWidth: "150px" }}>
                <SearchBox
                  value={filters[filter?.key] || ""}
                  onChange={(e) => {
                    console.log(e, "eeeeee");
                    setFilters({ ...filters, [filter?.key]: e });
                  }}
                />
              </div>
            );
          }

          if (filterType == "date") {
            return (
              <DatePicker
                maxDate={"2099"}
                showIcon
                toggleCalendarOnIconClick
                calendarIconClassname="mb-1"
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={50}
                selected={filters[filter?.key] || null}
                onChange={(date) => setFilters({ ...filters, [filter?.key]: date })}
                dateFormat="MM/dd/yyyy"
                className={`${styles.datePiker} ${isActive ? styles.calanderActiveBG : ""} `}
                placeholderText={"MM/DD/YYYY"}
              />
            );
          }

          if (filterType == "Recruiter") {
            let dataToMap = [{ key: "Filter by " + filterType, val: "All" }, ...filterData].map((item) => {
              const label =
                item?.key ||
                item?.details?.[0]?.recruiter_name ||
                (item?.details?.[0]?.first_name &&
                  item?.details?.[0]?.last_name &&
                  `${item?.details?.[0].first_name} ${item?.details?.[0].last_name}`) ||
                (typeof item === "string" ? item : "unknown");

              return {
                label: label,
                value: item.val || item?.recruiter_alias_name,
              };
            });

            return (
              <SelectPicker
                caretAs={() => <FaChevronDown />}
                renderValue={(value, item) => {
                  return (
                    <div className="mx-auto d-flex align-items-center gap-1" style={{ maxWidth: "95%" }}>
                      <span className={`${filter.icon} `} style={{ height: "16px" }} />
                      <span title={item?.label} className="text-truncate w-100">
                        {item?.label || "Filter by Recruiter"}
                      </span>
                    </div>
                  );
                }}
                classPrefix="transparentFilter_"
                className={`selectpickerNormaltransparent ${isActive ? "bg-white px-0 " + styles.activeSelect : ""}`}
                style={{ paddingTop: "7px", paddingBottom: "7px" }}
                menuClassName="selectpickerNormalitemsTransparent"
                placement="autoVertical"
                cleanable={false}
                onChange={(value) => setFilters({ ...filters, [filterKeys[filterType]?.key]: value })}
                value={filters[filterKeys[filterType]?.key] || "All"}
                data={dataToMap}
                placeholder="Select Recruiter"
              />
            );
          }

          return (
            <>
              <div
                key={index}
                className={`filter-select d-flex align-items-center ${styles.selectFilter}  ${
                  isActive ? styles.activeSelect : styles.inactiveSelect
                }`}
              >
                {filter?.cssIcon ? (
                  <span className={`${styles.selectImage} ${filter.icon}`} />
                ) : (
                  <img className={styles.selectImage} src={filterKeys[filterType].icon} alt="" width="20" height="20" />
                )}
                <select
                  className="form-select"
                  onChange={(e) => setFilters({ ...filters, [filterKeys[filterType]?.key]: e.target.value })}
                  value={filters[filterKeys[filterType]?.key] || "All"}
                >
                  {[{ key: "Filter by " + filterType, val: "All" }, ...filterData].map((option, index) => {
                    const value =
                      option?.val || option?.recruiter_alias_name || (typeof option === "string" ? option : "unknown");

                    const label =
                      option?.key ||
                      option?.details?.[0]?.recruiter_name ||
                      (option?.details?.[0]?.first_name &&
                        option?.details?.[0]?.last_name &&
                        `${option?.details?.[0].first_name} ${option?.details?.[0].last_name}`) ||
                      (typeof option === "string" ? option : "unknown");

                    return (
                      <option
                        key={index}
                        value={value}
                        className={`${styles.dropdownlist} ${
                          filters[filterKeys[filterType]?.key] === value ? styles.list_active : ""
                        }`}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          );
        })}
        <div
          className="d-flex align-items-center gap-1 pointer fw-light nowrap"
          onClick={() => {
            setFilters({});
          }}
        >
          <span class="material-symbols-outlined">close</span>
          <span className="mobHFilters">Clear Filters</span>
        </div>
      </>
    );
  };

  // let validateFor = [
  //   "Technical Screening",
  //   "Interview Round 1",
  //   "Interview Round 2",
  //   "Interview Round 3",
  //   "Interview Rejected",
  // ];

  const openAddModal = () => {
    setIsView(false);
    setCandidateData({});
    setCandidateId(null);
    setIsModalActive(true);
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} container-fluid py-2 px-2 px-sm-3 px-md-2 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="ps-2">
              <h2 className="m-0 fw-bold fs-5 h2">{title || "Rate Confirmations"}</h2>
              {/* <p>Centralized view of rate approvals and negotiations</p> */}
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />
            </div>
          </div>
        </div>
        <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-1">{renderFilters()} </div>
              <div className={styles.addSection}>
                {isEditPermition ? (
                  <>
                    <span
                      onClick={openAddModal}
                      className={`pointer ${styles.themefontDark} d-flex align-items-center gap-2`}
                    >
                      + Add Rate Confirmations
                    </span>
                    <span
                      style={{
                        background: "#d9d9d9",
                        display: "block",
                        height: "100%",
                        minHeight: "20px",
                        width: "1px",
                      }}
                    ></span>
                  </>
                ) : (
                  <></>
                )}

                <span className={`${styles.themefontDark} d-flex align-items-center gap-2`}>
                  <img src={teamGroup} />
                  <span className="mobHFilters">Submissions:</span>
                  {filteredUsersData?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className={`table-responsive nowrap ${styles.table}`} style={{ minHeight: "320px" }}>
            <table className="table table-borderless table-hover align-middle">
              <thead>
                <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                  <th>
                    <div className={`d-flex align-items-center gap-2 ps-2`}>
                      <img src={user_icon} />
                      Full Name
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={visa_status} />
                      Client Name
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={user_icon} />
                      Assigned Recruiter
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={priorityorder} />
                      Vendor
                    </div>{" "}
                  </th>
                  <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={list} />
                      Rate
                    </div>
                  </th>
                  <th>
                    <div className="alignCenter">Submission Status</div>
                  </th>
                  <th>
                    <div className="alignCenter">Submission Date</div>
                  </th>
                  <th>
                    <div className="alignCenter">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {currentRows.map((c, index) => {
                  return (
                    <tr key={index} className={c.status === "Active" ? styles.activeRow : styles.inactiveRow}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img className={styles.userIcon} src={returnIcon(c.gender)} alt={c.candidate_full_name} />
                          <div className={`${styles.themefont} ${styles.semiBold}`}>
                            {returnTruncatedStr(c.candidate_full_name)}
                          </div>
                        </div>
                      </td>
                      <td className={styles.themefont}>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="building_icon"></span>
                          <div>{returnTruncatedStr(c.client_name || "N/A")}</div>
                        </div>
                      </td>
                      <td className={styles.themefont}>
                        <div className="d-flex align-items-center gap-2">
                          {returnTruncatedStr(c.from_email || "N/A")}
                        </div>
                      </td>

                      <td className={styles.themefont}>
                        <div className="d-flex align-items-center gap-2">{returnTruncatedStr(c.to_email || "N/A")}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="dollar-bold"></span>

                          {c.rate || " "}
                        </div>
                      </td>

                      <td className="onboarded-data capitalize">
                        {/* {c.submission_status} */}
                        <select
                          className="form-select w-auto border-0"
                          value={c.submission_status}
                          onChange={(event) => {
                            if (isEditPermition) {
                              let value = event.target.value;
                              handleStatusChange(value, c);
                            }
                          }}
                          disabled={!isEditPermition}
                        >
                          <option value="">Select Option</option>
                          {statusOptions.map((status, index) => {
                            let isActive = c.submission_status == status;
                            return (
                              <option
                                key={index}
                                value={status}
                                className={isActive ? styles.activeSelect : styles.inactiveSelect}
                              >
                                {status}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="text-center">{pickDateOnlyNew(c.submission_date)}</td>
                      <td>
                        <div
                          onClick={() => {
                            handleViewEmail(c.id);
                          }}
                          className={c?.number_of_followup_sent ? "linkColorButton" : "linkColorButton"}
                          // className={c?.number_of_followup_sent ? "linkColorButton" : "notallowed"}

                          linkColorButton
                        >
                          <Eye size={16} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="my-3">
              <label> Show </label>
              <select
                className="form-select d-inline w-auto ms-2"
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
        </div>
      </div>

      <EmailPreviewModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        loading={emailLoading}
        error={emailError}
        emailContent={emailContent}
      />

      <Confirm
        show={confirmationPupup}
        hideCancel
        result={(result) => {
          if (result) {
            navigate(`/activeInterviews?userid=${confirmationPupup?.data?.id}`);
          }
          setConfirmationPupup(false);
        }}
        title="Update Submission Status"
        text={`This submission has been moved to <b>${confirmationPupup?.value}</b>. Would you like to add the <b>interview details</b> now?`}
        deleteTitle="Yes, Add Details"
      />

      <CandidateModal
        isRateTab
        allUsersData={allUsersDataDropdown}
        disabled={isView}
        isModalActive={isModalActive}
        setIsModalActive={(val) => {
          setCandidateData({});
          setIsModalActive(val);
          setIsView(false);
          if (!val) {
            setCandidateId(null);
          }
        }}
        update={!!candidateID}
        isLoading={false}
        defaultCandidateData={candidateData}
        updateTable={getcandidate_Details}
        recruitersBList={simpleRecruiterData}
        candidateDataID={candidateID}
      />

      <ThemeLoader show={loader} />
    </div>
  );
}

export default RateConfirmation;
