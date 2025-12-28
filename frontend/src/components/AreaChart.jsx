import { useEffect, useRef } from 'preact/hooks';
import Chart from 'chart.js/auto';

export default function AreaChart({ data, options, title, height = '400px' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!title,
          text: title,
          font: { size: 16, weight: 'bold' },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            },
          },
        },
        x: {
          stacked: true,
        },
      },
    };

    // Prepare data with fill and tension for area effect
    const enhancedData = {
      ...data,
      datasets: (data.datasets || []).map((dataset) => ({
        ...dataset,
        fill: true,
        tension: 0.4,
        backgroundColor: dataset.backgroundColor ? `${dataset.backgroundColor}33` : 'rgba(75, 192, 192, 0.2)',
        borderColor: dataset.borderColor || 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      })),
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: enhancedData,
      options: { ...defaultOptions, ...options },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, options, title]);

  return (
    <div style={{ height, position: 'relative' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
