import { useState } from "react";
import { PenLine, Type, Upload, Trash2, Check, AlertTriangle, X, Library } from "lucide-react";

export function SignatureLibrary({ signatures, onSelectSignature, onDeleteSignature, currentSignature }) {
  const [selectedSignatureId, setSelectedSignatureId] = useState(null);
  const [deletingSignatureId, setDeletingSignatureId] = useState(null);

  const handleSelectSignature = (signature) => {
    setSelectedSignatureId(signature.id);
    onSelectSignature(signature);
  };

  const handleDelete = (signatureId, isDelete) => {
    setDeletingSignatureId(signatureId);
    if (isDelete) {
      onDeleteSignature(signatureId);
      setDeletingSignatureId(null);
      if (selectedSignatureId === signatureId) {
        setSelectedSignatureId(null);
      }
    }
  };

  const getTypeIcon = (type) => {
    const iconProps = { size: 12, strokeWidth: 1.5 };
    switch (type) {
      case "drawn":
        return <PenLine {...iconProps} />;
      case "typed":
        return <Type {...iconProps} />;
      case "uploaded":
        return <Upload {...iconProps} />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl overflow-hidden transition-all duration-300" style={{ border: "1px solid #bcbcbc" }}>
        <div
          className="px-3 py-4 border-gray-100 flex items-center gap-2"
          style={{ borderBottom: "1px solid #d6d6d6ff" }}
        >
          <Library size={18} strokeWidth={1.5} className="text-indigo-600 flex-shrink-0" />
          <h4 className="font-semibold tracking-tight flex items-center gap-2 text-base">Signature Library</h4>

          <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {signatures.length}
          </span>
        </div>

        <div className="p-3">
          {signatures.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground border-2 border-dashed border-gray-200 my-4 rounded-lg">
              <Library className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-base font-medium mb-1">No signatures saved yet</p>
              <p className="text-sm mb-4">Create your first signature to start signing documents</p>
              <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Click "Create Signature" below to draw, type, or upload your signature for
                reuse!
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {signatures.map((signature) => {
                const isSelected = signature.data === currentSignature;
                const isHighlighted = selectedSignatureId === signature.id;
                const isDeleting = deletingSignatureId === signature.id;

                return (
                  <div
                    key={signature.id}
                    className={`
                      relative rounded-lg border transition-all duration-300 overflow-hidden
                      ${isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                      ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                          : "border-gray-200 bg-white"
                      }
                      ${isHighlighted ? "ring-2 ring-indigo-200" : ""}
                      hover:shadow-md hover:border-indigo-300
                    `}
                  >
                    <button
                      className="w-full h-full text-left p-2 py-3"
                      onClick={() => handleSelectSignature(signature)}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Signature Preview */}
                        <div
                          className="flex-shrink-0 w-16 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden"
                          style={{ border: "1px solid #bcbcbc" }}
                        >
                          <img
                            src={signature.data}
                            alt={signature.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* Signature Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-medium truncate" title={signature.name}>
                              {signature.name}
                            </div>
                            {/* {isSelected && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={12} strokeWidth={2} />
                              </span>
                            )} */}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-2">
                            <span className="inline-flex items-center gap-1 bg-gray-100 pr-1 py-1 rounded-full">
                              {getTypeIcon(signature.type)}
                              {signature.type.charAt(0).toUpperCase() + signature.type.slice(1)}
                            </span>
                            <span>{formatDate(signature.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      className="absolute top-1 right-1 p-1.5 rounded-full transition-all duration-200 opacity-100 bg-red-50 text-red-500 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(signature.id);
                      }}
                      aria-label="Delete signature"
                      title="Delete signature"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSignatureId && (
        <div className="fixed hidemodalclosebtn inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full mt-0.5">
                <AlertTriangle size={24} strokeWidth={1.5} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Delete Signature</h3>
                <p className="text-gray-600 mt-1">
                  Are you sure you want to delete this signature? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setDeletingSignatureId(null)}
              >
                <X size={16} strokeWidth={1.5} />
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                onClick={() => handleDelete(deletingSignatureId, true)}
              >
                <Trash2 size={16} strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
