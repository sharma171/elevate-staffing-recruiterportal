import React, { useEffect, useRef, useState } from "react";
import styles from "../talentpool/css/InvoiceHistory.module.css";
import { Eye, DollarSign, Receipt, ReceiptText, Search, Filter, ChevronDown } from "lucide-react";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import FilePreview from "../benchcandidate/FilePreview";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";
import EmptyView from "../../components/EmptyView";
import PaymentHistoryModal from "../talentpool/PaymentHistoryModal";
import InvoicePayModal from "../talentpool/InvoicePayModal";
import OverlayModal from "../../components/OverlayModal";
import { SelectPicker } from "rsuite";

const DASHBOARDBASEURL = "https://get-invoice-dashboard-org-v3-305451280005.us-east1.run.app";

function InvoiceHistory() {
  const [modalInvoice, setModalInvoice] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentPDF, setShowPaymentPDF] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]);
  const [AllinvoiceData, setAllInvoiceData] = useState({});
  const [loader, setLoader] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState({});

  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    vendors: [],
    employees: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({});

  const { user } = useAuth();
  const EMPLOYER_EMAIL = user?.email;
  const domain = EMPLOYER_EMAIL ? EMPLOYER_EMAIL.split("@")[1] : "";

  useEffect(() => {
    const handler = setTimeout(() => {
      getInvoiceHistoryDashboard();
    }, 400);
    return () => clearTimeout(handler);
  }, [statusFilter, vendorFilter, employeeFilter, dateRange, startDate, endDate, searchQuery, limit, offset]);

  const buildPayload = () => {
    const payload = {
      task: "get_invoice_history",
      domain: domain || "",
      employer_email: EMPLOYER_EMAIL || "",
      status_filter: statusFilter || "all",
      date_range: dateRange || "all_time",
      include_sent_date: true,
      limit: Math.max(1, Math.min(1000, Number(limit || 10))),
      offset: Math.max(0, Number(offset || 0)),
    };

    if (vendorFilter && vendorFilter !== "all") payload.vendor_id = vendorFilter;
    if (employeeFilter && employeeFilter !== "all") payload.employee_email = employeeFilter;
    if (searchQuery) payload.search_query = searchQuery;
    if (startDate) payload.start_date = startDate;
    if (endDate) payload.end_date = endDate;

    return payload;
  };

  const getInvoiceHistoryDashboard = (resetOffset = false) => {
    if (resetOffset) setOffset(0);
    const payload = buildPayload();
    setLoader(true);
    axiosApi
      .post(DASHBOARDBASEURL, payload)
      .then((response) => {
        const result = response?.data || {};
        setAvailableFilters(result.available_filters || { statuses: [], vendors: [], employees: [] });
        setInvoiceData(result.invoices || []);
        setFilters(result?.summary || {});
        setAllInvoiceData(result);
      })
      .catch((error) => {
        console.log("getInvoiceHistoryDashboard error:", error?.response ? error.response.data : error?.message);
        toast.error(error?.response?.data?.message || error?.message || "Failed to fetch invoice data");
      })
      .finally(() => setLoader(false));
  };

  function RenderSelect({ value, onChange, className, defaultOption, options = [], optionRenderer, keyPrefix = "" }) {
    const pickerRef = useRef();

    const data = [
      { label: defaultOption.label, value: defaultOption.value },
      ...options.map((opt, idx) => {
        const key = `${keyPrefix}-${idx}`;
        if (optionRenderer) {
          return {
            label: optionRenderer.label(opt),
            value: optionRenderer.value(opt),
            key,
          };
        }
        return { label: opt.label, value: opt.value, key };
      }),
    ];

    useEffect(() => {
      const handleScroll = (e) => {
        const t = e.target;
        const isMenuScroll =
          t?.closest?.(".selectpickerNormalitems") ||
          t?.closest?.(".selectpickerNormalitemsanalyses") ||
          t?.closest?.(".rs-picker-select-menu");

        if (isMenuScroll) return;
        if (pickerRef.current) pickerRef.current.close();
      };

      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, []);

    return (
      <SelectPicker
        ref={pickerRef}
        className="selectpickerNormal selectpickerNormalAnalysis"
        menuClassName="selectpickerNormalitems selectpickerNormalitemsanalyses"
        data={data}
        value={value}
        onChange={onChange}
        searchable
        cleanable={false}
        menuStyle={{ minHeight: "unset" }}
        style={{ width: "100%" }}
        placeholder={defaultOption.label}
        caretAs={(props) => {
          return <ChevronDown size={18} style={{ position: "absolute", right: "8px", top: "11px" }} />;
        }}
      />
    );
  }

  const invoicesToShow = invoiceData;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setVendorFilter("all");
    setEmployeeFilter("all");
    setDateRange("all_time");
    setStartDate("");
    setEndDate("");
    setLimit(10);
    setOffset(0);
  };

  const getInvoicePDF = (invoice) => {
    const invoiceId = invoice.invoice_id;
    let employee_email = invoice?.employee.email;
    const payload = {
      task: "get_invoice_pdf",
      invoice_id: invoiceId,
      employer_email: EMPLOYER_EMAIL,
      employee_email,
    };

    setLoader(true);
    axiosApi
      .post("https://generate-invoice-employee-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        setShowPaymentPDF(response.data);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message);
      })
      .finally(() => setLoader(false));
  };

  const handleWriteOff = (data) => {};

  return (
    <>
      <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
        <div className={`${styles.cardHeader} flex-column align-items-start`}>
          <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
            <Receipt size={25} />
            Invoice History
          </h3>
          <div className="text-muted">Complete invoice records with advanced filtering</div>
        </div>

        <div className="card mb-4 pb-3" style={{ borderColor: "#e6eef8" }}>
          <div className="card-body pb-0" style={{ borderColor: "#e6eef8" }}>
            <div className={styles.filterGrid}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  style={{ paddingLeft: "33px", minHeight: "41.5px" }}
                  className="searchInputGlobal"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => {
                    setLimit(10);
                    setOffset(0);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              <div>
                {RenderSelect({
                  value: statusFilter,
                  onChange: (val) => {
                    setStatusFilter(val);
                  },
                  className: styles.select,
                  defaultOption: { value: "all", label: "All Status" },
                  options: availableFilters.statuses || [],
                  optionRenderer: {
                    value: (s) => (s || "").toLowerCase(),
                    label: (s) => s,
                  },
                  keyPrefix: "status",
                })}
              </div>

              <div>
                {RenderSelect({
                  value: vendorFilter,
                  onChange: (val) => setVendorFilter(val),
                  className: styles.select,
                  defaultOption: { value: "all", label: "All Vendors" },
                  options: availableFilters.vendors || [],
                  optionRenderer: {
                    value: (v) => (v.vendor_id || v.id || "").toString(),
                    label: (v) => `${v.vendor_name || v.name || ""} (${v.vendor_code || ""})`,
                  },
                  keyPrefix: "vendor",
                })}
              </div>

              <div>
                {RenderSelect({
                  value: employeeFilter,
                  onChange: (val) => setEmployeeFilter(val),
                  className: styles.select,
                  defaultOption: { value: "all", label: "All Employees" },
                  options: availableFilters.employees || [],
                  optionRenderer: {
                    value: (emp) => emp.employee_email || "",
                    label: (emp) =>
                      `${emp.employee_name || emp.name || ""} ${emp.job_title ? `- ${emp.job_title}` : ""}`,
                  },
                  keyPrefix: "employee",
                })}
              </div>

              <div>
                {RenderSelect({
                  value: dateRange,
                  onChange: (val) => setDateRange(val),
                  className: styles.select,
                  defaultOption: { value: "all_time", label: "All Time" },
                  options: [
                    { value: "current_month", label: "Current Month" },
                    { value: "last_month", label: "Last Month" },
                    { value: "last_30_days", label: "Last 30 Days" },
                    { value: "last_60_days", label: "Last 60 Days" },
                    { value: "last_90_days", label: "Last 90 Days" },
                  ],
                  keyPrefix: "date",
                })}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-3 px-3">
            <div>
              <div className="small text-muted">
                Showing {invoicesToShow.length} of {AllinvoiceData?.pagination?.total_count ?? invoiceData.length}{" "}
                invoices
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center"
                onClick={clearFilters}
              >
                <Filter size={16} className="me-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: "#e6e6e6" }}>
          <div className="card-body p-0">
            {!invoicesToShow?.length ? (
              <EmptyView
                hide={loader}
                title="No Invoices Found"
                description="Your invoice history is empty. Generated invoices will appear here once available."
              />
            ) : (
              <div className={styles.cardContent}>
                <div className="table-responsive">
                  <table className={`table table-hover ${styles.table}`}>
                    <thead>
                      <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Invoice #
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Employee
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Vendor
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Invoice Date
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Due Date
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Amount
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Paid
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Remaining
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Status
                        </th>
                        <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesToShow.map((invoice, index) => {
                        return (
                          <tr key={index} style={{ borderColor: "#eaeaea" }}>
                            <td style={{ paddingTop: "15px" }} className="nowrap fw-medium">
                              {invoice.invoice_number}
                            </td>
                            <td style={{ paddingTop: "15px" }}>
                              <div className="fw-medium">{invoice.employee?.name || "-"} </div>
                              <div className="font12">{invoice.employee?.job_title || ""} </div>
                            </td>
                            <td style={{ paddingTop: "15px" }}>
                              <div className="fw-medium">{invoice.vendor?.name || "-"} </div>
                              <div className="font12">{invoice.vendor?.code || ""} </div>
                            </td>

                            <td style={{ paddingTop: "15px" }}>
                              {invoice.dates?.invoice_date || invoice.dates?.created || "-"}
                            </td>
                            <td style={{ paddingTop: "15px" }}>{invoice.dates?.due_date || "-"}</td>
                            <td style={{ paddingTop: "15px" }}>{invoice.amounts?.total ?? "-"}</td>
                            <td style={{ paddingTop: "15px" }}>{invoice.amounts?.paid ?? "-"}</td>
                            <td style={{ paddingTop: "15px" }}>{invoice.amounts?.remaining ?? "-"}</td>
                            <td style={{ paddingTop: "15px" }}>
                              <span className={styles.badgePrimary}>
                                {invoice.display_status || invoice.status || "-"}
                              </span>
                            </td>

                            <td style={{ paddingTop: "15px" }}>
                              <div className={styles.actions}>
                                <button
                                  title={`View Invoice (${invoice.invoice_number})`}
                                  type="button"
                                  onClick={() => {
                                    getInvoicePDF(invoice);
                                  }}
                                  className={styles.iconButton}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  title="Record Payment"
                                  type="button"
                                  className={styles.iconButton}
                                  onClick={() => {
                                    let empObj = { ...invoice?.employee };
                                    empObj.original_email = empObj.email;

                                    invoice.total_amount = invoice?.amounts?.total;
                                    invoice.remaining_balance = invoice?.amounts?.remaining;
                                    setCandidateDetails(empObj);
                                    setModalInvoice(invoice);
                                  }}
                                >
                                  <DollarSign size={16} />
                                </button>
                                <button
                                  type="button"
                                  className={styles.iconButton}
                                  onClick={() => {
                                    let empObj = { ...invoice?.employee };
                                    empObj.original_email = empObj.email;
                                    setCandidateDetails(empObj);

                                    setShowPaymentHistory(invoice);
                                  }}
                                  title="View Payment History"
                                >
                                  <ReceiptText size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-3">
                  <CustomPagination
                    alltotalrecords={AllinvoiceData?.pagination?.total_count}
                    currentPage={Math.floor(offset / limit) + 1}
                    setCurrentPage={(page) => {
                      const newOffset = (page - 1) * limit;
                      setOffset(newOffset);
                      if (filters) filters.currentPage = page;
                      setFilters({ ...filters });
                    }}
                    rowsPerPage={limit || 10}
                    setRowsPerPage={(newLimit) => {
                      const newOffset = Math.floor(offset / newLimit) * newLimit;
                      if (filters) filters.rowsPerPage = newLimit;
                      setFilters({ ...filters });
                      setLimit(newLimit);
                      setOffset(newOffset);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <OverlayModal isActive={showPaymentPDF?.pdf_preview?.base64_content} onClose={() => setShowPaymentPDF(false)}>
        <FilePreview
          docObject={{ file_extension: "application/pdf", file_name: showPaymentPDF?.pdf_preview?.file_name }}
          base64File={showPaymentPDF?.pdf_preview?.base64_content || ""}
          setBase64File={setShowPaymentPDF}
          fileType="application/pdf"
          setFileType={() => {}}
        />
      </OverlayModal>
      <PaymentHistoryModal
        show={showPaymentHistory}
        onClose={() => setShowPaymentHistory(null)}
        candidateDetails={candidateDetails}
      />
      <InvoicePayModal
        candidateDetails={candidateDetails}
        update={() => getInvoiceHistoryDashboard(true)}
        show={modalInvoice}
        invoice={modalInvoice}
        onClose={() => setModalInvoice(null)}
        onSubmit={handleWriteOff}
        data={modalInvoice || {}}
      />
      <ThemeLoader show={loader} />
    </>
  );
}

export default InvoiceHistory;
