import React, { useState } from "react";
import { RiSearchLine, RiArrowDownSLine, RiCheckboxMultipleLine, RiFlagFill } from "react-icons/ri";

import Sidebar from "../../../components/dashnav";
import { SearchBox } from "../../../components";
import styles from "../monthlytimesheet/Timesheet.module.css";
import images from "../../../assets/images/new";
import { useAuth } from "../../../authContext";
import api from "../../../networking/api";
import { toast } from "react-toastify";

const { ListIconBox } = images;

function MyTasks() {
  const [searchValue, setSearchValue] = useState();
  const [activeTab, setActiveTab] = useState(1);
  const { user } = useAuth();

  const rendertabsData = () => (
    <div className="d-flex gap-3 w-100 py-2 justify-content-between align-items-center">
      <div className="d-flex gap-3 w-100 py-2">
        <div
          key="1"
          className={`${styles.headerButtons} ${
            activeTab === 1 ? styles.activeTab : ""
          } d-flex justify-content-center gap-2 pointer`}
        >
          <div>
            <span className="report-filled"></span>
          </div>
          <div>Create Task</div>
        </div>
        <div
          key="1"
          className={`${styles.headerButtons} ${
            activeTab === 1 ? styles.activeTab : ""
          } d-flex justify-content-center gap-2 pointer`}
        >
          <div>
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>Create Task</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} w-100 p-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2">My Tasks</h2>
              <p className="mb-0">View and manage tasks assigned to you</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <SearchBox value={searchValue} onChange={setSearchValue} />
              {/* <div className={styles.userbox}></div> */}
            </div>
          </div>
        </div>
        <div className="px-3 pt-3">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <RiSearchLine />
                  </span>
                  <input type="text" className="form-control border-start-0" placeholder="Search Task" />
                </div>
                <div className="dropdown me-4">
                  <button
                    className="btn btn-light d-flex align-items-center"
                    type="button"
                    id="statusDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <RiCheckboxMultipleLine className="me-1" />
                    All Status
                    <RiArrowDownSLine className="ms-1" />
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="statusDropdown">
                    <li>
                      <button className="dropdown-item">All Status</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Open</button>
                    </li>
                    <li>
                      <button className="dropdown-item">In Progress</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Closed</button>
                    </li>
                  </ul>
                </div>
                <div style={{ width: "1px", height: "24px", backgroundColor: "#ccc" }} />
                <div className="dropdown ms-4">
                  <button
                    className="btn btn-light d-flex align-items-center"
                    type="button"
                    id="priorityDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <RiFlagFill className="me-1" />
                    All Priority
                    <RiArrowDownSLine className="ms-1" />
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="priorityDropdown">
                    <li>
                      <button className="dropdown-item">All Priority</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Low</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Medium</button>
                    </li>
                    <li>
                      <button className="dropdown-item">High</button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="d-flex align-items-center">{rendertabsData()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
