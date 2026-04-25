import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Rewards() {
  const [transactions, setTransactions] = useState([]);
  const [rewardBreakdown, setRewardBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [userId, setUserId] = useState(null);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [referralStats, setReferralStats] = useState({ friends_referred: 0, bonus_points_earned: 0, referral_code: "" });
  const [totalRewardPoints, setTotalRewardPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [rewardValue, setRewardValue] = useState(0);
  const [redeeming, setRedeeming] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState({ type: null, points: 0 });
  const [referralEmail, setReferralEmail] = useState("");
  const [referrals, setReferrals] = useState([]);

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

  // Load main rewards data
  useEffect(() => {
    if (!userId) {
      console.log("No userId yet");
      return;
    }

    const loadData = async () => {
      try {
        console.log("Loading rewards data for user:", userId);

        // Load each endpoint with better error handling
        let txnData, billsData, accountsData, rewardsSummary, history, stats;

        try {
          txnData = await apiFetch("get", `/transactions/`);
          console.log("✓ Transactions loaded:", txnData);
        } catch (e) {
          console.error("✗ Error loading transactions:", e);
          txnData = [];
        }

        try {
          billsData = await apiFetch("get", `/bills/`);
          console.log("✓ Bills loaded:", billsData);
        } catch (e) {
          console.error("✗ Error loading bills:", e);
          billsData = [];
        }

        try {
          accountsData = await apiFetch("get", `/accounts/`);
          console.log("✓ Accounts loaded:", accountsData);
        } catch (e) {
          console.error("✗ Error loading accounts:", e);
          accountsData = [];
        }

        try {
          rewardsSummary = await apiFetch("get", `/rewards/summary/${userId}`);
          console.log("✓ Rewards summary loaded:", rewardsSummary);
        } catch (e) {
          console.error("✗ Error loading rewards summary:", e);
          rewardsSummary = null;
        }

        try {
          history = await apiFetch("get", `/rewards/redemption-history`);
          console.log("✓ Redemption history loaded:", history);
        } catch (e) {
          console.error("✗ Error loading redemption history:", e);
          toast.warning(`⚠ Could not load redemption history: ${e.message}`);
          history = [];
        }

        try {
          stats = await apiFetch("get", `/rewards/referral/stats`);
          console.log("✓ Referral stats loaded:", stats);
        } catch (e) {
          console.error("✗ Error loading referral stats:", e);
          stats = null;
        }

        try {
          const listRes = await apiFetch("get", `/rewards/referral/list`);
          console.log("✓ Referral list loaded:", listRes);
          if (listRes && Array.isArray(listRes.referrals)) {
            setReferrals(listRes.referrals);
          }
        } catch (e) {
          console.error("✗ Error loading referral list:", e);
        }

        console.log("=== FINAL DATA ===");
        console.log("Transactions:", txnData);
        console.log("Rewards Summary:", rewardsSummary);
        console.log("History:", history);
        console.log("Stats:", stats);

        setTransactions(txnData || []);
        setBills(billsData || []);
        setAccounts(accountsData || []);

        // Use rewards data from backend
        if (rewardsSummary && rewardsSummary.breakdown) {
          console.log("✓ Setting reward breakdown:", rewardsSummary.breakdown);
          setRewardBreakdown(rewardsSummary.breakdown);
          // Prefer available_points if backend provides it
          setAvailablePoints(rewardsSummary.available_points ?? 0);
          setTotalRewardPoints(rewardsSummary.total_points || 0);
          setRewardValue(rewardsSummary.reward_value_inr || 0);
          setMonthlyPoints(rewardsSummary.monthly_points || 0);
          setPendingRedemptions(rewardsSummary.pending_redemptions || []);
        } else {
          console.warn("⚠ No rewards summary or breakdown:", rewardsSummary);
        }

        // Load redemption history
        if (Array.isArray(history)) {
          setRedemptionHistory(history);
        }

        // Load referral stats
        if (stats) {
          setReferralStats(stats);
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
        toast.error(`Error loading rewards: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh data when page becomes visible (tab switched back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page is now visible - refreshing rewards data");
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also set up periodic refresh every 30 seconds to catch updates
    const refreshInterval = setInterval(() => {
      console.log("Periodic refresh of rewards data");
      loadData();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [userId]);

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

  // Points expiration simulation
  const pointsExpiringIn = Math.max(0, 5000 - totalRewardPoints); // Points expiring in 6 months if not used
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 6);

  // Handle redeem points
  const handleRedeem = async (redeemType, minPoints) => {
    // Use availablePoints for redemption eligibility when present
    const have = availablePoints;
    if (have < minPoints) {
      toast.warning(`You need ${minPoints} points to redeem this. You have ${have} available points.`);
      return;
    }

    // Open in-screen confirmation modal instead of browser confirm
    setRedeemTarget({ type: redeemType, points: minPoints });
    setShowRedeemModal(true);
    return;
  };

  // Confirm redemption from modal
  const confirmRedeem = async () => {
    const { type, points } = redeemTarget;
    setShowRedeemModal(false);
    setRedeeming(true);
    try {
      const result = await apiFetch("post", "/rewards/redeem", {
        redemption_type: type,
        points_to_use: points,
        partner: null,
      });

      if (result) {
        if (type === "Cashback") {
          toast.success(`✓ Cashback of ₹${(points * 0.01).toFixed(2)} instantly credited to your account!`);
        } else {
          toast.success(`Successfully redeemed ${points} points! Check your history for details.`);
        }
        // Reload history
        const history = await apiFetch("get", "/rewards/redemption-history");
        if (Array.isArray(history)) {
          setRedemptionHistory(history);
        }
        // Reload points
        const rewardsSummary = await apiFetch("get", `/rewards/summary/${userId}`);
        if (rewardsSummary && rewardsSummary.breakdown) {
          setRewardBreakdown(rewardsSummary.breakdown);
          setAvailablePoints(rewardsSummary.available_points ?? 0);
          setTotalRewardPoints(rewardsSummary.total_points || 0);
          setPendingRedemptions(rewardsSummary.pending_redemptions || []);
        }
        // Reload accounts to show updated balance
        const accountsData = await apiFetch("get", `/accounts/`);
        if (Array.isArray(accountsData)) {
          setAccounts(accountsData);
        }
        // Reload transactions to show HD Cashback transaction
        const txnData = await apiFetch("get", `/transactions/`);
        if (Array.isArray(txnData)) {
          setTransactions(txnData);
        }
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setRedeeming(false);
    }
  };

  // Handle referral
  const handleReferral = async () => {
    if (!referralEmail.trim()) {
      toast.warning("Please enter an email address");
      return;
    }

    try {
      const result = await apiFetch("post", "/rewards/referral/create", {
        referred_email: referralEmail
      });

      if (result) {
        toast.success(`Referral sent! They will receive a bonus when they sign up.`);
        setReferralEmail("");
        // Reload stats
        const stats = await apiFetch("get", "/rewards/referral/stats");
        if (stats) {
          setReferralStats(stats);
        }
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Copy referral code
  const copyReferralCode = () => {
    if (referralStats.referral_code) {
      navigator.clipboard.writeText(referralStats.referral_code);
      toast.success("Referral code copied to clipboard!");
    }
  };

  if (loading) return <LoadingOverlay text="Loading rewards..." />;

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
                <span className="reward-hero-label">Available Reward Points</span>
                <span className="reward-hero-icon">⭐</span>
              </div>
              <div className="reward-hero-value">{availablePoints.toLocaleString()}</div>
              <div className="reward-hero-sub">Total: {totalRewardPoints.toLocaleString()} pts • ≈ ₹{rewardValue.toLocaleString()} cash value</div>
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
              <div className="reward-hero-value">{(monthlyPoints || 0).toLocaleString()}</div>
              <div className="reward-hero-sub">Based on {transactions.filter(t => t.txn_type === "debit").length} transactions</div>
              <div className="reward-hero-bottom">Avg: {transactions.length > 0 ? Math.round((monthlyPoints || 0) / transactions.filter(t => t.txn_type === "debit").length * 10) / 10 : 0} pts per transaction</div>
            </div>

          </div>

          {/* Rewards Summary Section */}
          <div className="rewards-summary-grid" style={{ marginTop: '20px' }}>
            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Available</span>
                <span className="reward-hero-icon">✓</span>
              </div>
              <div className="reward-hero-value" style={{ color: '#10b981' }}>
                {availablePoints.toLocaleString()}
              </div>
              <div className="reward-hero-sub">Points to redeem now</div>
            </div>
            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Lifetime Earned</span>
                <span className="reward-hero-icon">⭐</span>
              </div>
              <div className="reward-hero-value" style={{ color: '#f59e0b' }}>
                {totalRewardPoints.toLocaleString()}
              </div>
              <div className="reward-hero-sub">Total points earned</div>
            </div>
            <div className="glass-card reward-hero-card">
              <div className="reward-hero-header">
                <span className="reward-hero-label">Redeemed</span>
                <span className="reward-hero-icon">💳</span>
              </div>
              <div className="reward-hero-value" style={{ color: '#3b82f6' }}>
                {redemptionHistory.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (parseInt(r.pointsUsed) || 0), 0).toLocaleString()}
              </div>
              <div className="reward-hero-sub">Points converted</div>
            </div>
          </div>

          {/* Redemption History & Completed Redemptions - Side by Side */}
          {(() => {
            const completedRedemptions = redemptionHistory.filter(r => r.status === 'Completed');
            const hasPending = pendingRedemptions && pendingRedemptions.length > 0;
            const hasCompleted = completedRedemptions.length > 0;

            if (hasPending || hasCompleted) {
              return (
                <div className="rewards-summary-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {/* Redemption History - Pending Card */}
                  {hasPending && (
                    <div className="glass-card reward-hero-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                      <div className="reward-hero-header">
                        <span className="reward-hero-label">Redemption History</span>
                        <span className="reward-hero-icon">⏳</span>
                      </div>
                      <div className="reward-hero-value" style={{ color: '#f59e0b' }}>
                        {pendingRedemptions.reduce((sum, r) => sum + (parseInt(r.points) || 0), 0).toLocaleString()}
                      </div>
                      <div className="reward-hero-sub">Points pending ({pendingRedemptions.length} request{pendingRedemptions.length > 1 ? 's' : ''})</div>
                      <div className="reward-hero-bottom" style={{ fontSize: '12px', marginTop: '8px' }}>
                        {pendingRedemptions.map((r, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', color: 'rgba(255,255,255,0.8)' }}>
                            {r.points} pts • {r.type} • <span style={{ color: '#f59e0b' }}>Pending</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Redemptions Card */}
                  {hasCompleted && (
                    <div className="glass-card reward-hero-card" style={{ borderLeft: '4px solid #10b981' }}>
                      <div className="reward-hero-header">
                        <span className="reward-hero-label">Completed Redemptions</span>
                        <span className="reward-hero-icon">✅</span>
                      </div>
                      <div className="reward-hero-value" style={{ color: '#10b981' }}>
                        {completedRedemptions.reduce((sum, r) => sum + (parseInt(r.pointsUsed) || 0), 0).toLocaleString()}
                      </div>
                      <div className="reward-hero-sub">Points redeemed ({completedRedemptions.length} redemption{completedRedemptions.length > 1 ? 's' : ''})</div>
                      <div className="reward-hero-bottom" style={{ fontSize: '12px', marginTop: '8px' }}>
                        {completedRedemptions.slice(0, 3).map((r, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', color: 'rgba(255,255,255,0.8)' }}>
                            {r.pointsUsed} pts • {r.type} • <span style={{ color: '#10b981' }}>✓</span>
                          </div>
                        ))}
                        {completedRedemptions.length > 3 && (
                          <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                            +{completedRedemptions.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Redeem confirmation modal */}
          {showRedeemModal && (
            <Modal title="Confirm Redemption" onClose={() => setShowRedeemModal(false)}>
              <p>Redeem {redeemTarget.points} points for {redeemTarget.type}?</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="redeem-btn-pro active" onClick={confirmRedeem} disabled={redeeming}>{redeeming ? 'Processing...' : 'OK'}</button>
                <button className="redeem-btn-pro" onClick={() => setShowRedeemModal(false)} disabled={redeeming}>Cancel</button>
              </div>
            </Modal>
          )}

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

          {/* Earning Breakdown Section */}
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
                { key: "referral", label: "Referrals", icon: "🤝", color: "#ec4899" },
                { key: "manual", label: "Bonuses", icon: "🎁", color: "#8b5cf6" },
                { key: "other", label: "Other", icon: "📌", color: "#64748b" },
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

          {/* Two Column Layout - Membership Tiers & Recent Earnings */}
          <div className="rewards-content-grid">
            {/* Left Column - Membership Tiers */}
            <div>
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
                            {i < rewardTiers.length - 1 && (
                              <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '8px' }}>
                                Next Tier: {rewardTiers[i + 1].name} – {(rewardTiers[i + 1].minPoints - totalRewardPoints).toLocaleString()} points to go
                              </div>
                            )}
                          </div>
                        )}
                        {isLocked && i > 0 && (
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', padding: '6px 0' }}>
                            Unlocks at {tier.name} ({tier.minPoints.toLocaleString()} points)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Recent Earnings */}
            <div>
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

          {/* Redemption Options Section */}
          <div className="reward-section">
            <div className="section-header">
              <h3 style={{ color: "#ffffff", margin: 0 }}>Redeem Points</h3>
              <span className="section-tag">flexible options</span>
            </div>
            <div className="redemption-grid-pro">
              {[
                {
                  name: "Cashback (Instant Credit)",
                  type: "Cashback",
                  value: "100 points = ₹1",
                  helper: "Instantly credited to your primary account",
                  minPoints: 100,
                  icon: "💰",
                  color: "#10b981",
                  tier: null
                },
                {
                  name: "Gift Cards",
                  type: "Gift Cards",
                  value: "Amazon, Flipkart, Myntra & more",
                  helper: "Instant digital delivery",
                  minPoints: 500,
                  icon: "🎁",
                  color: "#f59e0b",
                  tier: "Gold"
                },
                {
                  name: "Travel Rewards",
                  type: "Travel",
                  value: "Flights, Hotels & more",
                  helper: "Book with your preferred partner",
                  minPoints: 1000,
                  icon: "✈️",
                  color: "#3b82f6",
                  tier: "Platinum"
                },
                {
                  name: "Shopping",
                  type: "Shopping",
                  value: "Partner brand vouchers",
                  helper: "Use at select retailers",
                  minPoints: 300,
                  icon: "🛍️",
                  color: "#ef4444",
                  tier: "Gold"
                },
              ].map((option, i) => {
                const have = availablePoints;
                const canRedeem = have >= option.minPoints;
                const unlocksTier = option.tier ? rewardTiers.find(t => t.name === option.tier) : null;
                const tierUnlockPoints = unlocksTier ? unlocksTier.minPoints : null;

                return (
                  <div key={i} className={`glass-card redemption-card-pro ${!canRedeem ? 'locked' : ''}`}>
                    <div className="redemption-header">
                      <span className="redemption-icon-pro">{option.icon}</span>
                      {canRedeem && <span className="redemption-badge">Available</span>}
                      {!canRedeem && option.tier && <span className="redemption-badge" style={{ background: '#6b7280' }}>Tier Lock</span>}
                    </div>
                    <strong className="redemption-name">{option.name}</strong>
                    <p className="redemption-value">{option.value}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 6px 0' }}>{option.helper}</p>
                    <div className="redemption-requirement">
                      Min: {option.minPoints} pts
                    </div>
                    {!canRedeem && option.tier && (
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '6px', padding: '6px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px' }}>
                        🔒 Unlocks at {option.tier} ({tierUnlockPoints?.toLocaleString()} points)
                      </div>
                    )}
                    <button
                      className={`redeem-btn-pro ${canRedeem ? 'active' : ''}`}
                      disabled={!canRedeem || redeeming}
                      onClick={() => handleRedeem(option.type, option.minPoints)}
                    >
                      {redeeming ? `Processing...` : canRedeem ? `Redeem Now` : `Locked`}
                    </button>
                  </div>
                );
              })}
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
                    <code>{referralStats?.referral_code || "Loading..."}</code>
                    <button className="copy-btn" onClick={copyReferralCode} disabled={!referralStats?.referral_code}>Copy</button>
                  </div>
                </div>
                <div className="referral-stats">
                  <div className="referral-stat">
                    <span className="referral-stat-label">Friends Referred</span>
                    <span className="referral-stat-value">{referralStats?.friends_referred || 0}</span>
                  </div>
                  <div className="referral-stat">
                    <span className="referral-stat-label">Bonus Points Earned</span>
                    <span className="referral-stat-value">{(referralStats?.bonus_points_earned || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="email"
                      placeholder="Friend's email address"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #333", background: "#1a1f2e", color: "#fff" }}
                    />
                    <button
                      onClick={handleReferral}
                      disabled={!referralEmail.trim() || redeeming}
                      style={{ padding: "10px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
                {/* Referred friends list */}
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ margin: '8px 0 6px', color: '#fff' }}>Referred Friends</h4>
                  {referrals.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>No referrals yet.</div>
                  ) : (
                    <div className="referral-list">
                      {referrals.map((f) => (
                        <div key={f.id} className="referral-list-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ color: '#fff' }}>{f.referred_name || f.referred_email}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)' }}>{f.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
