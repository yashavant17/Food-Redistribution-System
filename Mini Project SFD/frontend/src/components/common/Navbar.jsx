import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { 
  FiMenu, FiX, FiBell, FiLogOut, FiUser, FiChevronDown 
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import './Navbar.css';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationAPI.getAll();
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
        // Silently fail - notifications are non-critical
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#D32F2F';
      case 'ngo': return '#1976D2';
      case 'donor': return '#2E7D32';
      default: return '#616161';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="navbar-toggle" 
          onClick={onToggleSidebar}
          id="sidebar-toggle"
        >
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <Link to="/" className="navbar-brand">
          <GiWheat className="brand-icon" />
          <span className="brand-text">
            Smart<span className="brand-highlight">Food</span>
          </span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="navbar-notif" ref={notifRef}>
          <button 
            className="notif-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            id="notifications-btn"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown animate-scale-in">
              <div className="notif-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="mark-read-btn">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet</p>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                    >
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-time">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="navbar-user" ref={dropdownRef}>
          <button 
            className="user-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            id="user-menu-btn"
          >
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span 
                className="user-role" 
                style={{ color: getRoleBadgeColor(user?.role) }}
              >
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <FiChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="user-dropdown animate-scale-in">
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <FiUser size={16} />
                <span>Profile</span>
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
