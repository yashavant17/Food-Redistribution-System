import { useState, useEffect } from 'react';
import { ratingAPI } from '../../services/api';
import { FiStar, FiX, FiSend, FiAward, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './RatingModal.css';

const POSITIVE_TAGS = [
  { key: 'fresh_food', label: '🥗 Fresh Food', forRole: ['donor'] },
  { key: 'good_packaging', label: '📦 Good Packaging', forRole: ['donor'] },
  { key: 'on_time', label: '⏰ On Time', forRole: ['donor', 'ngo', 'volunteer'] },
  { key: 'generous_quantity', label: '🍱 Generous Qty', forRole: ['donor'] },
  { key: 'accurate_description', label: '✅ Accurate Info', forRole: ['donor'] },
  { key: 'friendly', label: '😊 Friendly', forRole: ['donor', 'ngo', 'volunteer'] },
  { key: 'professional', label: '💼 Professional', forRole: ['ngo', 'volunteer'] },
  { key: 'quick_pickup', label: '🚀 Quick Pickup', forRole: ['ngo', 'volunteer'] },
  { key: 'careful_handling', label: '🤲 Careful Handling', forRole: ['ngo', 'volunteer'] },
  { key: 'good_communication', label: '💬 Great Communication', forRole: ['donor', 'ngo', 'volunteer'] },
  { key: 'reliable', label: '🤝 Reliable', forRole: ['donor', 'ngo', 'volunteer'] },
  { key: 'punctual', label: '🕐 Punctual', forRole: ['ngo', 'volunteer'] },
  { key: 'well_organized', label: '📋 Well Organized', forRole: ['ngo'] },
];

const NEGATIVE_TAGS = [
  { key: 'late_pickup', label: '🐢 Late', forRole: ['ngo', 'volunteer'] },
  { key: 'poor_quality', label: '👎 Poor Quality', forRole: ['donor'] },
  { key: 'incorrect_quantity', label: '📏 Wrong Qty', forRole: ['donor'] },
  { key: 'unresponsive', label: '📵 Unresponsive', forRole: ['donor', 'ngo', 'volunteer'] },
];

const STAR_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

const RatingModal = ({ donation, rateTarget, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isDataValid = !!(donation?._id && rateTarget?._id);

  useEffect(() => {
    if (!isDataValid) {
      toast.error('Rating data is missing. Please try again.');
      if (onClose) onClose();
    }
  }, [isDataValid, onClose]);

  const targetRole = rateTarget?.role || 'donor';

  // Filter tags based on target role
  const availablePositiveTags = POSITIVE_TAGS.filter(t => t.forRole.includes(targetRole));
  const availableNegativeTags = NEGATIVE_TAGS.filter(t => t.forRole.includes(targetRole));

  const toggleTag = (tagKey) => {
    setSelectedTags(prev =>
      prev.includes(tagKey) ? prev.filter(t => t !== tagKey) : [...prev, tagKey]
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isDataValid) {
      toast.error('Rating data is missing. Please try again.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await ratingAPI.submit({
        donationId: donation._id,
        toUser: rateTarget._id,
        rating,
        feedback: feedback.trim(),
        tags: selectedTags
      });

      toast.success('Rating submitted! Thank you for your feedback 🌟');
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStars = hoveredStar || rating;

  if (!isDataValid) {
    return null;
  }

  return (
    <div className="modal-overlay rating-overlay">
      <div className="modal-content rating-modal animate-scale-in" id="rating-modal">
        {/* Header */}
        <div className="rating-modal-header">
          <div className="rating-header-icon">
            <FiAward size={28} />
          </div>
          <div>
            <h3>Rate Your Experience</h3>
            <p className="rating-subtitle">
              How was your interaction with <strong>{rateTarget?.name || 'this user'}</strong>?
            </p>
          </div>
          <button className="rating-close-btn" onClick={onClose} id="close-rating-btn">
            <FiX size={20} />
          </button>
        </div>

        {/* Donation Info */}
        <div className="rating-donation-info">
          <span className="rating-donation-icon">📦</span>
          <div>
            <strong>{donation.foodName}</strong>
            <span className="rating-donation-qty">
              {donation.quantity} {donation.unit || 'servings'}
            </span>
          </div>
        </div>

        {/* Star Rating */}
        <div className="rating-stars-section">
          <div className="rating-stars" id="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star-btn ${star <= activeStars ? 'active' : ''} ${star <= activeStars ? `star-${star}` : ''}`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={(e) => { e.stopPropagation(); setRating(star); }}
                id={`star-${star}`}
              >
                <FiStar size={32} fill={star <= activeStars ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          {activeStars > 0 && (
            <span className={`star-label star-label-${activeStars}`}>
              {STAR_LABELS[activeStars]}
            </span>
          )}
        </div>

        {/* Quick Tags */}
        <div className="rating-tags-section">
          <label className="rating-tags-label">
            <FiHeart size={14} /> What went well?
          </label>
          <div className="rating-tags">
            {availablePositiveTags.map(tag => (
              <button
                type="button"
                key={tag.key}
                className={`rating-tag ${selectedTags.includes(tag.key) ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleTag(tag.key); }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {rating > 0 && rating <= 3 && (
            <>
              <label className="rating-tags-label negative-label">
                What could improve?
              </label>
              <div className="rating-tags">
                {availableNegativeTags.map(tag => (
                  <button
                    key={tag.key}
                    className={`rating-tag negative ${selectedTags.includes(tag.key) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag.key)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Feedback Text */}
        <div className="rating-feedback-section">
          <label className="form-label">Additional Comments (Optional)</label>
          <textarea
            className="form-input rating-textarea"
            placeholder="Share more details about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={500}
            rows={3}
            id="rating-feedback"
          />
          <span className="char-count">{feedback.length}/500</span>
        </div>

        {/* Actions */}
        <div className="rating-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            Skip
          </button>
          <button
            type="button"
            className="btn btn-primary rating-submit-btn"
            onClick={(e) => { e.stopPropagation(); handleSubmit(e); }}
            disabled={submitting || rating === 0}
            id="submit-rating-btn"
          >
            {submitting ? (
              <span className="btn-loading">Submitting...</span>
            ) : (
              <><FiSend size={16} /> Submit Rating</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
