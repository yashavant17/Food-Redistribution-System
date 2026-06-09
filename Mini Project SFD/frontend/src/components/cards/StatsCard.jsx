const StatsCard = ({ icon, value, label, color = 'green', stagger = 0 }) => {
  return (
    <div className={`stat-card ${color} animate-scale-in`} style={{ animationDelay: `${stagger * 0.1}s` }}>
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
