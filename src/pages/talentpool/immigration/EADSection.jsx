import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Plus, ChevronDown, ChevronRight, CreditCard, Trash2 } from "lucide-react";
import { EAD_CATEGORIES, EAD_STATUSES, getEADCategoryLabel, getEADStatusLabel } from "./types/opt-records";
import { SmartUploadButton } from "./SmartUploadButton";

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

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

function EADCard({ ead, isCurrent, isEditing = false, onChange, onDelete }) {
  const handleFieldChange = (field, value) => {
    if (onChange) onChange({ ...ead, [field]: value });
  };
  const daysUntilExpiry = getDaysUntilExpiry(ead.card_expiry_date);
  const isExpired = ead.status === "expired" || (daysUntilExpiry !== null && daysUntilExpiry < 0);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

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
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(ead.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField
            label="Card Number"
            value={ead.ead_number}
            onChange={(v) => handleFieldChange("ead_number", v)}
            placeholder="SRC-XX-XXX-XXXXX"
          />
          <SelectField
            label="Category"
            value={ead.ead_category}
            onChange={(v) => handleFieldChange("ead_category", v)}
            options={EAD_CATEGORIES}
          />
          <SelectField
            label="Status"
            value={ead.status}
            onChange={(v) => handleFieldChange("status", v)}
            options={EAD_STATUSES}
          />
          <EditField
            label="A-Number"
            value={ead.a_number}
            onChange={(v) => handleFieldChange("a_number", v)}
            placeholder="A123456789"
          />
          <EditField
            label="Card Holder Name"
            value={ead.card_holder_name}
            onChange={(v) => handleFieldChange("card_holder_name", v)}
            className="col-span-2"
          />
          <EditField
            label="Issue Date"
            value={ead.card_issue_date}
            onChange={(v) => handleFieldChange("card_issue_date", v)}
            type="date"
          />
          <EditField
            label="Expiry Date"
            value={ead.card_expiry_date}
            onChange={(v) => handleFieldChange("card_expiry_date", v)}
            type="date"
          />
        </div>
      </Card>
    );
  }

  const statusVariant =
    ead.status === "active" && !isExpired ? "default" : ead.status === "pending" ? "secondary" : "destructive";
  return (
    <Card
      className={`p-4 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-muted"} ${isExpired ? "border-destructive/50" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{ead.ead_number}</span>
          {isCurrent && <Badge className="bg-primary text-primary-foreground text-xs">CURRENT</Badge>}
          <Badge variant={statusVariant} className="text-xs">
            {isExpired ? "Expired" : getEADStatusLabel(ead.status)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getEADCategoryLabel(ead.ead_category)}
          </Badge>
          {isExpiringSoon && !isExpired && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
              Expires in {daysUntilExpiry} days
            </Badge>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(ead.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {ead.card_holder_name && (
          <div>
            <p className="text-xs text-muted-foreground">Card Holder</p>
            <p className="font-medium">{ead.card_holder_name}</p>
          </div>
        )}
        {ead.a_number && (
          <div>
            <p className="text-xs text-muted-foreground">A-Number</p>
            <p className="font-medium">{ead.a_number}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Issue Date</p>
          <p className="font-medium">{formatDateSafe(ead.card_issue_date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Expiry Date</p>
          <p className={`font-medium ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : ""}`}>
            {formatDateSafe(ead.card_expiry_date)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function EADSection({
  eadRecords = [],
  isEditing = false,
  candidateEmail,
  candidateId,
  onAddEAD,
  onDeleteEAD,
  onEADDataExtracted,
  onSaveEAD,
  onRefreshData,
  onEADChange,
  historyOnly = false,
}) {
  const [showPreviousEADs, setShowPreviousEADs] = useState(false);
  const currentEAD = eadRecords.find((e) => e.is_current);
  const previousEADs = eadRecords.filter((e) => !e.is_current);

  if (historyOnly) {
    if (previousEADs.length === 0) return null;
    return (
      <Collapsible open={showPreviousEADs} onOpenChange={setShowPreviousEADs}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-content-start text-muted-foreground hover:bg-muted/50"
          >
            {showPreviousEADs ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            Previous EAD Cards ({previousEADs.length})ss
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="!space-y-2 pt-2">
          {previousEADs.map((ead) => (
            <EADCard
              key={ead.id}
              ead={ead}
              isCurrent={false}
              isEditing={isEditing}
              onChange={onEADChange}
              onDelete={onDeleteEAD}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const hasNoEADs = eadRecords.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium text-[16px]">EAD Cards</div>
          {eadRecords.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {eadRecords.length}
            </Badge>
          )}
        </div>
        {eadRecords.length > 0 && onAddEAD && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddEAD}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add EAD
          </Button>
        )}
      </div>
      {hasNoEADs ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No EAD Card Data</p>
          <p className="text-sm mb-4">Upload an EAD card to track work authorization</p>
          <div className="flex flex-col items-center gap-2">
            {candidateEmail && onEADDataExtracted && (
              <SmartUploadButton
                documentType="ead_card"
                label="Smart Upload EAD"
                candidateEmail={candidateEmail}
                candidateId={candidateId}
                onDataExtracted={onEADDataExtracted}
                onRawDataExtracted={onSaveEAD}
                onRefreshData={onRefreshData}
                variant="default"
              />
            )}
            {onAddEAD && (
              <Button variant="outline" size="sm" onClick={onAddEAD}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Manually
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {currentEAD && (
            <EADCard
              ead={currentEAD}
              isCurrent={true}
              isEditing={isEditing}
              onChange={onEADChange}
              onDelete={onDeleteEAD}
            />
          )}
          {previousEADs.length > 0 && (
            <Collapsible open={showPreviousEADs} onOpenChange={setShowPreviousEADs}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-content-start text-muted-foreground">
                  {showPreviousEADs ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  Previous EAD Cards({previousEADs.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="!space-y-2 pt-2">
                {previousEADs.map((ead) => (
                  <EADCard
                    key={ead.id}
                    ead={ead}
                    isCurrent={false}
                    isEditing={isEditing}
                    onChange={onEADChange}
                    onDelete={onDeleteEAD}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
