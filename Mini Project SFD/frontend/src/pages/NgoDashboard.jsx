import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationAPI, ratingAPI } from '../services/api';
import DonationCard from '../components/cards/DonationCard';
import StatsCard from '../components/cards/StatsCard';
import ProfileCard from '../components/cards/ProfileCard';
import DonationMap from '../components/maps/MapView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiPackage, FiCheckCircle, FiTruck, FiMap, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const NgoDashboard = () => {
  // Global Rating state from context
  const { user, setRatingModal } = useAuth();
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('nearby');
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [pendingRatings, setPendingRatings] = useState([]);

  useEffect(() => {
    fetchData();
    getUserLocation();
    fetchPendingRatings();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Use user's stored location if available
          if (user?.location?.coordinates?.[0] && user?.location?.coordinates?.[1]) {
            setUserLocation({
              lat: user.location.coordinates[1],
              lng: user.location.coordinates[0]
            });
          }
        }
      );
    }
  };

  const fetchData = async () => {
    try {
      const [nearbyRes, acceptedRes] = await Promise.all([
        donationAPI.getNearby(),
        donationAPI.getAll(),
      ]);
      setNearbyDonations(nearbyRes.data.data);
      setAcceptedDonations(acceptedRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRatings = async () => {
    try {
      const res = await ratingAPI.getPending();
      setPendingRatings(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pending ratings');
    }
  };

  const handleAccept = async (donationId) => {
    try {
      await donationAPI.accept(donationId);
      toast.success('Donation accepted! 🎉');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept donation');
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    try {
      await donationAPI.updateStatus(donationId, status);
      toast.success(`Status updated to ${status}!`);
      fetchData();
      // Refresh pending ratings when a donation is marked delivered
      if (status === 'delivered') {
        setTimeout(() => fetchPendingRatings(), 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRate = (donation, providedRateTarget = null) => {
    // If rateTarget is already provided by the pendingRatings API, use it directly
    if (providedRateTarget && providedRateTarget._id) {
      console.log('📝 Setting Rating Modal (Provided):', providedRateTarget._id);
      setRatingModal({
        donation,
        rateTarget: providedRateTarget,
        onSubmitted: handleRatingSubmitted
      });
      return;
    }

    // NGO rates the donor (fallback for cards)
    let targetId, targetName, targetRole;

    if (donation.donor && typeof donation.donor === 'object' && donation.donor._id) {
      targetId = donation.donor._id;
      targetName = donation.donor.name;
      targetRole = donation.donor.role || 'donor';
    } else if (donation.donor) {
      targetId = donation.donor;
      targetName = 'Donor';
      targetRole = 'donor';
    } else if (donation.donorInfo && donation.donorInfo._id) {
      targetId = donation.donorInfo._id;
      targetName = donation.donorInfo.name;
      targetRole = donation.donorInfo.role || 'donor';
    }

    if (!targetId) {
      toast.error('Unable to identify the donor to rate');
      return;
    }

    setRatingModal({
      donation,
      rateTarget: { _id: targetId, name: targetName, role: targetRole },
      onSubmitted: handleRatingSubmitted
    });
  };

  const handleRatingSubmitted = () => {
    console.log('📝 Rating Submitted, clearing modal');
    // Global state is cleared in App.jsx handler, 
    // but we still want to refresh our lists here
    fetchPendingRatings();
    fetchData();
  };

  const stats = {
    nearby: nearbyDonations.length,
    accepted: acceptedDonations.filter(d => d.status === 'accepted').length,
    picked: acceptedDonations.filter(d => d.status === 'picked').length,
    delivered: acceptedDonations.filter(d => d.status === 'delivered').length,
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner text="Loading nearby donations..." />
      ) : (
        <div className="dashboard-page animate-fade-in">
          <div className="page-header">
            <div>
              <h1 className="page-title">NGO & Volunteer Dashboard 🤝</h1>
              <p className="page-subtitle">
                Find and accept nearby food donations
              </p>
            </div>
            <button
              className={`btn ${showMap ? 'btn-primary' : 'btn-secondary'} animate-slide-in`}
              onClick={() => setShowMap(!showMap)}
              id="toggle-map-btn"
            >
              <FiMap /> {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          <ProfileCard />

          {/* Pending Ratings Banner */}
          {pendingRatings.length > 0 && (
            <div className="pending-ratings-banner" id="pending-ratings-banner">
              <div className="pending-banner-icon">⭐</div>
              <div className="pending-banner-text">
                <h4>You have {pendingRatings.length} delivery{pendingRatings.length > 1 ? 's' : ''} to rate!</h4>
                <p>Rate donors to build community trust and improve matching.</p>
              </div>
              <div className="pending-banner-action">
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const first = pendingRatings[0];
                    if (!first) return;
                    
                    // Ensure we don't crash if donation is missing
                    if (!first.donation) {
                      toast.error("Donation data is missing");
                      return;
                    }
                    if (!first.rateTarget || !first.rateTarget._id) {
                      toast.error("Rating target is missing");
                      return;
                    }
                    
                    handleRate(first.donation, first.rateTarget);
                  }}
                  id="rate-pending-btn"
                >
                  <FiStar size={14} /> Rate Now
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            <StatsCard icon={<FiPackage size={24} />} value={stats.nearby} label="Nearby Available" color="green" stagger={1} />
            <StatsCard icon={<FiCheckCircle size={24} />} value={stats.accepted} label="Accepted" color="blue" stagger={2} />
            <StatsCard icon={<FiTruck size={24} />} value={stats.picked} label="Picked Up" color="amber" stagger={3} />
            <StatsCard icon={<FiCheckCircle size={24} />} value={stats.delivered} label="Delivered" color="purple" stagger={4} />
          </div>

          {/* Map View */}
          {showMap && (
            <div className="map-section animate-scale-in">
              <DonationMap
                donations={nearbyDonations}
                userLocation={userLocation}
                height="400px"
              />
            </div>
          )}

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${tab === 'nearby' ? 'active' : ''}`}
              onClick={() => setTab('nearby')}
            >
              📍 Nearby Donations ({nearbyDonations.length})
            </button>
            <button
              className={`tab-btn ${tab === 'accepted' ? 'active' : ''}`}
              onClick={() => setTab('accepted')}
            >
              ✅ My Accepted ({acceptedDonations.length})
            </button>
          </div>

          {/* Tab Content */}
          {tab === 'nearby' && (
            <>
              {nearbyDonations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3>No nearby donations</h3>
                  <p>There are no pending food donations in your area right now. Check back later!</p>
                </div>
              ) : (
                <div className="donations-grid">
                  {nearbyDonations.map((donation, index) => (
                    <DonationCard
                      key={donation._id}
                      donation={donation}
                      onAccept={handleAccept}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'accepted' && (
            <>
              {acceptedDonations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🤝</div>
                  <h3>No accepted donations</h3>
                  <p>Accept nearby donations to start helping the community!</p>
                </div>
              ) : (
                <div className="donations-grid">
                  {acceptedDonations.map((donation, index) => {
                    const pendingEntry = pendingRatings.find(p => p?.donation?._id === donation._id);
                    const isRated = !pendingEntry && donation.status === 'delivered';
                    return (
                      <DonationCard
                        key={donation._id}
                        donation={donation}
                        onUpdateStatus={handleUpdateStatus}
                        onRate={isRated ? null : (d) => handleRate(d, pendingEntry?.rateTarget || null)}
                        isRated={isRated}
                        index={index}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default NgoDashboard;
