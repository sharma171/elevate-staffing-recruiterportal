import React from "react";
import styles from "./css/BankingInfo.module.css";
import { IoCardOutline } from "react-icons/io5";

function BankingInfo({ candidateDetails }) {
  const accounts = candidateDetails?.direct_deposit_accounts?.accounts || [];
  const totalSplit = accounts.reduce((acc, item) => acc + item.percentage, 0);

  return (
    <div className={styles.container}>
      <div className="mb-3">
        <div className={styles.titleRow}>
          <IoCardOutline size={20} className={styles.icon} />
          <h2 className={styles.title}>Banking Information</h2>
        </div>
        <p className={styles.subtitle}>Direct deposit and banking details</p>
      </div>

      <div className={styles.grid}>
        {accounts.map((acc) => (
          <div className={`${styles.card}`} key={acc.id}>
            <div>
              <div className="d-sm-flex d-block justify-content-between">
                <div className="mb-4">
                  <h3 className={styles.bankName}>{acc.bank_name}</h3>
                  <p className={styles.accountType}>
                    {acc.account_type} Account {acc.is_primary ? "(Primary)" : ""}
                  </p>
                </div>

                <div className={`mb-4 ${styles.percentage}`}>
                  <div className="text-center">{acc.percentage}%</div>
                  <div className={styles.depositSplit}>Deposit Split</div>
                </div>
              </div>

              <div className={`d-sm-flex d-block ${styles.infoRow}`}>
                <div className={`${styles.infoItem}`}>
                  <div>
                    <strong>Routing Number</strong>
                  </div>
                  <div>{acc.routing_number}</div>
                </div>

                <div className="border-end d-sm-block d-none" style={{ "--bs-border-width": "2px" }} />

                <div className={`${styles.infoItem}`}>
                  <div>
                    <strong>Account Number</strong>
                  </div>

                  <div> {acc.account_number}</div>
                </div>
                <div />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.checkmark}>✓</span>
        <span className={styles.totalText}>Total Allocation {totalSplit}%</span>
      </div>
    </div>
  );
}

export default BankingInfo;
