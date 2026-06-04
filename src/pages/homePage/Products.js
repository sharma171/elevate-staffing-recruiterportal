import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
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
} from "lucide-react";
import HomeHeader from "./Header";
import styles from "./Products.module.css";
import MainFooter from "../../components/Footer/NewMainFooter";
import { useAuth } from "../../authContext";

const Products = () => {
  const navigate = useNavigate();

  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn === true) {
        navigate("/dashboard");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  const handleBookDemo = () => {
    navigate("/requestademo");
  };

  const handleContactUs = () => {
    navigate("/requestademo?contact=true");
  };

  const staffingModules = [
    {
      title: "Talent & Bench Management",
      description:
        "Group talent into Active, Available, Pending, and Inactive, across W2 and layered subvendor relationships.",
      tagline: "1-click view of your deployable bench.",
      icon: Users,
      color: "blue",
    },
    {
      title: "Compliance & Documents Hub",
      description: "Attach and track visas, I-9-like docs, MSAs, SOWs, and get alerts before anything expires.",
      tagline: "Be audit-ready for every consultant.",
      icon: FileCheck,
      color: "green",
    },
    {
      title: "Job Discovery & Submissions",
      description:
        "Bring in requirements from clients, vendors, or internal BDMs and track submissions across all layers.",
      tagline: "End-to-end pipeline tracking.",
      icon: Search,
      color: "purple",
    },
    {
      title: "Vendor & Engagement Hub",
      description: "Manage vendors and run hotlist mailers, follow-ups, and status campaigns directly from Elevate.",
      tagline: "Never lose track of who you emailed.",
      icon: Send,
      color: "orange",
    },
    {
      title: "Finance & Billing (Incoming)",
      description:
        "Raise invoices for assignments and custom services. Track all payables and receivables. Connect your bank accounts and auto-fetch transactions. Match transactions to invoices to see what's truly paid or overdue.",
      tagline: "Staffing + finance under one roof.",
      icon: DollarSign,
      color: "emerald",
    },
  ];

  const recruitModules = [
    {
      title: "Job & Requisition Hub (Employer Portal)",
      description:
        "Create, edit, and manage jobs from clients or internal teams with clear requirement details and role-based access.",
      tagline: "A clean intake system for every role.",
      icon: Briefcase,
      color: "indigo",
    },
    {
      title: "AI Resume & JD Intelligence",
      description:
        "Upload resumes or paste job descriptions. Get match scores, highlight gaps, and see suggested improvements.",
      tagline: "Instant clarity on fit.",
      icon: Brain,
      color: "pink",
    },
    {
      title: "Screening & Shortlisting",
      description:
        "Score candidates across skills, experience, and visa/availability. Let Elevate recommend top candidates to move forward.",
      tagline: "Shortlists that sell themselves.",
      icon: ClipboardCheck,
      color: "cyan",
    },
    {
      title: "Interview Intelligence (Mock + Prep)",
      description:
        "Generate 15–20 tailored questions per role. Include scenario-based and coding questions where needed. Track candidate readiness before you send them to client.",
      tagline: "Prepare candidates before clients see them.",
      icon: MessageSquare,
      color: "violet",
    },
    {
      title: "Skills & Readiness Assessments (Aspire Quest)",
      description:
        "Run quick skill quizzes and scenario tests. Use scores to justify submissions and rate candidates within your database.",
      tagline: "Evidence-based submissions.",
      icon: Trophy,
      color: "amber",
    },
  ];

  return (
    <div className="signatureContainer homepageFontfamily">
      <div className="mainHomePage">
        <div className={styles.productsPage}>
          <HomeHeader contactUsForm={handleContactUs} />

          {/* Hero Section */}
          <section className={styles.heroSection}>
            <div className={styles.heroBackground}></div>

            <div className={styles.heroContainer}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  Products for Modern <span className={styles.heroGradientText}>Staffing & Recruiting Teams</span>
                </h1>

                <p className={styles.heroDescription}>
                  Choose the modules that match your current stage — from operations and finance to AI recruiting
                  intelligence.
                </p>

                <div className={styles.heroButtons}>
                  <button
                    className={styles.heroButtonPrimary}
                    onClick={() => {
                      window.open("https://elevatestaffing.ai/login", "_blank");
                    }}
                  >
                    Explore Elevate Staffing
                  </button>
                  <button
                    className={styles.heroButtonOutline}
                    onClick={() => {
                      window.open("https://recruit.elevatestaffing.ai/", "_blank");
                    }}
                  >
                    Explore Elevate Recruit
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Product Comparison Cards */}
          <section className={styles.comparisonSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Two Powerful Products</h2>
                <p className={styles.sectionSubtitle}>
                  Choose the solution that fits your business needs — or use both together
                </p>
              </div>

              <div className={styles.comparisonContainer}>
                {/* Connection Line */}
                <div className={styles.connectionLine}></div>

                <div className={styles.cardsGrid}>
                  {/* Elevate Staffing Card */}
                  <div className={styles.cardWrapper}>
                    <div className={`${styles.cardGlow} ${styles.groupHoverGlow}`}></div>

                    <div className={`${styles.productCard} ${styles.groupHoverBorderBlue}`}>
                      <div className={`${styles.cardBgGlow} ${styles.cardBgGlowBlue}`}></div>

                      <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderContent}>
                          <div className={`${styles.cardIconWrapper} ${styles.cardIconBlue}`}>
                            <Users className={styles.cardIcon} />
                          </div>
                          <div>
                            <span className={`${styles.cardTag} ${styles.cardTagBlue}`}>Operations & Finance</span>
                            <h3 className={styles.cardTitle}>Elevate Staffing</h3>
                          </div>
                        </div>
                        <p className={styles.cardDescription}>
                          Complete staffing lifecycle management from talent acquisition to automated billing and
                          compliance tracking
                        </p>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.featuresList}>
                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                              <Users className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>Talent & Bench Management</p>
                              <p className={styles.featureSubtitle}>Organize and deploy your workforce efficiently</p>
                            </div>
                          </div>

                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                              <FileCheck className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>Compliance Hub</p>
                              <p className={styles.featureSubtitle}>Stay audit-ready with automated tracking</p>
                            </div>
                          </div>

                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                              <DollarSign className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>Finance & Billing</p>
                              <p className={styles.featureSubtitle}>Automated invoicing and reconciliation</p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.tagsContainer}>
                          <p className={styles.tagsLabel}>Perfect for:</p>
                          <div className={styles.tags}>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>Staffing Agencies</span>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>MSPs</span>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>VMS Operators</span>
                          </div>
                        </div>

                        <button
                          className={`${styles.cardButton} ${styles.cardButtonHover}`}
                          onClick={() => {
                            window.open("https://elevatestaffing.ai/login", "_blank");
                          }}
                        >
                          Explore Elevate Staffing
                          <ArrowRight className={styles.buttonArrow} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Elevate Recruit Card */}
                  <div className={styles.cardWrapper}>
                    <div className={`${styles.cardGlow} ${styles.groupHoverGlowPurple}`}></div>

                    <div className={`${styles.productCard} ${styles.groupHoverBorderPurple}`}>
                      <div className={`${styles.cardBgGlow} ${styles.cardBgGlowPurple}`}></div>

                      <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderContent}>
                          <div className={`${styles.cardIconWrapper} ${styles.cardIconPurple}`}>
                            <Brain className={styles.cardIcon} />
                          </div>
                          <div>
                            <span className={`${styles.cardTag} ${styles.cardTagPurple}`}>AI-Powered Recruiting</span>
                            <h3 className={styles.cardTitle}>Elevate Recruit</h3>
                          </div>
                        </div>
                        <p className={styles.cardDescription}>
                          AI-powered recruiting intelligence that screens, scores, and prepares candidates before client
                          presentation
                        </p>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.featuresList}>
                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                              <Brain className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>AI Resume Intelligence</p>
                              <p className={styles.featureSubtitle}>Instant match scores and gap analysis</p>
                            </div>
                          </div>

                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                              <ClipboardCheck className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>Smart Screening</p>
                              <p className={styles.featureSubtitle}>AI-ranked candidates ready for review</p>
                            </div>
                          </div>

                          <div className={styles.featureItem}>
                            <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                              <MessageSquare className={styles.featureIconSvg} />
                            </div>
                            <div>
                              <p className={styles.featureTitle}>Interview Prep</p>
                              <p className={styles.featureSubtitle}>Role-specific questions & assessments</p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.tagsContainer}>
                          <p className={styles.tagsLabel}>Perfect for:</p>
                          <div className={styles.tags}>
                            <span className={`${styles.tag} ${styles.tagPurple}`}>Recruiters</span>
                            <span className={`${styles.tag} ${styles.tagPurple}`}>Hiring Teams</span>
                            <span className={`${styles.tag} ${styles.tagPurple}`}>Talent Acquisition</span>
                          </div>
                        </div>

                        <button
                          className={`${styles.cardButton} ${styles.cardButtonHover}`}
                          onClick={() => {
                            window.open("https://recruit.elevatestaffing.ai/", "_blank");
                          }}
                        >
                          Explore Elevate Recruit
                          <ArrowRight className={styles.buttonArrow} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Elevate Staffing Modules */}
          <section id="ElevateStaffingFeatures" className={`${styles.modulesSection} ${styles.staffingModules}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Elevate Staffing – Modules Included</h2>
                <p className={styles.sectionSubtitle}>
                  Complete staffing lifecycle automation from onboarding to billing
                </p>
              </div>

              <div className={styles.modulesGrid}>
                {staffingModules.map((module, idx) => {
                  const Icon = module.icon;
                  const colorClass = module.color.charAt(0).toUpperCase() + module.color.slice(1);
                  return (
                    <div key={idx} className={styles.moduleCard}>
                      <div className={styles.moduleCardInner}>
                        <div className={`${styles.moduleIconWrapper} ${styles[`moduleIconGradient${colorClass}`]}`}>
                          <Icon className={styles.moduleIcon} />
                        </div>
                        <h3 className={styles.moduleTitle}>{module.title}</h3>
                      </div>
                      <div className={styles.moduleContent}>
                        <p className={styles.moduleDescription}>{module.description}</p>
                        <p className={styles.moduleTagline}>{module.tagline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Elevate Recruit Modules */}
          <section className={`${styles.modulesSection} ${styles.recruitModules}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Elevate Recruit – Modules Included</h2>
                <p className={styles.sectionSubtitle}>AI-powered recruiting intelligence from screening to placement</p>
              </div>

              <div className={styles.modulesGrid}>
                {recruitModules.map((module, idx) => {
                  const Icon = module.icon;
                  const colorClass = module.color.charAt(0).toUpperCase() + module.color.slice(1);
                  return (
                    <div key={idx} className={styles.moduleCard}>
                      <div className={styles.moduleCardInner}>
                        <div className={`${styles.moduleIconWrapper} ${styles[`moduleIconGradient${colorClass}`]}`}>
                          <Icon className={styles.moduleIcon} />
                        </div>
                        <h3 className={styles.moduleTitle}>{module.title}</h3>
                      </div>
                      <div className={styles.moduleContent}>
                        <p className={styles.moduleDescription}>{module.description}</p>
                        <p className={styles.moduleTagline}>{module.tagline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Comparison CTA */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaBgPattern}></div>
            <div className={styles.ctaContainer}>
              <h2 className={styles.ctaTitle}>Not Sure Which Product?</h2>
              <p className={styles.ctaDescription}>
                Book a demo with our team and we'll help you choose the right modules for your business needs.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaButtonPrimary} onClick={handleBookDemo}>
                  Book a Free Demo
                </button>
                <button className={styles.ctaButtonOutline} onClick={handleContactUs}>
                  Compare Features
                </button>
              </div>
            </div>
          </section>
        </div>
        <MainFooter />
      </div>
    </div>
  );
};

export default Products;
