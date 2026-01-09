import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/MapDisplay.css';

// Get API base URL for tiles - must use full URL for map tiles
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://abachaonline.up.railway.app' : 'http://localhost:3000');

// Njala Campus bounds from UPDATED OSM file (103 buildings)
// Format: [longitude, latitude]
const NJALA_BOUNDS = [
  [-12.07981, 8.10478],   // Southwest (minlon, minlat)
  [-12.06219, 8.12094]    // Northeast (maxlon, maxlat)
];

// Campus center from UPDATED OSM data (converted to [lon, lat])
const MAP_CENTER = [-12.0710, 8.1129];
const INITIAL_ZOOM = 16;

// Haversine formula to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

// Calculate bearing between two points (for label rotation)
function calculateBearing(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;

  return (bearing + 360) % 360;
}

// Convert coordinates to [lon, lat] for MapLibre
// Handles both legacy [lat, lon] format and new OSRM [lon, lat] format
function convertToMapLibreCoords(coords) {
  if (!coords || !Array.isArray(coords)) return [];
  return coords.map(coord => {
    if (!Array.isArray(coord) || coord.length < 2) return coord;
    const [first, second] = coord;

    // Sierra Leone bounds: lat ~7.5-9.5, lon ~-13 to -10
    // If first is negative (around -12) and second is positive (around 8), it's already [lon, lat]
    if (first < 0 && first > -15 && second > 0 && second < 15) {
      return coord; // Already in [lon, lat] format (from OSRM)
    }
    // If first is positive (around 8) and second is negative (around -12), it's [lat, lon]
    if (first > 0 && first < 15 && second < 0 && second > -15) {
      return [second, first]; // Swap to [lon, lat]
    }
    // Default: return as-is
    return coord;
  });
}

