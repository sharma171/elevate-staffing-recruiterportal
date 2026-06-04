import React, { useEffect, useRef, useState } from "react";
import OverlayModal from "../../components/OverlayModal";
import styles from "./css/Permitions.module.css";
import images from "../../assets/images/new";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { SelectPicker } from "rsuite";
import { useAuth } from "../../authContext.jsx";
import ThemeLoader from "../../components/ThemeLoader.jsx";
import { RiPieChart2Fill } from "react-icons/ri";
import { DollarSign } from "lucide-react";

const { recruiter_analysis, vendor_group, activeInterviews } = images;

const initialPermissions = {
  emailid: "user@example.com",
  operation: "save",
  modules: {},
};

const defaultAdminPernitionsData = {
  emailid: "user@example.com",
  operation: "save",
  modules: {
    dashboard: {
      filterAccess: "All",
    },
    activeInterviews: {
      accessLevel: "View",
      filterAccess: "All",
    },
    companyManagement: {
      accessLevel: "View",
    },
    engagementHub: {
      accessLevel: "View",
    },
    hr_tickets: {
      accessLevel: "View",
    },
    jobDiscoverySuite: {
      accessLevel: "View",
      filterAccess: "All",
    },
    rateConfirmations: {
      accessLevel: "View",
      filterAccess: "All",
    },
    recruiterAnalysis: {
      accessLevel: "View",
      filterAccess: "All",
    },
    talentPool: {
      accessLevel: "View",
      filterAccess: "All",
      sections: {
        contact: "Hide",
        active: "Hide",
        available: "View",
        inactive: "View",
        documents: "Resume Only",
        pending: "Edit",
        weekly_status: "Edit",
        invoice: "Edit",
        projects: "Edit",
        onboarding: "Edit",
      },
    },
    vendorDirectory: {
      accessLevel: "View",
    },
    financialmanagement: {
      accessLevel: "View",
    },
    taskboard: {
      accessLevel: "Edit",
    },
  },
};

const defaultSUperAdminPernitionsData = {
  emailid: "user@example.com",
  operation: "save",
  modules: {
    dashboard: {
      filterAccess: "All",
    },
    activeInterviews: {
      accessLevel: "Edit",
      filterAccess: "All",
    },
    companyManagement: {
      accessLevel: "Edit",
    },
    engagementHub: {
      accessLevel: "Edit",
    },
    hr_tickets: {
      accessLevel: "Edit",
    },
    jobDiscoverySuite: {
      accessLevel: "Edit",
      filterAccess: "All",
    },
    rateConfirmations: {
      accessLevel: "Edit",
      filterAccess: "All",
    },
    recruiterAnalysis: {
      accessLevel: "Edit",
      filterAccess: "All",
      sections: {
        aiAnalysis: "Edit",
      },
    },
    talentPool: {
      accessLevel: "Edit",
      filterAccess: "All",
      sections: {
        contact: "Edit",
        active: "Edit",
        available: "Edit",
        inactive: "Edit",
        documents: "Edit",
        pending: "Edit",
        weekly_status: "Edit",
        invoice: "Edit",
        projects: "Edit",
        onboarding: "Edit",
      },
    },
    vendorDirectory: {
      accessLevel: "Edit",
    },
    financialmanagement: {
      accessLevel: "Edit",
    },
    taskboard: {
      accessLevel: "Edit",
    },
  },
};

const defaultRecuiterPernitionsData = {
  emailid: "user@example.com",
  role: "recruiter",
  operation: "save",
  modules: {
    dashboard: {
      filterAccess: "Assigned",
    },
    talentPool: {
      accessLevel: "View",
      filterAccess: "Assigned",
      sections: {
        contact: "Hide",
        active: "Hide",
        available: "View",
        inactive: "Hide",
        documents: "Resume Only",
        pending: "Hide",
        weekly_status: "Hide",
        invoice: "Hide",
        projects: "View",
        onboarding: "View",
      },
    },
    taskboard: {
      accessLevel: "Hide",
    },
    activeInterviews: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    companyManagement: {
      accessLevel: "Hide",
    },
    engagementHub: {
      accessLevel: "View",
    },
    hr_tickets: {
      accessLevel: "Hide",
    },
    jobDiscoverySuite: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    rateConfirmations: {
      accessLevel: "View",
      filterAccess: "Assigned",
    },
    recruiterAnalysis: {
      accessLevel: "View",
      filterAccess: "Assigned",
      sections: {
        aiAnalysis: "Edit",
      },
    },
    vendorDirectory: {
      accessLevel: "View",
    },
    financialmanagement: {
      accessLevel: "Hide",
    },
  },
};

