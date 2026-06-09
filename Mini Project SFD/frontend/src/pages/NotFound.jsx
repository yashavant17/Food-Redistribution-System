import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '32px',
      background: 'var(--bg-primary)'
    }}>
      <div>
        <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ marginBottom: '8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiHome /> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
