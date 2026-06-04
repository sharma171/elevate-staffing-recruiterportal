import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./loginstyle.css";
import { ReactComponent as MailIcon } from "../assets/images/mailIcon.svg";
import { ReactComponent as PasswordIcon } from "../assets/images/PasswordIcon.svg";
import { ReactComponent as AuthIcon } from "../assets/images/AuthIcon.svg";
import QuoteIcon from "../assets/images/QuoteIcon.png";
import styles from "../components/css/Logout.module.css";
import images from "../assets/images/new";
import { ThemeLoader } from "../components";
import pageStyles from "./css/loginSignup.module.css";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import { callGetSession, getDeviceData } from "../DeviceStore";
import sendEncryptedRequest from "../components/EncryptedRequest";

const { themelogo } = images;
let AuthURL = "https://employee-authentication-api-wp-v3-305451280005.us-east1.run.app";

const EmployeeloginSignUp = () => {
  const { isLoggedIn, login, orgData } = useAuth();
  const [popupOverlay, setPopupOverlay] = useState(null);
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeysData, setApiKeysData] = useState(false);

  let { keys, fingerprints } = getDeviceData();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn === true) {
        navigate("/dashboard");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const handler = (e) => {
      let maintenance_mode = e.detail || window.maintenance_mode;
      if (maintenance_mode) {
        navigate("/maintenance");
      }
    };

    window.addEventListener("maintenance-change", handler);

    return () => {
      window.removeEventListener("maintenance-change", handler);
    };
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setLoginError("");
    setOtp(["", "", "", "", "", ""]);
  };

  function swapEmailValues(data) {
    data.login_email = data.email;
    data.email = data.original_email;
    return data;
  }

  const SignIn = async () => {
    setIsLoading(true);

    const formData = {
      action: "sign-in",
      email: loginEmail,
      password: loginPassword,
    };

    try {
      let keysData = await callGetSession(loginEmail, AuthURL, { request_type: "get_employee_auth_session" });
      setApiKeysData(keysData);
      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      orgData(data);

      if (data.password_change_required == true) {
        setActiveTab("changepassword");
        setLoginPassword("");
        return;
      }

      if (data.requires_verification === true) {
        handleTabClick("verifypassword");
        setPopupOverlay({
          message: "Verification code has been sent",
          title: "Email Status",
          subhead: "check your registered email.",
          button: "ok",
        });
      } else {
        let loginData = swapEmailValues(data);
        login(loginData);
        localStorage.setItem("userType", "employee");
        navigate("/dashboard");
      }
    } catch (error) {
      setLoginError(error.message);
      setPopupOverlay({
        message: "Login failed. Please try again",
        title: "Login Failed",
        subhead: error.message,
        button: "ok",
      });
    } finally {
      setIsLoading(false); // Hide loading spinner when the request is done
    }
  };

  const sendResetPassword = async () => {
    setIsLoading(true);

    const formData = {
      action: "send-password-reset",
      email: loginEmail,
    };

    try {
      let keysData = await callGetSession(loginEmail, AuthURL, { request_type: "get_employee_auth_session" });

      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (activeTab === "resetpassword") {
        localStorage.setItem("passwordResetEmail", loginEmail);
        localStorage.setItem("userType", "Employee");
        localStorage.setItem("passwordChangeType", false);
      }
      if (activeTab === "changepassword") {
        localStorage.setItem("passwordChangeType", true);
        localStorage.setItem("userType", "Employee");
      }

      let messages = {
        "Password reset link has been sent":
          "We've sent a password reset link to your registered email. Please check your inbox.",
        "Email doesn't exist": "We couldn't reset your password — please check your email address and try again.",
      };

      let message = messages[data.message] || data.message;

      setPopupOverlay({
        message: message,
        title: "Password Reset",
        subhead: "",
        button: "ok",
      });
      // setTimeout(()=>{setPopupOverlay(false)},2600);
    } catch (error) {
      setLoginError(error.message);

      setPopupOverlay({ message: error.message });
      setPopupOverlay({
        message: "Password reset failed",
        title: "Password Reset Status",
        subhead: "Entered Invalid Email Id, Please check your email id.",
        button: "ok",
      });
      // setTimeout(()=>{setPopupOverlay(false)},2600);
    } finally {
      setIsLoading(false); // Hide loading spinner when the request is done
    }
  };
  const VerificationOtp = async () => {
    setIsLoading(true);

    const formData = {
      action: "verify-code",
      email: loginEmail,
      verification_code: otp.join(""),
    };

    try {
      let keysData = apiKeysData;
      if (!apiKeysData) {
        keysData = await callGetSession(loginEmail, AuthURL, { request_type: "get_employee_auth_session" });
      }

      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (data.password_change_required == true) {
        setActiveTab("changepassword");
        setLoginPassword("");
      } else {
        let loginData = swapEmailValues(data);
        login(loginData); // Pass the entire user data to the login function
        localStorage.setItem("userType", "employee");
        navigate("/dashboard"); // Navigate to the dashboard
      }
    } catch (error) {
      setLoginError(error.message);
      setPopupOverlay({
        message: "Authentication Failed",
        title: "Login Status",
        subhead: "Please verify code and try again.",
        button: "ok",
      });
      // setTimeout(()=>{setPopupOverlay(false)},2600);
    } finally {
      setIsLoading(false); // Hide loading spinner when the request is done
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const passwordChangeRequest = async () => {
    setIsLoading(true);
    if (loginPassword !== changePassword) {
      setLoginError("New password and confirm password are not same.");
      setIsLoading(false);
      return;
    }

    const formData = {
      action: "update-password",
      email: loginEmail,
      new_password: changePassword,
    };

    try {
      let keysData = apiKeysData;
      if (!apiKeysData) {
        keysData = await callGetSession(loginEmail, AuthURL, { request_type: "get_employee_auth_session" });
      }

      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      handleTabClick("tab1");
      setLoginPassword("");
      setPopupOverlay({
        message: "You have successfully changed your password.",
        title: "Change Password",
        subhead: "check your registered email.",
        button: "Login",
      });
    } catch (error) {
      setLoginError(error.message);
      setPopupOverlay({
        message: "Channge Password Request Failed.",
        title: "Change Password",
        subhead: error.message,
        button: "ok",
      });
    } finally {
      setIsLoading(false); // Hide loading spinner when the request is done
    }
  };

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  /* Watch for OTP length === 6 */
  useEffect(() => {
    if (otp.join("").length === 6) {
      VerificationOtp();
    }
  }, [otp]);

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/, ""); // Only digits
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp); // State update

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (!pasteData) return;

    const newOtp = pasteData.split("");

    while (newOtp.length < 6) {
      newOtp.push("");
    }

    setOtp(newOtp);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
        newOtp[index - 1] = "";
      }

      setOtp(newOtp);
    }
  };

  const renderTab1 = () => {
    return (
      <div className="px-md-2" id="one">
        <h3 className="login-title my-3">Login - Employee</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return;
          }}
        >
          <div className="">
            <div className="svgiconinput mb-3">
              <MailIcon />
              <input
                style={{ minHeight: "45px" }}
                type="text"
                className="form-control w-100"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value.replace(/\s+/g, ""))}
                placeholder="Enter Username"
              />
            </div>

            <div className="svgiconinput mb-3 svgiconinputRight">
              <PasswordIcon />
              <input
                style={{ minHeight: "45px" }}
                type={passwordVisible ? "text" : "password"}
                className="form-control w-100"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter Password"
              />
              <button type="button" className="password-toggle svg bg-light" onClick={togglePasswordVisibility}>
                {passwordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {loginError}
            {/* <div className="mb-4">
            <label
              htmlFor="rememberPassword"
              className="checkkboxLabel form-control d-flex gap-2 align-items-center"
              style={{ minHeight: "45px" }}
            >
              <input type="checkbox" className="chekbox" name="" id="rememberPassword" />
              Remember this browser for 24 hours
            </label>
          </div> */}
          </div>
          <div className="mb-3">
            <button className="themeButton form-control my-3 pe-2 mt-4 radius5" onClick={SignIn}>
              Log In
            </button>
          </div>
        </form>
      </div>
    );
  };

  const verifypassword = () => {
    return (
      <>
        <div className={`twoFactorAuth`}>
          <div className="">
            <div className="d-flex align-items-center flex-column">
              <AuthIcon />
              <h4 className="text-center">Two-Factor Authentication</h4>
              <span className="text my-3 text-center">Enter the 6-digit verification code sent to {loginEmail}</span>
            </div>
            <div className="row-flex otp-input-container my-2">
              {otp.map((digit, index) => (
                <input
                  style={{ minHeight: "45px" }}
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="otp-input"
                />
              ))}
            </div>
            <button className="themeButton form-control my-3 pe-2 mt-4 radius5" onClick={VerificationOtp}>
              Verify
            </button>
          </div>
        </div>
      </>
    );
  };

  const resetpassword = () => {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          return;
        }}
      >
        <div className={`twoFactorAuth  ${activeTab === "resetpassword" ? "active" : ""}`}>
          <h3 className="login-title my-3">Forgot your password?</h3>
          <div className="">
            <span className="font14 fontgray d-block mb-1">Enter your email to reset it</span>
            <div className="svgiconinput mb-3">
              <MailIcon />
              <input
                style={{ minHeight: "45px" }}
                type="text"
                className="form-control"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value.replace(/\s+/g, ""))}
                placeholder="Enter Username"
              />
            </div>
            <button className="themeButton form-control my-3 pe-2 mt-4 radius5" onClick={sendResetPassword}>
              Reset Password
            </button>
          </div>
        </div>
      </form>
    );
  };

  const changepassword = () => {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          return;
        }}
      >
        <div className={`twoFactorAuth`}>
          <h3 className="login-title my-3">Change You Password?</h3>
          <div className="">
            <span className="textsmall">Enter Your New Password</span>

            <div className="svgiconinput mb-3 svgiconinputRight">
              <PasswordIcon />
              <input
                style={{ minHeight: "45px" }}
                type={passwordVisible ? "text" : "password"}
                className="form-control"
                value={loginPassword}
                onChange={(e) => {
                  setLoginError("");
                  setLoginPassword(e.target.value);
                }}
                placeholder="Enter New Password"
              />
              <button type="button" className="password-toggle svg bg-light" onClick={togglePasswordVisibility}>
                {passwordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className="mb-3">
              <div className="svgiconinput svgiconinputRight">
                <PasswordIcon />
                <input
                  style={{ minHeight: "45px" }}
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  value={changePassword}
                  onChange={(e) => {
                    setLoginError("");
                    setChangePassword(e.target.value);
                  }}
                  placeholder="Confirm Password"
                />
                <button type="button" className="password-toggle svg bg-light" onClick={togglePasswordVisibility}>
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {loginError ? (
                <p style={{ margin: "5px 0 10px 0" }} className="text-danger">
                  {loginError}
                </p>
              ) : (
                <></>
              )}
            </div>
            <button className="themeButton form-control my-3 pe-2 mt-4 radius5" onClick={passwordChangeRequest}>
              Change Password
            </button>
          </div>
        </div>
      </form>
    );
  };

  const renderTabsData = () => {
    let keys = {
      tab1: renderTab1,
      verifypassword: verifypassword,
      resetpassword: resetpassword,
      changepassword: changepassword,
    };

    let tab = keys[activeTab];

    return tab ? tab() : renderTab1();
  };

  let maxWidth = activeTab == "verifypassword" ? "430px" : "500px";

  const renderContent = () => {
    return (
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
            <div style={{ maxWidth: maxWidth, width: "100%" }}>
              {renderTabsData()}

              <div className="px-2">
                {activeTab === "resetpassword" ? (
                  <></>
                ) : (
                  <Link
                    onClick={() => setActiveTab("resetpassword")}
                    className="themeColor text-decoration-none fw-bold text-end d-block"
                  >
                    Forgot Password?
                  </Link>
                )}
                <div className={pageStyles.ordiv}>
                  <span>or</span>
                </div>

                {activeTab == "tab1" ? (
                  <></>
                ) : (
                  <div className="signup fontgray text-center my-2">
                    Do you have an account?
                    <Link
                      className="themeColor pointer ms-2 fw-bold text-decoration-none"
                      onClick={() => handleTabClick("tab1")}
                    >
                      Log In
                    </Link>
                  </div>
                )}
                <div
                  className="themeColor pointer fw-bold text-center"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Back to Home
                </div>
              </div>
            </div>
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
          </div>
          <div className="my-auto"></div>
        </div>
        <div className={`${pageStyles.brandImageEmp} w-75 d-none d-lg-block`}>
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
    );
  };

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
                    setPopupOverlay(null);
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
                  <button
                    onClick={() => {
                      setPopupOverlay(null);
                    }}
                    className={`${styles.confirmButton} ${styles.confirmYes}`}
                  >
                    <span class="logout-icon " />
                    {popupOverlay?.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {renderContent()}
      <ThemeLoader show={isLoading} />
    </>
  );
};

export default EmployeeloginSignUp;
