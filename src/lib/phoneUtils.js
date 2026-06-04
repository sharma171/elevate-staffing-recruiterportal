export function formatPhoneNumber(value) {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Format to (123)-456-7890
  if (phoneNumber.length >= 10) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  } else if (phoneNumber.length >= 6) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  } else if (phoneNumber.length >= 3) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
  } else if (phoneNumber.length > 0) {
    return `(${phoneNumber}`;
  }

  return "";
}

export function unformatPhoneNumber(value) {
  // Remove all non-digit characters for storage
  return value.replace(/\D/g, "");
}
