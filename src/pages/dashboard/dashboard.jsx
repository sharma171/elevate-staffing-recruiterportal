import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eye,
  Building,
  XCircle,
  Shield,
  FileText,
  FileClock,
  FileX,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import axiosApi from "../../components/axiosApi";
import { useAuth } from "../../authContext";
import Themeloader from "../../components/ThemeLoader";
import { Placeholder } from "rsuite";
import ViewDetailsModal from "./ViewDetailsModal";

const convertKeyValue = (data = {}, key1 = "name", key2 = "count") => {
  return Object.entries(data).map(([name, count]) => ({
    [key1]: name,
    [key2]: count,
  }));
};

function SmallStatCard({ count, title, styleConfig, onClick }) {
  return (
    <div
      className={styles["visa-type-card"]}
      style={{
        border: `1px solid ${styleConfig.borderColor}`,
        background: styleConfig.background,
        cursor: "pointer",
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.cardIcon}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: styleConfig.iconBg,
          }}
        >
          {styleConfig.icon}
        </div>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: styleConfig.titleColor, marginBottom: 6 }}>{count}</div>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: styleConfig.titleColor, marginBottom: 10 }}>{title}</div>
      <div
        className={`pointer d-flex flex-row mx-auto ${styles.viewDetailsBtn}`}
        style={{ color: styleConfig.titleColor, padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}
      >
        <Eye style={{ width: 16, height: 16, marginRight: 8 }} /> View Details
      </div>
    </div>
  );
}

const APIENDPOINT = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Details_Frontend_Dashboard_v3";

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data } = JSON.parse(stored);

  return String(data?.modules?.dashboard?.filterAccess).toLocaleLowerCase();
}

