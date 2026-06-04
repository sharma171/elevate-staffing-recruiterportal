import React, { useEffect, useState } from "react";
import "./userstyle.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import makeRequest from "../../helpers/http-request";
import { ReactComponent as PasswordIcon } from "../../assets/images/PasswordIcon.svg";
import QuoteIcon from "../../assets/images/QuoteIcon.png";
import styles from "../../components/css/Logout.module.css";
import "../loginstyle.css";
import pageStyles from "../css/loginSignup.module.css";
import { ThemeLoader } from "../../components";

import images from "../../assets/images/new";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import { callGetSession, getDeviceData } from "../../DeviceStore";
import sendEncryptedRequest from "../../components/EncryptedRequest";

const { themelogo } = images;

const ResetUserPassword = ({ userType }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [changeType, setChangeType] = useState("");
  const [loginUserType, setLoginUserType] = useState("");
  const [error, setError] = useState();
  const [passwordVisible, setPasswordVisible] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  let isEmployee = loginUserType == "Employee";

  let { keys, fingerprints } = getDeviceData();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  useEffect(() => {
    const passwordChangeType = localStorage.getItem("passwordChangeType") || "";
    setLoginUserType(userType);
    setChangeType(passwordChangeType);
  }, [userType]);

  function decodeEmailFromToken(token) {
    const [first] = token.split(".");
    const b64 = first.replace(/-/g, "+").replace(/_/g, "/");
    return atob(b64).replace(/^"|"$/g, "");
  }

  const storedPassword = localStorage.getItem("passwordResetEmail") || "";

  const employerApi = "https://user-authentication-api-wp-v3-305451280005.us-east1.run.app";
  const employeeApi = "https://employee-authentication-api-wp-v3-305451280005.us-east1.run.app";

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!password.newPassword) {
        return setError("Please enter new password");
      }

      if (password.newPassword != password.confirmPassword) {
        setError("Both passwords should be same");
        return;
      }

      if (!token) {
        return;
      }

      let emailId = decodeEmailFromToken(token);

      if (!emailId) {
        return;
      }

      setLoader(true);

      const formData = {
        action: "update-password",
        email: emailId,
        new_password: password.newPassword,
        token: token,
      };

      let AuthURL = isEmployee ? employeeApi : employerApi;

      let keysData = await callGetSession(
        emailId,
        AuthURL,
        isEmployee
          ? {
              request_type: "get_employee_auth_session",
            }
          : {}
      );

      let res = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !res.status;
      const data = res.data;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (res?.status) {
        setLoader(false);
        setPopupOverlay({
          message: "You have successfully changed your password",
          title: "Password Reset",
          subhead: "Login again with new password",
          button: "Log In",
        });
      } else {
        setError(res?.response?.data?.message);
        setPopupOverlay({
          message: "Your Password Reset Unsuccessful",
          title: "Password Reset",
          subhead: "Try again",
          button: "Log In",
        });
      }
    } catch (err) {
      console.log(err);
      setPopupOverlay({
        message: "Your Password Reset Unsuccessful",
        title: "Password Reset",
        subhead: "Try again",
        button: "Log In",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setError("");
    setPassword((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value.replace(/\s+/g, ""),
      };
    });
  };

  const renderSocialIcons = () => {
    return (
      <div className="mt-2 gap-2 d-flex align-items-end">
        <a
          target="_blank"
          href="https://www.linkedin.com/company/elevatestaffing-ai/about/?viewAsMember=true"
          className="linkedinSimpleSocialButton"
          style={{ color: "rgb(40, 87, 218)", padding: "8px" }}
        >
          <Linkedin size={22} />
        </a>
        <a
          target="_blank"
          style={{ padding: "8px" }}
          href="https://www.youtube.com/@ElevatestaffingAI"
          className="youTubeSimpleSocialButton mt-1"
        >
          <Youtube style={{ color: "red" }} size={23} />
        </a>
        <a
          target="_blank"
          style={{ padding: "8px" }}
          href="https://www.instagram.com/elevatestaffing.ai/?hl=en"
          className="youTubeSimpleSocialButton mt-1"
        >
          <div className="instagramISimpleSocialButton" />
        </a>
        <a
          target="_blank"
          style={{ padding: "8px" }}
          href="https://www.facebook.com/profile.php?id=61582449860561"
          className="linkedinSimpleSocialButton mt-1"
        >
          <Facebook style={{ color: "#2F88FF" }} size={23} />
        </a>
      </div>
    );
  };

  let loginPath = isEmployee ? "/employeelogin" : "/login";

  return (
    <>
      {popupOverlay && (
        <>
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmModal}>
              <div className={`${styles.modalHeader} d-flex align-items-center justify-content-between`}>
                <h3>{popupOverlay?.title ? popupOverlay?.title : "status"}</h3>
                <span
                  class="material-symbols-outlined pointer"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  close
                </span>
              </div>
              <div className={`d-flex flex-column align-items-center ${styles.modalBody}`}>
                <div className={`${styles.confirmHeading}`}>
                  <div className="fw-bold">{popupOverlay?.message}</div>
                  <div>{popupOverlay?.subhead}</div>
                </div>

                <div className={styles.buttonContainer}>
                  {loginUserType == "Employee" ? (
                    <>
                      <button
                        onClick={() => {
                          navigate("/employeelogin");
                        }}
                        className={`${styles.confirmButton} ${styles.confirmYes}`}
                      >
                        <span class="logout-icon " />
                        {popupOverlay?.button}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate("/login");
                        }}
                        className={`${styles.confirmButton} ${styles.confirmYes}`}
                      >
                        <span class="logout-icon " />
                        {popupOverlay?.button}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div
        className="d-lg-flex gap-3 p-0 m-0"
        style={{ minHeight: "100dvh", boxSizing: "border-box", overflow: "hidden" }}
      >
        <div className={`p-3 py-4 px-lg-4 ${pageStyles.leftScroller}`} style={{ minWidth: "40%" }}>
          <div>
            <img
              onClick={() => navigate("/")}
              className="pointer"
              src={themelogo}
              alt=""
              style={{ width: "80px", marginLeft: "30px" }}
            />
          </div>
          <div className="d-flex justify-content-around align-items-center flex-column h-100 w-100 my-auto">
            <div>
              <h3 className="login-title my-3">
                {changeType === "true" ? <>Change Your Password</> : <>Reset your password?</>}
              </h3>
              <form className="mb-3" onSubmit={handlePasswordSubmit}>
                <span className="font14 fontgray d-block mb-1">Password</span>
                <div className="svgiconinput mb-3 svgiconinputRight">
                  <PasswordIcon />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control"
                    style={{ minHeight: "45px" }}
                    // value={loginPassword}
                    name="newPassword"
                    onChange={(e) => handlePasswordChange(e)}
                    placeholder="Enter Password"
                  />
                  <div className="password-toggle svg" onClick={togglePasswordVisibility}>
                    {passwordVisible ? "👁️" : "👁️‍🗨️"}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="font14 fontgray d-block mb-1">Confirm Password</span>
                  <div className="mb-3">
                    <div className="svgiconinput svgiconinputRight">
                      <PasswordIcon />
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="form-control"
                        style={{ minHeight: "45px" }}
                        // value={loginPassword}
                        name="confirmPassword"
                        onChange={(e) => handlePasswordChange(e)}
                        placeholder="Re-Enter Password"
                      />
                      <div className="password-toggle svg" onClick={togglePasswordVisibility}>
                        {passwordVisible ? "👁️" : "👁️‍🗨️"}
                      </div>
                    </div>
                    {error ? <div className="text-danger mt-1"> {error}</div> : <></>}{" "}
                  </div>
                </div>

                <button
                  type="submit"
                  className="themeButton form-control my-3 pe-2 mt-4 radius5"
                  onClick={handlePasswordSubmit}
                >
                  Confirm Password
                </button>
              </form>
            </div>

            <div className="px-2">
              <div className={pageStyles.ordiv}>
                <span>or</span>
              </div>

              <div className="signup fontgray text-center my-2">
                Do you have an account?
                <Link to={loginPath} className="themeColor pointer ms-2 fw-bold text-decoration-none">
                  Log In
                </Link>
              </div>

              <div
                className="themeColor pointer fw-bold text-center"
                onClick={() => {
                  navigate("/");
                }}
              >
                Back to Home
              </div>
            </div>
            {renderSocialIcons()}
          </div>
          <div className="mt-auto"></div>
        </div>

        <div className={`${isEmployee ? pageStyles.brandImageEmp : pageStyles.brandImage} w-75 d-none d-lg-block`}>
          <div className={pageStyles.quoteIcon}>
            <img src={QuoteIcon} alt="" className={pageStyles.icon} />
          </div>
          <div className={pageStyles.brandText}>
            <p className={pageStyles.headings}>
              Empowering Recruiters <span>with</span> AI‑Driven Efficiency <span>for Smarter Hiring!</span>
            </p>
            <span className={pageStyles.name}>– ElevateStaffing</span>
          </div>
        </div>
      </div>
      <ThemeLoader show={isLoading} />
    </>
  );
};

export default ResetUserPassword;
