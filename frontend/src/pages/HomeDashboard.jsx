// pages/HomeDashboard.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function HomeDashboard({ user }) {
  const name = user?.name || "User";
  const userId = user?.id;

  /* ================= STATE ================= */
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(0);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accData, txnData, recentData, billData, rewardsData] = await Promise.all([
          apiFetch("get", "/accounts/"),
          apiFetch("get", "/transactions/"),
          apiFetch("get", "/transactions/recent"),
          apiFetch("get", "/bills/upcoming"),
          userId ? apiFetch("get", `/rewards/summary/${userId}`) : Promise.resolve(null),
        ]);

        setAccounts(accData || []);
        setAllTransactions(txnData || []);
        setRecentTransactions((recentData || []).slice(0, 5));
        setUpcomingBills((billData || []).slice(0, 4));

        // Set monthly reward points from backend
        if (rewardsData && rewardsData.monthly_points) {
          setMonthlyRewardPoints(rewardsData.monthly_points);
        }

        // Generate dynamic alerts
        generateAlerts(accData || [], billData || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const generateAlerts = (accs, bills) => {
    const generatedAlerts = [];

    // Low balance alerts
    accs.forEach((a) => {
      if (Number(a.balance) < 5000) {
        generatedAlerts.push({
          type: "⚠️ Low Balance",
          message: `${a.bank_name} (${a.masked_account}) has low balance`,
          severity: "warning",
        });
      }
    });

    // Upcoming bills
    bills.forEach((b) => {
      if (b.status !== "paid") {
        const dueDate = new Date(b.due_date);
        const today = new Date();
        const daysUntil = Math.ceil(
          (dueDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil <= 3 && daysUntil > 0) {
          generatedAlerts.push({
            type: "📅 Bill Due Soon",
            message: `${b.biller_name} due in ${daysUntil} day(s) - ₹${b.amount_due}`,
            severity: "alert",
          });
        } else if (daysUntil <= 0) {
          generatedAlerts.push({
            type: "🚨 Overdue Bill",
            message: `${b.biller_name} is overdue - ₹${b.amount_due}`,
            severity: "error",
          });
        }
      }
    });

    setAlerts(generatedAlerts.slice(0, 4));
  };

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

  const monthlySpending = monthlyTransactions
    .filter((t) => t.txn_type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.txn_type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const activeMerchants = new Set(
    monthlyTransactions.map((t) => t.merchant).filter(Boolean)
  ).size;

  const topCategory = monthlyTransactions.reduce((acc, t) => {
    if (t.txn_type === "debit") {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];

  /* ================= UI ================= */
  return (
    <>
      {/* HEADER */}
      <h2 className="dash-title">Welcome back, {name}! 👋</h2>
      <p className="dash-sub">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* KEY METRICS */}
      <div className="grid">
        <div className="glass-card metric-card">
          <span>Total Balance</span>
          <strong>₹{totalBalance.toFixed(2)}</strong>
          <small>Across {accounts.length} accounts</small>
          <div className="metric-bar">
            <div
              className="metric-bar-fill green"
              style={{
                width: `${Math.min((totalBalance / 100000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <span>Monthly Spending</span>
          <strong>₹{monthlySpending.toFixed(2)}</strong>
          <small>{monthlyTransactions.length} transactions</small>
          <div className="metric-bar">
            <div
              className="metric-bar-fill red"
              style={{
                width: `${Math.min((monthlySpending / 50000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <span>Monthly Income</span>
          <strong>₹{monthlyIncome.toFixed(2)}</strong>
          <small>{monthlyIncome > 0 ? "Received" : "None yet"}</small>
          <div className="metric-bar">
            <div
              className="metric-bar-fill blue"
              style={{
                width: `${Math.min((monthlyIncome / 100000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <span>This Month's Rewards</span>
          <strong>{monthlyRewardPoints.toLocaleString()}</strong>
          <small>≈ ₹{(monthlyRewardPoints / 100).toFixed(2)}</small>
          <div className="metric-bar">
            <div
              className="metric-bar-fill gold"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* ACCOUNTS OVERVIEW */}
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Your Accounts</h3>
          <a href="/#/accounts" className="link-btn">
            View All
          </a>
        </div>
        <div className="grid">
          {accounts.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No accounts available</p>
          ) : (
            accounts.map((a) => (
              <div key={a.id} className="glass-card account-overview">
                <div className="account-header">
                  <strong>{a.bank_name}</strong>
                  <span className="account-type">{a.account_type}</span>
                </div>
                <div className="account-mask">{a.masked_account}</div>
                <p
                  className={
                    Number(a.balance) < 0 ? "amount negative" : "amount positive"
                  }
                >
                  ₹{Math.abs(Number(a.balance)).toFixed(2)}
                </p>
                <small>
                  {a.is_primary ? "✓ Primary Account" : "Secondary"}
                </small>
              </div>
            ))
          )}
        </div>
      </section>

      {/* TRANSACTIONS + ALERTS */}
      <section className="split">
        {/* RECENT TRANSACTIONS */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
            <a href="/#/transactions" className="link-btn">
              View All
            </a>
          </div>

          {recentTransactions.length === 0 ? (
            <p style={{ opacity: 0.6, padding: "20px" }}>
              No recent transactions
            </p>
          ) : (
            <div className="transaction-list">
              {recentTransactions.map((t) => (
                <div key={t.id} className="transaction-row">
                  <div className="tx-left">
                    <div className="tx-icon" data-type={t.txn_type}>
                      {t.txn_type === "debit" ? "↙" : "↗"}
                    </div>
                    <div className="tx-info">
                      <strong>{t.merchant || t.description}</strong>
                      <small>{t.category || "Uncategorized"}</small>
                    </div>
                  </div>
                  <div className="tx-right">
                    <div className={`tx-amount ${t.txn_type}`}>
                      {t.txn_type === "debit" ? "-" : "+"}₹{t.amount}
                    </div>
                    <small className="tx-date">
                      {new Date(t.txn_date).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALERTS & INSIGHTS */}
        <div className="glass-panel">
          <h3>Alerts & Insights</h3>

          {alerts.length === 0 ? (
            <p style={{ opacity: 0.6, padding: "20px" }}>All clear!</p>
          ) : (
            <div className="alerts-list">
              {alerts.map((a, i) => (
                <div key={i} className={`alert-item ${a.severity}`}>
                  <div className="alert-type">{a.type}</div>
                  <small>{a.message}</small>
                </div>
              ))}
            </div>
          )}

          <div className="insights-box">
            <h4>💡 Smart Insights</h4>
            {topCat && (
              <p>
                Your top spending category is <strong>{topCat[0]}</strong> at ₹
                {topCat[1].toFixed(2)}
              </p>
            )}
            <p>
              You have <strong>{activeMerchants}</strong> active merchants this
              month
            </p>
            <p>
              Spending is{" "}
              <strong>
                {monthlySpending > 40000 ? "above average" : "within budget"}
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* BILLS + QUICK ACTIONS */}
      <section className="split">
        {/* UPCOMING BILLS */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Upcoming Bills</h3>
            <a href="/#/bills" className="link-btn">
              Manage
            </a>
          </div>

          {upcomingBills.length === 0 ? (
            <p style={{ opacity: 0.6, padding: "20px" }}>No upcoming bills</p>
          ) : (
            <div className="bills-list">
              {upcomingBills.map((b) => (
                <div key={b.id} className="bill-item">
                  <div className="bill-left">
                    <strong>{b.biller_name}</strong>
                    <small>
                      Due: {new Date(b.due_date).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="bill-right">
                    <div className="bill-amount">₹{b.amount_due}</div>
                    <span
                      className={`bill-status ${b.status}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="glass-panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <a href="/#/transactions" className="action-card">
              <span className="action-icon">💳</span>
              <div>
                <strong>View Transactions</strong>
                <small>See all your transactions</small>
              </div>
            </a>

            <a href="/#/bills" className="action-card">
              <span className="action-icon">📄</span>
              <div>
                <strong>Pay Bills</strong>
                <small>Manage upcoming bills</small>
              </div>
            </a>

            <a href="/#/budgets" className="action-card">
              <span className="action-icon">📊</span>
              <div>
                <strong>Set Budgets</strong>
                <small>Track spending limits</small>
              </div>
            </a>

            <a href="/#/insights" className="action-card">
              <span className="action-icon">📈</span>
              <div>
                <strong>View Insights</strong>
                <small>Financial analysis</small>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