export default function EmployerDashboard() {
  const [openTalentCard, setOpenTalentCard] = useState(false);
  const [openEmployeeAccounts, setOpenEmployeeAccounts] = useState(false);
  const [openCompliance, setOpenCompliance] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [openTimesheet, setOpenTimesheet] = useState(false);
  const [openWeeklyReports, setOpenWeeklyReports] = useState(false);
  const [loading, setloading] = useState(false);
  const [openCategories, setOpenCategories] = useState({
    active: false,
    available: false,
    inactive: false,
    pending: false,
    unknown: false,
  });

  const [openModal, setOpenModal] = useState("");
  const [apiData, setApiData] = useState({});

  const { user } = useAuth();
  const adminEmail = user?.email;

  let isAllPermitions = getPermissions() == "all";

  if (String(user?.user_role).toLowerCase() == "super admin") {
    isAllPermitions = true;
  }

  let {
    account_status_summary = {},
    active_candidates_overall = 0,
    assigned_candidates_recruiter = 0,
    i9_everify_compliance: i9EverifyCompliance = {},
    rate_confirmations_overall = 0,
    rate_confirmations_recruiter = 0,
    talent_visa_metrics: talentVisaMetrics = {},
    timesheet_compliance = {},
    weekly_compliance = {},
    document_compliance = {},
  } = apiData;

  let { combined_compliance = {}, everify_breakdown = {}, i9_form_breakdown = {} } = i9EverifyCompliance;

  let { talent_status_breakdown: talentStatusBreakdown = {}, visa_status_breakdown: visaStatusBreakdown = {} } =
    talentVisaMetrics;

  let { expiring_soon_documents, expired_documents } = document_compliance;

  let {
    ["Active Talent"]: ActiveTalent = {},
    ["Available Talent"]: AvailableTalent = {},
    ["Inactive Talent"]: InactiveTalent = {},
    ["Pending Talent"]: PendingTalent = {},
    Unknown: UnknownTalent = {},
  } = talentStatusBreakdown;

  let { visa_breakdown: activeTalentVisaBreakdown = {} } = ActiveTalent;

  let { visa_breakdown: availableTalentVisaBreakdown = {} } = AvailableTalent;

  let { visa_breakdown: inactiveTalentVisaBreakdown = {} } = InactiveTalent;

  let { visa_breakdown: pendingTalentVisaBreakdown = {} } = PendingTalent;

  let { visa_breakdown: unknownTalentVisaBreakdown = {} } = UnknownTalent;

  useEffect(() => {
    getdashboardData();
  }, [adminEmail]);

  const getdashboardData = () => {
    if (!adminEmail) {
      return;
    }

    let payload = {
      assigned_recruiter_email: adminEmail,
      task_name: "dashboard_summary",
    };

    setloading(true);
    axiosApi
      .post(APIENDPOINT, payload)
      .then((res) => {
        setApiData(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setloading(false);
      });
  };
  let isApiResult = !!Object.keys(apiData).length;

  const extraAllStats = [
    {
      id: 3,
      title: "Account Coverage",
      value: `${account_status_summary?.account_coverage_percentage || 0}%`,
      note: `${account_status_summary?.with_accounts || 0} with accounts`,
      styleConfig: {
        background: "linear-gradient(135deg,#f97316,#ea580c)",
        borderColor: "#fed7aa",
        iconBg: "linear-gradient(135deg,#f97316,#f59e0b)",
        titleColor: "#fff",
        icon: <UserCheck style={{ opacity: ".9", color: "#fff", width: 20, height: 20 }} />,
      },
    },
    {
      id: 4,
      title: "Missing Timesheets",
      value: timesheet_compliance?.missing || 0,
      note: `For ${timesheet_compliance?.check_period}`,
      styleConfig: {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        borderColor: "#fecaca",
        iconBg: "linear-gradient(135deg,#ef4444,#ec4899)",
        titleColor: "#fff",
        icon: <AlertTriangle style={{ opacity: ".9", color: "#fff", width: 20, height: 20 }} />,
      },
    },
    {
      id: 5,
      title: "Weekly Status Missing",
      value: weekly_compliance?.missing || 0,
      note: weekly_compliance?.check_week || "",
      styleConfig: {
        background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        borderColor: "#ddd6fe",
        iconBg: "linear-gradient(135deg,#8b5cf6,#6366f1)",
        titleColor: "#fff",
        icon: <Clock style={{ opacity: ".9", color: "#fff", width: 20, height: 20 }} />,
      },
    },
  ];

  let stats = [
    {
      id: 1,
      title: "Active Candidates",
      value: active_candidates_overall,
      note: "Total active candidates",
      styleConfig: {
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        borderColor: "#bfdbfe",
        iconBg: "linear-gradient(135deg,#3b82f6,#2563eb)",
        titleColor: "#fff",
        icon: <Users style={{ opacity: ".9", color: "#fff", width: 20, height: 20 }} />,
      },
    },
    {
      id: 2,
      title: "Rate Confirmations",
      value: rate_confirmations_recruiter,
      note: "Confirmed rates",
      styleConfig: {
        background: "linear-gradient(135deg, #10b981, #059669)",
        borderColor: "#a7f3d0",
        iconBg: "linear-gradient(135deg,#10b981,#059669)",
        titleColor: "#fff",
        icon: <CheckCircle style={{ opacity: ".9", color: "#fff", width: 20, height: 20 }} />,
      },
    },
  ];

  if (isAllPermitions) {
    stats = [...stats, ...extraAllStats];
  }

  const talentCategories = [
    {
      key: "active",
      label: "Active Talent",
      count: ActiveTalent?.count || 0,
      badgeClass: "badge-active",
      visas: convertKeyValue(activeTalentVisaBreakdown, "name", "n"),
    },
    {
      key: "available",
      label: "Available Talent",
      count: AvailableTalent?.count || 0,
      badgeClass: "badge-available",
      visas: convertKeyValue(availableTalentVisaBreakdown, "name", "n"),
    },
    {
      key: "inactive",
      label: "Inactive Talent",
      count: InactiveTalent?.count || 0,
      badgeClass: "badge-inactive",
      visas: convertKeyValue(inactiveTalentVisaBreakdown, "name", "n"),
    },
    {
      key: "pending",
      label: "Pending Talent",
      count: PendingTalent?.count || 0,
      badgeClass: "badge-pending",
      visas: convertKeyValue(pendingTalentVisaBreakdown, "name", "n"),
    },
    {
      key: "unknown",
      label: "Unknown",
      count: UnknownTalent?.count || 0,
      badgeClass: "badge-unknown",
      visas: convertKeyValue(unknownTalentVisaBreakdown, "name", "n"),
    },
  ];

  const overallVisa = convertKeyValue(visaStatusBreakdown);

  const employeeAccounts = [
    {
      id: "active",
      title: "Active Accounts",
      count: account_status_summary?.with_accounts || 0,
      filter: "active",
      task: "account_details",
      modalTitle: "Active Employees",
      styleConfig: {
        background: "linear-gradient(to bottom,#ecfdf5,#d1fae5)",
        borderColor: "#a7f3d0",
        iconBg: "linear-gradient(135deg,#10b981,#059669)",
        titleColor: "#065f46",
        icon: <CheckCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "no",
      title: "No Accounts",
      count: account_status_summary?.without_accounts || 0,
      filter: "no_account",
      task: "account_details",
      modalTitle: "Employees without Account Setup (Provide Employment End Date if no longer working for your company)",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff7ed,#ffedd5)",
        borderColor: "#fed7aa",
        iconBg: "linear-gradient(135deg,#f97316,#f59e0b)",
        titleColor: "#92400e",
        icon: <AlertTriangle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "remove",
      title: "Need Removal",
      count: account_status_summary?.need_removal || 0,
      filter: "need_removal",
      task: "account_details",
      modalTitle: "Employment Terminated - Need Account Removal",
      styleConfig: {
        background: "linear-gradient(to bottom,#f3e8ff,#ede9fe)",
        borderColor: "#ddd6fe",
        iconBg: "linear-gradient(135deg,#8b5cf6,#6366f1)",
        titleColor: "#4f46e5",
        icon: <XCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
  ];

  const timesheetCards = [
    {
      id: "submitted",
      title: "Submitted",
      count: timesheet_compliance?.submitted || 0,
      filter: "submitted",
      task: "timesheet_details",
      modalTitle: "Employees with Submitted Timesheets",
      styleConfig: {
        background: "linear-gradient(to bottom,#ecfdf5,#d1fae5)",
        borderColor: "#a7f3d0",
        iconBg: "linear-gradient(135deg,#10b981,#059669)",
        titleColor: "#065f46",
        icon: <CheckCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "missing",
      title: "Missing",
      count: timesheet_compliance?.missing || 0,
      filter: "missing",
      task: "timesheet_details",
      modalTitle: "Employees with Missing Timesheets",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff1f2,#fee2e2)",
        borderColor: "#fecaca",
        iconBg: "linear-gradient(135deg,#ef4444,#ec4899)",
        titleColor: "#991b1b",
        icon: <XCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "noAccount",
      title: "No Account",
      count: timesheet_compliance?.no_account || 0,
      filter: "no_account",
      task: "timesheet_details",
      modalTitle: "Employees without Account Setup (Provide Employment End Date if no longer working for your company)",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff7ed,#ffedd5)",
        borderColor: "#fed7aa",
        iconBg: "linear-gradient(135deg,#f97316,#f59e0b)",
        titleColor: "#92400e",
        icon: <AlertTriangle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "needRemoval",
      title: "Need Removal",
      count: timesheet_compliance?.need_access_removal || 0,
      filter: "need_removal",
      task: "account_details",
      modalTitle: "Employment Terminated - Timesheet Access Removal",
      styleConfig: {
        background: "linear-gradient(to bottom,#f3e8ff,#ede9fe)",
        borderColor: "#ddd6fe",
        iconBg: "linear-gradient(135deg,#8b5cf6,#6366f1)",
        titleColor: "#4f46e5",
        icon: <XCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
  ];

  const weeklyReportCards = [
    {
      id: "submitted",
      title: "Submitted",
      count: weekly_compliance?.submitted || 0,
      filter: "submitted",
      task: "weekly_details",
      modalTitle: "Employees with Submitted Weekly Reports",
      styleConfig: {
        background: "linear-gradient(to bottom,#eff6ff,#e0f2fe)",
        borderColor: "#bfdbfe",
        iconBg: "linear-gradient(135deg,#3b82f6,#2563eb)",
        titleColor: "#1e3a8a",
        icon: <CheckCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "missing",
      title: "Missing",
      count: weekly_compliance?.missing || 0,
      filter: "missing",
      task: "weekly_details",
      modalTitle: "Employees with Missing Weekly Reports",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff1f2,#fee2e2)",
        borderColor: "#fecaca",
        iconBg: "linear-gradient(135deg,#ef4444,#ec4899)",
        titleColor: "#991b1b",
        icon: <XCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "noAccess",
      title: "No Access",
      count: weekly_compliance?.no_account || 0,
      filter: "no_account",
      task: "weekly_details",
      modalTitle: "Employees without Weekly Access Setup",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff7ed,#ffedd5)",
        borderColor: "#fed7aa",
        iconBg: "linear-gradient(135deg,#f97316,#f59e0b)",
        titleColor: "#92400e",
        icon: <AlertTriangle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
    {
      id: "needRemoval",
      title: "Need Removal",
      count: weekly_compliance?.need_access_removal || 0,
      filter: "need_removal",
      task: "account_details",
      modalTitle: "Employment Terminated - Weekly Access Removal",
      styleConfig: {
        background: "linear-gradient(to bottom,#f3e8ff,#ede9fe)",
        borderColor: "#ddd6fe",
        iconBg: "linear-gradient(135deg,#8b5cf6,#6366f1)",
        titleColor: "#4f46e5",
        icon: <XCircle style={{ color: "#fff", width: 25, height: 25 }} />,
      },
    },
  ];

  const complianceSummary = [
    {
      id: "fully",
      title: "Fully Compliant",
      count: combined_compliance?.fully_compliant || 0,
      filter: "fully_compliant",
      task: "i9_everify_details",
      modalTitle: "Fully Compliant Employees",
      styleConfig: {
        background: "#f0fdf4",
        borderColor: "#86efac",
        titleColor: "#065f46",
        icon: <CheckCircle style={{ color: "#065f46" }} />,
      },
    },
    {
      id: "partial",
      title: "Partially Compliant",
      count: combined_compliance?.partially_compliant || 0,
      filter: "partially_compliant",
      task: "i9_everify_details",
      modalTitle: "Partially Compliant Employees",
      styleConfig: {
        background: "#fffbeb",
        borderColor: "#fde68a",
        titleColor: "#b45309",
        icon: <Clock style={{ color: "#b45309" }} />,
      },
    },
    {
      id: "non",
      title: "Non-Compliant",
      count: combined_compliance?.non_compliant || 0,
      filter: "non_compliant",
      task: "i9_everify_details",
      modalTitle: "Non-Compliant Employees",
      styleConfig: {
        background: "linear-gradient(to bottom,#fff1f2,#fee2e2)",
        borderColor: "#fecaca",
        titleColor: "#b91c1c",
        icon: <AlertTriangle style={{ color: "#b91c1c" }} />,
      },
    },
  ];

  const i9Status = [
    {
      id: "completed",
      label: "Completed",
      count: i9_form_breakdown?.Completed || 0,
      filter: "completed",
      task: "i9_everify_details",
      modalTitle: "I-9 Form Completed",
      styleConfig: {
        background: "#f0fdf4",
        borderColor: "#86efac",
        titleColor: "#065f46",
        icon: <CheckCircle style={{ color: "#10b981" }} />,
      },
    },
    {
      id: "pending",
      label: "Pending",
      count: i9_form_breakdown?.Pending || 0,
      filter: "pending",
      task: "i9_everify_details",
      modalTitle: "I-9 Form Pending",
      styleConfig: {
        background: "#fffbeb",
        borderColor: "#fde68a",
        titleColor: "#b45309",
        icon: <Clock style={{ color: "#f59e0b" }} />,
      },
    },
    {
      id: "unknown",
      label: "Unknown",
      count: i9_form_breakdown?.Unknown || 0,
      filter: "unknown",
      task: "i9_everify_details",
      modalTitle: "I-9 Form Unknown",
      styleConfig: {
        background: "linear-gradient(to bottom,#f9fafb,#f3f4f6)",
        borderColor: "#e5e7eb",
        titleColor: "#374151",
        icon: <FileText style={{ color: "#6b7280" }} />,
      },
    },
    {
      id: "generated",
      label: "Generated",
      count: i9_form_breakdown?.generated || 0,
      filter: "generated",
      task: "i9_everify_details",
      modalTitle: "I-9 Form Generated",
      styleConfig: {
        background: "linear-gradient(to bottom,#f9fafb,#f3f4f6)",
        borderColor: "#e5e7eb",
        titleColor: "#374151",
        icon: <FileText style={{ color: "#6b7280" }} />,
      },
    },
  ];

  const everifyStatus = [
    {
      id: "completed",
      label: "Completed",
      count: everify_breakdown?.Completed || 0,
      filter: "completed",
      task: "i9_everify_details",
      modalTitle: "E-Verify Completed",
      styleConfig: {
        background: "#f0fdf4",
        borderColor: "#86efac",
        titleColor: "#065f46",
        icon: <CheckCircle style={{ color: "#10b981" }} />,
      },
    },
    {
      id: "pending",
      label: "Pending",
      count: everify_breakdown?.Pending || 0,
      filter: "pending",
      task: "i9_everify_details",
      modalTitle: "E-Verify Pending",
      styleConfig: {
        background: "#fffbeb",
        borderColor: "#fde68a",
        titleColor: "#b45309",
        icon: <Clock style={{ color: "#f59e0b" }} />,
      },
    },
    {
      id: "unknown",
      label: "Unknown",
      count: everify_breakdown?.Unknown || 0,
      filter: "unknown",
      task: "i9_everify_details",
      modalTitle: "E-Verify Unknown",
      styleConfig: {
        background: "linear-gradient(to bottom,#f9fafb,#f3f4f6)",
        borderColor: "#e5e7eb",
        titleColor: "#374151",
        icon: <AlertTriangle style={{ color: "#6b7280" }} />,
      },
    },
  ];

  const renderDocumentsCard = () => {
    return (
      <div className={styles.document_container}>
        <div className={styles.document_grid}>
          {/* Expiring Soon Card */}
          <div
            onClick={() =>
              setOpenModal({
                modalTitle: "Document Details - Expiring Soon Documents",
                task_name: "document_details",
                filter: "expiring_soon",
              })
            }
            className={`${styles.document_card} ${styles.document_yellow}`}
          >
            <div className={styles.document_cardInner}>
              <div className={styles.document_cardHeader}>
                <div className={styles.document_iconWrapper}>
                  <FileClock className={styles.document_iconYellow} />
                </div>
                <div className={styles.document_textRight}>
                  <div className={styles.document_countYellow}>{expiring_soon_documents?.count || 0}</div>
                  <div className={styles.document_labelYellow}>Documents</div>
                </div>
              </div>
              <div className={styles.document_cardFooter}>
                <h4 className={styles.document_titleYellow}>Expiring Soon</h4>
                <Eye className={styles.document_eyeYellow} />
              </div>
              <p className={styles.document_subtitleYellow}>Within 30 days</p>
            </div>
          </div>

          <div
            onClick={() => {
              setOpenModal({
                modalTitle: "Document Details - Expired Documents",
                task_name: "document_details",
                filter: "expired",
              });
            }}
            className={`${styles.document_card} ${styles.document_red}`}
          >
            <div className={styles.document_cardInner}>
              <div className={styles.document_cardHeader}>
                <div className={styles.document_iconWrapperRed}>
                  <FileX className={styles.document_iconRed} />
                </div>
                <div className={styles.document_textRight}>
                  <div className={styles.document_countRed}>{expired_documents?.count || 0}</div>
                  <div className={styles.document_labelRed}>Documents</div>
                </div>
              </div>
              <div className={styles.document_cardFooter}>
                <h4 className={styles.document_titleRed}>Expired</h4>
                <Eye className={styles.document_eyeRed} />
              </div>
              <p className={styles.document_subtitleRed}>Requires immediate attention</p>
            </div>
          </div>
        </div>

        {/* Total Documents */}
        <div className={styles.document_total}>
          <div className={styles.document_totalRow}>
            <span className={styles.document_totalLabel}>Total Documents:</span>
            <span className={styles.document_totalValue}>
              {expiring_soon_documents?.count + expired_documents?.count}
            </span>
          </div>
        </div>
      </div>
    );
  };

  function toggleCategory(key) {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const renderstatsData = () => {
    return (
      <div className={`${styles["stats-grid"]} ${!isAllPermitions ? styles["stats-grid2cards"] : ""}`}>
        {stats.map((s) => (
          <div
            key={s.id}
            className={`${styles["stat-card"]} ${styles[`stat-card-${s.variant}`]}`}
            style={{
              background: s.styleConfig.background,
              borderColor: s.styleConfig.borderColor,
              color: s.styleConfig.titleColor,
              borderRadius: "12",
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles["stat-card-header"]}>
              <h3>{s.title}</h3>
              {s.styleConfig.icon}
            </div>
            <div className={styles["stat-card-content"]}>
              <div className={styles["stat-number"]}>{s.value}</div>
              <p>{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabsData = () => {
    if (!isApiResult) {
      return <Placeholder.Paragraph rows={5} rowHeight={20} active />;
    }

    if (!isAllPermitions) {
      return renderstatsData();
    }

    return (
      <>
        {renderstatsData()}
        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenTalentCard((s) => !s);
            }}
            className={styles["card-header-expandable"]}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div className={styles["header-icon"]}>
                  <Users size={16} />
                </div>
                <h2>Talent Status & Visa Distribution</h2>{" "}
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openTalentCard ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
            <p className={styles["card-description"]}>Breakdown of talent by status and visa types</p>
          </div>

          {openTalentCard && (
            <div className={styles["card-content"]}>
              <div className={styles["talent-section"]}>
                {talentCategories.map((cat) => (
                  <div
                    className={styles["talent-category"]}
                    onClick={() => {
                      if (!openCategories[cat.key]) {
                        toggleCategory(cat.key);
                      }
                    }}
                    key={cat.key}
                  >
                    <div
                      className={styles["category-header"]}
                      onClick={() => {
                        if (openCategories[cat.key]) {
                          toggleCategory(cat.key);
                        }
                      }}
                    >
                      <div className="d-flex gap-2">
                        <div className={`${styles["category-badge"]} ${styles[cat.badgeClass]}`}>{cat.label}</div>
                        <div className={styles["category-count"]}>{cat.count}</div>
                      </div>
                      <ChevronRight
                        className={`${styles["toggle-icon"]} ${openCategories[cat.key] ? styles.open : ""}`}
                      />
                    </div>

                    {openCategories[cat.key] && (
                      <div className={styles["category-details"]}>
                        <h5>Visa Status Breakdown:</h5>
                        <div className={styles["visa-grid"]}>
                          {cat.visas.map((v, idx) => (
                            <div className={styles["visa-item"]} key={v.name + idx} role="button" tabIndex={0}>
                              <div className={`${styles["visa-color"]} ${styles["color-" + ((idx % 8) + 1)]}`}></div>
                              <span>{v.name}</span>
                              <div className={styles["visa-count"]}>{v.n}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles["overall-visa-section"]}>
                <h4>
                  <div className={styles["title-dot"]}></div>
                  Overall Visa Distribution
                </h4>
                <div className={styles["overall-visa-grid"]}>
                  {overallVisa.map((v) => (
                    <div
                      className={styles["visa-type-card"]}
                      key={v.name}
                      onClick={() => console.log(v.name)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles["visa-icon-container"]}>
                        <CreditCard className={styles["visa-type-icon"]} />
                      </div>
                      <div className={styles["visa-type-count"]}>{v.count}</div>
                      <div className={styles["visa-type-name"]}>{v.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenEmployeeAccounts((s) => !s);
            }}
            className={`${styles.greenGradient} ${styles["card-header-expandable"]}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div className={styles["header-icon"]}>
                  <Building size={16} />
                </div>
                <h2>Employee Account Management</h2>
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openEmployeeAccounts ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
            <p className={styles["card-description"]}>Track employee account setup and management status</p>
          </div>

          {openEmployeeAccounts && (
            <div className={styles["card-content"]}>
              <div
                className={styles["overall-visa-grid"]}
                style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}
              >
                {employeeAccounts.map((ea) => (
                  <SmallStatCard
                    onClick={() => setOpenModal({ modalTitle: ea.modalTitle, filter: ea.filter, task_name: ea.task })}
                    key={ea.id}
                    count={ea.count}
                    title={ea.title}
                    styleConfig={ea.styleConfig}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenTimesheet((s) => !s);
            }}
            className={`${styles.yellowgradient} ${styles["card-header-expandable"]}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div className={styles["header-icon"]}>
                  <FileText size={16} />
                </div>
                <h2>Timesheet Management</h2>
                {timesheet_compliance?.check_period ? (
                  <div className="d-none d-md-block bg-white font12 p-1 px-2 ms-2 rounded" style={{ color: "#b91c1c" }}>
                    {timesheet_compliance?.check_period}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openTimesheet ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>

            <p className={styles["card-description"]}>Monitor timesheet submissions and compliance tracking</p>
          </div>
          {openTimesheet && (
            <div className={styles["card-content"]}>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                {timesheetCards.map((c) => (
                  <SmallStatCard
                    key={c.id}
                    onClick={() => setOpenModal({ modalTitle: c.modalTitle, filter: c.filter, task_name: c.task })}
                    count={c.count}
                    title={c.title}
                    styleConfig={c.styleConfig}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenWeeklyReports((s) => !s);
            }}
            className={styles["card-header-expandable"]}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div className={styles["header-icon"]}>
                  <Clock size={16} />
                </div>
                <h2>Weekly Status Reports</h2>
                {weekly_compliance?.check_week ? (
                  <div className="d-none d-md-block bg-white font12 p-1 px-2 ms-2 rounded" style={{ color: "#4338ca" }}>
                    {weekly_compliance?.check_week}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openWeeklyReports ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
            <p className={styles["card-description"]}>Track weekly status report submissions and follow-ups</p>
          </div>

          {openWeeklyReports && (
            <div className={styles["card-content"]}>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                {weeklyReportCards.map((c) => (
                  <SmallStatCard
                    onClick={() => setOpenModal({ modalTitle: c.modalTitle, filter: c.filter, task_name: c.task })}
                    key={c.id}
                    count={c.count}
                    title={c.title}
                    styleConfig={c.styleConfig}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenCompliance((s) => !s);
            }}
            className={styles["card-header-expandable"]}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div className={styles["header-icon"]}>
                  <Shield size={16} />
                </div>
                <h2>I-9 and E-Verify Compliance</h2>
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openCompliance ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
            <p className={styles["card-description"]}>Legal compliance tracking for I-9 forms and E-Verify status</p>
          </div>
          {openCompliance && (
            <div className={styles["card-content"]}>
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  background: "linear-gradient(to right,#f8fafc,#f1f5f9)",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                <h4
                  style={{
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 6,
                      background: "linear-gradient(to right,#6366f1,#2563eb)",
                    }}
                  />{" "}
                  Overall Compliance Status
                </h4>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                  {complianceSummary.map((c) => (
                    <div
                      key={c.id}
                      className={styles.hovershadow}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: c.styleConfig.background,
                        border: "1px solid",
                        borderColor: c.styleConfig.borderColor,
                        color: c.styleConfig.titleColor,
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => setOpenModal({ modalTitle: c.modalTitle, filter: c.filter, task_name: c.task })}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        style={{ marginBottom: 8 }}
                      >
                        {c.styleConfig.icon}
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>{c.count}</div>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4
                  style={{
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FileText size={16} style={{ color: "#4f46e5" }} /> I-9 Form Status
                </h4>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                  {i9Status.map((s) => (
                    <div
                      key={s.id}
                      className={styles.hovershadow}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: s.styleConfig.background,
                        border: "1px solid",
                        borderColor: s.styleConfig.borderColor,
                        textAlign: "center",
                        cursor: "pointer",
                        color: s.styleConfig.titleColor,
                      }}
                      onClick={() =>
                        setOpenModal({
                          filter_field: "i9",
                          modalTitle: s.modalTitle,
                          filter: s.filter,
                          task_name: s.task,
                        })
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        style={{ marginBottom: 8 }}
                      >
                        {s.styleConfig.icon}
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {s.count}
                      </div>
                      <div
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Shield style={{ color: "#2563eb" }} /> E-Verify Status
                </h4>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                  {everifyStatus.map((s) => (
                    <div
                      key={s.id}
                      className={styles.hovershadow}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: s.styleConfig.background,
                        border: "1px solid",
                        borderColor: s.styleConfig.borderColor,
                        textAlign: "center",
                        cursor: "pointer",
                        color: s.styleConfig.titleColor,
                      }}
                      onClick={() =>
                        setOpenModal({
                          filter_field: "everify",
                          modalTitle: s.modalTitle,
                          filter: s.filter,
                          task_name: s.task,
                        })
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        style={{ marginBottom: 8 }}
                      >
                        {s.styleConfig.icon}
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {s.count}
                      </div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: s.styleConfig.titleColor,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles["main-card"]}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setOpenDocuments((s) => !s);
            }}
            className={`${styles["card-header-expandable"]} ${styles["card-header-expandable-documents"]}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <div
                  className={styles["header-icon"]}
                  style={{ background: "linear-gradient(to right, #f59e0b, #f97316)" }}
                >
                  <FileText size={16} />
                </div>
                <h2>Document Monitoring</h2>
              </div>
              <ChevronDown
                className={styles["expand-icon"]}
                style={{ transform: openDocuments ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
            <p className={styles["card-description"]}>Track document expiration and compliance status</p>
          </div>
          {openDocuments && <div className={styles["card-content"]}>{renderDocumentsCard()}</div>}
        </div>
      </>
    );
  };

  return (
    <div className={`${styles["dashboard-container"]} py-2 px-2 px-md-2 rightcontent`}>
      <div className="headerBackground text-white p-3 mb-3 mb-lg-4" style={{ borderRadius: "10px", minHeight: "75px" }}>
        <div className={`d-flex justify-content-between`}>
          <div>
            <h2 className="m-0 fw-bold h2 fs-5">Employer Dashboard</h2>
            <p className="mt-1">Complete overview of talent management and operations</p>
          </div>
          {/* <button
            className={`mb-auto mt-2 ${styles["btn-refresh"]}`}
            type="button"
            onClick={() => {
              getdashboardData();
            }}
          >
            <RefreshCw className={styles["icon-refresh"]} />
            Refresh
          </button> */}
        </div>
      </div>
      {renderTabsData()}
      <Themeloader show={loading} />
      <ViewDetailsModal show={openModal} setShow={setOpenModal} />
    </div>
  );
}
