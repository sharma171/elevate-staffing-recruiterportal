import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import MainFooter from "../../components/Footer/NewMainFooter";
import styles from "./Unsubscribe.module.css";
import { BarChart, Mail, CheckCircle } from "lucide-react";
import HomeHeader from "../homePage/Header";

export default function Unsubscribe() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlEmail = params.get("email");
    const urlToken = params.get("token");

    if (urlEmail) {
      setEmail(urlEmail);
    }
    if (urlToken) {
      setToken(urlToken);
    }
  }, [location.search]);

  const handleUnsubscribe = (e) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);

    axios
      .post(
        "https://unsubscribe-elevate-staffing-campaigns-v3-305451280005.us-east1.run.app",
        { email, token },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        const data = res.data;

        if (data.status === "success") {
          toast.success(data.message);
          setIsUnsubscribed(true);
        } else {
          toast.error(data.message || "Unsubscribe failed");
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
        toast.error(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="homepageFontfamily">
      <div className={styles.page}>
        <HomeHeader />

        {/* <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.brand}>
              <div className={styles.brandIcon}>
                <BarChart size={20} />
              </div>
              <span className={styles.brandName}>TB Soft Solutions</span>
              <span className={styles.brandTag}>DBA Elevate Staffing AI</span>
            </Link>
          </div>
        </header> */}

        <main className={styles.main}>
          <div className={styles.card}>
            {!isUnsubscribed ? (
              <>
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <Mail size={24} />
                  </div>
                  <h3 className={styles.title}>Unsubscribe from Emails</h3>
                  <p className={styles.desc}>
                    We’re sorry to see you leave. Click the button below to unsubscribe from our mailing list.
                  </p>
                </div>

                <form className={styles.cardContent} onSubmit={handleUnsubscribe}>
                  {/* <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      className={styles.input}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div> */}

                  <button className={styles.button} disabled={isLoading || !token}>
                    {isLoading ? "Unsubscribing..." : "Unsubscribe"}
                  </button>

                  <p className={styles.footer}>
                    Changed your mind?{" "}
                    <Link to="/" className={styles.link}>
                      Return to homepage
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <div className={`${styles.iconBox} ${styles.successIcon}`}>
                    <CheckCircle size={32} />
                  </div>
                  <h1 className={`${styles.title} ${styles.successTitle}`}>Successfully Unsubscribed</h1>
                  <p className={styles.desc}>
                    You've been removed from our mailing list. You will no longer receive emails from us.
                  </p>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.successText}>
                    We've unsubscribed <strong>{email}</strong> from our email list.
                  </p>
                  <Link to="/" className={styles.button}>
                    Return to Homepage
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <MainFooter />
    </div>
  );
}
