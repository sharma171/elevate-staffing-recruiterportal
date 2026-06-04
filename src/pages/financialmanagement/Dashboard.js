import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "react-toastify";
import styles from "./InvoiceDashboard.module.css";
import Themeloader from "../../components/ThemeLoader";
import { Calendar, CircleAlert, CircleCheck, Clock, LayoutDashboard, Receipt } from "lucide-react";
import { useAuth } from "../../authContext";
import { RiPieChart2Fill } from "react-icons/ri";

export default function InvoiceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState("all_time");

  const { user } = useAuth();
  const employerEmail = user?.email;

  const FINANCIAL_API_URL = "https://get-invoice-dashboard-org-v3-305451280005.us-east1.run.app";
  // const employerEmail = "marketing@4spheresolutions.com";

  const COLORS = ["hsl(220.91deg 83.54% 30.98%)", "#575757ff", "hsl(260, 70%, 50%)", "hsl(0, 78%, 63%)"];
  const PIECOLORS = ["hsl(220.91deg 83.54% 30.98%)", "#ecececff", "hsl(260, 70%, 50%)", "hsl(0, 78%, 63%)"];

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const response = await fetch(FINANCIAL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "get_financial_summary",
          employer_email: employerEmail,
          date_range: dateRange,
        }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setDashboardData(result);
      } else {
        toast.error(result.error || "Failed to load dashboard data");
      }
    } catch {
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const metricsData = dashboardData?.summary
    ? {
        total_invoices: dashboardData.summary.total_invoices || 0,
        total_invoiced: dashboardData.summary.total_invoiced_amount || 0,
        total_paid: dashboardData.summary.total_paid_amount || 0,
        total_outstanding: dashboardData.summary.total_outstanding || 0,
        total_overdue: dashboardData.summary.total_overdue || 0,
        collection_rate: dashboardData.kpi?.collection_rate || 0,
        avg_days_to_pay: dashboardData.kpi?.avg_days_to_pay || 0,
      }
    : null;

  const cashFlowData =
    dashboardData?.invoice_breakdown?.by_month
      ?.sort((a, b) => new Date(a.month) - new Date(b.month))
      ?.map((item) => ({
        month: new Date(item.month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        invoiced: item.total_amount || 0,
        paid: item.paid_amount || 0,
        outstanding: (item.total_amount || 0) - (item.paid_amount || 0),
      }))
      ?.slice(-6) || [];

  const statusData = dashboardData?.invoice_breakdown?.by_status
    ? Object.entries(dashboardData.invoice_breakdown.by_status).map(([status, data]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: data.count || 0,
        amount: data.total_amount || 0,
      }))
    : [];

  const vendorData =
    dashboardData?.invoice_breakdown?.by_vendor?.slice(0, 5)?.map((v) => ({
      name: v.vendor_name,
      invoiced: v.total_amount || 0,
      paid: v.paid_amount || 0,
    })) || [];

  const trend =
    cashFlowData && cashFlowData.length >= 2
      ? (() => {
          const current = cashFlowData.at(-1).invoiced;
          const prev = cashFlowData.at(-2).invoiced;
          const change = ((current - prev) / (prev || 1)) * 100;
          return { value: Math.abs(change).toFixed(1), isPositive: change > 0 };
        })()
      : null;

  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString()}`;

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100 d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <div className={`flex-column align-items-start`}>
          <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
            <RiPieChart2Fill size={25} />
            Invoice Dashboard
          </h3>
          <div className="text-muted">Comprehensive financial overview and analytics</div>
        </div>

        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={styles.select}>
          <option value="all_time">All Time</option>
          <option value="current_month">Current Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_60_days">Last 60 Days</option>
          <option value="last_90_days">Last 90 Days</option>
          <option value="current_quarter">Current Quarter</option>
          <option value="current_year">Current Year</option>
        </select>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.rowBetween}>
            <h3 className={styles.metricLabel}>Total Invoiced</h3>
            <div className={`${styles.iconWrap} ${styles.blueIcon}`}>
              <Receipt className={styles.icon} />
            </div>
          </div>
          <div className={styles.metricValue}>{formatCurrency(metricsData?.total_invoiced)}</div>
          <p className={styles.smallNote}>{metricsData?.total_invoices ?? 0} total invoices</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.rowBetween}>
            <h3 className={styles.metricLabel}>Total Paid</h3>
            <div className={`${styles.iconWrap} ${styles.greenIcon}`}>
              <CircleCheck className={styles.icon} />
            </div>
          </div>
          <div className={styles.metricValue}>{formatCurrency(metricsData?.total_paid)}</div>
          <p className={styles.smallNote}>Collection rate: {metricsData?.collection_rate ?? 0}%</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.rowBetween}>
            <h3 className={styles.metricLabel}>Outstanding</h3>
            <div className={`${styles.iconWrap} ${styles.orangeIcon}`}>
              <Clock className={styles.icon} />
            </div>
          </div>
          <div className={styles.metricValue}>{formatCurrency(metricsData?.total_outstanding)}</div>
          <p className={styles.smallNote}>Pending payment</p>
        </div>

        <div
          className={`${styles.metricCard} ${styles.cardHover}`}
          onClick={() => navigate("/dashboard/financialmanagement/invoiceshistory?status=overdue")}
        >
          <div className={styles.rowBetween}>
            <h3 className={styles.metricLabel}>Overdue</h3>
            <div className={`${styles.iconWrap} ${styles.redIcon}`}>
              <CircleAlert className={styles.icon} />
            </div>
          </div>
          <div className={styles.metricValue}>{formatCurrency(metricsData?.total_overdue)}</div>
          <p className={styles.smallNote}>Requires attention</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Cash Flow Trend</div>
            {trend && (
              <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
                {trend.isPositive ? "▲" : "▼"} {trend.value}%
              </div>
            )}
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Legend />
                <Line type="monotone" dataKey="invoiced" stroke={COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="paid" stroke={COLORS[1]} strokeWidth={2} />
                <Line type="monotone" dataKey="outstanding" stroke={COLORS[3]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Invoice Status Breakdown</div>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  labelLine={false}
                  startAngle={105}
                  endAngle={-355}
                  outerRadius={110}
                  label={({ name, percent, cx, cy, midAngle, outerRadius, index }) => {
                    const RAD = Math.PI / 180;
                    const tier = (index % 3) - 1;
                    const baseR = outerRadius * 1.1;
                    const r = Math.max(baseR + tier * 6, outerRadius + 6);
                    const x = cx + r * Math.cos(-midAngle * RAD);
                    const y = cy + r * Math.sin(-midAngle * RAD);
                    const dx = x > cx ? 6 : -6;

                    return (
                      <text
                        x={x + dx}
                        y={y}
                        fill="#0d3791"
                        fontSize={14}
                        fontWeight="600"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIECOLORS[i % PIECOLORS.length]} />
                  ))}
                </Pie>

                <Tooltip formatter={(v, n, p) => [`${v} invoices ($${p.payload.amount.toLocaleString()})`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Monthly Invoice Activity</div>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Legend />
                <Bar dataKey="invoiced" fill={COLORS[0]} />
                <Bar dataKey="paid" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Top 5 Vendors</div>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={vendorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={({ x, y, payload }) => {
                    const full = payload.value;
                    const short = full.length > 10 ? full.slice(0, 10) + "…" : full;
                    return (
                      <text x={x} y={y} dy={4} textAnchor="end">
                        <title>{full}</title>
                        {short}
                      </text>
                    );
                  }}
                />
                <Tooltip formatter={formatCurrency} />
                <Legend />
                <Bar dataKey="invoiced" fill={COLORS[0]} />
                <Bar dataKey="paid" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.quickActions__card}>
        <div className={styles.quickActions__header}>
          <h3 className={styles.quickActions__title}>Quick Actions</h3>
        </div>
        <div className={styles.quickActions__actions}>
          <button
            onClick={() => navigate("/dashboard/financialmanagement/invoiceshistory")}
            className={styles.primaryButton}
          >
            <Calendar className={styles.quickActions__icon} />
            View All Invoices
          </button>
          <button
            onClick={() => navigate("/dashboard/financialmanagement/invoiceshistory?status=overdue")}
            className={styles.outlineButton}
          >
            View Overdue Invoices
          </button>
          <button onClick={() => navigate("/dashboard/financialmanagement/vendors")} className={styles.outlineButton}>
            Manage Vendors
          </button>
        </div>
      </div>

      <Themeloader show={loading} />
    </div>
  );
}
