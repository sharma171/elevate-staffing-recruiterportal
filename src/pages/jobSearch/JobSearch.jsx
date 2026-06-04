import { useState, useEffect } from "react";
import styles from "../talentpool/css/TalentPool.module.css";
import "./JobSearch.css";
import "./sideOverlay.css";
import { useAuth } from "../../authContext";
import TabsKay2 from "./images/tabskey2.svg";
import TabsKay3 from "./images/tabskey3.svg";
import TabsKay4 from "./images/tabskey4.svg";
import TabsKay5 from "./images/tabskey5.svg";
import BackIcon from "./ExistingJobComponents/BackIcon.svg";
import tailoredIcon from "./ExistingJobComponents/tailoredIcons.png";
import AnalyzeIcon from "./ExistingJobComponents/AnalyzeIcon.png";
import "./ExistingJobComponents/t-jobs.css";
import JdAnalyze from "./ExistingJobComponents/AnalyzeIconJd.png";
import makeRequest from "../../helpers/http-request";
import OverlayModal from "../../components/OverlayModal";

import { useNavigate } from "react-router-dom";
import { FiInfo } from "react-icons/fi";

import { Confirm, CustomPagination, ThemeLoader } from "../../components";
import { FaCircleExclamation } from "react-icons/fa6";
import { Briefcase, Search, Star } from "lucide-react";
import EmptyView from "../../components/EmptyView";

import images from "../../assets/images/new";
import otherGender from "../../images/otherGender.svg";

const { female_icon, male_icon } = images;

