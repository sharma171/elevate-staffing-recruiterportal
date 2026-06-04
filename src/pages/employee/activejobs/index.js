import { useEffect, useState, useMemo } from "react";
import { axiosApi, CustomPagination, EmptyView, OverlayModal, ThemeLoader } from "../../../components";

import { useAuth } from "../../../authContext";

import { RiSearchLine } from "react-icons/ri";
import { TbBriefcaseFilled } from "react-icons/tb";
import { Building2, Calendar, MapPin, X, ArrowLeft } from "lucide-react";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { formatDateToET, timeAgo } from "../../../helpers/StrHelpers";

let APIURL = "https://get-jobs-from-db-comparing-resume-employee-v3-305451280005.us-east1.run.app";

let APPLYREAPPLYAPI = "https://check-apply-reapply-buttons-employee-v3-305451280005.us-east1.run.app";

function JobDetails({ job, onBack }) {
  const [loading, setLoading] = useState(false);
  // const [jobData, setjobData] = useState({});
  const [jobApplyData, setJobApplyData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 990);

  const { user } = useAuth();
  let email_id = user?.email;

  let jobDetailsData = job || {};

  const hasAppliedforJob = jobApplyData?.has_applied;

  useEffect(() => {
    checkAPplyStatus();
  }, [job?.job_id]);

  const checkAPplyStatus = () => {
    if (!job?.job_id) {
      return;
    }

    setLoading(true);

    let payload = {
      job_id: job?.job_id,
      action: "check_status",
      employee_email: email_id,
    };

    axiosApi
      .post(APPLYREAPPLYAPI, payload)
      .then((res) => {
        setJobApplyData(res.data);
      })
      .catch((err) => {
        console.log(err, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const applyforJob = () => {
    if (!job?.job_id) {
      return;
    }

    setLoading(true);

    let payload = {
      job_id: job?.job_id,
      action: "apply",
      employee_email: email_id,
    };

    axiosApi
      .post(APPLYREAPPLYAPI, payload)
      .then((res) => {
        checkAPplyStatus();
      })
      .catch((err) => {
        console.log(err, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // useEffect(() => {
  //   getJobDetails();
  // }, [job?.job_id]);

  // const getJobDetails = () => {
  //   if (!job?.job_id) {
  //     return;
  //   }

  //   setLoading(true);

  //   let payload = { job_id: job?.job_id };

  //   axiosApi
  //     .post(APIURL, payload)
  //     .then((res) => {
  //       setjobData(res.data);
  //     })
  //     .catch((err) => {
  //       console.log(err, "error");
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  if (!job) return null;

  const renderArrayData = (arrdata = []) => {
    return (
      <ul>
        {arrdata.map((item, index) => {
          return (
            <li key={index} className="mb-2">
              {item}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderJOBView = () => {
    return (
      <div>
        <div
          className="d-flex align-items-center gap-2 mb-3 cursor-pointer hidemodalclosebtn hoverActionBTNSML"
          style={{ width: "max-content" }}
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span className="fw-bold">Back to Jobs</span>
        </div>
        <h3 className="fw-bold mb-1">{jobDetailsData.job_title}</h3>

        {/* <div className="d-flex gap-2 justify-content-between">
          <h3 className="fw-bold mb-1">{jobDetailsData.job_title}</h3>
          <div
            className="pdfcontrollButtonsPDF pointer d-flex align-items-center justify-content-center hidemodalclosebtn"
            title="Close"
            style={{ aspectRatio: 1 }}
            onClick={onBack}
          >
            <X size={22} />
          </div>
        </div> */}

        <div className="themeColor fw-medium mb-3 d-flex gap-2 align-items-center">
          <span> {jobDetailsData.employer_name} </span> <span> |</span>
          <span className="py-1 px-3 bg-secondary bg-opacity-10 themeColor fw-medium rounded">
            {" "}
            {jobDetailsData.job_is_remote ? "Remote" : "Onsite"}{" "}
          </span>{" "}
          <span className="py-1 px-3 bg-secondary bg-opacity-10 themeColor fw-medium rounded">
            {" "}
            {jobDetailsData.job_employment_type}{" "}
          </span>
        </div>
        <div className="d-flex gap-3 flex-wrap mb-3 font14">
          {jobDetailsData.job_publisher && (
            <div className="d-flex gap-1 align-items-center">
              <Building2 size={16} />
              {jobDetailsData.job_publisher}
            </div>
          )}

          {(jobDetailsData.job_city || jobDetailsData.job_state || jobDetailsData.job_country) && (
            <div className="d-flex gap-1 align-items-center">
              <MapPin size={16} />
              {[jobDetailsData.job_city, jobDetailsData.job_state, jobDetailsData.job_country]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}

          {jobDetailsData.job_posted_at_datetime_utc && (
            <div className="d-flex gap-1 align-items-center">
              <Calendar size={16} />
              {formatDateToET(jobDetailsData.job_posted_at_datetime_utc)}
            </div>
          )}
        </div>
        <div
          onClick={() => {
            applyforJob();
            if (jobDetailsData?.job_apply_link) {
              window.open(jobDetailsData.job_apply_link, "_blank");
            }
          }}
          className="themeButton themeButtonHover py-2 mb-3 mt-2 fw-semibold"
        >
          {hasAppliedforJob ? "Reapply" : "Apply Now"}
        </div>

        {jobDetailsData?.job_highlights?.Qualifications ? (
          <div className="mb-3">
            <div className="mb-2 fw-bold h6 themeColor">Qualifications</div>
            <div>{renderArrayData(jobDetailsData?.job_highlights?.Qualifications)}</div>
          </div>
        ) : (
          <></>
        )}

        {jobDetailsData?.job_highlights?.Responsibilities ? (
          <div className="mb-3">
            <div className="mb-2 fw-bold h6 themeColor">Responsibilities</div>
            <div>{renderArrayData(jobDetailsData?.job_highlights?.Responsibilities)}</div>
          </div>
        ) : (
          <></>
        )}

        {jobDetailsData?.job_highlights?.Benefits ? (
          <div className="mb-2">
            <div className="mb-2 fw-bold h6 themeColor">Benefits</div>
            <div>{renderArrayData(jobDetailsData?.job_highlights?.Benefits)}</div>
          </div>
        ) : (
          <></>
        )}

        <ThemeLoader show={loading} />
      </div>
    );
  };

  if (isMobile) {
    return (
      <OverlayModal modalStyle={{ background: "#fff" }} style={{ maxWidth: "750px" }} isActive={true} onClose={onBack}>
        {renderJOBView()}
      </OverlayModal>
    );
  }

  return <div className="bg-white p-4 pt-2 rounded shadow-sm shadow">{renderJOBView()}</div>;
}

/* ================= MAIN COMPONENT ================= */

function ActiveJobs() {
  const [loading, setLoading] = useState(false);
  const [allData, setallData] = useState({});
  const [jobsData, setjobsData] = useState([]);
  const [apiresData, setapiresData] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

  let paginationData = apiresData?.pagination;

  const [filters, setFilters] = useState({
    currentPage: 1,
    rowsPerPage: 10,
  });

  const { user } = useAuth();
  let email_id = user?.email;

  useEffect(() => {
    getJobs();
    setSelectedJob(null);
  }, [email_id, JSON.stringify(filters), JSON.stringify(allData)]);

  const getJobs = () => {
    if (!email_id) return;

    setLoading(true);

    let payload = {
      employee_email: email_id,
      page: filters.currentPage,
      page_size: filters.rowsPerPage,
      search: allData.search || null,
    };

    if (allData.jobType !== "Job Type") {
      payload.remote_only = false;
    }

    if (allData.jobType == "Remote") {
      payload.remote_only = true;
    }

    if (allData.jobDays) {
      payload.days = allData.jobDays;
    }

    axiosApi
      .post(APIURL, payload)
      .then((res) => {
        setjobsData(res.data?.matches);
        setapiresData(res.data);
      })
      .catch((err) => {
        console.log(err, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (key, value) => {
    setallData({ ...allData, [key]: value });
    setFilters((prev) => ({ ...prev, currentPage: 1 }));
  };

  const renderJobs = () => {
    return jobsData.map((item, index) => {
      let isRemote = item.job_is_remote;
      return (
        <div key={index} className="p-3 mb-3 border rounded hover-shadow pointer" onClick={() => setSelectedJob(item)}>
          <div className="d-flex align-items-start gap-2 justify-content-between">
            <div>
              <div className="h5 fw-semibold mb-1">{item.job_title}</div>
              <div className="themeColor fw-medium mb-2">
                {item.employer_name} | {isRemote ? "Remote" : "Onsite"} | {item.job_employment_type}
              </div>
            </div>
            <div className="p-2 bg-primary rounded-2 themeColor bg-opacity-10">
              <HiMiniBuildingOffice2 size={22} className="m-1" />
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap mb-2 font14 fw-medium">
            {item.job_publisher && (
              <div className="d-flex gap-1 align-items-center pe-2 border-end">
                <Building2 size={16} className="themeColor" />
                {item.job_publisher}
              </div>
            )}

            {(item.job_city || item.job_state || item.job_country) && (
              <div className="d-flex gap-1 align-items-center pe-2 border-end">
                <MapPin size={16} className="themeColor" />
                {[item.job_city, item.job_state, item.job_country].filter(Boolean).join(", ")}
              </div>
            )}

            {item.job_posted_at_datetime_utc && (
              <div className="d-flex gap-1 align-items-center">
                <Calendar size={16} className="themeColor" />
                {formatDateToET(item.job_posted_at_datetime_utc)}
              </div>
            )}
          </div>

          <div className="text-truncate " style={{ maxWidth: "90%" }} title={item?.job_description}>
            {item?.job_description}
          </div>

          {item.job_posted_at_datetime_utc && (
            <div
              className="py-1 px-2 bg-primary bg-opacity-10 mt-2 themeColor fw-medium"
              style={{ width: "max-content", borderRadius: "1000px" }}
            >
              {timeAgo(item.job_posted_at_datetime_utc)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderJobsData = () => {
    if (!jobsData?.length) {
      return <EmptyView hide={loading} title="No Jobs Found" />;
    }

    return (
      <div className="bg-white px-3 py-4">
        <div className={selectedJob ? "row g-3" : ""}>
          <div className={selectedJob ? "col-lg-7" : ""}>{renderJobs()}</div>

          <div className={selectedJob ? "col-lg-5" : ""}>
            <JobDetails job={selectedJob} onBack={() => setSelectedJob(null)} />
          </div>
        </div>
      </div>
    );
  };

  const rendertabsData = () => {
    return (
      <div className="px-0 px-md-3 pt-3">
        <div className={`headerboxglass topbox`}>
          <div
            className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 topHead"
            style={{ overflowX: "auto" }}
          >
            <div className="d-flex align-items-center" style={{ gap: "12px" }}>
              <div
                className={`input-group searchInputGroup border-0 mx-0 ${allData.search ? "bg-white" : "bg-white"}`}
                style={{
                  minWidth: "150px",
                  boxShadow: "0px 0px 7px 2px #00000012",
                  borderRadius: "12px",
                  paddingTop: "7px",
                  paddingBottom: "7px",
                }}
              >
                <span className="input-group-text bg-white border-end-0 icon rounded">
                  <RiSearchLine />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 searchInput px-0"
                  placeholder="Search Jobs"
                  value={allData.search || ""}
                  onChange={(e) => handleChange("search", e.target.value)}
                />
              </div>

              <div
                className={`select-wrapper filter-select d-flex align-items-center ${
                  !allData.jobType || allData.jobType == "Job Type" ? "inactiveSelect" : "activeSelect"
                }`}
              >
                <TbBriefcaseFilled className="icon" />
                <select
                  className="dropSelect form-select"
                  value={allData.jobType}
                  onChange={(e) => handleChange("jobType", e.target.value)}
                >
                  {["Job Type", "Remote", "Contractor"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`select-wrapper filter-select d-flex align-items-center ${
                  !allData.jobDays ? "inactiveSelect" : "activeSelect"
                }`}
              >
                <Calendar className="icon" />
                <select
                  className="dropSelect form-select"
                  value={allData.jobDays || ""}
                  onChange={(e) => handleChange("jobDays", e.target.value)}
                >
                  {[
                    { label: "Filter by days", value: "" },
                    { label: "Last 24 hours", value: "1" },
                    { label: "Last 7 days", value: "7" },
                    { label: "Last 14 days", value: "14" },
                    { label: "Last 30 days", value: "30" },
                    { label: "Last 60 days", value: "60" },
                    { label: "Last 90 days", value: "90" },
                  ].map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="clear-filters">
                <div
                  className="cursor-pointer nowrap font14 d-flex gap-2 mx-2 align-items-center"
                  onClick={() => setallData({ jobDays: "", jobType: "Job Type" })}
                >
                  <X size={20} />
                  <span>Clear filters</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div
                className="fw-normal d-flex justify-content-center gap-2 navButtons bg-white themeColor nowrap"
                style={{ borderRadius: "12px" }}
              >
                <TbBriefcaseFilled />
                <div className="font14">
                  <span> Jobs Found: </span>
                  <span className="fw-bold">{paginationData?.total_items || jobsData.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex backgroundImage">
      <div className={`w-100 py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
        <div className="headerBackground text-white p-3 rounded-top">
          <div className="d-flex align-items-center justify-content-between">
            <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>
              <h2 className="mb-0 fw-bold h2">Active Jobs</h2>
              <p className="my-0">Discover your next career move—opportunities updated daily.</p>
            </div>
          </div>
        </div>

        {rendertabsData()}

        {renderJobsData()}

        <div className="px-3">
          <CustomPagination
            alltotalrecords={paginationData?.total_items || 0}
            currentPage={filters.currentPage}
            setCurrentPage={(val) => setFilters({ ...filters, currentPage: val })}
            rowsPerPage={filters.rowsPerPage}
            setRowsPerPage={(val) => setFilters({ ...filters, rowsPerPage: val, currentPage: 1 })}
          />
        </div>
      </div>

      <ThemeLoader show={loading} />
    </div>
  );
}

export default ActiveJobs;
