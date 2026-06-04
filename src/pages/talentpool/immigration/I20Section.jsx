import { useState, useCallback, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Plus, ChevronDown, ChevronRight, FileText, GraduationCap, Trash2, School, Eye, Loader2 } from "lucide-react";
import { DEGREE_LEVELS, I20_TYPES, getDegreeLevelLabel, getI20TypeLabel } from "./types/opt-records";
import { SmartUploadButton } from "./SmartUploadButton";
import { toast } from "react-toastify";
import { downloadDocument } from "../../../utils/immigrationDocumentsApiService";
import FilePreview from "../../benchcandidate/FilePreview";

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

const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

function I20Card({ i20, isCurrent, isEditing = false, onChange, onDelete, onViewDocument }) {
  const handleFieldChange = (field, value) => {
    if (onChange) onChange({ ...i20, [field]: value });
  };

  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  // This safely grabs the file name whether it's stored as a string or inside an object
  const fileName = i20?.document_file_name || i20?.document?.file_name || i20?.document || i20?.file_name;

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
            {isCurrent ? (
              <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                PREVIOUS
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Edit Mode
            </Badge>
          </div>
          <div className="flex items-center gap-1">
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
              View I-20
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(i20.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="SEVIS Number"
            value={i20.sevis_number}
            onChange={(v) => handleFieldChange("sevis_number", v)}
            placeholder="N0012345678"
          />
          <EditField
            label="Student Name"
            value={i20.student_name}
            onChange={(v) => handleFieldChange("student_name", v)}
          />
          <div className="col-span-2">
            <EditField
              label="School Name"
              value={i20.school_name}
              onChange={(v) => handleFieldChange("school_name", v)}
            />
          </div>
          <SelectField
            label="Degree Level"
            value={i20.degree_level}
            onChange={(v) => handleFieldChange("degree_level", v)}
            options={DEGREE_LEVELS}
          />
          <EditField
            label="Program/Major"
            value={i20.program}
            onChange={(v) => handleFieldChange("program", v)}
            className="col-span-2"
          />
          <EditField label="CIP Code" value={i20.cip_code} onChange={(v) => handleFieldChange("cip_code", v)} />
          <SelectField
            label="I-20 Type"
            value={i20.i20_type}
            onChange={(v) => handleFieldChange("i20_type", v)}
            options={I20_TYPES}
          />
          <EditField
            label="Program Start"
            value={i20.program_start_date}
            onChange={(v) => handleFieldChange("program_start_date", v)}
            type="date"
          />
          <EditField
            label="Program End"
            value={i20.program_end_date}
            onChange={(v) => handleFieldChange("program_end_date", v)}
            type="date"
          />
          <EditField
            label="OPT Start"
            value={i20.opt_start_date}
            onChange={(v) => handleFieldChange("opt_start_date", v)}
            type="date"
          />
          <EditField
            label="OPT End"
            value={i20.opt_end_date}
            onChange={(v) => handleFieldChange("opt_end_date", v)}
            type="date"
          />
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <School className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">DSO Contact</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <EditField label="DSO Name" value={i20.dso_name} onChange={(v) => handleFieldChange("dso_name", v)} />
            <EditField
              label="DSO Email"
              value={i20.dso_email}
              onChange={(v) => handleFieldChange("dso_email", v)}
              type="email"
            />
            <EditField
              label="DSO Phone"
              value={i20.dso_phone}
              onChange={(v) => handleFieldChange("dso_phone", v)}
              type="tel"
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{i20.sevis_number}</span>
          {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
          {i20.stem_eligible && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-700">
              STEM Eligible
            </Badge>
          )}
          {i20.stem_opt_recommended && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-700">
              STEM OPT
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
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
            View I-20
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(i20.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">School</p>
          <p className="font-medium">{i20.school_name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Program</p>
          <p className="font-medium">{i20.program}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Degree</p>
          <p className="font-medium">{getDegreeLevelLabel(i20.degree_level)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">I-20 Type</p>
          <p className="font-medium">{getI20TypeLabel(i20.i20_type)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Program Dates</p>
          <p className="font-medium">
            {formatDateSafe(i20.program_start_date)} → {formatDateSafe(i20.program_end_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">OPT Dates</p>
          <p className="font-medium">
            {formatDateSafe(i20.opt_start_date)} → {formatDateSafe(i20.opt_end_date)}
          </p>
        </div>
        {i20.dso_name && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">DSO Contact</p>
            <p className="font-medium">
              {i20.dso_name} {i20.dso_email && `— ${i20.dso_email}`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export function I20Section({
  i20History = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddI20,
  onDeleteI20,
  onI20DataExtracted,
  onSaveI20,
  onRefreshData,
  onI20Change,
  historyOnly = false,
  // Note: onViewDocument prop is removed since we handle it directly here now
}) {
  const [showPreviousI20s, setShowPreviousI20s] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  useEffect(() => {
    if (viewerLoading === true) {
      setTimeout(() => {
        setViewerLoading(false);
      }, 4000);
    }
  }, [viewerLoading]);

  const currentI20 = i20History.find((i) => i.is_current);
  const previousI20s = i20History.filter((i) => !i.is_current);

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

  // File preview renderer to avoid repeating it
  const renderFilePreview = () => {
    if (!viewerDoc?.base64) return null;
    return (
      <div className="p-0">
        <FilePreview
          fileType={viewerDoc?.type}
          base64File={viewerDoc?.base64}
          setBase64File={() => setViewerDoc(null)}
          setFileType={() => setViewerDoc(null)}
          docObject={{ file_name: viewerDoc.name }}
        />
      </div>
    );
  };

  if (historyOnly) {
    if (previousI20s.length === 0) return null;
    return (
      <>
        <Collapsible open={showPreviousI20s} onOpenChange={setShowPreviousI20s}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-content-start text-muted-foreground hover:bg-muted/50"
            >
              {showPreviousI20s ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              Previous I-20s ({previousI20s.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="!space-y-2 pt-2">
            {previousI20s.map((i20) => (
              <I20Card
                key={i20.id}
                i20={i20}
                isCurrent={false}
                isEditing={isEditing}
                onChange={onI20Change}
                onDelete={onDeleteI20}
                onViewDocument={handleViewPetitionDocument}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
        {renderFilePreview()}
      </>
    );
  }

  const hasNoI20s = i20History.length === 0;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium text-[16px]">I-20 History</div>
            {i20History.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {i20History.length}
              </Badge>
            )}
          </div>
          {i20History.length > 0 && onAddI20 && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddI20}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add I-20
            </Button>
          )}
        </div>
        {hasNoI20s ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-1">No I-20 Data</p>
            <p className="text-sm mb-4">Upload an I-20 to track program and OPT information</p>
            <div className="flex flex-col items-center gap-2">
              {candidateEmail && onI20DataExtracted && (
                <SmartUploadButton
                  documentType="i20"
                  label="Smart Upload I-20"
                  candidateEmail={candidateEmail}
                  candidateId={candidateId}
                  onDataExtracted={onI20DataExtracted}
                  onRawDataExtracted={onSaveI20}
                  onRefreshData={onRefreshData}
                  variant="default"
                />
              )}
              {onAddI20 && (
                <Button variant="outline" size="sm" onClick={onAddI20}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Manually
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {currentI20 && (
              <I20Card
                i20={currentI20}
                isCurrent={true}
                isEditing={isEditing}
                onChange={onI20Change}
                onDelete={onDeleteI20}
                onViewDocument={handleViewPetitionDocument}
              />
            )}
            {previousI20s.length > 0 && (
              <Collapsible open={showPreviousI20s} onOpenChange={setShowPreviousI20s}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-content-start text-muted-foreground">
                    {showPreviousI20s ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Previous I-20s ({previousI20s.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="!space-y-2 pt-2">
                  {previousI20s.map((i20) => (
                    <I20Card
                      key={i20.id}
                      i20={i20}
                      isCurrent={false}
                      isEditing={isEditing}
                      onChange={onI20Change}
                      onDelete={onDeleteI20}
                      onViewDocument={handleViewPetitionDocument}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
      {renderFilePreview()}
    </>
  );
}
