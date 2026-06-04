import { useState, useEffect } from "react";
import { Edit3, Loader2, AlertTriangle, X, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./ReviseOfferModal.module.css";
import { axiosApi, OverlayModal, ThemeLoader } from "../../../components";
import { useAuth } from "../../../authContext";

const LETTER_API_URL = "https://contact-employees-via-email-v3-305451280005.us-east1.run.app";

export default function ReviseOfferModal({ open, onClose, candidate, offerDetails, onSuccess }) {
  const [form, setForm] = useState({
    Position: "",
    Salary: "",
    "Start Date": "",
    pay_type: "hourly",
  });

  const [errors, setErrors] = useState({});
  const [revisionReason, setRevisionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const adminEmail = user?.email;
  const candidateEmail = candidate?.original_email || "";

  const templateData = offerDetails?.template_data;

  let versionNumber = offerDetails?.version_number;
  let signature_token = offerDetails?.signature_token;

  useEffect(() => {
    if (open) {
      setForm({
        "Full Name": templateData?.["Full Name"],
        Position: candidate?.job_title,
        Salary: candidate?.employee_salary,
        "Start Date": candidate?.employment_start_date,
        Volunteer: candidate?.volunteer_work,
        pay_type: candidate?.pay_type || "hourly",
      });

      // setForm(templateData || {});
    } else {
      setForm({});
      setRevisionReason("");
    }
  }, [JSON.stringify(templateData), open]);

  const handleGenerate = () => {
    const payload = {
      action: "generate_job_description",
      sender_email: adminEmail,
      position: form?.Position || offerDetails.Position,
    };

    setIsLoading(true);
    axiosApi
      .post(LETTER_API_URL, payload)
      .then((res) => {
        setJobDescription(res.data.responsibilities.join("\n"));
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.Position?.trim()) newErrors.Position = "Position is required";
    if (!form.Salary?.trim()) newErrors.Salary = "Salary is required";
    if (!form["Start Date"]) newErrors["Start Date"] = "Start date is required";
    if (!revisionReason.trim()) newErrors.revisionReason = "Revision reason is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendRevisedOffer = () => {
    if (!validate()) return;

    if (!signature_token) {
      toast.error("No active offer found to revise");
      return;
    }

    let payloadData = {
      candidateName: form["Full Name"],
      ...form,
      revision_reason: revisionReason,
      "Job Description": jobDescription,
    };

    onSuccess(payloadData, setLoading);

    // setLoading(true);

    // axios
    //   .post(LETTER_API_URL, {
    //     action: "generate_letter",
    //     sender_email: adminEmail,
    //     recipient_email: candidateEmail,
    //     template_type: "offer_letter",
    //     template_data: {
    //       "Letter Date": new Date().toISOString().split("T")[0],
    //       "Full Name": form["Full Name"],
    //       "Employee Email": candidateEmail,
    //       "First Name": form["Full Name"]?.trim().split(" ")[0] || "",
    //       Position: form.Position,
    //       Salary: form.Salary,
    //       "Start Date": form["Start Date"],
    //       Volunteer: form.Volunteer,
    //     },
    //     output_format: "pdf",
    //     require_signature: true,
    //     revision_of_token: signature_token,
    //     revision_reason: revisionReason,
    //   })

    //   .then((result) => {
    //     toast.success(`Revised Offer (Version ${versionNumber + 1}) sent successfully`);

    //     onSuccess &&
    //       onSuccess({
    //         signatureToken: result.signature_token,
    //         versionNumber: versionNumber + 1,
    //       });

    //     onClose();
    //   })
    //   .catch((err) => {
    //     toast.error(err?.error || err?.response?.data?.error || "Failed to send revised offer");
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  };

  return (
    <OverlayModal isActive={true} onClose={onClose} modalStyle={{ background: "#fff" }} style={{ maxWidth: "700px" }}>
      <div>
        <div className="d-flex align-items-center gap-2 justify-content-between">
          <h5 className="d-flex align-items-center gap-2">
            <Edit3 size={18} />
            Revise Offer Letter
          </h5>
          <div
            className="hidemodalclosebtn pdfcontrollButtonsPDF d-flex justify-content-center align-items-center pointer"
            onClick={onClose}
          >
            <X size={20} strokeWidth={3} />
          </div>
        </div>

        <div className="mb-3">Send a revised offer letter to the candidate. The previous offer will be superseded.</div>

        <div className={`alert alert-warning text-danger d-flex gap-2 ${styles.alert}`}>
          <AlertTriangle size={16} />
          <span>
            This will supersede the current offer (<strong className="text-danger">Version {versionNumber}</strong>
            ). The candidate will receive a new signing link.
          </span>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">Candidate</label>
            <input
              placeholder="Candidate Name"
              className="form-control bigHoverInput"
              value={form["Full Name"] || ""}
              disabled
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">
              Position <span className="text-danger">*</span>
            </label>
            <input
              placeholder="Position"
              className="form-control bigHoverInput"
              value={form.Position || ""}
              onChange={(e) => handleChange("Position", e.target.value)}
            />
            {errors.Position && <small className="text-danger">{errors.Position}</small>}
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">Pay Type</label>
            <select
              className="form-select bigHoverInput"
              value={form.pay_type}
              onChange={(e) => handleChange("pay_type", e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">
              {" "}
              Salary ({form.pay_type == "hourly" ? "Hourly" : "Per Annum"}) <span className="text-danger">*</span>
            </label>
            <input
              placeholder="e.g., $75,000"
              className="form-control bigHoverInput"
              value={form.Salary || ""}
              onChange={(e) => handleChange("Salary", e.target.value)}
            />
            {errors.Salary && <small className="text-danger">{errors.Salary}</small>}
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">
              Start Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control bigHoverInput"
              value={form["Start Date"]}
              onChange={(e) => handleChange("Start Date", e.target.value)}
            />
            {errors["Start Date"] && <small className="text-danger">{errors["Start Date"]}</small>}
          </div>{" "}
          <div className="col-md-6 mb-3">
            <label className="fw-semibold mb-1">Volunteer Work</label>
            <select
              className="form-select bigHoverInput"
              value={form.Volunteer}
              onChange={(e) => handleChange("Volunteer", e.target.value)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        <div className="signatureContainer space-y-2 mb-3">
          <div className="flex items-end justify-between mb-2">
            <label className="fw-semibold">
              Job Description{" "}
              <span className="font12" style={{ color: "#67677e" }}>
                (Optional — saved to records only)
              </span>
            </label>

            <div className="d-flex align-items-center gap-2">
              {jobDescription && !isLoading ? (
                <div
                  onClick={() => setJobDescription("")}
                  disabled={isLoading}
                  className="pointer successoutlineButton m-0 rounded-[10px]"
                >
                  <X size={18} /> Clear
                </div>
              ) : (
                <></>
              )}
              <div
                onClick={!isLoading ? handleGenerate : undefined}
                className={`successoutlineButton m-0 rounded-[10px]
                          ${isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer text-[#000]"}
                        `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span className="animate-pulse">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />✨ Generate with AI
                  </>
                )}
              </div>
            </div>
          </div>

          <textarea
            rows={4}
            placeholder="Enter each responsibility on a new line (max 7)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="bigHoverInput form-control"
          />

          <p className="text-xs text-muted-foreground">
            Each line becomes a bullet point in the offer letter (max 7 lines).
          </p>
        </div>
        <div className="mb-4">
          <label className="fw-semibold mb-1">
            Revision Reason <span className="text-danger">*</span>
          </label>
          <textarea
            placeholder="Revision Reason"
            className="form-control bigHoverInput"
            rows="3"
            value={revisionReason || ""}
            onChange={(e) => {
              setRevisionReason(e.target.value);
              setErrors((prev) => ({ ...prev, revisionReason: "" }));
            }}
          />
          {errors.revisionReason && <small className="text-danger">{errors.revisionReason}</small>}
        </div>
        <div className="d-flex gap-2 justify-content-end my-3">
          <div className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </div>

          <div
            className={`themePurpleBGHover d-flex align-items-center gap-2 py-2 pointer px-3 text-white rounded ${
              loading ? "opacity-75 pointer-events-none" : ""
            }`}
            onClick={handleSendRevisedOffer}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Sending...
              </>
            ) : (
              <>Generate & Preview</>
            )}
          </div>
        </div>
      </div>
      <ThemeLoader show={loading} fixed />
    </OverlayModal>
  );
}
