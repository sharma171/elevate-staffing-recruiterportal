import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

import MainFooter from "../../components/Footer/NewMainFooter";
import ContactUsForm from "../../components/ContactUsForm";
import RequestDemoForm from "../../components/RequestDemoForm";
import { useAuth } from "../../authContext";

import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Users,
  DollarSign,
  Star,
  Zap,
  Clock,
  FileCheck,
  BarChart3,
  AlertTriangle,
  Table2,
  TrendingUp,
  CalendarDays,
  Eye,
  Brain,
  Layers,
  Video,
  Quote,
  Lock,
  HeartHandshake,
  Database,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import HomeHeader from "./Header";

import HeroDashboardMockup from "../../components/HeroDashboardMockup";
import {
  ImmigrationMockup,
  RecruiterAnalysisMockup,
  OnboardingMockup,
  TimesheetMockup,
  I9VerificationMockup,
} from "../../components/productmockups";
import Confirm from "../../components/Confirm";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const AnimatedCounter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="tw-text-3xl tw-font-black tw-text-gradient tw-mb-1">
      {count}
      {suffix}
    </div>
  );
};

const Index = ({ isDemoOpen }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [demoRequestOpen, setDemoRequestOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn === true) {
        navigate("/dashboard");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const open = searchParams.get("open");
      const isContactUs = searchParams.get("contact");

      if (isDemoOpen) {
        if (isContactUs) {
          setContactFormOpen(true);
        } else {
          setDemoRequestOpen(true);
        }
      }

      if (open === "true") {
        setDemoRequestOpen(true);
        searchParams.delete("open");
        setSearchParams(searchParams);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [isDemoOpen, location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBookDemo = () => {
    navigate("/requestademo");
    setIsMobileMenuOpen(false);
    setDemoRequestOpen(true);
  };

  const handleContactUs = () => {
    navigate("/requestademo?contact=true");
    setIsMobileMenuOpen(false);
    setContactFormOpen(true);
  };

  return (
    <>
      <div className="signatureContainer homepageFontfamily">
        <div className="tw-min-h-screen tw-bg-background tw-overflow-x-hidden">
          <HomeHeader contactUsForm={handleContactUs} />

          {/* ===== HERO ===== */}
          <section className="tw-relative tw-min-h-[92vh] tw-flex tw-items-center pt-[4.5rem] tw-pb-4 tw-px-4 tw-bg-card">
            <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
              <div className="tw-absolute tw-inset-0 tw-bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
              <div className="tw-absolute tw-top-10 tw--left-20 tw-w-[400px] tw-h-[400px] tw-rounded-full !bg-primary-subtle tw-blur-[80px]" />
              <div className="tw-absolute tw-top-32 tw--right-20 tw-w-[500px] tw-h-[500px] tw-rounded-full bg-accent-subtle tw-blur-[100px]" />
            </div>

            <div className="tw-container tw-mx-auto tw-max-w-7xl tw-relative tw-z-10">
              <div className="tw-grid lg:tw-grid-cols-2 tw-gap-10 lg:tw-gap-6 tw-items-center">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="tw-space-y-6 tw-max-w-xl">
                  <motion.div variants={fadeUp} custom={0}>
                    <span className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-rounded-full tw-border border-primary-badge bg-primary-badge tw-text-primary tw-text-xs tw-font-semibold tw-tracking-wide tw-uppercase">
                      <Zap className="tw-h-3 tw-w-3" />
                      All-in-One Staffing Platform
                    </span>
                  </motion.div>

                  <motion.h1
                    variants={fadeUp}
                    custom={1}
                    className="tw-text-4xl sm:tw-text-5xl lg:tw-text-6xl tw-font-black tw-tracking-tight tw-leading-[1.08]"
                  >
                    Stop juggling
                    <br />
                    <span className="tw-relative tw-inline-block">
                      <span className="tw-text-gradient">10 tools</span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                        className="tw-absolute tw--bottom-0.5 tw-left-0 tw-right-0 tw-h-[3px] tw-bg-gradient-to-r tw-from-primary tw-to-accent tw-rounded-full tw-origin-left"
                      />
                    </span>{" "}
                    to run
                    <br />
                    your staffing firm.
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    custom={2}
                    className="tw-text-base tw-text-muted-foreground tw-leading-relaxed"
                  >
                    Candidate tracking, recruiter analytics, timesheets, document vault, compliance, weekly status — all
                    in one platform built for H-1B staffing firms.
                  </motion.p>

                  <motion.div variants={fadeUp} custom={3} className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2.5">
                    <Button
                      size="lg"
                      onClick={handleBookDemo}
                      className="tw-text-sm tw-px-7 tw-py-5 tw-group tw-shadow-lg tw-shadow-indigo-200 hover:tw-shadow-xl !bg-[#5336e2] hover:tw-shadow-indigo-300 tw-transition-all"
                    >
                      Book a Free Demo
                      <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4 group-hover:tw-translate-x-1 tw-transition-transform" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="tw-text-sm tw-px-7 tw-py-5 !bg-[#f5f6f9] hover:!bg-[#14b89c]"
                    >
                      See What's Inside
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    custom={4}
                    className="tw-flex tw-flex-wrap tw-gap-4 tw-text-xs tw-text-muted-foreground"
                  >
                    {["No credit card required", "Setup in under a day", "Free onboarding support"].map((t, i) => (
                      <span key={i} className="tw-flex tw-items-center tw-gap-1.5">
                        <CheckCircle2 className="tw-h-3.5 tw-w-3.5 tw-text-accent" />
                        {t}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                  className="tw-relative tw-hidden lg:tw-block"
                >
                  <HeroDashboardMockup />
                </motion.div>
              </div>

              {/* Module Pills */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="tw-mt-10 lg:tw-mt-14"
              >
                <p className="tw-text-center tw-text-[10px] tw-text-muted-foreground tw-uppercase tw-tracking-[0.2em] tw-font-medium tw-mb-3">
                  Everything you need, one login
                </p>
                <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-1.5">
                  {[
                    { label: "Candidate Tracking", icon: Users },
                    { label: "Recruiter Analytics", icon: BarChart3 },
                    { label: "Timesheet Management", icon: Clock },
                    { label: "Document Vault", icon: FileCheck },
                    { label: "Weekly Status Reports", icon: CalendarDays },
                    { label: "H-1B Compliance", icon: Shield },
                    { label: "Invoice & Billing", icon: DollarSign },
                    { label: "AI Resume Matching", icon: Brain },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.04 }}
                      className="tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-card tw-border tw-border-border tw-text-[11px] tw-font-medium tw-text-muted-foreground hover:tw-border-primary-subtle hover:tw-text-foreground tw-transition-colors tw-cursor-default"
                    >
                      <item.icon className="tw-h-3 tw-w-3 tw-text-primary-icon" />
                      {item.label}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ===== TRUSTED BY ===== */}
          <section className="tw-py-8 tw-px-4 tw-bg-muted/60 tw-border-y tw-border-border">
            <div className="tw-container tw-mx-auto tw-max-w-6xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="tw-text-center"
              >
                <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-gap-x-6 tw-gap-y-3">
                  {[
                    { icon: Users, text: "Built for H-1B staffing firms" },
                    { icon: Shield, text: "Compliance-first platform" },
                    { icon: Clock, text: "Setup in under 24 hours" },
                    { icon: TrendingUp, text: "Proven recruiter accountability" },
                    { icon: FileCheck, text: "End-to-end document management" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-card tw-border tw-border-border tw-text-xs tw-font-semibold tw-text-muted-foreground tw-tracking-wide hover:tw-text-foreground hover:tw-border-primary-subtle tw-transition-colors"
                    >
                      <item.icon className="text-primary-icon" size={14} />
                      {item.text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ===== PROBLEM STATEMENT ===== */}
          <section className="tw-py-16 tw-px-4 tw-bg-muted tw-relative tw-overflow-hidden">
            <div className="tw-absolute tw-inset-0 tw-bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--destructive)/0.04),transparent)]" />

            <div className="tw-container tw-mx-auto tw-max-w-6xl tw-relative tw-z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-destructive tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  The problem
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-3"
                >
                  Running a staffing firm shouldn't feel like this.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="tw-text-sm tw-text-muted-foreground tw-max-w-2xl tw-mx-auto tw-leading-relaxed"
                >
                  Most H-1B staffing firms run on duct tape — spreadsheets, WhatsApp threads, shared drives, and
                  constant firefighting. Sound familiar?
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4"
              >
                {[
                  {
                    icon: Table2,
                    title: "Spreadsheet Overload",
                    desc: "Candidates in one sheet, timesheets in another, visa expiries in a third — nothing talks to each other.",
                    stat: "20+ spreadsheets",
                    statLabel: "avg per firm",
                    iconColor: "tw-text-destructive",
                    bg: "!bg-destructive-subtle",
                  },
                  {
                    icon: Eye,
                    title: "Zero Recruiter Visibility",
                    desc: "No idea which recruiter submitted what, who's neglecting candidates, or where your bench really stands.",
                    stat: "40%",
                    statLabel: "bench candidates ignored",
                    iconColor: "tw-text-amber-500",
                    bg: "tw-bg-amber-50",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Compliance Time Bombs",
                    desc: "Visa deadlines slip, timesheets go missing, weekly status reports are late — and you find out too late.",
                    stat: "$50K+",
                    statLabel: "avg violation penalty",
                    iconColor: "tw-text-primary",
                    bg: "!bg-primary-subtle",
                  },
                  {
                    icon: Clock,
                    title: "Hours Lost to Admin",
                    desc: "Your recruiters spend more time chasing documents and filling out forms than actually placing candidates.",
                    stat: "12 hrs/week",
                    statLabel: "wasted on manual tasks",
                    iconColor: "tw-text-accent",
                    bg: "bg-accent-subtle",
                  },
                  {
                    icon: Users,
                    title: "Candidate Drop-Off",
                    desc: "Slow onboarding, missing documents, and delayed I-9 verifications cause candidates to lose patience and leave.",
                    stat: "30%",
                    statLabel: "drop-off during onboarding",
                    iconColor: "tw-text-pink-500",
                    bg: "tw-bg-pink-50",
                  },
                  {
                    icon: DollarSign,
                    title: "Revenue Leakage",
                    desc: "Missed timesheets, unbilled hours, and delayed invoices quietly drain your bottom line every month.",
                    stat: "$8K/mo",
                    statLabel: "avg revenue leaked",
                    iconColor: "tw-text-emerald-500",
                    bg: "tw-bg-emerald-50",
                  },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-group tw-rounded-xl tw-border tw-border-border tw-bg-card tw-p-5 hover:tw-shadow-lg hover:tw--translate-y-0.5 tw-transition-all tw-duration-300"
                  >
                    <div className="tw-flex tw-items-start tw-justify-between tw-mb-3">
                      <div
                        className={`tw-w-10 tw-h-10 tw-rounded-lg ${p.bg} tw-flex tw-items-center tw-justify-center`}
                      >
                        <p.icon className={`tw-h-5 tw-w-5 ${p.iconColor}`} />
                      </div>
                      <div className="tw-text-right">
                        <div className={`tw-text-lg tw-font-black ${p.iconColor}`}>{p.stat}</div>
                        <p className="tw-text-[9px] tw-text-muted-foreground tw-uppercase tw-tracking-wider">
                          {p.statLabel}
                        </p>
                      </div>
                    </div>
                    <h3 className="tw-text-base tw-font-bold tw-mb-1.5">{p.title}</h3>
                    <p className="tw-text-xs tw-text-muted-foreground tw-leading-relaxed">{p.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="tw-mt-10 tw-text-center"
              >
                <div className="tw-inline-flex tw-items-center tw-gap-3 tw-px-5 tw-py-3 tw-rounded-xl tw-bg-card tw-border tw-border-border tw-shadow-sm">
                  <Zap className="tw-h-4 tw-w-4 tw-text-accent" />
                  <p className="tw-text-sm tw-text-muted-foreground">
                    <span className="tw-font-bold tw-text-foreground">ElevateStaffing</span> replaces the chaos with one
                    platform — so you can focus on placements, not paperwork.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ===== FEATURE GRID ===== */}
          <section id="features" className="tw-py-14 tw-px-4 tw-bg-background">
            <div className="tw-container tw-mx-auto tw-max-w-7xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  Platform
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  One platform. Every workflow.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="tw-text-sm tw-text-muted-foreground tw-max-w-xl tw-mx-auto"
                >
                  From the moment a candidate joins your bench to the day they're placed and billing — we've got it
                  covered.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-3"
              >
                {[
                  {
                    icon: Users,
                    title: "Candidate Tracking",
                    desc: "End-to-end lifecycle management — active, bench, pending, inactive. Track projects, assignments, and status changes in real time.",
                    color: "tw-text-blue-500",
                    bg: "tw-bg-blue-50",
                  },
                  {
                    icon: BarChart3,
                    title: "Recruiter Analysis",
                    desc: "Performance scores, submission tracking, accountability reports, and GPT-powered analysis for every recruiter.",
                    color: "tw-text-primary",
                    bg: "!bg-primary-subtle",
                  },
                  {
                    icon: Clock,
                    title: "Timesheet Management",
                    desc: "Candidates submit timesheets directly. Managers approve or reject. Track hours, overtime, and billing.",
                    color: "tw-text-accent",
                    bg: "bg-accent-subtle",
                  },
                  {
                    icon: FileCheck,
                    title: "Document Vault",
                    desc: "Centralized, secure storage for contracts, visas, offer letters, I-9s, and every compliance document.",
                    color: "tw-text-amber-500",
                    bg: "tw-bg-amber-50",
                  },
                  {
                    icon: CalendarDays,
                    title: "Weekly Work Status",
                    desc: "Candidates report weekly progress. Managers get a real-time view of what everyone's working on.",
                    color: "tw-text-pink-500",
                    bg: "tw-bg-pink-50",
                  },
                  {
                    icon: Shield,
                    title: "H-1B Compliance",
                    desc: "LCA tracking, PAF auto-generation, visa expiry alerts at 30/60/90 days. H-1B, OPT, STEM-OPT, EAD, L-1.",
                    color: "tw-text-cyan-500",
                    bg: "tw-bg-cyan-50",
                  },
                  {
                    icon: DollarSign,
                    title: "Invoice & Billing",
                    desc: "Generate invoices, track receivables, manage vendor payments. Connect bank accounts and reconcile.",
                    color: "tw-text-emerald-500",
                    bg: "tw-bg-emerald-50",
                  },
                  {
                    icon: Brain,
                    title: "AI Resume Matching",
                    desc: "Parse resumes, match to job descriptions, score candidates, and surface the best fits — powered by AI.",
                    color: "tw-text-violet-500",
                    bg: "tw-bg-violet-50",
                  },
                  {
                    icon: Layers,
                    title: "HR & Onboarding",
                    desc: "Offer letters, E-Verify workflows, employee self-service portal, HR ticketing, and verification calls.",
                    color: "tw-text-slate-500",
                    bg: "tw-bg-slate-100",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-group tw-bg-card tw-rounded-xl tw-border tw-border-border tw-p-5 hover:tw-shadow-md hover:tw--translate-y-0.5 tw-transition-all tw-duration-300 card-accent-left"
                  >
                    <div
                      className={`tw-w-9 tw-h-9 tw-rounded-lg ${feature.bg} tw-flex tw-items-center tw-justify-center tw-mb-3`}
                    >
                      <feature.icon className={`tw-h-4.5 tw-w-4.5 ${feature.color}`} />
                    </div>
                    <h3 className="tw-text-base tw-font-bold tw-mb-1.5">{feature.title}</h3>
                    <p className="tw-text-xs tw-text-muted-foreground tw-leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== PRODUCT SHOWCASE ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-muted">
            <div className="tw-container tw-mx-auto tw-max-w-7xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  See it in action
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  Built for how staffing firms actually work
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="tw-text-sm tw-text-muted-foreground tw-max-w-xl tw-mx-auto"
                >
                  Every module is designed with staffing operations in mind — not retrofitted from generic HR tools.
                </motion.p>
              </motion.div>

              <div className="tw-grid md:tw-grid-cols-2 tw-gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className="tw-space-y-3 tw-min-h-[340px] tw-bg-card tw-border tw-border-border tw-rounded-2xl tw-p-5 tw-shadow-md"
                >
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <Shield className="tw-h-5 tw-w-5 tw-text-primary" />
                    <h3 className="tw-text-base tw-font-bold">Immigration & Compliance</h3>
                  </div>
                  <p className="tw-text-xs tw-text-muted-foreground tw-leading-relaxed">
                    Track H-1B, OPT, EAD visas with automated alerts at 30/60/90 days. LCA details, passport info, and
                    GC processing — all in one view.
                  </p>
                  <ImmigrationMockup />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="tw-space-y-3 tw-min-h-[340px] tw-bg-card tw-border tw-border-border tw-rounded-2xl tw-p-5 tw-shadow-md"
                >
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <BarChart3 className="tw-h-5 tw-w-5 tw-text-accent" />
                    <h3 className="tw-text-base tw-font-bold">Recruiter Performance</h3>
                  </div>
                  <p className="tw-text-xs tw-text-muted-foreground tw-leading-relaxed">
                    Score every recruiter on submissions, placements, and accountability. GPT-powered insights flag
                    underperformers automatically.
                  </p>
                  <RecruiterAnalysisMockup />
                </motion.div>
              </div>

              <div className="tw-grid md:tw-grid-cols-12 tw-gap-5 tw-mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="tw-space-y-3 md:tw-col-span-3 tw-bg-card tw-border tw-border-border tw-rounded-2xl tw-p-4 tw-shadow-md"
                >
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <Layers className="tw-h-4 tw-w-4 tw-text-primary" />
                    <h3 className="tw-text-sm tw-font-bold">HR & Onboarding</h3>
                  </div>
                  <p className="tw-text-xs tw-text-muted-foreground mt-0">
                    Offer letters, I-9 verification, EMD, direct deposit — automated checklists.
                  </p>
                  <OnboardingMockup />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="tw-space-y-3 md:tw-col-span-5 tw-bg-card tw-border tw-border-border tw-rounded-2xl tw-p-4 tw-shadow-md"
                >
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <Clock className="tw-h-4 tw-w-4 tw-text-accent" />
                    <h3 className="tw-text-sm tw-font-bold">Timesheet Management</h3>
                  </div>
                  <p className="tw-text-xs tw-text-muted-foreground mt-0">
                    Candidates submit hours daily. Managers approve with one click. Track overtime and billing.
                  </p>
                  <TimesheetMockup />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="tw-space-y-3 md:tw-col-span-4 tw-bg-card tw-border tw-border-border tw-rounded-2xl tw-p-4 tw-shadow-md"
                >
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <Video className="tw-h-4 tw-w-4 tw-text-accent" />
                    <h3 className="tw-text-sm tw-font-bold">I-9 Video Verification</h3>
                  </div>
                  <p className="tw-text-xs tw-text-muted-foreground mt-0">
                    Verify employee identity remotely via live video call with recording and E-Verify+ integration.
                  </p>
                  <I9VerificationMockup />
                </motion.div>
              </div>
            </div>
          </section>

          {/* ===== COMPLIANCE DEEP DIVE ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-foreground tw-text-background tw-relative tw-overflow-hidden">
            <div className="tw-absolute tw-inset-0 tw-bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="tw-container tw-mx-auto tw-max-w-7xl tw-relative tw-z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-grid lg:tw-grid-cols-2 tw-gap-10 tw-items-center"
              >
                <div className="tw-space-y-5">
                  <motion.p
                    variants={fadeUp}
                    custom={0}
                    className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em]"
                  >
                    Built Different
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-background"
                  >
                    Your recruiters are accountable.
                    <br />
                    <span className="tw-text-accent">Your candidates are visible.</span>
                  </motion.h2>
                  <motion.p variants={fadeUp} custom={2} className="tw-text-sm text-background-soft tw-leading-relaxed">
                    Know exactly how many submissions each recruiter made, which candidates are being neglected, and
                    where your compliance gaps are — all from one dashboard.
                  </motion.p>
                  <motion.div variants={fadeUp} custom={3} className="tw-flex tw-flex-wrap tw-gap-1.5">
                    {[
                      "Recruiter Scorecards",
                      "Submission Tracking",
                      "No-Submission Analysis",
                      "GPT Insights",
                      "Performance Alerts",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="tw-px-2.5 tw-py-1 tw-rounded-full bg-background-subtle !border !border-background-subtle tw-text-xs tw-font-medium text-background-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                </div>

                <motion.div variants={fadeUp} custom={2} className="tw-grid tw-grid-cols-2 tw-gap-3">
                  {[
                    { value: "142", label: "Candidates tracked" },
                    { value: "23", label: "Daily submissions avg" },
                    { value: "92/100", label: "Top recruiter score" },
                    { value: "100%", label: "Timesheet compliance" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-background-subtle tw-backdrop-blur-sm !border border-background-subtle tw-rounded-xl tw-p-5 tw-text-center hover:bg-background-subtle-hover tw-transition-colors"
                    >
                      <div className="tw-text-2xl tw-font-bold tw-text-accent tw-mb-1">{s.value}</div>
                      <p className="tw-text-xs tw-text-background-muted">{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ===== HOW IT WORKS ===== */}
          <section id="how-it-works" className="tw-py-14 tw-px-4 tw-bg-muted">
            <div className="tw-container tw-mx-auto tw-max-w-5xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  Getting Started
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  Live in 24 hours, not 24 weeks.
                </motion.h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid md:tw-grid-cols-3 tw-gap-6"
              >
                {[
                  {
                    num: "01",
                    title: "Import Everything",
                    desc: "Add candidates, recruiters, and documents. Bulk CSV import gets you started in minutes.",
                    color: "tw-bg-blue-500",
                  },
                  {
                    num: "02",
                    title: "Automate the Grind",
                    desc: "Timesheets collect themselves. Visa alerts fire automatically. Scores update daily.",
                    color: "tw-bg-primary",
                  },
                  {
                    num: "03",
                    title: "Run, Don't Manage",
                    desc: "Focus on placements and growth. Let the platform handle compliance and tracking.",
                    color: "tw-bg-accent",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-relative tw-group tw-text-center tw-space-y-3"
                  >
                    <div
                      className={`tw-w-12 tw-h-12 tw-rounded-xl ${step.color} tw-flex tw-items-center tw-justify-center tw-mx-auto tw-shadow-md group-hover:tw-scale-110 tw-transition-transform`}
                    >
                      <span className="tw-text-sm tw-font-bold tw-text-primary-foreground">{step.num}</span>
                    </div>
                    <h3 className="tw-text-lg tw-font-bold">{step.title}</h3>
                    <p className="tw-text-sm tw-text-muted-foreground tw-leading-relaxed mt-1">{step.desc}</p>
                    {i < 2 && (
                      <div className="tw-hidden md:tw-block tw-absolute tw-top-6 tw-left-[60%] tw-w-[80%] tw-h-[2px] tw-bg-gradient-to-r tw-from-indigo-200 tw-via-teal-100 tw-to-transparent" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== PLAN COMPARISON ===== */}
          <section id="plans" className="tw-py-14 tw-px-4 tw-bg-background">
            <div className="tw-container tw-mx-auto tw-max-w-5xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  Plans
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  Choose the plan that fits your team
                </motion.h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid md:tw-grid-cols-2 tw-gap-4"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="tw-relative tw-bg-card tw-rounded-xl tw-border-2 tw-border-primary tw-p-6 hover:tw-shadow-lg hover:tw--translate-y-0.5 tw-transition-all tw-duration-300"
                >
                  <div className="tw-absolute tw--top-3 tw-left-1/2 tw--translate-x-1/2">
                    <span className="bg-gradient-primary tw-px-3 tw-py-0.5 tw-rounded-full text-[10px] font-bold d-flex align-items-center gap-1 text-white">
                      <Star className="tw-h-3 tw-w-3" /> <span className="pt-[2px]"> POPULAR</span>
                    </span>
                  </div>
                  <h3 className="tw-text-xl tw-font-bold tw-mb-1">Elevate Staffing</h3>
                  <p className="tw-text-xs tw-text-muted-foreground tw-mb-5">
                    Complete operations platform for staffing firms
                  </p>
                  <div className="tw-space-y-2.5 tw-mb-6">
                    {[
                      "Candidate lifecycle management",
                      "Recruiter performance analytics",
                      "Timesheet submission & approval",
                      "Document vault & compliance hub",
                      "Weekly work status tracking",
                      "H-1B / visa compliance alerts",
                      "Invoice & billing management",
                      "HR ticketing & onboarding",
                    ].map((f, idx) => (
                      <div key={idx} className="tw-flex tw-items-center tw-gap-2">
                        <CheckCircle2 className="tw-h-3.5 tw-w-3.5 tw-text-accent tw-flex-shrink-0" />
                        <span className="tw-text-xs tw-text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="tw-w-full !bg-[#5336e2] hover:!bg-[#5336e2e6]" size="lg" onClick={handleBookDemo}>
                    Book a Demo <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                  </Button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  custom={1}
                  className="tw-bg-card tw-rounded-xl tw-border tw-border-border tw-p-6 hover:tw-shadow-lg hover:tw--translate-y-0.5 tw-transition-all tw-duration-300 d-flex flex-column justify-content-between"
                >
                  <div>
                    <h3 className="tw-text-xl tw-font-bold tw-mb-1">Elevate Recruit</h3>
                    <p className="tw-text-xs tw-text-muted-foreground tw-mb-5">
                      AI-powered recruiting + full operations
                    </p>
                    <p className="tw-text-xs tw-font-semibold tw-mb-2.5">Everything in Elevate Staffing, plus:</p>
                    <div className="tw-space-y-2.5 tw-mb-6">
                      {[
                        "AI resume-to-JD matching",
                        "AI candidate ranking & scoring",
                        "Interview question generation",
                        "Skills readiness assessments",
                      ].map((f, idx) => (
                        <div key={idx} className="tw-flex tw-items-center tw-gap-2">
                          <CheckCircle2 className="tw-h-3.5 tw-w-3.5 tw-text-accent tw-flex-shrink-0" />
                          <span className="tw-text-xs tw-text-muted-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="tw-w-full !bg-[#5336e2] hover:!bg-[#5336e2e6]" size="lg" onClick={handleBookDemo}>
                    Book a Demo <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                  </Button>
                </motion.div>
              </motion.div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Need enterprise pricing or custom integrations?{" "}
                <button onClick={handleContactUs} className="text-[#5336e2] font-medium hover:underline">
                  Talk to us →
                </button>
              </p>
            </div>
          </section>

          {/* ===== RESULTS ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-muted">
            <div className="tw-container tw-mx-auto tw-max-w-5xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  Results
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold"
                >
                  Teams using ElevateStaffing report
                </motion.h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3"
              >
                {[
                  { value: 50, suffix: "%", label: "More candidate placements", icon: TrendingUp },
                  { value: 95, suffix: "%", label: "Fewer compliance violations", icon: Shield },
                  { value: 10, suffix: "+", label: "Hours saved per recruiter/week", icon: Clock },
                  { value: 100, suffix: "%", label: "Timesheet submission rate", icon: CheckCircle2 },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-text-center tw-p-6 tw-rounded-xl tw-bg-card tw-border tw-border-border hover:tw-shadow-md hover:tw--translate-y-0.5 tw-transition-all tw-duration-300"
                  >
                    <div className="tw-w-10 tw-h-10 tw-rounded-lg !bg-primary-subtle tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3">
                      <s.icon className="tw-h-5 tw-w-5 tw-text-primary" />
                    </div>
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                    <p className="tw-text-xs tw-text-muted-foreground tw-font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-center text-[10px] text-muted-foreground mt-6">Based on customer-reported outcomes.</p>
            </div>
          </section>

          {/* ===== TESTIMONIALS ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-background">
            <div className="tw-container tw-mx-auto tw-max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  What our customers say
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold"
                >
                  Loved by staffing leaders
                </motion.h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid md:tw-grid-cols-3 tw-gap-4"
              >
                {[
                  {
                    quote:
                      "We replaced 6 tools with ElevateStaffing. Recruiters spend 80% of their time actually recruiting now.",
                    name: "CEO",
                    title: "H-1B Staffing Firm",
                    company: "50+ employees",
                  },
                  {
                    quote:
                      "The compliance alerts alone saved us from violations in the first month. ROI was immediate.",
                    name: "Operations Director",
                    title: "IT Consulting Company",
                    company: "Midwest, US",
                  },
                  {
                    quote:
                      "Recruiter scorecards changed everything. We finally have visibility into real performance data.",
                    name: "VP of Talent Acquisition",
                    title: "National Staffing Agency",
                    company: "200+ consultants",
                  },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-bg-card tw-rounded-xl tw-border tw-border-border tw-p-6 hover:tw-shadow-lg tw-transition-all tw-duration-300 tw-relative"
                  >
                    <Quote className="tw-h-8 tw-w-8 tw-text-primary/10 tw-absolute tw-top-4 tw-right-4" />
                    <p className="tw-text-sm tw-text-muted-foreground tw-leading-relaxed tw-mb-5 tw-relative tw-z-10">
                      "{t.quote}"
                    </p>
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="tw-text-sm tw-font-semibold">{t.name}</p>
                        <p className="tw-text-[11px] tw-text-muted-foreground mt-0">
                          {t.title} · {t.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== COMPANY STATS ===== */}
          <section className="py-14 px-4 bg-gradient-dark text-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_50%,hsl(var(--primary)/0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_20%,hsl(var(--accent)/0.08),transparent)]" />
            <div className="container mx-auto max-w-5xl relative z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="text-center mb-10"
              >
                <motion.h2
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
                >
                  Built to scale with your staffing firm
                </motion.h2>
                <motion.p variants={fadeUp} custom={1} className="text-sm text-white/55 mt-2 max-w-lg mx-auto">
                  Join hundreds of staffing firms already running smarter operations.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {[
                  { value: 85, suffix: "K+", label: "Timesheets Processed" },
                  { value: 120, suffix: "K+", label: "Compliance Alerts Sent" },
                  { value: 99, suffix: ".9%", label: "Platform Uptime" },
                  { value: 24, suffix: "/7", label: "Customer Support" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="text-center p-6 rounded-xl bg-white/5 !border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-colors"
                  >
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                    <p className="text-xs text-white/55 font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== TRUST & SECURITY ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-muted">
            <div className="tw-container tw-mx-auto tw-max-w-5xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  Trust & Security
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  Your data. Your control.
                </motion.h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={stagger}
                className="tw-grid md:tw-grid-cols-3 tw-gap-4"
              >
                {[
                  {
                    icon: Lock,
                    title: "Data Security",
                    desc: "End-to-end encryption and regular security audits keep your data safe.",
                    color: "tw-text-primary",
                    bg: "!bg-primary-subtle",
                  },
                  {
                    icon: HeartHandshake,
                    title: "No Hidden Fees",
                    desc: "Transparent pricing with no surprise charges or per-candidate surcharges.",
                    color: "tw-text-accent",
                    bg: "bg-accent-subtle",
                  },
                  {
                    icon: Database,
                    title: "Your Data, Your Control",
                    desc: "Export your data anytime. We never sell or share your business info.",
                    color: "tw-text-emerald-500",
                    bg: "tw-bg-emerald-50",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="tw-bg-card tw-rounded-xl tw-border tw-border-border tw-p-6 hover:tw-shadow-md hover:tw--translate-y-0.5 tw-transition-all tw-duration-300 tw-text-center"
                  >
                    <div
                      className={`tw-w-12 tw-h-12 tw-rounded-xl ${item.bg} tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4`}
                    >
                      <item.icon className={`tw-h-6 tw-w-6 ${item.color}`} />
                    </div>
                    <h3 className="tw-text-base tw-font-bold tw-mb-2">{item.title}</h3>
                    <p className="tw-text-xs tw-text-muted-foreground tw-leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== FAQ ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-background">
            <div className="tw-container tw-mx-auto tw-max-w-3xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="tw-text-center tw-mb-10"
              >
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-accent tw-font-semibold tw-text-xs tw-uppercase tw-tracking-[0.2em] tw-mb-2"
                >
                  FAQ
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2"
                >
                  Common questions, answered
                </motion.h2>
              </motion.div>

              <Accordion type="single" collapsible className="tw-space-y-2">
                {[
                  {
                    q: "How long does it take to get started?",
                    a: "Most teams are fully set up within 24 hours. We support bulk CSV imports so you can bring in your existing candidate, recruiter, and vendor data in minutes. Our onboarding team walks you through the entire process.",
                  },
                  {
                    q: "Do I need to replace all my existing tools at once?",
                    a: "Not at all. You can start with the modules that matter most — like compliance alerts or timesheet tracking — and roll out additional features at your own pace.",
                  },
                  {
                    q: "Is my data secure?",
                    a: "Absolutely. We use AES-256 encryption, role-based access controls, and regular security audits. Your data is never shared or sold. Full data export is available anytime.",
                  },
                  {
                    q: "How does recruiter performance tracking work?",
                    a: "Every recruiter gets a daily performance score based on submissions, placements, and response times. GPT-powered insights flag trends and underperformers automatically, so managers can coach with data — not guesswork.",
                  },
                  {
                    q: "Can I try ElevateStaffing before committing?",
                    a: "Yes! Book a free demo and we'll give you a full walkthrough tailored to your firm's size and workflow. No credit card required, no obligations.",
                  },
                  {
                    q: "Do you offer custom integrations?",
                    a: "Yes. We can integrate with your existing ATS, accounting software, or communication tools. Contact our sales team to discuss your specific needs.",
                  },
                ].map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="tw-bg-card tw-border tw-border-border tw-rounded-xl tw-px-5"
                  >
                    <AccordionTrigger className="tw-text-sm tw-font-semibold tw-text-left hover:tw-no-underline tw-py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="tw-text-sm tw-text-muted-foreground tw-leading-relaxed tw-pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* ===== FINAL CTA ===== */}
          <section className="tw-py-14 tw-px-4 tw-bg-foreground tw-text-background tw-relative tw-overflow-hidden">
            <div className="tw-absolute tw-inset-0 tw-bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--accent)/0.15),transparent)]" />
            <div className="tw-container tw-mx-auto tw-max-w-3xl tw-text-center tw-relative tw-z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
              >
                <motion.h2
                  variants={fadeUp}
                  custom={0}
                  className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-4 tw-text-background"
                >
                  Your recruiters are submitting. But do you know where?
                  <br />
                  <span className="tw-text-accent">Get complete visibility from one dashboard.</span>
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  custom={1}
                  className="tw-text-sm text-background-soft tw-mb-8 tw-max-w-xl tw-mx-auto"
                >
                  ElevateStaffing gives H-1B staffing firms full control over candidates, compliance, timesheets, and
                  recruiter performance — so nothing slips through the cracks.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  custom={2}
                  className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-justify-center"
                >
                  <Button
                    size="lg"
                    onClick={handleBookDemo}
                    className="bg-[#14b89c] hover:!tw-bg-accent/90 tw-text-accent-foreground tw-text-sm tw-px-7 tw-py-5"
                  >
                    Book a Free Demo
                    <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                  </Button>

                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={handleContactUs}
                    className="tw-border tw-border-gray-600 tw-text-background hover:tw-bg-gray-800 tw-text-sm tw-px-7 tw-py-5"
                  >
                    Contact Sales
                  </Button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  custom={3}
                  className="tw-flex tw-flex-wrap tw-justify-center tw-gap-6 tw-mt-8 tw-text-xs text-background-muted"
                >
                  {["Free onboarding support", "No credit card required", "Setup in under a day"].map((t, i) => (
                    <span key={i} className="tw-flex tw-items-center tw-gap-1.5">
                      <CheckCircle2 className="tw-h-3.5 tw-w-3.5" />
                      {t}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
      <MainFooter />
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
    </>
  );
};

export default Index;
