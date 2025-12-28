import { createContext } from 'preact';
import { useState, useCallback, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import api from './api';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [wishedProductIds, setWishedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      loadWishlist();
    }
  }, [user?.id]);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWishlist(20, 0);
      setWishlist(data.items || []);

      // Update wished product IDs set
      const ids = new Set((data.items || []).map(item => item.product_id));
      setWishedProductIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      await api.addToWishlist(productId);

      // Update local state
      setWishedProductIds(prev => new Set([...prev, productId]));

      // Reload wishlist to get full product data
      await loadWishlist();
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      setError(err.message);
      return false;
    }
  }, [loadWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      await api.removeFromWishlist(productId);

      // Update local state
      setWishedProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      // Remove from wishlist array
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      return true;
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishedProductIds.has(productId);
  }, [wishedProductIds]);

  const toggleWishlist = useCallback(async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      setError(null);
      await api.clearWishlist();
      setWishlist([]);
      setWishedProductIds(new Set());
      return true;
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  const value = {
    wishlist,
    wishedProductIds,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    loadWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
