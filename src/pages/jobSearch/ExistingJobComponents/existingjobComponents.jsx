import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../authContext";
import { Link, useNavigate } from "react-router-dom";
import "./jobver0.1.css?ver0.2";
import AiIcon from "./aicomp.png";
import CopyIcon from "./copyIcon.png";
import AiGifIcon from "./aiIcon.gif";
import CandidateIcon from "../jobSearch.svg";
import DropIcon from "./dropIcon.svg";
import Loader from "../../../components/Loader";
import { Confirm, ThemeLoader } from "../../../components";
import JobCount from "./JobCountIcon.png";
import FilterModal from "../../talentpool/css/FilterModal.module.css";
import SearchIcon from "./SearchIcon.png";
import { ArrowLeft } from "lucide-react";
import { SelectPicker } from "rsuite";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";

const ActiveJobs = () => {
  const {
    candidateDetails,
    setCandidateDetails,
    isLoggedIn,
    user,
    sessionToken,
    choosenCandidate,
    setCandidate,
    candidateList,
    setCandidateList,
    setCandidateId,
  } = useAuth();
  const [jobList, setJobList] = useState([]);
  const [filterPopup, setFilterPopup] = useState(false);
  const [wideView, setWideView] = useState(false);
  const [filteredJobList, setFilteredJobList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [filter, setFilter] = useState(false);

  const [aiResponse, setAiResponse] = useState(null);
  const [aiPopup, setAiPopup] = useState(null);
  const navigate = useNavigate();
  const [selectId, setSelectId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDaysFilter, setactiveDaysFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [buttonText, setButtonText] = useState("Apply");
  const [showPopupBox, setshowPopupBox] = useState({});

  useEffect(() => {
    const uniqueCities = [...new Set(jobList.map((job) => job.job_city))];
    const uniqueStates = [...new Set(jobList.map((job) => job.job_state))];
    setCityOptions(uniqueCities);
    setStateOptions(uniqueStates);
  }, [jobList]);

  useEffect(() => {
    if (user?.email) {
      fetchCandidates();
    }
  }, [user?.email]);

  useEffect(() => {
    if (candidateDetails?.original_email) {
      activeFilters.original_email = candidateDetails.original_email;
      setActiveFilters({ ...activeFilters });
    }
  }, [candidateDetails?.original_email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn === false) {
        navigate("/");
      }
      console.log(isLoggedIn);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate, choosenCandidate]);

  const applyFilter = (key, value) => {
    if (key === "remote") {
      if (!value) {
        delete activeFilters[key];
      } else {
        activeFilters[key] = value;
      }

      return setActiveFilters({ ...activeFilters });
    }

    setActiveFilters((prevFilters) => {
      if (isActiveFilter(key, value)) {
        const newFilters = { ...prevFilters };
        delete newFilters[key];
        return newFilters;
      } else {
        return { ...prevFilters, [key]: value };
      }
    });
  };

  const getFilteredJobs = () => {
    return jobList.filter((job) => {
      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (key === "date") return new Date(job.job_posted_at_datetime_utc) > value;
        if (key === "state") return job.job_state === value;
        if (key === "city") return job.job_city === value;
        if (key === "remote") return job.job_is_remote === value;
        return true;
      });

      const matchesSearch =
        searchTerm === "" ||
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.employer_name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilters && matchesSearch;
    });
  };

  const clearFilters = () => {
    setActiveFilters({ original_email: activeFilters?.original_email });
    setactiveDaysFilter("");
    setSearchTerm("");
    if (jobList.length > 0) {
      setContent(jobList[0]);
      setActiveJobId(jobList[0].id);
    }
  };

  useEffect(() => {
    setFilteredJobList(getFilteredJobs());
    setFilter(Object.keys(activeFilters).length > 0 || searchTerm !== "");
  }, [activeFilters, jobList, searchTerm]);

  const filterLast24Hours = () => applyFilter("date", new Date(new Date().setDate(new Date().getDate() - 1)));
  const filterLast3Days = () => applyFilter("date", new Date(new Date().setDate(new Date().getDate() - 3)));
  const filterLast7Days = () => applyFilter("date", new Date(new Date().setDate(new Date().getDate() - 7)));
  const filterByState = (state) => applyFilter("state", state);
  const filterByCity = (city) => applyFilter("city", city);
  const filterRemoteJobs = () => applyFilter("remote", !activeFilters.remote);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      clearFilters();
    }
  };

  const isActiveFilter = (key, value) => {
    if (key === "date") {
      return activeFilters[key]?.toDateString() === value.toDateString();
    }
    return activeFilters[key] === value;
  };

  const fetchCandidates = async () => {
    try {
      const queryObj = {
        email: user?.email,
      };

      const response = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Candidate_Details_Min_v2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryObj),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setCandidateList(data);
      console.log("Received data:", data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchJobs = () => {
    if (!user?.email) {
      console.log("User email is not available.");
      return;
    }

    setIsLoading(true);

    const queryObj = {
      emailid: user?.email,
      email_id: choosenCandidate,
    };

    fetch("https://us-east1-recruiterportal.cloudfunctions.net/Get_Jobs_From_Database_Comparing_Resume_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryObj),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let error = data?.error;

        if (error) {
          let message = data.message || "Something went wrong.";
          let objData = {
            message,
            title: "Not found",
          };
          setshowPopupBox(objData);
          return;
        }

        setJobList(data.matches);
        setSelectId(data.matches?.[0]?.job_id || null);
        setIsLoading(false);

        if (data?.matches?.length > 0) {
          setContent(data.matches[0]);
          setActiveJobId(data.matches[0].job_id);

          setIsLoading(false);
        } else {
          setIsLoading(false);
          let objData = {
            message: "Something went wrong.",
            title: "Not found",
          };
          setshowPopupBox(objData);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        let objData = {
          message: "Something went wrong.",
          title: "Not found",
        };
        setshowPopupBox(objData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setJobList([]);
    setContent(null);
    setTimeout(() => {
      if (choosenCandidate !== "") {
        fetchJobs();
      }
    }, 600);
  }, [sessionToken, user, choosenCandidate]);

  useEffect(() => {
    if (choosenCandidate && candidateList?.length) {
      handleUserChange(choosenCandidate);
    }
  }, [choosenCandidate, candidateList?.length]);

  useEffect(() => {
    if (candidateDetails?.original_email && selectId && user?.email) {
      checkButtonStatus();
    }
  }, [candidateDetails?.original_email, selectId, user?.email]);

  const handleJobClick = (job) => {
    setContent(job);
    setActiveJobId(job.job_id);
    setSelectId(job.job_id);
    setAiResponse(null);
    setWideView(true);
  };

  const applyButton = async () => {
    try {
      if (!user?.email) {
        console.error("User email is not available.");
        return; // Exit if user email is not available
      }
      const appliedResponse = await fetch(
        "https://us-east1-recruiterportal.cloudfunctions.net/check_apply_reapply_buttons_v3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recruiter_email: user?.email,
            candidate_email: candidateDetails?.original_email,
            job_id: selectId,
            function_name: "clicked on Apply now",
          }),
        },
      );

      if (!appliedResponse.ok) {
        throw new Error("Failed to check job application status");
      }

      await appliedResponse.json();
      checkButtonStatus();
    } catch (error) {
      console.error("Error checking apply status:", error);
    }
  };

  const checkButtonStatus = () => {
    fetch("https://us-east1-recruiterportal.cloudfunctions.net/check_apply_reapply_buttons_v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recruiter_email: user?.email,
        candidate_email: candidateDetails?.original_email,
        job_id: selectId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        let btnText = data.result == "Apply Button" ? "Apply " : "Reapply ";
        setButtonText(btnText);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function closeAiSuggest() {
    setAiPopup(false);
    setAiResponse(null);
    // setAiready(false);
  }

  function copyResumeResponse(response) {
    if (response) {
      navigator.clipboard
        .writeText(response)
        .then(() => {
          console.log("AI response copied to clipboard");
          alert("AI response copied to clipboard");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    }
  }

  const displayedJobList = filter ? filteredJobList : jobList;
  const jobCount = displayedJobList.length;

  const beautifyAiResponse = (response) => {
    if (!response) return null;

    const sections = response.split("### ").filter(Boolean);

    return (
      <>
        {sections.map((section, index) => {
          const lines = section.split("\n").filter((line) => line.trim() !== "");
          const heading = lines.shift();
          const content = lines.join(" ");

          const formattedHeading = heading.replace(/\*\*(.*?)\*\*/g, "<h3>$1</h3>");
          const formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<h3>$1</h3>");
          const copydata = formattedHeading + formattedContent;

          if (/Section Order/i.test(formattedHeading)) {
            return null;
          }

          return (
            <div key={index} className="ai-section">
              <div className="row-flex">
                {formattedHeading && (
                  <h3 className="ai-section-heading" dangerouslySetInnerHTML={{ __html: formattedHeading.trim() }} />
                )}
                <div className="copy-btn" onClick={() => copyResumeResponse(copydata)}>
                  <img src={CopyIcon} alt="icon" />
                </div>
              </div>
              {formattedContent && (
                <div className="ai-section-content">
                  {formattedContent
                    .split("- ")
                    .filter(Boolean)
                    .map((item, idx) => (
                      <div key={idx} className="ai-content-item">
                        <p dangerouslySetInnerHTML={{ __html: item.trim() }} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const handleUserChange = (email) => {
    setCandidate(email);
    let selectedCandidate = candidateList.find((value) => value.original_email == email);
    setCandidateDetails(selectedCandidate);
  };

  const candidateListData = useMemo(
    () =>
      candidateList.map((list) => ({
        label: list.full_name,
        value: list.original_email,
        id: list.id,
      })),
    [candidateList],
  );

  return (
    <>
      <ThemeLoader show={isLoading} />

      <div className={`content docs col-flex job`}>
        {filterPopup && (
          <>
            <div className={`${FilterModal.confirmOverlay}`}>
              <div className={`${FilterModal.confirmModal}  filter mobilePopup`}>
                <div className={`${FilterModal.modalHeader} d-flex align-items-center justify-content-between`}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="filter_icon" />
                    <span>Filters</span>
                  </div>
                  <span
                    class="material-symbols-outlined pointer"
                    onClick={() => {
                      setFilterPopup(false);
                    }}
                  >
                    close
                  </span>
                </div>
                <div className={`d-flex flex-wrap align-items-center gap-1 mx-auto ${FilterModal.modalBody}`}>
                  <div
                    className={`filter-select d-flex align-items-center ${FilterModal.selectFilter}  ${
                      wideView ? FilterModal.activeSelect : FilterModal.inactiveSelect
                    }`}
                  >
                    <div
                      className={`f-nav ${
                        isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 1))) ||
                        isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 3))) ||
                        isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 7)))
                          ? "active"
                          : ""
                      }`}
                    >
                      <span className="flex flex-row">
                        {activeDaysFilter || "Filter Days"}
                        <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "auto" }} />
                      </span>
                      <ul className="list col-flex" style={{ width: "100%" }}>
                        <li
                          className={`${
                            isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 1)))
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setactiveDaysFilter("24 Hours");
                            filterLast24Hours();
                          }}
                        >
                          24 Hours
                        </li>
                        <li
                          className={`${
                            isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 3)))
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setactiveDaysFilter("3 Days");
                            filterLast3Days();
                          }}
                        >
                          3 Days
                        </li>
                        <li
                          className={`${
                            isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 7)))
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setactiveDaysFilter("7 Days");
                            filterLast7Days();
                          }}
                        >
                          7 Days
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className={`filter-select d-flex align-items-center ${FilterModal.selectFilter}  ${
                      wideView ? FilterModal.activeSelect : FilterModal.inactiveSelect
                    }`}
                  >
                    <div className={`f-nav ${activeFilters?.city ? "active" : ""}`}>
                      <span className="flex flex-row">
                        {activeFilters?.city ? <>City {activeFilters.city}</> : <>Filter your City</>}
                        <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "auto" }} />
                      </span>
                      <ul className="list col-flex">
                        {cityOptions.map(
                          (city, index) =>
                            city !== "NULL" && (
                              <li
                                className={`${activeFilters?.city == city ? "active" : ""}`}
                                key={index}
                                onClick={() => filterByCity(city)}
                              >
                                {city}
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  </div>
                  <div
                    className={`filter-select d-flex align-items-center ${FilterModal.selectFilter}  ${
                      wideView ? FilterModal.activeSelect : FilterModal.inactiveSelect
                    }`}
                  >
                    <div className={`f-nav ${activeFilters?.state ? "active" : ""}`}>
                      <span className="flex flex-row">
                        {activeFilters.state ? <>State {activeFilters.state}</> : <>Filter State</>}
                        <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "auto" }} />
                      </span>
                      <ul className="list col-flex">
                        {stateOptions.map((state) => (
                          <li
                            className={`${activeFilters?.state == state ? "active" : ""}`}
                            key={state}
                            onClick={() => filterByState(state)}
                          >
                            {console.log(activeFilters)}
                            {state}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div
                    className={`filter-select d-flex align-items-center ${FilterModal.selectFilter}  ${
                      wideView ? FilterModal.activeSelect : FilterModal.inactiveSelect
                    }`}
                  >
                    <div className="f-nav">
                      <span onClick={filterRemoteJobs} className={activeFilters?.remote ? "active-remote" : ""}>
                        Remote Jobs
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`ms-auto mt-3 ${FilterModal.buttonContainer}`}>
                  <button
                    className={`${FilterModal.confirmButton} ${FilterModal.confirmCancel}`}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                  <button
                    className={`${FilterModal.confirmButton} ${FilterModal.confirmYes}`}
                    onClick={() => {
                      setFilterPopup(false);
                    }}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="filter row-flex align-center mFHidden">
          <div className="nav-head" style={{ display: "flex", alignItems: "center" }}>
            <SelectPicker
              caretAs={() => <FaChevronDown strokeWidth={1} />}
              className={`esixtingJobsSearchSelectpicker`}
              menuClassName=""
              data={candidateListData}
              value={activeFilters?.original_email}
              cleanable={false}
              onChange={(val) => {
                handleUserChange(val);
                const sel = candidateListData.find((d) => d.value === val);
                if (sel) setCandidateId(sel.id);
              }}
              style={{ width: "max-content" }}
              placeholder="Select Recruiter"
              renderValue={(value, item) => (
                <div className="mx-auto d-flex align-items-center gap-1" style={{ maxWidth: "95%" }}>
                  <img src={CandidateIcon} alt="icon" style={{ marginRight: 8, width: 16, height: 16 }} />
                  <span>{item?.label || candidateDetails?.full_name || "Select Recruiter"}</span>
                </div>
              )}
            />
          </div>
          <div
            className={`f-nav ${
              isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 1))) ||
              isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 3))) ||
              isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 7)))
                ? "active"
                : ""
            }`}
          >
            <span className="flex flex-row">
              {activeDaysFilter || "Filter Days"}
              <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "12px" }} />
            </span>
            <ul className="list col-flex">
              <li
                className={`${
                  isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 1))) ? "active" : ""
                }`}
                onClick={() => {
                  setactiveDaysFilter("24 Hours");
                  filterLast24Hours();
                }}
              >
                24 Hours
              </li>
              <li
                className={`${
                  isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 3))) ? "active" : ""
                }`}
                onClick={() => {
                  setactiveDaysFilter("3 Days");
                  filterLast3Days();
                }}
              >
                3 Days
              </li>
              <li
                className={`${
                  isActiveFilter("date", new Date(new Date().setDate(new Date().getDate() - 7))) ? "active" : ""
                }`}
                onClick={() => {
                  setactiveDaysFilter("7 Days");
                  filterLast7Days();
                }}
              >
                7 Days
              </li>
            </ul>
          </div>
          <div class="pointer p-2 fs-3 ms-3" onClick={() => setFilterPopup(true)}>
            ⋮
          </div>
          <div className={`f-nav ${activeFilters?.city ? "active" : ""}`}>
            <span className="flex flex-row">
              {activeFilters?.city ? <>City {activeFilters.city}</> : <>Filter your City</>}
              <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "12px" }} />
            </span>
            <ul className="list col-flex">
              {cityOptions.map(
                (city, index) =>
                  city !== "NULL" && (
                    <li
                      className={`${activeFilters?.city == city ? "active" : ""}`}
                      key={index}
                      onClick={() => filterByCity(city)}
                    >
                      {city}
                    </li>
                  ),
              )}
            </ul>
          </div>
          <div className={`f-nav ${activeFilters?.state ? "active" : ""}`}>
            <span className="flex flex-row">
              {activeFilters.state ? <>State {activeFilters.state}</> : <>Filter State</>}
              <img src={DropIcon} alt="dropicon" className="dropicon" style={{ marginLeft: "12px" }} />
            </span>
            <ul className="list col-flex">
              {stateOptions.map((state) => (
                <li
                  className={`${activeFilters?.state == state ? "active" : ""}`}
                  key={state}
                  onClick={() => filterByState(state)}
                >
                  {console.log(activeFilters)}
                  {state}
                </li>
              ))}
            </ul>
          </div>

          <div className="f-nav">
            <span onClick={filterRemoteJobs} className={activeFilters?.remote ? "active-remote" : ""}>
              Remote Jobs
            </span>
          </div>

          <div className="f-nav clear" onClick={clearFilters}>
            <div className="crosssIcon">+</div>
            <span>Clear Filter</span>
          </div>
          {jobCount > 0 && (
            <div className="job-count">
              <span>
                <img src={JobCount} alt="count" className="count-icon" style={{ width: "18px", marginRight: "05px" }} />
                {jobCount > 1 ? "" : ""} {jobCount}
              </span>
            </div>
          )}
        </div>

        {displayedJobList ? (
          <div className="job-container row-flex">
            <div className="selection-tab col-flex">
              <button
                onClick={() => navigate("/jobSearch")}
                type="button"
                className="themeButton mb-2 p-2"
                style={{ borderRadius: "10px", width: "max-content" }}
              >
                <ArrowLeft style={{ height: "18px" }} /> Back to job discovery
              </button>
              <div className="f-nav" style={{ border: "1px solid #bccce7" }}>
                <img src={SearchIcon} alt="search" className="searchIcon" />
                <input type="text" placeholder="Search Your Jobs" value={searchTerm} onChange={handleSearch} />
              </div>
              <div className="JobsList">
                {displayedJobList.length > 0 ? (
                  <>
                    {displayedJobList.map((list) => (
                      <div
                        className={`job-card col-flex ${activeJobId === list.job_id ? "active" : ""}`}
                        onClick={() => handleJobClick(list)}
                      >
                        <div className="top row-flex">
                          <span className="comp-name">{list.employer_name}</span>
                          <span className="date">
                            {new Date(list.job_posted_at_datetime_utc).toLocaleDateString("en-US")}
                          </span>
                        </div>
                        <div className="middle">
                          <h3 className="position">{list.job_title}</h3>
                        </div>
                        <div className="bottom row-flex">
                          <div className="location">
                            <span className={`location ${list.job_is_remote ? "active" : ""}`}>
                              {list.job_is_remote ? "Remote" : "Onsite"}
                            </span>{" "}
                            <span className="dot"></span>
                            <span className="text">
                              {list.job_city !== "NULL" ? `${list.job_city}` : ""}{" "}
                              {list.job_state !== "NULL" ? `${list.job_state}` : ""} {list.job_country}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className={`job-card col-flex `} style={{ height: "100%" }}></div>
                  </>
                )}
                {displayedJobList.map((list) => (
                  <div
                    className={`job-card col-flex ${activeJobId === list.job_id ? "active" : ""}`}
                    onClick={() => handleJobClick(list)}
                  >
                    <div className="top row-flex">
                      <span className="comp-name">{list.employer_name}</span>
                      <span className="date">
                        {new Date(list.job_posted_at_datetime_utc).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <div className="middle">
                      <h3 className="position">{list.job_title}</h3>
                    </div>
                    <div className="bottom row-flex">
                      <div className="location">
                        <span className={`location ${list.job_is_remote ? "active" : ""}`}>
                          {list.job_is_remote ? "Remote" : "Onsite"}
                        </span>{" "}
                        <span className="dot"></span>
                        <span className="text">
                          {list.job_city !== "NULL" ? `${list.job_city}` : ""}{" "}
                          {list.job_state !== "NULL" ? `${list.job_state}` : ""} {list.job_country}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`description-tab full-ScreenNews ${wideView === true ? "wideView" : ""}`}>
              <div className="closeWideView" onClick={() => setWideView(false)}>
                +
              </div>
              {content ? (
                <>
                  <div className="top-row row-flex">
                    <div className="info-lhs col-flex">
                      <span className="comp-name">
                        <a href={content.employer_website} target="_blank">
                          {content.employer_name}
                        </a>
                      </span>
                      <h3 className="job-position">{content.job_title}</h3>
                      <div className="d-flex infoRow">
                        <div className="col-flex colms">
                          <h4 className={`location`}>
                            {" "}
                            <span className={` ${content.job_is_remote ? "active" : ""}`}>
                              {" "}
                              {content.job_is_remote ? "Remote" : "OnSite"}{" "}
                            </span>
                            <span className="dot"></span>
                            {content.job_city !== "NULL" ? `${content.job_city}` : ""}{" "}
                            {content.job_state !== "NULL" ? `${content.job_state}` : ""} {content.job_country}
                          </h4>
                          <h4 className="date">
                            Date Posted : {new Date(content.job_posted_at_datetime_utc).toLocaleDateString("en-US")}
                          </h4>
                        </div>
                        <div className="col-flex">
                          {content.job_publisher !== "NULL" && (
                            <h5 className="posted">
                              Job Publisher : <span>{content.job_publisher}</span>
                            </h5>
                          )}
                          <h5 className="posted">
                            Job Employment Type : <span>{content.job_employment_type}</span>
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="info-rhs d-flex justify-end align-end">
                      <Link
                        style={{ textDecoration: "none" }}
                        to={content.job_apply_link}
                        target="_blank"
                        onClick={applyButton}
                      >
                        <button className="ai-button">{buttonText} Now</button>
                      </Link>
                    </div>
                  </div>
                  <div className="bot-description col-flex">
                    <h4 className="jshead text-underline">Qualifications</h4>
                    <ul className="job-list">
                      {content?.job_highlights?.Qualifications?.map((value, index) => {
                        if (typeof value === "string" && value.trim()) {
                          return <li key={index}>{value}</li>;
                        }
                        return <></>;
                      })}
                    </ul>

                    <h4 className="jshead text-underline">Responsibilities</h4>

                    <ul className="job-list">
                      {content?.job_highlights?.Responsibilities?.map((value, index) => {
                        if (typeof value === "string" && value.trim()) {
                          return <li key={index}>{value}</li>;
                        }
                        return <></>;
                      })}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="infopara">Select a job to see the details.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-100 h-100 d-flex justify-center">
            <Loader />
          </div>
        )}
      </div>
      <Confirm
        result={() => {
          setshowPopupBox({});
          navigate(-1);
        }}
        show={showPopupBox?.message}
        title={showPopupBox?.title}
        text={showPopupBox?.message}
        hideCancel
        deleteTitle="Close"
        icon="close"
      />
      {aiPopup === true && (
        <>
          <div className="f-screenpoppup job-portal">
            <div className="popup-cont">
              <div className="close" onClick={closeAiSuggest}>
                +
              </div>
              <div className="col-flex">
                <div className="ai-head row-flex">
                  <img src={AiIcon} alt="" className="ai-icon" />
                  Ai Suggestions
                </div>
                <div className={`inner-popup ${aiResponse == null ? "loading" : ""}`}>
                  {aiResponse == null ? (
                    <div className="loader-icon">
                      <img src={AiGifIcon} alt="image" />
                    </div>
                  ) : (
                    ""
                  )}
                  {beautifyAiResponse(aiResponse)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActiveJobs;
