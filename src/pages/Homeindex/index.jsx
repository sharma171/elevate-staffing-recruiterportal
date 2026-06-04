import { useState, useEffect, useRef } from "react";
import Button from "./components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabContent } from "./components/tabs";
import { ReactComponent as LogoIcon } from "../../assets/images/elevateStaffinglogo.svg";
import Icon from "./components/Icon";

import "./index.css";
import "./contactForm.css";
import styles from "../../components/css/Logout.module.css";
import HomeHeader from "../../components/Header/HomeHeader";
import { Facebook, Linkedin, X, Youtube } from "lucide-react";
import { toast } from "react-toastify";
import homepageBGImage from "./HomepageBGImage.svg";
import DemoScheduler from "../../components/DemoScheduler";
import OverlayModal from "../../components/OverlayModal";

// import images from "../../assets/images/new";

// const { HomepageBanner } = images;

function getTimePlusHours(offsetHours = 2) {
  const now = new Date();
  const target = new Date(now.getTime() + offsetHours * 3600_000);
  target.setMinutes(0, 0, 0);

  const opts = { hour: "numeric", hour12: true, day: "numeric", month: "short", year: "numeric" };
  const parts = Intl.DateTimeFormat(undefined, opts).formatToParts(target);
  const hour = parts.find((p) => p.type === "hour").value;
  const dayPeriod = (
    parts.find((p) => p.type === "dayPeriod")?.value || (target.getHours() >= 12 ? "PM" : "AM")
  ).toUpperCase();
  const day = parts.find((p) => p.type === "day").value;
  const month = parts.find((p) => p.type === "month").value;
  const year = parts.find((p) => p.type === "year").value;

  function ordinal(n) {
    const v = n % 100;
    if (v >= 11 && v <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  function tryIntlAbbrev(dateObj) {
    try {
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tzName) {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: tzName, timeZoneName: "short" }).formatToParts(
          dateObj
        );
        const tzPart = parts.find((p) => p.type === "timeZoneName")?.value;
        if (tzPart && !/^GMT/i.test(tzPart)) return tzPart.replace(/[()]/g, "");
      }
      const fallback = dateObj.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();
      if (fallback && !/^GMT/i.test(fallback)) return fallback.replace(/[()]/g, "");
    } catch (e) {}
    return null;
  }

  const gmtOffsetMap = {
    "GMT+14:00": "LINT",
    "GMT+13:00": "PHOT",
    "GMT+12:00": "NZST",
    "GMT+11:00": "SBT",
    "GMT+10:00": "AEST",
    "GMT+09:30": "ACST",
    "GMT+09:00": "JST",
    "GMT+08:00": "CST",
    "GMT+07:00": "WIB",
    "GMT+06:00": "BST",
    "GMT+05:45": "NPT",
    "GMT+05:30": "IST",
    "GMT+05:00": "PKT",
    "GMT+04:30": "AFT",
    "GMT+04:00": "GST",
    "GMT+03:30": "IRST",
    "GMT+03:00": "MSK",
    "GMT+02:00": "EET",
    "GMT+01:00": "CET",
    "GMT+00:00": "GMT",
    "GMT-01:00": "AZOT",
    "GMT-02:00": "FNT",
    "GMT-03:00": "BRT",
    "GMT-03:30": "NDT",
    "GMT-04:00": "AST",
    "GMT-05:00": "EST",
    "GMT-06:00": "CST",
    "GMT-07:00": "MST",
    "GMT-08:00": "PST",
    "GMT-09:00": "AKST",
    "GMT-10:00": "HST",
    "GMT-11:00": "NUT",
    "GMT-12:00": "AoE",
  };

  let tzAbbrev = tryIntlAbbrev(target);

  if (!tzAbbrev) {
    const offsetMin = -target.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMin);
    const hh = String(Math.floor(absMin / 60)).padStart(2, "0");
    const mm = String(absMin % 60).padStart(2, "0");
    const key = `GMT${sign}${hh}:${mm}`;
    tzAbbrev = gmtOffsetMap[key] || key;
  }

  if (/^GMT[+-]\d/.test(tzAbbrev) && gmtOffsetMap[tzAbbrev]) tzAbbrev = gmtOffsetMap[tzAbbrev];

  return `e.g., ${hour} ${dayPeriod}, ${day}${ordinal(parseInt(day, 10))} ${month} ${year} – ${tzAbbrev}`;
}

