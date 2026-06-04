import { useState, useEffect, useRef } from "react";
import styles from "../../components/css/PDFViewer.module.css";
import ReactDOM from "react-dom";
import "./editCandidate.css";

import { ThemeLoader } from "../../components";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Download,
  Printer,
  Maximize2,
} from "lucide-react";

const ImagePreviewWithToolbar = ({ blobUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) {
      fitToPage();
    }
  }, [imageLoaded, rotation]);

  const fitToPage = () => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const img = imageRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const widthRatio = containerWidth / img.width;
    const heightRatio = containerHeight / img.height;

    const scale = Math.min(widthRatio, heightRatio);

    setZoom(scale);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const newZoom = e.deltaY < 0 ? Math.min(zoom + scaleAmount, 5) : Math.max(zoom - scaleAmount, 0.1);

    setZoom(newZoom);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "image-download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Image</title>
          <style>
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: white !important;
            }
            img { 
              max-width: 100%; 
              max-height: 100vh; 
              object-fit: contain; 
            }
          </style>
        </head>
        <body>
          <img src="${blobUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const rotate = (degrees) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 5))} aria-label="Zoom in">
          <ZoomIn size={18} />
        </button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.1))} aria-label="Zoom out">
          <ZoomOut size={18} />
        </button>
        <button onClick={fitToPage} aria-label="Fit to page">
          <Maximize2 size={18} />
        </button>
        <button onClick={() => rotate(-90)} aria-label="Rotate left">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => rotate(90)} aria-label="Rotate right">
          <RotateCw size={18} />
        </button>
        <button onClick={handleDownload} aria-label="Download">
          <Download size={18} />
        </button>
        <button onClick={handlePrint} aria-label="Print">
          <Printer size={18} />
        </button>
      </div>

      <div ref={containerRef} className={styles.imageContainer} onWheel={handleWheel}>
        <img
          ref={imageRef}
          src={blobUrl}
          alt="Preview"
          className={styles.image}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  );
};

const FilePreview = ({
  base64File,
  fileType,
  setBase64File,
  setFileType,
  fileMeta = {},
  docObject = {},
  nextFunction,
  previousFunction,
  isLoading,
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isClose, setIsClose] = useState("none");
  const [showClose, setShowClose] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [isPDF, setisPDF] = useState(false);
  let { currentFileName, allFileNames } = fileMeta;

  let isResume = String(docObject.doc_type).toLowerCase() == "resume" && docObject.file_extension != "application/pdf";
  let fileName = docObject?.file_name;

  const firstlast = () => {
    const index = allFileNames.indexOf(currentFileName);
    setIsFirst(index === 0);
    setIsLast(index === allFileNames.length - 1);
  };

  useEffect(() => {
    if (currentFileName && allFileNames) {
      firstlast();
    }
  }, [currentFileName, allFileNames]);

  useEffect(() => {
    setShowClose(false);
    let timeout = setTimeout(() => {
      if (base64File) {
        setShowClose(true);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [base64File]);

  useEffect(() => {
    if (base64File) {
      const byteCharacters = atob(base64File);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: fileType });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setIsClose("flex");
      return () => URL.revokeObjectURL(url);
    }
  }, [base64File, fileType]);

  const handleCloseIframe = () => {
    setBase64File(null);
    setFileType(null);
    setIsClose("none");
    setBlobUrl(null);
  };

  const renderClose = () => {
    if (!base64File && !showClose) return <></>;

    if (base64File && !showClose) return <div className="pdfControlls" />;

    return (
      <>
        {ReactDOM.createPortal(
          <div className="pdfControlls" style={{ zIndex: "9999999999", position: "fixed" }}>
            {/* {isPDF ? (
              <></>
            ) : (
              <div
                title="Close"
                className={"iframeClose-btnimg"}
                // className={isPDF ? "iframeClose-btn" : "iframeClose-btnimg"}
                onClick={handleCloseIframe}
              >
                <button
                  className={"pdfcontrollButtons"}
                  // className={isPDF ? "pdfcontrollButtonsPDF" : "pdfcontrollButtons"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <div className="gradientOverlay"></div>
                </button>
              </div>
            )} */}
            {isResume || !nextFunction ? (
              <></>
            ) : (
              <div
                className="d-flex justify-content-between w-100 px-1"
                style={{
                  position: "fixed",
                  top: "45%",
                }}
              >
                {isFirst ? (
                  <div></div>
                ) : (
                  <div
                    className="pdfcontrollButtons"
                    title="Previous"
                    onClick={previousFunction}
                    style={{ marginLeft: "30px" }}
                  >
                    <ChevronLeft style={{ color: "white" }} />
                  </div>
                )}
                {isLast ? (
                  <div></div>
                ) : (
                  <div
                    className="pdfcontrollButtons"
                    title="Next"
                    onClick={nextFunction}
                    style={{ marginRight: "30px" }}
                  >
                    <ChevronRight style={{ color: "white" }} />
                  </div>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
      </>
    );
  };

  const renderLoader = () => {
    if (!isLoading) {
      return;
    }
    return ReactDOM.createPortal(
      <div className="disableScroller">
        <ThemeLoader show={isLoading} fixed />{" "}
      </div>,
      document.body
    );
  };

  let base64 = String(base64File);

  const [src, setSrc] = useState(null);

  useEffect(() => {
    try {
      const base64Data = base64.startsWith("data:") ? base64.split(",")[1] : base64;

      const binaryString = atob(base64Data);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setSrc(url);

      return () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF load failed:", err);
    }
  }, [base64]);

  return (
    <>
      <div className={`iframeModal ${base64File ? "disableScroller" : ""}`} style={{ display: isClose }}>
        <div className={styles.overlay}>
          <div className={styles.viewer}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              {fileName ? (
                <div className="fw-bold d-flex gap-2 align-items-center w-100 overflow-hidden">
                  <FileText />
                  <div className="w-100 overflow-hidden text-truncate" title={fileName}>
                    {fileName}
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              <div title="Close" className={"iframeClose p-1"} onClick={handleCloseIframe}>
                <button type="button" className={"pdfcontrollButtonsPDF"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pdfIcon"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <div className="gradientOverlay"></div>
                </button>
              </div>
            </div>
            {base64File && blobUrl ? (
              fileType === "application/pdf" ? (
                <iframe src={src} className={styles.iframe} title="Resume PDF" />
              ) : fileType.startsWith("image/") ? (
                // <div
                //   id="docIMAGW"
                //   className="w-100 h-100 d-flex align-items-center justify-content-center overflow-auto overflow rounded"
                //   style={{
                //     border: "2px solid #e3e3e3",
                //     boxShadow: "0px 1px 4px 0px #c2c2c2",
                //     overflow: "auto",
                //     maxHeight: "100vh",

                //     overflow: "auto !important",
                //   }}
                // >
                <ImagePreviewWithToolbar blobUrl={blobUrl} />
              ) : (
                //     <img
                //     src={blobUrl}
                //     alt="Preview"
                //     className="bg-white m-auto p-0 previewImageauto"
                //     style={{
                //       display: "block",
                //       objectFit: "contain",
                //     }}
                //   />
                // </div>
                <iframe src={blobUrl} title="File Preview" className="iFrame-properties"></iframe>
              )
            ) : (
              <p>No file to Preview</p>
            )}
          </div>
        </div>
      </div>
      {renderLoader()}
      {renderClose()}
    </>
  );
};

export default FilePreview;
