/**
 * Everything related tpo geolocation is here
 * @author daniel.vollmer, marius.möldner
 */

/**
 * Function for getting the current position of the user
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
 * @returns {Promise} - Promise that resolves to the current position
 * @author daniel.vollmer
 */
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

/**
 * Function for checking if the user is in Mosbach
 * @param {number} lat - Latitude of the user
 * @param {number} lng - Longitude of the user
 * @returns {boolean} - True if the user is in Mosbach, false otherwise
 * @author marius.möldner
 */
async function checkPosition() {
  // Check if geolocation is available
  if ("geolocation" in navigator) {
    try {
      const position = await getPosition();
      // Check if the user is in Mosbach
      return isInMosbach(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      console.error("Fehler beim Abrufen der Position", error);
      return false;
    }
  } else {
    console.log("Geolocation ist nicht verfügbar.");
    return false;
  }
}

/**
 * Function for checking if the user is in Mosbach
 * @param {number} lat - Latitude of the user
 * @param {number} lng - Longitude of the user
 * @returns {boolean} - True if the user is in Mosbach, false otherwise
 * @author marius.möldner
 */
function isInMosbach(lat, lng) {
  const minLat = 49.34;
  const maxLat = 49.36;
  const minLng = 9.13;
  const maxLng = 9.16;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

export { checkPosition };
