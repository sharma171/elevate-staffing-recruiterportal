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
import { JobsManagementHeaders } from "../../assets/data/TableHeaders";
import DropDown from "../DropDown";

const TitlesManagement = () => {
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

  const url =
    "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";

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

  return (
    <>
      <div className="org-body width-100">
        <div>
          <div className="v2-btn-container d-flex justify-end mb-2">
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
          {!pageLoad ? (
            <Table headers={headers}>
              {filteredTitles?.map((value, index) => (
                <tr key={value.id} className="v2-table-body">
                  <td>{value?.title_name}</td>
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
      </div>

      {isModalActive && (
        <OverlayModal isActive={isModalActive}>
          <div className="org-btn-container d-flex flex-column justify-start gap-3">
            <div
              className="d-flex justify-end cursor-pointer"
              onClick={() => {
                setIsModalActive(false); 
                resetState()
              }}
            >
              <img src={Close} />
            </div>
            <p className="v2-heading">
              {update ? "Update Title" : "Add Title"}
            </p>
            <div>
              <label className="v2-label">Job Title</label>
              <input
                className="v2-input"
                value={input}
                placeholder="Enter Job Title"
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
                onClick={update ? updateTitle : addTitle}
              >
                {isLoading ? <Loader /> : update ? "Update Title" : "Add Title"}
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
    </>
  );
};

export default TitlesManagement;
