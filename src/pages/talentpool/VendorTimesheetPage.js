import React, { useState } from "react";
import styles from "./css/VendorTimesheetPage.module.css";
import Monthlytimesheets from "./MonthlyTimesheet";
import InvoiceHistory from "./InvoiceHistory";

function VendorTimesheetPage(props) {
  const { candidateDetails, disabled } = props;

  const [activeTab, setActiveTab] = useState("timesheets");

  const renderTabs = () => {
    return (
      <div className={styles["tabs-container"]} role="tablist" aria-orientation="horizontal" tabIndex="0">
        <button
          type="button"
          className={`${styles["tab-button"]} ${activeTab === "timesheets" ? styles["active"] : ""}`}
          tabIndex={activeTab === "timesheets" ? 0 : -1}
          onClick={() => setActiveTab("timesheets")}
        >
          Timesheets
        </button>

        <button
          type="button"
          className={`${styles["tab-button"]} ${activeTab === "invoices" ? styles["active"] : ""}`}
          tabIndex={activeTab === "invoices" ? 0 : -1}
          onClick={() => setActiveTab("invoices")}
        >
          Invoice History
        </button>
      </div>
    );
  };

  const renderTabsData = () => {
    let obj = {
      timesheets: Monthlytimesheets,
      invoices: InvoiceHistory,
    };

    let ActiveTab = obj[activeTab];

    return <ActiveTab {...props} />;
  };

  return (
    <div>
      {renderTabs()}
      {renderTabsData()}
    </div>
  );
}

export default VendorTimesheetPage;
