// DefaultFooter.jsx
import React from "react";
import styles from "./MainFooter.module.css";
import { Link } from "react-router-dom";

const DefaultFooter = () => {
  const links = [
    { to: "/privacypolicy", label: "Privacy Policy" },
    { to: "/termsofservice", label: "Terms of Service" },
    { to: "/cookiespolicy", label: "Cookie Policy" },
    { to: "/gdprpage", label: "GDPR Compliance" },
  ];

  return (
    <div className={styles.footer} id="siteMainFooter">
      <div className={`container ${styles.footerFlex}`}>
        <div className={`text-center font12 ${styles.orderFirst}`}>© 2025 ElevateStaffing AI. All Rights Reserved.</div>
        <div className={styles.orderSecond}>
          <div className={`d-flex flex-wrap justify-content-between align-items-center gap-4 ${styles.bottomBorder_}`}>
            <div className="d-flex justify-content-between gap-3">
              {links.map(({ to, label }) => (
                <Link key={to} to={to} target="_blank" className={styles.footerLink}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultFooter;
