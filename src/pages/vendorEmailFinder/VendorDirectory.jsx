import React, { useEffect, useState } from "react";
import styles from "./VendorDirectory.module.css";
import profilestyles from "../talentpool/css/TalentPool.module.css";
import Sidebar from "../../components/dashnav";
import { SearchBox, ThemeLoader } from "../../components";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import images from "../../assets/images/new";
import ProfileLogoComponent from "../../components/ProfileComponent";
import otherGender from "../../images/otherGender.svg";
import DatePicker from "react-datepicker";

const { female_icon, male_icon, list, priorityorder, status_filter, user_icon, visa_status, teamGroup } = images;

function VendorDirectory() {
  // const [searchValue, setSearchValue] = useState("");
  const [inputValue, setinputValue] = useState("");
  const [filteredUsersData, setfilteredUsersData] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState({ emails: [] });
  const [clicked, setClicked] = useState(null);
  const [loader, setloader] = useState(false);

  const { user } = useAuth();

  // const totalPages = Math.ceil(filteredUsersData.length / rowsPerPage);

  let percentvalue = ((tableData?.emails_viewed_today || 0) / (tableData?.daily_limit || 20)) * 100;

  // useEffect(() => {
  //   if (searchValue && tableData?.emails?.length) {
  //     let filterData = tableData.emails.filter((val) => val.includes(searchValue));
  //     setfilteredUsersData(filterData);
  //   } else {
  //     setfilteredUsersData(tableData.emails);
  //   }
  // }, [searchValue]);

  useEffect(() => {
    if (clicked) {
      setTimeout(() => {
        setClicked(null);
      }, 2000);
    }
  }, [clicked]);

  const getRecruiter_Details = () => {
    let payload = {
      user_email: user.email,
      company_name: inputValue,
    };

    if (!inputValue) {
      tableData.message = "Company name is required.";
      setTableData(structuredClone(tableData));
      return;
    }
    setloader(true);
    api
      .Fetchvendoremails(payload)
      .then((res) => {
        setloader(false);
        // console.log(res, "res tes tes");
        setinputValue("");
        if (res?.emails?.length) {
          setfilteredUsersData(res.emails);
        }
        if (!res?.emails_viewed_today && res?.message) {
          res.emails_viewed_today = 20;
        }
        setTableData(res || {});
      })
      .catch((err) => {
        setloader(false);
        console.log(err);
      });
  };

  // const renderPagination = () => {
  //   let pages = [];
  //   if (totalPages <= 5) {
  //     for (let i = 1; i <= totalPages; i++) {
  //       pages.push(i);
  //     }
  //   } else {
  //     let start = Math.max(1, currentPage - 2);
  //     let end = Math.min(totalPages, currentPage + 2);
  //     if (start > 1) pages.push(1);
  //     if (start > 2) pages.push("...");
  //     for (let i = start; i <= end; i++) {
  //       pages.push(i);
  //     }
  //     if (end < totalPages - 1) pages.push("...");
  //     if (end < totalPages) pages.push(totalPages);
  //   }

  //   return (
  //     <div className="d-flex align-items-center gap-1">
  //       <span
  //         className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
  //         onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
  //       >
  //         ◀
  //       </span>
  //       {pages.map((page, index) => (
  //         <button
  //           key={index}
  //           className={`btn ${styles.pages} ${currentPage === page ? "btn-primary " + styles.activePage : "btn-light"}`}
  //           onClick={() => typeof page === "number" && setCurrentPage(page)}
  //           disabled={page === "..."}
  //         >
  //           {page}
  //         </button>
  //       ))}
  //       <span
  //         className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
  //         onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
  //       >
  //         ▶
  //       </span>
  //     </div>
  //   );
  // };

  const renderHeader = () => {
    return (
      <div>
        <div className={styles.searchBoxMain}>
          <SearchBox
            placeholder="Enter the company name from the website domain"
            className={styles.inputmain}
            value={inputValue}
            onChange={(val) => {
              tableData.message = "";
              setinputValue(val);
            }}
          />
          <div onClick={getRecruiter_Details} className={styles.searchButton}>
            <span className="sendicon" />
            <span>Search</span>
          </div>
        </div>

        {tableData?.message ? (
          <div className="font12 mt-1 text-danger px-3" style={{ color: "#727272" }}>
            {tableData.message}
          </div>
        ) : (
          <></>
        )}

        <div className={`font14 text-center ${tableData?.message ? "mt-1" : "mt-2"}`} style={{ color: "#727272" }}>
          Example: for '4spheresolutions.com' → enter '4spheresolutions'
        </div>
      </div>
    );
  };

  const handleCopy = async (value) => {
    try {
      await window.navigator.clipboard.writeText(value);
      setClicked(value);
    } catch (err) {
      console.log(err);
      return;
    }
  };

  let bgColor = "";

  if (percentvalue > 50) {
    bgColor = "bg-warning";
  }

  if (percentvalue > 75) {
    bgColor = "bg-danger";
  }

  return (
    <div className="d-flex backgroundImage">
      <div className={`${styles.container} container-fluid py-2 px-2 px-sm-3 px-md-2 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex justify-content-between">
            <div>
              <h2 className="mb-0 fw-bold h2 mt-0 fs-5">Vendor Directory</h2>
              {/* <p className="mb-0">Vendor Directory</p> */}
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* <SearchBox value={searchValue} onChange={setSearchValue} /> */}

              {/* <div className={profilestyles.userbox}>
                <ProfileLogoComponent />
              </div> */}
            </div>
          </div>
        </div>
        <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
          <div className={`headerboxglass ${styles.headerboxglass}`}>
            <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-1">{renderHeader()} </div>
              <div className={styles.progressBarsection}>
                <span className={`${styles.themefontDark} d-flex align-items-center gap-2`}>
                  <span className="typcn--group mb-1" />
                  {tableData?.emails_viewed_today || 0}/{tableData?.daily_limit || 20} emails viewed today
                </span>
                <div
                  className="progress"
                  role="progressbar"
                  aria-label="Basic example"
                  aria-valuenow={percentvalue || 0}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className={`progress-bar ${bgColor}`} style={{ width: (percentvalue || 0) + "%" }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className={`table-responsive nowrap ${styles.table}`}>
            {filteredUsersData?.length || !tableData?.daily_limit ? (
              <table className="table table-borderless table-hover align-middle">
                <thead>
                  <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <img src={visa_status} />
                        Email ID
                      </div>
                    </th>

                    <th>
                      <div className={`${styles.th}`}>
                        <span className="material-symbols-outlined">action_key</span>
                        <div>Action</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {filteredUsersData.map((value, index) => {
                    return (
                      <tr key={index} className={styles.inactiveRow}>
                        <td className={styles.themefont}>
                          <div className="d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined pointer lightColor">mail</span>
                            {value || "N/A"}
                          </div>
                        </td>

                        <td>
                          <div style={{ height: "30px" }}>
                            {clicked == value ? (
                              <span>Copied</span>
                            ) : (
                              <span
                                className={`material-symbols-outlined pointer ${styles.copyicon}`}
                                onClick={() => handleCopy(value)}
                              >
                                content_copy
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-2 pb-4"> No emails to show</div>
            )}
          </div>
          {/* {totalPages > 1 ? (
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="my-3">
                <label> Show </label>
                <select
                  className="form-select d-inline w-auto ms-2"
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  value={rowsPerPage}
                >
                  {[5, 10,15, 20,30,50,100].map((size) => (
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
          ) : (
            <></>
          )} */}
        </div>
      </div>
      <ThemeLoader show={loader} />
    </div>
  );
}

export default VendorDirectory;
