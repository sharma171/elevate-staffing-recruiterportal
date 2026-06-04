import React, { useEffect, useState } from "react";
import styles from "./activeInterviews.module.css";
import { SearchBox, ThemeLoader } from "../../components";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import images from "../../assets/images/new";
import otherGender from "../../images/otherGender.svg";
import DatePicker from "react-datepicker";
import NewInterviewModal from "./NewInterview";
import { PiListChecksFill } from "react-icons/pi";
import { SelectPicker } from "rsuite";
import { FaChevronDown } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { Building, Eye, FileText, PlusCircle, X } from "lucide-react";
import AddRateInterviewModal from "./AddRateInterviewModal";
import { EmailPreviewModal } from "../talentpool/AnalyzeModal";
import { toast } from "react-toastify";

const { female_icon, male_icon, list, status_filter, user_icon, visa_status, interviews } = images;

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  let accessLevel = String(data?.modules?.activeInterviews?.accessLevel).toLocaleLowerCase();
  let filterAccess = String(data?.modules?.activeInterviews?.filterAccess).toLocaleLowerCase();

  return { accessLevel, filterAccess };
}

function AddInterviewModal({ open, onClose, onPickRate, onAddNew }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className={styles.popup_overlay} />

      <div className={styles.popup_dialog} role="dialog" aria-modal="true">
        <div className="d-flex mb-3 gap-2 justify-content-between">
          <div>
            <h4 className="h4 fw-bold">Add New Interview</h4>
            <p>Choose how to add a new interview</p>
          </div>
          <button className="mb-auto hidemodalclosebtn pdfcontrollButtonsPDF" onClick={onClose}>
            <X strokeWidth={3} size={20} />
          </button>
        </div>

        <div className="pb-3">
          <p className={styles.popup_hint}>How would you like to add an interview?</p>

          <div className={styles.popup_options}>
            <button className={styles.popup_card} onClick={onPickRate}>
              <div className={styles.popup_iconWrapper}>
                <FileText size={32} />
              </div>
              <div className={styles.popup_cardText}>
                <h3>Pick from Rate Confirmations</h3>
                <p>Search and select an existing rate confirmation</p>
              </div>
            </button>

            <button className={styles.popup_card} onClick={onAddNew}>
              <div className={styles.popup_iconWrapper}>
                <PlusCircle size={32} />
              </div>
              <div className={styles.popup_cardText}>
                <h3>Add New Entry</h3>
                <p>Create a new interview record manually</p>
              </div>
            </button>
          </div>
        </div>

        {/* <div className={styles.popup_footer}>
          <button className={styles.popup_cancel} onClick={onClose}>
            Cancel
          </button>
        </div> */}
      </div>
    </>
  );
}

