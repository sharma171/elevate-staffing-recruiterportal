import React, { useState, useEffect } from "react";
import { Building2, Plus, X } from "lucide-react";
import styles from "./SupplierManagementDialog.module.css";
import OverlayModal from "../../components/OverlayModal";
import { axiosApi, ThemeLoader } from "../../components";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import { formatUSPhone } from "../../helpers/StrHelpers";

const SUPPLIERS_API_URL = "https://manage-supplier-invoices-api-v3-305451280005.us-east1.run.app";

export default function SupplierManagementDialog({
  isActive,
  onClose,
  editing = null,
  mode = "create", // "create" | "edit" | "view"
  onSaved,
}) {
  const initial = {
    companyName: "",
    supplierType: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    paymentTerms: "",
    taxId: "",
    is1099Vendor: false,
    notes: "",
  };

  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [loader, setLoader] = useState(false);

  const supplierTypes = [
    "Vendor",
    "Contractor",
    "Service Provider",
    "Manufacturer",
    "Distributor",
    "Consultant",
    "Other",
  ];
  const paymentTerms = ["Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Due on Receipt", "COD (Cash on Delivery)"];

  const isView = mode === "view";
  const isEdit = mode === "edit";

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    if (isActive) {
      setTouched({});
      if ((isEdit || isView) && editing) {
        const get = (e, ...keys) => keys.reduce((acc, k) => acc || e[k], undefined);
        setForm({
          companyName: get(editing, "company_name", "companyName", "supplier_name") || "",
          supplierType: get(editing, "supplier_type", "supplierType") || "",
          contactPerson: get(editing, "contact_person", "contactPerson") || "",
          email: get(editing, "email", "supplier_email") || "",
          phone: get(editing, "phone", "supplier_phone") || "",
          address: get(editing, "location", "address", "supplier_address") || "",
          city: get(editing, "city", "supplier_city") || "",
          state: get(editing, "state", "supplier_state") || "",
          postal_code: get(editing, "postal_code") || "",
          paymentTerms: get(editing, "payment_terms", "paymentTerms", "supplier_payment_terms") || "",
          taxId: get(editing, "tax_id", "taxId", "supplier_tax_id") || "",
          is1099Vendor: !!get(editing, "is_1099", "is1099Vendor", "requires_1099"),
          notes: get(editing, "notes") || "",
        });
      } else {
        setForm(initial);
      }
    }
  }, [isActive, editing, isEdit, isView]);

  function getPincodeDetails() {
    if (String(form.postal_code).length == 5) {
      let payload = { zip_code: form.postal_code };
      setLoader(true);
      api
        .zipCodeInfo(payload)
        .then((data) => {
          setLoader(false);
          if (data) {
            let city = data?.data?.city;
            let state = data?.data?.state;
            let country = data?.data?.country;

            setForm((prev) => ({
              ...prev,
              city: city || prev.city,
              state: state || prev.state,
            }));
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log(err);
        });
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    let isPhone = name == "phone";

    if (isPhone) {
      let val = formatUSPhone(value);

      return setForm((s) => ({ ...s, [name]: val }));
    }

    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    if (name === "postal_code") {
      getPincodeDetails();
    }
  }

  function validate(values) {
    const errs = {};
    if (!values.companyName.trim()) errs.companyName = "Company name is required";
    if (!values.supplierType) errs.supplierType = "Supplier type is required";
    if (values.email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(values.email)) errs.email = "Invalid email";
    }
    if (values.phone) {
      const digits = values.phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) errs.phone = "Invalid phone number";
    }
    if (values.postal_code) {
      if (!/^\d{3,10}$/.test(values.postal_code)) errs.postal_code = "Invalid zip code";
    }
    return errs;
  }

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0 && form.companyName.trim() && form.supplierType;

  function handleSubmit(e) {
    e.preventDefault();
    if (isView) return;

    setTouched({
      companyName: true,
      supplierType: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      postal_code: true,
      paymentTerms: true,
      taxId: true,
      notes: true,
    });

    if (!isValid) return;

    setLoader(true);

    if (isEdit && editing && (editing.id || editing.supplier_id)) {
      const supplierId = editing.id || editing.supplier_id;
      const payload = {
        user_email: user_email,
        action: "update_supplier",
        supplier_id: supplierId,
        company_name: form.companyName,
        supplier_type: form.supplierType,
        contact_person: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address_line1: form.address,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        payment_terms: form.paymentTerms,
        tax_id: form.taxId,
        is_1099: !!form.is1099Vendor,
        notes: form.notes,
      };

      axiosApi
        .post(SUPPLIERS_API_URL, payload)
        .then((res) => {
          const d = res?.data;
          const msg = d?.message || d?.msg || "Supplier updated";
          const saved = d?.supplier ||
            d || {
              id: supplierId,
              company_name: form.companyName,
              email: form.email,
              phone: form.phone,
            };
          toast.success(msg);
          if (typeof onSaved === "function") onSaved(saved, "update");
          if (typeof onClose === "function") onClose();
        })
        .catch((err) => {
          const r = err?.response?.data;
          const msg = r?.message || r?.msg || err.message || "Failed to update supplier";
          toast.error(msg);
          if (typeof onSaved === "function") onSaved(null);
        })
        .finally(() => setLoader(false));
    } else {
      const payload = {
        user_email: user_email,
        action: "create_supplier",
        company_name: form.companyName,
        supplier_type: form.supplierType,
        contact_person: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address_line1: form.address,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        payment_terms: form.paymentTerms,
        tax_id: form.taxId,
        is_1099: !!form.is1099Vendor,
        notes: form.notes,
      };

      axiosApi
        .post(SUPPLIERS_API_URL, payload)
        .then((res) => {
          const d = res?.data;
          const msg = d?.message || d?.msg || "Supplier created";
          const saved = d?.supplier ||
            d || {
              id: Date.now(),
              company_name: form.companyName,
              email: form.email,
              phone: form.phone,
            };
          toast.success(msg);
          if (typeof onSaved === "function") onSaved(saved, "create");
          if (typeof onClose === "function") onClose();
          setForm(initial);
          setTouched({});
        })
        .catch((err) => {
          const r = err?.response?.data;
          const msg = r?.message || r?.msg || err.message || "Failed to create supplier";
          toast.error(msg);
          if (typeof onSaved === "function") onSaved(null);
        })
        .finally(() => setLoader(false));
    }
  }

  function handleCancel() {
    if (typeof onClose === "function") onClose();
  }

  if (!isActive) {
    return <></>;
  }

  return (
    <OverlayModal isActive={isActive} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <div>
        <div className={`mb-3 ${styles.header}`}>
          <div id="supplier-title" className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <Building2 className={styles.icon} />
            {isView ? "Supplier Details" : isEdit ? "Edit Supplier" : "Add New Supplier"}
          </div>
          <div className={styles.description}>
            {isView || isEdit ? editing?.company_name || "" : "Enter supplier details to add them to your system"}
          </div>
        </div>

        <ThemeLoader show={loader} fixed />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label htmlFor="companyName" className={styles.label}>
                Company Name *
              </label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter company name"
                className="form-control"
                aria-invalid={!!(touched.companyName && errors.companyName)}
                disabled={isView}
              />
              {touched.companyName && errors.companyName && <div className={styles.error}>{errors.companyName}</div>}
            </div>

            <div className={styles.field}>
              <label htmlFor="supplierType" className={styles.label}>
                Supplier Type *
              </label>
              <select
                id="supplierType"
                name="supplierType"
                value={form.supplierType}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-select"
                disabled={isView}
              >
                <option value="">Select type</option>
                {supplierTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {touched.supplierType && errors.supplierType && <div className={styles.error}>{errors.supplierType}</div>}
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label htmlFor="contactPerson" className={styles.label}>
                Contact Person
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter contact person name"
                className="form-control"
                disabled={isView}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter email address"
                className="form-control"
                aria-invalid={!!(touched.email && errors.email)}
                disabled={isView}
              />
              {touched.email && errors.email && <div className={styles.error}>{errors.email}</div>}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter phone number"
              className="form-control"
              aria-invalid={!!(touched.phone && errors.phone)}
              disabled={isView}
            />
            {touched.phone && errors.phone && <div className={styles.error}>{errors.phone}</div>}
          </div>

          <div className={styles.field}>
            <label htmlFor="address" className={styles.label}>
              Address
            </label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Street address"
              className="form-control"
              disabled={isView}
            />
          </div>

          <div className={styles.grid3}>
            <div className={styles.field}>
              <label htmlFor="city" className={styles.label}>
                City
              </label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="City"
                className="form-control"
                disabled={isView}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="state" className={styles.label}>
                State
              </label>
              <input
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="State"
                className="form-control"
                disabled={isView}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="postal_code" className={styles.label}>
                Zip Code
              </label>
              <input
                id="postal_code"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Zip code"
                className={`${styles.input} ${touched.postal_code && errors.postal_code ? styles.invalid : ""}`}
                aria-invalid={!!(touched.postal_code && errors.postal_code)}
                disabled={isView}
              />
              {touched.postal_code && errors.postal_code && <div className={styles.error}>{errors.postal_code}</div>}
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label htmlFor="paymentTerms" className={styles.label}>
                Payment Terms
              </label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-select"
                disabled={isView}
              >
                <option value="">Select payment terms</option>
                {paymentTerms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="taxId" className={styles.label}>
                Tax ID / EIN
              </label>
              <input
                id="taxId"
                name="taxId"
                value={form.taxId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter tax ID or EIN"
                className="form-control"
                disabled={isView}
              />
            </div>
          </div>

          <div className={styles.rowCheckbox}>
            <input
              id="is1099Vendor"
              name="is1099Vendor"
              type="checkbox"
              checked={form.is1099Vendor}
              onChange={handleChange}
              className={styles.checkbox}
              disabled={isView}
            />
            <label htmlFor="is1099Vendor" className={styles.labelCheckbox}>
              1099 Vendor (requires 1099 reporting)
            </label>
          </div>

          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Add any additional notes about this supplier"
              rows="4"
              className="form-control"
              disabled={isView}
            ></textarea>
          </div>

          <div className={styles.actions}>
            {isView ? (
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                Close
              </button>
            ) : (
              <>
                <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!isValid || loader}
                  aria-disabled={!isValid || loader}
                >
                  {isEdit ? (
                    " Update Supplier"
                  ) : (
                    <>
                      <Plus size={16} /> Add Supplier
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </OverlayModal>
  );
}
