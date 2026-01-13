import { createContext } from 'preact';
import { useState, useCallback, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import api from './api';
import OfflineSync from './OfflineSyncService';
import { getNetworkStatus } from './NativeBridge';

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

      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Load from cache when offline
        console.log('[WishlistContext] Offline - loading from cache');

        await OfflineSync.initOfflineDB();
        const cachedWishlist = await OfflineSync.db.getAll('wishlist');

        if (cachedWishlist && cachedWishlist.length > 0) {
          setWishlist(cachedWishlist);

          // Update wished product IDs set
          const ids = new Set(cachedWishlist.map(item => item.product_id || item.productId));
          setWishedProductIds(ids);

          console.log(`[WishlistContext] Loaded ${cachedWishlist.length} items from cache`);
        }

        setLoading(false);
        return;
      }

      // Online - fetch from server
      const data = await api.getWishlist(20, 0);
      const wishlistItems = data.items || [];
      setWishlist(wishlistItems);

      // Cache wishlist items
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.clear('wishlist');
      for (const item of wishlistItems) {
        await OfflineSync.db.add('wishlist', {
          ...item,
          productId: item.product_id,
          cachedAt: Date.now()
        });
      }

      // Update wished product IDs set
      const ids = new Set(wishlistItems.map(item => item.product_id));
      setWishedProductIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError(err.message);

      // Try cache as fallback
      try {
        await OfflineSync.initOfflineDB();
        const cachedWishlist = await OfflineSync.db.getAll('wishlist');
        if (cachedWishlist && cachedWishlist.length > 0) {
          setWishlist(cachedWishlist);
          const ids = new Set(cachedWishlist.map(item => item.product_id || item.productId));
          setWishedProductIds(ids);
          console.log('[WishlistContext] Using cached wishlist after error');
        }
      } catch (cacheErr) {
        console.error('[WishlistContext] Cache fallback failed:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setError(null);

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[WishlistContext] Offline - queuing wishlist add');

        // Optimistic update
        setWishedProductIds(prev => new Set([...prev, productId]));

        // Create temporary wishlist item
        const tempItem = {
          productId,
          product_id: productId,
          user_id: user?.id,
          cachedAt: Date.now(),
          queued: true
        };

        setWishlist(prev => [...prev, tempItem]);

        // Cache locally
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.add('wishlist', tempItem);

        // Queue for sync
        await OfflineSync.queueRequest(
          `/wishlist/${productId}`,
          'POST',
          { productId },
          { priority: 'low', type: 'wishlist' }
        );

        return true;
      }

      // Online - add immediately
      await api.addToWishlist(productId);

      // Update local state
      setWishedProductIds(prev => new Set([...prev, productId]));

      // Reload wishlist to get full product data and cache it
      await loadWishlist();
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      setError(err.message);
      return false;
    }
  }, [loadWishlist, user]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setError(null);

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[WishlistContext] Offline - queuing wishlist removal');

        // Optimistic delete
        setWishedProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });

        setWishlist(prev => prev.filter(item => (item.product_id || item.productId) !== productId));

        // Delete from cache
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.delete('wishlist', productId);

        // Queue for sync
        await OfflineSync.queueRequest(
          `/wishlist/${productId}`,
          'DELETE',
          null,
          { priority: 'low', type: 'wishlist' }
        );

        return true;
      }

      // Online - remove immediately
      await api.removeFromWishlist(productId);

      // Update local state
      setWishedProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      // Remove from wishlist array
      setWishlist(prev => prev.filter(item => item.product_id !== productId));

      // Delete from cache
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.delete('wishlist', productId);

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

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[WishlistContext] Offline - queuing wishlist clear');

        // Optimistic clear
        setWishlist([]);
        setWishedProductIds(new Set());

        // Clear cache
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.clear('wishlist');

        // Queue for sync
        await OfflineSync.queueRequest(
          '/wishlist/clear',
          'DELETE',
          null,
          { priority: 'low', type: 'wishlist' }
        );

        return true;
      }

      // Online - clear immediately
      await api.clearWishlist();
      setWishlist([]);
      setWishedProductIds(new Set());

      // Clear cache
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.clear('wishlist');

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
