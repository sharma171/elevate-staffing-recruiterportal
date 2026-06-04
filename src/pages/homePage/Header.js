import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Users,
  FileCheck,
  Search,
  Send,
  DollarSign,
  Briefcase,
  Brain,
  ClipboardCheck,
  MessageSquare,
  Trophy,
  ArrowRight,
} from "lucide-react";

import { ReactComponent as LogoIcon } from "../../assets/images/elevateStaffinglogoTransparent.svg";

const productsData = {
  staffing: {
    name: "Elevate Staffing",
    tagline: "Staffing operations, compliance, vendor outreach, and finance — all in one place.",
    viewLink: "https://elevatestaffing.ai/login",
    modules: [
      {
        title: "Talent & Bench Management",
        description: "Organize Active, Available, Pending, and Inactive talent across W2 and subvendor layers.",
        link: "/products/#talent",
        icon: Users,
      },
      {
        title: "Compliance & Documents Hub",
        description: "Track visas, expirations, work authorization, contracts, and audit-ready docs.",
        link: "/products/#compliance",
        icon: FileCheck,
      },
      {
        title: "Job Discovery & Submissions",
        description: "Pull jobs from clients and vendors, submit candidates, track pipelines end-to-end.",
        link: "/products/#jobs",
        icon: Search,
      },
      {
        title: "Vendor & Engagement Hub",
        description: "Manage vendor network, send hotlists or updates via mass personalized emails.",
        link: "/products/#engagement",
        icon: Send,
      },
      {
        title: "Finance & Billing (Incoming)",
        description: "Raise invoices, track payables/receivables, connect bank accounts, auto-reconcile.",
        link: "/products/#finance",
        icon: DollarSign,
      },
    ],
  },
  recruit: {
    name: "Elevate Recruit",
    tagline: "AI-powered recruiting intelligence to screen, score, and prepare candidates before placement.",
    viewLink: "https://recruit.elevatestaffing.ai/",
    modules: [
      {
        title: "Job & Requisition Hub",
        description: "Create roles, manage intakes, centralize requirements from clients and teams.",
        link: "/products/#jobs",
        icon: Briefcase,
      },
      {
        title: "AI Resume & JD Intelligence",
        description: "Parse resumes, match to JDs, surface gaps and improvements in seconds.",
        link: "/products/#resume-ai",
        icon: Brain,
      },
      {
        title: "Screening & Shortlisting",
        description: "AI pre-ranks candidates, add recruiter notes, build shortlists for clients.",
        link: "/products/#screening",
        icon: ClipboardCheck,
      },
      {
        title: "Interview Intelligence",
        description: "Generate role-based questions, coding tests, and mock interviews.",
        link: "/products/#interview",
        icon: MessageSquare,
      },
      {
        title: "Skills & Readiness (Aspire Quest)",
        description: "Measure skills with quizzes and scenario questions before submission.",
        link: "/products/#skills",
        icon: Trophy,
      },
    ],
  },
};

