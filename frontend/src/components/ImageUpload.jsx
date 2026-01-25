import { useState } from 'preact/hooks';
import { uploadProductImages, deleteProductImage } from '../services/imageService';

export default function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [] }) {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    if (file.size > 2 * 1024 * 1024) {
      return 'Image must be less than 2MB';
    }
    return null;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate all files
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');
    setUploading(true);

    try {
      const uploadedImages = await uploadProductImages(files);
      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId, index) => {
    try {
      await deleteProductImage(publicId);
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          id="image-upload-input"
          style={{ display: 'none' }}
        />
        <label htmlFor="image-upload-input" className="upload-button">
          {uploading ? 'Uploading...' : `Add Images (${images.length}/${maxImages})`}
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="image-previews">
        {images.map((img, index) => (
          <div key={img.publicId} className="image-preview">
            <img src={img.url} alt={`Product ${index + 1}`} />
            <button
              type="button"
              onClick={() => handleDelete(img.publicId, index)}
              className="delete-button"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .image-upload {
          margin: 1rem 0;
        }
        .upload-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .upload-button:hover {
          background: #0056b3;
        }
        .error-message {
          color: #dc3545;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
        .image-previews {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .image-preview {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e0e0e0;
        }
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .delete-button {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
