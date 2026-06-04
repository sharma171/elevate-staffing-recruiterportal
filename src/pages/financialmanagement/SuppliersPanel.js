import React, { useEffect, useState } from "react";
import { Search, Upload, Eye, SquarePen, Plus, Filter } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./BillPayments.module.css";
import { axiosApi, CustomPagination, ThemeLoader } from "../../components";
import UploadInvoiceModal from "./UploadInvoice";
import SupplierManagementDialog from "./SupplierManagementDialog";
import { useAuth } from "../../authContext";

const SUPPLIERS_API_URL = "https://manage-supplier-invoices-api-v3-305451280005.us-east1.run.app";

export default function SuppliersPanel() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    currentPage: 1,
    rowsPerPage: 10,
  });

  const [allData, setAllData] = useState(null);
  const [suppliersData, setSuppliersData] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({ statuses: [], types: [] });

  const [loader, setLoader] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mode, setMode] = useState("create"); // "create" | "edit" | "view"

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadSupplier, setUploadSupplier] = useState(null);

  const { user } = useAuth();
  const user_email = user?.email;

  const fetchSuppliers = async () => {
    setLoader(true);
    try {
      const payload = {
        user_email: user_email,
        limit,
        offset,
        search: filters.search || undefined,
        status: filters.status || undefined,
        supplier_type: filters.type || undefined,
        action: "list_suppliers",
      };
      const result = await axiosApi.post(SUPPLIERS_API_URL, payload);
      const res = result?.data || {};
      setAllData(res);
      setSuppliersData(res.suppliers || res.data || []);
      setAvailableFilters(res.available_filters || { statuses: [], types: [] });
      setFilters((prev) => ({ ...prev, currentPage: Math.floor(offset / limit) + 1, rowsPerPage: limit }));
    } catch (error) {
      console.error("getSuppliers error:", error?.response ? error.response.data : error?.message);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch suppliers");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [offset, limit, filters.search, filters.status, filters.type]);

  const totalRecords = allData?.pagination?.total_count || allData?.total_count || 0;

  const openAdd = () => {
    setEditing(null);
    setMode("create");
    setSheetOpen(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setMode("edit");
    setSheetOpen(true);
  };

  const openView = (supplier) => {
    setEditing(supplier);
    setMode("view");
    setSheetOpen(true);
  };

  const handleSaved = (savedSupplier, savedMode) => {
    fetchSuppliers();
    if (!savedSupplier) {
    } else if (savedMode === "create") {
      setSuppliersData((prev) => [savedSupplier, ...prev]);
    } else if (savedMode === "update") {
      setSuppliersData((prev) => prev.map((p) => (p.id === savedSupplier.id ? { ...p, ...savedSupplier } : p)));
    }
    setSheetOpen(false);
    setEditing(null);
    setMode("create");
  };

  const openUpload = (supplier) => {
    setUploadSupplier(supplier);
    setUploadOpen(true);
  };

  const statusesList =
    availableFilters.statuses && availableFilters.statuses.length ? availableFilters.statuses : ["Active", "Inactive"];
  const typesList =
    availableFilters.types && availableFilters.types.length ? availableFilters.types : ["Vendor", "Customer"];
  const paymentTermsList = ["Net 15", "Net 30", "Net 45", "Net 60"];

  return (
    <div>
      <ThemeLoader show={loader} />

      <div className="card mb-4 pb-3" style={{ borderColor: "#e6eef8" }}>
        <div className="card-body pb-0" style={{ borderColor: "#e6eef8" }}>
          <div className="responsiveLayout">
            <div className="position-relative">
              <Search style={{ position: "absolute", left: 12, top: 10, opacity: 0.6 }} />
              <input
                className="form-control ps-5 searchInputGlobal"
                placeholder="Search suppliers..."
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                  setOffset(0);
                }}
              />
            </div>

            <div>
              <select
                className="form-select searchInputGlobal"
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  setOffset(0);
                }}
              >
                <option value="">All Status</option>
                {statusesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="form-select searchInputGlobal"
                value={filters.type}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, type: e.target.value }));
                  setOffset(0);
                }}
              >
                <option value="">All Types</option>
                {typesList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="gap-2 d-flex justify-content-between mt-3 px-3">
          <div className="small text-muted">
            Showing {suppliersData.length || 0} of {totalRecords} Suppliers
          </div>

          <div className="gap-2 d-flex flex-wrap justify-content-end">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center"
                onClick={() => {
                  setFilters({ ...filters, search: "", status: "", type: "" });
                  setOffset(0);
                }}
              >
                <Filter size={16} className="me-2" />
                Clear Filters
              </button>
            </div>

            <button className="themeButton themeButtonHover rounded py-2 nowrap" onClick={openAdd}>
              <Plus size={16} className="me-1" /> Add Supplier
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: "#e6e6e6" }}>
        <div className="table-responsive">
          <table className={`table table-hover ${styles.table}`}>
            <thead className="table-light">
              <tr style={{ background: "#f8f8f8", borderColor: "#eaeaea" }}>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Company
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Type
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Contact
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Location
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Payment Terms
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold">
                  Status
                </th>
                <th style={{ background: "#f9f9f9", padding: "15px 10px" }} className="nowrap fw-bold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {suppliersData.length ? (
                suppliersData.map((s, index) => {
                  return (
                    <tr key={index} style={{ borderColor: "#eaeaea" }}>
                      <td style={{ paddingTop: "15px" }}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle themeColor d-flex align-items-center justify-content-center"
                            style={{ width: 40, height: 40, background: "#f3f3f3ff" }}
                          >
                            <strong style={{ fontSize: 12 }}>
                              {(s.company_name || "")
                                .split(" ")
                                .slice(0, 2)
                                .map((w) => (w ? w[0] : ""))
                                .join("")
                                .toUpperCase()}
                            </strong>
                          </div>

                          <div>
                            <div className="fw-medium">{s.company_name}</div>
                            <div className="text-muted small">{s.supplier_code}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ paddingTop: "15px" }}>
                        <span className="badge bg-light text-dark">{s.supplier_type || s.type}</span>
                      </td>

                      <td style={{ paddingTop: "15px" }}>
                        {s.email && (
                          <div className="text-truncate" style={{ maxWidth: 220 }}>
                            {s.email}
                          </div>
                        )}
                        {s.phone && <div className="text-muted small">{s.phone}</div>}
                      </td>

                      <td style={{ paddingTop: "15px" }}>
                        {s.city || s.state || s.postal_code ? (
                          <div>
                            <div className="fw-medium font14">
                              {s.city ? s.city + ", " : ""} {s.state}{" "}
                            </div>
                            <div className="text-muted small">{s.postal_code}</div>
                          </div>
                        ) : (
                          <div className="ms-3">—</div>
                        )}
                      </td>
                      <td style={{ paddingTop: "15px" }}>{s.payment_terms || "—"}</td>

                      <td style={{ paddingTop: "15px" }}>
                        <span className={`${s.is_active ? "activeBadge" : "inactiveBadge"}`}>
                          {s.is_active ? "Active" : "In Active"}
                        </span>
                      </td>

                      <td style={{ paddingTop: "15px" }} className="text-center">
                        <div className="d-flex justify-content-center gap-3 ">
                          <div className="pointer" title="Upload Invoice" onClick={() => openUpload(s)}>
                            <Upload size={16} />
                          </div>

                          <div className="pointer" title="View" onClick={() => openView(s)}>
                            <Eye size={16} />
                          </div>

                          <div className="pointer" title="Edit" onClick={() => openEdit(s)}>
                            <SquarePen size={16} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No suppliers returned from API.
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
              setFilters((prev) => ({ ...prev, currentPage: page }));
            }}
            rowsPerPage={limit || 10}
            setRowsPerPage={(newLimit) => {
              const newOffset = Math.floor(offset / newLimit) * newLimit;
              setFilters((prev) => ({ ...prev, rowsPerPage: newLimit }));
              setLimit(newLimit);
              setOffset(newOffset);
            }}
          />
        </div>
      </div>

      <SupplierManagementDialog
        isActive={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
          setMode("create");
        }}
        editing={editing}
        mode={mode}
        onSaved={handleSaved}
      />

      <UploadInvoiceModal data={uploadSupplier} isActive={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
