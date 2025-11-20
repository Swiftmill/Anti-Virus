const StatsCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
  <div className="card stats">
    <p className="title">{title}</p>
    <h3>{value}</h3>
    {subtitle && <p className="subtitle">{subtitle}</p>}
  </div>
);

export default StatsCard;
