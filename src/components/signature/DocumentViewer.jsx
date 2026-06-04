import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FaArrowsAlt, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { formatDateToET } from "../../helpers/StrHelpers";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export function DocumentViewer({
  documentContent,
  zoom,
  onPageChange,
  fields,
  onAddField,
  onUpdateField,
  onRemoveField,
  selectedTool,
  currentSignature,
  onToolChange,
  uiState,
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef({});
  const containerRef = useRef(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const fieldInputRefs = useRef({});
  const penColor = uiState?.penColor || "#000000";

  const isSelectTool = selectedTool === "select";
  const scale = zoom / 100;

  const handleDocumentLoad = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  useEffect(() => {
    if (!numPages) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const page = Number(entry.target.dataset.page);
            if (currentPage !== page) {
              setCurrentPage(page);
              onPageChange(page);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    Object.values(pageRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [numPages, currentPage, onPageChange]);

  useEffect(() => {
    if (selectedFieldId) {
      const field = fields.find((f) => f.id === selectedFieldId);
      if (field && (field.type === "text" || field.type === "date")) {
        const el = fieldInputRefs.current[selectedFieldId];
        if (el) {
          requestAnimationFrame(() => {
            try {
              el.focus();
              if (field.type === "text") {
                const len = el.value ? el.value.length : 0;
                if (el.setSelectionRange) el.setSelectionRange(len, len);
              }
            } catch {}
          });
        }
      }
    }
  }, [selectedFieldId, fields]);

  useEffect(() => {
    if (selectedFieldId && !fields.find((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(null);
    }
  }, [fields, selectedFieldId]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setSelectedFieldId(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleFieldDrag = useCallback(
    (id, data) => {
      onUpdateField(id, { position: { x: data.x, y: data.y } });
    },
    [onUpdateField]
  );

  const handleFieldValueChange = useCallback(
    (id, value) => {
      onUpdateField(id, { value });
    },
    [onUpdateField]
  );

  const handleResizeStart = (e, fieldId, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const field = fields.find((f) => f.id === fieldId);

    const initialSize = { ...field.size };
    const initialPosition = { ...field.position };
    const aspectRatio = initialSize.width / initialSize.height;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialPosition.x;
      let newY = initialPosition.y;

      let sizeDelta;
      if (direction === "se" || direction === "ne" || direction === "sw" || direction === "nw") {
        sizeDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      }

      switch (direction) {
        case "se":
          newWidth = Math.max(20, initialSize.width + sizeDelta);
          newHeight = newWidth / aspectRatio;
          break;
        case "sw":
          newWidth = Math.max(20, initialSize.width - sizeDelta);
          newHeight = newWidth / aspectRatio;
          newX = initialPosition.x + (initialSize.width - newWidth);
          break;
        case "ne":
          newWidth = Math.max(20, initialSize.width + sizeDelta);
          newHeight = newWidth / aspectRatio;
          newY = initialPosition.y + (initialSize.height - newHeight);
          break;
        case "nw":
          newWidth = Math.max(20, initialSize.width - sizeDelta);
          newHeight = newWidth / aspectRatio;
          newX = initialPosition.x + (initialSize.width - newWidth);
          newY = initialPosition.y + (initialSize.height - newHeight);
          break;
      }

      onUpdateField(fieldId, {
        size: { width: newWidth, height: newHeight },
        position: { x: newX, y: newY },
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleCornerMoveStart = (e, fieldId) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const field = fields.find((f) => f.id === fieldId);
    const initialPos = { ...field.position };

    const onMouseMove = (mv) => {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      onUpdateField(fieldId, { position: { x: initialPos.x + dx, y: initialPos.y + dy } });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const selectField = useCallback(
    (e, id, page) => {
      if (isSelectTool) {
        e.stopPropagation();
        setSelectedFieldId(id);
        return;
      }

      const pageNode = pageRefs.current[page];
      let doc_id = Date.now().toString();

      if (!pageNode) {
        onAddField(selectedTool, { x: 0, y: 0, page }, doc_id);
        onToolChange("select");
        return;
      }

      const crosshair = pageNode.querySelector && pageNode.querySelector(".relative.cursor-crosshair");
      const rect = (crosshair && crosshair.getBoundingClientRect()) || pageNode.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      onAddField(selectedTool, { x, y, page }, doc_id);
      setSelectedFieldId(doc_id);
      onToolChange("select");
    },
    [isSelectTool, onAddField, onToolChange, scale, selectedTool]
  );

  const renderFieldContent = (field, isSelected) => {
    if (field.type === "signature") {
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={(ev) => {
            ev.stopPropagation();
            if (!field.value && currentSignature) {
              onUpdateField(field.id, { value: currentSignature });
            }
            if (!isSelected) {
              setSelectedFieldId(field.id);
            }
          }}
        >
          {field.value ? (
            <img
              src={field.value}
              alt="signature"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          ) : (
            <span className="text-xs text-blue-600">Click to add signature</span>
          )}
        </div>
      );
    }

    if (field.type === "text") {
      if (isSelected && !field.locked) {
        return (
          <input
            ref={(el) => (fieldInputRefs.current[field.id] = el)}
            type="text"
            placeholder="Write here..."
            value={field.value || ""}
            onChange={(e) => {
              handleFieldValueChange(field.id, e.target.value);
              e.target.style.width = `${Math.max(e.target.value.length * 8, 70)}px`;
            }}
            style={{ color: penColor, fontSize: "12px", width: `${Math.max((field.value?.length || 0) * 8, 70)}px` }}
            className="h-full border-0 outline-0 bg-transparent text-sm p-0"
            onMouseDown={(e) => {
              if (isSelectTool) e.stopPropagation();
            }}
          />
        );
      } else {
        return (
          <div
            className="h-full flex items-center"
            style={{ color: penColor, fontSize: "12px", width: `${Math.max((field.value?.length || 4) * 8, 70)}px` }}
          >
            {field.value || <span className="text-gray-700">Write here...</span>}
          </div>
        );
      }
    }

    if (field.type === "checkbox") {
      if (isSelected && !field.locked) {
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            onMouseDown={(e) => {
              if (isSelectTool) e.stopPropagation();
            }}
          >
            <input
              style={{ height: "20px", width: "20px" }}
              type="checkbox"
              checked={field.value === "true"}
              onChange={(e) => handleFieldValueChange(field.id, e.target.checked ? "true" : "false")}
            />
          </div>
        );
      } else {
        return (
          <div style={{ fontSize: "20px" }} className="w-full h-full flex items-center justify-center">
            {field.value === "true" ? "☑" : "☐"}
          </div>
        );
      }
    }

    if (field.type === "date") {
      if (isSelected && !field.locked) {
        return (
          <div style={{ color: penColor, fontSize: "12px", display: "contents" }}>
            <DatePicker
              showIcon
              maxDate={"2099"}
              toggleCalendarOnIconClick
              calendarIconClassName="calenderIconRight"
              ref={(el) => (fieldInputRefs.current[field.id] = el)}
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={50}
              selected={field.value || ""}
              onChange={(date) => {
                if (date) {
                  const formatted = formatDateToET(date);
                  handleFieldValueChange(field.id, formatted);
                } else {
                  handleFieldValueChange(field.id, null);
                }
              }}
              dateFormat="MM/dd/yyyy"
              className="border-0 outline-0 bg-transparent p-0"
              placeholderText={field.placeholder || "MM/DD/YYYY"}
            />
          </div>
        );
      } else {
        return (
          <div style={{ color: penColor, fontSize: "12px" }} className="nowrap w-full h-full flex items-center">
            {field.value || <span className="text-gray-400">Date</span>}
          </div>
        );
      }
    }

    return <div className="w-full h-full" />;
  };

  const renderField = (field, page) => {
    let isSignature = field.type == "signature";
    let isDate = field.type == "date";
    if (field.page !== page) return null;
    const isSelected = selectedFieldId === field.id;

    let baseStyle = { height: field.size.height };

    if (isDate) {
      baseStyle = {
        width: field.size.width,
        height: field.size.height,
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "center",
      };
    }

    if (isSignature) {
      baseStyle = {
        width: field.size.width,
        height: field.size.height,
        padding: 0,
        margin: 0,
      };
    }

    const wrapper = (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => selectField(e, field.id, page)}
        style={{ ...baseStyle, zIndex: isSelected ? 999 : 10 }}
        className={`absolute ${isSelected && !field.locked ? "ring-2 ring-gray-300 rounded-sm" : ""} ${
          field.required && !field.value ? "opacity-90" : ""
        }`}
      >
        {renderFieldContent(field, isSelected)}

        {isSelected && (
          <>
            {!field.locked && isSignature && (
              <div className="absolute inset-0 pointer-events-none">
                {["nw", "ne", "sw", "se"].map((dir) => (
                  <div
                    key={dir}
                    className="absolute w-4 h-4 rounded-full border bg-gray-200 pointer-events-auto resize-handle"
                    style={{
                      cursor: `${dir}-resize`,
                      ...(dir === "nw" && { top: "-0.5rem", left: "-0.5rem" }),
                      ...(dir === "ne" && { top: "-0.5rem", right: "-0.5rem" }),
                      ...(dir === "sw" && { bottom: "-0.5rem", left: "-0.5rem" }),
                      ...(dir === "se" && { bottom: "-0.5rem", right: "-0.5rem" }),
                    }}
                    onMouseDown={(e) => handleResizeStart(e, field.id, dir)}
                  />
                ))}
              </div>
            )}

            <div
              style={
                isDate
                  ? {
                      zIndex: 0,
                    }
                  : {}
              }
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-30"
            >
              {field.locked ? (
                <div
                  className="bg-yellow-500 rounded-md p-1 text-white shadow-md cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onUpdateField(field.id, { locked: false });
                  }}
                >
                  <FaUnlock />
                </div>
              ) : (
                <>
                  <div
                    className="bg-blue-500 rounded-md p-1 text-white shadow-md cursor-move"
                    onMouseDown={(e) => handleCornerMoveStart(e, field.id)}
                  >
                    <FaArrowsAlt />
                  </div>
                  <div
                    className="bg-red-500 rounded-md p-1 text-white shadow-md cursor-pointer"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onRemoveField(field.id);
                      setSelectedFieldId(null);
                    }}
                  >
                    <FaTrash />
                  </div>
                  <div
                    className="bg-gray-500 rounded-md p-1 text-white shadow-md cursor-pointer"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onUpdateField(field.id, { locked: true });
                      setSelectedFieldId(null);
                    }}
                  >
                    <FaLock />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {field.required && !field.value && (
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </div>
    );

    if (isSelected && !field.locked) {
      return (
        <Draggable
          key={field.id}
          position={field.position}
          onStop={(_, d) => handleFieldDrag(field.id, d)}
          bounds="parent"
          cancel=".resize-handle,input,button,svg"
        >
          {wrapper}
        </Draggable>
      );
    } else {
      return (
        <div
          key={field.id}
          style={{ left: field.position.x, top: field.position.y, position: "absolute" }}
          onMouseDown={(e) => selectField(e, field.id, page)}
        >
          {wrapper}
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100" ref={containerRef}>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Document file={`data:application/pdf;base64,${documentContent}`} onLoadSuccess={handleDocumentLoad}>
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i + 1}
                    ref={(el) => (pageRefs.current[i + 1] = el)}
                    data-page={i + 1}
                    className={`relative ${numPages > 1 && i + 1 !== numPages ? "mb-4" : ""}`}
                  >
                    <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      Page {i + 1}
                    </div>
                    <div
                      className="relative cursor-crosshair"
                      onClick={(e) => {
                        if (isSelectTool) {
                          setSelectedFieldId(null);
                          return;
                        }
                        let doc_id = Date.now().toString();
                        const r = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - r.left) / scale;
                        const y = (e.clientY - r.top) / scale;
                        onAddField(selectedTool, { x, y, page: i + 1 }, doc_id);
                        onToolChange("select");
                        setSelectedFieldId(doc_id);
                      }}
                    >
                      <Page pageNumber={i + 1} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="relative w-full h-full pointer-events-auto">
                          {fields.map((f) => renderField(f, i + 1))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Document>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
