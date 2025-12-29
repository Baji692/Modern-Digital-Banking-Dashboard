// pages/HomeDashboard.jsx
export default function HomeDashboard({ user }) {
  const name = user?.name || "User";

  /* ================= MOCK DATA ================= */

  const accounts = [
    { name: "Chase Bank", type: "Checking", balance: 5420.5, mask: "**** 1234" },
    { name: "Bank of America", type: "Savings", balance: 12350.75, mask: "**** 5678" },
    { name: "Citibank", type: "Credit Card", balance: -1250, mask: "**** 9012" },
  ];

  const transactions = [
    { merchant: "Whole Foods Market", category: " Food & Dining", amount: -125.5, date: " 1 Dec 2024" },
    { merchant: "Bank of America", category: " Income", amount: 15.5, date: " 1 Dec 2024" },
    { merchant: "Employer Inc.", category: " Salary", amount: 4500, date: " 30 Nov 2024" },
  ];

  const bills = [
    { name: "Electricity Bill", amount: 1200, due: " In 3 days", status: "Due" },
    { name: "Internet Bill", amount: 999, due: " Paid", status: "Paid" },
  ];

  const alerts = [
    { type: "Low Balance", message: " Account ending in 4832 has low balance" },
    { type: "Bill Due", message: " Electricity bill due in 3 days" },
  ];

  /* ================= UI ================= */

  return (
    <>
      {/* HEADER */}
      <h2 className="dash-title">Welcome, {name}</h2>
      <p className="dash-sub">Manage your accounts and transactions</p>

      {/* SUMMARY */}
      <div className="grid">
        <div className="glass-card">
          <span>Total Balance</span>
          <strong>₹16,570.25</strong>
          <small>Across 3 accounts</small>
        </div>

        <div className="glass-card">
          <span>Active Merchants</span>
          <strong>24</strong>
          <small>+3 this month</small>
        </div>

        <div className="glass-card">
          <span>Transactions</span>
          <strong>156</strong>
          <small>This month</small>
        </div>

        <div className="glass-card">
          <span>Rewards Points</span>
          <strong>2,450</strong>
          <small>≈ ₹245 value</small>
        </div>
      </div>

      {/* ACCOUNTS OVERVIEW */}
      <section className="section">
        <h3 className="section-title">Accounts Overview</h3>
        <div className="grid">
          {accounts.map((a, i) => (
            <div key={i} className="glass-card">
              <strong>{a.name}</strong>
              <small>{a.type} · {a.mask}</small>
              <p className={a.balance < 0 ? "neg" : "pos"}>
                ₹{Math.abs(a.balance)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRANSACTIONS + ALERTS */}
      <section className="split">
        {/* RECENT TRANSACTIONS */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
            <button className="link-btn">View All</button>
          </div>

          {transactions.map((t, i) => (
            <div key={i} className="row">
              <div>
                <strong>{t.merchant}</strong>
                <small>{t.category}</small>
              </div>
              <div className={t.amount < 0 ? "neg" : "pos"}>
                {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount)}
                <small>{t.date}</small>
              </div>
            </div>
          ))}
        </div>

        {/* ALERTS */}
        <div className="glass-panel">
          <h3>Alerts</h3>
          {alerts.map((a, i) => (
            <div key={i} className="alert-row">
              <strong>{a.type}</strong>
              <small>{a.message}</small>
            </div>
          ))}
        </div>
      </section>

      {/* BILLS + INSIGHTS */}
      <section className="split">
        {/* BILLS */}
        <div className="glass-panel">
          <h3>Upcoming Bills</h3>
          {bills.map((b, i) => (
            <div key={i} className="row">
              <div>
                <strong>{b.name}</strong>
                <small>{b.due}</small>
              </div>
              <div className={b.status === "Paid" ? "pos" : "neg"}>
                ₹{b.amount}
              </div>
            </div>
          ))}
        </div>

        {/* INSIGHTS */}
        <div className="glass-panel">
          <h3>Insights</h3>
          <div className="insight">💡 Highest spending: Food & Dining</div>
          <div className="insight">📈 Savings increased by 12%</div>
          <div className="insight">🏦 Most used account: Chase Bank</div>
        </div>
      </section>
    </>
  );
}