function PermissionsModal({ show, setShow, update }) {
  const [defaultPermitions, setdefaultPermitions] = useState(initialPermissions);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [loading, setloading] = useState(false);

  const pickerRef = useRef(null);
  const { user } = useAuth();

  const orgData = (() => {
    try {
      let data = JSON.parse(localStorage.getItem("Organisation")) || {};
      return data?.org_data?.[0] || {};
    } catch {
      return {};
    }
  })();

  let rawAddOns = orgData?.add_ons;

  let addOns = [];
  if (Array.isArray(rawAddOns)) {
    addOns = rawAddOns;
  } else if (typeof rawAddOns === "string") {
    try {
      addOns = JSON.parse(rawAddOns);
    } catch {
      addOns = rawAddOns.replace(/[\[\]\s]/g, "").split(",");
    }
  }

  let hasVD = addOns.includes("VD");
  let isINVAddon = addOns.includes("INV");
  let isEmgAddon = addOns.includes("EH");
  let isFinancialAddon = addOns.includes("FM");
  let isPJAddon = addOns.includes("PJ");
  let userRole = user?.user_role;

  useEffect(() => {
    if (permissions.role != defaultPermitions.role) {
      if (permissions.role == "admin") {
        setPermissions((prev) => ({
          ...prev,
          modules: structuredClone(defaultAdminPernitionsData.modules),
        }));
      } else if (permissions.role == "super admin") {
        setPermissions((prev) => ({
          ...prev,
          modules: structuredClone(defaultSUperAdminPernitionsData.modules),
        }));
      } else {
        setPermissions((prev) => ({
          ...prev,
          modules: structuredClone(defaultRecuiterPernitionsData.modules),
        }));
      }
    } else {
      setPermissions((prev) => ({
        ...prev,
        modules: structuredClone(defaultPermitions.modules),
      }));
    }

    if (!isEmgAddon) {
      handleChange("engagementHub", "accessLevel", null, "Hide");
    }

    if (!hasVD) {
      handleChange("vendorDirectory", "accessLevel", null, "Hide");
    }

    if (!isFinancialAddon) {
      handleChange("financialmanagement", "accessLevel", null, "Hide");
    }
    if (!isINVAddon) {
      handleChange("talentPool", "sections", "invoice", "Hide");
    }

    if (!isPJAddon) {
      handleChange("talentPool", "sections", "projects", "Hide");
    }
  }, [permissions.role]);

  useEffect(() => {
    const handleScroll = () => {
      if (pickerRef.current) {
        pickerRef.current.close?.();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  useEffect(() => {
    if (!show) {
      setPermissions(initialPermissions);
      setdefaultPermitions(initialPermissions);
    }
  }, [show]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getPermissions();
    }, 100);

    return () => clearTimeout(timeout);
  }, [show?.recruiter_email]);

  const printRoleArr = () => {
    let userrole = String(userRole).toLowerCase();
    let arr = {
      "super admin": [
        { label: "Super Admin", value: "super admin" },
        { label: "Admin", value: "admin" },
        { label: "Recruiter", value: "recruiter" },
      ],
      admin: [
        { label: "Admin", value: "admin" },
        { label: "Recruiter", value: "recruiter" },
      ],
      recruiter: [{ label: "Recruiter", value: "recruiter" }],
    };

    return arr[userrole] || [{ label: "Recruiter", value: "recruiter" }];
  };

  const printDocsArr = () => {
    let userrole = String(userRole).toLowerCase();

    let arr = {
      "super admin": [
        { label: "View", value: "View", icon: "visibility" },
        { label: "Edit", value: "Edit", icon: "edit_square" },
        { label: "Resume Only", value: "Resume Only", icon: "description" },
        { label: "Hide", value: "Hide", icon: "visibility_off" },
      ],
      admin: [
        { label: "Resume Only", value: "Resume Only", icon: "description" },
        { label: "Hide", value: "Hide", icon: "visibility_off" },
      ],
      recruiter: [
        { label: "Resume Only", value: "Resume Only", icon: "description" },
        { label: "Hide", value: "Hide", icon: "visibility_off" },
      ],
    };

    return (
      arr[userrole] || [
        { label: "Resume Only", value: "Resume Only", icon: "description" },
        { label: "Hide", value: "Hide", icon: "visibility_off" },
      ]
    );
  };

  const getPermissions = () => {
    if (show?.recruiter_email) {
      let payload = {
        emailid: show?.recruiter_email,
        operation: "get",
      };
      setloading(true);
      api
        .Permissions(payload)
        .then((res) => {
          setloading(false);
          if (!res?.modules || !Object.keys(res?.modules).length) {
            let newRes = structuredClone(res);

            let userRole = String(newRes.role).toLowerCase();

            if (userRole == "admin") {
              newRes.modules = structuredClone(defaultAdminPernitionsData.modules);
            } else if (userRole == "super admin") {
              newRes.modules = structuredClone(defaultSUperAdminPernitionsData.modules);
            } else {
              newRes.modules = structuredClone(defaultRecuiterPernitionsData.modules);
            }
            setPermissions(newRes);
            setdefaultPermitions(newRes);
          } else {
            setdefaultPermitions(structuredClone(res));
            setPermissions(res);
          }
        })
        .catch((err) => {
          setloading(false);
          toast.error(err.error || "Error fetching permissions");
          console.log("Error fetching permissions:", err);
        });
    }
  };

  const saveResponse = () => {
    let payload = structuredClone(permissions);
    payload.emailid = show?.recruiter_email;
    payload.operation = "save";
    setloading(true);
    api
      .Permissions(payload)
      .then((res) => {
        setloading(false);
        setShow(null);
        update?.();
        toast.success(res.message || "Error fetching permissions");
      })
      .catch((err) => {
        setloading(false);
        toast.error(err.error || "Error fetching permissions");
        console.log("Error saving permissions:", err);
      });
  };

  const handleChange = (moduleKey, fieldKey, subKey, value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      if (!updated.modules[moduleKey]) {
        updated.modules[moduleKey] = {};
      }

      if (subKey) {
        if (!updated.modules[moduleKey][fieldKey]) {
          updated.modules[moduleKey][fieldKey] = {};
        }
        updated.modules[moduleKey][fieldKey][subKey] = value;
      } else {
        updated.modules[moduleKey][fieldKey] = value;
      }
      return updated;
    });
  };

  if (!show) return null;

  const showBadge = (value) => {
    if (!value) return <> </>;

    return <div className={styles.viewBadge}>{value}</div>;
  };

  const renderSelect = (value, onChange, data, label = "", placeholder = "", disabled) => {
    return (
      <div>
        {label && <label className={`form-label d-block nowrap ${styles.label}`}>{label}</label>}{" "}
        <SelectPicker
          disabled={disabled}
          ref={pickerRef}
          data={data}
          appearance="subtle"
          placement="autoVertical"
          cleanable={false}
          searchable={false}
          className="customrsuiteselect"
          value={value}
          onChange={onChange}
          menuStyle={{ zIndex: 99999999, width: "max-content" }}
          popupContainer={() => document.body}
          renderMenuItem={(label, item) => (
            <div className="d-flex align-items-center gap-2">
              {item?.icon && (
                <span class="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  {item.icon}
                </span>
              )}
              <span>{label}</span>
            </div>
          )}
          renderValue={(value, item) => (
            <div className="d-flex align-items-center gap-2 text-dark">
              {item?.icon && (
                <span class="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  {item.icon}
                </span>
              )}
              <span>{item?.label || placeholder}</span>
            </div>
          )}
          placeholder={placeholder}
        />
      </div>
    );
  };

  const roleData = printRoleArr();

  const accessData = [
    { label: "View", value: "View", icon: "visibility" },
    { label: "Edit", value: "Edit", icon: "edit_square" },
    { label: "Hide", value: "Hide", icon: "visibility_off" },
  ];

  const returnAccessData = (removeEdit) => {
    if (removeEdit) {
      return [
        { label: "View", value: "View", icon: "visibility" },
        { label: "Hide", value: "Hide", icon: "visibility_off" },
      ];
    }

    return accessData;
  };

  const documentsData = printDocsArr();

  const filtersData = [
    { label: "All", value: "All" },
    { label: "Assigned", value: "Assigned" },
    { label: "None", value: "None" },
  ];

  const renderFiltersArr = (hideAll, hideNone) => {
    if (hideAll) {
      return [
        { label: "Assigned", value: "Assigned" },
        { label: "None", value: "None" },
      ];
    }

    if (hideNone) {
      return [
        { label: "All", value: "All" },
        { label: "Assigned", value: "Assigned" },
      ];
    }

    return filtersData;
  };

  const renderInstructionsText = (text, show) => {
    if (!show || show != "Assigned") {
      return;
    }
    return <div className={styles.instructionText}>User can only access assigned {text}</div>;
  };

  return (
    <OverlayModal isActive={show} onClose={() => setShow(false)}>
      <div className={styles.mainCOntainer} style={{ position: loading ? "relative" : "" }}>
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-start gap-2 ${styles.themeColor}`}>
            <span className="lock-check"></span>
            <div>
              <div className="fs-4">Manage Permissions for  {show.recruiter_name}</div>
              <div className={styles.normalfont}> Role & Permissions</div>
            </div>
          </div>
        </div>
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined">person</span>
            <div>Role Assignment</div>
          </div>
          <div className="my-3 w-100">
            {renderSelect(
              permissions.role,
              (value) => {
                setPermissions((prev) => ({
                  ...prev,
                  role: value,
                }));
              },
              roleData,
              "Assign Role",
              "Assign Role",
            )}
          </div>

          <div className={styles.instructionText}>
            Changing the role will update the default permissions for this user
          </div>
        </div>
        {/* Dashboard view */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <RiPieChart2Fill />
            <div>Dashboard</div>
            {showBadge(defaultPermitions?.modules?.dashboard?.filterAccess)}
          </div>

          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("cards", permissions?.modules?.dashboard?.filterAccess)}

          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.dashboard?.filterAccess,
              (value) => {
                handleChange("dashboard", "filterAccess", null, value);
              },
              renderFiltersArr(false, true),
              "",
              "Select",
            )}
          </div>
        </div>
        {/* company Management */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined">domain</span>
            <div>Company Management</div>
            {showBadge(defaultPermitions?.modules?.companyManagement?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Company Management module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions.modules.companyManagement?.accessLevel,
                (value) => {
                  handleChange("companyManagement", "accessLevel", null, value);
                },
                accessData,
                undefined,
                "Select",
                userRole == "recruiter",
              )}
            </div>
          </div>
        </div>
        {/* talent pool */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined">person</span>
            <div>Talent Pool</div>
            {showBadge(defaultPermitions?.modules?.talentPool?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Talent Pool module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions.modules.talentPool?.accessLevel,
                (value) => {
                  handleChange("talentPool", "accessLevel", null, value);
                },
                accessData,
                undefined,
                "Select",
              )}
            </div>
          </div>

          <div className={styles.sepline} />

          <div className={styles.sectionsubHeading}>Section Access</div>
          <div className={styles.formflexContainerPermission}>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.active,
                (value) => {
                  handleChange("talentPool", "sections", "active", value);
                },
                accessData,
                "Active Talents",
                "Select",
                userRole != "super admin",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.available,
                (value) => {
                  handleChange("talentPool", "sections", "available", value);
                },
                returnAccessData(userRole == "recruiter"),
                "Available Talents",
                "Select",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.inactive,
                (value) => {
                  handleChange("talentPool", "sections", "inactive", value);
                },
                accessData,
                "InActive Talents",
                "Select",
                userRole == "recruiter",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.pending,
                (value) => {
                  handleChange("talentPool", "sections", "pending", value);
                },
                accessData,
                "Pending Talents",
                "Select",
                userRole == "recruiter",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.documents,
                (value) => {
                  handleChange("talentPool", "sections", "documents", value);
                },
                documentsData,
                "Documents",
                "Select",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.taskboard?.accessLevel,
                (value) => {
                  handleChange("taskboard", "accessLevel", null, value);
                },
                accessData,
                "Task Board",
                "Select",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.weekly_status,
                (value) => {
                  handleChange("talentPool", "sections", "weekly_status", value);
                },
                accessData,
                "Weekly Status",
                "Select",
              )}
            </div>
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.onboarding,
                (value) => {
                  handleChange("talentPool", "sections", "onboarding", value);
                },
                accessData,
                "Onboarding",
                "Select",
              )}
            </div>

            {isPJAddon ? (
              <div>
                {renderSelect(
                  permissions.modules.talentPool?.sections?.projects,
                  (value) => {
                    handleChange("talentPool", "sections", "projects", value);
                  },
                  accessData,
                  "Projects",
                  "Select",
                )}
              </div>
            ) : (
              <></>
            )}
            {!isINVAddon ? (
              <div>
                {renderSelect(
                  permissions.modules.talentPool?.sections?.time_sheets,
                  (value) => {
                    handleChange("talentPool", "sections", "time_sheets", value);
                  },
                  accessData,
                  "Time Sheets",
                  "Select",
                )}
              </div>
            ) : (
              <div>
                {renderSelect(
                  permissions.modules.talentPool?.sections?.invoice,
                  (value) => {
                    handleChange("talentPool", "sections", "invoice", value);
                  },
                  accessData,
                  "Invoice",
                  "Select",
                )}
              </div>
            )}
            <div>
              {renderSelect(
                permissions.modules.talentPool?.sections?.contact,
                (value) => {
                  handleChange("talentPool", "sections", "contact", value);
                },
                accessData,
                "Contact",
                "Select",
              )}
            </div>
          </div>
          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("Talent Pool", permissions?.modules?.talentPool?.filterAccess)}
          {/* filtersData */}
          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.talentPool?.filterAccess,
              (value) => {
                handleChange("talentPool", "filterAccess", null, value);
              },
              filtersData,
              "",
              "Select",
            )}
          </div>
        </div>
        {/* rate confirmations */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined" style={{ rotate: "90deg" }}>
              build
            </span>
            <div>Rate Confirmations</div>
            {showBadge(defaultPermitions?.modules?.rateConfirmations?.accessLevel)}
          </div>
          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Rate Confirmations module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions?.modules?.rateConfirmations?.accessLevel,
                (value) => {
                  handleChange("rateConfirmations", "accessLevel", null, value);
                },
                accessData,
                "",
                "Select",
              )}
            </div>
          </div>
          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("rate confirmations", permissions?.modules?.rateConfirmations?.filterAccess)}
          {/* filtersData */}
          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.rateConfirmations?.filterAccess,
              (value) => {
                handleChange("rateConfirmations", "filterAccess", null, value);
              },
              renderFiltersArr(userRole == "recruiter"),
              "",
              "Select",
            )}
          </div>
        </div>
        {/* Job Discovery Suite */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined">data_loss_prevention</span>
            <div>Job Discovery Suite</div>
            {showBadge(defaultPermitions?.modules?.jobDiscoverySuite?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Job Discovery module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions?.modules?.jobDiscoverySuite?.accessLevel,
                (value) => {
                  handleChange("jobDiscoverySuite", "accessLevel", null, value);
                },
                accessData,
                "",
                "Select",
              )}
            </div>
          </div>

          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("Job Discovery Suite", permissions?.modules?.jobDiscoverySuite?.filterAccess)}
          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.jobDiscoverySuite?.filterAccess,
              (value) => {
                handleChange("jobDiscoverySuite", "filterAccess", null, value);
              },
              renderFiltersArr(userRole == "recruiter"),
              "",
              "Select",
            )}
          </div>
        </div>
        {/* Recruiter Analysis */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <img src={recruiter_analysis} alt="Recruiter Analysis" />
            <div>Recruiter Analysis</div>
            {showBadge(defaultPermitions?.modules?.recruiterAnalysis?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Recruiter Analysis module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions?.modules?.recruiterAnalysis?.accessLevel,
                (value) => {
                  handleChange("recruiterAnalysis", "accessLevel", null, value);
                },
                accessData,
                "",
                "Select",
              )}
            </div>
          </div>

          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Section Access</div>
          <div className={styles.formflexContainerPermission}>
            <div>
              {renderSelect(
                permissions.modules.recruiterAnalysis?.sections?.aiAnalysis,
                (value) => {
                  handleChange("recruiterAnalysis", "sections", "aiAnalysis", value);
                },
                accessData,
                "AI Analysis",
                "Select",
                userRole != "super admin",
              )}
            </div>
          </div>
          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("Recruiter Analysis", permissions?.modules?.recruiterAnalysis?.filterAccess)}
          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.recruiterAnalysis?.filterAccess,
              (value) => {
                handleChange("recruiterAnalysis", "filterAccess", null, value);
              },
              renderFiltersArr(userRole == "recruiter"),
              "",
              "Select",
            )}
          </div>
        </div>
        {/* Vendor Directory */}
        {!hasVD ? (
          <></>
        ) : (
          <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
            <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
              <img src={vendor_group} alt="Vendor Directory" />
              <div>Vendor Directory</div>
              {showBadge(defaultPermitions?.modules?.vendorDirectory?.accessLevel)}
            </div>

            <div className="d-flex align-items-center gap-2 justify-content-between">
              <div className={styles.instructionText}>Set access level for Vendor Directory module</div>

              <div style={{ minWidth: "120px" }}>
                {renderSelect(
                  permissions?.modules?.vendorDirectory?.accessLevel,
                  (value) => {
                    handleChange("vendorDirectory", "accessLevel", null, value);
                  },
                  accessData,
                  "",
                  "Select",
                )}
              </div>
            </div>
          </div>
        )}

        {/* financial management */}
        {!isFinancialAddon ? (
          <></>
        ) : (
          <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
            <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
              <DollarSign />
              <div>Financial Management</div>
              {showBadge(defaultPermitions?.modules?.financialmanagement?.accessLevel)}
            </div>

            <div className="d-flex align-items-center gap-2 justify-content-between">
              <div className={styles.instructionText}>Set access level for Financial Management module</div>

              <div style={{ minWidth: "120px" }}>
                {renderSelect(
                  permissions?.modules?.financialmanagement?.accessLevel,
                  (value) => {
                    handleChange("financialmanagement", "accessLevel", null, value);
                  },
                  accessData,
                  "",
                  "Select",
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Interviews */}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <img src={activeInterviews} alt="Vendor Directory" style={{ height: "18px" }} />

            <div>Ongoing Interviews</div>
            {showBadge(defaultPermitions?.modules?.activeInterviews?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for Ongoing Interviews module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions?.modules?.activeInterviews?.accessLevel,
                (value) => {
                  handleChange("activeInterviews", "accessLevel", null, value);
                },
                accessData,
                "",
                "Select",
              )}
            </div>
          </div>

          <div className={styles.sepline} />
          <div className={styles.sectionsubHeading}>Filter Access</div>
          {renderInstructionsText("interviews", permissions?.modules?.activeInterviews?.filterAccess)}
          <div style={{ maxWidth: "200px" }} className="mt-3">
            {renderSelect(
              permissions?.modules?.activeInterviews?.filterAccess,
              (value) => {
                handleChange("activeInterviews", "filterAccess", null, value);
              },
              renderFiltersArr(userRole == "recruiter"),
              "",
              "Select",
            )}
          </div>
        </div>
        {/* Engagement Hub */}
        {isEmgAddon ? (
          <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
            <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
              <span class="material-symbols-outlined">domain</span>
              <div>Engagement Hub</div>
              {showBadge(defaultPermitions?.modules?.engagementHub?.accessLevel)}
            </div>

            <div className="d-flex align-items-center gap-2 justify-content-between">
              <div className={styles.instructionText}>Set access level for Engagement Hub module</div>

              <div style={{ minWidth: "120px" }}>
                {renderSelect(
                  permissions?.modules?.engagementHub?.accessLevel,
                  (value) => {
                    handleChange("engagementHub", "accessLevel", null, value);
                  },
                  accessData,
                  "",
                  "Select",
                )}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className={`${styles.sectionContainer} ${styles.headerSection}`}>
          <div className={`d-flex align-items-center gap-2 ${styles.themeColor}`}>
            <span class="material-symbols-outlined">description</span>
            <div>HR Tickets</div>
            {showBadge(defaultPermitions?.modules?.hr_tickets?.accessLevel)}
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-between">
            <div className={styles.instructionText}>Set access level for HR Tickets module</div>

            <div style={{ minWidth: "120px" }}>
              {renderSelect(
                permissions?.modules?.hr_tickets?.accessLevel,
                (value) => {
                  handleChange("hr_tickets", "accessLevel", null, value);
                },
                accessData,
                "",
                "Select",
              )}
            </div>
          </div>
        </div>
        <div className="d-flex justify-end my-3 mt-4">
          <button
            className={`d-flex align-items-center gap-2 pointer themeButton`}
            type="submit"
            onClick={saveResponse}
          >
            <span class="material-symbols-outlined">save</span>
            Save
          </button>
        </div>
        <ThemeLoader show={loading} fixed />
      </div>
    </OverlayModal>
  );
}

export default PermissionsModal;
