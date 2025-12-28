import { useEffect, useState } from 'preact/hooks';

/**
 * Tile Coordinate Visual Debugger
 * Shows tile coordinates being loaded vs expected coordinates
 * Helps identify coordinate system misalignment
 */
export default function TileDebugger({ map }) {
  const [debugInfo, setDebugInfo] = useState({
    mapCenter: null,
    zoom: null,
    expectedTile: null,
    loadedTiles: [],
    offset: null,
    accuracy: null
  });

  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!map) return;

    const updateDebugInfo = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Calculate expected tile for center
      const expectedTile = latlonToTile(center.lat, center.lng, zoom);

      // Get loaded tiles
      const loadedTiles = [];
      document.querySelectorAll('img[src*="tile.openstreetmap"]').forEach((img) => {
        const match = img.src.match(/(\d+)\/(\d+)\/(\d+)\.png/);
        if (match) {
          const z = parseInt(match[1]);
          const x = parseInt(match[2]);
          const y = parseInt(match[3]);

          if (z === zoom) {
            loadedTiles.push({ x, y, z, url: img.src });
          }
        }
      });

      // Calculate offset
      let offset = null;
      if (loadedTiles.length > 0) {
        const avgLoadedX = loadedTiles.reduce((sum, t) => sum + t.x, 0) / loadedTiles.length;
        const avgLoadedY = loadedTiles.reduce((sum, t) => sum + t.y, 0) / loadedTiles.length;

        offset = {
          x: expectedTile.x - avgLoadedX,
          y: expectedTile.y - avgLoadedY,
          tiles: loadedTiles.length
        };
      }

      // Check accuracy
      let accuracy = 'Unknown';
      if (offset) {
        if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
          accuracy = '✅ EXCELLENT - Within 1 tile';
        } else if (Math.abs(offset.x) <= 2 && Math.abs(offset.y) <= 2) {
          accuracy = '⚠️ GOOD - Within 2 tiles';
        } else {
          accuracy = '❌ POOR - Offset > 2 tiles';
        }
      }

      setDebugInfo({
        mapCenter: center,
        zoom,
        expectedTile,
        loadedTiles,
        offset,
        accuracy
      });
    };

    // Update on map events
    map.on('moveend', updateDebugInfo);
    map.on('zoomend', updateDebugInfo);

    // Initial update
    updateDebugInfo();

    // Update every 2 seconds while visible
    const interval = setInterval(updateDebugInfo, 2000);

    return () => {
      map.off('moveend', updateDebugInfo);
      map.off('zoomend', updateDebugInfo);
      clearInterval(interval);
    };
  }, [map]);

  if (!debugInfo.mapCenter) return null;

  return (
    <div class="tile-debugger">
      <button class="debug-toggle" onClick={() => setShowPanel(!showPanel)}>
        🔧 Tile Debug {showPanel ? '▼' : '▶'}
      </button>

      {showPanel && (
        <div class="debug-panel">
          <h3>🐛 Enhanced Tile Debug</h3>

          {/* Map Center Info */}
          <div class="debug-section">
            <h4>Map Position</h4>
            <div class="debug-row">
              <span>Center:</span>
              <code>
                {debugInfo.mapCenter.lat.toFixed(6)}, {debugInfo.mapCenter.lng.toFixed(6)}
              </code>
            </div>
            <div class="debug-row">
              <span>Zoom:</span>
              <code>{debugInfo.zoom}</code>
            </div>
          </div>

          {/* Expected Tile */}
          <div class="debug-section">
            <h4>Expected Tile</h4>
            <div class="debug-row">
              <span>X:</span>
              <code class="tile-expected-x">{debugInfo.expectedTile.x}</code>
            </div>
            <div class="debug-row">
              <span>Y:</span>
              <code class="tile-expected-y">{debugInfo.expectedTile.y}</code>
            </div>
            <div class="debug-row">
              <span>Z:</span>
              <code>{debugInfo.expectedTile.z}</code>
            </div>
          </div>

          {/* Loaded Tiles with URLs */}
          <div class="debug-section">
            <h4>Loaded Tiles ({debugInfo.loadedTiles.length})</h4>
            {debugInfo.loadedTiles.length === 0 ? (
              <p class="no-tiles">No tiles loaded at current zoom</p>
            ) : (
              <>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', padding: '6px', backgroundColor: '#f9f9f9', borderRadius: '3px' }}>
                  <strong>Sample URL:</strong><br />
                  {debugInfo.loadedTiles.length > 0 ? (
                    <code style={{ fontSize: '9px', wordBreak: 'break-all' }}>
                      {debugInfo.loadedTiles[0].url}
                    </code>
                  ) : 'N/A'}
                </div>
                <div class="tiles-grid">
                  {debugInfo.loadedTiles.map((tile) => (
                    <div key={`${tile.x}-${tile.y}`} class="tile-item">
                      <div class="tile-coords">
                        x={tile.x} y={tile.y}
                      </div>
                      <div class="tile-status">
                        {tile.x === debugInfo.expectedTile.x &&
                        tile.y === debugInfo.expectedTile.y
                          ? '✓ CENTER'
                          : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Offset Analysis */}
          {debugInfo.offset && (
            <div class="debug-section">
              <h4>Offset Analysis</h4>
              <div class={`accuracy-indicator ${debugInfo.accuracy.includes('EXCELLENT') ? 'excellent' : debugInfo.accuracy.includes('GOOD') ? 'good' : 'poor'}`}>
                {debugInfo.accuracy}
              </div>
              <div class="debug-row">
                <span>X Offset:</span>
                <code class={debugInfo.offset.x === 0 ? 'perfect' : 'offset'}>
                  {debugInfo.offset.x > 0 ? '+' : ''}{debugInfo.offset.x.toFixed(1)}
                </code>
              </div>
              <div class="debug-row">
                <span>Y Offset:</span>
                <code class={debugInfo.offset.y === 0 ? 'perfect' : 'offset'}>
                  {debugInfo.offset.y > 0 ? '+' : ''}{debugInfo.offset.y.toFixed(1)}
                </code>
              </div>
              <div class="offset-interpretation">
                {Math.abs(debugInfo.offset.x) > 1 || Math.abs(debugInfo.offset.y) > 1 ? (
                  <>
                    <strong>⚠️ Coordinate Issue Detected:</strong>
                    <ul>
                      {Math.abs(debugInfo.offset.x) > 1 && (
                        <li>
                          X offset: {debugInfo.offset.x > 0 ? 'Tiles loaded EAST (right)' : 'Tiles loaded WEST (left)'}
                        </li>
                      )}
                      {Math.abs(debugInfo.offset.y) > 1 && (
                        <li>
                          Y offset: {debugInfo.offset.y > 0 ? 'Tiles loaded SOUTH (down)' : 'Tiles loaded NORTH (up)'}
                        </li>
                      )}
                    </ul>
                  </>
                ) : (
                  '✓ Coordinates are aligned!'
                )}
              </div>
            </div>
          )}

          {/* Visual Grid */}
          <div class="debug-section">
            <h4>Tile Grid Visualization</h4>
            <TileGridVisualization
              expectedTile={debugInfo.expectedTile}
              loadedTiles={debugInfo.loadedTiles}
            />
          </div>

          {/* Copy Debug Info */}
          <div class="debug-section">
            <button
              class="btn-copy"
              onClick={() => {
                const info = JSON.stringify(debugInfo, null, 2);
                navigator.clipboard.writeText(info);
                alert('Debug info copied to clipboard');
              }}
            >
              📋 Copy Debug Info
            </button>
          </div>
        </div>
      )}

      <style>{`
        .tile-debugger {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1400;
          font-family: monospace;
          font-size: 11px;
        }

        .debug-toggle {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .debug-toggle:hover {
          background: #764ba2;
          transform: scale(1.05);
        }

        .debug-panel {
          position: fixed;
          top: 60px;
          left: 20px;
          background: white;
          border: 2px solid #667eea;
          border-radius: 6px;
          padding: 12px;
          max-width: 320px;
          max-height: 70vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1401;
        }

        .debug-panel h3 {
          margin: 0 0 12px 0;
          color: #667eea;
          font-size: 13px;
          text-transform: uppercase;
        }

        .debug-panel h4 {
          margin: 8px 0 6px 0;
          color: #333;
          font-size: 11px;
          background: #f0f0f0;
          padding: 4px 6px;
          border-left: 3px solid #667eea;
        }

        .debug-section {
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        .debug-section:last-child {
          border-bottom: none;
        }

        .debug-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          gap: 8px;
        }

        .debug-row span {
          color: #666;
          flex: 1;
        }

        .debug-row code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          color: #333;
          font-weight: bold;
          flex-shrink: 0;
        }

        .tile-expected-x,
        .tile-expected-y {
          background: #e8f5e9 !important;
          color: #2e7d32 !important;
        }

        .tile-item {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 6px;
          margin: 4px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tile-coords {
          font-weight: bold;
          color: #333;
        }

        .tile-status {
          background: #4caf50;
          color: white;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 10px;
        }

        .tiles-grid {
          max-height: 120px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 6px;
          background: #fafafa;
        }

        .accuracy-indicator {
          padding: 6px 8px;
          border-radius: 3px;
          margin-bottom: 8px;
          font-weight: bold;
          text-align: center;
        }

        .accuracy-indicator.excellent {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #2e7d32;
        }

        .accuracy-indicator.good {
          background: #fff3e0;
          color: #e65100;
          border: 1px solid #e65100;
        }

        .accuracy-indicator.poor {
          background: #ffebee;
          color: #d32f2f;
          border: 1px solid #d32f2f;
        }

        .offset-interpretation {
          background: #f5f5f5;
          padding: 6px;
          border-radius: 3px;
          font-size: 10px;
          color: #333;
          line-height: 1.4;
        }

        .offset-interpretation strong {
          display: block;
          margin-bottom: 4px;
        }

        .offset-interpretation ul {
          margin: 0;
          padding-left: 16px;
        }

        .offset-interpretation li {
          margin: 2px 0;
        }

        code.perfect {
          background: #e8f5e9 !important;
          color: #2e7d32 !important;
        }

        code.offset {
          background: #ffebee !important;
          color: #d32f2f !important;
        }

        .no-tiles {
          color: #999;
          font-style: italic;
          padding: 6px;
        }

        .btn-copy {
          width: 100%;
          padding: 6px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          margin-top: 8px;
        }

        .btn-copy:hover {
          background: #764ba2;
        }

        @media (max-width: 480px) {
          .debug-panel {
            max-width: calc(100vw - 40px);
          }
        }
      `}</style>
    </div>
  );
}

function latlonToTile(lat, lon, zoom) {
  // Use standard OSM Slippy Map tile calculation
  // This matches exactly what OSM tile servers expect
  const n = Math.pow(2, zoom);
  
  // X coordinate: longitude to tile column
  const x = Math.floor(((lon + 180) / 360) * n);
  
  // Y coordinate: latitude to tile row (with Web Mercator projection)
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  
  // Clamp to valid tile bounds
  return {
    x: Math.max(0, Math.min(n - 1, x)),
    y: Math.max(0, Math.min(n - 1, y)),
    z: zoom
  };
}

function TileGridVisualization({ expectedTile, loadedTiles }) {
  const gridSize = 3;
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  // Mark expected tile in center
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  grid[centerY][centerX] = 'expected';

  // Mark loaded tiles
  loadedTiles.forEach((tile) => {
    const dx = tile.x - expectedTile.x;
    const dy = tile.y - expectedTile.y;

    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      const gx = centerX + dx;
      const gy = centerY + dy;

      if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
        grid[gy][gx] = 'loaded';
      }
    }
  });

  return (
    <div style={{ fontSize: '10px', textAlign: 'center' }}>
      <table style={{ margin: '6px auto', borderCollapse: 'collapse' }}>
        <tbody>
          {grid.map((row, y) => (
            <tr key={y}>
              {row.map((cell, x) => (
                <td
                  key={`${x}-${y}`}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    background:
                      cell === 'expected'
                        ? '#e8f5e9'
                        : cell === 'loaded'
                          ? '#e3f2fd'
                          : 'white',
                    color: cell === 'expected' ? '#2e7d32' : cell === 'loaded' ? '#1565c0' : '#999'
                  }}
                >
                  {cell === 'expected' ? '◆' : cell === 'loaded' ? '■' : '□'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <small>
        <div>◆ = Expected center tile</div>
        <div>■ = Loaded tiles</div>
      </small>
    </div>
  );
}
