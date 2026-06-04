import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import { Plus, Plane, Trash2, Loader2, Pencil } from "lucide-react";
import { TRAVEL_PURPOSES, COUNTRIES } from "./constants";
import { addTravelRecord, deleteTravelRecord, importTravelHistory } from "../../../utils/immigrationApiService";
import { toast } from "react-toastify";
import { TravelHistoryImportReviewPanel } from "./TravelHistoryImportReviewPanel";
import { EditTravelRecordModal } from "./EditTravelRecordModal";
import { SmartUploadButton } from "./SmartUploadButton";

export function TravelHistorySection({ records, candidateEmail, candidateId, isEditing, onChange, onRefresh }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newRecord, setNewRecord] = useState({
    purpose: "vacation",
    visa_stamped_during_trip: false,
    used_automatic_revalidation: false,
    had_issues_at_port: false,
  });
  const [uploadState, setUploadState] = useState("idle");
  const [parsedTravelData, setParsedTravelData] = useState(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = records
    .sort((a, b) => new Date(b.departure_date).getTime() - new Date(a.departure_date).getTime())
    .slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginationRange = useMemo(() => {
    const getPaginationRange = (totalPages, currentPage, siblingCount = 1) => {
      const totalPageNumbers = siblingCount + 5;

      if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i,
        );
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
      }
    };
    return getPaginationRange(totalPages, currentPage) || [];
  }, [totalPages, currentPage]);

  const getCountryName = (code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    return country?.name || code;
  };
  const calculateDaysOutside = (departure, returnDate) => {
    if (!returnDate) return 0;
    return Math.ceil((new Date(returnDate).getTime() - new Date(departure).getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalDaysOutsideThisYear = records.reduce((total, record) => {
    if (!record.return_date) return total;
    if (new Date(record.departure_date).getFullYear() === new Date().getFullYear())
      return total + calculateDaysOutside(record.departure_date, record.return_date);
    return total;
  }, 0);

  const handleAddRecord = async () => {
    setIsSubmitting(true);
    try {
      const travelData = {
        departure_date: newRecord.departure_date || "",
        destination_country: newRecord.destination_country || "",
        destination_city: newRecord.destination_city,
        purpose: newRecord.purpose || "vacation",
        return_date: newRecord.return_date,
        port_of_entry: newRecord.port_of_entry,
        new_i94_number: newRecord.new_i94_number,
        new_i94_expiry: newRecord.new_i94_expiry,
        visa_stamped_during_trip: newRecord.visa_stamped_during_trip || false,
        visa_stamp_consulate: newRecord.visa_stamp_consulate,
        used_automatic_revalidation: newRecord.used_automatic_revalidation || false,
        had_issues_at_port: newRecord.had_issues_at_port || false,
        notes: newRecord.notes,
      };
      const response = await addTravelRecord(candidateEmail, travelData);
      if (response.success) {
        toast.success("Travel record added successfully");
        setShowAddDialog(false);
        setNewRecord({
          purpose: "vacation",
          visa_stamped_during_trip: false,
          used_automatic_revalidation: false,
          had_issues_at_port: false,
        });
        onRefresh?.();
      } else throw new Error(response.message || "Failed to add travel record");
    } catch (error) {
      console.error("Error adding travel record:", error);
      toast.error("Failed to add travel record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (travelId) => {
    setDeletingId(travelId);
    try {
      const response = await deleteTravelRecord(travelId);
      if (response.success) {
        toast.success("Travel record deleted successfully");
        onRefresh?.();
      } else throw new Error(response.message || "Failed to delete travel record");
    } catch (error) {
      console.error("Error deleting travel record:", error);
      toast.error("Failed to delete travel record. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTravelHistoryRawDataExtracted = async (rawExtractedData) => {
    try {
      const extractedData = rawExtractedData?.extracted_data || rawExtractedData;
      if (!extractedData) throw new Error("Failed to parse I-94 travel history");

      const mappedData = {
        document_number: extractedData.document_number || "",
        country_of_issuance: extractedData.country_of_issuance,
        total_entries: extractedData.total_entries || extractedData.entries?.length || 0,
        entries: extractedData.entries || [],
        trips: (extractedData.trips || []).map((trip) => ({
          departure_date: trip.departure_date,
          departure_location: trip.departure_location,
          arrival_date: trip.arrival_date,
          arrival_location: trip.arrival_location,
          days_outside_us: trip.days_outside_us || 0,
        })),
      };
      setParsedTravelData(mappedData);
      setShowReviewPanel(true);
      setUploadState("review");
    } catch (error) {
      console.error("Error parsing I-94:", error);
      toast.error("Failed to parse I-94 travel history");
      setUploadState("idle");
      throw error;
    }
  };

  const handleImportTrips = async (selectedTrips) => {
    if (!parsedTravelData) return;
    setUploadState("importing");
    try {
      const response = await importTravelHistory(candidateEmail, parsedTravelData.document_number, selectedTrips, true);
      if (!response.success) throw new Error(response.message || "Failed to import travel history");
      toast.error(
        `Imported ${response.imported} trip${response.imported !== 1 ? "s" : ""}${
          response.skipped > 0 ? `, skipped ${response.skipped} duplicate${response.skipped !== 1 ? "s" : ""}` : ""
        }`,
      );
      setShowReviewPanel(false);
      setParsedTravelData(null);
      setUploadState("idle");
      onRefresh?.();
    } catch (error) {
      console.error("Error importing:", error);
      toast.error("Failed to import travel history");
      setUploadState("review");
    }
  };

  const handleCloseReviewPanel = (open) => {
    if (!open) {
      setShowReviewPanel(false);
      setParsedTravelData(null);
      setUploadState("idle");
    }
  };

  return (
    <div className="!space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Total Trips</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Days Outside USA (This Year)</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold">{totalDaysOutsideThisYear}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="!text-sm !font-medium text-[#67677e]">Visa Stampings</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold">{records.filter((r) => r.visa_stamped_during_trip).length}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Travel History
            </CardTitle>
            <CardDescription>Record of international travel</CardDescription>
          </div>
          {/* {isEditing && ( */}
          <div className="flex gap-2">
            <SmartUploadButton
              documentType="i94_travel_history"
              label="Smart Import from I-94"
              candidateEmail={candidateEmail}
              candidateId={candidateId}
              onDataExtracted={() => {}}
              onRawDataExtracted={handleTravelHistoryRawDataExtracted}
              size="sm"
              variant="outline"
              className="h-9"
            />
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Trip
            </Button>
          </div>
          {/* )} */}
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No travel records found.</div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departure</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Return</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Visa Stamped</TableHead>
                      <TableHead>New I-94</TableHead>
                      {isEditing && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((record) => (
                      <TableRow key={record.travel_id}>
                        <TableCell>{new Date(record.departure_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{getCountryName(record.destination_country)}</span>
                            {record.destination_city && (
                              <span className="text-muted-foreground text-sm ml-1">({record.destination_city})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {record.purpose.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.return_date ? (
                            new Date(record.return_date).toLocaleDateString()
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Ongoing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.return_date ? calculateDaysOutside(record.departure_date, record.return_date) : "—"}
                        </TableCell>
                        <TableCell>
                          {record.visa_stamped_during_trip ? (
                            <Badge className="bg-[#7c3bed]/10 !text-[#7c3bed] text-xs">Yes</Badge>
                          ) : (
                            "No"
                          )}
                        </TableCell>
                        <TableCell>
                          {record.new_i94_number ? (
                            <span className="text-xs font-mono">{record.new_i94_number}</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        {isEditing && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setEditingRecord(record);
                                  setShowEditModal(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeleteRecord(record.travel_id)}
                                disabled={deletingId === record.travel_id}
                              >
                                {deletingId === record.travel_id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination className="mt-3">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {paginationRange.map((pageNumber, index) => {
                      if (pageNumber === "...") {
                        return (
                          <PaginationItem key={index}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNumber);
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Travel Record</DialogTitle>
            <DialogDescription>Record a new international trip</DialogDescription>
          </DialogHeader>
          <div className="!grid !grid-cols-2 !gap-4 !py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase">Departure Date *</label>
              <Input
                type="date"
                value={newRecord.departure_date || ""}
                onChange={(e) => setNewRecord({ ...newRecord, departure_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase">Return Date</label>
              <Input
                type="date"
                value={newRecord.return_date || ""}
                onChange={(e) => setNewRecord({ ...newRecord, return_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase">Destination Country *</label>
              <Select
                value={newRecord.destination_country || ""}
                onValueChange={(v) => setNewRecord({ ...newRecord, destination_country: v })}
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
              <label className="text-xs font-medium text-muted-foreground uppercase">City</label>
              <Input
                value={newRecord.destination_city || ""}
                onChange={(e) => setNewRecord({ ...newRecord, destination_city: e.target.value })}
                placeholder="City name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase">Purpose *</label>
              <Select
                value={newRecord.purpose || "vacation"}
                onValueChange={(v) => setNewRecord({ ...newRecord, purpose: v })}
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
              <label className="text-xs font-medium text-muted-foreground uppercase">Port of Entry</label>
              <Input
                value={newRecord.port_of_entry || ""}
                onChange={(e) => setNewRecord({ ...newRecord, port_of_entry: e.target.value })}
                placeholder="e.g., JFK, LAX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={!newRecord.departure_date || !newRecord.destination_country || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {parsedTravelData && (
        <TravelHistoryImportReviewPanel
          open={showReviewPanel}
          onOpenChange={handleCloseReviewPanel}
          parsedData={parsedTravelData}
          onImport={handleImportTrips}
          importing={uploadState === "importing"}
        />
      )}
      {editingRecord && (
        <EditTravelRecordModal
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) setEditingRecord(null);
          }}
          record={editingRecord}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
