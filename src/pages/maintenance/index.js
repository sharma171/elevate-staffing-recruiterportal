import React from "react";
import styles from "./Maintenance.module.css";
import { Settings, Clock, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function Maintenance() {
  const renderRequestDemoSection = () => {
    return (
      <div className={styles.flexGrow}>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.centerRow}>
                <div className={styles.relative}>
                  <div className={styles.pulseBg} />
                  <div className={styles.iconWrap}>
                    <Settings className={styles.settingsIcon} />
                  </div>
                </div>
              </div>
              <div className={styles.titleBlock}>
                <h3 className={styles.cardTitle}>Under Maintenance</h3>
                <p className={styles.cardDescription}>We're making things better for you</p>
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.mutedBox}>
                <div className={styles.row}>
                  <div className={styles.iconBg}>
                    <Clock className={styles.smallIcon} />
                  </div>
                  <div>
                    <div className={styles.itemTitle}>Scheduled Maintenance</div>
                    <p className={styles.itemText}>
                      Our system is currently undergoing scheduled maintenance to improve performance and add new
                      features. We'll be back online shortly.
                    </p>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.iconBg}>
                    <CircleAlert className={styles.smallIcon} />
                  </div>
                  <div>
                    <div className={styles.itemTitle}>What's Happening?</div>
                    <p className={styles.itemText}>
                      We're upgrading our infrastructure, applying security patches, and implementing performance
                      improvements to serve you better.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.centerArea}>
                <p className={styles.expectedText}>Expected to be back online soon. Thank you for your patience!</p>

                <div className={styles.buttonRow}>
                  <Link className={styles.primaryButton} to="/">
                    Return Home
                  </Link>
                  <Link className={styles.secondaryButton} to="/requestademo?contact=true">
                    Contact Support
                  </Link>
                </div>
              </div>

              <div className={styles.footer}>
                <p className={styles.footerText}>
                  For urgent matters, please contact us at{" "}
                  <a className={styles.footerLink} href="mailto:support@elevatestaffing.ai">
                    support@elevatestaffing.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderRequestDemoSection()}

      <div>
        <footer className="legalFooter">
          <div className="container">
            <p>© 2025 ElevateStaffing AI. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
