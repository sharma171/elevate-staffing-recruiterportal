import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./loginstyle.css";
import { ReactComponent as MailIcon } from "../assets/images/mailIcon.svg";
import { ReactComponent as PasswordIcon } from "../assets/images/PasswordIcon.svg";
import { ReactComponent as ProfileIcon } from "../assets/images/ProfileIcon.svg";
import { ReactComponent as CallIcon } from "../assets/images/CallIcon.svg";
import { ReactComponent as AuthIcon } from "../assets/images/AuthIcon.svg";
import QuoteIcon from "../assets/images/QuoteIcon.png";
import styles from "../components/css/Logout.module.css";
import images from "../assets/images/new";
import pageStyles from "./css/loginSignup.module.css";

import { ThemeLoader } from "../components";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import { callGetSession, getDeviceData } from "../DeviceStore";
import sendEncryptedRequest from "../components/EncryptedRequest";
import { toast } from "react-toastify";

const { themelogo } = images;

let AuthURL = "https://user-authentication-api-wp-v3-305451280005.us-east1.run.app";

const LoginSignUp = () => {
  const { isLoggedIn, login, organisation, orgData } = useAuth();
  const [popupOverlay, setPopupOverlay] = useState(null);
  const navigate = useNavigate();
  // Login form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [rememberBrowser, setRememberBrowser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const [emailError, setEmailError] = useState(""); // Added state for email error
  const [phoneError, setPhoneError] = useState(""); // Phone number error state
  const [countryCode, setCountryCode] = useState("usa"); // Default to India (+91)
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeysData, setApiKeysData] = useState(false);

  let { keys, fingerprints } = getDeviceData();

  const getProperERRorMessage = (data) => {
    try {
      if (!data) return "";

      const resData = data?.response?.data || data;

      let message = resData?.message || resData?.details || resData?.error || data?.message || "";

      if (typeof message === "string") {
        try {
          const parsed = JSON.parse(message);
          if (parsed?.message) message = parsed.message;
        } catch {}
      }

      return typeof message === "string" ? message.trim() : "";
    } catch {
      return "";
    }
  };

  const SignUpAuth = async () => {
    let validate = validateEmail(emailAddress);
    let validatePassword = validatePasswords();
    let validatecontact = validatePhoneNumber(contactNumber);

    if (!validate || !validatecontact || !validatePassword) {
      return;
    }

    const formData = {
      action: "sign-up",
      first_name: firstName,
      last_name: lastName,
      username: emailAddress,
      email: emailAddress,
      password: password,
      country: countryCode,
    };

    setIsLoading(true);

    try {
      let keysData = await callGetSession(emailAddress, AuthURL);
      setApiKeysData(keysData);
      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;
      setIsLoading(false);

      if (isError) {
        throw new Error(data.error || "Signup failed. Please try again.");
      }

      if (!isError) {
        toast.success("Signup successful!");
        setPopupOverlay({
          message: "Signup successful",
          title: "Signup status",
          subhead: "Congratulations! Welcome aboard!",
          button: "ok",
        });

        setActiveTab("tab1");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      setPopupOverlay({ message: "Signup unsuccessful", title: "Signup status", subhead: error.message, button: "ok" });
      console.error("Error during signup:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    localStorage.removeItem("userType");
  }, []);

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

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhoneNumber = (phone) => {
    const phoneDigits = phone.replace(/\D/g, ""); // Remove non-digit characters
    if (phoneDigits.length === 10) {
      setPhoneError("");
      return true;
    } else {
      setPhoneError("Please enter a valid 10-digit phone number.");
    }
    return false;
  };

  const validatePasswords = () => {
    if (password != confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    } else {
      setPasswordError("");
    }
    return true;
  };

  const SignIn = async () => {
    setIsLoading(true);

    const formData = {
      action: "sign-in",
      username: loginEmail,
      password: loginPassword,
      // app_name: 'recruitersportal',
    };

    if (rememberBrowser) {
      formData.rememberBrowser = true;
    }

    try {
      let keysData = await callGetSession(loginEmail, AuthURL);
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
        login(data);
        localStorage.setItem("userType", "employer");
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
      setIsLoading(false);
    }
  };

  const sendResetPassword = async () => {
    setIsLoading(true);

    const formData = {
      action: "send-password-reset",
      email: loginEmail,
    };

    try {
      let keysData = await callGetSession(loginEmail, AuthURL);
      setApiKeysData(keysData);
      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      let isError = !response.status;
      const data = response.data;
      let properMessage = getProperERRorMessage(data);

      if (isError) {
        throw new Error(
          properMessage || "We couldn't reset your password — please check your email address and try again."
        );
      }

      if (activeTab === "resetpassword") {
        localStorage.setItem("passwordResetEmail", loginEmail);
        localStorage.setItem("passwordChangeType", false);
        localStorage.setItem("userType", "Employer");
      }
      if (activeTab === "changepassword") {
        localStorage.setItem("passwordChangeType", true);
        localStorage.setItem("userType", "Employer");
      }
      setPopupOverlay({
        message: "We've sent a password reset link to your registered email. Please check your inbox.",
        title: "Password Reset",
        subhead: "",
        button: "ok",
      });
      // setTimeout(()=>{setPopupOverlay(false)},2600);
    } catch (error) {
      setLoginError(error.message);

      setPopupOverlay({
        message: error.message || "We couldn't reset your password — please check your email address and try again.",
        title: "Password Reset Status",
        subhead: " ",
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
        keysData = await callGetSession(loginEmail, AuthURL);
        setApiKeysData(keysData);
      }

      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      const data = response.data;

      let isError = !response.status;

      if (isError) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (data.password_change_required == true) {
        setActiveTab("changepassword");
        setLoginPassword("");
      } else {
        login(data); // Pass the entire user data to the login function
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
      action: "update-temp-password",
      email: loginEmail,
      new_password: changePassword,
    };

    try {
      let keysData = apiKeysData;
      if (!apiKeysData) {
        keysData = await callGetSession(loginEmail, AuthURL);
        setApiKeysData(keysData);
      }

      let response = await sendEncryptedRequest(formData, keysData, fingerprints, AuthURL);

      const data = response.data;

      let isError = !response.status;

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
        <h3 className="login-title my-3">Login - Employer</h3>
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
            <div className="mb-4">
              <label
                htmlFor="rememberPassword"
                className="checkkboxLabel form-control d-flex gap-2 align-items-center"
                style={{ minHeight: "45px" }}
              >
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setRememberBrowser(e.target.checked);
                  }}
                  className="chekbox"
                  name=""
                  id="rememberPassword"
                />
                Remember this browser for 24 hours
              </label>
            </div>
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

  const renderTab2 = () => {
    return (
      <div id="two">
        <h3 className="login-title my-3">Sign Up - Employer</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return;
          }}
        >
          <div className="">
            <div className="">
              <div className="svgiconinput mb-3">
                <ProfileIcon />
                <input
                  style={{ minHeight: "45px" }}
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>

              <div className="svgiconinput mb-3">
                <ProfileIcon />
                <input
                  style={{ minHeight: "45px" }}
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="svgiconinput">
                <MailIcon />
                <input
                  style={{ minHeight: "45px" }}
                  type="text"
                  className="form-control"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailError("");
                    setEmailAddress(e.target.value.replace(/\s+/g, ""));
                  }}
                  placeholder="Email Address"
                />
              </div>
              {emailError && <p className="error">{emailError}</p>} {/* Display email error */}
            </div>

            <div className="mb-3">
              <div className="contact-bot contactInput">
                <CallIcon />
                <div className="row-flex contact w-100">
                  <select
                    className="country-code-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="ind">IND +91</option>
                    <option value="usa">USA +1</option>
                  </select>

                  <input
                    style={{ minHeight: "45px" }}
                    type="tel"
                    className="form-control"
                    value={contactNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setContactNumber(digitsOnly);
                      setPhoneError("");
                    }}
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
              </div>
              {phoneError && <p className="error">{phoneError}</p>} {/* Display email error */}
            </div>

            <div className="svgiconinput svgiconinputRight mb-3">
              <PasswordIcon />
              <input
                style={{ minHeight: "45px" }}
                type={passwordVisible ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => {
                  setPasswordError("");
                  setPassword(e.target.value);
                }}
                placeholder="Enter Password"
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
                  value={confirmPassword}
                  onChange={(e) => {
                    setPasswordError("");
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Confirm Password"
                />
                <button type="button" className="password-toggle svg bg-light" onClick={togglePasswordVisibility}>
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {passwordError && <p className="error">{passwordError}</p>} {/* Display email error */}
            </div>
          </div>
          <div className="">
            <button className="themeButton form-control my-3 pe-2 mt-4 radius5" onClick={SignUpAuth}>
              SIGN UP
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
      <>
        <div className={`twoFactorAuth  ${activeTab === "resetpassword" ? "active" : ""}`}>
          <h3 className="login-title my-3">Forgot your password?</h3>
          <div className="">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                return;
              }}
            >
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
            </form>
          </div>
        </div>
      </>
    );
  };

  const changepassword = () => {
    return (
      <>
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
                    setPasswordError("");
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
      </>
    );
  };

  const renderTabsData = () => {
    let keys = {
      tab1: renderTab1,
      tab2: renderTab2,
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

                <div className="signup fontgray text-center my-2">
                  {activeTab === "tab1" ? "Don’t have an account?" : "Do you have an account?"}
                  <Link
                    className="themeColor pointer ms-2 fw-bold text-decoration-none"
                    onClick={() => handleTabClick(activeTab === "tab1" ? "tab2" : "tab1")}
                  >
                    {activeTab === "tab1" ? "Sign Up" : "Log in"}
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
        <div className={`${pageStyles.brandImage} w-100 d-none d-lg-block w-75`}>
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

export default LoginSignUp;
