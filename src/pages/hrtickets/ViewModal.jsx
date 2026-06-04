import { useEffect, useState, useRef } from "react";
import OverlayModal from "../../components/OverlayModal";
import { axiosApi, Confirm, ThemeLoader } from "../../components";
import styles from "./HRTicketDetails.module.css";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  File,
  FileCode,
  FileJson,
  User,
  Tag,
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Eye,
  Download,
  Trash2,
  PenTool,
  CircleCheckBig,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import FilePreview from "../benchcandidate/FilePreview";
import { DocumentSignatureHub } from "../../components/signature/DocumentSignatureHub";
import { DocumentsSection } from "../talentpool";
import { useNavigate } from "react-router-dom";
function sortCommunicationsRecentFirst(communications) {
  return [...communications].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  let accessLevel = String(data?.modules?.hr_tickets?.accessLevel).toLocaleLowerCase();

  return accessLevel;
}

const HRTicketDetails = ({ show, setShow }) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [ticketsData, setTicketsData] = useState({});
  const [loader, setLoader] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDoc, setviewDoc] = useState(false);
  const [base64File, setBase64File] = useState("");
  const [fileType, setFileType] = useState("");
  const [updatedFile, setupdatedFile] = useState([]);
  const [base64FileEdit, setBase64FileEdit] = useState("");
  const [othersModal, setOthersModal] = useState(false);
  const [showDocumentsUploadModal, setshowDocumentsUploadModal] = useState(false);
  const [statusOptions] = useState(["Open", "In Progress", "Pending Employee", "Pending HR", "Resolved", "Closed"]);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const { ticket = {}, ticket_attachments = [], bench_candidate_info } = ticketsData;

  const communicationMessages = ticketsData?.communications || [];

  const employee_email = ticket?.employee_email;

  const communications = sortCommunicationsRecentFirst(communicationMessages);

  let userPermition = getPermissions();
  let isEditPermition = userPermition == "edit";

  useEffect(() => {
    if (show?.reference_number) {
      fetchOrgTickets();
    } else {
      setAttachedFiles([]);
      setBase64File("");
      setFileType("");
      setupdatedFile([]);
      setBase64FileEdit("");
      setFileError("");
      setReplyText("");
      setTicketsData({});
    }
  }, [show?.reference_number]);

  useEffect(() => {
    setTimeout(() => {
      setFileError("");
    }, 3000);
  }, [fileError]);

  const navigateToTalent = () => {
    let data = bench_candidate_info || {};
    let talentName = data?.talent_status;
    let candidateId = data?.id;
    if (!talentName) {
      return;
    }

    if (!candidateId) {
      candidateId = data?.id;
    }

    let links = {
      "Active Talent": "/activetalent?id=" + candidateId,
      "Available Talent": "/availableTalent?id=" + candidateId,
      "Inactive Talent": "/inactivetalent?id=" + candidateId,
      "Pending Talent": "/pendingtalent?id=" + candidateId,
    };

    if (!links[talentName]) {
      return;
    }

    navigate(links[talentName]);
  };

  const fetchOrgTickets = () => {
    const payload = {
      action: "get_ticket_details_employer",
      employee_email: show?.employee_email,
      employer_email: user?.email,
      reference_number: show?.reference_number,
    };

    setLoader(true);
    axiosApi
      .post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        setLoader(false);
        setTicketsData(response.data?.data);
      })
      .catch((error) => {
        setLoader(false);
        console.log("Error fetching tickets:", error.response?.data || error.message);
        toast.error("Failed to load ticket details");
      });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File ${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newFilesWithId = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
      }));
      setAttachedFiles((prev) => [...prev, ...newFilesWithId]);
      setFileError("");
    }

    e.target.value = null;
  };

  const removeFile = (fileIdToRemove) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileIdToRemove));
  };

  const removeUpdatedFile = (fileIdToRemove) => {
    setupdatedFile((prev) => prev.filter((file) => file.id !== fileIdToRemove));
  };

  const handleReplySubmit = async (actionType) => {
    if (!replyText.trim() && !attachedFiles.length && !updatedFile.length) {
      toast.error("Please enter a reply message or attach a file");
      return;
    }

    try {
      const attachments = [];
      for (const fileWrapper of attachedFiles) {
        const base64Content = await fileToBase64(fileWrapper.file);
        attachments.push({
          file_name: fileWrapper.file.name,
          file_content: base64Content,
        });
      }

      for (const file of updatedFile) {
        attachments.push({
          file_name: file.name,
          file_content: file.base64file,
        });
      }

      const payload = {
        action: "add_communication_employer",
        reference_number: show?.reference_number,
        employer_email: user?.email,
        employee_email: show?.employee_email,
        sender_type: "hr",
        message: replyText,
        attachments,
      };

      setIsSubmitting(true);
      setLoader(true);
      const response = await axiosApi.post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload);
      setLoader(false);
      setIsSubmitting(false);
      if (response.data.status === "success") {
        toast.success("Reply sent successfully");

        setReplyText("");
        setAttachedFiles([]);
        setFileError("");

        fetchOrgTickets();

        if (actionType === "resolve") {
          handleStatusUpdate("Resolved", true);
        } else if (actionType === "await") {
          handleStatusUpdate("Pending Employee", true);
        }
      } else {
        toast.error(response.data.error || "Failed to send reply");
      }
    } catch (error) {
      setLoader(false);
      setIsSubmitting(false);
      console.error("Error sending reply:", error);
      toast.error(error.response?.data?.error || "Failed to send reply");
    } finally {
      setLoader(false);
      setIsSubmitting(false);
      if (updatedFile?.length) {
        setshowDocumentsUploadModal(true);
      }
    }
  };

  const handleStatusUpdate = async (status, hidePopup) => {
    const newStatusValue = status || newStatus;

    if (!newStatusValue) {
      toast.error("Please select a new status");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        action: "update_ticket_status",
        reference_number: show?.reference_number,
        hr_email: user?.email,
        status: newStatusValue,
        internal_notes: internalNotes,
      };

      const response = await axiosApi.post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload);

      if (response.data.status === "success") {
        !hidePopup && toast.success("Ticket status updated");

        if (!status) {
          setNewStatus("");
          setInternalNotes("");
        }
        fetchOrgTickets();
      } else {
        !hidePopup && toast.error(response.data.error || "Failed to update ticket status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      !hidePopup && toast.error(error.response?.data?.error || "Failed to update ticket status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAttachment = async (attachment, isView, isEdit) => {
    try {
      const payload = {
        action: "get_attachment_employer",
        attachment_id: attachment.attachment_id,
        employer_email: user?.email,
        employee_email: show?.employee_email,
      };
      setLoader(true);
      const response = await axiosApi.post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload);
      setLoader(false);

      if (response.data.status === "success") {
        const { file_name, file_content, file_type } = response.data.data;

        if (isView) {
          setBase64File(file_content);
          setFileType(file_type);
          return;
        } else if (isEdit) {
          setBase64FileEdit(file_content);
          return;
        }

        const link = document.createElement("a");

        const byteCharacters = atob(file_content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file_type });

        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Download started");
      } else {
        toast.error(response.data.error || "Failed to download attachment");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error downloading attachment:", error);
      toast.error(error.response?.data?.error || "Failed to download attachment");
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "";
    }

    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (!show) {
    return null;
  }

  const getFileIconByType = (fileType) => {
    const type = fileType?.toLowerCase();

    if (type.startsWith("image/")) return <FileImage className={styles.iconSm} />;
    if (type.startsWith("video/")) return <FileVideo className={styles.iconSm} />;
    if (type.startsWith("audio/")) return <FileAudio className={styles.iconSm} />;
    if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("gzip"))
      return <FileArchive className={styles.iconSm} />;
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv"))
      return <FileSpreadsheet className={styles.iconSm} />;
    if (type.includes("word")) return <FileText className={styles.iconSm} />;
    if (type.includes("pdf")) return <FileText className={`text-danger ${styles.iconSm}`} />;
    if (type.includes("json")) return <FileJson className={styles.iconSm} />;
    if (
      type.includes("javascript") ||
      type.includes("typescript") ||
      type.includes("html") ||
      type.includes("css") ||
      type.includes("python") ||
      type.includes("java") ||
      type.includes("c") ||
      type.includes("cpp")
    )
      return <FileCode className={styles.iconSm} />;
    if (type.includes("text") || type.includes("markdown")) return <FileText className={styles.iconSm} />;

    return <File className={styles.iconSm} />;
  };

  const renderAttachments = (attachments) => {
    if (!attachments || !attachments.length) return <></>;

    let isMulti = attachments?.length > 1;

    return (
      <div className={isMulti ? styles.gridContainer : ""}>
        {attachments.map((attachment, index) => {
          return (
            <div key={index} className={`my-2 gap-1 ${styles.attachmentItem}`}>
              <div className={`${styles.attachmentInfo} w-100`}>
                {getFileIconByType(attachment.file_type)}
                <div className="d-flex flex-column w-100">
                  <div className={`${styles.attachmentName}`} style={{ maxWidth: "85%" }} title={attachment.file_name}>
                    {attachment.file_name}
                  </div>
                  <div className={styles.attachmentSize}>{formatFileSize(attachment.file_size)}</div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                {[
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/webp",
                  "image/gif",
                  "image/bmp",
                  "image/svg+xml",
                  "image/avif",
                  "application/pdf",
                ].includes(attachment?.file_type?.toLowerCase()) && (
                  <div
                    onClick={() => {
                      downloadAttachment(attachment, true);
                      setviewDoc(attachment);
                    }}
                    className="pointer p-2"
                  >
                    <Eye className={styles.iconSm} />
                  </div>
                )}

                {["application/pdf"].includes(attachment?.file_type?.toLowerCase()) && isEditPermition && (
                  <div
                    onClick={() => {
                      downloadAttachment(attachment, false, true);
                      setviewDoc(attachment);
                    }}
                    className="pointer p-2"
                  >
                    <PenTool className={styles.iconSm} />
                  </div>
                )}
                <div onClick={() => downloadAttachment(attachment)} className="pointer p-2">
                  <Download className={styles.iconSm} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const priorityColor = (priority) => {
    const colors = {
      high: "#991b1b",
      medium: "#ca8a04",
      low: "#16a34a",
    };
    return colors[priority?.toLowerCase().trim()] || "#6b7280";
  };

  const priorityBGColor = (priority) => {
    const colors = {
      high: "#fee2e2",
      medium: "#fef9c3",
      low: "#dcfce7",
    };
    return colors[priority?.toLowerCase().trim()] || "#f3f4f6";
  };

  const statusColor = (status) => {
    const colors = {
      open: "#304abe",
      pending: "#d97706",
      inprogress: "#0e7490",
      resolved: "#15803d",
      closed: "#44403c",
      pendingemployee: "#9a3b2a",
      pendinghr: "#7328af",
    };
    return colors[status?.toLowerCase().replace(/\s+/g, "").trim()] || "#6b7280";
  };

  const statusBGColor = (status) => {
    const colors = {
      open: "#dbeafe",
      pending: "#fef3c7",
      inprogress: "#cffafe",
      resolved: "#bbf7d0",
      closed: "#e7e5e4",
      pendingemployee: "#ffedd5",
      pendinghr: "#f3e8ff",
    };
    return colors[status?.toLowerCase().replace(/\s+/g, "").trim()] || "#f3f4f6";
  };

  const allAttachedFiles = [...attachedFiles, ...updatedFile];

  return (
    <OverlayModal isActive={show} onClose={() => setShow(false)} style={{ minWidth: "80%" }}>
      <div className={styles.sheetContent}>
        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>
            <FileText className={styles.icon} />
            Ticket Details
          </h2>
          <p className={styles.sheetDescription}>Reference: {show?.reference_number}</p>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={`justify-content-between ${styles.cardTitle}`}>
                <span>{ticket.subject}</span>
                <div className={styles.badgeContainer}>
                  <span
                    className={styles.badge}
                    style={{ color: priorityColor(ticket.priority), backgroundColor: priorityBGColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={styles.badge}
                    style={{
                      color: statusColor(ticket.status),
                      backgroundColor: statusBGColor(ticket.status),
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              </h3>
            </div>

            <div className={styles.cardContent}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className={`flex-wrap gap-1 ${styles.detailItem}`}>
                  <div className="d-flex gap-1">
                    <User className={styles.iconSm} />
                    <span className={styles.detailLabel}>Employee:</span>
                  </div>
                  <span
                    onClick={() => {
                      navigateToTalent();
                    }}
                    className="hoverthemetext pointer"
                  >
                    {ticket.employee_email}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <Calendar className={styles.iconSm} />
                  <span className={styles.detailLabel}>Created:</span>
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-1">
                <div className={styles.detailItem}>
                  <Tag className={styles.iconSm} />
                  <span className={styles.detailLabel}>Category:</span>
                  <span>{ticket.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <Clock className={styles.iconSm} />
                  <span className={styles.detailLabel}>Updated:</span>
                  <span>{formatDate(ticket.updated_at)}</span>
                </div>
              </div>
              <div className={styles.descriptionSection}>
                <h4>Description</h4>
                <p>{ticket.description}</p>
              </div>

              {ticket_attachments.length > 0 && (
                <div className={styles.attachmentsSection}>
                  <h4>Attachments</h4>
                  <div
                    className={`${styles.attachmentList} ${ticket_attachments?.length > 1 ? styles.gridContainer : ""}`}
                  >
                    {ticket_attachments.map((attachment, index) => (
                      <div key={index} className={`my-2 gap-1 ${styles.attachmentItem}`}>
                        <div className={`${styles.attachmentInfo} w-100`}>
                          {getFileIconByType(attachment.file_type)}
                          <div className="d-flex flex-column w-100">
                            <div
                              className={`${styles.attachmentName}`}
                              style={{ maxWidth: "85%" }}
                              title={attachment.file_name}
                            >
                              {attachment.file_name}
                            </div>
                            <div className={styles.attachmentSize}>{formatFileSize(attachment.file_size)}</div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          {[
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                            "image/webp",
                            "image/gif",
                            "image/bmp",
                            "image/svg+xml",
                            "image/avif",
                            "application/pdf",
                          ].includes(attachment?.file_type?.toLowerCase()) && (
                            <div
                              onClick={() => {
                                downloadAttachment(attachment, true);
                                setviewDoc(attachment);
                              }}
                              className="pointer p-2"
                            >
                              <Eye className={styles.iconSm} />
                            </div>
                          )}
                          {["application/pdf"].includes(attachment?.file_type?.toLowerCase()) && isEditPermition && (
                            <div
                              onClick={() => {
                                downloadAttachment(attachment, false, true);
                                setviewDoc(attachment);
                              }}
                              className="pointer p-2"
                            >
                              <PenTool className={styles.iconSm} />
                            </div>
                          )}
                          <div onClick={() => downloadAttachment(attachment)} className="pointer p-2">
                            <Download className={`${styles.iconSm}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {communications?.length ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={`${styles.cardTitle}`}>
                  <MessageSquare className={styles.icon} />
                  Communication Thread
                </h3>
              </div>
              <div className={styles.communicationContainer}>
                <div className={styles.communicationContent}>
                  {communications.map((comm, index) => (
                    <div key={index}>
                      <div key={index} className={styles.message}>
                        <div className={styles.avatar}>
                          <User className={styles.iconXs} />
                        </div>
                        <div className={`${styles.messageContent} w-100`}>
                          <div className={styles.messageHeader}>
                            <span title={comm.sender_name} className={styles.sender}>
                              {comm.sender_name}
                            </span>
                            <span className={comm.sender_type === "employee" ? styles.badgeEmployee : styles.badgeHr}>
                              {comm.sender_type}
                            </span>
                            <span className={styles.timestamp}>{formatDateTime(comm.created_at)}</span>
                          </div>
                          <div className={styles.messageText}>{comm.message}</div>
                          {renderAttachments(comm.attachments)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          {isEditPermition ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={`${styles.cardTitle}`}>Add Reply</h3>
              </div>
              <div className={styles.replyContainer}>
                <textarea
                  className={styles.textarea}
                  placeholder="Type your reply here..."
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className={styles.fileUpload}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                      className={styles.buttonOutline}
                      type="button"
                      style={{ width: "fit-content" }}
                      onClick={() => fileInputRef.current.click()}
                      disabled={isSubmitting}
                    >
                      <Paperclip className={styles.iconSm} />
                      Attach Files
                    </button>
                    <span className={styles.fileInfo}> Max 5MB each</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className={styles.fileInput}
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  {fileError && <div className={styles.errorText}>{fileError}</div>}

                  {allAttachedFiles.length > 0 && (
                    <div
                      className={`${styles.attachedFiles} ${allAttachedFiles.length > 1 ? styles.gridContainer : ""}`}
                    >
                      {allAttachedFiles.map((file) => {
                        const isUpdated = file.isattached;
                        const fileName = isUpdated ? file.name : file.file.name;
                        const fileType = isUpdated ? file.type : file.file.type;
                        const fileSize = isUpdated ? file.size : file.file.size;

                        return (
                          <div key={file.id} className={`flex-row ${styles.attachedFileItem}`}>
                            {getFileIconByType(fileType)}
                            <span className={styles.fileName} title={fileName}>
                              {fileName}
                            </span>
                            <span className={styles.fileSize}>{formatFileSize(fileSize)}</span>
                            <button
                              type="button"
                              className={styles.removeFileButton}
                              onClick={() => {
                                if (isUpdated) {
                                  removeUpdatedFile(file.id);
                                } else {
                                  removeFile(file.id);
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.button}
                    disabled={!replyText.trim() || isSubmitting}
                    onClick={() => handleReplySubmit("reply")}
                  >
                    <Send className={styles.iconSm} />
                    Send Reply
                  </button>
                  <button
                    className={styles.buttonPrimary}
                    disabled={!replyText.trim() || isSubmitting}
                    onClick={() => handleReplySubmit("resolve")}
                  >
                    <Send className={styles.iconSm} />
                    Send & Mark Resolved
                  </button>
                  {ticket.status !== "Resolved" ? (
                    <button
                      className={`${styles.buttonPrimary} ${styles.buttonresolved}`}
                      onClick={() => handleStatusUpdate("Resolved")}
                    >
                      <CircleCheckBig className={styles.iconSm} />
                      Mark Resolved
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <ThemeLoader show={loader || isSubmitting} fixed />
      </div>

      <DocumentSignatureHub
        open={!!base64FileEdit}
        onOpenChange={(res) => {
          setBase64FileEdit(false);
        }}
        documentContent={base64FileEdit || ""}
        documentName={viewDoc.file_name}
        onDocumentSigned={(base64file) => {
          const sizeInBytes = Math.ceil(base64file.length * (3 / 4));
          const newFile = {
            id: Date.now() + Math.random(),
            isattached: true,
            base64file,
            file_name: "signed_" + viewDoc.file_name,
            name: "signed_" + viewDoc.file_name,
            type: viewDoc.file_type,
            size: sizeInBytes,
          };
          setupdatedFile((prevFiles) => [...prevFiles, newFile]);
          setBase64FileEdit("");
        }}
      />

      {/* <PdfEditor
        pdfBase64={base64FileEdit}
        onClose={() => setBase64FileEdit("")}
        setBase64File={(base64file) => {
          const sizeInBytes = Math.ceil(base64file.length * (3 / 4));
          const newFile = {
            id: Date.now() + Math.random(),
            isattached: true,
            base64file,
            file_name: "signed_" + viewDoc.file_name,
            name: "signed_" + viewDoc.file_name,
            type: viewDoc.file_type,
            size: sizeInBytes,
          };
          setupdatedFile((prevFiles) => [...prevFiles, newFile]);
          setBase64FileEdit("");
        }}
        docObject={viewDoc}
      /> */}
      <FilePreview
        docObject={viewDoc}
        base64File={base64File}
        setBase64File={setBase64File}
        fileType={fileType}
        setFileType={setFileType}
      />
      <Confirm
        show={showDocumentsUploadModal}
        result={(status) => {
          if (status) {
            setOthersModal(true);
          } else {
            setupdatedFile([]);
          }
          setshowDocumentsUploadModal(false);
        }}
        title="Save to Candidate Profile"
        text="Do you want to save this document to the candidate’s profile under Files & Documents for future reference?"
        deleteTitle="Yes, I'm Sure"
      />
      <DocumentsSection
        defaultDocs={updatedFile}
        show={othersModal}
        setshow={(status, refresh) => {
          setOthersModal(false);
          setupdatedFile([]);
        }}
        isBase64={true}
        email_id={employee_email}
      />
    </OverlayModal>
  );
};

export default HRTicketDetails;
