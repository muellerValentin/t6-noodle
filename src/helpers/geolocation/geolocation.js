// Konvertiere getCurrentPosition in eine Funktion, die ein Promise zurückgibt
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function checkPosition() {
  if ("geolocation" in navigator) {
    try {
      const position = await getPosition();
      return isInMosbach(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      console.error("Fehler beim Abrufen der Position", error);
      return false; // oder passenderweise den Fehler weiterleiten
    }
  } else {
    console.log("Geolocation ist nicht verfügbar.");
    return false;
  }
}

// Beispiel für den Aufruf der checkPosition Funktion

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
