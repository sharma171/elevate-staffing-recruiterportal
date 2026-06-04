import { format } from "date-fns";
import moment from "moment-timezone";

export function pickDateOnlyNew(input) {
  if (!input) return "";

  var str = String(input);

  var datePart = str.includes("T") ? str.split("T")[0] : str;

  var m = moment(datePart, ["YYYY-MM-DD", "YYYY/MM/DD", "MM/DD/YYYY", "MM-DD-YYYY", "DD/MM/YYYY", "DD-MM-YYYY"], true);

  if (!m.isValid()) return "";

  return m.format("MM/DD/YYYY");
}

export const formatDateToET = (date) => {
  if (!date) return null;
  if (new Date(date) === "Invalid Date") return null;

  const formattedDate = date ? format(date, "MM/dd/yyyy") : null;

  return formattedDate;

  return moment.tz(date, "America/New_York").format("MM/DD/YYYY");
};

export const returnTruncatedStr = (str, len = 15, style = {}) => {
  if (!str) return "";

  if (!str.trim().length) {
    return "";
  }

  const truncatedStr = str.length > len ? str.slice(0, len) + "..." : str;

  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "150px",
        cursor: "pointer",
        color: "unset",
        ...style,
      }}
      title={str}
    >
      {truncatedStr}
    </span>
  );
};

export const dateToUTCDate = (input) => {
  const d = new Date(input);
  if (isNaN(d.getTime())) {
    return null;
  }

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
};

export const dateTimeToMMDDYYYY = (input) => {
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${mm}/${dd}/${yyyy} ${hh}:${mins}`;
};

export const pickDateOnly = (input) => {
  let year, month, day;

  if (input instanceof Date) {
    year = input.getFullYear();
    month = input.getMonth() + 1;
    day = input.getDate();
  } else if (typeof input === "number") {
    const d = new Date(input);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  } else if (typeof input === "string") {
    let parts;
    if ((parts = input.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/))) {
      [, year, month, day] = parts;
    } else if ((parts = input.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/))) {
      [, month, day, year] = parts;
    } else {
      const d = new Date(input);
      if (isNaN(d)) return "";
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  } else {
    return "";
  }

  month = String(month).padStart(2, "0");
  day = String(day).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

export const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export function formatUSPhone(value) {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";

  const hasCountryCode = digits.length > 0 && digits[0] === "1";

  if (hasCountryCode) {
    digits = digits.substring(1);
  }

  digits = digits.substring(0, 10);

  let formatted = "+1";
  if (digits.length === 0) {
    return formatted;
  }

  formatted += ` (${digits.substring(0, 3)}`;

  if (digits.length > 3) {
    formatted += `) ${digits.substring(3, 6)}`;
  }

  if (digits.length > 6) {
    formatted += `-${digits.substring(6)}`;
  }

  return formatted;
}

export function formatFileSize(size) {
  if (typeof size !== "number" || isNaN(size) || size < 0) {
    return "0 KB";
  }

  if (size < 1024) {
    return size + "B";
  }

  var kb = size / 1024;
  if (kb < 1024) {
    return kb.toFixed(1) + "KB";
  }

  var mb = kb / 1024;
  if (mb < 1024) {
    return mb.toFixed(1) + "MB";
  }

  var gb = mb / 1024;
  return gb.toFixed(1) + "GB";
}

export function timeAgo(date) {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  if (isNaN(past.getTime())) return "";

  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}
