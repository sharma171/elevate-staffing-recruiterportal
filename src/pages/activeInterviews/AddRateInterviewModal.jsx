import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./AddRateInterviewModal.module.css";
import { X, Search, ArrowLeft, CircleCheck, FileText, CheckCircle2, ChevronDown } from "lucide-react";
import { useAuth } from "../../authContext";
import moment from "moment";
import OverlayModal from "../../components/OverlayModal";
import { SelectPicker, DatePicker } from "rsuite";
import { axiosApi, ThemeLoader } from "../../components";
import { toast } from "react-toastify";

const API_URL = "https://us-central1-recruiterportal.cloudfunctions.net/Fetch_Update_Rate_Confirmations_v3";

const normalizeDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const GetStatusBadge = (status) => {
  let style = {};

  switch (status) {
    case "submitted to vendor":
      style = { backgroundColor: "#e0f2fe", color: "#0369a1" };
      break;

    case "under review":
      style = { backgroundColor: "#fef3c7", color: "#92400e" };
      break;

    case "Shortlisted":
      style = { backgroundColor: "#dcfce7", color: "#166534" };
      break;

    case "Not Shortlisted":
      style = { backgroundColor: "#fee2e2", color: "#991b1b" };
      break;

    case "Technical Screening":
      style = { backgroundColor: "#ede9fe", color: "#5b21b6" };
      break;

    case "Interview Round 1":
      style = { backgroundColor: "#cffafe", color: "#155e75" };
      break;

    case "Interview Round 2":
      style = { backgroundColor: "#dbeafe", color: "#1e40af" };
      break;

    case "Interview Round 3":
      style = { backgroundColor: "#e0e7ff", color: "#3730a3" };
      break;

    case "Interview Rejected":
      style = { backgroundColor: "#fecaca", color: "#7f1d1d" };
      break;

    case "Client Round":
      style = { backgroundColor: "#d1fae5", color: "#065f46" };
      break;

    default:
      style = {};
  }

  return (
    <div className={styles.statusBadge} style={style}>
      {status}
    </div>
  );
};

const TIMEZONES = ["EST", "CST", "MST", "PST"];

const INTERVIEW_STAGES = [
  "Technical Screening",
  "Interview Round 1",
  "Interview Round 2",
  "Interview Round 3",
  "Interview Rejected",
];

