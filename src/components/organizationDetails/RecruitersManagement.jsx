import React, { useEffect, useState } from "react";
import Edit from "../../assets/images/Edit.svg";
import Delete from "../../assets/images/Delete.svg";
import ConfirmationDialogBox from "../ConfirmationDialogBox";
import Close from "../../assets/images/Close.svg";
import Loader from "../Loader";
import OverlayModal from "../OverlayModal";
import Table from "../Table";
import makeRequest from "../../helpers/http-request";
import { toast } from "react-toastify";
import { ManagersManagementHeaders } from "../../assets/data/TableHeaders";
import { useForm } from "react-hook-form";
import DropDown from "../DropDown";
import Prev from '../../assets/images/Prev.svg';
import Next from '../../assets/images/Next.svg';
import MaleImg from '../../assets/images/MaleImg.png';
import FemaleImg from '../../assets/images/FemaleImg.png';

const RecruitersManagement = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [updateId, setUpdateId] = useState(null);
  const [update, setUpdate] = useState(false);
  const [recruiterDetails, setRecruiterDetails] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [search, setSearch] = useState("");
  const [pageLoad, setPageLoad] = useState(true);
  const [teamsDropDown, setTeamsDropDown] = useState(null);
  const [managersDropDown, setManagersDropDown] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  let pageLimit = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm();

  const email = watch("is_manager");
  console.log(email)

  const url =
    "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";

  const getManagers = async () => {
    try {
      const options = {
        url : "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3",
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "getmanagers",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        setManagers(res?.data?.managers);
        console.log(res?.data?.managers);
      }
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

  const getRecruiters = async () => {
    if (recruiterDetails.length > 0) return;
    try {
      const url =
        "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "retrieve",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        setRecruiterDetails(res?.data?.data);
        setPageLoad(false);
        console.log(res?.data?.data)
      }
    } catch (err) {
      console.log(err);
    }
  };

  
  const addRecruiter = async (data) => {
    console.log({...data, recruiter_alias_name : data.recruiter_email});
    try {
    } catch (err) {}
  };

  const handleUpdateRecruiter = (data) => {
    console.log(data);
    setUpdate(true);
    setIsModalActive(true);
    setValue("recruiter_name", data.recruiter_name);
    setValue("recruiter_email", data.recruiter_email);
    setValue("recruiter_joining_date", data.recruiter_joining_date);
    setValue("gender", data.gender);
    setValue("recruiter_status", data.recruiter_status);
    setValue("recruiter_team", data.recruiter_team);
    console.log(data.recruiter_team);
    setValue("is_manager", data.is_manager ? "Yes" : "No");
    setValue("recruiter_manager", "Akash");
  };

  const updateRecruiter = async (data) => {
    console.log(data);
    try {
    } catch (err) {}
  };

  const deleteRecruiter = async (id) => {
    try {
      const url =
        "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3";

      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "delete",
          id: deleteId,
        },
      };

      const res = await makeRequest(options);

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteTeam = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  useEffect(() => {
    getRecruiters();
    getTeams();
    getManagers();
    getTitles();
  }, []);

  useEffect(() => {
    let filtered = recruiterDetails;

    if (selectedStatus) {
      filtered = filtered.filter(
        (value) =>
          String(value?.details[0]?.recruiter_status) ==
          String(selectedStatus?.value)
      );
    }

    if (search) {
      filtered = filtered.filter((value) =>
        value?.details[0]?.recruiter_name
          ?.toLowerCase()
          .includes(search?.toLowerCase())
      );
    }

    if (selectedTeam) {
      filtered = filtered.filter(
        (value) => value?.details[0]?.recruiter_team == selectedTeam?.value
      );
    }

    const startIndex = (pageCount-1)*pageLimit;
    const endIndex = pageCount * pageLimit
    setFilteredRecruiters(filtered.slice(startIndex, endIndex));
  }, [selectedStatus, selectedTeam, selectedManager, recruiterDetails, search, pageCount]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus(null);
    setSelectedManager(null);
    setSelectedTeam(null);
  };

  const handlePaginationNext = () => {
    if(pageCount <= Math.ceil(filteredRecruiters.length / pageLimit)){
      setPageCount(pageCount+1);
  }
}

  const handlePaginationPrev = () => {
    if(pageCount > 1 ){
      setPageCount(pageCount-1);
    }
  }

  const resetState=()=>{
    setUpdate(false);
    setIsLoading(false);
    reset();
  }

  return (
    <>
      <div className="org-body width-100">
        <div>
          <div className="v2-btn-container d-flex justify-end">
            <div className="width-100 d-flex align-center gap-4">
              <div className="teams-input">
                <input
                  value={search}
                  type="search"
                  placeholder="search by teams"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="teams-dropDown-container">
                <DropDown
                  selected={selectedManager}
                  setSelected={setSelectedManager}
                  data={[
                    { value: true, text: "Active" },
                    { value: false, text: "Inactive" },
                  ]}
                  text="Filter by manager"
                />
              </div>
              <div className="teams-dropDown-container">
                <DropDown
                  selected={selectedTeam}
                  setSelected={setSelectedTeam}
                  data={teamsDropDown}
                  text="Filter by team"
                />
              </div>
              <div className="teams-dropDown-container">
                <DropDown
                  selected={selectedStatus}
                  setSelected={setSelectedStatus}
                  data={[
                    { value: "Active", text: "Active" },
                    { value: "Inactive", text: "Inactive" },
                  ]}
                  text="Filter by status"
                />
              </div>
              <div className="clear-filters">
                <button className="cursor-pointer" onClick={handleClearFilters}>
                  Clear filters
                </button>
              </div>
            </div>
            <button
              className="v2-btn cursor-pointer"
              onClick={() => {
                setIsModalActive(true)
                resetState()
              }}
            >
              Create
            </button>
          </div>
          <div className="width-100">
          {!pageLoad ? (<Table headers={ManagersManagementHeaders}>
              {filteredRecruiters?.map((value, index) => (
                <tr key={value?.details[0].id} className="v2-table-body">
                  <td>
                    <div className="d-flex align-center gap-3">
                      <img  className='v2-male-icon' src={value?.details[0]?.gender == "Male" ? MaleImg : FemaleImg}/>
                    {value?.details[0]?.recruiter_name}
                      </div>
                  </td>
                  <td>{value?.details[0]?.recruiter_email}</td>
                  <td>{value?.details[0]?.recruiter_team}</td>
                  <td>{value?.details[0]?.recruiter_manager}</td>
                  <td
                    className={`${
                      value?.details[0]?.recruiter_status == "Active"
                        ? "table-status-success"
                        : "table-status-warning"
                    } table-status`}
                  >
                    {value?.details[0]?.recruiter_status == "Active"
                      ? "Active"
                      : "InActive"}
                  </td>
                  <td>
                    <div className="v2-table-actions d-flex justify-evenly align-center">
                      <img
                        className="cursor-pointer"
                        src={Edit}
                        onClick={() => handleUpdateRecruiter(value?.details[0])}
                      />
                      <img
                        className="cursor-pointer"
                        src={Delete}
                        onClick={() => handleDeleteTeam(value?.details[0].id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </Table>) : (
              <div className="d-flex justify-center  align-center loader-container">
              <Loader
                style={{
                  borderColor: "#6115BE",
                  width: "30px",
                  height: "30px",
                }}
              />
            </div>
          )}
          </div>
          
          <div className="d-flex justify-end align-center gap-4 mt-2">
            <button className="v2-page-btn" onClick={()=>handlePaginationPrev()}>
              <img src={Prev}/>
            </button>
            <p>{pageCount}</p>
            <button className="v2-page-btn" onClick={()=>handlePaginationNext()}>
              <img src={Next}/>
            </button>
          </div>
        </div>
      </div>

      {isModalActive && (
        <OverlayModal isActive={isModalActive}>
          <div className="org-btn-container d-flex flex-column justify-start gap-3">
            <div
              className="d-flex justify-end cursor-pointer"
              onClick={() => {
                setIsModalActive(false);
              }}
            >
              <img src={Close} />
            </div>
            <p className="v2-heading">
              {update ? "Update  Recruiter" : "Add Recruiter"}
            </p>
            <div>
              <form onSubmit={handleSubmit(addRecruiter)}>
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
                  {errors.recruiter_name && (
                    <span className="v2-login-error">
                      {errors.recruiter_name.message}
                    </span>
                  )}
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
                  {errors.recruiter_email && (
                    <span className="v2-login-error">
                      {errors.recruiter_email.message}
                    </span>
                  )}
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
                    {errors.gender && (
                      <span className="v2-login-error">
                        {errors.gender.message}
                      </span>
                    )}
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
                      <span className="v2-login-error">
                        {errors.recruiter_status.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-container">
                  <label htmlFor="rJob">Job Title</label> <br />
                  <select
                    className="org-manager-dropDown"
                    id="job_title"
                    name="job_title"
                    {...register("job_title", {
                      required: "Job title is required",
                    })}
                  >
                    <option value="">Select job title</option>
                    {jobs?.length > 0 &&
                      jobs?.map((value) => (
                        <option key={value.id} value={value.title_name}>
                          {value.title_name}
                        </option>
                      ))}
                  </select>
                  {errors.job_title && (
                    <span className="v2-login-error">
                      {errors.job_title.message}
                    </span>
                  )}
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
                    {errors.recruiter_team && (
                      <span className="v2-login-error">
                        {errors.recruiter_team.message}
                      </span>
                    )}
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
                      <option value={true || "Yes"}>Yes</option>
                      <option value={false || ""}>No</option>
                    </select>
                    {errors.is_manager && (
                      <span className="v2-login-error">
                        {errors.is_manager.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-container">
                  <label htmlFor="recruiter_manager">Manager</label> <br />
                  <select
                    className="org-manager-dropDown"
                    id="recruiter_manager"
                    name="recruiter_manager"
                    {...register("recruiter_manager", {
                      required: "Manager is required",
                    })}
                  >
                    <option value="">Select Manager</option>
                    {managers?.length > 0 &&
                      managers?.map((value) => (
                        <option key={value.id}>{}</option>
                      ))}
                    <option value="Akash">Akash</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.recruiter_manager && (
                    <span className="v2-login-error">
                      {errors.recruiter_manager.message}
                    </span>
                  )}
                </div>
                <div className="form-container d-flex justify-between">
                  <div className="org-mini-dropDown">
                    <label
                      className="v2-label"
                      htmlFor="recruiter_joining_date"
                    >
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
                      <span className="v2-login-error">
                        {errors.recruiter_joining_date.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-end">
                  <button
                    type="submit"
                    className={`v2-btn ${
                      isLoading && "v2-btn-loader"
                    } d-flex justify-center cursor-pointer`}
                    onClick={update ? updateRecruiter : addRecruiter}
                    // onClick={update ? updateRecruiter : addRecruiter}
                  >
                    {isLoading ? (
                      <Loader />
                    ) : update ? (
                      "Update Details"
                    ) : (
                      "Add Details"
                    )}
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
    </>
  );
};

export default RecruitersManagement;
