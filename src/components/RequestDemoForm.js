import { useState } from "react";
import OverlayModal from "./OverlayModal";
import { toast } from "react-toastify";
import DemoScheduler from "./DemoScheduler";
import { X } from "lucide-react";

function RequestDemoForm({ isVisible, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [formData, setformData] = useState({});
  const [errors, seterrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmailAddress = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      seterrors({ ...errors, email: "Please enter a valid email address." });
      return false;
    }

    const blockedDomains = /(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;
    if (blockedDomains.test(email)) {
      seterrors({ ...errors, email: "Please enter a business email, not a public email." });
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.preferred_demo_slot) {
      errors.demoslots = "Please select your preferred demo slot and time.";
      seterrors({ ...errors });
      return;
    }

    const payloadData = {
      name: name,
      email: email,
      phone_number: `${countryCode} ${phone}`,
      company_name: company,
      message: message,
      is_human_verified: true,
      source: "website",
      ...formData,
    };

    setIsLoading(true);

    fetch("https://demo-request-v3-305451280005.us-east1.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        return response.json();
      })
      .then(() => {
        onSuccess({
          message: "Thanks for choosing ElevateStaffing.ai!",
          subhead: "Your demo schedule will be shared shortly according to your preferred time slot.",
          button: "Thank You",
        });
        onClose();
      })
      .catch(() => {
        toast.error("Something went wrong, Please try again.");
      })
      .finally(() => setIsLoading(false));
  };
  if (!isVisible) return null;

  return (
    <OverlayModal
      style={{ maxWidth: "700px" }}
      modalStyle={{ paddingBottom: "20px", background: "#fff" }}
      isActive={isVisible}
      isOpen={isVisible}
      onClose={onClose}
    >
      {/* 🔴 DITTO JSX START */}
      <div className="ContactUsForm">
        <div className="contactFormOuter">
          <div className="mb-2 d-flex justify-content-between">
            <div>
              <div className="h4">Request a Demo</div>
              <div>Select a date and time slot, then fill out your details to schedule a demo.</div>
            </div>

            <div>
              <button
                onClick={onClose}
                className="hidemodalclosebtn pdfcontrollButtonsPDF d-flex align-items-center justify-content-center"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <section className="contact-form">
            <div className="contact-form-container pb-4">
              <form className="form-content p-1" onSubmit={handleSubmit}>
                <DemoScheduler
                  className="input_field_form bigHoverInput"
                  error={errors?.demoslots}
                  onChange={(val) => {
                    errors.demoslots = "";
                    formData.preferred_demo_slot = val?.selectedSlot?.label + " " + val?.date;
                    setformData({ ...formData });
                  }}
                  disabled={isLoading}
                />

                <div className="input-col col-flex">
                  <label className="input-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="input-col col-flex">
                  <label className="input-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      type="email"
                      placeholder="Enter your business email"
                      className="input-field"
                      value={email}
                      onChange={(e) => {
                        errors.email = "";
                        setEmail(e.target.value);
                      }}
                      required
                      onBlur={validateEmailAddress}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email ? <div className="text-danger font12">{errors.email}</div> : null}
                </div>

                <div className="input-col col-flex">
                  <label className="input-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <select
                      className="input-field mobileNumber"
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="+1">USA +1</option>
                      <option value="+91">IND +91</option>
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="input-col col-flex">
                  <label className="input-label">
                    Company <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      type="text"
                      placeholder="Your company name"
                      className="input-field"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="input-col col-flex">
                  <label className="input-label">
                    Job Title <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      type="text"
                      placeholder="Enter your job title"
                      className="input-field"
                      value={formData.job_title}
                      onChange={(e) => {
                        formData.job_title = e.target.value;
                        setformData({ ...formData });
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="input-col col-flex">
                  <label className="input-label">
                    Message <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <textarea
                      rows={2}
                      style={{ borderRadius: "12px" }}
                      placeholder="Tell us what you're looking for..."
                      className="input-field messagetxt"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn send-btn mt-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  )}
                  {isLoading ? "Loading..." : "Request Your Demo"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
      {/* 🔴 DITTO JSX END */}
    </OverlayModal>
  );
}

export default RequestDemoForm;
