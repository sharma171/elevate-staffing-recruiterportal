import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { axiosApi, ThemeLoader } from "../../../components";
import styles from "./OrganizationExpenseForm.module.css";

const ORGANIZATION_CATEGORIES = [
  "Rent & Facilities",
  "Utilities",
  "Insurance",
  "Marketing & Advertising",
  "Office Supplies",
  "Equipment & Hardware",
  "Software & Tools",
  "Professional Services",
  "Legal & Compliance",
  "Taxes & Licenses",
  "Other",
];

const EXPENSE_API_BASE_URL = "https://expense-management-api-v3-305451280005.us-east1.run.app";
const AUTHORIZATION_HEADER = "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=";

export default function OrganizationExpenseForm({ employerEmail, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const fileToBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(",")[1];
        res(base64);
      };
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const attachments = await Promise.all(
        files.map(async (f) => ({
          file_name: f.name,
          base64_content: await fileToBase64(f),
          file_type: f.type,
          description: "Organization Expense Document",
        }))
      );

      const payload = {
        action: "create_expense_with_attachments",
        employer_email: employerEmail,
        is_organization_expense: true,
        category: form.get("category"),
        expense_date: form.get("expense_date"),
        amount: parseFloat(form.get("amount")),
        description: form.get("description"),
        merchant_name: form.get("merchant_name") || undefined,
        project_code: form.get("project_code") || undefined,
        notes: form.get("notes") || undefined,
        is_reimbursable: false,
        attachments: attachments.length ? attachments : undefined,
      };

      const resp = await axiosApi.post(EXPENSE_API_BASE_URL, payload, {
        headers: {
          Authorization: AUTHORIZATION_HEADER,
          Origin: window.location.origin,
        },
      });
      const result = resp.data;
      if (result && result.status === "success") {
        alert("Organization expense created successfully!");
        onSuccess && onSuccess();
      } else {
        alert(result?.error || "Failed to create organization expense");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create organization expense");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const valid = [];
    for (const file of selectedFiles) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 25MB.`);
        continue;
      }
      valid.push(file);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 10));
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <ThemeLoader show={loading} />

      <div className={styles.field}>
        <label>Category *</label>
        <select name="category" required>
          <option value="">Select category</option>
          {ORGANIZATION_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label>Date *</label>
        <input
          type="date"
          id="expense_date"
          name="expense_date"
          defaultValue={new Date().toISOString().split("T")[0]}
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className={styles.field}>
        <label>Amount (USD) *</label>
        <input
          type="number"
          id="amount"
          name="amount"
          step="0.01"
          min="0.01"
          max="1000000"
          placeholder="0.00"
          required
        />
      </div>

      <div className={styles.field}>
        <label>Description *</label>
        <textarea
          id="description"
          name="description"
          maxLength={500}
          placeholder="What is this expense for?"
          required
        />
      </div>

      <div className={styles.field}>
        <label>Merchant Name</label>
        <input id="merchant_name" name="merchant_name" maxLength={200} placeholder="e.g., Power Company" />
      </div>

      <div className={styles.field}>
        <label>Project Code</label>
        <input id="project_code" name="project_code" maxLength={50} placeholder="Optional project tracking" />
      </div>

      <div className={styles.field}>
        <label>Additional Notes</label>
        <textarea id="notes" name="notes" maxLength={1000} placeholder="Any additional context" />
      </div>

      <div className={styles.field}>
        <label>Document/Receipt (Optional)</label>
        <label className={styles.uploadArea}>
          <div className={styles.uploadInner}>
            <Upload className={styles.uploadIcon} />
            <div>
              <div className={styles.uploadTitle}>Click to upload or drag and drop</div>
              <div className={styles.uploadSub}>PDF, JPG, PNG up to 25MB (max 10 files)</div>
            </div>
          </div>
          <input
            id="org-expense-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </label>

        {files.length > 0 && (
          <div className={styles.filesList}>
            {files.map((file, idx) => (
              <div key={idx} className={styles.fileRow}>
                <div className={styles.fileName}>{file.name}</div>
                <button type="button" className={styles.iconBtn} onClick={() => removeFile(idx)}>
                  <X />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnOutline} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? "Creating..." : "Create Expense"}
        </button>
      </div>
    </form>
  );
}
