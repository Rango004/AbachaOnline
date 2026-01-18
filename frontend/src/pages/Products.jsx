import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { CartContext } from '../services/CartContext';
import { WishlistContext } from '../services/WishlistContext';
import { ChatContext } from '../services/ChatContext';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';
import { getOptimizedImageUrl } from '../services/imageService';
import ImageCarousel from '../components/ImageCarousel';
import OfflineSync from '../services/OfflineSyncService';
import { getNetworkStatus } from '../services/NativeBridge';

export default function Products() {
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const chatContext = useContext(ChatContext);
  const { openChatWithMerchant } = chatContext || {};
  const { user, loading: authLoading } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offlineMessage, setOfflineMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('random');
  const [showFilters, setShowFilters] = useState(false);
  const [imageUrls, setImageUrls] = useState({});

  // Redirect non-customers to their appropriate dashboards
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'merchant') {
        route('/merchant');
        return;
      } else if (user.role === 'rider') {
        route('/rider');
        return;
      } else if (user.role === 'admin') {
        route('/admin');
        return;
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Only load data for customers
    if (!authLoading && (!user || user.role === 'student' || user.role === 'customer')) {
      loadInitialData();
    }
  }, [user, authLoading]);

  // Read URL search parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      setSearch(searchQuery);
      // Perform the search after products are loaded
      performSearch(searchQuery);
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allProducts, selectedCategory, minPrice, maxPrice, sortBy]);

  // Perform search programmatically (called from URL param or chatbot link)
  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      return;
    }

    try {
      setLoading(true);
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Search locally in cached products
        console.log('[Products] Offline - searching cached products');
        const cachedProducts = await OfflineSync.getCachedProducts();

        const searchLower = query.toLowerCase();
        const results = cachedProducts.filter(p =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
        );

        setAllProducts(results);
        setBrowsing(true);
        console.log(`[Products] Found ${results.length} offline search results`);
        return;
      }

      // Online search
      const data = await api.searchProducts(query);
      setAllProducts(data.products || []);
      setBrowsing(true);
    } catch (err) {
      console.error('Search error:', err);

      // Try offline search as fallback
      try {
        const cachedProducts = await OfflineSync.getCachedProducts();
        const searchLower = query.toLowerCase();
        const results = cachedProducts.filter(p =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
        );

        setAllProducts(results);
        setBrowsing(true);
        setOfflineMessage(`Offline search: found ${results.length} results`);
      } catch (cacheErr) {
        setError('Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to load image URLs for products
  const loadImageUrls = async (products) => {
    const urls = {};
    const imagePromises = [];
    const { connected } = await getNetworkStatus();

    // Collect all image URLs that need to be loaded
    const imageUrlsToCache = [];

    products.forEach((p) => {
      if (p.all_images && Array.isArray(p.all_images)) {
        p.all_images.forEach((img) => {
          if (img && img.publicId && !urls[img.publicId]) {
            imagePromises.push(
              (async () => {
                try {
                  // Get the optimized image URL
                  const imageUrl = await getOptimizedImageUrl(img.publicId);
                  urls[img.publicId] = imageUrl;

                  // When online, cache the image as blob for offline use
                  if (connected && imageUrl) {
                    imageUrlsToCache.push(imageUrl);
                  }

                  // When offline, try to use cached blob
                  if (!connected && imageUrl) {
                    const cachedUrl = await OfflineSync.getCachedImageUrl(imageUrl);
                    if (cachedUrl) {
                      urls[img.publicId] = cachedUrl;
                    }
                  }
                } catch (error) {
                  // Ignore per-image failures
                  console.warn(`[Products] Failed to load image ${img.publicId}:`, error.message);
                }
              })()
            );
          }
        });
      }
    });

    await Promise.all(imagePromises);
    setImageUrls(urls);

    // Cache images in background when online (don't block UI)
    if (connected && imageUrlsToCache.length > 0) {
      console.log(`[Products] Caching ${imageUrlsToCache.length} images in background...`);
      OfflineSync.cacheImages(imageUrlsToCache).catch(err => {
        console.error('[Products] Background image caching failed:', err);
      });
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      setOfflineMessage(null);

      const { connected } = await getNetworkStatus();

      // If offline, load from cache
      if (!connected) {
        console.log('[Products] Offline - loading from cache');
        const cachedProducts = await OfflineSync.getCachedProducts();

        if (cachedProducts && cachedProducts.length > 0) {
          setAllProducts(cachedProducts);

          // Load image URLs for cached products
          await loadImageUrls(cachedProducts);

          // Extract unique categories from cached products
          const uniqueCategories = [...new Set(cachedProducts.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);

          console.log(`[Products] Loaded ${cachedProducts.length} products from cache`);
          setOfflineMessage('Browsing in offline mode');
        } else {
          setError('No cached products available offline');
        }

        setLoading(false);
        return;
      }

      // Online - load from server
      // Load recommendations only for customers/students
      if (!user || user.role === 'student' || user.role === 'customer') {
        try {
          const recsData = await api.getRecommendations(50);
          const recs = recsData.recommendations || [];
          setRecommendations(recs);
        } catch (recErr) {
          console.warn('Recommendations not available:', recErr.message);
          // Continue without recommendations - not critical
        }
      }

      // Load all products
      const productsData = await api.getProducts({ limit: 999999 });
      const products = productsData.products || [];
      setAllProducts(products);

      // Cache products for offline access
      await OfflineSync.cacheProducts(products);

      // Load image URLs for products
      await loadImageUrls(products);

      // Extract unique categories
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products');

      // Try cache as fallback
      try {
        const cachedProducts = await OfflineSync.getCachedProducts();
        if (cachedProducts && cachedProducts.length > 0) {
          setAllProducts(cachedProducts);

          // Load image URLs for cached products
          await loadImageUrls(cachedProducts);

          const uniqueCategories = [...new Set(cachedProducts.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
          console.log('[Products] Using cached products after error');
          setOfflineMessage('Using cached data - unable to connect to server');
        }
      } catch (cacheErr) {
        console.error('[Products] Cache fallback failed:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allProducts];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply price filters
    if (minPrice) {
      filtered = filtered.filter(p => parseFloat(p.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => parseFloat(p.price) <= parseFloat(maxPrice));
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Random sort - shuffle array
      filtered = filtered.sort(() => Math.random() - 0.5);
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setBrowsing(false);
      // Reload all products
      loadInitialData();
      return;
    }
    await performSearch(search);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const handleAskMerchant = async (product) => {
    if (!user) {
      alert('Please login to chat with merchants');
      return;
    }

    if (user.role !== 'customer' && user.role !== 'student') {
      alert('Only customers can chat with merchants');
      return;
    }

    if (!openChatWithMerchant) {
      alert('Chat service not available');
      return;
    }

    // Check network status
    try {
      const { connected } = await getNetworkStatus();
      if (!connected) {
        alert('You\'re offline. Chat requires an internet connection. Please connect and try again.');
        return;
      }
    } catch (err) {
      console.error('[Products] Failed to check network status:', err);
    }

    try {
      // Opens conversation and chat panel directly
      await openChatWithMerchant(
        product.merchant_id,
        product.product_id || product.id
      );
      // Chat panel opens automatically - no alert needed
    } catch (error) {
      console.error('Error starting conversation:', error);

      // Check if it's a network error
      try {
        const { connected } = await getNetworkStatus();
        if (!connected) {
          alert('You\'re offline. Chat requires an internet connection.');
        } else {
          alert('Failed to start conversation. Please try again.');
        }
      } catch (err) {
        alert('Failed to start conversation. Please try again.');
      }
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return '#ccc';
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 3.5) return '#FFC107';
    return '#FF5722';
  };

  const renderSignalBadges = (signals) => {
    if (!signals || signals.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
        {signals.map((signal, idx) => (
          <span key={idx} style={{ fontSize: '11px', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '12px', border: '1px solid #81c784' }}>
            {signal}
          </span>
        ))}
      </div>
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('random');
    setBrowsing(false);
  };

  const renderProductCard = (product) => {
    console.log(product);
    const inWishlist = isInWishlist(product.product_id || product.id);
    return (
      <div key={product.product_id || product.id} className="product-card" style={{ position: 'relative' }}>
        {product.score && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#2196F3', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
            Score: {product.score.toFixed(1)}
          </div>
        )}
        <div className="product-image">
          <ImageCarousel
            images={product.all_images}
            imageUrls={imageUrls}
            productName={product.name}
          />
        </div>
        <div style={{ padding: '12px' }}>
          <h3 style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{product.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(product.rating || product.avg_rating) > 0 && <>
                <span style={{ color: getRatingColor(product.rating || product.avg_rating) }}>★</span>
                <span style={{ fontSize: '12px', color: '#666' }}>{(product.rating || product.avg_rating)?.toFixed(1)} ({product.review_count})</span>
              </>}
            </div>
            <button onclick={() => toggleWishlist(product.product_id || product.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <p style={{ color: '#666', fontSize: '12px', margin: '4px 0' }}>Category: <strong>{product.category || 'Uncategorized'}</strong></p>
            {product.merchant_name && <p style={{ color: '#666', fontSize: '12px', margin: '4px 0' }}>Merchant: <strong>{product.merchant_name}</strong></p>}
            {product.distance && <p style={{ color: '#2196F3', fontSize: '11px', margin: '4px 0', fontWeight: 'bold' }}>📍 {product.distance} km away</p>}
          </div>
          {renderSignalBadges(product.signals)}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>Le {parseFloat(product.price).toFixed(2)}</span>
              <button onclick={() => handleAddToCart(product)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Add to Cart
              </button>
            </div>
            {/* Ask Merchant Button */}
            {product.merchant_id && (
              <button
                onclick={() => handleAskMerchant(product)}
                style={{
                  width: '100%',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                💬 Ask Merchant
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '20px' }}>
        <p>Loading personalized recommendations and products...</p>
      </div>
    );
  }

  // Only show full-page error if there's an error AND no products loaded
  if (error && allProducts.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f', marginTop: '20px' }}>
        <p>{error}</p>
        <button onclick={loadInitialData} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
          Try Again
        </button>
      </div>
    );
  }

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || sortBy !== 'random' || search;

  return (
    <div className="page products-page" style={{ padding: '20px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Offline Mode Banner */}
      {offlineMessage && (
        <div style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>📡</span>
          <span style={{ color: '#e65100', fontWeight: '500' }}>{offlineMessage}</span>
        </div>
      )}

      {/* Recommended Section */}
      {!browsing && recommendations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '8px', color: '#333' }}>✨ Personalized for You</h2>
            <p style={{ color: '#666', margin: '0' }}>Top 50 recommendations based on your location, preferences, and ratings</p>
          </div>
          <div className="products-grid">
            {recommendations.map(renderProductCard)}
          </div>
        </div>
      )}

      {/* Browse All Products Section */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ marginBottom: '8px', color: '#333' }}>🛍️ Browse All Products</h2>
          <p style={{ color: '#666', margin: '0' }}>Filter, search, and explore our complete product catalog</p>
        </div>

        {/* Products Count - Moved to top for better UX */}
        <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
          <p style={{ margin: '0' }}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Search and Filter Controls */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onInput={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          />
          <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔍 Search
          </button>
        </form>

        {/* Filter Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ⚙️ {showFilters ? 'Hide' : 'Show'} Filters
            {hasActiveFilters && <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#FF5722', borderRadius: '50%' }} />}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{ padding: '10px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {/* Category Filter */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Price Range (Le)</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onInput={(e) => setMinPrice(e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onInput={(e) => setMaxPrice(e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    min="0"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="random">Random</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>
              No products found matching your filters. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(renderProductCard)}
          </div>
        )}
      </div>
    </div>
  );
}
