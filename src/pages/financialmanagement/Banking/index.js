import React, { useState } from "react";
import BankTransactionsList from "./BankTransactionsList";
import { ArrowLeft, Landmark } from "lucide-react";
import styles from "./Banking.module.css";
import ConnectedAccounts from "./ConnectedAccounts";

export default function Banking() {
  const userEmail = window?.__API_CONFIG__?.TEST_EMPLOYER_EMAIL || "";
  const [selectedAccountId, setSelectedAccountId] = useState();
  const [activeTab, setActiveTab] = useState("accounts");

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
    setActiveTab("transactions");
  };

  const handleBackToAccounts = () => {
    setSelectedAccountId(undefined);
    setActiveTab("accounts");
  };

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="flex-column align-items-start mb-3">
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <Landmark size={25} />
          Banking
        </h3>
        <div className="text-muted">Manage your bank connections and view transactions</div>
      </div>

      <div className="tabs_container mb-3">
        <button
          className={`tabs_button ${activeTab === "accounts" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          Connected Accounts
        </button>
        <button
          className={`tabs_button ${activeTab === "transactions" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      <div>
        {activeTab === "accounts" && <ConnectedAccounts userEmail={userEmail} onAccountSelect={handleAccountSelect} />}

        {activeTab === "transactions" && (
          <>
            {selectedAccountId && (
              <button className={styles.backBtn} onClick={handleBackToAccounts}>
                <ArrowLeft className={styles.icon} />
                Back to Accounts
              </button>
            )}
            <BankTransactionsList userEmail={userEmail} accountId={selectedAccountId} />
          </>
        )}
      </div>
    </div>
  );
}