function ActiveInterviews({ extraPayload = {}, hidefilter = [], title }) {
  const [searchValue, setSearchValue] = useState();
  const [allUsersData, setallUsersData] = useState([]);
  const [allUsersDataDropdown, setallUsersDataDropdown] = useState([]);
  const [filteredUsersData, setfilteredUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [recruiterData, setRecruiterData] = useState([]);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isPickerPopupOpen, setisPickerPopupOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [candidateID, setCandidateId] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [simpleRecruiterData, setSimpleRecruiterData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isRatePopup, setisRatePopup] = useState(false);

  const [emailContent, setEmailContent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const userId = searchParams.get("userid");

  const { user } = useAuth();
  const adminEmail = user?.email;

  let permitions = getPermissions();

  let hideActions = permitions?.accessLevel != "edit";

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsersData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsersData.length / rowsPerPage);

  const handleModal = (val) => {
    setCandidateData({});
    setisPickerPopupOpen(val);
    setIsModalActive(val);
    // setDropdownOpen(false);
    setIsView(false);
    if (!val) {
      setCandidateId(null);
    }
  };

  // usersList;

  useEffect(() => {
    if (recruiterData?.length) {
      let simpleData = recruiterData.map((recruiter) => {
        return { recruiter_alias_name: recruiter.recruiter_alias_name, ...recruiter.details[0] };
      });
      setSimpleRecruiterData(simpleData);
    }
  }, [recruiterData?.length]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchValue]);

  const applyFilters = () => {
    let dateOptions = {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    };
    const updatedData = allUsersData.filter((user) => {
      const filtersMatch = Object.keys(filters).every((key) => {
        if (!filters[key] || filters[key] == "All") return true;
        if (key === "interview_date_time") {
          const filterDate = new Date(filters[key]);
          const userDate = new Date(user[key]);
          if (isNaN(filterDate) || isNaN(userDate)) return false;
          return (
            filterDate.toLocaleDateString("en-US", dateOptions) == userDate.toLocaleDateString("en-US", dateOptions)
          );
        }
        const filterValue = filters[key].toString().toLowerCase();
        const userValue = user[key]?.toString().toLowerCase() || "";
        return userValue == filterValue;
      });

      if (!filtersMatch) return false;

      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return Object.keys(user).some((key) => {
          const value = user[key]?.toString().toLowerCase() || "";
          return value.includes(searchLower);
        });
      }

      return true;
    });

    setfilteredUsersData(updatedData);
  };

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
    let payload = { email: user.email };
    // setLoader(true);
    api
      .usersList(payload)
      .then((res) => {
        // setLoader(false);
        setallUsersDataDropdown(res);
      })
      .catch((err) => {
        // setLoader(false);
        console.log(err, "error is err");
      });
  };

  const getRecruiter_Details = () => {
    let payload = { emailid: user.email, operation: "retrieve" };
    setLoader(true);
    api
      .Recruiter_Details(payload)
      .then((res) => {
        setLoader(false);
        setRecruiterData(res?.data || []);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      const dateA = new Date(a.interview_date_time);
      const dateB = new Date(b.interview_date_time);

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

  const handleStatusChange = async (event, candidate) => {
    const updatedStatus = event.target.value;

    let payload = {
      emailid: user.email,
      modify: {
        id: candidate.id,
        columns: {
          submission_status: updatedStatus,
        },
      },
    };

    setLoader(true);
    api
      .Rate_Confirmations(payload)
      .then((data) => {
        setLoader(false);
        console.log("Status updated:", data);

        setfilteredUsersData((prevCandidates) =>
          prevCandidates.map((c) => (c.id === candidate.id ? { ...c, submission_status: updatedStatus } : c)),
        );
      })
      .catch((error) => {
        setLoader(false);
        console.log("Error updating status:", error);
      });
  };

  const getcandidate_Details = (id, operation = "retrieve") => {
    let payload = { from_email: user?.email, role: user?.user_role, ...extraPayload, operation };

    // if (id) {
    //   payload = { emailid: user?.email, operation, id: String(id) };
    // }
    setLoader(true);
    api
      .CandidateInterviewDetails(payload)
      .then((res) => {
        setLoader(false);
        // if (id) {
        //   setCandidateId(res[0]);
        // } else {
        let val = res;
        if (!Array.isArray(val)) {
          val = Object.values(val);
        }

        let sortedData = sortData(val);
        if (searchValue) {
          setTimeout(() => {
            applyFilters();
          }, 200);
        }

        if (userId) {
          const findUserDetails = sortedData.find((item) => {
            return item.id == userId;
          });

          if (findUserDetails?.id) {
            setisPickerPopupOpen(true);
            setCandidateId(findUserDetails.id);
            setCandidateData(findUserDetails);
            setTimeout(() => {
              setSearchParams({});
            }, 1000);
          }
        }

        // setdefaultApiData(res);
        setallUsersData(sortedData);
        setfilteredUsersData(sortedData);
        // setCurrentPage(1);
        // }
      })
      .catch((err) => {
        setLoader(false);
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
      // search: { key: "candidate_full_name" },
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
      date: { key: "interview_date_time", icon: "date" },
    };

    return (
      <>
        {Object.keys(filterKeys).map((filterType, index) => {
          if (hidefilter.includes(filterType)) return null;

          const filter = filterKeys[filterType];
          const filterKey = filter?.key;
          const value = filters[filterKey];
          const isActive = value && value !== "All";
          const filterData = filter?.data || [];

          if (filterType === "search") {
            return (
              <div key={index} style={{ minWidth: "150px" }}>
                <SearchBox value={value || ""} onChange={(e) => setFilters({ ...filters, [filterKey]: e })} />
              </div>
            );
          }

          if (filterType === "date") {
            return (
              <DatePicker
                key={index}
                maxDate={"2099"}
                showIcon
                toggleCalendarOnIconClick
                calendarIconClassname="mb-1"
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={50}
                selected={value || null}
                // onChange={(date) => {
                //   const formatted = formatDateToET(date);

                //   console.log(formatted, "formatted");
                //   setFilters({ ...filters, [filterKey]: formatted });
                // }}
                onChange={(date) => setFilters({ ...filters, [filterKey]: date })}
                dateFormat="MM/dd/yyyy"
                className={`${styles.datePiker} ${isActive ? styles.calanderActiveBG : ""}`}
                placeholderText="MM/DD/YYYY"
              />
            );
          }

          if (filterType == "Recruiter") {
            let dataToMap = [{ key: `Filter by ${filterType}`, val: "All" }, ...filterData].map((option, i) => {
              if (!option) return null;

              const optionValue =
                option?.val || option?.recruiter_alias_name || (typeof option === "string" ? option : `option-${i}`);

              const optionLabel =
                option?.key ||
                option?.details?.[0]?.recruiter_name ||
                (option?.details?.[0]?.first_name &&
                  option?.details?.[0]?.last_name &&
                  `${option?.details?.[0].first_name} ${option?.details?.[0].last_name}`) ||
                (typeof option === "string" ? option : "Unnamed");

              return { label: optionLabel || "", value: optionValue };
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
                style={{ paddingTop: "7px", paddingBottom: "7px" }}
                classPrefix="transparentFilter_"
                className={`selectpickerNormaltransparent ${isActive ? "bg-white px-0 " + styles.activeSelect : ""}`}
                menuClassName="selectpickerNormalitemsTransparent"
                placement="autoVertical"
                cleanable={false}
                onChange={(value) => setFilters({ ...filters, [filterKey]: value })}
                value={value || "All"}
                data={dataToMap}
                placeholder="Select Recruiter"
              />
            );
          }

          return (
            <div
              key={index}
              className={`filter-select d-flex align-items-center ${styles.selectFilter} ${
                isActive ? styles.activeSelect : styles.inactiveSelect
              }`}
            >
              {filter?.cssIcon ? (
                <span className={`${styles.selectImage} ${filter.icon}`} />
              ) : (
                <img className={styles.selectImage} src={filter.icon} alt="" width="20" height="20" />
              )}
              <select
                className="form-select"
                onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
                value={value || "All"}
              >
                {[{ key: `Filter by ${filterType}`, val: "All" }, ...filterData].map((option, i) => {
                  if (!option) return null;

                  const optionValue =
                    option?.val ||
                    option?.recruiter_alias_name ||
                    (typeof option === "string" ? option : `option-${i}`);

                  const optionLabel =
                    option?.key ||
                    option?.details?.[0]?.recruiter_name ||
                    (option?.details?.[0]?.first_name &&
                      option?.details?.[0]?.last_name &&
                      `${option?.details?.[0].first_name} ${option?.details?.[0].last_name}`) ||
                    (typeof option === "string" ? option : "Unnamed");

                  return (
                    <option
                      key={i}
                      value={optionValue}
                      className={`${styles.dropdownlist} ${value === optionValue ? styles.list_active : ""}`}
                    >
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}

        <div className="d-flex align-items-center gap-1 pointer fw-light nowrap" onClick={() => setFilters({})}>
          <span class="material-symbols-outlined">close</span>
          Clear Filters
        </div>
      </>
    );
  };

  const statusOptions = [
    "submitted to vendor",
    "under review",
    "Shortlisted",
    "Not Shortlisted",
    // "Technical Screening",
    // "Interview Round 1",
    // "Interview Round 2",
    // "Interview Round 3",
    // "Interview Rejected",
  ];

  const returnTruncatedStr = (str) => {
    if (!str) return null;

    const truncatedStr = str.length > 15 ? str.slice(0, 15) + "..." : str;

    return (
      <span
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "150px",
          cursor: "pointer",
        }}
        title={str}
      >
        {truncatedStr}
      </span>
    );
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} container-fluid py-2 px-2 px-sm-3 px-md-2 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2 mt-0 fs-5">{title || "Ongoing Interviews "}</h2>
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />

              {/* <div className={profileStyles.userbox}>
                <ProfileLogoComponent />
              </div> */}
            </div>
          </div>
        </div>
        <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-1">{renderFilters()} </div>
              <div className={styles.addSection}>
                {hideActions ? (
                  <></>
                ) : (
                  <>
                    <span
                      className="pointer"
                      onClick={() => {
                        setIsView(false);
                        setisPickerPopupOpen(!isModalActive);
                      }}
                    >
                      + Add Interview
                    </span>
                    <span className={styles.sep} />
                  </>
                )}
                <span className={`${styles.themefontDark} d-flex align-items-center gap-2`}>
                  <img src={interviews} style={{ width: "15px" }} />
                  Interviews: {filteredUsersData?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className={`table-responsive nowrap ${styles.table}`} style={{ minHeight: "320px" }}>
            <table className="table table-borderless table-hover align-middle">
              <thead>
                <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                  <th className="text-center">
                    <div className={`d-flex align-items-center gap-2 ps-2`}>
                      <img src={user_icon} />
                      Full Name
                    </div>
                  </th>

                  <th className="text-center">
                    <div className="d-flex align-items-center gap-2">
                      <Building size={16} strokeWidth={3} />
                      Submitted To (Vendor)
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="d-flex align-items-center gap-2">
                      <img src={visa_status} />
                      Client Name
                    </div>
                  </th>
                  {/* <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={user_icon} />
                      Assigned Recruiter
                    </div>
                  </th> */}
                  {/* <th>
                    <div className="d-flex align-items-center gap-2">
                      <img src={priorityorder} />
                      Vendor
                    </div>{" "}
                  </th> */}
                  <th className="text-center">
                    <div className="d-flex align-items-center gap-2">
                      <img src={list} />
                      Rate
                    </div>
                  </th>
                  {/* <th>
                    <div className="alignCenter">Submission Status</div>
                  </th> */}
                  <th className="text-center">
                    <div className="alignCenter d-flex align-items-center gap-1">
                      <PiListChecksFill />
                      <span>Interview Status</span>
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="alignCenter d-flex align-items-center gap-1">
                      <span className="material-symbols-outlined fs-6">calendar_month</span>
                      <span>Interview Date Time</span>
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="alignCenter d-flex align-items-center ps-2">
                      <span>Source</span>
                    </div>
                  </th>

                  {hideActions ? (
                    <></>
                  ) : (
                    <th className="text-center">
                      <div className="alignCenter d-flex align-items-center gap-1">
                        <span className="material-symbols-outlined fs-6">action_key</span>
                        <span>Action</span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {currentRows.map((c, index) => {
                  return (
                    <tr key={index} className={c.status === "Active" ? styles.activeRow : styles.inactiveRow}>
                      <td className="text-center">
                        <div className="d-flex align-items-center gap-2" style={{ marginBottom: "-4px" }}>
                          <img className={styles.userIcon} src={returnIcon(c.gender)} alt={c.candidate_full_name} />
                          <div className={`${styles.themefont} ${styles.semiBold}`}>
                            {returnTruncatedStr(c.candidate_full_name)}
                          </div>
                        </div>
                      </td>

                      <td className={`${styles.themefont} text-center`}>
                        <div className="d-flex gap-2 align-items-center">
                          <div>{returnTruncatedStr(c.to_email || "N/A")}</div>
                        </div>
                      </td>

                      <td className={`${styles.themefont} text-center`}>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="building_icon"></span>
                          <div>{returnTruncatedStr(c.client_name || "N/A")}</div>
                        </div>
                      </td>
                      {/* <td className={styles.themefont}>
                        <div className="d-flex align-items-center gap-2">
                          
                          {returnTruncatedStr(c.from_email || "N/A")}
                        </div>
                      </td> */}
                      {/* <td className={styles.themefont}>
                        <div className="d-flex align-items-center gap-2">{returnTruncatedStr(c.to_email || "N/A")}</div>
                      </td> */}
                      <td className="text-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="dollar-bold"></span>

                          {c.rate || " "}
                        </div>
                      </td>
                      <td className="onboarded-data">
                        {c.submission_status}
                        {/* <select
                          className="form-select w-auto border-0"
                          value={c.submission_status}
                          onChange={(e) => handleStatusChange(e, c)}
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
                        </select> */}
                      </td>
                      {/* <td className="text-center">
                        {new Date(c.submission_date).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td> */}
                      <td>
                        {c.interview_date_time ? (
                          <>
                            {new Date(c.interview_date_time).toLocaleDateString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            })}
                            {c.interview_timezone ? "(" + c.interview_timezone + ")" : <></>}
                          </>
                        ) : (
                          <></>
                        )}
                      </td>

                      <td>
                        {c.entry_source ? (
                          <>
                            {c.entry_source === "manual_entry" && (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  lineHeight: 1,
                                  color: "#374151",
                                  backgroundColor: "#f3f4f6",
                                }}
                              >
                                Manual
                              </span>
                            )}
                            {c.entry_source === "email_parsed" && (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  lineHeight: 1,
                                  color: "#1d4ed8",
                                  backgroundColor: "#dbeafe",
                                }}
                              >
                                Email
                              </span>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </td>

                      {hideActions ? (
                        <></>
                      ) : (
                        <td className="text-center">
                          <div className="d-flex gap-2 align-items-center">
                            <div
                              onClick={() => {
                                // if (c?.number_of_followup_sent) {
                                handleViewEmail(c.id);
                                // }
                              }}
                              className={c?.number_of_followup_sent ? "linkColorButton" : "linkColorButton"}
                            >
                              <Eye size={16} />
                            </div>

                            <span
                              onClick={() => {
                                setIsModalActive(true);
                                setCandidateId(c.id);
                                setCandidateData(c);
                              }}
                              class="material-symbols-outlined pointer fs-5"
                              style={{ color: "var(--lightColor)" }}
                            >
                              edit_square
                            </span>
                          </div>
                        </td>
                      )}
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

      <AddInterviewModal
        onAddNew={() => {
          setIsModalActive(isPickerPopupOpen);
          setisPickerPopupOpen(false);
        }}
        open={isPickerPopupOpen}
        onClose={() => {
          setisPickerPopupOpen(false);
        }}
        onPickRate={() => {
          setisRatePopup(true);
          setisPickerPopupOpen(false);
        }}
      />

      <AddRateInterviewModal
        onBack={() => {
          setisRatePopup(false);
          setisPickerPopupOpen(true);
        }}
        isActive={isRatePopup}
        onClose={(res) => {
          if (res) {
            setFilters({});
            getcandidate_Details();
          }
          setisRatePopup(false);
        }}
      />

      <NewInterviewModal
        allUsersData={allUsersDataDropdown}
        disabled={isView}
        onBack={() => {
          setisRatePopup(false);
          setisPickerPopupOpen(true);
          setIsModalActive(false);
        }}
        isModalActive={isModalActive}
        setIsModalActive={handleModal}
        update={!!candidateID}
        isLoading={false}
        defaultCandidateData={candidateData}
        updateTable={() => {
          setFilters({});
          getcandidate_Details();
        }}
        recruitersBList={simpleRecruiterData}
        // addCandidate={addCandidate}
        // candidateData={candidateData} // Pass data when updating
        candidateDataID={candidateID} // Pass data when updating
      />
      <ThemeLoader show={loader} />
    </div>
  );
}

export default ActiveInterviews;
