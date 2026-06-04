// src/pages/PrivacyPolicy.jsx

import React, { useState, useEffect } from "react";
import Button from "./components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { ReactComponent as LogoIcon } from "./images/logoIcon.svg";
import privacyPolicyData from "./legalPagesData/privacyPolicy";
import termsOfServiceData from "./legalPagesData/termsOfService";
import cookiesData from "./legalPagesData/cookiesPoolicy";
import GdprComplaince from "./legalPagesData/gdprCompliances";
import { ReactComponent as MailIcon } from "../../assets/images/mailIcon.svg";
import { ReactComponent as PasswordIcon } from "../../assets/images/PasswordIcon.svg";
import { ReactComponent as ProfileIcon } from "../../assets/images/ProfileIcon.svg";
import { ReactComponent as CallIcon } from "../../assets/images/CallIcon.svg";
import { ReactComponent as AuthIcon } from "../../assets/images/AuthIcon.svg";
import styles from "../../components/css/Logout.module.css";
import "./index.css";
import "./contactForm.css";
import HomeHeader from "../homePage/Header";

const PrivacyPolicy = () => {
  const { isLoggedIn, login } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  //   useEffect(() => {
  //       const timer = setTimeout(() => {
  //           if (isLoggedIn === true) {
  //               navigate("/dashboard");
  //           }
  //           console.log(isLoggedIn);
  //       }, 100);
  //       return () => clearTimeout(timer);
  //   }, [isLoggedIn, navigate]);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [contactForm, setContactForm] = useState(null);

  const showDemo = () => {
    setContactForm("request a demo");
  };
  const contactUsForm = () => {
    setContactForm("contact us");
  };
  // const showDemo = () => {
  //   setDemoDialogOpen(true);
  // };
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [userInput, setUserInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  useEffect(() => {
    generateCaptcha();
    window.scrollTo(0, 0);
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    setCaptchaAnswer((num1 + num2).toString());
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput !== captchaAnswer) {
      alert("Captcha Incorrect! Try again.");
      generateCaptcha();
      setUserInput("");
      return;
    }

    setIsLoading(true);

    const formData = {
      name: name,
      email: email,
      phone_number: `${countryCode} ${phone}`,
      company_name: company,
      message: message,
      is_human_verified: true,
      source: "website",
    };

    try {
      const response = await fetch("https://demo-request-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      // alert("Form Submitted Successfully!");

      // Optionally reset the form here
      generateCaptcha();
      setUserInput("");
      setPopupOverlay({
        message: "Your Form Submitted Successfully",
        title: "Form Status",
        subhead: "Thank You for your time.",
        button: "Thank You",
      });
      // clear other input fields using state if needed
    } catch (error) {
      alert(error.message || "Something went wrong, Please try again.");
    } finally {
      setIsLoading(false);
      setContactForm(null);
    }
  };

  const handleLogin = (type) => {
    alert(`${type} Login - Redirecting to ${type.toLowerCase()} login page...`);
  };
  return (
    <>
      {contactForm && (
        <>
          <div className="ContactUsForm">
            <div className="contactFormOuter">
              <section className="contact-form">
                <div className="contact-form-container">
                  <div className="close" onClick={() => setContactForm(null)}>
                    +
                  </div>
                  {contactForm == "request a demo" ? (
                    <>
                      <h1 className="title">Request a Demo</h1>
                    </>
                  ) : (
                    <>
                      <h1 className="title">Contact Us</h1>
                    </>
                  )}
                  {contactForm == "request a demo" ? (
                    <>
                      <p className="description">Fill out this form to schedule a demo of our platform.</p>
                    </>
                  ) : (
                    <>
                      <p className="description">
                        Send us a message and we'll get back to you as soon <br></br>as possible.
                      </p>
                    </>
                  )}

                  <form className="form-content" onSubmit={handleSubmit}>
                    <div className="input-col col-flex">
                      <label className="input-label">Your Name</label>
                      <div className="input">
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="input-field"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-col col-flex">
                      <label className="input-label">Email</label>
                      <div className="input">
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="input-field"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-col col-flex">
                      <label className="input-label">Phone Number</label>
                      <div className="input">
                        <select className="input-field mobileNumber" onChange={(e) => setCountryCode(e.target.value)}>
                          <option value="+91">IND +91</option>
                          <option value="+1">USA +1</option>
                        </select>
                        <div className="divider"></div>
                        <input
                          type="tel"
                          className="input-field"
                          placeholder="1234567890"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    {contactForm == "request a demo" && (
                      <>
                        <div className="input-col col-flex">
                          <label className="input-label">Company</label>
                          <div className="input">
                            <input
                              type="text"
                              placeholder="Your Company name"
                              className="input-field"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="input-col col-flex">
                      <label className="input-label">Message</label>
                      <div className="input">
                        <textarea
                          placeholder="How can we help you...."
                          className="input-field messagetxt"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-col col-flex">
                      <label className="input-label">Captcha</label>
                      <div className="input">
                        <span className="mathquestion">{captchaQuestion}</span>
                        <input
                          type="text"
                          placeholder="Enter answer"
                          className="input-field"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button className="send-btn" type="submit">
                      Send Message
                    </button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col min-h-screen RecruiterHome" style={{ paddingTop: "75px" }}>
        {isLoggedIn ? (
          <></>
        ) : (
          <>
            <HomeHeader contactUsForm={contactUsForm} customStyle={{ background: "#fff" }} />
          </>
        )}

        <>
          <div className="PageHeader TOS">
            <div className="container">
              <h3 className="pageHeading">Terms of Service</h3>
            </div>
          </div>
          <div class="container">
            <div className="row-flex justify-content-between mt-5 mb-5">
              <div className="lastUpdated">
                <strong>Last Updated : </strong>04-07-2025
              </div>
              <button
                className="BackTOHome"
                onClick={() => {
                  navigate("/");
                }}
              >
                <span>{`<`}</span> Back to Home
              </button>
            </div>
            <div className="LegalContent">
              {termsOfServiceData.map((section, index) => (
                <div key={index} className="lSection">
                  <h2 className="LHeadings">{section.title}</h2>

                  {/* Render First Content Array */}
                  {section.content?.map((para, i) => (
                    <p key={i} className="para">
                      {para}
                    </p>
                  ))}

                  {/* Render List if Exists */}
                  {section.list && (
                    <ul className="list-disc Lulist pl-5 text-gray-700">
                      {section.list.map((item, j) => (
                        <li key={j} className="legalList">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Render Second Content Array if Exists */}
                  {section.content2?.map((para2, k) => (
                    <p key={k} className="para">
                      {para2}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>

        {isLoggedIn ? (
          <></>
        ) : (
          <footer className="legalFooter">
            <div className="container">
              <p>© 2025 ElevateStaffing AI. All Rights Reserved.</p>
            </div>
          </footer>
        )}
      </div>
      {isLoading && (
        <div className="MainLoading">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
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
    </>
  );
};

export default PrivacyPolicy;
