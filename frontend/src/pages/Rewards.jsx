const rewards = [
  { source: "Credit Card Spend", points: 1200 },
  { source: "Dining Cashback", points: 750 },
  { source: "Festive Bonus", points: 500 },
];

export default function Rewards() {
  return (
    <>
      <h2 className="dash-title">Rewards</h2>

      <div className="grid">
        {rewards.map((r, i) => (
          <div key={i} className="glass-card">
            <strong>{r.source}</strong>
            <p>{r.points} pts</p>
          </div>
        ))}
      </div>
    </>
  );
}
