import React, { useState, useEffect, Component } from "react";
import Dashnav from "../../components/dashnav.jsx";
import TopUser from "../../images/top-user.svg";
import { ReactComponent as EditIconButton } from "../../images/icon-edit.svg";
import { ReactComponent as DeleteIcon } from "../../images/icon-delete.svg";
import { useNavigate } from "react-router-dom";
import AddIcon from "../../images/add-btn-icon.svg";
import { useGlobalContext } from "../../globalContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReactComponent as CandidateNameIcon } from "../../images/candidate-name.svg";
import { ReactComponent as NameUserIcon } from "../../images/name-user-icon.svg";
import { ReactComponent as Female } from "../../images/female.svg";
import { ReactComponent as Others } from "../../images/otherGender.svg";
import OverlayModal from "../../components/OverlayModal.jsx";
import DropDown from "../../components/DropDown.jsx";
import Close from "../../assets/images/Close.svg";
import Loader from "../../components/Loader.jsx";
import { JobsManagementHeaders } from "../../assets/data/TableHeaders.js";

import ConfirmationDialogBox from "../../components/ConfirmationDialogBox.jsx";
import { useForm } from "react-hook-form";
import "./RecruiterDetails.css";
import "../dashboard/style.css";
import makeRequest from "../../helpers/http-request.js";
import { TeamsManagementHeaders } from "../../assets/data/TableHeaders.js";

const TitlesDetails = () => {
    const [isModalActive, setIsModalActive] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [input, setInput] = useState("");
    const [jobs, setJobs] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [updateId, setUpdateId] = useState(null);
    const [update, setUpdate] = useState(false);
    const [filteredTitles, setFilteredTitles] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [pageLoad, setPageLoad] = useState(true);
     const [statusUpdate, setStatusUpdate] = useState(null);
      const [error, setError] = useState(null);

  const pageCount = 10;
  const url =
  "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";


  const getTitles = async () => {
    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          type: "job_titles",
        },
      };

      const res = await makeRequest(options);
      setJobs(res?.data?.records);
      setHeaders(JobsManagementHeaders);
      setPageLoad(false);
    } catch (err) {
      console.log(err);
    }
  };

  const addTitle = async () => {
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
          type: "job_titles",
          operation: "insert",
          name: input,
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        console.log(res);
        getTitles();
        setIsModalActive(false);
        setIsLoading(false);
        setInput("");
        toast.success("Title Added successfully");
      }
    } catch (err) {}
  };

  const updateTitle = async () => {
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
          type: "job_titles",
          operation: "update",
        },
      };

      const res = await makeRequest(options);
      console.log(res);

      if (res?.status == 200) {
        getTitles();
        setIsModalActive(false);
        setUpdate(false);
        setUpdateId(null);
        setIsLoading(false);
        setInput("");
        toast.success("Title modified successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTitle = async (id) => {
    console.log("delete title");

    setIsLoading(true);
    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: "mat@4spheresolutions.com",
          operation: "delete",
          type: "job_titles",
          id,
        },
      };

      const res = await makeRequest(options);

      if (res?.data?.status == "success") {
        // setTeams(teams.filter((team) => team.id !== deleteId));
        getTitles();
        setShowDialog(false);
        setDeleteId(null);
        setIsLoading(false);
        toast.success("Title deleted successfully");
      }
    } catch (err) {}
  };

  const handleUpdate = (value) => {
    setUpdate(true);
    setUpdateId(value.id);
    setInput(value.title_name);
    value.is_active ? setStatusUpdate({value: true, text: "Active"}) : setStatusUpdate({value: false, text:"Inactive"})
    setIsModalActive(true);
  };

  const handleDeleteTeam = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  useEffect(() => {
    getTitles();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (selected) {
      filtered = filtered.filter(
        (value) => String(value.is_active) == String(selected.value)
      );
    }

    if (search) {
      filtered = filtered.filter((value) =>
        value.title_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredTitles(filtered);
  }, [selected, jobs, search]);

  const handleClearFilters = () => {
    setSearch("");
    setSelected(null);
  };

  const resetState=()=>{
    setUpdate(false);
    setInput("");
    setStatusUpdate(null);
    setIsLoading(false);
    setIsModalActive(false);
    setError(false);
  }

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
    getTitles();
  }, []);


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
                  placeholder="Search by Titles"
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
              <div>Titles: {jobs?.length}</div>
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
                  {filteredTitles.length > 0 ? (
                    filteredTitles.map((title, index) => (
                      <tr key={title.id}>
                        
                        <td>{title?.title_name}</td>
                        <td
                          className={`status-change-statuschange ${
                            title?.is_active === "Active"
                              ? "active"
                              : title?.is_active  === "Inactive"
                              ? "inactive"
                              : "Unknown"
                          }`}
                        >
                          <div className={`status-change ${title?.is_active ? "status-active" : ""}`}>
                            <span>{title?.is_active ? "Active" : "InActive"}</span>
                          </div>
                        </td>

                        <td>
                          <button
                            onClick={() => handleUpdate(title)}
                            className="button-icon cursor-pointer"
                          >
                            <EditIconButton />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(title?.id)}
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
            <p className="v2-heading">{update ? "Update Title" : "Add Title"}</p>
            <div>
              <label>Title Name</label>
              <input
                className=""
                value={input}
                placeholder="Enter team name"
                onChange={(e) => setInput(e.target.value)}
              />
              {error && <p className="v2-login-error">{error}</p>}
            </div>
            {update && <div>
              <label>Title status</label>
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
                onClick={update ? updateTitle : addTitle}
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
            deleteTitle(deleteId);
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

export default TitlesDetails;
