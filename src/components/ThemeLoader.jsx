import React from "react";
import styles from "./css/ThemeLoader.module.css";

function ThemeLoader({ show, fixed, message = "" }) {
  if (!show) {
    return <></>;
  }

  if (message) {
    return (
      <div
        style={{
          backdropFilter: "blur(0px)",
          background: "#0003",
        }}
        className={`${fixed ? styles.MainLoadingFixed : styles.MainLoading} loadingContainer`}
      >
        <div className={styles["loading-container"]}>
          <div className="bg-white d-flex flex-column p-4 py-5 justify-content-center gap-4 align-items-center rounded-3">
            <div className={styles.spinner}></div>
            <div className="mt-2">{message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fixed ? styles.MainLoadingFixed : styles.MainLoading} loadingContainer`}>
      <div className={styles["loading-container"]}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}

export default ThemeLoader;
