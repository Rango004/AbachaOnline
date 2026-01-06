const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function uploadProductImages(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/v1/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.images;
}

export async function deleteProductImage(publicId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/v1/images/delete/${publicId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }

  return response.json();
}

export function getOptimizedImageUrl(publicId, width = 400, height = 400) {
  return `${API_URL}/api/v1/images/optimize?publicId=${publicId}&width=${width}&height=${height}`;
}
