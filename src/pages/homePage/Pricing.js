import React, { useEffect, useState } from "react";
import HomeHeader from "./Header";
import Footer from "../../components/Footer/NewMainFooter";
import { Check, Sparkles, Mail, Palette, Code2, Users, Zap, Shield } from "lucide-react";
import styles from "./Pricing.module.css";
import ContactUsForm from "../../components/ContactUsForm";
import RequestDemoForm from "../../components/RequestDemoForm";
import Confirm from "../../components/Confirm";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [demoRequestOpen, setDemoRequestOpen] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState(null);

  const handleContactUs = () => setContactFormOpen(true);
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

  return (
    <div className="signatureContainer homepageFontfamily">
      <div className="mainHomePage">
        <div className={styles.pricingPage}>
          <HomeHeader contactUsForm={handleContactUs} />
          {/* Hero Section */}
          <section className={`d-flex flex column justify-content-center ${styles.heroSection}`}>
            <div style={{ maxWidth: "76rem" }} className="w-100">
              <div className={styles.heroGradientBg}></div>
              <div className={styles.heroBlob1}></div>
              <div className={styles.heroBlob2}></div>

              <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                  <div className={styles.flexBadge}>Flexible Pricing</div>
                  <h1 className={styles.heroTitle}>
                    Plans That <span className={styles.gradientText}>Scale With You</span>
                  </h1>
                  <p className={styles.heroDescription}>
                    Everything you need to streamline your staffing operations. From small teams to enterprise
                    organizations.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Gradient Separator */}
          <div className={styles.gradientLine}></div>
          {/* Pricing Plans */}
          <section className={`d-flex flex column justify-content-center ${styles.pricingSection}`}>
            <div style={{ maxWidth: "76rem" }} className="w-100">
              <div className={styles.pricingContainer}>
                <div className={styles.pricingGrid}>
                  {/* Starter Plan */}
                  <div className={styles.cardGroup}>
                    <div className={styles.cardHoverEffect}></div>

                    <div className={styles.mainCard}>
                      <div className={styles.cardBackgroundBlur}></div>

                      <div className={styles.cardInner}>
                        <div className={styles.cardHeader}>
                          <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                              <div className={styles.iconCircle}>
                                <Sparkles className={styles.icon} />
                              </div>
                              <div className={styles.titleSection}>
                                <h3 className={styles.cardTitle}>Starter Plan</h3>
                                <p className={styles.cardSubtitle}>Perfect for small and growing teams</p>
                              </div>
                            </div>
                            <div className={styles.priceDisplay}>
                              <div className={styles.priceContainer}>
                                <span className={styles.priceNumber}>$199</span>
                                <span className={styles.priceUnit}>/mo</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.contentGrid}>
                            <div className={styles.featureColumn}>
                              <h4 className={styles.sectionTitle}>
                                <Users style={{ width: "1.25rem", height: "1.25rem", color: "#8b5cf6" }} />
                                Team Access
                              </h4>
                              <div className={styles.featureList}>
                                <div className={styles.featureItem}>
                                  <Check className={styles.checkIcon} />
                                  <div className={styles.featureDetails}>
                                    <span className={styles.featureName}>5 Recruiter Accounts</span>
                                    <p className={styles.featureDescription}>+$9.99/month per additional recruiter</p>
                                  </div>
                                </div>
                                <div className={styles.featureItem}>
                                  <Check className={styles.checkIcon} />
                                  <div className={styles.featureDetails}>
                                    <span className={styles.featureName}>20 Employee Accounts</span>
                                    <p className={styles.featureDescription}>+$4.99/month per additional employee</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={styles.featureColumn}>
                              <h4 className={styles.sectionTitle}>
                                <Shield style={{ width: "1.25rem", height: "1.25rem", color: "#3b82f6" }} />
                                Support & Storage
                              </h4>
                              <div className={styles.featureList}>
                                <div className={styles.featureItem}>
                                  <Check className={styles.checkIconAccent} />
                                  <span className={styles.featureName}>20 GB Secure Cloud Storage</span>
                                </div>
                                <div className={styles.featureItem}>
                                  <Check className={styles.checkIconAccent} />
                                  <span className={styles.featureName}>10 Hours Onboarding Support</span>
                                </div>
                                <div className={styles.featureItem}>
                                  <Check className={styles.checkIconAccent} />
                                  <span className={styles.featureName}>24/7 Priority Email Support</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={styles.highlightBox}>
                            <p className={styles.highlightText}>
                              Everything you need to get started and scale your recruiting operations quickly and
                              efficiently.
                            </p>
                          </div>

                          <button className={styles.primaryButton} onClick={() => setDemoRequestOpen(true)}>
                            Get Started
                            <Zap className={styles.buttonIcon} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mass Emailing Add-on */}
                  <div className={styles.cardGroup}>
                    <div
                      className={styles.cardHoverEffect}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
                      }}
                    ></div>

                    <div className={styles.mainCard}>
                      <div
                        className={styles.cardBackgroundBlur}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                        }}
                      ></div>

                      <div className={styles.cardInner}>
                        <div className={styles.cardHeader}>
                          <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                              <div
                                className={styles.iconCircle}
                                style={{
                                  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                                }}
                              >
                                <Mail className={styles.icon} />
                              </div>
                              <div className={styles.titleSection}>
                                <div
                                  className={styles.flex}
                                  style={{ alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}
                                >
                                  <h3 className={styles.cardTitle}>Mass Emailing</h3>
                                  <span className={styles.addonBadge}>Add-on</span>
                                </div>
                                <p className={styles.cardSubtitle}>Supercharge your outreach capabilities</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.pricingOptions}>
                            <div className={styles.pricingOption}>
                              <div className={styles.optionPrice}>
                                <span className={styles.optionPriceNumber}>$59.99</span>
                                <span className={styles.optionPriceUnit}>/month</span>
                              </div>
                              <div className={styles.optionFeatures}>
                                <div className={styles.optionFeature}>
                                  <Check className={styles.optionCheckIcon} />
                                  <span className={styles.optionFeatureText}>100K emails/month</span>
                                </div>
                                <p className={styles.optionDescription}>Perfect for growing outreach</p>
                              </div>
                            </div>

                            <div className={styles.pricingOption} style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}>
                              <div className={styles.optionPrice}>
                                <span className={styles.optionPriceNumber}>$169.99</span>
                                <span className={styles.optionPriceUnit}>/month</span>
                              </div>
                              <div className={styles.optionFeatures}>
                                <div className={styles.optionFeature}>
                                  <Check className={styles.optionCheckIcon} style={{ color: "#8b5cf6" }} />
                                  <span className={styles.optionFeatureText}>300K emails/month</span>
                                </div>
                                <p className={styles.optionDescription}>For high-volume campaigns</p>
                              </div>
                            </div>
                          </div>

                          <div className={styles.spaceY4}>
                            <div className={styles.premiumBox}>
                              <h5 className={styles.premiumTitle}>Premium Features Included:</h5>
                              <div className={styles.premiumList}>
                                <div className={styles.premiumItem}>
                                  <Check className={styles.premiumCheck} />
                                  <span className={styles.premiumText}>Sender reputation monitoring</span>
                                </div>
                                <div className={styles.premiumItem}>
                                  <Check className={styles.premiumCheck} />
                                  <span className={styles.premiumText}>Automated bounce handling</span>
                                </div>
                                <div className={styles.premiumItem}>
                                  <Check className={styles.premiumCheck} />
                                  <span className={styles.premiumText}>Verified domain setup assistance</span>
                                </div>
                              </div>
                            </div>

                            <p className={styles.contactText}>
                              Need more than 300K emails/month?{" "}
                              <button onClick={() => setContactFormOpen(true)} className={styles.contactButton}>
                                Contact our sales team
                              </button>{" "}
                              for custom enterprise pricing.
                            </p>
                          </div>

                          <button className={styles.outlineButton} onClick={() => setContactFormOpen(true)}>
                            Add to Your Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* White-Label Branding */}
                  <div className={styles.cardGroup}>
                    <div className={styles.cardHoverEffect}></div>

                    <div className={styles.mainCard}>
                      <div className={styles.cardBackgroundBlur}></div>

                      <div className={styles.cardInner}>
                        <div className={styles.cardHeader}>
                          <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                              <div className={styles.iconCircle}>
                                <Palette className={styles.icon} />
                              </div>
                              <div className={styles.titleSection}>
                                <h3 className={styles.cardTitle}>White-Label Branding</h3>
                                <p className={styles.cardSubtitle}>Make the platform truly yours</p>
                              </div>
                            </div>
                            <div className={styles.priceDisplay}>
                              <div className={styles.priceContainer}>
                                <span className={styles.priceNumber}>$399</span>
                                <span className={styles.priceUnit}>/mo</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.contentGrid}>
                            <div className={styles.featuresHoverList}>
                              <div className={styles.featureHoverItem}>
                                <Check className={styles.checkIcon} />
                                <div className={styles.featureDetails}>
                                  <span className={styles.featureName}>Custom branding</span>
                                  <p className={styles.featureDescription}>Your logo, colors, and domain</p>
                                </div>
                              </div>
                              <div className={styles.featureHoverItem}>
                                <Check className={styles.checkIcon} />
                                <div className={styles.featureDetails}>
                                  <span className={styles.featureName}>Branded emails</span>
                                  <p className={styles.featureDescription}>Send from your domain</p>
                                </div>
                              </div>
                            </div>

                            <div className={styles.featuresHoverList}>
                              <div className={styles.featureHoverItem}>
                                <Check className={styles.checkIconAccent} />
                                <div className={styles.featureDetails}>
                                  <span className={styles.featureName}>Custom reports</span>
                                  <p className={styles.featureDescription}>Branded documents & confirmations</p>
                                </div>
                              </div>
                              <div className={styles.featureHoverItem}>
                                <Check className={styles.checkIconAccent} />
                                <div className={styles.featureDetails}>
                                  <span className={styles.featureName}>Remove our branding</span>
                                  <p className={styles.featureDescription}>No "Powered by" footer</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={styles.highlightBox}>
                            <p className={styles.highlightText}>
                              Perfect for agencies looking to present a fully branded experience to clients and
                              candidates. Strengthen your brand identity across every touchpoint.
                            </p>
                          </div>

                          <button className={styles.primaryButton} onClick={() => setDemoRequestOpen(true)}>
                            Add to Your Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Feature Development */}
                  <div className={styles.cardGroup}>
                    <div
                      className={styles.cardHoverEffect}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
                      }}
                    ></div>

                    <div className={styles.mainCard}>
                      <div
                        className={styles.cardBackgroundBlur}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                        }}
                      ></div>

                      <div className={styles.cardInner}>
                        <div className={styles.cardHeader}>
                          <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                              <div
                                className={styles.iconCircle}
                                style={{
                                  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                                }}
                              >
                                <Code2 className={styles.icon} />
                              </div>
                              <div className={styles.titleSection}>
                                <h3 className={styles.cardTitle}>Custom Development</h3>
                                <p className={styles.cardSubtitle}>Tailored features for your unique needs</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardContent}>
                          <p className={styles.textMuted} style={{ marginBottom: "2rem" }}>
                            Our development team is ready to build custom workflows, dashboards, automations, and
                            integrations that fit your exact business requirements.
                          </p>

                          <div className={styles.featureGrid}>
                            <div className={styles.featureGridItem}>
                              <h5 className={styles.gridFeatureTitle}>
                                <Check className={styles.gridFeatureIcon} style={{ color: "#8b5cf6" }} />
                                Design Phase
                              </h5>
                              <p className={styles.gridFeatureDescription}>Collaborate on feature specifications</p>
                            </div>

                            <div className={styles.featureGridItem}>
                              <h5 className={styles.gridFeatureTitle}>
                                <Check className={styles.gridFeatureIcon} style={{ color: "#3b82f6" }} />
                                Development
                              </h5>
                              <p className={styles.gridFeatureDescription}>Transparent estimates & timelines</p>
                            </div>

                            <div className={styles.featureGridItem}>
                              <h5 className={styles.gridFeatureTitle}>
                                <Check className={styles.gridFeatureIcon} style={{ color: "#8b5cf6" }} />
                                Integration
                              </h5>
                              <p className={styles.gridFeatureDescription}>Seamless portal integration</p>
                            </div>
                          </div>

                          <div className={styles.infoBox}>
                            <div className={styles.infoBoxInner}>
                              <div className={styles.infoIconBox}>
                                <Zap className={styles.infoIcon} />
                              </div>
                              <div className={styles.infoContent}>
                                <h5 className={styles.infoTitle}>Hourly Billing Model</h5>
                                <p className={styles.infoDescription}>
                                  Custom development is billed hourly with transparent scope definition and progress
                                  tracking. Schedule a consultation to discuss your project and get a detailed estimate.
                                </p>
                              </div>
                            </div>
                          </div>

                          <button className={styles.outlineButton} onClick={() => setContactFormOpen(true)}>
                            Schedule Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
          <ContactUsForm
            onSuccess={setPopupOverlay}
            isVisible={contactFormOpen}
            onClose={() => setContactFormOpen(false)}
          />
          <RequestDemoForm
            onSuccess={setPopupOverlay}
            isVisible={demoRequestOpen}
            onClose={() => setDemoRequestOpen(false)}
          />
        </div>
        <Confirm
          hideCancel
          show={popupOverlay}
          result={() => setPopupOverlay(null)}
          title="Form Status"
          text={`
          <div>
            <div><b>${popupOverlay?.message}</b></div>
            <div>${popupOverlay?.subhead}</div>
          </div>
        `}
          deleteTitle="Thank You"
          icon="task_alt"
        />
      </div>
    </div>
  );
}
