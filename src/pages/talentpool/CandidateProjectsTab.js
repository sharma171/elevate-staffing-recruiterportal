import React, { useEffect, useRef, useState } from "react";
import styles from "./css/CandidateProjectsTab.module.css";
import ProjectModal from "./ProjectFormModal";
import CompleteProjectModal from "./CompleteProjectModal";
import UploadDocumentModal from "./UploadDocumentModal";
import { axiosApi, OverlayModal, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import FilePreview from "../benchcandidate/FilePreview";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Upload,
  Clock,
  TrendingUp,
  Calendar,
  CircleCheck,
  Pencil,
  ChevronDown,
  Briefcase,
  TriangleAlert,
  ChevronUp,
  Star,
  Eye,
  User,
  History,
  RefreshCw,
  X,
} from "lucide-react";
import { formatFileSize } from "../../helpers/StrHelpers";
import { useAuth } from "../../authContext";
import { format } from "date-fns";

const DEFAULT_API_URL = "https://fetch-update-candidate-projects-v3-305451280005.us-east1.run.app";
const projectsApi = "https://project-documents-delete-retrieve-deter-type-v3-305451280005.us-east1.run.app/";

export function tagVariantClasses(type) {
  const stylesMap = {
    "i-9_form_audit": {
      borderRadius: "1000px",
      background: "#E9F7EF",
      color: "#198754",
      border: "1px solid #A3CFBB",
    },

    contract: {
      borderRadius: "1000px",
      background: "#E7F1FF",
      color: "#0D6EFD",
      border: "1px solid #B6D4FE",
    },
    invoice: {
      borderRadius: "1000px",
      background: "#E9F7EF",
      color: "#198754",
      border: "1px solid #A3CFBB",
    },
    agreement: {
      borderRadius: "1000px",
      background: "#E3F2FD",
      color: "#0DCAF0",
      border: "1px solid #9EEAF9",
    },
    amendment: {
      borderRadius: "1000px",
      background: "#F2E7FE",
      color: "#6F42C1",
      border: "1px solid #CBBBEF",
    },
    "i-9_form": {
      borderRadius: "1000px",
      background: "#E7F1FF",
      color: "#0D6EFD",
      border: "1px solid #B6D4FE",
    },
    everify: {
      borderRadius: "1000px",
      background: "#F2E7FE",
      color: "#6F42C1",
      border: "1px solid #CBBBEF",
    },
    "e-verify": {
      borderRadius: "1000px",
      background: "#F2E7FE",
      color: "#6F42C1",
      border: "1px solid #CBBBEF",
    },

    client_sow: {
      borderRadius: "1000px",
      background: "#212529",
      color: "#FFFFFF",
      border: "1px solid #495057",
    },
    client_msa: {
      borderRadius: "1000px",
      background: "#F8D7DA",
      color: "#DC3545",
      border: "1px solid #F1AEB5",
    },
    client_ach: {
      borderRadius: "1000px",
      background: "#FFF3CD",
      color: "#ac8100ff",
      border: "1px solid #FFECB5",
    },
    other: {
      borderRadius: "1000px",
      background: "#F8F9FA",
      color: "#6C757D",
      border: "1px solid #E9ECEF",
    },
  };

  const key = String(type).trim().toLowerCase().replace(/\s+/g, "_");

  return stylesMap[key] || stylesMap.other;
}

let renderICons = (key) => {
  let newKey = String(key).toLowerCase();
  let obj = {
    hybrid: "🔄 Hybrid",
    remote: "🏠 Remote",
    onsite: "🏢 Onsite",
  };

  if (obj[newKey]) {
    return obj[newKey];
  }
  return "—";
};

