const budgets = [
  { name: "Food & Dining", limit: 8000, spent: 5400 },
  { name: "Utilities", limit: 3000, spent: 2100 },
  { name: "Shopping", limit: 5000, spent: 3800 },
];

export default function Budgets() {
  return (
    <>
      <h2 className="dash-title">Budgets</h2>

      <div className="grid">
        {budgets.map((b, i) => (
          <div key={i} className="glass-card">
            <strong>{b.name}</strong>
            <p>₹{b.spent} / ₹{b.limit}</p>
            <progress value={b.spent} max={b.limit} />
          </div>
        ))}
      </div>
    </>
  );
}
