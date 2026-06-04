import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosApi, ThemeLoader } from "../../../components";
import { Building2, Clock, FileText, HelpCircle, PenTool, User, CheckCircle2, TriangleAlert } from "lucide-react";
import moment from "moment";
import { toast } from "react-toastify";
import MainFooter from "../../../components/Footer/NewMainFooter";

const BASE_URL = "https://get-document-signature-employee-handler-v1-305451280005.us-east1.run.app/";

const statusConfig = {
  pending: {
    text: "Pending Signature",
    bgColor: "#FEF3C7",
    textColor: "#B45309",
    Icon: Clock,
  },
};

const RenderPDFPReview = ({ signatureStatus }) => {
  const file = signatureStatus?.document_content;

  console.log(signatureStatus, "signatureStatus");

  const pdfBlob = useMemo(() => {
    if (!file) return null;

    if (file instanceof Blob) {
      return file;
    }

    if (typeof file === "string") {
      return new Blob([Uint8Array.from(atob(file), (c) => c.charCodeAt(0))], { type: "application/pdf" });
    }

    if (file?.content) {
      return new Blob([Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0))], { type: "application/pdf" });
    }

    return null;
  }, [file]);

  if (!pdfBlob) {
    return <></>;
  }

  return (
    <div
      className="bg-white p-3 p-md-4 border rounded my-3"
      style={{
        borderColor: "#e7e7ef",
        boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / .05)",
        color: "#080118",
      }}
    >
      <div className="card-header bg-white border-0">
        <h3 className="d-flex align-items-center gap-2 mb-3 fw-semibold" style={{ fontSize: "1.5rem" }}>
          <FileText size={20} />
          Document Preview
        </h3>
      </div>

      <iframe
        className="rounded border"
        src={URL.createObjectURL(pdfBlob)}
        style={{ flex: 1, border: "none", minHeight: "550px", width: "100%" }}
      />
    </div>
  );
};

