import React, { useState, useEffect } from "react";
import { ChevronDown, FileText, Sparkles, MoreHorizontal, Upload, Loader2, X, CheckCircle2, ArrowRight, FileCheck, Shield, Eye, Download, Pencil, FileEdit, Trash2, Check } from "lucide-react";
import { toast } from "react-toastify";


function PassportEntryImmigration({ candidateDetails,  immigrationData, getImmigrationInfo, isEditMode }) {
    const [openSections, setOpenSections] = useState({
        passport: true,
        i94: true,
        visaStamp: true
    });

    // Smart Upload states
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showAnalyzingDialog, setShowAnalyzingDialog] = useState(false);
    const [showReviewSheet, setShowReviewSheet] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [documentType, setDocumentType] = useState("passport");
    // Document actions states
    const [showDropdownMenu, setShowDropdownMenu] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
    // Add after existing states
    const [passportFormData, setPassportFormData] = useState({
        passport_number: '',
        passport_country: '',
        passport_issue_date: '',
        passport_expiry_date: '',
        passport_issue_city: '',
        has_previous_passport: false,
        previous_passport_number: ''
    });

    const [i94FormData, setI94FormData] = useState({
        i94_number: '',
        i94_admission_date: '',
        i94_expiry_date: '',
        i94_admission_class: '',
        port_of_entry: '',
        i94_is_duration_of_status: false
    });

    const [visaStampFormData, setVisaStampFormData] = useState({
        has_valid_visa_stamp: false,
        visa_stamp_issue_date: '',
        visa_stamp_expiry_date: '',
        visa_stamp_consulate: '',
        visa_stamp_entries: '',
        visa_stamp_annotation: '',
        needs_visa_stamping: false,
        visa_stamping_notes: ''
    });

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);


    const [editFormData, setEditFormData] = useState({
        docType: '',
        description: '',
        validFrom: '',
        expiryDate: '',
        visibleToEmployee: true
    });
    const [renameFileName, setRenameFileName] = useState('');
    useEffect(() => {
        if (immigrationData?.data?.immigration) {
            const imm = immigrationData.data.immigration;
            setPassportFormData({
                passport_number: imm.passport_number || '',
                passport_country: imm.passport_country || '',
                passport_issue_date: imm.passport_issue_date || '',
                passport_expiry_date: imm.passport_expiry_date || '',
                passport_issue_city: imm.passport_issue_city || '',
                has_previous_passport: imm.has_previous_passport || false,
                previous_passport_number: imm.previous_passport_number || ''
            });

            setI94FormData({
                i94_number: imm.i94_number || '',
                i94_admission_date: imm.i94_admission_date || '',
                i94_expiry_date: imm.i94_expiry_date || '',
                i94_admission_class: imm.i94_admission_class || '',
                port_of_entry: imm.port_of_entry || '',
                i94_is_duration_of_status: imm.i94_is_duration_of_status || false
            });

            setVisaStampFormData({
                has_valid_visa_stamp: imm.has_valid_visa_stamp || false,
                visa_stamp_issue_date: imm.visa_stamp_issue_date || '',
                visa_stamp_expiry_date: imm.visa_stamp_expiry_date || '',
                visa_stamp_consulate: imm.visa_stamp_consulate || '',
                visa_stamp_entries: imm.visa_stamp_entries || '',
                visa_stamp_annotation: imm.visa_stamp_annotation || '',
                needs_visa_stamping: imm.needs_visa_stamping || false,
                visa_stamping_notes: imm.visa_stamping_notes || ''
            });
        }
    }, [immigrationData]);


    const immigration = immigrationData?.data?.immigration || {};

    // Document type configuration - FIXED STRUCTURE
    const uploadComponentText = {
        passport: {
            name: "Passport",
            sub_heading: "Upload a Passport for AI-powered data extraction",
            uploadBox: "Upload Passport document",
            aiText: "Extracting Passport fields",
            file_type: "passport",
            entry_type: "Passport Entry"
        },
        i94: {
            name: "I-94 Record",
            sub_heading: "Upload an I-94 Record for AI-powered data extraction",
            uploadBox: "Upload I-94 Record document",
            aiText: "Extracting I-94 fields",
            file_type: "i94",
            entry_type: "I-94 Entry"
        },
        visa_stamp: {
            name: "Visa Stamp",
            sub_heading: "Upload a Visa Stamp for AI-powered data extraction",
            uploadBox: "Upload Visa Stamp document",
            aiText: "Extracting Visa Stamp fields",
            file_type: "visa_stamp",
            entry_type: "Visa Stamp Entry"
        }
    };

    // Get current document config
    const currentDocConfig = uploadComponentText[documentType];

    // Helper function to format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Helper function to determine document status
    const getDocumentStatus = (expiryDate) => {
        if (!expiryDate) return { status: "Unknown", variant: "secondary" };
        const expiry = new Date(expiryDate);
        const today = new Date();

        if (expiry < today) {
            return { status: "Expired", variant: "destructive" };
        } else if ((expiry - today) / (1000 * 60 * 60 * 24) <= 90) {
            return { status: "Expiring Soon", variant: "warning" };
        } else {
            return { status: "Valid", variant: "default" };
        }
    };

    // Toggle section
    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Field component for consistent styling
    const DataField = ({ label, value }) => (
        <div className="space-y-1">
            <dt className="text-xs font-medium text-[#67677e] uppercase tracking-wide">
                {label}
            </dt>
            <dd className="text-sm text-[#080118]">{value || "N/A"}</dd>
        </div>
    );

    // Badge component
    const CustomBadge = ({ variant, children, className = "" }) => {
        const variantStyles = {
            destructive: "border-transparent bg-red-500 text-white text-destructive-foreground hover:bg-red-500",
            warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
            default: "border-transparent bg-primary text-white hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-white hover:bg-secondary/80"
        };

        return (
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles[variant]} ${className}`}>
                {children}
            </div>
        );
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Handle file selection
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error("Only PDF, JPG, and PNG files are allowed");
            return;
        }

        setSelectedFile(file);
        await handleUpload(file);
    };

    // Handle file upload and parsing
    const handleUpload = async (file) => {
        try {
            setShowUploadDialog(false);
            setShowAnalyzingDialog(true);

            const fileBase64 = await fileToBase64(file);

            // Extract file extension
            const fileExtension = file.name.split('.').pop().toLowerCase();
            // Map file type
            let fileType = fileExtension;
            if (fileExtension === 'jpeg') {
                fileType = 'jpg';
            }

            const payload = {
                emailid: "marketing@4spheresolutions.com",
                task: "parse-immigration-document",
                employee_email: candidateDetails?.original_email.fsdsd || "muni.k0892@gmail.com", // FIXED: removed .sdsd
                candidate_id: candidateDetails?.id || 1,
                doc_type: documentType, // DYNAMIC: uses current documentType
                file_name: file.name,
                file_type: fileType,
                file_base64: fileBase64,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(
                "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/parse-document",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success) {
                setExtractedData(data.data);
                setShowAnalyzingDialog(false);
                setShowReviewSheet(true);
            } else {
                throw new Error(data.message || "Failed to parse document");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload document");
            setShowAnalyzingDialog(false);
        }
    };

    // Handle save to profile
    const handleSaveToProfile = async () => {
        try {
            setIsSaving(true);

            const fileBase64 = await fileToBase64(selectedFile);

            // Extract file extension
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            let fileType = fileExtension;
            if (fileExtension === 'jpeg') {
                fileType = 'jpg';
            }

            const payload = {
                task: "save-immigration-info",
                emailid: "marketing@4spheresolutions.com",
                employee_email: candidateDetails?.original_email.sdd || extractedData?.candidate?.original_email.adadad || "muni.k0892@gmail.com",
                data: {
                    passport_number: extractedData?.extracted_data?.passport_number,
                    passport_country: extractedData?.extracted_data?.country_code,
                    passport_issue_date: extractedData?.extracted_data?.issue_date,
                    passport_expiry_date: extractedData?.extracted_data?.expiry_date,
                    passport_issue_city: extractedData?.extracted_data?.issue_place,
                },
                doc_type: documentType, // DYNAMIC: uses current documentType
                file_name: selectedFile.name,
                file_type: fileType,
                file_base64: fileBase64,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(
                "https://candidates-immigration-management-api-v1-305451280005.us-east1.run.app/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || "Immigration record updated successfully");
                setShowReviewSheet(false);
                setSelectedFile(null);
                setExtractedData(null);
            } else {
                throw new Error(data.message || "Failed to save document");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save immigration data");
        } finally {
            setIsSaving(false);
            getImmigrationInfo();
        }
    };

    // Get passport documents
    const passportDocs = immigrationData?.data?.documents?.filter(
        doc => doc.immigration_doc_type === "passport"
    ) || [];

    // Get I-94 documents
    const i94Docs = immigrationData?.data?.documents?.filter(
        doc => doc.immigration_doc_type === "i94"
    ) || [];

    // Get visa stamp documents
    const visaStampDocs = immigrationData?.data?.documents?.filter(
        doc => doc.immigration_doc_type === "visa_stamp"
    ) || [];

    const passportStatus = getDocumentStatus(immigration.passport_expiry_date);
    const i94Status = getDocumentStatus(immigration.i94_expiry_date);
    const visaStampStatus = getDocumentStatus(immigration.visa_stamp_expiry_date);
    const handleViewDocument = async (doc) => {
        try {
            const payload = {
                email_id: candidateDetails?.original_email || "muni.k0892@gmail.com",
                emailid: "marketing@4spheresolutions.com",
                task: "download_files",
                file_name: [doc.file_name]
            };

            const response = await fetch(
                "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success && data.files && data.files.length > 0) {
                const fileData = data.files[0];
                const base64 = fileData.file_base64;

                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                window.open(blobUrl, '_blank');
            } else {
                throw new Error("Failed to retrieve document");
            }
        } catch (error) {
            console.error("View error:", error);
            toast.error("Failed to view document");
        }
        setShowDropdownMenu(null);
    };

    const handleDownloadDocument = async (doc) => {
        try {
            const payload = {
                email_id: candidateDetails?.original_email || "muni.k0892@gmail.com",
                emailid: "marketing@4spheresolutions.com",
                task: "download_files",
                file_name: [doc.file_name]
            };

            const response = await fetch(
                "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success && data.files && data.files.length > 0) {
                const fileData = data.files[0];
                const base64 = fileData.file_base64;

                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${base64}`;
                link.download = doc.file_name;
                link.click();

                toast.success("Document downloaded successfully");
            } else {
                throw new Error("Failed to download document");
            }
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download document");
        }
        setShowDropdownMenu(null);
    };

    const handleEditDocument = (doc) => {
        setSelectedDocument(doc);
        setEditFormData({
            docType: doc.immigration_doc_type || 'passport',
            description: doc.file_name || '',
            validFrom: doc.doc_issue_date || '',
            expiryDate: doc.doc_expiry || '',
            visibleToEmployee: true
        });
        setShowEditModal(true);
        setShowDropdownMenu(null);
    };

    const handleRenameDocument = (doc) => {
        setSelectedDocument(doc);
        const fileNameWithoutExt = doc.file_name.substring(0, doc.file_name.lastIndexOf('.'));
        setRenameFileName(fileNameWithoutExt);
        setShowRenameModal(true);
        setShowDropdownMenu(null);
    };

    const handleDeleteDocument = async (doc) => {
        if (!window.confirm(`Are you sure you want to delete "${doc.file_name}"?`)) {
            return;
        }

        try {
            const payload = {
                email_id: candidateDetails?.original_email || "muni.k0892@gmail.com",
                emailid: "marketing@4spheresolutions.com",
                task: "delete_files",
                file_name: [doc.file_name]
            };

            const response = await fetch(
                "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Document deleted successfully");
                getImmigrationInfo();
            } else {
                throw new Error(data.message || "Failed to delete document");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete document");
        }
        setShowDropdownMenu(null);
    };

    const handleSaveEdit = async () => {
        toast.success("Document updated successfully");
        setShowEditModal(false);
        getImmigrationInfo();
    };

    const handleSaveRename = async () => {
        try {
            const fileExtension = selectedDocument.file_name.split('.').pop();
            const newFileName = `${renameFileName}.${fileExtension}`;

            const payload = {
                email_id: candidateDetails?.original_email || "muni.k0892@gmail.com",
                emailid: "marketing@4spheresolutions.com",
                task: "rename",
                row_id: selectedDocument.id || 0,
                old_file_name: selectedDocument.file_name,
                new_file_name: newFileName
            };

            const response = await fetch(
                "https://us-east1-recruiterportal.cloudfunctions.net/documents_delete-retrieve_determine_type_v3",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Document renamed successfully");
                setShowRenameModal(false);
                getImmigrationInfo();
            } else {
                throw new Error(data.message || "Failed to rename document");
            }
        } catch (error) {
            console.error("Rename error:", error);
            toast.error("Failed to rename document");
        }
    };



    // ADD THIS INPUT FIELD COMPONENT HERE 👇
    const InputField = ({ label, value, onChange, type = "text", placeholder = "", required = false }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            <input
                type={type}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );


    return (
        <div>
                <div className="space-y-4 Interfont">
                    <div className="space-y-4" data-orientation="vertical">

                        {/* Passport Information Section */}
                        <div data-state={openSections.passport ? "open" : "closed"} data-orientation="vertical" className="border rounded-xl px-4">
                            <h3 data-orientation="vertical" data-state={openSections.passport ? "open" : "closed"} className="flex">
                                <button
                                    type="button"
                                    aria-expanded={openSections.passport}
                                    data-state={openSections.passport ? "open" : "closed"}
                                    data-orientation="vertical"
                                    onClick={() => toggleSection('passport')}
                                    className="flex flex-1 items-center justify-between py-[16px] bg-[white] font-medium transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline"
                                >
                                    <div className="flex items-center justify-between w-full pr-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-base text-[#080118]">Passport Information</span>
                                            <button
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors hover:!bg-[#4f82ee] hover:!text-white bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0  rounded-xl h-7 w-7 p-0 text-[#67677e]"
                                                data-state="closed"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <button
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white hover:!bg-[#4f82ee] hover:!text-white rounded-xl px-[12px] h-7 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadDialog(true);
                                                setDocumentType("passport");
                                            }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                                            Smart Upload
                                        </button>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </button>
                            </h3>

                            {openSections.passport && (
                                <div
                                    data-state="open"
                                    role="region"
                                    data-orientation="vertical"
                                    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                                >
                                    <div className="pb-4 pt-0">
                                        {isEditMode ? (
                                            // EDIT MODE - Show input fields
                                            <div className="grid grid-cols-2 md:grid-cols-4 !gap-4 pt-2 pb-4">
                                                <InputField
                                                    label="Passport Number"
                                                    value={passportFormData.passport_number}
                                                    onChange={(val) => setPassportFormData({ ...passportFormData, passport_number: val })}
                                                    placeholder="Enter passport number"
                                                    required
                                                />

                                                {/* Issuing Country Dropdown */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Issuing Country<span className="text-destructive ml-0.5">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            role="combobox"
                                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                                        >
                                                            <span style={{ pointerEvents: 'none' }}>
                                                                {passportFormData.passport_country || 'Select country'}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </button>
                                                        {showCountryDropdown && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                                                                <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-md border bg-white p-1 shadow-md max-h-[200px] overflow-y-auto">
                                                                    {['India', 'United States', 'China', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'].map(country => (
                                                                        <div
                                                                            key={country}
                                                                            onClick={() => {
                                                                                setPassportFormData({ ...passportFormData, passport_country: country });
                                                                                setShowCountryDropdown(false);
                                                                            }}
                                                                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-[#3c83f6] hover:text-white transition-colors"
                                                                        >
                                                                            {country}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <InputField
                                                    label="Issue Date"
                                                    type="date"
                                                    value={passportFormData.passport_issue_date}
                                                    onChange={(val) => setPassportFormData({ ...passportFormData, passport_issue_date: val })}
                                                />

                                                <InputField
                                                    label="Expiry Date"
                                                    type="date"
                                                    value={passportFormData.passport_expiry_date}
                                                    onChange={(val) => setPassportFormData({ ...passportFormData, passport_expiry_date: val })}
                                                    required
                                                />

                                                <InputField
                                                    label="Issue City"
                                                    value={passportFormData.passport_issue_city}
                                                    onChange={(val) => setPassportFormData({ ...passportFormData, passport_issue_city: val })}
                                                    placeholder="Enter issue city"
                                                />

                                                {/* Has Previous Passport Switch */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Previous Passport
                                                    </label>
                                                    <div className="flex items-center h-9 gap-2">
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={passportFormData.has_previous_passport}
                                                            data-state={passportFormData.has_previous_passport ? "checked" : "unchecked"}
                                                            onClick={() => setPassportFormData({ ...passportFormData, has_previous_passport: !passportFormData.has_previous_passport })}
                                                            className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!bg-[#7c3bed] data-[state=unchecked]:bg-input"
                                                        >
                                                            <span
                                                                data-state={passportFormData.has_previous_passport ? "checked" : "unchecked"}
                                                                className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                                                            />
                                                        </button>
                                                        <label className="text-sm">Has previous passport</label>
                                                    </div>
                                                </div>
                                                {passportFormData.has_previous_passport && (<>
                                                    <InputField
                                                        label="Previous Passport Number"
                                                        value={passportFormData.previous_passport_number}
                                                        onChange={(val) => setPassportFormData({ ...passportFormData, previous_passport_number: val })}
                                                        placeholder="Enter previous passport number"
                                                    />
                                                </>)}
                                            </div>
                                        ) : (
                                            // VIEW MODE - Show read-only data
                                            <div className="grid grid-cols-2 md:grid-cols-4 !gap-4 pt-2 pb-4">
                                                <DataField label="Passport Number" value={immigration.passport_number} />
                                                <DataField label="Issuing Country" value={immigration.passport_country} />
                                                <DataField label="Issue Date" value={formatDate(immigration.passport_issue_date)} />
                                                <DataField label="Expiry Date" value={formatDate(immigration.passport_expiry_date)} />
                                                <DataField label="Issue City" value={immigration.passport_issue_city} />
                                                <DataField label="Has Previous Passport" value={immigration.has_previous_passport ? "Yes" : "No"} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* I-94 Information Section */}
                        <div data-state={openSections.i94 ? "open" : "closed"} data-orientation="vertical" className="border rounded-xl px-4">
                            <h3 data-orientation="vertical" data-state={openSections.i94 ? "open" : "closed"} className="flex">
                                <button
                                    type="button"
                                    aria-expanded={openSections.i94}
                                    data-state={openSections.i94 ? "open" : "closed"}
                                    data-orientation="vertical"
                                    onClick={() => toggleSection('i94')}
                                    className="flex flex-1 items-center justify-between py-[16px] bg-[white] font-medium transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline"
                                >
                                    <div className="flex items-center justify-between w-full pr-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-base text-[#080118]">I-94 Information</span>
                                            <button
                                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors hover:!bg-[#4f82ee] hover:!text-white bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0  rounded-xl h-7 w-7 p-0 ${i94Status.status === "Expired" ? "text-destructive" : "text-[#67677e]"
                                                    }`}
                                                data-state="closed"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>
                                            <CustomBadge variant={i94Status.variant} className="text-xs">
                                                {i94Status.status}
                                            </CustomBadge>
                                            {i94FormData.i94_is_duration_of_status && (<>

                                                <CustomBadge variant={""} className="text-xs">
                                                    D/S
                                                </CustomBadge>
                                            </>)}
                                        </div>
                                        <button
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white hover:!bg-[#4f82ee] hover:!text-white rounded-xl px-[12px] h-7 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadDialog(true);
                                                setDocumentType("i94");
                                            }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                                            Smart Upload
                                        </button>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </button>
                            </h3>

                            {openSections.i94 && (
                                <div
                                    data-state="open"
                                    role="region"
                                    data-orientation="vertical"
                                    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                                >
                                    <div className="pb-4 pt-0">
                                        {isEditMode ? (
                                            // EDIT MODE
                                            <div className="grid grid-cols-2 md:grid-cols-4 !gap-4 pt-2 pb-4">
                                                <InputField
                                                    label="I-94 Number"
                                                    value={i94FormData.i94_number}
                                                    onChange={(val) => setI94FormData({ ...i94FormData, i94_number: val })}
                                                    placeholder="Enter I-94 number"
                                                />
                                                <InputField
                                                    label="Admission Date"
                                                    type="date"
                                                    value={i94FormData.i94_admission_date}
                                                    onChange={(val) => setI94FormData({ ...i94FormData, i94_admission_date: val })}
                                                />
                                                {!i94FormData.i94_is_duration_of_status && (<>
                                                    <InputField
                                                        label="Expiry Date"
                                                        type="date"
                                                        value={i94FormData.i94_expiry_date}
                                                        onChange={(val) => setI94FormData({ ...i94FormData, i94_expiry_date: val })}
                                                    />
                                                </>)}
                                                <InputField
                                                    label="Admission Class"
                                                    value={i94FormData.i94_admission_class}
                                                    onChange={(val) => setI94FormData({ ...i94FormData, i94_admission_class: val })}
                                                    placeholder="e.g., H-1B"
                                                />
                                                <InputField
                                                    label="Port of Entry"
                                                    value={i94FormData.port_of_entry}
                                                    onChange={(val) => setI94FormData({ ...i94FormData, port_of_entry: val })}
                                                    placeholder="Enter port of entry"
                                                />

                                                {/* Duration of Status Switch */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Duration of Status
                                                    </label>
                                                    <div className="flex items-center h-9 gap-2">
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={i94FormData.i94_is_duration_of_status}
                                                            data-state={i94FormData.i94_is_duration_of_status ? "checked" : "unchecked"}
                                                            onClick={() => setI94FormData({ ...i94FormData, i94_is_duration_of_status: !i94FormData.i94_is_duration_of_status })}
                                                            className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!bg-[#7c3bed] data-[state=unchecked]:bg-input"
                                                        >
                                                            <span
                                                                data-state={i94FormData.i94_is_duration_of_status ? "checked" : "unchecked"}
                                                                className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                                                            />
                                                        </button>
                                                        <label className="text-sm">D/S (Duration of Status)</label>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // VIEW MODE
                                            <div className="grid grid-cols-2 md:grid-cols-4 !gap-4 pt-2 pb-4">
                                                <DataField label="I-94 Number" value={immigration.i94_number} />
                                                <DataField label="Admission Date" value={formatDate(immigration.i94_admission_date)} />
                                                <DataField label="Expiry Date" value={formatDate(immigration.i94_expiry_date)} />
                                                <DataField label="Admission Class" value={immigration.i94_admission_class} />
                                                <DataField label="Port of Entry" value={immigration.port_of_entry || "—"} />
                                                <DataField label="Duration of Status" value={immigration.i94_is_duration_of_status ? "Yes" : "No"} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Visa Stamp Information Section */}
                        <div data-state={openSections.visaStamp ? "open" : "closed"} data-orientation="vertical" className="border rounded-xl px-4">
                            <h3 data-orientation="vertical" data-state={openSections.visaStamp ? "open" : "closed"} className="flex">
                                <button
                                    type="button"
                                    aria-expanded={openSections.visaStamp}
                                    data-state={openSections.visaStamp ? "open" : "closed"}
                                    data-orientation="vertical"
                                    onClick={() => toggleSection('visaStamp')}
                                    className="flex flex-1 items-center justify-between py-[16px] bg-[white] font-medium transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline"
                                >
                                    <div className="flex items-center justify-between w-full pr-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-base text-[#080118]">Visa Stamp Information</span>
                                        </div>
                                        <button
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white hover:!bg-[#4f82ee] hover:!text-white rounded-xl px-[12px] h-7 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadDialog(true);
                                                setDocumentType("visa_stamp");
                                            }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                                            Smart Upload
                                        </button>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </button>
                            </h3>

                            {openSections.visaStamp && (
                                <div
                                    data-state="open"
                                    role="region"
                                    data-orientation="vertical"
                                    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                                >
                                    <div className="pb-4 pt-0">
                                        {isEditMode ? (
                                            // EDIT MODE
                                            <div className="space-y-4 pt-2 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={visaStampFormData.has_valid_visa_stamp}
                                                        data-state={visaStampFormData.has_valid_visa_stamp ? "checked" : "unchecked"}
                                                        onClick={() => setVisaStampFormData({ ...visaStampFormData, has_valid_visa_stamp: !visaStampFormData.has_valid_visa_stamp })}
                                                        className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#7c3bed] data-[state=unchecked]:bg-input"
                                                    >
                                                        <span
                                                            data-state={visaStampFormData.has_valid_visa_stamp ? "checked" : "unchecked"}
                                                            className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                                                        />
                                                    </button>
                                                    <label className="text-sm font-medium">Has Valid Visa Stamp</label>
                                                </div>
                                                {visaStampFormData.has_valid_visa_stamp && (<>


                                                    <div className="grid grid-cols-2 md:grid-cols-4 !gap-4">
                                                        <InputField
                                                            label="Issue Date"
                                                            type="date"
                                                            value={visaStampFormData.visa_stamp_issue_date}
                                                            onChange={(val) => setVisaStampFormData({ ...visaStampFormData, visa_stamp_issue_date: val })}
                                                        />
                                                        <InputField
                                                            label="Expiry Date"
                                                            type="date"
                                                            value={visaStampFormData.visa_stamp_expiry_date}
                                                            onChange={(val) => setVisaStampFormData({ ...visaStampFormData, visa_stamp_expiry_date: val })}
                                                        />
                                                        <InputField
                                                            label="Consulate"
                                                            value={visaStampFormData.visa_stamp_consulate}
                                                            onChange={(val) => setVisaStampFormData({ ...visaStampFormData, visa_stamp_consulate: val })}
                                                            placeholder="e.g., Chennai, India"
                                                        />
                                                        <InputField
                                                            label="Entries"
                                                            value={visaStampFormData.visa_stamp_entries}
                                                            onChange={(val) => setVisaStampFormData({ ...visaStampFormData, visa_stamp_entries: val })}
                                                            placeholder="e.g., Multiple"
                                                        />
                                                        <div className="col-span-2 md:col-span-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                    Annotation
                                                                </label>
                                                                <textarea
                                                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    placeholder="Enter visa stamp annotation"
                                                                    value={visaStampFormData.visa_stamp_annotation}
                                                                    onChange={(e) => setVisaStampFormData({ ...visaStampFormData, visa_stamp_annotation: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>)}

                                                <div className="border-t-[1px] border-l-[0px] border-b-[0px] border-r-[0px] border-solid border-[#e7e7ef] pt-4 space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={visaStampFormData.needs_visa_stamping}
                                                            data-state={visaStampFormData.needs_visa_stamping ? "checked" : "unchecked"}
                                                            value="on"
                                                            onClick={() => setVisaStampFormData({ ...visaStampFormData, needs_visa_stamping: !visaStampFormData.needs_visa_stamping })}
                                                            className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#7c3bed] data-[state=unchecked]:bg-input"
                                                        >
                                                            <span
                                                                data-state={visaStampFormData.needs_visa_stamping ? "checked" : "unchecked"}
                                                                className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                                                            />
                                                        </button>
                                                        <label className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            Needs Visa Stamping
                                                        </label>
                                                    </div>

                                                    {/* Stamping Notes - Only show when needs_visa_stamping is true */}
                                                    {visaStampFormData.needs_visa_stamping && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                Stamping Notes
                                                            </label>
                                                            <textarea
                                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                placeholder="Dropbox eligibility, 221g history, etc."
                                                                value={visaStampFormData.visa_stamping_notes}
                                                                onChange={(e) => setVisaStampFormData({ ...visaStampFormData, visa_stamping_notes: e.target.value })}
                                                                rows="3"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        ) : (
                                            // VIEW MODE
                                            <div className="space-y-4 pt-2 pb-2">
                                                <DataField label="Has Valid Visa Stamp" value={immigration.has_valid_visa_stamp ? "Yes" : "No"} />
                                                <div className="grid grid-cols-2 md:grid-cols-4 !gap-4">
                                                    <DataField label="Issue Date" value={formatDate(immigration.visa_stamp_issue_date)} />
                                                    <DataField label="Expiry Date" value={formatDate(immigration.visa_stamp_expiry_date)} />
                                                    <DataField label="Consulate" value={immigration.visa_stamp_consulate} />
                                                    <DataField label="Entries" value={immigration.visa_stamp_entries === "M" ? "Multiple" : immigration.visa_stamp_entries} />
                                                    <div className="col-span-2 md:col-span-4">
                                                        <DataField label="Annotation" value={immigration.visa_stamp_annotation} />
                                                    </div>
                                                </div>
                                                <div className="border-t pt-4">
                                                    <DataField label="Needs Visa Stamping" value={immigration.needs_visa_stamping ? "Yes" : "No"} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Documents List Section */}
                    <div className="mt-4">
                        <div className="space-y-4">
                            <div className="rounded-xl border overflow-x-auto">
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 border-[#e7e6ee] data-[state=selected]:bg-muted">
                                                <th className="h-12 !px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                                                    Document
                                                </th>
                                                <th className="h-12 !px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                                                    Type
                                                </th>
                                                <th className="h-12 !px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0">
                                                    Expiry
                                                </th>
                                                <th className="h-12 !px-4 text-left align-middle font-medium text-[#67677e] [&:has([role=checkbox])]:pr-0 w-[100px]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {[...passportDocs, ...i94Docs, ...visaStampDocs].map((doc, idx) => {
                                                const docStatus = getDocumentStatus(doc.doc_expiry);
                                                const docType = doc.immigration_doc_type === "passport"
                                                    ? "Passport"
                                                    : doc.immigration_doc_type === "i94"
                                                        ? "I-94"
                                                        : "Visa Stamp";

                                                return (
                                                    <tr key={idx} className="border-b transition-colors hover:bg-muted/50 border-[#e7e6ee] data-[state=selected]:bg-muted">
                                                        <td className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-[#67677e] flex-shrink-0" />
                                                                <span className="font-medium truncate text-[#080118] h-[16px] max-w-[200px]">{doc.file_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0">
                                                            <span className="text-sm">{docType}</span>
                                                        </td>
                                                        <td className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm ${docStatus.status === "Expired" ? "text-destructive font-medium" : ""}`}>
                                                                    {formatDate(doc.doc_expiry)}
                                                                </span>
                                                                {docStatus.status === "Expired" && (
                                                                    <CustomBadge variant="destructive">
                                                                        Expired
                                                                    </CustomBadge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0">
                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowDropdownMenu(showDropdownMenu === idx ? null : idx)}
                                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors hover:!bg-[#4f82ee] hover:!text-white bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0  rounded-xl h-8 w-8 p-0"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>

                                                                {/* Dropdown Menu */}
                                                                {showDropdownMenu === idx && (
                                                                    <>
                                                                        <div
                                                                            className="fixed inset-0 z-40"
                                                                            onClick={() => setShowDropdownMenu(null)}
                                                                        />
                                                                        <div className="absolute right-0 top-10 z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-white p-1 text-popover-foreground shadow-md">
                                                                            <div
                                                                                onClick={() => handleViewDocument(doc)}
                                                                                className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors  hover:bg-[#3c83f6] hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                View
                                                                            </div>
                                                                            <div
                                                                                onClick={() => handleDownloadDocument(doc)}
                                                                                className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors  hover:bg-[#3c83f6] hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                                            >
                                                                                <Download className="h-4 w-4 mr-2" />
                                                                                Download
                                                                            </div>
                                                                            <div
                                                                                onClick={() => handleEditDocument(doc)}
                                                                                className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors  hover:bg-[#3c83f6] hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                                            >
                                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                                Edit
                                                                            </div>
                                                                            <div
                                                                                onClick={() => handleRenameDocument(doc)}
                                                                                className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors  hover:bg-[#3c83f6] hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                                            >
                                                                                <FileEdit className="h-4 w-4 mr-2" />
                                                                                Rename
                                                                            </div>
                                                                            <div
                                                                                onClick={() => handleDeleteDocument(doc)}
                                                                                className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors text-red-500 hover:bg-[#3c83f6] hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Delete
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>

                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Upload Dialog */}
            {showUploadDialog && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowUploadDialog(false)} />
                    <div
                        role="dialog"
                        className="fixed left-[50%] top-[50%] z-50 grid grid-cols-1 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] !gap-4 border bg-white p-6 shadow-lg sm:rounded-xl"
                    >
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[#743fe4]" />
                                Smart Upload {currentDocConfig.name}
                            </h2>
                            <p className="text-sm text-muted-foreground text-left">
                                {currentDocConfig.sub_heading}
                            </p>
                        </div>

                        <div className="py-6 space-y-4">
                            <label
                                htmlFor="file-upload"
                                className="border-2 border-dashed border-[#e7e6ee] rounded-lg p-8 text-center cursor-pointer hover:!border-[#b99ff1] transition-colors block"
                            >
                                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">{currentDocConfig.uploadBox}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PDF, JPG, PNG (max 10MB)
                                </p>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            <div role="alert" className="relative w-full rounded-xl border p-[16px] !border-[#ded1f9] !bg-[#f8f5fd]">
                                <Sparkles className="h-4 w-4 text-primary absolute left-4 top-[19px] !text-[#020118]" />
                                <div className="pl-7 text-sm font-semibold">
                                    AI will automatically extract data and save to the database.
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowUploadDialog(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 bg-[#fff]"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </>
            )}

            {/* Analyzing Dialog */}
            {showAnalyzingDialog && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50" />
                    <div
                        role="dialog"
                        className="fixed left-[50%] top-[50%] z-50 grid grid-cols-1 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] !gap-4 border bg-white p-6 shadow-lg sm:rounded-xl"
                    >
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[#743fe4]" />
                                Smart Upload {currentDocConfig.name}
                            </h2>
                            <p className="text-sm text-muted-foreground text-left">
                                {currentDocConfig.sub_heading}
                            </p>
                        </div>

                        <div className="py-8 pb-2 space-y-4">
                            <div className="flex flex-col items-center !gap-4">
                                <div className="relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-[#743fe4]" />
                                    <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">AI is analyzing your document...</p>
                                    <p className="text-sm text-muted-foreground">{currentDocConfig.aiText}</p>
                                </div>
                            </div>

                            <div className="relative h-4 overflow-hidden rounded-full bg-[#eee] w-full">
                                <div className="h-full w-full flex-1 bg-[#743fe4] transition-all animate-pulse" style={{ transform: 'translateX(-10%)', width: "70%" }} />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAnalyzingDialog(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 bg-[#fff]"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </>
            )}

            {/* Review Sheet */}
            {showReviewSheet && extractedData && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowReviewSheet(false)} />
                    <div
                        role="dialog"
                        className="fixed z-50 !gap-4 bg-white shadow-lg transition ease-in-out inset-y-0 right-0 h-full border-l w-[500px] sm:w-[540px] sm:max-w-lg p-0 flex flex-col"
                    >
                        <div className="bg-gradient-to-r from-[#f1ebfc] via-[#f1ebfc] to-transparent p-6 border-b">
                            <div className="flex flex-col text-center sm:text-left space-y-3">
                                <div className="flex items-center !gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#e5dbf9] flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-[#743fe4]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-foreground text-lg text-left text-[#080118]">AI Document Review</h2>
                                        <p className="text-muted-foreground text-xs text-left">Review extracted data before saving</p>
                                    </div>
                                </div>

                                <div className="flex items-center !gap-2 flex-wrap">
                                    <div className="inline-flex items-center rounded-lg border text-xs font-semibold bg-gray text-secondary-foreground gap-1 px-3 py-1">
                                        <FileCheck className="h-3.5 w-3.5" />
                                        {currentDocConfig.file_type.toUpperCase()}
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    <div className="inline-flex items-center rounded-lg border text-xs font-semibold gap-1 px-3 py-1">
                                        <Shield className="h-3.5 w-3.5" />
                                        {currentDocConfig.entry_type}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center !gap-4 px-6 py-3 bg-muted/50 border-b text-sm">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-muted-foreground">13 verified</span>
                            </div>
                        </div>

                        <div className="flex-1 px-6 overflow-y-auto">
                            <div className="py-1 space-y-6">
                                <div className="space-y-3">
                                    {/* Country */}
                                    <div className="group relative rounded-xl border p-[16px] border-green-500/30 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium flex items-center gap-2">Country</label>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                95%
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                className="flex w-full rounded-lg border px-3 py-2 h-9 text-sm bg-[#fff] border-input/50"
                                                value={extractedData?.extracted_data?.country || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Passport Number */}
                                    <div className="group relative rounded-xl border p-[16px] border-green-500/30 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium flex items-center gap-2">Passport Number</label>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                95%
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                className="flex w-full rounded-lg border px-3 py-2 h-9 text-sm bg-[#fff] border-input/50"
                                                value={extractedData?.extracted_data?.passport_number || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Issue Date */}
                                    <div className="group relative rounded-xl border p-[16px] border-green-500/30 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium flex items-center gap-2">Issue Date</label>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                95%
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                className="flex w-full rounded-lg border px-3 py-2 h-9 text-sm bg-[#fff] border-input/50"
                                                value={extractedData?.extracted_data?.issue_date || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Expiry Date */}
                                    <div className="group relative rounded-xl border p-[16px] border-green-500/30 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium flex items-center gap-2">Expiry Date</label>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                95%
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                className="flex w-full rounded-lg border px-3 py-2 h-9 text-sm bg-[#fff] border-input/50"
                                                value={extractedData?.extracted_data?.expiry_date || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Issue Place */}
                                    <div className="group relative rounded-xl border p-[16px] border-green-500/30 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium flex items-center gap-2">Issue City</label>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                95%
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                className="flex w-full rounded-lg border px-3 py-2 h-9 text-sm bg-[#fff] border-input/50"
                                                value={extractedData?.extracted_data?.issue_place || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border" />

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 bg-muted/20">
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowReviewSheet(false)}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveToProfile}
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium bg-[#7c3bed] text-white hover:bg-[#7c3bed] h-10 px-4 py-2 flex-1 gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
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
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowReviewSheet(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 bg-[#fff]"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </>
            )}

            {/* Edit Document Modal */}
            {showEditModal && selectedDocument && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowEditModal(false)} />
                    <div
                        role="dialog"
                        className="fixed left-[50%] top-[50%] z-50 grid grid-cols-1 w-full max-w-[448px] translate-x-[-50%] translate-y-[-50%] !gap-3 border bg-[#fff] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl sm:rounded-xl"
                    >
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-lg font-semibold text-[#080118] leading-none tracking-tight flex items-center gap-2">
                                <Pencil className="h-5 w-5" />
                                Edit Document
                            </h2>
                            <p className="text-sm text-[#67677e] text-left mt-2">
                                Update document metadata for "{selectedDocument.file_name}"
                            </p>
                        </div>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Document Type</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        role="combobox"
                                        onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
                                        className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-[#67677e] text-[#080118] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                    >
                                        <span style={{ pointerEvents: 'none' }}>
                                            {editFormData.docType === 'passport' && 'Passport'}
                                            {editFormData.docType === 'passport_bio_page' && 'Passport Bio Page'}
                                            {editFormData.docType === 'old_expired_passport' && 'Old/Expired Passport'}
                                            {editFormData.docType === 'i94' && 'I-94 (Current)'}
                                            {editFormData.docType === 'i94_travel_history' && 'I-94 Travel History'}
                                            {editFormData.docType === 'entry_stamp' && 'Entry Stamp'}
                                            {editFormData.docType === 'cbp_admission_record' && 'CBP Admission Record'}
                                            {editFormData.docType === 'travel_itinerary' && 'Travel Itinerary'}
                                            {editFormData.docType === 'supporting_document' && 'Supporting Document'}
                                            {editFormData.docType === 'other' && 'Other'}
                                            {!editFormData.docType && 'Select document type'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </button>

                                    {/* Document Type Dropdown */}
                                    {showDocTypeDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowDocTypeDropdown(false)}
                                            />
                                            <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-xl border bg-white p-1 text-popover-foreground shadow-md max-h-[300px] overflow-y-auto">
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'passport' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Passport
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'passport_bio_page' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Passport Bio Page
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'old_expired_passport' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Old/Expired Passport
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'i94' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    I-94 (Current)
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'i94_travel_history' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    I-94 Travel History
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'entry_stamp' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Entry Stamp
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'cbp_admission_record' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    CBP Admission Record
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'travel_itinerary' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Travel Itinerary
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'supporting_document' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Supporting Document
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setEditFormData({ ...editFormData, docType: 'other' });
                                                        setShowDocTypeDropdown(false);
                                                    }}
                                                    className="relative flex cursor-default select-none items-center rounded-xl px-3 py-2 hover:bg-[#3c83f6] hover:text-white text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    Other
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-[#080118] ring-offset-background placeholder:text-[#67677e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter document description..."
                                    rows="2"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed  peer-disabled:opacity-70">Valid From</label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-base text-[#080118] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#67677e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={editFormData.validFrom}
                                    onChange={(e) => setEditFormData({ ...editFormData, validFrom: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Expiry Date</label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-base text-[#080118] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#67677e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={editFormData.expiryDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={editFormData.visibleToEmployee}
                                    data-state={editFormData.visibleToEmployee ? "checked" : "unchecked"}
                                    value="on"
                                    onClick={() => setEditFormData({ ...editFormData, visibleToEmployee: !editFormData.visibleToEmployee })}
                                    className="peer h-5 w-5 shrink-0 rounded-full border border-[#7c3bed] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#7c3bed] data-[state=checked]:text-white"
                                    id="emp-view"
                                >
                                    <span
                                        data-state={editFormData.visibleToEmployee ? "checked" : "unchecked"}
                                        className="flex items-center justify-center text-current"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {editFormData.visibleToEmployee && (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </span>
                                </button>
                                <label
                                    htmlFor="emp-view"
                                    className="text-sm  text-[#080118] cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Visible to Employee
                                </label>
                            </div>

                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:!bg-[#3c83f6] bg-white  hover:text-white h-10 px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#7c3bed] hover:bg-[#7c5fff] text-white  h-10 px-4 py-2"
                            >
                                Save Changes
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 bg-[#fff] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-[#67677e]"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </>
            )}

            {/* Rename Document Modal */}
            {showRenameModal && selectedDocument && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowRenameModal(false)} />
                    <div
                        role="dialog"
                        className="fixed left-[50%] top-[50%] z-50 grid grid-cols-1 w-full max-w-[448px] translate-x-[-50%] translate-y-[-50%] !gap-3 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl"
                    >
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                                <FileEdit className="h-5 w-5" />
                                Rename Document
                            </h2>
                            <p className="text-sm text-[#67677e] text-left mt-0">
                                Enter a new name for this document
                            </p>
                        </div>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#080118] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New File Name</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#67677e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
                                        placeholder="Enter file name"
                                        value={renameFileName}
                                        onChange={(e) => setRenameFileName(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <span className="text-sm text-[#67677e] font-mono bg-white px-2 py-2 rounded">
                                        .{selectedDocument.file_name.split('.').pop()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white hover:!bg-[#3c83f6] hover:!text-white h-10 px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRename}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#7c3bed] hover:!bg-[#7c3bed] text-white hover:bg-primary/90 h-10 px-4 py-2"
                            >
                                Rename
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowRenameModal(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 bg-[#fff] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-[#67677e]"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}

export default PassportEntryImmigration;
