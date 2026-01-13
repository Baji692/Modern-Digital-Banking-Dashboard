import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Insights() {
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [merchantData, setMerchantData] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txnData, billData] = await Promise.all([
          apiFetch("get", "/transactions/"),
          apiFetch("get", "/bills/"),
        ]);

        setTransactions(txnData || []);
        setBills(billData || []);
        analyzeData(txnData || []);
      } catch (err) {
        console.error("Error loading insights:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const analyzeData = (txns) => {
    // Category analysis
    const catMap = {};
    txns.forEach((t) => {
      if (t.txn_type === "debit") {
        const cat = t.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
      }
    });
    setCategoryData(catMap);

    // Merchant analysis
    const merMap = {};
    txns.forEach((t) => {
      if (t.merchant && t.txn_type === "debit") {
        merMap[t.merchant] = (merMap[t.merchant] || 0) + Number(t.amount);
      }
    });
    setMerchantData(merMap);

    // Monthly trend
    const monthMap = {};
    txns.forEach((t) => {
      const date = new Date(t.txn_date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (t.txn_type === "debit") {
        monthMap[key] = (monthMap[key] || 0) + Number(t.amount);
      }
    });
    const sorted = Object.entries(monthMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-6);
    setMonthlyTrend(sorted);
  };

  const topCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topMerchants = Object.entries(merchantData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalSpending = Object.values(categoryData).reduce((a, b) => a + b, 0);
  const paidBills = bills.filter((b) => b.status === "paid").length;
  const billsPaid = bills.filter((b) => b.status === "paid").reduce(
    (sum, b) => sum + Number(b.amount_due),
    0
  );
  const savingsRate = ((billsPaid / (totalSpending + billsPaid)) * 100).toFixed(1);

  const maxCatValue = Math.max(...Object.values(categoryData), 1);
  const maxTrendValue = Math.max(...monthlyTrend.map((m) => m[1]), 1);

  if (loading) return <p style={{ color: "#ffffff" }}>Loading insights...</p>;

  return (
    <>
      <h2 className="dash-title">Financial Insights</h2>
      <p className="dash-sub">Data-driven analysis of your spending patterns</p>

      {/* Summary Cards */}
      <div className="grid">
        <div className="glass-card stat-card">
          <span>Total Spending</span>
          <strong>₹{totalSpending.toFixed(2)}</strong>
          <small>This month</small>
        </div>

        <div className="glass-card stat-card">
          <span>Bills Paid</span>
          <strong>{paidBills}/{bills.length}</strong>
          <small>₹{billsPaid.toFixed(2)}</small>
        </div>

        <div className="glass-card stat-card">
          <span>Savings Rate</span>
          <strong>{savingsRate}%</strong>
          <small>Estimated</small>
        </div>

        <div className="glass-card stat-card">
          <span>Top Category</span>
          <strong>{topCategories[0]?.[0] || "N/A"}</strong>
          <small>₹{(topCategories[0]?.[1] || 0).toFixed(2)}</small>
        </div>
      </div>

      {/* Charts Section */}
      <div className="insights-section">
        {/* Spending by Category */}
        <div className="insight-card">
          <h3>Spending by Category</h3>
          <div className="chart-container">
            {topCategories.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No spending data</p>
            ) : (
              topCategories.map(([cat, amount], i) => {
                const percentage = (amount / maxCatValue) * 100;
                return (
                  <div key={i} className="chart-bar">
                    <div className="bar-label">
                      <span className="cat-name">{cat}</span>
                      <span className="cat-amount">₹{amount.toFixed(0)}</span>
                    </div>
                    <div className="bar-bg">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: `hsl(${i * 60}, 70%, 50%)`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Merchants */}
        <div className="insight-card">
          <h3>Top Merchants</h3>
          <div className="merchant-list">
            {topMerchants.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No merchant data</p>
            ) : (
              topMerchants.map(([merchant, amount], i) => (
                <div key={i} className="merchant-item">
                  <div className="merchant-info">
                    <strong>{merchant}</strong>
                    <small>₹{amount.toFixed(2)}</small>
                  </div>
                  <div className="merchant-badge">
                    #{i + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="insight-card full-width">
        <h3>Monthly Spending Trend (Last 6 Months)</h3>
        <div className="trend-chart">
          <div className="trend-bars">
            {monthlyTrend.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No trend data</p>
            ) : (
              monthlyTrend.map(([month, amount], i) => {
                const height = (amount / maxTrendValue) * 200;
                return (
                  <div key={i} className="trend-bar-wrapper">
                    <div className="trend-bar-container">
                      <div
                        className="trend-bar"
                        style={{
                          height: `${height}px`,
                          background: `linear-gradient(180deg, #3b82f6, #2563eb)`,
                        }}
                      ></div>
                    </div>
                    <div className="trend-label">{month}</div>
                    <div className="trend-value">₹{amount.toFixed(0)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="insights-summary">
        <h3>Key Insights</h3>
        <div className="insight-items">
          {topCategories.length > 0 && (
            <div className="insight-item">
              <span className="insight-icon">📊</span>
              <div>
                <strong>Highest Spending Category</strong>
                <p>
                  {topCategories[0][0]} accounts for ₹{topCategories[0][1].toFixed(2)}{" "}
                  ({((topCategories[0][1] / totalSpending) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          )}

          {topMerchants.length > 0 && (
            <div className="insight-item">
              <span className="insight-icon">🏪</span>
              <div>
                <strong>Most Frequent Merchant</strong>
                <p>
                  You spent the most at {topMerchants[0][0]} (₹
                  {topMerchants[0][1].toFixed(2)})
                </p>
              </div>
            </div>
          )}

          <div className="insight-item">
            <span className="insight-icon">✅</span>
            <div>
              <strong>Bill Payment Status</strong>
              <p>
                {paidBills} out of {bills.length} bills paid this month
              </p>
            </div>
          </div>

          {savingsRate && (
            <div className="insight-item">
              <span className="insight-icon">💰</span>
              <div>
                <strong>Savings Rate</strong>
                <p>
                  You're saving approximately {savingsRate}% of your income
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
