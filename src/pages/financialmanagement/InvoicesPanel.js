import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronDown,
  Upload,
  Eye,
  DollarSign,
  Check,
  GitMerge,
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./BillPayments.module.css";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import OverlayModal from "../../components/OverlayModal";
import { SelectPicker } from "rsuite";
import UploadInvoiceModal from "./UploadInvoice";
import ReviewMergeSupplier from "./ReviewMergeSupplier";
import { useNavigate } from "react-router-dom";
import MarkPaidInvoiceModal from "./MarkPaidInvoiceModal";
import { useAuth } from "../../authContext";
import { TiFlowMerge } from "react-icons/ti";

const INVOICES_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app";

export default function InvoicesPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const user_email = user?.email;

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    supplier_name: "",
    currentPage: 1,
    rowsPerPage: 10,
  });

  const [allData, setAllData] = useState(null);
  const [invoicesData, setInvoicesData] = useState([]);
  const [loader, setLoader] = useState(false);

  const [markOpen, setMarkOpen] = useState(false);
  const [markInvoice, setMarkInvoice] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInvoice, setSheetInvoice] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [onenUploadInvoice, setOnenUploadInvoice] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const menuClass = "selectpickerNormalitemsanalyses";
  const pickerMenuSelector = `.${menuClass}`;

  const fetchInvoices = () => {
    setLoader(true);
    const payload = {
      user_email,
      limit,
      offset,
      search: filters.search || undefined,
      status: filters.status || undefined,
      supplier_name: filters.supplier_name || undefined,
      action: "list_invoices",
    };

    axiosApi
      .post(INVOICES_API_URL, payload)
      .then((response) => {
        const res = response?.data || {};
        setAllData(res);
        setInvoicesData(res.invoices || res.data || []);
        setFilters((p) => ({ ...p, currentPage: Math.floor(offset / limit) + 1, rowsPerPage: limit }));
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Failed to fetch invoice data");
      })
      .finally(() => setLoader(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [offset, limit, filters.search, filters.status, filters.supplier_name]);

  const totalRecords = allData?.pagination?.total_count || allData?.total_count || 0;

  const vendors = useMemo(
    () =>
      Array.from(
        new Set((allData?.available_filters?.vendors || invoicesData.map((i) => i.supplier_name)).filter(Boolean))
      ),
    [allData, invoicesData]
  );

  const vendorOptions = vendors.map((v) => ({ label: v.company_name || v, value: v.company_name || v }));

  const openMark = (inv) => {
    setMarkInvoice(inv);
    setMarkOpen(true);
  };

  const openReview = (inv) => {
    setSheetInvoice(inv);
    setSheetOpen(true);
  };

  const openInvoiceRoute = (inv) => {
    const id = inv?.id || inv?.invoice_id;
    if (!id) return toast.error("Invoice id not available");
    navigate(`/dashboard/financialmanagement/supplierbills/invoice/${id}`);
  };

  const handleUpload = () => {
    if (!uploadFiles.length) {
      toast.error("Select files");
      return;
    }
    setUploading(true);

    Promise.resolve()
      .then(() => new Promise((r) => setTimeout(r, 700)))
      .then(() => {
        toast.success("Upload simulated");
        setUploadOpen(false);
      })
      .catch(() => toast.error("Upload failed"))
      .finally(() => setUploading(false));
  };

  useEffect(() => {
    const handler = (e) => {
      const menu = document.querySelector(pickerMenuSelector);
      if (!menu) return setPickerOpen(false);

      const path = e.composedPath?.() || [];
      if (!path.includes(menu)) setPickerOpen(false);
    };

    const opts = { passive: true, capture: true };
    ["scroll", "wheel", "touchmove", "pointerdown"].forEach((ev) => {
      window.addEventListener(ev, handler, opts);
    });

    return () => {
      ["scroll", "wheel", "touchmove", "pointerdown"].forEach((ev) => {
        window.removeEventListener(ev, handler, opts);
      });
    };
  }, [pickerOpen]);

  const editingData = sheetInvoice
    ? {
        id: sheetInvoice.supplier_id,
        invoice_id: sheetInvoice.id,
        supplier_id: sheetInvoice.supplier_id,
        company_name: sheetInvoice.supplier_name,
        email: sheetInvoice.supplier_email || sheetInvoice.email,
        supplier_phone: sheetInvoice.supplier_phone || sheetInvoice.phone,
      }
    : null;

  return (
    <div>
      <ThemeLoader show={loader} />

      <div className="card mb-4 pb-3" style={{ borderColor: "#e6eef8" }}>
        <div className="card-body pb-0">
          <div className="responsiveLayout">
            <input
              className="form-control searchInputGlobal"
              placeholder="Search invoice # or supplier"
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />

            <select
              className="form-select searchInputGlobal"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              <option>Extracted</option>
              <option>Approved</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>

            <SelectPicker
              className="selectpickerNormal selectpickerNormalAnalysis"
              menuClassName={`selectpickerNormalitems ${menuClass}`}
              style={{ minWidth: "99.9%" }}
              caretAs={() => <ChevronDown size={18} style={{ position: "absolute", right: 8, top: 11 }} />}
              data={[{ label: "All suppliers", value: "" }, ...vendorOptions]}
              value={filters.supplier_name}
              onChange={(v) => setFilters((p) => ({ ...p, supplier_name: v }))}
              cleanable={false}
              open={pickerOpen}
              onOpen={() => setPickerOpen(true)}
              onClose={() => setPickerOpen(false)}
            />
          </div>

          <div className="gap-2 d-flex flex-wrap justify-content-between mt-3">
            <div className="small text-muted">
              Showing {invoicesData.length} of {totalRecords} invoices
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center"
                onClick={() => {
                  setFilters({ ...filters, search: "", status: "", supplier_name: "" });
                  setOffset(0);
                }}
              >
                <Filter size={16} className="me-2" /> Clear Filters
              </button>

              <button
                onClick={() => setOnenUploadInvoice(true)}
                className="themeButton themeButtonHover rounded py-2 nowrap"
              >
                <Upload size={16} className="me-1" /> Upload Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {invoicesData.some((i) => i.status === "Processing") && (
        <div className="alert alert-info d-flex align-items-center">
          <Loader2 className="me-2 animate-spin" /> Some invoices are processing
          <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={fetchInvoices}>
            <CheckCircle2 size={14} className="me-1" /> Refresh Now
          </button>
        </div>
      )}

      <div className="card" style={{ borderColor: "#e6eef8" }}>
        <div className="table-responsive">
          <table className={`table table-hover ${styles.table}`}>
            <thead className="table-light">
              <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Invoice #
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Supplier
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Uploaded
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Invoice Date
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Due Date
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Amount
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Status
                </th>
                <th style={{ background: "#f9f9f9" }} className="nowrap fw-bold px-2 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {invoicesData.length ? (
                invoicesData.map((inv, index) => (
                  <tr key={index} style={{ borderColor: "#eaeaea" }}>
                    <td className="nowrap fw-medium py-3">{inv.invoice_number}</td>

                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="text-truncate" style={{ maxWidth: "200px" }} title={inv.supplier_name}>
                          {inv.supplier_name}
                        </div>

                        {inv.supplier_review_required && (
                          <span className="badge bg-warning text-dark d-flex align-items-center">
                            <AlertCircle size={12} className="me-1" /> Review Required
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3">{inv.created_on ? new Date(inv.created_on).toLocaleDateString() : "—"}</td>
                    <td className="py-3">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : "—"}</td>
                    <td className="py-3">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>

                    <td className="py-3">${Number(inv.total_amount || 0).toFixed(2)}</td>

                    <td className="py-3">
                      <span
                        className={`badge ${
                          inv.payment_status === "Paid"
                            ? "bg-success"
                            : inv.status === "Failed"
                            ? "bg-danger"
                            : inv.status === "Approved"
                            ? "bg-secondary"
                            : inv.status === "Processing"
                            ? "bg-info text-dark"
                            : "bg-light text-dark"
                        }`}
                      >
                        {inv.payment_status === "Paid" ? "Paid" : inv.status}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="d-flex gap-3">
                        <div className="pointer" onClick={() => openInvoiceRoute(inv)} title="View">
                          <Eye size={16} />
                        </div>

                        {inv.supplier_review_required ? (
                          <div className="pointer" title=" Review/Merge Supplier" onClick={() => openReview(inv)}>
                            <TiFlowMerge size={16} />
                          </div>
                        ) : (
                          <>
                            {inv.status === "Extracted" && (
                              <div
                                className="pointer"
                                title="Approve"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/financialmanagement/supplierbills/invoice/${
                                      inv?.id || inv?.invoice_id
                                    }/edit`
                                  )
                                }
                              >
                                <Check size={16} />
                              </div>
                            )}

                            {inv.status === "Approved" && inv.payment_status !== "Paid" && (
                              <div className="pointer" title="Pay" onClick={() => openMark(inv)}>
                                <DollarSign size={16} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No invoices returned from API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-3">
          <CustomPagination
            alltotalrecords={totalRecords}
            currentPage={Math.floor(offset / limit) + 1}
            setCurrentPage={(page) => {
              const newOffset = (page - 1) * limit;
              setOffset(newOffset);
              setFilters((p) => ({ ...p, currentPage: page }));
            }}
            rowsPerPage={limit}
            setRowsPerPage={(newLimit) => {
              const newOffset = Math.floor(offset / newLimit) * newLimit;
              setLimit(newLimit);
              setOffset(newOffset);
              setFilters((p) => ({ ...p, rowsPerPage: newLimit }));
            }}
          />
        </div>
      </div>

      <UploadInvoiceModal isActive={onenUploadInvoice} onClose={setOnenUploadInvoice} showSupplierSelect />

      <MarkPaidInvoiceModal
        isActive={markOpen}
        onClose={() => setMarkOpen(false)}
        invoice={markInvoice}
        onMarked={fetchInvoices}
      />

      <ReviewMergeSupplier
        isActive={sheetOpen}
        onClose={() => setSheetOpen(false)}
        editing={editingData}
        mode={sheetInvoice?.supplier_review_required ? "edit" : "view"}
        onSaved={() => {
          setSheetOpen(false);
          fetchInvoices();
        }}
      />

      <OverlayModal isActive={uploadOpen} onClose={() => setUploadOpen(false)}>
        <div className="card" style={{ width: 600, margin: "30px auto" }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Upload Invoice</h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setUploadOpen(false)}>
              Close
            </button>
          </div>

          <div className="card-body">
            <input
              type="file"
              multiple
              onChange={(e) => setUploadFiles([...e.target.files])}
              className="form-control mb-3"
            />

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setUploadOpen(false)} disabled={uploading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </OverlayModal>
    </div>
  );
}
