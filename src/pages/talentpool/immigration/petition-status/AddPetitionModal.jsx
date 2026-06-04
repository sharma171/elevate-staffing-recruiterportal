// Manual petition entry modal for receipt-only cases
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { Textarea } from "../../../../components/ui/textarea";
import { PETITION_TYPES, PETITION_STATUSES } from "../constants";
import { Loader2 } from "lucide-react";

export function AddPetitionModal({ open, onOpenChange, lcaHistory, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receipt_number: "",
    petition_type: "extension",
    status: "pending",
    employer_name: "",
    filed_date: "",
    notice_date: "",
    approval_date: "",
    validity_start: "",
    validity_end: "",
    premium_processing: false,
    lca_id: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.receipt_number.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        receipt_number: "",
        petition_type: "extension",
        status: "pending",
        employer_name: "",
        filed_date: "",
        notice_date: "",
        approval_date: "",
        validity_start: "",
        validity_end: "",
        premium_processing: false,
        lca_id: "",
        notes: "",
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproved = formData.status === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Petition Manually</DialogTitle>
          <DialogDescription>
            Enter petition details when you only have the receipt number from email or other sources.
          </DialogDescription>
        </DialogHeader>
        <div className="!space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="receipt_number">
              Receipt Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="receipt_number"
              value={formData.receipt_number}
              onChange={(e) => handleChange("receipt_number", e.target.value)}
              placeholder="IOE1234567890"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Petition Type</Label>
              <Select value={formData.petition_type} onValueChange={(v) => handleChange("petition_type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PETITION_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PETITION_STATUSES.map((ps) => (
                    <SelectItem key={ps.value} value={ps.value}>
                      {ps.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer_name">Employer Name</Label>
            <Input
              id="employer_name"
              value={formData.employer_name}
              onChange={(e) => handleChange("employer_name", e.target.value)}
              placeholder="Company Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filed_date">Filed Date</Label>
              <Input
                id="filed_date"
                type="date"
                value={formData.filed_date}
                onChange={(e) => handleChange("filed_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice_date">Notice Date</Label>
              <Input
                id="notice_date"
                type="date"
                value={formData.notice_date}
                onChange={(e) => handleChange("notice_date", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="premium_processing"
              checked={formData.premium_processing}
              onCheckedChange={(checked) => handleChange("premium_processing", checked)}
            />
            <Label htmlFor="premium_processing" className="cursor-pointer">
              Premium Processing
            </Label>
          </div>
          {isApproved && (
            <div className="!space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">Approval Details</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="approval_date">Approval Date</Label>
                  <Input
                    id="approval_date"
                    type="date"
                    value={formData.approval_date}
                    onChange={(e) => handleChange("approval_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity_start">Valid From</Label>
                  <Input
                    id="validity_start"
                    type="date"
                    value={formData.validity_start}
                    onChange={(e) => handleChange("validity_start", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity_end">Valid To</Label>
                  <Input
                    id="validity_end"
                    type="date"
                    value={formData.validity_end}
                    onChange={(e) => handleChange("validity_end", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Link to LCA</Label>
            <Select
              value={formData.lca_id || "none"}
              onValueChange={(v) => handleChange("lca_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LCA (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {lcaHistory.map((lca) => (
                  <SelectItem key={lca.id} value={lca.id}>
                    {lca.case_number} ({lca.status}) {lca.job_title ? `- ${lca.job_title}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes about this petition..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.receipt_number.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Petition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
