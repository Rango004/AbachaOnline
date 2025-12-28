import { h } from 'preact';
import { useState } from 'preact/hooks';
import api from '../services/api';

export default function ReviewModal({ orderId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createReview(orderId, rating, comment);
      alert('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h3>Leave a Review</h3>
          <button class="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label>Rating</label>
            <div class="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  class={`star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div class="form-group">
            <label>Comment (optional)</label>
            <textarea
              value={comment}
              onInput={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" class="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
