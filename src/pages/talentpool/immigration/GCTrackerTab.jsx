import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  FileText,
  Briefcase,
  User,
  Calendar,
  Award,
  ChevronDown,
} from "lucide-react";
import { GC_CATEGORIES } from "./constants";
import { SmartUploadButton } from "./SmartUploadButton";
import { SectionDocumentsList } from "./SectionDocumentsList";
import { GC_TRACKER_DOC_TYPES } from "./documentTypes";
import { GCProcessingPipeline } from "./GCProcessingPipeline";

// Visa types that show the GC card (already have GC)
const GC_CARD_VISA_TYPES = ["GC", "USC", "GC_EAD"];

// Visa types that show the processing pipeline
const PIPELINE_VISA_TYPES = [
  "H1B",
  "H1B1",
  "H4",
  "H4_EAD",
  "L1A",
  "L1B",
  "L2",
  "L2_EAD",
  "OPT",
  "STEM_OPT",
  "F1",
  "CPT",
  "EAD",
  "TN",
  "E2",
  "E3",
  "O1",
];

// Determine current GC process step from data
const getGCCurrentStep = (data) => {
  if (!data || !data.gc_process_started) {
    return { step: 0, label: "Not Started" };
  }

  const i485Status = data.i485?.status || data.i485_status;
  if (i485Status === "approved") {
    return { step: 4, label: "Green Card Approved", complete: true };
  }
  if (i485Status && i485Status !== "not_filed") {
    return { step: 3, label: "I-485 Pending", sublabel: formatStatus(i485Status) };
  }

  const i140Status = data.i140?.status || data.i140_status;
  if (i140Status === "approved") {
    return { step: 2, label: "I-140 Approved", sublabel: "Waiting for priority date / I-485 filing", complete: true };
  }
  if (i140Status && i140Status !== "not_started") {
    return { step: 2, label: "I-140 Pending", sublabel: formatStatus(i140Status) };
  }

  const permStatus = data.perm?.status || data.perm_status;
  if (permStatus === "certified") {
    return { step: 1, label: "PERM Certified", sublabel: "Ready for I-140 filing", complete: true };
  }
  if (permStatus && permStatus !== "not_started") {
    return { step: 1, label: "PERM In Progress", sublabel: formatStatus(permStatus) };
  }

  return { step: 0, label: "Process Initiated", sublabel: "PERM not yet started" };
};

const formatStatus = (status) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "—";
  const parts = date.split("-");
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
};

const formatCurrency = (value) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
};

const DisplayField = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </dt>
    <dd className="text-sm text-foreground">{value || "—"}</dd>
  </div>
);

export function GCTrackerTab({
  data,
  isEditing,
  onChange,
  candidateEmail,
  candidateId,
  visaType,
  gcProcessing,
  onGCProcessingChange,
  onI140DataExtracted,
  onPermDataExtracted,
  documents,
  onDocumentsRefresh,
}) {
  const isGCHolder = GC_CARD_VISA_TYPES.includes(visaType || "");
  const isPipelineCandidate = PIPELINE_VISA_TYPES.includes(visaType || "") || (!isGCHolder && !visaType);

  if (isPipelineCandidate) {
    return (
      <GCProcessingView
        gcProcessing={gcProcessing || null}
        candidateEmail={candidateEmail || ""}
        candidateId={candidateId}
        isEditing={isEditing}
        onGCProcessingChange={onGCProcessingChange}
        onRefresh={onDocumentsRefresh || (() => Promise.resolve())}
        documents={documents}
      />
    );
  }

  return (
    <GCCardView
      data={data}
      isEditing={isEditing}
      onChange={onChange}
      candidateEmail={candidateEmail}
      candidateId={candidateId}
      onI140DataExtracted={onI140DataExtracted}
      onPermDataExtracted={onPermDataExtracted}
      documents={documents}
      onDocumentsRefresh={onDocumentsRefresh}
      gcProcessing={gcProcessing}
      onGCProcessingChange={onGCProcessingChange}
    />
  );
}

