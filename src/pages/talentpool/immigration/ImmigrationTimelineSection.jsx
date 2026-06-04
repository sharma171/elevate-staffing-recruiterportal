import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Button } from "../../../components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  RefreshCw,
  Briefcase,
  GraduationCap,
  FileCheck,
  Bot,
} from "lucide-react";
import { VISA_TYPES } from "./constants";
import { useState } from "react";

// Format date safely handling timezone issues
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const getVisaLabel = (code) => {
  if (!code) return "Unknown";
  const visa = VISA_TYPES.find((v) => v.code === code);
  return visa ? visa.label : code;
};

const getEventIcon = (eventType) => {
  switch (eventType) {
    case "status_change":
      return RefreshCw;
    case "transfer":
      return Briefcase;
    case "extension":
      return FileCheck;
    case "initial_entry":
      return GraduationCap;
    default:
      return Clock;
  }
};

const getEventBadgeStyles = (eventType) => {
  switch (eventType) {
    case "status_change":
      return "!bg-purple-100 !text-purple-800 !border-purple-200";
    case "transfer":
      return "!bg-amber-100 !text-amber-800 !border-amber-200";
    case "extension":
      return "!bg-green-100 !text-green-800 !border-green-200";
    case "initial_entry":
      return "!bg-blue-100 !text-blue-800 !border-blue-200";
    case "ead_issued":
      return "!bg-teal-100 !text-teal-800 !border-teal-200";
    case "gc_stage":
      return "!bg-emerald-100 !text-emerald-800 !border-emerald-200";
    default:
      return "!bg-[#f1f1f9] !text-[#67677e] border-border";
  }
};

const formatEventType = (eventType) => {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderPreviousDataSnapshot = (event) => {
  const details = event.event_details;
  if (!details) return null;

  const snapshots = [];

  if (details.previous_h1b_data) {
    const h1b = details.previous_h1b_data;
    if (h1b.employer) snapshots.push({ label: "Previous Employer", value: h1b.employer });
    if (h1b.job_title) snapshots.push({ label: "Previous Title", value: h1b.job_title });
    if (h1b.lca_number) snapshots.push({ label: "LCA #", value: h1b.lca_number });
  }

  if (details.previous_opt_data) {
    const opt = details.previous_opt_data;
    if (opt.school?.name) snapshots.push({ label: "School", value: opt.school.name });
    if (opt.school?.major) snapshots.push({ label: "Major", value: opt.school.major });
    if (opt.opt_type) snapshots.push({ label: "OPT Type", value: opt.opt_type });
  }

  if (details.previous_f1_data) {
    const f1 = details.previous_f1_data;
    if (f1.school?.name) snapshots.push({ label: "School", value: f1.school.name });
    if (f1.school?.sevis_number) snapshots.push({ label: "SEVIS #", value: f1.school.sevis_number });
  }

  if (details.previous_dependent_data) {
    const dep = details.previous_dependent_data;
    if (dep.principal_visa_holder) snapshots.push({ label: "Principal Holder", value: dep.principal_visa_holder });
    if (dep.relationship) snapshots.push({ label: "Relationship", value: dep.relationship });
  }

  if (details.previous_l1_data) {
    const l1 = details.previous_l1_data;
    if (l1.employer) snapshots.push({ label: "Previous Employer", value: l1.employer });
    if (l1.l1_type) snapshots.push({ label: "L1 Type", value: l1.l1_type });
  }

  if (details.previous_gc_data) {
    const gc = details.previous_gc_data;
    if (gc.category) snapshots.push({ label: "GC Category", value: gc.category });
    if (gc.priority_date) snapshots.push({ label: "Priority Date", value: formatDate(gc.priority_date) });
  }

  if (snapshots.length === 0) return null;

  return (
    <div className="mt-2 p-2 bg-muted/50 rounded-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">Previous Status Snapshot</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {snapshots.map((snap, idx) => (
          <div key={idx} className="text-xs">
            <span className="text-muted-foreground">{snap.label}:</span>{" "}
            <span className="font-medium">{snap.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ImmigrationTimelineSection({ petitionHistory }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!petitionHistory || petitionHistory.length === 0) {
    return null;
  }

  const sortedHistory = [...petitionHistory].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
  );

  const recentEvents = sortedHistory.slice(0, 3);
  const olderEvents = sortedHistory.slice(3);

  const renderEvent = (event, idx, isLast) => {
    const EventIcon = getEventIcon(event.event_type);
    const isAutoGenerated = event.event_details?.auto_generated;

    return (
      <div key={event.history_id} className="relative">
        {!isLast && <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />}
        <div className="flex gap-3 pb-4">
          <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background !border-2 !border-[1px] !border-solid !border-[#7c3bed]/30">
            <EventIcon className="h-3 w-3 text-[#7c3bed]" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="text-xs text-muted-foreground">{formatDate(event.event_date)}</span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 ${getEventBadgeStyles(event.event_type)}`}
              >
                {formatEventType(event.event_type)}
              </Badge>
              {isAutoGenerated && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200 gap-0.5"
                >
                  <Bot className="h-2.5 w-2.5" />
                  Auto-tracked
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {event.from_status && (
                <>
                  <Badge variant="outline" className="text-xs font-normal">
                    {getVisaLabel(event.from_status)}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <Badge variant="secondary" className="text-xs font-medium">
                {getVisaLabel(event.to_status)}
              </Badge>
            </div>
            {event.employer && <p className="text-xs text-muted-foreground mt-1">at {event.employer}</p>}
            {event.notes && !event.notes.includes("Auto-generated") && (
              <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>
            )}
            {isAutoGenerated && renderPreviousDataSnapshot(event)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="!text-sm !font-medium text-[#080118]">Immigration Timeline</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {petitionHistory.length} event{petitionHistory.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          Chronological history of visa status changes and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {recentEvents.map((event, idx) =>
            renderEvent(event, idx, idx === recentEvents.length - 1 && olderEvents.length === 0),
          )}

          {olderEvents.length > 0 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground ml-9 mb-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  {isExpanded ? "Hide" : "Show"} {olderEvents.length} older event{olderEvents.length !== 1 ? "s" : ""}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {olderEvents.map((event, idx) => renderEvent(event, idx, idx === olderEvents.length - 1))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
