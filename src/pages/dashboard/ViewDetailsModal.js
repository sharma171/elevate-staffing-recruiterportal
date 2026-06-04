import { useEffect, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import { useAuth } from "../../authContext";
import styles from "./viewModal.module.css";
import EmptyView from "../../components/EmptyView";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import { useNavigate } from "react-router-dom";

const APIENDPOINT = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Details_Frontend_Dashboard_v3";

const BADGE_STYLES = {
  talentStatus: {
    "available talent": styles.badgeBlue,
    "inactive talent": styles.badgeGray,
    "active talent": styles.badgeGreen,
    "pending talent": styles.badgeAmber,
    inactive: styles.badgeGray,
    active: styles.badgeGreen,
    pending: styles.badgeAmber,
    unknown: styles.badgeGray,
  },
  accountStatus: {
    "active account": styles.badgeGreen,
    inactive: styles.badgeGray,
    pending: styles.badgeAmber,
  },
  visaStatus: {
    "f1 opt": styles.badgeCyan,
    "stem opt": styles.badgeBlue,
    cpt: styles.badgeAmber,
    h1b: styles.badgeIndigo,
    "h4 ead": styles.badgePink,
    gc: styles.badgeGreen,
    "gc ead": styles.badgeTeal,
    usc: styles.badgeGray,
    l2: styles.badgeOrange,
    "l2 ead": styles.badgeOrangeDark,
    other: styles.badgeGray,
  },
  optLetter: {
    issued: styles.badgeGreen,
    pending: styles.badgeAmber,
    none: styles.badgeGray,
    n_a: styles.badgeGray,
  },
  i9Form: {
    completed: styles.badgeGreen,
    "n/a": styles.badgeGray,
    na: styles.badgeGray,
    pending: styles.badgeAmber,
  },
  eVerify: {
    completed: styles.badgeGreen,
    pending: styles.badgeAmber,
    failed: styles.badgeRedLight,
  },
};

function resolveBadgeClass(kind, label) {
  if (!label) return styles.badgeGray;
  const norm = String(label).toLowerCase().trim();
  const kindMap = BADGE_STYLES[kind] || {};
  return kindMap[norm] || styles.badgeGray;
}

function Badge({ label, kind }) {
  const cls = resolveBadgeClass(kind, label);
  return <div className={`${styles.badge} ${cls}`}>{label || "N/A"}</div>;
}

function ViewDetailsModal({ show, setShow }) {
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  let adminEmail = user?.email;
  // adminEmail = "marketing@4spheresolutions.com";

  let isDocumentsView = show?.task_name == "document_details";

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    currentPage: 1,
    rowsPerPage: 10,
  });

  const modalTitle = show?.modalTitle;

  const getdashboardData = async () => {
    if (!show) return;
    let payloadObj = structuredClone(show);
    delete payloadObj.modalTitle;

    const payload = {
      assigned_recruiter_email: adminEmail,
      ...payloadObj,
    };
    setLoading(true);
    try {
      const res = await axiosApi.post(APIENDPOINT, payload);
      setUsersData(res.data || {});
    } catch (err) {
      console.error(err);
      setUsersData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    getdashboardData();
  }, [adminEmail, show]);

  useEffect(() => {
    if (!show) {
      setUsersData({});
      setFilters({ currentPage: 1, rowsPerPage: 10 });
    }
  }, [show]);

  let records = usersData.employees || [];
  let totalRecords = usersData.count;

  if (isDocumentsView) {
    records = usersData.by_candidate || [];
    totalRecords = records.length;
  }

  const start = (filters.currentPage - 1) * filters.rowsPerPage;
  const end = start + filters.rowsPerPage;
  const paginatedRecords = records.slice(start, end);

  const handleSetPage = (page) => {
    setFilters((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSetRowsPerPage = (rows) => {
    setFilters((prev) => ({ ...prev, rowsPerPage: rows, currentPage: 1 }));
  };

  const navigateTotalentpool = (data) => {
    let talentName = data?.talent_status;
    let candidateName = data?.name;
    if (!talentName) {
      return;
    }

    if (!candidateName) {
      candidateName = data?.first_name + " " + data?.last_name;
    }

    let links = {
      "Active Talent": "/activetalent?search=" + candidateName,
      "Available Talent": "/availableTalent?search=" + candidateName,
      "Inactive Talent": "/inactivetalent?search=" + candidateName,
      "Pending Talent": "/pendingtalent?search=" + candidateName,
    };

    if (!links[talentName]) {
      return;
    }

    navigate(links[talentName]);
  };

  if (!show) return null;

  const viewDocumentsmodal = () => {
    if (!loading && !paginatedRecords?.length) {
      return (
        <div className="bg-white">
          <EmptyView hide={loading} title="No Data Found" />
        </div>
      );
    }

    const renderTableView = (documents) => {
      return (
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className={`table mb-0 ${styles.document_card_table}`}>
              <thead className={styles.document_card_table_head}>
                <tr>
                  <th className="p-3 text-start fw-semibold small">Document Name</th>
                  <th className="p-3 text-start fw-semibold small">Category</th>
                  <th className="p-3 text-start fw-semibold small">Type</th>
                  <th className="p-3 text-start fw-semibold small">Expiry Date</th>
                  <th className="p-3 text-start fw-semibold small">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((item, index) => {
                  let isDaysLeft = item?.days_until_expiry;

                  return (
                    <tr key={index} className={styles.document_card_table_row}>
                      <td className="p-3 small fw-medium">{item?.doc_name || ""}</td>
                      <td className="p-3 small">{item?.doc_category || ""}</td>
                      <td className="p-3 small">{item?.doc_type || ""}</td>
                      <td className="p-3 small">{item?.doc_expiry || ""}</td>
                      <td className="p-3">
                        <span
                          style={{ backgroundColor: isDaysLeft ? "#0d3791" : "" }}
                          className={`badge ${styles.document_card_badge_danger}`}
                        >
                          {isDaysLeft ? isDaysLeft + " days left" : item?.days_overdue + " days overdue"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <>
        <div
          className="mb-4 p-4 rounded-3"
          style={{
            backgroundColor: "rgba(108,117,125,0.1)",
          }}
        >
          <p
            className="mb-0"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#212529",
            }}
          >
            Total Documents:{" "}
            <span
              style={{
                fontWeight: 700,
              }}
            >
              {usersData?.count || 0}
            </span>{" "}
            • Candidates Affected:{" "}
            <span
              style={{
                fontWeight: 700,
              }}
            >
              {usersData?.total_candidates_affected || 0}
            </span>
          </p>
        </div>

        {paginatedRecords.map((item, index) => {
          return (
            <div
              key={index}
              className={`card shadow-sm border-2 rounded-3 mb-3 pb-1 ${styles.document_card_container}`}
              style={{ backgroundColor: "#fff", color: "#000" }}
            >
              <div className={`card-header d-flex flex-column px-4 py-3 ${styles.document_card_header}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5
                      className="fw-bold mb-1 pointer hoverthemetext"
                      onClick={() => {
                        navigateTotalentpool(item);
                      }}
                    >
                      {(item?.first_name || "") + " " + (item?.last_name || "")}
                    </h5>
                    <p className="text-muted small mb-0">{item?.email || ""}</p>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-light text-dark border mb-1 ${styles.document_card_status_badge}`}>
                      {item?.talent_status || ""}
                    </span>
                    <p className="text-muted small mb-0">
                      {item?.expired_count
                        ? item?.expired_count + " expired"
                        : item?.expiring_soon_count + " expiring soon"}{" "}
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-2 small">
                  <span className={`badge bg-secondary py-1 text-white ${styles.document_card_tag}`}>
                    {item?.visa_status || ""}
                  </span>
                  <span className={`badge bg-light text-dark border ${styles.document_card_tag}`}>
                    {item?.project_status || ""}
                  </span>
                </div>
              </div>

              {renderTableView(item?.documents || [])}
            </div>
          );
        })}
      </>
    );
  };

  const renderEmployeesView = () => {
    return (
      <>
        {!loading && !paginatedRecords?.length ? (
          <div className="bg-white">
            <EmptyView
              hide={loading}
              title="No Employees Found"
              description="Add employee details to see them listed here."
            />
          </div>
        ) : null}

        <div className={styles.container}>
          {paginatedRecords.map((r, index) => {
            return (
              <div className={`${styles.card} ${styles.rowGrid}`} key={index}>
                <div>
                  <h4 className={styles.heading}>Personal Information</h4>
                  <p className={styles.text}>
                    <span className={styles.label}>Name:</span>{" "}
                    <span onClick={() => navigateTotalentpool(r)} className={`badge badge-light ${styles.nameBadge}`}>
                      {" "}
                      {r.name || "N/A"}{" "}
                    </span>
                  </p>
                  <p className={styles.text}>
                    <span className={styles.label}>Email:</span> {r.email || "N/A"}
                  </p>
                  <p className={styles.text}>
                    <span className={styles.label}>Employee ID:</span> {r.employee_id || "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className={styles.heading}>Work Status</h4>
                  <div className={styles.text}>
                    <span className={styles.label}>Talent Status:</span>
                    <Badge label={r.talent_status || r.talent || "Unknown"} kind="talentStatus" />
                  </div>
                  <div className={styles.text}>
                    <span className={styles.label}>Account Status:</span>
                    <Badge label={r.account_status || r.account || "Unknown"} kind="accountStatus" />
                  </div>
                </div>

                <div>
                  <h4 className={styles.heading}>Visa &amp; Compliance</h4>
                  <div className={styles.text}>
                    <span className={styles.label}>Visa Status:</span>
                    <Badge label={r.visa_status || r.visa || "Other"} kind="visaStatus" />
                  </div>
                  <div className={styles.text}>
                    <span className={styles.label}>OPT Letter:</span>
                    <Badge label={r.opt_letter_status || r.opt_letter || "NONE"} kind="optLetter" />
                  </div>
                  <div className={styles.text}>
                    <span className={styles.label}>I-9 Form:</span>
                    <Badge label={r.i9_form_status || r.i9_form || "N/A"} kind="i9Form" />
                  </div>
                  <div className={styles.text}>
                    <span className={styles.label}>E-Verify:</span>
                    <Badge label={r.everify_status || r.e_verify || "Pending"} kind="eVerify" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <OverlayModal isActive={show} onClose={() => setShow("")} style={{ minWidth: "60%" }}>
      <>
        <div className="mb-3">
          <div className="h3">{modalTitle}</div>
          {isDocumentsView ? <></> : <div>{totalRecords} employees found</div>}{" "}
        </div>

        {isDocumentsView ? viewDocumentsmodal() : renderEmployeesView()}

        <div className="mt-4">
          <CustomPagination
            alltotalrecords={totalRecords}
            currentPage={filters.currentPage}
            setCurrentPage={handleSetPage}
            rowsPerPage={filters.rowsPerPage}
            setRowsPerPage={handleSetRowsPerPage}
          />
        </div>

        <ThemeLoader show={loading} fixed />
      </>
    </OverlayModal>
  );
}

export default ViewDetailsModal;
