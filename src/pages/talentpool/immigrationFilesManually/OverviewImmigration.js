import React from "react";
import { Clock, CheckCircle, ArrowRight, AlertTriangle, Info } from "lucide-react";

function OverviewImmigration({ candidateDetails, immigrationData, isEditMode }) {
  const accounts = candidateDetails?.direct_deposit_accounts?.accounts || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "Invalid Date";
    }
  };

  const candidate = immigrationData?.data?.candidate || {};
  const immigration = immigrationData?.data?.immigration || {};
  const documents = immigrationData?.data?.documents || [];
  const petitionHistory = immigrationData?.data?.petition_history || [];
  const alerts = immigrationData?.data?.alerts || [];
  const verifiedDocs = documents.filter((doc) => doc.verified_at).length;
  const totalDocs = documents.length;

  // Helper function to get alert styling based on severity
  const getAlertStyle = (severity) => {
    const styles = {
      critical: {
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        badgeBg: "bg-red-100",
        badgeText: "text-red-800",
        icon: AlertTriangle,
        iconColor: "text-red-600",
      },
      warning: {
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50",
        textColor: "text-amber-800",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        icon: AlertTriangle,
        iconColor: "text-amber-600",
      },
      info: {
        borderColor: "!border-blue-200",
        bgColor: "!bg-blue-50",
        textColor: "!text-blue-800",
        badgeBg: "!bg-blue-100",
        badgeText: "!text-blue-800",
        icon: Info,
        iconColor: "!text-blue-600",
      },
    };
    return styles[severity] || styles.info;
  };

  return (
    <div>
      <>
        {/* Immigration Alerts Section */}
        {alerts.length > 0 && (
          <div className="rounded-xl border !border-amber-200 !bg-amber-50/50 text-card-foreground shadow-sm mb-4">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="tracking-tight !text-sm !font-medium flex items-center gap-2 text-[#92400e]">
                <AlertTriangle className="h-4 w-4" />
                Immigration Alerts ({alerts.length})
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-3">
                {alerts.map((alert, index) => {
                  const style = getAlertStyle(alert.severity);
                  const AlertIcon = style.icon;

                  return (
                    <div key={index} className={`rounded-xl border p-[12px] ${style.borderColor} ${style.bgColor}`}>
                      <div className="flex items-start !gap-3">
                        <div className={`mt-0.5 ${style.iconColor}`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between !gap-2 mb-1">
                            <span className="!font-medium !text-sm  text-[#080118]">{alert.title}</span>
                            <div
                              className={`inline-flex items-center !rounded-full border !px-2.5 !py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow-sm !text-xs ${style.badgeBg} ${style.badgeText}`}
                            >
                              {alert.severity}
                            </div>
                          </div>
                          <p className="!text-sm font-medium !text-[#67677e]">{alert.message}</p>
                          <p className="!text-xs !font-medium mt-1 text-[#080118]">
                            {alert.days_until < 0 ? "Overdue" : `${alert.days_until} days remaining`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Visa Type</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-lg font-semibold">
                {immigration?.visa_type || candidate?.visa_type_current || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {immigration?.visa_type === "H1B"
                  ? "Specialty Occupation"
                  : immigration?.visa_type === "H4_EAD"
                    ? "H4 Employment Auth"
                    : immigration?.visa_type === "OPT"
                      ? "Optional Practical Training"
                      : immigration?.visa_type === "STEM_OPT"
                        ? "STEM Extension"
                        : "Current Status"}
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Status Valid Until</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-lg font-semibold">
                {formatDate(candidate?.i94_expiry_date || immigration?.i94_expiry_date)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">I-94 Expiry</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Passport Expiry</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-lg font-semibold">
                {formatDate(candidate?.passport_expiry_date || immigration?.passport_expiry_date)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {immigration?.passport_country || candidate?.passport_country || ""}
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Documents</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-lg font-semibold">{verifiedDocs}</span>
                <span className="text-sm text-muted-foreground">verified</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalDocs} total document{totalDocs !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm mt-4">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="tracking-tight text-sm font-medium">Immigration Timeline</h3>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#f3f3fc] text-secondary-foreground hover:bg-[#f3f3fc]/80 text-xs">
                  {petitionHistory.length} event{petitionHistory.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">Chronological history of visa status changes and milestones</p>
          </div>

          <div className="p-6 pt-0">
            <div className="space-y-0">
              {petitionHistory.length > 0 ? (
                petitionHistory.map((event, index) => (
                  <div key={event.id || index} className="relative">
                    {/* Vertical connecting line - hidden for last item */}
                    {index < petitionHistory.length - 1 && (
                      <div
                        className="absolute left-[11px] top-8 bottom-0 !w-[1px] !bg-[#e7e7ef]"
                        style={{ height: "calc(100% - 32px)" }}
                      />
                    )}
                    <div className="flex gap-3 pb-4">
                      <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-solid border-[#7c3bed4d]">
                        <Clock className="h-3 w-3 text-[#7c3bed]" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{formatDate(event.event_date)}</span>
                          <div className="inline-flex items-center rounded-full border font-semibold bg-[#f3f3fc] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-border capitalize">
                            {event.event_type || "Update"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs font-normal">
                            {event.from_status || "N/A"}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#f3f3fc] text-secondary-foreground hover:bg-[#f3f3fc]/80 text-xs font-medium">
                            {event.to_status || "N/A"}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                          at {event.employer || immigration?.employer_name || "N/A"}
                        </p>

                        {event.notes && <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No immigration timeline events found
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export default OverviewImmigration;
