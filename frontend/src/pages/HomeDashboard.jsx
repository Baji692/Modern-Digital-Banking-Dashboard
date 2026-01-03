// pages/HomeDashboard.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function HomeDashboard({ user }) {
  const name = user?.name || "User";

  /* ================= STATE ================= */
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  /* ================= LOAD ACCOUNTS ================= */
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await apiFetch("get", "/accounts/");
        setAccounts(data || []);
      } catch {
        setAccounts([]);
      }
    };

    loadAccounts();
  }, []);

  /* ================= LOAD TRANSACTIONS ================= */
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const all = await apiFetch("get", "/transactions/");
        const recent = await apiFetch("get", "/transactions/recent");

        setAllTransactions(all || []);
        setRecentTransactions((recent || []).slice(0, 5));
      } catch {
        setAllTransactions([]);
        setRecentTransactions([]);
      }
    };

    loadTransactions();
  }, []);

  /* ================= DERIVED VALUES ================= */
  const totalBalance = accounts.reduce(
    (sum, a) => sum + (Number(a.balance) || 0),
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = allTransactions.filter((t) => {
    const d = new Date(t.txn_date);
    return (
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  });

  const activeMerchants = new Set(
    monthlyTransactions.map((t) => t.merchant).filter(Boolean)
  ).size;

  /* ================= STATIC (INTENTIONAL) ================= */
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
          <strong>₹{totalBalance.toFixed(2)}</strong>
          <small>Across {accounts.length} accounts</small>
        </div>

        <div className="glass-card">
          <span>Active Merchants</span>
          <strong>{activeMerchants}</strong>
          <small>This month</small>
        </div>

        <div className="glass-card">
          <span>Transactions</span>
          <strong>{monthlyTransactions.length}</strong>
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
          {accounts.map((a) => (
            <div key={a.id} className="glass-card">
              <strong>{a.bank_name}</strong>
              <small>
                {a.account_type} · {a.masked_account}
              </small>
              <p className={Number(a.balance) < 0 ? "neg" : "pos"}>
                ₹{Math.abs(Number(a.balance)).toFixed(2)}
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
            <button
              className="link-btn"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("dashboard:navigate", {
                    detail: "transactions",
                  })
                )
              }
            >
              View All
            </button>
          </div>

          {recentTransactions.length === 0 && (
            <p style={{ opacity: 0.6 }}>No recent transactions</p>
          )}

          {recentTransactions.map((t) => (
            <div key={t.id} className="row">
              <div>
                <strong>{t.merchant || t.description}</strong>
                <small>
                  {t.category ? ` ${t.category}` : " Uncategorized"}
                </small>
              </div>

              <div className={t.txn_type === "debit" ? "neg" : "pos"}>
                <div>
                  {t.txn_type === "debit" ? "-" : "+"}₹{t.amount}
                </div>
                <small>
                  {new Date(t.txn_date).toLocaleDateString()}
                </small>
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
