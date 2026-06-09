import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'donor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    organization: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if ((formData.role === 'ngo' || formData.role === 'restaurant') && !formData.organization.trim()) {
      errs.organization = 'Organization / Business name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Update coordinates in form data
        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
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
              location: {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
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
            toast.error('Location permission denied. Please allow location access in your browser.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
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
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const user = await register(submitData);
      toast.success('Registration successful!');
      switch (user.role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'ngo': 
        case 'volunteer': navigate('/ngo/dashboard'); break;
        case 'donor':
        case 'restaurant': navigate('/donor/dashboard'); break;
        default: navigate('/donor/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide animate-scale-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <GiWheat className="auth-logo-icon" />
            <span>Smart<span className="logo-green">Food</span></span>
          </Link>
          <h2>Create Account</h2>
          <p>Join our food redistribution community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              {[
                { value: 'donor', label: '🍽 Individual Donor', desc: 'I want to donate food' },
                { value: 'restaurant', label: '🏪 Restaurant / Biz', desc: 'Donate surplus business food' },
                { value: 'ngo', label: '🤝 NGO / Charity', desc: 'I collect food for charity' },
                { value: 'volunteer', label: '🙋‍♂️ Volunteer', desc: 'I help transport food' },
              ].map((role) => (
                <label
                  key={role.value}
                  className={`role-option ${formData.role === role.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                  />
                  <span className="role-label">{role.label}</span>
                  <span className="role-desc">{role.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  id="register-name"
                />
              </div>
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  id="register-email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  id="register-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  id="register-confirm-password"
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  id="register-phone"
                />
              </div>
            </div>

            {(formData.role === 'ngo' || formData.role === 'restaurant') && (
              <div className="form-group">
                <label className="form-label">Organization / Business Name</label>
                <input
                  type="text"
                  name="organization"
                  className={`form-input ${errors.organization ? 'error' : ''}`}
                  placeholder="Enter organization or business name"
                  value={formData.organization}
                  onChange={handleChange}
                  id="register-organization"
                />
                {errors.organization && <p className="form-error">{errors.organization}</p>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div className="input-with-icon">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                id="register-address"
              />
            </div>
            <button type="button" className="location-btn" onClick={handleGetLocation} disabled={locating}>
              {locating ? '⏳ Detecting location...' : '📍 Detect My Location'}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
            id="register-submit"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
