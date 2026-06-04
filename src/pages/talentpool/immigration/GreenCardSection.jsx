import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, CreditCard, Pencil, X, Save, Trash2 } from "lucide-react";
import { SmartUploadButton } from "./SmartUploadButton";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US");
  }
  return new Date(dateString).toLocaleDateString("en-US");
};

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
  </div>
);

export function GreenCardSection({ greenCardData, candidateEmail, candidateId, onSaveGC, onDeleteGC, onRefreshData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const rawData = greenCardData || {};
  console.log("[GreenCardSection] Received greenCardData:", greenCardData);

  const data = {
    ...rawData,
    resident_since: rawData.resident_since || rawData.gc_card_received_date,
    card_expiry_date: rawData.card_expiry_date || rawData.gc_card_expiry_date,
    category: rawData.category || rawData.gc_category,
  };

  const daysUntilExpiry = getDaysUntilExpiry(data.card_expiry_date);
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 180;
  const hasCardData = !!(data.card_number || data.a_number || data.resident_since || data.card_expiry_date);

  const handleStartEdit = () => {
    setEditedData({ ...data });
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setEditedData({});
    setIsEditing(false);
  };
  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await onSaveGC(editedData);
      await onRefreshData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving GC data:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };
  const handleDataExtracted = (_data) => {};
  const handleRawDataExtracted = async (rawExtractedData, fileInfo) => {
    return await onSaveGC(rawExtractedData, fileInfo);
  };
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (!onDeleteGC) return;
    setIsDeleting(true);
    try {
      await onDeleteGC();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting GC data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasNoData = !hasCardData;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium text-gray-900">Permanent Resident Card</div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancelEdit} disabled={isSaving}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdit} disabled={isSaving}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              {!hasNoData && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleStartEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
              <SmartUploadButton
                documentType="gc_card"
                label="Smart Upload"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={handleDataExtracted}
                onRawDataExtracted={handleRawDataExtracted}
                onRefreshData={onRefreshData}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
              />
            </>
          )}
        </div>
      </div>

      {hasNoData && !isEditing ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No Green Card Data</p>
          <p className="text-sm mb-4">Upload a Green Card to extract and store card details</p>
          <SmartUploadButton
            documentType="gc_card"
            label="Smart Upload Green Card"
            candidateEmail={candidateEmail}
            candidateId={candidateId}
            onDataExtracted={handleDataExtracted}
            onRawDataExtracted={handleRawDataExtracted}
            onRefreshData={onRefreshData}
            variant="default"
          />
        </div>
      ) : (
        <Card className={`p-4 border-primary/50 bg-primary/5 ${isExpired ? "border-destructive/50" : ""}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{data.card_number || "Green Card"}</span>
              {isExpired ? (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              ) : isExpiringSoon ? (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expires in {daysUntilExpiry} days
                </Badge>
              ) : (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              {data.category && (
                <Badge variant="outline" className="text-xs">
                  {data.category}
                </Badge>
              )}
              {data.is_conditional && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Conditional
                </Badge>
              )}
            </div>
            {onDeleteGC && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <EditField
                label="Card Number"
                value={editedData.card_number}
                onChange={(v) => handleFieldChange("card_number", v)}
                placeholder="USCXXXXXXX"
              />
              <EditField
                label="A-Number"
                value={editedData.a_number}
                onChange={(v) => handleFieldChange("a_number", v)}
                placeholder="A123456789"
              />
              <EditField
                label="Category"
                value={editedData.category}
                onChange={(v) => handleFieldChange("category", v)}
                placeholder="EB2, IR1, etc."
              />
              <EditField
                label="Country of Birth"
                value={editedData.country_of_birth}
                onChange={(v) => handleFieldChange("country_of_birth", v)}
              />
              <EditField
                label="Resident Since"
                value={editedData.resident_since}
                onChange={(v) => handleFieldChange("resident_since", v)}
                type="date"
              />
              <EditField
                label="Card Expires"
                value={editedData.card_expiry_date}
                onChange={(v) => handleFieldChange("card_expiry_date", v)}
                type="date"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {data.card_holder_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Card Holder</p>
                  <p className="font-medium">{data.card_holder_name}</p>
                </div>
              )}
              {data.a_number && (
                <div>
                  <p className="text-xs text-muted-foreground">A-Number</p>
                  <p className="font-medium">{data.a_number}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Resident Since</p>
                <p className="font-medium">{formatDateSafe(data.resident_since)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Card Expires</p>
                <p className={`font-medium ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : ""}`}>
                  {formatDateSafe(data.card_expiry_date)}
                </p>
              </div>
              {data.country_of_birth && (
                <div>
                  <p className="text-xs text-muted-foreground">Country of Birth</p>
                  <p className="font-medium">{data.country_of_birth}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Green Card Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Green Card data? This action cannot be undone and will clear all card
              details from this candidate's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
