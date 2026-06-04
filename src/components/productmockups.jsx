import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Star,
  Calendar,
  Upload,
  Briefcase,
  Brain,
  Flag,
  Target,
  ChevronRight,
  Eye,
  Pencil,
  DollarSign,
  Video,
  Mic,
  MicOff,
  MonitorPlay,
  UserCheck,
  Camera,
} from "lucide-react";

const mockupDelay = 0.3;

/* ─── Immigration Tab Mockup ─── */
export const ImmigrationMockup = () => (
  <div className="tw-relative">
    <div className="tw-absolute tw--inset-4 tw-bg-gradient-to-br tw-from-primary/10 tw-via-accent/5 tw-to-transparent tw-rounded-2xl tw-blur-2xl" />
    <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-overflow-hidden">
      {/* Tab bar */}
      <div className="tw-flex tw-items-center tw-gap-0 tw-border-b tw-border-border tw-bg-muted/40">
        {["Overview", "Immigration", "Documents", "Timesheets"].map((tab, i) => (
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: mockupDelay + i * 0.08 }}
            className={`tw-px-3 tw-py-2 tw-text-[10px] tw-font-medium tw-border-b-2 ${
              i === 1 ? "tw-border-primary tw-text-primary" : "tw-border-transparent tw-text-muted-foreground"
            }`}
          >
            {tab}
          </motion.div>
        ))}
      </div>

      <div className="tw-p-3 tw-space-y-2.5">
        {/* Alert banner */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.3 }}
          className="tw-flex tw-items-center tw-gap-2 tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-amber-500/10 tw-border tw-border-amber-500/20"
        >
          <AlertTriangle className="tw-h-3 tw-w-3 tw-text-amber-500 tw-flex-shrink-0" />
          <span className="tw-text-[9px] tw-text-amber-600 tw-font-medium">
            H-1B visa expiring in 28 days — Action required
          </span>
        </motion.div>

        {/* Visa overview card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.45 }}
          className="tw-bg-muted/30 tw-rounded-lg tw-p-2.5"
        >
          <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-2">
            <Shield className="tw-h-3 tw-w-3 tw-text-primary" />
            <span className="tw-text-[10px] tw-font-semibold">Visa Overview</span>
          </div>
          <div className="tw-grid tw-grid-cols-3 tw-gap-2">
            {[
              { label: "Visa Type", value: "H-1B" },
              { label: "Status", value: "Active", color: "tw-text-accent" },
              { label: "Expiry", value: "03/24/2026" },
            ].map((f, i) => (
              <div key={i}>
                <p className="tw-text-[8px] tw-text-muted-foreground">{f.label}</p>
                <p className={`tw-text-[10px] tw-font-semibold ${f.color || ""}`}>{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Collapsible sections preview */}
        <div className="tw-space-y-1">
          {["Passport Details", "I-94 Information", "LCA Details", "GC Processing"].map((section, i) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.6 + i * 0.08 }}
              className="tw-flex tw-items-center tw-justify-between tw-px-2.5 tw-py-1.5 tw-rounded tw-bg-background tw-border tw-border-border"
            >
              <span className="tw-text-[9px] tw-font-medium">{section}</span>
              <span className="tw-text-[8px] tw-text-muted-foreground">›</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Recruiter Analysis Mockup ─── */
