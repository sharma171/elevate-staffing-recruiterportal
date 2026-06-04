import React, { useState } from "react";
import styles from "./css/ConsentScreen.module.css";
import { ArrowLeft, Eye, Mail, Shield } from "lucide-react";
import ProviderAuth from "./ProviderAuth";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";

const ConsentScreen = ({ provider, accountEmail, onBack, onAllow, onCancel, isscrape, REDIRECT_URI_PATH }) => {
  const [checked, setChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isGoogle = provider === "google";
  const iconClass = isGoogle ? styles.google : styles.outlook;
  const accountText = isGoogle ? "Google account" : "Microsoft account";

  const perms = [
    {
      icon: <Mail />,
      title: "Send emails on your behalf",
      desc: "ElevateStaffing will be able to send professional emails from your account",
    },
    {
      icon: <Eye />,
      title: "Read your email contacts",
      desc: "Access your contacts to suggest relevant connections and networking opportunities",
    },
    {
      icon: <Shield />,
      title: "Access your profile information",
      desc: "Read basic profile details to personalize your ElevateStaffing experience",
    },
  ];

  if (showModal) {
    return (
      <ProviderAuth
        isscrape={isscrape}
        email={accountEmail}
        provider={provider}
        onBack={() => setShowModal(false)}
        REDIRECT_URI_PATH={REDIRECT_URI_PATH}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft /> Go Back
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconCircle}>{isGoogle ? <FaGoogle size={20} /> : <FaMicrosoft size={20} />}</div>
          </div>
          <h1 className={styles.title}>Authorize ElevateStaffing</h1>
          <p className={styles.subtext}>
            ElevateStaffing is requesting permission to access your {accountText} <span>{accountEmail}</span>
          </p>
        </div>

        <div className={styles.permBox}>
          <h3 className={styles.permHeader}>ElevateStaffing will be able to:</h3>
          <div className={styles.permList}>
            {perms.map((p, i) => (
              <div key={i} className={styles.permItem}>
                <div className={styles.permIcon}>{p.icon}</div>
                <div>
                  <div className={styles.permTitle}>{p.title}</div>
                  <div className={styles.permDesc}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.appBox}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className={styles.appIcon}>ES</div>
            <div className={styles.appDetails}>
              <div className={styles.appName}>ElevateStaffing</div>
              <div className={styles.appDesc}>Professional Career Assistant</div>
            </div>
          </div>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <div className={styles.subtext}>
            I understand and agree to allow ElevateStaffing to access my {accountText} with the permissions listed
            above. I can revoke this access at any time through my {isGoogle ? "Google" : "Microsoft"} account settings.
          </div>
        </label>

        <button
          className={styles.btnPrimary}
          disabled={!checked}
          onClick={() => {
            if (checked) {
              setShowModal(true);
            }
          }}
        >
          Allow Access
        </button>
        <button className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>

        <div className={styles.secNotice}>
          <div className={styles.secItem}>
            <div>
              <Shield />
            </div>
            <div className={styles.secText}>
              <div>
                <strong>Your security matters</strong>
              </div>
              <div>
                ElevateStaffing uses industry-standard OAuth 2.0 security. We never store your{" "}
                {isGoogle ? "Google" : "Microsoft"} password and you can revoke access at any time.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentScreen;
