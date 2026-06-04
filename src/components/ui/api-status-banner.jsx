import { AlertCircle, Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApiStatusBanner({
  status,
  errorMessage = "Failed to load data. Please try again.",
  successMessage = "Data loaded successfully!",
  loadingMessage = "Loading data...",
  onRetry,
  className,
  showSuccessBanner = false,
  autoHideSuccess = true,
}) {
  // Don't show banner for idle state or success (unless explicitly requested)
  if (status === "idle") return null;
  if (status === "success" && !showSuccessBanner) return null;

  const bannerConfig = {
    loading: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />,
      textColor: "text-blue-800",
      message: loadingMessage,
    },
    success: {
      bg: "bg-green-50 border-green-200",
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      textColor: "text-green-800",
      message: successMessage,
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      textColor: "text-red-800",
      message: errorMessage,
    },
    idle: {
      bg: "",
      icon: null,
      textColor: "",
      message: "",
    },
  };

  const config = bannerConfig[status];

  return (
    <div
      className={`signatureContainer flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${config.bg} ${className || ""}`.trim()}
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <span className={`text-sm font-medium ${config.textColor}`}>{config.message}</span>
      </div>

      {status === "error" && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="bg-white hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Inline loading indicator for smaller use cases
export function InlineLoader({ message = "Loading..." }) {
  return (
    <div className="signatureContainer flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

// Full-page error state with retry
export function FullPageError({
  title = "Something went wrong",
  message = "We couldn't load the data. Please try again.",
  onRetry,
}) {
  return (
    <div className="signatureContainer flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
