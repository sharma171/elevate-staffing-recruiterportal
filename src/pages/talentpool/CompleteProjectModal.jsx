import { useEffect, useState } from "react";
import styles from "./css/CompleteProjectModal.module.css";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { OverlayModal } from "../../components";

export default function CompleteProjectModal({ open, onOpenChange, onComplete, project }) {
  const [loading, setLoading] = useState(false);
  const [projectEndDate, setProjectEndDate] = useState(null);
  const [employmentEndDate, setEmploymentEndDate] = useState(null);
  const [completionReason, setCompletionReason] = useState("");
  const [notes, setNotes] = useState("");

  const projectStartDateObj = project?.project_start_date ? new Date(project.project_start_date) : null;
  const minProjectEndDate = projectStartDateObj ? new Date(projectStartDateObj) : null;
  if (minProjectEndDate) minProjectEndDate.setDate(minProjectEndDate.getDate() + 1);

  useEffect(() => {
    setNotes("");
    setCompletionReason("");
    setEmploymentEndDate(null);
    setProjectEndDate(null);
  }, [open]);

  const completionReasons = [
    { value: "contract_completed", label: "Contract Completed Successfully" },
    { value: "contract_not_renewed", label: "Contract Not Renewed" },
    { value: "terminated_by_client", label: "Terminated by Client" },
    { value: "candidate_resignation", label: "Candidate Resignation" },
    { value: "budget_cuts", label: "Budget Cuts" },
    { value: "project_cancelled", label: "Project Cancelled" },
    { value: "other", label: "Other" },
  ];

  const formatDate = (date) => {
    if (!date) return "";
    return format(date, "MM/dd/yyyy");
  };

  const handleSubmit = () => {
    if (!projectEndDate) {
      toast.error("Please select a project end date");
      return;
    }

    if (projectStartDateObj && projectEndDate <= projectStartDateObj) {
      toast.error("Project end date must be after project start date");
      return;
    }

    if (!completionReason) {
      toast.error("Please select a Reason");
      return;
    }

    setLoading(true);

    let endDateStr = formatDate(projectEndDate);

    const nextDay = new Date(projectEndDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const benchStartDate = format(nextDay, "yyyy-MM-dd");

    onComplete(project.id, {
      project_end_date: endDateStr,
      employment_end_date: formatDate(employmentEndDate || projectEndDate),
      bench_start_date: benchStartDate,
      project_comments: notes || undefined,
      termination_reason: completionReason || undefined,
    })
      .then((res) => {
        toast.success(res?.data?.message || "Project completed successfully");
        setProjectEndDate(null);
        setEmploymentEndDate(null);
        setCompletionReason("");
        setNotes("");
        onOpenChange(false);
      })
      .catch((err) => {
        toast.error("Failed to complete project");
      })
      .finally(() => setLoading(false));
  };

  const handleProjectEndDateChange = (date) => {
    setProjectEndDate(date);
  };

  if (!open) return null;

  return (
    <OverlayModal
      isActive={open}
      onClose={() => onOpenChange(false)}
      style={{ maxWidth: "650px" }}
      modalStyle={{ background: "#fff" }}
    >
      <div>
        <div className="mb-3">
          <div className="h4 m-0 fw-bold">Complete Project</div>

          <p className={styles.description}>
            Mark "{project.job_title}" at {project.client_name} as completed.
          </p>
        </div>

        <div className={styles.form}>
          <div>
            <div className={`mb-3 ${styles.grid2}`}>
              <div className={styles.field} style={{ height: "62px" }}>
                <label className="fw-bold">Project End Date *</label>
                <DatePicker
                  selected={projectEndDate}
                  onChange={handleProjectEndDateChange}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="MM/DD/YYYY"
                  className="form-control bigHoverInput"
                  required
                  minDate={minProjectEndDate}
                />
              </div>

              <div className={styles.field} style={{ height: "62px" }}>
                <label className="fw-bold">Employment End Date</label>
                <DatePicker
                  minDate={minProjectEndDate}
                  selected={employmentEndDate}
                  onChange={(d) => setEmploymentEndDate(d)}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="MM/DD/YYYY"
                  className="form-control bigHoverInput"
                />
              </div>
            </div>

            <div className={`mb-3 ${styles.field}`}>
              <label className="fw-bold">Completion Reason *</label>
              <select
                value={completionReason}
                onChange={(e) => setCompletionReason(e.target.value)}
                className="form-select bigHoverInput"
                required
              >
                <option value="">Select a reason</option>
                {completionReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`mb-3 ${styles.field}`}>
              <label className="fw-bold">Notes</label>
              <textarea
                className="form-control bigHoverInput"
                rows="2"
                placeholder="Add any additional notes about the project completion..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className={styles.noteBox}>
            <strong>Note:</strong> After completing this project, the candidate will be marked as "On Bench" starting
            from the day after the project end date.
          </div>

          <div className={`mt-3 ${styles.footer}`}>
            <button type="button" disabled={loading} className={styles.cancelBtn} onClick={() => onOpenChange(false)}>
              Cancel
            </button>

            <button
              type="button"
              disabled={!projectEndDate || !completionReason || loading}
              className="themeButton themeButtonHover px-3 py-2 rounded"
              onClick={handleSubmit}
            >
              {loading && <Loader2 size={16} className={styles.spinner} />}
              Complete Project
            </button>
          </div>
        </div>
      </div>
    </OverlayModal>
  );
}
