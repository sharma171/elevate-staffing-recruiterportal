import React, { useState, useEffect, Component } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OverlayModal from "../../components/OverlayModal";
import DropDown from "../../components/DropDown.jsx";
import "./RecruiterDetails.css";
import "../dashboard/style.css";
import makeRequest from "../../helpers/http-request.js";
import tableStyles from "./css/table.module.css";
import styles from "./css/other.module.css";
import JobCount from "../../assets/images/peopleIcon.png";
import UIIcon from "../../assets/images/UIIcon.png";
import TeamIcon from "../../assets/images/TeamIcon.png";

import api from "../../networking/api.js";
import { useAuth } from "../../authContext.jsx";
import Confirm from "../../components/Confirm.jsx";
import images from "../../assets/images/new";
import { Placeholder } from "rsuite";
import ThemeLoader from "../../components/ThemeLoader.jsx";

const { visa_status, list, status_filter } = images;

const TeamManagement = ({ callback, editPermitions }) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [input, setInput] = useState("");
  const [teams, setTeams] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [updateId, setUpdateId] = useState(null);
  const [update, setUpdate] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState({});

  const [deleteTeamText, setDeleteTeamText] = useState("");

  const { user } = useAuth();

  const url = "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";

  useEffect(() => {
    const details = {
      count: filteredTeams?.length,
      setSearch: (val) => setFilters({ ...filters, team_name: val }),
      action: (res) => {
        setIsModalActive(true);
      },
    };

    callback && callback(details);
  }, [filteredTeams?.length]);

  const getTeams = () => {
    if (!user?.email) {
      return;
    }

    const options = {
      emailid: user?.email,
      type: "teams",
    };
    setIsLoading(true);

    api
      .TeamsManagement(options)
      .then((res) => {
        setIsLoading(false);
        setTeams(res.records);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err, "error is err");
      });
  };

  const addTeam = async () => {
    if (!input) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: user?.email,
          type: "teams",
          operation: "insert",
          name: input,
          team_desc: description,
        },
      };
      const res = await makeRequest(options);

      if (res?.status == 200) {
        // setTeams((prev)=>[...prev, res?.data?.record]);
        getTeams();
        setIsModalActive(false);
        setIsLoading(false);
        setInput("");
        setDescription("");
        toast.success(res?.data?.message || "Team Added successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateTeam = async () => {
    if (!input) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        url,
        method: "POST",
        data: {
          emailid: user?.email,
          id: updateId,
          name: input.trim(),
          team_desc: description,
          is_active: statusUpdate.value,
          type: "teams",
          operation: "update",
        },
      };

      const res = await makeRequest(options);

      if (res?.status == 200) {
        getTeams();
        setIsModalActive(false);
        setUpdate(false);
        setUpdateId(null);
        setIsLoading(false);
        setInput("");
        setDescription("");
        toast.success(res?.data?.message || "Team modified successfully");
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
          emailid: user?.email,
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
        toast.success(res?.data?.message || "Team deleted successfully");
      } else {
        if (res?.response?.data?.status == "error") {
          toast.error(res?.response?.data?.error || "Something went wrong!");
        }
      }
    } catch (err) {
      console.log(err, "error is err");
    }
  };

  const handleUpdate = (value) => {
    setUpdate(true);
    setUpdateId(value.id);
    setInput(value.team_name);
    setDescription(value.team_desc);
    value.is_active
      ? setStatusUpdate({ value: true, text: "Active" })
      : setStatusUpdate({ value: false, text: "Inactive" });
    setIsModalActive(true);
  };

  useEffect(() => {
    let filtered = teams;

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "All") {
        if (key === "is_active") {
          filtered = filtered.filter((team) => team[key] === (filters[key] === "Active"));
        } else {
          filtered = filtered.filter((team) => {
            let lowercasefilter = String(filters[key]).toLowerCase();
            let lowercaseitem = String(team[key]).toLowerCase();
            return lowercaseitem.includes(lowercasefilter);
          });
        }
      }
    });

    setFilteredTeams(filtered);
  }, [teams, filters, isLoading]);

  useEffect(() => {
    if (user?.email) {
      getTeams();
    }
  }, [user?.email]);

  const resetState = () => {
    setUpdate(false);
    setIsLoading(false);
    setInput("");
    setDescription("");
  };

  const handleDeleteCandidate = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  const renderFilters = () => {
    const filtersObj = [
      {
        label: "Status",
        key: "is_active",
        image: status_filter,
        data: [
          { key: "Active", val: "Active" },
          { key: "Inactive", val: "Inactive" },
        ],
      },
    ];

    return (
      <div className="d-flex align-items-center gap-3 mb-3">
        {filtersObj.map((filter, index) => {
          let isActive = filters[filter.key] && filters[filter.key] !== "All";
          let filterData = filter.data;

          return (
            <div
              key={index}
              className={`filter-select d-flex align-items-center selectFilterallnew  ${
                isActive ? "activeSelectimage" : "inactiveSelectimage"
              }`}
            >
              {filter.image && <img className="selectImageimage" src={filter.image} alt="" width="20" height="20" />}
              <select
                className="form-select"
                onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                value={filters[filter.key] || ""}
              >
                {[{ key: `Filter by ${filter.label}`, val: "All" }, ...filterData].map((option, idx) => (
                  <option
                    key={idx}
                    value={option?.val || option}
                    className={`${styles.dropdownlist} ${filters[filter.key] === option.val ? styles.list_active : ""}`}
                  >
                    {option?.key || option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className="d-flex align-items-center gap-1 pointer fw-light" onClick={() => setFilters({})}>
          <span className="material-symbols-outlined">close</span>
          <span className="mobHFilters">Clear Filters</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderFilters()}
      <div>
        <div className={`table-responsive  ${tableStyles.table}`}>
          <table className={`table table-borderless table-hover align-middle`}>
            <thead className={tableStyles.thead}>
              <tr>
                <th>
                  <div className="d-flex gap-1 align-items-center">
                    <img src={JobCount} className="image-gray" style={{ height: "18px" }} />
                    <span>Team</span>
                  </div>
                </th>

                <th>
                  <div className="d-flex gap-1 align-items-center">
                    <img src={visa_status} className="image-gray" />
                    <span>Description</span>
                  </div>
                </th>
                <th>
                  <div className="d-flex gap-1 align-items-center">
                    <img src={visa_status} className="image-gray" />
                    <span>Members</span>
                  </div>
                </th>

                <th>
                  <div className="d-flex gap-1 align-items-center">
                    <img src={list} />
                    <span>Status</span>
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
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team, index) => (
                  <tr key={team.id}>
                    <td className={tableStyles.teamData}>
                      <div className="d-flex align-items-center gap-1 fs14">
                        <img src={TeamIcon} alt="team-icon" className={tableStyles.tableIcon} />
                        <span> {team?.team_name}</span>
                      </div>
                    </td>
                    <td className={tableStyles.descriptionData}>
                      {team?.team_desc ? (
                        <div className="d-flex align-items-center gap-1 fs14">
                          <img src={UIIcon} alt="team-icon" className={tableStyles.tableIcon} />
                          <span> {team?.team_desc}</span>
                        </div>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td className={tableStyles.memberCountData}>
                      <div className="d-flex align-items-center gap-1 fs14">
                        <img src={TeamIcon} alt="team-icon" className={tableStyles.tableIcon} />
                        <span> {team?.member_count}</span>
                      </div>
                    </td>
                    <td className={tableStyles.activityData}>
                      <div className={team?.is_active ? tableStyles.activebadge : tableStyles.inactivebadge}>
                        <span className={tableStyles.dot} />
                        <span>{team?.is_active ? "Active" : "In Active"}</span>
                      </div>
                    </td>
                    {editPermitions ? (
                      <td className={tableStyles.actionButtons}>
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
                                onClick={() => handleUpdate(team)}
                              >
                                <span class="font14 material-symbols-outlined">edit_square</span>
                                Edit
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() => {
                                  setDeleteTeamText(`
                                  Are you sure you want to delete <b>${team.team_name}?</b><br/>This cannot be undone.
                                  `);
                                  handleDeleteCandidate(team?.id);
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
                ))
              ) : (
                <tr>
                  {isLoading ? (
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
      </div>
      {isModalActive && <div className="overlay"></div>}
      {isModalActive && (
        <OverlayModal
          isActive={isModalActive}
          onClose={() => {
            setIsModalActive(false);
            resetState();
          }}
        >
          <div
            className={`d-flex flex-column justify-start gap-3 mt-3 ${styles.formContainer}`}
            style={{ position: isLoading ? "relative" : "" }}
          >
            <div className={`${styles.themeColor} d-flex align-items-center gap-2`}>
              <img src={JobCount} className="" style={{ height: "18px" }} />
              <div>{update ? "Update" : "Create"} Team </div>
            </div>
            <div>
              <div className="mb-3">
                <label className={`form-label ${styles.formlabel}`}>Team Name</label>
                <input
                  className={`form-control`}
                  value={input}
                  placeholder="Enter Team Name"
                  onChange={(e) => setInput(e.target.value)}
                />
                {error && <span className="text-danger small">{error}</span>}
              </div>

              <div>
                <label className={`form-label ${styles.formlabel}`}>Team Description</label>
                <input
                  className={`form-control`}
                  value={description}
                  placeholder="Enter Team Description"
                  onChange={(e) => setDescription(e.target.value)}
                />
                {error && <span className="text-danger small">{error}</span>}
              </div>
            </div>
            {update && (
              <div>
                <label className={`form-label ${styles.formlabel}`}>Team Status</label>
                <DropDown
                  style={{ padding: "6px 10px" }}
                  selected={statusUpdate}
                  setSelected={setStatusUpdate}
                  text="Select status"
                  data={[
                    { value: true, text: "Active" },
                    { value: false, text: "In Active" },
                  ]}
                />
              </div>
            )}

            <div className="d-flex justify-end my-3">
              <button
                className={`d-flex align-items-center gap-2 pointer themeButton`}
                onClick={update ? updateTeam : addTeam}
              >
                <span class="material-symbols-outlined">save</span>
                {update ? "Save" : "Create"}
                {/* {isLoading ? <Loader /> : update ? "Save" : "Add Team"} */}
              </button>
            </div>
            <ThemeLoader show={isLoading} />
          </div>
        </OverlayModal>
      )}
      <Confirm
        show={showDialog}
        result={(result) => {
          setShowDialog(false);
          if (result) {
            deleteTeam(deleteId);
          }
        }}
        title="Delete Team"
        text={deleteTeamText}
        deleteTitle="Yes, I'm Sure"
      />
      <ThemeLoader show={isLoading} />
    </div>
  );
};

export default TeamManagement;
