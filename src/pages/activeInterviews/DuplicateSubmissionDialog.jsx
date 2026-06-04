import React from "react";
import { AlertTriangle, FileText } from "lucide-react";
import styles from "./DuplicateSubmissionDialog.module.css";

export default function DuplicateSubmissionDialog({ open, onCancel, onCreateNew, onUpdateExisting, hideExisting }) {
  let duplidateData = open?.existing_record || {};
  if (!open || !open?.existing_record) return null;

  return (
    <>
      <div className={styles.overlay} aria-hidden="true"></div>

      <div
        role="alertdialog"
        aria-describedby="duplicate-desc"
        aria-labelledby="duplicate-title"
        className={styles.dialog}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id="duplicate-title" className={styles.title}>
            <AlertTriangle className={styles.alertIcon} />
            Duplicate Submission Found
          </h2>
        </div>

        <div id="duplicate-desc" className={styles.body}>
          <p className={styles.muted}>{open?.message}</p>

          <div className={styles.existingBox}>
            <div className={styles.existingHeader}>
              <FileText className={styles.fileIcon} />
              <span className={styles.existingTitle}>Your Existing Submission</span>
            </div>

            <div className={styles.grid}>
              <div>
                <span className={styles.label}>Candidate:</span>
                <div className={styles.value}>{duplidateData?.candidate_full_name || "N/A"}</div>
              </div>

              <div>
                <span className={styles.label}>Client:</span>
                <div className={styles.value}>{duplidateData?.client_name || "N/A"}</div>
              </div>

              <div>
                <span className={styles.label}>Status:</span>
                <div className={styles.value}>{duplidateData?.submission_status || "N/A"}</div>
              </div>

              <div>
                <span className={styles.label}>Submission Date:</span>
                <div className={styles.value}>{duplidateData?.submission_date || "N/A"}</div>
              </div>

              <div>
                <span className={styles.label}>Recruiter:</span>
                <div className={styles.value}>{duplidateData?.from_email || "N/A"}</div>
              </div>

              <div>
                <span className={styles.label}>Rate:</span>
                <div className={styles.value}>{duplidateData?.rate || "N/A"}</div>
              </div>

              {/* <div className={styles.full}>
                <span className={styles.label}>Technology:</span>
                <div className={styles.value}>{duplidateData?.technology || "N/A"}</div>
              </div> */}
            </div>
          </div>

          <p className={styles.question}>What would you like to do?</p>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`}>
            Cancel
          </button>

          <button type="button" onClick={onCreateNew} className={`${styles.btn} ${styles.btnOutline}`}>
            Create New Entry Anyway
          </button>

          {!hideExisting ? (
            <button type="button" onClick={onUpdateExisting} className={`${styles.btn} ${styles.btnPrimary}`}>
              Update Existing (Recommended)
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
