import React, { useEffect, useState } from "react";
import styles from "./EditTransactionModal.module.css";
import { axiosApi, OverlayModal, ThemeLoader } from "../../../components";
import { useAuth } from "../../../authContext";
import { Bot } from "lucide-react";

const API = {
  BANK_STATEMENT_API_URL: "https://bank-statement-expenses-api-v3-305451280005.us-east1.run.app",
  EMPLOYEE_LINK_API_URL: "https://link-employee-to-expenses-v3-305451280005.us-east1.run.app",
};

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

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const { user } = useAuth();
  const EMPLOYER_EMAIL = user?.email;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("debit");
  const [confirmedCategory, setConfirmedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!transaction) {
      setDescription("");
      setAmount("");
      setTransactionType("debit");
      setConfirmedCategory("");
      setNotes("");
      setSelectedEmployee(null);
      return;
    }
    setDescription(transaction.description || "");
    setAmount(Math.abs(transaction.amount || 0).toString());
    setTransactionType(transaction.transaction_type || "debit");
    setConfirmedCategory(transaction.confirmed_category || transaction.category_code || "");
    setNotes(transaction.notes || "");
    if (transaction.linked_to_employee && transaction.employee_email) {
      setSelectedEmployee({
        id: transaction.employee_id,
        full_name: transaction.employee_name,
        email: transaction.employee_email,
      });
    } else {
      setSelectedEmployee(null);
    }
  }, [transaction]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setEmployees([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const t = setTimeout(() => {
      setLoader(true);
      axiosApi
        .post(API.EMPLOYEE_LINK_API_URL, {
          action: "search_employees",
          user_email: EMPLOYER_EMAIL,
          search_query: searchQuery,
          limit: 20,
        })
        .then((resp) => {
          const res = resp.data;
          if (res && res.status === "success") setEmployees(res.employees || []);
          else setEmployees([]);
        })
        .catch(() => setEmployees([]))
        .finally(() => {
          setSearching(false);
          setLoader(false);
        });
    }, 300);

    return () => clearTimeout(t);
  }, [searchQuery, EMPLOYER_EMAIL]);

  if (!isOpen || !transaction) return null;

  const suggestedCategoryCode = transaction.suggested_category;
  const confirmedCategoryCode = transaction.confirmed_category;
  const hasSuggestion = suggestedCategoryCode && suggestedCategoryCode !== confirmedCategoryCode;
  const confidencePct = Math.round((transaction.categorization_confidence || 0) * 100);
  const suggestionLabel = EXPENSE_CATEGORIES[suggestedCategoryCode] || suggestedCategoryCode || "Uncategorized";

  const updateTransaction = () => {
    setLoader(true);
    axiosApi
      .post(API.BANK_STATEMENT_API_URL, {
        action: "update_transaction",
        user_email: EMPLOYER_EMAIL,
        transaction_id: transaction.id,
        confirmed_category: confirmedCategory,
        description,
        amount: parseFloat(amount || "0"),
        transaction_type: transactionType,
        notes,
      })
      .then((resp) => {
        const res = resp.data;
        if (!res || res.status !== "success") return Promise.reject(res?.error || "update_failed");

        const wasLinked = !!transaction.linked_to_employee;
        const nowLinked = !!selectedEmployee;

        if (nowLinked && !wasLinked) {
          return axiosApi.post(API.EMPLOYEE_LINK_API_URL, {
            action: "link",
            user_email: EMPLOYER_EMAIL,
            entity_id: transaction.id,
            entity_type: "bank_transaction",
            employee_email: selectedEmployee.email,
            notes,
          });
        }

        return Promise.resolve({ data: { status: "success" } });
      })
      .then(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      })
      .catch(() => {})
      .finally(() => setLoader(false));
  };

  const handleUnlink = () => {
    setLoader(true);
    axiosApi
      .post(API.EMPLOYEE_LINK_API_URL, {
        action: "unlink",
        user_email: EMPLOYER_EMAIL,
        entity_id: transaction.id,
        entity_type: "bank_transaction",
      })
      .then(() => setSelectedEmployee(null))
      .catch(() => {})
      .finally(() => setLoader(false));
  };

  return (
    <OverlayModal isActive={isOpen} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <ThemeLoader show={loader} />
      <div onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Edit Transaction</div>
        </div>

        <div className={styles.content}>
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>Date</label>
              <input
                className={`inputSolidBorder ${styles.input}`}
                value={new Date(transaction.transaction_date).toLocaleDateString()}
                disabled
              />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Type</label>
              <select
                className={`form-select inputSolidBorder ${styles.select}`}
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input
              className={`inputSolidBorder ${styles.input}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Amount</label>
            <input
              className={`inputSolidBorder ${styles.input}`}
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>

            {hasSuggestion && (
              <div className={styles.suggestion}>
                <div className={styles.suggestionTop}>
                  <span className={styles.badge}>
                    <Bot size={12} /> AI Suggested
                  </span>
                  <div className={styles.suggestionName}>{suggestionLabel}</div>
                  <div className={styles.confidence}>{confidencePct}% Confidence</div>
                </div>
                {transaction.categorization_reasoning && (
                  <div className={styles.reasoning}>{transaction.categorization_reasoning}</div>
                )}
                <button
                  className={`${styles.btn} w-100 ${styles.btn_outline}`}
                  onClick={() => setConfirmedCategory(suggestedCategoryCode || "")}
                >
                  Accept Suggestion
                </button>
              </div>
            )}

            <select
              className={`form-select inputSolidBorder ${styles.select}`}
              value={confirmedCategory}
              onChange={(e) => setConfirmedCategory(e.target.value)}
            >
              <option value="">Select category...</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Link to Employee</label>

            {selectedEmployee ? (
              <div className={styles.linkCard}>
                <div>
                  <div className={styles.empName}>{selectedEmployee.full_name}</div>
                  <div className={styles.empEmail}>{selectedEmployee.email}</div>
                </div>
                <div>
                  <button className={`${styles.btn} ${styles.btn_ghost}`} onClick={handleUnlink}>
                    Unlink
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  className={`inputSolidBorder ${styles.input}`}
                  placeholder="Search employee (2+ chars)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <div className={styles.smallNote}>Searching...</div>}
                {employees.length > 0 && (
                  <div className={styles.empList}>
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className={styles.empRow}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSearchQuery("");
                          setEmployees([]);
                        }}
                      >
                        <div className={styles.empName}>{emp.full_name}</div>
                        <div className={styles.empEmail}>{emp.email}</div>
                        {emp.job_title && <div className={styles.empJob}>{emp.job_title}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <textarea
              className={`inputSolidBorder ${styles.textarea}`}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className={`px-0 ${styles.footer}`}>
          <button className={`${styles.btn} ${styles.btn_ghost}`} onClick={onClose} disabled={loader}>
            Cancel
          </button>
          <button
            className="themeButton themeButtonHover px-3 py-2 rounded"
            onClick={updateTransaction}
            disabled={loader}
          >
            {loader ? "Updating..." : "Update Transaction"}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
