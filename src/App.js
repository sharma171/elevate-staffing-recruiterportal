import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Mainheader from "./components/Header/Mainheader";
import LoginSignup from "./pages/loginSignUp";
import { AuthProvider, useAuth } from "./authContext";
import Dashboard from "./pages/dashboard/dashboard";
import Register from "./pages/registerCandidate";
import BenchCandidates from "./pages/benchcandidate/benchCandidates";
import RegisterCandidate from "./pages/benchcandidate/registerCandidate";
import UserProfile from "./pages/userProfile/userProfile";
import RateCandidates from "./pages/rateConfirmation/rateConfirmation";
import RateCandidatesOlder from "./pages/rateConfirmation/rateConfirmation Older";

import MyAssignedCandidates from "./pages/myAssignedCandidates/myAssignedCandidates";
import MySubmission from "./pages/mysubmission/mySubmission";
import CandidateDetails from "./pages/benchcandidate/CandidateDetails";
import CandidateDetailsEdit from "./pages/benchcandidate/CandidateDetailsEdit";
import "./pages/spinner.css";
// Added
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RecruiterAnalysis from "./pages/recruiterAnalysis/RecruiterAnalysis";
import HomePage from "./pages/Homeindex/index";
import PrivacyPolicy from "./pages/Homeindex/privacyPolicy";
import TermsofService from "./pages/Homeindex/TermsOfService";
import CookiesPolicy from "./pages/Homeindex/CookiePolicy";
import GdprCompliance from "./pages/Homeindex/GDPRPolicy";
import RecruiterAnalysisDetails from "./pages/recruiterAnalysis/RecruiterAnalysisDetails";
import { GlobalProvider } from "./globalContext";
import RoleRecruiterAnalysis from "./pages/roleRecruiterAnalysis/RoleRecruiterAnalysis";
import DetailsRecruiterAnalysis from "./pages/roleRecruiterAnalysis/DetailsRecruiterAnalysis";
import AddDetails from "./pages/recruiterDetails/AddDetails";
import EditDetails from "./pages/recruiterDetails/EditDetails";
import JobSearch from "./pages/jobSearch/JobSearch";
import ExistingJobSearch from "./pages/jobSearch/ExistingJobSearch";
import ActiveInterviews from "./pages/activeInterviews/ActiveInterviews";
import VendorDirectoryOlder from "./pages/vendorEmailFinder/VendorDirectoryPage";
import VendorDirectory from "./pages/vendorEmailFinder/VendorDirectory";
import ResetUserPassword from "./pages/userProfile/ResetPassword";
import LoginSignUp_v2 from "./pages/LoginSignUp_v2";
import OrganizationDetails from "./pages/organizatioonDetails/OrganizationDetails";
import Navbar from "./components/Navbar";
import BenchCandidatesV2 from "./pages/BenchCandidatesV2";
import OrganizationDetailsHome from "./pages/recruiterDetails/OrganizationDetailsHome";
import { ActiveTalent, AvailableTalent } from "./pages/talentpool";
import "react-datepicker/dist/react-datepicker.css";
import Companymanagement from "./pages/companymanagement/Companymanagement";
import "rsuite/dist/rsuite.min.css";
import { Aiassistant } from "./pages/aiassistant";
import {
  EMPDashboard,
  EmployeeProfile,
  Monthlytimesheets,
  Weeklytimesheet,
  MyTasks,
  Documents,
  ContactHr,
} from "./pages/employee/index";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import EmployeeloginSignUp from "./pages/EmployeeloginSignUp";
import { axiosApi, MainFooter, ThemeLoader } from "./components";
import OnBoarding from "./pages/onboarding/OnBoarding";
import Sidebar from "./components/dashnav";
import Page404 from "./pages/Page404";
import OAuthCallback from "./pages/auth/Callback";
import { callGetSession } from "./DeviceStore";
import HRTickets from "./pages/hrtickets";
import HRTicketsEmployee from "./pages/employee/hrtickets";
import Maintenance from "./pages/maintenance";
import {
  FBanking,
  FBillHistory,
  FBillPayments,
  FBillsOverview,
  FCustominvoices,
  FDashboard,
  FInvoiceDetails,
  FInvoiceEditPage,
  FInvoiceHistory,
  FOrganizationExpenses,
  FPaymentsReceivedView,
  FSchedulePayment,
  FSupplietBills,
  FVendors,
} from "./pages/financialmanagement";
import HomePageNew from "./pages/homePage";
import Products from "./pages/homePage/Products";
import Unsubscribe from "./pages/unsubscribe";
import Pricing from "./pages/homePage/Pricing";
import ActiveJobs from "./pages/employee/activejobs";
import CandidateVerificationCall from "./pages/talentpool/onboarding/CandidateVerificationCall";
import EmployerVerificationCall from "./pages/talentpool/onboarding/EmployerVerificationCall";
import SignOffer from "./pages/talentpool/onboarding/SignOffer";
import TaxFormsSign from "./pages/talentpool/onboarding/TaxFormsSign";
import AIHomePage from "./pages/aiAssistants/HomePage";
import AIOAuthCallback from "./pages/auth/Aiassistant";

