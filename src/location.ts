const DEFAULT_LAT = 48.8566;  // degrees north
const DEFAULT_LON = 2.3522;   // degrees east

export let location = { lat: DEFAULT_LAT, lon: DEFAULT_LON };

export function initUserLocation({ onUpdate }: { onUpdate?: () => void } = {}): void {
  // Set initial location display
  const locationDisplay = document.getElementById('location-display');
  if (locationDisplay) {
      locationDisplay.textContent = `Location: ${DEFAULT_LAT.toFixed(4)}°N, ${DEFAULT_LON.toFixed(4)}°E`;
  }
  
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by your browser');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      console.log(`Location updated to: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      location = { lat: position.coords.latitude, lon: position.coords.longitude };
      const locationDisplay = document.getElementById('location-display');
      if (locationDisplay) {
        locationDisplay.textContent = `Location: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`;
      }
      if (onUpdate) {
        onUpdate();
      }
    },
    // Error callback
    (error) => {
      console.log('Unable to retrieve your location');
      console.error(error);
    },
    // Options
    {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    }
  );
}
