import { useRef, useState, useEffect } from "react";
import { Undo, Redo, RotateCcw, Save, PenTool, Type, Upload, X, Trash2 } from "lucide-react";

// Define font options with preview names
const FONT_OPTIONS = [
  { id: 1, name: "Dancing Script", value: "'Dancing Script', cursive" },
  { id: 2, name: "Great Vibes", value: "'Great Vibes', cursive" },
  { id: 3, name: "Parisienne", value: "'Parisienne', cursive" },
  { id: 4, name: "Sacramento", value: "'Sacramento', cursive" },
  { id: 5, name: "Pacifico", value: "'Pacifico', cursive" },
  { id: 6, name: "Cedarville", value: "'Cedarville Cursive', cursive" },
  { id: 7, name: "Homemade Apple", value: "'Homemade Apple', cursive" },
  { id: 8, name: "Marck Script", value: "'Marck Script', cursive" },
  { id: 9, name: "Nothing You", value: "'Nothing You Could Do', cursive" },
  { id: 10, name: "Kalam", value: "'Kalam', cursive" },
  { id: 11, name: "Indie Flower", value: "'Indie Flower', cursive" },
  { id: 12, name: "Shadows Light", value: "'Shadows Into Light', cursive" },
  // { id: 13, name: "Caveat", value: "'Caveat', cursive" },
  // { id: 14, name: "Gochi Hand", value: "'Gochi Hand', cursive" },
  // { id: 15, name: "Patrick Hand", value: "'Patrick Hand', cursive" },
  // { id: 16, name: "Alex Brush", value: "'Alex Brush', cursive" },
  // { id: 17, name: "Allura", value: "'Allura', cursive" },
  // { id: 18, name: "Mr Dafoe", value: "'Mr Dafoe', cursive" },
  // { id: 19, name: "Rochester", value: "'Rochester', cursive" },
  // { id: 20, name: "Tangerine", value: "'Tangerine', cursive" },
];

