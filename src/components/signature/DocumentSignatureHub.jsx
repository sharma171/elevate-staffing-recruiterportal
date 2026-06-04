import { useState, useRef, useEffect } from "react";

import { DocumentViewer } from "./DocumentViewer";
import { SignatureCanvas } from "./SignatureCanvas";
import { ToolbarControls } from "./ToolbarControls";
import { SignatureLibrary } from "./SignatureLibrary";
import { FormFieldManager } from "./FormFieldManager";
import { toast } from "react-toastify";
import { Send, Download, Menu, PanelLeftClose } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import OverlayModal from "../OverlayModal";

function toRGB(color) {
  if (!color || typeof color !== "string") {
    return rgb(0, 0, 0);
  }

  color = color.trim().toLowerCase();

  const rgbMatch = color.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (rgbMatch) {
    return rgb(
      Math.min(255, parseInt(rgbMatch[1], 10)) / 255,
      Math.min(255, parseInt(rgbMatch[2], 10)) / 255,
      Math.min(255, parseInt(rgbMatch[3], 10)) / 255
    );
  }

  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    const rVal = parseInt(hex.substring(0, 2), 16) / 255;
    const gVal = parseInt(hex.substring(2, 4), 16) / 255;
    const bVal = parseInt(hex.substring(4, 6), 16) / 255;
    return rgb(rVal, gVal, bVal);
  }

  return rgb(0, 0, 0);
}

