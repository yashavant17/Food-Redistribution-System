import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationAPI, ratingAPI } from '../services/api';
import DonationCard from '../components/cards/DonationCard';
import StatsCard from '../components/cards/StatsCard';
import ProfileCard from '../components/cards/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiPackage, FiClock, FiCheckCircle, FiPlusCircle, FiImage, FiMapPin, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const DonorDashboard = () => {
  const { user, setRatingModal } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '', quantity: '', unit: 'servings', description: '',
    expiryTime: '', address: '', image: null,
  });

  const [pendingRatings, setPendingRatings] = useState([]);

  useEffect(() => {
    fetchDonations();
    fetchPendingRatings();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await donationAPI.getAll();
      setDonations(res.data.data);
    } catch (error) {
      toast.error('Failed to load donations');
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

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Reverse geocode to get address using OpenStreetMap Nominatim
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name,
              latitude,
              longitude,
            }));
            toast.success('Location & address detected!');
          } else {
            toast.success('Location detected! Please enter address manually.');
          }
        } catch (err) {
          toast.success('Location coordinates detected! Please type your address.');
        }
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please allow location access.');
            break;
          default:
            toast.error('Unable to get location. Please enter manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.foodName || !formData.quantity || !formData.expiryTime || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('foodName', formData.foodName);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('description', formData.description);
      data.append('expiryTime', formData.expiryTime);
      data.append('address', formData.address);

      const lng = formData.longitude || user?.location?.coordinates?.[0] || 0;
      const lat = formData.latitude || user?.location?.coordinates?.[1] || 0;
      data.append('location', JSON.stringify({ type: 'Point', coordinates: [lng, lat] }));

      if (formData.image) {
        data.append('image', formData.image);
      }

      await donationAPI.create(data);
      toast.success('Donation created successfully!');
      setShowForm(false);
      setFormData({ foodName: '', quantity: '', unit: 'servings', description: '', expiryTime: '', address: '', image: null });
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create donation');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRate = (donation, providedRateTarget = null) => {
    // If rateTarget is already provided by the pendingRatings API, use it directly
    if (providedRateTarget && providedRateTarget._id) {
      setRatingModal({
        donation,
        rateTarget: providedRateTarget,
        onSubmitted: handleRatingSubmitted
      });
      return;
    }

    // Donor rates the NGO/volunteer who accepted (fallback for cards)
    let targetId, targetName, targetRole;

    if (donation.acceptedBy && typeof donation.acceptedBy === 'object' && donation.acceptedBy._id) {
      targetId = donation.acceptedBy._id;
      targetName = donation.acceptedBy.name;
      targetRole = donation.acceptedBy.role || 'ngo';
    } else if (donation.acceptedBy) {
      targetId = donation.acceptedBy;
      targetName = 'NGO/Volunteer';
      targetRole = 'ngo';
    }

    if (!targetId) {
      toast.error('Unable to identify the NGO/volunteer to rate');
      return;
    }

    setRatingModal({
      donation,
      rateTarget: { _id: targetId, name: targetName, role: targetRole },
      onSubmitted: handleRatingSubmitted
    });
  };

  const handleRatingSubmitted = () => {
    fetchPendingRatings();
    fetchDonations();
  };

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === 'pending').length,
    accepted: donations.filter(d => d.status === 'accepted').length,
    completed: donations.filter(d => d.status === 'delivered').length,
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner text="Loading your dashboard..." />
      ) : (
        <div className="dashboard-page animate-fade-in">
          <div className="page-header">
            <div>
              <h1 className="page-title">Donor Dashboard 👋</h1>
              <p className="page-subtitle">Manage your food donations and track their status</p>
            </div>
            <button className="btn btn-primary animate-slide-in" onClick={() => setShowForm(!showForm)} id="add-donation-btn">
              <FiPlusCircle /> {showForm ? 'Cancel' : 'New Donation'}
            </button>
          </div>

          <ProfileCard />

          {/* Pending Ratings Banner */}
          {pendingRatings.length > 0 && (
            <div className="pending-ratings-banner" id="pending-ratings-banner">
              <div className="pending-banner-icon">⭐</div>
              <div className="pending-banner-text">
                <h4>You have {pendingRatings.length} volunteer{pendingRatings.length > 1 ? 's' : ''} to rate!</h4>
                <p>Rate volunteers & NGOs to improve trust and matching quality.</p>
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
            <StatsCard icon={<FiPackage size={24} />} value={stats.total} label="Total Donations" color="green" stagger={1} />
            <StatsCard icon={<FiClock size={24} />} value={stats.pending} label="Pending" color="amber" stagger={2} />
            <StatsCard icon={<FiCheckCircle size={24} />} value={stats.accepted} label="Accepted" color="blue" stagger={3} />
            <StatsCard icon={<FiCheckCircle size={24} />} value={stats.completed} label="Delivered" color="purple" stagger={4} />
          </div>

          {/* Donation Form */}
          {showForm && (
            <div className="card donation-form-card animate-scale-in">
              <div className="card-header">
                <h3>📦 Create New Donation</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} id="donation-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Food Name *</label>
                      <input
                        type="text" name="foodName" className="form-input"
                        placeholder="e.g., Rice, Bread, Mixed Vegetables"
                        value={formData.foodName} onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <div className="form-row" style={{ gap: '8px' }}>
                        <input
                          type="number" name="quantity" className="form-input"
                          placeholder="Amount" min="1"
                          value={formData.quantity} onChange={handleChange}
                        />
                        <select name="unit" className="form-select" value={formData.unit} onChange={handleChange}>
                          <option value="servings">Servings</option>
                          <option value="kg">Kg</option>
                          <option value="plates">Plates</option>
                          <option value="packets">Packets</option>
                          <option value="boxes">Boxes</option>
                          <option value="liters">Liters</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description" className="form-input"
                      placeholder="Describe the food (type, dietary info, etc.)"
                      value={formData.description} onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expiry Time *</label>
                      <input
                        type="datetime-local" name="expiryTime" className="form-input"
                        value={formData.expiryTime} onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Upload Image</label>
                      <div className="file-upload">
                        <input type="file" name="image" accept="image/*" onChange={handleChange} id="donation-image" />
                        <FiImage className="file-icon" />
                        <span>{formData.image ? formData.image.name : 'Choose file...'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input
                      type="text" name="address" className="form-input"
                      placeholder="Enter pickup address"
                      value={formData.address} onChange={handleChange}
                    />
                    <button type="button" className="location-btn" onClick={handleGetLocation} disabled={locating}>
                      <FiMapPin size={14} /> {locating ? 'Detecting...' : 'Detect My Location'}
                    </button>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={formLoading} id="submit-donation">
                      {formLoading ? 'Creating...' : '🎁 Create Donation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Donations List */}
          <div className="section-title-row">
            <h3>Your Donations</h3>
          </div>

          {donations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽</div>
              <h3>No donations yet</h3>
              <p>Start making a difference by creating your first food donation!</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>
                <FiPlusCircle /> Create Donation
              </button>
            </div>
          ) : (
            <div className="donations-grid">
              {donations.map((donation, index) => {
                const isDelivered = donation.status === 'delivered';
                const pendingEntry = pendingRatings.find(p => p?.donation?._id === donation._id);
                const isRated = isDelivered && !pendingEntry;
                
                return (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    showActions={isDelivered}
                    onRate={isRated ? null : (d) => handleRate(d, pendingEntry?.rateTarget || null)}
                    isRated={isRated}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DonorDashboard;
