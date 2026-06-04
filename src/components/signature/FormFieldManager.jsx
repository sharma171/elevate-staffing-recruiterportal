import { Settings2, PenTool, Type, CheckSquare, Calendar, Trash2, MapPin, AlertCircle } from "lucide-react";

const tools = [
  { key: "signature", label: "Signature", icon: <PenTool className="h-3 w-3 shrink-0" /> },
  { key: "text", label: "Text", icon: <Type className="h-3 w-3 mr-1 mb-1" /> },
  { key: "checkbox", label: "Checkbox", icon: <CheckSquare className="h-3 w-3 shrink-0 mb-1" /> },
  { key: "date", label: "Date", icon: <Calendar className="h-3 w-3 mr-1 mb-1" /> },
];

export function FormFieldManager({ selectedTool, onToolChange, fields, onUpdateField, onDeleteField }) {
  const getFieldIcon = (type) => {
    switch (type) {
      case "signature":
        return <PenTool className="h-3 w-3" />;
      case "text":
        return <Type className="h-3 w-3" />;
      case "checkbox":
        return <CheckSquare className="h-3 w-3" />;
      case "date":
        return <Calendar className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getFieldLabel = (type) => {
    switch (type) {
      case "signature":
        return "Signature";
      case "text":
        return "Text Field";
      case "checkbox":
        return "Checkbox";
      case "date":
        return "Date Field";
      default:
        return "";
    }
  };

  const toggleRequired = (id, required) => {
    onUpdateField(id, { required: !required });
  };

  const fieldsByType = fields.reduce((acc, field) => {
    if (!acc[field.type]) acc[field.type] = [];
    acc[field.type].push(field);
    return acc;
  }, {});

  const incompleteMandatoryFields = fields.filter((f) => f.required && (!f.value || f.value.trim() === ""));

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card text-card-foreground shadow-sm" style={{ border: "1px solid #bcbcbc" }}>
        <div className="d-flex flex-col space-y-1.5 p-6 pb-3">
          <div className="d-flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Field Tools
          </div>
        </div>
        <div className="py-4 px-3 pt-0 space-y-3">
          <div className="d-grid grid-cols-2 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.key}
                onClick={() => onToolChange(tool.key)}
                className={`flex items-center gap-1 text-sm justify-center py-2 rounded border w-full text-left transition-colors duration-200 ${
                  selectedTool === tool.key
                    ? "bg-[hsl(221,84%,31%)] text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {tool.icon}
                {tool.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">Click on document to place fields</div>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-3 pb-3">
            <h3 className="font-semibold tracking-tight flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Document Status
            </h3>
          </div>
          <div className="p-3 pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Total Fields:</span>
              <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-[rgb(230_230_230)]">
                {fields.length}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Required Fields:</span>
              <div
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                  incompleteMandatoryFields.length > 0 ? "bg-red-500 text-white" : "bg-[hsl(221,84%,31%)] text-white"
                }`}
              >
                {fields.filter((f) => f.required).length}
              </div>
            </div>
            {incompleteMandatoryFields.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{incompleteMandatoryFields.length} required field(s) incomplete</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fields List */}
      {fields.length > 0 && (
        <div className="border rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-2 py-3 border-b">
            <Settings2 className="h-4 w-4" />
            <span className="text-base font-medium">Placed Fields</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{fields.length}</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div className="p-2 py-4 space-y-4">
              {Object.entries(fieldsByType).map(([type, typeFields]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2 px-2">
                    {getFieldIcon(type)}
                    <span className="text-sm font-medium">
                      {getFieldLabel(type)}s ({typeFields.length})
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 ml-2">
                    {typeFields.map((field) => (
                      <div key={field.id} className="p-2 border rounded bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-gray-600">
                              Page {field.page} • ({Math.round(field.position.x)}, {Math.round(field.position.y)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 rounded"
                              onClick={() => toggleRequired(field.id, field.required || false)}
                            >
                              <AlertCircle className={`h-3 w-3 ${field.required ? "text-red-500" : "text-gray-400"}`} />
                            </button>
                            <button
                              className="h-6 w-6 flex items-center justify-center hover:bg-red-100 hover:text-red-600 rounded"
                              onClick={() => onDeleteField(field.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          {field.required && (
                            <span className="text-xs px-1.5 py-0.5 border rounded bg-white text-gray-700">
                              Required
                            </span>
                          )}
                          {field.value && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(221,84%,31%)] text-white">
                              Filled
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
