import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import OverlayModal from "../../components/OverlayModal.jsx";
import DropDown from "../../components/DropDown.jsx";
import "./RecruiterDetails.css";
import "../dashboard/style.css";
import makeRequest from "../../helpers/http-request.js";
import styles from "./css/other.module.css";
import { useAuth } from "../../authContext.jsx";
import tableStyles from "./css/table.module.css";
import images from "../../assets/images/new";
import Confirm from "../../components/Confirm.jsx";
import { Placeholder } from "rsuite";
import ThemeLoader from "../../components/ThemeLoader.jsx";

const { visa_status, list, status_filter, titles } = images;
const url = "https://us-east1-recruiterportal.cloudfunctions.net/manage_org_teams_titles_v3";

const TitlesDetails = ({ callback, editPermitions }) => {
  const { user } = useAuth();
  const [isModalActive, setIsModalActive] = useState(false);
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
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [deleteTeamText, setDeleteTeamText] = useState("");

  useEffect(() => {
    const details = {
      count: filteredTitles?.length,
      setSearch: (val) => setFilters({ ...filters, title_name: val }),
      action: (res) => {
        setIsModalActive(true);
      },
    };

    callback && callback(details);
  }, [filteredTitles?.length]);

  const fetchTitles = async () => {
    setIsLoading(true);
    try {
      const res = await makeRequest({
        url,
        method: "POST",
        data: { emailid: user.email, type: "job_titles" },
      });
      setIsLoading(false);
      setJobs(res?.data?.records || []);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  };

  const handleSubmit = async (operation) => {
    if (!input.trim()) {
      setError("Name is required");
      return;
    }
    setIsLoading(true);
    const data = {
      emailid: user.email,
      name: input.trim(),
      type: "job_titles",
      operation,
    };
    if (operation === "update") {
      data.id = updateId;
      data.is_active = statusUpdate.value;
    }
    try {
      const res = await makeRequest({ url, method: "POST", data });
      setIsLoading(false);

      if (res?.status === 200 || res?.data?.status === "success") {
        let msg = operation === "update" ? "Title modified successfully" : "Title Added successfully";
        fetchTitles();
        setIsModalActive(false);
        setUpdate(false);
        setUpdateId(null);
        setInput("");
        toast.success(res?.data?.message || msg);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTitle = async (id) => {
    setIsLoading(true);
    try {
      const res = await makeRequest({
        url,
        method: "POST",
        data: { emailid: user.email, operation: "delete", type: "job_titles", id },
      });
      setIsLoading(false);
      if (res?.data?.status === "success") {
        fetchTitles();
        setShowDialog(false);
        setDeleteId(null);
        toast.success(res?.data?.message || "Title deleted successfully");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (value) => {
    setUpdate(true);
    setUpdateId(value.id);
    setInput(value.title_name);
    setStatusUpdate(value.is_active ? { value: true, text: "Active" } : { value: false, text: "Inactive" });
    setIsModalActive(true);
  };

  const handleDeleteTeam = (id) => {
    setShowDialog(true);
    setDeleteId(id);
  };

  useEffect(() => {
    if (user?.email) fetchTitles();
  }, [user]);

  useEffect(() => {
    let filtered = jobs;

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

    setFilteredTitles(filtered);
  }, [jobs, filters, isLoading]);

  const resetState = () => {
    setUpdate(false);
    setInput("");
    setStatusUpdate(null);
    setIsLoading(false);
    setIsModalActive(false);
    setError(null);
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
      <div className={`table-responsive ${tableStyles.table}`}>
        <table className="table table-borderless table-hover align-middle">
          <thead className={tableStyles.thead}>
            <tr>
              <th>
                <div className="d-flex gap-1 align-items-center">
                  <img src={titles} className="image-gray" alt="titles" />
                  <span>Title</span>
                </div>
              </th>
              <th>
                <div className="d-flex gap-1 align-items-center justify-content-center">
                  <img src={list} className="image-gray" alt="list" />
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
          <tbody className={tableStyles.tbody}>
            {filteredTitles.length > 0 ? (
              filteredTitles.map((title) => (
                <tr key={title.id}>
                  <td>
                    <div
                      className="d-flex align-items-center gap-2 themeColor fw-500 rounded-pill"
                      style={{ background: "#093C850a", width: "max-content", padding: "8px 20px" }}
                    >
                      <span className="title-text" />
                      {title.title_name}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-center">
                      <div className={title.is_active ? tableStyles.activebadge : tableStyles.inactivebadge}>
                        <span className={tableStyles.dot} />
                        <span>{title.is_active ? "Active" : "In Active"}</span>
                      </div>
                    </div>
                  </td>
                  {editPermitions ? (
                    <td>
                      <div className={`dropdown text-center ${tableStyles.themeColor}`}>
                        <button
                          className="btn btn-light mx-auto text-center"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          ⋮
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className={`${tableStyles.dropdown_item} ${tableStyles.themeColor} d-flex align-items-center gap-2 dropdown-item`}
                              onClick={() => handleUpdate(title)}
                            >
                              <span className="font14 material-symbols-outlined">edit_square</span>
                              Edit
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setDeleteTeamText(`
                                  Are you sure you want to delete <b>${title.title_name}?</b><br/>This cannot be undone.
                                  `);
                                handleDeleteTeam(title.id);
                              }}
                              className={`${tableStyles.dropdown_item} ${tableStyles.themeColor} d-flex align-items-center gap-2 dropdown-item`}
                            >
                              <span className="font14 material-symbols-outlined">delete</span>
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

      {isModalActive && <div className="overlay"></div>}
      {isModalActive && (
        <OverlayModal isActive={isModalActive} onClose={resetState}>
          <div
            className={`d-flex flex-column justify-start gap-3 mt-3 ${styles.formContainer}`}
            style={{ position: isLoading ? "relative" : "" }}
          >
            <div className={`${styles.themeColor} d-flex align-items-center gap-2`}>
              <img src={titles} className="" style={{ height: "18px" }} />
              <div>{update ? "Update" : "Create"} Title </div>
            </div>
            <div>
              <label className={`form-label ${styles.formlabel}`}>Title Name</label>
              <input
                className={`form-control`}
                value={input}
                placeholder="Enter Title"
                onChange={(e) => setInput(e.target.value)}
              />
              {error && <p className="v2-login-error">{error}</p>}
            </div>
            {update && (
              <div>
                <label className={`form-label ${styles.formlabel}`}>Title Status</label>
                <DropDown
                  style={{ padding: "6px 10px" }}
                  selected={statusUpdate}
                  setSelected={setStatusUpdate}
                  text="Select status"
                  data={[
                    { value: true, text: "Active" },
                    { value: false, text: "Inactive" },
                  ]}
                />
              </div>
            )}
            <div className="d-flex justify-end my-3">
              <button
                className={`d-flex align-items-center gap-2 pointer themeButton`}
                onClick={() => handleSubmit(update ? "update" : "insert")}
              >
                <span class="material-symbols-outlined">save</span>
                {update ? "Save" : "Create"}{" "}
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
            deleteTitle(deleteId);
          }
        }}
        title="Delete Title"
        text={deleteTeamText}
        deleteTitle="Yes, I'm Sure"
      />
      <ThemeLoader show={isLoading} />
    </div>
  );
};

export default TitlesDetails;
