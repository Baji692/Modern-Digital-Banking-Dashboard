import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import GoalsEditModal from "../components/GoalsEditModal";
import { toast } from "react-toastify";

// Interactive Tooltip Component (can be used for advanced tooltips)
// const Tooltip = ({ visible, x, y, content }) => {
//   if (!visible) return null;
//   return (
//     <div
//       className="chart-tooltip"
//       style={{
//         position: "fixed",
//         left: `${x}px`,
//         top: `${y}px`,
//         pointerEvents: "none",
//         zIndex: 1000,
//       }}
//     >
//       {content}
//     </div>
//   );
// };

// Interactive Bar Chart with Hover Effects
const InteractiveBarChart = ({ data, maxValue, onHover, hoveredItem }) => {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const emojis = {
    Shopping: "🛍️",
    Dining: "🍽️",
    Groceries: "🛒",
    Entertainment: "🎬",
    Transport: "🚗",
    Utilities: "⚡",
    Other: "📌",
  };

  return (
    <div className="interactive-bar-chart">
      {data.map(([category, amount], i) => {
        const percentage = (amount / maxValue) * 100;
        const isHovered = hoveredItem === category;

        return (
          <div
            key={i}
            className={`bar-item ${isHovered ? "hovered" : ""}`}
            onMouseEnter={() => onHover(category)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="bar-header">
              <div className="cat-info">
                <span className="cat-emoji">{emojis[category] || "📊"}</span>
                <span className="cat-name">{category}</span>
              </div>
              <div className="cat-stats">
                <span className="cat-amount">₹{amount.toFixed(0)}</span>
                <span className="cat-percent">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, subtext, trend, icon, onClick, pendingCount }) => {
  return (
    <div className="kpi-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-title">{title}</span>
        {pendingCount > 0 && (
          <span className="pending-badge">{pendingCount}</span>
        )}
        {trend !== undefined && trend !== 0 && (
          <span className={`trend-indicator ${trend > 0 ? "up" : "down"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {subtext && <div className="kpi-subtext">{subtext}</div>}
    </div>
  );
};

// Professional Spending Gauge
const ProfessionalGauge = ({ current, budget, label, color = "#3b82f6", formatType = "currency", onEditGoal }) => {
  const currentNum = Number(current) || 0;
  const budgetNum = Number(budget) || 1;
  const percentage = formatType === "percentage" ? Math.min((currentNum / budgetNum) * 100, 100) : Math.min((currentNum / budgetNum) * 100, 100);

  let gaugeColor = "#10b981"; // Green
  if (formatType === "percentage") {
    // For savings rate and percentage goals: higher is better
    if (percentage < 50) gaugeColor = "#ef4444"; // Red - below 50% of goal
    else if (percentage < 100) gaugeColor = "#f59e0b"; // Amber - below goal
    // else gaugeColor stays green - exceeding goal
  } else {
    // For spending and currency: lower is better
    if (percentage > 80) gaugeColor = "#ef4444"; // Red
    else if (percentage > 50) gaugeColor = "#f59e0b"; // Amber
  }

  return (
    <div className="gauge-card">
      <div className="gauge-header">
        <h4>{label}</h4>
        <div className="gauge-header-actions">
          <span className="gauge-percentage">{percentage.toFixed(0)}%</span>
          <button className="gauge-edit-btn" onClick={onEditGoal} title="Edit goal">
            ✏️
          </button>
        </div>
      </div>
      <div className="gauge-wrapper">
        <div className="stat stat-start">
          <span className="label">Current</span>
          <span className="value">{formatType === "percentage" ? `${currentNum.toFixed(1)}%` : `₹${currentNum.toFixed(0)}`}</span>
        </div>
        <div className="gauge-container">
          <svg width="100%" height="120" viewBox="0 0 200 120">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%">
                <stop offset="0%" stopColor={gaugeColor} />
                <stop offset="100%" stopColor={gaugeColor} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 251} 251`}
            />
            <circle cx="100" cy="100" r="8" fill={gaugeColor} />
          </svg>
        </div>
        <div className="stat stat-end">
          <span className="label">Goal</span>
          <span className="value">{formatType === "percentage" ? `${budgetNum.toFixed(1)}%` : `₹${budgetNum.toFixed(0)}`}</span>
        </div>
      </div>
    </div>
  );
};

// Spending Anomaly Alert
const AnomalyAlert = ({ title, description, severity, onDismiss }) => {
  const severityColors = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    success: "#10b981",
  };

  return (
    <div className="anomaly-alert" style={{ borderLeft: `4px solid ${severityColors[severity]}` }}>
      <div className="alert-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <button className="alert-dismiss-btn" onClick={onDismiss}>
        ✕
      </button>
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
  const [userId, setUserId] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState("month"); // month, quarter, year
  const [userGoals, setUserGoals] = useState({
    savings_goal: 20,
    spending_goal: 100000,
    bills_goal: 100
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Load data from backend
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const [txnData, billData, analyticsData, goalsData] = await Promise.all([
          apiFetch("get", "/transactions/"),
          apiFetch("get", "/bills/"),
          apiFetch("get", `/insights/analytics/${userId}`),
          apiFetch("get", `/goals/summary/${userId}`),
        ]);

        setTransactions(txnData || []);
        setBills(billData || []);

        if (analyticsData) {
          setCategoryData(analyticsData.category_data || {});
          setMerchantData(analyticsData.merchant_data || {});
          setMonthlyTrend(analyticsData.monthly_trend || []);
        }

        if (goalsData) {
          setUserGoals(goalsData);
        }
      } catch (err) {
        console.error("Error loading insights:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Check notification preferences
  const checkInsightsEnabled = () => {
    const preferences = localStorage.getItem("finbank_notifications");
    if (preferences) {
      const prefs = JSON.parse(preferences);
      return prefs.insightsAnalytics !== false;
    }
    return true;
  };

  // Calculate metrics
  const topCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topMerchants = Object.entries(merchantData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const totalSpending = Object.values(categoryData).reduce((a, b) => a + b, 0);
  const totalIncome = transactions
    .filter((t) => t.txn_type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const paidBills = bills.filter((b) => b.status === "paid").length;
  const pendingBills = bills.filter((b) => b.status !== "paid").length;
  const totalBills = bills.length;
  const billsPaid = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + Number(b.amount_due), 0);
  const totalBillsAmount = bills.reduce((sum, b) => sum + Number(b.amount_due), 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;
  const avgDailySpending = totalSpending / 30; // Approximate
  const transactionCount = transactions.filter((t) => t.txn_type === "debit").length;

  // Handle goal editing
  const handleEditGoal = (goalName, goalLabel) => {
    setEditingGoal({ name: goalName, label: goalLabel });
    setModalOpen(true);
  };

  const handleSaveGoal = async (newValue) => {
    try {
      const updateData = {
        [editingGoal.name]: newValue
      };

      const response = await apiFetch("put", `/goals/update/${userId}`, updateData);

      if (response) {
        setUserGoals(response);
        toast.success(`${editingGoal.label} updated!`);
      }
    } catch (err) {
      console.error("Error saving goal:", err);
      toast.error("Failed to save goal");
      throw err;
    }
  };

  // Detect anomalies
  const anomalies = [];
  const highestCategory = topCategories[0];
  if (highestCategory && highestCategory[1] > totalSpending * 0.4) {
    anomalies.push({
      id: "high-category",
      title: "High Category Spending",
      description: `${highestCategory[0]} accounts for ${((highestCategory[1] / totalSpending) * 100).toFixed(1)}% of your spending.`,
      severity: "warning",
    });
  }

  if (savingsRate < 0) {
    anomalies.push({
      id: "deficit",
      title: "Spending Exceeds Income",
      description: "Your expenses are higher than income this period. Review budget and reduce spending.",
      severity: "critical",
    });
  }

  const monthlyAvg = monthlyTrend.length > 0 ? monthlyTrend.reduce((sum, [_, amt]) => sum + amt, 0) / monthlyTrend.length : 0;
  const lastMonthSpending = monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1][1] : 0;
  if (lastMonthSpending > monthlyAvg * 1.3) {
    anomalies.push({
      id: "spike",
      title: "Unusual Spending Spike",
      description: `Last month's spending (₹${lastMonthSpending.toFixed(0)}) is 30% higher than average (₹${monthlyAvg.toFixed(0)}).`,
      severity: "warning",
    });
  }

  const maxTrendValue = Math.max(...monthlyTrend.map((m) => m[1] || 0), 1);
  const maxCategoryValue = Math.max(...Object.values(categoryData), 1);

  if (loading) return <LoadingOverlay text="Loading financial insights..." />;

  // Check if insights analytics is enabled
  if (!checkInsightsEnabled()) {
    return (
      <div className="insights-container">
        <div className="insights-header">
          <div>
            <h1 className="dash-title">Financial Insights</h1>
            <p className="dash-sub">Comprehensive analysis of your spending, income, and financial health</p>
          </div>
        </div>
        <div className="disabled-section">
          <div className="disabled-card">
            <div className="disabled-icon">📊</div>
            <h2>Insights & Analytics Disabled</h2>
            <p>You have turned off Insights & Analytics notifications in your settings.</p>
            <p className="disabled-info">To enable and view financial insights, please go to Settings and turn on "Insights & Analytics".</p>
            <button className="enable-btn" onClick={() => window.location.hash = "#/settings"}>
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <div>
          <h1 className="dash-title">Financial Insights</h1>
          <p className="dash-sub">Comprehensive analysis of your spending, income, and financial health</p>
        </div>
        <div className="time-filter">
          <button className={timeRange === "month" ? "active" : ""} onClick={() => setTimeRange("month")}>
            This Month
          </button>
          <button className={timeRange === "quarter" ? "active" : ""} onClick={() => setTimeRange("quarter")}>
            This Quarter
          </button>
          <button className={timeRange === "year" ? "active" : ""} onClick={() => setTimeRange("year")}>
            This Year
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-grid">
        <KPICard
          icon="💰"
          title="Total Spending"
          value={`₹${totalSpending.toFixed(0)}`}
          subtext={`${transactionCount} transactions`}
          trend={12}
        />
        <KPICard
          icon="📈"
          title="Total Income"
          value={`₹${totalIncome.toFixed(0)}`}
          subtext="This period"
          trend={8}
        />
        <KPICard
          icon="💾"
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          subtext={savingsRate >= 20 ? "On track" : "Below target"}
          trend={savingsRate >= 20 ? 5 : -3}
        />
        <KPICard
          icon="✅"
          title="Bills Paid"
          value={`${paidBills}/${totalBills}`}
          subtext={`₹${billsPaid.toFixed(0)}`}
          trend={0}
          pendingCount={pendingBills}
        />
        <KPICard
          icon="🛍️"
          title="Top Category"
          value={highestCategory?.[0] || "N/A"}
          subtext={`₹${(highestCategory?.[1] || 0).toFixed(0)}`}
        />
        <KPICard
          icon="📊"
          title="Avg Daily Spend"
          value={`₹${avgDailySpending.toFixed(0)}`}
          subtext="Based on 30 days"
        />
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="anomalies-section">
          <h3>⚠️ Financial Alerts</h3>
          <div className="anomalies-list">
            {anomalies
              .filter((a) => !dismissedAlerts.includes(a.id))
              .map((anomaly) => (
                <AnomalyAlert
                  key={anomaly.id}
                  title={anomaly.title}
                  description={anomaly.description}
                  severity={anomaly.severity}
                  onDismiss={() => setDismissedAlerts([...dismissedAlerts, anomaly.id])}
                />
              ))}
          </div>
        </div>
      )}

      {/* Spending Overview */}
      <div className="dashboard-grid">
        {/* Spending by Category */}
        <div className="chart-card large">
          <div className="card-header">
            <h3>Spending by Category</h3>
            <span className="card-subtitle">Top spending categories with hover highlighting</span>
          </div>
          {topCategories.length > 0 ? (
            <InteractiveBarChart
              data={topCategories}
              maxValue={maxCategoryValue}
              onHover={setHoveredCategory}
              hoveredItem={hoveredCategory}
            />
          ) : (
            <p className="no-data">No spending data available</p>
          )}
        </div>

        {/* Monthly Trend Chart */}
        <div className="chart-card large">
          <div className="card-header">
            <h3>6-Month Spending Trend</h3>
            <span className="card-subtitle">Track your spending patterns over time</span>
          </div>
          {monthlyTrend.length > 0 ? (
            <div className="trend-chart-container">
              <div className="trend-bars">
                {monthlyTrend.map(([month, amount], i) => {
                  const height = (amount / maxTrendValue) * 150;
                  const isHigh = amount > maxTrendValue * 0.7;

                  return (
                    <div key={i} className="trend-bar-wrapper" title={`${month}: ₹${amount.toFixed(0)}`}>
                      <div className="trend-bar-value" style={{ height: "20px", textAlign: "center" }}>
                        <span style={{ fontSize: "10px" }}>₹{(amount / 1000).toFixed(1)}K</span>
                      </div>
                      <div
                        className={`trend-bar ${isHigh ? "high" : ""}`}
                        style={{
                          height: `${height}px`,
                          backgroundColor: isHigh ? "#ef4444" : "#3b82f6",
                        }}
                      />
                      <div className="trend-label">{month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="no-data">No trend data available</p>
          )}
        </div>
      </div>

      {/* Spending Gauges */}
      <div className="gauges-grid">
        <ProfessionalGauge
          current={totalSpending}
          budget={userGoals.spending_goal}
          label="Monthly Spending"
          color="#3b82f6"
          onEditGoal={() => handleEditGoal("spending_goal", "Monthly Spending Goal")}
        />
        <ProfessionalGauge
          current={billsPaid}
          budget={totalBillsAmount}
          label="Bills Payment Progress"
          color="#10b981"
        />
        <ProfessionalGauge
          current={savingsRate}
          budget={userGoals.savings_goal}
          label="Savings Rate Goal"
          color="#f59e0b"
          formatType="percentage"
          onEditGoal={() => handleEditGoal("savings_goal", "Savings Rate Goal")}
        />
      </div>

      {/* Top Merchants */}
      <div className="merchant-section">
        <h3>Top Merchants</h3>
        <span className="section-subtitle">Your most frequent spending places</span>
        {topMerchants.length > 0 ? (
          <div className="merchant-grid">
            {topMerchants.map(([merchant, amount], i) => (
              <div key={i} className="merchant-card">
                <div className="merchant-rank">{i + 1}</div>
                <div className="merchant-details">
                  <h4>{merchant}</h4>
                  <div className="merchant-amount">₹{amount.toFixed(0)}</div>
                  <div className="merchant-percentage">
                    {((amount / totalSpending) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No merchant data available</p>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="summary-section">
        <h3>Financial Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Transactions</span>
            <span className="summary-value">{transactionCount}</span>
            <span className="summary-subtext">Debit transactions</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Avg Transaction</span>
            <span className="summary-value">₹{transactionCount > 0 ? (totalSpending / transactionCount).toFixed(0) : "0"}</span>
            <span className="summary-subtext">Per transaction</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Highest Day</span>
            <span className="summary-value">₹{(maxTrendValue / 30).toFixed(0)}</span>
            <span className="summary-subtext">Estimated daily peak</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Bill Status</span>
            <span className="summary-value">
              {totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0}%
            </span>
            <span className="summary-subtext">Bills completed</span>
          </div>
        </div>
      </div>

      {/* Category Distribution Table */}
      <div className="table-section">
        <h3>Category Breakdown</h3>
        <table className="insights-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>% of Total</th>
              <th>Avg Transaction</th>
            </tr>
          </thead>
          <tbody>
            {topCategories.map(([category, amount], i) => (
              <tr key={i} className={hoveredCategory === category ? "highlighted" : ""}>
                <td className="category-cell">
                  <span className="category-indicator" style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"][i] }}></span>
                  {category}
                </td>
                <td className="amount">₹{amount.toFixed(0)}</td>
                <td className="percentage">{((amount / totalSpending) * 100).toFixed(1)}%</td>
                <td className="avg">₹{(amount / (transactionCount / topCategories.length || 1)).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Goals Edit Modal */}
      {editingGoal && (
        <GoalsEditModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingGoal(null);
          }}
          goalData={userGoals[editingGoal.name]}
          goalLabel={editingGoal.label}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}