export const RecruiterAnalysisMockup = () => (
  <div className="tw-relative">
    <div className="tw-absolute tw--inset-4 tw-bg-gradient-to-br tw-from-accent/10 tw-via-primary/5 tw-to-transparent tw-rounded-2xl tw-blur-2xl" />
    <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-overflow-hidden">
      {/* Header with recruiter info */}
      <div className="tw-px-3 tw-py-2 tw-border-b tw-border-border tw-bg-muted/40">
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <BarChart3 className="tw-h-3 tw-w-3 tw-text-primary" />
          <span className="tw-text-[10px] tw-font-semibold">Kevin Rodriguez</span>
          <span className="tw-ml-auto tw-text-[8px] tw-text-muted-foreground">Team-Alpha · Sales</span>
          <span className="tw-px-1.5 tw-py-0.5 tw-rounded-full tw-bg-accent/10 tw-text-accent tw-text-[7px] tw-font-semibold">
            Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: mockupDelay + 0.1 }}
        className="tw-flex tw-border-b tw-border-border tw-bg-muted/20"
      >
        {["Overview", "AI Analysis", "Zero Sub (5)", "Submissions"].map((tab, i) => (
          <div
            key={tab}
            className={`tw-px-2.5 tw-py-1.5 tw-text-[8px] tw-font-medium tw-border-b-2 ${
              i === 1 ? "tw-border-primary tw-text-primary" : "tw-border-transparent tw-text-muted-foreground"
            }`}
          >
            {tab}
          </div>
        ))}
      </motion.div>

      <div className="tw-p-3 tw-space-y-2.5">
        {/* AI Performance header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.2 }}
          className="tw-flex tw-items-center tw-justify-between"
        >
          <div className="tw-flex tw-items-center tw-gap-2">
            <Brain className="tw-h-3 tw-w-3 tw-text-primary" />
            <span className="tw-text-[10px] tw-font-semibold">AI Performance Analysis</span>
            <span className="tw-text-[7px] tw-text-muted-foreground">• Last 7 days</span>
          </div>
          <span className="tw-px-2 tw-py-0.5 tw-rounded tw-bg-destructive/10 tw-text-destructive tw-text-[8px] tw-font-bold">
            Poor
          </span>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.3 }}
          className="tw-flex tw-items-baseline tw-gap-1"
        >
          <span className="tw-text-2xl tw-font-black tw-text-destructive">2</span>
          <span className="tw-text-[10px] tw-text-muted-foreground">/ 10</span>
        </motion.div>

        {/* Executive summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.35 }}
          className="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-primary/5 tw-border tw-border-primary/10"
        >
          <p className="tw-text-[8px] tw-font-semibold tw-text-primary tw-mb-0.5">Executive Summary</p>
          <p className="tw-text-[7px] tw-text-muted-foreground tw-leading-relaxed">
            Last interview secured with James Chen for DataFlow Corp 18 days ago. Trend is declining. Average rate
            variance minimal at $85/hr.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.45 }}
          className="tw-grid tw-grid-cols-4 tw-gap-1.5"
        >
          {[
            { label: "Total Submissions", value: "3", icon: "📋" },
            { label: "Interviews Secured", value: "0", icon: "📈" },
            { label: "Assigned Candidates", value: "3", icon: "👥" },
            { label: "Avg Sub/Day", value: "0.43", icon: "📊", alert: true },
          ].map((s, i) => (
            <div key={i} className="tw-bg-background tw-rounded-md tw-px-2 tw-py-1.5 tw-border tw-border-border">
              <div className="tw-flex tw-items-center tw-gap-1 tw-mb-0.5">
                <span className="tw-text-[8px]">{s.icon}</span>
                <span className={`tw-text-[12px] tw-font-bold ${s.alert ? "tw-text-destructive" : ""}`}>{s.value}</span>
              </div>
              <p className="tw-text-[6px] tw-text-muted-foreground tw-leading-tight">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Red flags */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.6 }}
          className="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-destructive/5 tw-border tw-border-destructive/15"
        >
          <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-1">
            <Flag className="tw-h-2.5 tw-w-2.5 tw-text-destructive" />
            <span className="tw-text-[8px] tw-font-semibold tw-text-destructive">Critical Issues & Red Flags</span>
          </div>
          <div className="tw-space-y-0.5">
            {[
              "All 3 submissions have 0% response rate",
              "Neglected candidates: James Chen, Maria Lopez",
              "Vendor concentration risk — 33% single vendor",
            ].map((flag, i) => (
              <div key={i} className="tw-flex tw-items-start tw-gap-1">
                <AlertTriangle className="tw-h-2 tw-w-2 tw-text-destructive/70 tw-mt-0.5 tw-flex-shrink-0" />
                <span className="tw-text-[7px] tw-text-destructive/80">{flag}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.7 }}
          className="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-accent/5 tw-border tw-border-accent/15"
        >
          <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-1">
            <CheckCircle2 className="tw-h-2.5 tw-w-2.5 tw-text-accent" />
            <span className="tw-text-[8px] tw-font-semibold tw-text-accent">Strengths</span>
          </div>
          <div className="tw-space-y-0.5">
            {["Submission Rate per Candidate: 100%", "Total Unique Clients/Vendors: 3"].map((s, i) => (
              <div key={i} className="tw-flex tw-items-start tw-gap-1">
                <CheckCircle2 className="tw-h-2 tw-w-2 tw-text-accent/70 tw-mt-0.5 tw-flex-shrink-0" />
                <span className="tw-text-[7px] tw-text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

/* ─── Onboarding Mockup ─── */
export const OnboardingMockup = () => (
  <div className="tw-relative">
    <div className="tw-absolute tw--inset-4 tw-bg-gradient-to-br tw-from-primary/8 tw-via-accent/5 tw-to-transparent tw-rounded-2xl tw-blur-2xl" />
    <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-overflow-hidden">
      <div className="tw-px-3 tw-py-2 tw-border-b tw-border-border tw-bg-muted/40">
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <Briefcase className="tw-h-3 tw-w-3 tw-text-accent" />
          <span className="tw-text-[10px] tw-font-semibold">Onboarding — David Park</span>
        </div>
      </div>

      <div className="tw-p-3 tw-space-y-2">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.2 }}
        >
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
            <span className="tw-text-[9px] tw-text-muted-foreground">Onboarding Progress</span>
            <span className="tw-text-[10px] tw-font-bold tw-text-accent">75%</span>
          </div>
          <div className="tw-w-full tw-h-1.5 tw-bg-muted tw-rounded-full tw-overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "75%" }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.4, duration: 0.8 }}
              className="tw-h-full tw-bg-accent tw-rounded-full"
            />
          </div>
        </motion.div>

        {/* Checklist */}
        <div className="tw-space-y-1">
          {[
            { task: "Offer Letter Signed", done: true },
            { task: "I-9 Verification", done: true },
            { task: "E-Verify Submitted", done: true },
            { task: "Direct Deposit Setup", done: false },
            { task: "IT Equipment Request", done: false },
          ].map((item, i) => (
            <motion.div
              key={item.task}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.5 + i * 0.07 }}
              className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1 tw-rounded tw-bg-background tw-border tw-border-border"
            >
              {item.done ? (
                <CheckCircle2 className="tw-h-3 tw-w-3 tw-text-accent tw-flex-shrink-0" />
              ) : (
                <div className="tw-w-3 tw-h-3 tw-rounded-full tw-border tw-border-muted-foreground/30 tw-flex-shrink-0" />
              )}
              <span
                className={`tw-text-[9px] ${item.done ? "tw-line-through tw-text-muted-foreground" : "tw-font-medium"}`}
              >
                {item.task}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Pending action */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.9 }}
          className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1.5 tw-rounded-lg tw-bg-primary/5 tw-border tw-border-primary/15"
        >
          <Upload className="tw-h-3 tw-w-3 tw-text-primary" />
          <span className="tw-text-[9px] tw-text-primary tw-font-medium">Upload voided check for direct deposit</span>
        </motion.div>
      </div>
    </div>
  </div>
);

/* ─── Timesheet Mockup (Compact) ─── */
export const TimesheetMockup = () => (
  <div className="tw-relative">
    <div className="tw-absolute tw--inset-4 tw-bg-gradient-to-br tw-from-accent/8 tw-via-primary/5 tw-to-transparent tw-rounded-2xl tw-blur-2xl" />
    <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-overflow-hidden">
      {/* Header */}
      <div className="tw-px-3 tw-py-1.5 tw-border-b tw-border-border tw-bg-muted/40 tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <Clock className="tw-h-3 tw-w-3 tw-text-accent" />
          <span className="tw-text-[10px] tw-font-semibold">Timesheets</span>
        </div>
        <span className="tw-text-[8px] tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-accent/10 tw-text-accent tw-font-medium">
          Week 8 · Feb 17–21
        </span>
      </div>

      {/* Candidate bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: mockupDelay + 0.1 }}
        className="tw-px-3 tw-py-1 tw-border-b tw-border-border tw-bg-muted/20 tw-flex tw-items-center tw-gap-2"
      >
        <div className="tw-w-4 tw-h-4 tw-rounded-full tw-bg-gradient-to-br tw-from-primary/20 tw-to-accent/20 tw-flex tw-items-center tw-justify-center">
          <span className="tw-text-[6px] tw-font-bold tw-text-primary">DP</span>
        </div>
        <div>
          <p className="tw-text-[8px] tw-font-medium tw-leading-tight">David Park</p>
          <p className="tw-text-[6px] tw-text-muted-foreground mt-0">Software Engineer · CloudNova</p>
        </div>
        <div className="tw-ml-auto tw-flex tw-gap-1">
          <span className="tw-px-1 tw-py-0.5 tw-rounded-full tw-bg-accent/10 tw-text-accent tw-text-[6px] tw-font-semibold">
            H-1B
          </span>
          <span className="tw-px-1 tw-py-0.5 tw-rounded-full tw-bg-primary/10 tw-text-primary tw-text-[6px] tw-font-semibold">
            $85/hr
          </span>
        </div>
      </motion.div>

      <div className="tw-p-2.5 tw-space-y-1.5">
        {/* Compact rows */}
        {[
          { day: "Mon", project: "API Migration", reg: 8, ot: 0, status: "approved" },
          { day: "Tue", project: "API Migration", reg: 8, ot: 1.5, status: "approved" },
          { day: "Wed", project: "Dashboard UI", reg: 8, ot: 0, status: "approved" },
          { day: "Thu", project: "Dashboard UI", reg: 8, ot: 0, status: "pending" },
          { day: "Fri", project: "Code Review", reg: 7.5, ot: 0, status: "pending" },
        ].map((row, i) => (
          <motion.div
            key={row.day}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: mockupDelay + 0.2 + i * 0.06 }}
            className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1 tw-rounded tw-bg-background tw-border tw-border-border"
          >
            <span className="tw-text-[9px] tw-font-semibold tw-w-6">{row.day}</span>
            <span className="tw-text-[8px] tw-text-muted-foreground tw-flex-1 tw-truncate">{row.project}</span>
            <span className="tw-text-[8px] tw-font-medium tw-w-5 tw-text-center">{row.reg}h</span>
            <span
              className={`tw-text-[8px] tw-font-medium tw-w-5 tw-text-center ${row.ot > 0 ? "tw-text-amber-500" : "tw-text-muted-foreground/30"}`}
            >
              {row.ot > 0 ? `${row.ot}h` : "—"}
            </span>
            <span
              className={`tw-text-[7px] tw-px-1.5 tw-py-0.5 tw-rounded-full tw-font-medium ${
                row.status === "approved" ? "tw-bg-accent/10 tw-text-accent" : "tw-bg-amber-500/10 tw-text-amber-500"
              }`}
            >
              {row.status === "approved" ? "✓" : "⏳"}
            </span>
          </motion.div>
        ))}

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.55 }}
          className="tw-flex tw-items-center tw-justify-between tw-px-2 tw-py-1.5 tw-rounded-md tw-bg-muted/40 tw-border tw-border-border"
        >
          <span className="tw-text-[8px] tw-font-bold">Total</span>
          <div className="tw-flex tw-items-center tw-gap-3">
            <span className="tw-text-[8px] tw-font-bold tw-text-accent">39.5h</span>
            <span className="tw-text-[8px] tw-font-bold tw-text-amber-500">1.5h OT</span>
            <span className="tw-text-[9px] tw-font-bold tw-text-accent">$3,564</span>
          </div>
        </motion.div>

        {/* Approve bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.65, type: "spring", stiffness: 200 }}
          className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1 tw-rounded-lg tw-bg-primary/5 tw-border tw-border-primary/15"
        >
          <CheckCircle2 className="tw-h-2.5 tw-w-2.5 tw-text-primary tw-flex-shrink-0" />
          <span className="tw-text-[7px] tw-text-primary tw-font-medium tw-flex-1">2 pending entries</span>
          <span className="tw-text-[6px] tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-primary tw-text-primary-foreground tw-font-semibold">
            Approve All
          </span>
        </motion.div>
      </div>
    </div>
  </div>
);

/* ─── I-9 Video Verification Mockup ─── */
export const I9VerificationMockup = () => (
  <div className="tw-relative">
    <div className="tw-absolute tw--inset-4 tw-bg-gradient-to-br tw-from-cyan-500/10 tw-via-primary/5 tw-to-transparent tw-rounded-2xl tw-blur-2xl" />
    <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-overflow-hidden">
      {/* Header */}
      <div className="tw-px-3 tw-py-1.5 tw-border-b tw-border-border tw-bg-muted/40 tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <Video className="tw-h-3 tw-w-3 tw-text-cyan-500" />
          <span className="tw-text-[10px] tw-font-semibold">I-9 Video Verification</span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.2 }}
          className="tw-flex tw-items-center tw-gap-1 tw-px-1.5 tw-py-0.5 tw-rounded-full tw-bg-accent/10 tw-text-accent tw-text-[7px] tw-font-semibold"
        >
          <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-accent tw-animate-pulse" />
          Live Session
        </motion.span>
      </div>

      <div className="tw-p-3 tw-space-y-2">
        {/* Video call area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.15 }}
          className="tw-relative tw-rounded-lg tw-bg-gradient-to-br tw-from-muted/80 tw-to-muted/40 tw-border tw-border-border tw-overflow-hidden"
        >
          {/* Main video (employer view) */}
          <div className="tw-aspect-[16/10] tw-flex tw-items-center tw-justify-center tw-relative">
            <div className="tw-text-center tw-space-y-1">
              <div className="tw-w-10 tw-h-10 tw-mx-auto tw-rounded-full tw-bg-primary/10 tw-flex tw-items-center tw-justify-center">
                <UserCheck className="tw-h-5 tw-w-5 tw-text-primary/60" />
              </div>
              <p className="tw-text-[8px] tw-text-muted-foreground tw-font-medium">HR Verifier — Sarah Mitchell</p>
            </div>

            {/* Employee PiP */}
            <motion.div
              initial={{ opacity: 0, x: 10, y: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.35 }}
              className="tw-absolute tw-bottom-2 tw-right-2 tw-w-16 tw-h-12 tw-rounded-md tw-bg-gradient-to-br tw-from-accent/15 tw-to-primary/10 tw-border tw-border-border tw-flex tw-items-center tw-justify-center"
            >
              <div className="tw-text-center">
                <Camera className="tw-h-3 tw-w-3 tw-mx-auto tw-text-accent/60" />
                <p className="tw-text-[5px] tw-text-muted-foreground tw-mt-0.5">Employee</p>
              </div>
            </motion.div>

            {/* Recording indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.4 }}
              className="tw-absolute tw-top-2 tw-left-2 tw-flex tw-items-center tw-gap-1 tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-destructive/90 tw-text-destructive-foreground"
            >
              <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-destructive-foreground tw-animate-pulse" />
              <span className="tw-text-[6px] tw-font-bold">REC 02:34</span>
            </motion.div>
          </div>

          {/* Call controls */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: mockupDelay + 0.45 }}
            className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-1.5 tw-bg-muted/60 tw-border-t tw-border-border"
          >
            {[
              { icon: Mic, active: true },
              { icon: Video, active: true },
              { icon: MonitorPlay, active: false },
            ].map((ctrl, i) => (
              <div
                key={i}
                className={`tw-w-5 tw-h-5 tw-rounded-full tw-flex tw-items-center tw-justify-center ${
                  ctrl.active ? "tw-bg-primary/10 tw-text-primary" : "tw-bg-muted tw-text-muted-foreground"
                }`}
              >
                <ctrl.icon className="tw-h-2.5 tw-w-2.5" />
              </div>
            ))}
            <div className="tw-w-5 tw-h-5 tw-rounded-full tw-bg-destructive/10 tw-text-destructive tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-[7px] tw-font-bold">✕</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Verification checklist */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.5 }}
          className="tw-space-y-1"
        >
          <p className="tw-text-[8px] tw-font-semibold tw-text-muted-foreground tw-uppercase tw-tracking-wider tw-px-1">
            Employer Checklist
          </p>
          {[
            { label: "Identity document reviewed", done: true },
            { label: "Employment authorization verified", done: true },
            { label: "Physical presence confirmed via video", done: false },
            { label: "Section 2 signed by employer", done: false },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: mockupDelay + 0.55 + i * 0.06 }}
              className="tw-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-1 tw-rounded tw-bg-background tw-border tw-border-border"
            >
              {item.done ? (
                <CheckCircle2 className="tw-h-2.5 tw-w-2.5 tw-text-accent tw-flex-shrink-0" />
              ) : (
                <div className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-border tw-border-muted-foreground/30 tw-flex-shrink-0" />
              )}
              <span
                className={`tw-text-[8px] ${item.done ? "tw-line-through tw-text-muted-foreground" : "tw-font-medium"}`}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* E-Verify status */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: mockupDelay + 0.8 }}
          className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1.5 tw-rounded-lg tw-bg-cyan-500/5 tw-border tw-border-cyan-500/15"
        >
          <Shield className="tw-h-2.5 tw-w-2.5 tw-text-cyan-500 tw-flex-shrink-0" />
          <span className="tw-text-[7px] tw-text-cyan-600 tw-font-medium tw-flex-1">
            E-Verify+ case pending — submit after video call
          </span>
          <span className="tw-text-[6px] tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-cyan-500/10 tw-text-cyan-600 tw-font-semibold">
            In Progress
          </span>
        </motion.div>
      </div>
    </div>
  </div>
);