const JobSearch = () => {
  const { setCandidateDetails, user, choosenCandidate, setCandidate, setCandidateId } = useAuth();
  const [tailoredJobs, setTailoredJobs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState("key1");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeNotFound, setResumeNotFound] = useState(false);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [color, setColor] = useState({ color: "" });
  const [backgrounClr, setBackgroundClr] = useState({ backgroundImage: "" });
  const [smartMatch, setSmartMatch] = useState(false);
  const [candidateList, setCandidateList] = useState([]);
  const [candidateListFiltered, setCandidateListFiltered] = useState([]);
  const [filters, setFilters] = useState({ search: "", currentPage: 1, rowsPerPage: 10 });

  const records = candidateListFiltered || [];
  const totalRecords = candidateListFiltered?.length;

  const start = (filters.currentPage - 1) * filters.rowsPerPage;
  const end = start + filters.rowsPerPage;
  const paginatedRecords = records.slice(start, end);

  const handleSetPage = (page) => {
    setFilters((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSetRowsPerPage = (rows) => {
    setFilters((prev) => ({ ...prev, rowsPerPage: rows, currentPage: 1 }));
  };

  useEffect(() => {
    if (user?.email) {
      fetchCandidates();
    }
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(candidateList)) {
      setCandidateListFiltered([]);
      return;
    }

    if (!filters?.search) {
      setCandidateListFiltered(candidateList);
      return;
    }

    const searchTerm = filters.search.toLowerCase();

    const filtered = candidateList.filter((candidate) => {
      if (!candidate || typeof candidate !== "object") return false;

      const {
        first_name = "",
        last_name = "",
        primary_email = "",
        secondary_email = "",
        assigned_recruiter = "",
      } = candidate;

      return (
        String(first_name).toLowerCase().includes(searchTerm) ||
        String(last_name).toLowerCase().includes(searchTerm) ||
        String(first_name + " " + last_name)
          .toLowerCase()
          .includes(searchTerm) ||
        String(primary_email).toLowerCase().includes(searchTerm) ||
        String(secondary_email).toLowerCase().includes(searchTerm) ||
        String(assigned_recruiter).toLowerCase().includes(searchTerm)
      );
    });

    setCandidateListFiltered(filtered);
  }, [candidateList?.length, filters?.search]);

  const fetchCandidates = async () => {
    try {
      const queryObj = {
        email: user?.email,
      };

      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Candidate_Details_Min_v2",
        method: "POST",
        data: queryObj,
      };
      setLoadingList(true);
      const response = await makeRequest(options);
      setLoadingList(false);

      if (response?.status == 200) {
        setCandidateList(response.data);
        setCandidateId("");
        setCandidate("");
      }
    } catch (error) {
      console.log("Error fetching jobs:", error);
    }
  };

  const fetchResume = async () => {
    try {
      if (!user?.email) {
        console.error("User email is not available.");
        return;
      }

      const queryObj = {
        email_id: choosenCandidate,
        emailid: user.email,
        job_description: jobDescription,
      };

      const options = {
        url: "https://us-east1-recruiterportal.cloudfunctions.net/resume_update_suggestions_tailored_job_v3",
        method: "POST",
        data: queryObj,
      };

      setLoading(true);

      const response = await makeRequest(options);
      setLoading(false);
      if (response?.status == 404) {
        console.log("response in 400", response);
        setResumeNotFound(true);
        setTailoredJobs(false);
        return;
      }

      if (response?.data?.result?.status == "success") {
        setData(response.data.result.result);

        let value = response.data.result.result.assessment.match_percentage;

        if (value < 50) {
          setColor({ color: "rgb(254, 52, 21)" });
          setBackgroundClr({
            backgroundImage: `conic-gradient(rgb(254, 52, 21) 0%, rgb(254, 52, 21) ${value}%, rgba(254, 52, 21, 0.341) ${value}%, rgba(254, 52, 21, 0.341) 100%)`,
          });
        } else if (value > 50 && value < 80) {
          setColor({ color: "#1C5084" });
          setBackgroundClr({
            backgroundImage: `conic-gradient(#1C5084 0%, #7B68EE ${value}%,  rgba(64, 91, 171, 0.24) ${value}%, rgba(64, 91, 171, 0.24) 100%)`,
          });
        } else {
          setColor({ color: "rgb(16, 186, 16)" });
          setBackgroundClr({
            backgroundImage: `conic-gradient(rgb(16, 186, 16) 0%, rgb(16, 186, 16) ${value}%, rgba(16, 186, 16, 0.465) ${value}%, rgba(16, 186, 16, 0.465) 100%`,
          });
        }
      }
      setTailoredJobs(true);
      setLoading(false);
      setSmartMatch(true);
      setTailoredJobs(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const renderSearch = () => {
    if (!candidateList?.length) {
      return <></>;
    }

    return (
      <div className="my-3">
        <div className="d-flex gap-2" style={{ maxWidth: "380px" }}>
          <input
            className="form-control themeInput"
            placeholder="Search Candidate..."
            value={filters?.search || ""}
            // value={filters?.searchTmp || ""}
            onChange={(e) => {
              let value = e.target.value;
              setFilters({ ...filters, search: value });

              // if (!value) {
              //   setFilters({ ...filters, searchTmp: value, search: value });
              // } else {
              //   setFilters({ ...filters, searchTmp: value });
              // }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilters({ ...filters, currentPage: 1, search: filters?.searchTmp });
              }
            }}
          />
          {/* <div
            className="newThemeButton pointer"
            onClick={() => {
              setFilters({ ...filters, currentPage: 1, search: filters?.searchTmp });
            }}
          >
            <Search size={20} strokeWidth={3} />
          </div> */}
        </div>
      </div>
    );
  };

  const returnIcon = (gender) => {
    let icons = {
      Male: male_icon,
      Female: female_icon,
    };

    return icons[gender] || otherGender;
  };

  const renderTableView = () => {
    if (!candidateListFiltered?.length) {
      return (
        <div className="bg-white">
          <EmptyView
            hide={loadingList}
            title="No Candidates Found"
            description="There are currently no candidates available in the Job Discovery Suite. Please check back later or update your filters to find potential matches."
          />
        </div>
      );
    }
    return (
      <div className="mt-3">
        <div class="table-responsive">
          <table class="table table-striped table-hover" style={{ "--bs-table-striped-bg": "#f8f9fa" }}>
            <thead></thead>
            <tbody>
              {paginatedRecords.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="w-75">
                      <div className="d-flex gap-2 align-items-center">
                        <div className="" style={{ aspectRatio: "1", height: "40px", borderRadius: "10px" }}>
                          <img
                            className={styles.userIcon}
                            src={returnIcon(item?.gender)}
                            alt={`${item?.first_name} ${item?.last_name}`}
                          />
                        </div>
                        <div>
                          <div className="fw-bold font14 themeColor">{`${item?.first_name} ${item?.last_name}`}</div>
                          <div className="font12">{item?.primary_email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-3 align-items-center nowrap">
                        <div
                          className="pointer d-flex align-items-center gap-2 text-white px-3 py-2 rounded-3 fw-bold"
                          style={{
                            background: "linear-gradient(272deg, rgba(28, 80, 132, 0.8706), #6652DE 100%)",
                          }}
                          onClick={() => {
                            setCandidateDetails(item);
                            setCandidate(item.original_email || item.primary_email);
                            setCandidateId(item?.id);
                            setTimeout(() => {
                              navigate("/exixtingJobs");
                            }, 100);
                          }}
                        >
                          <Briefcase />
                          Current Openings
                        </div>
                        <div
                          className="pointer d-flex align-items-center gap-2 text-white px-3 py-2 rounded-3 fw-bold"
                          style={{
                            background: "linear-gradient(90deg, #F1B440, #F5815A 100%)",
                          }}
                          onClick={() => {
                            setCandidateDetails(item);
                            setCandidate(item.original_email || item.primary_email);
                            setCandidateId(item?.id);
                            setTimeout(() => {
                              setTailoredJobs(true);
                            }, 10);
                          }}
                        >
                          <Star />
                          SmartMatch Analysis
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-2">
          <CustomPagination
            alltotalrecords={totalRecords}
            currentPage={filters.currentPage}
            setCurrentPage={handleSetPage}
            rowsPerPage={filters.rowsPerPage}
            setRowsPerPage={handleSetRowsPerPage}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={`${styles.container} py-3 px-2 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3" style={{ borderRadius: "10px", minHeight: "85px" }}>
          <h2 className="m-0 fw-bold h2 fs-5">Job Discovery Suite</h2>
          <p className="mb-0 mt-1 fs-14">Find the Right Role, Strengthened by ATS Analysis.</p>
        </div>
        {renderSearch()}
        {renderTableView()}
        <ThemeLoader show={loadingList} />
      </div>

      {tailoredJobs && (
        <>
          <div className={`overlay-container visible`}>
            <div className="overlay"></div>
            {/* Sliding Panel */}
            <div className={`panel smartmatch open`}>
              <button
                style={{ zIndex: "99999" }}
                type="button"
                className="btn-close modalclosebtn"
                onClick={() => {
                  setTailoredJobs(false);
                }}
                aria-label="Close"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
              <div className="pannelinner" style={{ position: loading ? "relative" : "", zIndex: 1 }}>
                <div className="col-flex sideOverlay">
                  <div className="t-head row-flex">
                    <img src={tailoredIcon} alt="" className="icon" />
                    <h4 className="head">{data === null ? "Tailored Job Search" : "Detailed Analysis"}</h4>
                  </div>
                  <div className="Instructions row-flex">
                    <FaCircleExclamation style={{ color: "#F1BB53", fontSize: "2.2rem" }} />

                    <p>
                      Paste your job description here to see how your resume aligns with the specified requirements and
                      receive personalized job matching suggestions
                    </p>
                  </div>
                  <div className="jdHead row-flex">
                    <img src={AnalyzeIcon} alt="icon" />
                    Analyze Job Description
                  </div>
                  <p className="jdPara">Click to analyze your resume against provided job description</p>
                  <div className="col-flex corner-box">
                    <textarea
                      className="styled-textarea"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here to see how well your resume fits..."
                    ></textarea>
                  </div>
                  <div className="d-flex row-flex buttons">
                    <button style={{ zIndex: 1 }} className="row-flex jd_matchbtn bg-transparent">
                      <img src={BackIcon} alt="icon" />
                      Back
                    </button>
                    <button style={{ zIndex: 1 }} className="row-flex jd_matchbtn" onClick={() => fetchResume()}>
                      <img src={JdAnalyze} alt="icon" />
                      Analyze Match
                    </button>
                  </div>
                </div>
                <ThemeLoader fixed show={loading} />
              </div>
            </div>
          </div>
        </>
      )}
      {smartMatch ? (
        <OverlayModal
          isActive={smartMatch}
          onClose={() => {
            setJobDescription("");
            setSmartMatch(false);
          }}
          style={{ minWidth: "94%" }}
        >
          <div className="bg-white p-2 rounded mb-1">
            <h2 className="mb-0 fw-bold h2 d-flex align-items-center gap-2 themeColor">
              <span className="ai-search"></span> Smart Match Analysis
            </h2>
          </div>

          <div className="main-jobs paddingminus p-0 ps-md-3">
            <div className="mt-2 resume-analysis-main">
              <div className="instruction d-flex gap-2">
                <FiInfo style={{ color: "#40C0E7", fontSize: "2rem" }} />

                <p className="text-4">{data?.assessment?.verdict_reason}</p>
              </div>
              <div className="analysis-container">
                <div className="col-flex justify-center left-content">
                  <div className="job-percent d-flex flex-column align-center">
                    <div className="d-flex justify-center align-center job-percent-outer" style={backgrounClr}>
                      <div className="d-flex justify-center align-center job-percent-inner">
                        <h1 style={color}>{data?.assessment?.match_percentage}%</h1>
                      </div>
                    </div>
                    <h3 style={color}>{data?.assessment?.submission_verdict?.split("_").join(" ")}</h3>
                  </div>
                </div>

                {/* analysis side bar */}

                <div className=" job-analysis-pointers">
                  <div className="row-flex top-head" onClick={() => setActiveTab(`key4`)}>
                    <div className=" domain-card d-flex row-flex">
                      <h4 className="suggestion-button d-flex flex-wrap">
                        <span className="nowrap me-1"> Job Domain : </span>{" "}
                        <p className="text-3"> {data?.domain_match?.jd_domain}</p>
                      </h4>
                    </div>
                    <div className="divider"></div>
                    <div className=" domain-card d-flex row-flex">
                      <h4 className="suggestion-button d-flex flex-wrap">
                        <span className="nowrap me-1"> Resume Domain : </span>{" "}
                        <span className="text-3"> {data?.domain_match?.resume_domain}</span>
                      </h4>
                    </div>
                  </div>
                  <div>
                    <div className="tabsNavigation row-flex">
                      <div className="navs">
                        <div
                          className={`row-flex jd-head ${activeTab === "key1" ? "active" : ""}`}
                          onClick={() => setActiveTab("key1")}
                        >
                          <div className="suggestion-button row-flex">
                            <span className="material-symbols-outlined suggestion-icon" style={{ fontSize: "16px" }}>
                              action_key
                            </span>

                            <div className="mobHFilters"> Actions </div>
                          </div>
                        </div>

                        <div
                          className={`row-flex jd-head ${activeTab === "key2" ? "active" : ""}`}
                          onClick={() => setActiveTab("key2")}
                        >
                          <div className="suggestion-button row-flex">
                            <img src={TabsKay2} alt="" className="suggestion-icon" />
                            <div className="mobHFilters"> Certifications</div>
                          </div>
                        </div>

                        <div
                          className={`row-flex jd-head ${activeTab === "key3" ? "active" : ""}`}
                          onClick={() => setActiveTab("key3")}
                        >
                          <div className="suggestion-button row-flex">
                            <img src={TabsKay3} alt="" className="suggestion-icon" />
                            <div className="mobHFilters"> Missing skills</div>
                          </div>
                        </div>

                        <div
                          className={`row-flex jd-head ${activeTab === "key4" ? "active" : ""}`}
                          onClick={() => setActiveTab("key4")}
                        >
                          <div className="suggestion-button row-flex">
                            <img src={TabsKay4} alt="" className="suggestion-icon" />
                            <div className="mobHFilters"> Gap Analysis</div>
                          </div>
                        </div>

                        <div
                          className={`row-flex jd-head ${activeTab === "key5" ? "active" : ""}`}
                          onClick={() => setActiveTab("key5")}
                        >
                          <div className="suggestion-button row-flex">
                            <img src={TabsKay5} alt="" className="suggestion-icon" />
                            <div className="mobHFilters"> Experience Enhancement</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {data?.action_items && (
                    <div className={`jd-content ${activeTab === `key1` ? "active" : ""}`}>
                      <div className="jobTitleDate">
                        <h4 className="job-title text-underline">Immediate Actions</h4>
                      </div>
                      <ul className="list-unstyled">
                        {data?.action_items?.immediate.map((point, index) => (
                          <li key={index} className="text-3 mb-2">
                            {point}
                          </li>
                        ))}
                      </ul>
                      <div className="jobTitleDate">
                        <h4 className="job-title text-underline">Short term Actions</h4>
                      </div>
                      <ul className="list-unstyled">
                        {data?.action_items?.short_term.map((point, index) => (
                          <li key={index} className="text-3 mb-2">
                            {point}
                          </li>
                        ))}
                      </ul>
                      <div className="jobTitleDate">
                        <h4 className="job-title text-underline">Long term Actions</h4>
                      </div>
                      <ul className="list-unstyled">
                        {data?.action_items?.long_term.map((point, index) => (
                          <li key={index} className="text-3 mb-2">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data?.certifications && (
                    <div className={`jd-content ${activeTab === `key2` ? "active" : ""}`}>
                      {data?.certifications?.required.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Required</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.certifications?.required.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {data?.certifications?.missing.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Missing</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.certifications?.missing.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {data?.certifications?.alternatives.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Alternatives</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.certifications?.alternatives.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {data?.skill_gaps && (
                    <div className={`jd-content ${activeTab === `key3` ? "active" : ""}`}>
                      {data?.skill_gaps?.critical_missing?.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Critical Skills</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.skill_gaps?.critical_missing.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {data?.skill_gaps?.recommended_missing?.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Recommended Skills</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.skill_gaps?.recommended_missing.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {data?.skill_gaps?.training_suggestions?.length > 0 && (
                        <>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Training Suggestions</h4>
                          </div>
                          <ul className="list-unstyled">
                            {data?.skill_gaps?.training_suggestions.map((point, idx) => (
                              <li key={idx} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {data?.domain_match && (
                    <div className={`jd-content ${activeTab === `key4` ? "active" : ""}`}>
                      {data?.domain_match?.gap_analysis?.length > 0 ? (
                        <ul className="list-unstyled">
                          {data?.domain_match?.gap_analysis.map((point, idx) => (
                            <li key={idx} className="text-3 mb-2">
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="list-unstyled">
                          <li className="text-3 mb-2">Nothing to show</li>
                        </ul>
                      )}
                    </div>
                  )}

                  {data?.experience_enhancement
                    ? data?.experience_enhancement?.map((value, idx) => (
                        <div key={idx} className={`jd-content ${activeTab === `key5` ? "active" : ""}`}>
                          <div className="jobTitleDate d-flex justify-between">
                            <h4 className="job-title text-underline">{value.company}</h4>
                            <p className="text-3 fw-bold" style={{ color: "#454545" }}>
                              {value.period}
                            </p>
                          </div>
                          <ul className="list-unstyled">
                            {value?.current_points?.map((point, index) => (
                              <li key={index} className="text-3 mb-2">
                                {point}
                              </li>
                            ))}
                          </ul>
                          <div className="jobTitleDate">
                            <h4 className="job-title text-underline">Suggestions</h4>
                          </div>
                          {value?.suggested_points?.map((points, index) => (
                            <ul className="list-unstyled">
                              <li className="text-5">{points?.point}</li>
                              <li className="text-5 mb-2">Reason : {points?.why_important}</li>
                            </ul>
                          ))}
                        </div>
                      ))
                    : " "}
                </div>
              </div>
            </div>
          </div>
        </OverlayModal>
      ) : (
        <></>
      )}
      <Confirm
        deleteTitle="Close"
        show={resumeNotFound}
        hideCancel
        icon={"close"}
        result={() => {
          setResumeNotFound(false);
          setJobDescription("");
          setTailoredJobs(false);
        }}
        title="Resume not Found"
        text={
          user?.user_role === "recruiter"
            ? `   <p>
              Please contact the admin to upload a resume for this candidate <strong>${choosenCandidate}</strong>.
            </p>`
            : `<p>Resume not uploaded for this candidate. Please upload the resume to proceed.</p>`
        }
      />
    </div>
  );
};

export default JobSearch;
