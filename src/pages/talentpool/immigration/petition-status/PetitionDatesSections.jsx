// Date display sections for different petition statuses
import { formatDateSafe, getExpiryStatus, calculateDaysSince, getProcessingStatus } from "./petitionStatusConfig";
import { Clock, Timer, CalendarCheck, CalendarX } from "lucide-react";

export function ApprovedDatesSection({ petition }) {
  const expiryStatus = getExpiryStatus(petition.validity_end);
  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
          <CalendarCheck className="h-3 w-3" />Approved
        </div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.approval_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Valid From</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.validity_start)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Valid To</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.validity_end)}</div>
        {expiryStatus && (
          <div className={`text-xs ${expiryStatus.color} font-medium mt-0.5`}>{expiryStatus.message}</div>
        )}
      </div>
    </div>
  );
}

export function PendingDatesSection({ petition }) {
  const daysPending = calculateDaysSince(petition.filed_date);
  const processingStatus = daysPending !== null
    ? getProcessingStatus(daysPending, petition.premium_processing || false)
    : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <CalendarCheck className="h-3 w-3" />Filed
          </div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Notice Date</div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Timer className="h-3 w-3" />Pending
          </div>
          <div className="font-semibold text-sm">
            {daysPending !== null ? `${daysPending} days` : '—'}
          </div>
          {processingStatus && (
            <div className={`text-xs ${processingStatus.color} font-medium mt-0.5`}>{processingStatus.message}</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Approval Date</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Validity Period</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">I-94</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
      </div>
    </div>
  );
}

export function RFEDatesSection({ petition, rfeReceivedDate }) {
  const daysSinceRFE = rfeReceivedDate ? calculateDaysSince(rfeReceivedDate) : null;
  const daysRemaining = daysSinceRFE !== null ? Math.max(0, 87 - daysSinceRFE) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <CalendarCheck className="h-3 w-3" />Filed
          </div>
          <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">RFE Received</div>
          <div className="font-semibold text-sm">{formatDateSafe(rfeReceivedDate || petition.notice_date)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />Days Since RFE
          </div>
          <div className="font-semibold text-sm">
            {daysSinceRFE !== null ? `${daysSinceRFE} days` : '—'}
          </div>
          {daysRemaining !== null && (
            <div className={`text-xs font-medium mt-0.5 ${daysRemaining < 30 ? 'text-red-600' : daysRemaining < 60 ? 'text-orange-600' : 'text-yellow-600'}`}>
              ~{daysRemaining}d to respond
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Approval Date</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Validity Period</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">I-94</div>
          <div className="text-sm text-muted-foreground italic">Awaiting...</div>
        </div>
      </div>
    </div>
  );
}

export function DeniedDatesSection({ petition }) {
  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Filed</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Notice Date</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
          <CalendarX className="h-3 w-3" />Status
        </div>
        <div className="font-semibold text-sm text-red-600">Denied</div>
      </div>
    </div>
  );
}

export function WithdrawnDatesSection({ petition }) {
  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Filed</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.filed_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Notice Date</div>
        <div className="font-semibold text-sm">{formatDateSafe(petition.notice_date)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Status</div>
        <div className="font-semibold text-sm text-gray-600">Withdrawn</div>
      </div>
    </div>
  );
}
