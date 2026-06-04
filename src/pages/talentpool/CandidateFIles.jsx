import React, { useEffect, useRef, useState, useMemo } from "react";
import "./css/CandidateFiles.css";
import FilePreview from "../benchcandidate/FilePreview";
import images from "../../assets/images/new";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import logoUploadFile from "../../images/line-md--uploading-loop.svg";
import { toast } from "react-toastify";
import styles from "./css/Candidatefiles.module.css";
import { Confirm, ThemeLoader } from "../../components";
import DocumentsSection from "./DocumentsSection";
import { returnTruncatedStr } from "../../helpers/StrHelpers";
import { UpdateDocument } from ".";

import EmptyView from "../../components/EmptyView";
import UploadStatusModal from "../../components/UploadStatusModal";
import { Search, Filter, Image, FileText, X, Pen } from "lucide-react";
import PremiumSelect from "../../components/PremiumSelect";
import BulkUpdateDocs from "./BulkUpdateDocs";

const { successgif, uploadbuttonicon, otherdocIcon, cvIcon, visa_status, list } = images;

// SVG Variables
const uploadArrowIcon = (
  <svg width="55" height="38" viewBox="0 0 55 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M45.6571 16.5409C44.4231 7.71944 36.6667 1.18616 27.3237 1.18616C19.3022 1.18751 12.3397 6.02301 9.78295 13.3177C4.05449 14.5038 0 19.2524 0 24.9362C0 31.1288 5.02474 36.3022 11.4583 36.8112H45.0408C50.4167 36.3022 54.6474 31.8915 54.6474 26.6326C54.6474 21.6274 50.7692 17.3022 45.6571 16.5382V16.5409ZM36.7541 21.2909C36.6766 21.3736 36.5813 21.4391 36.4749 21.4829C36.3685 21.5267 36.2535 21.5478 36.1378 21.5447C36.0218 21.5478 35.9064 21.5266 35.7998 21.4826C35.6931 21.4385 35.5977 21.3726 35.5201 21.2895L28.2051 14.25V30.875C28.2051 31.3839 27.8526 31.7232 27.3237 31.7232C26.7949 31.7232 26.4423 31.3839 26.4423 30.875V14.25L19.1259 21.2909C19.0464 21.3711 18.9507 21.435 18.8448 21.4786C18.7389 21.5222 18.6248 21.5447 18.5096 21.5447C18.3944 21.5447 18.2804 21.5222 18.1744 21.4786C18.0685 21.435 17.9729 21.3711 17.8933 21.2909C17.8095 21.2143 17.7428 21.1221 17.6972 21.0199C17.6516 20.9177 17.6281 20.8077 17.6281 20.6964C17.6281 20.5852 17.6516 20.4752 17.6972 20.373C17.7428 20.2708 17.8095 20.1786 17.8933 20.102L26.7074 11.6199C26.7949 11.5357 26.8837 11.4516 26.9712 11.4516C27.1474 11.3661 27.4126 11.3661 27.6763 11.4516C27.7651 11.5357 27.8526 11.5357 27.9414 11.6199L36.7555 20.102C37.1081 20.4413 37.1067 20.9516 36.7541 21.2909Z"
      fill="#0B4DA1"
      fillOpacity="0.50"
    />
  </svg>
);

const infoIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
    <g fill="none">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="#8C8C8C"
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 13a1 1 0 1 0 0 2a1 1 0 0 0 0-2m0-9a1 1 0 0 0-.993.883L11 7v6a1 1 0 0 0 1.993.117L13 13V7a1 1 0 0 0-1-1"
      />
    </g>
  </svg>
);

function getPermissions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  return String(data?.modules?.talentPool?.sections.documents).toLocaleLowerCase();
}

