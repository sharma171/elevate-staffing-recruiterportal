import { useEffect, useRef, useState } from "react";
import OverlayModal from "./OverlayModal";
import axios from "axios";
import ThemeLoader from "./ThemeLoader";

function PDFEditorApp({ pdfBase64, onSave, title = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!pdfBase64) return;

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Parisienne&family=Sacramento&family=Pacifico&family=Cedarville+Cursive&family=Homemade+Apple&family=Marck+Script&family=Nothing+You+Could+Do&family=Kalam:wght@300;400;700&family=Indie+Flower&family=Shadows+Into+Light&family=Caveat:wght@400;700&family=Gochi+Hand&family=Covered+By+Your+Grace&family=Patrick+Hand&family=Alex+Brush&family=Allura&family=Cookie&family=Tangerine:wght@700&family=Bad+Script&family=Calligraffitti&family=Meddon&family=Mr+Bedfort&family=Mr+Dafoe&family=Mrs+Saint+Delafield&family=Qwigley&family=Reenie+Beanie&family=Rochester&family=Rock+Salt&family=Satisfy&family=Sedgwick+Ave+Display&family=Zeyada&display=swap" rel="stylesheet">
    <style>
      :root {
        --sidebar-width: 260px;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Inter", sans-serif;
        overflow: hidden;
        background-color: #f5f7fa;
      }

      .toolbar-btn {
        background: white;
        color: #4b5563;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        cursor: pointer;
      }
      
      .actionButtons {
        min-height: 32px;
        min-width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      
      .toolbar-btn i {
        font-size: 14px;
      }

      .toolbar-btn:hover {
        background: #f3f4f6;
        color: #3b82f6;
      }

      .toolbar-btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
      
      .toolbar-btn.active:hover {
        background: #2563eb;
      }

      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
        
      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Hide scrollbars during drag */
      .no-scroll {
        overflow: hidden !important;
      }

      /* Sidebar styles */
      .object-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        border-bottom: 1px solid #e5e7eb;
        transition: all 0.2s;
        cursor: pointer;
        font-size: 13px;
      }

      .object-item:hover {
        background-color: #f9fafb;
      }

      .object-item.selected {
        background-color: #dbeafe;
        border-left: 3px solid #3b82f6;
        padding-left: 7px;
      }

      .object-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        overflow: hidden;
      }

      .object-icon {
        font-size: 14px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: #e0f2fe;
        color: #0ea5e9;
      }

      .drawing-icon { background: #dcfce7; color: #22c55e; }
      .rect-icon { background: #ede9fe; color: #8b5cf6; }
      .circle-icon { background: #fce7f3; color: #ec4899; }
      .image-icon { background: #ffedd5; color: #f97316; }
      .signature-icon { background: #fef3c7; color: #f59e0b; }

      .object-preview {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        font-size: 13px;
      }
      
      .layer-controls button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .sidebar {
        width: var(--sidebar-width);
        background-color: white;
        border-left: 1px solid #e5e7eb;
        overflow-y: auto;
        transition: all 0.3s ease;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
      }

      .sidebar-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        font-size: 15px;
        background-color: #f9fafb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .sidebar-content {
        flex: 1;
        overflow-y: auto;
      }

      .empty-state {
        text-align: center;
        padding: 25px 15px;
        color: #9ca3af;
        font-size: 14px;
      }

      .empty-state i {
        font-size: 24px;
        margin-bottom: 10px;
      }

      #toggle-sidebar {
        position: fixed;
        top: 50%;
        right: calc(var(--sidebar-width) + 15px);
        transform: translateY(-50%);
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        z-index: 10;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .sidebar-hidden {
        transform: translateX(100%);
      }

      /* Edit panel */
      .edit-panel {
        padding: 14px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .edit-panel h4 { margin-bottom: 10px; font-size: 15px; color: #1e293b; }
      .edit-input { width: 100%; padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 10px; background-color: white; font-size: 14px; }
      .edit-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
      
      .editor-container { position: relative; flex: 1; display: flex; overflow: hidden; }

      #pdf-viewer { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 15px; overflow: auto; transition: overflow 0.3s ease; background-color: #f1f5f9; }

      .pdf-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; max-width: 500px; text-align: center; margin: auto; color: #64748b; }
      .pdf-placeholder i { font-size: 70px; color: #e2e8f0; margin-bottom: 15px; }

      .drag-indicator { position: fixed; top: 10px; right: 10px; background: rgba(59, 130, 246, 0.9); color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; z-index: 1000; display: none; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      
      /* Save/Download button states */
      .btn-processing { background-color: #3b82f6 !important; }
      .btn-success { background-color: #10b981 !important; animation: pulse 1s ease-in-out; }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.03); }
        100% { transform: scale(1); }
      }
      
      .compact-control { padding: 5px 8px; border-radius: 6px; font-size: 13px; }
      .toolbar-section { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
      .toolbar-label { font-size: 13px; color: #475569; font-weight: 500; }
      .toolbar-divider { height: 24px; width: 1px; background: #e2e8f0; margin: 0 5px; }
      
      .signature-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; }
      .modal-content { background: white; border-radius: 10px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
      .modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-top-left-radius: 10px; border-top-right-radius: 10px; }
      .modal-title { font-size: 18px; font-weight: 600; color: #1e293b; }
      .close-modal { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
      .modal-body { padding: 20px; }
      
      .signature-tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; flex-wrap: wrap; }
      .tab-btn { padding: 10px 15px; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s; }
      .tab-btn.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; }
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      .signature-option { margin-bottom: 25px; }
      .option-title { font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #1e293b; }
      
      .upload-container { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 25px; text-align: center; cursor: pointer; transition: all 0.3s; background: #f8fafc; }
      .upload-container:hover { border-color: #3b82f6; background: #f0f9ff; }
      .upload-icon { font-size: 40px; color: #94a3b8; margin-bottom: 10px; }
      .upload-text { font-size: 14px; color: #64748b; margin-bottom: 15px; }
      .upload-btn { background: #3b82f6; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
      .upload-btn:hover { background: #2563eb; }
      
      .preview-container { margin-top: 20px; text-align: center; display: none; }
      .preview-container.active { display: block; }
      .preview-title { font-size: 14px; margin-bottom: 10px; color: #64748b; }
      .preview-image { max-width: 100%; max-height: 150px; border: 1px solid #e2e8f0; border-radius: 6px; }
      
      .drawing-container { margin-top: 20px; }
      .drawing-tools { display: flex; gap: 10px; margin-bottom: 15px; }
      .tool-btn { padding: 8px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
      .tool-btn.active { background: #dbeafe; border-color: #3b82f6; color: #3b82f6; }
      .drawing-canvas { border: 2px solid #e2e8f0; border-radius: 8px; background: white; width: 100%; height: 200px; cursor: crosshair; touch-action: none; }
      
      .text-input-container { margin-bottom: 15px; }
      .text-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 16px; }
      
      /* Font grid styles */
      .font-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-bottom: 15px; }
      .font-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; cursor: pointer; text-align: center; transition: all 0.2s; background: white; height: 70px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .font-box:hover { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
      .font-box.active { border-color: #3b82f6; background-color: #dbeafe; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
      .font-box .font-preview { font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
      
      .preview-signature { margin-top: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; font-size: 28px; min-height: 100px; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
      
      .signature-list { display: grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
      .signature-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.2s; text-align: center; display: flex; flex-direction: column; justify-content: space-between; }
      .signature-item:hover { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
      .signature-image { max-width: 100%; max-height: 80px; margin-bottom: 10px; object-fit: contain; }
      .signature-name { font-size: 12px; color: #64748b; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .signature-actions { display: flex; justify-content: space-between; margin-top: 15px; }
      .signature-action-btn { padding: 8px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
      .signature-action-btn:hover { background: #e2e8f0; }
      .signature-action-btn.delete { color: #ef4444; }
      .signature-action-btn.delete:hover { background: #fee2e2; }
      
      .modal-footer { padding: 15px 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .modal-btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
      .modal-btn.cancel { background: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; }
      .modal-btn.cancel:hover { background: #e2e8f0; }
      .modal-btn.apply { background: #3b82f6; color: white; border: none; }
      .modal-btn.apply:hover { background: #2563eb; }
      .save-checkbox { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-gray-100 text-gray-800">
    <div class="flex flex-col h-screen">
      <!-- Header and Toolbar -->
      <header class="bg-white shadow-sm p-3 sticky top-0 z-10">
        <div class="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-4" title="${title}">
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-file-signature text-blue-600"></i>
              <div style="max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: inline-block; font-size: 15px;">
                ${title}
              </div>
            </h2>
          </div>

          <div id="pdf-controls" class="flex items-center gap-4 hidden">
            <div class="flex items-center gap-2" id="paginations">
              <button id="prev-page" class="toolbar-btn actionButtons" title="Previous Page"><i class="fas fa-arrow-left"></i></button>
              <span id="page-num" class="text-sm font-medium w-24 text-center"></span>
              <button id="next-page" class="toolbar-btn actionButtons" title="Next Page"><i class="fas fa-arrow-right"></i></button>
            </div>
            <button id="sign-btn" class="toolbar-btn bg-yellow-500 text-white hover:bg-yellow-600">
              <i class="fas fa-signature mr-2"></i> Sign
            </button>
            <button id="save-btn" class="toolbar-btn bg-green-600 text-white hover:bg-green-700">
              <i class="fas fa-paperclip mr-2"></i> Attach File
            </button>
            <button id="download-btn" class="toolbar-btn bg-blue-600 text-white hover:bg-blue-700">
              <i class="fas fa-download mr-2"></i> Download
            </button>
          </div>
        </div>
        
        <div id="editor-tools" class="flex flex-wrap mx-auto items-center mt-2 gap-2 hidden justify-center">
          <button id="select-btn" class="toolbar-btn actionButtons" title="Select (V)"><i class="fas fa-mouse-pointer"></i></button>
          <button id="pan-btn" class="toolbar-btn actionButtons" title="Pan (H)"><i class="fas fa-hand-paper"></i></button>
          <div class="toolbar-divider"></div>
          <button id="draw-btn" class="toolbar-btn actionButtons" title="Draw (P)"><i class="fas fa-pencil-alt"></i></button>
          <button id="text-btn" class="toolbar-btn actionButtons" title="Add Text (T)"><i class="fas fa-font"></i></button>
          <div class="toolbar-divider"></div>
          <button id="rect-btn" class="toolbar-btn actionButtons" title="Rectangle (R)"><i class="far fa-square"></i></button>
          <button id="circle-btn" class="toolbar-btn actionButtons" title="Circle (C)"><i class="far fa-circle"></i></button>
          <button id="image-btn" class="toolbar-btn actionButtons" title="Add Image (I)"><i class="fas fa-image"></i></button>
          <div class="toolbar-divider"></div>
          <div class="flex items-center gap-2 compact-control">
            <label for="color-picker" class="toolbar-label">Color:</label>
            <input type="color" id="color-picker" value="#000000ff" class="w-5 h-5 rounded border-none cursor-pointer" title="Stroke Color" />
          </div>
          <div class="flex items-center gap-2 compact-control">
            <label for="brush-size" class="toolbar-label">Size:</label>
            <input type="range" id="brush-size" min="1" max="50" value="5" class="w-20 cursor-pointer" />
          </div>
          <div class="toolbar-divider"></div>
          <button id="delete-btn" class="toolbar-btn actionButtons" title="Delete (Del/Backspace)"><i class="fas fa-trash"></i></button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="editor-container flex-1">
        <main id="main-content" class="flex-grow overflow-auto">
          <div class="drag-indicator" id="drag-indicator"><i class="fas fa-arrows-alt mr-2"></i> Dragging Object</div>
          <div id="pdf-viewer" class="relative">
            <div class="pdf-placeholder">
              <i class="fas fa-file-pdf"></i>
              <h2 class="text-xl font-semibold">Loading PDF Editor...</h2>
              <p class="mt-2 text-gray-600">Your file remains on your device. Nothing is uploaded to a server.</p>
            </div>
            <div id="loader" class="loader hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div id="canvas-container" class="hidden mx-auto shadow-md bg-white">
              <canvas id="fabric-canvas"></canvas>
            </div>
          </div>
        </main>
        <!-- Object Management Sidebar -->
        <aside id="objects-sidebar" class="sidebar">
          <div class="sidebar-header">
            <span>Page Assets</span>
          </div>
          <div id="objects-list" class="sidebar-content">
            <div class="empty-state">
              <i class="fas fa-layer-group"></i>
              <p>No objects on this page</p>
              <p class="mt-2 text-xs">Draw or add text to see assets here.</p>
            </div>
          </div>
          <div id="edit-panel" class="edit-panel hidden">
            <h4>Edit Text</h4>
            <input type="text" id="text-content" class="edit-input" placeholder="Edit text content..." />
            <div class="flex items-center gap-3 mb-2">
              <button id="font-bold" class="toolbar-btn actionButtons px-2" title="Bold"><i class="fas fa-bold"></i></button>
              <button id="font-italic" class="toolbar-btn actionButtons px-2" title="Italic"><i class="fas fa-italic"></i></button>
              <input type="color" id="text-color" title="Text Color" value="#000000" class="h-7 w-7 cursor-pointer" />
            </div>
             <div class="flex items-center gap-3">
              <span class="text-sm font-medium">Size:</span>
              <input type="range" id="text-size" min="10" max="120" value="24" class="flex-1 cursor-pointer" />
            </div>
          </div>
        </aside>

        <button id="toggle-sidebar" title="Toggle Sidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <!-- Signature Modal -->
    <div id="signature-modal" class="signature-modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Add Signature</h3>
          <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="signature-tabs">
            <button class="tab-btn active" data-tab="upload-tab">Upload</button>
            <button class="tab-btn" data-tab="draw-tab">Draw</button>
            <button class="tab-btn" data-tab="type-tab">Type</button>
            <button class="tab-btn" data-tab="saved-tab">Saved</button>
          </div>
          
          <div id="upload-tab" class="tab-content active">
             <h4 class="option-title">Upload Signature Image</h4>
             <div class="upload-container" id="upload-container">
                <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                <p class="upload-text">Drag & drop your image or click to browse</p>
                <button class="upload-btn">Choose File</button>
                <input type="file" id="signature-upload" accept="image/*" class="hidden" />
              </div>
              <div class="preview-container" id="image-preview-container">
                <p class="preview-title">Signature Preview:</p>
                <img class="preview-image" id="signature-preview" />
              </div>
          </div>
          
          <div id="draw-tab" class="tab-content">
              <h4 class="option-title">Draw Your Signature</h4>
              <div class="drawing-container">
                <div class="drawing-tools">
                  <button class="tool-btn pen active" data-tool="pen"><i class="fas fa-pencil-alt"></i> Pen</button>
                  <button class="tool-btn eraser" data-tool="eraser"><i class="fas fa-eraser"></i> Eraser</button>
                  <button class="tool-btn" id="clear-drawing"><i class="fas fa-trash"></i> Clear</button>
                </div>
                <canvas id="drawing-canvas" class="drawing-canvas"></canvas>
              </div>
          </div>
          
          <div id="type-tab" class="tab-content">
              <h4 class="option-title">Type Your Signature</h4>
              <div class="text-input-container">
                <input type="text" class="text-input" id="signature-text" placeholder="Enter your name" />
              </div>
              <div class="option-title">Signature Style</div>
              <div class="font-grid" id="font-grid"></div>
              <select class="font-select hidden" id="signature-font"></select>
              <div class="preview-signature" id="text-preview">Signature Preview</div>
          </div>
          
          <div id="saved-tab" class="tab-content">
            <div class="signature-list" id="saved-signatures"></div>
            <div class="empty-state text-center py-10 text-gray-500 hidden" id="no-signatures">
              <i class="fas fa-signature text-4xl mb-3"></i>
              <p>No saved signatures</p>
              <p class="mt-2 text-xs">Create a new signature and check "Save for future use" to see it here.</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
           <div class="save-checkbox">
            <input type="checkbox" id="save-signature" />
            <label for="save-signature">Save this signature for future use</label>
          </div>
          <div>
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn apply">Apply Signature</button>
          </div>
        </div>
      </div>
    </div>
    
    <script type="module">
      // --- Constants ---
      const DEFAULT_SCALE = 1.5;
      const LOCAL_STORAGE_KEY = 'signatures';
      const MIN_SHAPE_SIZE = 5;

      // --- PDF.js and jsPDF setup ---
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      const { jsPDF } = window.jspdf;
      
      // --- DOM Element References ---
      const loader = document.getElementById("loader"),
        canvasContainer = document.getElementById("canvas-container"),
        editorTools = document.getElementById("editor-tools"),
        pdfControls = document.getElementById("pdf-controls"),
        paginations = document.getElementById("paginations"),
        prevPageBtn = document.getElementById("prev-page"),
        nextPageBtn = document.getElementById("next-page"),
        pageNumSpan = document.getElementById("page-num"),
        saveBtn = document.getElementById("save-btn"),
        downloadBtn = document.getElementById("download-btn"),
        signBtn = document.getElementById("sign-btn"),
        selectBtn = document.getElementById("select-btn"),
        panBtn = document.getElementById("pan-btn"),
        drawBtn = document.getElementById("draw-btn"),
        textBtn = document.getElementById("text-btn"),
        rectBtn = document.getElementById("rect-btn"),
        circleBtn = document.getElementById("circle-btn"),
        imageBtn = document.getElementById("image-btn"),
        colorPicker = document.getElementById("color-picker"),
        brushSize = document.getElementById("brush-size"),
        deleteBtn = document.getElementById("delete-btn"),
        objectsSidebar = document.getElementById("objects-sidebar"),
        objectsList = document.getElementById("objects-list"),
        toggleSidebarBtn = document.getElementById("toggle-sidebar"),
        editPanel = document.getElementById("edit-panel"),
        textContentInput = document.getElementById("text-content"),
        textColorInput = document.getElementById("text-color"),
        textSizeInput = document.getElementById("text-size"),
        fontBoldBtn = document.getElementById("font-bold"),
        fontItalicBtn = document.getElementById("font-italic"),
        placeholder = document.querySelector(".pdf-placeholder"),
        dragIndicator = document.getElementById("drag-indicator"),
        pdfViewer = document.getElementById("pdf-viewer"),
        signatureModal = document.getElementById("signature-modal"),
        closeModalBtn = document.querySelector(".close-modal"),
        cancelModalBtn = document.querySelector(".modal-btn.cancel"),
        applyModalBtn = document.querySelector(".modal-btn.apply"),
        tabBtns = document.querySelectorAll(".tab-btn"),
        uploadContainer = document.getElementById("upload-container"),
        signatureUpload = document.getElementById("signature-upload"),
        signaturePreview = document.getElementById("signature-preview"),
        imagePreviewContainer = document.getElementById("image-preview-container"),
        drawingCanvas = document.getElementById("drawing-canvas"),
        penToolBtn = document.querySelector(".tool-btn.pen"),
        eraserToolBtn = document.querySelector(".tool-btn.eraser"),
        clearDrawingBtn = document.getElementById("clear-drawing"),
        signatureTextInput = document.getElementById("signature-text"),
        signatureFontSelect = document.getElementById("signature-font"),
        textPreview = document.getElementById("text-preview"),
        savedSignaturesContainer = document.getElementById("saved-signatures"),
        noSignaturesElem = document.getElementById("no-signatures"),
        uploadTab = document.getElementById("upload-tab"),
        drawTab = document.getElementById("draw-tab"),
        typeTab = document.getElementById("type-tab"),
        savedTab = document.getElementById("saved-tab"),
        saveCheckbox = document.getElementById("save-signature"),
        fontGrid = document.getElementById("font-grid");
        
      // --- State Variables ---
      let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null;
      let fabricCanvas = null, currentMode = "", pageAnnotations = {};
      let isPanning = false, lastPanPoint = { x: 0, y: 0 };
      let selectedObject = null, objectsMap = new Map(), nextObjectId = 1;
      let shapeBeingDrawn = null, startPoint = null;
      let isDraggingObject = false;
      
      // Signature state
      let signatures = [];
      let currentSignatureType = "upload";
      let currentSignatureData = null;
      let currentTool = "pen";
      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;
      let ctx = drawingCanvas.getContext("2d");
      
      // --- Initialization ---
      fabricCanvas = new fabric.Canvas("fabric-canvas", { enableRetinaScaling: true, imageSmoothingEnabled: true });
      
      function setupDrawingCanvas() {
        drawingCanvas.width = drawingCanvas.offsetWidth;
        drawingCanvas.height = drawingCanvas.offsetHeight;
        ctx = drawingCanvas.getContext("2d");
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      }
      setupDrawingCanvas();

      // --- Core Functions: PDF Rendering & Page Navigation ---
      const renderPage = async (num) => {
        pageRendering = true;
        loader.classList.remove("hidden");
        canvasContainer.classList.add("hidden");
        placeholder.classList.add("hidden");

        try {
          const page = await pdfDoc.getPage(num);
          const viewport = page.getViewport({ scale: DEFAULT_SCALE });
          const tempCanvas = document.createElement("canvas");
          tempCanvas.height = viewport.height;
          tempCanvas.width = viewport.width;
          await page.render({ canvasContext: tempCanvas.getContext("2d"), viewport }).promise;

          fabricCanvas.setDimensions({ width: viewport.width, height: viewport.height });
          fabricCanvas.loadFromJSON(pageAnnotations[num] || { objects: [] }, () => {
            fabricCanvas.setBackgroundImage(new fabric.Image(tempCanvas, { crossOrigin: 'anonymous' }), fabricCanvas.renderAll.bind(fabricCanvas));
            objectsMap.clear();
            fabricCanvas.getObjects().forEach(obj => { if (obj.objectId) objectsMap.set(obj, obj.objectId); });
            updateObjectsList();
          });
          
          paginations.style.display = pdfDoc.numPages <= 1 ? 'none' : 'flex';
          pageNumSpan.textContent = \`Page \${num} of \${pdfDoc.numPages}\`;
          prevPageBtn.disabled = num <= 1;
          nextPageBtn.disabled = num >= pdfDoc.numPages;
        } catch (error) {
          console.error("Error rendering page:", error);
          placeholder.classList.remove("hidden");
        } finally {
          pageRendering = false;
          loader.classList.add("hidden");
          canvasContainer.classList.remove("hidden");
          if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        }
      };

      const queueRenderPage = (num) => {
        if (pageRendering) pageNumPending = num; else renderPage(num);
      };

      const saveAndChangePage = (newPageNum) => {
        if (!pdfDoc) return;
        pageAnnotations[pageNum] = fabricCanvas.toJSON(["objectId"]);
        pageNum = newPageNum;
        queueRenderPage(pageNum);
      };

      const loadPDF = async () => {
        if (!window.parentPdfBase64) return;
        placeholder.classList.add("hidden");
        loader.classList.remove("hidden");
        
        try {
          const typedarray = Uint8Array.from(atob(window.parentPdfBase64), c => c.charCodeAt(0));
          pdfDoc = await pdfjsLib.getDocument({ data: typedarray, cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/cmaps/", cMapPacked: true }).promise;
          editorTools.classList.remove("hidden");
          pdfControls.classList.remove("hidden");
          setMode("select");
          renderPage(1);
        } catch (error) {
          console.error("Error loading PDF:", error);
          loader.classList.add("hidden");
          placeholder.classList.remove("hidden");
        }
      };
      window.addEventListener('DOMContentLoaded', loadPDF);

      const setMode = (mode) => {
        currentMode = mode;
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.forEachObject(o => o.selectable = true);
        canvasContainer.style.cursor = "default";
        
        [selectBtn, panBtn, drawBtn, textBtn, rectBtn, circleBtn, imageBtn].forEach(btn => btn.classList.remove("active"));
        
        switch (mode) {
          case "select": selectBtn.classList.add("active"); break;
          case "pan":
            panBtn.classList.add("active");
            canvasContainer.style.cursor = "grab";
            fabricCanvas.selection = false;
            fabricCanvas.forEachObject(o => o.selectable = false);
            break;
          case "draw":
            drawBtn.classList.add("active");
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.color = colorPicker.value;
            fabricCanvas.freeDrawingBrush.width = parseInt(brushSize.value, 10);
            break;
          case "text": textBtn.classList.add("active"); canvasContainer.style.cursor = "text"; break;
          case "rectangle": rectBtn.classList.add("active"); canvasContainer.style.cursor = "crosshair"; fabricCanvas.selection = false; fabricCanvas.forEachObject(o => o.selectable = false); break;
          case "circle": circleBtn.classList.add("active"); canvasContainer.style.cursor = "crosshair"; fabricCanvas.selection = false; fabricCanvas.forEachObject(o => o.selectable = false); break;
        }
      };
      
      // --- Toolbar & Event Listeners ---
      selectBtn.addEventListener("click", () => setMode("select"));
      panBtn.addEventListener("click", () => setMode("pan"));
      drawBtn.addEventListener("click", () => setMode("draw"));
      textBtn.addEventListener("click", () => setMode("text"));
      rectBtn.addEventListener("click", () => setMode("rectangle"));
      circleBtn.addEventListener("click", () => setMode("circle"));
      
      imageBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
        input.onchange = e => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = event => {
            const pos = { x: pdfViewer.scrollLeft + pdfViewer.clientWidth / 2, y: pdfViewer.scrollTop + pdfViewer.clientHeight / 2 };
            fabric.Image.fromURL(event.target.result, img => {
              img.set({ left: pos.x, top: pos.y, scaleX: 0.5, scaleY: 0.5, objectId: nextObjectId++ });
              fabricCanvas.add(img).setActiveObject(img);
              setMode("select");
            }, { crossOrigin: 'anonymous' });
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      prevPageBtn.addEventListener("click", () => pageNum > 1 && saveAndChangePage(pageNum - 1));
      nextPageBtn.addEventListener("click", () => pageNum < pdfDoc.numPages && saveAndChangePage(pageNum + 1));

      colorPicker.addEventListener("input", e => {
        fabricCanvas.freeDrawingBrush.color = e.target.value;
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj) {
          const prop = activeObj.type.includes("text") ? "fill" : "stroke";
          activeObj.set(prop, e.target.value);
          fabricCanvas.renderAll();
        }
      });

      brushSize.addEventListener("input", e => {
        const size = parseInt(e.target.value, 10);
        fabricCanvas.freeDrawingBrush.width = size;
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj && !activeObj.type.includes("text")) {
          activeObj.set("strokeWidth", size);
          fabricCanvas.renderAll();
        }
      });

      deleteBtn.addEventListener("click", () => {
        fabricCanvas.getActiveObjects().forEach(obj => fabricCanvas.remove(obj));
        fabricCanvas.discardActiveObject().renderAll();
      });
      
      fabricCanvas.on("mouse:down", opt => {
        const ptr = fabricCanvas.getPointer(opt.e);
        if (currentMode === "pan") { isPanning = true; lastPanPoint = { x: opt.e.clientX, y: opt.e.clientY }; }
        else if (currentMode === "text" && !opt.target) {
          const text = new fabric.IText("Type here...", { left: ptr.x, top: ptr.y, fill: colorPicker.value, fontSize: 24, fontFamily: "Inter", objectId: nextObjectId++ });
          fabricCanvas.add(text).setActiveObject(text).renderAll();
          text.enterEditing(); text.selectAll();
          setMode("select");
        } else if (currentMode === "rectangle" || currentMode === "circle") {
          startPoint = ptr;
          const common = { left: ptr.x, top: ptr.y, fill: "transparent", stroke: colorPicker.value, strokeWidth: parseInt(brushSize.value, 10), objectId: nextObjectId++ };
          shapeBeingDrawn = currentMode === "rectangle" ? new fabric.Rect({ ...common, width: 0, height: 0 }) : new fabric.Circle({ ...common, radius: 0 });
          fabricCanvas.add(shapeBeingDrawn);
        }
      });

      fabricCanvas.on("mouse:move", opt => {
        if (isPanning) {
          pdfViewer.scrollLeft -= opt.e.clientX - lastPanPoint.x;
          pdfViewer.scrollTop -= opt.e.clientY - lastPanPoint.y;
          lastPanPoint = { x: opt.e.clientX, y: opt.e.clientY };
        } else if (shapeBeingDrawn) {
          const ptr = fabricCanvas.getPointer(opt.e);
          if (shapeBeingDrawn.type === "rect") {
            shapeBeingDrawn.set({ width: Math.abs(ptr.x - startPoint.x), height: Math.abs(ptr.y - startPoint.y), left: Math.min(ptr.x, startPoint.x), top: Math.min(ptr.y, startPoint.y) });
          } else { // Circle
            shapeBeingDrawn.set({ radius: Math.sqrt(Math.pow(ptr.x - startPoint.x, 2) + Math.pow(ptr.y - startPoint.y, 2)) / 2 });
          }
          fabricCanvas.renderAll();
        }
      });

      fabricCanvas.on("mouse:up", () => {
        isPanning = false;
        if (shapeBeingDrawn) {
            const isTooSmall = (shapeBeingDrawn.type === 'rect' && (shapeBeingDrawn.width < MIN_SHAPE_SIZE || shapeBeingDrawn.height < MIN_SHAPE_SIZE)) ||
                               (shapeBeingDrawn.type === 'circle' && shapeBeingDrawn.radius < MIN_SHAPE_SIZE / 2);

            if (isTooSmall) {
                fabricCanvas.remove(shapeBeingDrawn);
            }
            shapeBeingDrawn = null;
            startPoint = null;
            setMode("select");
        }
        if (isDraggingObject) {
            isDraggingObject = false;
            pdfViewer.classList.remove("no-scroll");
            dragIndicator.style.display = "none";
        }
      });
      
      // --- Object & Sidebar Management ---
      const objectEventHandler = (e) => {
        if (e.target && !e.target.objectId) { e.target.objectId = nextObjectId++; objectsMap.set(e.target, e.target.objectId); }
        if (e.target && e.target.type === "path") { e.target.objectId = nextObjectId++; objectsMap.set(e.target, e.target.objectId); }
        updateObjectsList();
      };
      fabricCanvas.on({ "object:added": objectEventHandler, "path:created": objectEventHandler });

      fabricCanvas.on("object:removed", e => { objectsMap.delete(e.target); updateObjectsList(); });
      fabricCanvas.on("selection:created", e => { selectedObject = e.selected[0]; updateObjectsList(); updateEditPanel(); });
      fabricCanvas.on("selection:updated", e => { selectedObject = e.selected[0]; updateObjectsList(); updateEditPanel(); });
      fabricCanvas.on("selection:cleared", () => { selectedObject = null; updateObjectsList(); editPanel.classList.add("hidden"); });
      
      const onObjectTransform = () => {
        if (!isDraggingObject) {
            isDraggingObject = true;
            pdfViewer.classList.add("no-scroll");
            dragIndicator.style.display = "block";
        }
      };
      fabricCanvas.on({"object:moving": onObjectTransform, "object:scaling": onObjectTransform, "object:rotating": onObjectTransform});
      
      function updateObjectsList() {
        const objects = fabricCanvas.getObjects().slice().reverse();
        if (objects.length === 0) {
          objectsList.innerHTML = \`<div class="empty-state"><i class="fas fa-layer-group"></i><p>No objects on this page</p><p class="mt-2 text-xs">Use the toolbar to add annotations.</p></div>\`;
          return;
        }

        objectsList.innerHTML = objects.map(obj => {
          const id = obj.objectId;
          let icon, preview, iconClass;
          switch(obj.type) {
            case 'i-text': case 'textbox': icon = '<i class="fas fa-font"></i>'; preview = obj.text.substring(0, 25) + (obj.text.length > 25 ? '...' : ''); iconClass = ''; break;
            case 'path': icon = '<i class="fas fa-pencil-alt"></i>'; preview = 'Drawing'; iconClass = 'drawing-icon'; break;
            case 'rect': icon = '<i class="far fa-square"></i>'; preview = 'Rectangle'; iconClass = 'rect-icon'; break;
            case 'circle': icon = '<i class="far fa-circle"></i>'; preview = 'Circle'; iconClass = 'circle-icon'; break;
            case 'image': icon = '<i class="fas fa-image"></i>'; preview = obj.origin === 'signature' ? 'Signature' : 'Image'; iconClass = obj.origin === 'signature' ? 'signature-icon' : 'image-icon'; break;
            default: return '';
          }

          return \`
            <div class="object-item \${selectedObject === obj ? "selected" : ""}" data-id="\${id}">
              <div class="object-info">
                <div class="object-icon \${iconClass}">\${icon}</div>
                <div class="object-preview" title="\${preview}">\${preview}</div>
              </div>
              <div class="flex items-center layer-controls">
                <button class="send-back p-1 text-gray-500 hover:text-blue-600 rounded-full" data-id="\${id}" title="Send to Back"><i class="fas fa-angle-double-down"></i></button>
                <button class="layer-down p-1 text-gray-500 hover:text-blue-600 rounded-full" data-id="\${id}" title="Send Backward"><i class="fas fa-angle-down"></i></button>
                <button class="layer-up p-1 text-gray-500 hover:text-blue-600 rounded-full" data-id="\${id}" title="Bring Forward"><i class="fas fa-angle-up"></i></button>
                <button class="bring-front p-1 text-gray-500 hover:text-blue-600 rounded-full" data-id="\${id}" title="Bring to Front"><i class="fas fa-angle-double-up"></i></button>
                <button class="delete-object text-red-500 hover:text-red-700 p-1 rounded-full" data-id="\${id}" title="Delete"><i class="fas fa-trash text-sm"></i></button>
              </div>
            </div>\`;
        }).join('');

        objectsList.querySelectorAll(".object-item").forEach(item => {
          item.addEventListener("click", e => {
            if (e.target.closest("button")) return;
            const obj = fabricCanvas.getObjects().find(o => o.objectId === parseInt(item.dataset.id));
            if (obj) fabricCanvas.setActiveObject(obj).renderAll();
          });
        });

        const handleAction = (selector, action) => {
          objectsList.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", e => {
              e.stopPropagation();
              const obj = fabricCanvas.getObjects().find(o => o.objectId === parseInt(e.target.closest("button").dataset.id));
              if (obj) { action(obj); updateObjectsList(); fabricCanvas.renderAll(); }
            });
          });
        };
        handleAction(".delete-object", obj => fabricCanvas.remove(obj));
        handleAction(".layer-up", obj => fabricCanvas.bringForward(obj));
        handleAction(".layer-down", obj => fabricCanvas.sendBackwards(obj));
        handleAction(".bring-front", obj => fabricCanvas.bringToFront(obj));
        handleAction(".send-back", obj => fabricCanvas.sendToBack(obj));
      }
      
      function updateEditPanel() {
        if (selectedObject && (selectedObject.type === "i-text" || selectedObject.type === "textbox")) {
          editPanel.classList.remove("hidden");
          textContentInput.value = selectedObject.text;
          textColorInput.value = selectedObject.fill;
          textSizeInput.value = selectedObject.fontSize;
          fontBoldBtn.classList.toggle("active", selectedObject.fontWeight === "bold");
          fontItalicBtn.classList.toggle("active", selectedObject.fontStyle === "italic");
        } else {
          editPanel.classList.add("hidden");
        }
      }

      // --- Edit Panel Listeners ---
      textContentInput.addEventListener("input", e => { if (selectedObject) { selectedObject.set("text", e.target.value); fabricCanvas.renderAll(); updateObjectsList(); } });
      textColorInput.addEventListener("input", e => { if (selectedObject) { selectedObject.set("fill", e.target.value); fabricCanvas.renderAll(); } });
      textSizeInput.addEventListener("input", e => { if (selectedObject) { selectedObject.set("fontSize", parseInt(e.target.value)); fabricCanvas.renderAll(); } });
      fontBoldBtn.addEventListener("click", () => { if (selectedObject) { selectedObject.set("fontWeight", selectedObject.fontWeight === "bold" ? "normal" : "bold"); fontBoldBtn.classList.toggle("active"); fabricCanvas.renderAll(); } });
      fontItalicBtn.addEventListener("click", () => { if (selectedObject) { selectedObject.set("fontStyle", selectedObject.fontStyle === "italic" ? "normal" : "italic"); fontItalicBtn.classList.toggle("active"); fabricCanvas.renderAll(); } });

      // --- ENHANCED: Save & Download Functionality ---
      async function generateFinalPDF() {
        if (!pdfDoc) return null;
        pageAnnotations[pageNum] = fabricCanvas.toJSON(["objectId"]);
        const finalPdf = new jsPDF();
        finalPdf.deletePage(1);

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: DEFAULT_SCALE });
          
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;
          await page.render({ canvasContext: tempCanvas.getContext("2d"), viewport }).promise;

          const tempFabricCanvas = new fabric.StaticCanvas(null, { width: viewport.width, height: viewport.height });
          
          await new Promise(res => tempFabricCanvas.setBackgroundImage(new fabric.Image(tempCanvas, {crossOrigin: 'anonymous'}), res));

          if (pageAnnotations[i] && pageAnnotations[i].objects) {
            await new Promise(res => tempFabricCanvas.loadFromJSON(pageAnnotations[i], () => { tempFabricCanvas.renderAll(); res(); }));
          }
    
          const dataUrl = tempFabricCanvas.toDataURL({ format: "jpeg", quality: 1.0 });
          finalPdf.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? "l" : "p");
          finalPdf.addImage(dataUrl, "JPEG", 0, 0, viewport.width, viewport.height);
        }
        return finalPdf;
      }

      const manageButtonState = async (btn, action) => {
          const originalHTML = btn.innerHTML;
          let successTimeout = null;
          if (successTimeout) clearTimeout(successTimeout);
          btn.innerHTML = \`<i class="fas fa-spinner fa-spin mr-2"></i>Processing ...\`;
          btn.classList.add("btn-processing");
          btn.disabled = true;

          try {
              await action();
              btn.classList.remove("btn-processing");
              btn.classList.add("btn-success");
              btn.innerHTML = \`<i class="fas fa-check mr-2"></i> \${btn === saveBtn ? 'Saved!' : 'Done!'}\`;
              successTimeout = setTimeout(() => {
                  btn.innerHTML = originalHTML;
                  btn.classList.remove("btn-success");
              }, 2000);
          } catch (error) {
              console.error("Failed to generate PDF:", error);
              btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Error';
              setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove("btn-processing"); }, 3000);
          } finally {
              btn.disabled = false;
          }
      };
      
      saveBtn.addEventListener("click", () => manageButtonState(saveBtn, async () => {
          const pdf = await generateFinalPDF();
          if (pdf) {
              const base64 = pdf.output("datauristring").split(",")[1];
              window.parent.postMessage({ type: "pdfSaved", base64 }, "*");
          }
      }));

      downloadBtn.addEventListener("click", () => manageButtonState(downloadBtn, async () => {
          const pdf = await generateFinalPDF();
          if (pdf) {
              pdf.save("edited-document.pdf");
          }
      }));

      // --- Keyboard Shortcuts ---
      window.addEventListener("keydown", e => {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        if ((e.key === "Delete" || e.key === "Backspace") && fabricCanvas.getActiveObject() && !fabricCanvas.getActiveObject().isEditing) deleteBtn.click();
        if (e.ctrlKey || e.metaKey) return;
        const keyMap = { v: "select", h: "pan", p: "draw", t: "text", r: "rectangle", c: "circle", i: "image" };
        if (keyMap[e.key.toLowerCase()]) setMode(keyMap[e.key.toLowerCase()]);
      });
      
      // --- Sidebar Toggle ---
      toggleSidebarBtn.addEventListener("click", () => {
        const isHidden = objectsSidebar.classList.toggle("sidebar-hidden");
        objectsSidebar.style.width = isHidden ? "0px" : \`var(--sidebar-width)\`;
        toggleSidebarBtn.innerHTML = isHidden ? '<i class="fas fa-palette"></i>' : '<i class="fas fa-times"></i>';
        toggleSidebarBtn.style.right = isHidden ? "20px" : \`calc(var(--sidebar-width) + 15px)\`;
      });
      
      // --- SIGNATURE SYSTEM ---
      function openSignatureModal() { signatureModal.classList.remove("hidden"); setupDrawingCanvas(); renderSavedSignatures(); createFontBoxes(); setActiveTab('upload-tab'); }
      function closeSignatureModal() { signatureModal.classList.add("hidden"); resetSignatureForm(); }

      function resetSignatureForm() {
        signatureUpload.value = "";
        signaturePreview.src = "";
        imagePreviewContainer.classList.remove("active");
        resetDrawingCanvas();
        signatureTextInput.value = "";
        updateTextPreview();
        currentSignatureData = null;
      }

      function resetDrawingCanvas() {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        ctx.strokeStyle = "#000000"; ctx.lineWidth = 3;
        penToolBtn.classList.add("active"); eraserToolBtn.classList.remove("active");
      }

      function setActiveTab(tabId) {
        tabBtns.forEach(btn => btn.classList.remove("active"));
        document.querySelector(\`[data-tab="\${tabId}"]\`).classList.add("active");
        
        [uploadTab, drawTab, typeTab, savedTab].forEach(tab => tab.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        
        if (tabId === 'draw-tab') setupDrawingCanvas();
        currentSignatureType = tabId.split('-')[0];
      }
      
      // High-quality signature generation
      function textToImage(text, font) {
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        const DPI_SCALE = 8, FONT_SIZE = 150, PADDING = 40;
        ctx.font = \`\${FONT_SIZE}px \${font}\`;
        const metrics = ctx.measureText(text);
        canvas.width = (metrics.width + PADDING * 2) * DPI_SCALE;
        canvas.height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + PADDING * 2) * DPI_SCALE;
        ctx.scale(DPI_SCALE, DPI_SCALE);
        ctx.font = \`\${FONT_SIZE}px \${font}\`;
        ctx.fillStyle = "#000000"; ctx.textBaseline = "top";
        ctx.fillText(text, PADDING, PADDING);
        return canvas.toDataURL('image/png');
      }
      
      function drawingToImage() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = drawingCanvas.width; tempCanvas.height = drawingCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = "#ffffff"; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(drawingCanvas, 0, 0);
        return tempCanvas.toDataURL('image/png');
      }

      function applySignatureToDocument(signatureImage) {
        const pos = { x: pdfViewer.scrollLeft + pdfViewer.clientWidth / 2, y: pdfViewer.scrollTop + pdfViewer.clientHeight / 2 };
        fabric.Image.fromURL(signatureImage, img => {
          img.set({ left: pos.x, top: pos.y, scaleX: 0.2, scaleY: 0.2, objectId: nextObjectId++, origin: "signature" });
          fabricCanvas.add(img).bringToFront().setActiveObject(img).renderAll();
          updateObjectsList();
        }, { crossOrigin: 'anonymous' });
      }

      function saveSignatureToStorage(signatureImage, name) {
        signatures.push({ id: Date.now(), name, data: signatureImage });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(signatures));
      }

      async function applySignature() {
        try {
          let signatureImage = currentSignatureData;
          
          if (currentSignatureType === "type") {
            if (!signatureTextInput.value.trim()) { alert("Please enter text for your signature."); return; }
            signatureImage = textToImage(signatureTextInput.value, signatureFontSelect.value);
          } else if (currentSignatureType === "draw") {
            signatureImage = drawingToImage();
          } else if (currentSignatureType === "upload" && !signaturePreview.src) {
            alert("Please upload a signature image first."); return;
          }
          
          if (signatureImage) applySignatureToDocument(signatureImage);
          
          if (saveCheckbox.checked) {
            let name = "Uploaded Signature";
            if (currentSignatureType === "type") name = signatureTextInput.value.trim() || "Typed Signature";
            else if (currentSignatureType === "draw") name = "Drawn Signature";
            const timestampName = \`\${name} (\${new Date().toLocaleString()})\`;
            saveSignatureToStorage(signatureImage, timestampName);
          }
          closeSignatureModal();
        } catch (error) {
          console.error("Error applying signature:", error);
          alert("Failed to apply signature. Please try again.");
        }
      }

      function loadSavedSignatures() {
        try { signatures = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } 
        catch (e) { signatures = []; }
      }

      function renderSavedSignatures() {
        const hasSignatures = signatures.length > 0;
        noSignaturesElem.classList.toggle("hidden", hasSignatures);
        savedSignaturesContainer.innerHTML = !hasSignatures ? '' : signatures.map(sig => \`
          <div class="signature-item" data-id="\${sig.id}">
            <img src="\${sig.data}" class="signature-image" alt="Saved signature" />
            <div class="signature-name" title="\${sig.name}">\${sig.name}</div>
            <div class="signature-actions">
              <button class="signature-action-btn delete"><i class="fas fa-trash"></i> Delete</button>
              <button class="signature-action-btn use"><i class="fas fa-check"></i> Use</button>
            </div>
          </div>
        \`).join('');
        
        savedSignaturesContainer.querySelectorAll(".delete").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); deleteSignature(parseInt(e.target.closest('.signature-item').dataset.id)); }));
        savedSignaturesContainer.querySelectorAll(".use").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); useSignature(parseInt(e.target.closest('.signature-item').dataset.id)); }));
      }
      
      function deleteSignature(id) {
        signatures = signatures.filter(sig => sig.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(signatures));
        renderSavedSignatures();
      }
      
      function useSignature(id) {
        const sig = signatures.find(s => s.id === id);
        if (sig) {
          applySignatureToDocument(sig.data);
          closeSignatureModal();
        }
      }

      tabBtns.forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));
      uploadContainer.addEventListener("click", () => signatureUpload.click());
      signatureUpload.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
          signaturePreview.src = event.target.result;
          imagePreviewContainer.classList.add("active");
          currentSignatureData = event.target.result;
        };
        reader.readAsDataURL(file);
      });
      
      // --- REVERTED DRAWING LOGIC ---
      function startDrawing(e) {
        isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        lastX = clientX - rect.left;
        lastY = clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
      }

      function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = drawingCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        lastX = mouseX;
        lastY = mouseY;
      }

      function stopDrawing() {
        if (isDrawing) {
          isDrawing = false;
          currentSignatureType = "draw";
        }
      }
      
      drawingCanvas.addEventListener("mousedown", startDrawing);
      drawingCanvas.addEventListener("mousemove", draw);
      drawingCanvas.addEventListener("mouseup", stopDrawing);
      drawingCanvas.addEventListener("mouseout", stopDrawing);
      
      drawingCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
      drawingCanvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); }, { passive: false });
      drawingCanvas.addEventListener("touchend", (e) => { e.preventDefault(); stopDrawing(); }, { passive: false });
      // --- END REVERTED DRAWING LOGIC ---

      penToolBtn.addEventListener("click", () => { ctx.strokeStyle = "#000000"; ctx.lineWidth = 3; penToolBtn.classList.add("active"); eraserToolBtn.classList.remove("active"); });
      eraserToolBtn.addEventListener("click", () => { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 20; penToolBtn.classList.remove("active"); eraserToolBtn.classList.add("active"); });
      clearDrawingBtn.addEventListener("click", resetDrawingCanvas);
      
      signatureTextInput.addEventListener("input", updateTextPreview);
      
      function createFontBoxes() {
        const fonts = [
          { name: "Dancing Script", value: "'Dancing Script', cursive" }, { name: "Great Vibes", value: "'Great Vibes', cursive" },
          { name: "Parisienne", value: "'Parisienne', cursive" }, { name: "Sacramento", value: "'Sacramento', cursive" },
          { name: "Pacifico", value: "'Pacifico', cursive" }, { name: "Cedarville", value: "'Cedarville Cursive', cursive" },
          { name: "Homemade Apple", value: "'Homemade Apple', cursive" }, { name: "Marck Script", value: "'Marck Script', cursive" },
          { name: "Nothing You", value: "'Nothing You Could Do', cursive" }, { name: "Kalam", value: "'Kalam', cursive" },
          { name: "Indie Flower", value: "'Indie Flower', cursive" }, { name: "Shadows Light", value: "'Shadows Into Light', cursive" },
          { name: "Caveat", value: "'Caveat', cursive" }, { name: "Gochi Hand", value: "'Gochi Hand', cursive" },
          { name: "Patrick Hand", value: "'Patrick Hand', cursive" }, { name: "Alex Brush", value: "'Alex Brush', cursive" }
        ];
        
        fontGrid.innerHTML = "";
        signatureFontSelect.innerHTML = "";

        fonts.forEach((font, index) => {
          const option = document.createElement("option");
          option.value = font.value;
          option.textContent = font.name;
          signatureFontSelect.appendChild(option);

          const box = document.createElement("div");
          box.className = "font-box";
          box.dataset.font = font.value;
          box.innerHTML = \`<div class="font-preview" style="font-family: \${font.value}">\${font.name}</div>\`;
          
          if (index === 0) { box.classList.add("active"); signatureFontSelect.value = font.value; }
          
          box.addEventListener("click", () => {
            document.querySelectorAll(".font-box").forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            signatureFontSelect.value = font.value;
            updateTextPreview();
          });
          fontGrid.appendChild(box);
        });
        updateTextPreview();
      }

      function updateTextPreview() {
        const text = signatureTextInput.value || "Signature Preview";
        textPreview.textContent = text;
        textPreview.style.fontFamily = signatureFontSelect.value;
      }

      signBtn.addEventListener("click", openSignatureModal);
      closeModalBtn.addEventListener("click", closeSignatureModal);
      cancelModalBtn.addEventListener("click", closeSignatureModal);
      applyModalBtn.addEventListener("click", applySignature);

      loadSavedSignatures();

      window.parentPdfBase64 = "${pdfBase64}";
    </script>
  </body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const iframe = document.createElement("iframe");
    iframe.src = URL.createObjectURL(blob);
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style["min-height"] = "96vh";
    iframe.style.border = "none";
    iframe.title = title || "PDF Editor";

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(iframe);
    }

    const handleMessage = (event) => {
      if (event.data?.type === "pdfSaved" && event.data.base64) {
        onSave(event.data.base64);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (iframe.src) {
        URL.revokeObjectURL(iframe.src);
      }
    };
  }, [pdfBase64, onSave, title]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default function App({ setBase64File, pdfBase64, onClose, docObject = {} }) {
  const title = docObject?.file_name || "Untitled Document";

  const [loader, setloader] = useState(false);

  const handleSave = (pdfBase64) => {
    let payload = {
      pdf_data: pdfBase64,
    };

    setloader(true);

    axios
      .post("https://pdf-compression-service-v1-305451280005.us-east1.run.app", payload)
      .then((response) => {
        const result = response.data;
        if (result.status === "success") {
          setBase64File(result.compressed_pdf);
        } else {
          console.log(result.error || "Compression failed");
        }
      })
      .catch((error) => {
        console.log(error.response?.data?.error || error.message);
        return null;
      })
      .finally(() => {
        setloader(false);
      });
  };

  if (!pdfBase64) {
    return null;
  }

  return (
    <OverlayModal isActive onClose={onClose} style={{ minWidth: "90%" }}>
      <div className="h-screen" style={{ height: "100%" }}>
        <PDFEditorApp pdfBase64={pdfBase64} onSave={handleSave} title={title} />
      </div>
      <ThemeLoader fixed show={loader} />
    </OverlayModal>
  );
}
