import { useEffect, useState } from "react";
import { Mail, Eye, EyeOff, ChevronDown, Info, AlertCircle, ExternalLink, Loader2, X } from "lucide-react";
import { axiosApi, OverlayModal } from "../../components";
import { useAuth } from "../../authContext";
import { toast } from "react-toastify";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

export default function AddCandidateGmailModal({ open, onOpenChange, onSave, preselectedData, recruiter_email }) {
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [sendEnabled, setSendEnabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const preselectedEmail = preselectedData?.selectedMail;
  const isManualEntry = !preselectedEmail;
  const isEdit = preselectedEmail?.isEdit || false;

  const candidateDataToShow = preselectedData?.data || {};

  const { user } = useAuth();
  const adminEmail = user?.email;

  useEffect(() => {
    setSendEnabled(preselectedEmail?.send_enabled);
  }, [JSON.stringify(preselectedEmail || {})]);

  useEffect(() => {
    if (open) {
      setAppPassword("");
      setErrors({});
      setShowPassword(false);
      setManualName("");
      setManualEmail("");
      setLoading(false);
    }
  }, [open]);

  const formatAppPassword = (value) => {
    const clean = value.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
    return (clean.match(/.{1,4}/g) || []).join(" ").slice(0, 19);
  };

  const validate = () => {
    const e = {};
    if (isManualEntry) {
      if (!manualEmail) {
        e.email = "Email address is required";
      } else if (!/^(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(manualEmail)) {
        e.email = "Invalid email address";
      }
    }
    const clean = appPassword.replace(/\s/g, "");
    if (!clean) e.password = "App password is required";
    else if (clean.length !== 16) e.password = "Must be 16 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const email = manualEmail || preselectedEmail.email;
    const name = manualName || candidateDataToShow?.candidate_name;
    setLoading(true);

    const payload = {
      action: "add_candidate_gmail",
      requesting_user_email: adminEmail,
      candidate_email: email,
      candidate_name: name,
      app_password_base64: btoa(appPassword),
      send_enabled: sendEnabled,
    };

    if (recruiter_email) {
      payload.recruiter_email = recruiter_email;
    }

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        console.log(res, "ssssssssss");
        toast.success(res?.data?.message);
        onOpenChange();
        onSave?.();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error);
        console.log(err, "ssssssssss");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!open) return null;

  return (
    <OverlayModal
      isActive={open}
      onClose={() => onOpenChange(false)}
      modalStyle={{ background: "#fff", padding: "20px" }}
      style={{ maxWidth: "700px" }}
    >
      <div className="signatureContainer homepageFontfamily">
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 justify-content-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
              <Mail className="text-[#1d4ed8]" size={20} />
              {isEdit ? "Update Gmail App Password" : "Add Gmail App Password"}
            </h2>

            <button onClick={() => onOpenChange(false)} className="hidemodalclosebtn pdfcontrollButtonsPDF">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[#6b7280] mt-1">Configure a candidate's Gmail for sending emails.</p>
        </div>

        {isManualEntry ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Candidate Name</label>
              <input
                placeholder="Enter Candidate Name"
                className="bigHoverInput form-control"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gmail Address</label>
              <div className="mt-1 flex bigHoverInput form-control p-0">
                <input
                  placeholder="Enter Gmail Address"
                  className="w-100 h-100 m-0 border-0 outline-0 py-[9.6px] px-[12px]"
                  value={manualEmail}
                  onChange={(e) => {
                    setManualEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: null }));
                  }}
                />
                <span className="flex items-center rounded-r-md border border-l-0 border-[#d1d5db] bg-[#f3f4f6] px-3 text-sm text-[#6b7280]">
                  @gmail.com
                </span>
              </div>
              {errors.email && <p className="text-sm text-[#ef4444] mt-1">{errors.email}</p>}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0F172A]">{candidateDataToShow?.candidate_name}</p>
              <p className="text-sm text-[#64748B]">
                {preselectedEmail?.email} ({preselectedEmail?.type})
              </p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm font-medium">Gmail App Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              className="bigHoverInput form-control"
              placeholder="xxxx xxxx xxxx xxxx"
              value={appPassword}
              maxLength={19}
              onChange={(e) => {
                setAppPassword(formatAppPassword(e.target.value));
                setErrors((prev) => ({ ...prev, password: null }));
              }}
            />
            <button
              className="absolute right-[12px] top-2 text-[#6b7280] bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-[#ef4444] mt-1">{errors.password}</p>}
        </div>

        {/* Send Toggle */}
        <div className="mt-4 flex items-center justify-between rounded-lg ring-1 ring-[#e7e7ef] bg-[#f1f1f94c] p-3">
          <div>
            <p className="text-sm font-medium">Send from candidate email</p>
            <p className="text-xs text-[#6b7280]">
              {sendEnabled ? "Emails sent from candidate's Gmail" : "Emails sent from your Outlook"}
            </p>
          </div>
          <button
            onClick={() => setSendEnabled(!sendEnabled)}
            className={`h-6 w-11 rounded-full p-1 transition ${sendEnabled ? "bg-[#7c3bed]" : "bg-[#d1d5db]"}`}
          >
            <div className={`h-4 w-4 rounded-full bg-[#ffffff] transition ${sendEnabled ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-3 text-sm">
          <p className="font-medium text-[#1e40af] mb-1">ℹ️ Ask the candidate to:</p>
          <ol className="list-decimal pl-5 text-[#1d4ed8] space-y-1">
            <li>Go to myaccount.google.com/apppasswords</li>
            <li>Enable 2-Step Verification</li>
            <li>Generate App Password for Mail</li>
            <li>Share the 16-character password</li>
          </ol>
        </div>

        {/* Collapsible */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between px-3 py-2 mt-3 rounded-[10px] cursor-pointer text-[#67677e] hover:!text-[#fff] hover:!bg-[#3c83f6] bg-transparent"
        >
          <span className="flex items-center gap-2">
            <Info size={16} /> Detailed instructions
          </span>
          <ChevronDown size={16} className={`transition ${showInstructions ? "rotate-180" : ""}`} />
        </button>

        {showInstructions && (
          <div className="mt-2 mb-3 rounded-lg ring-1 ring-[#bfdbfe] bg-[#eff6ff] p-4 text-sm space-y-3">
            <p className="font-medium text-[#1e40af]">Step 1: Enable 2-Step Verification</p>
            <p className="text-[#1d4ed8]">Go to Google Account → Security → Enable 2-Step Verification</p>

            <p className="font-medium text-[#1e40af]">Step 2: Generate App Password</p>
            <ul className="list-disc pl-5 text-[#1d4ed8] space-y-1">
              <li>Go to myaccount.google.com/apppasswords</li>
              <li>Select app: "Mail"</li>
              <li>Select device: "Other (Custom name)"</li>
              <li>Enter name: "Recruiter Portal"</li>
              <li>Click "Generate"</li>
            </ul>

            <p className="font-medium text-[#1e40af]">Step 3: Copy the Password</p>
            <p className="text-[#1d4ed8]">Copy the 16-character password (looks like: xxxx xxxx xxxx xxxx)</p>

            <div className="flex items-start gap-2 pt-2" style={{ borderTop: "1px solid #bfdbfe" }}>
              <AlertCircle className="text-[#d97706] shrink-0 mt-1" size={16} />
              <p className="text-[#92400e] mt-0">
                This is NOT the regular Gmail password. App Password can only be used for this specific app and can be
                revoked anytime.
              </p>
            </div>

            <button
              onClick={() => window.open("https://myaccount.google.com/apppasswords", "_blank")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] ring-1 ring-[#93c5fd] px-3 py-2 text-[#1d4ed8] hover:!bg-[#dbeafe] bg-white"
            >
              <ExternalLink size={16} /> Open Google App Passwords
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2 fw-medium">
          <button
            onClick={() => onOpenChange(false)}
            className="successoutlineButton successoutlineButtonWhite border !rounded-[10px]"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center rounded-[10px] bg-[#0b64f4] px-3 py-2 text-sm text-white hover:bg-[#1d4ed8]"
          >
            {loading && <Loader2 className="mr-2 animate-spin" size={16} />}
            {isEdit ? "Update Password" : "Save App Password"}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
