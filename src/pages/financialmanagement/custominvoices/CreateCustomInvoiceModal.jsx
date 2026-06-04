import React, { useState, useEffect } from "react";
import { axiosApi, OverlayModal, ThemeLoader } from "../../../components";
import { toast } from "react-toastify";
import styles from "./CreateCustomInvoiceModal.module.css";
import { Plus, Trash2, MoveUp, MoveDown, Loader2, Search } from "lucide-react";
import { useAuth } from "../../../authContext";
import CreateVendorForm from "./CreateVendorForm";
import { formatUSPhone } from "../../../helpers/StrHelpers";

const VENDOR_MANAGEMENT_API_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app";
const CUSTOM_INVOICE_API_URL = "https://custom-invoice-management-v3-305451280005.us-east1.run.app";
const ZIP_LOOKUP_URL = "https://retrieve-location-details-v3-305451280005.us-east1.run.app";

function formatDateForAPI(date) {
  return date.toISOString().split("T")[0];
}

function calculateLineItemAmount(qty, price) {
  const q = Number(qty) || 0;
  const p = Number(price) || 0;
  return Number((q * p).toFixed(2));
}

function calculateInvoiceTotals(lineItems, taxRate = 0) {
  const subtotal = lineItems.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = subtotal + taxAmount;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export default function CreateCustomInvoiceModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth();
  const employerEmail = user?.email;

  const [visible, setVisible] = useState(Boolean(open));
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorForm, setShowVendorForm] = useState(false);

  const [vendorDetails, setVendorDetails] = useState({
    company_name: "",
    primary_email: "",
    contact_person: "",
    phone: "",
    billing_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "USA",
    payment_terms: "Net 30",
  });
  const [vendorZipLoading, setVendorZipLoading] = useState(false);

  const [vendorId, setVendorId] = useState(null);

  const [sameAsVendor, setSameAsVendor] = useState(false);
  const [billToInfo, setBillToInfo] = useState({
    company_name: "",
    contact_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "USA",
    email: "",
    phone: "",
  });
  const [billZipLoading, setBillZipLoading] = useState(false);

  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(formatDateForAPI(new Date()));
  const [customPaymentTerms, setCustomPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    setVisible(Boolean(open));
    if (open) {
      if (employerEmail) loadVendors();
      else setVendors([]);
    }
  }, [open, employerEmail]);

  useEffect(() => {
    if (!visible) resetForm();
  }, [visible]);

  const resetForm = () => {
    setStep(1);
    setLoading(false);
    setVendors([]);
    setLoadingVendors(false);
    setVendorSearchQuery("");
    setSelectedVendor(null);
    setShowVendorForm(false);
    setVendorDetails({
      company_name: "",
      primary_email: "",
      contact_person: "",
      phone: "",
      billing_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      payment_terms: "Net 30",
    });
    setVendorId(null);
    setSameAsVendor(false);
    setBillToInfo({
      company_name: "",
      contact_name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      email: "",
      phone: "",
    });
    setLineItems([{ description: "", quantity: 1, unit_price: 0, amount: 0 }]);
    setTaxRate(0);
    setInvoiceDate(formatDateForAPI(new Date()));
    setCustomPaymentTerms("");
    setNotes("");
    setCustomNotes("");
    onOpenChange?.(false);
  };

  const loadVendors = () => {
    if (!employerEmail) return;
    setLoadingVendors(true);
    const body = {
      action: "get_all_vendors",
      employer_email: employerEmail,
      include_inactive: false,
    };
    axiosApi
      .post(VENDOR_MANAGEMENT_API_URL, body)
      .then((r) => r?.data ?? r)
      .then((res) => {
        const v = res?.vendors ? Object.values(res.vendors) : [];
        setVendors(Array.isArray(v) ? v : []);
      })
      .catch(() => {
        toast.error("Failed to load vendors");
        setVendors([]);
      })
      .finally(() => setLoadingVendors(false));
  };

  const handleVendorSelect = (v) => {
    setSelectedVendor(v);
    setVendorId(v.vendor_id || null);
    setShowVendorForm(false);
    setVendorDetails({
      company_name: v.company_name || "",
      primary_email: v.primary_email || "",
      contact_person: v.contact_person || "",
      phone: v.phone || "",
      billing_address: v.billing_address || "",
      city: v.city || "",
      state: v.state || "",
      zip_code: v.zip_code || "",
      country: v.country || "USA",
      payment_terms: v.payment_terms || "Net 30",
    });
  };

  const handleCreateNewVendorClick = () => {
    setSelectedVendor(null);
    setVendorId(null);
    setShowVendorForm(true);
  };

  const handleCancelCreateVendor = () => {
    setShowVendorForm(false);
    setVendorDetails({
      company_name: "",
      primary_email: "",
      contact_person: "",
      phone: "",
      billing_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      payment_terms: "Net 30",
    });
  };

  const handleVendorCreated = (createdVendor) => {
    loadVendors();
    if (createdVendor && createdVendor.vendor_id) {
      setSelectedVendor(createdVendor);
      setVendorId(createdVendor.vendor_id);
      setVendorDetails({
        company_name: createdVendor.company_name || "",
        primary_email: createdVendor.primary_email || "",
        contact_person: createdVendor.contact_person || "",
        phone: createdVendor.phone || "",
        billing_address: createdVendor.billing_address || "",
        city: createdVendor.city || "",
        state: createdVendor.state || "",
        zip_code: createdVendor.zip_code || "",
        country: createdVendor.country || "USA",
        payment_terms: createdVendor.payment_terms || "Net 30",
      });
      setShowVendorForm(false);
      toast.success("Vendor created and selected");
    } else {
      setShowVendorForm(false);
      toast.success("Vendor created");
    }
  };

  const handleAddLineItem = () =>
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, amount: calculateLineItemAmount(1, 0) },
    ]);

  const handleRemoveLineItem = (i) =>
    setLineItems(lineItems.length > 1 ? lineItems.filter((_, idx) => idx !== i) : lineItems);

  const handleMoveLineItem = (index, dir) => {
    const arr = [...lineItems];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setLineItems(arr);
  };

  const handleLineItemChange = (index, field, rawValue) => {
    const arr = [...lineItems];
    if (field === "quantity") {
      const v = rawValue === "" ? "" : parseInt(rawValue, 10);
      arr[index] = { ...arr[index], quantity: v };
      const qty = Number(v) || 0;
      const price = Number(arr[index].unit_price) || 0;
      arr[index].amount = calculateLineItemAmount(qty, price);
    } else if (field === "unit_price") {
      const v = rawValue === "" ? "" : parseFloat(rawValue);
      arr[index] = { ...arr[index], unit_price: v };
      const qty = Number(arr[index].quantity) || 0;
      const price = Number(v) || 0;
      arr[index].amount = calculateLineItemAmount(qty, price);
    } else if (field === "amount") {
      const v = rawValue === "" ? "" : parseFloat(rawValue);
      arr[index] = { ...arr[index], amount: Number(v) || 0 };
    } else {
      arr[index] = { ...arr[index], [field]: rawValue };
    }
    setLineItems(arr);
  };

  const handleSameAsVendorToggle = (checked) => {
    setSameAsVendor(checked);
    if (checked) {
      setBillToInfo({
        company_name: vendorDetails.company_name || "",
        contact_name: vendorDetails.contact_person || "",
        address: vendorDetails.billing_address || "",
        city: vendorDetails.city || "",
        state: vendorDetails.state || "",
        zip_code: vendorDetails.zip_code || "",
        country: vendorDetails.country || "USA",
        email: vendorDetails.primary_email || "",
        phone: vendorDetails.phone || "",
      });
    } else {
      setBillToInfo({
        company_name: "",
        contact_name: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "USA",
        email: "",
        phone: "",
      });
    }
  };

  const validateLineItems = () => {
    if (!lineItems || lineItems.length === 0) return { valid: false, error: "At least one line item required" };
    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (!it.description || !it.description.toString().trim())
        return { valid: false, error: `Line item ${i + 1} description is required` };
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unit_price) || 0;
      const amt = Number(it.amount) || 0;
      const hasQtyPrice = qty > 0 && price > 0;
      const hasAmount = amt > 0;
      if (!hasQtyPrice && !hasAmount)
        return { valid: false, error: `Line item ${i + 1} must have quantity+unit price or amount` };
    }
    return { valid: true };
  };

  const handleSubmit = () => {
    if (!employerEmail) {
      toast.error("Employer email not found");
      return;
    }

    const validation = validateLineItems();
    if (!validation.valid) {
      toast.error(validation.error);
      setStep(3);
      return;
    }

    if (!vendorId && (!vendorDetails.company_name || !vendorDetails.primary_email)) {
      toast.error("Vendor company name and primary email are required");
      setStep(1);
      return;
    }

    if (!billToInfo.company_name) {
      toast.error("Bill To company name is required");
      setStep(2);
      return;
    }

    setLoading(true);
    const body = {
      action: "create_custom_invoice",
      employer_email: employerEmail,
      bill_to_info: billToInfo,
      line_items: lineItems.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
        amount: Number(it.amount) || 0,
      })),
      invoice_details: {
        invoice_date: invoiceDate,
        custom_payment_terms: customPaymentTerms || undefined,
        tax_rate: Number(taxRate) || 0,
        notes: notes || undefined,
        custom_notes: customNotes || undefined,
      },
      vendor_id: vendorId || undefined,
      vendor_details: vendorId ? undefined : vendorDetails,
    };

    axiosApi
      .post(CUSTOM_INVOICE_API_URL, body)
      .then((r) => r?.data ?? r)
      .then((res) => {
        if (res?.status === "success") {
          toast.success("Invoice created: " + (res?.invoice_details?.invoice_number || ""));
          onSuccess?.();
          resetForm();
        } else {
          toast.error(res?.message || "Failed to create invoice");
        }
      })
      .catch((err) => {
        const message = err?.response?.data?.message || err?.message || "Please try again";
        toast.error("Failed to create invoice: " + message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    if (vendorDetails.zip_code && vendorDetails.zip_code.toString().length === 5) {
      setVendorZipLoading(true);
      fetch(ZIP_LOOKUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: vendorDetails.zip_code }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (ignore) return;
          const city = resData?.data?.city;
          const state = resData?.data?.state;
          const country = resData?.data?.country;
          setVendorDetails((prev) => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
          }));
          if (sameAsVendor) {
            setBillToInfo((prev) => ({
              ...prev,
              city: city || prev.city,
              state: state || prev.state,
              country: country || prev.country,
              zip_code: vendorDetails.zip_code,
            }));
          }
        })
        .catch(() => {
          toast.error("Failed to auto-fill vendor location from ZIP");
        })
        .finally(() => setVendorZipLoading(false));
    }
    return () => {
      ignore = true;
      setVendorZipLoading(false);
    };
  }, [vendorDetails.zip_code, sameAsVendor]);

  useEffect(() => {
    let ignore = false;
    if (billToInfo.zip_code && billToInfo.zip_code.toString().length === 5) {
      setBillZipLoading(true);
      fetch(ZIP_LOOKUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: billToInfo.zip_code }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (ignore) return;
          const city = resData?.data?.city;
          const state = resData?.data?.state;
          const country = resData?.data?.country;
          setBillToInfo((prev) => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
          }));
        })
        .catch(() => {
          toast.error("Failed to auto-fill billing location from ZIP");
        })
        .finally(() => setBillZipLoading(false));
    }
    return () => {
      ignore = true;
      setBillZipLoading(false);
    };
  }, [billToInfo.zip_code]);

  const filteredVendors = (vendors || []).filter(
    (v) =>
      v.company_name?.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
      (v.primary_email && v.primary_email.toLowerCase().includes(vendorSearchQuery.toLowerCase()))
  );

  if (!visible) return <></>;

  return (
    <OverlayModal
      isActive={visible}
      onClose={() => {
        setVisible(false);
        onOpenChange?.(false);
      }}
      modalStyle={{ background: "#fff" }}
    >
      <div>
        <div className={styles.header}>
          <h3>Create Custom Invoice - Step {step} of 4</h3>
        </div>

        <div className={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`${styles.progressBar} ${s <= step ? styles.active : ""}`}></div>
          ))}
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <div className={styles.section}>
              {!showVendorForm && !selectedVendor && (
                <div>
                  <label className={styles.label}>Select Vendor *</label>
                  <div className={styles.searchRow}>
                    <input
                      className={styles.input}
                      placeholder="Search vendors..."
                      value={vendorSearchQuery}
                      onChange={(e) => {
                        setVendorSearchQuery(e.target.value);
                      }}
                    />

                    <button
                      type="button"
                      className="themeButton themeButtonHover py-2 px-3 rounded"
                      onClick={handleCreateNewVendorClick}
                    >
                      <Plus /> Create New Vendor
                    </button>
                  </div>

                  <div className={styles.vendorList}>
                    {loadingVendors ? (
                      <div className={styles.center}>
                        <Loader2 className={styles.spin} /> Loading...
                      </div>
                    ) : filteredVendors.length === 0 ? (
                      <div className={styles.center}>
                        <div className="my-2">No vendors found</div>
                        <button type="button" className={styles.addBtn} onClick={handleCreateNewVendorClick}>
                          <Plus /> Create New Vendor
                        </button>
                      </div>
                    ) : (
                      filteredVendors.map((v) => (
                        <button
                          key={v.vendor_id || v.primary_email || v.company_name}
                          type="button"
                          className={styles.vendorItem}
                          onClick={() => handleVendorSelect(v)}
                        >
                          <div>
                            <div className={styles.vendorName}>{v.company_name}</div>
                            <div className={styles.vendorMeta}>
                              {v.primary_email} • {v.payment_terms || "Net 30"}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedVendor && !showVendorForm && (
                <div className={styles.selectedVendor}>
                  <div>
                    <div className={styles.vendorName}>{selectedVendor.company_name}</div>
                    <div className={styles.vendorMeta}>{selectedVendor.primary_email}</div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => {
                        setSelectedVendor(null);
                        setVendorId(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <CreateVendorForm
                mode="create"
                onClose={() => {
                  handleCancelCreateVendor();
                }}
                onCreated={(created) => {
                  handleVendorCreated(created);
                }}
                isActive={showVendorForm}
              />
            </div>
          )}

          {step === 2 && (
            <div className={styles.section}>
              <div className={`mb-3 ${styles.row}`}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={sameAsVendor}
                    onChange={(e) => handleSameAsVendorToggle(e.target.checked)}
                  />
                  Same as Vendor
                </label>
              </div>

              <div className="colsResponsiveLayout2">
                <div>
                  <label className={styles.label}>Company Name *</label>
                  <input
                    className={styles.input}
                    placeholder="Company Name"
                    value={billToInfo.company_name}
                    onChange={(e) => setBillToInfo({ ...billToInfo, company_name: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div>
                  <label className={styles.label}>Contact Name</label>
                  <input
                    className={styles.input}
                    placeholder="Contact Name"
                    value={billToInfo.contact_name}
                    onChange={(e) => setBillToInfo({ ...billToInfo, contact_name: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div className={styles.fullWidth}>
                  <label className={styles.label}>Address</label>
                  <input
                    className={styles.input}
                    placeholder="Address"
                    value={billToInfo.address}
                    onChange={(e) => setBillToInfo({ ...billToInfo, address: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div>
                  <label className={styles.label}>City</label>
                  <input
                    className={styles.input}
                    placeholder="City"
                    value={billToInfo.city}
                    onChange={(e) => setBillToInfo({ ...billToInfo, city: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div>
                  <label className={styles.label}>State</label>
                  <input
                    className={styles.input}
                    placeholder="State"
                    value={billToInfo.state}
                    onChange={(e) => setBillToInfo({ ...billToInfo, state: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div>
                  <label className={styles.label}>ZIP</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      className={styles.input}
                      placeholder="ZIP"
                      value={billToInfo.zip_code}
                      onChange={(e) => setBillToInfo({ ...billToInfo, zip_code: e.target.value })}
                      disabled={sameAsVendor}
                    />
                    {billZipLoading && <Loader2 className={styles.smallSpinner} />}
                  </div>
                </div>

                <div>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    placeholder="Email"
                    type="email"
                    value={billToInfo.email}
                    onChange={(e) => setBillToInfo({ ...billToInfo, email: e.target.value })}
                    disabled={sameAsVendor}
                  />
                </div>

                <div>
                  <label className={styles.label}>Phone</label>
                  <input
                    className={styles.input}
                    placeholder="Phone"
                    value={billToInfo.phone}
                    onChange={(e) => {
                      let val = formatUSPhone(e.target.value);

                      setBillToInfo({ ...billToInfo, phone: val });
                    }}
                    disabled={sameAsVendor}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.section}>
              {lineItems.map((item, idx) => (
                <div key={idx} className={styles.lineItem}>
                  <div className={styles.lineItemHeader}>
                    <div className="fw-semibold">Item {idx + 1}</div>
                    <div className={styles.lineItemActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleMoveLineItem(idx, "up")}
                        disabled={idx === 0}
                      >
                        <MoveUp size={18} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleMoveLineItem(idx, "down")}
                        disabled={idx === lineItems.length - 1}
                      >
                        <MoveDown size={18} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <label className={styles.label}>Description *</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                  />

                  <div className={styles.rowGrid}>
                    <div>
                      <label className={styles.label}>Qty</label>
                      <input
                        className={styles.inputSmall}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={styles.label}>Unit Price</label>
                      <input
                        className={styles.inputSmall}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={styles.label}>Amount</label>
                      <input
                        className={styles.inputSmall}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => handleLineItemChange(idx, "amount", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="w-100 themeButtonoutline themeButtonHover rounded py-2"
                onClick={handleAddLineItem}
              >
                <Plus size={18} /> Add Line Item
              </button>

              <div className={styles.totals}>
                <div className={styles.totalsRow}>
                  <span>Subtotal:</span>
                  <span className="fw-bold">${calculateInvoiceTotals(lineItems, taxRate).subtotal.toFixed(2)}</span>
                </div>
                <div className={`d-block ${styles.totalsRow}`}>
                  <span className="mb-1">Tax Rate (%)</span>
                  <input
                    className={styles.inputSmall}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Tax %"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </div>
                <div className={styles.totalsRow}>
                  <span>Tax Amount:</span>
                  <span>${calculateInvoiceTotals(lineItems, taxRate).taxAmount.toFixed(2)}</span>
                </div>
                <div className={styles.totalsRowBold}>
                  <span>Total:</span>
                  <span>${calculateInvoiceTotals(lineItems, taxRate).total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.section}>
              <label className={styles.label}>Invoice Date</label>
              <input
                className={styles.input}
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />

              <label className={`mt-3 ${styles.label}`}>Custom Payment Terms (Optional)</label>
              <input
                className={styles.input}
                placeholder="Custom payment terms"
                value={customPaymentTerms}
                onChange={(e) => setCustomPaymentTerms(e.target.value)}
              />

              <label className={`mt-3 ${styles.label}`}>Payment Terms / Notes</label>
              <textarea
                className={styles.textarea}
                placeholder="Payment terms or notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <label className={`mt-3 ${styles.label}`}>Additional Notes</label>
              <textarea
                className={styles.textarea}
                placeholder="Additional notes"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />

              <div className={styles.summary}>
                <div>
                  <strong>Vendor:</strong>{" "}
                  {vendorDetails.company_name || (selectedVendor && selectedVendor.company_name) || "-"}
                </div>
                <div>
                  <strong>Bill To:</strong> {billToInfo.company_name || "-"}
                </div>
                <div>
                  <strong>Line Items:</strong> {lineItems.length}
                </div>
                <div>
                  <strong>Subtotal:</strong> ${calculateInvoiceTotals(lineItems, taxRate).subtotal.toFixed(2)}
                </div>
                <div>
                  <strong>Tax ({taxRate}%):</strong> ${calculateInvoiceTotals(lineItems, taxRate).taxAmount.toFixed(2)}
                </div>
                <div className={styles.summaryTotal}>
                  <strong>Total Amount:</strong> ${calculateInvoiceTotals(lineItems, taxRate).total.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div>
            <button
              className={styles.outlineBtn}
              onClick={() => {
                setStep(Math.max(1, step - 1));
              }}
              disabled={step === 1 || loading}
            >
              Previous
            </button>
          </div>

          <div className={styles.actions}>
            {step < 4 ? (
              <button
                className="themeButton themeButtonHover rounded py-2"
                onClick={() => {
                  if (step === 1) {
                    if (!selectedVendor && !showVendorForm) {
                      toast.error("Please select a vendor or create a new one");
                      return;
                    }
                    if (showVendorForm && (!vendorDetails.company_name || !vendorDetails.primary_email)) {
                      toast.error("Vendor company name and email required");
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button className="themeButton themeButtonHover rounded py-2" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className={styles.spin} /> Creating...
                  </>
                ) : (
                  "Create Invoice"
                )}
              </button>
            )}
            <button
              className={styles.ghostBtn}
              onClick={() => {
                setVisible(false);
                onOpenChange?.(false);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

        <ThemeLoader show={loading} />
      </div>
    </OverlayModal>
  );
}
