import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const res = await adminAPI.getDonations();
      setDonations(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  if (loading) return <div>Loading donations...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>All Donations</h2>
      
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table>
          <thead>
            <tr>
              <th>Food Item Details</th>
              <th>Donor & Pickup Address</th>
              <th>Receiver (NGO / Volunteer)</th>
              <th>Date Listed</th>
              <th>Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(doc => (
              <tr key={doc._id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--accent)' }}>{doc.foodName}</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Quantity:</span> {doc.quantity} {doc.unit}
                  </div>
                  {doc.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.description}</div>}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{doc.donor?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px' }}>
                    📍 {doc.address || 'Address not provided'}
                  </div>
                </td>
                <td>
                  {doc.acceptedBy ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{doc.acceptedBy.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.acceptedBy.organization || doc.acceptedBy.role}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Acceptance</span>
                  )}
                </td>
                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${doc.status === 'pending' ? 'pending' : doc.status === 'delivered' ? 'completed' : 'accepted'}`} style={{ width: 'max-content' }}>
                      {doc.status === 'delivered' ? '✅ DELIVERED' : doc.status.toUpperCase()}
                    </span>
                    {doc.completedAt ? (
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        Time: {new Date(doc.completedAt).toLocaleString()}
                      </div>
                    ) : doc.acceptedAt ? (
                      <div style={{ fontSize: '11px', color: '#2563eb' }}>
                        In Transit Since:<br/>{new Date(doc.acceptedAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No donations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Donations;
