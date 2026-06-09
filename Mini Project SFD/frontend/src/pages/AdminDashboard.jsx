import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import StatsCard from '../components/cards/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiPackage, FiUsers, FiHeart, FiTrendingUp, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getDonations({ limit: 50 }),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setDonations(donationsRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: '#FFEBEE', color: '#D32F2F' },
      donor: { bg: '#E8F5E9', color: '#2E7D32' },
      ngo: { bg: '#E3F2FD', color: '#1976D2' },
    };
    const s = styles[role] || styles.donor;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  const filteredUsers = userFilter 
    ? users.filter(u => u.role === userFilter) 
    : users;

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🛡</h1>
          <p className="page-subtitle">Monitor and manage the platform</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <StatsCard icon={<FiPackage size={24} />} value={stats.totalDonations} label="Total Donations" color="green" stagger={1} />
          <StatsCard icon={<FiUsers size={24} />} value={stats.totalUsers} label="Total Users" color="blue" stagger={2} />
          <StatsCard icon={<FiHeart size={24} />} value={stats.foodSaved} label="Food Saved (qty)" color="amber" stagger={3} />
          <StatsCard icon={<FiTrendingUp size={24} />} value={stats.recentDonations} label="This Week" color="purple" stagger={4} />
        </div>
      )}

      {/* Additional Stats Row */}
      {stats && (
        <div className="stats-grid" style={{ marginTop: '-8px' }}>
          <StatsCard icon={<FiUsers size={24} />} value={stats.totalDonors} label="Donors" color="green" stagger={5} />
          <StatsCard icon={<FiUsers size={24} />} value={stats.totalNGOs} label="NGOs" color="blue" stagger={6} />
          <StatsCard icon={<FiPackage size={24} />} value={stats.pendingDonations} label="Pending" color="amber" stagger={7} />
          <StatsCard icon={<FiPackage size={24} />} value={stats.completedDonations} label="Completed" color="purple" stagger={8} />
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          📊 Donations
        </button>
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          👥 Users
        </button>
      </div>

      {/* Donations Table */}
      {tab === 'overview' && (
        <div className="table-container">
          <div className="table-header">
            <h3>All Donations</h3>
            <span className="table-count">{donations.length} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table id="donations-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Quantity</th>
                  <th>Donor</th>
                  <th>Accepted By</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.foodName}</strong></td>
                    <td>{d.quantity} {d.unit}</td>
                    <td>{d.donor?.name || 'N/A'}</td>
                    <td>{d.acceptedBy?.organization || d.acceptedBy?.name || '—'}</td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No donations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="table-container">
          <div className="table-header">
            <h3>All Users</h3>
            <div className="table-actions">
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="donor">Donors</option>
                <option value="ngo">NGOs</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table id="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: 32, height: 32, borderRadius: '50%', 
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', 
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span><strong>{u.name}</strong></span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        color: u.isActive ? '#2E7D32' : '#D32F2F',
                        fontWeight: 600, fontSize: 13
                      }}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm"
                          style={{ 
                            background: u.isActive ? '#FFF3E0' : '#E8F5E9', 
                            color: u.isActive ? '#E65100' : '#2E7D32', padding: '4px 8px'
                          }}
                          onClick={() => handleToggleUser(u._id, u.isActive)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#FFEBEE', color: '#D32F2F', padding: '4px 8px' }}
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete user"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
