import { useEffect, useRef } from 'preact/hooks';
import L from 'leaflet';

/**
 * RoutePolyline Component - Renders delivery routes on map
 * Features:
 * - Colored polylines for each route
 * - Numbered markers for delivery sequence
 * - Route info popups
 * - Interactive route highlighting
 * - Route completion progress visualization
 */
const RoutePolyline = ({ map, routes = [], onRouteClick = null, highlightedRouteId = null }) => {
  const layerGroupRef = useRef(null);
  const routeLayersRef = useRef({});

  useEffect(() => {
    if (!map || !routes.length) return;

    // Clear existing route layers
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
    }
    routeLayersRef.current = {};

    // Create feature group for all routes
    layerGroupRef.current = L.featureGroup().addTo(map);

    // Route colors for visual distinction (up to 10 routes)
    const routeColors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Light Blue
      '#F8B739', // Orange
      '#52C0A6'  // Green
    ];

    // Render each route
    routes.forEach((route, routeIndex) => {
      const color = routeColors[routeIndex % routeColors.length];
      const isHighlighted = highlightedRouteId === route.properties.id;

      // Parse coordinates from GeoJSON
      const coordinates = route.geometry.coordinates;

      // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
      const latlngs = coordinates.map(coord => [coord[1], coord[0]]);

      // Create polyline for the route
      const polyline = L.polyline(latlngs, {
        color: color,
        weight: isHighlighted ? 4 : 3,
        opacity: isHighlighted ? 1 : 0.7,
        dashArray: isHighlighted ? '5, 5' : 'none',
        lineCap: 'round',
        lineJoin: 'round',
        className: `route-polyline route-${route.properties.id}`
      });

      // Add click handler to polyline
      polyline.on('click', () => {
        if (onRouteClick) {
          onRouteClick(route.properties);
        }
      });

      // Add markers for each delivery stop (skip first which is depot)
      latlngs.slice(1).forEach((latlng, stopIndex) => {
        const stopNumber = stopIndex + 1;
        const isDelivered = stopIndex < route.properties.completed_count;

        // Create numbered marker
        const markerIcon = createNumberedIcon(stopNumber, isDelivered ? color : '#CCC');

        const marker = L.marker(latlng, { icon: markerIcon })
          .bindPopup(createStopPopup(route.properties, stopIndex))
          .on('click', () => {
            if (onRouteClick) {
              onRouteClick(route.properties);
            }
          });

        polyline.addLayer(marker);
      });

      // Create route info popup (centered on route)
      const centerLatlng = latlngs[Math.floor(latlngs.length / 2)];
      const infoMarker = L.circleMarker(centerLatlng, {
        radius: 0,
        fillOpacity: 0
      });

      const popupContent = createRoutePopup(route.properties);
      infoMarker.bindPopup(popupContent);

      polyline.addLayer(infoMarker);

      // Add to feature group
      layerGroupRef.current.addLayer(polyline);
      routeLayersRef.current[route.properties.id] = polyline;
    });

    // Fit map to all route layers if any routes exist
    if (layerGroupRef.current.getLayers().length > 0) {
      map.fitBounds(layerGroupRef.current.getBounds().pad(0.05), {
        maxZoom: 17,
        animate: true
      });
    }

    return () => {
      if (layerGroupRef.current && map) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map, routes, highlightedRouteId]);

  // Highlight route when highlighted ID changes
  useEffect(() => {
    Object.entries(routeLayersRef.current).forEach(([routeId, polyline]) => {
      const isHighlighted = highlightedRouteId === parseInt(routeId);
      polyline.setStyle({
        weight: isHighlighted ? 4 : 3,
        opacity: isHighlighted ? 1 : 0.7,
        dashArray: isHighlighted ? '5, 5' : 'none'
      });
    });
  }, [highlightedRouteId]);

  return null; // This component only manages map layers
};

/**
 * Creates SVG-based numbered marker icon
 */
const createNumberedIcon = (number, color = '#2196F3') => {
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Circle background -->
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
      <!-- Number -->
      <text x="20" y="28" font-size="16" font-weight="bold" text-anchor="middle" fill="white">
        ${number}
      </text>
    </svg>
  `;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return L.icon({
    iconUrl: url,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'route-stop-marker'
  });
};

/**
 * Creates route info popup content
 */
const createRoutePopup = (routeProps) => {
  const distanceKm = (routeProps.distance_m / 1000).toFixed(2);
  const estimatedTime = Math.ceil(routeProps.distance_m / 1000 * 2); // 2 min per km estimate

  return `
    <div class="route-info-popup">
      <h4>Route #${routeProps.route_sequence}</h4>
      <div class="popup-content">
        <p><strong>Status:</strong> <span class="status-badge ${routeProps.status}">${routeProps.status.toUpperCase()}</span></p>
        <p><strong>Stops:</strong> ${routeProps.stops}</p>
        <p><strong>Orders:</strong> ${routeProps.completed_count}/${routeProps.order_count}</p>
        <p><strong>Progress:</strong> ${routeProps.completion_percentage}%</p>
        <p><strong>Distance:</strong> ${distanceKm} km</p>
        <p><strong>Est. Time:</strong> ~${estimatedTime} mins</p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${routeProps.completion_percentage}%"></div>
      </div>
    </div>
  `;
};

/**
 * Creates delivery stop popup content
 */
const createStopPopup = (routeProps, stopIndex) => {
  const stopNumber = stopIndex + 1;
  const isDelivered = stopIndex < routeProps.completed_count;

  return `
    <div class="stop-info-popup">
      <h4>Stop ${stopNumber} of ${routeProps.stops}</h4>
      <p><strong>Route #${routeProps.route_sequence}</strong></p>
      <p><strong>Status:</strong> ${isDelivered ? '✅ Delivered' : '⏳ Pending'}</p>
      <p><strong>Distance from start:</strong> ${((stopNumber * routeProps.distance_m) / routeProps.stops / 1000).toFixed(2)} km</p>
    </div>
  `;
};

export default RoutePolyline;
