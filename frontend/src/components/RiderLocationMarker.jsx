import { useEffect, useRef } from 'preact/hooks';
import L from 'leaflet';

/**
 * RiderLocationMarker Component - Shows current rider location on map
 * Features:
 * - Real-time location tracking
 * - Pulsing marker animation
 * - Accuracy circle
 * - Heading indicator
 */
const RiderLocationMarker = ({ map, location, showAccuracy = true, showHeading = true }) => {
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const headingLineRef = useRef(null);

  useEffect(() => {
    if (!map || !location) return;

    const { lat, lon, accuracy, heading } = location;
    const latlng = L.latLng(lat, lon);

    // Update or create marker
    if (!markerRef.current) {
      const markerIcon = createRiderMarkerIcon(heading);
      markerRef.current = L.marker(latlng, {
        icon: markerIcon,
        zIndexOffset: 999
      })
        .bindPopup(createMarkerPopup(location))
        .addTo(map);
    } else {
      markerRef.current.setLatLng(latlng);
      markerRef.current.setPopupContent(createMarkerPopup(location));
    }

    // Update accuracy circle if enabled
    if (showAccuracy) {
      if (!circleRef.current) {
        circleRef.current = L.circle(latlng, {
          radius: accuracy,
          color: '#2196F3',
          weight: 1,
          opacity: 0.3,
          fillColor: '#2196F3',
          fillOpacity: 0.1,
          dashArray: '5, 5'
        }).addTo(map);
      } else {
        circleRef.current.setLatLng(latlng);
        circleRef.current.setRadius(accuracy);
      }
    }

    // Update heading indicator if enabled and heading available
    if (showHeading && heading !== undefined && heading !== null) {
      if (!headingLineRef.current) {
        const angle = (heading * Math.PI) / 180;
        const distance = accuracy || 20;
        const targetLat = lat + (Math.sin(angle) * distance) / 111000;
        const targetLon = lon + (Math.cos(angle) * distance) / 111000;

        headingLineRef.current = L.polyline([latlng, [targetLat, targetLon]], {
          color: '#2196F3',
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5'
        }).addTo(map);
      } else {
        const angle = (heading * Math.PI) / 180;
        const distance = accuracy || 20;
        const targetLat = lat + (Math.sin(angle) * distance) / 111000;
        const targetLon = lon + (Math.cos(angle) * distance) / 111000;

        headingLineRef.current.setLatLngs([latlng, [targetLat, targetLon]]);
      }
    }

    // Keep marker in view
    map.panTo(latlng);

    return () => {
      // Cleanup on unmount
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      if (headingLineRef.current) {
        map.removeLayer(headingLineRef.current);
        headingLineRef.current = null;
      }
    };
  }, [map, location, showAccuracy, showHeading]);

  return null; // This component only manages map layers
};

/**
 * Create custom rider location marker icon with pulsing animation
 */
const createRiderMarkerIcon = (heading = 0) => {
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer pulsing circle -->
      <circle cx="20" cy="20" r="18" fill="none" stroke="#2196F3" stroke-width="2" opacity="0.3">
        <animate attributeName="r" values="18;25" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <!-- Inner circle -->
      <circle cx="20" cy="20" r="12" fill="#2196F3" stroke="white" stroke-width="2"/>
      <!-- Center dot -->
      <circle cx="20" cy="20" r="4" fill="white"/>
      <!-- Direction indicator (arrow pointing up based on heading) -->
      <g transform="rotate(${heading} 20 20)">
        <path d="M 20 8 L 23 14 L 17 14 Z" fill="white"/>
      </g>
    </svg>
  `;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return L.icon({
    iconUrl: url,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'rider-location-marker'
  });
};

/**
 * Create marker popup content
 */
const createMarkerPopup = (location) => {
  const speed = location.speed ? (location.speed * 3.6).toFixed(1) : 'N/A'; // m/s to km/h
  const heading = location.heading ? `${Math.round(location.heading)}°` : 'N/A';

  return `
    <div class="rider-location-popup">
      <h4>📍 Your Location</h4>
      <div class="popup-content">
        <p><strong>Lat:</strong> ${location.lat.toFixed(5)}</p>
        <p><strong>Lon:</strong> ${location.lon.toFixed(5)}</p>
        <p><strong>Accuracy:</strong> ±${Math.round(location.accuracy)}m</p>
        <p><strong>Speed:</strong> ${speed} km/h</p>
        <p><strong>Heading:</strong> ${heading}</p>
        <p><strong>Time:</strong> ${location.datetime.toLocaleTimeString()}</p>
      </div>
    </div>
  `;
};

export default RiderLocationMarker;
