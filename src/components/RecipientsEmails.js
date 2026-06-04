import { useEffect, useState } from "react";
import styles from "./RecipientEmails.module.css";
import { Plus, X } from "lucide-react";

export default function EmailRecipients({
  title = "Recipient email:",
  emailRecipients = [],
  setEmailRecipients = () => {},
  placeholder = "Recipient email",
  buttonTitle = "Add recipient email",
  errorCustom,
  setErrorCustom = () => {},
}) {
  const [emails, setEmails] = useState(emailRecipients);
  const [showInput, setShowInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState(errorCustom);

  useEffect(() => {
    if (errorCustom) {
      setError(errorCustom);
    }
  }, [errorCustom]);

  useEffect(() => {
    if (!emails.length) {
      setShowInput(true);
    }
  }, [emails.length]);

  useEffect(() => {
    if (emails) {
      setEmailRecipients(emails);
    }
  }, [JSON.stringify(emails)]);

  useEffect(() => {
    if (emailRecipients?.length) {
      setEmails(emailRecipients);
    }
  }, [JSON.stringify(emailRecipients)]);

  const validateEmail = (email) => {
    const regex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(newEmail)) {
      setError("Invalid email format");
      return;
    }
    if (emails.includes(newEmail)) {
      setError("Email already added");
      return;
    }
    setEmails([...emails, newEmail]);
    setNewEmail("");
    setErrorCustom("");
    setError("");
    setShowInput(false);
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div className={styles.recipient_section}>
      <label className={styles.section_label}>{title}</label>
      <div className="d-flex flex-wrap gap-2">
        {emails.length > 0 && (
          <div className={`align-items-center ${styles.email_container}`} style={{ height: "max-content" }}>
            {emails.map((email, i) => (
              <div key={i} className={styles.email_badge}>
                {email}
                <span className="ps-2 pointer text-danger" title="Remove" onClick={() => handleRemoveEmail(email)}>
                  <X size={14} strokeWidth={3} />
                </span>
              </div>
            ))}
            {!showInput && (
              <span title={buttonTitle}>
                <Plus size={25} className="pointer generalButton" onClick={() => setShowInput(true)} />
              </span>
            )}
          </div>
        )}

        {showInput && (
          <div style={{ maxWidth: "300px", minHeight: "52px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                value={newEmail}
                onChange={(e) => {
                  setErrorCustom("");
                  setError("");
                  setNewEmail(e.target.value);
                }}
                placeholder={placeholder}
                className={styles.inputField}
              />
              <button title={buttonTitle} onClick={handleAddEmail} className={styles.addButton}>
                <Plus size={18} />
              </button>
            </div>
            {error && <div style={{ color: "red", fontSize: "12px" }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
