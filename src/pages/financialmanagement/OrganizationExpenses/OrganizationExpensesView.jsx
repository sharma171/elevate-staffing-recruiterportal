import { useState, useEffect, useCallback } from "react";
import { axiosApi, ThemeLoader, CustomPagination } from "../../../components";
import FilePreview from "../../benchcandidate/FilePreview";
import { DollarSign, TrendingUp, Calendar, FileText, Filter, EyeIcon, Plus } from "lucide-react";
import styles from "./OrganizationExpensesView.module.css";
import OverlayModal from "../../../components/OverlayModal";
import CreateExpenseDialog from "../CreateExpenseDialog";
import { useAuth } from "../../../authContext";

const BASE_URL = "https://expense-management-api-v3-305451280005.us-east1.run.app";
const AUTH = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export default function OrganizationExpensesPage({ employeeEmail }) {
  const [expenses, setExpenses] = useState([]);
  const [loader, setLoader] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pageState, setPageState] = useState({ page: 1, perPage: 10, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { user } = useAuth();

  const employerEmail = user?.email;
  // const employeeEmail = user?.email;

  const loadExpenses = useCallback(() => {
    setLoader(true);
    const body = {
      action: "list_expenses",
      employer_email: employerEmail,
      employee_email: employeeEmail,
      limit: pageState.perPage,
      offset: (pageState.page - 1) * pageState.perPage,
    };
    if (selectedCategory && selectedCategory !== "all") {
      body.category = selectedCategory;
    }

    axiosApi
      .post(BASE_URL, body, { headers: { Authorization: AUTH } })
      .then((res) => {
        const expensesFromApi = res?.data?.expenses || [];
        const pagination = res?.data?.pagination || {};
        const org = expensesFromApi.filter((e) => e.merchant_name && !e.supplier_name && e.is_reimbursable === false);
        setExpenses(org);
        setPageState((prev) => ({
          ...prev,
          total: pagination.total_count ?? org.length,
        }));
      })
      .catch(() => {
        setExpenses([]);
        setPageState((prev) => ({ ...prev, total: 0 }));
      })
      .finally(() => setLoader(false));
  }, [employerEmail, employeeEmail, pageState.page, pageState.perPage, selectedCategory, refreshTrigger]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleRefresh = () => setRefreshTrigger((p) => p + 1);

  const totalExpenses = expenses.reduce((t, e) => t + Number(e.amount || 0), 0);
  const now = new Date();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const totalMonth = monthExpenses.reduce((t, e) => t + Number(e.amount || 0), 0);
  const catGroup = expenses.reduce((acc, exp) => {
    const c = exp.category || "Uncategorized";
    acc[c] = (acc[c] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});
  const topCategory = Object.entries(catGroup).sort((a, b) => b[1] - a[1])[0] || null;

  return (
    <div className={styles.page}>
      <ThemeLoader show={loader} />

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`themeColor ${styles.metricIcon}`}>
            <DollarSign />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricTitle}>Total Expenses</div>
            <div className={styles.metricValue}>
              ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`themeColor ${styles.metricIcon}`}>
            <Calendar />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricTitle}>This Month</div>
            <div className={styles.metricValue}>
              ${totalMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className={styles.metricSub}>{monthExpenses.length} expenses</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`themeColor ${styles.metricIcon}`}>
            <TrendingUp />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricTitle}>Top Category</div>
            <div className={styles.metricValue}>{topCategory ? topCategory[0] : "N/A"}</div>
            {topCategory && <div className={styles.metricSub}>${Number(topCategory[1]).toLocaleString()}</div>}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`themeColor ${styles.metricIcon}`}>
            <FileText />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricTitle}>Total Records</div>
            <div className={styles.metricValue}>{expenses.length}</div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <div className="p-relative d-flex align-items-center" style={{ width: "max-content" }}>
          <Filter size={18} style={{ position: "absolute", left: "10px" }} />
          <CategorySelect
            expenses={expenses}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setPageState((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>
        <CreateExpenseDialog onSuccess={() => loadExpenses()} />
      </div>

      <ExpenseTable
        employerEmail={employerEmail}
        employeeEmail={employeeEmail}
        expenses={expenses}
        pageState={pageState}
        setPageState={setPageState}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

function CategorySelect({ expenses, value, onChange }) {
  const categories = [
    "Rent & Facilities",
    "Utilities",
    "Insurance",
    "Marketing & Advertising",
    "Office Supplies",
    "Equipment & Hardware",
    "Software & Tools",
    "Professional Services",
    "Legal & Compliance",
    "Taxes & Licenses",
    "Other",
  ];

  return (
    <select
      className="form-select"
      style={{ paddingLeft: "32px" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Categories</option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function ExpenseTable({ employerEmail, employeeEmail, expenses, pageState, setPageState }) {
  const [loader, setLoader] = useState(false);
  const [previewPayload, setPreviewPayload] = useState(null);

  const openDocument = (exp) => {
    setLoader(true);
    axiosApi
      .post(
        BASE_URL,
        {
          action: "get_attachments",
          employer_email: employerEmail,
          employee_email: employeeEmail,
          expense_id: exp.id,
          include_content: true,
        },
        { headers: { Authorization: AUTH } }
      )
      .then((res) => {
        const atts = res?.data?.attachments || [];
        const first = atts[0] || null;
        setPreviewPayload(first || null);
      })
      .catch(() => {
        setPreviewPayload(null);
      })
      .finally(() => setLoader(false));
  };

  return (
    <div className="card mb-4" style={{ borderColor: "#e6eef8" }}>
      <ThemeLoader show={loader} />
      {!expenses.length ? (
        <div className={styles.noData}>No organization expenses found</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className={`table table-hover`}>
              <thead>
                <tr>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Date
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Category
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Description
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Merchant
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Amount
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Project
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Status
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={index} style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                    <td className="py-3">{exp.expense_date}</td>
                    <td className="py-3">
                      <span className={styles.catBadge}>{exp.category || "Uncategorized"}</span>
                    </td>
                    <td className="py-3" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="py-3">{exp.merchant_name || "—"}</td>
                    <td className="py-3">
                      {Number(exp.amount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </td>
                    <td className="py-3">{exp.project_code || "—"}</td>
                    <td className="py-3">
                      <span className={styles.statusBadge}>{exp.status || "N/A"}</span>
                    </td>
                    <td className="py-3">
                      <div className="pointer" title="View" onClick={() => openDocument(exp)}>
                        <EyeIcon size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-3">
            <CustomPagination
              defaultpageHide={1}
              alltotalrecords={pageState.total}
              currentPage={pageState.page}
              setCurrentPage={(v) => setPageState((p) => ({ ...p, page: v }))}
              rowsPerPage={pageState.perPage}
              setRowsPerPage={(v) => setPageState((p) => ({ ...p, perPage: v, page: 1 }))}
            />
          </div>
        </>
      )}

      <OverlayModal
        isActive={Boolean(previewPayload?.base64_content)}
        onClose={() => {
          setPreviewPayload(null);
        }}
      >
        <FilePreview
          setFileType={() => {}}
          base64File={previewPayload?.base64_content}
          fileType={previewPayload?.file_type}
          setBase64File={setPreviewPayload}
          fileMeta={previewPayload || {}}
          docObject={previewPayload || {}}
        />
      </OverlayModal>
    </div>
  );
}