const ScheduleInterviewPopup = ({ onClose, onBack, onSuccess, selectedRate = {} }) => {
  const [form, setForm] = useState({
    stage: null,
    dateTime: null,
    timezone: "EST",
    panelMembers: "",
    comments: "",
    client_name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setloading] = useState(false);

  const { user } = useAuth();
  let adminEmail = user?.email;
  // adminEmail = "marketing@4spheresolutions.com";

  useEffect(() => {
    if (Object.keys(selectedRate)) {
      setForm({
        stage: selectedRate?.submission_status,
        dateTime: normalizeDate(selectedRate?.interview_date_time),
        timezone: selectedRate?.interview_timezone || "EST",
        panelMembers: selectedRate?.interview_panel_members,
        comments: "",
        client_name: selectedRate?.client_name,
      });
    }
  }, [JSON.stringify(selectedRate)]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.stage) newErrors.stage = "Interview stage is required";
    if (!form.dateTime) newErrors.dateTime = "Interview date & time is required";
    if (!form.timezone) newErrors.timezone = "Timezone is required";
    if (form.panelMembers && form.panelMembers.length < 3)
      newErrors.panelMembers = "Panel members must be at least 3 characters";
    if (form.comments && form.comments.length > 500) newErrors.comments = "Comments cannot exceed 500 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scheduleInterview = () => {
    if (!validate()) return;

    let payload = {
      emailid: adminEmail,
      modify: {
        id: selectedRate?.id,
        columns: {
          submission_status: form.stage,
          interview_date_time: form.dateTime,
          interview_timezone: form.timezone,
          interview_panel_members: form.panelMembers,
          client_name: form.client_name,
          comments: form.comments,
        },
      },
    };

    setloading(true);

    axiosApi
      .post(API_URL, payload)
      .then(({ data }) => {
        toast.success(data?.message);
        onSuccess?.();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed");
      })
      .finally(() => {
        setloading(false);
      });
  };

  const stageOptions = INTERVIEW_STAGES.map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: s,
  }));

  const timezoneOptions = TIMEZONES.map((z) => ({ label: z, value: z }));

  return (
    <OverlayModal
      onClose={onClose}
      isActive={true}
      style={{ maxWidth: "700px" }}
      modalStyle={{ backgroundColor: "#fff" }}
    >
      <div>
        <div className="d-flex justify-content-between gap-2">
          <div>
            <h2 className={styles.title}>Schedule Interview</h2>
            <p className={styles.description}>Add interview details for the selected candidate</p>
          </div>
          <button className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className={styles.schedule_successBox}>
          <CheckCircle2 className={styles.schedule_successIcon} />
          <div>
            <p className={styles.schedule_successTitle}>Selected Rate Confirmation</p>
            <p className={`text-success ${styles.schedule_successText}`}>
              <strong className="text-success">{selectedRate?.candidate_full_name}</strong> at{" "}
              <strong className="text-success">{selectedRate?.client_name}</strong>
            </p>
            <p className={`fw-medium ${styles.schedule_successSub}`}>
              {selectedRate?.technology || "N/A"} • {selectedRate?.rate || "N/A"}
            </p>
          </div>
        </div>

        <div className={styles.schedule_grid}>
          <div className={styles.schedule_field}>
            <label>
              Interview Stage <span className="text-danger">*</span>
            </label>
            <SelectPicker
              className="bigHoverInputr"
              searchable={false}
              cleanable={false}
              data={stageOptions}
              value={form.stage}
              onChange={(value) => handleChange("stage", value)}
              placeholder="Select Stage"
              block
            />
            {errors.stage && <span className="text-danger">{errors.stage}</span>}
          </div>
          <div className={styles.schedule_field}>
            <label>
              Interview Date & Time <span className="text-danger">*</span>
            </label>
            <DatePicker
              className="bigHoverInputr"
              value={form.dateTime || ""}
              onChange={(value) => handleChange("dateTime", value)}
              format="MM/dd/yyyy HH:mm"
              placeholder="MM/DD/YYYY HH:MM"
              block
              cleanable={false}
            />
            {errors.dateTime && <span className="text-danger">{errors.dateTime}</span>}
          </div>
          <div className={styles.schedule_field}>
            <label>
              Timezone <span className="text-danger">*</span>
            </label>
            <SelectPicker
              className="bigHoverInputr"
              searchable={false}
              cleanable={false}
              data={timezoneOptions}
              value={form.timezone}
              onChange={(value) => handleChange("timezone", value)}
              block
            />
            {errors.timezone && <span className="text-danger">{errors.timezone}</span>}
          </div>

          <div className={styles.schedule_field}>
            <label>Client Name</label>
            <input
              className="bigHoverInput form-control"
              value={form.client_name}
              onChange={(e) => handleChange("client_name", e.target.value)}
              placeholder="Jane Smith, Bob Wilson"
            />
            {errors.client_name && <span className="text-danger">{errors.client_name}</span>}
          </div>

          <div className={styles.schedule_field} style={{ gridColumn: "1 / -1" }}>
            <label>Panel Members</label>
            <input
              className="bigHoverInput form-control"
              value={form.panelMembers}
              onChange={(e) => handleChange("panelMembers", e.target.value)}
              placeholder="Jane Smith, Bob Wilson"
            />
            {errors.panelMembers && <span className="text-danger">{errors.panelMembers}</span>}
          </div>

          <div className={`${styles.schedule_field} ${styles.schedule_full}`}>
            <label>Comments</label>
            <textarea
              className="bigHoverInput form-control"
              rows="3"
              value={form.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              placeholder="Additional notes..."
            />
            {errors.comments && <span className="text-danger">{errors.comments}</span>}
          </div>
        </div>

        <div className={styles.schedule_footer}>
          <button onClick={onBack} className={`${styles.button} ${styles.backBtn}`}>
            <ArrowLeft size={16} />
            Back
          </button>

          <button className={`${styles.button} ${styles.cancelBtn}`} onClick={onClose}>
            Cancel
          </button>

          <button className={styles.schedule_primary} onClick={scheduleInterview}>
            Schedule Interview
          </button>
        </div>
      </div>
      <ThemeLoader show={loading} fixed />
    </OverlayModal>
  );
};
export default function AddRateInterviewModal({ isActive, onBack, onClose }) {
  const [searchText, setSearchText] = useState("");
  const [rateList, setRateList] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  let adminEmail = user?.email;
  // adminEmail = "marketing@4spheresolutions.com";

  const debounceRef = useRef(null);

  useEffect(() => {
    setSearchText("");
    setSelectedRate(null);
  }, [isActive]);

  const fetchRates = (search) => {
    setLoading(true);

    axios
      .post(API_URL, {
        emailid: adminEmail,
        page: 1,
        page_size: 20,
        search_candidate: search,
      })
      .then((res) => {
        const data = res?.data?.data || {};
        setRateList(Object.values(data));
      })
      .catch(() => {
        setRateList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchText.length >= 3) {
        fetchRates(searchText);
      } else {
        setRateList([]);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchText]);

  if (!isActive) {
    return null;
  }

  if (selectedRate) {
    return (
      <ScheduleInterviewPopup
        onSuccess={() => onClose(true)}
        selectedRate={selectedRate}
        onClose={onClose}
        onBack={() => setSelectedRate()}
      />
    );
  }

  const renderEmptyView = () => {
    let isActive = searchText.length < 3 || loading || !rateList.length;

    if (!isActive) {
      return <></>;
    }

    let icon = null;
    let text = "";

    if (searchText.length < 3) {
      icon = <Search className="mb-2 opacity-50" size={35} />;
      text = "Type at least 3 characters to search";
    } else if (loading) {
      icon = <div className="spinner-border mb-2" role="status" />;
      text = "Searching...";
    } else {
      icon = <FileText className="mb-2 opacity-50" size={35} />;
      text = "No rate confirmations found";
    }

    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="d-flex flex-column align-items-center justify-content-center h-100 py-3 text-muted">
          {icon}
          <p style={{ fontSize: "16px" }}>{text}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.overlay} />

      <div className={styles.dialog} role="dialog" tabIndex={-1}>
        <div className="d-flex justify-content-between gap-2">
          <div>
            <h2 className={styles.title}>Select Rate Confirmation</h2>
            <p className={styles.description}>
              Search and select an existing rate confirmation to schedule an interview
            </p>
          </div>
          <button className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              className={`bigHoverInput ${styles.searchInput}`}
              placeholder="Search by candidate name (min 3 characters)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className={styles.scrollArea}>
            <div className={styles.list}>
              {renderEmptyView()}

              {!loading &&
                rateList.map((item, index) => (
                  <div key={index} className={`pointer ${styles.listItem}`} onClick={() => setSelectedRate(item)}>
                    <div className={styles.itemContent}>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <p className={styles.candidateName}>{item.candidate_full_name}</p>
                        {selectedRate?.id === item.id && <CircleCheck className={styles.checkIcon} />}
                      </div>

                      <div className="gridContainertwoView gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className={styles.label}>Client:</span>
                          <span className={styles.value}>{item.client_name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={styles.label}>Email:</span>
                          <span className={styles.vendor}>{item.candidate_email_id}</span>
                        </div>

                        {item.technology ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className={styles.label}>Technology:</span>
                            <span className={styles.submittedBy}>{item.technology}</span>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className="d-flex align-items-center gap-2">
                          <span className={styles.label}>Rate:</span>
                          <span className={styles.rate}>{item.rate}</span>
                        </div>

                        {item.submission_status ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className={styles.label}>Current Status:</span>
                            {GetStatusBadge(item.submission_status)}
                          </div>
                        ) : (
                          <></>
                        )}
                        {item.submission_date ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className={styles.label}>Submitted on:</span>
                            <span className="fw-semibold">{moment(item.submission_date).format("MMM DD, YYYY")}</span>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={`${styles.button} ${styles.backBtn}`} onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <button className={`${styles.button} ${styles.cancelBtn}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