export default function MapDisplay({ routes = [], depotCoordinates = null, onStopClick = null }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create map with MapLibre GL + OSM raster tiles via backend proxy
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [`${API_BASE}/api/v1/tiles/{z}/{x}/{y}`],
              tileSize: 256
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 18
            }
          ]
        },
        center: MAP_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 14,
        maxZoom: 18,
        pitch: 0,
        bearing: 0
      });

      // Lock to Njala bounds to prevent panning outside campus
      map.setMaxBounds(NJALA_BOUNDS);

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.AttributionControl(), 'bottom-right');

      mapRef.current = map;

      // Wait for map to load, then fit bounds and add markers
      map.on('load', () => {
        // Fit the map to show the entire campus with padding
        map.fitBounds(NJALA_BOUNDS, {
          padding: 80,
          maxZoom: 16,
          duration: 500
        });

        loadAndAddMarkers(map);
      });

      // Error handling
      map.on('error', (e) => {
        console.error('Map error:', e);
        // Don't fail completely - map can work without tiles
      });

    } catch (err) {
      console.error('MapLibre init error:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const loadAndAddMarkers = async (map) => {
    try {
      // Fetch location markers from API
      const response = await fetch(`${API_BASE}/api/v1/locations/geojson`);
      if (!response.ok) throw new Error('API error');

      const geojson = await response.json();
      if (!geojson.features?.length) throw new Error('No locations');

      // Add markers as a layer
      map.addSource('markers', {
        type: 'geojson',
        data: geojson
      });

      // Add marker layer with color coding - uses marker_color from database if available
      map.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 6,
            18, 10
          ],
          'circle-color': [
            'case',
            // Use marker_color from database if available
            ['has', 'marker_color'],
            ['get', 'marker_color'],
            // Fallback to type-based colors
            [
              'match',
              ['get', 'type'],
              'hostel', '#FF6B6B',         // Red for hostels
              'dormitory', '#FF6B6B',      // Red for dormitories
              'merchant', '#4ECDC4',       // Teal for merchants
              'depot', '#2ECC71',          // Green for depot
              'office', '#9B59B6',         // Purple for offices
              'library', '#F38181',        // Pink for library
              'staff_quarters', '#FFB74D', // Orange for staff quarters
              'building', '#95E1D3',       // Light teal for buildings
              'landmark', '#FFE66D',       // Yellow for landmarks
              '#9B59B6'                    // Purple default
            ]
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.85
        }
      });

      // Add popup on click with color-coded type
      map.on('click', 'markers', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        // Get the marker color for the type indicator
        const markerColor = properties.marker_color || '#9B59B6';

        // Format type name for display
        const typeLabels = {
          hostel: 'Hostel',
          merchant: 'Merchant',
          depot: 'Riders Depot',
          office: 'Office',
          library: 'Library',
          staff_quarters: 'Staff Quarters',
          building: 'Building',
          landmark: 'Landmark',
          pickup_point: 'Pickup Point',
          road: 'Road'
        };
        const typeLabel = typeLabels[properties.type] || properties.type;

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 4px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${properties.name}</div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${markerColor}; display: inline-block;"></span>
                <span style="color: #666;">${typeLabel}</span>
              </div>
            </div>
          `)
          .addTo(map);
      });

      // Change cursor on hover
      map.on('mouseenter', 'markers', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'markers', () => {
        map.getCanvas().style.cursor = '';
      });

      setLoading(false);
      console.log(`Map ready: ${geojson.features.length} markers loaded`);

    } catch (err) {
      console.error('Error loading markers:', err);
      setError('Failed to load locations');
      setLoading(false);
    }
  };

  // Memoize distance label calculations to avoid recalculating on every render
  const distanceLabelsData = useMemo(() => {
    return routes.map(route => {
      if (!route.itinerary || route.itinerary.length < 2) return [];

      const labels = [];
      const routeId = route.type === 'primary' ? 'primary' : 'alternate';
      // Convert route coordinates once for this route
      const convertedRouteCoords = convertToMapLibreCoords(route.coordinates);

      for (let i = 0; i < route.itinerary.length - 1; i++) {
        const currentStop = route.itinerary[i];
        const nextStop = route.itinerary[i + 1];

        // Get raw coords and convert to [lon, lat]
        const rawCurrentCoords = currentStop.coordinates || route.coordinates?.[i];
        const rawNextCoords = nextStop.coordinates || route.coordinates?.[i + 1];
        const currentCoords = rawCurrentCoords ? convertToMapLibreCoords([rawCurrentCoords])[0] : convertedRouteCoords[i];
        const nextCoords = rawNextCoords ? convertToMapLibreCoords([rawNextCoords])[0] : convertedRouteCoords[i + 1];

        if (currentCoords && nextCoords) {
          const distance_km = calculateDistance(currentCoords, nextCoords);
          const bearing = calculateBearing(currentCoords, nextCoords);

          // Midpoint for label positioning (already in [lon, lat])
          const midLon = (currentCoords[0] + nextCoords[0]) / 2;
          const midLat = (currentCoords[1] + nextCoords[1]) / 2;

          labels.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [midLon, midLat]
            },
            properties: {
              distance_label: `${distance_km.toFixed(1)} km`,
              bearing: bearing,
              from_stop: i + 1,
              to_stop: i + 2,
              routing_type: routeId
            }
          });
        }
      }
      return labels;
    });
  }, [routes]);

  // Add route visualization when routes are passed in
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Function to render routes once map is ready
    const renderRoutes = () => {
      console.log('[MapDisplay] Rendering routes:', routes.length, 'routes');
      if (routes.length > 0) {
        console.log('[MapDisplay] First route coordinates:', routes[0].coordinates?.length || 0, 'points');
      }

    // Define all layer and source IDs to clean up
    const layerIds = ['primary-route-line', 'alternate-route-line', 'primary-stops', 'primary-stops-text', 'primary-stops-eta',
                      'primary-distances', 'alternate-stops', 'alternate-stops-text', 'alternate-stops-eta',
                      'alternate-distances', 'depot-marker', 'depot-label'];
    const sourceIds = ['primary-route-line', 'alternate-route-line', 'primary-stops', 'primary-distances',
                       'alternate-stops', 'alternate-distances', 'depot-marker'];

    // Remove existing route layers first (must remove layers before sources)
    layerIds.forEach(id => {
      try {
        if (map.getLayer(id)) {
          map.removeLayer(id);
        }
      } catch (err) {
        console.warn(`Failed to remove layer ${id}:`, err);
      }
    });

    // Then remove sources
    sourceIds.forEach(id => {
      try {
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      } catch (err) {
        console.warn(`Failed to remove source ${id}:`, err);
      }
    });
    // Render routes if provided
    routes.forEach((route, routeIndex) => {
      const isPrimary = route.type === 'primary';
      const routeColor = isPrimary ? '#2196F3' : '#4CAF50';
      const routeId = isPrimary ? 'primary' : 'alternate';

      // Convert coordinates from [lat, lon] to [lon, lat] for MapLibre
      const mapCoordinates = convertToMapLibreCoords(route.coordinates);
      console.log(`[MapDisplay] Route ${routeId}: ${route.coordinates?.length || 0} coords -> ${mapCoordinates.length} converted`);
      if (mapCoordinates.length > 0) {
        console.log(`[MapDisplay] Sample coord: original=${JSON.stringify(route.coordinates[0])}, converted=${JSON.stringify(mapCoordinates[0])}`);
      }

      // Add route line (polyline)
      if (mapCoordinates && mapCoordinates.length > 1) {
        map.addSource(`${routeId}-route-line`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: mapCoordinates
            }
          }
        });

        map.addLayer({
          id: `${routeId}-route-line`,
          type: 'line',
          source: `${routeId}-route-line`,
          paint: {
            'line-color': routeColor,
            'line-width': 3,
            'line-opacity': 0.7,
            'line-dasharray': isPrimary ? [1, 0] : [4, 2] // dashed for alternate
          }
        });
      }

      // Add numbered stop markers at delivery locations
      if (route.itinerary && route.itinerary.length > 0) {
        console.log(`[MapDisplay] ======= DEBUGGING STOP COORDINATES =======`);
        console.log(`[MapDisplay] Creating ${route.itinerary.length} stop markers for route ${routeId}`);
        console.log(`[MapDisplay] Route has ${route.coordinates?.length || 0} polyline coordinates`);
        console.log(`[MapDisplay] Full itinerary data:`, JSON.stringify(route.itinerary.map(s => ({
          address: s.delivery_address,
          coords: s.coordinates
        }))));

        const stopMarkers = route.itinerary.map((stop, index) => {
          // Get raw coordinates - try multiple sources
          let rawCoords = stop.coordinates;
          let coordSource = 'stop.coordinates';

          // If stop.coordinates doesn't exist, try to get from route coordinates
          // Note: route.coordinates[0] is usually the depot, so stop index maps to index+1
          if (!rawCoords && route.coordinates && route.coordinates.length > index + 1) {
            rawCoords = route.coordinates[index + 1];
            coordSource = 'route.coordinates[index+1]';
          }

          // Fallback to mapCoordinates if available
          if (!rawCoords && mapCoordinates && mapCoordinates.length > index + 1) {
            rawCoords = mapCoordinates[index + 1]; // Already converted
            coordSource = 'mapCoordinates[index+1]';
          }

          // Convert to [lon, lat] for MapLibre
          let finalCoords;
          if (rawCoords) {
            // Check if already in correct format or needs conversion
            const converted = convertToMapLibreCoords([rawCoords]);
            finalCoords = converted[0] || rawCoords;
            console.log(`[MapDisplay] ✓ Stop ${index + 1} "${stop.delivery_address}": source=${coordSource}, raw=${JSON.stringify(rawCoords)}, final=${JSON.stringify(finalCoords)}`);
          } else {
            console.warn(`[MapDisplay] ✗ No coordinates found for stop ${index + 1}: ${stop.delivery_address}`);
            return null;
          }

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: finalCoords
            },
            properties: {
              stop_number: String(stop.stop_number || (index + 1)),
              order_id: stop.order_id,
              customer_name: stop.customer_name || 'Customer',
              delivery_address: stop.delivery_address || 'Unknown',
              customer_phone: stop.customer_phone || 'N/A',
              order_status: stop.order_status || 'pending',
              total_amount: stop.total_amount || 0,
              tracking_number: stop.tracking_number || '',
              items: stop.items ? JSON.stringify(stop.items) : '[]',
              estimated_arrival_minutes: stop.estimated_arrival_minutes || (index * 8),
              eta_label: stop.estimated_arrival_minutes ? `🕐 ${stop.estimated_arrival_minutes}m` : `🕐 ${index * 8}m`,
              routing_type: routeId
            }
          };
        }).filter(Boolean); // Remove null entries

        console.log(`[MapDisplay] Created ${stopMarkers.length} valid stop markers`);

        // Only add source and layers if we have valid markers
        if (stopMarkers.length > 0) {
          map.addSource(`${routeId}-stops`, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: stopMarkers
            }
          });

          // Add stop marker circles with numbers - LARGE and VISIBLE
          map.addLayer({
            id: `${routeId}-stops`,
            type: 'circle',
            source: `${routeId}-stops`,
            paint: {
              'circle-radius': 22,
              'circle-color': routeColor,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#FFFFFF',
              'circle-opacity': 1
            }
          });

          // Add stop number text layer (bold, large, centered on circle)
          map.addLayer({
            id: `${routeId}-stops-text`,
            type: 'symbol',
            source: `${routeId}-stops`,
            layout: {
              'text-field': ['get', 'stop_number'],
              'text-size': 16,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-anchor': 'center',
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 1.5
            }
          });

          // Add ETA label layer (above stop markers)
          map.addLayer({
            id: `${routeId}-stops-eta`,
            type: 'symbol',
            source: `${routeId}-stops`,
            layout: {
              'text-field': ['get', 'eta_label'],
              'text-size': 12,
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-anchor': 'bottom',
              'text-offset': [0, -3.2],
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-color': '#FF6B6B',
              'text-halo-color': '#fff',
              'text-halo-width': 2.5,
              'text-opacity': 1
            }
          });

          console.log(`[MapDisplay] ✅ Added ${stopMarkers.length} numbered stop markers to map`);
        } else {
          console.warn(`[MapDisplay] ⚠️ No valid stop markers to add for route ${routeId}`);
        }

        // Use pre-calculated distance labels from memoized data
        const distanceLabels = distanceLabelsData[routeIndex] || [];

        // Add distance labels source and layer only if there are labels
        if (distanceLabels.length > 0) {
          map.addSource(`${routeId}-distances`, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: distanceLabels
            }
          });

          // Add distance labels layer
          map.addLayer({
            id: `${routeId}-distances`,
            type: 'symbol',
            source: `${routeId}-distances`,
            layout: {
              'text-field': ['get', 'distance_label'],
              'text-size': 10,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-anchor': 'center',
              'text-allow-overlap': true,
              'text-rotation-alignment': 'map',
              'text-pitch-alignment': 'viewport'
            },
            paint: {
              'text-color': '#444',
              'text-halo-color': '#fff',
              'text-halo-width': 2,
              'text-opacity': 0.85
            }
          });
        }

        // Helper function to parse items from JSON string
        const parseItems = (itemsStr) => {
          try {
            const items = JSON.parse(itemsStr);
            if (Array.isArray(items) && items.length > 0) {
              return items.map(item => `${item.name} (${item.quantity})`).join(', ');
            }
            return 'No items';
          } catch (e) {
            return 'Items info unavailable';
          }
        };

        // Click handler for stop markers
        map.on('click', `${routeId}-stops`, (e) => {
          const properties = e.features[0].properties;
          const coordinates = e.features[0].geometry.coordinates.slice();
          const statusColor = properties.order_status === 'delivered' ? '#4CAF50' :
                             properties.order_status === 'in_delivery' ? '#FF9800' : '#2196F3';
          const statusEmoji = properties.order_status === 'delivered' ? '✓' :
                             properties.order_status === 'in_delivery' ? '●' : '○';
          const itemsText = parseItems(properties.items);

          // Enhanced popup HTML
          const popupHTML = `
            <div style="padding: 12px; font-size: 12px; width: 320px; font-family: Arial, sans-serif;">
              <div style="border-bottom: 2px solid ${statusColor}; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="font-size: 14px; font-weight: bold; color: #333;">
                  Stop ${properties.stop_number} - ${properties.customer_name}
                </div>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">Order ID:</span> <strong>#${properties.order_id}</strong>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">Tracking:</span> <strong>${properties.tracking_number || 'N/A'}</strong>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">📍 Address:</span> <strong>${properties.delivery_address}</strong>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">📞 Phone:</span>
                <a href="tel:${properties.customer_phone}" style="color: #2196F3; text-decoration: none; font-weight: bold;">
                  ${properties.customer_phone}
                </a>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">⏱️ ETA:</span>
                <strong style="color: #FF6B6B;">${properties.eta_label}</strong>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">📦 Items:</span> <strong>${itemsText}</strong>
              </div>

              <div style="margin-bottom: 6px;">
                <span style="color: #666;">💰 Amount:</span>
                <strong style="color: #2ECC71;">Le ${parseInt(properties.total_amount).toLocaleString()}</strong>
              </div>

              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <span style="color: #666;">Status:</span>
                <span style="color: ${statusColor}; font-weight: bold; margin-left: 4px;">
                  ${statusEmoji} ${properties.order_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          `;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map);

          if (onStopClick) {
            onStopClick(properties);
          }
        });

        // Hover effects
        map.on('mouseenter', `${routeId}-stops`, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', `${routeId}-stops`, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    });

    // Add depot marker if coordinates provided
    if (depotCoordinates) {
      map.addSource('depot-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: depotCoordinates
          },
          properties: {
            name: 'Depot',
            type: 'depot'
          }
        }
      });

      map.addLayer({
        id: 'depot-marker',
        type: 'circle',
        source: 'depot-marker',
        paint: {
          'circle-radius': 15,
          'circle-color': '#2ECC71',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
          'circle-opacity': 1
        }
      });

      // Add depot label
      map.addLayer({
        id: 'depot-label',
        type: 'symbol',
        source: 'depot-marker',
        layout: {
          'text-field': '📍',
          'text-size': 20,
          'text-anchor': 'center'
        }
      });
    }
    }; // End of renderRoutes function

    // Call renderRoutes when map is ready
    if (map.isStyleLoaded()) {
      renderRoutes();
    } else {
      map.once('load', renderRoutes);
    }

    // Cleanup listener on unmount
    return () => {
      map.off('load', renderRoutes);
    };

  }, [routes, depotCoordinates, onStopClick]);

  return (
    <div class="maplibre-wrapper">
      {loading && <div class="map-spinner">Loading map...</div>}
      {error && <div class="map-error">{error}</div>}
      <div ref={containerRef} class="maplibre-container" />
    </div>
  );
}
