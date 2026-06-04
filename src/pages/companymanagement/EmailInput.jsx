import { useEffect, useState } from "react";
import styles from "./css/EmailInput.module.css";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ConsentScreen from "./ConsentScreen";

const EmailInput = ({ goBakc, emailConfData = {}, isscrape, REDIRECT_URI_PATH }) => {
  const [email, setEmail] = useState("");
  const [openAction, setOpenAction] = useState(false);

  let extraKey = isscrape ? "Scrape" : "";

  let provider = emailConfData?.["oauth2_config" + extraKey];
  let emailAddressData = emailConfData?.["email_address" + extraKey];

  const isGoogle = provider === "google";
  const isMicrosoft = provider === "microsoft";

  useEffect(() => {
    if (isscrape) {
      localStorage.setItem("isscrape", isscrape);
    } else {
      localStorage.removeItem("isscrape");
    }

    if (emailAddressData) {
      setEmail(emailAddressData);
    }
  }, [emailAddressData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenAction(true);
  };
  let isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  let isValid = isValidEmail(email);

  if (openAction) {
    return (
      <ConsentScreen
        isscrape={isscrape}
        provider={provider}
        accountEmail={email}
        onBack={() => setOpenAction(false)}
        onAllow={() => console.log("Allowed")}
        onCancel={() => setOpenAction(false)}
        REDIRECT_URI_PATH={REDIRECT_URI_PATH}
      />
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.card}>
          <button className={styles.backButton} onClick={goBakc}>
            <ArrowLeft /> Go Back
          </button>

          <div className={styles.centerText}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconCircle}>{isGoogle ? <FaGoogle size={20} /> : <FaMicrosoft size={20} />}</div>
            </div>
            <h1 className={styles.title}>Enter Your {isGoogle ? "Google" : "Microsoft 365 / Outlook"} Email</h1>
            <p className={styles.subtitle}>
              We'll connect to your {isGoogle ? "Google" : "Microsoft 365 / Outlook"} account for email sending
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input
                disabled={emailAddressData}
                type="email"
                value={email}
                onChange={(e) => {
                  if (!emailAddressData) {
                    setEmail(e.target.value);
                  }
                }}
                className={styles.input}
                placeholder={`Enter your ${isGoogle ? "Google" : "Microsoft 365 / Outlook"} email address`}
              />
            </div>
            <button type="submit" disabled={!isValid} className={styles.submitButton}>
              <div className={styles.buttonContent}>
                <span>Continue with {isGoogle ? "Google" : "Microsoft 365 / Outlook"}</span>
                <ArrowRight className={styles.arrowSubmit} />
              </div>
            </button>
          </form>

          <div className={styles.footerBox}>
            <p className={styles.footerText}>
              <strong>Using {isGoogle ? "Google" : "Microsoft 365 / Outlook"}:</strong>
              <span>
                {isGoogle
                  ? " Works with Gmail and Google Workspace accounts."
                  : " Works with business domains using Microsoft 365 and personal Outlook accounts."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailInput;
