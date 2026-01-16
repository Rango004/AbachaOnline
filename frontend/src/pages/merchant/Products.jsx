import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import ImageUpload from '../../components/ImageUpload';
import OfflineSync from '../../services/OfflineSyncService';
import { getNetworkStatus } from '../../services/NativeBridge';
import './Products.css';

export default function MerchantProducts() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineProducts, setOfflineProducts] = useState([]); // Products queued offline
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'food',
    stock_quantity: '',
    images: []
  });

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    checkNetworkAndLoad();
  }, [user]);

  const checkNetworkAndLoad = async () => {
    try {
      const { connected } = await getNetworkStatus();
      setIsOffline(!connected);
      await loadProducts(!connected);
    } catch (err) {
      console.error('[MerchantProducts] Network check failed:', err);
      await loadProducts(false);
    }
  };

  const loadProducts = async (offline = false) => {
    try {
      setLoading(true);

      // Load offline queued products from IndexedDB
      const queuedProducts = await loadOfflineQueuedProducts();
      setOfflineProducts(queuedProducts);

      if (offline) {
        console.log('[MerchantProducts] Offline - loading from cache');
        const cachedProducts = await OfflineSync.getCachedProducts(user?.id);

        if (cachedProducts && cachedProducts.length > 0) {
          // Combine cached + offline queued products
          setProducts(cachedProducts);
          console.log(`[MerchantProducts] Loaded ${cachedProducts.length} cached products`);
        } else {
          // Try loading all cached products (merchant's products might be there)
          const allCached = await OfflineSync.getCachedProducts();
          const merchantProducts = allCached.filter(p => p.merchant_id === user?.id);
          setProducts(merchantProducts);
          console.log(`[MerchantProducts] Loaded ${merchantProducts.length} merchant products from cache`);
        }
        return;
      }

      // Online - load from server
      const response = await api.getMerchantProducts();
      const data = response.products || response;
      setProducts(data);

      // Cache merchant's products for offline access
      if (data && data.length > 0) {
        await OfflineSync.cacheProducts(data);
        console.log(`[MerchantProducts] Cached ${data.length} products for offline`);
      }
    } catch (err) {
      console.error('Error loading products:', err);

      // Try loading from cache as fallback
      try {
        const cachedProducts = await OfflineSync.getCachedProducts(user?.id);
        if (cachedProducts && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          console.log('[MerchantProducts] Using cached products after error');
        } else {
          alert(err.message);
        }
      } catch (cacheErr) {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load products that were created offline and are queued for sync
  const loadOfflineQueuedProducts = async () => {
    try {
      await OfflineSync.initOfflineDB();
      const db = OfflineSync.db;
      if (!db) return [];

      const allQueued = await db.getAll('syncQueue');
      const productQueued = allQueued.filter(
        q => q.status === 'pending' &&
             q.type === 'product' &&
             q.method === 'POST'
      );

      return productQueued.map(q => ({
        ...q.data,
        id: q.id, // Use queue ID as temporary ID
        _isOffline: true,
        _queueId: q.id
      }));
    } catch (err) {
      console.error('[MerchantProducts] Failed to load offline queued products:', err);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check network status
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // OFFLINE MODE - Queue product creation
        console.log('[MerchantProducts] Offline - queuing product creation');

        if (editingProduct && !editingProduct._isOffline) {
          // Cannot edit existing online products while offline
          alert('You cannot edit existing products while offline. Please connect to the internet and try again.');
          return;
        }

        // Generate offline product ID
        const offlineProductId = `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const productData = {
          ...formData,
          merchant_id: user?.id,
          offline_id: offlineProductId,
          created_at: new Date().toISOString(),
          is_active: true,
          // Note: Images will need to be uploaded when back online
          _pendingImageUpload: formData.images.length > 0
        };

        // Queue the product creation request
        await OfflineSync.queueRequest(
          '/api/products',
          'POST',
          productData,
          {
            priority: 'normal',
            type: 'product',
            metadata: {
              offlineProductId,
              merchantId: user?.id,
              productName: formData.name
            }
          }
        );

        // Add to local offline products list for immediate UI feedback
        setOfflineProducts(prev => [...prev, {
          ...productData,
          id: offlineProductId,
          _isOffline: true
        }]);

        alert(`Product "${formData.name}" saved as draft!\n\nIt will be published automatically when you're back online.`);

        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'food',
          stock_quantity: '',
          images: []
        });

        return;
      }

      // ONLINE MODE - Normal product creation/update
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        alert('Product updated successfully!');
      } else {
        await api.createProduct(formData);
        alert('Product created successfully!');
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'food',
        stock_quantity: '',
        images: []
      });
      await checkNetworkAndLoad();
    } catch (err) {
      console.error('[MerchantProducts] Submit error:', err);
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || 'food',
      stock_quantity: product.stock_quantity || '',
      images: product.images || []
    });
    setShowForm(true);
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.updateProduct(productId, { is_active: !currentStatus });
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.deleteProduct(productId);
      alert('Product deleted successfully!');
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBulkUploading(true);
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const products = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const product = {};
        headers.forEach((header, index) => {
          product[header] = values[index];
        });
        return product;
      }).filter(p => p.name);

      const result = await api.bulkImportProducts(products);
      setBulkUploadResult(result);
      alert(`✅ Successful: ${result.successful}\n❌ Failed: ${result.failed}\n\n${result.errors.join('\n')}`);
      loadProducts();
      setShowBulkUpload(false);
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setBulkUploading(false);
    }
  };

  // Combine online products with offline queued products for display
  const allProductsToDisplay = [
    ...offlineProducts, // Offline products first (draft status)
    ...products.filter(p => !offlineProducts.some(op => op.offline_id === p.offline_id))
  ];

  if (loading) {
    return <div class="page"><div class="loading">Loading products...</div></div>;
  }

  return (
    <div class="page merchant-products">
      <div class="container">
        {/* Offline Mode Banner */}
        {isOffline && (
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
            <div>
              <strong style={{ color: '#e65100' }}>You're offline</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                You can still add new products. They'll be published when you're back online.
                {offlineProducts.length > 0 && ` (${offlineProducts.length} pending)`}
              </p>
            </div>
          </div>
        )}

        {/* Pending Offline Products Notice */}
        {!isOffline && offlineProducts.length > 0 && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🔄</span>
            <div>
              <strong style={{ color: '#1565c0' }}>Syncing offline products...</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                {offlineProducts.length} product(s) created offline are being uploaded.
              </p>
            </div>
          </div>
        )}

        <div class="page-header">
          <h2>My Products</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              class="btn-primary"
              onClick={() => setShowBulkUpload(true)}
              disabled={isOffline}
              title={isOffline ? 'Bulk upload requires internet connection' : ''}
            >
              📤 Bulk Upload
            </button>
            <button
              class="btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: 'food',
                  stock_quantity: '',
                  images: []
                });
              }}
            >
              ➕ Add Product
            </button>
          </div>
        </div>

        {showForm && (
          <div class="product-form-modal">
            <div class="modal-content">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

              {/* Offline Notice in Form */}
              {isOffline && (
                <div style={{
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ff9800',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <strong style={{ color: '#e65100' }}>📡 You're offline</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                    Product will be saved as a draft and published when you're back online.
                    Image uploads are not available offline.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div class="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onInput={handleInputChange}
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onInput={handleInputChange}
                    rows="3"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Price (Le) *</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      value={formData.price}
                      onInput={handleInputChange}
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onInput={handleInputChange}
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="stationery">Stationery</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Product Images (Max 5, 1MB each)</label>
                  <ImageUpload
                    onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                    maxImages={5}
                    existingImages={formData.images}
                  />
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBulkUpload && (
          <div class="product-form-modal">
            <div class="bulk-upload-modal">
              <div class="modal-header">
                <h3>📤 Bulk Upload Products</h3>
                <button
                  type="button"
                  class="modal-close"
                  onClick={() => setShowBulkUpload(false)}
                  disabled={bulkUploading}
                >
                  ✕
                </button>
              </div>

              <div class="modal-body">
                <div class="upload-info">
                  <p class="info-text">
                    Upload a CSV file to add multiple products at once. Each row represents one product.
                  </p>
                </div>

                <div class="upload-zone">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleBulkUpload}
                    disabled={bulkUploading}
                    style={{ display: 'none' }}
                    id="bulk-file-input"
                  />
                  <label htmlFor="bulk-file-input" class={`file-input-label ${bulkUploading ? 'disabled' : ''}`}>
                    <span class="upload-icon">📁</span>
                    <strong>Click to select CSV file</strong>
                    <small>or drag and drop here</small>
                  </label>
                </div>

                <div class="csv-format-section">
                  <h4>📋 CSV Format</h4>
                  <div class="format-info">
                    <p class="format-header">Required columns (in order):</p>
                    <div class="column-list">
                      <div class="column-item">
                        <span class="column-name">name</span>
                        <span class="column-desc">Product name (required)</span>
                      </div>
                      <div class="column-item">
                        <span class="column-name">description</span>
                        <span class="column-desc">Product description (optional)</span>
                      </div>
                      <div class="column-item">
                        <span class="column-name">price</span>
                        <span class="column-desc">Price in Leone (required)</span>
                      </div>
                      <div class="column-item">
                        <span class="column-name">category</span>
                        <span class="column-desc">food, drinks, stationery, electronics, clothing, other</span>
                      </div>
                      <div class="column-item">
                        <span class="column-name">stock_quantity</span>
                        <span class="column-desc">Available quantity (optional)</span>
                      </div>
                      <div class="column-item">
                        <span class="column-name">image_url</span>
                        <span class="column-desc">Product image URL (optional)</span>
                      </div>
                    </div>
                  </div>

                  <div class="example-section">
                    <p class="example-header">📝 Example:</p>
                    <div class="code-block">
                      name,description,price,category,stock_quantity,image_url<br/>
                      Burger,Delicious beef burger,5000,food,100,https://example.com/burger.jpg<br/>
                      Coke,Cold Coca-Cola 500ml,2000,drinks,50,https://example.com/coke.jpg<br/>
                      Notebook,A4 spiral notebook,1500,stationery,200,
                    </div>
                  </div>

                  <div class="tips-section">
                    <p class="tips-header">💡 Tips:</p>
                    <ul class="tips-list">
                      <li>Maximum 500 products per import</li>
                      <li>Leave optional columns empty (but keep commas)</li>
                      <li>Use commas to separate values</li>
                      <li>Check all required fields before uploading</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn-secondary"
                  onClick={() => setShowBulkUpload(false)}
                  disabled={bulkUploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div class="products-list">
          {allProductsToDisplay.length === 0 ? (
            <p class="no-products">No products yet. Add your first product!</p>
          ) : (
            allProductsToDisplay.map(product => (
              <div key={product.id || product.offline_id} class={`product-card ${!product.is_active ? 'inactive' : ''} ${product._isOffline ? 'offline-draft' : ''}`}>
                {/* Draft Badge for Offline Products */}
                {product._isOffline && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    📋 DRAFT
                  </div>
                )}

                {product.images && product.images.length > 0 && (
                  <img src={product.images[0].url} alt={product.name} class="product-image" />
                )}
                {product._isOffline && (!product.images || product.images.length === 0) && (
                  <div class="product-image" style={{
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px'
                  }}>
                    No image (offline)
                  </div>
                )}
                <div class="product-info">
                  <h3>{product.name}</h3>
                  {product.description && <p class="description">{product.description}</p>}
                  <div class="product-details">
                    <span class="price">Le {parseFloat(product.price).toFixed(2)}</span>
                    <span class="category">{product.category}</span>
                    {product.stock_quantity !== null && (
                      <span class="stock">Stock: {product.stock_quantity}</span>
                    )}
                  </div>
                  {product._isOffline ? (
                    <span class="status-badge" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                      📋 Queued for upload
                    </span>
                  ) : (
                    <span class={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? '✅ Active' : '⏸️ Inactive'}
                    </span>
                  )}
                </div>
                <div class="product-actions">
                  {!product._isOffline && (
                    <>
                      <button class="btn-icon" onClick={() => handleEdit(product)} title="Edit" disabled={isOffline}>
                        ✏️
                      </button>
                      <button
                        class="btn-icon"
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                        disabled={isOffline}
                      >
                        {product.is_active ? '⏸️' : '▶️'}
                      </button>
                      <button
                        class="btn-icon delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                        disabled={isOffline}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                  {product._isOffline && (
                    <span style={{ fontSize: '12px', color: '#666', padding: '8px' }}>
                      Pending sync...
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
