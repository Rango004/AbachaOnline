import { useEffect, useRef } from 'preact/hooks';
import Chart from 'chart.js/auto';

export default function TrendSparkline({ values, color = '#3b82f6', height = '40px', width = '100px' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !values || values.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    const data = {
      labels: values.map((_, i) => i),
      datasets: [
        {
          label: 'Trend',
          data: values,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: color,
        },
      ],
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.y.toLocaleString();
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            beginAtZero: false,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [values, color]);

  return (
    <div style={{ height, width, position: 'relative', display: 'inline-block' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