const Index = ({ isDemoOpen }) => {
  const { isLoggedIn, login } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn === true) {
        navigate("/dashboard");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [contactForm, setContactForm] = useState(null);

  let isContactUs = contactForm == "contact us";

  const showDemo = (action = "request a demo") => {
    navigate("/requestademo");
    setContactForm(action);
  };
  const bookDemo = () => {
    setContactForm("book a free demo");
  };
  const contactUsForm = () => {
    setContactForm("contact us");
  };
  // const showDemo = () => {
  //   setDemoDialogOpen(true);
  // };
  // const [captchaQuestion, setCaptchaQuestion] = useState("");
  // const [captchaAnswer, setCaptchaAnswer] = useState("");
  // const [userInput, setUserInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [formData, setformData] = useState({});
  const [errors, seterrors] = useState({});

  const clearForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setMessage("");
    setformData({});
  };

  useEffect(() => {
    // generateCaptcha();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contact = params.get("contact");

    if (isDemoOpen) {
      showDemo(contact ? "contact us" : undefined);
    }
  }, [isDemoOpen]);

  useEffect(() => {
    clearForm();
  }, [contactForm]);

  const whisperRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (whisperRef.current?.close) {
        whisperRef.current.close(); // Close the popover on scroll
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // const generateCaptcha = () => {
  //   const num1 = Math.floor(Math.random() * 10) + 1;
  //   const num2 = Math.floor(Math.random() * 10) + 1;
  //   setCaptchaQuestion(`${num1} + ${num2} = ?`);
  //   setCaptchaAnswer((num1 + num2).toString());
  // };

  const [isLoading, setIsLoading] = useState(false);

  const validateEmailAddress = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      seterrors({ ...errors, email: "Please enter a valid email address." });
      return false;
    }

    const blockedDomains = /(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;
    if (blockedDomains.test(email)) {
      seterrors({ ...errors, email: "Please enter a business email, not a public email." });

      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.preferred_demo_slot && !isContactUs) {
      errors.demoslots = "Please select your preferred demo slot and time.";
      seterrors({ ...errors });
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setEmail("");
      return false;
    }

    const blockedDomains = /(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i;
    if (blockedDomains.test(email)) {
      toast.error("Please enter a business email, not a public email.");
      setEmail("");
      return false;
    }

    // if (userInput !== captchaAnswer) {
    //   toast.error("Captcha Incorrect! Try again.");
    //   generateCaptcha();
    //   setUserInput("");
    //   return;
    // }

    const payloadData = {
      name: name,
      email: email,
      phone_number: `${countryCode} ${phone}`,
      company_name: company,
      message: message,
      is_human_verified: true,
      source: "website",
      ...formData,
    };

    if (isContactUs) {
      payloadData.message = "Support Request: " + message;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://demo-request-v3-305451280005.us-east1.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();

      // generateCaptcha();
      // setUserInput("");
      setPopupOverlay({
        message: isContactUs ? "Thanks for reaching out!" : "Thanks for choosing ElevateStaffing.ai!",
        title: "Form Status",
        subhead: isContactUs
          ? "The ElevateStaffing.ai team will connect with you shortly."
          : "Your demo schedule will be shared shortly according to your preferred time slot.",
        button: "Thank You",
      });
      // clear other input fields using state if needed
    } catch (error) {
      toast.error(error.message || "Something went wrong, Please try again.");
    } finally {
      setIsLoading(false);
      setContactForm(null);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen RecruiterHome">
        <HomeHeader contactUsForm={contactUsForm} />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-grid">
              <div className="flex flex-col justify-center space-y-4 herosectionPadding">
                <div>
                  <h1 className="heroHead">
                    Your All-in-One Staffing <br />& Bench Talent
                    <br /> Management Platform
                  </h1>
                  <p className="hero-subhead">
                    Streamline the entire lifecycle of bench candidates — from onboarding and documentation to placement
                    and compliance.
                  </p>
                </div>
                <div className="hero-buttons gap-3">
                  <Button size="lg" onClick={showDemo}>
                    Request a Demo
                  </Button>
                  <Button size="lg" variant="outline" className="login-btn button-white mx-0" onClick={contactUsForm}>
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center mt-auto">
                <div
                  className="hero-card-container"
                  // style={{ height: "20rem" }}
                >
                  <img
                    src={homepageBGImage}
                    width="100%"
                    draggable={false}
                    userSelect="none"
                    style={{ aspectRatio: "1.649", borderRadius: "5px", userSelect: "none", userDrag: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Platform Features</span>
              <h2 className="section-title">Everything You Need to Manage Bench Talent</h2>
              <p className="section-description">
                Our comprehensive platform streamlines operations for IT consulting and staffing firms, ensuring
                compliance, visibility, and operational excellence.
              </p>
            </div>

            <div className="feature-grid">
              <Card>
                <CardHeader>
                  <Icon name="Users" size={24} className="card-icon" />
                  <CardTitle>End-to-End Candidate Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Store complete candidate profiles with skill sets, availability, visa status, location preference,
                    and pay rate.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Clock" size={24} className="card-icon" />
                  <CardTitle>Automated Status Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Candidates receive weekly work status reminders and fill out updates through a simple interface.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="FileText" size={24} className="card-icon" />
                  <CardTitle>Document Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Store and organize all documents in one place with expiry alerts for work authorization and visa
                    renewals.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Search" size={24} className="card-icon" />
                  <CardTitle>Job Discovery Suite</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Aggregate real-time contract job openings matched to each bench candidate's profile.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Calendar" size={24} className="card-icon" />
                  <CardTitle>Interview Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Schedule interviews and track every stage of the candidate's journey with reminders and follow-ups.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Briefcase" size={24} className="card-icon" />
                  <CardTitle>Recruiter Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track recruiter efficiency, workload, and success metrics to optimize your recruiting strategy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Send" size={24} className="card-icon" />
                  <CardTitle>Engagement Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Build personalized hotlists of available bench candidates and send bulk emails to clients and
                    vendors with full tracking.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-us" className="muted-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Our Advantages</span>
              <h2 className="section-title">Why Choose Us?</h2>
              <p className="section-description">
                Our platform is designed to make your staffing operations smoother, more compliant, and more effective.
              </p>
            </div>

            <div className="feature-grid">
              <Card>
                <CardHeader>
                  <Icon name="Lock" size={24} className="card-icon" />
                  <CardTitle>Secure and Scalable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Designed with enterprise-grade security and room to grow as your business expands.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Timer" size={24} className="card-icon" />
                  <CardTitle>Time-Saving Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Let the system handle weekly reminders, timesheet tracking, and document follow-ups.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Bot" size={24} className="card-icon" />
                  <CardTitle>AI-Driven Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Resume-to-JD matching, skill recommendations, and performance tracking built in.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="Globe" size={24} className="card-icon" />
                  <CardTitle>Customizable for Global Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Built to support remote teams, multi-location recruiters, and international placements.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="muted-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Real-World Applications</span>
              <h2 className="section-title">See How It Works In Practice</h2>
              <p className="section-description">
                Our platform is designed to address real challenges faced by staffing and consulting firms managing
                bench talent.
              </p>
            </div>

            <div className="mt-12">
              <Tabs defaultValue="case1">
                <TabsList>
                  <TabsTrigger value="case1">Compliance</TabsTrigger>
                  <TabsTrigger value="case2">Recruiter Efficiency</TabsTrigger>
                  <TabsTrigger value="case3">Work Status Automation</TabsTrigger>
                  <TabsTrigger value="case4">Candidate Engagement</TabsTrigger>
                  <TabsTrigger value="case5">Vendor Management</TabsTrigger>
                </TabsList>
                <TabsContent>
                  <TabContent value="case1">
                    <div className="tab-grid">
                      <div>
                        <h3 className="text-2xl contentHead">Document Centralization</h3>
                        <p className="mt-2 para">
                          A mid-sized staffing agency with 80+ bench candidates was managing all documents manually.
                          With our platform, they moved everything to a centralized vault, received automated expiry
                          reminders for work permits and I-983s, and passed their USCIS compliance audit without a
                          single missing document.
                        </p>
                        <div className="flex items-center mt-4 space-x-2">
                          <Icon name="FileCheck2" size={20} className="text-green" />
                          <span className="text-sm">100% Compliance Rate Achieved</span>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-2xl contentHead">Visa Expiration Tracking</h3>
                          <p className="mt-2 para">
                            An IT consulting firm with 120+ H1B consultants was struggling with visa renewals. Using our
                            platform's automated visa tracking and expiration alerts, they reduced visa lapses by 95%
                            and eliminated costly legal penalties while maintaining stellar USCIS compliance.
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <Icon name="Calendar" size={20} className="text-green" />
                            <span className="text-sm">95% Reduction in Visa Lapses</span>
                          </div>
                        </div>
                      </div>
                      <div className="tab-stats">
                        <div className="space-y-3">
                          <div className="status-item">
                            <div className="status-label">
                              <Icon name="FileText" size={16} className="status-icon" />
                              <span>I-983 Form</span>
                            </div>
                            <span className="status-badge badge-green">Valid</span>
                          </div>
                          <div className="status-item">
                            <div className="status-label">
                              <Icon name="FileText" size={16} className="status-icon" />
                              <span>H1B Documentation</span>
                            </div>
                            <span className="status-badge badge-green">Valid</span>
                          </div>
                          <div className="status-item">
                            <div className="status-label">
                              <Icon name="FileText" size={16} className="status-icon" />
                              <span>Work Authorization</span>
                            </div>
                            <span className="status-badge badge-yellow">Expires in 30 days</span>
                          </div>
                          <div className="status-item">
                            <div className="status-label">
                              <Icon name="FileText" size={16} className="status-icon" />
                              <span>OPT Extension</span>
                            </div>
                            <span className="status-badge badge-red">Expires in 7 days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent value="case2">
                    <div className="tab-grid">
                      <div>
                        <h3 className="text-2xl contentHead">Recruiter Efficiency Boost</h3>
                        <p className="mt-2 para">
                          A 5-member recruiting team was overwhelmed with job sourcing from multiple portals. Our Job
                          Discovery Suite helped them auto-match jobs to bench talent. They saw a 50% increase in
                          submittals and a 30% reduction in turnaround time.
                        </p>
                        <div className="flex items-center mt-4 space-x-2">
                          <Icon name="AlertCircle" size={20} className="text-blue" />
                          <span className="text-sm">50% Increase in Candidate Submittals</span>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-2xl contentHead">Resume-to-JD Matching</h3>
                          <p className="mt-2 para">
                            A staffing agency with 60+ technical recruiters integrated our AI-powered resume-to-job
                            description matching. Within 3 months, they improved candidate-to-interview conversion by
                            40% and reduced time spent on initial screening by 65%.
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <Icon name="Search" size={20} className="text-blue" />
                            <span className="text-sm">65% Reduction in Screening Time</span>
                          </div>
                        </div>
                      </div>
                      <div className="tab-stats">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Before Implementation</span>
                              <span>20 submittals/week</span>
                            </div>
                            <div className="progress-container">
                              <div className="progress-bar progress-gray" style={{ width: "40%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>After Implementation</span>
                              <span>30 submittals/week</span>
                            </div>
                            <div className="progress-container">
                              <div className="progress-bar progress-green" style={{ width: "60%" }}></div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Screening Time (Before)</span>
                              <span>45 min/candidate</span>
                            </div>
                            <div className="progress-container">
                              <div className="progress-bar progress-gray" style={{ width: "80%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Screening Time (After)</span>
                              <span>15 min/candidate</span>
                            </div>
                            <div className="progress-container">
                              <div className="progress-bar progress-green" style={{ width: "25%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent value="case3">
                    <div className="tab-grid">
                      <div>
                        <h3 className="text-2xl contentHead">Work Status & Timesheet Automation</h3>
                        <p className="mt-2 para">
                          Previously chasing 50+ candidates each Friday for status updates and timesheets, one company
                          automated the entire process with our weekly work collection system. Now, candidates receive
                          reminders, submit via mobile or web, and HR sees consolidated reports — saving 8–10
                          hours/week.
                        </p>
                        <div className="flex items-center mt-4 space-x-2">
                          <Icon name="Clock" size={20} className="text-green" />
                          <span className="text-sm">8-10 Hours Saved Weekly</span>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-2xl contentHead">Project Milestone Tracking</h3>
                          <p className="mt-2 para">
                            A consulting firm with 35 bench consultants training on client projects needed better
                            milestone tracking. Our platform's automated check-in system allowed them to monitor
                            progress, identify training obstacles, and intervene early—reducing project delays by 40%.
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <Icon name="FileCheck2" size={20} className="text-green" />
                            <span className="text-sm">40% Fewer Project Delays</span>
                          </div>
                        </div>
                      </div>
                      <div className="tab-stats">
                        <div className="space-y-3">
                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Weekly Status Report</span>
                                <span className="status-badge badge-green">Automated</span>
                              </div>
                              <div className="text-sm text-light">45/50 candidates submitted on time</div>
                              <div className="progress-container">
                                <div className="progress-bar progress-green" style={{ width: "90%" }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Timesheet Collection</span>
                                <span className="status-badge badge-green">Automated</span>
                              </div>
                              <div className="text-sm text-light">48/50 timesheets submitted</div>
                              <div className="progress-container">
                                <div className="progress-bar progress-green" style={{ width: "96%" }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Project Milestones</span>
                                <span className="status-badge badge-blue">Tracked</span>
                              </div>
                              <div className="text-sm text-light">32/35 consultants on track</div>
                              <div className="progress-container">
                                <div className="progress-bar progress-blue" style={{ width: "91%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent value="case4">
                    <div className="tab-grid">
                      <div>
                        <h3 className="text-2xl contentHead">Candidate Engagement & Retention</h3>
                        <p className="mt-2 para">
                          A growing staffing firm struggled with losing bench candidates to competitors during the
                          waiting period. By implementing our engagement system with regular check-ins and personalized
                          job matches, they reduced candidate attrition by 35% and improved bench-to-billable conversion
                          rates.
                        </p>
                        <div className="flex items-center mt-4 space-x-2">
                          <Icon name="Users" size={20} className="text-blue" />
                          <span className="text-sm">35% Decrease in Candidate Attrition</span>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-2xl contentHead">Training & Upskilling Program</h3>
                          <p className="mt-2 para">
                            An IT services firm implemented our skill-matching and training recommendation engine for
                            their bench. Within 6 months, they increased bench utilization by 28% by aligning training
                            with market demand and upcoming project requirements.
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <Icon name="Briefcase" size={20} className="text-blue" />
                            <span className="text-sm">28% Higher Bench Utilization</span>
                          </div>
                        </div>
                      </div>
                      <div className="tab-stats">
                        <div className="space-y-3">
                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Candidate Engagement</span>
                                <span className="status-badge badge-blue">Improved</span>
                              </div>
                              <div className="flex items-center mt-3 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Weekly job matches: 8 per candidate</span>
                              </div>
                              <div className="flex items-center mt-2 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Regular check-ins: 94% response rate</span>
                              </div>
                              <div className="flex items-center mt-2 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Skill development reminders</span>
                              </div>
                            </div>
                          </div>

                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Skills & Training</span>
                                <span className="status-badge badge-green">Optimized</span>
                              </div>
                              <div className="flex items-center mt-3 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Market demand analysis</span>
                              </div>
                              <div className="flex items-center mt-2 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Custom learning paths: 85% completion</span>
                              </div>
                              <div className="flex items-center mt-2 gap-2">
                                <Icon name="ListCheck" size={16} className="text-primary" />
                                <span className="text-sm">Project readiness scores</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>

                  <TabContent value="case5">
                    <div className="tab-grid">
                      <div>
                        <h3 className="text-2xl contentHead">Vendor Network & Mass Email Campaigns</h3>
                        <p className="mt-2 para">
                          An IT consulting company needed to maximize visibility of their bench talent. Using our
                          Engagement Hub, they created targeted hotlists of their available consultants and sent
                          personalized mass emails to their vendor network. Within 30 days, they received interview
                          requests from 14 new clients and placed 5 candidates.
                        </p>
                        <div className="flex items-center mt-4 space-x-2">
                          <Icon name="Send" size={20} className="text-green" />
                          <span className="text-sm">5 New Placements in 30 Days</span>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-2xl contentHead">Client Relationship Management</h3>
                          <p className="mt-2 para">
                            A staffing agency with 200+ clients implemented our client segmentation and targeted
                            communication system. By tailoring bench talent presentations to each client's specific
                            needs, they improved response rates by 45% and reduced time-to-fill for urgent requirements
                            by 3 days.
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <Icon name="MailPlus" size={20} className="text-green" />
                            <span className="text-sm">45% Higher Client Response Rates</span>
                          </div>
                        </div>
                      </div>
                      <div className="tab-stats">
                        <div className="space-y-3">
                          <div className="status-item">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Email Campaign</span>
                                <span className="status-badge badge-green">Successful</span>
                              </div>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Emails Sent</span>
                                  <span>200+</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Open Rate</span>
                                  <span>76%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Response Rate</span>
                                  <span>23%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>New Clients</span>
                                  <span>14</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabContent>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="testimonials" className="features-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Testimonials</span>
              <h2 className="section-title">What Our Users Say</h2>
              <p className="section-description">
                Don't just take our word for it. Here's what our customers have to say about their experience.
              </p>
            </div>

            <div className="feature-grid testinomial-grid">
              <Card>
                <CardHeader>
                  <div className="feedheader">
                    <div className="text-icon">PK</div>
                    <div className="col-flex">
                      <h3 className="name">Priya K.</h3>
                      <span className="description">Operations Manager, Tier-2 IT Staffing Firm</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    "We used to maintain spreadsheets, Google Drive folders, and Slack threads to manage our bench. It
                    was chaotic. Now, we have complete clarity and automation — this platform gave us our weekends
                    back."
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="feedheader">
                    <div className="text-icon">JM</div>
                    <div className="col-flex">
                      <h3 className="name">Jason M.</h3>
                      <span className="description">Senior Technical Recruiter</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    "Resume to JD matching is a game- changer. I paste any job description and instantly know which of
                    my candidates are the best fit. This helped me close 3 positions in just 10 days."
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="feedheader">
                    <div className="text-icon">RT</div>
                    <div className="col-flex">
                      <h3 className="name">Ravi Tendulkar</h3>
                      <span className="description">Business Development Head</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    "The engagement hub helped us revive cold leads. We sent a hotlist to 200+ vendors and got 8 new
                    client calls in a week."
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* Why Choose Us Section */}
        <section id="pricing" className="muted-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Pricing Plans</span>
              <h2 className="section-title">Simple, Transparent Pricing</h2>
              <p className="section-description">Flexible plans designed to scale with your staffing agency's needs.</p>
            </div>

            <div className="row">
              <div className="col-md-4 pricingSvg px-md-3 px-0 mb-4 mb-md-0">
                {/* <Pricing1/> */}
                <div className="pricingcard h-100">
                  <div className="topHead">
                    <div className="lHead">
                      <h3 className="mHead segoiUI">Starter Plan</h3>
                      <p className="text segoiUI">Ideal for small and growing staffing teams</p>
                    </div>
                    <div className="rIcon">
                      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M16.6641 16L18.6641 18L22.6641 14"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M21.6641 10.0019V8.00186C21.6637 7.65113 21.5711 7.30667 21.3956 7.00302C21.2201 6.69937 20.9678 6.44722 20.6641 6.27186L13.6641 2.27186C13.36 2.09632 13.0151 2.00391 12.6641 2.00391C12.313 2.00391 11.9681 2.09632 11.6641 2.27186L4.66406 6.27186C4.36033 6.44722 4.10804 6.69937 3.93252 7.00302C3.75701 7.30667 3.66442 7.65113 3.66406 8.00186V16.0019C3.66442 16.3526 3.75701 16.697 3.93252 17.0007C4.10804 17.3043 4.36033 17.5565 4.66406 17.7319L11.6641 21.7319C11.9681 21.9074 12.313 21.9998 12.6641 21.9998C13.0151 21.9998 13.36 21.9074 13.6641 21.7319L15.6641 20.5919"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8.16406 4.26953L17.1641 9.41953"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M3.95312 7L12.6631 12L21.3731 7"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M12.6641 22V12"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="textBigblue">$199/month</span>
                  <div className="TickList">
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      5 Recruiter Accounts <span className="smallText"> ($9.99 per additional recruiter)</span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      20 Employee Accounts <span className="smallText"> ($4.99 per additional employee)</span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      20 GB Cloud Storage <span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      10 Hours Onboarding Support <span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      24/7 Priority Email Support <span className="smallText"></span>
                    </span>
                  </div>
                  <button className="pricingbtn" onClick={contactUsForm}>
                    Get Started
                  </button>
                </div>
              </div>
              <div className="col-md-4 pricingSvg px-md-3 px-0 mb-4 mb-md-0">
                <div className="pricingcard h-100">
                  <div className="topHead">
                    <div className="lHead">
                      <h3 className="mHead segoiUI">Mass Emailing</h3>
                      <p className="text segoiUI">Supercharge your candidate outreach</p>
                    </div>
                    <div className="rIcon">
                      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8.23594 20C10.1445 20.9791 12.34 21.2443 14.4268 20.7478C16.5136 20.2514 18.3545 19.0259 19.6177 17.2922C20.8809 15.5586 21.4834 13.4308 21.3165 11.2922C21.1497 9.15366 20.2245 7.14502 18.7077 5.62824C17.191 4.11146 15.1823 3.1863 13.0438 3.01946C10.9052 2.85263 8.77741 3.45509 7.04376 4.71829C5.31011 5.98149 4.08463 7.82236 3.58816 9.90916C3.09169 11.996 3.35688 14.1915 4.33594 16.1L2.33594 22L8.23594 20Z"
                          stroke="#0A3D91"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="textBigblue">Mass Email Add-ons</span>
                  <div className="pricingtext">
                    <span className="text">$59.99/month - Up to 100,000 emails</span>
                    <span className="text">$169.99/month - Up to 300,000 emails</span>
                    <span className="text">Custom volumes? Contact our sales team</span>
                  </div>
                  <button className="pricingbtn" onClick={contactUsForm}>
                    Request Custom Plan
                  </button>
                </div>
              </div>
              <div className="col-md-4 pricingSvg px-md-3 px-0 mb-4 mb-md-0">
                {/* <Pricing3/> */}
                <div className="pricingcard h-100">
                  <div className="topHead">
                    <div className="lHead">
                      <h3 className="mHead segoiUI">White Label Branding</h3>
                      <p className="text segoiUI">Make the platform truly your own</p>
                    </div>
                    <div className="rIcon">
                      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12.9844 22C18.5072 22 22.9844 17.5228 22.9844 12C22.9844 6.47715 18.5072 2 12.9844 2C7.46153 2 2.98438 6.47715 2.98438 12C2.98438 17.5228 7.46153 22 12.9844 22Z"
                          stroke="#0A3D91"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M12.9844 2C10.4166 4.69615 8.98438 8.27674 8.98438 12C8.98438 15.7233 10.4166 19.3038 12.9844 22C15.5521 19.3038 16.9844 15.7233 16.9844 12C16.9844 8.27674 15.5521 4.69615 12.9844 2Z"
                          stroke="#0A3D91"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M2.98438 12H22.9844"
                          stroke="#0A3D91"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="textBigblue">$399/month</span>
                  <div className="TickList">
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Custom Brand Logo <span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Custom Domain<span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Branded System Emails<span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Custom Branded Reports<span className="smallText"></span>
                    </span>
                    <span className="ticklistText poppins">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6667 1L4.33333 8.33333L1 5"
                          stroke="#22C55E"
                          stroke-width="1.33333"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Remove Platform Branding<span className="smallText"></span>
                    </span>
                  </div>
                  <button className="pricingbtn" onClick={contactUsForm}>
                    Explore White Label
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="Cta-section features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title text-white mb-4">Ready To Transform Your Bench Strategy?</h2>
              <p className="section-description  text-white">
                Say goodbye to spreadsheets, disconnected workflows, and compliance anxiety. Say hello to smarter
                staffing operations, faster placements, and complete visibility across your team.
              </p>
              <Button size="lg" onClick={bookDemo} className="btn-white">
                Book a Free Demo
              </Button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-section">
                <div class="logo">
                  <div class="logo-icon footer" style={{ height: "100px" }}>
                    <LogoIcon style={{ maxHeight: "100px" }} />
                  </div>
                </div>
                <p className="footInfo">Your all-in-one platform for staffing & bench talent management.</p>

                <div className="mt-2 gap-2 d-flex align-items-end">
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/company/elevatestaffing-ai/about/?viewAsMember=true"
                    className="linkedinSimpleSocialButton"
                    style={{ color: "rgb(40, 87, 218)", padding: "8px" }}
                  >
                    <Linkedin size={22} />
                  </a>
                  <a
                    target="_blank"
                    style={{ padding: "8px" }}
                    href="https://www.youtube.com/@ElevatestaffingAI"
                    className="youTubeSimpleSocialButton mt-1"
                  >
                    <Youtube style={{ color: "red" }} size={23} />
                  </a>
                  <a
                    target="_blank"
                    style={{ padding: "8px" }}
                    href="https://www.instagram.com/elevatestaffing.ai/?hl=en"
                    className="youTubeSimpleSocialButton mt-1"
                  >
                    <div className="instagramISimpleSocialButton" />
                  </a>
                  <a
                    target="_blank"
                    style={{ padding: "8px" }}
                    href="https://www.facebook.com/profile.php?id=61582449860561"
                    className="linkedinSimpleSocialButton mt-1"
                  >
                    <Facebook style={{ color: "#2F88FF" }} size={23} />
                  </a>
                </div>
              </div>
              <div className="footer-section">
                <h3>Features</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#">Candidate Management</a>
                  </li>
                  <li>
                    <a href="#">Document Vault</a>
                  </li>
                  <li>
                    <a href="#">Job Discovery Suite</a>
                  </li>
                  <li>
                    <a href="#">Weekly Status Collection</a>
                  </li>
                  <li>
                    <a href="#">Engagement Hub</a>
                  </li>
                </ul>
              </div>
              <div className="footer-section">
                <h3>Company</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#">Why Choose Us</a>
                  </li>
                  <li>
                    <a href="#">About Us</a>
                  </li>
                  <li>
                    <a href="#">Blog</a>
                  </li>
                  <li>
                    <a href="#">Careers</a>
                  </li>
                  <li>
                    <a href="#" onClick={contactUsForm}>
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-section">
                <h3>Legal</h3>
                <ul className="footer-links">
                  <li>
                    <Link to="/privacypolicy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/termsofservice">Terms of Service</Link>
                  </li>
                  <li>
                    <Link to="/cookiespolicy">Cookie Policy</Link>
                  </li>
                  <li>
                    <Link to="/gdprpage">GDPR Compliances</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
        <footer className="legalFooter">
          <div className="container">
            <p>© 2025 ElevateStaffing AI. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
      {contactForm && (
        <>
          <OverlayModal
            style={{ maxWidth: "700px" }}
            modalStyle={{ paddingBottom: "20px", background: "#fff" }}
            isActive={contactForm}
            isOpen={contactForm}
            onClose={() => setContactForm(false)}
          >
            <div className="ContactUsForm">
              <div className="contactFormOuter">
                <div className="mb-2">
                  <div className="h4">{isContactUs ? "Contact Us" : "Request a Demo"}</div>
                  <div>
                    {isContactUs
                      ? "Fill out the form below to get in touch with us."
                      : "Select a date and time slot, then fill out your details to schedule a demo."}
                  </div>
                </div>
                <section className="contact-form">
                  <div className="contact-form-container pb-4">
                    <form className="form-content p-1" onSubmit={handleSubmit}>
                      {isContactUs ? (
                        <></>
                      ) : (
                        <DemoScheduler
                          className="input_field_form"
                          error={errors?.demoslots}
                          onChange={(val) => {
                            errors.demoslots = "";
                            formData.preferred_demo_slot = val?.selectedSlot?.label + " " + val?.date;
                            setformData({ ...formData });
                          }}
                          disabled={isLoading}
                        />
                      )}
                      <div className="input-col col-flex">
                        <label className="input-label">
                          Name <span className="text-danger">*</span>
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            placeholder="Your Name"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="input-col col-flex">
                        <label className="input-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <div className="input">
                          <input
                            type="email"
                            placeholder="Enter your business email"
                            className="input-field"
                            value={email}
                            onChange={(e) => {
                              errors.email = "";
                              setEmail(e.target.value);
                            }}
                            required
                            onBlur={validateEmailAddress}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email ? <div className="text-danger font12"> {errors.email} </div> : <></>}
                      </div>
                      <div className="input-col col-flex">
                        <label className="input-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <div className="input">
                          <select
                            className="input-field mobileNumber"
                            onChange={(e) => setCountryCode(e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="+1">USA +1</option>
                            <option value="+91">IND +91</option>
                          </select>
                          <div className="divider"></div>
                          <input
                            type="tel"
                            className="input-field"
                            placeholder="1234567890"
                            maxLength="10"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="input-col col-flex">
                        <label className="input-label">
                          Company <span className="text-danger">*</span>
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            placeholder="Your company name"
                            className="input-field"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      {isContactUs ? (
                        <></>
                      ) : (
                        <div className="input-col col-flex">
                          <label className="input-label">
                            Job Title <span className="text-danger">*</span>
                          </label>
                          <div className="input">
                            <input
                              type="text"
                              placeholder="Enter your job title"
                              className="input-field"
                              value={formData.job_title}
                              onChange={(e) => {
                                formData.job_title = e.target.value;
                                setformData({ ...formData });
                              }}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      )}
                      <div className="input-col col-flex">
                        <label className="input-label">
                          Message <span className="text-danger">*</span>
                        </label>
                        <div className="input">
                          <textarea
                            rows={2}
                            placeholder="Tell us what you're looking for..."
                            className="input-field messagetxt"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn send-btn mt-3 d-flex align-items-center justify-content-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        )}
                        {isLoading ? "Loading..." : isContactUs ? "Contact Us" : "Request Your Demo"}
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          </OverlayModal>
        </>
      )}

      {popupOverlay && (
        <>
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmModal}>
              <div className={`${styles.modalHeader} d-flex align-items-center justify-content-between`}>
                <h3>{popupOverlay?.title ? popupOverlay?.title : "status"}</h3>
                <span
                  class="material-symbols-outlined pointer"
                  onClick={() => {
                    setPopupOverlay(null);
                  }}
                >
                  close
                </span>
              </div>
              <div className={`d-flex flex-column align-items-center ${styles.modalBody}`}>
                <div className={`${styles.confirmHeading}`}>
                  <div className="fw-bold">{popupOverlay?.message}</div>
                  <div>{popupOverlay?.subhead}</div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    onClick={() => {
                      setPopupOverlay(null);
                    }}
                    className={`${styles.confirmButton} ${styles.confirmYes}`}
                  >
                    <span class="logout-icon " />
                    {popupOverlay?.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Index;
