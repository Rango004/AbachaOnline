import { useState } from 'preact/hooks';

export default function FilterPanel({ filterConfig, onFilterChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState(
    filterConfig.fields.reduce((acc, field) => {
      acc[field.name] = field.default || '';
      return acc;
    }, {})
  );

  const handleFilterChange = (fieldName, value) => {
    const updatedFilters = { ...filters, [fieldName]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = filterConfig.fields.reduce((acc, field) => {
      acc[field.name] = field.default || '';
      return acc;
    }, {});
    setFilters(resetFilters);
    onReset();
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null).length;

  return (
    <div class="filter-panel">
      <div class="filter-header">
        <button
          class="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span class="filter-icon">⚙️</span>
          <span class="filter-label">Filters</span>
          {activeFilterCount > 0 && (
            <span class="filter-count">{activeFilterCount}</span>
          )}
          <span class={`chevron ${isExpanded ? 'open' : ''}`}>▼</span>
        </button>

        {activeFilterCount > 0 && (
          <button class="reset-btn" onClick={handleReset}>
            ↺ Reset
          </button>
        )}
      </div>

      {isExpanded && (
        <div class="filter-content">
          <div class="filter-grid">
            {filterConfig.fields.map((field) => (
              <div key={field.name} class="filter-field">
                <label class="filter-label-text">{field.label}</label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={filters[field.name] || ''}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                    class="filter-input"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={filters[field.name] || ''}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                    class="filter-select"
                  >
                    <option value="">All {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'range' && (
                  <div class="range-inputs">
                    <input
                      type="number"
                      placeholder={`Min ${field.label}`}
                      value={filters[field.name]?.min || ''}
                      onChange={(e) =>
                        handleFilterChange(field.name, {
                          ...filters[field.name],
                          min: e.target.value,
                        })
                      }
                      class="filter-input"
                    />
                    <span class="range-separator">-</span>
                    <input
                      type="number"
                      placeholder={`Max ${field.label}`}
                      value={filters[field.name]?.max || ''}
                      onChange={(e) =>
                        handleFilterChange(field.name, {
                          ...filters[field.name],
                          max: e.target.value,
                        })
                      }
                      class="filter-input"
                    />
                  </div>
                )}

                {field.type === 'checkbox-group' && (
                  <div class="checkbox-group">
                    {field.options?.map((option) => (
                      <label key={option.value} class="checkbox-label">
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(filters[field.name]) &&
                            filters[field.name].includes(option.value)
                          }
                          onChange={(e) => {
                            const currentValues = filters[field.name] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v) => v !== option.value);
                            handleFilterChange(field.name, newValues);
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div class="filter-actions">
            <button class="apply-btn" onClick={() => setIsExpanded(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <style>{`
        .filter-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 500;
          color: #1f2937;
          transition: all 0.3s ease;
        }

        .filter-toggle:hover {
          color: #3b82f6;
        }

        .filter-icon {
          font-size: 1.1em;
        }

        .filter-label {
          font-weight: 600;
        }

        .filter-count {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.75em;
          font-weight: 700;
        }

        .chevron {
          transition: transform 0.3s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .reset-btn {
          padding: 6px 12px;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .reset-btn:hover {
          background: #fecaca;
        }

        .filter-content {
          padding: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label-text {
          font-size: 0.85em;
          font-weight: 600;
          color: #1f2937;
        }

        .filter-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.85em;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .range-inputs .filter-input {
          flex: 1;
        }

        .range-separator {
          color: #d1d5db;
          padding: 0 4px;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.85em;
          color: #6b7280;
        }

        .checkbox-label input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .checkbox-label:hover {
          color: #1f2937;
        }

        .filter-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .apply-btn {
          flex: 1;
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .apply-btn:hover {
          background: #2563eb;
        }

        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
