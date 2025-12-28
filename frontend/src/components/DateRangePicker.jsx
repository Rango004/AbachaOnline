import { useState } from 'preact/hooks';

export default function DateRangePicker({ onDateRangeChange }) {
  const [preset, setPreset] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = (presetType) => {
    const today = new Date();
    let startDate, endDate = today;

    switch (presetType) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case '7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      case '365days':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return null;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handlePresetChange = (presetType) => {
    setPreset(presetType);
    const range = getDateRange(presetType);
    if (range) {
      onDateRangeChange(range);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange({
        startDate: customStartDate,
        endDate: customEndDate,
      });
      setPreset('custom');
    }
  };

  return (
    <div class="date-range-picker">
      <div class="picker-header">
        <h4>Date Range</h4>
      </div>

      <div class="preset-buttons">
        {[
          { label: 'Today', value: 'today' },
          { label: 'This Week', value: 'week' },
          { label: 'This Month', value: 'month' },
          { label: 'Last 7 Days', value: '7days' },
          { label: 'Last 30 Days', value: '30days' },
          { label: 'Last 90 Days', value: '90days' },
          { label: 'Last Year', value: '365days' },
        ].map((item) => (
          <button
            key={item.value}
            class={`preset-btn ${preset === item.value ? 'active' : ''}`}
            onClick={() => handlePresetChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div class="custom-date-section">
        <h5>Custom Range</h5>
        <div class="custom-inputs">
          <div class="input-group">
            <label>From</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </div>
          <div class="input-group">
            <label>To</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
        </div>
        <button class="apply-btn" onClick={handleCustomDateChange}>
          Apply Custom Range
        </button>
      </div>

      <style>{`
        .date-range-picker {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .picker-header {
          margin-bottom: 12px;
        }

        .picker-header h4 {
          margin: 0;
          font-size: 0.95em;
          color: #1f2937;
          font-weight: 600;
        }

        .preset-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .preset-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          transition: all 0.3s ease;
          text-align: left;
          color: #6b7280;
        }

        .preset-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .preset-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .custom-date-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }

        .custom-date-section h5 {
          margin: 0 0 12px 0;
          font-size: 0.85em;
          color: #1f2937;
          font-weight: 600;
        }

        .custom-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group label {
          font-size: 0.75em;
          color: #6b7280;
          font-weight: 500;
        }

        .input-group input {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.85em;
        }

        .apply-btn {
          width: 100%;
          padding: 8px 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .apply-btn:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
