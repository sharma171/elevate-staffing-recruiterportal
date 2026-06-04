import React, { createContext, useState, useContext, useEffect } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [choosenCandidate, setChoosenCandidate] = useState("");
  const [candidateList, setCandidateList] = useState([]);
  const [candidateId, setCandidateId] = useState("");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [contSession, setcontSession] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const location = useLocation;
  // let hasWarningShown = false; // Flag to track if warning has been shown

  const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("sessionId", JSON.stringify(userData.global_session_id));
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("selectedEmail", JSON.stringify(""));

    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem("expiryTime", expiryTime);

    continueSession();
    setShowSessionModal(false);
    setcontSession(false);

    setTimeout(() => {
      checkAutoLogout();
    }, SESSION_DURATION);
  };

  const orgData = (OrgData) => {
    setOrganisation(OrgData);
    localStorage.setItem("Organisation", JSON.stringify(OrgData));
  };

  const checkAutoLogout = () => {
    const expiryTime = localStorage.getItem("expiryTime");
    const currentTime = Date.now();

    if (expiryTime && currentTime >= expiryTime) {
      setShowSessionModal(true);
      // if (isLoggedIn && !contSession) {
      //     startLogoutTimer();
      // }
    }
  };

  const continueSession = () => {
    const newExpiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem("expiryTime", newExpiryTime);
    setShowSessionModal(false);
  };

  const startLogoutTimer = () => {
    setTimeout(() => {
      if (isLoggedIn && !contSession) {
        logout();
      }
    }, 5000);
  };

  useEffect(() => {
    console.log("Session Modal:", showSessionModal);
    console.log("Continue Session:", contSession);

    if (showSessionModal) {
      setTimeout(() => {
        if (isLoggedIn && !contSession) {
          console.log("Starting logout timer...");
          startLogoutTimer();
        }
      }, 60000);
    }
  }, [showSessionModal, contSession]); // Added contSession in dependency array

  // **Run auto-logout check every second**
  useEffect(() => {
    const interval = setInterval(checkAutoLogout, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetSessionExpiry = () => {
    if (location.pathname !== "/" && location.pathname !== "") {
      const newExpiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem("expiryTime", newExpiryTime);
    }
  };
  // Reset timer on user activity
  useEffect(() => {
    window.addEventListener("mousemove", resetSessionExpiry);
    window.addEventListener("keydown", resetSessionExpiry);

    return () => {
      window.removeEventListener("mousemove", resetSessionExpiry);
      window.removeEventListener("keydown", resetSessionExpiry);
    };
  }, []);

  const setCandidate = (email) => {
    setChoosenCandidate(email);
    if (email) {
      localStorage.setItem("Candidate", JSON.stringify(email));
    } else {
      localStorage.removeItem("Candidate");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    setShowSessionModal(false);
    setIsLoggedIn(false);
    console.log("logged you out");
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storeEmail = localStorage.getItem("Candidate");
    const storeOrganisation = localStorage.getItem("Organisation");
    setOrganisation(JSON.parse(storeOrganisation));
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    if (storeEmail) {
      setChoosenCandidate(JSON.parse(storeEmail));
    }
  }, []);

  // resetTimer();

  return (
    <AuthContext.Provider
      value={{
        candidateDetails,
        setCandidateDetails,
        isLoggedIn,
        login,
        user,
        logout,
        choosenCandidate,
        setChoosenCandidate,
        setCandidate,
        candidateList,
        setCandidateList,
        candidateId,
        setCandidateId,
        showSessionModal,
        setShowSessionModal,
        continueSession,
        contSession,
        setcontSession,
        orgData,
        organisation,
        setOrganisation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
