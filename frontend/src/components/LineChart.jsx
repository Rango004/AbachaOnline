import { useEffect, useRef } from 'preact/hooks';
import Chart from 'chart.js/auto';

export default function LineChart({ data, options, title, height = '400px' }) {
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
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            },
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: data,
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