export function ReactivateProjectModal({ open, onClose, project, candidate }) {
  const [reason, setReason] = React.useState("");
  const [setAsPrimary, setSetAsPrimary] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useAuth();

  const Admin_EMAIL = user?.email;

  useEffect(() => {
    setSetAsPrimary(false);
    setReason("");
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    setIsLoading(true);

    let payload = {
      emailid: Admin_EMAIL,
      operation: "reactivate_project",
      candidate_id: candidate?.id,
      project_id: project?.id,
      set_as_primary: setAsPrimary,
      reactivation_reason: reason.trim(),
    };

    axiosApi
      .post(DEFAULT_API_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Reactivated successfully");
        onClose(true);
        setReason("");
        setSetAsPrimary(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to reactivate");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.reactivate_overlay}>
      <div className={styles.reactivate_modal}>
        <div className="d-flex justify-content-between gap-2">
          <div>
            <h2 className={styles.reactivate_title}>
              <RefreshCw size={20} className="themePurple" />
              Reactivate Project?
            </h2>
            <p className={styles.reactivate_description}>
              This will clear all completion data and set the project back to Active status.
            </p>
          </div>
          <button className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.reactivate_body}>
          <div className={styles.reactivate_projectBox}>
            <p className={styles.reactivate_projectTitle}>{project.job_title}</p>
            <p className={styles.reactivate_projectClient}>{project.client_name}</p>
          </div>
          <div className={styles.reactivate_field}>
            <label className={styles.reactivate_label}>Reactivation Reason (optional)</label>
            <textarea
              className={`bigHoverInput ${styles.reactivate_textarea}`}
              rows={2}
              placeholder="e.g., Project extended by client"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              id="setPrimaryBox"
              checked={setAsPrimary}
              onChange={(e) => setSetAsPrimary(e.target.checked)}
              className="round-checkbox"
            />
            <label className={styles.reactivate_label} htmlFor="setPrimaryBox">
              Set as primary project
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.reactivate_footer}>
          <button className={styles.reactivate_cancel} disabled={isLoading} onClick={() => onClose(false)}>
            Cancel
          </button>

          <button className={styles.reactivate_confirm} disabled={isLoading} onClick={handleConfirm}>
            {isLoading ? (
              <>
                <RefreshCw className={styles.reactivate_spinner} size={16} />
                Reactivating...
              </>
            ) : (
              "Reactivate Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProjects(props) {
  const { candidateDetails = {}, apiUrl = DEFAULT_API_URL, disabled } = props;
  const USER_EMAIL = candidateDetails.original_email;
  const candidateId = candidateDetails?.id;

  const { user } = useAuth();

  const DEFAULT_USER_EMAIL = user?.email;

  const initialData = {
    active_projects: [],
    project_history: [],
    statistics: {
      total_projects: 0,
      avg_project_duration_months: 0,
      total_bench_time_days: 0,
      avg_bench_duration_days: 0,
    },
  };

  const containerRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState(initialData);
  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadProject, setUploadProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedProjectForCompletion, setSelectedProjectForCompletion] = useState(null);
  const [documentsData, setDocumentsData] = useState({});
  const [documentsLoading, setDocumentsLoading] = useState({});
  const [expanded, setExpanded] = useState({});
  const [viewDocs, setviewDocs] = useState(null);
  const [reactiveProject, setReactiveProject] = useState(null);

  const [projectDeleteModal, setProjectDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const isDisabled = !!disabled;

  function preserveScroll(fn) {
    const el = containerRef.current;
    const scrollTop = el ? el.scrollTop : window.scrollY || 0;
    fn();
    requestAnimationFrame(() => {
      if (el) el.scrollTop = scrollTop;
      else window.scrollTo(0, scrollTop);
    });
  }

  function setDocsLoadingKey(projectId, val) {
    const key = `docs-${projectId}`;
    setDocumentsLoading((s) => ({ ...s, [key]: !!val }));
  }

  function getProjectDocs(project_id) {
    if (!project_id) return;

    setDocsLoadingKey(project_id, true);
    const payload = {
      emailid: DEFAULT_USER_EMAIL,
      operation: "get_documents",
      candidate_id: candidateId,
      project_id: project_id,
    };
    axiosApi
      .post(projectsApi, payload)
      .then((res) => {
        const body = (res && res.data) || { documents: [], total_documents: 0 };
        setDocumentsData((prev) => ({
          ...prev,
          [project_id]: body,
        }));
      })
      .catch(() => {
        setDocumentsData((prev) => ({
          ...prev,
          [project_id]: { documents: [], total_documents: 0 },
        }));
      })
      .finally(() => setDocsLoadingKey(project_id, false));
  }

  function load() {
    setLoader(true);
    axiosApi
      .post(apiUrl, {
        emailid: DEFAULT_USER_EMAIL,
        operation: "get_project_summary",
        candidate_id: candidateId,
      })
      .then((res) => {
        if (res && res.data) {
          setData({
            active_projects: res.data.active_projects || [],
            project_history: res.data.project_history || [],
            statistics: {
              total_projects: res.data.statistics?.total_projects || 0,
              avg_project_duration_months: res.data.statistics?.avg_project_duration_months || 0,
              total_bench_time_days: res.data.statistics?.total_bench_time_days || 0,
              avg_bench_duration_days: res.data.statistics?.avg_bench_duration_days || 0,
              bench_start_date: res.data.statistics?.bench_start_date || null,
              on_bench: res.data.statistics?.on_bench || false,
              bench_range_display: res.data.statistics?.bench_range_display || "",
            },
          });
        } else {
          setData(initialData);
          toast.error("No data received");
        }
      })
      .catch(() => {
        setData(initialData);
        toast.error("Could not load");
      })
      .finally(() => setLoader(false));
  }

  useEffect(() => {
    load();
  }, [candidateId, USER_EMAIL, apiUrl]);

  function toggleExpand(key, projectId) {
    const next = !expanded[key];
    preserveScroll(() => {
      setExpanded((s) => ({ ...s, [key]: next }));
    });
    if (next && projectId) {
      getProjectDocs(projectId);
    }
  }

  function setPrimary(id) {
    if (!id) return;
    setLoader(true);
    axiosApi
      .post(apiUrl, {
        emailid: DEFAULT_USER_EMAIL,
        operation: "set_primary_project",
        candidate_id: candidateId,
        project_id: id,
        is_primary: true,
      })
      .then(() => {
        toast.success("Primary updated");
        load();
      })
      .catch(() => toast.error("Failed"))
      .finally(() => setLoader(false));
  }

  function completeProjectApi(p, completionData = null) {
    if (!p || !p.id) return Promise.reject(new Error("Invalid project"));
    setLoader(true);
    const today = new Date().toISOString().split("T")[0];
    const nextDay = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const payloadCompletion = completionData || {
      project_end_date: today,
      employment_end_date: today,
      bench_start_date: nextDay,
    };
    return axiosApi
      .post(apiUrl, {
        emailid: DEFAULT_USER_EMAIL,
        operation: "complete_project",
        candidate_id: candidateId,
        project_id: p.id,
        completion_data: payloadCompletion,
      })
      .then((res) => {
        load();
        return res;
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => setLoader(false));
  }

  function deleteProjectApi(p) {
    if (!p || !p.id) {
      toast.error("Invalid project");
      return;
    }
    setLoader(true);
    axiosApi
      .post(apiUrl, {
        emailid: DEFAULT_USER_EMAIL,
        operation: "delete_project",
        candidate_id: candidateId,
        project_id: p.id,
      })
      .then((res) => {
        toast.success(res?.data?.message || "Project deleted");
        setProjectDeleteModal(false);
        setProjectToDelete(null);
        load();
      })
      .catch(() => {
        toast.error("Failed to delete project");
      })
      .finally(() => setLoader(false));
  }

  function confirmDeleteDoc() {
    if (!deleteDoc || !deleteDoc.id) return toast.error("Invalid document");
    setLoader(true);
    const payload = {
      emailid: DEFAULT_USER_EMAIL,
      operation: "delete_document",
      document_id: deleteDoc.id,
      candidate_email: candidateDetails.email || DEFAULT_USER_EMAIL,
    };
    axiosApi
      .post(projectsApi, payload)
      .then(() => {
        toast.success("Deleted");
        setDeleteModal(false);
        const parentProjectId = deleteDoc.project_id || deleteDoc.projectId || null;
        if (parentProjectId) {
          setDocumentsData((prev) => {
            const existing = prev[parentProjectId] || { documents: [], total_documents: 0 };
            const docs = (existing.documents || []).filter((d) => d.id !== deleteDoc.id);
            return {
              ...prev,
              [parentProjectId]: {
                ...existing,
                documents: docs,
                total_documents: docs.length,
              },
            };
          });
        } else {
          load();
        }
        setDeleteDoc(null);
        requestAnimationFrame(() => {
          const el = containerRef.current;
          if (el) el.scrollTop = el.scrollTop;
        });
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setLoader(false));
  }

  function downloadDoc(doc, isView) {
    if (!doc || !doc.id) return toast.error("Invalid document");

    setLoader(true);
    const payload = {
      emailid: DEFAULT_USER_EMAIL,
      operation: "download_documents",
      candidate_email: USER_EMAIL,
      document_ids: [doc.id],
    };

    axiosApi
      .post(projectsApi, payload)
      .then((res) => {
        let fileOBJ = res?.data?.retrieved_documents?.[0];

        if (fileOBJ) {
          if (isView) {
            return setviewDocs(fileOBJ);
          }

          const link = document.createElement("a");
          link.href = "data:application/octet-stream;base64," + fileOBJ.base64;
          link.download = fileOBJ.original_file_name || "download";
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          toast.error("No file data");
        }
      })
      .catch(() => toast.error("Download failed"))
      .finally(() => setLoader(false));
  }

  function renderDocs(docsArray, parentProjectId) {
    const docs = docsArray || [];
    const docsKey = `docs-${parentProjectId || 0}`;

    if (documentsLoading[docsKey]) {
      return (
        <div className={`text-center my-3 ${styles.docsLoadingWrap}`}>
          <div className={styles.sectionLoader} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#cbd5e1" />
              <path d="M45 25a20 20 0 00-6.7-15" fill="none" strokeWidth="5" stroke="#374151">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            <span className={styles.docsLoadingText}>Loading documents...</span>
          </div>
        </div>
      );
    }

    if (!docs?.length) {
      return;
    }

    return (
      <div className="gap-2 d-flex flex-column mt-3">
        {docs.map((doc) => {
          let isPDF = doc?.file_extension == ".pdf";
          return (
            <div key={String(doc.id)} className={styles.docRow}>
              <div className={`w-100 overflow-hidden ${styles.docName}`}>
                <div>
                  <FileText size={20} className={`${isPDF ? "text-danger" : ""}`} />
                </div>
                <div className="w-100 overflow-hidden">
                  <div className="fw-semibold text-truncate w-100 overflow-hidden">{doc.file_name || doc.name}</div>
                  <div className="d-flex gap-2 mt-1">
                    <div>{formatFileSize(doc?.file_size)}</div>
                    <div
                      className={"badge px-2 py-1 fw-semibold capitalize"}
                      style={tagVariantClasses(doc?.document_type) || {}}
                    >
                      {String(doc?.document_type).replaceAll("_", " ")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 pe-2">
                {isPDF ? (
                  <div
                    className="pointer"
                    title="View"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => downloadDoc(doc, true)}
                  >
                    <Eye size={16} />
                  </div>
                ) : null}
                <div
                  className="pointer"
                  title="Download"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => downloadDoc(doc)}
                >
                  <Download size={16} />
                </div>
                {!isDisabled && (
                  <div
                    className="pointer"
                    title="Delete"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDeleteDoc({ ...doc, project_id: parentProjectId });
                      setDeleteModal(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const activeProjects = data.active_projects || [];
  const primary = activeProjects.find((x) => x.is_primary) || null;
  const others = activeProjects.filter((x) => !x.is_primary);

  const onBenchCard = () => {
    const lastProject = (data.project_history && data.project_history[0]) || null;
    const benchStart = lastProject?.bench_start_date || null;
    const benchDays = data.statistics?.total_bench_time_days || 0;

    if (!lastProject) {
      return <></>;
    }

    return (
      <div className={styles.onbench_section}>
        <div className={styles.onbench_headerRow}>
          <h3 className={styles.onbench_title}>🟠 Currently On Bench</h3>
        </div>

        <div className={styles.onbench_card}>
          <div className={styles.onbench_cardHeader}>
            <div className={styles.onbench_cardHeaderRow}>
              <div className={styles.onbench_badgeRow}>
                <div className={styles.onbench_badge}>
                  <TriangleAlert className={styles.onbench_badgeIcon} />
                  <Clock className={styles.onbench_badgeIcon} />
                  <span className={styles.onbench_badgeText}>On Bench</span>
                </div>

                <span className={styles.onbench_extendedText}>Extended bench period</span>
              </div>

              {!isDisabled && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  className="themeButton themeButtonHover px-3 py-2 rounded"
                  onClick={() => {
                    preserveScroll(() => {
                      setEditProject(null);
                      setOpenModal(true);
                    });
                  }}
                  disabled={loader}
                >
                  <Plus size={16} /> Add Project
                </button>
              )}
            </div>

            <h3 className={styles.onbench_benchDays}>
              <span className={styles.onbench_benchCount}>{benchDays}</span>
              <span className={styles.onbench_muted} style={{ fontSize: "16px" }}>
                days on bench
              </span>
            </h3>
          </div>

          <div className={styles.onbench_cardContent}>
            <div className={styles.onbench_row}>
              <Calendar className={styles.onbench_iconMuted} />
              <span className={styles.onbench_muted}>Bench started:</span>
              <span className={styles.onbench_textStrong}>
                {benchStart ? format(new Date(benchStart), "MMM d, yyyy") : "—"}
              </span>
            </div>

            <div className={styles.onbench_lastProjectBox}>
              <p className={styles.onbench_mutedSmall}>Last Project</p>
              <p className={styles.onbench_textStrong}>{lastProject?.job_title || "—"}</p>
              <p className={styles.onbench_mutedSmall}>
                {lastProject?.client_name ? `${lastProject.client_name} •` : ""} Ended{" "}
                {lastProject.project_end_date
                  ? format(new Date(lastProject.project_end_date), "MMM d, yyyy")
                  : "Unknown"}
              </p>
            </div>

            <div className={styles.onbench_tipBox}>
              <p className={styles.onbench_tipText}>
                <span className={styles.onbench_idea}>💡</span>
                Click "Add Project" to assign a new project to this candidate
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsCards = () => {
    return (
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className="d-flex gap-2 align-items-center">
            <div className={styles.statsIcons}>
              <Briefcase size={16} />
            </div>
            <div>
              <div className="h5 fw-bold mb-1">{data.statistics?.total_projects ?? 0}</div>
              <div className="font12">Total Projects</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="d-flex gap-2 align-items-center">
            <div className={styles.statsIcons} style={{ color: "#16a34a" }}>
              <Clock size={16} />
            </div>
            <div>
              <div className="h5 fw-bold mb-1">{(data.statistics?.avg_project_duration_months ?? 0).toFixed(1)} mo</div>
              <div className="font12">Avg Duration</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="d-flex gap-2 align-items-center">
            <div className={styles.statsIcons} style={{ color: "#ea580c" }}>
              <Calendar size={16} />
            </div>
            <div>
              <div className="h5 fw-bold mb-1">{data.statistics?.total_bench_time_days ?? 0}</div>
              <div className="font12">Total Bench Time</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="d-flex gap-2 align-items-center">
            <div className={styles.statsIcons} style={{ color: "#5f15e0" }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="h5 fw-bold mb-1">{data.statistics?.avg_bench_duration_days ?? 0}</div>
              <div className="font12">Avg Bench Duration</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjDetailsGrid = (item, isActiveProjects, isReactive) => {
    return (
      <>
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className={styles.current_proj_badgeGroup}>
            <div
              className={`px-3 badge ${styles[item.project_status]} ${styles.current_proj_statusBadge}`}
              style={{ borderRadius: "1000px" }}
            >
              <CircleCheck size={14} />
              <span className={styles.current_proj_badgeText}>{item.project_status || "Active"}</span>
            </div>
            {item?.is_primary ? (
              <div
                className="px-3 badge bg-warning bg-opacity-25 d-inline-flex align-items-center gap-1 "
                style={{ color: "#b45309", padding: "6px 10px", borderRadius: "1000px" }}
              >
                <Star className="me-1" fill="#f59e0b" size={14} />
                <span>Primary</span>
              </div>
            ) : null}

            {item.duration_days ? (
              <span className={styles.project_history_duration}>{item.duration_days || ""} Days</span>
            ) : null}
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="text-success fw-semibold">
              {item?.project_bill_rate ? "$" + item?.project_bill_rate + "/hr" : "Rate Not Set"}
            </div>

            {!isDisabled && isReactive ? (
              <>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  className="purpleBadgeBtn"
                  onClick={() =>
                    preserveScroll(() => {
                      setReactiveProject(item);
                    })
                  }
                  disabled={loader}
                >
                  <RefreshCw size={14} />
                  Reactivate
                </button>
              </>
            ) : (
              <></>
            )}

            {!isActiveProjects && !isDisabled ? (
              <>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    preserveScroll(() => {
                      setEditProject(item);
                      setOpenModal(true);
                    })
                  }
                  disabled={loader}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  className="btn btn-sm btn-outline-danger"
                  disabled={loader}
                  title="Delete Project"
                  onClick={() => {
                    preserveScroll(() => {
                      setProjectToDelete(item);
                      setProjectDeleteModal(true);
                    });
                  }}
                >
                  <Trash2 size={14} />
                </button>{" "}
              </>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className={styles.project_history_title}>{item.job_title || item.title || "Untitled"}</div>

        <p className={styles.current_proj_cardSubtitle}>
          <b>{item.client_name || ""}</b>
        </p>

        <div className={`mt-2 ${styles.project_history_meta}`}>
          <div className={styles.project_history_metaItem}>
            <Calendar className={styles.project_history_metaIcon} />
            <span>
              {item.project_start_date ? format(new Date(item.project_start_date), "MMM d, yyyy") : "Unknown"} -{" "}
              {item.project_end_date ? format(new Date(item.project_end_date), "MMM d, yyyy") : "Present"}
            </span>
          </div>
          <div className={styles.project_history_metaItem}>
            <span className={styles.project_history_emoji}>{item.work_mode_emoji || ""}</span>
            <span>{renderICons(item.project_work_mode)}</span>
          </div>
        </div>
        <div className={styles.current_proj_grid}>
          <div className={styles.current_proj_gridItem}>
            {/* <Building className={styles.current_proj_iconMuted} /> */}
            <div>
              <p className={styles.current_proj_metaLabel}>Vendor</p>
              <p
                style={{ maxWidth: "140px" }}
                title={item.vendor_name || "N/A"}
                className={`text-truncate ${styles.current_proj_metaValue}`}
              >
                {item.vendor_name || "—"}
              </p>
            </div>
          </div>
          <div className={styles.current_proj_gridItem}>
            {/* <Calendar className={styles.current_proj_iconMuted} /> */}
            <div>
              <p className={styles.current_proj_metaLabel}>Sub-Vendor</p>
              <p
                style={{ maxWidth: "140px" }}
                title={item.sub_vendor_name || "N/A"}
                className={`text-truncate ${styles.current_proj_metaValue}`}
              >
                {item.sub_vendor_name || "—"}
              </p>
            </div>
          </div>
          <div className={styles.current_proj_gridItem}>
            {/* <DollarSign className={styles.current_proj_iconMuted} /> */}
            <div>
              <p className={styles.current_proj_metaLabel}>Vendor Email</p>
              <p
                style={{ maxWidth: "140px" }}
                title={item.immediate_vendor_email || "N/A"}
                className={`text-truncate ${styles.current_proj_metaValue}`}
              >
                {item.immediate_vendor_email || "N/A"}
              </p>
            </div>
          </div>
          {item.immediate_vendor_phone_number ? (
            <div className={styles.current_proj_gridItem}>
              {/* <MapPin className={styles.current_proj_iconMuted} /> */}
              <div>
                <p className={styles.current_proj_metaLabel}>Vendor Phone</p>
                <p className={styles.current_proj_metaValue}>{item.immediate_vendor_phone_number}</p>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  };

  const renderAddressGrid = (item, isActiveProjects) => {
    let isRemote = String(item.project_work_mode).toLowerCase() == "remote";

    if (isRemote) {
      return <></>;
    }

    const renderKey = (data, title) => {
      if (!data) {
        return <></>;
      }

      return (
        <div className={styles.current_proj_gridItem}>
          <div style={{ maxWidth: "100%" }}>
            <p className={styles.current_proj_metaLabel}>{title}</p>
            <p style={{ maxWidth: "100%" }} title={data} className={`text-truncate ${styles.current_proj_metaValue}`}>
              {data}
            </p>
          </div>
        </div>
      );
    };

    return (
      <>
        <div className={`border-0 ${styles.current_proj_grid_address}`}>
          {renderKey(item.client_address_line1, "Address Line 1")}
          {renderKey(item.client_address_line2, "Address Line 2")}
          {renderKey(item.client_city, "City")}
          {renderKey(item.client_state, "State")}
          {renderKey(item.client_zipcode, "ZIP Code")}
        </div>
      </>
    );
  };

  const renderCurrentProject = () => {
    if (!primary) return null;
    const key = `project-${primary.id}`;
    const documents = documentsData[primary?.id]?.documents || primary.documents || [];

    let docsCount = documentsData[primary?.id]?.total_documents;

    return (
      <div>
        <div className={styles.current_proj_headerRow}>
          <h3 className={styles.current_proj_title}>🟢 Current Project</h3>

          {!isDisabled && (
            <button
              className="themeButton themeButtonHover px-3 py-2 rounded"
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                preserveScroll(() => {
                  setEditProject(null);
                  setOpenModal(true);
                })
              }
            >
              <Plus className={styles.current_proj_iconSmall} />
              Add New Project
            </button>
          )}
        </div>

        <div className={styles.current_proj_card} key={key}>
          <div className={styles.current_proj_cardContent}>
            {renderProjDetailsGrid(primary, true)}

            {expanded[key] && (
              <>
                {renderAddressGrid(primary, true)}
                {primary.reporting_manager ? (
                  <div className={`mt-2 gap-1 ${styles.project_history_row}`}>
                    <User size={15} />
                    <span className={styles.project_history_label}>Manager:</span>
                    <span className={styles.project_history_value}>{primary.reporting_manager}</span>
                  </div>
                ) : null}
                <div className={`mt-2 align-items-start ${styles.current_proj_gridItem}`}>
                  {/* <Notebook className={`mt-1 ${styles.current_proj_iconMuted}`} /> */}
                  <div>
                    <p className={styles.current_proj_metaLabel}>
                      Notes:
                      <span className={`ms-1 text-dark ${styles.current_proj_metaValue}`}>
                        {primary.project_comments || "—"}{" "}
                      </span>{" "}
                    </p>
                  </div>
                </div>

                <div className="mt-3" style={{ borderTop: "1px solid #e6eef8" }} />

                <div className={styles.docsSection}>
                  <div className="d-flex align-items-center gap-2 justify-content-between">
                    <h5>Documents ({docsCount || 0})</h5>

                    {!isDisabled && (
                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="themeButton themeButtonHover px-3 py-2 rounded"
                        onClick={() => {
                          setUploadProject(primary);
                          setUploadModal(true);
                        }}
                        disabled={loader}
                      >
                        <Upload size={14} /> Upload
                      </div>
                    )}
                  </div>
                  {renderDocs(documents, primary.id)}
                </div>
              </>
            )}

            <div className="d-flex align-items-center gap-3 justify-content-between">
              <div className={`nowrap gap-2 ${styles.current_proj_actionGroup}`}>
                {!isDisabled && (
                  <>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      className={styles.current_proj_btn}
                      onClick={() =>
                        preserveScroll(() => {
                          setEditProject(primary);
                          setOpenModal(true);
                        })
                      }
                      disabled={loader}
                    >
                      <Pencil className={styles.current_proj_iconSmall} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      className={styles.markCompleteBTN}
                      onClick={() => {
                        preserveScroll(() => {
                          setSelectedProjectForCompletion(primary);
                          setCompleteModalOpen(true);
                        });
                      }}
                      disabled={loader}
                    >
                      <CircleCheck className={styles.current_proj_iconTiny} />
                      Mark as Complete
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      className={styles.deleteBTN}
                      disabled={loader}
                      title="Delete Project"
                      onClick={() => {
                        preserveScroll(() => {
                          setProjectToDelete(primary);
                          setProjectDeleteModal(true);
                        });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>

              <div>
                <div
                  className={`border-0 nowrap ${styles.outlineBTN}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleExpand(key, primary.id)}
                >
                  {expanded[key] ? (
                    <>
                      <ChevronUp className={styles.current_proj_iconSmall} /> Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className={styles.current_proj_iconSmall} /> View Full Details
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOtherProjects = () => {
    if (!others || others.length === 0) return null;
    return (
      <div className={styles.current_proj_section}>
        <div className={styles.current_proj_otherSection}>
          <h3 className={styles.current_proj_otherTitle}>
            <Briefcase className={styles.current_proj_briefcaseIcon} />
            Other Active Projects ({others.length})
          </h3>

          <div className={styles.current_proj_otherList}>
            {others.map((p) => {
              const key = `project-${p.id}`;
              const docs = documentsData[p.id]?.documents || p.documents || [];
              return (
                <div key={key} className={styles.current_proj_otherCard}>
                  {renderProjDetailsGrid(p, true)}

                  {expanded[key] && (
                    <>
                      {renderAddressGrid(p)}
                      {p.reporting_manager ? (
                        <div className={`mt-2 gap-1 align-items-center ${styles.project_history_row}`}>
                          <User size={15} className="mb-1" />
                          <span className={styles.project_history_label}>Manager:</span>
                          <span className={styles.project_history_value}>{p.reporting_manager}</span>
                        </div>
                      ) : null}
                      <div className={`mt-2 align-items-start ${styles.current_proj_gridItem}`}>
                        {/* <Notebook className={`mt-1 ${styles.current_proj_iconMuted}`} /> */}

                        <div>
                          <p className={styles.current_proj_metaLabel}>
                            Notes:
                            <span className={`ms-1 text-dark ${styles.current_proj_metaValue}`}>
                              {p.project_comments || "—"}{" "}
                            </span>{" "}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3" style={{ borderTop: "1px solid #e6eef8" }} />
                      <div className={styles.otherDocsSection}>
                        <div className="d-flex align-items-center gap-2 justify-content-between">
                          <h5>Documents ({documentsData[p.id]?.total_documents || docs.length || 0})</h5>

                          <div>
                            {!isDisabled && (
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                className="themeButton themeButtonHover px-3 py-2 rounded"
                                onClick={() =>
                                  preserveScroll(() => {
                                    setUploadProject(p);
                                    setUploadModal(true);
                                  })
                                }
                                disabled={loader}
                              >
                                <Upload size={14} /> Upload
                              </button>
                            )}
                          </div>
                        </div>
                        {renderDocs(docs, p.id)}
                      </div>
                    </>
                  )}

                  <div className="d-flex gap-3 justify-content-between mt-3 align-items-center overflow-auto nowrap">
                    <div className={styles.current_proj_otherHeader}>
                      {!isDisabled && (
                        <div className={styles.current_proj_otherActions}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className={styles.current_proj_btn}
                            onClick={() =>
                              preserveScroll(() => {
                                setEditProject(p);
                                setOpenModal(true);
                              })
                            }
                            disabled={loader}
                          >
                            <Pencil className={styles.current_proj_iconSmall} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className={`my-0 ${styles.warningButton}`}
                            onClick={() => {
                              preserveScroll(() => setPrimary(p.id));
                            }}
                            disabled={loader}
                          >
                            <Star className={styles.current_proj_iconTiny} size={14} />
                            Set Primary
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className={styles.markCompleteBTN}
                            onClick={() => {
                              preserveScroll(() => {
                                setSelectedProjectForCompletion(p);
                                setCompleteModalOpen(true);
                              });
                            }}
                            disabled={loader}
                          >
                            <CircleCheck className={styles.current_proj_iconTiny} />
                            Mark as Complete
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className={styles.deleteBTN}
                            disabled={loader}
                            title="Delete Project"
                            onClick={() => {
                              preserveScroll(() => {
                                setProjectToDelete(p);
                                setProjectDeleteModal(true);
                              });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className={`border-0 my-0 ${styles.outlineBTN}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleExpand(key, p.id)}
                      >
                        {expanded[key] ? (
                          <>
                            <ChevronUp className={styles.current_proj_iconSmall} /> Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className={styles.current_proj_iconSmall} /> View Full Details
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  function BenchPeriod({ days, bench_period }) {
    return (
      <div className="d-flex align-items-center pt-3 my-1 pb-2">
        <div className="flex-fill" style={{ borderTop: "1px dashed #ea580c" }} />

        <div className="px-3 d-flex align-items-center gap-2 small">
          <Clock size={16} style={{ color: "#ea580c" }} />

          <span
            className="px-2 py-1 badge bg-transparent"
            style={{ color: "#ea580c", border: "1px solid #ea580c", borderRadius: 1000 }}
          >
            On Bench: {days} days
          </span>

          <span className="text-muted small">{bench_period}</span>
        </div>

        <div className="flex-fill" style={{ borderTop: "1px dashed #ea580c" }} />
      </div>
    );
  }

  const ProjectHistoryTimeline = () => {
    const timeline = data.project_history || [];

    return timeline.map((item) => {
      return (
        <>
          <BenchPeriod days={item.bench_duration_days} bench_period={item.bench_period_display} />

          <div key={`history-${item.id}`} className={styles.project_history_card}>
            <div className={styles.project_history_cardContent}>
              {renderProjDetailsGrid(item, false, true)}

              {expanded[`history-${item.id}`] && (
                <>
                  {renderAddressGrid(item)}
                  <div className={styles.project_history_extra}>
                    <div className={styles.project_history_info}>
                      {item.reporting_manager ? (
                        <div className={`mt-2 gap-1 ${styles.project_history_row}`}>
                          <User size={15} />
                          <span className={styles.project_history_label}>Manager:</span>
                          <span className={styles.project_history_value}>{item.reporting_manager}</span>
                        </div>
                      ) : null}

                      {item.project_role ? (
                        <div className={`mt-2 {styles.project_history_row}`}>
                          <span className={styles.project_history_label}>Role:</span>
                          <span className={styles.project_history_value}>{item.project_role}</span>
                        </div>
                      ) : null}

                      {item.termination_reason && (
                        <div className={styles.project_history_reason}>
                          <span className={styles.project_history_label}>Reason:</span>
                          <span className={`capitalize ${styles.project_history_reasonText}`}>
                            {String(item.termination_reason).replaceAll("_", " ")}
                          </span>
                        </div>
                      )}
                      {item.project_comments && (
                        <div className={styles.project_history_notes}>
                          <p className={styles.current_proj_metaLabel}>
                            Notes:
                            <span className={`ms-1 text-dark ${styles.current_proj_metaValue}`}>
                              {item.project_comments}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3" style={{ borderTop: "1px solid #e6eef8" }} />

                  <div className={`gap-0 ${styles.project_history_docs}`}>
                    <div className={styles.project_history_docsHeader}>
                      <div className={styles.project_history_docsLeft}>
                        <FileText className={styles.project_history_metaIcon} />
                        <span className={styles.project_history_docsTitle}>
                          Documents ({documentsData[item.id]?.total_documents || 0})
                        </span>
                      </div>

                      <div className={styles.project_history_docsActions}>
                        {!isDisabled && (
                          <div
                            className="themeButton themeButtonHover px-3 py-2 rounded"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              preserveScroll(() => {
                                setUploadProject(item);
                                setUploadModal(true);
                              })
                            }
                          >
                            <Upload className={styles.project_history_iconSmall} />
                            Upload
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.project_history_docsList}>
                      {renderDocs(documentsData[item.id]?.documents || item.documents || [], item.id)}
                    </div>
                  </div>
                </>
              )}

              <div className={styles.project_history_actions}>
                <div
                  className={`border-0 ${styles.outlineBTN}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleExpand(`history-${item.id}`, item.id)}
                  type="button"
                >
                  {expanded[`history-${item.id}`] ? (
                    <>
                      <ChevronUp className={styles.project_history_iconSmall} />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className={styles.project_history_iconSmall} />
                      Show Details
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    });
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <ThemeLoader show={loader} fixed />
      {renderStatsCards()}
      {data.statistics?.total_projects === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No projects assigned yet</p>
          {!isDisabled && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="themeButton themeButtonHover px-3 py-2 rounded"
              onClick={() =>
                preserveScroll(() => {
                  setEditProject(null);
                  setOpenModal(true);
                })
              }
              disabled={loader}
            >
              <Plus size={14} /> Add First Project
            </button>
          )}
        </div>
      )}
      <div className={styles.section}>{!primary ? onBenchCard() : renderCurrentProject()}</div>
      {renderOtherProjects()}

      {data.project_history.length ? (
        <div className={styles.section}>
          <h3 className={`mt-1 ${styles.current_proj_otherTitle}`} style={{ lineHeight: 1 }}>
            <History className={styles.current_proj_briefcaseIcon} />
            Project History
          </h3>

          <ProjectHistoryTimeline />
        </div>
      ) : null}

      <UploadDocumentModal
        open={uploadModal}
        DEFAULT_CANDIDATE_ID={candidateId}
        onOpenChange={(val) => {
          setUploadModal(!!val);
          if (!val) {
            setUploadProject(null);
          }
        }}
        onSuccess={() => {
          const pid = uploadProject?.id;
          if (pid) getProjectDocs(pid);
          setUploadModal(false);
          setUploadProject(null);
        }}
        projectId={uploadProject?.id}
        candidateEmail={candidateDetails.email || USER_EMAIL}
      />
      {deleteModal && (
        <div className={`hidemodalclosebtn ${styles.overlay}`}>
          <div className={styles.modal}>
            <div className="h4 fw-bold mb-3">Delete Document</div>

            <p>Are you sure you want to delete this document? This action cannot be undone.</p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setDeleteModal(false)}
                disabled={loader}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.delete}
                onMouseDown={(e) => e.preventDefault()}
                onClick={confirmDeleteDoc}
                disabled={loader}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {projectDeleteModal && projectToDelete && (
        <div className={`hidemodalclosebtn ${styles.overlay}`}>
          <div className={`p-3 py-4 ${styles.modal}`} style={{ maxWidth: "510px" }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <TriangleAlert className="text-danger" />
              <div className="h4 fw-bold mb-0">Delete Project</div>
            </div>

            <p className="mb-3">
              Are you sure you want to delete{" "}
              <strong>{projectToDelete.job_title || projectToDelete.title || "this project"}</strong>
              {projectToDelete.client_name ? (
                <>
                  {" "}
                  at <strong>{projectToDelete.client_name}</strong>
                </>
              ) : null}
              ?
            </p>

            <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded mb-3 text-danger">
              This project and all associated documents will be permanently deleted.
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setProjectDeleteModal(false);
                  setProjectToDelete(null);
                }}
                disabled={loader}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.delete}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => deleteProjectApi(projectToDelete)}
                disabled={loader}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <ReactivateProjectModal
        project={reactiveProject}
        candidate={candidateDetails}
        open={reactiveProject}
        onClose={(status) => {
          if (status) {
            load();
          }
          setReactiveProject(null);
        }}
      />

      <CompleteProjectModal
        open={completeModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCompleteModalOpen(false);
            setSelectedProjectForCompletion(null);
          } else {
            setCompleteModalOpen(true);
          }
        }}
        onComplete={(projectId, completionData) => {
          return completeProjectApi({ id: projectId }, completionData).then((res) => {
            return res;
          });
        }}
        project={selectedProjectForCompletion}
      />
      {viewDocs?.base64 ? (
        <OverlayModal
          isActive={viewDocs?.base64}
          onClose={() => {
            setviewDocs(null);
          }}
        >
          <FilePreview
            setFileType={() => {}}
            base64File={viewDocs?.base64}
            fileType={"application/pdf"}
            setBase64File={() => setviewDocs(null)}
            fileMeta={viewDocs || {}}
            docObject={viewDocs || {}}
          />
        </OverlayModal>
      ) : null}
      {openModal && (
        <ProjectModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditProject(null);
            load();
          }}
          editProject={editProject}
          candidateId={candidateId}
        />
      )}
    </div>
  );
}
