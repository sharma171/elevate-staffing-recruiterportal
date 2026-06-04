import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, Filter, X, Building2 } from "lucide-react";
import styles from "./VendorsView.module.css";
import { CustomPagination } from "../../components";
import Themeloader from "../../components/ThemeLoader";
import { useAuth } from "../../authContext";

function VendorDetailsSheet({ open, onOpenChange, selectedVendor = {} }) {
  const isActive = !!selectedVendor.is_active;

  return (
    <>
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 1040 }}
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-labelledby="vendor-sheet-title"
        aria-describedby="vendor-sheet-desc"
        className="position-fixed top-0 end-0 h-100 bg-body border-start shadow p-4 overflow-auto"
        style={{
          width: "100%",
          maxWidth: "672px",
          zIndex: 1050,
          transition: "transform 0.5s ease-in-out",
          transform: open ? "translateX(0)" : "translateX(100%)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <button
          type="button"
          className="btn btn-light position-absolute top-0 end-0 m-3 d-inline-flex align-items-center justify-content-center p-2"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="d-flex flex-column gap-2 text-center text-sm-start">
          <h2 id="vendor-sheet-title" className="fs-5 fw-semibold text-body">
            {selectedVendor.company_name || "—"}
          </h2>
          <p id="vendor-sheet-desc" className="text-muted small mb-0">
            Vendor Details
          </p>
        </div>

        <div className="mt-4 d-flex flex-column gap-4">
          <div>
            <h3 className="fw-semibold mb-3 fs-6">Contact Information</h3>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Contact Person:</span>
                <span>{selectedVendor.contact_person || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Email:</span>
                <span>{selectedVendor.primary_email || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phone:</span>
                <span>{selectedVendor.phone || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Address:</span>
                <span>{selectedVendor.billing_address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="fw-semibold mb-3 fs-6">Payment Information</h3>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Terms:</span>
                <span>{selectedVendor.payment_terms || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Method:</span>
                <span>{selectedVendor.preferred_payment_method || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Status:</span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: isActive ? "#115434ff" : "#842029",
                    backgroundColor: isActive ? "#dbfeeeff" : "#f8d7da",
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VendorsView() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [sortField, setSortField] = useState("company_name");
  const [sortDirection, setSortDirection] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  //  const employerEmail = "marketing@4spheresolutions.com";

  const { user } = useAuth();
  const employerEmail = user?.email;

  const VENDOR_MANAGEMENT_BASE_URL = "https://fetch-update-employee-vendors-v3-305451280005.us-east1.run.app";

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, vendors, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rowsPerPage, vendors.length]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        VENDOR_MANAGEMENT_BASE_URL,
        {
          action: "get_all_vendors",
          employer_email: employerEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Origin: window.location.origin,
          },
        }
      );

      if (res.data?.status === "success" && res.data.vendors) {
        const vendorsArray = Object.values(res.data.vendors || {});
        setVendors(vendorsArray);
      } else {
        setVendors([]);
      }
    } catch (e) {
      toast.error("Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.company_name || "").toLowerCase().includes(q) ||
          (v.primary_email || "").toLowerCase().includes(q) ||
          (v.contact_person || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((v) => !!v.is_active === isActive);
    }

    filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";
      switch (sortField) {
        case "company_name":
          aValue = a.company_name || "";
          bValue = b.company_name || "";
          break;
        default:
          return 0;
      }
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    setFilteredVendors(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const statText = useMemo(
    () => `Showing ${filteredVendors.length} of ${vendors.length} vendors`,
    [filteredVendors.length, vendors.length]
  );

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredVendors.slice(start, end);
  }, [filteredVendors, currentPage, rowsPerPage]);

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className="mb-3">
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <Building2 size={25} /> Vendors
        </h3>
        <div className="text-muted">Manage vendor relationships for invoicing and payments</div>
      </div>

      <div className="card mb-4" style={{ borderColor: "#e6eef8" }}>
        <div className="card-body" style={{ borderColor: "#e6eef8" }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <div className="position-relative d-flex align-items-center">
                <Search className={`${styles.icon}`} size={16} />
                <input
                  className="searchInputGlobal"
                  style={{ paddingLeft: "33px", minHeight: "41.6px" }}
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select searchInputGlobal"
                style={{ minHeight: "41.6px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <div className="small text-muted">{statText}</div>
            <div className="col-12 col-md-4 d-flex justify-content-md-end">
              <button className="btn btn-outline-secondary d-inline-flex align-items-center" onClick={clearFilters}>
                <Filter size={16} className="me-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: "#e6e6e6" }}>
        <div className="card-body p-0">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {searchQuery || statusFilter !== "all" ? "No vendors found matching your filters." : "No vendors found."}
            </div>
          ) : (
            <>
              <div className={`table-responsive ${styles.responsiveWrap}`}>
                <table className={`table table-hover`}>
                  <thead>
                    <tr className="nowrap" style={{ borderColor: "#eaeaea" }}>
                      <th
                        // onClick={() => handleSort("company_name")}
                        className="text-nowrap"
                        style={{ background: "#f9f9f9", padding: "15px 10px" }}
                      >
                        <span className="d-inline-flex align-items-center gap-2">
                          Company Name
                          {/* {sortField === "company_name" &&
                            (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)} */}
                        </span>
                      </th>
                      <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Contact Person</th>
                      <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Contact</th>
                      <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Address</th>
                      <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Status</th>
                      <th style={{ background: "#f9f9f9", padding: "15px 10px" }}>Payment Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVendors.map((vendor, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setDetailsSheetOpen(true);
                        }}
                        style={{ cursor: "pointer", borderColor: "#eaeaea" }}
                      >
                        <td style={{ paddingTop: "15px" }} data-label="Company Name" className="fw-medium">
                          {vendor.company_name || "N/A"}
                        </td>
                        <td style={{ paddingTop: "15px" }} data-label="Contact Person" className="small">
                          {vendor.contact_person || "N/A"}
                        </td>
                        <td style={{ paddingTop: "15px" }} data-label="Contact" className="small">
                          {vendor.primary_email && <div>{vendor.primary_email}</div>}
                          {vendor.phone && <div className="text-muted">{vendor.phone}</div>}
                          {!vendor.primary_email && !vendor.phone && <div>N/A</div>}
                        </td>
                        <td style={{ paddingTop: "15px" }} data-label="Address" className="small text-muted">
                          {vendor.billing_address || "N/A"}
                        </td>
                        <td style={{ paddingTop: "15px" }} data-label="Status">
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: vendor.is_active ? "#115434ff" : "#842029",
                              backgroundColor: vendor.is_active ? "#dbfeeeff" : "#f8d7da",
                            }}
                          >
                            {vendor.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ paddingTop: "15px" }} data-label="Payment Terms" className="small">
                          {vendor.payment_terms || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-3">
                <CustomPagination
                  alltotalrecords={filteredVendors.length}
                  currentPage={currentPage}
                  setCurrentPage={(val) => setCurrentPage(val)}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={(val) => setRowsPerPage(val)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <VendorDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        selectedVendor={selectedVendor || {}}
      />

      <Themeloader show={loading} />
    </div>
  );
}
