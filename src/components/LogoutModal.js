import React from "react";
import styles from "./css/Logout.module.css";
import { X } from "lucide-react";

function LogoutModal(props) {
  const { show, callback } = props;

  if (!show) {
    return <></>;
  }

  return (
    <div className={`${styles.confirmOverlay} activeLogOutModal`}>
      <div className={styles.confirmModal}>
        <div className={`${styles.modalHeader} d-flex align-items-center justify-content-between`}>
          <h3>Log Out</h3>
          <span className="pointer" title="Close" onClick={() => callback(false)}>
            <X size={28} strokeWidth={2} />
          </span>
        </div>
        <div className={`d-flex flex-column align-items-center ${styles.modalBody}`}>
          <div className={`${styles.confirmHeading}`}>
            <div className="fw-bold">Are you sure you want to log out?</div>
            <div>You may need to sign in again to access your account.</div>
          </div>

          <div className={styles.buttonContainer}>
            <button onClick={() => callback(true)} className={`${styles.confirmButton} ${styles.confirmYes}`}>
              <span class="logout-icon " />
              Logout
            </button>
            <button onClick={() => callback(false)} className={`${styles.confirmButton} ${styles.confirmCancel}`}>
              <span class="closeicon">
                <X size={20} strokeWidth={2} />
              </span>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
