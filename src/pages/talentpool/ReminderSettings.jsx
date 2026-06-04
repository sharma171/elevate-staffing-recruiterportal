import React, { useEffect, useState } from "react";
import { Bell, Pause, Send, Triangle, Settings, Timer, X, TriangleAlert, Play } from "lucide-react";
import styles from "./css/ReminderSettings.module.css";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext";

let baseUrl = "https://generate-invoice-reminders-org-v3-305451280005.us-east1.run.app/";

function ReminderDialog({ show, onClose, onSave, loading }) {
  const [days, setDays] = useState(7);

  useEffect(() => {
    setDays(7);
  }, [show]);

  if (!show) {
    return;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <button
          title="Close"
          type="button"
          className={`hidemodalclosebtn generalButton ${styles.closeButton}`}
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Timer className={styles.iconTimer} />
            Pause Reminder Campaign
          </h2>
        </div>

        <div className={styles.content}>
          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>Invoice: {show?.invoice_number}</div>
            <div className={styles.infoText}>Vendor: {show?.vendor_name}</div>
            <div className={styles.infoText}>Amount: ${show?.remaining_balance}</div>
          </div>

          <div>
            <label htmlFor="pause-days" className={styles.label}>
              Pause Duration (Days)
            </label>
            <input
              type="number"
              id="pause-days"
              min="1"
              max="365"
              className={`form-control ${styles.input}`}
              value={days}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  const num = Number(value);
                  if (num <= 365) {
                    setDays(value);
                  } else {
                    setDays(365);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter number of days"
            />
            <p className={styles.helper}>Reminders will be paused for the specified number of days</p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`btn btn-outline-secondary py-2`}
              style={{ borderRadius: "10px" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (days) {
                  onSave(days);
                }
              }}
              className={`newThemeButton align-items-center py-2`}
            >
              <Pause size={16} />
              Pause for {days || 0} days
            </button>
          </div>
        </div>
      </div>
      <ThemeLoader show={loading} />
    </div>
  );
}

