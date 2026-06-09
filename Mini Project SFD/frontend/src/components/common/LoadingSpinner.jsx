import './LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