const ThreeRow = ({
  handleDeleteFile,
  handleBase64File,
  fileType,
  handleDownloadFile,
  item,
  disabled,
  setshowUpdateDocs,
}) => {
  const [openMenuRow, setOpenMenuRow] = useState(false);
  const [deleteModal, setdeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const menuRef = useRef(null);

  const permitions = getPermissions();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuRow(false); // Close the menu if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const HandleDelete = () => {
    setOpenMenuRow(false);
    handleDeleteFile();
  };

  const HandleDownload = () => {
    console.log("DOWnload file");
    handleDownloadFile();
  };

  return (
    <div ref={menuRef}>
      <button
        className="action-button p-2"
        type="button"
        style={{ boxShadow: "unset" }}
        onClick={() => setOpenMenuRow((prevState) => !prevState)}
      >
        ⋮
      </button>
      {openMenuRow && (
        <div className="action-menu">
          <ul>
            {fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <li
                className="text-start"
                onClick={() => {
                  handleBase64File();
                  setOpenMenuRow(false); // Close the menu
                }}
              >
                <div className="d-flex align-items-center px-2 gap-2">
                  <span className="font14 material-symbols-outlined">visibility</span>
                  <span> View</span>
                </div>
              </li>
            )}

            {disabled || permitions != "edit" ? (
              <></>
            ) : (
              <>
                <li
                  className="text-start"
                  onClick={() => {
                    console.log(item, "items isss");
                    setshowUpdateDocs(item);
                  }}
                >
                  <div className="d-flex align-items-center px-2 gap-2">
                    <span className="font14 material-symbols-outlined">edit_square</span>
                    <span>Edit</span>
                  </div>
                </li>
                <li
                  className="text-start"
                  onClick={() => {
                    console.log(item, " item");
                    setDeleteText(
                      `Are you sure you want to delete <b>${
                        item?.doc_name || item?.file_name
                      }</b>?<br/>This cannot be undone.`,
                    );
                    setOpenMenuRow(false);
                    setdeleteModal(true);
                  }}
                >
                  <div className="d-flex align-items-center px-2 gap-2">
                    <span className="font14 material-symbols-outlined">delete</span>
                    <span>Delete</span>
                  </div>
                </li>
              </>
            )}
            <li
              className="text-start"
              onClick={() => {
                HandleDownload();
                setOpenMenuRow(false); // Close the menu
              }}
            >
              <div className="d-flex align-items-center px-2 gap-2">
                <span className="font14 material-symbols-outlined">download</span>
                <span> Download</span>
              </div>
            </li>
          </ul>
        </div>
      )}
      <Confirm
        show={deleteModal}
        result={(result) => {
          if (result) {
            HandleDelete();
          }
          setdeleteModal(false);
        }}
        title={"Delete Document"}
        text={deleteText}
        deleteTitle="Yes, I'm Sure"
      />
    </div>
  );
};

function SelectedDocumentsBar({ selectedCount = 0, onClear, onEdit }) {
  if (!selectedCount) return null;

  return (
    <div className="signatureContainer">
      <div className="bg-[#7c3bed1a] px-6 py-3 animate-in slide-in-from-top-2 duration-200 mb-2 rounded-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-medium text-[#7c3bed]">{selectedCount} documents selected</span>

            <button onClick={onClear} className="successoutlineButton gap-1">
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>

          <button
            onClick={onEdit}
            className="themePurpleBGHover fw-medium px-3 py-2 d-flex gap-2 text-white rounded-[10px] align-items-center"
          >
            <Pen className="h-4 w-4" />
            Edit Selected
          </button>
        </div>
      </div>
    </div>
  );
}

