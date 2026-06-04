import { useState, useMemo, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../../../components/ui/sheet";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCheck,
  ArrowRight,
  Shield,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { SECTION_MAPPING } from "./types";
import { I20_FIELD_SECTIONS, EAD_FIELD_SECTIONS, GC_CARD_FIELD_SECTIONS, FIELD_LABELS } from "./constants";
import { cn } from "../../../lib/utils";

const getFieldSections = (documentType) => {
  if (documentType === "i20") return I20_FIELD_SECTIONS;
  if (documentType === "ead_card" || documentType === "ead") return EAD_FIELD_SECTIONS;
  if (documentType === "gc_card" || documentType === "green_card") return GC_CARD_FIELD_SECTIONS;
  return null;
};

const shouldShowSection = (section, data) => {
  if (section.fields) return true;
  if (section.conditionalFields)
    return section.conditionalFields.some((field) => {
      const f = data[field];
      return f && f.value && f.value !== "" && f.value !== "null";
    });
  return false;
};

const formatBooleanValue = (value) => {
  const lv = value?.toLowerCase();
  if (lv === "true" || lv === "yes") return { display: "Yes", isBoolean: true };
  if (lv === "false" || lv === "no") return { display: "No", isBoolean: true };
  return { display: value, isBoolean: false };
};

export function DocumentReviewSheet({ open, onOpenChange, parsedData, onSave, saving = false }) {
  const [editedData, setEditedData] = useState(parsedData.extracted_data);

  useEffect(() => {
    setEditedData(parsedData.extracted_data || {});
  }, [parsedData]);

  const getConfidenceLevel = (c) => (c >= 0.7 ? "high" : c >= 0.5 ? "medium" : "low");

  const getConfidenceBadge = (confidence) => {
    const level = getConfidenceLevel(confidence);
    const percent = Math.round(confidence * 100);
    if (level === "high")
      return (
        <Badge variant="outline" className="border-green-500/50 !bg-[#22c55e1a] !text-[#15803d] dark:text-green-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {percent}%
        </Badge>
      );
    if (level === "medium")
      return (
        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {percent}%
        </Badge>
      );
    return (
      <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {percent}%
      </Badge>
    );
  };

  const formatFieldName = (fieldName) =>
    FIELD_LABELS[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const handleFieldChange = (fieldName, newValue) =>
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], value: newValue, edited: true } }));
  const handleResetField = (fieldName) =>
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...parsedData.extracted_data[fieldName], edited: false } }));
  const handleSave = () => onSave(editedData);

  const targetSection = SECTION_MAPPING[parsedData.document_type] || "documents";
  const fieldEntries = Object.entries(editedData);
  const highConfidenceCount = fieldEntries.filter(([, f]) => f.confidence >= 0.7).length;
  const needsReviewCount = parsedData.review_fields.length;
  const editedCount = fieldEntries.filter(([, f]) => f.edited).length;
  const fieldSections = getFieldSections(parsedData.document_type);

  const organizedFields = useMemo(() => {
    if (!fieldSections) return [{ title: "Extracted Data", fields: Object.keys(editedData) }];
    const sections = [];
    const usedFields = new Set();
    Object.values(fieldSections).forEach((section) => {
      const sectionFields = section.fields || section.conditionalFields || [];
      const availableFields = sectionFields.filter((field) => editedData[field] !== undefined);
      if (availableFields.length > 0 && shouldShowSection(section, editedData)) {
        sections.push({ title: section.title, fields: availableFields });
        availableFields.forEach((f) => usedFields.add(f));
      }
    });
    const remainingFields = Object.keys(editedData).filter((f) => !usedFields.has(f));
    if (remainingFields.length > 0) sections.push({ title: "Other Information", fields: remainingFields });
    return sections;
  }, [editedData, fieldSections]);

  const renderField = (fieldName) => {
    const fieldData = editedData[fieldName];
    if (!fieldData) return null;
    const confidence = fieldData.confidence;
    const level = getConfidenceLevel(confidence);
    const needsReview = parsedData.review_fields.includes(fieldName);
    const { display: formattedValue, isBoolean } = formatBooleanValue(fieldData.value);
    return (
      <div
        key={fieldName}
        className={cn(
          "group relative rounded-[10px] ring-1 p-3 transition-all m-[1px]",
          level === "high" && "ring-[#22c55e4d] bg-transparent",
          level === "medium" && "border-yellow-500/30 bg-yellow-500/5",
          level === "low" && "border-destructive/30 bg-destructive/5",
          needsReview && "ring-2 ring-yellow-500/50 ring-offset-1",
          fieldData.edited && "border-primary/50 bg-primary/5",
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            {formatFieldName(fieldName)}
            {needsReview && (
              <span className="text-[10px] font-normal text-yellow-700 dark:text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded">
                VERIFY
              </span>
            )}
            {fieldData.edited && (
              <span className="text-[10px] font-normal text-primary bg-primary/20 px-1.5 py-0.5 rounded">EDITED</span>
            )}
          </Label>
          {getConfidenceBadge(confidence)}
        </div>
        <div className="flex gap-2 items-center">
          {isBoolean ? (
            <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-background/80">
              {formattedValue === "Yes" ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm",
                  formattedValue === "Yes" ? "text-green-700 dark:text-green-400" : "text-muted-foreground",
                )}
              >
                {formattedValue}
              </span>
            </div>
          ) : (
            <Input
              value={fieldData.value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className={cn(
                "flex-1 h-9 text-sm bg-background/80 border-input/50",
                "focus:bg-background focus:ring-2 focus:ring-primary/20",
              )}
              placeholder="Enter value..."
            />
          )}
          {fieldData.edited && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => handleResetField(fieldName)}
              title="Reset to AI value"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full !max-w-[500px] p-0 flex flex-col space-y-1 !gap-3">
        <div className="bg-gradient-to-r from-[#efeaf2] via-[#f9f5fe] to-[#fffeff] p-3 border-b">
          <SheetHeader className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-full bg-[#723ee3]/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#723ee3]" />
              </div>
              <div>
                <SheetTitle className="text-lg text-[#080118]">AI Document Review</SheetTitle>
                <SheetDescription className="text-xs text-[#67677e] font-medium">
                  Review extracted data before saving
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                <FileCheck className="h-3.5 w-3.5" />
                {parsedData.document_type.replace(/_/g, " ").toUpperCase()}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <Badge variant="outline" className="gap-1 px-3 py-1">
                <Shield className="h-3.5 w-3.5" />
                {targetSection.replace(/_/g, " ")}
              </Badge>
            </div>
          </SheetHeader>
        </div>
        <div className="flex items-center gap-2 px-3 py-3 bg-[#f1f1f980] border-b text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{highConfidenceCount} verified</span>
          </div>
          {needsReviewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">{needsReviewCount} to review</span>
            </div>
          )}
          {editedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">{editedCount} edited</span>
            </div>
          )}
          {parsedData.processing_time_ms && (
            <div className="ml-auto text-xs text-muted-foreground">
              {(parsedData.processing_time_ms / 1000).toFixed(1)}s
            </div>
          )}
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="py-3 space-y-4">
            {organizedFields.map((section) => (
              <div key={section.title}>
                {organizedFields.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">{section.title}</h4>
                    <Separator className="flex-1" />
                  </div>
                )}
                <div className="space-y-3">{section.fields.map((fieldName) => renderField(fieldName))}</div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="p-3 pt-2 bg-muted/20">
          <div className="flex w-full gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save to Profile
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
