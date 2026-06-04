import React, { useEffect, useState } from "react";
import { Edit, FileText, Filter } from "lucide-react";
import { format } from "date-fns";
import { axiosApi, CustomPagination, ThemeLoader } from "../../../components";
import CategorizeTransactionModal from "./CategorizeTransactionModal";
import BulkEditTransactionModal from "./BulkEditTransactionModal";
import styles from "./BankTransactionsList.module.css";
import { useAuth } from "../../../authContext";

const EXPENSE_CATEGORIES = {
  PAYROLL: "Payroll and Employee Compensation",
  OFFICE_SUPPLIES: "Office Supplies and Equipment",
  RENT: "Rent and Lease Payments",
  UTILITIES: "Utilities (Electric, Water, Internet)",
  INSURANCE: "Insurance Premiums",
  MARKETING: "Marketing and Advertising",
  PROFESSIONAL_SERVICES: "Professional Services (Legal, Accounting)",
  TRAVEL: "Travel and Transportation",
  MEALS_ENTERTAINMENT: "Meals and Entertainment",
  SOFTWARE_SUBSCRIPTIONS: "Software and Subscriptions",
  BANK_FEES: "Bank Fees and Charges",
  TAXES: "Taxes and Government Fees",
  MAINTENANCE: "Maintenance and Repairs",
  TRAINING: "Training and Development",
  OTHER: "Other Expenses",
};

const API_BASE = "https://retrieve-connected-bank-transactions-v3-305451280005.us-east1.run.app";

