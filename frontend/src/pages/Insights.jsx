import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";

// Simple Pie Chart Component
const PieChart = ({ data, colors, size = 150 }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <p style={{ color: "rgba(255,255,255,0.5)" }}>No data</p>;

  let currentAngle = 0;
  const slices = Object.entries(data).map(([label, value], i) => {
    const sliceAngle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = size / 2 + (size / 2) * Math.cos(startRad);
    const y1 = size / 2 + (size / 2) * Math.sin(startRad);
    const x2 = size / 2 + (size / 2) * Math.cos(endRad);
    const y2 = size / 2 + (size / 2) * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${size / 2} ${size / 2} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return (
      <path
        key={i}
        d={path}
        fill={colors[i % colors.length]}
        stroke="rgba(15, 23, 42, 0.8)"
        strokeWidth="2"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}>
      {slices}
      <circle cx={size / 2} cy={size / 2} r={size / 3} fill="rgba(15, 23, 42, 0.8)" />
    </svg>
  );
};

// Donut Chart for Category Distribution
const CategoryDonut = ({ categoryData, maxValue }) => {
  const pieColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const sortedData = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div>
        <PieChart data={sortedData} colors={pieColors} size={200} />
      </div>
      <div style={{ flex: 1 }}>
        {Object.entries(sortedData).map(([cat, amount], i) => (
          <div key={i} style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: pieColors[i % pieColors.length],
              }}
            ></div>
            <span style={{ color: "#ffffff", fontSize: "13px", flex: 1 }}>{cat}</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
              ₹{amount.toFixed(0)} ({((amount / Object.values(sortedData).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Category Comparison Chart
const CategoryComparison = ({ categoryData }) => {
  const sorted = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxVal = Math.max(...sorted.map(s => s[1]), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "200px", gap: "10px", padding: "20px 0" }}>
      {sorted.map(([cat, amount], i) => {
        const height = (amount / maxVal) * 150;
        const emojis = { "Shopping": "🛍️", "Dining": "🍽️", "Groceries": "🛒", "Entertainment": "🎬", "Transport": "🚗", "Utilities": "⚡", "Other": "📌" };

        return (
          <div key={i} style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                height: `${height}px`,
                background: `linear-gradient(180deg, #3b82f6, #1e40af)`,
                borderRadius: "8px 8px 0 0",
                margin: "0 auto",
                width: "60px",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              title={`₹${amount.toFixed(0)}`}
            ></div>
            <div style={{ color: "#ffffff", fontSize: "20px", marginTop: "8px" }}>{emojis[cat] || "📊"}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px" }}>{cat.slice(0, 8)}</div>
            <div style={{ color: "#3b82f6", fontSize: "11px", fontWeight: "600" }}>₹{(amount / 1000).toFixed(1)}K</div>
          </div>
        );
      })}
    </div>
  );
};

// Spending Gauge
const SpendingGauge = ({ current, budget, label }) => {
  const currentNum = Number(current) || 0;
  const budgetNum = Number(budget) || 1;
  const percentage = Math.min((currentNum / budgetNum) * 100, 100);
  const bgColor = percentage > 80 ? "#ef4444" : percentage > 50 ? "#f59e0b" : "#10b981";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 10px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="120" height="120" style={{ position: "absolute" }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={bgColor} strokeWidth="8" strokeDasharray={`${(percentage / 100) * 314} 314`} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        </svg>
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700" }}>{percentage.toFixed(0)}%</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>Used</div>
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{label}</div>
      <div style={{ color: "#ffffff", fontSize: "11px", marginTop: "4px" }}>₹{currentNum.toFixed(0)}/₹{budgetNum.toFixed(0)}</div>
    </div>
  );
};

export default function Insights() {
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [merchantData, setMerchantData] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    sms: true,
    email: true,
    push: true,
  });
  const [userId, setUserId] = useState(null);

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("finbank_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const [txnData, billData, analyticsData] = await Promise.all([
          apiFetch("get", "/transactions/"),
          apiFetch("get", "/bills/"),
          apiFetch("get", `/insights/analytics/${userId}`),
        ]);

        setTransactions(txnData || []);
        setBills(billData || []);

        // Use analytics data from backend
        if (analyticsData) {
          setCategoryData(analyticsData.category_data || {});
          setMerchantData(analyticsData.merchant_data || {});

          // Convert monthly trend from backend format
          const trendArray = analyticsData.monthly_trend || [];
          const trendMap = trendArray.reduce((acc, [month, amount]) => {
            acc[month] = amount;
            return acc;
          }, {});
          setMonthlyTrend(trendArray);
        }
      } catch (err) {
        console.error("Error loading insights:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);



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
  const savingsRateValue = ((billsPaid / (totalSpending + billsPaid)) * 100) || 0;

  const maxCatValue = Math.max(...Object.values(categoryData), 1);
  const maxTrendValue = Math.max(...monthlyTrend.map((m) => m[1]), 1);

  // Generate alerts based on spending patterns
  const generateAlerts = () => {
    const alerts = [];
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 7);

    const thisWeekTxns = transactions.filter(t => new Date(t.txn_date) > weekAgoDate && t.txn_type === "debit");
    const thisWeekSpending = thisWeekTxns.reduce((sum, t) => sum + Number(t.amount), 0);
    const lastWeekAvg = totalSpending / 4;

    if (thisWeekSpending > lastWeekAvg * 1.5) {
      alerts.push({
        id: "high-spending",
        type: "warning",
        icon: "📊",
        title: "Higher Spending This Week",
        message: `You've spent ₹${thisWeekSpending.toFixed(0)} this week, 50% above average.`,
        cta: "Set Budget",
        channel: "push",
        timestamp: new Date(),
        priority: "high",
      });
    }

    const upcomingBill = bills.find(b => b.status === "upcoming" && new Date(b.due_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
    if (upcomingBill) {
      alerts.push({
        id: "bill-reminder",
        type: "info",
        icon: "📋",
        title: "Bill Payment Due Soon",
        message: `${upcomingBill.merchant_name} bill of ₹${upcomingBill.amount_due} due ${new Date(upcomingBill.due_date).toLocaleDateString()}.`,
        cta: "Pay Now",
        channel: "email",
        timestamp: new Date(),
        priority: "medium",
      });
    }

    const uniqueMerchants = new Set(transactions.slice(-5).map(t => t.merchant));
    if (uniqueMerchants.size > 3) {
      alerts.push({
        id: "new-merchant",
        type: "security",
        icon: "🔒",
        title: "New Merchant Activity Detected",
        message: "3+ new merchants detected in last 24 hours. Secure your account if this wasn't you.",
        cta: "Review Activity",
        channel: "sms",
        timestamp: new Date(),
        priority: "critical",
      });
    }

    if (savingsRateValue > 20) {
      alerts.push({
        id: "savings-milestone",
        type: "success",
        icon: "🎉",
        title: "Great Savings Progress!",
        message: `Maintaining ${savingsRateValue.toFixed(1)}% savings rate. Excellent discipline!`,
        cta: "View Goals",
        channel: "push",
        timestamp: new Date(),
        priority: "low",
      });
    }

    return alerts;
  };

  const alerts = generateAlerts().filter(a => !dismissedAlerts.includes(a.id));
  const criticalAlerts = alerts.filter(a => a.priority === "critical");

  const dismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  if (loading) return <LoadingOverlay text="Loading insights..." />;

  return (
    <>
      <h2 className="dash-title">Financial Insights</h2>
      <p className="dash-sub">Smart analysis of your spending patterns & real-time alerts</p>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="critical-alerts-banner">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div>
              <strong>Security Alert</strong>
              <p>{criticalAlerts[0].message}</p>
            </div>
            <button className="banner-cta">{criticalAlerts[0].cta}</button>
            <button
              className="banner-close"
              onClick={() => dismissAlert(criticalAlerts[0].id)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Alerts System */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <div className="alerts-header">
            <h3>Active Alerts ({alerts.length})</h3>
            <div className="alert-filter">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Critical</button>
              <button className="filter-btn">Payments</button>
            </div>
          </div>
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-card alert-${alert.type}`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="alert-header-row">
                  <div className="alert-icon-title">
                    <span className="alert-icon">{alert.icon}</span>
                    <h4>{alert.title}</h4>
                  </div>
                  <span className={`alert-priority ${alert.priority}`}>{alert.priority}</span>
                </div>

                <p className="alert-message">{alert.message}</p>

                {expandedAlert === alert.id && (
                  <div className="alert-expanded">
                    <div className="alert-channels">
                      <span className="channel-label">Notify via:</span>
                      <div className="channel-options">
                        {notificationPreferences.sms && (
                          <span className="channel-badge sms">📱 SMS</span>
                        )}
                        {notificationPreferences.email && (
                          <span className="channel-badge email">📧 Email</span>
                        )}
                        {notificationPreferences.push && (
                          <span className="channel-badge push">🔔 Push</span>
                        )}
                      </div>
                    </div>
                    <button className="alert-cta">{alert.cta}</button>
                  </div>
                )}

                <button
                  className="alert-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards with Smart Nudges */}
      <div className="grid">
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>💰 Total Spending</span>
            <span className="trend-badge up">↑ 12%</span>
          </div>
          <strong>₹{totalSpending.toFixed(0)}</strong>
          <small>This month</small>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>✅ Bills Paid</span>
            <span className="completion-badge">{bills.length > 0 ? Math.round((paidBills / bills.length) * 100) : 0}%</span>
          </div>
          <strong>{paidBills}/{bills.length || 0}</strong>
          <small>₹{billsPaid.toFixed(0)}</small>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>📊 Savings Rate</span>
            <span className="trend-badge">Goal: 20%</span>
          </div>
          <strong>{savingsRateValue.toFixed(1)}%</strong>
          <small>Estimated</small>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>🏪 Top Category</span>
            <span className="category-icon">{topCategories[0]?.[0]}</span>
          </div>
          <strong>₹{(topCategories[0]?.[1] || 0).toFixed(0)}</strong>
          <small>{topCategories[0]?.[0] || "No data"}</small>
        </div>
      </div>

      {/* Charts Section - Category Distribution */}
      <div className="insights-section">
        <div className="insight-card full-width">
          <div className="card-header">
            <h3>Category Distribution</h3>
            <span className="card-subtitle">Spending breakdown</span>
          </div>
          <CategoryDonut categoryData={categoryData} maxValue={maxCatValue} />
        </div>
      </div>

      {/* Charts Section - Category Comparison */}
      <div className="insights-section">
        <div className="insight-card full-width">
          <div className="card-header">
            <h3>Top 5 Categories</h3>
            <span className="card-subtitle">Visual comparison</span>
          </div>
          <CategoryComparison categoryData={categoryData} />
        </div>
      </div>

      {/* Spending Gauges */}
      <div className="insights-section">
        <div className="glass-card" style={{ display: "flex", justifyContent: "space-around", padding: "20px", flexWrap: "wrap" }}>
          <SpendingGauge current={totalSpending * 0.4} budget={totalSpending || 1} label="Spending Progress" />
          <SpendingGauge current={billsPaid} budget={bills.reduce((s, b) => s + Number(b.amount_due), 0) || 1} label="Bills Paid" />
          <SpendingGauge current={savingsRateValue} budget={20} label="Savings Rate %" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="insights-section">
        {/* Spending by Category with Bar Chart */}
        <div className="insight-card">
          <div className="card-header">
            <h3>Spending Breakdown</h3>
            <span className="card-subtitle">Top 5 categories</span>
          </div>
          <div className="chart-container">
            {topCategories.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No data</p>
            ) : (
              topCategories.map(([cat, amount], i) => {
                const percentage = (amount / maxCatValue) * 100;
                const categoryColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                const categoryEmojis = {
                  "Shopping": "🛍️",
                  "Dining": "🍽️",
                  "Groceries": "🛒",
                  "Entertainment": "🎬",
                  "Transport": "🚗",
                  "Utilities": "⚡",
                  "Other": "📌"
                };

                return (
                  <div key={i} className="chart-bar-enhanced">
                    <div className="bar-label-enhanced">
                      <div className="cat-info">
                        <span className="cat-emoji">{categoryEmojis[cat] || "📊"}</span>
                        <span className="cat-name">{cat}</span>
                      </div>
                      <div className="cat-stats">
                        <span className="cat-amount">₹{amount.toFixed(0)}</span>
                        <span className="cat-percent">{((amount / totalSpending) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="bar-bg">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${categoryColors[i]}, ${categoryColors[i]}dd)`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Merchants with Interactive Elements */}
        <div className="insight-card">
          <div className="card-header">
            <h3>Top Merchants</h3>
            <span className="card-subtitle">Top 5 places</span>
          </div>
          <div className="merchant-list">
            {topMerchants.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No data</p>
            ) : (
              topMerchants.map(([merchant, amount], i) => (
                <div key={i} className="merchant-item-enhanced">
                  <div className="merchant-rank">#{i + 1}</div>
                  <div className="merchant-info">
                    <strong>{merchant}</strong>
                    <small>₹{amount.toFixed(0)}</small>
                  </div>
                  <div className="merchant-actions">
                    <span className="merchant-amount">{((amount / totalSpending) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend with Interactive Visualization */}
      <div className="insight-card full-width">
        <div className="card-header">
          <h3>6-Month Trend</h3>
          <span className="card-subtitle">Spending pattern</span>
        </div>
        <div className="trend-chart">
          <div className="trend-bars">
            {monthlyTrend.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No data</p>
            ) : (
              monthlyTrend.map(([month, amount], i) => {
                const height = (amount / maxTrendValue) * 200;
                const isHighSpending = amount > maxTrendValue * 0.8;

                return (
                  <div key={i} className="trend-bar-wrapper">
                    <div className="trend-bar-container">
                      <div
                        className={`trend-bar ${isHighSpending ? 'high-spending' : ''}`}
                        style={{
                          height: `${height}px`,
                          background: isHighSpending
                            ? `linear-gradient(180deg, #ef4444, #dc2626)`
                            : `linear-gradient(180deg, #3b82f6, #2563eb)`,
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

      {/* Key Insights - Visual & Minimal Text */}
      <div className="insights-summary">
        <h3>📊 Key Metrics</h3>
        <div className="insight-items">
          {topCategories.length > 0 && (
            <div className="insight-item insight-item-action">
              <span className="insight-icon">🎯</span>
              <div>
                <strong>{topCategories[0][0]}</strong>
                <p>₹{topCategories[0][1].toFixed(0)} • {((topCategories[0][1] / totalSpending) * 100).toFixed(1)}%</p>
              </div>
              <button className="insight-action">Budget</button>
            </div>
          )}

          {topMerchants.length > 0 && (
            <div className="insight-item insight-item-action">
              <span className="insight-icon">🏪</span>
              <div>
                <strong>{topMerchants[0][0]}</strong>
                <p>₹{topMerchants[0][1].toFixed(0)} spent</p>
              </div>
              <button className="insight-action">Track</button>
            </div>
          )}

          <div className="insight-item insight-item-action">
            <span className="insight-icon">✅</span>
            <div>
              <strong>Bills</strong>
              <p>{paidBills}/{bills.length || 0} paid • {bills.length > 0 ? ((paidBills / bills.length) * 100).toFixed(0) : 0}%</p>
            </div>
            <button className="insight-action">View</button>
          </div>

          <div className="insight-item insight-item-action">
            <span className="insight-icon">💰</span>
            <div>
              <strong>Savings</strong>
              <p>{savingsRateValue.toFixed(1)}% • Goal: 20%</p>
            </div>
            <button className="insight-action">Boost</button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="notification-preferences">
        <h3>🔔 Alert Settings</h3>
        <p className="pref-subtitle">Customize notifications</p>
        <div className="preference-grid">
          <div className="preference-card">
            <div className="pref-header">
              <span className="pref-icon">📱</span>
              <h4>SMS</h4>
            </div>
            <p>Critical alerts</p>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.sms}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, sms: e.target.checked })}
              />
              <span className={notificationPreferences.sms ? 'enabled' : 'disabled'}>
                {notificationPreferences.sms ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          <div className="preference-card">
            <div className="pref-header">
              <span className="pref-icon">📧</span>
              <h4>Email</h4>
            </div>
            <p>Detailed alerts</p>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.email}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, email: e.target.checked })}
              />
              <span className={notificationPreferences.email ? 'enabled' : 'disabled'}>
                {notificationPreferences.email ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          <div className="preference-card">
            <div className="pref-header">
              <span className="pref-icon">🔔</span>
              <h4>Push</h4>
            </div>
            <p>Instant notifications</p>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationPreferences.push}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, push: e.target.checked })}
              />
              <span className={notificationPreferences.push ? 'enabled' : 'disabled'}>
                {notificationPreferences.push ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
