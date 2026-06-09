import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPieChart, FiUsers, FiPackage, FiMap, FiLogOut, FiShield } from 'react-icons/fi';

const DashboardLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <FiShield size={24} color="#3b82f6" />
          SFD Admin
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
            <FiPieChart /> Analytics Overview
          </NavLink>
          <NavLink to="/donations" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiPackage /> All Donations
          </NavLink>
          <NavLink to="/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiUsers /> Manage Users
          </NavLink>
          <NavLink to="/deliveries" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <FiMap /> Live Tracking
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h2>Administrator Portal</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 600, fontSize: '14px'}}>{user.name}</div>
              <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>System Admin</div>
            </div>
            <div style={{width: 35, height: 35, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
              A
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
