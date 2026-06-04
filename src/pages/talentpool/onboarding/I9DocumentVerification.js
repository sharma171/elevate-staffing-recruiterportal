import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Video,
  Star,
  Mail,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Play,
  Upload,
  Shield,
  CheckSquare,
  Download,
  Eye,
  FileText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import ScheduleVerificationModal from "./ScheduleVerificationModal";
// import { EVerifyUploadModal } from "./EVerifyUploadModal";
import styles from "./I9DocumentVerification.module.css";
import { CustomPagination, ThemeLoader } from "../../../components";
import moment from "moment";
import Uploadi9DocsModal from "./Uploadi9DocsModal";
import { useAuth } from "../../../authContext";
import { formatFileSize } from "../../../helpers/StrHelpers";
import { tagVariantClasses } from "../CandidateProjectsTab";
import FilePreview from "../../benchcandidate/FilePreview";
import { getDeviceData } from "../../../DeviceStore";
import sendEncryptedRequest from "../../../components/EncryptedRequest";

const API_URL = "https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app";

const TAX_FORMS_API_URL = "https://send-retrieve-employee-tax-forms-v1-305451280005.us-east1.run.app";

const DOCS_API_URL = "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3";

function I9VerificationSection({ candidate, onStatusChange, disabled }) {
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [confirmEVerify, setConfirmEVerify] = useState(false);
  const [confirmVideo, setConfirmVideo] = useState(false);
  const [confirmReschedule, setConfirmReschedule] = useState(false);

  const [processingEVerify, setProcessingEVerify] = useState(false);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [eVerifyStatus, setEVerifyStatus] = useState({});
  const [verifyEverifyPopup, setverifyEverifyPopup] = useState(false);
  const [candidateDocs, setcandidateDocs] = useState([]);
  const [docObject, setDocObject] = useState(null);
  const [isShowDocs, setisShowDocs] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const docs = candidateDocs || [];
  const totalCount = candidateDocs?.length;

  let { keys, fingerprints } = getDeviceData();

  const paginatedDocs = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return docs.slice(start, end);
  }, [docs, page, limit]);

  const isEverifyed = eVerifyStatus?.verified_by || eVerifyStatus?.is_completed;

  let candidateEmail = candidate?.original_email;
  const { user } = useAuth();

  let adminEmail = user?.email;
  // adminEmail = "marketing@4spheresolutions.com";
  // candidateEmail = "muni.k0892@gmail.com";

  useEffect(() => {
    if (candidateEmail) fetchStatus();
  }, [candidateEmail]);

  useEffect(() => {
    getDocs();
  }, []);

  const downloadDoc = (file, isView) => {
    const payload = {
      emailid: adminEmail,
      email_id: candidateEmail,
      task: "download_files",
      file_name: [file.file_name],
    };
    setLoader(true);
    axios
      .post(DOCS_API_URL, payload)
      .then((res) => {
        let data = res?.data?.retrieve_files[0];
        const { base64, file_name } = data;

        if (base64?.length < 100) {
          return toast.error(base64);
        }

        if (isView) {
          setDocObject(data);
          return;
        }

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file_name || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoader(false);
      });
  };

  const getDocs = () => {
    const payload = {
      emailid: adminEmail,
      email_id: candidateEmail,
      task: "get_file_names",
    };
    setLoader(true);
    axios
      .post(DOCS_API_URL, payload)
      .then((res) => {
        const normalize = (str) =>
          String(str || "")
            .toLowerCase()
            .replace(/[_\-\s]/g, "");

        const targets = ["I-9 Form", "EVerify", "I-9 Form Audit"].map(normalize);

        const documents = res.data?.available_files || [];
        const docs = documents.filter((item) => targets.includes(normalize(item.doc_type)));

        setcandidateDocs(docs || []);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoader(false);
      });
  };

  const fetchStatus = () => {
    setLoading(true);

    axios
      .post(API_URL, {
        action: "get-i9-status",
        requesting_user_email: adminEmail,
        candidate_email: candidateEmail,
      })
      .then((res) => {
        let result = res.data;
        setEVerifyStatus(result?.everify);
        setData(result);
      })
      .catch(() => toast.error("Failed to fetch I-9 status"))
      .finally(() => setLoading(false));
  };

  const handleJoinCall = () => {
    const channel = data?.video_verification?.call_details?.channel_name;

    if (!channel) {
      toast.error("No active call found.");
      return;
    }

    const name = data?.candidate_name || "";
    const email = data?.candidate_email || "";

    window.open(
      `/employer/verification-call?channel=${channel}&candidate=${encodeURIComponent(name)}&email=${encodeURIComponent(
        email,
      )}`,
      "_blank",
    );
  };

  const handleMarkEVerifyComplete = () => {
    setConfirmEVerify(false);
    setProcessingEVerify(true);

    axios
      .post(API_URL, {
        action: "update-everify-plus-status",
        requesting_user_email: adminEmail,
        candidate_email: candidateEmail,
        status: "Completed",
      })
      .then(() => {
        toast.success("E-Verify+ status has been marked as completed.");
        fetchStatus();
        onStatusChange && onStatusChange("everify_completed");
      })
      .catch(() => toast.error("Failed to update status. Please try again."))
      .finally(() => setProcessingEVerify(false));
  };

  const handleEVerifyComplete = () => {
    setConfirmEVerify(false);
    setLoader(true);

    axios
      .post(TAX_FORMS_API_URL, {
        action: "verify-everify",
        requesting_user_email: adminEmail,
        candidate_email: candidateEmail,
      })
      .then((res) => {
        toast.success("E-Verify status has been marked as completed.");
        fetchStatus();

        let result = res.data;

        setEVerifyStatus(result);
      })
      .catch(() => toast.error("Failed to update status. Please try again."))
      .finally(() => setLoader(false));
  };

  const updateCandidateData = async () => {
    let payload = {
      emailid: adminEmail,
      modify: {
        columns: {
          everify_status: "Completed",
        },
        id: candidate?.id,
      },
    };

    setProcessingVideo(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints);
    setProcessingVideo(false);
    fetchStatus();
    if (result.status) {
      let res = result.data;
      toast.success("The verification call has been marked as completed.");
    } else {
      let err = result.data;
      toast.error(err?.response?.data?.error || err?.response?.data?.message || err?.message || "error");
    }
  };

  const handleMarkVideoComplete = () => {
    setConfirmVideo(false);
    setProcessingVideo(true);

    const channel = data?.video_verification?.call_details?.channel_name;

    // if (!channel) {
    updateCandidateData();
    return;
    // }

    axios
      .post(API_URL, {
        action: "end-verification-call",
        requesting_user_email: adminEmail,
        channel_name: channel,
      })
      .then(() => {
        toast.success("The verification call has been marked as completed.");
        fetchStatus();
        onStatusChange && onStatusChange("video_completed");
      })
      .catch(() => toast.error("Failed to complete the call. Please try again."))
      .finally(() => setProcessingVideo(false));
  };

  const handleViewRecording = () => {
    setDownloading(true);

    const channel = data?.video_verification?.call_details?.channel_name;

    axios
      .post(API_URL, {
        action: "get-recording-url",
        requesting_user_email: adminEmail,
        channel_name: channel,
        expiration_minutes: 60,
      })
      .then((res) => {
        if (res.data?.download_url) {
          window.open(res.data.download_url, "_blank");
          toast.success(`Duration: ${res.data.duration_minutes?.toFixed(1) || "?"} minutes`);
        } else {
          toast.error("The call recording is not yet available.");
        }
      })
      .catch(() => toast.error("Failed to get recording URL. Please try again."))
      .finally(() => setDownloading(false));
  };

  function renderDocs() {
    const docs = candidateDocs || [];

    if (!docs?.length || !isShowDocs) {
      return;
    }

    return (
      <div className="d-flex flex-column gap-2 mt-3">
        {paginatedDocs.map((doc, index) => {
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];

          const isAllowedView = allowedTypes.includes((doc?.file_extension || "").toLowerCase());
          let isPDF = doc?.file_extension == "application/pdf";

          return (
            <div key={index} className={styles.docRow}>
              <div className={`w-100 overflow-hidden ${styles.docName}`}>
                <div>
                  <FileText size={20} className={`${isPDF ? "text-danger" : ""}`} />
                </div>
                <div className="w-100 overflow-hidden">
                  <div className="fw-medium text-truncate w-100 overflow-hidden" title={doc.file_name || doc.name}>
                    {doc.file_name || doc.name}
                  </div>
                  <div className="d-flex gap-2 mt-1">
                    {doc?.file_size ? <div>{formatFileSize(doc?.file_size)}</div> : <></>}
                    <div
                      className={"badge px-2 py-1 fw-semibold capitalize"}
                      style={tagVariantClasses(doc?.doc_type) || {}}
                    >
                      {String(doc?.doc_type).replaceAll("_", " ")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 pe-2">
                <div
                  className={`pointer`}
                  title="View"
                  style={isAllowedView ? {} : { color: "#9d9d9d", cursor: "not-allowed" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (isAllowedView) {
                      downloadDoc(doc, true);
                    }
                  }}
                >
                  <Eye size={16} />
                </div>

                <div
                  className="pointer"
                  title="Download"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => downloadDoc(doc)}
                >
                  <Download size={16} />
                </div>
              </div>
            </div>
          );
        })}

        <div className="px-2 pt-2">
          <CustomPagination
            alltotalrecords={totalCount}
            currentPage={page}
            setCurrentPage={(newPage) => {
              setPage(newPage);
            }}
            rowsPerPage={limit}
            setRowsPerPage={(newLimit) => {
              const newPage = Math.floor(((page - 1) * limit) / newLimit) + 1;
              setLimit(newLimit);
              setPage(newPage);
            }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} />
        Loading I-9 verification status...
      </div>
    );
  }

  const everify = data?.everify_plus;
  const video = data?.video_verification;

  const callStatedAt = video?.call_details?.started_at?.formatted_time;

  const bgAndColor = everify?.is_completed
    ? { background: "#dcfce7", color: "#15803d" }
    : { background: "#fef3c7", color: "#d97706" };

  return (
    <div>
      <div className={styles.header}>
        <div className="d-flex align-items-center gap-2 fw-medium">
          {data?.is_i9_complete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          I-9 Document Verification
        </div>
        <span className={`${styles.status} ${styles[String(data?.overall_status).toLowerCase()]}`}>
          {String(data?.overall_status || "Not Started").replaceAll("_", " ")}
        </span>
      </div>

      {!data?.is_i9_complete && (
        <div className={styles.notice}>
          {data?.completion_requirements ||
            "Both E-Verify+ and Video Verification must be completed for I-9 compliance."}
        </div>
      )}

      {/* STEP 1 */}
      <div className={`${styles.card} ${styles.step1card} ${everify?.is_completed ? "" : styles.step1cardorange}`}>
        <div className="d-flex align-items-start gap-2">
          <div className="p-2 rounded rounded-4 d-sm-block d-none" style={bgAndColor}>
            <Star size={22} />
          </div>
          <div className="w-100">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="fw-semibold h6">Step 1: E-Verify+</div>
                {!everify?.is_completed && <div className={`${styles.status} ${styles?.in_progress}`}>Recommended</div>}
              </div>

              <div className={`${styles.status} ${styles[String(everify?.status).toLowerCase()]}`}>
                {String(everify?.status).replaceAll("_", " ") || "Not Started"}
              </div>
            </div>

            <p className="my-2 mb-3">
              {everify?.description ||
                "Complete your I-9 directly through E-Verify+ for a faster, streamlined experience. E-Verify+ combines Form I-9 and employment verification into one seamless digital process."}
            </p>

            {!everify?.is_completed && (
              <>
                {everify?.contact_email ? (
                  <div className={`fw-medium d-flex align-items-center gap-2 ${styles.contact}`}>
                    <Mail size={15} />
                    Contact{" "}
                    <a className="themePurple fw-semibold" href={`mailto:${everify?.contact_email}`}>
                      {everify?.contact_email}
                    </a>{" "}
                    to learn more about setting up E-Verify+.
                  </div>
                ) : (
                  <></>
                )}

                {disabled ? (
                  <></>
                ) : (
                  <div className={styles.actions}>
                    <button
                      className="px-3 py-2 mt-2 d-flex gap-2 align-items-center successoutlineButton successoutlineButtonWhite border"
                      type="button"
                      disabled={processingEVerify}
                      onClick={() => setConfirmEVerify(true)}
                    >
                      {processingEVerify ? <Loader2 className={styles.spin} /> : <CheckCircle2 size={18} />}
                      Mark as Completed
                    </button>
                  </div>
                )}
              </>
            )}

            {everify?.is_completed && (
              <div className={`fw-semibold ${styles.success}`}>
                <CheckCircle2 size={18} />
                E-Verify+ verification completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div className={`${styles.card} ${styles.step2card}`}>
        <div className="d-flex align-items-start gap-2">
          <div className="text-success p-2 rounded rounded-4 d-sm-block d-none" style={{ background: "#c9e0fd69" }}>
            <Video size={22} />
          </div>
          <div className="w-100">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <div className="fw-semibold h6">Step 2: Video Verification</div>

              <div className={`${styles.status} ${styles[String(video?.status).toLowerCase()]}`}>
                {String(video?.status || "Not Started").replaceAll("_", " ") || "Not Started"}
              </div>
            </div>

            {/* scheduled Case */}
            {video?.status === "scheduled" && (
              <>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <Calendar size={18} /> {video?.call_details?.scheduled_at.formatted_date}
                </div>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <Clock size={18} /> {video?.call_details?.scheduled_at.formatted_time}{" "}
                  {video?.call_details?.scheduled_at.timezone}
                </div>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <User size={18} className={styles.pulse} /> With: <b>{video?.call_details?.recruiter_name || ""}</b>
                </div>
                {disabled ? (
                  <></>
                ) : (
                  <div className={`mt-3 ${styles.actions}`}>
                    <button
                      type="button"
                      className="themePurpleBGHover rounded px-3 py-2 text-white d-flex gap-2 align-items-center pointer"
                      onClick={handleJoinCall}
                    >
                      <ExternalLink size={18} /> Join Call
                    </button>

                    <button
                      type="button"
                      className="btn rounded px-3 d-flex gap-2 align-items-center btn-outline-success border-success border"
                      style={{ paddingTop: "5.2px", paddingBottom: "5.2px" }}
                      onClick={() => setConfirmVideo(true)}
                    >
                      {processingVideo ? <Loader2 className={styles.spin} /> : <CheckCircle2 size={18} />}
                      Mark as Completed
                    </button>

                    <button
                      className="rounded px-3 py-2 text-white d-flex gap-2 align-items-center btn btn-primary"
                      type="button"
                      onClick={() => setShowSchedule(true)}
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </>
            )}

            {!video?.is_completed && (!video?.status || video?.status === "not_started") && !video?.call_details ? (
              <>
                <div>
                  {video?.description ||
                    "Schedule a video call with HR to verify your identity documents (passport, ID, work authorization). The call will be recorded for compliance purposes."}
                </div>

                {disabled ? (
                  <></>
                ) : (
                  <div className={`mt-3 ${styles.actions}`}>
                    <div
                      onClick={() => setShowSchedule(true)}
                      style={{ width: "max-content" }}
                      className="themePurpleBGHover rounded px-3 py-2 text-white d-flex gap-2 align-items-center pointer"
                    >
                      <Calendar size={18} />
                      <span> Schedule Video Verification Call</span>
                    </div>
                    <button
                      type="button"
                      className="btn rounded px-3 d-flex gap-2 align-items-center btn-outline-success border-success border"
                      style={{ paddingTop: "5.2px", paddingBottom: "5.2px" }}
                      onClick={() => setConfirmVideo(true)}
                    >
                      {processingVideo ? <Loader2 className={styles.spin} /> : <CheckCircle2 size={18} />}
                      Mark as Completed
                    </button>
                  </div>
                )}
              </>
            ) : (
              <></>
            )}

            {video?.status === "in_progress" && (
              <>
                <div className="d-flex gap-2 align-items-center mb-1" style={{ color: "#1d4ed8" }}>
                  <Video size={18} className={styles.pulse} /> Call In Progress
                </div>

                {callStatedAt ? (
                  <div className="d-flex gap-2 align-items-center mb-1">
                    <Clock size={18} className={styles.pulse} /> Started: <b>{callStatedAt}</b>
                  </div>
                ) : (
                  <></>
                )}

                <div className="d-flex gap-2 align-items-center mb-2">
                  <User size={18} className={styles.pulse} /> With: <b>{video?.call_details?.recruiter_name || ""}</b>
                </div>

                <div className={`mt-3 ${styles.actions}`}>
                  <button
                    type="button"
                    className="themePurpleBGHover rounded px-3 py-2 text-white d-flex gap-2 align-items-center"
                    onClick={handleJoinCall}
                  >
                    <ExternalLink size={18} /> Join Call Now
                  </button>

                  {disabled ? (
                    <></>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn rounded px-3 d-flex gap-2 align-items-center btn-outline-success border-success border"
                        style={{ paddingTop: "5.2px", paddingBottom: "5.2px" }}
                        onClick={() => setConfirmVideo(true)}
                      >
                        {processingVideo ? <Loader2 className={styles.spin} /> : <CheckCircle2 size={18} />}
                        Mark as Completed
                      </button>
                      <button
                        className="rounded px-3 py-2 text-white d-flex gap-2 align-items-center btn btn-primary"
                        type="button"
                        onClick={() => setConfirmReschedule(true)}
                      >
                        Reschedule
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {video?.is_completed && (
              <>
                <div className="text-success d-flex gap-2 align-items-center fw-medium  mb-2">
                  <CheckCircle2 size={16} />
                  {video?.message || "Video Verification Completed"}
                </div>
                {video?.call_details?.recruiter_name ? (
                  <div className="d-flex gap-2 align-items-center fw-medium my-2">
                    <User size={16} />
                    Verified by: <b>{video?.call_details?.recruiter_name}</b>
                  </div>
                ) : (
                  <></>
                )}
                {video?.call_details?.recording_url ? (
                  <button
                    type="button"
                    className="px-3 py-2 mt-2 d-flex gap-2 align-items-center successoutlineButton successoutlineButtonWhite border"
                    onClick={handleViewRecording}
                    disabled={downloading}
                  >
                    <Play size={18} />
                    {downloading ? "Loading..." : "View Recording"}
                  </button>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* {data?.is_i9_complete && ( */}

      <div className={`${styles.card} ${styles.step1card} d-block py-4 ${styles.completeBox}`}>
        <div className="d-flex gap-2 align-items-center justify-content-between w-100">
          <div className="d-flex gap-2">
            <Shield size={18} />
            <div>
              <div className="d-flex gap-2 align-items-center fw-medium" style={{ color: "#080118" }}>
                <span>E-Verify</span>
              </div>
              {eVerifyStatus?.verified_by ? (
                <div className="d-flex gap-2 mt-2">
                  <User size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Verified by {eVerifyStatus?.verified_by} on{" "}
                    {moment(eVerifyStatus?.verified_at).format("MMM D, YYYY")}
                  </span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          {disabled ? (
            <></>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              {isEverifyed ? (
                <div className="text-success d-flex gap-2 align-items-center">
                  <CheckSquare size={16} /> <span>Complete</span>
                </div>
              ) : (
                <>
                  <button
                    className="themePurpleBGHover rounded px-3 py-2 text-white d-flex gap-2 align-items-center"
                    type="button"
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload size={18} /> Upload Documents
                  </button>

                  <button
                    className="btn rounded px-3 d-flex gap-2 align-items-center btn-outline-success"
                    style={{ paddingTop: "5.2px", paddingBottom: "5.2px" }}
                    type="button"
                    onClick={() => setverifyEverifyPopup(true)}
                  >
                    <CheckCircle2 size={18} /> Mark as Completed
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="gap-2 d-flex flex-column mt-4" style={{ color: "#000" }}>
          <div className="gap-2 d-flex align-items-center justify-content-between">
            <div className={styles.doc_header} onClick={() => setisShowDocs(!isShowDocs)}>
              <h5 className={styles.doc_title}>Documents ({candidateDocs?.length || 0})</h5>
              {isShowDocs ? <ChevronUp className={styles.doc_icon} /> : <ChevronDown className={styles.doc_icon} />}
            </div>
            {isEverifyed ? (
              <button
                className="themePurpleBGHover rounded px-3 py-2 text-white d-flex gap-2 align-items-center"
                type="button"
                onClick={() => setShowUpload(true)}
              >
                <Upload size={18} /> Upload Documents
              </button>
            ) : (
              <></>
            )}
          </div>
          {renderDocs()}
        </div>
      </div>
      {/* )} */}

      {/* MODALS */}

      {docObject?.base64 ? (
        <FilePreview
          docObject={docObject}
          base64File={docObject?.base64}
          setBase64File={() => setDocObject()}
          fileType={docObject?.file_extension}
          setFileType={() => {}}
        />
      ) : (
        <></>
      )}

      <ScheduleVerificationModal
        open={showSchedule}
        onOpenChange={setShowSchedule}
        candidate={candidate}
        onSuccess={fetchStatus}
      />

      {/*
      <EVerifyUploadModal
        open={showUpload}
        onOpenChange={setShowUpload}
        candidateEmail={candidateEmail}
        candidateName={data?.candidate_name}
        onSuccess={fetchStatus}
      /> */}

      {/* CONFIRM E-VERIFY */}
      {confirmEVerify && (
        <>
          <div className={`hidemodalclosebtn ${styles.complete_overlay}`} />

          <div role="alertdialog" aria-modal="true" className={styles.complete_dialog}>
            <div className={styles.complete_header}>
              <div className={styles.complete_iconWrapper} style={{ background: "#fef3c7" }}>
                <Star className={styles.complete_icon} style={{ color: "#d97706" }} />
              </div>

              <h2 className={styles.complete_title}> Mark E-Verify+ as Complete?</h2>
            </div>

            <p className={styles.complete_description}>
              Please confirm that this candidate has completed their I-9 verification through E-Verify+. This action
              indicates that the digital verification process has been finalized.
            </p>

            <div className={styles.complete_footer}>
              <button type="button" className={styles.complete_cancelButton} onClick={() => setConfirmEVerify(false)}>
                Cancel
              </button>

              <button
                type="button"
                className={`${styles.complete_confirmButton}`}
                onClick={() => handleMarkEVerifyComplete()}
              >
                Yes, Mark as Completed
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONFIRM VIDEO */}
      {confirmVideo && (
        <>
          <div className={`hidemodalclosebtn ${styles.complete_overlay}`} />

          <div role="alertdialog" aria-modal="true" className={styles.complete_dialog}>
            <div className={styles.complete_header}>
              <div className={styles.complete_iconWrapper}>
                <CheckCircle2 className={styles.complete_icon} />
              </div>

              <h2 className={styles.complete_title}>Mark Verification as Complete?</h2>
            </div>

            <p className={styles.complete_description}>
              Are you sure you want to mark this verification call as completed? This will end the call for all
              participants. The recording will be saved automatically.
            </p>

            <div className={styles.complete_footer}>
              <button type="button" className={styles.complete_cancelButton} onClick={() => setConfirmVideo(false)}>
                Cancel
              </button>

              <button type="button" className={styles.complete_confirmButton} onClick={handleMarkVideoComplete}>
                Yes, Mark as Completed
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONFIRM RESCHEDULE */}
      {confirmReschedule && (
        <>
          <div className={`hidemodalclosebtn ${styles.complete_overlay}`} />

          <div role="alertdialog" aria-modal="true" className={styles.complete_dialog}>
            <div className={styles.complete_header}>
              <div className={styles.complete_iconWrapper} style={{ background: "#fef3c7" }}>
                <AlertTriangle className={styles.complete_icon} style={{ color: "#d97706" }} />
              </div>

              <h2 className={styles.complete_title}>Reschedule Active Call?</h2>
            </div>

            <p className={styles.complete_description}>
              This call is currently in progress. Rescheduling will end the current call for all participants and create
              a new scheduled call. This action cannot be undone.
            </p>

            <div className={styles.complete_footer}>
              <button
                type="button"
                className={styles.complete_cancelButton}
                onClick={() => setConfirmReschedule(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`${styles.complete_confirmButton} ${styles.warningBTN}`}
                onClick={() => {
                  setConfirmReschedule(false);
                  setShowSchedule(true);
                }}
              >
                Yes, Reschedule
              </button>
            </div>
          </div>
        </>
      )}

      {verifyEverifyPopup && (
        <>
          <div className={`hidemodalclosebtn ${styles.complete_overlay}`} />

          <div role="alertdialog" aria-modal="true" className={styles.complete_dialog}>
            <div className={styles.complete_header}>
              <div className={styles.complete_iconWrapper}>
                <CheckCircle2 className={styles.complete_icon} />
              </div>

              <h2 className={styles.complete_title}>Mark E-Verify as Complete?</h2>
            </div>

            <p className={styles.complete_description}>
              Are you sure you want to mark the E-Verify process as completed for this candidate? This action cannot be
              undone.
            </p>

            <div className={styles.complete_footer}>
              <button
                type="button"
                className={styles.complete_cancelButton}
                onClick={() => setverifyEverifyPopup(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.complete_confirmButton}
                onClick={() => {
                  setverifyEverifyPopup(false);
                  handleEVerifyComplete();
                }}
              >
                Verify E-Verify
              </button>
            </div>
          </div>
        </>
      )}

      <Uploadi9DocsModal
        update={() => {
          getDocs();
        }}
        show={showUpload}
        setshow={() => setShowUpload(false)}
        candidate={candidate}
      />

      <ThemeLoader fixed show={loader} />
    </div>
  );
}

export default I9VerificationSection;
