import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { AlertTriangle, Clock, FileWarning, Shield } from "lucide-react";

const getAlertIcon = (type) => {
  switch (type) {
    case "expiry":
      return <Clock className="h-4 w-4" />;
    case "missing_document":
      return <FileWarning className="h-4 w-4" />;
    case "compliance":
      return <Shield className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getAlertStyles = (level) => {
  switch (level) {
    case "critical":
      return {
        container: "!border-solid !border-[1px] !border-[#ef444480] bg-red-500/5",
        icon: "text-red-500",
        badge: "bg-red-500 text-red-500-foreground",
      };
    case "warning":
      return {
        container: "border-amber-200 bg-amber-50",
        icon: "text-amber-600",
        badge: "bg-amber-100 text-amber-800",
      };
    case "info":
    default:
      return {
        container: "border-blue-200 bg-blue-50",
        icon: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
      };
  }
};

export function ImmigrationAlertsCard({ alerts }) {
  if (alerts.length === 0) return null;

  const criticalAlerts = alerts.filter((a) => a.level === "critical");
  const warningAlerts = alerts.filter((a) => a.level === "warning");
  const infoAlerts = alerts.filter((a) => a.level === "info");
  const sortedAlerts = [...criticalAlerts, ...warningAlerts, ...infoAlerts];

  return (
    <Card className="!border-amber-200 !bg-amber-50/50">
      <CardHeader className="!pb-2">
        <CardTitle className="!text-sm !font-medium flex items-center !gap-2 !text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          Immigration Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const styles = getAlertStyles(alert.level);
            return (
              <div key={alert.alert_id} className={`rounded-[10px] border p-[12px] ${styles.container}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${styles.icon}`}>{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="!font-medium text-[#080118] !text-sm">{alert.title}</span>
                      <Badge className={`text-xs ${styles.badge}`}>{alert.level}</Badge>
                    </div>
                    <p className="!text-sm !text-[#67677e]">{alert.message}</p>
                    {alert.days_until !== undefined && (
                      <p className="!text-xs !font-medium mt-1 text-[#080118]">
                        {alert.days_until > 0 ? `${alert.days_until} days remaining` : "Overdue"}
                      </p>
                    )}
                    {alert.action_required && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <span className="font-medium">Action:</span> {alert.action_required}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
