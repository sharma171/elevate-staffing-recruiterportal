import React, { useState } from "react";
import styles from "./BillPayments.module.css";
import { Calendar, Search, CheckCircle, CreditCard } from "lucide-react";

export default function BillPayments() {
  const [activeTab, setActiveTab] = useState("scheduled");

  const scheduledPayments = [
    {
      date: "Nov 15, 2024",
      invoice: "INV-2024-045",
      supplier: "Acme Corp",
      amount: "$7,020",
      method: "ACH",
      status: "Scheduled",
    },
    {
      date: "Nov 10, 2024",
      invoice: "INV-2024-002",
      supplier: "Tech Solutions",
      amount: "$3,450",
      method: "ACH",
      status: "Scheduled",
    },
    {
      date: "Nov 12, 2024",
      invoice: "INV-2024-006",
      supplier: "XYZ Consulting",
      amount: "$4,830",
      method: "Wire",
      status: "Scheduled",
    },
    {
      date: "Dec 01, 2024",
      invoice: "INV-2024-004",
      supplier: "Cloud Services",
      amount: "$8,900",
      method: "ACH",
      status: "Scheduled",
    },
    {
      date: "Nov 20, 2024",
      invoice: "INV-2024-008",
      supplier: "Marketing Agency",
      amount: "$2,100",
      method: "Check",
      status: "Scheduled",
    },
  ];

  const upcomingPayments = [
    { date: "Nov 10", supplier: "Tech Solutions", amount: "$3,450" },
    { date: "Nov 12", supplier: "XYZ Consulting", amount: "$4,830" },
    { date: "Nov 15", supplier: "Acme Corp", amount: "$7,020" },
  ];

  const historyPayments = [
    {
      date: "Nov 01, 2024",
      invoice: "INV-2024-009",
      supplier: "Office Supplies",
      amount: "$1,890",
      method: "ACH",
      reference: "ACH-20241101-001",
    },
    {
      date: "Oct 28, 2024",
      invoice: "INV-2024-001",
      supplier: "Acme Corp",
      amount: "$7,020",
      method: "ACH",
      reference: "ACH-20241028-003",
    },
    {
      date: "Oct 25, 2024",
      invoice: "INV-2024-003",
      supplier: "Cloud Services",
      amount: "$2,100",
      method: "Wire",
      reference: "WIRE-20241025-012",
    },
    {
      date: "Oct 20, 2024",
      invoice: "INV-2024-005",
      supplier: "XYZ Consulting",
      amount: "$1,950",
      method: "Check",
      reference: "CHK-4582",
    },
    {
      date: "Oct 15, 2024",
      invoice: "INV-2024-011",
      supplier: "Tech Solutions",
      amount: "$4,500",
      method: "ACH",
      reference: "ACH-20241015-007",
    },
    {
      date: "Oct 10, 2024",
      invoice: "INV-2024-007",
      supplier: "Marketing Agency",
      amount: "$3,200",
      method: "ACH",
      reference: "ACH-20241010-002",
    },
    {
      date: "Oct 05, 2024",
      invoice: "INV-2024-013",
      supplier: "Office Supplies",
      amount: "$890",
      method: "ACH",
      reference: "ACH-20241005-009",
    },
    {
      date: "Sep 28, 2024",
      invoice: "INV-2024-018",
      supplier: "Cloud Services",
      amount: "$2,100",
      method: "Wire",
      reference: "WIRE-20240928-005",
    },
  ];

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className={`flex-column align-items-start mb-3`}>
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <CreditCard size={25} />
          Payments Dashboard
        </h3>
        {/* <div className="text-muted">Complete invoice records with advanced filtering</div> */}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Scheduled Payments</div>
          <div className={styles.cardBody}>
            <div className={styles.metricValue}>5</div>
            <div className={styles.metricSub}>$24,670 total</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>Paid This Month</div>
          <div className={styles.cardBody}>
            <div className={styles.metricValuePrimary}>12</div>
            <div className={styles.metricSub}>$45,890 total</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>Payment Methods</div>
          <div className={styles.cardBody}>
            <div className={styles.metricValue}>ACH</div>
            <div className={styles.metricSub}>85% preferred</div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftPane}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "scheduled" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("scheduled")}
            >
              Scheduled
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "history" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          {activeTab === "scheduled" && (
            <div className={styles.section}>
              <div className={styles.filtersCard}>
                <div className={styles.filterRow}>
                  <select className={`searchInputGlobal selectarrow ${styles.select}`}>
                    <option value="next-30">Next 30 Days</option>
                    <option value="next-60">Next 60 Days</option>
                    <option value="next-90">Next 90 Days</option>
                  </select>

                  <select className={`searchInputGlobal selectarrow ${styles.select}`}>
                    <option value="all">All Suppliers</option>
                    <option value="acme">Acme Corp</option>
                    <option value="tech">Tech Solutions</option>
                    <option value="xyz">XYZ Consulting</option>
                  </select>

                  <div className={styles.searchWrap}>
                    <Search className={styles.searchIcon} />
                    <input className={`searchInputGlobal ${styles.input}`} placeholder="Search payments..." />
                  </div>
                </div>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableTitle}>Scheduled Payments</div>
                  <div className={styles.tableDesc}>Upcoming payments scheduled for processing</div>
                </div>

                <div className="table-responsive">
                  <table className={`table ${styles.table}`}>
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Invoice #</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduledPayments.map((p, i) => (
                        <tr key={i}>
                          <td className={styles.fontMedium}>{p.date}</td>
                          <td>{p.invoice}</td>
                          <td>{p.supplier}</td>
                          <td>{p.amount}</td>
                          <td>{p.method}</td>
                          <td>
                            <span className={styles.badge}>
                              <span className={styles.dot}></span>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.btnOutline}>Edit</button>
                              <button className={styles.btnOutline}>Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableFooter}>
                  <div>Showing 5 of 5 scheduled payments</div>
                  <div className={styles.totalText}>Total scheduled amount: $26,300</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className={styles.section}>
              <div className={styles.filtersCard}>
                <div className={styles.filterRow}>
                  <select className={`searchInputGlobal selectarrow ${styles.select}`}>
                    <option value="last-30">Last 30 Days</option>
                    <option value="last-3">Last 3 Months</option>
                    <option value="last-6">Last 6 Months</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  <select className={`searchInputGlobal selectarrow ${styles.select}`}>
                    <option value="all">All Suppliers</option>
                    <option value="acme">Acme Corp</option>
                    <option value="tech">Tech Solutions</option>
                    <option value="office">Office Supplies</option>
                  </select>

                  <select className={`searchInputGlobal selectarrow ${styles.select}`}>
                    <option value="all-methods">All Methods</option>
                    <option value="ach">ACH</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="check">Check</option>
                  </select>

                  <div className={styles.searchWrap}>
                    <Search className={styles.searchIcon} />
                    <input className={`searchInputGlobal ${styles.input}`} placeholder="Search payments..." />
                  </div>

                  <button className={styles.btnOutline}>Export</button>
                </div>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableTitle}>Payment History</div>
                  <div className={styles.tableDesc}>Complete record of processed payments</div>
                </div>
                <div className="table-responsive">
                  <table className={`table ${styles.table}`}>
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Invoice #</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference #</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyPayments.map((p, i) => (
                        <tr key={i}>
                          <td className={styles.fontMedium}>{p.date}</td>
                          <td>{p.invoice}</td>
                          <td>{p.supplier}</td>
                          <td>{p.amount}</td>
                          <td>{p.method}</td>
                          <td className={styles.mono}>{p.reference}</td>
                          <td className={styles.completed}>
                            <CheckCircle className={styles.checkIcon} /> Completed
                          </td>
                          <td>
                            <button className={styles.linkBtn}>View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.summary}>
                  <div className={styles.summaryLeft}>
                    <div className={styles.summaryLabel}>Summary</div>
                    <div className={styles.summaryValue}>$23,650</div>
                    <div className={styles.summarySub}>Total Paid</div>
                    <div className={styles.summarySubMuted}>8 payments • Average: $2,956 per payment</div>
                  </div>

                  <div className={styles.summaryRight}>
                    <div className={styles.summaryLabel}>Payment Methods Breakdown</div>

                    <div className={styles.breakdownRow}>
                      <div>ACH</div>
                      <div className={styles.breakdownPercent}>75% (6 payments)</div>
                    </div>
                    <div className={styles.progress}>
                      <div className={styles.progressBar} style={{ width: "75%" }}></div>
                    </div>

                    <div className={styles.breakdownRow}>
                      <div>Wire</div>
                      <div className={styles.breakdownPercent}>12.5% (1 payment)</div>
                    </div>
                    <div className={styles.progress}>
                      <div className={styles.progressBar} style={{ width: "12.5%" }}></div>
                    </div>

                    <div className={styles.breakdownRow}>
                      <div>Check</div>
                      <div className={styles.breakdownPercent}>12.5% (1 payment)</div>
                    </div>
                    <div className={styles.progress}>
                      <div className={styles.progressBar} style={{ width: "12.5%" }}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.pagination}>
                  <div className={styles.muted}>Showing 1-8 of 45 payments</div>
                  <div className={styles.pager}>
                    <button className={styles.btnOutline} disabled>
                      Previous
                    </button>
                    <button className={styles.btnOutline}>Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightPane}>
          <div className={styles.smallCard}>
            <div className={styles.smallHeader}>
              <div className={styles.smallTitle}>
                <Calendar className={styles.icon} /> This Week
              </div>
              <div className={styles.smallDesc}>Next 3 payments</div>
            </div>
            <div className={styles.smallBody}>
              {upcomingPayments.map((p, i) => (
                <div key={i} className={styles.timelineRow}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>
                      {p.date} • {p.supplier}
                    </div>
                    <div className={styles.timelineSub}>{p.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
