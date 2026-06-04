import { useEffect, useState } from "react";

import { CheckCircle, AlertCircle, FileText, File, FileImage, FileSpreadsheet, FileArchive } from "lucide-react";

const styles = {};

const getFileIconByName = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) return <FileImage className={styles.iconSm} />;

  if (["zip", "rar", "tar", "gz", "gzip", "7z"].includes(ext)) return <FileArchive className={styles.iconSm} />;

  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return <FileSpreadsheet className={styles.iconSm} />;

  if (["doc", "docx", "rtf", "odt"].includes(ext)) return <FileText className={styles.iconSm} />;

  if (ext === "pdf") return <FileText className={`text-danger ${styles.iconSm}`} />;

  return <FileText className={styles.iconSm} />;
};
const UploadStatusModal = ({ uploadFiles }) => {
  const anyUploading = uploadFiles.some((f) => f.status === "uploading" || f.status === "pending");

  const allUploaded = uploadFiles.every((f) => f.status === "uploaded");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (uploadFiles?.length) {
      setVisible(true);
    }
  }, [uploadFiles?.length]);

  useEffect(() => {
    if (!anyUploading && allUploaded) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else if (uploadFiles?.length) {
      setVisible(true);
    }
  }, [anyUploading, allUploaded]);

  if (!visible) return null;

  const fileItem = (fileObj) => {
    return (
      <div className="d-flex gap-2 align-items-center mb-2">
        {getFileIconByName(fileObj?.file?.file_name || fileObj.file.name)}
        {fileObj.file.file_name || fileObj.file.name}
      </div>
    );
  };

  return (
    <div
      className="modal fade show d-block hidemodalclosebtn"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="uploadStatusModalTitle"
      aria-describedby="uploadStatusModalDesc"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content" style={{ maxWidth: "90%", marginLeft: "auto", marginRight: "auto" }}>
          <div className="modal-header">
            <h5 className="modal-title" id="uploadStatusModalTitle">
              Upload Status
            </h5>
          </div>
          <div className="modal-body" style={{ maxHeight: "70vh", overflow: "auto" }} id="uploadStatusModalDesc">
            <div className="list-group" role="list">
              {uploadFiles.map((fileObj, index) => {
                const isPending = fileObj.status === "pending";
                const isUploading = fileObj.status === "uploading";
                const isUploaded = fileObj.status === "uploaded";
                const isError = fileObj.status === "error";

                return (
                  <div
                    key={index}
                    className="list-group-item d-flex align-items-center justify-content-between"
                    role="listitem"
                    style={{ minHeight: "80px" }}
                    aria-label={`${fileObj.file.file_name || fileObj.file.name} upload status`}
                  >
                    <div className="w-100">
                      {fileItem(fileObj)}
                      {isUploaded || isError ? (
                        <></>
                      ) : (
                        <>
                          <div className="w-100">
                            <div
                              className={`progress ${isPending ? "progress-bar-striped progress-bar-animated" : ""}`}
                              style={{ height: "8px" }}
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={isUploading ? fileObj.percent || 0 : undefined}
                            >
                              <div
                                className="progress-bar"
                                style={{
                                  width: isUploading ? `${fileObj.percent || 0}%` : "0%",
                                }}
                              />
                            </div>
                          </div>
                          <small className="text-muted mt-1">
                            {isUploading ? `Uploading... ${fileObj.percent || 0}%` : "Pending..."}
                          </small>
                        </>
                      )}
                    </div>

                    {isUploaded && (
                      <span className="text-success fw-semibold">
                        <CheckCircle />
                      </span>
                    )}
                    {isError && (
                      <span className="text-danger fw-semibold">
                        <AlertCircle />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* {allUploaded && (
              <div className="mt-3 text-success d-flex align-items-center" role="alert" aria-live="polite">
                <CheckCircle className="me-2" aria-hidden="true" />
                All files uploaded successfully!
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStatusModal;
