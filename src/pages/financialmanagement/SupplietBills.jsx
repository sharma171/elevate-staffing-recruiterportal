import { useEffect, useState } from "react";
import styles from "./BillPayments.module.css";
import SuppliersPanel from "./SuppliersPanel";
import InvoicesPanel from "./InvoicesPanel";
import { Building } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function BillPayments() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const renderTab = () => {
    if (activeTab == "invoices") {
      return <InvoicesPanel />;
    } else {
      return <SuppliersPanel />;
    }
  };

  return (
    <div className="pt-3 pb-4 px-3 ms-md-2 px-lg-4 bg-white h-100">
      <div className={`flex-column align-items-start mb-3`}>
        <h3 className="h3 fw-bold gap-2 align-items-center d-flex">
          <Building size={25} />
          Supplier Bills
        </h3>
      </div>

      <div className="tabs_container mb-3">
        <button
          className={`tabs_button ${activeTab === "suppliers" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("suppliers")}
        >
          Suppliers
        </button>

        <button
          className={`tabs_button ${activeTab === "invoices" ? "tabs_active" : ""}`}
          onClick={() => setActiveTab("invoices")}
        >
          Invoices
        </button>
      </div>

      {renderTab()}
    </div>
  );
}
