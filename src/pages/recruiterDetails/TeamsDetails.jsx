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
import { TeamsManagementHeaders } from "../../assets/data/TableHeaders.js";

const RecruiterDetails = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [input, setInput] = useState("");
  const [teams, setTeams] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [updateId, setUpdateId] = useState(null);
  const [update, setUpdate] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [pageLoad, setPageLoad] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [error, setError] = useState(null);

  const pageCount = 10;
  const url =
  "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";



  const getTeams = async () => {
    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          type: "teams",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        setPageLoad(false);
        setTeams(res?.data?.records);
        setHeaders(TeamsManagementHeaders);
      }
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addTeam = async () => {
    if(!input){
      setError("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          type: "teams",
          operation: "insert",
          name: input,
        },
      };
      const res = await makeRequest(options);

      if (res?.status == 200) {
        console.log(res);
        // setTeams((prev)=>[...prev, res?.data?.record]);
        getTeams();
        setIsModalActive(false);
        setIsLoading(false);
        setInput("");
        toast.success("Team Added successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateTeam = async () => {
    if(!input){
      setError("Name is required")
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          id: updateId,
          name: input.trim(),
          is_active: statusUpdate.value,
          type: "teams",
          operation: "update",
        },
      };

      const res = await makeRequest(options);
      console.log(res);

      if (res?.status == 200) {
        getTeams();
        setIsModalActive(false);
        setUpdate(false);
        setUpdateId(null);
        setIsLoading(false);
        setInput("");
        toast.success("Team modified successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTeam = async (id) => {
    setIsLoading(true);

    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "delete",
          type: "teams",
          id,
        },
      };

      const res = await makeRequest(options);

      if (res?.data?.status == "success") {
        // setTeams(teams.filter((team) => team.id !== deleteId));
        getTeams();
        setShowDialog(false);
        setDeleteId(null);
        setIsLoading(false);
        toast.success("Team deleted successfully");
      }
    } catch (err) {}
  };

  const handleDeleteTeam = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  const handleUpdate = (value) => {
    setUpdate(true);
    setUpdateId(value.id);
    setInput(value.team_name);
    value.is_active ? setStatusUpdate({value: true, text: "Active"}) : setStatusUpdate({value: false, text:"Inactive"})
    setIsModalActive(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelected(null);
  };


  useEffect(() => {
    let filtered = teams;

    if (selected) {
      filtered = filtered.filter(
        (value) => String(value.is_active) == String(selected.value)
      );
    }

    if (search) {
      filtered = filtered.filter((value) =>
        value.team_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (pageCount - 1) * pageCount;
    const endIndex = pageCount * pageCount;
    setFilteredTeams(filtered);
  }, [
    teams,
    search,
    selected,
    pageCount
  ]);

//   const handlePaginationNext = () => {
//     if(pageCount <= Math.ceil(filteredCandidates.length / pageCount)){
//       setPageCount(pageCount+1);
//   }
// }

//   const handlePaginationPrev = () => {
//     if(pageCount > 1 ){
//       setPageCount(pageCount-1);
//     }
//   }

  useEffect(() => {
    getTeams();
  }, []);

  console.log(teams);

  const resetState=()=>{
    setUpdate(false);
    setIsLoading(false);
    setInput("");
  }

  const handleDeleteCandidate = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  }


  return (
    <div>
      <div className="main-dash row-flex">
        <section className="w-100">
          <div className="filters-data row-flex">
            <div className="filters-left-data ">
              <div className="teams-input">
              <input
                  value={search}
                  type="search"
                  placeholder="Search by Teams"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="teams-dropdown-container">
              <DropDown
                  selected={selected}
                  setSelected={setSelected}
                  data={[
                    { value: true, text: "Active" },
                    { value: false, text: "Inactive" },
                  ]}
                  text="Filter by Status"
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
                <img src={AddIcon} onClick={()=>{
                  setIsModalActive(true)
                }} />
              </button>
              <div>Teams: {teams?.length}</div>
            </div>
          </div>

          <div className="mainContent">
            <div className="table-container">
              <table className="dynamic-table-data">
                <thead>
                  <tr>
                    <th>
                      <div className="alignCenter">Team</div>
                    </th>
                    <th>
                      <div className="alignCenter">Status</div>
                    </th>

                    <th>
                      <div className="alignCenter act-col">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team, index) => (
                      <tr key={team.id}>
                        
                        <td>{team?.team_name}</td>
                        <td
                          className={`status-change-statuschange ${
                            team?.is_active === "Active"
                              ? "active"
                              : team?.is_active  === "Inactive"
                              ? "inactive"
                              : "Unknown"
                          }`}
                        >
                          <div className={`status-change ${team?.is_active ? "status-active" : ""}`}>
                            <span>{team?.is_active ? "Active" : "InActive"}</span>
                          </div>
                        </td>

                        <td>
                          <button
                            onClick={() => handleUpdate(team)}
                            className="button-icon cursor-pointer"
                          >
                            <EditIconButton />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(team?.id)}
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
                setIsModalActive(false)
                resetState(); 
              }}
            >
              <img src={Close} />
            </div>
            <p className="v2-heading">{update ? "Update Team" : "Add Team"}</p>
            <div>
              <label>Team Name</label>
              <input
                className=""
                value={input}
                placeholder="Enter team name"
                onChange={(e) => setInput(e.target.value)}
              />
              {error && <p className="v2-login-error">{error}</p>}
            </div>
            {update && <div>
              <label>Team status</label>
              <DropDown
                style={{padding : "10px"}}
                selected={statusUpdate}
                setSelected={setStatusUpdate}
                text="Select status"
                data={[
                  { value: true, text: "Active" },
                  { value: false, text: "Inactive" },
                ]}
              />
            </div>}
            <div className="d-flex justify-end">
              <button
                className={`v2-btn ${
                  isLoading && "v2-btn-loader"
                } d-flex justify-center cursor-pointer`}
                onClick={update ? updateTeam : addTeam}
              >
                {isLoading ? <Loader /> : update ? "Update Team" : "Add Team"}
              </button>
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
            deleteTeam(deleteId);
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
