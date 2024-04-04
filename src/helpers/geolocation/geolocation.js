function checkPosition() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      // Ruft isInMosbach mit den aktuellen Koordinaten auf
      if (isInMosbach(position.coords.latitude, position.coords.longitude)) {
        return true;
      } else {
        return false;
      }
    });
  } else {
    return false;
  }
}

function isInMosbach(lat, lng) {
  // Definiere die geographischen Grenzen von Mosbach ungefähr
  const minLat = 49.34; // minimale Breite
  const maxLat = 49.36; // maximale Breite
  const minLng = 9.13; // minimale Länge
  const maxLng = 9.16; // maximale Länge

  // Überprüfe, ob die übergebenen Koordinaten innerhalb der Grenzen liegen
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

export { checkPosition };
