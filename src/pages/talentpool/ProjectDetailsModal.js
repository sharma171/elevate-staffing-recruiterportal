import React, { useEffect, useState } from "react";
import {
  CircleCheckBig,
  Pencil,
  Briefcase,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Download,
  Trash2,
  Clock,
  File,
  Eye,
  Notebook,
} from "lucide-react";

import { axiosApi, Confirm, OverlayModal, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import FilePreview from "../benchcandidate/FilePreview";
import { formatFileSize } from "../../helpers/StrHelpers";
import UploadDocumentModal from "./UploadDocumentModal";
import ProjectModal from "./ProjectFormModal";
import { format } from "date-fns";

const allowedExtensions = ["pdf", "png", "jpg", "jpeg", "docx", "xlsx"];

function tagVariantClasses(type) {
  const styles = {
    contract: {
      background: "#E7F1FF",
      color: "#0D6EFD",
      border: "1px solid #B6D4FE",
    },
    invoice: {
      background: "#E9F7EF",
      color: "#198754",
      border: "1px solid #A3CFBB",
    },
    agreement: {
      background: "#E3F2FD",
      color: "#0DCAF0",
      border: "1px solid #9EEAF9",
    },
    amendment: {
      background: "#F2E7FE",
      color: "#6F42C1",
      border: "1px solid #CBBBEF",
    },
    client_sow: {
      background: "#212529",
      color: "#FFFFFF",
      border: "1px solid #495057",
    },
    client_msa: {
      background: "#F8D7DA",
      color: "#DC3545",
      border: "1px solid #F1AEB5",
    },
    client_ach: {
      background: "#FFF3CD",
      color: "#FFC107",
      border: "1px solid #FFECB5",
    },
    other: {
      background: "#F8F9FA",
      color: "#6C757D",
      border: "1px solid #E9ECEF",
    },
  };

  const key = String(type).trim().toLowerCase().replace(/\s+/g, "_");

  return styles[key] || styles.other;
}

function projectStatusStyle(status) {
  const styles = {
    active: {
      background: "#E9F7EF",
      color: "#198754",
      border: "1px solid #A3CFBB",
    },
    inactive: {
      background: "#F8F9FA",
      color: "#6C757D",
      border: "1px solid #E9ECEF",
    },
    completed: {
      background: "#E7F1FF",
      color: "#0D6EFD",
      border: "1px solid #B6D4FE",
    },
    on_hold: {
      background: "#FFF3CD",
      color: "#FFC107",
      border: "1px solid #FFECB5",
    },
    cancelled: {
      background: "#F8D7DA",
      color: "#DC3545",
      border: "1px solid #F1AEB5",
    },
    default: {
      background: "#F8F9FA",
      color: "#6C757D",
      border: "1px solid #E9ECEF",
    },
  };

  const key = String(status).trim().toLowerCase().replace(/\s+/g, "_");

  return {
    ...(styles[key] || styles.default),
    display: "inline-flex",
    alignItems: "center",
  };
}

const DEFAULT_API_URL = "https://fetch-update-candidate-projects-v3-305451280005.us-east1.run.app";
const projectsApi = "https://project-documents-delete-retrieve-deter-type-v3-305451280005.us-east1.run.app/";

function ProjectDetailsModal({ candidateDetails, isDisabled, details, onClose, loadData }) {
  let detailsData = details || {};
  const [loader, setLoader] = useState(false);
  const [viewDocs, setviewDocs] = useState(null);
  const [documentsData, setDocumentsData] = useState({});
  const [editProject, setEditProject] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  let isActiveProj = detailsData?.project_status == "Active";

  const projectData = {
    status: detailsData?.project_status,
    statusDeltaDays: detailsData?.bench_duration_days,
    title: detailsData?.job_title,
    client: detailsData?.client_name,
    jobTitle: detailsData?.job_title,
    vendor: detailsData?.vendor_name,
    subVendor: detailsData?.sub_vendor_name,
    workMode: detailsData?.project_work_mode,
    projectRole: detailsData?.project_role,
    billRate: detailsData?.project_bill_rate ? detailsData?.project_bill_rate + "/hr" : "",
    startDate: detailsData?.project_start_date,
    endDate: detailsData?.project_end_date,
    totalDurationDays: detailsData?.days_active,
    reportingManager: detailsData?.reporting_manager || "N/A",
    vendorEmail: detailsData?.immediate_vendor_email || "N/A",
    vendorPhone: detailsData?.immediate_vendor_phone_number || "N/A",
    comments: detailsData?.project_comments,
    benchDays: detailsData?.bench_duration_days,
    benchStartDate: detailsData?.bench_start_date,
    bench_period_display: detailsData?.bench_period_display,
  };

  const { user } = useAuth();
  const DEFAULT_USER_EMAIL = user?.email;

  const USER_EMAIL = candidateDetails.original_email;
  const candidateId = candidateDetails?.id;

  const project_id = detailsData?.id;

  useEffect(() => {
    if (DEFAULT_USER_EMAIL && project_id) {
      getProjectDocs();
    }
  }, [DEFAULT_USER_EMAIL, project_id]);

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

  function getProjectDocs() {
    if (!project_id) return;

    setLoader(true);
    const payload = {
      emailid: DEFAULT_USER_EMAIL,
      operation: "get_documents",
      candidate_id: candidateId,
      project_id: project_id,
    };
    axiosApi
      .post(projectsApi, payload)
      .then((res) => {
        setDocumentsData(res.data);
      })
      .catch(() => {
        console.log("failed");
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
      candidate_email: USER_EMAIL,
    };
    axiosApi
      .post(projectsApi, payload)
      .then((res) => {
        toast.success(res.data.message || "Deleted");
        setDeleteModal(false);
        setDeleteDoc(false);
        getProjectDocs();
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to delete");
      })
      .finally(() => setLoader(false));
  }

  if (!details) {
    return;
  }

  return (
    <OverlayModal isActive={details} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <div className="position-sticky top-0 end-0 h-100 bg-body d-flex flex-column z-3 w-100">
        <div className="flex-shrink-0 border-bottom bg-body position-relative">
          <div className="d-flex flex-column gap-2 text-start pb-4">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="rounded-3 p-1 px-2" style={projectStatusStyle(projectData.status)}>
                    <CircleCheckBig size={14} style={{ marginRight: 4 }} />
                    {projectData.status}
                  </span>
                  {isActiveProj ? <></> : <span className="text-muted small">{projectData.statusDeltaDays} days</span>}
                </div>
                <h2 className="h4 fw-bold mb-0">{projectData.jobTitle}</h2>
                <p className="fs-6 text-muted mb-0">{projectData.client}</p>
              </div>
              {!isDisabled && (
                <div className="d-flex align-items-center gap-2 ms-3">
                  <button
                    onClick={() => {
                      setEditProject(detailsData);
                      setOpenModal(true);
                    }}
                    disabled={loader}
                    type="button"
                    className="btn btn-light border-0 p-2 rounded-2 d-flex align-items-center justify-content-center gap-2 d-flex px-3"
                    title="Edit"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-light border-0 p-2 rounded-2 d-flex align-items-center justify-content-center gap-2 d-flex px-3"
                    title="Delete"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="pb-4 pt-2 d-flex flex-column gap-4" style={{ maxWidth: "98%" }}>
            <section>
              <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2 mb-3">
                <Briefcase size={20} className="text-primary" />
                Project Details
              </h3>
              <div className="row g-3 bg-light rounded-3 p-3 pt-0">
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Job Title</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small">{projectData.jobTitle}</span>
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Client</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small">{projectData.client}</span>
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Vendor</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small">{projectData.vendor}</span>
                  </div>
                </div>
                {projectData.subVendor && (
                  <div className="col-12 col-md-6 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">Sub-Vendor</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">{projectData.subVendor}</span>
                    </div>
                  </div>
                )}
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Work Mode</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small">{projectData.workMode}</span>
                  </div>
                </div>
                {projectData.projectRole && (
                  <div className="col-12 col-md-6 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">Project Role</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">{projectData.projectRole}</span>
                    </div>
                  </div>
                )}
                {projectData.billRate && (
                  <div className="col-12 col-md-6 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">Bill Rate</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small fw-semibold text-success">{projectData.billRate}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="border-top" />

            <section>
              <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2 mb-3">
                <Calendar size={20} className="text-primary" />
                Assignment Info
              </h3>
              <div className="row g-3 bg-light rounded-3 p-3 pt-0">
                {projectData.startDate ? (
                  <div className="col-12 col-md-4 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">Start Date</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">{format(new Date(projectData.startDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {projectData.endDate ? (
                  <div className="col-12 col-md-4 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">End Date</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">{format(new Date(projectData.endDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {projectData.totalDurationDays ? (
                  <div className="col-12 col-md-4 d-flex flex-column gap-1">
                    <span className="capitalize text-muted small fw-semibold">Total Duration</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">{projectData.totalDurationDays} days</span>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </section>

            <div className="border-top" />

            <section>
              <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2 mb-3">
                <User size={20} className="text-primary" />
                Reporting &amp; Contacts
              </h3>
              <div className="row g-3 bg-light rounded-3 p-3 pt-0">
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Reporting Manager</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted d-inline-flex align-items-center">
                      <User size={16} className="me-1" />
                    </span>
                    <span className="small">{projectData.reportingManager}</span>
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Vendor Email</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted d-inline-flex align-items-center">
                      <Mail size={16} className="me-1" />
                    </span>
                    <span className="small">{projectData.vendorEmail}</span>
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-column gap-1">
                  <span className="capitalize text-muted small fw-semibold">Vendor Phone</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted d-inline-flex align-items-center">
                      <Phone size={16} className="me-1" />
                    </span>
                    <span className="small">{projectData.vendorPhone}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-top" />

            <section>
              <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2 mb-3">
                <Notebook size={20} className="text-primary" />
                Comments
              </h3>
              <div className="bg-light rounded-3 p-3">
                <p className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {projectData.comments}
                </p>
              </div>
            </section>

            <div className="border-top" />

            {isActiveProj ? (
              <></>
            ) : (
              <>
                <section>
                  <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2 mb-3">
                    <Clock size={20} className="text-warning" />
                    Bench Period After This Project
                  </h3>
                  <div className="border border-warning-subtle rounded-3 p-3" style={{ background: "#ffe69c29" }}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge border border-warning bg-transparent" style={{ color: "#ea580c" }}>
                        {projectData.benchDays} days on bench
                      </span>
                      <span>{projectData.bench_period_display}</span>
                    </div>
                  </div>
                </section>

                <div className="border-top" />
              </>
            )}

            <section>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="fs-5 fw-semibold d-flex align-items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Documents ({documentsData?.total_documents || 0})
                </h3>

                {!isDisabled && (
                  <div
                    className="themeButton themeButtonHover px-3 py-2 rounded"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setUploadModal(true);
                    }}
                  >
                    <Upload size={16} />
                    Upload
                  </div>
                )}
              </div>
              {documentsData?.total_documents ? (
                <div className="bg-light rounded-3 p-3">
                  <div className="d-flex flex-column gap-2">
                    {documentsData?.documents.map((item, index) => {
                      let isPDF = item.file_extension == ".pdf";

                      return (
                        <div
                          key={index}
                          className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-body-secondary-subtle"
                        >
                          <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                            <File size={16} className={`${isPDF ? "text-danger" : "text-muted"}  flex-shrink-0`} />
                            <div className="flex-grow-1 min-w-0">
                              <p className="small fw-medium mb-1 text-truncate" title={item.file_name}>
                                {item.file_name}
                              </p>
                              <div className="d-flex align-items-center gap-2 text-muted small">
                                <span>{formatFileSize(item.file_size)}</span>
                                <span
                                  className={"badge px-2 py-1 fw-semibold capitalize"}
                                  style={tagVariantClasses(item.document_type) || {}}
                                >
                                  {String(item.document_type).replaceAll("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                            <button
                              disabled={!isPDF}
                              type="button"
                              title="View"
                              onClick={() => {
                                if (isPDF) downloadDoc(item, true);
                              }}
                              className="btn btn-sm btn-light d-inline-flex align-items-center justify-content-center p-1 rounded-2"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              title="Download"
                              onClick={() => downloadDoc(item)}
                              className="btn btn-sm btn-light d-inline-flex align-items-center justify-content-center p-1 rounded-2"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteDoc(item);
                                setDeleteModal(true);
                              }}
                              type="button"
                              className="btn btn-sm btn-light d-inline-flex align-items-center justify-content-center p-1 rounded-2 text-danger"
                              title="Delete Document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </section>
          </div>
        </div>
      </div>

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

      <Confirm
        title="Delete document"
        deleteModal
        result={(status) => {
          if (status) {
            return confirmDeleteDoc();
          }

          setDeleteModal(false);
          setDeleteDoc(false);
        }}
        show={deleteModal}
        text={`Are you sure you want to delete <b> ${deleteDoc?.file_name} </b>?`}
      />

      <ThemeLoader show={loader} fixed />

      <UploadDocumentModal
        open={uploadModal}
        DEFAULT_CANDIDATE_ID={candidateId}
        onOpenChange={(val) => {
          setUploadModal(!!val);
        }}
        onSuccess={() => {
          getProjectDocs();
          setUploadModal(false);
        }}
        projectId={detailsData?.id}
        candidateEmail={USER_EMAIL}
      />

      {openModal && (
        <ProjectModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditProject(null);
            onClose();
            loadData();
          }}
          editProject={editProject}
          candidateId={candidateId}
        />
      )}
    </OverlayModal>
  );
}

export default ProjectDetailsModal;
