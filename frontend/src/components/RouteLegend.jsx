import '../styles/RouteLegend.css';

/**
 * RouteLegend Component
 * Displays a legend for route comparison showing:
 * - Primary route (blue, solid) - Clarke-Wright algorithm
 * - Alternate route (green, dashed) - Nearest Neighbor algorithm
 * - Depot marker location
 */
export default function RouteLegend({ routes = [] }) {
  const getAlgorithmName = (algorithm) => {
    if (algorithm === 'clarke_wright') return 'Clarke-Wright';
    if (algorithm === 'nearest_neighbor') return 'Nearest Neighbor';
    return 'Unknown Algorithm';
  };

  const getRouteColor = (type) => {
    return type === 'primary' ? '#2196F3' : '#4CAF50';
  };

  const isLineSolid = (type) => {
    return type === 'primary';
  };

  return (
    <div class="route-legend">
      <div class="legend-title">Routes</div>

      {routes.map(route => (
        <div key={route.type} class="legend-item">
          <div
            class={`legend-line ${isLineSolid(route.type) ? 'solid' : 'dashed'}`}
            style={{ backgroundColor: getRouteColor(route.type) }}
          />
          <span class="legend-label">
            <strong>{route.type === 'primary' ? 'Primary' : 'Alternate'}:</strong> {getAlgorithmName(route.algorithm)}
          </span>
        </div>
      ))}

      <div class="legend-item">
        <div
          class="legend-marker depot"
          style={{ backgroundColor: '#2ECC71' }}
        />
        <span class="legend-label">
          <strong>Depot</strong>
        </span>
      </div>
    </div>
  );
}
