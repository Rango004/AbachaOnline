import { useState } from 'preact/hooks';

export default function ExportPanel({ data = [], columns = [], title = 'Export' }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState(columns.map(c => c.key));

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  const exportToCSV = () => {
    const selectedCols = columns.filter(c => selectedColumns.includes(c.key));

    // Create CSV header
    const header = selectedCols.map(c => `"${c.label}"`).join(',');

    // Create CSV rows
    const rows = data.map(item =>
      selectedCols.map(col => {
        let value = item[col.key];
        if (value === undefined || value === null) value = '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',')) value = `"${value}"`;
        }
        return value;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    downloadFile(csv, `${title}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    const selectedCols = columns.filter(c => selectedColumns.includes(c.key));
    const filtered = data.map(item => {
      const obj = {};
      selectedCols.forEach(col => {
        obj[col.label] = item[col.key];
      });
      return obj;
    });

    const json = JSON.stringify(filtered, null, 2);
    downloadFile(json, `${title}.json`, 'application/json');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div class="export-panel">
      <div class="export-header">
        <h3>📊 Export Data</h3>
        <p class="export-subtitle">Select columns and format to export</p>
      </div>

      <div class="export-format">
        <h4>Export Format</h4>
        <div class="format-options">
          <label class="format-label">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            <span>📄 CSV (Excel compatible)</span>
          </label>
          <label class="format-label">
            <input
              type="radio"
              name="format"
              value="json"
              checked={exportFormat === 'json'}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            <span>📋 JSON (Structured data)</span>
          </label>
        </div>
      </div>

      <div class="export-columns">
        <h4>Select Columns ({selectedColumns.length}/{columns.length})</h4>
        <div class="column-grid">
          {columns.map(column => (
            <label key={column.key} class="column-checkbox">
              <input
                type="checkbox"
                checked={selectedColumns.includes(column.key)}
                onChange={() => handleColumnToggle(column.key)}
              />
              <span>{column.label}</span>
            </label>
          ))}
        </div>
        <div class="column-actions">
          <button
            class="column-action-btn"
            onClick={() => setSelectedColumns(columns.map(c => c.key))}
          >
            Select All
          </button>
          <button
            class="column-action-btn clear"
            onClick={() => setSelectedColumns([])}
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="export-stats">
        <div class="stat-item">
          <span class="stat-label">Total Records</span>
          <span class="stat-value">{data.length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Selected Columns</span>
          <span class="stat-value">{selectedColumns.length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Export Size</span>
          <span class="stat-value">~{Math.ceil((data.length * selectedColumns.length * 50) / 1024)}KB</span>
        </div>
      </div>

      <div class="export-actions">
        <button
          class="export-btn"
          onClick={exportToCSV}
          disabled={selectedColumns.length === 0}
        >
          📥 Export as CSV
        </button>
        <button
          class="export-btn json"
          onClick={exportToJSON}
          disabled={selectedColumns.length === 0}
        >
          📥 Export as JSON
        </button>
      </div>

      <style>{`
        .export-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .export-header {
          margin-bottom: 20px;
        }

        .export-header h3 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .export-subtitle {
          margin: 0;
          font-size: 0.85em;
          color: #6b7280;
        }

        .export-format,
        .export-columns {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .export-format h4,
        .export-columns h4 {
          margin: 0 0 12px 0;
          font-size: 0.95em;
          color: #1f2937;
          font-weight: 600;
        }

        .format-options {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .format-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9em;
          color: #6b7280;
        }

        .format-label input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .format-label:hover {
          color: #1f2937;
        }

        .column-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .column-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.85em;
          color: #6b7280;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .column-checkbox:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #1f2937;
        }

        .column-checkbox input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .column-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .column-action-btn {
          padding: 6px 12px;
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .column-action-btn:hover:not(:disabled) {
          background: #e5e7eb;
          color: #1f2937;
        }

        .column-action-btn.clear {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
        }

        .column-action-btn.clear:hover:not(:disabled) {
          background: #fecaca;
        }

        .column-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.75em;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.1em;
          font-weight: 700;
          color: #1f2937;
        }

        .export-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .export-btn {
          padding: 12px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .export-btn:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .export-btn.json {
          background: #8b5cf6;
        }

        .export-btn.json:hover:not(:disabled) {
          background: #7c3aed;
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .column-grid {
            grid-template-columns: 1fr 1fr;
          }

          .export-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
