// BillHistory.jsx
import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, TrendingDown, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import CreateExpenseDialog from "./CreateExpenseDialog";
import styles from "./BillHistory.module.css";

const EXPENSE_API_BASE_URL = "https://expense-management-api-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1cmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

const EXPENSE_CATEGORIES = [
  "Travel",
  "Meals",
  "Office Supplies",
  "Office Equipment",
  "Software & Subscriptions",
  "Marketing",
  "Entertainment",
  "Training & Education",
  "Utilities",
  "Rent",
  "Insurance",
  "Professional Services",
  "Other",
];

export default function BillHistory() {
  const employerEmail = "marketing@4spheresolutions.com";
  const employeeEmail = "marketing@4spheresolutions.com";

  const [filters, setFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("reimbursements");

  const [loader, setLoader] = useState(false);
  const [allData, setAllData] = useState(null);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, limit, offset, refreshTrigger, activeTab]);

  function handleFilterChange(key, value) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value || undefined };
      return next;
    });
  }

  const clearFilters = () => {
    setFilters({ ...filters, date_from: "", date_to: "", category: "", status: "" });
  };

  function fetchList() {
    setLoader(true);
    const payload = {
      action: "list_expenses",
      employer_email: employerEmail,
      employee_email: employeeEmail,
      status: filters.status,
      category: filters.category,
      date_from: filters.date_from,
      date_to: filters.date_to,
      limit,
      offset,
    };
    axiosApi
      .post(EXPENSE_API_BASE_URL, payload)
      .then((response) => {
        const result = response?.data || {};
        setAllData(result);
        setRows(result.expenses || result.invoices || []);
      })
      .catch((error) => {
        toast.error(
          (error?.response && error.response.data && error.response.data.message) ||
            error.message ||
            "Failed to fetch data"
        );
      })
      .finally(() => setLoader(false));
  }

  function renderTableFor(tab) {
    const data = (rows || []).filter((r) => {
      if (tab === "reimbursements") return r.is_reimbursable !== false;
      if (tab === "suppliers") return !!r.supplier_name;
      if (tab === "organization") return r.is_organization_expense === true;
      return true;
    });
    if (loader) {
      return (
        <div className={styles.cardBodyCenter}>
          <ThemeLoader show={loader} />
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className={styles.empty}>
          No{" "}
          {tab === "reimbursements"
            ? "reimbursement requests"
            : tab === "suppliers"
            ? "supplier bills"
            : "organization expenses"}{" "}
          found
        </div>
      );
    }
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.expense_id || row.id || Math.random()}>
                <td>{row.expense_id || row.id || "-"}</td>
                <td>{row.expense_date || row.date || "-"}</td>
                <td>{row.category || "-"}</td>
                <td>{typeof row.amount === "number" ? row.amount.toFixed(2) : row.amount || "-"}</td>
                <td>{row.description || row.notes || "-"}</td>
                <td>{row.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.paginationWrap}>
          <CustomPagination
            alltotalrecords={allData?.pagination?.total_count || allData?.total_count || 0}
            currentPage={Math.floor(offset / limit) + 1}
            setCurrentPage={(page) => {
              const newOffset = (page - 1) * limit;
              setOffset(newOffset);
              if (filters) filters.currentPage = page;
              setFilters({ ...filters });
            }}
            rowsPerPage={limit || 10}
            setRowsPerPage={(newLimit) => {
              const newOffset = Math.floor(offset / newLimit) * newLimit;
              if (filters) filters.rowsPerPage = newLimit;
              setFilters({ ...filters });
              setLimit(newLimit);
              setOffset(newOffset);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className={`d-flex align-items-center justify-content-between mb-3`}>
        <div className={`flex-column align-items-start`}>
          <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
            <TrendingDown size={25} />
            Expense Management
          </h3>
          <div className="text-muted">View and manage expenses by type</div>
        </div>
        <CreateExpenseDialog employerEmail={employerEmail} onSuccess={() => setRefreshTrigger((p) => p + 1)} />
      </div>

      <div className="card mb-4 pb-3" style={{ borderColor: "#e6eef8" }}>
        <div className={styles.cardContent}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterItem}>
              <label className={styles.label}>Status</label>
              <div className={styles.selectWrap}>
                <select
                  className={`searchInputGlobal ${styles.select}`}
                  value={filters?.status}
                  onChange={(e) => handleFilterChange("status", e.target.value === "all" ? undefined : e.target.value)}
                  defaultValue="all"
                >
                  <option value="all">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className={styles.iconChevron} />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label className={styles.label}>Category</label>
              <div className={styles.selectWrap}>
                <select
                  className={`searchInputGlobal ${styles.select}`}
                  value={filters?.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value === "all" ? undefined : e.target.value)
                  }
                >
                  <option value="all">All</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.iconChevron} />
              </div>
            </div>

            <div className={styles.filterItem}>
              <label className={styles.label}>Date From</label>
              <input
                value={filters?.date_from}
                type="date"
                className={`searchInputGlobal d-block ${styles.input}`}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
              />
            </div>

            <div className={styles.filterItem}>
              <label className={styles.label}>Date To</label>
              <input
                value={filters?.date_to}
                type="date"
                className={`searchInputGlobal d-block ${styles.input}`}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3 px-3">
          <div></div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-outline-secondary d-inline-flex align-items-center"
              onClick={clearFilters}
            >
              <Filter size={16} className="me-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabTrigger} ${activeTab === "reimbursements" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("reimbursements")}
          >
            Employee Reimbursements
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === "suppliers" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            Supplier Bills
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === "organization" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("organization")}
          >
            Org Expenses
          </button>
        </div>

        <div className={styles.tabContent}>{renderTableFor(activeTab)}</div>
      </div>
    </div>
  );
}
