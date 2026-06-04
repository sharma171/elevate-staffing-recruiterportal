// import { useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// // pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// const PDFViewer = ({ base64 }) => {
//   const [numPages, setNumPages] = useState(null);
//   const [scale, setScale] = useState(1);

//   const base64ToBlob = (base64) => {
//     const byteCharacters = atob(base64);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     return new Blob([byteArray], { type: "application/pdf" });
//   };

//   const url = URL.createObjectURL(base64ToBlob(base64));

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//   };

//   const downloadPDF = () => {
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "document.pdf";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const zoomIn = () => setScale((prev) => prev + 0.1);
//   const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

//   return (
//     <div style={{ height: "100%", width: "100%", overflow: "auto" }}>
//       <div className="d-flex justify-content-center align-items-center gap-4 w-100 bg-light mb-2">
//         <div onClick={zoomOut} className="pointer px-4 py-2">
//           -
//         </div>
//         <span>Zoom: {scale.toFixed(1)}x</span>
//         <div onClick={zoomIn} className="pointer px-4 py-2">
//           +
//         </div>
//         <span onClick={downloadPDF} class="material-symbols-outlined pointer">
//           download
//         </span>
//       </div>
//       <Document file={url} onLoadSuccess={onDocumentLoadSuccess} className=" ">
//         {Array.from(new Array(numPages), (el, index) => (
//           <Page
//             renderAnnotationLayer={false}
//             renderTextLayer={false}
//             scale={scale}
//             key={`page_${index + 1}`}
//             pageNumber={index + 1}
//             className="my-2 d-flex align-items-center justify-content-center"
//           />
//         ))}
//       </Document>
//     </div>
//   );
// };

// export default PDFViewer;

import styles from "./css/PDFViewer.module.css";
import { FileText } from "lucide-react";

export default function PDFViewer({ base64, fileName, onclose = () => {} }) {
  if (!base64) return null;

  const src = base64.startsWith("data:") ? base64 : `data:application/pdf;base64,${base64}`;

  // return ReactDOM.createPortal(
  return (
    <div className={styles.overlay}>
      <div className={styles.viewer}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          {fileName ? (
            <div className="fw-bold d-flex gap-2 align-items-center">
              <FileText />
              {fileName}
            </div>
          ) : (
            <div></div>
          )}

          <div title="Close" className={"iframeClose p-1"} onClick={onclose}>
            <button className={"pdfcontrollButtonsPDF"}>
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
        <iframe src={src} className={styles.iframe} title="Resume PDF" />
      </div>
    </div>
  );
  //     ,    document.body
  // );
}
