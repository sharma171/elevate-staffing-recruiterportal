import { useState } from "react";
import OverlayModal from "./OverlayModal";
import { toast } from "react-toastify";
import { X } from "lucide-react";

function ContactUsForm({ isVisible, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmailAddress = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const blockedDomains = /(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;

    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Please enter a valid email address." });
      return false;
    }

    if (blockedDomains.test(email)) {
      setErrors({ ...errors, email: "Please enter a business email, not a public email." });
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    fetch("https://demo-request-v3-305451280005.us-east1.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone_number: `${countryCode} ${phone}`,
        company_name: company,
        message: "Support Request: " + message,
        is_human_verified: true,
        source: "website",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        onSuccess({
          message: "Thanks for reaching out!",
          subhead: "The ElevateStaffing.ai team will connect with you shortly.",
          button: "Thank You",
        });
        onClose();
      })
      .catch(() => toast.error("Something went wrong, Please try again."))
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
              <div className="h4">Contact Us</div>
              <div>Fill out the form below to get in touch with us.</div>
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
                {/* NAME */}
                <div className="input-col col-flex">
                  <label className="input-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      placeholder="Your Name"
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="input-col col-flex">
                  <label className="input-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      placeholder="your.email@example.com"
                      type="email"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmailAddress}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <div className="text-danger font12">{errors.email}</div>}
                </div>

                {/* PHONE */}
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
                      placeholder="+1 (123) 456-7890"
                      className="input-field"
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* COMPANY */}
                <div className="input-col col-flex">
                  <label className="input-label">
                    Company <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="input-field"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* MESSAGE */}
                <div className="input-col col-flex">
                  <label className="input-label">
                    Message <span className="text-danger">*</span>
                  </label>
                  <div className="input bigHoverInput">
                    <textarea
                      placeholder="How can we help you?"
                      rows={3}
                      style={{ borderRadius: "12px" }}
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
                  {isLoading && <span className="spinner-border spinner-border-sm"></span>}
                  {isLoading ? "Loading..." : "Contact Us"}
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

export default ContactUsForm;
