import { useState, useEffect, useContext } from 'preact/hooks';
import { CartContext } from '../services/CartContext';
import { WishlistContext } from '../services/WishlistContext';
import api from '../services/api';
import { getOptimizedImageUrl } from '../services/imageService';
import ImageCarousel from '../components/ImageCarousel';
import '../pages/Products.css';

export default function Recommendations() {
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const [recommendations, setRecommendations] = useState([]);
  const [merchantRatings, setMerchantRatings] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRecommendations(15);
      const items = data.recommendations || [];
      setRecommendations(items);

      // Preload optimized image URLs for all recommendation images
      const urls = {};
      const imagePromises = [];

      items.forEach((p) => {
        if (p.all_images && Array.isArray(p.all_images)) {
          p.all_images.forEach((img) => {
            if (img && img.publicId && !urls[img.publicId]) {
              imagePromises.push(
                getOptimizedImageUrl(img.publicId)
                  .then(u => { urls[img.publicId] = u; })
                  .catch(() => {}) // ignore per-image failures
              );
            }
          });
        }
      });

      await Promise.all(imagePromises);
      setImageUrls(urls);

      const uniqueMerchantIds = [...new Set(items.map(p => p.merchant_id).filter(Boolean))];
      const ratings = {};
      for (const merchantId of uniqueMerchantIds) {
        try {
          const ratingData = await api.getMerchantRating(merchantId);
          ratings[merchantId] = ratingData;
        } catch (err) {
          ratings[merchantId] = null;
        }
      }
      setMerchantRatings(ratings);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
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

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><p>Loading personalized recommendations...</p></div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
        <p>{error}</p>
        <button onclick={loadRecommendations} style={{ padding: '8px 16px', cursor: 'pointer' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '8px' }}>Personalized for You</h1>
        <p style={{ color: '#666', margin: '0' }}>Recommendations based on your preferences, ratings, and what others like you enjoy</p>
      </div>

      {recommendations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>No recommendations available yet. Start exploring products to get personalized suggestions!</p>
        </div>
      ) : (
        <div className="products-grid">
          {recommendations.map((product) => {
            const merchantRating = merchantRatings[product.merchant_id];
            const inWishlist = isInWishlist(product.product_id);
            return (
              <div key={product.product_id} className="product-card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#2196F3', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
                  Score: {product.score.toFixed(1)}
                </div>
                <div className="product-image" style={{width: '200px', height: '200px'}}>
                  <ImageCarousel
                    images={product.all_images}
                    imageUrls={imageUrls}
                    productName={product.name}
                  />
                </div>
                <div className="product-info">
                  <h3 style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {product.rating > 0 && <>
                        <span style={{ color: getRatingColor(product.rating) }}>★</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{product.rating.toFixed(1)} ({product.review_count})</span>
                      </>}
                    </div>
                    <button onclick={() => toggleWishlist(product.product_id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                      {inWishlist ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ color: '#666', fontSize: '12px', margin: '4px 0' }}>Category: <strong>{product.category || 'Uncategorized'}</strong></p>
                    {merchantRating && <p style={{ color: '#666', fontSize: '12px', margin: '4px 0' }}>Merchant: <strong>{merchantRating.name}</strong> {merchantRating.avg_rating && <span style={{ marginLeft: '4px', color: getRatingColor(merchantRating.avg_rating) }}>★ {merchantRating.avg_rating.toFixed(1)}</span>}</p>}
                  </div>
                  {renderSignalBadges(product.signals)}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>Le {parseFloat(product.price).toFixed(2)}</span>
                    <button onclick={() => handleAddToCart(product)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
