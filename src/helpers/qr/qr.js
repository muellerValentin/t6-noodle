/**
 * Helper file for doing all qr-code related stuff.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
 * @author daniel
 */

/**
 * Function for creating a qr code detector
 * @returns qr code detector
 * @author daniel
 */ function createQrCodeDetector() {
  if (checkBrowserSupport()) {
    const qrCodeDetector = new BarcodeDetector({
      formats: ["qr_code"],
    });
    return qrCodeDetector;
  } else {
    console.error("Browser does not support Barcode Detection API");
  }
}

/**
 * Function for checking if browser supports Barcode Detection API
 * @returns true if Barcode Detection API is supported
 * @author daniel
 */
function checkBrowserSupport() {
  return "BarcodeDetector" in globalThis ? true : false;
}

/**
 * Function for reading a given qr code and returning its content as a json
 * @argument qrCode as an image, boolean for checking if qr code comes from a video stream
 * @returns qr code content as json
 * @author daniel
 */
async function readQrCode(qrCode, isVideo) {
  try {
    const qrCodeDetector = createQrCodeDetector();
    let qrCodes = null;
    if (isVideo) {
      qrCodes = await qrCodeDetector.detect(qrCode);
    } else {
      const qrCodeAsImageBitmap = await createImageBitmapFromQrCode(qrCode);
      qrCodes = await qrCodeDetector.detect(qrCodeAsImageBitmap);
    }
    if (qrCodes) {
      if (qrCodes.length > 0) {
        const qrCodeContent = qrCodes[0].rawValue;
        return JSON.parse(qrCodeContent);
      } else {
        console.log("No QR codes detected.");
        return null;
      }
    }
  } catch (err) {
    console.error("Error detecting QR code:", err);
    throw err;
  }
}

/**
 * Function for creating an image bitmap from given image of qr code because you'll need it for reading
 * @author daniel
 */
function createImageBitmapFromQrCode(qrCode) {
  return fetch(qrCode)
    .then((response) => response.blob())
    .then((blob) => createImageBitmap(blob));
}

export default readQrCode;
