import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { Loader2 } from "lucide-react";
import { TRAVEL_PURPOSES, COUNTRIES } from "./constants";
import { updateTravelRecord } from "../../../utils/immigrationApiService";
import { toast } from "react-toastify";

export function EditTravelRecordModal({ open, onOpenChange, record, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departure_date: record.departure_date,
    return_date: record.return_date,
    destination_country: record.destination_country,
    destination_city: record.destination_city,
    purpose: record.purpose,
    port_of_entry: record.port_of_entry,
    new_i94_number: record.new_i94_number,
    new_i94_expiry: record.new_i94_expiry,
    visa_stamped_during_trip: record.visa_stamped_during_trip,
    visa_stamp_consulate: record.visa_stamp_consulate,
    used_automatic_revalidation: record.used_automatic_revalidation,
    had_issues_at_port: record.had_issues_at_port,
    notes: record.notes,
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updates = {
        departure_date: formData.departure_date,
        return_date: formData.return_date || undefined,
        destination_country: formData.destination_country,
        destination_city: formData.destination_city || undefined,
        purpose: formData.purpose,
        port_of_entry: formData.port_of_entry || undefined,
        new_i94_number: formData.new_i94_number || undefined,
        new_i94_expiry: formData.new_i94_expiry || undefined,
        visa_stamped_during_trip: formData.visa_stamped_during_trip || false,
        visa_stamp_consulate: formData.visa_stamp_consulate || undefined,
        used_automatic_revalidation: formData.used_automatic_revalidation || false,
        had_issues_at_port: formData.had_issues_at_port || false,
        notes: formData.notes || undefined,
      };
      const response = await updateTravelRecord(record.travel_id, updates);
      if (response.success) {
        toast.success("Travel record updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to update travel record");
      }
    } catch (error) {
      console.error("Error updating travel record:", error);
      toast.error("Failed to update travel record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Travel Record</DialogTitle>
          <DialogDescription>Update the details of this travel record</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Departure Date *</Label>
            <Input
              type="date"
              value={formData.departure_date || ""}
              onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Return Date</Label>
            <Input
              type="date"
              value={formData.return_date || ""}
              onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Destination Country *</Label>
            <Select
              value={formData.destination_country || ""}
              onValueChange={(v) => setFormData({ ...formData, destination_country: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Destination City</Label>
            <Input
              value={formData.destination_city || ""}
              onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
              placeholder="City name"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Purpose *</Label>
            <Select
              value={formData.purpose || "vacation"}
              onValueChange={(v) => setFormData({ ...formData, purpose: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRAVEL_PURPOSES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Port of Entry</Label>
            <Input
              value={formData.port_of_entry || ""}
              onChange={(e) => setFormData({ ...formData, port_of_entry: e.target.value })}
              placeholder="e.g., JFK, LAX"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">New I-94 Number</Label>
            <Input
              value={formData.new_i94_number || ""}
              onChange={(e) => setFormData({ ...formData, new_i94_number: e.target.value })}
              placeholder="I-94 number received on entry"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">New I-94 Expiry</Label>
            <Input
              type="date"
              value={formData.new_i94_expiry || ""}
              onChange={(e) => setFormData({ ...formData, new_i94_expiry: e.target.value })}
            />
          </div>
          <div className="col-span-2 flex items-center justify-between p-3 rounded-md border">
            <div>
              <Label className="text-sm font-medium">Visa Stamped During Trip</Label>
              <p className="text-xs text-muted-foreground">Did you get a visa stamp at a consulate?</p>
            </div>
            <Switch
              checked={formData.visa_stamped_during_trip || false}
              onCheckedChange={(checked) => setFormData({ ...formData, visa_stamped_during_trip: checked })}
            />
          </div>
          {formData.visa_stamped_during_trip && (
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">Visa Stamp Consulate</Label>
              <Input
                value={formData.visa_stamp_consulate || ""}
                onChange={(e) => setFormData({ ...formData, visa_stamp_consulate: e.target.value })}
                placeholder="e.g., Mumbai, New Delhi"
              />
            </div>
          )}
          <div className="col-span-2 flex items-center justify-between p-3 rounded-md border">
            <div>
              <Label className="text-sm font-medium">Used Automatic Revalidation</Label>
              <p className="text-xs text-muted-foreground">Re-entered US with expired visa from Canada/Mexico</p>
            </div>
            <Switch
              checked={formData.used_automatic_revalidation || false}
              onCheckedChange={(checked) => setFormData({ ...formData, used_automatic_revalidation: checked })}
            />
          </div>
          <div className="col-span-2 flex items-center justify-between p-3 rounded-md border">
            <div>
              <Label className="text-sm font-medium">Had Issues at Port of Entry</Label>
              <p className="text-xs text-muted-foreground">Any delays, secondary inspection, or issues</p>
            </div>
            <Switch
              checked={formData.had_issues_at_port || false}
              onCheckedChange={(checked) => setFormData({ ...formData, had_issues_at_port: checked })}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this trip..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.departure_date || !formData.destination_country || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
