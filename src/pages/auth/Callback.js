import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";

const OAUTH_FUNCTION_URL = "https://authenticate-users-with-email-provider-v3-305451280005.us-east1.run.app";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [allLoaded, setAllLoaded] = useState(false);

  const { user } = useAuth();

  let userEmail = user?.email;

  let isScrape = localStorage.getItem("isscrape");

  useEffect(() => {
    setTimeout(() => {
      setAllLoaded(true);
    }, 200);
  }, [isScrape]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    let extra = {
      purpose: "Email to use to send all emails to consultants",
      purpose_description: "Primary email for consultant communications and updates",
    };

    if (isScrape) {
      extra = {
        purpose: "Email to scrap rate confirmations",
        purpose_description: "This email receives rate confirmations from vendors for processing",
      };
    }

    if (error) {
      toast.error(`OAuth error: ${error}`);
      setTimeout(() => navigate("/", { replace: true }), 4000);
      return;
    }

    if (userEmail && allLoaded) {
      if (code && state) {
        const loadingId = toast.info("Completing authentication...", { autoClose: false });

        fetch(OAUTH_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: state === "google" ? "gmail_exchange_code" : "outlook_exchange_code",
            code,
            requesting_user_email: userEmail,
            ...extra,
          }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
          .then(({ ok, data }) => {
            toast.dismiss(loadingId);
            if (!ok || !data.success) {
              throw new Error(data.error || "Exchange failed");
            }
            toast.success(`${state.charAt(0).toUpperCase() + state.slice(1)} connected!`);

            navigate(`/companymanagement?tab=Organization_Management${new URLSearchParams({ ...params }).toString()}`, {
              replace: true,
            });
          })
          .catch((err) => {
            toast.dismiss(loadingId);
            toast.error(`Authentication failed: ${err.message}`);
            setTimeout(() => navigate("/companymanagement?tab=Organization_Management", { replace: true }), 3000);
          });
      } else {
        setTimeout(() => navigate("/companymanagement?tab=Organization_Management", { replace: true }), 2000);
      }
    }
  }, [navigate, userEmail, allLoaded]);

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #f1f5f9, #ebf8ff, #e0e7ff)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              border: "2px solid #2563eb",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#4b5563" }}>Processing authentication...</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default OAuthCallback;
