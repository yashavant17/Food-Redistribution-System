import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiCheck, FiX, FiSlash } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveNgo(id);
      toast.success('NGO Approved!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve NGO');
    }
  };

  const toggleBlock = async (id, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(id, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'Unblocked' : 'Blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Manage Users</h2>
      
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table>
          <thead>
            <tr>
              <th>Name / Org</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.organization || user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.organization ? user.name : '--'}</div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="badge" style={{ background: '#e2e8f0', color: '#475569', textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.role === 'ngo' && !user.isApproved ? (
                    <span className="badge pending">Pending Approval</span>
                  ) : !user.isActive ? (
                    <span className="badge rejected">Blocked</span>
                  ) : (
                    <span className="badge completed">Active</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user.role === 'ngo' && !user.isApproved && (
                      <button className="btn btn-success" onClick={() => handleApprove(user._id)} title="Approve NGO">
                        <FiCheck /> Approve
                      </button>
                    )}
                    
                    {user.role !== 'admin' && (
                      <button 
                        className={`btn ${user.isActive ? 'btn-danger' : 'btn-outline'}`}
                        onClick={() => toggleBlock(user._id, user.isActive)}
                        title={user.isActive ? "Block User" : "Unblock User"}
                      >
                        {user.isActive ? <FiSlash /> : <FiCheck />} {user.isActive ? 'Block' : 'Unblock'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
