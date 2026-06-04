import React from "react";
import styles from "./css/confirm.module.css";
// import images from "../assets/images/new";

// const { closeIcon } = images;

function Confirm({ result = () => {}, show, title = "", text = "", deleteTitle, icon, hideCancel = false }) {
  if (!show) {
    return <></>;
  }

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmModal}>
        <div className={`${styles.modalHeader} d-flex align-items-center justify-content-between`}>
          <h3> {title || "Confirm"}</h3>
          <span title="Close" class="material-symbols-outlined pointer hidemodalclosebtn" onClick={() => result(false)}>
            close
          </span>
        </div>
        <div className={`d-flex flex-column align-items-center ${styles.modalBody}`}>
          {/* <span className={`person-question-mark ${styles.userIcon}`} /> */}
          <div className={styles.confirmHeading} dangerouslySetInnerHTML={{ __html: text }}></div>
          {/* <p className={styles.confirmText}>Press OK to continue, or Cancel to stay on the current Page.</p> */}

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => result(true)}
              className={`${styles.confirmButton} ${styles.confirmYes}`}
            >
              <span class="material-symbols-outlined">{icon || "check"}</span>
              {deleteTitle || "Delete"}
            </button>
            {hideCancel ? (
              <></>
            ) : (
              <button
                type="button"
                onClick={() => result(false)}
                className={`${styles.confirmButton} ${styles.confirmCancel}`}
              >
                <span class="material-symbols-outlined closeicon">close</span>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirm;