const CandidateFiles = ({ candidateDetails, candidateCreateData, disabled }) => {
  const permitions = getPermissions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOtherFiles, setselectedOtherFiles] = useState([]);
  const [currentDataForFiles, setCurrentDataForFiles] = useState([]);
  const [base64File, setBase64File] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [othersModal, setOthersModal] = useState(false);
  const [showUpdateDocs, setshowUpdateDocs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [currentFileName, setCurrentFileName] = useState("");
  const [docObject, setDocObject] = useState("");
  const [allFileNames, setallFileNames] = useState([]);
  const [isLoadingFile, setisLoadingFile] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedBulkFiles, setSelectedBulkFiles] = useState([]);
  const [bulkPopupOpen, setBulkPopupOpen] = useState(false);

  const { user } = useAuth();

  const [filters, setFilters] = useState({
    searchQuery: "",
    documentType: "",
    status: "All Status",
  });

  const documentTypes = [
    { text: "Select Category", value: "" },
    { text: "Onboarding", value: "Onboarding" },
    { text: "Compliance", value: "Compliance" },
    { text: "Payroll", value: "Payroll" },
    { text: "Performance", value: "Performance" },
    { text: "Resume", value: "Resume" },
    { text: "Identification", value: "Identification" },
    { text: "Other", value: "Other" },
  ];

  const statusOptions = [
    { value: "All Status", text: "All Status" },
    { value: "Valid", text: "Valid" },
    { value: "Pending", text: "Pending" },
    { value: "Expiring Soon", text: "Expiring Soon" },
    { value: "Expired", text: "Expired" },
  ];

  useEffect(() => {
    if (selectedOtherFiles?.length) {
      setIsPopupVisible(false);
      setOthersModal(true);
    }
  }, [selectedOtherFiles?.length]);

  useEffect(() => {
    setselectedOtherFiles([]);
  }, [othersModal]);

  useEffect(() => {
    setSelectedFiles([]);
    setselectedOtherFiles([]);
  }, [isPopupVisible]);

  // Handlers
  const uploadDocument = () => setIsPopupVisible(true);

  const handleFileChange = (e) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    const file = e.target.files[0];

    if (file) {
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload PDF or Word documents.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setSelectedFiles((prevFiles) => [...prevFiles, { file, type: "resume" }]);
    }
  };

  const nextFunction = () => {
    const index = allFileNames.indexOf(currentFileName);
    if (index !== -1 && index < allFileNames.length - 1) {
      const nextFile = allFileNames[index + 1];
      handleBase64File({ file_name: nextFile }, candidateDetails?.original_email, true);
    }
  };

  const previousFunction = () => {
    const index = allFileNames.indexOf(currentFileName);
    if (index > 0) {
      const prevFile = allFileNames[index - 1];
      handleBase64File({ file_name: prevFile }, candidateDetails?.original_email, true);
    }
  };

  const handleOtherFile = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
    setselectedOtherFiles([...selectedOtherFiles, ...validFiles.map((file) => ({ file, type: "other" }))]);
    if (files.length !== validFiles.length) toast.error("Some files exceed 5MB limit.");
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setSelectedFiles([]);
  };

  useEffect(() => {
    if (candidateDetails?.original_email && user?.email) {
      const timeout = setTimeout(() => {
        getDocumentfilesData();
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [candidateDetails?.original_email, user?.email]);

  const getUniqueFileNames = (files = []) => {
    try {
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/svg+xml",
      ];

      const names = files
        .map((item) => {
          const ext = String(item.file_extension).toLowerCase();
          if (ext === "application/pdf" || allowedImageTypes.includes(ext)) {
            return item.file_name;
          }
          return null;
        })
        .filter((name) => name);

      const uniqueNames = [...new Set(names)];
      return uniqueNames;
    } catch (err) {
      return [];
    }
  };

  const getDocumentfilesData = (email) => {
    const payload = {
      emailid: user?.email,
      email_id: email || candidateDetails?.original_email || candidateCreateData?.primary_email,
      // email_id: "aishwarya.py96@gmail.com",
      task: "get_file_names",
    };
    setIsLoading(true);
    return api
      .documents_delete_retrieve(payload)
      .then((res) => {
        setIsLoading(false);
        let fileNames = getUniqueFileNames(res.available_files);
        setallFileNames(fileNames);
        setCurrentDataForFiles(res.available_files);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("Error fetching files:", err);
      });
  };

  const handleDeleteFile = (file, primary_email) => {
    let mailID = candidateDetails?.original_email || candidateCreateData?.primary_email;
    const payload = {
      emailid: user?.email,
      email_id: primary_email || mailID,
      task: "delete_files",
      file_name: [file.file_name],
    };
    setIsLoading(true);
    return api
      .documents_delete_retrieve(payload)
      .then((data) => {
        setIsLoading(false);
        console.log(data.message, "data");
        toast.success(data.message);
        getDocumentfilesData();
        // Clear selection if deleted
        setSelectedBulkFiles((prev) => prev.filter((f) => f.file_name !== file.file_name));
      })
      .catch((err) => {
        setIsLoading(false);
        toast.log("Error fetching file");
        console.error("Error fetching files:", err);
      });
  };

  const handleBase64File = (file, primary_email, customLoader) => {
    let mailID = candidateDetails?.original_email || candidateCreateData?.primary_email;

    const payload = {
      emailid: user?.email,
      email_id: primary_email || mailID,
      task: "download_files",
      file_name: [file.file_name],
    };

    if (customLoader) {
      setisLoadingFile(true);
    } else {
      setIsLoading(true);
    }

    return api
      .documents_delete_retrieve(payload)
      .then((data) => {
        if (customLoader) {
          setisLoadingFile(false);
        } else {
          setIsLoading(false);
        }
        if (data.retrieve_files[0].base64?.length > 100) {
          setCurrentFileName(file.file_name);
          setDocObject(data.retrieve_files[0]);
          setBase64File(() => data.retrieve_files[0].base64);
          setFileType(() => data.retrieve_files[0].file_extension);
        } else {
          if (data?.retrieve_files?.[0]?.base64) {
            toast.error(data?.retrieve_files?.[0]?.base64);
          }
        }
      })
      .catch((err) => {
        if (customLoader) {
          setisLoadingFile(false);
        } else {
          setIsLoading(false);
        }
        toast.error("Error fetching file");
        console.error("Error fetching files:", err);
      });
  };

  const handleDownloadFile = async (file, primary_email) => {
    let mailID = candidateDetails?.original_email || candidateCreateData?.primary_email;

    const payload = {
      emailid: user?.email,
      email_id: primary_email || mailID,
      task: "download_files",
      file_name: [file.file_name],
    };

    setIsLoading(true);

    // API Call
    api
      .documents_delete_retrieve(payload)
      .then((res) => {
        setIsLoading(false);
        let data = res.retrieve_files[0];
        const { base64, file_name } = data;

        if (base64?.length < 100) {
          return toast.error(base64);
        }

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file_name || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error downloading file:", error);
      });
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove the Base64 prefix
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const UploadDocuments = async () => {
    try {
      setIsPopupVisible(false);
      // setDocLoading(true);

      setUploadFiles(
        selectedFiles.map((sf) => ({
          file: sf.file,
          status: "pending",
          percent: 0,
          type: sf.type,
        })),
      );

      // Determine email to use
      const email =
        candidateCreateData?.original_email ||
        candidateCreateData?.primary_email ||
        candidateDetails?.original_email ||
        candidateDetails?.primary_email;

      for (let i = 0; i < selectedFiles.length; i++) {
        // Mark as uploading
        setUploadFiles((curr) =>
          curr.map((item, idx) => (idx === i ? { ...item, status: "uploading", percent: 0 } : item)),
        );

        // Simulate running progress
        let currentPercent = 0;
        const progressInterval = setInterval(() => {
          currentPercent = Math.min(currentPercent + Math.floor(Math.random() * 6) + 3, 95);
          setUploadFiles((curr) => curr.map((item, idx) => (idx === i ? { ...item, percent: currentPercent } : item)));
        }, 300);

        try {
          // Prepare single file's content
          const fileContentBase64 = await fileToBase64(selectedFiles[i].file);

          const singleFilePayload = {
            emailid: user?.email,
            email_id: email,
            files: [
              {
                doc_category: "Resume",
                doc_type: "Resume",
                file_name: selectedFiles[i].file.name,
                document_type: selectedFiles[i].type,
                file_content: fileContentBase64,
              },
            ],
          };

          // Call the API for one file at a time
          await api.upload_documents(singleFilePayload);

          clearInterval(progressInterval);

          // Success for this file
          setUploadFiles((curr) =>
            curr.map((item, idx) => (idx === i ? { ...item, status: "uploaded", percent: 100 } : item)),
          );
        } catch (error) {
          clearInterval(progressInterval);

          setUploadFiles((curr) =>
            curr.map((item, idx) => (idx === i ? { ...item, status: "error", percent: 0 } : item)),
          );

          // setIsPopupVisible(true);
          console.error("Error:", error);
          // Optionally: break; // stop remaining uploads if one fails
        }
      }

      // All uploads done
      // setIsSuccess(true);
      setIsPopupVisible(false);
      getDocumentfilesData(email);
      // setTimeout(() => setIsSuccess(false), 2000);
      setSelectedFiles([]);
    } catch (error) {
      setIsPopupVisible(true);
      console.error("Error:", error);
    } finally {
      // setDocLoading(false);
    }
  };

  function formatSize(bytes) {
    if (bytes === 0) return "0 KB";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = (bytes / Math.pow(1024, i)).toFixed(1);
    return `${value} ${sizes[i]}`;
  }

  // --- FILTERING LOGIC ---

  // --- FILTERING AND SORTING LOGIC ---

  const filteredFiles = useMemo(() => {
    // 1. Filter the array first (this reduces the number of items we have to sort)
    const filtered = currentDataForFiles.filter((file) => {
      const query = (filters.searchQuery || "").toLowerCase();

      const fileName = (file.doc_name || file.file_name || "").toLowerCase();
      const documentType = (file.doc_type || "").toLowerCase();

      const matchesSearch = fileName.includes(query) || documentType.includes(query);

      const docTypeFilter = (filters.documentType || "").toLowerCase();
      const fileDocType = (file.doc_category || "").toLowerCase();
      const matchesType = !docTypeFilter || fileDocType === docTypeFilter;

      const statusFilter = (filters.status || "").toLowerCase();
      const fileStatus = (file.doc_status || "").toLowerCase();
      const matchesStatus = !statusFilter || statusFilter === "all status" || fileStatus === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    // 2. Sort the filtered array by latest upload_datetime
    return filtered.sort((a, b) => {
      // Fallback to 0 if upload_datetime is missing/null so the code doesn't break
      const dateA = a.upload_datetime ? new Date(a.upload_datetime).getTime() : 0;
      const dateB = b.upload_datetime ? new Date(b.upload_datetime).getTime() : 0;

      return dateB - dateA; // Descending order: Latest dates appear first
    });
  }, [currentDataForFiles, filters]);

  // 2. Reset to page 1 if filters change to avoid empty pages
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // --- PAGINATION LOGIC BASED ON FILTERED FILES ---

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = filteredFiles.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredFiles.length / rowsPerPage);

  // --- BULK SELECT LOGIC ---

  // Check if a specific file is selected
  const isFileSelected = (file) => {
    return selectedBulkFiles.some((f) => f.file_name === file.file_name);
  };

  // Handle single row selection
  const handleBulkSelect = (file) => {
    if (isFileSelected(file)) {
      setSelectedBulkFiles(selectedBulkFiles.filter((f) => f.file_name !== file.file_name));
    } else {
      setSelectedBulkFiles([...selectedBulkFiles, file]);
    }
  };

  // Handle Select All (Current Page Only)
  const isAllPageSelected = currentRows.length > 0 && currentRows.every((row) => isFileSelected(row));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      // Uncheck all on this page
      const currentPageFileNames = currentRows.map((r) => r.file_name);
      setSelectedBulkFiles(selectedBulkFiles.filter((f) => !currentPageFileNames.includes(f.file_name)));
    } else {
      // Select all on this page
      const newFiles = currentRows.filter((row) => !isFileSelected(row));
      setSelectedBulkFiles([...selectedBulkFiles, ...newFiles]);
    }
  };

  const renderPagination = () => {
    if (totalPages === 0) return null; // Hide pagination if no results

    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start > 1) pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push("...");
      if (end < totalPages) pages.push(totalPages);
    }

    return (
      <div className="d-flex align-items-center gap-1">
        <span
          className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          ◀
        </span>
        {pages.map((page, index) => (
          <div
            style={currentPage === page ? { "--bs-btn-bg": "#0b4da1", "--bs-btn-border-color": "#0b4da1" } : {}}
            key={index}
            className={`btn ${styles.pages} ${currentPage === page ? "btn-primary " + styles.activePage : "btn-light"}`}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
          >
            {page}
          </div>
        ))}
        <span
          className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        >
          ▶
        </span>
      </div>
    );
  };

  const renderFilters = () => {
    const isFiltered = filters.searchQuery !== "" || filters.documentType !== "" || filters.status !== "All Status";

    const clearFilters = () => {
      setFilters({
        searchQuery: "",
        documentType: "",
        status: "All Status",
      });
    };

    return (
      <div className="signatureContainer">
        <div className="flex flex-wrap items-center gap-3 my-3 p-2 bg-[#f1f1f980] rounded-lg ring-1 ring-[#e7e7ef]">
          <div className="relative flex-1 w-100 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.searchQuery}
              onChange={(evt) => {
                setFilters({ ...filters, searchQuery: evt.target.value });
              }}
              className="pl-9 form-control py-2 bigHoverInput w-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 d-none d-md-block" />

            <div className="min-w-[200px]">
              <PremiumSelect
                options={documentTypes}
                onChange={(val) => {
                  setFilters({ ...filters, documentType: val });
                }}
                placeholder="Select Category"
                className="form-control w-100 py-2"
                value={filters.documentType}
              />
            </div>

            <div className="min-w-[150px]">
              <PremiumSelect
                options={statusOptions}
                onChange={(val) => {
                  setFilters({ ...filters, status: val });
                }}
                placeholder="Select Status"
                className="form-control w-100 py-2"
                value={filters.status}
              />
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="successoutlineButtonWhite successoutlineButton ring-1 rounded-[10px]"
                title="Clear all filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <SelectedDocumentsBar
        onClear={() => {
          setBulkPopupOpen(false);
          setSelectedBulkFiles([]);
        }}
        onEdit={() => setBulkPopupOpen(true)}
        selectedCount={selectedBulkFiles.length}
      />
      <div className="candidateEditForm second-navbar pt-0 px-2" style={{ background: "unset" }}>
        {disabled || permitions == "view" ? (
          <></>
        ) : (
          <div className="drag-main pointer" style={{ background: "#F0F0F0" }} onClick={uploadDocument}>
            <div className="flex-main-drop">
              <div className="inner-drag">
                <div className="svg-img">{uploadArrowIcon}</div>
                <div>Click to Choose & Upload Files</div>
                <div className="size-div" style={{ color: "#8C8C8C" }}>
                  {infoIcon}
                  Max File Size : 10MB
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Loading/Success Popup */}
        {(docLoading || isSuccess) && (
          <div className="overlay d-flex align-items-center justify-content-center w-100">
            {docLoading && (
              <div className="popup loading">
                <img src={logoUploadFile} alt="" className="profile mb-2" />
                <p className="nowrap">File Upload in Progress</p>
              </div>
            )}
            {isSuccess && (
              <div className="popup success">
                <img src={successgif} alt="" className="success-tick h-100 w-100 mb-2" />
                {/* <p className="nowrap">Your Files Uploaded successfully!</p> */}
              </div>
            )}
          </div>
        )}
        {/* Upload Popup */}
        {isPopupVisible && (
          <div className="popup-overlay-data hidemodalclosebtn">
            <div className={styles["popup-content-data"]}>
              <div
                className={`d-flex align-items-center justify-content-between w-100 ${styles.uploadHeader}`}
                style={{ lineHeight: "1" }}
              >
                <div className={`${styles.uploadFiles}`}>Choose & Upload Your Files</div>
                <span onClick={closePopup} className="material-symbols-outlined pointer ps-2">
                  close
                </span>
              </div>
              <div className={`${styles.resume_upload_section}`}>
                <div className="p-relative">
                  <div className={`p-relative ${styles.uploadBTNDIV}`}>
                    <div className={styles.divBox}>
                      <img src={cvIcon} />
                      <input
                        className={styles.inputFile}
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf, .docx"
                      />
                    </div>
                    <div className={styles.fileTitle}>Resume</div>
                  </div>
                </div>
                {permitions != "resume only" ? (
                  <>
                    <div className={styles.sepline} />
                    <div
                      className={`p-relative pointer ${styles.uploadBTNDIV}`}
                      // onClick={() => {
                      //   setIsPopupVisible(false);
                      //   setOthersModal(true);
                      // }}
                    >
                      <div className={`${styles.divBox}`}>
                        <img src={otherdocIcon} />
                        <input
                          className={styles.inputFile}
                          type="file"
                          multiple
                          onChange={handleOtherFile}
                          accept=".pdf, .png, .jpg, .jpeg"
                        />
                      </div>
                      <div className={styles.fileTitle}>Other</div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
              {selectedFiles?.length ? (
                <div className={`d-flex flex-wrap gap-2 w-100`}>
                  {/* <div className="uploadedFiles">Files</div> */}
                  {selectedFiles.map((file, index) => {
                    const getFileIcon = (fileName) => {
                      const ext = fileName.split(".").pop().toLowerCase();
                      switch (ext) {
                        case "jpg":
                        case "jpeg":
                        case "png":
                        case "gif":
                          return "image"; // Image icon
                        case "pdf":
                          return "picture_as_pdf"; // PDF icon
                        case "doc":
                        case "docx":
                          return "description"; // Word file icon
                        case "xls":
                        case "xlsx":
                          return "table_chart"; // Excel file icon
                        case "ppt":
                        case "pptx":
                          return "slideshow"; // PowerPoint file icon
                        case "txt":
                          return "notes"; // Text file icon
                        case "zip":
                        case "rar":
                          return "folder_zip"; // Zip file icon
                        default:
                          return "insert_drive_file"; // Default file icon
                      }
                    };

                    let isPDFICON = getFileIcon(file.file.name) == "picture_as_pdf";

                    return (
                      <div key={index} className={styles.itemsDiv}>
                        <div className="d-flex justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-2">
                            {isPDFICON ? (
                              <span className="pdf_icon" />
                            ) : (
                              <span className="material-symbols-outlined">{getFileIcon(file.file.name)}</span>
                            )}
                            <div className="d-flex flex-column align-items-start gap-1">
                              <span className="truncate pr-2" style={{ maxWidth: "160px" }}>
                                {file.file.name}
                              </span>
                              <span className={styles.fileSize}>{formatSize(file.file.size)}</span>
                            </div>
                          </div>
                          <div>
                            <span onClick={() => removeFile(index)} className="material-symbols-outlined pointer ps-2">
                              close
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <></>
              )}
              {selectedFiles?.length ? (
                <div className="row-flex-btn">
                  {/* <button onClick={closePopup} className="close-btn" type="button">
                  <img src={closeIcon} alt="" className="close" />
                  Close
                </button> */}
                  <button
                    onClick={() => {
                      // submitPopup();
                      UploadDocuments();
                    }}
                    type="button"
                    className={styles.submit_btn}
                    disabled={selectedFiles.length === 0}
                  >
                    <img src={uploadbuttonicon} alt="" className="icon" />
                    Submit
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
        {/* file filters */}
        {renderFilters()}
        {/* Files Table */}
        {filteredFiles?.length ? (
          <div className="">
            <div className="p-2 pb-0 d-flex justify-content-between align-items-center">
              <div className={`d-flex align-items-center gap-2`}>
                <input
                  type="checkbox"
                  className="round-checkbox"
                  checked={isAllPageSelected}
                  onChange={handleSelectAllPage}
                  style={{ cursor: "pointer" }}
                  id="allCheckboxselect"
                />

                <label htmlFor="allCheckboxselect" className="pointer" style={{ marginTop: "2px" }}>
                  Select All {currentRows?.length || 0} documents
                </label>
              </div>
              <div className="text-muted font12">
                {selectedBulkFiles.length ? selectedBulkFiles.length + " selected" : <></>}{" "}
              </div>
            </div>
            <div className={`table-responsive nowrap ${styles.table} px-0 mb-3`}>
              <table className={`table table-borderless table-hover align-middle ${styles.mainTable}`}>
                <thead>
                  <tr className={`${styles.lightColor} ${styles.tableHead} `}>
                    {/* --- BULK SELECT ALL CHECKBOX --- */}
                    <th className="nowrap" style={{ width: "40px" }}></th>

                    <th className="nowrap">
                      <div className={`${styles.th} ps-2`}>
                        <span class="material-symbols-outlined fontgray">file_copy</span>
                        Document Name
                      </div>
                    </th>

                    <th className="nowrap">
                      <div className={styles.th}>
                        <img src={visa_status} />
                        Document Type
                      </div>
                    </th>

                    <th className="nowrap">
                      <div className={styles.th}>
                        <span class="material-symbols-outlined fontgray">calendar_month</span>
                        Upload Date
                      </div>
                    </th>
                    <th className="nowrap">
                      <div className={styles.th}>
                        <span class="material-symbols-outlined fontgray">calendar_month</span>
                        Valid From
                      </div>
                    </th>
                    <th className="nowrap">
                      <div className={styles.th}>
                        <span class="material-symbols-outlined fontgray">calendar_month</span>
                        Expiry Date
                      </div>
                    </th>

                    <th className="nowrap">
                      <div className={styles.th}>
                        <img src={list} />
                        Status
                      </div>
                    </th>

                    <th className="nowrap">
                      <div className={`${styles.th}`}>
                        <span className="user-visible mb-0"></span>
                        <div>Visible to Employee</div>
                      </div>
                    </th>
                    <th className="nowrap">
                      <div className={styles.th}>
                        <span class="material-symbols-outlined fontgray">action_key</span>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="fw-medium">
                  {currentRows.map((file, index) => {
                    let isImage = String(file.file_extension).startsWith("image");
                    let idPDF = String(file.file_extension) == "application/pdf";

                    let isSelectedRow = isFileSelected(file);

                    return (
                      <tr
                        style={isSelectedRow ? { background: "#eff6ff" } : {}}
                        key={index}
                        className={index % 2 == 0 ? "activetableRow" : ""}
                      >
                        <td>
                          <div className="d-flex justify-content-center ps-2">
                            <input
                              type="checkbox"
                              className="round-checkbox"
                              checked={isFileSelected(file)}
                              onChange={() => handleBulkSelect(file)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </td>

                        <td className="themeColor">
                          <div className="d-flex align-items-center gap-2">
                            {isImage ? (
                              <Image />
                            ) : (
                              <FileText
                                style={{
                                  color: idPDF ? "red" : "",
                                }}
                              />
                            )}
                            {returnTruncatedStr(file.doc_name || file.file_name, 15)}
                          </div>
                        </td>
                        <td>{file.doc_type || "NA"}</td>
                        {/* <td>{file.is_resume === "yes" ? "Resume" : "Other"}</td>doc_type */}
                        <td className="themeColor">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="p-1 rounded-circle"
                              style={{ marginBottom: "2px", background: "#093c85" }}
                            />
                            {file.upload_datetime
                              ? new Date(file.upload_datetime)
                                  .toLocaleString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric",
                                  })
                                  .replace(",", " -")
                              : "NA"}
                          </div>
                        </td>
                        <td className="themeColor">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="p-1 rounded-circle"
                              style={{ marginBottom: "2px", background: "#093c85" }}
                            />
                            {file.doc_validfrom
                              ? new Date(file.doc_validfrom)
                                  .toLocaleString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric",
                                  })
                                  .replace(",", " -")
                              : "NA"}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ color: "#D63722" }}>
                            <div
                              className="p-1 rounded-circle"
                              style={{ marginBottom: "2px", background: "#D63722" }}
                            />
                            {file.doc_expiry
                              ? new Date(file.doc_expiry)
                                  .toLocaleString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric",
                                  })
                                  .replace(",", " -")
                              : "NA"}
                          </div>
                        </td>
                        <td>{file.doc_status}</td>
                        <td className="text-center">
                          {file.emp_view == true ? (
                            <span style={{ color: "#0FBE2F" }}> ✓ </span>
                          ) : file.emp_view == false ? (
                            <span style={{ color: "#D63722" }}> ✗ </span>
                          ) : (
                            "NA"
                          )}
                        </td>
                        <td>
                          <div className="menu-container">
                            {/* Assuming ThreeRow is a custom component */}
                            <ThreeRow
                              item={file}
                              setshowUpdateDocs={setshowUpdateDocs}
                              disabled={disabled}
                              handleDeleteFile={() => handleDeleteFile(file, candidateDetails?.original_email)}
                              handleBase64File={() => {
                                setDocObject(file);
                                handleBase64File(
                                  file,
                                  candidateDetails?.original_email || candidateCreateData?.primary_email,
                                );
                              }}
                              fileType={file.file_extension}
                              handleDownloadFile={() => handleDownloadFile(file, candidateDetails?.original_email)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <UploadStatusModal uploadFiles={uploadFiles} />

              <FilePreview
                docObject={docObject}
                nextFunction={nextFunction}
                previousFunction={previousFunction}
                fileMeta={{ currentFileName, allFileNames }}
                isLoading={isLoadingFile}
                base64File={base64File}
                setBase64File={setBase64File}
                fileType={fileType}
                setFileType={setFileType}
              />
            </div>
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="my-3">
                <label> Show </label>
                <select
                  className="form-select d-inline w-auto ms-2"
                  onChange={(e) => {
                    setCurrentPage(1);
                    setRowsPerPage(Number(e.target.value));
                  }}
                  value={rowsPerPage}
                >
                  {[5, 10, 15, 20, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <label> &nbsp; Row </label>
              </div>
              <div className="d-flex justify-content-center my-3">{renderPagination()}</div>
              <div />
              <div />
            </div>
          </div>
        ) : (
          <>
            <EmptyView
              hide={isLoading || docLoading}
              title="No Files & Documents"
              description="Upload documents to see them listed here."
            />
          </>
        )}

        <BulkUpdateDocs
          show={bulkPopupOpen}
          onSuccess={() => {
            setSelectedBulkFiles([]);
            getDocumentfilesData();
          }}
          onClose={() => setBulkPopupOpen(false)}
          files={selectedBulkFiles}
          candidate={candidateDetails}
        />

        <DocumentsSection
          defaultDocs={selectedOtherFiles}
          show={othersModal}
          setshow={(status, refresh) => {
            setOthersModal(status);
            setshowUpdateDocs(false);
            if (refresh) {
              getDocumentfilesData(candidateDetails?.original_email || candidateCreateData?.primary_email);
            }
          }}
          email_id={candidateDetails?.original_email || candidateCreateData?.primary_email}
        />
        <UpdateDocument
          show={showUpdateDocs}
          setShow={(status, refresh) => {
            setshowUpdateDocs(false);
            setOthersModal(false);
            if (refresh) {
              getDocumentfilesData(candidateDetails?.original_email || candidateCreateData?.primary_email);
            }
          }}
        />
      </div>
      <ThemeLoader show={isLoading} />
    </div>
  );
};

export default CandidateFiles;