function SignatureStatusBadge({ status, className = "", versionNumber }) {
  const config = statusConfig[status] || {
    text: "Unknown",
    bgColor: "#E5E7EB",
    textColor: "#4B5563",
    Icon: HelpCircle,
  };

  const { text, bgColor, textColor, Icon } = config;

  return (
    <span
      className={`d-inline-flex align-items-center rounded-pill fw-medium ${className}`}
      style={{
        gap: "6px",
        padding: "4px 12px",
        fontSize: "0.875rem",
        backgroundColor: bgColor,
        color: textColor,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} />
      <span>{text}</span>
      {versionNumber && versionNumber > 1 && (
        <span style={{ fontSize: "14px", opacity: 0.85 }}>(v{versionNumber})</span>
      )}
    </span>
  );
}

function SignOfferView() {
  let { signature } = useParams();

  const [signatureStatus, setSignatureStatus] = useState({});
  const [isDocumentSignedSuccess, setisDocumentSignedSuccess] = useState(false);
  const [isDocError, setisDocError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: "",
    dateAcknowledged: false,
    consent: false,
  });

  useEffect(() => {
    getdetails();
  }, [signature]);

  const today = moment().format("MMMM D, YYYY");

  const handleChange = function (e) {
    const { name, value, type, checked } = e.target;
    setFormValues(function (prev) {
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  let isDisabled = !formValues.fullName.trim() || !formValues.dateAcknowledged || !formValues.consent;

  const handleSubmit = function () {
    if (!formValues.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!formValues.dateAcknowledged) {
      toast.error("Please acknowledge today's date");
      return;
    }

    if (!formValues.consent) {
      toast.error("Please agree to the consent to continue");
      return;
    }

    const payload = {
      action: "capture_signature",
      signature_token: signature,
      typed_name: formValues.fullName,
      signature_method: "typed",
      consent_agreed: true,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setisDocumentSignedSuccess(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to sign document. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getdetails = function () {
    const payload = {
      signature_token: signature,
      action: "verify_token",
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setSignatureStatus(res.data);
      })
      .catch((err) => {
        setisDocError(true);
        toast.error(err?.response?.data?.error || "Invalid or expired signature link");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderSignatureView = useMemo(() => {
    return <RenderPDFPReview signatureStatus={signatureStatus} />;
  }, [signatureStatus?.document_content]);

  if (isDocError) {
    return (
      <div
        className="d-flex align-items-center justify-content-center px-3"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        }}
      >
        <div
          className="bg-white border shadow-sm w-100"
          style={{
            maxWidth: "28rem",
            borderRadius: "12px",
          }}
        >
          <div
            className="text-center"
            style={{
              padding: "2rem 1.25rem",
            }}
          >
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#ef44441a",
              }}
            >
              <TriangleAlert
                style={{
                  width: "32px",
                  height: "32px",
                  color: "#ef4444",
                }}
              />
            </div>

            <div className="fw-bold h4">Link Invalid</div>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.25rem",
              }}
            >
              Unable to verify the signature link. Please try again later.
            </p>

            <div
              style={{
                backgroundColor: "#f1f1f980",
                borderRadius: "8px",
                padding: "0.75rem",
                textAlign: "left",
              }}
            >
              <div className="fw-bold ps-1">Possible reasons:</div>
              <ul className="mt-1">
                <li>Link has expired (after 7 days)</li>
                <li>Document has already been signed</li>
                <li>Link was generated incorrectly</li>
              </ul>
            </div>

            <div
              style={{
                marginTop: "1rem",
              }}
            >
              Need help? Contact HR at
              <div>
                <a className="themePurple fw-semibold" href="mailto:hr@elevatestaffing.ai">
                  hr@elevatestaffing.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDocumentSignedSuccess) {
    return (
      <div
        className="d-flex align-items-center justify-content-center px-3"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        }}
      >
        <div
          className="bg-white border shadow-sm w-100"
          style={{
            maxWidth: "28rem",
            borderRadius: "12px",
          }}
        >
          <div
            className="text-center"
            style={{
              padding: "2rem 1.25rem",
            }}
          >
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
              }}
            >
              <CheckCircle2
                style={{
                  width: "32px",
                  height: "32px",
                  color: "#16a34a",
                }}
              />
            </div>

            <div className="fw-bold h4">Document Signed Successfully!</div>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.25rem",
              }}
            >
              Thank you for signing the document. A confirmation email has been sent to you.
            </p>

            <div
              style={{
                backgroundColor: "#f1f1f980",
                borderRadius: "8px",
                padding: "0.75rem",
                textAlign: "left",
              }}
            >
              <div className="d-flex justify-content-between mb-2" style={{ gap: "8px" }}>
                <span style={{ color: "#292929ff" }}>Document:</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{signatureStatus?.document_name}</span>
              </div>

              <div className="d-flex justify-content-between mb-2" style={{ gap: "8px" }}>
                <span style={{ color: "#292929ff" }}>Signed by:</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{formValues.fullName}</span>
              </div>

              <div className="d-flex justify-content-between" style={{ gap: "8px" }}>
                <span style={{ color: "#292929ff" }}>Date:</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{today}</span>
              </div>
            </div>

            <p
              style={{
                color: "#6b7280",
                marginTop: "1rem",
              }}
            >
              You may close this window.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderBodyContent = () => {
    return (
      <div>
        <div
          className="bg-white p-3 p-md-4 border rounded my-3"
          style={{
            borderColor: "#e7e7ef",
            boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / .05)",
            color: "#080118",
          }}
        >
          <div className="card-header bg-white border-0">
            <h3 className="d-flex align-items-center gap-2 mb-3 fw-semibold" style={{ fontSize: "1.5rem" }}>
              <PenTool size={20} />
              Electronic Signature
            </h3>
          </div>

          <div className="card-body pb-3">
            <div
              className="mb-4 p-3 fw-medium"
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                color: "#1d4ed8",
              }}
            >
              This electronic signature is legally binding and has the same legal effect as a handwritten signature.
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">Type your full legal name</label>
              <input
                type="text"
                className="form-control py-2 bigHoverInput"
                placeholder="Enter your full name as it appears on the document"
                name="fullName"
                value={formValues.fullName}
                onChange={handleChange}
              />
            </div>
            {formValues.fullName ? (
              <div className="p-3 border rounded mb-3" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                <p
                  style={{
                    color: "#353535ff",
                    marginBottom: "6px",
                  }}
                >
                  Signature Preview:
                </p>

                <p
                  style={{
                    fontSize: "1.2rem",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  {formValues.fullName}
                </p>
              </div>
            ) : (
              <></>
            )}
            <div className="form-check px-0 mb-3 d-flex align-items-center gap-2">
              <input
                className="round-checkbox"
                type="checkbox"
                name="dateAcknowledged"
                checked={formValues.dateAcknowledged}
                onChange={handleChange}
                id="dateAck"
              />
              <label className="form-check-label" htmlFor="dateAck">
                I acknowledge that today's date is <strong>{today}</strong>
              </label>
            </div>
            <div className="form-check px-0 mb-4 d-flex align-items-center gap-2">
              <input
                className="round-checkbox"
                type="checkbox"
                name="consent"
                checked={formValues.consent}
                onChange={handleChange}
                id="consent"
              />
              <label className="form-check-label" htmlFor="consent">
                By signing this document, I acknowledge that I have read and understood its contents. I agree that my
                electronic signature is legally binding.
              </label>
            </div>
            <button
              disabled={isDisabled}
              className="text-white themePurpleBGHover w-100 d-flex align-items-center justify-content-center gap-2 rounded py-2 px-3"
              style={{ height: "44px" }}
              onClick={handleSubmit}
            >
              <PenTool size={18} />
              Sign Document
            </button>
            <div className="text-center text-muted mt-4" style={{ fontSize: "0.75rem" }}>
              <p className="mb-1">🔒 This is a secure signing session.</p>
              <p className="mb-0">Your signature and IP address will be recorded for verification purposes.</p>
            </div>
          </div>
        </div>

        {/* <div className="text-center text-muted mt-3 pb-3" style={{ fontSize: "0.875rem" }}>
          <p className="mb-1">
            Need help? Contact{" "}
            <a href="mailto:hr@elevatestaffing.ai" className="themePurple fw-semibold">
              hr@elevatestaffing.ai
            </a>
          </p>
          <p className="mb-0 mt-2">© 2026 4Sphere Software Solutions LLC. All rights reserved.</p>
        </div> */}
      </div>
    );
  };

  const renderHeaderCard = () => {
    return (
      <div
        className="bg-white p-3 p-md-4 border rounded"
        style={{
          borderColor: "#e7e7ef",
          boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / .05)",
          color: "#080118",
        }}
      >
        <div className="d-flex justify-content-between gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded rounded-2" style={{ background: "#7c3bed25", color: "#7c3bed" }}>
              <Building2 />
            </div>
            <div>
              <div className="h5 fw-bolder mb-0">{signatureStatus?.organization_name || ""}</div>
              <div>Document Signing Portal</div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <SignatureStatusBadge status="pending" />
          </div>
        </div>

        <div className="mt-3">
          <div className="d-flex gap-3 justify-content-between align-items-center flex-wrap">
            <div className="d-flex gap-2 align-items-center">
              <FileText size={16} />
              <div>
                <div className="text-muted">Document Type</div>
                <div className="fw-semibold capitalize">
                  {String(signatureStatus?.document_type).replaceAll("_", " ")}
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <User size={16} />
              <div>
                <div className="text-muted">For</div>
                <div className="fw-semibold capitalize">{signatureStatus?.recipient_name}</div>
              </div>
            </div>
            {signatureStatus?.expires_at ? (
              <div className="d-flex gap-2 align-items-center">
                <Clock size={16} />
                <div>
                  <div className="text-muted">Expires</div>
                  <div className="fw-semibold capitalize">
                    {moment(signatureStatus?.expires_at).format("MMMM DD, YYYY [at] h:mm A")}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex align-items-center justify-content-center w-100 py-4 px-3" style={{ background: "#f1f5f9" }}>
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <ThemeLoader show={loading} fixed />

        {renderHeaderCard()}
        {renderSignatureView}
        {renderBodyContent()}
      </div>
    </div>
  );
}

function SignOffer() {
  return (
    <div>
      <SignOfferView />
      <MainFooter />
    </div>
  );
}

export default SignOffer;
