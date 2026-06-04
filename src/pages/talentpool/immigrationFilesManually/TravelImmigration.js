import React, { useState, useRef } from "react";
import {
  Plane,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  AlertTriangle,
  Check,
  ChevronDown,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "BR", name: "Brazil" },
  { code: "CN", name: "China" },
  { code: "MX", name: "Mexico" },
];

const PURPOSES = [
  { value: "vacation", label: "Vacation" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "medical", label: "Medical" },
  { value: "family", label: "Family Visit" },
];

function TravelImmigration({ candidateDetails, immigrationData, isEditMode, getImmigrationInfo }) {
  const travelHistory = immigrationData?.data?.travel_history || [];
  const fileInputRef = useRef(null);

  // Smart Import States
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [parsedTrips, setParsedTrips] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [documentNumber, setDocumentNumber] = useState("");
  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editTrip, setEditTrip] = useState({
    departure_date: "",
    return_date: "",
    destination_country: "",
    destination_city: "",
    purpose: "",
    port_of_entry: "",
    new_i94_number: "",
    new_i94_expiry: "",
    visa_stamped_during_trip: false,
    visa_stamp_consulate: "",
    used_automatic_revalidation: false,
    had_issues_at_port: false,
    notes: "",
  });
  const [deletingTripId, setDeletingTripId] = useState(null);

  // Add Trip States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newTrip, setNewTrip] = useState({
    departure_date: "",
    return_date: "",
    destination_country: "",
    destination_city: "",
    purpose: "vacation",
    port_of_entry: "",
    visa_stamped_during_trip: false,
  });

  // Calculate statistics
  const calculateStats = () => {
    const totalTrips = travelHistory.length;
    const currentYear = new Date().getFullYear();
    const daysThisYear = travelHistory.reduce((acc, trip) => {
      const departureDate = new Date(trip.departure_date);
      const returnDate = new Date(trip.return_date);
      if (departureDate.getFullYear() === currentYear || returnDate.getFullYear() === currentYear) {
        const days = Math.ceil((returnDate - departureDate) / (1000 * 60 * 60 * 24));
        return acc + days;
      }
      return acc;
    }, 0);
    const visaStampings = travelHistory.filter((trip) => trip.visa_stamped_during_trip).length;
    return { totalTrips, daysThisYear, visaStampings };
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const calculateDays = (departure, returnDate) => {
    if (!departure || !returnDate) return 0;
    const departureDate = new Date(departure);
    const returnD = new Date(returnDate);
    return Math.ceil((returnD - departureDate) / (1000 * 60 * 60 * 24));
  };

  // Smart Import Functions
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];

        const response = await fetch(
          "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task: "parse-immigration-document",
              emailid: "marketing@4spheresolutions.com",
              employee_email: candidateDetails?.primary_email.fkjdbfh || "muni.k0892@gmail.com",
              doc_type: "i94_travel_history",
              file_base64: base64String,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          const extractedData = data.data.extracted_data;
          // Filter out invalid trips
          const validTrips = (extractedData.trips || []).filter((trip) => trip.departure_date && trip.arrival_date);

          setParsedTrips(validTrips);
          setSelectedTrips(validTrips.map((_, index) => index));
          setDocumentNumber(extractedData.document_number || "");
          setTotalEntries(extractedData.total_entries || 0);
          setShowImportPanel(true);
          toast.success(data.message);
        } else {
          toast.error("Failed to parse I-94 document");
        }
        setImportLoading(false);

        // ADD HERE - Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Failed to import I-94 document");
      setImportLoading(false);

      // ADD HERE TOO - Reset file input in error case
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportTrips = async () => {
    setImportLoading(true);
    try {
      const tripsToImport = parsedTrips.filter((_, index) => selectedTrips.includes(index));

      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "import-travel-history",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails?.primary_email.hbdsfds || "muni.k0892@gmail.com",
          document_number: documentNumber,
          skip_duplicates: true,
          trips: tripsToImport,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${data.message}. Imported: ${data.imported}, Skipped: ${data.skipped}`);
        setShowImportPanel(false);
        setParsedTrips([]);
        setSelectedTrips([]);
        setTotalEntries(0);
        if (getImmigrationInfo) {
          await getImmigrationInfo();
        }
      } else {
        toast.error("Failed to import trips");
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error) => toast.error(error));
        }
      }
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Failed to import trips");
    } finally {
      setImportLoading(false);
    }
  };

  const toggleTripSelection = (index) => {
    if (selectedTrips.includes(index)) {
      setSelectedTrips(selectedTrips.filter((i) => i !== index));
    } else {
      setSelectedTrips([...selectedTrips, index]);
    }
  };

  const toggleAllTrips = () => {
    if (selectedTrips.length === parsedTrips.length) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(parsedTrips.map((_, index) => index));
    }
  };

  // Add Trip Functions
  const handleAddTrip = async () => {
    if (!newTrip.departure_date || !newTrip.destination_country || !newTrip.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    setAddLoading(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "add-travel-record",
          emailid: "marketing@4spheresolutions.com",
          employee_email: candidateDetails?.primary_email.hbdsfds || "muni.k0892@gmail.com",
          travel_record: {
            ...newTrip,
            used_automatic_revalidation: false,
            had_issues_at_port: false,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowAddModal(false);
        setNewTrip({
          departure_date: "",
          return_date: "",
          destination_country: "",
          destination_city: "",
          purpose: "vacation",
          port_of_entry: "",
          visa_stamped_during_trip: false,
        });
        if (getImmigrationInfo) {
          await getImmigrationInfo();
        }
      } else {
        toast.error("Failed to add trip");
      }
    } catch (error) {
      console.error("Add trip failed", error);
      toast.error("Failed to add trip");
    } finally {
      setAddLoading(false);
    }
  };
  const closeImportPanel = () => {
    setShowImportPanel(false);
    setParsedTrips([]);
    setSelectedTrips([]);
    setDocumentNumber("");
    setTotalEntries(0);
  };

  const calculateTotalDaysOutside = () => {
    return parsedTrips
      .filter((_, index) => selectedTrips.includes(index))
      .reduce((total, trip) => total + (trip.days_outside_us || 0), 0);
  };

  const handleEditClick = (trip) => {
    setEditingTrip(trip);
    setEditTrip({
      departure_date: trip.departure_date || "",
      return_date: trip.return_date || "",
      destination_country: trip.destination_country || "",
      destination_city: trip.destination_city || "",
      purpose: trip.purpose || "",
      port_of_entry: trip.port_of_entry || "",
      new_i94_number: trip.new_i94_number || "",
      new_i94_expiry: trip.new_i94_expiry || "",
      visa_stamped_during_trip: trip.visa_stamped_during_trip || false,
      visa_stamp_consulate: trip.visa_stamp_consulate || "",
      used_automatic_revalidation: trip.used_automatic_revalidation || false,
      had_issues_at_port: trip.had_issues_at_port || false,
      notes: trip.notes || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateTrip = async () => {
    if (!editTrip.departure_date || !editTrip.destination_country || !editTrip.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    setEditLoading(true);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "update-travel-record",
          emailid: "marketing@4spheresolutions.com",
          travel_id: editingTrip.id,
          updates: editTrip,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowEditModal(false);
        setEditingTrip(null);
        if (getImmigrationInfo) {
          await getImmigrationInfo();
        }
      } else {
        toast.error("Failed to update trip");
      }
    } catch (error) {
      console.error("Update trip failed", error);
      toast.error("Failed to update trip");
    } finally {
      setEditLoading(false);
    }
  };
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this travel record?")) {
      return;
    }

    setDeletingTripId(tripId);
    try {
      const response = await fetch("https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "delete-travel-record",
          emailid: "marketing@4spheresolutions.com",
          travel_id: tripId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        if (getImmigrationInfo) {
          await getImmigrationInfo();
        }
      } else {
        toast.error("Failed to delete trip");
      }
    } catch (error) {
      console.error("Delete trip failed", error);
      toast.error("Failed to delete trip");
    } finally {
      setDeletingTripId(null);
    }
  };

  return (
    <div>
      <div className="space-y-4 Interfont">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-[#fff] text-card-foreground !shadow-sm">
            <div className="flex flex-col space-y-1.5 !p-6 !pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Total Trips</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-[#080118]">{stats.totalTrips}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-[#fff] text-card-foreground !shadow-sm">
            <div className="flex flex-col space-y-1.5 !p-6 !pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Days Outside USA (This Year)</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-[#080118]">{stats.daysThisYear}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-[#fff] text-card-foreground !shadow-sm">
            <div className="flex flex-col space-y-1.5 !p-6 !pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#67677e]">Visa Stampings</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-[#080118]">{stats.visaStampings}</div>
            </div>
          </div>
        </div>

        {/* Travel History Card */}
        <div className="rounded-xl border bg-[#fff] text-card-foreground !shadow-sm">
          <div className="space-y-1.5 p-6 flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold tracking-tight text-lg flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Travel History
              </h3>
              <p className="text-sm text-[#67677e]">Record of international travel</p>
            </div>

            {isEditMode && (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-[#fff] hover:!bg-blue-600 hover:!text-white h-9 rounded-xl px-3 gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Import from I-94
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#7c3bed] text-white hover:bg-[#6530ff] h-9 rounded-xl px-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Trip
                </button>
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            {travelHistory.length === 0 ? (
              <div className="text-center py-8 text-[#67677e]">No travel history records found</div>
            ) : (
              <div className="!rounded-xl border overflow-x-auto">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:!border-b border-[#e7e7ef]">
                      <tr className="border-b transition-colors hover:bg-[#f7f7fb] data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Departure
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Destination
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Purpose
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Return
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Days
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          Visa Stamped
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                          New I-94
                        </th>
                        {isEditMode && (
                          <th className="h-12 px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {travelHistory.map((trip) => (
                        <tr
                          key={trip.id}
                          className="!border-b border-[#e7e7ef] transition-colors hover:bg-[#f7f7fb] data-[state=selected]:bg-muted"
                        >
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            {formatDate(trip.departure_date)}
                          </td>
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            <div>
                              <span className="font-medium">{trip.destination_country}</span>
                              {trip.destination_city && (
                                <span className="text-[#080118] text-sm ml-1">({trip.destination_city})</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[#080118] capitalize text-xs">
                              {trip.purpose || "N/A"}
                            </div>
                          </td>
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            {formatDate(trip.return_date)}
                          </td>
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            {calculateDays(trip.departure_date, trip.return_date)}
                          </td>
                          <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                            {trip.visa_stamped_during_trip ? (
                              <div className="inline-flex items-center rounded-full border !px-2.5 !py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent !shadow-sm hover:bg-primary/80 bg-[#7c3bed1a] text-[#7c3bed] text-xs">
                                Yes
                              </div>
                            ) : (
                              "No"
                            )}
                          </td>
                          <td className="p-3 align-middle text-xs [&:has([role=checkbox])]:pr-0">
                            {trip.new_i94_number || "—"}
                          </td>
                          {isEditMode && (
                            <td className="p-3 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditClick(trip)}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-transparent hover:!text-white hover:!bg-blue-500 rounded-xl h-7 w-7 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTrip(trip.id)}
                                  disabled={deletingTripId === trip.id}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-transparent hover:!text-white hover:!bg-red-500 rounded-xl h-7 w-7 p-0"
                                >
                                  {deletingTripId === trip.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Modal - Parsing I-94 */}
      {importLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center Interfont">
          <div className="fixed left-[50%] top-[50%] z-50 grid-cols-1 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] !gap-4 border bg-[#fff] p-6 shadow-lg duration-200 sm:rounded-xl sm:max-w-md">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#7c3bed]" />
                Parsing I-94 Travel History
              </h2>
              <p className="text-sm text-[#67677e] text-left">
                AI is extracting trip information from your I-94 document
              </p>
            </div>

            <div className="py-8 space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-[#7c3bed]" />
                  <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-base text-[#080118]">Analyzing travel records...</p>
                  <p className="text-sm text-[#67677e]">Extracting departures and arrivals</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 overflow-hidden rounded-full bg-[#f7f7fb] w-full">
                <div
                  className="h-full w-full flex-1 bg-[#7c3bed] transition-all animate-pulse"
                  style={{ transform: "translateX(-10%)" }}
                />
              </div>
            </div>

            <button
              onClick={() => setImportLoading(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 pdfcontrollButtonsPDF"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Import Review Panel */}
      {showImportPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end Interfont">
          <div className="fixed z-50 gap-4 bg-[#fff] p-6 shadow-lg transition ease-in-out inset-y-0 right-0 h-full border-l w-full  sm:max-w-2xl overflow-y-auto">
            <div className="flex flex-col space-y-2 text-center sm:text-left !pb-3 border-b-[1px] border-r-0 border-l-0 border-t-0 border-solid border-[#e7e7ef]">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Plane className="h-5 w-5 text-[#7c3bed]" />
                Import Travel History
              </h2>
              <p className="text-sm text-[#67677e] text-left">Select trips to import from I-94 records</p>
            </div>

            <div className="space-y-4 !py-4">
              <div className="rounded-xl border text-card-foreground shadow-sm border-[#7c3bed]/20 bg-[#7c3bed]/5">
                <div className="!p-6 !pt-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#7c3bed]/70" />
                    <div>
                      <p className="font-medium text-base text-[#080118]">Document #{documentNumber || ""}</p>
                      <p className="text-sm text-[#67677e] mt-0">
                        {totalEntries} total entries • {parsedTrips.length} trips detected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-amber-200 bg-amber-50 relative w-full rounded-xl border p-3">
                <AlertTriangle className="h-4 w-4 text-[#080118] absolute left-4 top-4 mt-1" />
                <div className="pl-7 text-sm text-amber-800">
                  Review the trips below. Deselect any that are already in the system or should not be imported.
                </div>
              </div>

              <div className="rounded-xl border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b-[1px] border-l-0 border-r-0 border-t-0 border-solid border-[#e7e7ef]">
                      <tr className="border-b transition-colors hover:bg-[#f7f7fb]">
                        <th className="h-12 px-3 text-left align-middle font-medium text-[#67677e] w-12">
                          <button
                            onClick={toggleAllTrips}
                            className="h-5 w-5 shrink-0 !rounded-full border border-[#7c3bed] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center"
                            style={{
                              backgroundColor: selectedTrips.length === parsedTrips.length ? "#7c3bed" : "transparent",
                              color: selectedTrips.length === parsedTrips.length ? "white" : "transparent",
                            }}
                          >
                            {selectedTrips.length === parsedTrips.length && <Check className="h-4 w-4" />}
                          </button>
                        </th>
                        <th className="h-12 px-3 text-left align-middle font-medium text-[#67677e]">Departure</th>
                        <th className="h-12 px-3 text-left align-middle font-medium text-[#67677e]">Arrival</th>
                        <th className="h-12 px-3 text-right align-middle font-medium text-[#67677e]">Days Outside</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {parsedTrips
                        .filter((trip) => trip.departure_date && trip.arrival_date)
                        .map((trip, index) => (
                          <tr
                            key={index}
                            className="border-b-[1px] border-l-0 border-r-0 border-t-0 border-solid border-[#e7e7ef] transition-colors hover:bg-[#f7f7fb]"
                            style={{
                              backgroundColor: selectedTrips.includes(index) ? "#7c3bed0d" : "transparent",
                            }}
                          >
                            <td className="p-3 align-middle">
                              <button
                                onClick={() => toggleTripSelection(index)}
                                className="h-5 w-5 shrink-0 rounded-full border border-[#7c3bed] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center"
                                style={{
                                  backgroundColor: selectedTrips.includes(index) ? "#7c3bed" : "transparent",
                                  color: selectedTrips.includes(index) ? "white" : "transparent",
                                }}
                                aria-label={`Select trip ${index + 1}`}
                              >
                                {selectedTrips.includes(index) && <Check className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="p-3 align-middle">
                              <div>
                                <span className="font-medium">{formatDate(trip.departure_date)}</span>
                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors ml-2 text-xs">
                                  {trip.departure_location}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 align-middle">
                              <div>
                                <span className="font-medium">{formatDate(trip.arrival_date)}</span>
                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors ml-2 text-xs">
                                  {trip.arrival_location}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 align-middle text-right">
                              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[#f7f7fb] border-transparent">
                                {trip.days_outside_us} days
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-[#67677e]">
                <span>
                  {selectedTrips.length} of {parsedTrips.length} trips selected
                </span>
                <span>Total days outside: {calculateTotalDaysOutside()}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t">
              <button
                onClick={() => setShowImportPanel(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTrips}
                disabled={selectedTrips.length === 0 || importLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-[#7c3bed] text-white hover:bg-[#6530ff] disabled:opacity-50 disabled:pointer-events-none"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {importLoading
                  ? "Importing..."
                  : `Import ${selectedTrips.length} Trip${selectedTrips.length !== 1 ? "s" : ""}`}
              </button>
            </div>

            <button
              onClick={() => closeImportPanel()}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center Interfont">
          <div className="fixed left-[50%] top-[50%] z-50 grid grid-cols-1 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] !gap-3 border bg-[#fff] p-6 shadow-lg rounded-xl">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-left text-[#080118]">
                Add Travel Record
              </h2>
              <p className="text-sm text-[#67677e] text-left">Record a new international trip</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">Departure Date *</label>
                <input
                  type="date"
                  value={newTrip.departure_date}
                  onChange={(e) => setNewTrip({ ...newTrip, departure_date: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">Return Date</label>
                <input
                  type="date"
                  value={newTrip.return_date}
                  onChange={(e) => setNewTrip({ ...newTrip, return_date: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">Destination Country *</label>
                <select
                  value={newTrip.destination_country}
                  onChange={(e) => setNewTrip({ ...newTrip, destination_country: e.target.value })}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-[#080118] focus:ring-offset-2"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">City</label>
                <input
                  type="text"
                  placeholder="City name"
                  value={newTrip.destination_city}
                  onChange={(e) => setNewTrip({ ...newTrip, destination_city: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">Purpose *</label>
                <select
                  value={newTrip.purpose}
                  onChange={(e) => setNewTrip({ ...newTrip, purpose: e.target.value })}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {PURPOSES.map((purpose) => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#67677e] uppercase">Port of Entry</label>
                <input
                  type="text"
                  placeholder="e.g., JFK, LAX"
                  value={newTrip.port_of_entry}
                  onChange={(e) => setNewTrip({ ...newTrip, port_of_entry: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrip}
                disabled={addLoading || !newTrip.departure_date || !newTrip.destination_country || !newTrip.purpose}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-[#7c3bed] text-white hover:bg-[#6530ff] disabled:opacity-50 disabled:pointer-events-none"
              >
                {addLoading ? "Adding..." : "Add Trip"}
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
      {/* Edit Trip Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end Interfont">
          <div className="fixed z-50 gap-4 bg-[#fff] p-6 shadow-lg transition ease-in-out inset-y-0 right-0 h-full border-l w-full sm:max-w-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center sm:text-left !pb-3 border-b-[1px] border-r-0 border-l-0 border-t-0 border-solid border-[#e7e7ef]">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Pencil className="h-5 w-5 text-[#7c3bed]" />
                Edit Travel Record
              </h2>
              <p className="text-sm text-[#67677e] text-left">Update the details of this travel record</p>
            </div>

            {/* Form Content */}
            <div className="space-y-4 !py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Departure Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Departure Date *</label>
                  <input
                    type="date"
                    value={editTrip.departure_date}
                    onChange={(e) => setEditTrip({ ...editTrip, departure_date: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Return Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Return Date</label>
                  <input
                    type="date"
                    value={editTrip.return_date}
                    onChange={(e) => setEditTrip({ ...editTrip, return_date: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Destination Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Destination Country *</label>
                  <select
                    value={editTrip.destination_country}
                    onChange={(e) => setEditTrip({ ...editTrip, destination_country: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-[#080118] focus:ring-offset-2"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Destination City</label>
                  <input
                    type="text"
                    placeholder="City name"
                    value={editTrip.destination_city}
                    onChange={(e) => setEditTrip({ ...editTrip, destination_city: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Purpose *</label>
                  <select
                    value={editTrip.purpose}
                    onChange={(e) => setEditTrip({ ...editTrip, purpose: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {PURPOSES.map((purpose) => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Port of Entry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Port of Entry</label>
                  <input
                    type="text"
                    placeholder="e.g., JFK, LAX"
                    value={editTrip.port_of_entry}
                    onChange={(e) => setEditTrip({ ...editTrip, port_of_entry: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* New I-94 Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">New I-94 Number</label>
                  <input
                    type="text"
                    placeholder="I-94 number received on entry"
                    value={editTrip.new_i94_number}
                    onChange={(e) => setEditTrip({ ...editTrip, new_i94_number: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* New I-94 Expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">New I-94 Expiry</label>
                  <input
                    type="date"
                    value={editTrip.new_i94_expiry}
                    onChange={(e) => setEditTrip({ ...editTrip, new_i94_expiry: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Visa Stamped During Trip Toggle */}
                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <label className="text-sm font-medium text-[#080118]">Visa Stamped During Trip</label>
                    <p className="text-xs text-[#67677e]">Did you get a visa stamp at a consulate?</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editTrip.visa_stamped_during_trip}
                    onClick={() =>
                      setEditTrip({ ...editTrip, visa_stamped_during_trip: !editTrip.visa_stamped_during_trip })
                    }
                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                      editTrip.visa_stamped_during_trip ? "bg-[#7c3bed]" : "bg-[#e7e7ef]"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                        editTrip.visa_stamped_during_trip ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Visa Stamp Consulate (Conditional) */}
                {editTrip.visa_stamped_during_trip && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-[#67677e] uppercase">Visa Stamp Consulate</label>
                    <input
                      type="text"
                      placeholder="e.g., Mumbai, New Delhi"
                      value={editTrip.visa_stamp_consulate}
                      onChange={(e) => setEditTrip({ ...editTrip, visa_stamp_consulate: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                )}

                {/* Used Automatic Revalidation Toggle */}
                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <label className="text-sm font-medium text-[#080118]">Used Automatic Revalidation</label>
                    <p className="text-xs text-[#67677e]">Re-entered US with expired visa from Canada/Mexico</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editTrip.used_automatic_revalidation}
                    onClick={() =>
                      setEditTrip({ ...editTrip, used_automatic_revalidation: !editTrip.used_automatic_revalidation })
                    }
                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                      editTrip.used_automatic_revalidation ? "bg-[#7c3bed]" : "bg-[#e7e7ef]"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                        editTrip.used_automatic_revalidation ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Had Issues at Port of Entry Toggle */}
                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <label className="text-sm font-medium text-[#080118]">Had Issues at Port of Entry</label>
                    <p className="text-xs text-[#67677e]">Any delays, secondary inspection, or issues</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editTrip.had_issues_at_port}
                    onClick={() => setEditTrip({ ...editTrip, had_issues_at_port: !editTrip.had_issues_at_port })}
                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                      editTrip.had_issues_at_port ? "bg-[#7c3bed]" : "bg-[#e7e7ef]"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                        editTrip.had_issues_at_port ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Notes */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[#67677e] uppercase">Notes</label>
                  <textarea
                    placeholder="Any additional notes about this trip..."
                    value={editTrip.notes}
                    onChange={(e) => setEditTrip({ ...editTrip, notes: e.target.value })}
                    rows="3"
                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-[#fff] px-3 py-2 text-sm text-[#080118] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTrip}
                disabled={editLoading || !editTrip.departure_date || !editTrip.destination_country || !editTrip.purpose}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-[#7c3bed] text-white hover:bg-[#6530ff] disabled:opacity-50 disabled:pointer-events-none"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {/* Close Button (Top Right) */}
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelImmigration;
