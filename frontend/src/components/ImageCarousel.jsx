import { useState } from 'preact/hooks';

export default function ImageCarousel({ images, imageUrls, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out null/undefined images and build array of image sources
  const imageSources = [];

  if (images && Array.isArray(images)) {
    images.forEach((img) => {
      if (img && img.publicId && imageUrls[img.publicId]) {
        imageSources.push(imageUrls[img.publicId]);
      } else if (img && img.url) {
        imageSources.push(img.url);
      }
    });
  }

  // If no images in array, return placeholder
  if (imageSources.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '48px' }}>📦</div>
      </div>
    );
  }

  // If only one image, display without navigation
  if (imageSources.length === 1) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={imageSources[0]}
          alt={productName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageSources.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageSources.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Main image */}
      <img
        src={imageSources[currentIndex]}
        alt={`${productName} - Image ${currentIndex + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Navigation arrows */}
      {imageSources.length > 1 && (
        <>
          <button
            onclick={goToPrevious}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              zIndex: 10,
              transition: 'background-color 0.2s'
            }}
            onmouseover={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
            onmouseout={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            title="Previous image"
          >
            ‹
          </button>

          <button
            onclick={goToNext}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              zIndex: 10,
              transition: 'background-color 0.2s'
            }}
            onmouseover={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
            onmouseout={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            title="Next image"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 10
          }}>
            {imageSources.map((_, index) => (
              <button
                key={index}
                onclick={(e) => goToIndex(e, index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: '1px solid white',
                  backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background-color 0.2s'
                }}
                title={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            {currentIndex + 1} / {imageSources.length}
          </div>
        </>
      )}
    </div>
  );
}
