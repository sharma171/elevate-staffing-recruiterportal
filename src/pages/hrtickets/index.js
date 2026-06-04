import React, { useEffect, useState } from "react";
import styles from "./HRTickets.module.css";
import { axiosApi, CustomPagination, SearchBox, ThemeLoader, Truncate } from "../../components";
import { formatDateToET, returnTruncatedStr } from "../../helpers/StrHelpers";
import { CircleAlert, Eye, Paperclip, RefreshCw } from "lucide-react";
import ViewModal from "./ViewModal";
import { useAuth } from "../../authContext";

function CandidateLayout({ children, refresh }) {
  return (
    <div className={`py-2 px-2 px-md-2 rightcontent`}>
      <div className="headerBackground text-white p-3 mb-3 mb-lg-4" style={{ borderRadius: "10px", minHeight: "85px" }}>
        <h2 className="m-0 fw-bold h2 fs-5">HR Tickets Management</h2>
        <p className="mb-0 fs-14">Review and manage organization HR tickets</p>
      </div>
      <div className={`${styles.container}`}>{children}</div>
    </div>
  );
}

export default function HRTickets() {
  const [tickets, setTickets] = useState([]);
  const [ticketsData, setTicketsData] = useState({});
  const [showTicket, setshowTicket] = useState(false);
  const [loader, setloader] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    currentPage: 1,
    rowsPerPage: 10,
    priority: "",
  });

  const { user } = useAuth();

  let overall_stats = ticketsData?.statistics?.overall_stats;

  const stats = {
    total: overall_stats?.total_tickets || "0",
    open: overall_stats?.open_tickets || "0",
    pending_hr_tickets: overall_stats?.pending_hr_tickets || "0",
    resolved_tickets: overall_stats?.resolved_tickets || "0",
    pending_employee_tickets: overall_stats?.pending_employee_tickets || "0",
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrgTickets();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.status, filters.priority, filters.currentPage, filters.rowsPerPage, filters.search]);

  // useEffect(() => {
  //   const data = ticketsData.tickets || [];
  //   if (filters.search) {
  //     const filtered = data.filter((ticket) => {
  //       const searchLower = filters.search.toLowerCase();
  //       return Object.values(ticket).some((val) => String(val).toLowerCase().includes(searchLower));
  //     });
  //     setTickets(filtered);
  //   } else {
  //     setTickets(data);
  //   }
  // }, [filters.search]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchOrgTickets = () => {
    const payload = {
      action: "get_org_tickets",
      hr_email: user?.email,
      search: filters.search,
      // hr_email: "marketing@4spheresolutions.com",
      include_stats: true,
      sort_order: "DESC",
      offset: (filters.currentPage - 1) * filters.rowsPerPage,
      limit: filters.rowsPerPage,
    };

    if (filters.status) {
      payload.status = [filters.status];
    }

    if (filters.priority) {
      payload.priority = filters.priority;
    }

    setloader(true);
    axiosApi
      .post("https://manage-hr-tickets-org-v3-305451280005.us-east1.run.app", payload)
      .then((response) => {
        setloader(false);
        setTicketsData(response.data?.data);
        setTickets(response?.data?.data?.tickets || []);
      })
      .catch((error) => {
        setloader(false);
        console.log("Error fetching tickets:", error.response?.data || error.message);
      });
  };

  const statusColor = (status) => {
    const colors = {
      open: "#304abe",
      pending: "#d97706",
      inprogress: "#0e7490",
      resolved: "#15803d",
      closed: "#44403c",
      pendingemployee: "#9a3b2a",
      pendinghr: "#7328af",
    };

    const key = status?.toLowerCase().replace(/\s+/g, "").trim();
    return colors[key] || "#6b7280";
  };

  const statusBGColor = (status) => {
    const colors = {
      open: "#dbeafe",
      pending: "#fef3c7",
      inprogress: "#cffafe",
      resolved: "#bbf7d0",
      closed: "#e7e5e4",
      pendingemployee: "#ffedd5",
      pendinghr: "#f3e8ff",
    };

    const key = status?.toLowerCase().replace(/\s+/g, "").trim();
    return colors[key] || "#f3f4f6"; // fallback light gray
  };

  const priorityColor = (priority) => {
    const colors = {
      high: "#991b1b",
      medium: "#eab308",
      low: "#16a34a",
    };

    const key = priority?.toLowerCase().trim();
    return colors[key] || "#6b7280";
  };

  const priorityBGColor = (priority) => {
    const colors = {
      high: "#fee2e2",
      medium: "#fef9c3",
      low: "#dcfce7",
    };

    const key = priority?.toLowerCase().trim();
    return colors[key] || "#f3f4f6";
  };

  const renderFilters = () => {
    return (
      <div className={styles.filterContainer}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search tickets..."
            className={styles.searchInput}
            value={filters.search}
            onChange={(e) => {
              handleChange("search", e.target.value);
              handleChange("currentPage", 1);
            }}
          />
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={filters.status}
            onChange={(e) => {
              handleChange("status", e.target.value);
              handleChange("currentPage", 1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Pending Employee">Pending Employee</option>
            <option value="Pending HR">Pending HR</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className={styles.select}
            value={filters.priority}
            onChange={(e) => {
              handleChange("priority", e.target.value);
              handleChange("currentPage", 1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <div className="d-flex align-items-center gap-1">
            <button onClick={fetchOrgTickets} className={styles.btnRefresh}>
              <RefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CandidateLayout>
      <div className={`${styles.wrapper}`}>
        <section className={`${styles.statsGrid}`}>
          <div className={`${styles.card}`}>
            <div className={styles.cardHeader} style={{ background: "#E8E9EF" }}>
              Total Tickets
            </div>
            <div className={`ticketStatustotal ${styles.cardContent}`}>
              <span>{stats.total}</span>
            </div>
          </div>
          <div className={`${styles.card}`}>
            <div className={styles.cardHeader} style={{ background: "#F4E1EE" }}>
              Open
            </div>
            <div className={`ticketStatusopen ${styles.cardContent}`}>
              <span>{stats.open}</span>
            </div>
          </div>
          <div className={`${styles.card}`}>
            <div className={styles.cardHeader} style={{ background: "#F9EEE2" }}>
              Pending HR
            </div>
            <div className={`ticketStatushigh ${styles.cardContent}`}>
              <span>{stats.pending_hr_tickets}</span>
            </div>
          </div>
          <div className={`${styles.card}`}>
            <div className={styles.cardHeader} style={{ background: "#F7EEF3" }}>
              Pending Employee
            </div>
            <div className={`ticketStatuslow ${styles.cardContent}`}>
              <span>{stats.pending_employee_tickets}</span>
            </div>
          </div>
          <div className={`${styles.card}`}>
            <div className={styles.cardHeader} style={{ background: "#EFF4F7" }}>
              Resolved
            </div>
            <div className={`ticketStatusprogress ${styles.cardContent}`}>
              <span>{stats.resolved_tickets}</span>
            </div>
          </div>
        </section>
        {renderFilters()}
        <section className={`bg-white ${styles.listWrapper}`}>
          <div className={`table-responsive ${styles.tableWrapper}`}>
            <table
              className={`table table-striped table-hover ${styles.table}`}
              style={{ "--bs-table-striped-bg": "#f8f9fa" }}
            >
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Subject</th>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => {
                  return (
                    <tr key={index} className="pointer" onClick={() => setshowTicket(ticket)}>
                      <td className={`nowrap ${styles.mono}`}>{ticket.reference_number}</td>
                      <td>
                        <div className="d-flex gap-1 align-items-center">
                          <CircleAlert
                            strokeWidth={3}
                            style={{ height: "15px", color: priorityColor(ticket.priority) }}
                          />
                          {returnTruncatedStr(ticket.subject)}
                          {ticket.has_attachment ? <Paperclip style={{ height: "12px", color: "#64748b" }} /> : <></>}
                        </div>
                      </td>
                      <td className="fontgray">{returnTruncatedStr(ticket.employee_email)}</td>
                      <td className="nowrap">{ticket.category}</td>
                      <td>
                        <div
                          className="badge hover"
                          style={{
                            color: priorityColor(ticket.priority),
                            background: priorityBGColor(ticket.priority),
                          }}
                        >
                          {ticket.priority}
                        </div>
                      </td>
                      <td>
                        <div
                          className="badge hover"
                          style={{
                            color: statusColor(ticket.status),
                            background: statusBGColor(ticket.status),
                          }}
                        >
                          {ticket.status}
                        </div>
                      </td>
                      <td>{formatDateToET(ticket.created_at)}</td>
                      <td>{formatDateToET(ticket.updated_at)}</td>
                      <td>
                        <button className={styles.actionBtn} onClick={() => setshowTicket(ticket)}>
                          <Eye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3">
            <CustomPagination
              alltotalrecords={ticketsData?.count}
              currentPage={filters?.currentPage}
              setCurrentPage={(val) => {
                filters.currentPage = val;
                setFilters({ ...filters });
              }}
              rowsPerPage={filters.rowsPerPage || 10}
              setRowsPerPage={(val) => {
                filters.rowsPerPage = val;
                setFilters({ ...filters });
              }}
            />
          </div>
        </section>
        <ThemeLoader show={loader} />
      </div>
      <ViewModal
        show={showTicket}
        setShow={() => {
          setshowTicket(false);
          fetchOrgTickets();
        }}
      />
    </CandidateLayout>
  );
}
