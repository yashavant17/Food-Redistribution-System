import { FiStar, FiShield } from 'react-icons/fi';
import '../ratings/RatingModal.css';

const TrustBadge = ({ averageRating = 0, totalRatings = 0, trustScore = 0, compact = false }) => {
  if (totalRatings === 0) return null;

  const getTrustClass = () => {
    if (trustScore >= 60) return 'high';
    if (trustScore >= 30) return 'medium';
    return 'low';
  };

  if (compact) {
    return (
      <span className={`trust-badge ${getTrustClass()}`}>
        <FiStar size={12} fill="currentColor" />
        {averageRating.toFixed(1)}
        <span style={{ opacity: 0.7 }}>({totalRatings})</span>
      </span>
    );
  }

  return (
    <div className={`trust-badge ${getTrustClass()}`}>
      <FiShield size={14} />
      <span className="trust-stars">
        {[1, 2, 3, 4, 5].map(s => (
          <FiStar
            key={s}
            size={12}
            fill={s <= Math.round(averageRating) ? 'currentColor' : 'none'}
            className={s <= Math.round(averageRating) ? 'filled' : 'empty'}
          />
        ))}
      </span>
      {averageRating.toFixed(1)} ({totalRatings})
    </div>
  );
};

export default TrustBadge;