const RenderSpinner = ({ setIsLoggedIn }) => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    let timer = setTimeout(() => {
      if (location.hash) {
        const el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    async function initApp() {
      if (!isLoggedIn) {
        return;
      }
      await callGetSession();
    }

    initApp();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <></>;
  }

  return (
    <>
      <Sidebar />
    </>
  );
};

function App() {
  const routesWithNavbar = ["/organizationDetails", "/benchCandidates_v2"];

  const [loginType, setLoginType] = useState("employee");
  const [width, setWidth] = useState(0);
  const [path, setPath] = useState(window.location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);

  let showNav = routesWithNavbar.some((word) => window.location.href.toLowerCase().includes(word.toLowerCase()));

  let localloginType = String(localStorage.getItem("userType")).toLowerCase();

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (sidebarRef.current) ro.observe(sidebarRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      updatePath();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      updatePath();
    };

    return () => {
      window.removeEventListener("popstate", updatePath);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    let localloginType = String(localStorage.getItem("userType")).toLowerCase();

    setTimeout(() => {
      const header = document.getElementById("siteMainHeader");
      if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty("--header-height", `${height}px`);
      }
    }, 200);

    setLoginType(localloginType);
  }, [localloginType, path]);

  useEffect(() => {
    let intervalId = null;

    const getMaintenanceDetails = async () => {
      const REQUESTURL = "https://app-maintenance-status-v3-305451280005.us-east1.run.app";
      const payload = { action: "get-status" };

      try {
        const res = await axiosApi.post(REQUESTURL, payload);
        const value = res?.data?.maintenance_mode || false;
        window.maintenance_mode = value;
        window.dispatchEvent(new CustomEvent("maintenance-change", { detail: value }));

        if (value && !intervalId) {
          intervalId = setInterval(getMaintenanceDetails, 2 * 60 * 1000);
        }

        if (!value && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        console.log(err);
        window.dispatchEvent(new CustomEvent("maintenance-change", { detail: false }));
      }
    };

    if (!isLoggedIn) {
      getMaintenanceDetails();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  const employeeRoutes = () => {
    return (
      <>
        <Route path="/dashboard" element={<EMPDashboard />} />
        <Route path="/myprofile" element={<EmployeeProfile />} />
        <Route path="/monthlytimesheets" element={<Monthlytimesheets />} />
        <Route path="/weeklystatus" element={<Weeklytimesheet />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/mytask" element={<MyTasks />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/contacthr" element={<ContactHr />} />
        <Route path="/hrtickets" element={<HRTicketsEmployee />} />
        <Route path="/activejobs" element={<ActiveJobs />} />
      </>
    );
  };

  const returnRoutes = () => {
    if (!isLoggedIn) {
      return;
    }

    if (loginType === "employee") {
      return employeeRoutes();
    }

    return (
      <>
        <Route path="/aiagents" element={<AIHomePage />} />
        <Route path="/dashboard/financialmanagement/custominvoices" element={<FCustominvoices />} />
        <Route path="/dashboard/financialmanagement/banking" element={<FBanking />} />
        <Route
          path="/dashboard/financialmanagement/supplierbills/invoice/:id/schedulepayment"
          element={<FSchedulePayment />}
        />
        <Route path="/dashboard/financialmanagement/supplierbills/invoice/:id/edit" element={<FInvoiceEditPage />} />
        <Route path="/dashboard/financialmanagement/supplierbills/invoice/:id" element={<FInvoiceDetails />} />
        <Route path="/dashboard/financialmanagement/supplierbills" element={<FSupplietBills />} />
        <Route path="/dashboard/financialmanagement/organizationexpenses" element={<FOrganizationExpenses />} />
        <Route path="/dashboard/financialmanagement/paymentsmade" element={<FBillPayments />} />
        <Route path="/dashboard/financialmanagement/billhistory" element={<FBillHistory />} />
        <Route path="/dashboard/financialmanagement/billsoverview" element={<FBillsOverview />} />
        <Route path="/dashboard/financialmanagement/paymentsreceived" element={<FPaymentsReceivedView />} />
        <Route path="/dashboard/financialmanagement/vendors" element={<FVendors />} />
        <Route path="/dashboard/financialmanagement/invoiceshistory" element={<FInvoiceHistory />} />
        <Route path="/dashboard/financialmanagement" element={<FDashboard />} />
        <Route path="/hrtickets" element={<HRTickets />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/aiassistant" element={<Aiassistant />} />
        <Route path="/availableTalent" element={<AvailableTalent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/benchcandidates" element={<BenchCandidates />} />
        <Route path="/details" element={<CandidateDetails />} />
        <Route path="/registerNewCandidates/" element={<RegisterCandidate />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/rateCandidatesolder" element={<RateCandidatesOlder />} />
        <Route path="/rateCandidates" element={<RateCandidates />} />
        <Route path="/vendorDirectoryOlder" element={<VendorDirectoryOlder />} />
        <Route path="/vendorDirectory" element={<VendorDirectory />} />
        <Route path="/myAssignedCandidates" element={<MyAssignedCandidates />} />
        <Route path="/mySubmission" element={<MySubmission />} />
        <Route path="/analysisRecruiter" element={<RoleRecruiterAnalysis />} />
        <Route path="/details" element={<CandidateDetails />} />
        <Route path="/benchcandidates/details/edit" element={<CandidateDetailsEdit />} />
        <Route path="/recruiterAnalysis" element={<RecruiterAnalysis />} />
        <Route path="/analysis" element={<RecruiterAnalysisDetails />} />
        <Route path="/detailsRecruiter" element={<DetailsRecruiterAnalysis />} />
        <Route path="/recruiterDetails" element={<OrganizationDetailsHome />} />
        <Route path="/companymanagement" element={<Companymanagement />} />
        <Route path="/addDetails" element={<AddDetails />} />
        <Route path="/editDetails" element={<EditDetails />} />
        <Route path="/jobSearch" element={<JobSearch />} />
        <Route path="exixtingJobs" element={<ExistingJobSearch />} />
        <Route path="/activeInterviews" element={<ActiveInterviews />} />
        <Route path="/resetpassword" element={<ResetUserPassword />} />
        <Route path="/employee-reset-password" element={<ResetUserPassword />} />
        <Route path="/register_v2" element={<LoginSignUp_v2 />} />
        <Route path="/organizationDetails" element={<OrganizationDetails />} />
        <Route path="/benchCandidates_v2" element={<BenchCandidatesV2 />} />
        <Route path="/activetalent" element={<ActiveTalent extraPayload={{ project_status: "in_project" }} />} />
        <Route
          path="/pendingtalent"
          element={
            <ActiveTalent
              isResend
              extraPayload={{ project_status: "pending" }}
              heading="Talent Pool / Pending Talent"
            />
          }
        />
        <Route
          path="/inactivetalent"
          element={
            <ActiveTalent
              skipFilter={true}
              extraPayload={{ exclude_active: true }}
              heading="Talent Pool / Inactive Talent"
            />
          }
        />
      </>
    );
  };

  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <GlobalProvider>
            <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
              <div className="backgroundImageApp h-100 d-flex flex-column" style={{ flex: 1 }}>
                <div className="sticky-top">
                  <Mainheader />
                </div>
                <div className="d-flex h-100" style={{ flex: 1 }}>
                  <div ref={sidebarRef}>
                    <RenderSpinner setIsLoggedIn={setIsLoggedIn} />
                  </div>
                  <div
                    id="mainContentArea"
                    style={{
                      flex: "1",
                      width: `calc(100% - ${width}px)`,
                      position: "relative",
                    }}
                  >
                    {showNav && <Navbar />}
                    <Routes>
                      <Route path="/auth/aiassistant" element={<AIOAuthCallback />} />
                      <Route path="/auth/callback" element={<OAuthCallback />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/employeelogin" element={<EmployeeloginSignUp />} />
                      <Route path="/login" element={<LoginSignup />} />
                      {/* <Route path="/" element={<HomePage />} />
                      <Route path="/requestademo" element={<HomePage isDemoOpen={true} />} /> */}
                      <Route path="/products" element={<Products />} />
                      <Route path="/" element={<HomePageNew />} />
                      <Route path="/requestademo" element={<HomePageNew isDemoOpen={true} />} />
                      <Route path="/pricing" element={<HomePageNew />} />

                      <Route path="/unsubscribe" element={<Unsubscribe />} />
                      <Route path="privacypolicy" element={<PrivacyPolicy />} />
                      <Route path="termsofservice" element={<TermsofService />} />
                      <Route path="cookiespolicy" element={<CookiesPolicy />} />
                      <Route path="/resetpassword" element={<ResetUserPassword userType={"Employer"} />} />
                      <Route path="/employee-reset-password" element={<ResetUserPassword userType={"Employee"} />} />
                      <Route path="gdprpage" element={<GdprCompliance />} />
                      <Route path="onboarding" element={<OnBoarding />} />
                      {returnRoutes()}
                      <Route path="/candidate/verification-call" element={<CandidateVerificationCall />} />
                      <Route path="/employer/verification-call" element={<EmployerVerificationCall />} />
                      <Route path="/sign/:signature" element={<SignOffer />} />
                      <Route path="/tax-forms" element={<TaxFormsSign />} />
                      <Route path="*" element={<Page404 />} />
                    </Routes>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <MainFooter />
              </div>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              closeOnClick
              pauseOnHover={false}
              rtl={false}
              theme="light"
            />
          </GlobalProvider>
        </AuthProvider>

        <ThemeLoader show={isLoading} fixed />
      </div>
    </Router>
  );
}

export default App;
