import React from "react";
import styles from "./css/ThemeLoader.module.css";

function Loader({ show }) {
  return (
    <div className={styles.MainLoading}>
      <div className={styles["loading-container"]}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}
export default Loader;
