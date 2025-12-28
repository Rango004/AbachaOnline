import '../styles/RouteProgress.css';

/**
 * RouteProgress Component
 * Displays delivery progress with visual indicators
 * Shows completed stops, current stop, and remaining stops
 * Displays time elapsed vs total estimated time
 */
export default function RouteProgress({
  route = null,
  currentStopIndex = 0,
  showProgressBar = true
}) {
  if (!route || !route.itinerary || route.itinerary.length === 0) {
    return null;
  }

  const totalStops = route.itinerary.length;
  const completedStops = route.itinerary.filter(
    stop => stop.order_status === 'delivered'
  ).length;
  const completionPercentage = (completedStops / totalStops) * 100;

  // Calculate time elapsed and remaining
  const totalTimeMinutes = route.time_estimate?.total_estimated_time_minutes ||
                          (totalStops * 8); // fallback: 8 min per stop
  const elapsedTime = currentStopIndex * 8; // 8 minutes per completed stop
  const remainingTime = Math.max(0, totalTimeMinutes - elapsedTime);
  const elapsedPercentage = (elapsedTime / totalTimeMinutes) * 100;

  // Helper function to format minutes to readable time
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  // Get status emoji for each stop
  const getStopStatusEmoji = (stop) => {
    if (stop.order_status === 'delivered') return '✓';
    if (stop.order_status === 'in_delivery') return '●';
    return '○';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'in_delivery':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  return (
    <div class="route-progress-container">
      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" class="sr-only">
        {completedStops} of {totalStops} stops completed. {remainingTime} minutes remaining.
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-title">
              📦 Delivery Progress
            </span>
            <span class="progress-stats">
              {completedStops} of {totalStops} stops
            </span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill-completed"
              style={{ width: `${completionPercentage}%` }}
              title={`${completedStops} completed`}
            />
            {currentStopIndex < totalStops && (
              <div
                class="progress-fill-current"
                style={{
                  width: `${Math.min(100 - completionPercentage, 100 / totalStops)}%`,
                  marginLeft: `${completionPercentage}%`
                }}
                title="In progress"
              />
            )}
          </div>

          <div class="progress-labels">
            <span class="label-completed">
              ✓ {completedStops} Completed
            </span>
            <span class="label-current">
              ● {Math.min(1, totalStops - completedStops)} In Progress
            </span>
            <span class="label-remaining">
              ○ {Math.max(0, totalStops - completedStops - 1)} Remaining
            </span>
          </div>
        </div>
      )}

      {/* Time Progress */}
      <div class="time-section">
        <div class="time-header">
          <span class="time-title">⏱️ Time Estimate</span>
        </div>

        <div class="time-bar">
          <div
            class="time-fill-elapsed"
            style={{ width: `${elapsedPercentage}%` }}
            title={`${formatTime(elapsedTime)} elapsed`}
          />
        </div>

        <div class="time-labels">
          <div class="time-left">
            <span class="label">Elapsed:</span>
            <strong>{formatTime(elapsedTime)}</strong>
          </div>
          <div class="time-center">
            <span class="label">Total:</span>
            <strong>{formatTime(totalTimeMinutes)}</strong>
          </div>
          <div class="time-right">
            <span class="label">Remaining:</span>
            <strong>{formatTime(remainingTime)}</strong>
          </div>
        </div>
      </div>

      {/* Stop Sequence Indicator */}
      <div class="stops-sequence-section">
        <div class="sequence-header">
          📍 Delivery Sequence
        </div>

        <div class="stops-sequence">
          {route.itinerary.map((stop, index) => (
            <div
              key={stop.order_id}
              class={`sequence-item ${
                stop.order_status === 'delivered' ? 'completed' :
                stop.order_status === 'in_delivery' ? 'current' : 'pending'
              }`}
              title={`Stop ${stop.stop_number || index + 1}: ${stop.customer_name}`}
            >
              <div class="sequence-indicator">
                <span
                  class="status-emoji"
                  style={{ color: getStatusColor(stop.order_status) }}
                >
                  {getStopStatusEmoji(stop)}
                </span>
                <span class="stop-number">{stop.stop_number || index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        <div class="legend">
          <span class="legend-item">
            <span style={{ color: '#4CAF50' }}>✓</span> Delivered
          </span>
          <span class="legend-item">
            <span style={{ color: '#FF9800' }}>●</span> In Progress
          </span>
          <span class="legend-item">
            <span style={{ color: '#2196F3' }}>○</span> Pending
          </span>
        </div>
      </div>
    </div>
  );
}
