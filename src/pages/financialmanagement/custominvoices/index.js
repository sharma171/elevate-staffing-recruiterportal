import React, { useEffect, useState } from "react";
import { Eye, Send, Download, FileStack } from "lucide-react";
import { axiosApi, CustomPagination, OverlayModal, ThemeLoader } from "../../../components";
import FilePreview from "../../benchcandidate/FilePreview";
import { toast } from "react-toastify";
import { useAuth } from "../../../authContext";
import SendCustomInvoiceModal from "./SendCustomInvoiceModal";
import CreateCustomInvoiceModal from "./CreateCustomInvoiceModal";

const INVOICES_API_URL = "https://custom-invoice-management-v3-305451280005.us-east1.run.app";

function base64ToBlob(base64, mimeType = "application/pdf") {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteArray], { type: mimeType });
}

function downloadPDF(base64, fileName) {
  const blob = base64ToBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatCurrency(n) {
  return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString();
}

function getStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "generated") return "ci-badge secondary";
  if (s === "sent" || s === "queued") return "ci-badge default";
  if (s === "rejected") return "ci-badge destructive";
  if (s === "deleted") return "ci-badge outline";
  return "ci-badge secondary";
}

function CustomInvoicesPage({ setLoader }) {
  const [filters, setFilters] = useState({ status: undefined });
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilePreview, setShowFilePreview] = useState("");

  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { user } = useAuth();

  const employer_email = user?.email;

  useEffect(() => {
    loadInvoices();
  }, [filters.status, offset, limit]);

  function loadInvoices() {
    setLoader(true);
    setError(null);

    const payload = {
      action: "list_custom_invoices",
      employer_email: employer_email,
      limit,
      offset,
      ...(filters.status ? { status_filter: filters.status } : {}),
    };

    axiosApi
      .post(INVOICES_API_URL, payload)
      .then((res) => {
        const data = res.data || res;
        const list = data.invoices || [];
        setInvoices(list);
        setTotalRecords(data.total_count || list.length || 0);
      })
      .catch(() => {
        setError("Failed to load invoices");
        setInvoices([]);
        setTotalRecords(0);
      })
      .finally(() => setLoader(false));
  }

  function handleView(inv) {
    setLoader(true);

    axiosApi
      .post(INVOICES_API_URL, {
        action: "get_custom_invoice",
        employer_email: employer_email,
        invoice_id: inv.invoice_id,
      })
      .then((res) => {
        const data = res.data || res;
        setShowFilePreview(data);
      })
      .catch(() => toast.error("Failed to fetch invoice"))
      .finally(() => setLoader(false));
  }

  function handleSend(inv) {
    setSelectedInvoice(inv);
    setSendModalOpen(true);
  }

  function handleDownload(inv) {
    setLoader(true);

    axiosApi
      .post(INVOICES_API_URL, {
        action: "get_custom_invoice",
        employer_email: employer_email,
        invoice_id: inv.invoice_id,
      })
      .then((res) => {
        const data = res.data || res;
        const pdf = data.pdf_preview || data.pdf || data;
        if (pdf && pdf.base64_content) {
          downloadPDF(pdf.base64_content, pdf.file_name || `invoice_${inv.invoice_number}.pdf`);
        } else {
          alert("PDF not available");
        }
      })
      .catch(() => alert("Failed to download"))
      .finally(() => setLoader(false));
  }

  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <style>{`
        .ci-badge { padding:3px 8px; border-radius:20px; font-size:12px; }
        .ci-badge.secondary { background:#eef2ff; color:#3730a3; }
        .ci-badge.default { background:#e6edf0; color:#0f172a; }
        .ci-badge.destructive { background:#fee2e2; color:#991b1b; }
        .ci-badge.outline { border:1px solid #d1d5db; color:#374151; }
        .ci-empty { text-align:center; padding:2rem; color:#6b7280; }
        .ci-table th { font-weight:600; }
        .btn-ghost { border:0; background:transparent; padding:4px; }
        .create-btn { background:#7c3bed; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; margin-left:8px; }
      `}</style>

      <div className="card my-3 mb-4" style={{ borderColor: "#e6eef8" }}>
        <div className="p-3 d-flex align-items-center justify-content-between">
          <select
            className="form-select searchInputGlobal"
            style={{ maxWidth: "300px" }}
            value={filters.status || "all"}
            onChange={(e) => {
              setFilters({ status: e.target.value === "all" ? undefined : e.target.value });
              setOffset(0);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Generated">Generated</option>
            <option value="Sent">Sent</option>
            <option value="Queued">Queued</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="themeButton themeButtonHover rounded p-2 px-3" onClick={() => setCreateModalOpen(true)}>
              Create Invoice
            </button>
          </div>
        </div>
        <div className="small text-muted px-3 pb-3">
          Showing {invoices?.length || 0} of {totalRecords || 0} Custom Invoices
        </div>
      </div>

      <div className="card" style={{ borderColor: "#e6eef8" }}>
        {error ? (
          <div className="ci-empty">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="ci-empty">No invoices found</div>
        ) : (
          <div className="table-responsive">
            <table className={`table table-hover`}>
              <thead className="table-light">
                <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Invoice #
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Vendor
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Bill To
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Amount
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Status
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Invoice Date
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold">
                    Due Date
                  </th>
                  <th style={{ background: "#f9f9f9" }} className="px-2 py-3 nowrap fw-bold text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((inv, index) => {
                  let isSent = String(inv.status).toLowerCase() == "sent";

                  return (
                    <tr key={index} style={{ borderColor: "#eaeaea" }}>
                      <td className="py-3 nowrap fw-medium">{inv.invoice_number}</td>
                      <td className="py-3 nowrap">{inv.vendor_name}</td>
                      <td className="py-3 nowrap">{inv.bill_to_company}</td>
                      <td className="py-3 nowrap fw-medium">${formatCurrency(inv.total_amount)}</td>
                      <td className="py-3 nowrap fw-medium">
                        <span className={getStatusClass(inv.status)}>{inv.status}</span>
                      </td>
                      <td className="py-3 nowrap">{formatDate(inv.invoice_date)}</td>
                      <td className="py-3 nowrap">{formatDate(inv.due_date)}</td>

                      <td className="py-3 nowrap text-center">
                        <button title="View" className="btn-ghost" onClick={() => handleView(inv)}>
                          <Eye size={16} />
                        </button>

                        <button
                          title="Send"
                          disabled={isSent}
                          className="btn-ghost px-2"
                          onClick={() => !isSent && handleSend(inv)}
                        >
                          <Send size={16} />
                        </button>

                        <button title="Download" className="btn-ghost" onClick={() => handleDownload(inv)}>
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-3">
          <CustomPagination
            alltotalrecords={totalRecords}
            currentPage={currentPage}
            setCurrentPage={(page) => {
              const newOffset = (page - 1) * limit;
              setOffset(newOffset);
            }}
            rowsPerPage={limit}
            setRowsPerPage={(newLimit) => {
              const newOffset = Math.floor(offset / newLimit) * newLimit;
              setLimit(newLimit);
              setOffset(newOffset);
            }}
          />
        </div>
      </div>

      <OverlayModal isActive={showFilePreview?.pdf_preview?.base64_content} onClose={setShowFilePreview}>
        <FilePreview
          docObject={{ file_extension: "application/pdf", file_name: showFilePreview?.pdf_preview?.file_name }}
          base64File={showFilePreview?.pdf_preview?.base64_content || ""}
          setBase64File={setShowFilePreview}
          fileType="application/pdf"
          setFileType={() => {}}
        />
      </OverlayModal>

      <SendCustomInvoiceModal
        open={sendModalOpen}
        onOpenChange={(v) => {
          setSendModalOpen(v);
          if (!v) setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSuccess={() => {
          loadInvoices();
        }}
      />

      <CreateCustomInvoiceModal
        open={createModalOpen}
        onOpenChange={(v) => {
          setCreateModalOpen(v);
        }}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadInvoices();
        }}
      />
    </div>
  );
}

export default function CustomInvoices() {
  const [loader, setLoader] = useState(false);
  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="flex-column align-items-start">
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <FileStack size={25} />
          Custom Invoices
        </h3>
        <div className="text-muted">Create and manage standalone invoices with custom line items</div>
      </div>

      <CustomInvoicesPage setLoader={setLoader} />

      <ThemeLoader show={loader} />
    </div>
  );
}
