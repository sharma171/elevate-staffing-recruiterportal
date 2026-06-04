import React, { useState } from "react";
import { FileUp, TrendingUp } from "lucide-react";
import OrganizationExpensesView from "./OrganizationExpensesView";
import BankStatementUploadModal from "./BankStatementUploadModal";
import BankStatementsList from "./BankStatementsList";
import BankStatementTransactions from "./BankStatementTransactions";
import styles from "./OrganizationExpenses.module.css";
import { useAuth } from "../../../authContext";

export default function OrganizationExpenses() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStatementId, setSelectedStatementId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("expenses");

  const { user } = useAuth();

  const employerEmail = user?.email;
  const employeeEmail = user?.email;

  const handleUploadSuccess = () => setRefreshTrigger((p) => p + 1);
  const handleSelectStatement = (id) => {
    setSelectedStatementId(id);
    setActiveTab("statements");
  };
  const handleBackToList = () => {
    setSelectedStatementId(null);
    setRefreshTrigger((p) => p + 1);
    setActiveTab("statements");
  };

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="flex-column align-items-start mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
            <TrendingUp size={25} />
            Organization Expenses
          </h3>
          <button
            className="themeButton themeButtonHover p-2 px-3 rounded gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <FileUp size={20} />
            Import Bank Statement
          </button>
        </div>
        <div className="text-muted">Track and manage company-wide expenses</div>
      </div>

      <div className="tabs_container mb-3">
        <button
          className={`tabs_button ${activeTab === "expenses" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          Expenses
        </button>
        <button
          className={`tabs_button ${activeTab === "statements" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("statements")}
        >
          Bank Statements
        </button>
      </div>

      <main className={styles.panels}>
        {activeTab === "expenses" && (
          <OrganizationExpensesView employerEmail={employerEmail} employeeEmail={employeeEmail} />
        )}

        {activeTab === "statements" &&
          (selectedStatementId ? (
            <BankStatementTransactions statementId={selectedStatementId} onBack={handleBackToList} />
          ) : (
            <BankStatementsList onSelectStatement={handleSelectStatement} refreshTrigger={refreshTrigger} />
          ))}
      </main>

      <BankStatementUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
