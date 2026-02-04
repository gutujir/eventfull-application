import QRCode from "qrcode";

/**
 * Generates a QR code image from a given token string
 * @param token - The unique token to encode in the QR code
 * @returns Promise resolving to the QR code as a data URL (base64)
 */
export const generateQRCodeImage = async (token: string): Promise<string> => {
  try {
    // Generate QR code as data URL (base64 encoded image)
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "H", // High error correction
      type: "image/png",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Generates a QR code buffer for download
 * @param token - The unique token to encode in the QR code
 * @returns Promise resolving to a Buffer containing the QR code image
 */
export const generateQRCodeBuffer = async (token: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 1,
      width: 300,
    });

    return buffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
};