export default function BankTransactionsList({ accountId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesKeyVal, setCategoriesKeyVal] = useState({});
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [documentsState, setDocumentsState] = useState({});

  const { user } = useAuth();
  const userEmail = user?.email;

  function getCategoryDisplayName(code) {
    if (!code) return "Uncategorized";
    return categoriesKeyVal[code] || EXPENSE_CATEGORIES[code] || code;
  }

  const arrTokeyVal = (data) => {
    let obj = {};
    data.map((item) => {
      obj[item.code] = item.display_name;
    });

    return obj;
  };

  function fetchCategories() {
    axiosApi
      .get(`${API_BASE}/categories`, { params: { user_email: userEmail } })
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data.categories) && data.categories.length) {
          setCategories(data.categories);

          let newData = arrTokeyVal(data.categories);
          setCategoriesKeyVal(newData);
        }
      })
      .catch(() => {});
  }

  function fetchTransactions(page = pagination?.page, limitOverride) {
    setLoading(true);

    const params = {
      user_email: userEmail,
      page,
      limit: limitOverride || pagination.limit,
      account_id: accountId,
      ...filters,
    };

    axiosApi
      .get(`${API_BASE}/transactions`, { params })
      .then((res) => res?.data || res)
      .then((data) => {
        setTransactions(data.transactions || []);
        setPagination((prev) => ({
          ...prev,
          page: data?.pagination?.page ?? prev.page,
          limit: data?.pagination?.limit ?? prev.limit,
          total: data?.pagination?.total ?? prev.total,
          total_pages: data?.pagination?.total_pages ?? prev.total_pages,
        }));
        setSelectedTransactions(new Set());
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }

  function bulkUpdateTransactions(ids, category) {
    setOpLoading(true);

    axiosApi
      .post(`${API_BASE}/transactions/bulk-update`, {
        user_email: userEmail,
        transaction_ids: ids,
        confirmed_category: category,
      })
      .then((res) => res?.data || res)
      .then(() => fetchTransactions(pagination.page))
      .finally(() => setOpLoading(false));
  }

  function getTransactionWithDocuments(id) {
    return axiosApi
      .get(`${API_BASE}/transactions/${id}`, {
        params: { user_email: userEmail },
      })
      .then((res) => res?.data || res)
      .catch(() => ({
        supporting_documents: [],
        supporting_documents_count: 0,
      }));
  }

  function uploadDocument(payload) {
    return axiosApi.post(`${API_BASE}/transactions/documents/upload`, payload).then((res) => res?.data || res);
  }

  function downloadDocument(id) {
    return axiosApi
      .post(`${API_BASE}/transactions/documents/${id}`, {
        user_email: userEmail,
      })
      .then((res) => res?.data || res);
  }

  function deleteDocument(id) {
    return axiosApi
      .delete(`${API_BASE}/transactions/documents/${id}`, {
        data: { user_email: userEmail },
      })
      .then((res) => res?.data || res);
  }

  function refreshDocuments(id) {
    getTransactionWithDocuments(id).then((d) => {
      setDocumentsState((prev) => ({
        ...prev,
        [id]: {
          docs: d.supporting_documents || [],
          count: d.supporting_documents_count || 0,
        },
      }));
    });
  }

  function searchEmployees(query) {
    return axiosApi
      .post(`${API_BASE}/employee-link/search_employees`, {
        search_query: query,
      })
      .then((res) => res?.data || res)
      .then((d) => d.employees || [])
      .catch(() => []);
  }

  function linkEmployee(transactionId, employeeEmail) {
    return axiosApi
      .post(`${API_BASE}/employee-link/link`, {
        entity_type: "bank_transaction",
        transaction_id: transactionId,
        employee_email: employeeEmail,
      })
      .then((res) => res?.data || res);
  }

  function unlinkEmployee(transactionId) {
    return axiosApi
      .post(`${API_BASE}/employee-link/unlink`, {
        entity_type: "bank_transaction",
        transaction_id: transactionId,
      })
      .then((res) => res?.data || res);
  }

  function openEdit(transaction) {
    setEditingTransaction(transaction);
    getTransactionWithDocuments(transaction.id).then((d) => {
      setDocumentsState((prev) => ({
        ...prev,
        [transaction.id]: {
          docs: d.supporting_documents || [],
          count: d.supporting_documents_count || 0,
        },
      }));
    });
  }

  function handleSelectAll(checked) {
    if (checked) setSelectedTransactions(new Set(transactions.map((t) => t.id)));
    else setSelectedTransactions(new Set());
  }

  function handleSelectTransaction(id, checked) {
    const next = new Set(selectedTransactions);
    checked ? next.add(id) : next.delete(id);
    setSelectedTransactions(next);
  }

  function formatAmount(amount, type) {
    const f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
    return type === "debit" ? `-${f}` : f;
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTransactions(pagination.page);
    }, 300);
    return () => clearTimeout(handler);
  }, [accountId, JSON.stringify(filters), pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className={styles.container}>
      <ThemeLoader show={loading || opLoading} />

      <div className={styles.header}>
        <div>
          <div className={styles.title}>Bank Transactions</div>
          <div className={styles.description}>View and categorize transactions from your connected bank accounts</div>
        </div>

        {selectedTransactions.size > 0 && (
          <button className={styles.primaryBtn} onClick={() => setShowBulkEdit(true)}>
            Edit {selectedTransactions.size} Selected
          </button>
        )}
      </div>

      <div className="card mb-4 mt-3 p-3" style={{ borderColor: "#e6eef8" }}>
        <div className={styles.filtersGrid}>
          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Search Description</label>
            <input
              className="searchInputGlobal"
              placeholder="Search transactions..."
              value={filters.search || ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Transaction Type</label>
            <select
              className="form-select searchInputGlobal"
              value={filters.transaction_type || "all"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  transaction_type: e.target.value === "all" ? undefined : e.target.value,
                })
              }
            >
              <option value="all">All types</option>
              <option value="debit">Debit (Expenses)</option>
              <option value="credit">Credit (Income)</option>
            </select>
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Category</label>
            <select
              className="form-select searchInputGlobal"
              value={filters.category || "all"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category: e.target.value === "all" ? undefined : e.target.value,
                })
              }
            >
              <option value="all">All categories</option>
              {categories.map((c) => {
                return (
                  <option key={c} value={c.code}>
                    {c.display_name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Status</label>
            <select
              className="form-select searchInputGlobal"
              value={filters.status || "all"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value === "all" ? undefined : e.target.value,
                })
              }
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="suggested">Suggested</option>
              <option value="auto_confirmed">Auto-confirmed</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Employee Link Status</label>
            <select
              className="form-select searchInputGlobal"
              value={
                filters.linked_to_employee === true
                  ? "linked"
                  : filters.linked_to_employee === false
                  ? "unlinked"
                  : "all"
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  linked_to_employee:
                    e.target.value === "linked" ? true : e.target.value === "unlinked" ? false : undefined,
                })
              }
            >
              <option value="all">All</option>
              <option value="linked">Linked</option>
              <option value="unlinked">Unlinked</option>
            </select>
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>Start Date</label>
            <input
              className="d-block searchInputGlobal"
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          <div className={styles.filtersField}>
            <label className={styles.filtersLabel}>End Date</label>
            <input
              className="d-block searchInputGlobal"
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <div>
            <div className="small text-muted pt-2">
              Showing {transactions.length} of {pagination.total || 0} invoices
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-outline-secondary d-inline-flex align-items-center"
              onClick={() => setFilters({})}
            >
              <Filter size={16} className="me-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: "#eaeaea" }}>
        <div className="table-responsive">
          <table className={`table table-hover ${styles.table}`}>
            <thead className="table-light">
              <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                <th style={{ background: "#f9f9f9", padding: "15px" }} className="nowrap fw-bold">
                  <input
                    type="checkbox"
                    className="round-checkbox mt-1"
                    checked={transactions.length > 0 && selectedTransactions.size === transactions.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Date
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Description
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Type
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Category
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Linked Employee
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Docs
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Amount
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Status
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px" }} className="nowrap fw-bold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && transactions.length === 0 && (
                <tr style={{ borderColor: "#eaeaea" }}>
                  <td colSpan="10" className={styles.emptyRow}>
                    No transactions found
                  </td>
                </tr>
              )}

              {loading && (
                <tr style={{ borderColor: "#eaeaea" }}>
                  <td colSpan="10" className={styles.emptyRow}>
                    Loading transactions...
                  </td>
                </tr>
              )}

              {!loading &&
                transactions.map((t, index) => {
                  let categoryName = getCategoryDisplayName(t.confirmed_category || t.suggested_category);

                  return (
                    <tr key={index}>
                      <td className="pt-3" style={{ paddingLeft: "15px" }}>
                        <input
                          type="checkbox"
                          className="round-checkbox mt-1"
                          checked={selectedTransactions.has(t.id)}
                          onChange={(e) => handleSelectTransaction(t.id, e.target.checked)}
                        />
                      </td>

                      <td className="pt-3 nowrap">{format(new Date(t.transaction_date), "MMM dd, yyyy")}</td>

                      <td className="pt-3">
                        <div style={{ maxWidth: "280px" }} className={styles.truncate} title={t.description}>
                          {t.description}
                        </div>
                      </td>

                      <td className="pt-3">
                        <span
                          className={t.transaction_type === "debit" ? styles.badgeDestructive : styles.badgeDefault}
                        >
                          {t.transaction_type}
                        </span>
                      </td>

                      <td className="pt-3 truncate" style={{ maxWidth: "180px" }} title={categoryName}>
                        {categoryName}
                      </td>

                      <td className="pt-3">
                        {t.employee_name ? (
                          <div className={styles.employee} style={{ maxWidth: "200px" }}>
                            <div className={`truncate ${styles.empName}`} title={t.employee_name}>
                              {t.employee_name}
                            </div>
                            <div className={`truncate ${styles.empEmail}`} title={t.employee_email}>
                              {t.employee_email}
                            </div>
                          </div>
                        ) : (
                          <span className={styles.muted}>-</span>
                        )}
                      </td>

                      <td className="pt-3">
                        {t.supporting_documents_count ? (
                          <span className={styles.docBadge}>
                            <FileText size={15} />
                            {t.supporting_documents_count}
                          </span>
                        ) : (
                          <span className={styles.muted}>-</span>
                        )}
                      </td>

                      <td className="pt-3">
                        <span className={t.transaction_type === "debit" ? styles.debit : styles.credit}>
                          {formatAmount(t.amount, t.transaction_type)}
                        </span>
                      </td>

                      <td className="pt-3">{t.categorization_status}</td>

                      <td className="text-center">
                        <button className={styles.iconBtn} onClick={() => openEdit(t)}>
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="px-3">
          <CustomPagination
            alltotalrecords={pagination.total}
            currentPage={pagination.page}
            setCurrentPage={(page) => {
              setPagination((prev) => ({
                ...prev,
                page: page,
              }));
            }}
            rowsPerPage={pagination.limit}
            setRowsPerPage={(limit) => {
              setPagination((prev) => ({
                ...prev,
                limit: limit,
                page: 1,
              }));
            }}
          />
        </div>
      </div>

      {editingTransaction && (
        <CategorizeTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          categories={categories}
          userEmail={userEmail}
          onUpdate={() => fetchTransactions(pagination.page)}
          onSuccess={() => fetchTransactions(pagination.page)}
          searchEmployees={searchEmployees}
          linkEmployee={linkEmployee}
          unlinkEmployee={unlinkEmployee}
          documents={documentsState[editingTransaction.id]?.docs || []}
          documentCount={documentsState[editingTransaction.id]?.count || 0}
          uploadDocument={uploadDocument}
          downloadDocument={downloadDocument}
          deleteDocument={deleteDocument}
          refreshDocuments={() => refreshDocuments(editingTransaction.id)}
        />
      )}

      {showBulkEdit && (
        <BulkEditTransactionModal
          isOpen={showBulkEdit}
          onClose={() => setShowBulkEdit(false)}
          transactions={transactions.filter((t) => selectedTransactions.has(t.id))}
          categories={categories}
          onUpdate={(ids, category) => {
            bulkUpdateTransactions(ids, category);
            setShowBulkEdit(false);
            setSelectedTransactions(new Set());
          }}
        />
      )}
    </div>
  );
}
