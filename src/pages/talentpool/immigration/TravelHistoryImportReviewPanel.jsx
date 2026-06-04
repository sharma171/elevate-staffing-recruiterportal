import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../../../components/ui/sheet";
import { Plane, AlertTriangle, Loader2, CheckCircle, FileText } from "lucide-react";

export function TravelHistoryImportReviewPanel({ open, onOpenChange, parsedData, onImport, importing = false }) {
  const [selectedIndices, setSelectedIndices] = useState(() => new Set(parsedData.trips.map((_, idx) => idx)));

  const handleToggleTrip = (index) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === parsedData.trips.length) setSelectedIndices(new Set());
    else setSelectedIndices(new Set(parsedData.trips.map((_, idx) => idx)));
  };

  const handleImport = async () => {
    const selectedTrips = parsedData.trips.filter((_, idx) => selectedIndices.has(idx));
    await onImport(selectedTrips);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full !max-w-2xl overflow-y-auto">
        <SheetHeader className="!pb-4 border-b-[1px] border-l-0 border-solid border-r-0 border-t-0 border-[#e7e7ef]">
          <SheetTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-[#7c3bed]" />
            Import Travel History
          </SheetTitle>
          <SheetDescription>Select trips to import from I-94 records</SheetDescription>
        </SheetHeader>
        <div className="!space-y-4 !py-4">
          <Card className="border-[#7c3bed]/20 bg-[#7c3bed]/5">
            <CardContent className="!pt-4">
              <div className="flex items-center !gap-3">
                <FileText className="h-8 w-8 text-[#7c3bed]/70" />
                <div>
                  <p className="font-medium text-[#080118]">Document #{parsedData.document_number}</p>
                  <p className="text-sm text-[#67677e] mt-0">
                    {parsedData.country_of_issuance && `Issued by ${parsedData.country_of_issuance} • `}
                    {parsedData.total_entries} total entries • {parsedData.trips.length} trips detected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {parsedData.trips.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No complete trips were detected in this I-94 record.</AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-800" />
              <AlertDescription className="text-amber-800">
                Review the trips below. Deselect any that are already in the system or should not be imported.
              </AlertDescription>
            </Alert>
          )}
          {parsedData.trips.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIndices.size === parsedData.trips.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all trips"
                      />
                    </TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead className="text-right">Days Outside</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.trips.map((trip, idx) => (
                    <TableRow key={idx} className={selectedIndices.has(idx) ? "bg-primary/5" : "opacity-60"}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIndices.has(idx)}
                          onCheckedChange={() => handleToggleTrip(idx)}
                          aria-label={`Select trip ${idx + 1}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{formatDate(trip.departure_date)}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {trip.departure_location}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{formatDate(trip.arrival_date)}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {trip.arrival_location}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{trip.days_outside_us} days</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {parsedData.trips.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {selectedIndices.size} of {parsedData.trips.length} trips selected
              </span>
              <span>
                Total days outside:{" "}
                {parsedData.trips
                  .filter((_, idx) => selectedIndices.has(idx))
                  .reduce((sum, trip) => sum + trip.days_outside_us, 0)}
              </span>
            </div>
          )}
        </div>
        <SheetFooter className="!pt-4 border-t-[1px] border-l-0 border-r-0 border-b-0 border-solid border-[#e7e7ef]">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || selectedIndices.size === 0}>
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Import {selectedIndices.size} Trip{selectedIndices.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
