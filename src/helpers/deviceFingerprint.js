export default function getDeviceFingerprint() {
  const canvas = document.createElement("canvas");
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");

  const canvasFingerprint = (() => {
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("device-fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 200, 0, 0.7)";
    ctx.fillText("device-fingerprint", 4, 17);
    return canvas.toDataURL();
  })();

  const webglFingerprint = (() => {
    if (!gl) return "not supported";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "unknown";
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
    return `${vendor} (${renderer})`;
  })();

  return {
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    vendor: navigator.vendor,
    color_depth: window.screen.colorDepth,
    pixel_ratio: window.devicePixelRatio,
    touch_support: "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    canvas_fingerprint: canvasFingerprint,
    webgl_fingerprint: webglFingerprint,
  };
}
