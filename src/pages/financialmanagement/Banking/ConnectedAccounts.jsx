import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Building2, Loader2, RefreshCw, Trash2, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosApi, ThemeLoader } from "../../../components";
import styles from "./ConnectedAccounts.module.css";
import { useAuth } from "../../../authContext";

export const STRIPE_CONFIG = {
  publishableKey:
    "pk_live_51S3Pto8zSw62qsO3FMqLxRejeoYmFKObhFSArF94E5zVZiQpEdwmjI8rbM6nXs4nyAGdy04C0kUlD4gNACso3gtR00xHTFEpz1",
  apiBaseUrl: "https://stripe-financial-connections-api-v3-305451280005.us-east1.run.app",

  endpoints: {
    createSession: "/create-session",
    listAccounts: "/list-accounts",
    sync: "/sync",
    disconnect: "/disconnect",
    webhook: "/webhook",
  },
  authToken: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
};

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: STRIPE_CONFIG.authToken,
    Origin: window.location.origin,
  };
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "active") return styles.statusActive;
  if (s === "pending") return styles.statusPending;
  if (s === "disconnected") return styles.statusDisconnected;
  return styles.statusDefault;
}

export default function ConnectedAccounts({ onAccountSelect }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stripeInstance, setStripeInstance] = useState(null);

  const { user } = useAuth();
  const userEmail = user?.email;

  useEffect(() => {
    setLoading(true);
    axiosApi
      .get(
        `${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.listAccounts}?user_email=${encodeURIComponent(
          userEmail
        )}`,
        { headers: getHeaders() }
      )
      .then((res) => {
        const body = res.data || {};
        if (body.status === "success" && body.data && Array.isArray(body.data.accounts)) {
          setAccounts(body.data.accounts);
        } else if (Array.isArray(body.accounts)) {
          setAccounts(body.accounts);
        } else {
          setAccounts([]);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch connected accounts");
        setAccounts([]);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  useEffect(() => {
    loadStripe(STRIPE_CONFIG.publishableKey).then((s) => {
      setStripeInstance(s || null);
    });
  }, []);

  function refreshAccounts() {
    setOpLoading(true);
    axiosApi
      .get(
        `${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.listAccounts}?user_email=${encodeURIComponent(
          userEmail
        )}`,
        { headers: getHeaders() }
      )
      .then((res) => {
        const body = res.data || {};
        if (body.status === "success" && body.data && Array.isArray(body.data.accounts)) {
          setAccounts(body.data.accounts);
        } else if (Array.isArray(body.accounts)) {
          setAccounts(body.accounts);
        } else {
          setAccounts([]);
        }
      })
      .catch(() => {
        toast.error("Failed to refresh accounts");
      })
      .finally(() => setOpLoading(false));
  }

  function connectAccount() {
    setConnecting(true);
    axiosApi
      .post(
        `${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.createSession}`,
        { user_email: userEmail },
        { headers: getHeaders() }
      )
      .then((res) => {
        const body = res.data || {};
        const clientSecret = body.client_secret || (body.data && body.data.client_secret) || null;
        if (!clientSecret) {
          toast.error("No client secret from server");
          throw new Error("No client secret");
        }
        if (!stripeInstance) {
          toast.error("Stripe not initialized");
          throw new Error("Stripe not initialized");
        }
        return stripeInstance.collectFinancialConnectionsAccounts({ clientSecret });
      })
      .then((result) => {
        if (result && result.error) {
          toast.error(result.error.message || "Stripe connection failed");
        } else {
          toast.success("Bank account connected successfully");
          refreshAccounts();
        }
      })
      .catch((err) => {
        if (err && err.message && err.message !== "No client secret" && err.message !== "Stripe not initialized") {
          toast.error(err.message);
        }
      })
      .finally(() => setConnecting(false));
  }

  function syncAccount(accountId, daysBack = 90) {
    setOpLoading(true);
    axiosApi
      .post(
        `${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.sync}/${accountId}`,
        { user_email: userEmail, days_back: daysBack },
        { headers: getHeaders() }
      )
      .then((res) => {
        const body = res.data || {};
        if (body.status === "success") {
          const saved = body.data?.transactions_saved ?? null;
          const skipped = body.data?.transactions_skipped ?? 0;
          if (saved !== null) {
            toast.success(`Synced ${saved} new, ${skipped} existing transactions`);
          } else {
            toast.success("Transactions synced successfully");
          }
          refreshAccounts();
        } else {
          toast.error(body.error || "Sync failed");
        }
      })
      .catch(() => {
        toast.error("Failed to sync transactions");
      })
      .finally(() => setOpLoading(false));
  }

  function disconnect(accountId) {
    setOpLoading(true);
    axiosApi
      .delete(`${STRIPE_CONFIG.apiBaseUrl}${STRIPE_CONFIG.endpoints.disconnect}/${accountId}`, {
        data: { user_email: userEmail },
        headers: getHeaders(),
      })
      .then((res) => {
        const body = res.data || {};
        if (body.status === "success") {
          toast.success("Bank account disconnected");
          refreshAccounts();
        } else {
          toast.error(body.error || "Disconnect failed");
        }
      })
      .catch(() => {
        toast.error("Failed to disconnect account");
      })
      .finally(() => setOpLoading(false));
  }

  return (
    <div className={styles.container}>
      <ThemeLoader show={loading || opLoading} />
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Connected Bank Accounts</div>
          <p className={styles.subtitle}>Manage your bank connections and sync transactions</p>
        </div>
        <div>
          <button
            className="themeButton themeButtonHover px-3 py-2 rounded"
            onClick={connectAccount}
            disabled={connecting}
          >
            {connecting ? <Loader2 className={styles.btnLoader} /> : "Connect Bank"}
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <Building2 className={styles.buildingIcon} />
          </div>
          <h3 className={styles.emptyTitle}>No bank accounts connected</h3>
          <p className={styles.emptyText}>
            Connect your bank account to automatically sync transactions and manage your finances
          </p>
          <button className={styles.primaryBtn} onClick={connectAccount} disabled={connecting}>
            {connecting ? <Loader2 className={styles.btnLoader} /> : "Connect Bank"}
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {accounts.map((account, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => onAccountSelect && onAccountSelect(account.stripe_account_id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.iconWrap}>
                    <Building2 className={styles.buildingIconSmall} />
                  </div>
                  <div>
                    <div className={styles.bankName}>{account.bank_name}</div>
                    <div className={`capitalize ${styles.bankDesc}`}>{`${String(account.account_type).replaceAll(
                      "_",
                      " "
                    )} Account`}</div>
                  </div>
                </div>
                <div className={`capitalize ${styles.badge} ${statusClass(account.status)}`}>{account.status}</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.row}>
                  <div>
                    <div className={styles.label}>Account Type</div>
                    <div className={`capitalize ${styles.value}`}>
                      {String(account.account_type).replaceAll("_", " ")}
                    </div>
                  </div>
                  <div>
                    <div className={styles.label}>Account Number</div>
                    <div className={styles.value}>••••{account.last4}</div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div>
                    <div className={styles.label}>Initial Sync</div>
                    <div className={styles.value}>{account.initial_sync_completed ? "Completed" : "Pending"}</div>
                  </div>
                  <div>
                    <div className={styles.label}>Last Synced</div>
                    <div className={styles.valueSmall}>{formatDate(account.last_synced_at)}</div>
                  </div>
                </div>

                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.dropdown}>
                    <button className={styles.secondaryBtn}>
                      <RefreshCw className={styles.iconSmall} />
                      Sync Transactions
                      <ChevronDown className={styles.iconSmall} />
                    </button>
                    <div className={styles.menu}>
                      <div className={styles.menuDiv}>
                        <button onClick={() => syncAccount(account.stripe_account_id, 30)} className={styles.menuItem}>
                          Last 30 Days
                        </button>
                        <button onClick={() => syncAccount(account.stripe_account_id, 90)} className={styles.menuItem}>
                          Last 90 Days
                        </button>
                        <button onClick={() => syncAccount(account.stripe_account_id, 180)} className={styles.menuItem}>
                          Last 6 Months
                        </button>
                        <button onClick={() => syncAccount(account.stripe_account_id, 365)} className={styles.menuItem}>
                          Last Year
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.deleteWrapper}>
                    <button
                      title={`Disconnect ${account.bank_name} (••••${account.last4})`}
                      className={styles.ghostBtn}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Disconnect ${account.bank_name} (••••${account.last4})? This will stop syncing.`
                          )
                        ) {
                          disconnect(account.stripe_account_id);
                        }
                      }}
                    >
                      <Trash2 className={styles.iconSmall} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
