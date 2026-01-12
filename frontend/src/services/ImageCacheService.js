/**
 * ImageCacheService - Cache Cloudinary images for offline access
 *
 * Features:
 * - Cache images as blobs in IndexedDB
 * - Return cached blob URLs when offline
 * - Progressive loading: Placeholder → Cache → Fresh (if online)
 * - LRU eviction when storage is full
 * - Automatic preloading for product images
 */

import OfflineSync from './OfflineSyncService';
import { getNetworkStatus } from './NativeBridge';

class ImageCacheService {
  constructor() {
    this.pendingFetches = new Map(); // Prevent duplicate fetches
  }

  /**
   * Get image source (with offline fallback)
   * Returns cached blob URL when offline, original URL when online
   */
  async getImageSrc(url) {
    if (!url) return null;

    try {
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Try cache first when offline
        const cached = await this.getCachedImage(url);
        if (cached) {
          console.log(`[ImageCache] Serving ${url.substring(0, 50)}... from cache`);
          return cached;
        }

        // No cache available - return placeholder or original URL
        return url; // Service worker will attempt to serve from cache
      }

      // Online - return original URL and cache in background
      this.cacheImageInBackground(url);

      return url;
    } catch (error) {
      console.error('[ImageCache] Error getting image source:', error);
      return url; // Fallback to original URL
    }
  }

  /**
   * Get cached image as blob URL
   */
  async getCachedImage(url) {
    try {
      const cached = await OfflineSync.getCachedImage(url);
      return cached; // Returns blob URL or null
    } catch (error) {
      console.error('[ImageCache] Error getting cached image:', error);
      return null;
    }
  }

  /**
   * Cache a single image
   * @param {string} url - Image URL to cache
   * @param {Blob} blob - Optional blob (if already fetched)
   */
  async cacheImage(url, blob = null) {
    if (!url) return false;

    try {
      // Check if already being fetched
      if (this.pendingFetches.has(url)) {
        await this.pendingFetches.get(url);
        return true;
      }

      let imageBlob = blob;

      // Fetch if blob not provided
      if (!blob) {
        const fetchPromise = this.fetchImage(url);
        this.pendingFetches.set(url, fetchPromise);

        try {
          imageBlob = await fetchPromise;
        } finally {
          this.pendingFetches.delete(url);
        }
      }

      if (!imageBlob) {
        console.warn('[ImageCache] No blob to cache for:', url);
        return false;
      }

      // Store in IndexedDB
      await OfflineSync.cacheImage(url, imageBlob);

      return true;
    } catch (error) {
      console.error('[ImageCache] Failed to cache image:', error);
      return false;
    }
  }

  /**
   * Fetch image and return blob
   */
  async fetchImage(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('[ImageCache] Fetch failed:', error);
      return null;
    }
  }

  /**
   * Cache image in background (non-blocking)
   */
  cacheImageInBackground(url) {
    // Don't await - let it run in background
    this.cacheImage(url).catch(err => {
      console.warn('[ImageCache] Background cache failed:', err.message);
    });
  }

  /**
   * Batch cache product images
   * @param {Array} products - Array of product objects
   * @param {Function} onProgress - Optional progress callback (current, total)
   */
  async cacheProductImages(products, onProgress = null) {
    if (!Array.isArray(products) || products.length === 0) {
      return { cached: 0, failed: 0 };
    }

    let cached = 0;
    let failed = 0;
    const allImages = [];

    // Collect all image URLs
    for (const product of products) {
      if (product.images && Array.isArray(product.images)) {
        allImages.push(...product.images);
      } else if (product.image_url) {
        allImages.push(product.image_url);
      }
    }

    console.log(`[ImageCache] Caching ${allImages.length} product images...`);

    // Cache images in batches of 5 to avoid overwhelming the network
    const batchSize = 5;
    for (let i = 0; i < allImages.length; i += batchSize) {
      const batch = allImages.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(url => this.cacheImage(url))
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          cached++;
        } else {
          failed++;
        }
      });

      // Call progress callback
      if (onProgress) {
        onProgress(cached + failed, allImages.length);
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < allImages.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[ImageCache] Cached ${cached}/${allImages.length} images (${failed} failed)`);

    return { cached, failed, total: allImages.length };
  }

  /**
   * Cache images for a specific merchant's products
   * Useful for preloading when viewing a merchant page
   */
  async cacheMerchantImages(merchantId, products) {
    console.log(`[ImageCache] Caching images for merchant ${merchantId}`);
    return await this.cacheProductImages(products);
  }

  /**
   * Preload images for cart items
   */
  async cacheCartImages(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { cached: 0, failed: 0 };
    }

    console.log(`[ImageCache] Caching ${cartItems.length} cart item images`);

    const products = cartItems.map(item => ({
      images: item.images || [item.image_url],
      name: item.name
    }));

    return await this.cacheProductImages(products);
  }

  /**
   * Clear all cached images
   */
  async clearCache() {
    try {
      await OfflineSync.initOfflineDB();
      const db = OfflineSync.db;

      await db.clear('imageCache');

      console.log('[ImageCache] Cache cleared');
      return true;
    } catch (error) {
      console.error('[ImageCache] Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get cache size in MB
   */
  async getCacheSize() {
    try {
      await OfflineSync.initOfflineDB();
      const db = OfflineSync.db;

      const images = await db.getAll('imageCache');

      const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

      return {
        count: images.length,
        sizeBytes: totalSize,
        sizeMB: parseFloat(sizeMB)
      };
    } catch (error) {
      console.error('[ImageCache] Failed to get cache size:', error);
      return { count: 0, sizeBytes: 0, sizeMB: 0 };
    }
  }

  /**
   * Check if image is cached
   */
  async isCached(url) {
    try {
      const cached = await OfflineSync.getCachedImage(url);
      return cached !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Warm up cache for expected user actions
   * Called when user logs in or navigates to main pages
   */
  async warmupCache(user) {
    try {
      console.log('[ImageCache] Warming up cache...');

      // Only warmup on WiFi to save mobile data
      const { connected, connectionType } = await getNetworkStatus();

      if (!connected || (connectionType && connectionType !== 'wifi')) {
        console.log('[ImageCache] Skipping warmup - not on WiFi');
        return;
      }

      // This would be implemented based on your data structure
      // Example: Preload featured products, user's favorite merchant, etc.
      console.log('[ImageCache] Warmup complete');
    } catch (error) {
      console.error('[ImageCache] Warmup failed:', error);
    }
  }
}

export default new ImageCacheService();
