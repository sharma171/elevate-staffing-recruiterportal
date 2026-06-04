import { useState, useRef, useEffect } from "react";
import styles from "./CreateTicketForm.module.css";
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import OverlayModal from "../../../components/OverlayModal";
import { useAuth } from "../../../authContext";
import { axiosApi, ThemeLoader } from "../../../components";
import { toast } from "react-toastify";

const initialFormValues = { priority: "Medium", category: "", subject: "", description: "", files: [] };

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const CreateTicketForm = ({ setShow, show }) => {
  const { user } = useAuth();
  const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState(initialFormValues);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!show) {
      setFormData(initialFormValues);
    }
  }, [show]);

  if (!show) {
    return <></>;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  // Remove file from list
  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const filePromises = formData.files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            file_name: file.name,
            file_content: reader.result.split(",")[1], // Remove data URL prefix
          });
        reader.readAsDataURL(file);
      });
    });

    const filesBase64 = await Promise.all(filePromises);

    // Prepare payload
    const payload = {
      action: "submit_ticket",
      employee_email: user?.email,
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      files: filesBase64,
    };
    setloading(true);
    axiosApi
      .post("https://submit-hr-ticket-employee-v3-305451280005.us-east1.run.app/", payload)
      .then((res) => {
        setloading(false);
        toast.success(res.data.message || "HR ticket submitted successfully.");
        setFormData(initialFormValues);
        setShow();
      })
      .catch((err) => {
        setloading(false);
        toast.error(err.response.data.error || err.response.data.message);
      });
  };

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

  return (
    <OverlayModal isActive={show} onClose={() => setShow(false)} style={{ minWidth: "75%" }}>
      <div>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Create New HR Ticket</h2>
          <p className={styles.dialogDescription}>Submit a new HR request or inquiry</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.gridContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select category</option>
                <option value="Leave Request">Leave Request</option>
                <option value="IT Support">IT Support</option>
                <option value="Policy Questions">Policy Questions</option>
                <option value="Benefits">Benefits</option>
                <option value="Payroll">Payroll</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Training">Training</option>
                <option value="Workplace Issues">Workplace Issues</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={(e) => {
                if (e.target.value.length <= 199) {
                  handleChange(e);
                }
              }}
              placeholder="Brief description of your request"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your request"
              className={styles.textarea}
              rows="3"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="files" className={styles.label}>
              Attachments (Optional)
            </label>
            <div className={styles.uploadArea}>
              <div className={styles.uploadContent}>
                <Upload className={styles.uploadIcon} />
                <div className={styles.uploadActions}>
                  <label htmlFor="file-upload" className={styles.uploadLabel}>
                    <span className={styles.uploadText}>Upload files</span>
                    <input
                      id="file-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className={styles.fileInput}
                      multiple
                      // accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.txt"
                    />
                  </label>
                  <p className={styles.fileTypes}>Each file must be 10MB or smaller</p>
                </div>
              </div>
            </div>

            {formData.files.length > 0 && (
              <div className={styles.fileListContainer}>
                <label className={`mb-3 ${styles.label}`}>Selected Files:</label>
                <div className={`  ${formData.files?.length > 1 ? styles.gridContainerList : ""}`}>
                  {formData.files.map((file, index) => (
                    <div key={index} className={styles.attachedFileItem}>
                      {getFileIconByType(file.type)}
                      <span className={styles.fileName} title={file.name}>
                        {file.name}
                      </span>
                      <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      <button type="button" className={styles.removeButton} onClick={() => handleRemoveFile(index)}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    // <div key={index} className={styles.fileItem}>
                    //   <div className="d-flex align-items-center gap-1">
                    //     {getFileIconByType(file.type)}
                    //     <div className="w-100">
                    //       <span title={file.name} className={styles.fileName}>
                    //         {file.name}
                    //       </span>
                    //       <br />
                    //       <span className="fontgray font12">{formatFileSize(file.size)}</span>
                    //     </div>
                    //   </div>
                    //   <button type="button" className={styles.removeButton} onClick={() => handleRemoveFile(index)}>
                    //     <X />
                    //   </button>
                    // </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={setShow}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Submit Ticket
            </button>
          </div>
        </form>

        <button type="button" className={styles.closeButton} onClick={setShow}>
          <svg className={styles.closeIcon} viewBox="0 0 24 24">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className={styles.srOnly}>Close</span>
        </button>
      </div>
      <ThemeLoader show={loading} fixed />
    </OverlayModal>
  );
};

export default CreateTicketForm;
