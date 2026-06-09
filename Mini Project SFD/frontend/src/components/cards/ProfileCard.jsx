import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiEdit3, FiX, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ProfileCard.css';

const ProfileCard = () => {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    address: user?.address || ''
  });

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const toastId = toast.loading('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name
            }));
            toast.success('Address auto-filled successfully!', { id: toastId });
          } else {
            toast.error('Location detected but could not resolve address.', { id: toastId });
          }
        } catch (err) {
          toast.error('Failed to fetch address details.', { id: toastId });
        }
      },
      (error) => {
        toast.error('Unable to get location. ' + error.message, { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUserData(res.data.data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Roles format
  const formattedRole = user.role === 'ngo' ? 'NGO / Charity' : user.role === 'restaurant' ? 'Restaurant / Biz' : user.role === 'volunteer' ? 'Volunteer' : 'Donor';

  return (
    <>
      <div className="card profile-card animate-slide-up stagger-1">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-titles">
            <h2>{user.organization || user.name}</h2>
            <span className="profile-role-badge">
              <FiShield /> {formattedRole}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm edit-btn" onClick={() => setIsEditing(true)}>
            <FiEdit3 /> Edit Profile
          </button>
        </div>
        
        <div className="profile-details-grid">
          <div className="detail-item">
            <FiUser className="detail-icon" />
            <div>
              <strong>Contact Person</strong>
              <p>{user.name}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <FiMail className="detail-icon" />
            <div>
              <strong>Email Address</strong>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <FiPhone className="detail-icon" />
            <div>
              <strong>Phone Number</strong>
              <p>{user.phone || 'Not provided'}</p>
            </div>
          </div>
          
          {(user.role === 'ngo' || user.role === 'restaurant') && (
            <div className="detail-item">
              <FiBriefcase className="detail-icon" />
              <div>
                <strong>Organization Details</strong>
                <p>{user.organization || 'Not provided'}</p>
              </div>
            </div>
          )}
          
          <div className="detail-item full-width">
            <FiMapPin className="detail-icon" />
            <div>
              <strong>Registered Address</strong>
              <p>{user.address || 'No address set'}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsEditing(false) }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Edit Profile & Organization Info</h3>
              <button 
                onClick={() => setIsEditing(false)} 
                style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Contact Person Name / Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {(user.role === 'ngo' || user.role === 'restaurant') && (
                <div className="form-group">
                  <label className="form-label">Organization / Business Name</label>
                  <input
                    type="text"
                    name="organization"
                    className="form-input"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-input"
                  rows={2}
                  style={{ minHeight: '60px' }}
                  value={formData.address}
                  onChange={handleChange}
                />
                <button type="button" className="location-btn" onClick={handleGetLocation}>
                  📍 Fill from my GPS Location
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
