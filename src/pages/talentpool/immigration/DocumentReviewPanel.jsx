import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CheckCircle, AlertTriangle, Edit2, RotateCcw } from "lucide-react";
import { SECTION_MAPPING } from "./types";
import { cn } from "../../../lib/utils";

export function DocumentReviewPanel({ parsedData, onSave, onCancel, saving = false }) {
  const [editedData, setEditedData] = useState(parsedData.extracted_data);
  const [editingField, setEditingField] = useState(null);

  const getConfidenceLevel = (c) => (c >= 0.7 ? "high" : c >= 0.5 ? "medium" : "low");

  const getConfidenceStyles = (confidence) => {
    const level = getConfidenceLevel(confidence);
    if (level === "high") return { border: "border-l-green-500", bg: "bg-green-50/50", text: "text-green-700" };
    if (level === "medium") return { border: "border-l-amber-500", bg: "bg-amber-50/50", text: "text-amber-700" };
    return { border: "border-l-red-500", bg: "bg-red-50/50", text: "text-red-700" };
  };

  const formatFieldName = (fieldName) => fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const handleFieldChange = (fieldName, newValue) =>
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], value: newValue, edited: true } }));
  const handleResetField = (fieldName) => {
    setEditedData((prev) => ({ ...prev, [fieldName]: { ...parsedData.extracted_data[fieldName], edited: false } }));
    setEditingField(null);
  };
  const targetSection = SECTION_MAPPING[parsedData.document_type] || "documents";

  return (
    <div className="!space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-lg uppercase">{parsedData.document_type.replace(/_/g, " ")}</span>
          <Badge variant="secondary" className="text-xs">
            {Math.round(parsedData.document_type_confidence * 100)}% confident
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs">
          Target: {targetSection.replace(/_/g, " ")}
        </Badge>
      </div>
      {parsedData.needs_review && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Some fields need verification. Please check highlighted items before saving.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(editedData).map(([fieldName, fieldData]) => {
          const confidence = fieldData.confidence;
          const styles = getConfidenceStyles(confidence);
          const isEditing = editingField === fieldName;
          const needsReview = parsedData.review_fields.includes(fieldName);
          return (
            <div
              key={fieldName}
              className={cn(
                "p-3 rounded-md border-l-4 border-solid border-t-0 border-r-0 border-b-0 transition-all",
                styles.border,
                styles.bg,
                needsReview && "ring-2 ring-amber-300",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {formatFieldName(fieldName)}
                  {needsReview && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                </Label>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs", styles.text)}>{Math.round(confidence * 100)}%</span>
                  {fieldData.edited && (
                    <Badge variant="secondary" className="text-xs py-0">
                      Edited
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={fieldData.value}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  disabled={!isEditing && !needsReview && confidence >= 0.7}
                  className={cn("flex-1 h-8 text-sm", isEditing && "ring-2 ring-primary")}
                />
                {confidence >= 0.7 && !needsReview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingField(isEditing ? null : fieldName)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {fieldData.edited && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => handleResetField(fieldName)}
                    title="Reset to original"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {parsedData.processing_time_ms && (
        <p className="text-xs text-muted-foreground text-right">
          Processed in {(parsedData.processing_time_ms / 1000).toFixed(1)}s
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedData)} disabled={saving}>
          {saving ? "Saving..." : "Save to Profile"}
        </Button>
      </div>
    </div>
  );
}
