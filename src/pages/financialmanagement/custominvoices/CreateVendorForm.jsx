import React, { useEffect, useState } from "react";
import styles from "./CreateVendorForm.module.css";
import { axiosApi, OverlayModal, ThemeLoader } from "../../../components";
import { toast } from "react-toastify";
import { X, Loader2 } from "lucide-react";
import { formatUSPhone } from "../../../helpers/StrHelpers";
import { useAuth } from "../../../authContext";

const API_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app/";

export default function CreateVendorForm({ onClose = () => {}, onCreated = () => {}, initialVendor = null, isActive }) {
  const [currentMode, setCurrentMode] = useState(() => (initialVendor ? "edit" : "create"));
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState(
    initialVendor || {
      company_name: "",
      contact_person: "",
      primary_email: "",
      phone: "",
      billing_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      payment_terms: "Net 30",
      tax_id: "",
      website: "",
      is_active: true,
      assignment_details: { hourly_rate: 0, is_primary: false },
    }
  );
  const [errors, setErrors] = useState({});

  const { user } = useAuth();
  const employerEmail = user?.email;

  useEffect(() => {
    if (initialVendor) {
      setVendor(initialVendor);
      setCurrentMode("edit");
    }
  }, [initialVendor]);

  useEffect(() => {
    if (vendor.zip_code && vendor.zip_code.toString().length === 5) {
      setLoading(true);
      fetch("https://retrieve-location-details-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: vendor.zip_code }),
      })
        .then((res) => res.json())
        .then((resData) => {
          const city = resData?.data?.city;
          const state = resData?.data?.state;
          const country = resData?.data?.country;
          setVendor((prev) => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
          }));
        })
        .catch(() => {
          toast.error("Failed to auto-fill location from ZIP");
        })
        .finally(() => setLoading(false));
    }
  }, [vendor.zip_code]);

  function validate(v) {
    const e = {};
    if (!v.company_name || !v.company_name.toString().trim()) e.company_name = "Company name required";
    if (!v.primary_email || !/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v.primary_email))
      e.primary_email = "Valid email required";
    return e;
  }

  function createVendor(v) {
    const e = validate(v);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!employerEmail) {
      toast.error("Employer email required");
      return;
    }
    setLoading(true);
    axiosApi
      .post(API_URL, {
        action: "create_vendor",
        employer_email: employerEmail,
        employee_email: null,
        vendor_details: {
          tax_id: v.tax_id,
          is_active: v.is_active === undefined ? true : v.is_active,
          website: v.website,
          company_name: v.company_name,
          contact_person: v.contact_person,
          primary_email: v.primary_email,
          phone: v.phone,
          billing_address: v.billing_address,
          city: v.city,
          country: v.country || "USA",
          state: v.state,
          zip_code: v.zip_code,
          payment_terms: v.payment_terms || "Net 30",
        },
      })
      .then((r) => r?.data ?? r)
      .then((res) => {
        const created = res?.vendor || null;
        toast.success(res?.message || "Vendor created");
        onCreated(
          created || {
            vendor_id: created?.vendor_id || undefined,
            ...v,
          }
        );
        setCurrentMode("edit");
        setVendor(created || v);
        onClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.message || "Create vendor failed");
      })
      .finally(() => setLoading(false));
  }

  function updateVendor(v) {
    if (!v.vendor_id) {
      createVendor(v);
      return;
    }
    const e = validate(v);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    axiosApi
      .post(API_URL, {
        action: "update_vendor",
        employer_email: employerEmail,
        vendor_id: v.vendor_id,
        vendor_details: {
          company_name: v.company_name,
          contact_person: v.contact_person,
          primary_email: v.primary_email,
          phone: v.phone,
          billing_address: v.billing_address,
          city: v.city,
          state: v.state,
          zip_code: v.zip_code,
          country: v.country,
          payment_terms: v.payment_terms,
          website: v.website,
          tax_id: v.tax_id,
          is_active: v.is_active,
        },
      })
      .then((r) => r?.data ?? r)
      .then((res) => {
        toast.success(res?.message || "Vendor updated");
        onCreated(v);
        setCurrentMode("edit");
        onClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.message || "Update vendor failed");
      })
      .finally(() => setLoading(false));
  }

  if (!isActive) return <></>;

  return (
    <OverlayModal
      isActive={isActive}
      onClose={onClose}
      modalStyle={{ background: "#fff" }}
      style={{ maxWidth: "820px" }}
    >
      <div>
        <div className={styles.formHeader}>
          <h3>{currentMode === "edit" ? "Edit Vendor" : "Create Vendor"}</h3>
        </div>

        <div className={styles.section}>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} `}>
              <label className="fw-medium mb-1">Vendor Company Name *</label>
              <input
                className={`${styles.input} ${errors.company_name ? styles.errorInput : ""}`}
                placeholder="Acme Corporation"
                value={vendor.company_name}
                onChange={(e) => setVendor({ ...vendor, company_name: e.target.value })}
              />
              {errors.company_name && <p className={styles.errorText}>{errors.company_name}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Primary Email *</label>
              <input
                className={`${styles.input} ${errors.primary_email ? styles.errorInput : ""}`}
                type="email"
                placeholder="name@company.com"
                value={vendor.primary_email}
                onChange={(e) => setVendor({ ...vendor, primary_email: e.target.value })}
              />
              {errors.primary_email && <p className={styles.errorText}>{errors.primary_email}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Contact Person</label>
              <input
                className={styles.input}
                placeholder="Jane Doe"
                value={vendor.contact_person}
                onChange={(e) => setVendor({ ...vendor, contact_person: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Phone</label>
              <input
                className={styles.input}
                placeholder="(555) 555-5555"
                value={vendor.phone}
                onChange={(e) => setVendor({ ...vendor, phone: formatUSPhone(e.target.value) })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className="fw-medium mb-1">Billing Address</label>
              <input
                className={styles.input}
                placeholder="123 Main St, Suite 400"
                value={vendor.billing_address}
                onChange={(e) => setVendor({ ...vendor, billing_address: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">City</label>
              <input
                className={styles.input}
                placeholder="San Francisco"
                value={vendor.city}
                onChange={(e) => setVendor({ ...vendor, city: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">State</label>
              <input
                className={styles.input}
                placeholder="CA"
                value={vendor.state}
                onChange={(e) => setVendor({ ...vendor, state: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">ZIP</label>
              <input
                className={styles.input}
                placeholder="94107"
                value={vendor.zip_code}
                onChange={(e) => setVendor({ ...vendor, zip_code: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Payment Terms</label>
              <select
                className={`form-select ${styles.input}`}
                value={vendor.payment_terms}
                onChange={(e) => setVendor({ ...vendor, payment_terms: e.target.value })}
              >
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
                <option>Net 75</option>
                <option>Net 90</option>
                <option>Due on Receipt</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Hourly Rate ($)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={vendor.assignment_details?.hourly_rate || 0}
                onChange={(e) =>
                  setVendor({
                    ...vendor,
                    assignment_details: {
                      ...(vendor.assignment_details || {}),
                      hourly_rate: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className="fw-medium mb-1">Tax ID</label>
              <input
                className={styles.input}
                placeholder="12-3456789"
                value={vendor.tax_id}
                onChange={(e) => setVendor({ ...vendor, tax_id: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className="fw-medium mb-1">Website</label>
              <input
                className={styles.input}
                placeholder="https://www.company.com"
                value={vendor.website}
                onChange={(e) => setVendor({ ...vendor, website: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.saveButton}
              onClick={() => (currentMode === "edit" ? updateVendor(vendor) : createVendor(vendor))}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spin} /> Saving...
                </>
              ) : currentMode === "edit" ? (
                "Save Changes"
              ) : (
                "Create Vendor"
              )}
            </button>
            <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>

        <ThemeLoader show={loading} />
      </div>
    </OverlayModal>
  );
}
