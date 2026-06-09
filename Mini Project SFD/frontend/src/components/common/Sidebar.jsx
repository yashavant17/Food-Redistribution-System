import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiPlusCircle, FiList, FiMap, FiUsers, 
  FiBarChart2, FiPackage, FiSettings
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const donorLinks = [
    { to: '/donor/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/donor/add-donation', icon: <FiPlusCircle />, label: 'Add Donation' },
    { to: '/donor/my-donations', icon: <FiList />, label: 'My Donations' },
  ];

  const ngoLinks = [
    { to: '/ngo/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/ngo/available', icon: <FiPackage />, label: 'Available Donations' },
    { to: '/ngo/accepted', icon: <FiList />, label: 'Accepted Donations' },
    { to: '/ngo/map', icon: <FiMap />, label: 'Map View' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Manage Users' },
    { to: '/admin/donations', icon: <FiPackage />, label: 'All Donations' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'donor': return donorLinks;
      case 'ngo': return ngoLinks;
      case 'admin': return adminLinks;
      default: return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} id="main-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-section">
            <p className="sidebar-section-title">NAVIGATION</p>
            <nav className="sidebar-nav">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span className="sidebar-link-label">{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