function HomeHeader({ contactUsForm, customStyle = {} }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProductsMega, setShowProductsMega] = useState(false);
  const [showMobileProducts, setShowMobileProducts] = useState(false);
  const [showMobileStaffing, setShowMobileStaffing] = useState(false);
  const [showMobileRecruit, setShowMobileRecruit] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const megaMenuRef = useRef(null);
  const productsLinkRef = useRef(null);
  const loginDropdownRef = useRef(null);
  const loginButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle click outside for products mega menu
      if (
        megaMenuRef.current &&
        productsLinkRef.current &&
        !megaMenuRef.current.contains(event.target) &&
        !productsLinkRef.current.contains(event.target)
      ) {
        setShowProductsMega(false);
      }

      // Handle click outside for login dropdown
      if (
        loginDropdownRef.current &&
        loginButtonRef.current &&
        !loginDropdownRef.current.contains(event.target) &&
        !loginButtonRef.current.contains(event.target)
      ) {
        setShowLoginDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProductsMega, showLoginDropdown]);

  const handleProductsClick = (e) => {
    e.preventDefault();
    navigate("/products");
    setShowProductsMega(false);
  };

  const handleContactUs = () => {
    if (contactUsForm) {
      contactUsForm();
    }
    navigate("/requestademo?contact=true");
  };

  const handleGetStarted = () => {
    navigate("/requestademo?open=true");
  };

  const handleLogin = (type) => {
    setShowLoginDropdown(false);
    window.open(type === "employee" ? "https://employee.elevatestaffing.ai/login" : "/login", "_blank");
  };

  return (
    <div className="signatureContainer homepageFontfamily">
      <div className="mainHomePage">
        {/* Desktop Header */}
        <header
          style={customStyle}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? "bg-white backdrop-blur-md shadow-md" : "bg-white/20 backdrop-blur-sm"
          } ${mobileMenu ? "bg-white" : ""}`}
        >
          <div className="mx-auto px-[20px] xl:px-[100px] lg:px-[60px] md:px-[40px]">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-[12px] z-50 text-decoration-none">
                <LogoIcon style={{ maxWidth: "80px", aspectRatio: 1, maxHeight: "80px" }} />
                <div className="h5 fw-bold m-0 themeColor">ElevateStaffing.ai</div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-[20px] xl:gap-[35px]">
                <Link
                  to="/products/#ElevateStaffingFeatures"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </Link>

                {/* Products Mega Menu */}
                <div className="relative">
                  <a
                    ref={productsLinkRef}
                    href="/products"
                    onClick={handleProductsClick}
                    onMouseEnter={() => setShowProductsMega(true)}
                    onMouseLeave={() => {
                      if (!showProductsMega) return;
                      setTimeout(() => {
                        if (!megaMenuRef.current?.matches(":hover")) {
                          setShowProductsMega(false);
                        }
                      }, 100);
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Products
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProductsMega ? "rotate-180" : ""}`} />
                  </a>

                  {/* Mega Menu Dropdown */}
                  {showProductsMega && (
                    <div
                      ref={megaMenuRef}
                      onMouseEnter={() => setShowProductsMega(true)}
                      onMouseLeave={() => setShowProductsMega(false)}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[700px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200"
                    >
                      <div className="grid grid-cols-2 divide-x divide-gray-200">
                        <Link
                          to={productsData.staffing.viewLink}
                          target="_blank"
                          onClick={() => setShowProductsMega(false)}
                          className="group relative overflow-hidden p-8 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300 no-underline"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                                <Users className="h-7 w-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  Elevate Staffing
                                </h3>
                                <p className="text-xs text-gray-500">Operations & Finance</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed">
                              Complete staffing lifecycle from bench management to automated billing
                            </p>

                            <div className="space-y-2 pt-2">
                              {productsData.staffing.modules.slice(0, 3).map((module, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  {module.title}
                                </div>
                              ))}
                              <div className="text-xs text-gray-500 font-medium pt-1">
                                +{productsData.staffing.modules.length - 3} more modules
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 pt-2">
                              Explore Platform{" "}
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>

                        <Link
                          to={productsData.recruit.viewLink}
                          target="_blank"
                          onClick={() => setShowProductsMega(false)}
                          className="group relative overflow-hidden p-8 hover:bg-gradient-to-br hover:from-purple-500/5 hover:to-pink-500/5 transition-all duration-300 no-underline"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                                <Brain className="h-7 w-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                  Elevate Recruit
                                </h3>
                                <p className="text-xs text-gray-500">AI-Powered</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed">
                              Screen, score, and prepare candidates with AI before client presentation
                            </p>

                            <div className="space-y-2 pt-2">
                              {productsData.recruit.modules.slice(0, 3).map((module, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                  {module.title}
                                </div>
                              ))}
                              <div className="text-xs text-gray-500 font-medium pt-1">
                                +{productsData.recruit.modules.length - 3} more modules
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 pt-2">
                              Explore Platform{" "}
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="bg-gray-50/30 px-8 py-4 text-center border-t border-gray-200">
                        <Link
                          to="/products"
                          onClick={() => setShowProductsMega(false)}
                          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 no-underline"
                        >
                          Compare all features and pricing
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/#WhyElevateStaffing"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Why Us
                </Link>
                {/* <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link> */}
                <Link
                  to="https://blogs.elevatestaffing.ai/"
                  target="_blank"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Resources
                </Link>
              </nav>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-[15px]">
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    ref={loginButtonRef}
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    onMouseEnter={() => setShowLoginDropdown(true)}
                    onMouseLeave={() => {
                      setTimeout(() => {
                        if (!loginDropdownRef.current?.matches(":hover")) {
                          setShowLoginDropdown(false);
                        }
                      }, 100);
                    }}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white/20 text-[#004aad] transition-colors px-[12px] h-9 text-sm font-medium [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!bg-[#004aad] hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Login
                  </button>

                  {/* Login Dropdown Menu */}
                  {showLoginDropdown && (
                    <div
                      ref={loginDropdownRef}
                      onMouseEnter={() => setShowLoginDropdown(true)}
                      onMouseLeave={() => setShowLoginDropdown(false)}
                      className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg  group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white"
                    >
                      <button
                        onClick={() => {
                          setShowLoginDropdown(false);

                          window.open("https://recruit.elevatestaffing.ai", "_blank");
                        }}
                        className="w-full text-left px-4 py-3 text-sm bg-[#fdfdfd] hover:!bg-[#f9f9f9] transition-colors rounded-t-lg border-b border-[#c5c5c547]"
                      >
                        <div className="font-medium text-gray-900">Elevate Recruit</div>
                        <div className="text-xs text-gray-500">AI Recruiting</div>
                      </button>
                      <button
                        onClick={() => {
                          setShowLoginDropdown(false);

                          window.open("/login", "_blank");
                        }}
                        className="w-full text-left px-4 py-3 text-sm bg-[#fdfdfd] hover:!bg-[#f9f9f9] transition-colors rounded-t-lg border-b border-[#c5c5c547]"
                      >
                        <div className="font-medium text-gray-900">Elevate Staffing</div>
                        <div className="text-xs text-gray-500">Operations & Finance</div>
                      </button>

                      <button
                        onClick={() => {
                          setShowLoginDropdown(false);
                          handleLogin("employee");
                        }}
                        className="w-full text-left px-4 py-3 text-sm bg-[#fdfdfd] hover:!bg-[#f9f9f9] transition-colors rounded-t-lg border-border"
                      >
                        <div className="font-medium text-gray-900">Employee Login</div>
                        <div className="text-xs text-gray-500">For candidates</div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGetStarted}
                  className="px-[12px] h-9 text-sm font-medium text-white bg-[#7c3bed] rounded-md hover:bg-[#7c3beddb] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
              >
                {mobileMenu ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />

            <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
              <nav className="container mx-auto px-6 py-6 space-y-1">
                <Link
                  to="/products/#ElevateStaffingFeatures"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  Features
                </Link>

                {/* Mobile Products Accordion */}
                <div>
                  <button
                    onClick={() => setShowMobileProducts(!showMobileProducts)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors bg-[#fff] ${
                      showMobileProducts ? "bg-gray-100" : ""
                    }`}
                  >
                    Products
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMobileProducts ? "rotate-180" : ""}`} />
                  </button>

                  {showMobileProducts && (
                    <div className="ml-4 mt-2 space-y-2">
                      {/* Elevate Staffing */}
                      <div>
                        <button
                          onClick={() => setShowMobileStaffing(!showMobileStaffing)}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors bg-[#fff] ${
                            showMobileStaffing ? "bg-gray-100" : ""
                          }`}
                        >
                          Elevate Staffing
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${showMobileStaffing ? "rotate-180" : ""}`}
                          />
                        </button>
                        {showMobileStaffing && (
                          <div className="ml-4 mt-2 space-y-1">
                            {productsData.staffing.modules.map((module, idx) => (
                              <Link
                                key={idx}
                                to={module.link}
                                onClick={() => setMobileMenu(false)}
                                className="block px-4 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100/30 rounded-lg transition-colors"
                              >
                                {module.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Elevate Recruit */}
                      <div>
                        <button
                          onClick={() => setShowMobileRecruit(!showMobileRecruit)}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors bg-[#fff] ${
                            showMobileRecruit ? "bg-gray-100" : ""
                          }`}
                        >
                          Elevate Recruit
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${showMobileRecruit ? "rotate-180" : ""}`}
                          />
                        </button>
                        {showMobileRecruit && (
                          <div className="ml-4 mt-2 space-y-1">
                            {productsData.recruit.modules.map((module, idx) => (
                              <Link
                                key={idx}
                                to={module.link}
                                onClick={() => setMobileMenu(false)}
                                className="block px-4 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100/30 rounded-lg transition-colors"
                              >
                                {module.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/#WhyElevateStaffing"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  Why Us
                </Link>

                {/* <Link
                  to="/pricing"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  Pricing
                </Link> */}

                <Link
                  to="https://blogs.elevatestaffing.ai/"
                  target="_blank"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  Resources
                </Link>

                <div className="pt-4 space-y-2">
                  <button
                    className="w-full px-4 py-3 text-sm text-left text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors bg-[#fff]"
                    onClick={() => {
                      setMobileMenu(false);
                      window.open("https://recruit.elevatestaffing.ai", "_blank");
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Elevate Recruit</div>
                      <div className="text-xs text-gray-500">AI Recruiting</div>
                    </div>
                  </button>

                  <button
                    className="w-full px-4 py-3 text-sm text-left text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors bg-[#fff]"
                    onClick={() => {
                      setMobileMenu(false);
                      window.open("/login", "_blank");
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Elevate Staffing</div>
                      <div className="text-xs text-gray-500">Operations & Finance</div>
                    </div>
                  </button>

                  <button
                    className="w-full px-4 py-3 text-sm text-left text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors bg-[#fff]"
                    onClick={() => {
                      setMobileMenu(false);
                      handleLogin("employee");
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Employee Login</div>
                      <div className="text-xs text-gray-500">For candidates</div>
                    </div>
                  </button>
                  <button
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 transition-all duration-300 shadow-md hover:shadow-lg mt-3"
                    onClick={() => {
                      setMobileMenu(false);
                      handleGetStarted();
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeHeader;
