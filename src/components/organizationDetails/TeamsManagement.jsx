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
import { TeamsManagementHeaders } from "../../assets/data/TableHeaders";
import DropDown from "../DropDown";

const TeamsManagement = () => {
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
    console.log(value);
    setUpdate(true);
    setUpdateId(value.id);
    setInput(value.team_name);
    value.is_active ? setStatusUpdate({value: true, text: "Active"}) : setStatusUpdate({value: false, text:"Inactive"})
    setIsModalActive(true);
  };

  useEffect(() => {
    getTeams();
  }, []);

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

    setFilteredTeams(filtered);
  }, [selected, teams, search]);

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
                  selected={selected}
                  setSelected={setSelected}
                  data={[
                    { value: true, text: "Active" },
                    { value: false, text: "Inactive" },
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
              onClick={() => setIsModalActive(true)}
            >
              Create
            </button>
          </div>
          <div className="width-100">
          {!pageLoad ? (
            <Table headers={headers}>
              {filteredTeams?.map((value, index) => (
                <tr key={value.id} className="v2-table-body">
                  <td>{value?.team_name}</td>
                  <td
                    className={`${
                      value.is_active
                        ? "table-status-success"
                        : "table-status-warning"
                    } table-status`}
                  >
                    {value.is_active ? "Active" : "InActive"}
                  </td>
                  <td>
                    <div className="v2-table-actions d-flex justify-evenly align-center">
                      <img
                        className="cursor-pointer"
                        src={Edit}
                        onClick={() => handleUpdate(value)}
                      />
                      <img
                        className="cursor-pointer"
                        src={Delete}
                        onClick={() => handleDeleteTeam(value.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="d-flex justify-center align-center loader-container">
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
        </div>
      </div>

      {isModalActive && (
        <OverlayModal isActive={isModalActive}>
          <div className="org-btn-container d-flex flex-column justify-start gap-3">
            <div
              className="d-flex justify-end cursor-pointer"
              onClick={() => {
                setIsModalActive(false) 
                resetState()
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
    </>
  );
};

export default TeamsManagement;
