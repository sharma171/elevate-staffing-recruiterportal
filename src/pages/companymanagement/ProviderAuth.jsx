import React, { useState, useEffect } from "react";
import styles from "./css/ProviderAuth.module.css";
import { toast } from "react-toastify";
import { CheckCircle, ArrowLeft, Copy, MailCheck, UserRound, Shield } from "lucide-react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";
import { ThemeLoader } from "../../components";

const OAUTH_FUNCTION_URL = "https://authenticate-users-with-email-provider-v3-305451280005.us-east1.run.app";
const GOOGLE_CLIENT_ID = "305451280005-jt608ddo1m3si5b231u62tuud2c17upk.apps.googleusercontent.com";
const MICROSOFT_CLIENT_ID = "f170229c-e78d-4c3f-992d-baadac993b73";

const ProviderAuth = ({ email, provider, onBack, isscrape, REDIRECT_URI_PATH = "/auth/callback" }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileResponse, setProfileResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  let REDIRECT_URI = window.location.origin + REDIRECT_URI_PATH;

  const navigate = useNavigate();
  const { user } = useAuth();

  const config = {
    google: { name: "Google", icon: <MailCheck size={36} /> },
    microsoft: { name: "Microsoft", icon: <UserRound size={36} /> },
  }[provider];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");

    if (error) {
      toast.error(`OAuth error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    checkEmailStatus();
  }, []);

  const callOAuthAPI = async (payload) => {
    let provider = payload.provider;

    if (provider == "microsoft") {
      provider = "outlook";
    }

    if (provider == "google") {
      provider = "gmail";
    }

    let newPayload = {
      action: "email_status",
      requesting_user_email: user?.email,
      ...payload,
      provider,
    };

    const res = await fetch(OAUTH_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    return data;
  };

  const checkEmailStatus = async () => {
    try {
      let extra = {
        purpose: "Email to use to send all emails to consultants",
      };

      if (isscrape) {
        extra = {
          purpose: "Email to scrap rate confirmations",
        };
      }

      setLoading(true);
      const result = await callOAuthAPI({ action: "email_status", email_address: email, provider, ...extra });
      setLoading(false);
      if (result.connected && result.integrations?.length) {
        setIsAuthenticated(true);
        setProfileResponse(result.integrations[0]);
      }
    } catch (e) {
      console.log(e, "error");
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code, state) => {
    setIsAuthenticating(true);
    try {
      const action = state === "google" ? "gmail_exchange_code" : "outlook_exchange_code";
      const result = await callOAuthAPI({ action, code });
      if (result.success) {
        toast.success(`${config.name} connected successfully`);
        setIsAuthenticated(true);
        setProfileResponse({
          email: state === "google" ? result.gmail_email : result.outlook_email,
          provider: state,
          integration_id: result.integration_id,
        });
      } else {
        toast.error(result.error || `Failed to connect ${config.name}`);
      }
    } catch {
      toast.error(`Failed to process ${config.name} authentication`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const redirectOAuth = () => {
    const url =
      provider === "google"
        ? new URL("https://accounts.google.com/o/oauth2/v2/auth")
        : new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");

    const id = provider === "google" ? GOOGLE_CLIENT_ID : MICROSOFT_CLIENT_ID;
    let scope =
      provider === "google"
        ? [
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ].join(" ")
        : [
            "https://graph.microsoft.com/Mail.Send",
            "https://graph.microsoft.com/Mail.Read",
            "https://graph.microsoft.com/User.Read",
            "offline_access",
          ].join(" ");

    url.searchParams.set("client_id", id);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);

    if (provider === "google") {
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");
      if (email) {
        url.searchParams.set("login_hint", email);
      }
    } else {
      url.searchParams.set("prompt", "consent");
      url.searchParams.set("response_mode", "query");
    }

    url.searchParams.set("state", provider);
    window.location.href = url.toString();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(profileResponse, null, 2));
    toast.info("Profile response copied to clipboard");
  };

  if (isAuthenticated && profileResponse) {
    return (
      <div className={styles.successWrapper}>
        <div className={styles.mainContent}>
          <CheckCircle className={styles.checkIcon} />
          <h1 className={styles.mainTitle}>Successfully Connected!</h1>
          <p className={styles.mainDescription}>ElevateStaffing is now connected to your {config.name} account.</p>
          <div className={styles.cardContainer}>
            <div className={styles.infoCard}>
              <div className={styles.providerIconCircle}>{config.icon}</div>
              <div>
                <p className={styles.userEmail}>{profileResponse.email_address || email}</p>
                <p className={styles.connectionInfo}>Connected via {config.name}</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardTop}>
                <h3 className={styles.profileTitle}>Profile Data</h3>
                <button className={styles.clipboardBtn} onClick={copyToClipboard}>
                  <Copy size={14} />
                </button>
              </div>
              <pre className={styles.codeBlock}>{JSON.stringify(profileResponse, null, 2)}</pre>
            </div>
          </div>
          <button className={styles.primaryBtn} onClick={() => window.location.reload()}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>
        <ArrowLeft /> Go Back
      </button>
      <div className={styles.centered}>
        <div className={styles.providerIcon}>{config.icon}</div>
        <h1 className={styles.heading}>Connect to {config.name}</h1>
        <p className={styles.description}>
          Authenticate with {config.name} to enable email sending from <strong>{email}</strong>
        </p>
      </div>
      <div className={styles.card}>
        <div className="d-flex gap-3 align-items-center mb-3">
          <div className={styles.stepOuter}>
            <div className={styles.stepInner}></div>
          </div>
          <div>
            <h3 className={styles.cardTitle}>Secure Authentication</h3>
            <p className={styles.cardText}>You'll authenticate securely with {config.name}</p>
          </div>
        </div>

        <div className="d-flex gap-3 align-items-center mb-3">
          <div className={styles.stepOuter}>
            <div className={styles.stepInner}></div>
          </div>
          <div>
            <h3 className={styles.cardTitle}>Grant Permissions</h3>
            <p className={styles.cardText}>Allow access to send emails and read profile</p>
          </div>
        </div>

        <div className="d-flex gap-3 align-items-center mb-3">
          <div className={styles.stepOuter}>
            <div className={styles.stepInner}></div>
          </div>
          <div>
            <h3 className={styles.cardTitle}>Complete Setup</h3>
            <p className={styles.cardText}>Return to continue with your connected account</p>
          </div>
        </div>
      </div>
      <button className={styles.authButton} disabled={isAuthenticating} onClick={redirectOAuth}>
        {isAuthenticating ? `Connecting to ${config.name}...` : `Connect with ${config.name}`}
      </button>

      <div className={styles.secNotice}>
        <div className={styles.secItem}>
          <div>
            <Shield />
          </div>
          <div className={styles.secText}>
            <div>
              <strong>Your data is secure.</strong>
            </div>
            <div>We use OAuth 2.0 protocol and never store your {config.name} password.</div>
          </div>
        </div>
      </div>
      <ThemeLoader show={loading} />
    </div>
  );
};

export default ProviderAuth;
