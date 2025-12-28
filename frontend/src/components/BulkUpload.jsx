import { h } from 'preact';
import { useState } from 'preact/hooks';
import api from '../services/api';

export default function BulkUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const csv = 'name,description,price,category,stock_quantity,image_url\n' +
      'Rice,White long grain rice,5000,food,100,\n' +
      'Notebook,A4 lined notebook,2000,stationery,50,\n' +
      'Pen,Blue ballpoint pen,500,stationery,200,';
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and at least one product');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.every(v => !v)) continue;

      const product = {};
      headers.forEach((header, idx) => {
        if (values[idx]) product[header] = values[idx];
      });
      products.push(product);
    }

    return products;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setResults(null);

      const text = await file.text();
      const products = parseCSV(text);

      if (products.length === 0) {
        throw new Error('No valid products found in CSV');
      }

      const result = await api.bulkImportProducts(products);
      setResults(result);

      if (result.successful > 0) {
        setTimeout(() => onSuccess?.(), 1500);
      }
    } catch (err) {
      setResults({
        successful: 0,
        failed: 1,
        errors: [err.message]
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div class="bulk-upload">
      <div class="upload-section">
        <h3>📤 Bulk Upload Products</h3>
        <p>Upload multiple products at once using a CSV file</p>

        <div class="upload-actions">
          <button class="btn-secondary" onClick={downloadTemplate}>
            📥 Download Template
          </button>
          <label class="btn-primary upload-btn">
            {uploading ? 'Uploading...' : '📁 Choose CSV File'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div class="csv-format">
          <p><strong>CSV Format:</strong></p>
          <code>name,description,price,category,stock_quantity,image_url</code>
          <p><strong>Example:</strong></p>
          <code>Rice,White rice,5000,food,100,</code>
        </div>
      </div>

      {results && (
        <div class={`upload-results ${results.successful > 0 ? 'success' : 'error'}`}>
          <div class="results-header">
            {results.successful > 0 ? '✅ Import Completed' : '❌ Import Failed'}
          </div>
          <div class="results-stats">
            <div class="stat">
              <span class="label">Successful:</span>
              <span class="value success">{results.successful}</span>
            </div>
            <div class="stat">
              <span class="label">Failed:</span>
              <span class="value error">{results.failed}</span>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div class="errors-list">
              <p><strong>Errors:</strong></p>
              <ul>
                {results.errors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {results.errors.length > 5 && (
                  <li>... and {results.errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
