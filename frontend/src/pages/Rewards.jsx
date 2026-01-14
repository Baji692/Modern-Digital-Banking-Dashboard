import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Rewards() {
  const [transactions, setTransactions] = useState([]);
  const [rewardBreakdown, setRewardBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "redemptionHistory", "rules"

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txnData, billsData, accountsData] = await Promise.all([
          apiFetch("get", "/transactions/"),
          apiFetch("get", "/bills/"),
          apiFetch("get", "/accounts/"),
        ]);
        setTransactions(txnData || []);
        setBills(billsData || []);
        setAccounts(accountsData || []);
        calculateRewards(txnData || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateRewards = (txns) => {
    const breakdown = {
      shopping: 0,
      dining: 0,
      utilities: 0,
      groceries: 0,
      other: 0,
    };

    txns.forEach((t) => {
      if (t.txn_type === "debit") {
        const amount = Number(t.amount);
        const category = (t.category || "").toLowerCase();

        if (category.includes("shopping") || category.includes("retail")) {
          breakdown.shopping += Math.floor(amount * 0.02); // 2% for shopping
        } else if (category.includes("dining") || category.includes("food")) {
          breakdown.dining += Math.floor(amount * 0.03); // 3% for dining
        } else if (category.includes("utilities")) {
          breakdown.utilities += Math.floor(amount * 0.01); // 1% for utilities
        } else if (category.includes("groceries")) {
          breakdown.groceries += Math.floor(amount * 0.015); // 1.5% for groceries
        } else {
          breakdown.other += Math.floor(amount * 0.01); // 1% for others
        }
      }
    });

    setRewardBreakdown(breakdown);
  };

  const totalRewardPoints = Object.values(rewardBreakdown).reduce(
    (a, b) => a + b,
    0
  );
  const rewardValue = Math.round(totalRewardPoints / 100); // 1 point = ₹1

  const rewardTiers = [
    {
      name: "Silver",
      minPoints: 0,
      maxPoints: 5000,
      benefits: "1% cashback on all purchases",
      status: totalRewardPoints < 5000 ? "Current" : "Achieved",
    },
    {
      name: "Gold",
      minPoints: 5000,
      maxPoints: 15000,
      benefits: "2% cashback on all purchases, Priority support",
      status:
        totalRewardPoints >= 5000 && totalRewardPoints < 15000
          ? "Current"
          : totalRewardPoints >= 15000
            ? "Achieved"
            : "Locked",
    },
    {
      name: "Platinum",
      minPoints: 15000,
      maxPoints: 50000,
      benefits: "3% cashback, Premium concierge, Exclusive offers",
      status:
        totalRewardPoints >= 15000 && totalRewardPoints < 50000
          ? "Current"
          : totalRewardPoints >= 50000
            ? "Achieved"
            : "Locked",
    },
    {
      name: "Diamond",
      minPoints: 50000,
      maxPoints: Infinity,
      benefits: "5% cashback, VIP treatment, Personalized offers",
      status: totalRewardPoints >= 50000 ? "Current" : "Locked",
    },
  ];

  const upcomingBills = bills.filter(b => b.status === "upcoming" || b.status === "overdue");
  const totalBillsAmount = upcomingBills.reduce((sum, b) => sum + Number(b.amount_due), 0);
  const totalAccountBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  // Mock redemption history data
  const redemptionHistory = [
    { id: 1, type: "Cashback", amount: 500, date: "2025-12-15", status: "Completed", pointsUsed: 50000 },
    { id: 2, type: "Gift Card", amount: 1000, date: "2025-12-10", status: "Completed", pointsUsed: 100000, partner: "Amazon" },
    { id: 3, type: "Travel", amount: 2500, date: "2025-11-28", status: "Completed", pointsUsed: 250000, partner: "GoIbibo" },
    { id: 4, type: "Donation", amount: 1000, date: "2025-11-20", status: "Completed", pointsUsed: 100000, partner: "GiveIndia" },
  ];

  // Points expiration simulation
  const pointsExpiringIn = Math.max(0, 5000 - totalRewardPoints); // Points expiring in 6 months if not used
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 6);

  if (loading) return <p style={{ color: "#ffffff" }}>Loading rewards...</p>;

  return (
    <>
      <div className="rewards-header">
        <div>
          <h2 className="dash-title">Rewards & Benefits</h2>
          <p className="dash-sub">Earn points on every transaction and unlock exclusive benefits</p>
        </div>
        <div className="rewards-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "redemptionHistory" ? "active" : ""}`}
            onClick={() => setActiveTab("redemptionHistory")}
          >
            History
          </button>
          <button
            className={`tab-btn ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            Terms & Rules
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Hero Summary Cards - 4 Column */}
          <div className="rewards-summary-grid">
            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Total Rewards</span>
                <span className="reward-hero-icon">⭐</span>
              </div>
              <div className="reward-hero-value">{totalRewardPoints.toLocaleString()}</div>
              <div className="reward-hero-sub">≈ ₹{rewardValue.toLocaleString()} cash value</div>
              <div className="reward-hero-meter">
                <div className="meter-fill" style={{ width: Math.min((totalRewardPoints / 5000) * 100, 100) + '%' }}></div>
              </div>
            </div>

            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Current Tier</span>
                <span className="reward-hero-icon">🏆</span>
              </div>
              <div className="reward-hero-value" style={{ fontSize: '28px' }}>
                {rewardTiers.find((t) => t.status === "Current")?.name || "Silver"}
              </div>
              <div className="reward-hero-sub">
                {rewardTiers.find((t) => t.status === "Current")?.benefits.split(',')[0]}
              </div>
              <div className="reward-hero-progress">
                Next tier in {(5000 - (totalRewardPoints % 5000)).toLocaleString()} pts
              </div>
            </div>

            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">This Month</span>
                <span className="reward-hero-icon">📈</span>
              </div>
              <div className="reward-hero-value">
                {Object.values(rewardBreakdown).reduce((a, b) => a + b, 0)}
              </div>
              <div className="reward-hero-sub">Based on {transactions.filter(t => t.txn_type === "debit").length} transactions</div>
              <div className="reward-hero-bottom">Avg: {transactions.length > 0 ? Math.round(Object.values(rewardBreakdown).reduce((a, b) => a + b, 0) / transactions.filter(t => t.txn_type === "debit").length * 10) / 10 : 0} pts per transaction</div>
            </div>

            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Redemption</span>
                <span className="reward-hero-icon">🎁</span>
              </div>
              <div className="reward-hero-value">5+</div>
              <div className="reward-hero-sub">Options available</div>
              <div className="reward-hero-bottom">Cashback, Cards, Travel & more</div>
            </div>
          </div>

          {/* Points Expiration Warning */}
          {pointsExpiringIn < 1000 && (
            <div className="points-expiration-banner">
              <span className="expiry-icon">⏰</span>
              <div className="expiry-content">
                <strong>Points Expiring Soon!</strong>
                <p>You have {pointsExpiringIn.toLocaleString()} points expiring on {expirationDate.toLocaleDateString()}. Use them now!</p>
              </div>
              <button className="expiry-action">Redeem Now</button>
            </div>
          )}

          {/* Stats Row - Quick Info */}
          <div className="rewards-stats-row">
            <div className="stat-item">
              <div className="stat-icon">💳</div>
              <div className="stat-content">
                <span className="stat-label">Total Accounts</span>
                <span className="stat-value">{accounts.length}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-label">Account Balance</span>
                <span className="stat-value">₹{totalAccountBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <span className="stat-label">Upcoming Bills</span>
                <span className="stat-value">₹{totalBillsAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-label">Transactions</span>
                <span className="stat-value">{transactions.filter(t => t.txn_type === "debit").length}</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="rewards-content-grid">
            {/* Left Column */}
            <div>
              {/* Reward Breakdown by Category */}
              <div className="reward-section">
                <div className="section-header">
                  <h3 style={{ color: "#ffffff", margin: 0 }}>Earning Breakdown</h3>
                  <span className="section-tag">by category</span>
                </div>
                <div className="reward-categories-grid">
                  {[
                    { key: "shopping", label: "Shopping", icon: "🛍️", color: "#3b82f6" },
                    { key: "dining", label: "Dining", icon: "🍽️", color: "#ef4444" },
                    { key: "groceries", label: "Groceries", icon: "🛒", color: "#10b981" },
                    { key: "utilities", label: "Utilities", icon: "⚡", color: "#f59e0b" },
                    { key: "other", label: "Other", icon: "📌", color: "#8b5cf6" },
                  ].map((cat) => (
                    <div key={cat.key} className="glass-card reward-category-card">
                      <div className="category-icon" style={{ borderColor: cat.color }}>
                        {cat.icon}
                      </div>
                      <div className="category-name">{cat.label}</div>
                      <div className="category-points">{rewardBreakdown[cat.key]}</div>
                      <div className="category-percent">
                        {(
                          (rewardBreakdown[cat.key] / (totalRewardPoints || 1)) *
                          100
                        ).toFixed(0)}%
                      </div>
                      <div className="category-bar">
                        <div
                          className="category-bar-fill"
                          style={{
                            width: ((rewardBreakdown[cat.key] / (totalRewardPoints || 1)) * 100) + '%',
                            background: cat.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Membership Tiers */}
              <div className="reward-section">
                <div className="section-header">
                  <h3 style={{ color: "#ffffff", margin: 0 }}>Membership Tiers</h3>
                  <span className="section-tag">unlock more benefits</span>
                </div>
                <div className="tiers-container-pro">
                  {rewardTiers.map((tier, i) => {
                    const isLocked = tier.status === "Locked";
                    const isCurrent = tier.status === "Current";
                    const tierColors = ["#ffffff", "#10b981", "#f59e0b", "#ef4444"];

                    return (
                      <div
                        key={i}
                        className={`tier-card-pro ${isCurrent ? "active" : ""} ${isLocked ? "locked" : ""
                          }`}
                      >
                        <div className="tier-color-bar" style={{ background: tierColors[i] }}></div>
                        <div className="tier-header-pro">
                          <h4 style={{ margin: 0 }}>{tier.name}</h4>
                          <span className={`tier-badge-pro status-${tier.status.toLowerCase()}`}>
                            {tier.status}
                          </span>
                        </div>

                        <div className="tier-points-pro">
                          {tier.minPoints.toLocaleString()}+
                          {tier.maxPoints !== Infinity
                            ? ` - ${tier.maxPoints.toLocaleString()}`
                            : ""}
                        </div>

                        <div className="tier-benefits-pro">{tier.benefits}</div>

                        {isCurrent && (
                          <div className="tier-progress-pro">
                            <div className="progress-label">
                              {totalRewardPoints} / {tier.maxPoints} points
                            </div>
                            <div className="progress-bar-pro">
                              <div
                                className="progress-fill-pro"
                                style={{
                                  width: `${((totalRewardPoints - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Redemption Options */}
              <div className="reward-section">
                <div className="section-header">
                  <h3 style={{ color: "#ffffff", margin: 0 }}>Redeem Points</h3>
                  <span className="section-tag">flexible options</span>
                </div>
                <div className="redemption-grid-pro">
                  {[
                    {
                      name: "Cashback",
                      value: "1 point = ₹1",
                      minPoints: 100,
                      icon: "💰",
                      color: "#10b981"
                    },
                    {
                      name: "Gift Cards",
                      value: "Amazon, Flipkart, etc.",
                      minPoints: 500,
                      icon: "🎁",
                      color: "#f59e0b"
                    },
                    {
                      name: "Travel",
                      value: "Flight bookings, Hotels",
                      minPoints: 1000,
                      icon: "✈️",
                      color: "#3b82f6"
                    },
                    {
                      name: "Shopping",
                      value: "Partner brand vouchers",
                      minPoints: 300,
                      icon: "🛍️",
                      color: "#ef4444"
                    },
                  ].map((option, i) => {
                    const canRedeem = totalRewardPoints >= option.minPoints;
                    return (
                      <div key={i} className={`glass-card redemption-card-pro ${!canRedeem ? 'locked' : ''}`}>
                        <div className="redemption-header">
                          <span className="redemption-icon-pro">{option.icon}</span>
                          {canRedeem && <span className="redemption-badge">Available</span>}
                        </div>
                        <strong className="redemption-name">{option.name}</strong>
                        <p className="redemption-value">{option.value}</p>
                        <div className="redemption-requirement">
                          Min: {option.minPoints} pts
                        </div>
                        <button
                          className={`redeem-btn-pro ${canRedeem ? 'active' : ''}`}
                          disabled={!canRedeem}
                        >
                          {canRedeem ? `Redeem Now` : `Locked`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Transactions Contributing to Rewards */}
              <div className="reward-section">
                <div className="section-header">
                  <h3 style={{ color: "#ffffff", margin: 0 }}>Recent Earnings</h3>
                  <span className="section-tag">last 5 transactions</span>
                </div>
                <div className="recent-earnings-list">
                  {transactions
                    .filter(t => t.txn_type === "debit")
                    .slice(0, 5)
                    .map((t, idx) => {
                      const amount = Number(t.amount);
                      const category = (t.category || "").toLowerCase();
                      let rate = 0.01;
                      let points = 0;

                      if (category.includes("shopping") || category.includes("retail")) {
                        rate = 0.02;
                      } else if (category.includes("dining") || category.includes("food")) {
                        rate = 0.03;
                      } else if (category.includes("utilities")) {
                        rate = 0.01;
                      } else if (category.includes("groceries")) {
                        rate = 0.015;
                      }

                      points = Math.floor(amount * rate);

                      return (
                        <div key={idx} className="earning-item">
                          <div className="earning-info">
                            <div className="earning-merchant">{t.merchant_name || t.description}</div>
                            <div className="earning-category">{t.category || "Other"}</div>
                          </div>
                          <div className="earning-amount">
                            ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                          <div className="earning-points">{points} pts</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          <div className="referral-section">
            <div className="glass-card referral-card">
              <div className="referral-header">
                <div>
                  <h3 style={{ margin: 0, color: "#ffffff" }}>Invite Friends & Earn Bonus</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", margin: "6px 0 0" }}>Share your unique code and get 500 bonus points for each sign-up</p>
                </div>
                <span className="referral-icon">👥</span>
              </div>
              <div className="referral-content">
                <div className="referral-code-box">
                  <label>Your Referral Code</label>
                  <div className="referral-code-display">
                    <code>BANK2025{Math.random().toString(36).substr(2, 5).toUpperCase()}</code>
                    <button className="copy-btn">Copy</button>
                  </div>
                </div>
                <div className="referral-stats">
                  <div className="referral-stat">
                    <span className="referral-stat-label">Friends Referred</span>
                    <span className="referral-stat-value">3</span>
                  </div>
                  <div className="referral-stat">
                    <span className="referral-stat-label">Bonus Points Earned</span>
                    <span className="referral-stat-value">1,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - How to Earn More */}
          <div className="reward-section" style={{ marginTop: '28px' }}>
            <div className="section-header">
              <h3 style={{ color: "#ffffff", margin: 0 }}>How to Earn More</h3>
              <span className="section-tag">maximize rewards</span>
            </div>
            <div className="how-to-earn-grid">
              <div className="glass-card how-to-card">
                <div className="how-icon">💳</div>
                <h4>Use Your Card More</h4>
                <p>Every purchase earns points. Debit card usage = double points</p>
                <div className="how-tag">+2x Points</div>
              </div>
              <div className="glass-card how-to-card">
                <div className="how-icon">🍽️</div>
                <h4>Dine & Shop Smart</h4>
                <p>Dining earns 3% points, Shopping earns 2% - Highest rates!</p>
                <div className="how-tag">+3% Points</div>
              </div>
              <div className="glass-card how-to-card">
                <div className="how-icon">⬆️</div>
                <h4>Upgrade Your Tier</h4>
                <p>Higher tiers unlock better cashback rates and exclusive perks</p>
                <div className="how-tag">5% Max</div>
              </div>
              <div className="glass-card how-to-card">
                <div className="how-icon">👥</div>
                <h4>Refer Friends</h4>
                <p>Invite friends and earn bonus points for each sign-up</p>
                <div className="how-tag">+500 Bonus</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "redemptionHistory" && (
        <div className="reward-section">
          <div className="section-header">
            <h3 style={{ color: "#ffffff", margin: 0 }}>Redemption History</h3>
            <span className="section-tag">your recent activity</span>
          </div>
          <div className="redemption-history-list">
            {redemptionHistory.map((item) => (
              <div key={item.id} className="redemption-history-item">
                <div className="history-header">
                  <div className="history-type">{item.type}{item.partner && ` - ${item.partner}`}</div>
                  <div className="history-status completed">{item.status}</div>
                </div>
                <div className="history-details">
                  <div className="history-info">
                    <span className="history-label">Redeemed on</span>
                    <span className="history-value">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="history-info">
                    <span className="history-label">Points Used</span>
                    <span className="history-value">{item.pointsUsed.toLocaleString()}</span>
                  </div>
                  <div className="history-info">
                    <span className="history-label">Value</span>
                    <span className="history-value">₹{item.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "rules" && (
        <div className="reward-section">
          <div className="section-header">
            <h3 style={{ color: "#ffffff", margin: 0 }}>Terms & Rules</h3>
            <span className="section-tag">program details</span>
          </div>
          <div className="rules-container">
            <div className="glass-card rule-card">
              <h4>Point Earning Rules</h4>
              <ul>
                <li><strong>Shopping:</strong> 2 points per ₹100 spent</li>
                <li><strong>Dining:</strong> 3 points per ₹100 spent</li>
                <li><strong>Groceries:</strong> 1.5 points per ₹100 spent</li>
                <li><strong>Utilities:</strong> 1 point per ₹100 spent</li>
                <li><strong>Others:</strong> 1 point per ₹100 spent</li>
              </ul>
            </div>
            <div className="glass-card rule-card">
              <h4>Point Expiration & Validity</h4>
              <ul>
                <li>Points are valid for <strong>12 months</strong> from the date of earning</li>
                <li>Unused points expire automatically after 12 months</li>
                <li>Redeemed points cannot be reversed</li>
                <li>Bonus points have specific validity periods (mentioned at time of issue)</li>
              </ul>
            </div>
            <div className="glass-card rule-card">
              <h4>Redemption Terms</h4>
              <ul>
                <li>Minimum 100 points required for any redemption</li>
                <li>1 point = ₹1 when redeemed as cashback</li>
                <li>Different conversion rates apply for gift cards and travel</li>
                <li>Redemptions are processed within 48 hours</li>
              </ul>
            </div>
            <div className="glass-card rule-card">
              <h4>Tier Benefits & Conversion</h4>
              <ul>
                <li><strong>Silver (0-5000 pts):</strong> 1% cashback on all purchases</li>
                <li><strong>Gold (5000-15000 pts):</strong> 2% cashback + Priority support</li>
                <li><strong>Platinum (15000-50000 pts):</strong> 3% cashback + Exclusive offers</li>
                <li><strong>Diamond (50000+ pts):</strong> 5% cashback + VIP concierge</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
