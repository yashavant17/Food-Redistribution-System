import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiUsers, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to load stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading Analytics...</div>;

  const barData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'Donations This Week',
        data: [12, 19, 15, 25, 22, 30, 28], // Demo data, plug dynamic API later
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const pieData = {
    labels: ['Completed', 'Pending', 'In Transit'],
    datasets: [
      {
        data: [
          stats.completedDonations || 0,
          stats.pendingDonations || 0,
          stats.acceptedDonations || 0
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      },
    ],
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>System Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent)' }}><FiPackage /></div>
          <div className="stat-info">
            <h4>Total Donations</h4>
            <h2>{stats.totalDonations || 0}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success)' }}><FiCheckCircle /></div>
          <div className="stat-info">
            <h4>Completed Deliveries</h4>
            <h2>{stats.completedDonations || 0}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning)' }}><FiTruck /></div>
          <div className="stat-info">
            <h4>In Transit</h4>
            <h2>{stats.acceptedDonations || 0}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ec4899' }}><FiUsers /></div>
          <div className="stat-info">
            <h4>Total Users</h4>
            <h2>{stats.totalUsers || 0}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '15px' }}>Donation Trends</h3>
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '15px' }}>Delivery Status</h3>
          <div style={{ position: 'relative', height: '300px' }}>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
