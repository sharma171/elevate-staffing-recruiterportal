// PaymentsReceivedView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Themeloader from "../../components/ThemeLoader";
import styles from "./PaymentsReceivedView.module.css";
import { CustomPagination, axiosApi } from "../../components";
import { useAuth } from "../../authContext";

export default function PaymentsReceivedView() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [apiSummary, setApiSummary] = useState(null);

  const FINANCIAL_API_URL = "https://get-invoice-dashboard-org-v3-305451280005.us-east1.run.app";

  const { user } = useAuth();
  const employerEmail = user?.email;

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPayments(payments);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredPayments(
      payments.filter(
        (payment) =>
          (payment.invoice_number || "").toLowerCase().includes(q) ||
          (payment.vendor_name || "").toLowerCase().includes(q) ||
          (payment.employee_name || "").toLowerCase().includes(q)
      )
    );
  }, [searchQuery, payments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage, payments.length]);

  const loadPayments = async () => {
    setLoading(true);

    let payload = {
      task: "get_financial_summary",
      employer_email: employerEmail,
      date_range: "all_time",
    };

    axiosApi
      .post(FINANCIAL_API_URL, payload)
      .then((response) => {
        let result = response.data;
        setPayments(result.payment_analytics?.recent_payments || []);
        setFilteredPayments(result.payment_analytics?.recent_payments || []);
        setApiSummary(result.payment_analytics?.payment_summary || null);
      })
      .catch((err) => {
        toast.error("Failed to load payments");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const totalReceived = apiSummary?.total_received?.amount ?? 0;
  const totalReceivedCount = apiSummary?.total_received?.count ?? filteredPayments.length;
  const totalThisMonth = apiSummary?.this_month?.amount ?? 0;
  const paymentsThisMonthCount = apiSummary?.this_month?.count ?? 0;
  const averagePayment = apiSummary?.average_payment?.amount ?? 0;

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage, rowsPerPage]);

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="mb-3">
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <DollarSign size={25} strokeWidth={3} /> Payments Received
        </h3>
        <div className="text-muted">Track all payments received from vendors</div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Total Received</div>
            <DollarSign size={16} className={styles.icon} />
          </div>
          <div className={styles.cardContent}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${totalReceived}</div>
            <div className={styles.smallMuted}>
              {totalReceivedCount} payment{totalReceivedCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>This Month</div>
            <TrendingUp size={16} className={styles.icon} />
          </div>
          <div className={styles.cardContent}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${totalThisMonth}</div>
            <div className={styles.smallMuted}>
              {paymentsThisMonthCount} payment{paymentsThisMonthCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Average Payment</div>
            <Calendar size={16} className={styles.icon} />
          </div>
          <div className={styles.cardContent}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${averagePayment}</div>
            <div className={styles.smallMuted}>Per payment</div>
          </div>
        </div>
      </div>

      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className="searchInputGlobal"
          style={{ paddingLeft: "33px", minHeight: "41.6px" }}
          placeholder="Search payments by invoice, vendor, or candidate..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card mt-4" style={{ borderColor: "#e6e6e6" }}>
        <div className="card-body p-0">
          {paginatedPayments.length === 0 ? (
            <div className={styles.empty}>
              <DollarSign size={48} className={styles.emptyIcon} />
              <div className={styles.emptyText}>
                {searchQuery ? "No payments found matching your search" : "No payments received yet"}
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className={`table table-hover ${styles.table}`}>
                <thead>
                  <tr className="nowrap" style={{ borderColor: "#eaeaea" }}>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Date
                    </th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Invoice #
                    </th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Vendor
                    </th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Candidate
                    </th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Amount</th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Method
                    </th>
                    <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className={styles.th}>
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment, index) => (
                    <tr key={index} style={{ borderColor: "#eaeaea" }}>
                      <td className="py-3">
                        {payment.payment_date ? format(new Date(payment.payment_date), "MMM dd, yyyy") : "-"}
                      </td>
                      <td className="py-3">{payment.invoice_number || "-"}</td>
                      <td className="py-3">{payment.vendor_name || "-"}</td>
                      <td className="py-3">{payment.employee_name || "-"}</td>
                      <td className="py-3">${(payment.amount || 0).toLocaleString()}</td>
                      <td className="py-3">{payment.payment_method || "-"}</td>
                      <td className={`py-3 ${styles.tdMuted}`}>{payment.reference || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-3">
          <CustomPagination
            alltotalrecords={filteredPayments.length}
            currentPage={currentPage}
            setCurrentPage={(val) => setCurrentPage(val)}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={(val) => setRowsPerPage(val)}
          />
        </div>
      </div>

      <Themeloader show={loading} />
    </div>
  );
}