export default function ReminderSettings({ candidateDetails, disabled }) {
  const [loading, setLoading] = useState(true);

  const [autoReminders, setAutoReminders] = useState(false);
  const [preset, setPreset] = useState("Aggressive");
  const [frequency, setFrequency] = useState("Weekly");
  const [startAfter, setStartAfter] = useState(7);
  const [autoPauseDays, setAutoPauseDays] = useState(7);
  const [maxReminders, setMaxReminders] = useState(30);
  const [escalationDays, setEscalationDays] = useState(14);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user } = useAuth();

  let employee_email = candidateDetails?.original_email;
  let employer_email = user?.email;

  // employer_email = "marketing@4spheresolutions.com";
  // employee_email = "muni.k0892@gmail.com";

  const [remindersData, setRemindersData] = useState({
    organization: {},
    settings: {},
    statistics: {},
    top_overdue_invoices: [],
  });

  let statistics = remindersData.statistics || {};
  let invoices = remindersData.top_overdue_invoices || [];
  let settings = remindersData.settings || {};

  useEffect(() => {
    setAutoReminders(!!settings?.enabled);
    setPreset(settings?.reminder_preset || "Aggressive");
    setFrequency(settings?.frequency || "Weekly");
    setStartAfter(settings?.start_after_days || 7);
    setAutoPauseDays(settings?.auto_pause_days || 7);
    setMaxReminders(settings?.max_reminders || 30);
    setEscalationDays(settings?.escalation_after_days || 14);
  }, [settings]);

  useEffect(() => {
    fetchDashboard();
    // fetchInvoices();
  }, []);

  const fetchDashboard = () => {
    const payload = {
      task: "get_dashboard",
      employer_email: employer_email,
      employee_email: employee_email,
    };

    setLoading(true);
    axiosApi
      .post(baseUrl, payload)
      .then((res) => {
        setRemindersData(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // const fetchInvoices = () => {
  //   const payload = {
  //     task: "get_all_overdue_invoices",
  //     employer_email: employer_email,
  //     employee_email: employee_email,
  //     include_history: false,
  //   };

  //   setLoading(true);
  //   axiosApi
  //     .post(baseUrl, payload)
  //     .then((res) => {
  //       console.log(res.data, "res.data");
  //       // setRemindersData(res.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  function handleSave() {
    const settomgs = {
      enable_auto_reminders: autoReminders,
      reminder_preset: preset,
      frequency: frequency,
      start_after_days: Number(startAfter),
      auto_pause_days: Number(autoPauseDays),
      max_reminders: Number(maxReminders),
      escalation_after_days: Number(escalationDays),
    };

    const payload = {
      task: "configure_settings",
      employer_email: employer_email,
      employee_email: employee_email,
      settings: settomgs,
    };

    setLoading(true);
    axiosApi
      .post(baseUrl, payload)
      .then((res) => {
        toast.success(res?.data?.message);
        fetchDashboard();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to Update");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleSend(invoice) {
    let payload = {
      task: "send_manual_reminder",
      employer_email: employer_email,
      employee_email: employee_email,
      template_type: "standard_reminder",
      invoice_id: invoice?.invoice_id,
    };

    setLoading(true);
    axiosApi
      .post(baseUrl, payload)
      .then((res) => {
        toast.success(res?.data?.message);
        fetchDashboard();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to send");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function resumeCampain(invoice) {
    let payload = {
      task: "resume_reminder",
      employer_email: employer_email,
      employee_email: employee_email,
      invoice_id: invoice?.invoice_id,
      resume_immediately: true,
    };

    setLoading(true);
    axiosApi
      .post(baseUrl, payload)
      .then((res) => {
        toast.success(res?.data?.message);
        fetchDashboard();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to update");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handlePause(days, invoice) {
    let payload = {
      task: "pause_reminder",
      employer_email: employer_email,
      employee_email: employee_email,
      invoice_id: invoice?.invoice_id,
      pause_days: Number(days),
    };

    setLoading(true);
    axiosApi
      .post(baseUrl, payload)
      .then((res) => {
        toast.success(res?.data?.message);
        setShowPauseModal(false);
        fetchDashboard();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to update");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = invoices.slice(startIndex, endIndex);

  return (
    <div className="pb-3">
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className={styles.statCard}>
          <div className={styles.statHead}>
            <Bell size={18} className={styles.icon} />
            <span className={styles.statTitle}>Active Campaigns</span>
          </div>
          <div className={styles.statValue}>{statistics?.active_campaigns || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHead}>
            <Pause size={18} className={`text-warning ${styles.icon}`} />
            <span className={styles.statTitle}>Paused Campaigns</span>
          </div>
          <div className={styles.statValue}>{statistics?.paused_campaigns || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHead}>
            <Send size={18} className={`text-primary ${styles.icon}`} />
            <span className={styles.statTitle}>Sent Today</span>
          </div>
          <div className={styles.statValue}>{statistics?.sent_today || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHead}>
            <TriangleAlert size={18} className={`text-danger ${styles.icon}`} />
            <span className={styles.statTitle}>Critical Overdue</span>
          </div>
          <div className={styles.statValue}>{statistics?.critical_overdue_count || 0}</div>
        </div>
      </div>

      <div className={`mb-3 ${styles.overdueCard}`}>
        <div>
          <h3 className={styles.overdueTitle}>Total Overdue Amount</h3>
          <div className={styles.overdueAmount}>{`$${statistics?.total_overdue_amount || 0}`}</div>
          <div className={styles.overdueMeta}>
            {loading
              ? ""
              : `Across ${statistics.total_overdue_invoices || 0} invoices • Avg ${
                  statistics.average_days_overdue || 0
                } days overdue`}
          </div>
        </div>
        <div className="text-center">
          <div className={styles.smallMuted}>With Reminders</div>
          <div className={styles.bigNumber}>{statistics?.invoices_with_reminders || 0}</div>
          <div className={styles.smallMuted}>Without Reminders</div>
          <div className={styles.bigNumber}>{statistics?.invoices_without_reminders || 0}</div>
        </div>
      </div>

      <div className={`mb-3 ${styles.cardSimple}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div>
              <div className={`d-flex align-items-center gap-2 ${styles.cardTitle}`}>
                <Settings size={20} className={styles.icon} />
                Global Reminder Settings
              </div>
              <div className={styles.cardDesc}>Configure default reminder behavior for all invoices</div>
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div
            className={styles.gridView}
            style={{ "--bs-form-control-disabled-bg": "#fafafa", "--bs-secondary-bg": "#fafafa" }}
          >
            <div className={styles.responsiveflex} style={{ minWidth: "260px" }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="w-100">
                  <label className={styles.formLabel} htmlFor="auto-reminders">
                    Enable Auto Reminders
                  </label>
                  <div className={styles.formSmall}>Automatically send reminders for overdue invoices</div>
                </div>
                <div style={{ minWidth: "50px" }}>
                  <button
                    disabled={disabled}
                    type="button"
                    id="auto-reminders"
                    onClick={() => setAutoReminders((v) => !v)}
                    className={`${styles.switch} ${autoReminders ? styles.switchOn : styles.switchOff}`}
                    aria-pressed={autoReminders}
                  >
                    <span
                      className={styles.switchThumb}
                      style={{ transform: autoReminders ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.responsiveflex} style={{ minWidth: "200px" }}>
              <label className={styles.formLabel}>Reminder Preset</label>
              <select
                disabled={disabled}
                className="form-select mt-1"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="Aggressive">Aggressive</option>
                <option value="Moderate">Moderate</option>
                <option value="Conservative">Conservative</option>
              </select>
            </div>

            <div className={styles.responsiveflex} style={{ minWidth: "200px" }}>
              <label className={styles.formLabel}>Default Frequency</label>
              <select
                disabled={disabled}
                className="form-select mt-1"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className={styles.responsiveflex}>
              <label className={styles.formLabel}>Start After (Days)</label>
              <input
                disabled={disabled}
                type="number"
                className="form-control mt-1"
                value={startAfter}
                onChange={(e) => setStartAfter(e.target.value)}
              />
              <div className={styles.formSmall}>Days after due date to start</div>
            </div>

            <div className={styles.responsiveflex}>
              <label className={styles.formLabel}>Auto-pause Days</label>
              <input
                disabled={disabled}
                type="number"
                className="form-control mt-1"
                value={autoPauseDays}
                onChange={(e) => setAutoPauseDays(e.target.value)}
              />
              <div className={styles.formSmall}>Days to pause after response</div>
            </div>

            <div className={styles.responsiveflex}>
              <label className={styles.formLabel}>Max Reminders</label>
              <input
                disabled={disabled}
                type="number"
                className="form-control mt-1"
                value={maxReminders}
                onChange={(e) => setMaxReminders(e.target.value)}
              />
              <div className={styles.formSmall}>Maximum reminders per invoice</div>
            </div>

            <div className={styles.responsiveflex}>
              <label className={styles.formLabel}>Escalation Days</label>
              <input
                disabled={disabled}
                type="number"
                className="form-control mt-1"
                value={escalationDays}
                onChange={(e) => setEscalationDays(e.target.value)}
              />
              <div className={styles.formSmall}>Days before escalation</div>
            </div>
          </div>
          {disabled ? (
            <></>
          ) : (
            <div className="mt-4 d-flex justify-content-end">
              <button type="button" className="newThemeButton" onClick={handleSave}>
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="">
        {invoices?.length ? (
          <div className={styles.cardSimple}>
            <div className={styles.cardHeader}>
              <div>
                <div className="d-flex gap-2 align-items-center">
                  <TriangleAlert size={18} color="red" />
                  <div className={styles.cardTitle}>Overdue Invoices & Reminder Management</div>
                </div>
                <div className={styles.cardDesc}>Manage reminder campaigns for {invoices.length} overdue invoices</div>
              </div>
            </div>

            <div className={`table-responsive ${styles.cardBody}`}>
              <table
                className={`table table-striped table-hover table-borderless ${styles.tableCustom}`}
                style={{ "--bs-table-striped-bg": "#f8f9fa" }}
              >
                <thead>
                  <tr className="nowrap">
                    <th>Invoice Details</th>
                    <th>Amount Due</th>
                    <th>Days Overdue</th>
                    <th>Priority</th>
                    <th>Reminders Sent</th>
                    <th>Last Reminder Sent</th>
                    <th className="text-center">Status</th>
                    {disabled ? <></> : <th className="text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((inv, index) => {
                    let isActive = inv?.reminder_info?.campaign_status === "active";
                    let isPaused = inv?.reminder_info?.campaign_status === "paused";
                    return (
                      <tr key={index}>
                        <td>
                          <div className={`nowrap ${styles.invoiceId}`}>{inv.invoice_number}</div>
                          <div className={styles.invoiceSub}>{inv.vendor_name}</div>
                        </td>
                        <td className={`text-center ${styles.amount}`}>{`$${inv.remaining_balance}`}</td>
                        <td>
                          <span className={styles.badge}>{inv.days_overdue} days</span>
                        </td>
                        <td>
                          <span className={styles.badgeLight}>{inv.priority_level}</span>
                        </td>
                        <td>
                          <div className={styles.centerText}>{inv?.reminder_info?.total_sent}</div>
                          <div className={styles.centerText}>{inv?.reminder_info?.days_since_last}</div>
                        </td>
                        <td>
                          <div className={`text-center ${styles.lastReminderDate}`}>
                            {inv?.reminder_info?.last_sent
                              ? new Date(inv?.reminder_info?.last_sent).toLocaleDateString()
                              : "—"}
                          </div>
                          <div className={`text-center ${styles.lastReminderTime}`}>
                            {inv?.reminder_info?.last_sent
                              ? new Date(inv?.reminder_info?.last_sent).toLocaleTimeString()
                              : ""}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{ minHeight: "50px" }}
                            className="font12 d-flex flex-column gap-1 align-items-center justify-content-center"
                          >
                            <div
                              className={`nowrap capitalize px-3 text-sm rounded`}
                              style={{
                                padding: "5px 10px 3px 10px",
                                backgroundColor: isActive ? "#dcfce7" : isPaused ? "#fef9c3" : "#a6a6a6",
                                color: isActive ? "#176535" : isPaused ? "#8c5719" : "#ffffff",
                              }}
                            >
                              {inv?.reminder_info?.campaign_status || "No Campaign"}
                            </div>
                            {inv?.reminder_info?.paused_until ? (
                              <div className={`nowrap text-center ${styles.lastReminderTime}`}>
                                {inv?.reminder_info?.paused_until}
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </td>
                        {disabled ? (
                          <></>
                        ) : (
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                title="Send Manual Reminder"
                                onClick={() => handleSend(inv)}
                              >
                                <Send size={14} />
                              </button>
                              {inv?.reminder_info?.campaign_status == "paused" ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm"
                                  title="Resume Campaign"
                                  onClick={() => resumeCampain(inv)}
                                >
                                  <Play size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  title="Pause Campaign"
                                  onClick={() => setShowPauseModal(inv)}
                                >
                                  <Pause size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3">
              <CustomPagination
                data={invoices}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        <ReminderDialog
          loading={loading}
          onSave={(days) => {
            handlePause(days, showPauseModal);
          }}
          show={showPauseModal}
          onClose={() => setShowPauseModal(false)}
        />
      </div>
      <ThemeLoader show={loading} />
    </div>
  );
}
