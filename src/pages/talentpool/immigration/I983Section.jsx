import { useState, useCallback, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import { toast } from "react-toastify";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import FilePreview from "../../benchcandidate/FilePreview";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Building2,
  Trash2,
  CheckCircle,
  Circle,
  Clock,
  User,
  Eye,
  Loader2,
} from "lucide-react";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const isEvalDue = (dueDate) => {
  if (!dueDate) return false;
  const match = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match;
  const due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
};

const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Input
      type={type}
      value={value?.toString() || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
  </div>
);

function EvaluationStatus({ label, dueDate, completed, completedDate, isEditing, onToggle }) {
  const isDue = isEvalDue(dueDate);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${completed ? "bg-green-50 border border-green-200" : isDue ? "bg-amber-50 border border-amber-200" : "bg-muted/50 border border-muted"}`}
    >
      <div className="flex items-center gap-2">
        {completed ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : isDue ? (
          <Clock className="h-4 w-4 text-amber-600" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {completed && completedDate
              ? `Completed: ${formatDateSafe(completedDate)}`
              : dueDate
                ? `Due: ${formatDateSafe(dueDate)}`
                : "Not scheduled"}
          </p>
        </div>
      </div>
      {isEditing && onToggle && <Switch checked={completed || false} onCheckedChange={onToggle} />}
    </div>
  );
}

function I983Card({
  i983,
  isCurrent,
  isEditing = false,
  onChange,
  onDelete,
  onUpdateEvaluation,
  showDetails,
  setShowDetails,
  onViewDocument,
}) {
  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);
  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange({ ...i983, [field]: value });
    }
  };

  const handleEvalToggle = async (evalType, completed) => {
    if (onUpdateEvaluation) {
      const today = new Date().toISOString().split("T")[0];
      await onUpdateEvaluation(i983.id, evalType, completed, completed ? today : undefined);
    } else if (onChange) {
      const today = new Date().toISOString().split("T")[0];
      onChange({
        ...i983,
        [`eval_${evalType}_completed`]: completed,
        [`eval_${evalType}_completed_date`]: completed ? today : undefined,
      });
    }
  };
  const fileName = i983?.document_file_name || i983?.document?.file_name || i983?.document || i983?.file_name;

  // FIX: Properly check if both a filename exists AND the prop function was passed
  const hasViewableDocument = Boolean(onViewDocument && fileName);

  const handleViewDocument = () => {
    if (!hasViewableDocument) return;
    onViewDocument(fileName);
    setViewerLoading(true);
  };

  if (isEditing) {
    return (
      <Card className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted bg-muted/30"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
            {!isCurrent && (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                PREVIOUS
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
            {i983.submitted && (
              <Badge variant="default" className="text-xs bg-green-600">
                Submitted
              </Badge>
            )}
          </div>
          <div className="!space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 text-xs ${!hasViewableDocument ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleViewDocument}
              disabled={!hasViewableDocument}
            >
              {viewerLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                </>
              )}
              View I-983
            </Button>

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(i983.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <EditField
            label="Employer Name"
            value={i983.employer_name}
            onChange={(v) => handleFieldChange("employer_name", v)}
            className="col-span-2"
          />
          <EditField
            label="Employer EIN"
            value={i983.employer_ein}
            onChange={(v) => handleFieldChange("employer_ein", v)}
          />
          <EditField
            label="E-Verify Company ID"
            value={i983.employer_e_verify_company_id}
            onChange={(v) => handleFieldChange("employer_e_verify_company_id", v)}
          />
          <EditField
            label="Job Title"
            value={i983.job_title}
            onChange={(v) => handleFieldChange("job_title", v)}
            className="col-span-2"
          />
          <EditField
            label="Training Start"
            value={i983.training_start_date}
            onChange={(v) => handleFieldChange("training_start_date", v)}
            type="date"
          />
          <EditField
            label="Training End"
            value={i983.training_end_date}
            onChange={(v) => handleFieldChange("training_end_date", v)}
            type="date"
          />
          <EditField
            label="Hours/Week"
            value={i983.hours_per_week}
            onChange={(v) => handleFieldChange("hours_per_week", parseInt(v) || 0)}
            type="number"
          />
          <EditField
            label="Compensation"
            value={i983.compensation}
            onChange={(v) => handleFieldChange("compensation", v)}
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Supervisor</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField
              label="Name"
              value={i983.supervisor_name}
              onChange={(v) => handleFieldChange("supervisor_name", v)}
            />
            <EditField
              label="Title"
              value={i983.supervisor_title}
              onChange={(v) => handleFieldChange("supervisor_title", v)}
            />
            <EditField
              label="Email"
              value={i983.supervisor_email}
              onChange={(v) => handleFieldChange("supervisor_email", v)}
              type="email"
            />
            <EditField
              label="Phone"
              value={i983.supervisor_phone}
              onChange={(v) => handleFieldChange("supervisor_phone", v)}
              type="tel"
            />
          </div>
        </div>

        <div className="pt-4 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] mt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Evaluations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <EvaluationStatus
              label="6-Month"
              dueDate={i983.eval_6month_due}
              completed={i983.eval_6month_completed}
              completedDate={i983.eval_6month_completed_date}
              isEditing={true}
              onToggle={(c) => handleEvalToggle("6month", c)}
            />
            <EvaluationStatus
              label="12-Month"
              dueDate={i983.eval_12month_due}
              completed={i983.eval_12month_completed}
              completedDate={i983.eval_12month_completed_date}
              isEditing={true}
              onToggle={(c) => handleEvalToggle("12month", c)}
            />
            <EvaluationStatus
              label="Final"
              dueDate={i983.eval_final_due}
              completed={i983.eval_final_completed}
              completedDate={i983.eval_final_completed_date}
              isEditing={true}
              onToggle={(c) => handleEvalToggle("final", c)}
            />
          </div>
        </div>

        <div className="pt-4 border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`submitted-${i983.id}`}
                checked={i983.submitted || false}
                onCheckedChange={(checked) => handleFieldChange("submitted", checked)}
              />
              <label htmlFor={`submitted-${i983.id}`} className="text-sm">
                I-983 Submitted to School
              </label>
            </div>
            {i983.submitted && (
              <EditField
                label="Submitted Date"
                value={i983.submitted_date}
                onChange={(v) => handleFieldChange("submitted_date", v)}
                type="date"
                className="flex-1 max-w-[200px]"
              />
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 overflow-hidden ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{i983.employer_name}</span>
          {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
          {i983.submitted ? (
            <Badge variant="default" className="text-xs bg-green-600">
              Submitted
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Not Submitted
            </Badge>
          )}
        </div>
        <div className="!space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs ${!hasViewableDocument ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleViewDocument}
            disabled={!hasViewableDocument}
          >
            {viewerLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
              </>
            )}
            View I-983
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(i983.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Job Title</p>
          <p className="font-medium">{i983.job_title || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Training Period</p>
          <p className="font-medium">
            {formatDateSafe(i983.training_start_date)} → {formatDateSafe(i983.training_end_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Compensation</p>
          <p className="font-medium">{i983.compensation || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hours/Week</p>
          <p className="font-medium">{i983.hours_per_week || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <EvaluationStatus
          label="6-Month"
          dueDate={i983.eval_6month_due}
          completed={i983.eval_6month_completed}
          completedDate={i983.eval_6month_completed_date}
        />
        <EvaluationStatus
          label="12-Month"
          dueDate={i983.eval_12month_due}
          completed={i983.eval_12month_completed}
          completedDate={i983.eval_12month_completed_date}
        />
        <EvaluationStatus
          label="Final"
          dueDate={i983.eval_final_due}
          completed={i983.eval_final_completed}
          completedDate={i983.eval_final_completed_date}
        />
      </div>

      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-900 bg-transparent rounded-md">
            {showDetails ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            Show Details
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 !space-y-4">
          {(i983.supervisor_name || i983.supervisor_email || i983.supervisor_phone) && (
            <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Supervisor</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{i983.supervisor_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{i983.supervisor_title || "—"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-primary truncate">{i983.supervisor_email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{i983.supervisor_phone || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {(i983.employer_ein || i983.employer_address || i983.employer_naics_code) && (
            <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Employer Details
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">EIN</p>
                  <p className="font-medium">{i983.employer_ein || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">NAICS Code</p>
                  <p className="font-medium">{i983.employer_naics_code || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-Verify ID</p>
                  <p className="font-medium">{i983.employer_e_verify_company_id || "—"}</p>
                </div>
                {i983.employer_address && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{i983.employer_address}</p>
                  </div>
                )}
                {i983.employer_website && (
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={i983.employer_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline truncate block"
                    >
                      {i983.employer_website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {i983.training_goals && (
            <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Training Goals</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{i983.training_goals}</p>
            </div>
          )}

          {i983.training_activities && (
            <div className="border-[#e7e7ef] border-solid  border-t-[1px] border-l-[0] border-r-[0] border-b-[0] pt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Training Activities
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{i983.training_activities}</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function I983Section({
  i983Records = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddI983,
  onDeleteI983,
  onI983Change,
  onUpdateEvaluation,
}) {
  const [showPreviousI983s, setShowPreviousI983s] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // ADD STATES FOR VIEWER
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  const currentI983 = i983Records.find((i) => i.is_current);
  const previousI983s = i983Records.filter((i) => !i.is_current);
  const hasNoI983s = i983Records.length === 0;

  const handleViewPetitionDocument = useCallback(
    async (fileName) => {
      if (!candidateEmail || !fileName) {
        toast.error("Cannot view document - missing information");
        return;
      }
      setViewerLoading(true);
      try {
        const response = await downloadDocument(candidateEmail, fileName);
        if (!response.success || !response.files?.length) {
          throw new Error(response.error || "Document not found");
        }
        const file = response.files[0];
        if (file.base64?.length < 200) {
          return toast.error(file.base64);
        }
        setViewerDoc({
          name: fileName,
          type: file.file_extension || "application/pdf",
          base64: file.base64,
        });
      } catch (error) {
        console.error("Error viewing document:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load document");
      } finally {
        setViewerLoading(false);
      }
    },
    [candidateEmail],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium text-[16px]">I-983 Training Plans</div>
          {i983Records.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {i983Records.length}
            </Badge>
          )}
        </div>
        {i983Records.length > 0 && onAddI983 && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddI983}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add I-983
          </Button>
        )}
      </div>

      {hasNoI983s ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No I-983 Training Plan</p>
          <p className="text-sm mb-4">Add an I-983 to track STEM OPT training requirements</p>
          {onAddI983 && (
            <Button variant="default" onClick={onAddI983}>
              <Plus className="h-4 w-4 mr-2" />
              Add I-983
            </Button>
          )}
        </div>
      ) : (
        <>
          {currentI983 && (
            <I983Card
              i983={currentI983}
              isCurrent={true}
              isEditing={isEditing}
              onChange={onI983Change}
              onDelete={onDeleteI983}
              onUpdateEvaluation={onUpdateEvaluation}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              onViewDocument={handleViewPetitionDocument}
            />
          )}

          {previousI983s.length > 0 && (
            <Collapsible open={showPreviousI983s} onOpenChange={setShowPreviousI983s}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-left justify-start text-muted-foreground">
                  {showPreviousI983s ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  Previous Training Plans ({previousI983s.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="!space-y-2 pt-2">
                {previousI983s.map((i983) => (
                  <I983Card
                    key={i983.id}
                    i983={i983}
                    isCurrent={false}
                    isEditing={isEditing}
                    onChange={onI983Change}
                    onDelete={onDeleteI983}
                    onUpdateEvaluation={onUpdateEvaluation}
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    onViewDocument={handleViewPetitionDocument}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
      {viewerDoc?.base64 && (
        <div className="p-0">
          <FilePreview
            fileType={viewerDoc.type}
            base64File={viewerDoc.base64}
            setBase64File={() => setViewerDoc(null)}
            setFileType={() => setViewerDoc(null)}
            docObject={{ file_name: viewerDoc.name }}
          />
        </div>
      )}
    </div>
  );
}
