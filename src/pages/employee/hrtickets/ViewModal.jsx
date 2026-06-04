import { useEffect, useState, useRef } from "react";
import OverlayModal from "../../../components/OverlayModal";
import { axiosApi, ThemeLoader } from "../../../components";
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
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../authContext";
import FilePreview from "../../benchcandidate/FilePreview";
import { returnTruncatedStr } from "../../../helpers/StrHelpers";

function sortCommunicationsRecentFirst(communications) {
  return [...communications].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const HRTicketDetails = ({ show, setShow }) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [ticketsData, setTicketsData] = useState({});
  const [loader, setLoader] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDoc, setviewDoc] = useState(false);
  const [base64File, setBase64File] = useState("");
  const [fileType, setFileType] = useState("");

  const fileInputRef = useRef(null);

  const { ticket = {}, ticket_attachments = [] } = ticketsData;
  const communicationMessages = ticketsData?.communications || [];
  const communications = sortCommunicationsRecentFirst(communicationMessages);

  useEffect(() => {
    if (show?.reference_number) {
      fetchOrgTickets();
    } else {
      setAttachedFiles([]);
      setBase64File("");
      setFileType("");
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

  const fetchOrgTickets = () => {
    const payload = {
      action: "get_ticket_details",
      employee_email: user?.email,
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
        setShow(false);
        console.log("Error fetching tickets:", error.response?.data || error.message);
        toast.error("Failed to load ticket details");
      });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // // Validate file count
    // if (files.length + attachedFiles.length > 3) {
    //   setFileError("You can attach a maximum of 3 files");
    //   return;
    // }

    // Validate file size and type
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File ${file.name} exceeds 5MB limit`);
        return false;
      }

      // const validExtensions = [".pdf", ".png", ".jpeg", ".jpg", ".docx", ".xlsx", ".txt"];
      // const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

      // if (!validExtensions.includes(extension)) {
      //   setFileError(`Invalid file type: ${extension}. Supported types: PDF, PNG, JPEG, DOCX, XLSX, TXT`);
      //   return false;
      // }

      return true;
    });

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
      setFileError("");
    }

    // Reset file input
    e.target.value = null;
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplySubmit = async (actionType) => {
    if (!replyText.trim() && !attachedFiles?.length) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSubmitting(true);

    try {
      const attachments = [];
      for (const file of attachedFiles) {
        const base64Content = await fileToBase64(file);
        attachments.push({
          file_name: file.name,
          file_content: base64Content,
        });
      }

      const payload = {
        action: "add_communication",
        reference_number: show?.reference_number,
        sender_email: user?.email,
        sender_type: "employee",
        message: replyText,
        attachments,
      };

      // Make API call
      setLoader(true);
      const response = await axiosApi.post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload);
      setLoader(false);
      if (response.data.status === "success") {
        toast.success("Reply sent successfully");

        // Reset form
        setReplyText("");
        setAttachedFiles([]);
        setFileError("");

        // Refresh ticket data
        fetchOrgTickets();

        //  if (actionType === "resolve") {
        //   handleStatusUpdate("Resolved");
        // } else if (actionType === "await") {
        //   handleStatusUpdate("Pending Employee");
        // }
      } else {
        toast.error(response.data.error || "Failed to send reply");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send reply");
    } finally {
      setLoader(false);
      setIsSubmitting(false);
    }
  };

  // const handleStatusUpdate = async (status) => {
  //   const newStatusValue = status || newStatus;

  //   if (!newStatusValue) {
  //     toast.error("Please select a new status");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const payload = {
  //       action: "update_ticket_status",
  //       reference_number: show?.reference_number,
  //       hr_email: user?.email,
  //       hr_email: "marketing@4spheresolutions.com",
  //       status: newStatusValue,
  //       internal_notes: internalNotes,
  //     };

  //     const response = await axiosApi.post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload);

  //     if (response.data.status === "success") {
  //       toast.success("Ticket status updated");

  //       // Reset form if not called from reply action
  //       if (!status) {
  //         setNewStatus("");
  //         setInternalNotes("");
  //       }

  //       // Refresh ticket data
  //       fetchOrgTickets();
  //     } else {
  //       toast.error(response.data.error || "Failed to update ticket status");
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     toast.error(error.response?.data?.error || "Failed to update ticket status");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const downloadAttachment = async (attachment, isView) => {
    try {
      const payload = {
        action: "get_attachment",
        attachment_id: attachment.attachment_id,
        user_email: user?.email,
        user_type: "employee",
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
        }

        const link = document.createElement("a");

        // Create blob from base64
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
      toast.error(error.response?.data?.error || "Failed to download attachment");
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix
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

  // bg and color functions for priority and status badges

  const priorityColor = (priority) => {
    const colors = {
      high: "#991b1b",
      medium: "#ca8a04",
      low: "#16a34a",
    };
    const key = priority?.toLowerCase().trim();
    return colors[key] || "#6b7280";
  };

  const priorityBGColor = (priority) => {
    const colors = {
      high: "#fee2e2",
      medium: "#fef9c3",
      low: "#dcfce7",
    };
    const key = priority?.toLowerCase().trim();
    return colors[key] || "#f3f4f6";
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
    const key = status?.toLowerCase().replace(/\s+/g, "").trim();
    return colors[key] || "#6b7280";
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
    const key = status?.toLowerCase().replace(/\s+/g, "").trim();
    return colors[key] || "#f3f4f6";
  };

  // bg and color functions for priority and status badges

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
          {/* Ticket Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={`justify-content-between ${styles.cardTitle}`}>
                <span>{ticket.subject}</span>
                <div className={styles.badgeContainer}>
                  <span
                    className={styles.badge}
                    style={{
                      color: priorityColor(ticket.priority),
                      backgroundColor: priorityBGColor(ticket.priority),
                    }}
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
                    <span className={styles.detailLabel}>Employee:</span>{" "}
                  </div>
                  <span>{ticket.employee_email}</span>
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

              {/* Attachments Section */}
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
          {/* Communication Thread */}

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
                  {communications.map((comm, index) => {
                    let attachment = comm.attachments;

                    return (
                      <div key={index}>
                        <div key={index} className={styles.message}>
                          <div className={styles.avatar}>
                            <User className={styles.iconXs} />
                          </div>
                          <div className={`${styles.messageContent} w-100`}>
                            <div className={styles.messageHeader}>
                              <span className={styles.sender}>{comm.sender_name}</span>
                              <span className={comm.sender_type === "employee" ? styles.badgeEmployee : styles.badgeHr}>
                                {comm.sender_type}
                              </span>
                              <span className={styles.timestamp}>{formatDateTime(comm.created_at)}</span>
                            </div>
                            <div className={styles.messageText}>{comm.message}</div>
                            {renderAttachments(attachment)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* Add Reply Section */}
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

                {attachedFiles.length > 0 && (
                  <div className={`${styles.attachedFiles} ${attachedFiles.length != 1 ? styles.gridContainer : ""}`}>
                    {attachedFiles.map((file, index) => {
                      return (
                        <div key={index} className={styles.attachedFileItem}>
                          {getFileIconByType(file.type)}
                          <span className={styles.fileName} title={file.name}>
                            {file.name}
                          </span>
                          <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                          <button
                            type="button"
                            className={styles.removeFileButton}
                            onClick={() => removeFile(index)}
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
                  className={styles.buttonPrimary}
                  disabled={!replyText.trim() || isSubmitting}
                  onClick={() => handleReplySubmit("reply")}
                >
                  <Send className={styles.iconSm} />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
        <ThemeLoader show={loader || isSubmitting} fixed />
      </div>
      <FilePreview
        docObject={viewDoc}
        base64File={base64File}
        setBase64File={setBase64File}
        fileType={fileType}
        setFileType={setFileType}
      />
    </OverlayModal>
  );
};

export default HRTicketDetails;
