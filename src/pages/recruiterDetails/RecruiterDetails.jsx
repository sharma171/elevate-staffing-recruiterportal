import React, { useState, useEffect, Component } from "react";
import Dashnav from "../../components/dashnav";
import TopUser from "../../images/top-user.svg";
import { ReactComponent as EditIconButton } from "../../images/icon-edit.svg";
import { ReactComponent as DeleteIcon } from "../../images/icon-delete.svg";
import { useNavigate } from "react-router-dom";
import AddIcon from "../../images/add-btn-icon.svg";
import { useGlobalContext } from "../../globalContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import OverlayModal from "../../components/OverlayModal";
import DropDown from "../../components/DropDown.jsx";
import Close from "../../assets/images/Close.svg";
import Loader from "../../components/Loader.jsx";

import ConfirmationDialogBox from "../../components/ConfirmationDialogBox.jsx";
import { useForm } from "react-hook-form";
import "./RecruiterDetails.css";
import "../dashboard/style.css";
import makeRequest from "../../helpers/http-request.js";
import { GiConsoleController } from "react-icons/gi";

const RecruiterDetails = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [update, setUpdate] = useState(false);
  const [teams, setTeams] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [teamsDropDown, setTeamsDropDown] = useState([]);
  const [searchRecName, setSearchRecName] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [dataDelete, setDataDelete] = useState(false);
  const [filterByTeam, setFilterByTeam] = useState("");
  const [filterByStatus, setFilterByStatus] = useState("");
  const [filterByManager, setFilterByManager] = useState("");
  const [isModalActive, setIsModalActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [managers, setManagers] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updateId, setUpdateId] = useState(null);
  // const { setSideBarLeft } = useGlobalContext();
  const [deleteId, setDeleteId] = useState(null);
  const [pageLoad, setPageLoad] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  const jobsPerPage = 6;
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";

  const isManager = watch("is_manager") === "true";

  const getManagers = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "getmanagers",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        setManagers(
          res?.data?.managers?.map((value) => {
            return {
              value: value?.recruiter_alias_name,
              text: value?.recruiter_name,
            };
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateRecruiter = async (data) => {
    console.log(data?.is_manager);

    try {
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const payLoad = {
        ...data,

        recruiter_alias_name: data?.recruiter_email,
        is_manager: data?.is_manager === "true",
        recruiter_manager: data?.is_manager === "true" ? data?.recruiter_email : data?.recruiter_manager,
      };

      console.log(payLoad);

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

      const res = await makeRequest(options);

      if (res?.status == 200) {
        getCandidates();
        resetState();
        setIsModalActive(false);
        toast.success("Candidate Updated successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateRecruiter = (data) => {
    setUpdate(true);
    setIsModalActive(true);
    setUpdateId(data.id);
    setValue("recruiter_name", data.recruiter_name);
    setValue("recruiter_email", data.recruiter_email);
    setValue("recruiter_joining_date", data.recruiter_joining_date);
    setValue("gender", data.gender);
    setValue("recruiter_status", data.recruiter_status);
    setValue("recruiter_team", data.recruiter_team);
    setValue("is_manager", data.is_manager ? "true" : "false");
    setValue("recruiter_manager", data.is_manager ? "" : data.recruiter_manager);
  };

  const addRecruiter = async (data) => {
    //  let payload = {
    //   emailid: storedUser.email,
    //   operation: "insert",
    //   columns: {
    //     ...data,
    //     is_manager: Boolean(data.is_manager),
    //     recruiter_alias_name: data.recruiter_email,
    //   },
    // };

    // console.log(payload);

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

      console.log("recruiter payload=======", payload);
      const options = {
        url,
        method: "POST",
        operation: "insert",
        data: payload,
      };

      const res = await makeRequest(options);
      if (res?.status == 200) {
        getCandidates();
        setIsModalActive(false);
        resetState();
        toast.success("Candidate added successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getTitles = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          type: "job_titles",
        },
      };

      const res = await makeRequest(options);
      setJobs(res?.data?.records);
    } catch (err) {
      console.log(err);
    }
  };

  const getTeams = async () => {
    try {
      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          type: "teams",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        setTeams(res?.data?.records);
        setTeamsDropDown(
          res?.data?.records?.map((value) => {
            return { value: value.team_name, text: value.team_name };
          })
        );
      }
    } catch (err) {
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

      const res = await makeRequest(options);
      if (res.status == 200) {
        console.log("candidates ============ ", res?.data?.data);
        setCandidates(res?.data?.data);
        setTotalPages(Math.ceil(res?.data?.data.length / jobsPerPage));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClearFilters = () => {
    setSearchRecName("");
    setFilterByManager(null);
    setFilterByStatus(null);
    setFilterByTeam(null);
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

      const res = await makeRequest(options);

      if (res.status == 200) {
        setShowDialog(false);
        setDeleteId(null);
        getCandidates();
        toast.success("Candidate deleted successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getTitles();
    getTeams();
    getCandidates();
    getManagers();
  }, []);

  const resetState = () => {
    setUpdate(false);
    setIsLoading(false);
    reset();
  };

  const handleDeleteCandidate = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  useEffect(() => {
    let filtered = candidates;

    // Search by name
    if (searchRecName) {
      filtered.map((value) => console.log(value?.details[0]?.recruiter_name));
      filtered = filtered.filter((value) =>
        value?.details[0]?.recruiter_name.toLowerCase().includes(searchRecName.toLowerCase())
      );
    }

    // Filter by team
    if (filterByTeam) {
      filtered = filtered.filter((candidate) => {
        return candidate?.details[0].recruiter_team === filterByTeam.value;
      });
    }

    // Filter by Current status
    if (filterByStatus) {
      filtered = filtered.filter((candidate) => candidate?.details[0].recruiter_status === filterByStatus.value);
    }

    // Filter by manager
    if (filterByManager) {
      filtered = filtered.filter((candidate) => {
        return candidate?.details[0].recruiter_manager === filterByManager.value;
      });
    }

    const startIndex = (pageCount - 1) * jobsPerPage;
    const endIndex = pageCount * jobsPerPage;
    setFilteredCandidates(filtered.slice(startIndex, endIndex));
  }, [candidates, searchRecName, filterByTeam, filterByStatus, filterByManager, candidates, pageCount]);

  const handlePaginationNext = () => {
    if (pageCount < totalPages) {
      setPageCount(pageCount + 1);
    }
  };

  const handlePaginationPrev = () => {
    if (pageCount > 1) {
      setPageCount(pageCount - 1);
    }
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100">
          <div className="filters-data row-flex">
            <div className="filters-left-data ">
              <div className="teams-input">
                <input
                  value={searchRecName}
                  type="search"
                  placeholder="Search by Recruiter"
                  onChange={(e) => setSearchRecName(e.target.value)}
                />
              </div>
              <div className="teams-dropdown-container">
                <DropDown
                  selected={filterByTeam}
                  setSelected={setFilterByTeam}
                  text="Filter by Team"
                  data={[
                    { value: "Team A", text: "Team A" },
                    { value: "Team B", text: "Team B" },
                    { value: "Team C", text: "Team C" },
                    { value: "Team BDE", text: "Team BDE" },
                  ]}
                />
              </div>
              <div className="teams-dropdown-container">
                <DropDown
                  selected={filterByStatus}
                  setSelected={setFilterByStatus}
                  text="Filter by Status"
                  data={[
                    { value: "Active", text: "Active" },
                    { value: "Inactive", text: "Inactive" },
                  ]}
                />
              </div>

              <div className="teams-dropdown-container">
                <DropDown
                  selected={filterByManager}
                  setSelected={setFilterByManager}
                  data={managers}
                  text="Filter by Manager"
                />
              </div>
              <div className="clear-filters">
                <button className="cursor-pointer" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="filters-right-data">
              <button className="cursor-pointer">
                <img
                  src={AddIcon}
                  onClick={() => {
                    setIsModalActive(true);
                    resetState();
                  }}
                />
              </button>
              <div>Candidates: {candidates.length}</div>
            </div>
          </div>

          <div className="mainContent">
            <div className="table-container">
              <table className="dynamic-table-data">
                <thead>
                  <tr>
                    <th>
                      <div className="alignCenter">Name</div>
                    </th>
                    <th>
                      <div className="alignCenter">Email</div>
                    </th>
                    <th>
                      <div className="alignCenter team-col">Team</div>
                    </th>

                    <th>
                      <div className="alignCenter">Manager</div>
                    </th>

                    <th>
                      <div className="alignCenter">Status</div>
                    </th>

                    <th>
                      <div className="alignCenter act-col">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate, index) => (
                      <tr key={candidate?.details[0].id}>
                        <td
                          className={`status-change-statuschange common-cls${
                            candidate?.details[0]?.gender === "Male"
                              ? "Male"
                              : candidate.gender === "Female"
                              ? "Female"
                              : "Other"
                          }`}
                        >
                          <div className="alignCenter common-cls">
                            {candidate?.details[0]?.gender === "Male" ? (
                              <NameUserIcon />
                            ) : candidate?.details[0]?.gender === "Female" ? (
                              <Female />
                            ) : (
                              <Others />
                            )}

                            <span>{candidate?.details[0]?.recruiter_name}</span>
                          </div>
                        </td>
                        <td>{candidate?.details[0]?.recruiter_email}</td>
                        <td>
                          <span className="change-team">{candidate?.details[0]?.recruiter_team}</span>
                        </td>
                        <td>
                          {candidate?.details[0]?.is_manager
                            ? "Not Applicable"
                            : candidate?.details[0]?.recruiter_manager}
                        </td>
                        <td
                          className={` status-change-statuschange ${
                            candidate?.details[0]?.recruiter_status === "Active"
                              ? "active"
                              : candidate?.details[0]?.recruiter_status === "Inactive"
                              ? "inactive"
                              : "Unknown"
                          }`}
                        >
                          <div className={`status-change ${candidate?.details[0]?.recruiter_status}`}>
                            <span>{candidate?.details[0]?.recruiter_status || " "}</span>
                          </div>
                        </td>

                        <td>
                          <button
                            onClick={() => handleUpdateRecruiter(candidate?.details[0])}
                            className="button-icon cursor-pointer"
                          >
                            <EditIconButton />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(candidate?.details[0].id)}
                            className="button-icon cursor-pointer"
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No data available</td>
                    </tr>
                  )}
                </tbody>

                <div className="row-flex navigation" style={{ marginTop: "10px" }}>
                  <button
                    className="left nav"
                    onClick={() => handlePaginationPrev()}
                    // disabled={currentPage === 1}
                  >
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                      <path
                        d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                        fill="#341FA8"
                      />
                    </svg>
                  </button>
                  <span style={{ margin: "0 10px" }} className="text">
                    Page {pageCount} of {totalPages}
                  </span>
                  <button
                    className="nav"
                    onClick={() => handlePaginationNext()}
                    // disabled={currentPage === totalPages}
                  >
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10.3264" cy="10.5759" r="9.92407" fill="#D6D1F3" />
                      <path
                        d="M12.804 10.9292C12.9992 10.734 12.9992 10.4174 12.804 10.2221L9.62198 7.04015C9.42672 6.84489 9.11014 6.84489 8.91488 7.04015C8.71961 7.23541 8.71961 7.55199 8.91488 7.74726L11.7433 10.5757L8.91488 13.4041C8.71961 13.5994 8.71961 13.916 8.91488 14.1112C9.11014 14.3065 9.42672 14.3065 9.62198 14.1112L12.804 10.9292ZM12.1279 11.0757L12.4504 11.0757L12.4504 10.0757L12.1279 10.0757L12.1279 11.0757Z"
                        fill="#341FA8"
                      />
                    </svg>
                  </button>
                </div>
              </table>
            </div>
          </div>
        </section>
      </div>
      {isModalActive && <div className="overlay"></div>}
      {isModalActive && (
        <OverlayModal isActive={isModalActive}>
          <div className="org-btn-container d-flex flex-column justify-start gap-3">
            <div
              className="d-flex justify-end cursor-pointer"
              onClick={() => {
                setIsModalActive(false);
                resetState();
              }}
            >
              <img src={Close} />
            </div>
            <p className="v2-heading">{update ? "Update  Recruiter" : "Add Recruiter"}</p>
            <div>
              <form onSubmit={handleSubmit(update ? updateRecruiter : addRecruiter)}>
                <div className="form-container">
                  <label className="v2-label" htmlFor="recruiter_name">
                    Name
                  </label>
                  <input
                    className="v2-input"
                    id="recruiter_name"
                    type="text"
                    placeholder="Name"
                    name="recruiter_name"
                    {...register("recruiter_name", {
                      required: "Name is required",
                    })}
                  />
                  {errors.recruiter_name && <span className="v2-login-error">{errors.recruiter_name.message}</span>}
                </div>
                <div className="form-container">
                  <label className="v2-label" htmlFor="recruiter_email">
                    Email
                  </label>
                  <input
                    className="v2-input"
                    id="recruiter_email"
                    type="text"
                    placeholder="Email"
                    name="recruiter_email"
                    {...register("recruiter_email", {
                      required: "Email is required",
                    })}
                  />
                  {errors.recruiter_email && <span className="v2-login-error">{errors.recruiter_email.message}</span>}
                </div>
                <div className="form-container d-flex justify-between">
                  <div className="org-mini-dropDown">
                    <label htmlFor="gender">Gender</label> <br />
                    <select
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
                  <div className="org-mini-dropDown">
                    <label htmlFor="recruiter_status">Status</label> <br />
                    <select
                      id="recruiter_status"
                      name="recruiter_status"
                      {...register("recruiter_status", {
                        required: "Status is required",
                      })}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {errors.recruiter_status && (
                      <span className="v2-login-error">{errors.recruiter_status.message}</span>
                    )}
                  </div>
                </div>
                <div className="form-container">
                  <label htmlFor="rJob">Job Title</label> <br />
                  <select className="org-manager-dropDown" id="job_title" name="job_title" {...register("job_title")}>
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
                <div className="form-container d-flex justify-between">
                  <div className="org-mini-dropDown">
                    <label htmlFor="recruiter_team">Team</label> <br />
                    <select
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
                  <div className="org-mini-dropDown">
                    <label htmlFor="is_manager">Manager status</label> <br />
                    <select
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
                </div>
                {!isManager && (
                  <div className="form-container">
                    <label htmlFor="recruiter_manager">Manager</label> <br />
                    <select
                      className="org-manager-dropDown"
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
                <div className="form-container d-flex justify-between">
                  <div className="org-mini-dropDown">
                    <label className="v2-label" htmlFor="recruiter_joining_date">
                      Joining Date
                    </label>
                    <input
                      className="v2-input"
                      id="recruiter_joining_date"
                      type="date"
                      {...register("recruiter_joining_date", {
                        required: "Date is required",
                      })}
                    />
                    {errors.recruiter_joining_date && (
                      <span className="v2-login-error">{errors.recruiter_joining_date.message}</span>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-end">
                  <button
                    type="submit"
                    className={`v2-btn ${isLoading && "v2-btn-loader"} d-flex justify-center cursor-pointer`}
                    onClick={update ? updateRecruiter : addRecruiter}
                  >
                    {isLoading ? <Loader /> : update ? "Update Details" : "Add Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </OverlayModal>
      )}
      {showDialog && (
        <ConfirmationDialogBox
          isLoading={isLoading}
          confirm={confirm}
          setConfirm={setConfirm}
          onConfirm={() => {
            deleteRecruiter(deleteId);
          }}
          onCancel={() => {
            setShowDialog(false);
          }}
          text="Do you permanently want to delete this?"
        />
      )}
    </div>
  );
};

export default RecruiterDetails;
