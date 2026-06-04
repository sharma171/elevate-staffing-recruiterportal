import React from "react";
import { motion } from "framer-motion";
import { Globe, FileText, Shield, Clock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

const HeroDashboardMockup = () => {
  return (
    <div className="tw-relative">
      {/* Glow */}
      <div className="tw-absolute tw--inset-8 tw-bg-gradient-to-r tw-from-primary/15 tw-via-accent/10 tw-to-primary/15 tw-rounded-3xl tw-blur-3xl" />

      {/* Main card */}
      <div className="tw-relative tw-bg-[#fff] tw-border tw-border-border tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        {/* Browser bar */}
        <div className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-muted/60 tw-border-b tw-border-border">
          <div className="tw-flex tw-gap-1.5">
            <div className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-destructive/50" />
            <div className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-amber-400/50" />
            <div className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-green-400/50" />
          </div>
          <div className="tw-flex-1 tw-flex tw-justify-center">
            <div className="tw-px-3 tw-py-0.5 tw-bg-background/80 tw-rounded tw-text-[10px] tw-text-muted-foreground tw-font-mono">
              app.elevatestaffing.ai
            </div>
          </div>
        </div>

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="tw-px-4 tw-py-3 tw-border-b tw-border-border tw-bg-muted/20"
        >
          <div className="d-flex align-items-center tw-gap-3">
            <div className="tw-w-9 tw-h-9 tw-rounded-full tw-bg-gradient-to-br tw-from-primary/20 tw-to-accent/20 tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-[11px] tw-font-bold tw-text-primary">SM</span>
            </div>
            <div>
              <p className="tw-text-[11px] tw-font-semibold pt-0 mt-0">Sarah Mitchell</p>
              <p className="tw-text-[9px] tw-text-muted-foreground pt-0 mt-0">sarah.m@globaltech.io</p>
            </div>
            <div className="tw-ml-auto tw-flex tw-gap-1.5">
              <span className="tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-primary/10 tw-text-primary tw-text-[8px] tw-font-semibold">
                H-1B
              </span>
              <span className="tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-accent/10 tw-text-accent tw-text-[8px] tw-font-semibold">
                approved
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="tw-flex tw-items-center tw-gap-0 tw-border-b tw-border-border tw-bg-muted/30 tw-px-2 tw-overflow-x-auto"
        >
          {["Candidate Info", "Files & Docs", "Projects", "Timesheets", "Onboarding", "Immigration"].map((tab, i) => (
            <div
              key={tab}
              className={`tw-px-2.5 tw-py-2 tw-text-[9px] tw-font-medium tw-whitespace-nowrap tw-border-b-2 ${
                i === 5 ? "tw-border-primary tw-text-primary" : "tw-border-transparent tw-text-muted-foreground"
              }`}
            >
              {tab}
            </div>
          ))}
        </motion.div>

        {/* Immigration sub-tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="tw-flex tw-items-center tw-gap-0 tw-border-b tw-border-border tw-px-3"
        >
          {["Overview", "Visa Details", "GC Tracker", "Passport & Entry", "Documents"].map((tab, i) => (
            <div
              key={tab}
              className={`tw-px-2 tw-py-1.5 tw-text-[8px] tw-font-medium ${
                i === 0 ? "tw-text-primary tw-border-b tw-border-primary" : "tw-text-muted-foreground"
              }`}
            >
              {tab}
            </div>
          ))}
        </motion.div>

        {/* Content */}
        <div className="tw-p-3 tw-space-y-2.5">
          {/* Stat cards row */}
          <div className="tw-grid tw-grid-cols-4 tw-gap-2">
            {[
              { label: "Visa Type", value: "H-1B", sub: "Specialty Occupation" },
              { label: "Status Valid Until", value: "D/S", sub: "I-94 Expiry" },
              { label: "Passport Expiry", value: "8/15/2029", sub: "GBR" },
              { label: "Documents", value: "12", sub: "3 pending review", icon: true },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="tw-bg-background tw-rounded-lg tw-p-2 tw-border tw-border-border"
              >
                <p className="tw-text-[8px] tw-text-muted-foreground tw-mb-0.5">{stat.label}</p>
                <p className="tw-text-[13px] tw-font-bold tw-leading-tight mt-0">{stat.value}</p>
                <p className="tw-text-[7px] tw-text-muted-foreground tw-mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Immigration Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="tw-bg-background tw-rounded-lg tw-p-2.5 tw-border tw-border-border"
          >
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <Clock className="tw-h-3 tw-w-3 tw-text-primary" />
              <span className="tw-text-[10px] tw-font-semibold">Immigration Timeline</span>
              <span className="tw-px-1.5 tw-py-0.5 tw-rounded-full tw-bg-accent/10 tw-text-accent tw-text-[7px] tw-font-semibold">
                3 events
              </span>
            </div>
            <p className="tw-text-[8px] tw-text-muted-foreground tw-mb-2">
              Chronological history of visa status changes
            </p>

            <div className="tw-space-y-2 tw-relative">
              <div className="tw-absolute tw-left-[11px] tw-top-2 tw-bottom-2 tw-w-[1px] tw-bg-border" />
              {[
                {
                  date: "Jun 12, 2025",
                  type: "Receipt",
                  from: "H-1B",
                  to: "H-1B",
                  company: "NEXUS DIGITAL SOLUTIONS INC",
                  desc: "H-1B petition filed — Receipt: IOE4827193650",
                },
                {
                  date: "Dec 5, 2024",
                  type: "Approval",
                  from: "H-1B",
                  to: "H-1B",
                  company: "NEXUS DIGITAL SOLUTIONS INC",
                  desc: "H-1B approved — Valid 2024-12-01 to 2027-11-30",
                },
              ].map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.25 + i * 0.15 }}
                  className="tw-flex tw-gap-2 tw-pl-1"
                >
                  <div className="tw-w-3.5 tw-h-3.5 tw-rounded-full tw-bg-primary/10 tw-border-2 tw-border-primary/30 tw-flex-shrink-0 tw-mt-0.5 tw-relative tw-z-10" />
                  <div className="tw-flex-1 tw-min-w-0">
                    <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                      <span className="tw-text-[9px] tw-font-medium">{event.date}</span>
                      <span className="tw-px-1 tw-py-0 tw-rounded tw-bg-muted tw-text-[7px] tw-font-medium tw-text-muted-foreground">
                        {event.type}
                      </span>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-1 tw-mb-0.5">
                      <span className="tw-px-1.5 tw-py-0 tw-rounded-full tw-bg-muted tw-text-[7px] tw-font-medium">
                        {event.from}
                      </span>
                      <span className="tw-text-[8px] tw-text-muted-foreground">→</span>
                      <span className="tw-px-1.5 tw-py-0 tw-rounded-full tw-bg-primary/10 tw-text-primary tw-text-[7px] tw-font-semibold">
                        {event.to}
                      </span>
                    </div>
                    <p className="tw-text-[8px] tw-text-muted-foreground">at {event.company}</p>
                    <p className="tw-text-[7px] tw-text-muted-foreground/70 tw-italic mt-0">{event.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating: Alert */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        className="tw-absolute tw--right-4 tw-top-16 tw-bg-[#fff] tw-border tw-border-amber-500/20 tw-rounded-xl tw-shadow-xl tw-p-2.5 tw-w-[175px]"
      >
        <div className="tw-flex tw-items-start tw-gap-2">
          <div className="tw-w-7 tw-h-7 tw-rounded-lg tw-bg-amber-500/10 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
            <AlertTriangle className="tw-h-3.5 tw-w-3.5 tw-text-amber-500" />
          </div>
          <div>
            <p className="tw-text-[10px] tw-font-semibold tw-text-amber-600">Visa Alert</p>
            <p className="tw-text-[8px] tw-text-muted-foreground mt-0">EAD expiring in 42 days — Renewal pending</p>
          </div>
        </div>
      </motion.div>

      {/* Floating: Document status */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
        className="tw-absolute tw--left-4 tw-bottom-[4rem] z-[11] tw-bg-[#fff] tw-border tw-border-border tw-rounded-xl tw-shadow-xl tw-p-2.5"
      >
        <div className="tw-flex tw-items-center tw-gap-2">
          <div className="tw-w-7 tw-h-7 tw-rounded-lg tw-bg-accent/10 tw-flex tw-items-center tw-justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="tw-text-[10px] tw-font-semibold">12 Documents</p>
            <p className="tw-text-[8px] tw-text-muted-foreground mt-0">9 verified · 3 pending</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroDashboardMockup;
