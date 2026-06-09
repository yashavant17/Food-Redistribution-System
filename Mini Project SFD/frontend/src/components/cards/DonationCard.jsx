import './DonationCard.css';
import { FiClock, FiMapPin, FiUser, FiPackage, FiStar } from 'react-icons/fi';
import TrustBadge from './TrustBadge';

const DonationCard = ({ donation, onAccept, onViewDetails, onUpdateStatus, onRate, isRated = false, showActions = true, index = 0 }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: 'badge-pending', label: '⏳ Pending' },
      accepted: { className: 'badge-accepted', label: '✅ Accepted' },
      picked: { className: 'badge-picked', label: '🚚 Picked Up' },
      delivered: { className: 'badge-delivered', label: '🎉 Delivered' },
    };
    return badges[status] || badges.pending;
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const isExpiringSoon = (expiryTime) => {
    const diff = new Date(expiryTime) - new Date();
    return diff > 0 && diff < 6 * 60 * 60 * 1000;
  };

  const delay = Math.min(index * 0.1, 0.5);
  const badge = getStatusBadge(donation.status);

  const donorInfo = donation.donor || donation.donorInfo;
  const accepterInfo = donation.acceptedBy;

  // Determine if the Rate button should show (always show for delivered, regardless of showActions)
  const canRate = onRate && donation.status === 'delivered';

  return (
    <div className="card donation-card animate-slide-up" style={{ animationDelay: `${delay}s` }} id={`donation-${donation._id}`}>
      <div className="donation-card-image">
        {donation.image ? (
          <img src={donation.image.startsWith('http') ? donation.image : `http://localhost:5000${donation.image}`} alt={donation.foodName} />
        ) : (
          <div className="donation-card-placeholder">
            <FiPackage size={40} />
          </div>
        )}
        <span className={`badge ${badge.className} donation-status-badge`}>
          {badge.label}
        </span>
      </div>

      <div className="donation-card-body">
        <h3 className="donation-card-title">{donation.foodName}</h3>

        <div className="donation-card-meta">
          <div className="meta-item">
            <FiPackage size={14} />
            <span>{donation.quantity} {donation.unit || 'servings'}</span>
          </div>
          <div className={`meta-item ${isExpiringSoon(donation.expiryTime) ? 'urgent' : ''}`}>
            <FiClock size={14} />
            <span>{getTimeRemaining(donation.expiryTime)}</span>
          </div>
          <div className="meta-item">
            <FiMapPin size={14} />
            <span>{donation.address || 'Location not set'}</span>
          </div>
          {donorInfo?.name && (
            <div className="meta-item">
              <FiUser size={14} />
              <span>
                {donorInfo.name}
                {donorInfo.averageRating > 0 && (
                  <TrustBadge
                    averageRating={donorInfo.averageRating}
                    totalRatings={donorInfo.totalRatings}
                    trustScore={donorInfo.trustScore}
                    compact
                  />
                )}
              </span>
            </div>
          )}
          {accepterInfo?.name && (
            <div className="meta-item">
              <FiUser size={14} />
              <span>
                Accepted by: {accepterInfo.name}
                {accepterInfo.averageRating > 0 && (
                  <TrustBadge
                    averageRating={accepterInfo.averageRating}
                    totalRatings={accepterInfo.totalRatings}
                    trustScore={accepterInfo.trustScore}
                    compact
                  />
                )}
              </span>
            </div>
          )}
        </div>

        {donation.distanceKm && (
          <div className="donation-distance">
            📍 {donation.distanceKm.toFixed(1)} km away
          </div>
        )}

        {donation.description && (
          <p className="donation-card-desc">{donation.description}</p>
        )}

        {/* Standard action buttons */}
        {showActions && (
          <div className="donation-card-actions">
            {onViewDetails && (
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                onClick={(e) => { e.stopPropagation(); onViewDetails(donation); }}
              >
                View Details
              </button>
            )}
            {onAccept && donation.status === 'pending' && (
              <button 
                type="button"
                className="btn btn-primary btn-sm" 
                onClick={(e) => { e.stopPropagation(); onAccept(donation._id); }}
              >
                Accept
              </button>
            )}
            {onUpdateStatus && donation.status === 'accepted' && (
              <button 
                type="button"
                className="btn btn-primary btn-sm" 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(donation._id, 'delivered'); }}
              >
                ✅ Mark Delivered
              </button>
            )}
          </div>
        )}

        {/* Rate button — always visible for delivered donations, independent of showActions */}
        {donation.status === 'delivered' && (
          <div className="donation-rate-action">
            {isRated ? (
              <div className="rated-success-badge">
                <FiStar size={16} fill="currentColor" /> You Rated This Delivery
              </div>
            ) : canRate ? (
              <button
                type="button"
                className="btn btn-rate"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRate(donation);
                }}
                id={`rate-btn-${donation._id}`}
              >
                <FiStar size={16} /> Rate This Delivery
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationCard;