function DocumentSignatureHuba({ open, onOpenChange, documentContent, documentName, onDocumentSigned }) {
  const [documentState, setDocumentState] = useState({
    pages: [],
    currentPage: 1,
    zoom: 100,
    rotation: 0,
  });

  const [signatures, setSignatures] = useState(() => {
    const saved = localStorage.getItem("savedSignatures");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSignature, setCurrentSignature] = useState(null);
  const [fields, setFields] = useState([]);

  const [uiState, setUiState] = useState({
    selectedTool: "select",
    showSignaturePanel: false,
    showFieldPanel: false,
    penSize: 3,
    penColor: "#000000",
    leftSidebarOpen: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const [openDownload, setOpenDownload] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDownload(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const loadSignatures = () => {
      const saved = localStorage.getItem("savedSignatures");
      if (saved) {
        setSignatures(JSON.parse(saved));
      }
    };
    loadSignatures();
  }, []);

  if (!open) {
    return <></>;
  }

  const downloadBase64Pdf = (base64, filename = documentName) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onOriginal = async () => {
    setOpenDownload(false);
    downloadBase64Pdf(documentContent);
  };

  const saveSignaturesToStorage = (sigs) => {
    localStorage.setItem("savedSignatures", JSON.stringify(sigs));
    setSignatures(sigs);
  };

  const handleSaveSignature = (signatureData, name, type) => {
    const newSignature = {
      id: Date.now().toString(),
      name,
      data: signatureData,
      type,
      timestamp: Date.now(),
    };

    const updatedSignatures = [...signatures, newSignature];
    saveSignaturesToStorage(updatedSignatures);
    setCurrentSignature(signatureData);
    handleToolChange("signature", signatureData);
    setUiState((prev) => ({ ...prev, selectedTool: "signature" }));
    toast.success("Signature saved successfully");
  };

  const handleDeleteSignature = (id) => {
    const updatedSignatures = signatures.filter((sig) => sig.id !== id);
    saveSignaturesToStorage(updatedSignatures);
    handleToolChange("select");
    setCurrentSignature("");
    toast.success("Signature deleted");
  };

  const handleSelectSignature = (signature) => {
    setCurrentSignature(signature.data);
    handleToolChange("signature", signature.data);
  };

  const handleAddField = (type, position, id = Date.now().toString()) => {
    const newField = {
      id: id,
      type,
      position,
      size: { width: type === "signature" ? 200 : 150, height: type === "signature" ? 80 : 30 },
      page: documentState.currentPage,
      required: type === "signature",
      value: type === "signature" ? currentSignature || "" : "",
    };

    setFields([...fields, newField]);
    setUiState((prev) => ({ ...prev, selectedTool: "select" }));

    // const fieldTypeNames = {
    //   signature: "Signature",
    //   text: "Text field",
    //   checkbox: "Checkbox",
    //   date: "Date field",
    // };

    // toast.success(`${fieldTypeNames[type]} added! Select tool again to add another.`);
  };

  const handleUpdateField = (id, updates) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const handleDeleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleZoomChange = (zoom) => {
    setDocumentState((prev) => ({ ...prev, zoom }));
  };

  const handlePageChange = (page) => {
    setDocumentState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleToolChange = (tool, current = currentSignature) => {
    setUiState((prev) => ({
      ...prev,
      leftSidebarOpen: true,
    }));

    if (tool === "signature" && signatures.length === 0) {
      setUiState((prev) => ({ ...prev, showSignaturePanel: true }));
      return;
    }
    if (tool === "signature" && !current) {
      toast.error("Please select a signature from the library first!");
      return;
    }

    setUiState((prev) => ({ ...prev, selectedTool: tool }));
  };

  const handleExportDocument = async (_, isAttach) => {
    setOpenDownload(false);

    if (fields.length === 0) {
      toast.error("Please add at least one signature or field before exporting");
      return;
    }

    const requiredFieldsCompleted = fields
      .filter((f) => f.required)
      .every((f) => {
        if (f.type === "checkbox") return f.value === "true";
        return f.value && f.value.trim() !== "";
      });

    if (!requiredFieldsCompleted) {
      toast.error("Please complete all required fields before exporting");
      return;
    }

    setIsProcessing(true);
    try {
      toast.info("Generating PDF with signatures and fields...");
      const pdfBytes = Uint8Array.from(atob(documentContent), (c) => c.charCodeAt(0));
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      // Function to convert any image to PNG
      const convertToPNG = async (dataUrl) => {
        return new Promise((resolve, reject) => {
          // Normalize to data URI with correct MIME type
          const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
          const mimeType = match ? match[1] : "image/jpeg";
          const b64 = match ? match[2] : dataUrl;
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            // Disable smoothing to keep pixel-perfect fidelity
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            try {
              // Explicitly request PNG at default (lossless) quality
              const pngDataUrl = canvas.toDataURL("image/png", 1.0);
              resolve(pngDataUrl);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = (err) => reject(new Error("Image load failed: " + err));
          img.src = `data:${mimeType};base64,${b64}`;
        });
      };

      for (const field of fields) {
        if (field.page > pages.length) continue;

        const page = pages[field.page - 1];
        const { height: pageHeight } = page.getSize();
        const x = field.position.x;
        const y = pageHeight - field.position.y - field.size.height;

        try {
          switch (field.type) {
            case "signature":
              if (field.value) {
                // Convert any image format to PNG
                const pngDataURL = await convertToPNG(field.value);
                const base64Data = pngDataURL.split(",")[1];
                const signatureBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
                const signatureImage = await pdfDoc.embedPng(signatureBytes);
                const { width: imgWidth, height: imgHeight } = signatureImage.scale(1);

                const fieldWidth = field.size.width;
                const fieldHeight = field.size.height;

                // Calculate aspect ratios
                const imgAspect = imgWidth / imgHeight;
                const fieldAspect = fieldWidth / fieldHeight;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgAspect > fieldAspect) {
                  // Image is wider — fit by width
                  drawWidth = fieldWidth;
                  drawHeight = fieldWidth / imgAspect;
                  offsetX = x;
                  offsetY = y + (fieldHeight - drawHeight) / 2;
                } else {
                  // Image is taller — fit by height
                  drawHeight = fieldHeight;
                  drawWidth = fieldHeight * imgAspect;
                  offsetX = x + (fieldWidth - drawWidth) / 2;
                  offsetY = y;
                }

                page.drawImage(signatureImage, {
                  x: offsetX,
                  y: offsetY,
                  width: drawWidth,
                  height: drawHeight,
                });
              }
              break;

            case "text":
            case "date":
              if (field.value) {
                const fieldCenterY = field.position.y + field.size.height / 2;
                const textY = pageHeight - fieldCenterY - 4;
                page.drawText(field.value, {
                  x: field.position.x + 2,
                  y: textY,
                  size: 12,
                  color: toRGB(uiState.penColor),
                });
              }
              break;

            case "checkbox": {
              const checkedImgData = `data:image/svg+xml;base64,${btoa(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <rect width="14" height="14" x="1" y="1" fill="none" stroke="${uiState.penColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="4,8 7,12 12,4" fill="none" stroke="${uiState.penColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              )}`;

              const uncheckedImgData = `data:image/svg+xml;base64,${btoa(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <rect width="14" height="14" x="1" y="1" fill="none" stroke="${uiState.penColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              )}`;

              let base64 = field.value === "true" ? checkedImgData : uncheckedImgData;

              base64 = await convertToPNG(base64);
              base64 = base64.split(",")[1];

              const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
              const image = await pdfDoc.embedPng(byteArray);

              const boxSize = 20;

              page.drawImage(image, {
                x,
                y: y + (field.size.height - boxSize) / 2,
                width: boxSize,
                height: boxSize,
              });
              break;
            }
          }
        } catch (error) {
          console.error(`Error adding ${field.type} field:`, error);
          toast.error(`Failed to add ${field.type} on page ${field.page}`);
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();

      if (isAttach) {
        function uint8ArrayToBase64(bytes) {
          let binary = "";
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return window.btoa(binary);
        }

        const base64 = uint8ArrayToBase64(modifiedPdfBytes);
        return onDocumentSigned(base64);
      }

      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentName.replace(/\.[^/.]+$/, "")}_signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully with all fields!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const requiredFieldsCompleted = fields.filter((f) => f.required).every((f) => f.value && f.value.trim() !== "");

  return (
    <OverlayModal isActive={open} onClose={() => onOpenChange(false)} style={{ minWidth: "80%" }}>
      <div className="signatureContainer" open={open} onOpenChange={onOpenChange}>
        <div className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="flex flex-col h-[95vh]">
            <div className="d-flex nowrap overflow-auto flex-row items-center justify-between py-1">
              <div className="text-lg font-semibold flex items-center gap-3">
                <span title={documentName} className="inline-block max-w-[200px] truncate">
                  {documentName}
                </span>
                {fields.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {fields.length} signature(s) added
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExportDocument(null, true)}
                  disabled={fields.length === 0 || isProcessing}
                  className={`inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-orange-600 text-white hover:bg-orange-700 hover:text-white`}
                >
                  <Send className="h-4 w-4" />
                  {isProcessing ? "Adding..." : "Add as Attachment"}
                </button>

                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setOpenDownload((v) => !v)}
                    disabled={!requiredFieldsCompleted || isProcessing}
                    className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background text-foreground hover:[background-color:#e9e9e9]"
                  >
                    <Download className="h-4 w-4" />
                    {isProcessing ? "Exporting..." : "Export PDF"}
                  </button>
                </div>
              </div>
            </div>
            {openDownload && (
              <div className="flex relative inline-block text-left items-center gap-3" ref={dropdownRef}>
                <div className="absolute text-sm right-0 top-0 bg-white border rounded-md shadow-lg z-10">
                  <button
                    onClick={handleExportDocument}
                    disabled={!requiredFieldsCompleted || isProcessing}
                    className="w-full d-flex gap-2 nowrap text-left px-4 py-2 hover:bg-gray-100"
                    style={{ borderBottom: "1px solid #d6d6d6ff" }}
                  >
                    <Download className="h-4 w-4" />
                    With Your Changes
                  </button>
                  <button
                    onClick={onOriginal}
                    className="d-flex gap-2 nowrap w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4" />
                    Without Your Changes (Original)
                  </button>
                </div>
              </div>
            )}
            <div className="py-2">
              <ToolbarControls
                selectedTool={uiState.selectedTool}
                onToolChange={handleToolChange}
                zoom={documentState.zoom}
                onZoomChange={handleZoomChange}
                penSize={uiState.penSize}
                penColor={uiState.penColor}
                onPenSizeChange={(size) => setUiState((prev) => ({ ...prev, penSize: size }))}
                onPenColorChange={(color) => setUiState((prev) => ({ ...prev, penColor: color }))}
                currentSignature={currentSignature}
                onToggleSignaturePanel={() =>
                  setUiState((prev) => ({ ...prev, showSignaturePanel: !prev.showSignaturePanel }))
                }
                showSignaturePanel={uiState.showSignaturePanel}
              />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
              {uiState.leftSidebarOpen && (
                <div className="signatureContainer border-r flex flex-col" style={{ maxWidth: "18rem" }}>
                  <div className="flex-1 overflow-auto">
                    <div className="w-full flex mb-2">
                      <button
                        onClick={() =>
                          setUiState((prev) => ({
                            ...prev,
                            leftSidebarOpen: !prev.leftSidebarOpen,
                          }))
                        }
                        className="ml-auto flex items-center me-2 justify-center gap-2 h-10 px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-300 bg-[#fff] hover:bg-[#c7c9c5] text-black border border-[#cfd1cd] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                      >
                        <PanelLeftClose size={20} />
                        Close Panel
                      </button>
                    </div>

                    <div className="pb-4 ps-0 pe-2 space-y-4">
                      <SignatureLibrary
                        signatures={signatures}
                        onSelectSignature={handleSelectSignature}
                        onDeleteSignature={handleDeleteSignature}
                        currentSignature={currentSignature}
                      />

                      <FormFieldManager
                        selectedTool={uiState.selectedTool}
                        onToolChange={handleToolChange}
                        fields={fields}
                        onUpdateField={handleUpdateField}
                        onDeleteField={handleDeleteField}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* floating toggle button */}
              {uiState.leftSidebarOpen ? (
                <></>
              ) : (
                <button
                  onClick={() =>
                    setUiState((prev) => ({
                      ...prev,
                      leftSidebarOpen: !prev.leftSidebarOpen,
                    }))
                  }
                  style={{
                    position: "absolute",
                    top: "5px",
                    left: "0px",
                  }}
                  className="flex items-center justify-center gap-2 h-10 px-3 py-2 text-sm font-medium text-black bg-[#fff] hover:bg-[#c7c9c5] border border-[#cfd1cd] rounded-lg transition-all duration-300 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <Menu size={24} />
                </button>
              )}

              <div className="flex-1 flex flex-col overflow-hidden">
                <DocumentViewer
                  documentContent={documentContent}
                  zoom={documentState.zoom}
                  currentPage={documentState.currentPage}
                  onPageChange={handlePageChange}
                  fields={fields}
                  onAddField={handleAddField}
                  onUpdateField={handleUpdateField}
                  selectedTool={uiState.selectedTool}
                  currentSignature={currentSignature}
                  onToolChange={handleToolChange}
                  onRemoveField={handleDeleteField}
                  uiState={uiState}
                />
              </div>
            </div>

            {uiState.showSignaturePanel && (
              <SignatureCanvas
                onClose={() => setUiState((prev) => ({ ...prev, showSignaturePanel: false }))}
                onSaveSignature={handleSaveSignature}
                penSize={uiState.penSize}
                penColor={uiState.penColor}
              />
            )}
          </div>
        </div>
      </div>
    </OverlayModal>
  );
}

export function DocumentSignatureHub(props) {
  let open = props.open;

  if (!open) {
    return <></>;
  }

  return <DocumentSignatureHuba {...props} />;
}
