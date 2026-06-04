import React from "react";
import ElevateIcon from "./elevateIcon.svg";
import styles from "./MainFooter.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";

const MainFooter = () => {
  const loggedInUser = localStorage.getItem("userType");
  const { isLoggedIn } = useAuth();

  let isEmployee = String(loggedInUser).toLowerCase() == "employee";

  if (!isLoggedIn) {
    return <></>;
  }

  return (
    <div className={`${styles.footer}`} id="siteMainFooter">
      <div className="container">
        {/* <div>
          <div className={`d-flex flex-wrap justify-content-between align-items-center gap-4 ${styles.bottomBorder_}`}>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <img src={ElevateIcon} alt="" className={`${styles.footerlogo}`} />
              <div>Innovative software solutions for modern recruitment challenges.</div>
            </div>
            <div className="d-flex justify-content-between gap-3">
              <Link className={styles.footerLink} to="/privacypolicy">
                Privacy Policy
              </Link>
              <Link to="/termsofservice" className={styles.footerLink}>
                Terms of Service
              </Link>
              <Link to="/cookiespolicy" className={styles.footerLink}>
                Cookie Policy
              </Link>
              <Link to="/gdprpage" className={styles.footerLink}>
                GDPR Compliance
              </Link>
            </div>
          </div>
        </div> */}
        <div className="text-center font12">© 2025 ElevateStaffing AI. All Rights Reserved.</div>
      </div>
    </div>
  );
};

export default MainFooter;
