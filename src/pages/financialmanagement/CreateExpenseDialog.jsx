import React, { useState } from "react";
import { Plus, X, Upload, FileImage, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { axiosApi } from "../../components";
import styles from "./CreateExpenseDialog.module.css";
import OverlayModal from "../../components/OverlayModal";
import { useAuth } from "../../authContext";
import DatePicker from "react-datepicker";

const EXPENSE_API_BASE_URL = "https://expense-management-api-v3-305451280005.us-east1.run.app";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result || "";
      resolve(result.split(",")[1] || "");
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

function apiPost(payload) {
  if (typeof axiosApi !== "undefined" && axiosApi?.post) {
    return axiosApi.post(EXPENSE_API_BASE_URL, payload).then((r) => r.data);
  }
  return Promise.reject(new Error("axiosApi.post not available"));
}

function createExpenseWithAttachments(payload) {
  return apiPost({
    action: payload.attachments ? "create_expense_with_attachments" : "create_expense",
    ...payload,
  });
}

const Input = (p) => <input className={`inputSolidBorder ${styles.input} ${p.className || ""}`} {...p} />;
const Label = (p) => <label className={styles.label} {...p} />;
const Textarea = (p) => <textarea rows={2} className={`inputSolidBorder ${styles.textarea}`} {...p} />;
const Select = ({ name, children, defaultValue, required, ...rest }) => (
  <select
    name={name}
    defaultValue={defaultValue}
    required={required}
    className={`form-select inputSolidBorder`}
    {...rest}
  >
    {children}
  </select>
);

export function CreateExpenseDialog({ employerEmail = "", onSuccess = () => {} }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <div>
      <div className="d-flex justify-content-end">
        <button className="themeButton themeButtonHover rounded py-2 px-3" onClick={() => setOpen(true)}>
          <Plus size={16} /> Create Expense
        </button>
      </div>

      <OverlayModal
        isActive={open}
        onClose={() => setOpen(false)}
        modalStyle={{ background: "white" }}
        style={{ maxWidth: "750px" }}
      >
        <div className={styles.sheetContent}>
          <div className={`flex-column align-items-start mb-2`}>
            <div className="d-flex align-items-center gap-2">
              <div className="h5 fw-bold gap-2 align-items-center d-flex">Add Organization Expense</div>
            </div>
            <div className="text-muted">Record a general company expense</div>
          </div>

          <OrganizationExpenseForm
            employerEmail={employerEmail}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </OverlayModal>
    </div>
  );
}

export function OrganizationExpenseForm({ onSuccess = () => {}, onCancel = () => {} }) {
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

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date());

  const { user } = useAuth();
  const employerEmail = user?.email;

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file) => {
    if (file.type.includes("pdf")) return <FileText size={18} className="text-danger" />;
    return <FileImage size={18} className="text-primary" />;
  };

  const handleFileChange = (e) => {
    const s = Array.from(e.target.files || []);
    const valid = s.filter((f) => {
      if (f.size > 25 * 1024 * 1024) {
        toast.error(`${f.name} too large`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const backendDate = formatBackendDate(expenseDate);

    Promise.all(
      files.map((f) =>
        fileToBase64(f).then((b) => ({
          file_name: f.name,
          base64_content: b,
          file_type: f.type,
          description: "Organization Expense Document",
        }))
      )
    )
      .then((attachments) => {
        const payload = {
          employer_email: employerEmail,
          is_organization_expense: true,
          category: fd.get("category"),
          expense_date: backendDate,
          amount: parseFloat(fd.get("amount")),
          description: fd.get("description"),
          merchant_name: fd.get("merchant_name") || undefined,
          project_code: fd.get("project_code") || undefined,
          notes: fd.get("notes") || undefined,
          is_reimbursable: false,
          attachments: attachments.length ? attachments : undefined,
        };
        return createExpenseWithAttachments(payload);
      })
      .then(() => {
        toast.success("Organization expense created");
        onSuccess();
      })
      .catch(() => {
        toast.error("Failed to create organization expense");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <Label>Category *</Label>
        <Select name="category" required defaultValue="">
          <option value="">Select Category</option>
          {ORGANIZATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Date *</Label>
        <DatePicker
          selected={expenseDate}
          onChange={(d) => setExpenseDate(d)}
          dateFormat="MM/dd/yyyy"
          maxDate={new Date()}
          placeholderText="MM/DD/YYYY"
          className={`inputSolidBorder ${styles.input}`}
        />
      </div>

      <div>
        <Label>Amount (USD) *</Label>
        <Input type="number" name="amount" step="0.01" required placeholder="Enter amount in USD" />
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea name="description" required placeholder="Enter description" />
      </div>

      <div>
        <Label>Merchant Name</Label>
        <Input name="merchant_name" placeholder="Enter merchant name" />
      </div>

      <div>
        <Label>Project Code</Label>
        <Input name="project_code" placeholder="Enter project code" />
      </div>

      <div>
        <Label>Additional Notes</Label>
        <Textarea name="notes" placeholder="Enter additional notes" />
      </div>

      <div>
        <Label>Document/Receipt (Optional)</Label>
        <div className={styles.dashedSmall}>
          <input
            id="org-expense-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className={styles.hiddenFile}
            multiple
            onChange={handleFileChange}
          />
          <button
            className="themeButton themeButtonHover px-3 py-2 rounded"
            type="button"
            onClick={() => document.getElementById("org-expense-upload")?.click()}
          >
            <Upload className={styles.iconSmallInline} /> Upload
          </button>
          <div className={styles.smallMuted}>PDF/JPG/PNG up to 25MB</div>
        </div>

        {files.length > 0 && (
          <div className={`my-3 ${styles.fileList}`}>
            {files.map((f, i) => (
              <div key={i} className={`${styles.fileRow} pe-3 mt-1`}>
                <div className="d-flex gap-2 align-items-center">
                  {getFileIcon(f)}
                  <div>
                    <div className={`fw-semibold ${styles.fileName}`}>{f.name}</div>
                    <div className="font12 text-muted">{formatSize(f.size)}</div>
                  </div>
                </div>
                <button
                  title={`Delete ${f.name}`}
                  className={`text-danger ${styles.buttonGhost}`}
                  type="button"
                  size="sm"
                  onClick={() => removeFile(i)}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actionsRow}>
        <button className={`${styles.buttonSm} ${styles.buttonOutline}`} type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="themeButton themeButtonHover px-3 py-2 rounded" disabled={loading}>
          {loading ? "Creating..." : "Create Expense"}
        </button>
      </div>
    </form>
  );
}

function formatBackendDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default CreateExpenseDialog;
