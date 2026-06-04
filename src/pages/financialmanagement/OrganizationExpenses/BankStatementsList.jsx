import React, { useState, useEffect } from "react";
import { axiosApi, ThemeLoader, CustomPagination } from "../../../components";
import { FileText, ChevronRight, Filter } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./BankStatementsList.module.css";
import { useAuth } from "../../../authContext";

const BANK_STATEMENT_API_URL = "https://bank-statement-expenses-api-v3-305451280005.us-east1.run.app";

export default function BankStatementsList({ onSelectStatement = () => {}, refreshTrigger }) {
  const [statements, setStatements] = useState([]);
  const [loader, setLoader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const { user } = useAuth();
  const EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    fetchStatements();
  }, [refreshTrigger, statusFilter, bankFilter, monthFilter, limit, offset]);

  async function callBankStatementAPI(action, data = {}) {
    const payload = {
      action,
      user_email: EMPLOYER_EMAIL,
      ...data,
    };

    try {
      const response = await axiosApi.post(BANK_STATEMENT_API_URL, payload);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async function fetchStatements() {
    setLoader(true);
    try {
      const response = await callBankStatementAPI("list_statements", {
        status: statusFilter !== "all" ? statusFilter : undefined,
        bank_name: bankFilter || undefined,
        statement_month: monthFilter || undefined,
        limit,
        offset,
      });

      if (response && response.status === "success") {
        setStatements(response.statements || []);
        const pagination = response.pagination || {};
        setTotalRecords(pagination.total_count ?? (response.statements ? response.statements.length : 0));
      } else {
        toast.error("Failed to fetch bank statements");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching statements");
    } finally {
      setLoader(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getStatusClass(status) {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return styles.badgeDefault;
      case "processing":
      case "pending":
        return styles.badgeSecondary;
      case "failed":
        return styles.badgeDestructive;
      default:
        return styles.badgeSecondary;
    }
  }

  return (
    <div>
      <ThemeLoader show={loader || uploading} />

      <div className="card mb-4 p-3 my-3" style={{ borderColor: "#e6eef8" }}>
        <div className="responsiveLayout mb-3">
          <div className={styles.filterItem}>
            <label className={styles.label}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="searchInputGlobal form-select"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.label}>Bank Name</label>
            <input
              className="searchInputGlobal form-control"
              placeholder="Filter by bank..."
              value={bankFilter}
              onChange={(e) => {
                setBankFilter(e.target.value);
                setOffset(0);
              }}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.label}>Statement Month</label>
            <input
              className="searchInputGlobal form-control d-block"
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setOffset(0);
              }}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center"
            onClick={() => {
              setStatusFilter("all");
              setBankFilter("");
              setMonthFilter("");
              setOffset(0);
              setLimit(50);
            }}
          >
            <Filter size={16} className="me-2" />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="card mb-4 p-3 my-3" style={{ borderColor: "#e6eef8" }}>
        {loader ? (
          <div className={styles.empty}>Loading statements...</div>
        ) : statements.length === 0 ? (
          <div className={styles.empty}>No bank statements found</div>
        ) : (
          <>
            <div className={styles.list}>
              {statements.map((s) => (
                <div key={s.id} className={styles.item} onClick={() => onSelectStatement(s.id)}>
                  <div className={styles.itemLeft}>
                    <div className={styles.bankRow}>
                      <span className={styles.bankName}>{s.bank_name}</span>
                      <span className={styles.account}>{s.account_number}</span>
                    </div>
                    <div className={styles.muted}>
                      Period: {formatDate(s.statement_period_start)} - {formatDate(s.statement_period_end)}
                    </div>
                    <div className={styles.rowSmall}>
                      <span>{s.transaction_count} transactions</span>
                      <span>Uploaded: {formatDate(s.uploaded_on)}</span>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <div className={`${styles.badge} ${getStatusClass(s.processing_status)}`}>
                      {String(s.processing_status || "")
                        .charAt(0)
                        .toUpperCase() + String(s.processing_status || "").slice(1)}
                    </div>
                    <ChevronRight className={styles.chev} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.paginationWrap}>
              <CustomPagination
                alltotalrecords={totalRecords}
                currentPage={Math.floor(offset / limit) + 1}
                setCurrentPage={(page) => {
                  const newOffset = (page - 1) * limit;
                  setOffset(newOffset);
                }}
                rowsPerPage={limit || 10}
                setRowsPerPage={(newLimit) => {
                  const newOffset = Math.floor(offset / newLimit) * newLimit;
                  setLimit(newLimit);
                  setOffset(newOffset);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
