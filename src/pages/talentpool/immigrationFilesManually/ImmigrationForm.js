import { useState, useEffect } from "react";
import styles from "../css/NewCandidateModal.module.css";
import OverviewImmigration from "./OverviewImmigration";
import VisaDetailsImmigration from "./VisaDetailsImmigration";
import PassportEntryImmigration from "./PassportEntryImmigration";
import TravelImmigration from "./TravelImmigration";
import PetitionImmigration from "./PetitionImmigration";
import DocumentImmigration from "./DocumentImmigration";
import { ArrowLeft, Pen, Save, X, Globe, FileText, TriangleAlert, Plane, History } from "lucide-react";

import { ThemeLoader } from "../../../components";

const ImmigrationForm = ({ candidateData }) => {
  const [innerActiveTab, setInnerActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [immigrationData, setImmigrationData] = useState([]);
  const [immigrationLoading, setImmigrationLoading] = useState(false);

  const otherTabs = [
    {
      id: 1,
      name: "Overview",
      icon: Globe,
      isCustom: "Overview",
    },
    {
      id: 2,
      name: "Visa Details",
      icon: FileText,
      isCustom: "VisaDetails",
    },
    {
      id: 3,
      name: "Passport & Entry",
      icon: FileText,
      isCustom: "PassportEntry",
    },
    {
      id: 4,
      name: "Travel",
      icon: Plane,
      isCustom: "TravelComponent",
    },
    {
      id: 5,
      name: "Petitions",
      icon: History,
      isCustom: "PetitionComponent",
    },
    {
      id: 6,
      name: "Documents",
      icon: FileText,
      isCustom: "DocumentComponent",
    },
  ];

  let innerTabs = otherTabs;

  const activeInnerTabData = innerTabs.find((tab) => tab.id === innerActiveTab);

  useEffect(() => {
    getImmigrationInfo();
  }, []);

  const getImmigrationInfo = async () => {
    setImmigrationLoading(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "get-immigration-info",
          // emailid: user?.email,
          emailid: "marketing@4spheresolutions.com",
          // employee_email: candidateData.primary_email,
          employee_email: "muni.k0892@gmail.com",
        }),
      });

      const data = await response.json();
      setImmigrationData(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setImmigrationLoading(false);
    }
  };

  const renderImmigrationTabs = () => {
    if (immigrationLoading) {
      return (
        <>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-0 border-l-0 border-r-0 border-b-2 border-solid border-[#502b9d] mx-auto" />
              <p className="text-sm text-muted-foreground">Loading immigration data...</p>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="!mt-3">
        {activeInnerTabData.isCustom === "Overview" && (
          <OverviewImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            isEditMode={isEditMode}
          />
        )}
        {activeInnerTabData.isCustom === "VisaDetails" && (
          <VisaDetailsImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            immigrationLoading={immigrationLoading}
            isEditMode={isEditMode}
          />
        )}
        {activeInnerTabData.isCustom === "PassportEntry" && (
          <PassportEntryImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            getImmigrationInfo={getImmigrationInfo}
            isEditMode={isEditMode}
          />
        )}
        {activeInnerTabData.isCustom === "TravelComponent" && (
          <TravelImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            getImmigrationInfo={getImmigrationInfo}
            isEditMode={isEditMode}
          />
        )}
        {activeInnerTabData.isCustom === "PetitionComponent" && (
          <PetitionImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            getImmigrationInfo={getImmigrationInfo}
            isEditMode={isEditMode}
          />
        )}
        {activeInnerTabData.isCustom === "DocumentComponent" && (
          <DocumentImmigration
            candidateDetails={candidateData}
            immigrationData={immigrationData}
            getImmigrationInfo={getImmigrationInfo}
            isEditMode={isEditMode}
          />
        )}
      </div>
    );
  };

  return (
    <div className="signatureContainer">
      <div className="my-3 !mt-2">
        <div className="flex items-center justify-content-between gap-2">
          {candidateData?.talent_status ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-[500px] border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                {candidateData?.visa_status || "N/A"}
                {console.log("tabCandidatesData", candidateData)}
              </div>
              <div className="inline-flex items-center rounded-[500px] border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                {candidateData?.immigration_status || "Pending"}
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-[#3C83F6] text-[#FFF] border-accent">
                <TriangleAlert className="lucide lucide-triangle-alert h-3 w-3 mr-1" />
                {immigrationData?.data?.alerts.length || "0"} Alert
              </div>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            {candidateData && (
              <div
                className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-background hover:text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#3c83f6] pointer"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <X size={15} strokeWidth={3} />
                    <span> Cancel </span>
                  </>
                ) : (
                  <>
                    <Pen size={14} strokeWidth={3} />
                    <span> Edit </span>
                  </>
                )}
              </div>
            )}

            {isEditMode && (
              <>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  [&_svg]:shrink-0 border border-input bg-[#7c3bed] text-[#fff] rounded-[10px] px-[10px] h-8 hover:bg-[#7c3bedea]"
                >
                  <Save size={15} strokeWidth={3} />
                  <span> {isLoading || loading ? "Loading..." : isEditMode ? "Save" : "Continue"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={`px-0 mb-0 pb-0 ${styles.tabcontentcontainerMain}`}>
        <div className={`${styles.tabinfo} ${styles.tabinfoActive}`}>
          <div className={`${styles.horizontalScroll}`}>
            <div className={styles.canFormTab}>
              {innerTabs.map((tab) => {
                let Icon = tab.icon;
                return (
                  <div
                    key={tab.id}
                    type="button"
                    onClick={() => setInnerActiveTab(tab.id)}
                    className={`d-flex gap-[6px] align-items-center ${styles.canTabBtn} ${innerActiveTab === tab.id ? styles.activeCanBtn : ""}`}
                  >
                    <Icon size={13} />
                    <p className={styles.canBtnText}>{tab.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {renderImmigrationTabs()}
      </div>

      <ThemeLoader fixed show={loading} />
    </div>
  );
};

export default ImmigrationForm;
