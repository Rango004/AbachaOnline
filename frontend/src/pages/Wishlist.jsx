import { useContext, useState, useEffect } from 'preact/hooks';
import { WishlistContext } from '../services/WishlistContext';
import { CartContext } from '../services/CartContext';
import { AuthContext } from '../services/AuthContext';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, loading, error, removeFromWishlist, getWishlistCount } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [localError, setLocalError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!user) {
    return (
      <div class="wishlist-page">
        <div class="empty-state">
          <p>Please log in to view your wishlist</p>
        </div>
      </div>
    );
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);
      const success = await removeFromWishlist(productId);
      if (success) {
        setSuccessMessage('Removed from wishlist');
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (err) {
      setLocalError('Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      addToCart(product);
      setSuccessMessage(`${product.name} added to cart!`);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setLocalError('Failed to add to cart');
    }
  };

  return (
    <div class="wishlist-page">
      <div class="wishlist-header">
        <h1>❤️ My Wishlist</h1>
        <p class="subtitle">{getWishlistCount()} saved items</p>
        {error && <div class="error-banner">{error}</div>}
        {localError && <div class="error-banner">{localError}</div>}
        {successMessage && <div class="success-banner">{successMessage}</div>}
      </div>

      {loading ? (
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading wishlist...</p>
        </div>
      ) : wishlist && wishlist.length > 0 ? (
        <div class="wishlist-container">
          <div class="wishlist-grid">
            {wishlist.map(item => (
              <div key={item.product_id} class="wishlist-card">
                {item.image_url && (
                  <div class="card-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                )}

                <div class="card-content">
                  <h3 class="product-name">{item.name}</h3>

                  {item.description && (
                    <p class="product-description">{item.description}</p>
                  )}

                  <div class="merchant-info">
                    <span class="merchant-name">🏪 {item.merchant_name}</span>
                  </div>

                  <div class="pricing-section">
                    <div class="price">
                      <span class="currency">Le</span>
                      <span class="amount">{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <div class="stock-status">
                      {item.stock_quantity > 0 ? (
                        <span class="in-stock">In Stock</span>
                      ) : (
                        <span class="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div class="card-actions">
                    <button
                      class="btn btn-primary"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock_quantity === 0}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      class="btn btn-danger"
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      disabled={removingId === item.product_id}
                    >
                      {removingId === item.product_id ? '...' : '❌ Remove'}
                    </button>
                  </div>

                  <div class="added-date">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Start adding products to save them for later!</p>
          <a href="/products" class="link-btn">Browse Products</a>
        </div>
      )}
    </div>
  );
}
