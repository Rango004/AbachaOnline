/**
 * CachedImage - Drop-in replacement for <img> with offline caching
 *
 * Features:
 * - Automatically caches images for offline access
 * - Shows loading skeleton while fetching
 * - Falls back to cached version when offline
 * - Displays placeholder on error
 * - Progressive enhancement: cached → fresh
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ImageCacheService from '../services/ImageCacheService';

export default function CachedImage({
  src,
  alt = '',
  className = '',
  style = {},
  loading = 'lazy',
  onLoad = null,
  onError = null,
  showCachedBadge = false,
  placeholderIcon = '📷',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let mounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Get image source (from cache if offline, original if online)
        const cachedSrc = await ImageCacheService.getImageSrc(src);

        if (!mounted) return;

        // Check if this is a cached blob URL
        const isCached = cachedSrc && cachedSrc.startsWith('blob:');

        setImageSrc(cachedSrc || src);
        setFromCache(isCached);
        setIsLoading(false);
      } catch (error) {
        console.error('[CachedImage] Error loading image:', error);

        if (!mounted) return;

        setImageSrc(src); // Fallback to original
        setHasError(false); // Don't show error, let browser try
        setIsLoading(false);
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src]);

  const handleImageLoad = (e) => {
    setIsLoading(false);
    setHasError(false);

    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = (e) => {
    setIsLoading(false);
    setHasError(true);

    if (onError) {
      onError(e);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div
        className={`cached-image-skeleton ${className}`}
        style={{
          ...style,
          backgroundColor: '#e0e0e0',
          backgroundImage: 'linear-gradient(90deg, #e0e0e0 0px, #f0f0f0 40px, #e0e0e0 80px)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px'
        }}
        role="img"
        aria-label="Loading image"
      >
        <style>
          {`
            @keyframes skeleton-loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
      </div>
    );
  }

  // Show error placeholder
  if (hasError || !imageSrc) {
    return (
      <div
        className={`cached-image-error ${className}`}
        style={{
          ...style,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          minHeight: '100px',
          color: '#999'
        }}
        role="img"
        aria-label={alt || 'Image not available'}
      >
        <span style={{ fontSize: '2rem' }}>{placeholderIcon}</span>
        <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Image unavailable
        </span>
      </div>
    );
  }

  // Show image
  return (
    <div className="cached-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={imageSrc}
        alt={alt}
        className={`cached-image ${className}`}
        style={style}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />

      {/* Optional "Cached" badge */}
      {showCachedBadge && fromCache && (
        <span
          className="cached-image-badge"
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500',
            pointerEvents: 'none'
          }}
        >
          📦 Cached
        </span>
      )}
    </div>
  );
}

/**
 * Preload images for a list of products
 * Useful for preloading images before they're needed
 */
export async function preloadImages(imageUrls, onProgress = null) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return { cached: 0, failed: 0 };
  }

  console.log(`[CachedImage] Preloading ${imageUrls.length} images`);

  let cached = 0;
  let failed = 0;

  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(url => ImageCacheService.cacheImage(url))
    );

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        cached++;
      } else {
        failed++;
      }
    });

    if (onProgress) {
      onProgress(cached + failed, imageUrls.length);
    }

    // Small delay between batches
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { cached, failed, total: imageUrls.length };
}
