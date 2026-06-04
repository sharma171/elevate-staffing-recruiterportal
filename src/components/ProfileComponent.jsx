import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { createPortal } from "react-dom";
import ProfileLogo from "../assets/images/profile.png";
import Profileicon from "../assets/images/ProfileImg.png";
import styles from "../pages/talentpool/css/TalentPool.module.css";
import LogoutModal from "./LogoutModal";
import { ImSwitch } from "react-icons/im";

const ProfileComponent = ({ sidebar, isExpended }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const userboxRef = useRef(null);
  const popupRef = useRef(null);
  const portalRootRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 8, left: 8 });
  const [isLogout, setIslogout] = useState(false);

  const userFirstName = user?.first_name;

  const handleLogout = (val) => {
    setIslogout(false);
    if (val) {
      logout();
      navigate("/");
    }
  };

  const ensurePortalRoot = useCallback(() => {
    if (portalRootRef.current) return portalRootRef.current;
    const node = document.createElement("div");
    node.setAttribute("data-profile-portal-root", "true");
    node.style.position = "fixed";
    node.style.inset = "0";
    node.style.pointerEvents = "none";
    node.style.zIndex = "2147483647";
    document.body.appendChild(node);
    portalRootRef.current = node;
    return node;
  }, []);

  useEffect(() => {
    if (!sidebar) return;
    ensurePortalRoot();
    return () => {
      if (portalRootRef.current) {
        try {
          document.body.removeChild(portalRootRef.current);
        } catch {}
        portalRootRef.current = null;
      }
    };
  }, [sidebar, ensurePortalRoot]);

  const calculatePositionOnce = useCallback(() => {
    const anchor = userboxRef.current;
    const margin = 0;
    if (!anchor) return { top: margin, left: margin };
    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popupWidth = 280;
    const popupHeight = 200;
    let left = rect.left;
    let top = rect.bottom + margin;
    if (left + popupWidth > vw - margin) left = Math.max(margin, vw - popupWidth - margin);
    if (top + popupHeight > vh - margin) {
      const tryTop = rect.top - popupHeight - margin;
      top = tryTop >= margin ? tryTop : Math.max(margin, vh - popupHeight - margin);
    }
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    return { top, left };
  }, []);

  useEffect(() => {
    if (!sidebar) return;
    if (!open) return;
    const onPointerDown = (e) => {
      const anchor = userboxRef.current;
      const popup = popupRef.current;
      if (anchor && (anchor === e.target || anchor.contains(e.target))) return;
      if (popup && (popup === e.target || popup.contains(e.target))) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, sidebar]);

  const toggleForSidebar = () => {
    if (!open) {
      const p = calculatePositionOnce();
      setPos(p);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const onHoverOpen = () => {
    if (!sidebar) {
      setOpen(true);
    }
  };
  const onHoverClose = () => {
    if (!sidebar) {
      setOpen(false);
    }
  };

  const popupStyle = {
    pointerEvents: "auto",
    position: "fixed",
    top: pos.top,
    left: pos.left,
    minWidth: 240,
    display: "flex",
    flexDirection: "column",
    padding: "12px 16px",
    gap: 8,
    background: "#ffffff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    borderRadius: 12,
    zIndex: 2147483648,
  };

  const modalWrapperStyle = {
    pointerEvents: "auto",
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2147483650,
  };

  const portalRoot = portalRootRef.current;

  return (
    <>
      <div
        className={styles.userbox}
        ref={userboxRef}
        onClick={sidebar ? toggleForSidebar : undefined}
        onMouseEnter={!sidebar ? onHoverOpen : undefined}
        onMouseLeave={!sidebar ? onHoverClose : undefined}
        style={{ cursor: "pointer" }}
      >
        <div className="d-flex gap-2 align-items-center">
          <img src={ProfileLogo} alt="" className={styles.logoprofile} />

          {sidebar && isExpended ? (
            <div className="fw-medium h6 my-auto capitalize">{userFirstName || user?.email?.split?.("@")?.[0]}</div>
          ) : (
            ""
          )}
        </div>

        {!sidebar && (
          <div className={`${styles.profileDialog} gap-2`}>
            <div className={`listHover ${styles.topHead}`}>
              <img src={ProfileLogo} alt="" className={styles.profileIcon} />
              <span className={styles.userName}>{userFirstName || user?.email?.split?.("@")?.[0]}</span>
            </div>
            <div className={styles.divider}></div>
            <Link to="/userProfile" className={`listHover ${styles.topHead}`}>
              <img src={Profileicon} alt="" className={`rounded-circle ${styles.profileimg}`} />
              <span className={styles.userName}>View Profile</span>
            </Link>
            <Link onClick={() => setIslogout(true)} className={`listHover ps-2 ${styles.topHead}`}>
              <ImSwitch size={18} className="ms-1 themeColor" />
              <span className={styles.userName}>Logout</span>
            </Link>
          </div>
        )}
      </div>

      {sidebar && portalRoot
        ? createPortal(
            <>
              {open && (
                <div className="themeColor" style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
                  <div ref={popupRef} style={popupStyle} role="menu" aria-hidden={!open}>
                    <div className={`listHover ${styles.topHead}`}>
                      <img src={ProfileLogo} alt="" style={{ height: "40px" }} className={styles.profileIcon} />
                      <span className={`themeColor fw-semibold capitalize ${styles.userName}`}>
                        {userFirstName || user?.email?.split?.("@")?.[0]}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "1px",
                        background: "#0b4da14d",
                      }}
                      className={`w-100 ${styles.divider}`}
                    ></div>
                    <Link
                      onClick={toggleForSidebar}
                      to="/userProfile"
                      className={`themeColor text-decoration-none listHover p-2 ${styles.topHead}`}
                    >
                      <img
                        src={Profileicon}
                        alt=""
                        style={{ height: "20px" }}
                        className={`rounded-circle ${styles.profileimg}`}
                      />
                      <span className={styles.userName}>View Profile</span>
                    </Link>

                    <Link
                      onClick={() => {
                        setIslogout(true);
                        toggleForSidebar();
                      }}
                      className={`themeColor text-decoration-none listHover p-2 ${styles.topHead}`}
                    >
                      <ImSwitch size={20} />
                      <span className={styles.userName}>Logout</span>
                    </Link>
                  </div>
                </div>
              )}

              {isLogout &&
                createPortal(
                  <div style={modalWrapperStyle}>
                    <div style={{ width: "100%", maxWidth: 600, pointerEvents: "auto" }}>
                      <LogoutModal show={isLogout} callback={handleLogout} />
                    </div>
                  </div>,
                  portalRoot
                )}
            </>,
            portalRoot
          )
        : null}

      {!sidebar && <LogoutModal show={isLogout} callback={handleLogout} />}
    </>
  );
};

export default ProfileComponent;