// Pipeline view for non-GC candidates
function GCProcessingView({
  gcProcessing,
  candidateEmail,
  candidateId,
  isEditing,
  onGCProcessingChange,
  onRefresh,
  documents,
}) {
  const hasStarted = gcProcessing?.gc_processing_started;

  const handleToggle = (checked) => {
    if (checked && onGCProcessingChange) {
      onGCProcessingChange({
        gc_processing_started: true,
        current_stage: "pwd",
      });
    } else if (!checked && onGCProcessingChange) {
      onGCProcessingChange({ gc_processing_started: false });
    }
  };

  if (!hasStarted) {
    return (
      <Card>
        <CardContent className="!py-12 !pt-12  text-center">
          <Award className="h-12 w-12 text-[#67677e] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#080118] mb-2">Green Card Processing</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Track the full GC processing pipeline — from PWD through I-485 adjustment of status.
          </p>
          {/* {isEditing && ( */}
          <div className="flex items-center justify-center gap-3">
            <Label className="text-sm">GC Processing Started?</Label>
            <Switch checked={false} onCheckedChange={handleToggle} />
          </div>
          {/* )} */}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* {isEditing && ( */}
      <div className="flex items-center gap-3 px-1">
        <Label className="text-sm">GC Processing Started?</Label>
        <Switch checked={true} onCheckedChange={handleToggle} />
      </div>
      {/* )} */}

      <GCProcessingPipeline
        data={gcProcessing}
        candidateEmail={candidateEmail}
        candidateId={candidateId}
        isEditing={isEditing}
        onDataChange={onGCProcessingChange || (() => {})}
        onRefresh={onRefresh}
      />

      {documents && documents.length > 0 && (
        <SectionDocumentsList
          documents={documents}
          sectionName="GC Processing Documents"
          sectionCode="gc_tracker"
          documentTypes={GC_TRACKER_DOC_TYPES}
          candidateEmail={candidateEmail}
          isEditing={isEditing}
          accessLevel="Full Access"
          onRefresh={onRefresh}
          compact
        />
      )}
    </div>
  );
}

// Existing GC card view for GC holders
function GCCardView({
  data,
  isEditing,
  onChange,
  candidateEmail,
  candidateId,
  onI140DataExtracted,
  onPermDataExtracted,
  documents,
  onDocumentsRefresh,
  gcProcessing,
  onGCProcessingChange,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const currentStep = getGCCurrentStep(data);
  const progressPercent = (currentStep.step / 4) * 100;

  const steps = [
    { id: 1, name: "PERM", description: "Labor Certification" },
    { id: 2, name: "I-140", description: "Immigrant Petition" },
    { id: 3, name: "I-485", description: "Adjustment of Status" },
    { id: 4, name: "Approved", description: "Green Card" },
  ];

  const getCategoryLabel = (code) => {
    if (!code) return undefined;
    const cat = GC_CATEGORIES.find((c) => c.value === code);
    return cat?.label || code;
  };

  return (
    <div className="space-y-6">
      {/* GC Card Details */}
      {data?.card_number && (
        <Card>
          <CardHeader className="pb-2">
            <div className="fw-semibold text-[17px] text-[#080118]">Green Card Details</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Card Number" value={data.card_number} />
              <DisplayField label="Card Holder" value={data.card_holder_name} />
              <DisplayField label="Category" value={data.category} />
              <DisplayField label="Resident Since" value={formatDate(data.resident_since)} />
              <DisplayField label="Expiry Date" value={formatDate(data.card_expiry_date)} />
              <DisplayField label="Country of Birth" value={data.country_of_birth} />
              {data.is_conditional && (
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conditional</dt>
                  <dd className="text-sm">
                    <Badge variant="outline" className="text-amber-700">
                      ⚠️ Conditional
                    </Badge>
                  </dd>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Stepper */}
      {data?.gc_process_started && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Green Card Progress</CardTitle>
              <Badge
                variant={currentStep.complete ? "default" : "secondary"}
                className={currentStep.complete ? "bg-green-100 text-green-800" : ""}
              >
                {currentStep.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="!space-y-4">
              <Progress value={progressPercent} className="h-2" />
              <div className="grid grid-cols-4 gap-2">
                {steps.map((step) => {
                  const isComplete =
                    currentStep.step > step.id || (currentStep.step === step.id && currentStep.complete);
                  const isCurrent = currentStep.step === step.id && !currentStep.complete;
                  return (
                    <div key={step.id} className="text-center">
                      <div className="flex justify-center mb-2">
                        {isComplete ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : isCurrent ? (
                          <Clock className="h-6 w-6 text-primary animate-pulse" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <p
                        className={`text-xs font-medium ${isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {step.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
              {currentStep.sublabel && (
                <p className="text-sm text-center text-muted-foreground mt-2">{currentStep.sublabel}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="!p-[16px] !pt-[16px]">
            <DisplayField label="Category" value={getCategoryLabel(data?.gc_category)} icon={FileText} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-[16px] !pt-[16px]">
            <DisplayField label="Priority Date" value={formatDate(data?.priority_date)} icon={Calendar} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-[16px] !pt-[16px]">
            <DisplayField label="Country" value={data?.country_of_chargeability} icon={User} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-[16px] !pt-[16px]">
            <DisplayField label="Sponsor" value={data?.gc_sponsoring_employer} icon={Briefcase} />
          </CardContent>
        </Card>
      </div>

      {/* PERM Details */}
      {(data?.perm_required || data?.perm?.status) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">PERM Labor Certification</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {formatStatus(data?.perm?.status || data?.perm_status || "not_started")}
                </Badge>
              </div>
              {candidateEmail && onPermDataExtracted && (
                <SmartUploadButton
                  documentType="perm"
                  label="Upload PERM"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onPermDataExtracted}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Case Number" value={data?.perm?.case_number || data?.perm_case_number} />
              <DisplayField label="Filed Date" value={formatDate(data?.perm?.filed_date || data?.perm_filed_date)} />
              <DisplayField
                label="Certified Date"
                value={formatDate(data?.perm?.certified_date || data?.perm_certified_date)}
              />
              <DisplayField label="Job Title" value={data?.perm?.job_title || data?.perm_job_title} />
              <DisplayField
                label="Offered Wage"
                value={formatCurrency(data?.perm?.offered_wage || data?.perm_wage_offered)}
              />
              <DisplayField label="Worksite" value={data?.perm?.worksite || data?.perm_worksite} />
              {data?.perm_audit_received && <DisplayField label="Audit Status" value="Audit Received" />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* I-140 Details */}
      {(data?.i140_filed || data?.i140?.status) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">I-140 Immigrant Petition</CardTitle>
                {data?.i140_premium_processing && (
                  <Badge variant="outline" className="text-xs">
                    Premium
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {formatStatus(data?.i140?.status || data?.i140_status || "not_started")}
                </Badge>
              </div>
              {candidateEmail && onI140DataExtracted && (
                <SmartUploadButton
                  documentType="i140"
                  label="Upload I-140"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onI140DataExtracted}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Receipt Number" value={data?.i140?.receipt_number || data?.i140_receipt_number} />
              <DisplayField label="Filed Date" value={formatDate(data?.i140?.filed_date || data?.i140_filed_date)} />
              <DisplayField
                label="Approval Date"
                value={formatDate(data?.i140?.approval_date || data?.i140_approval_date)}
              />
              <DisplayField label="Category" value={data?.i140?.eb_category || data?.i140_approved_category} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* I-485 Details */}
      {(data?.i485_filed || data?.i485?.status) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">I-485 Adjustment of Status</CardTitle>
              <Badge variant="outline" className="capitalize">
                {formatStatus(data?.i485?.status || data?.i485_status || "not_filed")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Receipt Number" value={data?.i485?.receipt_number || data?.i485_receipt_number} />
              <DisplayField label="Filed Date" value={formatDate(data?.i485?.filed_date || data?.i485_filed_date)} />
              <DisplayField
                label="Interview Date"
                value={formatDate(data?.i485?.interview_date || data?.i485_interview_date)}
              />
              <DisplayField
                label="Interview Location"
                value={data?.i485?.interview_location || data?.i485_interview_location}
              />
              <DisplayField
                label="Approval Date"
                value={formatDate(data?.i485?.approval_date || data?.i485_approval_date)}
              />
              <DisplayField
                label="Card Received"
                value={formatDate(data?.i485?.card_received_date || data?.gc_card_received_date)}
              />
              <DisplayField label="A-Number" value={data?.a_number} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* EAD/AP Combo Card */}
      {(data?.combo_card_applied || data?.ead_ap_combo?.has_combo_card) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">EAD/AP Combo Card</CardTitle>
              <div className="flex items-center gap-2">
                {data?.ead_ap_combo?.using_ead_for_work && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Using for Work</Badge>
                )}
                {data?.ead_ap_combo?.using_ap_for_travel && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">Using for Travel</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField
                label="EAD Number"
                value={data?.ead_ap_combo?.ead_number || data?.combo_card_receipt_number}
              />
              <DisplayField
                label="Category"
                value={data?.ead_ap_combo?.ead_category || data?.combo_card_category || "C09"}
              />
              <DisplayField
                label="Issue Date"
                value={formatDate(data?.ead_ap_combo?.card_issue_date || data?.combo_card_validity_start)}
              />
              <DisplayField
                label="Expiry Date"
                value={formatDate(data?.ead_ap_combo?.card_expiry_date || data?.combo_card_validity_end)}
              />
              <DisplayField label="AP Issue Date" value={formatDate(data?.ap_validity_start)} />
              <DisplayField label="AP Expiry Date" value={formatDate(data?.ap_validity_end)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attorney Info */}
      {(data?.attorney_name || data?.attorney_firm) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attorney Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DisplayField label="Attorney Name" value={data?.attorney_name} />
              <DisplayField label="Law Firm" value={data?.attorney_firm} />
              <DisplayField label="Email" value={data?.attorney_email} />
              <DisplayField label="Phone" value={data?.attorney_phone} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {data?.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Historical GC Processing Pipeline */}
      {gcProcessing?.gc_processing_started && (
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="fw-semibold text-[17px] text-[#080118]">GC Processing History</div>
                    <Badge variant="outline" className="text-xs">
                      Historical
                    </Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <GCProcessingPipeline
                  data={gcProcessing}
                  candidateEmail={candidateEmail || ""}
                  candidateId={candidateId}
                  isEditing={false}
                  onDataChange={() => {}}
                  onRefresh={() => Promise.resolve()}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Related Documents */}
      {documents && documents.length > 0 && (
        <SectionDocumentsList
          documents={documents}
          sectionName="Green Card Documents"
          sectionCode="gc_tracker"
          documentTypes={GC_TRACKER_DOC_TYPES}
          candidateEmail={candidateEmail || ""}
          isEditing={isEditing}
          accessLevel="Full Access"
          onRefresh={onDocumentsRefresh || (() => Promise.resolve())}
          compact
        />
      )}
    </div>
  );
}
