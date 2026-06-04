import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ThemeLoader, axiosApi } from "../../components";
import { DollarSign, AlertCircle, Clock, Building2, User, Building, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./BillsOverview.module.css";
import { useAuth } from "../../authContext";

const INVOICE_API_URL = "https://payables-invoice-extraction-api-v3-305451280005.us-east1.run.app/";

function formatCurrency(val) {
  const n = Number(val) || 0;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BillsOverview() {
  const [stats, setStats] = useState(null);
  const [loader, setLoader] = useState(true);
  const [allInvoices, setAllInvoices] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const EMPLOYER_EMAIL = user?.email;

  async function fetchDashboardStats() {
    setLoader(true);
    try {
      const payload = { action: "get_bills_overview", user_email: EMPLOYER_EMAIL };
      const response = await axiosApi.post(INVOICE_API_URL, payload);
      const resp = response?.data ?? response;
      const overview = resp?.overview || {};

      const mappedStats = {
        totalOutstanding: overview?.total_outstanding?.amount ?? 0,
        totalUnpaidCount: overview?.total_outstanding?.invoice_count ?? 0,
        overdueAmount: overview?.overdue?.amount ?? 0,
        overdueCount: overview?.overdue?.invoice_count ?? 0,
        overdueNeedsAttention: overview?.overdue?.needs_attention ?? false,
        dueThisWeek: overview?.due_this_week?.amount ?? 0,
        dueThisWeekCount: overview?.due_this_week?.invoice_count ?? 0,
      };

      setStats(mappedStats);

      const invoicesList = resp?.invoices ?? [];
      setAllInvoices(Array.isArray(invoicesList) ? invoicesList : []);
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load dashboard statistics";
      toast.error(msg);
      setStats(null);
      setAllInvoices([]);
    } finally {
      setLoader(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const applyNavigate = (path) => {
    if (!path) return;
    if (navigate) navigate(path);
    else window.location.href = path;
  };

  const s = stats || {
    totalOutstanding: 0,
    totalUnpaidCount: 0,
    overdueAmount: 0,
    overdueCount: 0,
    dueThisWeek: 0,
    dueThisWeekCount: 0,
  };

  const reimbursements = (allInvoices || []).filter((inv) => {
    const type = (inv.type || inv.category || inv.description || "").toLowerCase();
    return /reimburse|expense|employee/i.test(type);
  });

  const reimbursementsCount = reimbursements.length;
  const reimbursementsTotal = reimbursements.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount || r.amount || 0) || 0),
    0
  );

  const orgExpenses = (allInvoices || []).filter((inv) => {
    const type = (inv.type || inv.category || inv.description || "").toLowerCase();
    return /utility|rent|organization|operational|ops|office/i.test(type);
  });

  const orgExpensesCount = orgExpenses.length;
  const orgExpensesTotal = orgExpenses.reduce((sum, r) => sum + (parseFloat(r.total_amount || r.amount || 0) || 0), 0);

  const metricsConfig = [
    {
      title: "Total Outstanding",
      value: formatCurrency(s.totalOutstanding),
      subText: `Across ${s.totalUnpaidCount} invoices`,
      iconEl: <DollarSign className={styles.icon} />,
      cardClass: styles.card,
      bodyClass: styles.cardBody,
      iconBoxClass: styles.iconBoxPrimary,
      titleClass: styles.smallMuted,
      valueClass: styles.bigValue,
      subClass: styles.tinyMuted,
    },
    {
      title: "Overdue",
      value: formatCurrency(s.overdueAmount),
      subText: `${s.overdueCount} invoices${s.overdueNeedsAttention ? " • Needs attention" : ""}`,
      iconEl: <AlertCircle className={styles.icon} />,
      cardClass: styles.card,
      bodyClass: styles.cardBody,
      iconBoxClass: styles.iconBoxDestructive,
      titleClass: styles.smallMuted,
      valueClass: `${styles.bigValue} ${styles.destructive}`,
      subClass: styles.tinyMuted,
    },
    {
      title: "Due This Week",
      value: formatCurrency(s.dueThisWeek),
      subText: `${s.dueThisWeekCount} invoices`,
      iconEl: <Clock className={styles.icon} />,
      cardClass: styles.card,
      bodyClass: styles.cardBody,
      iconBoxClass: styles.iconBoxWarning,
      titleClass: styles.smallMuted,
      valueClass: `${styles.bigValue} ${styles.warning}`,
      subClass: styles.tinyMuted,
    },
  ];

  const categoryConfig = [
    {
      title: "Supplier Bills",
      description: "Vendor invoices and purchase orders",
      meta: `${s.totalUnpaidCount} unpaid invoices • ${formatCurrency(s.totalOutstanding)}`,
      iconEl: <Building2 className={styles.iconSmall} />,
      cardClass: styles.categoryCard,
      bodyClass: styles.categoryBody,
      titleClass: styles.categoryTitle,
      descClass: styles.categoryDesc,
      metaClass: styles.categoryMeta,
      iconCircleClass: styles.iconCircleBlue,
      ctaLabel: "View Details",
      navigateTo: "/dashboard/financialmanagement/supplierbills",
    },
    {
      title: "Employee Reimbursements",
      description: "Employee expense reports and claims",
      meta: `${reimbursementsCount} pending • ${formatCurrency(reimbursementsTotal)}`,
      iconEl: <User className={styles.iconSmall} />,
      cardClass: styles.categoryCard,
      bodyClass: styles.categoryBody,
      titleClass: styles.categoryTitle,
      descClass: styles.categoryDesc,
      metaClass: styles.categoryMeta,
      iconCircleClass: styles.iconCircleGreen,
      ctaLabel: "View Details",
      navigateTo: "/dashboard/financialmanagement/billsoverview",
    },
    {
      title: "Organization Expenses",
      description: "Utilities, rent, and operational costs",
      meta: `${orgExpensesCount} unpaid • ${formatCurrency(orgExpensesTotal)}`,
      iconEl: <Building className={styles.iconSmall} />,
      cardClass: styles.categoryCard,
      bodyClass: styles.categoryBody,
      titleClass: styles.categoryTitle,
      descClass: styles.categoryDesc,
      metaClass: styles.categoryMeta,
      iconCircleClass: styles.iconCirclePurple,
      ctaLabel: "View Details",
      navigateTo: "/dashboard/financialmanagement/organizationexpenses",
    },
  ];

  return (
    <main className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="flex-column align-items-start">
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <TrendingDown size={25} />
          Bills Overview
        </h3>
        <div className="text-muted">Manage all your payables across different categories</div>
      </div>

      <section className={`mt-3 ${styles.metricsGrid}`}>
        {metricsConfig.map((m, index) => (
          <article key={index} className={m.cardClass}>
            <div className={m.bodyClass}>
              <div className={styles.rowCenter}>
                <div className={m.iconBoxClass}>{m.iconEl}</div>
                <div className={styles.flex1}>
                  <p className={m.titleClass}>{m.title}</p>
                  <p className={m.valueClass}>{m.value}</p>
                  <p className={m.subClass}>{m.subText}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.pt4}>
        <div className={styles.categoryGrid}>
          {categoryConfig.map((c, index) => (
            <div key={index} className={c.cardClass} onClick={() => applyNavigate(c.navigateTo)}>
              <div className={c.bodyClass}>
                <div className={styles.colFlex}>
                  <div className={c.iconCircleClass}>{c.iconEl}</div>
                  <h3 className={c.titleClass}>{c.title}</h3>
                  <p className={c.descClass}>{c.description}</p>
                  <div className={styles.mtAuto}>
                    <p className={c.metaClass}>{c.meta}</p>
                    <button className={styles.ctaButton} onClick={() => applyNavigate(c.navigateTo)} type="button">
                      {c.ctaLabel}
                      <span className={styles.ctaArrow}>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ThemeLoader show={loader} />
    </main>
  );
}
