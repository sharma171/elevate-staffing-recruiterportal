import React, { useEffect, useState } from "react";
import { ArrowLeft, Search, Edit, User, Filter } from "lucide-react";
import { axiosApi, ThemeLoader, CustomPagination } from "../../../components";
import styles from "./BankStatementTransactions.module.css";
import { useAuth } from "../../../authContext";
import EditTransactionModal from "./EditTransactionModal";
import BulkEditTransactionModal from "../Banking/BulkEditTransactionModal";

const BANK_STATEMENT_API_URL = "https://bank-statement-expenses-api-v3-305451280005.us-east1.run.app";

const EXPENSE_CATEGORIES = {
  TRAVEL: "Travel",
  MEALS: "Meals",
  OFFICE: "Office Supplies",
  SOFTWARE: "Software",
  MARKETING: "Marketing",
  OTHER: "Other",
};

export default function BankStatementTransactions({ statementId, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loader, setLoader] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [opLoading, setOpLoading] = useState(false);

  const { user } = useAuth();
  const TEST_EMPLOYER_EMAIL = user?.email;

  useEffect(() => {
    fetchTransactions();
  }, [statementId, searchText, typeFilter, categoryFilter, statusFilter, offset, limit]);

  function fetchTransactions() {
    setLoading(true);
    setLoader(true);
    const payload = {
      action: "list_transactions",
      user_email: TEST_EMPLOYER_EMAIL,
      statement_id: statementId,
      search_text: searchText || undefined,
      transaction_type: typeFilter !== "all" ? typeFilter : undefined,
      category_code: categoryFilter !== "all" ? categoryFilter : undefined,
      categorization_status: statusFilter !== "all" ? statusFilter : undefined,
      limit,
      offset,
    };
    axiosApi
      .post(BANK_STATEMENT_API_URL, payload)
      .then((resp) => resp?.data || resp)
      .then((result) => {
        if (result && result.status === "success") {
          setTransactions(result.transactions || []);
          setTotalRecords(result.pagination?.total_count || (result.transactions ? result.transactions.length : 0));
          setSelectedTransactions(new Set());
        } else {
          setTransactions([]);
          setTotalRecords(0);
          setSelectedTransactions(new Set());
        }
      })
      .catch(() => {
        setTransactions([]);
        setTotalRecords(0);
        setSelectedTransactions(new Set());
      })
      .finally(() => {
        setLoading(false);
        setLoader(false);
      });
  }

  function bulkUpdateTransactions(ids, category) {
    setOpLoading(true);
    const url = `${BANK_STATEMENT_API_URL}/transactions/bulk-update`;
    axiosApi
      .post(url, {
        user_email: TEST_EMPLOYER_EMAIL,
        transaction_ids: ids,
        updates: {
          confirmed_category: category,
        },
        action: "bulk_update_transactions",
      })
      .then((res) => res?.data || res)
      .then(() => {
        fetchTransactions();
        setSelectedTransactions(new Set());
      })
      .catch(() => {})
      .finally(() => {
        setOpLoading(false);
      });
  }

  function openEdit(transaction) {
    setSelectedTransaction(transaction);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setSelectedTransaction(null);
  }

  function handleSelectAll(checked) {
    if (checked) {
      const ids = transactions.map((t, i) => (t.id !== undefined ? t.id : i));
      setSelectedTransactions(new Set(ids));
    } else {
      setSelectedTransactions(new Set());
    }
  }

  function handleSelectTransaction(id, checked) {
    const next = new Set(selectedTransactions);
    checked ? next.add(id) : next.delete(id);
    setSelectedTransactions(next);
  }

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const formatAmount = (amt, type) => {
    const formatted = "$" + Math.abs(Number(amt || 0)).toLocaleString(undefined);
    return type === "debit" ? `-${formatted}` : formatted;
  };

  return (
    <div className={styles.container}>
      <ThemeLoader show={loader || loading || opLoading} />
      <div className={styles.header}>
        <div className="pointer d-flex gap-2 align-items-center my-3" onClick={onBack}>
          <ArrowLeft size={20} />
          <div className={styles.title}>Statement Transactions</div>
        </div>

        {selectedTransactions.size > 0 && (
          <button
            type="button"
            className="themeButton themeButtonHover px-3 py-2 rounded"
            onClick={() => setShowBulkEdit(true)}
          >
            Edit {selectedTransactions.size} Selected
          </button>
        )}
      </div>

      <div className="card mb-4 p-3" style={{ borderColor: "#e6eef8" }}>
        <div className="responsiveLayout mb-3">
          <div className="d-flex gap-2 p-relative d-flex align-items-center gap-2">
            <Search size={18} className="p-absolute" style={{ left: "8px" }} />
            <input
              className="searchInputGlobal form-input"
              style={{ paddingLeft: "30px" }}
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="searchInputGlobal form-select"
            >
              <option value="all">All Types</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="searchInputGlobal form-select"
            >
              <option value="all">All Categories</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="searchInputGlobal form-select"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="suggested">Suggested</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center"
            onClick={() => {
              setSearchText("");
              setCategoryFilter("all");
              setStatusFilter("all");
              setTypeFilter("all");
              setOffset(0);
            }}
          >
            <Filter size={16} className="me-2" />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="card mb-4" style={{ borderColor: "#e6eef8" }}>
        {loading ? (
          <div className={styles.center}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className={styles.center}>No transactions found</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className={`table table-hover`}>
                <thead>
                  <tr>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      <input
                        type="checkbox"
                        className="round-checkbox"
                        checked={transactions.length > 0 && selectedTransactions.size === transactions.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      Date
                    </th>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      Description
                    </th>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      Type
                    </th>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      Category
                    </th>
                    <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                      Amount
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
                  {transactions.map((t, index) => {
                    const id = t.id !== undefined ? t.id : index;
                    return (
                      <tr key={id} style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            className="round-checkbox"
                            checked={selectedTransactions.has(id)}
                            onChange={(e) => handleSelectTransaction(id, e.target.checked)}
                          />
                        </td>
                        <td className="py-3">{t.transaction_date}</td>
                        <td className="py-3" style={{ maxWidth: "250px", overflow: "hidden" }}>
                          <div className="text-truncate" style={{ maxWidth: "300px" }} title={t.description}>
                            {t.description}
                          </div>

                          {t.linked_to_employee && (
                            <div className={styles.employee}>
                              <User className={styles.userIcon} /> {t.employee_name}
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <div
                            className={`capitalize ${t.transaction_type == "debit" ? "inactiveBadge" : "activeBadge"}`}
                          >
                            {t.transaction_type}
                          </div>
                        </td>
                        <td className="py-3">
                          {t.confirmed_category ||
                            t.suggested_category ||
                            EXPENSE_CATEGORIES[t.category_code] ||
                            "Uncategorized"}
                        </td>
                        <td className="py-3">
                          <div
                            className={`fw-semibold ${t.transaction_type == "debit" ? "text-danger" : "text-success"}`}
                          >
                            {formatAmount(t.amount, t.transaction_type)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="statusBadgenew capitalize">{t.categorization_status}</div>
                        </td>
                        <td className="py-3">
                          <div title="Edit" className="pointer" onClick={() => openEdit(t)}>
                            <Edit size={16} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          </>
        )}
      </div>

      <EditTransactionModal
        isOpen={editOpen}
        onClose={closeEdit}
        transaction={selectedTransaction}
        onSuccess={fetchTransactions}
      />

      {showBulkEdit && (
        <BulkEditTransactionModal
          isOpen={showBulkEdit}
          onClose={() => setShowBulkEdit(false)}
          transactions={transactions.filter((t, i) => {
            const id = t.id !== undefined ? t.id : i;
            return selectedTransactions.has(id);
          })}
          categories={Object.keys(EXPENSE_CATEGORIES)}
          onUpdate={(ids, category) => {
            bulkUpdateTransactions(ids, category);
            setShowBulkEdit(false);
          }}
        />
      )}
    </div>
  );
}
