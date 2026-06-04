import CryptoJS from "crypto-js";
import axiosApiSecure from "./axiosApiEncrypt";

const sendEncryptedRequest = async (
  businessPayload,
  keys,
  deviceFingerprint,
  url = "https://fetch-update-bench-candidates-wp-v3-305451280005.us-east1.run.app/"
) => {
  try {
    const encryptionKey = keys.sessionToken;
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(businessPayload), encryptionKey).toString();
    const requestBody = {
      encrypted: true,
      data: encryptedData,
      session_id: keys.sessionId,
      device_fingerprint: deviceFingerprint,
    };

    const response = await axiosApiSecure.post(url, requestBody);

    if (response.data.success && response.data.encrypted) {
      const decryptedBytes = CryptoJS.AES.decrypt(response.data.data, encryptionKey);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      try {
        return { data: JSON.parse(decryptedText), status: true };
      } catch {
        return { data: decryptedText, status: false };
      }
    }

    if (response.data.error) {
      throw new Error(`${response.data.error}: ${response.data.details || ""}`);
    }

    return { data: { error: "Unexpected response format from server" }, status: false };
  } catch (error) {
    return { data: error, status: false };
  }
};

export default sendEncryptedRequest;
