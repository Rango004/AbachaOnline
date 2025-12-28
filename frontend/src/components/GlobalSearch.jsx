import { useState, useRef, useEffect } from 'preact/hooks';

export default function GlobalSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Simulated search - in production this would call an API endpoint
  const performSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Mock search results - replace with API call in production
    const mockResults = [
      // Merchants
      ...Array(3).fill(null).map((_, i) => ({
        type: 'merchant',
        id: i + 1,
        name: `${query} Merchant ${i + 1}`,
        phone: '+232' + Math.random().toString().slice(2, 10),
        revenue: Math.random() * 50000,
      })),
      // Riders
      ...Array(2).fill(null).map((_, i) => ({
        type: 'rider',
        id: i + 100,
        name: `${query} Rider ${i + 1}`,
        phone: '+232' + Math.random().toString().slice(2, 10),
        deliveries: Math.floor(Math.random() * 100),
      })),
      // Customers
      ...Array(2).fill(null).map((_, i) => ({
        type: 'customer',
        id: i + 200,
        name: `${query} Customer ${i + 1}`,
        phone: '+232' + Math.random().toString().slice(2, 10),
        orders: Math.floor(Math.random() * 50),
      })),
      // Orders
      ...Array(2).fill(null).map((_, i) => ({
        type: 'order',
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        trackingNumber: Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: ['pending', 'confirmed', 'in_delivery', 'delivered'][Math.floor(Math.random() * 4)],
        totalAmount: Math.random() * 100000,
      })),
    ];

    setSearchResults(mockResults.filter(r =>
      r.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.phone?.includes(query) ||
      r.id?.toString().includes(query) ||
      r.trackingNumber?.includes(query)
    ).slice(0, 10));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result) => {
    onSearch(result);
    setSearchTerm('');
    setIsOpen(false);
  };

  const getTypeIcon = (type) => {
    const icons = {
      merchant: '🏪',
      rider: '🚗',
      customer: '👤',
      order: '📦',
    };
    return icons[type] || '🔍';
  };

  const getTypeLabel = (type) => {
    const labels = {
      merchant: 'Merchant',
      rider: 'Rider',
      customer: 'Customer',
      order: 'Order',
    };
    return labels[type] || type;
  };

  return (
    <div class="global-search" ref={searchRef}>
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search merchants, riders, customers, orders..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => searchTerm && setIsOpen(true)}
          class="search-input"
        />
        {searchTerm && (
          <button
            class="clear-btn"
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div class="search-results">
          {searchResults.length > 0 ? (
            <div class="results-list">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  class="result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <span class="result-icon">{getTypeIcon(result.type)}</span>
                  <div class="result-content">
                    <div class="result-title">
                      {result.name || result.id}
                      <span class="result-type">{getTypeLabel(result.type)}</span>
                    </div>
                    <div class="result-meta">
                      {result.phone && <span>{result.phone}</span>}
                      {result.revenue && <span>Revenue: Le {result.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>}
                      {result.deliveries !== undefined && <span>{result.deliveries} deliveries</span>}
                      {result.orders !== undefined && <span>{result.orders} orders</span>}
                      {result.status && <span class={`status-badge ${result.status}`}>{result.status}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div class="no-results">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <div class="search-hint">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}

      <style>{`
        .global-search {
          position: relative;
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
        }

        .search-icon {
          padding: 0 12px;
          color: #6b7280;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 10px 8px;
          font-size: 0.9em;
          outline: none;
          background: transparent;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-btn {
          padding: 0 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 1.2em;
          transition: color 0.3s ease;
        }

        .clear-btn:hover {
          color: #1f2937;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .results-list {
          padding: 8px 0;
        }

        .result-item {
          padding: 12px 12px;
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid #f3f4f6;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item:hover {
          background: #f9fafb;
        }

        .result-icon {
          font-size: 1.5em;
          flex-shrink: 0;
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-title {
          font-size: 0.9em;
          font-weight: 500;
          color: #1f2937;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .result-type {
          font-size: 0.7em;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
        }

        .result-meta {
          font-size: 0.8em;
          color: #6b7280;
          margin-top: 4px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .status-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 500;
        }

        .status-badge.delivered {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge.in_delivery {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.pending,
        .status-badge.confirmed {
          background: #fef3c7;
          color: #92400e;
        }

        .no-results,
        .search-hint {
          padding: 20px 12px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
        }

        .no-results {
          color: #ef4444;
        }

        .search-hint {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
