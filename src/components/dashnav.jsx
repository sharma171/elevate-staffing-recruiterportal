import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./css/Dashnav.module.css";
import "./css/powerdBY.css";
import images from "../assets/images/new";
import { useAuth } from "../authContext";
import LogoutModal from "./LogoutModal";
import api from "../networking/api";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import {
  Bot,
  Briefcase,
  Building,
  Building2,
  DollarSign,
  FileStack,
  FileText,
  Landmark,
  Menu,
  Receipt,
  TrendingUp,
  X,
} from "lucide-react";
import ProfileLogoComponent from "./ProfileComponent";

const {
  active_interviews,
  EngagemenntHubDashboard,
  details,
  graph,
  pool,
  rates,
  recruiter_analysis,
  search_user,
  vendor_group,
  botIcon,
  taskIcon,
  hrConnect,
} = images;

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);
  return data;
}

const permitions = getPermissions();

let breakpoint = 768;
let tanbreakpoint = 1080;

let isMobile = typeof window !== "undefined" && window.innerWidth <= breakpoint;
let isTablet = typeof window !== "undefined" && window.innerWidth <= tanbreakpoint;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSubmenuIndex, setActiveSubmenuIndex] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [permissions, setPermissions] = useState(permitions || { modules: {} });
  const [loading, setloading] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(isMobile);
  const sidebarRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [showSideBar, setShowSideBar] = useState(isMobile);
  const { logout, user, showSessionModal, continueSession, setcontSession, organisation } = useAuth();
  const [isLogout, setIslogout] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);

  const [dashboardPath, setDashboardPath] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (/^\/dashboard\/[^/]+(\/.*)?$/.test(path)) {
      setDashboardPath(path);
    } else {
      setDashboardPath(false);
    }
  }, [location.pathname]);

  const timeoutRef = useRef(null);

  let isEmployee = String(localStorage.getItem("userType")).toLowerCase() === "employee";

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
  let isEngAddon = addOns.includes("EH");
  let isFinancialAddon = addOns.includes("FM");

  let sideBarDivWidth = sidebarRef?.current?.offsetWidth || 0;

  useEffect(() => {
    const node = sidebarRef.current;
    if (!node) return;

    sidebarRef.timer = null;
    sidebarRef.hovered = false;

    const onEnter = () => {
      if (sidebarRef.timer) {
        clearTimeout(sidebarRef.timer);
        sidebarRef.timer = null;
      }
      if (!sidebarRef.hovered) {
        sidebarRef.hovered = true;
      }
    };

    const onLeave = () => {
      sidebarRef.hovered = false;
      sidebarRef.timer = setTimeout(() => {
        if (!sidebarRef.hovered) {
          setIsCollapsed(true);
        }
        sidebarRef.timer = null;
      }, 2000);
    };

    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);

    return () => {
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
      if (sidebarRef.timer) {
        clearTimeout(sidebarRef.timer);
        sidebarRef.timer = null;
      }
    };
  }, []);

  useEffect(() => {
    const element = document.getElementById("dashboardSidebar");
    if (element) {
      element.style.opacity = 1;
    }
  }, [location.search, location.pathname, location.key]);

  useEffect(() => {
    setTimeout(() => {
      let newSidebarWidth = sidebarRef?.current?.offsetWidth;

      if (newSidebarWidth > 180) {
        newSidebarWidth += 20;
      }

      setSidebarWidth(newSidebarWidth || 0);
    }, 70);
  }, [isCollapsed, isMobileOrTablet, showSideBar, sideBarDivWidth]);

  useEffect(() => {
    const onResize = () => {
      setIsMobileOrTablet(window.innerWidth <= breakpoint);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  useEffect(() => {
    if (isEmployee) {
      return;
    }

    if (user?.email) {
      const payload = {
        emailid: user.email,
        operation: "get",
      };
      setloading(true);
      api
        .Permissions(payload)
        .then((res) => {
          setloading(false);
          const permissionsData = {
            data: res,
            timestamp: Date.now(),
          };
          sessionStorage.setItem("permissions", JSON.stringify(permissionsData));
          setPermissions(res);
        })
        .catch((err) => {
          setloading(false);
          console.log("Error fetching permissions:", err);
        });
    }
  }, [user?.email]);

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (!user?.token) {
        navigate("/");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [user?.token]);

  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some((subItem) => subItem.path === location.pathname);
        if (hasActiveChild) setActiveSubmenuIndex(index);
      }
    });
  }, [location.pathname]);

  const handleLogout = (val) => {
    setIslogout(false);
    if (val) {
      logout();
      navigate("/");
    }
  };

  const checkRoutePermitions = (title, subTab) => {
    let userpermitions = permissions?.modules || {};

    if (!title) {
      return true;
    }

    if (subTab) {
      if (userpermitions?.[title]?.sections?.[subTab] && userpermitions?.[title]?.sections?.[subTab] != "Hide") {
        return false;
      }
      return true;
    }
    if (userpermitions?.[title]?.accessLevel && userpermitions?.[title]?.accessLevel !== "Hide") {
      return false;
    }

    return true;
  };

  let isaccessFinanceTab = !isFinancialAddon || checkRoutePermitions("financialmanagement");

  useEffect(() => {
    const t = setTimeout(() => {
      if (dashboardPath && isaccessFinanceTab) {
        navigate("/");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [dashboardPath, isaccessFinanceTab]);

  let menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: graph },
    {
      path: "/companymanagement",
      hide: checkRoutePermitions("companyManagement"),
      label: "Company Management",
      icon: details,
    },
    {
      path: "/aiassistant",
      label: "AI Assistant",
      icon: botIcon,
    },
    {
      label: "Talent Pool",
      hide: checkRoutePermitions("talentPool"),
      icon: pool,
      submenu: [
        {
          path: "/activetalent",
          label: "Active Talent",
          hide: checkRoutePermitions("talentPool", "active"),
        },
        {
          path: "/availableTalent",
          label: "Available Talent",
          hide: checkRoutePermitions("talentPool", "available"),
        },
        {
          path: "/inactivetalent",
          label: "Inactive Talent",
          hide: checkRoutePermitions("talentPool", "inactive"),
        },
        {
          path: "/pendingtalent",
          label: "Pending Talent",
          hide: checkRoutePermitions("talentPool", "pending"),
        },
      ],
    },
    {
      path: "/rateCandidates",
      hide: checkRoutePermitions("rateConfirmations"),
      label: "Rate Confirmations",
      icon: rates,
    },
    {
      path: "/activeInterviews",
      hide: checkRoutePermitions("activeInterviews"),
      label: "Ongoing Interviews",
      icon: active_interviews,
    },
    {
      path: "/dashboard/financialmanagement",
      hide: !isFinancialAddon || checkRoutePermitions("financialmanagement"),
      label: "Financial Management",
      redirect: true,
      iconSVG: <DollarSign className={styles.icon} style={{ color: "#0b4da1" }} />,
    },

    {
      path: "/jobSearch",
      hide: checkRoutePermitions("jobDiscoverySuite"),
      label: "Job Discovery Suite",
      icon: search_user,
    },
    {
      path: "/aiagents",
      hide: false,
      label: "AI Assistants",
      iconSVG: <Bot className={styles.icon} style={{ color: "#0b4da1" }} />,
    },
    {
      path: "/recruiterAnalysis",
      hide: checkRoutePermitions("recruiterAnalysis"),
      label: "Recruiter Analysis",
      icon: recruiter_analysis,
    },
    {
      path: "/vendorDirectory",
      hide: !hasVD || checkRoutePermitions("vendorDirectory"),
      label: "Vendor Directory",
      icon: vendor_group,
    },
    {
      path: "/myAssignedCandidates",
      label: "Engagement Hub",
      hide: !isEngAddon || checkRoutePermitions("engagementHub"),
      icon: EngagemenntHubDashboard,
    },
    {
      path: "/hrtickets",
      label: "HR Tickets",
      hide: checkRoutePermitions("hr_tickets"),
      iconSVG: <FileText className={styles.icon} style={{ color: "#0b4da1" }} />,
    },
  ];

  if (dashboardPath) {
    menuItems = [
      { heading: "Financial Management", headingStyle: { textAlign: "center", fontSize: "20px", marginTop: "-14px" } },

      { path: "/dashboard/financialmanagement", label: "Dashboard", icon: graph },
      { sectionsBreak: true },

      { heading: "Banking", message: "" },
      {
        path: "/dashboard/financialmanagement/banking",
        label: "Banking",
        iconSVG: <Landmark size={17} style={{ color: "#0b4da1" }} />,
      },

      { heading: "Receivables", message: "Money Coming In" },
      {
        path: "/dashboard/financialmanagement/invoiceshistory",
        label: "Invoices History",
        iconSVG: <Receipt size={17} style={{ color: "#0b4da1" }} />,
      },
      {
        path: "/dashboard/financialmanagement/custominvoices",
        label: "Custom Invoices",
        iconSVG: <FileStack size={17} style={{ color: "#0b4da1" }} />,
      },
      {
        path: "/dashboard/financialmanagement/vendors",
        label: "Vendors",
        iconSVG: <Building2 size={17} style={{ color: "#0b4da1" }} />,
      },
      {
        path: "/dashboard/financialmanagement/paymentsreceived",
        label: "Payments Received",
        iconSVG: <DollarSign size={17} style={{ color: "#0b4da1" }} />,
      },

      { heading: "Payables", message: "Money Going Out" },

      {
        path: "/dashboard/financialmanagement/billsoverview",
        label: "Bills Overview",
        iconSVG: <Receipt size={17} style={{ color: "#0b4da1" }} />,
      },
      // {
      //   path: "/dashboard/financialmanagement/billhistory",
      //   label: "Bill History",
      //   iconSVG: <History size={17} style={{ color: "#0b4da1" }} />,
      // },
      // {
      //   path: "/dashboard/financialmanagement/paymentsmade",
      //   label: "Payments Made",
      //   iconSVG: <CreditCard size={17} style={{ color: "#0b4da1" }} />,
      // },

      {
        path: "/dashboard/financialmanagement/supplierbills",
        label: "Supplier Bills",
        iconSVG: <Building size={17} style={{ color: "#0b4da1" }} />,
      },
      {
        path: "/dashboard/financialmanagement/organizationexpenses",
        label: "Organization Expenses",
        iconSVG: <TrendingUp size={17} style={{ color: "#0b4da1" }} />,
      },
    ];
  }

  if (isEmployee) {
    menuItems = [
      { path: "/dashboard", label: "Dashboard", icon: graph },
      { path: "/myprofile", label: "My Profile", iconClass: "personIcon" },
      {
        path: "/activejobs",
        label: "Active Jobs",
        iconSVG: <Briefcase className={styles.icon} style={{ color: "#0b4da1" }} />,
      },
      { path: "/documents", label: "Documents", iconClass: "documents-fill" },
      { path: "/monthlytimesheets", label: "Monthly Timesheets", iconClass: "calender-solid" },
      { path: "/mytask", label: "My Tasks", icon: taskIcon },
      { path: "/weeklystatus", label: "Weekly Status", iconClass: "monitoring" },
      {
        path: "/hrtickets",
        label: "HR Tickets",
        iconSVG: <FileText className={styles.icon} style={{ color: "#0b4da1" }} />,
      },
      { path: "/contacthr", label: "Contact HR", icon: hrConnect },
    ];
  }

  let renderMobileView = () => {
    if (!isMobileOrTablet) return null;
    return (
      <div
        id="sidenavDoc"
        className={`d-flex ${styles.sidePopupmobile}`}
        style={{ left: sidebarWidth + "px" }}
        onClick={() => {
          setIsCollapsed(false);
          setShowSideBar(!showSideBar);
        }}
      >
        {showSideBar ? (
          <FaAngleDoubleLeft
            className="my-auto ms-auto"
            style={{
              color: "white",
              fontWeight: "bolder",
              fontSize: "18px",
            }}
          />
        ) : (
          <FaAngleDoubleRight
            className="my-auto ms-auto"
            style={{
              color: "white",
              fontWeight: "bolder",
              fontSize: "18px",
            }}
          />
        )}
      </div>
    );
  };

  if (!showSideBar && isMobileOrTablet) {
    return renderMobileView();
  }

  const handleMenuMouseEnter = () => {
    if (!isMobileOrTablet && !isTablet && isCollapsed) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setMenuHovered(true);
    }
  };

  const handleMenuMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      setMenuHovered(false);
      timeoutRef.current = null;
    }, 500);
  };

  return (
    <div
      ref={sidebarRef}
      id="dashboardSidebar"
      className={`${styles.sidebar} ${menuHovered ? styles.menuHovered : ""} ${isCollapsed ? styles.collapsed : ""} ${
        styles.SideDash
      } SideDash`}
    >
      {renderMobileView()}
      <div
        onMouseLeave={handleMenuMouseLeave}
        className={`${styles.sidebarFixed} ${menuHovered ? styles.sidebarFixedopen : styles.sidebarFixedClose}`}
      >
        {isTablet ? (
          <div
            style={{
              marginBottom: isCollapsed ? "5px" : "15px",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #93939342",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                marginLeft: "5px",
              }}
              className="hover-pointer pb-2"
              onClick={() => {
                const content = document.getElementById("mainContentArea");
                if (content) {
                  content.style.overflow = "hidden";
                  setTimeout(() => {
                    content.style.overflow = "";
                  }, 1000);
                }
                if (menuHovered) {
                  setMenuHovered(false);
                  setIsCollapsed(true);
                } else {
                  setIsCollapsed((s) => !s);
                }
              }}
            >
              {isCollapsed && !menuHovered ? (
                <div
                  title="Menu"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "36px",
                  }}
                  className="pointer rounded"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dfdfdfff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Menu
                    className="p-1 rounded"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dfdfdfff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    size={35}
                    color="#073276"
                  />
                </div>
              ) : (
                <>
                  <div
                    className="pointer rounded"
                    title="Close"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "36px",
                    }}
                  >
                    <X
                      className="p-1 rounded"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dfdfdfff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      size={35}
                      color="#073276"
                    />
                  </div>

                  <span className="mx-auto" style={{ fontSize: "14px" }}>
                    Collapse
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className={styles.menu} onMouseEnter={handleMenuMouseEnter}>
          {menuItems.map((item, index) => {
            if (item.hide) return null;
            let isactive = activeSubmenuIndex === index;

            if (item.sectionsBreak) {
              return <div className="w-100 border-bottom my-2 mt-3"></div>;
            }

            if (item.heading) {
              return (
                <div className="p-2 my-2">
                  <div className="themeColor fw-bold" style={item.headingStyle || {}}>
                    {!isCollapsed || menuHovered ? item.heading : ""}
                  </div>
                  <div className="fontgray font12">{!isCollapsed || menuHovered ? item.message : ""}</div>
                </div>
              );
            }
            return item.submenu ? (
              <div key={index} className={`mb-1 ${styles.menuItem} ${isactive ? styles.activesubmenu : ""}`}>
                <button
                  className={`${styles.menuBtn} ${styles.menuBtnDropDown} ${isactive ? styles.menubtnactive : ""}`}
                  onClick={() => {
                    setActiveSubmenuIndex(isactive ? null : index);
                    if (!menuHovered) {
                      setIsCollapsed(false);
                    }
                  }}
                >
                  <div className={styles.dropdownbtn} title={item.label}>
                    <div className={styles.icondiv}>
                      <img className={styles.icon} src={item.icon} alt={item.label} />
                    </div>
                    {(!isCollapsed || menuHovered) && <div>{item.label}</div>}
                  </div>
                  {(!isCollapsed || menuHovered) && (
                    <span
                      className={`${styles["material-symbols--arrow-drop-down-rounded"]} ${
                        isactive ? styles.reverse : ""
                      }`}
                    ></span>
                  )}
                </button>

                <div
                  className={`${styles.submenuContainer} ${
                    isactive && (!isCollapsed || menuHovered) ? styles.open : ""
                  }`}
                  style={
                    (isCollapsed || !menuHovered) && !activeSubmenuIndex
                      ? { padding: "0px", marginBottom: "-4px", marginTop: "-4px" }
                      : {}
                  }
                >
                  <div className={`${styles.submenu} ${menuHovered ? "d-block" : ""}`}>
                    {item.submenu.map((subItem, subIndex) => {
                      if (subItem.hide) {
                        return <></>;
                      }
                      return (
                        <button
                          title={subItem.label}
                          key={subIndex}
                          className={`${styles.submenuItem} ${
                            location.pathname === subItem.path ? styles.activeChild : ""
                          }`}
                          onClick={(e) => {
                            if (isMobileOrTablet && !menuHovered) {
                              setIsCollapsed(!isCollapsed);
                            }
                            navigate(subItem.path);
                          }}
                        >
                          {subItem.label}
                          <div className={styles.activePulse} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <button
                key={index}
                className={`${styles.menuBtn} ${location.pathname === item.path ? styles.active : ""}`}
                onClick={(e) => {
                  if (item.redirect) {
                    window.open(item.path, "_blank");
                    return;
                  }
                  setActiveSubmenuIndex(null);
                  navigate(item.path);
                }}
              >
                <div title={item.label} className={styles.icondiv}>
                  {item?.iconSVG ? item.iconSVG : <></>}
                  {item.icon ? <img className={styles.icon} src={item.icon} alt={item.label} /> : <></>}
                  {item.iconClass ? <sapn className={`${styles.icon} ${item.iconClass}`} /> : <></>}
                </div>
                {(!isCollapsed || menuHovered) && <div>{item.label}</div>}
              </button>
            );
          })}
        </div>
        <div className="w-100 border-bottom my-2 mt-3 d-md-none d-block"></div>
        <div className="mt-2 d-md-none d-block">
          <ProfileLogoComponent sidebar isExpended={!isCollapsed || menuHovered} />
        </div>
        {/* {(!isCollapsed || menuHovered) && !dashboardPath && (
          <div className={`d-none d-md-block ${styles.helpSection}`} style={{ backgroundImage: `url("${boxBG}")` }}>
            <div className={`mb-2 ${styles.icondivcenter}`}>
              <img className={styles.icon} src={helpGreen} alt="Help" />
            </div>
            <span>Need help?</span>
            <p>Please check our docs</p>
            <button className={styles.helpBtn}>DOCUMENTATION</button>
          </div>
        )} */}
        {showSessionModal && (
          <div className={styles["modal-overlay"]}>
            <div className={styles.modal}>
              <h2>Session is Expiring</h2>
              <p>Session expiring soon. Continue?</p>
              <div className={styles["button-group"]}>
                <button
                  className={styles["continue-btn"]}
                  onClick={() => {
                    continueSession();
                    setcontSession(true);
                  }}
                >
                  Continue
                </button>
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        <LogoutModal show={isLogout} callback={handleLogout} />
      </div>
    </div>
  );
};

export default Sidebar;
