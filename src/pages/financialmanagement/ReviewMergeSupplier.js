import React, { useEffect, useState, useCallback } from "react";
import { Building2 } from "lucide-react";
import styles from "./ReviewMergeSupplier.module.css";
import OverlayModal from "../../components/OverlayModal";
import { axiosApi, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import { formatUSPhone } from "../../helpers/StrHelpers";

const SUPPLIERS_API_URL = "https://manage-supplier-invoices-api-v3-305451280005.us-east1.run.app";

const MERGESUPPLIERS_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app/";

const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Due on Receipt", "COD (Cash on Delivery)"];

const INITIAL_FORM = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  taxId: "",
  paymentTerms: "Net 30",
  supplierType: "Vendor",
};

function validateForm(values) {
  const errs = {};
  if (!values.companyName || !values.companyName.trim()) errs.companyName = "Company name is required";

  if (!values.email || !values.email.trim()) {
    errs.email = "Email is required";
  } else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(values.email)) errs.email = "Invalid email";
  }

  if (values.phone) {
    const digits = values.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) errs.phone = "Invalid phone number";
  }

  if (values.zipCode) {
    if (!/^\d{3,10}$/.test(values.zipCode)) errs.zipCode = "Invalid zip code";
  }

  return errs;
}

function DetailsForm({ form, setForm, touched, setTouched, errors, isView, loader, onCancel, onSubmit }) {
  function handleChange(e) {
    const { name, value } = e.target;

    if (name == "phone") {
      let newVal = formatUSPhone(value);
      return setForm((s) => ({ ...s, [name]: newVal }));
    }

    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.section}>
        <h3 className="h6 my-1">Company Information</h3>
        <div className="card mb-1 p-3" style={{ borderColor: "#e6eef8" }}>
          <div className={styles.field}>
            <label className={styles.label}>
              Company Name <span className={styles.required}>*</span>
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter company name"
              className={`${styles.input} ${touched.companyName && errors.companyName ? styles.invalid : ""}`}
              disabled={isView}
            />
            {touched.companyName && errors.companyName && <div className={styles.error}>{errors.companyName}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Email Address <span className={styles.required}>*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="billing@supplier.com"
              className={`${styles.input} ${touched.email && errors.email ? styles.invalid : ""}`}
              disabled={isView}
            />
            {touched.email && errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+1 (555) 123-4567"
              className={`${styles.input} ${touched.phone && errors.phone ? styles.invalid : ""}`}
              disabled={isView}
            />
            {touched.phone && errors.phone && <div className={styles.error}>{errors.phone}</div>}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className="h6 my-1">Address Information</h3>
        <div className="card mb-1 p-3" style={{ borderColor: "#e6eef8" }}>
          <div className={styles.field}>
            <label className={styles.label}>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              placeholder="1234 Main Street"
              className={styles.textarea}
              disabled={isView}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={styles.input}
                disabled={isView}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={2}
                className={styles.input}
                disabled={isView}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Zip Code</label>
            <input
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${touched.zipCode && errors.zipCode ? styles.invalid : ""}`}
              disabled={isView}
            />
            {touched.zipCode && errors.zipCode && <div className={styles.error}>{errors.zipCode}</div>}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className="h6 my-1">Additional Information</h3>
        <div className="card mb-1 p-3" style={{ borderColor: "#e6eef8" }}>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Tax ID / EIN</label>
              <input
                name="taxId"
                value={form.taxId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="XX-XXXXXXX"
                className={styles.input}
                disabled={isView}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Payment Terms</label>
              <select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                className={`form-select`}
                style={{ minHeight: "40px" }}
                disabled={isView}
              >
                {PAYMENT_TERMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {isView ? (
          <button className={styles.cancelButton} onClick={onCancel} type="button">
            Close
          </button>
        ) : (
          <>
            <button className={styles.cancelButton} onClick={onCancel} type="button">
              Cancel
            </button>
            <button className={styles.primaryButton} disabled={loader || Object.keys(errors).length > 0} type="submit">
              Save Supplier
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function MergePane({
  searchTerm,
  searchResults,
  searchLoading,
  selectedMergeSupplier,
  setSelectedMergeSupplier,
  onCancel,
  onMerge,
  onSearch,
}) {
  return (
    <div className={styles.mergePane}>
      <div className={`mt-3 ${styles.field}`}>
        <label className={styles.label}>Search Existing Suppliers</label>
        <div className={styles.searchWrap}>
          <input
            placeholder="Type at least 2 characters..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className={`form-control ${styles.inputWithIcon}`}
          />
        </div>

        <div className={`mt-2 ${styles.merge_wrapper}`}>
          {searchResults.length ? <p className={styles.merge_heading}>Select a supplier to merge with:</p> : <></>}
          <div className={styles.merge_scroll}>
            {searchLoading ? (
              <div className={styles.merge_loading}>Searching...</div>
            ) : searchResults.length === 0 && searchTerm.length >= 2 ? (
              <div className={styles.merge_empty}>No suppliers found</div>
            ) : (
              <div className={styles.merge_list}>
                {searchResults.map((s, i) => (
                  <div
                    key={i}
                    className={`${styles.merge_item} ${
                      selectedMergeSupplier?.id === s.id ? styles.merge_item_selected : ""
                    }`}
                    onClick={() => setSelectedMergeSupplier(s)}
                  >
                    <div className={styles.merge_left}>
                      <span
                        className={`${styles.merge_radio} ${
                          selectedMergeSupplier?.id === s.id ? styles.merge_radio_selected : ""
                        }`}
                      />
                      <div>
                        <div className={styles.merge_row}>
                          <label className={styles.merge_company}>{s.company_name}</label>
                          <span className={styles.merge_badge}>
                            {s.status || (s.is_active ? "Active" : "Inactive")}
                          </span>
                        </div>

                        <div className={styles.merge_meta}>
                          <div className={styles.merge_code}>{s.supplier_code}</div>
                          <div className={styles.merge_email}>{s.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.merge_right}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel} type="button">
            Cancel
          </button>
          <button className={styles.primaryButton} onClick={onMerge} disabled={!selectedMergeSupplier} type="button">
            Merge Supplier
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewMergeSupplier({ isActive, onClose, editing = null, mode = "create", onSaved }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [loader, setLoader] = useState(false);
  const [mergeTab, setMergeTab] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMergeSupplier, setSelectedMergeSupplier] = useState(null);

  const { user } = useAuth();
  const user_email = user?.email;

  useEffect(() => {
    setSelectedMergeSupplier(null);
    setSearchTerm("");
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    setTouched({});

    if ((isEdit || isView) && editing) {
      const get = (e, ...keys) => keys.reduce((a, k) => a || e[k], undefined);

      setForm({
        companyName: get(editing, "company_name", "companyName", "supplier_name") || "",
        email: get(editing, "email", "supplier_email") || "",
        phone: get(editing, "phone", "supplier_phone") || "",
        address: get(editing, "location", "address", "supplier_address") || "",
        city: get(editing, "city", "supplier_city") || "",
        state: get(editing, "state", "supplier_state") || "",
        zipCode: get(editing, "zip_code", "supplier_postal_code") || "",
        taxId: get(editing, "tax_id", "taxId", "supplier_tax_id") || "",
        paymentTerms: get(editing, "payment_terms", "paymentTerms", "supplier_payment_terms") || "Net 30",
        supplierType: get(editing, "supplier_type", "supplierType") || "Vendor",
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setMergeTab(false);
  }, [isActive, editing, isEdit, isView]);

  const errors = validateForm(form);
  const isValid = Object.keys(errors).length === 0 && form.companyName.trim() && form.email.trim();

  const submitHandler = useCallback(
    (e) => {
      e && e.preventDefault();
      if (isView) return;

      setTouched({
        companyName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        taxId: true,
        paymentTerms: true,
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
          email: form.email,
          phone: form.phone,
          address_line1: form.address,
          city: form.city,
          state: form.state,
          zip_code: form.zipCode,
          payment_terms: form.paymentTerms,
          tax_id: form.taxId,
        };

        axiosApi
          .post(SUPPLIERS_API_URL, payload)
          .then((res) => {
            const d = res?.data;
            const msg = d?.message || d?.msg || "Supplier updated";

            const saved = d?.supplier || {
              id: supplierId,
              company_name: form.companyName,
              email: form.email,
              phone: form.phone,
            };

            toast.success(msg);
            if (onSaved) onSaved(saved, "update");
          })
          .catch((err) => {
            const r = err?.response?.data;
            const msg = r?.message || r?.msg || err.message;
            toast.error(msg);
          })
          .finally(() => setLoader(false));
      } else {
        const payload = {
          user_email: user_email,
          action: "create_supplier",
          company_name: form.companyName,
          supplier_type: form.supplierType,
          email: form.email,
          phone: form.phone,
          address_line1: form.address,
          city: form.city,
          state: form.state,
          zip_code: form.zipCode,
          payment_terms: form.paymentTerms,
          tax_id: form.taxId,
        };

        axiosApi
          .post(SUPPLIERS_API_URL, payload)
          .then((res) => {
            const d = res?.data;
            const msg = d?.message || d?.msg || "Supplier created";

            const saved = d?.supplier || {
              id: Date.now(),
              company_name: form.companyName,
              email: form.email,
              phone: form.phone,
            };

            toast.success(msg);
            if (onSaved) onSaved(saved, "create");
          })
          .catch((err) => {
            const r = err?.response?.data;
            const msg = r?.message || r?.msg || err.message;
            toast.error(msg);
          })
          .finally(() => setLoader(false));
      }
    },
    [form, isEdit, editing, isView, isValid, onSaved]
  );

  const handleSearch = useCallback((val) => {
    setSearchTerm(val);
    setSearchResults([]);
    setSelectedMergeSupplier(null);

    if (!val || val.length < 2) return;

    setSearchLoading(true);

    const payload = {
      user_email: user_email,
      action: "list_suppliers",
      search: val,
      limit: 50,
      offset: 0,
      is_active: true,
    };

    axiosApi
      .post(SUPPLIERS_API_URL, payload)
      .then((res) => {
        const d = res?.data;
        const msg = d?.message || d?.msg;
        const list = d?.suppliers || [];

        setSearchResults(list);
        if (msg) toast.info(msg);
      })
      .catch((err) => {
        const r = err?.response?.data;
        const msg = r?.message || r?.msg || err.message;
        toast.error(msg);
        setSearchResults([]);
      })
      .finally(() => setSearchLoading(false));
  }, []);

  const handleMerge = useCallback(() => {
    if (!selectedMergeSupplier) {
      toast.error("Select a supplier to merge with");
      return;
    }

    setLoader(true);

    const payload = {
      user_email: user_email,
      action: "reassign_invoice_supplier",
      invoice_id: editing?.invoice_id || editing?.id,
      new_supplier_id: selectedMergeSupplier.id,
    };

    axiosApi
      .post(MERGESUPPLIERS_API_URL, payload)
      .then((res) => {
        const d = res?.data;
        const msg = d?.message || d?.msg || "Merge request submitted";

        toast.success(msg);
        onSaved?.();
      })
      .catch((err) => {
        const r = err?.response?.data;
        const msg = r?.error || r?.msg || err.message;
        toast.error(msg);
        onSaved?.();
      })
      .finally(() => setLoader(false));
  }, [selectedMergeSupplier, editing, onSaved]);

  if (!isActive) return <></>;

  return (
    <OverlayModal isActive={isActive} onClose={onClose} modalStyle={{ background: "#fff" }}>
      <div>
        <div className="mb-3">
          <div className="h4 fw-bold gap-2 d-flex align-items-center">
            <Building2 size={18} />
            {isView ? "Supplier Details" : isEdit ? "Edit Supplier" : "Add New Supplier"}
          </div>

          <div className={styles.description}>
            {isView || isEdit ? editing?.company_name || "" : "Enter supplier details to add them to your system"}
          </div>
        </div>

        <ThemeLoader show={loader} fixed />

        <div className={styles.tabsWrap}>
          {isEdit && (
            <div className="tabs_container w-100">
              <button
                className={`tabs_button w-100 ${!mergeTab ? "tabs_active" : ""}`}
                onClick={() => setMergeTab(false)}
                disabled={isView}
                type="button"
              >
                Review Current
              </button>

              <button
                className={`tabs_button w-100 ${mergeTab ? "tabs_active" : ""}`}
                onClick={() => setMergeTab(true)}
                type="button"
              >
                Merge with Existing
              </button>
            </div>
          )}

          {!mergeTab || isView ? (
            <DetailsForm
              form={form}
              setForm={setForm}
              touched={touched}
              setTouched={setTouched}
              errors={errors}
              isView={isView}
              loader={loader}
              onCancel={onClose}
              onSubmit={submitHandler}
            />
          ) : (
            <MergePane
              searchTerm={searchTerm}
              searchResults={searchResults}
              searchLoading={searchLoading}
              selectedMergeSupplier={selectedMergeSupplier}
              setSelectedMergeSupplier={setSelectedMergeSupplier}
              onCancel={onClose}
              onMerge={handleMerge}
              onSearch={handleSearch}
            />
          )}
        </div>
      </div>
    </OverlayModal>
  );
}
