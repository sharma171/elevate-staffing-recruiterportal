import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OverlayModal from "../../components/OverlayModal";

import otherGender from "../../images/otherGender.svg";
import { useForm } from "react-hook-form";
import "./RecruiterDetails.css";
import "../dashboard/style.css";
import makeRequest from "../../helpers/http-request.js";
import tableStyles from "./css/table.module.css";
import styles from "./css/other.module.css";

import images from "../../assets/images/new";
import { useAuth } from "../../authContext.jsx";
import Confirm from "../../components/Confirm.jsx";
import JobCount from "../jobSearch/ExistingJobComponents/JobCountIcon.png";
import DatePicker from "react-datepicker";
import PermitionsModal from "./PermitionsModal.jsx";
import api from "../../networking/api.js";
import { Placeholder } from "rsuite";
import ThemeLoader from "../../components/ThemeLoader.jsx";
import { formatDateToET, pickDateOnly } from "../../helpers/StrHelpers.js";
import { SelectPicker } from "rsuite";
import { FaChevronDown } from "react-icons/fa";

const { male_icon, female_icon, list, status_filter } = images;

function getMainDomain(url) {
  if (!url) return null;

  let domain = url.replace(/(^\w+:|^)\/\//, "");

  domain = domain.split("/")[0].split(":")[0];

  domain = domain.replace(/^www\./, "");

  const parts = domain.split(".");

  if (parts.length >= 2) {
    return parts.slice(-2).join(".");
  }

  return domain;
}

const defaultRecuiterPernitionsData = {
  emailid: "user@example.com",
  role: "recruiter",
  operation: "save",
  modules: {
    dashboard: {
      filterAccess: "Assigned",
    },
    talentPool: {
      accessLevel: "View",
      filterAccess: "Assigned",
      sections: {
        time_sheets: "Hide",
        contact: "Hide",
        active: "Hide",
        available: "View",
        inactive: "Hide",
        documents: "Resume Only",
        pending: "Hide",
        weekly_status: "Hide",
        invoice: "Hide",
        projects: "View",
      },
    },
    taskboard: {
      accessLevel: "Hide",
    },
    activeInterviews: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    companyManagement: {
      accessLevel: "Hide",
    },
    engagementHub: {
      accessLevel: "View",
    },
    hr_tickets: {
      accessLevel: "Hide",
    },
    jobDiscoverySuite: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    rateConfirmations: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    recruiterAnalysis: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    vendorDirectory: {
      accessLevel: "View",
    },
    financialmanagement: {
      accessLevel: "Hide",
    },
  },
};

const RecruiterDetails = ({ callback, editPermitions }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [update, setUpdate] = useState(false);
  const [teams, setTeams] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showModalDialog, setShowModalDialog] = useState(false);
  const [teamsDropDown, setTeamsDropDown] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [isModalActive, setIsModalActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [managers, setManagers] = useState([]);
  const [updateId, setUpdateId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTeamText, setDeleteTeamText] = useState("");
  const [candidateData, setCandidateData] = useState();
  const [editCandidateData, setEditCandidateData] = useState({});
  const [modalTitle, setModalTitle] = useState("Delete Recruiter");
  const [decodedPassword, setDecodedPassword] = useState("");
  const [createLoader, setCreateLoader] = useState(false);
  const [loaderMessage, setloaderMessage] = useState(false);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredCandidates.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredCandidates.length / rowsPerPage);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  useEffect(() => {
    const details = {
      count: candidates?.length,
      setSearch: setSearch,
      action: (res) => {
        setIsModalActive(true);
      },
    };

    callback && callback(details);
  }, [candidates?.length]);

  const jobsPerPage = 6;
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";
  let OrganisationData = JSON.parse(localStorage.getItem("Organisation")) || "";
  let orgWebsite = OrganisationData?.org_data?.[0]?.org_website;

  const domain = getMainDomain(orgWebsite || "");

  const isManager = watch("is_manager") === "true";

  const getManagers = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: user.email,
          operation: "getmanagers",
        },
      };
      setIsLoading(true);
      const res = await makeRequest(options);
      setIsLoading(false);

      if (res?.status == 200) {
        setManagers(
          res?.data?.managers?.map((value) => {
            return {
              value: value?.recruiter_alias_name,
              text: value?.recruiter_name,
            };
          }),
        );
      }
    } catch (err) {
      setIsLoading(false);

      console.log(err);
    }
  };

  const renderSpinnerCOntent = (content, key) => {
    if (isLoading == key) {
      return (
        <div className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}>
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    } else {
      return content;
    }
  };

  const assignPermitions = (data) => {
    setCreateLoader(true);

    let payload = structuredClone(defaultRecuiterPernitionsData);
    payload.emailid = data?.recruiter_email;
    payload.operation = "save";

    api
      .Permissions(payload)
      .then((res) => {
        setCreateLoader(false);
        resetState();
        setIsModalActive(false);
        toast.success("Invitation sent and permissions assigned successfully.");
      })
      .catch((err) => {
        setCreateLoader(false);
        toast.error(err.error || "An error occurred while sending the invitation or assigning permissions.");
        console.log("Error saving permissions:", err);
      });
  };

  const updateRecruiter = async (data) => {
    data.recruiter_name = data.first_name + " " + data.last_name;

    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const payLoad = {
        ...data,

        recruiter_alias_name: data?.recruiter_email,
        is_manager: data?.is_manager === "true",
        recruiter_manager: data?.is_manager === "true" ? data?.recruiter_email : data?.recruiter_manager,
      };

      const options = {
        url,
        method: "POST",
        data: {
          emailid: storedUser.email,
          operation: "modify",
          id: updateId,
          columns: payLoad,
        },
      };
      setIsLoading(true);

      const res = await makeRequest(options);
      setIsLoading(false);
      if (res?.status == 200) {
        getCandidates();
        resetState();
        setIsModalActive(false);
        toast.success(res?.data?.message || "Candidate Updated successfully");
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  };

  const handleUpdateRecruiter = (data) => {
    setEditCandidateData(data);
    setUpdate(true);
    setIsModalActive(true);
    setUpdateId(data.id);
    setValue("first_name", data.first_name);
    setValue("last_name", data.last_name);
    setValue("job_title", data.job_title);
    setValue("recruiter_email", data.recruiter_email);
    setValue("recruiter_joining_date", data.recruiter_joining_date);
    setValue("gender", data.gender);
    setValue("recruiter_status", data.recruiter_status);
    setValue("recruiter_team", data.recruiter_team);
    setValue("is_manager", data.is_manager ? "true" : "false");
    setValue("recruiter_manager", data.is_manager ? "" : data.recruiter_manager);
  };

  const addRecruiter = async (data) => {
    data.recruiter_name = data.first_name + " " + data.last_name;
    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      let payload = {
        emailid: storedUser.email,
        operation: "insert",
        columns: {
          ...data,
          is_manager: Boolean(data.is_manager),
          recruiter_alias_name: data.recruiter_email,
        },
      };

      const options = {
        url,
        method: "POST",
        operation: "insert",
        data: payload,
      };
      setIsLoading(true);
      setloaderMessage("Creating user… Please wait.");
      const res = await makeRequest(options);
      setIsLoading(false);
      setloaderMessage(false);

      if (res?.status == 200) {
        resetState();
        setIsModalActive(false);
        getCandidates();
        toast.success(res.data?.message || "User created successfully.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.error || "Failed to create user.");
      setloaderMessage(false);
      setIsLoading(false);

      console.log(err);
    }
  };

  const getTitles = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: user.email,
          type: "job_titles",
        },
      };
      setIsLoading(true);

      const res = await makeRequest(options);
      setIsLoading(false);

      setJobs(res?.data?.records);
    } catch (err) {
      setIsLoading(false);

      console.log(err);
    }
  };

  const getTeams = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: user.email,
          type: "teams",
        },
      };
      setIsLoading(true);

      const res = await makeRequest(options);
      setIsLoading(false);

      if (res?.status == 200) {
        setTeams(res?.data?.records);
        setTeamsDropDown(
          res?.data?.records?.map((value) => {
            return { value: value.team_name, text: value.team_name };
          }),
        );
      }
    } catch (err) {
      setIsLoading(false);

      console.log(err);
    }
  };

  const getCandidates = async () => {
    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const options = {
        url,
        method: "POST",
        data: {
          emailid: storedUser.email,
          operation: "retrieve",
        },
      };
      setIsLoading(true);
      setIsLoader(true);

      const res = await makeRequest(options);

      setIsLoader(false);
      setIsLoading(false);
      if (res.status == 200) {
        console.log("candidates ============ ", res?.data?.data);
        setCandidates(res?.data?.data);
      }
    } catch (err) {
      setIsLoading(false);
      setIsLoader(false);

      console.log(err);
    }
  };

  const deleteRecruiter = async (id) => {
    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const options = {
        url,
        method: "POST",
        data: {
          emailid: storedUser.email,
          operation: "delete",
          id,
        },
      };
      setIsLoading(true);

      const res = await makeRequest(options);
      setIsLoading(false);

      if (res.status == 200) {
        setShowDialog(false);
        setDeleteId(null);
        getCandidates();
        setIsModalActive(false);
        toast.success(res?.data?.message || "Candidate deleted successfully");
      }
    } catch (err) {
      setIsLoading(false);

      console.log(err);
    }
  };
  useEffect(() => {
    if (user?.email) {
      getTitles();
      getTeams();
      getCandidates();
      getManagers();
    }
  }, [user?.email]);

  const resetState = () => {
    setUpdate(false);
    setIsLoading(false);
    reset();
  };

  const handleDeleteCandidate = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  const handleDeleteCandidateModal = (id) => {
    setShowModalDialog(true);
    setDeleteId(id);
  };

  useEffect(() => {
    let filtered = candidates;

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "All") {
        let isManagerSearch = key == "recruiter_manager";

        filtered = filtered.filter((itemarr) => {
          let item = itemarr?.details?.[0] || {};
          let lowercaseFilter = String(filters[key]).toLowerCase();
          let lowercaseItem = String(item[key]).toLowerCase();

          let isManager = item?.is_manager;

          if (isManagerSearch && isManager) {
            let isSelfVal = filters[key] == item?.recruiter_email;

            if (isSelfVal) {
              return true;
            }
          }

          return lowercaseItem.includes(lowercaseFilter);
        });
      }
    });

    if (search) {
      let searchLower = search.toLowerCase();
      filtered = filtered.filter((itemarr) => {
        let item = itemarr?.details?.[0] || {};

        return Object.values(item).some((value) => String(value).toLowerCase().includes(searchLower));
      });
    }

    setFilteredCandidates(filtered);
  }, [candidates, filters, search, isLoader]);

  const decodeBase64 = (encoded) => {
    try {
      const result = atob(encoded);
      setDecodedPassword(result);
    } catch (e) {
      console.log("Invalid Base64 string");
    }
  };

  const candidateActions = (action, recruiter_email) => {
    if (!action) {
      return;
    }

    let isSendInvite = action == "send-invite";

    let payload = {
      action: action,
      admin_email: user.email,
      recruiter_email: recruiter_email,
    };

    if (isSendInvite) {
      setCreateLoader(true);
    } else {
      setIsLoading(action);
    }

    api
      .RecruiterActions(payload)
      .then((res) => {
        if (isSendInvite) {
          getCandidates();
          return assignPermitions({ recruiter_email });
        }

        toast.success(res.message);

        if (res.temp_password) {
          decodeBase64(res.temp_password);
        } else {
          setIsModalActive(false);
          getCandidates();
        }
        setCreateLoader(false);
        setIsLoading(false);
      })
      .catch((err) => {
        setCreateLoader(false);
        setIsLoading(false);
        toast.error(err?.error || err?.message || "");
        console.log(err, "error is err");
      });
  };

  const renderFilters = () => {
    const filtersObj = [
      {
        label: "Team",
        key: "recruiter_team",
        image: list,
        valueKey: "value",
        labelKey: "text",
        data: teamsDropDown,
      },
      {
        label: "Status",
        key: "recruiter_status",
        image: status_filter,
        valueKey: "value",
        labelKey: "label",
        data: [
          { value: "Active", label: "Active" },
          { value: "In Active", label: "In Active" },
        ],
      },
      {
        label: "Manager",
        key: "recruiter_manager",
        icon: "person",
        valueKey: "value",
        labelKey: "text",
        data: managers,
      },
    ];

    return (
      <div className="headerboxoverflow d-flex justify-content-between align-items-center p-0 mb-3 pe-3">
        <div className="d-flex align-items-center gap-3">
          {filtersObj.map((filter, index) => {
            const isActive = filters[filter.key] && filters[filter.key] !== "All";

            let isrecruiter_manager = filter?.key == "recruiter_manager";

            if (isrecruiter_manager) {
              let dataToMap = [{ label: "Filter By Manager", value: "" }, ...filter.data].map((item) => {
                return { label: item?.label || item.text, value: item?.value || "" };
              });

              return (
                <SelectPicker
                  caretAs={() => <FaChevronDown />}
                  renderValue={(value, item) => {
                    return (
                      <div className="mx-auto d-flex align-items-center gap-2" style={{ maxWidth: "95%" }}>
                        <span style={{ fontSize: "18px" }} className="material-symbols-outlined">
                          {filter.icon}
                        </span>

                        <span title={item?.label} className="text-truncate w-100">
                          {item?.label || "Filter by Recruiter"}
                        </span>
                      </div>
                    );
                  }}
                  style={{ paddingTop: "7px", paddingBottom: "7px" }}
                  classPrefix="transparentFilter_"
                  className={`selectpickerNormaltransparent ${
                    isActive ? "bg-white activeSelectimage px-0 " + styles.activeSelect : ""
                  }`}
                  menuClassName="selectpickerNormalitemsTransparent"
                  placement="autoVertical"
                  cleanable={false}
                  onChange={(value) => setFilters({ ...filters, [filter.key]: value })}
                  value={filters[filter.key] || "All"}
                  data={dataToMap}
                  placeholder="Select Recruiter"
                />
              );
            }

            return (
              <div
                key={index}
                className={`filter-select d-flex align-items-center p-0 selectFilterallnew  ${
                  isActive ? "activeSelectimage" : "inactiveSelectimage"
                }`}
              >
                {filter.image && <img className="selectImageimage" src={filter.image} alt="" width="20" height="20" />}
                {filter.icon && (
                  <span style={{ fontSize: "18px" }} className="selectImageimage material-symbols-outlined">
                    {filter.icon}
                  </span>
                )}
                <select
                  className="form-select"
                  onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                  value={filters[filter.key] || "All"}
                >
                  <option value="All">Filter by {filter.label}</option>
                  {filter.data.map((option, idx) => (
                    <option
                      key={idx}
                      value={option[filter.valueKey]}
                      className={filters[filter.key] === option[filter.valueKey] ? styles.list_active : ""}
                    >
                      {option[filter.labelKey]}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <div className="d-flex align-items-center gap-1 pointer fw-light nowrap" onClick={() => setFilters({})}>
            <span className="material-symbols-outlined">close</span>
            Clear Filters
          </div>
        </div>
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

  const renderPaginationDetails = () => {
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
              className={`btn ${styles.pages} ${
                currentPage === page ? "btn-primary " + styles.activePage : "btn-light"
              }`}
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

    return (
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
    );
  };

  const renderEditHeader = (candidateData) => {
    if (!update) {
      return <></>;
    }

    let isSendInvite = String(candidateData?.online_account).toLocaleLowerCase() != "yes";

    return (
      <div className={`d-flex aligin-items-center gap-4 justify-content-between ${styles.userbgcontainer}`}>
        <div className="d-flex aligin-items-center gap-3">
          <div>
            <img className={styles.userImage} src={returnIcon(candidateData?.gender)} alt="user icon" />
          </div>
          <div>
            <strong>{candidateData.recruiter_name || " "}</strong>
            <br />
            <small className="lightfont">{candidateData.recruiter_email || ""}</small>
          </div>
        </div>
        {false ? (
          <></>
        ) : (
          <div className="d-flex aligin-items-center gap-3 nowrap align-items-center">
            {isSendInvite ? (
              renderSpinnerCOntent(
                <div
                  onClick={() => {
                    setShowModalDialog("send-invite");
                    setModalTitle("Send Invite");
                    setDeleteTeamText(
                      `Are you sure you want to send an invite to <b>${candidateData.recruiter_name}?</b><br/>This cannot be undone.`,
                    );
                  }}
                  className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}
                >
                  <span className="send-outline-gray" /> Send Invite
                </div>,
                "send-invite",
              )
            ) : (
              <></>
            )}
            {renderSpinnerCOntent(
              <div
                onClick={() => {
                  setShowModalDialog("password-reset");
                  setModalTitle("Reset Password");
                  setDeleteTeamText(
                    `Are you sure you want to reset the password for <b>${candidateData.recruiter_name}?</b><br/>`,
                  );
                }}
                className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}
              >
                <span className="passwordicon" /> Reset Password
              </div>,
              "password-reset",
            )}

            {String(candidateData?.account_status).toLocaleLowerCase() == "active" ? (
              renderSpinnerCOntent(
                <div
                  onClick={() => {
                    setShowModalDialog("deactivate");
                    setModalTitle("Block Sign-In");
                    setDeleteTeamText(`Are you sure you want to Block Sign-In for <b>${candidateData.recruiter_name}?`);
                  }}
                  className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
                >
                  <span className="material-symbols-outlined">block</span> Block Sign-in
                </div>,
                "deactivate",
              )
            ) : isSendInvite ? (
              <></>
            ) : (
              renderSpinnerCOntent(
                <div
                  onClick={() => {
                    setShowModalDialog("activate");
                    setModalTitle("Activate Recruiter");
                    setDeleteTeamText(`Are you sure you want to activate <b>${candidateData.recruiter_name}?`);
                  }}
                  className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
                >
                  <span class="material-symbols-outlined">check_circle</span> Active
                </div>,
                "activate",
              )
            )}
            <div
              onClick={() => {
                handleDeleteCandidateModal(candidateData.id);
                setModalTitle("Delete Recruiter");
                setDeleteTeamText(
                  `Are you sure you want to delete <b>${candidateData.recruiter_name}?</b><br/>This cannot be undone.`,
                );
              }}
              className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
            >
              <span className="deleteusericon" /> Delete User
            </div>
          </div>
        )}
      </div>
    );
  };

  function renderRoleBadge(userRole) {
    const key = (userRole || "").toLowerCase();
    const classMap = {
      recruiter: tableStyles.recruiterRole,
      "super admin": tableStyles.superAdminRole,
      admin: tableStyles.adminRole,
    };

    const badgeClass = classMap[key] || tableStyles.pendingRole;
    const displayText = userRole || "Pending";

    return (
      <div className="d-flex align-items-center justify-content-center">
        <div className={`${badgeClass} nowrap`}>{displayText}</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {renderFilters()}
        <div className={`table-responsive  ${tableStyles.table}`}>
          <table className={`table table-borderless table-hover align-middle`}>
            <thead className={tableStyles.thead}>
              <tr>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    <span class="material-symbols-outlined">person</span>
                    <span>Name</span>
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1 justify-content-center">
                    <span className="user-search-filled" style={{ color: "#454545" }} />
                    <span>Role</span>
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    <img src={list} />
                    <span>Status</span>
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <span className="user-lock" />
                    <span>Manage Permissions</span>
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    <span
                      class="material-symbols-outlined"
                      style={{
                        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      nest_clock_farsight_analog
                    </span>

                    <span>Created At</span>
                  </div>
                </th>
                {editPermitions ? (
                  <th>
                    <div className="d-flex gap-1 align-items-center text-center justify-content-center">
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        action_key
                      </span>
                      <span>Actions</span>
                    </div>
                  </th>
                ) : (
                  <></>
                )}
              </tr>
            </thead>
            <tbody className={`${tableStyles.tbody}`}>
              {filteredCandidates.length > 0 ? (
                currentRows.map((candidate, index) => {
                  let isActive = String(candidate?.details[0]?.account_status).toLowerCase() == "active";

                  return (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            className={styles.userIcon}
                            src={returnIcon(candidate?.details[0]?.gender)}
                            alt={candidate?.details[0]?.recruiter_name}
                          />
                          <div>
                            <strong>{candidate?.details[0]?.recruiter_name}</strong>
                            <br />
                            <small>{candidate?.details[0]?.recruiter_email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{renderRoleBadge(candidate?.details[0]?.user_role)}</td>
                      <td>
                        {/* <div
                          className={
                            String(candidate?.details[0]?.account_status).toLowerCase() == "active"
                              ? tableStyles.activebadge
                              : tableStyles.inactivebadge
                          }
                        >
                          <span className={tableStyles.dot} />
                          <span className="capitalize">{candidate?.details[0]?.account_status}</span>
                        </div> */}
                        <div
                          className={
                            candidate?.details[0]?.recruiter_status === "Active"
                              ? tableStyles.activebadge
                              : tableStyles.inactivebadge
                          }
                        >
                          <span className={tableStyles.dot} />
                          <span>{candidate?.details[0]?.recruiter_status}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <div
                            title={isActive ? "" : "Activate the user via Send Invite to enable permissions."}
                            onClick={() => {
                              if (isActive) {
                                setCandidateData(candidate?.details[0]);
                              }
                            }}
                            className={styles.permissions}
                            style={{ cursor: isActive ? "pointer" : "not-allowed", color: isActive ? "" : "#a6aeb8" }}
                          >
                            Permissions
                          </div>
                        </div>
                      </td>
                      <td>{candidate?.details[0]?.created_at}</td>
                      {editPermitions ? (
                        <td>
                          <div class={`dropdown text-center ${tableStyles.themeColor}`}>
                            <button
                              className="btn btn-light mx-auto text-center"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              ⋮
                            </button>
                            <ul class="dropdown-menu ">
                              <li>
                                <button
                                  className={`${tableStyles.dropdown_item} ${tableStyles.themeColor} d-flex align-items-center gap-2 dropdown-item`}
                                  onClick={() => handleUpdateRecruiter(candidate?.details[0])}
                                >
                                  <span class="font14 material-symbols-outlined">edit_square</span>
                                  Edit
                                </button>
                              </li>

                              <li>
                                <button
                                  onClick={() => {
                                    setDeleteTeamText(`
                                    Are you sure you want to delete <b>${candidate?.details[0].recruiter_name}?</b><br/>This cannot be undone.
                                    `);
                                    handleDeleteCandidate(candidate?.details[0].id);
                                  }}
                                  className={`${tableStyles.dropdown_item} ${tableStyles.themeColor} d-flex align-items-center gap-2 dropdown-item`}
                                >
                                  <span class="font14 material-symbols-outlined">delete</span>
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      ) : (
                        <></>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  {isLoader ? (
                    <td colSpan="7">
                      <Placeholder.Paragraph active />
                    </td>
                  ) : (
                    <td colSpan="7">No data available</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPaginationDetails()}
      </div>
      {isModalActive && <div className="overlay"></div>}
      {isModalActive && (
        <OverlayModal
          isActive={isModalActive}
          onClose={() => {
            resetState();
            setDecodedPassword("");
            setIsModalActive(false);
            setShowModalDialog(false);
            setDeleteId("");
          }}
        >
          {renderEditHeader(editCandidateData)}
          <div className={`d-flex flex-column justify-start gap-3 mt-3 ${styles.formContainer}`}>
            <div className={`${styles.themeColor} d-flex align-items-center gap-2`}>
              <img src={JobCount} className="" style={{ height: "18px" }} />
              <div>{update ? "Update" : "Create"} Recruiter </div>
            </div>
            <form onSubmit={handleSubmit(update ? updateRecruiter : addRecruiter)}>
              <div className={styles.formflexContainer}>
                <div>
                  <label className={`form-label ${styles.formlabel}`}>First Name</label>
                  <input
                    className={`form-control`}
                    id="first_name"
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    {...register("first_name", {
                      required: "First Name is required",
                    })}
                  />
                  {errors.first_name && <span className="v2-login-error">{errors.first_name.message}</span>}
                </div>

                <div>
                  <label className={`form-label ${styles.formlabel}`}>Last Name</label>
                  <input
                    className={`form-control`}
                    id="last_name"
                    type="text"
                    placeholder="Last Name"
                    name="last_name"
                    {...register("last_name", {
                      required: "Last Name is required",
                    })}
                  />
                  {errors.last_name && <span className="v2-login-error">{errors.last_name.message}</span>}
                </div>
                <div>
                  <label className={`form-label ${styles.formlabel}`}> Email</label>
                  <input
                    className={`form-control`}
                    id="recruiter_email"
                    type="text"
                    placeholder="Email"
                    name="recruiter_email"
                    {...register("recruiter_email", {
                      required: "Email is required",
                      validate: (value) => {
                        if (!domain) return "Organization domain not found";

                        const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@${domain.replace(/\./g, "\\.")}$`);
                        return regex.test(value) || `Email must be a valid ${domain} address`;
                      },
                    })}
                  />
                  {errors.recruiter_email && <span className="v2-login-error">{errors.recruiter_email.message}</span>}
                </div>

                <div>
                  <label className={`form-label ${styles.formlabel}`}>Gender</label> <br />
                  <select
                    className="form-select"
                    id="gender"
                    name="gender"
                    {...register("gender", {
                      required: "Gender is required",
                    })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                  {errors.gender && <span className="v2-login-error">{errors.gender.message}</span>}
                </div>
                <div>
                  <label className={`form-label ${styles.formlabel}`}>Status</label> <br />
                  <select
                    className="form-select"
                    id="recruiter_status"
                    name="recruiter_status"
                    {...register("recruiter_status", {
                      required: "Status is required",
                    })}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="In Active">In Active</option>
                  </select>
                  {errors.recruiter_status && <span className="v2-login-error">{errors.recruiter_status.message}</span>}
                </div>

                <div>
                  <label className={`form-label ${styles.formlabel}`}>Job Title</label> <br />
                  <select className="form-select" id="job_title" name="job_title" {...register("job_title")}>
                    <option value="">Select job title</option>
                    {jobs?.length > 0 &&
                      jobs?.map((value) => (
                        <option key={value.id} value={value.title_name}>
                          {value.title_name}
                        </option>
                      ))}
                  </select>
                  {errors.job_title && <span className="v2-login-error">{errors.job_title.message}</span>}
                </div>
                <div>
                  <label className={`form-label ${styles.formlabel}`}>Team</label> <br />
                  <select
                    className="form-select"
                    id="recruiter_team"
                    name="recruiter_team"
                    {...register("recruiter_team", {
                      required: "Team is required",
                    })}
                  >
                    <option value="">Select Team</option>
                    {teams?.length > 0 &&
                      teams?.map((value) => (
                        <option key={value?.id} value={value?.team_name}>
                          {value?.team_name}
                        </option>
                      ))}
                  </select>
                  {errors.recruiter_team && <span className="v2-login-error">{errors.recruiter_team.message}</span>}
                </div>
                <div>
                  <label className={`form-label ${styles.formlabel}`}>Manager status</label> <br />
                  <select
                    className="form-select"
                    id="is_manager"
                    name="is_manager"
                    {...register("is_manager", {
                      required: "Field is required",
                    })}
                  >
                    <option value="">Is Manager</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                  {errors.is_manager && <span className="v2-login-error">{errors.is_manager.message}</span>}
                </div>

                {!isManager && (
                  <div>
                    <label className={`form-label ${styles.formlabel}`}>Manager</label> <br />
                    <select
                      className="form-select"
                      id="recruiter_manager"
                      name="recruiter_manager"
                      {...register("recruiter_manager", { required: "Maanger is required" })}
                    >
                      <option value="">Select Manager</option>
                      {managers.map((value) => (
                        <option key={value.value} value={value.value}>
                          {value.text}
                        </option>
                      ))}
                    </select>
                    {errors.recruiter_manager && (
                      <span className="v2-login-error">{errors.recruiter_manager.message}</span>
                    )}
                  </div>
                )}

                <div>
                  <label className={`form-label ${styles.formlabel}`}> Joining Date</label>

                  <DatePicker
                    maxDate={"2099"}
                    showIcon
                    toggleCalendarOnIconClick
                    calendarIconClassName="calenderIconRight"
                    showYearDropdown
                    showMonthDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={80}
                    selected={pickDateOnly(watch("recruiter_joining_date")) || null}
                    onChange={(date) => {
                      const formatted = formatDateToET(date);
                      setValue("recruiter_joining_date", formatted, { shouldValidate: true });
                    }}
                    // onChange={(date) => setValue("recruiter_joining_date", date, { shouldValidate: true })}
                    className="form-control ps-2"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                  />
                  <input
                    className={`form-control`}
                    id="recruiter_joining_date"
                    type="hidden"
                    {...register("recruiter_joining_date", {
                      required: "Date is required",
                    })}
                  />
                  {errors.recruiter_joining_date && (
                    <span className="v2-login-error">{errors.recruiter_joining_date.message}</span>
                  )}
                </div>
              </div>

              <div className="d-flex justify-end my-3 mt-4">
                <button
                  className={`d-flex align-items-center gap-2 pointer themeButton`}
                  type="submit"
                  onClick={update ? updateRecruiter : addRecruiter}
                >
                  <span class="material-symbols-outlined">save</span>
                  {update ? "Save" : "Create"}{" "}
                </button>
              </div>
            </form>

            <Confirm
              show={decodedPassword}
              deleteTitle="Copy"
              icon="content_copy"
              result={(result) => {
                if (result) {
                  navigator.clipboard
                    .writeText(decodedPassword)
                    .then(() => {
                      toast.success("Copied to clipboard!");
                    })
                    .catch((err) => toast.error("Failed to copy"));
                }
                setDecodedPassword("");
              }}
              title={`Password Updated`}
              text={`Your new password is: <b> ${decodedPassword}</b>`}
            />

            <Confirm
              show={showModalDialog}
              result={(result) => {
                setShowModalDialog(false);
                if (result) {
                  if (showModalDialog == true) {
                    deleteRecruiter(deleteId);
                  } else {
                    candidateActions(showModalDialog, editCandidateData.recruiter_email);
                  }
                }
                setTimeout(() => {
                  setDeleteId("");
                }, 500);
              }}
              title={modalTitle}
              text={deleteTeamText}
              deleteTitle="Yes, I'm Sure"
            />
            <ThemeLoader
              fixed
              show={isLoading == true || createLoader}
              message={
                loaderMessage
                  ? loaderMessage
                  : createLoader
                    ? "Sending invitation and assigning permissions. Please wait…"
                    : ""
              }
            />
          </div>
        </OverlayModal>
      )}

      <PermitionsModal show={candidateData} setShow={setCandidateData} update={getCandidates} />
      <Confirm
        show={showDialog}
        result={(result) => {
          setShowDialog(false);
          if (result) {
            deleteRecruiter(deleteId);
          }
        }}
        title="Delete Recruiter"
        text={deleteTeamText}
        deleteTitle="Yes, I'm Sure"
      />
      <ThemeLoader show={isLoading == true || isLoader} />
    </div>
  );
};

export default RecruiterDetails;