export function SignatureCanvas({ onSaveSignature, penSize, penColor, onClose = () => {} }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [activeTab, setActiveTab] = useState("draw");
  const [typedName, setTypedName] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [drawError, setDrawError] = useState(false);
  const [typedError, setTypedError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [fontSize, setFontSize] = useState(100); // Larger default font size

  const [visibleCount, setVisibleCount] = useState(0);

  const containerRef = useRef(null);

  // init plain canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use relative units
    const width = window.innerWidth > 768 ? 500 : window.innerWidth * 0.8;
    const height = window.innerHeight * 0.25;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;
    setIsInitialized(true);
  }, []);

  // update brush when props change
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = penColor;
      ctxRef.current.lineWidth = penSize;
    }
  }, [penColor, penSize]);

  // helpers to push/restore history
  const snapshot = () => {
    setUndoStack((u) => [...u.slice(-9), canvasRef.current.toDataURL()]);
    setRedoStack([]);
  };
  const restore = (dataURL) => {
    const img = new Image();
    img.onload = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
  };

  // Get corrected coordinates for drawing
  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // pointer handlers
  const handlePointerDown = (e) => {
    if (!isInitialized) return;

    snapshot();
    const { x, y } = getCoordinates(e);
    setLastPos({ x, y });
    setIsDrawing(true);
    setDrawError(false);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !isInitialized) return;

    const { x, y } = getCoordinates(e);

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(lastPos.x, lastPos.y);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    setLastPos({ x, y });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // undo / redo / clear
  const handleUndo = () => {
    if (!undoStack.length) return;
    const curr = canvasRef.current.toDataURL();
    setRedoStack((r) => [curr, ...r.slice(0, 9)]);
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    restore(prev);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const curr = canvasRef.current.toDataURL();
    setUndoStack((u) => [...u, curr]);
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    restore(next);
  };

  const handleClear = () => {
    snapshot();
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawError(false);
  };

  // save drawn
  const saveDrawn = () => {
    const anyStroke = undoStack.length > 0;
    if (!anyStroke) {
      setDrawError(true);
      return;
    }
    if (!signatureName.trim()) {
      setNameError(true);
      return;
    }
    // Create a high-resolution version
    const dpi = (window.devicePixelRatio || 1) * 2;
    const canvas = document.createElement("canvas");
    canvas.width = canvasRef.current.width * dpi;
    canvas.height = canvasRef.current.height * dpi;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpi, dpi);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      onSaveSignature(canvas.toDataURL(), signatureName, "drawn");
      setSignatureName("");
      handleClear();
      onClose();
    };
    img.src = canvasRef.current.toDataURL();
  };

  const saveTyped = () => {
    let ok = true;
    if (!typedName.trim()) {
      setTypedError(true);
      ok = false;
    }
    if (!signatureName.trim()) {
      setNameError(true);
      ok = false;
    }
    if (!ok) return;

    const padding = 15;
    const baseFontSize = fontSize || 48;
    const dpi = window.devicePixelRatio || 1;

    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    measureCtx.font = `${baseFontSize}px ${selectedFont || "sans-serif"}`;
    const metrics = measureCtx.measureText(typedName || "");
    const textWidthLogical = Math.max(Math.ceil(metrics.width || baseFontSize * (typedName.length || 1)), 1);
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent ?? baseFontSize * 0.8);
    const descent = Math.ceil(metrics.actualBoundingBoxDescent ?? baseFontSize * 0.2);
    const textHeightLogical = Math.max(ascent + descent, 1);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.max(1, Math.ceil((textWidthLogical + padding * 2) * dpi));
    tempCanvas.height = Math.max(1, Math.ceil((textHeightLogical + padding * 2) * dpi));

    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.scale(dpi, dpi);
    tempCtx.font = `${baseFontSize}px ${selectedFont || "sans-serif"}`;
    tempCtx.fillStyle = penColor || "#000";
    tempCtx.textAlign = "left";
    tempCtx.textBaseline = "alphabetic";
    tempCtx.clearRect(0, 0, textWidthLogical + padding * 2, textHeightLogical + padding * 2);
    tempCtx.fillText(typedName, padding, padding + ascent);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let top = imgData.height,
      bottom = -1,
      left = imgData.width,
      right = -1;
    for (let y = 0; y < imgData.height; y++) {
      for (let x = 0; x < imgData.width; x++) {
        if (imgData.data[(y * imgData.width + x) * 4 + 3] > 0) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    if (right < left || bottom < top) return;

    const textWidthPx = right - left + 1;
    const textHeightPx = bottom - top + 1;
    const padPx = Math.round(padding * dpi);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = textWidthPx + padPx * 2;
    finalCanvas.height = textHeightPx + padPx * 2;

    const ctx = finalCanvas.getContext("2d");
    ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(tempCanvas, left, top, textWidthPx, textHeightPx, padPx, padPx, textWidthPx, textHeightPx);

    onSaveSignature(finalCanvas.toDataURL("image/png", 1.0), signatureName, "typed");
    setTypedName("");
    setSignatureName("");
    setTypedError(false);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    const MAX_SIZE_MB = 1;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (!file) {
      setUploadError("No file selected.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setUploadError("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError("Image size must be less than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const saveUpload = () => {
    if (!uploadedImage) {
      setUploadError("No file selected.");
      return;
    }
    if (!signatureName.trim()) {
      setNameError(true);
      return;
    }
    onSaveSignature(uploadedImage, signatureName, "uploaded");
    setUploadedImage(null);
    setSignatureName("");
    setUploadError(false);
    onClose();
  };

  let isDisabled = nameError || typedError || drawError || uploadError;

  return (
    <div
      className="hidemodalclosebtn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-[75%] h-full max-h-[88vh] flex flex-col p-[1vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[10%] flex-shrink-0">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6 text-indigo-600" style={{ height: "2vh", width: "2vh" }} />
            <h2 className="font-bold" style={{ fontSize: "2vh" }}>
              Create Signature
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="p-2 rounded transition duration-200 ease-in-out hover:bg-gray-200 hover:scale-110"
          >
            <X height="2.2vh" width="2.2vh" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex mx-3 border-gray-300" style={{ borderBottom: "1px solid #bcbcbc" }}>
            {["draw", "type", "upload"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setDrawError(false);
                  setTypedError(false);
                  setUploadError(false);
                  setNameError(false);
                }}
              >
                {tab === "draw" && <PenTool className="h-[1.7vh] w-[1.7vh] mr-[0.8vh]" />}
                {tab === "type" && <Type className="h-[1.7vh] w-[1.7vh] mr-[0.8vh]" />}
                {tab === "upload" && <Upload className="h-[1.7vh] w-[1.7vh] mr-[0.8vh]" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-[2vh] flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* draw */}
            <div className="flex flex-col flex-1 min-h-0" style={{ display: activeTab === "draw" ? "flex" : "none" }}>
              <div className="signature-pad mb-4 flex flex-col flex-1 min-h-0">
                <div className="canvas-container flex-1 min-h-0">
                  <canvas
                    ref={canvasRef}
                    className="signature-canvas cursor-crosshair border border-gray-300 rounded-lg w-full h-full"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onTouchCancel={handlePointerUp}
                  />
                </div>
                {drawError && <p className="text-red-600 text-sm mt-1">Please draw your signature</p>}
              </div>
              <div className="toolbar flex flex-wrap gap-2 mb-4">
                <button title="Undo" onClick={handleUndo} className="toolbar-button" disabled={!undoStack.length}>
                  <Undo className="h-[2vh] w-[2vh] mx-1" />
                </button>
                <button title="Redo" onClick={handleRedo} className="toolbar-button" disabled={!redoStack.length}>
                  <Redo className="h-[2vh] w-[2vh] mx-1" />
                </button>
                <button title="Clear" onClick={handleClear} className="toolbar-button">
                  <RotateCcw className="h-[2vh] w-[2vh] mx-1" />
                </button>
              </div>
            </div>

            {/* type */}
            <div className="flex flex-col flex-1 min-h-0" style={{ display: activeTab === "type" ? "flex" : "none" }}>
              <div className="mb-[2vh]">
                <label className="form-label">Your Full Name</label>
                <input
                  type="text"
                  className={`form-input ${typedError ? "border-red-500" : ""}`}
                  value={typedName}
                  onChange={(e) => {
                    setTypedName(e.target.value);
                    setTypedError(false);
                  }}
                  placeholder="e.g., John Smith"
                />
                {typedError && <p className="text-red-600 text-sm mt-1">Please type your name</p>}
              </div>

              <div className="signature-style mb-4 flex flex-col flex-1 min-h-0">
                <label className="form-label">Signature Style</label>
                <div className="font-grid flex-1 min-h-0 overflow-auto" ref={containerRef}>
                  {FONT_OPTIONS.map((font) => (
                    <div
                      key={font.id}
                      className={`font-preview${selectedFont === font.value ? " selected" : ""}`}
                      onClick={() => setSelectedFont(font.value)}
                      style={{ fontFamily: font.value }}
                    >
                      {typedName.trim() || font.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* upload */}
            <div className="flex flex-col flex-1 min-h-0" style={{ display: activeTab === "upload" ? "flex" : "none" }}>
              <div className="mb-4 flex flex-col flex-1 min-h-0">
                <label className="form-label">Upload Signature Image</label>

                <div
                  className="relative w-full flex-1 min-h-0 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer overflow-hidden group"
                  onClick={() => document.getElementById("signature-upload-input")?.click()}
                >
                  {uploadedImage ? (
                    <>
                      <img src={uploadedImage} alt="preview" className="max-h-full w-auto object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <span className="text-white text-[1vh] font-medium">Click to Change Image</span>
                      </div>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white text-xs px-2 py-1 rounded hover:bg-red-500 z-10 text-red-500 hover:text-red-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setUploadError("");
                          document.getElementById("signature-upload-input").value = "";
                        }}
                      >
                        <Trash2 className="h-[1.5vw] w-[1.5vw]" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground text-[1.3vw]">
                      <Upload className="h-[1.5vw] w-[1.5vw] mb-2" />
                      Click to upload image
                    </div>
                  )}

                  <input
                    id="signature-upload-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
              </div>
            </div>

            {/* common name & save */}
            <div className="mt-auto">
              <div className="my-[2vh]">
                <label className="form-label">Signature Name</label>
                <input
                  type="text"
                  className={`form-input ${nameError ? "border-red-500" : ""}`}
                  value={signatureName}
                  onChange={(e) => {
                    setSignatureName(e.target.value);
                    setNameError(false);
                  }}
                  placeholder="e.g., My Official Signature"
                />
                {nameError && <p className="text-red-600 text-sm mt-1">Please enter a signature name</p>}
              </div>
              <button
                disabled={isDisabled}
                className="w-full text-[2vh] flex items-center justify-center px-4 py-[1vh] text-white rounded-md text-base font-medium cursor-pointer transition-all transform bg-gradient-to-r from-[#0d3791] to-[#0d3799] hover:from-[#0a2a70] hover:to-[#0a2f77] hover:shadow-md hover:shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (activeTab === "draw") saveDrawn();
                  else if (activeTab === "type") saveTyped();
                  else saveUpload();
                }}
              >
                <Save className="h-[2vh] w-[2vh] mr-[2vh]" />
                Save Signature
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tab-button {
          flex: 1;
          padding: 1.5vh 0;
          background: transparent;
          border: none;
          font-weight: 500;
          font-size: 2vh;
          color: #6c757d;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .tab-button.active {
          color: #3b82f6;
          font-weight: 600;
        }

        .tab-button.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0.3vh;
          background: #3b82f6;
        }

        .tab-button:hover:not(.active) {
          background: #f8f9fa;
          color: #495057;
        }

        .signature-pad {
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          gap: 0.5vw;
          flex-wrap: wrap;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          padding: 1vh 1vw;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1.5vh;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toolbar-button:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .toolbar-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-label {
          display: block;
          margin-bottom: 0.8vh;
          font-weight: 500;
          font-size: 1.7vh;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 1.2vh 1.5vh;
          border: 1px solid #d1d5db;
          border-radius: 0.6vh;
          font-size: 1.8vh;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Font grid styles */
        .signature-style .font-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5vh;
          justify-content: space-evenly;
          overflow: hidden;
          padding: 1vh 0;
        }

        .font-preview {
          flex: 0 0 12vw;
          padding: 1.5vh 1vh;
          text-align: center;
          border: 1px solid #d1d5db;
          border-radius: 0.6vh;
          background: white;
          cursor: pointer;
          font-size: 2.2vh;
          white-space: nowrap;
          overflow: hidden;
          overflow-wrap: normal;
          word-break: keep-all;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .font-preview.selected {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }

        .font-preview:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .font-preview.selected {
          border-color: #3b82f6;
          background-color: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .tab-button {
            font-size: 1.8vh;
          }

          .font-preview {
            flex: 0 0 30vw;
            font-size: 1.8vh;
            padding: 1.2vh 0.8vh;
          }
        }
      `}</style>
    </div>
  );
}
