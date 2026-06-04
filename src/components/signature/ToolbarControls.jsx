import React from "react";
import { MousePointer, PenTool, Type, CheckSquare, Calendar, ZoomIn, ZoomOut, Palette, Circle } from "lucide-react";

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
const PEN_SIZES = Array.from({ length: 10 }, (_, i) => i + 1);
const PEN_COLORS = ["#000000", "#0066cc", "#cc0000", "#006600", "#663399"];
const SELECTED_BG = "bg-[#0d3791] text-white";
const DEFAULT_BG = "bg-white text-gray-700 hover:bg-gray-100";

export function ToolbarControls({
  selectedTool,
  onToolChange,
  zoom,
  onZoomChange,
  penSize,
  penColor,
  onPenSizeChange,
  onPenColorChange,
  currentSignature,
  onToggleSignaturePanel,
  showSignaturePanel = false,
}) {
  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) onZoomChange(ZOOM_LEVELS[idx + 1]);
  };
  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) onZoomChange(ZOOM_LEVELS[idx - 1]);
  };

  const toolButton = (tool, Icon) => (
    <button
      onClick={() => onToolChange(tool)}
      className={`relative p-2 rounded transition-colors duration-200 ${
        selectedTool === tool ? SELECTED_BG : "hover:bg-gray-200 hover:text-black"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="border rounded-lg bg-white p-2 w-full overflow-x-auto">
      <div className="inline-flex nowrap items-center gap-2" style={{ minWidth: "100%" }}>
        {toolButton("select", MousePointer)}
        {toolButton("signature", PenTool)}
        {toolButton("text", Type)}
        {toolButton("checkbox", CheckSquare)}
        {toolButton("date", Calendar)}
        <div className="h-6 border-l" />
        {/* <button
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_LEVELS[0]}
          className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <select
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          {ZOOM_LEVELS.map((z) => (
            <option key={z} value={z}>
              {z}%
            </option>
          ))}
        </select>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="h-6 border-l" /> */}
        <div className="inline-flex items-center gap-4">
          <div className="inline-flex items-center gap-1">
            <span className="text-sm text-gray-600">Size:</span>
            <select
              value={penSize}
              onChange={(e) => onPenSizeChange(parseInt(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {PEN_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-600">Color:</span>
            <div className="relative w-5 h-5">
              <button className="w-5 h-5 rounded border-1 border-gray-500" style={{ backgroundColor: penColor }} />
              <input
                type="color"
                value={penColor}
                onChange={(e) => onPenColorChange(e.target.value)}
                className="absolute top-0 left-0 w-5 h-5 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="h-6 border-l" />
        <button
          onClick={onToggleSignaturePanel}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded border transition-colors duration-200 ${
            showSignaturePanel
              ? "bg-[#0d3791] text-white border-blue-500 hover:bg-blue-600"
              : "border border-input bg-background text-foreground hover:[background-color:#e9e9e9] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          }`}
        >
          <Palette className="h-4 w-4" />
          {showSignaturePanel ? "Close Panel" : "Create Signature"}
        </button>
        {/* <div className="h-6 border-l" /> */}
        {selectedTool ? (
          <div className="inline-flex d-none d-lg-inline-flex my-auto ml-auto px-2 py-1 border rounded text-xs capitalize">
            {selectedTool}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
